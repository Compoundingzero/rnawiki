import type { SeedDossier } from '@/lib/seed-types'

/**
 * Antisense oligonucleotide flagship dossiers.
 *
 * This modality is the best worked example the product has of the distance between what a trial
 * measured and what the field concluded. Four of the eleven drugs below were approved on a
 * dystrophin surrogate whose functional meaning is still contested; one was approved on a
 * neurofilament biomarker after its clinical endpoint missed; two were withdrawn or refused. The
 * audits say so.
 *
 * Every sequence here was taken from an FDA label section 11, or from a published table that names
 * the compound, and the source is recorded in `structureSource`. Nothing was reconstructed from
 * memory. No pricing block appears on any dossier in this file: no peer-reviewed cost-of-production
 * estimate exists for phosphorothioate or morpholino oligonucleotide manufacture, and inventing one
 * would be worse than leaving the section empty.
 */
export const ASO_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // Nusinersen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nusinersen',
    name: 'Nusinersen',
    tradeName: 'Spinraza',
    sponsor: 'Biogen / Ionis Pharmaceuticals',
    targetGene: 'SMN2',
    targetProtein: 'Survival Motor Neuron protein (SMN)',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2016,
    indication: 'Spinal muscular atrophy (5q SMA) in paediatric and adult patients',
    patientFriendlyIndication: 'Spinal Muscular Atrophy',
    anatomicalSite: 'Spinal cord motor neuron nucleus, reached through the cerebrospinal fluid',
    conditionContext: {
      conditionExplainer:
        'Spinal muscular atrophy is caused by loss of the SMN1 gene. Without enough SMN protein the motor neurons in the spinal cord that drive breathing, swallowing and movement die off, fastest in the first months of life.',
      whyItMatters:
        'Untreated type 1 SMA was, for a century, the most common genetic cause of infant death. In the sham-controlled trial not one control infant reached a new motor milestone, and half of them died or went onto permanent ventilation.',
      whoTakesThis:
        'Infants, children and adults with genetically confirmed 5q SMA, increasingly including babies identified by newborn screening before any symptom appears.',
      clinicalGoals:
        'Raise SMN protein enough to keep surviving motor neurons alive, so that milestones are gained rather than lost and ventilation is delayed or avoided.',
    },
    oneSentenceVerdict:
      'A spliceosome-blocking 18-mer injected into spinal fluid that forces the backup SMN2 gene to make full-length SMN protein; in infantile-onset SMA 51 percent of treated infants reached a new motor milestone against 0 percent of sham controls.',
    laymanHowItWorks:
      'Everyone with SMA has a backup copy of the missing gene, but a single letter difference makes the cell throw away one essential piece of the instructions every time it reads them. Nusinersen is a short synthetic strand that sticks over the exact spot where the discard signal sits, hiding it. The cell then keeps the piece and builds the whole protein. Because the molecule cannot cross from blood into the spinal cord, it has to be injected directly into the fluid around the spine.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    substitutes: {
      summary:
        'Two other SMN-raising drugs exist and both are randomised-trial supported: an oral small molecule and a one-time gene transfer. No food, supplement or exercise raises SMN protein, and anything sold on that claim is unsupported.',
      conventionalRx: [
        {
          name: 'Risdiplam (Evrysdi)',
          class: 'Oral SMN2 splicing modifier (small molecule)',
          howItCompares:
            'Same splicing target, taken by mouth daily instead of by lumbar puncture, and it reaches tissues outside the central nervous system that nusinersen does not.',
          typicalCost: 'About $340,000 / year at US list price',
          prosAndCons:
            'Pros: no repeated spinal punctures, systemic exposure. Cons: daily dosing forever, and no head-to-head randomised trial against nusinersen exists.',
        },
        {
          name: 'Onasemnogene abeparvovec (Zolgensma)',
          class: 'AAV9 gene replacement therapy',
          howItCompares:
            'Delivers a working SMN1 gene once rather than topping up splicing repeatedly. Weight-limited and single-use, because anti-AAV antibodies prevent redosing.',
          typicalCost: 'About $2.1 million as a single infusion at US list price',
          prosAndCons:
            'Pros: one administration. Cons: hepatotoxicity requiring steroid cover, no redosing, and durability beyond the first years is still being measured.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Airway clearance and cough assist',
          action:
            'Mechanical insufflation-exsufflation plus chest physiotherapy during and between respiratory infections.',
          patientImpact:
            'Respiratory failure, not limb weakness, is what kills in type 1 and type 2 SMA. Clearance is the intervention that keeps a chest infection from becoming an intubation.',
          clinicalPrecaution:
            'Set up and supervised by a respiratory team. It supports breathing, it does not change SMN protein levels.',
        },
        {
          name: 'Contracture management and supported standing',
          action:
            'Daily stretching, night splinting and standing frames as part of a physiotherapy programme.',
          patientImpact:
            'Preserves the joint range that any gain in strength has to act through, and loads the skeleton in children who cannot weight-bear.',
          clinicalPrecaution:
            'Aggressive stretching risks fracture in low-bone-density SMA. Prescribed, not improvised.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'TCACTTTCATAATGCTGG',
      molecularWeight: '7,127.32 Da',
      targetReceptorAffinity:
        'Binds the ISS-N1 silencer in SMN2 intron 7; steric block, no RNase H recruitment',
      structureSource: {
        label:
          'Yu et al., Mol Ther Nucleic Acids 2017, Table 1 (ISIS 396443, 18-mer, uniform MOE with PS backbone)',
        identifier: '10.1016/j.omtn.2017.08.012',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming amidite and solid support qualification',
          description:
            'Release-test each 2-prime-O-methoxyethyl phosphoramidite for purity and water content before any coupling. Every sugar in this molecule is MOE-modified, so the thymine positions are 5-methyluridines written in DNA letters.',
          reagentsAndBuffer:
            'MOE-A/G/5-Me-C/5-Me-U phosphoramidites, Karl Fischer titration, anhydrous acetonitrile, unylinker controlled pore glass',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphoramidite elongation with sulfurisation',
          description:
            'Eighteen cycles of detritylation, coupling, sulfurisation and capping on controlled pore glass, sulfurising rather than oxidising at every linkage to build the full phosphorothioate backbone.',
          reagentsAndBuffer:
            '3 percent dichloroacetic acid in toluene, 5-(ethylthio)-1H-tetrazole activator, phenylacetyl disulfide sulfurising reagent, acetic anhydride/N-methylimidazole cap',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange chromatography and tangential-flow desalting',
          description:
            'Resolve the full-length 18-mer from shortmers and from partially oxidised phosphodiester impurities, then exchange into the sodium salt form.',
          reagentsAndBuffer:
            'Concentrated aqueous ammonia cleavage, Source 30Q resin, sodium bromide gradient in 20 mM sodium hydroxide, 3 kDa tangential flow filtration',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Free uptake into SMA patient fibroblasts',
          description:
            'Gymnotic delivery without transfection reagent, which is the route that matches intrathecal exposure, over 4 to 7 days.',
          reagentsAndBuffer:
            'GM03813 SMA type 1 fibroblasts, DMEM with 15 percent foetal bovine serum, no lipofection reagent',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'SMN2 exon 7 inclusion by RT-PCR and SMN protein immunoassay',
          description:
            'Measure the ratio of full-length to exon-7-skipped SMN2 transcript, then confirm the transcript change reaches protein.',
          reagentsAndBuffer:
            'SuperScript IV reverse transcriptase, SMN exon 6/8 flanking primers, capillary electrophoresis, anti-SMN clone 8 immunoassay',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'nus-1',
        category: 'measured',
        title: 'ENDEAR: 51 percent of infants reached a new motor milestone, against 0 percent on sham',
        laymanSummary:
          'In the final analysis of the sham-controlled infant trial, 37 of 73 treated infants gained a motor milestone. None of the 37 control infants did.',
        technicalDetails:
          'Study 1 (NCT02193074) randomised 121 symptomatic infants 2:1 to nusinersen or a sham lumbar procedure. Motor-milestone response was defined on Section 2 of the Hammersmith Infant Neurologic Exam. The trial was stopped early at a pre-specified interim analysis, at which the response rate was 40 percent versus 0 percent.',
        evidenceSource: 'Finkel et al., New England Journal of Medicine 2017 (ENDEAR)',
        doi: '10.1056/NEJMoa1702752',
        measuredMetric: 'Motor-milestone responders: 51 percent nusinersen versus 0 percent sham control',
        auditFlag: 'verified',
      },
      {
        id: 'nus-2',
        category: 'measured',
        title: 'ENDEAR: 47 percent reduction in the risk of death or permanent ventilation',
        laymanSummary:
          'The hard endpoint, not a score: treated infants were significantly less likely to die or end up permanently ventilated.',
        technicalDetails:
          'Time to death or permanent ventilation (at least 16 hours of ventilation per day for more than 21 consecutive days) was the primary endpoint of the final analysis. The label records a 47 percent risk reduction, p=0.005, with a separate significant effect on overall survival.',
        evidenceSource: 'SPINRAZA US prescribing information, section 14.1',
        doi: '10.1056/NEJMoa1702752',
        measuredMetric: 'Death or permanent ventilation: 47 percent risk reduction, p=0.005',
        auditFlag: 'verified',
      },
      {
        id: 'nus-3',
        category: 'measured',
        title: 'CHERISH: 4.9-point HFMSE separation in later-onset SMA',
        laymanSummary:
          'In older children who could already sit, treated children improved on a motor scale while sham-controlled children got worse.',
        technicalDetails:
          'Study 2 (NCT02292537) randomised 126 children 2:1. Least-squares mean change in Hammersmith Functional Motor Scale Expanded at month 15 was +3.9 (95 percent CI 3.0 to 4.9) with nusinersen against -1.0 (95 percent CI -2.5 to 0.5) with sham. 56.8 percent versus 26.3 percent achieved at least a 3-point improvement.',
        evidenceSource: 'Mercuri et al., New England Journal of Medicine 2018 (CHERISH)',
        doi: '10.1056/NEJMoa1710504',
        measuredMetric: 'HFMSE at 15 months: +3.9 versus -1.0, p<0.0001',
        auditFlag: 'verified',
      },
      {
        id: 'nus-4',
        category: 'inferred',
        title: 'Milestone gain is read as "reversal", which the trials did not measure',
        laymanSummary:
          'Nusinersen keeps surviving motor neurons alive. It does not bring back motor neurons that already died, and no trial claims it does.',
        technicalDetails:
          'Both pivotal trials measured change from baseline against a concurrent control in a relentlessly progressive disease. That is a demonstration of slowed or reversed decline in the treated population, not a demonstration that lost anterior horn cells regenerate. Achieved milestones in ENDEAR were dominated by head control (22 percent) and rolling (10 percent); independent sitting was reached by 8 percent and standing by 1 percent.',
        evidenceSource: 'Finkel et al., NEJM 2017, final analysis milestone breakdown',
        doi: '10.1056/NEJMoa1702752',
        inferredClaim:
          'That nusinersen restores normal motor development, or that it is a cure for SMA',
        auditFlag: 'caution',
      },
      {
        id: 'nus-5',
        category: 'conclusion_shift',
        title: 'The field moved to treating before symptoms, on uncontrolled evidence',
        laymanSummary:
          'Newborn screening now sends babies to treatment before any weakness appears. The study behind that shift had no control group.',
        technicalDetails:
          'NURTURE (NCT02386553) is an open-label, single-arm study in presymptomatic infants with two or three SMN2 copies. Its interim results, in which participants were alive without permanent ventilation and most achieved walking, drove practice and screening policy worldwide. It is a strong result against natural history, and it is not a randomised comparison.',
        evidenceSource: 'De Vivo et al., Neuromuscular Disorders 2019 (NURTURE interim)',
        doi: '10.1016/j.nmd.2019.09.007',
        inferredClaim:
          'That presymptomatic superiority over symptomatic treatment has been shown in a controlled trial',
        auditFlag: 'caution',
      },
      {
        id: 'nus-6',
        category: 'conclusion_shift',
        title: 'The approved dose went up, and the comparator was borrowed from an older trial',
        laymanSummary:
          'A higher-dose regimen was added to the label. It was not compared against the original dose head to head, but against a matched sham group pulled from the 2017 infant trial.',
        technicalDetails:
          'Study 4 (NCT04089566, DEVOTE) Part B enrolled 75 infants and compared 50 patients on the high-dose regimen with a pre-specified matched sham group of 20 patients drawn from Study 1, matched on baseline disease duration and CHOP-INTEND score. The separation was large (least-squares mean difference 26.2 points, p<0.0001) and the design is external-control, not concurrent-control.',
        evidenceSource: 'SPINRAZA US prescribing information, section 14, Study 4',
        measuredMetric: 'CHOP-INTEND at day 183: +15.1 high dose versus -11.1 matched sham',
        auditFlag: 'caution',
      },
      {
        id: 'nus-7',
        category: 'failed',
        title: 'It cannot be given by injection into the bloodstream',
        laymanSummary:
          'Phosphorothioate antisense drugs do not cross from blood into the brain and spinal cord. That is why this one needs a lumbar puncture, for life.',
        technicalDetails:
          'Unconjugated 2-prime-MOE phosphorothioate oligonucleotides distribute to liver and kidney after subcutaneous or intravenous dosing and are excluded by the blood-brain barrier. Intrathecal administration was the engineering answer, and it carries the procedural burden and the post-lumbar-puncture adverse event profile recorded in the label. It also leaves the non-neuronal features of severe SMA untreated.',
        evidenceSource: 'SPINRAZA US prescribing information, sections 2 and 12.3',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intrathecal injection into cerebrospinal fluid',
        laymanDesc:
          'The drug is injected through a needle into the fluid-filled space at the base of the spine, because it cannot travel there from the bloodstream.',
        molecularDetail:
          'Bolus injection into the lumbar intrathecal space. The uncharged-carrier-free phosphorothioate distributes rostrally through CSF bulk flow and reaches spinal cord grey matter and cortex, with a CNS tissue half-life of months.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Free uptake into motor neurons',
        laymanDesc:
          'Nerve cells swallow the strand without needing any packaging or carrier around it.',
        molecularDetail:
          'Gymnotic uptake by adsorptive endocytosis, driven by phosphorothioate binding to cell-surface proteins, followed by productive endosomal release into the nucleus where splicing happens.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Masking the ISS-N1 silencer in SMN2 intron 7',
        laymanDesc:
          'It sits directly over the short stretch that tells the cell to throw exon 7 away, physically hiding it.',
        molecularDetail:
          'Watson-Crick hybridisation to nucleotides 10 to 27 of SMN2 intron 7, occluding the intronic splicing silencer N1 and displacing hnRNP A1/A2 from the pre-mRNA.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The spliceosome now keeps exon 7',
        laymanDesc:
          'With the discard signal covered, the cell assembles the instructions with the missing piece included.',
        molecularDetail:
          'Steric block, not cleavage: no RNase H1 is recruited. Loss of hnRNP repression restores U2AF65 and U1 snRNP recognition of the weak exon 7 splice sites, shifting the transcript pool toward full-length SMN2.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Full-length SMN protein, and motor neurons that survive',
        laymanDesc:
          'The cell makes complete, stable SMN protein, and the motor neurons that are still alive keep working.',
        molecularDetail:
          'Full-length SMN oligomerises and assembles the Sm core of snRNPs; the truncated SMN-delta-7 isoform is unstable and degraded. Effect is on surviving alpha motor neurons, which is why treatment timing dominates outcome.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ENDEAR (NCT02193074)',
        phase: 'Phase 3',
        sampleSize: 121,
        primaryEndpoint:
          'Motor-milestone responder rate (HINE Section 2), then time to death or permanent ventilation',
        endpointMet: true,
        statisticalPValue: 'p<0.001 for milestone response; p=0.005 for event-free survival',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CHERISH (NCT02292537)',
        phase: 'Phase 3',
        sampleSize: 126,
        primaryEndpoint: 'Change from baseline in HFMSE total score at month 15',
        endpointMet: true,
        statisticalPValue: 'p<0.0001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DEVOTE Part B (NCT04089566)',
        phase: 'Phase 2/3',
        sampleSize: 75,
        primaryEndpoint:
          'Change from baseline in CHOP-INTEND at day 183, versus a matched sham group drawn from ENDEAR',
        endpointMet: true,
        statisticalPValue: 'p<0.0001',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Motor-milestone response 51 percent versus 0 percent in sham-controlled infantile-onset SMA',
        '47 percent reduction in risk of death or permanent ventilation, p=0.005',
        'HFMSE +3.9 versus -1.0 at 15 months in later-onset SMA',
      ],
      unsupportedInferences: [
        'That motor neurons already lost are restored, rather than surviving ones preserved',
        'That presymptomatic dosing beats symptomatic dosing in a randomised comparison; NURTURE had no control arm',
        'That the high-dose regimen is superior to the original dose; the DEVOTE comparator was a matched sham group from an earlier trial',
      ],
      whatFailedInitially: [
        'Systemic dosing: unconjugated phosphorothioate ASOs do not cross the blood-brain barrier, forcing lifelong intrathecal administration',
        'Non-neuronal disease features in severe SMA are not addressed by a CNS-restricted drug',
      ],
      realWorldOutcome: [
        'Newborn screening for SMA is now routine in many countries, which changed who receives the drug more than the drug changed',
        'Access is rationed by price and by the need for repeat lumbar punctures, and scoliosis surgery complicates administration in older patients',
      ],
    },
    deliverySystem: {
      type: 'Intrathecal injection of a carrier-free 2-prime-MOE phosphorothioate oligonucleotide',
      description:
        'Single-dose glass vials of preservative-free solution given by lumbar puncture after removal of an equivalent volume of cerebrospinal fluid. No lipid nanoparticle and no targeting ligand; the phosphorothioate backbone alone drives cellular uptake.',
      safetyProfile:
        'Adverse reactions in the label are dominated by the procedure rather than the molecule: lower respiratory infection, constipation, headache, back pain and post-lumbar-puncture syndrome. Thrombocytopenia, coagulation abnormality and renal toxicity are class warnings monitored on treatment.',
    },
    commonQuestions: [
      {
        q: 'Does nusinersen cure spinal muscular atrophy?',
        a: 'No. It raises SMN protein in surviving motor neurons and changes the trajectory of the disease. Motor neurons that have already died are not replaced, which is why the same drug produces a much larger effect in a presymptomatic newborn than in an adult with long-standing weakness.',
        auditNote:
          'Both pivotal trials measured change against a concurrent control, not restoration of normal function.',
      },
      {
        q: 'Why does it have to be injected into the spine?',
        a: 'Phosphorothioate antisense drugs given into the blood go to liver and kidney and are stopped at the blood-brain barrier. Injecting into cerebrospinal fluid is the only route that puts the molecule where the motor neurons are.',
      },
      {
        q: 'Is nusinersen better or worse than risdiplam or Zolgensma?',
        a: 'Nobody has measured that. There is no randomised head-to-head trial between any two SMA drugs. Every comparison you will read is either cross-trial, which the trials were not designed to support, or observational.',
        auditNote:
          'Cross-trial comparison of SMA drugs is unreliable: the populations, baseline severity and outcome scales differ.',
      },
      {
        q: 'Does treating adults with long-standing SMA help?',
        a: 'The controlled evidence is in infants and children. Adult use rests on open-label cohorts and registry data showing small mean gains or stabilisation on motor scales, which is a weaker class of evidence than the paediatric trials.',
        auditNote: 'No sham-controlled adult trial supported the original approval.',
      },
      {
        q: 'What happens if treatment stops?',
        a: 'The molecule has a CNS half-life measured in months, so effect decays gradually rather than immediately. No trial has randomised patients to stop, so the shape of that decay in humans has not been measured.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label: 'Finkel et al., Nusinersen versus Sham Control in Infantile-Onset SMA, NEJM 2017',
        identifier: '10.1056/NEJMoa1702752',
        kind: 'doi',
      },
      {
        label: 'Mercuri et al., Nusinersen versus Sham Control in Later-Onset SMA, NEJM 2018',
        identifier: '10.1056/NEJMoa1710504',
        kind: 'doi',
      },
      {
        label: 'De Vivo et al., NURTURE interim analysis, Neuromuscular Disorders 2019',
        identifier: '10.1016/j.nmd.2019.09.007',
        kind: 'doi',
      },
      {
        label: 'Yu et al., Mol Ther Nucleic Acids 2017, Table 1 (ISIS 396443 sequence and mass)',
        identifier: '10.1016/j.omtn.2017.08.012',
        kind: 'doi',
      },
      {
        label: 'SPINRAZA (nusinersen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=dd70cd5f-b0fc-4ba4-a5ea-89a34778bd94',
        kind: 'regulatory',
      },
      {
        label: 'Spinraza EPAR, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/spinraza',
        kind: 'regulatory',
      },
      { label: 'ENDEAR trial registration', identifier: 'NCT02193074', kind: 'nct' },
      { label: 'CHERISH trial registration', identifier: 'NCT02292537', kind: 'nct' },
      { label: 'DEVOTE trial registration', identifier: 'NCT04089566', kind: 'nct' },
      { label: 'NURTURE trial registration', identifier: 'NCT02386553', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Eteplirsen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'eteplirsen',
    name: 'Eteplirsen',
    tradeName: 'Exondys 51',
    sponsor: 'Sarepta Therapeutics',
    targetGene: 'DMD',
    targetProtein: 'Dystrophin',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'Accelerated Approval',
    approvalYear: 2016,
    indication:
      'Duchenne muscular dystrophy in patients with a confirmed DMD mutation amenable to exon 51 skipping',
    patientFriendlyIndication: 'Duchenne Muscular Dystrophy (exon 51 skipping)',
    anatomicalSite: 'Skeletal muscle fibre nucleus',
    conditionContext: {
      conditionExplainer:
        'Duchenne muscular dystrophy is caused by DMD mutations that break the reading frame, so no dystrophin is made. Dystrophin anchors the muscle fibre membrane to the cytoskeleton; without it, every contraction tears the membrane a little.',
      whyItMatters:
        'Boys with Duchenne typically lose walking in their early teens and die of respiratory or cardiac failure. Around 13 percent of them have deletions where skipping exon 51 would restore the reading frame.',
      whoTakesThis:
        'Boys and young men with a genetically confirmed DMD deletion amenable to exon 51 skipping, given weekly by intravenous infusion, usually on top of corticosteroids.',
      clinicalGoals:
        'Produce enough internally truncated dystrophin to slow membrane damage. Whether the amount produced is enough to do that has not been shown.',
    },
    oneSentenceVerdict:
      'An uncharged 30-mer morpholino that makes muscle cells skip a broken exon and produce a shortened dystrophin; after 180 weeks of treatment the measured dystrophin level was 0.93 percent of normal, and the FDA label states that clinical benefit has not been established.',
    laymanHowItWorks:
      'The dystrophin gene is read like a sentence in three-letter words. A deletion can leave a stray letter that throws every following word out of alignment, so the cell gives up and makes nothing. Eteplirsen sticks over one exon so the cell skips it entirely, which realigns the rest of the sentence. The protein that comes out is shorter than normal but, in principle, still functional. The unresolved question is how much of it the drug actually produces.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 32,
    substitutes: {
      summary:
        'Corticosteroids remain the only Duchenne therapy with a long randomised record of preserving ambulation, and they cost a few dollars a month. Exon skipping is additive to them, not a replacement for them.',
      conventionalRx: [
        {
          name: 'Prednisone or prednisolone',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The backbone of Duchenne care for four decades, with randomised evidence for preserving muscle strength and delaying loss of ambulation. Every exon-skipping trial was run on top of it.',
          typicalCost: 'Generic; typically under $30 / month in the US',
          prosAndCons:
            'Pros: cheap, oral, the largest effect size in Duchenne. Cons: weight gain, growth suppression, vertebral fractures and cataracts on long-term use.',
        },
        {
          name: 'Deflazacort (Emflaza)',
          class: 'Systemic corticosteroid (oxazoline derivative of prednisolone)',
          howItCompares:
            'Comparable efficacy to prednisone in the FOR-DMD comparison, with a different side-effect balance: less weight gain, more cataract.',
          typicalCost: 'Branded in the US at tens of thousands of dollars per year',
          prosAndCons:
            'Pros: side-effect profile some families prefer. Cons: US pricing is a large multiple of generic prednisone for a drug available cheaply elsewhere.',
        },
        {
          name: 'Vamorolone (Agamree)',
          class: 'Dissociative steroidal anti-inflammatory',
          howItCompares:
            'Designed to keep the anti-inflammatory effect while sparing bone and growth. Approved in the US in 2023.',
          typicalCost: 'Branded specialty pricing; no generic',
          prosAndCons:
            'Pros: better bone and growth signals than prednisone in trial. Cons: shorter track record and no long-term ambulation data yet.',
        },
      ],
      naturalFoods: [
        {
          name: 'Creatine monohydrate',
          activeCompound: 'Creatine',
          biologicalMechanism:
            'Expands the phosphocreatine pool that buffers ATP during contraction, which is a metabolic support rather than a change to dystrophin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Trials in muscular dystrophy used roughly 3 to 10 g daily depending on body weight',
          monthlyCost: '$10 to $20 / month',
        },
        {
          name: 'Vitamin D with dietary calcium',
          activeCompound: 'Cholecalciferol and calcium',
          biologicalMechanism:
            'Counteracts the bone loss caused by long-term corticosteroids, which is the leading cause of vertebral fracture in Duchenne.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Guideline-directed supplementation with serum 25-OH vitamin D monitoring',
          monthlyCost: '$5 to $15 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Ankle stretching and night splints',
          action: 'Daily passive stretching of the heel cords with overnight ankle-foot orthoses.',
          patientImpact:
            'Delays equinus contracture, which is often what ends walking before quadriceps strength does.',
          clinicalPrecaution:
            'Prescribed and fitted by physiotherapy. Never combined with resisted eccentric exercise, which damages dystrophin-deficient muscle.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'CTCCAACATCAAGGAAGATGGCATTTCTAG',
      chemicalFormula: 'C364H569N177O122P30',
      molecularWeight: '10,305.7 Da',
      targetReceptorAffinity:
        'Binds an exonic splicing enhancer region within DMD exon 51; steric block, uncharged backbone',
      structureSource: {
        label: 'EXONDYS 51 US prescribing information section 11, cross-checked against Ali et al. 2025 Table 1',
        identifier: '10.1007/s10974-024-09688-2',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Morpholino subunit release testing',
          description:
            'Qualify each activated morpholino subunit for purity and for absence of the base-modified impurities that cause deletion sequences in a 30-mer.',
          reagentsAndBuffer:
            'Base-protected morpholino chlorophosphoramidates, anhydrous dichloromethane, reverse-phase HPLC with UV detection at 260 nm',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphorodiamidate coupling, 30 cycles',
          description:
            'Sequential coupling on a disulfide-anchored aminomethylpolystyrene support. The backbone is phosphorodiamidate rather than phosphate, so the finished oligomer carries no net charge.',
          reagentsAndBuffer:
            'Morpholino chlorophosphoramidate monomers, N-ethylmorpholine base, N-methylpyrrolidone, trifluoroacetic acid detritylation cocktail',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange and reverse-phase purification',
          description:
            'A neutral oligomer cannot be resolved by anion exchange, so purification runs on the terminal basic amine and on hydrophobicity instead.',
          reagentsAndBuffer:
            'Concentrated ammonia cleavage at 45 C, Source 30S cation-exchange resin, potassium chloride gradient, C18 reverse-phase polish',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Nucleofection into patient-derived myoblasts',
          description:
            'Morpholinos have poor free uptake, so cell work uses electroporation. This is the step that most poorly models the intravenous route in a patient.',
          reagentsAndBuffer:
            'Exon 48-50 deleted patient myoblasts, Amaxa nucleofection buffer, differentiation medium with 2 percent horse serum',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Exon 51 skipping by RT-PCR and dystrophin by validated western blot',
          description:
            'Quantify the skipped transcript, then quantify protein against a healthy-muscle standard curve. Sub-1-percent dystrophin quantification is the assay at the centre of this drug dispute.',
          reagentsAndBuffer:
            'Exon 50/52 flanking primers, capillary electrophoresis, anti-dystrophin MANDYS106, alpha-actinin loading control, healthy control muscle dilution series',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ete-1',
        category: 'measured',
        title: 'Dystrophin reached 0.93 percent of normal after 180 weeks',
        laymanSummary:
          'Eleven boys had a muscle biopsy after three and a half years of treatment. Their average dystrophin was under one percent of a healthy person.',
        technicalDetails:
          'Study 2, the open-label extension of the 12-patient randomised study, biopsied 11 patients at week 180. The label records an average dystrophin protein level of 0.93 percent of the level in healthy subjects, measured by Sarepta western blot. Baseline dystrophin was not available for Study 1 patients, so the increase attributable to treatment could not be estimated from that study.',
        evidenceSource: 'EXONDYS 51 US prescribing information, sections 12.2 and 14',
        doi: '10.1089/nat.2016.0657',
        measuredMetric: 'Mean dystrophin 0.93 percent of normal at week 180, n=11',
        auditFlag: 'verified',
      },
      {
        id: 'ete-2',
        category: 'measured',
        title: 'Study 3: dystrophin rose from 0.16 to 0.44 percent of normal, median change 0.1 percent',
        laymanSummary:
          'In the only study with before-and-after biopsies, the average went from 0.16 percent to 0.44 percent. The median boy gained 0.1 percent.',
        technicalDetails:
          'Thirteen patients were treated open-label for 48 weeks with biopsies at baseline and week 48. In the 12 evaluable patients the mean was 0.16 +/- 0.12 percent before and 0.44 +/- 0.43 percent after, p=0.008. The distribution is what matters: individual changes ranged from -0.07 to +1.33 percent, and the median change was 0.1 percent.',
        evidenceSource: 'EXONDYS 51 US prescribing information, section 14, Table 2',
        measuredMetric: 'Dystrophin 0.16 percent to 0.44 percent of normal at 48 weeks, p=0.008',
        auditFlag: 'verified',
      },
      {
        id: 'ete-3',
        category: 'inferred',
        title: 'Sub-1-percent dystrophin is read as clinical benefit, and the label says otherwise',
        laymanSummary:
          'The drug was approved because it raises dystrophin, not because it was shown to help boys walk. The prescribing information states this in plain words.',
        technicalDetails:
          'Accelerated approval rested on dystrophin as a surrogate reasonably likely to predict benefit. The label states that a clinical benefit of EXONDYS 51, including improved motor function, has not been established, and that Study 2 failed to provide evidence of a clinical benefit compared with the external control group. Whether 0.44 percent of normal dystrophin is above any therapeutic threshold has never been established; Becker muscular dystrophy phenotypes are typically associated with levels an order of magnitude higher.',
        evidenceSource: 'EXONDYS 51 US prescribing information, section 1 and section 14',
        doi: '10.7326/M23-1073',
        inferredClaim:
          'That an increase to roughly 0.4 to 0.9 percent of normal dystrophin slows Duchenne muscular dystrophy',
        auditFlag: 'contested',
      },
      {
        id: 'ete-4',
        category: 'conclusion_shift',
        title: 'The FDA review division rejected it; the Center Director approved it anyway',
        laymanSummary:
          'The reviewers who assessed the application said no. The head of the drugs centre overruled them, and the Commissioner let that stand.',
        technicalDetails:
          'The clinical reviewer and the Office of Drug Evaluation I director recommended against approval, as did the agency acting chief scientist. The CDER Center Director concluded that the dystrophin increase was reasonably likely to predict benefit and approved under the accelerated pathway in September 2016; the Commissioner declined to overturn that decision on formal dispute. The Center Director decisional memorandum is a public document and the disagreement is on the record.',
        evidenceSource:
          'Aartsma-Rus and Krieg, Nucleic Acid Therapeutics 2017; FDA Center Director decisional memorandum, NDA 206488',
        doi: '10.1089/nat.2016.0657',
        auditFlag: 'contested',
      },
      {
        id: 'ete-5',
        category: 'failed',
        title: 'The confirmatory trial lost its control group',
        laymanSummary:
          'PROMOVI was meant to compare treated boys against untreated boys. The untreated group turned out not to be comparable, so the comparison was made against historical data instead.',
        technicalDetails:
          'PROMOVI (NCT02255552) enrolled 79 eteplirsen-treated patients amenable to exon 51 skipping and 30 untreated patients who were not amenable. Only 15 of 30 untreated patients completed. The publication states the cohort was an inappropriate control because of genotype-driven differences in clinical trajectory, and functional comparisons were made post hoc against external natural-history controls instead.',
        evidenceSource: 'McDonald et al., Journal of Neuromuscular Diseases 2021 (PROMOVI)',
        doi: '10.3233/JND-210643',
        auditFlag: 'contested',
      },
      {
        id: 'ete-6',
        category: 'failed',
        title: 'The European Medicines Agency refused authorisation twice',
        laymanSummary:
          'Europe looked at the same dossier and said the evidence did not support approval, then said it again on re-examination.',
        technicalDetails:
          'The CHMP adopted a negative opinion on 31 May 2018 and confirmed the refusal on re-examination on 20 September 2018. Eteplirsen has therefore never been authorised in the European Union, which makes the transatlantic split on identical data one of the clearest natural experiments in surrogate-endpoint regulation.',
        evidenceSource: 'European Medicines Agency, Exondys refusal of marketing authorisation',
        auditFlag: 'verified',
      },
      {
        id: 'ete-7',
        category: 'inferred',
        title: 'Long-term survival benefit rests on external comparison, not randomisation',
        laymanSummary:
          'A study reported that treated boys lived longer than historical controls. Nobody was randomised, so the two groups may have differed in ways nobody measured.',
        technicalDetails:
          'An 8-year follow-up analysis compared survival in eteplirsen-treated patients against natural-history controls. Treated patients were, by construction, those whose families obtained and stayed on an expensive weekly infusion, which is correlated with access to specialist care, ventilatory support and cardiac management. That confounding is not removable by matching on the covariates that were recorded.',
        evidenceSource: 'Iff et al., Muscle and Nerve 2024',
        doi: '10.1002/mus.28075',
        inferredClaim: 'That eteplirsen extends survival in Duchenne muscular dystrophy',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly intravenous infusion',
        laymanDesc:
          'The drug goes in through a vein once a week, usually through a long-term line because the schedule never stops.',
        molecularDetail:
          'Uncharged phosphorodiamidate morpholino oligomer given as an isotonic phosphate-buffered infusion. Plasma clearance is rapid and largely renal; most of an administered dose is excreted within hours.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Entry into muscle fibres, inefficiently',
        laymanDesc:
          'Only a small fraction of what is infused ever reaches the inside of a muscle cell nucleus.',
        molecularDetail:
          'The neutral backbone that makes PMOs nuclease-resistant also denies them the protein-binding-driven uptake that charged phosphorothioates use. Uptake into mature myofibres is poor and is thought to depend partly on membrane damage in dystrophic muscle.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising to exon 51 of dystrophin pre-mRNA',
        laymanDesc:
          'It binds directly over the exon the cell is supposed to leave out, masking the signals that recruit it.',
        molecularDetail:
          'Watson-Crick pairing to a 30-nucleotide site within DMD exon 51, occluding an exonic splicing enhancer and preventing SR-protein-dependent exon definition.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The spliceosome skips the exon and restores the reading frame',
        laymanDesc:
          'The cell splices exon 50 straight to exon 52, which puts the rest of the instructions back into alignment.',
        molecularDetail:
          'Exon 51 is excluded from the mature transcript. In patients with deletions such as 48-50 or 52, exclusion restores an in-frame junction, allowing translation through to the C-terminal dystroglycan-binding domain.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'A shortened dystrophin appears at the sarcolemma, in trace amounts',
        laymanDesc:
          'Some internally shortened dystrophin does show up at the muscle membrane. The measured quantity is a fraction of one percent of normal.',
        molecularDetail:
          'Immunohistochemistry shows sarcolemmal localisation of the truncated isoform, and western blot quantifies it at 0.44 to 0.93 percent of healthy muscle. Whether that quantity restores the dystrophin-glycoprotein complex sufficiently to reduce contraction-induced injury is unresolved.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 201/202 (NCT01396239 and NCT01540409)',
        phase: 'Phase 2',
        sampleSize: 12,
        primaryEndpoint:
          'Dystrophin production at week 24, with 6-minute walk distance versus placebo assessed alongside',
        endpointMet: false,
        statisticalPValue:
          'No significant difference in 6-minute walk distance; baseline dystrophin unavailable so production could not be estimated',
        unreportedAdverseSignals:
          'Four patients per arm at randomisation; the label notes crude adverse-event frequencies that may not reflect practice at this sample size',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Study 301 biopsy study',
        phase: 'Phase 3 (open label)',
        sampleSize: 13,
        primaryEndpoint: 'Change in muscle dystrophin protein by western blot at week 48',
        endpointMet: true,
        statisticalPValue: 'p=0.008',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'PROMOVI (NCT02255552)',
        phase: 'Phase 3 (open label)',
        sampleSize: 109,
        primaryEndpoint:
          'Change in 6-minute walk distance at week 96 versus a concurrent untreated cohort not amenable to exon 51 skipping',
        endpointMet: false,
        statisticalPValue:
          'Not reported as a significant concurrent comparison; the untreated cohort was judged an inappropriate control',
        unreportedAdverseSignals:
          'Only 15 of 30 untreated participants completed, against 78 of 79 treated participants',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Exon 51 skipping is detectable by RT-PCR in treated muscle',
        'Dystrophin 0.93 percent of normal at week 180 in 11 biopsied patients',
        'Dystrophin 0.16 percent to 0.44 percent of normal over 48 weeks, p=0.008, median change 0.1 percent',
      ],
      unsupportedInferences: [
        'That this quantity of dystrophin slows loss of ambulation; the label states clinical benefit has not been established',
        'That the 6-minute walk comparisons against external natural-history cohorts are equivalent to randomised evidence',
        'That survival is extended, which rests on a non-randomised comparison with historical controls',
      ],
      whatFailedInitially: [
        'The randomised 12-patient study showed no significant 6-minute walk separation',
        'PROMOVI lost its concurrent control cohort to genotype-driven non-comparability',
        'The EMA refused marketing authorisation in 2018 and confirmed the refusal on re-examination',
      ],
      realWorldOutcome: [
        'Approved and widely used in the United States, never authorised in the European Union, on the same evidence base',
        'Weekly lifelong infusion, usually through a central line, is a substantial burden on families',
        'The approval is still the reference case cited in every argument about accelerated approval on surrogate endpoints',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of an uncharged phosphorodiamidate morpholino oligomer',
      description:
        'Single-dose vials diluted into saline and infused weekly over 35 to 60 minutes. No lipid carrier, no targeting ligand, and no chemical modification to improve muscle uptake.',
      safetyProfile:
        'The most common adverse reactions in the randomised study were balance disorder and vomiting, at crude frequencies from a 12-patient trial. Hypersensitivity reactions are labelled. The dominant real-world risks come from long-term central venous access rather than from the molecule.',
    },
    commonQuestions: [
      {
        q: 'Has eteplirsen been shown to help boys walk for longer?',
        a: 'No. The FDA label states that a clinical benefit, including improved motor function, has not been established, and that the open-label extension failed to show benefit against its external control. The functional claims you will read come from post-hoc comparisons with historical cohorts.',
        auditNote: 'This sentence is in the prescribing information itself, not an outside critique.',
      },
      {
        q: 'Is 0.44 percent of normal dystrophin a meaningful amount?',
        a: 'Nobody has established the threshold. People with Becker muscular dystrophy, who have milder disease, generally carry dystrophin well above that level. What the trials measured was that the number moved, not that it crossed any line where muscle stops being damaged.',
        auditNote: 'The threshold question is exactly what the FDA reviewers disagreed about.',
      },
      {
        q: 'Why is it approved in the United States and not in Europe?',
        a: 'Two regulators reached opposite conclusions on the same data. The FDA accepted dystrophin as a surrogate reasonably likely to predict benefit; the CHMP did not, refused authorisation in May 2018 and confirmed that refusal in September 2018.',
      },
      {
        q: 'Does it work for every boy with Duchenne?',
        a: 'No. It only applies to mutations where removing exon 51 restores the reading frame, which is roughly 13 percent of Duchenne patients. A boy with a different deletion gets nothing from this drug.',
      },
      {
        q: 'Should a family stop corticosteroids if they start eteplirsen?',
        a: 'That question has not been studied and the trials were all run on top of stable corticosteroid dosing. Steroids carry the strongest randomised evidence in Duchenne; exon skipping was never tested as a replacement for them.',
        auditNote: 'Every eteplirsen study required a stable corticosteroid dose at entry.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'EXONDYS 51 (eteplirsen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=33bff678-7829-479e-9110-b8e33a0bc0aa',
        kind: 'regulatory',
      },
      {
        label:
          'Aartsma-Rus and Krieg, FDA Approves Eteplirsen for DMD: The Next Chapter in the Eteplirsen Saga, Nucleic Acid Therapeutics 2017',
        identifier: '10.1089/nat.2016.0657',
        kind: 'doi',
      },
      {
        label:
          'McDonald et al., Open-Label Evaluation of Eteplirsen in DMD Amenable to Exon 51 Skipping (PROMOVI), J Neuromuscul Dis 2021',
        identifier: '10.3233/JND-210643',
        kind: 'doi',
      },
      {
        label:
          'Iff et al., Survival among patients receiving eteplirsen for up to 8 years, Muscle and Nerve 2024',
        identifier: '10.1002/mus.28075',
        kind: 'doi',
      },
      {
        label:
          'Fleming and Powers, The Regulatory Repercussions of Approving Muscular Dystrophy Medications on the Basis of Limited Evidence, Annals of Internal Medicine 2023',
        identifier: '10.7326/M23-1073',
        kind: 'doi',
      },
      {
        label:
          'Ali et al., Progress and prospects in ASO-mediated exon skipping for DMD, J Muscle Res Cell Motil 2025, Table 1',
        identifier: '10.1007/s10974-024-09688-2',
        kind: 'doi',
      },
      {
        label: 'Exondys refusal of marketing authorisation, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/exondys',
        kind: 'regulatory',
      },
      { label: 'PROMOVI trial registration', identifier: 'NCT02255552', kind: 'nct' },
      { label: 'Study 201 trial registration', identifier: 'NCT01396239', kind: 'nct' },
      { label: 'Study 202 extension registration', identifier: 'NCT01540409', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Golodirsen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'golodirsen',
    name: 'Golodirsen',
    tradeName: 'Vyondys 53',
    sponsor: 'Sarepta Therapeutics',
    targetGene: 'DMD',
    targetProtein: 'Dystrophin',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'Accelerated Approval',
    approvalYear: 2019,
    indication:
      'Duchenne muscular dystrophy in patients with a confirmed DMD mutation amenable to exon 53 skipping',
    patientFriendlyIndication: 'Duchenne Muscular Dystrophy (exon 53 skipping)',
    anatomicalSite: 'Skeletal muscle fibre nucleus',
    conditionContext: {
      conditionExplainer:
        'Around 8 percent of Duchenne mutations sit where removing exon 53 would put the reading frame back together. Golodirsen is one of two approved drugs that do that; the other is viltolarsen.',
      whyItMatters:
        'Duchenne is uniformly progressive. A drug that restores even partial dystrophin production is the only class that addresses the cause rather than the inflammation downstream of it.',
      whoTakesThis:
        'Boys and young men with an exon-53-amenable DMD deletion, by weekly intravenous infusion, on top of corticosteroids.',
      clinicalGoals:
        'Produce internally truncated dystrophin. The confirmatory trial that was supposed to show this changes function reported in 2026 and missed its primary endpoint.',
    },
    oneSentenceVerdict:
      'A 25-mer morpholino for exon 53 skipping that raised muscle dystrophin from 0.10 to 1.02 percent of normal in 25 boys, and whose confirmatory trial reported in 2026 with no significant functional separation from placebo.',
    laymanHowItWorks:
      'Golodirsen covers exon 53 of the dystrophin instructions so the cell leaves it out. For boys whose deletion sits next to exon 53, that realigns the reading frame and lets a shortened dystrophin be built. The measured amount of protein produced is around one percent of a healthy person, and the trial designed to show whether that changes how boys move did not find a difference.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 30,
    substitutes: {
      summary:
        'Viltolarsen targets the same exon in the same patients and is the direct alternative. Corticosteroids remain the therapy with the strongest randomised evidence in Duchenne and cost a fraction as much.',
      conventionalRx: [
        {
          name: 'Viltolarsen (Viltepso)',
          class: 'Phosphorodiamidate morpholino oligomer, exon 53',
          howItCompares:
            'Same exon, same patient group, a 21-mer instead of a 25-mer. Reported dystrophin was 5.9 percent of normal against golodirsen 1.02 percent, but the two were measured with different assays and normalisation, so the numbers are not comparable.',
          typicalCost: 'Branded specialty pricing; both are weekly infusions',
          prosAndCons:
            'Pros: an alternative if one is unavailable. Cons: its confirmatory trial, RACER53, also missed its primary endpoint.',
        },
        {
          name: 'Prednisone or deflazacort',
          class: 'Systemic corticosteroid',
          howItCompares:
            'Decades of randomised evidence for preserving strength and delaying loss of ambulation. Every exon-skipping trial ran on top of it.',
          typicalCost: 'Generic prednisone typically under $30 / month in the US',
          prosAndCons:
            'Pros: cheapest intervention with the largest measured effect in Duchenne. Cons: bone loss, growth suppression, weight gain, cataract.',
        },
      ],
      naturalFoods: [
        {
          name: 'Creatine monohydrate',
          activeCompound: 'Creatine',
          biologicalMechanism:
            'Increases intramuscular phosphocreatine, buffering ATP during contraction. It supports energetics and does nothing to dystrophin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Muscular dystrophy trials used roughly 3 to 10 g daily by body weight',
          monthlyCost: '$10 to $20 / month',
        },
        {
          name: 'Vitamin D with dietary calcium',
          activeCompound: 'Cholecalciferol and calcium',
          biologicalMechanism:
            'Offsets corticosteroid-driven bone loss, the direct cause of vertebral fracture in steroid-treated Duchenne.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Guideline-directed dosing with serum 25-OH vitamin D monitoring',
          monthlyCost: '$5 to $15 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Daily heel-cord stretching with night splints',
          action: 'Passive ankle dorsiflexion stretching plus overnight ankle-foot orthoses.',
          patientImpact:
            'Delays the equinus contracture that commonly ends independent walking before strength alone would.',
          clinicalPrecaution:
            'Physiotherapy-supervised. Eccentric or resisted exercise damages dystrophin-deficient muscle and is contraindicated.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'GTTGCCTCCGGTTCTGAAGGTGTTC',
      chemicalFormula: 'C305H481N138O112P25',
      molecularWeight: '8,647.28 Da',
      targetReceptorAffinity: 'Binds a 25-nucleotide site in DMD exon 53; steric block, uncharged backbone',
      structureSource: {
        label: 'VYONDYS 53 US prescribing information, section 11 (sequence stated in the label text)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=35c227d1-5b24-44b0-b5d3-f0f6b1c46bd5',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Subunit and support qualification',
          description:
            'Release-test the activated morpholino subunits and the polystyrene support before a 25-cycle build, where a single bad subunit propagates into every downstream failure sequence.',
          reagentsAndBuffer:
            'Base-protected morpholino chlorophosphoramidates, anhydrous dichloromethane, reverse-phase HPLC at 260 nm',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphorodiamidate coupling, 25 cycles',
          description:
            'Iterative detritylation and coupling on a disulfide-anchored aminomethylpolystyrene support to build the neutral 25-mer.',
          reagentsAndBuffer:
            'Morpholino chlorophosphoramidate monomers, N-ethylmorpholine, N-methylpyrrolidone, trifluoroacetic acid detritylation cocktail',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange purification and reverse-phase polish',
          description:
            'The oligomer carries no backbone charge, so separation runs on the terminal basic amine and hydrophobicity rather than on anion exchange.',
          reagentsAndBuffer:
            'Ammonia cleavage at 45 C, Source 30S resin, potassium chloride gradient, C18 polish, lyophilisation',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Nucleofection into exon-53-amenable myoblasts',
          description:
            'Electroporation into patient myoblasts differentiated to myotubes. Free uptake of a neutral oligomer is poor, which is why the in vitro model overstates delivery.',
          reagentsAndBuffer:
            'Exon 52-deleted patient myoblasts, Amaxa nucleofection buffer, differentiation medium with 2 percent horse serum',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Exon 53 skipping by RT-PCR and dystrophin by western blot',
          description:
            'Quantify skipped transcript, then dystrophin against a healthy-muscle dilution series. The assay is the load-bearing element of this drug approval and its normalisation choice changes the answer.',
          reagentsAndBuffer:
            'Exon 52/54 flanking primers, capillary electrophoresis, anti-dystrophin antibody with alpha-actinin loading control, healthy muscle standard curve',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gol-1',
        category: 'measured',
        title: 'Dystrophin rose from 0.10 to 1.02 percent of normal at week 48',
        laymanSummary:
          'Twenty-five boys were biopsied before treatment and again after 48 weeks. Their average dystrophin went from a tenth of a percent to about one percent of normal.',
        technicalDetails:
          'Study 1 (NCT02310906) Part 2 biopsied all 25 treated patients at baseline and week 48. Mean dystrophin was 0.10 percent (SD 0.07) at baseline and 1.02 percent (SD 1.03) at week 48, mean change 0.92 percent (SD 1.01), p<0.001, median change 0.88 percent. Individual week-48 values in the label range from 0.09 to 4.30 percent.',
        evidenceSource: 'VYONDYS 53 US prescribing information, section 14, Table 2',
        doi: '10.1212/WNL.0000000000009233',
        measuredMetric: 'Mean dystrophin 0.10 percent to 1.02 percent of normal, p<0.001, n=25',
        auditFlag: 'verified',
      },
      {
        id: 'gol-2',
        category: 'measured',
        title: 'Exon 53 skipping increased about 16-fold over baseline',
        laymanSummary:
          'The mechanism was confirmed directly: treated muscle showed far more of the skipped transcript, and the extra protein appeared at the right place on the muscle membrane.',
        technicalDetails:
          'Blinded RT-PCR showed a significant increase in exon 53 skipping, associated with an approximately 16-fold increase over baseline in dystrophin protein at week 48. Immunohistochemistry showed increased dystrophin-positive fibres (p<0.001) and correlated with western blot (Spearman r=0.663, p<0.001).',
        evidenceSource: 'Frank et al., Neurology 2020',
        doi: '10.1212/WNL.0000000000009233',
        measuredMetric: 'Approximately 16-fold increase over baseline dystrophin at week 48',
        auditFlag: 'verified',
      },
      {
        id: 'gol-3',
        category: 'failed',
        title: 'ESSENCE, the confirmatory trial, missed its primary endpoint',
        laymanSummary:
          'The randomised trial that was supposed to prove the drug helps boys move reported in 2026. There was no significant difference from placebo.',
        technicalDetails:
          'ESSENCE (NCT02500381) randomised 212 ambulatory patients to golodirsen or casimersen versus placebo over 96 weeks. The primary endpoint, change in 4-step ascend velocity, gave a least-squares mean difference of 0.06 steps per second (95 percent CI -0.05 to 0.16, p=0.309). Secondary functional measures including the 6-minute walk test, 10-metre walk/run and North Star Ambulatory Assessment favoured treatment numerically without reaching significance. Dystrophin expression again increased significantly.',
        evidenceSource:
          'Muntoni et al., ESSENCE phase 3 topline results, MDA Clinical and Scientific Conference 2026',
        measuredMetric: '4-step ascend velocity: LSM difference 0.06 steps/s, 95 percent CI -0.05 to 0.16, p=0.309',
        auditFlag: 'contested',
      },
      {
        id: 'gol-4',
        category: 'inferred',
        title: 'One percent of normal dystrophin is treated as a therapeutic level',
        laymanSummary:
          'Nobody has established how much dystrophin a muscle needs before it stops being damaged. The approval assumed that more is better without knowing where the line is.',
        technicalDetails:
          'Accelerated approval was granted on dystrophin as a surrogate reasonably likely to predict clinical benefit. The distribution matters as much as the mean: in the label table, 7 of 25 patients ended below 0.25 percent of normal at week 48. With the confirmatory functional endpoint now missed, the surrogate-to-outcome link is unsupported by randomised evidence.',
        evidenceSource: 'VYONDYS 53 US prescribing information, section 1 and Table 2',
        doi: '10.7326/M23-1073',
        inferredClaim:
          'That raising dystrophin to about 1 percent of normal slows functional decline in Duchenne',
        auditFlag: 'contested',
      },
      {
        id: 'gol-5',
        category: 'conclusion_shift',
        title: 'Rejected in August 2019 on safety, approved four months later',
        laymanSummary:
          'The FDA first refused the application over kidney toxicity seen in animals and over infections from long-term infusion lines. After a formal dispute, the same agency approved it in December 2019.',
        technicalDetails:
          'A complete response letter issued on 19 August 2019 cited risk of infections related to vascular access ports and renal toxicity observed in mice, rats and monkeys. The sponsor filed a formal dispute resolution request. Approval followed on 12 December 2019, with renal toxicity retained as a labelled warning and no new clinical safety data resolving the animal finding.',
        evidenceSource: 'FDA summary review, NDA 211970; Sarepta approval announcement December 2019',
        auditFlag: 'caution',
      },
      {
        id: 'gol-6',
        category: 'inferred',
        title: 'Cross-drug dystrophin comparisons with viltolarsen are not valid',
        laymanSummary:
          'Viltolarsen reports 5.9 percent and golodirsen reports 1.02 percent for the same exon. That gap is mostly assay, not biology.',
        technicalDetails:
          'Golodirsen was quantified by Sarepta western blot against a healthy-muscle standard; viltolarsen was quantified by western blot normalised to myosin heavy chain, with mass spectrometry normalised to filamin C as a secondary measure. Different antibodies, different normalisation proteins and different standard curves. No head-to-head study has ever measured the two drugs on one assay.',
        evidenceSource:
          'VYONDYS 53 and VILTEPSO US prescribing information, section 14 methods statements',
        inferredClaim: 'That viltolarsen produces roughly six times more dystrophin than golodirsen',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly intravenous infusion',
        laymanDesc: 'Given into a vein once a week, indefinitely.',
        molecularDetail:
          'Uncharged 25-mer PMO in isotonic phosphate-buffered saline. Distribution is broad but muscle uptake is a small fraction of dose; most drug is cleared renally within hours.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into muscle fibre nuclei',
        laymanDesc:
          'A small proportion of the drug crosses into muscle cells and reaches the nucleus, where splicing happens.',
        molecularDetail:
          'Neutral backbone gives nuclease resistance at the cost of the protein-binding uptake route available to phosphorothioates. Dystrophic membrane fragility is thought to contribute to what uptake there is.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising across exon 53',
        laymanDesc: 'It pairs with exon 53 in the dystrophin instructions and masks it.',
        molecularDetail:
          'Watson-Crick pairing to a 25-nucleotide site within DMD exon 53, blocking exonic splicing enhancer recognition and preventing exon definition.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Exon 53 is spliced out and the frame is restored',
        laymanDesc:
          'The cell joins the exons on either side, which realigns the reading frame for the right deletions.',
        molecularDetail:
          'Exclusion of exon 53 produces an in-frame junction in patients with deletions such as 52, 45-52 or 50-52, permitting translation through the cysteine-rich and C-terminal domains.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Truncated dystrophin at the sarcolemma, around one percent of normal',
        laymanDesc:
          'Shortened dystrophin does appear at the right place in the muscle membrane, in about one hundredth of the normal quantity.',
        molecularDetail:
          'Immunohistochemistry confirms sarcolemmal localisation; western blot quantifies the mean at 1.02 percent of healthy muscle. Whether this reconstitutes enough dystrophin-glycoprotein complex to reduce contraction-induced injury remains unmeasured.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 4053-101 (NCT02310906)',
        phase: 'Phase 1/2',
        sampleSize: 25,
        primaryEndpoint:
          'Change from baseline in muscle dystrophin protein by western blot at week 48 of Part 2',
        endpointMet: true,
        statisticalPValue: 'p<0.001',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ESSENCE (NCT02500381)',
        phase: 'Phase 3',
        sampleSize: 212,
        primaryEndpoint: 'Change from baseline in 4-step ascend velocity at week 96 versus placebo',
        endpointMet: false,
        statisticalPValue: 'p=0.309 (LSM difference 0.06 steps/s, 95 percent CI -0.05 to 0.16)',
        unreportedAdverseSignals:
          'None new reported through week 144; the trial pooled golodirsen and casimersen arms for the primary comparison',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Exon 53 skipping increases in treated muscle, confirmed by blinded RT-PCR',
        'Mean dystrophin 0.10 percent to 1.02 percent of normal at week 48, p<0.001',
        'Sarcolemmal localisation of the truncated protein by immunohistochemistry, correlated with western blot',
      ],
      unsupportedInferences: [
        'That around 1 percent of normal dystrophin translates into slower functional decline',
        'That viltolarsen is more potent because it reports a higher percentage; the assays differ',
      ],
      whatFailedInitially: [
        'The FDA issued a complete response letter in August 2019 over renal toxicity in animals and vascular-access infection risk',
        'ESSENCE, the confirmatory randomised trial, missed its primary functional endpoint in 2026',
      ],
      realWorldOutcome: [
        'Remains marketed in the United States under accelerated approval while conversion to full approval is sought',
        'The sponsor has stated it will file for full approval on the missed trial plus real-world evidence, which is itself a live regulatory question',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of an uncharged phosphorodiamidate morpholino oligomer',
      description:
        'Single-dose vials diluted into saline, infused weekly over 35 to 60 minutes. No carrier and no targeting ligand; long-term venous access is usual.',
      safetyProfile:
        'Labelled warning for renal toxicity based on nonclinical findings, with monitoring of serum cystatin C, urine dipstick and urine protein-to-creatinine ratio. Hypersensitivity reactions labelled. Common adverse reactions include headache, pyrexia, cough, abdominal pain and nausea.',
    },
    commonQuestions: [
      {
        q: 'Did the confirmatory trial show golodirsen works?',
        a: 'No. ESSENCE reported in 2026 and its primary endpoint, 4-step ascend velocity at 96 weeks, showed no significant difference from placebo. Dystrophin again rose significantly, which is the same surrogate result the accelerated approval was already based on.',
        auditNote:
          'A confirmatory trial that reproduces the surrogate but misses the clinical endpoint does not confirm clinical benefit.',
      },
      {
        q: 'Why does viltolarsen report 5.9 percent dystrophin and golodirsen 1.02 percent?',
        a: 'Because the two were measured with different antibodies, different normalisation proteins and different standard curves. The numbers cannot be placed on one axis. No study has measured both drugs on the same assay.',
      },
      {
        q: 'Why was it rejected in August 2019 and approved in December 2019?',
        a: 'The complete response letter cited renal toxicity seen in animal studies and infection risk from the indwelling ports used for weekly infusion. The sponsor pursued formal dispute resolution and the drug was approved four months later, with renal toxicity carried into the label as a warning.',
      },
      {
        q: 'Should a boy on golodirsen stop corticosteroids?',
        a: 'That has never been studied. Every golodirsen participant was on a stable corticosteroid dose for at least six months before entry, so the trials measured the drug added to steroids, not instead of them.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'VYONDYS 53 (golodirsen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=35c227d1-5b24-44b0-b5d3-f0f6b1c46bd5',
        kind: 'regulatory',
      },
      {
        label: 'Frank et al., Increased dystrophin production with golodirsen in DMD, Neurology 2020',
        identifier: '10.1212/WNL.0000000000009233',
        kind: 'doi',
      },
      {
        label:
          'Muntoni et al., Efficacy and Safety of Golodirsen and Casimersen versus Placebo (ESSENCE): phase 3 topline results, MDA 2026',
        identifier:
          'https://www.mdaconference.org/abstract-library/efficacy-and-safety-of-golodirsen-and-casimersen-compared-with-placebo-in-duchenne-muscular-dystrophy-essence-phase-3-topline-results/',
        kind: 'url',
      },
      {
        label:
          'FDA summary review, NDA 211970 (golodirsen), including the August 2019 complete response letter',
        identifier: 'https://www.accessdata.fda.gov/drugsatfda_docs/nda/2019/211970Orig1s000SumR.pdf',
        kind: 'regulatory',
      },
      {
        label:
          'Fleming and Powers, Regulatory Repercussions of Approving Muscular Dystrophy Medications on Limited Evidence, Ann Intern Med 2023',
        identifier: '10.7326/M23-1073',
        kind: 'doi',
      },
      { label: 'Study 4053-101 registration', identifier: 'NCT02310906', kind: 'nct' },
      { label: 'ESSENCE trial registration', identifier: 'NCT02500381', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Casimersen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'casimersen',
    name: 'Casimersen',
    tradeName: 'Amondys 45',
    sponsor: 'Sarepta Therapeutics',
    targetGene: 'DMD',
    targetProtein: 'Dystrophin',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'Accelerated Approval',
    approvalYear: 2021,
    indication:
      'Duchenne muscular dystrophy in patients with a confirmed DMD mutation amenable to exon 45 skipping',
    patientFriendlyIndication: 'Duchenne Muscular Dystrophy (exon 45 skipping)',
    anatomicalSite: 'Skeletal muscle fibre nucleus',
    conditionContext: {
      conditionExplainer:
        'About 8 percent of Duchenne mutations are amenable to exon 45 skipping. Casimersen is the only approved drug for that group.',
      whyItMatters:
        'Exon-skipping drugs are mutation-specific. For a family whose son is exon-45 amenable, this is the only approved agent that targets the cause.',
      whoTakesThis:
        'Boys and young men with an exon-45-amenable DMD deletion, by weekly intravenous infusion, on top of corticosteroids.',
      clinicalGoals:
        'Restore some dystrophin production. Whether that changes the course of the disease was tested in ESSENCE and not demonstrated.',
    },
    oneSentenceVerdict:
      'A 22-mer morpholino for exon 45 skipping approved on an interim biopsy result in which treated dystrophin rose 0.81 percentage points against 0.22 in placebo; the same trial missed its functional primary endpoint five years later.',
    laymanHowItWorks:
      'Casimersen masks exon 45 so the cell leaves it out of the dystrophin instructions, which realigns the reading frame for boys whose deletion sits next to it. The trial biopsied muscle at 48 weeks and found more dystrophin in the treated group than in the placebo group. It also found that the placebo group had more dystrophin than at its own baseline, which is a useful reminder of how much noise there is at these levels.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 29,
    substitutes: {
      summary:
        'No other approved drug skips exon 45, so there is no like-for-like alternative. Corticosteroids remain the therapy with the largest randomised effect in Duchenne, at a tiny fraction of the cost.',
      conventionalRx: [
        {
          name: 'Prednisone or prednisolone',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The only Duchenne therapy with a long randomised record of preserving strength and delaying loss of ambulation. Casimersen was tested on top of it, never instead of it.',
          typicalCost: 'Generic; typically under $30 / month in the US',
          prosAndCons:
            'Pros: cheap, oral, largest measured effect. Cons: fractures, growth suppression, weight gain, cataract.',
        },
        {
          name: 'Deflazacort (Emflaza)',
          class: 'Systemic corticosteroid',
          howItCompares:
            'Comparable efficacy to prednisone with less weight gain and more cataract in comparative trial data.',
          typicalCost: 'Branded in the US at tens of thousands of dollars per year',
          prosAndCons:
            'Pros: side-effect profile some families prefer. Cons: US price bears no relation to the cost of the molecule.',
        },
        {
          name: 'Ataluren (Translarna, EU only)',
          class: 'Ribosomal readthrough agent',
          howItCompares:
            'Applies only to nonsense mutations, not deletions, so it is not an alternative for the same patients. Included because families frequently ask.',
          typicalCost: 'Branded specialty pricing in the EU; never approved in the United States',
          prosAndCons:
            'Pros: oral. Cons: different mutation class entirely, and its own confirmatory evidence has been contested.',
        },
      ],
      naturalFoods: [
        {
          name: 'Creatine monohydrate',
          activeCompound: 'Creatine',
          biologicalMechanism:
            'Raises intramuscular phosphocreatine and buffers ATP during contraction. Metabolic support, not a dystrophin effect.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Muscular dystrophy trials used roughly 3 to 10 g daily by body weight',
          monthlyCost: '$10 to $20 / month',
        },
        {
          name: 'Vitamin D with dietary calcium',
          activeCompound: 'Cholecalciferol and calcium',
          biologicalMechanism:
            'Directly counters corticosteroid-driven bone loss, the cause of vertebral fracture in steroid-treated Duchenne.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Guideline-directed dosing with serum 25-OH vitamin D monitoring',
          monthlyCost: '$5 to $15 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Heel-cord stretching and night splinting',
          action: 'Daily passive ankle stretching with overnight ankle-foot orthoses.',
          patientImpact:
            'Preserves the ankle range that walking depends on, often the limiting factor before quadriceps strength.',
          clinicalPrecaution:
            'Physiotherapy-led. Resisted eccentric exercise injures dystrophin-deficient muscle and should be avoided.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'CAATGCCATCCTGGAGTTCCTG',
      chemicalFormula: 'C268H424N124O95P22',
      molecularWeight: '7,584.5 Da',
      targetReceptorAffinity: 'Binds a 22-nucleotide site in DMD exon 45; steric block, uncharged backbone',
      structureSource: {
        label: 'AMONDYS 45 US prescribing information, section 11 (sequence stated in the label text)',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e9e5fd44-eeda-4580-bba1-a734828bbcc3',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Morpholino subunit qualification',
          description:
            'Release-test activated subunits and support before a 22-cycle build; impurity carried into cycle 1 appears in every failure sequence downstream.',
          reagentsAndBuffer:
            'Base-protected morpholino chlorophosphoramidates, anhydrous dichloromethane, reverse-phase HPLC at 260 nm',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphorodiamidate coupling, 22 cycles',
          description:
            'Sequential coupling on aminomethylpolystyrene, producing a backbone with no net charge at physiological pH.',
          reagentsAndBuffer:
            'Morpholino chlorophosphoramidate monomers, N-ethylmorpholine, N-methylpyrrolidone, trifluoroacetic acid detritylation cocktail',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange purification and desalting',
          description:
            'Purify on the terminal basic amine rather than backbone charge, then desalt and lyophilise.',
          reagentsAndBuffer:
            'Ammonia cleavage at 45 C, Source 30S resin, potassium chloride gradient, C18 polish, lyophilisation',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Nucleofection into exon-45-amenable myotubes',
          description:
            'Electroporation into patient-derived myoblasts differentiated to myotubes, because neutral oligomers take up poorly on their own.',
          reagentsAndBuffer:
            'Exon 46-47 deleted patient myoblasts, Amaxa nucleofection buffer, differentiation medium with 2 percent horse serum',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Exon 45 skipping by RT-PCR and dystrophin by western blot',
          description:
            'Quantify skipped transcript and then protein against a healthy-muscle standard curve, with placebo-arm samples processed in the same batch so assay drift is visible.',
          reagentsAndBuffer:
            'Exon 44/46 flanking primers, capillary electrophoresis, anti-dystrophin antibody with loading control, healthy muscle dilution series',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cas-1',
        category: 'measured',
        title: 'Interim ESSENCE biopsies: dystrophin 0.93 to 1.74 percent of normal',
        laymanSummary:
          'Twenty-seven treated boys were biopsied at 48 weeks. Their average dystrophin nearly doubled, and the difference from placebo was statistically significant.',
        technicalDetails:
          'Interim results from 43 evaluable patients in Study 1 (NCT02500381), 27 on casimersen and 16 on placebo. Casimersen mean dystrophin rose from 0.93 percent (SD 1.67) to 1.74 percent (SD 1.97) of normal, change 0.81 percent (SD 0.70), p<0.001. Between-group mean difference 0.59, p=0.004.',
        evidenceSource: 'AMONDYS 45 US prescribing information, section 14, Table 2',
        measuredMetric: 'Between-group dystrophin difference 0.59 percentage points, p=0.004',
        auditFlag: 'verified',
      },
      {
        id: 'cas-2',
        category: 'measured',
        title: 'The placebo arm gained dystrophin too',
        laymanSummary:
          'Boys who received no drug at all also showed more dystrophin at 48 weeks than at baseline. That is the size of the noise the treatment effect has to be read against.',
        technicalDetails:
          'The label records placebo dystrophin rising from 0.54 percent (SD 0.79) at baseline to 0.76 percent (SD 1.15) at week 48, a mean change of 0.22 percent (SD 0.49), p=0.09. The standard deviations exceed the means in both arms. Quantifying a protein at one percent of normal in a needle biopsy of a heterogeneous, fibrotic muscle is a hard measurement, and the placebo drift is the honest measure of that difficulty.',
        evidenceSource: 'AMONDYS 45 US prescribing information, section 14, Table 2',
        measuredMetric: 'Placebo arm dystrophin change +0.22 percentage points (SD 0.49), p=0.09',
        auditFlag: 'caution',
      },
      {
        id: 'cas-3',
        category: 'failed',
        title: 'ESSENCE missed its functional primary endpoint',
        laymanSummary:
          'The same trial that produced the biopsy result ran to completion. On the endpoint that mattered, how fast boys could climb four steps, there was no difference from placebo.',
        technicalDetails:
          'ESSENCE randomised 212 ambulatory patients across the casimersen and golodirsen arms versus placebo for 96 weeks. Primary endpoint change in 4-step ascend velocity gave a least-squares mean difference of 0.06 steps per second (95 percent CI -0.05 to 0.16, p=0.309). Secondary functional endpoints favoured treatment numerically without significance; dystrophin expression again rose significantly.',
        evidenceSource:
          'Muntoni et al., ESSENCE phase 3 topline results, MDA Clinical and Scientific Conference 2026',
        measuredMetric: '4-step ascend velocity: LSM difference 0.06 steps/s, p=0.309',
        auditFlag: 'contested',
      },
      {
        id: 'cas-4',
        category: 'inferred',
        title: 'A 0.59 percentage point dystrophin difference is read as disease modification',
        laymanSummary:
          'The approval assumed that a small increase in dystrophin predicts a clinical benefit. The trial that tested that assumption did not find one.',
        technicalDetails:
          'Accelerated approval in February 2021 rested entirely on the interim biopsy result, with the confirmatory functional data still years away. With ESSENCE now reported, the surrogate has been reproduced and the clinical link has not been demonstrated. The label already stated that continued approval may be contingent on verification of clinical benefit.',
        evidenceSource: 'AMONDYS 45 US prescribing information, section 1',
        doi: '10.7326/M23-1073',
        inferredClaim: 'That a 0.59 percentage point dystrophin gain slows Duchenne muscular dystrophy',
        auditFlag: 'contested',
      },
      {
        id: 'cas-5',
        category: 'conclusion_shift',
        title: 'Full approval is now being sought on a trial that missed its endpoint',
        laymanSummary:
          'Rather than withdraw, the sponsor has said it will apply to convert the conditional approval into a full one, using the failed trial plus a decade of real-world use.',
        technicalDetails:
          'Following ESSENCE completion the sponsor announced it would submit supplemental applications seeking conversion of the accelerated approvals for casimersen and golodirsen to traditional approval, supported by ESSENCE data alongside published real-world evidence. Whether a missed primary endpoint plus observational data can satisfy a confirmatory requirement is an open regulatory question, not a settled one.',
        evidenceSource: 'Sarepta Therapeutics regulatory update on AMONDYS 45 and VYONDYS 53, 2026',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly intravenous infusion',
        laymanDesc: 'Delivered into a vein once a week, without interruption.',
        molecularDetail:
          'Uncharged 22-mer PMO in isotonic phosphate-buffered saline. Rapid renal clearance; muscle uptake is a small fraction of the administered dose.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into muscle fibre nuclei',
        laymanDesc: 'Some of the drug crosses into muscle cells and reaches the nucleus.',
        molecularDetail:
          'Neutral phosphorodiamidate backbone resists nucleases but forfeits the protein-binding uptake pathway used by charged phosphorothioates.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising across exon 45',
        laymanDesc: 'It pairs with exon 45 and hides the signals that tell the cell to include it.',
        molecularDetail:
          'Watson-Crick pairing to a 22-nucleotide site in DMD exon 45, occluding exonic splicing enhancer elements and blocking exon definition.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Exon 45 is spliced out and the frame is restored',
        laymanDesc: 'The neighbouring exons are joined, which realigns the rest of the instructions.',
        molecularDetail:
          'Exclusion of exon 45 creates an in-frame junction in patients with deletions such as 46-47, 46-48 or 44, allowing translation of an internally truncated dystrophin.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Truncated dystrophin at the sarcolemma, around 1.7 percent of normal',
        laymanDesc:
          'A shortened dystrophin appears at the muscle membrane in small amounts, measurably more than in untreated muscle.',
        molecularDetail:
          'Mean week-48 western blot value 1.74 percent of healthy muscle, with a between-group difference of 0.59 percentage points. Whether this reconstitutes enough dystrophin-glycoprotein complex to change fibre mechanics is untested.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ESSENCE interim biopsy analysis (NCT02500381)',
        phase: 'Phase 3 interim',
        sampleSize: 43,
        primaryEndpoint:
          'Change from baseline in muscle dystrophin protein at week 48, casimersen versus placebo',
        endpointMet: true,
        statisticalPValue: 'p=0.004 between groups',
        unreportedAdverseSignals:
          'Placebo-arm dystrophin also rose by 0.22 percentage points, with standard deviations larger than the means in both arms',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ESSENCE final analysis (NCT02500381)',
        phase: 'Phase 3',
        sampleSize: 212,
        primaryEndpoint: 'Change from baseline in 4-step ascend velocity at week 96 versus placebo',
        endpointMet: false,
        statisticalPValue: 'p=0.309 (LSM difference 0.06 steps/s, 95 percent CI -0.05 to 0.16)',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dystrophin rose from 0.93 to 1.74 percent of normal in treated patients at week 48',
        'Between-group dystrophin difference 0.59 percentage points, p=0.004',
        'Placebo dystrophin also drifted upward by 0.22 percentage points over the same period',
      ],
      unsupportedInferences: [
        'That the measured dystrophin difference predicts slower loss of function',
        'That percentage-of-normal dystrophin values are comparable across the four approved exon-skipping drugs',
      ],
      whatFailedInitially: [
        'ESSENCE missed its primary functional endpoint at 96 weeks',
        'The single-drug arm was pooled with golodirsen for the primary comparison, so a casimersen-specific functional estimate was never the trial primary',
      ],
      realWorldOutcome: [
        'Still marketed in the United States under accelerated approval with conversion to full approval being sought',
        'It remains the only approved option for exon-45-amenable patients, which shapes how families weigh a missed endpoint',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of an uncharged phosphorodiamidate morpholino oligomer',
      description:
        'Single-dose vials diluted into saline and infused weekly over 35 to 60 minutes. No carrier system; sustained venous access is usual.',
      safetyProfile:
        'Renal toxicity is a labelled warning based on nonclinical findings with other PMOs, monitored by serum cystatin C and urine protein-to-creatinine ratio. Hypersensitivity reactions labelled. Common adverse reactions include upper respiratory tract infection, cough, pyrexia, headache, arthralgia and oropharyngeal pain.',
    },
    commonQuestions: [
      {
        q: 'Did casimersen improve how boys move?',
        a: 'Not on the trial primary endpoint. ESSENCE measured 4-step ascend velocity at 96 weeks and found no significant difference from placebo. The dystrophin result that supported approval was reproduced; the functional result was not demonstrated.',
        auditNote: 'Reproducing a surrogate is not the same as confirming a benefit.',
      },
      {
        q: 'Why did the placebo group also show more dystrophin?',
        a: 'Quantifying dystrophin at around one percent of normal in a needle biopsy is at the edge of what the assay can resolve, and muscle is heterogeneous. The 0.22 percentage point placebo drift is the measurement noise made visible, which is why the between-group comparison rather than the within-group change is the meaningful number.',
      },
      {
        q: 'Is there any other approved drug for exon-45 mutations?',
        a: 'No. Casimersen is the only one, which is why the risk-benefit conversation for these families is different from one where alternatives exist.',
      },
      {
        q: 'Will the FDA withdraw the approval now that the confirmatory trial missed?',
        a: 'Nobody can answer that yet. The sponsor has said it will instead seek conversion to full approval using the trial data together with real-world evidence. That application, and how the agency treats a missed confirmatory endpoint, is unresolved as of August 2026.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'AMONDYS 45 (casimersen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e9e5fd44-eeda-4580-bba1-a734828bbcc3',
        kind: 'regulatory',
      },
      {
        label:
          'Muntoni et al., Efficacy and Safety of Golodirsen and Casimersen versus Placebo (ESSENCE): phase 3 topline results, MDA 2026',
        identifier:
          'https://www.mdaconference.org/abstract-library/efficacy-and-safety-of-golodirsen-and-casimersen-compared-with-placebo-in-duchenne-muscular-dystrophy-essence-phase-3-topline-results/',
        kind: 'url',
      },
      {
        label:
          'Ali et al., Progress and prospects in ASO-mediated exon skipping for DMD, J Muscle Res Cell Motil 2025, Table 1',
        identifier: '10.1007/s10974-024-09688-2',
        kind: 'doi',
      },
      {
        label:
          'Fleming and Powers, Regulatory Repercussions of Approving Muscular Dystrophy Medications on Limited Evidence, Ann Intern Med 2023',
        identifier: '10.7326/M23-1073',
        kind: 'doi',
      },
      { label: 'ESSENCE trial registration', identifier: 'NCT02500381', kind: 'nct' },
    ],
  },
]
