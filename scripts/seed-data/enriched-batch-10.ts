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
        title:
          'The receptor site is a single pore-lining phenylalanine, and mutating it away works',
        laymanSummary:
          'Researchers changed one amino acid deep inside the sodium channel and local anaesthetics almost stopped working on it. That is the cleanest evidence there is that the drug acts where it is said to act.',
        technicalDetails:
          'Ragsdale, McPhee, Scheuer and Catterall made site-directed mutations in transmembrane segment S6 of domain IV of the rat brain sodium channel alpha subunit and expressed them in Xenopus oocytes. Mutation F1764A, near the middle of the segment, reduced affinity of the open and inactivated channel to 1% of wild type and almost completely abolished both the use-dependence and the voltage-dependence of block. N1769A increased resting-state affinity 15-fold. I1760A opened an access route for drug to reach the site from outside the cell. Together the three mutations locate the local anaesthetic receptor inside the channel pore and identify the residues that make binding state-dependent.',
        evidenceSource:
          'Ragsdale DS, McPhee JC, Scheuer T, Catterall WA. Science 1994;265:1724-1728',
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
        title:
          'Prophylactic lidocaine after a heart attack cut arrhythmias and may have killed people',
        laymanSummary:
          'For years, anyone with a suspected heart attack got lidocaine to prevent a dangerous rhythm. Pooling fourteen trials found it did prevent the rhythm, and that the people given it died slightly more often. The practice was abandoned.',
        technicalDetails:
          'MacMahon, Collins, Peto, Koster and Yusuf pooled 14 randomised trials of prophylactic lidocaine in suspected acute myocardial infarction: 6,961 patients in the intramuscular trials followed for one to four hours and 2,194 in the intravenous trials followed for 24 to 48 hours, with 103 cases of ventricular fibrillation and 137 deaths in total. Allocation to lidocaine reduced the odds of ventricular fibrillation by about one third (95% CI 3% to 56% reduction). Odds of early death were about one third greater on lidocaine, not statistically significant (95% CI 2% reduction to 95% increase). The authors were explicit that the pooled data could not settle whether the drug was helpful or harmful. That an intervention can suppress the surrogate it was aimed at while trending the wrong way on death is the reason this class of reasoning is audited here at all.',
        evidenceSource:
          'MacMahon S, Collins R, Peto R, Koster RW, Yusuf S. JAMA 1988;260:1910-1916',
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
          "Derry, Wiffen, Moore and Quinlan reviewed randomised double-blind studies of at least two weeks comparing topical lidocaine with placebo or an active control in chronic neuropathic pain. Twelve studies with 508 participants qualified, across 5% patch, 5% cream, 5% gel and 8% spray, mostly cross-over designs. There was no first-tier and no second-tier evidence by the review's own grading, no pooling of efficacy data was possible, and all studies were judged at high risk of bias because of small size, incomplete outcome assessment or both. Only one multiple-dose study reported the review's primary outcome of at least 30% or 50% pain intensity reduction. The registration evidence itself is thin: the pivotal Rowbotham study was 35 subjects in a four-session cross-over, with each patch session lasting 12 hours.",
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
          "SMD -0.14 (95% CI -0.25 to -0.04) at 24 hours and -0.11 (95% CI -0.25 to 0.04) at 48 hours; both moderate quality and both below the review's threshold for clinical relevance",
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
        "A standardised mean difference in postoperative pain at 24 hours of -0.14 across 33 trials and 1,847 participants — real, and smaller than the review's own threshold for meaning anything",
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
      type: 'Injection for infiltration, nerve block, epidural and spinal use; intravenous solution for arrhythmia; topical gel, cream, ointment, spray, jelly and 5% medicated patch',
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
      "A long-acting sodium channel blocker whose defining measurement is not an analgesia score but an unbinding rate — it leaves the cardiac sodium channel with a time constant of 1,557 milliseconds against lidocaine's 154, which is why one injection numbs for hours and why an accidental intravascular dose can stop a heart that is then hard to restart.",
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
            "In 12 volunteers given intravenous infusions of both drugs in crossover, the maximum tolerated unbound plasma concentration was twice as high for ropivacaine (P<0.001), bupivacaine widened the QRS complex where ropivacaine did not, and bupivacaine depressed both systolic and diastolic left ventricular function where ropivacaine depressed only systolic. Against that, ropivacaine is measurably weaker: its minimum local analgesic concentration in labour epidural was 0.111% against bupivacaine's 0.067%, a potency ratio of 0.6.",
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
            "Pros: keeps bupivacaine's potency while discarding the more cardiotoxic enantiomer. Cons: withdrawn from the US market for commercial reasons, so in America the choice is between the racemate and ropivacaine.",
        },
        {
          name: 'Lidocaine (Xylocaine)',
          class: 'Intermediate-acting amide local anaesthetic',
          howItCompares:
            "Blocks the same site but unbinds from the cardiac channel roughly ten times faster — a diastolic recovery time constant of 154 ms against bupivacaine's 1,557 ms — so block does not accumulate beat to beat at normal heart rates. It is the safer molecule and the shorter-acting one, and that trade is the entire reason both drugs remain on the shelf.",
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
          name: "Amide coupling to 2',6'-pipecoloxylidide",
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
        title: "Fast-in, slow-out: the off-rate from the cardiac channel is ten times lidocaine's",
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
        title:
          "The 0.75% concentration was withdrawn from obstetric use after Albright's editorial",
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
        title: "Part of ropivacaine's safety margin is that it is a weaker drug",
        laymanSummary:
          'Comparing the two by the milligram makes the newer one look safer. Measured properly, it takes about 1.7 times as much ropivacaine to produce the same pain relief, so a milligram-for-milligram safety comparison is not a fair one.',
        technicalDetails:
          "Polley and colleagues determined minimum local analgesic concentration by up-down sequential allocation in 73 labouring women at 7 cm dilation or less, giving 20 mL of epidural test solution and defining effectiveness as a visual analogue score of 10 mm or less within 30 minutes. The minimum local analgesic concentration was 0.111% weight/volume for ropivacaine (95% CI 0.100 to 0.122) and 0.067% for bupivacaine (95% CI 0.052 to 0.082), a potency ratio of 0.6 (95% CI 0.49 to 0.74). No difference in motor effects was seen. The toxicity comparisons that established ropivacaine's reputation, including Scott 1989 and Knudsen 1997, infused equal milligram doses of the two drugs. This audit is not a claim that ropivacaine has no safety advantage — Knudsen measured a real one in unbound plasma concentration — but that the size of the advantage quoted from equal-milligram studies is inflated by roughly the potency ratio, and the therapeutic index is the number that should be compared.",
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
      type: 'Sterile injection for infiltration, peripheral nerve block, epidural and caudal use; preservative-free presentations for intrathecal use, some with dextrose for hyperbaric spinal anaesthesia; some presentations co-formulated with epinephrine; a separate patented liposomal suspension for infiltration and interscalene block',
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
      "The safer mirror-image of bupivacaine with one carbon removed: volunteers tolerate roughly twice the unbound plasma concentration before symptoms appear and it does not widen the QRS complex where bupivacaine does, but it is also measurably weaker — a minimum local analgesic concentration of 0.111% against bupivacaine's 0.067%, a potency ratio of 0.6 — so a milligram-for-milligram safety comparison overstates the advantage.",
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
            "More potent by a measured factor: 0.067% against 0.111% for the same labour epidural effect. Also the drug that unbinds from the cardiac sodium channel with a time constant of 1,557 ms against lidocaine's 154, which is the property ropivacaine was built to avoid.",
          typicalCost:
            'US$0.0860 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 12 listed products, effective 22 April 2026)',
          prosAndCons:
            'Pros: stronger per milligram, cheaper, longer established. Cons: the cardiotoxicity that motivated an entire replacement programme.',
        },
        {
          name: 'Levobupivacaine (Chirocaine)',
          class: 'The S-enantiomer of bupivacaine',
          howItCompares:
            "Keeps bupivacaine's four-carbon chain and discards the more cardiotoxic R-enantiomer, so it sits between the two on both potency and toxicity. By the same up-down potency method, ropivacaine was less potent than levobupivacaine with a potency ratio of 0.83.",
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
            "Ropivacaine's advantage is precisely that these symptoms appear at a plasma concentration further below the cardiac one than bupivacaine's do. That margin is only useful if someone says something.",
          clinicalPrecaution:
            'A reporting instruction, not a treatment. Systemic toxicity is managed by the clinical team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCN1CCCC[C@H]1C(=O)NC2=C(C=CC=C2C)C',
      chemicalFormula: 'C17H26N2O',
      molecularWeight:
        '274.40 g/mol (free base); dispensed as ropivacaine hydrochloride monohydrate',
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
            "Report the cardiac endpoint per unit of analgesic effect and not per milligram. This is the step the historical literature skipped: the volunteer studies that established ropivacaine's reputation infused equal milligram doses of two drugs later measured to differ in potency by a factor near 0.6, and a therapeutic index is the only honest way to state the result.",
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
          "Knudsen and colleagues ran a randomised double-blind crossover of ropivacaine, bupivacaine and placebo infused at 10 mg per minute in 12 volunteers previously familiarised with lignocaine's central effects. The maximum tolerated dose was higher on ropivacaine in nine of 12 subjects, with 95% confidence limits on the mean difference of -30 to 7 mg — a difference in dose that did not itself reach significance. The maximum tolerated unbound arterial plasma concentration, which is the pharmacologically meaningful quantity, was twice as high for ropivacaine (P<0.001), with thresholds near 0.6 and 0.3 mg/L free drug respectively. Muscular twitching was more frequent after bupivacaine (P<0.05) and symptoms resolved faster after ropivacaine (P<0.05). Bupivacaine widened QRS against placebo (P<0.001) and against ropivacaine (P<0.01), and depressed both systolic and diastolic left ventricular function; ropivacaine depressed systolic function only.",
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
        evidenceSource:
          'Scott DB, Lee A, Fagan D, Bowler GM, Bloomfield P, Lundh R. Anesth Analg 1989;69:563-569 (PMID 2679230)',
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
          "Polley and colleagues determined minimum local analgesic concentration by up-down sequential allocation in 73 labouring women at 7 cm dilation or less, using 20 mL epidural test solutions and a visual analogue score of 10 mm or less within 30 minutes as the definition of effect. Ropivacaine's minimum local analgesic concentration was 0.111% weight/volume (95% CI 0.100 to 0.122) against bupivacaine's 0.067% (95% CI 0.052 to 0.082), a potency ratio of 0.6 (95% CI 0.49 to 0.74). Against levobupivacaine by the same method the ratio was 0.83. The correct comparison for a safety claim is a therapeutic index — toxic concentration divided by effective concentration — and the equal-milligram volunteer studies do not supply one. This audit does not say the advantage is imaginary: Knudsen measured a genuine twofold difference in tolerated free concentration. It says the advantage is smaller than the raw dose comparison implies, and that the difference between those two statements is the single most common overreach in this drug's literature.",
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
          "The differential-block claim originates in comparisons at equal concentrations, where ropivacaine, being less potent, produces less of every effect including motor block. Polley's up-down study reported explicitly that no difference in motor effects was observed between the groups when each drug was given at its own minimum local analgesic concentration. The mechanistic story usually attached to the claim — that lower lipid solubility spares large myelinated motor fibres preferentially — is a plausible account of a difference that the equipotent comparison did not find. Differential block between sensory and motor fibres is real and concentration-dependent for every drug in this class; that it is greater for ropivacaine than for bupivacaine at equal effect is the part that failed.",
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
          "This drug is chosen where the volume is large — an epidural, a whole limb's nerve supply — because that is where an accident would matter most.",
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
          "The pKa near 8.1 is essentially identical to bupivacaine's, so the neutral fraction available at physiological pH is the same and onset time is similar. The difference between the two molecules is not in getting in; it is in how much is available in plasma to reach other tissues, where ropivacaine's higher protein binding and lower partition coefficient both reduce the free fraction.",
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
          "Elimination is hepatic, principally by CYP1A2 to 3-hydroxyropivacaine with a smaller CYP3A4 route to the N-dealkylated metabolite, which matters because CYP1A2 inhibition by fluvoxamine substantially reduces clearance. Systemic clearance and terminal half-life are more favourable than bupivacaine's for continuous infusion, which is part of why the drug is preferred where an epidural will run for days rather than hours.",
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
        "A minimum local analgesic concentration of 0.111% against bupivacaine's 0.067% — a potency ratio of 0.6 (95% CI 0.49 to 0.74)",
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
      type: 'Preservative-free sterile solution for epidural, caudal, major peripheral nerve block and infiltration use, in single-dose ampoules, single-dose vials and ready-to-use infusion bags',
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
        a: "It is a real, large, randomised result and it is worth stating exactly. In 1,720 patients aged 60 to 90 having major thoracic or abdominal surgery, adding an epidural of ropivacaine to general anaesthesia reduced delirium in the first week from 5.0% to 1.8%, a relative risk of 0.351 and a number needed to treat of 31. The same trial found intraoperative systolic pressure below 80 mmHg in 49% of the epidural group against 33%, and more vasopressor use. The authors' own conclusion was to consider the combination in patients at risk of delirium and avoid it in patients at risk of hypotension. It is also worth noting what the trial does not establish: whether the benefit belongs to ropivacaine specifically, to epidural analgesia generally, or to the reduced opioid exposure that came with it.",
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
  // ---------------------------------------------------------------------------------------------
  // 4. Propofol — the cleanest mechanism proof in anaesthesia, attached to a long list of outcome
  //    claims that were tested and did not hold.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'propofol',
    name: 'Propofol',
    tradeName: 'Diprivan; also marketed as propofol injectable emulsion',
    sponsor:
      'Fresenius Kabi USA (current US label holder for the generic emulsion); discovered by John B. Glen at Imperial Chemical Industries in 1977 and first approved in the United States in 1989',
    targetGene: 'GABRB3, GABRB2, GABRB1',
    targetProtein:
      'Type A gamma-aminobutyric acid receptor, acting at a site involving asparagine 265 in the second transmembrane region of the beta subunit; positive allosteric modulator at low concentration and direct agonist at high concentration',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1989,
    indication:
      'Induction of general anaesthesia in patients 3 years and older, maintenance of general anaesthesia in patients 2 months and older, initiation and maintenance of monitored anaesthesia care sedation in adults, sedation combined with regional anaesthesia in adults, and intensive care unit sedation of intubated mechanically ventilated adults',
    patientFriendlyIndication:
      'Putting a person to sleep for surgery, and keeping them asleep or sedated on a ventilator',
    anatomicalSite:
      'Chloride channel of the type A GABA receptor, on cortical, thalamic and brainstem neurons',
    conditionContext: {
      conditionExplainer:
        'General anaesthesia is not sleep. It is a reversible, drug-induced state with four separable components — unconsciousness, amnesia, immobility and blunting of the stress response — and no single drug produces all four equally well. Propofol is very good at unconsciousness and amnesia, adequate at immobility, and does nothing at all for pain. That is why it is almost never given alone.',
      whyItMatters:
        'Propofol is the most commonly used induction agent in the world, and it displaced thiopental almost completely on the strength of how quickly and pleasantly people wake up. The claims that followed — that it reduces nausea, protects against cancer recurrence, improves survival compared to inhaled anaesthesia — are separate claims, and most of them have now been tested.',
      whoTakesThis:
        'Nearly anyone having a general anaesthetic, a colonoscopy or a cardioversion in a high-income health system, and most intubated adults sedated in intensive care.',
      clinicalGoals:
        'Loss of consciousness within one arm-brain circulation time, a controllable depth of anaesthesia, and rapid clear-headed recovery. Whether the choice of anaesthetic changes anything that happens weeks or years later is a different question and is answered separately below.',
    },
    oneSentenceVerdict:
      'A phenol that opens the GABA-A chloride channel and switches consciousness off within seconds — proved to act there by a single-residue knock-in mutation that abolishes its effect in mice — and which, in 5,400 patients having coronary bypass surgery, produced 1-year mortality of 3.0% against 2.8% for inhaled anaesthesia, a trial stopped early for futility.',
    laymanHowItWorks:
      'The brain has a built-in brake: a receptor that lets chloride into a neuron and makes it much harder for that neuron to fire. Propofol grips that receptor and holds the brake on, so at a high enough concentration the cortex and thalamus stop passing signals to each other and consciousness stops. It is extremely fat-soluble, so it reaches the brain within one circulation of the blood and then leaves again as it redistributes into muscle and fat, which is why one injection lasts minutes and why waking is quick and unusually clear.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1709 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The molecule is off patent and generic worldwide. The commercially interesting part was never the phenol, which is a simple alkylated cresol, but the lipid emulsion needed to make an insoluble oil injectable, and the manufacturing and sterility control of that emulsion is why the number of United States suppliers is small and why propofol has repeatedly appeared on national drug shortage lists.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Substitution depends on which of the four components of anaesthesia you actually need. For induction, etomidate is the alternative when blood pressure is the concern and ketamine when it is bronchospasm or shock. For maintenance, the real alternative is a volatile agent, and the largest randomised comparison of the two found no difference in death at one year. For intensive care sedation, dexmedetomidine and midazolam are the alternatives, and neither has beaten propofol on mortality. No food or supplement induces general anaesthesia and none is listed here.',
      conventionalRx: [
        {
          name: 'Sevoflurane and the other volatile agents',
          class: 'Inhalational general anaesthetic',
          howItCompares:
            'In MYRIAD, 5,400 patients having elective coronary bypass were randomised to a volatile agent or to total intravenous anaesthesia. One-year mortality was 2.8% against 3.0% (relative risk 0.94, 95% CI 0.69 to 1.29, P=0.71) and the trial was stopped for futility at the second interim analysis. No secondary outcome differed, including myocardial infarction.',
          typicalCost:
            'No NADAC value is held on this record for sevoflurane and none is asserted here',
          prosAndCons:
            "Pros: end-tidal concentration is directly measurable, which propofol's brain concentration is not. Cons: more postoperative nausea, and an operating-theatre greenhouse-gas footprint propofol does not have.",
        },
        {
          name: 'Etomidate (Amidate)',
          class: 'Imidazole intravenous induction agent',
          howItCompares:
            'Acts at the same beta3 subunit residue — the N265M knock-in mouse is unresponsive to both drugs — but causes far less drop in blood pressure. It buys that stability with dose-dependent inhibition of adrenal steroid synthesis, which is a real and measured harm rather than a theoretical one.',
          typicalCost:
            'No NADAC value is held on this record for etomidate and none is asserted here',
          prosAndCons:
            'Pros: haemodynamic stability at induction. Cons: adrenal suppression from a single dose, and an outcome literature that has repeatedly pointed the wrong way.',
        },
        {
          name: 'Dexmedetomidine (Precedex)',
          class: 'Selective alpha-2 adrenergic agonist',
          howItCompares:
            'Sedates through a different receptor entirely and preserves respiratory drive. Against propofol in ventilated septic adults in MENDS2, there was no difference in days alive without delirium or coma, ventilator-free days, death at 90 days, or cognitive function at six months.',
          typicalCost:
            'No NADAC value is held on this record for dexmedetomidine and none is asserted here',
          prosAndCons:
            'Pros: no respiratory depression, and patients are rousable. Cons: bradycardia and hypotension, slower onset, and no measured advantage over propofol in the trial designed to find one.',
        },
        {
          name: 'Midazolam (Versed)',
          class: 'Benzodiazepine',
          howItCompares:
            'Also a GABA-A positive modulator, but at the benzodiazepine site between the alpha and gamma subunits rather than the beta-subunit site. Slower on, much slower off, and with an active metabolite that accumulates in renal impairment.',
          typicalCost:
            'US$0.4200 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed products, effective 12 March 2025)',
          prosAndCons:
            'Pros: strong anterograde amnesia, and a specific antagonist exists. Cons: accumulation, prolonged emergence, and a consistent association with delirium in intensive care.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report a previous bad anaesthetic in detail',
          action:
            'Slow waking, prolonged nausea, unexplained agitation or a family history of an anaesthetic problem are the sort of history that changes what is chosen and how it is monitored.',
          patientImpact:
            'Most of what a person can contribute to the safety of their own anaesthetic happens in the pre-operative conversation, not afterwards.',
          clinicalPrecaution:
            'This is a communication point, not a treatment. Nothing on this page substitutes for an anaesthetic assessment.',
        },
        {
          name: 'Egg or soy allergy is worth mentioning and is probably not a barrier',
          action:
            'The emulsion contains egg lecithin and soybean oil, and the folk rule that egg or soy allergy rules propofol out is not supported by the evidence that has been gathered.',
          patientImpact:
            'In 520 adults with confirmed IgE to egg, soy or peanut, no allergic reaction to propofol was found across 171 retrieved anaesthetic charts, and none of the four patients with confirmed propofol allergy had food allergy or specific IgE to egg or soy.',
          clinicalPrecaution:
            'Mention the allergy anyway. The point is that the decision belongs to the anaesthetist with the evidence in front of them, not to a rule of thumb.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C1=C(C(=CC=C1)C(C)C)O',
      chemicalFormula: 'C12H18O',
      molecularWeight: '178.27 g/mol; formulated as a 1% oil-in-water emulsion, not as a solution',
      targetReceptorAffinity:
        'Propofol is a positive allosteric modulator of the GABA-A receptor at low micromolar concentrations and a direct channel agonist at higher ones. The decisive affinity evidence is genetic rather than biochemical: mice carrying a single N265M substitution in the second transmembrane region of the GABA-A beta3 subunit lose the suppression of noxious-evoked movement by propofol entirely, and show a profound reduction in loss of righting reflex, while enflurane and halothane are only slightly affected in the same animals.',
      structureSource: {
        label: 'PubChem CID 4943 (propofol) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4943',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pro-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Phenol identity and oxidation state of the drug substance',
          description:
            'Confirm 2,6-diisopropylphenol identity and, more importantly, its oxidation status. A free phenol is an oxidisable species, and quinone-type degradation products are both the discolouration risk and the specification that governs storage under nitrogen.',
          reagentsAndBuffer:
            '2,6-diisopropylphenol reference standard, gas chromatography with flame ionisation detection, reversed-phase HPLC with UV detection at 270 nm, nitrogen headspace, dissolved oxygen measurement',
        },
        {
          id: 'pro-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Friedel-Crafts alkylation of phenol at both ortho positions',
          description:
            'Alkylate phenol with propene over an acidic catalyst to install isopropyl groups at the 2 and 6 positions. Mono-alkylated and 2,4-alkylated isomers form alongside the wanted 2,6 product and are separated later; the chemistry itself is commodity-scale and unremarkable, which is why the molecule is cheap and the emulsion is not.',
          dependsOnStepId: 'pro-w1',
          reagentsAndBuffer:
            'Phenol, propene or isopropanol, aluminium phenoxide or an acidic zeolite catalyst, elevated temperature and pressure, nitrogen blanket',
        },
        {
          id: 'pro-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Fractional distillation away from the alkylation isomers',
          description:
            'Separate 2,6-diisopropylphenol from its 2-, 4- and 2,4-substituted relatives by fractional distillation under reduced pressure, then hold the purified oil under nitrogen. The finished drug substance is a clear oil at room temperature and essentially insoluble in water, which is the entire formulation problem.',
          dependsOnStepId: 'pro-w2',
          reagentsAndBuffer:
            'Vacuum fractional distillation column, nitrogen blanket, gas chromatography for isomer ratio, Karl Fischer titration for water content',
        },
        {
          id: 'pro-w4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Emulsification into a soybean oil, egg lecithin and glycerol vehicle',
          description:
            'High-pressure homogenise the oil into an aqueous phase with purified egg phosphatide as emulsifier and glycerol for tonicity, targeting a droplet size distribution tight enough for intravenous use. This step is the product. Droplet size, zeta potential and the free-phenol fraction in the aqueous phase determine both stability and injection pain, and getting it wrong is why propofol supply is concentrated in few manufacturers.',
          dependsOnStepId: 'pro-w3',
          reagentsAndBuffer:
            'Refined soybean oil, purified egg phosphatide, glycerol, sodium hydroxide to adjust pH, water for injection, high-pressure homogeniser, laser diffraction and dynamic light scattering for droplet sizing',
        },
        {
          id: 'pro-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Whole-cell recording on recombinant GABA-A receptors, wild type against N265M',
          description:
            'Express alpha1-beta3-gamma2 GABA-A receptors and the beta3(N265M) variant side by side and record chloride current with and without drug. Running the mutant alongside the wild type in the same session is what converts a modulation measurement into a site attribution; a potentiation curve on wild type alone shows only that the drug does something.',
          dependsOnStepId: 'pro-w4',
          reagentsAndBuffer:
            'HEK293 cells or Xenopus oocytes expressing GABRA1, GABRB3 and GABRG2, extracellular solution at pH 7.4, GABA applied at its half-maximal effective concentration, propofol in dimethyl sulfoxide below 0.1%, matched beta3(N265M) construct',
        },
        {
          id: 'pro-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Separate the endpoints: immobility, righting reflex, and current potentiation',
          description:
            'Score suppression of noxious-evoked movement, duration of loss of righting reflex and GABA current potentiation as three distinct readouts, because the mutation dissociates them from one another and from the volatile anaesthetics. Reporting a single anaesthesia score would have hidden the finding that the intravenous agents depend on one residue and the volatiles do not.',
          dependsOnStepId: 'pro-w5',
          reagentsAndBuffer:
            'Tail-clamp or hindpaw withdrawal scoring for immobility, timed loss of righting reflex, cortical brain slice recordings of spontaneous action potential firing, enflurane and halothane comparators in the same animals',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pro-a1',
        category: 'measured',
        title: 'One changed amino acid abolishes propofol anaesthesia in a living animal',
        laymanSummary:
          "Researchers swapped a single amino acid in one subunit of the brain's main inhibitory receptor. Mice carrying the change no longer stopped moving in response to propofol at all, while gas anaesthetics still worked on them.",
        technicalDetails:
          'Jurd and colleagues used gene targeting to generate mice carrying an N265M point mutation in the second transmembrane region of the GABA-A receptor beta3 subunit. In these animals, suppression of noxious-evoked movement by intravenous etomidate and propofol was completely abolished, while it was only slightly decreased for the volatile anaesthetics enflurane and halothane. The mutants also showed a profound reduction in the duration of loss of righting reflex in response to intravenous but not volatile agents. Electrophysiology in cortical brain slices from the mutants showed that the anaesthetics were significantly less effective both at enhancing GABA-A mediated currents and at reducing spontaneous action potential firing. This is as close to a mechanism proof as pharmacology gets: a specific residue, altered in the whole animal, removes the behavioural effect of the drug, and the control drugs in the same animals are unaffected.',
        evidenceSource:
          'Jurd R, Arras M, Lambert S, et al. General anesthetic actions in vivo strongly attenuated by a point mutation in the GABA(A) receptor beta3 subunit. FASEB J 2003;17:250-252',
        doi: '10.1096/fj.02-0611fje',
        measuredMetric:
          'Suppression of noxious-evoked movement and duration of loss of righting reflex in beta3(N265M) knock-in mice versus wild type, with volatile anaesthetic controls',
        auditFlag: 'verified',
      },
      {
        id: 'pro-a2',
        category: 'failed',
        title: 'MYRIAD: intravenous anaesthesia did not change one-year death after bypass surgery',
        laymanSummary:
          'Inhaled anaesthetics were believed to protect the heart during bypass surgery. Five thousand four hundred patients were randomised to gas or to propofol, and after a year 2.8% and 3.0% had died. The trial was stopped early because it was clear nothing would be found.',
        technicalDetails:
          'Landoni and colleagues ran a pragmatic, multicentre, single-blind trial at 36 centres in 13 countries. Patients scheduled for elective coronary artery bypass grafting were randomised to an intraoperative regimen including a volatile agent — desflurane, isoflurane or sevoflurane — or to total intravenous anaesthesia with propofol. On-pump bypass was performed in 64% of patients with a mean bypass duration of 79 minutes. The primary outcome, death from any cause at one year, occurred in 2.8% of the volatile group and 3.0% of the total intravenous anaesthesia group (relative risk 0.94, 95% CI 0.69 to 1.29, P=0.71), with data available for 99.1% of patients. Thirty-day mortality was 1.4% against 1.3%. No secondary outcome differed and no prespecified adverse event, including myocardial infarction, differed. The data and safety monitoring board stopped the trial for futility at the second interim analysis. The result cuts both ways and this page records it that way: it is a failure of the volatile cardioprotection hypothesis and equally a failure of any claim that intravenous anaesthesia is the safer choice.',
        evidenceSource:
          'Landoni G, Lomivorotov VV, Nigro Neto C, et al. Volatile anesthetics versus total intravenous anesthesia for cardiac surgery. N Engl J Med 2019;380:1214-1225 (NCT02105610)',
        doi: '10.1056/NEJMoa1816476',
        measuredMetric:
          'Death from any cause at one year after elective coronary artery bypass grafting',
        auditFlag: 'verified',
      },
      {
        id: 'pro-a3',
        category: 'failed',
        title: 'Propofol plus regional block did not reduce breast cancer recurrence',
        laymanSummary:
          'A long-standing theory held that gas anaesthesia and opioids weaken the immune defences that stop cancer spreading, and that propofol with a nerve block would do better. Two thousand one hundred women were randomised over eleven years. Recurrence was 10% in both groups.',
        technicalDetails:
          'Sessler and colleagues randomised women under 85 having potentially curative primary breast cancer resection at 13 hospitals in eight countries to regional anaesthesia-analgesia with paravertebral blocks plus propofol, or to general anaesthesia with sevoflurane plus opioid analgesia. Of 2,132 enrolled between January 2007 and January 2018, 24 were excluded before surgery, leaving 1,043 assigned to regional and 1,065 to general anaesthesia; median follow-up was 36 months. Local or metastatic recurrence occurred in 102 (10%) versus 111 (10%) — hazard ratio 0.97, 95% CI 0.74 to 1.28, P=0.84. The trial was stopped after crossing a preplanned futility boundary. The secondary hypothesis also failed: incisional pain at six months was reported by 52% in both groups and at 12 months by 28% and 27%, with an interim-adjusted odds ratio of 1.00 (95% CI 0.85 to 1.17, P=0.99), and neuropathic breast pain did not differ either. This is one of the most expensive negative results in perioperative medicine and it removed a hypothesis that had driven a decade of observational publishing.',
        evidenceSource:
          'Sessler DI, Pei L, Huang Y, et al. Recurrence of breast cancer after regional or general anaesthesia: a randomised controlled trial. Lancet 2019;394:1807-1815 (NCT00418457)',
        doi: '10.1016/S0140-6736(19)32313-X',
        measuredMetric:
          'Local or metastatic breast cancer recurrence, and persistent incisional pain at 6 and 12 months',
        auditFlag: 'verified',
      },
      {
        id: 'pro-a4',
        category: 'failed',
        title: 'Propofol infusion syndrome: five children died before anyone connected the cases',
        laymanSummary:
          'Children sedated on a ventilator with propofol began developing an unexplained acid build-up in the blood, a failing heart and fatty serum. Five deaths in three intensive care units were published together in 1992, and the same pattern was later described in adults.',
        technicalDetails:
          'Parke and colleagues reviewed the case notes of five children aged four weeks to six years with upper respiratory tract infections — four with laryngotracheobronchitis and one with bronchiolitis — all sedated with propofol in three intensive care units. The clinical course was remarkably similar in all five: increasing metabolic acidosis with bradyarrhythmia and progressive myocardial failure unresponsive to resuscitation, and lipaemic serum after starting propofol. Viral myocarditis was excluded. Nine years later Cremer and colleagues reported five adult head-injured patients with inexplicable fatal cardiac arrest after a more concentrated sedation formulation was introduced, and a retrospective cohort of 67 sedated ventilated head-injured adults in which seven were judged to have died from the syndrome; the odds ratio was 1.93 for every mg/kg per hour increase in mean propofol dose above 5 mg/kg per hour (95% CI 1.12 to 3.32, P=0.018). The proposed mechanism is impairment of mitochondrial fatty acid oxidation and the electron transport chain. Propofol is not indicated for intensive care sedation of paediatric patients on the United States label.',
        evidenceSource:
          'Parke TJ, Stevens JE, Rice AS, et al. BMJ 1992;305:613-616; Cremer OL, Moons KG, Bouman EA, et al. Lancet 2001;357:117-118',
        doi: '10.1136/bmj.305.6854.613',
        measuredMetric:
          'Case series of five paediatric deaths; retrospective cohort odds ratio of 1.93 per mg/kg/h above 5 mg/kg/h in 67 ventilated head-injured adults',
        auditFlag: 'verified',
      },
      {
        id: 'pro-a5',
        category: 'conclusion_shift',
        title: 'The egg and soy allergy rule was never evidence-based, and was tested and dropped',
        laymanSummary:
          'Because the emulsion contains egg lecithin and soybean oil, people with egg or soy allergy were routinely given a different anaesthetic. When someone finally looked, there was no link at all.',
        technicalDetails:
          'Asserhoj and colleagues ran two studies. In the first, 273 patients systematically investigated for suspected perioperative allergic reactions included 153 who had been exposed to propofol and who underwent skin testing and intravenous provocation; four (2.6%) were diagnosed with propofol allergy, three of them positive only on provocation. None of those four had symptoms on eating egg, soy or peanut, and none had detectable specific IgE to egg or soy. In the second, 520 adults with a positive specific IgE to egg, soy or peanut were investigated retrospectively for propofol exposure, and no sign of an allergic reaction to propofol was found in 171 retrieved anaesthetic charts from 99 exposed patients. The authors concluded that the practice of avoiding propofol in food-allergic patients is not evidence-based and should be reconsidered. The original belief rested on six case reports lacking confirmatory evidence of an allergic reaction, plus the ingredient list.',
        evidenceSource:
          'Asserhoj LL, Mosbech H, Kroigaard M, Garvey LH. No evidence for contraindications to the use of propofol in adults allergic to egg, soy or peanut. Br J Anaesth 2016;116:77-82',
        doi: '10.1093/bja/aev360',
        inferredClaim:
          'That egg, soy or peanut allergy contraindicates propofol because the emulsion contains egg lecithin and soybean oil — an inference from the ingredient list that direct investigation did not support',
        auditFlag: 'verified',
      },
      {
        id: 'pro-a6',
        category: 'inferred',
        title: 'The brain concentration is never measured; the whole technique runs on a model',
        laymanSummary:
          'With a gas anaesthetic, a monitor tells you the concentration the patient is breathing out, which closely tracks what is in the brain. With propofol there is no equivalent measurement, so the dose is guided by a computer model of an average person.',
        technicalDetails:
          'Total intravenous anaesthesia is delivered either by weight-based infusion or by target-controlled infusion, in which a pharmacokinetic model calculates the rate needed to reach a chosen plasma or effect-site concentration. No propofol concentration is measured in the patient in real time. Depth-of-anaesthesia monitors derived from the processed electroencephalogram are used as an indirect check, but they are a signal-processing surrogate rather than a concentration measurement, and their relationship to the drug differs between intravenous and volatile anaesthesia. This is not an argument that intravenous anaesthesia is unsafe — MYRIAD found no mortality difference in 5,400 patients — but it is a structural difference in what is known about a given patient at a given moment, and it is the reason awareness under anaesthesia is a live concern specifically for the intravenous technique when a neuromuscular blocking drug is also being used.',
        evidenceSource:
          'FDA-approved US prescribing information for propofol injectable emulsion, Dosage and Administration and Warnings',
        inferredClaim:
          'That a modelled effect-site concentration is equivalent to a measured one; end-tidal monitoring of a volatile agent has no intravenous counterpart',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as an oil in water, not as a solution',
        laymanDesc:
          'Propofol will not dissolve in water, so it is delivered as microscopic oil droplets suspended in a milky white emulsion of soybean oil, egg lecithin and glycerol.',
        molecularDetail:
          'The drug substance is a lipophilic phenol, an oil at room temperature. The 1% emulsion vehicle is the pharmaceutical achievement; the free phenol dissolved in the aqueous phase is responsible for injection pain, and formulations differ in that fraction. The emulsion is also an excellent bacterial growth medium, which is why presentations either carry a retardant such as EDTA or metabisulfite or are single-use with strict handling rules.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the brain in one circulation',
        laymanDesc:
          'Because it is so fat-soluble it crosses out of the blood into brain tissue almost immediately. Loss of consciousness happens within about half a minute of the injection.',
        molecularDetail:
          'Onset is limited by arm-brain circulation time rather than by permeability. Distribution then follows a three-compartment pattern, and the offset of a single bolus is governed by redistribution into muscle and fat rather than by elimination, which is why a bolus lasts minutes but a long infusion has a context-sensitive half-time that lengthens with duration.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grips the GABA-A receptor at the beta subunit',
        laymanDesc:
          "It binds the brain's main inhibitory receptor, at a site on a different part of the protein from where alcohol or benzodiazepines act.",
        molecularDetail:
          "The site involves asparagine 265 in transmembrane domain 2 of the beta subunit. Mice carrying the beta3(N265M) substitution lose propofol's immobilising action completely and most of its hypnotic action, while enflurane and halothane remain largely effective, which localises the intravenous anaesthetic effect to this residue and shows the volatiles act through a broader set of targets.",
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Chloride floods in and neurons stop firing',
        laymanDesc:
          'The receptor is a gate for chloride ions. Holding it open makes the neuron electrically negative inside and much harder to excite, so signalling across the cortex and thalamus breaks down.',
        molecularDetail:
          'At low micromolar concentrations propofol is a positive allosteric modulator, increasing the response to GABA already present; at higher concentrations it opens the channel directly without GABA. In cortical brain slices from beta3(N265M) mice both the current enhancement and the reduction in spontaneous action potential firing are significantly attenuated, tying the network effect to the same residue as the behaviour.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Unconsciousness, amnesia — and no pain relief at all',
        laymanDesc:
          'The person is unconscious and will remember nothing, but the drug does nothing about pain. That is why an opioid or a local anaesthetic is almost always given alongside it.',
        molecularDetail:
          'Propofol produces hypnosis and amnesia at concentrations well below those needed for immobility in response to a noxious stimulus, and has no analgesic action at any clinical concentration. It also depresses ventilation and vasomotor tone, so apnoea after induction is expected rather than adverse, and hypotension is the dose-limiting effect in an unwell patient.',
        iconName: 'MoonStar',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'It redistributes and is glucuronidated, and waking is unusually clear',
        laymanDesc:
          'The drug moves out of the brain into muscle and fat within minutes, and the liver conjugates it into inactive forms. People wake up quickly and without the hungover feeling older agents left behind.',
        molecularDetail:
          'Clearance exceeds hepatic blood flow, implying substantial extrahepatic metabolism, principally by glucuronidation to inactive conjugates excreted renally. No active metabolite accumulates, which distinguishes propofol from midazolam and is the pharmacological basis of its clear-headed emergence. The comparison that made propofol displace thiopental was quality of recovery, and it is worth naming precisely: quality of recovery is a measured advantage, and no mortality advantage has ever been demonstrated.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'MYRIAD — volatile anaesthetics versus total intravenous anaesthesia for cardiac surgery (NCT02105610)',
        phase: 'Pragmatic multicentre single-blind randomised controlled trial',
        sampleSize: 5400,
        primaryEndpoint:
          'Death from any cause at one year after elective coronary artery bypass grafting',
        endpointMet: false,
        statisticalPValue:
          '2.8% volatile versus 3.0% total intravenous anaesthesia; relative risk 0.94, 95% CI 0.69 to 1.29, P=0.71',
        unreportedAdverseSignals:
          'Stopped for futility at the second interim analysis. No secondary outcome and no prespecified adverse event, including myocardial infarction, differed between the groups.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Sessler breast cancer recurrence after regional or general anaesthesia (NCT00418457)',
        phase: 'Randomised controlled trial at 13 hospitals in 8 countries',
        sampleSize: 2132,
        primaryEndpoint:
          'Local or metastatic breast cancer recurrence after potentially curative resection',
        endpointMet: false,
        statisticalPValue:
          '102 of 1,043 (10%) with paravertebral block plus propofol versus 111 of 1,065 (10%) with sevoflurane plus opioid; hazard ratio 0.97, 95% CI 0.74 to 1.28, P=0.84',
        unreportedAdverseSignals:
          'The secondary endpoint failed too: persistent incisional pain at 6 and 12 months was identical, odds ratio 1.00 (95% CI 0.85 to 1.17, P=0.99). The trial crossed a preplanned futility boundary and was stopped after 11 years of enrolment.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Cremer retrospective cohort of long-term propofol infusion in head-injured adults',
        phase: 'Retrospective cohort study following five index deaths',
        sampleSize: 67,
        primaryEndpoint:
          'Occurrence of propofol infusion syndrome in sedated ventilated head-injured adults',
        endpointMet: true,
        statisticalPValue:
          'Odds ratio 1.93 for each mg/kg per hour increase in mean propofol dose above 5 mg/kg per hour (95% CI 1.12 to 3.32, P=0.018); 7 of 67 patients judged to have died of the syndrome',
        unreportedAdverseSignals:
          'Retrospective and single-centre, prompted by a formulation change. It establishes a dose-response association with a rare fatal syndrome, not a rate.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Asserhoj investigation of propofol allergy in egg, soy and peanut allergic adults',
        phase: 'Two-part clinical investigation with skin testing and intravenous provocation',
        sampleSize: 793,
        primaryEndpoint:
          'Frequency of propofol allergy, and tolerance of propofol in adults with specific IgE to egg, soy or peanut',
        endpointMet: true,
        statisticalPValue:
          '4 of 153 propofol-exposed patients (2.6%) had confirmed propofol allergy, none with food allergy or specific IgE to egg or soy; no allergic reaction in 171 anaesthetic charts from 99 food-allergic patients',
        unreportedAdverseSignals:
          'Three of the four confirmed propofol allergies were positive only on intravenous provocation and would have been missed by skin testing alone — a finding about diagnostic practice rather than about food allergy.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        "A single N265M substitution in the GABA-A beta3 subunit completely abolishes propofol's suppression of noxious-evoked movement in mice, while volatile anaesthetics still work in the same animals",
        'One-year mortality of 3.0% with total intravenous anaesthesia against 2.8% with a volatile agent in 5,400 coronary bypass patients',
        'Breast cancer recurrence of 10% with propofol plus paravertebral block against 10% with sevoflurane plus opioid, hazard ratio 0.97, in 2,108 analysed women',
        'A dose-response association between propofol infusion rate and fatal propofol infusion syndrome, odds ratio 1.93 per mg/kg/h above 5 mg/kg/h',
        'No link between propofol allergy and egg, soy or peanut allergy across 793 investigated adults',
      ],
      unsupportedInferences: [
        'That the anaesthetic technique chosen for a cardiac operation changes whether the patient is alive a year later — tested in 5,400 patients and stopped for futility',
        'That avoiding volatile agents and opioids reduces cancer recurrence — tested over eleven years in 2,132 women and stopped for futility',
        'That egg or soy allergy is a reason to avoid propofol, an inference from the ingredient list that the direct investigation contradicted',
        'That a modelled effect-site concentration tells you what a measured end-tidal concentration tells you; there is no propofol equivalent of the volatile agent monitor',
        'That faster, clearer recovery — which is measured and real — implies any advantage in death, complications or long-term outcome',
      ],
      whatFailedInitially: [
        'Volatile cardioprotection, the hypothesis MYRIAD was built to confirm, failed; and the trial equally failed to show any advantage for the intravenous technique',
        'The regional-anaesthesia-and-propofol cancer recurrence hypothesis failed on its primary and its secondary endpoint',
        'Paediatric intensive care sedation with propofol produced a fatal syndrome described in 1992 and is not an indication on the United States label',
        'The egg and soy allergy contraindication, believed for decades on the strength of six unconfirmed case reports, did not survive investigation',
      ],
      realWorldOutcome: [
        'The most widely used induction agent in the world, on the WHO Model List of Essential Medicines, and the reason day-case surgery under general anaesthesia is routine',
        'About 17 cents per millilitre at United States pharmacy acquisition cost across only 4 listed generic products — a small supplier base for a drug this essential, and a recurring cause of shortage',
        'Its measured advantage over its predecessors is the quality and speed of recovery, and that advantage has never converted into a measured advantage in survival',
      ],
    },
    deliverySystem: {
      type: 'Sterile 1% oil-in-water injectable emulsion for intravenous bolus and infusion, in ampoules, vials and prefilled syringes; delivered by weight-based or target-controlled infusion',
      description:
        'The emulsion is the delivery system. Soybean oil provides the lipid phase, purified egg phosphatide the emulsifier and glycerol the tonicity, and the droplet size distribution has to be tight enough that the suspension can go safely into a vein. Because that vehicle supports rapid bacterial growth, presentations either include a growth retardant such as disodium edetate, sodium metabisulfite or benzyl alcohol, or are strictly single-patient with a short in-use time. The lipid load itself is clinically relevant during long infusions and is one reason propofol is not simply run indefinitely.',
      safetyProfile:
        'Apnoea after an induction dose is expected rather than adverse, and hypotension from reduced systemic vascular resistance and myocardial depression is the dose-limiting effect in unwell patients. Injection pain is common and is caused by the free phenol in the aqueous phase. Propofol infusion syndrome — metabolic acidosis, rhabdomyolysis, hyperkalaemia, lipaemia, bradyarrhythmia and myocardial failure — is rare, associated with higher infusion rates and longer duration, and has been fatal in both children and adults. Propofol is not indicated for paediatric intensive care sedation. Bacterial contamination of the emulsion has caused outbreaks and is the reason for the handling rules. None of this is dosing guidance and no dosing guidance appears on this page.',
    },
    commonQuestions: [
      {
        q: 'How do we actually know propofol works on the receptor everyone says it does?',
        a: 'Because someone changed the receptor and the drug stopped working. Mice were engineered carrying a single amino acid substitution — asparagine to methionine at position 265 — in the beta3 subunit of the GABA-A receptor. In those animals propofol completely lost its ability to suppress movement in response to a painful stimulus, and largely lost its ability to abolish the righting reflex. Crucially, gas anaesthetics still worked on the same mice, so the effect was specific rather than a generally anaesthesia-resistant animal. Brain slice recordings from the same mutants showed the drug no longer enhanced GABA currents properly. That combination — genetic change, behavioural loss, electrophysiological loss, intact control drugs — is about as strong as mechanism evidence gets in pharmacology.',
      },
      {
        q: 'Is intravenous anaesthesia safer than gas?',
        a: 'Not by any measure anyone has managed to detect. The largest test is MYRIAD: 5,400 patients at 36 centres in 13 countries having elective coronary bypass, randomised to a volatile agent or to total intravenous anaesthesia with propofol. One-year mortality was 2.8% and 3.0%. The relative risk was 0.94 with a confidence interval from 0.69 to 1.29, P=0.71, and the trial was stopped for futility. Thirty-day mortality, myocardial infarction and every other secondary outcome were the same. That trial was designed to prove volatile agents protect the heart, and it is usually cited as a failure of that hypothesis; it is equally a failure of the reverse claim. There are real differences between the two techniques — nausea, recovery quality, environmental footprint, cost, monitoring — and death at one year is not one of them.',
      },
      {
        q: 'Does the anaesthetic used during cancer surgery affect whether the cancer comes back?',
        a: 'The best test says no. The hypothesis was specific and biologically plausible: surgical stress, volatile anaesthetics and opioids all impair the immune surveillance that clears circulating tumour cells, and regional anaesthesia with propofol avoids all three. Sessler and colleagues randomised 2,132 women having curative breast cancer surgery in eight countries and followed them for a median of three years. Recurrence was 102 of 1,043 with paravertebral block and propofol, and 111 of 1,065 with sevoflurane and opioids: hazard ratio 0.97, confidence interval 0.74 to 1.28. The trial was stopped for futility. The secondary hypothesis, that regional anaesthesia would reduce persistent incisional pain, failed with an odds ratio of exactly 1.00.',
        auditNote:
          'A large observational literature had reported the opposite. This is a clean example of a plausible mechanism plus consistent retrospective data being overturned by one adequately powered randomised trial.',
      },
      {
        q: 'What is propofol infusion syndrome and how worried should I be?',
        a: 'It is a rare, severe reaction to prolonged high-rate infusion, and the risk to someone having a normal anaesthetic for an operation is essentially not this. It was first described in 1992 in five children in intensive care who developed a progressive metabolic acidosis, an abnormal heart rhythm, fatty-looking serum and heart failure that did not respond to resuscitation; all five died and viral myocarditis was excluded. In 2001 a similar pattern was reported in head-injured adults after a more concentrated sedation formulation was introduced, with the odds of the syndrome rising by a factor of 1.93 for every mg/kg per hour of average infusion rate above 5. The mechanism is thought to be impairment of mitochondrial fatty acid oxidation. It is a syndrome of days of sedation, not of minutes of anaesthesia, and propofol is not indicated for intensive care sedation of children.',
      },
      {
        q: 'I am allergic to eggs. Can I have propofol?',
        a: "The evidence says the connection does not exist, and the rule that says otherwise was never based on evidence. Propofol's emulsion does contain egg lecithin and soybean oil, and for decades that ingredient list was treated as a contraindication in people with egg, soy or peanut allergy — on the strength of six case reports that lacked confirmatory evidence of an allergic reaction. When it was investigated properly, four of 153 propofol-exposed patients under investigation for perioperative reactions turned out to be genuinely allergic to propofol, and none of them had food allergy or specific IgE to egg or soy. Separately, 520 adults with confirmed IgE to egg, soy or peanut were reviewed, and no allergic reaction to propofol appeared in 171 retrieved anaesthetic charts. Tell your anaesthetist about the allergy regardless; the point is what they should conclude from it.",
        auditNote:
          'Filed as a change of mind rather than an unproven claim, because it was a standing clinical practice that direct investigation contradicted.',
      },
      {
        q: 'Why is a drug this important made by only four suppliers?',
        a: 'Because the hard part is not the molecule. 2,6-diisopropylphenol is made by alkylating phenol with propene over an acid catalyst, which is commodity chemistry, and the CMS survey puts United States pharmacy acquisition cost at about 17 cents per millilitre. The difficulty is turning an oil that will not dissolve in water into a sterile intravenous emulsion with a controlled droplet size, a controlled free-phenol fraction and no bacterial growth — a formulation and sterility problem rather than a synthesis one. That is why the number of listed United States products is four, and why propofol has repeatedly appeared on national shortage lists. This page shows no manufacturing cost because no verified per-dose cost-of-production study for propofol was found.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Jurd R, Arras M, Lambert S, et al. General anesthetic actions in vivo strongly attenuated by a point mutation in the GABA(A) receptor beta3 subunit. FASEB J 2003;17:250-252',
        identifier: '10.1096/fj.02-0611fje',
        kind: 'doi',
      },
      {
        label:
          'Landoni G, Lomivorotov VV, Nigro Neto C, et al. Volatile anesthetics versus total intravenous anesthesia for cardiac surgery. N Engl J Med 2019;380:1214-1225',
        identifier: '10.1056/NEJMoa1816476',
        kind: 'doi',
      },
      {
        label:
          'NCT02105610 — MYRIAD, volatile anaesthetics versus total intravenous anaesthesia for cardiac surgery',
        identifier: 'NCT02105610',
        kind: 'nct',
      },
      {
        label:
          'Sessler DI, Pei L, Huang Y, et al. Recurrence of breast cancer after regional or general anaesthesia: a randomised controlled trial. Lancet 2019;394:1807-1815',
        identifier: '10.1016/S0140-6736(19)32313-X',
        kind: 'doi',
      },
      {
        label:
          'Parke TJ, Stevens JE, Rice AS, et al. Metabolic acidosis and fatal myocardial failure after propofol infusion in children: five case reports. BMJ 1992;305:613-616',
        identifier: '10.1136/bmj.305.6854.613',
        kind: 'doi',
      },
      {
        label:
          'Cremer OL, Moons KG, Bouman EA, Kruijswijk JE, de Smet AM, Kalkman CJ. Long-term propofol infusion and cardiac failure in adult head-injured patients. Lancet 2001;357:117-118',
        identifier: '10.1016/S0140-6736(00)03547-9',
        kind: 'doi',
      },
      {
        label:
          'Asserhoj LL, Mosbech H, Kroigaard M, Garvey LH. No evidence for contraindications to the use of propofol in adults allergic to egg, soy or peanut. Br J Anaesth 2016;116:77-82',
        identifier: '10.1093/bja/aev360',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 4943 — propofol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4943',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Sevoflurane — a gas whose two safety warnings rest on animals and on a biomarker, and whose
  //    one properly randomised human neurodevelopmental test came back equivalent.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sevoflurane',
    name: 'Sevoflurane',
    tradeName: 'Ultane, Sojourn',
    sponsor:
      'AbbVie (Ultane); synthesised at Baxter Travenol in the late 1960s, developed by Maruishi Pharmaceutical in Japan where it was marketed from 1990, and approved in the United States in 1995',
    targetGene: 'GABRA1, GABRB3, GLRA1, KCNK3, GRIN1',
    targetProtein:
      'No single protein. Volatile anaesthetics potentiate GABA-A and glycine receptors, activate two-pore-domain potassium channels including TASK and TREK, and inhibit NMDA receptors and presynaptic sodium channels; the beta3(N265M) knock-in mouse that abolishes propofol and etomidate anaesthesia is only slightly affected by volatile agents, which is the direct evidence that this class acts through a broader spectrum of targets',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Induction and maintenance of general anaesthesia in adult and paediatric patients for inpatient and outpatient surgery, administered only by persons trained in the administration of general anaesthesia and only from vaporisers producing predictable concentrations',
    patientFriendlyIndication:
      'A gas that puts a person to sleep for surgery and keeps them asleep, breathed in rather than injected',
    anatomicalSite:
      'Lipid-facing pockets and subunit interfaces of ion channels throughout the cortex, thalamus, brainstem and spinal cord',
    conditionContext: {
      conditionExplainer:
        'An inhaled anaesthetic is unusual among drugs in that its concentration in the brain can be inferred from the concentration in exhaled breath, breath by breath. That is what a MAC value is: the minimum alveolar concentration at which half of patients do not move in response to a surgical incision. For sevoflurane in oxygen in a 40-year-old adult, that is 2.1%, and it falls with age.',
      whyItMatters:
        'Sevoflurane is the only agent in routine use that a child will breathe without complaint, because it does not sting the airway. That single physical property — non-pungency — is why paediatric anaesthesia is done the way it is done, and why the FDA warning about anaesthetic neurotoxicity in the developing brain lands hardest on this drug.',
      whoTakesThis:
        'Most children having an operation, and a very large fraction of adults. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        "A smooth induction, a controllable and directly measurable depth, and rapid emergence. Whether the choice of a gas over an intravenous agent changes survival, cancer recurrence or a child's later intelligence is a separate set of claims, and each of them has now been tested.",
    },
    oneSentenceVerdict:
      'A fluorinated ether so insoluble in blood — a blood-gas partition coefficient of 0.63 to 0.69 — that alveolar and arterial concentrations equilibrate within minutes, giving anaesthesia you can titrate off the exhaled breath; the largest randomised test of the fear attached to it found that just under an hour of it in infancy left full-scale IQ at age five at 98.97 against 99.08 for awake-regional anaesthesia, a difference of 0.23 points.',
    laymanHowItWorks:
      "Sevoflurane is breathed in, crosses from the lung into the blood and then into the brain. It barely dissolves in blood at all, which sounds like a disadvantage and is the opposite: because the blood cannot soak much of it up, the amount in the lungs and the amount in the brain come into balance within a few minutes, in both directions. So the anaesthetist can raise or lower the depth quickly and can read the concentration off the patient's own exhaled breath. Once there, it does not act on one receptor. It nudges several kinds of ion channel at once, mostly in the direction of making neurons harder to excite.",
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 75,
    substitutes: {
      summary:
        'Within inhalational anaesthesia the choice is between three fluorinated ethers that differ mainly in solubility, pungency, degradation chemistry and greenhouse-gas potency. Outside it, the alternative is total intravenous anaesthesia with propofol, and the largest randomised comparison of the two found identical one-year mortality. Nothing in a diet or a home remedy produces general anaesthesia and nothing is listed here.',
      conventionalRx: [
        {
          name: 'Desflurane (Suprane)',
          class: 'Halogenated ether inhalational anaesthetic',
          howItCompares:
            "Even less soluble in blood, so on and off faster still, and it does not form Compound A. Against that it is pungent enough to cause coughing and laryngospasm on induction, so it is not used to send anyone to sleep, and its 100-year global warming potential is 1,620 against sevoflurane's 210.",
          typicalCost:
            'No NADAC value is held on this record for desflurane and none is asserted here',
          prosAndCons:
            "Pros: the fastest emergence of the three. Cons: airway irritation, and roughly eight times sevoflurane's climate impact per molecule emitted.",
        },
        {
          name: 'Isoflurane (Forane)',
          class: 'Halogenated ether inhalational anaesthetic',
          howItCompares:
            'More soluble in blood, so slower on and slower off, and pungent. Cheap, extremely well characterised, and still the workhorse in much of the world. Global warming potential 510 over 100 years.',
          typicalCost:
            'No NADAC value is held on this record for isoflurane and none is asserted here',
          prosAndCons:
            'Pros: inexpensive and predictable. Cons: slower recovery and an airway too irritant for gas induction.',
        },
        {
          name: 'Propofol (Diprivan)',
          class: 'Intravenous general anaesthetic',
          howItCompares:
            'The direct alternative for maintenance, and the comparison has been made at scale: in 5,400 elective coronary bypass patients, one-year mortality was 2.8% with a volatile agent and 3.0% with total intravenous anaesthesia, relative risk 0.94, P=0.71, trial stopped for futility. Propofol causes less postoperative nausea; sevoflurane can be given to a frightened child through a mask without a needle.',
          typicalCost:
            'US$0.1709 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: no operating-theatre greenhouse gas, less nausea. Cons: no equivalent of an end-tidal concentration measurement, so the dose runs on a pharmacokinetic model rather than a reading.',
        },
        {
          name: 'Nitrous oxide',
          class: 'Inhaled anaesthetic and analgesic gas',
          howItCompares:
            "Cannot produce surgical anaesthesia on its own at safe concentrations and is used as a carrier that reduces how much of the potent agent is needed. Its global warming potential is far higher and its atmospheric lifetime far longer than sevoflurane's.",
          typicalCost: 'Piped medical gas; no NADAC value applies and none is asserted here',
          prosAndCons:
            'Pros: genuine analgesia, which the volatile ethers do not provide. Cons: expands into gas-filled spaces, inactivates vitamin B12-dependent enzymes on prolonged exposure, and is a long-lived greenhouse gas.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Tell the anaesthetist about family reactions to anaesthesia',
          action:
            'Malignant hyperthermia is inherited, is triggered by every volatile agent including sevoflurane, and a family history is often the only warning available before the first episode.',
          patientImpact:
            'A known or suspected susceptibility changes the entire anaesthetic plan, from the agent chosen to the machine used.',
          clinicalPrecaution:
            'This is information to hand over, not a treatment. Malignant hyperthermia is a resuscitation emergency managed with dantrolene by the clinical team.',
        },
        {
          name: 'Expect a confused half hour in a small child',
          action:
            'Emergence agitation after sevoflurane in young children is common, self-limiting and distressing to watch: the child wakes inconsolable, thrashing and not recognising a parent, and it resolves within roughly half an hour.',
          patientImpact:
            'Knowing it is a described property of the drug rather than pain or a psychological injury changes how frightening the recovery room is for a parent.',
          clinicalPrecaution:
            'Pain must still be excluded rather than assumed away, and that judgement belongs to the recovery staff.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(OC(C(F)(F)F)C(F)(F)F)F',
      chemicalFormula: 'C4H3F7O',
      molecularWeight: '200.05 g/mol; a volatile liquid delivered as vapour, never as a solution',
      targetReceptorAffinity:
        'Volatile anaesthetics have no single dissociation constant because they have no single target. The clinically used potency measure is the minimum alveolar concentration: for sevoflurane in oxygen in a 40-year-old adult it is 2.1%, falling with age. The property that governs how the drug behaves minute to minute is solubility, not affinity: the blood-gas partition coefficient at 37 degrees C is 0.63 to 0.69, meaning very little needs to dissolve in blood before alveolar and arterial partial pressures equilibrate.',
      structureSource: {
        label: 'PubChem CID 5206 (sevoflurane) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5206',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sev-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Water content and Lewis acid inhibitor in the drug substance',
          description:
            'Sevoflurane degrades on contact with Lewis acids such as alumina, and the finished product is stabilised with water for exactly that reason. Confirm water content within specification before anything else: for this molecule an unusually dry batch is an out-of-specification batch, which is the reverse of almost every other pharmaceutical.',
          reagentsAndBuffer:
            'Karl Fischer titration for water, gas chromatography with mass spectrometry for hydrogen fluoride and degradant screening, ion chromatography for fluoride ion, glass or epoxy-lined containers rather than aluminium',
        },
        {
          id: 'sev-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fluoromethylation of hexafluoroisopropanol',
          description:
            'Build the ether by attaching a fluoromethyl group to hexafluoroisopropanol. The seven fluorines are what make the molecule inert enough to pass through a person almost unchanged, and the single remaining acidic proton on the fluoromethyl carbon is what makes it vulnerable to strong base in a carbon dioxide absorber, which is the origin of Compound A.',
          dependsOnStepId: 'sev-w1',
          reagentsAndBuffer:
            'Hexafluoroisopropanol, a fluoromethylating agent, anhydrous conditions, hydrogen fluoride handling with corrosion-resistant reactors and scrubbers',
        },
        {
          id: 'sev-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Distillation to a single volatile species and water addition',
          description:
            'Distil to remove hexafluoroisopropanol, fluoride and reaction by-products, then add the specified water content back. Purity here is assessed by what boils rather than by what crystallises, and the acceptance criterion includes the absence of degradants that would signal acid exposure in the plant.',
          dependsOnStepId: 'sev-w2',
          reagentsAndBuffer:
            'Fractional distillation, purified water to specification, gas chromatography for assay and related substances, fluoride-specific ion electrode',
        },
        {
          id: 'sev-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Closed-circuit degradation study against soda lime and desiccated absorbent',
          description:
            'Circulate vapour through a carbon dioxide absorber under controlled temperature, fresh gas flow and absorbent hydration, and measure inspired Compound A. This is the delivery step that matters for this molecule, because the patient does not receive what the vaporiser produces — they receive what survives the breathing circuit, and desiccated potassium hydroxide absorbents change that dramatically.',
          dependsOnStepId: 'sev-w3',
          reagentsAndBuffer:
            'Circle absorber system, soda lime and potassium hydroxide-containing absorbent, controlled fresh gas flows from 0.5 to 6 L/min, absorbent temperature probes, gas chromatography with mass spectrometry for pentafluoroisopropenyl fluoromethyl ether',
        },
        {
          id: 'sev-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sensitive renal biomarkers, not creatinine',
          description:
            'Measure urinary albumin, glucose, alpha-glutathione-S-transferase and pi-glutathione-S-transferase before and after exposure. This is the step the reassurance literature skipped. Eger and colleagues showed that serum creatinine and blood urea nitrogen failed to reveal the injury the sensitive markers detected in the same volunteers, and the large pooled study that followed used creatinine and urea as its outcome.',
          dependsOnStepId: 'sev-w4',
          reagentsAndBuffer:
            'Timed 24-hour urine collections, immunoassay for urinary albumin, enzymatic glucose assay, enzyme-linked immunosorbent assays for alpha-GST and pi-GST, serum creatinine and blood urea nitrogen as insensitive comparators, vasopressin concentrating test',
        },
        {
          id: 'sev-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Infrared cross-section and atmospheric lifetime',
          description:
            'Measure the infrared absorption spectrum and derive the radiative efficiency and global warming potential. A theatre vents essentially all of the delivered agent unchanged to the atmosphere, so the environmental term is a measured property of the molecule rather than an externality that can be argued about.',
          dependsOnStepId: 'sev-w5',
          reagentsAndBuffer:
            'Fourier transform infrared spectroscopy across the atmospheric window, calibrated gas cells, atmospheric lifetime estimation, radiative forcing calculation weighted by absorption wavelength',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sev-a1',
        category: 'measured',
        title: 'GAS: an hour of sevoflurane in infancy left IQ at five years unchanged',
        laymanSummary:
          'The strongest fear about this drug is that it damages a developing brain. Seven hundred and twenty-two babies were randomly assigned to a sevoflurane anaesthetic or to an awake spinal for the same hernia operation, and their intelligence was measured at five. The difference was a quarter of a point.',
        technicalDetails:
          'The GAS trial recruited infants under 60 weeks postmenstrual age, born after 26 weeks gestation, undergoing inguinal herniorrhaphy, with no previous general anaesthesia and no risk factors for neurological injury, at 28 hospitals in seven countries. They were randomised 1:1 to awake-regional anaesthesia or sevoflurane-based general anaesthesia; assessors were masked. The primary outcome was full-scale IQ on the Wechsler Preschool and Primary Scale of Intelligence, third edition, at five years, with a predefined clinical equivalence margin of 5 points. Of 4,023 infants screened, 722 were randomised, 363 to awake-regional and 359 to general anaesthesia. Median duration of general anaesthesia was 54 minutes (IQR 41 to 70). Mean full-scale IQ was 99.08 (SD 18.35) with awake-regional and 98.97 (SD 19.66) with general anaesthesia, a difference in means of 0.23 (95% CI -2.59 to 3.06) — strong evidence of equivalence, with the confidence interval well inside the margin. The intention-to-treat analysis agreed. The trial is explicit about its scope: it tested slightly under an hour of anaesthesia, once, in a predominantly male population.',
        evidenceSource:
          'McCann ME, de Graaff JC, Dorris L, et al. Neurodevelopmental outcome at 5 years of age after general anaesthesia or awake-regional anaesthesia in infancy (GAS). Lancet 2019;393:664-677 (NCT00756600)',
        doi: '10.1016/S0140-6736(18)32485-1',
        measuredMetric:
          'Full-scale intelligence quotient at five years, per protocol, against a predefined equivalence margin of 5 points',
        auditFlag: 'verified',
      },
      {
        id: 'sev-a2',
        category: 'inferred',
        title: 'The paediatric neurotoxicity warning on the label rests on animal studies',
        laymanSummary:
          "The label warns that anaesthetics used for more than three hours in a very young child may cause lasting cognitive harm. In the label's own words, that comes from published animal studies, and the clinical significance is not clear.",
        technicalDetails:
          'The approved United States label states that published animal studies demonstrate that anaesthetic and sedation drugs which block NMDA receptors or potentiate GABA activity increase neuronal apoptosis in the developing brain and result in long-term cognitive deficits when used for longer than three hours, and that the clinical significance of these findings is not clear. It places the window of vulnerability from the third trimester through the first several months of life, possibly extending to about three years of age in humans. It notes that some published studies in children suggest similar deficits after repeated or prolonged exposure, that those studies have substantial limitations, and that it is not clear whether the observed effects are due to the drugs or to the surgery and underlying illness. This audit is not a claim that the warning is wrong. It is a statement of what supports it: an animal model, plus observational human studies the label itself describes as substantially limited, against one randomised human trial of a single short exposure that found equivalence. The warning is an inference from apoptosis in rodent brains to intelligence in human children, and the label says so.',
        evidenceSource:
          'FDA-approved US prescribing information for sevoflurane, WARNINGS — Pediatric Neurotoxicity (DailyMed SPL 22700993-851a-48aa-941e-1d2b6b04081f)',
        inferredClaim:
          'That anaesthetic-induced neuronal apoptosis in developing animal brains predicts cognitive harm in young children — an extrapolation the label explicitly declines to confirm',
        auditFlag: 'caution',
      },
      {
        id: 'sev-a3',
        category: 'conclusion_shift',
        title:
          'Compound A: real biomarker injury in volunteers, then reassurance measured the wrong thing',
        laymanSummary:
          'Sevoflurane breaks down in the anaesthetic machine into a compound that damages rat kidneys. In volunteers, careful urine tests found genuine kidney injury markers — and the routine blood tests missed it entirely. The large study that reassured everyone used those routine blood tests.',
        technicalDetails:
          "Sevoflurane reacts with the strong base in carbon dioxide absorbents to form pentafluoroisopropenyl fluoromethyl ether, known as Compound A, and the amount formed rises as fresh gas flow falls. Eger and colleagues gave fluid-restricted volunteers eight hours of 1.25 MAC sevoflurane (n=10) or desflurane (n=9) at 2 L/min in a standard circle absorber. Mean inspired Compound A was 41 +/- 3 ppm. Desflurane produced no renal injury. Sevoflurane produced transient injury at three sites: glomerular, shown by post-anaesthetic albuminuria; proximal tubular, shown by glucosuria and raised urinary alpha-glutathione-S-transferase; and distal tubular, shown by raised urinary pi-glutathione-S-transferase. The magnitude varied enormously between subjects — on day 3, 24-hour albumin excretion ranged from normal in one volunteer to 4.4 g in another. Critically, neither agent changed serum creatinine or blood urea nitrogen, and neither changed urinary concentrating ability in response to vasopressin: in the authors' words, these measures failed to reveal the injury produced. Three years later Mazze and colleagues pooled 22 trials with 3,436 adult surgical patients — 1,941 sevoflurane, 1,495 control — and found similar incidences of raised serum creatinine and blood urea nitrogen, with no trend by fresh gas flow rate or absorbent type. That is a real and useful result about clinically apparent nephrotoxicity, and it uses precisely the two measurements the volunteer study had shown to be insensitive to the injury in question. The label still restricts fresh gas flow.",
        evidenceSource:
          'Eger EI 2nd, Koblin DD, Bowland T, et al. Anesth Analg 1997;84:160-168; Mazze RI, Callan CM, Galvez ST, Delgado-Herrera L, Mayer DB. Anesth Analg 2000;90:683-688',
        doi: '10.1097/00000539-199701000-00029',
        inferredClaim:
          'That normal postoperative serum creatinine and blood urea nitrogen across 3,436 patients rules out the renal injury Compound A produces — using the two markers the volunteer study reported as insensitive to it',
        auditFlag: 'contested',
      },
      {
        id: 'sev-a4',
        category: 'failed',
        title: 'MYRIAD: volatile cardioprotection did not exist at the scale of a mortality trial',
        laymanSummary:
          'Laboratory work had shown for decades that these gases protect heart muscle from injury during interrupted blood supply. Five thousand four hundred bypass patients were randomised to gas or intravenous anaesthesia, and after a year the death rates were 2.8% and 3.0%.',
        technicalDetails:
          'Landoni and colleagues randomised 5,400 patients at 36 centres in 13 countries scheduled for elective coronary artery bypass grafting to an intraoperative regimen including desflurane, isoflurane or sevoflurane, or to total intravenous anaesthesia. On-pump bypass was used in 64%, mean bypass duration 79 minutes. Death from any cause at one year, the primary outcome, was 2.8% versus 3.0% (relative risk 0.94, 95% CI 0.69 to 1.29, P=0.71), with data for 99.1% of patients; 30-day mortality was 1.4% versus 1.3%. No secondary outcome and no prespecified adverse event differed, including myocardial infarction. The data and safety monitoring board stopped the trial for futility at the second interim analysis. Anaesthetic preconditioning is a well-replicated laboratory phenomenon, and this is what happened when it was asked to move a clinical endpoint in the population where it should have been easiest to see.',
        evidenceSource:
          'Landoni G, Lomivorotov VV, Nigro Neto C, et al. Volatile anesthetics versus total intravenous anesthesia for cardiac surgery. N Engl J Med 2019;380:1214-1225 (NCT02105610)',
        doi: '10.1056/NEJMoa1816476',
        measuredMetric:
          'Death from any cause at one year after elective coronary artery bypass grafting',
        auditFlag: 'verified',
      },
      {
        id: 'sev-a5',
        category: 'failed',
        title: 'BALANCED: running the gas deeper or lighter did not change one-year survival',
        laymanSummary:
          'Observational studies had linked deeper anaesthesia to dying sooner afterwards. Six and a half thousand older patients were randomised to a light or a deep target on a brain monitor. One-year death was 6.5% and 7.2%.',
        technicalDetails:
          'Short and colleagues recruited patients aged 60 and over with significant comorbidity, having surgery expected to last more than two hours, at 73 centres in seven countries, and randomised 6,644 to light general anaesthesia at a bispectral index target of 50 or deep general anaesthesia at a target of 35. The separation achieved was real: median bispectral index 47.2 against 38.8, mean arterial pressure 3.5 mmHg higher in the light group, and volatile anaesthetic use 0.26 minimum alveolar concentration — about 30% — lower in the light group. One-year all-cause mortality, the primary outcome, was 6.5% (212 patients) against 7.2% (238), hazard ratio 0.88, 95% CI 0.73 to 1.07, absolute risk reduction 0.8% (95% CI -0.5 to 2.0). Grade 3 and grade 4 adverse events were the same in both arms. The trial defines a broad range of anaesthetic depth over which no mortality difference is detectable, and it is included here because the observational association it tested was widely believed and is a textbook example of confounding by patient frailty.',
        evidenceSource:
          'Short TG, Campbell D, Frampton C, et al. Anaesthetic depth and complications after major surgery: an international, randomised controlled trial. Lancet 2019;394:1907-1914 (ACTRN12612000632897)',
        doi: '10.1016/S0140-6736(19)32315-3',
        measuredMetric:
          'One-year all-cause mortality in older patients at increased risk after major surgery',
        auditFlag: 'verified',
      },
      {
        id: 'sev-a6',
        category: 'measured',
        title: 'A 100-year global warming potential of 210, measured from its infrared spectrum',
        laymanSummary:
          'Almost all of the gas a patient breathes in is breathed straight back out and vented to the atmosphere unchanged. Its heat-trapping power was measured directly: 210 times that of carbon dioxide over a century.',
        technicalDetails:
          'Sulbaek Andersen and colleagues measured the infrared spectra of isoflurane, desflurane and sevoflurane and calculated their contribution to radiative forcing, accounting for the wavelength dependence of the effect. Radiative efficiencies were 0.453, 0.469 and 0.351 W m^-2 ppb^-1 and 100-year global warming potentials were 510, 1,620 and 210 respectively. On that basis the average climate impact per anaesthetic procedure at the University of Michigan was equivalent to about 22 kg of carbon dioxide, and global emissions of inhalation anaesthetics were estimated to have a climate impact comparable to one coal-fired power plant or a million passenger cars. This is on the page because it is a directly measured property of the molecule that differs eightfold between agents that are otherwise interchangeable, and it is a real basis for choosing between them that has nothing to do with the patient in front of you.',
        evidenceSource:
          'Sulbaek Andersen MP, Sander SP, Nielsen OJ, Wagner DS, Sanford TJ Jr, Wallington TJ. Inhalation anaesthetics and climate change. Br J Anaesth 2010;105:760-766',
        doi: '10.1093/bja/aeq259',
        measuredMetric:
          'Radiative efficiency in W m^-2 ppb^-1 and 100-year global warming potential derived from measured infrared spectra',
        auditFlag: 'verified',
      },
      {
        id: 'sev-a7',
        category: 'measured',
        title: 'Malignant hyperthermia is a labelled trigger, and it is inherited',
        laymanSummary:
          'In people with a particular inherited muscle variant, this gas can set off a runaway rise in body temperature and muscle breakdown. It is on the label as a contraindication and it is genetic.',
        technicalDetails:
          'The approved label contraindicates sevoflurane in patients with known or suspected genetic susceptibility to malignant hyperthermia, and its warnings describe the hypermetabolic state with muscle rigidity, hyperkalaemia and resistant arrhythmias, advising early and aggressive treatment of hyperkalaemia and subsequent evaluation for latent neuromuscular disease. Susceptibility is associated with variants in the ryanodine receptor gene RYR1 and in CACNA1S, and the label notes that variant pathogenicity should be assessed on clinical experience, functional studies and prevalence data. This audit is filed as measured rather than inferred because the trigger relationship is a labelled, mechanistically characterised, genetically defined phenomenon and not a statistical association.',
        evidenceSource:
          'FDA-approved US prescribing information for sevoflurane, CONTRAINDICATIONS and WARNINGS — Malignant Hyperthermia (DailyMed SPL 22700993-851a-48aa-941e-1d2b6b04081f)',
        measuredMetric:
          'Labelled contraindication with named susceptibility genes RYR1 and CACNA1S',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Vaporised into the breathing circuit at a set percentage',
        laymanDesc:
          'A calibrated vaporiser turns the liquid into a precise percentage of the gas being breathed. Unlike an injected drug, the dose can be turned down as easily as it was turned up.',
        molecularDetail:
          "The label requires vaporisers producing predictable concentrations, because the depth of anaesthesia can change rapidly. Saturated vapour pressure and the agent-specific vaporiser design are what make a percentage dial meaningful; sevoflurane's non-pungency, unusual in this class, is what allows a mask induction without airway irritation.",
        iconName: 'Wind',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It barely dissolves in blood, which is why it is fast',
        laymanDesc:
          'Blood can only soak up a small amount of it. That means the concentration in the lungs and the concentration reaching the brain come into balance within minutes, in both directions.',
        molecularDetail:
          'The blood-gas partition coefficient at 37 degrees C is 0.63 to 0.69, among the lowest of the agents in routine use. Low solubility means a small amount dissolved is needed before alveolar partial pressure equals arterial partial pressure, so wash-in and wash-out are both rapid and the end-tidal concentration is a usable proxy for the brain concentration.',
        iconName: 'Gauge',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It acts on many channels, not one receptor',
        laymanDesc:
          'There is no single lock this key fits. It nudges several kinds of ion channel at once, all in the direction of quietening neurons.',
        molecularDetail:
          'Volatile anaesthetics potentiate GABA-A and glycine receptors, activate two-pore-domain potassium channels of the TASK and TREK families, inhibit NMDA receptors and depress presynaptic sodium channels and transmitter release. The decisive evidence that this is genuinely multi-target is genetic: beta3(N265M) knock-in mice lose the anaesthetic action of propofol and etomidate entirely and are only slightly less sensitive to enflurane and halothane.',
        iconName: 'Network',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Cortical and thalamic communication breaks down',
        laymanDesc:
          'As the concentration rises, the parts of the brain that normally talk to each other stop doing so in a coordinated way, and consciousness ends.',
        molecularDetail:
          'The practical potency measure is minimum alveolar concentration: 2.1% in oxygen for a 40-year-old adult, falling with age, and defined as the concentration preventing movement to surgical incision in half of subjects. Immobility at MAC is largely a spinal cord effect, while unconsciousness occurs at lower concentrations, so the single number conflates two separable endpoints.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Some of it is degraded in the machine, not in the patient',
        laymanDesc:
          'The carbon dioxide absorber in the anaesthetic machine contains a strong base, and it attacks the molecule to produce a breakdown product that is toxic to rat kidneys. The lower the fresh gas flow, the more of it forms.',
        molecularDetail:
          'Strong base extracts the acidic proton from the fluoromethyl group, eliminating hydrogen fluoride to give pentafluoroisopropenyl fluoromethyl ether, Compound A, with trace Compound B. Formation rises with absorbent temperature, sevoflurane concentration, desiccation of the absorbent — especially potassium hydroxide-containing types — and falling fresh gas flow. The label restricts exposure at flows of 1 to under 2 L/min and does not recommend flows below 1 L/min.',
        iconName: 'FlaskConical',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'It is breathed back out almost entirely unchanged',
        laymanDesc:
          "Only a small fraction is metabolised. The rest leaves through the lungs the way it came in, and then leaves the building through the theatre's scavenging system into the atmosphere.",
        molecularDetail:
          'Roughly 3 to 5% undergoes hepatic defluorination by CYP2E1, producing inorganic fluoride and hexafluoroisopropanol, which is glucuronidated; the rest is exhaled. Because elimination is by ventilation rather than metabolism, emergence tracks the same low solubility that made induction fast. The exhaled remainder is vented, which is why a measured 100-year global warming potential of 210 is a property of the treatment and not a footnote to it.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'GAS — general anaesthesia versus awake-regional anaesthesia in infancy (NCT00756600)',
        phase: 'International assessor-masked randomised controlled equivalence trial',
        sampleSize: 722,
        primaryEndpoint:
          'Full-scale intelligence quotient on WPPSI-III at five years of age, equivalence margin 5 points',
        endpointMet: true,
        statisticalPValue:
          'Mean FSIQ 99.08 (SD 18.35) awake-regional versus 98.97 (SD 19.66) general anaesthesia; difference in means 0.23 (95% CI -2.59 to 3.06) — equivalence demonstrated',
        unreportedAdverseSignals:
          'The trial tested a median 54 minutes of anaesthesia, once, in a predominantly male population, and there were 74 protocol violations in the awake-regional arm against two in the general anaesthesia arm. It cannot speak to repeated or prolonged exposure.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'MYRIAD — volatile anaesthetics versus total intravenous anaesthesia for cardiac surgery (NCT02105610)',
        phase: 'Pragmatic multicentre single-blind randomised controlled trial',
        sampleSize: 5400,
        primaryEndpoint:
          'Death from any cause at one year after elective coronary artery bypass grafting',
        endpointMet: false,
        statisticalPValue:
          '2.8% volatile versus 3.0% intravenous; relative risk 0.94, 95% CI 0.69 to 1.29, P=0.71',
        unreportedAdverseSignals:
          'Stopped for futility at the second interim analysis; no secondary outcome or prespecified adverse event differed, including myocardial infarction.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BALANCED — anaesthetic depth and complications after major surgery',
        phase: 'International randomised controlled trial at 73 centres in 7 countries',
        sampleSize: 6644,
        primaryEndpoint:
          'One-year all-cause mortality in older patients at increased risk after major surgery',
        endpointMet: false,
        statisticalPValue:
          '6.5% at bispectral index target 50 versus 7.2% at target 35; hazard ratio 0.88, 95% CI 0.73 to 1.07, absolute risk reduction 0.8% (95% CI -0.5 to 2.0)',
        unreportedAdverseSignals:
          'Separation was achieved — median bispectral index 47.2 versus 38.8 and 30% less volatile agent in the light group — so this is a negative result rather than a failed intervention.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Eger volunteer comparison of sevoflurane and desflurane renal injury markers',
        phase: 'Controlled volunteer study',
        sampleSize: 19,
        primaryEndpoint:
          'Urinary albumin, glucose, alpha-glutathione-S-transferase and pi-glutathione-S-transferase after 8 hours at 1.25 MAC',
        endpointMet: true,
        statisticalPValue:
          'Sevoflurane produced transient glomerular, proximal tubular and distal tubular injury markers at a mean inspired Compound A of 41 +/- 3 ppm; desflurane produced none. Serum creatinine and blood urea nitrogen were unchanged by either agent.',
        unreportedAdverseSignals:
          'Between-subject variation was extreme: 24-hour albumin excretion on day 3 ranged from normal to 4.4 g. Sevoflurane also produced small rises in serum alanine aminotransferase, suggesting mild transient hepatic injury.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Mazze pooled analysis of renal function across 22 sevoflurane trials',
        phase: 'Retrospective pooled analysis of 22 clinical trials',
        sampleSize: 3436,
        primaryEndpoint: 'Postoperative change in serum creatinine and blood urea nitrogen',
        endpointMet: true,
        statisticalPValue:
          'Similar incidences of raised serum creatinine and blood urea nitrogen between 1,941 sevoflurane and 1,495 control patients; no trend by fresh gas flow rate, nephrotoxic antibiotic co-treatment or absorbent type, for exposures under 4 MAC-hours',
        unreportedAdverseSignals:
          'The two outcome measures are the two the volunteer study explicitly reported as having failed to reveal the injury it detected with sensitive markers. This is a valid result about clinically apparent nephrotoxicity and not a refutation of the biomarker finding.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A blood-gas partition coefficient of 0.63 to 0.69 at 37 degrees C, and a minimum alveolar concentration of 2.1% in oxygen for a 40-year-old adult',
        'Full-scale IQ at five years of 98.97 after infant sevoflurane anaesthesia against 99.08 after awake-regional, difference 0.23 points (95% CI -2.59 to 3.06)',
        'One-year mortality of 2.8% with a volatile agent against 3.0% with total intravenous anaesthesia in 5,400 bypass patients',
        'One-year mortality of 7.2% at deep against 6.5% at light anaesthetic depth in 6,644 older surgical patients',
        'Transient glomerular and tubular injury markers in volunteers at a mean inspired Compound A of 41 ppm, with serum creatinine and urea unchanged',
        'A radiative efficiency of 0.351 W m^-2 ppb^-1 and a 100-year global warming potential of 210, measured from the infrared spectrum',
      ],
      unsupportedInferences: [
        'That neuronal apoptosis in developing animal brains predicts cognitive harm in children — the label states the clinical significance is not clear, and the one randomised human test found equivalence',
        'That normal creatinine and urea across 3,436 patients rules out Compound A renal injury, when the volunteer study reported those exact measures as insensitive to it',
        'That laboratory anaesthetic preconditioning of myocardium translates into fewer deaths after bypass surgery',
        'That the observed association between deep anaesthesia and later death is causal rather than a marker of how sick the patient was',
        'That a gas induction avoiding a needle in a frightened child is a trivial advantage; it is not measured in any trial here, and it is the main reason this agent exists in paediatric practice',
      ],
      whatFailedInitially: [
        'Volatile cardioprotection, tested in 5,400 bypass patients and stopped for futility',
        'The depth-of-anaesthesia mortality hypothesis, tested in 6,644 patients with a real 9-point bispectral index separation and no survival difference',
        'The original assumption that Compound A was a rodent-only concern — sensitive urinary markers found real, if transient, human injury',
        'Equally, the assumption that Compound A causes clinically important nephrotoxicity in ordinary practice, which 3,436 patients did not support',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines, and the standard agent for inhalational induction in children worldwide because it does not irritate the airway',
        'No CMS National Average Drug Acquisition Cost value is held on this record for sevoflurane, so no United States acquisition price is stated here',
        'Its label still restricts fresh gas flow because of Compound A, three decades after the human outcome data failed to show clinically apparent renal injury — a warning that has outlived the strength of its evidence in either direction',
        "Its measured global warming potential of 210, against desflurane's 1,620, has become a real basis for institutional agent choice",
      ],
    },
    deliverySystem: {
      type: 'Volatile liquid for inhalation, delivered as vapour from an agent-specific calibrated vaporiser into a circle breathing system, with a carbon dioxide absorber and scavenging',
      description:
        'The delivery system is a machine, not a formulation, and the machine changes the drug. Fresh gas flow, absorbent chemistry and absorbent hydration determine how much Compound A the patient inhales, so the same vaporiser setting delivers different exposures on different circuits. The agent is stabilised with water because it degrades on contact with Lewis acids. Uniquely among the agents in routine use it is non-pungent, which is why a child can be anaesthetised through a mask without a cannula, and that property is a physical fact about the molecule rather than a clinical claim.',
      safetyProfile:
        "Contraindicated in known or suspected genetic susceptibility to malignant hyperthermia, which every volatile agent triggers. The label warns of Compound A-associated renal injury and restricts fresh gas flow accordingly, and carries the class Pediatric Neurotoxicity warning describing animal evidence of neuronal apoptosis with exposures over three hours in the developing brain, with the clinical significance stated as unclear. Emergence agitation in young children is common and self-limiting. Reaction with desiccated carbon dioxide absorbents, particularly potassium hydroxide-containing types, has caused extreme absorber heating and fire. Depth changes rapidly, which is the drug's main advantage and the reason the label restricts administration to trained personnel with vaporisers of predictable output. No dosing guidance appears on this page.",
    },
    commonQuestions: [
      {
        q: "Will an anaesthetic damage my child's brain?",
        a: 'The best evidence available says a single short anaesthetic in infancy does not. The GAS trial randomised 722 babies having the same hernia operation to either a sevoflurane general anaesthetic or an awake spinal, and measured full-scale IQ at age five with masked assessors and a predefined equivalence margin of 5 points. Median anaesthetic duration was 54 minutes. Mean IQ was 98.97 with general anaesthesia and 99.08 with awake-regional — a difference of 0.23 points, with a confidence interval from -2.59 to 3.06, comfortably inside the margin. That is a positive demonstration of equivalence, not merely a failure to find a difference. What it does not cover is repeated anaesthetics or exposures of several hours, which is exactly what the FDA warning is about, and there is no randomised trial of those.',
      },
      {
        q: 'Then why does the label carry a neurotoxicity warning?',
        a: "Because of what happens to animals. The label says it plainly: published animal studies show that drugs blocking NMDA receptors or potentiating GABA increase neuronal apoptosis in the developing brain and cause long-term cognitive deficits when used for longer than three hours, and that the clinical significance of those findings is not clear. It places the vulnerable window from the third trimester through the first months of life, possibly to about three years. It acknowledges human studies suggesting similar deficits after repeated or prolonged exposure, and says those studies have substantial limitations and cannot separate the drug from the surgery and the underlying illness. So the warning is an extrapolation from rodent apoptosis, hedged in the label's own text, and this page records it as one.",
        auditNote:
          'The warning may well be right for long or repeated exposures. It is filed as an inference because that is what the label itself calls it.',
      },
      {
        q: 'What is Compound A and should I care?',
        a: 'It is what sevoflurane turns into inside the anaesthetic machine. The carbon dioxide absorber contains a strong base, which strips a proton off the molecule and produces a fluorinated alkene that is nephrotoxic to rats. Less fresh gas flow means more of it. In volunteers given eight hours at 1.25 MAC with 41 parts per million of Compound A, sensitive urine tests picked up genuine injury to the filtering unit and both tubules — but serum creatinine and urea, the tests a hospital actually runs, showed nothing, and the authors said so explicitly. A later pooled analysis of 3,436 surgical patients then used creatinine and urea and found no difference. Both results are true and they answer different questions. What is fair to say is that clinically apparent kidney injury from sevoflurane has not been demonstrated in ordinary practice, and that the reassurance rests on a measurement already known to be insensitive.',
        auditNote:
          'This is the clearest measurement-selection problem in the file: the confirming study used the endpoint the earlier study had reported as blind to the effect.',
      },
      {
        q: 'Is gas or intravenous anaesthesia better?',
        a: 'On death at one year, neither. MYRIAD randomised 5,400 patients having elective coronary bypass — the population where a difference should have been easiest to find, because volatile agents were believed to protect heart muscle — to a gas or to propofol. One-year mortality was 2.8% and 3.0%, relative risk 0.94, P=0.71, and the trial stopped for futility. Thirty-day mortality and myocardial infarction were the same too. There are real differences between the two: gas gives you a breath-by-breath concentration measurement that propofol has no equivalent of, propofol causes less postoperative nausea, gas allows a needle-free induction in a child, and propofol vents no greenhouse gas. Survival is not on that list.',
      },
      {
        q: 'Does the anaesthetist keep me deeper than necessary, and is that dangerous?',
        a: 'It was believed to be, and then it was tested. Observational studies had repeatedly found that patients kept more deeply anaesthetised died sooner afterwards. The BALANCED trial randomised 6,644 older patients with significant illness to a light target or a deep target on a processed EEG monitor, and achieved a real separation — a median bispectral index of 47 against 39, with 30% less volatile agent used in the light group. One-year mortality was 6.5% against 7.2%, hazard ratio 0.88 with a confidence interval crossing 1. The most likely explanation for the original association is that sicker patients need less anaesthetic to reach a given depth, so depth was acting as a marker of frailty rather than a cause of death.',
      },
      {
        q: 'Is it true that anaesthetic gases are a climate problem?',
        a: 'Yes, and the size of it has been measured rather than estimated. Almost all of the agent a patient breathes in is breathed straight back out and vented unchanged. Researchers measured the infrared absorption spectra of the three agents in routine use and calculated radiative efficiencies of 0.453, 0.469 and 0.351 W m^-2 ppb^-1 for isoflurane, desflurane and sevoflurane, giving 100-year global warming potentials of 510, 1,620 and 210. On that basis an average anaesthetic at one large United States hospital was equivalent to about 22 kg of carbon dioxide, and global inhalational anaesthetic emissions were put on a par with one coal-fired power plant or a million cars. Sevoflurane is the least damaging of the three fluorinated ethers by a wide margin, which is one reason desflurane use has fallen sharply.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey holds no value for sevoflurane on this record. That survey measures what United States retail pharmacies pay, and a volatile liquid supplied in bottles to hospital operating theatres does not pass through retail pharmacy. Rather than substitute a list price or an estimate, this page shows nothing. No verified per-dose cost-of-production figure exists for it either.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McCann ME, de Graaff JC, Dorris L, et al. Neurodevelopmental outcome at 5 years of age after general anaesthesia or awake-regional anaesthesia in infancy (GAS): an international, multicentre, randomised, controlled equivalence trial. Lancet 2019;393:664-677',
        identifier: '10.1016/S0140-6736(18)32485-1',
        kind: 'doi',
      },
      {
        label: 'NCT00756600 — GAS, general anaesthesia compared to spinal anaesthesia in infancy',
        identifier: 'NCT00756600',
        kind: 'nct',
      },
      {
        label:
          'Eger EI 2nd, Koblin DD, Bowland T, et al. Nephrotoxicity of sevoflurane versus desflurane anesthesia in volunteers. Anesth Analg 1997;84:160-168',
        identifier: '10.1097/00000539-199701000-00029',
        kind: 'doi',
      },
      {
        label:
          'Mazze RI, Callan CM, Galvez ST, Delgado-Herrera L, Mayer DB. The effects of sevoflurane on serum creatinine and blood urea nitrogen concentrations: a retrospective, twenty-two-center, comparative evaluation of renal function in adult surgical patients. Anesth Analg 2000;90:683-688',
        identifier: '10.1097/00000539-200003000-00032',
        kind: 'doi',
      },
      {
        label:
          'Landoni G, Lomivorotov VV, Nigro Neto C, et al. Volatile anesthetics versus total intravenous anesthesia for cardiac surgery. N Engl J Med 2019;380:1214-1225',
        identifier: '10.1056/NEJMoa1816476',
        kind: 'doi',
      },
      {
        label:
          'Short TG, Campbell D, Frampton C, et al. Anaesthetic depth and complications after major surgery: an international, randomised controlled trial. Lancet 2019;394:1907-1914',
        identifier: '10.1016/S0140-6736(19)32315-3',
        kind: 'doi',
      },
      {
        label:
          'Sulbaek Andersen MP, Sander SP, Nielsen OJ, Wagner DS, Sanford TJ Jr, Wallington TJ. Inhalation anaesthetics and climate change. Br J Anaesth 2010;105:760-766',
        identifier: '10.1093/bja/aeq259',
        kind: 'doi',
      },
      {
        label:
          'FDA-approved US prescribing information for sevoflurane (DailyMed structured product label, Baxter Healthcare Corporation) — Pediatric Neurotoxicity warning, Compound A and fresh gas flow restriction, malignant hyperthermia contraindication',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=22700993-851a-48aa-941e-1d2b6b04081f',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5206 — sevoflurane structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5206',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Rocuronium — a paralysing agent that is measurably worse than the drug it replaced at the
  //    one job it was designed to take over, and is used anyway for reasons the trials do not test.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rocuronium',
    name: 'Rocuronium',
    tradeName: 'Zemuron; marketed as Esmeron outside the United States',
    sponsor:
      'Organon USA Inc. (originator and US label holder at approval); developed at Organon in the Netherlands as a low-potency, fast-onset aminosteroid and approved in the United States in 1994',
    targetGene: 'CHRNA1, CHRNB1, CHRND, CHRNE',
    targetProtein:
      'Nicotinic acetylcholine receptor of the adult neuromuscular junction — the pentamer of two alpha1, one beta1, one delta and one epsilon subunit — occupied competitively at the acetylcholine binding sites on the alpha1 subunits without opening the channel',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1994,
    indication:
      'Adjunct to general anaesthesia in inpatients and outpatients to facilitate both rapid sequence and routine tracheal intubation, and to provide skeletal muscle relaxation during surgery or mechanical ventilation',
    patientFriendlyIndication:
      'Paralysing the muscles so a breathing tube can be placed and so the body stays still during an operation',
    anatomicalSite:
      'Postsynaptic membrane of the motor endplate, at the neuromuscular junction of skeletal muscle',
    conditionContext: {
      conditionExplainer:
        'A nerve tells a muscle to contract by releasing acetylcholine into a gap a few tens of nanometres wide. On the far side, receptors bind it and open a channel that depolarises the muscle fibre. Rocuronium sits in those binding sites without opening anything. The nerve fires, the transmitter is released, and nothing happens.',
      whyItMatters:
        'Paralysis is what makes tracheal intubation reliable and abdominal surgery possible. It also removes every sign by which an anaesthetist would otherwise notice that a patient is inadequately anaesthetised, which is why awareness under anaesthesia is overwhelmingly a problem of paralysed patients.',
      whoTakesThis:
        'Most adults having a general anaesthetic with a breathing tube, and most patients intubated in an emergency department or intensive care unit.',
      clinicalGoals:
        'Complete, reversible relaxation of skeletal muscle for a defined period. Whether using a paralysing agent improves anything a patient would recognise, once the tube is in, is a separate question — and the largest prospective study of it found the association pointing the wrong way.',
    },
    oneSentenceVerdict:
      'A steroid-backbone competitive blocker of the neuromuscular junction, deliberately made weak so that more molecules can be given and onset is fast — and, across 50 randomised trials and 4,151 participants, measurably worse than the 1952 drug it was meant to replace at producing excellent intubating conditions, with a risk ratio of 0.86.',
    laymanHowItWorks:
      'Nerves make muscles contract by releasing a chemical called acetylcholine onto receptors on the muscle. Rocuronium is shaped enough like acetylcholine to occupy those receptors, but not enough like it to switch them on. So it sits in the way. The nerve keeps signalling and the muscle stays limp until the drug diffuses away or is chemically removed. It is deliberately a weak drug: because a weak drug has to be given in large numbers of molecules, the concentration gradient driving it into the junction is steep, and it arrives fast.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 73,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3942 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 22 April 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent and widely genericised, with 24 listed United States products. The economically interesting molecule in this story is not rocuronium but its antidote: sugammadex remained single-source and patented long after rocuronium itself became a commodity, so the cost of a rocuronium anaesthetic is dominated by how it is reversed rather than by the relaxant.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        "The choice is between the depolarising agent, succinylcholine, and the non-depolarising ones. For rapid sequence intubation the pooled randomised evidence favours succinylcholine on intubating conditions; rocuronium is chosen where succinylcholine's specific harms — hyperkalaemia, malignant hyperthermia trigger, myalgia, prolonged block in cholinesterase deficiency — are unacceptable. Among non-depolarising agents the difference is mostly duration, metabolism and reversibility. Nothing in a diet paralyses a muscle and nothing is listed here.",
      conventionalRx: [
        {
          name: 'Succinylcholine (Anectine, Quelicin)',
          class: 'Depolarising neuromuscular blocking agent',
          howItCompares:
            'In 50 randomised trials with 4,151 participants, succinylcholine was superior for excellent intubating conditions (risk ratio 0.86, 95% CI 0.81 to 0.92) and for clinically acceptable conditions (risk ratio 0.97, 95% CI 0.95 to 0.99). At the highest rocuronium dose studied there was no statistical difference in conditions, and the review still called succinylcholine clinically superior because its block wears off in minutes.',
          typicalCost:
            'No NADAC value is held on this record for succinylcholine and none is asserted here',
          prosAndCons:
            'Pros: fastest onset, shortest duration, best intubating conditions. Cons: a boxed warning for cardiac arrest in children with undiagnosed myopathy, malignant hyperthermia trigger, hyperkalaemia, and prolonged paralysis in butyrylcholinesterase deficiency.',
        },
        {
          name: 'Vecuronium (Norcuron)',
          class: 'Aminosteroid non-depolarising neuromuscular blocking agent',
          howItCompares:
            'The close structural relative rocuronium was derived from — more potent, and therefore slower in onset by the same logic that makes rocuronium fast. Also encapsulated by sugammadex, though less avidly than rocuronium.',
          typicalCost:
            'No NADAC value is held on this record for vecuronium and none is asserted here',
          prosAndCons:
            'Pros: haemodynamically quiet, well characterised. Cons: slower onset makes it unsuitable for rapid sequence, and its active metabolite accumulates in renal failure.',
        },
        {
          name: 'Cisatracurium (Nimbex)',
          class: 'Benzylisoquinolinium non-depolarising neuromuscular blocking agent',
          howItCompares:
            'Eliminated by Hofmann degradation — spontaneous chemical breakdown at body temperature and pH — so its offset does not depend on liver or kidney function at all. That independence is the reason it is preferred for long intensive care infusions and in organ failure.',
          typicalCost:
            'No NADAC value is held on this record for cisatracurium and none is asserted here',
          prosAndCons:
            'Pros: organ-independent elimination. Cons: slow onset, not reversible by sugammadex, and laudanosine accumulates in theory during very long infusions.',
        },
        {
          name: 'Sugammadex (Bridion)',
          class:
            'Modified gamma-cyclodextrin encapsulating agent — an antidote rather than a substitute',
          howItCompares:
            "Not an alternative relaxant but the reason rocuronium's longer duration became tolerable: it forms a one-to-one complex with rocuronium in plasma and pulls it off the junction, reversing even a profound block. Two large observational studies disagree about whether that translates into fewer pulmonary complications.",
          typicalCost:
            'No NADAC value is held on this record for sugammadex and none is asserted here',
          prosAndCons:
            'Pros: reverses depths of block that neostigmine cannot touch. Cons: the outcome case is surrogate-heavy, and the two largest observational datasets point in opposite directions.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report any previous anaesthetic reaction, however vague',
          action:
            'Neuromuscular blocking agents were the culprit in 65 of 199 identified agents in a national audit of perioperative anaphylaxis, second only to antibiotics, and the reaction usually begins within minutes of induction.',
          patientImpact:
            'A prior unexplained collapse, rash or bronchospasm during an anaesthetic is the single most useful piece of history a patient can supply, because formal allergy testing after the event is the only way to identify the culprit.',
          clinicalPrecaution:
            'This is history-taking, not treatment. Perioperative anaphylaxis is a resuscitation emergency handled by the theatre team.',
        },
        {
          name: 'If you have ever been aware during an operation, say so',
          action:
            'Paralysis removes every outward sign of light anaesthesia — movement, grimacing, breathing against the ventilator — so awareness under anaesthesia is overwhelmingly a problem of paralysed patients.',
          patientImpact:
            'A previous episode changes the monitoring and the drug plan. It is one of the few risks on this page a patient can materially reduce by speaking beforehand.',
          clinicalPrecaution:
            'Nothing here substitutes for a preoperative assessment, and nothing here is a reason to decline paralysis where it is needed.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(=O)O[C@H]1[C@H](C[C@@H]2[C@@]1(CC[C@H]3[C@H]2CC[C@@H]4[C@@]3(C[C@@H]([C@H](C4)O)N5CCOCC5)C)C)[N+]6(CCCC6)CC=C',
      chemicalFormula: 'C32H53N2O4',
      molecularWeight:
        '529.80 g/mol as the quaternary cation shown; dispensed as rocuronium bromide, 609.68 g/mol',
      targetReceptorAffinity:
        "Rocuronium is deliberately a low-potency agent, and that is its design principle rather than a shortcoming. Bowman's relationship holds that within a series of neuromuscular blockers, onset speed varies inversely with potency: a weak drug must be given in far more molecules, the concentration gradient into the synaptic cleft is steeper, and the receptors fill faster. Rocuronium is roughly six to eight times less potent than vecuronium, the compound it was derived from, and correspondingly faster in onset. It is the only non-depolarising agent whose onset approaches succinylcholine's, and it achieves that by being weak on purpose.",
      structureSource: {
        label:
          'PubChem CID 441290 (rocuronium cation) — canonical SMILES, molecular formula and weight; the bromide salt is CID 441351',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441290',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'roc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical identity of the androstane core',
          description:
            'The molecule carries eleven defined stereocentres on a steroid skeleton, and the pharmacology depends on the three-dimensional distance between the two nitrogen centres rather than on any single functional group. Confirm the configuration of the starting steroid before any substitution: an epimer at a single ring-junction carbon is a different drug with different receptor geometry and is invisible to a simple assay.',
          reagentsAndBuffer:
            'Androstane reference standard, nuclear magnetic resonance for stereochemical assignment, optical rotation, chiral and achiral HPLC with UV detection, differential scanning calorimetry for polymorph identity',
        },
        {
          id: 'roc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Morpholine substitution at the 2-beta position',
          description:
            "Introduce the morpholino group at C2. Replacing vecuronium's piperidine with a morpholine — an oxygen in the ring instead of a carbon — is one of the two changes that deliberately lowered potency, and lowering potency is what bought the faster onset.",
          dependsOnStepId: 'roc-w1',
          reagentsAndBuffer:
            'Morpholine, an activated 2-position steroid intermediate, base, anhydrous aprotic solvent, nitrogen blanket',
        },
        {
          id: 'roc-w3',
          stepNumber: 3,
          phase: 'Synthesis',
          name: 'Allyl quaternisation of the 16-position pyrrolidine',
          description:
            'Quaternise the pyrrolidine nitrogen with an allyl group to give the permanent positive charge. That fixed charge is what confines the drug to the extracellular space and keeps it out of the central nervous system entirely — the reason a paralysed patient is fully awake unless separately anaesthetised.',
          dependsOnStepId: 'roc-w2',
          reagentsAndBuffer:
            'Allyl bromide, pyrrolidine-substituted steroid intermediate, acetonitrile, controlled temperature, exclusion of light and moisture',
        },
        {
          id: 'roc-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Bromide salt isolation and acetate ester stability control',
          description:
            'Isolate the bromide salt and control the 3-acetate ester, which hydrolyses on storage to the 3-desacetyl metabolite. That degradation is why the product is refrigerated and why the in-use period at room temperature is limited: it is a stability specification, not a convenience.',
          dependsOnStepId: 'roc-w3',
          reagentsAndBuffer:
            'Recrystallisation from an alcohol-ether system, reversed-phase ion-pair HPLC with UV detection at 210 nm for 3-desacetylrocuronium, refrigerated storage at 2 to 8 degrees C, buffered aqueous formulation near pH 4',
        },
        {
          id: 'roc-w5',
          stepNumber: 5,
          phase: 'Cellular_Delivery',
          name: 'Isolated nerve-muscle preparation with train-of-four stimulation',
          description:
            'Apply the drug to an isolated phrenic nerve-diaphragm or rat hemidiaphragm preparation and stimulate the nerve in trains of four at 2 Hz. The delivery question is a diffusion question: how quickly the drug crosses from the capillary into the synaptic cleft, which is what the potency-onset relationship is ultimately about.',
          dependsOnStepId: 'roc-w4',
          reagentsAndBuffer:
            'Rat phrenic nerve-hemidiaphragm in Krebs-Henseleit solution gassed with 95% oxygen and 5% carbon dioxide at 32 degrees C, supramaximal nerve stimulation, force transducer, vecuronium comparator at equipotent concentration',
        },
        {
          id: 'roc-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Train-of-four ratio to full recovery, not to first twitch',
          description:
            'Report the ratio of the fourth twitch to the first, and follow it to 0.9 or above rather than stopping when the first twitch returns. This is the measurement the clinical literature has repeatedly shown matters and repeatedly failed to make: residual block that a clinician cannot see by eye is defined entirely by this ratio.',
          dependsOnStepId: 'roc-w5',
          reagentsAndBuffer:
            'Train-of-four at 2 Hz every 12 seconds, acceleromyographic or electromyographic quantification with baseline normalisation, recovery followed to a ratio of at least 0.9, temperature control to avoid cold-induced artefact',
        },
      ],
    },
    keyAudits: [
      {
        id: 'roc-a1',
        category: 'failed',
        title: 'Fifty randomised trials say the 1952 drug still intubates better',
        laymanSummary:
          'Rocuronium was introduced partly to replace an older paralysing agent with dangerous side effects. Pooling every randomised comparison — 4,151 patients — the older drug still produced better conditions for placing the breathing tube.',
        technicalDetails:
          "Tran and colleagues updated their Cochrane review through February 2015, including any randomised or controlled clinical trial reporting intubating conditions with rocuronium at 0.6 mg/kg or more against succinylcholine at 1 mg/kg or more, in any age group or setting. Fifty trials with 4,151 participants were summarised. Succinylcholine was superior for excellent intubating conditions, risk ratio 0.86 (95% CI 0.81 to 0.92, n=4,151), and for clinically acceptable conditions, risk ratio 0.97 (95% CI 0.95 to 0.99, n=3,992, 48 trials). The advantage was larger when thiopental was the induction agent, risk ratio 0.81 (95% CI 0.73 to 0.88, n=2,302, 28 trials). At the highest rocuronium dose studied there was no statistical difference in intubating conditions, and the reviewers still judged succinylcholine clinically superior because of its much shorter duration of action. No severe adverse outcomes were reported in any included trial. High detection bias and significant heterogeneity limit this to moderate-quality evidence, and the conclusion was unchanged from the previous update. The reason rocuronium is nevertheless used for rapid sequence intubation is that succinylcholine's harms — hyperkalaemic arrest, malignant hyperthermia, prolonged block — are catastrophic when they occur, which is a legitimate argument the intubating-conditions data does not measure.",
        evidenceSource:
          'Tran DTT, Newton EK, Mount VAH, Lee JS, Wells GA, Perry JJ. Rocuronium versus succinylcholine for rapid sequence induction intubation. Cochrane Database Syst Rev 2015;10:CD002788',
        doi: '10.1002/14651858.CD002788.pub3',
        measuredMetric:
          'Risk ratio for excellent and for clinically acceptable intubating conditions across 50 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'roc-a2',
        category: 'failed',
        title:
          'POPULAR: using a relaxant at all tracked with more lung complications, and nothing fixed it',
        laymanSummary:
          'Twenty-two thousand patients across Europe were followed after surgery. Those given a paralysing agent had almost twice the odds of a pulmonary complication — and using a nerve monitor, giving a reversal drug, choosing the newer reversal drug, or waiting for full recovery before removing the tube made no measurable difference.',
        technicalDetails:
          'Kirmeier and colleagues prospectively recruited adults having general anaesthesia for any in-hospital procedure except cardiac surgery, at 211 hospitals in 28 European countries, over two weeks, with a postoperative physical examination within three days and follow-up to day 28. Data from 22,803 patients were collected. Use of a neuromuscular blocking agent was associated with an increased incidence of postoperative pulmonary complications — 1,658 of 21,694 patients, 7.6% — with an adjusted odds ratio of 1.86 (95% CI 1.53 to 2.26). The four mitigations widely believed to solve the problem all came back null: neuromuscular monitoring, adjusted odds ratio 1.31 (95% CI 1.15 to 1.49); administration of reversal agents, 1.23 (1.07 to 1.41); sugammadex rather than neostigmine, 1.03 (95% CI 0.85 to 1.25); and extubation at a train-of-four ratio of 0.9 or above, 1.03 (95% CI 0.82 to 1.31). None was associated with better pulmonary outcomes. This is an observational study and confounding by indication is severe — only 2.3% of high-risk patients were anaesthetised without a relaxant, so the comparison groups are not alike. It is on this page because it is the largest prospective attempt to demonstrate the benefit of monitoring and reversal, and it did not.',
        evidenceSource:
          'Kirmeier E, Eriksson LI, Lewald H, et al. Post-anaesthesia pulmonary complications after use of muscle relaxants (POPULAR). Lancet Respir Med 2019;7:129-140 (NCT01865513)',
        doi: '10.1016/S2213-2600(18)30294-7',
        measuredMetric:
          'Adjusted odds ratio for postoperative pulmonary complications to day 28, by relaxant use, monitoring, reversal agent and train-of-four ratio at extubation',
        auditFlag: 'contested',
      },
      {
        id: 'roc-a3',
        category: 'measured',
        title: 'Neuromuscular blockers are the second commonest cause of anaesthetic anaphylaxis',
        laymanSummary:
          'A year-long national audit of every serious allergic reaction under anaesthesia in the United Kingdom found paralysing agents responsible for 65 of the 199 reactions where a culprit was identified — second only to antibiotics.',
        technicalDetails:
          'The 6th National Audit Project collected and reviewed 266 reports of Grade 3 to 5 perioperative anaphylaxis over one year from all NHS hospitals in the United Kingdom. Estimated incidence was about 1 in 10,000 anaesthetics, and the authors note that exclusions for reporting delay and incomplete data mean the true figure might be around 70% higher. Of 199 identified culprit agents, antibiotics accounted for 94, neuromuscular blocking agents 65, chlorhexidine 18 and Patent Blue dye 9. Within the relaxants, succinylcholine-induced anaphylaxis — mainly presenting with bronchospasm — was twice as likely as with the other agents, and the non-depolarising agents, rocuronium among them, had similar incidences to one another. Onset was rapid for relaxants and antibiotics. Hypotension was the commonest presenting feature at 46% and every patient was hypotensive at some point. There were 40 cardiac arrests and 10 deaths, with pulseless electrical activity the usual arrest rhythm. Only 24% of cases were reported to the national pharmacovigilance scheme.',
        evidenceSource:
          'Harper NJN, Cook TM, Garcez T, et al. Anaesthesia, surgery, and life-threatening allergic reactions: epidemiology and clinical features of perioperative anaphylaxis in the 6th National Audit Project (NAP6). Br J Anaesth 2018;121:159-171',
        doi: '10.1016/j.bja.2018.04.014',
        measuredMetric:
          'Distribution of culprit agents across 199 identified cases, and estimated incidence of perioperative anaphylaxis',
        auditFlag: 'verified',
      },
      {
        id: 'roc-a4',
        category: 'measured',
        title: 'Made weak on purpose: low potency is what buys the fast onset',
        laymanSummary:
          'Rocuronium is a deliberately weakened version of an older drug. Because you have to give many more molecules to get the same effect, the drug floods into the gap between nerve and muscle faster, and paralysis arrives sooner.',
        technicalDetails:
          "Rocuronium was derived from vecuronium by two substitutions that reduce receptor affinity: a morpholine replacing the piperidine at the 2-beta position, and an allyl rather than methyl quaternising group at C16. The result is roughly six to eight times lower potency and correspondingly faster onset, consistent with Bowman's relationship that within a series of neuromuscular blockers onset time varies inversely with potency. The mechanism is diffusion: for a given clinical effect, a low-potency drug is administered at a far higher molar dose, so the concentration gradient from plasma into the synaptic cleft is steeper and receptor occupancy builds faster. This is an unusual entry for this file because it is a design decision made against the usual direction of drug development — potency was traded away deliberately — and because the property it bought is the entire clinical case for the molecule.",
        evidenceSource:
          'FDA-approved US prescribing information for rocuronium bromide injection, Clinical Pharmacology; and the structure-activity relationship established across the aminosteroid neuromuscular blocking series',
        measuredMetric:
          'Relative potency against vecuronium and the resulting onset time, with the fixed quaternary charge confining distribution to the extracellular space',
        auditFlag: 'verified',
      },
      {
        id: 'roc-a5',
        category: 'inferred',
        title: 'Paralysis removes every clinical sign that anaesthesia is inadequate',
        laymanSummary:
          'Without a relaxant, a patient who is not deeply enough anaesthetised moves, grimaces or breathes against the ventilator. A paralysed patient does none of those things, so the warning system is gone and the anaesthetist is reasoning from indirect signs.',
        technicalDetails:
          "The clinical signs conventionally used to judge anaesthetic depth — purposeful movement, facial grimacing, respiratory effort against the ventilator — are all motor outputs, and a neuromuscular blocking agent abolishes all of them without touching consciousness. Rocuronium's permanent quaternary charge means it does not cross the blood-brain barrier at all, so it has no hypnotic, amnestic or analgesic effect whatsoever. What remains available to the anaesthetist are autonomic signs, which are unreliable and confounded by every other drug given, and processed electroencephalographic monitors, which are indirect. This entry is filed as inferred rather than measured because the quantity of interest — how much of the awareness risk in paralysed patients is attributable to the loss of motor signs rather than to the underlying anaesthetic technique — has not been isolated by any trial. What is not in doubt is the pharmacology: this drug paralyses without sedating, and every case of awareness with paralysis is a case where those two effects came apart.",
        evidenceSource:
          'FDA-approved US prescribing information for rocuronium bromide injection, Warnings — rocuronium has no known effect on consciousness, pain threshold or cerebration',
        inferredClaim:
          'That monitoring practices developed for unparalysed patients remain adequate once the motor signs of light anaesthesia have been abolished pharmacologically',
        auditFlag: 'caution',
      },
      {
        id: 'roc-a6',
        category: 'inferred',
        title: 'Sugammadex made a long-acting relaxant behave like a short one — on a surrogate',
        laymanSummary:
          "Rocuronium's drawback against the older drug was that its effect lasts much longer. An antidote that grabs the molecule out of the bloodstream was supposed to erase that drawback, and it does erase it on the nerve monitor. Whether it changes what happens to patients is disputed by the two largest studies.",
        technicalDetails:
          'Sugammadex is a modified gamma-cyclodextrin that forms a one-to-one inclusion complex with rocuronium in plasma, creating a concentration gradient that draws the relaxant off the neuromuscular junction. On the surrogate endpoint — time to a train-of-four ratio of 0.9 — the effect is large, fast and reproducible, including from depths of block that neostigmine cannot reverse at all. On patient outcomes the evidence conflicts. STRONGER, a matched-cohort analysis of 45,712 patients across 12 United States hospitals, found sugammadex associated with a 30% lower adjusted odds of major pulmonary complications (adjusted odds ratio 0.70, 95% CI 0.63 to 0.77), 47% lower for pneumonia and 55% lower for respiratory failure. POPULAR, a prospective observational cohort of 22,803 patients across 28 European countries, found no association at all between the choice of sugammadex over neostigmine and pulmonary outcomes (adjusted odds ratio 1.03, 95% CI 0.85 to 1.25). Both are observational, both are large, and they disagree. The correct summary is that a surrogate improvement is certain and an outcome improvement is contested.',
        evidenceSource:
          'Kheterpal S, Vaughn MT, Dubovoy TZ, et al. Anesthesiology 2020;132:1371-1381; Kirmeier E, Eriksson LI, Lewald H, et al. Lancet Respir Med 2019;7:129-140',
        doi: '10.1097/ALN.0000000000003256',
        inferredClaim:
          'That reversing rocuronium with sugammadex reduces postoperative pulmonary complications — supported by one large matched cohort, contradicted by another large prospective cohort, and never tested against a clinical outcome in a randomised trial',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected into a vein and confined to the bloodstream',
        laymanDesc:
          'The molecule carries a permanent positive charge, so it cannot cross into the brain or into cells. It stays in the water outside cells and goes where the blood takes it.',
        molecularDetail:
          'The fixed quaternary ammonium charge restricts distribution to the extracellular fluid and excludes the drug from the central nervous system entirely. This is why the label states rocuronium has no known effect on consciousness, pain threshold or cerebration, and why paralysis and anaesthesia are separate problems that must be separately solved.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Its weakness makes it fast',
        laymanDesc:
          'Because it is a weak drug, a large number of molecules has to be given. That large number creates a steep gradient into the tiny gap between nerve and muscle, and the receptors fill quickly.',
        molecularDetail:
          "Rocuronium is roughly six to eight times less potent than vecuronium, from which it was derived by replacing a piperidine with a morpholine and a methyl with an allyl group. Bowman's relationship — onset varies inversely with potency across a neuromuscular blocker series — is the design principle: the molar dose is what drives diffusion into the junctional cleft.",
        iconName: 'Timer',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It occupies the acetylcholine site without switching it on',
        laymanDesc:
          'The receptor needs two acetylcholine molecules to open. Rocuronium sits in one of those slots and does nothing, so the channel stays shut.',
        molecularDetail:
          'The nicotinic receptor of the adult endplate is a pentamer of two alpha1, one beta1, one delta and one epsilon subunit, with agonist sites at the alpha1-delta and alpha1-epsilon interfaces. Occupancy of a single site by a competitive antagonist prevents channel opening, and because transmission has a large safety margin, roughly 70 to 80% of receptors must be occupied before any weakness is measurable at all.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The nerve keeps firing and the muscle stops answering',
        laymanDesc:
          'Nothing about the nerve changes. It goes on releasing its transmitter into a gap where the receiving stations are already occupied, and the muscle stays limp.',
        molecularDetail:
          'Block is competitive and surmountable, which is the basis of neostigmine reversal: inhibiting acetylcholinesterase raises junctional acetylcholine concentration so it can outcompete the antagonist. That strategy has a ceiling, because once the enzyme is fully inhibited no further acetylcholine can be recruited, and it is why neostigmine cannot reverse a profound block at all.',
        iconName: 'Unplug',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Complete, silent, reversible paralysis',
        laymanDesc:
          'Muscles relax in a sequence — small fast muscles of the eye and jaw first, the diaphragm last and least — and the patient cannot move, breathe or signal anything at all.',
        molecularDetail:
          'The diaphragm is comparatively resistant and recovers first, while the upper airway and pharyngeal muscles are among the most sensitive and the last to recover fully, which is the physiological reason residual block is an airway and aspiration problem rather than a ventilation problem. Detecting it requires a quantitative train-of-four ratio; clinical tests such as head lift are insensitive to ratios between 0.5 and 0.9.',
        iconName: 'PauseOctagon',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'It washes out, or it is pulled out',
        laymanDesc:
          'Left alone, the drug is taken up by the liver and excreted, and power returns over three quarters of an hour or so. Given the antidote, it is trapped in the bloodstream and removed from the junction within minutes.',
        molecularDetail:
          'Elimination is primarily biliary with a smaller renal component, and duration is prolonged in hepatic impairment. Sugammadex reverses by encapsulation rather than by competition: a one-to-one inclusion complex forms in plasma, the free plasma concentration collapses, and the gradient reverses so that drug leaves the junction. Because the mechanism is sequestration rather than competition with acetylcholine, it works at depths of block where an anticholinesterase has no effect at all.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Tran Cochrane review of rocuronium versus succinylcholine for rapid sequence intubation',
        phase:
          'Systematic review and meta-analysis of 50 randomised and controlled clinical trials',
        sampleSize: 4151,
        primaryEndpoint: 'Excellent intubating conditions during rapid sequence induction',
        endpointMet: false,
        statisticalPValue:
          'Succinylcholine superior: risk ratio 0.86 (95% CI 0.81 to 0.92) for excellent conditions and 0.97 (95% CI 0.95 to 0.99) for clinically acceptable conditions',
        unreportedAdverseSignals:
          'High incidence of detection bias and significant heterogeneity across trials limits this to moderate-quality evidence. No severe adverse outcomes were reported in any included trial, which means the trials cannot speak to the harms that motivate the choice of rocuronium in the first place.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'POPULAR — post-anaesthesia pulmonary complications after use of muscle relaxants (NCT01865513)',
        phase: 'Multicentre prospective observational cohort at 211 hospitals in 28 countries',
        sampleSize: 22803,
        primaryEndpoint:
          'Incidence of postoperative pulmonary complications from end of surgery to day 28',
        endpointMet: false,
        statisticalPValue:
          'Relaxant use adjusted odds ratio 1.86 (95% CI 1.53 to 2.26); neuromuscular monitoring 1.31 (1.15 to 1.49); reversal agents 1.23 (1.07 to 1.41); sugammadex versus neostigmine 1.03 (0.85 to 1.25); extubation at train-of-four ratio 0.9 or above 1.03 (0.82 to 1.31)',
        unreportedAdverseSignals:
          'Only 2.3% of high-risk surgical patients and those with adverse respiratory profiles were anaesthetised without a relaxant, so confounding by indication is severe and the headline association cannot be read as causal.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NAP6 — 6th National Audit Project on perioperative anaphylaxis',
        phase: 'National prospective audit of Grade 3 to 5 reactions over one year',
        sampleSize: 266,
        primaryEndpoint:
          'Incidence, culprit agent distribution and clinical features of perioperative anaphylaxis',
        endpointMet: true,
        statisticalPValue:
          'Estimated incidence about 1 in 10,000 anaesthetics; neuromuscular blocking agents were 65 of 199 identified culprits; non-depolarising agents had similar incidences to one another and succinylcholine was twofold more likely',
        unreportedAdverseSignals:
          'Case exclusion for reporting delay and incomplete data means the true incidence might be about 70% higher. Only 24% of cases were reported to the national pharmacovigilance scheme, so routine surveillance was capturing a quarter of what a dedicated audit found.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'STRONGER — sugammadex versus neostigmine and postoperative pulmonary complications',
        phase: 'Multicentre matched-cohort observational analysis across 12 US hospitals',
        sampleSize: 45712,
        primaryEndpoint:
          'Composite of major postoperative pulmonary complications — pneumonia, respiratory failure or other pulmonary complication',
        endpointMet: true,
        statisticalPValue:
          '3.5% with sugammadex versus 4.8% with neostigmine; adjusted odds ratio 0.70 (95% CI 0.63 to 0.77), pneumonia 0.53 (0.44 to 0.62), respiratory failure 0.45 (0.37 to 0.56)',
        unreportedAdverseSignals:
          "Observational and matched on institution, sex, age, comorbidity, obesity, procedure type and relaxant, but not randomised. Its direction is opposite to POPULAR's null result on the same comparison, and neither study can settle it.",
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Succinylcholine superior to rocuronium for excellent intubating conditions across 50 trials and 4,151 participants, risk ratio 0.86 (95% CI 0.81 to 0.92)',
        'Neuromuscular blocking agent use associated with an adjusted odds ratio of 1.86 for postoperative pulmonary complications in 22,803 prospectively followed patients',
        'Neuromuscular blocking agents responsible for 65 of 199 identified culprit agents in 266 cases of perioperative anaphylaxis, at an estimated incidence of 1 in 10,000 anaesthetics',
        "Roughly six to eight times lower potency than vecuronium, with the correspondingly faster onset that is the drug's entire clinical rationale",
        'A permanent quaternary charge that excludes the drug from the central nervous system, so it has no effect on consciousness or pain',
      ],
      unsupportedInferences: [
        'That neuromuscular monitoring, reversal, sugammadex or extubation at a train-of-four ratio above 0.9 reduces pulmonary complications — all four came back null in the largest prospective study of the question',
        'That reaching a train-of-four ratio of 0.9 is a patient outcome; it is a surrogate, and the study that tested it against a real outcome found no association',
        'That the STRONGER result showing 30% fewer pulmonary complications with sugammadex is settled — the other large cohort found an odds ratio of 1.03',
        'That the excess pulmonary complications seen with relaxant use are caused by the relaxant, when only 2.3% of high-risk patients were managed without one',
      ],
      whatFailedInitially: [
        'The intubating-conditions case for replacing succinylcholine failed: fifty randomised trials still favour the older drug',
        'Every proposed mitigation of residual neuromuscular block failed to show a pulmonary benefit in POPULAR — monitoring, reversal, agent choice and extubation threshold alike',
        'Routine pharmacovigilance failed to capture perioperative anaphylaxis: only 24% of NAP6 cases had been reported through the national scheme',
      ],
      realWorldOutcome: [
        'The most widely used non-depolarising relaxant in the world, and the default for rapid sequence intubation wherever succinylcholine is judged too risky',
        'About 39 cents per millilitre at United States pharmacy acquisition cost across 24 listed generic products — while its antidote remained single-source and patented for years afterwards',
        'Its existence, together with sugammadex, is what allows a profound block to be established and then removed on demand, which is a genuine change in what is possible in an operating theatre even where the outcome data is silent',
      ],
    },
    deliverySystem: {
      type: 'Sterile aqueous solution for intravenous bolus and infusion, buffered near pH 4, refrigerated at 2 to 8 degrees C with a limited room-temperature in-use period',
      description:
        'Refrigeration is a chemistry requirement, not a convention: the 3-acetate ester hydrolyses on storage to 3-desacetylrocuronium, so the room-temperature in-use period is a stability specification. The acidic formulation is why injection through a running line commonly causes pain or withdrawal in a lightly anaesthetised patient, and why it is not mixed with alkaline drugs such as thiopental in the same line. The drug is given intravenously only; there is no other route and no depot presentation.',
      safetyProfile:
        "This drug paralyses without sedating and has no effect on consciousness or pain, so it must never be given to a patient who is not already unconscious or who cannot be ventilated. Its duration is much longer than succinylcholine's, which is the accepted trade for avoiding succinylcholine's specific harms. Neuromuscular blocking agents are the second commonest cause of perioperative anaphylaxis after antibiotics, with an overall anaphylaxis incidence of about 1 in 10,000 anaesthetics. Residual block below a train-of-four ratio of 0.9 is undetectable by clinical examination and affects pharyngeal and airway muscles preferentially. Duration is prolonged in hepatic impairment. Nothing on this page is dosing guidance.",
    },
    commonQuestions: [
      {
        q: 'If the older drug intubates better, why is rocuronium used?',
        a: 'Because the comparison that favours succinylcholine measures the wrong kind of thing. Fifty randomised trials in 4,151 patients found succinylcholine superior for excellent intubating conditions with a risk ratio of 0.86, and the Cochrane reviewers noted no severe adverse outcomes were reported in any of those trials — which is precisely the problem, because the reasons to avoid succinylcholine are rare catastrophes rather than common inconveniences. Succinylcholine carries a boxed warning for cardiac arrest from hyperkalaemic rhabdomyolysis in children with undiagnosed muscle disease, triggers malignant hyperthermia, raises potassium dangerously in burns, crush injury and prolonged immobility, and paralyses for hours in people with inherited cholinesterase deficiency. Trials of a few thousand elective patients cannot see those. So the honest statement is that succinylcholine is better at the measured endpoint and rocuronium is chosen on unmeasured tail risk.',
        auditNote:
          'Filed as a failed endpoint rather than a wrong decision. The clinical argument for rocuronium is real and is simply not what these trials measured.',
      },
      {
        q: 'Does the nerve monitor and the reversal drug actually prevent complications?',
        a: 'The largest prospective study designed to show it says no. POPULAR followed 22,803 patients at 211 hospitals in 28 European countries with a physical examination within three days of surgery. Using a neuromuscular monitor had an adjusted odds ratio of 1.31 for pulmonary complications, giving a reversal agent 1.23, choosing sugammadex over neostigmine 1.03, and extubating at a train-of-four ratio of 0.9 or more 1.03. None was associated with better outcomes. That is a striking result because all four are standard recommendations. The caveats are serious: this is observational, and monitoring and reversal are used preferentially in the patients most at risk, which biases against them. But it remains the case that the best prospective test of these practices did not find the benefit they are recommended for.',
        auditNote:
          'This is the single most uncomfortable finding on this page and it is exactly the kind of thing an audit layer exists to show.',
      },
      {
        q: 'Can I be awake and paralysed?',
        a: 'That is the specific risk this class of drug creates, and it comes straight from the pharmacology. Rocuronium carries a permanent positive charge and cannot cross into the brain, so the label states plainly that it has no known effect on consciousness, pain threshold or cerebration. It paralyses and nothing else. In an unparalysed patient, inadequate anaesthesia announces itself by movement, grimacing or breathing against the ventilator; a paralysed patient can do none of those. What remains is autonomic signs, which are confounded by every other drug in the anaesthetic, and processed EEG monitors, which are indirect. This is why accidental awareness under anaesthesia is overwhelmingly a phenomenon of paralysed patients, and why a previous episode is worth telling an anaesthetist about before the next operation.',
      },
      {
        q: 'Why is it kept in a fridge?',
        a: 'For a chemical reason rather than a microbiological one. The molecule carries an acetate ester on the steroid ring, and that ester slowly hydrolyses in solution to 3-desacetylrocuronium. Refrigeration at 2 to 8 degrees slows the reaction, and the limited period the vial may spend at room temperature once removed is a stability specification derived from how fast that degradation proceeds, not a general caution. The same acidic formulation that keeps the ester stable is what makes injection painful in a lightly anaesthetised patient.',
      },
      {
        q: 'How likely is an allergic reaction?',
        a: 'A national audit of every serious perioperative anaphylaxis in the United Kingdom over one year found an estimated incidence of about 1 in 10,000 anaesthetics, with the caveat that exclusions for late or incomplete reporting mean the true figure might be around 70% higher. Of 199 cases where a culprit was identified, neuromuscular blocking agents accounted for 65, second to antibiotics at 94. Within the relaxants the non-depolarising drugs including rocuronium had similar incidences to each other, while succinylcholine was twice as likely and tended to present with bronchospasm. Across all agents there were 40 cardiac arrests and 10 deaths among 266 reported reactions, and poor outcomes were associated with higher ASA grade, obesity, and beta blocker or ACE inhibitor use.',
      },
      {
        q: 'Why does this page show a price when the sevoflurane page does not?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey holds a value for rocuronium and not for sevoflurane. That survey measures what United States retail pharmacies pay to acquire a drug, and different products reach the hospital through different channels. For rocuronium the figure is about 39 cents per millilitre as a median across 24 listed generic products. It is a price, not a manufacturing cost, and no verified per-dose cost-of-production study exists for this molecule, so no synthesis cost is shown.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Tran DTT, Newton EK, Mount VAH, Lee JS, Wells GA, Perry JJ. Rocuronium versus succinylcholine for rapid sequence induction intubation. Cochrane Database Syst Rev 2015;10:CD002788',
        identifier: '10.1002/14651858.CD002788.pub3',
        kind: 'doi',
      },
      {
        label:
          'Kirmeier E, Eriksson LI, Lewald H, et al. Post-anaesthesia pulmonary complications after use of muscle relaxants (POPULAR): a multicentre, prospective observational study. Lancet Respir Med 2019;7:129-140',
        identifier: '10.1016/S2213-2600(18)30294-7',
        kind: 'doi',
      },
      {
        label:
          'NCT01865513 — POPULAR, post-anaesthesia pulmonary complications after use of muscle relaxants',
        identifier: 'NCT01865513',
        kind: 'nct',
      },
      {
        label:
          'Harper NJN, Cook TM, Garcez T, et al. Anaesthesia, surgery, and life-threatening allergic reactions: epidemiology and clinical features of perioperative anaphylaxis in the 6th National Audit Project (NAP6). Br J Anaesth 2018;121:159-171',
        identifier: '10.1016/j.bja.2018.04.014',
        kind: 'doi',
      },
      {
        label:
          'Kheterpal S, Vaughn MT, Dubovoy TZ, et al. Sugammadex versus neostigmine for reversal of neuromuscular blockade and postoperative pulmonary complications (STRONGER). Anesthesiology 2020;132:1371-1381',
        identifier: '10.1097/ALN.0000000000003256',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 441290 — rocuronium cation structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441290',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Succinylcholine — still the best drug in the world at the job, and carrying a boxed warning
  //    written after apparently healthy children died on the table.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'succinylcholine',
    name: 'Succinylcholine',
    tradeName: 'Anectine, Quelicin, Quelicin Preservative Free; formerly Sucostrin',
    sponsor:
      'Sandoz (current US label holder for Anectine); the paralysing action was described by Daniel Bovet in 1949 and the drug entered clinical anaesthesia in 1951-1952. Long off patent.',
    targetGene: 'CHRNA1, CHRNB1, CHRND, CHRNE, CHRNG, BCHE',
    targetProtein:
      'Nicotinic acetylcholine receptor of the motor endplate, occupied as an agonist rather than an antagonist; cleared by butyrylcholinesterase (plasma pseudocholinesterase) in plasma rather than at the junction',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1952,
    indication:
      'Adjunct to general anaesthesia in adults and paediatric patients, to facilitate tracheal intubation and to provide skeletal muscle relaxation during surgery or mechanical ventilation; in paediatric patients its use is reserved for emergency intubation or where immediate securing of the airway is necessary',
    patientFriendlyIndication:
      'Paralysing the muscles for about five minutes so a breathing tube can be placed quickly in an emergency',
    anatomicalSite:
      'Postsynaptic membrane of the motor endplate, and the plasma compartment where the enzyme that destroys the drug lives',
    conditionContext: {
      conditionExplainer:
        'Every other paralysing agent works by blocking the receptor. Succinylcholine works by overstimulating it: it is literally two molecules of acetylcholine joined tail to tail, and it switches the receptor on and keeps it on. A muscle whose endplate is permanently depolarised cannot fire again, so after a brief burst of visible twitching it goes limp.',
      whyItMatters:
        'Its onset is faster and its offset shorter than anything else available, which is why it has survived seventy years of attempts to replace it. Those seventy years also produced the most specific and most alarming boxed warning in anaesthesia, written after apparently healthy children arrested minutes after receiving it.',
      whoTakesThis:
        'Adults needing rapid intubation in an emergency department, an operating theatre or an ambulance, and patients having electroconvulsive therapy. Its paediatric use is now restricted by the label to emergencies.',
      clinicalGoals:
        'Complete relaxation within about a minute and full recovery within about five to ten, without needing any reversal agent. There is no outcome claim here beyond that: succinylcholine has never been shown to improve survival, and it is chosen because of what it does in the first sixty seconds.',
    },
    oneSentenceVerdict:
      'Two acetylcholine molecules joined tail to tail, which paralyses by switching the endplate on rather than off and wears off in minutes because a plasma enzyme destroys it before most of it ever reaches the muscle — still superior to rocuronium for excellent intubating conditions across 50 trials and 4,151 patients (risk ratio 0.86), and carrying a boxed warning added after healthy-looking children with undiagnosed muscular dystrophy died of hyperkalaemic cardiac arrest.',
    laymanHowItWorks:
      'The nerve normally tells a muscle to contract by releasing acetylcholine, which is destroyed within a millisecond so the muscle can reset. Succinylcholine is two of those molecules stuck together, and the enzyme at the junction cannot break it down. It switches the receptor on and holds it on. The muscle twitches once — the visible flicker anaesthetists call fasciculation — and then cannot respond again while the drug is there. The drug leaves quickly not because the muscle clears it, but because a different enzyme in the blood is chewing through it the entire time, so only a fraction ever arrives and it is drawn back out within minutes.',
    auditConfidence: 'High Confidence',
    confidenceScore: 78,
    substitutes: {
      summary:
        'The only real substitute is a non-depolarising agent, and the pooled randomised evidence says the substitute is worse at the job while being safer in the specific ways succinylcholine is dangerous. That is the entire debate: better intubating conditions and a five-minute offset against a boxed warning, a malignant hyperthermia trigger, a hyperkalaemia contraindication and a genetic sensitivity affecting about 1 in 2,500 people. Nothing in a diet substitutes for a paralysing agent and nothing is listed here.',
      conventionalRx: [
        {
          name: 'Rocuronium (Zemuron)',
          class: 'Aminosteroid non-depolarising neuromuscular blocking agent',
          howItCompares:
            "Across 50 randomised trials with 4,151 participants, rocuronium was inferior for excellent intubating conditions (risk ratio 0.86 favouring succinylcholine, 95% CI 0.81 to 0.92) and for clinically acceptable conditions (0.97, 95% CI 0.95 to 0.99). At the highest rocuronium dose studied the difference in conditions disappeared and the reviewers still judged succinylcholine clinically superior for its shorter duration. Rocuronium is chosen when succinylcholine's specific catastrophes are unacceptable.",
          typicalCost:
            'US$0.3942 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed products, effective 22 April 2026)',
          prosAndCons:
            'Pros: no hyperkalaemia risk, no malignant hyperthermia trigger, no myalgia, and reversible on demand with sugammadex. Cons: measurably worse intubating conditions and a block lasting three quarters of an hour rather than five minutes.',
        },
        {
          name: 'Sugammadex (Bridion)',
          class: 'Encapsulating reversal agent — relevant only because it changes the argument',
          howItCompares:
            "Not a relaxant. Its existence is the main reason the choice between succinylcholine and rocuronium has shifted, because a rocuronium block can now be abolished within minutes rather than waited out, which removes succinylcholine's duration advantage in settings where the antidote is immediately available and affordable.",
          typicalCost:
            'No NADAC value is held on this record for sugammadex and none is asserted here',
          prosAndCons:
            'Pros: makes a long block behave like a short one. Cons: the outcome evidence for that mattering is observational and contradictory, and it is not universally available.',
        },
        {
          name: 'Cisatracurium (Nimbex)',
          class: 'Benzylisoquinolinium non-depolarising neuromuscular blocking agent',
          howItCompares:
            'Broken down by spontaneous chemical degradation at body temperature and pH rather than by any organ, which makes it the choice in liver and kidney failure. Far too slow in onset to substitute for succinylcholine in a rapid sequence intubation.',
          typicalCost:
            'No NADAC value is held on this record for cisatracurium and none is asserted here',
          prosAndCons:
            'Pros: organ-independent elimination and no accumulation. Cons: slow onset, so it is not in the same conversation for emergency airway control.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Know your family anaesthetic history, especially muscle disease',
          action:
            'The boxed warning exists because of children who looked healthy and turned out to have undiagnosed Duchenne muscular dystrophy. Malignant hyperthermia susceptibility is also inherited, through RYR1 and CACNA1S variants.',
          patientImpact:
            'A family history of muscular dystrophy, of unexplained anaesthetic death, or of a relative who became dangerously hot during an operation is the only warning available before the first event, and it changes the drug chosen.',
          clinicalPrecaution:
            'This is history to hand over before an anaesthetic. It is not a treatment and it does not substitute for a preoperative assessment.',
        },
        {
          name: 'Report a family member who took hours to wake up',
          action:
            'About 1 in 2,500 people are homozygous for an atypical plasma cholinesterase gene and are extremely sensitive to this drug, staying paralysed far longer than expected. It runs in families.',
          patientImpact:
            'It is not dangerous if it is known about in advance — the patient stays ventilated and asleep until the block wears off — and it is frightening if it is discovered for the first time in recovery.',
          clinicalPrecaution:
            'Testing and the management of a prolonged block belong to the clinical team. This is a fact to volunteer, not something to act on.',
        },
        {
          name: 'Expect aching muscles the next day',
          action:
            'The visible twitching that precedes paralysis is unsynchronised muscle contraction, and it commonly leaves generalised aching for a day or two, most often in young, muscular, ambulatory patients.',
          patientImpact:
            'Knowing that the ache is an expected consequence of the drug rather than a sign of injury from the surgery is worth having in advance.',
          clinicalPrecaution:
            'New or severe muscle pain with dark urine after an anaesthetic is a different matter entirely and needs medical assessment, not reassurance.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[N+](C)(C)CCOC(=O)CCC(=O)OCC[N+](C)(C)C',
      chemicalFormula: 'C14H30N2O4',
      molecularWeight:
        '290.40 g/mol as the dication shown; dispensed as succinylcholine chloride, 361.30 g/mol',
      targetReceptorAffinity:
        'Succinylcholine is an agonist at the nicotinic receptor, not an antagonist, so the relevant quantity is not affinity but residence time. Acetylcholine is hydrolysed by acetylcholinesterase within the synaptic cleft in about a millisecond; succinylcholine is not a substrate for that enzyme and persists at the endplate, holding the channel in a depolarised state. Its short clinical duration comes from a completely different place: butyrylcholinesterase in plasma hydrolyses it before most of an injected dose ever reaches the neuromuscular junction, so recovery is governed by a plasma enzyme rather than by anything happening at the receptor.',
      structureSource: {
        label:
          'PubChem CID 5314 (succinylcholine dication) — canonical SMILES, molecular formula and weight; the chloride salt is CID 22475',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5314',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sux-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Water content and free choline in the drug substance',
          description:
            'The molecule is a diester and water is its enemy. Assay residual water and the hydrolysis products succinylmonocholine and choline before release, because the same reaction that terminates the drug in the patient also destroys it in the vial.',
          reagentsAndBuffer:
            'Karl Fischer titration, ion chromatography for choline and succinate, reversed-phase ion-pair HPLC with refractive index or evaporative light scattering detection, controlled low-humidity handling',
        },
        {
          id: 'sux-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Diesterification of succinic acid with two cholines',
          description:
            'Join succinic acid to two molecules of choline to give the bis-choline ester. The design is transparent and deliberate: the product is two acetylcholine molecules joined at their acetyl ends, which is why it behaves as an agonist and why nothing subtler was needed to make a depolarising blocker.',
          dependsOnStepId: 'sux-w1',
          reagentsAndBuffer:
            'Succinyl chloride or succinic anhydride, choline chloride, anhydrous conditions, acid catalysis, controlled temperature with azeotropic water removal',
        },
        {
          id: 'sux-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chloride salt crystallisation with the monoester as the critical impurity',
          description:
            'Crystallise the dichloride and control succinylmonocholine, the singly hydrolysed intermediate, which is both a degradation product and a weakly active compound. The specification is written around the hydrolysis pathway rather than around synthesis by-products.',
          dependsOnStepId: 'sux-w2',
          reagentsAndBuffer:
            'Recrystallisation from anhydrous ethanol or isopropanol, succinylmonocholine reference standard, HPLC with UV detection at low wavelength, dry nitrogen atmosphere',
        },
        {
          id: 'sux-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Depolarisation recorded at the endplate, not just twitch loss',
          description:
            'Record endplate membrane potential in an isolated nerve-muscle preparation rather than only measuring force. The whole point of this drug is that the muscle is paralysed while depolarised, which looks identical to competitive block on a force transducer and is the opposite of it electrically.',
          dependsOnStepId: 'sux-w3',
          reagentsAndBuffer:
            'Rat phrenic nerve-hemidiaphragm or mouse diaphragm, intracellular microelectrode recording of endplate potential, Krebs-Henseleit solution gassed with 95% oxygen and 5% carbon dioxide, tubocurarine comparator for competitive block',
        },
        {
          id: 'sux-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Distinguish Phase I from Phase II block by train-of-four fade',
          description:
            'Apply train-of-four stimulation and report whether the four responses fade. A depolarising Phase I block produces four equally reduced twitches with no fade; prolonged exposure converts it to a Phase II block that fades like a competitive one and responds to an anticholinesterase. Misreading which one is present is the classic error, because giving neostigmine into a Phase I block prolongs it.',
          dependsOnStepId: 'sux-w4',
          reagentsAndBuffer:
            'Train-of-four at 2 Hz, tetanic stimulation at 50 Hz for post-tetanic facilitation, acceleromyography with baseline normalisation, edrophonium challenge to characterise the block type',
        },
        {
          id: 'sux-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Dibucaine number and genotype, reported together',
          description:
            'Characterise butyrylcholinesterase activity by dibucaine inhibition and by BCHE genotype. Activity alone conflates the two situations that look the same in a recovery room: an inherited atypical enzyme and a normal enzyme depleted by pregnancy, liver disease, burns or an anticholinesterase exposure. The management of a prolonged block is identical; the counselling of the family is not.',
          dependsOnStepId: 'sux-w5',
          reagentsAndBuffer:
            'Plasma butyrylcholinesterase activity assay with benzoylcholine substrate, dibucaine and fluoride inhibition numbers, BCHE sequencing for the atypical and other variants, family testing where an index case is found',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sux-a1',
        category: 'conclusion_shift',
        title: 'A boxed warning written after healthy-looking children arrested and died',
        laymanSummary:
          'For decades this was the standard paralysing agent for children. Then apparently healthy children began having cardiac arrest within minutes of receiving it, and were found afterwards to have muscular dystrophy nobody knew about. Routine paediatric use was withdrawn.',
        technicalDetails:
          'The approved United States label carries a boxed warning stating that acute rhabdomyolysis with hyperkalaemia followed by ventricular dysrhythmias, cardiac arrest and death has occurred after administration of succinylcholine to apparently healthy paediatric patients subsequently found to have undiagnosed skeletal muscle myopathy, most frequently Duchenne muscular dystrophy. It instructs that when a healthy-appearing paediatric patient arrests within minutes of administration, and this is not attributable to inadequate ventilation, oxygenation or anaesthetic overdose, immediate treatment for hyperkalaemia should be started, with concurrent treatment for malignant hyperthermia if its signs are present. It reserves paediatric use for emergency intubation or where immediate securing of the airway is necessary — laryngospasm, difficult airway, full stomach — or for intramuscular use where no vein is accessible. Duchenne muscular dystrophy is X-linked and typically undiagnosed in a boy under about four years old, so the children at risk were by definition the ones who looked well. This is a genuine reversal: a drug given to essentially every anaesthetised child became a drug reserved for emergencies, on the strength of a mechanism nobody had anticipated in a population nobody could identify in advance.',
        evidenceSource:
          'FDA-approved US prescribing information for ANECTINE (succinylcholine chloride) injection, BOXED WARNING and Warnings and Precautions 5.1 (DailyMed SPL 04a4e6f5-6fa1-42e1-a3f9-21fca7786b15)',
        inferredClaim:
          'That a drug safe in a healthy child is safe in every child who appears healthy — an assumption that fails precisely where the underlying myopathy has not yet declared itself',
        auditFlag: 'verified',
      },
      {
        id: 'sux-a2',
        category: 'measured',
        title: 'Still the best drug for intubating conditions after seventy years of replacements',
        laymanSummary:
          'Every randomised comparison against the modern alternative was pooled: fifty trials, four thousand one hundred and fifty-one patients. The 1952 drug still produced better conditions for getting a breathing tube in.',
        technicalDetails:
          'Tran and colleagues pooled 50 randomised and controlled clinical trials with 4,151 participants comparing succinylcholine at 1 mg/kg or more with rocuronium at 0.6 mg/kg or more for rapid sequence or modified rapid sequence intubation, in any age group or setting. Succinylcholine was superior for excellent intubating conditions, risk ratio 0.86 (95% CI 0.81 to 0.92, n=4,151), and for clinically acceptable conditions, risk ratio 0.97 (95% CI 0.95 to 0.99, n=3,992 across 48 trials). Superiority was greater when thiopental was the induction agent, risk ratio 0.81 (95% CI 0.73 to 0.88, n=2,302, 28 trials). At the highest rocuronium dose there was no statistical difference in conditions, and the reviewers still concluded succinylcholine was clinically superior because of its shorter duration of action. High detection bias and significant heterogeneity make this moderate-quality evidence, and the conclusion was unchanged from the two previous updates. Notably, no severe adverse outcomes were reported in any included trial — which means these trials measured the advantage and were structurally incapable of measuring the disadvantage.',
        evidenceSource:
          'Tran DTT, Newton EK, Mount VAH, Lee JS, Wells GA, Perry JJ. Rocuronium versus succinylcholine for rapid sequence induction intubation. Cochrane Database Syst Rev 2015;10:CD002788',
        doi: '10.1002/14651858.CD002788.pub3',
        measuredMetric:
          'Risk ratio for excellent and clinically acceptable intubating conditions across 50 randomised trials',
        auditFlag: 'verified',
      },
      {
        id: 'sux-a3',
        category: 'measured',
        title: 'About 1 in 2,500 people cannot clear it, and the label gives the number',
        laymanSummary:
          'The drug is destroyed by an enzyme in the blood. Roughly one person in two and a half thousand has inherited two copies of a variant enzyme that barely touches it, and stays paralysed for hours instead of minutes.',
        technicalDetails:
          'The label states that patients homozygous for the atypical plasma cholinesterase gene, about 1 in 2,500, are extremely sensitive to the neuromuscular blocking effect of succinylcholine. It further lists the acquired causes of reduced plasma cholinesterase activity — pregnancy, severe liver or kidney disease, malignant tumours, infections, burns, anaemia, decompensated heart disease, peptic ulcer and myxoedema — and the drugs that lower it, including chronic oral contraceptives, glucocorticoids, certain monoamine oxidase inhibitors, and irreversible inhibitors such as organophosphate insecticides, echothiophate and certain antineoplastics. The label does not recommend the drug in patients with reduced plasma cholinesterase activity. This audit is filed as measured because the frequency is a stated, labelled number with a defined genetic basis, and because the consequence is entirely benign if anticipated and entirely alarming if not: a patient who cannot be woken must simply be kept anaesthetised and ventilated until the enzyme finishes its work.',
        evidenceSource:
          'FDA-approved US prescribing information for ANECTINE (succinylcholine chloride) injection, Warnings and Precautions 5.9 — Risk of Prolonged Neuromuscular Block in Patients with Reduced Plasma Cholinesterase Activity',
        measuredMetric:
          'Stated population frequency of homozygosity for the atypical plasma cholinesterase gene, with named genetic and acquired causes of reduced activity',
        auditFlag: 'verified',
      },
      {
        id: 'sux-a4',
        category: 'measured',
        title:
          'Contraindicated after burns and denervation, because the muscle grows new receptors',
        laymanSummary:
          'After a major burn, a crush injury, a spinal cord injury or prolonged paralysis, muscle spreads immature receptors across its whole surface instead of keeping them at the nerve junction. Giving this drug then dumps potassium out of every muscle cell at once, and can stop the heart.',
        technicalDetails:
          'The label contraindicates succinylcholine after the acute phase of injury following major burns, multiple trauma, extensive denervation of skeletal muscle or upper motor neuron injury, because administration in those patients may result in severe hyperkalaemia and cardiac arrest. The mechanism is receptor upregulation: denervated or immobilised muscle expresses immature extrajunctional nicotinic receptors containing the gamma rather than the epsilon subunit across the whole fibre membrane, and those channels have a longer open time. A depolarising agonist therefore opens far more channels, for longer, over a far larger membrane area, and the potassium efflux is systemic rather than local. The label also names chronic abdominal infection, subarachnoid haemorrhage and conditions causing degeneration of central and peripheral nervous systems as increasing the risk, and states that the onset and duration of the risk period after such injuries are undetermined — which is an honest admission that nobody knows exactly when the window opens or closes.',
        evidenceSource:
          'FDA-approved US prescribing information for ANECTINE (succinylcholine chloride) injection, CONTRAINDICATIONS and Warnings and Precautions 5.4',
        measuredMetric:
          'Labelled contraindications by injury type, with the risk window explicitly stated as undetermined',
        auditFlag: 'verified',
      },
      {
        id: 'sux-a5',
        category: 'measured',
        title: 'It triggers malignant hyperthermia, and the genes are named on the label',
        laymanSummary:
          'In people carrying certain inherited muscle-calcium variants, this drug can start a runaway metabolic crisis with rigidity, high temperature and muscle breakdown. It is a contraindication, and the risk rises when it is combined with an anaesthetic gas.',
        technicalDetails:
          'The label contraindicates succinylcholine in patients with known or suspected genetic susceptibility to malignant hyperthermia, and separately in skeletal muscle myopathies. Its warnings state that in susceptible individuals succinylcholine may trigger malignant hyperthermia, a skeletal muscle hypermetabolic state leading to high oxygen demand, that fatal outcomes have been reported, and that the risk increases with concomitant administration of a volatile anaesthetic. It names inherited ryanodine receptor RYR1 and dihydropyridine receptor CACNA1S variants as the genetic basis, and lists hyperthermia, hypoxia, hypercapnia and muscle rigidity including masseter spasm among the signs. Succinylcholine and the volatile agents are the two trigger classes in anaesthesia, and this drug is the only one of the two that can be avoided without abandoning general anaesthesia altogether.',
        evidenceSource:
          'FDA-approved US prescribing information for ANECTINE (succinylcholine chloride) injection, CONTRAINDICATIONS and Warnings and Precautions 5.5 — Malignant Hyperthermia',
        measuredMetric:
          'Labelled contraindication with named susceptibility genes RYR1 and CACNA1S, and stated potentiation by concomitant volatile anaesthetic',
        auditFlag: 'verified',
      },
      {
        id: 'sux-a6',
        category: 'measured',
        title:
          'Twice as likely to cause anaphylaxis as the other relaxants, usually as bronchospasm',
        laymanSummary:
          'A year-long national audit of serious allergic reactions under anaesthesia found paralysing agents second only to antibiotics as a cause, and within that class succinylcholine was twice as likely as the others — typically presenting as sudden difficulty ventilating rather than as a rash.',
        technicalDetails:
          'The 6th National Audit Project reviewed 266 reports of Grade 3 to 5 perioperative anaphylaxis over one year across all NHS hospitals, estimating an overall incidence of about 1 in 10,000 anaesthetics and noting that exclusions for reporting delay and incomplete data mean the true figure might be about 70% higher. Of 199 identified culprit agents, neuromuscular blocking agents accounted for 65, second to antibiotics at 94. Succinylcholine-induced anaphylaxis, mainly presenting with bronchospasm, was twofold more likely than with the other neuromuscular blocking agents, whereas atracurium-induced anaphylaxis mainly presented with hypotension and the non-depolarising agents had similar incidences to one another. Onset was rapid for relaxants. Across all agents there were 40 cardiac arrests and 10 deaths, with pulseless electrical activity the usual arrest rhythm, and poor outcomes associated with higher ASA grade, obesity and beta blocker or angiotensin-converting enzyme inhibitor use. Only 24% of cases had been reported through the national pharmacovigilance scheme.',
        evidenceSource:
          'Harper NJN, Cook TM, Garcez T, et al. Anaesthesia, surgery, and life-threatening allergic reactions: epidemiology and clinical features of perioperative anaphylaxis in the 6th National Audit Project (NAP6). Br J Anaesth 2018;121:159-171',
        doi: '10.1016/j.bja.2018.04.014',
        measuredMetric:
          'Relative frequency of succinylcholine-induced anaphylaxis against other neuromuscular blocking agents, and its characteristic presenting feature',
        auditFlag: 'verified',
      },
      {
        id: 'sux-a7',
        category: 'inferred',
        title: 'The advantage is measured in seconds; the harms are measured in case reports',
        laymanSummary:
          'The trials that show this drug is better all measure the same thing: how good the view was when the tube went in. The reasons to avoid it are rare disasters that no trial of a few thousand elective patients could ever contain.',
        technicalDetails:
          'The Cochrane review is explicit that no severe adverse outcomes were reported in any of its 50 included trials. That is not evidence of safety; it is a statement about what a trial of 4,151 mostly elective patients can detect. Hyperkalaemic arrest in undiagnosed myopathy, malignant hyperthermia, and prolonged block from homozygous atypical cholinesterase all occur at frequencies between roughly 1 in 2,500 and considerably rarer, and the boxed warning was assembled from case reports and post-marketing surveillance rather than from a randomised comparison. This produces a structural asymmetry that a reader should see plainly: the benefit is quantified with confidence intervals, and the harms are quantified as labelled contraindications and population frequencies. Both are real. They are not commensurable, and any statement that succinylcholine is "better" or "worse" than rocuronium is a statement about how a clinician weighs a measured common advantage against an unmeasured rare catastrophe.',
        evidenceSource:
          'Tran DTT et al. Cochrane Database Syst Rev 2015;10:CD002788 (no severe adverse outcomes reported across 50 trials); FDA-approved US prescribing information for ANECTINE, BOXED WARNING',
        doi: '10.1002/14651858.CD002788.pub3',
        inferredClaim:
          'That an intubating-conditions advantage established in 4,151 elective patients settles the choice, when the harms driving the alternative occur at frequencies those trials could not have observed',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected, and most of it is destroyed on the way',
        laymanDesc:
          'An enzyme in the blood starts breaking the drug down the moment it is injected, so only a small fraction of the dose ever reaches the muscles.',
        molecularDetail:
          'Butyrylcholinesterase, also called plasma or pseudocholinesterase, hydrolyses succinylcholine in plasma to succinylmonocholine and then to succinic acid and choline. Because this happens before and during distribution, the amount arriving at the neuromuscular junction is a small fraction of the dose given, and the plasma enzyme rather than the receptor determines how long the block lasts.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the endplate and switches the receptor on',
        laymanDesc:
          'Unlike every other paralysing agent, this one is not a blocker. It is a copy of the natural transmitter — two of them joined together — and it activates the receptor.',
        molecularDetail:
          'The molecule is succinic acid diesterified with two cholines, structurally two acetylcholine molecules joined at their acyl ends. It binds the agonist sites at the alpha1-delta and alpha1-epsilon interfaces of the adult endplate receptor and opens the channel, producing the initial depolarisation seen clinically as fasciculation.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The junctional enzyme cannot remove it, so the switch stays on',
        laymanDesc:
          'Acetylcholine is destroyed within a thousandth of a second so the muscle can reset. Succinylcholine is not, so the endplate stays permanently switched on and the muscle cannot fire again.',
        molecularDetail:
          'Acetylcholinesterase in the synaptic cleft hydrolyses acetylcholine within about a millisecond but does not act on succinylcholine. Persistent agonist occupancy holds the endplate depolarised; the voltage-gated sodium channels in the surrounding perijunctional membrane become inactivated and cannot regenerate an action potential, so the fibre is unexcitable despite being depolarised.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Potassium leaves the muscle cell, which is usually trivial and sometimes fatal',
        laymanDesc:
          'Every time those channels open, potassium leaks out of the muscle into the blood. In a healthy person the rise is small. In someone whose muscle has grown extra receptors after a burn or a paralysis, it can be enough to stop the heart.',
        molecularDetail:
          'Serum potassium rises modestly in normal muscle. After denervation, burns, prolonged immobility or upper motor neuron injury, muscle expresses immature gamma-subunit-containing extrajunctional receptors across the whole fibre surface with prolonged channel open times, so agonist exposure produces a far larger and more widespread efflux. The label contraindicates use after the acute phase of such injuries and states that the onset and duration of the risk period are undetermined.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Complete paralysis in about a minute, gone in about five',
        laymanDesc:
          'Onset is faster than anything else available, and recovery happens on its own without any antidote — because the enzyme in the blood has been working the whole time.',
        molecularDetail:
          'The concentration gradient reverses as plasma drug is consumed, and succinylcholine diffuses back off the endplate into plasma to be hydrolysed. No reversal agent is used or needed, and an anticholinesterase given during a Phase I block prolongs it rather than reversing it, because inhibiting butyrylcholinesterase removes the only clearance mechanism there is.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'With prolonged exposure the block changes character',
        laymanDesc:
          'After enough drug or enough time, the block stops behaving like an overstimulated receptor and starts behaving like a blocked one — which changes what will and will not reverse it.',
        molecularDetail:
          'Phase I block shows no fade on train-of-four stimulation and no post-tetanic facilitation, and is deepened by anticholinesterases. With repeated or prolonged exposure it converts to a Phase II block that fades, shows post-tetanic facilitation and resembles a non-depolarising block, and may then respond to an anticholinesterase. The label warns that a Phase II block must be confirmed by a peripheral nerve stimulator and that spontaneous recovery must have plateaued, precisely because misdiagnosing the type and giving an anticholinesterase into a Phase I block prolongs the paralysis.',
        iconName: 'GitBranch',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'Tran Cochrane review of rocuronium versus succinylcholine for rapid sequence intubation',
        phase:
          'Systematic review and meta-analysis of 50 randomised and controlled clinical trials',
        sampleSize: 4151,
        primaryEndpoint: 'Excellent intubating conditions during rapid sequence induction',
        endpointMet: true,
        statisticalPValue:
          'Succinylcholine superior: risk ratio 0.86 (95% CI 0.81 to 0.92) for excellent conditions, 0.97 (95% CI 0.95 to 0.99) for clinically acceptable conditions, 0.81 (95% CI 0.73 to 0.88) with thiopental induction',
        unreportedAdverseSignals:
          'No severe adverse outcomes were reported in any included trial. That is the central limitation: the harms that justify choosing rocuronium instead occur at frequencies these 4,151 patients could not have revealed.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NAP6 — 6th National Audit Project on perioperative anaphylaxis',
        phase: 'National prospective audit of Grade 3 to 5 reactions over one year',
        sampleSize: 266,
        primaryEndpoint:
          'Incidence, culprit agent distribution and clinical features of perioperative anaphylaxis',
        endpointMet: true,
        statisticalPValue:
          'Estimated incidence about 1 in 10,000 anaesthetics; neuromuscular blocking agents 65 of 199 identified culprits; succinylcholine twofold more likely than other relaxants and mainly presenting with bronchospasm',
        unreportedAdverseSignals:
          'True incidence might be about 70% higher after allowing for excluded and late reports; only 24% of cases reached the national pharmacovigilance scheme.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'Post-marketing surveillance and case reports underlying the paediatric hyperkalaemic rhabdomyolysis boxed warning',
        phase: 'Regulatory pharmacovigilance and published case reports',
        sampleSize: 0,
        primaryEndpoint:
          'Cardiac arrest and death from hyperkalaemic rhabdomyolysis in apparently healthy children with undiagnosed skeletal muscle myopathy',
        endpointMet: true,
        statisticalPValue:
          'No trial exists and none could ethically be run. The evidence is case-based and the regulatory response was to restrict routine paediatric use rather than to quantify a rate.',
        unreportedAdverseSignals:
          'The label does not state an incidence, and this page does not supply one. The affected population is by definition undiagnosed at the time of exposure, so a denominator is not available.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Superior to rocuronium for excellent intubating conditions across 50 randomised trials and 4,151 participants, risk ratio 0.86 (95% CI 0.81 to 0.92)',
        'About 1 in 2,500 people are homozygous for the atypical plasma cholinesterase gene and are extremely sensitive to the drug, per the approved label',
        'Twofold higher anaphylaxis risk than other neuromuscular blocking agents in a national audit of 266 reactions, presenting mainly with bronchospasm',
        'Labelled contraindications after burns, multiple trauma, extensive denervation and upper motor neuron injury, on a defined receptor-upregulation mechanism',
        'A labelled malignant hyperthermia trigger with named RYR1 and CACNA1S susceptibility variants, potentiated by concomitant volatile anaesthetic',
      ],
      unsupportedInferences: [
        'That an intubating-conditions advantage measured in elective patients settles the choice against rocuronium, when the harms driving that choice are rarer than the trials could detect',
        'That a child who appears healthy has no myopathy — the assumption the boxed warning exists to break',
        'That the absence of severe adverse outcomes across 50 trials is evidence of safety rather than a statement about sample size',
        'That the risk window after a burn or denervating injury is known; the label states its onset and duration are undetermined',
      ],
      whatFailedInitially: [
        'Routine paediatric use was withdrawn after apparently healthy children died of hyperkalaemic cardiac arrest, and the label now reserves paediatric use for emergency airway control',
        'Seventy years of attempts to replace it have not produced a non-depolarising agent that matches it on intubating conditions in a pooled randomised comparison',
        'Routine pharmacovigilance captured only 24% of the perioperative anaphylaxis cases a dedicated national audit found',
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and still the fastest-acting, shortest-lasting paralysing agent available anywhere',
        'No CMS National Average Drug Acquisition Cost value is held on this record for succinylcholine, so no United States acquisition price is stated here',
        'Its risks generated an entire safety architecture: the boxed warning, the malignant hyperthermia registries, dantrolene stocking rules, and cholinesterase genotyping of affected families',
        'Sugammadex has done more to displace it than any relaxant did, by removing the duration advantage that kept it in use',
      ],
    },
    deliverySystem: {
      type: 'Sterile aqueous solution for intravenous injection and infusion, and for intramuscular use where no vein is accessible; refrigerated, with a limited room-temperature period',
      description:
        'Refrigeration is chemistry again: the molecule is a diester and hydrolyses in aqueous solution, so the potency of a warm vial falls with time. The intramuscular route exists specifically for the situation the boxed warning contemplates — a child with laryngospasm and no intravenous access — and it is the only common paralysing agent with a usable intramuscular route. There is no reversal agent and none is needed, because the plasma enzyme is the reversal mechanism.',
      safetyProfile:
        'Carries a boxed warning for ventricular dysrhythmias, cardiac arrest and death from hyperkalaemic rhabdomyolysis in paediatric patients with undiagnosed skeletal muscle myopathy, most often Duchenne muscular dystrophy, and paediatric use is reserved for emergency airway control. Contraindicated in known or suspected malignant hyperthermia susceptibility, in skeletal muscle myopathies, in known hypersensitivity, and after the acute phase of major burns, multiple trauma, extensive denervation or upper motor neuron injury. Not recommended where plasma cholinesterase activity is reduced, whether genetically or from pregnancy, liver or kidney disease, tumours, infection, burns, anaemia, decompensated heart disease, peptic ulcer, myxoedema, or exposure to oral contraceptives, glucocorticoids, certain monoamine oxidase inhibitors or organophosphates. It paralyses without sedating. Myalgia after fasciculation is common. No dosing guidance appears on this page.',
    },
    commonQuestions: [
      {
        q: 'Why does a seventy-year-old drug still beat the modern one?',
        a: 'Because of what it does to the receptor rather than how it was designed. Every modern relaxant blocks the receptor and has to wait for enough molecules to arrive to occupy 70 to 80% of them before anything happens. Succinylcholine activates the receptor, and one burst of activation is enough to make the endplate unexcitable. That is why paralysis is complete in under a minute and why, pooled across 50 randomised trials and 4,151 patients, it still produced better intubating conditions than rocuronium, with a risk ratio of 0.86. Its short duration comes from a second piece of luck: a plasma enzyme destroys most of the dose before it arrives, so recovery happens on its own in about five minutes with no antidote.',
      },
      {
        q: 'What is the boxed warning about, and does it apply to adults?',
        a: 'It applies specifically to children. Acute rhabdomyolysis with hyperkalaemia, ventricular dysrhythmias, cardiac arrest and death occurred in apparently healthy children who were found afterwards to have undiagnosed skeletal muscle myopathy, most often Duchenne muscular dystrophy. Duchenne is X-linked and usually not diagnosed until a boy is three or four, so the children who died were by definition the ones who looked fine. The label now reserves paediatric use for emergency intubation or where the airway must be secured immediately — laryngospasm, difficult airway, full stomach — or for intramuscular use when no vein is available. It also instructs that a healthy-looking child who arrests within minutes of the drug should be treated immediately for hyperkalaemia. In adults the analogous risk sits with burns, crush injury, spinal cord injury and prolonged immobility, which are contraindications.',
        auditNote:
          'Filed as a change of mind rather than a caution because a drug given to essentially every anaesthetised child became a drug reserved for emergencies.',
      },
      {
        q: 'Why can a burn or a spinal injury make this drug dangerous weeks later?',
        a: 'Because muscle that has lost its nerve supply, or has been immobilised, rebuilds its receptors. Normally the nicotinic receptors are packed into the endplate, a tiny fraction of the fibre surface, and they contain an epsilon subunit. After denervation or prolonged disuse, the muscle reverts to the fetal pattern: immature receptors containing a gamma subunit, spread across the entire fibre membrane, with channels that stay open longer. A depolarising agonist then opens vastly more channels, over a much larger area, for longer — and potassium pours out of every muscle in the body at once. The rise can be enough to stop the heart. The label contraindicates the drug after the acute phase of major burns, multiple trauma, extensive denervation and upper motor neuron injury, and states plainly that the onset and duration of the risk period are undetermined.',
      },
      {
        q: 'What happens if you cannot break the drug down?',
        a: 'You stay paralysed for hours instead of minutes, and if it is known about it is uneventful. The drug is destroyed by butyrylcholinesterase in plasma, and about 1 in 2,500 people are homozygous for a variant of that enzyme that barely touches it. The label names them, along with the acquired causes of low activity — pregnancy, severe liver or kidney disease, tumours, infection, burns, anaemia, decompensated heart disease, peptic ulcer, myxoedema — and the drugs that lower it, including oral contraceptives, glucocorticoids, some monoamine oxidase inhibitors and organophosphate exposure. Management is simply to keep the patient anaesthetised and ventilated until the block resolves. The important consequence is for the family: it is inherited, and an index case means relatives can be tested before they meet the drug themselves.',
      },
      {
        q: 'Why does it make my muscles ache the day after?',
        a: 'Because of the twitching that precedes the paralysis. Succinylcholine activates the receptor before it renders the muscle unexcitable, and that activation is unsynchronised across muscle fibres — a visible ripple across the face, chest and limbs called fasciculation. It is a brief, chaotic, involuntary contraction of muscle that has not been warmed up, and the resulting soreness is described most often in young, muscular, ambulatory patients. It is an expected consequence of the drug rather than a sign of surgical injury. New or severe muscle pain with dark urine after an anaesthetic is a different matter and needs assessment.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey holds no value for succinylcholine on this record. That survey measures what United States retail pharmacies pay to acquire a drug, and a refrigerated emergency injectable used almost entirely inside hospitals may not pass through retail pharmacy at all. Rather than substitute a list price, an international figure or an estimate, this page shows nothing. No verified per-dose cost-of-production study exists for it either, so no synthesis cost is shown.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'FDA-approved US prescribing information for ANECTINE (succinylcholine chloride) injection, Sandoz Inc — boxed warning, contraindications, malignant hyperthermia, hyperkalaemia and plasma cholinesterase sections',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=04a4e6f5-6fa1-42e1-a3f9-21fca7786b15',
        kind: 'regulatory',
      },
      {
        label:
          'Tran DTT, Newton EK, Mount VAH, Lee JS, Wells GA, Perry JJ. Rocuronium versus succinylcholine for rapid sequence induction intubation. Cochrane Database Syst Rev 2015;10:CD002788',
        identifier: '10.1002/14651858.CD002788.pub3',
        kind: 'doi',
      },
      {
        label:
          'Harper NJN, Cook TM, Garcez T, et al. Anaesthesia, surgery, and life-threatening allergic reactions: epidemiology and clinical features of perioperative anaphylaxis in the 6th National Audit Project (NAP6). Br J Anaesth 2018;121:159-171',
        identifier: '10.1016/j.bja.2018.04.014',
        kind: 'doi',
      },
      {
        label:
          'PubChem CID 5314 — succinylcholine dication structure, formula and molecular weight; chloride salt CID 22475',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5314',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Sugammadex — a drug with no human target, whose reversal effect is certain and whose patient
  //    benefit rests on two large observational studies that contradict each other.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sugammadex',
    name: 'Sugammadex',
    tradeName: 'Bridion',
    sponsor:
      'Merck Sharp & Dohme (MSD, subsidiary of Merck); designed at Organon Research in Newhouse, Scotland, published in 2002, authorised in the European Union on 25 July 2008 and approved in the United States on 15 December 2015',
    targetGene: 'None — sugammadex has no human gene or protein target',
    targetProtein:
      'The drug molecules rocuronium and vecuronium themselves, captured in a one-to-one inclusion complex in plasma; the nicotinic receptor is affected only indirectly, by the removal of what was blocking it',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'Reversal of neuromuscular blockade induced by rocuronium bromide and vecuronium bromide in adult and paediatric patients aged 2 years and older undergoing surgery',
    patientFriendlyIndication:
      'Undoing the paralysis at the end of an operation, quickly and completely, so the breathing tube can come out',
    anatomicalSite:
      'Plasma. Nothing about this drug happens inside a cell, and its only site of action is the bloodstream',
    conditionContext: {
      conditionExplainer:
        'Almost every drug works by binding a protein in the body. Sugammadex does not bind anything in the body at all. It is a molecular cage — a doughnut of eight sugar rings with eight negatively charged arms hanging off it — sized and charged so that a rocuronium molecule fits inside and will not come out. Injected into a vein, it captures rocuronium in the blood, the free concentration collapses, and the drug is drawn back off the neuromuscular junction by simple diffusion.',
      whyItMatters:
        'The old reversal agents worked by flooding the junction with more acetylcholine, which has a hard ceiling: once the enzyme is fully inhibited there is no more acetylcholine to be had, and a deep block simply cannot be reversed. Sugammadex has no such ceiling, because it removes the drug rather than competing with it. That turned a long-acting relaxant into one that can be switched off on demand.',
      whoTakesThis:
        'Adults and children over two who have received rocuronium or vecuronium during surgery. It does nothing whatsoever for succinylcholine, cisatracurium or atracurium.',
      clinicalGoals:
        'Return the train-of-four ratio to 0.9 or above within minutes, from any depth of block. Whether restoring that number changes whether a patient gets pneumonia is the question this page is mostly about, and the two largest studies of it disagree.',
    },
    oneSentenceVerdict:
      'A designed molecular cage that reverses rocuronium by capturing it in plasma rather than by acting on the patient at all — reliable and fast at its surrogate endpoint, and split down the middle on outcomes, with one matched cohort of 45,712 patients finding 30% fewer pulmonary complications (adjusted odds ratio 0.70) and a prospective cohort of 22,803 finding none at all (adjusted odds ratio 1.03).',
    laymanHowItWorks:
      'Sugammadex is shaped like a bucket made of sugar, with a greasy inside and eight negatively charged arms round the rim. Rocuronium is a greasy molecule carrying a positive charge. It slides into the bucket, the greasy parts stick together and the charges lock, and the pair travels around the bloodstream as one object that cannot reach the muscle. Because the free rocuronium in the blood suddenly drops to almost nothing, the rocuronium already sitting on the muscle receptors leaves and flows back into the blood, where more buckets are waiting. Within minutes the muscle can work again. The whole thing is chemistry between two drugs; the patient is just the container it happens in.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    substitutes: {
      summary:
        'The alternative is neostigmine, which reverses by a completely different route and has a ceiling sugammadex does not. The comparison on the surrogate endpoint is not close; the comparison on patient outcomes has two large observational studies pointing in opposite directions and no randomised trial. Nothing in a diet reverses neuromuscular blockade and nothing is listed here.',
      conventionalRx: [
        {
          name: 'Neostigmine with glycopyrrolate or atropine',
          class: 'Acetylcholinesterase inhibitor plus antimuscarinic cover',
          howItCompares:
            'Works by raising acetylcholine at the junction so it can outcompete the relaxant. That strategy saturates: once the enzyme is fully inhibited no more acetylcholine can be recruited, so a deep block cannot be reversed at all, and the drug must be given with an antimuscarinic to prevent bradycardia, secretions and bronchoconstriction. On pulmonary outcomes, STRONGER found it worse than sugammadex and POPULAR found no difference.',
          typicalCost:
            'No NADAC value is held on this record for neostigmine and none is asserted here',
          prosAndCons:
            'Pros: decades of use, inexpensive, and it works on every non-depolarising relaxant rather than only the steroid ones. Cons: a hard ceiling, obligatory antimuscarinic co-administration, and no effect on a profound block.',
        },
        {
          name: 'Waiting',
          class: 'No pharmacological intervention',
          howItCompares:
            'Spontaneous recovery from rocuronium takes roughly three quarters of an hour from an intubating dose, and residual block below a train-of-four ratio of 0.9 is undetectable by clinical examination. In POPULAR, extubating at a ratio of 0.9 or above had an adjusted odds ratio of 1.03 for pulmonary complications — that is, waiting for the number the whole practice is built around was not associated with better outcomes either.',
          typicalCost: 'No cost',
          prosAndCons:
            'Pros: no drug, no cost, no hypersensitivity risk. Cons: theatre time, and residual block that cannot be excluded without quantitative monitoring.',
        },
        {
          name: 'Cisatracurium (Nimbex) as the relaxant instead',
          class: 'Benzylisoquinolinium relaxant with organ-independent elimination',
          howItCompares:
            'Sidesteps the reversal question by using a relaxant that degrades spontaneously at body temperature and pH. Sugammadex does not bind it at all — the encapsulation is specific to the steroid-backbone agents.',
          typicalCost:
            'No NADAC value is held on this record for cisatracurium and none is asserted here',
          prosAndCons:
            'Pros: predictable offset regardless of liver or kidney function. Cons: slow onset, and if a block needs abolishing urgently there is no antidote at all.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'If you take hormonal contraception, ask about this drug specifically',
          action:
            'The cage that captures rocuronium also captures progestogens. The label instructs that patients must use an additional non-hormonal method of contraception for seven days after receiving sugammadex.',
          patientImpact:
            'This is one of the very few interactions on any page in this file that changes what a patient should do after they go home, and it is easy to miss because the drug was given while they were asleep.',
          clinicalPrecaution:
            "The seven-day instruction is the label's, not this page's, and the discussion belongs with the clinical team.",
        },
        {
          name: 'Report a previous reaction to a reversal drug',
          action:
            'Serious hypersensitivity including anaphylaxis has occurred, and in a dedicated randomised repeat-dose study in healthy volunteers the frequency of anaphylaxis was 0.3%.',
          patientImpact:
            'Sugammadex is given at the very end of an operation, when monitoring is being removed and the team is preparing to move the patient, which is the least convenient moment for a reaction to begin.',
          clinicalPrecaution:
            'History to volunteer beforehand. Anaphylaxis management belongs entirely to the clinical team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C(CSC[C@@H]1[C@@H]2[C@@H]([C@H]([C@H](O1)O[C@@H]3[C@H](O[C@@H]([C@@H]([C@H]3O)O)O[C@@H]4[C@H](O[C@@H]([C@@H]([C@H]4O)O)O[C@@H]5[C@H](O[C@@H]([C@@H]([C@H]5O)O)O[C@@H]6[C@H](O[C@@H]([C@@H]([C@H]6O)O)O[C@@H]7[C@H](O[C@@H]([C@@H]([C@H]7O)O)O[C@@H]8[C@H](O[C@@H]([C@@H]([C@H]8O)O)O[C@@H]9[C@H](O[C@H](O2)[C@@H]([C@H]9O)O)CSCCC(=O)O)CSCCC(=O)O)CSCCC(=O)O)CSCCC(=O)O)CSCCC(=O)O)CSCCC(=O)O)CSCCC(=O)O)O)O)C(=O)O',
      chemicalFormula: 'C72H112O48S8',
      molecularWeight: '2002.20 g/mol as the free acid; dispensed as the sodium salt',
      targetReceptorAffinity:
        'There is no receptor. The relevant quantity is the strength of a host-guest inclusion complex between two drug molecules in plasma, formed one-to-one. The gamma-cyclodextrin core is a ring of eight glucose units whose interior is hydrophobic and whose rim was extended with eight thioether-linked carboxylate arms. The hydrophobic androstane skeleton of rocuronium slides into the cavity and its quaternary nitrogen is held by electrostatic attraction to the negatively charged arms. Affinity is highest for rocuronium, lower for vecuronium, and negligible for the benzylisoquinolinium relaxants, which is why the drug reverses two agents and not the class.',
      structureSource: {
        label: 'PubChem CID 6918585 (sugammadex) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918585',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'sug-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Ring size and substitution count of the gamma-cyclodextrin starting material',
          description:
            'Confirm the starting cyclodextrin is the eight-glucose gamma ring and not the seven-glucose beta one. Cavity diameter is the whole design: a beta ring is too small for the steroid guest, and a mixture of ring sizes produces a product with the right formula on average and the wrong binding in practice.',
          reagentsAndBuffer:
            'Gamma-cyclodextrin reference standard, mass spectrometry for ring size distribution, nuclear magnetic resonance for substitution pattern, high-performance anion-exchange chromatography with pulsed amperometric detection',
        },
        {
          id: 'sug-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Perhalogenation at the primary 6-positions',
          description:
            'Convert all eight primary hydroxyls at the 6-position to leaving groups without touching the secondary rim. Incomplete substitution is the dominant impurity class here and it is not a trace concern: a seven-armed molecule binds measurably differently from an eight-armed one, and the label acknowledges the product may contain up to 7% of the mono-hydroxy derivative.',
          dependsOnStepId: 'sug-w1',
          reagentsAndBuffer:
            'Iodine and triphenylphosphine in dimethylformamide or an equivalent halogenation system, anhydrous conditions, controlled temperature, mass spectrometry to track the degree of substitution',
        },
        {
          id: 'sug-w3',
          stepNumber: 3,
          phase: 'Conjugation',
          name: 'Thioether coupling of eight 3-mercaptopropionic acid arms',
          description:
            "Displace all eight leaving groups with the thiolate of 3-mercaptopropionic acid to install the negatively charged arms. Arm length was the tuned variable in the original design programme: too short and the carboxylates do not reach the guest's quaternary nitrogen, too long and they fold back into the cavity and block it.",
          dependsOnStepId: 'sug-w2',
          reagentsAndBuffer:
            '3-mercaptopropionic acid, sodium hydride or an equivalent base, dimethylformamide under nitrogen, controlled temperature, thiol handling under inert atmosphere to prevent disulfide formation',
        },
        {
          id: 'sug-w4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Separation by degree of substitution, not by molecular weight alone',
          description:
            'Purify by ion-exchange and preparative chromatography against a substitution-count specification. Species differing by one arm differ by 88 daltons in a 2,002-dalton molecule, so a weight-only specification is not discriminating and the release test has to resolve charge as well as mass.',
          dependsOnStepId: 'sug-w2',
          reagentsAndBuffer:
            'Anion-exchange chromatography, preparative reversed-phase HPLC, mono-hydroxy derivative reference standard, capillary electrophoresis for charge heterogeneity, sodium salt formation and lyophilisation',
        },
        {
          id: 'sug-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Isothermal titration calorimetry against rocuronium, vecuronium and the decoys',
          description:
            'Measure the binding thermodynamics of the complex directly, and measure it against the molecules the drug must not capture as well as the ones it must. Selectivity is a safety property here, not a marketing one: the same cavity that takes an androstane steroid also takes progestogens and toremifene, which is exactly why both appear in the label.',
          dependsOnStepId: 'sug-w4',
          reagentsAndBuffer:
            'Isothermal titration calorimetry in phosphate-buffered saline at 37 degrees C, rocuronium and vecuronium as guests, progestogen and toremifene as counter-screens, cisatracurium as a negative control, stoichiometry fitted to a one-site model',
        },
        {
          id: 'sug-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Train-of-four ratio to 0.9, reported as the surrogate it is',
          description:
            'Measure time from administration to a train-of-four ratio of 0.9 or above, from defined depths of block, with acceleromyography normalised to baseline. Report it as a neuromuscular measurement and not as a clinical outcome. Everything this drug is known to do is measured here, and everything that is argued about lies downstream of it.',
          dependsOnStepId: 'sug-w5',
          reagentsAndBuffer:
            'Train-of-four at 2 Hz every 12 seconds, post-tetanic count for profound block, acceleromyography or electromyography with baseline normalisation, neostigmine comparator at matched depth, temperature control at the monitored limb',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sug-a1',
        category: 'measured',
        title: 'A drug designed as a container, and it works exactly as designed',
        laymanSummary:
          'Chemists set out to build a molecule that would swallow rocuronium rather than compete with it. They published the working molecule in 2002. It does precisely that, and it is the reason a deep paralysis can now be abolished in minutes.',
        technicalDetails:
          'Bom and colleagues at Organon Research in Newhouse published the concept of chemical encapsulation of rocuronium by a cyclodextrin-based synthetic host in 2002. The design took a gamma-cyclodextrin — a ring of eight glucose units with a hydrophobic interior — and extended the rim with eight thioether-linked carboxylate arms, so that the hydrophobic androstane core of rocuronium enters the cavity while its quaternary ammonium is held electrostatically by the arms. The approved label describes the mechanism in the same terms: a modified gamma cyclodextrin that forms a complex with rocuronium and vecuronium and reduces the amount available to bind nicotinic receptors at the neuromuscular junction. This is unusual enough to be worth stating plainly: sugammadex has no human target, no receptor, no enzyme and no transporter. Its pharmacodynamics are the chemistry of two drugs meeting in plasma, and the patient is the vessel.',
        evidenceSource:
          'Bom A, Bradley M, Cameron K, et al. A novel concept of reversing neuromuscular block: chemical encapsulation of rocuronium bromide by a cyclodextrin-based synthetic host. Angew Chem Int Ed Engl 2002;41:266-270; FDA-approved US prescribing information, Mechanism of Action 12.1',
        doi: '10.1002/1521-3773(20020118)41:2<265::aid-anie265>3.0.co;2-q',
        measuredMetric:
          'Formation of a one-to-one inclusion complex with rocuronium and vecuronium in plasma, with negligible binding to benzylisoquinolinium relaxants',
        auditFlag: 'verified',
      },
      {
        id: 'sug-a2',
        category: 'inferred',
        title: 'Two large studies of the same question reached opposite answers',
        laymanSummary:
          'Does reversing with sugammadex instead of the older drug mean fewer lung complications after surgery? A study of 45,712 American patients said 30% fewer. A study of 22,803 European patients said no difference at all. Neither was randomised.',
        technicalDetails:
          'STRONGER matched 22,856 sugammadex patients to 22,856 neostigmine patients across 12 United States hospitals, exact-matching on institution, sex, age, comorbidity, obesity, procedure type and relaxant. The composite of major postoperative pulmonary complications occurred in 3.5% versus 4.8%, giving an adjusted odds ratio of 0.70 (95% CI 0.63 to 0.77); pneumonia 1.3% versus 2.2%, adjusted odds ratio 0.53 (0.44 to 0.62); respiratory failure 0.8% versus 1.7%, adjusted odds ratio 0.45 (0.37 to 0.56). POPULAR prospectively followed 22,803 patients at 211 hospitals in 28 European countries with a physical examination within three days of surgery, and found the choice of sugammadex rather than neostigmine had an adjusted odds ratio of 1.03 (95% CI 0.85 to 1.25) for postoperative pulmonary complications, with an adjusted absolute risk reduction of -0.3% (95% CI -2.4 to 1.5). In the same dataset, giving any reversal agent had an odds ratio of 1.23 and extubating at a train-of-four ratio of 0.9 or above had an odds ratio of 1.03. Both studies are large, both are observational, and both are subject to different confounding — STRONGER to institutional practice differences that matching cannot fully absorb, POPULAR to selection of sicker patients into more intensive management. No randomised trial has tested sugammadex against neostigmine on a clinical outcome. The honest position is that the surrogate benefit is certain and the outcome benefit is unresolved.',
        evidenceSource:
          'Kheterpal S, Vaughn MT, Dubovoy TZ, et al. Anesthesiology 2020;132:1371-1381; Kirmeier E, Eriksson LI, Lewald H, et al. Lancet Respir Med 2019;7:129-140',
        doi: '10.1097/ALN.0000000000003256',
        inferredClaim:
          'That reversing with sugammadex reduces postoperative pulmonary complications — an inference supported by one large matched cohort, contradicted by another large prospective cohort, and never tested in a randomised outcome trial',
        auditFlag: 'contested',
      },
      {
        id: 'sug-a3',
        category: 'measured',
        title: 'Anaphylaxis at 0.3% in the study built to look for it',
        laymanSummary:
          'Rather than relying on reports coming in after approval, a randomised placebo-controlled study gave healthy volunteers repeated doses specifically to characterise hypersensitivity. One in 299 had anaphylaxis.',
        technicalDetails:
          'The label describes a randomised, double-blind, placebo-controlled, parallel-group, repeat-dose study in which 375 subjects received three doses with a five-week washout: 151 at 4 mg/kg, 148 at 16 mg/kg and 76 on placebo. The frequency of anaphylaxis among the 299 healthy volunteers who received sugammadex was 0.3%, a single case in the 16 mg/kg group on the first dose, with conjunctival oedema, urticaria, erythema, swelling of the uvula and a reduction in peak expiratory flow. This is a better class of evidence than most hypersensitivity data, because it is a prospective randomised design with a defined denominator rather than a spontaneous reporting rate, and it is worth noting that the case occurred on first exposure. The label carries anaphylaxis and hypersensitivity as its lead warning and instructs clinicians to be prepared for it.',
        evidenceSource:
          'FDA-approved US prescribing information for sugammadex injection, Warnings and Precautions 5.1 — Anaphylaxis and Hypersensitivity (DailyMed SPL 8e685b67-6804-4d97-b43e-0259b3fe231f)',
        measuredMetric:
          'Frequency of anaphylaxis in 299 healthy volunteers in a randomised placebo-controlled repeat-dose study',
        auditFlag: 'verified',
      },
      {
        id: 'sug-a4',
        category: 'measured',
        title: 'Marked bradycardia, some of it cardiac arrest, within minutes of administration',
        laymanSummary:
          'The label warns that the heart rate can drop severely within minutes of giving this drug, and that some of those episodes have ended in cardiac arrest.',
        technicalDetails:
          'The approved label states that cases of marked bradycardia, some of which have resulted in cardiac arrest, have been observed within minutes after administration of sugammadex, and instructs monitoring for haemodynamic changes with administration of an anticholinergic such as atropine if clinically significant bradycardia occurs. This warning is worth setting against the usual framing of the drug, which contrasts it favourably with neostigmine precisely because neostigmine requires a co-administered antimuscarinic to prevent bradycardia. Sugammadex is given without routine antimuscarinic cover and can still produce the same effect. The mechanism is not established, and no incidence is stated on the label, so none is stated here.',
        evidenceSource:
          'FDA-approved US prescribing information for sugammadex injection, Warnings and Precautions 5.2 — Marked Bradycardia',
        measuredMetric:
          'Labelled warning of marked bradycardia and cardiac arrest within minutes of administration, without a stated incidence',
        auditFlag: 'caution',
      },
      {
        id: 'sug-a5',
        category: 'measured',
        title: 'The cage also captures hormonal contraceptives, and the label says so',
        laymanSummary:
          'The same cavity that swallows rocuronium swallows progestogens. Anyone using hormonal contraception is told to use an additional non-hormonal method for seven days after receiving this drug.',
        technicalDetails:
          'The label states that certain drugs, including hormonal contraceptives, could become less effective because sugammadex lowers their free plasma concentration, and instructs that patients must use an additional non-hormonal method of contraception for seven days after administration. It also names toremifene, which has a relatively high binding affinity for sugammadex and may reach relatively high plasma concentrations, as capable of displacing rocuronium or vecuronium from the complex and delaying recovery to a train-of-four ratio of 0.9. The label states that its interaction assessments are based on binding affinity, preclinical experiments, clinical studies and pharmacokinetic-pharmacodynamic simulation, and that no clinically significant pharmacodynamic interactions are expected other than these two. This audit is on the page because it is the clearest consequence of a drug whose mechanism is promiscuous molecular capture: the cavity does not know what it is supposed to catch.',
        evidenceSource:
          'FDA-approved US prescribing information for sugammadex injection, Warnings and Precautions 5.6 and Drug Interactions 7.1 to 7.3',
        measuredMetric:
          'Labelled requirement for seven days of additional non-hormonal contraception, and labelled displacement interaction with toremifene',
        auditFlag: 'verified',
      },
      {
        id: 'sug-a6',
        category: 'conclusion_shift',
        title: 'Seven and a half years between European and American approval',
        laymanSummary:
          'Europe authorised this drug in July 2008. The United States approved it in December 2015. The reversal effect was never in question for either regulator.',
        technicalDetails:
          'The European Medicines Agency granted marketing authorisation for Bridion on 25 July 2008 to Merck Sharp & Dohme B.V. The United States Food and Drug Administration approved the original application, NDA 022225, on 15 December 2015 — a gap of seven years and five months, during which the drug was in routine use across Europe and unavailable in the United States. Both regulators had the same neuromuscular efficacy data. What separates them is how each weighed the hypersensitivity signal, and the eventual United States label leads with anaphylaxis as its first warning and cites a dedicated randomised repeat-dose study of 375 subjects designed to characterise it. This entry is filed as a change of position rather than a failure because nothing about the drug changed across those years: the same molecule, the same surrogate endpoint and the same efficacy were judged sufficient in one jurisdiction and insufficient in another for most of a decade.',
        evidenceSource:
          'European Medicines Agency EPAR for Bridion, marketing authorisation dated 25 July 2008; FDA Drugs@FDA record for NDA 022225, original approval 15 December 2015',
        inferredClaim:
          'That regulatory approval of a reversal agent turns on its reversal efficacy — when the efficacy was never disputed and the seven-year divergence was entirely about a safety signal',
        auditFlag: 'verified',
      },
      {
        id: 'sug-a7',
        category: 'inferred',
        title: 'Every efficacy claim is anchored to a number on a nerve monitor',
        laymanSummary:
          'The endpoint in every trial is the train-of-four ratio reaching 0.9. That is a measurement of muscle twitch, not of anything a patient experiences, and the one large study that tested whether reaching it improves outcomes found no association.',
        technicalDetails:
          'A train-of-four ratio is the height of the fourth twitch divided by the first, in response to four electrical stimuli delivered to a peripheral nerve. A ratio of 0.9 became the accepted threshold for adequate recovery because below it pharyngeal function and upper airway patency are measurably impaired in volunteers. Sugammadex reaches that threshold faster and from deeper blocks than neostigmine can, reliably and reproducibly, and that is the basis of its licence. The chain from there to a patient outcome has one weak link and one broken one. The weak link is that residual block is associated with pulmonary complications in observational data. The broken link is POPULAR, which found that extubating at a train-of-four ratio of 0.9 or above had an adjusted odds ratio of 1.03 (95% CI 0.82 to 1.31) for postoperative pulmonary complications — the surrogate itself did not track the outcome. This does not mean the surrogate is meaningless; it means the inference from the surrogate to the outcome has been tested once at scale and did not hold.',
        evidenceSource:
          'Kirmeier E, Eriksson LI, Lewald H, et al. Lancet Respir Med 2019;7:129-140; FDA-approved US prescribing information for sugammadex injection, Clinical Studies',
        doi: '10.1016/S2213-2600(18)30294-7',
        inferredClaim:
          'That restoring the train-of-four ratio to 0.9 or above delivers the clinical benefit the ratio is used to represent',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected into a vein, and it stays there',
        laymanDesc:
          'The molecule is large, heavily charged and extremely water-soluble. It does not enter cells, does not cross into the brain, and does not bind anything in the body.',
        molecularDetail:
          'At 2,002 daltons with eight carboxylate groups, sugammadex is confined to the extracellular space and is not metabolised. It is excreted essentially unchanged by the kidney, which is why renal function governs how long it and its complex remain in circulation, and why waiting times before giving another relaxant are longer in renal impairment.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Rocuronium slides into the cavity',
        laymanDesc:
          'The molecule is a ring of eight sugars with a greasy hole in the middle. The greasy steroid skeleton of rocuronium fits into that hole.',
        molecularDetail:
          'The gamma-cyclodextrin cavity is hydrophobic and its diameter was the design constraint: the seven-unit beta ring is too narrow for an androstane guest. Inclusion is driven by the hydrophobic effect, with the steroid nucleus displacing ordered water from the cavity.',
        iconName: 'Container',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The charged arms close around it',
        laymanDesc:
          'Eight negatively charged arms hang off the rim of the ring. Rocuronium carries a positive charge, and the arms hold onto it so it cannot slip back out.',
        molecularDetail:
          'The thioether-linked carboxylate arms were the tuned element of the original design programme, with arm length chosen so the negative charges sit at the right distance to interact with the quaternary ammonium of the guest. The result is a one-to-one complex with high affinity for rocuronium, lower for vecuronium, and essentially none for benzylisoquinolinium relaxants such as cisatracurium.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Free rocuronium in the blood collapses toward zero',
        laymanDesc:
          'With enough cages circulating, there is almost no unbound rocuronium left in the bloodstream.',
        molecularDetail:
          'Because sequestration is stoichiometric rather than competitive, the free plasma concentration falls in proportion to how much sugammadex is present, with no ceiling. This is the structural difference from neostigmine, which raises junctional acetylcholine to compete with the relaxant and can raise it no further once acetylcholinesterase is fully inhibited.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The relaxant leaves the muscle because the gradient reversed',
        laymanDesc:
          'Nothing is done to the muscle at all. The drug sitting on the receptors simply diffuses back into the blood, because that is now where the empty space is.',
        molecularDetail:
          'Rocuronium leaves the neuromuscular junction down its own concentration gradient into plasma, where further sugammadex captures it. Receptor occupancy falls, endplate potentials recover above threshold and neuromuscular transmission resumes. Because the mechanism is removal rather than competition, it works from profound block — where an anticholinesterase has no effect at all.',
        iconName: 'ArrowLeftRight',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Both molecules leave together through the kidney',
        laymanDesc:
          'The cage and its captive are excreted in the urine as a single unit, unchanged.',
        molecularDetail:
          'The complex is cleared renally without metabolism. Two consequences follow directly. In renal impairment the complex persists, which is why the label sets longer waiting times before another steroid relaxant may be given. And if too little sugammadex is given for the amount of relaxant present, the complex can dissociate as free drug is cleared, producing recurrence of paralysis — a labelled risk both from under-dosing and from displacement by a competing guest such as toremifene.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'STRONGER — sugammadex versus neostigmine and postoperative pulmonary complications',
        phase: 'Multicentre matched-cohort observational analysis across 12 US hospitals',
        sampleSize: 45712,
        primaryEndpoint:
          'Composite of major postoperative pulmonary complications — pneumonia, respiratory failure or other pulmonary complication',
        endpointMet: true,
        statisticalPValue:
          '3.5% with sugammadex versus 4.8% with neostigmine; adjusted odds ratio 0.70 (95% CI 0.63 to 0.77); pneumonia 0.53 (0.44 to 0.62); respiratory failure 0.45 (0.37 to 0.56)',
        unreportedAdverseSignals:
          'Observational and matched rather than randomised. Its result is directly contradicted by POPULAR on the identical comparison, and neither design can adjudicate between them.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId:
          'POPULAR — post-anaesthesia pulmonary complications after use of muscle relaxants (NCT01865513)',
        phase: 'Multicentre prospective observational cohort at 211 hospitals in 28 countries',
        sampleSize: 22803,
        primaryEndpoint:
          'Incidence of postoperative pulmonary complications from end of surgery to day 28',
        endpointMet: false,
        statisticalPValue:
          'Sugammadex versus neostigmine adjusted odds ratio 1.03 (95% CI 0.85 to 1.25), adjusted absolute risk reduction -0.3% (95% CI -2.4 to 1.5); extubation at train-of-four ratio 0.9 or above 1.03 (0.82 to 1.31)',
        unreportedAdverseSignals:
          'The same study found that giving any reversal agent had an adjusted odds ratio of 1.23 and that using neuromuscular monitoring had 1.31 — every recommended mitigation came back null or worse, which is consistent with confounding by indication rather than with harm.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId:
          'Randomised placebo-controlled repeat-dose hypersensitivity study in healthy volunteers',
        phase: 'Randomised, double-blind, placebo-controlled, parallel-group, repeat-dose study',
        sampleSize: 375,
        primaryEndpoint: 'Nature and frequency of anaphylaxis and hypersensitivity',
        endpointMet: true,
        statisticalPValue:
          'Anaphylaxis in 0.3% of the 299 volunteers who received sugammadex — one case, in the 16 mg/kg group, on the first dose',
        unreportedAdverseSignals:
          'The single case occurred on first exposure rather than on repeat dosing, which is the opposite of what a sensitisation model would predict and which the label does not attempt to explain.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Formation of a one-to-one inclusion complex with rocuronium and vecuronium in plasma, with negligible affinity for benzylisoquinolinium relaxants',
        'Reversal to a train-of-four ratio of 0.9 within minutes and from depths of block that an anticholinesterase cannot reverse at all',
        'Anaphylaxis in 0.3% of 299 healthy volunteers in a randomised placebo-controlled repeat-dose study built to measure it',
        'Adjusted odds ratio 0.70 for major pulmonary complications versus neostigmine in a matched cohort of 45,712 patients',
        'Adjusted odds ratio 1.03 for the identical comparison in a prospective cohort of 22,803 patients',
        'Labelled capture of hormonal contraceptives requiring seven days of additional non-hormonal contraception, and labelled displacement by toremifene',
      ],
      unsupportedInferences: [
        'That faster reversal to a train-of-four ratio of 0.9 delivers fewer pulmonary complications — the two largest studies of it disagree and no randomised outcome trial exists',
        'That the train-of-four ratio is itself a patient outcome; extubating at 0.9 or above had an odds ratio of 1.03 in the study that checked',
        'That a drug with no human target has a correspondingly clean safety profile — the label leads with anaphylaxis and warns of bradycardia progressing to cardiac arrest',
        'That capturing rocuronium is all the cavity does; it also captures progestogens, and that is a labelled consequence for the patient',
      ],
      whatFailedInitially: [
        'The pulmonary outcome case failed to replicate: STRONGER found a 30% reduction and POPULAR found none, on the same comparison',
        'The surrogate itself failed its own test in POPULAR, where extubation at a train-of-four ratio of 0.9 or above was not associated with better outcomes',
        'United States approval failed for seven years and five months after European authorisation, on a safety signal rather than on efficacy',
      ],
      realWorldOutcome: [
        'Changed what is possible in an operating theatre: a profound neuromuscular block can now be abolished on demand, which no previous agent could do',
        'No CMS National Average Drug Acquisition Cost value is held on this record for sugammadex, so no United States acquisition price is stated here',
        "Has done more to displace succinylcholine from rapid sequence intubation than any relaxant did, by removing rocuronium's duration disadvantage",
        'Remains the only marketed drug in routine anaesthesia whose mechanism involves no human molecular target at all',
      ],
    },
    deliverySystem: {
      type: 'Sterile aqueous solution for intravenous bolus injection, as the sodium salt; single-dose vials',
      description:
        'There is no formulation problem to solve. The molecule is extremely water-soluble, is not metabolised, does not enter cells and does not cross the blood-brain barrier, so it is presented as a simple aqueous solution and given as a single bolus into a running intravenous line. The dose depends on the depth of block being reversed rather than on time elapsed, because the drug works stoichiometrically — it must outnumber the relaxant present. That relationship, rather than any pharmacokinetic subtlety, is why under-dosing causes recurrence of paralysis.',
      safetyProfile:
        'The label leads with anaphylaxis and hypersensitivity, characterised prospectively at 0.3% in 299 healthy volunteers. It warns of marked bradycardia, some cases resulting in cardiac arrest, within minutes of administration, and instructs monitoring with anticholinergic treatment if needed. Ventilatory support is mandatory until spontaneous respiration and airway patency are assured, because paralysis can persist or recur. Recurrence can also follow under-dosing or displacement of the relaxant from the complex by another drug, with the risk greatest over about three elimination half-lives. Hormonal contraception is rendered less effective and an additional non-hormonal method is required for seven days. Waiting times before a steroid relaxant may be given again are longer in renal impairment, and a non-steroidal relaxant should be considered instead. No dosing guidance appears on this page.',
    },
    commonQuestions: [
      {
        q: 'How can a drug work without acting on the body at all?',
        a: "Because its target is another drug. Sugammadex is a modified gamma-cyclodextrin: a ring of eight glucose units with a greasy hole through the middle and eight negatively charged arms round the rim. Rocuronium is a greasy steroid carrying a positive charge. The steroid slides into the hole, the arms hold the charge, and the two travel as a single complex that cannot reach a muscle receptor. Because free rocuronium in the blood collapses toward zero, the rocuronium already sitting on the neuromuscular junction diffuses back off it into the plasma. Nothing is done to the patient's receptors, enzymes or transporters. The label describes this in the same terms — a modified gamma cyclodextrin that reduces the amount of relaxant available to bind nicotinic receptors — and it is the only drug in routine anaesthesia with no human target.",
      },
      {
        q: 'Does it actually make surgery safer, or just make the monitor look better?',
        a: 'That is precisely the unresolved question, and it is worth seeing the two answers side by side. STRONGER matched 22,856 sugammadex patients to 22,856 neostigmine patients across twelve United States hospitals and found major pulmonary complications in 3.5% versus 4.8%, an adjusted odds ratio of 0.70, with pneumonia down 47% and respiratory failure down 55%. POPULAR prospectively followed 22,803 patients at 211 hospitals across 28 European countries and found an adjusted odds ratio of 1.03 for the same comparison — no difference. Both are large. Neither is randomised. In the same POPULAR dataset, using a nerve monitor, giving any reversal agent, and extubating at a train-of-four ratio of 0.9 or above were all likewise not associated with better outcomes, which suggests the confounding runs deep. No randomised trial has tested sugammadex against neostigmine on a clinical outcome.',
        auditNote:
          'This is the central unresolved question about a drug that is now used routinely, and the page states it as unresolved rather than picking the flattering study.',
      },
      {
        q: 'Why did the United States take seven extra years to approve it?',
        a: 'The European Medicines Agency authorised Bridion on 25 July 2008. The FDA approved the same product on 15 December 2015 — seven years and five months later. Neither regulator ever disputed that the drug reverses rocuronium. What differed was the weight placed on the hypersensitivity signal, and the eventual American label reflects it: anaphylaxis and hypersensitivity is the first warning, and it cites a dedicated randomised, double-blind, placebo-controlled repeat-dose study of 375 subjects designed specifically to characterise the risk, in which anaphylaxis occurred in 0.3% of the 299 who received the drug. During that gap the drug was in ordinary use across Europe and unobtainable in the United States.',
      },
      {
        q: 'I am on the pill. Does this drug affect it?',
        a: 'Yes, and the label is specific about what to do. The cavity that captures rocuronium also captures progestogens, lowering their free plasma concentration and making hormonal contraception less effective. The label instructs that patients must use an additional, non-hormonal method of contraception for seven days after receiving sugammadex. This is unusually consequential for an intraoperative drug, because it is given while the patient is unconscious and the effect lands entirely after discharge. The same promiscuity of the cavity underlies the other named interaction, with toremifene, which can displace rocuronium from the complex and delay recovery.',
      },
      {
        q: 'If it has no target in the body, is it harmless?',
        a: 'No, and the label makes that clear from its first warning. Serious hypersensitivity including anaphylaxis has occurred, characterised prospectively at 0.3% in healthy volunteers, with the one case occurring on first exposure. The label also warns of marked bradycardia, some cases of which have resulted in cardiac arrest, within minutes of administration, and instructs anticholinergic treatment if clinically significant bradycardia appears. That warning deserves attention because sugammadex is often contrasted favourably with neostigmine on exactly this point: neostigmine has to be given with an antimuscarinic to prevent bradycardia, and sugammadex is not, and can still cause it. Paralysis can also recur if too little is given or if another drug displaces the relaxant from the complex.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey holds no value for sugammadex on this record. That survey measures what United States retail pharmacies pay, and a hospital-only intraoperative injectable does not pass through retail pharmacy. Rather than substitute a wholesale list price or an estimate, this page shows nothing. What can be said without a number is that this is a synthesised eight-armed cyclodextrin requiring substitution-count-specific purification, which is a genuinely more demanding manufacture than the commodity molecule it reverses.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Bom A, Bradley M, Cameron K, et al. A novel concept of reversing neuromuscular block: chemical encapsulation of rocuronium bromide by a cyclodextrin-based synthetic host. Angew Chem Int Ed Engl 2002;41:266-270',
        identifier: '12491405',
        kind: 'pmid',
      },
      {
        label:
          'Kheterpal S, Vaughn MT, Dubovoy TZ, et al. Sugammadex versus neostigmine for reversal of neuromuscular blockade and postoperative pulmonary complications (STRONGER). Anesthesiology 2020;132:1371-1381',
        identifier: '10.1097/ALN.0000000000003256',
        kind: 'doi',
      },
      {
        label:
          'Kirmeier E, Eriksson LI, Lewald H, et al. Post-anaesthesia pulmonary complications after use of muscle relaxants (POPULAR). Lancet Respir Med 2019;7:129-140',
        identifier: '10.1016/S2213-2600(18)30294-7',
        kind: 'doi',
      },
      {
        label:
          'FDA-approved US prescribing information for sugammadex injection (DailyMed structured product label, Fresenius Kabi USA) — anaphylaxis, marked bradycardia, contraceptive and toremifene interactions, mechanism of action',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8e685b67-6804-4d97-b43e-0259b3fe231f',
        kind: 'regulatory',
      },
      {
        label:
          'European Medicines Agency, Bridion (sugammadex) European Public Assessment Report — marketing authorisation dated 25 July 2008',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/bridion',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 6918585 — sugammadex structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6918585',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Dexmedetomidine — a sedative that borrows the brain's own sleep switch, and that has now
  //    failed to reduce mortality, delirium or atrial fibrillation in three separate large trials.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dexmedetomidine',
    name: 'Dexmedetomidine',
    tradeName:
      'Precedex; also marketed as dexmedetomidine hydrochloride in sodium chloride, and as Igalmi sublingual film',
    sponsor:
      'Hospira, a Pfizer company (US label holder for Precedex); developed at Orion in Finland as the dextro-enantiomer of medetomidine and approved in the United States in 1999',
    targetGene: 'ADRA2A, ADRA2B, ADRA2C',
    targetProtein:
      'Alpha-2 adrenergic receptors, principally the alpha-2A subtype on noradrenergic neurons of the locus coeruleus; agonist occupancy reduces noradrenaline release and disinhibits the ventrolateral preoptic nucleus',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1999,
    indication:
      'Sedation of initially intubated and mechanically ventilated adult patients during treatment in an intensive care setting, by continuous infusion not exceeding 24 hours; and sedation of non-intubated adult patients before and during surgical and other procedures',
    patientFriendlyIndication:
      'Keeping someone calm and drowsy on a ventilator or during a procedure, without stopping them breathing',
    anatomicalSite:
      'Alpha-2A adrenoceptors on locus coeruleus neurons in the pons, and presynaptic alpha-2 receptors on sympathetic nerve terminals',
    conditionContext: {
      conditionExplainer:
        'The locus coeruleus is a small cluster of cells in the brainstem that keeps the rest of the brain awake by releasing noradrenaline. Turning it down releases a brake on the ventrolateral preoptic nucleus, the switch the brain itself uses to fall asleep. Dexmedetomidine turns the locus coeruleus down, so the sedation it produces is closer to non-rapid-eye-movement sleep than to a general anaesthetic, and patients can be roused and will follow instructions.',
      whyItMatters:
        'Every other sedative in the intensive care unit works on the GABA-A receptor and depresses breathing. This one does not, so a patient can be sedated without being ventilated. That is a genuine and unusual property. Whether it also reduces delirium, atrial fibrillation or death is a different set of claims, and three large randomised trials have now answered no to all three.',
      whoTakesThis:
        'Intubated adults in intensive care, patients having awake fibreoptic intubation or procedural sedation, and increasingly children and adults as an adjunct in the operating theatre.',
      clinicalGoals:
        'A rousable, cooperative, spontaneously breathing patient at a target sedation score. Everything beyond that — less delirium, shorter ventilation, better survival — has been tested and is covered below.',
    },
    oneSentenceVerdict:
      "A selective alpha-2A agonist that sedates by recruiting the brain's own non-REM sleep pathway rather than by depressing it, and which in 3,904 ventilated critically ill patients produced 90-day mortality of 29.1% against 29.1% on usual care, with more bradycardia and hypotension and with two thirds of patients needing propofol on top anyway.",
    laymanHowItWorks:
      "A small cluster of cells in the brainstem keeps you awake by spraying noradrenaline over the rest of the brain. Dexmedetomidine binds a receptor on those cells that tells them to stop releasing it. With that wakefulness signal turned down, the brain's own sleep switch is released and the patient drifts into something much closer to real sleep than to anaesthesia — they can be woken by voice, will follow a command, and go back to sleep afterwards. Because none of this touches the brainstem centres that drive breathing, they keep breathing on their own.",
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 62,
    substitutes: {
      summary:
        'The alternatives are propofol and the benzodiazepines, and the randomised evidence draws a clear line. Against midazolam, dexmedetomidine measurably reduces delirium and shortens time to extubation. Against propofol, in ventilated septic adults, it made no difference to delirium-free days, ventilator-free days, death at 90 days or cognition at six months. Against usual care, it did not change 90-day mortality in 4,000 patients. Nothing in a diet substitutes for a sedative and nothing is listed here.',
      conventionalRx: [
        {
          name: 'Propofol (Diprivan)',
          class: 'Intravenous GABA-A general anaesthetic used at sedative doses',
          howItCompares:
            'Tested head to head in MENDS2 in 422 ventilated adults with sepsis: days alive without delirium or coma 10.7 versus 10.8 (odds ratio 0.96, 95% CI 0.74 to 1.26), ventilator-free days 23.7 versus 24.0, death at 90 days 38% versus 39% (hazard ratio 1.06, 95% CI 0.74 to 1.52). Propofol is faster on and off and cheaper; it also depresses respiration, which dexmedetomidine does not.',
          typicalCost:
            'US$0.1709 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: rapid titration, no bradycardia, decades of use. Cons: apnoea and hypotension, and propofol infusion syndrome on long high-rate infusions.',
        },
        {
          name: 'Midazolam (Versed)',
          class: 'Benzodiazepine, positive modulator at the GABA-A benzodiazepine site',
          howItCompares:
            'The one comparison dexmedetomidine clearly wins. In SEDCOM, 366 ventilated patients at 68 centres reached the target sedation range equally often — 77.3% versus 75.1% of the time — but delirium prevalence was 54% versus 76.6% (difference 22.6 percentage points, 95% CI 14 to 33, P<0.001) and median time to extubation was 1.9 days shorter.',
          typicalCost:
            'US$0.4200 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed products, effective 12 March 2025)',
          prosAndCons:
            'Pros: reliable amnesia, a specific antagonist exists, inexpensive. Cons: accumulation with an active metabolite, prolonged emergence, and substantially more delirium in the head-to-head trial.',
        },
        {
          name: 'Clonidine',
          class: 'Older, less selective alpha-2 adrenergic agonist',
          howItCompares:
            'The same receptor family with lower selectivity for the alpha-2A subtype and a much longer half-life, which makes it harder to titrate. It is far cheaper and is used as an alpha-2 sedative where dexmedetomidine is unaffordable.',
          typicalCost:
            'No NADAC value is held on this record for clonidine and none is asserted here',
          prosAndCons:
            'Pros: same mechanism at a fraction of the price. Cons: long half-life, oral or transdermal routes ill-suited to minute-by-minute titration.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Expect to remember some of it',
          action:
            "This drug produces rousable sedation rather than anaesthesia, and its amnestic effect is far weaker than a benzodiazepine's. Patients sedated with it for a procedure often recall parts of it.",
          patientImpact:
            'Knowing beforehand that recall is expected rather than a failure of sedation changes how the experience is interpreted afterwards, and is worth asking about in advance if it matters to you.',
          clinicalPrecaution:
            'Whether amnesia is wanted is a clinical decision made with the team, and nothing on this page addresses which drug should be used.',
        },
        {
          name: 'Mention beta blockers, pacemakers and a slow resting pulse',
          action:
            'The commonest adverse effects of this drug are a slow heart rate and low blood pressure, and both were more frequent than usual care in the largest trial of it.',
          patientImpact:
            'A patient who already has a slow pulse, heart block or takes a rate-limiting drug is starting from a different place, and that is relevant information before sedation.',
          clinicalPrecaution:
            'History to hand over. Bradycardia and hypotension during an infusion are managed by the clinical team.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(=CC=C1)[C@H](C)C2=CN=CN2)C',
      chemicalFormula: 'C13H16N2',
      molecularWeight: '200.28 g/mol (free base); dispensed as dexmedetomidine hydrochloride',
      targetReceptorAffinity:
        'Dexmedetomidine is the pharmacologically active dextro-enantiomer of medetomidine and is selective for alpha-2 over alpha-1 adrenoceptors by a wide margin — the approved label states that alpha-2 selectivity is observed in animals during slow intravenous infusion of low and medium doses, and that both alpha-1 and alpha-2 activity appear at high doses or with rapid administration. That dose-dependence is not a footnote: the transient hypertension seen with a rapid loading infusion is peripheral alpha-2B vasoconstriction, and the loss of selectivity at high concentration is why the label distinguishes slow from rapid administration in its pharmacology section.',
      structureSource: {
        label:
          'PubChem CID 5311068 (dexmedetomidine) — canonical SMILES with the S configuration, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311068',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dex-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric excess against levomedetomidine',
          description:
            'Medetomidine is a racemate and only one enantiomer is active; the other contributes nothing useful and is the reason the veterinary product and the human product are different drugs. Establish enantiomeric excess as a release specification, not as a characterisation exercise.',
          reagentsAndBuffer:
            'Dexmedetomidine and levomedetomidine reference standards, chiral HPLC on a polysaccharide-derived stationary phase, optical rotation, nuclear magnetic resonance for imidazole substitution pattern',
        },
        {
          id: 'dex-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Coupling of the 2,3-dimethylphenyl unit to the imidazole',
          description:
            'Build the 1-(2,3-dimethylphenyl)ethyl imidazole skeleton. The imidazole ring is the alpha-2 pharmacophore shared with clonidine and the whole imidazoline class; the ortho-methylated aryl group and the single chiral methyl are what make this member selective and short-acting rather than long and non-selective.',
          dependsOnStepId: 'dex-w1',
          reagentsAndBuffer:
            '2,3-dimethylacetophenone or an equivalent aryl unit, imidazole coupling partner, base, aprotic solvent, controlled temperature under nitrogen',
        },
        {
          id: 'dex-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chiral resolution and hydrochloride salt formation',
          description:
            "Resolve the racemate to the dextro-enantiomer and form the hydrochloride. Resolution rather than asymmetric synthesis is the historically used route, which means half of the material is discarded as the inactive enantiomer and the release test is the resolution's only guarantee.",
          dependsOnStepId: 'dex-w2',
          reagentsAndBuffer:
            'Chiral resolving acid for diastereomeric salt formation, recrystallisation solvent system, hydrogen chloride in isopropanol, chiral HPLC for enantiomeric purity at release',
        },
        {
          id: 'dex-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'c-Fos mapping in sleep-promoting nuclei, with the knockout as the control',
          description:
            'Map neuronal activation across the locus coeruleus, tuberomammillary nucleus and ventrolateral preoptic nucleus after drug, and repeat it in animals lacking a functional alpha-2A receptor. Running the knockout alongside is what turns a pattern of activation into a causal claim about which receptor produces the sedation.',
          dependsOnStepId: 'dex-w3',
          reagentsAndBuffer:
            'Rat brain sections for c-Fos immunohistochemistry and in situ hybridisation, alpha-2A-deficient mice, atipamezole as alpha-2 antagonist, ibotenic acid for discrete nucleus lesions, gabazine for local GABA-A antagonism',
        },
        {
          id: 'dex-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sedation depth and arousability, scored as two separate things',
          description:
            'Score the depth of sedation and the ability to be roused independently. The clinical selling point of this drug is that the two come apart — a deeply sedated patient who wakes to voice — and a single sedation number that collapses them hides exactly the property being claimed.',
          dependsOnStepId: 'dex-w4',
          reagentsAndBuffer:
            'Richmond Agitation-Sedation Scale scored at fixed intervals, Confusion Assessment Method for the Intensive Care Unit for delirium, processed electroencephalography, blinded assessors independent of the treating team',
        },
        {
          id: 'dex-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Report supplemental sedative use beside the sedation score',
          description:
            'Record how much propofol or midazolam had to be added to reach the target, and publish it next to the sedation result. SPICE III makes the case for this step: 64% of the dexmedetomidine group received supplemental propofol in the first two days, which means the trial compared dexmedetomidine-plus-propofol with usual care rather than one drug against another.',
          dependsOnStepId: 'dex-w5',
          reagentsAndBuffer:
            'Prospective capture of all supplemental sedative and analgesic doses, per-day totals by group, bradycardia and hypotension recorded as prespecified adverse events with treatment thresholds defined in advance',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dex-a1',
        category: 'measured',
        title: "It recruits the brain's own sleep pathway, and the knockout mouse proves it",
        laymanSummary:
          'Researchers showed the drug switches on the same brain cells that switch on during natural deep sleep, and switches off the ones that keep you awake. Mice engineered without the receptor did not become sedated at all.',
        technicalDetails:
          'Nelson and colleagues mapped c-Fos expression across sleep-regulating nuclei after dexmedetomidine and found a pattern qualitatively similar to normal non-rapid-eye-movement sleep: decreased in the locus coeruleus and tuberomammillary nucleus, increased in the ventrolateral preoptic nucleus. The pattern was attenuated by the alpha-2 antagonist atipamezole and was absent in mice lacking functional alpha-2A adrenoceptors, which show no sedative response to the drug. Bilateral lesions of the ventrolateral preoptic nucleus attenuated sedation, and the dose-response curve shifted right when the GABA-A antagonist gabazine was given systemically or directly into the tuberomammillary nucleus. Lesions and gabazine altered c-Fos in the tuberomammillary nucleus but not the locus coeruleus, establishing a hierarchical sequence: alpha-2A agonism silences the locus coeruleus, which disinhibits the ventrolateral preoptic nucleus, which then GABAergically inhibits the tuberomammillary nucleus. This is why the sedation is rousable, and it is a properly controlled mechanistic result rather than a mechanistic story.',
        evidenceSource:
          'Nelson LE, Lu J, Guo T, Saper CB, Franks NP, Maze M. The alpha2-adrenoceptor agonist dexmedetomidine converges on an endogenous sleep-promoting pathway to exert its sedative effects. Anesthesiology 2003;98:428-436',
        doi: '10.1097/00000542-200302000-00024',
        measuredMetric:
          'c-Fos expression across locus coeruleus, tuberomammillary nucleus and ventrolateral preoptic nucleus, with alpha-2A knockout, antagonist, lesion and local GABA-A antagonist controls',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a2',
        category: 'failed',
        title:
          'SPICE III: identical 90-day mortality, more harm, and most patients needed propofol anyway',
        laymanSummary:
          'Four thousand critically ill patients were randomised to have this drug as their main sedative or to usual care. After ninety days, 29.1% of each group had died. Two thirds of the dexmedetomidine group had needed propofol added on top to keep them comfortable.',
        technicalDetails:
          'Shehabi and colleagues enrolled critically ill adults ventilated for less than 12 hours and expected to need ventilation beyond the next calendar day, randomising them open-label to dexmedetomidine as sole or primary sedative or to usual care with propofol, midazolam or other agents, targeting a Richmond Agitation-Sedation Scale score of -2 to +1. Four thousand patients were enrolled at a median 4.6 hours from eligibility. In the modified intention-to-treat analysis of 3,904 patients, death from any cause at 90 days occurred in 566 of 1,948 (29.1%) on dexmedetomidine and 569 of 1,956 (29.1%) on usual care — adjusted risk difference 0.0 percentage points, 95% CI -2.9 to 2.8. The ancillary finding matters as much as the primary: to reach the prescribed sedation level, 64% of the dexmedetomidine group received supplemental propofol in the first two days, 3% midazolam and 7% both. Bradycardia and hypotension were more common on dexmedetomidine, and more adverse events overall were reported in that group. A trial in which two thirds of the intervention arm receives the comparator drug is not a clean comparison of two sedatives, and the authors report it plainly.',
        evidenceSource:
          'Shehabi Y, Howe BD, Bellomo R, et al. Early sedation with dexmedetomidine in critically ill patients. N Engl J Med 2019;380:2506-2517 (SPICE III)',
        doi: '10.1056/NEJMoa1904710',
        measuredMetric:
          'Death from any cause at 90 days, and supplemental sedative use in the first two days',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a3',
        category: 'failed',
        title: 'MENDS2: no better than propofol on delirium, ventilation, death or cognition',
        laymanSummary:
          'Against propofol, in ventilated patients with sepsis, this drug produced the same number of days free of delirium or coma, the same ventilator-free days, the same death rate at three months and the same cognitive scores at six.',
        technicalDetails:
          'Hughes and colleagues ran a multicentre double-blind trial in mechanically ventilated adults with sepsis, randomising to dexmedetomidine or propofol with doses adjusted by bedside nurses to clinician-set Richmond Agitation-Sedation Scale targets. Of 432 randomised, 422 received a trial drug and were analysed: 214 on dexmedetomidine at a median 0.27 micrograms per kilogram per hour, 208 on propofol at a median 10.21 micrograms per kilogram per minute, for a median 3 days, at a median score of -2. The primary endpoint, days alive without delirium or coma over the 14-day intervention period, was 10.7 against 10.8 (odds ratio 0.96, 95% CI 0.74 to 1.26). Ventilator-free days at 28 days were 23.7 against 24.0 (odds ratio 0.98, 95% CI 0.63 to 1.51). Death at 90 days was 38% against 39% (hazard ratio 1.06, 95% CI 0.74 to 1.52). Age-adjusted cognition on the Telephone Interview for Cognitive Status at six months did not differ either. The trial was designed around a hypothesis that the two drugs differ in arousability, immunity and inflammation. On every outcome it measured, they did not.',
        evidenceSource:
          'Hughes CG, Mailloux PT, Devlin JW, et al. Dexmedetomidine or propofol for sedation in mechanically ventilated adults with sepsis. N Engl J Med 2021;384:1424-1436 (MENDS2)',
        doi: '10.1056/NEJMoa2024922',
        measuredMetric:
          'Days alive without delirium or coma over 14 days, with ventilator-free days, 90-day death and 6-month cognition as secondary endpoints',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a4',
        category: 'failed',
        title: 'DECADE: no reduction in atrial fibrillation, and delirium went the wrong way',
        laymanSummary:
          'A placebo-controlled trial after cardiac surgery tested whether this drug prevents the two commonest complications. Atrial fibrillation was not reduced, delirium was numerically higher on the drug, and serious adverse events were more than twice as common.',
        technicalDetails:
          "Turan and colleagues randomised 798 patients having cardiac surgery with cardiopulmonary bypass at six academic hospitals in the United States, 1:1, masked to patients, caregivers and evaluators, to a dexmedetomidine infusion started before incision and continued for 24 hours or to saline placebo. The trial was stopped per protocol after the last designated interim analysis; 794 were analysed. Atrial fibrillation occurred in 121 of 397 (30%) on dexmedetomidine and 134 of 395 (34%) on placebo — relative risk 0.90, 97.8% CI 0.72 to 1.15, P=0.34. Delirium was non-significantly increased, from 12% on placebo to 17% on dexmedetomidine, relative risk 1.48, 97.8% CI 0.99 to 2.23. Serious adverse events as determined by clinicians occurred in 21 of 394 (5%) on dexmedetomidine against 8 of 396 (2%) on placebo. The authors' conclusion is unusually direct: dexmedetomidine should not be infused to reduce atrial fibrillation or delirium in patients having cardiac surgery. The trial was funded by Hospira, which markets the drug.",
        evidenceSource:
          'Turan A, Duncan A, Leung S, et al. Dexmedetomidine for reduction of atrial fibrillation and delirium after cardiac surgery (DECADE): a randomised placebo-controlled trial. Lancet 2020;396:177-185 (NCT02004613)',
        doi: '10.1016/S0140-6736(20)30631-0',
        measuredMetric:
          'Co-primary incidence of new-onset atrial fibrillation and of delirium between intensive care admission and postoperative day 5 or discharge',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a5',
        category: 'measured',
        title: 'The one comparison it clearly wins is against a benzodiazepine',
        laymanSummary:
          'Against midazolam, the drug reached the same sedation targets but delirium fell from 77% to 54% and patients came off the ventilator nearly two days sooner.',
        technicalDetails:
          'SEDCOM was a prospective double-blind randomised trial at 68 centres in five countries among 375 medical and surgical intensive care patients expected to need more than 24 hours of ventilation, comparing dexmedetomidine (n=244) with midazolam (n=122) titrated to light sedation until extubation or 30 days. The primary endpoint, percentage of time within the target Richmond Agitation-Sedation Scale range, did not differ: 77.3% versus 75.1%, difference 2.2 percentage points, 95% CI -3.2 to 7.5, P=0.18. Delirium prevalence during treatment was 54% (132 of 244) against 76.6% (93 of 122) — a difference of 22.6 percentage points, 95% CI 14 to 33, P<0.001. Median time to extubation was 1.9 days shorter, 3.7 against 5.6 days, P=0.01, while intensive care length of stay was similar, 5.9 against 7.6 days, P=0.24. This audit is filed as measured and is the strongest positive result on the page. It is also worth reading against MENDS2: the delirium advantage exists against midazolam and disappears against propofol, which suggests the finding is as much about benzodiazepines being bad as about alpha-2 agonism being good.',
        evidenceSource:
          'Riker RR, Shehabi Y, Bokesch PM, et al. Dexmedetomidine vs midazolam for sedation of critically ill patients: a randomized trial. JAMA 2009;301:489-499 (SEDCOM)',
        doi: '10.1001/jama.2009.56',
        measuredMetric:
          'Percentage of time within target sedation range, prevalence of delirium during treatment, and time to extubation',
        auditFlag: 'verified',
      },
      {
        id: 'dex-a6',
        category: 'inferred',
        title: 'The delirium reputation was built on a comparator, not on an effect',
        laymanSummary:
          'This drug is widely described as delirium-sparing. It beat midazolam on delirium by 23 percentage points, tied with propofol, and in a placebo-controlled trial after cardiac surgery delirium was numerically higher on the drug than on saline.',
        technicalDetails:
          'Read the three trials together and the picture is consistent rather than contradictory. Against midazolam, delirium was 54% versus 76.6%. Against propofol, days alive without delirium or coma were 10.7 versus 10.8. Against placebo in cardiac surgery, delirium was 17% versus 12%, relative risk 1.48 with a 97.8% confidence interval of 0.99 to 2.23. A drug that beats a benzodiazepine, ties with propofol and does not beat saline is not exerting an anti-delirium effect; it is avoiding a pro-delirium one. That is still clinically useful — benzodiazepines really are associated with delirium, and replacing them really does help — but it is a different claim from the one usually made, and the difference matters when the alternative on offer is propofol rather than midazolam. This entry is filed as an inference because the sentence "dexmedetomidine reduces delirium" is true only with the comparator supplied, and the comparator is almost never supplied.',
        evidenceSource:
          'Riker RR et al. JAMA 2009;301:489-499; Hughes CG et al. N Engl J Med 2021;384:1424-1436; Turan A et al. Lancet 2020;396:177-185',
        inferredClaim:
          'That dexmedetomidine has an intrinsic delirium-reducing effect, rather than a delirium advantage that exists only relative to benzodiazepines',
        auditFlag: 'contested',
      },
      {
        id: 'dex-a7',
        category: 'measured',
        title: 'Bradycardia and hypotension are the price, and they were measured in every trial',
        laymanSummary:
          "A slow heart rate and low blood pressure are not rare side effects here; they are the predictable consequence of turning down the body's own noradrenaline signalling, and every large trial recorded more of both.",
        technicalDetails:
          'SPICE III reported that bradycardia and hypotension were more common in the dexmedetomidine group and that more adverse events overall were reported in that group. DECADE recorded clinically important bradycardia requiring treatment and hypotension among its prespecified safety outcomes, with serious adverse events in 5% on dexmedetomidine against 2% on placebo. The mechanism is direct and unavoidable: alpha-2 agonism at presynaptic sympathetic terminals reduces noradrenaline release, lowering heart rate and vascular tone, and that is the same receptor action producing the sedation. There is no separation to engineer. The label also records the biphasic pattern — a transient rise in blood pressure with rapid administration, from peripheral alpha-2B vasoconstriction before central sympatholysis dominates — which is why it distinguishes slow from rapid infusion in describing alpha-2 selectivity.',
        evidenceSource:
          'Shehabi Y et al. N Engl J Med 2019;380:2506-2517; Turan A et al. Lancet 2020;396:177-185; FDA-approved US prescribing information for dexmedetomidine hydrochloride injection, Clinical Pharmacology',
        measuredMetric:
          'Incidence of bradycardia, hypotension and serious adverse events against comparator and against placebo in randomised trials',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Infused slowly, because speed changes which receptor it hits',
        laymanDesc:
          'Given slowly it acts on one kind of adrenaline receptor. Given fast it hits others too, and can briefly push blood pressure up instead of down.',
        molecularDetail:
          'The label states that alpha-2 selectivity is seen with slow intravenous infusion of low and medium doses, while both alpha-1 and alpha-2 activity appear at high doses or with rapid administration. The transient hypertension of a rapid load is peripheral alpha-2B-mediated vasoconstriction preceding central sympatholysis, which is a dose-rate phenomenon rather than a paradox.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It silences the brainstem cells that keep you awake',
        laymanDesc:
          'A small cluster of cells in the pons sprays noradrenaline over the brain to maintain wakefulness. This drug binds a receptor on those cells that tells them to stop.',
        molecularDetail:
          'Alpha-2A adrenoceptors on locus coeruleus neurons are inhibitory autoreceptors coupled to Gi. Agonist occupancy hyperpolarises the neuron and reduces noradrenaline release. In mice lacking a functional alpha-2A receptor, dexmedetomidine produces no sedative response at all.',
        iconName: 'VolumeX',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: "The brain's own sleep switch is released",
        laymanDesc:
          "The wakefulness cells were holding down the brain's sleep switch. With them quiet, the switch flips, and the same cells that fire during natural deep sleep light up.",
        molecularDetail:
          'Reduced noradrenergic tone disinhibits the ventrolateral preoptic nucleus, whose c-Fos expression rises, matching the pattern of normal non-rapid-eye-movement sleep. Lesioning that nucleus bilaterally attenuates the sedative response, establishing it as a required node rather than a correlate.',
        iconName: 'MoonStar',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'That switch shuts down the histamine centre through GABA',
        laymanDesc:
          "The sleep switch works by releasing an inhibitory signal onto the brain's histamine centre, which is the last relay that keeps the cortex alert.",
        molecularDetail:
          'The ventrolateral preoptic nucleus inhibits the tuberomammillary nucleus GABAergically. Gabazine given systemically or directly into the tuberomammillary nucleus shifts the dexmedetomidine dose-response curve to the right, and lesions and gabazine alter c-Fos in the tuberomammillary nucleus but not the locus coeruleus — which fixes the order of events rather than leaving it inferred.',
        iconName: 'Network',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Sedation you can wake someone out of, and breathing that continues',
        laymanDesc:
          'The patient is deeply drowsy but will open their eyes to a voice, follow an instruction, and drift off again. And they keep breathing on their own, because nothing has touched the respiratory centres.',
        molecularDetail:
          'Because the sedation is produced by recruiting an endogenous sleep pathway rather than by generalised cortical depression, arousability is preserved. Respiratory drive is essentially unaffected at sedative concentrations, which is the property that distinguishes this drug from every GABA-A sedative and the reason it can be used in non-intubated patients. Amnesia is correspondingly weaker than with a benzodiazepine.',
        iconName: 'Ear',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The heart slows and the pressure falls, for exactly the same reason',
        laymanDesc:
          'The receptor that quietens the brain also quietens the nerves driving the heart and blood vessels. The bradycardia and low blood pressure are not a side effect of a different action; they are the same action elsewhere.',
        molecularDetail:
          'Presynaptic alpha-2 agonism at sympathetic terminals and central sympatholysis reduce heart rate and vascular tone. There is no receptor-level separation to exploit between the wanted and unwanted effects, which is why bradycardia and hypotension were more frequent than usual care in SPICE III and why serious adverse events were 5% against 2% versus placebo in DECADE. Elimination is hepatic, by glucuronidation and CYP-mediated oxidation, and clearance falls in hepatic impairment.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SPICE III — early sedation with dexmedetomidine in critically ill patients',
        phase: 'Open-label multicentre randomised controlled trial',
        sampleSize: 4000,
        primaryEndpoint: 'Death from any cause at 90 days',
        endpointMet: false,
        statisticalPValue:
          '29.1% (566/1,948) with dexmedetomidine versus 29.1% (569/1,956) with usual care; adjusted risk difference 0.0 percentage points, 95% CI -2.9 to 2.8',
        unreportedAdverseSignals:
          'Reported and decisive: 64% of the dexmedetomidine group needed supplemental propofol in the first two days, 3% midazolam and 7% both, so the intervention arm was largely dexmedetomidine plus the comparator. Bradycardia, hypotension and overall adverse events were more common on dexmedetomidine.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'MENDS2 — dexmedetomidine or propofol for sedation in ventilated adults with sepsis',
        phase: 'Multicentre double-blind randomised controlled trial',
        sampleSize: 432,
        primaryEndpoint:
          'Days alive without delirium or coma during the 14-day intervention period',
        endpointMet: false,
        statisticalPValue:
          'Adjusted median 10.7 versus 10.8 days; odds ratio 0.96, 95% CI 0.74 to 1.26. Ventilator-free days 23.7 versus 24.0; death at 90 days 38% versus 39%, hazard ratio 1.06 (95% CI 0.74 to 1.52)',
        unreportedAdverseSignals:
          'Median exposure was only 3 days at a median sedation score of -2, so the trial tests light sedation over a short period rather than prolonged deep sedation. Six-month cognition also did not differ.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'DECADE — dexmedetomidine for reduction of atrial fibrillation and delirium after cardiac surgery (NCT02004613)',
        phase: 'Randomised, placebo-controlled, fully masked trial at six academic hospitals',
        sampleSize: 798,
        primaryEndpoint:
          'Co-primary: new-onset atrial fibrillation, and delirium, between intensive care admission and postoperative day 5 or discharge',
        endpointMet: false,
        statisticalPValue:
          'Atrial fibrillation 30% versus 34%, relative risk 0.90 (97.8% CI 0.72 to 1.15, P=0.34); delirium 17% versus 12%, relative risk 1.48 (97.8% CI 0.99 to 2.23)',
        unreportedAdverseSignals:
          'Serious adverse events in 21 of 394 (5%) on dexmedetomidine against 8 of 396 (2%) on placebo. The trial was funded by Hospira, which markets the drug, and stopped per protocol at the last designated interim analysis.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'SEDCOM — dexmedetomidine versus midazolam for sedation of critically ill patients',
        phase: 'Prospective double-blind randomised trial at 68 centres in 5 countries',
        sampleSize: 375,
        primaryEndpoint:
          'Percentage of time within the target Richmond Agitation-Sedation Scale range',
        endpointMet: false,
        statisticalPValue:
          'Primary endpoint not different: 77.3% versus 75.1%, difference 2.2 percentage points (95% CI -3.2 to 7.5), P=0.18. Secondary: delirium 54% versus 76.6%, difference 22.6 points (95% CI 14 to 33), P<0.001; time to extubation 1.9 days shorter, P=0.01',
        unreportedAdverseSignals:
          'The result the drug is known for is a secondary endpoint of a trial whose primary endpoint was neutral. Intensive care length of stay did not differ significantly.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Sedation requires the alpha-2A receptor: mice lacking a functional one show no sedative response, and the c-Fos pattern matches natural non-REM sleep',
        '90-day mortality of 29.1% against 29.1% in 3,904 ventilated critically ill patients, with 64% of the dexmedetomidine arm needing supplemental propofol',
        "Days alive without delirium or coma of 10.7 against propofol's 10.8 in ventilated adults with sepsis, with no difference in death or six-month cognition",
        'Atrial fibrillation 30% against 34% on placebo after cardiac surgery, and delirium 17% against 12%, with serious adverse events 5% against 2%',
        "Delirium prevalence 54% against midazolam's 76.6%, and extubation 1.9 days sooner, in 366 ventilated patients",
      ],
      unsupportedInferences: [
        'That dexmedetomidine reduces delirium as a property of the drug — it beats midazolam, ties propofol and did not beat placebo',
        'That preserved arousability and respiratory drive, which are real and measured, translate into any survival or organ-failure benefit',
        'That an alpha-2 agonist protects the heart after cardiac surgery; the placebo-controlled trial found no reduction in atrial fibrillation and its authors advised against using it for that',
        'That SPICE III compared dexmedetomidine with other sedatives, when two thirds of the dexmedetomidine arm received propofol as well',
        'That bradycardia and hypotension are avoidable side effects rather than the same receptor action expressed outside the brain',
      ],
      whatFailedInitially: [
        'SPICE III: no mortality difference at 90 days in 4,000 patients, with more adverse events on the drug',
        'MENDS2: no advantage over propofol on delirium-free days, ventilator-free days, 90-day death or six-month cognition',
        "DECADE: no reduction in atrial fibrillation, delirium numerically worse, serious adverse events more than doubled, and an explicit authors' recommendation against the indication",
        'Even SEDCOM missed its own primary endpoint; the delirium result everyone quotes was secondary',
      ],
      realWorldOutcome: [
        'The only sedative in routine intensive care use that does not depress respiration, which makes possible techniques — awake fibreoptic intubation, sedation without a ventilator — that no GABA-A drug supports',
        'No CMS National Average Drug Acquisition Cost value is held on this record for dexmedetomidine, so no United States acquisition price is stated here',
        'Displaced benzodiazepines from first-line intensive care sedation, which is a real change in practice supported by the one head-to-head trial it won',
        'Three large randomised trials have now failed to show benefit on mortality, delirium against propofol, or atrial fibrillation, and the drug remains in widespread use for properties none of those trials measured',
      ],
    },
    deliverySystem: {
      type: 'Sterile solution for continuous intravenous infusion, as a concentrate for dilution and as premixed ready-to-use bags in sodium chloride; a sublingual film formulation is separately approved for agitation',
      description:
        'Premixed bags exist because the drug is given as a continuous infusion titrated over hours and dilution errors at the bedside are an avoidable hazard. The rate of administration is pharmacologically meaningful rather than merely practical: the label distinguishes slow from rapid intravenous administration when describing receptor selectivity, and rapid administration produces a transient pressor response from peripheral vasoconstriction. The approved intensive care indication specifies infusion not exceeding 24 hours, which is a labelling limit rather than a statement about what happens on day two.',
      safetyProfile:
        'Bradycardia and hypotension are the dominant adverse effects and are mechanistically inseparable from the sedative action; both were more common than usual care in SPICE III, and serious adverse events were 5% against 2% versus placebo in DECADE. Transient hypertension can occur with rapid administration. The drug does not meaningfully depress respiration, which is its distinguishing property and also means it does not guarantee airway protection. Amnesia is weak compared with a benzodiazepine and recall is common. Clearance falls in hepatic impairment. Withdrawal-type agitation and rebound hypertension have been described after abrupt cessation of prolonged infusion. No dosing guidance appears on this page.',
    },
    commonQuestions: [
      {
        q: 'Is this really more like sleep than like anaesthesia?',
        a: 'Yes, and it is one of the few claims in sedation that has been demonstrated rather than asserted. Nelson and colleagues mapped which brain nuclei switch on and off after the drug and found a pattern qualitatively matching natural non-rapid-eye-movement sleep: the locus coeruleus and tuberomammillary nucleus quiet, the ventrolateral preoptic nucleus active. Then they took the mechanism apart. An alpha-2 antagonist abolished the pattern. Mice engineered without a functional alpha-2A receptor showed no sedation at all. Lesioning the ventrolateral preoptic nucleus attenuated the effect. Blocking GABA-A directly in the tuberomammillary nucleus shifted the dose-response curve. That combination establishes not just that the pathway is involved but the order in which it operates, and it explains why a deeply sedated patient will still open their eyes when you speak to them.',
      },
      {
        q: 'Does it reduce delirium?',
        a: 'Compared with a benzodiazepine, clearly. Compared with propofol, no. Compared with nothing, apparently not. In SEDCOM, against midazolam, delirium was 54% versus 76.6%, a 22.6 percentage point difference. In MENDS2, against propofol in septic ventilated adults, days alive without delirium or coma were 10.7 versus 10.8. In DECADE, against saline placebo after cardiac surgery, delirium was 17% on the drug against 12% on placebo, a relative risk of 1.48 whose confidence interval just touched 1. Put those together and the most defensible reading is that dexmedetomidine avoids the delirium that benzodiazepines cause rather than preventing delirium in its own right. That is still worth having when the alternative is midazolam. It is not what the phrase "reduces delirium" usually conveys.',
        auditNote:
          'This is the clearest comparator-dependent claim in the file: the same sentence is true or false depending on which drug is in the other arm, and the other arm is almost never named.',
      },
      {
        q: 'The big mortality trial was negative. Does that mean the drug does not work?',
        a: 'It means it did not change 90-day death, which is what it measured. SPICE III enrolled 4,000 critically ill ventilated adults and found mortality of 29.1% in both arms, with an adjusted risk difference of exactly zero and a confidence interval from -2.9 to 2.8 percentage points. But the trial contains a finding that complicates any reading of it: 64% of the patients assigned to dexmedetomidine needed supplemental propofol within the first two days to reach the prescribed sedation level, with a further 7% needing both propofol and midazolam. So the comparison was largely dexmedetomidine plus propofol against usual care. What the trial does establish firmly is that making dexmedetomidine the primary early sedative does not improve survival, and that it comes with more bradycardia, more hypotension and more adverse events overall.',
      },
      {
        q: 'Why does it slow the heart so much?',
        a: 'Because that is the same receptor doing the same thing in a different place. Alpha-2 receptors sit on the noradrenaline-releasing neurons of the brainstem, where switching them off produces sedation, and they also sit on sympathetic nerve terminals throughout the body, where switching them off reduces heart rate and vascular tone. There is no version of this drug that sedates without slowing the heart, because sedation is the reduction in noradrenergic tone. SPICE III found bradycardia and hypotension more common than usual care; DECADE found serious adverse events in 5% of the dexmedetomidine group against 2% on placebo. A rapid loading infusion can do the opposite briefly, pushing blood pressure up through peripheral vasoconstriction before central sympatholysis takes over, which is why the label distinguishes slow from rapid administration.',
      },
      {
        q: 'Will I remember the procedure?',
        a: 'Quite possibly, and that is expected rather than a failure. Benzodiazepines produce strong anterograde amnesia; dexmedetomidine does not. It produces rousable sedation by recruiting the sleep pathway, and patients sedated with it commonly recall parts of a procedure, sometimes without finding it distressing. Whether that matters depends entirely on the procedure and the person, and it is a reasonable thing to raise before a planned sedation. It is also the flip side of the property that makes the drug useful: a patient who can follow an instruction during an awake intubation is a patient who can form a memory of it.',
      },
      {
        q: 'Why is there no price on this page?',
        a: 'Because the CMS National Average Drug Acquisition Cost survey holds no value for dexmedetomidine on this record. That survey measures what United States retail pharmacies pay to acquire a drug, and an intensive care infusion supplied in premixed bags to hospitals does not necessarily pass through retail pharmacy. Rather than substitute a list price or an estimate, this page shows nothing, and no verified per-dose cost-of-production figure exists for it either. What can be said is that the historical manufacturing route resolves a racemate and discards the inactive enantiomer, which is a real cost driver and not a number.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Nelson LE, Lu J, Guo T, Saper CB, Franks NP, Maze M. The alpha2-adrenoceptor agonist dexmedetomidine converges on an endogenous sleep-promoting pathway to exert its sedative effects. Anesthesiology 2003;98:428-436',
        identifier: '10.1097/00000542-200302000-00024',
        kind: 'doi',
      },
      {
        label:
          'Shehabi Y, Howe BD, Bellomo R, et al. Early sedation with dexmedetomidine in critically ill patients (SPICE III). N Engl J Med 2019;380:2506-2517',
        identifier: '10.1056/NEJMoa1904710',
        kind: 'doi',
      },
      {
        label:
          'Hughes CG, Mailloux PT, Devlin JW, et al. Dexmedetomidine or propofol for sedation in mechanically ventilated adults with sepsis (MENDS2). N Engl J Med 2021;384:1424-1436',
        identifier: '10.1056/NEJMoa2024922',
        kind: 'doi',
      },
      {
        label:
          'Turan A, Duncan A, Leung S, et al. Dexmedetomidine for reduction of atrial fibrillation and delirium after cardiac surgery (DECADE): a randomised placebo-controlled trial. Lancet 2020;396:177-185',
        identifier: '10.1016/S0140-6736(20)30631-0',
        kind: 'doi',
      },
      {
        label:
          'NCT02004613 — DECADE, dexmedetomidine for reduction of atrial fibrillation and delirium after cardiac surgery',
        identifier: 'NCT02004613',
        kind: 'nct',
      },
      {
        label:
          'Riker RR, Shehabi Y, Bokesch PM, et al. Dexmedetomidine vs midazolam for sedation of critically ill patients: a randomized trial (SEDCOM). JAMA 2009;301:489-499',
        identifier: '10.1001/jama.2009.56',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 5311068 — dexmedetomidine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5311068',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Midazolam — the drug whose main effect is that you cannot remember what it did, which is
  //     also the reason its harms took decades to surface.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'midazolam',
    name: 'Midazolam',
    tradeName: 'Versed; also marketed as midazolam hydrochloride injection and in sodium chloride',
    sponsor:
      'Hoffmann-La Roche (originator, US label holder at approval); synthesised by Armin Walser and Rodney Fryer at Roche in 1976 and approved in the United States in 1985. Long off patent.',
    targetGene: 'GABRA1, GABRA2, GABRA3, GABRA5, GABRG2',
    targetProtein:
      'Type A gamma-aminobutyric acid receptor, at the benzodiazepine modulatory site formed at the interface between an alpha and the gamma2 subunit; the alpha1 subtype carries the sedative and amnesic actions, established by the alpha1(H101R) knock-in mouse',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1985,
    indication:
      'Intramuscular or intravenous preoperative sedation, anxiolysis and amnesia; intravenous sedation, anxiolysis and amnesia before or during diagnostic, therapeutic or endoscopic procedures, alone or with other central nervous system depressants; and intravenous induction of general anaesthesia before other anaesthetic agents',
    patientFriendlyIndication:
      'Making a person calm and drowsy for a procedure, and making sure they do not remember it',
    anatomicalSite:
      'Interface between the alpha and gamma2 subunits of the GABA-A receptor, on cortical, hippocampal and limbic neurons',
    conditionContext: {
      conditionExplainer:
        "Benzodiazepines do not open the brain's inhibitory chloride channel themselves. They sit at a pocket on the outside of the receptor and make the channel respond more strongly to the GABA that is already there. That is why they have a ceiling on their own and why they are so much more dangerous when combined with an opioid, which depresses breathing through a different route entirely.",
      whyItMatters:
        "Midazolam made conscious sedation possible: awake enough to cooperate with an endoscopy, and with no memory of it afterwards. That amnesia is the product, and it is also the reason this drug's harms were slow to be recognised — the person who experienced them could not report them.",
      whoTakesThis:
        'Anyone having an endoscopy, a cardiac catheterisation, an awake procedure under sedation, an emergency intubation, or treatment for a prolonged seizure; and, historically, most ventilated patients in intensive care.',
      clinicalGoals:
        'Calm, cooperative, amnesic, breathing. Whether the drug improves any outcome beyond that is asked separately below, and the answer is that it does in status epilepticus and does not in intensive care sedation, where it is now the comparator other drugs beat.',
    },
    oneSentenceVerdict:
      'A water-soluble benzodiazepine that potentiates the GABA-A receptor at the alpha-gamma interface — proved to sedate through the alpha1 subtype by a single histidine-to-arginine substitution that abolishes the effect in mice — and whose clearest patient benefit is a stopped seizure: 73.4% of 448 people in status epilepticus were seizure-free on arrival at hospital after an intramuscular injection, against 63.4% of 445 given intravenous lorazepam.',
    laymanHowItWorks:
      'The brain has a receptor that lets chloride into neurons and makes them harder to fire; GABA is the chemical that opens it. Midazolam does not open it. It binds a pocket on the side of the receptor and makes each GABA molecule work harder, so wherever the brain is already applying its own brake, the brake bites more. Because the hippocampus is where new memories are laid down, and it is dense with the receptor subtype midazolam works best on, the person stays awake and conversational and forms almost no memory of what happened.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4200 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed generic products, survey effective 12 March 2025)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent since the 1990s and made by many manufacturers, with 23 listed United States generic products. It is on the WHO Model List of Essential Medicines, and the buccal and intranasal formulations developed for out-of-hospital seizure treatment are later, separately protected products built on a molecule that costs almost nothing.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For procedural sedation, the alternative is propofol, which is faster in both directions and has no antagonist. For intensive care sedation, both propofol and dexmedetomidine beat midazolam on delirium, and the head-to-head against dexmedetomidine is the most unfavourable trial result on this page. For prolonged seizures midazolam is the drug that won its trial. Nothing in a diet substitutes for a sedative and nothing is listed here.',
      conventionalRx: [
        {
          name: 'Propofol (Diprivan)',
          class: 'Intravenous GABA-A general anaesthetic',
          howItCompares:
            'Acts on the same receptor but at a different site, on the beta subunit rather than the alpha-gamma interface. Faster on, much faster off, no active metabolite, and clear-headed recovery. Against that, no specific antagonist exists, and it causes apnoea more readily.',
          typicalCost:
            'US$0.1709 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: predictable offset with no accumulation, and less delirium in intensive care. Cons: no reversal agent, and profound respiratory and cardiovascular depression at induction doses.',
        },
        {
          name: 'Dexmedetomidine (Precedex)',
          class: 'Selective alpha-2 adrenergic agonist',
          howItCompares:
            'In SEDCOM, 366 ventilated patients reached the target sedation range equally often on either drug — 77.3% versus 75.1% of the time — but delirium prevalence was 54% on dexmedetomidine against 76.6% on midazolam, a difference of 22.6 percentage points (95% CI 14 to 33, P<0.001), and extubation came 1.9 days sooner.',
          typicalCost:
            'No NADAC value is held on this record for dexmedetomidine and none is asserted here',
          prosAndCons:
            'Pros: substantially less delirium, no respiratory depression. Cons: bradycardia and hypotension, weak amnesia, and no advantage over propofol in the trial that tested it.',
        },
        {
          name: 'Lorazepam',
          class: 'Benzodiazepine',
          howItCompares:
            'Longer acting, and the comparator midazolam beat in prehospital status epilepticus: seizures were absent on arrival without rescue therapy in 73.4% after intramuscular midazolam against 63.4% after intravenous lorazepam, a 10 percentage point difference (95% CI 4.0 to 16.1, P<0.001 for superiority).',
          typicalCost:
            'No NADAC value is held on this record for lorazepam and none is asserted here',
          prosAndCons:
            'Pros: longer duration, well established for status epilepticus. Cons: needs intravenous access in a convulsing patient, which is the practical reason it lost.',
        },
        {
          name: 'Flumazenil',
          class: 'Benzodiazepine receptor antagonist — an antidote rather than a substitute',
          howItCompares:
            "Not an alternative sedative but the reason midazolam is sometimes preferred to propofol: it competitively displaces benzodiazepines from the receptor and can reverse sedation. Its duration is shorter than midazolam's, so resedation is a real risk, and it can precipitate seizures in the benzodiazepine-dependent.",
          typicalCost:
            'No NADAC value is held on this record for flumazenil and none is asserted here',
          prosAndCons:
            'Pros: a specific antagonist exists at all, which is unusual. Cons: shorter-acting than the drug it reverses, and unsafe in chronic benzodiazepine use or mixed overdose.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'List every opioid and sedative you take, including the occasional ones',
          action:
            "The label's boxed warning states that concomitant use of benzodiazepines and opioids may result in profound sedation, respiratory depression, coma and death.",
          patientImpact:
            'This is the single most consequential piece of information a patient can supply before procedural sedation, and it is frequently under-reported because occasional or as-needed opioids do not feel like regular medication.',
          clinicalPrecaution:
            'A disclosure point, not a treatment. What is given and how it is monitored is decided by the clinical team.',
        },
        {
          name: 'Bring someone, and do not plan the rest of your day',
          action:
            'The whole purpose of this drug is that you will not remember the procedure. Judgement, coordination and memory formation remain impaired well past the point where a person feels normal.',
          patientImpact:
            'People who have been given midazolam frequently believe they are fine, hold coherent conversations and remember none of it, which is exactly why discharge with a responsible adult is a rule rather than a suggestion.',
          clinicalPrecaution:
            'The discharge criteria belong to the unit that sedated you. This is a statement of why they exist.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=NC=C2N1C3=C(C=C(C=C3)Cl)C(=NC2)C4=CC=CC=C4F',
      chemicalFormula: 'C18H13ClFN3',
      molecularWeight: '325.80 g/mol (free base); dispensed as midazolam hydrochloride',
      targetReceptorAffinity:
        'The subtype attribution is genetic rather than a binding table. Rudolph and colleagues introduced a histidine-to-arginine substitution at position 101 of the murine alpha1 subunit, rendering alpha1-containing GABA-A receptors insensitive to benzodiazepine-site ligands while leaving their response to GABA itself intact. Those mice lost the sedative and amnesic actions of diazepam, and partly the anticonvulsant action, while the anxiolytic, myorelaxant, motor-impairing and ethanol-potentiating effects were fully retained — the latter attributed to the untouched alpha2, alpha3 and alpha5 receptors of the limbic system, monoaminergic neurons and motoneurons.',
      structureSource: {
        label: 'PubChem CID 4192 (midazolam) — canonical SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4192',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mid-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Halogen placement on both aromatic rings',
          description:
            'Confirm the chlorine at the 8-position of the benzodiazepine ring and the fluorine at the 2-position of the pendant phenyl. Those two halogens are the whole molecule: the fluorine is what makes this benzodiazepine short-acting rather than long, and a positional isomer would be a different drug with a different duration and the same molecular formula.',
          reagentsAndBuffer:
            'Midazolam reference standard, nuclear magnetic resonance including fluorine-19, high-resolution mass spectrometry, reversed-phase HPLC with UV detection at 254 nm',
        },
        {
          id: 'mid-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fusion of the imidazole ring onto the benzodiazepine core',
          description:
            'Build the fused imidazo[1,5-a][1,4]benzodiazepine system. That fused imidazole is the feature that makes midazolam unique in its class: it is a base whose ring opens reversibly at low pH, which is what allows an aqueous injectable benzodiazepine to exist at all.',
          dependsOnStepId: 'mid-w1',
          reagentsAndBuffer:
            'Substituted benzodiazepinone intermediate, imidazole ring-forming reagents, anhydrous aprotic solvent, controlled temperature under nitrogen',
        },
        {
          id: 'mid-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt formation at acidic pH with the ring-opened form as the specification',
          description:
            'Formulate the hydrochloride at a pH near 3, where the imidazole ring is open and the molecule is freely water-soluble. This is the reverse of the usual purification logic: the product in the vial is deliberately the open-ring form, and its conversion back to the closed lipophilic form happens in the patient at physiological pH rather than in the factory.',
          dependsOnStepId: 'mid-w2',
          reagentsAndBuffer:
            'Hydrochloric acid to a target pH near 3, water for injection, benzyl alcohol as preservative in multiple-dose presentations, HPLC assay of the open-ring and closed-ring equilibrium against pH',
        },
        {
          id: 'mid-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Recombinant receptors expressed subtype by subtype',
          description:
            'Express alpha1, alpha2, alpha3 and alpha5 receptor combinations separately and record GABA current potentiation in each. Because the different behavioural effects of a benzodiazepine map to different alpha subunits, a single averaged potency figure across a mixed receptor population conceals the only pharmacology that matters clinically.',
          dependsOnStepId: 'mid-w3',
          reagentsAndBuffer:
            'HEK293 cells or Xenopus oocytes expressing defined alpha-beta-gamma2 combinations, GABA at its half-maximal effective concentration, flumazenil as competitive antagonist control, alpha1(H101R) construct alongside wild type',
        },
        {
          id: 'mid-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sedation and amnesia scored separately from anxiolysis',
          description:
            'Score loss of righting reflex, memory acquisition and anxiety-like behaviour as three independent readouts in wild type and in the alpha1(H101R) knock-in. The mutation dissociates them, and any protocol that collapses them into one behavioural score would have missed the finding entirely.',
          dependsOnStepId: 'mid-w4',
          reagentsAndBuffer:
            'Loss of righting reflex timing, fear-conditioning or passive-avoidance memory tasks, elevated plus maze for anxiety-like behaviour, rotarod for motor impairment, pentylenetetrazole challenge for anticonvulsant action, alpha1(H101R) and wild-type littermates',
        },
        {
          id: 'mid-w6',
          stepNumber: 6,
          phase: 'Assay_Quantification',
          name: 'Quantify the active metabolite, not just the parent',
          description:
            'Measure 1-hydroxymidazolam and its glucuronide alongside the parent drug. The hydroxy metabolite is pharmacologically active and its glucuronide accumulates in renal impairment, so a pharmacokinetic profile reporting only midazolam concentrations systematically understates exposure in exactly the patients most likely to be over-sedated.',
          dependsOnStepId: 'mid-w5',
          reagentsAndBuffer:
            'Liquid chromatography with tandem mass spectrometry for midazolam, 1-hydroxymidazolam and 1-hydroxymidazolam glucuronide, deuterated internal standards, beta-glucuronidase hydrolysis step, samples stratified by renal function',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mid-a1',
        category: 'measured',
        title: 'One amino acid separates the sedation from the anxiety relief',
        laymanSummary:
          'Researchers changed a single amino acid in one subunit of the receptor. Mice carrying the change no longer became sedated or amnesic from a benzodiazepine — but the anti-anxiety and muscle-relaxing effects were completely unaffected.',
        technicalDetails:
          'Rudolph and colleagues introduced a histidine-to-arginine point mutation at position 101 of the murine alpha1 subunit gene, rendering alpha1-type GABA-A receptors — mainly expressed in cortex and thalamus — insensitive to allosteric modulation by benzodiazepine-site ligands while preserving their regulation by GABA itself. The alpha1(H101R) mice failed to show the sedative, amnesic and partly the anticonvulsant actions of diazepam. The anxiolytic-like, myorelaxant, motor-impairing and ethanol-potentiating effects were fully retained, attributed to the non-mutated receptors found in the limbic system (alpha2, alpha5), in monoaminergic neurons (alpha3) and in motoneurons (alpha2, alpha5). This is the experiment that turned "benzodiazepines have several effects" into a map of which receptor subtype in which circuit produces which effect, and it is why midazolam\'s amnesia is understood as a specific pharmacological action rather than a by-product of sedation.',
        evidenceSource:
          'Rudolph U, Crestani F, Benke D, et al. Benzodiazepine actions mediated by specific gamma-aminobutyric acid(A) receptor subtypes. Nature 1999;401:796-800',
        doi: '10.1038/44579',
        measuredMetric:
          'Loss of sedative, amnesic and partial anticonvulsant action in alpha1(H101R) knock-in mice, with anxiolytic, myorelaxant and motor effects fully retained',
        auditFlag: 'verified',
      },
      {
        id: 'mid-a2',
        category: 'measured',
        title: 'RAMPART: an injection into the thigh beat a drip into the vein',
        laymanSummary:
          'For a person convulsing in the back of an ambulance, getting a drip in is the hard part. A trial of 893 people found an intramuscular injection of midazolam stopped more seizures than intravenous lorazepam — 73.4% against 63.4%.',
        technicalDetails:
          'Silbergleit and colleagues ran a double-blind, randomised, non-inferiority trial comparing intramuscular midazolam by autoinjector with intravenous lorazepam, in children and adults in status epilepticus treated by paramedics, whose convulsions had persisted beyond five minutes and who were still convulsing when paramedics arrived. The primary outcome was absence of seizures on arrival at the emergency department without rescue therapy, with a non-inferiority margin of 10 percentage points. Seizures were absent without rescue in 329 of 448 (73.4%) in the intramuscular midazolam group and 282 of 445 (63.4%) in the intravenous lorazepam group — absolute difference 10 percentage points, 95% CI 4.0 to 16.1, P<0.001 for both non-inferiority and superiority. Endotracheal intubation was needed in 14.1% and 14.4%, and seizures recurred in 11.4% and 10.6%. The mechanism of the advantage is logistical rather than pharmacological: an autoinjector into the thigh is delivered faster than intravenous access can be established in a convulsing patient. This is the clearest patient-relevant benefit on this page and it is a route-of-administration result as much as a drug result.',
        evidenceSource:
          'Silbergleit R, Durkalski V, Lowenstein D, et al. Intramuscular versus intravenous therapy for prehospital status epilepticus. N Engl J Med 2012;366:591-600 (RAMPART)',
        doi: '10.1056/NEJMoa1107494',
        measuredMetric:
          'Absence of seizures on arrival at the emergency department without rescue therapy',
        auditFlag: 'verified',
      },
      {
        id: 'mid-a3',
        category: 'failed',
        title: 'SEDCOM: three quarters of midazolam-sedated patients became delirious',
        laymanSummary:
          'Compared head to head with dexmedetomidine in intensive care, both drugs kept patients at the target sedation level equally well — but 77% of the midazolam group became delirious against 54%, and they stayed on the ventilator nearly two days longer.',
        technicalDetails:
          'SEDCOM was a prospective, double-blind, randomised trial at 68 centres in five countries among 375 medical and surgical intensive care patients expected to need more than 24 hours of mechanical ventilation, comparing dexmedetomidine (n=244) with midazolam (n=122), each titrated to light sedation until extubation or 30 days. The primary endpoint, percentage of time within the target Richmond Agitation-Sedation Scale range, was 75.1% for midazolam against 77.3% for dexmedetomidine — no difference, P=0.18. On the secondary endpoints midazolam lost decisively: delirium prevalence during treatment was 76.6% (93 of 122) against 54% (132 of 244), a difference of 22.6 percentage points, 95% CI 14 to 33, P<0.001; and median time to extubation was 5.6 days against 3.7, a difference of 1.9 days, P=0.01. Intensive care length of stay did not differ significantly. The result did not remove midazolam from the intensive care unit overnight, but it is the principal evidence behind guidelines that now recommend non-benzodiazepine sedation for ventilated adults.',
        evidenceSource:
          'Riker RR, Shehabi Y, Bokesch PM, et al. Dexmedetomidine vs midazolam for sedation of critically ill patients: a randomized trial. JAMA 2009;301:489-499 (SEDCOM)',
        doi: '10.1001/jama.2009.56',
        measuredMetric:
          'Prevalence of delirium during treatment and median time to extubation, against a neutral primary endpoint of time in target sedation range',
        auditFlag: 'verified',
      },
      {
        id: 'mid-a4',
        category: 'measured',
        title: 'A boxed warning written twice: about breathing, and about opioids',
        laymanSummary:
          'The label warns that intravenous midazolam has caused respiratory arrest and death when the drop in breathing was not spotted quickly, and separately that combining it with an opioid can cause profound sedation, coma and death.',
        technicalDetails:
          "The boxed warning states that intravenous midazolam has been associated with respiratory depression and respiratory arrest, especially when used for sedation in non-critical-care settings, and that in some cases where this was not recognised promptly and treated effectively, death or hypoxic encephalopathy has resulted. It restricts intravenous use to hospital or ambulatory settings — including physicians' and dental offices — that provide continuous monitoring of respiratory and cardiac function such as pulse oximetry, with immediate availability of resuscitative drugs, age- and size-appropriate bag-valve-mask and intubation equipment, and personnel trained and skilled in airway management. For deeply sedated paediatric patients it requires a dedicated individual other than the practitioner performing the procedure to monitor the patient throughout. A separate boxed section warns that concomitant use of benzodiazepines and opioids may result in profound sedation, respiratory depression, coma and death. The pharmacology behind the second warning is that the two drugs depress ventilation through independent mechanisms, so their combined effect exceeds what either produces alone.",
        evidenceSource:
          'FDA-approved US prescribing information for midazolam hydrochloride injection, BOXED WARNING (DailyMed SPL 1abda8b8-48a8-4995-af86-39220d1aa240)',
        measuredMetric:
          'Labelled requirement for continuous respiratory and cardiac monitoring, airway-skilled personnel, and a dedicated observer for deeply sedated children',
        auditFlag: 'verified',
      },
      {
        id: 'mid-a5',
        category: 'inferred',
        title: 'The amnesia is the product, and it is also why harms surface late',
        laymanSummary:
          'A drug whose purpose is that you will not remember what happened is a drug whose bad experiences are, by design, unreportable by the person who had them.',
        technicalDetails:
          "Midazolam is given for procedural sedation specifically because it produces dense anterograde amnesia through alpha1-containing receptors in hippocampus and cortex — an effect the alpha1(H101R) knock-in shows is a distinct pharmacological action rather than a consequence of depth of sedation. The consequence for evidence is structural. Distress, pain, awareness of a difficult procedure, and paradoxical agitation are all events the patient cannot subsequently report, so they must be captured by an observer at the time or not at all. Patient-reported outcome measures, the standard instrument for detecting this class of harm, are inapplicable in principle rather than merely absent. This page does not claim that midazolam causes unreported distress. It records that the drug's central therapeutic effect removes the mechanism by which such distress would ordinarily come to light, and that this is a reason to weight prospective observer-recorded data far more heavily here than in almost any other drug on this file.",
        evidenceSource:
          'Rudolph U et al. Nature 1999;401:796-800 (alpha1 subtype attribution of the amnesic action); FDA-approved US prescribing information for midazolam hydrochloride injection, Indications',
        inferredClaim:
          "That the absence of patient-reported harm during midazolam sedation indicates the absence of harm, when anterograde amnesia is the drug's intended effect",
        auditFlag: 'caution',
      },
      {
        id: 'mid-a6',
        category: 'measured',
        title: 'An active metabolite that accumulates in exactly the wrong patients',
        laymanSummary:
          'The liver turns midazolam into a compound that is itself sedating, and then attaches a sugar to it for the kidneys to excrete. In kidney failure that sugar-conjugated form builds up, and it still sedates.',
        technicalDetails:
          "Midazolam is metabolised principally by CYP3A4 to 1-hydroxymidazolam, which is pharmacologically active, and thence to 1-hydroxymidazolam glucuronide, which is renally cleared and which retains sedative activity. In renal impairment the glucuronide accumulates, producing prolonged sedation that a plasma midazolam concentration would not predict. CYP3A4 dependence also makes the drug unusually sensitive to interaction: azole antifungals, macrolides, protease inhibitors and grapefruit juice inhibit it, while rifampicin and other inducers accelerate clearance. Two clinically consequential facts follow. Prolonged infusion produces a context-sensitive half-time that lengthens sharply with duration, unlike propofol's, so an intensive care patient sedated for days does not wake when the infusion stops. And the population in which this matters most — critically ill patients with renal and hepatic dysfunction on multiple interacting drugs — is precisely the population in which midazolam was for decades the default sedative.",
        evidenceSource:
          'FDA-approved US prescribing information for midazolam hydrochloride injection, Clinical Pharmacology and Drug Interactions',
        measuredMetric:
          'Formation of the active metabolite 1-hydroxymidazolam and its renally cleared active glucuronide, with CYP3A4-dependent clearance',
        auditFlag: 'verified',
      },
      {
        id: 'mid-a7',
        category: 'measured',
        title: 'The ring opens in the vial and closes in the patient',
        laymanSummary:
          'Benzodiazepines are greasy and do not dissolve in water. Midazolam solves that with a ring that springs open in the acidic vial, making it water-soluble, and snaps shut in the blood, making it fat-soluble enough to enter the brain.',
        technicalDetails:
          'The fused imidazole ring of midazolam undergoes reversible, pH-dependent ring opening. In the injection, formulated at a pH near 3, the ring is open and the molecule is a freely water-soluble salt requiring no organic co-solvent — which is why midazolam injection does not cause the venous irritation that propylene-glycol-solubilised diazepam does. On entering blood at pH 7.4 the ring closes, restoring a lipophilic molecule that crosses the blood-brain barrier rapidly. This single structural feature is the reason midazolam displaced diazepam for intravenous and intramuscular use, and it is a genuine formulation achievement built into the molecule rather than into the vehicle. It is on this page as a measured physicochemical property because it is the mechanistic answer to why this benzodiazepine and not another became the injectable standard.',
        evidenceSource:
          'FDA-approved US prescribing information for midazolam hydrochloride injection, Description and Clinical Pharmacology; PubChem CID 4192',
        measuredMetric:
          'Reversible pH-dependent ring opening of the fused imidazole, giving aqueous solubility below pH 4 and lipophilicity at physiological pH',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as a water-soluble salt with no solvent needed',
        laymanDesc:
          'In the vial the drug is dissolved in plain acidified water. Older injectable benzodiazepines needed an oily solvent that stung the vein and could damage it.',
        molecularDetail:
          'At a formulation pH near 3 the fused imidazole ring is open and the molecule is freely water-soluble, so no propylene glycol or similar co-solvent is required. The intramuscular route works for the same reason, which is what made an autoinjector for seizures possible.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'In the blood the ring snaps shut and it becomes fat-soluble',
        laymanDesc:
          'At the pH of blood, the open ring closes again. The molecule turns greasy, crosses into the brain within a couple of minutes, and starts working.',
        molecularDetail:
          'Ring closure at physiological pH restores a lipophilic species that crosses the blood-brain barrier rapidly. This pH-dependent equilibrium is unique among the benzodiazepines in clinical use and is the structural reason midazolam is the injectable one.',
        iconName: 'FlipHorizontal',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds a pocket on the side of the receptor, not the channel itself',
        laymanDesc:
          "It does not open the chloride gate. It binds the outside of the receptor, at the seam between two subunits, and makes the brain's own GABA work better.",
        molecularDetail:
          "The benzodiazepine site lies at the interface between an alpha and the gamma2 subunit, distinct from the GABA sites at the beta-alpha interfaces and from propofol's site on the beta subunit. Because midazolam is a positive allosteric modulator with no intrinsic activity, its effect has a ceiling set by how much GABA is present — which is why benzodiazepine overdose alone is far less lethal than barbiturate overdose, and why the addition of an opioid changes that arithmetic entirely.",
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The alpha1 subtype delivers the sedation and the amnesia',
        laymanDesc:
          'Different versions of the receptor sit in different parts of the brain and do different jobs. The version in the cortex and hippocampus is the one that makes you drowsy and stops memories forming.',
        molecularDetail:
          'The alpha1(H101R) knock-in mouse loses the sedative and amnesic actions of a benzodiazepine while retaining the anxiolytic, myorelaxant and motor-impairing ones, which are attributed to alpha2, alpha3 and alpha5 receptors in limbic, monoaminergic and motoneuron circuits. Dense alpha1 expression in hippocampus is the anatomical basis of anterograde amnesia at doses that leave a patient conversational.',
        iconName: 'BrainCircuit',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Awake, calm, cooperative — and forming no memory',
        laymanDesc:
          'The patient can answer questions, follow instructions and swallow on request, and afterwards remembers essentially nothing from the moment the drug went in.',
        molecularDetail:
          'Conscious sedation with retained responsiveness and dense anterograde amnesia is the intended clinical state, and it is separable from depth of sedation. Respiratory depression is dose-dependent and is markedly potentiated by opioids acting on brainstem mu receptors, which is why the boxed warning names the combination specifically.',
        iconName: 'EyeOff',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Cleared by CYP3A4 — into something that also sedates',
        laymanDesc:
          'The liver converts it into a compound that is itself active, then attaches a sugar for the kidney to remove. If the kidneys are failing, that form builds up and the sedation goes on.',
        molecularDetail:
          'CYP3A4 hydroxylation yields 1-hydroxymidazolam, which is active, and glucuronidation yields an active, renally cleared conjugate. Context-sensitive half-time lengthens substantially with infusion duration, so prolonged intensive care sedation does not offset promptly. CYP3A4 inhibitors and inducers alter clearance markedly. Flumazenil competitively displaces midazolam from the receptor but is shorter-acting than the drug it reverses, so resedation must be anticipated.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId:
          'RAMPART — intramuscular midazolam versus intravenous lorazepam for prehospital status epilepticus',
        phase: 'Double-blind randomised non-inferiority trial',
        sampleSize: 893,
        primaryEndpoint:
          'Absence of seizures on arrival at the emergency department without the need for rescue therapy',
        endpointMet: true,
        statisticalPValue:
          '73.4% (329/448) with intramuscular midazolam versus 63.4% (282/445) with intravenous lorazepam; absolute difference 10 percentage points, 95% CI 4.0 to 16.1, P<0.001 for both non-inferiority and superiority',
        unreportedAdverseSignals:
          'Endotracheal intubation was needed in 14.1% versus 14.4% and seizures recurred in 11.4% versus 10.6% — the advantage is in stopping the seizure faster, not in avoiding intubation.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId:
          'SEDCOM — dexmedetomidine versus midazolam for sedation of critically ill patients',
        phase: 'Prospective double-blind randomised trial at 68 centres in 5 countries',
        sampleSize: 375,
        primaryEndpoint:
          'Percentage of time within the target Richmond Agitation-Sedation Scale range',
        endpointMet: false,
        statisticalPValue:
          'Primary endpoint neutral: 75.1% for midazolam versus 77.3% for dexmedetomidine, difference 2.2 percentage points (95% CI -3.2 to 7.5), P=0.18. Delirium 76.6% versus 54%, difference 22.6 points (95% CI 14 to 33), P<0.001; time to extubation 5.6 versus 3.7 days, P=0.01',
        unreportedAdverseSignals:
          'Intensive care length of stay did not differ significantly despite the extubation difference, which is a reminder that a ventilator-day advantage need not translate into a discharge advantage.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Rudolph alpha1(H101R) knock-in mouse dissociation of benzodiazepine actions',
        phase: 'Genetic knock-in mechanism study',
        sampleSize: 0,
        primaryEndpoint:
          'Sedative, amnesic, anticonvulsant, anxiolytic, myorelaxant and motor effects of diazepam in alpha1(H101R) versus wild-type mice',
        endpointMet: true,
        statisticalPValue:
          'Sedative, amnesic and partial anticonvulsant actions abolished in the knock-in; anxiolytic-like, myorelaxant, motor-impairing and ethanol-potentiating effects fully retained',
        unreportedAdverseSignals:
          'A mouse study of diazepam rather than midazolam. The subtype attribution is accepted for the benzodiazepine site as a class, but the specific quantitative profile of midazolam across subtypes is not established by this experiment.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A single histidine-to-arginine substitution at alpha1 position 101 abolishes benzodiazepine sedation and amnesia in mice while leaving anxiolysis and muscle relaxation intact',
        'Seizures absent on arrival without rescue therapy in 73.4% after intramuscular midazolam against 63.4% after intravenous lorazepam, in 893 patients in status epilepticus',
        'Delirium in 76.6% of midazolam-sedated ventilated patients against 54% on dexmedetomidine, with extubation 1.9 days later',
        'Reversible pH-dependent ring opening giving aqueous solubility below pH 4 and lipophilicity at blood pH',
        'Formation of an active metabolite and an active renally cleared glucuronide, with CYP3A4-dependent clearance',
      ],
      unsupportedInferences: [
        "That the absence of complaints from sedated patients indicates the absence of distress, when dense anterograde amnesia is the drug's intended effect",
        'That the benzodiazepine ceiling effect makes the drug safe in combination — the boxed warning exists because opioids depress ventilation by an independent route',
        'That a plasma midazolam concentration predicts sedation in renal impairment, when an active glucuronide is accumulating that the assay does not see',
        'That the RAMPART result is a pharmacological superiority of midazolam over lorazepam; it is substantially a demonstration that an intramuscular injection is delivered faster than an intravenous line can be sited in a convulsing patient',
      ],
      whatFailedInitially: [
        'Midazolam lost the head-to-head against dexmedetomidine on delirium by 22.6 percentage points and on time to extubation by 1.9 days, and is no longer first-line for intensive care sedation in adults',
        'Its boxed warning was written because respiratory depression in non-critical-care settings went unrecognised and caused death and hypoxic brain injury',
        "Prolonged infusion in the critically ill produces accumulation and delayed emergence that the drug's short single-dose duration does not predict",
      ],
      realWorldOutcome: [
        'On the WHO Model List of Essential Medicines and the standard drug for procedural sedation and for out-of-hospital seizure treatment worldwide',
        'About 42 cents per millilitre at United States pharmacy acquisition cost across 23 listed generic products',
        'The one place it beat its comparator on a hard patient outcome is the ambulance: a thigh injection stops more seizures than a drip, and buccal and intranasal formulations built on that finding are now standard for community seizure rescue',
        'Displaced from first-line intensive care sedation by the trials above, and still ubiquitous everywhere a person needs to cooperate with a procedure and not remember it',
      ],
    },
    deliverySystem: {
      type: 'Sterile aqueous solution for intravenous and intramuscular injection, in single- and multiple-dose vials, premixed infusion bags, prefilled autoinjectors and an oral syrup; buccal and intranasal formulations exist for seizure rescue',
      description:
        'The range of routes is a direct consequence of the pH-dependent ring opening: because the molecule is genuinely water-soluble in an acidic vial, it can be injected intramuscularly, sprayed into a nostril or squirted into a cheek, none of which is practical for a benzodiazepine that needs an organic solvent. That is what made the RAMPART autoinjector trial possible and what underlies community seizure-rescue formulations. Multiple-dose presentations contain benzyl alcohol, which matters in neonates. The label restricts intravenous use to settings with continuous respiratory and cardiac monitoring and airway-skilled personnel immediately available.',
      safetyProfile:
        'The boxed warning covers two things. Intravenous midazolam has caused respiratory depression and respiratory arrest, particularly in non-critical-care settings, with death or hypoxic encephalopathy where this was not promptly recognised and treated; use is restricted to settings with continuous respiratory and cardiac monitoring, resuscitation drugs and equipment, and personnel skilled in airway management, with a dedicated observer for deeply sedated children. Separately, concomitant use with opioids may cause profound sedation, respiratory depression, coma and death. Beyond the warning: an active metabolite and an active glucuronide accumulate in renal impairment, clearance is CYP3A4-dependent and heavily interaction-prone, context-sensitive half-time lengthens with infusion duration, paradoxical agitation occurs particularly in children and older people, and flumazenil is shorter-acting than the drug it reverses. No dosing guidance appears on this page.',
    },
    commonQuestions: [
      {
        q: 'Why will I not remember the procedure?',
        a: 'Because that is a specific pharmacological effect and not a side effect of being sleepy. The GABA-A receptor comes in variants distinguished by which alpha subunit they contain, and they sit in different parts of the brain. The alpha1 variant is dense in cortex and hippocampus, and the hippocampus is where new memories are consolidated. Researchers showed how cleanly separable this is by engineering mice with one amino acid changed in the alpha1 subunit: those animals no longer became sedated or amnesic from a benzodiazepine, while the anti-anxiety and muscle-relaxing effects were entirely unaffected. So midazolam can leave you awake enough to answer questions and swallow on request while forming almost no memory of any of it, which is exactly what conscious sedation is for.',
      },
      {
        q: 'Why does the label warn so strongly about opioids?',
        a: 'Because the two drugs suppress breathing by independent routes, so their combined effect is worse than either alone. On its own, a benzodiazepine has a ceiling: it only amplifies the GABA that the brain is already releasing, so it cannot shut the system down completely, which is why benzodiazepine overdose alone is comparatively survivable. An opioid depresses the brainstem respiratory centres directly through mu receptors. Put them together and the ceiling stops protecting you. The boxed warning states plainly that concomitant use may result in profound sedation, respiratory depression, coma and death, and the same label separately restricts intravenous use to settings with continuous respiratory and cardiac monitoring and personnel skilled in airway management, because respiratory arrest that was not recognised promptly has caused death and hypoxic brain injury.',
      },
      {
        q: 'Is it still the right drug for sedation in intensive care?',
        a: 'Generally no, and the trial that changed that is worth reading carefully. SEDCOM randomised 375 ventilated intensive care patients at 68 centres to midazolam or dexmedetomidine, each titrated to light sedation. On its primary endpoint the two were identical: patients spent 75.1% and 77.3% of the time in the target sedation range. On the secondary endpoints midazolam did badly — delirium in 76.6% against 54%, and median time to extubation 5.6 days against 3.7. The pharmacology fits: midazolam has an active metabolite and an active renally cleared glucuronide, and its context-sensitive half-time lengthens with infusion duration, so days of sedation do not switch off when the pump does. Guidelines now recommend non-benzodiazepine sedation for ventilated adults.',
        auditNote:
          'The result that changed practice was a secondary endpoint of a trial whose primary endpoint was neutral, which is worth knowing even when the direction of the finding is not in doubt.',
      },
      {
        q: 'Why is a shot in the leg better than a drip for a seizure?',
        a: 'Because of time, not chemistry. RAMPART randomised 893 children and adults still convulsing when paramedics arrived, to intramuscular midazolam by autoinjector or intravenous lorazepam. Seizures were absent on arrival at hospital without rescue therapy in 73.4% against 63.4% — a 10 percentage point difference, statistically significant for superiority, not just non-inferiority. The reason is that siting an intravenous cannula in a convulsing person takes minutes and an autoinjector into the thigh takes seconds, and every minute a seizure continues makes it harder to stop. Midazolam can be given that way at all only because of its unusual chemistry: the ring in the molecule opens at acidic pH, making it genuinely water-soluble in the vial, so no irritant solvent is needed.',
      },
      {
        q: 'Can it be reversed?',
        a: 'Partly, and with a caveat that matters. Flumazenil competes with midazolam for the same binding site on the receptor and can reverse sedation. But flumazenil is shorter-acting than midazolam, so a patient who is woken up can become resedated as the antagonist wears off before the drug does, which is why reversal is not a substitute for monitoring. Flumazenil can also precipitate seizures in someone who takes benzodiazepines regularly, or in a mixed overdose involving a proconvulsant drug. The existence of an antagonist is genuinely unusual — propofol and the volatile agents have none — but it is a narrower tool than it sounds.',
      },
      {
        q: 'Why does this page say the amnesia makes the drug hard to audit?',
        a: "Because the ordinary way a drug's unpleasant effects come to light is that patients describe them, and this drug removes that channel by design. If a person is distressed during an endoscopy under midazolam, or experiences a paradoxical agitated reaction, or is aware of something painful, they will very often have no memory of it afterwards and no complaint to make. That is not a hypothetical: dense anterograde amnesia is the effect the drug is chosen for, and it was shown to be a specific action of the alpha1 receptor subtype rather than a by-product of sedation. This page does not claim midazolam causes hidden harm. It records that the usual detection mechanism is unavailable in principle, which is a reason to weight what an observer records at the time far more heavily than what a patient reports afterwards.",
        auditNote:
          'Filed as an inference about evidence rather than about pharmacology. It is a statement about what the literature can and cannot contain.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Rudolph U, Crestani F, Benke D, et al. Benzodiazepine actions mediated by specific gamma-aminobutyric acid(A) receptor subtypes. Nature 1999;401:796-800',
        identifier: '10.1038/44579',
        kind: 'doi',
      },
      {
        label:
          'Silbergleit R, Durkalski V, Lowenstein D, et al. Intramuscular versus intravenous therapy for prehospital status epilepticus (RAMPART). N Engl J Med 2012;366:591-600',
        identifier: '10.1056/NEJMoa1107494',
        kind: 'doi',
      },
      {
        label:
          'Riker RR, Shehabi Y, Bokesch PM, et al. Dexmedetomidine vs midazolam for sedation of critically ill patients: a randomized trial (SEDCOM). JAMA 2009;301:489-499',
        identifier: '10.1001/jama.2009.56',
        kind: 'doi',
      },
      {
        label:
          'FDA-approved US prescribing information for midazolam hydrochloride injection (DailyMed structured product label, Hospira Inc) — boxed warning on respiratory depression and on concomitant opioid use, clinical pharmacology, drug interactions',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1abda8b8-48a8-4995-af86-39220d1aa240',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4192 — midazolam structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4192',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
