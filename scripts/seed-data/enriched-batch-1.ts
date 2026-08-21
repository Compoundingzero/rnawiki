import type { SeedDossier } from '@/lib/seed-types'

/**
 * Enriched batch 1 — the antithrombotics, plus one integrase inhibitor.
 *
 * Eleven of the twelve drugs in this group stop blood from clotting, and they are grouped together
 * because they share the one problem that makes this class worth auditing: every one of them is
 * approved on a trade, never on an unambiguous win. Fewer clots against more bleeding, a surrogate
 * against an outcome, a non-inferiority margin against a superiority claim. A page that reports the
 * ischaemic number and not the bleeding number is not reporting the trial.
 *
 * Every DOI, PMID and NCT number below was resolved at the time of writing — DOIs through the
 * Crossref API, PMIDs and abstracts through NCBI E-utilities, NCT numbers through the
 * ClinicalTrials.gov v2 API. Every effect size, arm size, hazard ratio, confidence interval and
 * p-value is copied from the published abstract or from the US label text stored on this record,
 * never from memory. Where a number could not be sourced, the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. PRICING IS A PRICE, NOT A COST. `retailPricePerDoseOrYear` carries the United States pharmacy
 *    acquisition cost held on this record, which comes from the CMS National Average Drug
 *    Acquisition Cost file. `synthesisCostPerDose` is empty on every dossier here, because no
 *    published per-dose cost-of-production figure for any of these molecules could be verified.
 *    The cost-of-production literature this file checked is Hill, Barber and Gotham in BMJ Global
 *    Health, which publishes an estimation method and an aggregate range rather than per-drug
 *    figures for these compounds; it is cited as `costSource` so a reader can see what was checked
 *    and what it does not contain. Five of the twelve — argatroban, bivalirudin, dalteparin,
 *    tirofiban and cangrelor — are hospital-administered injectables with no NADAC listing on this
 *    record, and they carry no `pricing` block at all. A missing number beats a manufactured one.
 *
 * 2. THE SMILES STRINGS ARE THE ONES ALREADY ON THE RECORD. Each was pulled from PubChem by the
 *    ingestion pipeline and passed this repository's structure parser before curation began. The
 *    PubChem CID, molecular formula and molecular weight were re-checked against the PUG REST
 *    property endpoint while writing, and all ten matched. Enoxaparin and dalteparin have no SMILES
 *    and never will: they are polydisperse mixtures of sulphated polysaccharide chains, not
 *    molecules, and their dossiers say so instead of inventing a representative structure.
 *
 * 3. EVERY DOSSIER SEPARATES THE COMPOSITE FROM ITS COMPONENTS. This class is where composite
 *    endpoints do the most work and hide the most. Cangrelor's approval rests on a composite whose
 *    largest component was periprocedural enzyme rise; argatroban's rests on a composite scored
 *    against a historical control group; bivalirudin's rests on a net-clinical-benefit composite
 *    that mixes bleeding and death. Which component moved is stated in as many words.
 *
 * 4. THE AUDIT POINTS ARE NOT A HIGHLIGHT REEL. Every dossier carries at least one 'inferred' or
 *    'failed' entry, and most carry several, because the literature supplies them: dabigatran's
 *    trial was corrected after publication and failed outright in mechanical valves, edoxaban was
 *    approved with a carve-out excluding the patients with the best kidneys, fondaparinux tripled
 *    catheter thrombosis, tirofiban lost a head-to-head to abciximab, cangrelor missed its primary
 *    endpoint twice before hitting it once, prasugrel failed in medically managed patients,
 *    ticagrelor missed in stroke and has had its pivotal trial questioned twice in the BMJ, and
 *    bivalirudin was beaten by ordinary heparin in an all-comers trial.
 *
 * 5. NO DOSING, TITRATION, BRIDGING OR PROCUREMENT GUIDANCE. Strengths and infusion rates appear
 *    only where they are part of a trial's description or a label's identity. Nothing here tells a
 *    reader what to take, when to stop, or how to switch.
 */

