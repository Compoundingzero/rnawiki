import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated dossiers — the anti-seizure medicines.
 *
 * The editorial layer written over records a pipeline had already filled with label text, registry
 * entries, CMS acquisition prices and a PubChem structure. Identity facts (slug, trade names,
 * sponsor, approval year, SMILES, formula, molecular weight, NADAC price) are copied from the
 * stored record rather than researched again. Everything else here is written from primary
 * sources, and every DOI, PMID, NCT number and Drugs@FDA application number was resolved against
 * Crossref, the PubMed E-utilities, the ClinicalTrials.gov v2 API or the openFDA endpoints at the
 * time of writing.
 *
 * Four conventions apply to the whole group.
 *
 * 1. THE SURROGATE IS SEIZURE COUNT, AND THE OUTCOME IS A LIFE. Almost every anti-seizure trial in
 *    existence measures percentage reduction in seizure frequency over eight to twelve weeks in
 *    people who have already failed other drugs. Almost none measures driving, employment,
 *    injury, SUDEP or death. Which of those a page is describing is stated in as many words.
 *
 * 2. THE HEAD-TO-HEAD EVIDENCE IS SANAD AND SANAD II, AND IT IS UNFLATTERING TO THE NEW DRUGS.
 *    Lamotrigine beat carbamazepine on treatment failure in 2007 and beat both levetiracetam and
 *    zonisamide on the per-protocol remission analysis in 2021; levetiracetam failed to show
 *    non-inferiority to valproate in generalised epilepsy. Those results appear on the pages of the
 *    drugs that lost, not only on the page of the drug that won.
 *
 * 3. NO PER-DOSE SYNTHESIS COST IS STATED ANYWHERE. `synthesisCostPerDose` is empty in every
 *    pricing block below. The published cost-of-production literature for essential medicines holds
 *    its per-drug figures in supplementary appendices that could not be verified line by line here,
 *    and a manufactured number is worse than a missing one. What each block does carry is the CMS
 *    National Average Drug Acquisition Cost, which is what a United States pharmacy pays to buy the
 *    product, and emphatically not a cost of manufacture or a price a patient is charged.
 *
 * 4. NO DOSING, TITRATION, SWITCHING OR PROCUREMENT GUIDANCE. Doses appear only where they are part
 *    of a trial's description or a label's identity. Nothing here tells a reader what to take, when
 *    to change it, or how to stop.
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

const SANAD_II_FOCAL_SOURCE = {
  label:
    'Marson A et al. The SANAD II study of the effectiveness and cost-effectiveness of levetiracetam, zonisamide, or lamotrigine for newly diagnosed focal epilepsy. Lancet 2021;397:1363-1374',
  identifier: '10.1016/S0140-6736(21)00247-6',
  kind: 'doi' as const,
}

const SANAD_II_GENERALISED_SOURCE = {
  label:
    'Marson A et al. The SANAD II study of the effectiveness and cost-effectiveness of valproate versus levetiracetam for newly diagnosed generalised and unclassifiable epilepsy. Lancet 2021;397:1375-1386',
  identifier: '10.1016/S0140-6736(21)00246-4',
  kind: 'doi' as const,
}

const EURAP_SOURCE = {
  label:
    'Tomson T et al. Comparative risk of major congenital malformations with eight different antiepileptic drugs: a prospective cohort study of the EURAP registry. Lancet Neurol 2018;17:530-538',
  identifier: '10.1016/S1474-4422(18)30107-8',
  kind: 'doi' as const,
}

