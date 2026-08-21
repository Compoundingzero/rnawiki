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
          'The label reports clinically significant hyponatraemia, defined as serum sodium below 125 mmol/L, in 2.5% of oxcarbazepine-treated patients (38 of 1,524) across the 14 controlled epilepsy studies, against no such patients on placebo or on the active controls, which were carbamazepine and phenobarbital in the adjunctive and substitution studies and phenytoin and valproate in the monotherapy initiation studies. It generally appeared in the first 3 months, though some patients first crossed the threshold more than a year in. Most were asymptomatic, but patients in trials were frequently monitored and some had the dose reduced or stopped, and the label states plainly that whether those manoeuvres prevented more severe events is unknown. Symptoms listed include nausea, malaise, headache, lethargy, confusion, obtundation, and an increase in seizure frequency or severity.',
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
]
