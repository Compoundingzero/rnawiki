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

const SANAD_I_FOCAL_SOURCE = {
  label:
    'Marson AG et al. The SANAD study of effectiveness of carbamazepine, gabapentin, lamotrigine, oxcarbazepine, or topiramate for treatment of partial epilepsy: an unblinded randomised controlled trial. Lancet 2007;369:1000-1015',
  identifier: '10.1016/S0140-6736(07)60460-7',
  kind: 'doi' as const,
}

const SANAD_I_GENERALISED_SOURCE = {
  label:
    'Marson AG et al. The SANAD study of effectiveness of valproate, lamotrigine, or topiramate for generalised and unclassifiable epilepsy: an unblinded randomised controlled trial. Lancet 2007;369:1016-1026',
  identifier: '10.1016/S0140-6736(07)60461-9',
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
    anatomicalSite:
      'Presynaptic nerve terminal, inside the synaptic vesicle membrane (cortex and hippocampus)',
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
        title:
          'SANAD II: levetiracetam also failed non-inferiority to valproate in generalised epilepsy',
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
        evidenceSource:
          'Trinka E et al., J Neurol Neurosurg Psychiatry 2013;84:1138-1147 (NCT00175903)',
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
    sponsor:
      'GlaxoSmithKline LLC (originator); now off-patent with generics from many manufacturers',
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
    anatomicalSite:
      'Axonal and presynaptic membrane of cortical neurons (voltage-gated sodium channels)',
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
        title:
          'The cardiac arrhythmia warning was built from in vitro data, and the clinical data do not support it',
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
        measuredMetric:
          'Median time from randomisation to intervention for any mood episode over 18 months',
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
      {
        label: 'NEAD: Neurodevelopmental Effects of Antiepileptic Drugs',
        identifier: 'NCT00021866',
        kind: 'nct',
      },
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
    sponsor:
      'AbbVie (Abbott Laboratories originator); now off-patent with many generic manufacturers',
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
        title:
          'Swallowed or infused, and bound so tightly to blood protein that the binding saturates',
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
          'GABA-breaking enzymes are slowed, sodium and calcium channels are damped, and the enzymes that keep DNA packed away are inhibited. The label states that how the drug works has not been established.',
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
  // ---------------------------------------------------------------------------------------------
  // 4. Carbamazepine — the drug whose most important finding turned out to be a blood test.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'carbamazepine',
    name: 'Carbamazepine',
    tradeName: 'Tegretol / Carbatrol / Equetro',
    sponsor:
      'Geigy, now Novartis (originator); off-patent since the 1980s and manufactured generically worldwide',
    targetGene: 'SCN2A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits, bound preferentially in the inactivated state. The United States label does not endorse this: it describes reduced polysynaptic responses and blocked post-tetanic potentiation and then states that the mechanism of action remains unknown.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1968,
    indication:
      'Treatment of partial seizures with complex symptomatology, generalised tonic-clonic seizures and mixed seizure patterns; treatment of the pain of trigeminal neuralgia; and, as the extended-release capsule Equetro, treatment of acute manic or mixed episodes of bipolar I disorder',
    patientFriendlyIndication:
      'Focal and generalised epilepsy, trigeminal nerve pain, and mania in bipolar I disorder',
    anatomicalSite:
      'Axonal membrane of cortical neurons and of the trigeminal nerve root (voltage-gated sodium channels)',
    conditionContext: {
      conditionExplainer:
        'A seizure is a burst of synchronised electrical firing across a population of brain cells. Trigeminal neuralgia is the same physical problem in a different place: a nerve carrying sensation from the face fires in paroxysms, and the brain reads each paroxysm as a stab of pain.',
      whyItMatters:
        'Carbamazepine was the first drug shown in a large blinded trial to control focal seizures as well as anything then available while sedating people less. For fifty years it was the comparator every new anti-seizure drug had to beat, which is why it appears on the pages of drugs approved decades after it.',
      whoTakesThis:
        'People with focal epilepsy, people with trigeminal neuralgia, and a smaller group with bipolar I disorder. Prescribing has fallen in high-income countries because of interactions and rash risk, but it remains a WHO essential medicine and a mainstay where newer drugs are unaffordable.',
      clinicalGoals:
        'Seizure freedom or pain relief on one drug, without a rash, without a fall in sodium, and without wrecking the levels of every other medicine the person takes.',
    },
    oneSentenceVerdict:
      'A sodium-channel blocker whose own label still says the mechanism is unknown, which matched or beat every 1980s alternative for focal seizures in a 622-patient blinded trial, lost to lamotrigine on treatment failure in the 1,721-patient SANAD arm, and whose most consequential result is not a seizure count at all but a genetic screen: no case of Stevens-Johnson syndrome occurred among 4,877 Taiwanese patients when HLA-B*1502 carriers were steered away from the drug.',
    laymanHowItWorks:
      'Nerve cells fire by letting sodium rush in through pores in their outer membrane. After each firing a pore spends a moment shut and unavailable, and carbamazepine binds to it in exactly that state and holds it there. A cell firing at a normal rate barely notices. A cell firing over and over, as it does in a seizure or in a trigeminal pain attack, finds more and more of its pores locked out, so the burst starves itself. The drug also switches on the liver enzymes that destroy it, so it speeds up its own removal over the first month.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3776 per unit, the median across 92 listed carbamazepine products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised at Geigy in 1953 and approved in the United States in 1968 for trigeminal neuralgia, with the epilepsy indication following in 1974. Composition-of-matter protection expired long ago. What remains branded are formulations rather than the molecule: the extended-release tablet Tegretol-XR, the extended-release capsule Carbatrol, and Equetro, the same capsule relabelled for bipolar mania in 2004.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Carbamazepine has been the control arm of more first-line epilepsy trials than any other drug, so its alternatives are unusually well characterised. Lamotrigine beat it on treatment failure in SANAD. Oxcarbazepine is its own close chemical relative, built to avoid the epoxide metabolite. Phenytoin matched it in the 1985 Veterans Affairs trial. None of these is a like-for-like swap, and for trigeminal neuralgia specifically the alternatives are much weaker.',
      conventionalRx: [
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In arm A of SANAD, 1,721 patients for whom carbamazepine was standard treatment were randomised across five drugs. Lamotrigine was significantly better than carbamazepine for time to treatment failure (HR 0.78, 95% CI 0.63 to 0.97). On the other primary outcome, time to 12-month remission, carbamazepine held a non-significant advantage (HR 0.91, 95% CI 0.77 to 1.09), and the per-protocol difference at two and four years was 0 and 5 percentage points.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: fewer withdrawals for side effects, no enzyme induction, and the lowest malformation rate in EURAP alongside levetiracetam. Cons: must be introduced slowly because of serious rash, and it does not have carbamazepine long record in trigeminal neuralgia.',
        },
        {
          name: 'Oxcarbazepine (Trileptal)',
          class: 'Sodium channel blocker, keto analogue of carbamazepine',
          howItCompares:
            'Designed as a carbamazepine that cannot form the 10,11-epoxide metabolite. In SANAD arm A the estimate for time to treatment failure favoured carbamazepine non-significantly (lamotrigine versus oxcarbazepine HR 1.15, 95% CI 0.86 to 1.54), and for 12-month remission carbamazepine held a non-significant edge (HR 0.92, 95% CI 0.73 to 1.18). Cross-reactivity of rash between the two drugs is substantial.',
          typicalCost:
            'US$0.1637 per unit, median across 90 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: far less enzyme induction and no autoinduction, so levels are predictable. Cons: clinically significant hyponatraemia is more common than with carbamazepine, and the HLA-B*1502 rash risk is shared, not avoided.',
        },
        {
          name: 'Phenytoin (Dilantin)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In the Veterans Affairs Cooperative Study of 622 adults, overall treatment success was highest with carbamazepine or phenytoin, intermediate with phenobarbital and lowest with primidone (p<0.002). Carbamazepine controlled partial seizures completely more often than primidone or phenobarbital (p<0.03); phenytoin caused more dysmorphic effects and hypersensitivity.',
          typicalCost:
            'US$0.1812 per unit, median across 29 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: equally effective in the one blinded head-to-head, and available intravenously. Cons: non-linear kinetics make levels unpredictable, and gum overgrowth and coarsening of facial features are common on long treatment.',
        },
        {
          name: 'Valproate (Depakote)',
          class: 'Broad-spectrum, multiple proposed mechanisms',
          howItCompares:
            'Veterans Affairs Cooperative Study 264 randomised 480 adults double-blind. For secondarily generalised tonic-clonic seizures the two drugs were comparable (136 versus 138 patients). For complex partial seizures four of five outcome measures favoured carbamazepine, including total seizures 2.7 versus 7.6 (p=0.05) and seizures per month 0.9 versus 2.2 (p=0.01).',
          typicalCost:
            'Off-patent; divalproex and valproic acid products are listed separately from the injectable in the CMS NADAC file',
          prosAndCons:
            'Pros: covers generalised seizure types carbamazepine can make worse. Cons: 10.3% major congenital malformation rate in EURAP against 5.5% for carbamazepine, and more weight gain, tremor and hair change in the head-to-head.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream effects on GABA synthesis and adenosine signalling. It shares no mechanism with sodium-channel blockade and is used alongside drugs, not instead of them.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Leave grapefruit juice alone',
          action:
            'Do not start drinking grapefruit juice while taking carbamazepine, and tell the prescriber if it is already a daily habit.',
          patientImpact:
            'Grapefruit juice is named on the United States label among agents that inhibit CYP3A4 and raise plasma carbamazepine levels. Because the same enzyme handles the drug, a food-driven rise behaves like an unplanned dose increase.',
          clinicalPrecaution:
            'This is an interaction note, not a diet instruction, and no amount of avoiding grapefruit substitutes for the level monitoring the label calls for.',
        },
        {
          name: 'Photograph any new rash and call the same day',
          action:
            'If a rash appears, photograph it, note the date, and contact the prescriber that day rather than waiting for the next appointment.',
          patientImpact:
            'The label puts serious dermatologic reactions at 1 to 6 per 10,000 new users in mainly Caucasian populations and about ten times higher in some Asian countries, and says over 90% of the cases that will happen happen in the first few months.',
          clinicalPrecaution:
            'The label instructs discontinuation at the first sign of a rash unless it is clearly not drug-related. That judgement belongs to the prescriber, not to the person with the rash.',
        },
        {
          name: 'Ask whether an HLA-B*1502 test applies to you',
          action:
            'If you have ancestry anywhere across broad areas of Asia, ask before the first dose whether the HLA-B*1502 genetic test has been done.',
          patientImpact:
            'In the Taiwanese prevention study, 7.7% of 4,877 candidates carried the allele. Among those who tested negative and took carbamazepine, no case of Stevens-Johnson syndrome or toxic epidermal necrolysis occurred, against roughly ten cases expected from the historical rate.',
          clinicalPrecaution:
            'A negative test lowers the risk of SJS and TEN specifically. The label states it does not predict maculopapular rash or DRESS, and a separate allele, HLA-A*3101, carries risk in European, Korean and Japanese ancestry.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C2C(=C1)C=CC3=CC=CC=C3N2C(=O)N',
      chemicalFormula: 'C15H12N2O',
      molecularWeight: '236.27 g/mol',
      targetReceptorAffinity:
        'No single published affinity constant defines the clinical effect. Block of voltage-gated sodium channels is use-dependent and voltage-dependent, so potency measured in a cell depends on how fast the cell is firing and how depolarised it is held.',
      structureSource: {
        label: 'PubChem CID 2554 — carbamazepine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2554',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cbz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of the iminostilbene core',
          description:
            'Confirm 5H-dibenz[b,f]azepine before the carbamoylation step. The tricyclic core is shared with the antidepressant imipramine, and carbamazepine was investigated as an antidepressant on that resemblance before it was investigated as an anticonvulsant.',
          reagentsAndBuffer:
            'Iminostilbene reference standard, reverse-phase HPLC with UV detection at 285 nm, differential scanning calorimetry, loss on drying',
        },
        {
          id: 'cbz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Carbamoylation of the ring nitrogen',
          description:
            'Attach a carbamoyl group to the ring nitrogen to give 5H-dibenz[b,f]azepine-5-carboxamide. This is the whole molecule: a tricyclic amine with one urea-like substituent, which is why it is so cheap to make and so widely available.',
          dependsOnStepId: 'cbz-w1',
          reagentsAndBuffer:
            'Phosgene or a phosgene equivalent to form the carbamoyl chloride, then ammonia; toluene or chlorobenzene, controlled temperature, nitrogen blanket, caustic scrubber on the vent',
        },
        {
          id: 'cbz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with polymorph and dihydrate control',
          description:
            'Recrystallise and then prove which crystal form has been made. Carbamazepine has several anhydrous polymorphs and converts to a dihydrate on contact with water, and the forms dissolve at different rates. A batch that passes a chemical purity test can still fail a dissolution test because it crystallised in the wrong form.',
          dependsOnStepId: 'cbz-w2',
          reagentsAndBuffer:
            'Ethanol or acetone for recrystallisation, controlled cooling profile, powder X-ray diffraction against a form III reference pattern, dynamic vapour sorption to check for dihydrate conversion',
        },
        {
          id: 'cbz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Whole-cell recording from neurons expressing Nav1.2',
          description:
            'Apply the compound to a cell expressing the sodium channel and hold the membrane at different voltages. The point is to show the block depends on state: much stronger when the channel has been driven into inactivation than when it sits at rest. That state dependence is the proposed reason a seizing brain is affected and a resting one is not.',
          dependsOnStepId: 'cbz-w3',
          reagentsAndBuffer:
            'HEK293 cells or cultured cortical neurons expressing SCN2A, extracellular solution with 140 mM sodium chloride, caesium fluoride internal solution, voltage protocols stepping from -120 mV and from -70 mV holding potentials',
        },
        {
          id: 'cbz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Use-dependent block and epoxide metabolite quantification',
          description:
            'Measure how much of the sodium current is lost across a 10 Hz train rather than on a single pulse, and in parallel quantify carbamazepine-10,11-epoxide by mass spectrometry. Both numbers are needed: the train gives the mechanism, and the epoxide is an active metabolite that accumulates when valproate or brivaracetam inhibits the enzyme that clears it.',
          dependsOnStepId: 'cbz-w4',
          reagentsAndBuffer:
            'Ten-pulse 10 Hz stimulus trains, deuterated carbamazepine and carbamazepine-10,11-epoxide internal standards, protein-precipitated plasma, LC-MS/MS in multiple reaction monitoring mode',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cbz-a1',
        category: 'measured',
        title: 'Veterans Affairs 1985: best overall result of the four drugs then available',
        laymanSummary:
          'Six hundred and twenty-two adults were assigned at random and double-blind to one of four anti-seizure drugs and followed for two years. Carbamazepine and phenytoin came out on top; primidone came last, mostly because people could not tolerate it.',
        technicalDetails:
          'Mattson and colleagues ran a 10-centre double-blind trial in 622 adults with partial and secondarily generalised tonic-clonic seizures, randomised to carbamazepine, phenobarbital, phenytoin or primidone and followed for two years or until failure. Overall treatment success was highest with carbamazepine or phenytoin, intermediate with phenobarbital, lowest with primidone (p<0.002), and the difference was driven mainly by primidone causing more nausea, vomiting, dizziness and sedation. Control of tonic-clonic seizures did not differ significantly between drugs. Carbamazepine gave complete control of partial seizures more often than primidone or phenobarbital (p<0.03). Phenytoin caused more dysmorphic effects and hypersensitivity.',
        evidenceSource:
          'Mattson RH et al., N Engl J Med 1985;313:145-151 (VA Cooperative Study 118)',
        doi: '10.1056/NEJM198507183130303',
        measuredMetric:
          'Overall treatment success at two years, combining seizure control and drug tolerability',
        auditFlag: 'verified',
      },
      {
        id: 'cbz-a2',
        category: 'measured',
        title: 'Veterans Affairs 1992: better than valproate for complex partial seizures',
        laymanSummary:
          'A second blinded trial of 480 adults compared carbamazepine with valproate. For seizures that spread into a convulsion the two were equal. For complex partial seizures, four of five measures favoured carbamazepine.',
        technicalDetails:
          'VA Cooperative Study 264 randomised 480 adults double-blind to carbamazepine or divalproex sodium, dosed to mid-therapeutic blood levels, followed one to five years. For secondarily generalised tonic-clonic seizures the drugs were comparable (136 and 138 patients). For complex partial seizures carbamazepine was favoured on total seizure number (2.7 versus 7.6, p=0.05), seizures per month (0.9 versus 2.2, p=0.01), time to first seizure (p<0.02), seizure-rating score (p=0.04) and a composite score combining control and adverse effects (p<0.001). Valproate caused more weight gain above 5.5 kg (20% versus 8%, p<0.001), hair loss or texture change (12% versus 6%, p=0.02) and tremor (45% versus 22%, p<0.001). Rash was more common on carbamazepine (11% versus 1%, p<0.001).',
        evidenceSource:
          'Mattson RH et al., N Engl J Med 1992;327:765-771 (VA Cooperative Study 264)',
        doi: '10.1056/NEJM199209103271104',
        measuredMetric:
          'Seizure counts, time to first seizure and a composite control-plus-toxicity score over one to five years',
        auditFlag: 'verified',
      },
      {
        id: 'cbz-a3',
        category: 'failed',
        title: 'SANAD: lamotrigine beat it on the outcome that counts stopping the drug',
        laymanSummary:
          'The largest first-line trial ever run in focal epilepsy put carbamazepine against four newer drugs in 1,721 patients. Lamotrigine was better on how long people stayed on their assigned drug, and that result moved carbamazepine out of first place in United Kingdom guidance.',
        technicalDetails:
          'SANAD arm A was an unblinded randomised trial in 1,721 patients for whom carbamazepine was deemed standard treatment, assigned to carbamazepine, gabapentin, lamotrigine, oxcarbazepine or topiramate, with co-primary outcomes of time to treatment failure and time to 12-month remission. For time to treatment failure lamotrigine was significantly better than carbamazepine (HR 0.78, 95% CI 0.63 to 0.97), gabapentin (0.65, 0.52 to 0.80) and topiramate (0.64, 0.52 to 0.79). For time to 12-month remission the estimates ran the other way and did not reach significance: carbamazepine against lamotrigine HR 0.91 (0.77 to 1.09), against topiramate 0.86 (0.72 to 1.03), against oxcarbazepine 0.92 (0.73 to 1.18); carbamazepine was significantly better than gabapentin (0.75, 0.63 to 0.90). The per-protocol difference in 12-month remission between lamotrigine and carbamazepine was 0 percentage points (95% CI -8 to 7) at two years and 5 (-3 to 12) at four.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1000-1015 (ISRCTN38354748)',
        doi: '10.1016/S0140-6736(07)60460-7',
        measuredMetric: 'Time to treatment failure and time to 12-month remission, both co-primary',
        inferredClaim:
          'That lamotrigine controls focal seizures better than carbamazepine. It does not: on the remission outcome carbamazepine was numerically ahead. What lamotrigine did better was stay tolerable.',
        auditFlag: 'verified',
      },
      {
        id: 'cbz-a4',
        category: 'measured',
        title: 'A genetic screen made Stevens-Johnson syndrome preventable, prospectively',
        laymanSummary:
          'In Taiwan, 4,877 people about to start carbamazepine were genotyped first. The 7.7% who carried a particular immune gene variant were given something else. Among everyone else who took the drug, not one case of the life-threatening skin reaction occurred, where about ten were expected.',
        technicalDetails:
          'Chen and colleagues recruited 4,877 carbamazepine-naive candidates from 23 Taiwanese hospitals and genotyped HLA-B*1502. Carriers (7.7%) were advised against carbamazepine; non-carriers (92.3%) were advised to take it and were interviewed weekly for two months. Mild transient rash developed in 4.3% and more widespread rash requiring hospitalisation in 0.1%. No SJS or TEN developed in any HLA-B*1502-negative subject receiving carbamazepine, against roughly ten cases predicted by the historical incidence of 0.23% (p<0.001). This was a historically controlled prevention study, not a randomised one, which is the correct design here only because randomising carriers to the drug would be unethical, and it is the reason the result is stated as a strong association rather than a causal effect estimate.',
        evidenceSource: 'Chen P et al., N Engl J Med 2011;364:1126-1133',
        doi: '10.1056/NEJMoa1009717',
        measuredMetric:
          'Incidence of Stevens-Johnson syndrome and toxic epidermal necrolysis in HLA-B*1502-negative patients started on carbamazepine, against a historical control rate',
        auditFlag: 'verified',
      },
      {
        id: 'cbz-a5',
        category: 'conclusion_shift',
        title:
          'From an unpredictable idiosyncratic reaction to a test you run before the first dose',
        laymanSummary:
          'For forty years the severe rash on this drug was treated as bad luck that nobody could foresee. In 2004 a one-page report in Nature found a genetic marker for it in Han Chinese patients, and by 2007 the United States label required testing before treatment in people of Asian ancestry.',
        technicalDetails:
          'Chung and colleagues reported in 2004 a strong association in Han Chinese between HLA-B*1502 and carbamazepine-induced Stevens-Johnson syndrome, and proposed that the association could be turned into a predictive test. The FDA added an HLA-B*1502 screening recommendation to the carbamazepine boxed warning in December 2007. The current label states that the allele exceeds 15% prevalence in Hong Kong, Thailand, Malaysia and parts of the Philippines, is about 10% in Taiwan and 4% in North China, 2 to 4% in South Asians, under 1% in Japan and Korea, and largely absent in people not of Asian origin. A second and separate association, HLA-A*3101, was reported in 2011 in European, Korean and Japanese ancestry and covers hypersensitivity reactions more broadly, including maculopapular eruption and DRESS, which HLA-B*1502 does not predict. The pharmacological understanding of the drug did not change. What changed was that a risk previously described as idiosyncratic acquired a population-specific, testable cause.',
        evidenceSource:
          'Chung WH et al., Nature 2004;428:486; McCormack M et al., N Engl J Med 2011;364:1134-1143; carbamazepine United States prescribing information, boxed warning',
        doi: '10.1038/428486a',
        inferredClaim:
          'That "idiosyncratic" means causeless. It meant unexplained, and in this case the explanation was findable and is now printed in the boxed warning.',
        auditFlag: 'verified',
      },
      {
        id: 'cbz-a6',
        category: 'inferred',
        title: 'The mechanism everyone teaches is not the mechanism the label states',
        laymanSummary:
          'Textbooks describe carbamazepine as a use-dependent sodium channel blocker. Its own label describes reduced polysynaptic responses and blocked post-tetanic potentiation, and then says the mechanism of action remains unknown.',
        technicalDetails:
          'The United States prescribing information section on mechanism of action reports anticonvulsant activity in electrically and chemically induced rodent seizures, reduction of polysynaptic responses, block of post-tetanic potentiation, abolition of pain from infraorbital nerve stimulation in cats and rats, and depression of thalamic potential and bulbar and polysynaptic reflexes. It then states in as many words that the mechanism of action remains unknown. It also notes that the principal metabolite, carbamazepine-10,11-epoxide, has anticonvulsant activity in animal models, that clinical activity for the epoxide has been postulated, and that the significance of that activity for the safety and efficacy of carbamazepine has not been established. The state-dependent sodium-channel account is well supported in cellular electrophysiology; what has never been established is the quantitative link from that block to a suppressed seizure in a person, or how much of the clinical effect belongs to the parent drug rather than the epoxide.',
        evidenceSource:
          'Carbamazepine United States prescribing information, Clinical Pharmacology, Mechanism of Action (openFDA drug label endpoint)',
        inferredClaim:
          'That sodium-channel block is the established mechanism of carbamazepine in people, and that the parent drug is the active agent',
        auditFlag: 'caution',
      },
      {
        id: 'cbz-a7',
        category: 'measured',
        title:
          'It doubles its own clearance in the first month, then keeps doing it to other drugs',
        laymanSummary:
          'Carbamazepine turns on the liver enzymes that destroy it. Over three to five weeks its half-life falls from as long as 65 hours to as little as 12, so a dose that worked at the start stops working. It does the same to most other medicines a person takes.',
        technicalDetails:
          'The label states that autoinduction is complete after 3 to 5 weeks of a fixed dosing regimen, with initial half-life values of 25 to 65 hours falling to 12 to 17 hours. Carbamazepine is 76% plasma protein bound with a CSF to serum ratio of 0.22. It is a potent inducer of CYP3A4 and of UGT enzymes, so it lowers the exposure of hormonal contraceptives, direct oral anticoagulants, many antiretrovirals and several other anti-seizure drugs. In the other direction the label names aprepitant, cimetidine, ciprofloxacin, danazol, diltiazem, macrolides, fluoxetine, fluvoxamine, trazodone, omeprazole, oxybutynin, isoniazid, nicotinamide, azole antifungals, acetazolamide, verapamil, ticlopidine, grapefruit juice and protease inhibitors as agents that raise carbamazepine levels, and loxapine, quetiapine, valproic acid and brivaracetam as agents that raise the epoxide by inhibiting microsomal epoxide hydrolase.',
        evidenceSource:
          'Carbamazepine United States prescribing information, Clinical Pharmacology and Drug Interactions (openFDA drug label endpoint)',
        measuredMetric:
          'Elimination half-life before and after autoinduction, and the named list of interacting agents on the label',
        auditFlag: 'verified',
      },
      {
        id: 'cbz-a8',
        category: 'inferred',
        title: 'Routine blood counts are monitored on a warning the label says they do not predict',
        laymanSummary:
          'The boxed warning names aplastic anaemia and agranulocytosis, and most patients have blood counts checked because of it. The same warning says the minor changes those counts pick up are unlikely to signal either condition.',
        technicalDetails:
          'The boxed warning cites a population-based case-control study finding a 5 to 8 fold increased risk of aplastic anaemia and agranulocytosis on carbamazepine, against an untreated general-population rate of approximately six cases of agranulocytosis and two of aplastic anaemia per million people per year. It then states that although transient or persistent decreases in platelet or white cell counts are not uncommon, data are not available to estimate their incidence or outcome accurately, that the vast majority of leukopenia cases have not progressed, and that because the incidence of the serious conditions is so low, the vast majority of minor haematological changes seen on monitoring are unlikely to signal either abnormality. A pretreatment baseline is called for; the warning does not establish that a schedule of repeat counts detects the events it names.',
        evidenceSource:
          'Carbamazepine United States prescribing information, boxed warning, Aplastic Anemia and Agranulocytosis (openFDA drug label endpoint)',
        measuredMetric:
          'Relative risk of 5 to 8 against a baseline of 6 and 2 cases per million per year',
        inferredClaim:
          'That periodic full blood counts on carbamazepine prevent aplastic anaemia or agranulocytosis. The label states the relative risk and simultaneously states that routine minor abnormalities do not predict the outcome.',
        auditFlag: 'caution',
      },
      {
        id: 'cbz-a9',
        category: 'measured',
        title: 'EURAP: 5.5% major malformation rate, roughly double lamotrigine and levetiracetam',
        laymanSummary:
          'Across 1,957 pregnancies on carbamazepine alone in a 42-country registry, 5.5% of babies had a major birth defect. Lamotrigine and levetiracetam were at 2.9% and 2.8%; valproate was at 10.3%.',
        technicalDetails:
          'The EURAP prospective registry followed pregnancies on anti-epileptic monotherapy at conception from 42 countries between 1999 and 2016. Major congenital malformation prevalence at one year was 107 of 1,957 (5.5%) for carbamazepine, against 17 of 599 (2.8%) for levetiracetam, 74 of 2,514 (2.9%) for lamotrigine, 10 of 333 (3.0%) for oxcarbazepine, 6 of 152 (3.9%) for topiramate, 8 of 125 (6.4%) for phenytoin, 19 of 294 (6.5%) for phenobarbital and 142 of 1,381 (10.3%) for valproate. The authors placed lamotrigine, levetiracetam and oxcarbazepine within the background range for unexposed offspring and carbamazepine outside it. This is a registry, not a randomised comparison: drug choice tracked seizure type and severity, and the endpoint is structural malformation at one year rather than cognition later.',
        evidenceSource: 'Tomson T et al., Lancet Neurol 2018;17:530-538 (EURAP registry)',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric: 'Prevalence of major congenital malformations at 1 year, by drug and dose',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed slowly, and increasingly destroyed by the liver it wakes up',
        laymanDesc:
          'Absorption is slow and varies between formulations. Over the first three to five weeks the liver learns to clear the drug faster, so blood levels drift down on an unchanged dose.',
        molecularDetail:
          'Peak plasma levels arrive at about 1.5 hours from suspension, 4 to 5 hours from conventional tablets and 3 to 12 hours from the extended-release tablet. Plasma protein binding is 76%. Metabolism runs mainly through CYP3A4 to carbamazepine-10,11-epoxide, which is itself anticonvulsant in animal models and is cleared by microsomal epoxide hydrolase. Autoinduction of CYP3A4 completes after 3 to 5 weeks, taking the half-life from 25 to 65 hours down to 12 to 17.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches brain tissue at roughly its free concentration in blood',
        laymanDesc:
          'The molecule is small and fat-soluble enough to cross into the brain, and the amount that gets there tracks the fraction not stuck to blood proteins.',
        molecularDetail:
          'The CSF to serum ratio is 0.22, closely matching the 24% of carbamazepine that is unbound in serum, which is the expected relationship for passive distribution of a free drug. The relevant compartment is the axonal and presynaptic membrane of cortical neurons, and for trigeminal neuralgia the root entry zone of the fifth cranial nerve.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds sodium channels that have just fired, not ones at rest',
        laymanDesc:
          'Each sodium pore passes through a shut, unavailable state right after it opens. Carbamazepine binds that state and holds the pore there, so pores that have just been used are the ones taken out of service.',
        molecularDetail:
          'Binding to the inactivated conformation of voltage-gated sodium channel alpha subunits shifts steady-state inactivation to more negative potentials and slows recovery from inactivation. Apparent potency is far higher from a depolarised holding potential than from a hyperpolarised one, which is what makes the block state-dependent rather than simply concentration-dependent.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Rapid repetitive firing runs itself down',
        laymanDesc:
          'A cell firing occasionally loses almost nothing. A cell firing in a fast train loses more of its pores with every spike, so the train fades instead of building.',
        molecularDetail:
          'Cumulative block across a stimulus train reduces sustained high-frequency firing. The label describes the observable version of this in animals: reduced polysynaptic responses and blocked post-tetanic potentiation, and abolition of pain evoked by infraorbital nerve stimulation. The label then states that the mechanism of action remains unknown.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer focal seizures, and fewer facial pain attacks',
        laymanDesc:
          'The measured results are two: better control of focal seizures than phenobarbital or primidone in a blinded 622-patient trial, and relief of trigeminal neuralgia, which is what the drug was first licensed for in 1968.',
        molecularDetail:
          'Efficacy in focal epilepsy is established against three older comparators (VA 118), against valproate (VA 264) and across four newer drugs (SANAD arm A). The extended-release capsule was separately approved for acute manic and mixed episodes of bipolar I disorder in 2004 as Equetro, a different indication reached through different registration trials.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VA Cooperative Study 118 (Mattson 1985)',
        phase: 'Double-blind randomised comparative trial, 10 centres, 2-year follow-up',
        sampleSize: 622,
        primaryEndpoint:
          'Overall treatment success, combining seizure control and tolerability, across carbamazepine, phenobarbital, phenytoin and primidone',
        endpointMet: true,
        statisticalPValue:
          'Highest with carbamazepine or phenytoin, lowest with primidone, P<0.002; complete control of partial seizures better than primidone or phenobarbital, P<0.03',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VA Cooperative Study 264 (Mattson 1992)',
        phase: 'Double-blind randomised comparative trial, 1 to 5 years of follow-up',
        sampleSize: 480,
        primaryEndpoint:
          'Seizure control and composite control-plus-toxicity score, carbamazepine versus divalproex sodium',
        endpointMet: true,
        statisticalPValue:
          'Complex partial seizures per month 0.9 versus 2.2, P=0.01; composite score favoured carbamazepine, P<0.001; no difference for secondarily generalised tonic-clonic seizures',
        unreportedAdverseSignals:
          'Rash occurred in 11% on carbamazepine against 1% on valproate (P<0.001), a difference whose genetic basis was not identified for another twelve years.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD arm A (ISRCTN38354748)',
        phase: 'Unblinded randomised controlled trial, five parallel arms',
        sampleSize: 1721,
        primaryEndpoint:
          'Co-primary: time to treatment failure and time to 12-month remission, carbamazepine against gabapentin, lamotrigine, oxcarbazepine and topiramate',
        endpointMet: false,
        statisticalPValue:
          'Lamotrigine better than carbamazepine for time to treatment failure, HR 0.78 (95% CI 0.63 to 0.97); for 12-month remission carbamazepine held a non-significant advantage, HR 0.91 (0.77 to 1.09)',
        unreportedAdverseSignals:
          'The trial was unblinded, so the treatment-failure endpoint, which depends on a clinician deciding to stop a drug, was open to expectation on both sides.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'HLA-B*1502 prospective screening study, Taiwan (Chen 2011)',
        phase: 'Prospective cohort with historical control, 23 hospitals',
        sampleSize: 4877,
        primaryEndpoint:
          'Incidence of Stevens-Johnson syndrome and toxic epidermal necrolysis among HLA-B*1502-negative subjects started on carbamazepine',
        endpointMet: true,
        statisticalPValue:
          'Zero cases observed against approximately 10 expected from a historical incidence of 0.23%, P<0.001',
        unreportedAdverseSignals:
          'Mild transient rash still occurred in 4.3% and hospitalising rash in 0.1%. The allele predicts SJS and TEN only; the label states it does not predict maculopapular eruption or DRESS.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Highest overall treatment success alongside phenytoin among four drugs in 622 double-blind patients followed two years (P<0.002)',
        'Better complex partial seizure control than valproate on four of five outcome measures in 480 double-blind patients',
        'Time to treatment failure worse than lamotrigine in 1,721 randomised patients, HR 0.78 (95% CI 0.63 to 0.97)',
        'Zero cases of SJS or TEN among HLA-B*1502-negative patients in 4,877 prospectively genotyped Taiwanese candidates, against about ten expected',
        'Half-life falling from 25 to 65 hours to 12 to 17 hours over 3 to 5 weeks of unchanged dosing',
        '107 major congenital malformations in 1,957 monotherapy-exposed pregnancies (5.5%) in the EURAP registry',
      ],
      unsupportedInferences: [
        'That sodium-channel block is the established mechanism in people: it is the best cellular account, but the label says the mechanism remains unknown and the active-metabolite question is open',
        'That periodic blood counts prevent aplastic anaemia or agranulocytosis, when the same boxed warning says minor haematological changes are unlikely to signal either',
        'That lamotrigine controls focal seizures better than carbamazepine, when SANAD found the opposite direction on the remission endpoint',
        'That a negative HLA-B*1502 test makes carbamazepine rash-safe, when the allele predicts SJS and TEN only and HLA-A*3101 covers a separate population and a broader set of reactions',
      ],
      whatFailedInitially: [
        'The drug was first investigated as an antidepressant on its structural resemblance to imipramine, and reached the market for trigeminal neuralgia in 1968 before it reached it for epilepsy in 1974',
        'It lost first-line status in United Kingdom focal epilepsy guidance after SANAD, on tolerability rather than on seizure control',
        'For forty years its severe rash was classified as idiosyncratic and unpredictable, an inference falsified by a one-page report in 2004',
      ],
      realWorldOutcome: [
        'A WHO essential medicine, still first-line for trigeminal neuralgia and widely used in focal epilepsy where cost decides',
        'About 38 US cents per unit at United States pharmacy acquisition cost, a median across 92 listed generic products',
        'Its enzyme induction, not its efficacy, is what most often removes it from a regimen: it lowers the levels of hormonal contraceptives, anticoagulants and other anti-seizure drugs',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, chewable tablet, extended-release tablet, extended-release capsule and oral suspension',
      description:
        'Formulation matters more here than for most drugs. The suspension peaks at about 1.5 hours, the conventional tablet at 4 to 5 and the extended-release tablet at 3 to 12, and the extended-release tablet given twice daily reproduces the steady-state levels of the conventional tablet given four times daily. There is no intravenous carbamazepine in general use, which is one reason it is absent from status epilepticus protocols.',
      safetyProfile:
        'The boxed warning has two halves. The first is dermatologic: serious and sometimes fatal SJS and TEN, estimated at 1 to 6 per 10,000 new users in mainly Caucasian populations and about ten times that in some Asian countries, with HLA-B*1502 screening required before treatment in people with ancestry across broad areas of Asia. The second is haematologic: aplastic anaemia and agranulocytosis at 5 to 8 times the general-population rate, on a baseline of roughly six and two cases per million per year. Beyond the box, hyponatraemia is common, the drug is a potent CYP3A4 inducer that lowers the levels of hormonal contraception and many other medicines, and it can worsen absence and myoclonic seizures in generalised epilepsy. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Should I have a genetic test before starting carbamazepine?',
        a: 'If you have ancestry anywhere across broad areas of Asia, the United States label says yes, and says it should happen before the first dose. The evidence behind that instruction is a prospective study of 4,877 carbamazepine-naive people in Taiwan: 7.7% carried HLA-B*1502 and were given something else, and among the 92.3% who tested negative and took carbamazepine, no case of Stevens-Johnson syndrome or toxic epidermal necrolysis occurred, against roughly ten expected from the historical rate. The label gives allele prevalences to guide who to test: above 15% in Hong Kong, Thailand, Malaysia and parts of the Philippines, about 10% in Taiwan, 4% in North China, 2 to 4% in South Asians, under 1% in Japan and Korea, and largely absent in people not of Asian origin. A separate allele, HLA-A*3101, carries risk in European, Korean and Japanese ancestry and covers a wider range of reactions.',
        auditNote:
          'This is the strongest prevention result on this page and it is not about seizures at all.',
      },
      {
        q: 'Is carbamazepine still a first-choice drug for epilepsy?',
        a: 'It depends which endpoint you ask about and where you are. SANAD randomised 1,721 patients across five drugs and found lamotrigine significantly better on time to treatment failure (HR 0.78, 95% CI 0.63 to 0.97), which moved carbamazepine out of first place in United Kingdom guidance. On the other co-primary outcome, time to 12-month remission, carbamazepine was numerically ahead of lamotrigine, topiramate and oxcarbazepine and significantly ahead of gabapentin. So the drug lost on tolerability and interactions, not on seizure control, and it remains a WHO essential medicine and a first-line choice for trigeminal neuralgia.',
      },
      {
        q: 'Why does my dose keep being increased when nothing has changed?',
        a: 'Because the drug speeds up its own destruction. Carbamazepine induces CYP3A4, the enzyme that clears it, and the label states that autoinduction completes after 3 to 5 weeks of a fixed regimen, with half-life falling from 25 to 65 hours down to 12 to 17. The same dose therefore produces a lower blood level in week five than in week one. This is a known pharmacokinetic property, not a sign that the epilepsy is worsening or that tolerance has developed at the target.',
      },
      {
        q: 'Does carbamazepine stop the contraceptive pill working?',
        a: 'It lowers the exposure. Carbamazepine is a potent inducer of CYP3A4 and of the glucuronidation enzymes, and it reduces plasma levels of hormonal contraceptives along with direct oral anticoagulants, many antiretrovirals and several other anti-seizure drugs. The label handles this as a drug-interaction warning. What to do about it is a prescriber decision and this page does not make recommendations, but the interaction itself is not in doubt and it is one of the commonest reasons this drug gets swapped for a non-inducing one.',
        auditNote:
          'Direction of the interaction is documented on the label. Magnitude varies by the specific product and is not stated here.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for carbamazepine could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 38 US cents per unit as a median across 92 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mattson RH et al. Comparison of carbamazepine, phenobarbital, phenytoin, and primidone in partial and secondarily generalized tonic-clonic seizures. N Engl J Med 1985;313:145-151',
        identifier: '10.1056/NEJM198507183130303',
        kind: 'doi',
      },
      {
        label:
          'Mattson RH et al. A comparison of valproate with carbamazepine for the treatment of complex partial seizures and secondarily generalized tonic-clonic seizures in adults. N Engl J Med 1992;327:765-771',
        identifier: '10.1056/NEJM199209103271104',
        kind: 'doi',
      },
      SANAD_I_FOCAL_SOURCE,
      {
        label:
          'Chung WH et al. Medical genetics: a marker for Stevens-Johnson syndrome. Nature 2004;428:486',
        identifier: '10.1038/428486a',
        kind: 'doi',
      },
      {
        label:
          'Chen P et al. Carbamazepine-induced toxic effects and HLA-B*1502 screening in Taiwan. N Engl J Med 2011;364:1126-1133',
        identifier: '10.1056/NEJMoa1009717',
        kind: 'doi',
      },
      {
        label:
          'McCormack M et al. HLA-A*3101 and carbamazepine-induced hypersensitivity reactions in Europeans. N Engl J Med 2011;364:1134-1143',
        identifier: '21428769',
        kind: 'pmid',
      },
      EURAP_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label:
          'Carbamazepine United States prescribing information: boxed warning, Clinical Pharmacology, Drug Interactions and Adverse Reactions, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22CARBAMAZEPINE%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: TEGRETOL (carbamazepine), NDA 016608, original approval 1968; EQUETRO (carbamazepine extended-release capsules), NDA 021710, approved 2004',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=016608',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2554 — carbamazepine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2554',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Oxcarbazepine — a carbamazepine redesigned around one metabolite, tested against itself.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'oxcarbazepine',
    name: 'Oxcarbazepine',
    tradeName: 'Trileptal / Oxtellar XR',
    sponsor:
      'Novartis (originator, Trileptal); Supernus Pharmaceuticals for the extended-release Oxtellar XR; now off-patent with many generic manufacturers',
    targetGene: 'SCN2A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits, blocked by the 10-monohydroxy derivative (MHD) rather than by oxcarbazepine itself. The label states that the precise mechanism is unknown and adds increased potassium conductance and modulation of high-voltage-activated calcium channels as possible contributors.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'Monotherapy or adjunctive therapy for partial-onset seizures in adults; monotherapy for partial-onset seizures in children aged 4 years and above; adjunctive therapy for partial-onset seizures in children aged 2 years and above',
    patientFriendlyIndication: 'Focal (partial-onset) epilepsy',
    anatomicalSite:
      'Axonal membrane of cortical neurons, reached by the active metabolite rather than the swallowed drug',
    conditionContext: {
      conditionExplainer:
        'Focal epilepsy starts in one patch of cortex and may or may not spread. The drugs that work best on it are almost all drugs that slow down repetitive firing in a single axon rather than drugs that change the chemistry of a whole brain region.',
      whyItMatters:
        'Carbamazepine works and is cheap, but it induces liver enzymes, wrecks the levels of other medicines, and makes a reactive epoxide metabolite that was suspected of causing some of its toxicity. Oxcarbazepine is what happens when a chemist tries to keep the first property and delete the rest.',
      whoTakesThis:
        'People with focal epilepsy, particularly where carbamazepine interactions are the problem rather than carbamazepine efficacy. It is also used off-label in trigeminal neuralgia, an indication it does not carry in the United States.',
      clinicalGoals:
        'Seizure control equal to carbamazepine with predictable blood levels and fewer interactions, at the cost of watching the serum sodium.',
    },
    oneSentenceVerdict:
      'A carbamazepine redesigned so the body reduces it to an active alcohol instead of oxidising it to a reactive epoxide, which halved seizure frequency at 2,400 mg/day against 7.6% on placebo in 692 adults but at a dose more than 65% of that group stopped taking, and whose monotherapy licence rests largely on trials that compared a high dose of the drug with a low dose of the same drug.',
    laymanHowItWorks:
      'The tablet itself does almost nothing. The body immediately reduces it to a related molecule, the 10-monohydroxy derivative, and that is what acts. It works the same way carbamazepine does: it binds sodium pores in nerve membranes that have just fired and keeps them shut, so a cell firing repeatedly runs out of usable pores and the burst dies out. The chemical difference matters because the body reaches this metabolite by a simple reduction rather than by the oxidation that turns carbamazepine into a reactive epoxide, so there is far less enzyme induction and no self-induction.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1637 per unit, the median across 90 listed oxcarbazepine products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised at Geigy in 1966 as a deliberate carbamazepine analogue, first marketed in Denmark in 1990 and approved in the United States as Trileptal in January 2000 under NDA 021014. Now generic. The extended-release tablet Oxtellar XR (NDA 202810, Supernus, 2012) is a separate product with its own registration trial and remains branded.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Oxcarbazepine sits between two drugs it is chemically almost identical to. Carbamazepine is the parent it was built to improve on, and SANAD found no significant difference between them on either primary outcome. Eslicarbazepine acetate is the single enantiomer of its own active metabolite, sold separately. Lamotrigine is the drug that beat the whole group on staying tolerable.',
      conventionalRx: [
        {
          name: 'Carbamazepine (Tegretol)',
          class: 'Sodium channel blocker, the parent compound',
          howItCompares:
            'In SANAD arm A, 1,721 patients were randomised across five drugs. For time to 12-month remission carbamazepine held a non-significant advantage over oxcarbazepine (HR 0.92, 95% CI 0.73 to 1.18); for time to treatment failure lamotrigine had a non-significant advantage over oxcarbazepine (HR 1.15, 95% CI 0.86 to 1.54). The label reports that clinically significant hyponatraemia occurred in 2.5% of oxcarbazepine patients and in none of the carbamazepine or phenobarbital active controls.',
          typicalCost:
            'US$0.3776 per unit, median across 92 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: longer and larger evidence base, and the only one of the two licensed in the United States for trigeminal neuralgia. Cons: potent enzyme induction, autoinduction of its own clearance, and a boxed warning oxcarbazepine does not carry.',
        },
        {
          name: 'Eslicarbazepine acetate (Aptiom)',
          class: 'Prodrug of S-licarbazepine, one enantiomer of oxcarbazepine active metabolite',
          howItCompares:
            'Reaches the same active species by a shorter route and as a single enantiomer, and is given once daily. It is a distinct FDA application with its own trials rather than a reformulation, and no adequately powered head-to-head trial against oxcarbazepine establishes a difference in seizure control.',
          typicalCost:
            'Listed separately in the CMS NADAC file; not the same product and not interchangeable at the pharmacy',
          prosAndCons:
            'Pros: once-daily dosing and a cleaner metabolic picture. Cons: hyponatraemia is shared, the carbamazepine cross-hypersensitivity question is shared, and the price is not.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'The drug that won SANAD arm A on time to treatment failure, significantly better than carbamazepine (HR 0.78, 95% CI 0.63 to 0.97) and non-significantly better than oxcarbazepine (HR 1.15, 95% CI 0.86 to 1.54, favouring lamotrigine). It does not cause hyponatraemia.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: best tolerated of the group in the largest first-line trial, and among the lowest malformation rates in EURAP. Cons: slow introduction because of serious rash, and a boxed warning for it.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand, unrelated mechanism',
          howItCompares:
            'Not a sodium channel blocker, so it shares neither the rash cross-reactivity nor the hyponatraemia. In SANAD II it failed non-inferiority to lamotrigine in focal epilepsy (HR 1.18, 97.5% CI 0.95 to 1.47), so it is not a stronger drug, only a differently limited one.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no interactions, an intravenous form, and no sodium monitoring. Cons: irritability and aggression in 13% of adults and 38% of children in its registration trials.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream effects on GABA synthesis and adenosine signalling. It shares no mechanism with sodium-channel blockade and is used alongside drugs, not instead of them.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Know what low sodium feels like',
          action:
            'Learn the symptom list the label gives for hyponatraemia and treat any of them as a reason to call rather than to wait: nausea, malaise, headache, lethargy, confusion, obtundation, or seizures becoming more frequent or more severe.',
          patientImpact:
            'In the 14 controlled epilepsy studies, 2.5% of oxcarbazepine-treated patients (38 of 1,524) recorded a serum sodium below 125 mmol/L, against none on placebo or active control. Most were asymptomatic, but the trials monitored frequently and real life does not.',
          clinicalPrecaution:
            'More seizures is on that symptom list, which means the natural reading, that the drug has stopped working, can be exactly wrong. Only a blood test separates the two.',
        },
        {
          name: 'Say the word carbamazepine before the first dose',
          action:
            'Tell the prescriber explicitly about any past reaction to carbamazepine, even one described at the time as a minor rash.',
          patientImpact:
            'The label states that approximately 25% to 30% of patients who have had hypersensitivity reactions to carbamazepine will react to oxcarbazepine, and instructs that patients be specifically questioned about it.',
          clinicalPrecaution:
            'The chemical redesign that removed the epoxide did not remove this risk. A past carbamazepine reaction is a reason for a conversation, not a reason to assume the newer drug is safe.',
        },
        {
          name: 'Flag a pregnancy early, for a pharmacokinetic reason',
          action:
            'Tell the neurology team as soon as a pregnancy is known, and again after delivery.',
          patientImpact:
            'The label warns that plasma levels of the active metabolite MHD may fall gradually through pregnancy and return after delivery, so seizure control can drift in both directions on an unchanged dose.',
          clinicalPrecaution:
            'This page gives no dosing advice. The point is only that the timing of the conversation matters, because the change is physiological and predictable rather than sudden.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1C2=CC=CC=C2N(C3=CC=CC=C3C1=O)C(=O)N',
      chemicalFormula: 'C15H12N2O2',
      molecularWeight: '252.27 g/mol',
      targetReceptorAffinity:
        'No clinically anchored affinity constant is published for the parent drug, and the parent is not the acting species. Potency measured in a cell belongs to the 10-monohydroxy derivative and is state-dependent, so it varies with holding potential and firing rate.',
      structureSource: {
        label: 'PubChem CID 34312 — oxcarbazepine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/34312',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'oxc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the iminostilbene precursor and absence of carbamazepine carryover',
          description:
            'Confirm the tricyclic starting material and set a limit for carbamazepine itself. The two molecules differ by a single oxygen at the 10-position, so residual parent carbamazepine is the most consequential impurity in the whole route: it would bring back exactly the epoxide chemistry the compound exists to avoid.',
          reagentsAndBuffer:
            'Iminostilbene and carbamazepine reference standards, reverse-phase HPLC with UV detection at 254 nm, gradient elution, limit of quantification set below the impurity specification',
        },
        {
          id: 'oxc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Installation of the 10-keto group and carbamoylation',
          description:
            'Build the 10-oxo-10,11-dihydro core and carry the carboxamide on the ring nitrogen. Putting a ketone at position 10 blocks the site where carbamazepine gets oxidised to its 10,11-epoxide, so the body has to reduce this molecule instead of oxidising it.',
          dependsOnStepId: 'oxc-w1',
          reagentsAndBuffer:
            'Oxidising system for the 10-position, then phosgene equivalent and ammonia for the carboxamide; toluene or chlorobenzene, controlled temperature, nitrogen blanket, caustic scrubber on the vent',
        },
        {
          id: 'oxc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with an epoxide-impurity specification',
          description:
            'Recrystallise and then prove the absence of 10,11-epoxide species by mass spectrometry as well as the usual chemical purity. This step exists because the product specification here is defined by what must not be present, not only by what must.',
          dependsOnStepId: 'oxc-w2',
          reagentsAndBuffer:
            'Ethanol or ethyl acetate for recrystallisation, controlled cooling profile, LC-MS with selected ion monitoring for epoxide masses, powder X-ray diffraction for form confirmation',
        },
        {
          id: 'oxc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Apply the metabolite, not the drug, to a sodium-channel-expressing cell',
          description:
            'Perfuse the 10-monohydroxy derivative onto neurons or transfected cells and hold the membrane at different voltages. Applying oxcarbazepine itself here would measure the wrong molecule: the label states the pharmacological activity is exerted primarily through MHD, and a cell in a dish does not carry out the reduction a liver does.',
          dependsOnStepId: 'oxc-w3',
          reagentsAndBuffer:
            'HEK293 cells or cultured cortical neurons expressing SCN2A, synthetic MHD reference standard, extracellular solution with 140 mM sodium chloride, caesium fluoride internal solution, holding potentials at -120 mV and -70 mV',
        },
        {
          id: 'oxc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Chiral quantification of R- and S-licarbazepine alongside use-dependent block',
          description:
            'Separate the two enantiomers of the active metabolite and quantify each, while measuring how much sodium current is lost across a stimulus train. The reduction of the ketone creates a new chiral centre and the body does not make the two forms equally. That asymmetry is not a laboratory curiosity: the S-enantiomer is marketed as a drug in its own right, as eslicarbazepine acetate.',
          dependsOnStepId: 'oxc-w4',
          reagentsAndBuffer:
            'Chiral stationary phase (polysaccharide-derived) LC column, deuterated MHD internal standard, protein-precipitated plasma, LC-MS/MS in multiple reaction monitoring mode, 10 Hz stimulus trains for the electrophysiology arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'oxc-a1',
        category: 'measured',
        title: 'Adjunctive trial in 692 adults: a clear, dose-ordered reduction against placebo',
        laymanSummary:
          'Adults whose seizures were not controlled added oxcarbazepine or a dummy tablet on top of what they already took. At the highest dose the median seizure count fell by half; on placebo it fell by 7.6%. The effect got bigger at every dose step.',
        technicalDetails:
          'Trial 2 of the label adjunctive programme enrolled 692 patients aged 15 to 66 on 1 to 3 concomitant anti-seizure drugs, stabilised over an 8-week baseline and randomised to fixed doses of oxcarbazepine 600, 1,200 or 2,400 mg/day or placebo, then maintained 24 weeks. Median percentage reduction in partial-onset seizure frequency was 49.9% at 2,400 mg/day (n=174), 40.2% at 1,200 mg/day (n=177), 26.4% at 600 mg/day (n=168) and 7.6% on placebo (n=173), p=0.0001 at every dose. The companion paediatric trial randomised 264 patients aged 3 to 17 to 30 to 46 mg/kg/day or placebo, with median reductions of 34.8% against 9.4%, p=0.0001.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Clinical Studies 14.2, Table 8 (openFDA drug label endpoint)',
        measuredMetric:
          'Median percentage change in partial-onset seizure frequency from baseline, by fixed dose, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'oxc-a2',
        category: 'failed',
        title: 'The dose that halved seizures is the dose two-thirds of patients stopped taking',
        laymanSummary:
          'The 49.9% figure comes from the 2,400 mg group. In that same group, more than 65% of patients quit because of side effects and only 46 of 174 finished the study. The number that gets quoted and the number of people who could live with it are not the same number.',
        technicalDetails:
          'The label states directly, in the clinical studies section rather than in the safety section, that in the high-dose group of the adult adjunctive trial over 65% of patients discontinued treatment because of adverse events, and that only 46 patients (27%) in that group completed the 28-week study. It further notes this was an outcome not seen in the monotherapy studies. A median percentage reduction computed over a cohort that mostly left is a statement about the people who stayed, and the label does not report a responder analysis that carries the drop-outs forward.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Clinical Studies 14.2 (openFDA drug label endpoint)',
        measuredMetric:
          'Discontinuation for adverse events above 65%, and 27% study completion, in the 2,400 mg/day arm',
        inferredClaim:
          'That a 49.9% median seizure reduction at 2,400 mg/day describes what that dose does for a population, rather than what it did for the minority who tolerated it for 28 weeks',
        auditFlag: 'caution',
      },
      {
        id: 'oxc-a3',
        category: 'inferred',
        title: 'The monotherapy licence rests mostly on the drug being compared with itself',
        laymanSummary:
          'Four trials support using oxcarbazepine on its own. Two of them compared 2,400 mg of oxcarbazepine with 300 mg of oxcarbazepine. That design shows the drug does more at a higher dose. It does not compare the drug with an alternative treatment.',
        technicalDetails:
          'The label describes four randomised controlled double-blind monotherapy trials in a predominantly adult population: two against placebo and two using a randomised-withdrawal design comparing high dose (2,400 mg) with low dose (300 mg) after substituting oxcarbazepine for existing drugs. Of the two placebo-controlled trials, one enrolled 102 patients aged 11 to 62 who had been withdrawn from all anti-seizure drugs as inpatients during a pre-surgical evaluation and required 2 to 10 seizures in the 48 hours before randomisation, with an endpoint of time to meet exit criteria over roughly 10 days (p=0.0001); the other enrolled 67 untreated patients with newly diagnosed seizures with time to first seizure as the endpoint over 84 days (p=0.046). The two withdrawal trials enrolled 143 and 87 patients. The largest single number in the monotherapy programme is 143, and the comparator in that trial was a sub-therapeutic dose of the same molecule.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Clinical Studies 14.1 (openFDA drug label endpoint)',
        measuredMetric:
          'Time to meet pre-specified exit criteria, high dose against low dose of the same drug',
        inferredClaim:
          'That oxcarbazepine monotherapy has been shown to control focal seizures as well as an established alternative. The registration programme did not test that; SANAD later did, and found no significant difference from carbamazepine either way.',
        auditFlag: 'caution',
      },
      {
        id: 'oxc-a4',
        category: 'failed',
        title: 'The paediatric monotherapy trial found no difference between high and low dose',
        laymanSummary:
          'A trial in 92 children compared a full dose with a token dose over five days on continuous video-EEG. The two were indistinguishable, p=0.90.',
        technicalDetails:
          'A monotherapy trial in 92 paediatric patients aged 1 month to 16 years with inadequately controlled or new-onset partial seizures randomised them in hospital to oxcarbazepine 10 mg/kg/day or titration to 40 to 60 mg/kg/day within 3 days while the previous drug was withdrawn on day 2. Seizures were recorded by continuous video-EEG from day 3 to day 5, with exit criteria of three study-specific seizures or one prolonged seizure. The between-group difference in time to exit was not statistically significant (p=0.90). The label states in the same paragraph that the effectiveness of oxcarbazepine as monotherapy in children aged 4 to 16 was determined from the adult data plus pharmacokinetic and pharmacodynamic considerations, which is the mechanism by which a paediatric indication survived a failed paediatric trial.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Clinical Studies 14.1 (openFDA drug label endpoint)',
        measuredMetric:
          'Time to meet exit criteria on continuous video-EEG, high dose against low dose',
        auditFlag: 'caution',
      },
      {
        id: 'oxc-a5',
        category: 'measured',
        title: 'Sodium below 125 mmol/L in 2.5% of treated patients and in none of the controls',
        laymanSummary:
          'Across fourteen controlled epilepsy studies, 38 of 1,524 patients on oxcarbazepine dropped their blood sodium below 125. Nobody on placebo, carbamazepine, phenobarbital, phenytoin or valproate did.',
        technicalDetails:
          'The label reports clinically significant hyponatraemia, defined as serum sodium below 125 mmol/L, in 2.5% of oxcarbazepine-treated patients (38 of 1,524) across the 14 controlled epilepsy studies, against no such patients on placebo or on the active controls, which were carbamazepine and phenobarbital in the adjunctive and substitution studies and phenytoin and valproate in the monotherapy initiation studies. It generally appeared in the first 3 months, though some patients first crossed the threshold more than a year in. Most were asymptomatic, but patients in trials were frequently monitored and some had the dose reduced or stopped, and the label states that whether those manoeuvres prevented more severe events is unknown. Symptoms listed include nausea, malaise, headache, lethargy, confusion, obtundation, and an increase in seizure frequency or severity.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Warnings and Precautions 5.1 (openFDA drug label endpoint)',
        measuredMetric:
          'Proportion of patients recording a serum sodium below 125 mmol/L at any point during controlled treatment',
        auditFlag: 'verified',
      },
      {
        id: 'oxc-a6',
        category: 'conclusion_shift',
        title: 'The epoxide was removed. The hypersensitivity was not.',
        laymanSummary:
          'Oxcarbazepine exists because the reactive metabolite of carbamazepine was blamed for its rashes and its toxicity. The redesign removed that metabolite. Between a quarter and a third of people who reacted to carbamazepine still react to oxcarbazepine.',
        technicalDetails:
          'The design rationale was that placing a ketone at the 10-position prevents formation of carbamazepine-10,11-epoxide, forcing reduction to the 10-monohydroxy derivative instead of oxidation, and the pharmacokinetic half of that prediction held: there is no autoinduction and far less CYP3A4 induction. The immunological half did not. The label states that approximately 25% to 30% of patients who have had hypersensitivity reactions to carbamazepine will experience hypersensitivity reactions with oxcarbazepine, instructs that patients be specifically questioned about prior carbamazepine experience, and lists Stevens-Johnson syndrome, toxic epidermal necrolysis, DRESS, anaphylaxis and angioedema among the reactions. The carbamazepine label separately notes limited evidence that HLA-B*1502 is a risk factor for SJS and TEN with other anti-seizure drugs and advises considering avoidance of them in carriers. The reactive-epoxide hypothesis for carbamazepine hypersensitivity therefore lost most of its explanatory force, and HLA-restricted immune recognition of the shared tricyclic scaffold replaced it.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Warnings and Precautions 5.2 and 5.3; carbamazepine United States prescribing information, HLA-B*1502 section (openFDA drug label endpoint)',
        inferredClaim:
          'That removing the reactive epoxide metabolite would remove the hypersensitivity risk. It removed the interactions, not the rash.',
        auditFlag: 'verified',
      },
      {
        id: 'oxc-a7',
        category: 'measured',
        title: 'SANAD: statistically indistinguishable from the drug it was built to replace',
        laymanSummary:
          'In the largest first-line trial in focal epilepsy, oxcarbazepine and carbamazepine could not be separated on either of the two main outcomes, and both were behind lamotrigine on tolerability.',
        technicalDetails:
          'SANAD arm A randomised 1,721 patients across carbamazepine, gabapentin, lamotrigine, oxcarbazepine and topiramate. For time to treatment failure, lamotrigine had a non-significant advantage over oxcarbazepine (HR 1.15, 95% CI 0.86 to 1.54) while being significantly better than carbamazepine, gabapentin and topiramate. For time to 12-month remission, carbamazepine held a non-significant advantage over oxcarbazepine (HR 0.92, 95% CI 0.73 to 1.18). Oxcarbazepine recruited the smallest number of the five arms, so its confidence intervals are the widest in the trial and an absence of a significant difference here is weaker evidence of equivalence than it would be in a larger arm.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1000-1015 (ISRCTN38354748)',
        doi: '10.1016/S0140-6736(07)60460-7',
        measuredMetric:
          'Time to treatment failure and time to 12-month remission against four comparators',
        auditFlag: 'verified',
      },
      {
        id: 'oxc-a8',
        category: 'measured',
        title: 'EURAP: 3.0% malformation rate, inside the range the authors called background',
        laymanSummary:
          'Ten of 333 pregnancies exposed to oxcarbazepine alone ended in a major birth defect. That is 3.0%, roughly half the carbamazepine figure and a third of the valproate one.',
        technicalDetails:
          'The EURAP prospective registry followed pregnancies on anti-epileptic monotherapy at conception from 42 countries between 1999 and 2016. Major congenital malformation prevalence at one year was 10 of 333 (3.0%) for oxcarbazepine, against 17 of 599 (2.8%) for levetiracetam, 74 of 2,514 (2.9%) for lamotrigine, 6 of 152 (3.9%) for topiramate, 107 of 1,957 (5.5%) for carbamazepine, 8 of 125 (6.4%) for phenytoin, 19 of 294 (6.5%) for phenobarbital and 142 of 1,381 (10.3%) for valproate. The authors placed lamotrigine, levetiracetam and oxcarbazepine within the background range for unexposed offspring. The oxcarbazepine denominator is the second smallest in the study, so the estimate is the least precise of the three. Separately, the label warns that MHD levels may fall through pregnancy and return after delivery.',
        evidenceSource: 'Tomson T et al., Lancet Neurol 2018;17:530-538 (EURAP registry)',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric: 'Prevalence of major congenital malformations at 1 year, by drug and dose',
        auditFlag: 'verified',
      },
      {
        id: 'oxc-a9',
        category: 'measured',
        title:
          'It can make generalised seizures worse, and the label says to stop it if that happens',
        laymanSummary:
          'In people whose epilepsy is generalised rather than focal, this drug can increase seizures instead of reducing them. That is a recognised warning, not a rare surprise.',
        technicalDetails:
          'Warnings and Precautions 5.11 states that exacerbation of, or new onset of, primary generalised seizures has been reported with oxcarbazepine, that the risk is seen especially in children but may also occur in adults, and that oxcarbazepine should be discontinued if seizure aggravation occurs. This is a class property of sodium-channel blockers rather than a peculiarity of this molecule, and it is the reason getting the epilepsy syndrome right matters more than getting the drug right.',
        evidenceSource:
          'Oxcarbazepine United States prescribing information, Warnings and Precautions 5.11 (openFDA drug label endpoint)',
        measuredMetric:
          'Reported exacerbation or new onset of primary generalised seizures during treatment',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, then almost entirely converted before it can act',
        laymanDesc:
          'The tablet is absorbed and then rapidly reduced by the liver to a different molecule. That metabolite is the drug that does the work, and it is what blood tests measure.',
        molecularDetail:
          'Oxcarbazepine is reduced by cytosolic arylketone reductase to the 10-monohydroxy derivative (MHD), which the label identifies as the species primarily responsible for pharmacological activity. Because the route is reduction rather than oxidation, no 10,11-epoxide is formed, there is no autoinduction, and CYP3A4 induction is modest by comparison with carbamazepine.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The metabolite crosses into the brain',
        laymanDesc:
          'MHD passes into brain tissue and reaches the outer membranes of nerve cells, which is where sodium pores sit.',
        molecularDetail:
          'MHD circulates as a mixture of two mirror-image forms created when the 10-keto group is reduced. The two are not made in equal amounts, and the S form is marketed separately as the prodrug eslicarbazepine acetate. The relevant compartment is the axonal membrane of cortical neurons.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds sodium channels that have just fired',
        laymanDesc:
          'Sodium pores spend a moment shut and unavailable right after each firing. The metabolite binds them in that state and holds them there, so recently used pores stay out of service.',
        molecularDetail:
          'The label describes blockade of voltage-sensitive sodium channels producing stabilisation of hyperexcited neural membranes, inhibition of repetitive neuronal firing and diminution of propagation of synaptic impulses, and states that the precise mechanism is unknown. It adds increased potassium conductance and modulation of high-voltage-activated calcium channels as possible contributors, and records no significant interaction with brain neurotransmitter or modulator receptor sites.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A repetitive burst runs out of usable channels',
        laymanDesc:
          'Occasional firing is barely affected. Rapid repeated firing loses more pores with every spike, so the burst cannot sustain itself or spread to the next region.',
        molecularDetail:
          'Cumulative use-dependent block reduces sustained high-frequency firing and the propagation of synaptic impulses across the cortex. The same property that suppresses focal seizure spread is thought to underlie the warning that generalised seizure types can be aggravated instead.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A median seizure reduction of about half, at a dose most people could not hold',
        laymanDesc:
          'At 2,400 mg a day the median seizure count fell 49.9% against 7.6% on placebo. In that same arm, more than 65% of patients stopped because of side effects.',
        molecularDetail:
          'Efficacy is established against placebo as adjunctive therapy at 600, 1,200 and 2,400 mg/day with an orderly dose-response, and in children at 30 to 46 mg/kg/day. The monotherapy indication rests largely on high-dose against low-dose randomised withdrawal designs rather than against an active comparator, and SANAD later found no significant separation from carbamazepine.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Adjunctive therapy trial in adults (label Clinical Studies 14.2, Trial 2)',
        phase: 'Phase 3 multicentre randomised double-blind placebo-controlled fixed-dose trial',
        sampleSize: 692,
        primaryEndpoint:
          'Percentage change in partial-onset seizure frequency from an 8-week baseline, over a 24-week maintenance period',
        endpointMet: true,
        statisticalPValue:
          'Median reduction 49.9% at 2,400 mg/day, 40.2% at 1,200 mg/day, 26.4% at 600 mg/day against 7.6% on placebo, P=0.0001 at every dose',
        unreportedAdverseSignals:
          'Over 65% of the 2,400 mg/day group discontinued for adverse events and only 46 of 174 (27%) completed the 28-week study, a fact the label places in the efficacy section rather than the safety section.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Adjunctive therapy trial in children aged 3 to 17 (label Clinical Studies 14.2, Trial 1)',
        phase: 'Phase 3 multicentre randomised double-blind placebo-controlled trial',
        sampleSize: 264,
        primaryEndpoint:
          'Percentage change in partial-onset seizure frequency from baseline over a 14-week maintenance period',
        endpointMet: true,
        statisticalPValue: 'Median reduction 34.8% against 9.4% on placebo, P=0.0001',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Monotherapy substitution trial, oxcarbazepine 2,400 mg/day against 300 mg/day',
        phase: 'Randomised withdrawal, double-blind, 126 days',
        sampleSize: 143,
        primaryEndpoint:
          'Time to meet pre-specified exit criteria after substitution for carbamazepine monotherapy',
        endpointMet: true,
        statisticalPValue: 'P=0.0001 in favour of the 2,400 mg/day group',
        unreportedAdverseSignals:
          'The comparator is a sub-therapeutic dose of the same molecule, so the trial establishes dose-response rather than efficacy against an alternative treatment.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Paediatric monotherapy trial, 10 mg/kg/day against 40 to 60 mg/kg/day',
        phase: 'Randomised, rater-blind, inpatient continuous video-EEG, 5 days',
        sampleSize: 92,
        primaryEndpoint: 'Time to meet exit criteria on continuous video-EEG monitoring',
        endpointMet: false,
        statisticalPValue: 'No statistically significant difference between groups, P=0.90',
        unreportedAdverseSignals:
          'The paediatric monotherapy indication was granted on adult data plus pharmacokinetic and pharmacodynamic extrapolation rather than on this trial.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'SANAD arm A (ISRCTN38354748)',
        phase: 'Unblinded randomised controlled trial, five parallel arms',
        sampleSize: 1721,
        primaryEndpoint:
          'Co-primary: time to treatment failure and time to 12-month remission across five first-line drugs',
        endpointMet: false,
        statisticalPValue:
          'Oxcarbazepine separated significantly from no comparator on either outcome: lamotrigine versus oxcarbazepine HR 1.15 (95% CI 0.86 to 1.54) for treatment failure, carbamazepine versus oxcarbazepine HR 0.92 (0.73 to 1.18) for 12-month remission',
        unreportedAdverseSignals:
          'The oxcarbazepine arm was the smallest of the five, so its intervals are the widest in the trial and the absence of a difference is weak evidence of equivalence.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median partial-onset seizure reduction of 49.9%, 40.2% and 26.4% at 2,400, 1,200 and 600 mg/day against 7.6% on placebo in 692 adults (P=0.0001 at every dose)',
        'Median reduction of 34.8% against 9.4% on placebo in 264 children aged 3 to 17',
        'Serum sodium below 125 mmol/L in 38 of 1,524 treated patients (2.5%) and in none on placebo or active control across 14 controlled studies',
        'Discontinuation for adverse events above 65%, with 27% study completion, in the 2,400 mg/day arm',
        'Hypersensitivity cross-reaction with carbamazepine in approximately 25% to 30% of those who reacted to carbamazepine',
        '10 major congenital malformations in 333 monotherapy-exposed pregnancies (3.0%) in the EURAP registry',
      ],
      unsupportedInferences: [
        'That oxcarbazepine monotherapy has been shown superior or equal to an established alternative: two of its four monotherapy trials compared 2,400 mg with 300 mg of the same drug, and SANAD later found no significant separation from carbamazepine in either direction',
        'That removing the reactive epoxide removed the hypersensitivity risk, when a quarter to a third of carbamazepine reactors still react',
        'That a 49.9% median reduction describes what the 2,400 mg dose achieves in practice, when most of that arm did not stay on it',
        'That it is a safe substitute in any epilepsy syndrome, when the label warns it can aggravate primary generalised seizures',
      ],
      whatFailedInitially: [
        'The paediatric monotherapy trial in 92 children found no difference between a full dose and a token dose (P=0.90); the paediatric monotherapy indication came from extrapolation instead',
        'The highest and most effective adjunctive dose was abandoned by over 65% of the patients assigned to it',
        'The reactive-epoxide explanation for carbamazepine hypersensitivity, which motivated the whole molecule, did not survive contact with the cross-reactivity data',
      ],
      realWorldOutcome: [
        'Widely used where carbamazepine efficacy is wanted without carbamazepine interactions, and used off-label in trigeminal neuralgia, an indication it does not hold in the United States',
        'About 16 US cents per unit at United States pharmacy acquisition cost, a median across 90 listed generic products, cheaper than the parent drug it improves on',
        'Serum sodium monitoring, not seizure control, is the commonest documented reason this particular drug is stopped',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, oral suspension and extended-release tablet',
      description:
        'There is no intravenous oxcarbazepine, so it plays no part in emergency seizure management. The extended-release tablet Oxtellar XR is a separate FDA application with its own registration trial rather than a reformulation of Trileptal, and the two are not interchangeable at the pharmacy counter.',
      safetyProfile:
        'No boxed warning. The distinctive risk is hyponatraemia: serum sodium below 125 mmol/L in 2.5% of treated patients across 14 controlled studies and in none of the controls, usually in the first 3 months but occasionally after a year, with confusion and worsening seizures on the symptom list. Approximately 25% to 30% of people who reacted to carbamazepine react to this drug too, and Stevens-Johnson syndrome, toxic epidermal necrolysis, DRESS, anaphylaxis and angioedema are all on the label. Cognitive dysfunction, somnolence and coordination problems are common. Primary generalised seizures can be aggravated, especially in children. The class-wide suicidality warning applies: 0.43% against 0.24% across 199 pooled placebo-controlled trials of 11 anti-seizure drugs, an adjusted relative risk of 1.8 (95% CI 1.2 to 2.7).',
    },
    commonQuestions: [
      {
        q: 'Is oxcarbazepine just a safer carbamazepine?',
        a: 'Partly. The pharmacokinetic redesign worked: the body reduces oxcarbazepine instead of oxidising it, so there is no reactive epoxide, no autoinduction and much less interference with other medicines. The immunological redesign did not: the label states that approximately 25% to 30% of people who have had hypersensitivity reactions to carbamazepine will react to oxcarbazepine as well. And it introduced a problem carbamazepine has much less of, hyponatraemia, at 2.5% of patients dropping below 125 mmol/L against none of the carbamazepine and phenobarbital controls. On seizure control the two could not be separated in SANAD.',
        auditNote:
          'Different risks, not fewer risks. That is a fair summary of what the comparison actually shows.',
      },
      {
        q: 'Why do I need blood tests for sodium?',
        a: 'Because this drug lowers it and the early symptoms are easy to mistake for something else. Across the 14 controlled epilepsy studies, 38 of 1,524 patients on oxcarbazepine recorded a serum sodium below 125 mmol/L and no patient on placebo or active control did. It usually happens in the first three months, though the label records patients crossing that threshold more than a year after starting. Most were asymptomatic in the trials, where monitoring was frequent. The symptom the label lists that matters most is an increase in seizure frequency or severity, because that reads exactly like the drug failing, and only a blood test tells the two apart.',
      },
      {
        q: 'The trials say seizures dropped by half. Why did my dose never get that high?',
        a: 'Because the 49.9% figure belongs to the 2,400 mg/day arm, and the label says in the same section that over 65% of that arm discontinued for adverse events and only 46 of 174 patients (27%) completed the 28-week study. The lower doses were both effective and better tolerated: 40.2% at 1,200 mg/day and 26.4% at 600 mg/day, each against 7.6% on placebo. This page does not give dosing advice, and the dose a person ends up on is a clinical decision. The point here is only that the largest published number came from the arm most people left.',
        auditNote:
          'The efficacy figure and the discontinuation figure appear in the same paragraph of the label. They are usually quoted apart.',
      },
      {
        q: 'Does it work for trigeminal neuralgia like carbamazepine does?',
        a: 'It is used for that widely, but not on the strength of a United States licence. The FDA-approved indications for oxcarbazepine are partial-onset seizures only, as monotherapy or adjunctive therapy. Carbamazepine, by contrast, holds an explicit trigeminal neuralgia indication and reached the American market for that condition in 1968, six years before its epilepsy indication. Where oxcarbazepine is prescribed for facial pain, that is off-label use resting on mechanistic similarity and smaller trials, not on the registration programme described on this page.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for oxcarbazepine could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 16 US cents per unit as a median across 90 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Oxcarbazepine United States prescribing information: Clinical Studies 14.1 and 14.2, Warnings and Precautions 5.1 to 5.11, Mechanism of Action 12.1, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22OXCARBAZEPINE%22',
        kind: 'regulatory',
      },
      SANAD_I_FOCAL_SOURCE,
      SANAD_II_FOCAL_SOURCE,
      EURAP_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label:
          'Drugs@FDA: TRILEPTAL (oxcarbazepine), NDA 021014, original approval 14 January 2000',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021014',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: OXTELLAR XR (oxcarbazepine extended-release tablets), NDA 202810, Supernus Pharmaceuticals, approved 2012',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202810',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 34312 — oxcarbazepine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/34312',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Topiramate — a sugar derivative with four proposed mechanisms and one very loud side effect.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'topiramate',
    name: 'Topiramate',
    tradeName: 'Topamax / Trokendi XR / Qudexy XR',
    sponsor:
      'Janssen Pharmaceuticals, part of Johnson & Johnson (originator, Topamax); now off-patent with many generic manufacturers, and extended-release versions from Supernus and Upsher-Smith',
    targetGene: 'CA2',
    targetProtein:
      'No single target. The label names four properties at pharmacologically relevant concentrations: blockade of voltage-dependent sodium channels, augmentation of GABA at some GABA-A receptor subtypes, antagonism of AMPA and kainate glutamate receptors, and inhibition of carbonic anhydrase isozymes II and IV. It then states the precise mechanisms are unknown.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Initial monotherapy for partial-onset or primary generalised tonic-clonic seizures from age 2; adjunctive therapy for the same seizure types and for seizures associated with Lennox-Gastaut syndrome from age 2; preventive treatment of migraine in patients 12 years and older',
    patientFriendlyIndication:
      'Epilepsy, including focal and generalised seizures and Lennox-Gastaut syndrome, and prevention of migraine attacks',
    anatomicalSite:
      'Cortical neuron membranes and, for the carbonic anhydrase effects, the kidney tubule, eye and sweat gland as well',
    conditionContext: {
      conditionExplainer:
        'Topiramate is used for two different problems. In epilepsy the aim is to stop a synchronised electrical burst. In migraine the aim is to raise the threshold for a wave of cortical depolarisation and the trigeminovascular response that follows it. The same molecule is licensed for both, which is unusual and is one reason its mechanism is so hard to pin down.',
      whyItMatters:
        'This is one of the few anti-seizure drugs with a large placebo-controlled evidence base in a non-epilepsy indication, and one of very few that reliably causes weight loss rather than weight gain. Both facts widened its use far beyond neurology, and both come attached to a cognitive cost that is measured, dose-related and frequently underweighted.',
      whoTakesThis:
        'People with focal or generalised epilepsy, children with Lennox-Gastaut syndrome, and a much larger group taking it to prevent migraine. It is also a component of the weight-loss combination phentermine-topiramate.',
      clinicalGoals:
        'Fewer seizures or fewer migraine days, at a dose the person can still think clearly on, without acidosis, kidney stones or, in a pregnancy, an oral cleft.',
    },
    oneSentenceVerdict:
      'A sulfamate sugar derivative with four separate proposed mechanisms and no established one, which reduced migraine frequency by about one attack per four weeks more than placebo at the recommended 100 mg dose, lost to lamotrigine on treatment failure in SANAD focal arm (HR 0.64 favouring lamotrigine) and to valproate in the generalised arm (HR 1.57), and whose cognitive side effects reached 56% of patients at the doses used in its adjunctive epilepsy trials against 14% on placebo.',
    laymanHowItWorks:
      'Topiramate does at least four different things at once and nobody has established which of them stops seizures. It slows sodium pores in nerve membranes, it strengthens the brain main calming signal, it weakens one of the main excitatory signals, and it blocks an enzyme called carbonic anhydrase that handles acid and bicarbonate. That last one is not a brain effect at all: it is why the drug makes the blood slightly acidic, causes kidney stones and tingling in the hands, and is part of why people lose weight on it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2547 per unit, the median across 158 listed topiramate products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered at McNeil Pharmaceutical during a programme aimed at antidiabetic sugar derivatives, and approved in the United States as Topamax in December 1996 under NDA 020505. The migraine prevention indication followed in 2004. Composition-of-matter protection has expired and 158 generic products are listed in the CMS file. What remains branded are the extended-release capsules Trokendi XR and Qudexy XR, and the phentermine-topiramate weight-loss combination Qsymia, each a separate FDA application.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Topiramate competes in two different markets and loses to a different drug in each. In focal epilepsy SANAD put lamotrigine ahead of it on treatment failure. In generalised epilepsy the same trial put valproate ahead of it. In migraine prevention it has genuine placebo-controlled evidence, and the comparison there is with propranolol, amitriptyline and the newer CGRP antibodies rather than with anti-seizure drugs.',
      conventionalRx: [
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In SANAD arm A, 1,721 patients with focal epilepsy were randomised across five drugs. Lamotrigine was significantly better than topiramate for time to treatment failure (HR 0.64, 95% CI 0.52 to 0.79), one of the largest separations in the trial. For time to 12-month remission, carbamazepine held a non-significant advantage over topiramate (HR 0.86, 95% CI 0.72 to 1.03).',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: clearly better tolerated in the largest first-line focal epilepsy trial, and no cognitive dose-response of the topiramate kind. Cons: slow introduction because of serious rash, with a boxed warning for it, and no migraine indication.',
        },
        {
          name: 'Valproate (Depakote)',
          class: 'Broad-spectrum, multiple proposed mechanisms',
          howItCompares:
            'In SANAD arm B, 716 patients with generalised or unclassifiable epilepsy were randomised to valproate, lamotrigine or topiramate. Valproate was significantly better than topiramate for time to treatment failure (HR 1.57, 95% CI 1.19 to 2.08), and in the idiopathic generalised epilepsy subgroup the gap widened (HR 1.89, 95% CI 1.32 to 2.70). For time to 12-month remission there was no significant difference between valproate and topiramate.',
          typicalCost:
            'Off-patent; divalproex and valproic acid products are listed separately from the injectable in the CMS NADAC file',
          prosAndCons:
            'Pros: the most effective drug in idiopathic generalised epilepsy across two randomised trials. Cons: 10.3% major congenital malformation rate in EURAP against 3.9% for topiramate, plus the dose-dependent IQ effect, which is precisely why topiramate is reached for instead.',
        },
        {
          name: 'Propranolol',
          class: 'Non-selective beta blocker, for migraine prevention only',
          howItCompares:
            'The long-standing first-line comparator in migraine prophylaxis, with its own FDA indication. No adequately powered head-to-head against topiramate establishes superiority either way, and the choice between them usually turns on which side-effect profile a person can live with rather than on a measured difference in migraine days.',
          typicalCost: 'Off-patent generic; listed separately in the CMS NADAC file',
          prosAndCons:
            'Pros: no cognitive dysfunction, no acidosis, no oral cleft signal. Cons: contraindicated in asthma, causes fatigue and exercise intolerance, and does nothing for seizures.',
        },
        {
          name: 'Zonisamide (Zonegran)',
          class: 'Sulfonamide, also a carbonic anhydrase inhibitor',
          howItCompares:
            'The nearest chemical cousin in the anti-seizure list: another sulfonamide with carbonic anhydrase inhibition, weight loss, kidney stones and paraesthesia. In SANAD II it was tested in focal epilepsy and met non-inferiority to lamotrigine in the intention-to-treat analysis but not in the per-protocol analysis. Topiramate and zonisamide are usually not combined, because their shared carbonic anhydrase effect is additive.',
          typicalCost:
            'US$0.1067 per unit, median across 30 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: once-daily dosing and a long half-life. Cons: the same acidosis, stones and cognitive complaints, plus a sulfonamide hypersensitivity risk.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies. In the one randomised trial, 38% of 145 children with drug-resistant epilepsy halved their seizures on the diet against 6% of controls.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here, and this is the one anti-seizure drug for which the combination carries an explicit label warning: the topiramate label lists a ketogenic diet among the conditions that add to its bicarbonate-lowering effect, and advises avoiding topiramate in patients on a ketogenic diet because of kidney stone risk.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Drink enough water, for a specific chemical reason',
          action:
            'Keep fluid intake up, especially in hot weather or during exercise, and mention any flank pain or blood in the urine promptly.',
          patientImpact:
            'Topiramate inhibits carbonic anhydrase, which raises urine pH and lowers urinary citrate. The label warns about kidney stones and advises against combining topiramate with other carbonic anhydrase inhibitors, with drugs that cause metabolic acidosis, or with a ketogenic diet.',
          clinicalPrecaution:
            'Hydration reduces one risk factor. It does not address the acidosis itself, which the label says should be monitored with baseline and periodic serum bicarbonate measurements.',
        },
        {
          name: 'Watch a child for not sweating',
          action:
            'In hot weather, watch children on topiramate for reduced sweating and rising body temperature rather than waiting for them to complain.',
          patientImpact:
            'Oligohidrosis with hyperthermia is a labelled warning, listed as occurring especially in paediatric patients. A child who stops sweating in the heat loses the main way a body sheds heat.',
          clinicalPrecaution:
            'This is a same-day medical problem, not something to manage with fluids and shade alone.',
        },
        {
          name: 'Treat sudden blurred vision as an emergency',
          action:
            'Any acute loss of visual sharpness or eye pain in the first month of treatment needs immediate contact, not an optometry appointment next week.',
          patientImpact:
            'The label describes a syndrome of acute myopia with secondary angle closure glaucoma, typically within one month of starting, reported in children as well as adults, where primary narrow-angle glaucoma is otherwise rare under 40.',
          clinicalPrecaution:
            'The label states that the primary treatment is discontinuation of topiramate as rapidly as the treating physician judges appropriate. That decision is a prescriber one; getting seen fast is the part a person controls.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1(O[C@@H]2CO[C@@]3([C@H]([C@@H]2O1)OC(O3)(C)C)COS(=O)(=O)N)C',
      chemicalFormula: 'C12H21NO8S',
      molecularWeight: '339.36 g/mol',
      targetReceptorAffinity:
        'Four distinct activities are claimed on the label and none is quoted as the affinity that explains the clinical effect. Carbonic anhydrase II and IV inhibition is the only one with a clean enzymatic constant, and it is also the one least likely to be responsible for the anti-seizure action.',
      structureSource: {
        label: 'PubChem CID 5284627 — topiramate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284627',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'top-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Anomeric and stereochemical purity of the protected fructose',
          description:
            'Confirm 2,3:4,5-bis-O-(1-methylethylidene)-beta-D-fructopyranose before sulfamoylation. Topiramate is a sugar with four stereocentres and two acetonide rings, and the entire molecule identity is set here. A wrong anomer or a partially deprotected diol carries through to a different compound with the same molecular formula.',
          reagentsAndBuffer:
            'Diacetone fructose reference standard, optical rotation, proton and carbon NMR for anomeric assignment, reverse-phase HPLC with refractive index or evaporative light scattering detection',
        },
        {
          id: 'top-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sulfamoylation of the primary hydroxyl',
          description:
            'Attach the sulfamate group to the free primary hydroxyl. That one substituent is what turns an inert protected sugar into a drug: it is the carbonic anhydrase pharmacophore, and it is why topiramate shares side effects with acetazolamide rather than with carbamazepine.',
          dependsOnStepId: 'top-w1',
          reagentsAndBuffer:
            'Sulfamoyl chloride generated in situ from chlorosulfonyl isocyanate and formic acid, pyridine or triethylamine as base, dimethylformamide or dichloromethane, controlled temperature below 0 degrees Celsius, anhydrous conditions',
        },
        {
          id: 'top-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and control of the mono-deprotected impurity',
          description:
            'Recrystallise and set a limit on the partially hydrolysed acetonide. Both acetonide rings are acid-labile, so the specification has to control an impurity generated by the workup itself rather than by the reaction.',
          dependsOnStepId: 'top-w2',
          reagentsAndBuffer:
            'Isopropanol or ethyl acetate and heptane for recrystallisation, controlled pH during workup, LC-MS with selected ion monitoring for the mono-acetonide mass, powder X-ray diffraction for form confirmation',
        },
        {
          id: 'top-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Four parallel cellular preparations, because there are four proposed mechanisms',
          description:
            'Apply the compound to four different preparations at the same concentration: a sodium-channel-expressing cell, a GABA-A receptor preparation, an AMPA and kainate receptor preparation, and neurons in which intracellular pH can be tracked. Testing one preparation and reporting an effect would answer a question nobody asked, because the open question here is not whether topiramate does something but which of four things matters.',
          dependsOnStepId: 'top-w3',
          reagentsAndBuffer:
            'HEK293 cells expressing SCN2A, recombinant GABA-A subunit combinations, AMPA and kainate receptor-expressing cells, primary cortical neurons with a pH-sensitive fluorescent indicator, matched extracellular solutions at a single fixed drug concentration',
        },
        {
          id: 'top-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carbonic anhydrase II and IV inhibition alongside the three neuronal readouts',
          description:
            'Quantify enzyme inhibition constants for carbonic anhydrase II and IV and put them beside the concentration-response curves from the three neuronal assays. The comparison is the point: the enzyme number is the cleanest and is also the one that best predicts the acidosis, the stones and the paraesthesia rather than the seizure control.',
          dependsOnStepId: 'top-w4',
          reagentsAndBuffer:
            'Purified human carbonic anhydrase II and IV, stopped-flow CO2 hydration assay with a pH indicator, acetazolamide as positive control, matched drug concentration series across all four assays',
        },
      ],
    },
    keyAudits: [
      {
        id: 'top-a1',
        category: 'measured',
        title: 'Migraine prevention: about one fewer attack per four weeks than placebo',
        laymanSummary:
          'Two identical placebo-controlled trials measured how many migraines people had before and during treatment. At the recommended 100 mg dose the drop was 2.1 attacks per four weeks against 1.1 on placebo. The benefit over placebo is one migraine a month.',
        technicalDetails:
          'Studies 11 and 12 were multicentre randomised double-blind parallel-group trials in adults with at least six months of migraine by International Headache Society criteria, requiring 3 to 12 migraines in a 4-week baseline, randomised to topiramate 50, 100 or 200 mg/day or placebo for 26 weeks (8-week titration, 18-week maintenance). Mean change in 4-week migraine headache frequency from baseline was -1.4, -2.1 and -2.4 in the 50, 100 and 200 mg/day groups against -1.1 on placebo. The 100 and 200 mg differences from placebo were statistically significant (p=0.008 and p<0.001); the 50 mg difference was not. In the adolescent trial, Study 13, 103 patients aged 12 to 17 were randomised to 50 mg/day, 100 mg/day or placebo; median percentage reduction in monthly attacks was 72.2% at 100 mg against 44.4% on placebo (p=0.0164) while 50 mg was indistinguishable from placebo (p=0.7975).',
        evidenceSource:
          'Topiramate United States prescribing information, Clinical Studies 14.3, Studies 11, 12 and 13 (openFDA drug label endpoint)',
        measuredMetric:
          'Mean change in 4-week migraine headache frequency from baseline, by dose, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'top-a2',
        category: 'measured',
        title: 'Cognitive dysfunction in 56% of patients at the doses used in the epilepsy trials',
        laymanSummary:
          'Word-finding trouble, slowed thinking and memory problems are not rare on this drug and they are not imagined. In the adjunctive epilepsy trials 56% of patients on the highest doses reported them, against 14% on placebo. The rate tracks the dose and how fast the dose was raised.',
        technicalDetails:
          'The label reports that in adult adjunctive epilepsy controlled trials, which used rapid titration in 100 to 200 mg/day weekly increments to targets of 200 to 1,000 mg/day, 56% of patients in the 800 and 1,000 mg/day groups experienced cognitive-related dysfunction, against approximately 42% at 200 to 400 mg/day and 14% on placebo. In the monotherapy epilepsy controlled trial the rate was 19% at 50 mg/day and 26% at 400 mg/day. In the 6-month migraine trials, which titrated more slowly at 25 mg/day weekly increments, rates were 19% at 50 mg/day, 22% at 100 mg/day, 28% at 200 mg/day and 10% on placebo. The label groups the reactions as cognitive-related dysfunction (confusion, psychomotor slowing, concentration and memory difficulty, speech and language problems, particularly word-finding), psychiatric and behavioural disturbances, and somnolence or fatigue, and states that both rapid titration and higher initial dose were associated with higher incidences.',
        evidenceSource:
          'Topiramate United States prescribing information, Warnings and Precautions 5.6 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of cognitive-related adverse reactions by dose and titration rate, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'top-a3',
        category: 'failed',
        title:
          'SANAD focal arm: the largest tolerability gap in the trial, and it went against topiramate',
        laymanSummary:
          'In 1,721 patients with focal epilepsy randomised across five drugs, lamotrigine beat topiramate on how long people stayed on their assigned drug by the widest margin of any comparison in the study.',
        technicalDetails:
          'SANAD arm A randomised 1,721 patients for whom carbamazepine was deemed standard treatment to carbamazepine, gabapentin, lamotrigine, oxcarbazepine or topiramate, with co-primary outcomes of time to treatment failure and time to 12-month remission. For time to treatment failure, lamotrigine was significantly better than topiramate (HR 0.64, 95% CI 0.52 to 0.79) and than gabapentin (0.65, 0.52 to 0.80) and carbamazepine (0.78, 0.63 to 0.97). For time to 12-month remission, carbamazepine held a non-significant advantage over topiramate (HR 0.86, 95% CI 0.72 to 1.03). The pattern is consistent with the label: topiramate is not a weak anti-seizure drug, it is a drug people stop taking.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1000-1015 (ISRCTN38354748)',
        doi: '10.1016/S0140-6736(07)60460-7',
        measuredMetric:
          'Time to treatment failure and time to 12-month remission across five drugs',
        auditFlag: 'verified',
      },
      {
        id: 'top-a4',
        category: 'failed',
        title:
          'SANAD generalised arm: valproate was better, and worse in the syndrome that matters',
        laymanSummary:
          'In 716 patients with generalised epilepsy, valproate beat topiramate on staying on treatment. Among the subgroup with genetic generalised epilepsy, the gap was larger still.',
        technicalDetails:
          'SANAD arm B randomised 716 patients for whom valproate was considered standard treatment to valproate, lamotrigine or topiramate. For time to treatment failure, valproate was significantly better than topiramate (HR 1.57, 95% CI 1.19 to 2.08) while showing no significant difference from lamotrigine (1.25, 0.94 to 1.68). Restricted to idiopathic generalised epilepsy, valproate was significantly better than both lamotrigine (1.55, 1.07 to 2.24) and topiramate (1.89, 1.32 to 2.70). For time to 12-month remission valproate was significantly better than lamotrigine overall (0.76, 0.62 to 0.94) but showed no significant difference from topiramate in either the overall analysis or the idiopathic generalised subgroup. The authors concluded valproate should remain the drug of first choice for many patients with generalised and unclassified epilepsies, while noting the pregnancy problem that makes that conclusion hard to act on.',
        evidenceSource: 'Marson AG et al., Lancet 2007;369:1016-1026 (ISRCTN38354748)',
        doi: '10.1016/S0140-6736(07)60461-9',
        measuredMetric:
          'Time to treatment failure and time to 12-month remission, valproate against lamotrigine and topiramate',
        auditFlag: 'verified',
      },
      {
        id: 'top-a5',
        category: 'inferred',
        title: 'The monotherapy licence rests on 400 mg of topiramate against 50 mg of topiramate',
        laymanSummary:
          'The trial that established topiramate as a stand-alone first drug compared a high dose with a low dose of the same drug. It shows more works better than less. It does not show the drug works better than an alternative.',
        technicalDetails:
          'Study 1 was a multicentre randomised double-blind parallel-group trial in 487 patients aged 6 to 83 with 1 or 2 documented seizures in a 3-month retrospective baseline; 470 were randomised in the double-blind phase to titrate to 50 mg/day or 400 mg/day, with maintenance at the maximum tolerated dose. Forty-nine percent had no prior anti-seizure treatment. Fifty-eight percent reached 400 mg/day for more than two weeks, and patients who could not tolerate 150 mg/day were discontinued. The primary assessment was a between-group comparison of time to first seizure, and the Kaplan-Meier curves favoured 400 mg over 50 mg. The paediatric monotherapy conclusion for ages 2 to 9 was reached by a pharmacometric bridging approach rather than by a trial in that age group at all. SANAD supplied the missing active comparison seven years later, and topiramate lost it.',
        evidenceSource:
          'Topiramate United States prescribing information, Clinical Studies 14.1, Study 1 (openFDA drug label endpoint)',
        measuredMetric: 'Time to first seizure, 400 mg/day against 50 mg/day of the same drug',
        inferredClaim:
          'That topiramate monotherapy has been shown to control seizures as well as an established first-line drug. Its registration programme did not test that, and the trial that did test it put topiramate last on tolerability.',
        auditFlag: 'caution',
      },
      {
        id: 'top-a6',
        category: 'measured',
        title: 'Metabolic acidosis in up to 67% of children, and thinner bones alongside it',
        laymanSummary:
          'Blocking carbonic anhydrase makes the kidney lose bicarbonate, so the blood turns slightly acidic. In paediatric epilepsy trials this happened in as many as two thirds of children, and a bone-density study found measurable losses that tracked the acidosis.',
        technicalDetails:
          'The label states that topiramate causes hyperchloraemic, non-anion-gap metabolic acidosis by renal bicarbonate loss due to carbonic anhydrase inhibition, that it can occur at any time during treatment, that decrements average 4 mEq/L at 400 mg/day in adults and about 6 mg/kg/day in children, and that rare patients fall below 10 mEq/L. Incidence of decreased serum bicarbonate in paediatric adjunctive trials for Lennox-Gastaut syndrome or refractory partial-onset seizures reached 67%. A separate one-year active-controlled paediatric study (N=63) found statistically significant decreases in lumbar spine and total-body-less-head bone mineral density, with 21% of topiramate-treated patients showing a Z-score change of -0.5 or greater against 0 patients in the control group, most commonly in children aged 6 to 9, and decreased lumbar spine density correlated with decreased serum bicarbonate. The label notes the study was too small and too short to say whether fracture risk rises.',
        evidenceSource:
          'Topiramate United States prescribing information, Warnings and Precautions 5.4 and 5.9 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of decreased serum bicarbonate and proportion with a bone mineral density Z-score change of -0.5 or greater',
        auditFlag: 'verified',
      },
      {
        id: 'top-a7',
        category: 'conclusion_shift',
        title: 'The autism signal did not survive adjustment for why the drug was prescribed',
        laymanSummary:
          'Children exposed to topiramate before birth do have more autism diagnoses than the general population. Once the comparison was made against children of mothers with epilepsy who took nothing, and adjusted for confounders, the topiramate association essentially vanished. The valproate one did not.',
        technicalDetails:
          'Hernandez-Diaz and colleagues assembled a population-based cohort from two United States healthcare databases covering 2000 to 2020, defining exposure by prescription fills from gestational week 19 to delivery. Cumulative incidence of autism spectrum disorder at age 8 was 1.9% among 4,199,796 children unexposed to any anti-seizure medication. Restricted to children of mothers with epilepsy it was 4.2% with no exposure (8,815 children), 6.2% with topiramate (1,030), 10.5% with valproate (800) and 4.1% with lamotrigine (4,205). Propensity-score-adjusted hazard ratios against no exposure were 0.96 (95% CI 0.56 to 1.65) for topiramate, 1.00 (0.69 to 1.46) for lamotrigine and 2.67 (1.69 to 4.20) for valproate. The authors used valproate as a positive control and lamotrigine as a negative control, which is what makes the null result for topiramate interpretable rather than merely underpowered. This changes nothing about the oral cleft risk, which is a separate, structural, first-trimester endpoint and remains on the label.',
        evidenceSource: 'Hernandez-Diaz S et al., N Engl J Med 2024;390:1069-1079 (PMID 38507750)',
        doi: '10.1056/NEJMoa2309359',
        measuredMetric:
          'Propensity-score-adjusted hazard ratio for autism spectrum disorder by age 8, against unexposed children of mothers with epilepsy',
        inferredClaim:
          'That the raised crude autism rate among topiramate-exposed children was caused by the drug. Comparing them with the right control group and adjusting for indication removed almost all of it.',
        auditFlag: 'verified',
      },
      {
        id: 'top-a8',
        category: 'measured',
        title: 'Oral clefts and small-for-gestational-age babies are on the label',
        laymanSummary:
          'Registry data show more cleft lip and cleft palate, and more underweight newborns, after topiramate exposure in pregnancy. The malformation rate in the EURAP registry was 3.9%, but that figure rests on only 152 pregnancies.',
        technicalDetails:
          'Warnings and Precautions 5.7 states that topiramate can cause fetal harm, that pregnancy registry data show an increased risk of major congenital malformations including but not limited to cleft lip and cleft palate and of being small for gestational age, and that structural malformations including craniofacial defects and reduced fetal weights occurred in multiple animal species at clinically relevant doses. The label adds a specific instruction to weigh the risk when topiramate is considered for a condition not usually associated with permanent injury or death, which is a direct reference to migraine prevention. In EURAP, major congenital malformation prevalence at one year for topiramate monotherapy was 6 of 152 (3.9%), the smallest denominator of the eight drugs compared and therefore the least precise estimate in that study.',
        evidenceSource:
          'Topiramate United States prescribing information, Warnings and Precautions 5.7; Tomson T et al., Lancet Neurol 2018;17:530-538',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric:
          'Registry-reported prevalence of major congenital malformations, oral clefts and small-for-gestational-age status after in-utero exposure',
        auditFlag: 'caution',
      },
      {
        id: 'top-a9',
        category: 'inferred',
        title:
          'Four mechanisms are listed. None is established, and one explains the side effects better than the benefit.',
        laymanSummary:
          'The label names four things topiramate does and then says the precise mechanisms are unknown. The one with the cleanest laboratory measurement, blocking carbonic anhydrase, is the one that best explains the acidosis, the stones and the tingling rather than the seizure control.',
        technicalDetails:
          'Mechanism of Action 12.1 states that the precise mechanisms by which topiramate exerts its anticonvulsant and preventive migraine effects are unknown, then lists four preclinical properties at pharmacologically relevant concentrations: blockade of voltage-dependent sodium channels, augmentation of GABA activity at some GABA-A receptor subtypes, antagonism of the AMPA and kainate subtype of the glutamate receptor, and inhibition of carbonic anhydrase, particularly isozymes II and IV. No published work assigns a share of the clinical effect to any one of them. The carbonic anhydrase activity, by contrast, has a clear and traceable chain to observable consequences: renal bicarbonate loss, hyperchloraemic non-anion-gap acidosis, raised urine pH, kidney stones, paraesthesia, reduced bone mineral density and part of the weight loss. A mechanism that predicts the harms well and the benefit not at all is a mechanism that has not been shown to be the mechanism.',
        evidenceSource:
          'Topiramate United States prescribing information, Mechanism of Action 12.1 and Warnings and Precautions 5.4 and 5.15 (openFDA drug label endpoint)',
        inferredClaim:
          'That listing four plausible molecular actions amounts to knowing how the drug works. The label itself declines to make that claim.',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed well, and mostly excreted unchanged',
        laymanDesc:
          'Absorption is rapid and nearly complete, and food does not matter much. Most of the drug leaves in the urine without being broken down, so kidney function governs how much stays in the body.',
        molecularDetail:
          'Bioavailability is high and largely food-independent. Protein binding is low. Clearance is predominantly renal, with hepatic metabolism a minor route unless an enzyme-inducing anti-seizure drug is present, in which case metabolism rises and topiramate exposure falls. Titration rate, not just dose, drives the cognitive adverse reaction rate.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the brain, and also the kidney, eye and sweat gland',
        laymanDesc:
          'The molecule crosses into brain tissue, but it does not stay there. Carbonic anhydrase, one of its targets, sits in the kidney tubule, the eye and the sweat gland too, which is why several of its effects are not neurological at all.',
        molecularDetail:
          'Distribution is not brain-selective. Inhibition of carbonic anhydrase isozymes II and IV in renal tubule, ciliary body and eccrine gland accounts for the labelled warnings on metabolic acidosis, acute myopia with secondary angle closure glaucoma, oligohidrosis with hyperthermia and nephrolithiasis.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It acts on four targets at once',
        laymanDesc:
          'It slows sodium pores, strengthens the calming GABA signal, weakens an excitatory glutamate signal, and blocks a bicarbonate enzyme. Which of these stops a seizure has never been settled.',
        molecularDetail:
          'The label names blockade of voltage-dependent sodium channels, augmentation of GABA at some GABA-A receptor subtypes, antagonism of AMPA and kainate glutamate receptors, and inhibition of carbonic anhydrase II and IV, all at pharmacologically relevant concentrations, and states the precise mechanisms are unknown. No study apportions the clinical effect between them.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Excitability falls, and so does serum bicarbonate',
        laymanDesc:
          'The net effect on the brain is that it takes more to start and sustain a burst of firing. The net effect on the body is a mild, persistent shift towards acid.',
        molecularDetail:
          'Bicarbonate decrements average 4 mEq/L at 400 mg/day in adults and about 6 mg/kg/day in children, reaching 67% incidence in paediatric adjunctive trials, and rarely fall below 10 mEq/L. Conditions that predispose to acidosis, including renal disease, severe respiratory disorders, status epilepticus, diarrhoea and a ketogenic diet, add to the effect.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer seizures or fewer migraines, at a measured cognitive cost',
        laymanDesc:
          'For migraine at the recommended dose, about one fewer attack per four weeks than placebo. For epilepsy, effective but the drug people were most likely to stop in the largest first-line trial. Cognitive complaints reached 56% at the highest trial doses against 14% on placebo.',
        molecularDetail:
          'Efficacy is established against placebo in six adjunctive epilepsy trials, in Lennox-Gastaut syndrome and in two adult plus one adolescent migraine prevention trial. Efficacy against an active comparator has been tested in SANAD arms A and B, and topiramate finished behind lamotrigine and behind valproate respectively on time to treatment failure.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Monotherapy epilepsy Study 1 (label Clinical Studies 14.1)',
        phase: 'Multicentre randomised double-blind parallel-group trial',
        sampleSize: 470,
        primaryEndpoint:
          'Time to first seizure during the double-blind phase, topiramate 400 mg/day against topiramate 50 mg/day',
        endpointMet: true,
        statisticalPValue:
          'Kaplan-Meier curves for time to first seizure favoured 400 mg/day over 50 mg/day; the label reports the comparison graphically rather than as a hazard ratio',
        unreportedAdverseSignals:
          'The comparator is a sub-therapeutic dose of the same molecule. Patients unable to tolerate 150 mg/day were discontinued, and only 58% reached 400 mg/day for more than two weeks.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'SANAD arm A (ISRCTN38354748)',
        phase: 'Unblinded randomised controlled trial, five parallel arms',
        sampleSize: 1721,
        primaryEndpoint:
          'Co-primary: time to treatment failure and time to 12-month remission across five first-line drugs in focal epilepsy',
        endpointMet: false,
        statisticalPValue:
          'Lamotrigine significantly better than topiramate for time to treatment failure, HR 0.64 (95% CI 0.52 to 0.79); carbamazepine non-significantly better for 12-month remission, HR 0.86 (0.72 to 1.03)',
        unreportedAdverseSignals:
          'The gap between lamotrigine and topiramate on treatment failure was the largest of the trial, and treatment failure in an unblinded trial is a clinician decision as much as a drug property.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD arm B (ISRCTN38354748)',
        phase: 'Unblinded randomised controlled trial, three parallel arms',
        sampleSize: 716,
        primaryEndpoint:
          'Co-primary: time to treatment failure and time to 12-month remission, valproate against lamotrigine and topiramate in generalised and unclassifiable epilepsy',
        endpointMet: false,
        statisticalPValue:
          'Valproate significantly better than topiramate for treatment failure, HR 1.57 (95% CI 1.19 to 2.08); in idiopathic generalised epilepsy HR 1.89 (1.32 to 2.70); no significant difference for 12-month remission',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Adolescent migraine prevention Study 13 (label Clinical Studies 14.3)',
        phase: 'Multicentre randomised double-blind parallel-group trial, 16 weeks',
        sampleSize: 103,
        primaryEndpoint:
          'Percentage reduction from baseline in average monthly migraine attack rate over the last 12 weeks of the double-blind phase',
        endpointMet: true,
        statisticalPValue:
          'Median reduction 72.2% at 100 mg/day against 44.4% on placebo, P=0.0164; 50 mg/day 44.6%, P=0.7975',
        unreportedAdverseSignals:
          'The placebo group achieved a 44.4% median reduction on its own, which is why the 50 mg dose was indistinguishable from it.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Mean change in 4-week migraine frequency of -2.1 at 100 mg/day against -1.1 on placebo, a placebo-adjusted benefit of about one attack per four weeks (P=0.008)',
        'Cognitive-related dysfunction in 56% at 800 to 1,000 mg/day, 42% at 200 to 400 mg/day and 14% on placebo in the adjunctive epilepsy trials',
        'Time to treatment failure worse than lamotrigine in focal epilepsy, HR 0.64 (95% CI 0.52 to 0.79), and worse than valproate in generalised epilepsy, HR 1.57 (1.19 to 2.08)',
        'Decreased serum bicarbonate in up to 67% of children in paediatric adjunctive trials, averaging a 4 mEq/L fall at 400 mg/day in adults',
        'Clinically important bone mineral density reduction in 21% of paediatric patients against 0% of controls in a 63-patient one-year study',
        'Propensity-score-adjusted autism hazard ratio of 0.96 (95% CI 0.56 to 1.65) against unexposed children of mothers with epilepsy',
      ],
      unsupportedInferences: [
        'That the mechanism of topiramate is known: the label lists four candidate actions and states the precise mechanisms are unknown',
        'That monotherapy efficacy was demonstrated against an alternative treatment, when the registration trial compared 400 mg with 50 mg of the same drug',
        'That the raised crude autism rate in exposed children reflects a drug effect, when adjustment for indication removed almost all of it',
        'That cognitive complaints on this drug are the epilepsy or the migraine rather than the drug, when the label reports a clean dose-response against placebo',
      ],
      whatFailedInitially: [
        'It came out of a programme searching for antidiabetic sugar derivatives, and the anticonvulsant activity was an incidental finding rather than the objective',
        'It finished behind lamotrigine in SANAD arm A and behind valproate in SANAD arm B, on the outcome that measures whether people can stay on a drug',
        'The 50 mg dose failed to separate from placebo in the adolescent migraine trial, where placebo alone produced a 44.4% median reduction',
      ],
      realWorldOutcome: [
        'Far more widely prescribed for migraine prevention than for epilepsy, an indication for which the label explicitly warns about weighing fetal risk',
        'About 25 US cents per unit at United States pharmacy acquisition cost, a median across 158 listed generic products, the largest product count of any drug on these pages',
        'Its weight-loss effect, a side effect in epilepsy, became a licensed indication in the phentermine-topiramate combination',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, sprinkle capsule, extended-release capsule and oral solution',
      description:
        'The sprinkle capsule exists so a dose can be given to a child or to someone who cannot swallow tablets, and the extended-release capsules Trokendi XR and Qudexy XR are separate FDA applications rather than reformulations, taken once daily. There is no intravenous topiramate, so it has no role in acute seizure management. Titration rate is not a convenience question here: the label ties higher cognitive adverse reaction rates directly to rapid titration and higher starting doses.',
      safetyProfile:
        'No boxed warning, and an unusually long warnings list. Cognitive dysfunction is the defining problem, at 56% in the highest-dose adjunctive epilepsy arms against 14% on placebo. Carbonic anhydrase inhibition drives metabolic acidosis (up to 67% of children in paediatric trials), kidney stones, paraesthesia, reduced bone mineral density in children and oligohidrosis with hyperthermia. Acute myopia with secondary angle closure glaucoma typically appears within the first month and is treated by stopping the drug. Hyperammonaemia and encephalopathy can occur, more so with concomitant valproate, as can hypothermia. Oral clefts and small-for-gestational-age birth are labelled fetal risks. DRESS, Stevens-Johnson syndrome, toxic epidermal necrolysis, anaphylaxis and angioedema are all listed. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Are the word-finding problems on topiramate real, or is it my age or my epilepsy?',
        a: 'They are measured against placebo, at several doses, in two different patient populations, which is what separates a drug effect from everything else. In the adjunctive epilepsy trials, 56% of patients at 800 to 1,000 mg/day reported cognitive-related dysfunction, against about 42% at 200 to 400 mg/day and 14% on placebo. In the migraine trials, where titration was slower, rates were 19% at 50 mg, 22% at 100 mg, 28% at 200 mg and 10% on placebo. The label groups the specific complaints as confusion, psychomotor slowing, difficulty with concentration and memory, and speech or language problems, particularly word-finding difficulties. It also states that rapid titration and a higher starting dose raised the rate.',
        auditNote:
          'A clean dose-response against placebo in two populations is about as strong as this kind of claim gets.',
      },
      {
        q: 'How much does topiramate actually help migraine?',
        a: 'At the recommended 100 mg/day dose, the placebo-adjusted benefit in the two registration trials was about one migraine per four weeks: mean frequency fell 2.1 attacks on topiramate against 1.1 on placebo, p=0.008. Doubling to 200 mg/day moved that to 2.4 against 1.1 and was also significant, while 50 mg/day was not significantly better than placebo. In the adolescent trial, 100 mg gave a 72.2% median reduction against 44.4% on placebo, and 50 mg gave 44.6%, which is to say nothing. Whether one fewer migraine a month is worth a 22% chance of cognitive side effects is a judgement, and the trial data are what it should be made on.',
      },
      {
        q: 'Why do I have pins and needles, and why do people lose weight on this?',
        a: 'Both trace to the same target. Topiramate inhibits carbonic anhydrase, the enzyme that manages bicarbonate, and the label names isozymes II and IV specifically. The consequences are systemic rather than neurological: the kidney loses bicarbonate, producing a hyperchloraemic non-anion-gap metabolic acidosis that averages a 4 mEq/L fall at 400 mg/day in adults; urine pH rises and kidney stones become more likely; peripheral paraesthesia is common; children lose bone mineral density in proportion to the bicarbonate fall. Appetite suppression and weight loss belong to the same cluster. That effect became a licensed indication in its own right in the phentermine-topiramate combination.',
      },
      {
        q: 'I read that topiramate in pregnancy causes autism. Is that true?',
        a: 'The best current answer is no, and the study that says so was designed to be able to say so. Hernandez-Diaz and colleagues followed a United States cohort from 2000 to 2020 and found autism at age 8 in 6.2% of 1,030 topiramate-exposed children of mothers with epilepsy, against 4.2% of 8,815 unexposed children of mothers with epilepsy. After propensity-score adjustment the hazard ratio was 0.96 (95% CI 0.56 to 1.65). The same analysis returned 2.67 (1.69 to 4.20) for valproate and 1.00 (0.69 to 1.46) for lamotrigine, which is exactly the pattern a working method should produce: it detected the effect that is real and did not manufacture one that is not. This says nothing about oral clefts, which are a first-trimester structural risk, remain on the label, and are a separate question.',
        auditNote:
          'A negative result is only informative when the same analysis detects a known positive. This one did.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for topiramate could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 25 US cents per unit as a median across 158 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Topiramate United States prescribing information: Clinical Studies 14.1 to 14.3, Warnings and Precautions 5.1 to 5.16, Mechanism of Action 12.1, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22TOPIRAMATE%22',
        kind: 'regulatory',
      },
      SANAD_I_FOCAL_SOURCE,
      SANAD_I_GENERALISED_SOURCE,
      {
        label:
          'Hernandez-Diaz S et al. Risk of Autism after Prenatal Topiramate, Valproate, or Lamotrigine Exposure. N Engl J Med 2024;390:1069-1079',
        identifier: '10.1056/NEJMoa2309359',
        kind: 'doi',
      },
      EURAP_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label:
          'Drugs@FDA: TOPAMAX (topiramate), NDA 020505, original approval 24 December 1996; migraine prevention indication added 2004',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020505',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5284627 — topiramate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5284627',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Zonisamide — approved in Japan in 1989, in the United States in 2000, on the same data.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zonisamide',
    name: 'Zonisamide',
    tradeName: 'Zonegran / Zonisade',
    sponsor:
      'Dainippon Sumitomo Pharma (originator, Japan); Elan and then Eisai in the United States; now generic, with Advanz Pharma and Azurity among current marketers',
    targetGene: 'SCN2A',
    targetProtein:
      'Voltage-gated sodium channels and T-type calcium channels, with secondary carbonic anhydrase inhibition. The label states the precise mechanisms by which zonisamide exerts its antiseizure effect are unknown.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'Adjunctive therapy in the treatment of partial-onset seizures in adults and, for the oral suspension, in patients 16 years of age and older',
    patientFriendlyIndication: 'Focal (partial-onset) epilepsy, added to other seizure medicines',
    anatomicalSite:
      'Cortical neuron membranes for the channel effects; kidney tubule, eye and sweat gland for the carbonic anhydrase effects',
    conditionContext: {
      conditionExplainer:
        'Partial-onset seizures start in one region of cortex. An adjunctive drug is added when one or two existing drugs have already failed to stop them, which means the population in these trials is by definition the population that has already not responded to the easier options.',
      whyItMatters:
        'Zonisamide is a sulfonamide, and that single chemical fact organises most of its risk profile: the severe skin reactions, the blood dyscrasias, the kidney stones, the acidosis and the failure to sweat all belong to the sulfonamide class rather than to anything specific about epilepsy.',
      whoTakesThis:
        'Adults with focal epilepsy not controlled on one or two drugs. It is taken once a day, which is unusual in this class and is one of its main practical arguments.',
      clinicalGoals:
        'A meaningful fall in seizure count on top of existing treatment, without a rash, without a stone, and without the word-finding and psychomotor problems that appear above 300 mg a day.',
    },
    oneSentenceVerdict:
      'A once-daily sulfonamide that cut partial seizure frequency by a median of 40.5% against 9% on placebo in its largest registration trial, met non-inferiority to lamotrigine in the intention-to-treat analysis of SANAD II and failed it in the per-protocol analysis, and carries a sulfonamide risk profile that includes 49 reported cases of Stevens-Johnson syndrome or toxic epidermal necrolysis in eleven years of Japanese marketing and kidney stones in 4% of adults in the development programme.',
    laymanHowItWorks:
      'Zonisamide slows two kinds of electrical gate in nerve membranes: the sodium gates that let a cell fire, and a particular calcium gate that helps groups of cells fire in unison. Damping both makes it harder for a burst of firing to build and to synchronise. It also weakly blocks carbonic anhydrase, an enzyme that handles bicarbonate, and that unrelated action is where the kidney stones, the mild blood acidity and the loss of sweating come from.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1067 per unit, the median across 30 listed zonisamide products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised in Japan in the 1970s and approved there for epilepsy in 1989. United States approval came eleven years later, in March 2000, as Zonegran under NDA 020789, on an adjunctive indication in adults. Now generic, at the lowest per-unit acquisition cost of any drug on these anti-seizure pages. The oral suspension Zonisade is a separate, later application.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Zonisamide has been put head to head against lamotrigine once, in SANAD II, and the answer depended on which analysis you read. Its nearest chemical relative in the class is topiramate, which shares the carbonic anhydrase problems. Levetiracetam is the usual alternative when the goal is to avoid sulfonamide chemistry entirely.',
      conventionalRx: [
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In SANAD II, 990 people with newly diagnosed focal epilepsy were randomised between lamotrigine (n=330), levetiracetam (n=332) and zonisamide (n=328). Zonisamide met the non-inferiority criterion against lamotrigine in the intention-to-treat analysis of time to 12-month remission (HR 1.03, 97.5% CI 0.83 to 1.28), but in the per-protocol analysis lamotrigine was superior (HR 1.37, 97.5% CI 1.08 to 1.73). Adverse reactions were reported by 33% starting lamotrigine and 45% starting zonisamide.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: won the cost-utility analysis of SANAD II at 1.403 QALYs against 1.232 for zonisamide, and does not cause acidosis or stones. Cons: slow introduction because of serious rash, with a boxed warning for it, and twice-daily dosing.',
        },
        {
          name: 'Topiramate (Topamax)',
          class: 'Sulfamate, also a carbonic anhydrase inhibitor',
          howItCompares:
            'The closest functional relative: another carbonic anhydrase inhibitor with acidosis, kidney stones, paraesthesia, weight loss, cognitive slowing and word-finding difficulty. No adequately powered head-to-head trial separates the two in focal epilepsy. Combining them is generally avoided because the carbonic anhydrase effects add.',
          typicalCost:
            'US$0.2547 per unit, median across 158 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: a much larger evidence base, including monotherapy and migraine indications. Cons: the same metabolic problems, plus a cognitive dose-response reaching 56% at the highest trial doses.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand, unrelated mechanism and unrelated chemistry',
          howItCompares:
            'In the same SANAD II trial, levetiracetam failed non-inferiority to lamotrigine in the intention-to-treat analysis (HR 1.18, 97.5% CI 0.95 to 1.47) where zonisamide passed it, and both failed the per-protocol comparison. Adverse reactions were 44% for levetiracetam and 45% for zonisamide.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no sulfonamide chemistry, so no cross-reaction with sulfa allergy, no stones and no acidosis, and it has an intravenous form. Cons: irritability and aggression in 13% of adults and 38% of children in its registration trials.',
        },
        {
          name: 'Lacosamide (Vimpat)',
          class: 'Slow-inactivation sodium channel modulator',
          howItCompares:
            'A later adjunctive drug for the same indication and population, with placebo-controlled trials of comparable design. No head-to-head trial establishes a difference in seizure control. It does not inhibit carbonic anhydrase, so it carries none of the stone, acidosis or sweating problems.',
          typicalCost:
            'US$0.1676 per unit, median across 94 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no sulfonamide risk and few interactions. Cons: dose-dependent PR interval prolongation and dizziness, and it is a controlled substance in the United States.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies. In the one randomised trial, 38% of 145 children with drug-resistant epilepsy halved their seizures on the diet against 6% of controls.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here, and the zonisamide label names a ketogenic diet explicitly among the conditions and therapies that add to its bicarbonate-lowering effect. Combining the two is a decision with a specific metabolic consequence, not a neutral one.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Say whether you are allergic to sulfa drugs',
          action:
            'Before the first dose, tell the prescriber about any previous reaction to a sulfonamide antibiotic or to any other sulfa medicine.',
          patientImpact:
            'Zonisamide is a sulfonamide. The label opens its warnings by listing the reactions that have proved fatal in this class: Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias, and notes such reactions may recur on any route of readministration.',
          clinicalPrecaution:
            'This is a class warning rather than a measured cross-reaction rate for this specific drug. It is a reason for the prescriber to know, not a reason to stop a prescribed drug unilaterally.',
        },
        {
          name: 'Report any unexplained rash rather than watching it',
          action:
            'Any rash without a clear other cause, especially in the first four months, is a same-day phone call.',
          patientImpact:
            'In the United States and European randomised trials, 6 of 269 patients (2.2%) stopped zonisamide because of rash and none on placebo did. Eighty-five percent of rashes in those studies appeared within 16 weeks, and 90% in the Japanese studies appeared within two weeks. The label reports no relationship between dose and rash.',
          clinicalPrecaution:
            'The label states that consideration should be given to discontinuing zonisamide in a patient with an otherwise unexplained rash, and that if the drug is not stopped the patient should be observed frequently. That is a clinical decision.',
        },
        {
          name: 'Keep fluids up, and watch a young person for not sweating in the heat',
          action:
            'Maintain fluid intake, and in hot weather watch for reduced sweating and rising temperature in anyone young taking this drug.',
          patientImpact:
            'Nephrolithiasis occurred in 4% of adults in the development programme, and was found on ultrasound in 8% of paediatric patients who had one. Oligohidrosis with hyperthermia has caused heat stroke requiring hospitalisation, and paediatric patients appear to be at increased risk.',
          clinicalPrecaution:
            'The label warns specifically about combining zonisamide with other carbonic anhydrase inhibitors or with anticholinergic drugs, because both add to heat-related risk. Hydration reduces stone risk but does not address the underlying acidosis.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C2C(=C1)C(=NO2)CS(=O)(=O)N',
      chemicalFormula: 'C8H8N2O3S',
      molecularWeight: '212.23 g/mol',
      targetReceptorAffinity:
        'No affinity constant is quoted on the label as explaining the clinical effect. In vitro work supports sodium channel block and reduction of T-type calcium currents, and separately shows binding at a chloride channel site; the label reports these as suggestions rather than as an established mechanism.',
      structureSource: {
        label: 'PubChem CID 5734 — zonisamide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5734',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zon-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the benzisoxazole core',
          description:
            'Confirm 1,2-benzisoxazol-3-yl-methyl before sulfamoylation. The isoxazole ring contains a nitrogen-oxygen bond that can be reductively opened, so the incoming material has to be checked for the ring-opened phenol as well as for the usual chemical purity.',
          reagentsAndBuffer:
            'Benzisoxazole reference standard, reverse-phase HPLC with UV detection at 240 nm, proton NMR for ring confirmation, loss on drying',
        },
        {
          id: 'zon-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sulfamoylation to install the sulfonamide head',
          description:
            'Attach the methanesulfonamide group at the 3-position. That group is what makes this molecule a sulfonamide, and it is simultaneously the pharmacophore for carbonic anhydrase inhibition and the structural reason the label opens with the sulfonamide class warnings.',
          dependsOnStepId: 'zon-w1',
          reagentsAndBuffer:
            'Sulfamoyl transfer reagent, base such as triethylamine or sodium hydride, anhydrous aprotic solvent, controlled temperature, nitrogen blanket',
        },
        {
          id: 'zon-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with a ring-opened impurity specification',
          description:
            'Recrystallise and set a limit for the reduced, ring-opened by-product. This matters beyond ordinary purity control because the reductive opening of the isoxazole is also a metabolic route in people, so the impurity and the metabolite are the same species.',
          dependsOnStepId: 'zon-w2',
          reagentsAndBuffer:
            'Ethanol and water for recrystallisation, activated charcoal, LC-MS with selected ion monitoring for the ring-opened mass, powder X-ray diffraction for form confirmation',
        },
        {
          id: 'zon-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel recording of sodium current and T-type calcium current',
          description:
            'Apply the compound to two preparations at once: a cell expressing voltage-gated sodium channels, and a neuron in which the low-threshold transient calcium current can be isolated. Reporting only one of the two would settle nothing, because the label proposes both as contributors and neither on its own has been shown to carry the clinical effect.',
          dependsOnStepId: 'zon-w3',
          reagentsAndBuffer:
            'HEK293 cells expressing SCN2A for the sodium arm, thalamic relay neurons or Cav3-expressing cells for the calcium arm, tetrodotoxin to isolate the calcium current, caesium-based internal solutions, matched drug concentration series',
        },
        {
          id: 'zon-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carbonic anhydrase inhibition beside the two channel readouts',
          description:
            'Measure carbonic anhydrase inhibition constants and place them alongside the channel concentration-response curves. The comparison is the audit: the enzyme number predicts the stones, the acidosis and the failure to sweat, and does not predict the seizure control, so the two families of effect can be attributed separately rather than lumped together as the drug working.',
          dependsOnStepId: 'zon-w4',
          reagentsAndBuffer:
            'Purified human carbonic anhydrase II, stopped-flow CO2 hydration assay with pH indicator, acetazolamide as positive control, matched drug concentration series across all assays',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zon-a1',
        category: 'measured',
        title: 'Largest registration trial: median seizure reduction 40.5% against 9% on placebo',
        laymanSummary:
          'Patients whose seizures continued on one or two drugs added zonisamide or a dummy. Over weeks 8 to 12 the median seizure count fell by 40.5% on the drug and by 9% on placebo, and 41.8% halved their seizures against 22.2%.',
        technicalDetails:
          'Three multicentre placebo-controlled double-blind 3-month trials in 499 patients aged 13 to 68 with refractory partial-onset seizures, each with at least four seizures per month despite one or two drugs at therapeutic concentrations, established the adjunctive indication. In Study 1 (n=203), the primary comparison was 400 mg/day against placebo over weeks 8 to 12: median reduction in all partial seizures was 40.5% (n=98) against 9% (n=72), with responders at 41.8% against 22.2%, both p<0.05. Statistically significant treatment differences also appeared at 100 and 200 mg/day. In Study 2 (n=152) the median reduction over weeks 5 to 12 was 29.6% against -3.2%, and in Study 3 (n=138) it was 27.2% against -1.1%, both p<0.05.',
        evidenceSource:
          'Zonisamide United States prescribing information, Clinical Studies, Tables 1 and 2 (openFDA drug label endpoint)',
        measuredMetric:
          'Median percentage reduction from baseline in all partial seizure frequency, and responder rate at 50% reduction',
        auditFlag: 'verified',
      },
      {
        id: 'zon-a2',
        category: 'inferred',
        title:
          'In two of the three trials the placebo group got worse, and one responder analysis missed',
        laymanSummary:
          'The gap between drug and placebo looks larger in Studies 2 and 3 than it is, because the placebo groups deteriorated rather than improved. And in Study 2 the responder analysis, the one that counts people rather than percentages, did not reach significance.',
        technicalDetails:
          'The label reports median percentage reduction in partial seizures of 29.6% against -3.2% in Study 2 and 27.2% against -1.1% in Study 3. A negative value means the placebo group had more seizures during treatment than at baseline, so part of the between-group difference reflects deterioration on placebo rather than improvement on drug, in a population selected for refractory disease and regression away from a high-seizure baseline. In the responder analysis, Study 1 (41.8% against 22.2%) and Study 3 (28% against 12%) reached significance; Study 2 (29% against 15%) is presented without the significance marker that the label applies elsewhere. Median percentage reduction and responder rate can diverge, and where they do, the responder rate is the one that describes patients rather than arithmetic.',
        evidenceSource:
          'Zonisamide United States prescribing information, Clinical Studies, Table 1 (openFDA drug label endpoint)',
        measuredMetric:
          'Median percentage reduction against responder rate, per study, with the label significance markers',
        inferredClaim:
          'That a 30-percentage-point gap in median seizure reduction corresponds to a 30-percentage-point difference in patients helped. In Study 2 the responder difference was 14 points and not marked as significant.',
        auditFlag: 'caution',
      },
      {
        id: 'zon-a3',
        category: 'failed',
        title: 'SANAD II: passed non-inferiority on one analysis, failed on the other',
        laymanSummary:
          'The one large head-to-head trial gave two answers. Counting everyone as randomised, zonisamide was no worse than lamotrigine. Counting only those who took the drug as intended, lamotrigine was clearly better.',
        technicalDetails:
          'SANAD II randomised 990 participants aged 5 and over with newly diagnosed focal epilepsy to lamotrigine (n=330), levetiracetam (n=332) or zonisamide (n=328), with a non-inferiority limit of HR 1.329 for time to 12-month remission. Zonisamide met the non-inferiority criterion in the intention-to-treat analysis (HR 1.03, 97.5% CI 0.83 to 1.28) where levetiracetam did not (1.18, 0.95 to 1.47). The per-protocol analysis showed 12-month remission superior with lamotrigine over both levetiracetam (HR 1.32, 97.5% CI 1.05 to 1.66) and zonisamide (HR 1.37, 1.08 to 1.73). Adverse reactions were reported by 108 (33%) starting lamotrigine, 144 (44%) starting levetiracetam and 146 (45%) starting zonisamide. Lamotrigine was superior in the cost-utility analysis at 1.403 QALYs (97.5% central range 1.319 to 1.458) against 1.232 (1.112 to 1.307) for zonisamide. The authors concluded the findings do not support the use of levetiracetam or zonisamide as first-line treatments for focal epilepsy.',
        evidenceSource: 'Marson A et al., Lancet 2021;397:1363-1374 (ISRCTN30294119)',
        doi: '10.1016/S0140-6736(21)00247-6',
        measuredMetric:
          'Time to 12-month remission against lamotrigine, intention-to-treat and per-protocol, plus QALYs',
        inferredClaim:
          'That passing intention-to-treat non-inferiority makes zonisamide equivalent to lamotrigine. In a non-inferiority trial, intention-to-treat analysis is biased towards showing no difference, which is why the per-protocol result is the one the authors acted on.',
        auditFlag: 'caution',
      },
      {
        id: 'zon-a4',
        category: 'measured',
        title:
          'Fatal skin reactions: 49 cases and 7 deaths across eleven years of Japanese marketing',
        laymanSummary:
          'Zonisamide is a sulfonamide, and sulfonamides occasionally cause skin reactions that kill. In the first eleven years of use in Japan, 49 cases of Stevens-Johnson syndrome or toxic epidermal necrolysis were reported and seven people died of severe rash.',
        technicalDetails:
          'The label reports seven deaths from severe rash, Stevens-Johnson syndrome or toxic epidermal necrolysis, in the first 11 years of marketing in Japan, all in patients also receiving other drugs, and 49 total reported SJS or TEN cases at a reporting rate of 46 per million patient-years, which it states is probably an underestimate because of under-reporting. There were no confirmed SJS or TEN cases in the United States, European or Japanese development programmes. In the United States and European randomised controlled trials, 6 of 269 zonisamide patients (2.2%) discontinued because of rash against none on placebo; across all United States and European development, rash leading to discontinuation was 1.4% (12 events per 1,000 patient-years), and in Japanese development 2% (27.8 per 1,000 patient-years). Rash appeared early: 85% within 16 weeks in the Western studies, 90% within two weeks in the Japanese ones, with no apparent dose relationship. Two confirmed cases of aplastic anaemia and one of agranulocytosis were reported in the same eleven-year Japanese window, at rates above accepted background.',
        evidenceSource:
          'Zonisamide United States prescribing information, Warnings: Potentially Fatal Reactions to Sulfonamides, Serious Skin Reactions and Serious Hematologic Events (openFDA drug label endpoint)',
        measuredMetric:
          'Post-marketing reporting rate of SJS and TEN per million patient-years, and discontinuation for rash against placebo in randomised trials',
        auditFlag: 'caution',
      },
      {
        id: 'zon-a5',
        category: 'measured',
        title: 'Kidney stones in 4% of adults, and acidosis at doses as low as 25 mg',
        laymanSummary:
          'Blocking carbonic anhydrase makes the kidney lose bicarbonate and raises urine pH, which grows stones. Four percent of adults in the development programme formed one, and ultrasound found stones in 8% of children who were scanned.',
        technicalDetails:
          'The label states that zonisamide causes hyperchloraemic non-anion-gap metabolic acidosis through renal bicarbonate loss due to carbonic anhydrase inhibition, that it generally occurs early but can develop at any time, that it appears dose-dependent and can occur at doses as low as 25 mg daily, and that renal disease, severe respiratory disorders, status epilepticus, diarrhoea, a ketogenic diet and specific drugs are additive. Nephrolithiasis occurred in 4% of adults treated in the development programme, was detected by renal ultrasound in 8% of paediatric patients who had at least one prospective ultrasound, and was reported as an adverse event in 3% (4 of 133) of paediatric patients. Chronic untreated acidosis may cause osteomalacia or osteoporosis with increased fracture risk and may reduce growth rates in children; zonisamide treatment was associated with reduced serum phosphorus and raised alkaline phosphatase. The label notes that serum bicarbonate was not measured at all in the adjunctive controlled trials in adults with epilepsy.',
        evidenceSource:
          'Zonisamide United States prescribing information, Warnings: Metabolic Acidosis and Kidney Stones (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of nephrolithiasis in adults and children, and the dose threshold at which acidosis is reported',
        auditFlag: 'verified',
      },
      {
        id: 'zon-a6',
        category: 'failed',
        title: 'Status epilepticus in 1.1% of treated patients and none on placebo',
        laymanSummary:
          'A drug given to stop seizures was followed by a continuous, unbroken seizure in about one in ninety patients in the controlled trials. No patient on placebo had one.',
        technicalDetails:
          'The label states that in controlled trials 1.1% of zonisamide-treated patients had an event labelled as status epilepticus, compared with none of the placebo patients, and that across all epilepsy studies, controlled and uncontrolled, 1% of zonisamide-treated patients had such an event. It notes that incidence estimates are difficult because no standard definition was employed. The comparison against zero on placebo is what makes the signal difficult to dismiss as background rate in a refractory population, and the acknowledged definitional looseness is what stops it being a precise number.',
        evidenceSource:
          'Zonisamide United States prescribing information, Precautions: Status Epilepticus (openFDA drug label endpoint)',
        measuredMetric:
          'Proportion of patients with an event labelled status epilepticus, drug against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'zon-a7',
        category: 'measured',
        title: 'Psychiatric discontinuations at five times the placebo rate',
        laymanSummary:
          'Depression severe enough to stop the drug or go to hospital happened in 2.2% of trial patients against 0.4% on placebo. Psychosis did the same in 2.2% against nobody on placebo.',
        technicalDetails:
          'The label groups cognitive and neuropsychiatric events in three categories: psychiatric symptoms including depression and psychosis; psychomotor slowing, difficulty with concentration and speech or language problems, particularly word-finding difficulties; and somnolence or fatigue. In placebo-controlled trials, 2.2% of zonisamide patients discontinued or were hospitalised for depression against 0.4% on placebo, and 2.2% discontinued or were hospitalised for psychosis or psychosis-related symptoms against none on placebo. Across all epilepsy patients treated with zonisamide, 1.4% were discontinued and 1.0% hospitalised for depression or suicide attempts, and 0.9% discontinued and 1.4% hospitalised for psychosis. Psychomotor slowing and concentration difficulty occurred in the first month and were associated with doses above 300 mg/day; speech and language problems tended to appear after 6 to 10 weeks, also above 300 mg/day.',
        evidenceSource:
          'Zonisamide United States prescribing information, Precautions: Cognitive/Neuropsychiatric Adverse Events (openFDA drug label endpoint)',
        measuredMetric:
          'Discontinuation or hospitalisation for depression and for psychosis, drug against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'zon-a8',
        category: 'conclusion_shift',
        title:
          'Approved in Japan in 1989 and in the United States in 2000, on largely the same evidence',
        laymanSummary:
          'Zonisamide was a routine Japanese epilepsy drug for eleven years before the United States licensed it. Most of what is known about its rarest and worst reactions comes from those eleven years, not from any trial.',
        technicalDetails:
          'The drug was approved in Japan in 1989 and in the United States in March 2000 under NDA 020789. The gap is why the safety sections of the United States label read as they do: the fatal skin reactions, the aplastic anaemia and agranulocytosis cases, and the oligohidrosis reports are all drawn from Japanese post-marketing surveillance rather than from the registration trials, in which no confirmed SJS or TEN case occurred and fewer than 100 paediatric patients participated. The label states that oligohidrosis was reported once in 403 Japanese paediatric patients pre-approval, 38 times in the first 11 years of Japanese marketing (about 1 per 10,000 patient-years) and twice in the first year of United States marketing (about 12 per 10,000 patient-years), and that all of these are underestimates. The scientific conclusion did not shift; the evidence base shifted from a trial programme to a surveillance record, and the label was rewritten around it.',
        evidenceSource:
          'Zonisamide United States prescribing information, Warnings: Serious Skin Reactions, Serious Hematologic Events, Oligohidrosis and Hyperthermia in Pediatric Patients (openFDA drug label endpoint)',
        inferredClaim:
          'That a registration trial programme characterises a drug rare harms. For zonisamide it characterised almost none of them; eleven years of use in another country did.',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, and it stays a long time',
        laymanDesc:
          'Absorption is good and the drug persists for days, which is why it can be taken once daily and why a change in dose takes a fortnight to show its full effect.',
        molecularDetail:
          'A long elimination half-life allows once-daily dosing, and the label reports no apparent difference between once-daily and twice-daily regimens across the registration studies. Metabolism includes reductive opening of the benzisoxazole ring by CYP3A4, so enzyme-inducing anti-seizure drugs shorten the half-life substantially.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It distributes to the brain, and to the kidney and skin as well',
        laymanDesc:
          'The molecule reaches brain tissue, but carbonic anhydrase, one of the things it blocks, sits in the kidney tubule and the sweat gland. Some of what this drug does never happens in the brain at all.',
        molecularDetail:
          'Distribution is not brain-selective. Inhibition of carbonic anhydrase in the renal tubule accounts for the hyperchloraemic non-anion-gap acidosis, the raised urine pH and the nephrolithiasis; inhibition in the eccrine sweat gland accounts for the oligohidrosis and hyperthermia reported especially in paediatric patients.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It slows two kinds of gate at once',
        laymanDesc:
          'It blocks the sodium gates a nerve cell uses to fire, and a slow calcium gate that helps groups of cells fire together. Both damp the ability of a population of neurons to lock into a rhythm.',
        molecularDetail:
          'The label states that in vitro pharmacological studies suggest zonisamide blocks sodium channels and reduces voltage-dependent transient inward T-type calcium currents, stabilising neuronal membranes and suppressing neuronal hypersynchronisation, and that the precise mechanisms remain unknown. Binding studies also point to a chloride channel site.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Synchronisation across a population of cells breaks down',
        laymanDesc:
          'A seizure needs many cells firing in step. Damping both the firing gate and the synchronising gate makes it harder for that lockstep to form or to persist.',
        molecularDetail:
          'In animal models zonisamide blocked maximal-electroshock tonic extension seizures but not subcutaneous pentylenetetrazol clonic seizures, raised the generalised seizure threshold in kindled rats, shortened cortical focal seizures in cats and suppressed interictal spikes. The label notes that the relevance of these models to human epilepsy is unknown.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A median 40.5% fall in seizures, against 9% on placebo',
        laymanDesc:
          'In the largest registration trial, the median seizure count fell by 40.5% at 400 mg/day and by 9% on placebo, with 41.8% of patients halving their seizures against 22.2%.',
        molecularDetail:
          'Efficacy is established as adjunctive therapy in refractory partial-onset seizures across three placebo-controlled trials in 499 patients. Efficacy as a first-line monotherapy was tested once, in SANAD II, where zonisamide passed intention-to-treat non-inferiority to lamotrigine and failed the per-protocol comparison.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Adjunctive Study 1 (label Clinical Studies, Tables 1 and 2)',
        phase: 'Multicentre randomised double-blind placebo-controlled trial, 3 months',
        sampleSize: 203,
        primaryEndpoint:
          'Median percentage reduction from baseline in all partial seizure frequency at 400 mg/day over weeks 8 to 12',
        endpointMet: true,
        statisticalPValue:
          '40.5% (n=98) against 9% on placebo (n=72), P<0.05; responders 41.8% against 22.2%, P<0.05; significant differences also at 100 and 200 mg/day',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Adjunctive Study 2 (label Clinical Studies, Table 1)',
        phase: 'Multicentre randomised double-blind placebo-controlled trial, 3 months',
        sampleSize: 152,
        primaryEndpoint:
          'Median percentage reduction from baseline in all partial seizure frequency over weeks 5 to 12',
        endpointMet: true,
        statisticalPValue:
          '29.6% (n=69) against -3.2% on placebo (n=72), P<0.05; the responder analysis, 29% against 15%, is reported without the significance marker used elsewhere in the table',
        unreportedAdverseSignals:
          'The placebo group had more seizures during treatment than at baseline, so part of the between-group gap is deterioration on placebo rather than improvement on drug.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Adjunctive Study 3 (label Clinical Studies, Table 1)',
        phase:
          'Multicentre randomised double-blind placebo-controlled trial, 3 months, once-daily dosing',
        sampleSize: 138,
        primaryEndpoint:
          'Median percentage reduction from baseline in all partial seizure frequency over weeks 5 to 12',
        endpointMet: true,
        statisticalPValue:
          '27.2% (n=67) against -1.1% on placebo (n=66), P<0.05; responders 28% against 12%, P<0.05',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SANAD II focal arm (ISRCTN30294119)',
        phase: 'Phase 4 open-label randomised non-inferiority trial',
        sampleSize: 990,
        primaryEndpoint:
          'Time to 12-month remission, zonisamide versus lamotrigine, non-inferiority margin HR 1.329',
        endpointMet: false,
        statisticalPValue:
          'Non-inferiority met in the ITT analysis (HR 1.03, 97.5% CI 0.83 to 1.28) but per-protocol 12-month remission was superior with lamotrigine (HR 1.37, 1.08 to 1.73)',
        unreportedAdverseSignals:
          'Adverse reactions were reported by 45% starting zonisamide against 33% starting lamotrigine, and lamotrigine won the cost-utility analysis at 1.403 QALYs against 1.232.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median partial seizure reduction of 40.5% at 400 mg/day against 9% on placebo, with responder rates of 41.8% against 22.2%, in 203 patients',
        'Non-inferiority to lamotrigine met in the intention-to-treat analysis of SANAD II (HR 1.03, 97.5% CI 0.83 to 1.28) and failed per protocol (lamotrigine superior, HR 1.37, 1.08 to 1.73)',
        'Nephrolithiasis in 4% of adults in the development programme and on ultrasound in 8% of scanned paediatric patients',
        'Discontinuation for rash in 6 of 269 trial patients (2.2%) against none on placebo, and 49 post-marketing SJS or TEN reports with 7 deaths in eleven Japanese years',
        'Depression and psychosis leading to discontinuation or hospitalisation in 2.2% each, against 0.4% and 0% on placebo',
        'Status epilepticus in 1.1% of treated patients against none on placebo in controlled trials',
      ],
      unsupportedInferences: [
        'That a 30-point gap in median seizure reduction means 30% more patients were helped: in Study 2 the responder difference was 14 points and carries no significance marker',
        'That passing intention-to-treat non-inferiority in SANAD II makes zonisamide equal to lamotrigine, when intention-to-treat analysis biases a non-inferiority trial towards no difference and the per-protocol result went the other way',
        'That the mechanism is established: the label proposes sodium channels, T-type calcium channels and a chloride channel site, and states the precise mechanisms are unknown',
        'That the registration programme characterised the drug rare harms, when no confirmed SJS or TEN case occurred in it and fewer than 100 children took part',
      ],
      whatFailedInitially: [
        'Zonisamide was inactive against pentylenetetrazol-induced clonic seizures in animals, one of the two classical screens, and was carried forward on the electroshock and kindling models instead',
        'Serum bicarbonate, the measurement that would have quantified the acidosis, was not collected at all in the adjunctive controlled trials in adults',
        'SANAD II concluded that its findings do not support the use of zonisamide as a first-line treatment for focal epilepsy',
      ],
      realWorldOutcome: [
        'The cheapest drug on these anti-seizure pages at United States pharmacy acquisition cost, about 11 US cents per unit across 30 listed products',
        'Once-daily dosing is its main practical argument, and the label found no difference between once-daily and twice-daily regimens across its studies',
        'It is approved in Japan for Parkinson disease, an indication it does not hold in the United States and which is not covered by any evidence on this page',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and oral suspension',
      description:
        'There is no intravenous zonisamide and no extended-release form, because the drug half-life already permits once-daily dosing. The oral suspension Zonisade is a separate, later FDA application and is licensed from 16 years of age; the capsule label states that safety and effectiveness in paediatric patients have not been established.',
      safetyProfile:
        'No boxed warning, and a warnings section that opens with the sulfonamide class: Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias have all proved fatal in this class, and 49 SJS or TEN reports with seven deaths accumulated in eleven years of Japanese marketing. Carbonic anhydrase inhibition drives metabolic acidosis at doses as low as 25 mg daily, kidney stones in 4% of adults, and oligohidrosis with hyperthermia and heat stroke, especially in children. Acute myopia with secondary angle closure glaucoma typically appears within a month. Depression and psychosis led to discontinuation or hospitalisation in 2.2% each against 0.4% and none on placebo. Psychomotor slowing, concentration difficulty and word-finding problems cluster above 300 mg/day. Status epilepticus occurred in 1.1% against none on placebo. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Should I take zonisamide if I am allergic to sulfa antibiotics?',
        a: 'That is a question for the prescriber, and the label makes clear why it needs asking. Zonisamide is a sulfonamide, and the warnings section opens by listing the reactions that have proved fatal in this chemical class: Stevens-Johnson syndrome, toxic epidermal necrolysis, fulminant hepatic necrosis, agranulocytosis, aplastic anaemia and other blood dyscrasias. It adds that such reactions may occur when a sulfonamide is readministered by any route. What the label does not provide is a measured cross-reaction rate between sulfonamide antibiotics and zonisamide specifically, so this is a class-level caution rather than a quantified risk. Tell the prescriber before the first dose.',
        auditNote:
          'The class warning is documented. The specific cross-reaction rate is not, and this page does not supply one.',
      },
      {
        q: 'How well does it actually work?',
        a: 'In its largest registration trial, adding 400 mg/day to existing treatment cut the median partial seizure count by 40.5% against 9% on placebo, and 41.8% of patients halved their seizures against 22.2% on placebo. Two smaller trials found median reductions of 29.6% and 27.2%, but in both of those the placebo groups got slightly worse rather than better, which widens the gap without the drug doing more. When zonisamide was tested against an active comparator instead of placebo, in SANAD II, it met non-inferiority to lamotrigine on the intention-to-treat analysis and lost the per-protocol comparison, and the authors concluded their findings do not support it as a first-line treatment.',
      },
      {
        q: 'Why do I need to drink more water on this drug?',
        a: 'Because zonisamide inhibits carbonic anhydrase, the kidney loses bicarbonate and urine pH rises, and stones form more easily in alkaline urine. Nephrolithiasis occurred in 4% of adults in the development programme, was found on ultrasound in 8% of paediatric patients scanned, and was reported as an adverse event in 3% of paediatric patients. The same enzyme block produces a mild persistent metabolic acidosis that the label says can begin at doses as low as 25 mg daily and can appear at any point in treatment. The label recommends baseline and periodic serum bicarbonate measurement, and notes that this measurement was not collected at all in the adult adjunctive trials.',
      },
      {
        q: 'Why is a drug used in Japan since 1989 still described as having limited safety data?',
        a: 'Because the two things are not the same. The registration trials produced no confirmed case of Stevens-Johnson syndrome or toxic epidermal necrolysis and enrolled fewer than 100 paediatric patients in the Western programmes. Almost everything the label says about the drug rarest and most serious harms comes from Japanese post-marketing surveillance instead: 49 SJS or TEN reports at 46 per million patient-years, seven deaths from severe rash, two confirmed aplastic anaemia cases and one agranulocytosis case, and 38 oligohidrosis reports. The label states each of these is probably an underestimate because of under-reporting. Long use is a different kind of evidence from a trial, and it is the kind that finds rare events.',
        auditNote:
          'The evidence base for this drug harms and the evidence base for its benefits come from different countries, different decades and different methods.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for zonisamide could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 11 US cents per unit as a median across 30 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zonisamide United States prescribing information: Clinical Studies Tables 1 and 2, Warnings, Precautions and Mechanism of Action, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ZONISAMIDE%22',
        kind: 'regulatory',
      },
      SANAD_II_FOCAL_SOURCE,
      SANAD_I_FOCAL_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label: 'Drugs@FDA: ZONEGRAN (zonisamide), NDA 020789, original approval 27 March 2000',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020789',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5734 — zonisamide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5734',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Lacosamide — the second proposed target was searched for again and was not there.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lacosamide',
    name: 'Lacosamide',
    tradeName: 'Vimpat / Motpoly XR',
    sponsor:
      'UCB Inc. (originator); now off-patent for the oral and injectable forms, with the extended-release capsule Motpoly XR marketed by Aucta and Azurity',
    targetGene: 'SCN2A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits, acting on slow inactivation rather than fast inactivation. The label states the precise mechanism in humans remains to be fully elucidated, and no longer names a second target.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2008,
    indication:
      'Treatment of partial-onset seizures in patients 1 month of age and older, and adjunctive therapy in the treatment of primary generalised tonic-clonic seizures in patients 4 years of age and older',
    patientFriendlyIndication:
      'Focal epilepsy, and added-on treatment for generalised tonic-clonic seizures',
    anatomicalSite:
      'Axonal membrane of cortical neurons, acting on the slow-inactivated state of voltage-gated sodium channels',
    conditionContext: {
      conditionExplainer:
        'Every sodium-channel drug in epilepsy works by making a fraction of the channels unavailable. What separates them is which unavailable state they favour. Carbamazepine, phenytoin and lamotrigine bind the fast-inactivated state, which a channel enters within milliseconds. Lacosamide acts on slow inactivation, a state that builds over seconds of sustained depolarisation.',
      whyItMatters:
        'That distinction is the entire commercial and clinical argument for the drug, and it is a real pharmacological difference rather than a marketing one. Whether it translates into better seizure control than an older sodium-channel blocker was tested directly against carbamazepine, and the answer was that the two were equivalent.',
      whoTakesThis:
        'People with focal epilepsy from one month of age, and people with generalised tonic-clonic seizures as an add-on. The intravenous form is widely used in hospital when someone cannot take tablets.',
      clinicalGoals:
        'Seizure control with almost no drug interactions, at the cost of watching the ECG in anyone with a conduction problem.',
    },
    oneSentenceVerdict:
      'A sodium-channel drug that acts on slow inactivation rather than fast, which met its pre-specified non-inferiority criteria against controlled-release carbamazepine in 888 newly diagnosed adults (90% against 91% seizure-free at six months) and cut the risk of a second generalised tonic-clonic seizure by 45%, and whose originally advertised second target, CRMP-2, was searched for by two independent binding methods and not found.',
    laymanHowItWorks:
      'A sodium pore in a nerve membrane has two ways of switching off. One is fast, over milliseconds, and it is what most older seizure drugs grab hold of. The other is slow, building over seconds when a cell has been depolarised for a while. Lacosamide works on the slow one: it pushes channels that have been active for some time into the unavailable state and keeps them there. The practical consequence is that it acts most on tissue that has been over-excited for a while, and least on tissue behaving normally.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 79,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1676 per unit, the median across 94 listed lacosamide products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered at Research Corporation Technologies from a functionalised amino acid series and developed by UCB, approved in the United States in October 2008 as Vimpat under NDA 022253 (tablets), 022254 (injection) and 022255 (oral solution). It is a Schedule V controlled substance in the United States. Composition-of-matter protection has expired and 94 generic products are now listed. The extended-release capsule Motpoly XR is a separate, later application.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Lacosamide is the only drug on these pages that beat an older standard in its own registration programme rather than losing to one. It met non-inferiority to controlled-release carbamazepine in 888 newly diagnosed adults. The comparisons that matter are therefore with carbamazepine itself, with the other interaction-free options, and with the sodium-channel drugs that act on fast inactivation instead.',
      conventionalRx: [
        {
          name: 'Carbamazepine controlled-release (Tegretol-XR)',
          class: 'Sodium channel blocker acting on fast inactivation',
          howItCompares:
            'The direct comparator. In a double-blind trial of 888 newly diagnosed adults, Kaplan-Meier estimated six-month seizure freedom was 90% on lacosamide and 91% on carbamazepine-CR (absolute difference -1.3%, 95% CI -5.5 to 2.8), meeting the pre-specified non-inferiority criteria of -12% absolute and -20% relative. Treatment-emergent adverse events leading to withdrawal were 11% on lacosamide and 16% on carbamazepine-CR.',
          typicalCost:
            'US$0.3776 per unit, median across 92 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: sixty years of evidence and a trigeminal neuralgia indication. Cons: potent enzyme induction, autoinduction, a boxed warning for SJS and TEN and for aplastic anaemia, and HLA-B*1502 screening in Asian ancestry.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand, unrelated mechanism',
          howItCompares:
            'The other interaction-free anti-seizure drug with an intravenous form, and the usual alternative when the aim is to avoid enzyme effects entirely. In SANAD II it failed non-inferiority to lamotrigine in focal epilepsy (HR 1.18, 97.5% CI 0.95 to 1.47); lacosamide has never been tested against lamotrigine.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: not a controlled substance, no PR interval concern, and cheaper. Cons: irritability and aggression in 13% of adults and 38% of children in its registration trials.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker acting on fast inactivation',
          howItCompares:
            'The drug that won both SANAD and the per-protocol analysis of SANAD II. It has never been compared with lacosamide in a randomised trial, so any claim that one is better than the other is an inference across trials with different comparators and different populations.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the best-tolerated drug in the largest first-line focal epilepsy trials, and among the lowest malformation rates in EURAP. Cons: slow introduction because of serious rash, with a boxed warning.',
        },
        {
          name: 'Brivaracetam (Briviact)',
          class: 'SV2A ligand, same manufacturer',
          howItCompares:
            'UCB other modern anti-seizure drug, also a Schedule V controlled substance, also with an intravenous form and minimal interactions. No head-to-head trial against lacosamide exists. The two are usually distinguished by what a person needs to avoid rather than by any measured difference in seizure control.',
          typicalCost:
            'US$0.2634 per unit, median across 35 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no cardiac conduction warning. Cons: shares the behavioural side-effect profile of levetiracetam, and is more expensive.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies. In the one randomised trial, 38% of 145 children with drug-resistant epilepsy halved their seizures on the diet against 6% of controls.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. This is a hospital-supervised medical therapy with its own monitoring requirements, not an eating pattern to adopt from a web page.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Bring a list of your heart medicines to the first appointment',
          action:
            'Tell the prescriber about any drug that affects heart rhythm or conduction, and about any known conduction problem, before starting lacosamide.',
          patientImpact:
            'The label recommends an ECG before starting and after titration to steady state in patients with underlying proarrhythmic conditions or on drugs that affect cardiac conduction. Asymptomatic first-degree AV block occurred in 0.4% of 944 patients in adjunctive trials and in none of 364 on placebo.',
          clinicalPrecaution:
            'Post-marketing reports include bradycardia, AV block and ventricular tachyarrhythmia, rarely resulting in asystole, cardiac arrest and death, mostly but not exclusively in people with a predisposing condition or an interacting drug.',
        },
        {
          name: 'Sit down when a dose is due if you have felt faint before',
          action:
            'If dizziness, unsteadiness or near-fainting has happened on this drug, take doses seated and stand up slowly for the first hour.',
          patientImpact:
            'Dizziness and ataxia are labelled warnings and are among the commonest reasons for withdrawal. Syncope has its own warning section.',
          clinicalPrecaution:
            'Falls from drug-induced unsteadiness cause the same fractures as falls from seizures. Report the symptom rather than working around it.',
        },
        {
          name: 'Do not stop it abruptly',
          action:
            'If the drug needs to come off, that happens by a planned taper agreed with the prescriber, never by simply stopping.',
          patientImpact:
            'The label states lacosamide should be gradually withdrawn to minimise the potential for increased seizure frequency. This applies to sodium-channel drugs generally and is not specific to any one dose.',
          clinicalPrecaution:
            'This page gives no tapering schedule. The only point is that abrupt withdrawal is itself a seizure risk.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)N[C@H](COC)C(=O)NCC1=CC=CC=C1',
      chemicalFormula: 'C13H18N2O3',
      molecularWeight: '250.29 g/mol',
      targetReceptorAffinity:
        'No affinity constant is quoted on the label as explaining the clinical effect. The pharmacologically meaningful measurement here is not a binding constant at all but the shift in the voltage-dependence and the time course of slow inactivation, which is a kinetic result rather than an equilibrium one.',
      structureSource: {
        label: 'PubChem CID 219078 — lacosamide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/219078',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lcm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric purity of the D-serine-derived starting material',
          description:
            'Confirm the (R) configuration before anything is coupled to it. Lacosamide is a single enantiomer of a functionalised amino acid, and its mirror image is substantially less active in seizure models. An enantiomeric impurity is inert mass carried through every subsequent step.',
          reagentsAndBuffer:
            'D-serine or protected (R)-2-amino-3-methoxypropanoic acid reference standard, chiral HPLC on a polysaccharide stationary phase, polarimetry, Karl Fischer titration',
        },
        {
          id: 'lcm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'N-acetylation and benzylamide coupling',
          description:
            'Acetylate the amine and couple the carboxylic acid to benzylamine to give (R)-2-acetamido-N-benzyl-3-methoxypropionamide. Three small features define the molecule: the acetyl cap, the benzylamide and the methoxymethyl side chain. Removing any one of them removes the anti-seizure activity in the original structure-activity series.',
          dependsOnStepId: 'lcm-w1',
          reagentsAndBuffer:
            'Acetic anhydride or acetyl chloride with base, carbodiimide or mixed-anhydride coupling reagent, benzylamine, dichloromethane or ethyl acetate, temperature control to suppress racemisation at the alpha centre',
        },
        {
          id: 'lcm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and chiral assay against the (S) enantiomer',
          description:
            'Recrystallise and assay by chiral HPLC against an authentic (S) standard. The specification is enantiomeric as well as chemical, because the two forms are chemically identical, share a molecular formula and a mass, and are separated only by a chiral method.',
          dependsOnStepId: 'lcm-w2',
          reagentsAndBuffer:
            'Isopropanol, ethyl acetate or water for recrystallisation, activated charcoal, chiral HPLC with hexane and ethanol mobile phase, UV detection at 210 nm',
        },
        {
          id: 'lcm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Long-depolarisation voltage protocols on sodium-channel-expressing cells',
          description:
            'Hold the cell membrane depolarised for seconds rather than milliseconds before testing availability. This protocol choice is the whole experiment: a standard fast-inactivation protocol lasting tens of milliseconds shows lacosamide doing very little, which is why its mechanism was missed by assays designed around the older drugs.',
          dependsOnStepId: 'lcm-w3',
          reagentsAndBuffer:
            'HEK293 cells or cortical neurons expressing SCN2A, conditioning prepulses of 1 to 60 seconds, caesium fluoride internal solution, 140 mM sodium chloride external solution, paired fast-protocol controls run on the same cells',
        },
        {
          id: 'lcm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Radioligand and surface plasmon resonance counter-screen against CRMP-2',
          description:
            'Run tritiated lacosamide binding and surface plasmon resonance against isolated and membrane-bound human CRMP-2 alongside the electrophysiology. This is the step that matters historically: when it was performed, over free concentrations of 100 to 1450 nM for the radioligand and 0.39 to 100 micromolar for the resonance measurement, no specific binding was detected, and the second mechanism the drug was introduced with disappeared from its label.',
          dependsOnStepId: 'lcm-w4',
          reagentsAndBuffer:
            'Tritiated lacosamide, native and cloned human CRMP-2 expressed in mammalian and bacterial systems, surface plasmon resonance chips with immobilised CRMP-2, positive-control ligand with known CRMP-2 affinity, matched non-specific binding controls',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lcm-a1',
        category: 'measured',
        title: 'Non-inferior to controlled-release carbamazepine in 888 newly diagnosed adults',
        laymanSummary:
          'A double-blind trial gave newly diagnosed adults either lacosamide or the older standard, carbamazepine, and counted how many stayed seizure-free for six months. Ninety percent did on lacosamide and 91% on carbamazepine, which met the trial pre-set definition of no worse.',
        technicalDetails:
          'Baulac and colleagues randomised 888 patients with newly diagnosed epilepsy, double-blind, to lacosamide starting at 100 mg/day or carbamazepine-CR starting at 200 mg/day, with escalation to the next target level after any seizure and a fresh six-month assessment period each time. The full analysis set was 444 and 442; the per-protocol set 408 and 397. Six months of seizure freedom was completed by 327 (74%) on lacosamide and 308 (70%) on carbamazepine-CR. Kaplan-Meier estimated six-month seizure freedom was 90% against 91%, an absolute difference of -1.3% (95% CI -5.5 to 2.8) and a relative difference of -6.0%, against pre-defined non-inferiority criteria of -12% absolute and -20% relative. Per-protocol estimates were 92% and 93% (-1.3%, -5.3 to 2.7). Treatment-emergent adverse events occurred in 74% and 75%; serious ones in 7% and 10%; withdrawal for adverse events in 11% and 16%. The trial was funded by UCB Pharma, which is a fact about who paid rather than a criticism of the design, and the design is the strongest of any registration programme on these pages.',
        evidenceSource: 'Baulac M et al., Lancet Neurol 2017;16:43-54 (NCT01243177)',
        doi: '10.1016/S1474-4422(16)30292-7',
        measuredMetric:
          'Proportion of patients free from seizures for 6 consecutive months after stabilisation at the last assessed dose',
        auditFlag: 'verified',
      },
      {
        id: 'lcm-a2',
        category: 'conclusion_shift',
        title: 'The second mechanism was looked for with two methods and was not there',
        laymanSummary:
          'Lacosamide was introduced as a drug with two targets: sodium channels and a protein called CRMP-2. In 2012 two independent binding techniques were used to look for that second interaction. Neither found it, and the claim quietly left the label.',
        technicalDetails:
          'Early preclinical work proposed that lacosamide had an additional mode of action through binding to collapsin response mediator protein 2, and the dual-mechanism description appeared widely in reviews and in early prescribing information. Errington and colleagues tested it directly using radioligand binding with tritiated lacosamide at free concentrations of 100 to 1,450 nM and surface plasmon resonance over 0.39 to 100 micromolar, against both isolated and membrane-bound human CRMP-2 expressed in mammalian cells and in bacteria. No specific binding was observed by either method, and the authors noted that both techniques were well suited to detect binding in the micromolar range. Separately, Wang and Khanna showed that lacosamide did not affect N-type, P/Q-type or L-type calcium currents, including N-type currents augmented by CRMP-2 expression, removing the proposed downstream consequence as well. The current United States label describes only selective enhancement of slow inactivation of voltage-gated sodium channels and states that the precise mechanism remains to be fully elucidated.',
        evidenceSource:
          'Errington AC et al., CNS Neurosci Ther 2012;18:493-500; Wang Y, Khanna R, Transl Neurosci 2011;2:13-22',
        doi: '10.1111/j.1755-5949.2012.00313.x',
        inferredClaim:
          'That lacosamide has a dual mechanism involving CRMP-2. Two orthogonal binding methods found no specific interaction, and the label no longer makes the claim.',
        auditFlag: 'verified',
      },
      {
        id: 'lcm-a3',
        category: 'inferred',
        title:
          'The monotherapy licence was granted against a historical control, not a randomised one',
        laymanSummary:
          'The trial that established lacosamide as a stand-alone drug randomised 425 patients between two doses of lacosamide and then compared them with a pooled group of patients from eight earlier studies who had been given a deliberately ineffective dose of a different drug.',
        technicalDetails:
          'Study 1 was a historical-control, multicentre, randomised trial in 425 patients aged 16 to 70 with partial-onset seizures on 1 or 2 existing drugs. After an 8-week baseline and 3-week titration, patients entered a 16-week maintenance phase in which background drugs were withdrawn over 6 weeks and lacosamide continued alone for 10 weeks. Randomisation was 3 to 1 between lacosamide 400 mg/day and 300 mg/day, with treatment assignment blinded. The comparison was not between those two arms: it was against a pooled analysis of the control groups from eight studies of similar design that had used a sub-therapeutic dose of an antiepileptic drug. Superiority was declared if the upper limit of the two-sided 95% confidence interval for the percentage meeting exit criteria fell below a 65% lower prediction limit derived from that pooled historical data. For lacosamide 400 mg/day the estimate was 30% (95% CI 25% to 36%), and 36% is below 65%, so the criterion was met. What that establishes is that lacosamide performs better than a group of historical patients on a deliberately inadequate dose of something else. The Baulac trial, published nine years later, is what establishes performance against a real comparator.',
        evidenceSource:
          'Lacosamide United States prescribing information, Clinical Studies 14.1, Study 1 (openFDA drug label endpoint)',
        measuredMetric:
          'Percentage of patients meeting pre-specified exit criteria, against a 65% threshold derived from pooled historical sub-therapeutic control groups',
        inferredClaim:
          'That the monotherapy registration trial compared lacosamide with an alternative treatment. It compared it with a historical benchmark built from patients given doses chosen to be ineffective.',
        auditFlag: 'caution',
      },
      {
        id: 'lcm-a4',
        category: 'measured',
        title: 'Generalised tonic-clonic seizures: 45% lower risk of a second one',
        laymanSummary:
          'In 242 patients with generalised epilepsy having convulsive seizures, adding lacosamide cut the risk of a second such seizure over 24 weeks by 45%, and 31.3% went the whole period without one against 17.2% on placebo.',
        technicalDetails:
          'Study 5 was a 24-week double-blind randomised placebo-controlled parallel-group trial in patients aged 4 and over with idiopathic generalised epilepsy having primary generalised tonic-clonic seizures, on stable doses of 1 to 3 anti-seizure drugs and with at least 3 documented PGTC seizures across a 16-week combined baseline. Randomisation was 1:1 to lacosamide (n=121) or placebo (n=121), with a fixed-dose regimen targeting 400 mg/day in patients weighing 50 kg or more. In the modified full analysis set (118 and 121), time to second PGTC seizure favoured lacosamide with a hazard ratio of 0.548 (95% CI 0.381 to 0.788, p=0.001), a 45.2% risk reduction. Adjusted Kaplan-Meier estimates of 24-week freedom from PGTC seizures were 31.3% against 17.2%, an adjusted difference of 14.1% (95% CI 3.2 to 25.1, p=0.011). This is one of very few placebo-controlled results on these pages where the endpoint is a specific seizure type occurring or not, rather than a percentage change in a count.',
        evidenceSource:
          'Lacosamide United States prescribing information, Clinical Studies 14.3, Study 5 (openFDA drug label endpoint)',
        measuredMetric:
          'Time to second primary generalised tonic-clonic seizure over 24 weeks, and 24-week seizure freedom',
        auditFlag: 'verified',
      },
      {
        id: 'lcm-a5',
        category: 'measured',
        title: 'Adjunctive efficacy replicated across three placebo-controlled trials',
        laymanSummary:
          'Three separate 12-week trials in adults whose seizures continued on up to three other drugs all found a significant reduction against placebo, at 400 mg a day in every one of them.',
        technicalDetails:
          'Studies 2, 3 and 4 were 12-week randomised double-blind placebo-controlled multicentre trials in adults with partial-onset seizures inadequately controlled on 1 to 3 concomitant drugs, requiring an average of at least 4 seizures per 28 days over an 8-week baseline with no seizure-free period exceeding 21 days. Mean duration of epilepsy was 24 years and median baseline seizure frequency ranged from 10 to 17 per 28 days; 84% were taking 2 to 3 concomitant drugs with or without vagal nerve stimulation. The primary variable was reduction in 28-day seizure frequency from baseline to the maintenance phase against placebo. A statistically significant effect was seen at 200 mg/day in Study 4, at 400 mg/day in all three studies, and at 600 mg/day in Studies 2 and 3. This is a refractory population with two decades of epilepsy behind it, which is the hardest place to show an effect and the reason the effect sizes are modest.',
        evidenceSource:
          'Lacosamide United States prescribing information, Clinical Studies 14.2, Studies 2, 3 and 4 (openFDA drug label endpoint)',
        measuredMetric:
          'Reduction in 28-day partial-onset seizure frequency from baseline to maintenance phase, against placebo, by dose',
        auditFlag: 'verified',
      },
      {
        id: 'lcm-a6',
        category: 'measured',
        title: 'It lengthens the PR interval, and post-marketing reports include cardiac arrest',
        laymanSummary:
          'Lacosamide slows electrical conduction through the heart. In trials this was almost always harmless. After marketing, reports arrived of serious arrhythmias, some fatal, mostly in people who already had a heart problem or another drug doing the same thing.',
        technicalDetails:
          'Dose-dependent PR interval prolongation has been observed in adult patients and in healthy volunteers. In adjunctive trials in adults with partial-onset seizures, asymptomatic first-degree atrioventricular block occurred in 0.4% (4 of 944) of lacosamide patients and 0% (0 of 364) of placebo patients. One case of profound bradycardia occurred during a 15-minute infusion of 150 mg. Post-marketing reports include bradycardia, AV block and ventricular tachyarrhythmia, rarely resulting in asystole, cardiac arrest and death, occurring with both oral and intravenous routes and at prescribed doses as well as in overdose; most but not all occurred in patients with underlying proarrhythmic conditions or on concomitant medications affecting cardiac conduction. The label recommends an ECG before starting and after titration to steady state in those patients. The gap between a 0.4% asymptomatic finding in trials and fatal post-marketing reports is the standard shape of a rare cardiac signal: trials exclude the people at risk, and marketing does not.',
        evidenceSource:
          'Lacosamide United States prescribing information, Warnings and Precautions 5.3 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of asymptomatic first-degree AV block in adjunctive trials against placebo, plus post-marketing arrhythmia reports',
        auditFlag: 'caution',
      },
      {
        id: 'lcm-a7',
        category: 'measured',
        title: 'Schedule V, on a euphoria score that matched a benzodiazepine',
        laymanSummary:
          'At twice the recommended daily dose in a single sitting, lacosamide produced euphoria that was statistically indistinguishable from alprazolam. That result, not any pattern of misuse, is why it is a controlled substance.',
        technicalDetails:
          'In a human abuse potential study, single doses of 200 mg, equal to the maximum single dose, and 800 mg, equal to twice the recommended daily maintenance dose, produced euphoria-type subjective responses that differed statistically from placebo. At 800 mg those responses were statistically indistinguishable from alprazolam, a Schedule IV drug, though of shorter duration. Euphoria was reported as an adverse event in 15% (5 of 34) at 800 mg against 0% on placebo, and in 6% (2 of 33) to 25% (3 of 12) across two pharmacokinetic studies at 300 to 800 mg against 0% on placebo. At therapeutic doses across the whole development programme, euphoria was reported in less than 1% of patients. Lacosamide is Schedule V in the United States, the least restrictive schedule.',
        evidenceSource:
          'Lacosamide United States prescribing information, Drug Abuse and Dependence 9.2 (openFDA drug label endpoint)',
        measuredMetric:
          'Euphoria-type subjective responses at supratherapeutic single doses against placebo and against alprazolam',
        auditFlag: 'verified',
      },
      {
        id: 'lcm-a8',
        category: 'inferred',
        title: 'A different mechanism has not been shown to produce a different clinical result',
        laymanSummary:
          'Acting on slow inactivation instead of fast is a genuine pharmacological distinction. What has not been shown is that it makes the drug work where the older ones fail, or work in someone the older ones did not help.',
        technicalDetails:
          'The slow-inactivation mechanism is well supported in cellular electrophysiology and is the reason lacosamide was missed by screening protocols built around fast inactivation. The clinical inference commonly drawn from it, that lacosamide can succeed in patients who have failed other sodium-channel blockers, is not established by any of the trials on this page. The registration programme enrolled patients refractory to 1 to 3 drugs without stratifying by whether those drugs were sodium-channel blockers, and the Baulac trial enrolled newly diagnosed patients who had failed nothing. Combining lacosamide with another sodium-channel blocker is common practice and rests on the same untested inference. The measured result is that lacosamide is as good as carbamazepine in people who have not tried either, which is a different claim.',
        evidenceSource:
          'Lacosamide United States prescribing information, Mechanism of Action 12.1 and Clinical Studies 14.1 to 14.3; Baulac M et al., Lancet Neurol 2017;16:43-54',
        doi: '10.1016/S1474-4422(16)30292-7',
        inferredClaim:
          'That acting on slow rather than fast inactivation makes lacosamide effective where other sodium-channel blockers have failed, or makes it a rational partner for one of them',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed or infused, with almost complete bioavailability either way',
        laymanDesc:
          'Absorption is essentially complete and food does not matter. The intravenous form delivers the same exposure, which is why a person in hospital can be switched between routes without recalculating.',
        molecularDetail:
          'Oral bioavailability approaches 100%, protein binding is under 15%, and the intravenous form is bioequivalent to the oral. Metabolism to the inactive O-desmethyl metabolite involves CYP2C19 among others, but the drug is neither a significant inducer nor a significant inhibitor, so the interaction burden is minimal.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches cortical neuron membranes',
        laymanDesc:
          'The molecule crosses into brain tissue and reaches the outer membrane of nerve cell axons, where sodium pores sit.',
        molecularDetail:
          'Distribution is rapid with a volume of distribution close to total body water. The relevant compartment is the axonal membrane of cortical neurons; unlike topiramate and zonisamide, lacosamide has no carbonic anhydrase activity, so it produces no renal, ocular or sweat gland effects.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It works on the slow switch, not the fast one',
        laymanDesc:
          'Sodium pores have two ways of becoming unavailable: one that happens in milliseconds and one that builds over seconds. Older drugs use the fast route. This one uses the slow route, which means it acts on tissue that has been over-excited for a while.',
        molecularDetail:
          'The label states that in vitro electrophysiological studies show lacosamide selectively enhances slow inactivation of voltage-gated sodium channels, stabilising hyperexcitable neuronal membranes and inhibiting repetitive neuronal firing, and that the precise mechanism in humans remains to be fully elucidated. Detecting the effect requires conditioning prepulses lasting seconds; standard fast-inactivation protocols largely miss it.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The pool of available channels shrinks where firing has been sustained',
        laymanDesc:
          'Tissue that has been quietly behaving keeps most of its pores. Tissue that has been depolarised for seconds loses a growing share of them, so it cannot keep a burst going.',
        molecularDetail:
          'Enhancement of slow inactivation reduces the available channel pool in a use- and time-dependent way without the acute effect on single action potentials that fast-inactivation blockers produce. The clinical corollary the label supports is inhibition of repetitive firing; the corollary it does not support is a specific advantage in patients who have failed fast-inactivation drugs.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Seizure freedom equal to carbamazepine, and 45% less risk of a second convulsion',
        laymanDesc:
          'In newly diagnosed adults, 90% were seizure-free at six months against 91% on carbamazepine. In generalised epilepsy, the risk of a second convulsive seizure fell by 45% against placebo.',
        molecularDetail:
          'Efficacy is established against placebo in three adjunctive partial-onset trials, against placebo in one primary generalised tonic-clonic trial (HR 0.548, 95% CI 0.381 to 0.788), and against controlled-release carbamazepine on a pre-specified non-inferiority margin in 888 newly diagnosed adults. The monotherapy indication itself was originally granted against a historical control rather than an active one.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Lacosamide versus carbamazepine-CR in newly diagnosed epilepsy (NCT01243177)',
        phase: 'Phase 3 double-blind randomised non-inferiority monotherapy trial',
        sampleSize: 888,
        primaryEndpoint:
          'Proportion of patients free from seizures for 6 consecutive months after stabilisation at the last assessed dose',
        endpointMet: true,
        statisticalPValue:
          'Kaplan-Meier 6-month seizure freedom 90% on lacosamide against 91% on carbamazepine-CR; absolute difference -1.3% (95% CI -5.5 to 2.8), within the pre-defined -12% absolute and -20% relative non-inferiority criteria',
        unreportedAdverseSignals:
          'Withdrawal for treatment-emergent adverse events was 11% on lacosamide and 16% on carbamazepine-CR. The trial was funded by UCB Pharma, the manufacturer of lacosamide.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Monotherapy Study 1 (label Clinical Studies 14.1)',
        phase:
          'Historical-control multicentre randomised trial, blinded between two lacosamide doses',
        sampleSize: 425,
        primaryEndpoint:
          'Percentage of patients meeting pre-specified exit criteria during the maintenance phase, against a pooled historical control',
        endpointMet: true,
        statisticalPValue:
          '30% met at least one exit criterion at 400 mg/day (95% CI 25% to 36%); the upper limit of 36% fell below the 65% threshold derived from historical sub-therapeutic control groups',
        unreportedAdverseSignals:
          'There is no concurrent comparator. The benchmark is a pooled analysis of control groups from eight earlier studies in which patients received a deliberately sub-therapeutic dose of a different drug.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Primary generalised tonic-clonic seizure Study 5 (label Clinical Studies 14.3)',
        phase: 'Phase 3 double-blind randomised placebo-controlled parallel-group trial, 24 weeks',
        sampleSize: 242,
        primaryEndpoint:
          'Time to second primary generalised tonic-clonic seizure during the 24-week treatment period',
        endpointMet: true,
        statisticalPValue:
          'Hazard ratio 0.548 (95% CI 0.381 to 0.788), P=0.001, a 45.2% risk reduction; 24-week PGTC seizure freedom 31.3% against 17.2%, adjusted difference 14.1% (3.2 to 25.1), P=0.011',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Adjunctive partial-onset seizure Studies 2, 3 and 4 (label Clinical Studies 14.2)',
        phase: 'Three 12-week randomised double-blind placebo-controlled multicentre trials',
        sampleSize: 1308,
        primaryEndpoint:
          'Reduction in 28-day partial-onset seizure frequency from baseline to the maintenance phase, against placebo',
        endpointMet: true,
        statisticalPValue:
          'Statistically significant at 200 mg/day in Study 4, at 400 mg/day in all three studies, and at 600 mg/day in Studies 2 and 3; the label reports the comparison graphically',
        unreportedAdverseSignals:
          'The pooled safety population for the cardiac analysis was 944 lacosamide and 364 placebo patients, in whom asymptomatic first-degree AV block occurred in 0.4% and 0% respectively.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Six-month seizure freedom of 90% against 91% on controlled-release carbamazepine in 888 newly diagnosed adults, meeting pre-defined non-inferiority criteria',
        'A 45.2% reduction in the risk of a second primary generalised tonic-clonic seizure over 24 weeks (HR 0.548, 95% CI 0.381 to 0.788)',
        'Significant reduction in 28-day partial seizure frequency against placebo at 400 mg/day in all three adjunctive trials',
        'Asymptomatic first-degree AV block in 0.4% of 944 lacosamide patients against 0% of 364 placebo patients',
        'Euphoria-type responses at 800 mg statistically indistinguishable from alprazolam, and reported as an adverse event in 15% at that dose against 0% on placebo',
        'No specific binding of tritiated lacosamide to human CRMP-2 at free concentrations of 100 to 1,450 nM, and none by surface plasmon resonance from 0.39 to 100 micromolar',
      ],
      unsupportedInferences: [
        'That lacosamide works where other sodium-channel blockers have failed: no trial stratified by prior sodium-channel-blocker failure, and the head-to-head trial enrolled patients who had failed nothing',
        'That combining lacosamide with a fast-inactivation sodium-channel blocker is mechanistically rational: the reasoning is plausible and the clinical test has not been done',
        'That the original monotherapy approval demonstrated efficacy against an alternative treatment, when the comparator was a historical pool of sub-therapeutic control groups',
        'That the dual CRMP-2 mechanism contributes anything, a claim that circulated for years and did not survive being tested',
      ],
      whatFailedInitially: [
        'The CRMP-2 target was searched for by radioligand binding and by surface plasmon resonance and was not detected by either; the calcium-channel consequence attributed to it was also absent',
        'Standard fast-inactivation electrophysiology protocols, the ones built around older drugs, largely miss this drug effect and would have under-rated it',
        'The monotherapy indication was originally granted without a concurrent active comparator; the comparison that mattered arrived nine years later',
      ],
      realWorldOutcome: [
        'Widely used in hospital because it can be given intravenously with minimal interactions and no need for level monitoring',
        'About 17 US cents per unit at United States pharmacy acquisition cost, a median across 94 listed generic products',
        'A Schedule V controlled substance in the United States, which adds prescribing friction that has nothing to do with observed misuse at therapeutic doses',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral solution, extended-release capsule and intravenous infusion',
      description:
        'The intravenous form is bioequivalent to the oral, so a person can be moved between them without recalculating exposure, and that is the main reason lacosamide entered hospital practice quickly. The label notes one case of profound bradycardia during a 15-minute infusion of 150 mg, and infusion rate is therefore not a neutral choice. The extended-release capsule Motpoly XR is a separate FDA application.',
      safetyProfile:
        'No boxed warning. The distinctive risk is cardiac: dose-dependent PR interval prolongation, asymptomatic first-degree AV block in 0.4% against 0% on placebo, and post-marketing reports of bradycardia, AV block and ventricular tachyarrhythmia rarely resulting in asystole, cardiac arrest and death, mostly in people with a predisposing condition or an interacting drug. An ECG before starting and after titration is recommended in those patients. Dizziness, ataxia and syncope have their own warning sections and are the commonest reasons for withdrawal. DRESS and multi-organ hypersensitivity are listed. Abrupt withdrawal risks increased seizure frequency. It is a Schedule V controlled substance on the strength of a supratherapeutic euphoria signal. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Is lacosamide really different from carbamazepine or lamotrigine?',
        a: 'Pharmacologically, yes, and the difference is specific rather than rhetorical. Sodium channels become unavailable in two distinct ways: fast inactivation, which happens within milliseconds, and slow inactivation, which builds over seconds of sustained depolarisation. Carbamazepine, phenytoin and lamotrigine act on the fast state; lacosamide selectively enhances the slow one. The effect is so time-dependent that a conventional electrophysiology protocol lasting tens of milliseconds barely detects it. What has not been shown is that this difference produces a different clinical result. No trial has tested whether lacosamide helps people who have already failed a fast-inactivation drug, and the one head-to-head trial enrolled patients who had failed nothing.',
        auditNote:
          'A real mechanistic difference and an unproven clinical difference are two separate claims, and they are usually made in the same sentence.',
      },
      {
        q: 'Why is it a controlled substance?',
        a: 'Because of one study, not because of any observed pattern of misuse. In a human abuse potential study, a single 800 mg dose, twice the recommended daily maintenance dose, produced euphoria-type subjective responses that were statistically indistinguishable from alprazolam, though shorter-lasting. Euphoria was reported as an adverse event in 15% of subjects at that dose against none on placebo, and in 6% to 25% across two pharmacokinetic studies at 300 to 800 mg. At therapeutic doses across the entire development programme, euphoria was reported in under 1% of patients. Lacosamide is Schedule V, the least restrictive schedule in the United States system.',
      },
      {
        q: 'Do I need a heart tracing before starting it?',
        a: 'The label recommends one before starting and again after titration to steady state, but only for a defined group: patients with underlying proarrhythmic conditions or taking other medications that affect cardiac conduction. In the adjunctive trials, asymptomatic first-degree AV block occurred in 4 of 944 lacosamide patients (0.4%) and in none of 364 placebo patients, which is a small and mostly harmless finding. The reason the recommendation exists is what came afterwards: post-marketing reports of bradycardia, AV block and ventricular tachyarrhythmia, rarely progressing to asystole, cardiac arrest and death, mostly in people the trials would have excluded.',
        auditNote:
          'A 0.4% asymptomatic trial finding and fatal post-marketing reports are consistent with each other. Trials exclude the people at risk.',
      },
      {
        q: 'What happened to the second mechanism I read about?',
        a: 'It was tested and it was not there. Lacosamide was introduced with a dual-mechanism description: sodium channel modulation plus binding to a protein called collapsin response mediator protein 2, or CRMP-2. In 2012 Errington and colleagues looked for that binding using tritiated lacosamide over free concentrations of 100 to 1,450 nanomolar and using surface plasmon resonance from 0.39 to 100 micromolar, against both isolated and membrane-bound human CRMP-2. Neither method detected specific binding, and the authors noted both were capable of detecting it in the micromolar range. A separate group showed lacosamide did not affect the calcium currents CRMP-2 was supposed to be regulating. The current United States label describes only the sodium channel action and says the precise mechanism remains to be fully elucidated.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for lacosamide could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 17 US cents per unit as a median across 94 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Baulac M et al. Efficacy, safety, and tolerability of lacosamide monotherapy versus controlled-release carbamazepine in patients with newly diagnosed epilepsy: a phase 3, randomised, double-blind, non-inferiority trial. Lancet Neurol 2017;16:43-54',
        identifier: '10.1016/S1474-4422(16)30292-7',
        kind: 'doi',
      },
      {
        label: 'Lacosamide versus carbamazepine-CR monotherapy trial registration',
        identifier: 'NCT01243177',
        kind: 'nct',
      },
      {
        label:
          'Errington AC et al. Drug binding assays do not reveal specific binding of lacosamide to collapsin response mediator protein 2 (CRMP-2). CNS Neurosci Ther 2012;18:493-500',
        identifier: '10.1111/j.1755-5949.2012.00313.x',
        kind: 'doi',
      },
      {
        label:
          'Wang Y, Khanna R. Voltage-gated calcium channels are not affected by the novel anti-epileptic drug lacosamide. Transl Neurosci 2011;2:13-22',
        identifier: '10.2478/s13380-011-0002-9',
        kind: 'doi',
      },
      {
        label:
          'Lacosamide United States prescribing information: Clinical Studies 14.1 to 14.3, Warnings and Precautions 5.1 to 5.6, Drug Abuse and Dependence 9.2, Mechanism of Action 12.1, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22LACOSAMIDE%22',
        kind: 'regulatory',
      },
      SANAD_II_FOCAL_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label:
          'Drugs@FDA: VIMPAT (lacosamide) tablets, NDA 022253, original approval 28 October 2008; injection NDA 022254; oral solution NDA 022255',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022253',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 219078 — lacosamide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/219078',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Phenytoin — the first drug found by screening, and the one whose dose curve bends.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'phenytoin',
    name: 'Phenytoin',
    tradeName: 'Dilantin / Phenytek',
    sponsor:
      'Parke-Davis (originator, 1938), now part of Viatris; long off-patent with many generic manufacturers of the capsule, chewable tablet, suspension and injection',
    targetGene: 'SCN2A',
    targetProtein:
      'Voltage-gated sodium channel alpha subunits, blocked in a voltage-dependent manner. The label states the precise mechanism has not been established but is thought to involve voltage-dependent blockade of membrane sodium channels reducing sustained high-frequency neuronal discharges.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1953,
    indication:
      'Treatment of tonic-clonic (grand mal) and psychomotor (temporal lobe) seizures, and prevention and treatment of seizures occurring during or following neurosurgery. The injection is indicated for generalised tonic-clonic status epilepticus and as short-term substitution when oral phenytoin cannot be given.',
    patientFriendlyIndication:
      'Generalised and focal epilepsy, seizures around brain surgery, and prolonged seizures in hospital',
    anatomicalSite:
      'Axonal membrane of cortical neurons; also the gingival fibroblast and the cerebellar Purkinje layer, where its long-term harms appear',
    conditionContext: {
      conditionExplainer:
        'Before 1938 the drugs available for epilepsy were bromides and phenobarbital, both of which worked partly by sedating the person taking them. Phenytoin was the first anti-seizure drug that suppressed seizures without that sedation, and it is the reason the modern specialty exists.',
      whyItMatters:
        'Phenytoin was found by deliberately screening compounds in an animal seizure model rather than by observing an effect in a patient. That method, not the molecule, is its main legacy: almost every anti-seizure drug for the next fifty years was found by running the same test.',
      whoTakesThis:
        'Fewer people than once did, but still very many worldwide. It is a WHO essential medicine, it is extremely cheap, and its intravenous form remains in status epilepticus protocols. Long-term use has visible costs that newer drugs do not impose.',
      clinicalGoals:
        'Seizure control at a serum level inside a narrow window, without the gum overgrowth, the bone loss, the rash or the unsteadiness that come with being slightly above it.',
    },
    oneSentenceVerdict:
      'The first anti-seizure drug discovered by systematic animal screening, which tied with carbamazepine for the best overall result among four drugs in a 622-patient blinded trial and matched levetiracetam and valproate in status epilepticus, and whose defining hazard is arithmetic: its clearing enzyme saturates, so the label states that a dose increase of 10% or more can push a serum level into intoxication.',
    laymanHowItWorks:
      'Phenytoin binds sodium pores in nerve membranes and holds shut the ones that have just been used, so a cell firing repeatedly loses more and more of them and the burst dies out. The complication is not in the brain but in the liver. The enzyme that destroys phenytoin runs out of capacity at ordinary doses. Below that point, doubling the dose doubles the blood level; above it, a small increase can send the level far higher than expected, which is why this drug is one of the few that needs blood testing to use safely.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 80,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1812 per unit, the median across 29 listed phenytoin products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Synthesised in 1908 by Heinrich Biltz and sitting unused for thirty years until Merritt and Putnam tested it in the cat electroshock model in 1938. Marketed by Parke-Davis as Dilantin, with the United States application dating to 1953. Long off-patent. The molecule is one of the cheapest in this class to make, and its price history in the United States has been shaped by the small number of manufacturers of specific formulations rather than by any remaining intellectual property.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Phenytoin has been tested head to head more often than almost any other anti-seizure drug, because for forty years it was what a new drug had to beat. It tied with carbamazepine in the Veterans Affairs trial and with levetiracetam and valproate in status epilepticus. What has changed is not its efficacy but the willingness to accept its long-term costs.',
      conventionalRx: [
        {
          name: 'Carbamazepine (Tegretol)',
          class: 'Sodium channel blocker',
          howItCompares:
            'In the 622-patient Veterans Affairs Cooperative Study, overall treatment success was highest with carbamazepine or phenytoin, with no separation between the two. Phenytoin caused more dysmorphic effects and hypersensitivity; carbamazepine has since acquired a boxed warning for SJS, TEN and aplastic anaemia that phenytoin oral formulations do not carry.',
          typicalCost:
            'US$0.3776 per unit, median across 92 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: linear kinetics, so a dose change produces a predictable level change. Cons: potent enzyme induction with autoinduction, and the HLA-B*1502 screening requirement, which phenytoin partly shares.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand, unrelated mechanism',
          howItCompares:
            'In ESETT, 384 patients with benzodiazepine-refractory convulsive status epilepticus were randomised blind to levetiracetam, fosphenytoin or valproate. Seizure cessation with improved consciousness at 60 minutes occurred in 47%, 45% and 46% respectively, and the trial stopped early for futility of separating them. Numerically more hypotension and intubation occurred with fosphenytoin.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no interactions, no level monitoring, no gum or bone effects, and no cardiac risk on infusion. Cons: irritability and aggression in 13% of adults and 38% of children in its registration trials.',
        },
        {
          name: 'Fosphenytoin (Cerebyx)',
          class: 'Water-soluble phosphate prodrug of phenytoin',
          howItCompares:
            'Converts to phenytoin after injection and delivers the same active drug. It exists because the phenytoin injection is formulated in propylene glycol at pH 12, which is what causes the tissue injury of purple glove syndrome. Fosphenytoin can be infused faster and hurts less, but the cardiovascular risk belongs to the phenytoin it becomes, and it was the arm of ESETT with numerically more hypotension and intubation.',
          typicalCost: 'Listed separately in the CMS NADAC file as a distinct injectable product',
          prosAndCons:
            'Pros: tolerable infusion site, faster administration, no propylene glycol. Cons: same active drug, same cardiac warnings, considerably more expensive per dose.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'Never compared directly with phenytoin in a large first-line trial, but it beat carbamazepine on treatment failure in SANAD, and carbamazepine tied with phenytoin in the Veterans Affairs study. In EURAP the malformation rate was 2.9% for lamotrigine against 6.4% for phenytoin.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: linear kinetics, no gum overgrowth, no bone effect, and a far lower malformation rate. Cons: slow introduction because of serious rash, with a boxed warning for it, and no intravenous form in routine use.',
        },
      ],
      naturalFoods: [
        {
          name: 'Vitamin D and calcium status',
          activeCompound: 'Cholecalciferol and dietary calcium',
          biologicalMechanism:
            'Phenytoin induces hepatic metabolising enzymes, which the label states may enhance the metabolism of vitamin D and lower vitamin D levels, potentially leading to deficiency, hypocalcaemia and hypophosphataemia. Chronic use has been associated with osteopenia, osteoporosis, osteomalacia and fractures.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. The label says consideration should be given to screening with bone-related laboratory and radiological tests and treating according to established guidelines, which is a prescriber decision rather than a supplement recommendation.',
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
          name: 'Take dental hygiene seriously, from the first month',
          action:
            'Brush and floss meticulously and see a dentist or hygienist regularly, starting when the drug starts rather than when the gums change.',
          patientImpact:
            'Gingival overgrowth is among the best-known long-term effects of phenytoin and is one of the reasons people stop it. Plaque control does not prevent it entirely but is the one factor a person influences directly.',
          clinicalPrecaution:
            'Established overgrowth may need surgical removal and may recur while the drug continues. This is a reason to raise it with the prescriber, not a reason to change the drug alone.',
        },
        {
          name: 'Never stop it suddenly',
          action:
            'If phenytoin has to come off, that happens gradually and by agreement with the prescriber.',
          patientImpact:
            'Warnings and Precautions 5.1 states that abrupt withdrawal of phenytoin in epileptic patients may precipitate status epilepticus, a continuous seizure that is itself life-threatening.',
          clinicalPrecaution:
            'The label carves out one exception, in the event of an allergic or hypersensitivity reaction, where more rapid substitution may be needed. That judgement is clinical, and this page gives no schedule.',
        },
        {
          name: 'Report new unsteadiness or slurred speech rather than adapting to it',
          action:
            'Wobbliness, double vision or slurred speech that is new needs a phone call and probably a blood level, not a period of getting used to it.',
          patientImpact:
            'The label states that because phenytoin is hydroxylated by a saturable enzyme system, small incremental doses may produce very substantial increases in serum levels, and that a 10% dose increase can cause intoxication when levels are already in the upper range.',
          clinicalPrecaution:
            'These symptoms are the classic clinical signs of a level that has crossed into toxicity. They are measurable, and the measurement is the point.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C=C1)C2(C(=O)NC(=O)N2)C3=CC=CC=C3',
      chemicalFormula: 'C15H12N2O2',
      molecularWeight: '252.27 g/mol',
      targetReceptorAffinity:
        'No affinity constant is quoted on the label as explaining the clinical effect. The clinically meaningful number for phenytoin is not a binding constant but a serum concentration range, because the relationship between dose and concentration is non-linear and the relationship between concentration and toxicity is steep.',
      structureSource: {
        label: 'PubChem CID 1775 — phenytoin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1775',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'pht-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of benzil and urea',
          description:
            'Confirm the two starting materials before the condensation. Phenytoin is made from benzil and urea in a single base-catalysed step first performed in 1908, which is why the molecule is among the cheapest in this class and why quality control at this stage is about ordinary chemical purity rather than anything exotic.',
          reagentsAndBuffer:
            'Benzil and urea reference standards, melting point determination, reverse-phase HPLC with UV detection at 254 nm, loss on drying',
        },
        {
          id: 'pht-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Benzilic acid rearrangement and hydantoin ring closure',
          description:
            'Condense benzil with urea under strong base. The reaction proceeds through a benzilic acid rearrangement that migrates one phenyl group and closes the five-membered hydantoin ring in the same operation. Both phenyl groups end up on the same carbon, and that geminal diphenyl arrangement is what distinguishes phenytoin from the sedating barbiturates it replaced.',
          dependsOnStepId: 'pht-w1',
          reagentsAndBuffer:
            'Sodium hydroxide or sodium ethoxide in ethanol, reflux, then acidification to precipitate the free hydantoin; nitrogen blanket, controlled addition rate',
        },
        {
          id: 'pht-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and separation of the free acid from the sodium salt',
          description:
            'Recrystallise and control which form is isolated. Phenytoin free acid and phenytoin sodium are not interchangeable by weight: 100 mg of the sodium salt contains about 92 mg of phenytoin, and formulations differ in dissolution as well. That difference has caused real dosing errors, which is why the specification names the salt form explicitly.',
          dependsOnStepId: 'pht-w2',
          reagentsAndBuffer:
            'Ethanol or acetone for recrystallisation, controlled pH during isolation, potentiometric titration to confirm salt stoichiometry, powder X-ray diffraction for form confirmation',
        },
        {
          id: 'pht-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Voltage-clamp with a depolarised holding potential',
          description:
            'Apply the compound to a sodium-channel-expressing cell held at a depolarised potential and again at a hyperpolarised one. The difference between the two is the entire pharmacology: phenytoin apparent potency rises steeply when channels have been driven into inactivation, which is the cellular version of the clinical claim that it suppresses seizing tissue more than resting tissue.',
          dependsOnStepId: 'pht-w3',
          reagentsAndBuffer:
            'HEK293 cells or cortical neurons expressing SCN2A, extracellular solution with 140 mM sodium chloride, caesium fluoride internal solution, paired holding potentials at -120 mV and -70 mV, 10 Hz stimulus trains',
        },
        {
          id: 'pht-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CYP2C9 genotype-stratified clearance measurement alongside free-drug quantification',
          description:
            'Measure total and unbound phenytoin by mass spectrometry across CYP2C9 genotypes rather than measuring total drug alone. Two facts make this the decisive assay for this molecule: the clearing enzyme saturates, so clearance is concentration-dependent, and the drug is heavily protein-bound, so total level misleads in renal disease, liver disease and low albumin. Reporting a total level without the genotype or the free fraction is how phenytoin toxicity is missed.',
          dependsOnStepId: 'pht-w4',
          reagentsAndBuffer:
            'Deuterated phenytoin internal standard, ultrafiltration for free-fraction separation, LC-MS/MS in multiple reaction monitoring mode, CYP2C9 *2 and *3 genotyping by allele-specific PCR, human liver microsomes for the enzyme-kinetics arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pht-a1',
        category: 'measured',
        title: 'Veterans Affairs 1985: tied with carbamazepine for the best overall result',
        laymanSummary:
          'Six hundred and twenty-two adults were randomly assigned double-blind to one of four anti-seizure drugs and followed two years. Carbamazepine and phenytoin came out equal at the top; phenobarbital was in the middle and primidone last.',
        technicalDetails:
          'Mattson and colleagues ran a 10-centre double-blind trial in 622 adults with partial and secondarily generalised tonic-clonic seizures, randomised to carbamazepine, phenobarbital, phenytoin or primidone and followed two years or until failure. Overall treatment success was highest with carbamazepine or phenytoin, intermediate with phenobarbital and lowest with primidone (p<0.002), the differences driven mainly by primidone causing more nausea, vomiting, dizziness and sedation. Control of tonic-clonic seizures did not differ significantly between the drugs. Carbamazepine controlled partial seizures completely more often than primidone or phenobarbital (p<0.03). Phenytoin caused more dysmorphic effects and hypersensitivity than the others, and the authors recommended carbamazepine and phenytoin as the drugs of first choice for single-drug therapy in adults.',
        evidenceSource:
          'Mattson RH et al., N Engl J Med 1985;313:145-151 (VA Cooperative Study 118)',
        doi: '10.1056/NEJM198507183130303',
        measuredMetric:
          'Overall treatment success at two years, combining seizure control and tolerability',
        auditFlag: 'verified',
      },
      {
        id: 'pht-a2',
        category: 'measured',
        title:
          'ESETT: no better and no worse than levetiracetam or valproate in status epilepticus',
        laymanSummary:
          'When a seizure will not stop after a benzodiazepine, three drugs are commonly given next. A blinded trial compared them and found all three stopped the seizure in about half of patients, with no winner.',
        technicalDetails:
          'ESETT randomised 384 children and adults with benzodiazepine-refractory convulsive status epilepticus to fosphenytoin (118), levetiracetam (145) or valproate (121) in a blinded, response-adaptive design. The primary outcome, absence of clinically evident seizures with improved consciousness at 60 minutes without additional anticonvulsant, occurred in 45% on fosphenytoin (95% credible interval 36 to 54), 47% on levetiracetam (39 to 55) and 46% on valproate (38 to 55), with posterior probabilities of being most effective of 0.24, 0.41 and 0.35. The trial stopped at a planned interim analysis for futility of finding any drug superior or inferior. Numerically more hypotension and intubation occurred with fosphenytoin and more deaths with levetiracetam, neither significantly. Fosphenytoin is the water-soluble prodrug, so this result belongs to phenytoin as the active agent.',
        evidenceSource: 'Kapur J et al., N Engl J Med 2019;381:2103-2113 (NCT01960075)',
        doi: '10.1056/NEJMoa1905795',
        measuredMetric:
          'Seizure cessation with improved consciousness at 60 minutes, without additional anticonvulsant',
        auditFlag: 'verified',
      },
      {
        id: 'pht-a3',
        category: 'measured',
        title: 'The clearing enzyme saturates: a 10% dose rise can cause intoxication',
        laymanSummary:
          'For most drugs, a slightly bigger dose gives a slightly higher blood level. Not this one. The liver enzyme that removes phenytoin runs out of capacity, so once the level is already toward the top of the range, a 10% increase in dose can push it into toxicity.',
        technicalDetails:
          'Phenytoin is metabolised primarily by CYP2C9 and to a lesser extent CYP2C19. The label states that because phenytoin is hydroxylated in the liver by an enzyme system that is saturable at high serum levels, small incremental doses may increase the half-life and produce very substantial increases in serum levels when these are in the upper range, and that steady-state levels may be disproportionately increased with resultant intoxication from a dosage increase of 10% or more. Average plasma half-life from the chewable tablet studies was 14 hours with a range of 7 to 29. The label also notes wide interpatient variability at equivalent doses, with unusually high levels arising from liver disease, variant CYP2C9 and CYP2C19 alleles, or interacting drugs, and unusually low levels from non-adherence or fast metabolism. Because the drug is extensively protein bound, the label directs that in renal or hepatic impairment or hypoalbuminaemia, monitoring should be based on the unbound fraction rather than the total level.',
        evidenceSource:
          'Phenytoin United States prescribing information, Clinical Pharmacology 12.3 and Warnings and Precautions 5.11 (openFDA drug label endpoint)',
        measuredMetric:
          'Disproportionate rise in steady-state serum level from a dose increment of 10% or more, and half-life range of 7 to 29 hours',
        auditFlag: 'verified',
      },
      {
        id: 'pht-a4',
        category: 'conclusion_shift',
        title:
          'Its severe rash turned out to be a clearance problem, not the immune story carbamazepine had',
        laymanSummary:
          'Carbamazepine severe skin reactions were traced to an immune gene. Phenytoin looked like it should follow the same pattern, and partly does. But the strongest genetic signal for phenytoin is a variant that simply slows the drug removal, so more drug hangs around.',
        technicalDetails:
          'Chung and colleagues ran a genome-wide association study in Taiwanese patients with phenytoin-related severe cutaneous adverse reactions, with validation in further Taiwanese, Japanese and Malaysian samples, comparing 105 cases of phenytoin-related severe cutaneous adverse reactions (61 Stevens-Johnson syndrome or toxic epidermal necrolysis, 44 DRESS) and 78 with maculopapular exanthema against 130 phenytoin-tolerant controls and 3,655 population controls. A cluster of 16 SNPs in the CYP2C genes at 10q23.33 reached genome-wide significance, and direct sequencing identified the missense variant rs1057910, CYP2C9*3, with an odds ratio of 12 (95% CI 6.6 to 20, p=1.1 x 10 to the -17), replicated across all three populations with a meta-analytic odds ratio of 11 (6.2 to 18). Delayed clearance of plasma phenytoin was observed in patients with severe reactions, especially CYP2C9*3 carriers, supplying the functional link. The current label carries both stories: it advises considering avoidance of phenytoin in HLA-B*1502-positive patients on limited evidence borrowed from carbamazepine, and separately in CYP2C9*3 carriers on this evidence. It also states that genotyping has important limitations and must never substitute for clinical vigilance.',
        evidenceSource: 'Chung WH et al., JAMA 2014;312:525-534',
        doi: '10.1001/jama.2014.7859',
        inferredClaim:
          'That severe cutaneous reactions to anti-seizure drugs share one immunogenetic mechanism. For phenytoin the dominant signal is a pharmacokinetic one: reduced clearance, more drug, more reaction.',
        auditFlag: 'verified',
      },
      {
        id: 'pht-a5',
        category: 'measured',
        title:
          'Rapid intravenous infusion causes hypotension and arrhythmia, and the boxed warning is a rate limit',
        laymanSummary:
          'The whole boxed warning on the injectable form is about speed. Above 50 mg per minute in an adult, blood pressure can collapse and the heart can lose its rhythm, and the label notes this has also happened at or below the recommended rate.',
        technicalDetails:
          'The boxed warning on phenytoin sodium injection states that the rate of intravenous administration should not exceed 50 mg per minute in adults and 1 to 3 mg/kg/min or 50 mg per minute, whichever is slower, in paediatric patients, because of the risk of severe hypotension and cardiac arrhythmias, and that careful cardiac monitoring is needed during and after administration. It adds that although risk increases with rates above the recommendation, these events have also been reported at or below it. The oral label separately records bradycardia and cardiac arrest under Cardiac Effects. Part of the injection hazard belongs to the vehicle rather than the drug: the formulation is highly alkaline and contains propylene glycol, which is why the water-soluble prodrug fosphenytoin exists and why extravasation can cause the tissue injury known as purple glove syndrome.',
        evidenceSource:
          'Phenytoin Sodium Injection United States prescribing information, boxed warning; phenytoin oral prescribing information, Warnings and Precautions 5.6 (openFDA drug label endpoint)',
        measuredMetric:
          'Maximum safe infusion rate, and reported cardiovascular events at and below that rate',
        auditFlag: 'caution',
      },
      {
        id: 'pht-a6',
        category: 'measured',
        title: 'EURAP: 6.4% major malformation rate, and a named fetal syndrome',
        laymanSummary:
          'Eight of 125 pregnancies exposed to phenytoin alone ended in a major birth defect, a rate of 6.4%. The label separately describes a recognised pattern of facial, finger and growth abnormalities named after the drug.',
        technicalDetails:
          'In the EURAP prospective registry of pregnancies on anti-epileptic monotherapy at conception across 42 countries, major congenital malformation prevalence at one year was 8 of 125 (6.4%) for phenytoin, against 17 of 599 (2.8%) for levetiracetam, 74 of 2,514 (2.9%) for lamotrigine, 10 of 333 (3.0%) for oxcarbazepine, 6 of 152 (3.9%) for topiramate, 107 of 1,957 (5.5%) for carbamazepine, 19 of 294 (6.5%) for phenobarbital and 142 of 1,381 (10.3%) for valproate. The phenytoin denominator is the smallest of the eight, so the estimate is imprecise. The label describes increased frequencies of orofacial clefts and cardiac defects and of abnormalities characteristic of fetal hydantoin syndrome, including dysmorphic skull and facial features, nail and digit hypoplasia, growth abnormalities including microcephaly, and cognitive deficits. It also notes several reported cases of malignancy including neuroblastoma, and a potentially life-threatening neonatal bleeding disorder related to decreased vitamin K-dependent clotting factors.',
        evidenceSource:
          'Tomson T et al., Lancet Neurol 2018;17:530-538; phenytoin United States prescribing information, Warnings and Precautions 5.13',
        doi: '10.1016/S1474-4422(18)30107-8',
        measuredMetric: 'Prevalence of major congenital malformations at 1 year, by drug',
        auditFlag: 'caution',
      },
      {
        id: 'pht-a7',
        category: 'measured',
        title: 'Chronic use thins bone, through an interaction with vitamin D',
        laymanSummary:
          'Phenytoin switches on liver enzymes that also destroy vitamin D. Over years this lowers vitamin D, calcium and phosphate, and the label links long-term use to osteopenia, osteoporosis, osteomalacia and fractures.',
        technicalDetails:
          'Warnings and Precautions 5.10 states that chronic use of phenytoin in patients with epilepsy has been associated with decreased bone mineral density, specifically osteopenia, osteoporosis and osteomalacia, and with bone fractures, and attributes the mechanism to hepatic enzyme induction enhancing vitamin D metabolism and lowering vitamin D levels, leading to deficiency, hypocalcaemia and hypophosphataemia. The label advises considering screening with bone-related laboratory and radiological tests as appropriate. This is a harm of the same enzyme induction that makes phenytoin interact with almost everything else a person takes, so it cannot be separated from the drug pharmacology or dosed around.',
        evidenceSource:
          'Phenytoin United States prescribing information, Warnings and Precautions 5.10 (openFDA drug label endpoint)',
        measuredMetric:
          'Association of chronic phenytoin use with reduced bone mineral density and fracture, via vitamin D metabolism',
        auditFlag: 'verified',
      },
      {
        id: 'pht-a8',
        category: 'conclusion_shift',
        title: 'The discovery method mattered more than the drug, and it encoded a blind spot',
        laymanSummary:
          'Merritt and Putnam found phenytoin in 1938 by testing compounds in a cat electroshock model rather than by trying them on patients. Every anti-seizure drug for decades afterwards was found the same way, which meant drugs that fail that particular test were never developed.',
        technicalDetails:
          'Merritt and Putnam reported sodium diphenylhydantoinate for convulsive disorders in JAMA in September 1938 after screening compounds in an electrically induced seizure model, and phenytoin became the first anti-seizure drug that suppressed seizures without sedation. The method, systematic animal screening, became the standard discovery route for the next fifty years, chiefly through the maximal electroshock and maximal pentylenetetrazol tests. That pipeline encoded an assumption: that a compound inactive in those two screens cannot work in people. Levetiracetam falsified it, showing no activity in either test up to 540 mg/kg while protecting potently in kindling models, and would have been discarded had those screens been the only filter. Phenytoin is therefore both the founding success of the screening era and the reason the era limits were invisible for so long.',
        evidenceSource:
          'Merritt HH, Putnam TJ. Sodium diphenyl hydantoinate in the treatment of convulsive disorders. JAMA 1938;111:1068-1073, reprinted as a landmark article in JAMA 1984;251:1062-1067',
        doi: '10.1001/jama.251.8.1062',
        inferredClaim:
          'That an animal screening model which finds one effective drug defines what an effective drug looks like. It defines what that model can find.',
        auditFlag: 'verified',
      },
      {
        id: 'pht-a9',
        category: 'inferred',
        title:
          'A total serum level is the number people act on, and it is the wrong number in three common situations',
        laymanSummary:
          'Phenytoin is monitored by a blood test, but the standard test measures total drug and most of it is stuck to protein. In kidney disease, liver disease or low albumin, the total number can look fine while the active free drug is toxic.',
        technicalDetails:
          'Phenytoin is extensively bound to serum plasma proteins, and only the unbound fraction is pharmacologically active. Warnings and Precautions 5.11 states that because the unbound fraction is increased in patients with renal or hepatic disease or hypoalbuminaemia, monitoring in those patients should be based on the unbound fraction. In routine practice the assay ordered is usually total phenytoin, and the free level is a separate, less available and more expensive test. The result is a specific and predictable failure mode: a patient with low albumin whose total level reads within the therapeutic range while the free level is toxic. Nothing about this is contested, and the label states it directly; the gap is between what the label directs and what is routinely measured.',
        evidenceSource:
          'Phenytoin United States prescribing information, Warnings and Precautions 5.11 and Clinical Pharmacology 12.3 (openFDA drug label endpoint)',
        inferredClaim:
          'That a total phenytoin level inside the reference range means the patient is not toxic. In renal disease, hepatic disease or hypoalbuminaemia the label says to measure the unbound fraction instead.',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed slowly, and cleared by an enzyme that runs out of capacity',
        laymanDesc:
          'Absorption varies between formulations and takes hours. Removal is the unusual part: the liver enzyme responsible saturates, so the relationship between dose and blood level stops being a straight line.',
        molecularDetail:
          'Metabolism is primarily by CYP2C9 with a lesser contribution from CYP2C19, and the hydroxylation system is saturable at therapeutic serum levels. Average half-life is 14 hours with a range of 7 to 29. The label states that a dosage increase of 10% or more can disproportionately increase the steady-state level and cause intoxication when levels are already in the upper range.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Most of it travels bound to protein; only the free fraction acts',
        laymanDesc:
          'Nearly all the drug in the blood is stuck to albumin. Only the small unbound share crosses into the brain and does anything, which is why the standard blood test can mislead when albumin is low.',
        molecularDetail:
          'Phenytoin is extensively bound to serum plasma proteins. The label directs that in renal or hepatic impairment or hypoalbuminaemia, monitoring should be based on the unbound fraction. Most of the drug is excreted in bile as inactive metabolites, reabsorbed from the intestine and eliminated in urine.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds sodium channels that have just been used',
        laymanDesc:
          'Sodium pores spend a moment shut and unavailable right after firing. Phenytoin binds them in that state and holds them there, so pores that have been active recently are the ones taken out of service.',
        molecularDetail:
          'The label states the precise mechanism has not been established but is thought to involve voltage-dependent blockade of membrane sodium channels reducing sustained high-frequency neuronal discharges. Apparent potency measured in a cell rises steeply from a depolarised holding potential compared with a hyperpolarised one.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Sustained high-frequency firing collapses',
        laymanDesc:
          'A cell firing occasionally is barely touched. A cell firing in a rapid train loses more of its pores with every spike, so the train cannot sustain itself or recruit neighbouring tissue.',
        molecularDetail:
          'Cumulative use-dependent block reduces sustained high-frequency discharge without abolishing normal single action potentials, which is the property that separated phenytoin from the sedating barbiturates in 1938 and remains the clearest statement of what the drug does at a cellular level.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Seizure control equal to the best alternatives, at a long-term price',
        laymanDesc:
          'Tied with carbamazepine for the best result among four drugs over two years, and tied with levetiracetam and valproate for stopping status epilepticus. What separates it now is what happens over years: gums, bones, skin and unsteadiness.',
        molecularDetail:
          'Efficacy is established in the 622-patient Veterans Affairs Cooperative Study and, as fosphenytoin, in the 384-patient ESETT trial. The long-term burden is enzyme induction with vitamin D depletion and bone loss, gingival overgrowth, hypersensitivity reactions with a CYP2C9*3 genetic component, and dysmorphic effects.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VA Cooperative Study 118 (Mattson 1985)',
        phase: 'Double-blind randomised comparative trial, 10 centres, 2-year follow-up',
        sampleSize: 622,
        primaryEndpoint:
          'Overall treatment success combining seizure control and tolerability, across carbamazepine, phenobarbital, phenytoin and primidone',
        endpointMet: true,
        statisticalPValue:
          'Highest with carbamazepine or phenytoin, lowest with primidone, P<0.002; no significant difference between drugs for control of tonic-clonic seizures',
        unreportedAdverseSignals:
          'Phenytoin caused more dysmorphic effects and hypersensitivity than the other three drugs, an outcome the trial recorded but which no protocol was designed to quantify over two years.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ESETT (NCT01960075), fosphenytoin arm',
        phase: 'Blinded, response-adaptive randomised comparative-effectiveness trial',
        sampleSize: 384,
        primaryEndpoint:
          'Absence of clinically evident seizures with improved consciousness at 60 minutes, without additional anticonvulsant',
        endpointMet: true,
        statisticalPValue:
          '45% on fosphenytoin (95% credible interval 36 to 54) against 47% levetiracetam and 46% valproate; posterior probability of being most effective 0.24',
        unreportedAdverseSignals:
          'Numerically more hypotension and intubation occurred with fosphenytoin, neither difference significant. The trial stopped early for futility of separating the three drugs.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Phenytoin severe cutaneous adverse reaction GWAS (Chung 2014)',
        phase: 'Genome-wide association study with three-population replication',
        sampleSize: 3968,
        primaryEndpoint:
          'Genetic variants associated with phenytoin-related severe cutaneous adverse reactions',
        endpointMet: true,
        statisticalPValue:
          'CYP2C9*3 (rs1057910) odds ratio 12 (95% CI 6.6 to 20), P=1.1 x 10^-17 in Taiwan; meta-analytic odds ratio across Taiwan, Japan and Malaysia 11 (6.2 to 18), P<0.00001',
        unreportedAdverseSignals:
          'This is a case-control genetic study, not a prevention trial. No prospective study has shown that CYP2C9 genotyping before treatment reduces the incidence of severe cutaneous reactions, as the Taiwanese HLA-B*1502 study did for carbamazepine.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Overall treatment success equal to carbamazepine and superior to phenobarbital and primidone in 622 double-blind patients followed two years (P<0.002)',
        'Seizure cessation with improved consciousness at 60 minutes in 45% of patients with benzodiazepine-refractory status epilepticus, statistically indistinguishable from levetiracetam and valproate',
        'A disproportionate rise in steady-state serum level from a dose increment of 10% or more, on a saturable CYP2C9 hydroxylation system',
        'CYP2C9*3 odds ratio of 11 to 12 for phenytoin-related severe cutaneous adverse reactions, replicated in Taiwan, Japan and Malaysia',
        '8 major congenital malformations in 125 monotherapy-exposed pregnancies (6.4%) in the EURAP registry',
      ],
      unsupportedInferences: [
        'That a total phenytoin level inside the reference range excludes toxicity, when the label directs unbound-fraction monitoring in renal disease, hepatic disease and hypoalbuminaemia',
        'That the severe cutaneous reactions of anti-seizure drugs share one immune mechanism: for phenytoin the replicated signal is a clearance variant, not an HLA allele',
        'That CYP2C9 genotyping before treatment prevents severe reactions, which is plausible and has not been prospectively tested as HLA-B*1502 screening was for carbamazepine',
        'That an infusion rate at or below 50 mg per minute is safe, when the boxed warning states the cardiovascular events have also occurred at or below the recommended rate',
      ],
      whatFailedInitially: [
        'The molecule was synthesised in 1908 and sat unused for thirty years because nobody had a way to test whether it stopped seizures',
        'Its screening method, which found it, encoded the assumption that a drug inactive in the electroshock and pentylenetetrazol tests cannot work; levetiracetam later falsified that',
        'It lost first-line status in most high-income countries on long-term harms rather than on any failure of seizure control',
      ],
      realWorldOutcome: [
        'A WHO essential medicine, still on status epilepticus protocols worldwide and still in wide use where cost decides',
        'About 18 US cents per unit at United States pharmacy acquisition cost, a median across 29 listed generic products',
        'One of very few anti-seizure drugs whose safe use genuinely requires a blood test, because the dose-to-level relationship is non-linear and the therapeutic window is narrow',
      ],
    },
    deliverySystem: {
      type: 'Oral extended-release capsule, chewable tablet, oral suspension, and intravenous or intramuscular injection',
      description:
        'Formulations are not interchangeable by milligram. The chewable tablet is phenytoin free acid and is absorbed faster than the 100 mg extended phenytoin sodium capsule, and the sodium salt contains about 92% phenytoin by weight. The injection is formulated in propylene glycol at high pH, which is why extravasation causes severe local tissue injury and why the water-soluble prodrug fosphenytoin was developed.',
      safetyProfile:
        'The injection carries a boxed warning for cardiovascular risk with rapid infusion: not above 50 mg per minute in adults, with cardiac monitoring during and after, and the warning notes events have also occurred at or below that rate. Across formulations: SJS and TEN, DRESS and multi-organ hypersensitivity, angioedema, acute hepatotoxicity, haematopoietic complications, bradycardia and cardiac arrest. Abrupt withdrawal may precipitate status epilepticus. Chronic use lowers vitamin D and is associated with osteopenia, osteoporosis, osteomalacia and fractures. Gingival overgrowth and dysmorphic facial changes are the visible long-term costs. Prenatal exposure carries a named fetal hydantoin syndrome and a neonatal bleeding disorder from reduced vitamin K-dependent clotting factors. Consider avoiding the drug in HLA-B*1502-positive patients and in CYP2C9*3 carriers. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Why does phenytoin need blood tests when most seizure drugs do not?',
        a: 'Because its dose-to-level curve bends. The liver enzyme that clears phenytoin, CYP2C9, saturates at ordinary therapeutic concentrations. Below saturation the relationship is roughly proportional; above it, the label states that small incremental doses may produce very substantial increases in serum level, and that a dose increase of 10% or more can push a level that was already in the upper range into intoxication. Half-life ranges from 7 to 29 hours between individuals at the same dose. There is a second reason: the drug is heavily protein-bound, so in renal disease, liver disease or low albumin the label directs monitoring of the unbound fraction rather than the total, because a total level can read normal while the active free drug is toxic.',
        auditNote:
          'The total-versus-free distinction is stated on the label and is the commonest way phenytoin toxicity is missed.',
      },
      {
        q: 'Is phenytoin an old drug that has been superseded?',
        a: 'On seizure control, no. It tied with carbamazepine for the best overall result among four drugs in the 622-patient double-blind Veterans Affairs trial, and as fosphenytoin it was statistically indistinguishable from levetiracetam and valproate in ESETT, the blinded trial of 384 patients with status epilepticus. What has changed is the accounting of its long-term costs: gum overgrowth, dysmorphic facial changes, vitamin D depletion with bone loss and fractures, hypersensitivity reactions, and a fetal syndrome named after the drug. Newer drugs are not more effective; they are easier to live with, and they do not need a blood test to use safely.',
      },
      {
        q: 'Should I be genotyped before starting phenytoin?',
        a: 'The label says to consider avoiding phenytoin in two groups: people positive for HLA-B*1502, and carriers of CYP2C9*3. The evidence differs between them. For HLA-B*1502 the label describes limited evidence borrowed from the carbamazepine work in Asian ancestry. For CYP2C9*3 the evidence is a genome-wide association study with replication in Taiwan, Japan and Malaysia, giving an odds ratio of 11 to 12 for severe cutaneous reactions, with delayed phenytoin clearance in carriers supplying the mechanism. What does not exist for phenytoin is what does exist for carbamazepine: a prospective study showing that testing before treatment actually prevents cases. The label itself states genotyping has important limitations and must never substitute for clinical vigilance.',
        auditNote:
          'An association with an odds ratio of 11 and a prevention trial are different things, and only carbamazepine has both.',
      },
      {
        q: 'Why must the intravenous form be given so slowly?',
        a: 'Because of hypotension and cardiac arrhythmia. The entire boxed warning on phenytoin sodium injection is a rate limit: not more than 50 mg per minute in adults, and 1 to 3 mg/kg/min or 50 mg per minute, whichever is slower, in children, with careful cardiac monitoring during and after. The label adds that although the risk rises above that rate, these events have also been reported at or below it. Part of the hazard belongs to the formulation rather than the molecule: the injection is strongly alkaline and contains propylene glycol, which is also why leakage from the vein can cause severe local tissue damage, and why the water-soluble prodrug fosphenytoin was developed.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for phenytoin could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 18 US cents per unit as a median across 29 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mattson RH et al. Comparison of carbamazepine, phenobarbital, phenytoin, and primidone in partial and secondarily generalized tonic-clonic seizures. N Engl J Med 1985;313:145-151',
        identifier: '10.1056/NEJM198507183130303',
        kind: 'doi',
      },
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
          'Chung WH et al. Genetic variants associated with phenytoin-related severe cutaneous adverse reactions. JAMA 2014;312:525-534',
        identifier: '10.1001/jama.2014.7859',
        kind: 'doi',
      },
      {
        label:
          'Merritt HH, Putnam TJ. Sodium diphenyl hydantoinate in the treatment of convulsive disorders. JAMA 1938;111:1068-1073, reprinted as a landmark article in JAMA 1984;251:1062-1067',
        identifier: '10.1001/jama.251.8.1062',
        kind: 'doi',
      },
      {
        label:
          'Phenytoin United States prescribing information (oral): Warnings and Precautions 5.1 to 5.13, Clinical Pharmacology 12.3 and Pharmacogenomics 12.5, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PHENYTOIN%22',
        kind: 'regulatory',
      },
      {
        label:
          'Phenytoin Sodium Injection United States prescribing information: boxed warning on cardiovascular risk associated with rapid infusion, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PHENYTOIN+SODIUM%22',
        kind: 'regulatory',
      },
      EURAP_SOURCE,
      KETOGENIC_DIET_SOURCE,
      {
        label: 'PubChem CID 1775 — phenytoin structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1775',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Clobazam — a benzodiazepine licensed for epilepsy 40 years after it reached Europe.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'clobazam',
    name: 'Clobazam',
    tradeName: 'Onfi / Sympazan',
    sponsor:
      'Hoechst (originator, Europe 1970s); Lundbeck LLC for Onfi in the United States; Aquestive Therapeutics for the Sympazan oral film; now off-patent for the tablet and suspension',
    targetGene: 'GABRA1',
    targetProtein:
      'GABA-A receptor benzodiazepine site. The label states the exact mechanism is not fully understood but is thought to involve potentiation of GABAergic neurotransmission through binding at that site.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2011,
    indication:
      'Adjunctive treatment of seizures associated with Lennox-Gastaut syndrome in patients 2 years of age or older',
    patientFriendlyIndication:
      'Drop attacks and other seizures in Lennox-Gastaut syndrome, added to other seizure medicines',
    anatomicalSite:
      'GABA-A receptors on cortical and thalamic neurons, at the interface between the alpha and gamma subunits',
    conditionContext: {
      conditionExplainer:
        'Lennox-Gastaut syndrome is a severe childhood epilepsy defined by several seizure types at once, a characteristic slow spike-and-wave EEG, and intellectual disability. Its signature seizure is the drop attack, in which muscle tone is lost or a sudden stiffening throws the person to the ground.',
      whyItMatters:
        'Drop attacks are one of the few seizure types where the count and the harm line up directly, because each one is a fall. A drug that halves them halves a specific, countable injury risk, which is not true of most seizure-frequency endpoints.',
      whoTakesThis:
        'Children and adults with Lennox-Gastaut syndrome, almost always alongside two or three other anti-seizure drugs. Outside the United States clobazam has been used far more broadly in epilepsy for decades.',
      clinicalGoals:
        'Fewer falls, without the sedation that is the defining cost of every benzodiazepine, and without the tolerance that historically ended benzodiazepine use in epilepsy.',
    },
    oneSentenceVerdict:
      'A 1,5-benzodiazepine used in Europe since the 1970s and approved in the United States only in 2011, which cut weekly drop seizures by 68.3% at the highest dose against 12.1% on placebo in 238 patients with Lennox-Gastaut syndrome, and which carries a boxed warning for opioid co-prescription, abuse and dependence that reflects its chemical class rather than any signal from that trial.',
    laymanHowItWorks:
      'GABA is the brain main calming signal, and it works by opening a channel that lets chloride into a nerve cell and makes it harder to fire. Clobazam does not open that channel itself. It sits at a separate spot on the same receptor and makes GABA better at its job, so every pulse of natural GABA produces a bigger calming effect. Most of the work is done not by clobazam but by a long-lived breakdown product, N-desmethylclobazam, which circulates at three to five times the concentration of the drug swallowed.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3902 per unit, the median across 32 listed clobazam products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Developed by Hoechst and marketed in Europe from the 1970s, first as an anxiolytic and then widely in epilepsy. The United States approval came in October 2011 as Onfi under NDA 202067, four decades later, on the strength of two trials in Lennox-Gastaut syndrome and an orphan designation. It is a Schedule IV controlled substance. The tablet and suspension are now generic; the orally dissolving film Sympazan is a separate application.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Lennox-Gastaut syndrome is one of the few epilepsies with several drugs licensed specifically for it, and none of them controls it. Clobazam competes with rufinamide, topiramate, lamotrigine, felbamate and cannabidiol, all of which were approved on the same drop-attack endpoint against placebo, and none of which has been compared head to head with another.',
      conventionalRx: [
        {
          name: 'Topiramate (Topamax)',
          class: 'Sulfamate with four proposed mechanisms',
          howItCompares:
            'Also licensed for seizures associated with Lennox-Gastaut syndrome from age 2, on a placebo-controlled trial with percent reduction in drop attacks and a parental global rating as co-primary measures. No trial compares it with clobazam.',
          typicalCost:
            'US$0.2547 per unit, median across 158 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: not a controlled substance, no dependence or withdrawal syndrome. Cons: cognitive dysfunction reaching 56% at the highest trial doses, metabolic acidosis in up to 67% of children, and kidney stones.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'Holds a Lennox-Gastaut indication from its own placebo-controlled trial, and is one of the drugs most commonly already in place when clobazam is added: the label names valproate, lamotrigine, levetiracetam and topiramate as the commonest concomitant treatments at baseline in the clobazam trials.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: no sedation, no dependence, and the lowest malformation rate in EURAP alongside levetiracetam. Cons: serious rash with a boxed warning, and the risk is highest in children and when valproate is co-prescribed, which in this syndrome it usually is.',
        },
        {
          name: 'Rufinamide (Banzel)',
          class: 'Triazole derivative acting on sodium channel inactivation',
          howItCompares:
            'Approved for Lennox-Gastaut syndrome on the same drop-attack endpoint. Like clobazam, its licence rests on a single adequate placebo-controlled trial in this population, and no head-to-head comparison with clobazam exists.',
          typicalCost: 'Listed separately in the CMS NADAC file',
          prosAndCons:
            'Pros: not a controlled substance and no dependence risk. Cons: shortening of the QT interval, and a smaller evidence base than clobazam long European history.',
        },
        {
          name: 'Cannabidiol (Epidiolex)',
          class: 'Plant-derived cannabinoid, mechanism not established',
          howItCompares:
            'Approved for Lennox-Gastaut syndrome on drop-seizure trials in which most participants were also taking clobazam. Cannabidiol inhibits CYP2C19, which raises N-desmethylclobazam, the active clobazam metabolite, so part of the observed benefit in those trials is contested as a clobazam interaction rather than an independent effect.',
          typicalCost: 'Branded oral solution; listed separately in the CMS NADAC file',
          prosAndCons:
            'Pros: a genuinely different mechanism in a syndrome with few options. Cons: hepatic transaminase elevations, somnolence, and the unresolved question of how much of its effect is a clobazam interaction.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream effects on GABA synthesis and adenosine signalling. It has a longer history in Lennox-Gastaut syndrome than most of the drugs licensed for it.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never stop it abruptly, and say so to any new prescriber',
          action:
            'Make sure every clinician who prescribes for this person knows clobazam is a benzodiazepine and that stopping it needs a planned taper.',
          patientImpact:
            'The boxed warning states that continued use may lead to clinically significant physical dependence, that the risks of dependence and withdrawal rise with longer duration and higher dose, and that abrupt discontinuation or rapid dose reduction may precipitate acute withdrawal reactions which can be life-threatening.',
          clinicalPrecaution:
            'This page gives no taper schedule. The point is that the taper is a medical decision that has to be made deliberately, and that a hospital admission or a change of prescriber is when it most often gets missed.',
        },
        {
          name: 'Treat any opioid prescription as a conversation, not a routine',
          action:
            'If an opioid is being prescribed for pain, after surgery or in an emergency department, say out loud that this person takes clobazam.',
          patientImpact:
            'The first half of the boxed warning states that concomitant use of benzodiazepines and opioids may result in profound sedation, respiratory depression, coma and death, and that observational studies show concomitant use raises drug-related mortality compared with opioids alone.',
          clinicalPrecaution:
            'The label does not prohibit the combination. It reserves it for patients whose alternatives are inadequate, at the lowest dose and shortest duration, with monitoring.',
        },
        {
          name: 'Report a rash on the same day, in the first eight weeks especially',
          action: 'Any new rash needs a call, and a photograph with a date helps.',
          patientImpact:
            'The label instructs discontinuation at the first sign of rash unless it is clearly not drug-related, and names Stevens-Johnson syndrome and toxic epidermal necrolysis. Many people in this population also take lamotrigine and valproate, a combination with its own serious rash risk.',
          clinicalPrecaution:
            'Deciding which of three or four drugs caused a rash is a specialist judgement, and it is one reason to report early rather than after the rash resolves.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C(=O)CC(=O)N(C2=C1C=CC(=C2)Cl)C3=CC=CC=C3',
      chemicalFormula: 'C16H13ClN2O2',
      molecularWeight: '300.74 g/mol',
      targetReceptorAffinity:
        'Relative potency of the active metabolite N-desmethylclobazam against the parent compound is estimated from animal and in vitro receptor binding data to range from one fifth to equal. That is a five-fold uncertainty in which molecule is doing the work, and it is stated on the label.',
      structureSource: {
        label: 'PubChem CID 2789 — clobazam structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2789',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'clb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the chlorinated aniline precursor and regiochemical check',
          description:
            'Confirm the substituted 2-amino-5-chloro aromatic before ring construction, and check that the chlorine sits where it should. Clobazam differs from the classical benzodiazepines by where its two nitrogens are: at positions 1 and 5 rather than 1 and 4. That single difference is the basis of every claim that it sedates less, and it is set by which nitrogen goes where in this step.',
          reagentsAndBuffer:
            'Chlorinated N-methylaniline reference standard, reverse-phase HPLC with UV detection at 230 nm, proton NMR for regiochemical assignment, Karl Fischer titration',
        },
        {
          id: 'clb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Construction of the 1,5-benzodiazepine-2,4-dione ring',
          description:
            'Close the seven-membered ring bearing carbonyls at both positions 2 and 4, with the N-phenyl group at position 5 and the methyl at position 1. The 2,4-dione arrangement is unique among marketed benzodiazepines and is what the pharmacology claim rests on.',
          dependsOnStepId: 'clb-w1',
          reagentsAndBuffer:
            'Malonyl chloride or a malonate equivalent, base such as triethylamine, aprotic solvent, controlled addition below room temperature, nitrogen blanket',
        },
        {
          id: 'clb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with an N-desmethyl impurity specification',
          description:
            'Recrystallise and set a limit for N-desmethylclobazam in the drug substance. This impurity is also the principal active metabolite in people, circulating at three to five times the parent concentration, so a batch specification here and a pharmacokinetic measurement in a patient are literally measuring the same molecule.',
          dependsOnStepId: 'clb-w2',
          reagentsAndBuffer:
            'Ethanol or ethyl acetate for recrystallisation, LC-MS with selected ion monitoring for the desmethyl mass, powder X-ray diffraction for form confirmation',
        },
        {
          id: 'clb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'GABA-evoked chloride current with parent and metabolite applied separately',
          description:
            'Record GABA-evoked chloride currents from receptor-expressing cells while applying clobazam and N-desmethylclobazam separately at matched concentrations. Running only the parent would be the wrong experiment: at therapeutic doses the metabolite is present at three to five times the concentration, and the label puts its relative potency anywhere between one fifth and equal.',
          dependsOnStepId: 'clb-w3',
          reagentsAndBuffer:
            'Xenopus oocytes or HEK293 cells expressing alpha-beta-gamma GABA-A subunit combinations, sub-maximal GABA concentration for potentiation measurement, flumazenil as a benzodiazepine-site antagonist control, synthetic N-desmethylclobazam standard',
        },
        {
          id: 'clb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CYP2C19 genotype-stratified metabolite quantification',
          description:
            'Quantify parent and metabolite in plasma across CYP2C19 genotypes. The label states that in poor metabolisers, N-desmethylclobazam levels are five-fold higher in plasma and two to three-fold higher in urine than in extensive metabolisers. That is a five-fold difference in exposure to the main active species, produced by a common inherited variant and by any co-prescribed CYP2C19 inhibitor.',
          dependsOnStepId: 'clb-w4',
          reagentsAndBuffer:
            'Deuterated clobazam and N-desmethylclobazam internal standards, protein-precipitated plasma, LC-MS/MS in multiple reaction monitoring mode, CYP2C19 *2, *3 and *17 genotyping by allele-specific PCR',
        },
      ],
    },
    keyAudits: [
      {
        id: 'clb-a1',
        category: 'measured',
        title: 'Drop seizures fell 68.3% at the highest dose against 12.1% on placebo',
        laymanSummary:
          'Two hundred and thirty-eight patients with Lennox-Gastaut syndrome added clobazam or a dummy to their existing drugs. Weekly drop attacks fell by 68.3% at the highest dose and by 12.1% on placebo, and the effect grew at each dose step.',
        technicalDetails:
          'Ng and colleagues randomised patients aged 2 to 60 to placebo or clobazam 0.25, 0.5 or 1.0 mg/kg/day, with a 4-week baseline, 3-week titration and 12-week maintenance phase. Of 305 screened, 238 were randomised and 217 formed the modified intention-to-treat population. Average weekly drop seizure rates decreased 12.1% on placebo against 41.2% (p=0.0120), 49.4% (p=0.0015) and 68.3% (p<0.0001) at the three doses. Responder rates at 50% or more were 31.6% on placebo against 43.4% (p=0.3383), 58.6% (p=0.0159) and 77.6% (p<0.0001). Physicians and caregivers global assessments both improved significantly. The commonest adverse events were somnolence, pyrexia, upper respiratory infection and lethargy. The authors classified the result as Class II evidence, not Class I. The label records that there was no evidence of tolerance to the therapeutic effect over the 3-month maintenance period, which for a benzodiazepine in epilepsy is the specific question that needed answering.',
        evidenceSource: 'Ng YT et al., Neurology 2011;77:1473-1481',
        doi: '10.1212/WNL.0b013e318232de76',
        measuredMetric:
          'Percentage decrease in mean weekly drop seizure rate, maintenance against baseline, by dose',
        auditFlag: 'verified',
      },
      {
        id: 'clb-a2',
        category: 'inferred',
        title: 'The lowest dose beat placebo on percentages and not on people',
        laymanSummary:
          'At the lowest dose the average percentage reduction was significantly better than placebo. The proportion of patients who actually halved their seizures was not: 43.4% against 31.6%, p=0.34.',
        technicalDetails:
          'The label states that all dose groups were statistically superior to placebo, which is true of the primary endpoint, the percentage decrease in mean weekly drop seizure rate. The responder analysis tells a different story at the bottom of the dose range: 43.4% at 0.25 mg/kg/day against 31.6% on placebo, p=0.3383. The two higher doses cleared it comfortably (58.6%, p=0.0159; 77.6%, p<0.0001). A mean percentage reduction can be moved by a small number of large responders in a population whose baseline seizure counts ran from 61 to 105 per week; a responder rate cannot. The placebo responder rate was 31.6%, meaning a third of this population met the response threshold with no change in treatment.',
        evidenceSource: 'Ng YT et al., Neurology 2011;77:1473-1481',
        doi: '10.1212/WNL.0b013e318232de76',
        measuredMetric:
          'Responder rate at 50% or greater reduction, by dose, against a 31.6% placebo responder rate',
        inferredClaim:
          'That every dose tested helps a patient, because every dose was superior on the average percentage. At the lowest dose the proportion of patients meaningfully helped did not separate from placebo.',
        auditFlag: 'caution',
      },
      {
        id: 'clb-a3',
        category: 'measured',
        title: 'The second trial had no placebo: high dose against low dose',
        laymanSummary:
          'The other registration study randomised 68 patients between a high and a low dose of clobazam, with no placebo group. Drop seizures fell by a median of 93% on the high dose and 29% on the low.',
        technicalDetails:
          'Study 2 was a randomised, double-blind comparison of high- and low-dose clobazam in 68 patients aged 2 to 25 with current or prior Lennox-Gastaut syndrome, with a 4-week baseline, 3-week titration and 4-week maintenance phase, stratified by weight. The primary measure was percentage reduction in weekly drop seizure frequency, and the high-dose group achieved a median reduction of 93% against 29% in the low-dose group (p<0.05). The design demonstrates dose-response rather than efficacy against no treatment, and the four-week maintenance period is a third the length of Study 1. Both studies are described as establishing effectiveness; only one of them has a placebo arm.',
        evidenceSource:
          'Clobazam United States prescribing information, Clinical Studies 14, Study 2 (openFDA drug label endpoint)',
        measuredMetric:
          'Median percentage reduction in weekly drop seizure frequency, high dose against low dose',
        auditFlag: 'verified',
      },
      {
        id: 'clb-a4',
        category: 'measured',
        title:
          'Most of the drug effect belongs to a metabolite whose potency is uncertain five-fold',
        laymanSummary:
          'At therapeutic doses, the breakdown product N-desmethylclobazam circulates at three to five times the concentration of clobazam itself. How strong it is, relative to the parent, is stated on the label as somewhere between one fifth and equal.',
        technicalDetails:
          'Clobazam is extensively metabolised in the liver, with only about 2% of a dose recovered unchanged in urine and 1% in faeces. N-demethylation proceeds primarily via CYP3A4 with lesser contributions from CYP2C19 and CYP2B6, producing N-desmethylclobazam, the major circulating metabolite, at plasma concentrations 3 to 5 times those of the parent at therapeutic doses. The label states that estimates of the relative potency of the metabolite compared with the parent, based on animal and in vitro receptor binding data, range from one fifth to equal potency. N-desmethylclobazam is itself cleared mainly by the polymorphic CYP2C19, and it plus its metabolites make up about 94% of drug-related material in urine. Combining a three to five-fold concentration advantage with a five-fold potency uncertainty leaves the share of clinical effect attributable to the parent compound genuinely unresolved.',
        evidenceSource:
          'Clobazam United States prescribing information, Clinical Pharmacology 12.3 (openFDA drug label endpoint)',
        measuredMetric:
          'Metabolite-to-parent plasma concentration ratio of 3 to 5, and a stated relative potency range of one fifth to equal',
        auditFlag: 'verified',
      },
      {
        id: 'clb-a5',
        category: 'measured',
        title: 'A common inherited variant raises the active metabolite five-fold',
        laymanSummary:
          'The enzyme that clears the active metabolite is CYP2C19, and some people inherit a version that barely works. In them, the metabolite sits at five times the usual plasma level on the same dose.',
        technicalDetails:
          'The label states that the polymorphic CYP2C19 is the major contributor to the metabolism of the pharmacologically active N-desmethylclobazam, and that in CYP2C19 poor metabolisers, levels of N-desmethylclobazam were 5-fold higher in plasma and 2 to 3-fold higher in urine than in extensive metabolisers. Poor metaboliser status is common enough to matter at population scale, and the same effect is produced pharmacologically by any co-prescribed CYP2C19 inhibitor. Cannabidiol is one such inhibitor, which is directly relevant here because the cannabidiol trials in Lennox-Gastaut syndrome enrolled populations largely already taking clobazam, and how much of the observed benefit in those trials belongs to raised N-desmethylclobazam rather than to cannabidiol itself has not been settled.',
        evidenceSource:
          'Clobazam United States prescribing information, Clinical Pharmacology 12.3 and 12.5 (openFDA drug label endpoint)',
        measuredMetric:
          'Five-fold higher plasma N-desmethylclobazam in CYP2C19 poor metabolisers than in extensive metabolisers',
        auditFlag: 'verified',
      },
      {
        id: 'clb-a6',
        category: 'conclusion_shift',
        title: 'The boxed warning arrived in 2020 and describes the class, not this trial',
        laymanSummary:
          'Clobazam was approved in 2011 with no boxed warning. It has one now, covering opioid co-prescription, abuse and addiction, and dependence and withdrawal. That warning came from a class-wide benzodiazepine review, not from anything measured in the Lennox-Gastaut trials.',
        technicalDetails:
          'The current boxed warning has three parts: concomitant use with opioids may result in profound sedation, respiratory depression, coma and death, with observational studies showing raised drug-related mortality compared with opioids alone; benzodiazepine use exposes patients to risks of abuse, misuse and addiction that can lead to overdose or death, requiring risk assessment before and throughout treatment; and continued use may lead to clinically significant physical dependence, with abrupt discontinuation or rapid dose reduction precipitating acute withdrawal reactions that can be life-threatening. None of these derives from the two registration trials, which measured drop seizure frequency over 12 and 4 weeks in a population of children and young adults with severe epilepsy. They derive from the class-wide benzodiazepine labelling changes the FDA required across the category. Clobazam entire European history is as a drug positioned as gentler than a classical benzodiazepine because it is a 1,5 rather than a 1,4 isomer; the boxed warning declines to make that distinction.',
        evidenceSource:
          'Clobazam United States prescribing information, boxed warning and Warnings and Precautions 5.1 to 5.3 (openFDA drug label endpoint)',
        inferredClaim:
          'That the 1,5-benzodiazepine structure places clobazam outside the benzodiazepine class risks. Regulators concluded otherwise and applied the class boxed warning to it in full.',
        auditFlag: 'verified',
      },
      {
        id: 'clb-a7',
        category: 'inferred',
        title:
          'The absence of tolerance was measured over three months, not over the years people take it',
        laymanSummary:
          'Benzodiazepines historically lost their anti-seizure effect over months, which is why they were abandoned for long-term epilepsy. The clobazam trial found no such loss, but it only ran for twelve weeks of maintenance.',
        technicalDetails:
          'The label states there was no evidence that tolerance to the therapeutic effect of clobazam developed during the 3-month maintenance period of Study 1. That is a genuine finding and it addresses the specific historical objection to benzodiazepines in epilepsy. It is also bounded exactly by the length of the observation: twelve weeks of maintenance in Study 1 and four weeks in Study 2. Lennox-Gastaut syndrome is a lifelong condition and clobazam is taken for years or decades. The claim that tolerance does not develop is supported for three months and inferred for everything beyond it. The open-label extension that followed the trial is not a controlled comparison and cannot separate maintained efficacy from selective continuation by the patients in whom the drug was still working.',
        evidenceSource:
          'Clobazam United States prescribing information, Clinical Studies 14, Study 1; Ng YT et al., Neurology 2011;77:1473-1481',
        doi: '10.1212/WNL.0b013e318232de76',
        inferredClaim:
          'That clobazam does not lose its anti-seizure effect over the years it is actually taken. The measurement covers twelve weeks.',
        auditFlag: 'caution',
      },
      {
        id: 'clb-a8',
        category: 'measured',
        title:
          'Serious skin reactions, in a population already taking two or three rash-prone drugs',
        laymanSummary:
          'Clobazam can cause Stevens-Johnson syndrome and toxic epidermal necrolysis. The people who take it are usually also on lamotrigine and valproate, which is one of the highest-risk rash combinations there is.',
        technicalDetails:
          'The label directs discontinuation at the first sign of rash unless it is clearly not drug-related, and names Stevens-Johnson syndrome and toxic epidermal necrolysis, with DRESS and multi-organ hypersensitivity in a separate warning. The clinical difficulty is attribution rather than incidence: the label records that the commonest concomitant anti-seizure drugs at baseline in the clobazam trials were valproate, lamotrigine, levetiracetam and topiramate, and lamotrigine carries its own boxed warning for serious rash whose risk is highest in children and when valproate is co-prescribed. In a child on three or four such drugs, a rash has several plausible causes and no test distinguishes them, so the instruction to stop the drug is easy to write and hard to act on.',
        evidenceSource:
          'Clobazam United States prescribing information, Warnings and Precautions 5.6 and 5.7, and Clinical Studies 14 (openFDA drug label endpoint)',
        measuredMetric:
          'Labelled occurrence of SJS, TEN and DRESS, against the recorded baseline concomitant medication profile of the trial population',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed, and converted into something longer-lived',
        laymanDesc:
          'The tablet is absorbed and the liver strips a methyl group off it, producing a breakdown product that lasts much longer and builds up to several times the concentration of the original drug.',
        molecularDetail:
          'Clobazam is extensively metabolised, with about 2% recovered unchanged in urine and 1% in faeces. N-demethylation proceeds primarily via CYP3A4 and to a lesser extent CYP2C19 and CYP2B6 to give N-desmethylclobazam, which at therapeutic doses circulates at 3 to 5 times the parent concentration and is itself cleared mainly by CYP2C19.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Both molecules distribute widely and reach the brain',
        laymanDesc:
          'The drug and its breakdown product are both fat-soluble enough to spread through the body and cross into the brain, where GABA receptors sit.',
        molecularDetail:
          'Apparent volume of distribution at steady state is approximately 100 L. Plasma protein binding is roughly 80 to 90% for clobazam and 70% for N-desmethylclobazam, so a higher free fraction of the metabolite compounds its concentration advantage.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds a site next to the GABA site, not the GABA site itself',
        laymanDesc:
          'It does not open the calming channel. It attaches at a separate spot on the same receptor and makes the brain own GABA work better, so nothing happens where there is no GABA to amplify.',
        molecularDetail:
          'The label states that the exact mechanism of clobazam, a 1,5-benzodiazepine, is not fully understood but is thought to involve potentiation of GABAergic neurotransmission resulting from binding at the benzodiazepine site of the GABA-A receptor, which lies at the interface between alpha and gamma subunits. The 1,5 nitrogen arrangement distinguishes it from every classical 1,4-benzodiazepine.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Each pulse of GABA lets more chloride in',
        laymanDesc:
          'When GABA arrives, the channel opens more readily and more chloride enters the cell, which pushes it further from firing. The effect scales with the brain own calming activity rather than replacing it.',
        molecularDetail:
          'Benzodiazepine-site occupancy increases the frequency of GABA-A channel opening in response to sub-maximal GABA, raising chloride conductance and hyperpolarising the membrane. The same mechanism produces the sedation, the abuse potential and the withdrawal syndrome; nothing in the pharmacology separates the wanted effect from the class risks.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two thirds fewer drop attacks, at the highest dose',
        laymanDesc:
          'Weekly drop seizures fell 68.3% at the highest dose against 12.1% on placebo, and 77.6% of that group halved their seizures against 31.6% on placebo.',
        molecularDetail:
          'Efficacy is established in one placebo-controlled trial of 238 patients with a 12-week maintenance phase and one high-versus-low-dose trial of 68 patients with a 4-week maintenance phase, both in Lennox-Gastaut syndrome. No tolerance to the therapeutic effect was observed over the 3-month maintenance period, which is the length of the observation rather than the length of treatment.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Clobazam Lennox-Gastaut Study 1 (Ng 2011, label Clinical Studies 14)',
        phase: 'Phase 3 multicentre randomised double-blind placebo-controlled fixed-dose trial',
        sampleSize: 238,
        primaryEndpoint:
          'Percentage decrease in mean weekly drop seizure rate from a 4-week baseline to a 12-week maintenance phase',
        endpointMet: true,
        statisticalPValue:
          'Decrease of 41.2% (P=0.0120), 49.4% (P=0.0015) and 68.3% (P<0.0001) at 0.25, 0.5 and 1.0 mg/kg/day against 12.1% on placebo',
        unreportedAdverseSignals:
          'The responder rate at the lowest dose did not separate from placebo (43.4% against 31.6%, P=0.3383), and the placebo responder rate was itself 31.6%. Of patients enrolled after a mid-trial protocol amendment, 125 of 157 (79.6%) completed.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Clobazam Lennox-Gastaut Study 2 (label Clinical Studies 14)',
        phase: 'Randomised double-blind high-dose versus low-dose comparison, 4-week maintenance',
        sampleSize: 68,
        primaryEndpoint:
          'Percentage reduction in weekly drop seizure frequency from a 4-week baseline to a 4-week maintenance phase',
        endpointMet: true,
        statisticalPValue: 'Median reduction 93% on high dose against 29% on low dose, P<0.05',
        unreportedAdverseSignals:
          'There is no placebo arm. The trial establishes dose-response, not efficacy against no additional treatment, and its maintenance phase is a third the length of Study 1.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Weekly drop seizure rate down 68.3% at 1.0 mg/kg/day against 12.1% on placebo in 238 patients (P<0.0001)',
        'Responder rates of 43.4%, 58.6% and 77.6% by dose against 31.6% on placebo, with the lowest dose not significant (P=0.3383)',
        'Median drop seizure reduction of 93% on high dose against 29% on low dose in a 68-patient dose-comparison trial',
        'N-desmethylclobazam plasma concentrations 3 to 5 times the parent at therapeutic doses, with relative potency stated as one fifth to equal',
        'Five-fold higher plasma N-desmethylclobazam in CYP2C19 poor metabolisers than in extensive metabolisers',
        'No evidence of tolerance to the therapeutic effect during the 12-week maintenance phase',
      ],
      unsupportedInferences: [
        'That every effective dose helps patients: at the lowest dose the responder rate did not separate from placebo',
        'That tolerance does not develop over years of treatment, when the observation covers twelve weeks',
        'That the 1,5-benzodiazepine structure exempts clobazam from benzodiazepine class risks, a position the boxed warning does not accept',
        'That the clinical effect belongs to clobazam rather than to N-desmethylclobazam, when the metabolite is present at 3 to 5 times the concentration and its relative potency is uncertain five-fold',
      ],
      whatFailedInitially: [
        'Benzodiazepines were largely abandoned for long-term epilepsy on tolerance grounds, which is the objection the clobazam programme was designed to answer and answered only for three months',
        'The drug was available in Europe from the 1970s and took until 2011 to reach the United States market, arriving with an orphan indication far narrower than its European use',
        'Only one of the two registration trials has a placebo arm; the other compares two doses of the same drug',
      ],
      realWorldOutcome: [
        'One of the few drugs with a specific Lennox-Gastaut indication, in a syndrome where no drug controls the condition and combinations of three or four are normal',
        'About 39 US cents per unit at United States pharmacy acquisition cost, a median across 32 listed generic products',
        'It sits inside an unresolved question about cannabidiol: the pivotal cannabidiol trials in this syndrome enrolled patients largely on clobazam, and cannabidiol raises the active clobazam metabolite by inhibiting CYP2C19',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral suspension and orally dissolving film',
      description:
        'The orally dissolving film Sympazan exists for a specific reason in this population: many people with Lennox-Gastaut syndrome have swallowing difficulty or refuse tablets, and a film that dissolves on the tongue is harder to spit out than a suspension. It is a separate FDA application rather than a reformulation. There is no intravenous clobazam.',
      safetyProfile:
        'A three-part boxed warning: profound sedation, respiratory depression, coma and death with concomitant opioids; abuse, misuse and addiction leading to overdose or death; and physical dependence with potentially life-threatening acute withdrawal on abrupt discontinuation or rapid dose reduction. It is a Schedule IV controlled substance. Somnolence and sedation are the commonest adverse effects, with pyrexia, upper respiratory infection and lethargy also frequent in the trials. Stevens-Johnson syndrome, toxic epidermal necrolysis, DRESS and multi-organ hypersensitivity are labelled. Use in pregnancy can cause neonatal sedation and neonatal withdrawal syndrome. The class-wide suicidality warning applies. Exposure to the active metabolite is five-fold higher in CYP2C19 poor metabolisers.',
    },
    commonQuestions: [
      {
        q: 'Is clobazam different from other benzodiazepines?',
        a: 'Chemically, yes. Clobazam is a 1,5-benzodiazepine: its two ring nitrogens sit at positions 1 and 5 rather than 1 and 4 as in diazepam, lorazepam and clonazepam. That difference is the basis of its long European reputation for causing less sedation, and it is why the drug was developed for epilepsy at all. Regulators have not accepted that it changes the class risks. The current United States boxed warning applies the full benzodiazepine warning to clobazam without qualification: opioid co-prescription, abuse and addiction, and physical dependence with life-threatening withdrawal on abrupt discontinuation. Somnolence and lethargy were among the commonest adverse events in its own registration trial.',
        auditNote:
          'A real structural difference and an exemption from class risk are separate claims. The label grants the first and refuses the second.',
      },
      {
        q: 'How well does it work for drop attacks?',
        a: 'In the placebo-controlled trial of 238 patients, average weekly drop seizure rates fell by 41.2%, 49.4% and 68.3% at the three doses against 12.1% on placebo, all significant. The proportion of patients who halved their drop seizures was 43.4%, 58.6% and 77.6% against 31.6% on placebo, and at the lowest dose that difference was not statistically significant (p=0.3383). Two things are worth holding together: the highest dose produced one of the largest effects in this syndrome, and nearly a third of the placebo group also halved their seizures, which is why a placebo arm was necessary.',
      },
      {
        q: 'Will it stop working over time, the way benzodiazepines are supposed to?',
        a: 'The trial looked for that and did not find it. The label states there was no evidence that tolerance to the therapeutic effect developed during the 3-month maintenance period of Study 1. That is the specific historical objection to benzodiazepines in epilepsy, and it is the question the trial was designed to answer. The limit is the length of the observation: twelve weeks of maintenance in Study 1 and four in Study 2, in a lifelong condition where the drug is taken for years. What happens after month three has not been measured in a controlled comparison.',
        auditNote:
          'A negative finding is bounded by how long you looked. Here that boundary is twelve weeks.',
      },
      {
        q: 'Why does the dose vary so much between people?',
        a: 'Because most of the effect comes from a metabolite whose clearance depends on an enzyme people carry in different versions. Clobazam is demethylated to N-desmethylclobazam, which circulates at three to five times the parent concentration at therapeutic doses and is cleared mainly by CYP2C19. The label states that in CYP2C19 poor metabolisers, N-desmethylclobazam levels are five-fold higher in plasma than in extensive metabolisers. Any drug that inhibits CYP2C19 does the same thing pharmacologically. The label also puts the potency of the metabolite relative to the parent anywhere between one fifth and equal, so the amount of active drug a given dose produces varies more than the dose itself suggests.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for clobazam could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 39 US cents per unit as a median across 32 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ng YT et al. Randomized, phase III study results of clobazam in Lennox-Gastaut syndrome. Neurology 2011;77:1473-1481',
        identifier: '10.1212/WNL.0b013e318232de76',
        kind: 'doi',
      },
      {
        label:
          'Clobazam United States prescribing information: boxed warning, Warnings and Precautions 5.1 to 5.9, Clinical Studies 14, Clinical Pharmacology 12.3 and 12.5, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22CLOBAZAM%22',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: ONFI (clobazam) tablets and oral suspension, NDA 202067, original approval 21 October 2011',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202067',
        kind: 'regulatory',
      },
      KETOGENIC_DIET_SOURCE,
      {
        label: 'PubChem CID 2789 — clobazam structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2789',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 11. Brivaracetam — twenty times the affinity of levetiracetam, and none of it adds up on top of it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'brivaracetam',
    name: 'Brivaracetam',
    tradeName: 'Briviact',
    sponsor:
      'UCB Inc. (originator, and also the originator of levetiracetam); now with generic tablet and oral solution products listed',
    targetGene: 'SV2A',
    targetProtein:
      'Synaptic vesicle glycoprotein 2A, bound with high and selective affinity. The label states the precise mechanism by which brivaracetam exerts its anticonvulsant activity is not known and that SV2A binding may contribute to it.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2016,
    indication: 'Treatment of partial-onset seizures in patients 1 month of age and older',
    patientFriendlyIndication: 'Focal (partial-onset) epilepsy',
    anatomicalSite:
      'Presynaptic nerve terminal, at the synaptic vesicle membrane in cortex and hippocampus',
    conditionContext: {
      conditionExplainer:
        'Nerve endings release their chemical messengers from small vesicles, and SV2A is a protein in the vesicle wall. Damping release from rapidly firing terminals is the shared proposition behind both drugs UCB has built on this target.',
      whyItMatters:
        'Brivaracetam is the cleanest natural experiment in this whole class: the same company, the same target, roughly twenty times the binding affinity, and a decade of extra development. Whether higher affinity at a validated target produces a better drug is a question the field usually answers by assumption. Here it was tested.',
      whoTakesThis:
        'People with focal epilepsy from one month of age, often those who could not tolerate levetiracetam behavioural effects. It has an intravenous form and essentially no interaction burden.',
      clinicalGoals:
        'The seizure control of levetiracetam without its irritability and aggression, at a dose that can be given from day one without titration.',
    },
    oneSentenceVerdict:
      'A levetiracetam successor with roughly twenty-fold higher SV2A affinity, which reduced 28-day seizure frequency by 25.2% over placebo at 100 mg/day in its largest trial but failed to separate from placebo at either dose in its first pivotal study, and whose label records the finding that most directly tests its own premise: added to levetiracetam, it provided no added benefit.',
    laymanHowItWorks:
      'Nerve endings store their chemical messengers in tiny bubbles and release them when the cell fires. Brivaracetam gets inside those bubbles and binds a protein in their wall called SV2A, the same protein levetiracetam binds, but it holds on roughly twenty times more tightly and enters brain tissue faster. When firing becomes rapid and repetitive, as in a seizure, less messenger is released, so the burst is less able to build and spread.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 67,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2634 per unit, the median across 35 listed brivaracetam products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Developed at UCB from the same aminobutyramide series that produced levetiracetam, and approved in the United States in February 2016 as Briviact under NDA 205836 (tablets), 205837 (oral solution) and 205838 (injection). It is a Schedule V controlled substance. Generic tablet and oral solution products are now listed in the CMS file, which is why the per-unit acquisition cost sits close to the older drugs rather than at branded levels.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Brivaracetam exists because of levetiracetam behavioural side effects, so the comparison that matters is with levetiracetam, and it has never been made in a randomised trial. What the label does record is that adding brivaracetam on top of levetiracetam produced no added benefit, which is the strongest available statement about the relationship between the two.',
      conventionalRx: [
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand, same target, same originator',
          howItCompares:
            'No randomised head-to-head trial exists. The label states that in Studies 1 and 2, where about 20% of patients were on concomitant levetiracetam, brivaracetam provided no added benefit when added to it. In Study 3 patients on concomitant levetiracetam were excluded, though about 54% had prior exposure. Levetiracetam own registration trial gave responder rates of 33.0% and 39.8% against 10.8% on placebo.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheaper, not a controlled substance, and with a far larger evidence base including status epilepticus. Cons: non-psychotic behavioural symptoms in 13% of adults and 38% of children in its registration trials, which is the entire reason brivaracetam was developed.',
        },
        {
          name: 'Lacosamide (Vimpat)',
          class: 'Slow-inactivation sodium channel modulator, also from UCB',
          howItCompares:
            'The other modern UCB anti-seizure drug, also Schedule V, also with an intravenous form and minimal interactions, and unlike brivaracetam it has a positive head-to-head trial: non-inferiority to controlled-release carbamazepine in 888 newly diagnosed adults. No trial compares it with brivaracetam.',
          typicalCost:
            'US$0.1676 per unit, median across 94 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: an active-comparator trial behind it, and no behavioural signal. Cons: PR interval prolongation with post-marketing arrhythmia reports, and dizziness and ataxia.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'The drug that won SANAD on treatment failure and the per-protocol analysis of SANAD II. Brivaracetam has never been tested against it or against any active comparator; its entire efficacy record is against placebo in refractory add-on populations.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the best-tolerated drug in the largest first-line focal epilepsy trials, and not a controlled substance. Cons: slow introduction because of serious rash, with a boxed warning, so it cannot be started at a full dose the way brivaracetam can.',
        },
        {
          name: 'Perampanel (Fycompa)',
          class: 'Non-competitive AMPA receptor antagonist',
          howItCompares:
            'The other modern adjunctive option for refractory focal epilepsy with a genuinely novel target. Its trials measured the same kind of endpoint over the same 12-week period. No head-to-head comparison exists between any of these drugs.',
          typicalCost:
            'US$17.50 per unit, median across 34 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: a mechanism unrelated to anything else in the class. Cons: a boxed warning for serious psychiatric and behavioural reactions, and a per-unit cost roughly seventy times higher.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream changes in GABA synthesis and adenosine signalling. The mechanism does not overlap with SV2A binding.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask someone close to you to watch for mood change',
          action:
            'Ask a partner, parent or housemate to say something if they notice new irritability, aggression, anxiety or withdrawal after starting or increasing this drug.',
          patientImpact:
            'Psychiatric adverse reactions were reported in about 13% of patients on at least 50 mg/day of brivaracetam in the Phase 3 trials against 8% on placebo, and the labelled list includes psychotic symptoms, irritability, depression, aggressive behaviour and anxiety.',
          clinicalPrecaution:
            'These are drug effects with a measured placebo-controlled rate, not a character change. Brivaracetam is often reached for because of exactly this problem on levetiracetam, so the rate here is the number that matters.',
        },
        {
          name: 'Expect the first two weeks to be the worst for drowsiness',
          action:
            'Plan the first fortnight so that driving and machinery are avoidable, and report drowsiness rather than pushing through it.',
          patientImpact:
            'Somnolence and fatigue-related reactions occurred in 25% of patients on at least 50 mg/day against 14% on placebo, rising with dose, and dizziness and gait disturbance in 16% against 10%. The label states the risk is greatest early in treatment but can occur at any time.',
          clinicalPrecaution:
            'Because brivaracetam is started at a therapeutic dose with no titration, the full effect arrives on day one rather than building over weeks.',
        },
        {
          name: 'Do not stop it abruptly',
          action:
            'If the drug comes off, that happens by a planned taper agreed with the prescriber.',
          patientImpact:
            'The label instructs gradual withdrawal to minimise the risk of increased seizure frequency and status epilepticus, and specifies that trial patients were down-titrated over one, two or four weeks depending on the dose they were taking.',
          clinicalPrecaution:
            'This page gives no schedule. The point is that the taper length in the trials scaled with the dose, which is why stopping is not a single instruction.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCC[C@@H]1CC(=O)N(C1)[C@@H](CC)C(=O)N',
      chemicalFormula: 'C11H20N2O2',
      molecularWeight: '212.29 g/mol',
      targetReceptorAffinity:
        'Brivaracetam is described on the label as having high and selective affinity for SV2A, and the published preclinical comparison puts it roughly twenty-fold above levetiracetam. What no published work provides is a demonstration that the difference in affinity produces a proportionate difference in clinical effect.',
      structureSource: {
        label: 'PubChem CID 9837243 — brivaracetam structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9837243',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'brv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Diastereomeric and enantiomeric purity of both chiral centres',
          description:
            'Confirm the configuration at both stereocentres before release. Brivaracetam has two, where levetiracetam has one, and only the (2S,4R) arrangement carries the activity. Four stereoisomers share this molecular formula, so a purity test that measures only chemical identity would pass three wrong compounds.',
          reagentsAndBuffer:
            'Authentic (2S,4R) reference standard plus the three other stereoisomers as system-suitability markers, chiral HPLC on a polysaccharide stationary phase, polarimetry, Karl Fischer titration',
        },
        {
          id: 'brv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Propyl-substituted pyrrolidinone ring and acetamide side chain',
          description:
            'Build the 4-propyl-2-oxopyrrolidine ring and attach the butanamide side chain at the ring nitrogen. The propyl group is the only structural difference from levetiracetam, and it is what raises SV2A affinity roughly twenty-fold and speeds entry into brain tissue.',
          dependsOnStepId: 'brv-w1',
          reagentsAndBuffer:
            'Chiral pool or asymmetric catalysis route to the 4-propyl lactam, coupling to the (S)-2-aminobutyramide fragment, aprotic solvent, base, temperature control to prevent epimerisation at either centre',
        },
        {
          id: 'brv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with a stereoisomer specification',
          description:
            'Recrystallise and assay against all three unwanted stereoisomers rather than against a single enantiomer. Two chiral centres mean the specification is a four-way separation, and diastereomers can co-crystallise, so the analytical method has to be validated to resolve each one from the product.',
          dependsOnStepId: 'brv-w2',
          reagentsAndBuffer:
            'Ethyl acetate or isopropanol with heptane for recrystallisation, chiral HPLC with hexane and ethanol mobile phase, UV detection at 205 nm, differential scanning calorimetry',
        },
        {
          id: 'brv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Vesicle-cycling uptake in cultured hippocampal neurons, timed',
          description:
            'Stimulate cultured neurons so vesicles cycle, and measure how quickly the compound reaches its target compared with levetiracetam under identical conditions. The SV2A epitope faces the vesicle lumen, so access requires exocytosis and re-internalisation; the claim that brivaracetam acts faster is a claim about this step and has to be measured here rather than inferred from lipophilicity.',
          dependsOnStepId: 'brv-w3',
          reagentsAndBuffer:
            'Primary rat hippocampal cultures on poly-L-lysine, Neurobasal medium with B27, field stimulation at 10 Hz, FM4-64 styryl dye for vesicle cycling, matched levetiracetam comparator arm, Tyrode buffer',
        },
        {
          id: 'brv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Competition binding against levetiracetam at SV2A, plus an occupancy ceiling test',
          description:
            'Measure displacement of a tritiated SV2A ligand by brivaracetam and by levetiracetam on the same membranes, then run the two together. The combination arm is the informative one, because the label clinical finding is that brivaracetam added no benefit on top of levetiracetam, and the simplest explanation is that the target was already occupied. Testing them singly would reproduce the affinity claim without testing the claim that matters.',
          dependsOnStepId: 'brv-w4',
          reagentsAndBuffer:
            'Rat cortical membrane preparation, tritiated ucb 30889 as SV2A radioligand, unlabelled brivaracetam and levetiracetam alone and in combination, SV2A-knockout mouse brain as negative control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'brv-a1',
        category: 'failed',
        title: 'The first pivotal trial failed at both doses',
        laymanSummary:
          'Study 1 compared 50 and 100 mg a day against placebo in 299 patients. Seizure frequency fell 9.5% and 17.0% more than on placebo, and neither figure reached statistical significance.',
        technicalDetails:
          'The label reports the primary efficacy outcome of all three pivotal studies in a single table, with an asterisk marking statistical significance at alpha 0.05. In Study 1, percent reduction in 7-day partial-onset seizure frequency over placebo was 9.5% at 50 mg/day (n=99) and 17.0% at 100 mg/day (n=100) against placebo (n=100), and neither carries the significance marker. Study 2 tested 50 mg/day alone and reached 16.9% over placebo, marked significant. Study 3 tested 100 and 200 mg/day in a much larger sample and reached 25.2% (n=252) and 25.7% (n=249) over placebo (n=259), both significant. Two of the three studies therefore succeeded, and the dose that failed in Study 1 succeeded in Study 2 at almost the same effect size, which is what an underpowered negative result looks like. The label presents all three without commentary on the discrepancy.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Clinical Studies 14, Table 6 (openFDA drug label endpoint)',
        measuredMetric:
          'Percent reduction in partial-onset seizure frequency over placebo, by study and dose, with significance markers',
        auditFlag: 'caution',
      },
      {
        id: 'brv-a2',
        category: 'failed',
        title: 'Added to levetiracetam, it provided no added benefit',
        laymanSummary:
          'About one in five patients in the first two trials were already taking levetiracetam, which binds the same protein. In those patients, adding brivaracetam did nothing extra, and the label says so.',
        technicalDetails:
          'The label states that in Studies 1 and 2, which evaluated brivaracetam 50 and 100 mg daily, approximately 20% of patients were on concomitant levetiracetam, and that although the numbers of patients were limited, brivaracetam provided no added benefit when it was added to levetiracetam. Study 3, the largest and the only one that produced effect sizes above 25% over placebo, excluded patients on concomitant levetiracetam entirely, though approximately 54% had prior exposure. This is the most direct available test of the premise that a twenty-fold higher affinity at SV2A yields a clinically distinguishable drug: if the higher-affinity ligand cannot displace the lower-affinity one to therapeutic effect at achievable concentrations, the affinity difference does not translate. The label reports the observation and draws no conclusion from it, and no dedicated trial has since been run to settle it.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Clinical Studies 14, Treatment with Levetiracetam (openFDA drug label endpoint)',
        measuredMetric:
          'Efficacy of added brivaracetam in the subgroup already taking concomitant levetiracetam',
        inferredClaim:
          'That higher affinity at a validated target produces a stronger or additive clinical effect. In the one population where the two ligands met, it produced nothing measurable.',
        auditFlag: 'caution',
      },
      {
        id: 'brv-a3',
        category: 'measured',
        title: 'Doubling the dose from 100 to 200 mg added nothing',
        laymanSummary:
          'In the largest trial, 100 mg a day reduced seizures 25.2% more than placebo and 200 mg a day reduced them 25.7% more. Twice the drug produced half a percentage point of extra benefit.',
        technicalDetails:
          'Study 3 randomised 760 patients across placebo (n=259), 100 mg/day (n=252) and 200 mg/day (n=249), with percent reduction in 28-day partial-onset seizure frequency over placebo as the primary outcome. The results were 25.2% and 25.7%, both statistically significant and separated by 0.5 percentage points. A flat dose-response at the top of the range is informative in two directions: it argues the target is close to saturated at 100 mg, which is consistent with the levetiracetam add-on finding, and it means the higher dose carries the additional somnolence, fatigue and psychiatric burden without a matching gain. Somnolence and fatigue-related reactions ran at 20% at 50 mg/day, 26% at 100 mg/day and 27% at 200 mg/day against 14% on placebo.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Clinical Studies 14, Table 6 and Warnings and Precautions 5.2 (openFDA drug label endpoint)',
        measuredMetric:
          'Percent reduction over placebo at 100 mg/day against 200 mg/day, alongside dose-related adverse reaction rates',
        auditFlag: 'verified',
      },
      {
        id: 'brv-a4',
        category: 'measured',
        title: 'The behavioural problem it was built to solve is on its own label at 13%',
        laymanSummary:
          'Brivaracetam is usually reached for when levetiracetam causes irritability or aggression. Psychiatric reactions occurred in about 13% of brivaracetam patients in the trials against 8% on placebo, and the labelled list includes psychosis, irritability, depression, aggression and anxiety.',
        technicalDetails:
          'Warnings and Precautions 5.3 states that brivaracetam causes psychiatric adverse reactions, reported in approximately 13% of patients receiving at least 50 mg/day in the Phase 3 controlled adjunctive trials against 8% on placebo, and names psychotic symptoms, irritability, depression, aggressive behaviour and anxiety. For comparison, the levetiracetam label reports non-psychotic behavioural symptoms in 13% of adults against 6% on placebo and 38% of paediatric patients against 19%. The two numbers are not directly comparable, because the definitions, populations and trial designs differ and no head-to-head trial exists. What can be said is that the drug developed to escape a behavioural problem carries a placebo-controlled behavioural signal of its own, and the label does not claim otherwise.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Warnings and Precautions 5.3; levetiracetam United States prescribing information, Warnings and Precautions 5.1 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of psychiatric adverse reactions on brivaracetam at least 50 mg/day against placebo',
        inferredClaim:
          'That brivaracetam avoids levetiracetam behavioural effects. No randomised comparison has tested it, and brivaracetam has its own placebo-controlled rate.',
        auditFlag: 'caution',
      },
      {
        id: 'brv-a5',
        category: 'measured',
        title: 'Dose-dependent somnolence, and unsteadiness in one patient in six',
        laymanSummary:
          'A quarter of patients on brivaracetam reported drowsiness or fatigue against 14% on placebo, and 16% reported dizziness or problems with balance and walking against 10%.',
        technicalDetails:
          'Warnings and Precautions 5.2 states that brivaracetam causes dose-dependent increases in somnolence and fatigue-related adverse reactions, grouping fatigue, asthenia, malaise, hypersomnia, sedation and lethargy. These occurred in 25% of patients on at least 50 mg/day, specifically 20% at 50 mg/day, 26% at 100 mg/day and 27% at 200 mg/day, against 14% on placebo. Dizziness and disturbance in gait and coordination, grouping dizziness, vertigo, balance disorder, ataxia, nystagmus, gait disturbance and abnormal coordination, occurred in 16% of those on at least 50 mg/day against 10% on placebo. The label notes the risk is greatest early in treatment but can occur at any time, which matters more here than for most drugs because brivaracetam is started at a therapeutic dose with no titration period at all.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Warnings and Precautions 5.2 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of somnolence and fatigue-related reactions by dose, and of dizziness and gait disturbance, against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'brv-a6',
        category: 'measured',
        title: 'Schedule V, on the same kind of supratherapeutic euphoria study as lacosamide',
        laymanSummary:
          'At recommended doses brivaracetam caused less sedation and euphoria than a benzodiazepine. At four to twenty times the recommended single dose it looked similar on other abuse measures, which is why it is scheduled.',
        technicalDetails:
          'In a human abuse potential study, single doses of brivaracetam at therapeutic and supratherapeutic levels were compared with alprazolam 1.5 mg and 3 mg. At the recommended single dose of 50 mg, brivaracetam caused fewer sedative and euphoric effects than alprazolam. At supratherapeutic single doses of 200 mg and 1,000 mg it was similar to alprazolam on other measures of abuse. Brivaracetam is a Schedule V controlled substance in the United States, the same schedule as lacosamide and reached by the same kind of study. Scheduling adds real prescribing friction that has no counterpart in the levetiracetam it is meant to replace, which is not a controlled substance at all.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Drug Abuse and Dependence 9.1 and 9.2 (openFDA drug label endpoint)',
        measuredMetric:
          'Sedative and euphoric effects at therapeutic and supratherapeutic single doses against alprazolam',
        auditFlag: 'verified',
      },
      {
        id: 'brv-a7',
        category: 'inferred',
        title:
          'Efficacy has only ever been measured against placebo, in a 23-year refractory population',
        laymanSummary:
          'All three registration trials added brivaracetam or a dummy to the treatment of people who had already had epilepsy for about 23 years and had failed one or two other drugs. There is no trial comparing it with any other drug, and none in newly diagnosed patients.',
        technicalDetails:
          'The three fixed-dose randomised double-blind placebo-controlled studies included 1,550 patients whose partial-onset seizures were not adequately controlled on 1 to 2 concomitant anti-seizure drugs, with 72% to 86% taking two or more concomitant drugs with or without vagal nerve stimulation, a median baseline of 9 seizures per 28 days and a mean epilepsy duration of approximately 23 years. All had an 8-week baseline and a 12-week treatment period with no titration. That design supports one claim: brivaracetam does more than nothing when added to failing treatment in long-standing refractory focal epilepsy. It supports no claim about monotherapy, about newly diagnosed epilepsy, or about how brivaracetam compares with any alternative. Its sibling lacosamide, from the same company, did run an active-comparator monotherapy trial; brivaracetam has not.',
        evidenceSource:
          'Brivaracetam United States prescribing information, Clinical Studies 14 (openFDA drug label endpoint)',
        inferredClaim:
          'That brivaracetam is interchangeable with, or preferable to, levetiracetam or any other anti-seizure drug. Every efficacy number it has is against placebo in refractory add-on use.',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed or infused, started at a full dose on day one',
        laymanDesc:
          'Absorption is rapid and complete, and unlike most anti-seizure drugs there is no build-up period. The starting dose is a therapeutic dose, which is convenient and also means side effects arrive immediately.',
        molecularDetail:
          'Oral bioavailability approaches complete absorption and the registration trials used no titration period at all. Metabolism proceeds mainly by hydrolysis of the amide group and by CYP2C19-mediated hydroxylation, with no meaningful induction or inhibition of other enzymes, so the interaction burden is minimal. The intravenous form allows the same dose without conversion.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters brain tissue faster than its predecessor',
        laymanDesc:
          'The added propyl group makes the molecule more fat-soluble, so it crosses into the brain more quickly and reaches nerve endings sooner after a dose.',
        molecularDetail:
          'Higher lipophilicity than levetiracetam produces faster brain penetration. The relevant compartment is the presynaptic terminal, where SV2A sits in the synaptic vesicle membrane at roughly the same copy number as synaptophysin.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds SV2A from inside the vesicle, about twenty times more tightly',
        laymanDesc:
          'The target sits on the inner face of the storage bubble, so the drug reaches it only when a bubble opens to release its contents and reseals. Brivaracetam holds that target far more tightly than levetiracetam does.',
        molecularDetail:
          'The label describes high and selective affinity for SV2A and states that the precise mechanism of anticonvulsant activity is not known. The binding site is luminal, requiring vesicle exocytosis and endocytosis for access, which makes target engagement use-dependent. The label separately records that adding brivaracetam to levetiracetam produced no added benefit, which is the clinical shadow of two ligands competing for one site.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Release runs down during rapid firing',
        laymanDesc:
          'A nerve ending firing slowly is barely affected. One firing in a fast burst releases progressively less messenger, so the burst does not build or spread.',
        molecularDetail:
          'SV2A engagement reduces vesicle release probability during sustained high-frequency trains with little effect on single evoked responses. The step SV2A actually controls, whether priming, calcium-dependent fusion or something else, remains contested, and the label declines to specify it.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'About a quarter more seizure reduction than placebo, with a flat top end',
        laymanDesc:
          'In the largest trial, 100 mg a day cut seizures 25.2% more than placebo and 200 mg a day cut them 25.7% more. In the first trial neither 50 nor 100 mg separated from placebo at all.',
        molecularDetail:
          'Efficacy is established across three fixed-dose placebo-controlled trials in 1,550 patients with refractory focal epilepsy, two of which met significance. The dose-response is flat between 100 and 200 mg/day, and no benefit was observed when brivaracetam was added to levetiracetam. No active-comparator or monotherapy trial exists.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Brivaracetam adjunctive Study 1 (label Clinical Studies 14, Table 6)',
        phase: 'Phase 3 fixed-dose randomised double-blind placebo-controlled trial, 12 weeks',
        sampleSize: 299,
        primaryEndpoint:
          'Percent reduction in 7-day partial-onset seizure frequency over placebo, at 50 mg/day and 100 mg/day',
        endpointMet: false,
        statisticalPValue:
          '9.5% at 50 mg/day and 17.0% at 100 mg/day over placebo; neither carries the significance marker the label applies at alpha 0.05',
        unreportedAdverseSignals:
          'Approximately 20% of patients in this study were on concomitant levetiracetam, and the label states brivaracetam provided no added benefit when added to it.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Brivaracetam adjunctive Study 2 (label Clinical Studies 14, Table 6)',
        phase: 'Phase 3 fixed-dose randomised double-blind placebo-controlled trial, 12 weeks',
        sampleSize: 197,
        primaryEndpoint:
          'Percent reduction in 7-day partial-onset seizure frequency over placebo, at 50 mg/day',
        endpointMet: true,
        statisticalPValue: '16.9% reduction over placebo, statistically significant at alpha 0.05',
        unreportedAdverseSignals:
          'The same 50 mg/day dose produced 9.5% over placebo and missed significance in Study 1, so the two results sit either side of the threshold at similar effect sizes.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Brivaracetam adjunctive Study 3 (label Clinical Studies 14, Table 6)',
        phase: 'Phase 3 fixed-dose randomised double-blind placebo-controlled trial, 12 weeks',
        sampleSize: 760,
        primaryEndpoint:
          'Percent reduction in 28-day partial-onset seizure frequency over placebo, at 100 mg/day and 200 mg/day',
        endpointMet: true,
        statisticalPValue:
          '25.2% at 100 mg/day and 25.7% at 200 mg/day over placebo, both statistically significant at alpha 0.05',
        unreportedAdverseSignals:
          'Patients on concomitant levetiracetam were excluded from this study, the only one of the three to exceed 25% reduction over placebo, though about 54% had prior levetiracetam exposure.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Percent reduction in seizure frequency over placebo of 25.2% at 100 mg/day and 25.7% at 200 mg/day in 760 patients, both significant',
        'Percent reduction over placebo of 9.5% at 50 mg/day and 17.0% at 100 mg/day in Study 1, neither significant',
        'No added benefit when brivaracetam was added to concomitant levetiracetam, in roughly 20% of the patients in Studies 1 and 2',
        'Psychiatric adverse reactions in about 13% of patients on at least 50 mg/day against 8% on placebo',
        'Somnolence and fatigue-related reactions in 25% against 14% on placebo, rising from 20% to 27% across the dose range',
        'Fewer sedative and euphoric effects than alprazolam at 50 mg, and similar effects on other abuse measures at 200 and 1,000 mg',
      ],
      unsupportedInferences: [
        'That twenty-fold higher SV2A affinity produces a clinically stronger drug, when the one head-to-head circumstance available showed no added benefit on top of levetiracetam',
        'That brivaracetam avoids levetiracetam behavioural effects, when no randomised comparison exists and brivaracetam carries its own 13% against 8% placebo-controlled rate',
        'That it is interchangeable with or preferable to any other anti-seizure drug, when every efficacy number it holds is against placebo in refractory add-on use',
        'That 200 mg/day is a stronger dose worth reaching for, when it beat 100 mg/day by 0.5 percentage points while adding somnolence',
      ],
      whatFailedInitially: [
        'Study 1, the first pivotal trial, missed significance at both doses tested',
        'The add-on-to-levetiracetam subgroup showed no benefit, which is the closest thing the programme contains to a direct test of its own premise',
        'The dose-response curve is flat between 100 and 200 mg/day, so the top of the range buys side effects rather than seizure control',
      ],
      realWorldOutcome: [
        'Used largely as an escape route from levetiracetam behavioural effects, a use its trials were not designed to test',
        'About 26 US cents per unit at United States pharmacy acquisition cost, a median across 35 listed generic products, roughly twice levetiracetam',
        'A Schedule V controlled substance, unlike the drug it is meant to replace, which adds prescribing friction with no counterpart in levetiracetam',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, oral solution and intravenous injection',
      description:
        'The absence of a titration period is the distinctive practical feature: the starting dose is a therapeutic dose, so the drug can be brought in during a hospital admission and works from the first day. The intravenous form allows the same dose without conversion, which is why brivaracetam appears in acute settings despite having no status epilepticus indication.',
      safetyProfile:
        'No boxed warning. Somnolence and fatigue-related reactions occur in 25% of patients on at least 50 mg/day against 14% on placebo, rising with dose; dizziness and gait disturbance in 16% against 10%; psychiatric reactions including psychotic symptoms, irritability, depression, aggression and anxiety in about 13% against 8%. Hypersensitivity with bronchospasm and angioedema requires permanent discontinuation. Serious dermatologic reactions are labelled. Withdrawal must be gradual. It is a Schedule V controlled substance. The class-wide suicidality warning applies: 0.43% against 0.24% across 199 pooled placebo-controlled trials of 11 anti-seizure drugs, adjusted relative risk 1.8 (95% CI 1.2 to 2.7).',
    },
    commonQuestions: [
      {
        q: 'Is brivaracetam better than levetiracetam?',
        a: 'No trial has asked. There is no randomised head-to-head comparison between them, and brivaracetam entire efficacy record is against placebo in patients with roughly 23 years of refractory focal epilepsy. What the label does contain is the closest thing to an answer that exists: in Studies 1 and 2, about 20% of patients were already taking levetiracetam, and the label states that brivaracetam provided no added benefit when added to it. The largest and most successful study, Study 3, excluded patients on concomitant levetiracetam altogether. Brivaracetam binds the same protein roughly twenty times more tightly, and in the one situation where the two drugs met, that difference produced nothing measurable.',
        auditNote:
          'This is the single most informative sentence on the label and it appears without comment at the end of the clinical studies section.',
      },
      {
        q: 'Does it avoid the irritability that levetiracetam causes?',
        a: 'It is prescribed on that expectation and the expectation has not been tested in a randomised trial. Brivaracetam own label reports psychiatric adverse reactions in approximately 13% of patients on at least 50 mg/day against 8% on placebo, naming psychotic symptoms, irritability, depression, aggressive behaviour and anxiety. The levetiracetam label reports non-psychotic behavioural symptoms in 13% of adults against 6% on placebo and 38% of children against 19%. Those two numbers come from different trials with different definitions and different populations and cannot be subtracted from one another. What is fair to say is that brivaracetam has a measured, placebo-controlled behavioural signal of its own.',
      },
      {
        q: 'Why did one of its trials fail?',
        a: 'Study 1 tested 50 and 100 mg a day in about 300 patients and produced reductions over placebo of 9.5% and 17.0%, neither statistically significant. Study 2 then tested 50 mg a day alone and produced 16.9%, which was significant. The same dose therefore landed on both sides of the threshold at similar effect sizes, which is the signature of a study that was too small rather than a drug that does not work. Study 3, with 760 patients, produced 25.2% and 25.7% and settled it. The label reports all three in one table with significance markers and offers no commentary, which is why the failed study is easy to miss.',
      },
      {
        q: 'Should I take 200 mg instead of 100 mg?',
        a: 'That is a prescriber decision and this page gives no dosing advice, but the trial numbers are worth knowing. In Study 3, 100 mg a day reduced seizure frequency by 25.2% over placebo and 200 mg a day by 25.7%, a difference of half a percentage point. Over the same dose range, somnolence and fatigue-related reactions rose from 26% to 27% and, across the whole programme, from 20% at 50 mg. A flat efficacy curve with a rising side-effect curve is what a saturated target looks like, and it fits the other finding on this page: that adding brivaracetam on top of levetiracetam added nothing.',
        auditNote:
          'The flat dose-response and the failed levetiracetam add-on point at the same explanation, and neither has been followed up.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for brivaracetam could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 26 US cents per unit as a median across 35 listed generic products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Brivaracetam United States prescribing information: Clinical Studies 14 and Table 6, Warnings and Precautions 5.1 to 5.6, Drug Abuse and Dependence 9.1 and 9.2, Mechanism of Action 12.1, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22BRIVARACETAM%22',
        kind: 'regulatory',
      },
      {
        label:
          'Levetiracetam United States prescribing information, Warnings and Precautions 5.1, used here only for the behavioural adverse reaction rates quoted in comparison',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22LEVETIRACETAM%22',
        kind: 'regulatory',
      },
      {
        label:
          'Lynch BA et al. The synaptic vesicle protein SV2A is the binding site for the antiepileptic drug levetiracetam. Proc Natl Acad Sci USA 2004;101:9861-9866',
        identifier: '10.1073/pnas.0308208101',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: BRIVIACT (brivaracetam) tablets, NDA 205836, original approval 18 February 2016; oral solution NDA 205837; injection NDA 205838',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=205836',
        kind: 'regulatory',
      },
      KETOGENIC_DIET_SOURCE,
      {
        label: 'PubChem CID 9837243 — brivaracetam structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9837243',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 12. Perampanel — a first-in-class target, a boxed warning for aggression, and $17.50 a tablet.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'perampanel',
    name: 'Perampanel',
    tradeName: 'Fycompa',
    sponsor:
      'Eisai (originator); United States rights now held by Catalyst Pharmaceuticals, with generic products listed',
    targetGene: 'GRIA1',
    targetProtein:
      'Ionotropic AMPA glutamate receptor on postsynaptic neurons, blocked non-competitively. The label states that the precise mechanism by which perampanel exerts its antiepileptic effects in humans is unknown.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2012,
    indication:
      'Treatment of partial-onset seizures with or without secondarily generalised seizures in patients 4 years of age and older, and adjunctive therapy for primary generalised tonic-clonic seizures in patients 12 years of age and older',
    patientFriendlyIndication:
      'Focal epilepsy, and added-on treatment for generalised tonic-clonic seizures',
    anatomicalSite:
      'Postsynaptic membrane of cortical neurons, at the AMPA-type glutamate receptor',
    conditionContext: {
      conditionExplainer:
        'Glutamate is the brain main excitatory signal, and the AMPA receptor is the channel that carries most fast excitation between neurons. A seizure is that excitation running away. Blocking the receptor directly is the most obvious idea in epilepsy therapeutics and, for forty years, the one that could not be made tolerable.',
      whyItMatters:
        'Perampanel is the first AMPA receptor antagonist ever licensed for any condition. Earlier competitive AMPA blockers failed in development on sedation and psychiatric effects. That perampanel reached the market with a boxed warning for aggression, hostility and homicidal ideation is the price of the target rather than a flaw in the molecule.',
      whoTakesThis:
        'People with focal epilepsy from age 4 and generalised tonic-clonic seizures from age 12, almost always after several other drugs have failed. It is taken once daily at bedtime.',
      clinicalGoals:
        'Seizure reduction through a mechanism nothing else in the cabinet uses, without the aggression, the falls or the unsteadiness that rise steeply with dose.',
    },
    oneSentenceVerdict:
      'The first licensed AMPA receptor antagonist, which cut generalised tonic-clonic seizures by a median of 76% against 38% on placebo and raised focal-seizure responder rates from 19% to 35%, but which carries a boxed warning for aggression, hostility and homicidal ideation, produced hostility-related reactions in 20% of patients at 12 mg against 6% on placebo, and cost about US$17.50 per unit at pharmacy acquisition price, roughly seventy times the other drugs on these pages.',
    laymanHowItWorks:
      'Glutamate is the signal nerve cells use to excite each other, and it acts on a receptor called AMPA that opens a channel and passes the message on. Most seizure drugs work indirectly, by damping the electrical machinery around that process. Perampanel blocks the receptor itself, and it does so at a site away from where glutamate binds, so the block cannot be overcome by more glutamate arriving. That is why it works where other things have failed, and it is also why the same molecule that quietens a seizure can change how a person behaves.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 69,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$17.50 per unit, the median across 34 listed perampanel products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered at Eisai and approved in the United States in October 2012 under NDA 202834, with the primary generalised tonic-clonic indication added in 2015 and paediatric use extended down to age 4 subsequently. United States rights later passed to Catalyst Pharmaceuticals. It is a Schedule III controlled substance, the most restrictive schedule of any drug on these pages. Generic products are listed in the CMS file and the median acquisition cost remains US$17.50 per unit, roughly seventy times the median of the other drugs here.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Perampanel is the only AMPA antagonist there is, so nothing substitutes for its mechanism. What substitutes for its role, as an add-on in refractory focal epilepsy, is every other modern adjunctive drug, all of which cost a small fraction as much and none of which carries a boxed warning for aggression.',
      conventionalRx: [
        {
          name: 'Lacosamide (Vimpat)',
          class: 'Slow-inactivation sodium channel modulator',
          howItCompares:
            'Approved for the same population on comparable placebo-controlled adjunctive trials, and additionally has a positive non-inferiority trial against controlled-release carbamazepine in 888 newly diagnosed adults, which perampanel does not. It also cut the risk of a second primary generalised tonic-clonic seizure by 45% against placebo.',
          typicalCost:
            'US$0.1676 per unit, median across 94 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: about one hundredth the acquisition cost, no boxed warning, an intravenous form. Cons: PR interval prolongation with post-marketing arrhythmia reports.',
        },
        {
          name: 'Brivaracetam (Briviact)',
          class: 'SV2A ligand',
          howItCompares:
            'Another modern add-on for refractory focal epilepsy, tested the same way over the same 12-week window. It has a behavioural signal of its own, at about 13% against 8% on placebo, but no boxed warning and no aggression-specific labelling.',
          typicalCost:
            'US$0.2634 per unit, median across 35 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: far cheaper, no titration needed, Schedule V rather than Schedule III. Cons: one of its three pivotal trials failed, and it adds nothing on top of levetiracetam.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand',
          howItCompares:
            'The commonest add-on in the world and among the cheapest. Its pivotal trial gave responder rates of 33.0% and 39.8% against 10.8% on placebo, against perampanel 35% at 8 mg and 12 mg against 19%. The placebo rates differ enough that the two sets of numbers cannot be compared directly.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: not a controlled substance, intravenous form, no interaction burden, about one hundred and sixtieth the cost. Cons: its own behavioural profile, at 13% of adults and 38% of children in registration trials.',
        },
        {
          name: 'Valproate (Depakote)',
          class: 'Broad-spectrum, multiple proposed mechanisms',
          howItCompares:
            'For generalised tonic-clonic seizures specifically, valproate remains the most effective drug in two randomised trials, and it is the comparator perampanel generalised indication sits alongside rather than replaces. Perampanel Study 4 was placebo-controlled and enrolled patients already on 1 to 3 other drugs.',
          typicalCost:
            'Off-patent; divalproex and valproic acid products are listed separately in the CMS NADAC file',
          prosAndCons:
            'Pros: the strongest efficacy record in idiopathic generalised epilepsy. Cons: a 10.3% major congenital malformation rate in EURAP and a dose-dependent IQ effect in exposed children.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream effects on GABA synthesis and adenosine signalling. It does not act at the AMPA receptor.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Agree in advance who will raise the alarm about behaviour',
          action:
            'Before starting, agree with a family member or friend that they will contact the prescriber directly if they see new anger, hostility or a change in personality, and that they do not need permission to do so.',
          patientImpact:
            'Hostility- and aggression-related reactions occurred in 12% of patients at 8 mg/day and 20% at 12 mg/day against 6% on placebo. The boxed warning notes these occurred in patients with and without any prior psychiatric history or prior aggressive behaviour.',
          clinicalPrecaution:
            'The person experiencing a personality change is the least likely person to report it. The label instruction to monitor is addressed to caregivers as much as to patients, and it names the titration period and higher doses as the highest-risk windows.',
        },
        {
          name: 'Make the home safe for a fall before the first dose',
          action:
            'Remove trip hazards, add a light on the route to the bathroom, and take the drug at bedtime as intended rather than earlier in the evening.',
          patientImpact:
            'Falls were reported in 5% of patients at 8 mg/day and 10% at 12 mg/day against 3% on placebo, some causing head injuries and bone fractures. Dizziness and vertigo occurred in 35% and 47% against 10%, and gait disturbance in 12% and 16% against 2%.',
          clinicalPrecaution:
            'Elderly patients had a higher risk of both falls and unsteadiness than younger adults and children. Most of these reactions occurred during titration rather than at steady state.',
        },
        {
          name: 'Tell the prescriber every other seizure drug you take, by name',
          action:
            'Make sure the prescriber knows specifically whether carbamazepine, oxcarbazepine or phenytoin is part of the regimen.',
          patientImpact:
            'All three induce CYP3A4 and substantially lower perampanel blood levels. In the pooled trial analysis, median seizure reduction at 12 mg/day was 54% against 19% on placebo without an inducer, and 22% against 9% with one.',
          clinicalPrecaution:
            'This is a documented interaction with a documented effect size, not a theoretical one. What to do about it is a prescriber decision and this page gives no dosing advice.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC=C(C=C1)N2C=C(C=C(C2=O)C3=CC=CC=C3C#N)C4=CC=CC=N4',
      chemicalFormula: 'C23H15N3O',
      molecularWeight: '349.40 g/mol',
      targetReceptorAffinity:
        'Perampanel is a non-competitive antagonist, so its effect is not overcome by rising glutamate concentration and cannot be summarised by a competitive binding constant against glutamate. No affinity number is quoted on the label as explaining the clinical effect.',
      structureSource: {
        label: 'PubChem CID 9924495 — perampanel structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9924495',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'per-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the pyridyl and cyanophenyl fragments',
          description:
            'Confirm the two aromatic coupling partners before the biaryl steps. Perampanel is three rings hung off a pyridinone core, and the nitrile on one of them is not decoration: it is a hydrogen-bond acceptor that the structure-activity work established as necessary. The wrong regioisomer of either fragment gives a compound with the same formula and no activity.',
          reagentsAndBuffer:
            '2-cyanophenylboronic acid and 2-pyridyl coupling partner reference standards, reverse-phase HPLC with UV detection at 254 nm, proton and carbon NMR for regiochemical assignment, residual metal analysis',
        },
        {
          id: 'per-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sequential palladium-catalysed couplings onto the N-phenyl pyridinone',
          description:
            'Build the trisubstituted 1-phenyl-2-pyridinone core and install the pyridyl and cyanophenyl groups by cross-coupling. This route is more complex than those of the other drugs on these pages, which contributes to the finished product’s cost but does not explain all of it.',
          dependsOnStepId: 'per-w1',
          reagentsAndBuffer:
            'Palladium catalyst with phosphine ligand, base such as potassium carbonate, degassed aqueous or mixed organic solvent, inert atmosphere, controlled temperature, halide precursors for each coupling',
        },
        {
          id: 'per-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation with residual palladium and regioisomer specifications',
          description:
            'Recrystallise and set limits both for residual palladium and for the coupling regioisomers. Metal-catalysed routes carry a metal specification that condensation routes do not, and the isomeric impurities here co-elute on ordinary methods, so the analytical method has to be validated to resolve each one.',
          dependsOnStepId: 'per-w2',
          reagentsAndBuffer:
            'Metal scavenger resin, ethanol or ethyl acetate for recrystallisation, inductively coupled plasma mass spectrometry for palladium, gradient HPLC validated against synthesised regioisomer standards',
        },
        {
          id: 'per-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'AMPA-evoked current with a competition control',
          description:
            'Record AMPA-evoked currents from cortical neurons and test whether raising the agonist concentration overcomes the block. It does not, and that is the defining experiment: a competitive antagonist would be surmountable by more glutamate, which in a seizure is exactly what is present. Non-competitive block is why the drug works during the condition it treats.',
          dependsOnStepId: 'per-w3',
          reagentsAndBuffer:
            'Primary cortical neurons or AMPA receptor-expressing cells, AMPA or glutamate applied over a full concentration range, cyclothiazide to block desensitisation, NBQX as a competitive antagonist comparator, caesium-based internal solution',
        },
        {
          id: 'per-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CYP3A4-induced clearance measurement alongside receptor occupancy',
          description:
            'Quantify perampanel exposure in the presence and absence of CYP3A4 induction and set it beside receptor occupancy. This pairing is the assay this drug most needs: roughly half the patients in the pivotal trials were taking carbamazepine, oxcarbazepine or phenytoin, and the label reports that the treatment effect roughly halved in that group. Measuring occupancy without measuring exposure would attribute a pharmacokinetic collapse to the receptor.',
          dependsOnStepId: 'per-w4',
          reagentsAndBuffer:
            'Human hepatocytes with and without rifampicin or carbamazepine pre-induction, deuterated perampanel internal standard, LC-MS/MS in multiple reaction monitoring mode, radioligand or functional occupancy assay run at matched free concentrations',
        },
      ],
    },
    keyAudits: [
      {
        id: 'per-a1',
        category: 'measured',
        title: 'Generalised tonic-clonic seizures fell by a median of 76% against 38% on placebo',
        laymanSummary:
          'In 162 patients with generalised epilepsy having convulsive seizures, adding perampanel cut those seizures by a median of 76%. On placebo the median fall was 38%.',
        technicalDetails:
          'Study 4 was a multicentre randomised double-blind placebo-controlled trial at 78 sites in 16 countries, enrolling patients aged 12 and over with idiopathic generalised epilepsy on a stable dose of 1 to 3 anti-seizure drugs and at least 3 primary generalised tonic-clonic seizures in an 8-week baseline. Efficacy was analysed in 162 patients (81 perampanel, 81 placebo) who received medication and at least one post-treatment assessment. Titration ran 4 weeks to 8 mg/day or the highest tolerated dose, followed by 13 weeks of treatment, 17 weeks in total, dosed once daily. Median percent reduction from baseline in PGTC seizure frequency during treatment was 76% on perampanel against 38% on placebo, p<0.0001. The 38% placebo figure is worth holding onto: more than a third of the reduction seen on the drug was matched by patients whose treatment did not change.',
        evidenceSource:
          'Perampanel United States prescribing information, Clinical Studies 14.2, Study 4, Table 6 (openFDA drug label endpoint)',
        measuredMetric:
          'Median percent change from baseline in primary generalised tonic-clonic seizure frequency per 28 days',
        auditFlag: 'verified',
      },
      {
        id: 'per-a2',
        category: 'measured',
        title: 'Boxed warning: hostility and aggression in 20% of patients at the top dose',
        laymanSummary:
          'The boxed warning names aggression, hostility, irritability, anger and homicidal ideation and threats. In the trials, hostility-related reactions occurred in 12% of patients at 8 mg and 20% at 12 mg, against 6% on placebo.',
        technicalDetails:
          'Warnings and Precautions 5.1 reports that in the controlled partial-onset seizure trials, hostility- and aggression-related adverse reactions occurred in 12% and 20% of patients randomised to 8 mg and 12 mg per day against 6% on placebo. The effects were dose-related and generally appeared within the first 6 weeks, though new events continued to be observed beyond 37 weeks. Perampanel-treated patients had more such reactions that were serious, severe, and led to dose reduction, interruption and discontinuation. Irritability, aggression, anger and anxiety each occurred in 2% or more of treated patients and at twice the placebo rate, alongside belligerence, affect lability, agitation and physical assault. Homicidal ideation or threat was exhibited in 0.1% of 4,368 perampanel-treated patients across controlled and open-label trials including non-epilepsy trials. The boxed warning states that these reactions occurred in patients with and without prior psychiatric history, prior aggressive behaviour or concomitant medications associated with hostility.',
        evidenceSource:
          'Perampanel United States prescribing information, boxed warning and Warnings and Precautions 5.1 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of hostility- and aggression-related adverse reactions by dose, against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'per-a3',
        category: 'failed',
        title: 'Half the pivotal population was on a drug that halves perampanel levels',
        laymanSummary:
          'About half the patients in the three focal-epilepsy trials were taking carbamazepine, oxcarbazepine or phenytoin, all of which speed up perampanel removal. In that half the drug worked far less well, and the label shows the two sets of numbers side by side.',
        technicalDetails:
          'The label states that approximately 50% of patients in Studies 1, 2 and 3 were on at least one anti-seizure drug known to induce CYP3A4, specifically carbamazepine, oxcarbazepine or phenytoin, resulting in a significant reduction in perampanel serum concentration, and that a combined analysis revealed a substantially reduced effect in the presence of inducers. Without inducers, median percent reduction was 22% at 4 mg, 45% at 8 mg and 54% at 12 mg against placebo values of 16%, 16% and 19%. With inducers it was 33%, 24% and 22% against placebo values of 14%, 12% and 9%. Responder rates without inducers were 35%, 45% and 54% against placebo 19%, 17% and 15%; with inducers, 26%, 32% and 33% against placebo 18%, 19% and 21%. In the induced group, the 12 mg dose barely separates from placebo on the responder endpoint. The headline efficacy figures for this drug are therefore an average across two populations in which it behaves very differently, and the interaction is with the three commonest older anti-seizure drugs in the world.',
        evidenceSource:
          'Perampanel United States prescribing information, Clinical Studies 14.1, Tables 4 and 5 (openFDA drug label endpoint)',
        measuredMetric:
          'Median percent seizure reduction and responder rate, stratified by presence of a concomitant CYP3A4-inducing anti-seizure drug',
        inferredClaim:
          'That the pooled efficacy figures describe what perampanel does for a patient. They average a group in which it worked well with a group in which, at the top dose, it barely separated from placebo.',
        auditFlag: 'caution',
      },
      {
        id: 'per-a4',
        category: 'inferred',
        title: 'One whole region was removed from the efficacy analysis after the fact',
        laymanSummary:
          'The tables that show perampanel working best exclude every patient from Latin America. The stated reason is that those sites had an unusually high placebo response, which is a decision made after seeing the data.',
        technicalDetails:
          'Both Table 4 and Table 5 of the label carry the same footnote: patients from the Latin American region are excluded because of a significant treatment-by-region interaction due to high placebo response. That is a post hoc exclusion of a geographic subgroup from the efficacy analysis, justified by an outcome observed in the data rather than by a pre-specified rule. A high placebo response is a real phenomenon and a recognised problem in add-on epilepsy trials, and excluding the affected sites can be defensible. The published pooled analysis puts a size on it: 162 of 1,480 treated patients, 10.9% of the cohort, excluded on a treatment-by-region interaction significant at p=0.042. It is also, mechanically, the removal of the patients among whom the drug looked least effective, and the label reports the exclusion without reporting what the numbers look like with those patients included. The primary endpoint analyses in Figure 1 are separate from these tables, but Tables 4 and 5 are where the largest effect sizes on the label appear.',
        evidenceSource:
          'Perampanel United States prescribing information, Clinical Studies 14.1, footnotes to Tables 4 and 5; Kramer LD et al., Epilepsia 2014;55:423-431, which quantifies the exclusion',
        doi: '10.1111/epi.12527',
        measuredMetric:
          'Size of the excluded regional subgroup, 162 of 1,480 treated patients (10.9%), on a treatment-by-region interaction at P=0.042',
        inferredClaim:
          'That the inducer-stratified effect sizes describe the whole trial population. They describe the trial population minus one region excluded on the basis of its results.',
        auditFlag: 'caution',
      },
      {
        id: 'per-a5',
        category: 'measured',
        title: 'Dizziness in nearly half of patients, and falls in one in ten at the top dose',
        laymanSummary:
          'At 12 mg a day, 47% of patients reported dizziness or vertigo and 10% fell, some suffering head injuries and fractures. On placebo those rates were 10% and 3%.',
        technicalDetails:
          'Warnings and Precautions 5.3 reports dizziness and vertigo in 35% and 47% of patients at 8 mg and 12 mg per day against 10% on placebo, and gait disturbance events, grouping ataxia, gait disturbance, balance disorder and abnormal coordination, in 12% and 16% against 2%. Somnolence occurred in 16% and 18% against 7%. These reactions occurred mostly during titration and led to discontinuation in 3% of treated patients against 1% on placebo. Warnings and Precautions 5.4 reports falls in 5% and 10% at those doses against 3% on placebo, in some cases causing serious injuries including head injuries and bone fracture, occurring both with and without concurrent seizures. Elderly patients had increased risk of both unsteadiness and falls compared with younger adults and children. In a drug whose purpose is to prevent injury from falling during a seizure, a fall rate that rises from 3% to 10% is a direct offset against the benefit.',
        evidenceSource:
          'Perampanel United States prescribing information, Warnings and Precautions 5.3 and 5.4 (openFDA drug label endpoint)',
        measuredMetric:
          'Incidence of dizziness, gait disturbance, somnolence and falls by dose, against placebo',
        auditFlag: 'caution',
      },
      {
        id: 'per-a6',
        category: 'measured',
        title: 'The dose-response stops at 8 mg while the harm curve keeps climbing',
        laymanSummary:
          'Going from 8 mg to 12 mg produced no extra seizure reduction. It roughly doubled the rate of falls and hostility and lifted dizziness from 35% to 47%.',
        technicalDetails:
          'The label states that a statistically significant decrease in seizure rate was observed at doses of 4 mg to 12 mg per day, and that dose response was apparent at 4 mg to 8 mg with little additional reduction in frequency at 12 mg per day. The pooled responder rates were 19% on placebo, 29% at 4 mg, 35% at 8 mg and 35% at 12 mg, identical at the top two doses. Across the same step from 8 mg to 12 mg, hostility- and aggression-related reactions rose from 12% to 20%, falls from 5% to 10%, dizziness and vertigo from 35% to 47%, gait disturbance from 12% to 16% and somnolence from 16% to 18%. A flat efficacy curve above 8 mg with a steeply rising harm curve is one of the clearest risk-benefit statements available on any label on these pages, and it is assembled from three separate sections rather than stated in one place.',
        evidenceSource:
          'Perampanel United States prescribing information, Clinical Studies 14.1 and Warnings and Precautions 5.1, 5.3 and 5.4 (openFDA drug label endpoint)',
        measuredMetric:
          'Responder rate at 8 mg against 12 mg, set beside the dose-related adverse reaction rates over the same interval',
        auditFlag: 'verified',
      },
      {
        id: 'per-a7',
        category: 'conclusion_shift',
        title:
          'The obvious target in epilepsy took forty years to become a drug, and the reason is on the label',
        laymanSummary:
          'Blocking glutamate receptors is the most direct way to stop a seizure, and it was tried for decades. The compounds that reached people caused sedation and psychiatric effects that ended their development. Perampanel is what happened when one was pushed through anyway.',
        technicalDetails:
          'Glutamate is the primary excitatory neurotransmitter and the AMPA receptor carries most fast excitatory transmission, so antagonising it has been an obvious anti-seizure strategy since the receptor was characterised. Competitive AMPA antagonists reached clinical development and did not reach the market. Perampanel, a non-competitive antagonist acting away from the glutamate binding site, was approved in 2012 as the first AMPA receptor antagonist licensed for any indication, and it arrived with a boxed warning describing serious or life-threatening psychiatric and behavioural reactions including homicidal ideation and threats. It is a Schedule III controlled substance, the most restrictive scheduling of any drug on these pages. The conclusion that shifted is not about the biology, which was always correct. It is about what a therapeutic window looks like at this target: the psychiatric effects were treated for decades as a development failure to be engineered away, and were ultimately accepted as an intrinsic consequence of blocking the brain main excitatory receptor, to be managed by monitoring rather than removed by chemistry.',
        evidenceSource:
          'Perampanel United States prescribing information, boxed warning, Mechanism of Action 12.1 and Drug Abuse and Dependence 9.1 (openFDA drug label endpoint)',
        inferredClaim:
          'That psychiatric toxicity at the AMPA receptor was a property of particular molecules that a better one would avoid. It appears instead to be a property of the target.',
        auditFlag: 'verified',
      },
      {
        id: 'per-a8',
        category: 'inferred',
        title:
          'Seventy times the price of its alternatives, with no head-to-head evidence supporting it',
        laymanSummary:
          'A perampanel tablet costs a United States pharmacy about $17.50 to buy. The equivalent unit of lacosamide costs about 17 cents and of levetiracetam about 11 cents. No trial has compared perampanel with either.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost file, effective 19 August 2026, gives a median of US$17.50 per unit across 34 listed perampanel products, against US$0.1676 across 94 lacosamide products, US$0.2634 across 35 brivaracetam products and US$0.1105 across 134 levetiracetam products. The efficacy record supporting that difference is three placebo-controlled adjunctive trials in refractory focal epilepsy and one in generalised tonic-clonic seizures. There is no randomised comparison of perampanel with any other anti-seizure drug. The defensible arguments for the price are that the synthesis is genuinely more complex, involving sequential metal-catalysed couplings rather than a single condensation, and that the mechanism is unique so nothing else substitutes for it in a patient who has failed everything else. Neither argument is an efficacy argument, and the label contains no data that would support one.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost 2026 file, prices effective 19 August 2026, compared across perampanel, lacosamide, brivaracetam and levetiracetam',
        inferredClaim:
          'That a seventy-fold price difference reflects a corresponding difference in clinical benefit. No trial compares perampanel with any alternative, so no such comparison exists to support or refute it.',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title:
          'Swallowed once a day at bedtime, and cleared by an enzyme other seizure drugs speed up',
        laymanDesc:
          'Absorption is complete and the drug lasts long enough for once-daily dosing. It is broken down by a liver enzyme that carbamazepine, oxcarbazepine and phenytoin all switch on, so taking any of those alongside it substantially lowers the amount that reaches the brain.',
        molecularDetail:
          'Perampanel is metabolised primarily by CYP3A4. The label states that approximately 50% of patients in the pivotal trials were on a CYP3A4-inducing anti-seizure drug, resulting in a significant reduction in serum concentration, and reports a substantially reduced treatment effect in that group. Bedtime dosing is standard because dizziness and somnolence peak after the dose.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the receiving side of the synapse',
        laymanDesc:
          'Most seizure drugs act on the sending nerve cell or on its electrical machinery. This one acts on the receiving cell, at the point where the excitatory message is picked up.',
        molecularDetail:
          'The relevant compartment is the postsynaptic membrane of cortical neurons, where AMPA-type ionotropic glutamate receptors mediate the fast excitatory postsynaptic current. This is a different physical location from the presynaptic vesicle target of levetiracetam and brivaracetam and from the axonal sodium channels of the older drugs.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It blocks the AMPA receptor away from where glutamate binds',
        laymanDesc:
          'Rather than competing with glutamate for the same slot, it attaches elsewhere on the receptor and stops it working. That matters, because during a seizure there is a great deal of glutamate about, and a competing blocker would simply be outnumbered.',
        molecularDetail:
          'The label describes perampanel as a non-competitive antagonist of the ionotropic AMPA glutamate receptor on post-synaptic neurons, and states that the precise mechanism by which it exerts its antiepileptic effects in humans is unknown. Non-competitive block is insurmountable by rising agonist concentration, which is the property that distinguishes it from the competitive AMPA antagonists that failed in development.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fast excitatory transmission is turned down across the cortex',
        laymanDesc:
          'The main excitatory signal between nerve cells weakens everywhere it is blocked. That prevents a seizure from recruiting neighbouring tissue, and it also changes the ordinary excitatory traffic that mood and behaviour run on.',
        molecularDetail:
          'Reduced AMPA-mediated postsynaptic current lowers the probability that an excitatory input triggers firing in the receiving neuron. Nothing in the pharmacology confines that effect to epileptic tissue, which is the most parsimonious explanation for a boxed warning describing aggression, hostility and homicidal ideation in patients with no psychiatric history.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title:
          'A 76% median fall in convulsive seizures, and a responder rate that stops rising at 8 mg',
        laymanDesc:
          'In generalised epilepsy, convulsive seizures fell by a median of 76% against 38% on placebo. In focal epilepsy, 35% of patients halved their seizures at 8 mg against 19% on placebo, and 12 mg added nothing.',
        molecularDetail:
          'Efficacy is established in three placebo-controlled adjunctive trials in refractory focal epilepsy and one in primary generalised tonic-clonic seizures. Dose response is apparent from 4 mg to 8 mg with little additional reduction at 12 mg, while hostility, falls and dizziness all continue to rise across that step. No active-comparator trial exists.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Perampanel PGTC Study 4 (label Clinical Studies 14.2)',
        phase:
          'Phase 3 multicentre randomised double-blind placebo-controlled trial, 17 weeks, 78 sites in 16 countries',
        sampleSize: 162,
        primaryEndpoint:
          'Percent change from baseline in primary generalised tonic-clonic seizure frequency per 28 days during the treatment period',
        endpointMet: true,
        statisticalPValue:
          'Median reduction 76% on perampanel 8 mg against 38% on placebo, P<0.0001',
        unreportedAdverseSignals:
          'The placebo group achieved a 38% median reduction on its own, so more than a third of the improvement seen on the drug was matched by patients whose treatment did not change.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Perampanel partial-onset Studies 1, 2 and 3 (label Clinical Studies 14.1)',
        phase:
          'Three Phase 3 randomised double-blind placebo-controlled multicentre trials, 19 weeks each',
        sampleSize: 1480,
        primaryEndpoint:
          'Percent change in seizure frequency per 28 days during the treatment period compared with an initial 6-week baseline',
        endpointMet: true,
        statisticalPValue:
          'Significant reduction at 4 mg to 12 mg/day; pooled responder rates 19% placebo, 29% at 4 mg, 35% at 8 mg, 35% at 12 mg',
        unreportedAdverseSignals:
          'Approximately 50% of patients were on a CYP3A4-inducing anti-seizure drug, and the label reports a substantially reduced treatment effect in that group. The inducer-stratified tables exclude all Latin American patients post hoc because of a high placebo response.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median 76% reduction in primary generalised tonic-clonic seizure frequency against 38% on placebo in 162 patients (P<0.0001)',
        'Pooled focal-seizure responder rates of 29%, 35% and 35% at 4, 8 and 12 mg against 19% on placebo',
        'Hostility- and aggression-related reactions in 12% at 8 mg and 20% at 12 mg against 6% on placebo, with homicidal ideation or threat in 0.1% of 4,368 treated patients',
        'Falls in 5% at 8 mg and 10% at 12 mg against 3% on placebo, some causing head injuries and fractures',
        'Dizziness and vertigo in 35% and 47% against 10% on placebo; gait disturbance in 12% and 16% against 2%',
        'Median seizure reduction at 12 mg of 54% without a CYP3A4 inducer against 22% with one',
      ],
      unsupportedInferences: [
        'That the pooled efficacy figures describe a typical patient, when the effect roughly halves in the 50% of patients taking carbamazepine, oxcarbazepine or phenytoin',
        'That the inducer-stratified tables describe the whole trial population, when they exclude one entire region on the basis of its placebo response',
        'That 12 mg is a stronger dose worth reaching for, when it matched 8 mg on responder rate while doubling falls and hostility',
        'That a seventy-fold price difference over lacosamide or levetiracetam reflects a difference in benefit, when no head-to-head trial exists',
      ],
      whatFailedInitially: [
        'AMPA receptor antagonism was pursued for decades and the competitive antagonists that reached development did not reach the market, on sedation and psychiatric effects',
        'Half the pivotal trial population was taking a drug that substantially lowered perampanel exposure, and the label reports the resulting loss of effect rather than the trial having been designed to avoid it',
        'The dose-response flattens above 8 mg while every dose-related harm continues to climb',
      ],
      realWorldOutcome: [
        'The only AMPA receptor antagonist licensed anywhere, and therefore the only option of its kind for someone who has failed everything else',
        'US$17.50 per unit at United States pharmacy acquisition cost, a median across 34 listed products and roughly seventy times the median of the other drugs on these pages',
        'A Schedule III controlled substance, the most restrictive scheduling of any anti-seizure drug here, on top of a boxed warning that requires caregiver monitoring',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral suspension, once daily at bedtime',
      description:
        'Once-daily bedtime dosing is not a convenience feature but a tolerability one: dizziness and somnolence peak after the dose, and taking it before sleep moves the worst of that into the night. There is no intravenous form. Titration is mandatory and slow, in 2 mg weekly increments, because the label ties the highest risk of both psychiatric reactions and falls to the titration period.',
      safetyProfile:
        'A boxed warning for serious or life-threatening psychiatric and behavioural reactions including aggression, hostility, irritability, anger, and homicidal ideation and threats, occurring in patients with and without any prior psychiatric history. Hostility-related reactions ran at 12% and 20% at 8 and 12 mg against 6% on placebo. Dizziness and vertigo reached 47% at 12 mg against 10%; falls 10% against 3%, some causing head injuries and fractures; gait disturbance 16% against 2%; somnolence 18% against 7%. Elderly patients are at higher risk of falls and unsteadiness. DRESS and multi-organ hypersensitivity are labelled. Withdrawal must be gradual. It is a Schedule III controlled substance. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Why does perampanel have a boxed warning when other seizure drugs do not?',
        a: 'Because it blocks the brain main excitatory receptor, and nothing in that action confines itself to epileptic tissue. In the controlled focal-seizure trials, hostility- and aggression-related adverse reactions occurred in 12% of patients at 8 mg per day and 20% at 12 mg, against 6% on placebo. Irritability, aggression, anger and anxiety each occurred in at least 2% of treated patients and at twice the placebo rate, with belligerence, affect lability, agitation and physical assault also more common. Homicidal ideation or threat was exhibited in 0.1% of 4,368 treated patients. The warning states that these occurred in patients with and without prior psychiatric history, prior aggressive behaviour, or other medications associated with hostility, which is why it is addressed to caregivers as well as patients.',
        auditNote:
          'The boxed warning is the most important thing on this page, and the dose-response in it is steep.',
      },
      {
        q: 'Why might it work less well for me than the trial numbers suggest?',
        a: 'The commonest reason is on the label. Perampanel is cleared by CYP3A4, and carbamazepine, oxcarbazepine and phenytoin all induce that enzyme and substantially lower perampanel blood levels. Roughly half the patients in the three pivotal trials were taking one of them. In the combined analysis, median seizure reduction at 12 mg per day was 54% without an inducer and 22% with one; responder rates were 54% against 33%. In the induced group the top dose barely separated from placebo on the responder endpoint. If any of those three drugs is part of your regimen, the pooled figures quoted for perampanel do not describe your situation.',
      },
      {
        q: 'Is a higher dose better?',
        a: 'Not on the evidence, and this page gives no dosing advice. The label states that dose response was apparent at 4 mg to 8 mg with little additional reduction in seizure frequency at 12 mg per day, and the pooled responder rates bear that out: 29% at 4 mg, 35% at 8 mg and 35% at 12 mg, against 19% on placebo. Over the same step from 8 mg to 12 mg, hostility-related reactions rose from 12% to 20%, falls from 5% to 10%, dizziness and vertigo from 35% to 47% and gait disturbance from 12% to 16%. Efficacy flattens and harm keeps climbing. That comparison is assembled from three separate sections of the label and is not stated in one place.',
        auditNote:
          'A flat efficacy curve against a rising harm curve is the clearest risk-benefit statement on any label in this group.',
      },
      {
        q: 'Why does it cost so much more than the other drugs?',
        a: 'Two factors help explain the price, and one comparison is missing. Perampanel is built by sequential palladium-catalysed couplings of three aromatic rings, whereas most drugs on these pages are made in one or two condensation steps. It is also the only licensed AMPA receptor antagonist, so there is no equivalent drug in the same class to switch to. No randomised trial has compared perampanel with lacosamide, brivaracetam, levetiracetam or another anti-seizure drug. At United States pharmacy acquisition cost the median is US$17.50 per unit against about 17 cents for lacosamide and 11 cents for levetiracetam. The evidence does not show whether that price gap corresponds to a difference in benefit.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for perampanel could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. This matters more for perampanel than for anything else in this group, because it is the one drug here where the gap between an acquisition cost and a plausible manufacturing cost is large enough to be the story. What is shown instead is the CMS National Average Drug Acquisition Cost, US$17.50 per unit as a median across 34 listed products. That is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Perampanel United States prescribing information: boxed warning, Clinical Studies 14.1 and 14.2 with Tables 4, 5 and 6, Warnings and Precautions 5.1 to 5.6, Drug Abuse and Dependence 9.1, Mechanism of Action 12.1, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22PERAMPANEL%22',
        kind: 'regulatory',
      },
      {
        label:
          'Kramer LD et al. Perampanel for adjunctive treatment of partial-onset seizures: a pooled dose-response analysis of phase III studies. Epilepsia 2014;55:423-431',
        identifier: '10.1111/epi.12527',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: FYCOMPA (perampanel), NDA 202834, original approval 22 October 2012; primary generalised tonic-clonic indication added 2015',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202834',
        kind: 'regulatory',
      },
      KETOGENIC_DIET_SOURCE,
      {
        label: 'PubChem CID 9924495 — perampanel structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9924495',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 13. Ethosuximide — a 1960 drug that won the first class I trial in generalised epilepsy, in 2010.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ethosuximide',
    name: 'Ethosuximide',
    tradeName: 'Zarontin',
    sponsor:
      'Parke-Davis (originator), now part of Viatris; long off-patent, with only eight products listed in the CMS acquisition-cost file',
    targetGene: 'CACNA1G',
    targetProtein:
      'T-type (low-voltage-activated) calcium channels in thalamocortical relay neurons is the modern account. The United States label makes no such claim: it describes suppression of three-per-second spike-and-wave activity by depression of the motor cortex and elevation of the seizure threshold.',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1960,
    indication: 'Control of absence (petit mal) epilepsy',
    patientFriendlyIndication:
      'Absence seizures, the brief blank spells of childhood absence epilepsy',
    anatomicalSite:
      'Thalamocortical circuit, at the low-threshold calcium currents of thalamic relay and reticular neurons',
    conditionContext: {
      conditionExplainer:
        'An absence seizure is not a convulsion. It is a few seconds of vacancy, sometimes dozens of times a day, produced by the thalamus and cortex locking into a three-per-second rhythm. Children are often described as daydreaming or inattentive for months before anyone recognises what is happening.',
      whyItMatters:
        'Because the seizures look like nothing, the harm is educational and social rather than physical, and the endpoint that matters is whether the child can pay attention. That makes childhood absence epilepsy one of the few epilepsies where a trial can measure cognition directly, and one of the few where a drug side effect on attention is the same currency as the disease itself.',
      whoTakesThis:
        'Children with childhood absence epilepsy, and almost nobody else. Ethosuximide does nothing for convulsive seizures and the label warns it can make them more frequent when used alone in mixed epilepsy.',
      clinicalGoals:
        'Complete freedom from absence seizures confirmed on video-EEG, on one drug, without an attentional cost that replaces the one the seizures were causing.',
    },
    oneSentenceVerdict:
      'A 1960 succinimide with a label whose mechanism paragraph predates the discovery of the channel it is now believed to block, which in 2010 became the subject of the first randomised trial in any generalised epilepsy to meet class I criteria: 53% freedom from treatment failure at 16 weeks against 58% for valproate and 29% for lamotrigine, with attentional dysfunction in 33% against 49% on valproate.',
    laymanHowItWorks:
      'An absence seizure is the thalamus and the cortex falling into a rhythm together, about three beats a second. The thalamus can produce that rhythm because its cells carry a slow calcium current that lets them fire in bursts. Ethosuximide is thought to suppress that current, so the cells stop bursting and the rhythm cannot form. The drug does nothing useful for a convulsion, because a convulsion is not made this way, and the label warns it can make convulsions more frequent if it is the only drug someone takes.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 83,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2483 per unit, the median across 8 listed ethosuximide products at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Introduced by Parke-Davis as Zarontin in 1960 and long off-patent. The CMS file lists only 8 products, the smallest number of any drug on these pages, which is the structural reason a sixty-five-year-old generic for a small childhood population costs more per unit than carbamazepine or phenytoin. A market with eight manufacturers behaves differently from one with a hundred and fifty-eight.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'This is the rare case where the comparison has actually been done properly. A double-blind randomised trial of 453 children compared the only three drugs anyone uses for childhood absence epilepsy, followed them for a year, and measured attention as well as seizures. Ethosuximide and valproate controlled seizures equally; lamotrigine did not; and valproate cost more attention.',
      conventionalRx: [
        {
          name: 'Valproic acid (Depakene, Depakote)',
          class: 'Broad-spectrum, multiple proposed mechanisms',
          howItCompares:
            'Statistically indistinguishable from ethosuximide on seizure control at both time points: freedom-from-failure 58% against 53% at 16 weeks (OR 1.26, 95% CI 0.80 to 1.98, p=0.35) and 44% against 45% at 12 months (OR 0.94, 0.58 to 1.52, p=0.82). Attentional dysfunction occurred in 49% on valproate against 33% on ethosuximide (OR 1.95, 95% CI 1.12 to 3.41, p=0.03), and the largest group of patients discontinuing for adverse events, 42% of 115, was in the valproate arm.',
          typicalCost:
            'Off-patent; valproic acid and divalproex products are listed separately in the CMS NADAC file',
          prosAndCons:
            'Pros: also covers the generalised tonic-clonic seizures that some children with absence epilepsy go on to have, which ethosuximide does not. Cons: worse attention on the measured endpoint, a 10.3% major congenital malformation rate in EURAP, and a dose-dependent IQ effect in exposed children.',
        },
        {
          name: 'Lamotrigine (Lamictal)',
          class: 'Sodium channel blocker',
          howItCompares:
            'Clearly worse. Freedom-from-failure was 29% at 16 weeks and 21% at 12 months, against 45% for ethosuximide (OR 3.08, 95% CI 1.81 to 5.33, p<0.001). Almost two thirds of the 125 children who failed treatment for lack of seizure control were in the lamotrigine arm.',
          typicalCost:
            'US$0.1612 per unit, median across 181 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: the best-tolerated of the three, with no attentional signal and the lowest malformation rate. Cons: it did not control the seizures, which in this syndrome is the point, and it is a drug that wins on tolerability in focal epilepsy and loses on efficacy here.',
        },
        {
          name: 'Levetiracetam (Keppra)',
          class: 'SV2A ligand',
          howItCompares:
            'Widely used in childhood absence epilepsy and not tested in this trial. It holds no United States indication for absence seizures. Any claim about how it compares with ethosuximide here is an inference across trials, not a measurement, and the trial that could have settled it deliberately compared only the three drugs already in standard use.',
          typicalCost:
            'US$0.1105 per unit, median across 134 listed products at US pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: familiar, cheap, no monitoring. Cons: no absence indication, no place in the one class I trial in this syndrome, and its own behavioural profile in children at 38% against 19% on placebo.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ketogenic diet (medically supervised, not a supplement)',
          activeCompound: 'Ketone bodies produced by sustained carbohydrate restriction',
          biologicalMechanism:
            'Shifts brain fuel from glucose to ketone bodies, with downstream effects on GABA synthesis and adenosine signalling. It has a long history in generalised epilepsies of childhood, including absence epilepsy that has failed drug treatment.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here. In the one randomised trial, 145 children with drug-resistant epilepsy were assigned to the diet or a 3-month delay, and 38% on the diet halved their seizures against 6% of controls.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask the school to tell you what they see',
          action:
            'Ask teachers to note the number and timing of blank spells rather than describing the child as inattentive, and share those notes at appointments.',
          patientImpact:
            'Absence seizures are brief and easily read as daydreaming, and a school day is where most of them happen. The trial that established ethosuximide as first choice used video-EEG to confirm seizure freedom precisely because parental and clinical impressions are unreliable here.',
          clinicalPrecaution:
            'A school report is useful data and not a substitute for EEG confirmation. Seizure freedom in this syndrome is defined on the recording, not on the account.',
        },
        {
          name: 'Report a sore throat or fever rather than waiting it out',
          action:
            'If the child develops signs of infection such as a sore throat or fever, contact the prescriber that day.',
          patientImpact:
            'The label warns that blood dyscrasias, including some with fatal outcome, have been reported with ethosuximide, advises periodic blood counts, and specifically says a blood count should be considered when signs or symptoms of infection develop. Drug-induced immune thrombocytopenia has also been reported, with onset 1 to 3 weeks after starting and platelet nadirs of 2,000 to 3,000 per cubic millimetre.',
          clinicalPrecaution:
            'The instruction exists because an ordinary childhood infection and the first sign of a blood dyscrasia look the same from outside. Only a blood count separates them.',
        },
        {
          name: 'Never stop it suddenly',
          action:
            'If the drug is to be reduced or stopped, that happens slowly and by agreement with the prescriber.',
          patientImpact:
            'The label states that abrupt withdrawal of anticonvulsant medication may precipitate absence status, a prolonged confusional state that is the absence-seizure equivalent of status epilepticus, and advises proceeding slowly when adding or removing any other medication too.',
          clinicalPrecaution:
            'This page gives no schedule. The point is that absence status is a specific and recognised consequence of stopping this drug abruptly, not a general caution.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCC1(CC(=O)NC1=O)C',
      chemicalFormula: 'C7H11NO2',
      molecularWeight: '141.17 g/mol',
      targetReceptorAffinity:
        'No affinity constant appears on the label, which predates the identification of any molecular target for this drug. The published account rests on suppression of low-threshold T-type calcium current in thalamic neurons, and the concentrations at which that is demonstrated in slice preparations have been debated against the concentrations achieved in people.',
      structureSource: {
        label: 'PubChem CID 3291 — ethosuximide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3291',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'esm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the 2-methyl-2-butyl fragment',
          description:
            'Confirm the alkyl precursor before ring formation. Ethosuximide is one of the smallest drug molecules in general use at 141 daltons, with a succinimide ring carrying a methyl and an ethyl group on one carbon. Almost nothing about it is elaborate, and its per-unit cost has nothing to do with how hard it is to make.',
          reagentsAndBuffer:
            'Alkyl cyanoester or equivalent reference standard, gas chromatography with flame ionisation detection, proton NMR, loss on drying',
        },
        {
          id: 'esm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Cyclisation to the 2-ethyl-2-methylsuccinimide ring',
          description:
            'Close the five-membered succinimide ring bearing the geminal methyl and ethyl substituents. The quaternary carbon is the whole structure-activity story of the succinimide anticonvulsants: without both alkyl groups on the same carbon, activity against absence seizures disappears.',
          dependsOnStepId: 'esm-w1',
          reagentsAndBuffer:
            'Ammonia or urea source for imide nitrogen, acid or base catalysis, reflux in a high-boiling solvent, then acidification and isolation',
        },
        {
          id: 'esm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and residual solvent control',
          description:
            'Recrystallise to pharmacopoeial purity. There is no chiral centre, no polymorph problem of note and no reactive metabolite specification, which is why the entire quality burden of this molecule sits in ordinary chemical purity and residual solvent limits.',
          dependsOnStepId: 'esm-w2',
          reagentsAndBuffer:
            'Ethanol or water for recrystallisation, activated charcoal, gas chromatography headspace analysis for residual solvents, melting point determination',
        },
        {
          id: 'esm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Low-threshold calcium current recording in thalamic slice',
          description:
            'Record the T-type calcium current from thalamic relay and reticular neurons in slice, and test the compound at concentrations matched to human plasma levels rather than at whatever concentration produces an effect. That distinction is the live scientific question about this drug: the current is suppressed in slice, and whether it is suppressed enough at achievable human concentrations to account for the clinical effect has been argued for three decades.',
          dependsOnStepId: 'esm-w3',
          reagentsAndBuffer:
            'Acute thalamic slices from juvenile rodent, artificial cerebrospinal fluid, tetrodotoxin to block sodium currents, caesium-based internal solution, drug applied across a concentration range bracketing the human therapeutic plasma range',
        },
        {
          id: 'esm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Spike-and-wave suppression on EEG alongside plasma concentration',
          description:
            'Record three-per-second spike-and-wave discharge on EEG in a genetic absence model while measuring plasma concentration in the same animals. The EEG is the only readout that corresponds to what the label actually claims, since the label describes suppression of spike-and-wave activity and says nothing about any channel. Pairing it with a plasma level is what allows the cellular result and the clinical dose to be compared at all.',
          dependsOnStepId: 'esm-w4',
          reagentsAndBuffer:
            'Genetic absence epilepsy rat model with implanted cortical electrodes, deuterated ethosuximide internal standard, LC-MS/MS in multiple reaction monitoring mode, automated spike-and-wave discharge detection',
        },
      ],
    },
    keyAudits: [
      {
        id: 'esm-a1',
        category: 'measured',
        title:
          'The first class I randomised trial in any generalised epilepsy, and this drug won it',
        laymanSummary:
          'Four hundred and fifty-three children with newly diagnosed absence epilepsy were randomly assigned, double-blind, to one of the three drugs anyone uses. Ethosuximide and valproate controlled the seizures equally well and lamotrigine did not, and ethosuximide cost less attention than valproate.',
        technicalDetails:
          'Glauser and colleagues randomised 453 children with newly diagnosed childhood absence epilepsy double-blind to ethosuximide, valproic acid or lamotrigine, titrating each to seizure freedom, maximum allowable dose or a treatment-failure criterion. The primary outcome was freedom from treatment failure at 16 weeks, with attentional dysfunction as the secondary outcome. Freedom-from-failure was 53% for ethosuximide and 58% for valproic acid, statistically indistinguishable (OR with valproate against ethosuximide 1.26, 95% CI 0.80 to 1.98, p=0.35), and both were higher than lamotrigine at 29% (OR ethosuximide against lamotrigine 2.66, 95% CI 1.65 to 4.28; OR valproate against lamotrigine 3.34, 2.06 to 5.42; p<0.001 for both). There were no significant differences in discontinuation for adverse events at 16 weeks. Attentional dysfunction was more common with valproic acid than ethosuximide, in 49% of children against 33% (OR 1.95, 95% CI 1.12 to 3.41, p=0.03). The 12-month report described the trial as the first randomised controlled trial meeting International League Against Epilepsy criteria for class I evidence for childhood absence epilepsy, or for any type of generalised seizure in adults or children.',
        evidenceSource: 'Glauser TA et al., N Engl J Med 2010;362:790-799 (NCT00088452)',
        doi: '10.1056/NEJMoa0902014',
        measuredMetric:
          'Freedom from treatment failure at 16 weeks, with video-EEG confirmation, and attentional dysfunction as a co-measured outcome',
        auditFlag: 'verified',
      },
      {
        id: 'esm-a2',
        category: 'measured',
        title: 'At twelve months, only 37% of all the children were still free from failure',
        laymanSummary:
          'The 16-week figures look reasonable. Followed for a year, only 37% of all enrolled children were still succeeding on the first drug they were given, whichever drug that was.',
        technicalDetails:
          'The 12-month report covered 446 evaluable children of 453 enrolled. By 12 months after starting therapy, only 37% of all enrolled subjects were free from treatment failure on their first medication. Freedom-from-failure rates were 45% for ethosuximide and 44% for valproic acid (OR 0.94, 95% CI 0.58 to 1.52, p=0.82), both higher than lamotrigine at 21% (OR ethosuximide against lamotrigine 3.08, 95% CI 1.81 to 5.33; valproate against lamotrigine 2.88, 1.68 to 5.02; p<0.001 for both). Treatment failures split by cause: almost two thirds of the 125 children failing for lack of seizure control were in the lamotrigine arm, while the largest single group of the 115 discontinuing for adverse events, 42%, was in the valproate arm. Childhood absence epilepsy has a reputation as the benign end of paediatric epilepsy, and this trial measured what that reputation is worth on first-line treatment: fewer than two children in five.',
        evidenceSource: 'Glauser TA et al., Epilepsia 2013;54:141-155 (NCT00088452)',
        doi: '10.1111/epi.12028',
        measuredMetric:
          'Freedom-from-failure rate at 12 months, with video-EEG assessment, and the split of failures between lack of control and intolerable adverse events',
        auditFlag: 'verified',
      },
      {
        id: 'esm-a3',
        category: 'conclusion_shift',
        title: 'The label mechanism paragraph predates the target it is now said to act on',
        laymanSummary:
          'Every textbook says ethosuximide blocks T-type calcium channels in the thalamus. Its own label says it suppresses three-per-second spike-and-wave activity by depressing the motor cortex and raising the seizure threshold, language from 1960 that names no molecule at all.',
        technicalDetails:
          'The United States prescribing information for Zarontin has no Mechanism of Action section. Its Clinical Pharmacology paragraph reads, in full, that ethosuximide suppresses the paroxysmal three cycle per second spike and wave activity associated with lapses of consciousness common in absence seizures, and that the frequency of epileptiform attacks is reduced, apparently by depression of the motor cortex and elevation of the threshold of the central nervous system to convulsive stimuli. That is a description of an EEG observation and a pair of nineteenth-century physiological abstractions. The T-type calcium channel account arrived decades later, and the thalamic low-threshold current it depends on was characterised long after this drug was licensed. The account is well supported as an explanation of how absence seizures are generated. What has been argued for thirty years is whether ethosuximide suppresses that current sufficiently at the plasma concentrations achieved in patients to account for the clinical effect, and no regulatory document has ever adopted it.',
        evidenceSource:
          'Ethosuximide United States prescribing information, Clinical Pharmacology (openFDA drug label endpoint)',
        inferredClaim:
          'That the T-type calcium channel mechanism taught for this drug is an established fact about how it works in people. It is the best available explanation, it is not on the label, and its quantitative fit to human concentrations remains contested.',
        auditFlag: 'caution',
      },
      {
        id: 'esm-a4',
        category: 'measured',
        title: 'Used alone in mixed epilepsy, it can make convulsions more frequent',
        laymanSummary:
          'Ethosuximide treats one seizure type and nothing else. The label warns that in a child who also has convulsive seizures, using it on its own may increase how often those happen.',
        technicalDetails:
          'The Precautions section states that ethosuximide, when used alone in mixed types of epilepsy, may increase the frequency of grand mal seizures in some patients. This is the mirror image of the sodium-channel blockers that worsen absence and myoclonic seizures, and it is the reason getting the epilepsy syndrome right matters more than getting the drug right. Some children with childhood absence epilepsy go on to have generalised tonic-clonic seizures as well, and that is the clinical situation in which this warning applies and the commonest reason valproate is chosen over ethosuximide despite the attentional data. No proportion is stated here because none was verified. The same section warns that abrupt withdrawal of anticonvulsant medication may precipitate absence status.',
        evidenceSource:
          'Ethosuximide United States prescribing information, Precautions, General (openFDA drug label endpoint)',
        measuredMetric:
          'Labelled warning of increased grand mal seizure frequency on ethosuximide monotherapy in mixed epilepsy',
        auditFlag: 'caution',
      },
      {
        id: 'esm-a5',
        category: 'measured',
        title: 'Fatal blood dyscrasias, lupus, and a platelet count that fell to 2,000',
        laymanSummary:
          'The warnings on this drug are haematological and immunological rather than neurological. Blood disorders including fatal ones have been reported, drug-induced immune destruction of platelets has taken counts down to 2,000, and cases of lupus have occurred.',
        technicalDetails:
          'The Warnings section reports blood dyscrasias, including some with fatal outcome, and advises periodic blood counts, with a count considered whenever signs or symptoms of infection such as sore throat or fever develop. Drug-induced immune thrombocytopenia has been reported, with symptom onset 1 to 3 weeks after starting, recurrence within one day of re-challenge in one patient, and platelet nadirs of 2,000 and 3,000 per cubic millimetre where specified; the label directs discontinuation, serial platelet counts, assessment for drug-dependent antiplatelet antibodies where possible, and permanent avoidance thereafter. Cases of systemic lupus erythematosus have been reported. Ethosuximide produces morphological and functional changes in animal liver, and abnormal liver and renal function studies have been reported in humans, so periodic urinalysis and liver function studies are advised for all patients. The label also instructs that patients be told before starting that a rash may herald a serious medical event.',
        evidenceSource:
          'Ethosuximide United States prescribing information, Warnings (openFDA drug label endpoint)',
        measuredMetric:
          'Reported blood dyscrasias, drug-induced immune thrombocytopenia with specified platelet nadirs, and systemic lupus erythematosus cases',
        auditFlag: 'caution',
      },
      {
        id: 'esm-a6',
        category: 'inferred',
        title: 'The attention result is the most important finding and the least often quoted',
        laymanSummary:
          'Ethosuximide and valproate control absence seizures equally well. The reason ethosuximide is first choice is not seizure control at all: it is that 33% of children on it had attentional problems against 49% on valproate.',
        technicalDetails:
          'On the primary seizure endpoint the two drugs were indistinguishable at both 16 weeks (53% against 58%, p=0.35) and 12 months (45% against 44%, p=0.82). The differentiating result is the secondary one: attentional dysfunction in 49% of children on valproic acid against 33% on ethosuximide (OR 1.95, 95% CI 1.12 to 3.41, p=0.03), a difference the 12-month report confirmed as persisting. The authors stated that these 12-month outcome data, coupled with the study prespecified decision-making algorithm, indicate that ethosuximide is the optimal initial empirical monotherapy. That conclusion rests on a secondary endpoint, in a trial powered for a primary one, and it is the right conclusion precisely because in this syndrome attention is not a side effect measure but the outcome the disease itself damages. Two limits remain: attentional dysfunction at 33% on ethosuximide is not a small number in absolute terms, and the trial had no untreated arm, so how much of that 33% belongs to the drug rather than to the epilepsy cannot be separated.',
        evidenceSource:
          'Glauser TA et al., N Engl J Med 2010;362:790-799 and Epilepsia 2013;54:141-155 (NCT00088452)',
        doi: '10.1111/epi.12028',
        measuredMetric:
          'Percentage of children with attentional dysfunction at the month 12 visit, by treatment arm',
        inferredClaim:
          'That the 33% attentional dysfunction rate on ethosuximide is a drug effect. Without an untreated arm, part of it belongs to the epilepsy, and the trial can only establish the difference between arms.',
        auditFlag: 'verified',
      },
      {
        id: 'esm-a7',
        category: 'inferred',
        title: 'Eight products in the whole United States market, and a price that reflects it',
        laymanSummary:
          'Ethosuximide is a tiny, simple, sixty-five-year-old molecule that costs a United States pharmacy about 25 cents a unit, more than carbamazepine or phenytoin. The likeliest reason is not chemistry but that only eight products are listed.',
        technicalDetails:
          'The CMS National Average Drug Acquisition Cost file lists 8 ethosuximide products, against 29 for phenytoin, 92 for carbamazepine, 134 for levetiracetam and 158 for topiramate. The median acquisition cost is US$0.2483 per unit, above phenytoin at US$0.1812 and below carbamazepine at US$0.3776, for a molecule of 141 daltons with no chiral centre, made by a single cyclisation. Small-population generics with few manufacturers are a recognised structural weak point in drug supply, exposed both to price movement and to shortage when one manufacturer stops. This page states the observable facts, the product count and the acquisition cost, and does not estimate what the drug costs to make, because no verifiable per-dose production figure was found.',
        evidenceSource:
          'CMS National Average Drug Acquisition Cost 2026 file, prices effective 19 August 2026, product counts compared across the anti-seizure drugs on these pages',
        measuredMetric:
          'Number of listed products and median per-unit acquisition cost, compared across this drug class',
        inferredClaim:
          'That the per-unit cost of ethosuximide reflects its cost of manufacture. Eight listed products for a molecule this simple points at market structure, and this page does not quantify either.',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed well, and cleared slowly',
        laymanDesc:
          'The capsule or syrup is well absorbed and the drug persists long enough that levels move slowly. That is convenient, and it also means a change takes days to show its full effect.',
        molecularDetail:
          'Ethosuximide is a small, water-soluble succinimide with low protein binding and a long elimination half-life, cleared mainly by hepatic metabolism with a portion excreted unchanged. Enzyme-inducing anti-seizure drugs shorten its half-life, which is one reason the label warns about proceeding slowly when adding or removing other medication.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the thalamus, where absence seizures are generated',
        laymanDesc:
          'The molecule is small and distributes freely into brain tissue. The circuit that matters is the loop between the thalamus and the cortex, which is where the three-per-second rhythm is made.',
        molecularDetail:
          'Low protein binding and small size give free distribution into brain and cerebrospinal fluid. The relevant compartment is the thalamocortical circuit, specifically the relay neurons and the reticular nucleus whose low-threshold burst firing sustains spike-and-wave oscillation.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It is thought to suppress the slow calcium current that lets thalamic cells burst',
        laymanDesc:
          'Thalamic cells can fire in bursts because of a slow calcium current that primes them. Damping it stops the bursting, and without bursting the rhythm has nothing to run on.',
        molecularDetail:
          'The modern account is reduction of T-type low-voltage-activated calcium current in thalamic neurons. The United States label does not adopt it: its Clinical Pharmacology paragraph describes suppression of three cycle per second spike-and-wave activity apparently by depression of the motor cortex and elevation of the seizure threshold, and names no molecular target at all.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The three-per-second rhythm cannot form',
        laymanDesc:
          'Without synchronised bursting the thalamus and cortex stop locking together, the spike-and-wave pattern disappears from the EEG, and the blank spells stop.',
        molecularDetail:
          'Suppression of spike-and-wave discharge is the observable and the one the label describes. Because the mechanism is specific to the thalamocortical oscillation, it confers nothing against focal or convulsive seizures, and the label warns that monotherapy in mixed epilepsy may increase grand mal frequency.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Freedom from failure in 53% at 16 weeks, and better attention than valproate',
        laymanDesc:
          'In the one class I trial in this syndrome, 53% of children were still free from treatment failure at 16 weeks against 58% on valproate and 29% on lamotrigine. Attentional problems affected 33% against 49% on valproate.',
        molecularDetail:
          'Efficacy is established against two active comparators in a 453-child double-blind randomised trial with video-EEG confirmation, followed to 12 months. Ethosuximide is first choice on the attentional endpoint rather than on the seizure endpoint, on which it and valproate are indistinguishable.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Childhood Absence Epilepsy trial, 16-week primary outcome (NCT00088452)',
        phase: 'Phase 3 double-blind randomised active-controlled trial, three parallel arms',
        sampleSize: 453,
        primaryEndpoint:
          'Freedom from treatment failure after 16 weeks of therapy, with video-EEG assessment; attentional dysfunction as secondary outcome',
        endpointMet: true,
        statisticalPValue:
          'Ethosuximide 53% and valproic acid 58% (OR 1.26, 95% CI 0.80 to 1.98, P=0.35), both above lamotrigine at 29% (OR 2.66, 1.65 to 4.28 and 3.34, 2.06 to 5.42, P<0.001)',
        unreportedAdverseSignals:
          'Attentional dysfunction occurred in 49% on valproic acid against 33% on ethosuximide (OR 1.95, 95% CI 1.12 to 3.41, P=0.03). There was no untreated arm, so the absolute contribution of drug to that 33% cannot be separated from the epilepsy.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Childhood Absence Epilepsy trial, 12-month outcome (NCT00088452)',
        phase: 'Phase 3 double-blind randomised active-controlled trial, 12-month follow-up',
        sampleSize: 446,
        primaryEndpoint:
          'Freedom-from-failure rate 12 months after randomisation, with video-EEG assessment',
        endpointMet: true,
        statisticalPValue:
          'Ethosuximide 45% and valproic acid 44% (OR 0.94, 95% CI 0.58 to 1.52, P=0.82), both above lamotrigine at 21% (OR 3.08, 1.81 to 5.33 and 2.88, 1.68 to 5.02, P<0.001)',
        unreportedAdverseSignals:
          'Only 37% of all enrolled subjects were free from treatment failure on their first medication at 12 months. Almost two thirds of the 125 failing for lack of seizure control were on lamotrigine; 42% of the 115 discontinuing for adverse events were on valproic acid.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Freedom from treatment failure at 16 weeks of 53% on ethosuximide, 58% on valproic acid and 29% on lamotrigine, with video-EEG confirmation',
        'Freedom-from-failure at 12 months of 45%, 44% and 21% for the same three drugs',
        'Only 37% of all 453 enrolled children still free from treatment failure on their first drug at 12 months',
        'Attentional dysfunction in 33% of children on ethosuximide against 49% on valproic acid (OR 1.95, 95% CI 1.12 to 3.41, P=0.03)',
        'Drug-induced immune thrombocytopenia with platelet nadirs of 2,000 and 3,000 per cubic millimetre, 1 to 3 weeks after starting',
        'A median United States pharmacy acquisition cost of US$0.2483 per unit across only 8 listed products',
      ],
      unsupportedInferences: [
        'That T-type calcium channel block is the established mechanism: the label names no target, and whether the current is suppressed enough at human plasma concentrations has been contested for decades',
        'That the 33% attentional dysfunction rate on ethosuximide is entirely a drug effect, when the trial had no untreated arm',
        'That childhood absence epilepsy is reliably controlled by first-line treatment, when 63% of enrolled children had failed their first drug by 12 months',
        'That the per-unit price reflects the cost of making a 141-dalton molecule in one cyclisation step',
      ],
      whatFailedInitially: [
        'Lamotrigine, a drug that wins first-line trials in focal epilepsy, controlled absence seizures in only 29% at 16 weeks and 21% at 12 months, and accounted for almost two thirds of all failures for lack of seizure control',
        'Valproate matched ethosuximide on seizures and lost on attention, which in this syndrome is the endpoint the disease itself damages',
        'The label mechanism paragraph has never been updated to reflect fifty years of subsequent work on thalamic calcium currents',
      ],
      realWorldOutcome: [
        'First-line for childhood absence epilepsy on the strength of a single class I trial, chosen on an attentional endpoint rather than a seizure one',
        'About 25 US cents per unit at United States pharmacy acquisition cost, more than phenytoin, across only 8 listed products',
        'It has no role outside absence seizures, and the label warns that using it alone in mixed epilepsy may increase convulsive seizure frequency',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and oral solution',
      description:
        'The oral solution matters more than usual because the population is children, many under ten, who cannot reliably swallow a capsule and whose dose is weight-based. There is no injectable form and no extended-release form; the long half-life makes one unnecessary.',
      safetyProfile:
        'No boxed warning, and a warnings section that is almost entirely haematological and immunological rather than neurological. Blood dyscrasias including fatal cases have been reported, with periodic blood counts advised and a count recommended whenever infection symptoms appear. Drug-induced immune thrombocytopenia has occurred 1 to 3 weeks after starting, with platelet nadirs of 2,000 to 3,000, recurrence on re-challenge, and a direction never to use the drug again in an affected patient. Systemic lupus erythematosus has been reported. Abnormal liver and renal function studies occur, and periodic urinalysis and liver function testing is advised. Used alone in mixed epilepsy it may increase grand mal seizure frequency, and abrupt withdrawal may precipitate absence status. Patients are to be told before starting that a rash may herald a serious medical event. The class-wide suicidality warning applies.',
    },
    commonQuestions: [
      {
        q: 'Why is ethosuximide preferred to valproate if they work equally well?',
        a: 'Because of what they cost in attention. On seizure control the two were statistically indistinguishable at both time points of the one class I trial: 53% against 58% free from treatment failure at 16 weeks, and 45% against 44% at 12 months. The difference was in the secondary outcome. Attentional dysfunction occurred in 49% of children on valproic acid against 33% on ethosuximide, an odds ratio of 1.95 (95% CI 1.12 to 3.41, p=0.03), and the largest group of children stopping for adverse events was in the valproate arm. In childhood absence epilepsy the harm the disease does is to attention and learning, so a drug that controls the seizures at the cost of attention has traded one problem for the same problem.',
        auditNote:
          'The recommendation rests on a secondary endpoint, and it is the right endpoint for this syndrome.',
      },
      {
        q: 'Does ethosuximide actually block T-type calcium channels?',
        a: 'That is the standard teaching and it is not on the label. The United States prescribing information has no mechanism of action section at all; its clinical pharmacology paragraph says the drug suppresses paroxysmal three-per-second spike-and-wave activity and reduces attack frequency, apparently by depression of the motor cortex and elevation of the seizure threshold. That text predates the characterisation of the thalamic low-threshold calcium current entirely. The T-type account is the best available explanation of how absence seizures are generated and of what a drug that stops them would need to do. What has been argued for thirty years is whether ethosuximide suppresses that current enough at the plasma concentrations achieved in children to account for the clinical effect.',
      },
      {
        q: 'My child still has seizures on it. Is that unusual?',
        a: 'No, and the trial that established this drug says so. At twelve months, only 37% of all 453 enrolled children were still free from treatment failure on the drug they started with, whichever of the three it was. For ethosuximide specifically the figure was 45%. Childhood absence epilepsy has a reputation as the mild end of paediatric epilepsy, and that reputation refers to long-term outcome rather than to how often the first drug works. Of the 125 children who failed for lack of seizure control, almost two thirds were on lamotrigine, so which drug was started mattered considerably.',
      },
      {
        q: 'Why does my child need blood tests on such an old, simple drug?',
        a: 'Because the risks of this drug are in the blood rather than the brain. The label reports blood dyscrasias including some with fatal outcome, advises periodic blood counts, and specifically says a count should be considered whenever signs of infection such as a sore throat or fever appear, because those are how a falling white cell count first shows itself. Drug-induced immune thrombocytopenia has also been reported, appearing 1 to 3 weeks after starting, with platelet counts falling as low as 2,000 per cubic millimetre in the cases where a number was recorded. Cases of systemic lupus erythematosus have occurred, and abnormal liver and kidney function tests are on the label with periodic urinalysis and liver function studies advised.',
        auditNote:
          'The monitoring instruction is old and non-specific. What the label does not provide is a rate, so how often these events occur is not something this page can state.',
      },
      {
        q: 'Why is there no manufacturing cost on this page?',
        a: 'Because no per-dose cost-of-production figure for ethosuximide could be verified and cited. The published literature on essential-medicine production costs keeps its per-drug numbers in a supplementary appendix that was not checked line by line here, and estimating one would mean this page inventing a number. What is shown instead is the CMS National Average Drug Acquisition Cost, about 25 US cents per unit as a median across 8 listed generic products. Eight is the smallest product count of any drug in this group, against 158 for topiramate and 134 for levetiracetam, and that is worth noticing for a 141-dalton molecule made in a single cyclisation. The acquisition cost is what a United States pharmacy pays a wholesaler. It is not a manufacturing cost and it is not what a patient is charged.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Glauser TA et al. Ethosuximide, valproic acid, and lamotrigine in childhood absence epilepsy. N Engl J Med 2010;362:790-799',
        identifier: '10.1056/NEJMoa0902014',
        kind: 'doi',
      },
      {
        label:
          'Glauser TA et al. Ethosuximide, valproic acid, and lamotrigine in childhood absence epilepsy: initial monotherapy outcomes at 12 months. Epilepsia 2013;54:141-155',
        identifier: '10.1111/epi.12028',
        kind: 'doi',
      },
      {
        label: 'Childhood Absence Epilepsy comparative monotherapy trial registration',
        identifier: 'NCT00088452',
        kind: 'nct',
      },
      {
        label:
          'Ethosuximide (Zarontin) United States prescribing information: Clinical Pharmacology, Warnings and Precautions, retrieved from the openFDA drug label endpoint',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ETHOSUXIMIDE%22',
        kind: 'regulatory',
      },
      KETOGENIC_DIET_SOURCE,
      {
        label: 'PubChem CID 3291 — ethosuximide structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/3291',
        kind: 'url',
      },
      NADAC_SOURCE,
    ],
  },
]