const KETOGENIC_DIET_SOURCE = {
  label:
    'Neal EG et al. The ketogenic diet for the treatment of childhood epilepsy: a randomised controlled trial. Lancet Neurol 2008;7:500-506',
  identifier: '10.1016/S1474-4422(08)70092-9',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_5_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Levetiracetam — the drug the standard screening tests would have thrown away.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'levetiracetam',
    name: 'Levetiracetam',
    tradeName: 'Keppra',
    sponsor: 'UCB Inc. (originator); now off-patent and made by well over a hundred manufacturers',
    targetGene: 'SV2A',
    targetProtein: 'Synaptic vesicle glycoprotein 2A',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1999,
    indication:
      'Treatment of partial-onset (focal) seizures in patients 1 month of age and older; adjunctive therapy for myoclonic seizures in juvenile myoclonic epilepsy from age 12, and for primary generalised tonic-clonic seizures in idiopathic generalised epilepsy from age 6',
    patientFriendlyIndication: 'Epilepsy, including focal seizures and generalised seizures',
    anatomicalSite: 'Presynaptic nerve terminal, inside the synaptic vesicle membrane (cortex and hippocampus)',
    conditionContext: {
      conditionExplainer:
        'A seizure is a burst of synchronised electrical firing across a population of brain cells. In epilepsy that burst recurs without an external trigger, either starting in one patch of cortex and spreading (focal) or engaging both hemispheres from the outset (generalised).',
      whyItMatters:
        'The seizure itself is usually brief. The consequences are not: loss of a driving licence, injury during a fall, restricted work, and a small but real annual risk of sudden unexpected death in epilepsy. Almost every anti-seizure trial counts seizures. Very few count any of those.',
      whoTakesThis:
        'One of the two or three most-prescribed anti-seizure medicines in the world, used from the neonatal unit to old age, and the usual first choice in hospital when someone needs an intravenous drug quickly.',
      clinicalGoals:
        'Freedom from seizures, on one drug, without side effects that cost more than the seizures did.',
    },
    oneSentenceVerdict:
      'A drug that binds the synaptic vesicle protein SV2A to blunt neurotransmitter release during high-frequency firing, with a replicated add-on effect (33 to 40% of patients halved their seizures against 11% on placebo) and two large randomised trials in which it failed to match older, cheaper drugs as a first-line treatment.',
    laymanHowItWorks:
      'Nerve endings store their chemical messengers in tiny bubbles and release them when the cell fires. Levetiracetam gets inside those bubbles and sticks to a protein in their wall called SV2A. When firing is normal, little changes. When firing becomes rapid and repetitive, as it does in a seizure, the drug damps down how much is released, so the burst is less able to build and spread.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1105 per unit, the median across 134 listed levetiracetam products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered at UCB in Belgium and approved in the United States in November 1999 under NDA 021035. Composition-of-matter protection has expired and the molecule is manufactured generically worldwide. The extended-release form (NDA 022285, 2008) and the orally disintegrating printed tablet Spritam remain separately branded.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Levetiracetam is cheap, has no meaningful drug interactions and can be given intravenously, which is why hospitals reach for it. In the two randomised trials that asked whether it should be the first drug someone starts, it lost: to lamotrigine in focal epilepsy and to valproate in generalised epilepsy. The alternatives below are the comparators from those trials.',
      conventionalRx: [
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In SANAD II, 990 people with newly diagnosed focal epilepsy were randomised between lamotrigine, levetiracetam and zonisamide. Levetiracetam failed to meet non-inferiority to lamotrigine for time to 12-month remission (HR 1.18, 97.5% CI 0.95 to 1.47), and in the per-protocol analysis lamotrigine was superior (HR 1.32, 97.5% CI 1.05 to 1.66). Adverse reactions were reported by 33% on lamotrigine and 44% on levetiracetam.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the winner of both SANAD and SANAD II in focal epilepsy, and the lowest malformation rate of the eight drugs in the EURAP registry alongside levetiracetam. Cons: must be introduced slowly because of serious rash, and carries a boxed warning for Stevens-Johnson syndrome.',
        },
        {
          name: 'Valproate (Depakote, Epilim)',
          class: 'Broad-spectrum, multiple mechanisms',
          howItCompares:
            'In the generalised and unclassified arm of SANAD II, 520 people were randomised between valproate and levetiracetam. Levetiracetam failed to meet non-inferiority (HR 1.19, 95% CI 0.96 to 1.47 against a margin of 1.314), the per-protocol analysis favoured valproate for 12-month remission, and levetiracetam was dominated in the cost-utility analysis.',
          typicalCost:
            'Off-patent; the CMS NADAC file lists divalproex and valproic acid products separately from the injectable',
          prosAndCons:
            'Pros: the most effective drug in idiopathic generalised epilepsy in two randomised trials. Cons: 10.3% major congenital malformation rate in EURAP and a dose-dependent 8 to 11 point IQ reduction in exposed children, which is why the comparison above exists at all.',
        },
        {
          name: 'Brivaracetam (Briviact)',
          class: 'SV2A ligand, same target',
          howItCompares:
            'A UCB successor with roughly 20-fold higher SV2A affinity, developed on the hypothesis that tighter binding would mean better seizures control and fewer behavioural effects. It is approved and it works; no randomised trial has shown it superior to levetiracetam on seizure outcomes.',
          typicalCost:
            'US$0.2634 per unit, median across 35 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: an option for people who cannot tolerate levetiracetam behaviourally. Cons: the direct superiority claim rests on observational switch studies, not on a randomised head-to-head.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a food supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream changes in GABA synthesis, adenosine signalling and mitochondrial function. The mechanism is not settled and does not overlap with SV2A binding.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. This is a hospital-supervised medical diet with its own monitoring requirements, not an eating pattern to adopt from a web page.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Protect your sleep',
          action:
            'Keep a regular sleep schedule and treat sleep deprivation as a medical issue rather than a lifestyle one.',
          patientImpact:
            'Sleep deprivation is among the most consistently reported seizure precipitants in patient-recorded triggers, and it is one of very few that a person controls directly.',
          clinicalPrecaution:
            'Improving sleep does not replace medication and does not license reducing it. Talk to the prescriber before any change.',
        },
        {
          name: 'Tell someone about mood changes early',
          action:
            'Ask a partner, parent or housemate to say something if they notice new irritability, anger or withdrawal after starting this drug.',
          patientImpact:
            'The label records non-psychotic behavioural symptoms in 13% of adults and 38% of children aged 4 to 16 on immediate-release levetiracetam, against 6% and 19% on placebo.',
          clinicalPrecaution:
            'These are drug effects with a documented rate, not a character flaw, and they are the commonest reason this particular drug gets changed. Report them rather than stopping the drug.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC[C@@H](C(=O)N)N1CCCC1=O',
      chemicalFormula: 'C8H14N2O2',
      molecularWeight: '170.21 g/mol',
      targetReceptorAffinity:
        'Binds SV2A with micromolar affinity. The evidence that this is the therapeutic target is a rank-order correlation: across levetiracetam and its analogues, affinity for the brain binding site tracks anti-seizure potency in audiogenic seizure-prone mice, and SV2A-knockout mouse brain shows no binding.',
      structureSource: {
        label: 'PubChem CID 5284583 (levetiracetam) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284583',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lev-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric purity of the aminobutyramide starting material',
          description:
            'Confirm the identity and optical purity of (S)-2-aminobutyramide before the ring-forming step. Only the (S) enantiomer is active; its mirror image, ucb L060, is inactive in the same seizure models, so an enantiomeric impurity here is inert mass carried through every later stage.',
          reagentsAndBuffer:
            '(S)-2-aminobutyramide hydrochloride reference standard, chiral HPLC on an amylose-derived stationary phase, polarimetry, Karl Fischer titration for water content',
        },
        {
          id: 'lev-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-acylation and cyclisation to the 2-oxopyrrolidine ring',
          description:
            'React (S)-2-aminobutyramide with 4-chlorobutyryl chloride, then close the ring under base to give the 2-oxo-1-pyrrolidine acetamide skeleton. The chiral centre is set by the starting material and must not be racemised by the base or the temperature used to close the ring.',
          dependsOnStepId: 'lev-w1',
          reagentsAndBuffer:
            '4-chlorobutyryl chloride, triethylamine or sodium hydroxide as base, dichloromethane or toluene, controlled addition below 10 degrees Celsius, nitrogen blanket',
        },
        {
          id: 'lev-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and chiral assay against the (R) enantiomer',
          description:
            'Recrystallise the crude solid and assay by chiral HPLC against an authentic (R) standard. The specification here is an enantiomeric one, not only a chemical one, because the two forms are chemically identical and pharmacologically not.',
          dependsOnStepId: 'lev-w2',
          reagentsAndBuffer:
            'Isopropanol and water for recrystallisation, activated charcoal, chiral HPLC with hexane and ethanol mobile phase, UV detection at 205 nm',
        },
        {
          id: 'lev-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Uptake into recycling synaptic vesicles in cultured hippocampal neurons',
          description:
            'Incubate cultured hippocampal neurons and stimulate them so vesicles cycle. The SV2A epitope levetiracetam binds faces the vesicle lumen, so the drug reaches its target only when a vesicle opens to the outside during exocytosis and then reseals. Access to the target is use-dependent, and that is the physical basis of the claim that the drug acts more on rapidly firing terminals.',
          dependsOnStepId: 'lev-w3',
          reagentsAndBuffer:
            'Primary rat hippocampal cultures on poly-L-lysine, Neurobasal medium with B27, field stimulation at 10 Hz, FM4-64 styryl dye for vesicle cycling, Tyrode buffer',
        },
        {
          id: 'lev-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand displacement at SV2A and high-frequency train recording',
          description:
            'Measure displacement of a tritiated SV2A ligand from brain membranes to give an affinity number, and in parallel record excitatory postsynaptic currents during a stimulus train to give a functional one. Reporting both matters: the binding number is the proposed explanation, the run-down of the train is the effect, and SV2A-knockout tissue is the control that shows the two are connected.',
          dependsOnStepId: 'lev-w4',
          reagentsAndBuffer:
            'Rat cortical membrane preparation, tritiated ucb 30889 as SV2A radioligand, unlabelled levetiracetam for displacement, SV2A-knockout mouse brain as negative control, whole-cell patch clamp with caesium-based internal solution',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lev-a1',
        category: 'measured',
        title: 'Add-on trial: 40% of patients halved their seizures, against 11% on placebo',
        laymanSummary:
          'In the pivotal United States trial, patients whose seizures were not controlled by their existing drugs added levetiracetam or a dummy tablet. About four in ten on the higher dose halved their seizure count, against about one in ten on the dummy.',
        technicalDetails:
          'Cereghino and colleagues randomised 294 patients with uncontrolled partial seizures (at least 12 per 12 weeks) to placebo (n=95), levetiracetam 1000 mg/day (n=98) or levetiracetam 3000 mg/day (n=101), after a 12-week baseline, with a 4-week titration and 14 weeks at fixed dose. Partial seizure frequency across the whole evaluation period was lower on both doses than on placebo (p<=0.001). Responder rates, defined as at least a 50% reduction, were 33.0% at 1000 mg/day and 39.8% at 3000 mg/day against 10.8% on placebo (p<0.001). Of 199 patients on levetiracetam, 11 became seizure-free; none did on placebo. Treatment-emergent adverse events above 10% and above placebo were asthenia, dizziness, flu syndrome, headache, infection, rhinitis and somnolence.',
        evidenceSource: 'Cereghino JJ et al., Neurology 2000;55:236-242',
        doi: '10.1212/wnl.55.2.236',
        measuredMetric:
          'Proportion of patients with at least 50% reduction in partial seizure frequency over the 18-week evaluation period',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a2',
        category: 'failed',
        title: 'SANAD II: levetiracetam failed non-inferiority to lamotrigine in focal epilepsy',
        laymanSummary:
          'A trial of 990 newly diagnosed patients set out to show that levetiracetam was no worse than lamotrigine as a first drug. It did not show that. On the stricter analysis, lamotrigine was better.',
        technicalDetails:
          'SANAD II randomised 990 participants aged 5 and over with newly diagnosed focal epilepsy 1:1:1 to lamotrigine (n=330), levetiracetam (n=332) or zonisamide (n=328), with a non-inferiority limit of HR 1.329 for time to 12-month remission. Levetiracetam did not meet non-inferiority in the intention-to-treat analysis (HR 1.18, 97.5% CI 0.95 to 1.47). The per-protocol analysis showed 12-month remission superior with lamotrigine over levetiracetam (HR 1.32, 97.5% CI 1.05 to 1.66). Adverse reactions were reported by 108 (33%) starting lamotrigine and 144 (44%) starting levetiracetam. Lamotrigine also won the cost-utility analysis, at 1.403 QALYs against 1.222. The authors concluded the findings do not support levetiracetam as a first-line treatment for focal epilepsy.',
        evidenceSource: 'Marson A et al., Lancet 2021;397:1363-1374 (ISRCTN30294119)',
        doi: '10.1016/S0140-6736(21)00247-6',
        measuredMetric: 'Time to 12-month remission, intention-to-treat and per-protocol',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a3',
        category: 'failed',
        title: 'SANAD II: levetiracetam also failed non-inferiority to valproate in generalised epilepsy',
        laymanSummary:
          'Levetiracetam is widely prescribed to women who would otherwise take valproate, because valproate harms a developing fetus. The trial designed to check whether it controls generalised seizures as well as valproate found that it did not.',
        technicalDetails:
          'The companion SANAD II arm randomised 520 participants with newly diagnosed generalised or unclassifiable epilepsy 1:1 to levetiracetam (n=260) or valproate (n=260), non-inferiority limit HR 1.314. Levetiracetam did not meet non-inferiority for time to 12-month remission (HR 1.19, 95% CI 0.96 to 1.47), and the per-protocol analysis showed 12-month remission superior with valproate. Levetiracetam was dominated in the cost-utility analysis, with an incremental net health benefit of -0.040 (95% central range -0.175 to 0.037) and a 0.17 probability of being cost-effective at 20,000 pounds per QALY. The authors framed the result as informing, rather than settling, the benefit-and-harm discussion for girls and women of child-bearing potential.',
        evidenceSource: 'Marson A et al., Lancet 2021;397:1375-1386 (ISRCTN30294119)',
        doi: '10.1016/S0140-6736(21)00246-4',
        measuredMetric: 'Time to 12-month remission against a pre-specified non-inferiority margin',
        inferredClaim:
          'That levetiracetam is an equivalent substitute for valproate in generalised epilepsy, rather than a safer drug that controls seizures less well',
        auditFlag: 'caution',
      },
      {
        id: 'lev-a4',
        category: 'measured',
        title: 'ESETT: no better and no worse than fosphenytoin or valproate in status epilepticus',
        laymanSummary:
          'When a seizure will not stop after a benzodiazepine, three drugs are commonly given next. A blinded trial compared them head to head and found all three worked in about half of patients, with no winner.',
        technicalDetails:
          'ESETT randomised 384 children and adults with benzodiazepine-refractory convulsive status epilepticus to levetiracetam (145), fosphenytoin (118) or valproate (121), in a blinded, response-adaptive design. The primary outcome, absence of clinically evident seizures with improved consciousness at 60 minutes without further anticonvulsant, occurred in 47% on levetiracetam (95% credible interval 39 to 55), 45% on fosphenytoin (36 to 54) and 46% on valproate (38 to 55). Posterior probabilities of being the most effective drug were 0.41, 0.24 and 0.35. The trial was stopped at a planned interim analysis for futility of finding any drug superior or inferior. Numerically more hypotension and intubation occurred with fosphenytoin and more deaths with levetiracetam, neither significantly.',
        evidenceSource: 'Kapur J et al., N Engl J Med 2019;381:2103-2113 (NCT01960075)',
        doi: '10.1056/NEJMoa1905795',
        measuredMetric:
          'Seizure cessation with improved level of consciousness at 60 minutes, without additional anticonvulsant',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a5',
        category: 'conclusion_shift',
        title: 'The drug was approved in 1999; its target was identified in 2004',
        laymanSummary:
          'Levetiracetam was licensed for five years before anyone knew what it binds to. It was also inactive in the two animal tests that most anti-seizure drugs are discovered with, and would have been discarded if those tests had been the only filter.',
        technicalDetails:
          'Klitgaard and colleagues reported in 1998 that levetiracetam had no anticonvulsant activity in the acute maximal electroshock test or the maximal pentylenetetrazol test in mice up to 540 mg/kg, the two screens through which most established anti-seizure drugs were found, while protecting potently in electrically and pentylenetetrazol-kindled mice (ED50 7 and 36 mg/kg). The safety margin between rotarod impairment and seizure suppression was 148 in corneally kindled mice, against 2 to 17 for existing drugs. Six years later Lynch and colleagues identified the brain binding site as the synaptic vesicle protein SV2A, showing that binding affinity across a series of analogues correlated with anti-seizure potency and that SV2A-knockout brain tissue showed no binding. The label still opens by stating the precise mechanism is unknown.',
        evidenceSource:
          'Klitgaard H et al., Eur J Pharmacol 1998;353:191-206; Lynch BA et al., Proc Natl Acad Sci USA 2004;101:9861-9866',
        doi: '10.1073/pnas.0308208101',
        inferredClaim:
          'That an anti-seizure drug inactive in the classical screening models cannot work in people, an inference the standard discovery pipeline encoded and this drug falsified',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a6',
        category: 'measured',
        title: 'Behavioural effects are common, quantified on the label, and dose-limiting',
        laymanSummary:
          'Irritability, anger and mood change are the signature problem with this drug. The label puts them at 13% of adults and 38% of children, against 6% and 19% on placebo.',
        technicalDetails:
          'The United States prescribing information reports that 13% of adults and 38% of paediatric patients aged 4 to 16 treated with immediate-release levetiracetam experienced non-psychotic behavioural symptoms (aggression, agitation, anger, anxiety, apathy, depersonalisation, depression, emotional lability, hostility, hyperkinesia, irritability, nervousness, neurosis, personality disorder) against 6% and 19% on placebo. Psychotic symptoms occurred in 1% of adults against 0.2% on placebo. In the extended-release trials, 7% of treated patients had irritability or aggression against 0% on placebo. Separately, the FDA pooled analysis of 199 placebo-controlled trials across the anti-seizure class found suicidal thinking or behaviour in 0.43% of 27,863 drug-treated patients against 0.24% of 16,029 on placebo, about one additional case per 530 patients treated.',
        evidenceSource:
          'KEPPRA and KEPPRA XR United States prescribing information, Warnings and Precautions 5.1 and 5.2 (Drugs@FDA NDA 021035 and NDA 022285)',
        measuredMetric:
          'Incidence of non-psychotic behavioural symptoms and psychotic symptoms against placebo in the registration trials',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a7',
        category: 'measured',
        title: 'Lowest malformation rate in the EURAP registry, tied with lamotrigine',
        laymanSummary:
          'Across 7,355 pregnancies in 42 countries, babies exposed to levetiracetam alone had a birth-defect rate of 2.8%, the lowest of the eight drugs studied, and inside the range reported for unexposed pregnancies.',
        technicalDetails:
          'The EURAP prospective registry followed pregnancies on anti-epileptic monotherapy at conception from 42 countries between 1999 and 2016. Major congenital malformation prevalence at one year was 17 of 599 (2.8%) for levetiracetam, 74 of 2,514 (2.9%) for lamotrigine, 10 of 333 (3.0%) for oxcarbazepine, 6 of 152 (3.9%) for topiramate, 107 of 1,957 (5.5%) for carbamazepine, 8 of 125 (6.4%) for phenytoin, 19 of 294 (6.5%) for phenobarbital and 142 of 1,381 (10.3%) for valproate. Valproate at 650 mg/day or less still carried an increased risk against levetiracetam at 250 to 4000 mg/day (OR 2.43, 95% CI 1.30 to 4.55, p=0.0069). The authors placed lamotrigine, levetiracetam and oxcarbazepine within the background range for unexposed offspring. This is a registry, not a randomised comparison, and it measures structural malformation at one year, not cognition at six.',
        evidenceSource: 'Tomson T et al., Lancet Neurol 2018;17:530-538 (EURAP registry)',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric: 'Prevalence of major congenital malformations at 1 year, by drug and dose',
        auditFlag: 'verified',
      },
      {
        id: 'lev-a8',
        category: 'failed',
        title: 'KOMET: not superior to carbamazepine or valproate, and slower to first seizure',
        laymanSummary:
          'A 1,688-patient trial run to show levetiracetam was better than the older standards as a first drug did not show it. On time to the first seizure the older drugs did better.',
        technicalDetails:
          'KOMET was an unblinded, randomised, 52-week superiority trial in 1,688 patients aged 16 and over with newly diagnosed epilepsy, randomised to levetiracetam (n=841) or a physician-chosen standard (extended-release valproate or controlled-release carbamazepine, n=847). Time to treatment withdrawal, the primary outcome, did not differ (HR 0.90, 95% CI 0.74 to 1.08). Time to first seizure was significantly longer on the standard drugs (HR 1.20, 95% CI 1.03 to 1.39). Estimated 12-month seizure freedom was 58.7% on levetiracetam against 64.5% on extended-release valproate, and 50.5% against 56.7% on controlled-release carbamazepine. The authors concluded levetiracetam was not superior for the global outcome.',
        evidenceSource: 'Trinka E et al., J Neurol Neurosurg Psychiatry 2013;84:1138-1147 (NCT00175903)',
        doi: '10.1136/jnnp-2011-300376',
        measuredMetric: 'Time to treatment withdrawal and time to first seizure over 52 weeks',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed almost completely, barely metabolised',
        laymanDesc:
          'The tablet is absorbed rapidly and nearly all of it reaches the blood. The liver does very little to it, which is why it rarely interferes with other medicines.',
        molecularDetail:
          'Oral bioavailability approaches 100% and is unaffected by food. Roughly two-thirds is excreted unchanged in the urine; the remainder is hydrolysed by a non-hepatic amidase to the inactive carboxylic acid metabolite ucb L057. No cytochrome P450 involvement and minimal plasma protein binding, so renal function rather than liver enzymes governs exposure.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into the brain and enters nerve endings',
        laymanDesc:
          'The molecule is small and passes into brain tissue, where it collects in the endings of nerve cells: the part that releases chemical messages to the next cell.',
        molecularDetail:
          'Rapid blood-brain barrier penetration with brain concentrations tracking plasma. The relevant compartment is the presynaptic terminal, where SV2A sits in the membrane of synaptic vesicles at roughly the same copy number as synaptophysin.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds SV2A from inside the vesicle',
        laymanDesc:
          'Its target sits on the inner face of the storage bubble, so the drug can only reach it when a bubble opens to release its contents and then closes again. Nerve endings that fire more often expose the target more often.',
        molecularDetail:
          'The levetiracetam binding site is on the luminal side of SV2A, requiring vesicle exocytosis and endocytosis for access. Binding is saturable and stereoselective; the inactive (R) enantiomer ucb L060 does not bind, and SV2A-knockout brain tissue shows no specific binding at all.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Release runs down during rapid firing',
        laymanDesc:
          'When a nerve ending fires slowly, almost nothing changes. When it fires in a fast burst, the amount of messenger released falls off faster than it normally would, so the burst does not build.',
        molecularDetail:
          'SV2A binding reduces vesicle release probability during sustained high-frequency trains, with little effect on single evoked responses. Proposed downstream effects include altered vesicle priming and reduced presynaptic calcium-dependent release; the exact step SV2A controls remains contested in the literature.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer seizures, in about a third to two-fifths of people who add it',
        laymanDesc:
          'The measured result is a lower seizure count. In the pivotal add-on trial, 33 to 40% of patients halved their seizures against 11% on placebo, and 11 of 199 became seizure-free.',
        molecularDetail:
          'Efficacy is established against placebo as adjunctive therapy in focal, myoclonic and primary generalised tonic-clonic seizures. Superiority to older first-line drugs has been tested three times (SANAD II focal, SANAD II generalised, KOMET) and shown in none of them.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cereghino pivotal add-on trial (levetiracetam 1000 and 3000 mg/day)',
        phase: 'Phase 3 randomised, double-blind, placebo-controlled',
        sampleSize: 294,
        primaryEndpoint:
          'Partial seizure frequency over the 18-week evaluation period, with responder rate as a key secondary',
        endpointMet: true,
        statisticalPValue:
          'P <= 0.001 for seizure frequency at both doses; responder rate 33.0% and 39.8% against 10.8% on placebo, P < 0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD II focal arm (ISRCTN30294119)',
        phase: 'Phase 4 open-label randomised non-inferiority trial',
        sampleSize: 990,
        primaryEndpoint:
          'Time to 12-month remission, levetiracetam versus lamotrigine, non-inferiority margin HR 1.329',
        endpointMet: false,
        statisticalPValue:
          'HR 1.18 (97.5% CI 0.95 to 1.47), non-inferiority not met; per-protocol HR 1.32 (1.05 to 1.66) favouring lamotrigine',
        unreportedAdverseSignals:
          'Adverse reactions were reported by 44% starting levetiracetam against 33% starting lamotrigine.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD II generalised and unclassifiable arm (ISRCTN30294119)',
        phase: 'Phase 4 open-label randomised non-inferiority trial',
        sampleSize: 520,
        primaryEndpoint:
          'Time to 12-month remission, levetiracetam versus valproate, non-inferiority margin HR 1.314',
        endpointMet: false,
        statisticalPValue: 'HR 1.19 (95% CI 0.96 to 1.47), non-inferiority not met',
        unreportedAdverseSignals:
          'Levetiracetam was dominated in the cost-utility analysis, with a 0.17 probability of cost-effectiveness at 20,000 pounds per QALY.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ESETT (NCT01960075)',
        phase: 'Blinded, response-adaptive randomised comparative-effectiveness trial',
        sampleSize: 384,
        primaryEndpoint:
          'Absence of clinically evident seizures with improved consciousness at 60 minutes, without additional anticonvulsant',
        endpointMet: true,
        statisticalPValue:
          '47% (95% credible interval 39 to 55) on levetiracetam against 45% fosphenytoin and 46% valproate; posterior probability of being most effective 0.41',
        unreportedAdverseSignals:
          'Numerically more deaths occurred in the levetiracetam group and more hypotension and intubation with fosphenytoin, neither difference significant. The trial stopped early for futility of separating the drugs.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'KOMET (NCT00175903)',
        phase: 'Phase 4 unblinded randomised superiority trial, 52 weeks',
        sampleSize: 1688,
        primaryEndpoint:
          'Time to treatment withdrawal, levetiracetam versus physician-chosen standard therapy',
        endpointMet: false,
        statisticalPValue:
          'HR 0.90 (95% CI 0.74 to 1.08) for withdrawal, not significant; time to first seizure favoured standard drugs, HR 1.20 (1.03 to 1.39)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Responder rates of 33.0% and 39.8% against 10.8% on placebo as adjunctive therapy in 294 patients with refractory partial seizures',
        'Seizure cessation with improved consciousness at 60 minutes in 47% of patients with benzodiazepine-refractory status epilepticus, statistically indistinguishable from fosphenytoin and valproate',
        'Non-psychotic behavioural symptoms in 13% of adults and 38% of children against 6% and 19% on placebo, per the United States label',
        'A 2.8% major congenital malformation rate across 599 monotherapy-exposed pregnancies in the EURAP registry, the lowest of eight drugs compared',
      ],
      unsupportedInferences: [
        'That levetiracetam is a first-line drug equal to lamotrigine in focal epilepsy: SANAD II tested exactly that and non-inferiority failed',
        'That it is an adequate replacement for valproate in generalised epilepsy on seizure control, rather than a safer drug that controls seizures less well',
        'That the SV2A binding story explains the clinical effect quantitatively, rather than correlating with it across a compound series',
        'That a low structural malformation rate in a registry implies normal neurodevelopment, which is a separate endpoint measured at a later age',
      ],
      whatFailedInitially: [
        'The two classical screening tests, maximal electroshock and maximal pentylenetetrazol, both showed no activity at doses up to 540 mg/kg; the drug survived because it was tested in kindling models as well',
        'KOMET, a 1,688-patient superiority trial against carbamazepine and valproate, showed no advantage on treatment withdrawal and a disadvantage on time to first seizure',
        'Both arms of SANAD II failed their pre-specified non-inferiority margins',
      ],
      realWorldOutcome: [
        'One of the most-prescribed anti-seizure medicines worldwide, largely on the strength of no drug interactions, no need for blood-level monitoring and an intravenous form',
        'About 11 US cents per unit at United States pharmacy acquisition cost, a median across 134 listed generic products',
        'The commonest documented reason for switching off it is behavioural rather than a failure of seizure control',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and solution, extended-release tablet, orally disintegrating printed tablet, and intravenous infusion',
      description:
        'The intravenous form matters more than the formulation list suggests: it can be given quickly, needs no cardiac monitoring, and is why levetiracetam entered emergency departments so widely before any head-to-head evidence existed. Renal clearance means exposure rises when kidney function falls.',
      safetyProfile:
        'The commonest problems are somnolence, asthenia, dizziness and infection. The distinctive one is behavioural: irritability, aggression and mood change at rates of 13% in adults and 38% in children in the registration trials. Psychotic symptoms occurred in 1% of adults. The class-wide suicidality warning applies. Rare but serious reactions include DRESS and anaphylaxis. There is no interaction burden with hormonal contraception or with warfarin.',
    },
    commonQuestions: [
      {
        q: 'Is levetiracetam the best first drug for newly diagnosed epilepsy?',
        a: 'Three randomised trials have asked, and none supported that. In the focal arm of SANAD II, 990 newly diagnosed patients were randomised between lamotrigine, levetiracetam and zonisamide, and levetiracetam failed to meet non-inferiority to lamotrigine for time to 12-month remission (HR 1.18, 97.5% CI 0.95 to 1.47); the per-protocol analysis put lamotrigine ahead. In the generalised arm, levetiracetam failed non-inferiority to valproate. In KOMET, 1,688 patients showed no advantage over carbamazepine or valproate and a longer time to first seizure on the older drugs. Levetiracetam is still prescribed first very often, and the reasons given are convenience, absence of interactions and pregnancy safety rather than seizure control.',
        auditNote:
          'This is the widest gap between what the evidence measured and what prescribing practice assumes on this page.',
      },
      {
        q: 'Why does the label say the mechanism is unknown when everyone says it is SV2A?',
        a: 'Because the two statements answer different questions. SV2A is where the drug binds; that was established by Lynch and colleagues in 2004 through a rank-order correlation between binding affinity and anti-seizure potency across a series of analogues, plus the absence of binding in SV2A-knockout brain tissue. What is still not established is the causal chain from that binding to a suppressed seizure in a person. The label reflects that gap and has not been rewritten to close it.',
      },
      {
        q: 'Are the mood and anger side effects real, or is that the epilepsy?',
        a: 'They are quantified against placebo in the registration trials, which is what separates a drug effect from a disease effect. The label records non-psychotic behavioural symptoms in 13% of adults and 38% of children aged 4 to 16, against 6% and 19% respectively on placebo. Psychotic symptoms occurred in 1% of adults against 0.2%. The effect is large enough that it is the usual reason this drug gets changed, and brivaracetam, which binds the same target, exists partly as a response to it.',
        auditNote:
          'A placebo-controlled rate is the strongest form this claim can take, and the label reports one.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'On the endpoint that has been measured, it looks among the safest of its class. In the EURAP registry, 17 of 599 pregnancies exposed to levetiracetam monotherapy ended in a major congenital malformation, a rate of 2.8%, the lowest of the eight drugs compared and within the range reported for unexposed pregnancies. Two limits apply. EURAP is a prospective registry, not a randomised trial, so drug choice was not random. And structural malformation at one year is a different endpoint from cognitive development at six, which is where valproate does its worst damage and where the levetiracetam data are thinner. The SANAD II generalised arm is the other half of this question: the drug most often chosen to avoid valproate did not control generalised seizures as well as valproate did.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for levetiracetam could be verified and cited. The published literature on essential-medicine production costs holds its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 11 US cents per unit as a median across 134 listed generic products. That is what a pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cereghino JJ et al. Levetiracetam for partial seizures: results of a double-blind, randomized clinical trial. Neurology 2000;55:236-242',
        identifier: '10.1212/wnl.55.2.236',
        kind: 'doi',
      },
      SANAD_II_FOCAL_SOURCE,
      SANAD_II_GENERALISED_SOURCE,
      {
        label:
          'Kapur J et al. Randomized Trial of Three Anticonvulsant Medications for Status Epilepticus (ESETT). N Engl J Med 2019;381:2103-2113',
        identifier: '10.1056/NEJMoa1905795',
        kind: 'doi',
      },
      {
        label: 'ESETT: Established Status Epilepticus Treatment Trial',
        identifier: 'NCT01960075',
        kind: 'nct',
      },
      {
        label:
          'Trinka E et al. KOMET: an unblinded, randomised, two parallel-group, stratified trial comparing the effectiveness of levetiracetam with controlled-release carbamazepine and extended-release sodium valproate as monotherapy in patients with newly diagnosed epilepsy. J Neurol Neurosurg Psychiatry 2013;84:1138-1147',
        identifier: '10.1136/jnnp-2011-300376',
        kind: 'doi',
      },
      { label: 'KOMET monotherapy trial registration', identifier: 'NCT00175903', kind: 'nct' },
      {
        label:
          'Lynch BA et al. The synaptic vesicle protein SV2A is the binding site for the antiepileptic drug levetiracetam. Proc Natl Acad Sci USA 2004;101:9861-9866',
        identifier: '10.1073/pnas.0308208101',
        kind: 'doi',
      },
      {
        label:
          'Klitgaard H et al. Evidence for a unique profile of levetiracetam in rodent models of seizures and epilepsy. Eur J Pharmacol 1998;353:191-206',
        identifier: '10.1016/s0014-2999(98)00410-5',
        kind: 'doi',
      },
      EURAP_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label:
          'Drugs@FDA: KEPPRA (levetiracetam), NDA 021035, original approval 30 November 1999; KEPPRA XR, NDA 022285, 12 September 2008',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021035',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5284583 — levetiracetam structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284583',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Lamotrigine — the drug that won SANAD twice and carries a warning built from a dish.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lamotrigine',
    name: 'Lamotrigine',
    tradeName: 'Lamictal',
    sponsor: 'GlaxoSmithKline LLC (originator); now off-patent with generics from many manufacturers',
    targetGene: 'SCN2A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits, bound preferentially in the inactivated state, with downstream reduction of presynaptic glutamate release',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1994,
    indication:
      'Adjunctive therapy for partial-onset seizures, primary generalised tonic-clonic seizures and generalised seizures of Lennox-Gastaut syndrome from age 2; conversion to monotherapy in partial-onset seizures from age 16; maintenance treatment of bipolar I disorder to delay the time to occurrence of mood episodes',
    patientFriendlyIndication:
      'Epilepsy, including seizures that start in one part of the brain, and long-term mood stabilisation in bipolar I disorder',
    anatomicalSite: 'Axonal and presynaptic membrane of cortical neurons (voltage-gated sodium channels)',
    conditionContext: {
      conditionExplainer:
        'Seizures spread when neurons fire in fast repetitive trains and recruit their neighbours. Sodium channels are what let a neuron fire that fast; slowing their recovery makes a long train harder to sustain without silencing normal single firing.',
      whyItMatters:
        'A first drug is chosen once and often taken for decades. The two outcomes that matter over that horizon are whether seizures stop and whether the person stays on the drug, and those are not the same measurement.',
      whoTakesThis:
        'One of the two most commonly chosen first drugs for focal epilepsy in the United Kingdom and much of Europe, and a maintenance drug in bipolar I disorder. It is also the anti-seizure drug most often chosen in pregnancy.',
      clinicalGoals:
        'In epilepsy, 12-month seizure freedom on a drug the person can keep taking. In bipolar I disorder, a longer interval before the next mood episode, particularly a depressive one.',
    },
    oneSentenceVerdict:
      'A sodium-channel blocker that beat carbamazepine on time to treatment failure in 1,721 patients in SANAD and beat both levetiracetam and zonisamide on per-protocol 12-month remission in SANAD II, at the cost of a boxed warning for serious rash occurring in about 3 adults and 8 children per 1,000.',
    laymanHowItWorks:
      'Nerve cells fire by briefly opening sodium channels. Lamotrigine sticks to those channels once they have already fired and are resting, so a cell that is firing over and over recovers more slowly. Ordinary single signals get through; the rapid repetitive bursts that make up a seizure do not build as easily. Less of the excitatory messenger glutamate is released as a result.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1612 per unit, the median across 181 listed lamotrigine products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Developed at Wellcome and approved in the United States in December 1994 under NDA 020241. Composition-of-matter protection has long expired and the tablet is manufactured generically worldwide; the extended-release (NDA 022115) and orally disintegrating (NDA 022251) forms were approved in 2009 and remain separately branded.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Lamotrigine is the reference arm every recent first-line trial has been built around, and it has beaten carbamazepine, gabapentin, topiramate, levetiracetam and zonisamide on the outcome those trials chose. It has lost on one: in SANAD, carbamazepine achieved 12-month remission slightly sooner, and the win was on treatment failure rather than on seizure freedom.',
      conventionalRx: [
        {
          name: 'Carbamazepine (Tegretol)',
          class: 'Sodium channel blocker, enzyme inducer',
          howItCompares:
            'In SANAD arm A, lamotrigine was better than carbamazepine for time to treatment failure (HR 0.78, 95% CI 0.63 to 0.97) across 1,721 patients. For time to 12-month remission the estimate ran the other way and did not reach significance (HR 0.91, 0.77 to 1.09). Carbamazepine induces liver enzymes and interacts with many drugs; lamotrigine does not.',
          typicalCost:
            'US$0.3776 per unit, median across 92 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: at least as good at producing remission, and unmatched in trigeminal neuralgia. Cons: enzyme induction, hyponatraemia, and a 5.5% malformation rate in EURAP against 2.9% for lamotrigine.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand',
          howItCompares:
            'Tested directly against lamotrigine in SANAD II and failed non-inferiority for time to 12-month remission (HR 1.18, 97.5% CI 0.95 to 1.47); the per-protocol analysis put lamotrigine ahead (HR 1.32, 1.05 to 1.66). Adverse reactions were reported by 44% starting levetiracetam against 33% starting lamotrigine.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no titration delay, so it can be started at an effective dose immediately, and it has an intravenous form. Cons: lost the head-to-head trial, and behavioural effects in 13% of adults.',
        },
        {
          name: 'Valproate (Depakote, Epilim)',
          class: 'Broad-spectrum, multiple mechanisms',
          howItCompares:
            'In the generalised arm of SANAD, valproate was better than lamotrigine for time to 12-month remission overall (HR 0.76, 95% CI 0.62 to 0.94) and in idiopathic generalised epilepsy (0.68, 0.53 to 0.89). In focal epilepsy the comparison does not arise; lamotrigine is the drug people move to when valproate is unsafe.',
          typicalCost:
            'Off-patent; listed in the CMS NADAC file as divalproex sodium and valproic acid products',
          prosAndCons:
            'Pros: the most effective option in idiopathic generalised epilepsy. Cons: a 10.3% malformation rate and a dose-dependent IQ reduction in exposed children, which is the entire reason lamotrigine is used instead.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel away from glucose, with downstream effects on GABA synthesis and adenosine signalling. It shares no mechanism with sodium-channel blockade and is used alongside drugs, not instead of them.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Photograph any new rash and call the same day',
          action:
            'If a rash appears in the first two months, take a photograph, note the date, and contact the prescriber that day rather than waiting for the next appointment.',
          patientImpact:
            'Nearly all life-threatening rashes on this drug appear within 2 to 8 weeks of starting. The label records serious rash requiring hospitalisation in 0.3% of adults and 0.8% of children aged 2 to 16 on adjunctive therapy, with one rash-related death in a prospectively followed cohort of 1,983 children.',
          clinicalPrecaution:
            'Three expert dermatologists reviewing 14 of those paediatric cases disagreed sharply about which were Stevens-Johnson syndrome, so the classification is not something to attempt at home. A rash that is clearly unrelated still needs the prescriber to say so.',
        },
        {
          name: 'Say you take lamotrigine before any new medicine is added',
          action:
            'Tell every prescriber and pharmacist, including for a short course of something unrelated, that lamotrigine is on your list.',
          patientImpact:
            'Valproate roughly doubles lamotrigine exposure by blocking its glucuronidation, and the label records serious rash in 1.2% of children taking both against 0.6% of those on lamotrigine without it. Oestrogen-containing contraceptives and pregnancy push the level the other way.',
          clinicalPrecaution:
            'This is an interaction to flag, not one to manage yourself. Any change in the amount taken is a prescriber decision.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=C(C(=C1)Cl)Cl)C2=C(N=C(N=N2)N)N',
      chemicalFormula: 'C9H7Cl2N5',
      molecularWeight: '256.09 g/mol',
      targetReceptorAffinity:
        'No single quoted dissociation constant applies. Binding to the voltage-gated sodium channel is state-dependent: affinity for the inactivated state is orders of magnitude higher than for the resting state, so potency rises with how often the channel has recently opened. The label still states the precise anticonvulsant mechanism is unknown and calls the sodium channel effect a proposed one.',
      structureSource: {
        label: 'PubChem CID 3878 (lamotrigine) — canonical SMILES, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3878',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ltg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of 2,3-dichlorobenzoyl chloride',
          description:
            'Confirm the isomeric purity of the dichlorinated benzoyl starting material before condensation. The 2,3-dichloro substitution pattern is what distinguishes lamotrigine from inactive positional isomers, and an isomeric impurity introduced here cannot be removed by any later step without discarding yield.',
          reagentsAndBuffer:
            '2,3-dichlorobenzoyl chloride reference standard, gas chromatography with flame ionisation detection, proton nuclear magnetic resonance in deuterated chloroform, Karl Fischer titration',
        },
        {
          id: 'ltg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Cyanide displacement and cyclisation to the 1,2,4-triazine',
          description:
            'Form the 2,3-dichlorophenyl glyoxylonitrile intermediate, then condense with aminoguanidine and cyclise under acid to close the 3,5-diamino-1,2,4-triazine ring. The triazine ring, not the aryl group, is what the sodium channel recognises.',
          dependsOnStepId: 'ltg-w1',
          reagentsAndBuffer:
            'Aminoguanidine bicarbonate, cuprous cyanide or an equivalent cyanide source, methanesulfonic acid or dilute sulfuric acid for cyclisation, propan-2-ol as solvent, nitrogen blanket',
        },
        {
          id: 'ltg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and related-substances assay',
          description:
            'Recrystallise from aqueous alcohol and assay against the pharmacopoeial related-substances specification. The impurities named in the monograph are the positional isomers and the uncyclised hydrazone intermediate.',
          dependsOnStepId: 'ltg-w2',
          reagentsAndBuffer:
            'Ethanol and purified water, activated charcoal, reversed-phase HPLC with phosphate buffer and acetonitrile, UV detection at 210 nm and 306 nm',
        },
        {
          id: 'ltg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Application to cultured cortical neurons under sustained depolarisation',
          description:
            'Apply the compound to cultured cortical neurons and hold the membrane at a depolarised potential so a large fraction of sodium channels sit in the inactivated state. Because binding is state-dependent, testing at a resting potential understates potency by orders of magnitude, and a protocol that skips this step will report a drug that does almost nothing.',
          dependsOnStepId: 'ltg-w3',
          reagentsAndBuffer:
            'Primary rat cortical cultures, extracellular solution with 140 mM sodium chloride, caesium fluoride internal solution, holding potentials of -120 mV and -60 mV compared in the same cell',
        },
        {
          id: 'ltg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Sustained repetitive firing and glutamate release readout',
          description:
            'Count action potentials in a prolonged depolarising train, and in parallel measure veratridine-evoked glutamate release from synaptosomes. The firing count is the direct channel effect; the glutamate number is the synaptic consequence the label describes as modulating presynaptic transmitter release.',
          dependsOnStepId: 'ltg-w4',
          reagentsAndBuffer:
            'Whole-cell current clamp with 500 ms depolarising steps, rat cortical synaptosome preparation, veratridine as sodium channel opener, enzymatic glutamate dehydrogenase fluorimetric assay with NADP+',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ltg-a1',
        category: 'measured',
        title: 'SANAD: better than carbamazepine on treatment failure across 1,721 patients',
        laymanSummary:
          'In the largest head-to-head trial of first drugs for focal epilepsy, patients on lamotrigine were less likely to stop the drug, for any reason, than patients on carbamazepine, gabapentin or topiramate.',
        technicalDetails:
          'SANAD arm A was an unblinded randomised trial in UK outpatient clinics that assigned 1,721 patients for whom carbamazepine was standard treatment to carbamazepine, gabapentin, lamotrigine, oxcarbazepine or topiramate. For time to treatment failure, lamotrigine was significantly better than carbamazepine (HR 0.78, 95% CI 0.63 to 0.97), gabapentin (0.65, 0.52 to 0.80) and topiramate (0.64, 0.52 to 0.79), with a non-significant advantage over oxcarbazepine (1.15, 0.86 to 1.54). The per-protocol difference in the proportion achieving 12-month remission at 2 and 4 years was 0 (-8 to 7) and 5 (-3 to 12) percentage points, which the authors read as non-inferiority.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1000-1015 (ISRCTN38354748)',
        doi: '10.1016/S0140-6736(07)60460-7',
        measuredMetric: 'Time to treatment failure for any reason',
        auditFlag: 'verified',
      },
      {
        id: 'ltg-a2',
        category: 'inferred',
        title: 'Winning on treatment failure is not the same measurement as stopping seizures',
        laymanSummary:
          'Lamotrigine won SANAD on how long people stayed on it. On how quickly people became seizure-free for a year, carbamazepine was slightly ahead, though not significantly so.',
        technicalDetails:
          'In the same trial, for time to 12-month remission carbamazepine was significantly better than gabapentin (HR 0.75, 95% CI 0.63 to 0.90), and held non-significant advantages over lamotrigine (0.91, 0.77 to 1.09), topiramate (0.86, 0.72 to 1.03) and oxcarbazepine (0.92, 0.73 to 1.18). Time to treatment failure is a composite of inadequate seizure control and unacceptable adverse effects, so a drug can win it by being better tolerated while controlling seizures no better. The authors framed the conclusion in exactly those terms: lamotrigine is clinically better for treatment-failure outcomes and is therefore a cost-effective alternative.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1000-1015',
        doi: '10.1016/S0140-6736(07)60460-7',
        inferredClaim:
          'That lamotrigine controls focal seizures better than carbamazepine, when what the trial showed is that fewer people stop taking it',
        auditFlag: 'caution',
      },
      {
        id: 'ltg-a3',
        category: 'measured',
        title: 'SANAD II: beat both newer comparators on per-protocol remission and on cost',
        laymanSummary:
          'Fourteen years later the same group tested lamotrigine against levetiracetam and zonisamide in 990 newly diagnosed patients. Neither newer drug matched it, and lamotrigine caused fewer adverse reactions than either.',
        technicalDetails:
          'SANAD II randomised 990 participants aged 5 and over 1:1:1 to lamotrigine (n=330), levetiracetam (n=332) or zonisamide (n=328), with a non-inferiority limit of HR 1.329 for time to 12-month remission. Levetiracetam failed non-inferiority (HR 1.18, 97.5% CI 0.95 to 1.47); zonisamide met it (1.03, 0.83 to 1.28). The per-protocol analysis showed 12-month remission superior with lamotrigine over both levetiracetam (HR 1.32, 1.05 to 1.66) and zonisamide (1.37, 1.08 to 1.73). Adverse reactions were reported by 33% starting lamotrigine, 44% starting levetiracetam and 45% starting zonisamide. Net health benefit was 1.403 QALYs for lamotrigine against 1.222 and 1.232.',
        evidenceSource: 'Marson A et al., Lancet 2021;397:1363-1374 (ISRCTN30294119)',
        doi: '10.1016/S0140-6736(21)00247-6',
        measuredMetric:
          'Time to 12-month remission, intention-to-treat and per-protocol, plus adverse-reaction rate and QALYs',
        auditFlag: 'verified',
      },
      {
        id: 'ltg-a4',
        category: 'failed',
        title: 'The boxed warning: serious rash in 3 adults and 8 children per 1,000',
        laymanSummary:
          'The reason lamotrigine has to be started slowly is a rash that can strip skin. It sent about 8 in 1,000 treated children to hospital, and one child in a cohort of 1,983 died of it.',
        technicalDetails:
          'The United States label carries a boxed warning for serious skin rashes requiring hospitalisation and discontinuation. Incidence is approximately 0.8% (8 per 1,000) in paediatric patients aged 2 to 16 on adjunctive therapy and 0.3% (3 per 1,000) in adults on adjunctive therapy. In a prospectively followed cohort of 1,983 children, 16 serious rashes occurred and there was 1 rash-related death; when 14 of those cases were reviewed by three expert dermatologists, one classified none as Stevens-Johnson syndrome and another classified 7 of 14 as such. Concomitant valproate raised the paediatric rate to 1.2% (6 of 482) against 0.6% (6 of 952) without it. Nearly all life-threatening rashes occurred within 2 to 8 weeks. The presence of HLA-B*1502 is listed as a risk factor.',
        evidenceSource:
          'LAMICTAL and LAMICTAL XR United States prescribing information, Boxed Warning and Warnings and Precautions 5.1 (Drugs@FDA NDA 020241, NDA 022115)',
        measuredMetric:
          'Incidence of serious rash requiring hospitalisation, by age group and by valproate co-therapy',
        auditFlag: 'caution',
      },
      {
        id: 'ltg-a5',
        category: 'inferred',
        title: 'The cardiac arrhythmia warning was built from in vitro data, and the clinical data do not support it',
        laymanSummary:
          'In 2020 the FDA added a warning that lamotrigine could cause dangerous heart rhythms in people with heart disease. It was based on cell experiments. Two later studies in real patients found no such effect.',
        technicalDetails:
          'The label states that "based on in vitro findings" lamotrigine could cause serious arrhythmias or death in patients with certain underlying cardiac disorders. A retrospective Medicare cohort of individuals aged 65 and over with epilepsy compared 11,786 new lamotrigine users with 147,130 new levetiracetam users using inverse probability of treatment weighting; incidence of inpatient or emergency ventricular arrhythmia or sudden cardiac arrest was 7.0 against 8.2 per 1,000 person-years (HR 0.84, 95% CI 0.67 to 1.06), with significantly reduced risk in the subgroups with baseline arrhythmia (0.51, 0.32 to 0.80) or antiarrhythmic use (0.67, 0.50 to 0.91). A separate within-person study of 237 people with an ECG both on and off lamotrigine found a mean 3.1% increase in PR interval with no increase in the prevalence of pathological PR, QRS or QTc prolongation, in people with and without heart disease. The label has not been revised.',
        evidenceSource:
          'Ho GYF et al., Neurology 2025;105:e213643; Ryan JM et al., Epilepsia 2026;67:2201-2213; LAMICTAL XR prescribing information, Warnings and Precautions 5.4',
        doi: '10.1212/WNL.0000000000213643',
        inferredClaim:
          'That an in vitro sodium-channel effect on cardiomyocytes predicts clinical arrhythmia in patients, an extrapolation two subsequent clinical datasets did not reproduce',
        auditFlag: 'contested',
      },
      {
        id: 'ltg-a6',
        category: 'measured',
        title: 'Bipolar maintenance: 197 days to the next mood episode against 86 on placebo',
        laymanSummary:
          'In two trials pooled together, patients stabilised after a manic or depressive episode were kept on lamotrigine, lithium or placebo for 18 months. Time until the next episode needed treating more than doubled on lamotrigine.',
        technicalDetails:
          'Two prospectively harmonised 18-month trials enrolled 1,315 patients with bipolar I disorder in an open-label phase; 638 were stabilised and randomised to lamotrigine (n=280), lithium (n=167) or placebo (n=191). Median time from randomisation to intervention for any mood episode was 86 days on placebo (95% CI 58 to 121), 184 days on lithium (119 to not calculable) and 197 days on lamotrigine (144 to 388). Lamotrigine was superior to placebo for time to intervention for depression; lithium and lamotrigine were both superior for mania, but after adjustment for index mood only lithium remained superior for mania. Lithium produced more diarrhoea (19% against 7%) and tremor (15% against 4%). Neither drug caused affective switch.',
        evidenceSource: 'Goodwin GM et al., J Clin Psychiatry 2004;65:432-441',
        doi: '10.4088/jcp.v65n0321',
        measuredMetric: 'Median time from randomisation to intervention for any mood episode over 18 months',
        auditFlag: 'verified',
      },
      {
        id: 'ltg-a7',
        category: 'conclusion_shift',
        title: 'For acute bipolar depression the effect is confined to the severely depressed',
        laymanSummary:
          'Lamotrigine is often described as an antidepressant for bipolar disorder. Pooling the raw data from all five trials shows the benefit is real only in people who were severely depressed at the start, and absent in everyone else.',
        technicalDetails:
          'An independent meta-analysis of individual patient data from 1,072 participants across five randomised placebo-controlled trials found more responders on lamotrigine on both the Hamilton scale (RR 1.27, 95% CI 1.09 to 1.47, p=0.002) and the Montgomery-Asberg scale (RR 1.22, 1.06 to 1.41, p=0.005). A significant interaction by baseline severity (p=0.04) showed superiority confined to participants with a Hamilton score above 24 (RR 1.47, 1.16 to 1.87, p=0.001), with no separation from placebo at scores of 24 or below (RR 1.07, 0.90 to 1.27, p=0.445). The United States approval is for maintenance treatment to delay mood episodes, not for treatment of an acute depressive episode.',
        evidenceSource: 'Geddes JR, Calabrese JR, Goodwin GM, Br J Psychiatry 2009;194:4-9',
        doi: '10.1192/bjp.bp.107.048504',
        inferredClaim:
          'That lamotrigine treats bipolar depressive episodes generally, when the pooled individual-patient data localise the effect to the severe end and the licence covers maintenance only',
        auditFlag: 'contested',
      },
      {
        id: 'ltg-a8',
        category: 'measured',
        title: 'The pregnancy data are the best of any effective anti-seizure drug',
        laymanSummary:
          'Across 2,514 pregnancies exposed to lamotrigine alone, the birth-defect rate was 2.9%, inside the range reported for unexposed pregnancies. Children exposed in the womb had a mean IQ of 108 at age 6.',
        technicalDetails:
          'In the EURAP prospective registry covering 42 countries, major congenital malformation prevalence at one year was 74 of 2,514 (2.9%) for lamotrigine monotherapy, against 10.3% for valproate and 5.5% for carbamazepine; prevalence rose with dose at conception for lamotrigine (p=0.0145), and the reference category throughout was lamotrigine at 325 mg/day or less. In the separate NEAD prospective study, adjusted IQ at 6 years was 108 (95% CI 105 to 110) after lamotrigine exposure against 97 (94 to 101) after valproate (p=0.0003). Both are observational: drug choice was not randomised, and the lamotrigine group differed from the valproate group in seizure type as well as in treatment.',
        evidenceSource:
          'Tomson T et al., Lancet Neurol 2018;17:530-538 (EURAP); Meador KJ et al., Lancet Neurol 2013;12:244-252 (NEAD, NCT00021866)',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric:
          'Major congenital malformation prevalence at 1 year, and adjusted IQ at 6 years, by drug',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely and cleared by a sugar-attaching enzyme',
        laymanDesc:
          'Nearly all of a swallowed tablet reaches the blood. The liver disposes of it by sticking a sugar group on, which is a different route from the one most other epilepsy drugs use.',
        molecularDetail:
          'Oral bioavailability about 98%, unaffected by food, with roughly 55% plasma protein binding. Elimination is by glucuronidation, principally UGT1A4, to the inactive 2-N-glucuronide. Valproate inhibits that enzyme and roughly doubles exposure; carbamazepine, phenytoin, rifampicin and oestrogen-containing contraceptives induce it and roughly halve exposure.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the axon membrane of cortical neurons',
        laymanDesc:
          'The molecule crosses into brain tissue and settles where nerve cells generate their electrical signals, along the fibre that carries the signal onward.',
        molecularDetail:
          'Lipophilic enough for rapid blood-brain barrier passage. The relevant compartment is the axonal and presynaptic membrane, where voltage-gated sodium channel alpha subunits cluster at densities high enough to sustain repetitive firing.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds sodium channels that have just fired',
        laymanDesc:
          'The drug prefers channels in their spent, inactivated state over resting ones. A neuron firing at ordinary rates keeps most of its channels resting; a neuron firing in a seizure does not.',
        molecularDetail:
          'State-dependent binding to the inactivated conformation of the channel prolongs recovery from inactivation. The result is use-dependent and voltage-dependent block: potency rises steeply with depolarisation and with firing frequency, which is why the effect is selective for pathological activity rather than a general dampening.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Repetitive firing collapses and less glutamate is released',
        laymanDesc:
          'A long burst of firing runs out of available channels and stops. Because the burst is what drives release of the brain excitatory messenger, less of that messenger comes out.',
        molecularDetail:
          'Sustained repetitive firing is suppressed at concentrations that leave single action potentials intact. Downstream, presynaptic release of glutamate and aspartate falls, measurable as reduced veratridine-evoked release from cortical synaptosomes. The label describes this as one proposed mechanism whose relevance in humans remains to be established.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer seizures, and in bipolar I disorder a longer gap before the next episode',
        laymanDesc:
          'In epilepsy the measured result is 12-month seizure freedom, achieved by more people than on levetiracetam or zonisamide. In bipolar I disorder it is 197 days to the next mood episode against 86 on placebo.',
        molecularDetail:
          'The mood-stabilising effect has no established mechanistic account. The bipolar licence is for maintenance to delay mood episodes; efficacy in an acute depressive episode is confined to the severely depressed in pooled individual-patient data.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SANAD arm A (ISRCTN38354748)',
        phase: 'Unblinded randomised controlled trial, five arms',
        sampleSize: 1721,
        primaryEndpoint: 'Time to treatment failure and time to 12-month remission',
        endpointMet: true,
        statisticalPValue:
          'Time to treatment failure HR 0.78 (95% CI 0.63 to 0.97) versus carbamazepine, 0.65 (0.52 to 0.80) versus gabapentin, 0.64 (0.52 to 0.79) versus topiramate',
        unreportedAdverseSignals:
          'On the co-primary outcome of time to 12-month remission, carbamazepine held a non-significant advantage over lamotrigine (HR 0.91, 0.77 to 1.09). The headline is from the other endpoint.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD II focal arm (ISRCTN30294119)',
        phase: 'Phase 4 open-label randomised non-inferiority trial',
        sampleSize: 990,
        primaryEndpoint: 'Time to 12-month remission against levetiracetam and zonisamide',
        endpointMet: true,
        statisticalPValue:
          'Per-protocol HR 1.32 (97.5% CI 1.05 to 1.66) versus levetiracetam and 1.37 (1.08 to 1.73) versus zonisamide, both favouring lamotrigine',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled lamotrigine and lithium bipolar I maintenance trials',
        phase: 'Two prospectively harmonised 18-month randomised placebo-controlled trials',
        sampleSize: 638,
        primaryEndpoint: 'Time from randomisation to intervention for a mood episode',
        endpointMet: true,
        statisticalPValue:
          'Median 197 days on lamotrigine (95% CI 144 to 388) against 86 days on placebo (58 to 121) and 184 days on lithium',
        unreportedAdverseSignals:
          'After adjustment for index mood, only lithium remained superior to placebo for intervention for mania.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Pooled individual patient data, five acute bipolar depression trials',
        phase: 'Independent meta-analysis of randomised placebo-controlled trials',
        sampleSize: 1072,
        primaryEndpoint: 'Response on the Hamilton and Montgomery-Asberg depression rating scales',
        endpointMet: true,
        statisticalPValue:
          'HRSD response RR 1.27 (95% CI 1.09 to 1.47, p=0.002); interaction by severity p=0.04, with RR 1.07 (0.90 to 1.27, p=0.445) at HRSD 24 or below',
        unreportedAdverseSignals:
          'The individual trials were largely negative on their own primary endpoints; the effect appears only on pooling, and only at the severe end.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Medicare ventricular arrhythmia cohort, lamotrigine versus levetiracetam',
        phase: 'Retrospective propensity-weighted cohort study, 2007-2019',
        sampleSize: 158916,
        primaryEndpoint:
          'Inpatient or emergency ventricular arrhythmia or sudden cardiac arrest in new users aged 65 and over',
        endpointMet: false,
        statisticalPValue:
          'HR 0.84 (95% CI 0.67 to 1.06); 7.0 versus 8.2 events per 1,000 person-years',
        unreportedAdverseSignals:
          '`endpointMet: false` here means the hypothesised harm was not found. Risk was significantly lower on lamotrigine in the subgroups with baseline arrhythmia and with antiarrhythmic use.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Time to treatment failure better than carbamazepine (HR 0.78, 0.63 to 0.97), gabapentin and topiramate across 1,721 randomised patients',
        'Per-protocol 12-month remission superior to both levetiracetam and zonisamide in 990 newly diagnosed patients, with the lowest adverse-reaction rate of the three arms',
        'Serious rash requiring hospitalisation in 0.3% of adults and 0.8% of children on adjunctive therapy, with one rash-related death in a cohort of 1,983 children',
        'Median 197 days to intervention for a mood episode in bipolar I maintenance against 86 days on placebo',
        'A 2.9% major congenital malformation rate across 2,514 monotherapy pregnancies, and a mean IQ of 108 at age 6 in exposed children',
      ],
      unsupportedInferences: [
        'That lamotrigine stops focal seizures better than carbamazepine: it won on treatment failure, and carbamazepine held a non-significant edge on 12-month remission',
        'That the in vitro cardiac sodium-channel effect translates into clinical arrhythmia, which two subsequent clinical datasets did not find',
        'That lamotrigine treats acute bipolar depression generally, when the pooled effect is confined to baseline Hamilton scores above 24',
        'That a low malformation rate in a registry proves safety, when drug choice in EURAP and NEAD was not randomised',
      ],
      whatFailedInitially: [
        'Four of the five individual acute bipolar depression trials did not meet their own primary endpoints; the effect emerged only in pooled individual patient data',
        'The rash risk forced a slow introduction schedule that remains the drug practical limitation, and made co-prescription with valproate a documented hazard',
        'The 2020 FDA cardiac label change was made on in vitro evidence and has not been revised despite two clinical datasets pointing the other way',
      ],
      realWorldOutcome: [
        'The reference arm in every recent first-line epilepsy trial, and the drug SANAD II concluded should be the standard treatment in future trials',
        'About 16 US cents per unit at United States pharmacy acquisition cost, a median across 181 listed generic products',
        'The anti-seizure medicine most often continued through pregnancy, on the strength of the EURAP and NEAD numbers rather than a randomised comparison',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, chewable dispersible tablet, orally disintegrating tablet and extended-release tablet',
      description:
        'There is no intravenous form, and the drug cannot be brought to an effective level quickly, because the rash risk rises with how fast the dose is escalated. That single constraint explains most of where lamotrigine is and is not used: it is a drug for planned long-term treatment, not for an emergency.',
      safetyProfile:
        'A boxed warning for serious skin rashes, including Stevens-Johnson syndrome, at roughly 0.3% in adults and 0.8% in children on adjunctive therapy. Other labelled risks are haemophagocytic lymphohistiocytosis, DRESS, blood dyscrasias, aseptic meningitis, the class suicidality warning, and cardiac rhythm and conduction abnormalities based on in vitro findings. The label also warns about medication errors from product name confusion. Common effects are dizziness, headache, diplopia, ataxia and nausea.',
    },
    commonQuestions: [
      {
        q: 'Why does this drug have to be started so slowly?',
        a: 'Because of the rash. The label carries a boxed warning for serious skin rashes requiring hospitalisation, at approximately 0.3% in adults and 0.8% in children aged 2 to 16 on adjunctive therapy, and nearly all life-threatening cases appear within 2 to 8 weeks of starting. Two of the four listed risk factors are exceeding the recommended starting dose and exceeding the recommended escalation rate. Taking valproate at the same time is a third: serious rash occurred in 1.2% of children on both drugs against 0.6% on lamotrigine without valproate. The escalation schedule is a prescriber decision and is not described on this page.',
        auditNote:
          'The rate is a labelled, prospectively collected number, which is unusual for a rash warning. The classification of individual cases is much less certain: three dermatologists reviewing 14 paediatric cases ranged from 0 to 7 in how many they called Stevens-Johnson syndrome.',
      },
      {
        q: 'Is lamotrigine dangerous for my heart?',
        a: 'The label says it could be, in people with existing heart disease, and states the basis for that in the same sentence: in vitro findings. Two clinical datasets have since looked. A Medicare cohort compared 11,786 new lamotrigine users with 147,130 new levetiracetam users aged 65 and over and found ventricular arrhythmia or sudden cardiac arrest at 7.0 against 8.2 per 1,000 person-years (HR 0.84, 95% CI 0.67 to 1.06), with lower risk on lamotrigine in the subgroup that already had an arrhythmia. A within-person study of 237 people with ECGs on and off the drug found the PR interval about 3.1% longer, with no increase in the prevalence of any pathological ECG finding. The label has not been changed. This is a live disagreement between a regulator and the published clinical evidence, and both sides of it are on this page.',
      },
      {
        q: 'Is lamotrigine an antidepressant for bipolar disorder?',
        a: 'It is licensed as a maintenance treatment to delay the next mood episode, not as a treatment for a depressive episode in progress. The pooled maintenance data are strong: 197 days to intervention for a mood episode against 86 on placebo across 638 randomised patients. The acute-depression data are weaker than the reputation. An independent meta-analysis of individual patient data from all five randomised trials, 1,072 participants, found an overall response relative risk of 1.27, but with a significant interaction by severity: 1.47 in those with a Hamilton score above 24, and 1.07 with a confidence interval crossing 1 in everyone else.',
      },
      {
        q: 'Is it the safest epilepsy drug to take in pregnancy?',
        a: 'On the two endpoints that have been measured across enough pregnancies to compare, lamotrigine and levetiracetam sit at the bottom of the risk ordering. EURAP recorded major congenital malformations in 2.9% of 2,514 lamotrigine monotherapy pregnancies and 2.8% of 599 levetiracetam pregnancies, against 10.3% for valproate. The NEAD study measured IQ at age 6 and found 108 after lamotrigine against 97 after valproate. Neither study randomised anyone to a drug, so the comparison carries whatever differences led clinicians to choose one drug over another. Lamotrigine levels also fall substantially during pregnancy, which is a monitoring question for the prescriber and not something to adjust independently.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for lamotrigine could be verified and cited. The published literature on essential-medicine production costs holds per-drug numbers in a supplementary appendix that was not checked line by line here, and putting an estimate in that field would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 16 US cents per unit as a median across 181 listed generic products. That is what a United States pharmacy pays a wholesaler, not a manufacturing cost and not a patient charge.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Marson AG et al. The SANAD study of effectiveness of carbamazepine, gabapentin, lamotrigine, oxcarbazepine, or topiramate for treatment of partial epilepsy: an unblinded randomised controlled trial. Lancet 2007;369:1000-1015',
        identifier: '10.1016/S0140-6736(07)60460-7',
        kind: 'doi',
      },
      SANAD_II_FOCAL_SOURCE,
      {
        label:
          'Goodwin GM et al. A pooled analysis of 2 placebo-controlled 18-month trials of lamotrigine and lithium maintenance in bipolar I disorder. J Clin Psychiatry 2004;65:432-441',
        identifier: '10.4088/jcp.v65n0321',
        kind: 'doi',
      },
      {
        label:
          'Geddes JR, Calabrese JR, Goodwin GM. Lamotrigine for treatment of bipolar depression: independent meta-analysis and meta-regression of individual patient data from five randomised trials. Br J Psychiatry 2009;194:4-9',
        identifier: '10.1192/bjp.bp.107.048504',
        kind: 'doi',
      },
      {
        label:
          'Ho GYF et al. Risk of Ventricular Arrhythmia and Sudden Cardiac Arrest Among Older Patients Using Lamotrigine for Epilepsy. Neurology 2025;105:e213643',
        identifier: '10.1212/WNL.0000000000213643',
        kind: 'doi',
      },
      {
        label:
          'Ryan JM et al. Lamotrigine is associated with a nonpathological increase in cardiac electrical conduction in people with and without heart disease. Epilepsia 2026;67:2201-2213',
        identifier: '10.1002/epi.70126',
        kind: 'doi',
      },
      EURAP_SOURCE,
      {
        label:
          'Meador KJ et al. Fetal antiepileptic drug exposure and cognitive outcomes at age 6 years (NEAD study): a prospective observational study. Lancet Neurol 2013;12:244-252',
        identifier: '10.1016/S1474-4422(12)70323-X',
        kind: 'doi',
      },
      { label: 'NEAD: Neurodevelopmental Effects of Antiepileptic Drugs', identifier: 'NCT00021866', kind: 'nct' },
      KETOGENIC_DIET_SOURCE,
      {
        label:
          'Drugs@FDA: LAMICTAL (lamotrigine), NDA 020241, original approval 27 December 1994; LAMICTAL XR, NDA 022115, 29 May 2009',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020241',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 3878 — lamotrigine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3878',
        kind: 'url',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Valproate — the most effective drug for generalised epilepsy and the most teratogenic.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'valproate',
    name: 'Valproate',
    tradeName: 'Depacon / Depakote',
    sponsor: 'AbbVie (Abbott Laboratories originator); now off-patent with many generic manufacturers',
    targetGene: 'ABAT',
    targetProtein:
      '4-aminobutyrate aminotransferase (GABA transaminase) is one of several proposed targets, alongside histone deacetylases, voltage-gated sodium channels and T-type calcium channels. The label states that the mechanisms by which valproate works have not been established.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Monotherapy and adjunctive therapy of complex partial seizures and of simple and complex absence seizures, and adjunctive therapy in patients with multiple seizure types that include absence seizures; the intravenous form is an alternative when oral valproate is temporarily not feasible',
    patientFriendlyIndication:
      'Epilepsy, particularly generalised and absence seizures, and also mania in bipolar disorder and migraine prevention for the oral forms',
    anatomicalSite: 'Whole brain, with no single localised site of action established',
    conditionContext: {
      conditionExplainer:
        'Generalised epilepsies engage both hemispheres from the first instant of a seizure, rather than starting in one patch of cortex and spreading. Absence seizures, myoclonic jerks and generalised tonic-clonic seizures are the three forms, and one person often has all three.',
      whyItMatters:
        'Idiopathic generalised epilepsy usually starts in adolescence and usually needs lifelong treatment. That means treatment decisions taken at 15 are still in force at 30, which is why the reproductive consequences of the most effective drug dominate every guideline written about it.',
      whoTakesThis:
        'The most effective drug in idiopathic generalised epilepsy in two randomised trials, and for that reason still widely prescribed to men, to older women, and to boys. In Europe it is contraindicated in girls and women of childbearing potential unless a pregnancy prevention programme is followed.',
      clinicalGoals:
        'Seizure freedom in a seizure type where the alternatives measurably underperform, against a fetal risk that is among the largest quantified for any prescribed medicine.',
    },
    oneSentenceVerdict:
      'The most effective drug in idiopathic generalised epilepsy in both SANAD trials and the one no newer drug has matched, carrying a 10.3% major congenital malformation rate across 1,381 exposed pregnancies and a mean IQ of 97 at age 6 in exposed children against 108 after lamotrigine.',
    laymanHowItWorks:
      'Nobody has established how valproate stops seizures, and the label says so. Several things happen at once: the brain level of the calming messenger GABA rises, sodium and calcium channels are damped, and the enzymes that keep DNA wound up tightly are inhibited, which changes which genes a cell reads. That last effect is also the leading explanation for why the drug harms a developing fetus, so the proposed benefit and the proven harm may run through the same step.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 85,
    substitutes: {
      summary:
        'Every alternative to valproate in generalised epilepsy is a trade of seizure control for reproductive safety, and the size of both halves of that trade has been measured. Levetiracetam and lamotrigine have malformation rates around 2.8 to 2.9% against 10.3%; both lost to valproate on seizure outcomes in randomised trials.',
      conventionalRx: [
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand',
          howItCompares:
            'Tested head to head in the generalised arm of SANAD II, 520 participants, and failed to meet non-inferiority to valproate for time to 12-month remission (HR 1.19, 95% CI 0.96 to 1.47 against a margin of 1.314). The per-protocol analysis favoured valproate, and levetiracetam was dominated on cost-utility. Its EURAP malformation rate is 2.8%.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the lowest malformation rate of the eight drugs in EURAP, no interactions, an intravenous form. Cons: measurably less effective in generalised epilepsy, and behavioural side effects in 13% of adults.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In SANAD arm B, valproate was better than lamotrigine for time to 12-month remission overall (HR 0.76, 95% CI 0.62 to 0.94) and in the idiopathic generalised subgroup (0.68, 0.53 to 0.89), and better for time to treatment failure within that subgroup (1.55, 1.07 to 2.24). Its EURAP malformation rate is 2.9% and mean child IQ at 6 years was 108 against 97.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the best measured pregnancy profile among effective drugs. Cons: less effective in idiopathic generalised epilepsy, can worsen myoclonic seizures, and carries a boxed warning for serious rash.',
        },
        {
          name: 'Topiramate (Topamax)',
          class: 'Multiple mechanisms including AMPA/kainate antagonism',
          howItCompares:
            'The third arm of SANAD arm B. Valproate was better for time to treatment failure overall (HR 1.57, 95% CI 1.19 to 2.08) and in idiopathic generalised epilepsy (1.89, 1.32 to 2.70), with no significant difference for 12-month remission. Topiramate is itself teratogenic, with an EURAP malformation rate of 3.9% in a small exposed group and a labelled oral-cleft signal.',
          typicalCost:
            'US$0.2547 per unit, median across 158 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: broad spectrum, and effective in migraine prevention. Cons: worse tolerated than valproate in a randomised comparison, cognitive slowing, and its own pregnancy warnings.',
        },
      ],
      naturalFoods: [
        {
          name: 'Folic acid, taken before conception',
          activeCompound: 'Pteroylmonoglutamic acid',
          biologicalMechanism:
            'Supports one-carbon metabolism during neural tube closure in the first weeks after conception. The valproate label states that folic acid supplementation before conception and in the first trimester decreases the risk of congenital neural tube defects in the general population.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here; the amount recommended alongside an anti-seizure drug is a prescriber decision and differs from the general population recommendation.',
          monthlyCost: '',
        },
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies. In the one randomised trial, 38% of 145 children with drug-resistant epilepsy halved their seizures on the diet against 6% of controls.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. This is a hospital-supervised medical therapy with its own monitoring requirements.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask what the plan is before, not during, a pregnancy',
          action:
            'If you can become pregnant and are taking valproate, raise it at a routine appointment rather than at a positive test.',
          patientImpact:
            'Neural tube defects close in the first four weeks after conception, often before a pregnancy is recognised. The EURAP registry recorded major congenital malformations in 10.3% of 1,381 valproate-exposed pregnancies against 2.9% for lamotrigine, and the risk rose with dose at conception (p<0.0001).',
          clinicalPrecaution:
            'Stopping valproate abruptly can cause status epilepticus, which is itself dangerous in pregnancy. This is a planning conversation with a prescriber, never a unilateral change.',
        },
        {
          name: 'Report vomiting, lethargy or confusion rather than waiting it out',
          action:
            'Treat unexplained vomiting, drowsiness, facial swelling or a change in alertness as an urgent symptom, particularly in the first six months.',
          patientImpact:
            'The boxed warning covers fatal hepatotoxicity, usually within the first six months, and hyperammonaemic encephalopathy, which can appear with normal liver tests and is more likely when topiramate is taken alongside.',
          clinicalPrecaution:
            'Liver blood tests are not always abnormal in a patient who is developing hepatic failure, so symptoms carry information that the test does not.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCCC(CCC)C(=O)[O-]',
      chemicalFormula: 'C8H15O2',
      molecularWeight: '143.20 g/mol',
      targetReceptorAffinity:
        'No high-affinity receptor. Valproate is a simple eight-carbon branched fatty acid that circulates at millimolar concentrations, and every proposed target is engaged in that range rather than at the nanomolar affinities typical of receptor drugs. That is why the mechanism has resisted resolution for fifty years.',
      structureSource: {
        label:
          'PubChem CID 3549980 (valproate anion) — canonical SMILES, formula and molecular weight; the label states that valproate sodium exists as the valproate ion in blood',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3549980',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vpa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Purity of diethyl malonate and propyl halide feedstock',
          description:
            'Confirm identity and water content of the malonic ester and the propylating agent before alkylation. Valproic acid was first made in 1882 as an inert solvent, and the industrial route is still a two-step alkylation of a malonate ester, which is why the finished product is one of the cheapest medicines in the world.',
          reagentsAndBuffer:
            'Diethyl malonate reference standard, 1-bromopropane, gas chromatography with flame ionisation detection, Karl Fischer titration',
        },
        {
          id: 'vpa-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Double propylation, hydrolysis and decarboxylation',
          description:
            'Alkylate diethyl malonate twice with 1-bromopropane under sodium ethoxide, hydrolyse the diester, then decarboxylate on heating to give 2-propylpentanoic acid. Mono-propylated material surviving to the decarboxylation gives valeric acid impurities that the monograph is written to catch.',
          dependsOnStepId: 'vpa-w1',
          reagentsAndBuffer:
            'Sodium ethoxide in ethanol, 1-bromopropane in excess, aqueous sodium hydroxide for saponification, dilute sulfuric acid, heating to 150 to 180 degrees Celsius for decarboxylation',
        },
        {
          id: 'vpa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Fractional distillation and salt formation',
          description:
            'Distil the free acid under reduced pressure, then form the sodium salt or the 1:1 sodium valproate and valproic acid coordination compound sold as divalproex. Which salt is made determines the dosage form, not the pharmacology: all of them exist as the valproate ion in blood.',
          dependsOnStepId: 'vpa-w2',
          reagentsAndBuffer:
            'Vacuum distillation apparatus, sodium hydroxide or sodium carbonate, acetone or ethyl acetate for crystallisation, gas chromatography for related substances',
        },
        {
          id: 'vpa-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Exposure of cultured neurons at clinically achievable millimolar concentrations',
          description:
            'Expose cultured cortical neurons at 0.3 to 1 mM, the therapeutic plasma range, rather than at the micromolar concentrations used for receptor drugs. A protocol run at micromolar concentrations will show nothing, and much of the older mechanistic literature disagrees with itself for exactly that reason.',
          dependsOnStepId: 'vpa-w3',
          reagentsAndBuffer:
            'Primary cortical neuron cultures, Neurobasal medium with B27, sodium valproate at 0.3, 0.6 and 1.0 mM, osmolality-matched sodium chloride control',
        },
        {
          id: 'vpa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Parallel readout of brain GABA and histone acetylation',
          description:
            'Measure whole-tissue GABA by mass spectrometry and, in the same preparation, histone H3 and H4 acetylation by immunoblot. Reporting both is what separates the two candidate mechanisms, and the acetylation readout is the one that also predicts the teratogenic effect, so a workflow that measures only GABA measures only half the drug.',
          dependsOnStepId: 'vpa-w4',
          reagentsAndBuffer:
            'Liquid chromatography with tandem mass spectrometry for GABA and glutamate, acid histone extraction, anti-acetyl-histone H3 (Lys9) and H4 (Lys12) antibodies, trichostatin A as positive control for HDAC inhibition',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vpa-a1',
        category: 'measured',
        title: 'SANAD: better than lamotrigine and topiramate in generalised epilepsy',
        laymanSummary:
          'In a randomised trial of 716 patients for whom valproate was the standard choice, valproate reached a year of seizure freedom sooner than lamotrigine, and patients stopped it less often than topiramate.',
        technicalDetails:
          'SANAD arm B randomised 716 patients with generalised or unclassifiable epilepsy to valproate, lamotrigine or topiramate between 1999 and 2004. For time to treatment failure, valproate was better than topiramate (HR 1.57, 95% CI 1.19 to 2.08) with no significant difference against lamotrigine (1.25, 0.94 to 1.68). In the idiopathic generalised epilepsy subgroup, valproate was better than both lamotrigine (1.55, 1.07 to 2.24) and topiramate (1.89, 1.32 to 2.70). For time to 12-month remission, valproate was better than lamotrigine overall (0.76, 0.62 to 0.94) and in the idiopathic generalised subgroup (0.68, 0.53 to 0.89), with no significant difference against topiramate. The authors concluded valproate should remain the first choice for many patients with these epilepsies while flagging its effects in pregnancy.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1016-1026 (ISRCTN38354748)',
        doi: '10.1016/S0140-6736(07)60461-9',
        measuredMetric: 'Time to treatment failure and time to 12-month remission',
        auditFlag: 'verified',
      },
      {
        id: 'vpa-a2',
        category: 'measured',
        title: 'SANAD II: levetiracetam, the intended replacement, failed to match it',
        laymanSummary:
          'Levetiracetam is widely prescribed instead of valproate to avoid harming a pregnancy. The trial designed to check whether it controls seizures as well found that it did not.',
        technicalDetails:
          'SANAD II randomised 520 participants aged 5 and over with newly diagnosed generalised or unclassifiable epilepsy 1:1 to levetiracetam (n=260) or valproate (n=260), with a non-inferiority limit of HR 1.314 for time to 12-month remission. Levetiracetam did not meet non-inferiority (HR 1.19, 95% CI 0.96 to 1.47), and the per-protocol analysis showed 12-month remission superior with valproate. Levetiracetam was dominated in the cost-utility analysis, with an incremental net health benefit of -0.040 and a 0.17 probability of being cost-effective at 20,000 pounds per QALY. Adverse reactions were reported by 37% on valproate and 42% on levetiracetam.',
        evidenceSource: 'Marson A et al., Lancet 2021;397:1375-1386 (ISRCTN30294119)',
        doi: '10.1016/S0140-6736(21)00246-4',
        measuredMetric: 'Time to 12-month remission against a pre-specified non-inferiority margin',
        auditFlag: 'verified',
      },
      {
        id: 'vpa-a3',
        category: 'failed',
        title: '10.3% major congenital malformations, and the rate rises with the dose',
        laymanSummary:
          'Across 1,381 pregnancies exposed to valproate alone, roughly one in ten babies had a major birth defect. That is about four times the rate on other single anti-seizure drugs, and it climbs with the amount taken.',
        technicalDetails:
          'In the EURAP prospective registry covering 42 countries and 7,355 monotherapy-exposed pregnancies, major congenital malformation prevalence at one year was 142 of 1,381 (10.3%) for valproate, the highest of eight drugs, against 2.9% for lamotrigine, 2.8% for levetiracetam and 5.5% for carbamazepine. Prevalence rose with dose at conception (p<0.0001). Valproate at 650 mg/day or less still carried an increased risk against levetiracetam at 250 to 4000 mg/day (OR 2.43, 95% CI 1.30 to 4.55, p=0.0069). The United States label states that the malformation rate on valproate is about four times the rate on other anti-seizure monotherapies, with neural tube defects, craniofacial defects, cardiovascular malformations, hypospadias and limb malformations named.',
        evidenceSource:
          'Tomson T et al., Lancet Neurol 2018;17:530-538 (EURAP); valproate sodium United States prescribing information, Boxed Warning and Warnings and Precautions 5.2',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric: 'Prevalence of major congenital malformations at 1 year, by drug and dose',
        auditFlag: 'verified',
      },
      {
        id: 'vpa-a4',
        category: 'failed',
        title: 'Children exposed in the womb had a mean IQ of 97 at six years, against 108',
        laymanSummary:
          'A prospective study followed children of mothers taking one anti-seizure drug during pregnancy and tested them at age six. Valproate-exposed children scored about eleven points lower than lamotrigine-exposed children, and the higher the dose, the lower the score.',
        technicalDetails:
          'The NEAD study enrolled pregnant women on monotherapy at 25 centres in the United Kingdom and United States and assessed 311 children, 224 of whom completed six years of follow-up, with assessors masked. Adjusted mean IQ at 6 years was 97 (95% CI 94 to 101) after valproate against 105 (102 to 108) after carbamazepine (p=0.0015), 108 (105 to 110) after lamotrigine (p=0.0003) and 108 (104 to 112) after phenytoin (p=0.0006). High valproate dose correlated negatively with IQ (r=-0.56, p<0.0001), verbal ability (r=-0.40), non-verbal ability (r=-0.42), memory (r=-0.30) and executive function (r=-0.42); the other drugs showed no such dose relationship. The interim analysis at 3 years had already shown a 9-point deficit against lamotrigine.',
        evidenceSource:
          'Meador KJ et al., Lancet Neurol 2013;12:244-252; Meador KJ et al., N Engl J Med 2009;360:1597-1605 (NEAD, NCT00021866)',
        doi: '10.1016/S1474-4422(12)70323-X',
        measuredMetric: 'Adjusted IQ at age 6 by drug, and correlation of IQ with valproate dose',
        auditFlag: 'verified',
      },
      {
        id: 'vpa-a5',
        category: 'failed',
        title: 'Autism risk roughly tripled, and childhood autism roughly quintupled',
        laymanSummary:
          'A Danish national study covering every child born over eleven years found that children exposed to valproate before birth had about three times the rate of autism spectrum disorder and five times the rate of childhood autism.',
        technicalDetails:
          'Christensen and colleagues followed all 655,615 children born alive in Denmark from 1996 to 2006, of whom 5,437 had an autism spectrum disorder diagnosis. Among the 508 valproate-exposed children, absolute risk after 14 years was 4.42% for autism spectrum disorder (95% CI 2.59 to 7.46; adjusted HR 2.9, 1.7 to 4.9) and 2.50% for childhood autism (1.30 to 4.81; adjusted HR 5.2, 2.7 to 10.0), against population absolute risks of 1.53% and 0.48%. Restricting to the 6,584 children of mothers with epilepsy, the 432 valproate-exposed children still had adjusted hazard ratios of 1.7 (0.9 to 3.2) for autism spectrum disorder and 2.9 (1.4 to 6.0) for childhood autism. This is a registry cohort with adjustment, not a randomised comparison; the restriction to mothers with epilepsy is what addresses confounding by indication, and the childhood autism signal survives it.',
        evidenceSource: 'Christensen J et al., JAMA 2013;309:1696-1703',
        doi: '10.1001/jama.2013.2270',
        measuredMetric:
          'Absolute risk and adjusted hazard ratio of autism spectrum disorder and childhood autism after prenatal valproate exposure',
        auditFlag: 'verified',
      },
      {
        id: 'vpa-a6',
        category: 'failed',
        title: 'In Alzheimer disease it accelerated brain shrinkage and cognitive decline',
        laymanSummary:
          'Valproate was tested in Alzheimer disease to see whether it would delay agitation. Patients taking it lost hippocampal volume roughly twice as fast as those on placebo, and their memory scores fell faster.',
        technicalDetails:
          'Of 313 participants randomised to divalproex or placebo in a 24-month parallel-group trial in mild to moderate Alzheimer disease, 89 had MRI at baseline and 12 months. The divalproex group showed greater annual decline in left and right hippocampal volume (-10.9% and -12.4% against -5.6% and -6.3%) and whole brain volume (-3.5% against -1.4%), and greater ventricular expansion (24.5% against 9.9%), all p<0.001. Mini-Mental State Examination scores declined more rapidly through month 12 (-3.9 against -2.0, p=0.037), with no differences on other cognitive, behavioural or functional ratings at 12 and 24 months. There were no baseline differences between groups in age, education, brain volume, clinical scores or APOE e4 status.',
        evidenceSource: 'Fleisher AS et al., Neurology 2011;77:1263-1271',
        doi: '10.1212/WNL.0b013e318230a16c',
        measuredMetric:
          'Annual percentage change in hippocampal, whole brain and ventricular volume on MRI, and MMSE change',
        auditFlag: 'caution',
      },
      {
        id: 'vpa-a7',
        category: 'conclusion_shift',
        title: 'A first-line broad-spectrum drug became a restricted one in half the population',
        laymanSummary:
          'Valproate was standard treatment for generalised epilepsy for decades. In 2018 European regulators made it contraindicated in girls and women who can become pregnant unless a formal prevention programme is followed, and in 2024 added precautions for men.',
        technicalDetails:
          'Following an EU-wide referral, the European Commission adopted a final decision on 31 May 2018 contraindicating valproate in migraine and bipolar disorder during pregnancy and in girls and women of childbearing potential unless the conditions of a pregnancy prevention programme are met, including pregnancy testing, counselling on contraception, annual specialist review and a signed risk acknowledgement form. For epilepsy it may be used only where no other effective treatment is available. The 2018 decision also required a retrospective observational study of malformation risk after paternal exposure; in 2024 the PRAC recommended precautionary measures on possible neurodevelopmental risk in children of men treated with valproate, based on evidence reviewed from August 2023. The United States label reached a similar place through boxed warnings for fetal risk and decreased IQ rather than through a prevention programme.',
        evidenceSource:
          'European Medicines Agency, valproate and related substances Article 31 referral, European Commission decision 31 May 2018, with 2024 PRAC recommendation on paternal exposure',
        inferredClaim:
          'That a drug is defined by its efficacy ranking alone, when the ranking that changed prescribing was the one on fetal harm',
        auditFlag: 'verified',
      },
      {
        id: 'vpa-a8',
        category: 'measured',
        title: 'Fatal liver failure, concentrated in the first six months and in the very young',
        laymanSummary:
          'The boxed warning covers deaths from liver failure, usually within six months of starting. Children under two are at much higher risk, and in some inherited mitochondrial conditions the drug is banned outright.',
        technicalDetails:
          'The United States label carries a boxed warning for hepatotoxicity including fatalities, usually within the first six months of treatment. Children under two years of age are described as at considerably increased risk, particularly on multiple anticonvulsants or with congenital metabolic disorders, and the incidence falls considerably in progressively older groups. Valproate is contraindicated in patients known to have mitochondrial disorders caused by POLG mutations, such as Alpers-Huttenlocher syndrome, and in clinically suspected cases under two years. The label notes that serum biochemistry may not be abnormal in all instances, so symptoms carry information the test does not. Pancreatitis, including fatal haemorrhagic cases, and hyperammonaemic encephalopathy (more likely with concomitant topiramate) are separately warned.',
        evidenceSource:
          'Valproate sodium injection United States prescribing information, Boxed Warning and Warnings and Precautions 5.1, 5.5, 5.6 (Drugs@FDA NDA 020593)',
        measuredMetric:
          'Labelled incidence pattern of fatal hepatotoxicity by age and by POLG genotype',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed or infused, and bound so tightly to blood protein that the binding saturates',
        laymanDesc:
          'Almost all of the drug in blood is stuck to albumin. Once the albumin is full, extra doses raise the free, active fraction faster than the total blood level suggests.',
        molecularDetail:
          'Plasma protein binding is roughly 90% and saturable within the therapeutic range, so total concentration and free concentration diverge at the top of the range. Metabolism is hepatic: glucuronidation, mitochondrial beta-oxidation, and minor CYP2C9 and CYP2C19 routes. The 4-ene metabolite formed by omega-oxidation is the one implicated in hepatotoxicity.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters the brain as a simple fatty acid',
        laymanDesc:
          'Valproate is an eight-carbon fatty acid, not a designed receptor drug. It crosses into brain tissue and reaches concentrations thousands of times higher than most medicines need.',
        molecularDetail:
          'Brain entry involves both passive diffusion of the un-ionised acid and carrier-mediated transport at the blood-brain barrier. Therapeutic plasma concentrations are 0.3 to 0.7 mM, which is millimolar rather than nanomolar, and every proposed target is engaged in that range.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It touches several targets at once, and none of them has been established',
        laymanDesc:
          'GABA-breaking enzymes are slowed, sodium and calcium channels are damped, and the enzymes that keep DNA packed away are inhibited. The label states plainly that how the drug works has not been established.',
        molecularDetail:
          'Proposed targets include GABA transaminase and succinic semialdehyde dehydrogenase (raising brain GABA), voltage-gated sodium channels, T-type calcium channels, and class I histone deacetylases with an IC50 in the low millimolar range. No affinity ordering across these predicts anti-seizure potency the way the SV2A series does for levetiracetam.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Gene transcription changes, and so does neural tube closure',
        laymanDesc:
          'Inhibiting the enzymes that keep DNA wound tightly changes which genes a cell reads. In a developing embryo that same effect is the leading explanation for the birth defects.',
        molecularDetail:
          'Histone deacetylase inhibition raises histone H3 and H4 acetylation and alters transcription of developmental programmes, and is the most widely supported mechanistic account of valproate teratogenicity. The proposed anti-seizure mechanisms and the proven teratogenic mechanism are not separable at present, which is why no safer analogue has reached the clinic.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The best seizure control in generalised epilepsy, and the worst fetal outcome',
        laymanDesc:
          'Two randomised trials put valproate ahead of lamotrigine, topiramate and levetiracetam in generalised epilepsy. The same drug produced major birth defects in 10.3% of exposed pregnancies and a mean IQ of 97 at age six.',
        molecularDetail:
          'Both halves of that sentence are measured endpoints from prospective studies, not modelled estimates. Every guideline decision about this drug is a comparison of those two numbers against the corresponding numbers for the alternatives.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SANAD arm B (ISRCTN38354748)',
        phase: 'Unblinded randomised controlled trial, three arms',
        sampleSize: 716,
        primaryEndpoint: 'Time to treatment failure and time to 12-month remission',
        endpointMet: true,
        statisticalPValue:
          'Time to treatment failure HR 1.57 (95% CI 1.19 to 2.08) versus topiramate; 12-month remission HR 0.76 (0.62 to 0.94) versus lamotrigine',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD II generalised and unclassifiable arm (ISRCTN30294119)',
        phase: 'Phase 4 open-label randomised non-inferiority trial',
        sampleSize: 520,
        primaryEndpoint:
          'Time to 12-month remission, levetiracetam versus valproate, non-inferiority margin HR 1.314',
        endpointMet: true,
        statisticalPValue:
          'HR 1.19 (95% CI 0.96 to 1.47): levetiracetam failed non-inferiority, so valproate remained the reference standard',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'EURAP prospective pregnancy registry',
        phase: 'Prospective observational cohort, 42 countries, 1999-2016',
        sampleSize: 1381,
        primaryEndpoint:
          'Prevalence of major congenital malformations at 1 year after monotherapy exposure at conception',
        endpointMet: false,
        statisticalPValue:
          '10.3% (142 of 1,381), the highest of eight drugs; dose dependency p<0.0001',
        unreportedAdverseSignals:
          '`endpointMet: false` records a harm finding, not a missed efficacy target. The comparison is observational: drug choice was not randomised.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NEAD (NCT00021866)',
        phase: 'Prospective observational, assessor-masked, multicentre',
        sampleSize: 311,
        primaryEndpoint: 'Intelligence quotient at 6 years of age after fetal monotherapy exposure',
        endpointMet: false,
        statisticalPValue:
          'Mean IQ 97 (95% CI 94 to 101) after valproate against 108 (105 to 110) after lamotrigine, p=0.0003; dose correlation r=-0.56, p<0.0001',
        unreportedAdverseSignals:
          'Child IQ correlated with maternal IQ in the carbamazepine, lamotrigine and phenytoin groups but not in the valproate group, which is what a dominant drug effect looks like.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fleisher divalproex Alzheimer MRI substudy',
        phase: 'Randomised placebo-controlled trial substudy, 24 months',
        sampleSize: 89,
        primaryEndpoint:
          'Annual percentage change in whole brain, ventricular and hippocampal volume on MRI',
        endpointMet: false,
        statisticalPValue:
          'Hippocampal decline -10.9% and -12.4% against -5.6% and -6.3%; ventricular expansion 24.5% against 9.9%, p<0.001',
        unreportedAdverseSignals:
          'MMSE declined faster on divalproex through month 12 (-3.9 against -2.0, p=0.037), with no difference on other cognitive or behavioural scales.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Superior to lamotrigine for 12-month remission in generalised epilepsy (HR 0.76, 0.62 to 0.94) and to topiramate for treatment failure (1.57, 1.19 to 2.08) in 716 randomised patients',
        'Levetiracetam failed non-inferiority to valproate in 520 randomised patients with generalised or unclassifiable epilepsy',
        'Major congenital malformations in 10.3% of 1,381 exposed pregnancies, dose-dependent, against 2.8 to 2.9% for levetiracetam and lamotrigine',
        'Mean IQ of 97 at age 6 in exposed children against 108 after lamotrigine, with a dose correlation of r=-0.56',
        'Absolute autism spectrum disorder risk of 4.42% in 508 exposed children in a national cohort of 655,615, against 1.53% in the population',
      ],
      unsupportedInferences: [
        'That raising brain GABA is the mechanism: it is one of at least four proposals, and the label states none has been established',
        'That a lower dose makes valproate safe in pregnancy, when EURAP found excess risk even at 650 mg/day or less',
        'That the newer broad-spectrum drugs are equivalent replacements, which is the specific claim SANAD II tested and rejected',
        'That the Alzheimer brain-volume finding generalises to epilepsy: it comes from an 89-patient MRI substudy in a different population',
      ],
      whatFailedInitially: [
        'Divalproex in Alzheimer disease accelerated hippocampal and whole-brain volume loss and cognitive decline, and the programme was abandoned',
        'Fifty years of mechanistic work has not produced a target that predicts anti-seizure potency, and no separated analogue has reached the clinic',
        'The European regulatory position moved from first-line to contraindicated-with-exceptions in girls and women of childbearing potential in 2018, and added precautions for men in 2024',
      ],
      realWorldOutcome: [
        'Still the reference standard for idiopathic generalised epilepsy in randomised trials, and still the comparator every replacement has been tested against',
        'Divalproex sodium runs about 16 US cents per unit at United States pharmacy acquisition cost, a median across 138 listed products',
        'Prescribing has separated by sex and age rather than by seizure type, which is a pattern no efficacy trial produced',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion (valproate sodium), oral delayed-release and extended-release divalproex tablets and sprinkles, and oral valproic acid capsules and solution',
      description:
        'The injection exists to cover the days when swallowing is not possible, and the many oral salts exist to manage gastrointestinal tolerance rather than to change the pharmacology: all of them circulate as the valproate ion. Doses are not interchangeable between formulations.',
      safetyProfile:
        'A boxed warning covering three separate hazards: fatal hepatotoxicity usually within six months and concentrated in children under two and in POLG mitochondrial disease, fetal risk including neural tube defects and decreased IQ, and pancreatitis including fatal haemorrhagic cases. Other labelled risks are hyperammonaemic encephalopathy (more likely with concomitant topiramate), thrombocytopenia and coagulation abnormalities, DRESS, hypothermia and somnolence in the elderly. It is contraindicated in known POLG mitochondrial disorders.',
    },
    commonQuestions: [
      {
        q: 'If valproate works best, why is it being taken away from women?',
        a: 'Because both halves of the trade have been measured, and the harm side is larger than the benefit side for anyone who might become pregnant. On seizures, valproate reached 12-month remission sooner than lamotrigine (HR 0.76, 95% CI 0.62 to 0.94) and levetiracetam failed non-inferiority to it in SANAD II. On pregnancy, EURAP recorded major congenital malformations in 10.3% of 1,381 exposed pregnancies against 2.9% for lamotrigine, the NEAD study found a mean IQ of 97 at age 6 against 108, and a Danish national cohort found autism spectrum disorder in 4.42% of exposed children against 1.53% in the population. The European Commission concluded in May 2018 that the drug is contraindicated in girls and women of childbearing potential unless a pregnancy prevention programme is followed.',
        auditNote:
          'Both sides of this decision are randomised or prospective measurements, which is rare. The judgement is about how to weigh them, not about which numbers are real.',
      },
      {
        q: 'How does valproate actually work?',
        a: 'Nobody has established that, and the label says so in one sentence: the mechanisms by which valproate exerts its therapeutic effects have not been established. Four proposals are on the table: inhibition of GABA transaminase, which raises brain GABA; damping of voltage-gated sodium channels; damping of T-type calcium channels; and inhibition of class I histone deacetylases, which changes gene transcription. Valproate is a plain eight-carbon fatty acid that circulates at millimolar concentrations, so it engages all of these at once, and no ordering of affinities across a compound series predicts anti-seizure potency the way it does for other drugs.',
      },
      {
        q: 'Is it safe for a man to take valproate before fathering a child?',
        a: 'That question is open and is being actively examined. The 2018 European referral required a retrospective observational study of malformation risk after paternal exposure, and in 2024 the PRAC recommended precautionary measures relating to possible neurodevelopmental risk in children born to men treated with valproate, based on evidence reviewed from August 2023. The maternal evidence base is prospective, large and consistent. The paternal evidence base is retrospective and much smaller, and the regulatory language is precautionary rather than conclusive.',
      },
      {
        q: 'Why is there no manufacturing cost or price on this page?',
        a: 'The record behind this page covers valproate sodium, the injectable form, and the CMS acquisition-cost file lists prices for the oral divalproex and valproic acid products rather than for this one. The nearest published figure is about 16 US cents per unit for divalproex sodium, a median across 138 listed products, which is what a United States pharmacy pays a wholesaler. No per-dose cost of manufacture is stated here because none could be verified and cited, and estimating one would mean this page inventing a number. The synthesis itself is a two-step alkylation of a commodity ester, first performed in 1882, which is consistent with a low cost but is not a measurement of one.',
      },
      {
        q: 'It was tested in Alzheimer disease. What happened?',
        a: 'It made things worse on the measurement taken. In an MRI substudy of 89 participants from a 313-patient randomised trial, the divalproex group lost hippocampal volume at roughly twice the placebo rate (-10.9% and -12.4% against -5.6% and -6.3% per year), lost whole brain volume faster (-3.5% against -1.4%), and had greater ventricular expansion (24.5% against 9.9%), all at p<0.001. Mini-Mental State Examination scores fell faster through month 12. The authors noted the long-term clinical consequences of the volume change are not known, and no other cognitive or behavioural scale separated the groups.',
        auditNote:
          'This result is on the page because it is the clearest instance of a widely used drug being tested in a new population and found harmful on the endpoint chosen.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Marson AG et al. The SANAD study of effectiveness of valproate, lamotrigine, or topiramate for generalised and unclassifiable epilepsy: an unblinded randomised controlled trial. Lancet 2007;369:1016-1026',
        identifier: '10.1016/S0140-6736(07)60461-9',
        kind: 'doi',
      },
      SANAD_II_GENERALISED_SOURCE,
      EURAP_SOURCE,
      {
        label:
          'Meador KJ et al. Fetal antiepileptic drug exposure and cognitive outcomes at age 6 years (NEAD study): a prospective observational study. Lancet Neurol 2013;12:244-252',
        identifier: '10.1016/S1474-4422(12)70323-X',
        kind: 'doi',
      },
      {
        label:
          'Meador KJ et al. Cognitive function at 3 years of age after fetal exposure to antiepileptic drugs. N Engl J Med 2009;360:1597-1605',
        identifier: '10.1056/NEJMoa0803531',
        kind: 'doi',
      },
      {
        label: 'NEAD: Neurodevelopmental Effects of Antiepileptic Drugs',
        identifier: 'NCT00021866',
        kind: 'nct',
      },
      {
        label:
          'Christensen J et al. Prenatal valproate exposure and risk of autism spectrum disorders and childhood autism. JAMA 2013;309:1696-1703',
        identifier: '10.1001/jama.2013.2270',
        kind: 'doi',
      },
      {
        label:
          'Fleisher AS et al. Chronic divalproex sodium use and brain atrophy in Alzheimer disease. Neurology 2011;77:1263-1271',
        identifier: '10.1212/WNL.0b013e318230a16c',
        kind: 'doi',
      },
      {
        label:
          'European Medicines Agency, valproate and related substances: Article 31 referral, European Commission final decision 31 May 2018 and subsequent PRAC recommendations',
        identifier:
          'https://www.ema.europa.eu/en/medicines/human/referrals/valproate-related-substances-0',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: DEPACON (valproate sodium injection), NDA 020593, original approval 30 December 1996',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020593',
        kind: 'regulatory',
      },
      KETOGENIC_DIET_SOURCE,
      {
        label: 'PubChem CID 3549980 — valproate anion structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3549980',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
