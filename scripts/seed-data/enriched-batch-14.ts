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
    slug: 'levocetirizine',
    name: 'Levocetirizine',
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
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 20 listed levocetirizine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'Every realistic alternative here is another H1 antagonist, and the head-to-head trials that exist separate them by fractions of a point on a symptom scale. The choice that actually changes outcomes is not which antihistamine but whether an antihistamine is the right class at all: for a blocked nose specifically, an intranasal corticosteroid outperforms every oral antihistamine ever tested against it.',
      conventionalRx: [
        {
          name: 'Cetirizine (Zyrtec)',
          class:
            'Second-generation H1 antagonist — the racemic mixture levocetirizine was split from',
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
        title:
          'The two-fold receptor affinity is the marketing case, and the label calls it unknown',
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
        title:
          'It is sedating in a measurable, dose-related way, and two warnings arrived after approval',
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
        a: 'By about nine-tenths of a point on a five-symptom scale, in the trial that worked. Sneezing, runny nose, itchy nose, blocked nose and itchy eyes are each rated 0 to 3 and summed; untreated patients in that trial scored 8.68 and treated patients scored 7.87. That is a real difference, statistically solid, and roughly a tenth of the symptom burden. A second trial of the same design in 596 people found no difference at all. This class takes the edge off rather than switching the allergy off, and the placebo response in allergic rhinitis is large enough to obscure the effect in some trials.',
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
        label:
          'Levocetirizine 5 mg against placebo in seasonal allergic rhinitis, 580 adults — positive',
        identifier: 'NCT00653224',
        kind: 'nct',
      },
      {
        label:
          'Levocetirizine 5 mg against placebo in seasonal allergic rhinitis, 596 adults — null',
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
        'The original prescription capsule, NDA 020625, is listed as discontinued with a Federal Register determination that the product was not withdrawn for safety or effectiveness reasons. The tablet application NDA 020872, approved 25 February 2000, is now over-the-counter, as are the pseudoephedrine combinations NDA 020786 (1997) and NDA 021704 (2004) and the children’s suspension NDA 201373 (2011). At $0.2407 per unit it costs several times what loratadine ($0.0532) or cetirizine ($0.0629) cost pharmacies, and about as much as prescription desloratadine ($0.2553).',
      costSource: {
        label:
          'No published cost-of-production study exists for fexofenadine; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 52 listed fexofenadine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
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
        label: 'PubChem CID 3348 (fexofenadine) — canonical SMILES, molecular formula and weight',
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
        title:
          'In a driving simulator it behaved like placebo while diphenhydramine behaved worse than alcohol',
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
        title:
          'In people it had already failed, adding it back to a nasal spray contributed nothing',
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
        title:
          'It works in chronic hives, and above the lowest effective strength it stops improving',
        laymanSummary:
          'In long-running hives, all four strengths tested beat the dummy tablet for itching and number of welts. Quadrupling the strength beyond the second-lowest did not help further.',
        technicalDetails:
          'A four-week, double-blind, randomised, placebo-controlled dose-finding study in 418 patients with chronic idiopathic urticaria and moderate to severe pruritus compared fexofenadine 20, 60, 120 and 240 mg twice daily against placebo. All four doses were statistically superior to placebo for reducing pruritus severity and number of wheals over four weeks (p<=0.0115), and patients on fexofenadine reported significantly less interference with sleep and daily activities (p<=0.0014). Reductions were greater at 60 mg than at 20 mg and similar across 60, 120 and 240 mg. Adverse event incidence was similar across all groups with no dose-related increase.',
        evidenceSource:
          'Nelson HS, Reynolds R, Mason J. Ann Allergy Asthma Immunol 2000;84:517-522',
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
        statisticalPValue: 'Not reported. The registry record carries no posted results section.',
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
      type: 'Oral tablet (30, 60 and 180 mg), orally disintegrating tablet, oral suspension, and extended-release tablets combined with pseudoephedrine',
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
        a: 'On the CMS acquisition survey it is the dearest of the widely used oral generics: $0.2407 per unit against $0.0532 for loratadine and $0.0629 for cetirizine, all as median generic prices effective 19 August 2026. Those are what pharmacies pay to buy the drug, not what a patient is charged, and United States list prices are not published. There is no published cost-of-production study for any of them, so no manufacturing figure exists to compare against.',
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
  // ---------------------------------------------------------------------------------------------
  // 3. Diphenhydramine — on the market since 1946, the only active ingredient the FDA's nighttime
  //    sleep-aid monograph recognises, and the drug the sleep medicine profession recommends
  //    against for sleep.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'diphenhydramine',
    name: 'Diphenhydramine',
    tradeName: 'Benadryl / Allergy Relief / Nighttime Sleep Aid',
    sponsor:
      'Introduced in the United States in 1946; now sold overwhelmingly as generic under the over-the-counter monograph system, with McNeil Consumer among the listed labellers',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor, with substantial off-target antagonism of muscarinic acetylcholine receptors',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1946,
    indication:
      'Amelioration of allergic reactions to blood or plasma, adjunct to epinephrine in anaphylaxis after acute symptoms are controlled, other uncomplicated immediate-type allergic conditions where oral therapy is impossible, active treatment of motion sickness, and — under 21 CFR 338 — over-the-counter use as a nighttime sleep aid',
    patientFriendlyIndication:
      'Allergic reactions, itching and hives, motion sickness, and trouble falling asleep',
    anatomicalSite:
      'Everywhere — peripheral H1 receptors in nose and skin, brain H1 receptors in the tuberomammillary wakefulness pathway, and muscarinic receptors in bladder, gut, eye and cortex',
    conditionContext: {
      conditionExplainer:
        'Histamine does two unrelated jobs. In the nose and skin it drives the allergic reaction. In the brain it is one of the chemicals that keeps you awake. A drug that blocks the receptor cannot tell those two jobs apart.',
      whyItMatters:
        'This is the drug that established the class in 1946, and it is still the one most households have. It is also the one that goes everywhere in the body, which is why it makes people sleepy, dries them out, and appears on every list of medicines older adults should avoid.',
      whoTakesThis:
        'Adults and children, over the counter, for allergy, for itch, for travel sickness and for sleep. It is also the only intravenous antihistamine that was available in the United States for sixty-four years.',
      clinicalGoals:
        'Relief of an allergic reaction, or induction of sleep. The evidence for the first is old and thin; the evidence against the second is recent and specific.',
    },
    oneSentenceVerdict:
      'The first prescription antihistamine, an H1 antagonist that crosses freely into the brain and also blocks muscarinic receptors — it was non-inferior to intravenous cetirizine on two-hour itch relief in 262 patients with acute urticaria while sending twice as many of them back for a second visit, it impaired simulated driving more than a 0.1% blood alcohol concentration, its sedative effect disappeared completely by day four of continuous use, and it failed outright as an infant sleep aid in a randomised trial that a safety board stopped early.',
    laymanHowItWorks:
      'Histamine sits in the receptor and starts the allergic reaction; this drug takes the seat first and holds it. What separates it from the modern antihistamines is that it does not stay where the allergy is. It crosses into the brain, where histamine is one of the signals that keeps you awake, and blocking it there is what makes you drowsy. It also blocks a second, unrelated receptor for acetylcholine, which is why it dries your mouth and eyes, blurs vision, slows the gut and can make an older person confused.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 54,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.0444 per unit, median across 120 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Low',
      openPatentNotes:
        'Patent protection ended decades ago and the molecule is now a commodity: 120 separate products appear in the CMS acquisition survey, and it is the cheapest per unit of any antihistamine in this group. It is not sold under a modern new drug application at all. Over-the-counter marketing runs under the FDA monograph system, and 21 CFR 338.10 names diphenhydramine hydrochloride and diphenhydramine citrate as the only two nighttime sleep-aid active ingredients the monograph recognises.',
      costSource: {
        label:
          'No published cost-of-production study exists for diphenhydramine; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 120 listed diphenhydramine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'For allergy there is a direct replacement with better evidence and fewer effects; a randomised trial in an emergency department compared them head to head. For sleep there is no replacement, because the sleep medicine profession recommends against the drug rather than in favour of an alternative antihistamine.',
      conventionalRx: [
        {
          name: 'Cetirizine, oral or intravenous',
          class: 'Second-generation H1 antagonist',
          howItCompares:
            'Tested against intravenous diphenhydramine head to head in 262 adults presenting with acute urticaria. Two-hour itch relief was non-inferior (-1.6 against -1.5, 95% CI -0.1 to 0.3), while patients on cetirizine spent less time in the treatment centre (1.7 against 2.1 hours, p=0.005), returned less often (5.5% against 14.1%, p=0.02) and were less sedated (sedation score change 0.1 against 0.5, p=0.03).',
          typicalCost:
            '$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: equal itch relief, less sedation, fewer repeat presentations, once daily rather than every four to six hours. Cons: costs more per unit; not available as an oral solution in as many forms.',
        },
        {
          name: 'Loratadine or fexofenadine',
          class: 'Second-generation H1 antagonists that do not meaningfully enter the brain',
          howItCompares:
            'Both stay peripheral. In the Iowa Driving Simulator, drivers given diphenhydramine 50 mg were worse than drivers given enough alcohol to reach roughly 0.1% blood alcohol concentration, while fexofenadine was indistinguishable from placebo on the same measures.',
          typicalCost:
            '$0.0532 per unit for loratadine and $0.2407 per unit for fexofenadine at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no measurable driving impairment, no anticholinergic drying, once daily. Cons: slower onset than an injection, and neither is available intravenously in the way diphenhydramine is.',
        },
        {
          name: 'Cognitive behavioural therapy for insomnia',
          class: 'Non-pharmacological, and the first-line treatment for chronic insomnia',
          howItCompares:
            'For the sleep indication specifically, the comparison is not another drug. The American Academy of Sleep Medicine reviewed the randomised evidence drug by drug and issued a recommendation that clinicians not use diphenhydramine for sleep onset or sleep maintenance insomnia in adults.',
          typicalCost:
            'No drug acquisition cost; delivered as therapy or through structured programmes',
          prosAndCons:
            'Pros: the guideline-recommended first-line treatment, no tolerance and no anticholinergic burden. Cons: requires access, effort and weeks rather than a tablet tonight.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not treat a child’s sleep with it',
          action:
            'Avoid using it to settle an infant or young child at night, however routine the practice looks.',
          patientImpact:
            'The one randomised trial of exactly this — 44 infants aged 6 to 15 months with frequent night waking — was stopped early by its data safety monitoring board for lack of effectiveness. One of 22 infants on diphenhydramine improved against three of 22 on placebo.',
          clinicalPrecaution:
            'Paradoxical excitation rather than sedation is common in young children, and fatal monointoxication in infants is documented in the forensic literature. This is a drug with a genuine anticholinergic toxidrome, not a mild one.',
        },
        {
          name: 'Count how many nights in a row you have taken it',
          action: 'Notice whether the sedative effect is still there after three or four nights.',
          patientImpact:
            'In a randomised crossover in 15 healthy men, both objective and subjective sleepiness on diphenhydramine were significantly higher than placebo on day 1 and completely indistinguishable from placebo by day 4. The performance impairment reversed on the same schedule.',
          clinicalPrecaution:
            'Tolerance to the sedation does not mean tolerance to the anticholinergic effects, so continued use past the point where it stops working carries the burden without the benefit.',
        },
        {
          name: 'If you are over 65, ask whether this is the right drug at all',
          action:
            'Check whether a first-generation antihistamine is on the list of medicines to avoid at your age, including in combination products bought without a prescription.',
          patientImpact:
            'First-generation antihistamines, diphenhydramine among them, appear on the American Geriatrics Society Beers Criteria of potentially inappropriate medications in adults 65 and older, on the grounds of anticholinergic effect, reduced clearance with age, and risk of confusion, dry mouth, constipation and urinary retention.',
          clinicalPrecaution:
            'A prospective cohort of 3,434 people aged 65 and over found a dose-response relationship between ten-year cumulative anticholinergic exposure and incident dementia, with an adjusted hazard ratio of 1.54 in the highest exposure band. That is an association in an observational study, not a demonstrated cause.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CCOC(C1=CC=CC=C1)C2=CC=CC=C2',
      chemicalFormula: 'C17H21NO',
      molecularWeight: '255.35 g/mol',
      targetReceptorAffinity:
        'The molecule is small, lipophilic and uncharged at the ether oxygen, with a single basic tertiary amine — the opposite of the zwitterionic second-generation drugs — so it crosses the blood-brain barrier freely. Its selectivity for H1 over muscarinic acetylcholine receptors is poor, and the muscarinic block is not a rare side effect but a routine, dose-proportional part of what the drug does.',
      structureSource: {
        label:
          'PubChem CID 3100 (diphenhydramine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3100',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dph-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and residual solvent check on benzhydrol',
          description:
            'Confirm the diphenylmethanol starting material and its purity. There are no stereocentres in this molecule and no salt complexity, which is why the drug costs four cents a unit: the whole route is two reagents and a salt formation, and quality control is correspondingly simple.',
          reagentsAndBuffer:
            'Benzhydrol reference standard, gas chromatography with headspace sampling for residual solvents, melting point determination, 1H NMR in CDCl3',
        },
        {
          id: 'dph-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Williamson ether synthesis joining benzhydryl to dimethylaminoethanol',
          description:
            'Convert benzhydrol to the benzhydryl halide and displace with 2-dimethylaminoethanol, forming the ether that is the entire molecule. Nothing here is charged or polar, and that is the pharmacological point: the finished compound has no carboxylate to keep it out of the brain, unlike every second-generation antihistamine that followed it.',
          dependsOnStepId: 'dph-w1',
          reagentsAndBuffer:
            'Thionyl chloride or hydrogen bromide for the benzhydryl halide, 2-(dimethylamino)ethanol, sodium hydride or potassium carbonate as base, toluene or xylene at reflux under nitrogen',
        },
        {
          id: 'dph-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and recrystallisation',
          description:
            'Precipitate the hydrochloride from the free base and recrystallise. The citrate salt is made by the same route with citric acid and is the form used in some sleep-aid products; 21 CFR 338.10 recognises both salts and nothing else as nighttime sleep-aid actives.',
          dependsOnStepId: 'dph-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or diethyl ether, recrystallisation from isopropanol or acetone, loss on drying, chloride assay by argentometric titration',
        },
        {
          id: 'dph-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel dosing of H1 and muscarinic receptor membranes',
          description:
            'Apply the compound to membranes expressing human H1 and, in the same experiment, to membranes expressing the five muscarinic subtypes. Running the muscarinic panel alongside rather than afterwards is the point: for this molecule the anticholinergic activity is a primary pharmacological property and testing H1 alone would describe a different drug from the one people take.',
          dependsOnStepId: 'dph-w3',
          reagentsAndBuffer:
            'CHO membranes expressing human HRH1 and CHRM1 through CHRM5, [3H]mepyramine for H1 and [3H]N-methylscopolamine for muscarinic, 50 mM Tris-HCl at pH 7.4 with 10 mM magnesium chloride, atropine and triprolidine for non-specific binding',
        },
        {
          id: 'dph-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'H1-to-muscarinic selectivity ratio and brain-penetration index',
          description:
            'Report the two affinities as a ratio rather than separately, and pair them with a measured brain-to-plasma partition. A selectivity ratio close to one is the quantitative statement of why this drug sedates and dries where a second-generation agent does neither, and it is the single number that most usefully separates the generations.',
          dependsOnStepId: 'dph-w4',
          reagentsAndBuffer:
            'Scintillation counting, non-linear regression to Ki with Cheng-Prusoff correction; for brain penetration, LC-MS/MS quantification in matched plasma and brain homogenate, or [11C]doxepin displacement in a human PET protocol',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dph-a1',
        category: 'measured',
        title: 'It impaired driving more than being over the drink-drive limit',
        laymanSummary:
          'Forty licensed drivers drove for an hour in a simulator on four separate weeks: on this drug, on a modern antihistamine, on enough alcohol to put them around the legal limit, and on a dummy tablet. This drug was the worst of the four.',
        technicalDetails:
          'In a randomised, double-blind, double-dummy four-period crossover in the Iowa Driving Simulator, 40 licensed drivers aged 25 to 44 with seasonal allergic rhinitis received diphenhydramine 50 mg, fexofenadine 60 mg, alcohol to approximately 0.1% blood alcohol concentration, or placebo at weekly intervals. Coherence — the ability to match a lead vehicle’s varying speed — was significantly better after alcohol or fexofenadine than after diphenhydramine. Lane keeping, measured as steering instability and centre-line crossings, was impaired after both alcohol and diphenhydramine relative to fexofenadine. Self-reported drowsiness did not predict lack of coherence, so subjects could not tell how impaired they were.',
        evidenceSource: 'Weiler JM et al., Ann Intern Med 2000;132:354-363',
        doi: '10.7326/0003-4819-132-5-200003070-00004',
        measuredMetric:
          'Coherence, steering instability and centre-line crossings over one hour of simulated driving',
        auditFlag: 'verified',
      },
      {
        id: 'dph-a2',
        category: 'failed',
        title: 'The sedative effect is completely gone by the fourth night',
        laymanSummary:
          'The reason people take this for sleep is that it makes them drowsy. Measured objectively, that drowsiness disappears within four days of taking it every day. The drying and the other effects do not disappear.',
        technicalDetails:
          'Fifteen healthy men aged 18 to 50 received diphenhydramine 50 mg or placebo twice daily for four days in a randomised, double-blind crossover, with objective and subjective sleepiness measures and computer-based psychomotor testing. Both objective and subjective sleepiness were significantly higher on diphenhydramine than placebo on day 1. By day 4, sleepiness on diphenhydramine was indistinguishable from placebo, and the significant psychomotor impairment seen initially had completely reversed. The authors described this as the first objective demonstration of tolerance to the sedative effect of a first-generation H1 antihistamine.',
        evidenceSource: 'Richardson GS et al., J Clin Psychopharmacol 2002;22:511-515',
        doi: '10.1097/00004714-200210000-00012',
        measuredMetric:
          'Objective and subjective sleepiness and psychomotor performance, day 1 against day 4 of continuous dosing',
        auditFlag: 'verified',
      },
      {
        id: 'dph-a3',
        category: 'failed',
        title: 'TIRED: it did not settle infants, and a safety board stopped the trial',
        laymanSummary:
          'A randomised trial gave this drug or a placebo to infants who woke frequently at night. It was stopped early because the drug was doing nothing. One infant of twenty-two improved on the drug; three of twenty-two improved on placebo.',
        technicalDetails:
          'The Trial of Infant Response to Diphenhydramine was a double-blind, randomised, controlled trial in 44 infants aged 6 to 15 months with frequent parent-reported night awakenings, dosed 30 minutes before anticipated bedtime for one week with follow-up at 2 and 4 weeks. On 6 June 2005 the data safety monitoring board voted unanimously to stop the trial early for lack of effectiveness. One of 22 children on diphenhydramine improved against 3 of 22 on placebo. The authors calculated that to reach the pre-specified sample size and still reject the null hypothesis, 15 of the next 16 diphenhydramine infants and none of the next 16 placebo infants would have had to improve.',
        evidenceSource: 'Merenstein D et al., Arch Pediatr Adolesc Med 2006;160:707-712 (TIRED)',
        doi: '10.1001/archpedi.160.7.707',
        measuredMetric:
          'Parental report of improvement in night awakenings requiring assistance, day 14',
        auditFlag: 'verified',
      },
      {
        id: 'dph-a4',
        category: 'conclusion_shift',
        title:
          'A regulation names it the sleep aid; the sleep medicine profession recommends against it',
        laymanSummary:
          'Federal regulation recognises exactly two ingredients as over-the-counter sleep aids, and both of them are this drug. The specialist body that reviewed the actual trial evidence drug by drug came to the opposite conclusion and recommended against using it for insomnia.',
        technicalDetails:
          '21 CFR 338.10 lists diphenhydramine hydrochloride and diphenhydramine citrate as the only nighttime sleep-aid active ingredients in the over-the-counter monograph. The American Academy of Sleep Medicine convened a four-expert task force, ran a systematic review of randomised controlled trials and applied GRADE to individual drugs rather than classes, and issued the recommendation that clinicians not use diphenhydramine as a treatment for sleep onset or sleep maintenance insomnia in adults, graded WEAK. The gap is not a contradiction between two evidence reviews: the monograph reflects a pre-1962 marketing framework, and the guideline reflects the randomised evidence that has accumulated since.',
        evidenceSource:
          'Sateia MJ et al., J Clin Sleep Med 2017;13:307-349; 21 CFR 338.10, nighttime sleep-aid active ingredients',
        doi: '10.5664/jcsm.6470',
        inferredClaim:
          'That regulatory recognition as an over-the-counter sleep aid implies demonstrated efficacy for insomnia — the guideline built on the randomised trials recommends the opposite',
        auditFlag: 'contested',
      },
      {
        id: 'dph-a5',
        category: 'measured',
        title: 'Equal itch relief to intravenous cetirizine, and twice as many patients came back',
        laymanSummary:
          'In an emergency department trial in people with sudden hives, this drug relieved itching just as well as a modern antihistamine given the same way. But patients on it were more sedated, stayed longer, and were more than twice as likely to return for another visit.',
        technicalDetails:
          'A multicentre randomised phase 3 noninferiority trial enrolled 262 adults presenting to emergency departments and urgent care centres with acute urticaria requiring an intravenous antihistamine, randomising them to intravenous cetirizine 10 mg or intravenous diphenhydramine 50 mg. The two-hour change from baseline in patient-rated pruritus score was -1.6 for cetirizine against -1.5 for diphenhydramine (95% CI -0.1 to 0.3), meeting noninferiority in cetirizine’s favour. Secondary endpoints all favoured cetirizine: mean time in the treatment centre 1.7 against 2.1 hours (p=0.005), return to the treatment centre 5.5% against 14.1% (p=0.02), and two-hour change in sedation score 0.1 against 0.5 (p=0.03).',
        evidenceSource: 'Abella BS et al., Ann Emerg Med 2020;76:489-500',
        doi: '10.1016/j.annemergmed.2020.05.025',
        measuredMetric:
          'Two-hour pruritus score change, treatment centre time, return rate and sedation, against intravenous cetirizine',
        auditFlag: 'verified',
      },
      {
        id: 'dph-a6',
        category: 'inferred',
        title:
          'Cumulative anticholinergic exposure tracks with dementia, and this is an observation',
        laymanSummary:
          'A long-running study of older adults found that the more anticholinergic medicine someone had taken over ten years, the more likely they were to develop dementia. First-generation antihistamines were one of the three commonest drug groups involved. This is an association measured in a population, not a demonstration that the drug causes the disease.',
        technicalDetails:
          'The Adult Changes in Thought cohort followed 3,434 participants aged 65 and over with no dementia at entry, using computerised pharmacy dispensing records to compute total standardised daily doses of anticholinergics over ten years, excluding the most recent twelve months to avoid capturing prodromal use. Over a mean 7.3 years, 797 participants (23.2%) developed dementia, 637 of them Alzheimer disease. A ten-year cumulative dose-response relationship was observed (test for trend p<0.001), with adjusted hazard ratios against non-use of 0.92 (95% CI 0.74 to 1.16) for 1 to 90 total standardised daily doses, 1.19 (0.94 to 1.51) for 91 to 365, 1.23 (0.94 to 1.62) for 366 to 1,095 and 1.54 (1.21 to 1.96) above 1,095. The three commonest classes were tricyclic antidepressants, first-generation antihistamines and bladder antimuscarinics. The design cannot separate the drug from the reason it was prescribed, and the authors framed the finding as a reason to minimise exposure rather than as proof of causation.',
        evidenceSource: 'Gray SL et al., JAMA Intern Med 2015;175:401-407',
        doi: '10.1001/jamainternmed.2014.7663',
        inferredClaim:
          'That taking diphenhydramine causes dementia — the cohort measured cumulative exposure across a whole drug class and reports an association with a dose-response gradient, which is suggestive and is not a causal demonstration',
        auditFlag: 'caution',
      },
      {
        id: 'dph-a7',
        category: 'failed',
        title: 'It is one of the commonest agents in adolescent self-poisoning',
        laymanSummary:
          'Because it is cheap, unrestricted and in every house, it turns up constantly in deliberate overdoses. Poison centre records show tens of thousands of adolescent cases, rising over time, and the largest ingestions cause life-threatening effects in about one in five.',
        technicalDetails:
          'A National Poison Data System analysis of 47,644 diphenhydramine ingestions in 13 to 19 year-olds between 2007 and 2020 found rising case numbers, a rising proportion of intentional ingestions and a rising proportion of suspected suicide, with cardiac complications, seizures, coma and death more common after intentional ingestion than after misuse or abuse. A separate NPDS time-series of 24,358 cases in 6 to 18 year-olds from 2016 to 2023 found a 34.3% increase in ingestions, with 1,190 (4.9%) classified as massive; massive ingestions required inpatient admission in 69.6% of cases against 26.2% for non-massive, and produced major effects — life-threatening symptoms, residual disability or death — in 21.3% against 1.0%. FDA issued a warning about intentional misuse and abuse of diphenhydramine in September 2020.',
        evidenceSource:
          'Darracq MA, Thornton SL. Clin Toxicol 2022;60:851-859; Luke M et al., Clin Toxicol 2026, online ahead of print',
        doi: '10.1080/15563650.2022.2051536',
        measuredMetric:
          'National Poison Data System case counts, admission rates and major-effect rates by ingestion size',
        auditFlag: 'caution',
      },
      {
        id: 'dph-a8',
        category: 'inferred',
        title: 'Eighty years on the market is not eighty years of evidence',
        laymanSummary:
          'This drug reached pharmacies in 1946, sixteen years before manufacturers were first required to prove that a medicine works. Most of what is claimed for it has never been tested the way a new drug would be tested today.',
        technicalDetails:
          'Diphenhydramine was introduced in the United States in 1946. The Kefauver-Harris amendment of 1962 first required substantial evidence of effectiveness for approval. Today the drug is not marketed under a modern new drug application at all: over-the-counter sale runs under the FDA monograph system, and the CMS acquisition survey lists 120 separate products. Where randomised trials have been run against the specific claims — infant sleep in TIRED, adult insomnia in the evidence base the American Academy of Sleep Medicine reviewed, tolerance to sedation over four days — the results have been null or negative. The strongest positive randomised result on this page comes from a trial designed to show that a different drug could replace it.',
        evidenceSource:
          '21 CFR 338, Nighttime Sleep-Aid Drug Products for Over-the-Counter Human Use; Merenstein D et al., Arch Pediatr Adolesc Med 2006;160:707-712; Sateia MJ et al., J Clin Sleep Med 2017;13:307-349',
        inferredClaim:
          'That long-standing availability and regulatory recognition constitute evidence of effectiveness — they are facts about the history of drug regulation, and the randomised trials that exist point the other way',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed quickly and heavily processed by the liver',
        laymanDesc:
          'It gets into the blood fast, which is why drowsiness arrives within an hour. A large fraction is broken down by the liver before it ever reaches the circulation.',
        molecularDetail:
          'A small, lipophilic tertiary amine with high oral absorption and extensive first-pass metabolism, principally by CYP2D6 with contributions from CYP1A2, CYP2C9 and CYP2C19. Poor CYP2D6 metabolisers reach substantially higher exposure from the same amount. Elimination half-life lengthens in older adults, which compounds the sensitivity that age already brings.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain without resistance',
        laymanDesc:
          'Nothing in the molecule stops it entering the brain. That is not a flaw in the design; the design predates the idea that an antihistamine should stay out.',
        molecularDetail:
          'The molecule is uncharged apart from a single basic amine, has no carboxylate to form a zwitterion and is not a strong P-glycoprotein substrate, so it distributes freely across the blood-brain barrier. Brain H1 receptor occupancy for first-generation antihistamines measured by PET runs to a large fraction of available receptors, against -0.1% for fexofenadine in the same kind of study.',
        iconName: 'Brain',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the histamine receptor in two places at once',
        laymanDesc:
          'In the nose and skin, blocking the receptor stops the allergic itching and running. In the brain, the same receptor is part of the system that keeps you awake, and blocking it there makes you sleepy. The drug cannot separate the two.',
        molecularDetail:
          'Peripheral HRH1 antagonism on postcapillary venule endothelium and sensory nerve endings produces the antiallergic effect. Central HRH1 antagonism in the projections of the tuberomammillary nucleus suppresses histaminergic arousal, producing sedation. The therapeutic effect and the principal adverse effect are the same molecular event in two tissues.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It also blocks a completely different receptor',
        laymanDesc:
          'Alongside histamine, it blocks the receptor for acetylcholine. That is what dries the mouth and eyes, blurs near vision, slows the bowel, makes passing urine harder and can tip an older person into confusion.',
        molecularDetail:
          'Muscarinic acetylcholine receptor antagonism is substantial rather than incidental, and the H1-to-muscarinic selectivity ratio is close enough to one that ordinary doses produce measurable antimuscarinic effects. This is why the drug appears on the American Geriatrics Society Beers Criteria and why it dominates the anticholinergic-burden scales used in geriatric practice.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The sedation wears off; the rest does not',
        laymanDesc:
          'Take it every night and within four days you no longer feel drowsy from it. The dry mouth, the blurred vision and the effect on the bladder and bowel carry on.',
        molecularDetail:
          'Objective and subjective sleepiness on 50 mg twice daily were significantly above placebo on day 1 and indistinguishable from placebo by day 4 in a randomised crossover, with psychomotor impairment reversing on the same schedule. No comparable tolerance to antimuscarinic effects has been demonstrated, so continued use shifts the balance of effects unfavourably over days.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'In overdose it stops being an antihistamine',
        laymanDesc:
          'Taken in large amounts it produces agitation, hallucinations, fever, a racing heart and seizures. It is one of the drugs poison centres see most often in deliberate overdose, precisely because it is cheap and unrestricted.',
        molecularDetail:
          'Massive ingestion produces the full anticholinergic toxidrome together with cardiac complications and seizures. In a National Poison Data System series of 24,358 paediatric and adolescent cases, ingestions of 2,500 mg or more led to inpatient admission in 69.6% of cases and to major effects — life-threatening symptoms, residual disability or death — in 21.3%, against 1.0% for smaller ingestions.',
        iconName: 'Skull',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Weiler 2000 (Iowa Driving Simulator, Ann Intern Med 132:354-363)',
        phase: 'Randomised, double-blind, double-dummy, four-period crossover',
        sampleSize: 40,
        primaryEndpoint:
          'Coherence — ability to match the varying speed of a lead vehicle over one hour of simulated driving',
        endpointMet: false,
        statisticalPValue:
          'Coherence significantly worse after diphenhydramine 50 mg than after alcohol at approximately 0.1% blood alcohol concentration or after fexofenadine; lane keeping impaired relative to fexofenadine',
        unreportedAdverseSignals:
          'Self-reported drowsiness did not predict lack of coherence, so subjects were impaired without being able to detect it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Richardson 2002 (J Clin Psychopharmacol 22:511-515)',
        phase: 'Randomised, double-blind, four-day crossover',
        sampleSize: 15,
        primaryEndpoint:
          'Objective and subjective daytime sleepiness and psychomotor performance on 50 mg twice daily',
        endpointMet: false,
        statisticalPValue:
          'Significantly greater sleepiness and impairment than placebo on day 1; indistinguishable from placebo by day 4',
        unreportedAdverseSignals:
          'Fifteen healthy young men, four days. Tolerance to the antimuscarinic effects was not assessed and there is no evidence it develops on the same schedule.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'TIRED (Arch Pediatr Adolesc Med 2006;160:707-712)',
        phase: 'Randomised, double-blind, placebo-controlled — stopped early for futility',
        sampleSize: 44,
        primaryEndpoint:
          'Parental report of improvement in night awakenings requiring assistance at day 14, in infants aged 6 to 15 months',
        endpointMet: false,
        statisticalPValue:
          '1 of 22 improved on diphenhydramine against 3 of 22 on placebo; data safety monitoring board voted unanimously to stop for lack of effectiveness',
        unreportedAdverseSignals:
          'Stopped at 44 of a planned larger enrolment, so the trial is small. The direction of the result and the futility calculation are nonetheless unambiguous.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Abella 2020 (Ann Emerg Med 76:489-500)',
        phase: 'Phase 3, multicentre, randomised, noninferiority — as the active comparator',
        sampleSize: 262,
        primaryEndpoint:
          'Two-hour change from baseline in patient-rated pruritus score in acute urticaria',
        endpointMet: true,
        statisticalPValue:
          'Intravenous cetirizine -1.6 against intravenous diphenhydramine -1.5 (95% CI -0.1 to 0.3), noninferiority met in cetirizine’s favour',
        unreportedAdverseSignals:
          'Diphenhydramine patients spent longer in the treatment centre (2.1 against 1.7 hours, p=0.005), returned more often (14.1% against 5.5%, p=0.02) and were more sedated (0.5 against 0.1, p=0.03). The trial was designed and funded to displace it.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Adult Changes in Thought cohort (JAMA Intern Med 2015;175:401-407)',
        phase: 'Prospective population-based cohort, not a trial',
        sampleSize: 3434,
        primaryEndpoint:
          'Incident dementia and Alzheimer disease against ten-year cumulative anticholinergic exposure',
        endpointMet: true,
        statisticalPValue:
          'Dose-response trend p<0.001; adjusted hazard ratio 1.54 (95% CI 1.21 to 1.96) above 1,095 total standardised daily doses against non-use',
        unreportedAdverseSignals:
          'Observational. Exposure is measured across a whole anticholinergic class rather than for diphenhydramine specifically, and confounding by indication cannot be excluded.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Simulated driving coherence and lane keeping worse on 50 mg than at approximately 0.1% blood alcohol concentration, in a four-period crossover in 40 drivers',
        'Sedation and psychomotor impairment significant on day 1 and completely gone by day 4 of twice-daily dosing in 15 healthy men',
        '1 of 22 infants improved against 3 of 22 on placebo in TIRED, which was stopped early for futility',
        'Two-hour pruritus relief of -1.5 in acute urticaria, statistically non-inferior to intravenous cetirizine at -1.6',
        'Major effects in 21.3% of massive paediatric ingestions against 1.0% of non-massive, across 24,358 poison centre cases',
      ],
      unsupportedInferences: [
        'That being the only active ingredient in the over-the-counter nighttime sleep-aid monograph means it has been shown to treat insomnia',
        'That eighty years on the market constitutes evidence of effectiveness — the drug predates the 1962 requirement to prove any',
        'That the cumulative anticholinergic dementia association proves causation, when it is an observational class-level exposure measure',
        'That feeling alert on it means driving is unaffected — self-reported drowsiness failed to predict measured impairment',
      ],
      whatFailedInitially: [
        'TIRED was stopped by its data safety monitoring board for lack of effectiveness in infant night waking',
        'The sedative effect, which is the reason it is bought as a sleep aid, disappears within four days of continuous use',
        'The American Academy of Sleep Medicine reviewed the randomised evidence and recommended against using it for insomnia in adults',
        'In the emergency department trial it lost on sedation, on length of stay and on repeat presentations while merely matching on itch relief',
      ],
      realWorldOutcome: [
        'Introduced in 1946 and never withdrawn; still the cheapest antihistamine in the CMS survey at $0.0444 per unit across 120 products',
        'Named in 21 CFR 338.10 as one of only two recognised over-the-counter nighttime sleep-aid active ingredients, both of them salts of this molecule',
        'On the American Geriatrics Society Beers Criteria list of medications potentially inappropriate for adults aged 65 and over',
        'The subject of an FDA warning in September 2020 about intentional misuse and abuse, against a background of tens of thousands of adolescent poison centre cases',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule, liquid and orally disintegrating strip; topical cream; and injection, which for sixty-four years was the only intravenous antihistamine available in the United States',
      description:
        'The injectable form is labelled for use when oral therapy is impossible or contraindicated. Onset of sedation after an oral dose is within about an hour; the effect on driving is present at that point whether or not the person feels it.',
      safetyProfile:
        'Sedation and psychomotor impairment exceeding that produced by alcohol at roughly the legal driving limit, with tolerance to the sedation but not to the rest within four days. A full antimuscarinic profile at ordinary doses: dry mouth, blurred near vision, constipation, urinary retention and, in older adults, confusion. Paradoxical excitation is common in young children, and fatal monointoxication in infants is documented. In massive ingestion the anticholinergic toxidrome is accompanied by cardiac complications and seizures. Metabolised by CYP2D6, so poor metabolisers and people taking CYP2D6 inhibitors reach higher exposure.',
    },
    commonQuestions: [
      {
        q: 'Is it safe to drive after taking it?',
        a: 'The measurement says no. In the Iowa Driving Simulator, forty licensed drivers with hay fever drove for an hour on four separate occasions — on diphenhydramine 50 mg, on fexofenadine, on enough alcohol to reach about 0.1% blood alcohol concentration, and on placebo. Diphenhydramine was the worst of the four on the primary measure, worse than the alcohol. Lane keeping was impaired the same way. The finding that matters most in practice is that self-reported drowsiness did not predict impairment: people on the drug could not tell how badly they were driving.',
      },
      {
        q: 'It stopped making me sleepy after a few nights. Why?',
        a: 'Because tolerance to the sedative effect develops fast, and it has been measured. Fifteen healthy men took 50 mg twice daily or placebo for four days in a crossover trial. On day 1 both objective and subjective sleepiness were clearly higher on the drug. By day 4 they were indistinguishable from placebo, and the psychomotor impairment had completely reversed. That is the sedation. The dry mouth, the blurred vision, the effect on the bladder and gut have not been shown to fade on the same schedule, so continuing past the point where it stops working leaves you with the burden and not the benefit.',
      },
      {
        q: 'Can I give it to my child to help them sleep?',
        a: 'The one randomised trial of exactly this question was stopped early because the drug was not working. Forty-four infants aged six to fifteen months with frequent night waking were given diphenhydramine or placebo half an hour before bedtime for a week. On 6 June 2005 the data safety monitoring board voted unanimously to stop for lack of effectiveness: one of twenty-two infants improved on the drug against three of twenty-two on placebo. Separately, young children often become agitated rather than sleepy on it, and fatal poisoning in infants is documented in the forensic literature.',
        auditNote:
          'The trial was small, and it was stopped because the result was going nowhere rather than because it was harmful. The futility calculation the authors published is the useful part: fifteen of the next sixteen treated infants would have had to improve, and none of the next sixteen on placebo.',
      },
      {
        q: 'Does it cause dementia?',
        a: 'It has not been shown to, and there is a real signal worth knowing about. A cohort of 3,434 people aged 65 and over with no dementia at entry was followed for a mean of 7.3 years, with anticholinergic exposure measured from pharmacy records over ten years. Higher cumulative exposure tracked with higher dementia risk in a dose-response pattern, and in the highest exposure band the adjusted hazard ratio was 1.54 with a confidence interval from 1.21 to 1.96. First-generation antihistamines were one of the three commonest classes involved. But this is an observational study measuring a whole drug class: it cannot separate the drug from the reasons people were taking it, and the authors framed it as grounds for minimising exposure, not as proof of cause.',
      },
      {
        q: 'If the trials are this bad, why is it still sold as a sleep aid?',
        a: 'Because of when it arrived. Diphenhydramine reached the United States market in 1946, sixteen years before the law first required a manufacturer to prove a drug works. Over-the-counter sale today runs under the FDA monograph system rather than under a modern new drug application, and 21 CFR 338.10 names diphenhydramine hydrochloride and diphenhydramine citrate as the only two recognised nighttime sleep-aid actives. When the American Academy of Sleep Medicine did review the randomised evidence drug by drug, its recommendation was that clinicians not use diphenhydramine for sleep onset or sleep maintenance insomnia in adults. Both statements are current and they point in opposite directions.',
        auditNote:
          'This is the clearest example in this batch of regulatory recognition and evidence quality being separate things. The monograph is a fact about the history of American drug law.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Weiler JM et al. Effects of fexofenadine, diphenhydramine, and alcohol on driving performance: a randomized, placebo-controlled trial in the Iowa driving simulator. Ann Intern Med 2000;132:354-363',
        identifier: '10.7326/0003-4819-132-5-200003070-00004',
        kind: 'doi',
      },
      {
        label:
          'Richardson GS, Roehrs TA, Rosenthal L, Koshorek G, Roth T. Tolerance to daytime sedative effects of H1 antihistamines. J Clin Psychopharmacol 2002;22:511-515',
        identifier: '10.1097/00004714-200210000-00012',
        kind: 'doi',
      },
      {
        label:
          'Merenstein D et al. The trial of infant response to diphenhydramine: the TIRED study — a randomized, controlled, patient-oriented trial. Arch Pediatr Adolesc Med 2006;160:707-712',
        identifier: '10.1001/archpedi.160.7.707',
        kind: 'doi',
      },
      {
        label:
          'Sateia MJ, Buysse DJ, Krystal AD, Neubauer DN, Heald JL. Clinical practice guideline for the pharmacologic treatment of chronic insomnia in adults. J Clin Sleep Med 2017;13:307-349',
        identifier: '10.5664/jcsm.6470',
        kind: 'doi',
      },
      {
        label:
          'Abella BS et al. Intravenous cetirizine versus intravenous diphenhydramine for the treatment of acute urticaria: a phase III randomized controlled noninferiority trial. Ann Emerg Med 2020;76:489-500',
        identifier: '10.1016/j.annemergmed.2020.05.025',
        kind: 'doi',
      },
      {
        label:
          'Gray SL et al. Cumulative use of strong anticholinergics and incident dementia: a prospective cohort study. JAMA Intern Med 2015;175:401-407',
        identifier: '10.1001/jamainternmed.2014.7663',
        kind: 'doi',
      },
      {
        label:
          'Darracq MA, Thornton SL. A different challenge with Benadryl: adolescent diphenhydramine ingestions reported to National Poison Database System, 2007-2020. Clin Toxicol 2022;60:851-859',
        identifier: '10.1080/15563650.2022.2051536',
        kind: 'doi',
      },
      {
        label:
          'Luke M et al. Frequency of massive diphenhydramine ingestions in children 6-18 years of age. Clin Toxicol 2026, online ahead of print',
        identifier: '10.1080/15563650.2026.2680177',
        kind: 'doi',
      },
      {
        label:
          'American Geriatrics Society 2023 updated AGS Beers Criteria for potentially inappropriate medication use in older adults. J Am Geriatr Soc 2023;71:2052-2081',
        identifier: '10.1111/jgs.18372',
        kind: 'doi',
      },
      {
        label:
          '21 CFR 338.10 — nighttime sleep-aid active ingredients: diphenhydramine hydrochloride and diphenhydramine citrate',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-338',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3100 — diphenhydramine structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3100',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Pseudoephedrine — the decongestant that works, moved behind the counter because it makes
  //    methamphetamine, and replaced on the open shelf by one the FDA has now proposed removing
  //    for not working at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pseudoephedrine',
    name: 'Pseudoephedrine',
    tradeName: 'Sudafed / Sudogest / Nasal Decongestant',
    sponsor:
      'Marketed in the United States from 1963, originally by Schering-Plough as Sudafed; now generic across dozens of labellers and sold only from behind the pharmacy counter under the Combat Methamphetamine Epidemic Act of 2005',
    targetGene:
      'ADRA1A and SLC6A2 — acting mostly indirectly, through the noradrenaline transporter',
    targetProtein:
      'Alpha-1 adrenergic receptors on nasal venous sinusoids, reached mainly by displacing stored noradrenaline from sympathetic nerve terminals rather than by binding the receptor directly',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1963,
    indication:
      'Temporary relief of nasal congestion due to the common cold, hay fever or other upper respiratory allergies; temporary relief of sinus congestion and pressure; promotion of nasal and sinus drainage',
    patientFriendlyIndication: 'A blocked nose and sinus pressure',
    anatomicalSite:
      'Nasal venous sinusoids — the spongy blood-filled tissue in the turbinates whose swelling is what a blocked nose actually is',
    conditionContext: {
      conditionExplainer:
        'A blocked nose is not mucus filling a tube. The lining of the nose contains large blood spaces that swell when their vessels dilate, and the swollen tissue narrows the airway. That is why blowing your nose does not fix it and why a drug that constricts blood vessels does.',
      whyItMatters:
        'This is the one ingredient on the cough-and-cold shelf whose mechanism is straightforward and whose measured effect, though small, is real. Its story is about regulation rather than pharmacology: it was moved behind the counter because it can be cooked into methamphetamine, and what replaced it on the open shelf turned out not to work.',
      whoTakesThis:
        'Adults and children, sold without a prescription but only from behind the pharmacy counter in the United States, with identification, a logbook entry and quantity limits.',
      clinicalGoals:
        'Reduced subjective nasal congestion. The Cochrane review that pooled the randomised evidence found a small effect on that measure and could not say whether it matters clinically.',
    },
    oneSentenceVerdict:
      'A mixed-acting sympathomimetic that constricts the swollen blood spaces in the nasal lining, mostly by releasing the body’s own noradrenaline — the pooled randomised evidence gives a standardised mean difference of 0.49 (95% CI 0.07 to 0.92) for multiple doses against placebo, which the Cochrane authors called a small effect of unknown clinical relevance, and a meta-analysis of 24 trials in 1,285 patients puts its effect on systolic blood pressure at 0.99 mm Hg and on heart rate at 2.83 beats per minute.',
    laymanHowItWorks:
      'The stuffiness of a cold is swollen tissue, not mucus: the nose is lined with spongy blood-filled spaces that fill up and squeeze the airway shut. Pseudoephedrine makes the muscle around those blood vessels tighten, so the spaces empty and the airway opens. It does this mostly by pushing out the body’s own noradrenaline from nerve endings rather than by acting on the vessel directly, which is why it also nudges heart rate and blood pressure everywhere else in the body.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.0785 per unit, median across 33 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Low',
      openPatentNotes:
        'Long off patent and cheap to make, which is precisely the problem: the molecule is one reduction step away from methamphetamine. The Combat Methamphetamine Epidemic Act of 2005, signed in March 2006, moved it behind the pharmacy counter with identification checks, logbooks and daily and monthly purchase limits, and the DEA implemented it by interim final rule on 26 September 2006, finalised at 85 FR 68450 on 29 October 2020. Its regulatory cost is therefore not in the price but in the access.',
      costSource: {
        label:
          'No published cost-of-production study exists for pseudoephedrine; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 33 listed pseudoephedrine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'The substitution that actually happened — oral phenylephrine on the open shelf — is the one the FDA has proposed removing from the monograph because it does not work. The alternatives with evidence are topical: a spray reaches the tissue directly, at the cost of rebound congestion if used beyond a few days, or a corticosteroid spray works more slowly with no rebound at all.',
      conventionalRx: [
        {
          name: 'Oral phenylephrine',
          class:
            'Direct alpha-1 agonist, the ingredient that replaced pseudoephedrine on the open shelf',
          howItCompares:
            'This is the comparison that matters and it goes only one way. On 8 November 2024 the FDA announced proposed administrative order OTC000036 to amend monograph M012 and remove orally administered phenylephrine hydrochloride and phenylephrine bitartrate as nasal decongestant active ingredients on the stated ground that they are not effective. Pseudoephedrine was not part of that action.',
          typicalCost:
            '$5.13 per mL at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026) — the listed products are injectable rather than the oral tablets at issue',
          prosAndCons:
            'Pros: available on the open shelf without identification. Cons: the FDA has proposed removing it from the monograph as not effective when taken by mouth; extensive gut and liver metabolism leaves very little of an oral dose in the circulation.',
        },
        {
          name: 'Oxymetazoline nasal spray',
          class: 'Topical alpha agonist applied directly to the nasal lining',
          howItCompares:
            'Delivers the same vasoconstriction to the tissue that is swollen without passing through the whole circulation, so it works faster and does not raise heart rate the way an oral dose does. The Cochrane review of nasal decongestants included three oxymetazoline studies among its fifteen trials.',
          typicalCost:
            '$0.1049 per mL at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: fast, local, no systemic cardiovascular effect of consequence. Cons: rebound congestion — rhinitis medicamentosa — on continued use, which is why the label limits the number of consecutive days.',
        },
        {
          name: 'Intranasal corticosteroid',
          class: 'Topical anti-inflammatory, a different mechanism',
          howItCompares:
            'Where the congestion is allergic rather than viral, a steroid spray treats the inflammation causing the swelling instead of squeezing the vessels shut. It takes days rather than minutes and carries no rebound.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone, median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no rebound, no cardiovascular effect, works on the cause in allergic disease. Cons: useless for immediate relief tonight; needs days of regular use and correct technique.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Saline irrigation and steam',
          action: 'Rinsing the nasal cavity with salt water; warm humidified air.',
          patientImpact:
            'Clears secretions and moistens the lining. It does not constrict the swollen blood spaces, so it addresses a different part of the problem than this drug does, and the two are not substitutes for each other.',
          clinicalPrecaution:
            'Use only sterile, distilled or previously boiled water for irrigation. Fatal amoebic meningoencephalitis has been traced to untreated tap water.',
        },
        {
          name: 'Read the label if your blood pressure is not controlled',
          action:
            'Check the "ask a doctor before use" list on the carton, and mention any monoamine oxidase inhibitor.',
          patientImpact:
            'The label directs people with heart disease, high blood pressure, thyroid disease, diabetes or difficulty passing urine from an enlarged prostate to ask a doctor first, and forbids use with a prescription MAOI or within two weeks of stopping one.',
          clinicalPrecaution:
            'Since March 2024 the European Union additionally contraindicates pseudoephedrine outright in severe or uncontrolled hypertension and in severe acute or chronic kidney disease, after a review of posterior reversible encephalopathy syndrome and reversible cerebral vasoconstriction syndrome.',
        },
        {
          name: 'Know the warning signs the European regulator added',
          action:
            'Stop and seek help for a sudden severe headache, nausea or vomiting, confusion, seizures or visual disturbance.',
          patientImpact:
            'These are the symptoms of the two brain blood-flow syndromes that prompted the European review. Both are rare and both usually resolve if treated promptly, which is why recognising them matters more than the absolute risk figure.',
          clinicalPrecaution:
            'A headache during a cold is ordinary. A sudden, severe, unlike-anything-before headache while taking a decongestant is the specific pattern the warning describes.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@@H]([C@H](C1=CC=CC=C1)O)NC',
      chemicalFormula: 'C10H15NO',
      molecularWeight: '165.23 g/mol',
      targetReceptorAffinity:
        'Direct affinity for alpha-adrenergic receptors is weak, and most of the effect is indirect: the molecule is taken up by the noradrenaline transporter into sympathetic nerve terminals and displaces stored noradrenaline into the synapse. That is why the pharmacology is systemic rather than local — a meta-analysis of 24 randomised placebo-controlled trials in 1,285 patients measured a systolic blood pressure rise of 0.99 mm Hg (95% CI 0.08 to 1.90) and a heart rate rise of 2.83 beats per minute (95% CI 2.0 to 3.6), with no significant change in diastolic pressure.',
      structureSource: {
        label:
          'PubChem CID 7028 (pseudoephedrine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/7028',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pse-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Diastereomer identity: pseudoephedrine against ephedrine',
          description:
            'Confirm which of the two adjacent stereocentres arrangement is present. Ephedrine and pseudoephedrine are diastereomers differing at one carbon; they have different potencies, different regulatory treatment and different melting points, and a mislabelled batch is a controlled-substance problem as much as a pharmaceutical one.',
          reagentsAndBuffer:
            'Ephedrine and pseudoephedrine hydrochloride reference standards, chiral HPLC, optical rotation, melting point, 1H NMR coupling constant analysis across the C1-C2 bond',
        },
        {
          id: 'pse-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentative carboligation to (R)-phenylacetylcarbinol, then reductive amination',
          description:
            'The industrial route is biological at its first step: yeast pyruvate decarboxylase condenses benzaldehyde with pyruvate to give (R)-phenylacetylcarbinol, setting one stereocentre enzymatically, and reductive amination with methylamine sets the second. Building the chirality in with an enzyme is what makes the diastereomeric purity achievable at commodity scale.',
          dependsOnStepId: 'pse-w1',
          reagentsAndBuffer:
            'Saccharomyces cerevisiae or isolated pyruvate decarboxylase, benzaldehyde fed under controlled dosing to limit toxicity to the culture, pyruvate or fermentable sugar, then methylamine with a platinum or palladium catalyst under hydrogen',
        },
        {
          id: 'pse-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation from the ephedrine diastereomer and hydrochloride crystallisation',
          description:
            'Separate the two diastereomers and crystallise the pseudoephedrine hydrochloride. Because the two differ in solubility rather than in chromatographic behaviour alone, fractional crystallisation does most of the work, and the specification on residual ephedrine is set by diversion-control rules as well as by pharmacopoeial limits.',
          dependsOnStepId: 'pse-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, fractional crystallisation from water or ethanol, chiral HPLC on the isolated salt, ICP-MS for residual catalyst metals',
        },
        {
          id: 'pse-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Noradrenaline transporter uptake and displacement assay',
          description:
            'Apply the compound to cells expressing the human noradrenaline transporter preloaded with labelled noradrenaline, and measure release rather than binding. This is the assay that distinguishes an indirect sympathomimetic from a direct agonist, and testing only receptor affinity would understate the drug substantially, because most of what it does is release the body’s own transmitter.',
          dependsOnStepId: 'pse-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells expressing human SLC6A2, [3H]noradrenaline preload, Krebs-HEPES buffer with ascorbate and pargyline to prevent oxidation, desipramine as transporter blocker control, superfusion apparatus for release kinetics',
        },
        {
          id: 'pse-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nasal airway resistance by rhinomanometry against symptom score',
          description:
            'Measure the physical quantity — resistance to airflow through the nose — alongside the subjective congestion score, in the same subjects. The two are only loosely correlated, and the Cochrane review found that the trials which reported them did so in ways too diverse to pool. Reporting both is the only way to distinguish an opened airway from a changed sensation.',
          dependsOnStepId: 'pse-w4',
          reagentsAndBuffer:
            'Active anterior rhinomanometry or acoustic rhinometry, controlled temperature and humidity, standardised acclimatisation period, parallel visual analogue and categorical congestion scales at matched timepoints',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pse-a1',
        category: 'measured',
        title: 'A small effect on congestion, from evidence Cochrane graded low quality',
        laymanSummary:
          'Pooling the randomised trials, taking repeated doses gave a modest improvement in how blocked people said their nose felt, about three hours after the last dose. The reviewers described the size as small and said they could not tell whether it was clinically meaningful.',
        technicalDetails:
          'The Cochrane review of nasal decongestants in monotherapy for the common cold included 15 trials with 1,838 participants, nine of them using pseudoephedrine. For multiple doses against placebo, subjective congestion was significantly better in the treatment group approximately three hours after the last dose, standardised mean difference 0.49 (95% CI 0.07 to 0.92, p=0.02), graded low-quality evidence. That pooling rested on two studies only, one oral and one topical, so oral and topical effects could not be separated. For single doses, the ten available trials measured and reported congestion so diversely that no pooling was possible at all, and the authors drew no conclusion. There is no defined minimal clinically important difference for subjective congestion, so the reviewers used the standardised mean difference itself as the yardstick and classed 0.49 as small.',
        evidenceSource:
          'Deckx L, De Sutter AI, Guo L, Mir NA, van Driel ML. Cochrane Database Syst Rev 2016;10:CD009612',
        doi: '10.1002/14651858.CD009612.pub2',
        measuredMetric:
          'Standardised mean difference in subjective nasal congestion, multiple doses against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'pse-a2',
        category: 'conclusion_shift',
        title:
          'The replacement it was pushed aside for is now proposed for removal as not effective',
        laymanSummary:
          'Because the drug can be cooked into methamphetamine, a 2005 law moved it behind the pharmacy counter. Manufacturers reformulated the open-shelf products around phenylephrine instead. In 2024 the FDA proposed taking oral phenylephrine out of the rulebook altogether, on the ground that it does not work.',
        technicalDetails:
          'The Combat Methamphetamine Epidemic Act of 2005 was signed in March 2006, and the DEA implemented retail restrictions by interim final rule on 26 September 2006, finalised at 85 FR 68450 on 29 October 2020: identification, logbooks, and daily and monthly quantity limits. Manufacturers responded by substituting oral phenylephrine in open-shelf formulations. On 8 November 2024 the FDA announced proposed administrative order OTC000036 at 89 FR 88787, which if finalised amends Final Administrative Order OTC000026 to remove orally administered phenylephrine hydrochloride and phenylephrine bitartrate in an effervescent dosage as nasal decongestant active ingredients "because they are not effective." Pseudoephedrine was not part of that action. As of this audit the phenylephrine order is proposed and not final.',
        evidenceSource:
          'FDA, Amending Over-the-Counter Monograph M012, proposed order OTC000036, 89 FR 88787, 8 November 2024; DEA, Implementation of the Combat Methamphetamine Epidemic Act of 2005; Retail Sales, 85 FR 68450, 29 October 2020',
        inferredClaim:
          'That the open-shelf decongestant which replaced pseudoephedrine was pharmacologically equivalent — the FDA has proposed removing it as not effective, so the practical result of the diversion-control law was to move consumers from a weakly effective drug to an ineffective one',
        auditFlag: 'verified',
      },
      {
        id: 'pse-a3',
        category: 'measured',
        title: 'The blood pressure effect is real, and much smaller than its reputation',
        laymanSummary:
          'People are routinely told to avoid this drug if their blood pressure is high. Pooling 24 randomised trials, the average rise in the top blood pressure number was about one point, and the pulse rose by under three beats a minute. In people whose high blood pressure was controlled, the rise was the same size.',
        technicalDetails:
          'A meta-analysis of English-language randomised placebo-controlled trials of oral pseudoephedrine in adults found 24 trials with extractable vital signs, comprising 45 treatment arms and 1,285 patients. Random-effects weighted mean differences were: systolic blood pressure +0.99 mm Hg (95% CI 0.08 to 1.90), heart rate +2.83 beats per minute (95% CI 2.0 to 3.6), diastolic blood pressure +0.63 mm Hg (95% CI -0.10 to 1.35, not significant). In patients with controlled hypertension the systolic rise was of similar magnitude, +1.20 mm Hg (95% CI 0.56 to 1.84). Higher doses and immediate-release preparations produced greater rises; shorter duration of use was associated with greater increases; studies with more women showed less effect.',
        evidenceSource: 'Salerno SM, Jackson JL, Berbano EP. Arch Intern Med 2005;165:1686-1694',
        doi: '10.1001/archinte.165.15.1686',
        measuredMetric:
          'Weighted mean difference in systolic and diastolic blood pressure and heart rate against placebo across 45 treatment arms',
        auditFlag: 'verified',
      },
      {
        id: 'pse-a4',
        category: 'failed',
        title: 'Europe added outright contraindications in 2024 for two brain blood-flow syndromes',
        laymanSummary:
          'European regulators reviewed reports of two rare conditions in which blood flow to the brain is disturbed, and concluded the drug can cause them. They banned its use in severe or uncontrolled high blood pressure and in severe kidney disease, and told patients which symptoms mean stop immediately.',
        technicalDetails:
          'The European Medicines Agency’s Pharmacovigilance Risk Assessment Committee reviewed pseudoephedrine-containing medicines and recommended new measures on 30 November 2023; the CHMP endorsed them on 25 January 2024 and the European Commission issued its decision in March 2024. The risks identified were posterior reversible encephalopathy syndrome and reversible cerebral vasoconstriction syndrome, both involving reduced blood supply to the brain with potentially life-threatening complications, described as rare and usually resolving with prompt treatment. The medicines are now contraindicated in severe or uncontrolled hypertension and in severe acute or chronic kidney disease or renal failure. Patients are to stop treatment and seek help for sudden severe headache, nausea, vomiting, confusion, seizures or visual disturbance. The United States label carries no equivalent contraindication; it directs people with high blood pressure to ask a doctor before use.',
        evidenceSource:
          'European Medicines Agency, referral procedure on pseudoephedrine-containing medicinal products, PRAC recommendation 30 November 2023, CHMP 25 January 2024, Commission decision March 2024',
        measuredMetric:
          'Regulatory risk assessment outcome — new contraindications and warning symptoms',
        auditFlag: 'caution',
      },
      {
        id: 'pse-a5',
        category: 'inferred',
        title: 'Nobody has shown it works in children, and it is sold for them anyway',
        laymanSummary:
          'Of the fifteen randomised trials in the systematic review, fourteen enrolled only adults. The reviewers stated that effectiveness and safety in children remain to be determined.',
        technicalDetails:
          'The Cochrane review reports that fourteen of its fifteen included studies enrolled adults aged 18 and over only, and concludes that the effectiveness and safety of nasal decongestants in children, and the clinical relevance of the small effect seen in adults, are yet to be determined. Separately, the FDA announced in 2011 its intention to take enforcement action against unapproved and misbranded oral prescription-labelled cold, cough and allergy products, noting that many were inappropriately labelled for use in infants and young children (76 FR 11794).',
        evidenceSource:
          'Deckx L et al., Cochrane Database Syst Rev 2016;10:CD009612, Authors’ conclusions; FDA, 76 FR 11794, 3 March 2011',
        doi: '10.1002/14651858.CD009612.pub2',
        inferredClaim:
          'That an effect measured almost entirely in adults transfers to children — the systematic review says explicitly that it has not been determined',
        auditFlag: 'caution',
      },
      {
        id: 'pse-a6',
        category: 'measured',
        title: 'Short-term adverse events were no more common than on placebo',
        laymanSummary:
          'Across the trials that recorded them, side effects happened about as often on the drug as on the dummy. Roughly one person in eight reported something in each group.',
        technicalDetails:
          'Seven of the fifteen Cochrane-included trials recorded adverse events, six with an oral decongestant and one topical. Meta-analysis found no statistical difference between groups: 125 events per 1,000 in the treatment group against 126 per 1,000 on placebo, odds ratio 0.98 (95% CI 0.68 to 1.40, p=0.90), graded low-quality evidence. Restricting to oral decongestants only gave an odds ratio of 0.95 (95% CI 0.65 to 1.39, p=0.80). These are short-term data in adults; they say nothing about the rare neurological events that prompted the European contraindications, which no trial of this size and duration could detect.',
        evidenceSource: 'Deckx L et al., Cochrane Database Syst Rev 2016;10:CD009612',
        doi: '10.1002/14651858.CD009612.pub2',
        measuredMetric: 'Pooled odds ratio for adverse events, decongestant against placebo',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and it goes everywhere',
        laymanDesc:
          'A tablet reaches the whole circulation, not just the nose. That is the reason it also touches heart rate and blood pressure, and the reason a spray does not.',
        molecularDetail:
          'Well absorbed orally with limited metabolism and largely renal excretion of unchanged drug, so exposure rises when urine is alkaline and when kidney function is reduced. Systemic distribution is unavoidable by this route, which is what separates it pharmacologically from a topical alpha agonist applied to the mucosa.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is carried into sympathetic nerve endings',
        laymanDesc:
          'Rather than acting on the blood vessel itself, the molecule is taken up into the nerve endings that control the vessel — using the same doorway the body uses to recycle its own signalling chemical.',
        molecularDetail:
          'Pseudoephedrine is a substrate for the noradrenaline transporter SLC6A2 and is carried into the sympathetic nerve terminal. Its own affinity for alpha-adrenergic receptors is weak; the transporter step, not receptor binding, is the committed step of its pharmacology.',
        iconName: 'ArrowRightLeft',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It pushes out the body’s own noradrenaline',
        laymanDesc:
          'Inside the nerve ending it displaces the stored signalling chemical into the gap between nerve and vessel. The vessel then receives a much stronger version of the message it normally gets.',
        molecularDetail:
          'Displacement of vesicular noradrenaline into the synaptic cleft produces indirect alpha-1 agonism at the vascular smooth muscle. Because the transmitter released is the body’s own, the effect is not confined to the nose: it is a generalised sympathomimetic action expressed most visibly where the tissue is most vascular.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The blood spaces in the nose empty and the airway opens',
        laymanDesc:
          'The swollen spongy tissue in the nose shrinks as its blood vessels tighten, and there is suddenly room to breathe through. Nothing has been done to the infection or the allergy.',
        molecularDetail:
          'Alpha-1 mediated constriction of the venous sinusoids in the turbinates reduces mucosal volume and nasal airway resistance. The effect is purely mechanical and purely temporary; viral replication, inflammatory mediator release and mucus production are unaffected.',
        iconName: 'Wind',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A small measured improvement, and an unsettled question about how much it matters',
        laymanDesc:
          'Pooled across trials, repeated doses improved how blocked people said they felt by a small amount. The reviewers were explicit that they could not say whether a difference that size is one a person would notice as worthwhile.',
        molecularDetail:
          'Standardised mean difference 0.49 (95% CI 0.07 to 0.92) for multi-dose against placebo, graded low-quality and pooled from two studies. Ten single-dose trials could not be pooled at all because congestion was measured and reported too diversely.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The systemic price of an oral route',
        laymanDesc:
          'Because the drug reaches the whole body, it raises the pulse slightly, nudges the top blood pressure number, and in rare cases has been linked to two conditions in which blood flow to the brain is disturbed.',
        molecularDetail:
          'Pooled systolic rise 0.99 mm Hg and heart rate rise 2.83 beats per minute across 45 treatment arms in 1,285 patients, greater with higher doses and immediate-release preparations. European regulators contraindicated the drug in severe or uncontrolled hypertension and severe renal disease in 2024 after reviewing posterior reversible encephalopathy syndrome and reversible cerebral vasoconstriction syndrome.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD009612.pub2 — nasal decongestants in monotherapy for the common cold',
        phase: 'Systematic review and meta-analysis of 15 randomised trials',
        sampleSize: 1838,
        primaryEndpoint: 'Subjective symptom scores for nasal congestion against placebo',
        endpointMet: true,
        statisticalPValue:
          'Multi-dose SMD 0.49 (95% CI 0.07 to 0.92), p=0.02, low-quality evidence; single-dose not poolable',
        unreportedAdverseSignals:
          'The multi-dose pooling rested on two studies, one oral and one topical, so oral and topical effects could not be separated. Fourteen of fifteen trials enrolled adults only.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Salerno 2005 meta-analysis (Arch Intern Med 165:1686-1694)',
        phase: 'Meta-analysis of 24 randomised placebo-controlled trials, 45 treatment arms',
        sampleSize: 1285,
        primaryEndpoint: 'Systolic and diastolic blood pressure and heart rate against placebo',
        endpointMet: true,
        statisticalPValue:
          'SBP +0.99 mm Hg (95% CI 0.08 to 1.90); HR +2.83 beats/min (95% CI 2.0 to 3.6); DBP +0.63 mm Hg (95% CI -0.10 to 1.35, not significant)',
        unreportedAdverseSignals:
          'English-language trials only. Trials of this size and duration cannot detect the rare cerebrovascular events that later prompted European contraindications.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD009612.pub2 adverse-event analysis',
        phase: 'Meta-analysis of 7 randomised trials reporting adverse events',
        sampleSize: 1838,
        primaryEndpoint: 'Adverse events, decongestant against placebo',
        endpointMet: true,
        statisticalPValue:
          'Odds ratio 0.98 (95% CI 0.68 to 1.40), p=0.90; oral only OR 0.95 (95% CI 0.65 to 1.39), p=0.80; low-quality evidence',
        unreportedAdverseSignals:
          'Short-term adult data. Absence of a signal at this scale is not evidence about rare events.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Standardised mean difference 0.49 (95% CI 0.07 to 0.92) in subjective nasal congestion for multiple doses against placebo, graded low-quality',
        'Systolic blood pressure +0.99 mm Hg and heart rate +2.83 beats per minute across 45 treatment arms in 1,285 patients',
        'Systolic rise of similar magnitude, +1.20 mm Hg (95% CI 0.56 to 1.84), in patients with controlled hypertension',
        'Adverse events 125 per 1,000 on treatment against 126 per 1,000 on placebo, odds ratio 0.98 (95% CI 0.68 to 1.40)',
      ],
      unsupportedInferences: [
        'That the effect measured in adults applies to children — fourteen of fifteen trials enrolled adults only and the reviewers say it is undetermined',
        'That the small standardised mean difference is a difference a patient would call worthwhile — no minimal clinically important difference is defined for this outcome',
        'That the drug is dangerous to blood pressure in the way its reputation suggests — the pooled systolic rise is about one millimetre of mercury',
        'That the open-shelf product that replaced it did the same job — the FDA has proposed removing oral phenylephrine as not effective',
      ],
      whatFailedInitially: [
        'Ten single-dose randomised trials could not be pooled at all because congestion was measured and reported too diversely',
        'Europe contraindicated the drug in severe or uncontrolled hypertension and severe renal disease in 2024, after reviewing two cerebrovascular syndromes',
        'The 2005 diversion-control law moved it behind the counter, and the substitute that filled the shelf is now proposed for removal as ineffective',
        'The multi-dose efficacy conclusion rests on two studies, one of them topical, which is thin ground for a product sold in the hundreds of millions',
      ],
      realWorldOutcome: [
        'Marketed in the United States since 1963 and still the only oral decongestant on the monograph that the FDA has not proposed removing',
        'Sold behind the pharmacy counter since 2006 with identification, logbook and quantity limits under the Combat Methamphetamine Epidemic Act',
        'Contraindicated in the European Union since March 2024 in severe or uncontrolled hypertension and in severe kidney disease',
        'Cheap and generic at $0.0785 per unit across 33 listed products in the CMS acquisition survey',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, extended-release tablet and liquid, sold from behind the pharmacy counter',
      description:
        'Taken by mouth, so the vasoconstriction it produces is systemic rather than confined to the nose. Immediate-release preparations produced larger blood pressure rises than extended-release in the pooled analysis. Purchase requires photographic identification and a logbook entry, with daily and monthly quantity limits.',
      safetyProfile:
        'Short-term adverse events in randomised trials were indistinguishable from placebo. The label forbids use with a prescription monoamine oxidase inhibitor or within two weeks of stopping one, and directs people with heart disease, high blood pressure, thyroid disease, diabetes or difficulty passing urine from prostatic enlargement to ask a doctor first; it tells users to stop for nervousness, dizziness or sleeplessness, or if symptoms persist beyond seven days or occur with fever. Since March 2024 the European Union contraindicates it in severe or uncontrolled hypertension and in severe acute or chronic kidney disease, after a review of posterior reversible encephalopathy syndrome and reversible cerebral vasoconstriction syndrome.',
    },
    commonQuestions: [
      {
        q: 'Why do I have to ask the pharmacist for it?',
        a: 'Because it is one chemical step away from methamphetamine. The Combat Methamphetamine Epidemic Act of 2005 was signed in March 2006 and the DEA implemented retail controls later that year: products containing pseudoephedrine moved behind the counter, purchasers show identification and sign a logbook, and daily and monthly quantities are capped. Nothing about the drug’s safety or effectiveness prompted this; it is a diversion-control measure. What it changed in practice is what sits on the open shelf, and that is the more consequential part of the story.',
      },
      {
        q: 'Is the version on the open shelf just as good?',
        a: 'The FDA has proposed removing it. When pseudoephedrine went behind the counter, manufacturers reformulated the open-shelf products around oral phenylephrine. On 8 November 2024 the FDA announced a proposed administrative order to amend the cough-and-cold monograph and remove orally administered phenylephrine hydrochloride and phenylephrine bitartrate as nasal decongestant active ingredients, stating in the announcement that they are not effective. The order is proposed rather than final as of this audit. Pseudoephedrine was not included in that action.',
        auditNote:
          'The pharmacology behind this is that oral phenylephrine is heavily metabolised in the gut wall and liver, so very little of a swallowed dose reaches the circulation. The same molecule sprayed into the nose is a different proposition.',
      },
      {
        q: 'How well does it actually work?',
        a: 'A little, and the evidence is thin. The Cochrane review pooled fifteen randomised trials in 1,838 people. For repeated doses it found subjective congestion significantly better than placebo about three hours after the last dose, with a standardised mean difference of 0.49 — which the authors classed as a small effect, graded the evidence low quality, and noted rested on only two studies. For single doses, the ten available trials measured congestion so differently from each other that pooling was impossible and no conclusion could be drawn. There is no agreed threshold for what size of change on a congestion score a patient would call worthwhile, so the reviewers could not say whether this one is.',
      },
      {
        q: 'I have high blood pressure. Is it really that risky?',
        a: 'The average effect is much smaller than the reputation. A meta-analysis of 24 randomised placebo-controlled trials with 45 treatment arms and 1,285 patients measured an average systolic rise of 0.99 mm Hg and a heart rate rise of 2.83 beats per minute, with no significant change in diastolic pressure. In people whose hypertension was controlled, the systolic rise was 1.20 mm Hg. Higher doses and immediate-release forms raised it more. That said, an average is not a promise about an individual, and since March 2024 the European Union has contraindicated the drug outright in severe or uncontrolled hypertension after reviewing two rare brain blood-flow syndromes. The United States label stops short of that and tells people with high blood pressure to ask a doctor first.',
        auditNote:
          'The two positions are not in conflict. The meta-analysis measures the average haemodynamic effect; the European action responds to rare severe events that a trial programme of this size could not detect.',
      },
      {
        q: 'Can I give it to my child?',
        a: 'The evidence does not answer that question. Of the fifteen randomised trials in the Cochrane review, fourteen enrolled adults aged 18 and over only. The authors concluded in plain terms that the effectiveness and safety of nasal decongestants in children remain to be determined. Separately, the FDA announced in 2011 that it intended to act against unapproved oral cold, cough and allergy products, noting that many were inappropriately labelled for use in infants and young children.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Deckx L, De Sutter AI, Guo L, Mir NA, van Driel ML. Nasal decongestants in monotherapy for the common cold. Cochrane Database Syst Rev 2016;10:CD009612',
        identifier: '10.1002/14651858.CD009612.pub2',
        kind: 'doi',
      },
      {
        label:
          'Salerno SM, Jackson JL, Berbano EP. Effect of oral pseudoephedrine on blood pressure and heart rate: a meta-analysis. Arch Intern Med 2005;165:1686-1694',
        identifier: '10.1001/archinte.165.15.1686',
        kind: 'doi',
      },
      {
        label:
          'FDA. Amending Over-the-Counter Monograph M012: Cold, Cough, Allergy, Bronchodilator, and Antiasthmatic Drug Products — proposed order OTC000036 removing orally administered phenylephrine as not effective. 89 FR 88787, 8 November 2024',
        identifier:
          'https://www.federalregister.gov/documents/2024/11/08/2024-25910/amending-over-the-counter-monograph-m012-cold-cough-allergy-bronchodilator-and-antiasthmatic-drug',
        kind: 'regulatory',
      },
      {
        label:
          'DEA. Implementation of the Combat Methamphetamine Epidemic Act of 2005; Retail Sales. 85 FR 68450, 29 October 2020',
        identifier:
          'https://www.federalregister.gov/documents/2020/10/29/2020-19311/implementation-of-the-combat-methamphetamine-epidemic-act-of-2005-retail-sales-notice-of-transfers',
        kind: 'regulatory',
      },
      {
        label:
          'European Medicines Agency. Pseudoephedrine-containing medicinal products — referral outcome: new contraindications in severe or uncontrolled hypertension and severe renal disease, following review of PRES and RCVS',
        identifier:
          'https://www.ema.europa.eu/en/medicines/human/referrals/pseudoephedrine-containing-medicinal-products',
        kind: 'regulatory',
      },
      {
        label:
          'FDA. Drugs for Human Use; Unapproved and Misbranded Oral Drugs Labeled for Prescription Use and Offered for Relief of Symptoms of Cold, Cough, or Allergy; Enforcement Action Dates. 76 FR 11794, 3 March 2011',
        identifier:
          'https://www.federalregister.gov/documents/2011/03/03/2011-4703/drugs-for-human-use-unapproved-and-misbranded-oral-drugs-labeled-for-prescription-use-and-offered',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 7028 — pseudoephedrine structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/7028',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Guaifenesin — the only expectorant American regulation recognises, sold on the promise that
  //    it thins mucus, with the direct measurement of mucus finding no effect at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'guaifenesin',
    name: 'Guaifenesin',
    tradeName: 'Mucinex / Mucus Relief',
    sponsor:
      'Reckitt Benckiser holds the extended-release applications — NDA 021282 (Mucinex, approved 12 July 2002), NDA 021620 (Mucinex DM, 29 April 2004) and NDA 021585 (Mucinex D, 22 June 2004); immediate-release products are sold under the over-the-counter monograph by many labellers',
    targetGene: 'None identified',
    targetProtein:
      'No molecular target has been established. The proposed action is reflex stimulation of airway secretion through gastric vagal afferents, a mechanism inherited from the ipecac tradition rather than demonstrated for this molecule',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Helps loosen phlegm (mucus) and thin bronchial secretions to rid the bronchial passageways of bothersome mucus and make coughs more productive',
    patientFriendlyIndication: 'A chesty cough with mucus you are trying to clear',
    anatomicalSite:
      'Proposed rather than demonstrated: gastric mucosa, via a vagal reflex to airway submucosal glands. Direct measurement of airway secretions has not confirmed an effect',
    conditionContext: {
      conditionExplainer:
        'A productive cough is the airway clearing itself. Mucus traps debris and infection, and coughing moves it up and out. The theory behind an expectorant is that thinner, more copious mucus is easier to move, so the cough does its job faster.',
      whyItMatters:
        'That theory is old, plausible, and has never been confirmed by direct measurement in this molecule. Guaifenesin is nonetheless the sole ingredient American regulation recognises as an expectorant, which makes it the clearest case on this shelf of a claim that outran its evidence and then became a regulatory category.',
      whoTakesThis:
        'Adults and children aged 12 and over for the extended-release products, sold without a prescription. It appears in a large fraction of combination cough and cold products.',
      clinicalGoals:
        'Thinner mucus and a more productive cough. Both have been measured directly, and neither measurement supports the claim.',
    },
    oneSentenceVerdict:
      'The only active ingredient the FDA’s over-the-counter monograph recognises as an expectorant, sold on the claim that it thins mucus — and when 378 people with acute respiratory infection were given the recommended extended-release amount for a week and their sputum was measured, there was no difference from placebo in volume (p=0.41), percent solids (p=0.69), viscosity (p=0.45), elasticity (p=0.71), interfacial tension (p=0.88) or mechanical impedance (p=0.75).',
    laymanHowItWorks:
      'The idea is that the drug irritates the stomach lining slightly, and a nerve reflex from stomach to airway makes the glands in your chest produce more, thinner fluid — so the mucus becomes easier to cough up. That is the theory the whole product category rests on. When researchers actually collected and measured people’s sputum on the drug, it was not thinner, there was no more of it, and it did not flow any differently.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 38,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.0903 per unit, median across 189 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Low',
      openPatentNotes:
        'The molecule itself is unpatentable and ancient; what was protected was the extended-release tablet, approved as NDA 021282 on 12 July 2002. Generic extended-release versions followed after litigation, and the CMS acquisition survey now lists 189 separate guaifenesin products — the largest number for any drug in this group. 21 CFR 341.18 names guaifenesin as the expectorant active ingredient of the over-the-counter monograph, and no other ingredient holds that status.',
      costSource: {
        label:
          'No published cost-of-production study exists for guaifenesin; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 189 listed guaifenesin products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'There is no second expectorant to compare against, because regulation recognises only this one. The comparison set is therefore made up of things that address a cough by a different route, plus water — and the Cochrane review that looked at the whole over-the-counter cough shelf concluded there is no good evidence for or against any of it.',
      conventionalRx: [
        {
          name: 'Dextromethorphan',
          class: 'Central antitussive — suppresses the cough rather than assisting it',
          howItCompares:
            'Aims at the opposite thing. Where guaifenesin is supposed to make coughing more effective, dextromethorphan is supposed to make it happen less. The Cochrane review found variable results across six adult antitussive trials and none of the three paediatric antitussive datasets beat placebo. It also found adverse effects were more numerous in participants taking preparations containing dextromethorphan.',
          typicalCost:
            'No median acquisition cost is listed for dextromethorphan alone in the CMS survey; it appears in combination products',
          prosAndCons:
            'Pros: aims at the symptom people actually want stopped. Cons: no better than placebo in children in the pooled review, more adverse effects, and a recognised pattern of adolescent misuse.',
        },
        {
          name: 'Honey',
          class: 'Demulcent — coats and soothes the pharynx',
          howItCompares:
            'The only intervention in the Cochrane review’s paediatric section that beat placebo. The reviewers record that one trial found three types of honey more effective than placebo over a three-day period, against a paediatric section in which antitussives, antihistamines and antihistamine-decongestant combinations were all no better than placebo.',
          typicalCost: 'No drug acquisition cost; sold as food',
          prosAndCons:
            'Pros: the best-supported option in the paediatric part of the review, and cheap. Cons: a single trial, short follow-up, and it must never be given to infants under one year because of the risk of botulism.',
        },
        {
          name: 'Hypertonic saline nebulisation',
          class: 'Osmotic mucoactive agent, delivered directly to the airway',
          howItCompares:
            'Acts on airway mucus where the mucus is, rather than through a proposed reflex from the stomach. It is used in cystic fibrosis and bronchiolitis rather than for a common cold, and it requires a nebuliser, so it is not an over-the-counter substitute.',
          typicalCost:
            '$1.32 per mL of acetylcysteine at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026), as the nearest listed mucoactive comparator',
          prosAndCons:
            'Pros: a directly delivered mucoactive with a measurable physical mechanism. Cons: needs equipment and a clinical indication; can provoke bronchospasm; not a self-care option for an ordinary cough.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Drink water',
          action: 'Maintain fluid intake while you have a productive cough.',
          patientImpact:
            'Hydration is the intervention the expectorant claim is modelled on. The direct measurement of sputum hydration on guaifenesin found no difference from placebo, so the drug does not appear to be doing what fluid is supposed to do.',
          clinicalPrecaution:
            'This is not evidence that drinking extra water thins mucus either — that claim is also weakly supported. It is a note that the drug has not been shown to outperform doing nothing in particular.',
        },
        {
          name: 'Check whether the product contains anything else',
          action:
            'Read the active ingredients panel: guaifenesin is frequently sold combined with dextromethorphan, pseudoephedrine or paracetamol.',
          patientImpact:
            'The combination products carry the risks of every ingredient in them. Mucinex DM adds dextromethorphan and Mucinex D adds pseudoephedrine, and each brings its own warnings and its own evidence base.',
          clinicalPrecaution:
            'Doubling up on two branded products that both contain the same active ingredient is a common route to exceeding a limit without noticing, particularly where paracetamol is involved.',
        },
        {
          name: 'Watch the calendar rather than the mucus',
          action:
            'Note how long the cough has lasted and whether fever or breathlessness is present.',
          patientImpact:
            'Acute cough from a viral infection resolves on its own. In the trial that measured it, symptoms improved to a similar degree over time on drug and on placebo — the improvement was real, and it was the illness ending.',
          clinicalPrecaution:
            'A cough persisting beyond a few weeks, or accompanied by fever, breathlessness, weight loss or blood, is a reason to be assessed rather than to buy another packet.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=CC=CC=C1OCC(CO)O',
      chemicalFormula: 'C10H14O4',
      molecularWeight: '198.22 g/mol',
      targetReceptorAffinity:
        'None reported, because no receptor has been identified. Guaifenesin is glyceryl guaiacolate, a simple ether of guaiacol and glycerol, and it is the rare marketed drug for which the field cannot be filled in — there is no binding constant to quote, no target to quote it against, and the proposed mechanism is a reflex rather than a molecular interaction.',
      structureSource: {
        label: 'PubChem CID 3516 (guaifenesin) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3516',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gua-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Guaiacol identity and residual limit',
          description:
            'Confirm the guaiacol starting material and set the limit on how much of it can remain. Guaiacol is the smoky-phenolic component of wood creosote; it is what gives the finished drug its taste and, in excess, its irritancy, and it is the single specification that most affects whether a syrup is tolerable to swallow.',
          reagentsAndBuffer:
            'Guaiacol reference standard, gas chromatography with flame ionisation detection, ultraviolet spectrophotometry at 275 nm, loss on drying',
        },
        {
          id: 'gua-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ring-opening of glycidol onto the guaiacol phenoxide',
          description:
            'Deprotonate guaiacol and open glycidol at the less hindered carbon to give the 3-(2-methoxyphenoxy)propane-1,2-diol. Two things make this cheap: both starting materials are commodity chemicals, and the product is racemic and sold as such, so no resolution step is needed. The absence of a resolution is a large part of why the finished drug costs nine cents a unit.',
          dependsOnStepId: 'gua-w1',
          reagentsAndBuffer:
            'Guaiacol, glycidol or 3-chloro-1,2-propanediol, sodium or potassium hydroxide, water or toluene, 60 to 100 degrees Celsius with controlled addition to limit polymerisation',
        },
        {
          id: 'gua-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation and removal of the regioisomer',
          description:
            'Crystallise the diol away from the minor regioisomer produced by attack at the hindered epoxide carbon, and from residual guaiacol. The product is a low-melting solid, so the crystallisation window is narrow and the process is run on cooling profile rather than on solvent choice.',
          dependsOnStepId: 'gua-w2',
          reagentsAndBuffer:
            'Recrystallisation from water or toluene with controlled cooling, HPLC with ultraviolet detection for regioisomer content, melting point determination, Karl Fischer titration',
        },
        {
          id: 'gua-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Airway epithelial culture with mucin secretion readout',
          description:
            'Apply the compound to differentiated primary human bronchial epithelial cells at an air-liquid interface and measure mucin output. This is the experiment that would demonstrate a direct action on airway secretion, and its absence from the literature is the reason the mechanism is stated as a reflex: nobody has shown the molecule doing anything to airway cells at concentrations a person achieves.',
          dependsOnStepId: 'gua-w3',
          reagentsAndBuffer:
            'Primary human bronchial epithelial cells differentiated at air-liquid interface, ALI medium, apical washes collected at fixed intervals, MUC5AC and MUC5B enzyme-linked immunosorbent assay, ATP or interleukin-13 as positive secretagogue controls',
        },
        {
          id: 'gua-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sputum rheology: viscosity, elasticity, interfacial tension and percent solids',
          description:
            'Collect sputum and measure its physical properties on an instrument rather than asking the patient how thick it feels. This is the assay that decides the expectorant claim, and it is the one that has been done in a proper randomised trial: 378 subjects, and no difference from placebo on any measure.',
          dependsOnStepId: 'gua-w4',
          reagentsAndBuffer:
            'Magnetic microrheometer for viscoelasticity, du Nouy ring or maximum bubble pressure tensiometry for interfacial tension, gravimetric drying for percent solids, 24-hour timed sputum collection for volume',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gua-a1',
        category: 'failed',
        title: 'Sputum was measured directly in 378 people, and nothing changed',
        laymanSummary:
          'A trial gave the recommended extended-release amount for a week to people with a chesty cough, collected their sputum, and put it on instruments. It was not thinner, there was not more of it, and it did not flow differently. Symptoms improved on the drug and on the dummy at the same rate.',
        technicalDetails:
          'An eight-day multi-centre randomised trial gave two 600 mg extended-release guaifenesin tablets twice daily or placebo for one week to 378 otherwise healthy adolescents and adults with productive cough from an acute respiratory infection of up to five days’ duration, requiring at least two of cough, thickened mucus and chest congestion. Single sputum samples were taken on days 1, 3, 4 and 8, with 24-hour collections on days 1 and 4. There were no significant differences between guaifenesin and placebo for sputum volume (p=0.41), percent solids (p=0.69), interfacial tension (p=0.88), elasticity (p=0.71), viscosity (p=0.45) or mechanical impedance (p=0.75). Symptoms improved to a similar degree in both groups over time. The authors concluded the recommended amount is unlikely to be an expectorant or a mucolytic in acute respiratory infection.',
        evidenceSource:
          'Hoffer-Schaefer A, Rozycki HJ, Yopp MA, Rubin BK. Respir Care 2014;59:631-636 (NCT01046136)',
        doi: '10.4187/respcare.02640',
        measuredMetric:
          'Sputum volume, percent solids, interfacial tension, elasticity, viscosity and mechanical impedance against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'gua-a2',
        category: 'conclusion_shift',
        title:
          'A tape recorder heard no change in coughing while the questionnaire reported thinner mucus',
        laymanSummary:
          'In a 1982 trial, coughs were recorded on tape and counted, and the drug made no difference to how much people coughed. The same patients filled in a questionnaire, and almost all of them said their mucus felt thinner. The subjective answer is the one the product claim was built on.',
        technicalDetails:
          'Forty-two patients with acute respiratory disease had their coughs recorded on tape over a 24-hour baseline and a 36-hour treatment period, comparing a guaifenesin preparation with its syrup vehicle in double-blind fashion, with efficacy assessed between equivalent six-hour periods on successive days to control for the pronounced diurnal variation in cough frequency. No antitussive effect was demonstrated. A questionnaire given to 65 patients including those 42 found that 25 of 26 patients with productive cough on guaifenesin (96%) reported a decrease in sputum thickness against 13 of 24 (54%) on vehicle (p=0.01, Fisher exact test), and 23 of 26 (88%) reported reduced sputum quantity against 15 of 24 (62.5%) on vehicle (p=0.07). The paper also records that the diurnal variation the tape recorder detected was not apparent in the patients’ own estimates of how often they coughed.',
        evidenceSource:
          'Kuhn JJ, Hendley JO, Adams KF, Clark JW, Gwaltney JM Jr. Chest 1982;82:713-718',
        doi: '10.1378/chest.82.6.713',
        inferredClaim:
          'That patients reporting thinner mucus establishes that the mucus is thinner — the objective cough count in the same trial was null, and the instrumented sputum measurement thirty-two years later found no change in any physical property',
        auditFlag: 'contested',
      },
      {
        id: 'gua-a3',
        category: 'measured',
        title:
          'It did reduce cough reflex sensitivity in people with a cold — in 14 subjects, by a route nobody expected',
        laymanSummary:
          'A small study measured how much capsaicin it took to make someone cough five times. People with a cold needed more of it after taking the drug, so their cough reflex was less twitchy. Healthy volunteers showed no change at all.',
        technicalDetails:
          'A randomised, double-blind, placebo-controlled crossover gave a single 400 mg guaifenesin capsule or matched placebo to 14 subjects with acute viral upper respiratory infection and 14 healthy volunteers, with capsaicin cough challenge 1 to 2 hours later. Among subjects with infection, mean log C5 — the concentration inducing five or more coughs — was 0.92 ± 0.17 after guaifenesin against 0.66 ± 0.14 after placebo (p=0.028). No effect was seen in healthy volunteers. The authors proposed either a central antitussive effect or a peripheral effect in which increased sputum volume shields cough receptors, and noted explicitly that studies of the drug’s action had yielded contrasting results.',
        evidenceSource: 'Dicpinigaitis PV, Gayle YE. Chest 2003;124:2178-2181',
        doi: '10.1378/chest.124.6.2178',
        measuredMetric:
          'Log capsaicin concentration inducing five or more coughs, guaifenesin against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'gua-a4',
        category: 'inferred',
        title: 'Cochrane looked at the whole shelf and found no good evidence either way',
        laymanSummary:
          'The systematic review of every over-the-counter cough medicine tested against a dummy found the trials too few, too different and too poorly reported to combine. Of the three adult trials of this drug, one showed benefit and two did not.',
        technicalDetails:
          'The Cochrane review of over-the-counter medications for acute cough in community settings included 29 placebo-controlled randomised trials in 4,835 people, 19 in adults and 10 in children. The authors judged pooling inappropriate because of the small number of trials in each category, the limited quantitative data and marked differences in participants, interventions and outcome measurement, and noted that risk-of-bias assessment was limited by poor reporting particularly in earlier studies. Three adult trials compared guaifenesin with placebo: one indicated significant benefit and two did not. No studies using expectorants in children met the inclusion criteria at all. The overall conclusion was that there is no good evidence for or against the effectiveness of over-the-counter medicines in acute cough.',
        evidenceSource:
          'Smith SM, Schroeder K, Fahey T. Cochrane Database Syst Rev 2014;11:CD001831',
        doi: '10.1002/14651858.CD001831.pub5',
        inferredClaim:
          'That an ingredient sold in 189 separate products across a shelf worth billions rests on a settled evidence base — the systematic review found no good evidence for or against, and no paediatric expectorant trial that met inclusion criteria at all',
        auditFlag: 'contested',
      },
      {
        id: 'gua-a5',
        category: 'inferred',
        title:
          'It is the only recognised expectorant, and there is no molecular target to describe',
        laymanSummary:
          'Federal regulation names exactly one ingredient as an expectorant, and this is it. Nobody has identified what the molecule binds to in the body. The mechanism given in textbooks is a nerve reflex from the stomach, inherited from an older class of medicines.',
        technicalDetails:
          '21 CFR 341.18 states that the expectorant active ingredient of the monograph is guaifenesin when used within the specified dosage limits — no other ingredient holds that status. No receptor, enzyme or transporter has been established as a target. The mechanism usually offered, reflex stimulation of bronchial secretion via gastric vagal afferents, descends from the ipecac and ammonium chloride tradition and has not been demonstrated for this molecule at achievable plasma concentrations; the direct test of its consequence, sputum rheology, was negative in 378 subjects. This is a regulatory category with one occupant and no mechanism, which is a different situation from a drug whose mechanism is disputed.',
        evidenceSource:
          '21 CFR 341.18, Expectorant active ingredient; Hoffer-Schaefer A et al., Respir Care 2014;59:631-636',
        inferredClaim:
          'That recognition as the monograph expectorant implies a demonstrated expectorant action — the regulation defines the category, and the direct measurement of the effect it names has been negative',
        auditFlag: 'contested',
      },
      {
        id: 'gua-a6',
        category: 'measured',
        title:
          'Both groups got better, and that is the result most often mistaken for the drug working',
        laymanSummary:
          'In the trial that measured sputum, people on the drug improved over the week. So did people on the dummy tablet, by the same amount. Acute cough from a virus resolves on its own, which is why an untreated comparison group is the only way to see whether a medicine did anything.',
        technicalDetails:
          'In the 378-subject trial, symptoms in both the guaifenesin and placebo groups improved to a similar degree over the eight days. Of 188 subjects randomised to guaifenesin and 190 to placebo, 151 and 144 respectively completed the full protocol. The natural history of acute viral cough — improvement over one to two weeks regardless of treatment — is the dominant effect in any uncontrolled observation of this drug, and it is what a person taking it experiences.',
        evidenceSource: 'Hoffer-Schaefer A et al., Respir Care 2014;59:631-636 (NCT01046136)',
        doi: '10.4187/respcare.02640',
        measuredMetric: 'Cold symptom improvement over 8 days, guaifenesin against placebo',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed and absorbed quickly',
        laymanDesc:
          'A small, water-soluble molecule that enters the blood fast and leaves fast. The extended-release tablet exists because the plain form clears too quickly to be dosed conveniently.',
        molecularDetail:
          'Glyceryl guaiacolate is rapidly absorbed with a short elimination half-life, metabolised largely to beta-(2-methoxyphenoxy)-lactic acid and excreted renally. The bilayer extended-release tablet approved as NDA 021282 in 2002 was the pharmaceutical innovation; the molecule itself dates to the 1940s.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The proposed step: mild gastric irritation',
        laymanDesc:
          'The classical explanation is that the drug slightly irritates the stomach lining. This is where the mechanism becomes a proposal rather than an observation.',
        molecularDetail:
          'The gastric-irritant model is inherited from ipecac and ammonium chloride, agents that provoke secretion at doses close to emetic ones. No study has demonstrated that guaifenesin produces gastric afferent activation at the plasma concentrations reached from an ordinary tablet.',
        iconName: 'HelpCircle',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The proposed step: a vagal reflex to the airway glands',
        laymanDesc:
          'The irritation is supposed to travel by nerve to the glands lining the airways and make them release more, thinner fluid. Nobody has recorded that reflex happening with this drug.',
        molecularDetail:
          'The postulated pathway runs from gastric vagal afferents through brainstem nuclei to efferent parasympathetic innervation of bronchial submucosal glands. There is no established receptor for guaifenesin anywhere along it, and no direct measurement of increased submucosal gland output in humans on the drug.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The measured step: sputum, unchanged',
        laymanDesc:
          'This is where the theory meets an instrument. Sputum collected from people taking the drug for a week was no thinner, no more copious and no different in how it flowed than sputum from people taking a dummy.',
        molecularDetail:
          'In 378 randomised subjects, guaifenesin against placebo gave p=0.41 for sputum volume, p=0.69 for percent solids, p=0.88 for interfacial tension, p=0.71 for elasticity, p=0.45 for viscosity and p=0.75 for mechanical impedance. Interfacial tension and mechanical impedance are the properties most closely tied to whether mucus can be cleared by cough, and neither moved.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'One measured effect that is not the advertised one',
        laymanDesc:
          'A small study did find something: in people with a cold, the cough reflex became less easily triggered. It had no effect in healthy volunteers, and it is not what the packet claims.',
        molecularDetail:
          'Log C5 on capsaicin challenge rose from 0.66 ± 0.14 on placebo to 0.92 ± 0.17 on guaifenesin in 14 subjects with upper respiratory infection (p=0.028), with no change in 14 healthy volunteers. The authors offered a central antitussive action or a peripheral shielding effect as candidate explanations, without distinguishing between them.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the person experiences is the infection ending',
        laymanDesc:
          'Coughs from a virus get better over one to two weeks whatever you take. In the trial, drug and dummy groups improved by the same amount over the same eight days.',
        molecularDetail:
          'Symptom trajectories in the guaifenesin and placebo arms of the 378-subject trial were similar throughout. The Cochrane review of 29 placebo-controlled trials in 4,835 people concluded there is no good evidence for or against the effectiveness of over-the-counter cough medicines in acute cough.',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01046136 (Hoffer-Schaefer 2014, Respir Care 59:631-636)',
        phase: 'Multi-centre, randomised, double-blind, placebo-controlled, 8 days',
        sampleSize: 378,
        primaryEndpoint:
          'Sputum volume and physical properties, and cold symptoms, on extended-release guaifenesin against placebo',
        endpointMet: false,
        statisticalPValue:
          'Volume p=0.41, percent solids p=0.69, interfacial tension p=0.88, elasticity p=0.71, viscosity p=0.45, mechanical impedance p=0.75; symptoms improved similarly in both arms',
        unreportedAdverseSignals:
          '151 of 188 on guaifenesin and 144 of 190 on placebo completed the protocol, so roughly a fifth of each arm did not. Sputum collection depends on subjects being able to produce a sample.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Kuhn 1982 (Chest 82:713-718)',
        phase: 'Randomised, double-blind, vehicle-controlled, objective cough counting',
        sampleSize: 42,
        primaryEndpoint:
          'Cough frequency by tape recording over a 24-hour baseline and 36-hour treatment period',
        endpointMet: false,
        statisticalPValue:
          'No antitussive effect demonstrated on recorded cough counts; on questionnaire, 96% against 54% reported decreased sputum thickness (p=0.01) and 88% against 62.5% reported reduced quantity (p=0.07)',
        unreportedAdverseSignals:
          'The objective and subjective results point in opposite directions in the same patients, and the paper notes that patients’ own estimates of cough frequency failed to detect the diurnal variation the recorder measured.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Dicpinigaitis 2003 (Chest 124:2178-2181)',
        phase: 'Randomised, double-blind, placebo-controlled crossover, capsaicin challenge',
        sampleSize: 28,
        primaryEndpoint:
          'Log capsaicin concentration inducing five or more coughs, 1 to 2 hours after a single 400 mg dose',
        endpointMet: true,
        statisticalPValue:
          'In subjects with upper respiratory infection, log C5 0.92 ± 0.17 against 0.66 ± 0.14 on placebo (p=0.028); no effect in healthy volunteers',
        unreportedAdverseSignals:
          'Fourteen subjects per group, single dose, a challenge model rather than a clinical cough outcome. The effect measured is cough suppression, which is not the expectorant claim on the label.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cochrane CD001831.pub5 — over-the-counter medications for acute cough',
        phase: 'Systematic review of 29 placebo-controlled randomised trials',
        sampleSize: 4835,
        primaryEndpoint: 'Cough outcomes against placebo in community settings',
        endpointMet: false,
        statisticalPValue:
          'Pooling judged inappropriate. Of three adult guaifenesin trials, one indicated significant benefit and two did not; no paediatric expectorant trial met inclusion criteria',
        unreportedAdverseSignals:
          'Risk-of-bias assessment was limited by poor reporting, particularly in the earlier studies. Twenty-one trials reported adverse effects, with higher numbers in preparations containing antihistamines and dextromethorphan.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No difference from placebo in sputum volume, percent solids, interfacial tension, elasticity, viscosity or mechanical impedance in 378 randomised subjects',
        'No antitussive effect on tape-recorded cough counts in 42 patients in 1982',
        'A rise in log capsaicin C5 from 0.66 to 0.92 in 14 subjects with upper respiratory infection (p=0.028), and no effect in 14 healthy volunteers',
        '96% against 54% of patients reporting decreased sputum thickness on questionnaire (p=0.01), in the same 1982 trial whose objective measure was null',
      ],
      unsupportedInferences: [
        'That the drug thins mucus — the property was measured directly on an instrument and did not change',
        'That being the monograph’s sole recognised expectorant reflects a demonstrated expectorant action',
        'That the gastric-vagal reflex mechanism operates at concentrations reached from a tablet — it is inherited from ipecac and has not been shown for this molecule',
        'That patient-reported improvement in mucus thickness measures mucus thickness rather than the experience of an illness resolving',
      ],
      whatFailedInitially: [
        'Every physical property of sputum measured in the 378-subject trial was unchanged, with p-values from 0.41 to 0.88',
        'The 1982 objective cough-counting trial found no antitussive effect while the questionnaire in the same patients did',
        'Two of the three adult guaifenesin trials in the Cochrane review found no benefit',
        'No paediatric expectorant trial met the Cochrane inclusion criteria at all, in a category sold widely for children',
      ],
      realWorldOutcome: [
        'Named at 21 CFR 341.18 as the expectorant active ingredient of the over-the-counter monograph, with no other ingredient holding that status',
        'The extended-release tablet approved as NDA 021282 on 12 July 2002, with combination products following in 2004',
        'The most widely marketed molecule in this batch: 189 separate products in the CMS acquisition survey at a median $0.0903 per unit',
        'Still recommended and sold at scale for a claim that direct measurement has not supported',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release bilayer tablet (600 mg), immediate-release tablet, and liquid',
      description:
        'The extended-release tablet must be swallowed whole with a full glass of water and not crushed, chewed or broken, because breaking the bilayer destroys the release profile that the application was approved on. It can be taken without regard to meals.',
      safetyProfile:
        'Adverse effects are few and mild, and this is one of the few genuinely reassuring facts about the drug. In the Cochrane review, the higher adverse event counts across the cough shelf were in preparations containing antihistamines and dextromethorphan rather than expectorants. The practical hazards attach to the combination products — pseudoephedrine in one, dextromethorphan in another — rather than to guaifenesin itself. Reported effects include nausea and vomiting, and very high intake has been associated with kidney stones containing guaifenesin metabolites.',
    },
    commonQuestions: [
      {
        q: 'Does it actually thin mucus?',
        a: 'Measured directly, no. A multi-centre randomised trial gave 378 people with a productive cough the recommended extended-release amount for a week, collected their sputum on days 1, 3, 4 and 8 with 24-hour collections on days 1 and 4, and put the samples on instruments. There was no significant difference from placebo in volume, percent solids, interfacial tension, elasticity, viscosity or mechanical impedance — the p-values run from 0.41 to 0.88. The authors concluded the recommended amount is unlikely to be an expectorant or a mucolytic in acute respiratory infection. Symptoms improved on the drug and on the placebo at the same rate.',
        auditNote:
          'Patients do report thinner mucus on it. A 1982 trial found 96% of patients on guaifenesin reported decreased sputum thickness against 54% on the vehicle. The same trial recorded their coughs on tape and found no reduction in coughing.',
      },
      {
        q: 'Then why is it the only expectorant on the shelf?',
        a: 'Because a regulation says so. 21 CFR 341.18 states that the expectorant active ingredient of the over-the-counter monograph is guaifenesin when used within the specified dosage limits, and no other ingredient holds that status. That is a fact about the structure of American drug regulation — a category with one occupant — rather than a conclusion from comparing candidates. The extended-release tablet was separately approved as a new drug application in 2002, but that approval concerns the release profile of the tablet, not a fresh demonstration that the molecule is an expectorant.',
      },
      {
        q: 'It seems to help me. Am I imagining it?',
        a: 'Something is happening, and it may not be what the label says. Two things are going on. First, acute cough from a virus improves over one to two weeks by itself, and in the trial that measured sputum, the placebo group improved just as much as the treated group. Second, there is one measured effect that is real: in a small crossover study, people with a cold needed more capsaicin to be made to cough after taking guaifenesin than after placebo, so their cough reflex was genuinely less twitchy. That is cough suppression, not expectoration, it was measured in fourteen people, and it did not happen at all in healthy volunteers.',
      },
      {
        q: 'What about the version with the letters after it?',
        a: 'Those are different drugs with different evidence. Mucinex DM adds dextromethorphan, a cough suppressant, under NDA 021620. Mucinex D adds pseudoephedrine, a decongestant, under NDA 021585. Each added ingredient brings its own warnings — pseudoephedrine is sold from behind the counter and carries cardiovascular cautions, dextromethorphan accounted for a disproportionate share of the adverse effects across the cough trials in the Cochrane review. The guaifenesin component of a combination product carries the same evidence as the guaifenesin component of a plain one.',
      },
      {
        q: 'Is there anything better for a chesty cough?',
        a: 'The systematic review that looked at the whole shelf found no good evidence for or against any of it. Twenty-nine placebo-controlled randomised trials in 4,835 people were too few per category, too different from each other and too poorly reported to pool. The one thing that came out favourably in the paediatric section was honey: a trial found three types of honey more effective than placebo over three days, in a section where antitussives, antihistamines and antihistamine-decongestant combinations were all no better than placebo. Honey must never be given to a child under one year because of the risk of botulism.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Hoffer-Schaefer A, Rozycki HJ, Yopp MA, Rubin BK. Guaifenesin has no effect on sputum volume or sputum properties in adolescents and adults with acute respiratory tract infections. Respir Care 2014;59:631-636',
        identifier: '10.4187/respcare.02640',
        kind: 'doi',
      },
      {
        label:
          'Guaifenesin extended release in acute respiratory tract infection — sputum volume and properties',
        identifier: 'NCT01046136',
        kind: 'nct',
      },
      {
        label:
          'Kuhn JJ, Hendley JO, Adams KF, Clark JW, Gwaltney JM Jr. Antitussive effect of guaifenesin in young adults with natural colds: objective and subjective assessment. Chest 1982;82:713-718',
        identifier: '10.1378/chest.82.6.713',
        kind: 'doi',
      },
      {
        label:
          'Dicpinigaitis PV, Gayle YE. Effect of guaifenesin on cough reflex sensitivity. Chest 2003;124:2178-2181',
        identifier: '10.1378/chest.124.6.2178',
        kind: 'doi',
      },
      {
        label:
          'Smith SM, Schroeder K, Fahey T. Over-the-counter (OTC) medications for acute cough in children and adults in community settings. Cochrane Database Syst Rev 2014;11:CD001831',
        identifier: '10.1002/14651858.CD001831.pub5',
        kind: 'doi',
      },
      {
        label:
          '21 CFR 341.18 — expectorant active ingredient: the active ingredient of the product is guaifenesin when used within the dosage limits',
        identifier: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-341',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: MUCINEX (guaifenesin extended-release tablet), NDA 021282, approved 12 July 2002; MUCINEX DM, NDA 021620, 29 April 2004; MUCINEX D, NDA 021585, 22 June 2004',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021282',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3516 — guaifenesin structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3516',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Benzonatate — approved in February 1958, four years before proof of efficacy became a legal
  //    requirement, and still the only non-narcotic prescription antitussive in American practice.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'benzonatate',
    name: 'Benzonatate',
    tradeName: 'Tessalon',
    sponsor:
      'Pfizer holds NDA 011210 (Tessalon), original approval 10 February 1958; the capsules dispensed today are almost entirely generic under abbreviated applications dating from 1993 onwards',
    targetGene: 'None established',
    targetProtein:
      'No molecular target has been demonstrated. The label states an action on stretch receptors in the airways, lungs and pleura; the toxicology literature attributes the drug’s systemic effects to voltage-gated sodium channel blockade by a tetracaine-like metabolite',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1958,
    indication: 'Symptomatic relief of cough',
    patientFriendlyIndication: 'A cough, of any cause',
    anatomicalSite:
      'Stated on the label as the stretch receptors of the respiratory passages, lungs and pleura — a site asserted in 1958 and not confirmed by direct human measurement since',
    conditionContext: {
      conditionExplainer:
        'Coughing is a reflex. Sensors in the airway wall detect stretch, irritation or chemicals, send a signal up the vagus nerve to the brainstem, and the brainstem orders the cough. A drug can interrupt that loop at the sensor, at the nerve, or at the brainstem.',
      whyItMatters:
        'Benzonatate is the only non-narcotic prescription cough medicine in routine American use, which is why it is reached for constantly. It is also the clearest case in this batch of a drug whose approval predates the requirement to prove that a medicine works, and a 2023 systematic review said so in those words.',
      whoTakesThis:
        'Adults and children over ten, on prescription. It must never be within reach of a young child: accidental ingestion has killed children under ten within an hour.',
      clinicalGoals:
        'Less coughing. There is no adequately powered randomised trial establishing that it achieves this, which is the central finding of the only systematic review of the drug.',
    },
    oneSentenceVerdict:
      'A liquid polyethylene-glycol ester of a para-aminobenzoic acid — chemically a relative of tetracaine — approved on 10 February 1958 on the stated mechanism of anaesthetising airway stretch receptors, whose only systematic review found 37 studies comprising 21 cohorts, 5 experimental studies and 11 case reports with high risk of bias throughout, and concluded that its approval "is founded upon evidence that would not stand up to current regulatory review"; the label meanwhile records death in children under ten within one hour of accidental ingestion.',
    laymanHowItWorks:
      'The idea is that the drug is a numbing agent, chemically close to the ones a dentist uses, and that swallowing it lets it reach the sensors in your airways and deaden them, so they stop sending the signal that triggers a cough. That is what the label says and it is what has been said since 1958. What has never been done is a measurement in a person showing those sensors being deadened, or a properly sized trial showing that people cough less on it than on a dummy capsule.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 31,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.0688 per unit, median across 39 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Low',
      openPatentNotes:
        'NDA 011210 was approved on 10 February 1958 and the 200 mg Tessalon capsule now carries a Federal Register determination that it was not discontinued or withdrawn for safety or effectiveness reasons. Generic entry began with an abbreviated application approved on 29 January 1993 and the CMS survey now lists 39 products. It remains prescription-only in the United States despite being an over-the-counter category ingredient in some other jurisdictions, which is a consequence of its 1958 approval pathway rather than of a later safety decision.',
      costSource: {
        label:
          'No published cost-of-production study exists for benzonatate; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 39 listed benzonatate products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'The comparison here is unusually stark because the incumbent has no randomised evidence at all. Every alternative listed has more, and one of them — honey — is the only intervention that beat placebo in the paediatric section of the Cochrane review of the whole cough shelf.',
      conventionalRx: [
        {
          name: 'Dextromethorphan',
          class: 'Central antitussive acting at the brainstem cough centre',
          howItCompares:
            'Interrupts the same reflex arc higher up. The Cochrane review of over-the-counter cough medicines found variable results across six adult antitussive trials and no benefit over placebo in the paediatric data, but those are trials against placebo, which benzonatate does not have.',
          typicalCost:
            'No median acquisition cost is listed for dextromethorphan alone in the CMS survey; it appears in combination products',
          prosAndCons:
            'Pros: an actual placebo-controlled trial literature, however mixed, and available without prescription. Cons: higher adverse effect counts across the cough trials, and a recognised pattern of adolescent misuse.',
        },
        {
          name: 'Codeine',
          class: 'Opioid antitussive',
          howItCompares:
            'The reference antitussive that benzonatate was developed to replace without narcotic properties. It carries respiratory depression risk, dependence liability and controlled-substance handling, all of which benzonatate genuinely avoids — which is the strongest argument for benzonatate and is an argument about safety rather than efficacy.',
          typicalCost:
            '$0.2757 per unit at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: an established antitussive mechanism. Cons: respiratory depression, dependence, contraindicated in children, and controlled-substance scheduling.',
        },
        {
          name: 'Honey',
          class: 'Demulcent',
          howItCompares:
            'The only intervention that beat placebo in the paediatric section of the Cochrane review of 29 placebo-controlled cough trials, where antitussives, antihistamines and antihistamine-decongestant combinations all failed to separate from placebo.',
          typicalCost: 'No drug acquisition cost; sold as food',
          prosAndCons:
            'Pros: the best-supported paediatric option in the review, and no poisoning risk of the kind benzonatate carries. Cons: one trial, three days of follow-up, and never for infants under one year because of botulism risk.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Swallow the capsule whole — this is the most important line on the label',
          action:
            'Never break, chew, dissolve, cut or crush the capsule, and do not let it sit in the mouth.',
          patientImpact:
            'Releasing the liquid contents in the mouth produces rapid local anaesthesia of the throat, which can cause choking. The label records severe hypersensitivity reactions including bronchospasm, laryngospasm and cardiovascular collapse, possibly related to local anaesthesia from sucking or chewing the capsule, some requiring vasopressor agents.',
          clinicalPrecaution:
            'If numbness or tingling of the tongue, mouth, throat or face occurs, the label directs the patient to refrain from food and liquid until it resolves. A numb throat cannot protect the airway.',
        },
        {
          name: 'Keep it physically out of reach of children',
          action:
            'Store it where a child cannot get it, and treat any suspected ingestion as an emergency immediately rather than watching and waiting.',
          patientImpact:
            'The label states that accidental ingestion resulting in death has been reported in children below age 10, that signs of overdose have been reported within 15 to 20 minutes, and that death has been reported within one hour. The capsules are soft, glossy and yellow.',
          clinicalPrecaution:
            'Overdose produces oropharyngeal anaesthesia, then restlessness and tremor, then convulsions, then profound central nervous system depression, cerebral oedema and cardiac arrest. The label explicitly directs that central nervous system stimulants must not be used in treatment.',
        },
        {
          name: 'Ask what the cough is',
          action:
            'Establish whether the cough has a cause that has its own treatment before treating the cough itself.',
          patientImpact:
            'Benzonatate is indicated for "the symptomatic relief of cough" with no qualification of cause. Asthma, reflux, upper airway cough syndrome, heart failure and ACE inhibitors each produce cough and each has a specific answer that suppressing the reflex does not provide.',
          clinicalPrecaution:
            'A cough lasting more than a few weeks, or with fever, breathlessness, weight loss or blood, needs assessment rather than suppression.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCNC1=CC=C(C=C1)C(=O)OCCOCCOCCOCCOCCOCCOCCOCCOCCOC',
      chemicalFormula: 'C30H53NO11',
      molecularWeight: '603.70 g/mol',
      targetReceptorAffinity:
        'No binding constant exists, because no target has been identified. The label describes the drug as chemically related to anaesthetic agents of the para-aminobenzoic acid class such as procaine and tetracaine, and attributes its antitussive action to anaesthetising stretch receptors in the respiratory passages, lungs and pleura, with onset in 15 to 20 minutes and duration of 3 to 8 hours. The chemical name in the label — 2,5,8,11,14,17,20,23,26-nonaoxaoctacosan-28-yl p-(butylamino) benzoate — describes a nine-unit polyethylene glycol chain esterified to a butylaminobenzoic acid, which is why the molecule is an oily liquid held inside a soft gelatin capsule rather than a powder in a tablet.',
      structureSource: {
        label: 'PubChem CID 7699 (benzonatate) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/7699',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bnz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Polyethylene glycol chain-length distribution',
          description:
            'Establish the distribution of ethylene oxide units before anything is esterified. Benzonatate is not a single compound in the ordinary sense: it is a mixture centred on a nine-unit chain, and the pharmacopoeial identity is a distribution rather than a molecular weight. This is the reason the drug has no clean structure-activity relationship and no crystallography.',
          reagentsAndBuffer:
            'Monomethoxy-polyethylene glycol reference standard, gel permeation chromatography, MALDI-TOF mass spectrometry for oligomer distribution, hydroxyl value titration',
        },
        {
          id: 'bnz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Esterification of p-(butylamino)benzoic acid onto the glycol chain',
          description:
            'Couple 4-(butylamino)benzoic acid, or its acid chloride, to the terminal hydroxyl of the methoxy-nonaethylene glycol. The aromatic amine end is the pharmacophore that makes this a para-aminobenzoate anaesthetic; the glycol tail is what makes it orally usable rather than a topical agent, and it is the tail, not the head, that distinguishes the drug from tetracaine.',
          dependsOnStepId: 'bnz-w1',
          reagentsAndBuffer:
            '4-(butylamino)benzoic acid or its acyl chloride, methoxy-nonaethylene glycol, dicyclohexylcarbodiimide with dimethylaminopyridine or acid catalysis with azeotropic water removal, toluene, nitrogen atmosphere',
        },
        {
          id: 'bnz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of free aminobenzoic acid and unreacted glycol',
          description:
            'Wash out the unreacted acid and glycol and set the specification on residual free p-(butylamino)benzoic acid. Free aromatic amine is the impurity that matters: para-aminobenzoate anaesthetics are a recognised cause of hypersensitivity, and the label attributes severe reactions including bronchospasm, laryngospasm and cardiovascular collapse to this chemical class.',
          dependsOnStepId: 'bnz-w2',
          reagentsAndBuffer:
            'Aqueous bicarbonate wash, brine, reversed-phase HPLC with ultraviolet detection at 300 nm for free amine content, refractive index and viscosity as identity checks on the oil',
        },
        {
          id: 'bnz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Vagal afferent recording in an isolated airway preparation',
          description:
            'Apply the compound to an isolated airway with intact vagal innervation and record slowly and rapidly adapting stretch receptor firing. This is the experiment that would demonstrate the mechanism the label asserts, and it is the missing experiment: the claim that the drug anaesthetises airway stretch receptors has been carried in labelling since 1958 without a modern human or ex vivo confirmation of the firing rate it is supposed to change.',
          dependsOnStepId: 'bnz-w3',
          reagentsAndBuffer:
            'Isolated perfused lung or trachea-vagus preparation, Krebs-Henseleit buffer gassed with 95% oxygen and 5% carbon dioxide, extracellular electrode recording from the vagus, capsaicin and citric acid as afferent stimuli, tetracaine as the positive anaesthetic control',
        },
        {
          id: 'bnz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cough challenge in humans against a matched placebo capsule',
          description:
            'Count coughs after a standardised tussive challenge on drug and on an identical placebo capsule. Matching the capsule matters more here than for most drugs: the contents produce oral numbness if any leaks, which unblinds a trial instantly, and blinding failure is one candidate explanation for the entire clinical impression of this medicine.',
          dependsOnStepId: 'bnz-w4',
          reagentsAndBuffer:
            'Capsaicin or citric acid dose-response cough challenge, sound-isolated recording with automated cough counting, identical soft gelatin placebo capsules, C5 endpoint determination and 24-hour ambulatory cough monitoring',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bnz-a1',
        category: 'failed',
        title:
          'The only systematic review of the drug says its approval would not survive current review',
        laymanSummary:
          'Researchers searched four databases for every study of this drug published since 1956. They found thirty-seven, none of them a properly sized randomised trial, and most of them small, old or case reports. Their conclusion was that the evidence behind its approval would not stand up today.',
        technicalDetails:
          'A systematic review searched PubMed, Embase, the Cochrane Library and Scopus for original research on the effectiveness, tolerability and safety of benzonatate from January 1956 through August 2022. Screening yielded 37 articles: 21 cohort studies, 5 experimental studies and 11 case studies or series. The authors record that initial clinical studies exploring therapeutic benefit collected data from very small populations in limited clinical settings, that safety is primarily assessed in terms of overdose or inappropriate use rather than in trials, and that quality assessment raised concerns for high degrees of bias related to limited sample size, data collection, generalisability and study design. Their stated conclusion is that rising safety concerns should bring closer scrutiny upon the prescription of benzonatate, "whose approval is founded upon evidence that would not stand up to current regulatory review."',
        evidenceSource:
          'Costantino RC, Leonard J, Gorman EF, Ventura D, Baltz A, Gressler LE. Ann Pharmacother 2023;57:1221-1236',
        doi: '10.1177/10600280221135750',
        measuredMetric:
          'Systematic search of four databases, 1956 to 2022 — count and design of all identified studies',
        auditFlag: 'contested',
      },
      {
        id: 'bnz-a2',
        category: 'failed',
        title: 'Accidental ingestion has killed children under ten within an hour',
        laymanSummary:
          'The capsules are soft, shiny and yellow, and a small child who swallows them can be dead within an hour. Symptoms start in fifteen to twenty minutes. This is written on the label.',
        technicalDetails:
          'The Warnings section of the label states that accidental ingestion of benzonatate resulting in death has been reported in children below age 10, that signs and symptoms of overdose have been reported within 15 to 20 minutes, and that death has been reported within one hour of ingestion. The Overdosage section describes the sequence: rapid oropharyngeal anaesthesia with choking and airway compromise if capsules are chewed or dissolved, then central nervous system stimulation with restlessness and tremors proceeding to clonic convulsions, then profound central nervous system depression, with convulsions, coma, cerebral oedema and cardiac arrest leading to death reported within one hour. Treatment is supportive and the label directs explicitly that central nervous system stimulants must not be used. A published case describes a 13-year-old presenting with coma, seizures, hypotension, prolonged QT interval and metabolic acidosis after overdose, and records that the FDA issued a Drug Safety Communication warning of increased risk of death from accidental ingestion in children under 10 and added that information to the Warnings and Precautions section.',
        evidenceSource:
          'Benzonatate prescribing information, Warnings and Overdosage sections (NDA 011210 and generics); Thimann DA, Huang CJ, Goto CS, Feng SY. J Pediatr Pharmacol Ther 2012;17:270-273',
        doi: '10.5863/1551-6776-17.3.270',
        measuredMetric:
          'Time from ingestion to symptom onset and to death, as recorded in labelling',
        auditFlag: 'caution',
      },
      {
        id: 'bnz-a3',
        category: 'measured',
        title:
          'Twenty years of poison centre calls: severe in deliberate overdose, rarely otherwise',
        laymanSummary:
          'A regional poison centre reviewed every call about this drug over twenty years. Among people who took it deliberately, more than one in five had a seizure, a heart rhythm change, coma or died. Among accidental exposures, including seventy-seven in children, almost none did.',
        technicalDetails:
          'A retrospective review of all benzonatate exposures reported to the Wisconsin Poison Center from 1 January 2000 to 31 December 2019 identified 313 calls, of which 265 had complete records. Median age was 19 years and 61% were female. Of 106 intentional exposures (40%), 23 (22%) experienced at least one serious adverse effect — defined as seizure, electrocardiogram change, coma or central nervous system depression, or death — and 40 (38%) were hospitalised. Of 143 unintentional exposures (54%), one (0.7%) had a serious adverse effect and three (2%) were hospitalised. Among 77 unintentional paediatric exposures, none had a serious adverse effect and two (3%) were hospitalised. Two deaths occurred over the twenty years, both after intentional exposure. No therapeutic intervention beyond supportive care was consistently used, and the authors note that no standard treatment guideline for benzonatate toxicity exists.',
        evidenceSource: 'Cicci CD, Theobald J, Stanton M, Feldman R. Clin Toxicol 2025;63:488-494',
        doi: '10.1080/15563650.2025.2512817',
        measuredMetric:
          'Rate of seizure, ECG change, coma or death by intent of exposure, across 265 poison centre cases',
        auditFlag: 'verified',
      },
      {
        id: 'bnz-a4',
        category: 'inferred',
        title: 'The mechanism on the label has been asserted since 1958 and never demonstrated',
        laymanSummary:
          'The label says the drug numbs the stretch sensors in your airways. That sentence has been in the labelling for nearly seventy years. Nobody has published a measurement of those sensors quietening in a person who has taken it.',
        technicalDetails:
          'The Clinical Pharmacology section states in full: "Benzonatate acts peripherally by anesthetizing the stretch receptors located in the respiratory passages, lungs, and pleura by dampening their activity and thereby reducing the cough reflex at its source. It begins to act within 15 to 20 minutes and its effect lasts for 3 to 8 hours." There is no Clinical Studies section in the label. The chemical rationale is stated in Precautions — the drug is related to anaesthetics of the para-aminobenzoic acid class such as procaine and tetracaine — and the toxicology literature independently describes sodium channel blocking properties and local anaesthetic effects attributed to a tetracaine-like metabolite. What is absent is any published recording of airway afferent activity, or any human pharmacodynamic measure such as a cough challenge threshold, confirming the effect the label names.',
        evidenceSource:
          'Benzonatate prescribing information, Clinical Pharmacology and Precautions sections; Thimann DA et al., J Pediatr Pharmacol Ther 2012;17:270-273',
        inferredClaim:
          'That the drug anaesthetises airway stretch receptors and reduces the cough reflex at its source — a mechanism asserted in labelling since 1958, chemically plausible from the tetracaine relationship, and never confirmed by a published measurement of the receptors or the reflex',
        auditFlag: 'contested',
      },
      {
        id: 'bnz-a5',
        category: 'failed',
        title: 'Chewing the capsule can cause laryngospasm and cardiovascular collapse',
        laymanSummary:
          'The liquid inside the capsule is a numbing agent. If it gets into the mouth it deadens the throat within minutes, and severe reactions have followed — the airway closing, the circulation collapsing, needing drugs to restore blood pressure.',
        technicalDetails:
          'The Warnings section records severe hypersensitivity reactions including bronchospasm, laryngospasm and cardiovascular collapse, described as possibly related to local anaesthesia from sucking or chewing the capsule instead of swallowing it, with severe reactions requiring intervention with vasopressor agents and supportive measures. The same section records isolated instances of bizarre behaviour including mental confusion and visual hallucinations in patients taking benzonatate with other prescribed drugs. Precautions add that release of the contents in the mouth can produce temporary local anaesthesia of the oral mucosa and that choking could occur, and instruct patients to avoid food and liquid until any numbness of tongue, mouth, throat or face has resolved.',
        evidenceSource:
          'Benzonatate prescribing information, Warnings and Precautions sections (NDA 011210 and generics)',
        measuredMetric:
          'Labelled adverse reactions attributed to release of capsule contents in the mouth',
        auditFlag: 'caution',
      },
      {
        id: 'bnz-a6',
        category: 'conclusion_shift',
        title:
          'It was approved four years before proof of efficacy became law, and never revisited',
        laymanSummary:
          'The drug was approved in February 1958. In 1962 Congress required, for the first time, that a manufacturer prove a medicine works before selling it. Benzonatate was already on the market, and the standard that would have applied to a new drug was never applied to it.',
        technicalDetails:
          'NDA 011210 was approved on 10 February 1958. The Kefauver-Harris amendment of 1962 introduced the requirement for substantial evidence of effectiveness. The 200 mg Tessalon capsule now carries a Federal Register determination that it was not discontinued or withdrawn for safety or effectiveness reasons, which is a statement about why it left the market rather than about whether it works. Generic entry began in 1993 under abbreviated applications, which establish bioequivalence to the reference product and do not re-examine efficacy. The 2023 systematic review found no randomised controlled trial of adequate size in sixty-six years of literature and concluded that the evidence base underlying approval would not survive current regulatory review.',
        evidenceSource:
          'Drugs@FDA, NDA 011210 (TESSALON), original approval 10 February 1958; Costantino RC et al., Ann Pharmacother 2023;57:1221-1236',
        doi: '10.1177/10600280221135750',
        inferredClaim:
          'That continued marketing and prescription status reflect a maintained judgement that the drug is effective — the approval predates the efficacy requirement, and no subsequent regulatory step has re-tested it',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An oil inside a soft capsule',
        laymanDesc:
          'Unlike most tablets, this drug is a liquid. It is held inside a gelatin shell that has to reach the stomach intact, because if it leaks in the mouth it numbs the throat.',
        molecularDetail:
          'Benzonatate is a nine-unit polyethylene glycol ester of p-(butylamino)benzoic acid, an oily liquid formulated in soft gelatin capsules of 100 or 200 mg. The label instructs that capsules be swallowed whole and never broken, chewed, dissolved, cut or crushed.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorbed and distributed within about a quarter of an hour',
        laymanDesc:
          'The label puts onset at fifteen to twenty minutes and duration at three to eight hours. That is also, exactly, how quickly a poisoned child becomes symptomatic.',
        molecularDetail:
          'The label states onset within 15 to 20 minutes and effect lasting 3 to 8 hours, and notes that drugs of the para-aminobenzoate anaesthetic type are generally well absorbed after ingestion. The same 15-to-20-minute figure appears in the Overdosage section as the time to first signs of poisoning.',
        iconName: 'Clock',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The asserted step: numbing the airway stretch sensors',
        laymanDesc:
          'The label says the drug reaches the sensors in the airways, lungs and lining of the chest and dampens their activity, so the cough reflex is stopped at its source. No published measurement shows this happening.',
        molecularDetail:
          'The Clinical Pharmacology section asserts peripheral anaesthesia of stretch receptors in the respiratory passages, lungs and pleura. No recording of slowly or rapidly adapting airway afferent firing on benzonatate has been published, and the label carries no Clinical Studies section.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'What the chemistry actually predicts',
        laymanDesc:
          'The active end of the molecule is the same chemical family as dental anaesthetics. Those work by blocking the sodium channels nerves use to fire, and that is what happens in overdose — first excitation, then seizures, then collapse.',
        molecularDetail:
          'The label places the drug in the para-aminobenzoic acid anaesthetic class alongside procaine and tetracaine. Toxicology attributes its systemic effects to voltage-gated sodium channel blockade by a tetracaine-like metabolite, which accounts for the reported sequence in overdose: central nervous system stimulation, clonic convulsions, then profound depression, with prolonged QT interval, ventricular dysrhythmias and cardiac arrest.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The clinical result nobody has measured against a placebo',
        laymanDesc:
          'People are prescribed it for cough and many say it helps. In sixty-six years of literature, a systematic search of four databases found no adequately sized randomised comparison against a dummy capsule.',
        molecularDetail:
          'The 2023 systematic review identified 37 articles from 1956 to 2022 — 21 cohort studies, 5 experimental studies and 11 case studies or series — with quality assessment flagging high risk of bias from limited sample size, data collection, generalisability and study design throughout.',
        iconName: 'Ban',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The safety profile that exists is the poisoning profile',
        laymanDesc:
          'Because there are no trials, what is known about its harms comes almost entirely from overdose reports and poison centre records rather than from controlled comparison.',
        molecularDetail:
          'The systematic review notes that safety is primarily assessed in terms of toxicity due to overdose or inappropriate use. Twenty years of one poison centre’s records give 22% serious adverse effects among 106 intentional exposures against 0.7% among 143 unintentional ones, with two deaths, both intentional.',
        iconName: 'Skull',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Costantino 2023 systematic review (Ann Pharmacother 57:1221-1236)',
        phase: 'Systematic review of four databases, January 1956 to August 2022',
        sampleSize: 37,
        primaryEndpoint:
          'Effectiveness, tolerability and safety of benzonatate across all identified original research',
        endpointMet: false,
        statisticalPValue:
          'No pooled estimate. 21 cohort studies, 5 experimental studies and 11 case studies or series; quality assessment flagged high risk of bias throughout',
        unreportedAdverseSignals:
          'The sample size given here is the number of studies, not participants. No adequately powered randomised placebo-controlled trial was identified in sixty-six years of literature.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cicci 2025 poison centre review (Clin Toxicol 63:488-494)',
        phase: 'Retrospective single-centre case review, 2000 to 2019',
        sampleSize: 265,
        primaryEndpoint:
          'Rate of serious adverse effects — seizure, ECG change, coma or CNS depression, or death',
        endpointMet: true,
        statisticalPValue:
          '22% of 106 intentional exposures had at least one serious adverse effect and 38% were hospitalised, against 0.7% and 2% of 143 unintentional exposures; 0 of 77 unintentional paediatric exposures had a serious effect; 2 deaths, both intentional',
        unreportedAdverseSignals:
          'Single regional poison centre, so ascertainment is partial and the denominator of total exposures is unknown. No standard treatment guideline for benzonatate toxicity exists.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '37 studies identified in a four-database search from 1956 to 2022, none an adequately powered randomised trial',
        '22% serious adverse effects among 106 intentional poison centre exposures against 0.7% among 143 unintentional ones',
        'Zero serious adverse effects among 77 unintentional paediatric poison centre exposures over twenty years',
        'Onset of effect and onset of poisoning symptoms both stated at 15 to 20 minutes in the label',
      ],
      unsupportedInferences: [
        'That the drug anaesthetises airway stretch receptors — asserted in labelling since 1958 with no published measurement of those receptors',
        'That it relieves cough better than a matched placebo capsule — no adequately sized randomised comparison exists',
        'That continued prescription-only marketing reflects a maintained regulatory judgement of efficacy',
        'That the tetracaine chemical relationship establishes the airway mechanism rather than merely the toxicology',
      ],
      whatFailedInitially: [
        'The only systematic review concluded the approval rests on evidence that would not survive current regulatory review',
        'Accidental ingestion has killed children under ten, with death reported within one hour, and the FDA added this to the label',
        'Chewing or sucking the capsule has caused bronchospasm, laryngospasm and cardiovascular collapse requiring vasopressors',
        'No paediatric or adult placebo-controlled cough-count trial has ever been published for a drug approved sixty-eight years ago',
      ],
      realWorldOutcome: [
        'Approved 10 February 1958 under NDA 011210 and still the only non-narcotic prescription antitussive in routine American use',
        'Generic since 1993, with 39 products in the CMS acquisition survey at a median $0.0688 per unit',
        'Carries labelled warnings for death from accidental ingestion in children under 10 and for hypersensitivity from chewing the capsule',
        'Its 2023 systematic review called for large observational studies or randomised trials to characterise its role, which have not been done',
      ],
    },
    deliverySystem: {
      type: 'Oral soft gelatin capsule (100 mg and 200 mg) containing the drug as a liquid',
      description:
        'Must be swallowed whole. The contents are an oily local anaesthetic; releasing them in the mouth produces rapid oropharyngeal numbness and can cause choking. The label instructs patients not to break, chew, dissolve, cut or crush the capsule, and not to take two doses at once if one is missed.',
      safetyProfile:
        'Severe hypersensitivity reactions including bronchospasm, laryngospasm and cardiovascular collapse have been reported, possibly related to local anaesthesia from sucking or chewing the capsule, some requiring vasopressors. Isolated reports of bizarre behaviour, mental confusion and visual hallucinations in patients taking it with other drugs. Accidental ingestion has caused death in children below age 10, with symptoms at 15 to 20 minutes and death within one hour; overdose produces convulsions, coma, cerebral oedema and cardiac arrest, and central nervous system stimulants must not be used in treatment. The label caps a single dose at 200 mg and a total daily amount at 600 mg, and states that fatal overdose can occur in adults. Pregnancy Category C with no animal reproduction studies conducted.',
    },
    commonQuestions: [
      {
        q: 'Has anyone shown that it works?',
        a: 'Not to a modern standard. In 2023 a team searched PubMed, Embase, the Cochrane Library and Scopus for every original study of benzonatate published between January 1956 and August 2022. They found thirty-seven articles: twenty-one cohort studies, five experimental studies and eleven case reports or series. The early clinical studies used very small numbers in limited settings, and quality assessment flagged high risk of bias throughout on sample size, data collection, generalisability and design. Their conclusion, in their words, was that its approval "is founded upon evidence that would not stand up to current regulatory review", and that large observational studies or randomised trials are needed to characterise its role.',
        auditNote:
          'Absence of a trial is not evidence that a drug does not work. It is evidence that nobody knows, which for a medicine on the market since 1958 is the more surprising finding.',
      },
      {
        q: 'Why does the label insist so hard on swallowing it whole?',
        a: 'Because the capsule contains a liquid anaesthetic. If it is chewed, sucked or split, the contents numb the mouth and throat within minutes. The label records severe hypersensitivity reactions — bronchospasm, laryngospasm and cardiovascular collapse — described as possibly related to that local anaesthesia, with some cases requiring drugs to restore blood pressure. It also warns that choking can occur, and that if numbness of the tongue, mouth, throat or face develops you should not eat or drink until it has passed. A numb throat cannot protect an airway.',
      },
      {
        q: 'How dangerous is it if a child gets hold of it?',
        a: 'Genuinely dangerous, and fast. The label states that accidental ingestion resulting in death has been reported in children below age 10, that signs of overdose appear within fifteen to twenty minutes, and that death has been reported within one hour. The sequence described is numbness of the throat, then restlessness and tremor, then convulsions, then deep unconsciousness, cerebral swelling and cardiac arrest. The capsules are soft, glossy and coloured. Against that, a twenty-year poison centre review found that of seventy-seven unintentional paediatric exposures, none produced a serious adverse effect — so most accidental exposures do not end badly. Both facts are true and the first is the one that dictates how it should be stored.',
      },
      {
        q: 'How does it actually stop a cough?',
        a: 'The label says it numbs the stretch sensors in the airways, lungs and lining of the chest, dampening their activity and stopping the cough reflex at its source, with onset at fifteen to twenty minutes and duration of three to eight hours. That sentence has been in the labelling since 1958. What does not exist is a published measurement of those sensors firing less in anyone who has taken it, or a human cough-challenge threshold study. The chemistry is suggestive: the active end of the molecule belongs to the same family as procaine and tetracaine, and toxicologists attribute its overdose effects to sodium channel blockade by a tetracaine-like metabolite. That explains the poisoning. It does not by itself establish the airway mechanism.',
      },
      {
        q: 'Why is it prescription-only if it is this old and this weak?',
        a: 'Because of the route it took, not because of a later decision. It was approved on 10 February 1958 as a prescription product. The 1962 Kefauver-Harris amendment introduced the requirement to prove efficacy, and applied to new approvals. Generic versions entered from 1993 under abbreviated applications, which demonstrate bioequivalence to the original product and do not re-examine whether the original works. Nothing in that sequence involved a fresh look at efficacy, and nothing triggered a switch to over-the-counter sale — which, given the paediatric ingestion warnings, is probably just as well.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Costantino RC, Leonard J, Gorman EF, Ventura D, Baltz A, Gressler LE. Benzonatate safety and effectiveness: a systematic review of the literature. Ann Pharmacother 2023;57:1221-1236',
        identifier: '10.1177/10600280221135750',
        kind: 'doi',
      },
      {
        label:
          'Cicci CD, Theobald J, Stanton M, Feldman R. Outcomes of benzonatate exposures reported to a single United States poison center: a 20-year review. Clin Toxicol 2025;63:488-494',
        identifier: '10.1080/15563650.2025.2512817',
        kind: 'doi',
      },
      {
        label:
          'Thimann DA, Huang CJ, Goto CS, Feng SY. Benzonatate toxicity in a teenager resulting in coma, seizures, and severe metabolic acidosis. J Pediatr Pharmacol Ther 2012;17:270-273',
        identifier: '10.5863/1551-6776-17.3.270',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: TESSALON (benzonatate) capsules, NDA 011210, Pfizer — original approval 10 February 1958',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=011210',
        kind: 'regulatory',
      },
      {
        label:
          'Benzonatate capsules prescribing information — Clinical Pharmacology, Warnings, Precautions and Overdosage sections, via openFDA drug labelling',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22benzonatate%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 7699 — benzonatate structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/7699',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Azelastine — an antihistamine sprayed into the nose, where roughly two-fifths of it is
  //    absorbed anyway, one in five people taste it bitterly, and one in nine gets sleepy.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'azelastine',
    name: 'Azelastine',
    tradeName: 'Astelin / Astepro / Astepro Allergy',
    sponsor:
      'Originated as Astelin, NDA 020114, approved 1 November 1996; the current United States applications are Astepro (NDA 022203, 15 October 2008), Astepro Allergy over-the-counter (NDA 213872, 17 June 2021, Bayer HealthCare) and the fluticasone combination Dymista (NDA 202236, 1 May 2012); generics are labelled by Rising and others',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor, with additional inhibition of mediator release from mast cells and of leukotriene and platelet-activating factor pathways demonstrated in human cell lines',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Treatment of the symptoms of seasonal allergic rhinitis in adults and children aged 5 years and older, and of vasomotor rhinitis in adults and adolescents aged 12 years and older; an ophthalmic solution is separately indicated for allergic conjunctivitis',
    patientFriendlyIndication:
      'Hay fever, and the non-allergic runny nose that weather, smells and temperature set off',
    anatomicalSite:
      'Nasal mucosa — sprayed directly onto the tissue, though about 40% of the delivered amount is absorbed into the circulation',
    conditionContext: {
      conditionExplainer:
        'Spraying an antihistamine into the nose puts the drug where the histamine is being released rather than sending it round the whole body to get there. That is the argument for the route: faster onset, higher local concentration, and an effect on nasal blockage that swallowed antihistamines largely fail to achieve.',
      whyItMatters:
        'Azelastine is also the drug that tests the assumption behind that argument. Roughly two-fifths of a nasal dose reaches the bloodstream, and the label carries the same somnolence warning as an oral antihistamine, at more than twice the placebo rate. "Topical" is a description of where it is applied, not of where it stays.',
      whoTakesThis:
        'Adults and children from five years, sold without a prescription in the United States since June 2021 — the first antihistamine nasal spray to make that switch.',
      clinicalGoals:
        'A lower total nasal symptom score, including congestion, within minutes rather than hours. The trials support that and also show it is the weakest of the three active nasal options tested against it.',
    },
    oneSentenceVerdict:
      'A phthalazinone H1 antagonist sprayed onto the nasal lining that also suppresses mast cell mediator release — in a meta-analysis of three trials in 3,398 patients it reduced reflective total nasal symptom score by 4.4 points against 3.0 on placebo (p<0.001) while intranasal fluticasone reached 5.1 and the two combined reached 5.7; its systemic bioavailability by that route is about 40%, and 19.7% of patients tasted it bitterly against 0.6% on placebo while 11.5% became somnolent against 5.4%.',
    laymanHowItWorks:
      'Instead of swallowing an antihistamine and waiting for it to circulate to your nose, you spray it straight onto the lining. It blocks the histamine receptor there within minutes, and it also makes the cells that release histamine less willing to do so, which an oral antihistamine does not. The catch is that the nose is a very absorbent surface: about two-fifths of what you spray ends up in your bloodstream, which is why a nasal spray can still make you sleepy. And a good deal of what you spray runs down the back of your throat, where it tastes strongly bitter.',
    auditConfidence: 'High Confidence',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$1.01 per mL, median across 17 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Moderate',
      openPatentNotes:
        'The original Astelin application, NDA 020114 of 1 November 1996, and the Astepro reformulation, NDA 022203 of 15 October 2008, are both listed as discontinued; the marketed products are the over-the-counter Astepro Allergy under NDA 213872, approved 17 June 2021, and generics. It is by some distance the most expensive drug per unit in this batch on the CMS acquisition survey, at roughly eleven times the per-millilitre cost of oxymetazoline nasal spray.',
      costSource: {
        label:
          'No published cost-of-production study exists for azelastine; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 17 listed azelastine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'The head-to-head data here are unusually clean, because three trials in 3,398 patients compared this drug, an intranasal steroid, their combination and placebo on the same endpoint at the same time. Azelastine came third of the three active arms. The case for it is speed and the option of using it when an oral antihistamine has already failed, not superior symptom control.',
      conventionalRx: [
        {
          name: 'Intranasal fluticasone propionate',
          class: 'Topical corticosteroid',
          howItCompares:
            'Beat azelastine directly in the pooled analysis of the three registration trials: reflective total nasal symptom score fell 5.1 points on fluticasone against 4.4 on azelastine and 3.0 on placebo, all comparisons p<0.001. It works more slowly, over days rather than minutes, and it carries no somnolence warning.',
          typicalCost:
            'US$0.6920 per millilitre, median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: larger effect on total nasal symptoms, no sedation, no bitter taste of consequence, cheaper per millilitre. Cons: days to full effect, nosebleeds in a minority, and it does nothing in the first fifteen minutes.',
        },
        {
          name: 'Azelastine plus fluticasone in one device (Dymista)',
          class: 'Fixed combination of the two, approved as NDA 202236 on 1 May 2012',
          howItCompares:
            'The best-performing arm of the three trials: 5.7 points against 5.1 for fluticasone alone, 4.4 for azelastine alone and 3.0 for placebo, all p<0.001, with the benefit present from the first day of assessment and response reached consistently days earlier than with either single agent.',
          typicalCost:
            'No median acquisition cost for the fixed combination is listed separately in the CMS survey extract used here',
          prosAndCons:
            'Pros: the largest measured effect and the fastest time to response, including in the most severe patients. Cons: it carries azelastine’s bitter taste and somnolence alongside the steroid; a combination product is a single prescription, not a smaller drug burden.',
        },
        {
          name: 'Oral second-generation antihistamine',
          class: 'Systemic H1 antagonist — loratadine, cetirizine, fexofenadine',
          howItCompares:
            'One trial answers this comparison directly and unusually. It enrolled 334 patients who had already taken fexofenadine 60 mg twice daily for a week and improved by less than a third, then randomised them: azelastine spray beat placebo (p=0.007), and adding fexofenadine on top of the spray gave no better result than the spray alone.',
          typicalCost:
            '$0.0532 per unit for loratadine and $0.2407 per unit for fexofenadine at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: far cheaper, no bitter taste, no device technique to get right. Cons: little effect on nasal congestion, hours rather than minutes to onset, and in the trial above they had already failed.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Aim the spray away from the septum and do not sniff hard',
          action:
            'Point the nozzle towards the outer wall of the nostril, tilt the head slightly forward, and breathe gently rather than inhaling sharply.',
          patientImpact:
            'Most of the bitter taste comes from drug running down the back of the throat, which sniffing hard makes worse. Bitter taste was reported by 19.7% of patients on azelastine against 0.6% on placebo — a thirty-fold difference and the single most distinctive thing about using this drug.',
          clinicalPrecaution:
            'Nasal burning (4.1% against 1.7%) and epistaxis (2.0% against 1.4%) are also more common than on placebo, and aiming at the septum increases both.',
        },
        {
          name: 'Treat it as a sedating drug until you know it is not',
          action:
            'Find out how it affects you before driving on it, and avoid alcohol and other sedatives alongside it.',
          patientImpact:
            'Somnolence was reported by 45 of 391 patients (11.5%) against 19 of 353 on placebo (5.4%), and the label carries an explicit caution against hazardous occupations requiring complete mental alertness. Being a spray does not make it a local drug: systemic bioavailability by the nasal route is about 40%.',
          clinicalPrecaution:
            'The label directs that concurrent use with alcohol or other central nervous system depressants be avoided because further reductions in alertness and impairment of performance may occur.',
        },
        {
          name: 'Saline irrigation before, not instead',
          action:
            'Rinse the nose with salt water before spraying if it is heavily congested or crusted.',
          patientImpact:
            'A spray cannot coat mucosa it cannot reach. Clearing the passage first is a technique adjustment rather than a treatment, and it is one of the few things that changes how much of the drug lands where it is meant to.',
          clinicalPrecaution:
            'Only sterile, distilled or previously boiled water. Fatal amoebic meningoencephalitis has been traced to nasal irrigation with untreated tap water.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1CCCC(CC1)N2C(=O)C3=CC=CC=C3C(=N2)CC4=CC=C(C=C4)Cl',
      chemicalFormula: 'C22H24ClN3O',
      molecularWeight: '381.90 g/mol',
      targetReceptorAffinity:
        'Azelastine is a phthalazinone with H1 antagonist activity demonstrated in isolated tissues, animal models and humans, administered as a racemate with no difference in pharmacologic activity between the enantiomers in vitro. Its principal metabolite desmethylazelastine is also an H1 antagonist and reaches 20% to 50% of parent plasma concentration at steady state. Beyond H1, in vitro work in human cell lines demonstrates inhibition of histamine and other mediator release from mast cells, inhibition of leukotriene and platelet-activating factor pathways, and decreased eosinophil chemotaxis and activation — a broader profile than a pure receptor blocker.',
      structureSource: {
        label: 'PubChem CID 2267 (azelastine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2267',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'aze-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Phthalazinone core identity and chlorobenzyl position',
          description:
            'Confirm the 4-chlorobenzyl substitution on the phthalazinone ring and the N-methylazepane attachment. The molecule has one stereocentre on the azepane ring and is deliberately supplied as a racemate: the label records no difference in pharmacologic activity between the enantiomers in vitro, so unlike levocetirizine there is no single-enantiomer product to distinguish it from.',
          reagentsAndBuffer:
            'Azelastine hydrochloride reference standard, reversed-phase HPLC with ultraviolet detection, 1H and 13C NMR in DMSO-d6, chloride assay by ion chromatography',
        },
        {
          id: 'aze-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Condensation to the phthalazinone and N-alkylation with the azepane',
          description:
            'Build the 4-(4-chlorobenzyl)phthalazin-1(2H)-one from the substituted phthalide or ketoacid with hydrazine, then alkylate the ring nitrogen with 1-methylazepan-4-yl halide or tosylate. Alkylating the correct nitrogen is the selectivity problem: the phthalazinone has two nitrogens and the wrong regiochemistry gives an inactive isomer that is difficult to remove downstream.',
          dependsOnStepId: 'aze-w1',
          reagentsAndBuffer:
            'Hydrazine hydrate, 2-(4-chlorobenzyl)benzoic acid derivative, 1-methyl-4-azepanyl chloride or tosylate, sodium hydride or potassium carbonate in dimethylformamide, nitrogen atmosphere',
        },
        {
          id: 'aze-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Regioisomer removal and hydrochloride crystallisation',
          description:
            'Separate the N1 and N2 alkylation products and crystallise the hydrochloride. Because the finished product is a nasal solution rather than a tablet, the specification on particulates and on solution clarity is tighter than for an oral form: anything insoluble in a spray becomes an inhaled particle.',
          dependsOnStepId: 'aze-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase chromatography, hydrogen chloride in isopropanol, recrystallisation from ethanol and water, sub-visible particulate counting by light obscuration on the reconstituted solution',
        },
        {
          id: 'aze-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Human mast cell mediator-release inhibition',
          description:
            'Challenge human mast cells or basophils with anti-IgE and measure histamine, leukotriene and platelet-activating factor release with and without the compound. This is the assay that distinguishes azelastine from a plain H1 blocker: the receptor-blocking activity is shared with every antihistamine, and the mediator-release inhibition is the part of the profile that justifies calling it more than one.',
          dependsOnStepId: 'aze-w3',
          reagentsAndBuffer:
            'Human lung or skin mast cells or peripheral blood basophils, anti-IgE or calcium ionophore A23187 as secretagogue, HEPES-buffered Tyrode solution with calcium and magnesium, histamine and cysteinyl leukotriene enzyme immunoassays, eosinophil chemotaxis chambers',
        },
        {
          id: 'aze-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Nasal deposition, systemic bioavailability and QTc',
          description:
            'Quantify what fraction of a sprayed dose is absorbed, and pair it with cardiac repolarisation measurement. Reporting a nasal drug as though it were purely local is the error this step exists to prevent: azelastine’s nasal bioavailability is about 40%, and while the nasal route showed no QTc effect over 56 days, oral azelastine 4 mg twice daily produced a mean QTc change of 7.2 msec.',
          dependsOnStepId: 'aze-w4',
          reagentsAndBuffer:
            'LC-MS/MS quantification of azelastine and desmethylazelastine in plasma, gamma scintigraphy or nasal cast deposition modelling, serial 12-lead electrocardiography with Fridericia correction, matched intravenous reference arm for absolute bioavailability',
        },
      ],
    },
    keyAudits: [
      {
        id: 'aze-a1',
        category: 'measured',
        title:
          'In 3,398 patients it beat placebo and lost to the steroid it is usually compared against',
        laymanSummary:
          'Three trials run in different pollen seasons compared this spray, a steroid spray, both together, and a dummy. All three active treatments beat the dummy. The steroid beat this drug, and the combination beat the steroid.',
        technicalDetails:
          'Three multicentre, randomised, double-blind, placebo- and active-controlled parallel-group trials — MP4002 (NCT00651118), MP4004 (NCT00740792) and MP4006 (NCT00883168) — enrolled 3,398 patients aged 12 and over with moderate-to-severe seasonal allergic rhinitis, each running 14 days in a different allergy season. The primary variable was the sum of morning and evening change from baseline in reflective total nasal symptom score, range 0 to 24. In the meta-analysis, mean reduction was 5.7 (SD 5.3) for the azelastine-fluticasone combination, 5.1 (SD 4.9) for fluticasone propionate, 4.4 (SD 4.8) for azelastine and 3.0 (SD 4.2) for placebo, with the combination superior to each single agent and to placebo at p<0.001. The benefit was present from the first day of assessment and extended to each individual nasal symptom, including in the most severely affected patients.',
        evidenceSource:
          'Carr W et al., J Allergy Clin Immunol 2012;129:1282-1289.e10 (MP4002 NCT00651118, MP4004 NCT00740792, MP4006 NCT00883168)',
        doi: '10.1016/j.jaci.2012.01.077',
        measuredMetric:
          'Change from baseline in reflective total nasal symptom score over 14 days, four-arm comparison',
        auditFlag: 'verified',
      },
      {
        id: 'aze-a2',
        category: 'failed',
        title: 'A nasal spray with a driving warning, because 40% of it gets into the blood',
        laymanSummary:
          'People assume a spray stays in the nose. About two-fifths of this one is absorbed into the circulation, and one patient in nine reported drowsiness against one in eighteen on the dummy spray. The label tells you not to drive on it.',
        technicalDetails:
          'Systemic bioavailability after intranasal administration is approximately 40%, with peak plasma concentrations at 2 to 3 hours and greater-than-proportional increases in Cmax and AUC above two sprays per nostril twice daily. Across six placebo- and active-controlled trials in 391 patients aged 12 and over, somnolence was reported in 45 (11.5%) against 19 of 353 on vehicle placebo (5.4%). The Warnings and Precautions section directs patients to avoid hazardous occupations requiring complete mental alertness such as driving or operating machinery, and to avoid concurrent alcohol or other central nervous system depressants because further decreased alertness and impairment of central nervous system performance may occur. The active metabolite desmethylazelastine reaches 20% to 50% of parent plasma concentration at steady state and is itself an H1 antagonist.',
        evidenceSource:
          'Azelastine hydrochloride nasal spray prescribing information, sections 5.1, 6.1 Table 1 and 12.3',
        inferredClaim:
          'That applying an antihistamine topically confines its effect to the site of application — the nasal mucosa absorbs about 40% of the delivered amount, and the somnolence rate and label warning follow from that',
        auditFlag: 'caution',
      },
      {
        id: 'aze-a3',
        category: 'measured',
        title: 'One patient in five tastes it, against one in a hundred and sixty-six on placebo',
        laymanSummary:
          'Bitter taste is the defining complaint about this drug and the numbers are extreme: nearly twenty percent of patients reported it against half a percent on the dummy spray. It did not, however, make more people stop treatment in the trials.',
        technicalDetails:
          'In placebo-controlled seasonal allergic rhinitis trials at two sprays per nostril twice daily, bitter taste was reported by 77 of 391 patients (19.7%) against 2 of 353 on vehicle placebo (0.6%) — a rate ratio above thirty and by far the largest treatment-attributable difference on the label. Nasal burning was 4.1% against 1.7%, paroxysmal sneezing 3.1% against 1.1%, nausea 2.8% against 1.1% and weight increase 2.0% against 0.0%. Notably, discontinuation due to adverse reactions was 2.2% on azelastine against 2.8% on placebo, so within the trials the taste did not drive people off treatment even though it was overwhelmingly attributable to the drug.',
        evidenceSource:
          'Azelastine hydrochloride nasal spray prescribing information, section 6.1, Table 1 (391 patients against 353 placebo)',
        measuredMetric:
          'Adverse reaction incidence at ≥2% and greater than placebo, six controlled trials',
        auditFlag: 'verified',
      },
      {
        id: 'aze-a4',
        category: 'measured',
        title: 'It worked in people an oral antihistamine had already failed',
        laymanSummary:
          'A trial deliberately recruited people who had taken an oral antihistamine for a week and barely improved. The spray helped them. Adding the tablet back on top of the spray added nothing.',
        technicalDetails:
          'A multicentre, randomised, double-blind, placebo-controlled two-week study opened with a one-week open-label lead-in on fexofenadine 60 mg twice daily. The 334 patients who improved by less than 25% to 33% were randomised to azelastine nasal spray two sprays per nostril twice daily, the same spray plus fexofenadine, or saline placebo spray with placebo capsules. At day 14 both azelastine arms improved total nasal symptom score against placebo — p=0.007 for spray alone and p=0.003 for the combination — and azelastine monotherapy was as effective as azelastine plus fexofenadine on the total score and on each of its four component symptoms.',
        evidenceSource: 'LaForce CF et al., Ann Allergy Asthma Immunol 2004;93:154-159',
        doi: '10.1016/S1081-1206(10)61468-8',
        measuredMetric:
          'Change from baseline to day 14 in total nasal symptom score in oral-antihistamine non-responders',
        auditFlag: 'verified',
      },
      {
        id: 'aze-a5',
        category: 'inferred',
        title: 'A phase 2 trial found fewer COVID infections, on twenty events and one centre',
        laymanSummary:
          'A German trial had 450 healthy adults spray either this drug or a placebo three times a day for eight weeks and tested them for COVID twice weekly. Five infections occurred in the drug group and fifteen in the placebo group. That is a real difference and it rests on twenty events at one hospital, in a trial run by the manufacturer.',
        technicalDetails:
          'The CONTAIN trial was a phase 2, double-blind, placebo-controlled, single-centre study conducted at Saarland University Hospital from March 2023 to July 2024, randomising 450 healthy adults 1:1 to azelastine 0.1% nasal spray or placebo three times daily for 56 days, with rapid antigen testing twice weekly and PCR confirmation. In the intention-to-treat population, PCR-confirmed SARS-CoV-2 infection occurred in 5 of 227 (2.2%) on azelastine against 15 of 223 (6.7%) on placebo, odds ratio 0.31 (95% CI 0.11 to 0.87). Secondary findings were longer mean time to infection among those infected (31.2 against 19.5 days), fewer PCR-confirmed symptomatic infections (21 of 227 against 49 of 223) and lower PCR-confirmed rhinovirus incidence (1.8% against 6.3%). Adverse events were comparable. The trial sponsor is the manufacturer Ursapharm and two authors are company employees including its chief executive; the authors themselves call for confirmation in larger, multicentric trials. An erratum was published alongside the paper.',
        evidenceSource:
          'Lehr T et al.; CONTAIN Study Group. JAMA Intern Med 2025;185:1309-1317 (EudraCT 2022-003756-13); erratum JAMA Intern Med 2025;185:1401',
        doi: '10.1001/jamainternmed.2025.4283',
        inferredClaim:
          'That azelastine nasal spray prevents respiratory viral infection — a single-centre phase 2 result on twenty total events, sponsored and co-authored by the manufacturer, which the investigators explicitly say needs confirmation',
        auditFlag: 'caution',
      },
      {
        id: 'aze-a6',
        category: 'conclusion_shift',
        title:
          'The route was chosen partly to avoid a cardiac effect the oral form actually produces',
        laymanSummary:
          'Taken as a tablet, this drug lengthens the heart’s electrical recovery time slightly. Sprayed into the nose for eight weeks, it does not. The nasal route is not only about getting the drug to the nose.',
        technicalDetails:
          'In a placebo-controlled study of 95 subjects with allergic rhinitis, two sprays per nostril twice daily for 56 days showed no evidence of an effect on cardiac repolarisation as represented by the corrected QT interval. By contrast, multiple-dose oral azelastine produced a mean QTc change of 7.2 msec at 4 mg twice daily and 3.6 msec at 8 mg twice daily. Interaction studies with erythromycin and ketoconazole found no QTc effect on serial electrocardiograms, and at approximately eight times the maximum recommended nasal amount the drug does not prolong QTc to a clinically relevant extent. The specific cytochrome P450 isoforms responsible for its metabolism have never been identified.',
        evidenceSource:
          'Azelastine hydrochloride nasal spray prescribing information, section 12.2 Cardiac Electrophysiology',
        inferredClaim:
          'That a nasal antihistamine is simply an oral antihistamine delivered closer to the target — the same molecule shows a measurable QTc signal by mouth and none by spray, so the route changes the drug’s risk profile as well as its onset',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Sprayed onto the tissue that is inflamed',
        laymanDesc:
          'The drug lands directly on the lining of the nose rather than travelling there through the bloodstream, which is why it starts working in minutes instead of an hour.',
        molecularDetail:
          'Delivered as a metered nasal spray of the hydrochloride salt. Peak plasma concentration comes at 2 to 3 hours, but local mucosal concentration is immediate and far above anything achievable orally. The ophthalmic formulation shows onset of itch prevention within 3 minutes, which is the same principle applied to the conjunctiva.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'About two-fifths of it is absorbed anyway',
        laymanDesc:
          'The nasal lining is thin and richly supplied with blood. A large fraction of the dose crosses into the circulation, so the drug is not confined to the nose in the way the word "topical" suggests.',
        molecularDetail:
          'Systemic bioavailability after intranasal administration is approximately 40%, with a steady-state volume of distribution of 14.5 L/kg and 88% plasma protein binding. Above two sprays per nostril twice daily, Cmax and AUC rise more than proportionally with dose.',
        iconName: 'ArrowRightLeft',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the histamine receptor on the spot',
        laymanDesc:
          'On the nasal lining it occupies the receptor histamine acts through, stopping the itch, sneeze and runny nose signal at the tissue where it starts.',
        molecularDetail:
          'H1 receptor antagonism demonstrated in isolated tissues, animal models and humans, given as a racemate with no in vitro difference between enantiomers. The principal metabolite desmethylazelastine is itself an H1 antagonist at 20% to 50% of parent plasma concentration and has a long enough presence to contribute to the twice-daily interval.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It also quietens the cells that release histamine',
        laymanDesc:
          'Beyond blocking the receiver, it makes mast cells less willing to release their contents in the first place, and damps down two other inflammatory chemical families. This is what oral antihistamines do not do.',
        molecularDetail:
          'In vitro work in human cell lines demonstrates inhibition of histamine and other mediator release from mast cells, inhibition of leukotrienes and platelet-activating factor, and decreased eosinophil chemotaxis and activation. Leukotrienes are a principal driver of nasal congestion, which is the plausible explanation for the congestion effect an oral H1 blocker cannot match.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Total nasal symptoms fall by about four and a half points out of twenty-four',
        laymanDesc:
          'Across three trials in nearly three and a half thousand people, the score summing runny nose, sneezing, itchy nose and blocked nose fell by 4.4 points on this drug against 3.0 on placebo — and by 5.1 on a steroid spray.',
        molecularDetail:
          'Reflective total nasal symptom score, range 0 to 24, summed morning and evening over 14 days: -4.4 (SD 4.8) azelastine, -5.1 (SD 4.9) intranasal fluticasone, -5.7 (SD 5.3) the combination, -3.0 (SD 4.2) placebo, all differences p<0.001 in the pooled analysis of 3,398 patients.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The price paid is taste and alertness',
        laymanDesc:
          'One person in five tastes it bitterly and one in nine feels sleepy on it. Neither is a rare reaction; both are ordinary consequences of the route and the molecule.',
        molecularDetail:
          'Bitter taste 19.7% against 0.6% on placebo; somnolence 11.5% against 5.4%; nasal burning 4.1% against 1.7%. Discontinuation for adverse reactions was nonetheless 2.2% on drug against 2.8% on placebo, so within the trials these effects were tolerated rather than treatment-limiting.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MP4002 (NCT00651118), MP4004 (NCT00740792) and MP4006 (NCT00883168), pooled',
        phase:
          'Three Phase 3, randomised, double-blind, placebo- and active-controlled, 14 days each',
        sampleSize: 3398,
        primaryEndpoint:
          'Sum of morning and evening change from baseline in reflective total nasal symptom score (0-24) over 14 days',
        endpointMet: true,
        statisticalPValue:
          'Combination -5.7, fluticasone -5.1, azelastine -4.4, placebo -3.0; combination superior to each single agent and to placebo, all p<0.001',
        unreportedAdverseSignals:
          'The trials were designed to register the fixed combination, so azelastine appears as an active comparator rather than as the drug under study. On that comparison it is the weakest of the three active arms.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'LaForce 2004 (Ann Allergy Asthma Immunol 93:154-159)',
        phase: 'Randomised, double-blind, placebo-controlled, 2 weeks after open-label lead-in',
        sampleSize: 334,
        primaryEndpoint:
          'Change from baseline to day 14 in total nasal symptom score in patients still symptomatic after a week of fexofenadine',
        endpointMet: true,
        statisticalPValue:
          'Azelastine spray P=0.007 and azelastine plus fexofenadine P=0.003 against placebo; the two azelastine arms did not differ',
        unreportedAdverseSignals:
          'Enrichment by prior non-response to an oral antihistamine makes the population unusually favourable to a nasal agent, and the trial had no active nasal comparator.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CONTAIN (EudraCT 2022-003756-13)',
        phase: 'Phase 2, single-centre, randomised, double-blind, placebo-controlled, 56 days',
        sampleSize: 450,
        primaryEndpoint: 'Number of PCR-confirmed SARS-CoV-2 infections during the study',
        endpointMet: true,
        statisticalPValue:
          '5 of 227 (2.2%) against 15 of 223 (6.7%); odds ratio 0.31 (95% CI 0.11 to 0.87)',
        unreportedAdverseSignals:
          'Twenty events in total, one centre, sponsor is the manufacturer and two authors are company employees including the chief executive. An erratum was published. The investigators call for confirmation in larger multicentric trials.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Cardiac repolarisation study, azelastine nasal spray',
        phase: 'Placebo-controlled, 56 days',
        sampleSize: 95,
        primaryEndpoint:
          'Effect on cardiac repolarisation as represented by the corrected QT interval',
        endpointMet: true,
        statisticalPValue:
          'No evidence of an effect on QTc at two sprays per nostril twice daily for 56 days; oral azelastine 4 mg twice daily produced a mean QTc change of 7.2 msec',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Reflective total nasal symptom score reduction of 4.4 points against 3.0 on placebo in a pooled analysis of 3,398 patients',
        'Intranasal fluticasone reached 5.1 and the fixed combination 5.7 on the same endpoint in the same trials',
        'Bitter taste in 19.7% against 0.6% on placebo, and somnolence in 11.5% against 5.4%, across 391 treated patients',
        'Systemic bioavailability of approximately 40% by the nasal route, with peak plasma concentration at 2 to 3 hours',
        'PCR-confirmed SARS-CoV-2 infection in 5 of 227 against 15 of 223, odds ratio 0.31 (95% CI 0.11 to 0.87), in a phase 2 trial',
      ],
      unsupportedInferences: [
        'That a nasal spray acts only where it is sprayed — about two-fifths is absorbed and the label carries a driving warning',
        'That azelastine is the strongest nasal option — the steroid beat it and the combination beat the steroid in the same trials',
        'That the COVID prevention result is established — twenty events, one centre, manufacturer-sponsored, and the authors say so',
        'That bitter taste drives people off treatment — discontinuation was 2.2% on drug against 2.8% on placebo',
      ],
      whatFailedInitially: [
        'Azelastine came third of three active arms in the pooled registration analysis, behind fluticasone and behind the combination',
        'Somnolence at more than twice the placebo rate, in a product route chosen partly to avoid systemic effects',
        'Oral azelastine produced a mean QTc change of 7.2 msec at 4 mg twice daily, which is why the marketed forms are topical',
        'The cytochrome P450 isoforms responsible for its metabolism have never been identified, so interaction prediction rests on empirical studies alone',
      ],
      realWorldOutcome: [
        'First approved as Astelin, NDA 020114, on 1 November 1996; reformulated as Astepro, NDA 022203, on 15 October 2008',
        'The first antihistamine nasal spray sold over the counter in the United States, NDA 213872, approved 17 June 2021',
        'Combined with fluticasone as Dymista, NDA 202236, approved 1 May 2012 on the strength of the three-trial programme above',
        'The most expensive product per unit in this batch on the CMS acquisition survey, at $1.01 per millilitre',
      ],
    },
    deliverySystem: {
      type: 'Metered nasal spray (0.1% and 0.15%), and a separate ophthalmic solution for allergic conjunctivitis',
      description:
        'Sprayed onto the nasal mucosa, aimed away from the septum, with the head tilted slightly forward to limit run-off into the pharynx — which is what produces the bitter taste. Onset is within minutes; the ophthalmic form prevents itch within 3 minutes and lasts about 8 hours.',
      safetyProfile:
        'Bitter taste in 19.7% against 0.6% on placebo and somnolence in 11.5% against 5.4%, with an explicit label caution against driving or operating machinery and against concurrent alcohol or other central nervous system depressants. Nasal burning, epistaxis, paroxysmal sneezing, nausea, dry mouth, fatigue, dizziness and weight increase all occur at ≥2% and above placebo. Discontinuation for adverse reactions was 2.2% against 2.8% on placebo. No effect on QTc over 56 days by the nasal route, against a mean 7.2 msec change on oral azelastine 4 mg twice daily. The P450 isoforms responsible for metabolism have not been identified.',
    },
    commonQuestions: [
      {
        q: 'Why does it taste so bad?',
        a: 'Because a good deal of what you spray runs down the back of the nose into the throat, and the molecule is intensely bitter. The number is on the label: bitter taste was reported by 19.7% of patients against 0.6% of those on the dummy spray — one of the largest treatment-attributable differences on any label in this batch. Technique reduces it: aim the nozzle towards the outer wall of the nostril rather than the middle, tilt the head slightly forward rather than back, and breathe gently instead of sniffing hard. Worth knowing: in the trials, the taste did not actually make more people stop treatment than placebo did.',
      },
      {
        q: 'Can a nasal spray really make me sleepy?',
        a: 'Yes, and the reason is that "nasal" is not the same as "local". About 40% of what you spray is absorbed into your bloodstream through the nasal lining, which is thin and richly supplied with blood. Somnolence was reported by 11.5% of patients on azelastine against 5.4% on the placebo spray, and the label carries the same warning an oral antihistamine would: avoid hazardous occupations requiring complete mental alertness, and avoid alcohol or other sedatives alongside it.',
        auditNote:
          'This is the clearest illustration in this batch that a route of administration is a claim about where a drug is applied, not about where it ends up.',
      },
      {
        q: 'Is it better than a steroid spray?',
        a: 'No, and the comparison was done properly. Three trials in 3,398 people with moderate-to-severe hay fever compared azelastine, intranasal fluticasone, both in one device, and placebo, on the same 24-point nasal symptom score. The reductions were 3.0 on placebo, 4.4 on azelastine, 5.1 on fluticasone and 5.7 on the combination. So azelastine was the weakest of the three active treatments, and the combination beat both single agents, with response reached days earlier. Where azelastine has the advantage is speed of onset — minutes rather than days — and the ability to work in people an oral antihistamine has already failed.',
      },
      {
        q: 'Does it prevent COVID?',
        a: 'One trial says maybe, and it is not enough to act on. The CONTAIN study randomised 450 healthy adults in Germany to azelastine nasal spray or placebo three times daily for eight weeks and tested them twice weekly. Five infections occurred in the azelastine group and fifteen in the placebo group — 2.2% against 6.7%, odds ratio 0.31 with a confidence interval from 0.11 to 0.87. Rhinovirus infections were also lower. But this is a phase 2 trial at a single hospital with twenty infections in total, sponsored by the manufacturer, with two of the authors employed by the company including its chief executive, and the investigators end their own paper by saying the finding needs confirmation in larger multicentric trials.',
      },
      {
        q: 'Why is it sold as a spray rather than a tablet?',
        a: 'Two reasons, and the second is rarely mentioned. The first is that spraying it onto the nasal lining gets it to the tissue in minutes and produces an effect on nasal congestion that swallowed antihistamines mostly do not. The second is on the label: multiple-dose oral azelastine produced a mean QTc change of 7.2 msec at 4 mg twice daily, while the nasal spray at two sprays per nostril twice daily for 56 days showed no evidence of an effect on cardiac repolarisation in 95 subjects. The route was not only a delivery decision.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Carr W et al. A novel intranasal therapy of azelastine with fluticasone for the treatment of allergic rhinitis. J Allergy Clin Immunol 2012;129:1282-1289.e10',
        identifier: '10.1016/j.jaci.2012.01.077',
        kind: 'doi',
      },
      {
        label:
          'MP4002 — azelastine, fluticasone, MP29-02 and placebo in seasonal allergic rhinitis',
        identifier: 'NCT00651118',
        kind: 'nct',
      },
      {
        label:
          'MP4004 — azelastine, fluticasone, MP29-02 and placebo in seasonal allergic rhinitis',
        identifier: 'NCT00740792',
        kind: 'nct',
      },
      {
        label:
          'MP4006 — azelastine, fluticasone, MP29-02 and placebo in seasonal allergic rhinitis',
        identifier: 'NCT00883168',
        kind: 'nct',
      },
      {
        label:
          'LaForce CF et al. Efficacy of azelastine nasal spray in seasonal allergic rhinitis patients who remain symptomatic after treatment with fexofenadine. Ann Allergy Asthma Immunol 2004;93:154-159',
        identifier: '10.1016/S1081-1206(10)61468-8',
        kind: 'doi',
      },
      {
        label:
          'Lehr T et al.; CONTAIN Study Group. Azelastine nasal spray for prevention of SARS-CoV-2 infections: a phase 2 randomized clinical trial. JAMA Intern Med 2025;185:1309-1317',
        identifier: '10.1001/jamainternmed.2025.4283',
        kind: 'doi',
      },
      {
        label:
          'Azelastine hydrochloride nasal spray prescribing information — Warnings and Precautions 5.1, Adverse Reactions 6.1 Table 1, Clinical Pharmacology 12.2 and 12.3, via openFDA drug labelling',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22azelastine+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: ASTELIN, NDA 020114, approved 1 November 1996; ASTEPRO, NDA 022203, 15 October 2008; ASTEPRO ALLERGY over-the-counter, NDA 213872, 17 June 2021; DYMISTA, NDA 202236, 1 May 2012',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020114',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2267 — azelastine structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2267',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Olopatadine — three strengths of the same eye drop across nineteen years, each shown better
  //    than the last inside an allergen challenge booth, and almost never outside one.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'olopatadine',
    name: 'Olopatadine',
    tradeName: 'Patanol / Pataday / Patanase',
    sponsor:
      'Alcon Laboratories holds the ophthalmic applications — NDA 020688 (18 December 1996), NDA 021545 (22 December 2004) and NDA 206276 (30 January 2015), all now over-the-counter; the nasal spray Patanase (NDA 021861, Novartis, 15 April 2008) is discontinued, and the olopatadine-mometasone nasal combination Ryaltris (NDA 211746, Glenmark) was approved 13 January 2022',
    targetGene: 'HRH1',
    targetProtein:
      'Histamine H1 receptor, with non-lytic stabilisation of human conjunctival mast cells as the second claimed action',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Ophthalmic solution for the treatment of ocular itching associated with allergic conjunctivitis; the nasal spray formulation was indicated for the symptoms of seasonal allergic rhinitis in adults and children aged 6 years and older',
    patientFriendlyIndication: 'Itchy, red, watering eyes from allergy',
    anatomicalSite:
      'Conjunctiva — the transparent membrane over the white of the eye and the inside of the eyelids, which carries a dense population of mast cells',
    conditionContext: {
      conditionExplainer:
        'The surface of the eye is one of the few places where allergen lands directly on a mucous membrane packed with mast cells and nothing filters it. When pollen settles there, histamine is released within seconds, and the itch is immediate and specific — allergic eye itch is unlike almost any other ocular symptom.',
      whyItMatters:
        'Because the itch is fast and unmistakable, it can be provoked deliberately in a clinic. Almost the entire evidence base for this drug comes from that provocation — the conjunctival allergen challenge, where a measured amount of allergen is dropped into the eye and the subject rates the itch minutes later.',
      whoTakesThis:
        'Adults and children, sold without a prescription in the United States since an efficacy supplement was approved on 14 February 2020.',
      clinicalGoals:
        'Less ocular itching, fast and lasting. Both are measured on a 0 to 4 scale in a challenge booth, and the Cochrane review of this whole drug class found no long-term efficacy data at all.',
    },
    oneSentenceVerdict:
      'A dibenzoxepin H1 antagonist that also stabilises human conjunctival mast cells without lysing them — in a 345-subject phase 3 challenge study the 0.77% strength beat vehicle on ocular itching by 0.9 to 1.5 points on a 0-to-4 scale (P<0.0001) and beat the 0.1% and 0.2% strengths that preceded it by 0.3 to 0.5 points at 24 hours (P<0.05), all of it measured minutes after allergen was placed in the eye rather than during a pollen season.',
    laymanHowItWorks:
      'When pollen lands on the surface of your eye, mast cells sitting in that membrane burst open and release histamine, and histamine is what makes the eye itch within seconds. This drop does two things: it occupies the receptor histamine acts on, and it makes the mast cells themselves less willing to burst. The second part is what separates it from a plain antihistamine drop, and unlike an older drug in the same category it does that without damaging the cell membrane in the process.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$2.48 per mL, median across 30 listed products (CMS National Average Drug Acquisition Cost, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Moderate',
      openPatentNotes:
        'The franchise ran on strength increases: 0.1% under NDA 020688 in 1996, 0.2% under NDA 021545 in 2004, and 0.7% (0.77% as the hydrochloride) under NDA 206276 in 2015, each a separate application with its own exclusivity, and each shown superior to the previous one in the same challenge model. An efficacy supplement approved on 14 February 2020 moved the once-daily product to over-the-counter sale. At $2.48 per millilitre it is the most expensive drug per unit in this batch on the CMS acquisition survey.',
      costSource: {
        label:
          'No published cost-of-production study exists for olopatadine; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 30 listed olopatadine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'The Cochrane review of this whole class found that every topical antihistamine and mast cell stabiliser it examined reduced symptoms against placebo in the short term, that only one head-to-head comparison could be meta-analysed at all, and that there is no long-term efficacy data for any of them. The differences between these drops are therefore much less established than the marketing implies.',
      conventionalRx: [
        {
          name: 'Ketotifen ophthalmic',
          class: 'H1 antagonist with mast cell stabilising activity — the direct competitor',
          howItCompares:
            'The only comparison in the Cochrane review with enough studies to meta-analyse was olopatadine against ketotifen. Alcon’s own membrane work found a mechanistic difference: at 1 to 10 mM, ketotifen caused complete haemolysis of bovine erythrocytes while olopatadine caused under 8%, which the authors offered as an explanation for ketotifen’s biphasic non-specific cytotoxicity and olopatadine’s non-lytic mast cell stabilisation. Those concentrations are far above anything achieved on an eye.',
          typicalCost:
            '$1.30 per mL at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: roughly half the acquisition cost per millilitre, long over-the-counter availability. Cons: the membrane-perturbation finding, though at supra-clinical concentrations; the head-to-head clinical data are short-term.',
        },
        {
          name: 'Azelastine ophthalmic',
          class: 'H1 antagonist with mediator-release inhibition',
          howItCompares:
            'The most-studied drug in the Cochrane review, with nine placebo-controlled studies against azelastine alone. Onset of itch prevention within 3 minutes and duration of about 8 hours in a conjunctival antigen challenge — faster onset than olopatadine’s label claim, shorter duration than the 24 hours the 0.77% strength was approved on.',
          typicalCost:
            '$1.01 per mL at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, very fast onset, the largest placebo-controlled evidence base in the class. Cons: bitter taste in about 10% of ophthalmic users as the drop drains into the throat, and transient eye burning in about 30%.',
        },
        {
          name: 'Sodium cromoglicate ophthalmic',
          class: 'Pure mast cell stabiliser with no receptor-blocking action',
          howItCompares:
            'The original of the mechanism olopatadine claims as its second action, and included in the Cochrane review. It has no antihistamine component, so it prevents rather than relieves: it must be started before exposure and used regularly, and it does nothing for an eye that is already itching.',
          typicalCost:
            '$0.5845 per mL of cromolyn at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: about a quarter of the cost, decades of ophthalmic use, no receptor-level effect to wear off. Cons: prophylactic only, needs several doses a day, and slow to establish effect.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Cold compress',
          action: 'A clean, cold, damp cloth held over closed eyes for a few minutes.',
          patientImpact:
            'Cooling reduces itch and vasodilatation directly and has no drug interaction. It addresses the symptom rather than the mechanism, and it works within the same minutes the drop does.',
          clinicalPrecaution:
            'Never rub the eye. Rubbing mechanically degranulates conjunctival mast cells and releases more histamine, which is why the itch-rub cycle escalates.',
        },
        {
          name: 'Take contact lenses out first',
          action:
            'Remove lenses before instilling the drop and wait before replacing them, and check whether the product contains benzalkonium chloride.',
          patientImpact:
            'Preservatives in multi-dose eye drops accumulate in soft contact lenses. Allergic conjunctivitis also makes lens wear less comfortable, and lenses hold allergen against the conjunctiva.',
          clinicalPrecaution:
            'Ocular itching that is severe, associated with pain, light sensitivity or reduced vision, is not routine allergic conjunctivitis and needs assessment rather than an antihistamine drop.',
        },
        {
          name: 'Rinse pollen off the face and hair',
          action: 'Wash the face and rinse hair at the end of a day outdoors during pollen season.',
          patientImpact:
            'The conjunctiva is the one mucous membrane with no filter in front of it, so deposited allergen keeps arriving from hair, skin and hands for hours after exposure ends.',
          clinicalPrecaution:
            'This reduces continued exposure and is not a treatment. It does not substitute for a drop in someone with established symptoms.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(C)CC/C=C\\1/C2=CC=CC=C2COC3=C1C=C(C=C3)CC(=O)O',
      chemicalFormula: 'C21H23NO3',
      molecularWeight: '337.40 g/mol',
      targetReceptorAffinity:
        'A dibenz[b,e]oxepin bearing an exocyclic Z-configured dimethylaminopropylidene and an acetic acid side chain. The geometry of that exocyclic double bond is the whole molecule: the Z isomer is the drug and the E isomer is not, and the carboxylic acid makes it a zwitterion at physiological pH, which limits corneal penetration and keeps the drug on the surface where the mast cells are. Comparative membrane work at 1 to 10 mM found ketotifen completely haemolysed bovine erythrocytes while olopatadine produced under 8% haemolysis, and olopatadine perturbed erythrocyte ghost membranes minimally where ketotifen caused concentration-dependent marker leakage.',
      structureSource: {
        label: 'PubChem CID 5281071 (olopatadine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281071',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'olo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Geometric isomer assignment at the exocyclic alkene',
          description:
            'Establish that the exocyclic double bond is Z rather than E. This is not a stereocentre that can be assayed by chiral chromatography; it requires nuclear Overhauser measurement or crystallography. The E isomer has different pharmacology, and it is the impurity that matters most in a product where nothing else about the molecule is difficult.',
          reagentsAndBuffer:
            'Olopatadine hydrochloride reference standard, NOESY and 1H NMR in DMSO-d6, reversed-phase HPLC resolving E and Z isomers, single-crystal X-ray on the reference lot',
        },
        {
          id: 'olo-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Wittig olefination onto the dibenzoxepinone core',
          description:
            'Build the tricyclic dibenzoxepinone carrying the protected acetic acid arm, then install the aminopropylidene side chain by Wittig or Horner-Wadsworth-Emmons olefination. Olefination is where the Z/E ratio is decided, and the choice of ylide stabilisation and solvent is the process lever that sets it — this step, not the purification, is where the product is won or lost.',
          dependsOnStepId: 'olo-w1',
          reagentsAndBuffer:
            '(3-dimethylaminopropyl)triphenylphosphonium bromide, strong base such as potassium tert-butoxide or n-butyllithium, anhydrous tetrahydrofuran at low temperature, nitrogen atmosphere, then ester hydrolysis to the free acid',
        },
        {
          id: 'olo-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'E/Z separation and hydrochloride crystallisation to ophthalmic grade',
          description:
            'Separate the geometric isomers and crystallise the hydrochloride to a specification suitable for an eye drop. Ophthalmic grade means sterility, isotonicity and sub-visible particulate limits far tighter than an oral product: a particle in a tablet is invisible, and a particle on a cornea is an abrasion.',
          dependsOnStepId: 'olo-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase chromatography, hydrogen chloride in isopropanol, recrystallisation from ethanol and water, 0.22 micron sterile filtration of the finished solution, light-obscuration particulate counting, osmolality and pH verification',
        },
        {
          id: 'olo-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Human conjunctival mast cell challenge',
          description:
            'Apply the compound to mast cells isolated from human conjunctiva and challenge with anti-IgE. Conjunctival mast cells are the specific population the drug is claimed to stabilise, and they behave differently from lung or skin mast cells; a stabilisation result in the wrong tissue would not support the claim on the label. Membrane integrity must be measured alongside mediator release, because a compound that lyses the cell also stops it degranulating.',
          dependsOnStepId: 'olo-w3',
          reagentsAndBuffer:
            'Enzymatically dispersed human conjunctival mast cells, anti-human IgE, HEPES-buffered Tyrode solution with calcium and magnesium, histamine and tryptase immunoassay, lactate dehydrogenase release and 6-carboxyfluorescein leakage as membrane-integrity controls',
        },
        {
          id: 'olo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Conjunctival allergen challenge with a 0-to-4 itch scale',
          description:
            'Instil a titrated allergen into the eye of a sensitised subject and record ocular itching at fixed intervals on a 0 to 4 scale, with conjunctival redness graded in parallel. This is the assay that every approval of this drug rests on. It is reproducible and it is not a pollen season: the allergen amount, the timing and the environment are all controlled, and the endpoint is measured in minutes.',
          dependsOnStepId: 'olo-w4',
          reagentsAndBuffer:
            'Titrated ryegrass, ragweed or cat allergen extract, vehicle-matched control drops, slit-lamp grading of conjunctival, ciliary and episcleral redness, standardised 0-4 itch scale where 4 is incapacitating itch, masked graders',
        },
      ],
    },
    keyAudits: [
      {
        id: 'olo-a1',
        category: 'measured',
        title: 'The 0.77% strength beat vehicle by up to 1.5 points on a 4-point itch scale',
        laymanSummary:
          'In the trial that supported the strongest version, allergen was placed in 345 people’s eyes and they rated the itch on a scale from none to unbearable. The drop lowered that rating by up to one and a half points against a dummy drop, both minutes after the challenge and a full day later.',
        technicalDetails:
          'A five-week, multicentre, double-masked phase 3 trial randomised 345 subjects aged 18 and over with a history of allergic conjunctivitis and a confirmed positive bilateral conjunctival allergen challenge response 2:2:2:1 to olopatadine 0.77%, 0.2%, 0.1% or vehicle, following a single topical dose in each eye. The primary objective was superiority of 0.77% over all comparators on ocular itching, graded 0 to 4 where 4 is incapacitating itch, at 24-hour duration of action, and over vehicle only at onset of action 3, 5 and 7 minutes after challenge. Olopatadine 0.77% was superior to vehicle at all post-challenge timepoints at onset and at 24 hours, with differences in means of -0.9 to -1.5 (P<0.0001), and superior to both 0.2% and 0.1% at 24 hours, with differences of -0.3 to -0.5 (P<0.05). It also improved conjunctival redness and total redness against all comparators at onset (-0.3 to -0.6 and -0.8 to -2.0 respectively, both P<0.05).',
        evidenceSource:
          'McLaurin E, Narvekar A, Gomes P, Adewale A, Torkildsen G. Cornea 2015;34:1245-1251 (NCT01743027)',
        doi: '10.1097/ICO.0000000000000562',
        measuredMetric:
          'Ocular itching on a 0-4 scale at 3, 5 and 7 minutes and at 24 hours after conjunctival allergen challenge',
        auditFlag: 'verified',
      },
      {
        id: 'olo-a2',
        category: 'inferred',
        title: 'Almost the whole evidence base is a challenge booth, not a pollen season',
        laymanSummary:
          'The trials that establish this drug work by putting a measured amount of allergen into the eye in a clinic and asking how much it itches a few minutes later. That is a clean experiment. It is not the same thing as living through a spring.',
        technicalDetails:
          'The conjunctival allergen challenge model titrates allergen to produce a reproducible bilateral response, then measures itching and redness at fixed short intervals under masked grading. Its advantages are exactly what limit its external validity: a single controlled exposure, a highly selected population screened for a confirmed positive response, an endpoint recorded within minutes, and no natural variability in allergen load, humidity, wind or concurrent nasal disease. The registration trial for the 0.77% strength followed a single topical dose in each eye. The Cochrane review of the entire topical antihistamine and mast cell stabiliser class found 30 randomised trials in 4,344 participants covering 17 different drugs or comparisons, evaluated only short-term effects with treatment ranging from one to eight weeks, and stated that there is no long-term data on efficacy for any drug in the class.',
        evidenceSource:
          'McLaurin E et al., Cornea 2015;34:1245-1251; Castillo M, Scott NW, Mustafa MZ, Mustafa MS, Azuara-Blanco A. Cochrane Database Syst Rev 2015;6:CD009566',
        doi: '10.1002/14651858.CD009566.pub2',
        inferredClaim:
          'That a 0.9-to-1.5-point advantage on itch minutes after a controlled allergen challenge describes the benefit of using the drop through an allergy season — no long-term efficacy data exists for any drug in this class',
        auditFlag: 'contested',
      },
      {
        id: 'olo-a3',
        category: 'measured',
        title:
          'Each new strength beat the one before it, and each got its own application and exclusivity',
        laymanSummary:
          'The same molecule was approved three times at three strengths across nineteen years, and each time the new strength was shown better than the old one in the same booth. That is a real finding and also a commercial pattern worth naming.',
        technicalDetails:
          'NDA 020688 approved the 0.1% ophthalmic solution on 18 December 1996; NDA 021545 approved the 0.2% once-daily solution on 22 December 2004; NDA 206276 approved the 0.7% solution on 30 January 2015. The 2015 registration trial compared the new strength against both older strengths as active comparators and against vehicle, and found the differences over the older strengths at 24 hours were -0.3 to -0.5 points on the 0-4 itch scale (P<0.05) — statistically clear and a third to a half of one point on a four-point scale. An efficacy supplement approved on 14 February 2020 moved the once-daily product to over-the-counter status.',
        evidenceSource:
          'Drugs@FDA: NDA 020688 (18 December 1996), NDA 021545 (22 December 2004), NDA 206276 (30 January 2015), NDA 021545 efficacy supplement 22 approved 14 February 2020; McLaurin E et al., Cornea 2015;34:1245-1251',
        doi: '10.1097/ICO.0000000000000562',
        measuredMetric:
          'Difference in mean ocular itching at 24 hours, 0.77% against 0.2% and 0.1%',
        auditFlag: 'verified',
      },
      {
        id: 'olo-a4',
        category: 'inferred',
        title:
          'The mast-cell-stabilising claim rests on membrane work at concentrations no eye reaches',
        laymanSummary:
          'The distinguishing claim is that this drug calms mast cells without damaging them, unlike an older rival. The experiment behind that used concentrations thousands of times higher than a drop delivers, in cow red blood cells.',
        technicalDetails:
          'Comparative work from the manufacturer’s laboratories examined olopatadine and ketotifen against phospholipid monolayers and against erythrocyte membranes. Both compounds were surface active and interacted with monolayers, but olopatadine produced smaller surface pressure changes. Exposure of bovine erythrocytes to ketotifen at 1 to 10 mM produced complete haemolysis while olopatadine at the same 1 to 10 mM produced under 8%; in erythrocyte ghosts, olopatadine at 0.1 to 10 mM minimally perturbed the membrane while ketotifen at 1 to 10 mM caused concentration-dependent marker leakage. The authors offered this as an explanation for ketotifen’s biphasic non-specific cytotoxic effect on histamine release and for olopatadine’s non-lytic mast cell stabilising activity. Millimolar is three orders of magnitude above the concentration a 0.1% to 0.7% eye drop sustains on the ocular surface, and the cells are bovine erythrocytes rather than human conjunctival mast cells.',
        evidenceSource:
          'Brockman H, Graff G, Spellman J, Yanni J. Acta Ophthalmol Scand Suppl 2000;(230):10-15',
        doi: '10.1034/j.1600-0420.2000.078s230010.x',
        inferredClaim:
          'That olopatadine stabilises mast cells non-lytically where ketotifen does not — a mechanism inferred from millimolar membrane experiments in bovine erythrocytes, published by the manufacturer, and not from a clinical comparison',
        auditFlag: 'contested',
      },
      {
        id: 'olo-a5',
        category: 'failed',
        title: 'The nasal spray was approved in 2008 and is discontinued',
        laymanSummary:
          'The same molecule was developed as a nose spray for hay fever, approved in 2008, and is no longer marketed. Azelastine, its direct competitor in that form, went the other way and became the first over-the-counter antihistamine nasal spray.',
        technicalDetails:
          'Patanase, olopatadine hydrochloride nasal spray, was approved under NDA 021861 on 15 April 2008 for the symptoms of seasonal allergic rhinitis in adults and children aged 6 and over, and is listed in Drugs@FDA as discontinued. The competing nasal antihistamine azelastine, first approved in 1996, was granted over-the-counter status under NDA 213872 on 17 June 2021. Olopatadine returned to the nasal route only in combination, as Ryaltris with mometasone furoate, approved as NDA 211746 on 13 January 2022 — the same combination strategy that produced Dymista from azelastine a decade earlier.',
        evidenceSource:
          'Drugs@FDA: PATANASE, NDA 021861, approved 15 April 2008, Novartis, discontinued; RYALTRIS, NDA 211746, approved 13 January 2022, Glenmark',
        measuredMetric:
          'Regulatory marketing status of the nasal formulation, Drugs@FDA product listings',
        auditFlag: 'caution',
      },
      {
        id: 'olo-a6',
        category: 'measured',
        title: 'The class as a whole works, and only one head-to-head could be pooled',
        laymanSummary:
          'A systematic review of every eye-drop antihistamine and mast cell stabiliser found that all of them beat a dummy drop in the short term and none of them had long-term data. Out of seventeen different drug comparisons, only one had enough studies to combine statistically — and it happened to be this drug against its main rival.',
        technicalDetails:
          'The Cochrane review identified 30 randomised trials with 4,344 participants covering 17 different drugs or treatment comparisons, including nedocromil, sodium cromoglicate, olopatadine, ketotifen, azelastine, emedastine, levocabastine, mequitazine and bepotastine. Risk of bias was low overall but reporting quality was variable and outcome reporting highly heterogeneous. Meta-analysis was possible for only one comparison — olopatadine against ketotifen. The review concluded that all reported topical antihistamines and mast cell stabilisers reduce symptoms and signs of seasonal allergic conjunctivitis against placebo in the short term, that there is no long-term efficacy data, that direct comparisons need cautious interpretation, and that no serious adverse events related to this class were reported.',
        evidenceSource:
          'Castillo M, Scott NW, Mustafa MZ, Mustafa MS, Azuara-Blanco A. Cochrane Database Syst Rev 2015;6:CD009566',
        doi: '10.1002/14651858.CD009566.pub2',
        measuredMetric:
          'Participant-reported severity of ocular itching, irritation, tearing and photophobia against placebo, 30 trials',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Dropped onto the surface it needs to treat',
        laymanDesc:
          'An eye drop puts the medicine exactly where the pollen landed. There is no absorption step to wait for and no journey through the body.',
        molecularDetail:
          'Instilled directly onto the conjunctiva. The molecule is a zwitterion at physiological pH — a carboxylic acid and a tertiary amine on the same scaffold — so corneal penetration is limited and the drug remains largely on the ocular surface, which is where the conjunctival mast cell population sits.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the mast cells without entering the cell',
        laymanDesc:
          'It works from outside the cell membrane rather than by getting inside and disrupting it. That distinction is the whole argument for this drug over its older rival.',
        molecularDetail:
          'Comparative monolayer and erythrocyte work found olopatadine intrinsically surface active but producing smaller surface pressure changes than ketotifen, and minimal membrane perturbation at 0.1 to 10 mM where ketotifen caused concentration-dependent leakage and complete haemolysis. The finding is at millimolar concentrations in bovine cells and is a mechanistic inference rather than a clinical measurement.',
        iconName: 'ShieldCheck',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the histamine receptor on the conjunctiva',
        laymanDesc:
          'It takes the seat histamine needs on the surface of the eye, so the histamine released by mast cells has nowhere to signal.',
        molecularDetail:
          'Selective H1 receptor antagonism on conjunctival vasculature and sensory nerve endings. The label for the once-daily strength claims a 24-hour duration of action, which the registration trial tested directly by grading itch a full day after a single dose.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It makes the mast cells less willing to fire',
        laymanDesc:
          'Beyond blocking the receiver, it damps down the release of histamine in the first place, so the reaction is smaller as well as less audible.',
        molecularDetail:
          'Stabilisation of human conjunctival mast cells is the claimed second action, and it is what puts this drug in the dual-action category rather than the antihistamine category. The distinguishing evidence is the non-lytic character of that stabilisation, established against ketotifen in membrane models rather than in a clinical comparison.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Itch falls by about one point out of four, within minutes',
        laymanDesc:
          'On a scale where zero is no itch and four is unbearable, the strongest version lowered the rating by roughly one to one and a half points against a dummy drop, three minutes after allergen was placed in the eye.',
        molecularDetail:
          'Differences in mean ocular itching of -0.9 to -1.5 against vehicle at 3, 5 and 7 minutes post-challenge and at 24 hours (P<0.0001), with conjunctival redness improved by -0.3 to -0.6 and total redness by -0.8 to -2.0 against all comparators at onset (both P<0.05), in 345 randomised subjects.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What was never measured is a season',
        laymanDesc:
          'Everything above happened in a clinic with a measured amount of allergen. No trial of this drug or any drug in its class has reported long-term efficacy.',
        molecularDetail:
          'The Cochrane review of 30 trials in 4,344 participants evaluated only short-term effects, with treatment durations of one to eight weeks, and states that there is no long-term data on efficacy for any topical antihistamine or mast cell stabiliser.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01743027 (McLaurin 2015, Cornea 34:1245-1251)',
        phase: 'Phase 3, multicentre, randomised, double-masked, conjunctival allergen challenge',
        sampleSize: 345,
        primaryEndpoint:
          'Ocular itching on a 0-4 scale at 24-hour duration of action against all comparators, and at 3, 5 and 7 minutes against vehicle',
        endpointMet: true,
        statisticalPValue:
          'Against vehicle: differences in means -0.9 to -1.5 at all post-challenge timepoints, P<0.0001. Against olopatadine 0.2% and 0.1% at 24 hours: -0.3 to -0.5, P<0.05',
        unreportedAdverseSignals:
          'A single topical dose in each eye, in subjects pre-screened for a confirmed positive bilateral challenge response. The model measures a provoked response in a clinic, not symptom control across a season.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Cochrane CD009566.pub2 — topical antihistamines and mast cell stabilisers',
        phase: 'Systematic review of 30 randomised trials across 17 drugs or comparisons',
        sampleSize: 4344,
        primaryEndpoint:
          'Participant-reported severity of ocular itching, irritation, tearing and photophobia',
        endpointMet: true,
        statisticalPValue:
          'All reported agents reduced symptoms and signs against placebo in the short term; meta-analysis possible for one comparison only (olopatadine against ketotifen)',
        unreportedAdverseSignals:
          'Treatment durations of one to eight weeks only, with no long-term efficacy data for any drug in the class. Outcome reporting was highly variable and poor reporting quality challenged synthesis.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Brockman 2000 (Acta Ophthalmol Scand Suppl 230:10-15)',
        phase: 'In vitro membrane biophysics, manufacturer laboratories',
        sampleSize: 0,
        primaryEndpoint:
          'Surface pressure change in phospholipid monolayers and haemolysis or marker leakage in erythrocyte membranes',
        endpointMet: true,
        statisticalPValue:
          'Ketotifen 1-10 mM caused complete haemolysis of bovine erythrocytes; olopatadine 1-10 mM caused under 8%',
        unreportedAdverseSignals:
          'Millimolar concentrations, three orders of magnitude above what an eye drop sustains, in bovine erythrocytes rather than human conjunctival mast cells, published by the manufacturer of the favoured compound.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Ocular itching lowered by 0.9 to 1.5 points on a 0-4 scale against vehicle at 3 to 7 minutes and at 24 hours, in 345 randomised subjects',
        'The 0.77% strength better than the 0.2% and 0.1% strengths by 0.3 to 0.5 points at 24 hours (P<0.05)',
        'Conjunctival redness improved by 0.3 to 0.6 and total redness by 0.8 to 2.0 against all comparators at onset',
        'Ketotifen fully haemolysed bovine erythrocytes at 1-10 mM where olopatadine produced under 8% haemolysis',
      ],
      unsupportedInferences: [
        'That a challenge-booth itch score describes benefit across a pollen season — no long-term efficacy data exists for any drug in this class',
        'That the non-lytic mast cell stabilisation established at millimolar concentrations in bovine erythrocytes operates at eye-drop concentrations in human conjunctival mast cells',
        'That the dual-action label distinguishes this drop clinically from a plain antihistamine drop — the Cochrane review found only one poolable head-to-head comparison in the entire class',
        'That successive strength increases represent successive therapeutic advances rather than successive applications',
      ],
      whatFailedInitially: [
        'The nasal spray formulation, approved as Patanase in April 2008, is discontinued, while its direct competitor azelastine went over-the-counter',
        'Only one of seventeen drug comparisons in the Cochrane review had enough studies to meta-analyse',
        'The mechanistic differentiation from ketotifen has never been demonstrated at clinical concentrations or in the relevant cell type',
        'No trial in this class has reported efficacy beyond eight weeks',
      ],
      realWorldOutcome: [
        'Approved as Patanol 0.1% on 18 December 1996, Pataday 0.2% on 22 December 2004, and the 0.7% strength on 30 January 2015',
        'Moved to over-the-counter sale by an efficacy supplement approved on 14 February 2020',
        'Returned to the nasal route only in fixed combination with mometasone, as Ryaltris, approved 13 January 2022',
        'The most expensive product per unit in this batch on the CMS acquisition survey, at $2.48 per millilitre',
      ],
    },
    deliverySystem: {
      type: 'Ophthalmic solution (0.1%, 0.2% and 0.7%), formerly also a metered nasal spray now discontinued',
      description:
        'One drop in each affected eye, once or twice daily depending on strength. Contact lenses should be removed before instillation. The zwitterionic molecule stays largely on the ocular surface rather than penetrating the cornea, which is where the target mast cells are.',
      safetyProfile:
        'The Cochrane review of 30 trials in 4,344 participants reported no serious adverse events related to topical antihistamines and mast cell stabilisers as a class, and found them safe and well tolerated. No safety concerns were identified for the 0.77% strength in its registration trial. The ophthalmic route keeps systemic exposure minimal, in contrast to nasal antihistamines where about 40% of the delivered amount is absorbed. Transient stinging on instillation and preservative sensitivity are the usual practical limits.',
    },
    commonQuestions: [
      {
        q: 'How was this actually tested?',
        a: 'By putting allergen in people’s eyes on purpose. The conjunctival allergen challenge model takes people with a confirmed allergic response, titrates a measured amount of pollen or cat extract into both eyes, and has them rate the itch on a scale from 0 to 4 at fixed intervals — three, five and seven minutes afterwards, and again a full day later. In the trial for the strongest version, 345 subjects received a single drop in each eye and the drug lowered the itch rating by 0.9 to 1.5 points against a dummy drop. It is a clean, reproducible experiment. It is also a single controlled exposure in a clinic, and the Cochrane review of this entire class of eye drops states that there is no long-term data on efficacy for any of them.',
      },
      {
        q: 'What does "dual action" mean, and does it matter?',
        a: 'It means the drop is claimed to do two things: block the histamine receptor, and make conjunctival mast cells less likely to release histamine in the first place. The second part is what distinguishes it from a plain antihistamine drop. The evidence that it does this without damaging the cells comes from membrane experiments comparing it with ketotifen: at concentrations of 1 to 10 millimolar, ketotifen completely destroyed bovine red blood cells while olopatadine destroyed under 8% of them. Whether that translates into a clinical difference is unresolved — the Cochrane review found that olopatadine against ketotifen was the one comparison in the whole class with enough studies to combine statistically, and it cautioned against reading direct comparisons too firmly.',
      },
      {
        q: 'Why are there three strengths of the same drop?',
        a: 'Each was a separate approval nineteen years apart: 0.1% in December 1996, 0.2% in December 2004 and 0.7% in January 2015. The 2015 trial did compare the new strength against both older ones head to head and found it better at 24 hours — by 0.3 to 0.5 points on a four-point itch scale, which is statistically clear and, in absolute terms, between a third and a half of one point. Each new strength came with its own new drug application and its own exclusivity period. Both readings of that sequence are available and both are supported by the same data.',
      },
      {
        q: 'What happened to the nose spray version?',
        a: 'It was approved as Patanase in April 2008 and is now discontinued. Its direct competitor, azelastine nasal spray, went in the opposite direction and became the first antihistamine nasal spray sold over the counter in the United States in June 2021. Olopatadine came back to the nose only in combination with a steroid, as Ryaltris, approved in January 2022 — which is the same route azelastine took a decade earlier when it was combined with fluticasone.',
      },
      {
        q: 'Is it worth the price against the cheaper drops?',
        a: 'On the acquisition survey it is the most expensive drug per unit in this group: $2.48 per millilitre against $1.30 for ketotifen, $1.01 for azelastine and $0.58 for cromolyn, all as median United States pharmacy acquisition costs effective 19 August 2026. Those are what pharmacies pay, not what a patient is charged. The Cochrane review found that every drug in this class reduced symptoms against placebo in the short term and that direct comparisons between them need cautious interpretation. So the case for paying more rests on a difference the systematic review says has not been firmly established.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McLaurin E, Narvekar A, Gomes P, Adewale A, Torkildsen G. Phase 3 randomized double-masked study of efficacy and safety of once-daily 0.77% olopatadine hydrochloride ophthalmic solution in subjects with allergic conjunctivitis using the conjunctival allergen challenge model. Cornea 2015;34:1245-1251',
        identifier: '10.1097/ICO.0000000000000562',
        kind: 'doi',
      },
      {
        label:
          'Olopatadine 0.77% against 0.2%, 0.1% and vehicle in the conjunctival allergen challenge model, 345 subjects',
        identifier: 'NCT01743027',
        kind: 'nct',
      },
      {
        label:
          'Castillo M, Scott NW, Mustafa MZ, Mustafa MS, Azuara-Blanco A. Topical antihistamines and mast cell stabilisers for treating seasonal and perennial allergic conjunctivitis. Cochrane Database Syst Rev 2015;6:CD009566',
        identifier: '10.1002/14651858.CD009566.pub2',
        kind: 'doi',
      },
      {
        label:
          'Brockman H, Graff G, Spellman J, Yanni J. A comparison of the effects of olopatadine and ketotifen on model membranes. Acta Ophthalmol Scand Suppl 2000;(230):10-15',
        identifier: '10.1034/j.1600-0420.2000.078s230010.x',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: PATANOL / PATADAY TWICE DAILY RELIEF, NDA 020688, approved 18 December 1996; PATADAY ONCE DAILY RELIEF, NDA 021545, 22 December 2004, over-the-counter efficacy supplement approved 14 February 2020; 0.7% strength, NDA 206276, 30 January 2015',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021545',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: PATANASE (olopatadine hydrochloride) nasal spray, NDA 021861, approved 15 April 2008, discontinued; RYALTRIS (olopatadine and mometasone) nasal spray, NDA 211746, approved 13 January 2022',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021861',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5281071 — olopatadine structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281071',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Cromolyn — the original mast cell stabiliser, whose stabilising mechanism its own
  //    pharmacologists still describe as a mystery, and whose paediatric asthma evidence Cochrane
  //    found distorted by publication bias.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cromolyn',
    name: 'Cromolyn',
    tradeName: 'Intal / Nasalcrom / Gastrocrom / Opticrom',
    sponsor:
      'Synthesised at Fisons in the 1960s; the surviving United States applications are Gastrocrom oral concentrate (NDA 020479, approved 29 February 1996, now Viatris Specialty) and generics for the inhalation, nasal and ophthalmic routes — the original Intal, Opticrom and Crolom brands are no longer listed as marketed',
    targetGene: 'Not established',
    targetProtein:
      'No target has been confirmed. The classical account is stabilisation of the mast cell membrane; current candidates include the orphan receptor GPR35 and the annexin A1 / formyl peptide receptor anti-inflammatory loop',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1982,
    indication:
      'Inhalation solution as a prophylactic agent in the management of bronchial asthma; nasal solution over the counter for prevention and relief of allergic rhinitis symptoms; ophthalmic solution for allergic conjunctivitis; oral concentrate for mastocytosis',
    patientFriendlyIndication:
      'Preventing asthma attacks, hay fever and itchy eyes before they start — and, by mouth, the gut symptoms of mastocytosis',
    anatomicalSite:
      'The mucosal surface it is applied to — bronchial epithelium, nasal mucosa, conjunctiva, or gut lumen. Almost none of it is absorbed, which is the whole design',
    conditionContext: {
      conditionExplainer:
        'Every other drug on this shelf works after histamine has been released. Cromolyn was built to work before: to make the mast cell itself less willing to open, so the allergic reaction is smaller from the start. That is why it has to be taken regularly and in advance, and why it does nothing for symptoms already under way.',
      whyItMatters:
        'It is the drug that created the category "mast cell stabiliser", and nearly sixty years later the pharmacologists who worked on it describe the exact mechanism as a mystery. Meanwhile the Cochrane review of its main indication found the published evidence distorted by missing negative trials.',
      whoTakesThis:
        'Historically children with asthma, and still people with allergic rhinitis and allergic conjunctivitis over the counter. The oral concentrate is used for mastocytosis, where the target cell is unambiguously the mast cell.',
      clinicalGoals:
        'Prevention rather than relief. The Cochrane review of childhood asthma found no significant difference from placebo on symptom-free days, and publication bias likely to have overestimated everything else.',
    },
    oneSentenceVerdict:
      'A bis-chromone so poorly absorbed that it only works where it is sprayed — the drug that named the mast cell stabiliser class, whose mechanism its own pharmacologists called a mystery as recently as 2017, and whose Cochrane review of 23 trials in 1,026 children found no significant difference from placebo on symptom-free days with a funnel plot showing missing small negative studies.',
    laymanHowItWorks:
      'Most allergy drugs block the receiver of the histamine signal. This one was designed to stop the signal being sent: to make the cells that store histamine less willing to release it when they meet an allergen. Because it barely gets absorbed, it only works on whatever surface you apply it to — the nose, the eye, the airway lining — and it has to be there before the allergen arrives. Exactly how it calms those cells has never been settled.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 44,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.5845 per mL, median across 6 listed products (CMS National Average Drug Acquisition Cost, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Moderate',
      openPatentNotes:
        'Only six products appear in the CMS acquisition survey, the smallest number of any drug in this batch — a marker of a molecule in retreat rather than of scarcity. Every original brand has left the active Drugs@FDA product listing: what remains are generics under abbreviated applications for inhalation (2000), nasal over-the-counter (2001) and ophthalmic (1999) routes, plus the oral concentrate Gastrocrom under NDA 020479 from 29 February 1996 and its generics.',
      costSource: {
        label:
          'No published cost-of-production study exists for cromolyn; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 6 listed cromolyn products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'In asthma the substitute is the drug class that displaced it: inhaled corticosteroids, whose use rose from 1990 onward and whose evidence base is not in question. In allergic rhinitis and conjunctivitis the comparison is with the newer dual-action agents that combine mast cell stabilisation with receptor blockade, and which therefore also work once symptoms have started.',
      conventionalRx: [
        {
          name: 'Inhaled corticosteroid',
          class: 'Topical anti-inflammatory — the class that replaced cromolyn in asthma',
          howItCompares:
            'The Cochrane review of cromolyn in childhood asthma opens by noting that its use decreased after 1990 when inhaled corticosteroids became popular. The review then found insufficient evidence to be sure cromolyn beats placebo at all, with publication bias likely to have overestimated what benefit was reported.',
          typicalCost:
            'US$0.7198 per millilitre of budesonide inhalation suspension, median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: an evidence base that is not in dispute, and once- or twice-daily dosing rather than four times. Cons: local effects including oral candidiasis and dysphonia, and systemic absorption that cromolyn essentially does not have.',
        },
        {
          name: 'Olopatadine or ketotifen ophthalmic',
          class: 'Dual-action H1 antagonist plus mast cell stabiliser',
          howItCompares:
            'Does what cromolyn does and also blocks the histamine receptor, so it relieves an eye that is already itching rather than only preventing one that is not. Cromolyn is included in the same Cochrane review of this class, which found all reported agents reduced symptoms against placebo in the short term.',
          typicalCost:
            '$2.48 per mL for olopatadine and $1.30 per mL for ketotifen at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: works on established symptoms, once or twice daily. Cons: four times the cost per millilitre for olopatadine; cromolyn remains the option where a receptor-blocking drug is unwanted.',
        },
        {
          name: 'Intranasal corticosteroid',
          class: 'Topical anti-inflammatory for the nose',
          howItCompares:
            'Suppresses the whole inflammatory cascade rather than one upstream step, and works on nasal congestion, which cromolyn addresses weakly. Cromolyn nasal solution remains available over the counter and requires dosing several times daily where a steroid spray is once.',
          typicalCost:
            'US$0.6920 per millilitre of fluticasone, median across 51 listed products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: greater effect, once-daily, cheaper per millilitre. Cons: nosebleeds in a minority; cromolyn has arguably the most benign safety record of any drug in this batch.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Start it before the season, not during',
          action:
            'Begin regular use a week or two ahead of expected exposure and keep it up, rather than reaching for it when symptoms arrive.',
          patientImpact:
            'This is a prophylactic agent by design and by label: it acts on mediator release rather than on the receptor, so it has nothing to offer a reaction already in progress. The inhalation label states the effect is usually evident after several weeks of treatment.',
          clinicalPrecaution:
            'Using it as a rescue treatment and concluding it does not work is the commonest way this drug is misjudged. That said, the Cochrane review found the prophylactic evidence itself insufficient.',
        },
        {
          name: 'Compare the total daily doses',
          action:
            'Check how many times a day the product requires, and whether that is realistic before starting.',
          patientImpact:
            'Cromolyn formulations are typically dosed several times daily across every route. Against a once-daily steroid spray or a once-daily eye drop, the adherence gap is large and it is the practical reason the drug lost ground rather than a pharmacological one.',
          clinicalPrecaution:
            'Irregular use of a prophylactic agent is close to no use at all, and unlike a receptor blocker there is no immediate feedback telling you a dose was missed.',
        },
        {
          name: 'Reduce exposure at the same time',
          action: 'Allergen avoidance measures alongside, rather than instead of, the drug.',
          patientImpact:
            'A drug that raises the threshold for mast cell release works better the lower the allergen load it has to raise it against. This is one of the few places where avoidance and pharmacology genuinely compound.',
          clinicalPrecaution:
            'Avoidance measures have their own weak evidence base and are not a substitute for treatment of established allergic disease.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC2=C(C(=C1)OCC(COC3=CC=CC4=C3C(=O)C=C(O4)C(=O)O)O)C(=O)C=C(O2)C(=O)O',
      chemicalFormula: 'C23H16O11',
      molecularWeight: '468.40 g/mol',
      targetReceptorAffinity:
        'No binding constant can be quoted, because the target is unresolved. The molecule is a symmetrical bis-chromone: two chromone-2-carboxylic acid units joined by a 2-hydroxypropylene bridge, giving two carboxylic acids that are fully ionised at physiological pH. That double negative charge is why oral bioavailability is negligible and why the drug acts only on the surface it is applied to — and it is also why no plasma concentration-effect relationship has ever been established for it.',
      structureSource: {
        label:
          'PubChem CID 2882 (cromoglicic acid) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2882',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'crm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Symmetry and dicarboxylate stoichiometry',
          description:
            'Confirm that both chromone arms are present and both carboxylic acids are free. The molecule is a symmetrical dimer and the commonest process impurity is the mono-chromone fragment, which has neither the geometry nor the charge of the drug. Sodium content is measured as an identity check because the marketed form is the disodium salt.',
          reagentsAndBuffer:
            'Cromoglicic acid reference standard, reversed-phase HPLC with ultraviolet detection at 326 nm, 1H NMR in D2O, flame photometry or ion chromatography for sodium stoichiometry, Karl Fischer titration',
        },
        {
          id: 'crm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Double Kostanecki condensation onto the epichlorohydrin bridge',
          description:
            'Join two 2,6-dihydroxyacetophenone units through an epichlorohydrin-derived bridge, then close both chromone rings and hydrolyse the esters to the free diacid. The two ring closures have to succeed on both arms: a single-armed product looks similar by mass but is pharmacologically inert, and separating it is the reason the process is only moderately cheap.',
          dependsOnStepId: 'crm-w1',
          reagentsAndBuffer:
            '2,6-dihydroxyacetophenone, epichlorohydrin, potassium carbonate in acetone or dimethylformamide, diethyl oxalate with sodium ethoxide for the chromone closure, then aqueous sodium hydroxide hydrolysis',
        },
        {
          id: 'crm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Disodium salt formation and sterile solution preparation',
          description:
            'Convert to the disodium salt and prepare the solution to inhalation, nasal or ophthalmic grade. Because the finished products are nebulised, sprayed or dropped onto mucosa, the specifications on sterility, particulates and osmolality dominate — and unlike a tablet, nothing about the formulation can compensate for a molecule that will not be absorbed.',
          dependsOnStepId: 'crm-w2',
          reagentsAndBuffer:
            'Sodium hydroxide to exactly two equivalents, activated carbon treatment, 0.22 micron sterile filtration, osmolality and pH verification, light-obscuration particulate counting, endotoxin testing',
        },
        {
          id: 'crm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Mast cell degranulation across species and subtype',
          description:
            'Challenge mast cells from more than one species and more than one tissue and measure mediator release. This is the step that exposes the problem: the 2017 review of the cromones states that the classical mast cell stabiliser account cannot explain the discrepancies between species and between mast cell subtypes in their response to these drugs. A single-preparation result would conceal exactly the inconsistency that matters.',
          dependsOnStepId: 'crm-w3',
          reagentsAndBuffer:
            'Rat peritoneal mast cells alongside human lung and human conjunctival mast cells, anti-IgE and compound 48/80 as secretagogues, HEPES-buffered Tyrode solution with calcium and magnesium, histamine and tryptase immunoassay, lactate dehydrogenase release as a viability control',
        },
        {
          id: 'crm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GPR35 signalling and annexin A1 dependence',
          description:
            'Test the two current mechanistic candidates against each other in the same system. Cromoglicate, nedocromil and zaprinast increase inositol phosphate accumulation and calcium mobilisation in cells transfected with GPR35; separately, cromones potentiate glucocorticoid-induced annexin A1 release by inhibiting PP2A, and depleting annexin A1 in vitro completely reverses their inhibitory action. Running both arms is the only way to distinguish a receptor mechanism from a phosphatase one.',
          dependsOnStepId: 'crm-w4',
          reagentsAndBuffer:
            'HEK293 cells transfected with human GPR35, inositol phosphate accumulation assay and calcium imaging with Fura-2, zaprinast as a comparator agonist; for the second arm, annexin A1 small interfering RNA knockdown, PP2A phosphatase activity assay, dexamethasone co-treatment and formyl peptide receptor antagonists',
        },
      ],
    },
    keyAudits: [
      {
        id: 'crm-a1',
        category: 'failed',
        title:
          'Cochrane: no significant benefit on symptom-free days, and the missing studies were the negative ones',
        laymanSummary:
          'Twenty-three trials in a thousand children were pooled. On the cleanest measure — how many days a child had no symptoms — the drug was no better than placebo. The pattern of published studies showed that small trials with negative results were missing from the literature.',
        technicalDetails:
          'The Cochrane review searched for all double-blind placebo-controlled randomised trials of inhaled sodium cromoglycate as maintenance therapy in children aged 0 to 18 with asthma, screening 3,500 titles and including 24 papers reporting 23 studies published between 1970 and 1997, together enrolling 1,026 participants. Most were crossover studies and few provided enough information to judge allocation concealment. Four studies reported percentage of symptom-free days; pooling them revealed no statistically significant difference between cromoglycate and placebo. Other pooled symptom outcomes and bronchodilator use reached statistical significance but with small treatment effects, and the confidence intervals were wide enough that a clinically relevant effect could not be excluded either. The funnel plot showed an under-representation of small studies with negative results, indicating publication bias. The authors concluded there is insufficient evidence to be sure about efficacy over placebo, and that publication bias is likely to have overestimated the beneficial effects.',
        evidenceSource:
          'van der Wouden JC, Uijen JH, Bernsen RM, Tasche MJ, de Jongste JC, Ducharme F. Cochrane Database Syst Rev 2008;4:CD002173',
        doi: '10.1002/14651858.CD002173.pub2',
        measuredMetric:
          'Percentage of symptom-free days, pooled across four trials, cromoglycate against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'crm-a2',
        category: 'inferred',
        title: 'The mechanism that named a whole drug class has never been established',
        laymanSummary:
          'Cromolyn is the original "mast cell stabiliser" and the phrase was invented for it. Nearly sixty years after it was made, the pharmacologists reviewing it wrote that the exact mechanism remained a mystery.',
        technicalDetails:
          'A 2017 review by researchers including one of the original pharmacologists in the field states that while early studies attributed the cromones’ ability to prevent allergic reactions to their mast cell stabilising properties, the exact pharmacological mechanism by which this occurred remained a mystery, and that the classical account cannot explain the discrepancies between species and between mast cell subtypes in their response to these drugs. Two candidate mechanisms are advanced. First, the orphan G-protein coupled receptor GPR35: cromoglycate, nedocromil and zaprinast increase inositol phosphate accumulation and calcium mobilisation in HEK cells transfected with GPR35, though the review notes its significance to asthma, allergy or mast cell mediator release is yet to be elucidated and it is unclear how those actions would translate into therapeutic effect. Second, the annexin A1 and formyl peptide receptor anti-inflammatory loop: cromones potentiate glucocorticoid-induced annexin A1 release by inhibiting PP2A phosphatase activity, and depletion of annexin A1 in vitro completely reverses their inhibitory actions.',
        evidenceSource: 'Sinniah A, Yazid S, Flower RJ. Front Pharmacol 2017;8:827',
        doi: '10.3389/fphar.2017.00827',
        inferredClaim:
          'That cromolyn works by stabilising the mast cell membrane — the phrase that defines the class, offered without a confirmed molecular mechanism and contradicted by species and subtype discrepancies its own reviewers describe',
        auditFlag: 'contested',
      },
      {
        id: 'crm-a3',
        category: 'conclusion_shift',
        title:
          'It was displaced from asthma by a class with better evidence, not by a safety finding',
        laymanSummary:
          'This drug was standard maintenance treatment for childhood asthma for years. Its use fell away from 1990 as inhaled steroids took over. Nothing dangerous was discovered — the replacement simply had evidence that held up.',
        technicalDetails:
          'The Cochrane review records that sodium cromoglycate was recommended as maintenance treatment for childhood asthma for many years and that its use decreased after 1990 when inhaled corticosteroids became popular, while still being used in many countries. The displacement was not driven by any safety signal: cromolyn remains among the best-tolerated drugs in respiratory medicine, and the Cochrane review of topical antihistamines and mast cell stabilisers in allergic conjunctivitis, which included cromoglicate, reported no serious adverse events for the class. What changed was the availability of a comparator whose evidence base did not depend on trials published between 1970 and 1997 with a funnel plot showing missing negatives. Every original brand — Intal, Opticrom, Crolom — has since left the active Drugs@FDA product listing.',
        evidenceSource:
          'van der Wouden JC et al., Cochrane Database Syst Rev 2008;4:CD002173, Background; Drugs@FDA product listings for cromolyn sodium',
        doi: '10.1002/14651858.CD002173.pub2',
        inferredClaim:
          'That a drug leaving practice implies it was found harmful — here it was displaced by a comparator with stronger evidence while remaining one of the safest molecules in respiratory medicine',
        auditFlag: 'verified',
      },
      {
        id: 'crm-a4',
        category: 'measured',
        title: 'It is essentially not absorbed, and that is the design',
        laymanSummary:
          'The molecule carries two permanent negative charges, so almost none of it crosses from the gut or the airway into the bloodstream. It can only act on the surface you put it on — which is why there are four different formulations for four different surfaces.',
        technicalDetails:
          'Cromoglicic acid is a symmetrical bis-chromone with two carboxylic acid groups, fully ionised at physiological pH, giving a doubly anionic molecule with negligible passive membrane permeability. The consequence runs through the whole product family: separate formulations exist for inhalation, nasal, ophthalmic and oral routes, and the oral concentrate is indicated for mastocytosis precisely because it acts on gut mucosal mast cells without being absorbed. It also explains the safety record — a drug that does not enter the circulation cannot produce systemic toxicity — and the dosing burden, since local concentration must be maintained by repeated application rather than by a plasma half-life.',
        evidenceSource:
          'PubChem CID 2882, structure and physicochemical properties; Drugs@FDA route listings for cromolyn sodium (inhalation, nasal, ophthalmic, oral)',
        measuredMetric:
          'Ionisation state and route-specific formulation set, from structure and regulatory listings',
        auditFlag: 'verified',
      },
      {
        id: 'crm-a5',
        category: 'measured',
        title: 'Across the eye-drop class it works, in the short term, like everything else',
        laymanSummary:
          'In allergic conjunctivitis, the systematic review that examined every drop in this class found that all of them beat a dummy in the short term, including this one, and that none of them has any long-term data.',
        technicalDetails:
          'The Cochrane review of topical antihistamines and mast cell stabilisers for seasonal and perennial allergic conjunctivitis identified 30 randomised trials in 4,344 participants across 17 drugs or comparisons, with nedocromil sodium and sodium cromoglycate among the agents evaluated. Overall risk of bias was low but reporting quality variable and outcome reporting highly heterogeneous; meta-analysis was possible for only one comparison, which did not involve cromoglicate. The conclusion was that all reported agents reduce symptoms and signs of seasonal allergic conjunctivitis against placebo in the short term, that trials evaluated treatment periods of one to eight weeks only with no long-term efficacy data, and that no serious adverse events related to the class were reported.',
        evidenceSource:
          'Castillo M, Scott NW, Mustafa MZ, Mustafa MS, Azuara-Blanco A. Cochrane Database Syst Rev 2015;6:CD009566',
        doi: '10.1002/14651858.CD009566.pub2',
        measuredMetric:
          'Participant-reported ocular symptom severity against placebo, class-wide across 30 trials',
        auditFlag: 'verified',
      },
      {
        id: 'crm-a6',
        category: 'inferred',
        title: 'The one indication where the target cell is beyond doubt is the smallest one',
        laymanSummary:
          'For mastocytosis — a disease defined by too many mast cells — the oral form has its own approval. That is the only place where "mast cell drug" is not an assumption about the mechanism but a description of the disease.',
        technicalDetails:
          'Gastrocrom, cromolyn sodium oral concentrate, was approved under NDA 020479 on 29 February 1996 and remains the only branded cromolyn product in the active Drugs@FDA listing, with generics from 2011 onward. In mastocytosis the pathology is an excess of mast cells, so the drug and the disease are matched at the level of the cell type regardless of which molecular mechanism turns out to be correct — the therapeutic rationale does not depend on resolving the GPR35 or annexin A1 question. This is a narrower and firmer claim than the one made for the inhaled product, where the same cell type is one participant among many in a complex inflammatory disease.',
        evidenceSource:
          'Drugs@FDA: GASTROCROM (cromolyn sodium) oral concentrate, NDA 020479, approved 29 February 1996',
        inferredClaim:
          'That a mast-cell-directed rationale transfers from mastocytosis, where the cell type defines the disease, to asthma, where the Cochrane review found no significant effect on symptom-free days',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Applied to a surface, and it stays there',
        laymanDesc:
          'Sprayed into the nose, nebulised into the lungs, dropped into the eye, or swallowed to reach the gut lining. Which formulation you use decides which surface is treated, because none of it travels.',
        molecularDetail:
          'Two carboxylic acids fully ionised at physiological pH give a doubly anionic molecule with negligible absorption across any epithelium. Four separate route-specific formulations exist for that reason, and the oral concentrate acts on gut mucosal mast cells without entering the circulation.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It never enters the cell',
        laymanDesc:
          'The molecule is far too charged to cross a cell membrane. Whatever it does, it does from the outside — which is one reason the mechanism has been so hard to pin down.',
        molecularDetail:
          'The double negative charge that prevents systemic absorption equally prevents passive entry into mast cells. Any mechanism must therefore operate at the cell surface or through a surface receptor, which is what makes the GPR35 hypothesis structurally attractive and the classical membrane-stabilisation account structurally awkward.',
        iconName: 'ShieldCheck',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The classical account: the mast cell is stabilised',
        laymanDesc:
          'The traditional explanation is that it makes the mast cell membrane less likely to open and release its contents when an allergen arrives. This is the phrase the whole drug category is named after.',
        molecularDetail:
          'Early studies attributed the cromones’ prevention of allergic reactions to mast cell stabilising properties. The 2017 review states the exact pharmacological mechanism remained a mystery, and that the account cannot explain the discrepancies between species and between mast cell subtypes in their response to the drugs.',
        iconName: 'HelpCircle',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Two candidate mechanisms, neither settled',
        laymanDesc:
          'One idea is that the drug activates a specific receptor on the cell surface. The other is that it boosts one of the body’s own anti-inflammatory systems, the one steroids also use. Both have evidence and neither has closed the question.',
        molecularDetail:
          'Cromoglycate, nedocromil and zaprinast increase inositol phosphate accumulation and calcium mobilisation in HEK cells transfected with the orphan receptor GPR35, though its relevance to mast cell mediator release is unelucidated. Separately, cromones potentiate glucocorticoid-induced annexin A1 release by inhibiting PP2A phosphatase, and annexin A1 depletion in vitro completely reverses their inhibitory actions.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The allergic reaction is smaller, if it is prevented in advance',
        laymanDesc:
          'Used regularly and started before exposure, less histamine is released and the reaction is milder. Used during a reaction it does nothing, because it works upstream of everything that is already happening.',
        molecularDetail:
          'The inhalation label describes it as a prophylactic agent given on a regular daily basis, with effect usually evident after several weeks though some patients respond almost immediately. There is no receptor-blocking component, so nothing in the mechanism addresses mediators already released.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the pooled trials actually showed',
        laymanDesc:
          'On the cleanest measure in childhood asthma — days with no symptoms — pooling the trials found no difference from placebo, and the shape of the published literature suggested negative studies were missing.',
        molecularDetail:
          'Twenty-three trials in 1,026 children published 1970 to 1997; percentage of symptom-free days showed no statistically significant difference; other symptom outcomes reached significance with small effects and wide intervals; funnel plot indicated under-representation of small negative studies.',
        iconName: 'Ban',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD002173.pub2 — inhaled sodium cromoglycate for asthma in children',
        phase: 'Systematic review and meta-analysis of 23 double-blind placebo-controlled trials',
        sampleSize: 1026,
        primaryEndpoint:
          'Efficacy of sodium cromoglycate against placebo as maintenance therapy in children aged 0 to 18',
        endpointMet: false,
        statisticalPValue:
          'No statistically significant difference on percentage of symptom-free days; other symptom outcomes significant with small effects; funnel plot indicating publication bias',
        unreportedAdverseSignals:
          'Trials published 1970 to 1997, mostly crossover, few reporting allocation concealment. The authors state publication bias is likely to have overestimated the beneficial effects.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Cochrane CD009566.pub2 — topical antihistamines and mast cell stabilisers',
        phase: 'Systematic review of 30 randomised trials across 17 drugs or comparisons',
        sampleSize: 4344,
        primaryEndpoint:
          'Participant-reported severity of ocular itching, irritation, tearing and photophobia',
        endpointMet: true,
        statisticalPValue:
          'All reported agents, cromoglicate among them, reduced symptoms and signs against placebo in the short term; no serious adverse events reported for the class',
        unreportedAdverseSignals:
          'Treatment periods of one to eight weeks only, with no long-term efficacy data for any drug in the class. Meta-analysis was possible for one comparison, which did not involve cromoglicate.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No statistically significant difference from placebo on percentage of symptom-free days across four pooled paediatric asthma trials',
        'A funnel plot showing under-representation of small negative studies among 23 trials in 1,026 children',
        'Short-term symptom reduction against placebo in allergic conjunctivitis, alongside every other drug in that class',
        'Cromoglycate, nedocromil and zaprinast increase inositol phosphate accumulation and calcium mobilisation in GPR35-transfected HEK cells',
        'Annexin A1 depletion in vitro completely reverses the inhibitory actions of the cromones',
      ],
      unsupportedInferences: [
        'That "mast cell stabiliser" describes a known mechanism — the 2017 review calls the exact mechanism a mystery and notes species and subtype discrepancies the account cannot explain',
        'That the statistically significant secondary symptom outcomes in childhood asthma reflect a real effect, given the publication bias the funnel plot indicates',
        'That the GPR35 findings translate into therapeutic effect — the review states explicitly that it is unclear how they would',
        'That a mast-cell rationale established in mastocytosis transfers to asthma, where the pooled primary outcome was null',
      ],
      whatFailedInitially: [
        'The pooled percentage of symptom-free days in childhood asthma showed no significant difference from placebo',
        'Publication bias was detected in the paediatric asthma literature, with small negative studies under-represented',
        'The drug lost its place as maintenance therapy for childhood asthma from 1990 onward as inhaled corticosteroids arrived',
        'Every original brand — Intal, Opticrom, Crolom — has left the active Drugs@FDA product listing',
      ],
      realWorldOutcome: [
        'Synthesised at Fisons in the 1960s and the origin of the entire "mast cell stabiliser" category',
        'Only six products remain in the CMS acquisition survey, the smallest count of any drug in this batch, at $0.5845 per millilitre',
        'Still available over the counter as a nasal solution and by prescription for inhalation, ophthalmic and oral use',
        'Gastrocrom oral concentrate, NDA 020479 of 29 February 1996, remains the only branded cromolyn product listed as marketed, for mastocytosis',
      ],
    },
    deliverySystem: {
      type: 'Four route-specific formulations: inhalation solution for nebulisation, nasal solution over the counter, ophthalmic solution, and oral concentrate',
      description:
        'Each formulation treats only the surface it reaches, because the molecule is not absorbed. All require dosing several times daily to maintain local concentration, since there is no plasma half-life doing that work. The inhalation label describes it as a prophylactic given on a regular daily basis, with effect usually evident after several weeks though some patients respond almost immediately.',
      safetyProfile:
        'Among the most benign safety profiles in this batch, and for a structural reason: a doubly anionic molecule that is essentially not absorbed cannot produce systemic toxicity. The Cochrane review of topical antihistamines and mast cell stabilisers reported no serious adverse events related to the class across 30 trials in 4,344 participants. Local irritation on application — throat irritation and cough with inhalation, nasal stinging and sneezing with the spray, transient burning with the drops — is the practical limit. The safety record is the strongest thing about this drug and it was never the reason it was displaced.',
    },
    commonQuestions: [
      {
        q: 'Does it work for childhood asthma?',
        a: 'The systematic review could not say, and thought the published literature was flattering it. Cochrane pooled 23 double-blind placebo-controlled trials in 1,026 children, published between 1970 and 1997. On percentage of symptom-free days — the cleanest of the outcomes — pooling showed no statistically significant difference from placebo. Other symptom measures and bronchodilator use did reach significance, but the treatment effects were small and the confidence intervals wide. And the funnel plot showed small studies with negative results were under-represented, which is the signature of publication bias. The authors concluded there is insufficient evidence to be sure of efficacy over placebo, and that publication bias is likely to have overestimated the benefit that was reported.',
      },
      {
        q: 'What does "mast cell stabiliser" actually mean?',
        a: 'It means less than the phrase suggests. The category was invented for this drug, on the observation that it prevents allergic reactions without blocking any receptor. But a 2017 review by pharmacologists in the field — including one who worked on the original programme — states that the exact mechanism by which the cromones do this remained a mystery, and that the classical stabilisation account cannot explain why mast cells from different species and different tissues respond so inconsistently. Two candidate mechanisms are now on the table: activation of an orphan receptor called GPR35, and potentiation of the body’s own annexin A1 anti-inflammatory system, the same one glucocorticoids work through. Neither is settled.',
        auditNote:
          'A drug can work without its mechanism being known. What is unusual here is that the unknown mechanism was given a confident name, and the name then became a marketing category for other drugs.',
      },
      {
        q: 'Why do I have to use it four times a day?',
        a: 'Because the molecule carries two permanent negative charges and is therefore essentially not absorbed anywhere. That is a design feature, not a flaw: it is why there are four separate formulations for four separate surfaces, why the oral form can treat gut mast cells without entering the bloodstream, and why the safety record is as clean as it is. But it also means there is no plasma half-life keeping the drug present between doses. Local concentration has to be maintained by putting more on, which is the practical reason once-daily steroid sprays displaced it.',
      },
      {
        q: 'Is it dangerous? Is that why it went out of use?',
        a: 'No — the opposite. It is one of the safest molecules in this whole batch, precisely because it does not get into the circulation. The Cochrane review of every topical antihistamine and mast cell stabiliser in allergic conjunctivitis, across 30 trials in 4,344 people, reported no serious adverse events for the class. What displaced it in asthma was inhaled corticosteroids becoming available from around 1990, with an evidence base that did not depend on trials from the 1970s and 1980s with negative studies missing from the record. It was outcompeted, not withdrawn.',
      },
      {
        q: 'Is there anywhere it clearly belongs?',
        a: 'Mastocytosis is the strongest case. That is a disease defined by having too many mast cells, so the match between drug and disease is at the level of the cell type rather than a hypothesis about mechanism — it does not matter whether the GPR35 or the annexin A1 explanation turns out to be right. The oral concentrate has its own approval for it, granted in February 1996, and it is the only branded cromolyn product still listed as marketed. That is a much narrower and firmer claim than the one made for the inhaled product in asthma, where the mast cell is one participant among many.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'van der Wouden JC, Uijen JH, Bernsen RM, Tasche MJ, de Jongste JC, Ducharme F. Inhaled sodium cromoglycate for asthma in children. Cochrane Database Syst Rev 2008;4:CD002173',
        identifier: '10.1002/14651858.CD002173.pub2',
        kind: 'doi',
      },
      {
        label:
          'Sinniah A, Yazid S, Flower RJ. The anti-allergic cromones: past, present, and future. Front Pharmacol 2017;8:827',
        identifier: '10.3389/fphar.2017.00827',
        kind: 'doi',
      },
      {
        label:
          'Castillo M, Scott NW, Mustafa MZ, Mustafa MS, Azuara-Blanco A. Topical antihistamines and mast cell stabilisers for treating seasonal and perennial allergic conjunctivitis. Cochrane Database Syst Rev 2015;6:CD009566',
        identifier: '10.1002/14651858.CD009566.pub2',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: GASTROCROM (cromolyn sodium) oral concentrate, NDA 020479, approved 29 February 1996; generic cromolyn sodium for inhalation (ANDA 075271, 2000), nasal over-the-counter (ANDA 075702, 2001) and ophthalmic (ANDA 075282, 1999) use',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020479',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2882 — cromoglicic acid structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2882',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Loratadine — the antihistamine defined by the strength it was not allowed to exceed, whose
  //     active metabolite was launched as a new prescription brand eleven months before the parent
  //     went over the counter.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'loratadine',
    name: 'Loratadine',
    tradeName: 'Claritin / Alavert / Allergy Relief',
    sponsor:
      'Developed by Schering-Plough; NDA 019658 was approved 12 April 1993 and its over-the-counter efficacy supplement on 27 November 2002. The applications are now held by Bayer HealthCare, with Alavert (NDA 021375) approved 19 December 2002',
    targetGene: 'HRH1',
    targetProtein: 'Histamine H1 receptor — a human G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1993,
    indication:
      'Temporary relief of runny nose, itchy or watery eyes, sneezing and itching of the nose or throat due to hay fever or other upper respiratory allergies, and relief of itching due to hives',
    patientFriendlyIndication: 'Hay fever and itchy hives',
    anatomicalSite:
      'Nasal mucosa, conjunctiva and dermal postcapillary venules — peripheral H1 receptors, with limited central nervous system penetration at the marketed strength',
    conditionContext: {
      conditionExplainer:
        'The same allergic reaction every antihistamine on this shelf addresses: mast cells release histamine within seconds of meeting pollen, and histamine produces the itch, the sneeze and the running.',
      whyItMatters:
        'Loratadine is the drug that made non-sedating antihistamines a mass-market product, and its story is about the number on the box. Its marketed strength is the one that stays below the threshold where the molecule starts to sedate, and the label says so in as many words: taking more than directed may cause drowsiness. Everything else about the drug follows from that constraint.',
      whoTakesThis:
        'Adults and children from two years, sold without a prescription in the United States since November 2002 and now among the cheapest medicines in any pharmacy.',
      clinicalGoals:
        'Symptom relief with no drowsiness. Both halves are achieved at the marketed strength, and a network meta-analysis puts the symptom half at roughly half the size of cetirizine’s.',
    },
    oneSentenceVerdict:
      'A tricyclic H1 antagonist that reliably beats placebo without sedating at the one strength it is sold in — a network meta-analysis of 13 randomised trials in 6,867 patients put its improvement in rhinoconjunctivitis quality of life at -0.32 (95% CI -0.55 to -0.097, p=0.005) against cetirizine’s -0.62 (95% CI -0.90 to -0.34), and its own over-the-counter label states that taking more than directed may cause drowsiness.',
    laymanHowItWorks:
      'Histamine is what makes an allergic reaction itch and run, and it works by switching on a receptor in your nose, eyes and skin. Loratadine sits in that receptor and holds it closed. What makes it different from the older antihistamines is the amount you take: the strength on the box is set just below the point where the drug starts crossing into the brain enough to make you sleepy. That is why it does not make you drowsy, and it is also why there is no stronger version to move up to.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        '$0.0532 per unit, median across 109 listed products (CMS National Average Drug Acquisition Cost, generic, effective 19 August 2026)',
      markupEstimate: '',
      synthesisComplexity: 'Moderate',
      openPatentNotes:
        'The lifecycle sequence is unusually legible here. Clarinex, the active metabolite desloratadine, was approved as a new prescription product under NDA 021165 on 21 December 2001. Claritin’s own over-the-counter efficacy supplement was approved eleven months later, on 27 November 2002, and Alavert followed on 19 December 2002. The parent molecule is now among the cheapest drugs in any pharmacy — 109 products in the CMS acquisition survey at just over five cents a unit — while desloratadine remains a prescription product at $0.2553 per unit.',
      costSource: {
        label:
          'No published cost-of-production study exists for loratadine; the field is left empty rather than estimated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) weekly reference file, effective 19 August 2026 — median across 109 listed loratadine products',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'The one network meta-analysis that ranked these drugs against each other on quality of life put cetirizine first and loratadine third of four, with overlapping confidence intervals. The practical trade is straightforward: loratadine is the least sedating of the widely used oral options and the weakest, and cetirizine is the reverse.',
      conventionalRx: [
        {
          name: 'Cetirizine (Zyrtec)',
          class: 'Second-generation H1 antagonist',
          howItCompares:
            'Ranked first in a network meta-analysis of 13 randomised trials in 6,867 patients, improving rhinoconjunctivitis quality of life by -0.62 (95% CI -0.90 to -0.34) against loratadine’s -0.32 (95% CI -0.55 to -0.097). The point estimate is roughly double; the confidence intervals overlap. The cost of that difference is measurable sedation: brain H1 receptor occupancy of 26.0% by PET at 20 mg.',
          typicalCost:
            '$0.0629 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: the largest measured effect of the common oral antihistamines. Cons: dose-related somnolence and a label warning against driving, which loratadine does not carry at its marketed strength.',
        },
        {
          name: 'Fexofenadine (Allegra)',
          class: 'Second-generation H1 antagonist that does not enter the brain',
          howItCompares:
            'The only oral antihistamine whose absence from the brain has been imaged directly: -0.1% H1 receptor occupancy by [11C]doxepin PET. Loratadine’s non-sedating claim rests on trial sedation rates rather than on that kind of measurement, which is a weaker form of evidence for the same property.',
          typicalCost:
            '$0.2407 per unit at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: direct imaging evidence for the non-sedating claim, and no hepatic enzyme interactions. Cons: about four and a half times the acquisition cost, and fruit juice cuts absorption to roughly a third.',
        },
        {
          name: 'Desloratadine (Clarinex)',
          class: 'The active metabolite of loratadine, sold as a separate prescription product',
          howItCompares:
            'What loratadine turns into in the liver, marketed on its own from December 2001. In the same network meta-analysis it improved quality of life by -0.39 (95% CI -0.60 to -0.18) against loratadine’s -0.32 — a difference well inside the overlap of the two intervals. It remains prescription-only.',
          typicalCost:
            '$0.2553 per unit at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: skips the metabolic step, so hepatic enzyme variation matters less. Cons: roughly five times the acquisition cost of its own parent, prescription-only, and no separation from loratadine in the pooled comparison.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not double the dose to get more effect',
          action:
            'Take the strength on the box and no more, even when symptoms are not fully controlled.',
          patientImpact:
            'The over-the-counter label states directly: do not take more than directed; taking more than directed may cause drowsiness. The marketed strength sits just below the sedation threshold, so exceeding it converts a non-sedating antihistamine into a sedating one without a guaranteed gain in symptom control.',
          clinicalPrecaution:
            'If the marketed strength is not enough, the answer is a different class — an intranasal corticosteroid for congestion, or an intranasal antihistamine — rather than more of this one.',
        },
        {
          name: 'Mention liver or kidney disease',
          action:
            'Check with a clinician before use if you have liver or kidney disease, as the label instructs.',
          patientImpact:
            'Loratadine is converted to its active form by hepatic cytochrome P450 enzymes and cleared renally, so impaired function on either side changes exposure. The label says a doctor should determine whether a different amount is needed.',
          clinicalPrecaution:
            'This is one of the few genuine label cautions on a drug that is otherwise remarkably free of them.',
        },
        {
          name: 'Saline nasal irrigation',
          action: 'Rinsing the nasal cavity with isotonic or hypertonic salt water.',
          patientImpact:
            'Physically removes deposited pollen. It works on nasal blockage, which is the symptom oral antihistamines address least well and which is not among the four symptoms this drug’s own label claims to relieve.',
          clinicalPrecaution:
            'Only sterile, distilled or previously boiled water. Fatal amoebic meningoencephalitis has been traced to irrigation with untreated tap water.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCOC(=O)N1CCC(=C2C3=C(CCC4=C2N=CC=C4)C=C(C=C3)Cl)CC1',
      chemicalFormula: 'C22H23ClN2O2',
      molecularWeight: '382.90 g/mol',
      targetReceptorAffinity:
        'A tricyclic benzocycloheptapyridine bearing an exocyclic piperidylidene capped with an ethyl carbamate. That carbamate is the feature that distinguishes it from the sedating tricyclics it descends from: it lowers basicity and raises polarity enough to limit central nervous system penetration at the marketed strength, and hepatic removal of it yields desloratadine, the active metabolite that was later marketed as a drug in its own right. The molecule is a prodrug in practical terms, and its activity therefore depends on cytochrome P450 conversion rather than on the parent alone.',
      structureSource: {
        label: 'PubChem CID 3957 (loratadine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3957',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lor-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Carbamate integrity and desloratadine content',
          description:
            'Measure how much of the batch has already lost its ethyl carbamate. Free desloratadine is not an ordinary impurity: it is a separately approved drug with its own application, and it is more centrally active than the parent. A batch drifting towards the metabolite is drifting towards a different pharmacology.',
          reagentsAndBuffer:
            'Loratadine and desloratadine reference standards, reversed-phase HPLC with ultraviolet detection at 247 nm, 1H NMR in CDCl3, water content by Karl Fischer, forced-degradation samples under acid, base and humidity',
        },
        {
          id: 'lor-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Grignard addition to the tricyclic ketone, then carbamoylation',
          description:
            'Add an N-methylpiperidinyl Grignard reagent to the chlorinated benzocycloheptapyridinone, dehydrate to set the exocyclic alkene, then demethylate the piperidine nitrogen and cap it with ethyl chloroformate. The carbamoylation is the last step and the commercially decisive one — the intermediate immediately before it is desloratadine.',
          dependsOnStepId: 'lor-w1',
          reagentsAndBuffer:
            '1-methyl-4-piperidinylmagnesium chloride, 8-chloro-5,6-dihydro-11H-benzo[5,6]cyclohepta[1,2-b]pyridin-11-one, anhydrous tetrahydrofuran under nitrogen, acid-catalysed dehydration, then ethyl chloroformate with a hindered base',
        },
        {
          id: 'lor-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation away from the des-carbamate and the alkene regioisomer',
          description:
            'Crystallise the product away from residual desloratadine and from the endocyclic alkene isomer formed during dehydration. Both are structurally close and both are pharmacologically different, and the specification on each is what keeps a five-cent tablet a defined product rather than a mixture.',
          dependsOnStepId: 'lor-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or isopropanol with controlled cooling, HPLC purity and related-substances profile, differential scanning calorimetry and powder X-ray diffraction for polymorph confirmation',
        },
        {
          id: 'lor-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hepatocyte conversion to desloratadine across CYP genotypes',
          description:
            'Incubate the compound with human hepatocytes or recombinant cytochrome P450 isoforms and measure formation of the active metabolite. Because the parent depends on hepatic conversion for a large part of its activity, a single-donor experiment can conceal the variation that matters: enzyme inhibition or genetic variability shifts the parent-to-metabolite ratio and with it the effective exposure.',
          dependsOnStepId: 'lor-w3',
          reagentsAndBuffer:
            'Cryopreserved pooled and single-donor human hepatocytes, recombinant CYP3A4 and CYP2D6 supersomes with NADPH-regenerating system, ketoconazole and quinidine as isoform-selective inhibitors, LC-MS/MS quantification of loratadine and desloratadine',
        },
        {
          id: 'lor-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Wheal-and-flare suppression paired with a sedation measure at the same exposure',
          description:
            'Measure histamine wheal suppression and psychomotor performance in the same subjects at the same exposure, across a range of strengths. This is the experiment the marketed product embodies: the label states that taking more than directed may cause drowsiness, which is a statement that the strength was chosen where those two curves cross. Reporting either curve alone would misdescribe the drug.',
          dependsOnStepId: 'lor-w4',
          reagentsAndBuffer:
            'Intradermal histamine phosphate with saline control, planimetry of wheal and flare to 24 hours, choice reaction time and critical flicker fusion testing, Stanford Sleepiness Scale, matched placebo and a sedating positive control such as hydroxyzine',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lor-a1',
        category: 'measured',
        title: 'It beats placebo, at roughly half the effect size of cetirizine',
        laymanSummary:
          'A network meta-analysis pooled thirteen trials in nearly seven thousand people and compared four allergy drugs on how much they improved quality of life. All four beat placebo. Cetirizine came first and this drug came third, at about half the improvement.',
        technicalDetails:
          'A network meta-analysis of randomised controlled trials in allergic rhinitis identified 386 studies and included 13 high-quality randomised trials with a combined 6,867 patients across loratadine, cetirizine, montelukast and desloratadine, using rhinoconjunctivitis quality of life questionnaire scores as the outcome. Against placebo, mean differences were: cetirizine -0.62 (95% CI -0.90 to -0.34, p<0.001); desloratadine -0.39 (95% CI -0.60 to -0.18, p<0.001); loratadine -0.32 (95% CI -0.55 to -0.097, p=0.005); montelukast -0.28 (95% CI -0.54 to -0.023, p=0.033). Surface-under-the-cumulative-ranking analysis placed cetirizine first. The loratadine and cetirizine confidence intervals overlap between -0.34 and -0.55, so the ranking is a point-estimate ordering rather than a demonstrated separation.',
        evidenceSource: 'Xiao J, Wu WX, Ye YY, Lin WJ, Wang L. Am J Ther 2016;23:e1568-e1578',
        doi: '10.1097/MJT.0000000000000242',
        measuredMetric:
          'Mean change in rhinoconjunctivitis quality of life questionnaire score against placebo, network meta-analysis of 13 trials',
        auditFlag: 'verified',
      },
      {
        id: 'lor-a2',
        category: 'inferred',
        title:
          'The strength is set at the sedation threshold, and the label says what happens above it',
        laymanSummary:
          'This drug is famous for not making people sleepy. The reason is the number on the box: it is the amount that stays below the point where the molecule starts affecting the brain. The label states that taking more than directed may cause drowsiness.',
        technicalDetails:
          'The over-the-counter label carries, under "When using this product", the statement: "do not take more than directed. Taking more than directed may cause drowsiness." No higher strength of loratadine is marketed. The structural basis is the ethyl carbamate cap on the piperidine nitrogen, which lowers basicity and raises polarity enough to limit central nervous system penetration at the marketed exposure — a property that is a function of amount rather than an absolute. The clinical consequence is visible in the comparative data: in the network meta-analysis the point estimate for loratadine was roughly half that of cetirizine, and cetirizine is the drug that carries the sedation warning loratadine does not. What no public dataset establishes is what a higher loratadine strength would have achieved on symptoms, because no such strength was developed for sale.',
        evidenceSource:
          'Loratadine over-the-counter prescribing information, "When using this product" section, via openFDA drug labelling; Xiao J et al., Am J Ther 2016;23:e1568-e1578',
        inferredClaim:
          'That loratadine is intrinsically a non-sedating molecule rather than a molecule sold at a non-sedating amount — its own label states that exceeding the marketed amount may cause drowsiness, and no higher strength exists to test what it would do for symptoms',
        auditFlag: 'contested',
      },
      {
        id: 'lor-a3',
        category: 'conclusion_shift',
        title:
          'The hypospadias alarm of 2002 did not survive a national birth defects study, and a mouse study kept it alive',
        laymanSummary:
          'A Swedish study reported that boys born to women who took this drug in pregnancy had twice the usual rate of a urethral birth defect. A large United States birth defects study then found no increased risk. A mouse experiment afterwards did produce the defect, which is why the question has never fully closed.',
        technicalDetails:
          'In 2002 a Swedish study reported hypospadias prevalence twice that of the general population among male infants born to women who took loratadine during pregnancy; it had insufficient data to determine severity and did not control for confounders such as family history or maternal age. In 2003 a prospective study across four countries found five of 142 loratadine-exposed pregnancies resulted in major malformations, a prevalence consistent with the general population, and none of them hypospadias. The CDC then analysed the National Birth Defects Prevention Study for 1997 to 2001 and determined that no increased risk for second- or third-degree hypospadias existed among women who used loratadine in early pregnancy; that report carries a published erratum. Separately, in 2006 a mouse study gavaging pregnant dams with over-the-counter loratadine syrup from gestational day 12 to 17 reported disrupted urethral development on gross and histological assessment and a steroid receptor messenger RNA expression profile resembling that produced by ethinyl estradiol, and it drew a published comment and author reply.',
        evidenceSource:
          'CDC. Evaluation of an association between loratadine and hypospadias — United States, 1997-2001. MMWR 2004;53:219-221 (erratum MMWR 2006;55:1075); Willingham E, Agras K, Vilela M, Baskin LS. J Urol 2006;175:723-726',
        doi: '10.1016/S0022-5347(05)00188-6',
        inferredClaim:
          'That loratadine causes hypospadias — an uncontrolled registry signal that a national case-control study did not reproduce, complicated rather than settled by a mouse model showing oestrogen-like disruption of urethral development',
        auditFlag: 'contested',
      },
      {
        id: 'lor-a4',
        category: 'conclusion_shift',
        title:
          'The active metabolite became a new prescription brand eleven months before the parent went over the counter',
        laymanSummary:
          'What your liver turns this drug into was launched as a separate prescription medicine in December 2001. The original drug moved to the open shelf in November 2002. The sequence put a new branded product in place before the old one lost its prescription status.',
        technicalDetails:
          'Clarinex, desloratadine, was approved under NDA 021165 on 21 December 2001. The over-the-counter efficacy supplement to Claritin’s NDA 019658 was approved on 27 November 2002, and Alavert followed under NDA 021375 on 19 December 2002. Desloratadine is the active metabolite formed from loratadine by hepatic cytochrome P450 conversion, so the two are pharmacologically continuous rather than distinct. In the network meta-analysis of allergic rhinitis quality of life, desloratadine improved scores by -0.39 (95% CI -0.60 to -0.18) against loratadine’s -0.32 (95% CI -0.55 to -0.097) — a difference lying well inside the overlap of the two intervals. Twenty-four years later loratadine costs $0.0532 per unit as a generic and desloratadine $0.2553, roughly five times as much, and remains prescription-only.',
        evidenceSource:
          'Drugs@FDA: CLARINEX (desloratadine), NDA 021165, approved 21 December 2001; CLARITIN, NDA 019658, over-the-counter efficacy supplement 18 approved 27 November 2002; ALAVERT, NDA 021375, 19 December 2002; Xiao J et al., Am J Ther 2016;23:e1568-e1578',
        doi: '10.1097/MJT.0000000000000242',
        inferredClaim:
          'That the metabolite is a therapeutic advance over its parent — the pooled comparison places the two within each other’s confidence intervals, while the price and prescription status differ by a factor of five',
        auditFlag: 'contested',
      },
      {
        id: 'lor-a5',
        category: 'measured',
        title: 'Its activity depends on the liver converting it, and the label reflects that',
        laymanSummary:
          'Loratadine is largely a starting material: the liver strips off part of the molecule to make the form that does most of the work. That is why the label singles out liver and kidney disease as reasons to check with a doctor.',
        technicalDetails:
          'Loratadine bears an ethyl carbamate on the piperidine nitrogen which hepatic cytochrome P450 enzymes remove to yield desloratadine, itself an approved active drug. The over-the-counter label instructs: "Ask a doctor before use if you have liver or kidney disease. Your doctor should determine if you need a different dose." That caution is unusual on a monograph-style antihistamine label and follows directly from the metabolic dependence: anything that inhibits the converting enzymes, or impairs renal clearance of the metabolite, shifts exposure. This is a difference of kind from fexofenadine, which is excreted largely unchanged and has no meaningful hepatic enzyme interactions.',
        evidenceSource:
          'Loratadine over-the-counter prescribing information, "Ask a doctor before use" section, via openFDA drug labelling; Drugs@FDA CLARINEX (desloratadine) NDA 021165',
        measuredMetric:
          'Labelled hepatic and renal cautions, and the existence of the metabolite as a separately approved product',
        auditFlag: 'verified',
      },
      {
        id: 'lor-a6',
        category: 'inferred',
        title: 'A 1,095-patient phase 3 combination trial has no public result',
        laymanSummary:
          'The manufacturer ran a phase 3 trial of this drug combined with montelukast against a decongestant and a placebo, in over a thousand people with hay fever. The registry entry has no results.',
        technicalDetails:
          'NCT00319995, "Efficacy and Safety of Combination Loratadine/Montelukast QD vs Pseudoephedrine and Placebo in the Treatment of Subjects With Seasonal Allergic Rhinitis", is a phase 3 study with an actual enrolment of 1,095 sponsored by Organon. The registry record carries no posted results section. A four-arm comparison of that size against both an active decongestant and placebo would be among the more informative datasets on how an oral antihistamine performs on nasal congestion specifically, which is the symptom the class relieves least well.',
        evidenceSource:
          'NCT00319995 registry record, Organon — actual enrolment 1,095, no results posted',
        inferredClaim:
          'That the published trial set characterises this drug’s performance in combination and against an active decongestant, when a 1,095-patient phase 3 designed to answer that has never reported',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day',
        laymanDesc:
          'One tablet, one strength, once daily. There is no stronger version, and that constraint is the defining fact about the drug.',
        molecularDetail:
          'Marketed at a single strength across tablet, rapidly disintegrating tablet, chewable and liquid forms, and in combination with pseudoephedrine. The over-the-counter label states that taking more than directed may cause drowsiness, which locates the marketed exposure at the boundary of central nervous system effect.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver converts it into its active form',
        laymanDesc:
          'Enzymes in the liver strip a piece off the molecule. What is left is the form that does most of the work — and it is itself a separately approved medicine.',
        molecularDetail:
          'Hepatic cytochrome P450 enzymes remove the ethyl carbamate from the piperidine nitrogen to yield desloratadine, approved in its own right as Clarinex under NDA 021165 in December 2001. Activity therefore depends on hepatic conversion, which is why the label singles out liver and kidney disease.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the histamine receptor in the periphery',
        laymanDesc:
          'In the nose, eyes and skin it takes the seat histamine needs, so the histamine released by mast cells has nowhere to signal.',
        molecularDetail:
          'Selective peripheral H1 antagonism. The carbamate and the resulting polarity limit central nervous system penetration at the marketed exposure — a property of the amount taken rather than an absolute property of the molecule, which is what the label’s overdose warning encodes.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The brain is spared, at the marketed strength',
        laymanDesc:
          'At the amount on the box, not enough reaches the brain to make you sleepy. Take more and that stops being true, which is exactly what the label warns.',
        molecularDetail:
          'Non-sedation here is established from trial adverse event rates rather than from direct receptor imaging — unlike fexofenadine, whose brain H1 occupancy of -0.1% has been measured by [11C]doxepin PET. The distinction is between a measured absence and an unobserved effect.',
        iconName: 'ShieldCheck',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Symptoms improve, by about a third of a quality-of-life point',
        laymanDesc:
          'Pooled across thirteen trials in nearly seven thousand people, it improved rhinoconjunctivitis quality of life by 0.32 points against a dummy tablet. Cetirizine achieved about twice that.',
        molecularDetail:
          'Mean difference against placebo -0.32 (95% CI -0.55 to -0.097, p=0.005), against cetirizine -0.62 (95% CI -0.90 to -0.34), desloratadine -0.39 and montelukast -0.28, in a network meta-analysis of 13 randomised trials in 6,867 patients. The loratadine and cetirizine intervals overlap.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And there is nowhere to go from there',
        laymanDesc:
          'If the tablet is not enough, there is no stronger tablet. The next step has to be a different kind of drug, because more of this one buys drowsiness rather than a guarantee of more relief.',
        molecularDetail:
          'No higher-strength loratadine product is marketed and the label forbids exceeding the directed amount. The classes with evidence beyond this ceiling are intranasal corticosteroids for congestion and intranasal antihistamines, both of which act on symptoms an oral H1 blocker addresses poorly.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Xiao 2016 network meta-analysis (Am J Ther 23:e1568-e1578)',
        phase: 'Network meta-analysis of 13 randomised controlled trials',
        sampleSize: 6867,
        primaryEndpoint:
          'Mean change in rhinoconjunctivitis quality of life questionnaire score against placebo',
        endpointMet: true,
        statisticalPValue:
          'Loratadine -0.32 (95% CI -0.55 to -0.097), p=0.005; cetirizine -0.62 (95% CI -0.90 to -0.34), p<0.001; desloratadine -0.39, p<0.001; montelukast -0.28, p=0.033',
        unreportedAdverseSignals:
          'The ranking rests on point estimates whose confidence intervals overlap. Quality of life is the only outcome pooled; nasal congestion specifically is not separated out.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT00319995',
        phase: 'Phase 3, randomised, four-arm, seasonal allergic rhinitis',
        sampleSize: 1095,
        primaryEndpoint:
          'Efficacy and safety of combination loratadine/montelukast once daily against pseudoephedrine and placebo',
        endpointMet: false,
        statisticalPValue: 'Not reported. The registry record carries no posted results section.',
        unreportedAdverseSignals:
          'A four-arm comparison against both an active decongestant and placebo, in 1,095 patients, with no public outcome.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'National Birth Defects Prevention Study analysis, 1997-2001 (MMWR 2004;53:219-221)',
        phase: 'Population-based case-control analysis, not a trial',
        sampleSize: 0,
        primaryEndpoint:
          'Risk of second- or third-degree hypospadias with loratadine use in early pregnancy',
        endpointMet: true,
        statisticalPValue:
          'No increased risk determined for second- or third-degree hypospadias among women who used loratadine in early pregnancy',
        unreportedAdverseSignals:
          'The report carries a published erratum. A 2006 mouse study subsequently reported disrupted urethral development and oestrogen-like steroid receptor changes after in utero exposure, and drew a published comment and author reply.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Rhinoconjunctivitis quality of life improved by 0.32 points against placebo (95% CI -0.55 to -0.097) across 13 trials in 6,867 patients',
        'Cetirizine improved the same measure by 0.62 points (95% CI -0.90 to -0.34) in the same analysis, with overlapping intervals',
        'The over-the-counter label states that taking more than directed may cause drowsiness',
        'No increased risk of second- or third-degree hypospadias with early-pregnancy use in the National Birth Defects Prevention Study',
        'Desloratadine, the hepatic metabolite, was approved as a separate prescription product on 21 December 2001',
      ],
      unsupportedInferences: [
        'That loratadine is intrinsically non-sedating rather than sold at a non-sedating amount — its label warns that exceeding the amount may cause drowsiness',
        'That the metabolite is therapeutically superior to the parent — the pooled estimates sit inside each other’s confidence intervals while the price differs fivefold',
        'That loratadine causes hypospadias — the registry signal was not reproduced in a national case-control analysis',
        'That the ranking of these four drugs is established — the confidence intervals overlap and only one outcome was pooled',
      ],
      whatFailedInitially: [
        'Loratadine ranked third of four on quality of life, behind cetirizine and behind its own metabolite',
        'The 2002 Swedish hypospadias signal did not control for family history or maternal age and was not reproduced',
        'A 1,095-patient phase 3 four-arm combination trial has never posted results',
        'There is no stronger version of the drug to escalate to, because the marketed strength is the sedation ceiling',
      ],
      realWorldOutcome: [
        'Approved 12 April 1993 under NDA 019658 and switched to over-the-counter sale on 27 November 2002',
        'Now among the cheapest medicines in any pharmacy — 109 products in the CMS acquisition survey at $0.0532 per unit',
        'Its own active metabolite remains a prescription product at roughly five times the acquisition cost',
        'Still the default recommendation where sedation must be avoided and cost matters, which is most of the time',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, rapidly disintegrating tablet, chewable tablet and oral solution, plus extended-release combinations with pseudoephedrine',
      description:
        'One dose daily at a single marketed strength. The rapidly disintegrating form exists for people who cannot swallow a tablet rather than for faster onset. The label instructs that the directed amount not be exceeded, because more of it may cause drowsiness.',
      safetyProfile:
        'Among the most benign labels of any drug in this batch. The over-the-counter label carries no driving warning, no alcohol warning and no contraindication other than prior allergic reaction to the product. Its two substantive cautions are a direction not to exceed the stated amount, because doing so may cause drowsiness, and an instruction to consult a clinician in liver or kidney disease, which follows from the drug’s dependence on hepatic conversion to desloratadine and renal clearance. Pregnancy safety was the subject of a hypospadias signal in 2002 that a national birth defects study did not reproduce.',
    },
    commonQuestions: [
      {
        q: 'Why can I not just take two if one is not working?',
        a: 'Because the label says so, and it says why: do not take more than directed; taking more than directed may cause drowsiness. The reason this drug does not sedate is not that the molecule cannot reach the brain — it is that the amount you are sold stays below the point where enough of it does. There is no higher strength on the market, so there is nothing to escalate to. If the standard amount is not controlling your symptoms, the answer is a different class: an intranasal corticosteroid if the main problem is a blocked nose, or an intranasal antihistamine if you need something that works within minutes.',
        auditNote:
          'What no public dataset shows is what a higher loratadine strength would have done for symptoms, because no such product was developed for sale.',
      },
      {
        q: 'Is it weaker than cetirizine?',
        a: 'On the one analysis that compared them directly, yes, by about half — with the caveat that the ranges overlap. A network meta-analysis pooled 13 randomised trials in 6,867 patients and measured improvement in rhinoconjunctivitis quality of life against placebo. Cetirizine came out at -0.62 with a confidence interval from -0.90 to -0.34; loratadine at -0.32 with an interval from -0.55 to -0.097. The point estimates differ roughly two-fold and cetirizine ranked first of the four drugs examined. But those intervals overlap between -0.34 and -0.55, so this is an ordering of best guesses rather than a demonstrated separation. And cetirizine buys its extra effect with measurable sedation, which loratadine does not have at its marketed strength.',
      },
      {
        q: 'What is Clarinex, and is it better?',
        a: 'Clarinex is desloratadine — what your liver turns loratadine into. It was approved as a separate prescription product on 21 December 2001, eleven months before Claritin moved to the open shelf on 27 November 2002. In the same network meta-analysis, desloratadine improved quality of life by -0.39 against loratadine’s -0.32, a difference well inside the overlap of the two confidence intervals. Today loratadine costs about five cents a unit as a generic and desloratadine about twenty-six cents, and desloratadine is still prescription-only. The pharmacological argument for taking the metabolite directly is that it removes dependence on the liver conversion step, which matters most in impaired hepatic function.',
      },
      {
        q: 'Is it safe in pregnancy? I read something about birth defects.',
        a: 'The signal did not hold up, and the question is not entirely closed. In 2002 a Swedish study reported that hypospadias — a urethral birth defect in boys — occurred at twice the general rate among infants of women who took loratadine in pregnancy. That study could not determine severity and did not adjust for family history or maternal age. A prospective study across four countries then found five major malformations among 142 loratadine-exposed pregnancies, in line with the background rate, and none of them hypospadias. The CDC analysed the National Birth Defects Prevention Study and found no increased risk of second- or third-degree hypospadias with early-pregnancy use. Against that, a 2006 mouse study reported that loratadine syrup given to pregnant mice disrupted urethral development and produced steroid receptor changes resembling those from a synthetic oestrogen. The human epidemiology is reassuring; the animal work is why this appears here rather than being dropped.',
      },
      {
        q: 'Why is it so cheap?',
        a: 'Because it is thirty-three years past approval, went over the counter in 2002, and has 109 separate products competing in the acquisition survey. At $0.0532 per unit it is the second cheapest drug in this batch after diphenhydramine. Those are what pharmacies pay rather than what a patient is charged, and no cost-of-production study has been published for it, so there is no manufacturing figure to compare against. What the price does illustrate cleanly is the value of the switch: the same molecule that carried a branded prescription price into the late 1990s now costs about what a single sweet costs.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Xiao J, Wu WX, Ye YY, Lin WJ, Wang L. A network meta-analysis of randomized controlled trials focusing on different allergic rhinitis medications. Am J Ther 2016;23:e1568-e1578',
        identifier: '10.1097/MJT.0000000000000242',
        kind: 'doi',
      },
      {
        label:
          'Centers for Disease Control and Prevention. Evaluation of an association between loratadine and hypospadias — United States, 1997-2001. MMWR Morb Mortal Wkly Rep 2004;53:219-221 (erratum MMWR 2006;55:1075)',
        identifier: '15029117',
        kind: 'pmid',
      },
      {
        label:
          'Willingham E, Agras K, Vilela M, Baskin LS. Loratadine exerts estrogen-like effects and disrupts penile development in the mouse. J Urol 2006;175:723-726',
        identifier: '10.1016/S0022-5347(05)00188-6',
        kind: 'doi',
      },
      {
        label:
          'Combination loratadine/montelukast against pseudoephedrine and placebo in seasonal allergic rhinitis, 1,095 patients, Organon — no results posted',
        identifier: 'NCT00319995',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: CLARITIN (loratadine), NDA 019658, approved 12 April 1993, over-the-counter efficacy supplement 18 approved 27 November 2002; ALAVERT, NDA 021375, 19 December 2002; CLARINEX (desloratadine), NDA 021165, 21 December 2001',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019658',
        kind: 'regulatory',
      },
      {
        label:
          'Loratadine over-the-counter prescribing information — Uses, Warnings, "Ask a doctor before use" and "When using this product" sections, via openFDA drug labelling',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22loratadine%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3957 — loratadine structure, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3957',
        kind: 'url',
      },
    ],
  },
]
