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
]
