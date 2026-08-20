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

  // ---------------------------------------------------------------------------------------------
  // Viltolarsen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'viltolarsen',
    name: 'Viltolarsen',
    tradeName: 'Viltepso',
    sponsor: 'NS Pharma / Nippon Shinyaku',
    targetGene: 'DMD',
    targetProtein: 'Dystrophin',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'Accelerated Approval',
    approvalYear: 2020,
    indication:
      'Duchenne muscular dystrophy in patients with a confirmed DMD mutation amenable to exon 53 skipping',
    patientFriendlyIndication: 'Duchenne Muscular Dystrophy (exon 53 skipping)',
    anatomicalSite: 'Skeletal muscle fibre nucleus',
    conditionContext: {
      conditionExplainer:
        'Viltolarsen targets the same exon as golodirsen, in the same roughly 8 percent of Duchenne patients whose deletion sits next to exon 53.',
      whyItMatters:
        'It reported the highest dystrophin percentage of any approved exon-skipping drug, which made it the strongest available test of whether dystrophin percentage predicts function. Its confirmatory trial then failed.',
      whoTakesThis:
        'Boys aged four and above with an exon-53-amenable DMD deletion, by weekly intravenous infusion, on a stable corticosteroid regimen.',
      clinicalGoals:
        'Produce truncated dystrophin and slow motor decline. The first was measured; the second was tested in RACER53 and not shown.',
    },
    oneSentenceVerdict:
      'A 21-mer morpholino for exon 53 that produced the highest reported dystrophin of any approved exon-skipping drug, 5.9 percent of normal in 16 boys, and then failed its randomised confirmatory trial on time to stand from supine.',
    laymanHowItWorks:
      'Viltolarsen is a shorter version of the same idea as golodirsen: cover exon 53 so the cell leaves it out and the reading frame lines up again. The 16-boy study reported dystrophin at about six percent of normal, several times higher than the other exon 53 drug. When a proper randomised trial of 77 boys then measured how quickly they could stand up from the floor, the treated and placebo groups both improved and there was no difference between them.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 28,
    substitutes: {
      summary:
        'Golodirsen targets the same exon in the same patients. Corticosteroids remain the intervention with the strongest randomised evidence in Duchenne, and the cheapest by orders of magnitude.',
      conventionalRx: [
        {
          name: 'Golodirsen (Vyondys 53)',
          class: 'Phosphorodiamidate morpholino oligomer, exon 53',
          howItCompares:
            'Same exon, a 25-mer instead of a 21-mer, weekly infusion. Reported dystrophin 1.02 percent versus 5.9 percent, but measured on a different assay with different normalisation.',
          typicalCost: 'Branded specialty pricing; both are lifelong weekly infusions',
          prosAndCons:
            'Pros: an alternative agent for the same mutation group. Cons: its confirmatory trial, ESSENCE, also missed its primary endpoint.',
        },
        {
          name: 'Prednisone or deflazacort',
          class: 'Systemic corticosteroid',
          howItCompares:
            'The comparator that every exon-skipping trial was layered on top of, with randomised evidence for preserving strength and delaying loss of ambulation.',
          typicalCost: 'Generic prednisone typically under $30 / month in the US',
          prosAndCons:
            'Pros: largest measured effect, negligible cost. Cons: fractures, growth suppression, cataract, weight gain.',
        },
      ],
      naturalFoods: [
        {
          name: 'Creatine monohydrate',
          activeCompound: 'Creatine',
          biologicalMechanism:
            'Expands the phosphocreatine buffer available during contraction. Supports energetics; does not alter dystrophin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Muscular dystrophy trials used roughly 3 to 10 g daily by body weight',
          monthlyCost: '$10 to $20 / month',
        },
        {
          name: 'Vitamin D with dietary calcium',
          activeCompound: 'Cholecalciferol and calcium',
          biologicalMechanism:
            'Counters corticosteroid-driven bone loss, which drives vertebral fracture risk in Duchenne.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Guideline-directed dosing with serum 25-OH vitamin D monitoring',
          monthlyCost: '$5 to $15 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Heel-cord stretching and night splinting',
          action: 'Daily passive ankle dorsiflexion stretching with overnight orthoses.',
          patientImpact:
            'Maintains the ankle range that standing and walking depend on, which is what the RACER53 primary endpoint was measuring.',
          clinicalPrecaution:
            'Physiotherapy-supervised. Avoid resisted eccentric loading, which damages dystrophin-deficient muscle.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'CCTCCGGTTCTGAAGGTGTTC',
      chemicalFormula: 'C244H381N113O88P20',
      molecularWeight: '6,924.82 Da',
      targetReceptorAffinity: 'Binds a 21-nucleotide site in DMD exon 53; steric block, uncharged backbone',
      structureSource: {
        label:
          'Ali et al., J Muscle Res Cell Motil 2025, Table 1 (FDA-approved DMD exon-skipping ASO sequences); mass and formula from the VILTEPSO label section 11',
        identifier: '10.1007/s10974-024-09688-2',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Subunit qualification and identity confirmation',
          description:
            'Release-test morpholino subunits and confirm the 21-mer target sequence against the exon 53 annotation before synthesis.',
          reagentsAndBuffer:
            'Base-protected morpholino chlorophosphoramidates, anhydrous dichloromethane, reverse-phase HPLC at 260 nm',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase phosphorodiamidate coupling, 21 cycles',
          description:
            'Iterative coupling on aminomethylpolystyrene. The shorter oligomer gives a higher full-length yield than the 25-mer built for the same exon.',
          reagentsAndBuffer:
            'Morpholino chlorophosphoramidate monomers, N-ethylmorpholine, N-methylpyrrolidone, trifluoroacetic acid detritylation cocktail',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange purification and formulation into saline',
          description:
            'Purify on the terminal amine, desalt, then formulate directly into 0.9 percent sodium chloride as the finished product is supplied.',
          reagentsAndBuffer:
            'Ammonia cleavage at 45 C, Source 30S resin, potassium chloride gradient, 0.9 percent sodium chloride, pH 7.0 to 7.5',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Nucleofection into exon-53-amenable myotubes',
          description:
            'Electroporate into patient myoblasts and differentiate, then compare skipping efficiency against the 25-mer covering the same region.',
          reagentsAndBuffer:
            'Exon 52-deleted patient myoblasts, Amaxa nucleofection buffer, differentiation medium with 2 percent horse serum',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Dystrophin by western blot normalised to myosin heavy chain, and by mass spectrometry',
          description:
            'Two orthogonal quantifications with different normalisers. This pairing is what makes viltolarsen dystrophin numbers non-comparable to the Sarepta western blot values.',
          reagentsAndBuffer:
            'Anti-dystrophin antibody, myosin heavy chain normalisation, filamin C normalised parallel-reaction-monitoring mass spectrometry, healthy muscle standard',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vil-1',
        category: 'measured',
        title: 'Dystrophin reached 5.9 percent of normal at week 25',
        laymanSummary:
          'In eight boys on the approved dose, average dystrophin rose from 0.6 percent to 5.9 percent of normal after 24 weeks of treatment.',
        technicalDetails:
          'Study 1 (NCT02740972) treated 16 boys, 8 at each of two doses. In the 80 mg/kg weekly group, western blot normalised to myosin heavy chain gave a mean of 0.6 percent (SD 0.8) at baseline and 5.9 percent (SD 4.5) at week 25, mean change 5.3 percent (SD 4.5), p=0.01, median change 3.8 percent. All patients increased over baseline.',
        evidenceSource: 'Clemens et al., JAMA Neurology 2020',
        doi: '10.1001/jamaneurol.2020.1264',
        measuredMetric: 'Mean dystrophin 0.6 percent to 5.9 percent of normal, p=0.01, n=8',
        auditFlag: 'verified',
      },
      {
        id: 'vil-2',
        category: 'measured',
        title: 'The second assay gave a lower number: 4.2 percent by mass spectrometry',
        laymanSummary:
          'The same muscle samples, measured a different way, gave 4.2 percent instead of 5.9 percent, and the median was 1.9 percent rather than 3.8 percent.',
        technicalDetails:
          'Mass spectrometry normalised to filamin C gave a mean of 0.6 percent (SD 0.2) at baseline and 4.2 percent (SD 3.7) at week 25, change 3.7 percent (SD 3.8), nominal p=0.03 not adjusted for multiple comparisons, median change 1.9 percent. Reporting both is good practice, and the gap between them is the honest measure of how assay-dependent this endpoint is.',
        evidenceSource: 'VILTEPSO US prescribing information, section 14',
        measuredMetric:
          'Mass spectrometry dystrophin 0.6 percent to 4.2 percent of normal, median change 1.9 percent',
        auditFlag: 'caution',
      },
      {
        id: 'vil-3',
        category: 'failed',
        title: 'RACER53 missed its primary endpoint because placebo improved too',
        laymanSummary:
          'The randomised confirmatory trial of 77 boys measured how fast they could stand up from lying down. Treated boys got faster, and so did the placebo group, so there was no significant difference.',
        technicalDetails:
          'RACER53 (NCT04060199) randomised 77 ambulatory boys to viltolarsen 80 mg/kg weekly or placebo for 48 weeks, with time to stand from supine as the primary endpoint. Preliminary results announced in May 2024 reported a trend of increased rising velocity in the treated group, matched by improvement in the placebo comparators, and no statistically significant difference between arms. Adverse events were mild or moderate and no participant withdrew for side effects.',
        evidenceSource: 'NS Pharma preliminary RACER53 results announcement, May 2024',
        measuredMetric: 'Time to stand from supine at week 48: no statistically significant difference',
        auditFlag: 'contested',
      },
      {
        id: 'vil-4',
        category: 'inferred',
        title: 'Timed-function gains were measured against 65 historical controls, not a randomised arm',
        laymanSummary:
          'The improvements in walking and standing reported in the approval study came from comparing treated boys with boys from old natural-history datasets, not with a placebo group.',
        technicalDetails:
          'The phase 2 study compared all 16 treated participants against 65 age-matched and treatment-matched natural-history controls, reporting improvements in time to stand from supine, 10-metre run/walk and 6-minute walk at week 25. External-control comparison in a disease with steep age-dependent trajectories is exactly the design that RACER53 was built to replace, and RACER53 found no separation.',
        evidenceSource: 'Clemens et al., JAMA Neurology 2020, secondary outcomes',
        doi: '10.1001/jamaneurol.2020.1264',
        inferredClaim:
          'That the timed-function differences against natural-history controls represent a treatment effect',
        auditFlag: 'contested',
      },
      {
        id: 'vil-5',
        category: 'conclusion_shift',
        title: 'Two drugs, one exon, a sixfold gap in reported dystrophin, and neither changed function',
        laymanSummary:
          'Viltolarsen reports about six times more dystrophin than golodirsen for the same exon. Both then failed their confirmatory functional trials, which undercuts the idea that the percentage is what matters.',
        technicalDetails:
          'Golodirsen reported 1.02 percent of normal by Sarepta western blot; viltolarsen reported 5.9 percent by myosin-heavy-chain-normalised western blot. If dystrophin percentage were the operative variable, a sixfold difference should have produced separable functional outcomes. RACER53 and ESSENCE both missed their primary endpoints. That result is informative about the surrogate itself, not only about either drug.',
        evidenceSource:
          'VILTEPSO and VYONDYS 53 prescribing information, section 14; RACER53 and ESSENCE topline results',
        inferredClaim:
          'That percentage-of-normal dystrophin is a rank-ordered measure of exon-skipping drug potency',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly intravenous infusion in saline',
        laymanDesc: 'Given into a vein once a week as a simple saline solution.',
        molecularDetail:
          'Uncharged 21-mer PMO supplied in 0.9 percent sodium chloride, infused over about an hour. Rapid renal elimination; low fractional muscle uptake.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into muscle fibre nuclei',
        laymanDesc: 'Part of the dose enters muscle cells and reaches the nucleus.',
        molecularDetail:
          'Neutral backbone gives nuclease stability but no charge-driven cell-surface protein binding; uptake is thought to be aided by dystrophic membrane fragility.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising to a 21-nucleotide site in exon 53',
        laymanDesc: 'It pairs with a stretch inside exon 53 and hides it from the splicing machinery.',
        molecularDetail:
          'The 21-mer covers the same region as the 25-mer golodirsen minus five bases at the 5-prime end, occluding exonic splicing enhancer elements required for exon definition.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Exon 53 is skipped and the reading frame is restored',
        laymanDesc: 'The exons on either side are joined and the instructions line up again.',
        molecularDetail:
          'Exclusion of exon 53 produces an in-frame transcript in patients with deletions such as 52, 45-52 or 48-52, allowing translation through to the C-terminal domain.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Truncated dystrophin at the sarcolemma, 4 to 6 percent of normal',
        laymanDesc:
          'Shortened dystrophin appears at the muscle membrane at a few percent of normal, depending which assay you use.',
        molecularDetail:
          'Western blot normalised to myosin heavy chain gives 5.9 percent; mass spectrometry normalised to filamin C gives 4.2 percent. Neither corresponded to a randomised functional benefit in RACER53.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NS-065/NCNP-01 Study 1 (NCT02740972)',
        phase: 'Phase 2',
        sampleSize: 16,
        primaryEndpoint:
          'Safety, tolerability and de novo dystrophin production by western blot in biceps at week 25',
        endpointMet: true,
        statisticalPValue: 'p=0.01 for dystrophin change at 80 mg/kg weekly',
        unreportedAdverseSignals:
          'Timed-function comparisons in this study used 65 external natural-history controls rather than a randomised placebo arm',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'RACER53 (NCT04060199)',
        phase: 'Phase 3',
        sampleSize: 77,
        primaryEndpoint: 'Time to stand from supine at week 48 versus placebo',
        endpointMet: false,
        statisticalPValue: 'No statistically significant difference between arms',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Dystrophin 0.6 percent to 5.9 percent of normal by myosin-heavy-chain-normalised western blot, p=0.01',
        'Dystrophin 0.6 percent to 4.2 percent of normal by filamin-C-normalised mass spectrometry',
        'All 16 treated participants increased dystrophin above their own baseline',
      ],
      unsupportedInferences: [
        'That the timed-function gains against 65 natural-history controls were a treatment effect; the randomised trial did not reproduce them',
        'That a higher reported dystrophin percentage than golodirsen means a more effective drug',
      ],
      whatFailedInitially: [
        'RACER53 found no significant difference in time to stand from supine, because the placebo arm improved as well',
        'The two assays used in the approval study disagreed by more than a third on the median change',
      ],
      realWorldOutcome: [
        'Remains available in the United States and Japan under conditional pathways while the sponsor works with regulators on next steps',
        'The paired failure of RACER53 and ESSENCE has reframed the dystrophin surrogate itself as the thing under question',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion of an uncharged phosphorodiamidate morpholino oligomer in saline',
      description:
        'Single-dose vials of 250 mg in 5 mL, diluted into saline and infused weekly over about 60 minutes. No lipid carrier, no ligand, no chemical modification for muscle targeting.',
      safetyProfile:
        'Most common adverse reactions at 15 percent or more were upper respiratory tract infection, injection site reaction, cough and pyrexia. Renal toxicity is a class warning based on nonclinical PMO findings and is monitored. No participant discontinued RACER53 for adverse events.',
    },
    commonQuestions: [
      {
        q: 'Viltolarsen reports 5.9 percent dystrophin and golodirsen 1.02 percent. Is it six times better?',
        a: 'No. The two numbers come from different assays with different normalising proteins and different standard curves, and no study has ever measured both drugs on one assay. The randomised confirmatory trials of both drugs then missed their primary endpoints, which is the stronger evidence that the percentage is not tracking function.',
        auditNote:
          'Cross-drug percentage-of-normal dystrophin comparison is not supported by any head-to-head measurement.',
      },
      {
        q: 'What happened in RACER53?',
        a: 'Seventy-seven boys were randomised to viltolarsen or placebo for 48 weeks. Treated boys got faster at standing up from the floor, and so did the placebo group, so the difference between them was not statistically significant. That is a failed primary endpoint, and it is also a reminder that untreated boys on corticosteroids do not decline in a straight line.',
      },
      {
        q: 'Does viltolarsen help boys who are no longer walking?',
        a: 'Nobody has measured that. Both the approval study and RACER53 enrolled ambulatory boys only, so there is no controlled evidence in non-ambulatory patients, and none on cardiac or respiratory outcomes.',
      },
      {
        q: 'Is it safe?',
        a: 'The recorded adverse events across the programme were mild to moderate, with no discontinuations for side effects in RACER53. Renal toxicity is a labelled class concern from animal studies of morpholino oligomers and is monitored on treatment.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'VILTEPSO (viltolarsen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1ffff9a8-6d6a-4dcb-8493-1b6cc3a5d123',
        kind: 'regulatory',
      },
      {
        label:
          'Clemens et al., Safety, Tolerability, and Efficacy of Viltolarsen in Boys With DMD Amenable to Exon 53 Skipping, JAMA Neurology 2020',
        identifier: '10.1001/jamaneurol.2020.1264',
        kind: 'doi',
      },
      {
        label: 'NS Pharma, preliminary results of the RACER53 phase 3 study, 27 May 2024',
        identifier:
          'https://www.nspharma.com/ns-pharma-shares-preliminary-results-of-viltolarsen-ns-065-ncnp-01-phase-3-clinical-trial-racer53-study/',
        kind: 'url',
      },
      {
        label:
          'Ali et al., Progress and prospects in ASO-mediated exon skipping for DMD, J Muscle Res Cell Motil 2025, Table 1',
        identifier: '10.1007/s10974-024-09688-2',
        kind: 'doi',
      },
      { label: 'Phase 2 study registration', identifier: 'NCT02740972', kind: 'nct' },
      { label: 'RACER53 trial registration', identifier: 'NCT04060199', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Inotersen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'inotersen',
    name: 'Inotersen',
    tradeName: 'Tegsedi',
    sponsor: 'Ionis Pharmaceuticals / Akcea Therapeutics',
    targetGene: 'TTR',
    targetProtein: 'Transthyretin',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2018,
    indication:
      'Polyneuropathy of hereditary transthyretin-mediated amyloidosis in adults; US marketing discontinued by the sponsor in September 2024',
    patientFriendlyIndication: 'Hereditary ATTR Amyloidosis with Nerve Damage',
    anatomicalSite: 'Liver hepatocyte nucleus and cytoplasm',
    conditionContext: {
      conditionExplainer:
        'A mutated TTR gene makes a transport protein that misfolds. The misfolded protein deposits as amyloid in peripheral nerves and heart muscle, and the deposits accumulate for the rest of the person life.',
      whyItMatters:
        'Untreated hereditary ATTR polyneuropathy progresses to loss of walking within about five years of onset and to death within roughly a decade. The liver makes almost all circulating transthyretin, so silencing it there removes the substrate.',
      whoTakesThis:
        'Adults with a confirmed TTR variant and stage 1 or stage 2 polyneuropathy, by weekly subcutaneous injection with mandatory weekly blood monitoring.',
      clinicalGoals:
        'Slow or halt the progression of neuropathy scores and preserve quality of life, while keeping platelet counts and kidney function under surveillance.',
    },
    oneSentenceVerdict:
      'The first RNase-H-recruiting antisense drug approved for hereditary ATTR amyloidosis; it improved neuropathy scores by 19.7 points against placebo over 66 weeks and carries a boxed warning for thrombocytopenia after a trial participant died of intracranial haemorrhage.',
    laymanHowItWorks:
      'Almost all of the misfolding protein in this disease is made by the liver. Inotersen is a short strand that pairs with the liver instructions for that protein and flags them for destruction by an enzyme the cell already has, so less protein is made in the first place. It works, and it also caused dangerous falls in platelet count and kidney inflammation in some people, which is why it requires weekly blood tests.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    substitutes: {
      summary:
        'Three other classes act on the same disease: an siRNA that silences the same transcript, a stabiliser that stops the protein misfolding, and a cheap generic anti-inflammatory with randomised trial support. No diet or supplement removes amyloid.',
      conventionalRx: [
        {
          name: 'Patisiran (Onpattro)',
          class: 'Lipid nanoparticle siRNA against TTR',
          howItCompares:
            'Silences the same transcript through RISC rather than RNase H, given by intravenous infusion every three weeks with premedication. Its pivotal trial showed a larger mNIS+7 separation over 18 months.',
          typicalCost: 'Branded specialty pricing in the hundreds of thousands of dollars per year',
          prosAndCons:
            'Pros: no thrombocytopenia signal, strong randomised data. Cons: infusion centre visits and steroid premedication.',
        },
        {
          name: 'Vutrisiran (Amvuttra)',
          class: 'GalNAc-conjugated siRNA against TTR',
          howItCompares:
            'Same target, subcutaneous, given quarterly rather than weekly. The convenience gap against weekly inotersen is large.',
          typicalCost: 'About $477,000 / year at US wholesale acquisition cost',
          prosAndCons:
            'Pros: quarterly dosing, no boxed warning. Cons: price, and no head-to-head randomised comparison with inotersen.',
        },
        {
          name: 'Tafamidis (Vyndaqel / Vyndamax)',
          class: 'Oral transthyretin tetramer stabiliser',
          howItCompares:
            'Stops the tetramer from falling apart instead of reducing how much is made. Randomised mortality benefit in ATTR cardiomyopathy; EU authorisation covers stage 1 polyneuropathy.',
          typicalCost: 'About $22,000 per 30 capsules at 2025 US list price',
          prosAndCons:
            'Pros: oral, well tolerated. Cons: does not reduce transthyretin production, and the US label is for cardiomyopathy.',
        },
        {
          name: 'Diflunisal (off-label)',
          class: 'Generic NSAID that also stabilises the transthyretin tetramer',
          howItCompares:
            'A randomised placebo-controlled trial in familial amyloid polyneuropathy showed reduced progression of neurological impairment over two years, at generic cost.',
          typicalCost: 'Generic; typically under $60 / month in the US',
          prosAndCons:
            'Pros: the only cheap option with randomised evidence. Cons: NSAID renal, gastrointestinal and fluid-retention risks in a population that often has cardiac involvement.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Weekly platelet self-monitoring discipline',
          action:
            'Keeping to the weekly blood test schedule and reporting bruising, petechiae or bleeding gums immediately.',
          patientImpact:
            'Thrombocytopenia in this drug is sudden and unpredictable. Enhanced monitoring is the intervention that turned a fatal signal into a manageable one.',
          clinicalPrecaution:
            'This is a labelled requirement, not an optional precaution. Missing tests is the failure mode that produced the trial death.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'TCTTGGTTACATGAAATCCC',
      chemicalFormula: 'C230H318N69O121P19S19',
      molecularWeight: '7,183.08 Da (free base)',
      targetReceptorAffinity:
        '5-10-5 MOE gapmer; the central 10 deoxynucleotides form the RNase H1 substrate duplex with TTR mRNA',
      structureSource: {
        label:
          'TEGSEDI US prescribing information section 11 chemical name, cross-checked against Yu et al. Mol Ther Nucleic Acids 2017 Table 1 (ISIS 420915)',
        identifier: '10.1016/j.omtn.2017.08.012',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite qualification for a mixed-chemistry gapmer',
          description:
            'Two chemistries in one molecule: 2-prime-MOE amidites for the five-base wings and standard deoxy amidites for the ten-base gap. Both sets are release-tested, because a MOE base misplaced into the gap abolishes RNase H recruitment.',
          reagentsAndBuffer:
            'MOE-A/G/5-Me-C/5-Me-U and dA/dG/dC/5-Me-dC phosphoramidites, Karl Fischer titration, anhydrous acetonitrile',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase synthesis of the 5-10-5 gapmer with full sulfurisation',
          description:
            'Twenty coupling cycles switching amidite class at positions 6 and 16, sulfurising at every internucleotide linkage to give a uniform phosphorothioate backbone.',
          reagentsAndBuffer:
            '3 percent dichloroacetic acid in toluene, 5-(ethylthio)-1H-tetrazole, phenylacetyl disulfide, acetic anhydride/N-methylimidazole cap',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange purification and sodium-salt exchange',
          description:
            'Separate the full-length 20-mer from n-1 shortmers and from partially oxidised phosphodiester species, then exchange counterions and lyophilise.',
          reagentsAndBuffer:
            'Concentrated ammonia cleavage, Source 30Q resin, sodium bromide gradient in 20 mM sodium hydroxide, 3 kDa tangential flow filtration',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Gymnotic uptake into primary human hepatocytes',
          description:
            'Free uptake without transfection reagent, which is the route an unconjugated phosphorothioate actually takes in the liver after subcutaneous injection.',
          reagentsAndBuffer:
            'Cryopreserved primary human hepatocytes, Williams E medium with hepatocyte maintenance supplement, no lipofection reagent',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'TTR mRNA knockdown by RT-qPCR and serum transthyretin immunoassay',
          description:
            'Measure transcript reduction, then confirm it reaches secreted protein. Serum transthyretin is the pharmacodynamic marker followed in patients.',
          reagentsAndBuffer:
            'TaqMan TTR probe set with cyclophilin B reference, turbidimetric or nephelometric transthyretin immunoassay',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ino-1',
        category: 'measured',
        title: 'NEURO-TTR: 19.7-point mNIS+7 separation and 11.7-point quality-of-life separation',
        laymanSummary:
          'Over 66 weeks, treated patients barely changed on the neuropathy scale while placebo patients got substantially worse, and the same pattern held on the patient-reported quality-of-life score.',
        technicalDetails:
          'NCT01737398 randomised 172 patients 2:1. Least-squares mean change from baseline to week 66 in mNIS+7 was 5.8 with inotersen against 25.5 with placebo, difference -19.7 (95 percent CI -26.4 to -13.0), p<0.001. Norfolk QoL-DN change was 1.0 against 12.7, difference -11.7 (95 percent CI -18.3 to -5.1), p<0.001. Effects were consistent across disease stage, mutation type and presence of cardiomyopathy.',
        evidenceSource: 'Benson et al., New England Journal of Medicine 2018 (NEURO-TTR)',
        doi: '10.1056/NEJMoa1716793',
        measuredMetric: 'mNIS+7 treatment difference -19.7 points, p<0.001',
        auditFlag: 'verified',
      },
      {
        id: 'ino-2',
        category: 'failed',
        title: 'A trial participant died of intracranial haemorrhage from thrombocytopenia',
        laymanSummary:
          'Platelet counts fell suddenly and unpredictably in some patients. One died of a brain bleed, after which the trial added enhanced platelet monitoring for everyone.',
        technicalDetails:
          'The boxed warning states that inotersen causes reductions in platelet count that may be sudden, unpredictable and life-threatening, and that one clinical trial patient died from intracranial haemorrhage. Grade 4 thrombocytopenia and glomerulonephritis each occurred in 3 percent of treated patients. The drug is contraindicated below a platelet count of 100 x 10^9/L and requires weekly counts on treatment and for eight weeks after stopping.',
        evidenceSource: 'TEGSEDI US prescribing information, boxed warning',
        doi: '10.1056/NEJMoa1716793',
        measuredMetric: 'Grade 4 thrombocytopenia 3 percent; glomerulonephritis 3 percent; one treatment-associated death',
        auditFlag: 'verified',
      },
      {
        id: 'ino-3',
        category: 'failed',
        title: 'Five deaths in the inotersen arm and none on placebo',
        laymanSummary:
          'The trial recorded five deaths among treated patients and zero among those on placebo. The publication attributes most to the underlying disease, and the imbalance is in the record.',
        technicalDetails:
          'NEURO-TTR reported five deaths in the inotersen group and none in the placebo group across 172 randomised patients over 15 months, with one death associated with grade 4 thrombocytopenia. The trial was not powered for mortality and the randomisation was 2:1, so more treated patients were at risk, but an all-cause imbalance in this direction is the kind of number that should be stated plainly rather than only in a supplementary table.',
        evidenceSource: 'Benson et al., NEJM 2018, results section',
        doi: '10.1056/NEJMoa1716793',
        measuredMetric: 'Deaths: 5 of 112 inotersen versus 0 of 60 placebo',
        auditFlag: 'caution',
      },
      {
        id: 'ino-4',
        category: 'inferred',
        title: 'Neuropathy benefit is read as cardiac benefit, which was not measured',
        laymanSummary:
          'ATTR amyloidosis damages nerves and heart. The trial measured nerves. It did not show that hearts do better.',
        technicalDetails:
          'The co-primary endpoints were both neuropathy measures. Patients with cardiomyopathy were enrolled and the neuropathy effect was consistent in that subgroup, but no cardiac endpoint was powered and no cardiovascular outcome claim appears in the US label. Reduced transthyretin production is a plausible mechanism for cardiac benefit; plausibility is not measurement.',
        evidenceSource: 'TEGSEDI US prescribing information, section 14; Benson et al., NEJM 2018',
        doi: '10.1056/NEJMoa1716793',
        inferredClaim: 'That inotersen improves cardiac outcomes in ATTR cardiomyopathy',
        auditFlag: 'caution',
      },
      {
        id: 'ino-5',
        category: 'conclusion_shift',
        title: 'Superseded by its own sequence with a sugar attached',
        laymanSummary:
          'Eplontersen carries the identical 20-letter sequence with a liver-targeting sugar cluster bolted on. It is dosed monthly instead of weekly, at far lower total exposure, and it has no boxed warning.',
        technicalDetails:
          'Eplontersen is inotersen conjugated to a triantennary N-acetylgalactosamine ligand. Comparing label regimens, inotersen delivers roughly 14.8 g of oligonucleotide per year and eplontersen roughly 0.6 g, an approximately 25-fold reduction in systemic oligonucleotide burden for the same target engagement. The platelet and renal signals that produced the inotersen boxed warning did not recur.',
        evidenceSource: 'TEGSEDI and WAINUA US prescribing information; Viney et al., ESC Heart Failure 2021',
        doi: '10.1002/ehf2.13154',
        auditFlag: 'verified',
      },
      {
        id: 'ino-6',
        category: 'failed',
        title: 'Withdrawn from the US market for commercial reasons in 2024',
        laymanSummary:
          'The sponsor stopped marketing inotersen in the United States in September 2024. The stated reason was low sales, not a new safety or efficacy finding.',
        technicalDetails:
          'Marketing in the United States ceased on 27 September 2024. Prescribers were told the decision reflected commercial performance rather than any change in the assessment of efficacy or safety. It illustrates something the evidence base cannot capture: a drug with a positive randomised trial can disappear because better-tolerated competitors took the market.',
        evidenceSource: 'Akcea/Ionis prescriber notification, September 2024',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly subcutaneous injection',
        laymanDesc: 'A small injection under the skin, once a week, self-administered.',
        molecularDetail:
          'Unconjugated phosphorothioate 20-mer in a prefilled syringe. Absorption from the subcutaneous depot is followed by broad tissue distribution with preferential accumulation in liver and kidney.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into hepatocytes without a carrier',
        laymanDesc:
          'Liver cells take the strand in by themselves, because its sulphur-modified backbone sticks to proteins on the cell surface.',
        molecularDetail:
          'Phosphorothioate-driven binding to cell-surface proteins including stabilin receptors, followed by adsorptive endocytosis and productive endosomal release. Uptake is not liver-selective, which is the origin of the renal and platelet effects.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising to TTR messenger RNA',
        laymanDesc: 'It pairs with the liver instructions for transthyretin.',
        molecularDetail:
          'Watson-Crick duplex formation between the central 10 deoxynucleotide gap and the TTR transcript. The 2-prime-MOE wings raise binding affinity and resist nucleases but cannot themselves support cleavage.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'RNase H1 cuts the transcript',
        laymanDesc:
          'An enzyme the cell already has recognises the hybrid and destroys the messenger strand, leaving the drug intact to do it again.',
        molecularDetail:
          'RNase H1 recognises the DNA:RNA heteroduplex formed at the gap and cleaves the RNA strand. The oligonucleotide is released and recycles, which is why a catalytic mechanism gives durable knockdown at low intracellular concentration.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Serum transthyretin falls and amyloid deposition slows',
        laymanDesc:
          'Less transthyretin circulates, so less of it can misfold and deposit in nerves. Deposits already laid down are not removed.',
        molecularDetail:
          'Reduced hepatic secretion lowers circulating tetramer available for dissociation and amyloidogenic misfolding. Knockdown also lowers retinol-binding-protein-4 and vitamin A transport, which is why vitamin A supplementation is labelled.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NEURO-TTR (NCT01737398)',
        phase: 'Phase 3',
        sampleSize: 172,
        primaryEndpoint:
          'Co-primary: change from baseline to week 66 in mNIS+7 and in Norfolk QoL-DN total score',
        endpointMet: true,
        statisticalPValue: 'p<0.001 for both co-primary endpoints',
        unreportedAdverseSignals:
          'Five deaths in the inotersen arm versus none on placebo; grade 4 thrombocytopenia and glomerulonephritis each in 3 percent, with enhanced monitoring introduced mid-trial',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'mNIS+7 treatment difference -19.7 points at week 66, p<0.001',
        'Norfolk QoL-DN treatment difference -11.7 points at week 66, p<0.001',
        'Grade 4 thrombocytopenia in 3 percent and glomerulonephritis in 3 percent of treated patients',
      ],
      unsupportedInferences: [
        'That the neuropathy benefit extends to cardiac outcomes; no cardiac endpoint was powered',
        'That existing amyloid deposits are cleared; the drug reduces new substrate only',
      ],
      whatFailedInitially: [
        'Sudden thrombocytopenia caused a fatal intracranial haemorrhage before enhanced monitoring was introduced',
        'Glomerulonephritis in a subset required immunosuppression and, in one case, dialysis',
        'Weekly dosing with weekly blood tests proved commercially untenable once quarterly and monthly competitors arrived',
      ],
      realWorldOutcome: [
        'US marketing was discontinued in September 2024 for commercial reasons, not for a new safety finding',
        'The same 20-mer survives as eplontersen, with a GalNAc ligand, monthly dosing and no boxed warning',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection of an unconjugated phosphorothioate 2-prime-MOE gapmer',
      description:
        'Prefilled syringe containing 284 mg of inotersen in 1.5 mL, self-administered weekly. No targeting ligand: liver exposure comes from the pharmacokinetics of the chemistry rather than from directed delivery.',
      safetyProfile:
        'Boxed warning for thrombocytopenia and glomerulonephritis, with a restricted programme and weekly platelet monitoring. Injection-site reactions, nausea, headache, pyrexia and chills are common. Vitamin A supplementation is required because transthyretin knockdown lowers retinol transport.',
    },
    commonQuestions: [
      {
        q: 'Does inotersen reverse amyloidosis?',
        a: 'No. It reduces how much transthyretin the liver makes, which lowers the supply of protein available to misfold. Amyloid already deposited in nerves is not cleared by this mechanism, which is why the measured result is slowed progression rather than recovery.',
      },
      {
        q: 'Why does it need weekly blood tests?',
        a: 'Because platelet counts can fall suddenly and without warning, and one trial participant died of an intracranial haemorrhage before enhanced monitoring existed. Weekly counts are a labelled requirement, not a precaution that can be relaxed.',
        auditNote: 'The monitoring schedule is the mitigation that made the boxed-warning risk manageable.',
      },
      {
        q: 'Can I still get inotersen?',
        a: 'In the United States, no. The sponsor stopped marketing it in September 2024, citing commercial performance rather than any new safety or efficacy finding. Availability elsewhere varies by country.',
      },
      {
        q: 'Is eplontersen just inotersen with a sugar on it?',
        a: 'Chemically that is close to accurate: the base sequence is identical and eplontersen adds a triantennary GalNAc ligand that targets hepatocytes. The consequence is a roughly 25-fold lower annual oligonucleotide burden and no boxed warning, which shows how much of the toxicity was exposure outside the liver rather than an on-target effect.',
      },
      {
        q: 'How does it compare with patisiran or vutrisiran?',
        a: 'Nobody has run a head-to-head randomised trial. All three lower transthyretin and all three showed neuropathy benefit against placebo in separate trials with different populations and time points, so cross-trial ranking is not supported by the data.',
        auditNote: 'No randomised comparison exists between any two TTR-lowering drugs.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'TEGSEDI (inotersen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=8513207e-b55f-417b-9473-af785146a543',
        kind: 'regulatory',
      },
      {
        label:
          'Benson et al., Inotersen Treatment for Patients with Hereditary Transthyretin Amyloidosis, NEJM 2018',
        identifier: '10.1056/NEJMoa1716793',
        kind: 'doi',
      },
      {
        label:
          'Viney et al., Ligand conjugated antisense oligonucleotide for the treatment of transthyretin amyloidosis, ESC Heart Failure 2021',
        identifier: '10.1002/ehf2.13154',
        kind: 'doi',
      },
      {
        label: 'Yu et al., Mol Ther Nucleic Acids 2017, Table 1 (ISIS 420915 sequence and mass)',
        identifier: '10.1016/j.omtn.2017.08.012',
        kind: 'doi',
      },
      {
        label: 'Berk et al., Repurposing Diflunisal for Familial Amyloid Polyneuropathy, JAMA 2013',
        identifier: '10.1001/jama.2013.283815',
        kind: 'doi',
      },
      {
        label: 'Adams et al., Patisiran, an RNAi Therapeutic, for Hereditary Transthyretin Amyloidosis, NEJM 2018',
        identifier: '10.1056/NEJMoa1716153',
        kind: 'doi',
      },
      {
        label: 'Tegsedi EPAR, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/tegsedi',
        kind: 'regulatory',
      },
      { label: 'NEURO-TTR trial registration', identifier: 'NCT01737398', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Eplontersen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'eplontersen',
    name: 'Eplontersen',
    tradeName: 'Wainua',
    sponsor: 'Ionis Pharmaceuticals / AstraZeneca',
    targetGene: 'TTR',
    targetProtein: 'Transthyretin',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2023,
    indication: 'Polyneuropathy of hereditary transthyretin-mediated amyloidosis in adults',
    patientFriendlyIndication: 'Hereditary ATTR Amyloidosis with Nerve Damage',
    anatomicalSite: 'Liver hepatocyte, entered through the asialoglycoprotein receptor',
    conditionContext: {
      conditionExplainer:
        'The same disease inotersen treats: a mutated TTR gene produces a protein that misfolds and deposits as amyloid in nerves and heart.',
      whyItMatters:
        'Eplontersen is the same 20-letter sequence as inotersen with a liver-targeting sugar cluster attached. It is the cleanest available demonstration that most of an antisense drug toxicity can be a delivery problem rather than a target problem.',
      whoTakesThis:
        'Adults with a confirmed TTR variant and polyneuropathy, by monthly subcutaneous autoinjector, without the weekly blood monitoring inotersen requires.',
      clinicalGoals:
        'Reduce circulating transthyretin by roughly 80 percent and hold neuropathy scores steady.',
    },
    oneSentenceVerdict:
      'Inotersen with a triantennary GalNAc ligand attached: it cut serum transthyretin by 81.7 percent and held mNIS+7 essentially flat over 66 weeks, in an open-label trial whose placebo group was borrowed from a study that had finished six years earlier.',
    laymanHowItWorks:
      'This is the same antisense strand as inotersen with a three-armed sugar cluster bolted onto one end. Liver cells carry a receptor that grabs that sugar, so the drug is pulled into exactly the cells that make the problem protein instead of spreading everywhere. Because the delivery is so much more efficient, a monthly injection at a fraction of the dose does the same job, and the platelet and kidney problems that plagued the earlier drug did not appear.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    substitutes: {
      summary:
        'Vutrisiran is the closest comparator: same target, subcutaneous, quarterly, silencing by RISC instead of RNase H. Stabilisers act on the protein instead of the transcript, and generic diflunisal has randomised evidence at a tiny fraction of the price.',
      conventionalRx: [
        {
          name: 'Vutrisiran (Amvuttra)',
          class: 'GalNAc-conjugated siRNA against TTR',
          howItCompares:
            'Uses the same liver-targeting ligand chemistry to deliver an siRNA rather than an antisense gapmer, dosed quarterly rather than monthly.',
          typicalCost: 'About $477,000 / year at US wholesale acquisition cost',
          prosAndCons:
            'Pros: quarterly injection, extensive randomised programme in both neuropathy and cardiomyopathy. Cons: no head-to-head trial against eplontersen exists.',
        },
        {
          name: 'Patisiran (Onpattro)',
          class: 'Lipid nanoparticle siRNA against TTR',
          howItCompares:
            'The first-generation delivery approach for the same target: intravenous every three weeks with steroid and antihistamine premedication.',
          typicalCost: 'Branded specialty pricing in the hundreds of thousands of dollars per year',
          prosAndCons:
            'Pros: long randomised record. Cons: infusion visits and premedication that subcutaneous agents avoid.',
        },
        {
          name: 'Diflunisal (off-label)',
          class: 'Generic NSAID and transthyretin tetramer stabiliser',
          howItCompares:
            'A randomised placebo-controlled trial showed reduced progression of neurological impairment over two years, at generic cost.',
          typicalCost: 'Generic; typically under $60 / month in the US',
          prosAndCons:
            'Pros: by far the cheapest option with randomised support. Cons: NSAID renal and cardiac risks in a population with frequent cardiac involvement.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Vitamin A repletion under supervision',
          action:
            'Taking the labelled vitamin A supplement and reporting night-vision changes or eye dryness.',
          patientImpact:
            'Transthyretin carries retinol-binding protein. Cutting transthyretin by 80 percent cuts vitamin A transport with it, and ocular symptoms are the first sign.',
          clinicalPrecaution:
            'Supplementation is specified in the label and needs ophthalmology review if symptoms appear. Not a self-directed high-dose regimen.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'TCTTGGTTACATGAAATCCC',
      chemicalFormula: 'C296H417N77O156P20S13Na20 (sodium salt, including the GalNAc ligand)',
      molecularWeight: '9,046.1 Da (sodium salt)',
      targetReceptorAffinity:
        'Triantennary GalNAc binds hepatocyte asialoglycoprotein receptor; 5-10-5 MOE gapmer core recruits RNase H1 to TTR mRNA',
      structureSource: {
        label:
          'WAINUA US prescribing information section 11 chemical name; identical base sequence to ISIS 420915 in Yu et al. Mol Ther Nucleic Acids 2017 Table 1',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d7dcb847-71dd-4fff-82d0-d43a465fc096',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite and GalNAc ligand qualification',
          description:
            'Release-test the MOE and deoxy amidites for the gapmer core and, separately, the triantennary GalNAc phosphoramidite whose three sugar arms must all be intact for receptor avidity.',
          reagentsAndBuffer:
            'MOE and deoxy phosphoramidites, trishexylamino-C6-GalNAc3 phosphoramidite, Karl Fischer titration, anhydrous acetonitrile',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Mixed phosphodiester/phosphorothioate 5-10-5 gapmer assembly',
          description:
            'Twenty cycles with selective oxidation rather than sulfurisation at defined wing linkages, giving the mixed backbone that reduces protein binding away from the liver.',
          reagentsAndBuffer:
            'Dichloroacetic acid detritylation, 5-(ethylthio)-1H-tetrazole activator, phenylacetyl disulfide for thioate positions, iodine/water/pyridine for diester positions',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange purification of the conjugate',
          description:
            'Resolve the full-length conjugate from unconjugated oligonucleotide and from partially deacetylated GalNAc species, then exchange to the sodium salt.',
          reagentsAndBuffer:
            'Ammonia cleavage and deprotection, Source 30Q resin, sodium bromide gradient, tangential flow diafiltration',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Ligand integrity and receptor-binding confirmation',
          description:
            'Confirm the 5-prime trishexylamino-C6-GalNAc3 cluster is intact and measure binding to recombinant asialoglycoprotein receptor. A conjugate that lost one arm loses most of its avidity.',
          reagentsAndBuffer:
            'Recombinant human ASGPR1 extracellular domain, surface plasmon resonance running buffer with calcium, intact-mass LC-MS',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor-mediated uptake and TTR knockdown in primary hepatocytes',
          description:
            'Compare free uptake of the conjugate against the unconjugated parent, then quantify TTR transcript and secreted protein. The uptake gap between the two is the entire eplontersen story.',
          reagentsAndBuffer:
            'Primary human hepatocytes, Williams E medium, TaqMan TTR probe set, transthyretin immunoassay, competition with free N-acetylgalactosamine',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'epl-1',
        category: 'measured',
        title: 'Serum transthyretin fell 81.7 percent',
        laymanSummary:
          'The protein that misfolds in this disease dropped by more than four fifths in treated patients.',
        technicalDetails:
          'In NEURO-TTRansform (NCT04136184) the adjusted mean percentage reduction in serum transthyretin at week 65 was -81.7 percent with eplontersen against -11.2 percent in the comparison group, difference -70.4 percent (95 percent CI -75.2 to -65.7), p<0.001.',
        evidenceSource: 'Coelho et al., JAMA 2023 (NEURO-TTRansform)',
        doi: '10.1001/jama.2023.18688',
        measuredMetric: 'Serum transthyretin -81.7 percent versus -11.2 percent, p<0.001',
        auditFlag: 'verified',
      },
      {
        id: 'epl-2',
        category: 'measured',
        title: 'Neuropathy scores held flat: mNIS+7 change 0.3 against 25.1',
        laymanSummary:
          'Treated patients were essentially unchanged on the neuropathy scale over 66 weeks. The comparison group deteriorated by 25 points.',
        technicalDetails:
          'Adjusted mean change from baseline to week 66 in mNIS+7 was 0.3 with eplontersen against 25.1 in the comparison group, difference -24.8 (95 percent CI -31.0 to -18.6), p<0.001. Norfolk QoL-DN changed by -5.5 against 14.2, difference -19.7 (95 percent CI -25.6 to -13.8), p<0.001.',
        evidenceSource: 'WAINUA US prescribing information, section 14, Table 2',
        doi: '10.1001/jama.2023.18688',
        measuredMetric: 'mNIS+7 difference -24.8 points at week 66, p<0.001',
        auditFlag: 'verified',
      },
      {
        id: 'epl-3',
        category: 'inferred',
        title: 'The placebo group came from a different trial that ended six years earlier',
        laymanSummary:
          'Nobody in this trial received a placebo. The comparison group was the placebo arm of the 2013 to 2017 inotersen trial, reweighted statistically.',
        technicalDetails:
          'NEURO-TTRansform was open-label and single-group for the eplontersen arm, with 144 treated patients and a small 24-patient inotersen reference arm. Efficacy was assessed against the 60-patient placebo group from NEURO-TTR (NCT01737398), which ran from March 2013 to November 2017, using propensity-score weighting and an ANCOVA model. Background care for ATTR amyloidosis changed materially between those periods, and no weighting scheme can adjust for a confounder nobody recorded.',
        evidenceSource: 'Coelho et al., JAMA 2023, design section; WAINUA label section 14',
        doi: '10.1001/jama.2023.18688',
        inferredClaim:
          'That the mNIS+7 and quality-of-life differences are equivalent to a contemporaneous randomised placebo comparison',
        auditFlag: 'caution',
      },
      {
        id: 'epl-4',
        category: 'measured',
        title: 'The boxed warning that defined inotersen did not recur',
        laymanSummary:
          'The same sequence, delivered efficiently to the liver, produced no boxed warning for platelets or kidneys.',
        technicalDetails:
          'Eplontersen carries no boxed warning and no requirement for weekly platelet counts. Adverse events leading to discontinuation occurred in 4 percent of the eplontersen group against 3 percent of the comparison group. Two deaths occurred in the eplontersen group, both attributed to known disease sequelae. Comparing label regimens, annual oligonucleotide exposure is roughly 0.6 g against roughly 14.8 g for inotersen.',
        evidenceSource: 'WAINUA and TEGSEDI US prescribing information',
        measuredMetric: 'No boxed warning; discontinuation for adverse events 4 percent versus 3 percent',
        auditFlag: 'verified',
      },
      {
        id: 'epl-5',
        category: 'conclusion_shift',
        title: 'Toxicity that looked like a class effect turned out to be a delivery problem',
        laymanSummary:
          'Phosphorothioate antisense drugs had a reputation for platelet and kidney trouble. Attaching a liver-targeting sugar to the identical sequence removed it.',
        technicalDetails:
          'The inotersen thrombocytopenia and glomerulonephritis signals were widely read as intrinsic to phosphorothioate chemistry. GalNAc conjugation plus a mixed phosphodiester backbone cut the dose needed for the same target engagement by more than an order of magnitude, and the signals did not reappear. The field conclusion moved from "this chemistry is toxic" to "this chemistry was being dosed far above what a targeted version needs".',
        evidenceSource:
          'Crooke et al., Nucleic Acid Therapeutics 2019, integrated assessment of GalNAc3-conjugated 2-prime-MOE ASOs',
        doi: '10.1089/nat.2018.0753',
        auditFlag: 'verified',
      },
      {
        id: 'epl-6',
        category: 'inferred',
        title: 'The cardiomyopathy question is still open',
        laymanSummary:
          'The approval covers nerve disease. Whether the drug helps the heart in ATTR cardiomyopathy is being tested in a separate trial that has not reported.',
        technicalDetails:
          'CARDIO-TTRansform (NCT04136171) enrolled 1,438 participants with transthyretin amyloid cardiomyopathy and is active but not recruiting. Until it reports, cardiac benefit for eplontersen is an inference from transthyretin reduction, not a measured outcome, and the US label makes no cardiomyopathy claim.',
        evidenceSource: 'CARDIO-TTRansform trial record, ClinicalTrials.gov',
        inferredClaim: 'That eplontersen reduces cardiovascular events in ATTR cardiomyopathy',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Monthly subcutaneous autoinjector',
        laymanDesc: 'One small injection under the skin every four weeks, self-administered.',
        molecularDetail:
          'Single-dose autoinjector or prefilled syringe delivering 45 mg of eplontersen in 0.8 mL. Absorption from the subcutaneous depot into the systemic circulation precedes rapid hepatic extraction.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The GalNAc cluster docks onto liver cells',
        laymanDesc:
          'Three sugar arms on one end of the molecule latch onto a receptor that only liver cells display in quantity.',
        molecularDetail:
          'Triantennary N-acetylgalactosamine binds the asialoglycoprotein receptor on hepatocytes with high avidity from multivalency. The receptor cycles from surface to endosome and back several times an hour, giving a high-throughput import route.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Receptor-mediated endocytosis and endosomal release',
        laymanDesc:
          'The receptor carries the drug inside the cell and releases it as the internal compartment turns acidic.',
        molecularDetail:
          'Clathrin-mediated endocytosis followed by endosomal acidification, which lowers GalNAc affinity and frees the oligonucleotide. A small fraction escapes the endosome into the cytoplasm and nucleus, which is sufficient because the mechanism downstream is catalytic.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'RNase H1 cleaves TTR messenger RNA',
        laymanDesc:
          'The strand pairs with the transthyretin instructions and an enzyme the cell already has cuts them up.',
        molecularDetail:
          'The central 10-deoxynucleotide gap forms a DNA:RNA heteroduplex recognised by RNase H1, which cleaves the RNA strand. The oligonucleotide is released intact and repeats the cycle.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Circulating transthyretin drops by about 80 percent',
        laymanDesc:
          'Far less of the misfolding protein reaches the blood, so less is available to deposit in nerves.',
        molecularDetail:
          'Hepatic secretion falls, reducing tetramer available for dissociation into amyloidogenic monomers. Retinol-binding-protein-4 transport falls with it, which is why vitamin A supplementation is labelled.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NEURO-TTRansform (NCT04136184)',
        phase: 'Phase 3 (open label, external placebo control)',
        sampleSize: 168,
        primaryEndpoint:
          'Change from baseline at week 65/66 in serum transthyretin, mNIS+7 and Norfolk QoL-DN, versus the placebo arm of NEURO-TTR',
        endpointMet: true,
        statisticalPValue: 'p<0.001 for all three endpoints',
        unreportedAdverseSignals:
          'No participant in this trial received placebo; the comparison group was drawn from a separate trial conducted between 2013 and 2017 and weighted by propensity score',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serum transthyretin reduced by 81.7 percent at week 65',
        'mNIS+7 change 0.3 with eplontersen against 25.1 in the external comparison group',
        'Norfolk QoL-DN change -5.5 against 14.2',
        'No boxed warning and no weekly platelet monitoring requirement',
      ],
      unsupportedInferences: [
        'That the trial provides randomised placebo-controlled evidence; the placebo group came from a study that closed in 2017',
        'That the drug reduces cardiovascular events; CARDIO-TTRansform has not reported',
        'That eplontersen is superior to vutrisiran or patisiran; no head-to-head trial exists',
      ],
      whatFailedInitially: [
        'The unconjugated parent molecule, inotersen, needed weekly dosing and weekly blood tests and carried a boxed warning',
      ],
      realWorldOutcome: [
        'Monthly self-administration without routine platelet monitoring changed who can practically be treated',
        'The GalNAc conjugation result reshaped the whole antisense field, not just this indication',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous GalNAc-conjugated antisense oligonucleotide, autoinjector',
      description:
        'Single-dose autoinjector or prefilled syringe with 45 mg of eplontersen in 0.8 mL, given every four weeks. The triantennary GalNAc ligand does the targeting; there is no lipid nanoparticle.',
      safetyProfile:
        'No boxed warning. Vitamin A deficiency is expected from transthyretin knockdown and supplementation is labelled, with ophthalmological referral for ocular symptoms. Injection-site reactions are the most common local event.',
    },
    commonQuestions: [
      {
        q: 'Was eplontersen compared against a placebo?',
        a: 'Not a contemporaneous one. Every participant in NEURO-TTRansform received active drug. The comparison group was the placebo arm of the inotersen trial, which ran from 2013 to 2017, reweighted by propensity score. That is a legitimate and pre-specified design in a rare disease, and it is weaker than randomisation.',
        auditNote:
          'The trial is described in its own publication as open-label and single-group with a historical placebo group.',
      },
      {
        q: 'Why is it so much safer than inotersen if the sequence is identical?',
        a: 'Because the sugar cluster puts the drug where it is meant to act. Delivering the same sequence efficiently to hepatocytes means roughly 25 times less oligonucleotide per year reaching everything else, and the platelet and kidney signals that produced the inotersen boxed warning did not recur.',
      },
      {
        q: 'Does it help the heart?',
        a: 'Nobody has measured that yet. The approval is for polyneuropathy. CARDIO-TTRansform, with 1,438 participants in ATTR cardiomyopathy, is active but has not reported, so cardiac benefit remains an inference from transthyretin reduction.',
      },
      {
        q: 'Why do I need vitamin A?',
        a: 'Transthyretin is the carrier that moves retinol-binding protein around the body. Cutting transthyretin by 80 percent cuts vitamin A transport with it, so supplementation is written into the label and eye symptoms need review.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label: 'WAINUA (eplontersen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d7dcb847-71dd-4fff-82d0-d43a465fc096',
        kind: 'regulatory',
      },
      {
        label:
          'Coelho et al., Eplontersen for Hereditary Transthyretin Amyloidosis With Polyneuropathy, JAMA 2023',
        identifier: '10.1001/jama.2023.18688',
        kind: 'doi',
      },
      {
        label:
          'Crooke et al., Integrated Assessment of the Clinical Performance of GalNAc3-Conjugated 2-prime-MOE ASOs, Nucleic Acid Therapeutics 2019',
        identifier: '10.1089/nat.2018.0753',
        kind: 'doi',
      },
      {
        label:
          'Viney et al., Ligand conjugated antisense oligonucleotide for transthyretin amyloidosis: preclinical and phase 1 data, ESC Heart Failure 2021',
        identifier: '10.1002/ehf2.13154',
        kind: 'doi',
      },
      {
        label: 'Wainzua EPAR, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/wainzua',
        kind: 'regulatory',
      },
      { label: 'NEURO-TTRansform trial registration', identifier: 'NCT04136184', kind: 'nct' },
      { label: 'CARDIO-TTRansform trial registration', identifier: 'NCT04136171', kind: 'nct' },
      { label: 'NEURO-TTR, source of the external placebo group', identifier: 'NCT01737398', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Tofersen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tofersen',
    name: 'Tofersen',
    tradeName: 'Qalsody',
    sponsor: 'Biogen / Ionis Pharmaceuticals',
    targetGene: 'SOD1',
    targetProtein: 'Superoxide dismutase 1',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'Accelerated Approval',
    approvalYear: 2023,
    indication: 'Amyotrophic lateral sclerosis in adults with a mutation in the SOD1 gene',
    patientFriendlyIndication: 'SOD1 Amyotrophic Lateral Sclerosis (ALS)',
    anatomicalSite: 'Spinal cord and motor cortex neurons, reached through cerebrospinal fluid',
    conditionContext: {
      conditionExplainer:
        'About 2 percent of people with ALS carry a mutation in SOD1. The mutant protein gains a toxic property rather than losing a useful one, so the motor neurons die from what the protein does, not from what it fails to do.',
      whyItMatters:
        'ALS kills within two to five years of symptom onset for most people. SOD1-ALS is the first form with a drug aimed at the specific genetic cause.',
      whoTakesThis:
        'Adults with genetically confirmed SOD1-ALS, by intrathecal injection, after loading doses and then monthly.',
      clinicalGoals:
        'Lower mutant SOD1 protein in the central nervous system. Whether that slows the disease is the question the confirmatory programme still has to answer.',
    },
    oneSentenceVerdict:
      'The first drug approved for a genetic cause of ALS, cleared on a 55 percent fall in plasma neurofilament light chain after its clinical primary endpoint missed by a wide margin (difference 1.2 points on ALSFRS-R, p=0.97).',
    laymanHowItWorks:
      'In this form of ALS a faulty version of one protein poisons motor neurons. Tofersen is a short strand injected into the spinal fluid that pairs with the instructions for that protein so an enzyme destroys them, and the cell makes less of the poison. In the pivotal trial the amount of a marker of nerve damage in the blood fell sharply. The measure of how patients actually functioned did not separate from placebo.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 42,
    substitutes: {
      summary:
        'Nothing else targets SOD1. The rest of ALS care is two modestly effective drugs and one intervention, non-invasive ventilation, with the largest randomised survival effect anyone has demonstrated in this disease.',
      conventionalRx: [
        {
          name: 'Riluzole',
          class: 'Glutamate release inhibitor',
          howItCompares:
            'The oldest ALS drug, with a survival effect measured in months rather than years. Applies to all ALS, not only SOD1.',
          typicalCost: 'Generic; typically under $60 / month in the US',
          prosAndCons:
            'Pros: cheap, oral, decades of use. Cons: small effect size and liver enzyme monitoring.',
        },
        {
          name: 'Edaravone (Radicava)',
          class: 'Free radical scavenger',
          howItCompares:
            'Slowed ALSFRS-R decline in a narrowly selected early-disease population in a randomised trial; effect outside that population is unclear.',
          typicalCost: 'Branded specialty pricing; oral and intravenous forms',
          prosAndCons:
            'Pros: randomised evidence on the same functional scale tofersen missed. Cons: the trial population was highly selected and the effect has been debated since.',
        },
        {
          name: 'Non-invasive ventilation',
          class: 'Respiratory support, not a drug',
          howItCompares:
            'A randomised controlled trial found a median survival benefit of about seven months, and a much larger quality-of-life effect, in patients with normal or moderately impaired bulbar function.',
          typicalCost: 'Device and service cost; funded through respiratory services in most systems',
          prosAndCons:
            'Pros: the largest randomised survival effect established in ALS. Cons: tolerance is poor with severe bulbar involvement.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Maintaining body weight and calorie intake',
          action:
            'Dietitian-guided high-calorie intake, with early consideration of gastrostomy when swallowing declines.',
          patientImpact:
            'Weight loss is an independent predictor of shorter survival in ALS, and hypermetabolism means intake requirements are higher than they look.',
          clinicalPrecaution:
            'Managed with a specialist ALS dietitian and speech therapist. Aspiration risk rises as bulbar function falls.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'CAGGATACATTTCTACAGCT',
      chemicalFormula: 'C230H317N72O123P19S15',
      molecularWeight: '7,127.86 Da',
      targetReceptorAffinity:
        '5-10-5 MOE gapmer with a mixed phosphorothioate/phosphodiester backbone; recruits RNase H1 to SOD1 mRNA',
      structureSource: {
        label:
          'Cheng et al., BioDrugs 2024, which names tofersen and gives its 20-mer sequence; molecular formula and mass from the QALSODY label section 11',
        identifier: '10.1007/s40259-024-00644-7',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite qualification and target-site specificity screen',
          description:
            'Release-test MOE and deoxy amidites, and confirm in silico and in vitro that the 20-mer does not have a near-complementary site in another CNS transcript, because off-target RNase H cleavage in neurons is not recoverable.',
          reagentsAndBuffer:
            'MOE and deoxy phosphoramidites, Karl Fischer titration, human transcriptome mismatch screen, anhydrous acetonitrile',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Mixed-backbone 5-10-5 gapmer assembly',
          description:
            'Twenty coupling cycles with sulfurisation at fifteen linkages and oxidation at four, giving the mixed phosphorothioate/phosphodiester backbone the label describes.',
          reagentsAndBuffer:
            'Dichloroacetic acid detritylation, 5-(ethylthio)-1H-tetrazole, phenylacetyl disulfide for thioate linkages, iodine/water/pyridine for diester linkages',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange purification to intrathecal-grade purity',
          description:
            'Resolve the full-length 20-mer from shortmers, then reduce endotoxin and particulates to the standard an intrathecal product requires, which is stricter than for a subcutaneous one.',
          reagentsAndBuffer:
            'Ammonia cleavage, Source 30Q resin, sodium bromide gradient, tangential flow diafiltration, endotoxin testing by LAL',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Gymnotic uptake into SOD1-mutant patient iPSC motor neurons',
          description:
            'Free uptake without transfection reagent into induced motor neurons carrying a patient SOD1 variant, which is the closest in vitro analogue of intrathecal exposure.',
          reagentsAndBuffer:
            'SOD1 A4V or D90A patient iPSC-derived motor neurons, neurobasal medium with B27 and neurotrophic factors, no lipofection reagent',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'SOD1 protein knockdown and neurofilament light release',
          description:
            'Quantify SOD1 transcript and protein, and measure neurofilament light chain released into the medium, which is the same biomarker the accelerated approval rests on in patients.',
          reagentsAndBuffer:
            'TaqMan SOD1 probe set, anti-SOD1 immunoassay, Simoa NF-light single-molecule array',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tof-1',
        category: 'failed',
        title: 'The clinical primary endpoint missed, with a p-value of 0.97',
        laymanSummary:
          'In the pivotal trial, treated patients declined on the ALS functional scale essentially as fast as patients on placebo.',
        technicalDetails:
          'VALOR (NCT02623699) Part C randomised 108 adults 2:1. In the faster-progression subgroup that formed the primary analysis, change in ALSFRS-R from baseline to week 28 was -6.98 with tofersen and -8.14 with placebo, a difference of 1.2 points (95 percent CI -3.2 to 5.5), p=0.97. Secondary clinical endpoints including slow vital capacity and handheld dynamometry also did not differ significantly.',
        evidenceSource: 'Miller et al., New England Journal of Medicine 2022 (VALOR)',
        doi: '10.1056/NEJMoa2204705',
        measuredMetric: 'ALSFRS-R difference at week 28: 1.2 points, 95 percent CI -3.2 to 5.5, p=0.97',
        auditFlag: 'verified',
      },
      {
        id: 'tof-2',
        category: 'measured',
        title: 'Plasma neurofilament light chain fell 55 percent',
        laymanSummary:
          'A blood marker released when nerve fibres break down dropped by more than half in treated patients and rose in the placebo group.',
        technicalDetails:
          'At week 28 plasma neurofilament light chain showed a 55 percent reduction with tofersen against a 12 percent increase with placebo, p<0.0001. This, not any clinical measure, is the basis on which accelerated approval was granted. SOD1 protein in cerebrospinal fluid also fell, confirming target engagement.',
        evidenceSource: 'QALSODY US prescribing information, sections 1 and 14',
        doi: '10.1056/NEJMoa2204705',
        measuredMetric: 'Plasma NfL: -55 percent with tofersen versus +12 percent with placebo, p<0.0001',
        auditFlag: 'verified',
      },
      {
        id: 'tof-3',
        category: 'inferred',
        title: 'Neurofilament is a marker of damage, not a measure of how a patient is',
        laymanSummary:
          'Falling neurofilament means fewer nerve fibres are breaking down right now. It does not tell you whether someone will keep walking, swallowing or breathing.',
        technicalDetails:
          'The label states in plain terms that the indication is approved under accelerated approval based on reduction in plasma neurofilament light chain, and that continued approval may be contingent on verification of clinical benefit in confirmatory trials. In the same trial in which neurofilament fell 55 percent, the functional scale did not separate at all. The surrogate and the outcome pointed in different directions in the same 108 patients.',
        evidenceSource: 'QALSODY US prescribing information, section 1',
        doi: '10.1056/NEJMoa2204705',
        inferredClaim: 'That a 55 percent reduction in plasma neurofilament light chain slows ALS',
        auditFlag: 'contested',
      },
      {
        id: 'tof-4',
        category: 'conclusion_shift',
        title: 'The failure was reinterpreted as "treated too late"',
        laymanSummary:
          'When the trial missed, the field concluded the drug was given too late rather than that it does not work, and a new trial now starts treatment before symptoms appear.',
        technicalDetails:
          'In the combined analysis of the randomised phase and its open-label extension at 52 weeks, ALSFRS-R change was -6.0 in the early-start cohort against -9.5 in the delayed-start cohort, a difference of 3.5 points (95 percent CI 0.4 to 6.7). These comparisons were not adjusted for multiplicity and the cohorts were not randomised to their start times. That result, plus the neurofilament data, motivated ATLAS (NCT04856982), the first interventional trial in presymptomatic ALS, which has not yet reported.',
        evidenceSource: 'Miller et al., NEJM 2022, open-label extension analysis',
        doi: '10.1056/NEJMoa2204705',
        inferredClaim:
          'That earlier initiation would have produced a positive primary endpoint; the delayed-start comparison is not randomised evidence for that',
        auditFlag: 'caution',
      },
      {
        id: 'tof-5',
        category: 'measured',
        title: 'Serious neurologic adverse events in 7 percent of recipients',
        laymanSummary:
          'Some patients developed inflammation of the spinal cord or nerve roots, raised pressure in the head, or meningitis without infection.',
        technicalDetails:
          'The label carries warnings for myelitis and radiculitis, papilledema and elevated intracranial pressure, and aseptic meningitis. Neurologic serious adverse events occurred in 7 percent of tofersen recipients in the randomised phase. Common adverse reactions at 10 percent or more include pain, fatigue, arthralgia, increased cerebrospinal fluid white cell count and myalgia. Lumbar-puncture-related events were common in both arms.',
        evidenceSource: 'QALSODY US prescribing information, sections 5 and 6',
        doi: '10.1056/NEJMoa2204705',
        measuredMetric: 'Neurologic serious adverse events in 7 percent of tofersen recipients',
        auditFlag: 'verified',
      },
      {
        id: 'tof-6',
        category: 'inferred',
        title: 'It applies to about 2 percent of people with ALS',
        laymanSummary:
          'This is a drug for one genetic subtype. It says nothing about whether antisense will work for the other 98 percent of ALS.',
        technicalDetails:
          'SOD1 variants account for roughly 2 percent of all ALS. Tofersen lowers SOD1 specifically and has no mechanism of action in C9orf72, TDP-43 or sporadic disease. Trials of antisense drugs against other ALS genes are separate programmes with separate evidence, and the tofersen result does not transfer to them.',
        evidenceSource: 'QALSODY US prescribing information, section 1',
        inferredClaim: 'That tofersen demonstrates antisense therapy works in ALS generally',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intrathecal injection by lumbar puncture',
        laymanDesc:
          'The drug is injected into the fluid around the spinal cord, because nothing given into a vein reaches motor neurons.',
        molecularDetail:
          'Bolus intrathecal administration after three loading doses, then monthly. Distribution follows cerebrospinal fluid bulk flow to spinal cord and brain, with a long tissue residence time.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Free uptake into motor neurons and glia',
        laymanDesc: 'Nerve cells take the strand in directly, with no packaging around it.',
        molecularDetail:
          'Gymnotic uptake driven by phosphorothioate protein binding, followed by endosomal escape into nucleus and cytoplasm. Uptake is not neuron-selective; glia take up drug as well.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising to SOD1 messenger RNA',
        laymanDesc: 'It pairs with the instructions for the faulty protein.',
        molecularDetail:
          'The 10-base deoxynucleotide gap forms a heteroduplex with SOD1 mRNA; the flanking MOE wings raise affinity and block nuclease degradation. The drug does not discriminate mutant from wild-type transcript.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'RNase H1 destroys the transcript',
        laymanDesc:
          'An enzyme already present in the cell recognises the pairing and cuts the messenger strand.',
        molecularDetail:
          'RNase H1 cleaves the RNA strand of the DNA:RNA heteroduplex. The catalytic mechanism means one oligonucleotide molecule degrades many transcripts, sustaining knockdown between monthly doses.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'SOD1 protein falls and neurofilament release falls with it',
        laymanDesc:
          'Less of the toxic protein is made, and the blood marker of nerve breakdown drops sharply. Whether that changes what the patient can do is unproven.',
        molecularDetail:
          'Cerebrospinal fluid SOD1 decreases and plasma neurofilament light chain falls by 55 percent at week 28. The functional scale in the same trial showed no separation from placebo, which is the central unresolved fact about this drug.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VALOR Part C (NCT02623699)',
        phase: 'Phase 3',
        sampleSize: 108,
        primaryEndpoint:
          'Change from baseline to week 28 in ALSFRS-R total score in participants predicted to progress faster',
        endpointMet: false,
        statisticalPValue: 'p=0.97 (difference 1.2 points, 95 percent CI -3.2 to 5.5)',
        unreportedAdverseSignals:
          'Neurologic serious adverse events in 7 percent of tofersen recipients, including myelitis and radiculitis; lumbar-puncture-related events common in both arms',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Plasma neurofilament light chain reduced 55 percent against a 12 percent increase on placebo, p<0.0001',
        'Cerebrospinal fluid SOD1 protein reduced, confirming target engagement',
        'ALSFRS-R difference at week 28 of 1.2 points, p=0.97: no functional separation',
      ],
      unsupportedInferences: [
        'That falling neurofilament light chain predicts preserved function or survival in SOD1-ALS',
        'That the open-label delayed-start difference of 3.5 points is a randomised treatment effect',
        'That the result generalises to non-SOD1 ALS, which is about 98 percent of cases',
      ],
      whatFailedInitially: [
        'The pivotal clinical endpoint missed outright, and every secondary clinical endpoint with it',
        'An earlier SOD1 antisense candidate, ISIS 333611, was superseded before efficacy testing',
      ],
      realWorldOutcome: [
        'Approved in the United States in 2023 and in the European Union, on a biomarker rather than a clinical result',
        'ATLAS is testing initiation in presymptomatic SOD1 carriers with raised neurofilament, and has not reported',
      ],
    },
    deliverySystem: {
      type: 'Intrathecal injection of a mixed-backbone 2-prime-MOE gapmer',
      description:
        'Preservative-free solution given by lumbar puncture, three loading doses at 14-day intervals and then monthly. No carrier and no ligand; the phosphorothioate content alone drives cellular uptake.',
      safetyProfile:
        'Warnings for myelitis and radiculitis, papilledema with elevated intracranial pressure, and aseptic meningitis. Neurologic serious adverse events in 7 percent of recipients. Common reactions include pain, fatigue, arthralgia, raised cerebrospinal fluid white cell count and myalgia.',
    },
    commonQuestions: [
      {
        q: 'Did tofersen slow ALS in its pivotal trial?',
        a: 'No. The primary endpoint, change on the ALS functional rating scale at 28 weeks, gave a difference of 1.2 points with a p-value of 0.97. What did change was a blood marker of nerve fibre breakdown, which fell by 55 percent, and that is what the approval was based on.',
        auditNote: 'The label states the approval rests on the neurofilament reduction, not on function.',
      },
      {
        q: 'Is neurofilament light chain a reliable stand-in for how the disease progresses?',
        a: 'It is a well-validated marker of axonal damage and it tracks disease activity across many neurological conditions. Whether lowering it changes what happens to a patient is a separate question, and in this trial the marker and the functional scale disagreed.',
      },
      {
        q: 'Does tofersen help people with ordinary sporadic ALS?',
        a: 'No, and it is not expected to. It lowers SOD1 specifically, and SOD1 mutations account for around 2 percent of ALS. For everyone else the drug has no mechanism to act through.',
      },
      {
        q: 'Why do people say it was given too late rather than that it failed?',
        a: 'Because in the open-label extension, patients who started earlier declined less than those who switched over at 28 weeks, a 3.5-point difference at 52 weeks. That comparison was not randomised to start time and was not adjusted for multiplicity, so it generates a hypothesis. ATLAS, in presymptomatic carriers, is the trial designed to test it.',
        auditNote: 'A delayed-start comparison within an open-label extension is not a randomised result.',
      },
      {
        q: 'What are the risks?',
        a: 'Serious neurologic events including spinal cord and nerve root inflammation occurred in 7 percent of recipients, and the label carries warnings for raised intracranial pressure and aseptic meningitis. On top of that, every dose is a lumbar puncture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'QALSODY (tofersen) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=81356b45-1cb7-4eef-88ea-e44cc18b47c5',
        kind: 'regulatory',
      },
      {
        label: 'Miller et al., Trial of Antisense Oligonucleotide Tofersen for SOD1 ALS, NEJM 2022',
        identifier: '10.1056/NEJMoa2204705',
        kind: 'doi',
      },
      {
        label:
          'Cheng et al., Splice-Modulating Antisense Oligonucleotides as Therapeutics for Inherited Metabolic Diseases, BioDrugs 2024 (tofersen sequence)',
        identifier: '10.1007/s40259-024-00644-7',
        kind: 'doi',
      },
      {
        label:
          'Bourke et al., Effects of non-invasive ventilation on survival and quality of life in ALS, Lancet Neurology 2006',
        identifier: '10.1016/S1474-4422(05)70326-4',
        kind: 'doi',
      },
      {
        label:
          'Writing Group, Safety and efficacy of edaravone in well defined patients with ALS, Lancet Neurology 2017',
        identifier: '10.1016/S1474-4422(17)30115-1',
        kind: 'doi',
      },
      {
        label: 'Qalsody EPAR, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/qalsody',
        kind: 'regulatory',
      },
      { label: 'VALOR trial registration', identifier: 'NCT02623699', kind: 'nct' },
      { label: 'ATLAS presymptomatic trial registration', identifier: 'NCT04856982', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Mipomersen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mipomersen',
    name: 'Mipomersen',
    tradeName: 'Kynamro',
    sponsor: 'Ionis Pharmaceuticals / Genzyme, later Kastle Therapeutics',
    targetGene: 'APOB',
    targetProtein: 'Apolipoprotein B-100',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'Homozygous familial hypercholesterolaemia as an adjunct to lipid-lowering therapy; sales discontinued in 2018 and the US approval withdrawn in 2019',
    patientFriendlyIndication: 'Homozygous Familial Hypercholesterolaemia (withdrawn)',
    anatomicalSite: 'Liver hepatocyte',
    conditionContext: {
      conditionExplainer:
        'In homozygous familial hypercholesterolaemia both copies of the LDL receptor gene are defective, so the liver cannot clear LDL from the blood. Untreated LDL cholesterol runs above 500 mg/dL from childhood.',
      whyItMatters:
        'Coronary disease appears in childhood or adolescence. Statins work poorly because they act by raising LDL receptor numbers, and these patients have almost none that work.',
      whoTakesThis:
        'It was used in adults with HoFH on maximally tolerated lipid-lowering therapy. It is no longer marketed anywhere and the US approval has been withdrawn.',
      clinicalGoals:
        'Lower LDL by cutting production of the apolipoprotein that every LDL particle is built around, rather than by trying to clear particles through receptors that do not work.',
    },
    oneSentenceVerdict:
      'An antisense drug that lowered LDL cholesterol by 25 percent in 34 patients with homozygous familial hypercholesterolaemia by shutting down apolipoprotein B production, was refused by European regulators for hepatic steatosis, and had its US approval withdrawn in 2019 after sales ceased.',
    laymanHowItWorks:
      'Every particle of bad cholesterol is built around one copy of a scaffolding protein called apolipoprotein B, and the liver makes it. Mipomersen shut down that production so fewer particles could be assembled and exported. The problem was what happened to the fat that could no longer leave: it stayed in the liver. Hepatic fat rose by ten percentage points in six months, and that is what ended the drug.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 26,
    substitutes: {
      summary:
        'Two later drugs act on the same problem without the liver-fat trade-off, and lipoprotein apheresis remains the mechanical fallback for the most severe patients. Diet and plant sterols make a marginal difference in a disease driven by receptor failure.',
      conventionalRx: [
        {
          name: 'Lomitapide (Juxtapid)',
          class: 'Microsomal triglyceride transfer protein inhibitor',
          howItCompares:
            'Blocks lipoprotein assembly a step earlier than mipomersen. It reduced LDL cholesterol by roughly half in a single-arm HoFH trial, and it causes the same hepatic steatosis problem.',
          typicalCost: 'Branded orphan pricing in the hundreds of thousands of dollars per year',
          prosAndCons:
            'Pros: oral, larger LDL reduction. Cons: hepatic fat accumulation and a restricted prescribing programme, so it shares the flaw that sank mipomersen.',
        },
        {
          name: 'Evinacumab (Evkeeza)',
          class: 'Monoclonal antibody against ANGPTL3',
          howItCompares:
            'Lowered LDL cholesterol by about half in a randomised placebo-controlled HoFH trial, by a receptor-independent route, and without hepatic steatosis.',
          typicalCost: 'Branded orphan pricing in the hundreds of thousands of dollars per year',
          prosAndCons:
            'Pros: randomised evidence, works with null LDL receptors, no liver fat signal. Cons: intravenous infusion every four weeks and orphan pricing.',
        },
        {
          name: 'Lipoprotein apheresis',
          class: 'Extracorporeal LDL removal, not a drug',
          howItCompares:
            'Physically filters LDL from plasma every one to two weeks. It remains the fallback when drugs are insufficient, which in true receptor-negative HoFH is common.',
          typicalCost: 'Per-session procedure cost, typically funded through specialist lipid services',
          prosAndCons:
            'Pros: works regardless of receptor status. Cons: vascular access, hours per session, and LDL rebounds between treatments.',
        },
        {
          name: 'High-intensity statin with ezetimibe',
          class: 'HMG-CoA reductase inhibitor plus cholesterol absorption inhibitor',
          howItCompares:
            'The background therapy every HoFH trial is layered on. Effect depends on residual LDL receptor activity, so it is much weaker here than in ordinary hypercholesterolaemia.',
          typicalCost: 'Generic; typically under $25 / month combined in the US',
          prosAndCons:
            'Pros: cheap, decades of outcome evidence in other populations. Cons: mechanistically limited in receptor-negative patients.',
        },
      ],
      naturalFoods: [
        {
          name: 'Plant sterols and stanols',
          activeCompound: 'Beta-sitosterol and sitostanol',
          biologicalMechanism:
            'Compete with cholesterol for incorporation into intestinal micelles, reducing absorption. The effect is receptor-independent, which is why it is not entirely wasted in HoFH, but it is small against an untreated LDL above 500 mg/dL.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Around 2 g daily from fortified spreads or supplements, taken with meals',
          monthlyCost: '$12 to $20 / month',
        },
        {
          name: 'Soluble viscous fibre',
          activeCompound: 'Psyllium husk beta-glucan and arabinoxylan',
          biologicalMechanism:
            'Binds bile acids in the gut so the liver must convert more cholesterol into bile salts to replace them. Again receptor-independent and again modest.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'About 10 g of soluble fibre daily, taken with plenty of water',
          monthlyCost: '$8 to $15 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Cascade screening of first-degree relatives',
          action:
            'Testing parents, siblings and children of anyone diagnosed with familial hypercholesterolaemia.',
          patientImpact:
            'Every homozygote has two heterozygous parents and, on average, half of their siblings and children carry a variant. Screening finds people decades before symptoms.',
          clinicalPrecaution:
            'Genetic counselling should accompany testing. This is a family diagnosis, not an individual one.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'GCCUCAGTCTGCTTCGCACC',
      chemicalFormula: 'C230H305N67O122P19S19Na19 (sodium salt)',
      molecularWeight: '7,594.9 g/mol (sodium salt)',
      targetReceptorAffinity:
        'Binds the apoB-100 coding region at positions 3249 to 3268; 5-10-5 MOE gapmer recruiting RNase H',
      structureSource: {
        label:
          'KYNAMRO US prescribing information section 11, which prints the 20-mer sequence with its 2-prime-MOE and 5-methyl positions marked',
        identifier: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/203568s000lbl.pdf',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite qualification for a first-generation gapmer',
          description:
            'Release-test the five MOE amidites for each wing and the ten deoxy amidites for the gap. Mipomersen is an unconjugated design, so purity is the only lever on tissue distribution.',
          reagentsAndBuffer:
            'MOE and deoxy phosphoramidites including 5-methyl-dC, Karl Fischer titration, anhydrous acetonitrile',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase 5-10-5 gapmer assembly with full sulfurisation',
          description:
            'Twenty cycles with sulfurisation at every linkage. Full phosphorothioate content maximises tissue half-life and also maximises the protein binding that drives injection-site and hepatic effects.',
          reagentsAndBuffer:
            'Dichloroacetic acid detritylation, 5-(ethylthio)-1H-tetrazole, phenylacetyl disulfide, acetic anhydride cap',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange purification and sodium-salt exchange',
          description:
            'Separate the 20-mer from n-1 species and from partially oxidised diester impurities, then exchange to the sodium salt and lyophilise.',
          reagentsAndBuffer:
            'Ammonia cleavage, Source 30Q resin, sodium bromide gradient in 20 mM sodium hydroxide, tangential flow diafiltration',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Gymnotic uptake into HepG2 and primary human hepatocytes',
          description:
            'Free uptake without transfection reagent into hepatoma lines and primary hepatocytes, the models the label cites for in vitro pharmacology.',
          reagentsAndBuffer:
            'HepG2 and Hep3B cells, primary human and cynomolgus hepatocytes, Williams E medium, no lipofection reagent',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'ApoB mRNA and secreted apoB protein, with intracellular lipid staining',
          description:
            'Quantify apoB transcript and secreted protein, and stain for intracellular neutral lipid. The last measurement is the one that predicted the clinical hepatic steatosis.',
          reagentsAndBuffer:
            'TaqMan APOB probe set, apoB-100 immunoassay on culture supernatant, Oil Red O or BODIPY 493/503 lipid stain',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mip-1',
        category: 'measured',
        title: 'LDL cholesterol fell 24.7 percent against 3.3 percent on placebo',
        laymanSummary:
          'In 51 patients with the most severe inherited cholesterol disorder, treated patients dropped their LDL by about a quarter over 26 weeks.',
        technicalDetails:
          'NCT00607373 randomised 34 patients to mipomersen and 17 to placebo on top of maximally tolerated lipid-lowering therapy. Mean percentage change in LDL cholesterol was -24.7 percent (95 percent CI -31.6 to -17.7) with mipomersen against -3.3 percent (95 percent CI -12.1 to 5.5) with placebo, p=0.0003. The FDA label reports the same trial as -25 percent mean and -19 percent median, with a treatment difference against placebo of -21 percent.',
        evidenceSource: 'Raal et al., The Lancet 2010',
        doi: '10.1016/S0140-6736(10)60284-X',
        measuredMetric: 'LDL cholesterol -24.7 percent versus -3.3 percent, p=0.0003',
        auditFlag: 'verified',
      },
      {
        id: 'mip-2',
        category: 'failed',
        title: 'Hepatic fat rose by a median of 10 percentage points in 26 weeks',
        laymanSummary:
          'Blocking the export of fat from the liver left the fat in the liver. On MRI, liver fat went from zero to about ten percent in half a year.',
        technicalDetails:
          'The boxed warning records a median absolute increase in hepatic fat of 10 percent after 26 weeks of treatment, from 0 percent at baseline, measured by magnetic resonance imaging, in the heterozygous FH and hyperlipidaemia trials. Alanine aminotransferase rose to at least three times the upper limit of normal in 4 of 34 treated HoFH patients (12 percent) against none on placebo. Hepatic steatosis is a risk factor for steatohepatitis and cirrhosis, and the long-term consequence was never established.',
        evidenceSource: 'KYNAMRO US prescribing information, boxed warning',
        measuredMetric: 'Median absolute hepatic fat increase 10 percentage points at 26 weeks; ALT at least 3x ULN in 12 percent',
        auditFlag: 'verified',
      },
      {
        id: 'mip-3',
        category: 'inferred',
        title: 'LDL lowering was treated as cardiovascular benefit, which was never tested',
        laymanSummary:
          'No trial ever asked whether mipomersen prevented heart attacks. The approval rested entirely on the cholesterol number.',
        technicalDetails:
          'The pivotal trial was 26 weeks long with a lipid primary endpoint in 51 patients. No cardiovascular outcome trial was conducted before or after approval. LDL reduction is one of the best-supported surrogates in medicine, but that support comes from trials of drugs that lower LDL by increasing receptor-mediated clearance, not by trapping lipid in the liver. The mechanism matters to whether the surrogate transfers.',
        evidenceSource: 'KYNAMRO US prescribing information, section 14',
        doi: '10.1016/S0140-6736(10)60284-X',
        inferredClaim:
          'That a 25 percent LDL reduction achieved by blocking apoB synthesis reduces cardiovascular events',
        auditFlag: 'contested',
      },
      {
        id: 'mip-4',
        category: 'failed',
        title: 'The European Medicines Agency refused authorisation, twice',
        laymanSummary:
          'European regulators looked at the same data in 2012 and said the risks outweighed the benefit. They said the same again on re-examination in 2013.',
        technicalDetails:
          'The CHMP adopted a negative opinion on 13 December 2012 and confirmed the refusal on re-examination on 21 March 2013. Mipomersen was therefore approved in the United States and never authorised in the European Union, one of two drugs in this file where the two regulators diverged on the same dossier.',
        evidenceSource: 'European Medicines Agency, Kynamro refusal of marketing authorisation',
        auditFlag: 'verified',
      },
      {
        id: 'mip-5',
        category: 'failed',
        title: 'Sales stopped in 2018 and the approval was withdrawn in 2019',
        laymanSummary:
          'The drug passed through three owners, never sold, was pulled from the market in May 2018, and the FDA formally withdrew its approval the following year.',
        technicalDetails:
          'Kynamro moved from Genzyme back to Ionis and then to Kastle Therapeutics. Sales were discontinued on 31 May 2018 and the new drug application was among those withdrawn by the FDA in 2019. Restricted distribution under a REMS, weekly injection-site reactions in 84 percent of patients and flu-like symptoms in 30 percent left it with almost no prescribing base once lomitapide and later evinacumab arrived.',
        evidenceSource:
          'FDA Federal Register notice, Withdrawal of Approval of 11 New Drug Applications, 2019; KYNAMRO label sections 5.3 and 5.4',
        measuredMetric: 'Injection-site reactions in 84 percent and flu-like symptoms in 30 percent of patients',
        auditFlag: 'verified',
      },
      {
        id: 'mip-6',
        category: 'conclusion_shift',
        title: 'The field moved from blocking assembly to a receptor-independent antibody',
        laymanSummary:
          'Both drugs that stopped the liver exporting fat caused fatty liver. The lasting answer for this disease came from a different mechanism entirely.',
        technicalDetails:
          'Mipomersen and lomitapide both block lipoprotein assembly and both cause hepatic steatosis, which now looks like a mechanistic consequence rather than an accident of either molecule. Evinacumab, an ANGPTL3 antibody, lowered LDL by about half in a randomised placebo-controlled HoFH trial without that trade-off. The apoB antisense idea itself has not returned in this indication.',
        evidenceSource: 'Raal et al., Evinacumab for Homozygous Familial Hypercholesterolemia, NEJM 2020',
        doi: '10.1056/NEJMoa2004215',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly subcutaneous injection',
        laymanDesc: 'A weekly injection under the skin, which caused a local reaction in most patients.',
        molecularDetail:
          'Unconjugated full-phosphorothioate 20-mer, 200 mg weekly. Injection-site reactions occurred in 84 percent of patients, a direct consequence of high local phosphorothioate concentration.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into hepatocytes without a targeting ligand',
        laymanDesc:
          'Liver cells take the strand in on their own, but so do kidney and immune cells, because nothing directs it.',
        molecularDetail:
          'Phosphorothioate-driven adsorptive endocytosis. Without a GalNAc ligand, hepatocyte delivery is a matter of pharmacokinetic preference rather than targeting, which is why the required dose was high.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising to apoB-100 messenger RNA',
        laymanDesc: 'It pairs with the instructions for the scaffolding protein of every LDL particle.',
        molecularDetail:
          'Watson-Crick binding within the apoB coding region at positions 3249 to 3268. The label records that the effect was shown to be highly sequence-specific in hepatoma cells and primary hepatocytes.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'RNase H destroys the transcript',
        laymanDesc: 'A cellular enzyme cuts up the paired instructions so the protein is never translated.',
        molecularDetail:
          'RNase H-mediated degradation of the apoB mRNA at the deoxynucleotide gap, inhibiting translation of apoB-100 and therefore assembly of VLDL, the metabolic precursor of LDL.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'LDL falls, and triglyceride accumulates in the liver',
        laymanDesc:
          'Fewer cholesterol particles circulate, because the liver can no longer package fat for export. The fat stays behind.',
        molecularDetail:
          'Reduced VLDL secretion lowers plasma LDL by about a quarter. The triglyceride that would have been exported accumulates as hepatic steatosis, measured as a median 10 percentage point absolute increase in liver fat at 26 weeks. The therapeutic effect and the toxicity are two readings of the same event.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Mipomersen HoFH phase 3 (NCT00607373)',
        phase: 'Phase 3',
        sampleSize: 51,
        primaryEndpoint: 'Percentage change in LDL cholesterol from baseline to week 26',
        endpointMet: true,
        statisticalPValue: 'p=0.0003',
        unreportedAdverseSignals:
          'Alanine aminotransferase at least 3x upper limit of normal in 12 percent of treated patients and none on placebo; four discontinuations for adverse events, all in the mipomersen arm; hepatic fat accumulation measured only in the companion HeFH and hyperlipidaemia trials',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'LDL cholesterol -24.7 percent versus -3.3 percent on placebo over 26 weeks, p=0.0003',
        'Median absolute hepatic fat increase of 10 percentage points at 26 weeks by MRI',
        'ALT at least three times the upper limit of normal in 12 percent of treated HoFH patients',
        'Injection-site reactions in 84 percent and flu-like symptoms in 30 percent',
      ],
      unsupportedInferences: [
        'That the LDL reduction translates into fewer cardiovascular events; no outcome trial was ever run',
        'That the LDL surrogate transfers across mechanisms, when the mechanism here traps lipid in the liver',
      ],
      whatFailedInitially: [
        'Hepatic steatosis proved to be a consequence of the mechanism, not a manageable side effect',
        'The EMA refused authorisation in December 2012 and confirmed the refusal in March 2013',
        'Sales were discontinued on 31 May 2018 and the US approval was withdrawn in 2019',
      ],
      realWorldOutcome: [
        'No longer available anywhere; the approval no longer exists',
        'Its failure, alongside lomitapide, redirected homozygous FH therapy toward receptor-independent antibodies',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection of an unconjugated full-phosphorothioate 2-prime-MOE gapmer',
      description:
        'Single-use vials or prefilled syringes delivering 200 mg weekly, distributed only through a restricted REMS programme because of hepatotoxicity risk. No targeting ligand of any kind.',
      safetyProfile:
        'Boxed warning for hepatotoxicity, with transaminase and bilirubin monitoring before and during treatment and mandatory dose interruption at three times the upper limit of normal. Injection-site reactions in 84 percent, flu-like symptoms in 30 percent, nausea and headache common.',
    },
    commonQuestions: [
      {
        q: 'Can I still get mipomersen?',
        a: 'No. Sales stopped on 31 May 2018 and the FDA withdrew the approval in 2019. It was never authorised in the European Union at all.',
      },
      {
        q: 'Why did a drug that lowered LDL by 25 percent fail?',
        a: 'Because the way it lowered LDL was by preventing the liver from exporting fat, and the fat then stayed in the liver. Median liver fat rose by ten percentage points in six months. A cholesterol number that improves while the organ doing the work deteriorates is not a net benefit anyone could demonstrate.',
        auditNote: 'The hepatic steatosis appears in the boxed warning, not in a post-marketing footnote.',
      },
      {
        q: 'Did it prevent heart attacks?',
        a: 'Nobody measured that. The trial was 26 weeks long with a cholesterol endpoint in 51 patients, and no cardiovascular outcome trial was ever conducted.',
      },
      {
        q: 'What do patients with homozygous FH use now?',
        a: 'Lomitapide, evinacumab and lipoprotein apheresis on top of statins and ezetimibe. Evinacumab is the one that lowers LDL substantially without the liver-fat trade-off that mipomersen and lomitapide share.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'KYNAMRO (mipomersen sodium) US prescribing information, 2013',
        identifier: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2013/203568s000lbl.pdf',
        kind: 'regulatory',
      },
      {
        label:
          'Raal et al., Mipomersen, an apolipoprotein B synthesis inhibitor, for lowering of LDL cholesterol in homozygous familial hypercholesterolaemia, The Lancet 2010',
        identifier: '10.1016/S0140-6736(10)60284-X',
        kind: 'doi',
      },
      {
        label: 'Kynamro refusal of marketing authorisation, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/kynamro',
        kind: 'regulatory',
      },
      {
        label: 'Raal et al., Evinacumab for Homozygous Familial Hypercholesterolemia, NEJM 2020',
        identifier: '10.1056/NEJMoa2004215',
        kind: 'doi',
      },
      {
        label:
          'Cuchel et al., Efficacy and safety of a microsomal triglyceride transfer protein inhibitor in homozygous familial hypercholesterolaemia, The Lancet 2013',
        identifier: '10.1016/S0140-6736(12)61731-0',
        kind: 'doi',
      },
      { label: 'Mipomersen HoFH phase 3 registration', identifier: 'NCT00607373', kind: 'nct' },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Volanesorsen
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'volanesorsen',
    name: 'Volanesorsen',
    tradeName: 'Waylivra',
    sponsor: 'Ionis Pharmaceuticals / Akcea Therapeutics',
    targetGene: 'APOC3',
    targetProtein: 'Apolipoprotein C-III',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'EMA Approved',
    approvalYear: 2019,
    indication:
      'Familial chylomicronaemia syndrome in adults, as an adjunct to diet; conditionally authorised in the European Union and refused in the United States',
    patientFriendlyIndication: 'Familial Chylomicronaemia Syndrome (very high triglycerides)',
    anatomicalSite: 'Liver hepatocyte',
    conditionContext: {
      conditionExplainer:
        'In familial chylomicronaemia syndrome the enzyme that strips fat out of the bloodstream, lipoprotein lipase, does not work. Triglycerides run above 1,000 mg/dL and the blood can look like milk.',
      whyItMatters:
        'The consequence is recurrent acute pancreatitis, which is agonising, unpredictable and sometimes fatal. Before volanesorsen there was no drug therapy at all, only a near-fat-free diet.',
      whoTakesThis:
        'Adults with genetically confirmed FCS and severe hypertriglyceridaemia in whom diet and other agents have failed, in countries where it is authorised.',
      clinicalGoals:
        'Cut triglycerides far enough to reduce pancreatitis risk, without dropping platelets to a level that causes bleeding.',
    },
    oneSentenceVerdict:
      'An antisense drug that cut triglycerides by 77 percent in familial chylomicronaemia syndrome and dropped platelet counts below 100,000 per microlitre in 15 of 33 treated patients, which is why the FDA refused it and the EMA authorised it conditionally.',
    laymanHowItWorks:
      'Apolipoprotein C-III sits on fat-carrying particles and blocks the enzyme that clears them. Volanesorsen stops the liver making it, so clearance improves through routes that do not need the broken enzyme. In the trial triglycerides fell by more than three quarters. Nearly half the treated patients also had their platelet count fall below the safe threshold, and two fell below a quarter of it.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 48,
    substitutes: {
      summary:
        'A very low fat diet remains the foundation of care and is the comparator every drug is added to. A GalNAc-conjugated successor against the same target was approved in the United States in 2024 without the platelet problem.',
      conventionalRx: [
        {
          name: 'Olezarsen (Tryngolza)',
          class: 'GalNAc-conjugated antisense oligonucleotide against APOC3',
          howItCompares:
            'The same target and the same base sequence with a liver-targeting sugar cluster attached, dosed monthly. Approved in the United States in December 2024 for FCS as an adjunct to diet.',
          typicalCost: 'Branded orphan pricing; monthly subcutaneous injection',
          prosAndCons:
            'Pros: no equivalent platelet signal, monthly dosing, US approval. Cons: no head-to-head randomised comparison with volanesorsen.',
        },
        {
          name: 'Fibrates, omega-3 fatty acids and statins',
          class: 'Conventional triglyceride-lowering drugs',
          howItCompares:
            'All act through pathways that require functioning lipoprotein lipase, so they are largely ineffective in genuine FCS. They are usually tried first and usually fail.',
          typicalCost: 'Generic; typically under $30 / month in the US',
          prosAndCons:
            'Pros: cheap and widely available. Cons: mechanistically mismatched to a disease of lipase deficiency.',
        },
      ],
      naturalFoods: [
        {
          name: 'Very low fat diet',
          activeCompound: 'Restriction of long-chain triglycerides',
          biologicalMechanism:
            'Chylomicrons are made from dietary long-chain fat. If lipoprotein lipase cannot clear them, the only lever left is to make fewer of them, which means restricting the fat that forms them.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Long-chain fat restricted to roughly 15 to 20 g per day, dietitian-supervised, with fat-soluble vitamin monitoring',
          monthlyCost: 'No product cost; specialist dietitian input required',
        },
        {
          name: 'Medium-chain triglyceride oil',
          activeCompound: 'C8 and C10 fatty acids',
          biologicalMechanism:
            'Medium-chain fats are absorbed into the portal vein directly rather than packaged into chylomicrons, so they supply calories without adding to the particle load that cannot be cleared.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Used as the main added fat within a dietitian-set daily allowance',
          monthlyCost: '$20 to $40 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Complete alcohol avoidance',
          action: 'No alcohol at all, including in cooking and in medicines.',
          patientImpact:
            'Alcohol drives hepatic VLDL output and is one of the commonest precipitants of an acute pancreatitis episode in FCS.',
          clinicalPrecaution:
            'Also relevant to any oestrogen-containing medication, which raises triglycerides sharply in this population.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: 'AGCTTCTTGTCCAGCTTTAT',
      chemicalFormula: 'C230H320N63O125P19S19',
      molecularWeight: '7,165.21 Da',
      targetReceptorAffinity:
        '5-10-5 MOE gapmer with a full phosphorothioate backbone; recruits RNase H1 to APOC3 mRNA',
      structureSource: {
        label:
          'Yu et al., Mol Ther Nucleic Acids 2017, Table 1 (ISIS 304801, 20-mer, 7,165.21 Da, hypertriglyceridaemia); molecular formula from PubChem CID 121494123',
        identifier: '10.1016/j.omtn.2017.08.012',
        kind: 'doi',
      },
      laboratoryWorkflow: [
        {
          id: 's1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amidite qualification and sequence identity confirmation',
          description:
            'Release-test MOE and deoxy amidites and confirm the 20-mer identity, which is shared with the later GalNAc-conjugated compound against the same target.',
          reagentsAndBuffer:
            'MOE and deoxy phosphoramidites, Karl Fischer titration, anhydrous acetonitrile, intact-mass LC-MS identity check',
        },
        {
          id: 's2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Solid-phase 5-10-5 gapmer assembly with full sulfurisation',
          description:
            'Twenty cycles with sulfurisation at every linkage, giving the unconjugated phosphorothioate design whose systemic exposure is the origin of the platelet signal.',
          reagentsAndBuffer:
            'Dichloroacetic acid detritylation, 5-(ethylthio)-1H-tetrazole, phenylacetyl disulfide, acetic anhydride cap',
          dependsOnStepId: 's1',
        },
        {
          id: 's3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion-exchange purification and sodium-salt exchange',
          description:
            'Resolve the full-length species from shortmers and partially oxidised impurities, then desalt into the injectable sodium salt form.',
          reagentsAndBuffer:
            'Ammonia cleavage, Source 30Q resin, sodium bromide gradient, tangential flow diafiltration',
          dependsOnStepId: 's2',
        },
        {
          id: 's4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Gymnotic uptake into primary human hepatocytes, with a platelet co-culture control',
          description:
            'Free uptake into hepatocytes for the pharmacology, run alongside a platelet-activation readout, because platelet effects were the finding that decided this drug regulatory fate.',
          reagentsAndBuffer:
            'Primary human hepatocytes in Williams E medium, washed human platelets, anti-CD62P (P-selectin) flow cytometry panel',
          dependsOnStepId: 's3',
        },
        {
          id: 's5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'APOC3 knockdown and post-heparin lipolysis readout',
          description:
            'Quantify APOC3 transcript and secreted apoC-III, then measure triglyceride hydrolysis in the presence and absence of apoC-III to confirm the clearance mechanism.',
          reagentsAndBuffer:
            'TaqMan APOC3 probe set, apoC-III immunoassay, fluorogenic lipase substrate with recombinant lipoprotein lipase',
          dependsOnStepId: 's4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vol-1',
        category: 'measured',
        title: 'Triglycerides fell 77 percent, a mean drop of 1,712 mg/dL',
        laymanSummary:
          'Treated patients lost more than three quarters of their circulating triglycerides in three months, while the placebo group went up.',
        technicalDetails:
          'APPROACH (NCT02211209) randomised 66 patients with FCS 1:1 for 52 weeks. At three months mean triglycerides fell 77 percent with volanesorsen, a mean decrease of 1,712 mg/dL (95 percent CI 1,330 to 2,094), against an 18 percent increase on placebo, p<0.001. Plasma apoC-III fell 84 percent against a 6.1 percent increase on placebo, p<0.001. At three months 77 percent of treated patients were below 750 mg/dL against 10 percent of placebo patients.',
        evidenceSource: 'Witztum et al., New England Journal of Medicine 2019 (APPROACH)',
        doi: '10.1056/NEJMoa1715944',
        measuredMetric: 'Triglycerides -77 percent versus +18 percent, p<0.001',
        auditFlag: 'verified',
      },
      {
        id: 'vol-2',
        category: 'failed',
        title: 'Platelets dropped below 100,000 per microlitre in 15 of 33 treated patients',
        laymanSummary:
          'Nearly half the treated patients had a clinically important fall in platelet count, and two fell below 25,000, a level at which spontaneous bleeding becomes a real risk. Nobody on placebo did.',
        technicalDetails:
          'In APPROACH, 15 of 33 volanesorsen patients had platelet counts below 100,000 per microlitre, including 2 below 25,000, against 0 of 33 on placebo. After enhanced platelet monitoring was introduced mid-trial no patient fell below 50,000. Injection-site reactions occurred in 20 of 33 treated patients and none on placebo.',
        evidenceSource: 'Witztum et al., NEJM 2019, results section',
        doi: '10.1056/NEJMoa1715944',
        measuredMetric: 'Platelets below 100,000/microlitre in 15 of 33 treated versus 0 of 33 placebo',
        auditFlag: 'verified',
      },
      {
        id: 'vol-3',
        category: 'failed',
        title: 'The FDA refused approval after its own advisory committee voted in favour',
        laymanSummary:
          'An expert panel voted 12 to 8 to recommend approval. Three months later the agency issued a complete response letter and refused it anyway.',
        technicalDetails:
          'The FDA advisory committee voted 12-8 in favour in May 2018. A complete response letter was issued on 27 August 2018. The advisory committee vote is advisory, and the divergence is a useful reminder that a favourable panel is not a decision. Volanesorsen has never been approved in the United States.',
        evidenceSource: 'Akcea and Ionis complete response letter announcement, 27 August 2018',
        auditFlag: 'contested',
      },
      {
        id: 'vol-4',
        category: 'conclusion_shift',
        title: 'The EMA authorised it conditionally on the same dossier the FDA refused',
        laymanSummary:
          'Europe approved it with conditions in 2019, restricted to patients whose diet and other drugs have failed. The United States did not approve it at all.',
        technicalDetails:
          'Waylivra received a conditional marketing authorisation in the European Union in 2019 for genetically confirmed FCS in adults at high risk of pancreatitis in whom response to diet and triglyceride-lowering therapy has been inadequate. Conditional authorisation carries an obligation to supply further data. Two regulators weighed the same 77 percent triglyceride reduction against the same platelet signal and reached opposite conclusions.',
        evidenceSource: 'Waylivra EPAR, European Medicines Agency',
        auditFlag: 'contested',
      },
      {
        id: 'vol-5',
        category: 'inferred',
        title: 'Pancreatitis prevention was inferred, not measured',
        laymanSummary:
          'The reason FCS matters is pancreatitis. The trial measured triglycerides, and it was not built to count pancreatitis attacks.',
        technicalDetails:
          'The APPROACH primary endpoint was the percentage change in fasting triglycerides at three months. With 66 patients over 52 weeks in a disease where attacks are episodic, the trial had no power to demonstrate a reduction in pancreatitis events. The inference from triglyceride level to pancreatitis risk is biologically well supported and it is still an inference.',
        evidenceSource: 'Witztum et al., NEJM 2019, methods',
        doi: '10.1056/NEJMoa1715944',
        inferredClaim: 'That volanesorsen was shown in APPROACH to prevent episodes of acute pancreatitis',
        auditFlag: 'caution',
      },
      {
        id: 'vol-6',
        category: 'conclusion_shift',
        title: 'The same sequence with a GalNAc ligand cleared the bar volanesorsen could not',
        laymanSummary:
          'Attaching a liver-targeting sugar to the same antisense strand removed the platelet problem, and that version was approved in the United States in 2024.',
        technicalDetails:
          'Olezarsen carries the identical 20-mer base sequence conjugated to a triantennary GalNAc ligand, which was catalogued in the Ionis comparative programme as ISIS 678354. It was approved in the United States in December 2024 for FCS as an adjunct to diet. The same lesson appears in this file with inotersen and eplontersen: the toxicity that defined the first-generation drug was largely a consequence of how much drug had to be given, not of what the sequence does.',
        evidenceSource:
          'Crooke et al., Nucleic Acid Therapeutics 2019, Table 1 (ISIS 678354, ApoC3); Ionis announcement of US approval of olezarsen, December 2024',
        doi: '10.1089/nat.2018.0753',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Weekly subcutaneous injection',
        laymanDesc:
          'A weekly injection under the skin, which produced a local reaction in most treated patients.',
        molecularDetail:
          'Unconjugated full-phosphorothioate 20-mer, 285 mg weekly in a prefilled syringe. Injection-site reactions occurred in 20 of 33 treated patients in APPROACH and in none on placebo.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake into hepatocytes, and into everything else',
        laymanDesc:
          'The liver takes most of it up, but with nothing directing the drug it also reaches other tissues, including cells that interact with platelets.',
        molecularDetail:
          'Phosphorothioate-driven adsorptive endocytosis without a targeting ligand. The high weekly dose required for hepatic knockdown is also the exposure that produced the platelet and injection-site findings.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Hybridising to APOC3 messenger RNA',
        laymanDesc: 'It pairs with the liver instructions for apolipoprotein C-III.',
        molecularDetail:
          'Watson-Crick duplex formation at the deoxynucleotide gap with the APOC3 transcript, with 2-prime-MOE wings providing affinity and nuclease resistance.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'RNase H1 degrades the transcript',
        laymanDesc: 'A cellular enzyme cuts the paired instructions so apoC-III is not made.',
        molecularDetail:
          'RNase H1 cleaves the RNA strand of the heteroduplex. Plasma apoC-III fell 84 percent from baseline at three months, confirming target engagement in patients.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Triglyceride-rich particles clear by lipase-independent routes',
        laymanDesc:
          'Without apoC-III blocking the way, the body clears fat particles through pathways that do not need the enzyme these patients are missing.',
        molecularDetail:
          'Loss of apoC-III relieves inhibition of lipoprotein lipase and, importantly in FCS where lipase activity is absent, enhances hepatic receptor-mediated uptake of triglyceride-rich remnants. That second route is why the drug works in patients whose lipase does not.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'APPROACH (NCT02211209)',
        phase: 'Phase 3',
        sampleSize: 66,
        primaryEndpoint: 'Percentage change in fasting triglyceride level from baseline to month 3',
        endpointMet: true,
        statisticalPValue: 'p<0.001',
        unreportedAdverseSignals:
          'Platelet counts below 100,000 per microlitre in 15 of 33 treated patients, including 2 below 25,000, against none on placebo; injection-site reactions in 20 of 33 treated patients',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Fasting triglycerides -77 percent at three months against +18 percent on placebo, p<0.001',
        'Plasma apoC-III -84 percent against +6.1 percent on placebo, p<0.001',
        '77 percent of treated patients below 750 mg/dL at three months, against 10 percent on placebo',
        'Platelets below 100,000 per microlitre in 15 of 33 treated patients',
      ],
      unsupportedInferences: [
        'That the trial demonstrated a reduction in acute pancreatitis events; it was not powered for that endpoint',
        'That the favourable advisory committee vote implied approval was likely',
      ],
      whatFailedInitially: [
        'Thrombocytopenia in nearly half of treated patients, with two below 25,000 per microlitre',
        'The FDA issued a complete response letter in August 2018 despite a 12-8 advisory committee vote in favour',
      ],
      realWorldOutcome: [
        'Conditionally authorised in the European Union in 2019, never approved in the United States',
        'A GalNAc-conjugated successor against the same target was approved in the United States in December 2024',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection of an unconjugated full-phosphorothioate 2-prime-MOE gapmer',
      description:
        'Prefilled syringe containing 285 mg for weekly self-injection, with mandatory platelet monitoring. No targeting ligand; hepatic exposure comes from the pharmacokinetics of the chemistry alone.',
      safetyProfile:
        'Thrombocytopenia is the defining risk and requires regular platelet counts with dose interruption rules. Injection-site reactions are very common. The European authorisation is conditional and restricted to patients who have failed diet and other therapy.',
    },
    commonQuestions: [
      {
        q: 'Was volanesorsen shown to prevent pancreatitis?',
        a: 'No. APPROACH measured triglycerides at three months in 66 patients. Pancreatitis attacks are episodic and the trial had no power to count them. The link from very high triglycerides to pancreatitis is strong biology, but it was not the thing measured.',
        auditNote: 'The primary endpoint was percentage change in fasting triglycerides, not an event count.',
      },
      {
        q: 'Why did Europe approve it and the United States refuse it?',
        a: 'Both regulators saw a 77 percent triglyceride reduction and a thrombocytopenia signal in nearly half of treated patients. The EMA granted a conditional authorisation restricted to patients who had failed diet and other drugs; the FDA issued a complete response letter, three months after its own advisory committee had voted 12 to 8 in favour.',
      },
      {
        q: 'Is diet still necessary on treatment?',
        a: 'Yes. The European authorisation is explicitly as an adjunct to diet. A very low fat diet is the foundation of FCS care because it reduces the number of chylomicrons formed in the first place, and no drug removes that requirement.',
      },
      {
        q: 'How does olezarsen differ?',
        a: 'It is the same base sequence with a triantennary GalNAc cluster attached, which delivers it into liver cells efficiently enough that far less drug is needed. It is dosed monthly, does not carry the same platelet problem, and was approved in the United States in December 2024.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Witztum et al., Volanesorsen and Triglyceride Levels in Familial Chylomicronemia Syndrome, NEJM 2019 (APPROACH)',
        identifier: '10.1056/NEJMoa1715944',
        kind: 'doi',
      },
      {
        label: 'Waylivra EPAR and product information, European Medicines Agency',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/waylivra',
        kind: 'regulatory',
      },
      {
        label: 'Yu et al., Mol Ther Nucleic Acids 2017, Table 1 (ISIS 304801 sequence and mass)',
        identifier: '10.1016/j.omtn.2017.08.012',
        kind: 'doi',
      },
      {
        label:
          'Crooke et al., Integrated Assessment of the Clinical Performance of GalNAc3-Conjugated 2-prime-MOE ASOs, Nucleic Acid Therapeutics 2019 (ISIS 678354, same APOC3 sequence)',
        identifier: '10.1089/nat.2018.0753',
        kind: 'doi',
      },
      {
        label: 'PubChem compound record for volanesorsen (CID 121494123)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/121494123',
        kind: 'url',
      },
      { label: 'APPROACH trial registration', identifier: 'NCT02211209', kind: 'nct' },
    ],
  },
]
