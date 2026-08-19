import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — therapeutic monoclonal antibodies.
 *
 * Every DOI, PMID, NCT number and regulatory URL below was resolved against Crossref, PubMed,
 * ClinicalTrials.gov v2 or openFDA at the time of writing. Trial arm sizes, endpoints and p-values
 * are copied from the published abstract or the FDA label, never from memory. Where a number could
 * not be sourced the field is absent rather than estimated.
 *
 * Two structural notes that apply to the whole group:
 *
 * 1. Antibodies have no tractable structure string. A 1,300-residue heterotetramer with two
 *    N-glycans is not a SMILES and not a sequence a reader can check, so `molecularSchema` carries
 *    the published molecular weight and the manufacturing workflow, and omits `smilesString` and
 *    `sequence5to3` entirely. The seed loader therefore runs no deterministic sweep on these
 *    records and no machine-verified badge is claimed. That is the correct outcome, not a gap.
 *
 * 2. Cost of production is cited, never estimated. The class figure used here is the published
 *    best-practice cost of goods for monoclonal antibody manufacture — $10s to $100s per gram of
 *    drug substance, against prices of ~$2,000 per gram or higher — from MAbs 2025,
 *    doi:10.1080/19420862.2025.2451789. The one product-specific cost-based price is rituximab
 *    500 mg at $449, from BMJ Open 2019, doi:10.1136/bmjopen-2018-027780. Dossiers with no
 *    citable cost figure carry no `pricing` block.
 */

const MAB_COGS_SOURCE = {
  label: 'Cost and supply considerations for antibody therapeutics (MAbs, 2025)',
  identifier: '10.1080/19420862.2025.2451789',
  kind: 'doi' as const,
}