const NADAC_SOURCE = {
  label: 'CMS National Average Drug Acquisition Cost (NADAC) file, United States pharmacy pricing',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group; it publishes an estimation method and an aggregate range, and carries no per-dose figure for the drugs in this file',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_1_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Bictegravir — two non-inferiority trials, no superiority claim anywhere, and a weight signal
  //    that belongs to the partner drug it is welded to.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'bictegravir',
    name: 'Bictegravir',
    tradeName: 'Biktarvy',
    sponsor: 'Gilead Sciences Inc.',
    targetGene: 'HIV-1 pol (integrase coding region)',
    targetProtein:
      'HIV-1 integrase, chelating the two catalytic magnesium ions in the DDE active site of the intasome',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2018,
    indication:
      'Complete regimen for the treatment of HIV-1 infection in adults and paediatric patients weighing at least 14 kg, with no antiretroviral treatment history or replacing a current suppressive regimen',
    patientFriendlyIndication: 'HIV infection, as one tablet containing three drugs',
    anatomicalSite: 'Cytoplasm and nucleus of infected CD4-positive T lymphocytes',
    conditionContext: {
      conditionExplainer:
        'HIV copies its genetic material into DNA and then splices that DNA into one of the chromosomes of the cell it has infected. Once spliced in, the cell carries the virus for as long as it lives, and no approved drug removes it. Treatment works by stopping new cells from being infected, not by clearing the ones already carrying the virus.',
      whyItMatters:
        'Left untreated, the virus destroys the CD4 T cells that coordinate the immune response and the person becomes vulnerable to infections a healthy immune system ignores. Suppressed to below the limit of detection, the virus is not transmitted sexually and life expectancy approaches that of the uninfected population.',
      whoTakesThis:
        'Adults and children over 14 kg starting HIV treatment for the first time, and people already suppressed on another regimen who switch to a single daily tablet. It is one of the most prescribed HIV regimens in high-income countries.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre, sustained, with no emergence of resistant virus. That is the endpoint every trial on this page measured.',
    },
    oneSentenceVerdict:
      'An integrase inhibitor that jams the enzyme HIV uses to splice itself into human chromosomes, which held 92.4% of previously untreated adults below 50 copies per millilitre at 48 weeks in its first registration trial — a result that was non-inferior to dolutegravir and has never, in any trial, been shown to be better than it.',
    laymanHowItWorks:
      "HIV cannot survive in a cell until it pastes its own genetic code into one of your chromosomes. The enzyme that does the pasting is called integrase, and it needs two magnesium ions held in exactly the right place to cut and join DNA. Bictegravir grabs both of those magnesium ions and holds the enzyme in a pose where the joining step cannot happen. The virus's DNA is left floating in the cell, unspliced, and that cell is never turned into a virus factory.",
    auditConfidence: 'High Confidence',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$136.73 per tablet at United States pharmacy acquisition cost (CMS NADAC). The price is for the fixed-dose tablet containing bictegravir, emtricitabine and tenofovir alafenamide; bictegravir is not sold on its own.',
      markupEstimate: '',
      openPatentNotes:
        'Discovered and developed at Gilead Sciences and approved in February 2018. Composition-of-matter and combination patents remain in force in the United States and there is no United States generic. Gilead has licensed generic manufacture of bictegravir-containing regimens for a defined list of low- and middle-income countries through the Medicines Patent Pool.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Bictegravir competes almost entirely with dolutegravir, and the two registration trials were designed to show it was not worse. Neither showed it was better. The honest comparison is that this is a convenience and tolerability argument between two integrase inhibitors with indistinguishable virological performance, and that dolutegravir is available as a low-cost generic in most of the world while bictegravir is not. There is no food, supplement or home measure that substitutes for antiretroviral therapy, and this page does not pretend otherwise.',
      conventionalRx: [
        {
          name: 'Dolutegravir with abacavir and lamivudine (Triumeq)',
          class: 'Integrase strand transfer inhibitor plus two nucleoside analogues',
          howItCompares:
            'The comparator in registration trial GS-US-380-1489. At week 48, 93.0% of 315 participants on this regimen were below 50 copies per millilitre against 92.4% of 314 on bictegravir — a difference of -0.6% favouring dolutegravir, well inside the non-inferiority margin. Nausea was the one clear separation, occurring in 23% on dolutegravir-abacavir-lamivudine against 10% on bictegravir.',
          typicalCost:
            'Available as a generic in most low- and middle-income countries through Medicines Patent Pool licences; the United States branded product has no NADAC figure on this record',
          prosAndCons:
            'Pros: decades of accumulated data on dolutegravir, generic availability outside the United States. Cons: abacavir requires HLA-B*5701 testing before use because of a hypersensitivity reaction, and this regimen does not cover hepatitis B.',
        },
        {
          name: 'Dolutegravir with emtricitabine and tenofovir alafenamide',
          class: 'Integrase strand transfer inhibitor plus two nucleoside analogues',
          howItCompares:
            'The comparator in registration trial GS-US-380-1490, and the closest possible control: the same two partner drugs, a different integrase inhibitor. At week 48, 93% of 325 participants on dolutegravir were below 50 copies per millilitre against 89% of 320 on bictegravir, a difference of -3.5% (95.002% CI -7.9 to 1.0, p=0.12). Non-inferior, and numerically behind.',
          typicalCost: 'No NADAC figure on this record',
          prosAndCons:
            'Pros: the direct test of bictegravir against dolutegravir with everything else held constant. Cons: taken as more than one tablet in the trial, which is the practical argument bictegravir is sold on.',
        },
        {
          name: 'Doravirine-based regimens (Pifeltro, Delstrigo)',
          class: 'Non-nucleoside reverse transcriptase inhibitor',
          howItCompares:
            'Blocks an earlier step — the copying of viral RNA into DNA — rather than the splicing step. A different class with a different resistance pathway and a lower barrier to resistance than the integrase inhibitors, and it has not been compared with bictegravir head to head.',
          typicalCost: 'No NADAC figure on this record',
          prosAndCons:
            'Pros: favourable lipid profile, no integrase-inhibitor weight signal. Cons: non-nucleoside resistance mutations arise from a single substitution, and cross-resistance across the class is broad.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask whether your weight is being tracked, not just your viral load',
          action:
            'Request that body weight be recorded at each visit alongside the viral load and CD4 count, particularly in the first two years of an integrase-inhibitor regimen combined with tenofovir alafenamide.',
          patientImpact:
            'In the ADVANCE trial, which studied dolutegravir rather than bictegravir but the same tenofovir alafenamide partner drug, weight increase was greatest in the tenofovir alafenamide group and among female participants: mean increases of 6.4 kg on the tenofovir alafenamide regimen, 3.2 kg on the tenofovir disoproxil regimen and 1.7 kg on standard care at 48 weeks.',
          clinicalPrecaution:
            'Weight gain on suppressive therapy is not a reason to stop treatment and stopping is dangerous. It is a reason for the weight to be a recorded number rather than an impression.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1C[C@@H]2C[C@H]1N3[C@H](O2)CN4C=C(C(=O)C(=C4C3=O)O)C(=O)NCC5=C(C=C(C=C5F)F)F',
      chemicalFormula: 'C21H18F3N3O5',
      molecularWeight: '449.40 g/mol',
      targetReceptorAffinity:
        'A two-metal-binding integrase strand-transfer inhibitor. The hydroxypyridinone oxygens chelate both catalytic magnesium ions and the trifluorobenzyl group occupies the pocket vacated by the displaced viral DNA base. Its in-vitro selection experiments required more mutations to lose activity than earlier integrase inhibitors, which is the origin of the phrase "high barrier to resistance" — an in-vitro property, not a clinical measurement.',
      structureSource: {
        label: 'PubChem CID 90311989 (bictegravir) — SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bic-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and enantiomeric purity of the bicyclic aminoalcohol',
          description:
            'Confirm identity, water content and enantiomeric excess of the bridged bicyclic amino alcohol that sets the two fused stereocentres. Bictegravir has a rigid tricyclic core and the wrong enantiomer of this fragment produces a compound that does not chelate both magnesium ions; it is the fragment the whole route is built around.',
          reagentsAndBuffer:
            'Chiral HPLC with a polysaccharide-based stationary phase, Karl Fischer titration, reference standards of both enantiomers, 1H and 19F NMR in deuterated dimethyl sulfoxide',
        },
        {
          id: 'bic-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amide coupling of the pyridinone acid to 2,4,6-trifluorobenzylamine',
          description:
            'Couple the hydroxypyridinone carboxylic acid to 2,4,6-trifluorobenzylamine to install the halogenated benzyl arm that occupies the DNA-base pocket. The three fluorines are not decoration: removing any of them costs activity against integrase mutants.',
          dependsOnStepId: 'bic-w1',
          reagentsAndBuffer:
            '2,4,6-trifluorobenzylamine, a uronium coupling reagent with N,N-diisopropylethylamine in N,N-dimethylformamide, nitrogen atmosphere',
        },
        {
          id: 'bic-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Demethylation and crystallisation of the free phenol',
          description:
            'Remove the protecting group from the chelating hydroxyl and crystallise the free compound. The exposed hydroxyl and the adjacent ketone are the two oxygens that hold the magnesium ions, so residual protected material is inactive and must be cleared, not tolerated.',
          dependsOnStepId: 'bic-w2',
          reagentsAndBuffer:
            'Lithium chloride or magnesium bromide in a polar aprotic solvent for demethylation, then recrystallisation from ethanol and water, reversed-phase HPLC with UV detection for related substances',
        },
        {
          id: 'bic-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Single-round infection assay in MT-4 cells',
          description:
            'Infect MT-4 lymphoblastoid cells with a reporter HIV-1 clone in the presence of the compound and read protection from viral cytopathic effect. This is where an integrase inhibitor either works in a cell or does not; enzyme assays alone cannot see whether the compound reaches the pre-integration complex.',
          dependsOnStepId: 'bic-w3',
          reagentsAndBuffer:
            'MT-4 cells in RPMI-1640 with 10% foetal bovine serum and glutamine, HIV-1 IIIB reporter stock, dimethyl sulfoxide vehicle at 0.1% final, tetrazolium viability reagent',
        },
        {
          id: 'bic-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Strand-transfer inhibition and integrated proviral DNA quantification',
          description:
            'Run a recombinant integrase strand-transfer assay for the biochemical potency, and in parallel quantify integrated proviral DNA by Alu-gag PCR in the infected cells. Reporting both matters: the biochemical number is the binding, the Alu-gag number is the thing the drug is claimed to prevent, and a compound can move one without the other.',
          dependsOnStepId: 'bic-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 integrase with donor and target oligonucleotide substrates in magnesium chloride buffer, Alu-gag nested PCR primers, genomic DNA extraction columns, quantitative PCR master mix',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bic-a1',
        category: 'measured',
        title: '92.4% suppressed at 48 weeks, and no treatment-emergent resistance in either arm',
        laymanSummary:
          'In the first registration trial, 92 out of every 100 previously untreated adults had virus below the limit of detection at 48 weeks. Nobody in either group developed a virus resistant to any of the study drugs.',
        technicalDetails:
          'GS-US-380-1489 randomised 631 previously untreated HIV-1 infected adults at 122 outpatient centres in nine countries to coformulated bictegravir, emtricitabine and tenofovir alafenamide (n=314 dosed) or coformulated dolutegravir, abacavir and lamivudine (n=315 dosed). At week 48, plasma HIV-1 RNA below 50 copies per millilitre was achieved in 290 of 314 (92.4%) against 293 of 315 (93.0%), difference -0.6% (95.002% CI -4.8 to 3.6, p=0.78), meeting the prespecified -12% non-inferiority margin. No individual in either arm developed treatment-emergent resistance to any study drug. Nausea occurred in 10% (n=32) on bictegravir against 23% (n=72) on the comparator (p<0.0001).',
        evidenceSource: 'Gallant J et al., Lancet 2017;390:2063-2072 (NCT02607930)',
        doi: '10.1016/S0140-6736(17)32299-7',
        measuredMetric:
          'Proportion below 50 copies per millilitre at week 48 by FDA snapshot algorithm',
        auditFlag: 'verified',
      },
      {
        id: 'bic-a2',
        category: 'inferred',
        title:
          'Non-inferiority is the only thing ever demonstrated, in all four registration trials',
        laymanSummary:
          'Every trial that got this drug approved was designed to show it was not worse than something else, and none was designed to show it was better. In the trial that compared it most directly with dolutegravir, its number was lower.',
        technicalDetails:
          'All four phase 3 trials used a non-inferiority design. GS-US-380-1490 held both partner drugs constant and swapped only the integrase inhibitor: at week 48, 286 of 320 (89%) on bictegravir were below 50 copies per millilitre against 302 of 325 (93%) on dolutegravir, difference -3.5% (95.002% CI -7.9 to 1.0, p=0.12). GS-US-380-1844 switched 563 suppressed adults from dolutegravir-abacavir-lamivudine and found 3 of 282 (1%) versus 1 of 281 (<1%) at 50 copies or above, difference 0.7% (p=0.62). GS-US-380-1878 switched 577 suppressed adults from boosted protease inhibitors and found 5 of 290 (2%) versus 5 of 287 (2%), difference 0.0%. Not one of these is a superiority result, and none was powered to be. The commercial case rests on secondary adverse-event counts and on the tablet being one tablet.',
        evidenceSource:
          'Sax PE et al., Lancet 2017;390:2073-2082; Molina JM et al., Lancet HIV 2018;5:e357-e365; Daar ES et al., Lancet HIV 2018;5:e347-e356',
        doi: '10.1016/S0140-6736(17)32340-1',
        inferredClaim:
          'That bictegravir is a better integrase inhibitor than dolutegravir — an inference from tolerability secondaries and pill count, not from any virological comparison that favoured it',
        auditFlag: 'caution',
      },
      {
        id: 'bic-a3',
        category: 'inferred',
        title: 'The "high barrier to resistance" is an in-vitro property extended to people',
        laymanSummary:
          'The claim that this drug is hard for the virus to escape comes from laboratory experiments on cultured virus. In people, the evidence is that no resistance appeared over 48 weeks in trials that had already excluded the people most likely to develop it.',
        technicalDetails:
          'The barrier claim originates in in-vitro resistance selection, where more accumulated integrase substitutions were required to lose activity than with earlier strand-transfer inhibitors. The clinical evidence is an absence: no treatment-emergent resistance in either arm of GS-US-380-1489 or GS-US-380-1490 through 48 weeks. Both trials required screening genotypes showing sensitivity to the partner nucleosides and enrolled participants under trial-grade adherence support; 1489 additionally required an estimated glomerular filtration rate of 50 mL/min or more and excluded hepatitis B co-infection. An absence of observed resistance in roughly 1,300 selected, adherent participants over one year does not measure the height of a barrier, and the populations in whom integrase resistance actually emerges — people with interrupted supply, advanced disease and prior treatment failure — are the ones these trials did not enrol.',
        evidenceSource:
          'Gallant J et al., Lancet 2017;390:2063-2072; Sax PE et al., Lancet 2017;390:2073-2082',
        doi: '10.1016/S0140-6736(17)32340-1',
        inferredClaim:
          'That bictegravir has a clinically high barrier to resistance — an in-vitro selection result plus an absence of events in a selected population, presented as a measured clinical property',
        auditFlag: 'caution',
      },
      {
        id: 'bic-a4',
        category: 'conclusion_shift',
        title:
          'Tenofovir alafenamide was introduced as the safer prodrug, and traded bone and kidney effects for weight',
        laymanSummary:
          'The newer form of tenofovir in this tablet was brought in because it is easier on bones and kidneys than the older form. Trials then found that people on it gain substantially more weight, and that women gain the most.',
        technicalDetails:
          'ADVANCE (NCT03122262) randomised 1,053 participants in South Africa to dolutegravir plus emtricitabine with either tenofovir alafenamide or tenofovir disoproxil fumarate, or to standard-of-care efavirenz-tenofovir disoproxil-emtricitabine. At week 48, suppression below 50 copies per millilitre was 84%, 85% and 79% respectively, with the dolutegravir regimens non-inferior. The tenofovir alafenamide regimen had less effect on bone density and renal function than the others. Weight increase, in both lean and fat mass, was greatest in the tenofovir alafenamide group and among female participants: mean increases of 6.4 kg (tenofovir alafenamide), 3.2 kg (tenofovir disoproxil) and 1.7 kg (standard care). ADVANCE studied dolutegravir, not bictegravir, so this is a partner-drug and class finding rather than a bictegravir result — but tenofovir alafenamide is the partner drug in every bictegravir product, and no bictegravir trial was designed with weight as a primary endpoint.',
        evidenceSource: 'Venter WDF et al., N Engl J Med 2019;381:803-815 (NCT03122262)',
        doi: '10.1056/NEJMoa1902824',
        measuredMetric:
          'Mean weight change at 48 weeks by tenofovir prodrug and by sex, in a randomised comparison',
        auditFlag: 'contested',
      },
      {
        id: 'bic-a5',
        category: 'measured',
        title: 'Switching from a suppressive regimen kept people suppressed, in two trials',
        laymanSummary:
          'Two trials took people whose virus was already undetectable on a different regimen and moved them onto this one. Almost nobody lost control of the virus in either group.',
        technicalDetails:
          'GS-US-380-1844 (NCT02603120) enrolled 563 adults suppressed for at least three months on dolutegravir, abacavir and lamivudine, randomised double-blind to switch or remain: at week 48, 3 of 282 (1%) on bictegravir and 1 of 281 (<1%) on the continued regimen had HIV-1 RNA of 50 copies or more, difference 0.7% (95.002% CI -1.0 to 2.8, p=0.62). Treatment-related adverse events were recorded in 8% versus 16%. GS-US-380-1878 (NCT02603107) enrolled 577 adults suppressed for at least six months on boosted atazanavir or darunavir, randomised open-label: 5 of 290 (2%) and 5 of 287 (2%) at 50 copies or above, difference 0.0% (95.002% CI -2.5 to 2.5). In the open-label switch trial, drug-related adverse events were reported in 19% of the bictegravir group against 2% of the group that changed nothing, which is what an unblinded switch does to symptom reporting.',
        evidenceSource:
          'Molina JM et al., Lancet HIV 2018;5:e357-e365; Daar ES et al., Lancet HIV 2018;5:e347-e356',
        doi: '10.1016/S2352-3018(18)30092-4',
        measuredMetric:
          'Proportion with HIV-1 RNA at or above 50 copies per millilitre at week 48 after switching',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet, three drugs, taken by mouth',
        laymanDesc:
          'The tablet carries bictegravir alongside two other antiviral drugs that block a different step of the same viral life cycle. All three are absorbed together and act inside the same infected cells.',
        molecularDetail:
          'A fixed-dose combination of bictegravir 50 mg, emtricitabine 200 mg and tenofovir alafenamide 25 mg. Bictegravir is metabolised by CYP3A4 and UGT1A1 in roughly equal measure, which is the basis of its relatively quiet interaction profile compared with boosted regimens; polyvalent cations chelate it in the gut, so antacid and mineral timing is a real interaction and not a theoretical one.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the cells the virus is trying to infect',
        laymanDesc:
          'The drug spreads through the blood into the immune cells HIV targets. It has to be inside the cell before the virus finishes copying itself, not after.',
        molecularDetail:
          'Bictegravir is highly protein-bound and distributes into CD4-positive T lymphocytes and macrophages. Its window of action is the interval between reverse transcription completing and the pre-integration complex docking on host chromatin — a matter of hours after a cell is infected.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grabs the two magnesium ions integrase needs',
        laymanDesc:
          'The viral enzyme that pastes HIV into your chromosome uses two magnesium ions as its cutting tools. Bictegravir clamps onto both of them, and the tools stop working.',
        molecularDetail:
          'The hydroxypyridinone oxygens chelate the two Mg2+ ions held by the aspartate-aspartate-glutamate triad in the integrase catalytic core, within the assembled intasome. This is the two-metal-binding pharmacophore shared by the whole strand-transfer inhibitor class.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The viral DNA end is pushed out of position',
        laymanDesc:
          'With the drug in place, the end of the virus DNA that was lined up to be joined is displaced. The joining reaction simply never happens.',
        molecularDetail:
          'The trifluorobenzyl arm occupies the pocket left by the displaced 3′-adenine of the processed viral DNA end, ejecting the reactive 3′-hydroxyl from the active site. Strand transfer is blocked while 3′-processing, the earlier step, is largely spared — which is why this class is named for strand transfer specifically.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Unspliced viral DNA is degraded or circularised, and the cell is never infected',
        laymanDesc:
          'DNA that never gets pasted in has nowhere to go. The cell breaks it down or seals it into a dead loop, and no new virus is made from that cell.',
        molecularDetail:
          'Unintegrated linear viral DNA is degraded or ligated by host repair enzymes into 1-LTR and 2-LTR circles, which are transcriptionally near-silent and are diluted out as cells divide. Measured as plasma HIV-1 RNA, this appears as suppression below 50 copies per millilitre — the endpoint of every trial on this page. It does not touch cells already carrying integrated provirus, which is why treatment is lifelong.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'GS-US-380-1489 (NCT02607930)',
        phase: 'Phase 3 double-blind randomised non-inferiority trial, 48-week primary analysis',
        sampleSize: 629,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48 (FDA snapshot), versus dolutegravir, abacavir and lamivudine',
        endpointMet: true,
        statisticalPValue:
          '92.4% versus 93.0%, difference -0.6% (95.002% CI -4.8 to 3.6), p=0.78; non-inferiority margin -12%',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GS-US-380-1490 (NCT02607956)',
        phase: 'Phase 3 double-blind randomised non-inferiority trial, 48-week primary analysis',
        sampleSize: 645,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48, versus dolutegravir with the same two partner drugs',
        endpointMet: true,
        statisticalPValue:
          '89% versus 93%, difference -3.5% (95.002% CI -7.9 to 1.0), p=0.12; non-inferiority margin -12%',
        unreportedAdverseSignals:
          'The point estimate favoured dolutegravir. Non-inferiority was met because the margin was wide, not because the arms were equal.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GS-US-380-1844 (NCT02603120)',
        phase: 'Phase 3 double-blind randomised switch trial, 48 weeks',
        sampleSize: 563,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA at or above 50 copies per millilitre at week 48 after switching from dolutegravir, abacavir and lamivudine',
        endpointMet: true,
        statisticalPValue:
          '1% versus <1%, difference 0.7% (95.002% CI -1.0 to 2.8), p=0.62; non-inferiority margin 4%',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GS-US-380-1878 (NCT02603107)',
        phase: 'Phase 3 open-label randomised switch trial, 48 weeks',
        sampleSize: 577,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA at or above 50 copies per millilitre at week 48 after switching from a boosted protease inhibitor regimen',
        endpointMet: true,
        statisticalPValue: '2% versus 2%, difference 0.0% (95.002% CI -2.5 to 2.5)',
        unreportedAdverseSignals:
          'Open-label. Drug-related adverse events were reported by 19% of those who switched against 2% of those who changed nothing, a gap that an unblinded design cannot separate from expectation.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ADVANCE (NCT03122262) — partner-drug evidence, not a bictegravir trial',
        phase: 'Phase 3 open-label randomised trial, 48-week primary analysis',
        sampleSize: 1053,
        primaryEndpoint:
          'Proportion below 50 copies per millilitre at week 48 with dolutegravir plus tenofovir alafenamide or tenofovir disoproxil, versus efavirenz-based standard care',
        endpointMet: true,
        statisticalPValue:
          '84%, 85% and 79% respectively; both dolutegravir regimens non-inferior at a -10 percentage-point margin',
        unreportedAdverseSignals:
          'Weight increase was greatest on tenofovir alafenamide and among women: mean 6.4 kg versus 3.2 kg versus 1.7 kg. This row is here because tenofovir alafenamide is the partner drug in every bictegravir product and no bictegravir trial made weight a primary endpoint.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '92.4% of 314 previously untreated adults below 50 copies per millilitre at week 48, against 93.0% of 315 on dolutegravir-abacavir-lamivudine',
        'No treatment-emergent resistance to any study drug in either arm of either registration trial through 48 weeks',
        'Nausea in 10% on bictegravir against 23% on dolutegravir-abacavir-lamivudine (p<0.0001) in trial 1489',
        'Suppression maintained in 99% and 98% of switchers in the two switch trials, at 48 weeks',
      ],
      unsupportedInferences: [
        'That bictegravir is superior to dolutegravir — no trial was designed to test it and the direct comparison favoured dolutegravir numerically',
        'That the "high barrier to resistance" is a measured clinical property rather than an in-vitro selection result plus an absence of events in a selected, adherent, one-year population',
        'That 48-week suppression rates predict durability over decades, which is the timescale on which this drug is actually taken',
        'That the tolerability advantage generalises beyond the specific comparators used — the nausea difference in 1489 is against abacavir-containing therapy, not against dolutegravir as such',
      ],
      whatFailedInitially: [
        'Trial 1490 produced a lower point estimate for bictegravir than for dolutegravir (89% versus 93%) and cleared non-inferiority only on the width of the margin',
        'Tenofovir alafenamide, introduced as the bone- and kidney-sparing prodrug, was found in ADVANCE to produce the largest weight gain of the three regimens tested, concentrated in women',
      ],
      realWorldOutcome: [
        'Approved in the United States in February 2018 and now among the most prescribed HIV regimens in high-income countries',
        'US$136.73 per tablet at pharmacy acquisition cost, for a regimen taken every day for life; there is no United States generic',
        'Licensed for generic manufacture in a defined list of low- and middle-income countries through the Medicines Patent Pool, which is why the price a reader sees depends almost entirely on where they live',
      ],
    },
    deliverySystem: {
      type: 'Oral fixed-dose combination tablet, taken once daily with or without food',
      description:
        'Bictegravir is not marketed on its own. It exists only inside a single tablet with emtricitabine and tenofovir alafenamide, which is the product studied in every trial on this page. Polyvalent cations in antacids, iron and calcium supplements bind it in the gut and reduce absorption.',
      safetyProfile:
        'The US label carries a boxed warning for post-treatment acute exacerbation of hepatitis B: people co-infected with hepatitis B who stop the regimen can have severe hepatic flares, and hepatic function is monitored for months afterwards. Bictegravir inhibits the renal transporters OCT2 and MATE1, which raises serum creatinine without reducing actual glomerular filtration — a laboratory change that is not kidney injury and is regularly mistaken for it. Reported effects include headache, diarrhoea, nausea and weight gain; the weight signal is a class and partner-drug question, addressed in the audit points above.',
    },
    commonQuestions: [
      {
        q: 'Is Biktarvy better than the alternatives, or just newer?',
        a: 'On the numbers, neither trial showed it was better. Both registration trials were designed to show it was not worse, and both succeeded at that. In GS-US-380-1490, which is the cleanest possible comparison because both partner drugs were held constant and only the integrase inhibitor changed, 89% of the bictegravir group and 93% of the dolutegravir group were below 50 copies per millilitre at 48 weeks. That is non-inferior by the trial’s prespecified -12% margin, and it is also numerically behind. What bictegravir genuinely has is a single tablet, no requirement for HLA-B*5701 testing, coverage for hepatitis B co-infection, and a quieter drug-interaction profile than boosted regimens. Those are real advantages and none of them is a virological one.',
        auditNote:
          'A non-inferiority margin is a decision about how much worse a drug is allowed to be while still being called equivalent. In these trials that allowance was twelve percentage points.',
      },
      {
        q: 'Does this drug cause weight gain?',
        a: 'No bictegravir trial was designed to answer that, which is itself the answer to a different question. The best randomised evidence comes from ADVANCE, which studied dolutegravir rather than bictegravir but used the same partner drug, tenofovir alafenamide, that is in every bictegravir product. In that trial mean weight increase at 48 weeks was 6.4 kg on the tenofovir alafenamide regimen, 3.2 kg on tenofovir disoproxil and 1.7 kg on efavirenz-based standard care, with the largest increases in women and in both lean and fat mass. So the honest position is: a substantial randomised weight signal exists for the drug class and for the partner drug, and it has not been measured for bictegravir specifically as a primary endpoint.',
        auditNote:
          'This is the largest gap on the page. The drug that was studied is not the drug being asked about, and the tablet welds them together.',
      },
      {
        q: 'My creatinine went up after starting this. Are my kidneys being damaged?',
        a: 'Not necessarily, and the distinction is mechanical rather than reassuring hand-waving. Bictegravir inhibits two transporters in the kidney tubule, OCT2 and MATE1, that normally secrete creatinine into the urine. Blocking them raises the measured serum creatinine because less creatinine is being pushed out, not because less blood is being filtered. Actual glomerular filtration is unchanged. The rise appears within the first weeks and then plateaus. A creatinine that keeps climbing months later, or one accompanied by protein in the urine, is a different situation and is a question for the prescriber rather than for this page.',
      },
      {
        q: 'What happens if I stop taking it?',
        a: 'The virus returns. Antiretroviral therapy suppresses new infection of cells; it does not remove HIV DNA already spliced into the chromosomes of cells that are still alive, and those cells are the reason treatment is lifelong. There is a second and more specific danger: the US label carries a boxed warning because people who also have hepatitis B can suffer a severe flare of liver inflammation when the emtricitabine and tenofovir in this tablet are withdrawn, since both drugs suppress hepatitis B as well. Stopping is a medical decision with a monitoring plan attached, not something to do between appointments.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost-of-production figure for bictegravir could be verified and cited. The published cost-of-production literature — Hill, Barber and Gotham in BMJ Global Health — reports an estimation method and an aggregate range across the WHO Essential Medicines List, and carries no figure for this compound, which was not on that list. Estimating one here would mean this page inventing a number. What is shown instead is the actual United States pharmacy acquisition cost from the CMS NADAC file, US$136.73 per tablet, which is a price and not a cost of manufacture. The synthesis is genuinely involved — a bridged tricyclic core with two fused stereocentres — so the manufacture is not trivial, but "not trivial" is not a measurement either.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Gallant J et al. Bictegravir, emtricitabine, and tenofovir alafenamide versus dolutegravir, abacavir, and lamivudine for initial treatment of HIV-1 infection (GS-US-380-1489). Lancet 2017;390:2063-2072',
        identifier: '10.1016/S0140-6736(17)32299-7',
        kind: 'doi',
      },
      {
        label:
          'Sax PE et al. Coformulated bictegravir, emtricitabine, and tenofovir alafenamide versus dolutegravir with emtricitabine and tenofovir alafenamide (GS-US-380-1490). Lancet 2017;390:2073-2082',
        identifier: '10.1016/S0140-6736(17)32340-1',
        kind: 'doi',
      },
      {
        label:
          'Molina JM et al. Switching to fixed-dose bictegravir, emtricitabine, and tenofovir alafenamide from dolutegravir plus abacavir and lamivudine. Lancet HIV 2018;5:e357-e365',
        identifier: '10.1016/S2352-3018(18)30092-4',
        kind: 'doi',
      },
      {
        label:
          'Daar ES et al. Efficacy and safety of switching to fixed-dose bictegravir, emtricitabine, and tenofovir alafenamide from boosted protease inhibitor-based regimens. Lancet HIV 2018;5:e347-e356',
        identifier: '10.1016/S2352-3018(18)30091-2',
        kind: 'doi',
      },
      {
        label:
          'Venter WDF et al. Dolutegravir plus Two Different Prodrugs of Tenofovir to Treat HIV (ADVANCE). N Engl J Med 2019;381:803-815',
        identifier: '10.1056/NEJMoa1902824',
        kind: 'doi',
      },
      {
        label: 'GS-US-380-1489 registration record',
        identifier: 'NCT02607930',
        kind: 'nct',
      },
      {
        label: 'GS-US-380-1490 registration record',
        identifier: 'NCT02607956',
        kind: 'nct',
      },
      {
        label: 'ADVANCE trial registration record',
        identifier: 'NCT03122262',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 90311989 — bictegravir structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/90311989',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
      NADAC_SOURCE,
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Dabigatran etexilate — the first oral alternative to warfarin in fifty years, a trial that
  //    was corrected after publication, and a total failure in mechanical heart valves.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dabigatran-etexilate',
    name: 'Dabigatran Etexilate',
    tradeName: 'Pradaxa',
    sponsor: 'Boehringer Ingelheim',
    targetGene: 'F2',
    targetProtein:
      'Thrombin (coagulation factor IIa), reversibly occupying the S1 specificity pocket of the active site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2010,
    indication:
      'Reduction of the risk of stroke and systemic embolism in adults with non-valvular atrial fibrillation; treatment of deep venous thrombosis and pulmonary embolism after parenteral anticoagulation; reduction of recurrence risk; and prophylaxis of deep venous thrombosis after hip replacement surgery',
    patientFriendlyIndication:
      'Preventing strokes in an irregular heartbeat, and treating clots in the legs and lungs',
    anatomicalSite: 'Blood plasma — the active site of circulating thrombin',
    conditionContext: {
      conditionExplainer:
        'In atrial fibrillation the upper chambers of the heart quiver instead of squeezing, so blood pools in a small pouch off the left atrium and can clot there. If that clot breaks loose it travels to the brain, which is what an embolic stroke is. Anticoagulants do not dissolve clots; they make it harder for new ones to form.',
      whyItMatters:
        'Atrial fibrillation raises stroke risk roughly fivefold, and the strokes it causes are larger and more disabling than average. Warfarin cuts that risk by about two thirds, but only within a narrow blood level that needs regular testing, and half of eligible patients were never on it.',
      whoTakesThis:
        'Adults with atrial fibrillation that is not caused by a diseased or replaced heart valve, and adults treated for or at risk of venous clots. It is explicitly contraindicated in people with a mechanical heart valve, for the reason set out in the audit points below.',
      clinicalGoals:
        'Fewer strokes and systemic emboli, without more bleeding than warfarin would have caused. Both halves of that sentence are endpoints, and RE-LY only met one of them at the approved dose.',
    },
    oneSentenceVerdict:
      'A reversible thrombin blocker taken by mouth without blood-level monitoring, which cut stroke or systemic embolism from 1.69% to 1.11% a year against warfarin in 18,113 patients — while leaving overall major bleeding unchanged at that dose, and while its trial was corrected after publication when previously unreported events were found.',
    laymanHowItWorks:
      'Clotting is a chain of enzymes, and thrombin is the last one in the chain: it converts a soluble protein into the fibrin mesh that holds a clot together. Warfarin works upstream, by starving the liver of the vitamin K it needs to build several of those enzymes, which is why it takes days to work and why food changes its effect. Dabigatran skips all of that and plugs the business end of thrombin directly. The capsule itself is inactive; enzymes in your gut wall and liver clip two chemical caps off it to release the working drug.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.8430 per capsule at United States pharmacy acquisition cost (CMS NADAC)',
      markupEstimate: '',
      openPatentNotes:
        'Developed at Boehringer Ingelheim from the thrombin-inhibitor programme that produced the failed oral agent ximelagatran; approved in the United States in October 2010 under NDA 022512. The composition-of-matter patent has expired and generic dabigatran etexilate is now listed in the CMS acquisition-cost file, which is why the per-capsule price above is measured in cents rather than dollars.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Dabigatran is one of four direct oral anticoagulants that displaced warfarin, and it is the only one of them that blocks thrombin rather than factor Xa. It has never been compared head to head with apixaban or rivaroxaban in a randomised trial, so every claim that one is better than another rests on indirect comparison across trials with different warfarin control groups. Warfarin itself remains the only option with an outcome trial in mechanical heart valves, and dabigatran is the drug that proved why.',
      conventionalRx: [
        {
          name: 'Warfarin (generic)',
          class: 'Vitamin K antagonist',
          howItCompares:
            'The comparator in RE-LY. Stroke or systemic embolism 1.69% per year on warfarin against 1.11% on dabigatran 150 mg, but major bleeding 3.36% against 3.11% — a difference that was not significant (p=0.31). Warfarin lost decisively on one bleeding subtype: haemorrhagic stroke, 0.38% per year against 0.10%.',
          typicalCost: 'Off-patent generic; no NADAC figure quoted on this record',
          prosAndCons:
            'Pros: reversible with vitamin K and prothrombin complex concentrate, decades of data, the only anticoagulant with outcome evidence in mechanical valves, and a blood test that tells you whether the patient is actually taking it. Cons: narrow therapeutic range, food and drug interactions, and routine INR monitoring.',
        },
        {
          name: 'Apixaban (Eliquis)',
          class: 'Direct factor Xa inhibitor',
          howItCompares:
            'Blocks factor Xa, one step upstream of thrombin. In its own separate trial against warfarin it reduced both stroke and major bleeding, which dabigatran 150 mg did not. There has never been a randomised head-to-head trial between the two, so this comparison crosses trials and populations.',
          typicalCost: 'No NADAC figure quoted on this record',
          prosAndCons:
            'Pros: the only direct oral anticoagulant to beat warfarin on stroke, bleeding and mortality in its own registration trial. Cons: twice-daily dosing, and its own reversal agent is a separate and expensive product.',
        },
        {
          name: 'Rivaroxaban (Xarelto)',
          class: 'Direct factor Xa inhibitor',
          howItCompares:
            'Once daily rather than twice, with a factor Xa target. Like apixaban it has never been compared directly with dabigatran, and its own registration trial used a warfarin control group with poorer time in the therapeutic range than RE-LY achieved.',
          typicalCost: 'No NADAC figure quoted on this record',
          prosAndCons:
            'Pros: once-daily dosing improves adherence. Cons: gastrointestinal bleeding excess similar to dabigatran, and the quality of its warfarin comparator has been criticised.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Know that your usual clotting test does not measure this drug',
          action:
            'If you are admitted to hospital while taking dabigatran, say so explicitly rather than relying on a blood test to reveal it. The routine INR does not measure dabigatran usefully.',
          patientImpact:
            'A BMJ investigation in 2014 reported that analyses relating dabigatran plasma concentration to bleeding risk had not been made available, in a drug marketed on the basis that no monitoring was needed. The measurement that would answer the question exists — the dilute thrombin time and the ecarin clotting time — but it is not the test most laboratories run by reflex.',
          clinicalPrecaution:
            'This is a statement about what a test can and cannot see. It is not a reason to change, skip or add any dose, and stopping an anticoagulant without advice is itself dangerous.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCCCCCOC(=O)NC(=N)C1=CC=C(C=C1)NCC2=NC3=C(N2C)C=CC(=C3)C(=O)N(CCC(=O)OCC)C4=CC=CC=N4',
      chemicalFormula: 'C34H41N7O5',
      molecularWeight: '627.70 g/mol (dabigatran etexilate free base; dispensed as the mesylate)',
      targetReceptorAffinity:
        'The administered molecule has essentially no affinity for thrombin. It is a double prodrug: a hexyloxycarbonyl cap on the benzamidine and an ethyl ester on the propionic acid, both of which must be cleaved by carboxylesterases before the active benzamidine can enter thrombin’s S1 pocket. Absolute oral bioavailability is about 6 to 7%, and the drug is a P-glycoprotein substrate, which is where its interactions with verapamil, amiodarone and rifampicin come from.',
      structureSource: {
        label:
          'PubChem CID 135565674 (dabigatran etexilate) — SMILES, molecular formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135565674',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dab-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of the benzimidazole carboxamide core',
          description:
            'Confirm identity and related substances in the N-methylbenzimidazole intermediate that carries the pyridyl-aminopropionate arm. This fragment sets the whole molecule and any regioisomer formed during its cyclisation carries through to the finished drug substance.',
          reagentsAndBuffer:
            'Reversed-phase HPLC with UV detection, 1H and 13C NMR in deuterated chloroform, reference standards of the N1 and N3 methylation regioisomers, Karl Fischer titration',
        },
        {
          id: 'dab-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Amidine formation and double prodrug capping',
          description:
            'Convert the aryl nitrile to the benzamidine, then install the two caps that make the molecule absorbable: a hexyloxycarbonyl group on the amidine nitrogen and an ethyl ester on the propionic acid. The free benzamidine is a strong base with almost no oral absorption; capping it is the entire reason this molecule can be swallowed.',
          dependsOnStepId: 'dab-w1',
          reagentsAndBuffer:
            'Hydroxylamine or Pinner conditions for amidine formation, n-hexyl chloroformate with a tertiary amine base, ethanol with acid catalysis for the ester, anhydrous solvents under nitrogen',
        },
        {
          id: 'dab-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Mesylate salt formation and acid-core pelletisation',
          description:
            'Crystallise the methanesulfonate salt and layer it onto tartaric acid core pellets. This is a formulation step that behaves like a purification constraint: dabigatran etexilate dissolves only in an acidic microenvironment, so the pellet carries its own acid with it, and that is why the capsule cannot be opened or crushed without changing the exposure.',
          dependsOnStepId: 'dab-w2',
          reagentsAndBuffer:
            'Methanesulfonic acid in acetone or isopropanol, tartaric acid core pellets, hydroxypropyl methylcellulose coating suspension, dissolution testing in acidic and near-neutral media',
        },
        {
          id: 'dab-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Caco-2 permeability with and without P-glycoprotein inhibition',
          description:
            'Measure apical-to-basolateral and basolateral-to-apical transport across a Caco-2 monolayer, with and without a P-glycoprotein inhibitor, and in parallel measure conversion by carboxylesterase in the same system. Dabigatran etexilate is both a P-glycoprotein substrate and an esterase substrate, and its clinically important interactions are all explained at this step rather than at the target.',
          dependsOnStepId: 'dab-w3',
          reagentsAndBuffer:
            'Caco-2 monolayers on permeable supports in Hank’s balanced salt solution with HEPES, verapamil or elacridar as P-glycoprotein inhibitor, recombinant human carboxylesterase 1 and 2, LC-MS/MS quantification of prodrug and active metabolite',
        },
        {
          id: 'dab-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Thrombin inhibition constant and dilute thrombin time calibration',
          description:
            'Measure the inhibition constant against purified human alpha-thrombin with a chromogenic substrate, then calibrate a dilute thrombin time and an ecarin clotting time in spiked human plasma. The second half matters more than the first: these are the two assays that actually read dabigatran concentration in a patient, and neither is the routine INR.',
          dependsOnStepId: 'dab-w4',
          reagentsAndBuffer:
            'Purified human alpha-thrombin, chromogenic substrate S-2238, pooled normal human plasma spiked across the therapeutic range, ecarin reagent, thrombin reagent diluted in buffered saline, automated coagulometer',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dab-a1',
        category: 'measured',
        title:
          'RE-LY: stroke or systemic embolism cut from 1.69% to 1.11% a year at the 150 mg dose',
        laymanSummary:
          'In 18,113 people with atrial fibrillation, the higher dose prevented about a third of the strokes and travelling clots that warfarin allowed. That is a superiority result, not a tie.',
        technicalDetails:
          'RE-LY (NCT00262600) randomised 18,113 patients with atrial fibrillation and a stroke risk factor to blinded dabigatran 110 mg or 150 mg twice daily, or unblinded adjusted-dose warfarin, with median follow-up of 2.0 years. The primary outcome of stroke or systemic embolism occurred at 1.69% per year on warfarin, 1.53% per year on dabigatran 110 mg (relative risk 0.91, 95% CI 0.74 to 1.11, p<0.001 for non-inferiority) and 1.11% per year on dabigatran 150 mg (relative risk 0.66, 95% CI 0.53 to 0.82, p<0.001 for superiority). All-cause mortality was 4.13% per year on warfarin against 3.75% (110 mg, p=0.13) and 3.64% (150 mg, p=0.051) — a mortality signal that did not reach significance at either dose.',
        evidenceSource: 'Connolly SJ et al., N Engl J Med 2009;361:1139-1151 (NCT00262600)',
        doi: '10.1056/NEJMoa0905561',
        measuredMetric: 'Annualised rate of stroke or systemic embolism over a median of 2.0 years',
        auditFlag: 'verified',
      },
      {
        id: 'dab-a2',
        category: 'measured',
        title:
          'Haemorrhagic stroke fell by roughly three quarters — the most robust finding in the trial',
        laymanSummary:
          'Bleeding into the brain, the most feared complication of any blood thinner, was about a quarter as common on dabigatran as on warfarin, at both doses tested.',
        technicalDetails:
          'In RE-LY, haemorrhagic stroke occurred at 0.38% per year on warfarin against 0.12% per year on dabigatran 110 mg (p<0.001) and 0.10% per year on dabigatran 150 mg (p<0.001). The FDA’s own observational study in 134,414 Medicare beneficiaries, published in Circulation in 2015 with 37,587 person-years of follow-up, reproduced the direction and the magnitude in routine practice: intracranial haemorrhage hazard ratio 0.34 (95% CI 0.26 to 0.46) against warfarin, alongside ischaemic stroke 0.80 (0.67 to 0.96) and death 0.86 (0.77 to 0.96). Two designs, a randomised trial and a propensity-matched cohort of very different patients, agreeing on the same effect.',
        evidenceSource:
          'Connolly SJ et al., N Engl J Med 2009;361:1139-1151; Graham DJ et al., Circulation 2015;131:157-164',
        doi: '10.1161/CIRCULATIONAHA.114.012061',
        measuredMetric:
          'Annualised haemorrhagic stroke rate in RE-LY and intracranial haemorrhage hazard ratio in Medicare',
        auditFlag: 'verified',
      },
      {
        id: 'dab-a3',
        category: 'failed',
        title: 'At the approved 150 mg dose, overall major bleeding was not reduced at all',
        laymanSummary:
          'The dose that prevented the most strokes did not cause less bleeding overall than warfarin. It moved bleeding from the brain to the gut, and the gut bleeding got worse.',
        technicalDetails:
          'Major bleeding in RE-LY was 3.36% per year on warfarin against 2.71% per year on dabigatran 110 mg (p=0.003) and 3.11% per year on dabigatran 150 mg (p=0.31). Only the lower dose, which did not demonstrate superiority for stroke prevention, reduced major bleeding. The FDA Medicare cohort quantified where the bleeding went: major gastrointestinal bleeding hazard ratio 1.28 (95% CI 1.14 to 1.44) against warfarin, with the effect most pronounced at 150 mg twice daily. The trade is real and it is a trade — intracranial bleeding down by about two thirds, gastrointestinal bleeding up by about a quarter — and a page reporting only the first half is reporting half a trial.',
        evidenceSource:
          'Connolly SJ et al., N Engl J Med 2009;361:1139-1151; Graham DJ et al., Circulation 2015;131:157-164',
        doi: '10.1056/NEJMoa0905561',
        measuredMetric:
          'Annualised major bleeding rate at 150 mg twice daily, and gastrointestinal bleeding hazard ratio in routine care',
        auditFlag: 'caution',
      },
      {
        id: 'dab-a4',
        category: 'failed',
        title: 'RE-ALIGN was stopped early: worse clotting and worse bleeding in mechanical valves',
        laymanSummary:
          'A trial testing this drug in people with artificial heart valves was halted because they were having both more strokes and more bleeding than the people on warfarin. It is now a contraindication on the label.',
        technicalDetails:
          'RE-ALIGN (NCT01452347) randomised 252 patients with mechanical aortic or mitral valve replacement 2:1 to dabigatran or warfarin, with dabigatran doses selected by renal function and adjusted to a trough plasma level of at least 50 ng/mL. The trial was terminated prematurely for an excess of both thromboembolic and bleeding events. Ischaemic or unspecified stroke occurred in 9 dabigatran patients (5%) and no warfarin patients; major bleeding in 7 (4%) and 2 (2%), and every major bleed was pericardial. Dose adjustment or discontinuation was required in 52 of 162 dabigatran patients (32%) despite the protocol targeting a plasma level. This is a clean negative result, and it is also the clearest demonstration that "works in atrial fibrillation" does not transfer to "works against a mechanical valve" — different surfaces, different clotting pathway, different drug required.',
        evidenceSource: 'Eikelboom JW et al., N Engl J Med 2013;369:1206-1214 (NCT01452347)',
        doi: '10.1056/NEJMoa1300615',
        measuredMetric:
          'Stroke and major bleeding rates in mechanical valve recipients before early termination',
        auditFlag: 'verified',
      },
      {
        id: 'dab-a5',
        category: 'conclusion_shift',
        title: 'The trial result was revised after publication, when unreported events were found',
        laymanSummary:
          'A year after RE-LY was published, the sponsor reported additional events that had not been counted the first time. The numbers everybody had already quoted changed.',
        technicalDetails:
          'In November 2010 the RE-LY investigators published a letter in the New England Journal of Medicine, "Newly identified events in the RE-LY trial", reporting events found after the primary publication and giving revised rates. The revision matters most for the myocardial infarction question: Uchino and Hernandez pooled seven randomised trials of dabigatran totalling 30,514 patients and found myocardial infarction or acute coronary syndrome in 237 of 20,000 dabigatran patients (1.19%) against 83 of 10,514 controls (0.79%), odds ratio 1.33 (95% CI 1.03 to 1.71, p=0.03); using the revised RE-LY figures the same analysis gave 1.27 (1.00 to 1.61, p=0.05). The FDA Medicare cohort later found no myocardial infarction excess in routine practice (hazard ratio 0.92, 95% CI 0.78 to 1.08). So the field moved from "clear signal" to "small signal that may be chance", and the point of this entry is that the primary publication was not the final word on its own arithmetic.',
        evidenceSource:
          'Connolly SJ et al., N Engl J Med 2010;363:1875-1876; Uchino K, Hernandez AV, Arch Intern Med 2012;172:397-402',
        doi: '10.1001/archinternmed.2011.1666',
        inferredClaim:
          'That the myocardial infarction excess reported from the original RE-LY dataset is a settled drug effect — it shrank on revision and did not reproduce in a 134,414-patient cohort',
        auditFlag: 'contested',
      },
      {
        id: 'dab-a6',
        category: 'inferred',
        title: '"No monitoring required" was a marketing property, not a measured one',
        laymanSummary:
          'This drug was sold on not needing blood tests. Two BMJ investigations in 2014 reported that analyses linking blood levels to bleeding risk had not been disclosed.',
        technicalDetails:
          'Dabigatran was licensed with a fixed dose and no routine coagulation monitoring, which was the principal practical advantage claimed over warfarin. In July 2014 the BMJ published two linked investigations, "Dabigatran: how the drug company withheld important analyses" and "Concerns over data in key dabigatran trial", reporting that internal analyses of the relationship between plasma concentration and bleeding risk had not been made available to regulators. The pharmacology is not in dispute: dabigatran plasma concentration varies severalfold between patients, it is a P-glycoprotein substrate, and roughly 80% of the absorbed active drug is cleared by the kidneys, so renal function directly sets exposure. Assays that read it — the dilute thrombin time and the ecarin clotting time — existed throughout. Whether fixed dosing without them was optimal is a question the published trial was never designed to answer.',
        evidenceSource:
          'Cohen D. Dabigatran: how the drug company withheld important analyses. BMJ 2014;349:g4670; Concerns over data in key dabigatran trial. BMJ 2014;349:g4747',
        doi: '10.1136/bmj.g4670',
        inferredClaim:
          'That fixed dosing without plasma-level measurement is the optimal use of dabigatran — an operating convenience presented as an established equivalence, with the analyses that bear on it undisclosed at the time of licensing',
        auditFlag: 'contested',
      },
      {
        id: 'dab-a7',
        category: 'measured',
        title:
          'Idarucizumab reverses it completely, which none of the factor Xa inhibitors could claim in 2015',
        laymanSummary:
          'An antibody fragment made specifically for this drug switches it off within minutes. In 503 patients with serious bleeding or facing emergency surgery, the median reversal was total.',
        technicalDetails:
          'RE-VERSE AD (NCT02104947) enrolled 503 patients taking dabigatran: 301 with uncontrolled bleeding (group A, of whom 137 had gastrointestinal bleeding and 98 intracranial haemorrhage) and 202 needing an urgent procedure (group B). The median maximum reversal of anticoagulant effect within four hours of 5 g intravenous idarucizumab was 100% (95% CI 100 to 100) by dilute thrombin time or ecarin clotting time. Median time to cessation of bleeding, where assessable, was 2.5 hours; median time to the intended procedure was 1.6 hours with periprocedural haemostasis normal in 93.4%. At 90 days thrombotic events had occurred in 6.3% and 7.4% and mortality was 18.8% and 18.9% — those last figures reflect how sick this population is, not a drug effect, because the study was single-arm with no control.',
        evidenceSource: 'Pollack CV et al., N Engl J Med 2017;377:431-441 (NCT02104947)',
        doi: '10.1056/NEJMoa1707278',
        measuredMetric:
          'Maximum percentage reversal of anticoagulant effect within four hours, by dilute thrombin time or ecarin clotting time',
        inferredClaim:
          'That reversing the laboratory measurement improves survival — the trial had no control arm and measured a coagulation parameter, not an outcome',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A capsule that carries its own acid',
        laymanDesc:
          'The active drug only dissolves in acid, so each capsule contains tiny pellets with a core of tartaric acid. That is why the capsule must not be opened or crushed.',
        molecularDetail:
          'Dabigatran etexilate mesylate is layered onto tartaric acid core pellets to create an acidic microenvironment independent of stomach pH. Absolute oral bioavailability is roughly 6 to 7%; breaching the capsule raises exposure substantially and is a real risk rather than a formulation nicety.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Two chemical caps are clipped off to switch it on',
        laymanDesc:
          'What you swallow does nothing. Enzymes in the gut wall and the liver snip off two protective groups, and only then does the working drug exist.',
        molecularDetail:
          'A double prodrug. Carboxylesterase 2 in the intestine removes the ethyl ester and carboxylesterase 1 in the liver removes the hexyloxycarbonyl carbamate, releasing the free benzamidine. The intact prodrug is also a P-glycoprotein substrate, which is why verapamil and amiodarone raise its levels and rifampicin lowers them.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It plugs the pocket thrombin uses to grip its target',
        laymanDesc:
          'Thrombin recognises what to cut by fitting part of that protein into a deep pocket. The drug sits in the pocket instead, so nothing else can.',
        molecularDetail:
          'The benzamidine inserts into the S1 specificity pocket and forms a salt bridge with aspartate 189, the residue that normally holds the arginine of fibrinogen. Binding is reversible and competitive, and it inhibits free thrombin as well as thrombin already bound within a clot — the latter being something heparin cannot do, because heparin works through antithrombin and cannot reach clot-bound thrombin.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fibrinogen is never cut, so the mesh is never built',
        laymanDesc:
          'Without thrombin doing its cutting, the soluble protein that would become the clot scaffold stays soluble. Platelets can still gather, but nothing sets.',
        molecularDetail:
          'Blocking thrombin prevents cleavage of fibrinogen to fibrin monomer, prevents activation of factor XIII that would cross-link the mesh, and removes thrombin’s own feedback amplification of factors V, VIII and XI. It also blunts thrombin-mediated platelet activation through PAR-1.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer strokes, and bleeding moved from the brain to the gut',
        laymanDesc:
          'Over two years, fewer clots reached the brain. The bleeding that a blood thinner always causes shifted: much less inside the skull, somewhat more in the stomach and bowel.',
        molecularDetail:
          'In RE-LY, stroke or systemic embolism 1.11% per year at 150 mg against 1.69% on warfarin; haemorrhagic stroke 0.10% against 0.38%; major bleeding 3.11% against 3.36% (not significant). In 134,414 Medicare patients, intracranial haemorrhage hazard ratio 0.34 and major gastrointestinal bleeding 1.28. Roughly 80% of absorbed active drug is renally cleared, so falling kidney function raises exposure and raises bleeding.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'RE-LY (NCT00262600)',
        phase: 'Phase 3 randomised trial, partially blinded, median 2.0 years',
        sampleSize: 18113,
        primaryEndpoint:
          'Stroke or systemic embolism, dabigatran 110 mg or 150 mg twice daily versus adjusted-dose warfarin',
        endpointMet: true,
        statisticalPValue:
          '150 mg: 1.11% vs 1.69% per year, RR 0.66 (95% CI 0.53 to 0.82), p<0.001 for superiority. 110 mg: 1.53% per year, RR 0.91 (0.74 to 1.11), p<0.001 for non-inferiority',
        unreportedAdverseSignals:
          'Major bleeding was not reduced at 150 mg (3.11% vs 3.36% per year, p=0.31). The warfarin arm was unblinded. Additional previously unidentified events were reported in a letter to the New England Journal of Medicine a year after publication.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'RE-ALIGN (NCT01452347)',
        phase: 'Phase 2 dose-validation randomised trial, terminated early',
        sampleSize: 252,
        primaryEndpoint:
          'Trough plasma dabigatran concentration in patients with mechanical aortic or mitral valves, with clinical events observed',
        endpointMet: false,
        statisticalPValue:
          'Terminated for excess events: ischaemic or unspecified stroke in 9 of 162 dabigatran patients (5%) versus 0 of 90 on warfarin; major bleeding 4% versus 2%, all pericardial',
        unreportedAdverseSignals:
          'Dose adjustment or discontinuation was required in 32% of dabigatran patients despite a protocol that targeted a measured plasma level.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'RE-VERSE AD (NCT02104947)',
        phase: 'Phase 3 prospective open-label single-arm cohort study',
        sampleSize: 503,
        primaryEndpoint:
          'Maximum percentage reversal of anticoagulant effect within four hours of idarucizumab, by dilute thrombin time or ecarin clotting time',
        endpointMet: true,
        statisticalPValue: 'Median maximum reversal 100% (95% CI 100 to 100)',
        unreportedAdverseSignals:
          'Single-arm with no control. Ninety-day mortality was 18.8% and 18.9% in the two groups, which describes the severity of the population rather than the effect of the antidote.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'FDA Medicare cohort (Graham et al., Circulation 2015)',
        phase: 'Propensity-matched new-user observational cohort, 37,587 person-years',
        sampleSize: 134414,
        primaryEndpoint:
          'Ischaemic stroke, intracranial haemorrhage, major gastrointestinal bleeding, myocardial infarction and death, dabigatran versus warfarin in routine care',
        endpointMet: true,
        statisticalPValue:
          'Ischaemic stroke HR 0.80 (0.67-0.96); intracranial haemorrhage 0.34 (0.26-0.46); major gastrointestinal bleeding 1.28 (1.14-1.44); myocardial infarction 0.92 (0.78-1.08); death 0.86 (0.77-0.96)',
        unreportedAdverseSignals:
          'Observational. Most patients on the 75 mg twice-daily strength did not appear to have the severe renal impairment that strength was intended for, which is a prescribing finding rather than a drug finding.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Stroke or systemic embolism 1.11% per year at 150 mg twice daily against 1.69% on warfarin, RR 0.66 (0.53-0.82), in 18,113 randomised patients',
        'Haemorrhagic stroke 0.10% per year against 0.38% on warfarin, reproduced as an intracranial haemorrhage hazard ratio of 0.34 in 134,414 Medicare patients',
        'Major gastrointestinal bleeding hazard ratio 1.28 (1.14-1.44) against warfarin in routine care',
        'Median 100% reversal of the anticoagulant effect within four hours of idarucizumab in 503 patients',
      ],
      unsupportedInferences: [
        'That dabigatran reduces mortality — the RE-LY mortality difference reached p=0.051 at 150 mg and p=0.13 at 110 mg, and neither crossed significance',
        'That fixed dosing without plasma-level measurement is optimal — a convenience claim whose supporting analyses were reported by the BMJ as undisclosed',
        'That dabigatran is better or worse than apixaban or rivaroxaban — no randomised head-to-head trial exists between any pair of the direct oral anticoagulants',
        'That reversing the coagulation assay with idarucizumab improves survival — RE-VERSE AD was single-arm and measured a laboratory parameter',
      ],
      whatFailedInitially: [
        'Major bleeding was not reduced at the approved 150 mg dose (3.11% vs 3.36% per year, p=0.31); only the weaker 110 mg dose reduced it',
        'RE-ALIGN was terminated early for excess thromboembolic and bleeding events in mechanical heart valves, and mechanical valves are now a contraindication',
        'The RE-LY dataset was corrected after publication when previously unidentified events were reported, and the myocardial infarction odds ratio moved with it',
        'Ximelagatran, the earlier oral direct thrombin inhibitor from the same pharmacological idea, was withdrawn for hepatotoxicity before dabigatran reached the market',
      ],
      realWorldOutcome: [
        'The first oral alternative to warfarin approved in the United States in more than fifty years, in October 2010 under NDA 022512',
        'Now off patent: US$0.8430 per capsule at United States pharmacy acquisition cost',
        'Idarucizumab, approved in 2015, made dabigatran the first direct oral anticoagulant with a specific antidote',
        'Contraindicated in mechanical heart valves, which is a label change written directly out of a failed trial',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule containing acid-core pellets, taken twice daily',
      description:
        'The capsule shell holds pellets whose cores are tartaric acid, because the drug dissolves only in an acidic microenvironment. Opening, chewing or crushing the capsule raises absorption substantially and is specifically warned against on the label. Bottles carry a use-by period after opening because the pellets are moisture-sensitive.',
      safetyProfile:
        'The US label carries two boxed warnings: premature discontinuation increases the risk of thrombotic events, and spinal or epidural haematoma can occur in patients receiving neuraxial anaesthesia or spinal puncture. Approximately 80% of absorbed active drug is cleared by the kidneys, so renal impairment raises exposure and bleeding risk. Dyspepsia and gastritis-like symptoms are common and are the main reason people stop. Contraindicated with mechanical prosthetic heart valves. Idarucizumab is the specific reversal agent.',
    },
    commonQuestions: [
      {
        q: 'Is dabigatran safer than warfarin?',
        a: 'It depends entirely on which bleed you are asking about, and the answer at the approved dose is genuinely mixed. In RE-LY, overall major bleeding on dabigatran 150 mg was 3.11% per year against 3.36% on warfarin, a difference that was not statistically significant. What did change is where the bleeding happened: haemorrhagic stroke fell from 0.38% to 0.10% per year, and in the FDA’s 134,414-patient Medicare study major gastrointestinal bleeding rose by 28%. So the honest summary is that dabigatran trades a large reduction in the most catastrophic bleed for a moderate increase in the most survivable one, while preventing more strokes. That is a good trade for most people and it is still a trade.',
        auditNote:
          'The lower 110 mg dose did reduce overall major bleeding (p=0.003) but did not demonstrate superiority for stroke prevention. The two benefits sit at different doses.',
      },
      {
        q: 'Why can I not take this if I have an artificial heart valve?',
        a: 'Because it was tested and it failed. RE-ALIGN randomised 252 people with mechanical aortic or mitral valves to dabigatran or warfarin, targeting a measured plasma level rather than a fixed dose. The trial was stopped early because the dabigatran group had both more clotting and more bleeding: nine ischaemic or unspecified strokes against none on warfarin, and seven major bleeds against two, all of them into the pericardium. Mechanical valve surfaces activate clotting through a route where thrombin inhibition alone does not appear to be enough, and warfarin remains the only anticoagulant with outcome evidence in that setting. This is one of the cleanest examples in modern cardiology of a drug that works in one clotting problem and fails in another.',
      },
      {
        q: 'Does it need blood tests like warfarin does?',
        a: 'Not routinely, and that was the selling point. It is worth understanding what that means rather than only that it is true. Dabigatran plasma levels vary several-fold between people, and about 80% of the absorbed active drug leaves through the kidneys, so someone whose kidney function declines will accumulate the drug without anything visible changing. The routine INR does not read dabigatran usefully; the assays that do — the dilute thrombin time and the ecarin clotting time — are not what most laboratories run by default. Two BMJ investigations in 2014 reported that analyses relating plasma concentration to bleeding risk had not been made available to regulators. Kidney function is checked periodically for exactly this reason.',
        auditNote:
          'This is the largest open question on the page: whether the convenience of fixed dosing was ever compared, in public, against the bleeding it might have prevented.',
      },
      {
        q: 'Does it cause heart attacks?',
        a: 'The signal exists, it shrank, and it did not survive contact with routine practice. The original RE-LY publication showed slightly more myocardial infarction on dabigatran than warfarin. A 2012 meta-analysis of seven trials totalling 30,514 patients found myocardial infarction or acute coronary syndrome in 1.19% of dabigatran patients against 0.79% of controls, odds ratio 1.33 (p=0.03). Using the revised RE-LY figures published after additional events were identified, the same analysis gave 1.27 (p=0.05). Then the FDA’s Medicare cohort of 134,414 people found a hazard ratio of 0.92 (0.78 to 1.08) — no excess. One reasonable reading is that warfarin actively protects against myocardial infarction and dabigatran simply does not, rather than dabigatran causing them.',
      },
      {
        q: 'What happens if I bleed badly while taking it?',
        a: 'There is a specific antidote, which is unusual and was the drug’s clearest advantage for several years. Idarucizumab is an antibody fragment engineered to bind dabigatran far more tightly than thrombin does, and it was approved in 2015. In RE-VERSE AD, 503 patients — 301 with uncontrolled bleeding and 202 needing urgent surgery — received 5 g intravenously, and the median maximum reversal of the anticoagulant effect within four hours was 100%. What that trial measured was a coagulation assay, not survival: it had no control arm, and ninety-day mortality in both groups was around 19%, which reflects how ill people who bleed on anticoagulants are. The laboratory effect is measured; the survival benefit is inferred.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Connolly SJ et al. Dabigatran versus warfarin in patients with atrial fibrillation (RE-LY). N Engl J Med 2009;361:1139-1151',
        identifier: '10.1056/NEJMoa0905561',
        kind: 'doi',
      },
      {
        label:
          'Connolly SJ et al. Newly identified events in the RE-LY trial. N Engl J Med 2010;363:1875-1876',
        identifier: '10.1056/NEJMc1007378',
        kind: 'doi',
      },
      {
        label:
          'Eikelboom JW et al. Dabigatran versus warfarin in patients with mechanical heart valves (RE-ALIGN). N Engl J Med 2013;369:1206-1214',
        identifier: '10.1056/NEJMoa1300615',
        kind: 'doi',
      },
      {
        label:
          'Uchino K, Hernandez AV. Dabigatran association with higher risk of acute coronary events: meta-analysis of noninferiority randomized controlled trials. Arch Intern Med 2012;172:397-402',
        identifier: '10.1001/archinternmed.2011.1666',
        kind: 'doi',
      },
      {
        label:
          'Graham DJ et al. Cardiovascular, bleeding, and mortality risks in elderly Medicare patients treated with dabigatran or warfarin for nonvalvular atrial fibrillation. Circulation 2015;131:157-164',
        identifier: '10.1161/CIRCULATIONAHA.114.012061',
        kind: 'doi',
      },
      {
        label:
          'Pollack CV et al. Idarucizumab for Dabigatran Reversal — Full Cohort Analysis (RE-VERSE AD). N Engl J Med 2017;377:431-441',
        identifier: '10.1056/NEJMoa1707278',
        kind: 'doi',
      },
      {
        label:
          'Cohen D. Dabigatran: how the drug company withheld important analyses. BMJ 2014;349:g4670',
        identifier: '10.1136/bmj.g4670',
        kind: 'doi',
      },
      {
        label: 'Concerns over data in key dabigatran trial. BMJ 2014;349:g4747',
        identifier: '10.1136/bmj.g4747',
        kind: 'doi',
      },
      {
        label: 'RE-LY trial registration record',
        identifier: 'NCT00262600',
        kind: 'nct',
      },
      {
        label: 'RE-ALIGN trial registration record',
        identifier: 'NCT01452347',
        kind: 'nct',
      },
      {
        label: 'Drugs@FDA: PRADAXA (dabigatran etexilate mesylate), NDA 022512',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022512',
        kind: 'regulatory',
      },
      {
        label:
          'PubChem CID 135565674 — dabigatran etexilate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135565674',
        kind: 'url',
      },
      COST_OF_PRODUCTION_SOURCE,
      NADAC_SOURCE,
    ],
  },
]
