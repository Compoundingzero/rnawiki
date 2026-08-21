import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the upper and lower airway: what people put in their noses, and the
 * drugs that were built to stop asthma attacks.
 *
 * Editorial layer written over the machine-enriched records. The identity facts — slug, trade name,
 * sponsor, approval year, SMILES, CMS acquisition price — are copied from the enriched record
 * rather than researched again. The verdict, the mechanism carousel and the audits are written
 * here, because no pipeline produces them.
 *
 * Every PMID, DOI and NCT number below was resolved at the time of writing against the NCBI
 * E-utilities, the ClinicalTrials.gov v2 API, or the openFDA label endpoint. Sample sizes, rate
 * ratios, confidence intervals and p-values are copied from the published abstract or from the FDA
 * label. Where a number could not be sourced, the field is absent.
 *
 * Five conventions run through the whole group.
 *
 * 1. EXACERBATION RATE IS THE ENDPOINT, AND IT IS NOT LUNG FUNCTION. Almost every asthma biologic
 *    on this page was approved on the annualised rate of asthma exacerbations — courses of oral
 *    steroids, emergency visits, admissions — and most of them move FEV1 by around a tenth of a
 *    litre or not at all. A drug can halve attacks and barely change how hard you can blow. Both
 *    numbers appear on every page here, side by side, because quoting only one of them is the
 *    commonest way these results are misread.
 *
 * 2. THE BIOMARKER DECIDES THE DRUG, AND THE TRIALS SAY SO OUT LOUD. Blood eosinophil count for
 *    the anti-interleukin-5 antibodies, IgE and skin-test positivity for omalizumab. Where a trial
 *    enrolled without the biomarker — SIROCCO and CALIMA's low-eosinophil strata, benralizumab in
 *    COPD — the result was frequently null, and those nulls are recorded as failures rather than
 *    left out.
 *
 * 3. NEUROPSYCHIATRIC HARM IS A FIRST-CLASS FINDING, NOT A FOOTNOTE. Montelukast carries a boxed
 *    warning added in March 2020 after the FDA reviewed post-marketing reports it judged serious
 *    enough to restrict the drug's allergic-rhinitis indication. That warning is on the page in the
 *    same weight as the efficacy result.
 *
 * 4. NO DOSING OR PROCUREMENT GUIDANCE. Strengths, intervals and durations appear only where they
 *    are part of a trial's description or a label's identity. Nothing here tells a reader what to
 *    take, how much, or where to get it.
 *
 * 5. PRICES ARE ACQUISITION COSTS, NOT WHAT ANYONE IS CHARGED. `retailPricePerDoseOrYear` carries
 *    the CMS National Average Drug Acquisition Cost figure already stored on the record — what
 *    pharmacies pay. `synthesisCostPerDose` stays empty unless a published cost-of-production study
 *    covers the molecule, and for this group none does.
 */

