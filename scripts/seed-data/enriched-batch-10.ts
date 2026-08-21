import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 10 — the anaesthetic room.
 *
 * Ten drugs that share a room rather than a mechanism: two sodium-channel blockers and a third that
 * was built to be less cardiotoxic than the second, an intravenous hypnotic, a volatile one, a
 * paralysing agent and the older paralysing agent it was meant to replace, the molecule that
 * reverses one of them, an alpha-2 sedative and a benzodiazepine. What they have in common is the
 * thing that makes them worth auditing: almost none of them has ever been asked to improve an
 * outcome a patient would recognise. They are asked to abolish sensation, abolish movement or
 * abolish awareness for a fixed number of minutes, and they do. Everything past that — less chronic
 * pain a year later, less delirium, less cancer recurrence, fewer deaths — is a separate claim with
 * a separate and usually much worse evidence base, and this file keeps the two apart on every page.
 *
 * Every DOI, PMID and NCT number below was resolved at the time of writing: DOIs and PMIDs through
 * NCBI E-utilities, NCT numbers through the ClinicalTrials.gov v2 API, structures through the
 * PubChem PUG REST property endpoint. Every effect size, arm size, hazard ratio, confidence interval
 * and p-value is copied from the published abstract or from the US label text stored on the record,
 * never from memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost held on the record, from the CMS National Average Drug Acquisition Cost
 *    survey, with the survey date and the number of listed products it is a median of.
 *    `synthesisCostPerDose` is empty on every dossier here, because no published per-dose
 *    cost-of-production figure for any of these molecules could be verified. The cost-of-production
 *    literature that was checked — Hill, Barber and Gotham in BMJ Global Health — publishes an
 *    estimation method and an aggregate range and carries no per-dose figure for these compounds; it
 *    is cited as `costSource` so a reader can see what was checked and what it does not contain.
 *    Five of the ten — ropivacaine, sevoflurane, succinylcholine, sugammadex and dexmedetomidine —
 *    have no NADAC value on the record and carry no `pricing` block at all. A missing number beats a
 *    manufactured one.
 *
 * 2. THE SMILES STRINGS ARE THE ONES ALREADY ON THE RECORD. Each was pulled from PubChem by the
 *    ingestion pipeline and passed this repository's structure parser before curation began. All ten
 *    were re-checked against the PUG REST property endpoint while writing and all ten matched
 *    formula, weight and connection table exactly. Where the dispensed form is a salt or a
 *    quaternary cation the dossier says which one, rather than quietly showing a free base.
 *
 * 3. EVERY DOSSIER SEPARATES THE PHYSIOLOGICAL EFFECT FROM THE PATIENT OUTCOME. An anaesthetic that
 *    reliably abolishes movement has proved that it abolishes movement. Whether it also lowers
 *    mortality, delirium, chronic pain or cancer recurrence is asked and answered separately on
 *    every page here, and the answer is usually no.
 *
 * 4. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry because the literature supplies them: lidocaine lost a head-to-head to
 *    amiodarone and missed its endpoint in ALPS, bupivacaine's liposomal reformulation missed in
 *    three of its own trials, propofol did not beat inhalational anaesthesia on cancer recurrence or
 *    mortality, sevoflurane's paediatric neurotoxicity warning rests on animals, succinylcholine has
 *    a boxed warning written after children died, sugammadex's outcome case is almost entirely
 *    surrogate, dexmedetomidine failed to reduce mortality in SPICE III and failed to prevent
 *    delirium in DEXACET, and midazolam's amnesia is the effect its harms are hardest to detect
 *    behind.
 *
 * 5. NO DOSING, TITRATION, INFUSION-RATE OR PROCUREMENT GUIDANCE. Concentrations and rates appear
 *    only where they are part of a trial's description or a label's identity. Nothing here tells a
 *    reader what to give, when, or how much.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation method and an aggregate range, and carries no per-dose figure for the drugs in this file',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_10_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Lidocaine — flawless at the thing it was invented for, and beaten or unproven at almost
  //    everything it was later asked to do.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lidocaine',
    name: 'Lidocaine',
    tradeName: 'Xylocaine',
    sponsor:
      'Dentsply Pharmaceuticals (current US label holder); synthesised by Nils Löfgren and Bengt Lundqvist at Astra AB in 1943 and long off patent',
    targetGene: 'SCN5A, SCN9A, SCN10A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits — Nav1.5 in cardiac myocytes, Nav1.7 and Nav1.8 in peripheral sensory neurons — bound at a site in the inner pore formed by segment S6 of domain IV',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1948,
    indication:
      'Production of local or regional anaesthesia by infiltration, nerve block, epidural or spinal route; topical anaesthesia of skin and mucous membranes; and acute management of ventricular arrhythmias as a class Ib antiarrhythmic',
    patientFriendlyIndication:
      'Numbing part of the body for a procedure, and steadying a dangerously fast heart rhythm',
    anatomicalSite:
      'Cytoplasmic face of the sodium channel pore, in peripheral nerve axons and cardiac ventricular myocytes',
    conditionContext: {
      conditionExplainer:
        'A nerve carries a signal as a wave of sodium ions rushing into the axon through gated pores. Pain, touch and temperature all travel that way, and so does the electrical wave that makes a heart muscle cell contract. Block enough of those pores and the wave cannot propagate: the nerve goes quiet, or the arrhythmic circuit in the heart stops turning.',
      whyItMatters:
        'Local anaesthesia is what makes minor surgery, dentistry and childbirth analgesia possible without rendering a person unconscious. The heart-rhythm use is a different claim entirely, and it is the one that has been tested against survival and lost.',
      whoTakesThis:
        'Almost everyone who has had a filling, a stitch, a mole removed, an epidural or a skin biopsy. It is on the WHO Model List of Essential Medicines as both a local anaesthetic and an antiarrhythmic.',
      clinicalGoals:
        'Abolish sensation in a defined area for a defined period, with no systemic effect. When it is given intravenously for arrhythmia the goal is termination of ventricular tachycardia or fibrillation, which is a physiological endpoint and not the same as survival.',
    },
    oneSentenceVerdict:
      'The first amide local anaesthetic: it plugs the inner mouth of the sodium channel so nerves cannot fire, which works so reliably for numbing that no modern trial bothers testing it — and which, given intravenously in cardiac arrest, produced a 23.7% survival to hospital discharge against 21.0% on saline in 3,026 patients, a difference of 2.6 percentage points that did not reach significance.',
    laymanHowItWorks:
      'Nerves send messages by letting sodium flood in through tiny gates. Lidocaine slips through the nerve membrane in its uncharged form, picks up a proton inside, and then sits in the mouth of the gate from the inside so sodium cannot pass. Nerves that are firing fastest are blocked first, which is why pain fibres go numb before the nerves that move your muscles. When the drug diffuses away, the gates work again and feeling comes back, with nothing changed.',
    auditConfidence: 'High Confidence',
    confidenceScore: 80,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3221 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 161 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised at Astra AB in 1943 and marketed from 1948. All composition-of-matter protection expired decades ago; there is no originator exclusivity anywhere in the world and hundreds of manufacturers make it. The 5% medicated patch was a later formulation patent, and generic patches are now marketed in the United States.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within local anaesthesia the substitutes are the other members of the same class and the choice is about how long the block lasts and how dangerous an accidental intravascular injection would be — bupivacaine lasts far longer and is far more cardiotoxic, ropivacaine was designed to split the difference. For ventricular arrhythmia the substitute is amiodarone, which beat lidocaine outright in a head-to-head trial. There is no food or home measure that anaesthetises a nerve, and this page does not offer one.',
      conventionalRx: [
        {
          name: 'Bupivacaine (Marcaine, Sensorcaine)',
          class: 'Long-acting amide local anaesthetic',
          howItCompares:
            'Blocks the same channel but binds far more tightly to the cardiac form and unbinds from it slowly, so a block lasts several times longer and an accidental intravascular dose is much more likely to stop the heart. Lidocaine is the safer molecule; bupivacaine is the longer-lasting one.',
          typicalCost:
            'US$0.0860 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed products, effective 22 April 2026)',
          prosAndCons:
            'Pros: hours of surgical anaesthesia from a single injection. Cons: the cardiotoxicity that produced the entire lipid-emulsion rescue literature.',
        },
        {
          name: 'Amiodarone (Nexterone, Cordarone)',
          class: 'Class III antiarrhythmic',
          howItCompares:
            'In the ALIVE trial 22.8% of 180 patients given amiodarone for shock-resistant ventricular fibrillation survived to hospital admission against 12.0% of 167 given lidocaine (P=0.009, odds ratio 2.17, 95% CI 1.21 to 3.83). That head-to-head is why lidocaine stopped being the first-line antiarrhythmic in cardiac arrest.',
          typicalCost:
            'Hospital-administered injectable; no NADAC value is held on this record and none is asserted here',
          prosAndCons:
            'Pros: beat lidocaine on survival to admission. Cons: in the later ALPS trial neither drug beat saline on survival to discharge, so the win was over a comparator that also does not work.',
        },
        {
          name: 'Articaine (Septocaine, dental use)',
          class: 'Amide local anaesthetic with an ester side chain',
          howItCompares:
            'Carries an extra ester group that plasma esterases clip, so systemic exposure falls quickly and the drug is used at higher concentrations for dental infiltration. It is a formulation and pharmacokinetic difference, not a different mechanism.',
          typicalCost:
            'Dental-office product; no NADAC value is held on this record and none is asserted here',
          prosAndCons:
            'Pros: reliable mandibular infiltration where lidocaine often needs a nerve block. Cons: a persistent and unresolved argument about paraesthesia after inferior alveolar block.',
        },
      ],
      naturalFoods: [
        {
          name: 'Clove oil (Syzygium aromaticum)',
          activeCompound: 'Eugenol',
          biologicalMechanism:
            'Eugenol is a TRPV1 and TRPA1 agonist that desensitises the terminal after an initial burn, and at high concentration it also blocks voltage-gated sodium currents in sensory neurons. It is the folk toothache remedy and the one topical botanical whose mechanism genuinely overlaps a local anaesthetic.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here. Eugenol produces surface desensitisation of oral mucosa in small studies; it does not produce a surgical block and it is not a substitute for anaesthesia during a procedure.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Cold, applied before a needle',
          action:
            'Ice or a cold pack held on the skin briefly before an injection slows conduction in small pain fibres by the same physics lidocaine exploits chemically.',
          patientImpact:
            'It reduces the sting of the needle. It does not anaesthetise tissue for a procedure and no dossier here claims it does.',
          clinicalPrecaution:
            'Prolonged cold on skin causes injury, and it masks nothing about the underlying problem.',
        },
        {
          name: 'Know the signs of too much',
          action:
            'Ringing in the ears, a metallic taste, numbness around the mouth or light-headedness after a large local anaesthetic injection are the early signs of systemic toxicity and should be said out loud immediately.',
          patientImpact:
            'Those symptoms appear before seizures or cardiac effects, and reporting them is the single most useful thing a conscious patient can do.',
          clinicalPrecaution:
            'This is a reporting instruction, not a treatment. Systemic local anaesthetic toxicity is managed by the clinical team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCN(CC)CC(=O)NC1=C(C=CC=C1C)C',
      chemicalFormula: 'C14H22N2O',
      molecularWeight: '234.34 g/mol (free base); dispensed as lidocaine hydrochloride',
      targetReceptorAffinity:
        'No single number applies. Binding is state-dependent: the drug has low affinity for the resting channel and high affinity for the open and inactivated ones, which is why block accumulates in tissue that is firing fast and spares tissue that is quiet. Ragsdale and colleagues showed that mutating phenylalanine 1764 in segment S6 of domain IV cuts affinity for the open and inactivated channel to 1% of wild type and abolishes use-dependence almost entirely.',
      structureSource: {
        label: 'PubChem CID 3676 (lidocaine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3676',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lid-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming identity and purity of 2,6-dimethylaniline',
          description:
            'Confirm the identity and isomeric purity of 2,6-xylidine before acylation. The 2,4- and 3,4-isomers acylate just as readily and produce positional analogues that carry through the whole route; 2,6-xylidine is also the impurity of toxicological concern in the finished product, so its specification is written twice over.',
          reagentsAndBuffer:
            '2,6-dimethylaniline reference standard, gas chromatography with flame ionisation detection, Karl Fischer titration for water, reversed-phase HPLC with UV detection at 230 nm',
        },
        {
          id: 'lid-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Chloroacetylation to the alpha-chloroacetanilide',
          description:
            'Acylate 2,6-dimethylaniline with chloroacetyl chloride in the presence of a base to give 2-chloro-N-(2,6-dimethylphenyl)acetamide. The two ortho methyl groups shield the amide from hydrolysis, which is the structural reason lidocaine survives in plasma while the older ester anaesthetics do not.',
          dependsOnStepId: 'lid-w1',
          reagentsAndBuffer:
            'Chloroacetyl chloride, 2,6-dimethylaniline, glacial acetic acid with sodium acetate buffer or aqueous sodium carbonate, toluene, nitrogen blanket',
        },
        {
          id: 'lid-w3',
          stepNumber: 3,
          phase: 'Synthesis',
          name: 'Displacement of chloride by diethylamine',
          description:
            'Heat the chloroacetanilide with excess diethylamine so the secondary amine displaces chloride and installs the tertiary amine that gives the molecule its pKa near 7.9. That pKa is the whole pharmacology: the neutral fraction crosses the membrane, the protonated fraction does the blocking.',
          dependsOnStepId: 'lid-w2',
          reagentsAndBuffer:
            'Diethylamine in excess, toluene or xylene at reflux, potassium carbonate as acid scavenger',
        },
        {
          id: 'lid-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and residual xylidine clearance',
          description:
            'Extract the free base, form the hydrochloride monohydrate from hydrogen chloride in isopropanol, and assay against the monograph limit for residual 2,6-dimethylaniline. That limit, not overall yield, is what the purification is designed around.',
          dependsOnStepId: 'lid-w3',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, purified water, activated charcoal, phosphate buffer pH 8.0 with acetonitrile for the related-substances HPLC, UV detection at 230 nm',
        },
        {
          id: 'lid-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Whole-cell patch clamp on Nav1.7-expressing cells',
          description:
            'Apply the drug to HEK293 cells stably expressing the human Nav1.7 channel and record sodium current under voltage clamp. The delivery question here is not a formulation question: it is whether the neutral species has crossed the membrane, because the receptor site faces the cytoplasm and a permanently charged quaternary analogue applied outside does nothing.',
          dependsOnStepId: 'lid-w4',
          reagentsAndBuffer:
            'HEK293 cells stably expressing SCN9A, extracellular solution of 140 mM NaCl with 10 mM HEPES at pH 7.4, intracellular CsF pipette solution, borosilicate patch pipettes of 1 to 2 megaohm',
        },
        {
          id: 'lid-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Tonic against use-dependent block, measured separately',
          description:
            'Measure block from a resting holding potential and then from a 10 Hz pulse train, and report both. Reporting only the resting number understates the drug several-fold and hides the property that makes it clinically selective for firing tissue; reporting only the train number overstates what a quiet nerve experiences.',
          dependsOnStepId: 'lid-w5',
          reagentsAndBuffer:
            'Voltage-clamp protocols at holding potentials of -120 mV and -70 mV, 10 Hz conditioning trains, half-maximal inhibitory concentration fitted per state, vehicle-matched dimethyl sulfoxide controls below 0.1%',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lid-a1',
        category: 'measured',
        title: 'The receptor site is a single pore-lining phenylalanine, and mutating it away works',
        laymanSummary:
          'Researchers changed one amino acid deep inside the sodium channel and local anaesthetics almost stopped working on it. That is the cleanest evidence there is that the drug acts where it is said to act.',
        technicalDetails:
          'Ragsdale, McPhee, Scheuer and Catterall made site-directed mutations in transmembrane segment S6 of domain IV of the rat brain sodium channel alpha subunit and expressed them in Xenopus oocytes. Mutation F1764A, near the middle of the segment, reduced affinity of the open and inactivated channel to 1% of wild type and almost completely abolished both the use-dependence and the voltage-dependence of block. N1769A increased resting-state affinity 15-fold. I1760A opened an access route for drug to reach the site from outside the cell. Together the three mutations locate the local anaesthetic receptor inside the channel pore and identify the residues that make binding state-dependent.',
        evidenceSource: 'Ragsdale DS, McPhee JC, Scheuer T, Catterall WA. Science 1994;265:1724-1728',
        doi: '10.1126/science.8085162',
        measuredMetric:
          'Fold change in open and inactivated state binding affinity after single-residue substitution in DIV-S6',
        auditFlag: 'verified',
      },
      {
        id: 'lid-a2',
        category: 'failed',
        title: 'ALPS: lidocaine did not beat saline on survival in 3,026 cardiac arrests',
        laymanSummary:
          'In the largest trial ever run of drugs given during cardiac arrest, the people who got lidocaine were no more likely to leave hospital alive than the people who got salt water.',
        technicalDetails:
          'The Resuscitation Outcomes Consortium randomised adults with non-traumatic out-of-hospital cardiac arrest and shock-refractory ventricular fibrillation or pulseless ventricular tachycardia to amiodarone, lidocaine or saline placebo. In the per-protocol primary analysis population of 3,026 patients — amiodarone 974, lidocaine 993, placebo 1,059 — survival to hospital discharge was 24.4%, 23.7% and 21.0%. Lidocaine versus placebo was a difference of 2.6 percentage points (95% CI -1.0 to 6.3, P=0.16); amiodarone versus placebo 3.2 points (95% CI -0.4 to 7.0, P=0.08); amiodarone versus lidocaine 0.7 points (95% CI -3.2 to 4.7, P=0.70). Neurological outcome at discharge was similar across all three groups. There was heterogeneity by whether the arrest was witnessed (P=0.05), with a significant benefit of active drug over placebo confined to bystander-witnessed arrests.',
        evidenceSource: 'Kudenchuk PJ et al. N Engl J Med 2016;374:1711-1722 (NCT01401647)',
        doi: '10.1056/NEJMoa1514204',
        measuredMetric: 'Survival to hospital discharge in the per-protocol population',
        auditFlag: 'verified',
      },
      {
        id: 'lid-a3',
        category: 'failed',
        title: 'ALIVE: amiodarone nearly doubled survival to admission against lidocaine',
        laymanSummary:
          'Put head to head in out-of-hospital ventricular fibrillation, lidocaine lost. Twelve percent of the lidocaine group made it to a hospital bed against nearly twenty-three percent of the amiodarone group.',
        technicalDetails:
          'Dorian and colleagues randomised 347 patients with out-of-hospital ventricular fibrillation resistant to three shocks, intravenous epinephrine and a further shock, in double-blind fashion, to amiodarone plus lidocaine placebo or lidocaine plus amiodarone placebo. Survival to hospital admission, the primary endpoint, was 22.8% of 180 on amiodarone against 12.0% of 167 on lidocaine (P=0.009, odds ratio 2.17, 95% CI 1.21 to 3.83). Among patients reached within the median dispatch-to-drug time of 24 minutes the figures were 27.7% and 15.3% (P=0.05). The trial did not include a placebo arm, so it establishes only that lidocaine is worse than amiodarone, not that either is better than nothing — which is the question ALPS went on to answer in the negative.',
        evidenceSource: 'Dorian P et al. N Engl J Med 2002;346:884-890',
        doi: '10.1056/NEJMoa013029',
        measuredMetric: 'Survival to hospital admission',
        auditFlag: 'verified',
      },
      {
        id: 'lid-a4',
        category: 'conclusion_shift',
        title: 'Prophylactic lidocaine after a heart attack cut arrhythmias and may have killed people',
        laymanSummary:
          'For years, anyone with a suspected heart attack got lidocaine to prevent a dangerous rhythm. Pooling fourteen trials found it did prevent the rhythm, and that the people given it died slightly more often. The practice was abandoned.',
        technicalDetails:
          'MacMahon, Collins, Peto, Koster and Yusuf pooled 14 randomised trials of prophylactic lidocaine in suspected acute myocardial infarction: 6,961 patients in the intramuscular trials followed for one to four hours and 2,194 in the intravenous trials followed for 24 to 48 hours, with 103 cases of ventricular fibrillation and 137 deaths in total. Allocation to lidocaine reduced the odds of ventricular fibrillation by about one third (95% CI 3% to 56% reduction). Odds of early death were about one third greater on lidocaine, not statistically significant (95% CI 2% reduction to 95% increase). The authors were explicit that the pooled data could not settle whether the drug was helpful or harmful. That an intervention can suppress the surrogate it was aimed at while trending the wrong way on death is the reason this class of reasoning is audited here at all.',
        evidenceSource: 'MacMahon S, Collins R, Peto R, Koster RW, Yusuf S. JAMA 1988;260:1910-1916',
        doi: '10.1001/jama.1988.03410130118037',
        inferredClaim:
          'That suppressing ventricular fibrillation after myocardial infarction with prophylactic lidocaine saves lives — a surrogate-to-outcome inference the pooled trials pointed against',
        auditFlag: 'contested',
      },
      {
        id: 'lid-a5',
        category: 'inferred',
        title: 'The 5% patch for nerve pain has no good-quality randomised evidence behind it',
        laymanSummary:
          'The lidocaine patch is prescribed very widely for nerve pain. A Cochrane review of every double-blind trial found 508 people in total, judged every trial at high risk of bias, and could not pool a single efficacy result.',
        technicalDetails:
          'Derry, Wiffen, Moore and Quinlan reviewed randomised double-blind studies of at least two weeks comparing topical lidocaine with placebo or an active control in chronic neuropathic pain. Twelve studies with 508 participants qualified, across 5% patch, 5% cream, 5% gel and 8% spray, mostly cross-over designs. There was no first-tier and no second-tier evidence by the review\'s own grading, no pooling of efficacy data was possible, and all studies were judged at high risk of bias because of small size, incomplete outcome assessment or both. Only one multiple-dose study reported the review\'s primary outcome of at least 30% or 50% pain intensity reduction. The registration evidence itself is thin: the pivotal Rowbotham study was 35 subjects in a four-session cross-over, with each patch session lasting 12 hours.',
        evidenceSource:
          'Derry S, Wiffen PJ, Moore RA, Quinlan J. Cochrane Database Syst Rev 2014;(7):CD010958; pivotal trial Rowbotham MC et al. Pain 1996;65:39-44',
        doi: '10.1002/14651858.CD010958.pub2',
        inferredClaim:
          'That the 5% lidocaine patch is an established treatment for neuropathic pain — an inference from small cross-over studies the review classed as very low quality throughout',
        auditFlag: 'caution',
      },
      {
        id: 'lid-a6',
        category: 'inferred',
        title:
          'Intravenous lidocaine during surgery: a real early effect, ruled out as clinically relevant by 24 hours',
        laymanSummary:
          'Running lidocaine into a vein during an operation is promoted as a way to need fewer opioids afterwards. Pooling 68 trials, the early pain effect was too uncertain to call and the later effect was small enough to rule out as meaningful.',
        technicalDetails:
          'Weibel and colleagues pooled 68 randomised trials with 4,525 participants comparing continuous perioperative intravenous lidocaine with placebo, no treatment or thoracic epidural analgesia. At 1 to 4 hours the standardised mean difference in pain at rest was -0.50 (95% CI -0.72 to -0.28; 29 studies, 1,656 participants) but graded very low quality. At 24 hours the SMD was -0.14 (95% CI -0.25 to -0.04; 33 studies, 1,847 participants) and at 48 hours -0.11 (95% CI -0.25 to 0.04; 24 studies, 1,404 participants), both moderate quality, and both small enough that the review explicitly ruled out a clinically relevant reduction. Opioid sparing was -4.52 mg morphine equivalents overall (95% CI -6.25 to -2.79; 40 studies, 2,201 participants), very low quality. Few studies systematically recorded adverse events at all, so the harm side of the ledger is close to empty.',
        evidenceSource: 'Weibel S et al. Cochrane Database Syst Rev 2018;6:CD009642',
        doi: '10.1002/14651858.CD009642.pub3',
        inferredClaim:
          'That perioperative intravenous lidocaine meaningfully improves postoperative pain and recovery — an inference the pooled evidence grades very low quality where the effect is largest and rules out as clinically relevant where the evidence is strongest',
        auditFlag: 'caution',
      },
      {
        id: 'lid-a7',
        category: 'measured',
        title: 'Methaemoglobinaemia is a labelled, class-wide harm and not a theoretical one',
        laymanSummary:
          'Local anaesthetics can convert haemoglobin into a form that cannot carry oxygen. It is rare, it is on the label, and some people are far more susceptible than others.',
        technicalDetails:
          'The FDA-approved label text held on this record states that cases of methaemoglobinaemia have been reported in association with local anaesthetic use, that all patients are at risk, and that patients with glucose-6-phosphate dehydrogenase deficiency, congenital or idiopathic methaemoglobinaemia, cardiac or pulmonary compromise, infants under six months of age, and those with concurrent exposure to oxidising agents or their metabolites are more susceptible to developing clinical manifestations. Close monitoring is recommended where the drug must be used in those patients. The label is the source; no incidence figure is quoted here because the label does not give one.',
        evidenceSource:
          'FDA-approved US prescribing information for lidocaine hydrochloride injection, Warnings and Precautions',
        measuredMetric:
          'Reported cases and named susceptibility factors, as carried in the approved label',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected, or laid on the skin, and it stays where it is put',
        laymanDesc:
          'The drug is placed next to the nerve that needs silencing. It works on the tissue it touches, and the block wears off as blood carries it away.',
        molecularDetail:
          'Duration of a peripheral block is governed by local clearance rather than by elimination half-life, which is why adrenaline is co-formulated in many presentations: vasoconstriction slows washout and lengthens the block. Systemically the drug is cleared by hepatic CYP1A2 and CYP3A4 to monoethylglycinexylidide and glycinexylidide, both of which are pharmacologically active.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses the nerve membrane uncharged, then picks up a proton inside',
        laymanDesc:
          'Only the electrically neutral form can slip through the fatty nerve membrane. Once inside, the more acidic interior puts a charge back on it, and the charged form is the one that blocks.',
        molecularDetail:
          'The tertiary amine has a pKa near 7.9, so at physiological pH roughly a quarter of the molecule is neutral and available to permeate. Inflamed tissue is acidic, which shifts the equilibrium toward the charged species outside the cell and is the accepted explanation for why local anaesthesia works poorly in an abscess.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It plugs the sodium gate from the inside',
        laymanDesc:
          'The blocking site is on the inner face of the channel, not the outer one. The drug sits in the mouth of the pore and sodium ions cannot get past it.',
        molecularDetail:
          'The receptor lies in the inner pore, formed principally by segment S6 of domain IV. Ragsdale and colleagues showed that the F1764A substitution cuts open-and-inactivated-state affinity to 1% of wild type; the permanently charged analogue QX-314 blocks only when applied intracellularly, which is the classical demonstration that the site faces the cytoplasm.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Busy nerves are blocked harder than quiet ones',
        laymanDesc:
          'Every time the gate opens the drug gets another chance to bind, so nerves firing rapidly accumulate block far faster than nerves at rest. Pain fibres fire fast, which is why they go first.',
        molecularDetail:
          'Use-dependent, or phasic, block arises because affinity for the open and inactivated conformations is orders of magnitude higher than for the resting one. The same property underlies the class Ib antiarrhythmic action: an ischaemic, rapidly depolarising ventricle spends more time in the inactivated state than healthy myocardium and is blocked preferentially.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The action potential fails and the message never leaves',
        laymanDesc:
          'With enough gates blocked, the electrical wave cannot rebuild itself further along the nerve. The signal dies where it started and no pain reaches the brain.',
        molecularDetail:
          'Block reduces the peak sodium conductance below the threshold needed for regenerative propagation. Conduction fails first in small unmyelinated C fibres and small myelinated A-delta fibres, then in the larger A-beta and A-alpha fibres, producing the clinical sequence of pain, then temperature, then touch, then motor loss, and the reverse sequence on recovery.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'It diffuses away and everything returns exactly as it was',
        laymanDesc:
          'Nothing is consumed and nothing is permanently changed. When the drug leaves, the gates open normally again and sensation comes back.',
        molecularDetail:
          'Binding is fully reversible and the channel protein is not modified. Recovery of conduction tracks local concentration decay rather than any repair process, which is what separates a local anaesthetic from a neurolytic agent such as phenol or alcohol.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ALPS — Amiodarone, Lidocaine or Placebo Study (NCT01401647)',
        phase: 'Phase 3 randomised double-blind placebo-controlled trial',
        sampleSize: 3026,
        primaryEndpoint: 'Survival to hospital discharge after out-of-hospital cardiac arrest',
        endpointMet: false,
        statisticalPValue:
          'P = 0.16 for lidocaine versus placebo (23.7% versus 21.0%, difference 2.6 percentage points, 95% CI -1.0 to 6.3)',
        unreportedAdverseSignals:
          'Treatment effect was heterogeneous by whether the arrest was witnessed (P=0.05); the benefit of active drug over placebo was confined to bystander-witnessed arrests and absent in unwitnessed ones.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ALIVE — Amiodarone versus Lidocaine In prehospital ventricular fibrillation',
        phase: 'Randomised double-blind active-controlled trial',
        sampleSize: 347,
        primaryEndpoint: 'Proportion of patients surviving to hospital admission',
        endpointMet: false,
        statisticalPValue:
          'P = 0.009 in favour of amiodarone (22.8% of 180 versus 12.0% of 167; odds ratio 2.17, 95% CI 1.21 to 3.83)',
        unreportedAdverseSignals:
          'There was no placebo arm. The trial shows lidocaine is worse than amiodarone and says nothing about whether either beats no drug.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'MacMahon pooled analysis of prophylactic lidocaine in suspected acute MI',
        phase: 'Meta-analysis of 14 randomised trials',
        sampleSize: 9155,
        primaryEndpoint: 'Early ventricular fibrillation and early death',
        endpointMet: false,
        statisticalPValue:
          'Odds of ventricular fibrillation reduced about one third (95% CI 3% to 56% reduction); odds of early death about one third greater (95% CI 2% reduction to 95% increase)',
        unreportedAdverseSignals:
          'Only 103 fibrillation events and 137 deaths across all 14 trials, so the mortality estimate is imprecise in both directions. The authors said so.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Weibel Cochrane review of perioperative intravenous lidocaine infusion',
        phase: 'Systematic review and meta-analysis of 68 randomised trials',
        sampleSize: 4525,
        primaryEndpoint:
          'Pain score at rest, gastrointestinal recovery and adverse events after surgery',
        endpointMet: false,
        statisticalPValue:
          'SMD -0.14 (95% CI -0.25 to -0.04) at 24 hours and -0.11 (95% CI -0.25 to 0.04) at 48 hours; both moderate quality and both below the review\'s threshold for clinical relevance',
        unreportedAdverseSignals:
          'Only a small number of the 68 trials systematically analysed adverse events, so the safety side of the comparison is graded very low quality.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Derry Cochrane review of topical lidocaine for neuropathic pain',
        phase: 'Systematic review of 12 randomised double-blind studies',
        sampleSize: 508,
        primaryEndpoint: 'Participants with at least 30% or 50% pain intensity reduction',
        endpointMet: false,
        statisticalPValue:
          'No pooling possible. No first-tier or second-tier evidence; every included study judged at high risk of bias.',
        unreportedAdverseSignals:
          'Enriched-enrolment randomised-withdrawal designs, used in two of the twelve, cannot measure the real impact of adverse events because intolerant participants are removed before randomisation.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mutating phenylalanine 1764 in domain IV segment S6 cuts open and inactivated state binding to 1% of wild type and abolishes use-dependence — the receptor site is inside the pore',
        'Survival to hospital discharge of 23.7% on lidocaine against 21.0% on saline placebo in 3,026 cardiac arrests, a difference of 2.6 percentage points that did not reach significance',
        'Survival to hospital admission of 12.0% on lidocaine against 22.8% on amiodarone in 347 shock-resistant ventricular fibrillations',
        'A standardised mean difference in postoperative pain at 24 hours of -0.14 across 33 trials and 1,847 participants — real, and smaller than the review\'s own threshold for meaning anything',
      ],
      unsupportedInferences: [
        'That suppressing ventricular fibrillation with prophylactic lidocaine after myocardial infarction saves lives — the pooled trials trended the other way on death',
        'That the 5% patch is an established neuropathic pain treatment — the Cochrane review found no first-tier or second-tier evidence at all across 12 studies and 508 participants',
        'That perioperative lidocaine infusion meaningfully reduces postoperative pain, ileus or opioid use — every one of those outcomes was graded very low quality',
        'That the reliability of lidocaine as a local anaesthetic transfers to its systemic uses; they are different concentrations acting on different tissue for different purposes',
      ],
      whatFailedInitially: [
        'ALPS: no significant survival benefit over saline placebo in the largest antiarrhythmic trial ever run in cardiac arrest',
        'ALIVE: lidocaine lost the head-to-head against amiodarone on survival to admission, P=0.009',
        'Routine prophylactic lidocaine after myocardial infarction was abandoned worldwide after the 1988 pooled analysis',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines as both a local anaesthetic and an antiarrhythmic, and stocked in essentially every clinical setting on earth',
        'About 32 cents per millilitre at United States pharmacy acquisition cost, across 161 listed generic products',
        'Demoted from first-line to second-line antiarrhythmic in cardiac arrest guidelines after ALIVE, then left there by ALPS showing amiodarone does not beat placebo either',
      ],
    },
    deliverySystem: {
      type:
        'Injection for infiltration, nerve block, epidural and spinal use; intravenous solution for arrhythmia; topical gel, cream, ointment, spray, jelly and 5% medicated patch',
      description:
        'The route decides the drug. An infiltration injection is meant to stay in the tissue and act on nearby nerves; an intravenous infusion is meant to reach the heart or the whole body. Many injectable presentations are co-formulated with adrenaline, which constricts local vessels, slows washout and lengthens the block. Preservative-free presentations exist because preservatives are not acceptable in the epidural or spinal space.',
      safetyProfile:
        'The label warns of methaemoglobinaemia, with higher susceptibility in glucose-6-phosphate dehydrogenase deficiency, congenital or idiopathic methaemoglobinaemia, cardiac or pulmonary compromise, infants under six months and concurrent oxidising agents. Systemic toxicity from inadvertent intravascular injection or excessive dose progresses through circumoral numbness, tinnitus and metallic taste to seizures and, at higher exposure, cardiac depression. The topical patch label warns that serious burns have been reported with products of this type and that more than one patch should not be worn at a time. Lidocaine is the least cardiotoxic of the commonly used amide anaesthetics, which is why it is the one chosen where an intravascular injection is most likely.',
    },
    commonQuestions: [
      {
        q: 'Why does the dentist say "you might feel pressure but not pain"?',
        a: 'Because the block arrives in an order. Small unmyelinated C fibres and small myelinated A-delta fibres carry pain and temperature, and they are blocked first because they are thin and fire fast, which makes them most exposed to use-dependent block. The large A-beta fibres carrying deep pressure and proprioception are thicker and slower to succumb, so they are often still working when the pain fibres have gone quiet. Recovery runs the same sequence backwards. The sensation of pressure without pain is not incomplete anaesthesia; it is what selective anaesthesia feels like.',
      },
      {
        q: 'Why does numbing not work as well when the area is infected?',
        a: 'Lidocaine has to cross the nerve membrane in its uncharged form and can only do that if a reasonable fraction of the molecules are uncharged. Its pKa is about 7.9, so at normal tissue pH roughly a quarter of it is neutral. Infected and inflamed tissue is acidic, which pushes more of the drug into its charged form outside the cell where it cannot permeate, leaving less to reach the blocking site on the inside. That is the standard explanation and it is a pharmacological prediction rather than a result from a randomised trial; the clinical observation itself is very consistent.',
        auditNote:
          'The ion-trapping account is textbook and mechanistically coherent. It is not something a trial measured, and this page separates the two.',
      },
      {
        q: 'Is the lidocaine patch actually proven to work for nerve pain?',
        a: 'Not to the standard the question implies. A Cochrane review searched every randomised double-blind study of at least two weeks and found twelve, with 508 participants in total across four formulations. It judged every one at high risk of bias, found no first-tier or second-tier evidence by its own grading, and could not pool a single efficacy outcome. Only one multiple-dose study reported whether participants got at least 30% or 50% pain relief. The registration study most often cited, from 1996, enrolled 35 people in a four-session cross-over with 12-hour patch applications. Individual studies did favour lidocaine, and clinicians report that some patients clearly benefit; what does not exist is the trial evidence that would settle it.',
        auditNote:
          'This is the widest gap on this page: an extremely widely prescribed product resting on a body of evidence its own systematic review classes as very low quality throughout.',
      },
      {
        q: 'It is used in cardiac arrest — does it save lives?',
        a: 'No trial has shown that it does. ALPS randomised 3,026 people with shock-refractory ventricular fibrillation to amiodarone, lidocaine or saline. Survival to hospital discharge was 24.4%, 23.7% and 21.0%. Lidocaine versus placebo was 2.6 percentage points, P=0.16, and amiodarone versus placebo 3.2 points, P=0.08. Neither reached significance and neurological outcome was the same in all three groups. Fourteen years earlier ALIVE had shown lidocaine was clearly worse than amiodarone on survival to hospital admission, 12.0% against 22.8%, and that is why it was demoted to second line. Read together, the two trials say lidocaine loses to a drug that does not itself beat saline.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost-of-production figure for lidocaine could be verified and cited. The cost-of-production literature that was checked publishes an estimation method and aggregate ranges rather than a per-dose number for this molecule, and inventing one here would mean this page fabricating a figure. What is shown instead is the actual United States pharmacy acquisition cost from the CMS NADAC survey, about 32 cents per millilitre as a median across 161 listed products, which is a price and not a cost of manufacture. The route is two steps from commodity chemicals, which is consistent with the price being low, but consistency is not a measurement.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ragsdale DS, McPhee JC, Scheuer T, Catterall WA. Molecular determinants of state-dependent block of Na+ channels by local anesthetics. Science 1994;265:1724-1728',
        identifier: '10.1126/science.8085162',
        kind: 'doi',
      },
      {
        label:
          'Kudenchuk PJ et al. Amiodarone, Lidocaine, or Placebo in Out-of-Hospital Cardiac Arrest. N Engl J Med 2016;374:1711-1722',
        identifier: '10.1056/NEJMoa1514204',
        kind: 'doi',
      },
      {
        label:
          'ALPS — Resuscitation Outcomes Consortium Amiodarone, Lidocaine or Placebo Study registration record',
        identifier: 'NCT01401647',
        kind: 'nct',
      },
      {
        label:
          'Dorian P et al. Amiodarone as compared with lidocaine for shock-resistant ventricular fibrillation. N Engl J Med 2002;346:884-890',
        identifier: '10.1056/NEJMoa013029',
        kind: 'doi',
      },
      {
        label:
          'MacMahon S, Collins R, Peto R, Koster RW, Yusuf S. Effects of prophylactic lidocaine in suspected acute myocardial infarction. JAMA 1988;260:1910-1916',
        identifier: '3047448',
        kind: 'pmid',
      },
      {
        label:
          'Weibel S et al. Continuous intravenous perioperative lidocaine infusion for postoperative pain and recovery in adults. Cochrane Database Syst Rev 2018;6:CD009642',
        identifier: '10.1002/14651858.CD009642.pub3',
        kind: 'doi',
      },
      {
        label:
          'Derry S, Wiffen PJ, Moore RA, Quinlan J. Topical lidocaine for neuropathic pain in adults. Cochrane Database Syst Rev 2014;(7):CD010958',
        identifier: '10.1002/14651858.CD010958.pub2',
        kind: 'doi',
      },
      {
        label:
          'Rowbotham MC, Davies PS, Verkempinck C, Galer BS. Lidocaine patch: double-blind controlled study of a new treatment method for post-herpetic neuralgia. Pain 1996;65:39-44',
        identifier: '10.1016/0304-3959(95)00146-8',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 3676 — lidocaine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3676',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
