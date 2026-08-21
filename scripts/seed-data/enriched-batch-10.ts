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
 *    Six of the ten — ropivacaine, sevoflurane, succinylcholine, sugammadex, dexmedetomidine and
 *    etomidate — have no NADAC value on the record and carry no `pricing` block at all. A missing
 *    number beats a manufactured one.
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
  // ---------------------------------------------------------------------------------------------
  // 2. Bupivacaine — the long block that killed people, the label that was rewritten because of it,
  //    and the liposomal reformulation that did not do what it was sold to do.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'bupivacaine',
    name: 'Bupivacaine',
    tradeName: 'Marcaine, Sensorcaine, Sensorcaine MPF; liposomal formulation marketed as Exparel',
    sponsor:
      'Hospira (current US label holder for the hydrochloride injection); synthesised by Bo af Ekenstam at AB Bofors in 1957 and long off patent. The liposomal formulation is a separate, patented product from Pacira BioSciences.',
    targetGene: 'SCN5A, SCN9A, SCN10A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits — Nav1.7 and Nav1.8 in peripheral sensory neurons, Nav1.5 in cardiac ventricular myocytes — bound at the local anaesthetic receptor in the inner pore lined by segment S6 of domain IV',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1972,
    indication:
      'Production of local or regional anaesthesia or analgesia for surgery, dental and oral surgery, diagnostic and therapeutic procedures, and obstetrical procedures, in adults, by infiltration, peripheral nerve block, epidural or intrathecal route',
    patientFriendlyIndication:
      'Numbing an area of the body for hours rather than for an hour, for surgery, childbirth or a nerve block',
    anatomicalSite:
      'Inner pore of the sodium channel, in peripheral nerve axons and — when it reaches the bloodstream — in cardiac ventricular myocytes',
    conditionContext: {
      conditionExplainer:
        'Bupivacaine and lidocaine block the same protein by the same mechanism. What separates them is how long the drug stays attached. Bupivacaine has a butyl chain on a piperidine ring where lidocaine has two ethyl groups on an open-chain amine, and that makes it far greasier and far slower to let go once bound. In a nerve, slow release is the whole point: a single injection can silence a nerve for six to twelve hours. In heart muscle, slow release is the danger.',
      whyItMatters:
        'A long block is the difference between an operation that needs a general anaesthetic and one that does not, and between a labouring woman who can feel her contractions and one who cannot. Bupivacaine is what made continuous epidural analgesia routine. It is also the molecule that produced the anaesthetic literature on cardiac arrest, resuscitation and lipid rescue, because it is the one that killed people when it went into a vein by accident.',
      whoTakesThis:
        'Anyone having an epidural in labour, a spinal for a caesarean section or a joint replacement, a nerve block for shoulder or knee surgery, or local infiltration at the end of an operation. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Abolish sensation in a defined territory for several hours, with as little motor block and as little systemic absorption as possible. Whether that also reduces opioid use, chronic post-surgical pain or length of stay is a separate question, asked separately below.',
    },
    oneSentenceVerdict:
      'A long-acting sodium channel blocker whose defining measurement is not an analgesia score but an unbinding rate — it leaves the cardiac sodium channel with a time constant of 1,557 milliseconds against lidocaine\'s 154, which is why one injection numbs for hours and why an accidental intravascular dose can stop a heart that is then hard to restart.',
    laymanHowItWorks:
      'Bupivacaine blocks the same sodium gates in nerves that lidocaine blocks, and it blocks them the same way — from the inside of the nerve, in the mouth of the pore. The difference is that it is far greasier and it clings. Once it is on the channel it takes about ten times longer to fall off, so the numbness lasts hours instead of an hour. That same clinginess is the problem when the drug reaches the heart, because heart muscle cells also depend on those gates, and a drug that will not let go between beats accumulates block with every beat.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0860 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed generic products, survey effective 22 April 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The hydrochloride has been generic for decades and there is no originator exclusivity anywhere. The liposomal formulation is a different commercial object: it is patented, single-source, and priced orders of magnitude above the generic solution it encapsulates. The gap between the two prices is a formulation gap, not a molecule gap, and the evidence that the formulation buys a clinically meaningful benefit is audited below.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The substitutes are the other long-acting amide anaesthetics, and the entire argument between them is about cardiotoxicity rather than about pain relief. Ropivacaine and levobupivacaine were both developed to keep the duration and lose the cardiac risk, and both are less potent per milligram than racemic bupivacaine, which is a large part of why they look safer. There is no food and no home measure that produces a surgical nerve block, and this page does not pretend otherwise.',
      conventionalRx: [
        {
          name: 'Ropivacaine (Naropin)',
          class: 'Long-acting amide local anaesthetic, single S-enantiomer',
          howItCompares:
            'In 12 volunteers given intravenous infusions of both drugs in crossover, the maximum tolerated unbound plasma concentration was twice as high for ropivacaine (P<0.001), bupivacaine widened the QRS complex where ropivacaine did not, and bupivacaine depressed both systolic and diastolic left ventricular function where ropivacaine depressed only systolic. Against that, ropivacaine is measurably weaker: its minimum local analgesic concentration in labour epidural was 0.111% against bupivacaine\'s 0.067%, a potency ratio of 0.6.',
          typicalCost:
            'No NADAC value is held on this record for ropivacaine and none is asserted here',
          prosAndCons:
            'Pros: a genuinely wider margin before cardiac effects appear. Cons: part of that margin is bought by being a weaker drug, so milligram-for-milligram comparisons flatter it.',
        },
        {
          name: 'Levobupivacaine (Chirocaine)',
          class: 'The S-enantiomer of bupivacaine',
          howItCompares:
            'Racemic bupivacaine is a 50:50 mixture of two mirror-image molecules, and the R-enantiomer carries most of the cardiac toxicity. Levobupivacaine is the racemate with that half removed. Head-to-head against ropivacaine for labour epidural analgesia by the same up-down potency method, levobupivacaine was the more potent of the two, with a potency ratio of 0.83 for ropivacaine relative to levobupivacaine.',
          typicalCost:
            'Not marketed in the United States; no NADAC value exists and none is asserted here',
          prosAndCons:
            'Pros: keeps bupivacaine\'s potency while discarding the more cardiotoxic enantiomer. Cons: withdrawn from the US market for commercial reasons, so in America the choice is between the racemate and ropivacaine.',
        },
        {
          name: 'Lidocaine (Xylocaine)',
          class: 'Intermediate-acting amide local anaesthetic',
          howItCompares:
            'Blocks the same site but unbinds from the cardiac channel roughly ten times faster — a diastolic recovery time constant of 154 ms against bupivacaine\'s 1,557 ms — so block does not accumulate beat to beat at normal heart rates. It is the safer molecule and the shorter-acting one, and that trade is the entire reason both drugs remain on the shelf.',
          typicalCost:
            'US$0.3221 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 161 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: far more forgiving of an accidental intravascular injection. Cons: the block is over in about an hour.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say the early symptoms out loud',
          action:
            'Ringing in the ears, a metallic taste, numbness around the lips or sudden light-headedness during or just after a large regional block are the first signs that drug has reached the circulation.',
          patientImpact:
            'With bupivacaine those symptoms matter more than with lidocaine, because the margin between the first neurological sign and a cardiac effect is narrower for this molecule than for any other in routine use.',
          clinicalPrecaution:
            'This is a reporting instruction and nothing else. Systemic local anaesthetic toxicity is a resuscitation event managed by the clinical team, with lipid emulsion held for exactly this purpose.',
        },
        {
          name: 'Protect the numb limb',
          action:
            'A limb blocked with bupivacaine may have no sensation for six to twelve hours, and no way to report a pressure point, a burn or an awkward position.',
          patientImpact:
            'Positioning injuries and burns after long blocks are a real and under-reported harm of a successful block rather than a failure of one.',
          clinicalPrecaution:
            'Nothing here is a substitute for the discharge instructions given with a block. It is a statement of why those instructions exist.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCCN1CCCCC1C(=O)NC2=C(C=CC=C2C)C',
      chemicalFormula: 'C18H28N2O',
      molecularWeight: '288.40 g/mol (free base); dispensed as bupivacaine hydrochloride',
      targetReceptorAffinity:
        'Clarkson and Hondeghem measured a dissociation constant of 9 x 10^-7 M for the inactivated cardiac sodium channel in guinea pig ventricular muscle under sucrose-gap voltage clamp, with low affinity for rested and activated channels. Bupivacaine-associated channels do not conduct and their inactivation curve is shifted about 33 mV negative. The number that matters clinically is not the affinity but the off-rate: diastolic recovery from block proceeds with a time constant of 1,557 +/- 304 ms, against 153.8 +/- 51.2 ms for lidocaine.',
      structureSource: {
        label: 'PubChem CID 2474 (bupivacaine) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2474',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bup-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and isomeric purity of 2,6-dimethylaniline and the pipecolic acid precursor',
          description:
            'Confirm the aniline is the 2,6-isomer and characterise the racemic pipecolic acid derivative that will become the chiral centre. Bupivacaine as dispensed is a racemate, so the specification is written for a racemate; a batch with an unintended enantiomeric excess is out of specification even if it is purer.',
          reagentsAndBuffer:
            '2,6-dimethylaniline reference standard, racemic pipecolic acid reference standard, gas chromatography with flame ionisation detection, chiral HPLC on an amylose-derived stationary phase for enantiomeric ratio',
        },
        {
          id: 'bup-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling to 2\',6\'-pipecoloxylidide',
          description:
            'Couple the activated pipecolic acid to 2,6-dimethylaniline to give the secondary-amine intermediate. The two ortho methyl groups are the same steric shield that protects lidocaine from plasma esterases, and they are the reason this is an amide anaesthetic with a long half-life rather than an ester one with a short one.',
          dependsOnStepId: 'bup-w1',
          reagentsAndBuffer:
            'N-carbobenzyloxy-pipecolic acid or the acid chloride, 2,6-dimethylaniline, triethylamine, dichloromethane or toluene, nitrogen blanket',
        },
        {
          id: 'bup-w3',
          stepNumber: 3,
          phase: 'Synthesis',
          name: 'N-butylation of the piperidine nitrogen',
          description:
            'Alkylate the ring nitrogen with a butyl group. This single step is what separates bupivacaine from mepivacaine, which carries a methyl in the same position: the four-carbon chain raises lipid solubility roughly thirtyfold and converts an intermediate-acting anaesthetic into a long-acting one with a cardiac warning.',
          dependsOnStepId: 'bup-w2',
          reagentsAndBuffer:
            '1-bromobutane or butyl chloride, potassium carbonate or sodium hydroxide, acetonitrile or dimethylformamide at reflux, potassium iodide as catalyst',
        },
        {
          id: 'bup-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Hydrochloride monohydrate crystallisation and residual xylidine limit',
          description:
            'Form the hydrochloride monohydrate and assay against the compendial limit for residual 2,6-dimethylaniline, which is the impurity of toxicological concern shared with lidocaine. Preservative-free presentations are finished separately, because the intrathecal and epidural routes do not tolerate methylparaben.',
          dependsOnStepId: 'bup-w3',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, purified water, activated charcoal, reversed-phase HPLC with phosphate buffer pH 8.0 and acetonitrile, UV detection at 230 nm',
        },
        {
          id: 'bup-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Voltage clamp on cardiac myocytes, not on neurons',
          description:
            'Record sodium current in ventricular muscle rather than in a sensory neuron line. The delivery question for bupivacaine is the one the clinic cares about: what happens when the drug arrives at cardiac tissue rather than at the nerve it was aimed at. Clarkson and Hondeghem used a single sucrose-gap voltage clamp on guinea pig ventricular muscle and read maximum upstroke velocity as a proxy for peak sodium current.',
          dependsOnStepId: 'bup-w4',
          reagentsAndBuffer:
            'Guinea pig ventricular muscle strips or isolated cardiomyocytes, Tyrode solution at 37 degrees C, sucrose-gap or whole-cell voltage clamp, drug applied at 0.2 to 5 micrograms per mL',
        },
        {
          id: 'bup-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Measure the off-rate, not just the block',
          description:
            'Fit diastolic recovery from block as a single exponential and report the time constant beside the steady-state block. Reporting only the fraction of channels blocked makes bupivacaine and lidocaine look similar; the recovery time constant is where they differ tenfold, and it is the number that predicts accumulation at 60 to 150 beats per minute.',
          dependsOnStepId: 'bup-w5',
          reagentsAndBuffer:
            'Paired-pulse recovery protocols at diastolic intervals from 20 ms to 10 s, single-exponential fitting, matched lidocaine control at 5 to 10 micrograms per mL, holding potentials stepped to test voltage dependence',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bup-a1',
        category: 'measured',
        title: 'Fast-in, slow-out: the off-rate from the cardiac channel is ten times lidocaine\'s',
        laymanSummary:
          'Both drugs block the sodium gate during a heartbeat. Lidocaine falls off again in about a sixth of a second; bupivacaine takes about a second and a half. At a normal heart rate there is not enough time between beats for it to clear, so block builds up.',
        technicalDetails:
          'Clarkson and Hondeghem compared bupivacaine and lidocaine on guinea pig ventricular muscle under single sucrose-gap voltage clamp, using maximum upstroke velocity as an index of peak sodium current. Bupivacaine had low affinity for rested and activated channels but bound the inactivated channel with a dissociation constant of 9 x 10^-7 M, and shifted the voltage dependence of inactivation about 33 mV negative. Above 0.2 micrograms per mL a substantial fraction of channels blocked during the action potential, while diastolic recovery proceeded with a time constant of 1,557 +/- 304 ms (n=8). Lidocaine at 5 to 10 micrograms per mL blocked a comparable fraction during the action potential but recovered with a time constant of 153.8 +/- 51.2 ms (n=4). Bupivacaine therefore accumulates block across the range of 60 to 150 beats per minute and lidocaine does not, which the authors offered as the mechanistic explanation for why bupivacaine cardiac arrest is both severe and hard to reverse.',
        evidenceSource: 'Clarkson CW, Hondeghem LM. Anesthesiology 1985;62:396-405 (PMID 2580463)',
        measuredMetric:
          'Time constant of diastolic recovery from sodium channel block, and dissociation constant for the inactivated state',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a2',
        category: 'conclusion_shift',
        title: 'The 0.75% concentration was withdrawn from obstetric use after Albright\'s editorial',
        laymanSummary:
          'In 1979 an anaesthetist published six cases in which patients given a long-acting local anaesthetic had cardiac arrest almost at the same moment as the seizure, rather than afterwards. The strongest concentration was withdrawn from use in childbirth.',
        technicalDetails:
          'Albright described cardiac arrest following regional anaesthesia with etidocaine or bupivacaine, in which cardiovascular collapse occurred simultaneously with, rather than following, central nervous system toxicity — breaking the assumption inherited from lidocaine that seizures give warning before the heart is affected. The FDA subsequently removed the 0.75% concentration from obstetric use. This is a genuine change of mind rather than a refinement: the class-wide safety model, in which local anaesthetic toxicity progresses through predictable neurological stages, was correct for lidocaine and wrong for bupivacaine, and it was wrong because of the off-rate measured six years later by Clarkson and Hondeghem.',
        evidenceSource:
          'Albright GA. Cardiac arrest following regional anesthesia with etidocaine or bupivacaine. Anesthesiology 1979;51:285-287',
        doi: '10.1097/00000542-197910000-00001',
        inferredClaim:
          'That local anaesthetic systemic toxicity always announces itself neurologically before it becomes cardiac — true for lidocaine, false for bupivacaine, and believed for both until 1979',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a3',
        category: 'failed',
        title: 'Liposomal bupivacaine in nerve blocks: statistically significant, clinically not',
        laymanSummary:
          'The slow-release version is sold as lasting longer in a nerve block. Pooling nine randomised trials, it beat ordinary bupivacaine by half of what the researchers had defined in advance as the smallest difference a patient would notice — and once one industry-funded trial was removed, it did not beat it at all.',
        technicalDetails:
          'Hussain and colleagues pooled nine randomised trials with 619 patients comparing perineural liposomal bupivacaine with non-liposomal local anaesthetic for peripheral nerve block. The primary outcome was the area under the curve of 24-to-72-hour rest pain scores, interpreted against a pre-specified minimal clinically important difference of 2.0 cm.h. Pooled AUC pain scores were 7.6 +/- 4.9 cm.h for non-liposomal and 6.6 +/- 4.6 cm.h for liposomal, an improvement of 1.0 cm.h (95% CI 0.5 to 1.6; P=0.003) — half the threshold for clinical importance. Excluding a single industry-sponsored trial rendered the difference non-significant at 0.7 cm.h (95% CI -0.1 to 1.5; P=0.100). No secondary outcome favoured the liposomal product: not analgesic consumption, not time to first analgesic request, not opioid side effects, not patient satisfaction, not length of stay, not functional recovery. The authors concluded that high-quality evidence does not support its use over plain bupivacaine for peripheral nerve blocks.',
        evidenceSource: 'Hussain N, Brull R, Sheehy B, et al. Anesthesiology 2021;134:147-164',
        doi: '10.1097/ALN.0000000000003651',
        measuredMetric:
          'Difference in area under the curve of 24-to-72-hour rest pain scores against a pre-specified minimal clinically important difference of 2.0 cm.h',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a4',
        category: 'inferred',
        title: 'The infiltration evidence was too thin for Cochrane to pool at all',
        laymanSummary:
          'Injected into the wound rather than around a nerve, the slow-release version has been studied nine times. Cochrane could not combine the results into a meaningful answer, and four of the trials were too small to trust.',
        technicalDetails:
          'Hamilton and colleagues identified nine studies with 1,377 participants of liposomal bupivacaine infiltrated at the surgical site. Four were Phase II dose-escalating or de-escalating trials whose pooled data could not be used. Of the five remaining parallel-arm studies with 965 participants, two were placebo-controlled and three used bupivacaine hydrochloride as the control. The review planned a meta-analysis and a summary-of-findings table and abandoned both, stating there were insufficient data to ensure a clinically meaningful answer and presenting narrative summaries instead. Two studies were at high risk of selective reporting bias and four at high risk of bias from size, with fewer than 50 participants per arm. Where a difference against placebo was reported for cumulative 72-hour pain, it came from a single study graded very low quality.',
        evidenceSource:
          'Hamilton TW, Athanassoglou V, Mellon S, et al. Cochrane Database Syst Rev 2017;2:CD011419',
        doi: '10.1002/14651858.CD011419.pub2',
        inferredClaim:
          'That wound infiltration with liposomal bupivacaine is an evidence-based alternative to plain bupivacaine — an inference the systematic review could not evaluate, let alone support',
        auditFlag: 'caution',
      },
      {
        id: 'bup-a5',
        category: 'measured',
        title: 'Ropivacaine tolerates twice the free plasma concentration before symptoms appear',
        laymanSummary:
          'Twelve volunteers were infused with both drugs on separate days and asked to say when they felt the first definite symptoms. They could tolerate about twice as much unbound ropivacaine in the blood as unbound bupivacaine, and only bupivacaine widened the electrical complex on their ECG.',
        technicalDetails:
          'Knudsen and colleagues ran a randomised double-blind crossover in 12 volunteers already familiar with the central nervous system effects of lignocaine, infusing ropivacaine, bupivacaine or placebo at 10 mg per minute to the point of definite symptoms. The maximum tolerated dose was higher for ropivacaine in nine of the 12 subjects, with 95% confidence limits on the mean difference of -30 to 7 mg. The maximum tolerated unbound arterial plasma concentration was twice as high for ropivacaine (P<0.001), with an apparent CNS toxicity threshold near 0.6 mg/L free ropivacaine against 0.3 mg/L free bupivacaine. Muscular twitching was more frequent after bupivacaine (P<0.05) and symptoms resolved faster after ropivacaine (P<0.05). Bupivacaine widened the QRS complex against both placebo (P<0.001) and ropivacaine (P<0.01), and depressed both systolic and diastolic left ventricular function, where ropivacaine depressed systolic function only. This is a direct human measurement of the safety margin, in volunteers, at the concentrations that matter.',
        evidenceSource:
          'Knudsen K, Beckman Suurkula M, Blomberg S, Sjovall J, Edvardsson N. Br J Anaesth 1997;78:507-514',
        doi: '10.1093/bja/78.5.507',
        measuredMetric:
          'Maximum tolerated unbound arterial plasma concentration, QRS width and left ventricular function during controlled intravenous infusion',
        auditFlag: 'verified',
      },
      {
        id: 'bup-a6',
        category: 'inferred',
        title: 'Part of ropivacaine\'s safety margin is that it is a weaker drug',
        laymanSummary:
          'Comparing the two by the milligram makes the newer one look safer. Measured properly, it takes about 1.7 times as much ropivacaine to produce the same pain relief, so a milligram-for-milligram safety comparison is not a fair one.',
        technicalDetails:
          'Polley and colleagues determined minimum local analgesic concentration by up-down sequential allocation in 73 labouring women at 7 cm dilation or less, giving 20 mL of epidural test solution and defining effectiveness as a visual analogue score of 10 mm or less within 30 minutes. The minimum local analgesic concentration was 0.111% weight/volume for ropivacaine (95% CI 0.100 to 0.122) and 0.067% for bupivacaine (95% CI 0.052 to 0.082), a potency ratio of 0.6 (95% CI 0.49 to 0.74). No difference in motor effects was seen. The toxicity comparisons that established ropivacaine\'s reputation, including Scott 1989 and Knudsen 1997, infused equal milligram doses of the two drugs. This audit is not a claim that ropivacaine has no safety advantage — Knudsen measured a real one in unbound plasma concentration — but that the size of the advantage quoted from equal-milligram studies is inflated by roughly the potency ratio, and the therapeutic index is the number that should be compared.',
        evidenceSource:
          'Polley LS, Columb MO, Naughton NN, Wagner DS, van de Ven CJ. Anesthesiology 1999;90:944-950',
        doi: '10.1097/00000542-199904000-00003',
        inferredClaim:
          'That ropivacaine is safer than bupivacaine by the ratio seen in equal-milligram toxicity studies — an inference that ignores a measured potency ratio of 0.6',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Deposited next to the nerve and left there',
        laymanDesc:
          'The injection is placed around a nerve, into the epidural space or into the spinal fluid. From there it has to reach the nerve fibres by diffusion alone.',
        molecularDetail:
          'Very high lipid solubility means a large fraction partitions into local fat and myelin rather than being carried away in blood, which is why the block outlasts the plasma half-life by hours. Systemic absorption is fastest from intercostal and interpleural sites and slowest from subcutaneous infiltration, and the resulting peak plasma concentration for a fixed dose can differ several-fold by site.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the axon and protonates',
        laymanDesc:
          'Only the uncharged form gets through the nerve membrane. Inside, it picks up a proton, and the charged form is the one that blocks the gate.',
        molecularDetail:
          'The piperidine nitrogen has a pKa near 8.1, so a smaller uncharged fraction is available at physiological pH than for lidocaine, which contributes to a slower onset. The butyl chain raises the octanol-water partition coefficient about thirtyfold over mepivacaine, and lipid solubility is the property that tracks both potency and duration across this class.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds the inner pore and does not let go',
        laymanDesc:
          'The blocking site is the same inner mouth of the channel that lidocaine uses. The difference is entirely in how long the drug stays there once it arrives.',
        molecularDetail:
          'Binding is strongly state-dependent, with a dissociation constant of 9 x 10^-7 M for the inactivated cardiac channel and much weaker affinity for the rested and activated states. Bound channels do not conduct and their inactivation curve shifts about 33 mV negative, so at any given membrane potential a larger fraction of the population sits unavailable.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In a heart, the block accumulates beat by beat',
        laymanDesc:
          'Between heartbeats the drug is supposed to fall off. Bupivacaine falls off so slowly that at a normal heart rate the next beat arrives before it has cleared, and the block deepens with every beat.',
        molecularDetail:
          'Diastolic recovery has a time constant of 1,557 +/- 304 ms, longer than the diastolic interval at any rate between 60 and 150 beats per minute, so block accumulates rather than resetting. Reducing heart rate, hyperpolarising the membrane and shortening the action potential all reduce block, but Clarkson and Hondeghem found that varying them across clinically achievable ranges did not markedly change the effect.',
        iconName: 'HeartPulse',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In a nerve, the same stickiness is the benefit',
        laymanDesc:
          'A nerve is not firing eighty times a minute waiting for the drug to clear. The same slow release that is dangerous in the heart is exactly what gives six to twelve hours of numbness from one injection.',
        molecularDetail:
          'Conduction fails first in small unmyelinated C and small myelinated A-delta fibres, then in larger A-beta and A-alpha fibres, producing the labelled sequence of pain, then temperature, then touch, then proprioception, then skeletal muscle tone. Differential block is more pronounced at low concentrations, which is the pharmacological basis for a labour epidural that abolishes pain while leaving some motor function.',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'It washes out, and if it has reached the heart that takes longer than it should',
        laymanDesc:
          'A nerve block simply wears off. A cardiac arrest caused by this drug is different: the heart has to unbind it, and that is the part that has historically been hard.',
        molecularDetail:
          'Elimination is hepatic, principally by CYP3A4 N-dealkylation to pipecolylxylidide, with an elimination half-life around 2.7 hours in adults and considerably longer in neonates. Recovery of cardiac conduction after a toxic exposure is governed by unbinding rather than by clearance, which is the pharmacological rationale for intravenous lipid emulsion as a rescue: it is proposed to act as a circulating lipid sink, and that proposal is a mechanistic inference supported by animal work and human case reports rather than by a randomised trial in people.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Hussain meta-analysis of perineural liposomal bupivacaine versus non-liposomal local anaesthetic',
        phase: 'Systematic review and meta-analysis of 9 randomised trials',
        sampleSize: 619,
        primaryEndpoint:
          'Area under the curve of pooled 24-to-72-hour rest pain severity scores, against a pre-specified minimal clinically important difference of 2.0 cm.h',
        endpointMet: false,
        statisticalPValue:
          'Improvement of 1.0 cm.h (95% CI 0.5 to 1.6; P=0.003), half the pre-specified threshold for clinical importance; 0.7 cm.h (95% CI -0.1 to 1.5; P=0.100) after excluding one industry-sponsored trial',
        unreportedAdverseSignals:
          'No liposomal bupivacaine side effects were reported in any included trial, which the authors note rather than treat as reassurance: nine trials of 619 patients cannot exclude an uncommon harm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Hamilton Cochrane review of liposomal bupivacaine infiltration at the surgical site',
        phase: 'Systematic review of 9 studies',
        sampleSize: 1377,
        primaryEndpoint: 'Cumulative pain intensity over 72 hours following surgery',
        endpointMet: false,
        statisticalPValue:
          'No meta-analysis was performed. The review judged there were insufficient data to ensure a clinically meaningful answer and reported narratively instead.',
        unreportedAdverseSignals:
          'Four Phase II trials presented only pooled data that could not be used; two studies were at high risk of selective reporting bias; four had fewer than 50 participants per arm.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Knudsen volunteer crossover of intravenous ropivacaine, bupivacaine and placebo',
        phase: 'Randomised double-blind three-way crossover in volunteers',
        sampleSize: 12,
        primaryEndpoint:
          'Maximum tolerated dose and unbound plasma concentration for central nervous system symptoms, with echocardiographic and electrophysiological change',
        endpointMet: true,
        statisticalPValue:
          'Maximum tolerated unbound plasma concentration twice as high for ropivacaine (P<0.001); bupivacaine widened QRS versus placebo (P<0.001) and versus ropivacaine (P<0.01)',
        unreportedAdverseSignals:
          'Twelve healthy young men infused to the point of definite symptoms. The design deliberately stops short of the cardiac events it is used to reason about, so the cardiotoxicity comparison is an extrapolation from sub-toxic endpoints.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Polley minimum local analgesic concentration study of epidural ropivacaine versus bupivacaine in labour',
        phase: 'Randomised double-blind up-down sequential allocation study',
        sampleSize: 73,
        primaryEndpoint:
          'Median effective local analgesic concentration in 20 mL for first-stage labour epidural analgesia',
        endpointMet: true,
        statisticalPValue:
          'Ropivacaine 0.111% (95% CI 0.100 to 0.122) versus bupivacaine 0.067% (95% CI 0.052 to 0.082); potency ratio 0.6 (95% CI 0.49 to 0.74)',
        unreportedAdverseSignals:
          'The method measures potency for first-stage labour analgesia in a 20 mL epidural volume. Extending the ratio to surgical anaesthesia, to other blocks or to toxicity is an extrapolation the study does not make.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Diastolic recovery from cardiac sodium channel block with a time constant of 1,557 +/- 304 ms, against 153.8 +/- 51.2 ms for lidocaine — the tenfold off-rate difference that defines the molecule',
        'A dissociation constant of 9 x 10^-7 M for the inactivated cardiac channel, with low affinity for the rested and activated states',
        'A maximum tolerated unbound plasma concentration in volunteers half that of ropivacaine, with QRS widening seen only with bupivacaine',
        'A minimum local analgesic concentration of 0.067% for labour epidural analgesia, against 0.111% for ropivacaine',
        'A 1.0 cm.h improvement in 24-to-72-hour pain AUC from the liposomal formulation, against a pre-specified clinical importance threshold of 2.0 cm.h',
      ],
      unsupportedInferences: [
        'That liposomal bupivacaine gives clinically better analgesia than plain bupivacaine in a nerve block — nine trials say the difference is half of what a patient would notice, and none once one industry trial is removed',
        'That wound infiltration with the liposomal formulation is evidence-based — Cochrane could not pool the data at all',
        'That local anaesthetic toxicity gives neurological warning before cardiac collapse, a rule inherited from lidocaine that Albright showed does not hold here',
        'That the ropivacaine safety margin measured at equal milligram doses transfers to equal analgesic doses; the potency ratio of 0.6 says it does not transfer intact',
        'That lipid emulsion rescue is proven in humans — it rests on animal experiments and case reports, and no randomised human trial exists or is likely to',
      ],
      whatFailedInitially: [
        'The 0.75% concentration was removed from obstetric use in the United States after reports of cardiac arrest occurring simultaneously with, rather than after, neurological toxicity',
        'Perineural liposomal bupivacaine failed to reach its pre-specified minimal clinically important difference across nine randomised trials, and lost statistical significance entirely when one industry-sponsored trial was excluded',
        'Every secondary outcome of that meta-analysis — analgesic consumption, time to first request, opioid side effects, satisfaction, length of stay, functional recovery — was negative',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and the default long-acting local anaesthetic in obstetric and orthopaedic practice worldwide',
        'About 8.6 cents per millilitre at United States pharmacy acquisition cost, across 12 listed generic products',
        'Its cardiotoxicity generated an entire subfield: the lipid emulsion rescue protocol, the ultrasound-guided block techniques that reduce intravascular injection, and the aspiration-and-test-dose discipline taught to every trainee',
        'Two enantiomer-based successors, levobupivacaine and ropivacaine, exist solely because of the cardiac risk of the racemate',
      ],
    },
    deliverySystem: {
      type:
        'Sterile injection for infiltration, peripheral nerve block, epidural and caudal use; preservative-free presentations for intrathecal use, some with dextrose for hyperbaric spinal anaesthesia; some presentations co-formulated with epinephrine; a separate patented liposomal suspension for infiltration and interscalene block',
      description:
        'Every presentation is the same molecule and the route decides what it does. Preservative-free formulations exist because methylparaben is not acceptable in the intrathecal or epidural space. Hyperbaric presentations add dextrose so that the solution sinks in cerebrospinal fluid and the block can be positioned by patient posture. Epinephrine-containing presentations slow systemic absorption and also act as an intravascular test: a sudden rise in heart rate after a test dose suggests the needle is in a vessel. The liposomal suspension is a multivesicular lipid particle that releases bupivacaine over roughly 72 hours, and it is a different product with a different price and its own evidence base.',
      safetyProfile:
        'The defining risk is systemic toxicity from inadvertent intravascular injection, and it is more dangerous with this molecule than with any other in routine use because cardiovascular collapse can occur without the usual neurological warning and because the resulting conduction block is slow to reverse. Intravenous lipid emulsion is stocked wherever large-volume blocks are performed for this reason. The 0.75% concentration is not used for obstetric anaesthesia in the United States. Bupivacaine is not for intravenous regional anaesthesia. As with the whole class, the label carries a methaemoglobinaemia warning. None of this is dosing guidance and no dosing guidance appears anywhere on this page.',
    },
    commonQuestions: [
      {
        q: 'Why is this drug more dangerous than lidocaine if it works the same way?',
        a: 'Because of a single measured number: how fast it lets go. Both drugs block the sodium channel during the upstroke of a heartbeat, and both would be harmless if they cleared before the next beat. Lidocaine unbinds from the cardiac channel with a time constant of about 154 milliseconds, comfortably inside the gap between beats. Bupivacaine takes about 1,557 milliseconds, which is longer than the gap at any heart rate between 60 and 150. So with lidocaine the block resets every beat and with bupivacaine it accumulates. That is the whole difference, and it was measured in guinea pig ventricular muscle in 1985, six years after the clinical reports that made someone go looking for it.',
      },
      {
        q: 'Is the expensive slow-release version worth it?',
        a: 'For peripheral nerve blocks the best available evidence says no. A meta-analysis of nine randomised trials in 619 patients set out in advance that a difference of 2.0 cm.h in the area under the 24-to-72-hour pain curve would count as clinically important. Liposomal bupivacaine beat plain bupivacaine by 1.0 cm.h — statistically significant, half the threshold. Remove one industry-sponsored trial and the difference disappears. Nothing else favoured it either: not opioid consumption, not time to first painkiller, not satisfaction, not length of stay, not recovery of function. For wound infiltration the picture is thinner still, because Cochrane found the nine available studies too heterogeneous and too small to pool at all.',
        auditNote:
          'This is the largest evidence-to-price gap on the page. The liposomal product is single-source and patented; the molecule inside it costs about 8.6 cents per millilitre as a plain solution.',
      },
      {
        q: 'Why did they take the strongest concentration away from labour wards?',
        a: 'Because of six case reports and what they implied. Until 1979 the teaching was that local anaesthetic overdose announces itself: ringing ears, metallic taste, twitching, then seizures, and only then cardiac effects. Albright published cases in which cardiac arrest arrived at the same moment as the neurological signs, with no useful warning, and in which resuscitation was unusually difficult. The FDA removed the 0.75% concentration from obstetric use. This is a real change of mind and this page files it as one: the old model was not refined, it was found to be a property of lidocaine that had been assumed to be a property of the class.',
      },
      {
        q: 'Is ropivacaine simply the safer version?',
        a: 'It is safer, and by less than the usual comparison suggests. In 12 volunteers infused with both, the maximum tolerated unbound plasma concentration was twice as high for ropivacaine, and only bupivacaine widened the QRS complex or depressed diastolic function. That is a real measured margin. But those studies infused equal milligram doses, and the two drugs are not equipotent: measured by up-down allocation in 73 labouring women, it took 0.111% ropivacaine to do what 0.067% bupivacaine did, a potency ratio of 0.6. Give the dose that produces the same analgesia rather than the same milligrams and part of the margin is spent. The advantage survives; its size does not survive intact.',
        auditNote:
          'Both halves of this answer are measured. The overreach is in comparing toxicity per milligram between drugs of different potency, which is how the margin gets quoted.',
      },
      {
        q: 'What is the lipid emulsion for?',
        a: 'It is the rescue treatment stocked wherever large regional blocks are done, and its evidence base is honestly described as mechanistic rather than randomised. The reasoning is that bupivacaine is extremely lipid-soluble, so an intravenous bolus of lipid emulsion creates a compartment that pulls drug out of cardiac tissue — a lipid sink — and that it also supplies fatty acid substrate to a myocardium whose energy metabolism the drug has impaired. Animal experiments support it and a large body of human case reports describes recoveries that were not expected. What does not exist, and realistically cannot, is a randomised trial in people having a cardiac arrest from local anaesthetic. This page marks that as an inference and not a measurement.',
      },
      {
        q: 'Why does this page show no manufacturing cost?',
        a: 'Because no per-dose cost-of-production study for bupivacaine could be verified. The cost-of-production literature that was checked publishes a method and aggregate ranges, not a figure for this molecule. What is shown is the CMS National Average Drug Acquisition Cost, about 8.6 cents per millilitre as a median across 12 listed generic products, which is what United States pharmacies pay to buy it and not what it costs to make or what a patient is billed.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Clarkson CW, Hondeghem LM. Mechanism for bupivacaine depression of cardiac conduction. Anesthesiology 1985;62:396-405',
        identifier: '2580463',
        kind: 'pmid',
      },
      {
        label:
          'Albright GA. Cardiac arrest following regional anesthesia with etidocaine or bupivacaine. Anesthesiology 1979;51:285-287',
        identifier: '10.1097/00000542-197910000-00001',
        kind: 'doi',
      },
      {
        label:
          'Hussain N, Brull R, Sheehy B, Essandoh MK, Stahl DL, Weaver TE, Abdallah FW. Perineural liposomal bupivacaine is not superior to nonliposomal bupivacaine for peripheral nerve block analgesia. Anesthesiology 2021;134:147-164',
        identifier: '10.1097/ALN.0000000000003651',
        kind: 'doi',
      },
      {
        label:
          'Hamilton TW, Athanassoglou V, Mellon S, et al. Liposomal bupivacaine infiltration at the surgical site for the management of postoperative pain. Cochrane Database Syst Rev 2017;2:CD011419',
        identifier: '10.1002/14651858.CD011419.pub2',
        kind: 'doi',
      },
      {
        label:
          'Knudsen K, Beckman Suurkula M, Blomberg S, Sjovall J, Edvardsson N. Central nervous and cardiovascular effects of i.v. infusions of ropivacaine, bupivacaine and placebo in volunteers. Br J Anaesth 1997;78:507-514',
        identifier: '10.1093/bja/78.5.507',
        kind: 'doi',
      },
      {
        label:
          'Polley LS, Columb MO, Naughton NN, Wagner DS, van de Ven CJ. Relative analgesic potencies of ropivacaine and bupivacaine for epidural analgesia in labor. Anesthesiology 1999;90:944-950',
        identifier: '10.1097/00000542-199904000-00003',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 2474 — bupivacaine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2474',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Ropivacaine — a molecule designed backwards from a safety problem, which solved part of it
  //    and bought the rest by being weaker.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ropivacaine',
    name: 'Ropivacaine',
    tradeName: 'Naropin',
    sponsor:
      'Fresenius Kabi USA (current US label holder); developed at Astra AB as the single S-enantiomer of the propyl homologue of bupivacaine and first approved in the United States in 1996',
    targetGene: 'SCN5A, SCN9A, SCN10A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits — Nav1.7 and Nav1.8 in peripheral sensory neurons, Nav1.5 in cardiac ventricular myocytes — bound at the local anaesthetic receptor in the inner pore lined by segment S6 of domain IV',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Production of local or regional anaesthesia for surgery — epidural block including caesarean section, major nerve block, local infiltration — and acute pain management by continuous epidural infusion or intermittent bolus, in adults',
    patientFriendlyIndication:
      'Numbing an area for surgery or childbirth, chosen when the drug will be given in large volumes and an accident would matter most',
    anatomicalSite:
      'Inner pore of the sodium channel, in peripheral nerve axons and cardiac ventricular myocytes',
    conditionContext: {
      conditionExplainer:
        'Bupivacaine is sold as a racemate — an even mixture of two mirror-image molecules — and most of its cardiac toxicity lives in one of the two mirrors. Ropivacaine was made by taking the safer mirror image and shortening the side chain from four carbons to three. It is the rare case of a drug designed backwards from a known harm rather than forwards from a target.',
      whyItMatters:
        'The dose of local anaesthetic that goes into an epidural or a major nerve block is large enough that an accidental intravascular injection is a resuscitation event. Every argument for ropivacaine is an argument about that accident and not about how well the block works.',
      whoTakesThis:
        'People having epidural analgesia in labour, caesarean sections under epidural, major peripheral nerve blocks for limb surgery, and continuous infusions for postoperative pain.',
      clinicalGoals:
        'The same block as bupivacaine with a wider margin before cardiac effects. Whether the wider margin translates into fewer deaths has never been measured and, given how rare the event is, is unlikely ever to be.',
    },
    oneSentenceVerdict:
      'The safer mirror-image of bupivacaine with one carbon removed: volunteers tolerate roughly twice the unbound plasma concentration before symptoms appear and it does not widen the QRS complex where bupivacaine does, but it is also measurably weaker — a minimum local analgesic concentration of 0.111% against bupivacaine\'s 0.067%, a potency ratio of 0.6 — so a milligram-for-milligram safety comparison overstates the advantage.',
    laymanHowItWorks:
      'Ropivacaine blocks the same sodium gates in nerves that bupivacaine blocks, from the same place inside the channel. Two things were changed on purpose. Only one of the two mirror-image forms is present, and it is the form that troubles the heart less. And the side chain is one carbon shorter, which makes the molecule less greasy, so less of it partitions into heart muscle and it washes out faster. The block is a little weaker as a result, which is the price of the design.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    substitutes: {
      summary:
        'The comparison that matters is against racemic bupivacaine, and it is genuinely two-sided: ropivacaine is measurably less toxic per milligram and measurably less potent per milligram, and how much net safety survives that trade is still argued. Levobupivacaine occupies the middle ground and is not marketed in the United States. There is no dietary or home substitute for a nerve block and none is offered here.',
      conventionalRx: [
        {
          name: 'Bupivacaine (Marcaine, Sensorcaine)',
          class: 'Long-acting amide local anaesthetic, racemic',
          howItCompares:
            'More potent by a measured factor: 0.067% against 0.111% for the same labour epidural effect. Also the drug that unbinds from the cardiac sodium channel with a time constant of 1,557 ms against lidocaine\'s 154, which is the property ropivacaine was built to avoid.',
          typicalCost:
            'US$0.0860 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed products, effective 22 April 2026)',
          prosAndCons:
            'Pros: stronger per milligram, cheaper, longer established. Cons: the cardiotoxicity that motivated an entire replacement programme.',
        },
        {
          name: 'Levobupivacaine (Chirocaine)',
          class: 'The S-enantiomer of bupivacaine',
          howItCompares:
            'Keeps bupivacaine\'s four-carbon chain and discards the more cardiotoxic R-enantiomer, so it sits between the two on both potency and toxicity. By the same up-down potency method, ropivacaine was less potent than levobupivacaine with a potency ratio of 0.83.',
          typicalCost: 'Not marketed in the United States; no NADAC value exists',
          prosAndCons:
            'Pros: the enantiomer benefit without the potency loss. Cons: commercially unavailable in the largest market, which is why the American argument is only ever ropivacaine against the racemate.',
        },
        {
          name: 'Lidocaine (Xylocaine)',
          class: 'Intermediate-acting amide local anaesthetic',
          howItCompares:
            'The most forgiving molecule in the class if it reaches the circulation, and the shortest acting. Where the concern is an accidental intravascular dose rather than block duration, lidocaine remains the safest choice of all three.',
          typicalCost:
            'US$0.3221 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 161 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: fastest unbinding from the cardiac channel, so block does not accumulate beat to beat. Cons: about an hour of anaesthesia, not eight.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report the first strange sensation immediately',
          action:
            'Tinnitus, a metallic taste, perioral numbness or sudden light-headedness during an epidural top-up or a large block are the earliest signs that drug has entered the circulation.',
          patientImpact:
            'Ropivacaine\'s advantage is precisely that these symptoms appear at a plasma concentration further below the cardiac one than bupivacaine\'s do. That margin is only useful if someone says something.',
          clinicalPrecaution:
            'A reporting instruction, not a treatment. Systemic toxicity is managed by the clinical team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCN1CCCC[C@H]1C(=O)NC2=C(C=CC=C2C)C',
      chemicalFormula: 'C17H26N2O',
      molecularWeight: '274.40 g/mol (free base); dispensed as ropivacaine hydrochloride monohydrate',
      targetReceptorAffinity:
        'The clinically meaningful affinity number for this molecule is a human one rather than a channel one. In 12 volunteers infused at 10 mg per minute in randomised crossover, the maximum tolerated unbound arterial plasma concentration was twice as high for ropivacaine as for bupivacaine (P<0.001), with an apparent central nervous system toxicity threshold near 0.6 mg/L free ropivacaine against 0.3 mg/L free bupivacaine. Ropivacaine is also more highly protein bound in plasma than its lower lipid solubility alone would suggest, which further limits the free fraction available to the heart.',
      structureSource: {
        label:
          'PubChem CID 175805 (ropivacaine) — canonical SMILES with the S configuration, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/175805',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rop-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric purity of the pipecolic acid starting material',
          description:
            'Ropivacaine is not a racemate and the specification exists to keep it that way. Establish the enantiomeric excess of the S-pipecolic acid before it goes anywhere near the aniline, because the entire safety argument for the product rests on the R-enantiomer being absent rather than merely being a minority.',
          reagentsAndBuffer:
            'S-(-)-pipecolic acid reference standard, chiral HPLC on an amylose tris(3,5-dimethylphenylcarbamate) column with hexane and isopropanol, polarimetry, 2,6-dimethylaniline reference standard by gas chromatography',
        },
        {
          id: 'rop-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Stereoretentive amide coupling to the xylidide',
          description:
            'Couple the protected S-pipecolic acid to 2,6-dimethylaniline under conditions that do not epimerise the alpha carbon. Racemisation at this step is the failure mode that silently converts the product back into something closer to bupivacaine, and it is invisible to every assay except the chiral one.',
          dependsOnStepId: 'rop-w1',
          reagentsAndBuffer:
            'N-protected S-pipecolic acid, 2,6-dimethylaniline, coupling agent with an additive to suppress epimerisation, dichloromethane at low temperature, nitrogen blanket',
        },
        {
          id: 'rop-w3',
          stepNumber: 3,
          phase: 'Synthesis',
          name: 'N-propylation — the one-carbon decision',
          description:
            'Alkylate the ring nitrogen with a propyl rather than a butyl group. That single missing carbon is the difference between ropivacaine and levobupivacaine: it lowers lipid solubility, lowers cardiac partitioning, lowers potency and shortens duration, all in the same direction and all by design.',
          dependsOnStepId: 'rop-w2',
          reagentsAndBuffer:
            '1-bromopropane or propyl iodide, potassium carbonate, acetonitrile or dimethylformamide at reflux, catalytic potassium iodide',
        },
        {
          id: 'rop-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Hydrochloride monohydrate crystallisation with chiral release testing',
          description:
            'Crystallise the hydrochloride monohydrate and release the batch against both the achiral related-substances limit and a chiral limit for the R-enantiomer. Preservative-free presentation is the only presentation, because the epidural and major-block routes are the whole market.',
          dependsOnStepId: 'rop-w3',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, purified water, chiral HPLC for R-enantiomer content, reversed-phase HPLC with phosphate buffer and acetonitrile for related substances, UV detection at 210 nm',
        },
        {
          id: 'rop-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Paired cardiac and neuronal preparations, same day, same batch',
          description:
            'The claim being tested is a ratio, not an absolute, so both halves must come from the same material under the same conditions. Apply drug to ventricular myocytes and to a sensory-neuron sodium channel preparation in parallel, with bupivacaine run alongside as the comparator rather than quoted from a previous paper.',
          dependsOnStepId: 'rop-w4',
          reagentsAndBuffer:
            'Isolated ventricular myocytes and HEK293 cells expressing SCN9A, Tyrode solution at 37 degrees C, whole-cell patch clamp, matched bupivacaine comparator at identical molar concentration',
        },
        {
          id: 'rop-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Normalise toxicity to potency before reporting a ratio',
          description:
            'Report the cardiac endpoint per unit of analgesic effect and not per milligram. This is the step the historical literature skipped: the volunteer studies that established ropivacaine\'s reputation infused equal milligram doses of two drugs later measured to differ in potency by a factor near 0.6, and a therapeutic index is the only honest way to state the result.',
          dependsOnStepId: 'rop-w5',
          reagentsAndBuffer:
            'Half-maximal blocking concentrations fitted per state and per tissue, minimum local analgesic concentration data from up-down sequential allocation as the potency denominator, confidence intervals propagated through the ratio',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rop-a1',
        category: 'measured',
        title: 'Volunteers tolerate twice the free plasma concentration before symptoms',
        laymanSummary:
          'Twelve healthy men were infused with each drug on separate days and told to stop the infusion when they first felt definite symptoms. They could take about twice as much unbound ropivacaine in the blood as unbound bupivacaine, and only bupivacaine distorted their ECG.',
        technicalDetails:
          'Knudsen and colleagues ran a randomised double-blind crossover of ropivacaine, bupivacaine and placebo infused at 10 mg per minute in 12 volunteers previously familiarised with lignocaine\'s central effects. The maximum tolerated dose was higher on ropivacaine in nine of 12 subjects, with 95% confidence limits on the mean difference of -30 to 7 mg — a difference in dose that did not itself reach significance. The maximum tolerated unbound arterial plasma concentration, which is the pharmacologically meaningful quantity, was twice as high for ropivacaine (P<0.001), with thresholds near 0.6 and 0.3 mg/L free drug respectively. Muscular twitching was more frequent after bupivacaine (P<0.05) and symptoms resolved faster after ropivacaine (P<0.05). Bupivacaine widened QRS against placebo (P<0.001) and against ropivacaine (P<0.01), and depressed both systolic and diastolic left ventricular function; ropivacaine depressed systolic function only.',
        evidenceSource:
          'Knudsen K, Beckman Suurkula M, Blomberg S, Sjovall J, Edvardsson N. Br J Anaesth 1997;78:507-514',
        doi: '10.1093/bja/78.5.507',
        measuredMetric:
          'Maximum tolerated unbound arterial plasma concentration, QRS width and echocardiographic ventricular function during controlled intravenous infusion',
        auditFlag: 'verified',
      },
      {
        id: 'rop-a2',
        category: 'measured',
        title: 'The original 1989 tolerance study: at least 25% less toxic by tolerated dose',
        laymanSummary:
          'The first human comparison, eight years earlier, used the same design and found volunteers could take at least a quarter more ropivacaine before symptoms, with conduction and contractility effects appearing later and at lower plasma levels for bupivacaine.',
        technicalDetails:
          'Scott and colleagues infused ropivacaine and bupivacaine at 10 mg per minute to a maximum of 150 mg in 12 healthy men, randomised, double-blind, at least seven days apart, with a preliminary lidocaine injection to familiarise subjects with the symptoms. Ropivacaine caused fewer central nervous system symptoms and was at least 25% less toxic in terms of the dose tolerated. Both drugs raised heart rate and arterial pressure and reduced stroke volume and ejection fraction with no change in cardiac output, but depression of conductivity and contractility appeared at lower doses and lower plasma concentrations with bupivacaine. This study is where the ropivacaine safety claim originates, and it is an equal-milligram comparison, which is the point audited below.',
        evidenceSource: 'Scott DB, Lee A, Fagan D, Bowler GM, Bloomfield P, Lundh R. Anesth Analg 1989;69:563-569 (PMID 2679230)',
        measuredMetric:
          'Maximum tolerated intravenous dose to first definite central nervous system symptoms, with electrocardiographic and echocardiographic change',
        auditFlag: 'verified',
      },
      {
        id: 'rop-a3',
        category: 'inferred',
        title: 'A measured potency ratio of 0.6 eats into the safety margin as usually quoted',
        laymanSummary:
          'The safety studies gave both drugs by the milligram. But it takes about 1.7 times as much ropivacaine to produce the same pain relief, so comparing equal milligrams compares unequal blocks and flatters the newer drug.',
        technicalDetails:
          'Polley and colleagues determined minimum local analgesic concentration by up-down sequential allocation in 73 labouring women at 7 cm dilation or less, using 20 mL epidural test solutions and a visual analogue score of 10 mm or less within 30 minutes as the definition of effect. Ropivacaine\'s minimum local analgesic concentration was 0.111% weight/volume (95% CI 0.100 to 0.122) against bupivacaine\'s 0.067% (95% CI 0.052 to 0.082), a potency ratio of 0.6 (95% CI 0.49 to 0.74). Against levobupivacaine by the same method the ratio was 0.83. The correct comparison for a safety claim is a therapeutic index — toxic concentration divided by effective concentration — and the equal-milligram volunteer studies do not supply one. This audit does not say the advantage is imaginary: Knudsen measured a genuine twofold difference in tolerated free concentration. It says the advantage is smaller than the raw dose comparison implies, and that the difference between those two statements is the single most common overreach in this drug\'s literature.',
        evidenceSource:
          'Polley LS, Columb MO, Naughton NN, Wagner DS, van de Ven CJ. Anesthesiology 1999;90:944-950',
        doi: '10.1097/00000542-199904000-00003',
        inferredClaim:
          'That the milligram-for-milligram toxicity difference measured in volunteers is the safety advantage available in clinical use, when the two drugs differ in analgesic potency by a measured factor of 0.6',
        auditFlag: 'contested',
      },
      {
        id: 'rop-a4',
        category: 'failed',
        title: 'The motor-sparing claim did not survive an equipotent comparison',
        laymanSummary:
          'Ropivacaine is widely described as blocking pain while leaving muscle power alone. In the study that compared the two drugs at the concentrations that give equal pain relief, there was no difference in motor effects.',
        technicalDetails:
          'The differential-block claim originates in comparisons at equal concentrations, where ropivacaine, being less potent, produces less of every effect including motor block. Polley\'s up-down study reported explicitly that no difference in motor effects was observed between the groups when each drug was given at its own minimum local analgesic concentration. The mechanistic story usually attached to the claim — that lower lipid solubility spares large myelinated motor fibres preferentially — is a plausible account of a difference that the equipotent comparison did not find. Differential block between sensory and motor fibres is real and concentration-dependent for every drug in this class; that it is greater for ropivacaine than for bupivacaine at equal effect is the part that failed.',
        evidenceSource:
          'Polley LS, Columb MO, Naughton NN, Wagner DS, van de Ven CJ. Anesthesiology 1999;90:944-950',
        doi: '10.1097/00000542-199904000-00003',
        inferredClaim:
          'That ropivacaine has an intrinsic motor-sparing property beyond what its lower potency explains',
        auditFlag: 'caution',
      },
      {
        id: 'rop-a5',
        category: 'failed',
        title: 'Safer is not safe: cardiac arrest after a ropivacaine nerve block is on record',
        laymanSummary:
          'The drug was designed to make cardiac arrest from local anaesthetic less likely. It has still happened, been published, and been resuscitated from.',
        technicalDetails:
          'Chazalon and colleagues reported cardiac arrest following a peripheral nerve block with ropivacaine, with successful resuscitation, in Anesthesiology in 2003. A single case report is not an incidence and this page does not present it as one. It is included because the ropivacaine literature is dominated by margin-of-safety measurements in healthy volunteers stopped well short of a cardiac endpoint, and a reader is entitled to know that the endpoint those measurements are used to reason about has occurred in practice. The design goal was to widen a margin, not to remove a risk, and the drug did what it was designed to do rather than what it is sometimes described as doing.',
        evidenceSource:
          'Chazalon P, Tourtier JP, Villevielle T, et al. Ropivacaine-induced cardiac arrest after peripheral nerve block: successful resuscitation. Anesthesiology 2003;99:1449-1451',
        doi: '10.1097/00000542-200312000-00030',
        auditFlag: 'caution',
      },
      {
        id: 'rop-a6',
        category: 'measured',
        title:
          'Epidural ropivacaine cut delirium by two thirds in 1,720 older patients — and caused 50% more hypotension',
        laymanSummary:
          'Adding an epidural of ropivacaine to a general anaesthetic in older people having major surgery reduced confusion afterwards from five percent to under two. The same trial found half again as many episodes of dangerously low blood pressure during the operation.',
        technicalDetails:
          'Li and colleagues randomised 1,802 patients aged 60 to 90 having major non-cardiac thoracic or abdominal surgery expected to last two hours or more, 1:1, to combined epidural-general anaesthesia with 0.375% to 0.5% epidural ropivacaine and postoperative patient-controlled epidural analgesia, or to general anaesthesia with intravenous morphine analgesia. Of these, 1,720 completed and were analysed by intention to treat. Delirium, assessed twice daily for seven days with the Confusion Assessment Method for the Intensive Care Unit, occurred in 15 of 857 (1.8%) in the epidural group against 43 of 863 (5.0%) in the general anaesthesia group — relative risk 0.351, 95% CI 0.197 to 0.627, P<0.001, number needed to treat 31. In the same patients, intraoperative systolic pressure below 80 mmHg occurred in 421 (49%) versus 288 (33%) — relative risk 1.47, 95% CI 1.31 to 1.65, P<0.001 — and more epidural patients received vasopressors, 495 (58%) versus 387 (45%), relative risk 1.29, 95% CI 1.17 to 1.41, P<0.001. This is a rare thing on this file: a genuine patient-relevant benefit for a local anaesthetic, reported alongside its cost in the same population.',
        evidenceSource:
          'Li YW, Li HJ, Li HJ, et al. Delirium in older patients after combined epidural-general anesthesia or general anesthesia for major surgery: a randomized trial. Anesthesiology 2021;135:218-232 (NCT01661907)',
        doi: '10.1097/ALN.0000000000003834',
        measuredMetric:
          'Incidence of delirium in the first seven postoperative days, and incidence of intraoperative systolic pressure below 80 mmHg',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected into the epidural space or around a major nerve',
        laymanDesc:
          'This drug is chosen where the volume is large — an epidural, a whole limb\'s nerve supply — because that is where an accident would matter most.',
        molecularDetail:
          'Lower lipid solubility than bupivacaine means less sequestration in local fat and a slightly shorter block, and it means less partitioning into myocardium if the drug reaches the circulation. Ropivacaine also produces vasoconstriction at low concentrations in some vascular beds, which slows its own systemic absorption and is one of the few pharmacological differences that works in its favour without a potency caveat.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The uncharged fraction crosses the axon membrane',
        laymanDesc:
          'Only the electrically neutral form gets through the fatty sheath. Inside the nerve it picks up a proton, and the charged form does the blocking.',
        molecularDetail:
          'The pKa near 8.1 is essentially identical to bupivacaine\'s, so the neutral fraction available at physiological pH is the same and onset time is similar. The difference between the two molecules is not in getting in; it is in how much is available in plasma to reach other tissues, where ropivacaine\'s higher protein binding and lower partition coefficient both reduce the free fraction.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Only one mirror image is present, and it is the gentler one',
        laymanDesc:
          'Bupivacaine is a half-and-half mixture of two mirror-image molecules and one of them accounts for most of the heart trouble. Ropivacaine ships only the other kind.',
        molecularDetail:
          'The sodium channel is itself chiral, so the two enantiomers bind the cardiac channel with different affinity and different off-rates while blocking neuronal conduction comparably. Ropivacaine is manufactured and released as the S-enantiomer with a chiral specification, and enantiomeric purity is a release test rather than a nice-to-have.',
        iconName: 'FlipHorizontal',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'One fewer carbon means less of it reaches the heart',
        laymanDesc:
          'The side chain is three carbons instead of four. That small change makes the molecule less greasy, so less of it dissolves into heart muscle and more of it stays bound to proteins in the blood.',
        molecularDetail:
          'Reduced lipid solubility lowers myocardial partitioning and speeds unbinding from the cardiac sodium channel relative to bupivacaine. The measured consequence in volunteers is a maximum tolerated unbound plasma concentration twice as high, with no QRS widening at doses where bupivacaine widens it. The same reduction in lipid solubility is why the drug is less potent, and the two effects cannot be separated because they have the same cause.',
        iconName: 'Scale',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Conduction fails in the target nerve for four to eight hours',
        laymanDesc:
          'The nerve goes quiet in the usual order — pain first, then temperature, then touch, then position sense, then muscle power — and comes back in reverse.',
        molecularDetail:
          'Block is state-dependent and accumulates in fibres that are firing, so small unmyelinated C and small myelinated A-delta fibres are affected at lower concentrations than large A-beta and A-alpha fibres. At equal analgesic effect, Polley found no measurable difference in motor block between ropivacaine and bupivacaine; differential block is a concentration phenomenon common to the class rather than a property unique to this molecule.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Cleared by the liver, faster than its predecessor',
        laymanDesc:
          'The liver breaks it down and it leaves. Because less of it hides in fat and muscle, the concentration in the blood falls more predictably during a long infusion.',
        molecularDetail:
          'Elimination is hepatic, principally by CYP1A2 to 3-hydroxyropivacaine with a smaller CYP3A4 route to the N-dealkylated metabolite, which matters because CYP1A2 inhibition by fluvoxamine substantially reduces clearance. Systemic clearance and terminal half-life are more favourable than bupivacaine\'s for continuous infusion, which is part of why the drug is preferred where an epidural will run for days rather than hours.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Li randomised trial of combined epidural-general anaesthesia versus general anaesthesia in older patients (NCT01661907)',
        phase: 'Randomised open-label controlled trial',
        sampleSize: 1802,
        primaryEndpoint:
          'Incidence of delirium in the first seven postoperative days, assessed twice daily by the Confusion Assessment Method for the Intensive Care Unit',
        endpointMet: true,
        statisticalPValue:
          'Delirium 1.8% (15/857) versus 5.0% (43/863); relative risk 0.351, 95% CI 0.197 to 0.627, P<0.001, number needed to treat 31',
        unreportedAdverseSignals:
          'Reported, and important: intraoperative systolic pressure below 80 mmHg in 49% versus 33% (relative risk 1.47, 95% CI 1.31 to 1.65, P<0.001) and vasopressor use in 58% versus 45%. The benefit and the harm are in the same paper and the same patients.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Knudsen volunteer crossover of intravenous ropivacaine, bupivacaine and placebo',
        phase: 'Randomised double-blind three-way crossover in volunteers',
        sampleSize: 12,
        primaryEndpoint:
          'Maximum tolerated dose and unbound plasma concentration for central nervous system symptoms, with echocardiographic and electrophysiological change',
        endpointMet: true,
        statisticalPValue:
          'Maximum tolerated unbound plasma concentration twice as high for ropivacaine (P<0.001); QRS widened by bupivacaine versus placebo (P<0.001) and versus ropivacaine (P<0.01)',
        unreportedAdverseSignals:
          'The dose difference itself did not reach significance: 95% confidence limits on the mean difference in maximum tolerated dose were -30 to 7 mg. The unbound concentration difference did.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Scott volunteer comparison of acute toxicity of ropivacaine and bupivacaine',
        phase: 'Randomised double-blind crossover in volunteers',
        sampleSize: 12,
        primaryEndpoint:
          'Maximum tolerated intravenous dose to first definite central nervous system symptoms, with conduction and contractility measures',
        endpointMet: true,
        statisticalPValue:
          'Ropivacaine at least 25% less toxic by tolerated dose; conduction and contractility depression appeared at lower dose and lower plasma concentration with bupivacaine',
        unreportedAdverseSignals:
          'Twelve healthy men, infusion capped at 150 mg, endpoint defined as definite but not severe symptoms. The study is deliberately incapable of observing the cardiac events its result is used to reason about.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Polley minimum local analgesic concentration study of epidural ropivacaine versus bupivacaine in labour',
        phase: 'Randomised double-blind up-down sequential allocation study',
        sampleSize: 73,
        primaryEndpoint:
          'Median effective local analgesic concentration in 20 mL for first-stage labour epidural analgesia',
        endpointMet: true,
        statisticalPValue:
          'Ropivacaine 0.111% (95% CI 0.100 to 0.122) versus bupivacaine 0.067% (95% CI 0.052 to 0.082); potency ratio 0.6 (95% CI 0.49 to 0.74)',
        unreportedAdverseSignals:
          'No difference in motor effects was observed at equipotent concentrations, which contradicts the differential-block marketing claim rather than supporting it.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A maximum tolerated unbound arterial plasma concentration twice that of bupivacaine in a 12-subject randomised crossover (P<0.001)',
        'No QRS widening at doses where bupivacaine widens it, and depression of systolic but not diastolic left ventricular function',
        'At least 25% less toxic than bupivacaine by tolerated intravenous dose in the original 1989 volunteer study',
        'A minimum local analgesic concentration of 0.111% against bupivacaine\'s 0.067% — a potency ratio of 0.6 (95% CI 0.49 to 0.74)',
        'Delirium in 1.8% versus 5.0% when epidural ropivacaine was added to general anaesthesia in 1,720 older surgical patients, alongside 49% versus 33% intraoperative hypotension',
      ],
      unsupportedInferences: [
        'That the milligram-for-milligram toxicity advantage is the advantage available clinically — the potency ratio of 0.6 says a substantial part of it is spent buying equal analgesia',
        'That ropivacaine spares motor function beyond what its lower potency explains — no difference in motor effects at equipotent concentrations',
        'That a wider margin in healthy volunteers translates into fewer cardiac arrests in practice; the event is far too rare for any trial to have measured it, and cardiac arrest with ropivacaine is on record',
        'That the delirium benefit of a combined epidural technique is a property of ropivacaine rather than of epidural analgesia, of lower opioid exposure, or of the blunted stress response',
      ],
      whatFailedInitially: [
        'The differential motor-sparing claim, when tested at equipotent rather than equal concentrations',
        'The implication that the molecule removes rather than widens the risk of local anaesthetic cardiac arrest, contradicted by published resuscitated cases',
        'Levobupivacaine, the rival enantiomer product that would have made the potency argument moot, was withdrawn from the United States market for commercial rather than scientific reasons',
      ],
      realWorldOutcome: [
        'The default local anaesthetic for continuous epidural infusion and large-volume peripheral blocks in much of the world',
        'No CMS National Average Drug Acquisition Cost value is held on this record for ropivacaine, so no United States acquisition price is stated here',
        'Its arrival, together with levobupivacaine, converted a class-wide safety problem into a product-choice question, which is a real change in practice even where the size of the benefit is argued',
      ],
    },
    deliverySystem: {
      type:
        'Preservative-free sterile solution for epidural, caudal, major peripheral nerve block and infiltration use, in single-dose ampoules, single-dose vials and ready-to-use infusion bags',
      description:
        'Every presentation is preservative-free because the principal routes are epidural and major nerve block, where preservatives are unacceptable. Infusion bags exist because continuous epidural infusion over days is the use case ropivacaine was best suited to, and drawing repeated syringes from ampoules for a multi-day infusion is an error source. Unlike lidocaine and bupivacaine, ropivacaine is not routinely co-formulated with epinephrine, partly because it has intrinsic vasoconstrictor activity at clinical concentrations.',
      safetyProfile:
        'The same class risks apply and the argument for the drug is that they apply at higher plasma concentrations. Inadvertent intravascular or intrathecal injection can cause seizures, cardiovascular collapse and total spinal anaesthesia. Cardiac arrest after ropivacaine nerve block has been reported and successfully resuscitated. The class methaemoglobinaemia warning applies. Continuous epidural technique carries its own hazards independent of the drug — the trial that showed a delirium benefit also showed 50% more intraoperative hypotension and more vasopressor use. Nothing on this page is dosing or technique guidance.',
    },
    commonQuestions: [
      {
        q: 'Is ropivacaine actually safer than bupivacaine?',
        a: 'Yes, and by less than it is usually said to be. Two volunteer crossover studies, in 1989 and 1997, measured a real difference: subjects tolerated at least a quarter more milligrams and about twice the unbound plasma concentration before symptoms, and only bupivacaine widened the QRS complex or depressed diastolic ventricular function. Both studies infused equal milligram doses. In 1999 an up-down study in 73 labouring women measured what those equal milligrams actually do, and found ropivacaine needs a concentration of 0.111% to match bupivacaine at 0.067% — a potency ratio of 0.6. So part of the safety margin is the price of a weaker drug. The honest summary is that the therapeutic index is better and the ratio is not the one the raw dose figures suggest.',
        auditNote:
          'Both the safety measurement and the potency measurement are solid. The overreach lives in the comparison between them, which is almost never made explicitly.',
      },
      {
        q: 'Does it really let you walk during a labour epidural when bupivacaine does not?',
        a: 'Not because of anything intrinsic to the molecule. Differential block — pain going before muscle power — happens with every drug in this class and depends mainly on concentration. Because ropivacaine is weaker, a solution of a given percentage produces less of everything including motor block, which is where the impression comes from. The study that compared the two at concentrations giving equal pain relief reported explicitly that no difference in motor effects was observed. Walking epidurals are a consequence of using dilute solutions with an opioid, and both drugs can be used that way.',
        auditNote:
          'Filed as a failed claim rather than an unproven one, because the equipotent comparison was done and did not find the difference.',
      },
      {
        q: 'Why is there no price on this page when other pages have one?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey holds no value for ropivacaine on this record. The survey covers what United States retail pharmacies pay, and a drug used almost entirely inside hospitals and operating theatres may not appear in it. Rather than substitute a wholesale list price, an international figure or an estimate, this page shows nothing. A missing number is honest; a manufactured one is not.',
      },
      {
        q: 'The epidural trial found less delirium. Is that a reason to have one?',
        a: 'It is a real, large, randomised result and it is worth stating exactly. In 1,720 patients aged 60 to 90 having major thoracic or abdominal surgery, adding an epidural of ropivacaine to general anaesthesia reduced delirium in the first week from 5.0% to 1.8%, a relative risk of 0.351 and a number needed to treat of 31. The same trial found intraoperative systolic pressure below 80 mmHg in 49% of the epidural group against 33%, and more vasopressor use. The authors\' own conclusion was to consider the combination in patients at risk of delirium and avoid it in patients at risk of hypotension. It is also worth noting what the trial does not establish: whether the benefit belongs to ropivacaine specifically, to epidural analgesia generally, or to the reduced opioid exposure that came with it.',
      },
      {
        q: 'What does the S in S-enantiomer actually change?',
        a: 'The sodium channel is a protein, and proteins are chiral, so two mirror-image drug molecules do not fit the same site equally. For the bupivacaine pair, the R-enantiomer binds the cardiac channel more tightly and leaves it more slowly than the S-enantiomer, while both block nerve conduction comparably. Racemic bupivacaine is half R by design and by accident of 1957 manufacturing. Ropivacaine is made and released as pure S, with enantiomeric purity as a batch release test, and its propyl side chain makes it less lipid-soluble than the S-enantiomer of bupivacaine as well. Two changes, one deliberate stereochemical and one deliberate structural, both aimed at the same measured problem.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Knudsen K, Beckman Suurkula M, Blomberg S, Sjovall J, Edvardsson N. Central nervous and cardiovascular effects of i.v. infusions of ropivacaine, bupivacaine and placebo in volunteers. Br J Anaesth 1997;78:507-514',
        identifier: '10.1093/bja/78.5.507',
        kind: 'doi',
      },
      {
        label:
          'Scott DB, Lee A, Fagan D, Bowler GM, Bloomfield P, Lundh R. Acute toxicity of ropivacaine compared with that of bupivacaine. Anesth Analg 1989;69:563-569',
        identifier: '2679230',
        kind: 'pmid',
      },
      {
        label:
          'Polley LS, Columb MO, Naughton NN, Wagner DS, van de Ven CJ. Relative analgesic potencies of ropivacaine and bupivacaine for epidural analgesia in labor: implications for therapeutic indexes. Anesthesiology 1999;90:944-950',
        identifier: '10.1097/00000542-199904000-00003',
        kind: 'doi',
      },
      {
        label:
          'Polley LS, Columb MO, Naughton NN, Wagner DS, van de Ven CJ, Goralski KH. Relative analgesic potencies of levobupivacaine and ropivacaine for epidural analgesia in labor. Anesthesiology 2003;99:1354-1358',
        identifier: '10.1097/00000542-200312000-00017',
        kind: 'doi',
      },
      {
        label:
          'Chazalon P, Tourtier JP, Villevielle T, et al. Ropivacaine-induced cardiac arrest after peripheral nerve block: successful resuscitation. Anesthesiology 2003;99:1449-1451',
        identifier: '10.1097/00000542-200312000-00030',
        kind: 'doi',
      },
      {
        label:
          'Li YW, Li HJ, Li HJ, et al. Delirium in older patients after combined epidural-general anesthesia or general anesthesia for major surgery: a randomized trial. Anesthesiology 2021;135:218-232',
        identifier: '10.1097/ALN.0000000000003834',
        kind: 'doi',
      },
      {
        label:
          'NCT01661907 — Effects of two different anaesthesia-analgesia methods on incidence of postoperative delirium in elderly patients undergoing major thoracic and abdominal surgery',
        identifier: 'NCT01661907',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 175805 — ropivacaine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/175805',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