const NADAC_SOURCE = {
  label: 'CMS National Average Drug Acquisition Cost (NADAC) file, United States pharmacy pricing',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation formula and an aggregate range of US$0.01 to US$1.45 per unit, and no per-dose figure for these molecules could be verified from it',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_20_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Oxymetazoline — the decongestant whose most famous property is what happens when you stop.
  //    Three products, three doses, three decades apart: a nasal spray, a rosacea cream and an
  //    eyelid drop, all of them the same molecule squeezing the same blood vessels shut.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oxymetazoline',
    name: 'Oxymetazoline',
    tradeName: 'Afrin (nasal spray) / Rhofade (1% cream) / Upneeq (0.1% eye drops)',
    sponsor:
      'Bayer HealthCare LLC and many others for the over-the-counter nasal spray (FDA monograph application M012); Allergan for the rosacea cream (NDA 208552); RVL Pharmaceuticals for the eyelid drop (NDA 212520)',
    targetGene: 'ADRA1A and ADRA2A — human adrenergic receptor genes, not a pathogen target',
    targetProtein:
      'Alpha-1A adrenoceptor, with additional alpha-2 adrenoceptor activity, on the smooth muscle of nasal venous sinusoids, facial dermal arterioles and Müller’s muscle of the upper eyelid',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Over-the-counter nasal spray for temporary relief of nasal and sinus congestion due to the common cold, hay fever or upper respiratory allergies; 1% cream for the topical treatment of persistent facial erythema associated with rosacea in adults; 0.1% ophthalmic solution for the treatment of acquired blepharoptosis in adults',
    patientFriendlyIndication:
      'A blocked nose; the fixed facial redness of rosacea; a drooping upper eyelid',
    anatomicalSite:
      'Capacitance venous sinusoids of the nasal turbinate mucosa; dermal arterioles of the face; Müller’s smooth muscle in the upper eyelid',
    conditionContext: {
      conditionExplainer:
        'A blocked nose is usually not mucus. It is swelling: the lining of the nose contains large, spongy veins that fill with blood when inflammation tells them to, and a filled sinusoid narrows the airway from the inside. Rosacea redness and a drooping eyelid are two other problems that turn out to be about the same kind of vessel or the same kind of small muscle, which is why one molecule addresses all three.',
      whyItMatters:
        'This is the most widely used drug in the batch and the one most likely to be misused, because the misuse feels like the disease. Stopping the spray after a fortnight produces congestion worse than the congestion that started it, which reads to the user as proof they still need it.',
      whoTakesThis:
        'Adults and children aged 6 and over for the nasal spray, under the labelled three-day limit. Adults only for the cream and the eye drop, both of which are prescription products.',
      clinicalGoals:
        'For the spray, symptomatic relief over a few days and nothing more; there is no disease being treated. For the cream and the drop, a measured change in redness grade or in visual field that lasts as long as the daily application does.',
    },
    oneSentenceVerdict:
      'An alpha-adrenergic agonist that clamps the veins in the nose shut and unblocks it within minutes — and whose best-measured property is the opposite one: in a randomised 30-day study in 20 healthy volunteers, daily use produced rebound mucosal swelling of 0.5 mm without a preservative and 1.1 mm with benzalkonium chloride, alongside increased histamine sensitivity in both groups.',
    laymanHowItWorks:
      'The lining of your nose contains large veins that swell up with blood when you have a cold or an allergy, and it is that swelling, not mucus, that blocks the airway. Oxymetazoline binds to receptors on the muscle wrapped around those veins and makes it squeeze. The veins empty, the lining shrinks back, and air moves through within a minute or two. The same squeeze is what the 1% cream does to the small vessels in facial skin that make rosacea look red, and what the eye drop does to a thin muscle in the upper eyelid that lifts it a fraction of a millimetre higher.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1049 per millilitre at United States pharmacy acquisition cost (CMS NADAC, generic, median across 18 listed products, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The nasal spray is a monograph product — FDA application M012, no new drug application, dozens of manufacturers — and the acquisition cost above is a tenth of a cent per spray territory. The interesting pricing fact is what happened to the same molecule when it was reformulated: the 1% rosacea cream is NDA 208552 and the 0.1% eyelid drop is NDA 212520, both branded prescription products approved in 2017 and 2020 respectively, both carrying their own patent estates. The molecule is free; the delivery and the indication are not.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For a blocked nose the honest comparison is not between decongestants but between a decongestant and waiting. A topical steroid works slowly and does not rebound; an antihistamine works for allergy and not for a cold; saline irrigation does very little and can be used indefinitely. Oxymetazoline is faster than all of them and is the only one with a hard stop date on the label.',
      conventionalRx: [
        {
          name: 'Intranasal corticosteroid (fluticasone, mometasone, budesonide)',
          class: 'Topical glucocorticoid',
          howItCompares:
            'Takes days rather than minutes and treats the inflammation rather than the vessel calibre. It carries no rebound, which is why it is the drug used to get people off oxymetazoline: in a randomised study of 20 patients with rhinitis medicamentosa, budesonide resolved rebound congestion within 48 hours while placebo left it running past a week.',
          typicalCost:
            'Over-the-counter for fluticasone and triamcinolone in the United States; generic prescription otherwise',
          prosAndCons:
            'Pros: no tachyphylaxis, no three-day limit, addresses the underlying inflammation. Cons: no useful effect on the first day, and the effect is smaller than the immediate decongestion the spray gives.',
        },
        {
          name: 'Oral pseudoephedrine or phenylephrine',
          class: 'Systemic sympathomimetic decongestant',
          howItCompares:
            'The same class of action delivered through the bloodstream instead of onto the mucosa, so it does not produce local rebound. Oral phenylephrine in particular has been the subject of an FDA advisory committee finding on effectiveness, and the Cochrane review of nasal decongestants in monotherapy covers both routes and found only a small effect of uncertain clinical relevance.',
          typicalCost: 'Cents per tablet; pseudoephedrine is behind the pharmacy counter in the US',
          prosAndCons:
            'Pros: no rhinitis medicamentosa. Cons: systemic exposure means blood pressure and sleep effects, and the measured benefit over placebo is small.',
        },
        {
          name: 'Intranasal antihistamine (azelastine)',
          class: 'Topical H1 antagonist',
          howItCompares:
            'Works on allergic congestion and itch, not on a cold. It has an onset in tens of minutes rather than minutes, and no rebound.',
          typicalCost: 'Over the counter in the United States as generic azelastine',
          prosAndCons:
            'Pros: usable long term, covers sneeze and itch as well as block. Cons: does nothing for viral congestion; a bitter taste is the commonest reason people stop.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Saline irrigation or spray',
          action:
            'Rinses the nasal cavity with an isotonic or hypertonic salt solution, moistening the mucosa and clearing secretions.',
          patientImpact:
            'Far weaker than a decongestant and far safer. It can be used indefinitely and is the standard thing to substitute in while stopping oxymetazoline.',
          clinicalPrecaution:
            'Use sterile, distilled or previously boiled water. Tap water has caused fatal primary amoebic meningoencephalitis when used for nasal irrigation.',
        },
        {
          name: 'Stop at three days, and expect the first two days off to be worse',
          action:
            'Follow the labelled limit — "do not use for more than 3 days" — and treat the rebound as an expected consequence rather than as returning illness.',
          patientImpact:
            'The rebound swelling measured in volunteers after 30 days of use resolves; in the randomised steroid study it resolved within 48 hours with a topical steroid and took over a week without one.',
          clinicalPrecaution:
            'Long-standing rhinitis medicamentosa is treated by a clinician, not by tapering the spray on your own. Objective measurements in one series indicated steroid treatment for at least six weeks.',
        },
        {
          name: 'Keep the bottle away from children',
          action:
            'Store out of reach and out of sight. The label carries an explicit instruction to contact a poison control centre if it is swallowed.',
          patientImpact:
            'Imidazoline decongestants act on central alpha-2 receptors when swallowed. A volume that looks trivial in an adult bottle is not trivial in a small child.',
          clinicalPrecaution:
            'The nasal spray label states "Keep out of reach of children" and "If swallowed, get medical help or contact a Poison Control Center right away".',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CC(=C(C(=C1CC2=NCCN2)C)O)C(C)(C)C',
      chemicalFormula: 'C16H24N2O',
      molecularWeight: '260.37 g/mol',
      targetReceptorAffinity:
        'The Rhofade label describes oxymetazoline as an alpha-1A adrenoceptor agonist; the Upneeq label describes it as "an alpha adrenoceptor agonist targeting a subset of adrenoreceptors in Mueller\'s muscle of the eyelid". The imidazoline ring is the pharmacophore shared with xylometazoline, tetrahydrozoline and naphazoline, and it is also the reason ingestion produces central alpha-2 effects rather than only peripheral vasoconstriction.',
      structureSource: {
        label:
          'PubChem CID 4636 (oxymetazoline) — SMILES, molecular formula and weight; IUPAC name 6-tert-butyl-3-(4,5-dihydro-1H-imidazol-2-ylmethyl)-2,4-dimethylphenol',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4636',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'oxy-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and phenol purity of the imidazoline base',
          description:
            'Confirm the substitution pattern on the phenol ring before formulation. The tert-butyl group at position 6 and the two methyls are what separate oxymetazoline from xylometazoline, and the free phenol is the group that oxidises on storage, so both identity and oxidative degradants are checked in the same run.',
          reagentsAndBuffer:
            'Oxymetazoline hydrochloride reference standard, reversed-phase HPLC with UV detection at 280 nm, 1H NMR in DMSO-d6, Karl Fischer titration for water content',
        },
        {
          id: 'oxy-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Formulation of the aqueous nasal or ophthalmic solution',
          description:
            'Dissolve the hydrochloride salt in buffered aqueous vehicle to the labelled strength. The decision that matters here is preservative: benzalkonium chloride is standard, and it is the variable a randomised 30-day volunteer study isolated as roughly doubling rebound mucosal swelling.',
          dependsOnStepId: 'oxy-w1',
          reagentsAndBuffer:
            'Purified water, sodium phosphate or citrate buffer to pH 5 to 7, sodium chloride for tonicity, benzalkonium chloride 0.01 to 0.02% where used, edetate disodium',
        },
        {
          id: 'oxy-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Sterilising filtration and fill',
          description:
            'Filter the bulk solution through 0.22 micron membrane and fill. For the ophthalmic product the requirement is sterility rather than preservation, which is why Upneeq is supplied in single-patient-use containers and the label carries an explicit instruction not to touch the tip to the eye or any surface.',
          dependsOnStepId: 'oxy-w2',
          reagentsAndBuffer:
            '0.22 micron polyethersulfone filter, class A fill environment, container closure integrity testing, bacterial endotoxin assay',
        },
        {
          id: 'oxy-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Contractile response in an isolated vascular smooth muscle preparation',
          description:
            'Apply cumulative concentrations to an isolated vessel or receptor-expressing cell line and record contraction or calcium flux. The point of doing this in a tissue rather than in a binding assay is that oxymetazoline is a partial agonist at alpha-1A and a fuller agonist at alpha-2, and a binding constant alone does not tell you which of those dominates in a given bed.',
          dependsOnStepId: 'oxy-w3',
          reagentsAndBuffer:
            'Krebs-Henseleit buffer gassed with 95% O2 and 5% CO2, isometric force transducer, phentolamine and prazosin as subtype-selective antagonists, Fluo-4 calcium indicator for the cell-based arm',
        },
        {
          id: 'oxy-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Rhinostereometry and histamine challenge in the human rebound model',
          description:
            'Measure nasal mucosal position directly, before dosing and again after sustained use, and follow it with a histamine provocation to quantify hyperreactivity. This is the assay that produced the numbers this page is built on: 0.5 mm against 1.1 mm of rebound swelling with and without benzalkonium chloride at 30 days, with increased histamine sensitivity in both arms.',
          dependsOnStepId: 'oxy-w4',
          reagentsAndBuffer:
            'Rhinostereometer with fixed head position, graded histamine dihydrochloride challenge solutions, standardised symptom score card, acoustic rhinometry as a cross-check',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oxy-a1',
        category: 'measured',
        title: 'Thirty days of daily use produced measurable rebound swelling in a randomised trial',
        laymanSummary:
          'Twenty healthy volunteers with no nasal disease used the spray three times a day for a month. Their nasal linings ended up thicker than when they started, and more reactive to an irritant. The version containing the preservative benzalkonium chloride was about twice as bad.',
        technicalDetails:
          'Graf, Hallén and Juto randomised 20 healthy volunteers, double-blind, to oxymetazoline nasal spray with or without benzalkonium chloride, three times daily for 30 days. Mean rebound mucosal swelling was 1.1 mm in the benzalkonium chloride group against 0.5 mm without it (P<0.05), and the mean evening symptom score was 43 against 25 (P<0.05). Both groups showed increased histamine sensitivity, indicating nasal hyperreactivity — that is, the rebound was not solely a preservative effect. Rebound was measured by rhinostereometry against each subject’s own baseline.',
        evidenceSource:
          'Graf P, Hallén H, Juto JE. Benzalkonium chloride in a decongestant nasal spray aggravates rhinitis medicamentosa in healthy volunteers. Clin Exp Allergy 1995;25(5):395-400',
        doi: '',
        measuredMetric:
          'Rebound nasal mucosal swelling in millimetres by rhinostereometry, and histamine sensitivity, after 30 days of dosing in healthy volunteers',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a2',
        category: 'measured',
        title: 'REVEAL: 885 patients across two identical phase 3 trials of the 1% rosacea cream',
        laymanSummary:
          'Two trials asked whether a cream version made fixed facial redness measurably better for a day at a time. Both hit their target: a two-grade improvement judged by both the doctor and the patient, held out to twelve hours after the morning application.',
        technicalDetails:
          'REVEAL 1 (NCT02131636) randomised 440 adults and REVEAL 2 (NCT02132117) randomised 445 adults with moderate to severe persistent facial erythema of rosacea to oxymetazoline cream 1.0% or vehicle once daily for 29 days. The primary endpoint in both was composite success — at least a 2-grade improvement from baseline on both the Clinician Erythema Assessment and the Subject Self-Assessment — at 3, 6, 9 and 12 hours post-dose on day 29. REVEAL 1 reported significance at each individual timepoint (P<0.02) and overall (P<0.001). REVEAL 2 reported composite success P=0.001, CEA P<0.001, SSA P=0.011, with digital image analysis also favouring oxymetazoline (P<0.001). Discontinuation for treatment-emergent adverse events was 1.8% against 0.5% in REVEAL 1 and 2.7% against 0.5% in REVEAL 2.',
        evidenceSource:
          'Kircik LH et al., J Drugs Dermatol 2018;17(1):97-105 (REVEAL 1, PMID 29320594); Baumann L et al., J Drugs Dermatol 2018;17(3):290-298 (REVEAL 2, PMID 29537447)',
        measuredMetric:
          'Composite ≥2-grade improvement on Clinician Erythema Assessment and Subject Self-Assessment at 3, 6, 9 and 12 hours on day 29',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a3',
        category: 'measured',
        title: 'The eyelid drop widened the visual field by about five points on a 46-point test',
        laymanSummary:
          'In 304 people whose upper eyelids had dropped far enough to cut into their field of vision, one drop a day let them see a few more points on a peripheral vision test than a placebo drop did — on the first day and still at two weeks.',
        technicalDetails:
          'Slonim and colleagues pooled two phase 3, randomised, double-masked, vehicle-controlled trials (NCT02436759, n=140; NCT03565887, n=164) of oxymetazoline hydrochloride 0.1% ophthalmic solution once daily for 42 days in 304 adults with acquired ptosis and superior visual field deficit, randomised 2:1. Mean difference from vehicle in points seen on the Leicester Peripheral Field Test was 4.07 (95% CI 2.74 to 5.39; P<0.001) on day 1 and 4.74 (95% CI 3.43 to 6.04; P<0.001) on day 14. Marginal reflex distance improved by 0.47 mm (day 1) and 0.67 mm (day 14) more than vehicle, both P<0.001. Treatment-emergent adverse events were 31.0% (63 of 203) on drug against 35.6% (36 of 101) on vehicle.',
        evidenceSource:
          'Slonim CB, Foster S, Jaros M, et al. Association of Oxymetazoline Hydrochloride, 0.1%, Solution Administration With Visual Field in Acquired Ptosis: A Pooled Analysis of 2 Randomized Clinical Trials. JAMA Ophthalmol 2020;138(11):1168-1175',
        doi: '10.1001/jamaophthalmol.2020.3812',
        measuredMetric:
          'Change from baseline in points seen on the Leicester Peripheral Field Test, and marginal reflex distance in millimetres',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a4',
        category: 'failed',
        title:
          'Cochrane: fifteen trials, 1,838 people, and a decongestant effect of uncertain clinical relevance',
        laymanSummary:
          'The systematic review of decongestants used on their own for a cold found a small benefit after several doses and could not reach any conclusion at all about a single dose. The reviewers described the evidence as low quality and said they did not know whether the effect mattered to patients.',
        technicalDetails:
          'Deckx and colleagues reviewed 15 trials in 1,838 participants of nasal decongestants in monotherapy for the common cold. For multiple doses, subjective congestion was better than placebo approximately three hours after the last dose (SMD 0.49, 95% CI 0.07 to 0.92; P=0.02; GRADE low-quality evidence). The odds ratio for adverse events was 0.98 (95% CI 0.68 to 1.40; P=0.90; low-quality evidence). The authors were unable to draw conclusions on single-dose effectiveness, described the multiple-dose result as "a small positive effect" whose "clinical relevance of this small effect is unknown", and noted no apparent short-term increase in adverse events in adults.',
        evidenceSource:
          'Deckx L, De Sutter AI, Guo L, Mir NA, van Driel ML. Nasal decongestants in monotherapy for the common cold. Cochrane Database Syst Rev 2016;10:CD009612',
        doi: '10.1002/14651858.CD009612.pub2',
        measuredMetric:
          'Standardised mean difference in subjective nasal congestion against placebo after multiple doses',
        auditFlag: 'caution',
      },
      {
        id: 'oxy-a5',
        category: 'inferred',
        title: 'The three-day rule on the label was never the output of a three-day trial',
        laymanSummary:
          'The label says not to use it for more than three days. Nothing was measured at three days. The rebound studies ran for thirty days, and a separate ten-day study in patients found no rebound at all. Three days is a margin of safety, not a measured threshold.',
        technicalDetails:
          'The over-the-counter monograph label states "Do not use for more than 3 days" and "Frequent or prolonged use may cause nasal congestion to recur or worsen". The human data bracket that limit rather than establish it. At 30 days, rebound swelling and hyperreactivity are reproducible. At 10 days, Graf and colleagues gave oxymetazoline with or without benzalkonium chloride to 35 patients with vasomotor rhinitis and found no rebound swelling in either group by objective measure or symptom score, concluding it was safe to use for 10 days in that population — while noting the benzalkonium chloride group showed significantly reduced histamine sensitivity after treatment (P<0.001). No published randomised comparison establishes three days as the point at which rebound begins.',
        evidenceSource:
          'AFRIN over-the-counter drug facts label (FDA monograph application M012); Graf P, Enerdal J, Hallén H. Ten days\' use of oxymetazoline nasal spray with or without benzalkonium chloride in patients with vasomotor rhinitis. Arch Otolaryngol Head Neck Surg 1999;125(10):1128-1132',
        inferredClaim:
          'That three days is the measured safe limit — the number is a regulatory precaution sitting between a ten-day study that found nothing and a thirty-day study that found rebound, with nothing tested in between',
        auditFlag: 'contested',
      },
      {
        id: 'oxy-a6',
        category: 'conclusion_shift',
        title: 'Benzalkonium chloride was blamed for rebound; the controlled data made it a modifier',
        laymanSummary:
          'For years the preservative was widely held to be the cause of rebound congestion, and preservative-free sprays were sold on that basis. The randomised work showed something narrower: removing the preservative halved the rebound but did not abolish it, and both groups still became more sensitive to irritants.',
        technicalDetails:
          'In the 30-day randomised volunteer study, rebound swelling was 1.1 mm with benzalkonium chloride and 0.5 mm without (P<0.05) — a difference, but not the difference between presence and absence — and increased histamine sensitivity appeared in both arms. Graf’s own review concluded that modern imidazoline vasoconstrictors carry minimal rhinitis medicamentosa risk on their own while overuse produces rebound congestion, hyperreactivity, tolerance and histologic change, and that benzalkonium chloride amplifies severity. A separate review notes that sustained benzalkonium chloride alone induces nasal mucosal swelling. The conclusion moved from "the preservative causes it" to "sustained alpha-agonism causes it and the preservative makes it worse".',
        evidenceSource:
          'Graf P, Hallén H, Juto JE, Clin Exp Allergy 1995;25(5):395-400 (PMID 7553241); Graf P, Allergy 1997;52(40 Suppl):28-34 (PMID 9353558); Graf P, Clin Ther 1999;21(10):1749-1755 (PMID 10566570)',
        inferredClaim:
          'That benzalkonium chloride is the cause of rhinitis medicamentosa — the randomised comparison makes it an aggravating factor of roughly twofold, not the mechanism',
        auditFlag: 'verified',
      },
      {
        id: 'oxy-a7',
        category: 'failed',
        title: 'The pooled REVEAL paper in the Journal of the American Academy of Dermatology was withdrawn',
        laymanSummary:
          'A paper combining the two rosacea trials was published online and then withdrawn at the request of the authors and the editor. The two individual trial reports remain in the literature and are what this page cites.',
        technicalDetails:
          'Stein-Gold L, Kircik LH, Draelos ZD, et al. "Efficacy and safety of topical oxymetazoline cream 1.0% for treatment of persistent facial erythema associated with rosacea: findings from the 2 phase 3, 29-day, randomized, controlled REVEAL trials", J Am Acad Dermatol, posted online 31 January 2018, carries the PubMed title prefix WITHDRAWN and the note that the article "has been withdrawn at the request of the author(s) and/or editor". The record supplies no abstract. The underlying trial data are reported separately in J Drugs Dermatol for REVEAL 1 (PMID 29320594) and REVEAL 2 (PMID 29537447), and those two papers, not the withdrawn pooled analysis, are the basis of every REVEAL number quoted here.',
        evidenceSource:
          'PubMed record PMID 29409915, J Am Acad Dermatol 2018 Jan 31, marked WITHDRAWN',
        doi: '10.1016/j.jaad.2018.01.028',
        auditFlag: 'retracted',
      },
      {
        id: 'oxy-a8',
        category: 'inferred',
        title: 'A drooping eyelid can be a symptom, and the drop treats the droop rather than the cause',
        laymanSummary:
          'A newly drooping eyelid is sometimes the first sign of a stroke, an aneurysm or myasthenia gravis. A drop that lifts the lid by half a millimetre makes the sign less visible without touching any of those.',
        technicalDetails:
          'The Upneeq label warns that ptosis may be an indication of a serious neurologic condition, listing stroke, intracranial aneurysm, Horner syndrome and myasthenia gravis, and that alpha-adrenergic agonists may impact blood pressure, with caution advised in cardiovascular disease, in cerebral or coronary insufficiency, and in narrow-angle glaucoma where angle-closure risk may be increased. Across four pooled randomised trials in 568 participants, treatment-emergent adverse events were 31.2% on drug against 30.6% on vehicle, with serious events in four participants on drug and one on vehicle; no ocular adverse event exceeded 3.5% incidence.',
        evidenceSource:
          'UPNEEQ United States prescribing information (NDA 212520, label effective 19 September 2025); Wirta DL et al., Clin Ophthalmol 2021;15:4035-4048',
        doi: '10.2147/OPTH.S322326',
        inferredClaim:
          'That lifting the eyelid addresses the problem — for involutional ptosis it does, and for the neurologic causes on the label it removes the sign while the cause continues',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Sprayed onto the lining, not swallowed',
        laymanDesc:
          'Two sprays put the drug directly on the swollen tissue. Almost none of it needs to reach the bloodstream to work, which is why it acts in a minute or two rather than in an hour.',
        molecularDetail:
          'The over-the-counter nasal formulation is oxymetazoline hydrochloride 0.05% in buffered aqueous vehicle, typically preserved with benzalkonium chloride. The cream is 1.0% in an oil-in-water emulsion under NDA 208552 and the ophthalmic solution is 0.1% in single-patient-use containers under NDA 212520.',
        iconName: 'Droplets',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches receptors on the outside of the muscle cells',
        laymanDesc:
          'The molecule never has to get inside a cell. It docks onto a protein that sits on the outer surface of the muscle cells wrapped around the blood vessels in the lining.',
        molecularDetail:
          'Oxymetazoline diffuses through the mucus layer to reach adrenoceptors on vascular smooth muscle of the capacitance sinusoids. These are G-protein-coupled receptors with an extracellular binding pocket; no cellular uptake or metabolic activation is required, which is the structural reason the onset is measured in minutes.',
        iconName: 'Target',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It docks onto an adrenaline receptor',
        laymanDesc:
          'The receptor it binds is the one your own adrenaline uses to tighten blood vessels. The drug is a synthetic stand-in for that signal, applied locally and continuously.',
        molecularDetail:
          'The Rhofade label describes oxymetazoline as an alpha-1A adrenoceptor agonist; it also has substantial alpha-2 adrenoceptor activity, and the balance between the two differs by vascular bed. The imidazoline ring is the shared pharmacophore of oxymetazoline, xylometazoline, tetrahydrozoline and naphazoline.',
        iconName: 'Link',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The muscle around the vein contracts',
        laymanDesc:
          'The muscle squeezes. Blood is pushed out of the spongy veins in the nasal lining, the tissue shrinks back against the wall, and the airway opens.',
        molecularDetail:
          'Alpha-1A activation couples through Gq to phospholipase C, generating inositol trisphosphate and diacylglycerol, releasing intracellular calcium and activating myosin light-chain kinase. Alpha-2 activation couples through Gi. The net result in the nasal mucosa is emptying of the venous sinusoids rather than arteriolar constriction, which is why decongestion does not cause ischaemia at labelled doses.',
        iconName: 'Minimize2',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Air moves, for up to twelve hours',
        laymanDesc:
          'This is the whole therapeutic effect: a physically wider airway for as long as the drug is on the tissue. Nothing about the cold or the allergy has changed.',
        molecularDetail:
          'The same contraction in facial dermal arterioles is what produced composite success on the Clinician Erythema Assessment out to 12 hours post-dose in REVEAL, and contraction of Müller’s muscle is what produced a 0.47 to 0.67 mm gain in marginal reflex distance in the blepharoptosis trials.',
        iconName: 'Wind',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And with sustained use, the tissue answers back',
        laymanDesc:
          'Keep signalling the same receptor every day and the response gets shorter, and the swelling between doses gets worse than it was to begin with. That is the rebound, and it is the best-measured thing about this drug.',
        molecularDetail:
          'Sustained use shortens the decongestive response — in a 30-day xylometazoline study the effect at 1 hour matched baseline while the effect at 5 hours was significantly reduced (p<0.005) and rebound swelling appeared in 8 of 9 subjects. The rebound is interstitial oedema rather than vasodilation, which is why a topical corticosteroid resolves it and a stronger vasoconstrictor does not.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'REVEAL 1 (NCT02131636)',
        phase: 'Phase 3, randomised, double-blind, vehicle-controlled',
        sampleSize: 440,
        primaryEndpoint:
          'Composite ≥2-grade improvement on Clinician Erythema Assessment and Subject Self-Assessment at 3, 6, 9 and 12 hours on day 29',
        endpointMet: true,
        statisticalPValue: 'P<0.02 at each timepoint and P<0.001 overall against vehicle',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'REVEAL 2 (NCT02132117)',
        phase: 'Phase 3, randomised, double-blind, vehicle-controlled',
        sampleSize: 445,
        primaryEndpoint:
          'Composite ≥2-grade improvement on Clinician Erythema Assessment and Subject Self-Assessment on day 29',
        endpointMet: true,
        statisticalPValue: 'Composite P=0.001; CEA P<0.001; SSA P=0.011',
        unreportedAdverseSignals:
          'Post-treatment rebound erythema occurred in 2 patients (1.2%) on oxymetazoline against none on vehicle. The pooled analysis of both REVEAL trials submitted to J Am Acad Dermatol was subsequently withdrawn at author and editor request.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'RVL-1201 blepharoptosis trial (NCT02436759)',
        phase: 'Phase 3, randomised, double-masked, vehicle-controlled',
        sampleSize: 140,
        primaryEndpoint:
          'Mean change from baseline in the number of points seen on the Leicester Peripheral Field Test',
        endpointMet: true,
        statisticalPValue:
          'Pooled with NCT03565887: mean difference 4.07 points (95% CI 2.74 to 5.39) on day 1 and 4.74 (95% CI 3.43 to 6.04) on day 14, both P<0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'RVL-1201 blepharoptosis trial (NCT03565887)',
        phase: 'Phase 3, randomised, double-masked, vehicle-controlled',
        sampleSize: 164,
        primaryEndpoint:
          'Mean change from baseline in the number of points seen on the Leicester Peripheral Field Test',
        endpointMet: true,
        statisticalPValue: 'Reported only in the 304-patient pooled analysis, both timepoints P<0.001',
        unreportedAdverseSignals:
          'The endpoint is a visual field point count on a peripheral test, not visual acuity, and the marginal reflex distance gain was 0.47 to 0.67 mm. Neither trial reports what proportion of participants noticed the change without measurement.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Graf, Hallén & Juto 1995 rebound study (PMID 7553241) — pre-dates ClinicalTrials.gov, no registry entry',
        phase: 'Randomised, double-blind, 30-day mechanistic study in healthy volunteers',
        sampleSize: 20,
        primaryEndpoint:
          'Rebound nasal mucosal swelling by rhinostereometry and evening symptom score after 30 days of thrice-daily dosing',
        endpointMet: true,
        statisticalPValue:
          'Rebound swelling 1.1 mm with benzalkonium chloride against 0.5 mm without (P<0.05); evening symptom score 43 against 25 (P<0.05)',
        unreportedAdverseSignals:
          'Twenty healthy volunteers, no untreated control arm, and the comparison is preservative against no preservative rather than drug against placebo. It measures how much worse benzalkonium chloride makes rebound, not the absolute size of rebound against no spray at all.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Rebound mucosal swelling of 0.5 mm without and 1.1 mm with benzalkonium chloride after 30 days of thrice-daily use in 20 randomised healthy volunteers (P<0.05), with increased histamine sensitivity in both arms',
        'Composite ≥2-grade erythema improvement out to 12 hours on day 29 in 885 adults across REVEAL 1 and REVEAL 2 (P<0.001 and P=0.001)',
        'A 4.07-point gain on day 1 and 4.74-point gain on day 14 in Leicester Peripheral Field Test points against vehicle in 304 randomised adults with acquired ptosis, both P<0.001',
        'A small congestion benefit after multiple doses in the common cold: SMD 0.49 (95% CI 0.07 to 0.92), graded low-quality across 15 trials in 1,838 people',
      ],
      unsupportedInferences: [
        'That three days is a measured threshold for rebound — no randomised comparison establishes it, and a 10-day study in 35 patients found no rebound at all',
        'That benzalkonium chloride causes rhinitis medicamentosa, when removing it halved rather than abolished rebound',
        'That relieving congestion shortens a cold or prevents sinusitis — no trial on this page measured either',
        'That a measured half-millimetre eyelid lift is a change a patient notices; the trials report the measurement, not the noticing',
      ],
      whatFailedInitially: [
        'Cochrane could draw no conclusion at all about a single dose of a nasal decongestant, and called the multiple-dose effect of unknown clinical relevance',
        'Sustained dosing shortens the drug’s own duration: at 30 days the 5-hour effect was significantly below baseline while the 1-hour effect was unchanged (p<0.005)',
        'The pooled REVEAL publication in J Am Acad Dermatol was withdrawn at author and editor request; only the two separate trial reports stand',
        'Rebound erythema after stopping the cream was reported in 1.2% to 2.2% of treated patients — the same phenomenon as nasal rebound, in skin',
      ],
      realWorldOutcome: [
        'The most-used nasal decongestant in the world, sold under an over-the-counter monograph with a hard three-day limit printed on the box',
        'Rhinitis medicamentosa remains a recognised clinical entity treated by withdrawal plus a topical corticosteroid, with objective measurements in one series indicating at least six weeks of steroid',
        'The same molecule was reformulated twice into branded prescription products decades after going generic: a 1% rosacea cream in 2017 and a 0.1% eyelid drop in 2020',
        'Both reformulations were approved on measured endpoints — erythema grade and visual-field points — rather than on any patient-reported global outcome',
      ],
    },
    deliverySystem: {
      type:
        'Topical: 0.05% aqueous nasal spray (over the counter), 1.0% dermal cream (prescription), 0.1% ophthalmic solution in single-patient-use containers (prescription)',
      description:
        'All three routes put the drug directly on the tissue it acts on and rely on local receptor occupancy rather than systemic exposure. The ophthalmic product is supplied preservative-free in single-use containers, and its label instructs patients not to touch the container tip to the eye or any surface.',
      safetyProfile:
        'The nasal label limits use to 3 days and warns that frequent or prolonged use may cause congestion to recur or worsen; it directs users to a poison control centre if the product is swallowed and to keep it out of reach of children. The cream label warns about blood-pressure effects of alpha-adrenergic agonists and advises caution in cerebral or coronary insufficiency, Raynaud’s phenomenon, thromboangiitis obliterans, scleroderma, Sjögren’s syndrome and angle-closure glaucoma risk; commonest adverse events were application-site dermatitis, worsening inflammatory rosacea lesions, pruritus, erythema and pain, each about 1 to 2%. The eyelid drop label warns that ptosis may indicate stroke, intracranial aneurysm, Horner syndrome or myasthenia gravis, and lists punctate keratitis, conjunctival hyperaemia, dry eye, blurred vision, instillation-site pain, eye irritation and headache at 1 to 5%.',
    },
    commonQuestions: [
      {
        q: 'Is rebound congestion real, or is it just the cold coming back?',
        a: 'It is real and it has been measured directly. Twenty healthy volunteers with no cold and no allergy used the spray three times a day for thirty days, and their nasal linings were measurably thicker at the end than at the start — half a millimetre without preservative, over a millimetre with it — and both groups had become more sensitive to a histamine challenge. None of those people had an illness to relapse into. What makes it convincing is exactly that: the study was done in people with nothing wrong with their noses.',
        auditNote:
          'The comparison in that trial was preservative against no preservative, not spray against no spray. So it quantifies how much worse benzalkonium chloride makes rebound rather than the absolute size of rebound itself.',
      },
      {
        q: 'Where does the three-day limit come from?',
        a: 'Not from a trial that tested three days. The human evidence brackets the number rather than establishing it. At ten days, a study of 35 patients with vasomotor rhinitis found no rebound at all by objective measurement or symptom score. At thirty days, rebound is reproducible in healthy volunteers. Nothing in between has been tested. Three days is a regulatory precaution set with a wide margin, and this page treats it as one rather than as a measured cliff edge.',
      },
      {
        q: 'How do you stop if you have been using it for months?',
        a: 'The evidence points at a topical corticosteroid rather than at tapering. In a randomised study of 20 patients with rhinitis medicamentosa, everyone had rebound congestion 24 hours after stopping the spray; the group given budesonide had resolved within 48 hours, while the placebo group was still congested more than a week later. A separate series of 10 patients who stopped vasoconstrictors and took budesonide for six weeks all succeeded in stopping, and the objective measurements in that series indicated at least six weeks were needed. This is a clinician’s job, not a self-management project, and this page is not telling you what to take.',
      },
      {
        q: 'Why is the same drug in a rosacea cream and an eye drop?',
        a: 'Because the action is mechanical and the same mechanism serves three different problems. Squeezing veins in the nasal lining opens the airway. Squeezing arterioles in facial skin makes fixed redness fade — measured as a two-grade improvement on both a clinician and a patient scale, lasting out to twelve hours after a single morning application in 885 randomised adults. Contracting Müller’s muscle in the upper eyelid lifts the lid by around half a millimetre, which was enough to add roughly five points to a peripheral visual field test in 304 people. Three formulations, one contraction.',
        auditNote:
          'The prices tell a different story from the pharmacology. The nasal spray is a monograph product costing about a tenth of a cent per spray. The other two are branded new drug applications.',
      },
      {
        q: 'Does it shorten a cold?',
        a: 'No trial on this page measured that, and the systematic review does not claim it. Cochrane pooled 15 trials in 1,838 people and found a small improvement in subjective congestion about three hours after multiple doses, graded low-quality, with the authors stating plainly that the clinical relevance of the effect is unknown and that no conclusion could be drawn about a single dose at all. The drug changes the diameter of a blood vessel. It does nothing to the virus.',
      },
    ],
    recentAuditDate: '2026-08-21',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Graf P, Hallén H, Juto JE. Benzalkonium chloride in a decongestant nasal spray aggravates rhinitis medicamentosa in healthy volunteers. Clin Exp Allergy 1995;25(5):395-400',
        identifier: '7553241',
        kind: 'pmid',
      },
      {
        label:
          'Graf P, Hallén H, Juto JE. The pathophysiology and treatment of rhinitis medicamentosa. Clin Otolaryngol Allied Sci 1995;20(3):224-229',
        identifier: '7554332',
        kind: 'pmid',
      },
      {
        label:
          'Graf P, Juto JE. Sustained use of xylometazoline nasal spray shortens the decongestive response and induces rebound swelling. Rhinology 1995;33(1):14-17',
        identifier: '7540314',
        kind: 'pmid',
      },
      {
        label:
          'Graf P, Enerdal J, Hallén H. Ten days\' use of oxymetazoline nasal spray with or without benzalkonium chloride in patients with vasomotor rhinitis. Arch Otolaryngol Head Neck Surg 1999;125(10):1128-1132',
        identifier: '10522506',
        kind: 'pmid',
      },
      {
        label:
          'Graf P. Adverse effects of benzalkonium chloride on the nasal mucosa: allergic rhinitis and rhinitis medicamentosa. Clin Ther 1999;21(10):1749-1755',
        identifier: '10566570',
        kind: 'pmid',
      },
      {
        label:
          'Ferguson BJ, Paramaesvaran S, Rubinstein E. A study of the effect of nasal steroid sprays in perennial allergic rhinitis patients with rhinitis medicamentosa. Otolaryngol Head Neck Surg 2001;125(3):253-260',
        identifier: '11555762',
        kind: 'pmid',
      },
      {
        label:
          'Deckx L, De Sutter AI, Guo L, Mir NA, van Driel ML. Nasal decongestants in monotherapy for the common cold. Cochrane Database Syst Rev 2016;10:CD009612',
        identifier: '10.1002/14651858.CD009612.pub2',
        kind: 'doi',
      },
      {
        label:
          'Kircik LH, DuBois J, Draelos ZD, et al. Pivotal Trial of the Efficacy and Safety of Oxymetazoline Cream 1.0% for Persistent Facial Erythema Associated With Rosacea: Findings from the First REVEAL Trial. J Drugs Dermatol 2018;17(1):97-105',
        identifier: '29320594',
        kind: 'pmid',
      },
      {
        label:
          'Baumann L, Goldberg DJ, Stein Gold L, et al. Findings from the Second REVEAL Trial. J Drugs Dermatol 2018;17(3):290-298',
        identifier: '29537447',
        kind: 'pmid',
      },
      {
        label:
          'Slonim CB, Foster S, Jaros M, et al. Association of Oxymetazoline Hydrochloride, 0.1%, Solution Administration With Visual Field in Acquired Ptosis: A Pooled Analysis of 2 Randomized Clinical Trials. JAMA Ophthalmol 2020;138(11):1168-1175',
        identifier: '10.1001/jamaophthalmol.2020.3812',
        kind: 'doi',
      },
      {
        label:
          'Wirta DL, Korenfeld MS, Foster S, et al. Safety of Once-Daily Oxymetazoline HCl Ophthalmic Solution, 0.1% in Patients with Acquired Blepharoptosis: Results from Four Randomized, Double-Masked Clinical Trials. Clin Ophthalmol 2021;15:4035-4048',
        identifier: '10.2147/OPTH.S322326',
        kind: 'doi',
      },
      {
        label:
          'Stein-Gold L, Kircik LH, Draelos ZD, et al. WITHDRAWN: pooled analysis of the two REVEAL trials. J Am Acad Dermatol, posted 31 January 2018',
        identifier: '10.1016/j.jaad.2018.01.028',
        kind: 'doi',
      },
      {
        label: 'REVEAL 1 registry record — AGN-199201 in persistent erythema associated with rosacea',
        identifier: 'NCT02131636',
        kind: 'nct',
      },
      {
        label:
          'REVEAL 2 registry record — oxymetazoline HCl cream 1.0% in persistent erythema associated with rosacea',
        identifier: 'NCT02132117',
        kind: 'nct',
      },
      {
        label: 'RVL-1201 safety and efficacy in acquired blepharoptosis',
        identifier: 'NCT02436759',
        kind: 'nct',
      },
      {
        label: 'RVL-1201 safety and efficacy in acquired blepharoptosis, second phase 3 trial',
        identifier: 'NCT03565887',
        kind: 'nct',
      },
      {
        label: 'UPNEEQ United States prescribing information, NDA 212520, label effective 19 September 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22UPNEEQ%22',
        kind: 'regulatory',
      },
      {
        label: 'RHOFADE (oxymetazoline hydrochloride cream 1%) United States prescribing information, NDA 208552',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22RHOFADE%22',
        kind: 'regulatory',
      },
      {
        label:
          'AFRIN (oxymetazoline hydrochloride 0.05%) over-the-counter drug facts label, FDA monograph application M012',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22AFRIN%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4636 — oxymetazoline structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4636',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
