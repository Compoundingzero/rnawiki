import type { SeedDossier } from '@/lib/seed-types'

/**
 * mRNA vaccines and therapeutics.
 *
 * Every trial number, endpoint, confidence interval and label statement below was read from the
 * cited paper, the ClinicalTrials.gov record or the current FDA prescribing information at the time
 * of writing. Nothing is quoted from memory.
 *
 * Two of these records carry a full-length coding sequence. It is the independently assembled
 * contig published from vial residue in 2021, not a manufacturer disclosure, and it is the ancestral
 * construct: both products are now strain-updated every year, so the sequence on the page is the
 * molecule the pivotal trials tested and not the molecule sold today. The engine will refuse to fold
 * either of them — Layer 2 stops at 1,000 nucleotides and these are four times that — so neither
 * record can carry a machine-verified badge. A refusal the reader can see beats a fold of the first
 * thousand bases, which would be the fold of a molecule that does not exist.
 */
export const MRNA_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // Tozinameran (Comirnaty)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tozinameran',
    name: 'Tozinameran',
    tradeName: 'Comirnaty',
    sponsor: 'BioNTech / Pfizer',
    targetGene: 'SARS-CoV-2 S (viral spike gene; no human gene is targeted)',
    targetProtein: 'SARS-CoV-2 prefusion-stabilised spike glycoprotein',
    modality: 'mRNA Vaccine / Therapeutic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2021,
    indication:
      'Active immunisation to prevent COVID-19 caused by SARS-CoV-2. The current US label covers people 65 years and older, and people 5 through 64 years with at least one condition that raises their risk of severe outcomes.',
    patientFriendlyIndication: 'COVID-19 prevention in older adults and people at higher risk',
    conditionContext: {
      conditionExplainer:
        'COVID-19 is the illness caused by SARS-CoV-2, a coronavirus that enters human cells by docking its spike protein onto the ACE2 receptor. Most infections are mild. In older adults and people with heart, lung, kidney or immune conditions the same virus can drive pneumonia, microvascular clotting and organ failure.',
      whyItMatters:
        'The chance that an infection becomes the kind that puts a person in hospital rises steeply with age and with the number of underlying conditions. That gap, not infection itself, is what the vaccine was built to narrow.',
      whoTakesThis:
        'Under the current US label, adults 65 and older, and people aged 5 through 64 who have at least one condition that raises their risk of severe COVID-19.',
      clinicalGoals:
        'Reduce symptomatic infection in the months after a dose, and reduce hospitalisation and death from COVID-19.',
    },
    oneSentenceVerdict:
      'Nucleoside-modified mRNA for a prefusion-stabilised spike protein, wrapped in a lipid nanoparticle, which cut symptomatic PCR-confirmed COVID-19 by 95% over a median of two months in 43,448 randomised participants.',
    laymanHowItWorks:
      'The injection carries a recipe, not a virus. Fat droplets about a thousandth the width of a hair carry that recipe into cells near the injection site and in the lymph node that drains it. Those cells build one harmless coronavirus surface protein and show it to the immune system, which learns the shape and keeps a memory of it. The recipe is chewed up by ordinary cellular enzymes within days and never goes near the cell nucleus.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 93,
    anatomicalSite:
      'Deltoid muscle and the draining axillary lymph node; translation occurs in the cytoplasm of muscle cells and antigen-presenting cells',
    pricing: {
      synthesisCostPerDose:
        '$2.39 per dose in a published techno-economic model of a 30 microgram mRNA dose, including fill-to-finish in five-dose vials',
      retailPricePerDoseOrYear:
        '$110 – $130 per dose, the US commercial list price both mRNA manufacturers announced for 2023',
      markupEstimate:
        '46x to 54x the modelled production cost, and roughly four times the $30.48 per dose the US government paid Pfizer for bivalent boosters in 2022',
      openPatentNotes:
        'The nucleoside-modification chemistry behind this class (Kariko and Weissman, University of Pennsylvania) is licensed, not open. Lipid nanoparticle patents have been litigated between Moderna, Arbutus/Genevant and Alnylam. The coding sequence itself is not secret: it was assembled from vial residue and published independently in 2021.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Kis et al., Pandemic-response adenoviral vector and RNA vaccine manufacturing, npj Vaccines 2022',
        identifier: '10.1038/s41541-022-00447-3',
        kind: 'doi',
      },
      priceSource: {
        label:
          'KFF, How Much Could COVID-19 Vaccines Cost the U.S. After Commercialization? (10 March 2023)',
        identifier:
          'https://www.kff.org/covid-19/how-much-could-covid-19-vaccines-cost-the-u-s-after-commercialization/',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'The real alternatives are the other licensed COVID-19 vaccines. No food, supplement or household measure has been shown in a randomised trial to prevent COVID-19, so the dietary and home-remedy lists here are empty on purpose rather than filled with plausible-sounding entries.',
      conventionalRx: [
        {
          name: 'Elasomeran (Spikevax)',
          class: 'Nucleoside-modified mRNA vaccine, SM-102 lipid nanoparticle',
          howItCompares:
            'The same platform at a larger mRNA dose. Its own phase 3 trial measured 94.1% efficacy against symptomatic COVID-19 and, unlike the Pfizer trial, also measured a 63.0% reduction in asymptomatic infection.',
          typicalCost: '$110 – $130 per dose announced US commercial list price',
          prosAndCons:
            'Pros: measured asymptomatic infection as well as symptomatic disease. Cons: Nordic register data put the excess myocarditis rate in males 16 to 24 at 18.39 per 100,000 second doses, against 5.55 for this vaccine.',
        },
        {
          name: 'NVX-CoV2373 (Nuvaxovid)',
          class: 'Recombinant spike protein nanoparticle with Matrix-M adjuvant',
          howItCompares:
            'A protein vaccine rather than an mRNA one. PREVENT-19 measured 90.4% efficacy against symptomatic COVID-19 in 29,582 adults, largely during the alpha wave.',
          typicalCost: 'US commercial list price not verified for this record',
          prosAndCons:
            'Pros: an option for people who want to avoid the mRNA platform. Cons: far fewer real-world effectiveness studies, and its trial ran against a different set of variants.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3:
        'GAGAAUAAACUAGUAUUCUUCUGGUCCCCACAGACUCAGAGAGAACCCGCCACCAUGUUCGUGUUCCUGGUGCUGCUGCCUCUGGUGUCCAGCCAGUGUGUGAACCUGACCACCAGAACACAGCUGCCUCCAGCCUACACCAACAGCUUUACCAGAGGCGUGUACUACCCCGACAAGGUGUUCAGAUCCAGCGUGCUGCACUCUACCCAGGACCUGUUCCUGCCUUUCUUCAGCAACGUGACCUGGUUCCACGCCAUCCACGUGUCCGGCACCAAUGGCACCAAGAGAUUCGACAACCCCGUGCUGCCCUUCAACGACGGGGUGUACUUUGCCAGCACCGAGAAGUCCAACAUCAUCAGAGGCUGGAUCUUCGGCACCACACUGGACAGCAAGACCCAGAGCCUGCUGAUCGUGAACAACGCCACCAACGUGGUCAUCAAAGUGUGCGAGUUCCAGUUCUGCAACGACCCCUUCCUGGGCGUCUACUACCACAAGAACAACAAGAGCUGGAUGGAAAGCGAGUUCCGGGUGUACAGCAGCGCCAACAACUGCACCUUCGAGUACGUGUCCCAGCCUUUCCUGAUGGACCUGGAAGGCAAGCAGGGCAACUUCAAGAACCUGCGCGAGUUCGUGUUUAAGAACAUCGACGGCUACUUCAAGAUCUACAGCAAGCACACCCCUAUCAACCUCGUGCGGGAUCUGCCUCAGGGCUUCUCUGCUCUGGAACCCCUGGUGGAUCUGCCCAUCGGCAUCAACAUCACCCGGUUUCAGACACUGCUGGCCCUGCACAGAAGCUACCUGACACCUGGCGAUAGCAGCAGCGGAUGGACAGCUGGUGCCGCCGCUUACUAUGUGGGCUACCUGCAGCCUAGAACCUUCCUGCUGAAGUACAACGAGAACGGCACCAUCACCGACGCCGUGGAUUGUGCUCUGGAUCCUCUGAGCGAGACAAAGUGCACCCUGAAGUCCUUCACCGUGGAAAAGGGCAUCUACCAGACCAGCAACUUCCGGGUGCAGCCCACCGAAUCCAUCGUGCGGUUCCCCAAUAUCACCAAUCUGUGCCCCUUCGGCGAGGUGUUCAAUGCCACCAGAUUCGCCUCUGUGUACGCCUGGAACCGGAAGCGGAUCAGCAAUUGCGUGGCCGACUACUCCGUGCUGUACAACUCCGCCAGCUUCAGCACCUUCAAGUGCUACGGCGUGUCCCCUACCAAGCUGAACGACCUGUGCUUCACAAACGUGUACGCCGACAGCUUCGUGAUCCGGGGAGAUGAAGUGCGGCAGAUUGCCCCUGGACAGACAGGCAAGAUCGCCGACUACAACUACAAGCUGCCCGACGACUUCACCGGCUGUGUGAUUGCCUGGAACAGCAACAACCUGGACUCCAAAGUCGGCGGCAACUACAAUUACCUGUACCGGCUGUUCCGGAAGUCCAAUCUGAAGCCCUUCGAGCGGGACAUCUCCACCGAGAUCUAUCAGGCCGGCAGCACCCCUUGUAACGGCGUGGAAGGCUUCAACUGCUACUUCCCACUGCAGUCCUACGGCUUUCAGCCCACAAAUGGCGUGGGCUAUCAGCCCUACAGAGUGGUGGUGCUGAGCUUCGAACUGCUGCAUGCCCCUGCCACAGUGUGCGGCCCUAAGAAAAGCACCAAUCUCGUGAAGAACAAAUGCGUGAACUUCAACUUCAACGGCCUGACCGGCACCGGCGUGCUGACAGAGAGCAACAAGAAGUUCCUGCCAUUCCAGCAGUUUGGCCGGGAUAUCGCCGAUACCACAGACGCCGUUAGAGAUCCCCAGACACUGGAAAUCCUGGACAUCACCCCUUGCAGCUUCGGCGGAGUGUCUGUGAUCACCCCUGGCACCAACACCAGCAAUCAGGUGGCAGUGCUGUACCAGGACGUGAACUGUACCGAAGUGCCCGUGGCCAUUCACGCCGAUCAGCUGACACCUACAUGGCGGGUGUACUCCACCGGCAGCAAUGUGUUUCAGACCAGAGCCGGCUGUCUGAUCGGAGCCGAGCACGUGAACAAUAGCUACGAGUGCGACAUCCCCAUCGGCGCUGGAAUCUGCGCCAGCUACCAGACACAGACAAACAGCCCUCGGAGAGCCAGAAGCGUGGCCAGCCAGAGCAUCAUUGCCUACACAAUGUCUCUGGGCGCCGAGAACAGCGUGGCCUACUCCAACAACUCUAUCGCUAUCCCCACCAACUUCACCAUCAGCGUGACCACAGAGAUCCUGCCUGUGUCCAUGACCAAGACCAGCGUGGACUGCACCAUGUACAUCUGCGGCGAUUCCACCGAGUGCUCCAACCUGCUGCUGCAGUACGGCAGCUUCUGCACCCAGCUGAAUAGAGCCCUGACAGGGAUCGCCGUGGAACAGGACAAGAACACCCAAGAGGUGUUCGCCCAAGUGAAGCAGAUCUACAAGACCCCUCCUAUCAAGGACUUCGGCGGCUUCAAUUUCAGCCAGAUUCUGCCCGAUCCUAGCAAGCCCAGCAAGCGGAGCUUCAUCGAGGACCUGCUGUUCAACAAAGUGACACUGGCCGACGCCGGCUUCAUCAAGCAGUAUGGCGAUUGUCUGGGCGACAUUGCCGCCAGGGAUCUGAUUUGCGCCCAGAAGUUUAACGGACUGACAGUGCUGCCUCCUCUGCUGACCGAUGAGAUGAUCGCCCAGUACACAUCUGCCCUGCUGGCCGGCACAAUCACAAGCGGCUGGACAUUUGGAGCAGGCGCCGCUCUGCAGAUCCCCUUUGCUAUGCAGAUGGCCUACCGGUUCAACGGCAUCGGAGUGACCCAGAAUGUGCUGUACGAGAACCAGAAGCUGAUCGCCAACCAGUUCAACAGCGCCAUCGGCAAGAUCCAGGACAGCCUGAGCAGCACAGCAAGCGCCCUGGGAAAGCUGCAGGACGUGGUCAACCAGAAUGCCCAGGCACUGAACACCCUGGUCAAGCAGCUGUCCUCCAACUUCGGCGCCAUCAGCUCUGUGCUGAACGAUAUCCUGAGCAGACUGGACCCUCCUGAGGCCGAGGUGCAGAUCGACAGACUGAUCACAGGCAGACUGCAGAGCCUCCAGACAUACGUGACCCAGCAGCUGAUCAGAGCCGCCGAGAUUAGAGCCUCUGCCAAUCUGGCCGCCACCAAGAUGUCUGAGUGUGUGCUGGGCCAGAGCAAGAGAGUGGACUUUUGCGGCAAGGGCUACCACCUGAUGAGCUUCCCUCAGUCUGCCCCUCACGGCGUGGUGUUUCUGCACGUGACAUAUGUGCCCGCUCAAGAGAAGAAUUUCACCACCGCUCCAGCCAUCUGCCACGACGGCAAAGCCCACUUUCCUAGAGAAGGCGUGUUCGUGUCCAACGGCACCCAUUGGUUCGUGACACAGCGGAACUUCUACGAGCCCCAGAUCAUCACCACCGACAACACCUUCGUGUCUGGCAACUGCGACGUCGUGAUCGGCAUUGUGAACAAUACCGUGUACGACCCUCUGCAGCCCGAGCUGGACAGCUUCAAAGAGGAACUGGACAAGUACUUUAAGAACCACACAAGCCCCGACGUGGACCUGGGCGAUAUCAGCGGAAUCAAUGCCAGCGUCGUGAACAUCCAGAAAGAGAUCGACCGGCUGAACGAGGUGGCCAAGAAUCUGAACGAGAGCCUGAUCGACCUGCAAGAACUGGGGAAGUACGAGCAGUACAUCAAGUGGCCCUGGUACAUCUGGCUGGGCUUUAUCGCCGGACUGAUUGCCAUCGUGAUGGUCACAAUCAUGCUGUGUUGCAUGACCAGCUGCUGUAGCUGCCUGAAGGGCUGUUGUAGCUGUGGCAGCUGCUGCAAGUUCGACGAGGACGAUUCUGAGCCCGUGCUGAAGGGCGUGAAACUGCACUACACAUGAUGACUCGAGCUGGUACUGCAUGCACGCAAUGCUAGCUGCCCCUUUCCCGUCCUGGGUACCCCGAGUCUCCCCCGACCUCGGGUCCCAGGUAUGCUCCCACCUCCACCUGCCCCACUCACCACCUCUGCUAGUUCCAGACACCUCCCAAGCACGCAGCAAUGCAGCUCAAAACGCUUAGCCUAGCCACACCCCCACGGGAAACAGCAGUGAUUAACCUUUAGCAAUAAACGAAAGUUUAACUAAGCUAUACUAACCCCAGGGUUGGUCAAUUUCGUGCCAGCCACACCCUGGAGCUAGCA',
      laboratoryWorkflow: [
        {
          id: 'toz-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Linearised plasmid DNA template release testing',
          description:
            'The transcription template is a bacterial plasmid carrying the spike coding sequence, cut once downstream of the poly(A) region. Completeness of linearisation, sequence identity, endotoxin and residual host-cell DNA are all released before any RNA is made.',
          reagentsAndBuffer:
            'Type IIS restriction endonuclease, agarose and capillary electrophoresis, Sanger and next-generation sequencing, LAL endotoxin assay, qPCR for residual E. coli DNA',
        },
        {
          id: 'toz-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'In vitro transcription with N1-methylpseudouridine',
          description:
            'T7 RNA polymerase copies the linearised template into single-stranded RNA. Every uridine is supplied as N1-methylpseudouridine, and the cap is installed co-transcriptionally rather than in a second enzymatic step.',
          dependsOnStepId: 'toz-1',
          reagentsAndBuffer:
            'T7 RNA polymerase, ATP/CTP/GTP plus N1-methylpseudouridine-5-triphosphate, trinucleotide cap analogue, 40 mM Tris pH 8.0 with magnesium acetate, spermidine and DTT, followed by DNase I digestion of the template',
        },
        {
          id: 'toz-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Oligo-dT capture and double-stranded RNA depletion',
          description:
            'Full-length transcript is captured by its poly(A) tail, then double-stranded byproducts of transcription are stripped out, because dsRNA is the strongest innate immune trigger in the mixture and the least wanted impurity.',
          dependsOnStepId: 'toz-2',
          reagentsAndBuffer:
            'Oligo-dT cellulose resin, high-salt binding buffer with low-salt elution, cellulose-in-ethanol dsRNA depletion, tangential flow filtration into citrate buffer',
        },
        {
          id: 'toz-4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Lipid nanoparticle formulation by rapid microfluidic mixing',
          description:
            'RNA in acidic buffer meets four lipids in ethanol at a T-junction. The pH jump drives self-assembly of particles around 80 nanometres, which are then dialysed into the final neutral buffer so the ionisable lipid returns to a neutral charge.',
          dependsOnStepId: 'toz-3',
          reagentsAndBuffer:
            'ALC-0315 ionisable lipid, ALC-0159 PEG lipid, DSPC and cholesterol in ethanol; mRNA in pH 4 acetate buffer; tangential flow buffer exchange into tromethamine and sucrose',
        },
        {
          id: 'toz-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Release panel: integrity, encapsulation and expressed protein',
          description:
            'Three questions decide release. Is the RNA still full length, is it actually inside the particle, and does a cell given the finished product make spike protein.',
          dependsOnStepId: 'toz-4',
          reagentsAndBuffer:
            'Fragment analyser for RNA integrity, RiboGreen with and without Triton X-100 for encapsulation efficiency, dynamic light scattering for particle size, HEK293 transfection with anti-S1 western blot',
        },
      ],
      structureSource: {
        label:
          'Jeong et al., Assemblies of putative SARS-CoV-2 spike-encoding mRNA sequences for vaccines BNT-162b2 and mRNA-1273 (2021). A 4,175-nucleotide contig assembled from vial residue: it does not resolve the 5-prime cap or the full poly(A) tail, and it is the ancestral 2020 construct, not the strain-updated formula sold now.',
        identifier:
          'https://github.com/NAalytics/Assemblies-of-putative-SARS-CoV2-spike-encoding-mRNA-sequences-for-vaccines-BNT-162b2-and-mRNA-1273',
        kind: 'url',
      },
    },
    keyAudits: [
      {
        id: 'toz-a1',
        category: 'measured',
        title: 'C4591001 measured symptomatic disease, and measured it cleanly',
        laymanSummary:
          'Eight vaccinated participants and 162 placebo participants developed symptomatic, PCR-confirmed COVID-19. That gap is the 95% figure.',
        technicalDetails:
          'Multinational, observer-blinded, placebo-controlled trial. 43,548 randomised, 43,448 injected: 21,720 to BNT162b2 and 21,728 to placebo, two 30 microgram doses 21 days apart. The endpoint counted PCR-confirmed COVID-19 with at least one symptom, occurring at least seven days after the second dose, in participants with no serological or virological evidence of prior infection. Median safety follow-up at the primary analysis was two months.',
        evidenceSource: 'Polack et al., New England Journal of Medicine, 2020',
        doi: '10.1056/NEJMoa2034577',
        measuredMetric:
          '95% relative reduction in symptomatic PCR-confirmed COVID-19 (95% credible interval 90.3 to 97.6); 8 cases versus 162',
        auditFlag: 'verified',
      },
      {
        id: 'toz-a2',
        category: 'measured',
        title: 'Six-month follow-up: 91.3%, with the decline already visible inside the trial',
        laymanSummary:
          'When the same trial was read out at six months, efficacy against any COVID-19 had slipped to 91.3% and the authors said that it was declining.',
        technicalDetails:
          '44,165 participants aged 16 and over plus 2,264 aged 12 to 15. Efficacy against COVID-19 from seven days after dose two through six months was 91.3% (95% CI 89.0 to 93.2) among participants without evidence of prior infection. Efficacy against severe disease was 96.7% (95% CI 80.3 to 99.9). In South Africa, where beta predominated, efficacy was 100%.',
        evidenceSource: 'Thomas et al., New England Journal of Medicine, 2021',
        doi: '10.1056/NEJMoa2110345',
        measuredMetric:
          '91.3% efficacy through six months (95% CI 89.0 to 93.2); 96.7% against severe disease',
        auditFlag: 'verified',
      },
      {
        id: 'toz-a3',
        category: 'inferred',
        title: 'Stopping transmission was never an endpoint of the pivotal trial',
        laymanSummary:
          'The trial counted people who became ill. Nobody was swabbed while they felt well, so it could not see silent infection and could not see whether a vaccinated person passed the virus on.',
        technicalDetails:
          'C4591001 defined its primary endpoint as PCR-confirmed illness with at least one symptom in the enrolled participant. There was no routine asymptomatic surveillance arm and no contact-tracing arm, so neither asymptomatic infection nor onward transmission is estimable from it. The evidence that arrived later was observational: among 146,243 traced contacts of 108,498 index patients in England, two BNT162b2 doses in the index patient were associated with an adjusted rate ratio for contact positivity of 0.32 for alpha and 0.50 for delta, and the delta effect declined with time since the second dose.',
        evidenceSource:
          'Eyre et al., Effect of Covid-19 Vaccination on Transmission of Alpha and Delta Variants, NEJM 2022',
        doi: '10.1056/NEJMoa2116597',
        inferredClaim:
          'That the pivotal trial demonstrated the vaccine prevents a vaccinated person infecting somebody else.',
        auditFlag: 'contested',
      },
      {
        id: 'toz-a4',
        category: 'conclusion_shift',
        title: '95% belonged to the ancestral virus, and did not survive omicron',
        laymanSummary:
          'Against omicron, two doses gave about 65% protection from symptomatic illness two to four weeks later, falling to about 9% by six months.',
        technicalDetails:
          'Test-negative case-control study in England covering 886,774 omicron infections, 204,154 delta infections and 1,572,621 test-negative controls between 27 November 2021 and 12 January 2022. Effectiveness against symptomatic omicron after two BNT162b2 doses was 65.5% (95% CI 63.9 to 67.0) at two to four weeks and 8.8% (95% CI 7.0 to 10.5) at 25 weeks or more. A BNT162b2 booster restored it to 67.2% at two to four weeks before falling again.',
        evidenceSource: 'Andrews et al., New England Journal of Medicine, 2022',
        doi: '10.1056/NEJMoa2119451',
        measuredMetric:
          'Effectiveness against symptomatic omicron after two doses: 65.5% at 2 to 4 weeks, 8.8% at 25 or more weeks',
        auditFlag: 'verified',
      },
      {
        id: 'toz-a5',
        category: 'conclusion_shift',
        title: 'Waning was measurable in a whole population before it was widely accepted',
        laymanSummary:
          'Israelis vaccinated in January 2021 were catching COVID-19 at a higher rate that July than Israelis of the same age vaccinated two months later.',
        technicalDetails:
          'National database analysis of all Israeli residents fully vaccinated before June 2021, covering 11 to 31 July 2021. Among people 60 and older, the rate ratio for confirmed infection comparing those vaccinated in January with those vaccinated in March was 1.6 (95% CI 1.3 to 2.0). Among people 40 to 59 the corresponding ratio was 1.7 (95% CI 1.4 to 2.1). Time since vaccination, not just variant, was doing measurable work.',
        evidenceSource: 'Goldberg et al., New England Journal of Medicine, 2021',
        doi: '10.1056/NEJMoa2114228',
        auditFlag: 'verified',
      },
      {
        id: 'toz-a6',
        category: 'failed',
        title: 'Myocarditis: a harm a 43,000-person trial was too small to see',
        laymanSummary:
          'Heart-muscle inflammation showed up only once tens of millions of doses had been given, and it is concentrated in teenage boys and young men.',
        technicalDetails:
          'Israeli national surveillance from 20 December 2020 to 31 May 2021 identified 283 myocarditis cases, 142 after BNT162b2. The risk difference between the first and second doses was 1.76 per 100,000 persons (95% CI 1.33 to 2.19), rising to 13.73 per 100,000 (95% CI 8.11 to 19.46) in males aged 16 to 19. The standardised incidence ratio against historical expectation was 5.34 (95% CI 4.48 to 6.40). Presentation was mild in 129 of 136 definitive or probable cases; one fulminant case was fatal. The current US label puts the rate at roughly 8 cases per million doses across ages 6 months to 64 years and about 27 per million in males 12 to 24.',
        evidenceSource:
          'Mevorach et al., NEJM 2021, and the current COMIRNATY prescribing information',
        doi: '10.1056/NEJMoa2109730',
        measuredMetric:
          'Excess of 13.73 myocarditis cases per 100,000 males aged 16 to 19 between dose one and dose two',
        auditFlag: 'caution',
      },
      {
        id: 'toz-a7',
        category: 'conclusion_shift',
        title: 'The approved population narrowed in 2025',
        laymanSummary:
          'The US label no longer covers everyone. It now covers people 65 and older, and people 5 through 64 with a condition that puts them at high risk.',
        technicalDetails:
          'The current COMIRNATY prescribing information restricts the indication to individuals 65 years of age and older, or 5 through 64 years of age with at least one underlying condition that raises the risk of severe outcomes. The 2025-2026 formula encodes the spike of omicron sublineage LP.8.1, not the ancestral spike the pivotal trial tested. Both facts mean the product on the shelf is not the product the 95% figure was measured on.',
        evidenceSource: 'COMIRNATY US prescribing information, DailyMed',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intramuscular injection and lipid nanoparticle uptake',
        laymanDesc:
          'The dose goes into the shoulder muscle. Fat droplets carrying the recipe are swallowed by muscle cells and by immune cells that patrol the area and the nearby lymph node.',
        molecularDetail:
          'ALC-0315 is an ionisable lipid, near neutral at blood pH, so the particle is not a cationic irritant in circulation. Apolipoprotein E adsorbs onto the PEGylated surface in interstitial fluid, and the particle is taken up by myocytes, dendritic cells and macrophages at the injection site and in the draining axillary node.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Escape from the endosome into the cytoplasm',
        laymanDesc:
          'Inside the cell the droplet is trapped in an acid bubble. The acid flips the lipid to a positive charge, the bubble wall breaks, and some of the recipe spills into the cell body.',
        molecularDetail:
          'Endosomal acidification protonates the tertiary amine of the ionisable lipid. The now-cationic lipid ion-pairs with anionic endosomal phospholipids and drives a lamellar to hexagonal HII phase transition that ruptures the membrane. Only a small fraction of the internalised dose escapes; the rest is degraded in the lysosome.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Ribosomes bind and read the modified message',
        laymanDesc:
          'The cell reads the recipe the same way it reads its own. One chemical swap in the letters keeps the cell from mistaking it for a virus and shutting it down.',
        molecularDetail:
          'N1-methylpseudouridine replaces every uridine, which lowers activation of TLR7 and TLR8 and of RIG-I, and raises translation yield. The cap-1 structure recruits eIF4E and the 43S preinitiation complex; the engineered 5-prime and 3-prime untranslated regions and human-optimised codon usage extend the working life of the transcript.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'A locked-open spike protein is built and displayed',
        laymanDesc:
          'The cell builds one coronavirus surface protein, frozen in the shape the virus wears before it fuses with a cell, and parks it on its own surface where the immune system can study it.',
        molecularDetail:
          'Two consecutive proline substitutions in the S2 subunit hold the trimer in its prefusion conformation, which presents the neutralisation-sensitive receptor-binding domain rather than the postfusion rod. The retained transmembrane anchor keeps spike surface-displayed, and proteasomal processing loads peptides onto MHC class I.',
        iconName: 'Layers',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Neutralising antibody and cellular memory',
        laymanDesc:
          'The immune system builds antibodies that stick to that shape, plus memory cells that can rebuild them fast. The recipe itself is gone within days.',
        molecularDetail:
          'Germinal centre reactions in the draining node produce class-switched, affinity-matured IgG against the receptor-binding domain, alongside CD4 and CD8 memory. The transcript is degraded by cytosolic exonucleases; the construct encodes neither reverse transcriptase nor integrase, and never enters the nucleus.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'C4591001 primary analysis (NCT04368728)',
        phase: 'Phase 2/3',
        sampleSize: 43448,
        primaryEndpoint:
          'PCR-confirmed COVID-19 with at least one symptom, occurring at least 7 days after the second dose, in participants without evidence of prior SARS-CoV-2 infection',
        endpointMet: true,
        statisticalPValue:
          'Bayesian success criterion rather than a p-value: 95% efficacy with a 95% credible interval of 90.3 to 97.6',
        unreportedAdverseSignals:
          'Myocarditis and pericarditis were not detected in the trial and emerged only in post-authorisation surveillance, at a rate too low for a 43,000-person study to see.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'C4591001 six-month analysis (NCT04368728)',
        phase: 'Phase 2/3',
        sampleSize: 44165,
        primaryEndpoint:
          'Efficacy against laboratory-confirmed COVID-19 through six months after the second dose',
        endpointMet: true,
        statisticalPValue: '91.3% efficacy, 95% CI 89.0 to 93.2',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '95% relative reduction in symptomatic PCR-confirmed COVID-19 over a median of two months: 8 cases against 162',
        '91.3% efficacy through six months, and 96.7% against severe disease, in the same randomised trial',
        'About 27 myocarditis or pericarditis cases per million doses in males aged 12 to 24, from post-authorisation surveillance',
      ],
      unsupportedInferences: [
        'That the trial showed the vaccine stops transmission: transmission was never an endpoint and was never measured',
        'That 95% meant 95 of every 100 vaccinated people were protected; it is a relative reduction between two arms, not an absolute one',
        'That efficacy measured against the ancestral virus carried over to omicron, which it did not',
        'That a single course confers durable protection: decline was visible inside the trial itself',
      ],
      whatFailedInitially: [
        'Unmodified mRNA triggered innate immune sensors and translated poorly, until uridine was replaced with a modified base',
        'Naked mRNA is destroyed by extracellular nucleases within minutes, which is the entire reason the lipid nanoparticle exists',
        'A 43,000-person trial was too small to detect myocarditis at roughly 27 cases per million doses',
      ],
      realWorldOutcome: [
        'Effectiveness against infection fell sharply under omicron and with time since the last dose, while protection against severe disease held up better',
        'The US label was narrowed in 2025 to people 65 and older and to 5 through 64 year olds with a high-risk condition',
        'The marketed product is now strain-updated annually and encodes an omicron spike, not the ancestral spike the pivotal trial tested',
      ],
    },
    deliverySystem: {
      type: 'Ionisable lipid nanoparticle, intramuscular',
      description:
        'A 0.3 mL intramuscular dose containing 30 micrograms of nucleoside-modified mRNA encapsulated with ALC-0315, ALC-0159, DSPC and cholesterol, buffered with tromethamine and sucrose. The 5 through 11 year presentation contains 10 micrograms.',
      safetyProfile:
        'Injection-site pain, fatigue and headache are common and short-lived. Myocarditis and pericarditis occur, concentrated in males 12 through 24 years, at roughly 27 cases per million doses in that group; most resolve within days, and one fatal fulminant case was recorded in Israeli national surveillance. Anaphylaxis is rare and occurs within minutes, which is why a fifteen-minute observation period exists.',
    },
    commonQuestions: [
      {
        q: 'Does the pivotal trial show the vaccine stops me infecting other people?',
        a: 'No. C4591001 counted symptomatic, PCR-confirmed illness in the person who was vaccinated. Nobody was routinely swabbed while well, so the trial could not see asymptomatic infection and could not see onward transmission at all. The evidence that arrived later was observational contact tracing in England, and it found a real but partial and fading effect: two doses roughly halved the chance that a traced contact tested positive during the delta wave, and that effect shrank with time since the second dose.',
        auditNote:
          'This is the largest single gap between what was measured and what was claimed for this product.',
      },
      {
        q: 'What does 95% efficacy actually mean?',
        a: 'Of about 21,700 vaccinated participants, 8 developed symptomatic COVID-19 during the trial. Of about 21,700 given saline, 162 did. 95% is the reduction between those two rates over that period against that virus. It is not a statement about any one person, and it is not a statement about a variant that did not exist when the trial ran.',
      },
      {
        q: 'Can the mRNA change my DNA?',
        a: 'The mRNA stays in the cytoplasm, is read by ribosomes there, and is degraded by ordinary cellular nucleases within days. It carries no reverse transcriptase and no integrase, which are the two enzymes a sequence would need to be written into chromosomal DNA, and it never enters the nucleus where DNA is kept.',
      },
      {
        q: 'How real is the myocarditis risk?',
        a: 'Real, measurable and concentrated. Israeli national surveillance found the excess between the first and second dose was 1.76 cases per 100,000 people overall, rising to 13.73 per 100,000 in males aged 16 to 19. The current US label puts it at roughly 8 cases per million doses across ages 6 months to 64 years and about 27 per million in males 12 to 24. Ninety-five percent of the Israeli cases were clinically mild; one was fatal.',
        auditNote:
          'This harm was invisible in a 43,000-person trial and appeared only after tens of millions of doses. That is a property of trial size, not evidence of concealment.',
      },
      {
        q: 'Why does a dose list at $110 to $130 when a published model puts production at $2.39?',
        a: 'The $2.39 figure is a peer-reviewed techno-economic model of manufacturing a 30 microgram mRNA dose at pandemic scale, including fill-to-finish. It excludes research, trials, regulatory work, distribution and profit. The commercial list price is set by what the US market will bear, which is why the same manufacturer sold the same product to the US government at $30.48 a dose in 2022.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Polack et al., Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine, NEJM 2020',
        identifier: '10.1056/NEJMoa2034577',
        kind: 'doi',
      },
      {
        label:
          'Thomas et al., Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine through 6 Months, NEJM 2021',
        identifier: '10.1056/NEJMoa2110345',
        kind: 'doi',
      },
      {
        label:
          'Eyre et al., Effect of Covid-19 Vaccination on Transmission of Alpha and Delta Variants, NEJM 2022',
        identifier: '10.1056/NEJMoa2116597',
        kind: 'doi',
      },
      {
        label:
          'Andrews et al., Covid-19 Vaccine Effectiveness against the Omicron (B.1.1.529) Variant, NEJM 2022',
        identifier: '10.1056/NEJMoa2119451',
        kind: 'doi',
      },
      {
        label: 'Goldberg et al., Waning Immunity after the BNT162b2 Vaccine in Israel, NEJM 2021',
        identifier: '10.1056/NEJMoa2114228',
        kind: 'doi',
      },
      {
        label:
          'Mevorach et al., Myocarditis after BNT162b2 mRNA Vaccine against Covid-19 in Israel, NEJM 2021',
        identifier: '10.1056/NEJMoa2109730',
        kind: 'doi',
      },
      {
        label:
          'Karlstad et al., SARS-CoV-2 Vaccination and Myocarditis in a Nordic Cohort Study of 23 Million Residents, JAMA Cardiology 2022',
        identifier: '10.1001/jamacardio.2022.0583',
        kind: 'doi',
      },
      {
        label:
          'Dunkle et al., Efficacy and Safety of NVX-CoV2373 in Adults in the United States and Mexico, NEJM 2022',
        identifier: '10.1056/NEJMoa2116185',
        kind: 'doi',
      },
      {
        label: 'C4591001 trial record, ClinicalTrials.gov',
        identifier: 'NCT04368728',
        kind: 'nct',
      },
      {
        label: 'COMIRNATY (COVID-19 Vaccine, mRNA) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=48c86164-de07-4041-b9dc-f2b5744714e5',
        kind: 'regulatory',
      },
      {
        label:
          'Kis et al., Pandemic-response adenoviral vector and RNA vaccine manufacturing, npj Vaccines 2022',
        identifier: '10.1038/s41541-022-00447-3',
        kind: 'doi',
      },
      {
        label:
          'KFF, How Much Could COVID-19 Vaccines Cost the U.S. After Commercialization? (10 March 2023)',
        identifier:
          'https://www.kff.org/covid-19/how-much-could-covid-19-vaccines-cost-the-u-s-after-commercialization/',
        kind: 'url',
      },
      {
        label:
          'Jeong et al., Assemblies of putative SARS-CoV-2 spike-encoding mRNA sequences for vaccines BNT-162b2 and mRNA-1273, 2021',
        identifier:
          'https://github.com/NAalytics/Assemblies-of-putative-SARS-CoV2-spike-encoding-mRNA-sequences-for-vaccines-BNT-162b2-and-mRNA-1273',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // Elasomeran (Spikevax)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'elasomeran',
    name: 'Elasomeran',
    tradeName: 'Spikevax',
    sponsor: 'Moderna',
    targetGene: 'SARS-CoV-2 S (viral spike gene; no human gene is targeted)',
    targetProtein: 'SARS-CoV-2 prefusion-stabilised spike glycoprotein',
    modality: 'mRNA Vaccine / Therapeutic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2022,
    indication:
      'Active immunisation to prevent COVID-19 caused by SARS-CoV-2. The current US label covers people 65 years and older, and people 6 months through 64 years with at least one condition that raises their risk of severe outcomes.',
    patientFriendlyIndication: 'COVID-19 prevention in older adults and people at higher risk',
    conditionContext: {
      conditionExplainer:
        'COVID-19 is the illness caused by SARS-CoV-2. The virus uses its spike protein to bind ACE2 on airway and vascular cells; in people with limited physiological reserve that infection can escalate into pneumonia, thrombosis and multi-organ failure.',
      whyItMatters:
        'The absolute benefit of vaccination scales with baseline risk. In a healthy 25-year-old the number needed to vaccinate to prevent one hospitalisation is very large; in an 80-year-old with heart failure it is small. That is the whole logic of the narrowed 2025 label.',
      whoTakesThis:
        'Under the current US label, adults 65 and older, and people aged 6 months through 64 years with at least one condition that raises their risk of severe COVID-19.',
      clinicalGoals:
        'Reduce symptomatic and, uniquely for this trial, asymptomatic infection, and reduce severe COVID-19.',
    },
    oneSentenceVerdict:
      'The same nucleoside-modified spike mRNA platform at a larger dose, which cut symptomatic COVID-19 by 94.1% in 30,415 randomised adults and, unusually, also measured a 63.0% cut in asymptomatic infection.',
    laymanHowItWorks:
      'It works the same way its Pfizer counterpart does: a fat droplet carries a recipe for one coronavirus surface protein into cells near the injection site, they build it, and the immune system learns the shape. The differences are in the details, and the details matter. The dose of RNA was larger in the pivotal trial, the fat mixture is different, and this trial swabbed people who felt fine, so it could see infections the other trial could not.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 92,
    anatomicalSite:
      'Deltoid muscle and the draining axillary lymph node; translation occurs in the cytoplasm of muscle cells and antigen-presenting cells',
    pricing: {
      synthesisCostPerDose:
        '$2.39 per dose in a published techno-economic model built on a 30 microgram mRNA dose. The same authors state the figure is less favourable at Moderna dose levels, so treat it as a floor and not an estimate for this product.',
      retailPricePerDoseOrYear:
        '$110 – $130 per dose, the US commercial list price both mRNA manufacturers announced for 2023',
      markupEstimate:
        'At least 46x to 54x the modelled production cost of a smaller dose, and roughly four times the $26.36 per dose the US government paid Moderna for bivalent boosters in 2022',
      openPatentNotes:
        'Moderna and the US National Institutes of Health disputed inventorship of the prefusion spike design used in this vaccine. Moderna also fought lipid nanoparticle patent claims from Arbutus and Genevant and asserted its own against BioNTech. None of this platform is open.',
      synthesisComplexity: 'High',
      costSource: {
        label:
          'Kis et al., Pandemic-response adenoviral vector and RNA vaccine manufacturing, npj Vaccines 2022',
        identifier: '10.1038/s41541-022-00447-3',
        kind: 'doi',
      },
      priceSource: {
        label:
          'KFF, How Much Could COVID-19 Vaccines Cost the U.S. After Commercialization? (10 March 2023)',
        identifier:
          'https://www.kff.org/covid-19/how-much-could-covid-19-vaccines-cost-the-u-s-after-commercialization/',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'The alternatives are the other licensed COVID-19 vaccines. Nothing in a kitchen has been shown in a randomised trial to prevent COVID-19, so the dietary and home-remedy lists are empty rather than padded.',
      conventionalRx: [
        {
          name: 'Tozinameran (Comirnaty)',
          class: 'Nucleoside-modified mRNA vaccine, ALC-0315 lipid nanoparticle',
          howItCompares:
            'The same platform at a smaller mRNA dose. Its pivotal trial measured 95% efficacy against symptomatic disease but never measured asymptomatic infection.',
          typicalCost: '$110 – $130 per dose announced US commercial list price',
          prosAndCons:
            'Pros: lower excess myocarditis rate in young men in Nordic register data, 5.55 versus 18.39 per 100,000 second doses in males 16 to 24. Cons: its trial produced no asymptomatic infection endpoint.',
        },
        {
          name: 'NVX-CoV2373 (Nuvaxovid)',
          class: 'Recombinant spike protein nanoparticle with Matrix-M adjuvant',
          howItCompares:
            'A protein vaccine. PREVENT-19 measured 90.4% efficacy against symptomatic COVID-19 in 29,582 adults and 100% against moderate-to-severe disease, largely during the alpha wave.',
          typicalCost: 'US commercial list price not verified for this record',
          prosAndCons:
            'Pros: avoids the mRNA platform entirely. Cons: a much thinner real-world effectiveness literature.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3:
        'GGGAAAUAAGAGAGAAAAGAAGAGUAAGAAGAAAUAUAAGACCCCGGCGCCGCCACCAUGUUCGUGUUCCUGGUGCUGCUGCCCCUGGUGAGCAGCCAGUGCGUGAACCUGACCACCCGGACCCAGCUGCCACCAGCCUACACCAACAGCUUCACCCGGGGCGUCUACUACCCCGACAAGGUGUUCCGGAGCAGCGUCCUGCACAGCACCCAGGACCUGUUCCUGCCCUUCUUCAGCAACGUGACCUGGUUCCACGCCAUCCACGUGAGCGGCACCAACGGCACCAAGCGGUUCGACAACCCCGUGCUGCCCUUCAACGACGGCGUGUACUUCGCCAGCACCGAGAAGAGCAACAUCAUCCGGGGCUGGAUCUUCGGCACCACCCUGGACAGCAAGACCCAGAGCCUGCUGAUCGUGAAUAACGCCACCAACGUGGUGAUCAAGGUGUGCGAGUUCCAGUUCUGCAACGACCCCUUCCUGGGCGUGUACUACCACAAGAACAACAAGAGCUGGAUGGAGAGCGAGUUCCGGGUGUACAGCAGCGCCAACAACUGCACCUUCGAGUACGUGAGCCAGCCCUUCCUGAUGGACCUGGAGGGCAAGCAGGGCAACUUCAAGAACCUGCGGGAGUUCGUGUUCAAGAACAUCGACGGCUACUUCAAGAUCUACAGCAAGCACACCCCAAUCAACCUGGUGCGGGAUCUGCCCCAGGGCUUCUCAGCCCUGGAGCCCCUGGUGGACCUGCCCAUCGGCAUCAACAUCACCCGGUUCCAGACCCUGCUGGCCCUGCACCGGAGCUACCUGACCCCAGGCGACAGCAGCAGCGGGUGGACAGCAGGCGCGGCUGCUUACUACGUGGGCUACCUGCAGCCCCGGACCUUCCUGCUGAAGUACAACGAGAACGGCACCAUCACCGACGCCGUGGACUGCGCCCUGGACCCUCUGAGCGAGACCAAGUGCACCCUGAAGAGCUUCACCGUGGAGAAGGGCAUCUACCAGACCAGCAACUUCCGGGUGCAGCCCACCGAGAGCAUCGUGCGGUUCCCCAACAUCACCAACCUGUGCCCCUUCGGCGAGGUGUUCAACGCCACCCGGUUCGCCAGCGUGUACGCCUGGAACCGGAAGCGGAUCAGCAACUGCGUGGCCGACUACAGCGUGCUGUACAACAGCGCCAGCUUCAGCACCUUCAAGUGCUACGGCGUGAGCCCCACCAAGCUGAACGACCUGUGCUUCACCAACGUGUACGCCGACAGCUUCGUGAUCCGUGGCGACGAGGUGCGGCAGAUCGCACCCGGCCAGACAGGCAAGAUCGCCGACUACAACUACAAGCUGCCCGACGACUUCACCGGCUGCGUGAUCGCCUGGAACAGCAACAACCUCGACAGCAAGGUGGGCGGCAACUACAACUACCUGUACCGGCUGUUCCGGAAGAGCAACCUGAAGCCCUUCGAGCGGGACAUCAGCACCGAGAUCUACCAAGCCGGCUCCACCCCUUGCAACGGCGUGGAGGGCUUCAACUGCUACUUCCCUCUGCAGAGCUACGGCUUCCAGCCCACCAACGGCGUGGGCUACCAGCCCUACCGGGUGGUGGUGCUGAGCUUCGAGCUGCUGCACGCCCCAGCCACCGUGUGUGGCCCCAAGAAGAGCACCAACCUGGUGAAGAACAAGUGCGUGAACUUCAACUUCAACGGCCUUACCGGCACCGGCGUGCUGACCGAGAGCAACAAGAAAUUCCUGCCCUUUCAGCAGUUCGGCCGGGACAUCGCCGACACCACCGACGCUGUGCGGGAUCCCCAGACCCUGGAGAUCCUGGACAUCACCCCUUGCAGCUUCGGCGGCGUGAGCGUGAUCACCCCAGGCACCAACACCAGCAACCAGGUGGCCGUGCUGUACCAGGACGUGAACUGCACCGAGGUGCCCGUGGCCAUCCACGCCGACCAGCUGACACCCACCUGGCGGGUCUACAGCACCGGCAGCAACGUGUUCCAGACCCGGGCCGGUUGCCUGAUCGGCGCCGAGCACGUGAACAACAGCUACGAGUGCGACAUCCCCAUCGGCGCCGGCAUCUGUGCCAGCUACCAGACCCAGACCAAUUCACCCCGGAGGGCAAGGAGCGUGGCCAGCCAGAGCAUCAUCGCCUACACCAUGAGCCUGGGCGCCGAGAACAGCGUGGCCUACAGCAACAACAGCAUCGCCAUCCCCACCAACUUCACCAUCAGCGUGACCACCGAGAUUCUGCCCGUGAGCAUGACCAAGACCAGCGUGGACUGCACCAUGUACAUCUGCGGCGACAGCACCGAGUGCAGCAACCUGCUGCUGCAGUACGGCAGCUUCUGCACCCAGCUGAACCGGGCCCUGACCGGCAUCGCCGUGGAGCAGGACAAGAACACCCAGGAGGUGUUCGCCCAGGUGAAGCAGAUCUACAAGACCCCUCCCAUCAAGGACUUCGGCGGCUUCAACUUCAGCCAGAUCCUGCCCGACCCCAGCAAGCCCAGCAAGCGGAGCUUCAUCGAGGACCUGCUGUUCAACAAGGUGACCCUAGCCGACGCCGGCUUCAUCAAGCAGUACGGCGACUGCCUCGGCGACAUAGCCGCCCGGGACCUGAUCUGCGCCCAGAAGUUCAACGGCCUGACCGUGCUGCCUCCCCUGCUGACCGACGAGAUGAUCGCCCAGUACACCAGCGCCCUGUUAGCCGGAACCAUCACCAGCGGCUGGACUUUCGGCGCUGGAGCCGCUCUGCAGAUCCCCUUCGCCAUGCAGAUGGCCUACCGGUUCAACGGCAUCGGCGUGACCCAGAACGUGCUGUACGAGAACCAGAAGCUGAUCGCCAACCAGUUCAACAGCGCCAUCGGCAAGAUCCAGGACAGCCUGAGCAGCACCGCUAGCGCCCUGGGCAAGCUGCAGGACGUGGUGAACCAGAACGCCCAGGCCCUGAACACCCUGGUGAAGCAGCUGAGCAGCAACUUCGGCGCCAUCAGCAGCGUGCUGAACGACAUCCUGAGCCGGCUGGACCCUCCCGAGGCCGAGGUGCAGAUCGACCGGCUGAUCACUGGCCGGCUGCAGAGCCUGCAGACCUACGUGACCCAGCAGCUGAUCCGGGCCGCCGAGAUUCGGGCCAGCGCCAACCUGGCCGCCACCAAGAUGAGCGAGUGCGUGCUGGGCCAGAGCAAGCGGGUGGACUUCUGCGGCAAGGGCUACCACCUGAUGAGCUUUCCCCAGAGCGCACCCCACGGAGUGGUGUUCCUGCACGUGACCUACGUGCCCGCCCAGGAGAAGAACUUCACCACCGCCCCAGCCAUCUGCCACGACGGCAAGGCCCACUUUCCCCGGGAGGGCGUGUUCGUGAGCAACGGCACCCACUGGUUCGUGACCCAGCGGAACUUCUACGAGCCCCAGAUCAUCACCACCGACAACACCUUCGUGAGCGGCAACUGCGACGUGGUGAUCGGCAUCGUGAACAACACCGUGUACGAUCCCCUGCAGCCCGAGCUGGACAGCUUCAAGGAGGAGCUGGACAAGUACUUCAAGAAUCACACCAGCCCCGACGUGGACCUGGGCGACAUCAGCGGCAUCAACGCCAGCGUGGUGAACAUCCAGAAGGAGAUCGAUCGGCUGAACGAGGUGGCCAAGAACCUGAACGAGAGCCUGAUCGACCUGCAGGAGCUGGGCAAGUACGAGCAGUACAUCAAGUGGCCCUGGUACAUCUGGCUGGGCUUCAUCGCCGGCCUGAUCGCCAUCGUGAUGGUGACCAUCAUGCUGUGCUGCAUGACCAGCUGCUGCAGCUGCCUGAAGGGCUGUUGCAGCUGCGGCAGCUGCUGCAAGUUCGACGAGGACGACAGCGAGCCCGUGCUGAAGGGCGUGAAGCUGCACUACACCUGAUAAUAGGCUGGAGCCUCGGUGGCCUAGCUUCUUGCCCCUUGGGCCUCCCCCCAGCCCCUCCUCCCCUUCCUGCACCCGUACCCCCGUGGUCUUUGAAUAAAGUCUGAGUGGGCGGCAAAAAAAAA',
      laboratoryWorkflow: [
        {
          id: 'ela-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Linearised plasmid template qualification',
          description:
            'The spike coding sequence is carried on a plasmid, amplified in E. coli, then linearised downstream of the encoded poly(A) region so transcription terminates at a defined point.',
          reagentsAndBuffer:
            'Restriction endonuclease digest, capillary electrophoresis, next-generation sequencing for identity, LAL endotoxin assay, qPCR for residual host-cell DNA',
        },
        {
          id: 'ela-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'In vitro transcription and enzymatic capping',
          description:
            'T7 RNA polymerase transcribes the template with N1-methylpseudouridine in place of uridine. Moderna installs the cap enzymatically after transcription rather than co-transcriptionally, which is why its raw-material cost profile differs.',
          dependsOnStepId: 'ela-1',
          reagentsAndBuffer:
            'T7 RNA polymerase, ATP/CTP/GTP plus N1-methylpseudouridine-5-triphosphate, vaccinia capping enzyme with 2-prime-O-methyltransferase and S-adenosylmethionine, Tris-HCl pH 8.0 with magnesium and spermidine, DNase I digest',
        },
        {
          id: 'ela-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Poly(A) affinity capture and impurity depletion',
          description:
            'Capped, full-length transcript is captured by its poly(A) tail; truncated transcripts, double-stranded byproducts, enzymes and nucleotides are washed away.',
          dependsOnStepId: 'ela-2',
          reagentsAndBuffer:
            'Oligo-dT affinity resin, high- then low-salt buffers, reversed-phase or cellulose dsRNA depletion, tangential flow filtration into acetate buffer',
        },
        {
          id: 'ela-4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'SM-102 lipid nanoparticle formulation',
          description:
            'Acidified RNA and an ethanolic four-lipid mixture are mixed at controlled flow rates so particles self-assemble in milliseconds, then the ethanol is removed and the buffer neutralised.',
          dependsOnStepId: 'ela-3',
          reagentsAndBuffer:
            'SM-102 ionisable lipid, PEG2000-DMG, DSPC and cholesterol in ethanol; mRNA in pH 4 acetate buffer; tangential flow exchange into tromethamine, sodium acetate and sucrose',
        },
        {
          id: 'ela-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Release testing of integrity, encapsulation and expression',
          description:
            'Full-length RNA content, percentage encapsulated, particle size distribution and the amount of spike protein a transfected cell line produces are all measured before a lot is released.',
          dependsOnStepId: 'ela-4',
          reagentsAndBuffer:
            'Capillary gel electrophoresis, RiboGreen with and without detergent lysis, dynamic light scattering, cell-based expression assay with anti-spike immunoassay readout',
        },
      ],
      structureSource: {
        label:
          'Jeong et al., Assemblies of putative SARS-CoV-2 spike-encoding mRNA sequences for vaccines BNT-162b2 and mRNA-1273 (2021). A 4,004-nucleotide contig assembled from vial residue, ending in the poly(A) tract; it is the ancestral 2020 construct, not the strain-updated formula sold now.',
        identifier:
          'https://github.com/NAalytics/Assemblies-of-putative-SARS-CoV2-spike-encoding-mRNA-sequences-for-vaccines-BNT-162b2-and-mRNA-1273',
        kind: 'url',
      },
    },
    keyAudits: [
      {
        id: 'ela-a1',
        category: 'measured',
        title: 'COVE: 94.1% efficacy against symptomatic COVID-19',
        laymanSummary:
          'Eleven vaccinated participants and 185 placebo participants developed symptomatic COVID-19. All 30 severe cases were in the placebo group.',
        technicalDetails:
          'Phase 3, observer-blinded, placebo-controlled trial at 99 US centres. 30,420 enrolled, randomised 1:1 to two 100 microgram doses 28 days apart. Symptomatic COVID-19 with onset at least 14 days after the second injection occurred in 11 vaccine recipients (3.3 per 1,000 person-years) and 185 placebo recipients (56.5 per 1,000 person-years), giving 94.1% efficacy (95% CI 89.3 to 96.8, P<0.001). All 30 severe cases, including the one fatality, were in the placebo group.',
        evidenceSource: 'Baden et al., New England Journal of Medicine, 2021',
        doi: '10.1056/NEJMoa2035389',
        measuredMetric: '94.1% efficacy against symptomatic COVID-19 (95% CI 89.3 to 96.8)',
        auditFlag: 'verified',
      },
      {
        id: 'ela-a2',
        category: 'measured',
        title: 'This trial did measure asymptomatic infection, and got 63.0%',
        laymanSummary:
          'Because participants were swabbed at scheduled visits whether or not they felt ill, this trial could put a number on silent infection. The number was much lower than the headline.',
        technicalDetails:
          'At completion of the blinded phase, with 30,415 participants and a median 5.3 months of follow-up, efficacy against symptomatic COVID-19 was 93.2% (95% CI 91.0 to 94.8) with 55 cases against 744, and 98.2% (95% CI 92.8 to 99.6) against severe disease. Efficacy against asymptomatic infection starting 14 days after the second injection was 63.0%. That last number is the one worth remembering when someone claims an mRNA vaccine either does or does not stop infection.',
        evidenceSource: 'El Sahly et al., New England Journal of Medicine, 2021',
        doi: '10.1056/NEJMoa2113017',
        measuredMetric:
          '63.0% efficacy against asymptomatic infection; 93.2% against symptomatic disease at completion of the blinded phase',
        auditFlag: 'verified',
      },
      {
        id: 'ela-a3',
        category: 'failed',
        title: 'Myocarditis risk in young men is measurably higher than with the Pfizer vaccine',
        laymanSummary:
          'Across four Nordic countries and 23 million residents, second doses of this vaccine produced roughly three times the excess myocarditis of the Pfizer vaccine in males aged 16 to 24.',
        technicalDetails:
          'Cohort study of 23,122,522 residents of Denmark, Finland, Norway and Sweden followed to 5 October 2021, with 1,077 incident myocarditis events. In males aged 16 to 24 receiving a homologous schedule, the adjusted incidence rate ratio in the 28 days after the second dose was 13.83 (95% CI 8.08 to 23.68) for mRNA-1273 against 5.31 (95% CI 3.68 to 7.68) for BNT162b2. Excess events were 18.39 per 100,000 vaccinees (95% CI 9.05 to 27.72) for mRNA-1273 and 5.55 (95% CI 3.70 to 7.39) for BNT162b2. Several Nordic regulators restricted this product in young men on the strength of it.',
        evidenceSource: 'Karlstad et al., JAMA Cardiology, 2022',
        doi: '10.1001/jamacardio.2022.0583',
        measuredMetric:
          '18.39 excess myocarditis events per 100,000 second doses in males aged 16 to 24',
        auditFlag: 'caution',
      },
      {
        id: 'ela-a4',
        category: 'inferred',
        title: 'Efficacy against death was never demonstrated by this trial on its own',
        laymanSummary:
          'One person died of COVID-19 during the blinded phase, in the placebo group. A single event cannot establish a mortality benefit.',
        technicalDetails:
          'COVE was powered on symptomatic COVID-19, not on death. The single COVID-19 death in the blinded phase was in the placebo arm. That is consistent with a mortality benefit and is not a measurement of one. The claim that mRNA vaccination reduces COVID-19 mortality rests on the 98.2% efficacy against severe disease plus large observational cohorts, not on counted deaths inside this randomised trial.',
        evidenceSource: 'El Sahly et al., New England Journal of Medicine, 2021',
        doi: '10.1056/NEJMoa2113017',
        inferredClaim:
          'That the pivotal randomised trial demonstrated a reduction in COVID-19 deaths.',
        auditFlag: 'caution',
      },
      {
        id: 'ela-a5',
        category: 'conclusion_shift',
        title: 'Dose, strain and eligible population have all changed since the pivotal trial',
        laymanSummary:
          'The trial used 100 micrograms of ancestral-strain mRNA in adults of any risk level. The product now sold is 50 micrograms of an omicron-strain sequence for a restricted population.',
        technicalDetails:
          'Each 0.5 mL dose of the 2025-2026 formula contains 50 micrograms of mRNA encoding the spike of omicron sublineage LP.8.1; the 0.25 mL paediatric presentation contains 25 micrograms. The label restricts use to people 65 and older, or 6 months through 64 years with at least one high-risk condition. Half the dose, a different antigen and a different population: the 94.1% figure describes none of those things.',
        evidenceSource: 'SPIKEVAX US prescribing information, DailyMed',
        auditFlag: 'verified',
      },
      {
        id: 'ela-a6',
        category: 'conclusion_shift',
        title: 'Protection against infection wanes; protection against severe disease holds longer',
        laymanSummary:
          'The English variant study found two mRNA doses gave little protection against catching symptomatic omicron six months on, even while severe outcomes stayed rarer.',
        technicalDetails:
          'In the same test-negative study that covered 886,774 omicron infections, two mRNA-1273 doses followed the same pattern as BNT162b2: substantial short-term effectiveness against symptomatic omicron that decayed steeply by 25 weeks, with boosters restoring it temporarily. Effectiveness against hospitalisation and death decayed far more slowly, which is the reason the current label targets the people for whom that second curve matters most.',
        evidenceSource: 'Andrews et al., New England Journal of Medicine, 2022',
        doi: '10.1056/NEJMoa2119451',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Intramuscular dose and particle uptake',
        laymanDesc:
          'A half-millilitre injection into the shoulder muscle. The fat droplets are taken up by muscle cells and by immune cells at the site and in the nearby lymph node.',
        molecularDetail:
          'SM-102 is the ionisable lipid here, paired with PEG2000-DMG, DSPC and cholesterol at a total lipid content of 1.01 mg per 0.5 mL dose. Apolipoprotein E adsorption and receptor-mediated endocytosis deliver the particle to myocytes and to dendritic cells trafficking to the draining node.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Acid-triggered endosomal escape',
        laymanDesc:
          'The droplet ends up in an acidic bubble inside the cell. The acid changes the charge on one of the fats, the bubble wall gives way, and part of the cargo reaches the cell body.',
        molecularDetail:
          'Protonation of the SM-102 tertiary amine at endosomal pH creates ion pairs with anionic endosomal lipids and destabilises the bilayer. Escape efficiency is low, single-digit percentages in most published measurements, which is a large part of why the required dose is measured in tens of micrograms.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Translation of a modified transcript',
        laymanDesc:
          'The cell reads the recipe. A modified letter in the RNA keeps the cell from raising an alarm that would shut translation down.',
        molecularDetail:
          'N1-methylpseudouridine substitution reduces TLR7, TLR8 and RIG-I activation and raises translational output. A cap-1 structure installed by vaccinia capping enzyme with 2-prime-O-methyltransferase marks the transcript as self and permits efficient eIF4E-dependent initiation.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Prefusion spike trimer on the cell surface',
        laymanDesc:
          'The cell assembles the coronavirus surface protein and holds it in the shape it takes before it fuses with a cell, which is the shape antibodies need to learn.',
        molecularDetail:
          'Two consecutive proline substitutions in S2 stabilise the prefusion trimer, exposing the receptor-binding domain and the N-terminal domain supersite. Surface display supports B-cell receptor crosslinking; proteasomal processing supplies MHC class I peptides for CD8 priming.',
        iconName: 'Layers',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Antibody, T cells, and measurable protection from silent infection',
        laymanDesc:
          'The immune response that follows cut symptomatic illness by 94% and, in this trial, cut infections without symptoms by 63%.',
        molecularDetail:
          'Germinal centre output gives neutralising IgG against the receptor-binding domain plus CD4 Th1-skewed and CD8 memory. Mucosal IgA is induced weakly by intramuscular dosing, which is the mechanistic reason protection against infection is both smaller and shorter-lived than protection against severe disease.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'COVE primary analysis (NCT04470427)',
        phase: 'Phase 3',
        sampleSize: 30420,
        primaryEndpoint:
          'Prevention of symptomatic COVID-19 with onset at least 14 days after the second injection in participants without prior SARS-CoV-2 infection',
        endpointMet: true,
        statisticalPValue: 'P<0.001; 94.1% efficacy, 95% CI 89.3 to 96.8',
        unreportedAdverseSignals:
          'Myocarditis was not detected in the trial. Its excess in males 16 to 24 was quantified only later, in Nordic national registers.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'COVE blinded-phase completion (NCT04470427)',
        phase: 'Phase 3',
        sampleSize: 30415,
        primaryEndpoint:
          'Prevention of symptomatic COVID-19 through completion of the blinded phase, median follow-up 5.3 months',
        endpointMet: true,
        statisticalPValue: '93.2% efficacy, 95% CI 91.0 to 94.8',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '94.1% efficacy against symptomatic COVID-19 (11 cases against 185) at the primary analysis',
        '63.0% efficacy against asymptomatic infection, measured by scheduled swabs of people who felt well',
        '98.2% efficacy against severe COVID-19 at completion of the blinded phase, 2 cases against 106',
        '18.39 excess myocarditis events per 100,000 second doses in males aged 16 to 24, from Nordic registers',
      ],
      unsupportedInferences: [
        'That the trial demonstrated a mortality benefit: exactly one COVID-19 death occurred in the blinded phase',
        'That 63% against asymptomatic infection means the vaccine blocks transmission; blocking is partial and was measured indirectly',
        'That the 100 microgram ancestral-strain result describes the 50 microgram omicron-strain product sold today',
      ],
      whatFailedInitially: [
        'Unmodified mRNA was too immunogenic as a molecule and too poorly translated to work as a vaccine',
        'The first-generation formulation required ultracold storage, which constrained distribution for a year',
        'Several Nordic regulators paused or restricted this product in young males once the register data landed',
      ],
      realWorldOutcome: [
        'Effectiveness against infection decayed steeply under omicron and with time since the last dose',
        'Effectiveness against hospitalisation and death decayed much more slowly, which is what the narrowed 2025 label is built around',
        'Moderna and the US National Institutes of Health disputed inventorship of the stabilised spike design used in the product',
      ],
    },
    deliverySystem: {
      type: 'Ionisable lipid nanoparticle, intramuscular',
      description:
        'A 0.5 mL intramuscular dose of the 2025-2026 formula contains 50 micrograms of nucleoside-modified mRNA with 1.01 mg total lipid (SM-102, PEG2000-DMG, cholesterol, DSPC), tromethamine buffer, sodium acetate and 43.5 mg sucrose. The paediatric 0.25 mL presentation contains 25 micrograms.',
      safetyProfile:
        'Reactogenicity is more pronounced than with the Pfizer product: fever, chills and fatigue after the second dose are common and transient. Myocarditis and pericarditis are concentrated in males 16 to 24, at an estimated 18.39 excess events per 100,000 second doses in that group. Anaphylaxis is rare.',
    },
    commonQuestions: [
      {
        q: 'Did this trial actually measure whether the vaccine stops infection, not just illness?',
        a: 'Partly, and more than most people realise. Participants were swabbed at scheduled visits regardless of symptoms, so the trial could estimate efficacy against asymptomatic infection: 63.0%, against 93.2% for symptomatic disease. That is a genuine measurement of a partial effect, and it is a good deal more informative than either the claim that the vaccine stops infection or the claim that it does nothing to infection.',
        auditNote:
          'The Pfizer pivotal trial produced no equivalent number, which is why the transmission argument was fought largely without data for the first year.',
      },
      {
        q: 'Is the myocarditis risk different between the two mRNA vaccines?',
        a: 'Yes, and the difference is measured. In a 23-million-person Nordic cohort, the excess myocarditis after a second dose in males aged 16 to 24 was 18.39 per 100,000 for this vaccine and 5.55 per 100,000 for the Pfizer vaccine. Several Nordic regulators acted on that difference by restricting this product in younger men.',
      },
      {
        q: 'Is the vaccine I would get today the one that was tested at 94.1%?',
        a: 'No. The trial used two 100 microgram doses of an ancestral-strain construct in adults across the risk spectrum. The 2025-2026 formula is a single 50 microgram dose encoding an omicron LP.8.1 spike, licensed for people 65 and older or those 6 months to 64 years with a high-risk condition. Strain-updated vaccines are licensed on immunogenicity and manufacturing comparability, not on repeated efficacy trials.',
        auditNote:
          'This is standard practice, and it is also the reason the original efficacy number should not be quoted as though it described the current product.',
      },
      {
        q: 'Why did the price go from about $26 a dose to $110 to $130?',
        a: 'The lower figure was a government purchase price for hundreds of millions of guaranteed doses. The higher figure is the US commercial list price the manufacturer set once the government stopped buying. Neither is production cost: a peer-reviewed model puts manufacturing a 30 microgram mRNA dose at $2.39 including fill-to-finish, and the authors note the figure worsens at Moderna dose levels.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Baden et al., Efficacy and Safety of the mRNA-1273 SARS-CoV-2 Vaccine, NEJM 2021',
        identifier: '10.1056/NEJMoa2035389',
        kind: 'doi',
      },
      {
        label:
          'El Sahly et al., Efficacy of the mRNA-1273 SARS-CoV-2 Vaccine at Completion of Blinded Phase, NEJM 2021',
        identifier: '10.1056/NEJMoa2113017',
        kind: 'doi',
      },
      {
        label:
          'Karlstad et al., SARS-CoV-2 Vaccination and Myocarditis in a Nordic Cohort Study of 23 Million Residents, JAMA Cardiology 2022',
        identifier: '10.1001/jamacardio.2022.0583',
        kind: 'doi',
      },
      {
        label:
          'Andrews et al., Covid-19 Vaccine Effectiveness against the Omicron (B.1.1.529) Variant, NEJM 2022',
        identifier: '10.1056/NEJMoa2119451',
        kind: 'doi',
      },
      {
        label:
          'Dunkle et al., Efficacy and Safety of NVX-CoV2373 in Adults in the United States and Mexico, NEJM 2022',
        identifier: '10.1056/NEJMoa2116185',
        kind: 'doi',
      },
      { label: 'COVE trial record, ClinicalTrials.gov', identifier: 'NCT04470427', kind: 'nct' },
      {
        label: 'SPIKEVAX (COVID-19 Vaccine, mRNA) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f96b315c-fa57-4876-a7e5-a9b584d8e6e6',
        kind: 'regulatory',
      },
      {
        label:
          'Kis et al., Pandemic-response adenoviral vector and RNA vaccine manufacturing, npj Vaccines 2022',
        identifier: '10.1038/s41541-022-00447-3',
        kind: 'doi',
      },
      {
        label:
          'KFF, How Much Could COVID-19 Vaccines Cost the U.S. After Commercialization? (10 March 2023)',
        identifier:
          'https://www.kff.org/covid-19/how-much-could-covid-19-vaccines-cost-the-u-s-after-commercialization/',
        kind: 'url',
      },
      {
        label:
          'Jeong et al., Assemblies of putative SARS-CoV-2 spike-encoding mRNA sequences for vaccines BNT-162b2 and mRNA-1273, 2021',
        identifier:
          'https://github.com/NAalytics/Assemblies-of-putative-SARS-CoV2-spike-encoding-mRNA-sequences-for-vaccines-BNT-162b2-and-mRNA-1273',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // mRNA-1345 (mResvia)
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'mrna-1345',
    name: 'mRNA-1345',
    tradeName: 'mResvia',
    sponsor: 'Moderna',
    targetGene: 'RSV F (viral fusion glycoprotein gene; no human gene is targeted)',
    targetProtein: 'Respiratory syncytial virus stabilised prefusion F glycoprotein',
    modality: 'mRNA Vaccine / Therapeutic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2024,
    indication:
      'Active immunisation to prevent lower respiratory tract disease caused by respiratory syncytial virus in adults 60 years and older, and in adults 18 through 59 years at increased risk.',
    patientFriendlyIndication: 'RSV lung infection prevention in older and higher-risk adults',
    conditionContext: {
      conditionExplainer:
        'Respiratory syncytial virus is a common winter respiratory infection that most people first meet as infants. In older adults it can descend into the lower airways and produce bronchiolitis, pneumonia and decompensation of existing heart or lung disease.',
      whyItMatters:
        'RSV in older adults is under-recognised because it is rarely tested for. When it is tested for, it accounts for a substantial share of winter respiratory admissions in people over 60.',
      whoTakesThis:
        'Adults 60 and older, and adults 18 through 59 with conditions that raise their risk of severe RSV lower respiratory tract disease.',
      clinicalGoals:
        'Prevent RSV-associated lower respiratory tract disease and the hospital admissions that follow from it, across one respiratory season after a single dose.',
    },
    oneSentenceVerdict:
      'A single-dose mRNA vaccine encoding stabilised prefusion RSV F protein, which cut RSV lower respiratory tract disease by 83.7% over a median of 112 days in 35,541 randomised adults aged 60 and over.',
    laymanHowItWorks:
      'RSV gets into cells with a surface protein that springs shut like a mousetrap. Antibodies only work well against the shape it has before it springs. This vaccine gives your cells the recipe for that pre-spring shape, held open by engineering, so the antibodies you make are aimed at the version that matters. One shot, no adjuvant, no live virus.',
    auditConfidence: 'High Confidence',
    confidenceScore: 78,
    anatomicalSite:
      'Deltoid muscle and the draining lymph node; the protection that matters is measured in the lower respiratory tract',
    substitutes: {
      summary:
        'Two protein-based RSV vaccines were licensed before this one and are direct alternatives. There is no dietary or household intervention with randomised evidence against RSV, so those lists are empty.',
      conventionalRx: [
        {
          name: 'RSVPreF3 OA (Arexvy)',
          class: 'Recombinant prefusion F protein with AS01E adjuvant',
          howItCompares:
            'AReSVi-006 measured 82.6% efficacy against RSV lower respiratory tract disease over a median 6.7 months in 24,966 adults aged 60 and over, and 94.1% against severe disease.',
          typicalCost: 'US list price published by the manufacturer at $321.05 per dose',
          prosAndCons:
            'Pros: efficacy demonstrated over a longer median follow-up, and multi-season data. Cons: an adjuvanted protein vaccine is more reactogenic for some recipients.',
        },
        {
          name: 'RSVpreF (Abrysvo)',
          class: 'Bivalent recombinant prefusion F protein, unadjuvanted',
          howItCompares:
            'RENOIR measured 66.7% efficacy (96.66% CI 28.8 to 85.8) against RSV lower respiratory tract disease with at least two signs in 34,284 adults aged 60 and over.',
          typicalCost: 'US list price reported around $320 per dose',
          prosAndCons:
            'Pros: also licensed in pregnancy to protect newborns, which no other RSV vaccine is. Cons: the point estimate against the two-symptom endpoint is the lowest of the three.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'rna_sequence',
      laboratoryWorkflow: [
        {
          id: 'r45-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Template plasmid identity and linearisation check',
          description:
            'The plasmid carrying the stabilised prefusion F coding sequence is sequenced and linearised, and the completeness of the cut is confirmed before transcription.',
          reagentsAndBuffer:
            'Restriction endonuclease digest, capillary electrophoresis, next-generation sequencing, LAL endotoxin assay',
        },
        {
          id: 'r45-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'In vitro transcription with modified uridine and enzymatic capping',
          description:
            'T7 polymerase transcribes the F coding sequence with N1-methylpseudouridine throughout, and the cap is added enzymatically afterwards.',
          dependsOnStepId: 'r45-1',
          reagentsAndBuffer:
            'T7 RNA polymerase, ATP/CTP/GTP with N1-methylpseudouridine-5-triphosphate, vaccinia capping enzyme and 2-prime-O-methyltransferase with S-adenosylmethionine, Tris pH 8.0 with magnesium and spermidine',
        },
        {
          id: 'r45-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Affinity capture and double-stranded RNA removal',
          description:
            'Full-length capped transcript is captured through its poly(A) tail and cleaned of truncated species, enzymes and double-stranded byproducts.',
          dependsOnStepId: 'r45-2',
          reagentsAndBuffer:
            'Oligo-dT affinity resin, high- and low-salt buffers, cellulose dsRNA depletion, tangential flow filtration into acetate buffer',
        },
        {
          id: 'r45-4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Lipid nanoparticle encapsulation',
          description:
            'Acidified RNA and ethanolic lipids meet in a controlled mixer; particles form in milliseconds and are then buffer-exchanged to a neutral, storage-stable formulation.',
          dependsOnStepId: 'r45-3',
          reagentsAndBuffer:
            'SM-102 ionisable lipid, PEG2000-DMG, DSPC and cholesterol in ethanol; mRNA in pH 4 acetate buffer; tangential flow exchange into tromethamine and sucrose',
        },
        {
          id: 'r45-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Prefusion conformation and potency release testing',
          description:
            'A lot is released only if transfected cells express F protein that still binds antibodies specific to the prefusion conformation, since a collapsed postfusion protein would be the wrong antigen.',
          dependsOnStepId: 'r45-4',
          reagentsAndBuffer:
            'Cell-based transfection assay, prefusion-specific monoclonal antibody (site-zero-directed) ELISA, RiboGreen encapsulation assay, dynamic light scattering',
        },
      ],
    },
    keyAudits: [
      {
        id: 'r45-a1',
        category: 'measured',
        title: 'ConquerRSV: 83.7% efficacy against RSV lower respiratory tract disease',
        laymanSummary:
          'In 35,541 adults aged 60 and over, one dose cut RSV lung infection with at least two symptoms by 83.7%.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled phase 2-3 trial; 17,793 to a single 50 microgram dose and 17,748 to placebo. Efficacy was 83.7% (95.88% CI 66.0 to 92.2) against RSV lower respiratory tract disease with at least two signs or symptoms, and 82.4% (96.36% CI 34.8 to 95.3) against the three-symptom endpoint. Efficacy against RSV-associated acute respiratory disease was 68.4% (95% CI 50.9 to 79.7). Protection was seen against both RSV A and RSV B.',
        evidenceSource: 'Wilson et al., New England Journal of Medicine, 2023',
        doi: '10.1056/NEJMoa2307079',
        measuredMetric:
          '83.7% efficacy against RSV lower respiratory tract disease with at least two signs (95.88% CI 66.0 to 92.2)',
        auditFlag: 'verified',
      },
      {
        id: 'r45-a2',
        category: 'inferred',
        title: 'The primary analysis covered a median of 112 days, not a season and not a year',
        laymanSummary:
          'The headline number was read out after about four months of follow-up. Anything said about a second winter is extrapolation from that.',
        technicalDetails:
          'Median follow-up at the primary analysis was 112 days, range 1 to 379, and the analysis was triggered when at least half the anticipated cases had accrued. Durability across a full season, across two seasons, and the value of revaccination are separate questions studied separately. A recipient who is told the vaccine is 83.7% effective is being given a number attached to a short window.',
        evidenceSource: 'Wilson et al., New England Journal of Medicine, 2023',
        doi: '10.1056/NEJMoa2307079',
        inferredClaim:
          'That 83.7% describes protection over an RSV season or over the years following a single dose.',
        auditFlag: 'caution',
      },
      {
        id: 'r45-a3',
        category: 'inferred',
        title: 'The three-symptom endpoint met its criterion with a very wide interval',
        laymanSummary:
          'The second primary endpoint hit 82.4%, but the confidence interval runs from 34.8% to 95.3%. That is a small number of cases doing a lot of work.',
        technicalDetails:
          'Both primary endpoints were met, but they were not equally precise. The two-symptom endpoint carried a 95.88% confidence interval of 66.0 to 92.2; the three-symptom endpoint carried a 96.36% interval of 34.8 to 95.3. The lower bound of the second interval is compatible with a benefit roughly half the size of the point estimate. Quoting 82.4% without that interval overstates what the trial pinned down.',
        evidenceSource: 'Wilson et al., New England Journal of Medicine, 2023',
        doi: '10.1056/NEJMoa2307079',
        inferredClaim:
          'That efficacy against more severe RSV disease was established as precisely as the headline endpoint.',
        auditFlag: 'caution',
      },
      {
        id: 'r45-a4',
        category: 'measured',
        title: 'Real-world effectiveness against hospitalisation, 2025-2026 season',
        laymanSummary:
          'A US veterans study in the 2025-2026 season estimated 85% effectiveness against RSV-associated hospitalisation, though on small numbers.',
        technicalDetails:
          'Test-negative case-control study using Veterans Health Administration records for the 2025-2026 season, covering veterans aged 50 and over tested for RSV during an acute respiratory illness. Of 91,397 people tested, 1.4% had received mRNA-1345. The matched analysis included 3,673 RSV cases and 14,566 controls. Effectiveness was 85% (95% CI 39 to 96) against RSV-positive hospitalisation, 65% (45 to 77) against medically attended RSV illness, 57% (28 to 74) against emergency or urgent care visits and 71% (19 to 90) against outpatient visits.',
        evidenceSource:
          'Vaccine effectiveness of mRNA-1345 among US veterans, 2025-2026, Vaccine 2026',
        doi: '10.1016/j.vaccine.2026.128882',
        measuredMetric:
          '85% effectiveness against RSV-associated hospitalisation (95% CI 39 to 96) in a test-negative design',
        auditFlag: 'verified',
      },
      {
        id: 'r45-a5',
        category: 'measured',
        title: 'Local and systemic reactions were common and documented',
        laymanSummary:
          'Most recipients had a sore arm and roughly half had a systemic reaction such as fatigue or headache, almost all mild and short.',
        technicalDetails:
          'Solicited local adverse reactions occurred in 58.7% of vaccine recipients against 16.2% of placebo recipients, and systemic reactions in 47.7% against 32.9%. Most were mild to moderate and transient. Serious adverse events occurred in 2.8% of each group, which is the comparison that matters and which showed no imbalance.',
        evidenceSource: 'Wilson et al., New England Journal of Medicine, 2023',
        doi: '10.1056/NEJMoa2307079',
        auditFlag: 'verified',
      },
      {
        id: 'r45-a6',
        category: 'conclusion_shift',
        title:
          'The licensed population widened after approval, on immunogenicity rather than efficacy',
        laymanSummary:
          'The trial enrolled adults 60 and over. The label now also covers 18 to 59 year olds at increased risk, a group in whom efficacy was not separately measured.',
        technicalDetails:
          'The current US label covers individuals 60 years and older and individuals 18 through 59 years at increased risk for RSV lower respiratory tract disease. The 18 to 59 indication rests on immunobridging: comparable neutralising antibody responses to those seen in the population where efficacy was measured. That is a normal and accepted regulatory route, and it is not the same evidence as a randomised efficacy result in that age band.',
        evidenceSource: 'MRESVIA US prescribing information, DailyMed',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Single intramuscular dose in a lipid nanoparticle',
        laymanDesc:
          'One half-millilitre shot into the shoulder. No adjuvant is added; the lipid carrier itself provides enough of a danger signal.',
        molecularDetail:
          'A single 50 microgram dose of nucleoside-modified mRNA in an SM-102 lipid nanoparticle. Unlike the adjuvanted protein RSV vaccines, no AS01-type saponin adjuvant is present; innate activation comes from the particle and from residual pattern recognition of the transcript.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Uptake and endosomal release in muscle and dendritic cells',
        laymanDesc:
          'Cells swallow the droplets, and the acid inside the resulting bubble breaks it open so the recipe reaches the cell body.',
        molecularDetail:
          'Receptor-mediated endocytosis followed by pH-triggered protonation of the ionisable lipid, ion pairing with anionic endosomal phospholipids and bilayer destabilisation. Dendritic cells that take up the particle traffic to the draining lymph node carrying both antigen and transcript.',
        iconName: 'ArrowDown',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Translation of the stabilised F sequence',
        laymanDesc:
          'Ribosomes read the recipe and build the RSV surface protein, engineered so it cannot snap into its collapsed shape.',
        molecularDetail:
          'Substitutions and a cavity-filling design hold the F trimer in the prefusion conformation, preserving antigenic site zero and site five. These sites carry the most potent neutralising epitopes and are absent from the postfusion form, which is why earlier postfusion-based candidates raised antibodies that neutralised poorly.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Prefusion F is displayed and drives a focused antibody response',
        laymanDesc:
          'The immune system sees the pre-spring shape, and builds antibodies aimed precisely at the part of the virus that has to work for infection to start.',
        molecularDetail:
          'Site-zero-directed and site-five-directed antibodies dominate the neutralising response to prefusion F. Recall of pre-existing memory from lifelong RSV exposure is substantial in older adults, which is why one dose without an adjuvant is sufficient where a naive population would need more.',
        iconName: 'Layers',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer lower respiratory tract infections in the season that follows',
        laymanDesc:
          'The measured result is fewer RSV lung infections and fewer RSV hospital admissions in the months after the dose.',
        molecularDetail:
          'Serum neutralising titres against RSV A and RSV B rise several-fold and then decline. Because protection tracks serum neutralisation rather than mucosal IgA, it reduces progression to lower respiratory disease more reliably than it prevents upper airway infection.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ConquerRSV / P301 (NCT05127434)',
        phase: 'Phase 2-3',
        sampleSize: 35541,
        primaryEndpoint:
          'Prevention of RSV-associated lower respiratory tract disease with at least two signs or symptoms',
        endpointMet: true,
        statisticalPValue: '83.7% efficacy, 95.88% CI 66.0 to 92.2',
        unreportedAdverseSignals:
          'The primary analysis reported a median follow-up of 112 days, so durability beyond that window is not addressed by this readout.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '83.7% efficacy against RSV lower respiratory tract disease with at least two signs, over a median of 112 days',
        '68.4% efficacy against RSV-associated acute respiratory disease in the same trial',
        '85% real-world effectiveness against RSV-associated hospitalisation among US veterans in the 2025-2026 season',
        'Solicited local reactions in 58.7% of recipients against 16.2% on placebo, with matched serious adverse event rates of 2.8%',
      ],
      unsupportedInferences: [
        'That 83.7% describes a full season or multiple seasons of protection from one dose',
        'That the three-symptom endpoint is as well established as the headline: its interval runs from 34.8% to 95.3%',
        'That efficacy shown in adults 60 and over was demonstrated in the 18 to 59 group added later by immunobridging',
      ],
      whatFailedInitially: [
        'RSV vaccine development stalled for decades after a 1960s formalin-inactivated vaccine produced enhanced disease in children',
        'Postfusion-F-based candidates raised antibodies that bound the wrong conformation and neutralised poorly',
      ],
      realWorldOutcome: [
        'Three RSV vaccines now compete in the same population, and this is the only mRNA one',
        'Uptake has been limited, at 1.4% of a tested veteran cohort in the 2025-2026 season, which constrains the precision of every real-world estimate',
      ],
    },
    deliverySystem: {
      type: 'Ionisable lipid nanoparticle, intramuscular, single dose',
      description:
        'A single 0.5 mL intramuscular dose containing 50 micrograms of nucleoside-modified mRNA encoding stabilised prefusion RSV F, in an SM-102 lipid nanoparticle. Supplied prefilled, with no adjuvant.',
      safetyProfile:
        'Injection-site pain is the rule rather than the exception, at 58.7% against 16.2% on placebo, and systemic reactions occurred in 47.7% against 32.9%. Serious adverse events were balanced at 2.8% in each group. Guillain-Barre syndrome has been a watched outcome across the RSV vaccine class and is monitored in post-marketing surveillance.',
    },
    commonQuestions: [
      {
        q: 'How long does one dose protect me for?',
        a: 'The pivotal readout does not answer that. Its median follow-up was 112 days, and the analysis was triggered once half the expected cases had accrued. Durability across a season, across two seasons, and whether revaccination helps are being studied separately. Anyone quoting 83.7% as a season-long or multi-year figure is going beyond the readout.',
        auditNote:
          'Short median follow-up at a case-driven interim analysis is the single most common source of over-read vaccine efficacy figures.',
      },
      {
        q: 'How does it compare with the two protein RSV vaccines?',
        a: 'All three met their endpoints in large randomised trials, but the trials are not identical, so the numbers are not strictly comparable. Arexvy measured 82.6% against RSV lower respiratory tract disease over a median 6.7 months; Abrysvo measured 66.7% against its two-symptom endpoint; this vaccine measured 83.7% over a median 112 days. Follow-up length, case definitions and confidence interval widths differ enough that ranking them by point estimate alone is not sound.',
      },
      {
        q: 'Is it approved for people under 60?',
        a: 'Yes, for adults 18 through 59 at increased risk, but that indication came from immunobridging rather than from a separate efficacy trial. The regulator accepted comparable antibody responses as evidence that the measured benefit carries across. That is a standard route, and it is a different kind of evidence from a randomised outcome result.',
      },
      {
        q: 'Why is there no pricing block on this record?',
        a: 'Because there is no published, peer-reviewed cost-of-production study for this product, and this site does not estimate synthesis costs itself. A US list price around $290 a dose has been reported in secondary sources; without a production-cost figure from published research, a markup number here would be arithmetic on a guess.',
        auditNote:
          'Omitting the pricing panel is the correct outcome when only one half of the comparison can be sourced.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Wilson et al., Efficacy and Safety of an mRNA-Based RSV PreF Vaccine in Older Adults, NEJM 2023',
        identifier: '10.1056/NEJMoa2307079',
        kind: 'doi',
      },
      {
        label:
          'Vaccine effectiveness of mRNA-1345 against RSV-associated hospitalization and medically attended acute respiratory illness among US veterans, 2025-2026, Vaccine 2026',
        identifier: '10.1016/j.vaccine.2026.128882',
        kind: 'doi',
      },
      {
        label:
          'Papi et al., Respiratory Syncytial Virus Prefusion F Protein Vaccine in Older Adults, NEJM 2023',
        identifier: '10.1056/NEJMoa2209604',
        kind: 'doi',
      },
      {
        label:
          'Walsh et al., Efficacy and Safety of a Bivalent RSV Prefusion F Vaccine in Older Adults, NEJM 2023',
        identifier: '10.1056/NEJMoa2213836',
        kind: 'doi',
      },
      {
        label: 'ConquerRSV trial record, ClinicalTrials.gov',
        identifier: 'NCT05127434',
        kind: 'nct',
      },
      {
        label: 'MRESVIA (respiratory syncytial virus vaccine) US prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e5c837e7-41e8-496a-9c85-6b0453b35948',
        kind: 'regulatory',
      },
      {
        label: 'GSK published US price for AREXVY',
        identifier: 'https://gskforyou.com/gsk-pricing-information/arexvy/',
        kind: 'url',
      },
    ],
  },
]