export const ANTIBODY_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Adalimumab
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'adalimumab',
    name: 'Adalimumab',
    tradeName: 'Humira',
    sponsor: 'AbbVie (originally BASF / Knoll, developed with Cambridge Antibody Technology)',
    targetGene: 'TNF',
    targetProtein: 'Tumour Necrosis Factor Alpha (TNF-α)',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Rheumatoid arthritis, juvenile idiopathic arthritis, psoriatic arthritis, ankylosing spondylitis, Crohn disease, ulcerative colitis, plaque psoriasis, hidradenitis suppurativa, non-infectious uveitis',
    patientFriendlyIndication: 'Rheumatoid arthritis and other long-term inflammatory diseases',
    anatomicalSite: 'Extracellular fluid, inflamed synovium and gut mucosa',
    conditionContext: {
      conditionExplainer:
        'In rheumatoid arthritis and the related immune diseases, the immune system keeps producing an alarm signal called TNF-alpha when there is nothing to fight. The alarm recruits white cells into joints, skin or bowel wall, and the tissue is eaten away by the response rather than by any infection.',
      whyItMatters:
        'Untreated rheumatoid arthritis erodes cartilage and bone within the first two years of disease. The damage is structural and does not reverse, so the value of an early drug is measured in joints that never deform rather than in pain scores alone.',
      whoTakesThis:
        'Adults and children with moderate-to-severe inflammatory disease that methotrexate or another conventional agent has not controlled. Adalimumab was the best-selling drug in the world for most of the decade to 2022.',
      clinicalGoals:
        'Reach low disease activity or remission, and stop radiographic joint erosion progressing on serial X-rays.',
    },
    oneSentenceVerdict:
      'A fully human antibody that mops up TNF-alpha before it reaches its receptor, raising the 24-week ACR20 response rate from 14.5% on methotrexate alone to 67.2% when added to it.',
    laymanHowItWorks:
      'Your immune system uses a messenger protein called TNF-alpha to tell white blood cells where to attack. In rheumatoid arthritis that message is being broadcast into healthy joints. Adalimumab is a sponge shaped to fit TNF-alpha and nothing else, so it soaks the messenger out of the blood and joint fluid before any cell reads it. The attack orders never arrive.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 95,
    pricing: {
      synthesisCostPerDose:
        'Published best-practice cost of goods for antibody drug substance is $10-$100 per gram; a 40 mg pen contains 0.04 g of it',
      retailPricePerDoseOrYear:
        'US list price approximately $6,922 per four-week supply, close to $90,000 per year before rebates',
      markupEstimate:
        'Price per gram of antibody exceeds published best-practice manufacturing cost by roughly two orders of magnitude',
      openPatentNotes:
        'AbbVie filed 247 patent applications on Humira and obtained 132 patents, over 90% of them issued within two years of the primary patent expiring. European biosimilars launched in 2018; the first US biosimilar, Amjevita, launched in January 2023.',
      synthesisComplexity: 'High',
      costSource: MAB_COGS_SOURCE,
      priceSource: {
        label:
          'US House Committee on Oversight and Reform, Drug Pricing Investigation: AbbVie — Humira and Imbruvica (May 2021)',
        identifier:
          'https://oversightdemocrats.house.gov/imo/media/doc/Committee%20on%20Oversight%20and%20Reform%20-%20AbbVie%20Staff%20Report.pdf',
        kind: 'regulatory',
      },
    },
    substitutes: {
      summary:
        'Methotrexate remains the anchor drug and costs a few dollars a month; adalimumab biosimilars now deliver the same molecule at a lower list price; JAK inhibitors offer an oral route with a different safety profile. No food or supplement has been shown to control radiographic joint erosion.',
      conventionalRx: [
        {
          name: 'Methotrexate',
          class: 'Conventional synthetic DMARD (antifolate)',
          howItCompares:
            'The comparator arm in ARMADA and PREMIER. Slower to act and less potent alone, but combination with adalimumab beat either drug on its own in PREMIER.',
          typicalCost: '$15 - $40 / month (generic oral tablets)',
          prosAndCons:
            'Pros: decades of outcome data, low cost, works with almost every biologic. Cons: nausea, mouth ulcers, requires liver and blood monitoring, contraindicated in pregnancy.',
        },
        {
          name: 'Adalimumab biosimilars (Amjevita, Hyrimoz, Cyltezo and others)',
          class: 'Biosimilar anti-TNF monoclonal antibody',
          howItCompares:
            'Same molecule, same target, approved on analytical and clinical similarity rather than fresh outcome trials.',
          typicalCost: 'Approximately $40,000 - $85,000 / year list, depending on which list price is chosen',
          prosAndCons:
            'Pros: identical mechanism at a lower list price. Cons: US uptake was slowed by rebate contracting, so patient out-of-pocket cost does not always follow the list price down.',
        },
        {
          name: 'Etanercept (Enbrel)',
          class: 'TNF receptor-Fc fusion protein',
          howItCompares:
            'Binds TNF as a decoy receptor rather than as an antibody. Comparable in rheumatoid arthritis; ineffective in Crohn disease, where adalimumab works.',
          typicalCost: 'Approximately $7,000 / month US list',
          prosAndCons:
            'Pros: long safety record. Cons: no benefit in inflammatory bowel disease, which is a real mechanistic difference and not a dosing question.',
        },
        {
          name: 'Tofacitinib / upadacitinib',
          class: 'Oral JAK inhibitor',
          howItCompares:
            'Blocks intracellular cytokine signalling instead of one extracellular cytokine. Oral rather than injected.',
          typicalCost: '$5,000 - $6,500 / month US list',
          prosAndCons:
            'Pros: tablet, rapid onset. Cons: FDA boxed warning for major cardiovascular events, malignancy, thrombosis and mortality based on the ORAL Surveillance trial.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Smoking cessation',
          action: 'Stop tobacco entirely, with pharmacological support if needed.',
          patientImpact:
            'Smoking is the strongest known environmental risk factor for seropositive rheumatoid arthritis and is associated with worse response to methotrexate and anti-TNF therapy.',
          clinicalPrecaution:
            'This modifies risk and treatment response. It is not a substitute for disease-modifying therapy in established erosive disease.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Recombinant human IgG1-kappa, 1330 amino acids',
      molecularWeight: 'Approximately 148 kDa',
      structureSource: {
        label: 'HUMIRA (adalimumab) US Prescribing Information, Description section',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125057',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'ada-qc',
          stepNumber: 1,
          phase: 'QC',
          name: 'Master cell bank identity and sterility release',
          description:
            'Confirm the CHO working cell bank identity by isoenzyme and STR analysis, and clear it for adventitious agents before any production bioreactor is inoculated.',
          reagentsAndBuffer: 'Cryopreserved CHO-DG44 vials, in vitro adventitious agent assay, mycoplasma PCR panel',
        },
        {
          id: 'ada-syn',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch CHO expression of the IgG1 heterotetramer',
          description:
            'Expand the transfected CHO line through seed train into a stirred-tank production bioreactor and run fed-batch for 12-14 days while heavy and light chains assemble and are secreted.',
          reagentsAndBuffer:
            'Chemically defined animal-component-free basal medium, glucose and amino acid feed, dissolved oxygen and pH control at 37 degrees C shifting to 33 degrees C',
          dependsOnStepId: 'ada-qc',
        },
        {
          id: 'ada-cap',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A affinity capture',
          description:
            'Clarify the harvest by depth filtration and capture IgG on a recombinant Protein A resin binding the Fc region, then elute at low pH.',
          reagentsAndBuffer: 'MabSelect SuRe resin, equilibration in PBS pH 7.2, elution in 0.1 M sodium citrate pH 3.5',
          dependsOnStepId: 'ada-syn',
        },
        {
          id: 'ada-pol',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Viral inactivation and polishing chromatography',
          description:
            'Hold the low-pH eluate to inactivate enveloped virus, then remove aggregate, host cell protein and leached Protein A on cation and anion exchange, and finish with nanofiltration.',
          reagentsAndBuffer:
            'Low-pH hold at pH 3.5 for 60 minutes, Capto S and Capto Q resins, 20 nm virus retentive filter',
          dependsOnStepId: 'ada-cap',
        },
        {
          id: 'ada-assay',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'TNF neutralisation bioassay',
          description:
            'Quantify potency as the concentration that rescues WEHI-164 fibrosarcoma cells from recombinant human TNF-alpha killing, against the reference standard.',
          reagentsAndBuffer:
            'WEHI-164 cells, recombinant human TNF-alpha, actinomycin D sensitisation, MTT or luminescent viability readout',
          dependsOnStepId: 'ada-pol',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ada-1',
        category: 'measured',
        title: 'ARMADA: ACR20 rose from 14.5% to 67.2% when adalimumab was added to methotrexate',
        laymanSummary:
          'In 271 people whose rheumatoid arthritis was still active on methotrexate, adding fortnightly adalimumab raised the proportion with a 20% improvement at six months from 15 in 100 to 67 in 100.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled 24-week trial. ACR20 at week 24 was 47.8%, 67.2% and 65.8% for adalimumab 20 mg, 40 mg and 80 mg every other week on background methotrexate, versus 14.5% for methotrexate plus placebo. The 40 mg dose became the marketed regimen.',
        evidenceSource: 'Weinblatt et al., Arthritis & Rheumatism 2003 (ARMADA)',
        doi: '10.1002/art.10697',
        measuredMetric: 'ACR20 response at 24 weeks: 67.2% versus 14.5%',
        auditFlag: 'verified',
      },
      {
        id: 'ada-2',
        category: 'measured',
        title: 'PREMIER: combination therapy beat either drug alone on joint damage, not just symptoms',
        laymanSummary:
          'In 799 people with early aggressive disease who had never had methotrexate, the combination slowed the erosion visible on X-rays more than either drug used alone.',
        technicalDetails:
          'Two-year, multicentre, double-blind, active-comparator trial. ACR50 at year 1 was 62% for adalimumab plus methotrexate versus 46% for methotrexate and 41% for adalimumab monotherapy. Combination therapy was superior on radiographic progression and clinical remission as well as on signs and symptoms.',
        evidenceSource: 'Breedveld et al., Arthritis & Rheumatism 2006 (PREMIER)',
        doi: '10.1002/art.21519',
        measuredMetric: 'ACR50 at 1 year: 62% combination versus 46% and 41% monotherapy',
        auditFlag: 'verified',
      },
      {
        id: 'ada-3',
        category: 'conclusion_shift',
        title: 'The 2006 cancer signal that later cohorts did not confirm',
        laymanSummary:
          'A 2006 pooled analysis of trials suggested anti-TNF antibodies roughly tripled cancer risk. Larger real-world registries assembled over the following five years did not reproduce an overall excess, and the field moved from alarm to qualified reassurance.',
        technicalDetails:
          'Bongartz et al. pooled nine randomised trials (3,493 treated, 1,512 placebo) and reported a malignancy odds ratio of 3.3 (95% CI 1.2-9.1), number needed to harm 154 over 6-12 months, plus a serious infection odds ratio of 2.0 (95% CI 1.3-3.1). A 2011 systematic review of registries and prospective observational cohorts by Mariette et al. did not confirm an overall malignancy excess, though signals for non-melanoma skin cancer persisted. The serious infection finding has held up better than the malignancy one.',
        evidenceSource:
          'Bongartz et al., JAMA 2006; superseded on malignancy by Mariette et al., Annals of the Rheumatic Diseases 2011',
        doi: '10.1136/ard.2010.149419',
        auditFlag: 'contested',
      },
      {
        id: 'ada-4',
        category: 'inferred',
        title: 'Remission on the drug is read as remission from the disease',
        laymanSummary:
          'Marketing and patient conversation both slide from "my disease is quiet" to "my disease is gone". The trials measured the first and never tested the second.',
        technicalDetails:
          'ARMADA and PREMIER measured response and radiographic progression during continuous treatment. Neither trial randomised sustained responders to withdrawal, so neither can support a claim about drug-free remission. Later withdrawal studies in early rheumatoid arthritis show that a minority maintain remission off biologic therapy and that predictors of who they are remain unsettled.',
        evidenceSource: 'Trial design of Weinblatt 2003 and Breedveld 2006',
        inferredClaim: 'That achieving remission on adalimumab means the disease has been cured',
        auditFlag: 'caution',
      },
      {
        id: 'ada-5',
        category: 'failed',
        title: 'Patent thicket delayed US biosimilar competition by five years',
        laymanSummary:
          'The same molecule faced competition in Europe from 2018 and in the United States only from 2023. The gap was created by patents on formulation, manufacturing and uses rather than on the antibody itself.',
        technicalDetails:
          'The 2021 House Oversight staff report, drawing on 170,000 pages of internal documents, describes AbbVie filing 247 patent applications and obtaining 132 patents on Humira, more than 90% issued within two years of the primary composition-of-matter patent expiring. Amgen launched Amjevita in the United States in January 2023 at two list prices, roughly 5% and 55% below Humira. The market failure here is in access, not in the antibody.',
        evidenceSource:
          'US House Committee on Oversight and Reform, Drug Pricing Investigation: AbbVie — Humira and Imbruvica (May 2021)',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Subcutaneous injection and lymphatic uptake',
        laymanDesc:
          'A short needle deposits the antibody just under the skin. From there it drains slowly into the lymph system and reaches the blood over the following days.',
        molecularDetail:
          'A 148 kDa IgG1 is too large for direct capillary uptake, so absorption is via lymphatic convection with a time to peak concentration of roughly five days and absolute bioavailability near 64%.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'FcRn recycling keeps it in circulation for two weeks',
        laymanDesc:
          'Cells lining the blood vessels swallow the antibody, then deliberately spit it back out instead of digesting it. That salvage loop is why one injection lasts a fortnight.',
        molecularDetail:
          'The IgG1 Fc binds the neonatal Fc receptor at endosomal pH 6.0 and is released at extracellular pH 7.4, diverting the molecule out of the lysosomal route. Terminal half-life is approximately 14 days.',
        iconName: 'RefreshCw',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binding soluble and membrane TNF-alpha',
        laymanDesc:
          'The two arms of the antibody clamp onto the inflammatory messenger, both the free-floating form and the form still anchored to a cell surface.',
        molecularDetail:
          'Both Fab arms bind the TNF-alpha homotrimer with sub-nanomolar affinity, forming immune complexes with soluble TNF and coating transmembrane TNF on activated macrophages and T cells.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Receptor engagement is blocked and signalling stops',
        laymanDesc:
          'With the messenger held, it can no longer dock on the receptors that would have told cells to inflame the joint.',
        molecularDetail:
          'Occupied TNF cannot engage TNFR1 or TNFR2, so the TRADD-RIPK1-NF-kB and MAPK cascades are not initiated. Downstream IL-6, IL-1, chemokine and adhesion-molecule transcription falls, and matrix metalloproteinase release from synovial fibroblasts declines.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Synovitis settles and erosion slows',
        laymanDesc:
          'Swelling and morning stiffness fall within weeks. On X-rays taken a year or two apart, the joint surface is measurably better preserved than it would have been.',
        molecularDetail:
          'Reduced RANKL-driven osteoclast activation and reduced MMP-mediated cartilage degradation translate into slower progression of the modified total Sharp score, the endpoint PREMIER measured over two years.',
        iconName: 'Bone',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ARMADA (Weinblatt 2003, conducted before ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 271,
        primaryEndpoint: 'ACR20 response at week 24 on background methotrexate',
        endpointMet: true,
        statisticalPValue: 'p < 0.001 for each adalimumab dose versus placebo',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PREMIER (Breedveld 2006)',
        phase: 'Phase 3',
        sampleSize: 799,
        primaryEndpoint:
          'ACR50 at year 1 and change in modified total Sharp score at year 2, methotrexate-naive early rheumatoid arthritis',
        endpointMet: true,
        statisticalPValue: 'p < 0.001 for combination versus either monotherapy',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'ACR20 at 24 weeks of 67.2% with adalimumab plus methotrexate versus 14.5% with methotrexate alone',
        'ACR50 at 1 year of 62% for combination versus 46% methotrexate and 41% adalimumab monotherapy',
        'Slower radiographic joint erosion over two years with combination therapy',
        'Serious infection odds ratio 2.0 (95% CI 1.3-3.1) in pooled randomised trials',
      ],
      unsupportedInferences: [
        'That sustained remission on adalimumab means the disease can be treated as cured; no pivotal trial randomised responders to withdrawal',
        'That being the best-selling drug in the world implies superiority over other anti-TNF agents; the pivotal trials were placebo-controlled, not head-to-head',
        'That the 2006 pooled malignancy odds ratio of 3.3 is the current estimate; registry data did not confirm an overall excess',
      ],
      whatFailedInitially: [
        'Murine and chimeric anti-TNF constructs provoked anti-drug antibodies; adalimumab was the first fully human anti-TNF antibody, isolated by phage display',
        'US biosimilar competition was delayed to 2023 by a patent estate of 132 granted patents while European biosimilars launched in 2018',
      ],
      realWorldOutcome: [
        'Roughly a third of patients lose response over time, frequently through anti-drug antibody formation, which concomitant methotrexate suppresses',
        'Reactivation of latent tuberculosis is a real and screenable risk, and pre-treatment interferon-gamma release assay testing is standard',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous prefilled syringe or autoinjector pen',
      description:
        'Single-use 40 mg/0.4 mL or 40 mg/0.8 mL device self-administered every other week, with loading regimens for gastrointestinal and dermatological indications.',
      safetyProfile:
        'Injection site reactions are the commonest event. Serious infection risk is roughly doubled against placebo in pooled trials, with tuberculosis reactivation, invasive fungal infection and hepatitis B reactivation carrying boxed warnings alongside lymphoma and other malignancy.',
    },
    commonQuestions: [
      {
        q: 'If I go into remission, can I stop the injections?',
        a: 'Nobody has measured that properly in the pivotal trials. ARMADA and PREMIER both treated continuously and neither randomised responders to stop. Later withdrawal studies suggest a minority stay in remission off treatment, but there is no validated way to identify who in advance.',
        auditNote:
          'This is the clearest gap between what the registration trials measured and what patients most want to know.',
      },
      {
        q: 'Is the biosimilar as good as Humira?',
        a: 'It is the same molecule made by a different manufacturer, approved on analytical and pharmacokinetic similarity plus a confirmatory clinical study rather than on a fresh outcome trial. Switching studies have not shown loss of efficacy. What differs in practice is price and formulary access, not mechanism.',
      },
      {
        q: 'Does adalimumab cause cancer?',
        a: 'A 2006 pooled analysis of randomised trials reported an odds ratio of 3.3 for malignancy, which is where the boxed warning comes from. A 2011 systematic review of registries and prospective cohorts did not confirm an overall excess, though non-melanoma skin cancer signals persisted. The honest position is that the absolute risk is small and the point estimate has moved down as the data have got larger.',
        auditNote: 'A live example of the field changing its mind as evidence quality improved.',
      },
      {
        q: 'Why does it cost so much when the antibody itself is cheap to make?',
        a: 'Published best-practice cost of goods for antibody drug substance is $10 to $100 per gram. A 40 mg pen is 0.04 g. The price reflects patent-protected pricing power, rebate contracting and recovery of development and marketing spend, not the cost of the protein.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Weinblatt et al., adalimumab plus methotrexate in rheumatoid arthritis (ARMADA), Arthritis Rheum 2003',
        identifier: '10.1002/art.10697',
        kind: 'doi',
      },
      {
        label: 'Breedveld et al., The PREMIER study, Arthritis Rheum 2006',
        identifier: '10.1002/art.21519',
        kind: 'doi',
      },
      {
        label: 'Bongartz et al., Anti-TNF antibody therapy and the risk of serious infections and malignancies, JAMA 2006',
        identifier: '10.1001/jama.295.19.2275',
        kind: 'doi',
      },
      {
        label: 'Mariette et al., Malignancies associated with TNF inhibitors in registries, Ann Rheum Dis 2011',
        identifier: '10.1136/ard.2010.149419',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA, HUMIRA BLA 125057, original approval 31 December 2002',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125057',
        kind: 'regulatory',
      },
      {
        label: 'US House Committee on Oversight and Reform, AbbVie staff report, May 2021',
        identifier:
          'https://oversightdemocrats.house.gov/imo/media/doc/Committee%20on%20Oversight%20and%20Reform%20-%20AbbVie%20Staff%20Report.pdf',
        kind: 'regulatory',
      },
      MAB_COGS_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Pembrolizumab
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pembrolizumab',
    name: 'Pembrolizumab',
    tradeName: 'Keytruda',
    sponsor: 'Merck & Co (originally Organon / Schering-Plough)',
    targetGene: 'PDCD1',
    targetProtein: 'Programmed Cell Death Protein 1 (PD-1)',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2014,
    indication:
      'Melanoma, non-small-cell lung cancer, head and neck squamous cell carcinoma, classical Hodgkin lymphoma, urothelial, gastric, oesophageal, cervical, hepatocellular, renal cell, triple-negative breast and endometrial carcinoma, plus tissue-agnostic use in MSI-high or mismatch-repair-deficient tumours',
    patientFriendlyIndication: 'Many advanced cancers, by releasing the immune brake on tumour-fighting T cells',
    anatomicalSite: 'Tumour microenvironment and draining lymph nodes',
    conditionContext: {
      conditionExplainer:
        'Tumours survive partly by exhausting the T cells sent to kill them. The tumour displays a protein, PD-L1, that plugs into a receptor called PD-1 on the T cell and switches it off mid-attack.',
      whyItMatters:
        'Before checkpoint blockade, metastatic melanoma had a median survival under a year and essentially no long-term survivors. A minority of patients now live for many years after stopping treatment, which is a different kind of outcome from tumour shrinkage.',
      whoTakesThis:
        'Adults with advanced or metastatic cancer across more than fifteen tumour types, and increasingly in the pre-operative and post-operative setting in melanoma, lung and breast cancer.',
      clinicalGoals:
        'Restore cytotoxic T cell function, achieve durable objective response, and extend overall survival rather than only progression-free survival.',
    },
    oneSentenceVerdict:
      'A humanised IgG4 antibody that unplugs the PD-1 off-switch on T cells, raising 12-month overall survival in advanced melanoma above ipilimumab and doubling median progression-free survival in PD-L1-high lung cancer from 6.0 to 10.3 months.',
    laymanHowItWorks:
      'Your T cells carry a safety catch called PD-1 that stops them attacking your own tissue. Many tumours learn to press that catch and switch the attack off. Pembrolizumab is an antibody that caps the catch so the tumour cannot reach it. It does not attack the cancer itself; it takes the brake off the immune cells that were already trying to.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    substitutes: {
      summary:
        'Nivolumab, cemiplimab and other PD-1 antibodies are mechanistically interchangeable in most settings; PD-L1 antibodies block the same axis from the other side; chemotherapy remains the comparator arm in most registration trials. No dietary intervention has been shown to substitute for checkpoint blockade, and the gut microbiome work that is often quoted is associative rather than interventional.',
      conventionalRx: [
        {
          name: 'Nivolumab (Opdivo)',
          class: 'Anti-PD-1 monoclonal antibody',
          howItCompares:
            'Same target, same axis. No adequately powered head-to-head trial establishes superiority of either in the settings both are approved for.',
          typicalCost: 'Approximately $14,000 - $17,000 / month US list depending on regimen',
          prosAndCons:
            'Pros: broad label, combination data with ipilimumab. Cons: combination regimens carry substantially higher grade 3-4 immune toxicity.',
        },
        {
          name: 'Platinum doublet chemotherapy',
          class: 'Cytotoxic chemotherapy',
          howItCompares:
            'The control arm in KEYNOTE-024. Median progression-free survival was 6.0 months against 10.3 months for pembrolizumab in PD-L1 high tumours.',
          typicalCost: '$1,000 - $5,000 per cycle depending on agents, largely generic',
          prosAndCons:
            'Pros: cheap, fast onset, works irrespective of PD-L1 status. Cons: myelosuppression, neuropathy, no durable tail of long-term survivors.',
        },
        {
          name: 'Atezolizumab / durvalumab',
          class: 'Anti-PD-L1 monoclonal antibody',
          howItCompares:
            'Blocks the ligand rather than the receptor, leaving PD-L2 signalling intact. Broadly similar activity where compared indirectly.',
          typicalCost: 'Approximately $13,000 - $16,000 / month US list',
          prosAndCons:
            'Pros: alternative when PD-1 blockade is not tolerated. Cons: no head-to-head evidence supporting a switch after progression on PD-1 blockade.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Humanised IgG4-kappa with an S228P hinge stabilising mutation',
      molecularWeight: 'Approximately 149 kDa',
      structureSource: {
        label: 'KEYTRUDA (pembrolizumab) US Prescribing Information, Description section',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125514',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'pem-qc',
          stepNumber: 1,
          phase: 'QC',
          name: 'Cell bank and hinge-mutation sequence confirmation',
          description:
            'Verify the S228P hinge substitution at the DNA and peptide level before production, since reversion to wild-type IgG4 would permit Fab-arm exchange and destroy bivalent binding.',
          reagentsAndBuffer: 'Sanger and next-generation sequencing of the heavy chain locus, tryptic peptide map by LC-MS/MS',
        },
        {
          id: 'pem-syn',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch CHO expression',
          description:
            'Production bioreactor run in chemically defined medium with a temperature shift to favour assembly and limit glycation.',
          reagentsAndBuffer: 'Chemically defined CHO medium, glucose-limited feed, 37 degrees C shifting to 33 degrees C',
          dependsOnStepId: 'pem-qc',
        },
        {
          id: 'pem-cap',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture and low-pH viral inactivation',
          description:
            'Capture on alkali-stable Protein A, elute at low pH and hold to inactivate enveloped virus in the same operation.',
          reagentsAndBuffer: 'MabSelect PrismA resin, 0.1 M acetate pH 3.6 elution, 60 minute low-pH hold',
          dependsOnStepId: 'pem-syn',
        },
        {
          id: 'pem-pol',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Multimodal polishing and half-antibody removal',
          description:
            'Remove aggregate, host cell protein and any half-antibody species arising from incomplete hinge disulfide formation.',
          reagentsAndBuffer: 'Capto adhere multimodal resin, hydrophobic interaction step, 20 nm virus filtration',
          dependsOnStepId: 'pem-cap',
        },
        {
          id: 'pem-assay',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'PD-1/PD-L1 blockade reporter bioassay',
          description:
            'Measure potency in a two-cell reporter system where PD-1-expressing Jurkat effector cells and PD-L1-expressing artificial antigen-presenting cells generate luminescence only when the checkpoint is blocked.',
          reagentsAndBuffer: 'PD-1 effector Jurkat/NFAT-luciferase line, PD-L1 aAPC/CHO-K1 line, Bio-Glo luminescent substrate',
          dependsOnStepId: 'pem-pol',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pem-1',
        category: 'measured',
        title: 'KEYNOTE-006: pembrolizumab beat ipilimumab in advanced melanoma',
        laymanSummary:
          'In 834 people with advanced melanoma, roughly 47% were free of progression at six months on pembrolizumab against 26.5% on the previous standard, ipilimumab, with less severe toxicity.',
        technicalDetails:
          'Randomised phase 3, three arms. Estimated 6-month progression-free survival was 47.3% for pembrolizumab every 2 weeks, 46.4% every 3 weeks and 26.5% for ipilimumab (hazard ratio 0.58). Overall survival also favoured pembrolizumab, and grade 3-5 treatment-related events were less frequent than with ipilimumab.',
        evidenceSource: 'Robert et al., New England Journal of Medicine 2015 (KEYNOTE-006, NCT01866319)',
        doi: '10.1056/NEJMoa1503093',
        measuredMetric: '6-month progression-free survival 47.3% versus 26.5%; HR for progression 0.58',
        auditFlag: 'verified',
      },
      {
        id: 'pem-2',
        category: 'measured',
        title: 'KEYNOTE-024: first-line monotherapy beat chemotherapy in PD-L1-high lung cancer',
        laymanSummary:
          'In 305 people with previously untreated advanced lung cancer whose tumours carried PD-L1 on at least half of cells, pembrolizumab alone delayed progression from a median of 6.0 to 10.3 months and extended survival.',
        technicalDetails:
          'Open-label phase 3 with blinded independent central review of the primary endpoint. Median progression-free survival 10.3 versus 6.0 months (hazard ratio 0.50, 95% CI 0.37-0.68, p < 0.001), with longer overall survival and fewer treatment-related adverse events than platinum doublet chemotherapy. Crossover from chemotherapy was permitted, which biases the survival comparison conservatively.',
        evidenceSource: 'Reck et al., New England Journal of Medicine 2016 (KEYNOTE-024, NCT02142738)',
        doi: '10.1056/NEJMoa1606774',
        measuredMetric: 'Median progression-free survival 10.3 versus 6.0 months, HR 0.50',
        auditFlag: 'verified',
      },
      {
        id: 'pem-3',
        category: 'failed',
        title: 'KEYNOTE-183: the FDA halted the myeloma trial because patients on pembrolizumab died sooner',
        laymanSummary:
          'Adding pembrolizumab to standard myeloma treatment made outcomes worse, not better. Regulators stopped the trial in July 2017 after an unplanned interim analysis.',
        technicalDetails:
          'Randomised open-label phase 3 in relapsed or refractory multiple myeloma, 249 patients randomised to pomalidomide and dexamethasone with or without pembrolizumab. Median progression-free survival was 5.6 months with pembrolizumab versus 8.4 months without (hazard ratio 1.53, 95% CI 1.05-2.22). Six-month overall survival was 82% versus 90%. The FDA halted the study on 3 July 2017 on the grounds that risk outweighed benefit. The companion trial KEYNOTE-185 in newly diagnosed myeloma was halted at the same time.',
        evidenceSource: 'Usmani et al., Lancet Haematology 2019 (KEYNOTE-183, NCT02576977)',
        doi: '10.1016/S2352-3026(19)30110-3',
        measuredMetric: 'Median progression-free survival 5.6 versus 8.4 months, HR 1.53 against the experimental arm',
        auditFlag: 'verified',
      },
      {
        id: 'pem-4',
        category: 'inferred',
        title: 'PD-L1 expression is treated as a test that says who will respond',
        laymanSummary:
          'A high PD-L1 score raises the odds of benefit but does not predict it for an individual, and low-scoring tumours still respond. The biomarker enriches a trial population; it does not sort patients into responders and non-responders.',
        technicalDetails:
          'KEYNOTE-024 restricted enrolment to tumour proportion score of 50% or more, which is an enrichment design and cannot establish that the assay predicts individual benefit. PD-L1 immunohistochemistry is subject to assay-to-assay variation, intratumoural heterogeneity and temporal drift between archival and fresh biopsy. Tissue-agnostic approval on microsatellite instability rests on a different and better-defined biomarker.',
        evidenceSource: 'Enrichment design of KEYNOTE-024 and the assay-comparison literature',
        inferredClaim: 'That a PD-L1 tumour proportion score identifies which individual patients will respond',
        auditFlag: 'caution',
      },
      {
        id: 'pem-5',
        category: 'conclusion_shift',
        title: 'From tumour type to tumour genotype: the first tissue-agnostic approval',
        laymanSummary:
          'In 2017 the FDA approved pembrolizumab for any solid tumour with a specific DNA repair defect, regardless of which organ the cancer started in. That broke a century-old convention that cancer drugs are approved by organ of origin.',
        technicalDetails:
          'Accelerated approval for microsatellite-instability-high or mismatch-repair-deficient unresectable or metastatic solid tumours was granted in May 2017 on pooled objective response data across tumour types. The mechanistic rationale is that mismatch repair deficiency generates a high neoantigen burden that checkpoint blockade can exploit. The shift reframed the biomarker, not the antibody.',
        evidenceSource: 'FDA accelerated approval of pembrolizumab for MSI-H/dMMR solid tumours, May 2017',
        auditFlag: 'verified',
      },
      {
        id: 'pem-6',
        category: 'measured',
        title: 'Immune-related toxicity is a distinct and sometimes permanent harm',
        laymanSummary:
          'Taking the brake off the immune system lets it attack healthy organs too. Thyroid failure is usually permanent, and pneumonitis, colitis, hepatitis and hypophysitis can be life-threatening.',
        technicalDetails:
          'The label carries warnings for immune-mediated pneumonitis, colitis, hepatitis, endocrinopathies including hypophysitis, thyroid disorders and type 1 diabetes, nephritis, and severe skin reactions, plus infusion-related reactions and complications of allogeneic haematopoietic stem cell transplantation. Endocrine damage frequently requires lifelong hormone replacement even after the antibody is stopped.',
        evidenceSource: 'KEYTRUDA US Prescribing Information, Warnings and Precautions',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intravenous infusion and distribution to tumour tissue',
        laymanDesc:
          'The antibody is dripped into a vein over half an hour and spreads through the blood and into the fluid around the tumour.',
        molecularDetail:
          'Fixed 200 mg every three weeks or 400 mg every six weeks, with a small volume of distribution of roughly 6 L confined largely to plasma and interstitium, and a terminal half-life near 22 days.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaching exhausted T cells inside the tumour',
        laymanDesc:
          'It travels into the tumour and the lymph nodes draining it, where the T cells that were switched off are waiting.',
        molecularDetail:
          'Convective transport across leaky tumour vasculature delivers IgG into the interstitium. Target-mediated disposition on PD-1-expressing CD8 T cells in tumour and lymphoid tissue contributes to clearance.',
        iconName: 'MapPin',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Capping the PD-1 receptor',
        laymanDesc:
          'Both arms of the antibody clamp over the safety catch on the T cell so the tumour can no longer press it.',
        molecularDetail:
          'Binds the PD-1 extracellular IgV domain with picomolar affinity, sterically occluding both PD-L1 and PD-L2 engagement. The S228P hinge mutation prevents IgG4 Fab-arm exchange that would otherwise create monovalent hybrids.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Inhibitory signalling stops and the T cell re-arms',
        laymanDesc:
          'With the catch capped, the switched-off T cell recovers its ability to divide and kill.',
        molecularDetail:
          'Without PD-1 ligation, SHP-2 is not recruited to the cytoplasmic ITSM, so CD28 and TCR-proximal signalling through PI3K-AKT and RAS-MAPK is no longer dephosphorylated. Effector transcription, IL-2 production and granzyme B release recover.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Tumour killing that can outlast the drug',
        laymanDesc:
          'Restored T cells attack the tumour. In a minority of patients the response continues for years after the last dose, which chemotherapy almost never does.',
        molecularDetail:
          'Clonal expansion of tumour-reactive CD8 T cells with formation of memory populations underlies the long plateau on Kaplan-Meier curves. The IgG4 isotype was chosen precisely because it recruits little ADCC or complement, so the antibody does not destroy the T cells it binds.',
        iconName: 'Sparkles',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'KEYNOTE-006 (NCT01866319)',
        phase: 'Phase 3',
        sampleSize: 834,
        primaryEndpoint: 'Progression-free survival and overall survival versus ipilimumab in advanced melanoma',
        endpointMet: true,
        statisticalPValue: 'p < 0.001 for progression-free survival; HR 0.58',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'KEYNOTE-024 (NCT02142738)',
        phase: 'Phase 3',
        sampleSize: 305,
        primaryEndpoint:
          'Progression-free survival by blinded independent central review, first-line NSCLC with PD-L1 tumour proportion score at least 50%',
        endpointMet: true,
        statisticalPValue: 'p < 0.001; HR 0.50 (95% CI 0.37-0.68)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'KEYNOTE-183 (NCT02576977)',
        phase: 'Phase 3',
        sampleSize: 249,
        primaryEndpoint: 'Progression-free survival and overall survival in relapsed or refractory multiple myeloma',
        endpointMet: false,
        statisticalPValue: 'HR 1.53 (95% CI 1.05-2.22) against the pembrolizumab arm; halted by the FDA',
        unreportedAdverseSignals:
          'Excess deaths in the pembrolizumab arm prompted an unplanned FDA-requested interim analysis and a clinical hold on 3 July 2017.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '6-month progression-free survival of 47.3% versus 26.5% for ipilimumab in advanced melanoma',
        'Median progression-free survival of 10.3 versus 6.0 months in PD-L1-high first-line NSCLC',
        'Objective responses across MSI-high tumours irrespective of organ of origin',
        'Lower grade 3-5 treatment-related toxicity than ipilimumab in melanoma',
      ],
      unsupportedInferences: [
        'That a PD-L1 tumour proportion score predicts individual response rather than enriching a population',
        'That checkpoint blockade helps in any cancer where the immune system is involved; myeloma is the counterexample where it caused harm',
        'That long-term survivors are cured; the plateau on the survival curve is descriptive and the durability threshold has never been prospectively defined',
      ],
      whatFailedInitially: [
        'KEYNOTE-183 and KEYNOTE-185 in multiple myeloma were halted by the FDA in July 2017 for excess mortality',
        'Single-agent activity in microsatellite-stable colorectal cancer and in pancreatic cancer has been minimal despite the tissue-agnostic approval',
      ],
      realWorldOutcome: [
        'A minority of melanoma and lung cancer patients remain progression-free years after stopping treatment, an outcome cytotoxic chemotherapy essentially never produced',
        'Immune-mediated endocrinopathy is often permanent and requires lifelong replacement, which trial adverse-event tables under-represent because they count events, not their duration',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, 30 minutes',
      description:
        'Fixed dosing of 200 mg every 3 weeks or 400 mg every 6 weeks, diluted in saline or dextrose and given through a 0.2-5 micron in-line filter.',
      safetyProfile:
        'Immune-mediated adverse reactions can affect any organ and may appear after treatment stops. Pneumonitis, colitis, hepatitis, endocrinopathies, nephritis and severe cutaneous reactions all carry label warnings. Fatal immune-mediated events have occurred.',
    },
    commonQuestions: [
      {
        q: 'If my tumour is PD-L1 negative, is there any point?',
        a: 'Response rates are lower but not zero, and several approvals cover PD-L1-unselected populations, usually in combination with chemotherapy. The assay enriches for benefit rather than ruling it out. What the trials cannot tell you is your individual probability.',
        auditNote: 'The commonest place where an enrichment biomarker gets read as a predictive test.',
      },
      {
        q: 'How long do I stay on it?',
        a: 'Registration trials generally treated for up to two years or until progression or unacceptable toxicity. Whether shorter treatment would give the same result has not been settled by an adequately powered randomised comparison, and that is an open and expensive question.',
      },
      {
        q: 'Can immunotherapy make a cancer worse?',
        a: 'In multiple myeloma it measurably did. The FDA halted KEYNOTE-183 and KEYNOTE-185 in 2017 because patients receiving pembrolizumab progressed sooner and more died. Hyperprogression in solid tumours has been reported but its definition and existence remain contested.',
        auditNote: 'A page showing only the melanoma and lung results would be an incomplete record.',
      },
      {
        q: 'Do side effects go away when I stop?',
        a: 'Many do. Endocrine damage frequently does not: thyroid failure and hypophysitis usually require permanent hormone replacement. Immune-mediated events can also begin weeks or months after the final dose.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Robert et al., Pembrolizumab versus Ipilimumab in Advanced Melanoma, NEJM 2015',
        identifier: '10.1056/NEJMoa1503093',
        kind: 'doi',
      },
      {
        label: 'Reck et al., Pembrolizumab versus Chemotherapy for PD-L1-Positive NSCLC, NEJM 2016',
        identifier: '10.1056/NEJMoa1606774',
        kind: 'doi',
      },
      {
        label: 'Usmani et al., KEYNOTE-183, Lancet Haematology 2019',
        identifier: '10.1016/S2352-3026(19)30110-3',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov, KEYNOTE-006',
        identifier: 'NCT01866319',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov, KEYNOTE-024',
        identifier: 'NCT02142738',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA, KEYTRUDA BLA 125514, original approval 4 September 2014',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125514',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Nivolumab
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nivolumab',
    name: 'Nivolumab',
    tradeName: 'Opdivo',
    sponsor: 'Bristol Myers Squibb / Ono Pharmaceutical',
    targetGene: 'PDCD1',
    targetProtein: 'Programmed Cell Death Protein 1 (PD-1)',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2014,
    indication:
      'Melanoma, non-small-cell lung cancer, malignant pleural mesothelioma, renal cell carcinoma, classical Hodgkin lymphoma, head and neck squamous cell carcinoma, urothelial carcinoma, colorectal cancer with MSI-H or dMMR, hepatocellular carcinoma, oesophageal and gastric cancer',
    patientFriendlyIndication: 'Advanced cancers, by restoring exhausted immune cells',
    anatomicalSite: 'Tumour microenvironment and tumour-draining lymph nodes',
    conditionContext: {
      conditionExplainer:
        'Cancers persist in part because the T cells that recognise them get switched off. PD-1 on the T cell surface is one of the switches, and tumours or the cells around them supply the ligand that flips it.',
      whyItMatters:
        'Nivolumab was the first PD-1 antibody to show an overall survival benefit in previously treated lung cancer, converting a disease treated with sequential chemotherapy into one where a minority achieve multi-year disease control.',
      whoTakesThis:
        'Adults with advanced disease across a dozen tumour types, alone or combined with ipilimumab, chemotherapy or relatlimab depending on indication.',
      clinicalGoals:
        'Durable objective response and extended overall survival, accepting a defined burden of immune-mediated toxicity.',
    },
    oneSentenceVerdict:
      'A fully human IgG4 antibody against PD-1 that, combined with ipilimumab, produced a median progression-free survival of 11.5 months in untreated metastatic melanoma against 2.9 months for ipilimumab alone.',
    laymanHowItWorks:
      'T cells have an off-switch called PD-1 that healthy tissue uses to say "not me". Tumours copy that signal to shut down the attack. Nivolumab plugs the switch so the tumour cannot send the message. It is the same idea as pembrolizumab, from a different company, discovered in parallel.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 91,
    substitutes: {
      summary:
        'Pembrolizumab targets the same receptor and is broadly interchangeable where both are approved. Ipilimumab blocks a different checkpoint and is usually combined rather than substituted. Chemotherapy remains the comparator in most trials. No dietary or supplement intervention has been shown to substitute for checkpoint blockade.',
      conventionalRx: [
        {
          name: 'Pembrolizumab (Keytruda)',
          class: 'Anti-PD-1 monoclonal antibody',
          howItCompares:
            'Same target, similar affinity, largely overlapping approvals. In first-line PD-L1-high lung cancer pembrolizumab succeeded where nivolumab failed, but the two trials used different PD-L1 thresholds.',
          typicalCost: 'Approximately $15,000 - $18,000 / month US list',
          prosAndCons:
            'Pros: six-weekly dosing option. Cons: no head-to-head trial establishes which is better in shared indications.',
        },
        {
          name: 'Ipilimumab (Yervoy)',
          class: 'Anti-CTLA-4 monoclonal antibody',
          howItCompares:
            'The control arm in CheckMate 067, where it produced median progression-free survival of 2.9 months against 11.5 months for the combination.',
          typicalCost: 'Approximately $30,000 per induction dose US list',
          prosAndCons:
            'Pros: a distinct checkpoint, additive with PD-1 blockade. Cons: grade 3-4 toxicity in over half of patients when combined.',
        },
        {
          name: 'Docetaxel',
          class: 'Cytotoxic taxane chemotherapy',
          howItCompares:
            'The previous second-line standard in non-small-cell lung cancer that nivolumab displaced on overall survival in CheckMate 017 and 057.',
          typicalCost: 'Approximately $200 - $1,500 per cycle, generic',
          prosAndCons:
            'Pros: inexpensive and widely available. Cons: neutropenia, neuropathy, alopecia, and no durable survival plateau.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula: 'Fully human IgG4-kappa immunoglobulin with an S228P hinge mutation',
      molecularWeight: 'Calculated molecular mass 146 kDa',
      structureSource: {
        label: 'OPDIVO (nivolumab) US Prescribing Information, Description section',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125554',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'niv-syn',
          stepNumber: 1,
          phase: 'Synthesis',
          name: 'NS0 murine myeloma expression',
          description:
            'Express the fully human IgG4 in a transfected NS0 murine myeloma line under fed-batch control, then clarify the harvest by centrifugation and depth filtration.',
          reagentsAndBuffer: 'Serum-free NS0 medium, glutamine synthetase selection, methionine sulfoximine',
        },
        {
          id: 'niv-cap',
          stepNumber: 2,
          phase: 'Purification',
          name: 'Protein A capture',
          description: 'Bind IgG4 Fc to Protein A, wash out host cell protein and DNA, and elute at low pH.',
          reagentsAndBuffer: 'Protein A resin, 25 mM Tris pH 7.4 equilibration, 50 mM glycine pH 3.5 elution',
          dependsOnStepId: 'niv-syn',
        },
        {
          id: 'niv-pol',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Viral clearance and aggregate removal',
          description:
            'Low-pH hold for enveloped virus inactivation, anion exchange in flow-through mode for DNA and virus clearance, then size exclusion or hydrophobic interaction to remove aggregate.',
          reagentsAndBuffer: 'pH 3.5 hold, Q Sepharose flow-through, 20 nm parvovirus-retentive filter',
          dependsOnStepId: 'niv-cap',
        },
        {
          id: 'niv-assay',
          stepNumber: 4,
          phase: 'Assay_Quantification',
          name: 'PD-1 binding affinity by surface plasmon resonance',
          description:
            'Immobilise recombinant human PD-1 extracellular domain and measure association and dissociation rate constants against the reference standard for each lot.',
          reagentsAndBuffer: 'CM5 sensor chip, EDC/NHS amine coupling, HBS-EP+ running buffer, 10 mM glycine pH 2.0 regeneration',
          dependsOnStepId: 'niv-pol',
        },
        {
          id: 'niv-qc',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Glycan and charge variant release testing',
          description:
            'Confirm N-glycan profile, charge heterogeneity and aggregate content are within the validated ranges before lot release.',
          reagentsAndBuffer: 'PNGase F released glycans by HILIC-UPLC, imaged capillary isoelectric focusing, SEC-HPLC',
          dependsOnStepId: 'niv-assay',
        },
      ],
    },
    keyAudits: [
      {
        id: 'niv-1',
        category: 'measured',
        title: 'CheckMate 067: combination therapy gave 11.5 months progression-free survival against 2.9',
        laymanSummary:
          'In 945 people with untreated advanced melanoma, nivolumab plus ipilimumab held the disease at bay for a median of 11.5 months compared with 2.9 months on ipilimumab alone.',
        technicalDetails:
          'Randomised, double-blind, three-arm phase 3. Median progression-free survival was 11.5 months (95% CI 8.9-16.7) for the combination versus 6.9 months for nivolumab alone and 2.9 months (95% CI 2.8-3.4) for ipilimumab alone; hazard ratio for the combination versus ipilimumab was 0.42 (99.5% CI 0.31-0.57). The trial was not powered for a formal combination-versus-nivolumab comparison.',
        evidenceSource: 'Larkin et al., New England Journal of Medicine 2015 (CheckMate 067, NCT01844505)',
        doi: '10.1056/NEJMoa1504030',
        measuredMetric: 'Median progression-free survival 11.5 versus 2.9 months, HR 0.42',
        auditFlag: 'verified',
      },
      {
        id: 'niv-2',
        category: 'failed',
        title: 'CheckMate 026: first-line nivolumab in PD-L1-positive lung cancer missed its endpoint',
        laymanSummary:
          'The trial designed to make nivolumab the first treatment for advanced lung cancer failed. Progression-free survival was numerically worse than chemotherapy, and survival was no better.',
        technicalDetails:
          'Open-label phase 3, 541 randomised, primary analysis in the 423 patients with PD-L1 expression of 5% or more. Median progression-free survival 4.2 months with nivolumab versus 5.9 months with platinum chemotherapy (hazard ratio 1.15, 95% CI 0.91-1.45, p = 0.25); median overall survival 14.4 versus 13.2 months (HR 1.02). The contemporaneous KEYNOTE-024 succeeded using a 50% PD-L1 threshold and a different assay, which is the standard explanation but was not tested prospectively.',
        evidenceSource: 'Carbone et al., New England Journal of Medicine 2017 (CheckMate 026, NCT02041533)',
        doi: '10.1056/NEJMoa1613493',
        measuredMetric: 'Median progression-free survival 4.2 versus 5.9 months, HR 1.15, primary endpoint not met',
        auditFlag: 'verified',
      },
      {
        id: 'niv-3',
        category: 'conclusion_shift',
        title: 'The biomarker threshold, not the drug, decided two nearly identical lung cancer trials',
        laymanSummary:
          'Two anti-PD-1 antibodies were tested first-line in lung cancer within a year of each other. One succeeded, one failed. The most cited difference is where each trial drew the PD-L1 cut-off, which is a design choice rather than a property of either molecule.',
        technicalDetails:
          'CheckMate 026 enrolled at a 5% tumour PD-L1 threshold using the Dako 28-8 assay; KEYNOTE-024 enrolled at 50% using the Dako 22C3 assay. The field concluded that the enrolled populations differed rather than the drugs, and subsequent first-line development moved to combination regimens with chemotherapy or ipilimumab. This reading is plausible and widely held but rests on cross-trial comparison, which is not evidence of equivalence.',
        evidenceSource: 'Comparison of CheckMate 026 (NCT02041533) and KEYNOTE-024 (NCT02142738) designs',
        auditFlag: 'contested',
      },
      {
        id: 'niv-4',
        category: 'inferred',
        title: 'The combination is described as more effective when the trial measured more toxicity too',
        laymanSummary:
          'Adding ipilimumab lengthens progression-free survival, but grade 3 or 4 side effects rise steeply and a substantial minority stop treatment because of them. Efficacy summaries often quote the first number without the second.',
        technicalDetails:
          'In CheckMate 067 the combination arm reported treatment-related grade 3-4 adverse events in a majority of patients against roughly a fifth on nivolumab alone, with discontinuation for toxicity far higher. The trial was not statistically powered to compare combination against nivolumab monotherapy, so a claim that the combination is superior to nivolumab alone rests on descriptive comparison.',
        evidenceSource: 'Larkin et al., NEJM 2015, safety analysis and stated statistical plan',
        inferredClaim: 'That the combination is proven superior to nivolumab monotherapy',
        auditFlag: 'caution',
      },
      {
        id: 'niv-5',
        category: 'measured',
        title: 'Second-line lung cancer: the first survival benefit over docetaxel',
        laymanSummary:
          'In previously treated advanced lung cancer, nivolumab extended overall survival compared with docetaxel, the standard chemotherapy of the time, with far less severe toxicity.',
        technicalDetails:
          'CheckMate 017 in squamous and CheckMate 057 in non-squamous histology both showed improved overall survival against docetaxel and supported the March 2015 and October 2015 label expansions. These were the results that established PD-1 blockade in lung cancer before the first-line question was settled.',
        evidenceSource: 'OPDIVO US Prescribing Information, Clinical Studies section',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intravenous infusion at fixed dose',
        laymanDesc: 'Given as a drip over about half an hour, every two, three or four weeks depending on the regimen.',
        molecularDetail:
          'Flat dosing of 240 mg every 2 weeks or 480 mg every 4 weeks, with linear pharmacokinetics, a central volume near 3.6 L and a terminal half-life around 25 days.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Penetration into tumour and lymphoid tissue',
        laymanDesc: 'It leaks out of the leaky vessels that tumours build and accumulates where PD-1-bearing T cells sit.',
        molecularDetail:
          'Interstitial delivery by convection, with target-mediated binding on PD-1-high tumour-infiltrating lymphocytes producing measurable receptor occupancy above 70% at clinical doses.',
        iconName: 'MapPin',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Occupying PD-1 on the T cell surface',
        laymanDesc: 'The antibody sits over the off-switch, so neither of the tumour signals that would flip it can dock.',
        molecularDetail:
          'Binds the PD-1 IgV domain, blocking both PD-L1 and PD-L2. The IgG4 S228P backbone minimises Fc effector function so that PD-1-expressing lymphocytes are not depleted by the antibody that is meant to reactivate them.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Inhibitory phosphatase recruitment stops',
        laymanDesc: 'The chemical brake inside the T cell is no longer applied, and the machinery that had been shut down restarts.',
        molecularDetail:
          'Unligated PD-1 does not recruit SHP-1 and SHP-2 to its ITIM and ITSM motifs, so CD28 and ZAP-70 remain phosphorylated, PI3K-AKT signalling proceeds, and effector gene transcription resumes.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Cytotoxic attack and long-lived memory',
        laymanDesc:
          'Reactivated T cells kill tumour cells and some persist as memory cells, which is why a minority of patients stay in remission long after treatment ends.',
        molecularDetail:
          'Clonal expansion of tumour-reactive CD8 T cells with granzyme and perforin release, interferon-gamma-driven antigen presentation upregulation, and epitope spreading to additional tumour antigens.',
        iconName: 'Sparkles',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CheckMate 067 (NCT01844505)',
        phase: 'Phase 3',
        sampleSize: 945,
        primaryEndpoint: 'Progression-free survival and overall survival in untreated advanced melanoma',
        endpointMet: true,
        statisticalPValue: 'p < 0.001; HR 0.42 (99.5% CI 0.31-0.57) for combination versus ipilimumab',
        unreportedAdverseSignals:
          'Grade 3-4 treatment-related events were markedly more frequent in the combination arm than in either monotherapy arm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CheckMate 026 (NCT02041533)',
        phase: 'Phase 3',
        sampleSize: 541,
        primaryEndpoint:
          'Progression-free survival in first-line NSCLC with PD-L1 expression of 5% or more (423 patients analysed)',
        endpointMet: false,
        statisticalPValue: 'p = 0.25; HR 1.15 (95% CI 0.91-1.45)',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Median progression-free survival of 11.5 months for nivolumab plus ipilimumab against 2.9 months for ipilimumab alone',
        'Overall survival benefit against docetaxel in previously treated squamous and non-squamous NSCLC',
        'Receptor occupancy above 70% on circulating T cells at clinical doses',
      ],
      unsupportedInferences: [
        'That the nivolumab-ipilimumab combination is proven superior to nivolumab alone; CheckMate 067 was not powered for that comparison',
        'That failure of CheckMate 026 proves nivolumab is inferior to pembrolizumab first-line; the trials used different PD-L1 thresholds and assays and were never compared directly',
      ],
      whatFailedInitially: [
        'CheckMate 026 missed its primary progression-free survival endpoint in first-line PD-L1-positive lung cancer',
        'Single-agent activity in microsatellite-stable colorectal cancer, prostate cancer and glioblastoma has been minimal',
      ],
      realWorldOutcome: [
        'Long-term follow-up of CheckMate 067 shows a survival plateau in melanoma sustained beyond five years in a substantial minority',
        'Combination toxicity leads a large fraction of patients to stop early, and many of those still derive durable benefit, which complicates dose-duration reasoning',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, 30 minutes',
      description:
        'Flat-dose infusion of 240 mg every 2 weeks or 480 mg every 4 weeks. A subcutaneous co-formulation with hyaluronidase was approved separately in December 2024.',
      safetyProfile:
        'Immune-mediated pneumonitis, colitis, hepatitis, endocrinopathies, nephritis, dermatological reactions and myocarditis all carry label warnings. Toxicity is substantially higher when combined with ipilimumab.',
    },
    commonQuestions: [
      {
        q: 'Is nivolumab better or worse than pembrolizumab?',
        a: 'Nobody has measured that. There is no adequately powered head-to-head trial in any shared indication. They bind the same receptor with similar affinity, and choice in practice is driven by approved indication, dosing schedule and payer coverage.',
        auditNote: 'A genuine unknown that is frequently answered as though it were settled.',
      },
      {
        q: 'Why add ipilimumab if it is so toxic?',
        a: 'Because it lengthened progression-free survival from 6.9 months on nivolumab alone to 11.5 months in CheckMate 067, and raised the long-term survival plateau in follow-up analyses. The cost is grade 3-4 toxicity in a majority of patients. The trial was not designed to prove the combination beats nivolumab alone statistically, so the trade-off is a clinical judgement made on descriptive data.',
      },
      {
        q: 'Why did nivolumab fail in first-line lung cancer when pembrolizumab succeeded?',
        a: 'The usual explanation is the PD-L1 threshold: CheckMate 026 enrolled at 5% expression, KEYNOTE-024 at 50%. That reading is plausible and widely accepted, but it comes from comparing two separate trials rather than from an experiment that tested it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Larkin et al., Combined Nivolumab and Ipilimumab or Monotherapy in Untreated Melanoma, NEJM 2015',
        identifier: '10.1056/NEJMoa1504030',
        kind: 'doi',
      },
      {
        label: 'Carbone et al., First-Line Nivolumab in Stage IV or Recurrent NSCLC, NEJM 2017',
        identifier: '10.1056/NEJMoa1613493',
        kind: 'doi',
      },
      {
        label: 'ClinicalTrials.gov, CheckMate 067',
        identifier: 'NCT01844505',
        kind: 'nct',
      },
      {
        label: 'ClinicalTrials.gov, CheckMate 026',
        identifier: 'NCT02041533',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA, OPDIVO BLA 125554, original approval 22 December 2014',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125554',
        kind: 'regulatory',
      },
    ],
  },
]
