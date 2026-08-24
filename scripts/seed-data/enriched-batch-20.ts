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
        title:
          'Thirty days of daily use produced measurable rebound swelling in a randomised trial',
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
          "AFRIN over-the-counter drug facts label (FDA monograph application M012); Graf P, Enerdal J, Hallén H. Ten days' use of oxymetazoline nasal spray with or without benzalkonium chloride in patients with vasomotor rhinitis. Arch Otolaryngol Head Neck Surg 1999;125(10):1128-1132",
        inferredClaim:
          'That three days is the measured safe limit — the number is a regulatory precaution sitting between a ten-day study that found nothing and a thirty-day study that found rebound, with nothing tested in between',
        auditFlag: 'contested',
      },
      {
        id: 'oxy-a6',
        category: 'conclusion_shift',
        title:
          'Benzalkonium chloride was blamed for rebound; the controlled data made it a modifier',
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
        title:
          'The pooled REVEAL paper in the Journal of the American Academy of Dermatology was withdrawn',
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
        title:
          'A drooping eyelid can be a symptom, and the drop treats the droop rather than the cause',
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
        statisticalPValue:
          'Reported only in the 304-patient pooled analysis, both timepoints P<0.001',
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
      type: 'Topical: 0.05% aqueous nasal spray (over the counter), 1.0% dermal cream (prescription), 0.1% ophthalmic solution in single-patient-use containers (prescription)',
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
          "Graf P, Enerdal J, Hallén H. Ten days' use of oxymetazoline nasal spray with or without benzalkonium chloride in patients with vasomotor rhinitis. Arch Otolaryngol Head Neck Surg 1999;125(10):1128-1132",
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
        label:
          'REVEAL 1 registry record — AGN-199201 in persistent erythema associated with rosacea',
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
        label:
          'UPNEEQ United States prescribing information, NDA 212520, label effective 19 September 2025',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22UPNEEQ%22',
        kind: 'regulatory',
      },
      {
        label:
          'RHOFADE (oxymetazoline hydrochloride cream 1%) United States prescribing information, NDA 208552',
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
  // ---------------------------------------------------------------------------------------------
  // 2. Mepolizumab — the antibody that failed in asthma in 2007, was given the same dose to a
  //    different population in 2012, and halved attacks. Nothing about the molecule changed. The
  //    entry criteria did.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mepolizumab',
    name: 'Mepolizumab',
    tradeName: 'Nucala',
    sponsor: 'GlaxoSmithKline LLC (BLA 125526)',
    targetGene: 'IL5',
    targetProtein:
      'Interleukin-5, the free cytokine in circulation — mepolizumab binds IL-5 itself, not the receptor, and blocks it from reaching the alpha chain of the IL-5 receptor complex on the eosinophil surface',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'Add-on maintenance treatment of adult and paediatric patients aged 6 years and older with severe asthma and an eosinophilic phenotype; add-on maintenance treatment of adults with chronic rhinosinusitis with nasal polyps; add-on maintenance treatment of adults with inadequately controlled chronic obstructive pulmonary disease and an eosinophilic phenotype; treatment of adults with eosinophilic granulomatosis with polyangiitis; and treatment of patients aged 6 years and older with hypereosinophilic syndrome of at least 6 months duration without an identifiable non-haematologic secondary cause',
    patientFriendlyIndication:
      'Severe asthma driven by a high eosinophil count, nasal polyps, eosinophilic COPD, and two rarer diseases of the same white blood cell',
    anatomicalSite:
      'The bloodstream and the airway mucosa — the antibody never enters a cell. It binds free interleukin-5 in circulation, so eosinophil production in the bone marrow and eosinophil survival in the airway both fall',
    conditionContext: {
      conditionExplainer:
        'Asthma is not one disease. In a large minority of people with the severe form, the airway is full of eosinophils, a white blood cell whose growth, recruitment and survival depend almost entirely on one messenger, interleukin-5. That subgroup can be identified from a blood test. The rest of severe asthma cannot, and does not respond to this drug.',
      whyItMatters:
        'Mepolizumab is the clearest case in respiratory medicine of a drug that works only when the biomarker is checked first. Given to unselected asthma in 2007, it depleted eosinophils from blood and sputum and changed no clinical endpoint at all. Given at a lower dose to people picked for eosinophilic inflammation and repeated exacerbations, it halved attacks. The molecule did not change.',
      whoTakesThis:
        'People already on high-dose inhaled corticosteroids who keep having attacks, and whose blood eosinophil count is raised. It is an add-on, never a replacement for the inhalers, and never a rescue treatment — the label states it must not be used for acute bronchospasm or status asthmaticus.',
      clinicalGoals:
        'Fewer courses of oral steroids, fewer emergency visits and admissions, and in steroid-dependent asthma a lower daily prednisolone dose. Not a normal lung function test: the measured change in FEV1 across the pivotal trial was about a tenth of a litre.',
    },
    oneSentenceVerdict:
      'An antibody that mops up interleukin-5 before it can reach the eosinophil, which in 576 patients with severe eosinophilic asthma cut exacerbations by 53% (MENSA, p<0.001) while moving FEV1 by 98 mL and improving the asthma control score by 0.44 points — below the 0.5-point difference the same paper names as the minimum that matters to a patient.',
    laymanHowItWorks:
      'One messenger molecule, interleukin-5, is almost solely responsible for making eosinophils, calling them into the airway and keeping them alive there. Mepolizumab is an antibody that grabs interleukin-5 in the bloodstream and holds on to it, so the signal never arrives. Eosinophil numbers fall in the blood within days and stay low, and in people whose asthma attacks are driven by those cells the attacks become roughly half as frequent. It does nothing for an attack already happening, and it barely changes how hard you can blow into a spirometer.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    substitutes: {
      summary:
        'The comparison that matters is not mepolizumab against nothing — that comparison has been run and won — but mepolizumab against the other biologics aimed at the same patient, and against the cheap generic tablets that were tried first. No head-to-head randomised trial of mepolizumab against benralizumab, dupilumab or omalizumab in severe asthma has reported a superiority result on exacerbations, so the choice between them is made on biomarker, dosing interval and price rather than on measured advantage.',
      conventionalRx: [
        {
          name: 'Benralizumab (Fasenra)',
          class: 'Anti-interleukin-5 receptor alpha monoclonal antibody, afucosylated IgG1',
          howItCompares:
            'Kills the eosinophil outright through antibody-dependent cell-mediated cytotoxicity instead of starving it of a growth signal, and reaches near-complete blood eosinophil depletion rather than the partial reduction mepolizumab produces. On the endpoint that matters, the results are of the same size: SIROCCO reported a 51% exacerbation reduction against mepolizumab’s 53% in MENSA, in separate trials that were never compared directly.',
          typicalCost:
            'No CMS National Average Drug Acquisition Cost figure is published for either molecule — both are supplied through specialty channels rather than the retail pharmacy survey',
          prosAndCons:
            'Pros: dosing interval extends to every 8 weeks after the loading doses. Cons: the same failure to move lung function, and the same absence of any head-to-head trial against mepolizumab.',
        },
        {
          name: 'Dupilumab (Dupixent)',
          class: 'Anti-interleukin-4 receptor alpha monoclonal antibody',
          howItCompares:
            'Blocks a different arm of type 2 inflammation — interleukin-4 and interleukin-13 through a shared receptor subunit — and unlike the anti-IL-5 antibodies it produces a lung function change that is consistently larger. It raises blood eosinophils transiently rather than lowering them, which is the opposite pharmacodynamic signature.',
          typicalCost: 'Specialty biologic, not covered by the CMS retail acquisition cost survey',
          prosAndCons:
            'Pros: larger FEV1 effect, and approvals across eczema, nasal polyps and eosinophilic oesophagitis. Cons: transient hypereosinophilia in a minority, and it is not indicated for eosinophilic granulomatosis with polyangiitis or hypereosinophilic syndrome, which mepolizumab is.',
        },
        {
          name: 'Oral prednisolone or prednisone',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The treatment mepolizumab is trying to replace. SIRIUS measured exactly this: over 20 weeks in 135 steroid-dependent patients, the median reduction in daily glucocorticoid dose was 50% on mepolizumab against no reduction on placebo (p=0.007), while exacerbations still fell 32% (1.44 against 2.12 per year, p=0.04).',
          typicalCost: 'Among the cheapest medicines in the world at pharmacy acquisition cost',
          prosAndCons:
            'Pros: works in every asthma phenotype, works within hours, costs almost nothing. Cons: the cumulative harm — bone loss, diabetes, cataract, adrenal suppression — is why a drug costing thousands of times more is prescribed to avoid it.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not stop your inhalers when the injections start',
          action:
            'Keep taking the inhaled corticosteroid exactly as before unless a clinician reduces it deliberately.',
          patientImpact:
            'Section 5.4 of the label directs that systemic or inhaled corticosteroids must not be discontinued abruptly on starting mepolizumab, and that any reduction should be gradual and supervised. Mepolizumab was studied as an add-on to those inhalers in every pivotal trial, never as a replacement for them.',
          clinicalPrecaution:
            'The label warns that reducing corticosteroid dose may produce systemic withdrawal symptoms or unmask conditions the steroid had been suppressing — a specific concern in eosinophilic granulomatosis with polyangiitis, where vasculitic features can re-emerge.',
        },
        {
          name: 'It is not a rescue treatment',
          action: 'Keep the reliever inhaler and the written action plan.',
          patientImpact:
            'Section 5.2 states that mepolizumab should not be used to treat acute symptoms or acute exacerbations of asthma or COPD, and must not be used for acute bronchospasm or status asthmaticus. A monthly injection does nothing in the minutes when an airway is closing.',
          clinicalPrecaution:
            'The label directs patients to seek medical advice if asthma or COPD remains uncontrolled or worsens after starting treatment.',
        },
        {
          name: 'Mention shingles and any history of parasitic infection',
          action:
            'Ask about varicella vaccination before starting, and say if you have lived in or travelled to an area where worm infections are common.',
          patientImpact:
            'Section 5.3 records that herpes zoster occurred in subjects receiving mepolizumab 100 mg in controlled trials and directs that vaccination be considered where medically appropriate. Section 5.5 notes that eosinophils are involved in the immune response to some helminths, that patients with known parasitic infection were excluded from the trials, and that pre-existing infections should be treated before therapy.',
          clinicalPrecaution:
            'If a helminth infection occurs during treatment and does not respond to anti-helminth therapy, the label directs discontinuing mepolizumab until the parasitic infection resolves.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Humanised IgG1 kappa monoclonal antibody produced by recombinant DNA technology in Chinese hamster ovary cells',
      molecularWeight: 'Approximately 149 kDa',
      targetReceptorAffinity:
        'Binds interleukin-5 with a dissociation constant of 100 pM, blocking IL-5 from binding the alpha chain of the IL-5 receptor complex on the eosinophil surface. This is cytokine sequestration, not receptor blockade: the eosinophil itself is untouched and dies of a missing survival signal rather than of anything the antibody does to it.',
      structureSource: {
        label:
          'NUCALA (mepolizumab) United States prescribing information, Description section 11 and Clinical Pharmacology section 12.1 (BLA 125526)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22NUCALA%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'mep-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Verify the humanised framework and the IgG1 subclass before scale-up',
          description:
            'Mepolizumab is a murine anti-IL-5 antibody grafted onto a human IgG1 kappa framework. The subclass matters for what the molecule does not do: an IgG1 Fc can recruit effector function, and this antibody is meant to neutralise a soluble cytokine rather than kill a cell. Confirm the sequence and the glycan profile in the master cell bank before any production run.',
          reagentsAndBuffer:
            'Next-generation sequencing of the integrated heavy and light chain constructs, intact mass and peptide mapping by LC-MS, released N-glycan analysis by hydrophilic interaction chromatography',
        },
        {
          id: 'mep-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch expression in Chinese hamster ovary cells',
          description:
            'The label states the antibody is produced by recombinant DNA technology in Chinese hamster ovary cells. A fed-batch run with controlled feeds holds the charge and glycan distribution inside specification across a campaign, which is the practical difference between a biologic and a small molecule: the process is part of the definition of the product.',
          dependsOnStepId: 'mep-w1',
          reagentsAndBuffer:
            'Chemically defined CHO medium, glucose and amino acid feeds, controlled pH, dissolved oxygen and temperature shift, antifoam',
        },
        {
          id: 'mep-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture, low-pH viral inactivation and polishing',
          description:
            'Affinity capture on Protein A, a validated low-pH hold for enveloped virus inactivation, then ion exchange polishing to remove aggregate, host cell protein and residual DNA. Aggregate is the specification that matters most here because aggregated IgG is the form most associated with the hypersensitivity reactions section 5.1 of the label describes.',
          dependsOnStepId: 'mep-w2',
          reagentsAndBuffer:
            'Protein A resin, acetate elution near pH 3.5 with Tris neutralisation, anion and cation exchange steps, nanofiltration, tangential flow filtration into the final buffer',
        },
        {
          id: 'mep-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm neutralisation of IL-5 signalling on a receptor-bearing cell',
          description:
            'The binding assay says the antibody holds interleukin-5. The delivery question is whether it holds it tightly enough, at the concentrations a subcutaneous dose produces, to stop the cytokine reaching a receptor that is already present on the target cell. A cell-based assay answers that and a plate binding assay does not.',
          dependsOnStepId: 'mep-w3',
          reagentsAndBuffer:
            'TF-1 or comparable IL-5-dependent cell line expressing IL5RA and CSF2RB, recombinant human IL-5 titrated across the physiological range, viability or proliferation readout, mepolizumab reference standard',
        },
        {
          id: 'mep-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure the eosinophil count, and record that it is a surrogate',
          description:
            'Blood eosinophil count is the pharmacodynamic readout for every trial and every dose-finding study of this molecule. The label reports geometric mean reductions from baseline at day 84 of 64%, 78%, 84% and 90% across the dose range. It is a surrogate: mepolizumab depleted blood and sputum eosinophils in unselected asthma in 2007 and changed no clinical endpoint, so this number must never be reported as if it were the clinical result.',
          dependsOnStepId: 'mep-w4',
          reagentsAndBuffer:
            'Automated differential haematology analyser with manual confirmation, induced sputum differential cell counts where airway eosinophils are the question, paired baseline and on-treatment sampling',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mep-a1',
        category: 'conclusion_shift',
        title: 'The same antibody failed in 2007 and succeeded in 2012 — the patients changed',
        laymanSummary:
          'In 362 people with ordinary persistent asthma, mepolizumab stripped eosinophils out of blood and sputum and improved nothing a patient would notice. Five years later, given to people selected for eosinophilic inflammation and repeated attacks, it cut attacks by about half. The drug was identical. The entry criteria were not.',
        technicalDetails:
          'Flood-Page et al. randomised 362 patients with persistent symptoms on 400 to 1,000 micrograms of beclomethasone or equivalent to intravenous mepolizumab 250 mg, 750 mg, or placebo monthly. Blood and sputum eosinophils fell significantly at both doses (blood p<0.001 for both, sputum p=0.006 and p=0.004). Morning peak flow, FEV1, beta-2 agonist use, symptom scores, exacerbation rates and quality of life showed no statistically significant change on any measure, with a non-significant trend for exacerbations at 750 mg (p=0.065). The authors concluded that further studies should use protocols specifically tailored to asthma with persistent airway eosinophilia. DREAM then enrolled on a history of recurrent severe exacerbations plus signs of eosinophilic inflammation and reported a 48% exacerbation reduction at 75 mg — one tenth of the dose that had failed. This is the cleanest illustration in the biologics era that a pharmacodynamic effect and a clinical effect are separate claims requiring separate evidence.',
        evidenceSource:
          'Flood-Page P et al., Am J Respir Crit Care Med 2007;176:1062-1071; Pavord ID et al., Lancet 2012;380:651-659 (DREAM)',
        doi: '10.1164/rccm.200701-085OC',
        measuredMetric:
          'Clinical endpoints in unselected asthma against clinical endpoints in biomarker-selected asthma, at the same and lower doses of the same antibody',
        auditFlag: 'verified',
      },
      {
        id: 'mep-a2',
        category: 'measured',
        title: 'MENSA: exacerbations down 53%, in 576 selected patients',
        laymanSummary:
          'The pivotal asthma trial randomised 576 people who kept having attacks despite high-dose inhalers and who had evidence of eosinophilic inflammation. Attacks fell by about half, and emergency visits and admissions fell by 61% in the injected group.',
        technicalDetails:
          'MENSA was a randomised, double-blind, double-dummy trial assigning 576 patients to mepolizumab 75 mg intravenously, mepolizumab 100 mg subcutaneously, or placebo every 4 weeks for 32 weeks. The exacerbation rate fell 47% (95% CI 29 to 61) with the intravenous dose and 53% (95% CI 37 to 65) with the subcutaneous dose, p<0.001 for both. Exacerbations requiring an emergency department visit or hospitalisation fell 32% and 61% respectively. The subcutaneous 100 mg arm became the marketed dose. This result has been reproduced in design and direction by DREAM before it and by the COPD and nasal polyp programmes after it, and it is the number the drug is prescribed on.',
        evidenceSource: 'Ortega HG et al., N Engl J Med 2014;371:1198-1207 (MENSA), NCT01691521',
        doi: '10.1056/NEJMoa1403290',
        measuredMetric:
          'Annualised rate of clinically significant asthma exacerbations at 32 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'mep-a3',
        category: 'inferred',
        title: 'The symptom score improved less than the same paper says is worth noticing',
        laymanSummary:
          'MENSA reported that asthma control improved by 0.44 points on a five-item questionnaire. In the same sentence, the paper states that the smallest change a patient can perceive on that questionnaire is 0.5 points. The improvement was statistically significant and below the trial’s own threshold for mattering.',
        technicalDetails:
          'MENSA reported ACQ-5 improvement of 0.42 points (intravenous) and 0.44 points (subcutaneous) greater than placebo, with the minimal clinically important change stated in the results as 0.5 points, all at p<0.001. The St George’s Respiratory Questionnaire did clear its threshold: 6.4 and 7.0 points against a minimal clinically important change of 4. FEV1 rose 100 mL and 98 mL more than placebo (p=0.02 and p=0.03), against a commonly cited minimal important difference of around 100 mL and a class expectation far higher. So of the three secondary measures, one cleared its own bar comfortably, one sat exactly on it, and one fell short of it while remaining statistically significant. Marketing and guideline summaries routinely report all three as improvements without the thresholds attached.',
        evidenceSource: 'Ortega HG et al., N Engl J Med 2014;371:1198-1207 (MENSA)',
        doi: '10.1056/NEJMoa1403290',
        inferredClaim:
          'That mepolizumab improves day-to-day asthma symptoms by an amount a patient can feel — a statistically significant 0.44-point ACQ-5 difference presented without the 0.5-point minimal important change the same paper reports',
        auditFlag: 'caution',
      },
      {
        id: 'mep-a4',
        category: 'failed',
        title: 'In COPD without the biomarker, nothing happened at all',
        laymanSummary:
          'The first COPD trial enrolled everyone and then looked at the eosinophilic subgroup. In the subgroup, attacks fell 18%. In the whole trial population, the rate ratio was 0.98 and the adjusted p value was above 0.99 — as close to no effect as a number can be.',
        technicalDetails:
          'METREX randomised patients with COPD and a history of exacerbations on triple inhaled therapy. In the 462-patient modified intention-to-treat population with an eosinophilic phenotype, the mean annual rate of moderate or severe exacerbations was 1.40 against 1.71 (rate ratio 0.82, 95% CI 0.68 to 0.98, adjusted p=0.04). In the overall 836-patient modified intention-to-treat population, the rate ratio was 0.98 (95% CI 0.85 to 1.12, adjusted p>0.99). Its companion trial METREO, which enrolled only eosinophil-selected patients, missed on both doses after multiplicity adjustment: rate ratio 0.80 (95% CI 0.65 to 0.98, adjusted p=0.07) at 100 mg and 0.86 (95% CI 0.70 to 1.05, adjusted p=0.14) at 300 mg. A COPD indication did not follow from these trials. It followed from MATINEE, run seven years later with a blood eosinophil entry threshold of at least 300 cells per microlitre.',
        evidenceSource:
          'Pavord ID et al., N Engl J Med 2017;377:1613-1629 (METREX and METREO), NCT02105948 and NCT02105961',
        doi: '10.1056/NEJMoa1708208',
        measuredMetric:
          'Annual rate of moderate or severe COPD exacerbations, biomarker-selected population against unselected population',
        auditFlag: 'caution',
      },
      {
        id: 'mep-a5',
        category: 'failed',
        title: 'MATINEE met its primary endpoint and then the testing hierarchy stopped',
        laymanSummary:
          'The COPD trial that won the indication reduced attacks from 1.01 to 0.80 a year. The next endpoints in the queue — how patients felt and how they scored their symptoms — showed no significant difference, and under the trial’s own rules that halted every test after it.',
        technicalDetails:
          'MATINEE randomised 804 patients with COPD, an exacerbation history and a blood eosinophil count of at least 300 cells per microlitre on triple inhaled therapy, 403 to mepolizumab 100 mg and 401 to placebo subcutaneously every 4 weeks for 52 to 104 weeks. The annualised rate of moderate or severe exacerbations was 0.80 against 1.01 (rate ratio 0.79, 95% CI 0.66 to 0.94, p=0.01), and Kaplan-Meier median time to first exacerbation was 419 against 321 days (hazard ratio 0.77, 95% CI 0.64 to 0.93, p=0.009). The published report then states plainly that between-group differences in measures of health-related quality of life and symptoms were not significant, and that consequently no statistical inferences were made about any subsequent secondary endpoint in the hierarchy. The exacerbation reduction is real. Every claim about how patients felt on this drug in COPD is formally untested by this trial.',
        evidenceSource: 'Sciurba FC et al., N Engl J Med 2025 (MATINEE), NCT04133909',
        doi: '10.1056/NEJMoa2413181',
        measuredMetric:
          'Annualised rate of moderate or severe COPD exacerbations, and the point at which the hierarchical testing sequence terminated',
        auditFlag: 'caution',
      },
      {
        id: 'mep-a6',
        category: 'failed',
        title:
          'In vasculitis, the trial succeeded and most patients still did not go into remission',
        laymanSummary:
          'In eosinophilic granulomatosis with polyangiitis, mepolizumab produced far more remission than placebo on every measure, and the paper closes by noting that only about half the treated patients reached the trial’s definition of remission at all.',
        technicalDetails:
          'MIRRA randomised 136 participants with relapsing or refractory eosinophilic granulomatosis with polyangiitis, 68 to mepolizumab 300 mg and 68 to placebo every 4 weeks for 52 weeks on top of standard care. Both primary endpoints were met: 28% against 3% accrued at least 24 weeks of remission (odds ratio 5.91, 95% CI 2.68 to 13.03, p<0.001), and 32% against 3% were in remission at both week 36 and week 48 (odds ratio 16.74, 95% CI 3.61 to 77.56, p<0.001). The annualised relapse rate was 1.14 against 2.27 (rate ratio 0.50, 95% CI 0.36 to 0.70, p<0.001). Remission did not occur at all in 47% of the mepolizumab group against 81% of placebo, and the published conclusion states explicitly that only approximately half the treated participants achieved protocol-defined remission. A large odds ratio computed against a 3% placebo rate is not the same claim as a high absolute success rate, and here the two diverge sharply.',
        evidenceSource: 'Wechsler ME et al., N Engl J Med 2017;376:1921-1932 (MIRRA), NCT02020889',
        doi: '10.1056/NEJMoa1702079',
        measuredMetric:
          'Proportion achieving protocol-defined remission, absolute and relative to placebo',
        auditFlag: 'caution',
      },
      {
        id: 'mep-a7',
        category: 'inferred',
        title: 'The label does not claim to know why the drug works',
        laymanSummary:
          'Every explanation of mepolizumab starts with eosinophils. The prescribing information describes the eosinophil depletion in detail and then states that the mechanism of action in asthma, nasal polyps, COPD, vasculitis and hypereosinophilic syndrome has not been definitively established.',
        technicalDetails:
          'Section 12.1 of the NUCALA label sets out that mepolizumab binds IL-5 with a dissociation constant of 100 pM and reduces the production and survival of eosinophils, and then adds: "however, the mechanism of mepolizumab action in asthma, CRSwNP, COPD, EGPA, and HES has not been definitively established." It also lists the many other cell types and mediators involved in inflammation. The distinction is not academic. Flood-Page showed eosinophil depletion without clinical benefit, and dupilumab produces clinical benefit in the same diseases while transiently raising blood eosinophils. Eosinophil count is a reliable predictor of who responds. That it is the causal step through which the benefit arrives remains an inference the regulator declines to endorse.',
        evidenceSource:
          'NUCALA (mepolizumab) United States prescribing information, Clinical Pharmacology section 12.1 (BLA 125526)',
        inferredClaim:
          'That reducing eosinophil numbers is the mechanism by which mepolizumab prevents exacerbations — the universal explanatory account, stated as unestablished in the drug’s own label',
        auditFlag: 'contested',
      },
      {
        id: 'mep-a8',
        category: 'inferred',
        title: 'An independent economic review put the whole class at least 50% above value',
        laymanSummary:
          'The Institute for Clinical and Economic Review assessed all five severe-asthma biologics in 2018 and concluded that they modestly reduce attacks and improve quality of life, but that prices across the entire class would need to fall by at least half to reach standard cost-effectiveness thresholds.',
        technicalDetails:
          'ICER’s final evidence report of 20 December 2018 covered dupilumab, omalizumab, mepolizumab, reslizumab and benralizumab. Its stated conclusion was that all five modestly reduce asthma exacerbations and improve daily quality of life, but that net prices appeared far out of alignment with those incremental clinical benefits, and that the entire therapy class would need price discounts of at least 50% to reach commonly cited cost-effectiveness thresholds. This is an economic judgement built on the same trial data audited above, and it depends on assumptions about net price that manufacturers do not publish. It is recorded here because the clinical claim and the value claim are separate, and only the clinical one appears in prescribing material.',
        evidenceSource:
          'Institute for Clinical and Economic Review, Biologic Therapies for Treatment of Asthma Associated with Type 2 Inflammation, Final Evidence Report, 20 December 2018',
        inferredClaim:
          'That the measured exacerbation reduction justifies the price charged for it — an inference an independent review rejected for all five drugs in the class at once',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An injection under the skin, once a month',
        laymanDesc:
          'The antibody is far too large to survive being swallowed, so it goes in under the skin and seeps slowly into the bloodstream over days. One dose lasts about a month.',
        molecularDetail:
          'A humanised IgG1 kappa antibody of approximately 149 kDa produced in Chinese hamster ovary cells, supplied as a lyophilised powder for reconstitution or as a prefilled syringe or autoinjector delivering 100 mg in 1 mL, and a 40 mg in 0.4 mL syringe for younger children. Subcutaneous absorption is slow and the interval between doses in every pivotal trial was 4 weeks.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It catches the messenger, not the cell',
        laymanDesc:
          'Mepolizumab does not attach to the eosinophil at all. It grabs interleukin-5, the messenger that eosinophils depend on, and holds it in the bloodstream where it can do nothing.',
        molecularDetail:
          'Binding to free IL-5 with a dissociation constant of 100 pM, preventing IL-5 from engaging the alpha chain of the IL-5 receptor complex on the eosinophil surface. This is neutralisation of a soluble ligand rather than receptor antagonism, and it is the structural difference from benralizumab, which binds the receptor itself and recruits natural killer cells to destroy the eosinophil.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The eosinophil never gets its survival signal',
        laymanDesc:
          'Eosinophils depend on that one messenger to be made in the marrow, to be called into the airway, and to stay alive once they arrive. Cut the signal and fewer are produced and the ones present die on schedule.',
        molecularDetail:
          'IL-5 is the dominant cytokine for eosinophil growth, differentiation, recruitment, activation and survival. Blocking IL-5 receptor engagement removes the anti-apoptotic signal maintaining eosinophils in tissue and reduces marrow output, without depleting the cell directly — which is why reduction is partial rather than near-complete.',
        iconName: 'CircleSlash',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Blood eosinophils fall within days and stay down',
        laymanDesc:
          'The count starts dropping 48 hours after the first dose and settles at a fraction of where it began, in a way that tracks the dose given.',
        molecularDetail:
          'The label reports a dose-dependent reduction detectable by day 3. At day 84, geometric mean reductions from baseline were 64%, 78%, 84% and 90% for 12.5 mg subcutaneous, 75 mg intravenous, 125 mg subcutaneous and 250 mg subcutaneous respectively. Modelled subcutaneous doses giving 50% and 90% of maximal reduction were 11 mg and 99 mg, which is how the 100 mg dose was chosen.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In the right patients, attacks roughly halve',
        laymanDesc:
          'Among people picked for a high eosinophil count and a history of repeated attacks, courses of oral steroids, emergency visits and admissions fall by about half.',
        molecularDetail:
          'MENSA: exacerbations reduced 53% with 100 mg subcutaneously (95% CI 37 to 65, p<0.001) and 47% intravenously, with emergency department visits or hospitalisations down 61% and 32% respectively. DREAM: 2.40 exacerbations per patient-year on placebo against 1.24 at 75 mg (48% reduction, p<0.0001). MATINEE in eosinophilic COPD: 0.80 against 1.01 per year (rate ratio 0.79, p=0.01).',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What barely moves',
        laymanDesc:
          'Lung function rises by about a tenth of a litre. The five-item asthma control score improves by less than the amount the trial itself calls the smallest difference a patient can notice.',
        molecularDetail:
          'MENSA FEV1: +100 mL intravenous (p=0.02) and +98 mL subcutaneous (p=0.03) against placebo at week 32. ACQ-5: 0.42 and 0.44 points better than placebo against a stated minimal clinically important change of 0.5. SGRQ: 6.4 and 7.0 points better against a minimal clinically important change of 4. In MATINEE, health-related quality of life and symptom measures were not significantly different at all, which terminated the hierarchical testing sequence.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MENSA (NCT01691521)',
        phase: 'Phase 3, randomised, double-blind, double-dummy, placebo-controlled',
        sampleSize: 576,
        primaryEndpoint:
          'Rate of clinically significant asthma exacerbations over 32 weeks in severe asthma with evidence of eosinophilic inflammation',
        endpointMet: true,
        statisticalPValue:
          '53% reduction with 100 mg subcutaneously (95% CI 37 to 65) and 47% with 75 mg intravenously (95% CI 29 to 61), p<0.001 for both',
        unreportedAdverseSignals:
          'FEV1 rose only 98 to 100 mL more than placebo, and the ACQ-5 improvement of 0.42 to 0.44 points fell below the 0.5-point minimal clinically important change the paper itself states.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DREAM (NCT01000506)',
        phase: 'Phase 2b/3, randomised, double-blind, placebo-controlled, dose-ranging',
        sampleSize: 621,
        primaryEndpoint:
          'Rate of clinically significant asthma exacerbations over 13 four-weekly infusions',
        endpointMet: true,
        statisticalPValue:
          '2.40 per patient-year on placebo against 1.24 at 75 mg (48% reduction, 95% CI 31 to 61, p<0.0001), 1.46 at 250 mg (39% reduction, p=0.0005) and 1.15 at 750 mg (52% reduction, p<0.0001)',
        unreportedAdverseSignals:
          'There was no dose-response across a tenfold dose range — 75 mg performed as well as 750 mg. Three patients died during the study, deaths not deemed treatment-related.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SIRIUS (NCT01691508)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 135,
        primaryEndpoint:
          'Degree of reduction in daily oral glucocorticoid dose over weeks 20 to 24, by ordered category',
        endpointMet: true,
        statisticalPValue:
          'Odds of a reduction in glucocorticoid-dose stratum 2.39 times greater (95% CI 1.25 to 4.56, p=0.008); median reduction 50% against none on placebo (p=0.007)',
        unreportedAdverseSignals:
          'Exacerbations still fell 32% (1.44 against 2.12 per year, p=0.04) despite the steroid reduction, and the ACQ-5 difference of 0.52 points sat barely above the 0.5-point minimal clinically important difference in a trial of only 135 patients.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'METREX and METREO (NCT02105948, NCT02105961)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, parallel-group',
        sampleSize: 1510,
        primaryEndpoint:
          'Annual rate of moderate or severe COPD exacerbations over 52 weeks on triple inhaled maintenance therapy',
        endpointMet: false,
        statisticalPValue:
          'METREX eosinophilic population rate ratio 0.82 (95% CI 0.68 to 0.98, adjusted p=0.04); METREX overall population rate ratio 0.98 (95% CI 0.85 to 1.12, adjusted p>0.99); METREO rate ratios 0.80 (adjusted p=0.07) and 0.86 (adjusted p=0.14)',
        unreportedAdverseSignals:
          'The confirmatory biomarker-selected trial METREO missed at both doses after multiplicity adjustment, and no COPD indication followed from this programme.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'MATINEE (NCT04133909)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 804,
        primaryEndpoint:
          'Annualised rate of moderate or severe COPD exacerbations in patients with blood eosinophils of at least 300 cells per microlitre on triple inhaled therapy',
        endpointMet: true,
        statisticalPValue:
          '0.80 against 1.01 events per year, rate ratio 0.79 (95% CI 0.66 to 0.94), p=0.01, over 52 to 104 weeks',
        unreportedAdverseSignals:
          'Health-related quality of life and symptom measures showed no significant between-group difference, and under the pre-specified hierarchy no statistical inference was drawn about any subsequent secondary endpoint.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'MIRRA (NCT02020889)',
        phase: 'Phase 3, randomised, double-blind, parallel-group',
        sampleSize: 136,
        primaryEndpoint:
          'Accrued weeks of remission over 52 weeks, and remission at both week 36 and week 48, in relapsing or refractory eosinophilic granulomatosis with polyangiitis',
        endpointMet: true,
        statisticalPValue:
          '28% against 3% with at least 24 accrued weeks of remission (OR 5.91, 95% CI 2.68 to 13.03, p<0.001); 32% against 3% in remission at weeks 36 and 48 (OR 16.74, 95% CI 3.61 to 77.56, p<0.001)',
        unreportedAdverseSignals:
          'Remission did not occur at all in 47% of the mepolizumab group, and the published conclusion states that only about half the treated participants reached protocol-defined remission.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SYNAPSE (NCT03085797)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, parallel-group',
        sampleSize: 407,
        primaryEndpoint:
          'Change from baseline in total endoscopic nasal polyp score at week 52 and mean nasal obstruction visual analogue scale score during weeks 49 to 52',
        endpointMet: true,
        statisticalPValue:
          'Adjusted difference in medians for polyp score -0.73 (95% CI -1.11 to -0.34, p<0.0001); nasal obstruction VAS -3.14 (95% CI -4.09 to -2.18, p<0.0001)',
        unreportedAdverseSignals:
          'Both co-primary endpoints are subjective or endoscopic scores rather than a hard outcome. Treatment-related adverse events were reported in 15% on mepolizumab against 9% on placebo.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Asthma exacerbations reduced 53% with 100 mg subcutaneously in 576 biomarker-selected patients (MENSA, 95% CI 37 to 65, p<0.001)',
        'Exacerbations reduced 48% at 75 mg in 621 patients with no dose-response across a tenfold range (DREAM, p<0.0001)',
        'Median 50% reduction in daily oral glucocorticoid dose against no reduction on placebo in 135 steroid-dependent patients (SIRIUS, p=0.007)',
        'COPD exacerbations 0.80 against 1.01 per year in 804 patients with eosinophils of at least 300 cells per microlitre (MATINEE, rate ratio 0.79, p=0.01)',
        'Blood eosinophil reduction of 64% to 90% from baseline at day 84 across the dose range, detectable by day 3',
      ],
      unsupportedInferences: [
        'That eosinophil depletion is the mechanism of clinical benefit — the label states the mechanism of action in all five indications has not been definitively established',
        'That the drug meaningfully improves day-to-day symptoms, when the MENSA ACQ-5 difference of 0.44 points sits below the 0.5-point minimal important change the same paper reports',
        'That the exacerbation benefit extends to asthma or COPD without eosinophilic inflammation, which the 2007 trial and the METREX overall population both directly contradict',
        'That the price is aligned with the benefit, which an independent 2018 economic review rejected for the entire biologic class at once',
      ],
      whatFailedInitially: [
        'Mepolizumab changed no clinical endpoint in 362 patients with unselected persistent asthma in 2007, despite significant blood and sputum eosinophil depletion',
        'METREX found a rate ratio of 0.98 with adjusted p>0.99 in the unselected COPD population',
        'METREO, the biomarker-selected confirmatory COPD trial, missed at both 100 mg (adjusted p=0.07) and 300 mg (adjusted p=0.14)',
        'MATINEE’s health-related quality of life and symptom endpoints were not significant, terminating its own hierarchical testing sequence',
        'In MIRRA, 47% of treated participants never achieved remission',
      ],
      realWorldOutcome: [
        'Approved in the United States on 4 November 2015 under BLA 125526, the first anti-IL-5 antibody licensed anywhere',
        'Indications have since accumulated across asthma, nasal polyps, eosinophilic granulomatosis with polyangiitis, hypereosinophilic syndrome and eosinophilic COPD — every one of them gated on an eosinophil count or an eosinophilic phenotype',
        'No CMS National Average Drug Acquisition Cost figure is published, because the drug moves through specialty channels the retail pharmacy survey does not cover',
        'The 2007 failure is now taught as the founding example of biomarker-stratified enrolment in respiratory medicine',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection every 4 weeks — 100 mg for asthma, nasal polyps and COPD, 300 mg for the two eosinophilic disorders, with a 40 mg presentation for children aged 6 to 11',
      description:
        'Supplied as a lyophilised powder in a single-dose vial for reconstitution, and as prefilled syringes and autoinjectors. A 149 kDa antibody cannot be swallowed and is not filtered by the kidney, so clearance is by proteolytic catabolism and the dosing interval is set by that slow elimination rather than by any daily rhythm of the disease.',
      safetyProfile:
        'Contraindicated in patients with known hypersensitivity to mepolizumab or its excipients. Hypersensitivity reactions including anaphylaxis, angioedema, bronchospasm, hypotension, urticaria and rash have occurred, generally within hours but sometimes days later, and the label directs discontinuation. Herpes zoster occurred in trial subjects and vaccination should be considered where appropriate. Systemic or inhaled corticosteroids must not be stopped abruptly on starting treatment. Pre-existing helminth infection should be treated before therapy begins. In MENSA and SIRIUS the adverse reactions occurring in at least 3% of patients and more often than placebo were headache (19% against 18%), injection site reaction (8% against 3%), back pain (5% against 4%), fatigue (5% against 4%) and influenza (3%). It must not be used for acute bronchospasm or status asthmaticus.',
    },
    commonQuestions: [
      {
        q: 'Why does my eosinophil count decide whether I can have this drug?',
        a: 'Because the drug was tried without that filter and did nothing. In 2007, 362 people with persistent asthma symptoms on inhaled steroids were given mepolizumab or placebo. Their blood and sputum eosinophils fell significantly. Their peak flow, lung function, reliever use, symptom scores, exacerbation rates and quality of life did not change on any measure. When later trials enrolled only people with a history of repeated attacks and evidence of eosinophilic inflammation, the same antibody at a tenth of the dose cut attacks roughly in half. The count is not bureaucracy. It is the difference between a drug that works and a drug that does not.',
        auditNote:
          'This is why the eosinophil threshold appears in the indication itself rather than in a guideline. The regulator wrote the entry criterion of the successful trials into the label.',
      },
      {
        q: 'Will it make my breathing tests better?',
        a: 'Barely, and you should know that before you start. In the pivotal MENSA trial, FEV1 — the volume you can blow out in one second — improved by 98 mL more than placebo after 32 weeks. That is about a tenth of a litre, on a measurement that is typically several litres. The asthma control questionnaire improved by 0.44 points, and the paper reporting it states in the same paragraph that the smallest change a patient can perceive on that questionnaire is 0.5 points. What did change substantially was the number of attacks: courses of oral steroids, emergency visits and admissions. If your problem is attacks, this drug is aimed at your problem. If your problem is being breathless every day, it may not be.',
        auditNote:
          'Both numbers come from the same trial and the same table. Reporting the exacerbation result without the lung function result is the commonest way this drug is oversold.',
      },
      {
        q: 'Can I stop my inhalers or my steroid tablets once the injections start?',
        a: 'Not on your own. The label is explicit that systemic and inhaled corticosteroids must not be stopped abruptly when mepolizumab begins, and that any reduction should be gradual and supervised by a physician. Mepolizumab was studied as an addition to those treatments in every pivotal trial and never as a substitute for them. There is one trial specifically about steroid reduction — SIRIUS — and it randomised 135 steroid-dependent patients to a structured, supervised taper: the median daily dose halved on mepolizumab against no reduction on placebo, and attacks still fell 32%. Note the word supervised. Reducing steroids can cause withdrawal symptoms and can unmask conditions the steroid was suppressing.',
      },
      {
        q: 'How is this different from Fasenra or Dupixent?',
        a: 'Mepolizumab catches the messenger. Benralizumab (Fasenra) binds the receptor on the eosinophil and recruits natural killer cells to destroy the cell outright, which is why it depletes eosinophils almost completely rather than partially. Dupilumab (Dupixent) blocks a different pair of messengers entirely and produces a larger lung function change while transiently raising eosinophil counts. On the endpoint all three are licensed for — exacerbation rate — the published reductions are of similar size, and no randomised head-to-head trial has shown one to be better than another. The choice is made on which biomarker you have, how often you want to inject, and what your insurer covers, not on demonstrated superiority.',
        auditNote:
          'Cross-trial comparison is not evidence of equivalence either. Different populations, different placebo rates, different definitions of an exacerbation.',
      },
      {
        q: 'Is it worth what it costs?',
        a: 'An independent review said no, at 2018 prices. The Institute for Clinical and Economic Review assessed all five severe-asthma biologics and concluded that they modestly reduce exacerbations and improve quality of life, but that net prices appeared far out of alignment with those benefits, and that the whole class would need discounts of at least 50% to reach commonly cited cost-effectiveness thresholds. That analysis rests on assumptions about net price that manufacturers do not disclose, so it is a judgement rather than a measurement. It is included here because the clinical question and the price question have different answers, and only the clinical one appears in the prescribing information.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ortega HG, Liu MC, Pavord ID, et al. Mepolizumab treatment in patients with severe eosinophilic asthma (MENSA). N Engl J Med 2014;371:1198-1207',
        identifier: '10.1056/NEJMoa1403290',
        kind: 'doi',
      },
      {
        label:
          'Pavord ID, Korn S, Howarth P, et al. Mepolizumab for severe eosinophilic asthma (DREAM): a multicentre, double-blind, placebo-controlled trial. Lancet 2012;380:651-659',
        identifier: '10.1016/S0140-6736(12)60988-X',
        kind: 'doi',
      },
      {
        label:
          'Bel EH, Wenzel SE, Thompson PJ, et al. Oral glucocorticoid-sparing effect of mepolizumab in eosinophilic asthma (SIRIUS). N Engl J Med 2014;371:1189-1197',
        identifier: '10.1056/NEJMoa1403291',
        kind: 'doi',
      },
      {
        label:
          'Flood-Page P, Swenson C, Faiferman I, et al. A study to evaluate safety and efficacy of mepolizumab in patients with moderate persistent asthma. Am J Respir Crit Care Med 2007;176:1062-1071',
        identifier: '10.1164/rccm.200701-085OC',
        kind: 'doi',
      },
      {
        label:
          'Pavord ID, Chanez P, Criner GJ, et al. Mepolizumab for eosinophilic chronic obstructive pulmonary disease (METREX and METREO). N Engl J Med 2017;377:1613-1629',
        identifier: '10.1056/NEJMoa1708208',
        kind: 'doi',
      },
      {
        label:
          'Sciurba FC, Criner GJ, Christenson SA, et al. Mepolizumab to prevent exacerbations of COPD with an eosinophilic phenotype (MATINEE). N Engl J Med 2025',
        identifier: '10.1056/NEJMoa2413181',
        kind: 'doi',
      },
      {
        label:
          'Wechsler ME, Akuthota P, Jayne D, et al. Mepolizumab or placebo for eosinophilic granulomatosis with polyangiitis (MIRRA). N Engl J Med 2017;376:1921-1932',
        identifier: '10.1056/NEJMoa1702079',
        kind: 'doi',
      },
      {
        label:
          'Han JK, Bachert C, Fokkens W, et al. Mepolizumab for chronic rhinosinusitis with nasal polyps (SYNAPSE): a randomised, double-blind, placebo-controlled, phase 3 trial. Lancet Respir Med 2021;9:1141-1153',
        identifier: '10.1016/S2213-2600(21)00097-7',
        kind: 'doi',
      },
      {
        label: 'MENSA — mepolizumab in severe eosinophilic asthma, ClinicalTrials.gov record',
        identifier: 'NCT01691521',
        kind: 'nct',
      },
      {
        label: 'MATINEE — mepolizumab in COPD with an eosinophilic phenotype',
        identifier: 'NCT04133909',
        kind: 'nct',
      },
      {
        label:
          'NUCALA (mepolizumab) United States prescribing information — Indications 1.1 to 1.5, Warnings and Precautions 5.1 to 5.5, Adverse Reactions 6.1, Description 11, Clinical Pharmacology 12.1 and 12.2 (BLA 125526)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22NUCALA%22',
        kind: 'regulatory',
      },
      {
        label:
          'Institute for Clinical and Economic Review. Biologic Therapies for Treatment of Asthma Associated with Type 2 Inflammation: Effectiveness, Value, and Value-Based Price Benchmarks. Final Evidence Report, 20 December 2018',
        identifier: 'https://icer.org/assessment/asthma-2018/',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Benralizumab — engineered to destroy the eosinophil outright rather than starve it, and it
  //    does: blood counts fall to a median of zero. Put head to head against the antibody that only
  //    halves them, it was noninferior and not superior. Three COPD trials found nothing at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'benralizumab',
    name: 'Benralizumab',
    tradeName: 'Fasenra',
    sponsor: 'AstraZeneca AB (BLA 761070); originated at Kyowa Hakko Kirin',
    targetGene: 'IL5RA',
    targetProtein:
      'Alpha subunit of the human interleukin-5 receptor (IL-5Rα) on eosinophils and basophils, bound with a dissociation constant of 11 pM — and, through an Fc domain stripped of fucose, the FcγRIII receptor on natural killer cells at 45.5 nM',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Add-on maintenance treatment of adult and paediatric patients aged 6 years and older with severe asthma and an eosinophilic phenotype; treatment of adults with eosinophilic granulomatosis with polyangiitis; and treatment of patients aged 12 years and older with hypereosinophilic syndrome without an identifiable non-haematologic secondary cause',
    patientFriendlyIndication:
      'Severe asthma driven by a high eosinophil count, and two rarer diseases of the same white blood cell',
    anatomicalSite:
      'The surface of the eosinophil itself, in blood and airway tissue — and the natural killer cell that the antibody’s tail recruits to kill it',
    conditionContext: {
      conditionExplainer:
        'Two antibodies can aim at the same biology from opposite ends. Mepolizumab catches the messenger interleukin-5 before it reaches the eosinophil. Benralizumab ignores the messenger and binds the receiver — the receptor on the eosinophil surface — then uses its own tail to summon a natural killer cell that destroys the eosinophil where it stands.',
      whyItMatters:
        'That design produces the deepest eosinophil depletion any licensed drug achieves: the label records a median absolute blood eosinophil count of zero cells per microlitre within four weeks. Whether depleting further produces better outcomes is a separate question, and one trial has now answered it directly by putting the two antibodies against each other.',
      whoTakesThis:
        'People with severe asthma, already on high-dose inhaled corticosteroids plus a long-acting beta-agonist, who still have attacks and whose blood eosinophil count is raised — and adults with eosinophilic granulomatosis with polyangiitis or hypereosinophilic syndrome. It is an add-on and never a rescue treatment.',
      clinicalGoals:
        'Fewer exacerbations, and in steroid-dependent asthma a lower daily oral steroid dose. The trials are explicit that lung function is not reliably part of the deal: the oral steroid-sparing trial reported no significant effect on FEV1 at all.',
    },
    oneSentenceVerdict:
      'An afucosylated antibody that has natural killer cells destroy the eosinophil rather than starve it, driving blood counts to a median of zero — which cut exacerbations by 51% in SIROCCO (rate ratio 0.49, p<0.0001) but only 28% in its identically designed twin CALIMA (rate ratio 0.72, p=0.0188), produced no significant FEV1 change in the steroid-sparing trial, and reached the primary endpoint in none of three COPD trials at any dose.',
    laymanHowItWorks:
      'Eosinophils carry a receptor that lets them hear one particular growth signal. Benralizumab clamps onto that receptor, and because its tail has been engineered with one sugar removed, it grips the immune system’s natural killer cells unusually tightly and pulls them in. The killer cell then destroys the eosinophil. The effect is not a reduction but near-erasure: within four weeks the median count of these cells in the blood is zero. In people whose asthma attacks are driven by those cells, attacks become less frequent.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    substitutes: {
      summary:
        'Benralizumab is the one asthma biologic with a randomised head-to-head result against another biologic, and the result is the reason to read this section carefully: in eosinophilic granulomatosis with polyangiitis it was noninferior to mepolizumab and explicitly not superior, despite depleting eosinophils roughly twice as far. Deeper depletion is a pharmacodynamic advantage that has not converted into a clinical one.',
      conventionalRx: [
        {
          name: 'Mepolizumab (Nucala)',
          class: 'Anti-interleukin-5 monoclonal antibody, IgG1 kappa',
          howItCompares:
            'The only direct comparison ever run. MANDARA randomised 140 patients with relapsing or refractory eosinophilic granulomatosis with polyangiitis 1:1 to benralizumab 30 mg or mepolizumab 300 mg for 52 weeks. Remission at weeks 36 and 48 was 59% against 56% — a 3 percentage point difference (95% CI -13 to 18), noninferior at a -25 point margin and P=0.73 for superiority. Blood eosinophils fell to 32 per microlitre on benralizumab against 72 on mepolizumab, and it made no difference to the clinical result.',
          typicalCost:
            'Neither molecule has a published CMS National Average Drug Acquisition Cost figure — both move through specialty channels the retail pharmacy survey does not cover',
          prosAndCons:
            'Pros of benralizumab: an every-8-week interval after loading, and 41% against 26% achieved complete oral glucocorticoid withdrawal in MANDARA. Cons: no superiority on the primary endpoint, and three failed COPD trials where mepolizumab has one success.',
        },
        {
          name: 'Dupilumab (Dupixent)',
          class: 'Anti-interleukin-4 receptor alpha monoclonal antibody',
          howItCompares:
            'Blocks interleukin-4 and interleukin-13 rather than the eosinophil pathway, and produces a consistently larger lung function change than either anti-IL-5 antibody. It also succeeded in COPD with an eosinophilic phenotype, an indication in which benralizumab failed three times.',
          typicalCost: 'Specialty biologic, not covered by the CMS retail acquisition cost survey',
          prosAndCons:
            'Pros: larger FEV1 effect, broad type 2 indications, a COPD indication. Cons: transient blood hypereosinophilia in a minority, and no licence in eosinophilic granulomatosis with polyangiitis or hypereosinophilic syndrome.',
        },
        {
          name: 'Oral prednisolone at the time of an attack',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The standard of care benralizumab was tested against directly in the ABRA trial, and lost to. At an acute eosinophilic exacerbation of asthma or COPD, 158 patients were randomised to prednisolone alone, benralizumab alone, or both. Treatment failure at 90 days occurred in 74% of the prednisolone group against 45% of the pooled benralizumab groups (odds ratio 0.26, 95% CI 0.13 to 0.56, p=0.0005).',
          typicalCost: 'Among the cheapest medicines in the world at pharmacy acquisition cost',
          prosAndCons:
            'Pros: instant, universal, effectively free. Cons: ABRA attributed the hyperglycaemia and sinus infection adverse events specifically to the prednisolone arm, and the cumulative harms of repeated courses are what the biologics exist to avoid.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not stop your inhalers or steroid tablets when the injections start',
          action:
            'Continue the inhaled corticosteroid and any oral steroid unless a clinician reduces them deliberately and gradually.',
          patientImpact:
            'Section 5.3 of the label directs that systemic or inhaled corticosteroids must not be discontinued abruptly when benralizumab begins. Every pivotal trial studied it as an addition to high-dose inhaled corticosteroid plus a long-acting beta-agonist, never as a replacement.',
          clinicalPrecaution:
            'Reducing corticosteroid dose may produce systemic withdrawal symptoms or unmask conditions the steroid was suppressing. ZONDA achieved its 75% median dose reduction under a structured, supervised protocol, not by patients stopping on their own.',
        },
        {
          name: 'It does nothing during an attack you are having now',
          action: 'Keep the reliever inhaler and the written action plan.',
          patientImpact:
            'Section 5.2 states that benralizumab should not be used to treat acute asthma symptoms or acute exacerbations, and must not be used for acute bronchospasm or status asthmaticus. The one trial that gave it during an acute exacerbation, ABRA, was a phase 2 study of a single 100 mg dose — a different dose, a different setting, and not what the label authorises.',
          clinicalPrecaution:
            'The label directs patients to seek medical advice if asthma remains uncontrolled or worsens after starting treatment.',
        },
        {
          name: 'Say if you have ever had a worm infection or lived where they are common',
          action: 'Raise any history of helminth infection or relevant travel before starting.',
          patientImpact:
            'Section 5.4 directs that pre-existing helminth infections be treated before therapy begins. Eosinophils participate in the immune response to some parasites, and this drug removes them almost entirely rather than partially.',
          clinicalPrecaution:
            'If infection occurs during treatment and does not respond to anti-helminth therapy, the label directs discontinuing benralizumab until the parasitic infection resolves.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Humanised afucosylated IgG1 kappa monoclonal antibody produced in Chinese hamster ovary cells by recombinant DNA technology',
      molecularWeight: 'Approximately 150 kDa',
      targetReceptorAffinity:
        'Binds the alpha subunit of the human IL-5 receptor with a dissociation constant of 11 pM. The absence of fucose in the Fc domain facilitates binding to FcγRIII on natural killer cells at 45.5 nM in vitro, producing apoptosis of eosinophils and basophils through antibody-dependent cell-mediated cytotoxicity. The label states that despite this, the mechanism of benralizumab action in asthma, eosinophilic granulomatosis with polyangiitis and hypereosinophilic syndrome has not been definitively established.',
      structureSource: {
        label:
          'FASENRA (benralizumab) United States prescribing information, Description section 11 and Clinical Pharmacology sections 12.1 and 12.2 (BLA 761070)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22FASENRA%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'ben-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the fucose is absent, because the mechanism depends on it',
          description:
            'Benralizumab is defined as much by a missing sugar as by its sequence. Core fucosylation of the Fc N-glycan reduces FcγRIIIa affinity by roughly two orders of magnitude, and a lot that has picked up fucose still binds IL-5Rα perfectly while losing most of the cell-killing that is the entire point of the molecule. Glycan analysis is therefore a potency-critical release test, not a characterisation nicety.',
          reagentsAndBuffer:
            'Released N-glycan analysis by hydrophilic interaction chromatography with fluorescence detection, LC-MS peptide mapping across the Fc, a fucosyltransferase-knockout production line as the reference material',
        },
        {
          id: 'ben-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Express in a FUT8-knockout Chinese hamster ovary line',
          description:
            'Afucosylation is achieved at the cell line rather than by chemistry: knocking out the alpha-1,6-fucosyltransferase gene removes the enzyme that would attach core fucose. The consequence is that the production host is part of the drug substance definition, and a change of cell line is a change of product.',
          dependsOnStepId: 'ben-w1',
          reagentsAndBuffer:
            'FUT8-knockout CHO host, chemically defined medium, fed-batch glucose and amino acid feeds, controlled pH, dissolved oxygen and temperature shift',
        },
        {
          id: 'ben-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture, viral inactivation and a tight aggregate specification',
          description:
            'Affinity capture, low-pH viral inactivation hold, then polishing into a histidine and trehalose formulation at pH 5.5 to 6.5. Aggregate control matters more than usual for an Fc-engineered antibody: aggregated IgG cross-links Fc receptors non-specifically, which is both a hypersensitivity risk and a source of false potency in the cell-killing assay.',
          dependsOnStepId: 'ben-w2',
          reagentsAndBuffer:
            'Protein A resin, low-pH elution with Tris neutralisation, ion exchange polishing, nanofiltration, tangential flow filtration into L-histidine, L-histidine hydrochloride monohydrate, polysorbate 20 and alpha,alpha-trehalose dihydrate',
        },
        {
          id: 'ben-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Antibody-dependent cell-mediated cytotoxicity with real effector cells',
          description:
            'The functional assay for this molecule is a killing assay, not a binding assay. Target cells expressing IL-5Rα are co-cultured with primary natural killer cells or an FcγRIIIa-expressing effector line, and the readout is target cell death. A lot that binds the receptor and fails to kill has failed, and only this format detects that.',
          dependsOnStepId: 'ben-w3',
          reagentsAndBuffer:
            'IL-5Rα-expressing target cells, primary human NK cells or an engineered FcγRIIIa V158 reporter effector line, effector-to-target titration, lactate dehydrogenase release or luminescent reporter readout',
        },
        {
          id: 'ben-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Count eosinophils and basophils, and record that both go',
          description:
            'The IL-5 receptor sits on basophils as well as eosinophils, so the depletion is not confined to the intended cell. The label reports median blood eosinophils reduced to 0 cells per microlitre by week 4 in SIROCCO and CALIMA, and median basophil counts falling from 46 to 17 cells per microlitre at the highest dose in the phase 2 programme. Reporting only the eosinophil number understates what the drug removes.',
          dependsOnStepId: 'ben-w4',
          reagentsAndBuffer:
            'Automated differential haematology analyser for eosinophils, flow cytometry for basophil enumeration, paired baseline and on-treatment sampling at week 4 and at the end of the dosing interval',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ben-a1',
        category: 'measured',
        title: 'SIROCCO: exacerbations halved in the eosinophil-high population',
        laymanSummary:
          'The larger pivotal trial randomised 1,205 people with severe asthma still having attacks on high-dose inhalers. In the 809 with at least 300 eosinophils per microlitre — the group the primary endpoint was defined on — attacks fell by 51% on the regimen that became the marketed one.',
        technicalDetails:
          'SIROCCO enrolled 2,681 patients at 374 sites in 17 countries, of whom 1,205 were randomised: 407 to placebo, 400 to benralizumab 30 mg every 4 weeks, 398 to 30 mg every 8 weeks after three loading doses. The primary analysis population was the 809 patients with blood eosinophils of at least 300 cells per microlitre. Annual exacerbation rate ratios against placebo over 48 weeks were 0.55 (95% CI 0.42 to 0.71, p<0.0001) for the 4-weekly regimen and 0.49 (95% CI 0.37 to 0.64, p<0.0001) for the 8-weekly regimen. Prebronchodilator FEV1 improved by a least-squares mean of 0.106 L (4-weekly) and 0.159 L (8-weekly). Asthma symptom score improved on the 8-weekly regimen (-0.25, 95% CI -0.45 to -0.06) and not on the 4-weekly regimen (-0.08, 95% CI -0.27 to 0.12).',
        evidenceSource: 'Bleecker ER et al., Lancet 2016;388:2115-2127 (SIROCCO), NCT01928771',
        doi: '10.1016/S0140-6736(16)31324-1',
        measuredMetric:
          'Annual asthma exacerbation rate ratio against placebo at 48 weeks in patients with blood eosinophils of at least 300 cells per microlitre',
        auditFlag: 'verified',
      },
      {
        id: 'ben-a2',
        category: 'inferred',
        title: 'The twin trial gave a much smaller number for the same regimen',
        laymanSummary:
          'CALIMA was designed alongside SIROCCO, ran at the same time, and asked the same question. For the regimen that reached the market, SIROCCO reported a 51% cut in attacks and CALIMA reported 28%. Both are quoted as if they were the same result.',
        technicalDetails:
          'CALIMA randomised 1,306 patients at 303 sites in 11 countries to the same three arms. In the primary analysis population of 728 patients with blood eosinophils of at least 300 cells per microlitre, the annual exacerbation rate ratio was 0.64 (95% CI 0.49 to 0.85, p=0.0018) for the 4-weekly regimen and 0.72 (95% CI 0.54 to 0.95, p=0.0188) for the marketed 8-weekly regimen. SIROCCO reported 0.55 and 0.49 for the same two regimens. The confidence intervals overlap, so this is not a contradiction — but the placebo exacerbation rate differed (0.93 per year in CALIMA) and the CALIMA authors concluded that their data "further refine the patient population likely to receive the greatest benefit". A drug summarised as halving exacerbations halved them in one of its two pivotal trials and reduced them by rather more than a quarter in the other.',
        evidenceSource:
          'FitzGerald JM et al., Lancet 2016;388:2128-2141 (CALIMA), NCT01914757; Bleecker ER et al., Lancet 2016;388:2115-2127 (SIROCCO)',
        doi: '10.1016/S0140-6736(16)31322-8',
        inferredClaim:
          'That benralizumab reduces severe asthma exacerbations by about half — the SIROCCO figure quoted as the drug’s effect size, when the identically designed companion trial reported a 28% reduction for the marketed regimen',
        auditFlag: 'caution',
      },
      {
        id: 'ben-a3',
        category: 'failed',
        title: 'Three COPD trials, every dose, no significant effect',
        laymanSummary:
          'GALATHEA and TERRANOVA between them tested five dose arms in COPD patients selected for raised eosinophils. Not one rate ratio reached statistical significance. A third trial, RESOLUTE, missed its primary endpoint as well.',
        technicalDetails:
          'GALATHEA and TERRANOVA enrolled patients with moderate to very severe COPD and frequent exacerbations despite guideline-based inhaled treatment, stratified roughly 2:1 by a blood eosinophil count of 220 per cubic millimetre or greater. In GALATHEA the annualised exacerbation rate ratios against placebo in the eosinophil-high primary population were 0.96 at 30 mg (P=0.65) and 0.83 at 100 mg (P=0.05). In TERRANOVA they were 0.85 at 10 mg (P=0.06), 1.04 at 30 mg (P=0.66) and 0.93 at 100 mg (P=0.40). The published conclusion states that at 56 weeks none of the rate ratios for any dose in either trial reached significance. AstraZeneca subsequently reported that the phase 3 RESOLUTE trial, which raised the eosinophil entry threshold to 300 cells per microlitre, also failed to meet its primary endpoint. Mepolizumab, aimed at the same pathway from the other end, succeeded in the same disease in MATINEE. Whatever separates them, it is not the target.',
        evidenceSource:
          'Criner GJ et al., N Engl J Med 2019;381:1023-1034 (GALATHEA and TERRANOVA), NCT02138916 and NCT02155660',
        doi: '10.1056/NEJMoa1905248',
        measuredMetric:
          'Annualised COPD exacerbation rate ratio against placebo at week 56, every dose arm of two trials',
        auditFlag: 'caution',
      },
      {
        id: 'ben-a4',
        category: 'conclusion_shift',
        title: 'Head to head, complete eosinophil depletion beat partial depletion by nothing',
        laymanSummary:
          'Benralizumab was built to remove eosinophils entirely rather than merely reduce them, and it does. Put directly against mepolizumab, which only halves them, it produced remission in 59% of patients against 56% — a difference the trial itself reports as not superior.',
        technicalDetails:
          'MANDARA randomised 140 adults with relapsing or refractory eosinophilic granulomatosis with polyangiitis 1:1 to benralizumab 30 mg or mepolizumab 300 mg subcutaneously every 4 weeks for 52 weeks, with a prespecified noninferiority margin of -25 percentage points. Adjusted remission at weeks 36 and 48 was 59% against 56%, a difference of 3 percentage points (95% CI -13 to 18), P=0.73 for superiority. Accrued duration of remission and time to first relapse were similar. Mean blood eosinophils fell from 306 to 32 per microlitre on benralizumab and from 385 to 72 per microlitre on mepolizumab — roughly twice the depletion, with no separation in outcome. Complete oral glucocorticoid withdrawal during weeks 48 to 52 was achieved by 41% against 26%, a secondary endpoint. This is the strongest available evidence that the depth of eosinophil depletion is not the variable that determines clinical benefit, and it undercuts the mechanistic argument the molecule was designed around.',
        evidenceSource: 'Wechsler ME et al., N Engl J Med 2024;390:911-921 (MANDARA), NCT04157348',
        doi: '10.1056/NEJMoa2311155',
        inferredClaim:
          'That near-complete eosinophil depletion through cell killing is clinically superior to partial depletion through cytokine neutralisation — tested directly and not confirmed',
        auditFlag: 'contested',
      },
      {
        id: 'ben-a5',
        category: 'failed',
        title: 'The steroid-sparing trial reported no significant effect on lung function',
        laymanSummary:
          'ZONDA cut the median daily steroid dose by 75% and cut attacks by up to 70%. On the breathing test, the paper says plainly that there was no significant effect of either regimen, and the conclusion repeats it.',
        technicalDetails:
          'ZONDA randomised 220 adults with severe eosinophilic asthma on maintenance oral glucocorticoids to benralizumab 30 mg every 4 weeks, every 8 weeks after three loading doses, or placebo, for 28 weeks. Median final oral glucocorticoid dose fell 75% from baseline against 25% on placebo (P<0.001 for both regimens), with odds of a dose reduction more than four times higher than placebo. Annual exacerbation rates were 55% lower on the 4-weekly regimen (0.83 against 1.83, P=0.003) and 70% lower on the 8-weekly regimen (0.54 against 1.83, P<0.001). The results section states that at 28 weeks there was no significant effect of either regimen on FEV1 against placebo, and that effects on asthma symptom measures were mixed, some significant and some not. The published conclusion states that the benefits occurred "without a sustained effect on the FEV1". A drug can substantially reduce attacks and steroid exposure while leaving measured lung function where it found it, and this trial says so in its own summary.',
        evidenceSource: 'Nair P et al., N Engl J Med 2017;376:2448-2458 (ZONDA), NCT02075255',
        doi: '10.1056/NEJMoa1703501',
        measuredMetric:
          'FEV1 change against placebo at 28 weeks, alongside oral glucocorticoid dose reduction and exacerbation rate',
        auditFlag: 'caution',
      },
      {
        id: 'ben-a6',
        category: 'inferred',
        title: 'The label does not claim to know why it works either',
        laymanSummary:
          'The prescribing information describes the receptor binding, the missing sugar, the natural killer cells and the eosinophil death in unusual detail, and then states that the mechanism of action in asthma, vasculitis and hypereosinophilic syndrome has not been definitively established.',
        technicalDetails:
          'Section 12.1 of the FASENRA label sets out binding to IL-5Rα at 11 pM, FcγRIII engagement at 45.5 nM enabled by the absence of core fucose, and apoptosis of eosinophils and basophils through antibody-dependent cell-mediated cytotoxicity — then adds: "however, the mechanism of benralizumab action in asthma, EGPA, and HES has not been definitively established." The caveat is not boilerplate. The COPD programme depleted eosinophils to the same degree in a disease where eosinophil counts predict exacerbations, and produced no benefit at any dose; MANDARA depleted them twice as far as the comparator and produced no advantage. Both results are consistent with eosinophil count being a marker of who responds rather than the lever that produces the response.',
        evidenceSource:
          'FASENRA (benralizumab) United States prescribing information, Clinical Pharmacology section 12.1 (BLA 761070)',
        inferredClaim:
          'That destroying eosinophils is the mechanism by which benralizumab prevents exacerbations — stated as unestablished in the label, and twice unsupported by trials that varied depletion depth without varying outcome',
        auditFlag: 'contested',
      },
      {
        id: 'ben-a7',
        category: 'measured',
        title: 'Given at the attack itself, it beat the steroid course',
        laymanSummary:
          'A UK trial gave a single injection at the moment of an acute eosinophilic attack of asthma or COPD, and compared it with the standard five-day steroid course. Treatment failure at 90 days was 74% with steroids alone and 45% with benralizumab.',
        technicalDetails:
          'ABRA was a phase 2, double-blind, double-dummy, active placebo-controlled trial at two UK hospitals. 158 adults with blood eosinophils of at least 300 cells per microlitre at an acute exacerbation of asthma or COPD were randomised 1:1:1 to prednisolone 30 mg daily for 5 days plus a single 100 mg benralizumab injection, benralizumab alone with placebo tablets, or prednisolone alone with placebo injection. Treatment failure over 90 days occurred in 39 of 53 (74%) on prednisolone alone against 47 of 105 (45%) in the pooled benralizumab groups (odds ratio 0.26, 95% CI 0.13 to 0.56, p=0.0005). The 28-day total symptom visual analogue scale difference was 49 mm (95% CI 14 to 84, p=0.0065) favouring benralizumab. Hyperglycaemia and sinus infection adverse events were attributable to the prednisolone arm only. This is a 158-patient phase 2 trial at two sites, at a dose the label does not authorise, and it is not an approved use — but it is a rare instance of a biologic tested against the cheap standard of care rather than against placebo, and beating it.',
        evidenceSource:
          'Ramakrishnan S et al., Lancet Respir Med 2025;13:59-68 (ABRA), NCT04098718',
        doi: '10.1016/S2213-2600(24)00299-6',
        measuredMetric:
          'Proportion of treatment failures over 90 days after a single acute eosinophilic exacerbation, against prednisolone alone',
        auditFlag: 'verified',
      },
      {
        id: 'ben-a8',
        category: 'inferred',
        title: 'Basophils go too, and the summaries do not say so',
        laymanSummary:
          'The receptor benralizumab targets is not exclusive to eosinophils. Basophils carry it as well, and the label records that their numbers fall consistently across every asthma trial.',
        technicalDetails:
          'Section 12.1 states that the IL-5 receptor is expressed on the surface of eosinophils and basophils, and that antibody-dependent cell-mediated cytotoxicity leads to apoptosis of both. Section 12.2 records that in the phase 2 dose-ranging trial, median blood basophil counts fell from 46 to 17 cells per microlitre at 100 mg and from 52 to 18 at 20 mg by 52 weeks, against 40 to 46 on placebo, and that reductions in basophils were consistently observed across all asthma clinical studies. Mepolizumab, which neutralises the cytokine rather than binding the receptor, does not produce the same basophil effect. The long-term consequences of durable basophil depletion have not been characterised in any published trial, and the drug is routinely described as eosinophil-depleting without qualification.',
        evidenceSource:
          'FASENRA (benralizumab) United States prescribing information, Clinical Pharmacology sections 12.1 and 12.2 (BLA 761070)',
        inferredClaim:
          'That benralizumab is a selectively eosinophil-depleting agent — the universal description, when its own label records consistent basophil depletion across every asthma trial',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'An injection, then a longer gap than the alternatives',
        laymanDesc:
          'Three injections four weeks apart to load, then one every eight weeks. That interval is the practical advantage the drug is chosen on.',
        molecularDetail:
          'A 150 kDa humanised afucosylated IgG1 kappa antibody produced in Chinese hamster ovary cells, supplied as a 30 mg prefilled syringe or autoinjector in 1 mL and a 10 mg syringe in 0.5 mL for children under 35 kg, formulated in histidine and trehalose at pH 5.5 to 6.5. The label specifies 30 mg every 4 weeks for three doses then every 8 weeks in asthma, and every 4 weeks throughout in eosinophilic granulomatosis with polyangiitis and hypereosinophilic syndrome.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It binds the receiver, not the message',
        laymanDesc:
          'Instead of catching the growth signal in the bloodstream, benralizumab clamps onto the receptor on the eosinophil that receives it. The cell is now marked.',
        molecularDetail:
          'Direct binding to the alpha subunit of the human IL-5 receptor with a dissociation constant of 11 pM. IL-5Rα is expressed on eosinophils and on basophils, which is why the drug depletes both. This is the structural opposite of mepolizumab and reslizumab, which sequester free IL-5 and never touch the cell.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'A missing sugar summons the killer cell',
        laymanDesc:
          'One sugar has been engineered off the antibody’s tail. That single omission makes it grip natural killer cells far more tightly than a normal antibody would, and pulls one over to the marked eosinophil.',
        molecularDetail:
          'Removing core fucose from the Fc N-glycan raises FcγRIIIa affinity by roughly two orders of magnitude. The label records in vitro FcγRIII binding at 45.5 nM. Afucosylation is achieved by expressing the antibody in a FUT8-knockout host rather than by chemical modification, which makes the production cell line part of the definition of the drug.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The eosinophil is killed, not starved',
        laymanDesc:
          'The natural killer cell destroys the eosinophil. The blood count does not just fall — within four weeks the median is zero.',
        molecularDetail:
          'Antibody-dependent cell-mediated cytotoxicity produces apoptosis of eosinophils and basophils. In SIROCCO and CALIMA the label records median absolute blood eosinophil counts reduced to 0 cells per microlitre at the first measurement, week 4, and maintained throughout treatment. Median basophil counts fell from 46 to 17 cells per microlitre at the highest phase 2 dose.',
        iconName: 'CircleSlash',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Attacks fall, by between a quarter and a half',
        laymanDesc:
          'In severe asthma with a high eosinophil count, exacerbations fall. How far depends on which of the two pivotal trials you read.',
        molecularDetail:
          'SIROCCO 8-weekly regimen: rate ratio 0.49 (95% CI 0.37 to 0.64, p<0.0001). CALIMA 8-weekly regimen: rate ratio 0.72 (95% CI 0.54 to 0.95, p=0.0188). ZONDA 8-weekly regimen in steroid-dependent asthma: 0.54 against 1.83 per year, a 70% reduction, p<0.001, alongside a 75% median cut in daily oral glucocorticoid dose.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where it did not work at all',
        laymanDesc:
          'In COPD, three trials selected patients by the same eosinophil marker and found nothing at any dose. Against the rival antibody in vasculitis, it was equal, not better.',
        molecularDetail:
          'GALATHEA rate ratios 0.96 (P=0.65) and 0.83 (P=0.05); TERRANOVA 0.85 (P=0.06), 1.04 (P=0.66) and 0.93 (P=0.40); no dose in either trial reached significance at week 56, and RESOLUTE later missed its primary endpoint. MANDARA: remission 59% against 56% for mepolizumab, P=0.73 for superiority, despite eosinophil counts of 32 against 72 per microlitre.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SIROCCO (NCT01928771)',
        phase: 'Phase 3, randomised, double-blind, parallel-group, placebo-controlled',
        sampleSize: 1205,
        primaryEndpoint:
          'Annual asthma exacerbation rate ratio against placebo over 48 weeks in patients with blood eosinophils of at least 300 cells per microlitre',
        endpointMet: true,
        statisticalPValue:
          'Rate ratio 0.55 (95% CI 0.42 to 0.71, p<0.0001) every 4 weeks and 0.49 (95% CI 0.37 to 0.64, p<0.0001) every 8 weeks, in the 809-patient primary analysis population',
        unreportedAdverseSignals:
          'FEV1 improved by only 0.106 L and 0.159 L. The asthma symptom score improved on the 8-weekly regimen and not on the 4-weekly regimen. Patients with eosinophils below 300 cells per microlitre were enrolled 1:2 but excluded from the primary endpoint.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CALIMA (NCT01914757)',
        phase: 'Phase 3, randomised, double-blind, parallel-group, placebo-controlled',
        sampleSize: 1306,
        primaryEndpoint:
          'Annual asthma exacerbation rate ratio against placebo over 56 weeks in patients on high-dose inhaled corticosteroid plus long-acting beta-agonist with blood eosinophils of at least 300 cells per microlitre',
        endpointMet: true,
        statisticalPValue:
          'Rate ratio 0.64 (95% CI 0.49 to 0.85, p=0.0018) every 4 weeks and 0.72 (95% CI 0.54 to 0.95, p=0.0188) every 8 weeks, in the 728-patient primary analysis population',
        unreportedAdverseSignals:
          'The marketed 8-weekly regimen produced a 28% reduction here against 51% in SIROCCO. The total asthma symptom score improved only on the 8-weekly regimen.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ZONDA (NCT02075255)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 220,
        primaryEndpoint:
          'Percentage change in daily oral glucocorticoid dose from baseline to week 28 while asthma control was maintained',
        endpointMet: true,
        statisticalPValue:
          'Median final oral glucocorticoid dose reduced 75% against 25% on placebo, P<0.001 for both regimens; odds of a dose reduction more than four times higher than placebo',
        unreportedAdverseSignals:
          'No significant effect of either regimen on FEV1 at 28 weeks, stated in both the results and the conclusion. Effects on asthma symptom measures were mixed, some significant and some not.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'GALATHEA and TERRANOVA (NCT02138916, NCT02155660)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, dose-ranging',
        sampleSize: 3910,
        primaryEndpoint:
          'Annualised COPD exacerbation rate ratio against placebo at week 56 in patients with blood eosinophils of at least 220 per cubic millimetre',
        endpointMet: false,
        statisticalPValue:
          'GALATHEA 0.96 (P=0.65) at 30 mg and 0.83 (P=0.05) at 100 mg; TERRANOVA 0.85 (P=0.06) at 10 mg, 1.04 (P=0.66) at 30 mg and 0.93 (P=0.40) at 100 mg — none significant',
        unreportedAdverseSignals:
          'TERRANOVA’s 30 mg arm, the dose marketed in asthma, produced a rate ratio above 1.00. A later phase 3 trial, RESOLUTE, raised the eosinophil entry threshold to 300 cells per microlitre and also missed its primary endpoint.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'MANDARA (NCT04157348)',
        phase: 'Phase 3, randomised, double-blind, active-controlled noninferiority',
        sampleSize: 140,
        primaryEndpoint:
          'Remission at weeks 36 and 48 in relapsing or refractory eosinophilic granulomatosis with polyangiitis, against mepolizumab, noninferiority margin -25 percentage points',
        endpointMet: true,
        statisticalPValue:
          '59% against 56%, difference 3 percentage points (95% CI -13 to 18); noninferior, P=0.73 for superiority',
        unreportedAdverseSignals:
          'Blood eosinophils fell to 32 per microlitre on benralizumab against 72 on mepolizumab with no separation in outcome, which is direct evidence against depth of depletion as the operative variable. Serious adverse events 6% against 13%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ABRA (NCT04098718)',
        phase: 'Phase 2, randomised, double-blind, double-dummy, active placebo-controlled',
        sampleSize: 158,
        primaryEndpoint:
          'Proportion of treatment failures over 90 days and total symptom visual analogue scale at day 28, after an acute eosinophilic exacerbation of asthma or COPD, against prednisolone alone',
        endpointMet: true,
        statisticalPValue:
          'Treatment failure 74% against 45% (odds ratio 0.26, 95% CI 0.13 to 0.56, p=0.0005); 28-day symptom VAS mean difference 49 mm (95% CI 14 to 84, p=0.0065)',
        unreportedAdverseSignals:
          'A two-site phase 2 trial of 158 patients at a 100 mg dose the label does not authorise for asthma. Not an approved use.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Annual asthma exacerbation rate ratio 0.49 for the marketed regimen in SIROCCO (95% CI 0.37 to 0.64, p<0.0001) in eosinophil-selected patients',
        'Annual asthma exacerbation rate ratio 0.72 for the same regimen in CALIMA (95% CI 0.54 to 0.95, p=0.0188)',
        'Median oral glucocorticoid dose reduced 75% against 25% on placebo in ZONDA (P<0.001)',
        'Median blood eosinophil count reduced to 0 cells per microlitre by week 4 and maintained, per the label',
        'Remission 59% against mepolizumab’s 56% in MANDARA, noninferior and explicitly not superior (P=0.73)',
      ],
      unsupportedInferences: [
        'That near-complete eosinophil depletion is clinically better than partial depletion — tested head to head in MANDARA and not confirmed',
        'That benralizumab halves severe asthma exacerbations, when the SIROCCO and CALIMA figures for the marketed regimen are 51% and 28%',
        'That eosinophil killing is the mechanism of benefit, which the label states has not been definitively established',
        'That the asthma result should generalise to COPD with the same biomarker, which three phase 3 trials directly contradict',
        'That the drug depletes eosinophils selectively, when the label records consistent basophil depletion across every asthma trial',
      ],
      whatFailedInitially: [
        'No dose in GALATHEA or TERRANOVA reached significance on the COPD exacerbation rate at week 56',
        'TERRANOVA’s 30 mg arm produced a rate ratio of 1.04, slightly favouring placebo',
        'RESOLUTE, run with a higher eosinophil entry threshold, missed its primary endpoint',
        'ZONDA found no significant effect on FEV1 at 28 weeks and said so in its conclusion',
        'MANDARA failed to demonstrate superiority over mepolizumab despite twice the eosinophil depletion',
      ],
      realWorldOutcome: [
        'Approved in the United States on 14 November 2017 under BLA 761070, the second anti-IL-5 pathway antibody licensed for asthma',
        'The every-8-week maintenance interval after loading is the practical reason it is chosen over the 4-weekly alternatives',
        'Indications extended to eosinophilic granulomatosis with polyangiitis in 2024 on the strength of a noninferiority trial against mepolizumab, and to hypereosinophilic syndrome',
        'No COPD indication exists for this molecule after three phase 3 trials, while mepolizumab gained one from MATINEE',
        'No CMS National Average Drug Acquisition Cost figure is published, because the drug moves through specialty channels the retail pharmacy survey does not cover',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection — 30 mg every 4 weeks for three doses then every 8 weeks in asthma, 30 mg every 4 weeks in eosinophilic granulomatosis with polyangiitis and hypereosinophilic syndrome, and a 10 mg presentation for children under 35 kg',
      description:
        'Supplied as a prefilled syringe and as an autoinjector pen in a histidine and trehalose formulation at pH 5.5 to 6.5. The label notes that because benralizumab is a protein, a few translucent or white particles may be present in the solution. The extended maintenance interval reflects the long half-life of an IgG1 and the fact that the pharmacodynamic effect — an eosinophil count at zero — persists between doses.',
      safetyProfile:
        'Contraindicated in known hypersensitivity to benralizumab or its excipients. Hypersensitivity reactions including anaphylaxis, angioedema, urticaria and rash have occurred, generally within hours but sometimes days later, and the label directs discontinuation. Systemic or inhaled corticosteroids must not be stopped abruptly on starting treatment, and reductions must be gradual and supervised. Pre-existing helminth infection should be treated before therapy begins, and treatment should be interrupted if an infection acquired during therapy does not respond to anti-helminth treatment. The commonest adverse events in SIROCCO were worsening asthma, reported in 13% of benralizumab-treated patients against 19% on placebo, and nasopharyngitis at 12% in both. It must not be used for acute asthma symptoms, acute bronchospasm or status asthmaticus.',
    },
    commonQuestions: [
      {
        q: 'Is it better than Nucala because it removes eosinophils completely?',
        a: 'That was the design argument, and it has now been tested directly. MANDARA randomised 140 patients with eosinophilic granulomatosis with polyangiitis to benralizumab or mepolizumab for a year. Benralizumab drove mean blood eosinophils from 306 to 32 per microlitre; mepolizumab took them from 385 to 72 — roughly twice the depletion. Remission at weeks 36 and 48 was 59% against 56%, a three-point difference with a confidence interval running from -13 to +18, and the paper reports P=0.73 for superiority. It is noninferior. It is not better. The depth of depletion, which is the most striking thing about this molecule, did not turn out to be the thing that determines whether a patient gets well.',
        auditNote:
          'This is the only randomised head-to-head between two asthma-pathway biologics in the literature, and it is in vasculitis rather than asthma. No such trial exists in severe asthma.',
      },
      {
        q: 'Why is it not approved for COPD when mepolizumab is?',
        a: 'Because it was tried three times and failed. GALATHEA and TERRANOVA enrolled COPD patients selected for a blood eosinophil count of at least 220 per cubic millimetre and tested five dose arms between them. Not one annualised exacerbation rate ratio reached statistical significance at 56 weeks — one of them, 30 mg in TERRANOVA, came out at 1.04, marginally favouring placebo. AstraZeneca then ran RESOLUTE with a higher eosinophil threshold, and it missed its primary endpoint too. Mepolizumab, which blocks the same pathway by catching the cytokine instead of killing the cell, succeeded in MATINEE. Nobody has a settled explanation for the difference, and that gap is itself the honest answer.',
        auditNote:
          'Three negative phase 3 trials in a disease where the biomarker predicts exacerbations is a substantial piece of evidence against the mechanism as usually stated.',
      },
      {
        q: 'Will it improve my breathing tests?',
        a: 'Do not count on it. SIROCCO measured an FEV1 improvement of 0.159 L on the marketed regimen — about a sixth of a litre. ZONDA, the trial about coming off steroid tablets, states in its results that there was no significant effect of either benralizumab regimen on FEV1 at 28 weeks, and repeats it in the conclusion: the benefits occurred without a sustained effect on FEV1. What the trials do show is fewer attacks and less oral steroid. If your asthma is defined by exacerbations, that is the benefit on offer. If it is defined by everyday breathlessness, ask what evidence exists for that specifically, because it is thinner.',
      },
      {
        q: 'What does taking away all my eosinophils do to me long-term?',
        a: 'Honestly, nobody fully knows. Eosinophils have roles in defence against parasitic worms and in tissue repair, and the label reflects the parasite concern directly: pre-existing helminth infections must be treated before starting, and treatment should be interrupted if an infection acquired during therapy fails to respond to anti-helminth drugs. Patients with known parasitic infections were excluded from the trials, so there is no trial evidence on what happens if one occurs. The label also records that basophils fall consistently across every asthma study, because they carry the same receptor — a fact that rarely appears in summaries of the drug. The trials ran for 48 to 56 weeks with open-label extensions. Multi-decade data does not exist.',
        auditNote:
          'The absence of a long-term signal is not the same as the presence of long-term safety. It is an absence of measurement.',
      },
      {
        q: 'Can I have an injection when I am actually having an attack?',
        a: 'Not under the label, which states plainly that benralizumab must not be used for acute asthma symptoms, acute bronchospasm or status asthmaticus. There is one trial that did exactly that, and its result is interesting: ABRA gave a single 100 mg injection at the moment of an acute eosinophilic exacerbation of asthma or COPD in 158 UK patients and compared it against the standard five-day prednisolone course. Treatment failure at 90 days was 74% with prednisolone alone and 45% with benralizumab, odds ratio 0.26. That is a phase 2 trial at two hospitals, at a dose and in a setting the label does not authorise. It is a reason to watch this question, not a reason to act on it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bleecker ER, FitzGerald JM, Chanez P, et al. Efficacy and safety of benralizumab for patients with severe asthma uncontrolled with high-dosage inhaled corticosteroids and long-acting β2-agonists (SIROCCO). Lancet 2016;388:2115-2127',
        identifier: '10.1016/S0140-6736(16)31324-1',
        kind: 'doi',
      },
      {
        label:
          'FitzGerald JM, Bleecker ER, Nair P, et al. Benralizumab, an anti-interleukin-5 receptor α monoclonal antibody, as add-on treatment for patients with severe, uncontrolled, eosinophilic asthma (CALIMA). Lancet 2016;388:2128-2141',
        identifier: '10.1016/S0140-6736(16)31322-8',
        kind: 'doi',
      },
      {
        label:
          'Nair P, Wenzel S, Rabe KF, et al. Oral glucocorticoid-sparing effect of benralizumab in severe asthma (ZONDA). N Engl J Med 2017;376:2448-2458',
        identifier: '10.1056/NEJMoa1703501',
        kind: 'doi',
      },
      {
        label:
          'Criner GJ, Celli BR, Brightling CE, et al. Benralizumab for the prevention of COPD exacerbations (GALATHEA and TERRANOVA). N Engl J Med 2019;381:1023-1034',
        identifier: '10.1056/NEJMoa1905248',
        kind: 'doi',
      },
      {
        label:
          'Wechsler ME, Nair P, Terrier B, et al. Benralizumab versus mepolizumab for eosinophilic granulomatosis with polyangiitis (MANDARA). N Engl J Med 2024;390:911-921',
        identifier: '10.1056/NEJMoa2311155',
        kind: 'doi',
      },
      {
        label:
          'Ramakrishnan S, Russell REK, Mahmood HR, et al. Treating eosinophilic exacerbations of asthma and COPD with benralizumab (ABRA): a double-blind, double-dummy, active placebo-controlled randomised trial. Lancet Respir Med 2025;13:59-68',
        identifier: '10.1016/S2213-2600(24)00299-6',
        kind: 'doi',
      },
      {
        label: 'SIROCCO — benralizumab in severe uncontrolled eosinophilic asthma',
        identifier: 'NCT01928771',
        kind: 'nct',
      },
      {
        label:
          'MANDARA — benralizumab against mepolizumab in eosinophilic granulomatosis with polyangiitis',
        identifier: 'NCT04157348',
        kind: 'nct',
      },
      {
        label:
          'RESOLUTE — efficacy and safety of benralizumab in moderate to very severe COPD with a history of frequent exacerbations',
        identifier: 'NCT04053634',
        kind: 'nct',
      },
      {
        label:
          'FASENRA (benralizumab) United States prescribing information — Dosage 2.1 to 2.3, Contraindications 4, Warnings and Precautions 5.1 to 5.4, Description 11, Clinical Pharmacology 12.1 and 12.2 (BLA 761070)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22FASENRA%22',
        kind: 'regulatory',
      },
      {
        label:
          'Institute for Clinical and Economic Review. Biologic Therapies for Treatment of Asthma Associated with Type 2 Inflammation: Effectiveness, Value, and Value-Based Price Benchmarks. Final Evidence Report, 20 December 2018',
        identifier: 'https://icer.org/assessment/asthma-2018/',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Reslizumab — the anti-IL-5 antibody with the largest exacerbation reductions in the class,
  //    a boxed warning for anaphylaxis, a licence that stops at the eighteenth birthday because
  //    adolescents did worse on it, and a subcutaneous version that failed both its trials.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'reslizumab',
    name: 'Reslizumab',
    tradeName: 'Cinqair',
    sponsor:
      'Teva Respiratory LLC (BLA 761033); originated at Schering-Plough and Ception Therapeutics',
    targetGene: 'IL5',
    targetProtein:
      'Interleukin-5, the free cytokine, bound with a dissociation constant of 81 pM and prevented from reaching the alpha chain of the IL-5 receptor complex on the eosinophil surface',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2016,
    indication:
      'Add-on maintenance treatment of patients with severe asthma aged 18 years and older with an eosinophilic phenotype. The label carries an explicit limitation of use: it is not indicated for the treatment of other eosinophilic conditions, and not for the relief of acute bronchospasm or status asthmaticus',
    patientFriendlyIndication:
      'Severe asthma in adults whose attacks are driven by a high eosinophil count',
    anatomicalSite:
      'The bloodstream — the antibody binds free interleukin-5 in circulation, and eosinophil production and survival fall as a consequence',
    conditionContext: {
      conditionExplainer:
        'Reslizumab does the same thing as mepolizumab: it neutralises interleukin-5, the cytokine eosinophils depend on. The difference is not the target but the delivery. It goes in through a drip, dosed by body weight, in a clinic, with a healthcare professional standing by prepared to treat anaphylaxis.',
      whyItMatters:
        'On the endpoint the class is judged by, reslizumab produced the largest reductions any of these antibodies has reported — rate ratios of 0.50 and 0.41 in its two pivotal trials. It is nonetheless the least used, because everything around the molecule went wrong: a boxed warning, a weight-based infusion, a licence that stops at 18, and a subcutaneous version that failed both trials meant to rescue it.',
      whoTakesThis:
        'Adults aged 18 and over with severe asthma and a raised blood eosinophil count, already on inhaled corticosteroid-based therapy. Not adolescents: the label records that in the pivotal trials, 12-to-17-year-olds on reslizumab had a higher exacerbation rate than those on placebo.',
      clinicalGoals:
        'Fewer exacerbations. The label states that no clinical study has ever been conducted to assess whether reslizumab allows maintenance corticosteroid doses to be reduced — the one thing its two closest rivals both have a dedicated trial for.',
    },
    oneSentenceVerdict:
      'An interleukin-5-neutralising antibody that produced the largest exacerbation reductions in its class — rate ratios of 0.50 and 0.41 in 953 eosinophil-selected patients — and carries a boxed warning for anaphylaxis at 0.3%, a malignancy imbalance of 0.6% against 0.3%, an adult-only licence because adolescent exacerbation rates ran the wrong way (rate ratio 2.09), and no lung function benefit at all in patients not selected by eosinophil count.',
    laymanHowItWorks:
      'Interleukin-5 is the single messenger that makes eosinophils, calls them into the airway and keeps them alive there. Reslizumab is an antibody that binds that messenger in the bloodstream and neutralises it. Eosinophil counts fall — from about 700 to about 55 cells per microlitre over a year of treatment — and in adults whose asthma attacks are driven by those cells, attacks fall by roughly half. It is given as a drip in a clinic rather than an injection at home, because it has caused anaphylaxis and the label requires someone present who can treat it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    substitutes: {
      summary:
        'Reslizumab is prescribed less than either of its direct competitors, and the reason is not that it works less well on the primary endpoint. It is that a weight-based intravenous infusion with a mandatory observation period, a boxed warning, an adults-only licence and no steroid-sparing trial add up to a worse product around an equally good molecule. Every alternative below is a subcutaneous injection that a patient can be taught to give.',
      conventionalRx: [
        {
          name: 'Mepolizumab (Nucala)',
          class: 'Anti-interleukin-5 monoclonal antibody, IgG1 kappa',
          howItCompares:
            'The same target and nearly the same affinity — 100 pM against reslizumab’s 81 pM — delivered as a fixed-dose subcutaneous injection instead of a weight-based infusion. It has a dedicated oral steroid-sparing trial (SIRIUS, median 50% dose reduction, p=0.007) that reslizumab’s label says has never been conducted for reslizumab, and it is licensed from age 6 rather than 18.',
          typicalCost:
            'Neither molecule has a published CMS National Average Drug Acquisition Cost figure — both move through specialty channels the retail pharmacy survey does not cover',
          prosAndCons:
            'Pros: injectable at home, no boxed warning, paediatric and adolescent licence, four additional indications. Cons: reported exacerbation reductions are numerically smaller than reslizumab’s, in trials that were never compared directly.',
        },
        {
          name: 'Benralizumab (Fasenra)',
          class: 'Anti-interleukin-5 receptor alpha monoclonal antibody, afucosylated IgG1',
          howItCompares:
            'Attacks the same pathway from the receptor end and depletes eosinophils further, but its practical advantage over reslizumab is the same as mepolizumab’s: a subcutaneous injection, extending to every 8 weeks after loading, against a four-weekly clinic infusion.',
          typicalCost: 'Specialty biologic, not covered by the CMS retail acquisition cost survey',
          prosAndCons:
            'Pros: longest dosing interval in the class, oral steroid-sparing trial, licence from age 6. Cons: three failed COPD trials, and no superiority over mepolizumab when tested head to head.',
        },
        {
          name: 'Oral prednisolone or prednisone',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The comparison reslizumab is unable to make. Section 5.4 of its label states that no clinical studies have been conducted to assess reduction of maintenance corticosteroid dosages following administration of reslizumab. The subcutaneous programme did test it — study 2 of the 2020 phase 3 pair — and found no difference from placebo (odds ratio 1.23, 95% CI 0.70 to 2.16, p=0.47).',
          typicalCost: 'Among the cheapest medicines in the world at pharmacy acquisition cost',
          prosAndCons:
            'Pros: universal, immediate, effectively free. Cons: the cumulative harms that justify a biologic in the first place, which for this molecule remain formally unaddressed by trial.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Stay for the observation period, especially at the second dose',
          action:
            'Do not leave the infusion suite early, and know the symptoms of anaphylaxis before the first dose.',
          patientImpact:
            'The boxed warning records anaphylaxis in 0.3% of patients in placebo-controlled studies, occurring during or within 20 minutes of the infusion and reported as early as the second dose. Manifestations included breathlessness, falling oxygen saturation, wheeze, vomiting, urticaria and mucosal involvement. In all three cases the drug was permanently discontinued.',
          clinicalPrecaution:
            'The label requires administration by a healthcare professional prepared to manage anaphylaxis, and permanent discontinuation if it occurs. This is the only anti-IL-5 antibody carrying a boxed warning.',
        },
        {
          name: 'Do not stop your inhalers or steroid tablets when the infusions start',
          action:
            'Continue every existing asthma treatment unless a clinician reduces it deliberately and gradually.',
          patientImpact:
            'Section 5.4 states that no clinical studies have been conducted to assess reduction of maintenance corticosteroid dosages with reslizumab, and directs that systemic and inhaled corticosteroids not be discontinued abruptly. There is no evidence base for tapering steroids on this drug specifically.',
          clinicalPrecaution:
            'Corticosteroid reduction can produce systemic withdrawal symptoms and unmask conditions the steroid was suppressing.',
        },
        {
          name: 'Ask about the malignancy numbers before you consent',
          action: 'Raise any personal or family cancer history, and ask to see section 5.3.',
          patientImpact:
            'In placebo-controlled studies, 6 of 1,028 patients (0.6%) on 3 mg/kg reslizumab had at least one malignant neoplasm reported against 2 of 730 (0.3%) on placebo. The label states the malignancies were diverse in nature with no clustering by tissue type, and that the majority were diagnosed within less than six months of exposure.',
          clinicalPrecaution:
            'Six events against two is a small absolute difference and a short latency argues against causation, which is why it is a warning rather than a contraindication. It is on the label because the imbalance is real, and it should be part of the conversation rather than a surprise.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Humanised IgG4 kappa monoclonal antibody produced by recombinant DNA technology in murine myeloma non-secreting 0 (NS0) cells',
      molecularWeight: 'Approximately 147 kDa',
      targetReceptorAffinity:
        'Binds interleukin-5 with a dissociation constant of 81 pM, blocking IL-5 from binding the alpha chain of the IL-5 receptor complex on the eosinophil surface. The IgG4 subclass is chosen precisely for what it does not do: it recruits effector function poorly, so the antibody neutralises a soluble cytokine without marking any cell for destruction. The label states that despite this, the mechanism of reslizumab action in asthma has not been definitively established.',
      structureSource: {
        label:
          'CINQAIR (reslizumab) United States prescribing information, Description section 11 and Clinical Pharmacology sections 12.1 and 12.2 (BLA 761033)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22CINQAIR%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'res-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the IgG4 hinge and screen for half-antibody exchange',
          description:
            'IgG4 antibodies undergo Fab-arm exchange: the hinge disulfides dissociate and half-molecules swap with endogenous IgG4 in circulation, producing bispecific hybrids that are no longer bivalent for the target. Any IgG4 therapeutic must be characterised for hinge integrity before release, because an exchanged molecule binds IL-5 monovalently and neutralises it less well.',
          reagentsAndBuffer:
            'Non-reducing and reducing SDS capillary electrophoresis, intact and subunit mass by LC-MS, size exclusion chromatography with multi-angle light scattering, an in vitro Fab-arm exchange challenge against polyclonal human IgG4',
        },
        {
          id: 'res-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Express in a murine myeloma NS0 line',
          description:
            'The label specifies production in murine myeloma non-secreting 0 cells rather than the Chinese hamster ovary host used for mepolizumab and benralizumab. NS0 cells attach non-human glycan structures — galactose-alpha-1,3-galactose and N-glycolylneuraminic acid — that human sera can carry pre-existing antibodies against, which is one of several reasons an immunogenicity and hypersensitivity programme for an NS0-derived product is scrutinised more closely.',
          dependsOnStepId: 'res-w1',
          reagentsAndBuffer:
            'NS0 murine myeloma host, cholesterol-dependent or adapted serum-free medium, glutamine synthetase selection, fed-batch bioreactor with controlled pH and dissolved oxygen',
        },
        {
          id: 'res-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Capture, viral clearance and a formulation for infusion rather than injection',
          description:
            'Protein A capture, low-pH viral inactivation, polishing chromatography, then formulation at 10 mg/mL in acetate and sucrose at pH 5.5 — a dilute solution, because the product is diluted further into 50 mL of saline and infused over 20 to 50 minutes rather than injected. The contrast with a 100 mg/mL subcutaneous formulation is the whole commercial story of this molecule.',
          dependsOnStepId: 'res-w2',
          reagentsAndBuffer:
            'Protein A resin, low-pH hold with neutralisation, ion exchange polishing, nanofiltration, glacial acetic acid, sodium acetate trihydrate and sucrose to pH 5.5, 100 mg per 10 mL single-use vial',
        },
        {
          id: 'res-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Neutralisation potency on an IL-5-dependent cell line',
          description:
            'Confirm that the lot blocks IL-5-driven survival of a receptor-bearing cell at concentrations a 3 mg/kg infusion achieves. For an IgG4 the assay must also confirm the absence of cell killing: any cytotoxic signal would indicate effector function this subclass is not supposed to have, and would change the safety profile of the product.',
          dependsOnStepId: 'res-w3',
          reagentsAndBuffer:
            'TF-1 or comparable IL-5-dependent line, recombinant human IL-5 titration, viability readout, parallel antibody-dependent cytotoxicity assay run as a negative control',
        },
        {
          id: 'res-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Track the eosinophil count and the anti-drug antibody together',
          description:
            'The label records mean blood eosinophils falling from 696 to 55 cells per microlitre at week 52 against 624 to 496 on placebo, with reduction apparent by days 2 to 3 and no tachyphylaxis over a year. It also records that counts return towards baseline about 120 days after the last dose, and that treatment-emergent anti-reslizumab antibodies did not interfere with the eosinophil-lowering effect. Both readouts belong on the same plot: an eosinophil count that drifts upward is either a missed dose or an immunogenicity signal, and only the paired assay distinguishes them.',
          dependsOnStepId: 'res-w4',
          reagentsAndBuffer:
            'Automated differential haematology analyser, validated bridging immunoassay for anti-reslizumab antibodies with a neutralising-antibody confirmatory tier, trough serum reslizumab concentration by ligand binding assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'res-a1',
        category: 'measured',
        title: 'The largest exacerbation reductions in the class, in two duplicate trials',
        laymanSummary:
          'Two identically designed year-long trials in 953 adults and adolescents with a blood eosinophil count of at least 400 per microlitre found attacks cut by half in one and by nearly 60% in the other.',
        technicalDetails:
          'Castro et al. ran two duplicate multicentre, double-blind, placebo-controlled phase 3 trials. Patients aged 12 to 75 with asthma inadequately controlled on medium-to-high dose inhaled corticosteroid therapy, blood eosinophils of at least 400 cells per microlitre and at least one exacerbation in the previous year were randomised 1:1 to intravenous reslizumab 3.0 mg/kg or placebo every 4 weeks for a year. Of 2,597 screened, 953 were randomised. The annual frequency of clinical asthma exacerbations gave a rate ratio of 0.50 (95% CI 0.37 to 0.67) in study 1 and 0.41 (95% CI 0.28 to 0.59) in study 2, both p<0.0001. Those are the largest reductions reported for any anti-IL-5 agent in severe asthma. Note the screening ratio: 2,597 screened to randomise 953, because the eosinophil threshold of 400 excludes most people with severe asthma.',
        evidenceSource:
          'Castro M et al., Lancet Respir Med 2015;3:355-366, NCT01287039 and NCT01285323',
        doi: '10.1016/S2213-2600(15)00042-9',
        measuredMetric:
          'Annual frequency of clinical asthma exacerbations over 52 weeks in patients with blood eosinophils of at least 400 cells per microlitre',
        auditFlag: 'verified',
      },
      {
        id: 'res-a2',
        category: 'failed',
        title: 'Without the eosinophil threshold, no effect on lung function at all',
        laymanSummary:
          'A separate trial enrolled 492 people with poorly controlled asthma across the whole range of eosinophil counts and measured lung function at 16 weeks. In the overall population there was no significant difference from placebo, and in those below 400 eosinophils there was no improvement whatever.',
        technicalDetails:
          'Corren et al. randomised patients with poorly controlled asthma to intravenous reslizumab 3.0 mg/kg or placebo every 4 weeks for 16 weeks, with change in FEV1 from baseline to week 16 as the primary endpoint. 492 patients received at least one dose (395 reslizumab, 97 placebo). In the overall population, the mean FEV1 change from baseline was not significantly different between reslizumab and placebo, and no significant relationship was detected between treatment, baseline blood eosinophils and change in FEV1. In the subgroup below 400 cells per microlitre, there was no significant improvement in FEV1. In the subgroup at or above 400, improvements in FEV1, ACQ-7, rescue beta-agonist use and FVC were much larger. The published conclusion states that clinically meaningful effects on lung function and symptom control were not seen in patients unselected for baseline eosinophils. This is the trial the biomarker threshold in the licence rests on.',
        evidenceSource: 'Corren J et al., Chest 2016;150:799-810, NCT01508936',
        doi: '10.1016/j.chest.2016.03.018',
        measuredMetric:
          'Change in FEV1 from baseline to week 16 in a population unselected for blood eosinophil count',
        auditFlag: 'caution',
      },
      {
        id: 'res-a3',
        category: 'failed',
        title: 'Adolescents on the drug had more attacks than adolescents on placebo',
        laymanSummary:
          'Thirty-nine 12-to-17-year-olds were enrolled in the pivotal trials. In the two exacerbation studies, the teenagers given reslizumab had an exacerbation rate of 2.86 a year against 1.37 on placebo. The licence stops at 18 because of it.',
        technicalDetails:
          'Section 8.4 of the label states that reslizumab is not indicated for use in patients under 18 and that safety and effectiveness in patients aged 17 and younger have not been established. It records that 39 patients aged 12 to under 18 were evaluated across two 52-week exacerbation studies and one 16-week lung function study, and that in the exacerbation studies the asthma exacerbation rate was higher in adolescents treated with reslizumab than placebo: rate 2.86 (95% CI 1.02 to 8.09) in 14 treated patients against 1.37 (95% CI 0.57 to 3.28) in 11 placebo patients, rate ratio 2.09 (95% CI 0.82 to 5.36). Fourteen against eleven patients is far too small to establish harm, and the confidence interval crosses one. It is still a directional signal running opposite to the adult result in the same trials, and the regulator drew a licensing line at it. Mepolizumab and benralizumab are both licensed from age 6.',
        evidenceSource:
          'CINQAIR (reslizumab) United States prescribing information, Use in Specific Populations section 8.4 (BLA 761033)',
        measuredMetric:
          'Asthma exacerbation rate in patients aged 12 to under 18 in the two pivotal 52-week trials',
        auditFlag: 'caution',
      },
      {
        id: 'res-a4',
        category: 'failed',
        title: 'The subcutaneous version failed both trials meant to save it',
        laymanSummary:
          'Every competitor is an injection. Two phase 3 trials tested a fixed-dose subcutaneous reslizumab so it could be one too. Neither worked: attacks were not significantly reduced, and steroid doses did not come down.',
        technicalDetails:
          'Two randomised, double-blind, placebo-controlled phase 3 studies tested subcutaneous reslizumab 110 mg every 4 weeks. Study 1 randomised 468 patients with uncontrolled severe asthma, at least two exacerbations in the previous year and blood eosinophils of at least 300 cells per microlitre, for 52 weeks. There was no significant difference in exacerbation rate against placebo in the intention-to-treat population: rate ratio 0.79 (95% CI 0.56 to 1.12, p=0.19). A reduction appeared in the subgroup at or above 400 cells per microlitre (0.64, 95% CI 0.43 to 0.95). Study 2 randomised 177 patients on daily maintenance oral corticosteroids for 24 weeks and found no difference in categorised percentage reduction in daily oral corticosteroid dose: odds ratio 1.23 (95% CI 0.70 to 2.16, p=0.47). Higher trough serum reslizumab concentrations were associated with greater reduction in exacerbation risk (p=0.0035), which is the clearest reading of the failure — a fixed 110 mg dose does not reach the exposure a weight-based 3 mg/kg infusion does. Reslizumab remains an infusion, and remains the least prescribed drug in its class.',
        evidenceSource:
          'Bernstein JA et al., Lancet Respir Med 2020;8:461-474, NCT02452190 and NCT02501629',
        doi: '10.1016/S2213-2600(19)30372-8',
        measuredMetric:
          'Exacerbation frequency over 52 weeks and categorised oral corticosteroid dose reduction over 24 weeks, fixed-dose subcutaneous 110 mg against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'res-a5',
        category: 'measured',
        title: 'A boxed warning for anaphylaxis, and it can arrive at the second dose',
        laymanSummary:
          'Three patients in the placebo-controlled programme had anaphylaxis — 0.3%. It happened during or within twenty minutes of the drip, in one case as early as the second dose, and all three had the drug stopped permanently.',
        technicalDetails:
          'The boxed warning records anaphylaxis in 0.3% of patients in placebo-controlled clinical studies, observed during or within 20 minutes of completion of the infusion and reported as early as the second dose. Manifestations included dyspnoea, decreased oxygen saturation, wheezing, vomiting and skin and mucosal involvement including urticaria. In all three cases reslizumab was discontinued. Serious adverse reactions occurring in more than one subject and more often on drug than placebo across the placebo-controlled studies consisted of anaphylaxis alone: 3 subjects against 0. The pivotal trial publication reports the same two events in its own safety section, noting both responded to standard treatment at the study centre and both patients were withdrawn. The label requires administration by a healthcare professional prepared to manage anaphylaxis and an appropriate observation period afterwards, which is the operational reason this drug cannot be self-administered and its competitors can.',
        evidenceSource:
          'CINQAIR (reslizumab) United States prescribing information, Boxed Warning, Warnings and Precautions 5.1 and Adverse Reactions 6.1 (BLA 761033); Castro M et al., Lancet Respir Med 2015;3:355-366',
        doi: '10.1016/S2213-2600(15)00042-9',
        measuredMetric:
          'Incidence of anaphylaxis in the pooled placebo-controlled asthma programme',
        auditFlag: 'caution',
      },
      {
        id: 'res-a6',
        category: 'inferred',
        title: 'A malignancy imbalance that is on the label and unexplained',
        laymanSummary:
          'Six of 1,028 patients on reslizumab had a cancer reported against two of 730 on placebo. The label says the tumours were of many different kinds with no pattern, and that most were diagnosed within six months of starting.',
        technicalDetails:
          'Section 5.3 records 6 of 1,028 (0.6%) patients receiving 3 mg/kg reslizumab in placebo-controlled studies with at least one malignant neoplasm reported, against 2 of 730 (0.3%) on placebo. The label states the observed malignancies were diverse in nature without clustering of any particular tissue type, and that the majority were diagnosed within less than six months of exposure. Both of those observations argue against a causal reading: a drug-caused solid tumour would not typically appear within six months, and a real carcinogenic effect would usually favour particular tissues. Four extra events across a thousand patients is also well within what chance produces. The imbalance nonetheless remains on the label, unexplained, and no post-marketing study has been published that resolves it in either direction. Neither mepolizumab nor benralizumab carries an equivalent warning.',
        evidenceSource:
          'CINQAIR (reslizumab) United States prescribing information, Warnings and Precautions section 5.3 (BLA 761033)',
        inferredClaim:
          'That the malignancy imbalance is a chance finding — the most probable reading, supported by the short latency and the absence of tissue clustering, and never confirmed by a study designed to test it',
        auditFlag: 'contested',
      },
      {
        id: 'res-a7',
        category: 'inferred',
        title: 'The steroid-sparing claim was never tested for this molecule',
        laymanSummary:
          'The main practical reason to give an expensive antibody is to get someone off steroid tablets. The label states that no clinical study has ever assessed whether reslizumab allows maintenance corticosteroid doses to be reduced.',
        technicalDetails:
          'Section 5.4 opens with the sentence: "No clinical studies have been conducted to assess reduction of maintenance corticosteroid dosages following administration of CINQAIR." Mepolizumab has SIRIUS and benralizumab has ZONDA, both dedicated randomised trials with steroid reduction as the primary endpoint, and both positive. The only randomised evidence bearing on the question for reslizumab is study 2 of the subcutaneous programme, which used a different route and a fixed dose and found no difference from placebo (odds ratio 1.23, 95% CI 0.70 to 2.16, p=0.47). Reslizumab is nevertheless routinely grouped with the other two as an oral corticosteroid-sparing biologic. That grouping is a class inference, and the label explicitly declines to make it.',
        evidenceSource:
          'CINQAIR (reslizumab) United States prescribing information, Warnings and Precautions section 5.4 (BLA 761033); Bernstein JA et al., Lancet Respir Med 2020;8:461-474',
        inferredClaim:
          'That reslizumab spares oral corticosteroids like the other anti-IL-5 agents — a class-level inference with no trial behind it for this molecule, and one negative trial by the subcutaneous route',
        auditFlag: 'contested',
      },
      {
        id: 'res-a8',
        category: 'inferred',
        title: 'The label does not claim to know the mechanism',
        laymanSummary:
          'Section 12.1 explains the interleukin-5 binding, the fall in eosinophils, and then says that the mechanism of reslizumab action in asthma has not been definitively established.',
        technicalDetails:
          'The mechanism paragraph states that reslizumab binds IL-5 with a dissociation constant of 81 pM, that IL-5 is the major cytokine responsible for eosinophil growth, differentiation, recruitment, activation and survival, and that by inhibiting IL-5 signalling reslizumab reduces the production and survival of eosinophils — "however, the mechanism of reslizumab action in asthma has not been definitively established." The same sentence appears, with the drug name changed, in the mepolizumab and benralizumab labels. Three antibodies, two different targets within one pathway, three regulatory statements declining to identify the causal step. The eosinophil count is the best available predictor of who responds. It has not been established as the mechanism by which the response occurs.',
        evidenceSource:
          'CINQAIR (reslizumab) United States prescribing information, Clinical Pharmacology section 12.1 (BLA 761033)',
        inferredClaim:
          'That reducing eosinophil numbers is the mechanism of clinical benefit — stated as unestablished in this label and in the labels of both competing molecules',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A drip, not an injection, dosed by your weight',
        laymanDesc:
          'Reslizumab goes in through a vein over twenty to fifty minutes, every four weeks, in a clinic. The volume is calculated from body weight, and someone able to treat anaphylaxis has to be present.',
        molecularDetail:
          'The label specifies 3 mg/kg once every 4 weeks by intravenous infusion over 20 to 50 minutes, never as a push or bolus, prepared by withdrawing the weight-based volume from 100 mg per 10 mL vials into 50 mL of 0.9% sodium chloride. A 10 mg/mL formulation cannot be delivered subcutaneously at a therapeutic dose, and the fixed-dose subcutaneous version that was developed to solve that failed both its phase 3 trials.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It neutralises the messenger in the bloodstream',
        laymanDesc:
          'The antibody binds interleukin-5 itself and holds it, so the message never reaches the eosinophil. The cell is never touched.',
        molecularDetail:
          'Binding to free IL-5 with a dissociation constant of 81 pM, blocking engagement of the alpha chain of the IL-5 receptor complex on the eosinophil surface. The IgG4 kappa subclass recruits effector function poorly by design, so unlike benralizumab this antibody marks nothing for destruction.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Eosinophil production and survival fall together',
        laymanDesc:
          'Without that one signal, fewer eosinophils are made in the bone marrow and the ones already in tissue stop being kept alive.',
        molecularDetail:
          'IL-5 drives eosinophil growth, differentiation, recruitment, activation and survival. Neutralising it reduces both marrow output and tissue persistence. Because the mechanism is cytokine sequestration rather than cell killing, depletion is substantial but incomplete — mean counts fall to about 55 cells per microlitre rather than to zero.',
        iconName: 'CircleSlash',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The count drops within days and returns four months after stopping',
        laymanDesc:
          'A fall is measurable two or three days after the first infusion, holds for a year without wearing off, and reverses about four months after the last dose.',
        molecularDetail:
          'The label records mean blood eosinophils of 696 cells per microlitre at baseline falling to 55 at week 52 (92% reduction) against 624 falling to 496 on placebo (21%). In a subset sampled at days 2 to 3, counts were 220 against 610. No tachyphylaxis was seen over 52 weeks. At 90-day follow-up, approximately 120 days after the last dose, counts had returned towards baseline at 480 cells per microlitre. Greater reductions were seen at higher serum reslizumab concentrations.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In eosinophil-high adults, attacks fall by half or more',
        laymanDesc:
          'Among adults with at least 400 eosinophils per microlitre and a history of attacks, the exacerbation rate fell to half in one pivotal trial and to 41% of placebo in the other.',
        molecularDetail:
          'Rate ratio 0.50 (95% CI 0.37 to 0.67) in study 1 and 0.41 (95% CI 0.28 to 0.59) in study 2, both p<0.0001, across 953 randomised patients over 52 weeks. These are the largest reductions reported by any anti-IL-5 agent, in the most tightly biomarker-restricted population any of them enrolled.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where it does nothing, and who it is not for',
        laymanDesc:
          'In people not selected by eosinophil count, lung function did not improve at all. In the 12-to-17-year-olds enrolled, attacks ran the wrong way, and the licence starts at 18.',
        molecularDetail:
          'Corren 2016: no significant FEV1 difference from placebo in the overall population at 16 weeks, and no significant improvement in the subgroup below 400 cells per microlitre. Label section 8.4: adolescent exacerbation rate 2.86 against 1.37, rate ratio 2.09 (95% CI 0.82 to 5.36), in 14 treated and 11 placebo patients. Section 5.4: no study has assessed maintenance corticosteroid reduction with this drug.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Castro study 1 (NCT01287039)',
        phase: 'Phase 3, randomised, double-blind, parallel-group, placebo-controlled',
        sampleSize: 489,
        primaryEndpoint:
          'Annual frequency of clinical asthma exacerbations over 52 weeks in patients with blood eosinophils of at least 400 cells per microlitre',
        endpointMet: true,
        statisticalPValue: 'Rate ratio 0.50 (95% CI 0.37 to 0.67), p<0.0001',
        unreportedAdverseSignals:
          'Two patients in the reslizumab group across the two trials had anaphylactic reactions and were withdrawn. Of 2,597 patients screened for the two trials, only 953 met the eosinophil entry criterion.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Castro study 2 (NCT01285323)',
        phase: 'Phase 3, randomised, double-blind, parallel-group, placebo-controlled',
        sampleSize: 464,
        primaryEndpoint:
          'Annual frequency of clinical asthma exacerbations over 52 weeks in patients with blood eosinophils of at least 400 cells per microlitre',
        endpointMet: true,
        statisticalPValue: 'Rate ratio 0.41 (95% CI 0.28 to 0.59), p<0.0001',
        unreportedAdverseSignals:
          'The duplicate design means these are two runs of the same protocol rather than an independent replication by a separate group; both were funded by Teva Branded Pharmaceutical Products R&D.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Corren lung function study (NCT01508936)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 492,
        primaryEndpoint:
          'Change in FEV1 from baseline to week 16 in patients with poorly controlled asthma across a broad range of blood eosinophil counts',
        endpointMet: false,
        statisticalPValue:
          'No significant difference in mean FEV1 change between reslizumab and placebo in the overall population, and no significant relationship between treatment, baseline eosinophils and FEV1 change',
        unreportedAdverseSignals:
          'The subgroup below 400 eosinophils per microlitre showed no significant FEV1 improvement. Benefit was confined to the subgroup at or above 400, which is a subgroup finding in a trial whose primary endpoint failed.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Subcutaneous reslizumab study 1 (NCT02452190)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 468,
        primaryEndpoint:
          'Frequency of asthma exacerbations over 52 weeks with fixed-dose subcutaneous reslizumab 110 mg every 4 weeks',
        endpointMet: false,
        statisticalPValue: 'Rate ratio 0.79 (95% CI 0.56 to 1.12), p=0.19 — not significant',
        unreportedAdverseSignals:
          'A reduction appeared only in the subgroup at or above 400 eosinophils per microlitre (0.64, 95% CI 0.43 to 0.95), and greater reductions tracked higher trough serum concentrations, indicating the fixed dose underexposed heavier patients.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Subcutaneous reslizumab study 2 (NCT02501629)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 177,
        primaryEndpoint:
          'Categorised percentage reduction in daily oral corticosteroid dose from baseline to weeks 20 to 24 in corticosteroid-dependent severe asthma',
        endpointMet: false,
        statisticalPValue:
          'Odds ratio for a lower category of oral corticosteroid use 1.23 (95% CI 0.70 to 2.16), p=0.47 — not significant',
        unreportedAdverseSignals:
          'This is the only randomised test of oral corticosteroid sparing ever conducted with reslizumab by any route, and it was negative. The label states no study has assessed maintenance corticosteroid reduction with the intravenous product.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Annual exacerbation rate ratios of 0.50 and 0.41 against placebo in two duplicate 52-week trials in 953 patients with blood eosinophils of at least 400 cells per microlitre, both p<0.0001',
        'Mean blood eosinophils reduced from 696 to 55 cells per microlitre at week 52, a 92% reduction, with no tachyphylaxis and reversal about 120 days after the last dose',
        'Anaphylaxis in 0.3% of patients in placebo-controlled studies, as early as the second dose',
        'Malignant neoplasm reported in 0.6% on reslizumab against 0.3% on placebo',
        'Adolescent exacerbation rate 2.86 against 1.37 on placebo, rate ratio 2.09, in 25 patients aged 12 to under 18',
      ],
      unsupportedInferences: [
        'That reslizumab spares oral corticosteroids, which the label states has never been studied and which the subcutaneous trial tested and failed',
        'That eosinophil reduction is the mechanism of clinical benefit, which the label states has not been definitively established',
        'That the exacerbation benefit extends to asthma unselected for eosinophil count, directly contradicted by the 16-week lung function trial',
        'That the largest numerical reduction in the class means the most effective drug in the class, when no head-to-head trial against mepolizumab or benralizumab exists',
      ],
      whatFailedInitially: [
        'The 16-week lung function trial missed its primary endpoint in the overall population and found nothing below 400 eosinophils per microlitre',
        'Fixed-dose subcutaneous reslizumab failed to reduce exacerbations (p=0.19) and failed to reduce oral corticosteroid dose (p=0.47) in two phase 3 trials',
        'Adolescents in the pivotal programme had a higher exacerbation rate on drug than on placebo, and the licence stops at 18',
        'Three cases of anaphylaxis produced a boxed warning that no other drug in the class carries',
      ],
      realWorldOutcome: [
        'Approved in the United States on 23 March 2016 under BLA 761033, the second anti-IL-5 antibody licensed for asthma',
        'The only one of the three restricted to adults, the only one requiring a clinic infusion, and the only one with a boxed warning',
        'The label carries an explicit limitation of use excluding all other eosinophilic conditions, while mepolizumab and benralizumab have both accumulated indications beyond asthma',
        'No CMS National Average Drug Acquisition Cost figure is published, because the product is administered in clinics rather than dispensed by retail pharmacies',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of 3 mg/kg once every 4 weeks, given over 20 to 50 minutes, never as a push or bolus',
      description:
        'Supplied as 100 mg in 10 mL single-use vials at 10 mg/mL in acetate and sucrose at pH 5.5. The weight-based volume is withdrawn and dispensed slowly into 50 mL of 0.9% sodium chloride to minimise foaming, and administered immediately or held at 2 to 8 degrees Celsius for up to 16 hours. The label notes that because reslizumab is a protein, translucent to white amorphous proteinaceous particles may be present in the vial. Blood eosinophil counts return towards baseline approximately 120 days after the last dose.',
      safetyProfile:
        'Carries a boxed warning for anaphylaxis, observed in 0.3% of patients in placebo-controlled studies during or within 20 minutes of the infusion and reported as early as the second dose, with permanent discontinuation directed if it occurs. Contraindicated in patients with known hypersensitivity to reslizumab or its excipients. A malignancy imbalance of 0.6% against 0.3% on placebo is recorded in section 5.3, diverse in tissue type and mostly diagnosed within six months of exposure. Systemic and inhaled corticosteroids must not be stopped abruptly, and no study has assessed maintenance corticosteroid reduction with this drug. Pre-existing helminth infections should be treated before therapy. The most common adverse reaction at an incidence of 2% or greater is oropharyngeal pain. It must not be used for acute asthma symptoms, acute bronchospasm or status asthmaticus, and is not indicated for any eosinophilic condition other than asthma.',
    },
    commonQuestions: [
      {
        q: 'If it works better than the others, why does almost nobody get it?',
        a: 'Because the numbers on the primary endpoint are not the whole product. Reslizumab’s two pivotal trials reported rate ratios of 0.50 and 0.41, the largest reductions any anti-IL-5 agent has published. But it is a weight-based drip that takes twenty to fifty minutes in a clinic every four weeks, it carries a boxed warning for anaphylaxis that requires a healthcare professional present who can treat it, its licence stops at 18, and no trial has ever tested whether it lets you come off steroid tablets. Mepolizumab and benralizumab are injections you can be taught to give at home, with steroid-sparing trials and paediatric licences. Teva ran two phase 3 trials of a subcutaneous version to close that gap and both failed.',
        auditNote:
          'The cross-trial comparison that makes reslizumab look strongest is also the weakest kind of comparison. Different populations and different eosinophil thresholds — 400 here, 300 or 150 elsewhere — make the rate ratios non-comparable.',
      },
      {
        q: 'How likely is the anaphylaxis, really?',
        a: 'Three patients out of 1,131 exposed in the placebo-controlled studies, which the label rounds to 0.3%. All three episodes happened during or within twenty minutes of the infusion, one of them at the second dose rather than the first, and all three patients had the drug stopped permanently. Symptoms included breathlessness, falling oxygen levels, wheeze, vomiting and urticaria. That is a low rate in absolute terms and high enough that the FDA required a boxed warning and an observation period. The practical consequence for you is that this is a clinic drug: it cannot be given at home, and the second dose deserves the same caution as the first.',
      },
      {
        q: 'Why is it not licensed for teenagers?',
        a: 'Because of what happened to the teenagers in the trials. Thirty-nine patients aged 12 to under 18 were enrolled across the pivotal studies. In the two 52-week exacerbation trials, the adolescents on reslizumab had an exacerbation rate of 2.86 a year against 1.37 on placebo — a rate ratio of 2.09, running in the opposite direction to the adult result from the same trials. That is 14 patients against 11, far too few to establish that the drug harmed them, and the confidence interval crosses one. But it is the only signal available in that age group, and the regulator drew the line at 18. Mepolizumab and benralizumab are both licensed from age 6.',
        auditNote:
          'An underpowered signal is not evidence of harm. It is also not evidence of safety, and the label treats it as the absence of established effectiveness rather than as a demonstrated risk.',
      },
      {
        q: 'Will it get me off my prednisolone?',
        a: 'Nobody knows, and the label says so in section 5.4: no clinical studies have been conducted to assess reduction of maintenance corticosteroid dosages following administration of this drug. That is unusual. Mepolizumab has SIRIUS and benralizumab has ZONDA, both randomised trials with steroid reduction as the primary endpoint, both positive. The one randomised test that bears on the question for reslizumab used the subcutaneous formulation at a fixed dose and found no difference from placebo. If getting off steroid tablets is your main goal, that gap is a reason to ask about the alternatives.',
      },
      {
        q: 'Should I worry about the cancer warning?',
        a: 'It is worth understanding rather than worrying about. In the placebo-controlled trials, six of 1,028 patients on reslizumab had a malignancy reported against two of 730 on placebo — 0.6% against 0.3%. The label itself records two things that argue against the drug causing them: the tumours were of many different kinds with no clustering by tissue, and most were diagnosed within less than six months of first exposure, which is far too fast for a drug-induced solid tumour. Four extra events in a thousand people is also comfortably inside what chance produces. It remains on the label because the imbalance was real in the data, and no study since has been designed to settle it. Neither of the competing antibodies carries an equivalent warning.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Castro M, Zangrilli J, Wechsler ME, et al. Reslizumab for inadequately controlled asthma with elevated blood eosinophil counts: results from two multicentre, parallel, double-blind, randomised, placebo-controlled, phase 3 trials. Lancet Respir Med 2015;3:355-366',
        identifier: '10.1016/S2213-2600(15)00042-9',
        kind: 'doi',
      },
      {
        label:
          'Corren J, Weinstein S, Janka L, Zangrilli J, Garin M. Phase 3 study of reslizumab in patients with poorly controlled asthma: effects across a broad range of eosinophil counts. Chest 2016;150:799-810',
        identifier: '10.1016/j.chest.2016.03.018',
        kind: 'doi',
      },
      {
        label:
          'Bernstein JA, Virchow JC, Murphy K, et al. Effect of fixed-dose subcutaneous reslizumab on asthma exacerbations in patients with severe uncontrolled asthma and corticosteroid sparing in patients with oral corticosteroid-dependent asthma: results from two phase 3, randomised, double-blind, placebo-controlled trials. Lancet Respir Med 2020;8:461-474',
        identifier: '10.1016/S2213-2600(19)30372-8',
        kind: 'doi',
      },
      {
        label: 'Reslizumab pivotal exacerbation trial, study 1',
        identifier: 'NCT01287039',
        kind: 'nct',
      },
      {
        label:
          'Reslizumab in patients with poorly controlled asthma across a broad range of eosinophil counts',
        identifier: 'NCT01508936',
        kind: 'nct',
      },
      {
        label: 'Fixed-dose subcutaneous reslizumab in severe uncontrolled asthma, study 1',
        identifier: 'NCT02452190',
        kind: 'nct',
      },
      {
        label:
          'CINQAIR (reslizumab) United States prescribing information — Boxed Warning, Indications 1, Dosage 2.1 and 2.2, Contraindications 4, Warnings and Precautions 5.1 to 5.5, Adverse Reactions 6.1, Use in Specific Populations 8.4, Description 11, Clinical Pharmacology 12.1 and 12.2 (BLA 761033)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22CINQAIR%22',
        kind: 'regulatory',
      },
      {
        label:
          'Institute for Clinical and Economic Review. Biologic Therapies for Treatment of Asthma Associated with Type 2 Inflammation: Effectiveness, Value, and Value-Based Price Benchmarks. Final Evidence Report, 20 December 2018',
        identifier: 'https://icer.org/assessment/asthma-2018/',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Zafirlukast — the first leukotriene blocker licensed in the United States, beaten on every
  //    endpoint by a low-dose inhaled steroid in a head-to-head trial, and carrying a liver failure
  //    warning whose own monitoring advice the label says does not work.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zafirlukast',
    name: 'Zafirlukast',
    tradeName: 'Accolate',
    sponsor:
      'Strides Pharma International (current generic holder); originated at Zeneca, approved under NDA 020547',
    targetGene: 'CYSLTR1',
    targetProtein:
      'Cysteinyl leukotriene receptor 1, antagonised competitively against leukotriene D4 and E4 — components of what used to be called slow-reacting substance of anaphylaxis',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Prophylaxis and chronic treatment of asthma in adults and children 5 years of age and older. The label states explicitly that it is not indicated for the reversal of bronchospasm in acute asthma attacks, including status asthmaticus',
    patientFriendlyIndication:
      'Asthma, taken every day to prevent symptoms rather than to relieve them',
    anatomicalSite:
      'Cysteinyl leukotriene receptor 1 on airway smooth muscle, bronchial vasculature and inflammatory cells',
    conditionContext: {
      conditionExplainer:
        'Leukotrienes are inflammatory messengers released by mast cells and eosinophils in the airway. They constrict smooth muscle, leak fluid into the airway wall and recruit more inflammatory cells. Asthmatic airways are between 25 and 100 times more sensitive to inhaled leukotriene D4 than non-asthmatic ones, which is the observation the entire drug class was built on.',
      whyItMatters:
        'Zafirlukast was the first drug in the United States to block that receptor, approved in 1996 and marketed as an oral alternative to inhaled steroids. Sixty-five randomised trials later, the class as monotherapy is measurably worse than a low-dose inhaled corticosteroid on nearly every endpoint that has been compared, and zafirlukast specifically lost a head-to-head trial against 88 micrograms of fluticasone on lung function, symptom-free days, rescue use and night-time waking.',
      whoTakesThis:
        'Adults and children from 5 years old with asthma, as prophylaxis rather than relief. In practice it is prescribed far less than montelukast, which is once daily, has no food restriction and no liver failure warning.',
      clinicalGoals:
        'Fewer symptoms and less rescue inhaler use over weeks. Not relief of an attack: the label states the drug is not a bronchodilator and is not for acute episodes, although therapy can be continued through an exacerbation.',
    },
    oneSentenceVerdict:
      'The first cysteinyl leukotriene receptor antagonist licensed in the United States, which in a 451-patient head-to-head trial raised morning FEV1 by 0.20 L against 0.42 L for a low dose of inhaled fluticasone (p<0.001) and produced 15.6% symptom-free days against 28.5%, and which carries warnings for fulminant hepatitis, liver transplantation and death alongside a monitoring recommendation the label concedes has not been shown to prevent serious injury.',
    laymanHowItWorks:
      'When an asthmatic airway is irritated, immune cells release chemicals called leukotrienes that squeeze the muscle around the airway shut, make the lining leak and swell, and call in more inflammatory cells. Zafirlukast blocks the receptor those chemicals dock onto, so the message is never received. It is a tablet taken twice a day, and it prevents rather than relieves — it does nothing for an attack already under way. Food cuts how much of it gets into the blood by about 40%, so it has to be taken an hour before or two hours after eating.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.6436 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 10 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 26 September 1996 under NDA 020547 as the first leukotriene receptor antagonist licensed there, and generic for many years. Only ten products are listed in the acquisition cost survey — a small number for a molecule this old, and a fair measure of how far the market moved to montelukast.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Two comparisons matter here and they point in different directions. Against an inhaled corticosteroid, zafirlukast and its whole class come off worse — a Cochrane review of 65 trials in over 13,000 patients found 51% more exacerbations requiring systemic steroids on anti-leukotriene monotherapy. Against montelukast, the other oral leukotriene blocker, zafirlukast has no demonstrated efficacy advantage and three practical disadvantages: twice-daily dosing, a food restriction, and a hepatotoxicity warning montelukast does not carry.',
      conventionalRx: [
        {
          name: 'Inhaled fluticasone, budesonide or beclomethasone',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'Directly compared in a 451-patient randomised double-blind trial: fluticasone 88 micrograms twice daily raised morning FEV1 by 0.42 L against 0.20 L for zafirlukast 20 mg twice daily (p<0.001), morning peak flow by 49.9 L/min against 11.7 L/min (p<0.001), symptom-free days by 28.5% against 15.6% (p<0.001) and nights without waking by 21.2% against 8.0% (p<0.001). Every endpoint favoured the steroid, and the differences appeared by week 2 to 4.',
          typicalCost:
            'Generic inhaled corticosteroids are widely available, though inhaler acquisition costs vary far more than tablet costs',
          prosAndCons:
            'Pros: superior on every measured endpoint, and the anchor of every asthma guideline. Cons: inhaler technique matters, local side effects include oral thrush and hoarseness, and high doses carry systemic effects a tablet at this dose does not.',
        },
        {
          name: 'Montelukast (Singulair)',
          class: 'Cysteinyl leukotriene receptor 1 antagonist',
          howItCompares:
            'The same receptor, once daily instead of twice, with no requirement to separate it from food and no hepatotoxicity warning. It is the reason zafirlukast is now rarely prescribed. The trade-off runs the other way on neuropsychiatric risk: in March 2020 the FDA required a boxed warning on montelukast for serious neuropsychiatric events including suicidal thoughts and behaviour, and that label now reserves its use in allergic rhinitis for patients with an inadequate response or intolerance to alternative therapies. Zafirlukast carries the same signal as a precaution rather than a boxed warning.',
          typicalCost:
            'Generic and among the cheaper asthma controllers at pharmacy acquisition cost',
          prosAndCons:
            'Pros: once daily, food-independent, no liver failure warning, licensed from 12 months of age. Cons: a boxed warning for neuropsychiatric events and a restricted allergic rhinitis indication, neither of which zafirlukast has.',
        },
        {
          name: 'Zileuton (Zyflo)',
          class: '5-lipoxygenase inhibitor',
          howItCompares:
            'Blocks the enzyme that makes leukotrienes rather than the receptor they act on, so it suppresses the whole cysteinyl leukotriene family plus leukotriene B4. It is dosed four times daily in the immediate-release form and requires scheduled liver function monitoring, which is why it is the least used of the three.',
          typicalCost: 'Generic, though far fewer products are listed than for montelukast',
          prosAndCons:
            'Pros: broader pathway blockade, and the only one of the three that acts on the enzyme. Cons: mandated transaminase monitoring, a heavier dosing burden, and a theophylline interaction.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Take it on an empty stomach, and mean it',
          action: 'At least one hour before a meal or two hours after one, twice a day.',
          patientImpact:
            'The label reports that in two separate studies, one with a high-fat meal and one with a high-protein meal, taking zafirlukast with food reduced mean bioavailability by approximately 40%. A twice-daily tablet that must be separated from every meal is a genuine adherence problem, and taking it with breakfast turns a full dose into roughly a half dose.',
          clinicalPrecaution:
            'This instruction appears in the dosage section, not the fine print. The 40% figure is a measured pharmacokinetic result, not an estimate.',
        },
        {
          name: 'Learn the liver symptoms before you start',
          action:
            'Right upper abdominal pain, nausea, unusual tiredness, itching, yellow eyes or skin, flu-like symptoms, loss of appetite — report any of them immediately.',
          patientImpact:
            'The label states that cases of life-threatening hepatic failure have been reported, and that in rare cases patients have presented with fulminant hepatitis or progressed to hepatic failure, liver transplantation and death. In extremely rare post-marketing cases, no clinical signs preceded those outcomes. Reported hepatic events have occurred predominantly in women.',
          clinicalPrecaution:
            'The label says that periodic serum transaminase testing has not proven to prevent serious injury, and that physicians "may consider" its value. If liver function tests are consistent with hepatic dysfunction, therapy should not be resumed, and patients withdrawn for hepatic dysfunction with no other cause should never be re-exposed.',
        },
        {
          name: 'If you take warfarin, say so before the first tablet',
          action: 'Ask for prothrombin time monitoring when zafirlukast is started or stopped.',
          patientImpact:
            'In a study of 16 healthy male volunteers, zafirlukast at steady state raised the mean AUC of S-warfarin by 63% and its half-life by 36%, and prothrombin time rose by approximately 35%. The label attributes this to inhibition of CYP2C9.',
          clinicalPrecaution:
            'No formal interaction studies exist for other CYP2C9 substrates such as tolbutamide, phenytoin and carbamazepine, and the label directs that care be exercised with all of them. Fluconazole raises zafirlukast levels by about 58% and aspirin by about 45%, while erythromycin lowers them by about 40%.',
        },
        {
          name: 'Report mood or sleep changes',
          action:
            'Tell the prescriber about new insomnia, low mood, agitation or unusual thoughts in anyone taking it, including children.',
          patientImpact:
            'The label records neuropsychiatric events in adult, adolescent and paediatric patients, with post-marketing reports of insomnia and depression, and states that the clinical details of some of those reports appear consistent with a drug-induced effect.',
          clinicalPrecaution:
            'The label directs prescribers to carefully evaluate the risks and benefits of continuing treatment if such events occur. Montelukast, the same receptor at the same target, carries a boxed warning for this.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=CC=CC=C1S(=O)(=O)NC(=O)C2=CC(=C(C=C2)CC3=CN(C4=C3C=C(C=C4)NC(=O)OC5CCCC5)C)OC',
      chemicalFormula: 'C31H33N3O6S',
      molecularWeight: '575.70 g/mol',
      targetReceptorAffinity:
        'Selective competitive antagonist of the leukotriene D4 and E4 receptor. In vitro it antagonises the contractile activity of LTC4, LTD4 and LTE4 in conducting airway smooth muscle from animals and humans. More than 99% bound to plasma protein, predominantly albumin, with an apparent steady-state volume of distribution near 70 L. Rat studies with radiolabelled drug indicate minimal distribution across the blood-brain barrier. Identified plasma metabolites are at least 90-fold less potent at the receptor than the parent.',
      structureSource: {
        label:
          'PubChem CID 5717 (zafirlukast) — canonical SMILES, molecular formula and weight, as carried on the enriched record; pharmacology from the zafirlukast United States prescribing information, Clinical Pharmacology section',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5717',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zaf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identify the acylsulfonamide and confirm the carbamate has not hydrolysed',
          description:
            'Zafirlukast carries an acylsulfonamide as its acidic head group and a cyclopentyl carbamate on the indole ring. The carbamate is the hydrolytically vulnerable feature: losing it gives a free aromatic amine, a class of impurity that must be controlled at low limits. Both groups must be confirmed intact on incoming material.',
          reagentsAndBuffer:
            'Reference standard, reversed-phase HPLC with photodiode array and mass detection, proton and carbon NMR in deuterated dimethyl sulfoxide, Karl Fischer titration for water content, forced degradation under acid, base and oxidative stress',
        },
        {
          id: 'zaf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the N-methylindole and couple it to the methoxybenzoyl sulfonamide',
          description:
            'The molecule is a 3-substituted N-methylindole bearing a cyclopentyl carbamate at position 5, joined by a methylene bridge to a methoxy-substituted benzoyl group which is capped as an ortho-toluenesulfonyl acylsulfonamide. The acylsulfonamide is formed last, because it is the acidic handle that makes purification of earlier intermediates awkward.',
          dependsOnStepId: 'zaf-w1',
          reagentsAndBuffer:
            'Substituted indole precursor, cyclopentyl chloroformate for carbamate formation, coupling reagent for the acylsulfonamide bond with ortho-toluenesulfonamide, anhydrous aprotic solvent under nitrogen',
        },
        {
          id: 'zaf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise and control the aromatic amine impurity',
          description:
            'Crystallise from an alcohol or acetone system and release against a specification that names the carbamate-hydrolysis product explicitly. With a lipophilic molecule of this class — calculated logP above 6 — the polymorph and particle size also govern dissolution, and a poorly dissolving lot compounds a bioavailability that food already cuts by 40%.',
          dependsOnStepId: 'zaf-w2',
          reagentsAndBuffer:
            'Recrystallisation from ethanol or acetone-water, X-ray powder diffraction for polymorph identity, laser diffraction particle size, HPLC release against named impurity limits',
        },
        {
          id: 'zaf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Competitive antagonism at the human receptor, against LTD4 and LTE4 separately',
          description:
            'The label claims antagonism of LTD4 and LTE4 specifically. Testing against LTD4 alone reports the easier of the two: LTE4 is the longer-lived metabolite and the one that persists in the airway. A functional assay in a cell expressing the human receptor measures what a binding assay cannot, which is whether antagonism is surmountable at physiological agonist concentrations.',
          dependsOnStepId: 'zaf-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells stably expressing human CYSLTR1, LTD4 and LTE4 as separate agonists across a concentration range, calcium mobilisation or inositol phosphate accumulation readout, Schild analysis to confirm competitive antagonism',
        },
        {
          id: 'zaf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Screen for CYP2C9 inhibition before anything else',
          description:
            'The clinically important property of this molecule outside the airway is enzyme inhibition. A 63% rise in S-warfarin exposure and a 35% rise in prothrombin time is a measured human result attributed to CYP2C9 inhibition, and the label notes that no formal studies have been done with the other CYP2C9 substrates people actually take. A recombinant enzyme panel run early would have predicted the interaction the clinical study found.',
          dependsOnStepId: 'zaf-w4',
          reagentsAndBuffer:
            'Human liver microsomes and recombinant CYP2C9, diclofenac 4-hydroxylation or tolbutamide hydroxylation as probe reaction, LC-MS/MS quantification, time-dependent inhibition arm to distinguish reversible from mechanism-based inhibition',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zaf-a1',
        category: 'failed',
        title: 'Beaten by a low dose of an inhaled steroid on every endpoint measured',
        laymanSummary:
          'A 451-patient randomised trial put zafirlukast directly against 88 micrograms of inhaled fluticasone twice daily. The steroid won on lung function, peak flow, symptom-free days, rescue inhaler use and nights without waking. Not one endpoint favoured the tablet.',
        technicalDetails:
          'Bleecker et al. ran a 12-week randomised, double-blind, double-dummy, multicentre trial in 451 patients aged 12 and over who were symptomatic on short-acting beta-2 agonists alone, comparing fluticasone propionate 88 micrograms twice daily with zafirlukast 20 mg twice daily. Morning FEV1 rose 0.42 L against 0.20 L (p<0.001), morning peak expiratory flow 49.94 L/min against 11.68 L/min (p<0.001), evening peak flow 38.91 L/min against 10.50 L/min (p<0.001). Symptom-free days rose 28.5 percentage points against 15.6 (p<0.001), rescue-free days 40.4 against 24.2 (p<0.001), nights without awakening 21.2 against 8.0 (p<0.001), and albuterol use fell by 2.39 puffs a day against 1.45 (p<0.001). Differences in FEV1 were significant at the first observation, week 4, and in peak flow by week 2. The published conclusion is that low-dose fluticasone as first-line therapy is superior to zafirlukast.',
        evidenceSource:
          'Bleecker ER, Welch MJ, Weinstein SF, et al. Low-dose inhaled fluticasone propionate versus oral zafirlukast in the treatment of persistent asthma. J Allergy Clin Immunol 2000;105:1123-1129',
        doi: '10.1067/mai.2000.106043',
        measuredMetric:
          'Morning FEV1, peak expiratory flow, symptom-free days, rescue-free days, nocturnal awakenings and rescue beta-agonist use over 12 weeks against inhaled fluticasone',
        auditFlag: 'caution',
      },
      {
        id: 'zaf-a2',
        category: 'conclusion_shift',
        title: 'The class was positioned as an alternative to inhaled steroids, and is not one',
        laymanSummary:
          'Sixty-five randomised trials in more than thirteen thousand people were pooled in 2012. People on leukotriene tablets instead of an inhaled steroid were 51% more likely to need a course of oral steroids for an attack, and more than three times as likely to end up in hospital.',
        technicalDetails:
          'The Cochrane review by Chauhan and Ducharme included 65 trials, of which 56 contributed data covering 10,005 adults and 3,333 children, all with mild or moderate persistent asthma, comparing anti-leukotrienes with inhaled corticosteroids as monotherapy for at least four weeks. Patients on anti-leukotrienes were more likely to suffer an exacerbation requiring systemic corticosteroids: risk ratio 1.51 (95% CI 1.17 to 1.96) across 6,077 participants, a number needed to harm of 28 (95% CI 15 to 82). Exacerbations requiring hospital admission gave a risk ratio of 3.33 (95% CI 1.02 to 10.94) across 2,715 participants. Change from baseline FEV1 favoured inhaled corticosteroids by 110 mL across 7,128 participants. Withdrawals for poor asthma control were 2.56 times as likely (95% CI 2.01 to 3.27). The effect was significantly larger in moderate than in mild airway obstruction (RR 2.03 against 1.25), and was not modified by which anti-leukotriene was used, by age group, by trial duration, by methodological quality or by funding source.',
        evidenceSource:
          'Chauhan BF, Ducharme FM. Anti-leukotriene agents compared to inhaled corticosteroids in the management of recurrent and/or chronic asthma in adults and children. Cochrane Database Syst Rev 2012;5:CD002314',
        doi: '10.1002/14651858.CD002314.pub3',
        measuredMetric:
          'Exacerbations requiring systemic corticosteroids, hospital admissions, FEV1 change and withdrawals for poor control, anti-leukotriene monotherapy against inhaled corticosteroid monotherapy',
        auditFlag: 'verified',
      },
      {
        id: 'zaf-a3',
        category: 'failed',
        title:
          'Liver failure, transplantation and death — and monitoring that does not prevent them',
        laymanSummary:
          'The label reports life-threatening liver failure in people taking the ordinary dose. In rare cases patients went to fulminant hepatitis, liver transplant and death, sometimes with no warning symptoms at all. The label also says that routine blood monitoring has not been shown to prevent this.',
        technicalDetails:
          'The Warnings section states that cases of life-threatening hepatic failure have been reported, and that liver injury without other attributable cause has been reported from post-marketing surveillance at the recommended 40 mg/day dose. In most but not all reports symptoms abated and enzymes normalised after stopping. In rare cases patients presented with fulminant hepatitis or progressed to hepatic failure, liver transplantation and death, and in extremely rare cases no clinical symptoms or signs of liver dysfunction preceded those outcomes. The adverse reactions section adds that these hepatic events have occurred predominantly in females. On monitoring, the label reads: "Periodic serum transaminase testing has not proven to prevent serious injury but it is generally believed that early detection of drug-induced hepatic injury along with immediate withdrawal of the suspect drug enhances the likelihood for recovery." It says physicians "may consider" the value of liver function testing rather than requiring it. A safety measure that the label states has not been proven to work, offered as optional, is the whole risk-management strategy for the most serious harm this drug causes.',
        evidenceSource:
          'Zafirlukast United States prescribing information — Warnings, Hepatotoxicity; Precautions, Information for Patients; Adverse Reactions (NDA 020547)',
        measuredMetric:
          'Post-marketing hepatic failure, transplantation and death at the recommended dose, and the stated efficacy of transaminase monitoring in preventing them',
        auditFlag: 'caution',
      },
      {
        id: 'zaf-a4',
        category: 'inferred',
        title: 'Churg-Strauss syndrome: neither excluded nor established, for twenty-five years',
        laymanSummary:
          'Some people on leukotriene blockers develop an eosinophilic vasculitis. The usual explanation is that the tablet let them come off oral steroids, which unmasked a disease that was already there. The label says the association with the drug can neither be excluded nor established.',
        technicalDetails:
          'The Precautions section records that in rare cases patients with asthma on zafirlukast may present with systemic eosinophilia, eosinophilic pneumonia, or clinical features of vasculitis consistent with Churg-Strauss syndrome — now called eosinophilic granulomatosis with polyangiitis — and directs physicians to be alert to eosinophilia, vasculitic rash, worsening pulmonary symptoms, cardiac complications and neuropathy. It states that these events have usually, but not always, been associated with reductions or withdrawal of steroid therapy, and then: "The possibility that zafirlukast may be associated with emergence of Churg-Strauss syndrome can neither be excluded nor established." The unmasking explanation is the field’s consensus and it is an inference, not a finding: the words "but not always" are doing considerable work, and no study has ever been designed to separate unmasking from causation. Twenty-five years after the warning first appeared, the label states the same uncertainty.',
        evidenceSource:
          'Zafirlukast United States prescribing information — Precautions, Eosinophilic Conditions; Adverse Reactions (NDA 020547)',
        inferredClaim:
          'That the eosinophilic vasculitis seen on leukotriene antagonists is unmasked by steroid withdrawal rather than caused by the drug — the standard explanation, which the label declines to endorse or reject',
        auditFlag: 'contested',
      },
      {
        id: 'zaf-a5',
        category: 'measured',
        title:
          'A 63% rise in warfarin exposure, from a drug nobody thinks of as an interacting one',
        laymanSummary:
          'In sixteen healthy volunteers, adding zafirlukast raised blood levels of the active half of warfarin by 63% and lengthened prothrombin time by about 35%. It is a straightforward enzyme inhibition, and it is easy to miss because an asthma tablet is not where anticoagulation problems are expected to come from.',
        technicalDetails:
          'Coadministration of zafirlukast 160 mg/day to steady state with a single 25 mg dose of warfarin in 16 healthy male volunteers raised the mean AUC of S-warfarin by 63% and its half-life by 36%, with a mean prothrombin time increase of approximately 35%. The label attributes this to inhibition of CYP2C9 and directs close prothrombin time monitoring with dose adjustment. It also states that no formal drug-drug interaction studies have been conducted with other CYP2C9 substrates such as tolbutamide, phenytoin and carbamazepine, and that care should be exercised with all of them. In the other direction, fluconazole raises zafirlukast exposure by about 58% (90% CI 28 to 95), aspirin at 650 mg four times daily by about 45%, and erythromycin lowers it by about 40%. The study dose here was 160 mg/day, four times the licensed 40 mg/day, which is a real limitation on how the magnitude transfers to ordinary use.',
        evidenceSource:
          'Zafirlukast United States prescribing information — Warnings, Concomitant Warfarin Administration; Precautions, Drug Interactions (NDA 020547)',
        measuredMetric:
          'S-warfarin AUC, half-life and prothrombin time with and without steady-state zafirlukast in 16 healthy volunteers',
        auditFlag: 'caution',
      },
      {
        id: 'zaf-a6',
        category: 'inferred',
        title: 'The same neuropsychiatric signal, boxed on one drug and not on this one',
        laymanSummary:
          'In March 2020 the FDA put a boxed warning on montelukast for serious mental health effects including suicidal thoughts and behaviour, and its label now says to reserve it for hay fever patients who cannot use or have not responded to the alternatives. Zafirlukast blocks the same receptor and its label carries the same events as an ordinary precaution.',
        technicalDetails:
          'The zafirlukast label records neuropsychiatric events in adult, adolescent and paediatric patients, with post-marketing reports of insomnia and depression, and states that the clinical details of some of those reports appear consistent with a drug-induced effect. It directs prescribers to weigh risks and benefits of continuing treatment. The FDA’s March 2020 action applied a boxed warning to montelukast alone. That warning is on the montelukast label today and reads: serious neuropsychiatric events have been reported, including agitation, aggression, depression, sleep disturbances and suicidal thoughts and behaviour including suicide; the mechanisms are not well understood; and use should be reserved, in allergic rhinitis, for patients with an inadequate response or intolerance to alternative therapies. The asymmetry has a defensible explanation — montelukast is prescribed to vastly more people, including very young children, and generates correspondingly more reports — and it is still an asymmetry. A class signal has been formally acted on for one member of the class and left as a precaution for another with the same target. Whether zafirlukast is safer or merely less observed is not established by the difference in labelling.',
        evidenceSource:
          'Zafirlukast United States prescribing information — Precautions, Neuropsychiatric Events (NDA 020547); montelukast sodium United States prescribing information, Boxed Warning: Serious Neuropsychiatric Events',
        inferredClaim:
          'That zafirlukast carries less neuropsychiatric risk than montelukast — inferred from the difference in labelling, not from any comparative study',
        auditFlag: 'contested',
      },
      {
        id: 'zaf-a7',
        category: 'failed',
        title: 'Food removes 40% of the dose, twice a day, for life',
        laymanSummary:
          'Two separate studies found that taking zafirlukast with a meal cut how much reached the bloodstream by about 40%. The instruction is an hour before or two hours after eating, twice daily — a schedule most people cannot keep.',
        technicalDetails:
          'The label states that in two separate studies, one using a high-fat and the other a high-protein meal, administration with food reduced mean bioavailability by approximately 40%, and the dosage section opens with the instruction to take it at least 1 hour before or 2 hours after meals. Absolute bioavailability is unknown. Zafirlukast is more than 99% protein bound with a calculated logP above 6, so absorption is dissolution-limited and food effects of this size are unsurprising for the chemistry. The consequence is practical rather than pharmacological: a drug taken twice daily around meals, in a condition where the comparator is a once-daily tablet or a twice-daily inhaler, loses on adherence before it is compared on efficacy. This is a substantial part of why zafirlukast lost its market to montelukast without ever losing a head-to-head efficacy trial to it.',
        evidenceSource:
          'Zafirlukast United States prescribing information — Dosage and Administration; Clinical Pharmacology, Absorption (NDA 020547)',
        measuredMetric: 'Mean bioavailability with and without a high-fat or high-protein meal',
        auditFlag: 'caution',
      },
      {
        id: 'zaf-a8',
        category: 'inferred',
        title: 'An infection signal in the over-55s, dose-proportional and unexplained',
        laymanSummary:
          'In the trials, patients over 55 on zafirlukast reported more infections than those on placebo. The rate rose with total drug exposure and was associated with taking inhaled steroids at the same time. The label says the clinical significance is unknown.',
        technicalDetails:
          'The Adverse Reactions section records that in clinical trials an increased proportion of zafirlukast patients over the age of 55 reported infections compared with placebo, that a similar finding was not observed in other age groups, that the infections were mostly mild or moderate and predominantly affected the respiratory tract, that they occurred equally in both sexes, and that they were dose-proportional to total milligrams of zafirlukast exposure and associated with coadministration of inhaled corticosteroids. It concludes that the clinical significance of this finding is unknown. Separately, the label notes that clearance is reduced in patients 65 and older, such that peak concentration and AUC are approximately twice those of younger adults — so the age group with the infection signal is also the age group carrying roughly double the drug at the same dose. That coincidence is in the label and the two observations are not connected there.',
        evidenceSource:
          'Zafirlukast United States prescribing information — Adverse Reactions; Dosage and Administration, Elderly Patients (NDA 020547)',
        inferredClaim:
          'That the excess infections in older patients are a chance finding of unknown significance — the label’s position, in a group the same label says carries twice the drug exposure',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A tablet twice a day, away from food',
        laymanDesc:
          'Zafirlukast is swallowed twice daily, an hour before or two hours after a meal. Eating with it removes about 40% of the dose.',
        molecularDetail:
          'Rapidly absorbed with peak plasma concentrations around 3 hours. Absolute bioavailability is unknown. Food reduces mean bioavailability by approximately 40% in studies with both high-fat and high-protein meals. More than 99% bound to plasma protein, predominantly albumin, with an apparent steady-state volume of distribution near 70 L. Licensed at 20 mg twice daily from age 12 and 10 mg twice daily from age 5.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It sits on the receptor the leukotrienes need',
        laymanDesc:
          'Inflammatory cells in an asthmatic airway release leukotrienes. Zafirlukast occupies the docking site they use, competing with them for it.',
        molecularDetail:
          'Selective competitive antagonism of the leukotriene D4 and E4 receptor, cysteinyl leukotriene receptor 1. In vitro the drug antagonises the contractile activity of LTC4, LTD4 and LTE4 in conducting airway smooth muscle from laboratory animals and humans. Plasma metabolites are at least 90-fold less potent at the receptor than the parent compound.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The airway stops being squeezed and stops leaking',
        laymanDesc:
          'Without the leukotriene signal, the muscle around the airway does not tighten as hard and the lining leaks less fluid into the wall.',
        molecularDetail:
          'Cysteinyl leukotriene receptor occupation is linked to airway oedema, smooth muscle constriction and altered inflammatory cell activity. In animal work zafirlukast prevented intradermal LTD4-induced increases in cutaneous vascular permeability and inhibited inhaled LTD4-induced eosinophil influx into the lung. Asthmatic patients were found in one study to be 25 to 100 times more sensitive to inhaled LTD4 than non-asthmatic subjects.',
        iconName: 'Wind',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Challenge responses are blunted, including the late phase',
        laymanDesc:
          'Given before an allergen, cold air or sulphur dioxide, it reduces the airway narrowing that follows — both the immediate response and the delayed one hours later.',
        molecularDetail:
          'Single oral doses inhibited bronchoconstriction from sulphur dioxide and cold air in patients with asthma, and attenuated both the early and late phase reactions to inhaled grass, cat dander, ragweed and mixed antigens. Zafirlukast also attenuated the increase in bronchial hyperresponsiveness to inhaled histamine that follows allergen challenge. In sensitised sheep it suppressed early phase, late phase and non-specific hyperresponsiveness.',
        iconName: 'Shield',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In practice, a smaller effect than an inhaled steroid',
        laymanDesc:
          'Head to head against a low dose of inhaled fluticasone, it improved lung function by less than half as much and produced about half as many symptom-free days.',
        molecularDetail:
          'Bleecker 2000, 451 patients over 12 weeks: morning FEV1 +0.20 L against +0.42 L for fluticasone 88 micrograms twice daily (p<0.001), morning peak flow +11.68 against +49.94 L/min (p<0.001), symptom-free days +15.6% against +28.5% (p<0.001). Cochrane 2012 across 65 trials: anti-leukotriene monotherapy carried a risk ratio of 1.51 for exacerbations requiring systemic corticosteroids and 3.33 for those requiring admission.',
        iconName: 'BarChart',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And a liver that has to be watched without a reliable way to watch it',
        laymanDesc:
          'Rare but real liver failure, sometimes without warning symptoms. The label offers transaminase testing while saying it has not been shown to prevent serious injury.',
        molecularDetail:
          'Post-marketing reports at the recommended 40 mg/day dose include symptomatic hepatitis, fulminant hepatitis, hepatic failure, liver transplantation and death, predominantly in females, and in extremely rare cases without preceding clinical signs. Zafirlukast also inhibits CYP2C9: S-warfarin AUC rose 63% and prothrombin time approximately 35% in a 16-volunteer study.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Bleecker 2000 — fluticasone against zafirlukast (J Allergy Clin Immunol 2000;105:1123-1129)',
        phase: 'Randomised, double-blind, double-dummy, active-controlled multicentre trial',
        sampleSize: 451,
        primaryEndpoint:
          'Change in morning FEV1 over 12 weeks in patients aged 12 and over symptomatic on short-acting beta-2 agonists alone',
        endpointMet: false,
        statisticalPValue:
          'Morning FEV1 +0.20 L on zafirlukast against +0.42 L on fluticasone 88 micrograms twice daily, p<0.001 in favour of the inhaled corticosteroid',
        unreportedAdverseSignals:
          'Every secondary endpoint also favoured fluticasone: peak flow, symptom-free days, rescue-free days, nights without waking and rescue beta-agonist use, all p<0.001. Zafirlukast did improve from baseline on all of them — it simply improved less.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Chauhan and Ducharme 2012 — Cochrane meta-analysis of anti-leukotrienes against inhaled corticosteroids (CD002314)',
        phase: 'Systematic review and meta-analysis of 65 randomised trials, 56 contributing data',
        sampleSize: 13338,
        primaryEndpoint:
          'Number of patients with at least one exacerbation requiring systemic corticosteroids, anti-leukotriene monotherapy against inhaled corticosteroid monotherapy',
        endpointMet: false,
        statisticalPValue:
          'Risk ratio 1.51 (95% CI 1.17 to 1.96) across 6,077 participants, number needed to harm 28 (95% CI 15 to 82)',
        unreportedAdverseSignals:
          'Hospital admission risk ratio 3.33 (95% CI 1.02 to 10.94); FEV1 favoured inhaled corticosteroids by 110 mL; withdrawals for poor asthma control 2.56 times as likely. The disadvantage was larger in moderate than mild obstruction and was unaffected by which anti-leukotriene was used or by funding source.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled zafirlukast safety database (NDA 020547)',
        phase: 'Pooled placebo-controlled clinical trial safety analysis',
        sampleSize: 6090,
        primaryEndpoint:
          'Adverse events reported by at least 1% of zafirlukast-treated patients at rates numerically greater than placebo',
        endpointMet: true,
        statisticalPValue:
          'Headache 12.9% against 11.7%, nausea 3.1% against 2.0%, diarrhoea 2.8% against 2.1%, ALT elevation 1.5% against 1.1%, across 4,058 treated and 2,032 placebo patients',
        unreportedAdverseSignals:
          'The serious hepatic events — fulminant hepatitis, transplantation, death — come from post-marketing surveillance rather than from this database, and occurred predominantly in females. An excess of infections in patients over 55 was dose-proportional to total exposure and is recorded as of unknown significance.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Morning FEV1 improvement of 0.20 L against 0.42 L for low-dose inhaled fluticasone in 451 patients over 12 weeks (p<0.001)',
        'Symptom-free days improved 15.6 percentage points against 28.5 for fluticasone (p<0.001)',
        'Risk ratio 1.51 for exacerbations requiring systemic corticosteroids on anti-leukotriene monotherapy against inhaled corticosteroids, across 6,077 participants',
        'S-warfarin AUC increased 63% and prothrombin time approximately 35% with steady-state zafirlukast in 16 volunteers',
        'Mean bioavailability reduced approximately 40% by a high-fat or high-protein meal',
      ],
      unsupportedInferences: [
        'That an oral leukotriene blocker is an equivalent alternative to an inhaled corticosteroid — the positioning the class was launched on, and the exact claim 65 randomised trials refuted',
        'That the eosinophilic vasculitis reported on this class is unmasking rather than causation, which the label says can neither be excluded nor established',
        'That zafirlukast carries less neuropsychiatric risk than montelukast, inferred from a boxed warning applied to one and not the other with no comparative study behind it',
        'That transaminase monitoring protects against the hepatotoxicity, which the label states has not been proven to prevent serious injury',
      ],
      whatFailedInitially: [
        'Lost to a low dose of inhaled fluticasone on every endpoint of a 451-patient head-to-head trial',
        'Post-marketing hepatic failure, liver transplantation and death at the recommended dose, sometimes without preceding symptoms',
        'A 40% food effect combined with twice-daily dosing that no competitor carries',
        'An unexplained excess of infections in patients over 55, dose-proportional to total exposure',
      ],
      realWorldOutcome: [
        'Approved on 26 September 1996 under NDA 020547 as the first leukotriene receptor antagonist in the United States',
        'Overtaken almost entirely by montelukast, which is once daily and food-independent, without ever losing a head-to-head efficacy trial to it',
        'Only ten generic products appear in the CMS acquisition cost survey, at about 64 United States cents a tablet',
        'The class as a whole moved from proposed alternative to inhaled steroids down to add-on or second-line in every major guideline',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 20 mg twice daily from age 12 and 10 mg twice daily from age 5, taken at least 1 hour before or 2 hours after meals',
      description:
        'Rapidly absorbed with peak plasma concentration around 3 hours and extensive hepatic metabolism to hydroxylated products excreted in faeces. Clearance falls with age: in patients 65 and over, peak concentration and AUC are approximately double those of younger adults. It is a controller taken every day including symptom-free periods, and the label instructs that treatment may be continued through an acute exacerbation but must never be used to treat one.',
      safetyProfile:
        'Carries a Warnings-section hepatotoxicity statement: life-threatening hepatic failure has been reported, with rare progression to fulminant hepatitis, liver transplantation and death, predominantly in females, occasionally without preceding clinical signs. Periodic transaminase testing is offered as optional and the label states it has not been proven to prevent serious injury. Patients withdrawn for hepatic dysfunction with no other cause should never be re-exposed. Coadministration with warfarin significantly prolongs prothrombin time and requires monitoring. Neuropsychiatric events including insomnia and depression have been reported in adults, adolescents and children. Rare cases of systemic eosinophilia, eosinophilic pneumonia and vasculitis consistent with Churg-Strauss syndrome have occurred, usually but not always around steroid reduction. Hypersensitivity reactions, agranulocytosis, bruising and bleeding have been reported. Nursing mothers should not take it. It is not a bronchodilator and is not indicated for acute attacks or status asthmaticus.',
    },
    commonQuestions: [
      {
        q: 'Is a leukotriene tablet as good as a steroid inhaler?',
        a: 'No, and this is one of the better-settled questions in respiratory medicine. A 451-patient randomised trial compared zafirlukast directly against a low dose of inhaled fluticasone and the inhaler won on every endpoint measured: lung function, peak flow, symptom-free days, rescue inhaler use and nights without waking, all at p<0.001. A 2012 Cochrane review pooled 65 trials covering more than 13,000 adults and children and found that people on anti-leukotriene monotherapy were 51% more likely to need a course of oral steroids for an attack and more than three times as likely to be admitted to hospital. That does not make the tablets useless — they are a reasonable add-on, and they help some people a great deal — but as a replacement for an inhaled steroid the evidence is against them.',
        auditNote:
          'The Cochrane analysis found the disadvantage was larger in moderate than in mild airway obstruction, and was not affected by which leukotriene drug was used or by who funded the trial.',
      },
      {
        q: 'Does it really matter if I take it with breakfast?',
        a: 'Yes, by about 40%. Two separate pharmacokinetic studies, one with a high-fat meal and one with a high-protein meal, found that food reduced the mean amount of drug reaching the bloodstream by approximately 40%. The label puts the instruction at the very start of the dosage section: at least one hour before or two hours after a meal. Taking a 20 mg tablet with food is closer to taking a 12 mg tablet. Twice a day, every day, that adds up — and it is a large part of why this drug was displaced by montelukast, which has no food restriction and is taken once.',
      },
      {
        q: 'How worried should I be about my liver?',
        a: 'Aware rather than worried, but genuinely aware. The label reports life-threatening hepatic failure at the ordinary 40 mg a day dose, and in rare cases patients have gone on to fulminant hepatitis, liver transplantation and death. Most reported cases resolved after stopping the drug. Reports have come predominantly from women. The uncomfortable part is the monitoring: the label offers periodic transaminase testing while stating that it has not been proven to prevent serious injury, and notes that in extremely rare cases there were no warning symptoms at all. What that leaves you with is symptom awareness — right upper abdominal pain, nausea, unusual fatigue, itching, yellowing, flu-like symptoms, loss of appetite — and the instruction to stop and be tested immediately if any appear.',
        auditNote:
          'A monitoring strategy the label itself describes as unproven, offered as optional, is the entire risk-management plan for the most serious harm this drug is known to cause.',
      },
      {
        q: 'I read that leukotriene drugs cause depression. Does this one?',
        a: 'The signal is on this label too, as a precaution rather than a boxed warning. It records neuropsychiatric events in adults, adolescents and children, with post-marketing reports of insomnia and depression, and states that the clinical details of some reports appear consistent with a drug-induced effect. What made the news was montelukast: in March 2020 the FDA required a boxed warning on it for serious neuropsychiatric events including suicidal thoughts and behaviour, and that label now reserves its use in allergic rhinitis for people who cannot tolerate or have not responded to the alternatives. Montelukast is prescribed to far more people, including very young children, so it generates far more reports — which is a real explanation for why the regulatory action fell there and not here. It is not evidence that zafirlukast is safer. Nobody has compared them.',
      },
      {
        q: 'Can I take it when an attack starts?',
        a: 'No. The label states directly that zafirlukast is not indicated for the reversal of bronchospasm in acute asthma attacks, including status asthmaticus, and that it is not a bronchodilator. It works by occupying a receptor over hours and days, not by relaxing an airway in minutes. You keep your reliever inhaler. What the label does say is that zafirlukast can be continued during an acute exacerbation rather than stopped, and that you should not reduce or stop any of your other asthma medicines unless a doctor tells you to.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bleecker ER, Welch MJ, Weinstein SF, Kalberg C, Johnson M, Edwards L, Rickard KA. Low-dose inhaled fluticasone propionate versus oral zafirlukast in the treatment of persistent asthma. J Allergy Clin Immunol 2000;105:1123-1129',
        identifier: '10.1067/mai.2000.106043',
        kind: 'doi',
      },
      {
        label:
          'Chauhan BF, Ducharme FM. Anti-leukotriene agents compared to inhaled corticosteroids in the management of recurrent and/or chronic asthma in adults and children. Cochrane Database Syst Rev 2012;5:CD002314',
        identifier: '10.1002/14651858.CD002314.pub3',
        kind: 'doi',
      },
      {
        label:
          'Zafirlukast tablets United States prescribing information — Clinical Pharmacology, Indications, Dosage and Administration, Warnings (Hepatotoxicity, Bronchospasm, Concomitant Warfarin Administration), Precautions (Eosinophilic Conditions, Neuropsychiatric Events, Drug Interactions, Information for Patients) and Adverse Reactions (NDA 020547)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ZAFIRLUKAST%22',
        kind: 'regulatory',
      },
      {
        label:
          'Montelukast sodium United States prescribing information — Boxed Warning: Serious Neuropsychiatric Events, added March 2020, which reserves use in allergic rhinitis for patients with an inadequate response or intolerance to alternative therapies',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22MONTELUKAST+SODIUM%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — zafirlukast, 10 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5717 — zafirlukast structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5717',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Nedocromil — the anti-inflammatory with the cleanest safety record in asthma, no better than
  //    placebo on lung function over six years, and gone from the United States market entirely.
  //    It was not withdrawn for safety or for failing. Its propellant was banned.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nedocromil',
    name: 'Nedocromil',
    tradeName: 'Tilade (inhalation aerosol and nebuliser solution) / Alocril (2% eye drops)',
    sponsor:
      'King Pharmaceuticals LLC held the Tilade metered-dose inhaler (NDA 019660); Sanofi Aventis US held the Tilade inhalation solution (NDA 020750); Allergan held Alocril ophthalmic solution (NDA 021009). All three are listed as discontinued in Drugs@FDA',
    targetGene:
      'No single gene target is established. The proposed molecular site is a chloride channel involved in cell activation, not a named receptor',
    targetProtein:
      'Not identified. Nedocromil inhibits chloride ion flux in mast cells, epithelial cells and neurons, and the chloride channel account is described in the primary literature as a unifying hypothesis rather than an established mechanism',
    modality: 'Small Molecule',
    approvalStatus: 'Withdrawn from Market',
    approvalYear: 1992,
    indication:
      'Approved in the United States as maintenance therapy for mild to moderate bronchial asthma (Tilade inhalation aerosol, NDA 019660, approved 30 December 1992; Tilade inhalation solution, NDA 020750, approved 1 October 1997) and for the treatment of itching associated with allergic conjunctivitis (Alocril 2% ophthalmic solution, NDA 021009, approved 8 December 1999). All three products are listed as discontinued in Drugs@FDA and no nedocromil product currently holds an active United States label',
    patientFriendlyIndication:
      'Asthma prevention, and itchy allergic eyes — a medicine you can no longer get in the United States',
    anatomicalSite:
      'Mast cells, airway epithelium and sensory nerve endings of the bronchial mucosa; conjunctival mast cells for the eye drop',
    conditionContext: {
      conditionExplainer:
        'Before inhaled steroids became universal, the cromones were the anti-inflammatory option in mild asthma: drugs that stopped mast cells releasing their contents without touching the glucocorticoid receptor and therefore without any of the steroid consequences. Nedocromil was the second and more potent of the two.',
      whyItMatters:
        'Nedocromil is the rare case where the audit runs in the patient’s favour on safety and against the drug on efficacy, and where neither of those things is why it disappeared. It went because its metered-dose inhaler used a chlorofluorocarbon propellant, and the United States removed the last CFC inhalers from the market on 14 June 2010 under the Montreal Protocol.',
      whoTakesThis:
        'Nobody in the United States now. Historically, children and adults with mild to moderate asthma who needed a daily preventer and either could not tolerate or did not want an inhaled corticosteroid, and people with allergic conjunctivitis.',
      clinicalGoals:
        'Fewer symptoms, fewer urgent visits, fewer courses of oral steroids. The long-term trial that measured lung function found no advantage over placebo on that endpoint at all.',
    },
    oneSentenceVerdict:
      'A non-steroidal airway anti-inflammatory that in 1,041 children treated for four to six years produced no significant difference from placebo in post-bronchodilator FEV1 — the trial’s primary outcome — while significantly reducing urgent care visits (16 against 22 per 100 person-years) and prednisone courses, with no effect on growth where budesonide cost 1.1 cm of height, and which left the United States market in 2010 because its propellant was banned rather than because it failed or harmed anyone.',
    laymanHowItWorks:
      'Nedocromil was inhaled twice to four times a day to stop asthma attacks starting rather than to treat one. It acts on mast cells and on the sensory nerves and epithelial cells of the airway lining, damping down the release of the chemicals that trigger narrowing and cough. It is not a steroid and not a bronchodilator: it does nothing in the moment, and it has almost none of the side effects that either of those carries. The most reliable complaint about it in fifteen trials was that it tastes unpleasant.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    substitutes: {
      summary:
        'Since no nedocromil product is marketed in the United States, every alternative here is a replacement rather than a comparison. The honest summary of the evidence is the one the Cochrane reviewers reached: the head-to-head trials against inhaled corticosteroids in mild asthma that would have settled nedocromil’s place were called for and never run, and then the drug was gone.',
      conventionalRx: [
        {
          name: 'Inhaled budesonide, fluticasone or beclomethasone',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'Directly compared with nedocromil in the largest trial either has: CAMP randomised 1,041 children to budesonide, nedocromil or placebo for four to six years. Neither beat placebo on the primary lung function endpoint. Budesonide beat both placebo and nedocromil on airway responsiveness, hospitalisations (2.5 against 4.4 per 100 person-years), urgent visits (12 against 22) and prednisone courses. It cost 1.1 cm of height in the first year; nedocromil cost none.',
          typicalCost:
            'Generic inhaled corticosteroids are widely available, though inhaler acquisition costs vary considerably',
          prosAndCons:
            'Pros: better asthma control than nedocromil in the one trial that compared them over years. Cons: oral candidiasis, hoarseness, a small transient growth effect in children, and at high doses systemic consequences that a cromone has never had.',
        },
        {
          name: 'Cromolyn sodium (sodium cromoglicate)',
          class: 'Cromone',
          howItCompares:
            'The older and less potent member of the same family, working through the same proposed chloride-flux mechanism. In the United States the metered-dose inhaler was removed in the same CFC phase-out; the nebuliser solution outlasted it. It has the same essentially clean safety profile and the same unsettled efficacy position relative to inhaled steroids.',
          typicalCost:
            'Generic nebuliser solution, historically inexpensive at pharmacy acquisition cost',
          prosAndCons:
            'Pros: the same absence of systemic toxicity. Cons: four-times-daily dosing, weaker evidence than nedocromil, and the same displacement by inhaled corticosteroids in every guideline.',
        },
        {
          name: 'Montelukast (Singulair)',
          class: 'Cysteinyl leukotriene receptor 1 antagonist',
          howItCompares:
            'The oral non-steroidal controller that occupied the niche nedocromil vacated: mild persistent asthma in someone who will not or cannot use an inhaled steroid. It is once daily and swallowed, which nedocromil never was. It also carries an FDA boxed warning added in March 2020 for serious neuropsychiatric events including suicidal thoughts and behaviour, which nedocromil never did.',
          typicalCost:
            'Generic and among the cheaper asthma controllers at pharmacy acquisition cost',
          prosAndCons:
            'Pros: oral, once daily, still available. Cons: a boxed warning, and a class shown across 65 randomised trials to be worse than inhaled corticosteroids as monotherapy.',
        },
        {
          name: 'Olopatadine, ketotifen or azelastine eye drops',
          class: 'Topical antihistamine with mast cell stabilising activity',
          howItCompares:
            'The replacements for Alocril in allergic conjunctivitis. They combine H1 receptor blockade, which nedocromil did not have, with mast cell stabilisation, which it did, and several are available over the counter.',
          typicalCost: 'Several are sold over the counter at low cost',
          prosAndCons:
            'Pros: available, and dual-acting rather than purely a stabiliser. Cons: transient stinging, and short duration for some of them.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Understand what "discontinued" means on this record',
          action:
            'If you are looking for this drug in the United States, look at the Drugs@FDA marketing status before anything else.',
          patientImpact:
            'All three United States nedocromil products are listed as discontinued: the Tilade metered-dose inhaler under NDA 019660, the Tilade inhalation solution under NDA 020750, and Alocril 2% ophthalmic solution under NDA 021009. The Alocril entry carries an explicit Federal Register determination that the product was not discontinued or withdrawn for safety or effectiveness reasons.',
          clinicalPrecaution:
            'That determination matters practically: it is the finding that permits generic applications to reference the discontinued product. Its presence is the regulator saying, in the only way it says such things, that nothing was wrong with the drug.',
        },
        {
          name: 'It was never a reliever, and it took weeks to work',
          action:
            'Historically, patients were told to keep using it during symptom-free periods and to keep a separate rescue inhaler.',
          patientImpact:
            'Nedocromil prevents mediator release rather than relaxing airway muscle. In the Cochrane trials the benefits appeared over four to twelve weeks of regular use, not on the first day.',
          clinicalPrecaution:
            'This is the same distinction that applies to every asthma controller, and the same reason a controller must not be judged by how it feels during an attack.',
        },
        {
          name: 'The taste was the side effect that actually happened',
          action: 'Rinse after inhaling.',
          patientImpact:
            'Across fifteen randomised trials in 1,422 children, the Cochrane reviewers recorded that nedocromil has a good safety profile and that the only significant side effect observed was unpleasant taste. In CAMP, height gain over four to six years was the same as placebo.',
          clinicalPrecaution:
            'An unpleasant taste is not trivial when it drives a child to stop using a twice-daily preventer, and adherence was a recognised problem with this drug.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCC1=C2C(=CC3=C1OC(=CC3=O)C(=O)O)C(=O)C=C(N2CC)C(=O)O',
      chemicalFormula: 'C19H17NO7',
      molecularWeight:
        '371.30 g/mol as the free diacid shown here. The marketed products contained the disodium salt, formed at both carboxylic acids',
      targetReceptorAffinity:
        'No receptor affinity has been established, because no receptor has been identified. Nedocromil is a pyranoquinoline dicarboxylic acid — two ionisable acid groups on a fused tricyclic core, which is why it is given as a disodium salt and why it is topically active and systemically inert. The proposed molecular action is inhibition of chloride ion flux in mast cells, epithelial cells and neurons, described in the primary literature as a hypothesis that may unify the drug’s effects across cell types rather than as a demonstrated mechanism.',
      structureSource: {
        label:
          'PubChem CID 50294 (nedocromil) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/50294',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ned-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm both carboxylates and the salt stoichiometry',
          description:
            'Nedocromil is a dicarboxylic acid marketed as the disodium salt. Salt stoichiometry is not a formality here: a mono-sodium or mixed lot has different solubility and different aerosol behaviour, and the drug’s entire pharmacology depends on staying at the airway surface rather than being absorbed.',
          reagentsAndBuffer:
            'Reference standard, ion chromatography or flame photometry for sodium content, potentiometric titration of both acid functions, proton and carbon NMR, Karl Fischer titration',
        },
        {
          id: 'ned-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the pyrano-quinoline core and install both acid groups',
          description:
            'The molecule is a fused pyrano[3,2-g]quinoline bearing a propyl group on the aromatic ring, an N-ethyl group on the quinolinone nitrogen, and carboxylic acids at both ring termini. Both acids are carried as esters through the ring-forming chemistry and hydrolysed at the end, because a free diacid is intractable to handle through a cyclisation.',
          dependsOnStepId: 'ned-w1',
          reagentsAndBuffer:
            'Substituted aminophenol precursor, diethyl ethoxymethylenemalonate or equivalent for ring construction, ethyl iodide for N-alkylation, base hydrolysis of both esters, anhydrous conditions under nitrogen',
        },
        {
          id: 'ned-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Form the disodium salt and control particle size for inhalation',
          description:
            'Convert to the disodium salt with sodium hydroxide and isolate. For the metered-dose product the material is then micronised, because an inhaled drug that acts on the airway surface is defined by where its particles land: too coarse and it deposits in the mouth, too fine and it is exhaled again.',
          dependsOnStepId: 'ned-w2',
          reagentsAndBuffer:
            'Sodium hydroxide in aqueous ethanol, crystallisation and drying, jet milling to a respirable size distribution, laser diffraction particle sizing, cascade impaction for aerodynamic particle size distribution',
        },
        {
          id: 'ned-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure chloride flux inhibition, not just degranulation',
          description:
            'The conventional assay is mast cell mediator release, which reports the effect but not the mechanism. The claim in the literature is that nedocromil inhibits chloride ion flux across the membrane of mast cells, epithelial cells and neurons, and that this unifies its effects across cell types. That claim is testable directly, and the cell types must be tested separately because the hypothesis is precisely that one mechanism covers all three.',
          dependsOnStepId: 'ned-w3',
          reagentsAndBuffer:
            'Human lung mast cells, primary bronchial epithelial cells and a sensory neuron preparation as three separate systems, halide-sensitive fluorescent indicator or patch clamp for chloride conductance, hyperosmolar and IgE cross-linking challenges, histamine and tryptase release as parallel readouts',
        },
        {
          id: 'ned-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Confirm it stays where it is put',
          description:
            'The safety record of the cromones rests on systemic unavailability: a doubly charged dicarboxylate is poorly absorbed from the airway and from the gut, which is why fifteen randomised trials in 1,422 children found no significant adverse effect beyond taste. That property is a measurement, not an assumption, and it should be confirmed for any reformulation before efficacy is examined.',
          dependsOnStepId: 'ned-w4',
          reagentsAndBuffer:
            'LC-MS/MS plasma assay with a low limit of quantification, paired airway and systemic sampling after inhaled dosing, Caco-2 permeability for the oral fraction swallowed after inhalation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ned-a1',
        category: 'failed',
        title: 'Six years, a thousand children, and no lung function benefit over placebo',
        laymanSummary:
          'The Childhood Asthma Management Program treated 1,041 children for four to six years with budesonide, nedocromil or placebo. The main thing it set out to measure — lung function after a bronchodilator — showed no significant difference for either drug against placebo.',
        technicalDetails:
          'CAMP randomised 1,041 children aged 5 through 12 with mild-to-moderate asthma to 200 micrograms of budesonide (311), 8 mg of nedocromil (312) or placebo (418) twice daily, and treated them for four to six years, with albuterol available to all. The primary outcome was the degree of change in post-bronchodilator FEV1 as a percentage of predicted, and there was no significant difference between either treatment and placebo on it. Nedocromil did significantly reduce urgent care visits (16 against 22 per 100 person-years) and courses of prednisone. Budesonide additionally reduced the decline in pre-bronchodilator FEV1:FVC (0.2% against 1.8%), airway responsiveness to methacholine, hospitalisations (2.5 against 4.4 per 100 person-years), urgent visits (12 against 22), albuterol use and days needing extra medication. The published conclusion states that neither budesonide nor nedocromil is better than placebo in terms of lung function, and that budesonide provides better control than placebo or nedocromil. This is the largest and longest asthma controller trial ever run in children, and its headline finding is a negative one for both active drugs.',
        evidenceSource:
          'The Childhood Asthma Management Program Research Group. Long-term effects of budesonide or nedocromil in children with asthma. N Engl J Med 2000;343:1054-1063',
        doi: '10.1056/NEJM200010123431501',
        measuredMetric:
          'Change in post-bronchodilator FEV1 percent predicted over four to six years, and urgent care visits, hospitalisations and prednisone courses per 100 person-years',
        auditFlag: 'caution',
      },
      {
        id: 'ned-a2',
        category: 'conclusion_shift',
        title: 'It left the market because of its propellant, not its evidence',
        laymanSummary:
          'The Tilade inhaler was withdrawn on 14 June 2010, along with the last other chlorofluorocarbon inhalers, under the treaty that phased out ozone-depleting propellants. Nothing about the drug had changed.',
        technicalDetails:
          'The United States removed the remaining chlorofluorocarbon-propelled metered-dose inhalers from the market under obligations arising from the Montreal Protocol on Substances that Deplete the Ozone Layer, with Tilade’s last permitted date of manufacture, sale or dispensing falling on 14 June 2010. King Pharmaceuticals had already announced discontinuation of the Tilade inhaler, citing in part its inability to identify a qualified manufacturer for a chlorofluorocarbon propellant inhaler. Drugs@FDA now lists all three United States nedocromil products as discontinued: the metered-dose inhaler under NDA 019660, the inhalation solution under NDA 020750 and Alocril 2% ophthalmic solution under NDA 021009. The Alocril entry carries an explicit Federal Register determination that the product was not discontinued or withdrawn for safety or effectiveness reasons. That is the regulator recording that the drug was neither unsafe nor ineffective — and it is still gone. Albuterol, fluticasone and the others were reformulated into hydrofluoroalkane propellants and survived the same rule. Nedocromil, by then a small product in a niche inhaled corticosteroids had taken, was not.',
        evidenceSource:
          'FDA Drugs@FDA marketing status records for NDA 019660, NDA 020750 and NDA 021009; FDA phase-out of chlorofluorocarbon metered-dose inhalers under the Montreal Protocol, final permitted date 14 June 2010',
        measuredMetric:
          'Marketing status of every United States nedocromil product and the stated reason for discontinuation',
        auditFlag: 'caution',
      },
      {
        id: 'ned-a3',
        category: 'measured',
        title: 'The safety result is the strongest thing about it',
        laymanSummary:
          'Fifteen randomised trials in 1,422 children found one side effect worth reporting: it tastes bad. In the six-year trial, children on nedocromil grew exactly as much as children on placebo, while children on the inhaled steroid grew 1.1 cm less.',
        technicalDetails:
          'The Cochrane review of nedocromil against placebo in childhood asthma included fifteen trials — twelve parallel group and three crossover — recruiting 1,422 children, and judged the studies generally of good methodological quality. Its safety finding was that nedocromil sodium has a good safety profile and that the only significant side effect observed was unpleasant taste, with no significant short-term or long-term adverse effects. CAMP measured growth over four to six years directly: mean height increase was 1.1 cm less in the budesonide group than placebo (22.7 cm against 23.8 cm, p=0.005), a difference evident mostly within the first year, while height increase in the nedocromil group was similar to placebo. A doubly charged dicarboxylate is barely absorbed from the airway, which is the chemical reason a drug can be given for six years to children and produce nothing systemic. It is also, unavoidably, the reason it is weak.',
        evidenceSource:
          'Sridhar AV, McKean M. Nedocromil sodium for chronic asthma in children. Cochrane Database Syst Rev 2006;3:CD004108; CAMP Research Group, N Engl J Med 2000;343:1054-1063',
        doi: '10.1002/14651858.CD004108.pub2',
        measuredMetric:
          'Adverse effects across 15 randomised trials in 1,422 children, and height gain over four to six years against placebo and against inhaled budesonide',
        auditFlag: 'verified',
      },
      {
        id: 'ned-a4',
        category: 'inferred',
        title: 'The mast cell stabiliser label is a shorthand for a mechanism never established',
        laymanSummary:
          'Nedocromil is universally described as a mast cell stabiliser. The molecular account behind that phrase — blocking chloride movement across cell membranes — was published as a hypothesis that might unify the drug’s effects, and it was never confirmed.',
        technicalDetails:
          'Alton and Norris set out the position in 1996: nedocromil sodium has been shown to inhibit chloride ion flux in mast cells, epithelial cells and neurons, and this feature "may explain" how it prevents mast cell degranulation, the effects of airway osmolarity changes and neuronal activation. Their own framing is that the mechanism "may also provide a unifying hypothesis" for the drug’s effects across the several cell types involved in asthma. No receptor was ever identified, no channel was ever cloned as the nedocromil target, and no structure-activity programme ever produced a successor molecule from the hypothesis. The mast cell is the cell the class is named after and it is demonstrably not the only cell affected: sensory nerve activation and eosinophil activity are both in the same literature. Describing the drug as a mast cell stabiliser is a convenient summary of one measured effect, presented as though it were the mechanism.',
        evidenceSource:
          'Alton EW, Norris AA. Chloride transport and the actions of nedocromil sodium and cromolyn sodium in asthma. J Allergy Clin Immunol 1996;98(5 Pt 2):S102-S105',
        doi: '10.1016/s0091-6749(96)70024-6',
        inferredClaim:
          'That nedocromil works by stabilising mast cells through chloride channel blockade — offered in the primary literature explicitly as a unifying hypothesis, and never established as the mechanism',
        auditFlag: 'contested',
      },
      {
        id: 'ned-a5',
        category: 'inferred',
        title:
          'Short trials found benefit, long trials did not, and the reviewers named the reason they could not tell why',
        laymanSummary:
          'Short studies of four to twelve weeks showed nedocromil improving lung function and symptoms. The two long studies did not agree. The Cochrane reviewers offered two explanations — milder patients in the long trials, or publication bias in the short ones — and could not choose between them.',
        technicalDetails:
          'The Cochrane review reported that short-term studies of four to twelve weeks produced improvement against placebo in FEV1, FVC, FEV1 percent predicted, PC20 FEV1, evening peak flow and symptom scores, with parents’ assessment of efficacy favouring nedocromil at an odds ratio of 0.5 (95% CI 0.3 to 0.8). It also reported that two large long-term studies, over six months and over four to six years, showed conflicting results on symptom-free days, and that the two long trials did not show consistent effects on lung function outcomes. The authors wrote that differing baseline severity may explain the difference, with milder participants experiencing less benefit, "although the discrepancy between study findings may also reflect publication bias." They further noted little evidence of a clinical dose-response effect, and that few studies recruited participants with severe asthma. A drug whose effect appears in short trials and vanishes in long ones is the classic shape of both explanations at once, and nothing published since separates them.',
        evidenceSource:
          'Sridhar AV, McKean M. Nedocromil sodium for chronic asthma in children. Cochrane Database Syst Rev 2006;3:CD004108',
        doi: '10.1002/14651858.CD004108.pub2',
        inferredClaim:
          'That nedocromil improves lung function in childhood asthma — supported by short trials, contradicted by both long trials, and attributed by the reviewers to either baseline severity or publication bias without being able to distinguish them',
        auditFlag: 'contested',
      },
      {
        id: 'ned-a6',
        category: 'failed',
        title: 'The trial that would have settled its place was called for and never run',
        laymanSummary:
          'The Cochrane reviewers ended by saying that head-to-head trials against inhaled steroids in mild asthma were needed to find out whether control was similar, and that it was not yet clear where nedocromil belonged. Four years later the drug left the market and the question was closed by default.',
        technicalDetails:
          'The 2006 Cochrane conclusion states that although nedocromil may have advantages over inhaled corticosteroids in terms of side effects, "there is a need for head to head trials of nedocromil and inhaled corticosteroids to establish whether asthma control is similar, especially in mild asthma," and that "it is not yet clear where nedocromil should sit in relation to other therapies in the treatment of asthma in children." Those trials were never run. CAMP is the closest thing, and it randomised against placebo with budesonide as a third arm rather than powering a nedocromil-against-budesonide equivalence comparison in mild disease. In June 2010 the last United States nedocromil inhaler was withdrawn. The evidence gap identified in 2006 is now permanent: there is no product to run the trial with, and no commercial reason to make one. This is what it looks like when a clinical question is answered by a supply chain rather than by data.',
        evidenceSource:
          'Sridhar AV, McKean M. Nedocromil sodium for chronic asthma in children. Cochrane Database Syst Rev 2006;3:CD004108; FDA Drugs@FDA marketing status for NDA 019660',
        doi: '10.1002/14651858.CD004108.pub2',
        measuredMetric:
          'The comparison the systematic review identified as necessary, against the trials subsequently conducted',
        auditFlag: 'caution',
      },
      {
        id: 'ned-a7',
        category: 'measured',
        title:
          'What it did reduce: urgent visits and steroid courses, in the trial where lung function did not move',
        laymanSummary:
          'CAMP is usually cited as a negative trial for nedocromil. It also found significantly fewer urgent care visits and fewer courses of oral steroids on the drug than on placebo, over four to six years.',
        technicalDetails:
          'In CAMP, as compared with placebo, nedocromil significantly reduced urgent visits to a caregiver — 16 against 22 per 100 person-years — and courses of prednisone. It did not reduce hospitalisations, alter methacholine responsiveness, or change the primary lung function endpoint, all of which budesonide did. Two things follow. First, the drug did something real in a four-to-six-year randomised comparison, on outcomes that matter to a family more than a spirometry number does. Second, the pattern is the same one that recurs throughout this batch: exacerbation-type endpoints move while lung function does not, and quoting one without the other misrepresents the drug in whichever direction the quoter prefers. A trial can be negative on its primary endpoint and still contain a genuine measured benefit, and both statements have to travel together.',
        evidenceSource:
          'The Childhood Asthma Management Program Research Group. Long-term effects of budesonide or nedocromil in children with asthma. N Engl J Med 2000;343:1054-1063',
        doi: '10.1056/NEJM200010123431501',
        measuredMetric:
          'Urgent care visits per 100 person-years and courses of prednisone, nedocromil against placebo over four to six years',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Inhaled, and it stays where it lands',
        laymanDesc:
          'The drug was breathed in from a pressurised inhaler or a nebuliser and settled on the lining of the airway. Almost none of it got into the bloodstream, which is why it had so few side effects.',
        molecularDetail:
          'A pyranoquinoline dicarboxylic acid given as the disodium salt. Two ionised carboxylates make the molecule poorly permeable across membranes and poorly absorbed from both airway and gut, so activity is topical and systemic exposure is minimal. Delivered at 1.75 mg per actuation from the metered-dose inhaler (NDA 019660) or as a 0.5% nebuliser solution (NDA 020750).',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It interferes with chloride movement across the cell membrane',
        laymanDesc:
          'The proposed action is not on a receptor but on the flow of chloride ions in and out of cells — a step several airway cell types need in order to activate.',
        molecularDetail:
          'Nedocromil inhibits chloride ion flux in mast cells, epithelial cells and neurons. No receptor has been identified and no channel has been cloned as its target. The primary literature presents this as a hypothesis capable of unifying the drug’s effects across cell types, not as an established mechanism.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Mast cells hold on to what they are carrying',
        laymanDesc:
          'Mast cells sitting in the airway lining are loaded with histamine and other irritants. Nedocromil makes them less likely to dump that load when triggered.',
        molecularDetail:
          'Inhibition of immediate mediator release from mast cells, and of the airway responses to osmolarity change — the mechanism relevant to exercise and cold air challenge. Bronchial biopsy work during prolonged treatment reported a decrease in activated eosinophils, which is why the drug is described as anti-inflammatory rather than purely as a stabiliser.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Sensory nerves are quietened too',
        laymanDesc:
          'The same effect on the nerve endings in the airway wall is what reduced cough and the reflex tightening that follows an irritant.',
        molecularDetail:
          'Inhibition of neuronal activation is part of the same chloride-flux account, and is offered as the explanation for effects on cough and on non-specific hyperresponsiveness that mast cell stabilisation alone would not predict. Given before antigen, nedocromil attenuated both the early and the late phase reaction and the rise in bronchial hyperresponsiveness.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer urgent visits and steroid courses — and no change in lung function',
        laymanDesc:
          'Over four to six years in a thousand children, it cut urgent care visits and courses of steroid tablets, and left the breathing test where it found it.',
        molecularDetail:
          'CAMP: urgent care visits 16 against 22 per 100 person-years and fewer prednisone courses against placebo, with no significant difference from placebo in the primary endpoint of post-bronchodilator FEV1 percent predicted. Budesonide in the same trial additionally reduced hospitalisations and methacholine responsiveness, at the cost of 1.1 cm of height in the first year. Height gain on nedocromil matched placebo.',
        iconName: 'BarChart',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And then the propellant was banned',
        laymanDesc:
          'On 14 June 2010 the last chlorofluorocarbon inhalers were removed from the United States market. Tilade was one of them, and no reformulated version replaced it.',
        molecularDetail:
          'All three United States products are listed as discontinued in Drugs@FDA — NDA 019660, NDA 020750 and NDA 021009 — with the Alocril entry carrying a Federal Register determination that it was not discontinued or withdrawn for safety or effectiveness reasons. Other inhalers were reformulated into hydrofluoroalkane propellants and survived; this one was not.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CAMP — Childhood Asthma Management Program (N Engl J Med 2000;343:1054-1063)',
        phase:
          'Phase 3, randomised, double-blind, placebo-controlled, three-arm, four to six years',
        sampleSize: 1041,
        primaryEndpoint:
          'Degree of change in post-bronchodilator FEV1 as a percentage of predicted value, in children aged 5 through 12 with mild-to-moderate asthma',
        endpointMet: false,
        statisticalPValue:
          'No significant difference between either nedocromil 8 mg twice daily or budesonide 200 micrograms twice daily and placebo on the primary outcome, over four to six years',
        unreportedAdverseSignals:
          'Nedocromil did significantly reduce urgent care visits (16 against 22 per 100 person-years) and courses of prednisone. Budesonide reduced hospitalisations, methacholine responsiveness and albuterol use, and reduced height gain by 1.1 cm (22.7 against 23.8 cm, p=0.005). Height gain on nedocromil matched placebo.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Sridhar and McKean 2006 — Cochrane review, nedocromil against placebo in childhood asthma (CD004108)',
        phase: 'Systematic review and meta-analysis of 15 randomised placebo-controlled trials',
        sampleSize: 1422,
        primaryEndpoint:
          'Symptom-free days with nedocromil sodium against placebo in chronic asthma in children aged 0 to 18',
        endpointMet: false,
        statisticalPValue:
          'Conflicting results on the primary outcome between the two large long-term studies; short-term trials of 4 to 12 weeks improved FEV1, FVC, FEV1 percent predicted, PC20 FEV1, evening peak flow and symptom scores, with parents’ assessment favouring nedocromil at an odds ratio of 0.5 (95% CI 0.3 to 0.8)',
        unreportedAdverseSignals:
          'The reviewers attributed the short-versus-long discrepancy to differing baseline severity or to publication bias, without being able to distinguish them, and noted little evidence of a clinical dose-response effect and few participants with severe asthma. The only significant side effect recorded was unpleasant taste.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'No significant difference from placebo in post-bronchodilator FEV1 percent predicted over four to six years in 1,041 children (CAMP primary outcome)',
        'Urgent care visits reduced to 16 from 22 per 100 person-years, and fewer courses of prednisone, against placebo in the same trial',
        'Height gain over four to six years identical to placebo, where budesonide cost 1.1 cm (p=0.005)',
        'Short-term improvement against placebo in FEV1, FVC, PC20 FEV1, evening peak flow and symptom scores across trials of 4 to 12 weeks',
        'Unpleasant taste recorded as the only significant adverse effect across 15 trials in 1,422 children',
      ],
      unsupportedInferences: [
        'That nedocromil works by stabilising mast cells through chloride channel blockade — published as a unifying hypothesis in 1996 and never established',
        'That the short-term lung function benefit reflects a durable effect, when both long-term trials failed to reproduce it',
        'That the absence of adverse effects in trials up to six years establishes indefinite safety, rather than reflecting a molecule that is barely absorbed',
        'That its disappearance from guidelines reflects a negative evidence verdict, when the product was removed for its propellant and the deciding trial was never run',
      ],
      whatFailedInitially: [
        'The primary endpoint of the largest and longest childhood asthma trial ever conducted',
        'Consistency between short trials, which showed lung function benefit, and long trials, which did not',
        'Any identification of a molecular target: no receptor, no cloned channel, no successor molecule from the hypothesis',
        'The head-to-head comparison against inhaled corticosteroids in mild asthma that the systematic review called for in 2006',
      ],
      realWorldOutcome: [
        'Approved in the United States on 30 December 1992 as a metered-dose inhaler under NDA 019660, with a nebuliser solution in 1997 and an ophthalmic solution in 1999',
        'All three products are listed as discontinued in Drugs@FDA, and no nedocromil product currently holds an active United States label',
        'The Tilade inhaler was removed on 14 June 2010 with the last chlorofluorocarbon metered-dose inhalers, under the Montreal Protocol',
        'The Alocril record carries a Federal Register determination that it was not discontinued or withdrawn for safety or effectiveness reasons',
        'No CMS National Average Drug Acquisition Cost figure exists, because nothing is dispensed',
      ],
    },
    deliverySystem: {
      type: 'Historically a metered-dose inhaler delivering 1.75 mg per actuation, a 0.5% nebuliser solution, and a 2% ophthalmic solution — all discontinued in the United States',
      description:
        'Nedocromil was a topical drug in the strict sense: applied to the airway or conjunctival surface, acting there, and largely not absorbed. That is the source of both its safety record and its limits. The inhaled products relied on a chlorofluorocarbon propellant that the Montreal Protocol phased out, and unlike albuterol, fluticasone and the other survivors of that rule, nedocromil was never reformulated into a hydrofluoroalkane device.',
      safetyProfile:
        'Across fifteen randomised placebo-controlled trials in 1,422 children, the Cochrane reviewers recorded a good safety profile with the only significant side effect being unpleasant taste, and no significant short-term or long-term adverse effects. In the four-to-six-year CAMP trial, height gain in the nedocromil group was similar to placebo, while budesonide reduced it by 1.1 cm. As a preventer it had no role in an acute attack and was used alongside a short-acting bronchodilator. Because no United States product currently holds an active label, no current prescribing information exists to consult, and the safety statements above come from the trial literature and the regulatory marketing-status record rather than from a label in force.',
    },
    commonQuestions: [
      {
        q: 'Can I still get this?',
        a: 'Not in the United States. All three products are listed as discontinued in the FDA’s Drugs@FDA database: the Tilade metered-dose inhaler (NDA 019660), the Tilade nebuliser solution (NDA 020750) and the Alocril 2% eye drops (NDA 021009). The inhaler went on 14 June 2010, when the last chlorofluorocarbon-propelled inhalers were removed from the market under the Montreal Protocol on ozone-depleting substances. Nedocromil is still available in some other countries. If a page or a pharmacy is offering it to you in the United States, that should raise a question rather than answer one.',
      },
      {
        q: 'Was it taken off the market because it was dangerous?',
        a: 'No, and the regulatory record says so unusually explicitly. The Drugs@FDA entry for Alocril carries a Federal Register determination that the product was not discontinued or withdrawn for safety or effectiveness reasons — a finding the FDA makes so that generic applications can still reference a discontinued product. The inhaler went because of its propellant. Other inhalers facing the same rule were reformulated with a hydrofluoroalkane propellant and survived; nedocromil, by then a small product in a niche that inhaled steroids had taken over, was not worth reformulating.',
        auditNote:
          'Commercial withdrawal and safety withdrawal look identical from the outside — an empty shelf. The Federal Register determination is the document that distinguishes them, and it is worth knowing that it exists.',
      },
      {
        q: 'Did it actually work?',
        a: 'Partly, and less than was hoped. The largest test is CAMP, which treated 1,041 children for four to six years. On its primary measure, lung function after a bronchodilator, nedocromil was no different from placebo — and neither was inhaled budesonide, which is worth remembering before treating that result as a verdict on nedocromil alone. Nedocromil did significantly reduce urgent visits to a doctor, from 22 to 16 per 100 person-years, and courses of steroid tablets. Budesonide did more: fewer hospitalisations, better airway responsiveness, less reliever use. The Cochrane review of fifteen trials found real short-term improvements in lung function and symptoms, and could not reconcile those with the long-term trials, offering either milder patients or publication bias as the explanation.',
      },
      {
        q: 'How does it compare with a steroid inhaler for a child?',
        a: 'On control, the steroid was better in the one long trial that ran them side by side. On side effects, nedocromil was better: identical growth to placebo over four to six years, against 1.1 cm less height on budesonide, a difference that appeared mostly in the first year. Whether that trade is worth making in mild asthma is exactly the question the Cochrane reviewers said in 2006 needed a head-to-head trial to answer. That trial was never done, and now cannot be, because the drug is not manufactured. It is a small, clean example of a clinical question closed by a supply decision rather than by evidence.',
        auditNote:
          'CAMP was not designed as a nedocromil-against-budesonide equivalence trial in mild asthma. Reading it as one over-interprets a three-arm placebo-controlled design.',
      },
      {
        q: 'Do we actually know how it worked?',
        a: 'Not really. It is universally called a mast cell stabiliser, and it does reduce mediator release from mast cells. But no receptor was ever identified for it and no ion channel was ever cloned as its target. The best available molecular account, published in 1996, is that it inhibits chloride ion movement across the membranes of mast cells, epithelial cells and nerve endings, and the authors described that as a hypothesis that "may provide a unifying hypothesis" for the drug’s effects — their words, not a summary of them. Thirty years later, no successor molecule was ever designed from that idea, which is usually what happens when a mechanism is real and tractable.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'The Childhood Asthma Management Program Research Group. Long-term effects of budesonide or nedocromil in children with asthma. N Engl J Med 2000;343:1054-1063',
        identifier: '10.1056/NEJM200010123431501',
        kind: 'doi',
      },
      {
        label:
          'Sridhar AV, McKean M. Nedocromil sodium for chronic asthma in children. Cochrane Database Syst Rev 2006;3:CD004108',
        identifier: '10.1002/14651858.CD004108.pub2',
        kind: 'doi',
      },
      {
        label:
          'Alton EW, Norris AA. Chloride transport and the actions of nedocromil sodium and cromolyn sodium in asthma. J Allergy Clin Immunol 1996;98(5 Pt 2):S102-S105',
        identifier: '10.1016/s0091-6749(96)70024-6',
        kind: 'doi',
      },
      {
        label:
          'FDA Drugs@FDA — TILADE (nedocromil sodium) inhalation aerosol, NDA 019660, King Pharmaceuticals LLC, approved 30 December 1992, marketing status Discontinued',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22TILADE%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA — ALOCRIL (nedocromil sodium ophthalmic solution 2%), NDA 021009, Allergan, approved 8 December 1999, marketing status Discontinued with a Federal Register determination that the product was not discontinued or withdrawn for safety or effectiveness reasons',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22ALOCRIL%22',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 50294 — nedocromil structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/50294',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Omalizumab — the first asthma biologic, dosed off a table of body weight and IgE level, and
  //    the only one whose own manufacturer-run observational study reported more heart attacks and
  //    strokes in the treated group than in the untreated one.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'omalizumab',
    name: 'Omalizumab',
    tradeName: 'Xolair / Xolair PFS',
    sponsor: 'Genentech, Inc. and Novartis (BLA 103976)',
    targetGene: 'IGHE',
    targetProtein:
      'Free immunoglobulin E in circulation, bound at the same site IgE uses to engage the high-affinity receptor FcεRI on mast cells, basophils and dendritic cells — so the antibody cannot bind IgE that is already attached to a cell',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication:
      'Moderate to severe persistent asthma in adults and paediatric patients aged 6 years and older with a positive skin test or in vitro reactivity to a perennial aeroallergen and symptoms inadequately controlled with inhaled corticosteroids; chronic rhinosinusitis with nasal polyps in adults 18 years and older; IgE-mediated food allergy in adults and paediatric patients aged 1 year and older, for the reduction of allergic reactions including anaphylaxis that may occur with accidental exposure; and chronic spontaneous urticaria in adults and adolescents 12 years and older who remain symptomatic despite H1 antihistamine treatment',
    patientFriendlyIndication:
      'Allergic asthma, nasal polyps, chronic hives, and reducing the severity of accidental food allergy reactions',
    anatomicalSite:
      'The bloodstream — the antibody removes free IgE from circulation, so mast cells and basophils in the airway, skin and gut end up carrying less of it on their surface',
    conditionContext: {
      conditionExplainer:
        'IgE is the antibody of allergy. It sits on mast cells and basophils, and when an allergen cross-links two adjacent IgE molecules the cell empties its contents in seconds. Omalizumab removes IgE from circulation before it can take up that position — and only free IgE, because the site it binds is the one already occupied on any IgE that has landed on a cell.',
      whyItMatters:
        'This is the original asthma biologic, licensed in 2003, and the design constraint it lives under is unusual. The dose is read off a table of body weight and total serum IgE, and the drug can only be given to people whose baseline IgE falls between 30 and 700 IU/mL for asthma. People whose IgE is too high to dose are the ones with the most of the target.',
      whoTakesThis:
        'People aged 6 and over with moderate to severe persistent allergic asthma who are still symptomatic on inhaled corticosteroids and have proven reactivity to a perennial allergen; and, in three later indications, people with nasal polyps, chronic spontaneous urticaria, or IgE-mediated food allergy from age 1.',
      clinicalGoals:
        'Fewer exacerbations and fewer hospitalisations in asthma; fewer hives; and in food allergy, a higher threshold before an accidental exposure causes a reaction. Not a cure for allergy and not a licence to eat the food.',
    },
    oneSentenceVerdict:
      'The first anti-IgE antibody, which across ten randomised trials in 3,261 patients cut the proportion having an asthma exacerbation from 26% to 16% (OR 0.55) and hospitalisations from 3% to 0.5% (OR 0.16), carries a boxed warning for anaphylaxis occurring after the first dose or beyond a year, and whose own post-marketing observational study reported 13.4 against 8.1 serious cardiovascular and cerebrovascular events per 1,000 patient-years in treated against untreated patients.',
    laymanHowItWorks:
      'Allergy runs on an antibody called IgE. It parks on the surface of mast cells, and when it meets the thing you are allergic to it triggers the cell to release everything it is holding. Omalizumab is an antibody that grabs IgE while it is still floating in the blood, before it can park. Over weeks, the mast cells lose most of their surface IgE and become much harder to set off. It cannot remove IgE that has already docked, which is why the effect builds over months rather than days.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    substitutes: {
      summary:
        'Omalizumab is the only one of the asthma biologics selected by IgE and allergen sensitisation rather than by eosinophil count, so the alternatives are not interchangeable with it — they are aimed at a partly different population. Where they overlap, no randomised head-to-head trial has been published in severe asthma, and the 2018 independent economic review found the whole class, this drug included, priced at least 50% above value.',
      conventionalRx: [
        {
          name: 'Mepolizumab (Nucala) or benralizumab (Fasenra)',
          class: 'Anti-interleukin-5 pathway monoclonal antibodies',
          howItCompares:
            'Selected on blood eosinophil count rather than on IgE and skin-test reactivity, and dosed at a fixed amount rather than off a weight-and-IgE table. Many patients with severe asthma qualify for both on paper, and no randomised trial has compared them in asthma. Neither carries a boxed warning; omalizumab does.',
          typicalCost:
            'None of these molecules has a published CMS National Average Drug Acquisition Cost figure — all move through specialty channels the retail pharmacy survey does not cover',
          prosAndCons:
            'Pros: no IgE ceiling, fixed dosing, no boxed warning, and a longer interval for benralizumab. Cons: no effect in the non-eosinophilic allergic patient omalizumab was built for, and no indication in food allergy or chronic urticaria.',
        },
        {
          name: 'Dupilumab (Dupixent)',
          class: 'Anti-interleukin-4 receptor alpha monoclonal antibody',
          howItCompares:
            'Blocks the pathway that drives IgE production in the first place rather than removing IgE after it is made, and produces a consistently larger lung function effect than either anti-IgE or anti-IL-5. It has no IgE dosing ceiling and covers eczema and eosinophilic oesophagitis, which omalizumab does not.',
          typicalCost: 'Specialty biologic, not covered by the CMS retail acquisition cost survey',
          prosAndCons:
            'Pros: broader type 2 coverage, larger FEV1 effect, fixed dosing. Cons: no chronic urticaria licence in the same form, transient blood hypereosinophilia in a minority.',
        },
        {
          name: 'Oral immunotherapy for peanut allergy',
          class: 'Allergen desensitisation',
          howItCompares:
            'The comparison that matters in food allergy, and the only other approved treatment. Omalizumab was tested as monotherapy against placebo rather than against immunotherapy: 67% of 118 children reached the 600 mg peanut protein threshold against 7% of 59 on placebo (P<0.001). No trial has compared it head to head with oral immunotherapy.',
          typicalCost:
            'Peanut oral immunotherapy is a prescription product; omalizumab has no published acquisition cost figure',
          prosAndCons:
            'Pros of omalizumab: works against several foods at once, no daily dosing of the allergen. Cons: it is a maintenance injection with no durable tolerance shown after stopping, and the trial did not test whether it beats immunotherapy.',
        },
        {
          name: 'High-dose inhaled corticosteroid plus a long-acting beta-agonist',
          class: 'Standard inhaled controller therapy',
          howItCompares:
            'What every omalizumab trial used as background therapy in both arms. The Cochrane analysis reports the drug’s effect on top of that, not instead of it: exacerbations 26% to 16% and hospitalisations 3% to 0.5%. Participants on omalizumab were also 2.5 times as likely to be able to withdraw their inhaled steroid completely.',
          typicalCost:
            'Generic inhaled corticosteroids remain among the cheapest asthma controllers',
          prosAndCons:
            'Pros: cheap, universal, the foundation of every guideline. Cons: local and systemic corticosteroid effects, and inadequate control in exactly the population omalizumab is for.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'The first several doses belong in a clinic',
          action:
            'Expect to be observed after the injection, especially for the first three doses, and know the symptoms of anaphylaxis.',
          patientImpact:
            'The boxed warning records anaphylaxis presenting as bronchospasm, hypotension, syncope, urticaria or angioedema of the throat or tongue, occurring after the first dose or beyond a year of treatment. Anaphylaxis was reported in 3 of 3,507 (0.1%) patients in premarketing trials and at an estimated 0.2% or more in post-marketing data, with approximately 60 to 70% of post-marketing cases occurring within the first three doses.',
          clinicalPrecaution:
            'The label directs that treatment be initiated only in a healthcare setting equipped to manage anaphylaxis. In two clinical trial cases onset was 90 minutes after administration and in another 2 hours, so the risk window extends well past the few minutes people expect.',
        },
        {
          name: 'It is not a reason to stop carrying your adrenaline pen',
          action:
            'Keep the epinephrine auto-injector, the reliever inhaler and the avoidance plan exactly as before.',
          patientImpact:
            'In the food allergy indication the label frames the benefit as reducing allergic reactions including anaphylaxis that may occur with accidental exposure. The OUtMATCH trial measured a raised reaction threshold — 67% of treated children tolerated 600 mg or more of peanut protein against 7% on placebo — not the removal of allergy. Section 5.3 states the drug has not been shown to relieve asthma exacerbations acutely and must not be used for acute bronchospasm or status asthmaticus.',
          clinicalPrecaution:
            'A higher threshold means a smaller accidental exposure is survivable. It does not mean a deliberate exposure is safe.',
        },
        {
          name: 'Report joint pain, rash and fever in the first week',
          action:
            'Tell the prescriber about arthritis or joint pain, rash, fever or swollen glands appearing one to five days after an injection.',
          patientImpact:
            'Section 5.6 records a constellation of arthritis or arthralgia, rash, fever and lymphadenopathy with onset 1 to 5 days after the first or subsequent injections — a serum sickness-like pattern.',
          clinicalPrecaution:
            'The label directs stopping omalizumab if a patient develops this constellation, rather than treating through it.',
        },
        {
          name: 'Ask what your IgE level is before you plan on this drug',
          action: 'Ask for the total serum IgE result and your weight-based dose band.',
          patientImpact:
            'The asthma dose is read from a table of body weight and pretreatment total serum IgE, and the label requires a baseline IgE between 30 and 700 IU/mL. Below 30 there is thought to be too little target to matter; above 700 the dose required cannot be given.',
          clinicalPrecaution:
            'Total IgE should not be rechecked to guide dosing during treatment: omalizumab-IgE complexes raise measured total IgE without reflecting free IgE, so the number becomes uninterpretable once therapy starts.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Humanised IgG1 kappa monoclonal antibody produced in a Chinese hamster ovary cell suspension culture',
      molecularWeight: 'Approximately 149 kiloDaltons',
      targetReceptorAffinity:
        'Binds free IgE at the Cε3 domain — the same region IgE uses to engage the high-affinity receptor FcεRI — so it cannot bind IgE that is already receptor-bound and therefore cannot cross-link mast cells. That non-anaphylactogenic design is the reason the molecule is usable at all, and it is also why the effect is indirect and slow: surface IgE falls only as receptor-bound IgE turns over and is not replaced. The label states that for asthma and food allergy omalizumab inhibits the binding of IgE to FcεRI on mast cells, basophils and dendritic cells, and that for chronic spontaneous urticaria it binds IgE and lowers free IgE levels while the mechanism by which symptoms improve remains unknown.',
      structureSource: {
        label:
          'XOLAIR (omalizumab) United States prescribing information, Description section 11 and Clinical Pharmacology section 12.1 (BLA 103976)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7f6a2191-adfb-48b9-9bfa-0d9920479f0d',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'oma-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Prove it cannot bind receptor-bound IgE',
          description:
            'An anti-IgE antibody that binds IgE already sitting on a mast cell would cross-link receptors and cause the exact reaction it is meant to prevent. The entire therapeutic concept rests on epitope selection: omalizumab must engage the Cε3 region that FcεRI occupies, and therefore must be incapable of reaching IgE that is already docked. This is a release-relevant identity test, not a discovery-stage curiosity.',
          reagentsAndBuffer:
            'Recombinant human IgE, soluble FcεRIα ectodomain, competition binding by surface plasmon resonance, basophil activation test with donor cells sensitised in vitro as the functional negative control',
        },
        {
          id: 'oma-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch expression in Chinese hamster ovary suspension culture',
          description:
            'The label specifies production in CHO cell suspension culture. A humanised IgG1 at this scale is a standard fed-batch process, with the glycan and charge distribution held inside specification across a campaign because those attributes carry into half-life and effector engagement.',
          dependsOnStepId: 'oma-w1',
          reagentsAndBuffer:
            'Chemically defined CHO medium, glucose and amino acid feeds, controlled pH, dissolved oxygen and temperature shift, antifoam',
        },
        {
          id: 'oma-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Capture, viral clearance, and an aggregate limit that matters more than usual',
          description:
            'Protein A capture, low-pH viral inactivation, ion exchange polishing and formulation. Aggregate control is the critical specification here for a specific reason: aggregated anti-IgE is multivalent, and a multivalent anti-IgE can cross-link cell-bound IgE even when the monomer cannot. The boxed warning for anaphylaxis makes this a safety attribute rather than a quality metric.',
          dependsOnStepId: 'oma-w2',
          reagentsAndBuffer:
            'Protein A resin, low-pH hold with Tris neutralisation, anion and cation exchange, nanofiltration, tangential flow filtration into the final histidine-based formulation',
        },
        {
          id: 'oma-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure free IgE, not total IgE',
          description:
            'Once dosing starts, total serum IgE rises because omalizumab-IgE complexes are cleared more slowly than free IgE, and the total assay counts them. The pharmacodynamically meaningful quantity is free IgE, which requires an assay that does not detect complexed antibody. Using a total IgE assay after treatment begins produces a number that moves in the wrong direction and looks like treatment failure.',
          dependsOnStepId: 'oma-w3',
          reagentsAndBuffer:
            'Free IgE immunoassay using a capture reagent that does not compete with omalizumab, paired total IgE assay for contrast, baseline and trough sampling',
        },
        {
          id: 'oma-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Confirm surface FcεRI down-regulation on basophils',
          description:
            'The clinical effect is not free IgE suppression itself but what follows it: as free IgE falls, unoccupied FcεRI is internalised and basophil and mast cell surface receptor density drops, which takes weeks. Measuring receptor density and basophil activation threshold is the assay that connects the biochemistry to the delayed onset patients experience, and it is the one that explains why a fortnight of treatment feels like nothing.',
          dependsOnStepId: 'oma-w4',
          reagentsAndBuffer:
            'Whole blood basophil immunophenotyping by flow cytometry for surface FcεRI and IgE density, anti-IgE and allergen-stimulated CD63 or CD203c upregulation as the activation readout, serial sampling over 12 to 16 weeks',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oma-a1',
        category: 'measured',
        title: 'Exacerbations from 26% to 16%, hospitalisations from 3% to 0.5%',
        laymanSummary:
          'A Cochrane review pooled 25 trials. In people with moderate or severe asthma already on inhaled steroids, the proportion having an exacerbation fell from 26% on placebo to 16% on omalizumab, and hospitalisation from 3% to 0.5%.',
        technicalDetails:
          'The 2014 Cochrane review by Normansell and colleagues included 25 trials, 19 of them of subcutaneous anti-IgE as an adjunct to corticosteroid treatment. For participants with moderate or severe asthma on background inhaled corticosteroid therapy, the odds ratio for experiencing an asthma exacerbation was 0.55 (95% CI 0.42 to 0.60) across ten studies and 3,261 participants — an absolute reduction from 26% to 16% over 16 to 60 weeks. Hospitalisations gave an odds ratio of 0.16 (95% CI 0.06 to 0.42) across four studies and 1,824 participants, an absolute reduction from 3% to 0.5% over 28 to 60 weeks. Participants on omalizumab were significantly more likely to be able to withdraw inhaled corticosteroids completely (OR 2.50, 95% CI 2.00 to 3.13), with a small but statistically significant reduction in daily inhaled steroid dose. The hospitalisation data were reported for the combined moderate-to-severe population, with no separate figures for the severe subgroup — which is the population the drug is actually licensed and used in.',
        evidenceSource:
          'Normansell R, Walker S, Milan SJ, Walters EH, Nair P. Omalizumab for asthma in adults and children. Cochrane Database Syst Rev 2014;1:CD003559',
        doi: '10.1002/14651858.CD003559.pub4',
        measuredMetric:
          'Odds of experiencing an asthma exacerbation and odds of hospitalisation, subcutaneous omalizumab against placebo on background inhaled corticosteroid therapy',
        auditFlag: 'verified',
      },
      {
        id: 'oma-a2',
        category: 'failed',
        title: 'The manufacturer’s own observational study found more heart attacks and strokes',
        laymanSummary:
          'A large post-marketing study comparing treated with untreated asthma patients reported 13.4 serious heart and stroke events per 1,000 patient-years on omalizumab against 8.1 in those not taking it, including more myocardial infarctions and pulmonary emboli. It is on the label.',
        technicalDetails:
          'Section 5 of the XOLAIR label records that in an observational study, rates of serious cardiovascular and cerebrovascular events were higher in omalizumab-treated patients at 13.4 per 1,000 patient-years against 8.1 per 1,000 patient-years in control patients, with increased rates of myocardial infarction and pulmonary embolism among them. The same study is the source of the reassuring malignancy figures — 12.3 against 13.0 per 1,000 patient-years — so the design cannot simply be dismissed when its result is inconvenient and accepted when it is not. The critical limitation is that this is an observational comparison and the omalizumab group had more severe asthma and more baseline cardiovascular risk factors by construction: sicker patients get the expensive drug. Confounding by indication is the obvious explanation and it has never been excluded by a randomised comparison, because no randomised trial of this drug was ever powered for cardiovascular outcomes. The finding sits on the label unresolved, which is the honest position and an uncomfortable one.',
        evidenceSource:
          'XOLAIR (omalizumab) United States prescribing information, Warnings and Precautions — Cardiovascular and Cerebrovascular Events (BLA 103976)',
        measuredMetric:
          'Serious cardiovascular and cerebrovascular events per 1,000 patient-years, omalizumab-treated against non-treated asthma patients in a post-marketing observational study',
        auditFlag: 'contested',
      },
      {
        id: 'oma-a3',
        category: 'conclusion_shift',
        title: 'The malignancy signal from the trials did not survive the larger study',
        laymanSummary:
          'The registration trials showed cancers in 0.5% of treated patients against 0.2% of controls, and the label carries the warning. A much larger observational study afterwards found essentially identical rates in both groups — 12.3 against 13.0 per 1,000 patient-years.',
        technicalDetails:
          'The label records that in clinical studies, malignant neoplasms were observed in 20 of 4,127 (0.5%) omalizumab-treated patients against 5 of 2,236 (0.2%) control patients. A subsequent observational study reported similar incidence rates between groups: 12.3 per 1,000 patient-years in omalizumab-treated patients against 13.0 per 1,000 patient-years in non-treated patients. This is a conclusion shift in the direction that almost never gets reported: an early safety signal that a larger, longer study failed to confirm, and in fact reversed the direction of. The original imbalance was 15 extra events across more than four thousand patients, with short latency and no tissue clustering — the same statistical shape as the reslizumab malignancy warning, and it resolved the same way once the denominator grew. Both figures remain in the label side by side, which is the correct way to record it and is not how the warning is usually summarised.',
        evidenceSource:
          'XOLAIR (omalizumab) United States prescribing information, Warnings and Precautions — Malignancy (BLA 103976)',
        measuredMetric:
          'Malignant neoplasm incidence in the randomised programme against incidence per 1,000 patient-years in the post-marketing observational study',
        auditFlag: 'verified',
      },
      {
        id: 'oma-a4',
        category: 'measured',
        title: 'In inner-city children, one fewer child in five having an exacerbation',
        laymanSummary:
          'A 419-participant trial in inner-city children and young adults added omalizumab to standard care for 60 weeks. The proportion having at least one exacerbation fell from 48.8% to 30.3%, and symptom days fell by a quarter — while inhaled steroid and long-acting beta-agonist use went down, not up.',
        technicalDetails:
          'The Inner-City Anti-IgE Therapy for Asthma trial randomised 419 inner-city children, adolescents and young adults with persistent asthma, 73% of them with moderate or severe disease, to omalizumab or placebo added to guidelines-based therapy for 60 weeks. Days with asthma symptoms fell from 1.96 to 1.48 per two-week interval, a 24.5% decrease (P<0.001). The proportion with one or more exacerbations fell from 48.8% to 30.3% (P<0.001). The authors note these improvements occurred despite reductions in inhaled glucocorticoid and long-acting beta-agonist use, and that seasonal peaks in exacerbations were nearly eliminated. The seasonal finding is the most mechanistically interesting result in the omalizumab literature: autumn exacerbation peaks in allergic children are driven by rhinovirus infection in a sensitised airway, and blunting them with an anti-IgE antibody is evidence that the allergic and viral pathways converge rather than run in parallel.',
        evidenceSource:
          'Busse WW, Morgan WJ, Gergen PJ, et al. Randomized trial of omalizumab (anti-IgE) for asthma in inner-city children. N Engl J Med 2011;364:1005-1015, NCT00377572',
        doi: '10.1056/NEJMoa1009705',
        measuredMetric:
          'Days with asthma symptoms per two-week interval and proportion with one or more exacerbations over 60 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'oma-a5',
        category: 'measured',
        title: 'Food allergy: a raised threshold, not a cure, and the trial says which',
        laymanSummary:
          'In 177 children allergic to peanut and at least two other foods, 67% on omalizumab could eat 600 mg of peanut protein without dose-limiting symptoms after 16 weeks, against 7% on placebo. That is roughly two peanuts, not a peanut butter sandwich.',
        technicalDetails:
          'OUtMATCH randomised 180 people aged 1 to 55 allergic to peanut and at least two of cashew, milk, egg, walnut, wheat and hazelnut, 2:1 to omalizumab or placebo dosed by weight and IgE every 2 to 4 weeks for 16 to 20 weeks. The analysis population was the 177 children and adolescents aged 1 to 17. The primary endpoint — ingestion of 600 mg or more of peanut protein in a single dose without dose-limiting symptoms — was met by 79 of 118 (67%) on omalizumab against 4 of 59 (7%) on placebo, P<0.001. Key secondary endpoints were consistent: cashew 41% against 3%, milk 66% against 10%, egg 67% against 0%, all P<0.001. Safety endpoints did not differ apart from more injection-site reactions. Two limits are in the design rather than the result. Entry required reacting to 100 mg or less of peanut protein, so this is the most reactive end of the population. And the endpoint is a challenge threshold under supervision, not free eating: a third of treated children did not reach even that threshold, and the trial establishes protection against accidental exposure rather than tolerance.',
        evidenceSource:
          'Wood RA, Togias A, Sicherer SH, et al. Omalizumab for the treatment of multiple food allergies. N Engl J Med 2024;390:889-899, NCT03881696',
        doi: '10.1056/NEJMoa2312382',
        measuredMetric:
          'Proportion ingesting 600 mg or more of peanut protein in a single dose without dose-limiting symptoms after 16 to 20 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'oma-a6',
        category: 'failed',
        title: 'A boxed warning for the reaction the drug exists to prevent',
        laymanSummary:
          'Omalizumab is given to stop anaphylaxis, and it carries a boxed warning for causing it. The reaction can arrive after the first dose or after more than a year, and roughly two-thirds of reported cases came within the first three doses.',
        technicalDetails:
          'The boxed warning records anaphylaxis presenting as bronchospasm, hypotension, syncope, urticaria and angioedema of the throat or tongue, occurring after the first dose or beyond one year of treatment, and directs that treatment be initiated only in a healthcare setting equipped to manage it. Section 5.1 reports anaphylaxis in 3 of 3,507 (0.1%) patients in premarketing clinical trials, with onset 90 minutes after administration in two patients and 2 hours in another, and estimates at least 0.2% from post-marketing reports, of which approximately 60 to 70% occurred within the first three doses. The design of the molecule is specifically intended to avoid this: omalizumab binds the Cε3 region of IgE that the high-affinity receptor occupies, so it cannot engage IgE already bound to a mast cell and cannot cross-link it. The reactions therefore appear to be hypersensitivity to the antibody itself rather than the mechanism failing — which is a different problem with the same clinical presentation, and one no amount of epitope engineering removes.',
        evidenceSource:
          'XOLAIR (omalizumab) United States prescribing information, Boxed Warning and Warnings and Precautions 5.1 (BLA 103976)',
        measuredMetric:
          'Anaphylaxis incidence in the premarketing programme and in post-marketing reports, with timing relative to dose number',
        auditFlag: 'caution',
      },
      {
        id: 'oma-a7',
        category: 'inferred',
        title: 'Dosed off an IgE table that excludes the people with the most IgE',
        laymanSummary:
          'The asthma dose is read from a grid of body weight and total IgE, and you have to fall between 30 and 700 IU/mL to be treatable. People whose IgE is above 700 — who by the drug’s own logic have the most target — cannot be dosed at all.',
        technicalDetails:
          'The asthma dosing tables require a pretreatment total serum IgE between 30 and 700 IU/mL, with dose set by that value and body weight. The ceiling is a practical constraint rather than a biological finding: at higher IgE the milligram amount required to suppress free IgE adequately exceeds what can be injected. The implicit claim in the dosing scheme is that free IgE suppression is what produces benefit and that the table delivers enough of it, but the relationship between baseline IgE, achieved free IgE suppression and clinical response has never been shown to be tight — trials have repeatedly failed to identify baseline IgE as a good predictor of who responds, and response prediction in practice leans on eosinophil count, FeNO and skin-test reactivity instead. There is also a measurement trap: total IgE rises during treatment because omalizumab-IgE complexes clear slowly and the standard assay counts them, so the number used to set the dose becomes uninterpretable the moment dosing begins.',
        evidenceSource:
          'XOLAIR (omalizumab) United States prescribing information, Dosage and Administration for asthma and Clinical Pharmacology (BLA 103976)',
        inferredClaim:
          'That the weight-and-IgE dosing table delivers the free IgE suppression that produces clinical benefit, and that baseline total IgE identifies who will respond — the logic the dosing scheme embodies, without a demonstrated exposure-response relationship behind it',
        auditFlag: 'caution',
      },
      {
        id: 'oma-a8',
        category: 'inferred',
        title: 'Priced above value for the whole class, on this evidence',
        laymanSummary:
          'The Institute for Clinical and Economic Review assessed omalizumab alongside the four other asthma biologics in 2018 and concluded that all five modestly reduce attacks and improve quality of life, and that prices across the class would need to fall by at least half to be cost-effective.',
        technicalDetails:
          'ICER’s final evidence report of 20 December 2018 covered dupilumab, omalizumab, mepolizumab, reslizumab and benralizumab. Its stated conclusion was that all five modestly reduce asthma exacerbations and improve daily quality of life, but that net prices appeared far out of alignment with those incremental clinical benefits, and that the entire class would need price discounts of at least 50% to reach commonly cited cost-effectiveness thresholds. Two things qualify it. The analysis rests on assumptions about net price that manufacturers do not publish, so it is a judgement rather than a measurement. And it predates the food allergy indication, which changed what omalizumab is used for and therefore what it would need to be worth. It is recorded here because the clinical claim and the value claim are separate, and only the clinical one appears in prescribing material.',
        evidenceSource:
          'Institute for Clinical and Economic Review, Biologic Therapies for Treatment of Asthma Associated with Type 2 Inflammation, Final Evidence Report, 20 December 2018',
        inferredClaim:
          'That the measured exacerbation and hospitalisation reductions justify the price charged — an inference an independent review rejected for all five drugs in the class at once',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A dose read off a grid, not a fixed amount',
        laymanDesc:
          'Before the first injection, two numbers are measured: your weight and your total IgE level. Those decide the dose and how often it is given. If your IgE is above 700, the drug cannot be given for asthma at all.',
        molecularDetail:
          'A 149 kDa humanised IgG1 kappa antibody produced in Chinese hamster ovary suspension culture, dosed subcutaneously every 2 or 4 weeks according to a table of body weight and pretreatment total serum IgE, with an asthma dosing range of 30 to 700 IU/mL. Treatment must be initiated in a healthcare setting equipped to manage anaphylaxis.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It grabs IgE that has not landed yet',
        laymanDesc:
          'The antibody binds IgE floating free in the blood. It deliberately cannot bind IgE that has already parked on a mast cell — which would be catastrophic, because that would trigger the cell.',
        molecularDetail:
          'Binding to the Cε3 domain of free IgE, the same region that engages the high-affinity receptor FcεRI. Because the epitope is occluded on receptor-bound IgE, omalizumab is non-anaphylactogenic by design: it cannot cross-link surface IgE. The label describes it as inhibiting the binding of IgE to FcεRI on mast cells, basophils and dendritic cells.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Free IgE falls, and total IgE goes up',
        laymanDesc:
          'The amount of unbound IgE drops sharply. Confusingly, the ordinary blood test for total IgE rises, because it counts the IgE stuck to the drug as well.',
        molecularDetail:
          'Omalizumab-IgE complexes are cleared more slowly than free IgE, so measured total IgE rises during treatment while free IgE falls. Total IgE is therefore uninterpretable for monitoring once dosing has begun, and only a free IgE assay reports the pharmacodynamically meaningful quantity.',
        iconName: 'TrendingDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Mast cells slowly lose their triggers',
        laymanDesc:
          'With less IgE arriving, the receptors on mast cells and basophils go unoccupied and get pulled inside the cell. Over weeks the cells become much harder to set off. This is why nothing seems to happen for the first month.',
        molecularDetail:
          'Unoccupied FcεRI is internalised, so surface receptor density on basophils and mast cells falls progressively as receptor-bound IgE turns over and is not replaced. The delay between free IgE suppression, which is rapid, and receptor down-regulation, which is not, is the pharmacological basis of the 12 to 16 week trial period before response is assessed.',
        iconName: 'CircleSlash',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer attacks, fewer admissions, and less inhaled steroid',
        laymanDesc:
          'Across the pooled trials, the share of people having an exacerbation dropped from about a quarter to about a sixth, and hospital admissions from 3% to 0.5%. More people were able to come off their inhaled steroid entirely.',
        molecularDetail:
          'Cochrane 2014: exacerbation odds ratio 0.55 (95% CI 0.42 to 0.60), absolute 26% to 16% across 3,261 participants; hospitalisation odds ratio 0.16 (95% CI 0.06 to 0.42), absolute 3% to 0.5% across 1,824. Complete inhaled corticosteroid withdrawal odds ratio 2.50 (95% CI 2.00 to 3.13). ICATA in 419 inner-city children: exacerbations 48.8% to 30.3% (P<0.001) with seasonal peaks nearly eliminated.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the two things the label will not settle',
        laymanDesc:
          'A boxed warning for anaphylaxis, in a drug given to prevent anaphylaxis. And an observational study reporting more heart attacks and strokes in treated patients, which no randomised trial has ever been designed to confirm or refute.',
        molecularDetail:
          'Anaphylaxis in 3 of 3,507 (0.1%) premarketing patients and an estimated 0.2% or more post-marketing, 60 to 70% of cases within the first three doses, onset up to 2 hours after injection. Serious cardiovascular and cerebrovascular events 13.4 against 8.1 per 1,000 patient-years in the observational study, with more myocardial infarction and pulmonary embolism, in a treated group with more severe disease at baseline.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Normansell 2014 — Cochrane review of omalizumab for asthma in adults and children (CD003559)',
        phase: 'Systematic review and meta-analysis of 25 randomised controlled trials',
        sampleSize: 3261,
        primaryEndpoint:
          'Proportion of participants experiencing an asthma exacerbation on subcutaneous omalizumab against placebo, on background inhaled corticosteroid therapy',
        endpointMet: true,
        statisticalPValue:
          'Odds ratio 0.55 (95% CI 0.42 to 0.60) across ten studies and 3,261 participants, an absolute reduction from 26% to 16% over 16 to 60 weeks',
        unreportedAdverseSignals:
          'Hospitalisation data (OR 0.16, absolute 3% to 0.5%) were reported only for the combined moderate-to-severe population, with no separate figures for the severe subgroup that the drug is licensed for. Trials with co-interventions were eligible provided the co-intervention was identical in both arms.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ICATA — Inner-City Anti-IgE Therapy for Asthma (NCT00377572)',
        phase:
          'Randomised, double-blind, placebo-controlled, parallel-group, multicentre, 60 weeks',
        sampleSize: 419,
        primaryEndpoint:
          'Days with asthma symptoms per two-week interval in inner-city children, adolescents and young adults with persistent asthma on guidelines-based therapy',
        endpointMet: true,
        statisticalPValue:
          'Symptom days fell from 1.96 to 1.48 per two-week interval, a 24.5% decrease, P<0.001; participants with one or more exacerbations fell from 48.8% to 30.3%, P<0.001',
        unreportedAdverseSignals:
          'The benefit was obtained while inhaled glucocorticoid and long-acting beta-agonist use were being reduced, which strengthens the result. The trial was funded jointly by the NIAID and Novartis.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'OUtMATCH stage 1 — omalizumab for multiple food allergies (NCT03881696)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, 2:1 allocation',
        sampleSize: 177,
        primaryEndpoint:
          'Ingestion of 600 mg or more of peanut protein in a single dose without dose-limiting symptoms after 16 to 20 weeks',
        endpointMet: true,
        statisticalPValue:
          '79 of 118 (67%) against 4 of 59 (7%), P<0.001; cashew 41% against 3%, milk 66% against 10%, egg 67% against 0%, all P<0.001',
        unreportedAdverseSignals:
          'Entry required reacting to 100 mg or less of peanut protein, selecting the most reactive patients. A third of treated children did not reach the 600 mg threshold. The endpoint is a supervised challenge threshold, not free eating, and no durable tolerance after stopping was assessed in this stage.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Asthma exacerbations reduced from 26% to 16% of participants across ten trials and 3,261 patients (OR 0.55, 95% CI 0.42 to 0.60)',
        'Hospitalisations reduced from 3% to 0.5% across four trials and 1,824 patients (OR 0.16, 95% CI 0.06 to 0.42)',
        'Exacerbations in 419 inner-city children reduced from 48.8% to 30.3% over 60 weeks (P<0.001)',
        'Peanut challenge threshold of 600 mg or more reached by 67% against 7% on placebo in 177 children (P<0.001)',
        'Anaphylaxis in 3 of 3,507 (0.1%) premarketing patients, estimated at least 0.2% post-marketing',
        'Serious cardiovascular and cerebrovascular events 13.4 against 8.1 per 1,000 patient-years in an observational cohort',
      ],
      unsupportedInferences: [
        'That the cardiovascular signal is confounding by indication — the most likely explanation, never tested by a randomised comparison',
        'That baseline total serum IgE identifies who will respond, which trials have repeatedly failed to demonstrate despite the dose being set from it',
        'That the food allergy result means the food can be eaten, when the endpoint was a supervised challenge threshold of roughly two peanuts',
        'That the price is aligned with the benefit, which an independent 2018 review rejected for the entire class',
      ],
      whatFailedInitially: [
        'A boxed warning for anaphylaxis in a drug engineered specifically to be non-anaphylactogenic',
        'The early malignancy imbalance of 0.5% against 0.2%, which the larger observational study did not confirm and effectively reversed',
        'The observational cardiovascular finding, which remains on the label unresolved twelve years on',
        'Hospitalisation data that could never be separated out for the severe asthma subgroup the drug is licensed for',
      ],
      realWorldOutcome: [
        'Approved in the United States on 20 June 2003 under BLA 103976, the first biologic licensed for asthma anywhere',
        'Indications since extended to chronic spontaneous urticaria, chronic rhinosinusitis with nasal polyps, and in 2024 to IgE-mediated food allergy from age 1',
        'The only asthma biologic dosed off a table of body weight and serum IgE, and the only one with an eligibility ceiling on its own biomarker',
        'The only one of the five asthma biologics carrying a boxed warning',
        'No CMS National Average Drug Acquisition Cost figure is published, because the drug moves through specialty channels the retail pharmacy survey does not cover',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection every 2 or 4 weeks, at a dose read from a table of body weight and pretreatment total serum IgE, supplied as a lyophilised powder for reconstitution and as prefilled syringes and autoinjectors',
      description:
        'Treatment must be initiated in a healthcare setting equipped to manage anaphylaxis, and patients are observed afterwards. Response is conventionally assessed at 12 to 16 weeks, because the delay between free IgE suppression and down-regulation of surface FcεRI on mast cells and basophils means the clinical effect builds over months. Total serum IgE rises during treatment as omalizumab-IgE complexes accumulate, so the baseline measurement cannot be repeated to guide dosing once therapy has started.',
      safetyProfile:
        'Carries a boxed warning for anaphylaxis presenting as bronchospasm, hypotension, syncope, urticaria or angioedema of the throat or tongue, which has occurred after a first dose and beyond a year of treatment, with approximately 60 to 70% of post-marketing cases within the first three doses and onsets recorded up to 2 hours after injection. Malignant neoplasms were seen in 0.5% of treated against 0.2% of control patients in the randomised programme, with a subsequent observational study finding similar rates between groups (12.3 against 13.0 per 1,000 patient-years). The same observational study reported higher rates of serious cardiovascular and cerebrovascular events in treated patients (13.4 against 8.1 per 1,000 patient-years), including myocardial infarction and pulmonary embolism. A serum sickness-like constellation of arthritis or arthralgia, rash, fever and lymphadenopathy has occurred 1 to 5 days after a first or subsequent injection and the label directs stopping the drug if it appears. Rare cases of serious systemic eosinophilia, sometimes with features of vasculitis consistent with Churg-Strauss syndrome, have been reported. It has not been shown to relieve asthma exacerbations acutely and must not be used for acute bronchospasm or status asthmaticus.',
    },
    commonQuestions: [
      {
        q: 'Why does my IgE level decide whether I can have it, and why can it be too high?',
        a: 'The dose is read off a grid of body weight and pretreatment total serum IgE, and for asthma the label requires a baseline between 30 and 700 IU/mL. Below 30 there is thought to be too little target to make a difference. Above 700 the problem is arithmetic rather than biology: the amount of antibody needed to mop up that much IgE exceeds what can practically be injected, so the drug simply cannot be dosed. It is an uncomfortable feature of the design — the people with the most of the thing the drug removes are the ones it cannot be given to. There is one further wrinkle worth knowing: once you start treatment, the ordinary total IgE blood test goes up, not down, because it counts the IgE that is stuck to the drug. That number stops meaning anything after the first dose.',
        auditNote:
          'Baseline IgE sets the dose but has repeatedly failed to predict who responds. Prediction in practice leans on eosinophil count, exhaled nitric oxide and skin-test reactivity instead.',
      },
      {
        q: 'Why does a drug for allergy carry a warning for causing anaphylaxis?',
        a: 'Because it does, rarely, and the mechanism is not the one you would expect. Omalizumab was engineered specifically so it cannot bind IgE that has already docked on a mast cell — if it could, it would cross-link those cells and set off exactly the reaction it exists to prevent. It binds a region of IgE that is hidden once the antibody is receptor-bound. So the anaphylaxis that does occur appears to be hypersensitivity to the injected antibody itself, the same kind of reaction any protein drug can cause, rather than the mechanism misfiring. It was reported in 3 of 3,507 patients in the trials and estimated at 0.2% or more afterwards, with about two-thirds of cases in the first three doses, and onset as late as two hours after the injection. That is why the first doses are given somewhere equipped to treat it.',
      },
      {
        q: 'Should I be worried about the heart and stroke findings?',
        a: 'You should know about them and you should know how weak the evidence is in both directions. The label records an observational study in which serious cardiovascular and cerebrovascular events occurred at 13.4 per 1,000 patient-years in treated patients against 8.1 in untreated ones, with more heart attacks and pulmonary embolisms. The obvious problem with that comparison is that people prescribed an expensive biologic have worse asthma and more cardiovascular risk to begin with, so the two groups were never alike. The obvious problem with dismissing it on those grounds is that the same study is the source of the reassuring cancer numbers everyone quotes, and you cannot accept one result and reject the other on design. No randomised trial was ever powered to settle it, and twenty-three years after approval none is planned.',
        auditNote:
          'This is the shape of an unresolved observational safety signal: plausible confounding, real numbers, and no trial that would answer it.',
      },
      {
        q: 'Does the food allergy approval mean my child can eat peanuts?',
        a: 'No, and the trial is careful about this even where the coverage was not. OUtMATCH measured whether a child could swallow 600 mg or more of peanut protein in a single supervised dose without dose-limiting symptoms — roughly two peanuts. Sixty-seven percent of treated children managed it against 7% on placebo, which is a large effect. But every child in the trial reacted to 100 mg or less at entry, so this is the most sensitive end of the population, and a third of the treated children still did not reach the threshold. The label frames the benefit as reducing reactions that may occur with accidental exposure. That is protection against a trace amount in a shared kitchen, not permission to eat the food. The adrenaline pen and the avoidance plan stay exactly as they were.',
      },
      {
        q: 'How long before I know whether it is working?',
        a: 'Three to four months, and there is a real pharmacological reason rather than caution behind that. Free IgE in your blood falls within days of the first injection. What produces the clinical effect is the next step: with less IgE arriving, the receptors on mast cells and basophils go unoccupied, get pulled inside the cell, and are not replaced. That process depends on how fast those cells turn over their surface receptors, and it takes weeks to months. So the biochemistry moves almost immediately and the symptoms move much later, which is why response is conventionally assessed at 12 to 16 weeks rather than at the next appointment.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Normansell R, Walker S, Milan SJ, Walters EH, Nair P. Omalizumab for asthma in adults and children. Cochrane Database Syst Rev 2014;1:CD003559',
        identifier: '10.1002/14651858.CD003559.pub4',
        kind: 'doi',
      },
      {
        label:
          'Busse WW, Morgan WJ, Gergen PJ, et al. Randomized trial of omalizumab (anti-IgE) for asthma in inner-city children. N Engl J Med 2011;364:1005-1015',
        identifier: '10.1056/NEJMoa1009705',
        kind: 'doi',
      },
      {
        label:
          'Wood RA, Togias A, Sicherer SH, et al. Omalizumab for the treatment of multiple food allergies (OUtMATCH). N Engl J Med 2024;390:889-899',
        identifier: '10.1056/NEJMoa2312382',
        kind: 'doi',
      },
      {
        label: 'ICATA — Inner-City Anti-IgE Therapy for Asthma, ClinicalTrials.gov record',
        identifier: 'NCT00377572',
        kind: 'nct',
      },
      {
        label:
          'OUtMATCH — omalizumab as monotherapy and as adjunct therapy to multi-allergen oral immunotherapy in food-allergic children and adults',
        identifier: 'NCT03881696',
        kind: 'nct',
      },
      {
        label:
          'XOLAIR (omalizumab) United States prescribing information — Boxed Warning, Indications and Usage, Dosage and Administration, Warnings and Precautions 5.1 to 5.6 (Anaphylaxis, Malignancy, Cardiovascular and Cerebrovascular Events, Acute Asthma Symptoms, Eosinophilic Conditions, Fever/Arthralgia/Rash), Description 11 and Clinical Pharmacology 12.1 (BLA 103976)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7f6a2191-adfb-48b9-9bfa-0d9920479f0d',
        kind: 'regulatory',
      },
      {
        label:
          'Institute for Clinical and Economic Review. Biologic Therapies for Treatment of Asthma Associated with Type 2 Inflammation: Effectiveness, Value, and Value-Based Price Benchmarks. Final Evidence Report, 20 December 2018',
        identifier: 'https://icer.org/assessment/asthma-2018/',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Tezepelumab — the asthma biologic sold as the one that works whatever your blood test says,
  //    and the only one licensed without a biomarker requirement. Its two failed trials both failed
  //    in the low-eosinophil patients, which is the exact group the claim is about.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tezepelumab',
    name: 'Tezepelumab',
    tradeName: 'Tezspire',
    sponsor:
      'AstraZeneca AB and Amgen Inc. (BLA 761224). The nonproprietary name carries the suffix -ekko',
    targetGene: 'TSLP',
    targetProtein:
      'Thymic stromal lymphopoietin, an epithelial-cell-derived cytokine, bound with a dissociation constant of 15.8 pM and blocked from engaging the heterodimeric TSLP receptor',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2021,
    indication:
      'Add-on maintenance treatment of adult and paediatric patients aged 12 years and older with severe asthma, and add-on maintenance treatment of adult and paediatric patients aged 12 years and older with inadequately controlled chronic rhinosinusitis with nasal polyps. The label states it is not for the relief of acute bronchospasm or status asthmaticus',
    patientFriendlyIndication:
      'Severe asthma, and nasal polyps — the only one of these injections with no blood-test requirement attached to it',
    anatomicalSite:
      'The airway epithelium — the surface layer of cells that lines the bronchi, where TSLP is released within minutes of an insult, upstream of every other cytokine these drugs target',
    conditionContext: {
      conditionExplainer:
        'Every other asthma biologic works partway down the inflammatory cascade: on interleukin-5, on the IL-4 receptor, on IgE. Thymic stromal lymphopoietin sits above all of them. It is released by the epithelial cells lining the airway within minutes of an allergen, a virus, cigarette smoke or pollution arriving, and it is what starts the cascade rather than what carries it.',
      whyItMatters:
        'Blocking the first step should, in principle, work in patients whose downstream biomarkers are normal — and that is what the pivotal trial reported. Tezepelumab is the only asthma biologic approved without any biomarker requirement in its indication. The two trials it failed both failed specifically in the low-biomarker patients, which is precisely where the claim needs to hold.',
      whoTakesThis:
        'People aged 12 and over with severe asthma still uncontrolled on inhaled corticosteroids plus another controller, regardless of eosinophil count, IgE level or allergen sensitisation; and adults and adolescents with severe nasal polyps.',
      clinicalGoals:
        'Fewer exacerbations, and in nasal polyps, avoiding surgery. Not coming off oral steroids: the trial designed to test that missed its primary endpoint.',
    },
    oneSentenceVerdict:
      'A human IgG2 antibody against the epithelial alarm cytokine TSLP, which in 1,061 patients cut the annualised asthma exacerbation rate from 2.10 to 0.93 (rate ratio 0.44, P<0.001) and from 1.73 to 1.02 in those with fewer than 300 eosinophils per microlitre — and which then missed its primary endpoint in the oral steroid-sparing trial (odds ratio 1.28, p=0.43) and in COPD (rate ratio 0.83, one-sided p=0.10), in both cases with the null concentrated in the low-eosinophil patients.',
    laymanHowItWorks:
      'The cells lining your airway are the first thing an allergen, a virus or a lungful of smoke touches. Within minutes they release an alarm signal called TSLP, and that alarm is what starts the whole inflammatory chain that ends in an asthma attack. Tezepelumab is an antibody that intercepts the alarm itself, before any of the downstream messengers are made. Because it acts above them all, it lowers several different inflammatory markers at once — eosinophils, IgE, exhaled nitric oxide — rather than one, and it is the only one of these drugs given without first checking a blood test.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    substitutes: {
      summary:
        'The case for tezepelumab over the others is entirely about the patients the others exclude: severe asthma with a normal eosinophil count, normal IgE, and no allergen sensitisation. In that group the alternatives have little or no evidence, and tezepelumab has a significant result from NAVIGATOR. In the eosinophil-high group, where every drug in the class works, there has never been a randomised head-to-head trial between any of them, and the choice is made on dosing interval, indications and price.',
      conventionalRx: [
        {
          name: 'Mepolizumab (Nucala) or benralizumab (Fasenra)',
          class: 'Anti-interleukin-5 pathway monoclonal antibodies',
          howItCompares:
            'Act one step below tezepelumab on the same cascade and require a raised eosinophil count in the indication. In NAVIGATOR’s low-eosinophil stratum — fewer than 300 cells per microlitre — tezepelumab reduced exacerbations from 1.73 to 1.02 per year, which is the population these drugs are not licensed for. In the eosinophil-high group there is no trial comparing them.',
          typicalCost:
            'None of these molecules has a published CMS National Average Drug Acquisition Cost figure — all move through specialty channels the retail pharmacy survey does not cover',
          prosAndCons:
            'Pros of the anti-IL-5 agents: dedicated and successful oral steroid-sparing trials, which tezepelumab does not have; longer intervals; more indications. Cons: no licence and little evidence in the low-eosinophil patient.',
        },
        {
          name: 'Dupilumab (Dupixent)',
          class: 'Anti-interleukin-4 receptor alpha monoclonal antibody',
          howItCompares:
            'Blocks two downstream cytokines at a shared receptor and produces the largest lung function effect of any drug in the class. It carries a COPD indication in patients with an eosinophilic phenotype, which tezepelumab does not: COURSE, the tezepelumab COPD trial, missed its primary endpoint.',
          typicalCost: 'Specialty biologic, not covered by the CMS retail acquisition cost survey',
          prosAndCons:
            'Pros: larger FEV1 effect, an approved COPD indication, eczema and eosinophilic oesophagitis. Cons: still gated on type 2 markers, and transient blood hypereosinophilia in a minority.',
        },
        {
          name: 'Omalizumab (Xolair)',
          class: 'Anti-IgE monoclonal antibody',
          howItCompares:
            'Requires both allergen sensitisation and a serum IgE between 30 and 700 IU/mL, so it excludes non-allergic severe asthma entirely and cannot be given to those with the highest IgE. Tezepelumab has no such ceiling and no biomarker requirement, and it lowers IgE as one of several downstream consequences rather than removing it directly.',
          typicalCost: 'Specialty biologic, not covered by the CMS retail acquisition cost survey',
          prosAndCons:
            'Pros of omalizumab: indications in chronic urticaria and food allergy that tezepelumab has not sought. Cons: a boxed warning for anaphylaxis, a dosing ceiling on its own biomarker, and no effect in non-allergic asthma.',
        },
        {
          name: 'Sinus surgery, for the nasal polyp indication',
          class: 'Functional endoscopic sinus surgery',
          howItCompares:
            'The comparison WAYPOINT effectively made without randomising to it. Over 52 weeks, surgery for nasal polyps was indicated in 0.5% of tezepelumab patients against 22.1% of placebo patients (hazard ratio 0.02, 95% CI 0.00 to 0.09), and systemic glucocorticoid use in 5.2% against 18.3% (hazard ratio 0.12).',
          typicalCost:
            'A one-off procedural cost against an indefinite four-weekly biologic; no published head-to-head cost comparison exists',
          prosAndCons:
            'Pros of surgery: single intervention, immediate mechanical relief. Cons: polyps recur, repeat surgery is common, and the trial required prior surgery or eligibility for it as an entry criterion in this population.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not stop your inhalers or steroid tablets when it starts',
          action:
            'Continue every existing treatment unless a clinician reduces it deliberately and gradually.',
          patientImpact:
            'The label directs that corticosteroids be tapered gradually rather than stopped on starting tezepelumab. It is worth knowing why this matters more here than elsewhere: SOURCE, the trial designed to show that tezepelumab lets people reduce oral steroids, did not meet its primary endpoint (odds ratio 1.28, 95% CI 0.69 to 2.35, p=0.43).',
          clinicalPrecaution:
            'Corticosteroid reduction can produce systemic withdrawal symptoms and unmask conditions the steroid was suppressing. For this drug there is no positive steroid-sparing trial to base a taper on.',
        },
        {
          name: 'It does nothing during an attack',
          action: 'Keep the reliever inhaler and the written action plan.',
          patientImpact:
            'The label carries an explicit limitation of use: tezepelumab is not indicated for the relief of acute bronchospasm or status asthmaticus. A four-weekly injection acting on an epithelial alarm cytokine has no role in the minutes when an airway is closing.',
          clinicalPrecaution:
            'Patients should seek medical advice if asthma remains uncontrolled or worsens after starting treatment.',
        },
        {
          name: 'Ask about live vaccines and about worm infections',
          action:
            'Raise any planned live attenuated vaccination, and any history of helminth infection or relevant travel.',
          patientImpact:
            'The label advises avoiding live attenuated vaccines during treatment, and directs that pre-existing helminth infections be treated before therapy begins. Hypersensitivity reactions including anaphylaxis are listed in the warnings.',
          clinicalPrecaution:
            'The vaccine caution is a precaution rather than a demonstrated harm — the immunological consequences of blocking an epithelial alarm cytokine long-term are not characterised in any published trial beyond the two-year extension.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Human immunoglobulin G2 lambda (IgG2λ) monoclonal antibody produced in Chinese hamster ovary cells',
      molecularWeight: 'Approximately 147 kDa',
      targetReceptorAffinity:
        'Binds human thymic stromal lymphopoietin with a dissociation constant of 15.8 pM and blocks its interaction with the heterodimeric TSLP receptor. The IgG2 subclass is chosen for minimal effector function: the antibody neutralises a soluble cytokine and is not meant to mark any cell for destruction. Because TSLP sits upstream of the type 2 cascade, blockade lowers several downstream markers simultaneously — blood eosinophils, IgE, fractional exhaled nitric oxide, interleukin-5 and interleukin-13 — which is why no single one of them serves as the drug’s biomarker.',
      structureSource: {
        label:
          'TEZSPIRE (tezepelumab-ekko) United States prescribing information, Description section 11 and Clinical Pharmacology sections 12.1 and 12.2 (BLA 761224)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=60f0aa03-ad25-4d48-80ce-7fcfa76f325f',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'tez-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve the IgG2 disulfide isoforms',
          description:
            'IgG2 antibodies exist as three interconverting disulfide isoforms — IgG2-A, IgG2-B and IgG2-A/B — differing in how the hinge cysteines pair with the light chain. The isoforms have different hinge rigidity and can differ in potency, and the distribution shifts on storage. For an IgG2 therapeutic this is a release-relevant attribute rather than a characterisation detail, and it is the main reason IgG2 is a less common therapeutic scaffold than IgG1 or IgG4.',
          reagentsAndBuffer:
            'Non-reducing capillary electrophoresis, reversed-phase HPLC of the intact molecule, hydrophobic interaction chromatography for isoform resolution, forced redox challenge to map interconversion',
        },
        {
          id: 'tez-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch expression in Chinese hamster ovary cells',
          description:
            'The label specifies production in CHO cells. A lambda light chain rather than the more common kappa changes nothing about the process but does change the affinity capture options available downstream, since anti-kappa affinity resins are not usable.',
          dependsOnStepId: 'tez-w1',
          reagentsAndBuffer:
            'Chemically defined CHO medium, glucose and amino acid feeds, controlled pH, dissolved oxygen and temperature shift',
        },
        {
          id: 'tez-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture, viral clearance and polishing to a 210 mg subcutaneous dose',
          description:
            'Affinity capture, low-pH viral inactivation and ion exchange polishing, then concentration into a formulation that delivers 210 mg in a single subcutaneous injection. That dose in an acceptable volume requires a high-concentration formulation, and viscosity at high concentration is the practical constraint on the device rather than the molecule.',
          dependsOnStepId: 'tez-w2',
          reagentsAndBuffer:
            'Protein A resin, low-pH hold with neutralisation, anion and cation exchange, nanofiltration, tangential flow filtration into the final high-concentration buffer',
        },
        {
          id: 'tez-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Block TSLP signalling through the heterodimeric receptor',
          description:
            'The TSLP receptor is a heterodimer of TSLPR and the interleukin-7 receptor alpha chain, and TSLP must engage both. A binding assay against TSLP alone does not establish that the antibody prevents assembly of that complex at physiological cytokine concentrations. The functional assay is STAT5 phosphorylation in a receptor-bearing cell driven by recombinant TSLP.',
          dependsOnStepId: 'tez-w3',
          reagentsAndBuffer:
            'A cell line co-expressing human CRLF2 (TSLPR) and IL7R, recombinant human TSLP across a concentration range, STAT5 phosphorylation by flow cytometry or a STAT5 reporter, tezepelumab reference standard',
        },
        {
          id: 'tez-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure the whole downstream panel, not one marker',
          description:
            'Blocking an upstream alarm cytokine lowers several downstream readouts at once: blood eosinophils, IgE, fractional exhaled nitric oxide, interleukin-5 and interleukin-13. No single one of them is the drug’s biomarker, which is exactly why the licence carries no biomarker requirement — and exactly why response cannot be confirmed from a blood test the way it can with the anti-IL-5 antibodies. The panel has to be read together or not at all.',
          dependsOnStepId: 'tez-w4',
          reagentsAndBuffer:
            'Automated differential haematology for eosinophils, total IgE immunoassay, fractional exhaled nitric oxide analyser, multiplex cytokine panel for IL-5 and IL-13, paired baseline and on-treatment sampling',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tez-a1',
        category: 'measured',
        title: 'NAVIGATOR: exacerbations more than halved, including in low-eosinophil patients',
        laymanSummary:
          'The pivotal trial randomised 1,061 people with severe asthma. Attacks fell from 2.10 to 0.93 a year. In the subgroup with a normal eosinophil count — the patients other biologics do not treat — they fell from 1.73 to 1.02, and that comparison was pre-specified rather than found afterwards.',
        technicalDetails:
          'NAVIGATOR was a phase 3, multicentre, randomised, double-blind, placebo-controlled trial in patients aged 12 to 80, assigning 529 to tezepelumab 210 mg and 532 to placebo subcutaneously every 4 weeks for 52 weeks. The annualised asthma exacerbation rate was 0.93 (95% CI 0.80 to 1.07) against 2.10 (95% CI 1.84 to 2.39), rate ratio 0.44 (95% CI 0.37 to 0.53), P<0.001. The primary endpoint was also assessed in patients with baseline blood eosinophils below 300 cells per microlitre, where the rate was 1.02 (95% CI 0.84 to 1.23) against 1.73 (95% CI 1.46 to 2.05), rate ratio 0.59 (95% CI 0.46 to 0.75), P<0.001. Prebronchodilator FEV1 improved 0.23 against 0.09 litres, a difference of 0.13 litres (95% CI 0.08 to 0.18, P<0.001) — larger than the anti-IL-5 antibodies achieve. ACQ-6 improved by 0.33 more than placebo (95% CI -0.46 to -0.20), which is below the conventional 0.5-point minimal important difference, and AQLQ by 0.34, also below the 0.5-point threshold usually cited for that instrument. The exacerbation result is unambiguous. The symptom and quality-of-life differences are statistically significant and smaller than the thresholds their own literature sets.',
        evidenceSource:
          'Menzies-Gow A, Corren J, Bourdin A, et al. Tezepelumab in adults and adolescents with severe, uncontrolled asthma (NAVIGATOR). N Engl J Med 2021;384:1800-1809, NCT03347279',
        doi: '10.1056/NEJMoa2034975',
        measuredMetric:
          'Annualised rate of asthma exacerbations over 52 weeks, overall and in patients with baseline blood eosinophils below 300 cells per microlitre',
        auditFlag: 'verified',
      },
      {
        id: 'tez-a2',
        category: 'failed',
        title: 'The steroid-sparing trial missed, and missed hardest in the low-eosinophil group',
        laymanSummary:
          'SOURCE tested whether tezepelumab lets people on daily steroid tablets come off them. It did not meet its primary endpoint. Looking at subgroups, it worked in patients with higher eosinophil counts and pointed the wrong way in those below 150.',
        technicalDetails:
          'SOURCE was a phase 3 randomised, double-blind, placebo-controlled trial across 60 sites in seven countries, randomising 150 adults with oral corticosteroid-dependent asthma to tezepelumab 210 mg (74) or placebo (76) every 4 weeks over 48 weeks. The primary endpoint, the categorised percentage reduction from baseline in daily oral corticosteroid dose at week 48 without loss of asthma control, was not met: cumulative odds ratio 1.28 (95% CI 0.69 to 2.35), p=0.43. In the subgroup with baseline blood eosinophils of at least 150 cells per microlitre the odds ratio was 2.58 (95% CI 1.16 to 5.75); below 150 cells per microlitre it was 0.40 (95% CI 0.14 to 1.13). Read plainly, the drug licensed without a biomarker requirement failed a trial in the whole population and succeeded only in the biomarker-positive subgroup, with the point estimate below 1 in the biomarker-negative one. Mepolizumab and benralizumab both have positive steroid-sparing trials. Tezepelumab does not, and the failure landed in the group its distinguishing claim is about.',
        evidenceSource:
          'Wechsler ME, Menzies-Gow A, Brightling CE, et al. Evaluation of the oral corticosteroid-sparing effect of tezepelumab in adults with oral corticosteroid-dependent asthma (SOURCE). Lancet Respir Med 2022;10:650-660, NCT03406078',
        doi: '10.1016/S2213-2600(21)00537-3',
        measuredMetric:
          'Categorised percentage reduction in daily oral corticosteroid dose at week 48 without loss of asthma control, overall and by baseline blood eosinophil count',
        auditFlag: 'caution',
      },
      {
        id: 'tez-a3',
        category: 'failed',
        title: 'COPD: missed, and the low-eosinophil subgroup favoured placebo',
        laymanSummary:
          'The COPD trial did not meet its primary endpoint. Broken down by eosinophil count, patients below 150 had more attacks on the drug than on placebo, and the benefit rose steadily as the count rose — the pattern the asthma story says should not happen.',
        technicalDetails:
          'COURSE was a phase 2a double-blind, randomised, placebo-controlled trial across 90 sites in ten countries, randomising 333 patients aged 40 to 80 with moderate to very severe COPD on triple inhaled therapy and at least two exacerbations in the prior year, 165 to tezepelumab 420 mg and 168 to placebo, every 4 weeks for up to 52 weeks. The annualised rate of moderate or severe exacerbations was 1.75 against 2.11, rate ratio 0.83 (90% CI 0.64 to 1.06), one-sided p=0.10 — the primary endpoint was not met. The pre-specified eosinophil subgroups told a consistent story: below 150 cells per microlitre, 2.04 against 1.71 with a rate ratio of 1.19 (95% CI 0.75 to 1.90), favouring placebo; from 150 to under 300, 1.64 against 2.47, rate ratio 0.66 (95% CI 0.42 to 1.04); at 300 or above, 1.20 against 2.24, rate ratio 0.54 (95% CI 0.25 to 1.15). Five patients died on study treatment, two on tezepelumab and three on placebo, none judged causally related. Two failed trials in two diseases, both with the null or reversed effect concentrated below the eosinophil threshold, is a pattern rather than a coincidence — and it sits directly against the drug’s defining claim.',
        evidenceSource:
          'Singh D, Brightling CE, Rabe KF, et al. Efficacy and safety of tezepelumab versus placebo in adults with moderate to very severe chronic obstructive pulmonary disease (COURSE): a randomised, placebo-controlled, phase 2a trial. Lancet Respir Med 2025;13:47-58, NCT04039113',
        doi: '10.1016/S2213-2600(24)00324-2',
        measuredMetric:
          'Annualised rate of moderate or severe COPD exacerbations over 52 weeks, overall and by baseline blood eosinophil count',
        auditFlag: 'caution',
      },
      {
        id: 'tez-a4',
        category: 'inferred',
        title: 'Approved without a biomarker requirement — which is a licensing fact, not a result',
        laymanSummary:
          'Tezepelumab is the only asthma biologic whose indication mentions no blood test. That is often reported as proof it works in everyone. What was actually shown is a significant result in one pre-specified subgroup below 300 eosinophils, in one trial.',
        technicalDetails:
          'The indication reads simply as add-on maintenance treatment of severe asthma in patients aged 12 and over, with no eosinophil, IgE or allergen criterion — unique in the class. The evidence supporting the low-biomarker claim is the NAVIGATOR sub-analysis below 300 cells per microlitre (rate ratio 0.59, P<0.001) and the PATHWAY phase 2b finding that reductions were similar regardless of baseline eosinophil count. Against it stand SOURCE, where the effect reversed below 150 cells per microlitre, and COURSE, where it reversed below 150 in COPD. The absence of a biomarker in an indication reflects what the regulator was prepared to restrict, not a demonstration that the drug is biomarker-independent. Note also that 300 cells per microlitre is not a low threshold: patients between 150 and 300 are counted in the low-eosinophil stratum and are the group in which SOURCE and COURSE both found benefit. The strongest version of the claim — that it works in genuinely non-type-2 asthma — rests on a subgroup of a subgroup.',
        evidenceSource:
          'TEZSPIRE (tezepelumab-ekko) United States prescribing information, Indications and Usage (BLA 761224); Menzies-Gow A et al., N Engl J Med 2021;384:1800-1809; Wechsler ME et al., Lancet Respir Med 2022;10:650-660',
        inferredClaim:
          'That tezepelumab works independently of biomarkers because its licence carries no biomarker requirement — an inference from the wording of an indication, contradicted by the eosinophil-dependent subgroup results of both trials the drug failed',
        auditFlag: 'contested',
      },
      {
        id: 'tez-a5',
        category: 'measured',
        title: 'PATHWAY replicated the low-eosinophil finding before NAVIGATOR was run',
        laymanSummary:
          'The phase 2 trial tested three doses in 584 patients and cut attacks by 61 to 71% at all three, with similar results whatever the eosinophil count. That result is why NAVIGATOR pre-specified the low-eosinophil analysis rather than looking for it afterwards.',
        technicalDetails:
          'PATHWAY randomised patients uncontrolled on long-acting beta-agonists plus medium-to-high dose inhaled glucocorticoids to tezepelumab 70 mg every 4 weeks (145), 210 mg every 4 weeks (145), 280 mg every 2 weeks (146) or placebo (148) for 52 weeks. Annualised exacerbation rates were 0.26, 0.19 and 0.22 against 0.67 on placebo — reductions of 61%, 71% and 66%, P<0.001 for all. The published report states that similar results were observed regardless of blood eosinophil counts at enrolment. Prebronchodilator FEV1 at week 52 was higher in all three arms: differences of 0.12 L (P=0.01), 0.11 L (P=0.02) and 0.15 L (P=0.002). Two features deserve noting. There was no dose-response across a fourfold range, which usually indicates the pathway is fully engaged at the lowest dose tested. And the placebo exacerbation rate of 0.67 per year is far below NAVIGATOR’s 2.10, so the two trials enrolled very different populations despite testing the same drug — which is why cross-trial comparison of the percentages is not meaningful.',
        evidenceSource:
          'Corren J, Parnes JR, Wang L, et al. Tezepelumab in adults with uncontrolled asthma (PATHWAY). N Engl J Med 2017;377:936-946, NCT02054130',
        doi: '10.1056/NEJMoa1704064',
        measuredMetric:
          'Annualised rate of asthma exacerbations at week 52 across three dose levels, and the relationship to baseline blood eosinophil count',
        auditFlag: 'verified',
      },
      {
        id: 'tez-a6',
        category: 'measured',
        title: 'WAYPOINT: 0.5% needed polyp surgery against 22.1% on placebo',
        laymanSummary:
          'In severe nasal polyps, one patient in 203 on tezepelumab was referred for surgery over a year, against 45 of 205 on placebo. Every other measure — polyp size, blockage, smell, symptom scores — moved in the same direction.',
        technicalDetails:
          'WAYPOINT randomised 408 adults with symptomatic severe chronic rhinosinusitis with nasal polyps to standard care plus tezepelumab 210 mg (203) or placebo (205) subcutaneously every 4 weeks for 52 weeks. At week 52 the co-primary endpoints both met: total nasal-polyp score improved by a mean of 2.07 points more than placebo (95% CI -2.39 to -1.74) and mean nasal-congestion score by 1.03 points (95% CI -1.20 to -0.86), P<0.001 for both. Key secondary endpoints all favoured tezepelumab: loss-of-smell score by 1.00 point, SNOT-22 total score by 27.26 points, Lund-Mackay score by 5.72 and total symptom score by 6.89, all P<0.001. Surgery for nasal polyps was indicated in 0.5% against 22.1% (hazard ratio 0.02, 95% CI 0.00 to 0.09) and systemic glucocorticoid use in 5.2% against 18.3% (hazard ratio 0.12, 95% CI 0.04 to 0.27), P<0.001 for both. A 27-point SNOT-22 difference is far above the 8.9-point minimal clinically important difference for that instrument, and the surgery hazard ratio of 0.02 is among the largest effect sizes reported anywhere in respiratory medicine. This indication is on far firmer ground than the biomarker-independence claim in asthma.',
        evidenceSource:
          'Lipworth BJ, Han JK, Desrosiers M, et al. Tezepelumab in adults with severe chronic rhinosinusitis with nasal polyps (WAYPOINT). N Engl J Med 2025;392:1178-1188',
        doi: '10.1056/NEJMoa2414482',
        measuredMetric:
          'Total nasal-polyp score and nasal-congestion score at week 52, and time to first decision to treat with nasal-polyp surgery or systemic glucocorticoid',
        auditFlag: 'verified',
      },
      {
        id: 'tez-a7',
        category: 'inferred',
        title: 'No biomarker means no way to tell whether it is working',
        laymanSummary:
          'With the anti-IL-5 antibodies you can check whether the eosinophil count has fallen. Tezepelumab lowers five different markers a little rather than one a lot, so there is no single number that confirms the drug is doing its job.',
        technicalDetails:
          'The label records that blocking TSLP reduces blood eosinophils, IgE, fractional exhaled nitric oxide, interleukin-5 and interleukin-13. That breadth is the mechanistic selling point and it removes the monitoring handle. Benralizumab drives the eosinophil count to a median of zero, which is a binary confirmation that drug is present and active; mepolizumab produces a 64 to 90% reduction; omalizumab has a free IgE assay. Tezepelumab has a panel that must be read together and no validated on-treatment threshold that distinguishes an inadequate dose, an adherence failure and a genuine non-responder. In practice, response is judged by whether exacerbations stop over months. That is the correct clinical endpoint and it is a slow and imprecise instrument for a decision about a drug of this cost.',
        evidenceSource:
          'TEZSPIRE (tezepelumab-ekko) United States prescribing information, Clinical Pharmacology sections 12.1 and 12.2 (BLA 761224)',
        inferredClaim:
          'That reduction of the downstream marker panel confirms adequate TSLP blockade in an individual patient — a reasonable expectation with no validated on-treatment threshold behind it',
        auditFlag: 'caution',
      },
      {
        id: 'tez-a8',
        category: 'inferred',
        title: 'Blocking the epithelium’s alarm signal has no long-term safety data',
        laymanSummary:
          'TSLP is how the cells lining your airway raise the alarm about viruses, allergens and pollution. The trials ran for one to two years. What indefinitely silencing that alarm does is not known.',
        technicalDetails:
          'TSLP is an epithelial alarmin released within minutes of insult by allergen, virus, bacteria, cigarette smoke or particulate pollution, and it sits upstream of the entire type 2 cascade. Unlike interleukin-5, whose known biology is largely confined to eosinophils, TSLP has documented roles in barrier immunity, dendritic cell licensing and T cell priming at every epithelial surface. The label reflects this with a precaution to avoid live attenuated vaccines and to treat pre-existing helminth infections before therapy. NAVIGATOR ran 52 weeks, COURSE up to 52 weeks, and the DESTINATION extension carried patients to two years. There is no published controlled data beyond that, and the specific question a mechanism like this raises — susceptibility to respiratory viral infection over years of continuous blockade of the airway’s first-line alarm — is not one a two-year extension in a selected population can answer.',
        evidenceSource:
          'TEZSPIRE (tezepelumab-ekko) United States prescribing information, Warnings and Precautions and Clinical Pharmacology 12.1 (BLA 761224); Menzies-Gow A et al., N Engl J Med 2021;384:1800-1809',
        inferredClaim:
          'That the safety observed over one to two years of TSLP blockade generalises to indefinite treatment — an inference from the trial duration available, in a pathway whose function is first-line epithelial defence',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One injection every four weeks, and no blood test first',
        laymanDesc:
          'A fixed 210 mg dose under the skin every four weeks. Unlike every other injection for severe asthma, nothing has to be measured before you can start.',
        molecularDetail:
          'A 147 kDa human IgG2 lambda antibody produced in Chinese hamster ovary cells, given as 210 mg subcutaneously every 4 weeks. The indication carries no eosinophil, IgE or allergen sensitisation criterion, which is unique among the licensed asthma biologics.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The airway lining raises an alarm within minutes',
        laymanDesc:
          'When an allergen, a virus, smoke or pollution touches the cells lining your airway, they release a signal called TSLP almost immediately. That signal is the start of the whole chain.',
        molecularDetail:
          'Thymic stromal lymphopoietin is an epithelial-derived alarmin released rapidly in response to allergen, viral, bacterial and particulate insult. It acts upstream of the entire type 2 cascade rather than within it, which is the structural difference from every other biologic in this class.',
        iconName: 'AlertTriangle',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The antibody intercepts the alarm before it is heard',
        laymanDesc:
          'Tezepelumab binds TSLP itself and stops it fitting into its receptor, so the message never gets through.',
        molecularDetail:
          'Binding to human TSLP with a dissociation constant of 15.8 pM and blocking its interaction with the heterodimeric TSLP receptor, a complex of TSLPR and the interleukin-7 receptor alpha chain that requires engagement of both chains to signal.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Five downstream markers fall at once, none of them far',
        laymanDesc:
          'Because the block is at the top of the cascade, everything below it comes down a little: eosinophils, IgE, exhaled nitric oxide, and two more messengers. No single number is the drug’s signature.',
        molecularDetail:
          'The label records reductions in blood eosinophils, IgE, fractional exhaled nitric oxide, interleukin-5 and interleukin-13. This is why the licence carries no biomarker requirement and also why there is no validated on-treatment marker confirming adequate blockade in an individual patient.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Exacerbations more than halve, and lung function moves further than usual',
        laymanDesc:
          'In the pivotal trial attacks fell from 2.10 a year to 0.93, and lung function rose by 0.13 litres more than placebo — a larger figure than the anti-interleukin-5 injections manage.',
        molecularDetail:
          'NAVIGATOR: annualised exacerbation rate 0.93 against 2.10, rate ratio 0.44 (95% CI 0.37 to 0.53), P<0.001, in 1,061 patients. Below 300 eosinophils per microlitre: 1.02 against 1.73, rate ratio 0.59 (95% CI 0.46 to 0.75). Prebronchodilator FEV1 0.23 against 0.09 litres, difference 0.13 litres. ACQ-6 difference 0.33 and AQLQ difference 0.34, both below the 0.5-point thresholds those instruments use.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And two trials where the biomarker came back',
        laymanDesc:
          'The steroid-sparing trial failed overall and worked only above 150 eosinophils. The COPD trial failed overall, and below 150 eosinophils it pointed the other way.',
        molecularDetail:
          'SOURCE primary endpoint odds ratio 1.28 (95% CI 0.69 to 2.35, p=0.43); 2.58 (1.16 to 5.75) at 150 eosinophils per microlitre or above and 0.40 (0.14 to 1.13) below. COURSE rate ratio 0.83 (90% CI 0.64 to 1.06, one-sided p=0.10); 1.19 (0.75 to 1.90) below 150, 0.66 (0.42 to 1.04) at 150 to under 300, 0.54 (0.25 to 1.15) at 300 or above.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NAVIGATOR (NCT03347279)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 1061,
        primaryEndpoint:
          'Annualised rate of asthma exacerbations over 52 weeks in patients aged 12 to 80 with severe uncontrolled asthma, assessed overall and in those with baseline blood eosinophils below 300 cells per microlitre',
        endpointMet: true,
        statisticalPValue:
          '0.93 against 2.10 events per year, rate ratio 0.44 (95% CI 0.37 to 0.53), P<0.001; below 300 eosinophils per microlitre 1.02 against 1.73, rate ratio 0.59 (95% CI 0.46 to 0.75), P<0.001',
        unreportedAdverseSignals:
          'The ACQ-6 difference of 0.33 points and the AQLQ difference of 0.34 points are both below the 0.5-point minimal important differences conventionally cited for those instruments, despite being highly statistically significant.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PATHWAY (NCT02054130)',
        phase: 'Phase 2b, randomised, double-blind, placebo-controlled, three-dose',
        sampleSize: 584,
        primaryEndpoint:
          'Annualised rate of asthma exacerbations at week 52 in patients uncontrolled on long-acting beta-agonists plus medium-to-high dose inhaled glucocorticoids',
        endpointMet: true,
        statisticalPValue:
          'Rates of 0.26, 0.19 and 0.22 at 70 mg every 4 weeks, 210 mg every 4 weeks and 280 mg every 2 weeks against 0.67 on placebo — reductions of 61%, 71% and 66%, P<0.001 for all',
        unreportedAdverseSignals:
          'No dose-response across a fourfold dose range. The placebo exacerbation rate of 0.67 per year is under a third of NAVIGATOR’s 2.10, so the two trials enrolled substantially different populations and their percentage reductions are not comparable.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SOURCE (NCT03406078)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 150,
        primaryEndpoint:
          'Categorised percentage reduction from baseline in daily oral corticosteroid dose at week 48 without loss of asthma control, in oral corticosteroid-dependent asthma',
        endpointMet: false,
        statisticalPValue:
          'Cumulative odds ratio 1.28 (95% CI 0.69 to 2.35), p=0.43 — the primary endpoint was not met',
        unreportedAdverseSignals:
          'Cumulative odds were higher than placebo only in patients with baseline blood eosinophils of at least 150 cells per microlitre (2.58, 95% CI 1.16 to 5.75) and pointed the other way below that threshold (0.40, 95% CI 0.14 to 1.13) — in the very population the drug’s biomarker-free licence is about.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'COURSE (NCT04039113)',
        phase: 'Phase 2a, randomised, double-blind, placebo-controlled',
        sampleSize: 333,
        primaryEndpoint:
          'Annualised rate of moderate or severe COPD exacerbations over 52 weeks in patients on triple inhaled maintenance therapy with at least two exacerbations in the prior year',
        endpointMet: false,
        statisticalPValue:
          '1.75 against 2.11 events per year, rate ratio 0.83 (90% CI 0.64 to 1.06), one-sided p=0.10 — the primary endpoint was not met',
        unreportedAdverseSignals:
          'Below 150 eosinophils per microlitre the rate ratio was 1.19 (95% CI 0.75 to 1.90), favouring placebo; 0.66 between 150 and 300, and 0.54 at 300 or above. Five patients died on treatment, two on tezepelumab and three on placebo, none judged causally related.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'WAYPOINT (chronic rhinosinusitis with nasal polyps)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 408,
        primaryEndpoint:
          'Change from baseline in total nasal-polyp score and mean nasal-congestion score at week 52 in severe chronic rhinosinusitis with nasal polyps',
        endpointMet: true,
        statisticalPValue:
          'Nasal-polyp score mean difference -2.07 (95% CI -2.39 to -1.74) and nasal-congestion score -1.03 (95% CI -1.20 to -0.86), P<0.001 for both',
        unreportedAdverseSignals:
          'Surgery was indicated in 0.5% against 22.1% (hazard ratio 0.02, 95% CI 0.00 to 0.09) and systemic glucocorticoid use in 5.2% against 18.3% (hazard ratio 0.12). These are among the largest effect sizes reported in respiratory medicine and rest on a single trial.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Annualised asthma exacerbation rate 0.93 against 2.10 in 1,061 patients (rate ratio 0.44, 95% CI 0.37 to 0.53, P<0.001)',
        'In patients below 300 eosinophils per microlitre, 1.02 against 1.73 (rate ratio 0.59, 95% CI 0.46 to 0.75, P<0.001)',
        'Prebronchodilator FEV1 improvement of 0.13 litres more than placebo at week 52',
        'Exacerbation reductions of 61 to 71% across three dose levels in the phase 2b trial, with no dose-response',
        'Nasal-polyp surgery indicated in 0.5% against 22.1% over 52 weeks (hazard ratio 0.02)',
      ],
      unsupportedInferences: [
        'That the drug is biomarker-independent because its licence names no biomarker — contradicted by the eosinophil-dependent subgroup results of both failed trials',
        'That it spares oral corticosteroids like the anti-IL-5 antibodies do, which its own dedicated trial did not show',
        'That the asthma result should carry into COPD, which a 333-patient phase 2a trial directly tested and did not find',
        'That the downstream marker panel confirms adequate blockade in an individual, with no validated on-treatment threshold behind it',
        'That one to two years of safety data generalises to indefinite blockade of the airway’s first-line alarm cytokine',
      ],
      whatFailedInitially: [
        'SOURCE missed its primary endpoint on oral corticosteroid reduction (OR 1.28, p=0.43)',
        'COURSE missed its primary endpoint in COPD (rate ratio 0.83, one-sided p=0.10)',
        'In both, the effect below 150 eosinophils per microlitre pointed towards placebo',
        'The ACQ-6 and AQLQ differences in NAVIGATOR fell below the minimal important differences those instruments define',
      ],
      realWorldOutcome: [
        'Approved in the United States on 17 December 2021 under BLA 761224, the first and so far only TSLP blocker',
        'The only asthma biologic whose indication contains no eosinophil, IgE or allergen sensitisation requirement',
        'A second indication in chronic rhinosinusitis with nasal polyps followed on the strength of WAYPOINT',
        'No COPD indication, after the phase 2a trial missed its primary endpoint',
        'No CMS National Average Drug Acquisition Cost figure is published, because the drug moves through specialty channels the retail pharmacy survey does not cover',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection of 210 mg once every 4 weeks, supplied as a prefilled syringe and as a prefilled pen',
      description:
        'A fixed dose with no weight adjustment and no biomarker gate, which makes it operationally the simplest of the severe-asthma biologics to start. The trade-off is that there is no on-treatment measurement confirming the drug is working: TSLP blockade lowers eosinophils, IgE, exhaled nitric oxide, interleukin-5 and interleukin-13 modestly rather than driving any one of them to a threshold, so response is assessed by whether exacerbations stop over months.',
      safetyProfile:
        'Hypersensitivity reactions including anaphylaxis are listed in the warnings. The label directs that systemic or inhaled corticosteroids not be discontinued abruptly and that any reduction be gradual, that pre-existing helminth infections be treated before therapy begins, and that live attenuated vaccines be avoided during treatment. The most common adverse reactions at an incidence of 3% or more in asthma were pharyngitis, arthralgia and back pain; in nasal polyps, nasopharyngitis, upper respiratory infection, epistaxis, pharyngitis, back pain, influenza, injection site reactions and arthralgia. In the COPD trial adverse events occurred in 81% on tezepelumab against 75% on placebo, with serious adverse events in 30% of each group. It is not indicated for the relief of acute bronchospasm or status asthmaticus.',
    },
    commonQuestions: [
      {
        q: 'Is it true this one works even if my blood tests are normal?',
        a: 'Partly, and the honest answer is more interesting than either version you will hear. In the pivotal NAVIGATOR trial, the analysis in patients with fewer than 300 eosinophils per microlitre was pre-specified rather than dug out afterwards, and it was clearly positive: attacks fell from 1.73 to 1.02 a year. That is real evidence, and it is why this is the only one of these drugs licensed without a blood test attached. But two other trials failed, and in both the failure was concentrated in the low-eosinophil patients — below 150 in the steroid-sparing trial the odds ratio was 0.40, and below 150 in the COPD trial the drug did slightly worse than placebo. Also worth knowing: 300 cells per microlitre is not a low bar. People between 150 and 300 count as low-eosinophil in NAVIGATOR, and they are the ones who benefited in the other two trials.',
        auditNote:
          'A licence with no biomarker in it reflects what the regulator chose to restrict, not a demonstration that the drug is biomarker-independent.',
      },
      {
        q: 'Will it get me off my steroid tablets?',
        a: 'That was tested directly and the trial missed. SOURCE randomised 150 people on daily maintenance oral steroids to tezepelumab or placebo for 48 weeks, with the amount of steroid reduction as the primary endpoint. The odds ratio was 1.28 with a confidence interval from 0.69 to 2.35 and p=0.43 — no significant difference. In the subgroup with eosinophils of 150 or more it worked (odds ratio 2.58), and below 150 it did not. If coming off prednisolone is your main goal, mepolizumab and benralizumab both have positive trials with exactly that endpoint and this drug does not.',
      },
      {
        q: 'How will I know if it is working?',
        a: 'By whether your attacks stop, over months, which is slower and vaguer than you would like. With the anti-interleukin-5 injections there is a number to check: benralizumab drives the eosinophil count to essentially zero, mepolizumab drops it by most of the way, omalizumab has a free IgE assay. Tezepelumab acts at the top of the cascade and lowers five things a bit — eosinophils, IgE, exhaled nitric oxide, interleukin-5 and interleukin-13 — rather than one thing a lot. There is no validated on-treatment threshold that distinguishes a drug that is working, a dose that is too low, and a patient who is not responding. That absence is the flip side of the biomarker-free licence.',
      },
      {
        q: 'What does it mean to block the airway’s alarm signal for years?',
        a: 'Nobody knows, and it is a fair thing to ask about this drug specifically. TSLP is released by the cells lining your airway within minutes of meeting an allergen, a virus, bacteria, smoke or pollution — it is a first-line alarm, not a specialised messenger like interleukin-5, whose known job is mostly confined to one white blood cell. Blocking it has broad theoretical consequences for barrier immunity. The label reflects that with precautions about live vaccines and about treating worm infections first. The trials ran a year, with an extension to two. There is no controlled data past that, and the specific question — whether continuous blockade over many years affects how you handle respiratory infections — is not one a two-year extension can answer.',
        auditNote:
          'The absence of a long-term signal is not the presence of long-term safety. It is an absence of measurement, and here the mechanism gives a specific reason to want the measurement.',
      },
      {
        q: 'Is the nasal polyp evidence as strong as the asthma evidence?',
        a: 'In some ways stronger. WAYPOINT randomised 408 adults with severe nasal polyps and reported that over 52 weeks, one patient in 203 on tezepelumab was referred for polyp surgery against 45 of 205 on placebo — a hazard ratio of 0.02, which is an unusually large number in respiratory medicine. Systemic steroid courses fell from 18.3% to 5.2%. Sense of smell, sinus imaging scores and the SNOT-22 questionnaire all improved by margins well above their thresholds for mattering. The caveat is that this is a single trial and it has not been replicated. But unlike the biomarker-independence claim in asthma, nothing contradicts it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Menzies-Gow A, Corren J, Bourdin A, et al. Tezepelumab in adults and adolescents with severe, uncontrolled asthma (NAVIGATOR). N Engl J Med 2021;384:1800-1809',
        identifier: '10.1056/NEJMoa2034975',
        kind: 'doi',
      },
      {
        label:
          'Corren J, Parnes JR, Wang L, et al. Tezepelumab in adults with uncontrolled asthma (PATHWAY). N Engl J Med 2017;377:936-946',
        identifier: '10.1056/NEJMoa1704064',
        kind: 'doi',
      },
      {
        label:
          'Wechsler ME, Menzies-Gow A, Brightling CE, et al. Evaluation of the oral corticosteroid-sparing effect of tezepelumab in adults with oral corticosteroid-dependent asthma (SOURCE): a randomised, placebo-controlled, phase 3 study. Lancet Respir Med 2022;10:650-660',
        identifier: '10.1016/S2213-2600(21)00537-3',
        kind: 'doi',
      },
      {
        label:
          'Singh D, Brightling CE, Rabe KF, et al. Efficacy and safety of tezepelumab versus placebo in adults with moderate to very severe chronic obstructive pulmonary disease (COURSE): a randomised, placebo-controlled, phase 2a trial. Lancet Respir Med 2025;13:47-58',
        identifier: '10.1016/S2213-2600(24)00324-2',
        kind: 'doi',
      },
      {
        label:
          'Lipworth BJ, Han JK, Desrosiers M, et al. Tezepelumab in adults with severe chronic rhinosinusitis with nasal polyps (WAYPOINT). N Engl J Med 2025;392:1178-1188',
        identifier: '10.1056/NEJMoa2414482',
        kind: 'doi',
      },
      {
        label: 'NAVIGATOR — tezepelumab in severe uncontrolled asthma, ClinicalTrials.gov record',
        identifier: 'NCT03347279',
        kind: 'nct',
      },
      {
        label: 'SOURCE — oral corticosteroid-sparing effect of tezepelumab',
        identifier: 'NCT03406078',
        kind: 'nct',
      },
      {
        label: 'COURSE — tezepelumab in moderate to very severe COPD',
        identifier: 'NCT04039113',
        kind: 'nct',
      },
      {
        label:
          'TEZSPIRE (tezepelumab-ekko) United States prescribing information — Indications and Usage with Limitations of Use, Dosage and Administration, Warnings and Precautions, Adverse Reactions, Description 11 and Clinical Pharmacology 12.1 and 12.2 (BLA 761224)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=60f0aa03-ad25-4d48-80ce-7fcfa76f325f',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Ciclesonide — the inhaled steroid that arrives inactive and is switched on by enzymes in the
  //    airway, sold on the safety that ought to follow. Its own label carries every warning the
  //    class carries, and says the significance of the 120-fold potency finding is unknown.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ciclesonide',
    name: 'Ciclesonide',
    tradeName: 'Alvesco (inhaler) / Omnaris (nasal spray) / Zetonna (nasal aerosol, discontinued)',
    sponsor:
      'Azurity Pharmaceuticals holds ALVESCO (NDA 021658, approved 10 January 2008), OMNARIS (NDA 022004, approved 20 October 2006) and the discontinued ZETONNA (NDA 202129, approved 20 January 2012); a second OMNARIS application (NDA 022124) is held by Nycomed US. Originated at Byk Gulden and developed through Altana and Nycomed',
    targetGene: 'NR3C1',
    targetProtein:
      'Glucocorticoid receptor, engaged not by ciclesonide itself but by its metabolite des-ciclesonide, which the label states has 120 times the receptor affinity of the parent and 12 times that of dexamethasone',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2006,
    indication:
      'ALVESCO is indicated for the maintenance treatment of asthma as prophylactic therapy in adults and paediatric patients 12 years of age and older, with explicit limitations of use excluding relief of acute bronchospasm and children under 12. OMNARIS nasal spray is indicated for nasal symptoms of seasonal allergic rhinitis in adults and children 6 years and older and of perennial allergic rhinitis in adults and adolescents 12 years and older',
    patientFriendlyIndication:
      'Daily asthma prevention, and blocked or runny nose from hay fever and year-round allergy',
    anatomicalSite:
      'The airway and nasal epithelium — the drug is inhaled inactive and converted to its active form by esterases in the lining tissue itself',
    conditionContext: {
      conditionExplainer:
        'Inhaled corticosteroids are the foundation of asthma treatment, and their limits are entirely about what happens to the fraction that does not stay in the lung: the part swallowed causes thrush and hoarseness, the part absorbed can suppress the adrenal axis, thin bone and slow growth in children.',
      whyItMatters:
        'Ciclesonide is a prodrug designed around exactly that problem. It arrives inactive, is converted to its active metabolite by esterases in the airway epithelium, has under 1% oral bioavailability and is about 99% protein bound. The argument is that this confines the steroid to where it is needed. The label carries every warning the class carries anyway.',
      whoTakesThis:
        'People aged 12 and over needing a daily preventer inhaler for asthma, and from age 6 for the nasal spray in seasonal allergic rhinitis. Not for children under 12 for the inhaler, where safety and effectiveness have not been established.',
      clinicalGoals:
        'Fewer symptoms, better lung function, less rescue inhaler use. Its own trials measured an improvement in morning pre-dose FEV1 of 0.24 litres against placebo at the twice-daily dose.',
    },
    oneSentenceVerdict:
      'An inhaled corticosteroid given as an inactive prodrug that airway esterases convert to a metabolite with 120 times its receptor affinity — a finding its own label says has unknown clinical significance — which improved morning pre-dose FEV1 by 0.24 litres against placebo in 691 patients, carries the full inhaled-steroid warning set for candidiasis, adrenal suppression, bone density, growth and cataracts despite the on-site-activation argument, and failed its primary endpoint in a 400-patient randomised trial in COVID-19.',
    laymanHowItWorks:
      'What you inhale is not the active drug. Ciclesonide is a switched-off molecule, and enzymes in the lining of your airway cut off one piece of it to turn it on. The active form is roughly 120 times better at gripping the steroid receptor than what went in. The design intent is that activation happens where the inflammation is and much less elsewhere, so the amount you swallow or absorb does relatively little. Like every preventer inhaler, it works over weeks and does nothing for an attack you are having now.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 62,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$42.95 per gram at United States pharmacy acquisition cost (CMS NADAC, median across 3 listed brand products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'ALVESCO was approved on 10 January 2008 under NDA 021658 and OMNARIS on 20 October 2006 under NDA 022004. All three listed products are still branded — the acquisition cost survey carries only brand entries, with no generic listings, which is the practical reason a drug approved twenty years ago is still priced by the gram rather than by the cent. ZETONNA, the nasal aerosol approved in 2012, is listed as discontinued in Drugs@FDA.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Ciclesonide’s selling point is not efficacy but a safety profile that the label does not distinguish from the rest of the class. Against the generic inhaled corticosteroids it competes on a mechanism argument at a brand price, and against them the only endpoint that has been compared head to head at scale is lung function, where the class is broadly interchangeable at equipotent doses.',
      conventionalRx: [
        {
          name: 'Budesonide or beclomethasone',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'Generic, decades of use, and the two agents with the largest long-term paediatric datasets. Budesonide is the drug in CAMP, which measured the growth cost directly over four to six years: 1.1 cm less height gain than placebo, mostly in the first year. Ciclesonide has no comparable long-term growth dataset and is not licensed under age 12 for the inhaler at all.',
          typicalCost:
            'Generic inhaled corticosteroids are widely available at a fraction of a branded inhaler’s acquisition cost',
          prosAndCons:
            'Pros: generic price, paediatric licences, the longest safety record in the class. Cons: more oropharyngeal deposition than a prodrug design predicts, and the same class warnings.',
        },
        {
          name: 'Fluticasone propionate or furoate',
          class: 'Inhaled corticosteroid',
          howItCompares:
            'The most widely prescribed inhaled corticosteroid, available generically and in combination with a long-acting beta-agonist, which ciclesonide is not. That absence matters more than any potency comparison: most people needing more than a low-dose steroid end up on a combination inhaler, and there is no ciclesonide combination product.',
          typicalCost: 'Generic fluticasone products are far cheaper than branded ciclesonide',
          prosAndCons:
            'Pros: available in combination inhalers, licensed from age 4, generic. Cons: higher oropharyngeal deposition and dysphonia rates than a prodrug is designed to produce.',
        },
        {
          name: 'Mometasone or fluticasone nasal spray',
          class: 'Intranasal corticosteroid',
          howItCompares:
            'The alternatives to OMNARIS for allergic rhinitis. Fluticasone propionate nasal spray is available over the counter in the United States at a fraction of the price, for the same indication.',
          typicalCost: 'Several intranasal corticosteroids are sold over the counter at low cost',
          prosAndCons:
            'Pros: over-the-counter availability, decades of use, no prescription required. Cons: the same class effects — epistaxis, nasal irritation, and rarely septal perforation.',
        },
        {
          name: 'Montelukast, for the nasal indication',
          class: 'Cysteinyl leukotriene receptor 1 antagonist',
          howItCompares:
            'An oral alternative for allergic rhinitis, and one whose label carries a boxed warning for serious neuropsychiatric events added in March 2020, reserving its use in allergic rhinitis for patients with an inadequate response or intolerance to alternative therapies. Intranasal corticosteroids outperform it on nasal symptom scores in the comparative literature.',
          typicalCost: 'Generic and inexpensive at pharmacy acquisition cost',
          prosAndCons:
            'Pros: oral, once daily. Cons: a boxed warning, an FDA recommendation against first-line use in mild allergic rhinitis, and smaller effects on nasal symptoms than a topical steroid.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Rinse and spit after every dose',
          action: 'Rinse the mouth with water after inhaling and spit it out without swallowing.',
          patientImpact:
            'Section 5.1 records oral and pharyngeal Candida albicans infection in 32 of 3,038 patients treated with ciclesonide, with 20 of those 32 occurring among the 1,394 on a total daily dose of 320 micrograms or more. Rinsing removes the fraction deposited in the mouth, which is where both thrush and the swallowed systemic exposure come from.',
          clinicalPrecaution:
            'The label directs treating an infection when it occurs and discontinuing the inhaler, not simply adding an antifungal and carrying on.',
        },
        {
          name: 'It is not a reliever, and it takes about four weeks',
          action: 'Keep the rescue inhaler, and keep taking the preventer during good spells.',
          patientImpact:
            'The label states that ciclesonide is not a bronchodilator and is not indicated for rapid relief of bronchospasm, and that maximum benefit may not be achieved for four weeks or longer after starting. It also notes that when corticosteroids are stopped, asthma stability may persist for several days or longer — which is how people convince themselves the preventer was doing nothing.',
          clinicalPrecaution:
            'The label directs contacting a physician immediately if asthma stops responding to usual bronchodilator doses, and notes that oral corticosteroids may be needed during such episodes.',
        },
        {
          name: 'Never stop oral steroids abruptly when switching to this',
          action:
            'Follow the taper exactly: no faster than 2.5 mg of prednisone per day per week, and only after at least a week on the inhaler.',
          patientImpact:
            'Section 5.4 warns of impaired adrenal function when transferring from oral steroids to an inhaled corticosteroid. The dosage section sets out the taper rate explicitly and directs monitoring both objective airflow measures and signs of adrenal insufficiency during and after the taper.',
          clinicalPrecaution:
            'Deaths from adrenal insufficiency have occurred historically during exactly this transition across the inhaled corticosteroid class. The taper is not a formality.',
        },
        {
          name: 'Have a child’s height measured, and ask about eyes',
          action:
            'Ask for routine stadiometry in any child on it, and mention any history of glaucoma, raised eye pressure or cataract.',
          patientImpact:
            'Section 5.7 states that orally inhaled corticosteroids including this one may cause a reduction in growth velocity in children and directs routine growth monitoring. Section 5.8 records glaucoma, increased intraocular pressure and cataracts following inhaled corticosteroid administration including this one. Section 5.6 records decreases in bone mineral density with long-term use.',
          clinicalPrecaution:
            'These are the same three warnings every inhaled corticosteroid carries. The prodrug design does not remove any of them from the label.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)C(=O)OCC(=O)[C@@]12[C@@H](C[C@@H]3[C@@]1(C[C@@H]([C@H]4[C@H]3CCC5=CC(=O)C=C[C@]45C)O)C)O[C@H](O2)C6CCCCC6',
      chemicalFormula: 'C32H44O7',
      molecularWeight: '540.70 g/mol',
      targetReceptorAffinity:
        'Ciclesonide itself is a prodrug with low intrinsic glucocorticoid receptor affinity. It is enzymatically hydrolysed after oral inhalation to C21-des-isobutyryl-ciclesonide, called des-ciclesonide or RM1, whose affinity for the glucocorticoid receptor the label states is 120 times greater than the parent compound and 12 times greater than dexamethasone. The label adds, in the same paragraph: "The clinical significance of these findings is unknown." The isobutyryl ester at C21 is the switch; the cyclohexylmethylene acetal across C16 and C17 is what makes the molecule lipophilic enough to be retained in airway tissue.',
      structureSource: {
        label:
          'PubChem CID 6918155 (ciclesonide) — canonical SMILES, molecular formula and weight, as carried on the enriched record; receptor affinity and prodrug chemistry from the ALVESCO United States prescribing information, sections 11 and 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918155',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cic-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the R-configured acetal and the intact C21 ester',
          description:
            'The label names the compound as the (R)-cyclohexylmethylene acetal specifically. That acetal carbon is a stereocentre created during synthesis and the S-epimer is a different molecule with different tissue retention. The C21 isobutyryl ester is the prodrug switch: any hydrolysis in the container is drug that arrives pre-activated, which defeats the entire design.',
          reagentsAndBuffer:
            'Ciclesonide reference standard, chiral and achiral reversed-phase HPLC with photodiode array detection, LC-MS to distinguish parent from des-ciclesonide, proton NMR for the acetal configuration, Karl Fischer titration',
        },
        {
          id: 'cic-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the acetal onto the 16,17-diol, then esterify C21',
          description:
            'Condense cyclohexanecarboxaldehyde onto the 16alpha,17alpha-diol of the steroid core under acid catalysis to form the cyclic acetal with the required R configuration, then acylate the C21 hydroxyl with isobutyric anhydride. Order matters: esterifying first leaves the acetal condensation to be run on an ester-bearing substrate under acid, which is exactly the condition that removes it again.',
          dependsOnStepId: 'cic-w1',
          reagentsAndBuffer:
            '16alpha,17alpha-dihydroxy pregnadiene precursor, cyclohexanecarboxaldehyde, acid catalyst such as perchloric or p-toluenesulfonic acid, isobutyric anhydride with base, anhydrous conditions under nitrogen',
        },
        {
          id: 'cic-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the acetal epimers and control des-ciclesonide as an impurity',
          description:
            'Chromatographic or crystallisation separation of the R and S acetal epimers, then release testing with des-ciclesonide specified as a named impurity rather than an assay component. For the metered-dose product, ciclesonide is formulated as a solution in HFA-134a with ethanol rather than a suspension, which removes particle-size control as a variable and replaces it with control of the solution’s water content, since water drives ester hydrolysis in the canister.',
          dependsOnStepId: 'cic-w2',
          reagentsAndBuffer:
            'Preparative chromatography or fractional crystallisation, HFA-134a propellant with ethanol co-solvent, moisture-controlled filling, cascade impaction for aerodynamic particle size distribution of the emitted solution aerosol',
        },
        {
          id: 'cic-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Prove the conversion happens in airway tissue and not in the mouth or plasma',
          description:
            'The entire clinical argument is that activation is local. That is a testable claim with a clear negative control: if esterases in oral mucosa or plasma convert ciclesonide at a comparable rate, then swallowed and absorbed drug is activated too and the design advantage disappears. The experiment is a side-by-side conversion rate in bronchial epithelial cells, oral epithelial cells, and human plasma.',
          dependsOnStepId: 'cic-w3',
          reagentsAndBuffer:
            'Primary human bronchial epithelial cells at air-liquid interface, oral keratinocyte culture, pooled human plasma and liver S9 as comparators, LC-MS/MS quantification of ciclesonide and des-ciclesonide over time, esterase inhibitor arms to confirm the enzymatic route',
        },
        {
          id: 'cic-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the systemic claim against a cortisol assay powerful enough to detect it',
          description:
            'The published human adrenal-axis data for this molecule is a 29-day study in 59 adults using 24-hour urinary free cortisol, and its confidence intervals span roughly 30 micrograms per day — wide enough to contain both no effect and a substantial one. An assay programme that could actually support a systemic-safety claim needs serum cortisol area under the curve or a low-dose ACTH stimulation test, adequate numbers, and an active comparator at an equipotent dose.',
          dependsOnStepId: 'cic-w4',
          reagentsAndBuffer:
            '24-hour serum cortisol profiling by LC-MS/MS, low-dose cosyntropin stimulation testing, an equipotent active comparator inhaled corticosteroid arm and a placebo arm, sample size set on the smallest cortisol difference judged clinically meaningful',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cic-a1',
        category: 'inferred',
        title: 'A 120-fold potency figure whose clinical significance the label calls unknown',
        laymanSummary:
          'The central selling point is that ciclesonide arrives inactive and is switched on in the airway into something 120 times more potent. The prescribing information states that fact and then says, in the next sentence, that the clinical significance of these findings is unknown.',
        technicalDetails:
          'Section 12.1 of the ALVESCO label reads: "Ciclesonide is a prodrug that is enzymatically hydrolyzed to a pharmacologically active metabolite, C21-desisobutyryl-ciclesonide (des-ciclesonide or RM1) following oral inhalation. Des-ciclesonide has anti-inflammatory activity with affinity for glucocorticoid receptors that is 120 times greater than the parent compound and 12 times greater than dexamethasone. The clinical significance of these findings is unknown." It continues: "The precise mechanisms of corticosteroid action in asthma are unknown." Two disclaimers in four sentences. The receptor affinity numbers are real in vitro measurements, and the inference the marketing rests on — that local activation of a highly potent metabolite means more anti-inflammatory effect at the airway and less everywhere else — is a mechanistic argument that the regulator has explicitly declined to endorse as clinically meaningful.',
        evidenceSource:
          'ALVESCO (ciclesonide) United States prescribing information, Clinical Pharmacology section 12.1 (NDA 021658)',
        inferredClaim:
          'That on-site enzymatic activation of a 120-fold more potent metabolite gives ciclesonide a clinically meaningful advantage over other inhaled corticosteroids — an in vitro potency ratio whose clinical significance the label states is unknown',
        auditFlag: 'contested',
      },
      {
        id: 'cic-a2',
        category: 'failed',
        title: 'The label carries every warning the class carries',
        laymanSummary:
          'If a prodrug design really confined the steroid to the airway, the warnings about the rest of the body should shrink. They do not. Thrush, adrenal suppression, thinning bone, slowed growth in children, glaucoma and cataracts are all on this label, in the same form as on any other inhaled steroid.',
        technicalDetails:
          'The ALVESCO Warnings and Precautions section lists: Candida albicans infection of the mouth and pharynx (5.1); worsening of tuberculosis and of fungal, bacterial, viral, parasitic and ocular herpes simplex infections, and a more serious or fatal course of chickenpox or measles in susceptible patients (5.3); impaired adrenal function when transferring from oral steroids (5.4); hypercorticism and HPA suppression at very high dosages or at regular dosage in susceptible individuals (5.5); decreases in bone mineral density with long-term administration (5.6); suppression of growth in children, with routine stadiometry directed (5.7); and glaucoma, increased intraocular pressure and posterior subcapsular cataracts (5.8). Section 5.5 offers the only comparative statement, and it compares the drug not with another inhaled steroid but with prednisone: it "will often help control asthma symptoms with less suppression of HPA function than therapeutically similar oral doses of prednisone." Every inhaled corticosteroid can say that. The differentiation the molecule was designed for does not appear anywhere in its own safety labelling.',
        evidenceSource:
          'ALVESCO (ciclesonide) United States prescribing information, Warnings and Precautions sections 5.1 to 5.8 (NDA 021658)',
        measuredMetric:
          'The complete Warnings and Precautions set on this label against the standard inhaled corticosteroid class warning set',
        auditFlag: 'caution',
      },
      {
        id: 'cic-a3',
        category: 'inferred',
        title: 'The adrenal-axis study cannot support the claim it is used for',
        laymanSummary:
          'The evidence that ciclesonide spares the adrenal glands is a 29-day study in 59 adults measuring cortisol in urine. Its confidence intervals run from roughly minus 15 to plus 20 micrograms a day — wide enough to include no effect and a real one at the same time.',
        technicalDetails:
          'Section 12.2 describes a 29-day placebo-controlled study in adults with mild asthma in which 24-hour urinary free cortisol was assessed in 59 adults randomised to 320 or 640 micrograms of ciclesonide twice daily, a comparator corticosteroid, or placebo. Mean change from baseline in 24-hour urinary free cortisol was -8.69 micrograms/day on placebo, -4.01 on 640 micrograms/day of ciclesonide and -8.84 on 1280 micrograms/day. The differences from placebo were +4.7 micrograms/day (95% CI -10.58 to 19.93) and -0.16 micrograms/day (95% CI -15.20 to 14.89). Those intervals are about 30 micrograms per day wide in a study of 59 people over four weeks. The label notes that the effects observed with the comparator corticosteroid validate the sensitivity of the assay, which addresses whether the method works but not whether the study is large enough to exclude a clinically relevant difference. This is a textbook absence of evidence being read as evidence of absence, and the reading is not made by the label — it is made by everything written about the drug afterwards.',
        evidenceSource:
          'ALVESCO (ciclesonide) United States prescribing information, Clinical Pharmacology section 12.2 (NDA 021658)',
        inferredClaim:
          'That ciclesonide does not suppress the adrenal axis — inferred from a 59-patient 29-day study whose confidence intervals are wide enough to contain a substantial effect',
        auditFlag: 'caution',
      },
      {
        id: 'cic-a4',
        category: 'measured',
        title: 'The asthma effect is real, and twice daily beats once daily in its own trials',
        laymanSummary:
          'In 691 patients using only a reliever inhaler, ciclesonide 80 micrograms twice daily raised morning lung function by 0.24 litres against placebo. The same-total-dose once-daily regimen managed half that, and the label says outright that once daily is not the optimum regimen.',
        technicalDetails:
          'The asthma programme comprised six randomised, double-blind, placebo-controlled parallel-group trials in 2,843 patients aged 12 and over, of whom 296 were adolescents. In a 691-patient trial in mild-to-moderate persistent asthma previously on bronchodilators alone (mean baseline 72% predicted FEV1), increases in morning pre-dose FEV1 against placebo at week 16 were 0.24 L (10.4%) for 80 micrograms twice daily, 0.12 L (5.0%) for 160 micrograms once daily, and 0.13 L (5.0%) for 80 micrograms twice daily for 4 weeks followed by 160 micrograms once daily. All doses were statistically significant against placebo, and twice-daily 80 micrograms was significantly better than the same total dose given once daily. The label states plainly that the once-daily trials, together with the twice-daily ones, "indicate that once daily dosing is not the optimum dosing regimen for ALVESCO." A 0.24 L improvement in pre-dose FEV1 is a solid inhaled corticosteroid effect and larger than any of the asthma biologics on this page produce.',
        evidenceSource:
          'ALVESCO (ciclesonide) United States prescribing information, Clinical Studies section 14.1 (NDA 021658)',
        measuredMetric:
          'Change from baseline in morning pre-dose FEV1 at week 16 against placebo, by dosing regimen',
        auditFlag: 'verified',
      },
      {
        id: 'cic-a5',
        category: 'failed',
        title: 'The COVID-19 trial missed, and the rescued endpoint was a secondary one',
        laymanSummary:
          'A 400-patient randomised trial gave ciclesonide to outpatients with COVID-19. Median time to symptom relief was 19 days in both arms — no difference at all. The result that got reported was a secondary endpoint: fewer emergency visits and admissions.',
        technicalDetails:
          'This phase 3, multicentre, double-blind randomised trial at ten United States centres enrolled 400 non-hospitalised patients with symptomatic COVID-19, randomised to ciclesonide metered-dose inhaler 160 micrograms per actuation, two actuations twice daily (640 micrograms/day), or placebo for 30 days. The primary endpoint, time to alleviation of all COVID-19-related symptoms by day 30, gave a median of 19.0 days (95% CI 14.0 to 21.0) on ciclesonide and 19.0 days (95% CI 16.0 to 23.0) on placebo. Resolution of all symptoms by day 30 gave an odds ratio of 1.28 (95% CI 0.84 to 1.97) — no difference. The published conclusion states the trial did not achieve its primary efficacy endpoint. Participants on ciclesonide did have fewer subsequent emergency department visits or hospital admissions for COVID-related reasons: odds ratio 0.18 (95% CI 0.04 to 0.85). That is a secondary endpoint in a trial whose primary endpoint failed, with a confidence interval reaching 0.85, in a population of 400 with few events. It is a hypothesis, and it is the number that was circulated.',
        evidenceSource:
          'Clemency BM, Varughese R, Gonzalez-Rojas Y, et al. Efficacy of inhaled ciclesonide for outpatient treatment of adolescents and adults with symptomatic COVID-19: a randomized clinical trial. JAMA Intern Med 2022;182:42-49, NCT04377711',
        doi: '10.1001/jamainternmed.2021.6759',
        measuredMetric:
          'Time to alleviation of all COVID-19-related symptoms by day 30, and subsequent emergency department visits or hospital admissions',
        auditFlag: 'caution',
      },
      {
        id: 'cic-a6',
        category: 'failed',
        title: 'No paediatric licence for the inhaler, in the drug marketed on paediatric safety',
        laymanSummary:
          'The whole argument for a prodrug inhaled steroid is that it should be gentler on growing children. In the United States, the inhaler is not licensed for anyone under 12, because safety and effectiveness were never established there.',
        technicalDetails:
          'The ALVESCO indication carries an explicit limitation of use: it "is not indicated for children under 12 years of age." Section 5.7 states that safety and effectiveness have not been established in paediatric patients less than 12 years of age, and that orally inhaled corticosteroids including this one may cause a reduction in growth velocity when administered to paediatric patients, with routine stadiometry directed. The nasal spray reaches down to age 6 for seasonal allergic rhinitis; the inhaler does not. The comparison that makes this pointed is CAMP, which randomised 1,041 children aged 5 to 12 to budesonide, nedocromil or placebo for four to six years and measured the growth cost of budesonide precisely: 1.1 cm less height gain than placebo, p=0.005. A molecule designed to avoid exactly that cost has no equivalent long-term paediatric dataset and no paediatric inhaler licence.',
        evidenceSource:
          'ALVESCO (ciclesonide) United States prescribing information, Indications and Usage limitations and Warnings and Precautions 5.7 (NDA 021658); CAMP Research Group, N Engl J Med 2000;343:1054-1063',
        doi: '10.1056/NEJM200010123431501',
        measuredMetric:
          'Licensed age range and the paediatric safety and effectiveness data supporting it',
        auditFlag: 'caution',
      },
      {
        id: 'cic-a7',
        category: 'conclusion_shift',
        title:
          'Twenty years on, still branded, still priced by the gram, and one product withdrawn',
        laymanSummary:
          'A drug first approved in 2006 would normally be a cheap generic by now. All three ciclesonide products in the CMS acquisition survey are still brand entries, and the nasal aerosol approved in 2012 is listed as discontinued.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost survey effective 19 August 2026 lists three ciclesonide products, all classified as brand, at a median of US$42.95 per gram — a unit of measure the survey uses for inhalers and nasal sprays rather than the per-tablet cents applied to old small molecules. OMNARIS was approved on 20 October 2006 and ALVESCO on 10 January 2008. ZETONNA, the nasal aerosol approved on 20 January 2012 under NDA 202129, is listed as discontinued in Drugs@FDA. Inhaled products resist genericisation for reasons unrelated to patent life: bioequivalence for an orally inhaled drug requires demonstrating equivalent regional lung deposition, which is far harder than matching a plasma curve, and device patents outlive molecule patents. The consequence for a patient is that a twenty-year-old steroid still costs what a branded inhaler costs, and the prodrug argument is what that price is defended with.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost survey, ciclesonide, 3 listed brand products, effective 19 August 2026; FDA Drugs@FDA records for NDA 021658, NDA 022004 and NDA 202129',
        measuredMetric:
          'Acquisition cost and brand-or-generic classification of every listed ciclesonide product, and the marketing status of each approved application',
        auditFlag: 'caution',
      },
      {
        id: 'cic-a8',
        category: 'measured',
        title: 'Thrush still happens, and it rises with dose',
        laymanSummary:
          'Oral thrush occurred in 32 of 3,038 patients on ciclesonide. Twenty of those 32 were among the 1,394 taking 320 micrograms a day or more — so the rate roughly doubles at higher doses.',
        technicalDetails:
          'Section 5.1 records localised Candida albicans infection of the mouth and pharynx in 32 of 3,038 patients treated with ciclesonide, of which 20 occurred in the 1,394 patients on a total daily dose of 320 micrograms or higher. That is roughly 0.4% at lower doses and 1.4% at 320 micrograms or above — a dose relationship, in a drug whose design argument is that the swallowed and oropharyngeal fraction should be inactive. Most cases were mild to moderate. The label directs treating the infection and discontinuing the drug, and instructs patients to rinse the mouth after inhalation. The rate is genuinely low by the standards of the class, which is the strongest single piece of evidence for the prodrug argument on this page. It is also, notably, the one class effect the design would most directly predict, and it is not zero.',
        evidenceSource:
          'ALVESCO (ciclesonide) United States prescribing information, Warnings and Precautions section 5.1 (NDA 021658)',
        measuredMetric:
          'Incidence of oropharyngeal candidiasis overall and at total daily doses of 320 micrograms or higher',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'What you inhale is switched off',
        laymanDesc:
          'Ciclesonide by itself barely grips the steroid receptor. It is a locked version of the drug, delivered as a fine solution mist rather than a suspension of particles.',
        molecularDetail:
          'A non-halogenated glucocorticoid, C32H44O7, molecular weight 540.7, formulated as a solution in HFA-134a propellant with ethanol rather than a micronised suspension. Each actuation delivers 80 or 160 micrograms from the actuator out of 100 or 200 micrograms from the valve. The C21 isobutyryl ester is the lock.',
        iconName: 'Lock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Enzymes in the airway lining cut the lock off',
        laymanDesc:
          'Esterases in the cells lining your airway snip off one piece of the molecule, and what is left is the active steroid.',
        molecularDetail:
          'Enzymatic hydrolysis to C21-des-isobutyryl-ciclesonide, called des-ciclesonide or RM1, following oral inhalation. The design intent is that this conversion is concentrated in airway tissue rather than in the mouth, gut or plasma — the claim on which the whole safety argument rests.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The active form grips the receptor 120 times harder',
        laymanDesc:
          'Des-ciclesonide binds the steroid receptor roughly 120 times more strongly than what you inhaled, and twelve times more strongly than dexamethasone.',
        molecularDetail:
          'The label states des-ciclesonide has affinity for glucocorticoid receptors 120 times greater than the parent compound and 12 times greater than dexamethasone, and immediately adds that the clinical significance of these findings is unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The receptor turns down a long list of inflammatory genes',
        laymanDesc:
          'Once bound, the receptor moves into the cell nucleus and quietens the genes that produce inflammation across many different cell types.',
        molecularDetail:
          'The label states the precise mechanisms of corticosteroid action in asthma are unknown, and describes inhibitory activity against mast cells, eosinophils, basophils, lymphocytes, macrophages and neutrophils, and against histamine, eicosanoids, leukotrienes and cytokines. Maximum benefit may not be achieved for four weeks or longer.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Lung function rises by about a quarter of a litre',
        laymanDesc:
          'In its own trials, morning lung function improved by 0.24 litres against placebo on the twice-daily dose — and by half that when the same total dose was given once a day.',
        molecularDetail:
          'In 691 patients previously on bronchodilators alone with a mean baseline FEV1 of 72% predicted, week-16 improvements in morning pre-dose FEV1 against placebo were 0.24 L (10.4%) for 80 micrograms twice daily and 0.12 L (5.0%) for 160 micrograms once daily. The label states once daily is not the optimum dosing regimen.',
        iconName: 'BarChart',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the class warnings do not go away',
        laymanDesc:
          'Thrush, adrenal suppression, thinning bone, slowed growth in children, glaucoma and cataracts are all still on the label — the same list as every other steroid inhaler.',
        molecularDetail:
          'Oropharyngeal candidiasis in 32 of 3,038 patients, rising with dose; hypercorticism and HPA suppression at high dosages or in susceptible individuals; decreased bone mineral density with long-term administration; reduction in growth velocity in children with routine stadiometry directed; glaucoma, raised intraocular pressure and posterior subcapsular cataracts. The inhaler is not licensed under age 12.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'ALVESCO asthma programme, 16-week trial in bronchodilator-only patients (NDA 021658)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, parallel-group',
        sampleSize: 691,
        primaryEndpoint:
          'Mean change from baseline in morning pre-dose FEV1 at week 16 in mild-to-moderate persistent asthma previously treated with bronchodilators alone',
        endpointMet: true,
        statisticalPValue:
          'Increases against placebo of 0.24 L (10.4%) for 80 micrograms twice daily, 0.12 L (5.0%) for 160 micrograms once daily, and 0.13 L (5.0%) for the switch regimen; all statistically significant against placebo, with twice-daily significantly better than the same total dose once daily',
        unreportedAdverseSignals:
          'The label concludes from this and the other five trials that once daily dosing is not the optimum dosing regimen — a negative finding about a regimen that was nonetheless studied across two dedicated trials.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Ciclesonide in outpatient COVID-19 (NCT04377711)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 400,
        primaryEndpoint:
          'Time to alleviation of all COVID-19-related symptoms by day 30 in non-hospitalised patients with symptomatic COVID-19',
        endpointMet: false,
        statisticalPValue:
          'Median 19.0 days (95% CI 14.0 to 21.0) on ciclesonide against 19.0 days (95% CI 16.0 to 23.0) on placebo; resolution of all symptoms by day 30 odds ratio 1.28 (95% CI 0.84 to 1.97)',
        unreportedAdverseSignals:
          'A secondary endpoint — subsequent emergency department visits or hospital admissions attributable to COVID-19 — favoured ciclesonide at an odds ratio of 0.18 (95% CI 0.04 to 0.85), on few events in 400 patients after the primary endpoint had failed. No participants died during the study.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ALVESCO 29-day hypothalamic-pituitary-adrenal axis study (NDA 021658)',
        phase: 'Randomised, placebo-controlled, active-comparator pharmacodynamic study',
        sampleSize: 59,
        primaryEndpoint:
          'Change from baseline in 24-hour urinary free cortisol after 29 days in adults with mild asthma',
        endpointMet: true,
        statisticalPValue:
          'Difference from placebo +4.7 mcg/day (95% CI -10.58 to 19.93) at 640 mcg/day and -0.16 mcg/day (95% CI -15.20 to 14.89) at 1280 mcg/day',
        unreportedAdverseSignals:
          'Confidence intervals roughly 30 micrograms per day wide in 59 patients over four weeks. The comparator corticosteroid validated assay sensitivity but the study cannot exclude a clinically relevant adrenal effect, and it is routinely cited as though it can.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Morning pre-dose FEV1 improvement of 0.24 L against placebo at 80 micrograms twice daily in 691 patients at week 16',
        'Twice-daily dosing significantly better than the same total daily dose given once daily, in the drug’s own programme',
        'Des-ciclesonide receptor affinity 120 times the parent and 12 times dexamethasone, in vitro',
        'Oropharyngeal candidiasis in 32 of 3,038 patients, with 20 of those among the 1,394 on 320 micrograms/day or more',
        'No difference from placebo in time to symptom alleviation in 400 outpatients with COVID-19 (19.0 days in both arms)',
      ],
      unsupportedInferences: [
        'That the 120-fold potency of the active metabolite translates into a clinical advantage, which the label states is of unknown significance',
        'That local activation spares the adrenal axis, inferred from a 59-patient 29-day study with confidence intervals wide enough to contain a substantial effect',
        'That the prodrug design reduces the class risks, when the label carries the full class warning set unchanged',
        'That the secondary reduction in emergency visits in the COVID-19 trial is a real effect, from a trial that failed its primary endpoint',
      ],
      whatFailedInitially: [
        'The primary endpoint of the 400-patient outpatient COVID-19 trial',
        'Once-daily dosing, which the label states is not the optimum regimen after two dedicated trials',
        'The paediatric inhaler licence, which does not exist below age 12 in the United States',
        'ZETONNA, the nasal aerosol approved in 2012, now listed as discontinued',
      ],
      realWorldOutcome: [
        'OMNARIS approved 20 October 2006 under NDA 022004 and ALVESCO 10 January 2008 under NDA 021658, both now held by Azurity',
        'All three listed products remain brand entries in the CMS acquisition cost survey at a median of US$42.95 per gram, twenty years after first approval',
        'No combination product with a long-acting beta-agonist exists, which excludes it from the step of asthma care where most inhaled steroid is prescribed',
        'The nasal spray reaches down to age 6 for seasonal allergic rhinitis; the inhaler is licensed only from age 12',
      ],
    },
    deliverySystem: {
      type: 'Pressurised metered-dose inhaler delivering 80 or 160 micrograms per actuation, taken twice daily; a 50-microgram-per-spray nasal spray for allergic rhinitis',
      description:
        'Formulated as a solution in HFA-134a propellant with ethanol rather than a micronised suspension, delivering 50 microlitres as a fine particle mist per actuation. Prime with three actuations before first use or after ten days unused, and rinse and spit after every dose. Absorption of the swallowed fraction is minimal — oral bioavailability of the parent is under 1% — and the pharmacological premise is that conversion to the active metabolite is concentrated in airway tissue.',
      safetyProfile:
        'Not a bronchodilator and not indicated for rapid relief of bronchospasm or for children under 12. Warnings cover oropharyngeal candidiasis (32 of 3,038 patients, rising with dose); worsening of tuberculosis and of fungal, bacterial, viral, parasitic and ocular herpes simplex infection, with a more serious or fatal course of chickenpox or measles in susceptible patients; impaired adrenal function when transferring from oral corticosteroids, with a taper no faster than 2.5 mg of prednisone per day per week; hypercorticism and HPA suppression at high dosages or in susceptible individuals; decreased bone mineral density with long-term use; reduction in growth velocity in children with routine stadiometry directed; and glaucoma, raised intraocular pressure and posterior subcapsular cataracts. The most common adverse reactions at 3% or more were headache, nasopharyngitis, sinusitis, pharyngolaryngeal pain, upper respiratory infection, arthralgia, nasal congestion, pain in extremity and back pain.',
    },
    commonQuestions: [
      {
        q: 'Is it really safer than other steroid inhalers?',
        a: 'The mechanism is genuinely different and the safety claim is much softer than it sounds. What you inhale is inactive; enzymes in the airway lining convert it to a metabolite that grips the steroid receptor about 120 times more strongly. The label states that fact and then says the clinical significance is unknown. The strongest supporting number is the thrush rate — 32 cases in 3,038 patients, low for the class — which is exactly the effect the design should reduce. Against that, the label carries every warning any other inhaled steroid carries: adrenal suppression, bone density, growth in children, glaucoma, cataracts. And the adrenal study everyone cites enrolled 59 people for 29 days, with confidence intervals wide enough to hide a real effect.',
        auditNote:
          'The one comparative safety sentence in the label compares ciclesonide with oral prednisone, not with another inhaled steroid. Every inhaled steroid could make that comparison.',
      },
      {
        q: 'Can I take it once a day instead of twice?',
        a: 'The label says no more clearly than labels usually do. Two of the six registration trials were dedicated to once-daily dosing, and after all six the label states that "once daily dosing is not the optimum dosing regimen for ALVESCO." The numbers behind that: in the same trial, 80 micrograms twice daily improved morning lung function by 0.24 litres against placebo, while 160 micrograms once daily — the same total dose — managed 0.12 litres. Half the effect from the same amount of drug, because a twelve-hour dosing interval matters more than the daily total does.',
      },
      {
        q: 'Why is it still expensive after twenty years?',
        a: 'Because inhalers are hard to genericise for reasons that have nothing to do with the molecule. To approve a generic tablet you show the plasma concentration curve matches. To approve a generic inhaler you have to show the drug lands in the same places in the lung, which is much harder to demonstrate, and the device itself carries patents that outlive the drug patent. The result is on the pricing record: all three ciclesonide products in the CMS acquisition survey are still classified as brand, at a median of about forty-three US dollars per gram, from applications approved in 2006 and 2008.',
      },
      {
        q: 'I read it was promising for COVID. What happened?',
        a: 'It was tested properly and it missed. A 400-patient randomised, double-blind trial at ten US centres gave outpatients with COVID-19 either ciclesonide 640 micrograms a day or placebo for 30 days. The median time to relief of all symptoms was 19.0 days in both arms — identical. The odds of having all symptoms resolved by day 30 were 1.28, confidence interval 0.84 to 1.97: no difference. What did get reported was a secondary finding, fewer subsequent emergency visits and admissions, odds ratio 0.18 with a confidence interval reaching 0.85, on a small number of events in a trial whose primary endpoint had already failed. That is a hypothesis worth testing, not a result.',
        auditNote:
          'A secondary endpoint in a trial that missed its primary is the single most common way a null result gets reported as a positive one.',
      },
      {
        q: 'Can my child use it?',
        a: 'The nasal spray, from age 6 for seasonal hay fever. The inhaler, not under 12 in the United States — the label says so in its limitations of use, and section 5.7 says safety and effectiveness have not been established below that age. This is worth noticing, because sparing children the growth cost of inhaled steroids is the most attractive version of the prodrug argument, and it is the population where the drug has the least data. For scale on what that cost is: in the CAMP trial, 1,041 children on budesonide for four to six years grew 1.1 cm less than those on placebo, almost all of it in the first year. There is no comparable long-term measurement for ciclesonide.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'ALVESCO (ciclesonide) inhalation aerosol United States prescribing information — Indications and Usage with Limitations of Use, Dosage and Administration 2.1 and 2.2, Warnings and Precautions 5.1 to 5.8, Adverse Reactions 6.1, Description 11, Clinical Pharmacology 12.1 and 12.2, Clinical Studies 14.1 (NDA 021658)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22ALVESCO%22',
        kind: 'regulatory',
      },
      {
        label:
          'OMNARIS (ciclesonide) nasal spray United States prescribing information — Indications and Usage (NDA 022004)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22OMNARIS%22',
        kind: 'regulatory',
      },
      {
        label:
          'Clemency BM, Varughese R, Gonzalez-Rojas Y, et al. Efficacy of inhaled ciclesonide for outpatient treatment of adolescents and adults with symptomatic COVID-19: a randomized clinical trial. JAMA Intern Med 2022;182:42-49',
        identifier: '10.1001/jamainternmed.2021.6759',
        kind: 'doi',
      },
      {
        label:
          'Ciclesonide in non-hospitalised patients with symptomatic COVID-19, ClinicalTrials.gov record',
        identifier: 'NCT04377711',
        kind: 'nct',
      },
      {
        label:
          'The Childhood Asthma Management Program Research Group. Long-term effects of budesonide or nedocromil in children with asthma. N Engl J Med 2000;343:1054-1063 — the growth measurement the prodrug argument is aimed at',
        identifier: '10.1056/NEJM200010123431501',
        kind: 'doi',
      },
      {
        label:
          'FDA Drugs@FDA — ALVESCO NDA 021658 (approved 10 January 2008), OMNARIS NDA 022004 (approved 20 October 2006) and ZETONNA NDA 202129 (approved 20 January 2012, marketing status Discontinued)',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22ALVESCO%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — ciclesonide, 3 listed brand products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 6918155 — ciclesonide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918155',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Olodaterol — approved on lung function curves alone, never on an exacerbation endpoint, and
  //     tested in four asthma dose-ranging trials for a disease its label says it must not be used
  //     for. Combined with tiotropium in 7,880 patients, it missed the exacerbation target it was
  //     combined to hit.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'olodaterol',
    name: 'Olodaterol',
    tradeName: 'Striverdi Respimat (alone) / Stiolto Respimat (with tiotropium)',
    sponsor:
      'Boehringer Ingelheim — STRIVERDI RESPIMAT under NDA 203108, approved 31 July 2014, and STIOLTO RESPIMAT under NDA 206756, approved 21 May 2015',
    targetGene: 'ADRB2',
    targetProtein:
      'Beta-2 adrenoceptor on airway smooth muscle, with 241-fold greater agonist activity than at beta-1 and 2,299-fold greater than at beta-3 in vitro — a selectivity ratio the label states is of unknown clinical significance',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2014,
    indication:
      'Long-term, once-daily maintenance bronchodilator treatment of airflow obstruction in patients with chronic obstructive pulmonary disease, including chronic bronchitis and emphysema. The label carries two explicit limitations of use: it is not indicated to treat acute deteriorations of COPD, and it is not indicated to treat asthma',
    patientFriendlyIndication:
      'Long-term COPD — a once-daily inhaler that holds the airway open, and must never be used for asthma',
    anatomicalSite:
      'Beta-2 adrenoceptors on airway smooth muscle, and on lung epithelial and endothelial cells and the heart, where the label notes their precise function is not known',
    conditionContext: {
      conditionExplainer:
        'A long-acting beta-agonist does one thing: it relaxes the muscle wrapped around the airway, so the tube is wider and air moves more easily. It does nothing to the inflammation underneath. In COPD, where the obstruction is partly structural, that relaxation is worth roughly a tenth of a litre of measured lung function.',
      whyItMatters:
        'Olodaterol was approved on lung function curves. Its eight confirmatory trials measured FEV1 area under the curve over three hours and trough FEV1 — no exacerbation endpoint, no hospitalisation endpoint, no mortality endpoint. When the exacerbation question was finally asked, in 7,880 patients combining olodaterol with tiotropium, the answer missed its own significance threshold.',
      whoTakesThis:
        'Adults with COPD needing maintenance bronchodilation. Not people having an acute deterioration, and not people with asthma — for whom the label carries the class warning that a long-acting beta-agonist without an inhaled steroid increases the risk of asthma-related death.',
      clinicalGoals:
        'A wider airway and less rescue inhaler use, measured as FEV1. Nothing beyond that was measured in the registration programme.',
    },
    oneSentenceVerdict:
      'A once-daily beta-2 agonist approved on FEV1 area-under-the-curve and trough lung function in 3,533 COPD patients with no exacerbation endpoint anywhere in its registration programme, whose 10 microgram dose showed no benefit over 5 micrograms, whose combination with tiotropium in 7,880 patients gave an exacerbation rate ratio of 0.93 (99% CI 0.85 to 1.02, p=0.0498) against a pre-specified 0.01 threshold and so missed, and which was dose-ranged in four asthma trials for a disease its own label forbids it in.',
    laymanHowItWorks:
      'The airways are wrapped in a layer of smooth muscle. Olodaterol switches on the beta-2 receptors in that muscle, which raises an internal messenger called cyclic AMP and makes the muscle let go. The tube widens. One dose lasts a full day, which is what separates it from the older versions taken twice a day. It does nothing to the inflammation or the structural damage underneath, and it is not a rescue inhaler — it must not be used when breathing suddenly gets worse.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$65.95 per gram at United States pharmacy acquisition cost (CMS NADAC, the one listed brand product, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'STRIVERDI RESPIMAT was approved on 31 July 2014 under NDA 203108 and the tiotropium combination STIOLTO RESPIMAT on 21 May 2015 under NDA 206756. Only one product is listed in the acquisition cost survey and it is a brand entry. Inhaled products resist genericisation for reasons unrelated to the molecule: a generic must demonstrate equivalent regional lung deposition rather than an equivalent plasma curve, and the Respimat soft-mist device carries its own patent estate separate from the drug.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every long-acting beta-agonist in COPD produces a lung function improvement of broadly similar size, and olodaterol was tested directly against two of the alternatives in its own programme. The question worth asking is not which bronchodilator but whether a bronchodilator alone is the right step: the trials that reduced exacerbations and mortality in COPD used combinations including an inhaled corticosteroid, and olodaterol monotherapy has no exacerbation evidence of any kind.',
      conventionalRx: [
        {
          name: 'Formoterol',
          class: 'Long-acting beta-2 agonist, twice daily',
          howItCompares:
            'The active comparator in four of olodaterol’s eight confirmatory trials, at 12 micrograms twice daily. It is generic, available as a nebuliser solution as well as an inhaler, and available in combination with budesonide — which olodaterol is not.',
          typicalCost:
            'Generic formoterol products are substantially cheaper than a branded soft-mist inhaler at pharmacy acquisition cost',
          prosAndCons:
            'Pros: generic, available in inhaled corticosteroid combinations, nebulisable. Cons: twice daily, and the same absence of a monotherapy exacerbation benefit.',
        },
        {
          name: 'Tiotropium',
          class: 'Long-acting muscarinic antagonist, once daily',
          howItCompares:
            'The other active comparator in olodaterol’s programme and the drug it is combined with in Stiolto. It is the comparison DYNAGITO ran: adding olodaterol to tiotropium in 7,880 patients gave an exacerbation rate ratio of 0.93 with a 99% confidence interval of 0.85 to 1.02, missing the pre-specified 0.01 significance level. Tiotropium alone has its own large mortality and exacerbation trial programme, which olodaterol does not.',
          typicalCost:
            'Available generically in some presentations; the Respimat device versions remain branded',
          prosAndCons:
            'Pros: an established exacerbation benefit and a large dedicated safety trial. Cons: anticholinergic effects — dry mouth, urinary retention, and caution in narrow-angle glaucoma.',
        },
        {
          name: 'An inhaled corticosteroid combination, such as budesonide-formoterol or fluticasone-vilanterol',
          class: 'Inhaled corticosteroid plus long-acting beta-agonist',
          howItCompares:
            'The step where the COPD outcome evidence actually sits. Exacerbation reduction and, in triple therapy trials, mortality signals come from regimens containing an inhaled corticosteroid. Olodaterol has no corticosteroid combination product, so a patient needing one moves to a different molecule entirely.',
          typicalCost:
            'Several combination inhalers are available generically; branded triple therapy devices are not',
          prosAndCons:
            'Pros: the exacerbation and outcome evidence base in COPD. Cons: pneumonia risk with inhaled corticosteroids in COPD, and the same class beta-agonist cautions.',
        },
        {
          name: 'Pulmonary rehabilitation and smoking cessation',
          class: 'Non-pharmacological',
          howItCompares:
            'The two interventions in COPD with the largest effects on symptoms and on survival respectively. Neither appears on a drug page by default, and both outperform any single bronchodilator on outcomes that are not spirometry.',
          typicalCost:
            'Programme costs vary by health system; smoking cessation support is among the most cost-effective interventions in medicine',
          prosAndCons:
            'Pros: effects on exercise capacity, admissions and survival that no bronchodilator has demonstrated. Cons: access, adherence, and neither replaces a bronchodilator for day-to-day breathlessness.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Two puffs is one dose, once a day, and no more',
          action:
            'Two inhalations at the same time each day. Never exceed two inhalations in 24 hours.',
          patientImpact:
            'The label states that excessive use, or use alongside another product containing a long-acting beta-agonist, can result in clinically significant cardiovascular effects and may be fatal. The Respimat device delivers 5 micrograms of olodaterol across two actuations in 22.1 microlitres of solution — the two-actuation dose is easy to mistake for two doses.',
          clinicalPrecaution:
            'Check every other inhaler for a long-acting beta-agonist before adding this one. Duplication across two devices is the specific error the warning is about.',
        },
        {
          name: 'Keep the blue reliever, and never use this one for a bad day',
          action:
            'Use a short-acting beta-agonist for acute symptoms, and seek help if breathing is deteriorating.',
          patientImpact:
            'The label states olodaterol should not be initiated in patients with acutely deteriorating COPD, which may be life-threatening, that it has not been studied in that setting, and that its use there is inappropriate. It is also not for relief of acute bronchospasm.',
          clinicalPrecaution:
            'Increasing use of a short-acting reliever is the standard signal that the disease is destabilising, and it is the reason a maintenance inhaler and a rescue inhaler must stay distinct in a patient’s mind.',
        },
        {
          name: 'If you have asthma, this is the wrong inhaler',
          action:
            'Tell the prescriber if asthma is part of the picture, and never accept a long-acting beta-agonist without an inhaled steroid for asthma.',
          patientImpact:
            'Section 5.1 states that use of long-acting beta-2 agonists as monotherapy without an inhaled corticosteroid for asthma is associated with an increased risk of asthma-related death, that this is considered a class effect including this drug, and that no study adequate to determine whether the risk is increased with olodaterol specifically has been conducted.',
          clinicalPrecaution:
            'The label also records that available data do not suggest an increased risk of death with long-acting beta-agonists in COPD, which is the disease this product is licensed for. The two statements sit side by side in the same section.',
        },
        {
          name: 'Prime the device, and prime it again after a gap',
          action:
            'Actuate until a cloud is visible then three more times before first use; once after 3 days unused; the full sequence again after 21 days.',
          patientImpact:
            'The Respimat is a mechanical soft-mist inhaler rather than a propellant device, and an unprimed or long-idle unit delivers less than a full dose. The label sets out the priming schedule explicitly in the dosage section.',
          clinicalPrecaution:
            'A patient who reports the inhaler stopping working after a holiday has usually not lost a treatment effect but skipped a priming step.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)(CC1=CC=C(C=C1)OC)NC[C@@H](C2=C3C(=CC(=C2)O)NC(=O)CO3)O',
      chemicalFormula: 'C21H26N2O5',
      molecularWeight:
        '386.40 g/mol as the free base; dispensed as the hydrochloride at 422.9 g/mol, with a salt-to-base conversion factor of 1.094',
      targetReceptorAffinity:
        'A single-enantiomer benzoxazinone beta-2 agonist. The label reports 241-fold greater agonist activity at beta-2 than at beta-1 adrenoceptors and 2,299-fold greater than at beta-3 in vitro, and states in the same paragraph that the clinical significance of these findings is unknown. It also notes that beta-2 adrenoceptors are present on lung epithelial and endothelial cells and in the heart, that their precise cardiac function is not known, and that their presence raises the possibility that even highly selective beta-2 agonists may have cardiac effects.',
      structureSource: {
        label:
          'PubChem CID 11504295 (olodaterol) — canonical SMILES, molecular formula and weight, as carried on the enriched record; salt form, molecular weights and receptor selectivity from the STRIVERDI RESPIMAT prescribing information, sections 11 and 12.1',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11504295',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'olo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the (R) configuration and quantify the distomer',
          description:
            'Olodaterol is a single enantiomer with the (R) configuration at the benzylic hydroxyl, the stereocentre that every catecholamine-like beta agonist depends on. The (S) enantiomer is not merely inactive: for this class the wrong enantiomer is the one most associated with off-target activity, so it is controlled as a named impurity rather than absorbed into the assay.',
          reagentsAndBuffer:
            'Olodaterol hydrochloride reference standard, chiral HPLC on a polysaccharide phase, optical rotation, LC-MS for the benzoxazinone core, Karl Fischer titration, ion chromatography for chloride content',
        },
        {
          id: 'olo-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Open a chiral epoxide with the methoxyphenyl tert-alkylamine',
          description:
            'The molecule is a 6-hydroxy-benzoxazin-3-one bearing an (R)-1-hydroxy-2-aminoethyl side chain, with the nitrogen carrying a 2-(4-methoxyphenyl)-1,1-dimethylethyl group. The bond that sets the stereochemistry is formed by regioselective opening of a chiral epoxide by that hindered tertiary-carbon amine, which is slow precisely because the amine is hindered — and the hindrance is what gives the molecule its long receptor residence.',
          dependsOnStepId: 'olo-w1',
          reagentsAndBuffer:
            'Protected benzoxazinone epoxide of defined configuration, 2-(4-methoxyphenyl)-1,1-dimethylethylamine, elevated-temperature aminolysis in a protic solvent, hydrogenolytic deprotection over palladium on carbon, hydrogen chloride for salt formation',
        },
        {
          id: 'olo-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the hydrochloride and control for a sterile aqueous solution',
          description:
            'Form and crystallise the hydrochloride, then prepare a sterile aqueous solution rather than a micronised powder — the Respimat is a solution device, so particle size is not a release attribute and sterility, benzalkonium chloride content and pH are. A soft-mist inhaler with a 4.5 mL reservoir dispensed over weeks is a multi-dose sterile product, which is a preservation problem an ordinary metered-dose inhaler does not have.',
          dependsOnStepId: 'olo-w2',
          reagentsAndBuffer:
            'Crystallisation from an alcohol-water system, anhydrous citric acid, benzalkonium chloride, edetate disodium, water for injection, sterile filtration and aseptic filling into the 4.5 mL cartridge',
        },
        {
          id: 'olo-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure beta-1 and beta-3 activity, not only beta-2 potency',
          description:
            'The label’s selectivity claim is a ratio: 241-fold over beta-1 and 2,299-fold over beta-3. A ratio requires measuring the denominator, and the denominator is the one that matters clinically, because beta-1 activity is what produces tachycardia. Each receptor must be run as a separate functional assay in a cell expressing only that subtype, at concentrations a 5 microgram inhaled dose actually reaches.',
          dependsOnStepId: 'olo-w3',
          reagentsAndBuffer:
            'CHO or HEK293 lines separately expressing human ADRB1, ADRB2 and ADRB3, cyclic AMP accumulation readout, isoprenaline as the full-agonist reference for intrinsic activity, concentration range anchored to measured plasma levels',
        },
        {
          id: 'olo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Track potassium, glucose and heart rate as the systemic readout',
          description:
            'The predictable harms of an inhaled beta-2 agonist are systemic beta activation: tremor, cramp, insomnia, tachycardia, falling serum potassium and rising plasma glucose. The label reports these were evaluated in pooled phase 3 COPD data. They are the measurable expression of the fraction of drug that leaves the lung, and they are a more sensitive systemic assay than any adverse-event count.',
          dependsOnStepId: 'olo-w4',
          reagentsAndBuffer:
            'Serial serum potassium and plasma glucose, continuous or serial ECG for heart rate and QT interval, pooled analysis across the phase 3 programme at the recommended dose and above',
        },
      ],
    },
    keyAudits: [
      {
        id: 'olo-a1',
        category: 'inferred',
        title: 'Approved on lung function curves, with no exacerbation endpoint anywhere',
        laymanSummary:
          'Eight trials in 3,533 COPD patients supported approval, and every one of them measured how much air you can blow out. None measured flare-ups, hospital admissions or death.',
        technicalDetails:
          'The registration programme comprised three COPD dose-ranging trials, four asthma dose-ranging trials and eight confirmatory COPD trials in 3,533 patients: two replicate 48-week placebo-controlled trials, two replicate 48-week placebo- and formoterol-controlled trials, and four 6-week cross-over trials against placebo and either formoterol or tiotropium. In all four 48-week trials the primary efficacy endpoints were change from baseline in FEV1 area under the curve over 0 to 3 hours and trough pre-dose FEV1. Both are spirometric surrogates measured on a single day. A bronchodilatory effect was seen 5 minutes after the first dose, with a mean FEV1 increase over placebo of 0.11 L. Nothing in the programme measured exacerbation rate, hospitalisation or mortality, and the indication is written accordingly: maintenance bronchodilator treatment of airflow obstruction. The inference the reader supplies is that better spirometry means a better course of disease. In COPD that inference has repeatedly failed, and this drug’s own combination trial is the clearest example.',
        evidenceSource:
          'STRIVERDI RESPIMAT (olodaterol) United States prescribing information, Clinical Studies section 14 and Indications and Usage section 1 (NDA 203108)',
        inferredClaim:
          'That improving FEV1 area under the curve and trough FEV1 changes the course of COPD — the endpoint the drug was approved on, standing in for the outcomes nobody measured',
        auditFlag: 'caution',
      },
      {
        id: 'olo-a2',
        category: 'failed',
        title: 'DYNAGITO: 7,880 patients, and the exacerbation result missed its own threshold',
        laymanSummary:
          'The one large trial asking whether adding olodaterol to tiotropium prevents flare-ups enrolled nearly eight thousand people. The rate fell by 7%, with a p value of 0.0498 against a target the trial itself had set at 0.01. It missed.',
        technicalDetails:
          'DYNAGITO was a 52-week, double-blind, randomised, parallel-group, active-controlled trial that screened 9,009 patients at 818 centres in 51 countries and randomised 7,880 with COPD and a history of exacerbations 1:1 to tiotropium-olodaterol 5/5 micrograms or tiotropium 5 micrograms once daily, with inhaled corticosteroids continued where already used. Mean age was 66.4 years and mean FEV1 44.5% predicted. The primary endpoint, the rate of moderate and severe COPD exacerbations, gave a rate ratio of 0.93 (99% CI 0.85 to 1.02, p=0.0498) — the trial had pre-specified a 0.01 significance level, and the result did not meet it. The published interpretation states that combining tiotropium and olodaterol did not reduce the exacerbation rate as much as expected compared with tiotropium alone. This matters beyond the combination product: it is the only adequately powered test of whether the lung function gains this molecule produces translate into fewer exacerbations, and the answer, on 7,880 patients, was not clearly yes.',
        evidenceSource:
          'Calverley PMA, Anzueto AR, Carter K, et al. Tiotropium and olodaterol in the prevention of chronic obstructive pulmonary disease exacerbations (DYNAGITO): a double-blind, randomised, parallel-group, active-controlled trial. Lancet Respir Med 2018;6:337-344, NCT02296138',
        doi: '10.1016/S2213-2600(18)30102-4',
        measuredMetric:
          'Rate of moderate and severe COPD exacerbations over 52 weeks, tiotropium-olodaterol against tiotropium alone',
        auditFlag: 'caution',
      },
      {
        id: 'olo-a3',
        category: 'failed',
        title: 'Four dose-ranging trials in asthma, for a drug the label forbids in asthma',
        laymanSummary:
          'The development programme included four randomised placebo-controlled dose-ranging trials in people with asthma. The label states the drug is not indicated for asthma and that its safety and effectiveness there have not been established.',
        technicalDetails:
          'The Clinical Studies section records: "Four randomized, double-blind, placebo-controlled dose-ranging trials were performed in patients with asthma, evaluating doses from 2 to 20 mcg. Results from patients with asthma were consistent with results from dose-ranging trials in patients with COPD. STRIVERDI RESPIMAT is not indicated for asthma." Section 1.2 states the safety and effectiveness in asthma have not been established, and section 5.1 sets out the class position: long-acting beta-2 agonist monotherapy without an inhaled corticosteroid in asthma is associated with an increased risk of asthma-related death, considered a class effect including this drug. So the programme generated asthma efficacy data, the label reports that the data were consistent with COPD, and the same label states effectiveness in asthma has not been established. Both statements are defensible — dose-ranging pharmacodynamics is not efficacy — and printing them four sentences apart is a fair example of how a development history and a licence can describe the same drug differently.',
        evidenceSource:
          'STRIVERDI RESPIMAT (olodaterol) United States prescribing information, Clinical Studies section 14, Indications and Usage 1.2 and Warnings and Precautions 5.1 (NDA 203108)',
        measuredMetric:
          'Asthma dose-ranging trials conducted against the licensed indication and the stated limitations of use',
        auditFlag: 'caution',
      },
      {
        id: 'olo-a4',
        category: 'measured',
        title: 'The class death signal is on the label, measured in a different drug',
        laymanSummary:
          'The warning about long-acting beta-agonists killing asthma patients comes from a trial of salmeterol: 13 asthma deaths in 13,176 patients against 3 in 13,179 on placebo. The label applies that as a class effect to olodaterol and says no study has been done to check whether it is true of this molecule.',
        technicalDetails:
          'Section 5.1 reports the Salmeterol Multicenter Asthma Research Trial result directly: a 28-week placebo-controlled United States study comparing salmeterol with placebo, each added to usual asthma therapy, showed an increase in asthma-related deaths, 13 of 13,176 against 3 of 13,179, relative risk 4.37 (95% CI 1.25 to 15.34). The label states the increased risk of asthma-related death is considered a class effect of long-acting beta-2 agonists including olodaterol, and then: "No study adequate to determine whether the rate of asthma-related death is increased in patients treated with STRIVERDI RESPIMAT has been conducted." It also records that when long-acting beta-agonists are used in fixed-dose combination with an inhaled corticosteroid, large clinical trials do not show a significant increase in serious asthma-related events compared with the steroid alone — the finding that led the FDA to remove the boxed warning from combination products — and that available data do not suggest an increased risk of death with these drugs in COPD. Three separate evidentiary positions in one section, applied to one molecule, none of them generated by that molecule.',
        evidenceSource:
          'STRIVERDI RESPIMAT (olodaterol) United States prescribing information, Warnings and Precautions section 5.1 (NDA 203108)',
        measuredMetric:
          'Asthma-related deaths on salmeterol against placebo in a 26,355-patient safety trial, applied as a class effect',
        auditFlag: 'caution',
      },
      {
        id: 'olo-a5',
        category: 'failed',
        title: 'The higher dose does nothing extra, and the label prints it in a parenthesis',
        laymanSummary:
          'Two strengths were carried through the confirmatory programme. The label reports that the 10 microgram dose showed no additional benefit over 5 micrograms, and adds "data not shown".',
        technicalDetails:
          'The confirmatory programme randomised 1,281 patients to the 5 microgram dose and 1,284 to the 10 microgram dose. The Clinical Studies section states: "The 10 mcg dose demonstrated no additional benefit over the 5 mcg dose (data not shown)." The 4-week dose-ranging trial in 405 patients had already found no added benefit of 20 micrograms over 10, and the cross-over dose-regimen trial in 47 patients found no clear difference between twice-daily and once-daily administration. A flat dose-response across a fourfold range usually indicates the receptor is saturated at the lowest dose tested, which is a legitimate finding and an argument for the lowest dose. What is notable is the disclosure: roughly 1,284 patients were randomised to a dose whose comparative results are summarised in seven words and a parenthesis on the approved label.',
        evidenceSource:
          'STRIVERDI RESPIMAT (olodaterol) United States prescribing information, Clinical Studies section 14 (NDA 203108)',
        measuredMetric:
          'FEV1 endpoints at 10 micrograms against 5 micrograms across the confirmatory programme',
        auditFlag: 'caution',
      },
      {
        id: 'olo-a6',
        category: 'inferred',
        title:
          'A 241-fold selectivity ratio of unknown clinical significance, on a receptor that is also in the heart',
        laymanSummary:
          'Olodaterol is described as highly selective for the lung receptor over the heart receptor — 241 times. The label states the clinical significance is unknown, and notes that the lung receptor is also present in the heart and nobody knows what it does there.',
        technicalDetails:
          'Section 12.1 reports that in vitro olodaterol has 241-fold greater agonist activity at beta-2 adrenoceptors than at beta-1 and 2,299-fold greater than at beta-3, and states directly that the clinical significance of these findings is unknown. It then adds that although beta-2 is the predominant adrenergic receptor in airway smooth muscle, it is also present on lung epithelial and endothelial cells and in the heart, that "the precise function of beta-2 receptors in the heart is not known", and that their presence "raises the possibility that even highly selective beta-2 agonists may have cardiac effects." Section 5.3 warns that excessive use, or use with another long-acting beta-agonist, can produce clinically significant cardiovascular effects and may be fatal. The selectivity ratio is a real in vitro measurement and it is being used to support a safety conclusion the label declines to draw twice in the same paragraph.',
        evidenceSource:
          'STRIVERDI RESPIMAT (olodaterol) United States prescribing information, Clinical Pharmacology section 12.1 and Warnings and Precautions 5.3 (NDA 203108)',
        inferredClaim:
          'That 241-fold beta-2 selectivity means the drug spares the heart — an in vitro ratio the label twice declines to translate into a clinical statement',
        auditFlag: 'contested',
      },
      {
        id: 'olo-a7',
        category: 'measured',
        title: 'What it does do: about a tenth of a litre, within five minutes',
        laymanSummary:
          'Five minutes after the first dose, lung function was 0.11 litres higher than placebo, and the improvement in the three-hour lung function curve held across all four year-long trials.',
        technicalDetails:
          'In the four 48-week confirmatory trials, olodaterol 5 micrograms produced significant improvements in FEV1 area under the curve over 0 to 3 hours against placebo at both week 12 and week 24, and significant improvements in trough FEV1 against placebo at week 12 in three of the four trials and at week 24 in all four. A bronchodilatory effect was present 5 minutes after the first dose, with a mean FEV1 increase over placebo of 0.11 L (range 0.10 to 0.12 L). Patients on the 5 microgram dose used less rescue albuterol than placebo. The dose-ranging data are consistent: trough FEV1 differences from placebo of 0.07, 0.10, 0.11 and 0.12 L at 2, 5, 10 and 20 micrograms in a 36-patient cross-over trial. This is a genuine, reproducible bronchodilator effect of the size the class produces. It is also the entire measured benefit of the molecule.',
        evidenceSource:
          'STRIVERDI RESPIMAT (olodaterol) United States prescribing information, Clinical Studies section 14 (NDA 203108)',
        measuredMetric:
          'FEV1 area under the curve 0 to 3 hours, trough FEV1, and FEV1 at 5 minutes after first dose, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'olo-a8',
        category: 'inferred',
        title: 'Twelve years on, one brand product, priced by the gram',
        laymanSummary:
          'The CMS acquisition survey lists exactly one olodaterol product and it is a brand entry, at about sixty-six dollars a gram, for a molecule approved in 2014.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost survey effective 19 August 2026 lists a single olodaterol product, classified as brand, at US$65.95 per gram. Generic entry for an orally inhaled product is not governed by patent expiry alone: a generic must demonstrate equivalent regional deposition in the lung rather than an equivalent plasma concentration curve, and the Respimat soft-mist inhaler is a mechanical device with its own patent estate that a generic cannot simply copy. The consequence is that a bronchodilator whose measured benefit is 0.11 L of FEV1, and which missed the exacerbation endpoint in its own combination trial, remains at branded pricing more than a decade after approval. The clinical claim and the price claim are separable, and only one of them is supported by the trial programme.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost survey, olodaterol, one listed brand product, effective 19 August 2026; FDA Drugs@FDA record for NDA 203108',
        inferredClaim:
          'That the bronchodilation measured justifies a branded price twelve years after approval — an inference the exacerbation evidence does not support and the pricing record makes visible',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A soft mist, two puffs, once a day',
        laymanDesc:
          'The Respimat is not a propellant inhaler. A spring drives the liquid through a fine nozzle, making a slow cloud that is easier to breathe in. Two actuations make one daily dose.',
        molecularDetail:
          'A sterile aqueous solution of olodaterol hydrochloride in a 4.5 mL cartridge with anhydrous citric acid, benzalkonium chloride and edetate disodium. Each dose is two actuations delivering 5 micrograms of olodaterol, equivalent to 5.473 micrograms of the hydrochloride, in 22.1 microlitres from the mouthpiece. Priming is required before first use and after 3 or 21 days unused.',
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It switches on the receptor in airway muscle',
        laymanDesc:
          'The drug binds the beta-2 receptor sitting on the muscle wrapped around your airways, and switches it on rather than blocking it.',
        molecularDetail:
          'Agonism at the beta-2 adrenoceptor after topical administration by inhalation, with 241-fold greater agonist activity than at beta-1 and 2,299-fold greater than at beta-3 in vitro. The label states the clinical significance of these ratios is unknown.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Cyclic AMP rises inside the muscle cell',
        laymanDesc:
          'Switching on the receptor turns up an internal messenger, and that messenger is what tells the muscle to relax.',
        molecularDetail:
          'Receptor activation stimulates adenyl cyclase, raising intracellular cyclic 3′,5′-adenosine monophosphate. Elevated cyclic AMP produces bronchodilation by relaxation of airway smooth muscle cells.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The airway widens within five minutes and stays open for a day',
        laymanDesc:
          'The effect is measurable five minutes after the first dose and lasts long enough for once-daily use — the property that distinguishes it from twice-daily versions.',
        molecularDetail:
          'Mean FEV1 increase over placebo of 0.11 L at 5 minutes after first dose (range 0.10 to 0.12 L). The hindered tertiary-carbon amine on the side chain is what gives the molecule its long receptor residence time and therefore its 24-hour duration. Twice-daily dosing showed no clear advantage over once-daily in a dedicated cross-over trial.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Spirometry improves. That is the whole registration endpoint.',
        laymanDesc:
          'In four year-long trials the three-hour lung function curve and the trough measurement both improved against placebo, and people used less rescue inhaler. No trial measured flare-ups.',
        molecularDetail:
          'Primary endpoints in all four 48-week confirmatory trials were change from baseline in FEV1 AUC 0-3 hours and trough FEV1, at week 12 or 24. Significant against placebo for AUC at both timepoints in all four trials, and for trough FEV1 in three of four at week 12 and all four at week 24. The 10 microgram dose showed no additional benefit over 5 micrograms.',
        iconName: 'BarChart',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'And the flare-up question, asked once, was not clearly answered',
        laymanDesc:
          'Added to tiotropium in 7,880 patients, exacerbations fell 7% with a p value of 0.0498 against a target of 0.01. The trial reported that the combination did not reduce exacerbations as much as expected.',
        molecularDetail:
          'DYNAGITO: rate ratio 0.93 (99% CI 0.85 to 1.02, p=0.0498) against a pre-specified 0.01 significance level, over 52 weeks in patients with mean FEV1 44.5% predicted. Adverse event rates were similar between treatments.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DYNAGITO (NCT02296138)',
        phase: 'Phase 3, 52-week, double-blind, randomised, parallel-group, active-controlled',
        sampleSize: 7880,
        primaryEndpoint:
          'Rate of moderate and severe COPD exacerbations from first dose until one day after last administration, tiotropium-olodaterol 5/5 micrograms against tiotropium 5 micrograms once daily',
        endpointMet: false,
        statisticalPValue:
          'Rate ratio 0.93 (99% CI 0.85 to 1.02), p=0.0498 against a pre-specified 0.01 significance level — not met',
        unreportedAdverseSignals:
          'The published interpretation states the combination did not reduce the exacerbation rate as much as expected compared with tiotropium alone. Adverse event proportions were similar between treatments. 9,009 patients were screened to randomise 7,880.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'STRIVERDI RESPIMAT confirmatory programme — four 48-week and four 6-week trials (NDA 203108)',
        phase:
          'Phase 3, randomised, double-blind, placebo- and active-controlled, parallel-group and cross-over',
        sampleSize: 3533,
        primaryEndpoint:
          'Change from pre-treatment baseline in FEV1 area under the curve 0 to 3 hours and trough pre-dose FEV1, at week 12 or 24',
        endpointMet: true,
        statisticalPValue:
          'Significant improvement against placebo in FEV1 AUC 0-3 hours at weeks 12 and 24 in all four 48-week trials; trough FEV1 significant in three of four trials at week 12 and all four at week 24; FEV1 0.11 L above placebo at 5 minutes after first dose',
        unreportedAdverseSignals:
          'No exacerbation, hospitalisation or mortality endpoint appears anywhere in the programme. The 10 microgram dose, given to 1,284 randomised patients, "demonstrated no additional benefit over the 5 mcg dose (data not shown)".',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'COPD dose-ranging cross-over trial (NDA 203108)',
        phase: 'Randomised, double-blind, placebo-controlled, single-dose, five-way cross-over',
        sampleSize: 36,
        primaryEndpoint:
          'Difference in trough FEV1 from placebo across doses of 2, 5, 10 and 20 micrograms',
        endpointMet: true,
        statisticalPValue:
          '0.07 L (95% CI 0.03 to 0.11), 0.10 L (0.06 to 0.14), 0.11 L (0.07 to 0.15) and 0.12 L (0.08 to 0.16) at 2, 5, 10 and 20 micrograms respectively',
        unreportedAdverseSignals:
          'The dose-response curve is essentially flat above 5 micrograms, and a separate 405-patient trial found no added benefit of 20 micrograms over 10. A 47-patient cross-over trial found no clear difference between twice-daily and once-daily dosing.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'FEV1 0.11 L above placebo 5 minutes after the first dose, and significant FEV1 AUC 0-3 hour improvement against placebo at weeks 12 and 24 in all four 48-week trials',
        'Trough FEV1 differences from placebo of 0.07 to 0.12 L across a 2 to 20 microgram dose range',
        'No additional benefit of 10 micrograms over 5 micrograms across the confirmatory programme',
        'Exacerbation rate ratio 0.93 (99% CI 0.85 to 1.02, p=0.0498) for tiotropium-olodaterol against tiotropium in 7,880 patients, missing the pre-specified 0.01 threshold',
        'Reduced rescue albuterol use on the 5 microgram dose against placebo',
      ],
      unsupportedInferences: [
        'That improving FEV1 area under the curve changes the course of COPD, when no exacerbation, hospitalisation or mortality endpoint exists in the registration programme',
        'That 241-fold beta-2 selectivity spares the heart, a ratio the label twice declines to translate into a clinical statement',
        'That the asthma dose-ranging data mean anything for asthma treatment, when the label states effectiveness in asthma has not been established and the class carries a death signal in that disease',
        'That the branded price twelve years after approval reflects the measured benefit',
      ],
      whatFailedInitially: [
        'DYNAGITO missed its pre-specified 0.01 significance level on exacerbations in 7,880 patients',
        'The 10 microgram dose showed no benefit over 5 micrograms and its data were not shown',
        'Twice-daily dosing showed no clear advantage over once-daily in a dedicated cross-over trial',
        'No study adequate to determine whether asthma-related death is increased with this molecule has ever been conducted',
      ],
      realWorldOutcome: [
        'STRIVERDI RESPIMAT approved 31 July 2014 under NDA 203108 and STIOLTO RESPIMAT, the tiotropium combination, on 21 May 2015 under NDA 206756',
        'Prescribed almost entirely as the combination rather than as monotherapy, which is where the missed exacerbation endpoint sits',
        'One product listed in the CMS acquisition cost survey, as a brand entry at US$65.95 per gram',
        'No inhaled corticosteroid combination exists for this molecule, so patients needing one move to a different beta-agonist',
      ],
    },
    deliverySystem: {
      type: 'Respimat soft-mist inhaler, two actuations delivering 5 micrograms of olodaterol once daily at the same time each day, with a maximum of two inhalations in 24 hours',
      description:
        'A hand-held mechanical device that uses spring energy rather than a propellant to force a metered volume of aqueous solution through a fine nozzle, producing a slow-moving aerosol cloud that is easier to inhale in coordination than a pressurised spray. Each cartridge holds a minimum of 4 grams of sterile aqueous solution. Priming is required before first use, once after 3 days unused, and in full after 21 days unused. No dose adjustment is needed for age, renal impairment or mild to moderate hepatic impairment; no data exist for severe hepatic impairment.',
      safetyProfile:
        'Not indicated for asthma, and not for acute deteriorations of COPD or relief of acute bronchospasm — the label states use in acutely deteriorating COPD is inappropriate. Section 5.1 records that long-acting beta-2 agonist monotherapy in asthma is associated with increased asthma-related death as a class effect including this drug, citing 13 deaths in 13,176 salmeterol patients against 3 in 13,179 on placebo (RR 4.37, 95% CI 1.25 to 15.34), and states no adequate study of this question has been conducted for olodaterol. Available data do not suggest increased mortality with long-acting beta-agonists in COPD. Exceeding the recommended dose, or combining it with another long-acting beta-agonist, can produce clinically significant cardiovascular effects and may be fatal. Life-threatening paradoxical bronchospasm can occur and requires immediate discontinuation. Use with caution in cardiovascular or convulsive disorders, thyrotoxicosis and sensitivity to sympathomimetics. Predictable systemic beta effects include tremor, cramps, insomnia, tachycardia, falling serum potassium and rising plasma glucose.',
    },
    commonQuestions: [
      {
        q: 'Will this stop me having flare-ups?',
        a: 'That was never tested for olodaterol on its own, and when it was tested in combination it missed. Every trial that supported approval measured lung function — how much air you can blow out in one second, at various points after a dose. Not one measured flare-ups, hospital admissions or death. The single large trial that asked the question, DYNAGITO, added olodaterol to tiotropium in 7,880 people for a year: exacerbations fell about 7%, with a p value of 0.0498 against a threshold the trial had set at 0.01. The authors wrote that the combination did not reduce exacerbations as much as expected. What this inhaler reliably does is make breathing easier day to day, by roughly a tenth of a litre of measured lung function.',
        auditNote:
          'A p value of 0.0498 looks significant by the conventional 0.05 rule and was not, because this trial had pre-specified a stricter threshold. Which threshold applies is decided before the data arrive, not after.',
      },
      {
        q: 'Why does it say not to use it for asthma?',
        a: 'Because of a class safety finding, and the label sets it out plainly. A 28-week United States trial compared salmeterol, another long-acting beta-agonist, with placebo added to usual asthma therapy in over 26,000 people, and found 13 asthma-related deaths on salmeterol against 3 on placebo — a relative risk of 4.37. The FDA treats this as a class effect of using a long-acting beta-agonist alone in asthma, and the label says no study adequate to check whether olodaterol shares it has ever been done. In fixed combination with an inhaled steroid the risk did not appear in large trials, which is why combination inhalers no longer carry a boxed warning — but olodaterol has no steroid combination. In COPD, the label states available data do not suggest increased mortality.',
      },
      {
        q: 'Would a higher dose work better?',
        a: 'No, and this is one of the clearer answers on the label. Two strengths went through the confirmatory programme, with 1,284 patients randomised to 10 micrograms, and the label reports that the 10 microgram dose demonstrated no additional benefit over 5 micrograms. Earlier, a 405-patient trial found no added benefit of 20 micrograms over 10, and a cross-over trial found no clear difference between twice-daily and once-daily dosing. A dose-response curve that flattens out this early usually means the receptor is fully occupied at the lowest dose tested, which is a good reason to stay at 5 micrograms and a reason to be sceptical of any suggestion that more will help.',
      },
      {
        q: 'What is the difference between this and the reliever inhaler?',
        a: 'Duration and purpose. A reliever such as salbutamol works within minutes and wears off in hours, and you take it when you need it. Olodaterol also starts within about five minutes — the label measured 0.11 litres of improvement at five minutes — but it lasts a full day and is taken on a schedule whether you feel breathless or not. The label is explicit that it must not be used for acute symptoms and must not be started in someone whose COPD is acutely deteriorating, calling that use inappropriate. And it warns that exceeding the dose, or taking a second product containing a long-acting beta-agonist alongside it, can cause serious cardiovascular effects and may be fatal. That last one is a real risk when two inhalers are prescribed by different people.',
      },
      {
        q: 'Why is a 2014 drug still this expensive?',
        a: 'Inhalers do not go generic the way tablets do. To approve a generic tablet you show the drug reaches the blood in the same pattern. To approve a generic inhaler you have to show it deposits in the same regions of the lung, which is far harder to demonstrate, and the device itself is patented separately from the molecule — the Respimat is a mechanical spring-driven sprayer, not a standard propellant canister. The CMS acquisition survey lists exactly one olodaterol product and classifies it as brand, at about sixty-six US dollars per gram, twelve years after approval. That is the pricing consequence of a device patent estate, not of the chemistry.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Calverley PMA, Anzueto AR, Carter K, et al. Tiotropium and olodaterol in the prevention of chronic obstructive pulmonary disease exacerbations (DYNAGITO): a double-blind, randomised, parallel-group, active-controlled trial. Lancet Respir Med 2018;6:337-344',
        identifier: '10.1016/S2213-2600(18)30102-4',
        kind: 'doi',
      },
      {
        label: 'DYNAGITO — tiotropium plus olodaterol against tiotropium for COPD exacerbations',
        identifier: 'NCT02296138',
        kind: 'nct',
      },
      {
        label:
          'STRIVERDI RESPIMAT (olodaterol) inhalation spray United States prescribing information — Indications and Usage 1.1 and 1.2, Dosage and Administration 2, Warnings and Precautions 5.1 to 5.6, Description 11, Clinical Pharmacology 12.1 and 12.2, Clinical Studies 14 (NDA 203108)',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22STRIVERDI+RESPIMAT%22',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Drugs@FDA — STRIVERDI RESPIMAT, NDA 203108, Boehringer Ingelheim, approved 31 July 2014; STIOLTO RESPIMAT, NDA 206756, approved 21 May 2015',
        identifier:
          'https://api.fda.gov/drug/drugsfda.json?search=products.brand_name:%22STRIVERDI+RESPIMAT%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — olodaterol, one listed brand product, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 11504295 — olodaterol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11504295',
        kind: 'url',
      },
    ],
  },
]
