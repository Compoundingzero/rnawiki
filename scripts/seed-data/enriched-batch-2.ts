import type { SeedDossier } from '@/lib/seed-types'

/**
 * Editorial layer over the machine-enriched antiretroviral records: the verdict, the mechanism
 * carousel and the audits, which no pipeline can produce.
 *
 * This is the HIV group — the twelve molecules that carry combination antiretroviral therapy, plus
 * the two of them (lamivudine, tenofovir) that also carry hepatitis B. They are unusual in this
 * repository in that the surrogate endpoint is not in dispute: plasma HIV-1 RNA below 50 copies per
 * millilitre predicts survival and predicts non-transmission, and that link was established by
 * trials with clinical endpoints before it became the endpoint everything else is measured on. So
 * the audits here are rarely about whether the surrogate counts. They are about the things the
 * registration trials did not measure: bone and kidney surrogates standing in for fractures and
 * dialysis, weight gain that no phase 3 programme was powered to see, a birth-defect signal that
 * appeared and then vanished under its own follow-up, and adherence assumptions that made two large
 * prevention trials report no effect at all.
 *
 * Conventions for the whole group.
 *
 * 1. EVERY NUMBER IS COPIED FROM THE ABSTRACT OR THE LABEL. Percentages, arm sizes, hazard ratios,
 *    confidence intervals and p-values below were read from the published abstract at the DOI or
 *    PMID given, or from the ClinicalTrials.gov v2 API record for the NCT id given, at the time of
 *    writing. Nothing is recalled.
 *
 * 2. NO SYNTHESIS COST IS STATED. `SeedPricing.synthesisCostPerDose` requires a published
 *    cost-of-production figure. The literature that would supply one for antiretrovirals — Hill,
 *    Barber and Gotham in BMJ Global Health — reports its per-drug figures in a supplementary
 *    appendix that could not be checked line by line here, so the field is empty on every dossier
 *    and `markupEstimate` is empty with it. What is stated is the United States pharmacy
 *    acquisition cost from the CMS NADAC file, which is a price and not a cost of manufacture, and
 *    which the enrichment pipeline had already attached to these records.
 *
 * 3. NO DOSING, SWITCHING OR PROCUREMENT GUIDANCE. Milligram strengths appear only where they are
 *    part of a trial's identity — ENCORE1's 400 mg efavirenz arm, raltegravir's 800 mg once-daily
 *    arm — because in those trials the strength is the intervention being tested. Nothing here
 *    tells a reader what to take, when to switch, or where to buy.
 *
 * 4. THE SMILES STRINGS ARE THE STORED PUBCHEM ONES. Each was already accepted by this
 *    repository's connection-table parser during enrichment and is copied unchanged.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) file — United States pharmacy acquisition cost, the price pharmacies pay to buy the drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill AM, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — consulted for a per-dose cost of production; the per-drug figures sit in a supplementary appendix that could not be verified line by line, so no synthesis cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_2_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Dolutegravir — the integrase inhibitor that became the world's first-line HIV drug, and the
  //    one whose safety signal appeared, frightened a continent, and then dissolved.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'dolutegravir',
    name: 'Dolutegravir',
    tradeName: 'Tivicay / Tivicay PD',
    sponsor: 'ViiV Healthcare (GlaxoSmithKline, Pfizer and Shionogi joint venture)',
    targetGene: 'HIV-1 pol, integrase coding region',
    targetProtein:
      'HIV-1 integrase, blocked at the strand-transfer step by chelation of the two catalytic magnesium ions in the intasome active site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2013,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults (treatment-naive or treatment-experienced) and in paediatric patients aged at least 4 weeks and weighing at least 3 kg who are integrase-inhibitor-naive',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite: 'HIV-1 intasome, in the cytoplasm and nucleus of infected CD4-positive T cells',
    conditionContext: {
      conditionExplainer:
        'HIV-1 copies its RNA genome into DNA and then splices that DNA into a chromosome of the cell it has infected. Once integrated, the provirus is permanent: the cell carries it for life and every daughter cell inherits it. Treatment does not remove integrated virus. It stops new cells being infected, so the pool of infected cells stops being replenished.',
      whyItMatters:
        'Untreated HIV-1 destroys CD4-positive T cells until the immune system cannot control ordinary organisms, which is what AIDS is. Suppressed HIV-1 does neither of those things, and a person with a plasma viral load kept below 200 copies per millilitre does not transmit the virus sexually. Both of those are outcomes measured in trials, not inferences from the viral load number.',
      whoTakesThis:
        'Recommended first-line antiretroviral therapy in the World Health Organization guidelines and in the United States Department of Health and Human Services guidelines, and the integrase inhibitor in the fixed-dose combination with tenofovir and lamivudine that most of the world now takes.',
      clinicalGoals:
        'Drive plasma HIV-1 RNA below 50 copies per millilitre and keep it there, without selecting resistance mutations that would close off other drugs.',
    },
    oneSentenceVerdict:
      'An integrase strand-transfer inhibitor that jams the enzyme HIV uses to paste itself into human DNA; it suppressed virus in 88% of untreated patients at 48 weeks against 81% on the previous standard in SINGLE, and it has never selected resistance in a treatment-naive trial, which is why it became first-line almost everywhere.',
    laymanHowItWorks:
      'HIV cannot survive as a free-floating copy inside a cell. It has to cut into your DNA and paste itself in, and it does that with one enzyme called integrase. Dolutegravir sits in the working part of that enzyme and grabs the two magnesium atoms it needs to make the cut, so the paste step never happens. The viral DNA drifts, gets circularised, and is lost. It does nothing to virus already integrated from before, which is why the drug is taken for life rather than as a course.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$105.03 per tablet at United States pharmacy acquisition cost, median across four listed brand products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'ViiV Healthcare holds the composition-of-matter patents and licensed dolutegravir to the Medicines Patent Pool for paediatric and then adult use in low-income and most lower-middle-income countries, which is why generic tenofovir-lamivudine-dolutegravir is manufactured in India and sold across sub-Saharan Africa while the branded tablet in the United States costs what the NADAC line above says. The same molecule, two prices, one licence boundary.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Nothing in the HIV pharmacopoeia substitutes for a third agent with a high genetic barrier, and dolutegravir is the cheapest of the two that have one. Bictegravir is the direct competitor and is only sold inside a fixed-dose combination. Efavirenz is what dolutegravir displaced, and the trials that displaced it are the reason.',
      conventionalRx: [
        {
          name: 'Bictegravir (only in Biktarvy, with emtricitabine and tenofovir alafenamide)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'The same mechanism and a comparable resistance barrier. It is not sold as a single agent, so it cannot be combined with anything other than the two drugs it is co-formulated with.',
          typicalCost:
            'Not listed separately in the CMS NADAC file; the single-agent product does not exist',
          prosAndCons:
            'Pros: one tablet, no food requirement, no clinically relevant interaction with metformin. Cons: no generic anywhere, and no flexibility when a component has to be changed.',
        },
        {
          name: 'Efavirenz (generic)',
          class: 'Non-nucleoside reverse transcriptase inhibitor',
          howItCompares:
            'The comparator dolutegravir beat in SINGLE, where 88% of the dolutegravir arm reached HIV-1 RNA below 50 copies per millilitre against 81% on efavirenz-tenofovir-emtricitabine, and where 10% of the efavirenz arm stopped for adverse events against 2% on dolutegravir. In NAMSAL, run in Cameroon against a reduced 400 mg efavirenz dose, the gap narrowed to 74.5% against 69.0%.',
          typicalCost:
            'US$1.35 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: decades of use, cheap, extensive pregnancy data. Cons: central nervous system effects in the first weeks, a lower genetic barrier, and dependence on CYP2B6 genotype for exposure.',
        },
        {
          name: 'Raltegravir (Isentress)',
          class: 'Integrase strand-transfer inhibitor, first generation',
          howItCompares:
            'Directly compared in SAILING in treatment-experienced patients: 71% of the dolutegravir arm reached HIV-1 RNA below 50 copies per millilitre against 64% on raltegravir, and treatment-emergent integrase resistance appeared in four dolutegravir patients against seventeen on raltegravir.',
          typicalCost:
            'US$34.54 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: the longest safety record of any integrase inhibitor, minimal drug interactions. Cons: lower genetic barrier, and the standard formulation is twice daily.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@@H]1CCO[C@@H]2N1C(=O)C3=C(C(=O)C(=CN3C2)C(=O)NCC4=C(C=C(C=C4)F)F)O',
      chemicalFormula: 'C20H19F2N3O5',
      molecularWeight: '419.40 g/mol (free acid); dispensed as dolutegravir sodium',
      targetReceptorAffinity:
        'Binds the intasome rather than a receptor. The pharmacophore is a three-oxygen chelating triad on the carbamoyl pyridone core that co-ordinates both catalytic magnesium ions, with the 2,4-difluorobenzyl group occupying the pocket vacated by the displaced 3-prime adenosine of viral DNA. The slow dissociation from the intasome, measured in hours rather than minutes, is the property that separates the second-generation integrase inhibitors from raltegravir.',
      structureSource: {
        label: 'PubChem CID 54726191 (dolutegravir) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54726191',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dtg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of 2,4-difluorobenzylamine and the chiral aminoalcohol',
          description:
            'Assay identity, water content and enantiomeric purity of the two fragments that set the molecule apart from its analogues. The (R)-3-aminobutan-1-ol fixes the single stereocentre that defines dolutegravir against its diastereomers, and enantiomeric impurity carried in at this stage cannot be removed downstream by crystallisation alone.',
          reagentsAndBuffer:
            '2,4-difluorobenzylamine reference standard, (R)-3-aminobutan-1-ol, chiral HPLC on an amylose-derived stationary phase, Karl Fischer titration, gas chromatography with flame ionisation for residual solvents',
        },
        {
          id: 'dtg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bicyclic carbamoyl pyridone construction and amide coupling',
          description:
            'Condense the protected 3-methoxy-4-oxo-pyridine dicarboxylate with the aminoalcohol so the oxazinane ring closes onto the pyridinone, then couple the free carboxylate to 2,4-difluorobenzylamine. The methyl ether on the future chelating hydroxyl stays in place through both steps; unmasking it early lets the intermediate sequester metal ions and stall the coupling.',
          dependsOnStepId: 'dtg-w1',
          reagentsAndBuffer:
            'Methyl 3-methoxy-4-oxo-pyridine-2,5-dicarboxylate, (R)-3-aminobutan-1-ol, acetonitrile with methanesulfonic acid, then 2,4-difluorobenzylamine with a carbodiimide or CDI activation under nitrogen',
        },
        {
          id: 'dtg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Demethylation, crystallisation and sodium salt formation',
          description:
            'Strip the methyl ether with magnesium bromide or lithium bromide to reveal the hydroxyl that completes the metal-chelating triad, then crystallise and convert to the sodium salt that is the marketed form. Related-substance control at this point is what the pharmacopoeial monograph is written around, because the demethylation is the step that generates the regioisomeric by-products.',
          dependsOnStepId: 'dtg-w2',
          reagentsAndBuffer:
            'Magnesium bromide in tetrahydrofuran or lithium bromide in acetonitrile, aqueous sodium hydroxide for salt formation, ethanol and water for recrystallisation, reversed-phase HPLC with UV detection for related substances',
        },
        {
          id: 'dtg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Single-round infection of MT-4 cells and PBMCs',
          description:
            'Infect MT-4 lymphoblastoid cells and, separately, primary peripheral blood mononuclear cells with a pseudotyped HIV-1 reporter virus in the presence of graded drug concentrations. Both are needed: a cell line gives a clean EC50, primary cells give a number that includes the protein binding and uptake the line does not model.',
          dependsOnStepId: 'dtg-w3',
          reagentsAndBuffer:
            'MT-4 cells and Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, VSV-G pseudotyped HIV-1 NL4-3 luciferase reporter virus, 50% human serum arm for protein-binding-adjusted potency',
        },
        {
          id: 'dtg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Strand-transfer inhibition and intasome dissociation half-life',
          description:
            'Measure inhibition of concerted strand transfer with recombinant integrase on a donor-target DNA pair, and then measure how long the drug stays bound once the intasome has formed. The second number is the one that predicts the resistance barrier: it is the difference between raltegravir and dolutegravir and it does not show up in an EC50.',
          dependsOnStepId: 'dtg-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 integrase, biotinylated donor and target oligonucleotide duplexes, magnesium chloride assay buffer, streptavidin-coated plates with europium detection, radiolabelled drug for the dissociation time course',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dtg-a1',
        category: 'measured',
        title: 'SINGLE: 88% suppressed at 48 weeks against 81% on the standard of its day',
        laymanSummary:
          'In 833 people who had never been treated for HIV, dolutegravir plus abacavir and lamivudine suppressed the virus in 88% at 48 weeks, against 81% for the then-standard three-drug tablet. Nobody in the dolutegravir arm developed resistance.',
        technicalDetails:
          'SINGLE (NCT01263015) randomised 844 treatment-naive adults, of whom 833 received at least one dose, to dolutegravir 50 mg once daily with abacavir-lamivudine or to fixed-dose efavirenz-tenofovir disoproxil-emtricitabine. At week 48, 88% of the dolutegravir group had HIV-1 RNA below 50 copies per millilitre against 81% of the comparator group (P=0.003). Median time to suppression was 28 days against 84 days (P<0.001) and the mean CD4 increase was 267 against 208 cells per cubic millimetre (P<0.001). Discontinuation for adverse events was 2% against 10%. No participant in the dolutegravir group had detectable antiviral resistance; in the comparator group one tenofovir-associated and four efavirenz-associated mutations were detected.',
        evidenceSource: 'Walmsley SL et al., N Engl J Med 2013;369:1807-1818 (SINGLE, NCT01263015)',
        doi: '10.1056/NEJMoa1215541',
        measuredMetric:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48, FDA snapshot algorithm',
        auditFlag: 'verified',
      },
      {
        id: 'dtg-a2',
        category: 'measured',
        title: 'SAILING: superior to raltegravir, with a quarter of the emergent resistance',
        laymanSummary:
          'Head to head against the first integrase inhibitor in 715 treatment-experienced patients, dolutegravir suppressed more people and, more importantly, far fewer of the failures carried a new integrase mutation.',
        technicalDetails:
          'SAILING (NCT01231516) randomised 715 antiretroviral-experienced, integrase-inhibitor-naive adults to dolutegravir 50 mg once daily or raltegravir 400 mg twice daily with investigator-selected background therapy. At week 48, 251 of the dolutegravir patients (71%) had HIV-1 RNA below 50 copies per millilitre against 230 of the raltegravir patients (64%), adjusted difference 7.4% (95% CI 0.7 to 14.2), and superiority was concluded (p=0.03). Virological failure with treatment-emergent integrase-inhibitor resistance occurred in four dolutegravir patients against seventeen on raltegravir, adjusted difference -3.7% (95% CI -6.1 to -1.2, p=0.003).',
        evidenceSource: 'Cahn P et al., Lancet 2013;382:700-708 (SAILING, NCT01231516)',
        doi: '10.1016/S0140-6736(13)61221-0',
        measuredMetric:
          'Virological suppression at week 48 and the count of failures carrying treatment-emergent integrase resistance',
        auditFlag: 'verified',
      },
      {
        id: 'dtg-a3',
        category: 'conclusion_shift',
        title:
          'The neural-tube defect signal: 0.94% in 2018, 0.30% in 2019, indistinguishable from background by 2025',
        laymanSummary:
          'In 2018 a birth-outcome survey in Botswana reported four neural-tube defects among 426 babies conceived on dolutegravir, a rate roughly eight times the usual one. It changed guidelines across Africa overnight. As the same study kept counting, the rate fell to 0.30%, then to 0.10%, against 0.11% for every other regimen. The signal was real as a measurement and wrong as a conclusion.',
        technicalDetails:
          'Zash and colleagues reported the preliminary Tsepamo signal in a 2018 correspondence to the New England Journal of Medicine: four neural-tube defects among 426 deliveries to women on dolutegravir from conception, a prevalence of 0.94% against 0.12% in non-dolutegravir exposures. The 2019 full report covered 119,033 deliveries and found five defects among 1,683 dolutegravir-at-conception deliveries (0.30%) against fifteen among 14,792 non-dolutegravir-at-conception deliveries (0.10%), a difference of 0.20 percentage points (95% CI 0.01 to 0.59); efavirenz at conception was 0.04% and HIV-uninfected mothers 0.08%. A 2025 retrospective in AIDS reports the updated Tsepamo estimates as 0.10% for dolutegravir and 0.11% for non-dolutegravir exposures, and states that the early finding had been statistically compatible with a wide range of effect sizes including no difference.',
        evidenceSource:
          'Zash R et al., N Engl J Med 2018;379:979-981; Zash R et al., N Engl J Med 2019;381:827-840; Tsepamo retrospective, AIDS 2025',
        doi: '10.1056/NEJMoa1905230',
        inferredClaim:
          'That dolutegravir at conception raises the risk of neural-tube defects — an inference from four events in a first-look surveillance dataset that its own continued follow-up did not sustain',
        auditFlag: 'contested',
      },
      {
        id: 'dtg-a4',
        category: 'inferred',
        title:
          'Weight gain on dolutegravir is measured; that it causes metabolic disease is not measured',
        laymanSummary:
          'People starting dolutegravir gain more weight than people starting the drugs it replaced, and the trials show that clearly. Whether that weight translates into diabetes, heart attacks or strokes has not been tested, because no antiretroviral trial has ever been powered for those outcomes.',
        technicalDetails:
          'ADVANCE (NCT03122262), a 1,053-patient investigator-led trial in South Africa, found mean weight increases at week 48 of 6.4 kg on dolutegravir with emtricitabine and tenofovir alafenamide, 3.2 kg on dolutegravir with emtricitabine and tenofovir disoproxil, and 1.7 kg on standard-care efavirenz-tenofovir disoproxil-emtricitabine, while virological outcomes were noninferior at 84%, 85% and 79%. NAMSAL reported the same direction in Cameroon and, by week 192, mean gains of 9.4 kg on dolutegravir against 5.9 kg on low-dose efavirenz. A North American cohort found 6.0 kg gained at 18 months on dolutegravir against 2.6 kg on non-nucleoside regimens (P<0.05). A prespecified secondary analysis of ADVANCE then found that blood-pressure rises tracked change in BMI rather than the regimen or kidney function, with the largest 96-week systolic increase 1.7 mmHg. So the weight is measured and its proximate consequence on blood pressure is measured; the cardiovascular endpoint that would matter is not.',
        evidenceSource:
          'Venter WDF et al., N Engl J Med 2019;381:803-815 (ADVANCE, NCT03122262); Bourgi K et al., Clin Infect Dis 2020;70:1267-1274; Manne-Goehler J et al., J Int AIDS Soc 2024;27:e26268',
        doi: '10.1056/NEJMoa1902824',
        inferredClaim:
          'That the weight gained on dolutegravir-based therapy causes cardiovascular or metabolic disease — plausible, mechanistically coherent, and untested by any powered endpoint',
        auditFlag: 'caution',
      },
      {
        id: 'dtg-a5',
        category: 'measured',
        title:
          'No treatment-emergent integrase resistance in any treatment-naive registration trial',
        laymanSummary:
          'Across the trials that got dolutegravir approved for people starting treatment for the first time, not one person who failed on it developed a mutation that made integrase inhibitors stop working. That is rare and it is the reason the drug is used the way it is.',
        technicalDetails:
          'In SPRING-2 (NCT01227824), 822 treatment-naive adults were randomised to dolutegravir once daily or raltegravir twice daily; 361 dolutegravir patients (88%) and 351 raltegravir patients (85%) reached HIV-1 RNA below 50 copies per millilitre at week 48, adjusted difference 2.5% (95% CI -2.2 to 7.1). No treatment-emergent resistance was seen in dolutegravir patients with virological failure, whereas one raltegravir failure carried treatment-emergent integrase resistance. SINGLE reported the same absence of resistance in its dolutegravir arm, and ADVANCE reported no integrase-inhibitor resistance across 1,053 patients. The property behind this is kinetic rather than thermodynamic: dolutegravir dissociates from the intasome slowly enough that a mutant with reduced binding still loses more replicative fitness than it gains.',
        evidenceSource:
          'Raffi F et al., Lancet 2013;381:735-743 (SPRING-2, NCT01227824); Walmsley SL et al., N Engl J Med 2013;369:1807-1818',
        doi: '10.1016/S0140-6736(12)61853-4',
        measuredMetric:
          'Count of virological failures carrying treatment-emergent integrase-inhibitor resistance mutations',
        auditFlag: 'verified',
      },
      {
        id: 'dtg-a6',
        category: 'inferred',
        title:
          'The resistance barrier is a naive-population finding read across to experienced ones',
        laymanSummary:
          'Dolutegravir almost never fails with resistance in people starting treatment for the first time. In people who already carry integrase mutations from an earlier drug, it does fail with resistance, and the two situations get spoken about as though they were one.',
        technicalDetails:
          'The FDA-approved label restricts the paediatric indication to integrase-inhibitor-naive patients, and SAILING enrolled only integrase-inhibitor-naive adults; its four treatment-emergent resistance cases arose in that population. Salvage use in patients with pre-existing raltegravir or elvitegravir resistance is a separate clinical situation with a separate dosing schedule and a materially different failure rate, and the trials that studied it were single-arm. The general claim that dolutegravir has a high genetic barrier is well supported where it was measured. Extending it to a patient who already carries Q148 plus secondary mutations is an inference the registration programme did not test.',
        evidenceSource:
          'TIVICAY (dolutegravir) prescribing information, NDA 204790, Drugs@FDA; Cahn P et al., Lancet 2013;382:700-708',
        doi: '10.1016/S0140-6736(13)61221-0',
        inferredClaim:
          'That dolutegravir has the same resistance barrier in integrase-experienced patients that it demonstrated in integrase-naive ones',
        auditFlag: 'caution',
      },
      {
        id: 'dtg-a7',
        category: 'measured',
        title: 'NAMSAL: the margin over efavirenz narrows when efavirenz is dosed properly',
        laymanSummary:
          'A trial in Cameroon compared dolutegravir with a lower 400 mg dose of efavirenz rather than the usual 600 mg. Dolutegravir still won, but by five points rather than the seven points seen against the older regimen, and the efavirenz arm gained less weight.',
        technicalDetails:
          'NAMSAL ANRS 12313 (NCT02777229) randomised 613 evaluable treatment-naive adults in Yaounde to dolutegravir or efavirenz 400 mg, each with tenofovir disoproxil and lamivudine. At week 48, 231 of 310 in the dolutegravir group (74.5%) and 209 of 303 in the efavirenz 400 group (69.0%) had a viral load below 50 copies per millilitre, meeting noninferiority. Virological failure occurred in 3 dolutegravir recipients against 16 efavirenz recipients. By week 192 suppression was 69% against 62%, with mean weight gains of 9.4 kg against 5.9 kg.',
        evidenceSource:
          'NAMSAL ANRS 12313 Study Group, N Engl J Med 2019;381:816-826 (NCT02777229); Mpoudi-Etame M et al., Open Forum Infect Dis 2023;10:ofad582',
        doi: '10.1056/NEJMoa1904340',
        measuredMetric:
          'Proportion below 50 copies per millilitre at weeks 48 and 192, and mean weight change',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, and it does not need a booster',
        laymanDesc:
          'A single tablet, taken once daily, with or without food. Unlike the protease inhibitors it competes with, it does not need a second drug added purely to slow down its own breakdown.',
        molecularDetail:
          'Absolute bioavailability has not been established; the terminal half-life is roughly 14 hours and clearance is 1.0 L/h. Metabolism is principally UGT1A1 glucuronidation with a minor CYP3A contribution, so no pharmacokinetic booster is required, and the interaction profile is dominated by UGT and CYP3A inducers such as rifampicin rather than by the CYP3A inhibition that defines ritonavir-boosted regimens.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It waits inside the cell for the virus to arrive',
        laymanDesc:
          'The drug crosses into cells on its own and simply sits there. It has no job until a virus enters that cell, copies its genome into DNA and assembles the machine that will paste it in.',
        molecularDetail:
          'Dolutegravir is passively permeable and distributes into CD4-positive T cells without a transporter. It is not a prodrug and requires no intracellular activation, which distinguishes it sharply from the nucleoside analogues it is co-formulated with, all of which must be phosphorylated three times before they do anything.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grabs the two magnesium atoms the cutting enzyme needs',
        laymanDesc:
          'Integrase works by holding two magnesium atoms in its active site and using them to make a chemical cut. Dolutegravir clamps onto both of them, so the enzyme is holding the drug instead of the DNA.',
        molecularDetail:
          'The carbamoyl pyridone core presents a coplanar triad of oxygen atoms that chelates both catalytic Mg2+ ions in the integrase active site of the intasome, the nucleoprotein complex of integrase tetramer bound to viral DNA ends. Binding requires the intasome to have already formed; the drug has negligible affinity for free integrase.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The 3-prime end of the viral DNA is displaced and cannot attack',
        laymanDesc:
          'With the drug in the way, the prepared end of the viral DNA is pushed out of position. The paste reaction needs that end lined up precisely; it never gets the chance.',
        molecularDetail:
          'Strand transfer is blocked specifically: 3-prime processing, the earlier step in which integrase removes a GT dinucleotide from each viral DNA end, still occurs. The 2,4-difluorobenzyl group occupies the pocket the displaced 3-prime adenosine would fill and stacks against the penultimate cytosine, which is why resistance mutations at Q148, G140 and R263 act by distorting that pocket rather than by blocking the chelating triad.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The viral DNA is never inserted, and the infection stops spreading',
        laymanDesc:
          'Unintegrated viral DNA gets circularised and eventually degraded. The cell survives, no provirus is made, and within weeks plasma virus falls below the level a test can detect.',
        molecularDetail:
          'Unintegrated linear viral DNA is converted to 1-LTR and 2-LTR circles and lost through cell division. In SINGLE the median time to plasma HIV-1 RNA below 50 copies per millilitre was 28 days. The pre-existing reservoir of integrated provirus is untouched, which is why interruption is followed by rebound and why this is suppression rather than cure.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SINGLE (NCT01263015)',
        phase: 'Phase 3, randomised, double-blind, 48-week primary analysis',
        sampleSize: 833,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48, FDA snapshot algorithm',
        endpointMet: true,
        statisticalPValue: 'P = 0.003 for 88% versus 81%',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SPRING-2 (NCT01227824)',
        phase: 'Phase 3, randomised, double-blind, non-inferiority, 48 weeks',
        sampleSize: 822,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48 versus raltegravir',
        endpointMet: true,
        statisticalPValue: 'Adjusted difference 2.5% (95% CI -2.2 to 7.1), non-inferiority met',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'SAILING (NCT01231516)',
        phase: 'Phase 3, randomised, double-blind, non-inferiority then superiority, 48 weeks',
        sampleSize: 715,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48 in treatment-experienced, integrase-inhibitor-naive adults',
        endpointMet: true,
        statisticalPValue: 'P = 0.03 for superiority; 71% versus 64%, adjusted difference 7.4%',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ADVANCE (NCT03122262)',
        phase: 'Phase 3, investigator-led, open-label, randomised, 96 weeks',
        sampleSize: 1053,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at week 48, dolutegravir with either tenofovir prodrug versus standard care',
        endpointMet: true,
        statisticalPValue: '84% and 85% versus 79%, non-inferiority met',
        unreportedAdverseSignals:
          'Mean weight gain of 6.4 kg, 3.2 kg and 1.7 kg across the three arms. Weight was a prespecified safety outcome here but had not been an endpoint in the registration programme, so the signal is visible in this trial and absent from the ones that produced the approval.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NAMSAL ANRS 12313 (NCT02777229)',
        phase: 'Randomised, open-label, non-inferiority, 48-week primary with 192-week follow-up',
        sampleSize: 613,
        primaryEndpoint:
          'Proportion with viral load below 50 copies per millilitre at week 48 versus efavirenz 400 mg',
        endpointMet: true,
        statisticalPValue: '74.5% versus 69.0%, non-inferiority met',
        unreportedAdverseSignals:
          'Mean weight gain of 9.4 kg against 5.9 kg by week 192, in a population with a high baseline prevalence of undernutrition at enrolment.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tsepamo birth-outcome surveillance, Botswana',
        phase: 'Prospective observational birth-outcome surveillance, not randomised',
        sampleSize: 119033,
        primaryEndpoint:
          'Prevalence of neural-tube defects by antiretroviral exposure at conception',
        endpointMet: false,
        statisticalPValue:
          'Difference 0.20 percentage points (95% CI 0.01 to 0.59) in the 2019 report; the updated estimates are 0.10% for dolutegravir against 0.11% for non-dolutegravir exposures',
        unreportedAdverseSignals:
          'This row is here because the first-look estimate of 0.94% changed guidelines in several countries before the denominator grew. `endpointMet: false` records that the association did not hold, not that a trial failed.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '88% of 833 treatment-naive patients below 50 copies per millilitre at week 48 against 81% on efavirenz-tenofovir-emtricitabine (P=0.003), with discontinuation for adverse events of 2% against 10%',
        '71% against 64% in 715 treatment-experienced patients, with four treatment-emergent integrase-resistance failures against seventeen on raltegravir (p=0.003)',
        'No treatment-emergent integrase resistance in any dolutegravir arm of SPRING-2, SINGLE or ADVANCE',
        'Mean 48-week weight gain of 6.4 kg, 3.2 kg and 1.7 kg across the three ADVANCE arms, and 9.4 kg against 5.9 kg by week 192 in NAMSAL',
      ],
      unsupportedInferences: [
        'That the weight gained on dolutegravir causes cardiovascular or metabolic disease — no antiretroviral trial has been powered for that endpoint',
        'That dolutegravir carries the same resistance barrier in integrase-experienced patients as it demonstrated in integrase-naive ones',
        'That the 2018 neural-tube defect estimate of 0.94% described a real excess risk — the same surveillance programme now reports 0.10% against 0.11% for other regimens',
      ],
      whatFailedInitially: [
        'The Tsepamo preliminary signal changed treatment guidance for women of childbearing potential across several African countries on the strength of four events in 426 deliveries',
        'Weight gain was not an endpoint in the registration programme and was found by an investigator-led trial afterwards, which is why the label reached the market without it',
      ],
      realWorldOutcome: [
        'Recommended first-line antiretroviral therapy in the WHO guidelines and in the United States DHHS guidelines',
        'Licensed to the Medicines Patent Pool, so generic tenofovir-lamivudine-dolutegravir is manufactured for low-income and most lower-middle-income countries while the branded United States tablet sits at US$105.03 at pharmacy acquisition cost',
        'The 2018 birth-defect scare and its reversal is now taught as a case study in acting on, and then unwinding, an early safety signal',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, and dispersible tablets for oral suspension for children',
      description:
        'Taken once daily with or without food, always with at least two other antiretroviral agents. Polyvalent cations chelate the same triad the drug uses on magnesium, so antacids, iron and calcium supplements interfere with absorption by the drug binding them rather than by any effect on the gut.',
      safetyProfile:
        'Hypersensitivity reactions including organ dysfunction and hepatotoxicity are labelled, with higher risk in hepatitis B or C co-infection. Immune reconstitution inflammatory syndrome can follow suppression. Insomnia and headache are the commonest complaints. Serum creatinine rises by a small, non-progressive amount within the first weeks through inhibition of tubular OCT2-mediated creatinine secretion, which is a change in the measurement rather than in glomerular filtration. Weight gain is real, larger than on the drugs it displaced, and of unknown clinical consequence.',
    },
    commonQuestions: [
      {
        q: 'Is it true dolutegravir causes birth defects?',
        a: 'The best current answer is no, and the reason that answer is worth explaining is that it used to be yes. In 2018 the Tsepamo birth-outcome surveillance programme in Botswana reported four neural-tube defects among 426 babies conceived while the mother was taking dolutegravir, a prevalence of 0.94% against 0.12% on other regimens. Several countries changed their guidance for women of childbearing potential within weeks. As the same programme kept counting, the estimate fell: five defects in 1,683 deliveries (0.30%) in the 2019 full report, and the current published figures are 0.10% for dolutegravir against 0.11% for everything else. A 2025 retrospective in AIDS makes the statistical point plainly: four events were compatible with a wide range of effect sizes including no difference at all.',
        auditNote:
          'This is the clearest conclusion shift on this page. The first number was not fabricated or miscounted; it was a small numerator read as though it were a rate.',
      },
      {
        q: 'Why do people gain weight on it?',
        a: 'Nobody has established the mechanism, and the size of the gain depends heavily on what it is being compared with. In ADVANCE, mean gain at 48 weeks was 6.4 kg with tenofovir alafenamide, 3.2 kg with tenofovir disoproxil and 1.7 kg on the efavirenz-based standard of care, so part of what looks like dolutegravir weight is really the absence of tenofovir disoproxil, which suppresses weight, and the presence of tenofovir alafenamide, which does not. In NAMSAL the 192-week gains were 9.4 kg against 5.9 kg on low-dose efavirenz. What has not been measured is whether that weight produces disease. A secondary analysis of ADVANCE found blood pressure tracked BMI change rather than the regimen, and the largest 96-week systolic rise in any arm was 1.7 mmHg.',
      },
      {
        q: 'My creatinine went up after starting it. Are my kidneys being damaged?',
        a: 'Almost certainly not, and the distinction is worth stating precisely. Dolutegravir inhibits the transporter that secretes creatinine into urine in the kidney tubule, so less creatinine leaves the body by that route and the blood level rises. Glomerular filtration, the thing creatinine is used as a proxy for, has not changed. The rise appears within the first weeks, does not progress, and reverses on stopping. It is a change in the measurement, not in the organ. A creatinine that keeps climbing months later is a different problem and is not this.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for dolutegravir could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and putting an estimate in that field would mean this page inventing a number. What is shown instead is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost. The licensing note is the honest version of the same point: the identical molecule is manufactured generically for the countries covered by the Medicines Patent Pool licence and sold at brand price in the ones that are not.',
      },
      {
        q: 'Does it cure HIV?',
        a: 'No, and the mechanism explains exactly why not. Dolutegravir blocks the step where viral DNA is pasted into a human chromosome. It has no effect at all on virus that was pasted in before treatment started, and those integrated copies sit in long-lived memory T cells for the life of the cell and its descendants. Stopping treatment lets those cells restart production and plasma virus returns within weeks. What suppression does achieve is measured and substantial: the CD4 count recovers, and a person whose viral load stays below 200 copies per millilitre does not transmit the virus sexually.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Walmsley SL, Antela A, Clumeck N, et al. Dolutegravir plus abacavir-lamivudine for the treatment of HIV-1 infection. N Engl J Med 2013;369:1807-1818',
        identifier: '10.1056/NEJMoa1215541',
        kind: 'doi',
      },
      {
        label:
          'Raffi F, Rachlis A, Stellbrink HJ, et al. Once-daily dolutegravir versus raltegravir in antiretroviral-naive adults with HIV-1 infection: 48 week results from SPRING-2. Lancet 2013;381:735-743',
        identifier: '10.1016/S0140-6736(12)61853-4',
        kind: 'doi',
      },
      {
        label:
          'Cahn P, Pozniak AL, Mingrone H, et al. Dolutegravir versus raltegravir in antiretroviral-experienced, integrase-inhibitor-naive adults with HIV: week 48 results from SAILING. Lancet 2013;382:700-708',
        identifier: '10.1016/S0140-6736(13)61221-0',
        kind: 'doi',
      },
      {
        label:
          'Zash R, Makhema J, Shapiro RL. Neural-tube defects with dolutegravir treatment from the time of conception. N Engl J Med 2018;379:979-981',
        identifier: '10.1056/NEJMc1807653',
        kind: 'doi',
      },
      {
        label:
          'Zash R, Holmes L, Diseko M, et al. Neural-tube defects and antiretroviral treatment regimens in Botswana. N Engl J Med 2019;381:827-840',
        identifier: '10.1056/NEJMoa1905230',
        kind: 'doi',
      },
      {
        label:
          'A lesson in embracing uncertainty in early safety signals from the Tsepamo study. AIDS 2025',
        identifier: '10.1097/QAD.0000000000004326',
        kind: 'doi',
      },
      {
        label:
          'Venter WDF, Moorhouse M, Sokhela S, et al. Dolutegravir plus two different prodrugs of tenofovir to treat HIV. N Engl J Med 2019;381:803-815',
        identifier: '10.1056/NEJMoa1902824',
        kind: 'doi',
      },
      {
        label:
          'Manne-Goehler J, Fabian J, Sokhela S, et al. Blood pressure increases are associated with weight gain and not antiretroviral regimen or kidney function: a secondary analysis from the ADVANCE trial in South Africa. J Int AIDS Soc 2024;27:e26268',
        identifier: '10.1002/jia2.26268',
        kind: 'doi',
      },
      {
        label:
          'NAMSAL ANRS 12313 Study Group. Dolutegravir-based or low-dose efavirenz-based regimen for the treatment of HIV-1. N Engl J Med 2019;381:816-826',
        identifier: '10.1056/NEJMoa1904340',
        kind: 'doi',
      },
      {
        label:
          'Mpoudi-Etame M, Tovar Sanchez T, Bousmah MA, et al. Durability of dolutegravir-based and low-dose efavirenz-based regimens in Cameroon: week 192 data. Open Forum Infect Dis 2023;10:ofad582',
        identifier: '10.1093/ofid/ofad582',
        kind: 'doi',
      },
      {
        label:
          'Bourgi K, Rebeiro PF, Turner M, et al. Greater weight gain in treatment-naive persons starting dolutegravir-based antiretroviral therapy. Clin Infect Dis 2020;70:1267-1274',
        identifier: '10.1093/cid/ciz407',
        kind: 'doi',
      },
      {
        label:
          'SINGLE: dolutegravir plus abacavir-lamivudine versus Atripla in treatment-naive adults',
        identifier: 'NCT01263015',
        kind: 'nct',
      },
      {
        label: 'SPRING-2: once-daily dolutegravir versus raltegravir in treatment-naive adults',
        identifier: 'NCT01227824',
        kind: 'nct',
      },
      {
        label: 'SAILING: dolutegravir versus raltegravir in treatment-experienced adults',
        identifier: 'NCT01231516',
        kind: 'nct',
      },
      {
        label:
          'ADVANCE: dolutegravir with either tenofovir prodrug versus standard care, South Africa',
        identifier: 'NCT03122262',
        kind: 'nct',
      },
      {
        label: 'NAMSAL ANRS 12313: dolutegravir versus efavirenz 400 mg, Cameroon',
        identifier: 'NCT02777229',
        kind: 'nct',
      },
      {
        label:
          'TIVICAY (dolutegravir) — Drugs@FDA application NDA 204790, ViiV Healthcare, original approval 12 August 2013',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=204790',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 54726191 — dolutegravir structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54726191',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Emtricitabine — the drug in half the world's HIV tablets, whose own trials are two, and
  //    whose prevention trials split cleanly into the ones where people took it and the ones where
  //    they did not.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'emtricitabine',
    name: 'Emtricitabine',
    tradeName: 'Emtriva',
    sponsor: 'Gilead Sciences (originated at Emory University and Triangle Pharmaceuticals)',
    targetGene: 'HIV-1 pol, reverse transcriptase coding region',
    targetProtein:
      'HIV-1 reverse transcriptase, terminated by incorporation of emtricitabine 5-prime-triphosphate; also inhibits hepatitis B virus polymerase',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2003,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection; also a component of the fixed-dose combinations approved for pre-exposure prophylaxis',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite:
      'Cytoplasm of CD4-positive T cells and macrophages, where the triphosphate competes with deoxycytidine triphosphate',
    conditionContext: {
      conditionExplainer:
        'HIV-1 carries its genome as RNA and must copy it into DNA before anything else can happen. Reverse transcriptase does that copying, and it is a sloppy enzyme with no proofreading, which is both why HIV mutates so fast and why a fake building block slipped into the chain is not caught before it is used.',
      whyItMatters:
        'Emtricitabine is almost never the drug being discussed. It is the quiet second nucleoside in Truvada, Descovy, Atripla, Complera, Stribild, Genvoya, Odefsey, Biktarvy and Symtuza, so its safety and its resistance behaviour are inherited by an enormous number of people who have never heard its name.',
      whoTakesThis:
        'People living with HIV-1 on a combination regimen, and HIV-negative people taking a fixed-dose combination for pre-exposure prophylaxis. It is on the WHO Model List of Essential Medicines.',
      clinicalGoals:
        'Contribute one of the two nucleoside analogue backbone drugs to a suppressive regimen, and in prophylaxis, keep enough active triphosphate inside cells that an incoming virus cannot establish infection.',
    },
    oneSentenceVerdict:
      'A fluorinated cytidine analogue that is chopped into the growing viral DNA chain and stops it dead; it beat stavudine on suppression at 60 weeks (76% against 54%) in its own registration trial, and in prevention it cut HIV acquisition by 75% where people took it and by nothing at all in the two trials where they did not.',
    laymanHowItWorks:
      'To make a DNA copy of itself, HIV has to string together building blocks in order. Emtricitabine looks almost exactly like one of those building blocks, cytosine, but it is missing the hook the next one attaches to. Your own cells add three phosphates to it, the virus picks it up by mistake, and the chain stops there. Because the virus copies its genome without proofreading, it does not notice until it is too late.',
    auditConfidence: 'High Confidence',
    confidenceScore: 87,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$12.49 per capsule at United States pharmacy acquisition cost, median across three listed generic products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Discovered at Emory University by Dennis Liotta, Raymond Schinazi and Woo-Baeg Choi, licensed to Triangle Pharmaceuticals and acquired by Gilead in 2003. Emory sold its royalty interest to Gilead and Royalty Pharma in 2005 for US$525 million, one of the largest university royalty sales on record. The composition-of-matter patents have expired and generic emtricitabine is listed in the CMS file, but the drug is overwhelmingly dispensed inside fixed-dose combinations whose other components are still protected.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The one real substitute is lamivudine, and a systematic review of 12 trials found no measurable difference between them. The choice between the two is made by which fixed-dose combination a patient is being put on, not by any property of the molecules.',
      conventionalRx: [
        {
          name: 'Lamivudine (generic)',
          class: 'Nucleoside reverse transcriptase inhibitor, cytidine analogue',
          howItCompares:
            'The same sugar mimic without the 5-fluorine. A systematic review of 12 trials contributing 15 randomised comparisons in 4,913 patients found a relative risk for treatment success of 1.00 (95% CI 0.97 to 1.02) overall, and 1.03 (95% CI 0.96 to 1.10) in the three trials that compared the two directly. Both select the same M184V mutation on failure.',
          typicalCost:
            'US$0.4887 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, median across 18 listed products, effective 19 August 2026)',
          prosAndCons:
            'Pros: about twenty-five times cheaper per unit in the same price file, and longer safety experience in pregnancy. Cons: none that a randomised comparison has demonstrated.',
        },
        {
          name: 'Abacavir (generic)',
          class: 'Nucleoside reverse transcriptase inhibitor, guanosine analogue',
          howItCompares:
            'A different backbone partner rather than a substitute for emtricitabine itself, used as abacavir-lamivudine where tenofovir is unsuitable. It requires HLA-B*5701 genotyping before first use because carriers have a high risk of a hypersensitivity reaction that can be fatal on rechallenge.',
          typicalCost:
            'US$0.5380 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no renal or bone effect. Cons: a mandatory genetic test before use, and a disputed myocardial infarction signal.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@H](O[C@H](S1)CO)N2C=C(C(=NC2=O)N)F',
      chemicalFormula: 'C8H10FN3O3S',
      molecularWeight: '247.25 g/mol',
      targetReceptorAffinity:
        'Not a receptor ligand. The active species is the intracellular 5-prime-triphosphate, which competes with deoxycytidine triphosphate for incorporation by HIV-1 reverse transcriptase and, once incorporated, terminates the chain because the 3-prime position carries a sulfur-containing ring rather than a hydroxyl. Emtricitabine is the (2R,5S) enantiomer, the unnatural L-configuration, which is why human DNA polymerases alpha, beta and gamma handle it poorly and why it lacks the mitochondrial toxicity of the D-configuration nucleosides it replaced.',
      structureSource: {
        label: 'PubChem CID 60877 (emtricitabine) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60877',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ftc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Incoming control of 5-fluorocytosine and the oxathiolane precursor',
          description:
            'Assay identity and purity of 5-fluorocytosine and of the 1,3-oxathiolane building block before glycosylation. Unfluorinated cytosine carried in here produces lamivudine, which is a different approved drug with an almost identical retention time, and it is the impurity the specification is written to exclude.',
          reagentsAndBuffer:
            '5-fluorocytosine reference standard, 2-(benzoyloxymethyl)-1,3-oxathiolan-5-yl acetate, reversed-phase HPLC with UV detection, chiral HPLC on a cellulose-derived phase, Karl Fischer titration',
        },
        {
          id: 'ftc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Vorbruggen glycosylation and enantiomeric resolution',
          description:
            'Silylate 5-fluorocytosine and couple it to the oxathiolane under Lewis acid catalysis, which sets the anomeric centre with a strong preference for the cis product, then resolve the racemate to the (2R,5S) enantiomer. The resolution is the expensive step and the reason this molecule costs more to make than lamivudine.',
          dependsOnStepId: 'ftc-w1',
          reagentsAndBuffer:
            'Hexamethyldisilazane with ammonium sulfate, trimethylsilyl trifluoromethanesulfonate or iodotrimethylsilane in dichloromethane, then enzymatic resolution with cytidine deaminase or diastereomeric salt crystallisation with an L-menthyl auxiliary',
        },
        {
          id: 'ftc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Debenzoylation, crystallisation and enantiomeric excess release test',
          description:
            'Remove the benzoyl protecting group from the 5-prime hydroxyl and crystallise the free nucleoside from ethanol. Release testing measures enantiomeric excess directly rather than inferring it from optical rotation, because the (2S,5R) enantiomer is substantially less active and is not removed by achiral chromatography.',
          dependsOnStepId: 'ftc-w2',
          reagentsAndBuffer:
            'Methanolic ammonia or sodium methoxide in methanol, ethanol and water for recrystallisation, chiral HPLC for enantiomeric excess, ion chromatography for residual fluoride',
        },
        {
          id: 'ftc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Intracellular triphosphate loading in PBMCs',
          description:
            'Incubate primary peripheral blood mononuclear cells with the nucleoside and measure how much of it becomes the active triphosphate inside the cell. This is the step that decides whether the drug works at all: emtricitabine given to an enzyme preparation does nothing, because the anabolite is what the polymerase sees, and the anabolite has a long intracellular half-life that the plasma half-life does not predict.',
          dependsOnStepId: 'ftc-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs with and without phytohaemagglutinin stimulation, RPMI-1640 with 10% foetal bovine serum, cold methanol extraction, weak-anion-exchange LC-MS/MS with a stable-isotope-labelled triphosphate internal standard',
        },
        {
          id: 'ftc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Chain-termination assay and M184V susceptibility shift',
          description:
            'Run a primer-extension reaction with recombinant reverse transcriptase, wild-type and M184V, and confirm both that the chain stops at the point of incorporation and how far susceptibility shifts in the mutant. The second number is the one that matters clinically: M184V confers high-level resistance to this drug, and reporting the wild-type potency alone would describe a situation that ends within weeks of virological failure.',
          dependsOnStepId: 'ftc-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 reverse transcriptase p66/p51 heterodimer, wild-type and M184V, 5-prime-labelled DNA primer on an RNA template, dNTP mix with emtricitabine triphosphate, denaturing polyacrylamide gel with phosphorimaging',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ftc-a1',
        category: 'measured',
        title: 'FTC-301A: 76% against 54% persistent suppression at 60 weeks versus stavudine',
        laymanSummary:
          'In the one trial where emtricitabine was the variable being tested, 571 previously untreated patients got either it or stavudine on the same background. Emtricitabine held the virus down in 76% through 60 weeks against 54%, and fewer people stopped it for side effects.',
        technicalDetails:
          'Saag and colleagues randomised 571 antiretroviral-naive adults with HIV-1 RNA of at least 5,000 copies per millilitre at 101 sites to once-daily emtricitabine 200 mg (n=286) or twice-daily stavudine (n=285), each with didanosine and efavirenz. At the 42-week interim analysis the probability of a persistent virological response at or below 50 copies per millilitre was 85% against 76% (P=0.005), with mean CD4 increases of 156 against 119 cells per microlitre (P=0.01). Through week 60 the persistent response was 76% against 54% (P<0.001), virological failure 4% against 12% (P<0.001), and discontinuation for adverse events 7% against 15% (P=0.005).',
        evidenceSource: 'Saag MS, Cahn P, Raffi F, et al., JAMA 2004;292:180-189 (FTC-301A)',
        doi: '10.1001/jama.292.2.180',
        measuredMetric:
          'Probability of persistent virological response at or below 50 copies per millilitre through week 60',
        auditFlag: 'verified',
      },
      {
        id: 'ftc-a2',
        category: 'measured',
        title: 'Study 934: the tenofovir-emtricitabine backbone beat zidovudine-lamivudine',
        laymanSummary:
          'The trial that made the Truvada backbone standard. In 517 previously untreated patients, tenofovir with emtricitabine suppressed more virus than zidovudine with lamivudine and caused less than half as many discontinuations.',
        technicalDetails:
          'Gallant and colleagues ran an open-label noninferiority study in 517 treatment-naive patients randomised to once-daily tenofovir disoproxil, emtricitabine and efavirenz or to twice-daily fixed-dose zidovudine-lamivudine plus efavirenz. Through week 48, 84% against 73% reached HIV-1 RNA below 400 copies per millilitre (95% CI for the difference 4 to 19, P=0.002), and 80% against 70% reached below 50 copies per millilitre (95% CI 2 to 17, P=0.02). Mean CD4 increases were 190 against 158 cells per cubic millimetre (95% CI 9 to 55, P=0.002). Adverse events causing discontinuation were 4% against 9% (P=0.02). The K65R mutation developed in no patient in either arm.',
        evidenceSource: 'Gallant JE et al., N Engl J Med 2006;354:251-260 (Study 934, NCT00112047)',
        doi: '10.1056/NEJMoa051871',
        measuredMetric:
          'Proportion below 400 and below 50 copies per millilitre at week 48, and discontinuations for adverse events',
        auditFlag: 'verified',
      },
      {
        id: 'ftc-a3',
        category: 'measured',
        title: 'Prevention works when the drug is actually in the blood: 75% in Partners PrEP',
        laymanSummary:
          'In 4,747 couples where one partner had HIV and one did not, daily tenofovir with emtricitabine cut new infections in the HIV-negative partner by three quarters. In a similar trial in men who have sex with men the reduction was 44%, and the drug was detectable in only half the people who were supposed to be taking it.',
        technicalDetails:
          'Partners PrEP (NCT00557245) enrolled 4,747 HIV-1 serodiscordant heterosexual couples in Kenya and Uganda. Incidence in the HIV-negative partner was 1.99 per 100 person-years on placebo (52 infections), 0.65 on tenofovir disoproxil (17 infections, 67% relative reduction, 95% CI 44 to 81, P<0.001) and 0.50 on tenofovir-emtricitabine (13 infections, 75% relative reduction, 95% CI 55 to 87, P<0.001). iPrEx (NCT00458393) randomised 2,499 HIV-seronegative men and transgender women who have sex with men and found 36 infections on tenofovir-emtricitabine against 64 on placebo, a 44% reduction (95% CI 15 to 63, P=0.005); study drug was detected in 22 of 43 seronegative participants tested (51%) and in 3 of 34 who became infected (9%), P<0.001.',
        evidenceSource:
          'Baeten JM et al., N Engl J Med 2012;367:399-410 (Partners PrEP, NCT00557245); Grant RM et al., N Engl J Med 2010;363:2587-2599 (iPrEx, NCT00458393)',
        doi: '10.1056/NEJMoa1108524',
        measuredMetric: 'HIV-1 incidence per 100 person-years and relative risk reduction',
        auditFlag: 'verified',
      },
      {
        id: 'ftc-a4',
        category: 'failed',
        title: 'FEM-PrEP and VOICE: two large trials in African women found no effect at all',
        laymanSummary:
          'Two trials enrolling more than 7,000 African women between them found that daily tenofovir with emtricitabine prevented nothing. In both, drug was detectable in fewer than a third of the women who were assigned to take it. The trials measured the pills prescribed, not the pills swallowed.',
        technicalDetails:
          'FEM-PrEP (NCT00625404) randomised 2,120 HIV-negative women in Kenya, South Africa and Tanzania to daily tenofovir-emtricitabine or placebo. Infections occurred in 33 women on drug (4.7 per 100 person-years) and 35 on placebo (5.0 per 100 person-years), hazard ratio 0.94 (95% CI 0.59 to 1.52, P=0.81). Fewer than 40% of uninfected women in the drug arm had evidence of recent pill use at matched visits. The trial was stopped early on 18 April 2011 for lack of efficacy. VOICE (NCT00705679) enrolled 5,029 women in South Africa, Uganda and Zimbabwe across oral tenofovir, oral tenofovir-emtricitabine and vaginal tenofovir gel arms; 312 infections occurred at 5.7 per 100 person-years, and effectiveness was -49.0% for tenofovir (HR 1.49, 95% CI 0.97 to 2.29), -4.4% for tenofovir-emtricitabine (HR 1.04, 95% CI 0.73 to 1.49) and 14.5% for the gel. Tenofovir was detected in 30%, 29% and 25% of sampled plasma. Creatinine elevation was more frequent on oral tenofovir-emtricitabine than placebo, 1.3% against 0.2% (P=0.004).',
        evidenceSource:
          'Van Damme L et al., N Engl J Med 2012;367:411-422 (FEM-PrEP); Marrazzo JM et al., N Engl J Med 2015;372:509-518 (VOICE)',
        doi: '10.1056/NEJMoa1202614',
        measuredMetric:
          'Hazard ratio for HIV-1 acquisition, and proportion of plasma samples with detectable tenofovir',
        auditFlag: 'verified',
      },
      {
        id: 'ftc-a5',
        category: 'inferred',
        title:
          'The adherence explanation for the failed trials is an inference, not a randomisation',
        laymanSummary:
          'Everyone now says FEM-PrEP and VOICE failed because the women did not take the tablets. The drug-level measurements strongly support that. But nobody randomised anyone to adherence, so the alternative explanations were never excluded by design.',
        technicalDetails:
          'The adherence account rests on an association within the trials: participants with detectable plasma tenofovir were less likely to seroconvert. In VOICE the investigators themselves report that detection of tenofovir in plasma was negatively associated with the characteristics that predict HIV-1 acquisition, which means the adherent subgroup was also the lower-risk subgroup and the comparison between them is confounded by the same behaviour it is meant to explain. Competing hypotheses that the same data cannot exclude include lower genital-tract tenofovir concentrations in women than in rectal tissue, and a higher force of infection in the enrolled populations. The correct statement is that these trials measured what happens when a prescription is issued, and that the drug-level data are consistent with non-use being the main reason no effect appeared.',
        evidenceSource: 'Marrazzo JM et al., N Engl J Med 2015;372:509-518 (VOICE, NCT00705679)',
        doi: '10.1056/NEJMoa1402269',
        inferredClaim:
          'That non-adherence is the sole reason oral tenofovir-emtricitabine prophylaxis failed in African women — supported by drug levels, established by no randomisation',
        auditFlag: 'caution',
      },
      {
        id: 'ftc-a6',
        category: 'inferred',
        title:
          'Interchangeability with lamivudine is a pooled estimate, not three big head-to-heads',
        laymanSummary:
          'Emtricitabine and lamivudine are treated as the same drug in practice. A systematic review supports that, but most of the evidence comes from comparing trials with each other rather than from randomising patients between the two.',
        technicalDetails:
          'Ford and colleagues pooled 12 trials contributing 15 randomised comparisons in 4,913 patients. Across all trials the relative risk for treatment success was 1.00 (95% CI 0.97 to 1.02) and for treatment failure 1.08 (95% CI 0.94 to 1.22). Only three of the twelve trials compared lamivudine and emtricitabine directly; in that subset the relative risk for success was 1.03 (95% CI 0.96 to 1.10). The direct estimate is compatible with equivalence and also compatible with a 4% advantage in either direction, and it is the estimate carrying the interchangeability claim, because the remaining comparisons differ in more than one component.',
        evidenceSource: 'Ford N, Shubber Z, Hill A, et al., PLoS One 2013;8:e79981',
        doi: '10.1371/journal.pone.0079981',
        inferredClaim:
          'That emtricitabine and lamivudine are clinically identical in every regimen — a conclusion resting mainly on indirect comparison',
        auditFlag: 'caution',
      },
      {
        id: 'ftc-a7',
        category: 'measured',
        title:
          'M184V ends the drug within weeks, and the label carries a hepatitis B boxed warning',
        laymanSummary:
          'A single mutation at position 184 makes emtricitabine stop working, and it appears quickly once a regimen starts to fail. Separately, the drug also suppresses hepatitis B, so stopping it in someone who has both infections can trigger a severe liver flare.',
        technicalDetails:
          'The M184V substitution in HIV-1 reverse transcriptase confers high-level resistance to emtricitabine and to lamivudine, and is the characteristic mutation selected on failure of either. The FDA-approved label for EMTRIVA carries a boxed warning for post-treatment acute exacerbation of hepatitis B: emtricitabine is active against hepatitis B virus, patients coinfected with HIV-1 and HBV who discontinue it may experience severe acute exacerbations of hepatitis, and hepatic function requires close monitoring for at least several months after stopping. Emtricitabine is not approved for the treatment of chronic hepatitis B, so this is a drug with hepatitis B activity, a hepatitis B withdrawal warning, and no hepatitis B indication.',
        evidenceSource:
          'EMTRIVA (emtricitabine) prescribing information, NDA 021500, Drugs@FDA, original approval 2 July 2003',
        doi: '10.1001/jama.292.2.180',
        measuredMetric:
          'Presence of the M184V substitution at virological failure, and the labelled boxed warning for hepatitis B exacerbation on discontinuation',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, and mostly ignored by the liver',
        laymanDesc:
          'A capsule taken once daily, with or without food. The body does very little to it: most of what goes in leaves unchanged in the urine.',
        molecularDetail:
          'Oral bioavailability of roughly 93% for the capsule, plasma half-life around 10 hours, and about 86% recovered in urine with limited metabolism. Clearance is renal, by glomerular filtration and active tubular secretion, which is why exposure rises as kidney function falls and why it is the renal partner in every combination it belongs to.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It walks into cells and gets three phosphates added',
        laymanDesc:
          'The molecule crosses into cells easily. Once inside, the cell mistakes it for a normal building block and attaches three phosphate groups, which is exactly what turns it into a weapon.',
        molecularDetail:
          'Cellular enzymes phosphorylate emtricitabine to emtricitabine 5-prime-triphosphate, the species the label names as the active one. The triphosphate persists inside the cell for considerably longer than the roughly 10-hour plasma half-life of the parent, which is why once-daily dosing works and why a plasma concentration is a poor guide to activity.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Reverse transcriptase picks it up instead of the real thing',
        laymanDesc:
          'HIV is in the middle of copying its RNA into DNA. It needs a cytosine block, and the fake one is sitting right there looking correct.',
        molecularDetail:
          'Emtricitabine triphosphate competes with deoxycytidine triphosphate at the polymerase active site of HIV-1 reverse transcriptase. Selectivity is high: the label records it as a weak inhibitor of mammalian DNA polymerases alpha, beta and epsilon and of mitochondrial polymerase gamma, which is the structural reason this class replaced the D-configuration nucleosides whose mitochondrial toxicity produced lipoatrophy and neuropathy.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The chain stops, because there is no hook for the next block',
        laymanDesc:
          'A normal building block has an attachment point for the next one. This one has a sulfur ring where that point should be, so the copy ends there and cannot be resumed.',
        molecularDetail:
          'The 3-prime position of the 1,3-oxathiolane ring carries no hydroxyl, so no phosphodiester bond can be formed to the next incoming nucleotide and DNA synthesis terminates obligately. Unlike the thymidine analogues, emtricitabine-terminated chains are poorly excised by the pyrophosphorolysis reaction that thymidine-analogue mutations enhance, which is why this drug is not compromised by that resistance pathway.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'No DNA copy, no integration, no new infected cell',
        laymanDesc:
          'Without a complete DNA copy there is nothing to paste into the chromosome. The virus that entered that cell reaches a dead end, and the same happens in the next cell, and the plasma level falls.',
        molecularDetail:
          'Incomplete reverse transcripts are degraded and no integration-competent DNA is produced. In prophylaxis the same chemistry is used pre-emptively: the triphosphate is loaded into mucosal and circulating target cells before exposure, which is why the effect depends on the intracellular concentration at the moment of exposure and why drug-level data, not pill counts, explain the difference between the trials that worked and the trials that did not.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'FTC-301A (Saag, JAMA 2004)',
        phase: 'Randomised, double-blind, 60-week analysis',
        sampleSize: 571,
        primaryEndpoint:
          'Probability of a persistent virological response at or below 50 copies per millilitre versus stavudine',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for 76% versus 54% through week 60',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Study 934 (NCT00112047)',
        phase: 'Open-label, randomised, non-inferiority, 48 weeks',
        sampleSize: 517,
        primaryEndpoint:
          'Proportion below 400 copies per millilitre at week 48 in patients without baseline efavirenz resistance',
        endpointMet: true,
        statisticalPValue: 'P = 0.002 for 84% versus 73%',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'iPrEx (NCT00458393)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled prevention trial',
        sampleSize: 2499,
        primaryEndpoint: 'Incidence of HIV-1 infection',
        endpointMet: true,
        statisticalPValue: 'P = 0.005 for a 44% reduction (95% CI 15 to 63)',
        unreportedAdverseSignals:
          'Study drug was detected in only 22 of 43 seronegative participants tested. The headline 44% is therefore an intention-to-treat estimate over a population half of which was not taking the drug.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Partners PrEP (NCT00557245)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled prevention trial',
        sampleSize: 4747,
        primaryEndpoint: 'HIV-1 incidence in the seronegative partner of serodiscordant couples',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 for a 75% reduction with tenofovir-emtricitabine',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FEM-PrEP (NCT00625404)',
        phase: 'Randomised, double-blind, placebo-controlled prevention trial, stopped early',
        sampleSize: 2120,
        primaryEndpoint: 'HIV-1 acquisition in African women',
        endpointMet: false,
        statisticalPValue: 'P = 0.81; hazard ratio 0.94 (95% CI 0.59 to 1.52)',
        unreportedAdverseSignals:
          'Fewer than 40% of uninfected women in the drug arm had evidence of recent pill use. Nausea, vomiting and alanine aminotransferase elevation were all more frequent on drug.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'VOICE (NCT00705679)',
        phase: 'Phase 2B, randomised, placebo-controlled, multi-arm prevention trial',
        sampleSize: 5029,
        primaryEndpoint: 'HIV-1 acquisition across oral and topical tenofovir regimens',
        endpointMet: false,
        statisticalPValue:
          'Effectiveness -4.4% for tenofovir-emtricitabine (HR 1.04, 95% CI 0.73 to 1.49); -49.0% for oral tenofovir alone',
        unreportedAdverseSignals:
          'Tenofovir was detected in 29% of sampled plasma in the tenofovir-emtricitabine arm. Serum creatinine elevation was more frequent than on placebo (1.3% against 0.2%, P=0.004).',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '76% against 54% persistent virological response through week 60 versus stavudine in 571 treatment-naive patients (P<0.001)',
        '84% against 73% below 400 copies per millilitre at week 48 for the tenofovir-emtricitabine backbone against zidovudine-lamivudine (P=0.002)',
        'A 75% reduction in HIV-1 acquisition in 4,747 serodiscordant couples (95% CI 55 to 87) and 44% in 2,499 men who have sex with men (95% CI 15 to 63)',
        'No effect in 2,120 women in FEM-PrEP (HR 0.94) or in the 5,029-woman VOICE trial (HR 1.04), with tenofovir detectable in under a third of plasma samples',
      ],
      unsupportedInferences: [
        'That non-adherence alone explains FEM-PrEP and VOICE — supported by drug levels, but the adherent subgroup was also the lower-risk subgroup in the investigators own analysis',
        'That emtricitabine and lamivudine are interchangeable in every regimen — only three of twelve pooled trials compared them directly',
        'That emtricitabine has an effect of its own inside a fixed-dose combination that can be separated from its partners; outside FTC-301A and FTC-303 it has never been the variable',
      ],
      whatFailedInitially: [
        'FEM-PrEP was stopped early on 18 April 2011 for lack of efficacy after 33 infections on drug against 35 on placebo',
        'VOICE found a point estimate favouring placebo in the oral tenofovir arm and no effect in the tenofovir-emtricitabine arm',
        'M184V arises quickly on failure and abolishes activity, so the drug protects only while the regimen around it is working',
      ],
      realWorldOutcome: [
        'A component of Truvada, Descovy, Atripla, Complera, Stribild, Genvoya, Odefsey, Biktarvy and Symtuza, which is how most people who take it encounter it',
        'On the WHO Model List of Essential Medicines, and the nucleoside half of the first regimen approved anywhere for HIV pre-exposure prophylaxis',
        'Emory University sold its royalty interest to Gilead and Royalty Pharma in 2005 for US$525 million, one of the largest university royalty sales recorded',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and oral solution',
      description:
        'Taken once daily with or without food, always with at least one other antiretroviral agent. The oral solution is not interchangeable milligram for milligram with the capsule because bioavailability differs, which is a formulation fact rather than a dosing instruction.',
      safetyProfile:
        'The label carries a boxed warning for post-treatment acute exacerbation of hepatitis B in patients coinfected with HIV-1 and HBV who stop the drug. Lactic acidosis and severe hepatomegaly with steatosis are labelled as a nucleoside-analogue class warning. Skin hyperpigmentation of the palms and soles is characteristic and benign. Renal clearance means exposure rises with declining kidney function. Emtricitabine has no established mitochondrial toxicity of the kind that made stavudine and zalcitabine unusable.',
    },
    commonQuestions: [
      {
        q: 'Is emtricitabine just lamivudine with a fluorine on it?',
        a: 'Structurally, close to it: the same 1,3-oxathiolane sugar mimic and the same unnatural L-configuration, with a fluorine at the 5 position of the cytosine ring. Clinically the evidence says they behave the same. A systematic review pooling 12 trials in 4,913 patients found a relative risk for treatment success of 1.00 (95% CI 0.97 to 1.02), and in the three trials that randomised patients directly between the two the figure was 1.03 (95% CI 0.96 to 1.10). Both select the same M184V mutation when a regimen fails. The main practical difference is price: in the same CMS file, emtricitabine is listed at US$12.49 a capsule and lamivudine at US$0.4887 a tablet.',
      },
      {
        q: 'Why did PrEP work in some trials and do nothing in others?',
        a: 'The trials that worked and the trials that did not differ in one measured variable: whether the drug was in the participants blood. In iPrEx, study drug was detected in 22 of 43 seronegative participants tested and in only 3 of 34 who became infected. In VOICE, tenofovir was detectable in 29% of sampled plasma in the tenofovir-emtricitabine arm, and the trial found no effect. In FEM-PrEP, fewer than 40% of women in the drug arm had evidence of recent pill use, and the trial was stopped for futility. That pattern is strong. It is worth saying plainly that it is still an association: nobody randomised anyone to take the tablets, and in VOICE the participants with detectable drug were also at lower risk on other measures.',
        auditNote:
          'The adherence explanation is almost certainly correct and is still not the same kind of evidence as the randomisation that produced the 75% figure.',
      },
      {
        q: 'Do I need to worry about my kidneys on this drug?',
        a: 'Emtricitabine itself is cleared by the kidneys rather than being toxic to them, so the concern is that failing kidneys raise its concentration rather than that the drug damages the organ. The renal signal people associate with this combination belongs to its usual partner, tenofovir disoproxil, not to emtricitabine. In VOICE, serum creatinine elevations were more frequent on oral tenofovir-emtricitabine than on placebo, 1.3% against 0.2%, and the tenofovir component is where that comes from.',
      },
      {
        q: 'If I have hepatitis B as well, what happens if I stop?',
        a: 'This is the single most important warning on the label and it is a boxed one. Emtricitabine suppresses hepatitis B virus as well as HIV, even though it is not approved to treat hepatitis B. Stopping it in someone carrying both infections can be followed by a severe acute flare of hepatitis as the suppressed virus rebounds, and the label requires close monitoring of liver function for at least several months after discontinuation. This is a reason the decision to stop belongs with the clinician who knows both infections, not with the pharmacy that ran out of stock.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for emtricitabine could be verified against a published source. The cost-of-production literature for essential medicines keeps its per-drug figures in supplementary appendices that could not be checked line by line here, and an estimate written into that field would be a number this page invented. What is shown instead is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost of manufacture.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Saag MS, Cahn P, Raffi F, et al. Efficacy and safety of emtricitabine vs stavudine in combination therapy in antiretroviral-naive patients: a randomized trial. JAMA 2004;292:180-189',
        identifier: '10.1001/jama.292.2.180',
        kind: 'doi',
      },
      {
        label:
          'Gallant JE, DeJesus E, Arribas JR, et al. Tenofovir DF, emtricitabine, and efavirenz vs. zidovudine, lamivudine, and efavirenz for HIV. N Engl J Med 2006;354:251-260',
        identifier: '10.1056/NEJMoa051871',
        kind: 'doi',
      },
      {
        label:
          'Grant RM, Lama JR, Anderson PL, et al. Preexposure chemoprophylaxis for HIV prevention in men who have sex with men. N Engl J Med 2010;363:2587-2599',
        identifier: '10.1056/NEJMoa1011205',
        kind: 'doi',
      },
      {
        label:
          'Baeten JM, Donnell D, Ndase P, et al. Antiretroviral prophylaxis for HIV prevention in heterosexual men and women. N Engl J Med 2012;367:399-410',
        identifier: '10.1056/NEJMoa1108524',
        kind: 'doi',
      },
      {
        label:
          'Van Damme L, Corneli A, Ahmed K, et al. Preexposure prophylaxis for HIV infection among African women. N Engl J Med 2012;367:411-422',
        identifier: '10.1056/NEJMoa1202614',
        kind: 'doi',
      },
      {
        label:
          'Marrazzo JM, Ramjee G, Richardson BA, et al. Tenofovir-based preexposure prophylaxis for HIV infection among African women. N Engl J Med 2015;372:509-518',
        identifier: '10.1056/NEJMoa1402269',
        kind: 'doi',
      },
      {
        label:
          'Ford N, Shubber Z, Hill A, et al. Comparative efficacy of lamivudine and emtricitabine: a systematic review and meta-analysis of randomized trials. PLoS One 2013;8:e79981',
        identifier: '10.1371/journal.pone.0079981',
        kind: 'doi',
      },
      {
        label:
          'Study 934: tenofovir DF, emtricitabine and efavirenz versus zidovudine-lamivudine and efavirenz',
        identifier: 'NCT00112047',
        kind: 'nct',
      },
      {
        label: 'iPrEx: pre-exposure prophylaxis in men and transgender women who have sex with men',
        identifier: 'NCT00458393',
        kind: 'nct',
      },
      {
        label: 'Partners PrEP: antiretroviral pre-exposure prophylaxis in serodiscordant couples',
        identifier: 'NCT00557245',
        kind: 'nct',
      },
      {
        label: 'FEM-PrEP: tenofovir-emtricitabine pre-exposure prophylaxis in African women',
        identifier: 'NCT00625404',
        kind: 'nct',
      },
      {
        label: 'VOICE (MTN-003): oral and topical tenofovir for HIV prevention in African women',
        identifier: 'NCT00705679',
        kind: 'nct',
      },
      {
        label:
          'EMTRIVA (emtricitabine) capsules — Drugs@FDA application NDA 021500, Gilead Sciences, original approval 2 July 2003',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021500',
        kind: 'regulatory',
      },
      {
        label:
          'EMTRIVA (emtricitabine) oral solution — Drugs@FDA application NDA 021896, original approval 28 September 2005',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021896',
        kind: 'regulatory',
      },
      {
        label:
          'Gilead Sciences and Royalty Pharma announce $525 million agreement with Emory University to purchase royalty interest for emtricitabine, 18 July 2005 — SEC Form 8-K exhibit 99.1',
        identifier: 'https://www.sec.gov/Archives/edgar/data/882095/000119312505144388/dex991.htm',
        kind: 'url',
      },
      {
        label: 'PubChem CID 60877 — emtricitabine structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60877',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Tenofovir alafenamide — the same active molecule as tenofovir disoproxil, wrapped
  //    differently, approved on surrogates the trials themselves said they could not convert into
  //    clinical events.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tenofovir-alafenamide',
    name: 'Tenofovir Alafenamide',
    tradeName: 'Vemlidy; also the tenofovir component of Descovy, Genvoya, Odefsey and Biktarvy',
    sponsor: 'Gilead Sciences Inc.',
    targetGene:
      'HIV-1 pol, reverse transcriptase coding region; hepatitis B virus P gene, reverse transcriptase domain',
    targetProtein:
      'HIV-1 reverse transcriptase and hepatitis B virus polymerase, chain-terminated by tenofovir diphosphate competing with dATP',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'As the tenofovir component of fixed-dose combinations, in combination with other antiretroviral agents for the treatment of HIV-1 infection, and for pre-exposure prophylaxis excluding individuals at risk from receptive vaginal sex; as the single agent Vemlidy, for chronic hepatitis B virus infection with compensated liver disease in adults and in children aged at least 6 years weighing at least 25 kg',
    patientFriendlyIndication: 'HIV-1 infection, HIV prevention, and chronic hepatitis B',
    anatomicalSite:
      'Cytoplasm of CD4-positive T cells and of hepatocytes, where the prodrug is unwrapped and phosphorylated',
    conditionContext: {
      conditionExplainer:
        'Two different viruses copy their genomes with the same kind of enzyme, a reverse transcriptase, and tenofovir jams both. In HIV-1 the enzyme turns viral RNA into DNA before integration. In hepatitis B it rebuilds the viral DNA genome from an RNA intermediate inside the capsid. One molecule therefore treats two unrelated infections, and a person carrying both is treated for both by the same tablet.',
      whyItMatters:
        'Tenofovir itself is a charged molecule that barely crosses a cell membrane, so it is always given as a wrapper that releases it inside cells. Which wrapper is used decides how much free tenofovir circulates through the kidney tubule and the skeleton on the way. That is the entire difference between this drug and tenofovir disoproxil, and it is the difference the trials were designed around.',
      whoTakesThis:
        'People taking one of the Gilead fixed-dose HIV combinations, people taking Descovy for pre-exposure prophylaxis, and adults and older children with chronic hepatitis B who take Vemlidy as a single tablet.',
      clinicalGoals:
        'In HIV, plasma RNA below 50 copies per millilitre and kept there. In hepatitis B, HBV DNA below 29 international units per millilitre with alanine aminotransferase returning to normal.',
    },
    oneSentenceVerdict:
      'A prodrug that carries the same active molecule as tenofovir disoproxil but survives the bloodstream and is opened inside the cell instead, so a twelve-fold smaller dose matched the older prodrug on viral suppression in every head-to-head trial and beat it on bone density and kidney biomarkers, which are surrogates that the registration papers themselves said they were not powered to convert into fractures or renal failure.',
    laymanHowItWorks:
      'Tenofovir is the molecule that does the work, and on its own it barely gets into a cell. Both tenofovir products are wrappers built to smuggle it in, and they differ only in where the wrapper comes off. The older one falls apart within minutes in the bloodstream, so most of the dose travels as free tenofovir past the kidney and the skeleton. This one holds together in plasma and is cut open by an enzyme inside the cells the virus infects, so a much smaller dose puts more drug where the virus is and much less everywhere else.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$74.94 per tablet at United States pharmacy acquisition cost, median across five listed brand products (CMS NADAC, effective 29 June 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Tenofovir disoproxil went generic in the United States in 2017 and now sits at US$0.5051 per tablet at the same pharmacy acquisition cost. Tenofovir alafenamide, which delivers the identical active molecule, remains on patent and is listed above. The two numbers are separated by a factor of roughly 148, and the clinical evidence separating the two prodrugs consists of bone-density and renal-biomarker differences. Gilead has licensed tenofovir alafenamide to the Medicines Patent Pool for generic manufacture in low-income and lower-middle-income countries.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The only true substitute is the molecule it was built to replace, which contains the same active drug and costs a fraction as much. Everything else in this row is a different nucleoside backbone rather than a different tenofovir.',
      conventionalRx: [
        {
          name: 'Tenofovir disoproxil fumarate (generic)',
          class: 'Nucleotide reverse transcriptase inhibitor, the earlier prodrug of tenofovir',
          howItCompares:
            'Delivers the same active molecule. Head to head it was statistically indistinguishable on viral suppression in every registration trial: 94% against 93% in HBeAg-negative hepatitis B, 64% against 67% in HBeAg-positive hepatitis B, 92% against 90% in treatment-naive HIV-1. It lost on bone mineral density and renal biomarkers in all of them.',
          typicalCost:
            'US$0.5051 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: generic, decades of use, and it lowers LDL cholesterol and suppresses weight gain in a way tenofovir alafenamide does not. Cons: larger declines in bone mineral density and larger changes in renal biomarkers, and it should not be used at low creatinine clearance.',
        },
        {
          name: 'Abacavir (generic)',
          class: 'Nucleoside reverse transcriptase inhibitor, guanosine analogue',
          howItCompares:
            'A different backbone entirely, with no renal or bone signal and no activity against hepatitis B. It requires HLA-B*5701 testing before use because carriers develop a hypersensitivity reaction that can be fatal on rechallenge.',
          typicalCost:
            'US$0.5380 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no kidney or bone effect, cheap, and usable when creatinine clearance is low. Cons: mandatory genetic testing, no hepatitis B activity, and a long-running unsettled argument about myocardial infarction risk.',
        },
        {
          name: 'Entecavir (generic), for chronic hepatitis B only',
          class: 'Nucleoside analogue, guanosine',
          howItCompares:
            'The other first-line hepatitis B nucleoside. It has no HIV activity worth using, and a person with unrecognised HIV co-infection who takes it alone can select an HIV resistance mutation, which is why HIV testing precedes it.',
          typicalCost:
            'Not quoted here; the CMS NADAC line for entecavir was not read at the time of writing',
          prosAndCons:
            'Pros: generic, no renal or bone signal of the tenofovir kind. Cons: loses potency in patients with prior lamivudine resistance, and it is not an option for someone who also has HIV.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@H](CN1C=NC2=C(N=CN=C21)N)OC[P@@](=O)(N[C@@H](C)C(=O)OC(C)C)OC3=CC=CC=C3',
      chemicalFormula: 'C21H29N6O5P',
      molecularWeight: '476.50 g/mol (free base); dispensed as tenofovir alafenamide fumarate',
      targetReceptorAffinity:
        'The molecule that binds nothing is the prodrug; the species that acts is tenofovir diphosphate, which competes with deoxyadenosine triphosphate at the polymerase active site and terminates the chain because the acyclic linker carries no 3-prime hydroxyl. The design difference from tenofovir disoproxil is stability, not affinity: the phenol and isopropylalaninyl amidate hold together in plasma and are cleaved by cathepsin A in lymphoid cells and carboxylesterase 1 in hepatocytes, which is why a 25 mg dose replaces a 300 mg one and why plasma tenofovir falls by roughly 90%.',
      structureSource: {
        label: 'PubChem CID 9574768 (tenofovir alafenamide) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9574768',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'taf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral control of the phosphorus centre and of tenofovir free acid',
          description:
            'Assay the tenofovir free acid starting material and, separately, establish the diastereomeric ratio at phosphorus. Tenofovir alafenamide is a single phosphorus diastereomer, and the other one is a distinct chemical entity with different hydrolysis kinetics, so this is an identity test rather than a purity refinement.',
          reagentsAndBuffer:
            'Tenofovir free acid reference standard, L-alanine isopropyl ester hydrochloride, chiral HPLC on a polysaccharide stationary phase, phosphorus-31 NMR for diastereomer ratio, Karl Fischer titration',
        },
        {
          id: 'taf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Phosphonoamidate coupling and diastereoselective resolution',
          description:
            'Activate the phosphonic acid and couple it to phenol and to L-alanine isopropyl ester, then resolve the two phosphorus diastereomers. Getting the wrong one is not an impurity problem that downstream purification fixes cheaply; it is half the yield lost to a compound that hydrolyses on a different timescale.',
          dependsOnStepId: 'taf-w1',
          reagentsAndBuffer:
            'Thionyl chloride or an equivalent activating agent, phenol, L-alanine isopropyl ester hydrochloride, triethylamine in dichloromethane under nitrogen, seeded crystallisation for diastereomer separation',
        },
        {
          id: 'taf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Fumarate salt formation and hydrolytic stability release testing',
          description:
            'Form the fumarate salt that is the marketed form and crystallise it, then run the release test that matters most for this molecule: how fast it hydrolyses in plasma against how fast it hydrolyses in a cell lysate. A batch that fails on plasma stability is a batch that behaves like the older prodrug.',
          dependsOnStepId: 'taf-w2',
          reagentsAndBuffer:
            'Fumaric acid in acetonitrile or isopropanol, water for recrystallisation, human plasma and PBMC lysate for parallel hydrolysis time courses, reversed-phase HPLC with UV and mass detection',
        },
        {
          id: 'taf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Loading of PBMCs and primary hepatocytes at matched extracellular concentrations',
          description:
            'Expose peripheral blood mononuclear cells and primary human hepatocytes to the prodrug and, in parallel wells, to tenofovir disoproxil at the same extracellular concentration. The whole claim for the molecule is an intracellular-to-plasma ratio, so the comparator has to run in the same plate on the same cells.',
          dependsOnStepId: 'taf-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs and cryopreserved primary human hepatocytes, RPMI-1640 with 10% foetal bovine serum, matched tenofovir disoproxil fumarate arm, cathepsin A inhibitor arm to confirm the activating enzyme',
        },
        {
          id: 'taf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Intracellular tenofovir diphosphate by LC-MS/MS and antiviral EC50',
          description:
            'Quantify tenofovir diphosphate inside the cell pellet by mass spectrometry, and measure antiviral potency against HIV-1 and against an HBV-replicating cell line in the same experiment. The two numbers together are the argument for the molecule: more active metabolite per unit of circulating parent drug.',
          dependsOnStepId: 'taf-w4',
          reagentsAndBuffer:
            'Stable-isotope-labelled tenofovir diphosphate internal standard, weak anion-exchange solid-phase extraction, LC-MS/MS in negative ion mode, HIV-1 NL4-3 reporter assay and HepG2.2.15 HBV DNA quantification',
        },
      ],
    },
    keyAudits: [
      {
        id: 'taf-a1',
        category: 'measured',
        title: 'HBeAg-negative hepatitis B: 94% against 93%, with a third of the bone loss',
        laymanSummary:
          'In 425 people with hepatitis B who did not carry the e antigen, 94% on tenofovir alafenamide had undetectable virus at 48 weeks against 93% on the older prodrug. The difference in bone density was much larger than the difference in virus.',
        technicalDetails:
          'GS-US-320-0108 (NCT01940341) randomised 426 HBeAg-negative patients 2:1 to tenofovir alafenamide 25 mg or tenofovir disoproxil fumarate 300 mg, double-blind, in 105 centres across 17 countries. At week 48, 268 of 285 (94%) versus 130 of 140 (93%) had HBV DNA below 29 IU/mL, difference 1.8% (95% CI -3.6 to 7.2, p=0.47), meeting the 10% non-inferiority margin. Mean percentage change in hip bone mineral density was -0.29% (95% CI -0.55 to -0.03) against -2.16% (-2.53 to -1.79), adjusted difference 1.87% (95% CI 1.42 to 2.32, p<0.0001); spine was -0.88% against -2.51%, adjusted difference 1.64% (95% CI 1.01 to 2.27, p<0.0001). Median change in estimated glomerular filtration rate was -1.8 mL/min (IQR -7.8 to 6.0) against -4.8 mL/min (-12.0 to 3.0), p=0.004, while the mean serum creatinine change did not differ (p=0.32).',
        evidenceSource:
          'Buti M et al., Lancet Gastroenterol Hepatol 2016;1:196-206 (GS-US-320-0108, NCT01940341)',
        doi: '10.1016/S2468-1253(16)30107-8',
        measuredMetric:
          'Proportion with HBV DNA below 29 IU/mL at week 48, plus mean percentage change in hip and spine bone mineral density and median change in eGFR',
        auditFlag: 'verified',
      },
      {
        id: 'taf-a2',
        category: 'measured',
        title: 'HBeAg-positive hepatitis B: 64% against 67%, non-inferior and numerically behind',
        laymanSummary:
          'In the harder half of hepatitis B, where people start with far more virus, 64% on the new prodrug reached undetectable against 67% on the old one. That is a negative point estimate that still passed the non-inferiority test, and it is worth stating plainly rather than rounding into a win.',
        technicalDetails:
          'GS-US-320-0110 (NCT01940471) randomised 875 HBeAg-positive patients 2:1 across 161 centres in 19 countries; 873 received treatment. At week 48, 371 of 581 (64%) on tenofovir alafenamide against 195 of 292 (67%) on tenofovir disoproxil fumarate had HBV DNA below 29 IU/mL, adjusted difference -3.6% (95% CI -9.8 to 2.6, p=0.25), within the prespecified 10% margin. Hip bone mineral density changed by -0.10% (95% CI -0.29 to 0.09) against -1.72% (-2.02 to -1.41), adjusted difference 1.62 (1.27 to 1.96, p<0.0001); spine -0.42% against -2.29%, adjusted difference 1.88 (1.44 to 2.31, p<0.0001). Mean serum creatinine rose 0.01 mg/dL against 0.03 mg/dL (p=0.02). Grade 3 or 4 laboratory abnormalities occurred in 32% and 33% of the two arms, most commonly ALT elevation.',
        evidenceSource:
          'Chan HLY et al., Lancet Gastroenterol Hepatol 2016;1:185-195 (GS-US-320-0110, NCT01940471)',
        doi: '10.1016/S2468-1253(16)30024-3',
        measuredMetric:
          'Proportion with HBV DNA below 29 IU/mL at week 48, adjusted difference -3.6% (95% CI -9.8 to 2.6)',
        auditFlag: 'verified',
      },
      {
        id: 'taf-a3',
        category: 'measured',
        title:
          'HIV-1, 1,733 treatment-naive patients: 92% against 90%, proteinuria down 3% against up 20%',
        laymanSummary:
          'The two trials that put tenofovir alafenamide into HIV combinations found 92% of patients suppressed at 48 weeks against 90% on the older prodrug. Protein leaking into urine, a marker of kidney tubule stress, fell slightly on the new drug and rose by a fifth on the old one.',
        technicalDetails:
          'Studies 104 and 111 (NCT01780506 and NCT01797445) recruited 1,744 treatment-naive adults from 178 centres in 16 countries and treated 1,733, randomised double-blind to elvitegravir-cobicistat-emtricitabine with either tenofovir alafenamide 10 mg or tenofovir disoproxil fumarate 300 mg. At week 48, 800 of 866 (92%) against 784 of 867 (90%) had HIV-1 RNA below 50 copies per millilitre, adjusted difference 2.0% (95% CI -0.7 to 4.7) against a 12% non-inferiority margin. Mean serum creatinine rose 0.08 against 0.12 mg/dL (p<0.0001); median percentage change in proteinuria was -3 against +20 (p<0.0001); spine bone mineral density changed -1.30% against -2.86% and hip -0.66% against -2.95% (both p<0.0001).',
        evidenceSource:
          'Sax PE et al., Lancet 2015;385:2606-2615 (Studies 104 and 111, NCT01780506 and NCT01797445)',
        doi: '10.1016/S0140-6736(15)60616-X',
        measuredMetric:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at week 48, plus prespecified renal and bone endpoints',
        auditFlag: 'verified',
      },
      {
        id: 'taf-a4',
        category: 'inferred',
        title: 'The registration paper says the surrogate is a surrogate, in its own conclusion',
        laymanSummary:
          'Every advantage this drug has over the cheap version is a laboratory measurement: bone density on a scan, creatinine and protein in urine. Nobody has run a trial big enough to see whether that turns into fewer broken bones or fewer people on dialysis, and the authors of the registration trial said so in print.',
        technicalDetails:
          'The interpretation section of the phase 3 HIV programme reads: "Although these studies do not have the power to assess clinical safety events such as renal failure and fractures, our data suggest that E/C/F/tenofovir alafenamide will have a favourable long-term renal and bone safety profile." The hepatitis B trials close the same way, with "longer term follow-up is needed to better understand the clinical impact of these changes." The measured quantities are real and consistently in the same direction across four randomised trials. The step from a 1.6 to 2.3 percentage-point difference in bone mineral density over 48 weeks to a difference in fracture incidence is an extrapolation, and the size of that extrapolation is what the price difference on this page is being charged for.',
        evidenceSource:
          'Sax PE et al., Lancet 2015;385:2606-2615, Interpretation; Buti M et al., Lancet Gastroenterol Hepatol 2016;1:196-206, Interpretation',
        doi: '10.1016/S0140-6736(15)60616-X',
        inferredClaim:
          'That smaller 48-week declines in bone mineral density and smaller changes in renal biomarkers translate into fewer fractures and fewer cases of renal failure',
        auditFlag: 'caution',
      },
      {
        id: 'taf-a5',
        category: 'failed',
        title:
          'In 15,678 randomised prevention participants, the harm being avoided was not visible',
        laymanSummary:
          'A meta-analysis pooled thirteen randomised prevention trials of the older tenofovir against placebo or no treatment. Fractures: 217 of 5,789 on the drug against 189 of 5,795 on control. Serious adverse events: 9.4% against 10.1%. The clinical events the newer prodrug was designed to prevent were not detectable in the largest randomised dataset that exists.',
        technicalDetails:
          'Pilkington, Hill and colleagues systematically reviewed 13 randomised pre-exposure prophylaxis trials covering 15,678 participants in relevant arms. Grade 3 or 4 adverse events occurred in 1,306 of 7,504 on treatment (17.4%) against 1,259 of 7,502 on control (16.8%), difference 0% (95% CI -1% to +2%). Serious adverse events were 740 of 7,843 (9.4%) against 795 of 7,835 (10.1%), difference 0% (95% CI -1% to +1%). Creatinine elevations were 8 of 7,843 against 4 of 7,835, difference 0% (95% CI 0% to 0%). Fractures were 217 of 5,789 against 189 of 5,795, difference 0% (95% CI 0% to 1%). This does not refute tenofovir disoproxil toxicity: the population is HIV-negative, mostly young, with normal renal function at entry and short follow-up, which is not the population in whom the classic tubulopathy is described. What it does is put a ceiling on how large the avoidable harm can be in the setting where the two prodrugs compete most directly and where the price gap is widest.',
        evidenceSource:
          'Pilkington V, Hill A, Hughes S, Nwokolo N, Pozniak A. J Virus Erad 2018;4:215-224',
        doi: '10.1016/S2055-6640(20)30312-5',
        measuredMetric:
          'Pooled incidence of fractures, creatinine elevations, grade 3/4 adverse events and serious adverse events across 13 randomised trials',
        auditFlag: 'contested',
      },
      {
        id: 'taf-a6',
        category: 'conclusion_shift',
        title:
          'Weight gain was blamed on tenofovir alafenamide, then a randomised switch trial removed it and nothing happened',
        laymanSummary:
          'Cohort studies and comparative trials found people on tenofovir alafenamide heavier than people on the older prodrug, and the drug acquired a reputation for causing weight gain. A randomised trial then took obese patients off it and off their integrase inhibitor for 48 weeks. Weight did not meaningfully move in any arm, and the differences between arms were compatible with zero.',
        technicalDetails:
          'ACTG A5391, the Do IT study (NCT04636437), randomised 147 people with HIV and obesity who were suppressed on an integrase inhibitor with tenofovir alafenamide and emtricitabine into three open-label arms: switch to doravirine with tenofovir alafenamide-emtricitabine, switch to doravirine with tenofovir disoproxil-emtricitabine, or continue. 145 initiated. Median entry BMI was 34.9 kg/m2 and median time on the starting regimen 3.4 years; 49% were female and 53% Black. At 48 weeks estimated mean weight change was -0.47% (95% CI -2.09 to 1.14), -2.73% (-4.22 to -1.23) and -1.84% (-3.37 to -0.30). The between-arm estimates were 1.36 percentage points (97.5% CI -1.20 to 3.92) for doravirine against integrase inhibitor with the same backbone, and -0.89 percentage points (-3.34 to 1.57) for the tenofovir disoproxil switch against continuing. The authors also report no treatment differences in fasting lipids, insulin resistance, fat mass or bone mineral density. A separate pilot switching people to doravirine-lamivudine-tenofovir disoproxil closed for futility after enrolling four of a planned 25, so the reversal question has been asked twice and answered once.',
        evidenceSource:
          'Koethe JR et al., Clin Infect Dis 2026;83:e81 (ACTG A5391 Do IT, NCT04636437); Tseng A et al., J Assoc Med Microbiol Infect Dis Can 2025',
        doi: '10.1093/cid/ciag196',
        inferredClaim:
          'That tenofovir alafenamide causes the weight gain associated with it, and that removing it reverses that weight',
        auditFlag: 'contested',
      },
      {
        id: 'taf-a7',
        category: 'measured',
        title: 'DISCOVER: 7 infections against 15, non-inferior, and not superior',
        laymanSummary:
          'The largest prevention trial randomised 5,387 people to one prodrug or the other. Seven people on tenofovir alafenamide acquired HIV against fifteen on tenofovir disoproxil. That looks like a win, but the confidence interval runs from 0.19 to 1.15, which includes no difference, so the trial proved non-inferiority and nothing more.',
        technicalDetails:
          'DISCOVER (NCT02842086) randomised 5,387 cisgender men who have sex with men and transgender women who have sex with men 1:1 across 94 clinics in Europe and North America, double-blind and double-dummy. Over 8,756 person-years, 22 participants acquired HIV: seven on emtricitabine-tenofovir alafenamide (0.16 per 100 person-years, 95% CI 0.06 to 0.33) against fifteen on emtricitabine-tenofovir disoproxil (0.34 per 100 person-years, 0.19 to 0.56). The incidence rate ratio was 0.47 (95% CI 0.19 to 1.15) against a prespecified non-inferiority margin of 1.62. Discontinuation for adverse events was 36 of 2,694 (1%) against 49 of 2,693 (2%). All six prespecified bone mineral density and renal biomarker endpoints favoured tenofovir alafenamide.',
        evidenceSource: 'Mayer KH et al., Lancet 2020;396:239-254 (DISCOVER, NCT02842086)',
        doi: '10.1016/S0140-6736(20)31065-5',
        measuredMetric:
          'Incident HIV infection, incidence rate ratio 0.47 (95% CI 0.19 to 1.15) over 8,756 person-years',
        auditFlag: 'verified',
      },
      {
        id: 'taf-a8',
        category: 'inferred',
        title: 'The prevention indication has a hole in it, and the label names the hole',
        laymanSummary:
          'DISCOVER enrolled cisgender men who have sex with men and transgender women. It enrolled no cisgender women. The FDA label therefore excludes people at risk from receptive vaginal sex, in writing, and that exclusion is not a caution: it means the question was never asked.',
        technicalDetails:
          'The Descovy prescribing information states the indication as pre-exposure prophylaxis "excluding individuals at risk from receptive vaginal sex", with the Limitations of Use section reading "The indication does not include use of DESCOVY in individuals at risk of HIV-1 from receptive vaginal sex because effectiveness in this population has not been evaluated." The pharmacological reason this matters is that tenofovir concentrations differ substantially between rectal and cervicovaginal tissue, so the tissue at risk is not the tissue the trial measured protection in, and the older prodrug has separate randomised data in women that this one does not. Emtricitabine-tenofovir disoproxil carries no such exclusion. This is the clearest case on the page of an inference that regulators declined to make, and it is worth noticing that the regulator drew the line the marketing would not have.',
        evidenceSource:
          'DESCOVY (emtricitabine and tenofovir alafenamide) prescribing information, NDA 208215, Drugs@FDA; Mayer KH et al., Lancet 2020;396:239-254',
        doi: '10.1016/S0140-6736(20)31065-5',
        inferredClaim:
          'That the prevention efficacy shown in cisgender men who have sex with men and transgender women extends to people at risk from receptive vaginal sex',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a wrapper that does not fall apart on the way',
        laymanDesc:
          'A small tablet, once a day. The active drug is sealed inside a chemical wrapper that is built to stay closed while it is in the bloodstream, which is the whole point of the molecule.',
        molecularDetail:
          'Tenofovir alafenamide is a phosphonoamidate prodrug: a phenol ester and an L-alanine isopropyl ester amidate mask the phosphonate that would otherwise keep the molecule out of cells. Plasma half-life of the intact prodrug is on the order of tens of minutes rather than the seconds that tenofovir disoproxil survives, and the practical consequence is that plasma tenofovir exposure falls by roughly 90% while the dose falls from 300 mg to 25 mg.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is opened by an enzyme that only lives inside the target cell',
        laymanDesc:
          'Once inside a T cell or a liver cell, a resident enzyme cuts the wrapper off and releases the drug where it is needed. Cells that are not targets never open it.',
        molecularDetail:
          'Cathepsin A performs the first hydrolysis in lymphoid cells and carboxylesterase 1 does it in hepatocytes, removing the alaninyl ester and triggering spontaneous loss of the phenol to give tenofovir monophosphate directly. The cell-type distribution of those two hydrolases is why the same molecule concentrates in CD4-positive T cells for HIV and in hepatocytes for hepatitis B, and why the drug is a P-glycoprotein substrate whose absorption is destroyed by rifampicin.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The cell adds phosphates until it looks like a DNA building block',
        laymanDesc:
          'The released drug is not active yet. The cell attaches phosphate groups to it, and the finished molecule is a near-perfect impostor of one of the four letters DNA is built from.',
        molecularDetail:
          'Tenofovir monophosphate is converted by nucleoside diphosphate kinase and adenylate kinase to tenofovir diphosphate, the pharmacologically active species, which is the analogue of deoxyadenosine triphosphate. The intracellular half-life of tenofovir diphosphate in PBMCs is long, on the order of days, which is the pharmacological basis for once-daily dosing and for the forgiveness of a missed dose.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The copying enzyme inserts it, and then cannot add anything after it',
        laymanDesc:
          'Reverse transcriptase picks it up as though it were a normal letter and stitches it into the growing chain. It has no attachment point on the far end, so the next letter can never be added and the copy stops there.',
        molecularDetail:
          'Tenofovir diphosphate competes with dATP for the polymerase active site and is incorporated. The acyclic phosphonomethoxypropyl linker carries no 3-prime hydroxyl, so obligate chain termination follows incorporation. The same chemistry works on HIV-1 reverse transcriptase and on the reverse transcriptase domain of the hepatitis B polymerase, which is why one molecule covers two viruses. The signature HIV resistance mutation is K65R, which reduces incorporation and carries a fitness cost.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus falls, and less free drug ever reaches the kidney or the skeleton',
        laymanDesc:
          'Viral load drops the way it does on the older prodrug. The measured difference is elsewhere: less of the active drug circulates past the kidney tubule and the bone, and the scans and urine tests show it.',
        molecularDetail:
          'Viral suppression was statistically indistinguishable from tenofovir disoproxil in all four registration trials. What differed were the surrogates: hip bone mineral density change of -0.29% against -2.16% in HBeAg-negative hepatitis B, proteinuria change of -3% against +20% in treatment-naive HIV. Free tenofovir is a substrate of the OAT1 and OAT3 transporters that concentrate it in the proximal tubule, so lowering plasma tenofovir lowers tubular loading, which is the mechanistic account of every one of those numbers.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'GS-US-320-0108 (NCT01940341)',
        phase: 'Phase 3, randomised 2:1, double-blind, non-inferiority, 48-week primary analysis',
        sampleSize: 425,
        primaryEndpoint:
          'Proportion with HBV DNA below 29 IU/mL at week 48 in HBeAg-negative chronic hepatitis B',
        endpointMet: true,
        statisticalPValue: '94% versus 93%, difference 1.8% (95% CI -3.6 to 7.2), p=0.47',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GS-US-320-0110 (NCT01940471)',
        phase: 'Phase 3, randomised 2:1, double-blind, non-inferiority, 48-week primary analysis',
        sampleSize: 873,
        primaryEndpoint:
          'Proportion with HBV DNA below 29 IU/mL at week 48 in HBeAg-positive chronic hepatitis B',
        endpointMet: true,
        statisticalPValue:
          '64% versus 67%, adjusted difference -3.6% (95% CI -9.8 to 2.6), p=0.25, within the 10% margin',
        unreportedAdverseSignals:
          'The point estimate favours the comparator. Non-inferiority was met, which is a different statement from equivalence, and the difference is reported here because rounding it away is how a non-inferiority result becomes a marketing claim.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Studies 104 and 111 (NCT01780506, NCT01797445)',
        phase: 'Two parallel phase 3, randomised, double-blind, non-inferiority trials, 48 weeks',
        sampleSize: 1733,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA below 50 copies per millilitre at week 48, FDA snapshot algorithm',
        endpointMet: true,
        statisticalPValue: '92% versus 90%, adjusted difference 2.0% (95% CI -0.7 to 4.7)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DISCOVER (NCT02842086)',
        phase: 'Phase 3, randomised, double-blind, active-controlled, non-inferiority',
        sampleSize: 5387,
        primaryEndpoint:
          'Incident HIV-1 infection, incidence rate ratio against emtricitabine-tenofovir disoproxil',
        endpointMet: true,
        statisticalPValue:
          'IRR 0.47 (95% CI 0.19 to 1.15) against a non-inferiority margin of 1.62; superiority not established',
        unreportedAdverseSignals:
          'No cisgender women were enrolled. The resulting FDA indication excludes individuals at risk from receptive vaginal sex, in the label text itself.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ACTG A5391 Do IT (NCT04636437)',
        phase: 'Phase 4, open-label, three-arm randomised switch trial, 48 weeks',
        sampleSize: 145,
        primaryEndpoint:
          'Percentage change in body weight at 48 weeks after switching off an integrase inhibitor, off tenofovir alafenamide, or both, in people with HIV and obesity',
        endpointMet: false,
        statisticalPValue:
          'Between-arm difference 1.36 percentage points (97.5% CI -1.20 to 3.92) and -0.89 (-3.34 to 1.57); no arm showed a clinically meaningful change',
        unreportedAdverseSignals:
          'The trial also found no treatment differences in fasting lipids, insulin resistance, fat mass or bone mineral density, which is a null result on bone in a head-to-head prodrug comparison and sits awkwardly beside the registration data.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '94% against 93% below 29 IU/mL at week 48 in HBeAg-negative hepatitis B (difference 1.8%, 95% CI -3.6 to 7.2), and 64% against 67% in HBeAg-positive disease (adjusted difference -3.6%, 95% CI -9.8 to 2.6)',
        '92% against 90% below 50 copies per millilitre at week 48 across 1,733 treatment-naive HIV-1 patients (adjusted difference 2.0%, 95% CI -0.7 to 4.7)',
        'Hip bone mineral density change of -0.29% against -2.16% and proteinuria change of -3% against +20%, consistently across four randomised trials',
        'Seven HIV infections against fifteen over 8,756 person-years in DISCOVER, incidence rate ratio 0.47 (95% CI 0.19 to 1.15)',
      ],
      unsupportedInferences: [
        'That the bone-density and renal-biomarker differences translate into fewer fractures or fewer cases of renal failure — the registration paper states in its own Interpretation that it was not powered to assess either',
        'That DISCOVER efficacy extends to people at risk from receptive vaginal sex, an inference the FDA label explicitly declines to make',
        'That tenofovir alafenamide causes the weight gain attributed to it, which a randomised 48-week switch trial did not reverse by removing it',
      ],
      whatFailedInitially: [
        'A meta-analysis of 13 randomised prevention trials in 15,678 participants found no detectable difference in fractures (217/5,789 against 189/5,795) or creatinine elevations for the older prodrug against control',
        'The HBeAg-positive registration trial produced a negative point estimate, -3.6%, that passed non-inferiority and is routinely quoted as if the two arms had tied',
      ],
      realWorldOutcome: [
        'The tenofovir component of Genvoya, Descovy, Odefsey and Biktarvy, and the single-agent hepatitis B tablet Vemlidy',
        'Sold at US$74.94 per tablet at United States pharmacy acquisition cost while generic tenofovir disoproxil, which delivers the identical active molecule, sits at US$0.5051',
        'Licensed to the Medicines Patent Pool for generic manufacture in low-income and lower-middle-income countries, so the price gap is a licence boundary rather than a manufacturing one',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, as a single agent and as a component of fixed-dose combinations',
      description:
        'Taken once daily. Absorption depends on P-glycoprotein, so strong inducers such as rifampicin, rifabutin, carbamazepine and St John wort lower exposure enough that co-administration is contraindicated or not recommended on the label. Unlike tenofovir disoproxil it is used down to a creatinine clearance of 15 mL/min in the approved combinations.',
      safetyProfile:
        'Severe acute exacerbation of hepatitis B on discontinuation is a boxed warning on every tenofovir product, and hepatic function must be monitored after stopping. Lactic acidosis and severe hepatomegaly with steatosis are labelled class effects of nucleoside analogues. Bone mineral density falls less than on tenofovir disoproxil but still falls. LDL cholesterol and total cholesterol run higher than on tenofovir disoproxil, and body weight runs higher; whether that reflects a lipid-raising and weight-raising effect of this drug or the loss of a lipid-lowering and weight-suppressing effect of the older one is not settled.',
    },
    commonQuestions: [
      {
        q: 'Is the newer tenofovir actually better, or just newer?',
        a: 'It is measurably different and the direction of the difference is consistent. Across four randomised trials it lost less bone mineral density, raised creatinine less and shifted proteinuria the other way. What has never been shown is that any of those differences produces a difference in something a person experiences: a fracture, a hospital admission, dialysis. The Lancet paper that established the HIV indication says this in its own conclusion, in the sentence beginning "although these studies do not have the power to assess clinical safety events such as renal failure and fractures". The gap between a surrogate that moves and an outcome that changes is where the price difference on this page lives.',
        auditNote:
          'This is the central audit on this record. The measurement is solid; the extrapolation from it is what is being sold.',
      },
      {
        q: 'Why is the generic version 148 times cheaper for the same active drug?',
        a: 'Because the active drug is not what is patented. Tenofovir, the molecule that terminates the viral DNA chain, is identical in both products and came off patent in the United States in 2017. What is protected is the wrapper: the phosphonoamidate that survives plasma and is cut open inside the cell. That wrapper is a real piece of chemistry and it does change where the drug goes. Whether it changes what happens to a patient is the question above, which is unanswered. Both numbers on this page are pharmacy acquisition costs from the same CMS survey, so they are directly comparable to each other and neither is what a patient is charged.',
      },
      {
        q: 'Does it cause weight gain?',
        a: 'Less clearly than its reputation suggests. People on tenofovir alafenamide weigh more than people on tenofovir disoproxil in cohort after cohort, and that observation is not in dispute. What is in dispute is which drug is doing it. A randomised trial in 145 obese people with HIV took them off tenofovir alafenamide, off their integrase inhibitor, or off both, and after 48 weeks weight had not meaningfully moved in any arm: the between-arm estimates were 1.36 percentage points (97.5% CI -1.20 to 3.92) and -0.89 (-3.34 to 1.57). The competing explanation, which that trial does not rule out either, is that tenofovir disoproxil actively suppresses weight and lowers LDL, so the comparison makes a weight-neutral drug look like a weight-gaining one.',
        auditNote:
          'A drug can be associated with weight without causing it, and removing it can fail to reverse weight it did cause. This trial separates neither cleanly, and saying so is more accurate than picking a side.',
      },
      {
        q: 'Can it be used for HIV prevention by anyone?',
        a: 'No, and the restriction is written into the label rather than being a clinical opinion. Descovy is indicated for pre-exposure prophylaxis "excluding individuals at risk from receptive vaginal sex", because DISCOVER enrolled only cisgender men who have sex with men and transgender women who have sex with men. Tenofovir concentrations in cervicovaginal tissue differ from those in rectal tissue, so this is not a formality. The older combination, emtricitabine with tenofovir disoproxil, has randomised data in women and carries no such exclusion.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for tenofovir alafenamide could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and putting an estimate in that field would mean this page inventing a number. What is shown instead is the United States pharmacy acquisition cost from the CMS NADAC file, alongside the same figure for the generic prodrug of the same active molecule, which is the comparison that actually carries information.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Buti M, Gane E, Seto WK, et al. Tenofovir alafenamide versus tenofovir disoproxil fumarate for the treatment of patients with HBeAg-negative chronic hepatitis B virus infection: a randomised, double-blind, phase 3, non-inferiority trial. Lancet Gastroenterol Hepatol 2016;1:196-206',
        identifier: '10.1016/S2468-1253(16)30107-8',
        kind: 'doi',
      },
      {
        label:
          'Chan HLY, Fung S, Seto WK, et al. Tenofovir alafenamide versus tenofovir disoproxil fumarate for the treatment of HBeAg-positive chronic hepatitis B virus infection: a randomised, double-blind, phase 3, non-inferiority trial. Lancet Gastroenterol Hepatol 2016;1:185-195',
        identifier: '10.1016/S2468-1253(16)30024-3',
        kind: 'doi',
      },
      {
        label:
          'Agarwal K, Brunetto M, Seto WK, et al. 96 weeks treatment of tenofovir alafenamide vs. tenofovir disoproxil fumarate for hepatitis B virus infection. J Hepatol 2018;68:672-681',
        identifier: '10.1016/j.jhep.2017.11.039',
        kind: 'doi',
      },
      {
        label:
          'Sax PE, Wohl D, Yin MT, et al. Tenofovir alafenamide versus tenofovir disoproxil fumarate, coformulated with elvitegravir, cobicistat, and emtricitabine, for initial treatment of HIV-1 infection: two randomised, double-blind, phase 3, non-inferiority trials. Lancet 2015;385:2606-2615',
        identifier: '10.1016/S0140-6736(15)60616-X',
        kind: 'doi',
      },
      {
        label:
          'Mayer KH, Molina JM, Thompson MA, et al. Emtricitabine and tenofovir alafenamide vs emtricitabine and tenofovir disoproxil fumarate for HIV pre-exposure prophylaxis (DISCOVER): primary results from a randomised, double-blind, multicentre, active-controlled, phase 3, non-inferiority trial. Lancet 2020;396:239-254',
        identifier: '10.1016/S0140-6736(20)31065-5',
        kind: 'doi',
      },
      {
        label:
          'Pilkington V, Hill A, Hughes S, Nwokolo N, Pozniak A. How safe is TDF/FTC as PrEP? A systematic review and meta-analysis of the risk of adverse events in 13 randomised trials of PrEP. J Virus Erad 2018;4:215-224',
        identifier: '10.1016/S2055-6640(20)30312-5',
        kind: 'doi',
      },
      {
        label:
          'Koethe JR, Lake JE, Kantor A, et al. A 48-week, randomized controlled trial of doravirine for individuals with HIV and obesity on integrase inhibitors and tenofovir alafenamide: the Do IT study (ACTG A5391). Clin Infect Dis 2026;83:e81',
        identifier: '10.1093/cid/ciag196',
        kind: 'doi',
      },
      {
        label:
          'Tseng A, Loutfy M, Thai L, Walmsley S. Can switching to doravirine/lamivudine/tenofovir DF halt or reverse INSTI-associated weight gain? J Assoc Med Microbiol Infect Dis Can 2025',
        identifier: '10.3138/jammi-2025-0016',
        kind: 'doi',
      },
      {
        label:
          'GS-US-320-0108: tenofovir alafenamide versus tenofovir disoproxil fumarate in HBeAg-negative chronic hepatitis B',
        identifier: 'NCT01940341',
        kind: 'nct',
      },
      {
        label:
          'GS-US-320-0110: tenofovir alafenamide versus tenofovir disoproxil fumarate in HBeAg-positive chronic hepatitis B',
        identifier: 'NCT01940471',
        kind: 'nct',
      },
      {
        label:
          'Study 104: E/C/F/tenofovir alafenamide versus E/C/F/tenofovir disoproxil fumarate in treatment-naive adults',
        identifier: 'NCT01780506',
        kind: 'nct',
      },
      {
        label:
          'Study 111: E/C/F/tenofovir alafenamide versus E/C/F/tenofovir disoproxil fumarate in treatment-naive adults',
        identifier: 'NCT01797445',
        kind: 'nct',
      },
      {
        label:
          'DISCOVER: emtricitabine-tenofovir alafenamide versus emtricitabine-tenofovir disoproxil fumarate for pre-exposure prophylaxis',
        identifier: 'NCT02842086',
        kind: 'nct',
      },
      {
        label:
          'ACTG A5391 Do IT: doravirine for people with HIV and obesity on integrase inhibitors and tenofovir alafenamide',
        identifier: 'NCT04636437',
        kind: 'nct',
      },
      {
        label:
          'VEMLIDY (tenofovir alafenamide) — Drugs@FDA application NDA 208464, Gilead Sciences',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208464',
        kind: 'regulatory',
      },
      {
        label:
          'DESCOVY (emtricitabine and tenofovir alafenamide) — Drugs@FDA application NDA 208215, Gilead Sciences; the prescribing information carries the receptive-vaginal-sex limitation of use',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=208215',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 9574768 — tenofovir alafenamide structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9574768',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Tenofovir disoproxil — the backbone of global HIV treatment and prevention, whose
  //    registration trial missed its own primary equivalence margin and whose two failed prevention
  //    trials failed for a reason that was not the drug.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'tenofovir-disoproxil',
    name: 'Tenofovir Disoproxil',
    tradeName: 'Viread; also the tenofovir component of Truvada and Atripla',
    sponsor: 'Gilead Sciences Inc.',
    targetGene:
      'HIV-1 pol, reverse transcriptase coding region; hepatitis B virus P gene, reverse transcriptase domain',
    targetProtein:
      'HIV-1 reverse transcriptase and hepatitis B virus polymerase, chain-terminated by tenofovir diphosphate competing with dATP',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults and paediatric patients weighing at least 17 kg; for chronic hepatitis B virus infection in adults and children aged at least 2 years; and, as the fixed-dose combination with emtricitabine, for pre-exposure prophylaxis in at-risk adults and adolescents',
    patientFriendlyIndication: 'HIV-1 infection, HIV prevention, and chronic hepatitis B',
    anatomicalSite:
      'Cytoplasm of CD4-positive T cells and hepatocytes, with the proximal renal tubule as the site of the characteristic toxicity',
    conditionContext: {
      conditionExplainer:
        'The same molecule, tenofovir, jams the copying enzyme of two unrelated viruses: the reverse transcriptase HIV-1 uses to turn its RNA into DNA, and the reverse transcriptase domain of the hepatitis B polymerase. This is the older of the two wrappers built to get that molecule into cells, and it is the one most of the world actually takes.',
      whyItMatters:
        'Tenofovir disoproxil is the single most widely used antiretroviral molecule on earth. It is in the WHO-recommended first-line combination taken across sub-Saharan Africa, it is the backbone of the first drug approved anywhere for HIV prevention, and it is a first-line hepatitis B treatment. Its patent expired, so it costs about half a United States dollar per tablet at pharmacy acquisition cost.',
      whoTakesThis:
        'People taking generic tenofovir-lamivudine-dolutegravir, the WHO first-line regimen; people taking emtricitabine-tenofovir disoproxil for pre-exposure prophylaxis; and adults and children with chronic hepatitis B.',
      clinicalGoals:
        'In HIV, plasma RNA below 50 copies per millilitre and kept there. In hepatitis B, HBV DNA suppression sustained long enough that liver fibrosis regresses. In prevention, not acquiring HIV.',
    },
    oneSentenceVerdict:
      'A prodrug of tenofovir that terminates the DNA chain of both HIV-1 and hepatitis B; it drove 84% of treatment-naive patients below 400 copies per millilitre against 73% on the zidovudine regimen it replaced, reversed cirrhosis on repeat biopsy in 74 of 96 hepatitis B patients who had it at baseline, and cut HIV acquisition by 67% in serodiscordant couples who took it — and by nothing at all in two large trials where blood levels showed most participants did not.',
    laymanHowItWorks:
      'The active drug, tenofovir, is an impostor version of one of the four chemical letters that DNA is built from. The copying enzymes of HIV and of hepatitis B both pick it up and stitch it into the growing chain, and then discover there is nowhere to attach the next letter, so the copy stops dead. Tenofovir on its own cannot get into a cell, so it is given inside a wrapper that dissolves in the bloodstream within seconds and releases it. That is why a 300 mg dose is needed, and why free drug passes through the kidney tubule on its way out.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.5051 per tablet at United States pharmacy acquisition cost, median across 35 listed generic products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The United States patent expired and the market went generic in 2017, which is why 35 separate products carry a NADAC line. The successor prodrug of the same active molecule, tenofovir alafenamide, remains on patent and lists at US$74.94 per tablet in the same survey. Both figures are pharmacy acquisition costs from one dataset and are directly comparable to each other.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The competition for this molecule is its own successor prodrug, which delivers the identical active drug at 148 times the price, and abacavir, which is a genuinely different backbone with a genuinely different risk. For hepatitis B the alternative is entecavir.',
      conventionalRx: [
        {
          name: 'Tenofovir alafenamide',
          class: 'Nucleotide reverse transcriptase inhibitor, the later prodrug of tenofovir',
          howItCompares:
            'The same active molecule in a wrapper that survives plasma and opens inside the cell. Viral suppression was statistically indistinguishable in every head-to-head trial. It loses less bone mineral density and shifts renal biomarkers less; whether that becomes fewer fractures or fewer cases of renal failure has never been tested, and the registration paper says so.',
          typicalCost:
            'US$74.94 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 29 June 2026)',
          prosAndCons:
            'Pros: smaller bone and renal biomarker changes, usable down to a creatinine clearance of 15 mL/min. Cons: no generic in high-income markets, higher LDL cholesterol, and more weight than on this drug.',
        },
        {
          name: 'Abacavir (generic)',
          class: 'Nucleoside reverse transcriptase inhibitor, guanosine analogue',
          howItCompares:
            'A different backbone with no renal or bone signal, but it requires HLA-B*5701 testing before first use because carriers develop a hypersensitivity reaction that can be fatal on rechallenge, and it has no hepatitis B activity.',
          typicalCost:
            'US$0.5380 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: no kidney or bone effect, usable at low creatinine clearance, similarly cheap. Cons: mandatory genetic test, no hepatitis B cover, and an unresolved argument about myocardial infarction risk.',
        },
        {
          name: 'Entecavir (generic), for chronic hepatitis B only',
          class: 'Nucleoside analogue, guanosine',
          howItCompares:
            'The other first-line hepatitis B nucleoside, with a comparable resistance barrier in treatment-naive patients and a much lower one in patients with prior lamivudine resistance. It has no useful HIV activity, so unrecognised HIV co-infection can select resistance.',
          typicalCost:
            'Not quoted here; the CMS NADAC line for entecavir was not read at the time of writing',
          prosAndCons:
            'Pros: no renal or bone signal of the tenofovir kind. Cons: fails in lamivudine-experienced patients, and cannot be used as monotherapy in anyone who might have HIV.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@H](CN1C=NC2=C(N=CN=C21)N)OCP(=O)(OCOC(=O)OC(C)C)OCOC(=O)OC(C)C',
      chemicalFormula: 'C19H30N5O10P',
      molecularWeight: '519.40 g/mol (free base); dispensed as tenofovir disoproxil fumarate',
      targetReceptorAffinity:
        'The prodrug binds nothing. The active species is tenofovir diphosphate, an acyclic analogue of deoxyadenosine triphosphate that competes at the polymerase active site and terminates the chain because the phosphonomethoxypropyl linker carries no 3-prime hydroxyl. The two isopropyloxycarbonyloxymethyl esters are cleaved by plasma esterases within seconds of absorption, which is the property that both enables oral delivery and puts free tenofovir into the circulation, where organic anion transporters OAT1 and OAT3 concentrate it in the proximal renal tubule.',
      structureSource: {
        label: 'PubChem CID 5481350 (tenofovir disoproxil) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5481350',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tdf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and enantiomeric control of (R)-PMPA',
          description:
            'Confirm identity and enantiomeric purity of tenofovir free acid, the (R)-9-(2-phosphonomethoxypropyl)adenine that carries all the antiviral activity. The (S)-enantiomer is inactive, and enantiomeric impurity introduced here survives every downstream step because the esterification is not stereoselective.',
          reagentsAndBuffer:
            'Tenofovir free acid reference standard, chiral HPLC on a polysaccharide stationary phase, phosphorus-31 NMR, ion chromatography for residual phosphite, Karl Fischer titration',
        },
        {
          id: 'tdf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bis-alkylation of the phosphonate to the disoproxil diester',
          description:
            'Alkylate both phosphonate oxygens with chloromethyl isopropyl carbonate to give the bis(isopropyloxycarbonyloxymethyl) ester. The reaction has to be pushed to the bis-ester and stopped there: the mono-ester is a distinct impurity that is far more polar, orally useless, and a known degradation product of the finished drug.',
          dependsOnStepId: 'tdf-w1',
          reagentsAndBuffer:
            'Chloromethyl isopropyl carbonate, triethylamine or N,N-diisopropylethylamine in N-methylpyrrolidone, tetrabutylammonium bromide as phase-transfer catalyst, under nitrogen with strict moisture exclusion',
        },
        {
          id: 'tdf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Fumarate salt formation and hydrolytic degradation profiling',
          description:
            'Form and crystallise the fumarate salt, then run the stability test that defines this molecule: the rate at which the carbonate esters hydrolyse back to mono-ester and free tenofovir under accelerated conditions. The molecule is designed to be unstable in plasma, which means the formulation has to stop it being unstable in the bottle.',
          dependsOnStepId: 'tdf-w2',
          reagentsAndBuffer:
            'Fumaric acid in isopropanol, controlled-humidity crystallisation, accelerated stability chambers at 40 degrees Celsius and 75% relative humidity, reversed-phase HPLC with UV detection for mono-ester and free tenofovir',
        },
        {
          id: 'tdf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'PBMC loading with a matched free-tenofovir control arm',
          description:
            'Expose peripheral blood mononuclear cells to the prodrug and, in parallel wells, to free tenofovir at the same extracellular concentration. The comparison is the point: free tenofovir barely enters, and the fold difference in intracellular loading is the entire justification for the prodrug.',
          dependsOnStepId: 'tdf-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum, matched free tenofovir arm, human serum esterase-inhibited arm to confirm the activating hydrolysis',
        },
        {
          id: 'tdf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Intracellular tenofovir diphosphate and dual antiviral potency',
          description:
            'Quantify tenofovir diphosphate in the cell pellet by mass spectrometry and measure antiviral potency against HIV-1 and against an HBV-replicating hepatoma line in the same run. Dried blood spot tenofovir diphosphate, measured the same way, is the assay that turned the failed prevention trials from a drug result into an adherence result.',
          dependsOnStepId: 'tdf-w4',
          reagentsAndBuffer:
            'Stable-isotope-labelled tenofovir diphosphate internal standard, weak anion-exchange solid-phase extraction, LC-MS/MS in negative ion mode, HIV-1 NL4-3 reporter assay, HepG2.2.15 HBV DNA quantification',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tdf-a1',
        category: 'measured',
        title: 'Study 934: 84% against 73%, and superior rather than merely non-inferior',
        laymanSummary:
          'Against the zidovudine-based regimen that was standard at the time, tenofovir with emtricitabine and efavirenz suppressed more people, raised CD4 counts more, and drove fewer people off treatment with side effects. It was designed to prove it was no worse and it proved it was better.',
        technicalDetails:
          'Study 934 (NCT00112047) was an open-label non-inferiority trial in 517 treatment-naive patients randomised to tenofovir disoproxil fumarate with emtricitabine and efavirenz once daily, or to fixed-dose zidovudine-lamivudine twice daily with efavirenz. At week 48, 84% against 73% had HIV-1 RNA below 400 copies per millilitre (95% CI for the difference 4 to 19, p=0.002), crossing from non-inferiority into superiority. Below 50 copies per millilitre the figures were 80% against 70% (95% CI 2 to 17, p=0.02). Mean CD4 increase was 190 against 158 cells per cubic millimetre (95% CI 9 to 55, p=0.002). Adverse events causing discontinuation occurred in 4% against 9% (p=0.02). The K65R mutation, the signature tenofovir resistance change, developed in no patient in either arm.',
        evidenceSource: 'Gallant JE et al., N Engl J Med 2006;354:251-260 (Study 934, NCT00112047)',
        doi: '10.1056/NEJMoa051871',
        measuredMetric:
          'Proportion with HIV-1 RNA below 400 copies per millilitre at week 48 without baseline efavirenz resistance',
        auditFlag: 'verified',
      },
      {
        id: 'tdf-a2',
        category: 'failed',
        title:
          'Study 903 missed its own primary equivalence margin, and was rescued by a secondary',
        laymanSummary:
          'The three-year trial against stavudine set an equivalence limit of ten percentage points and then produced a confidence interval running to minus 10.4. It failed its primary analysis. Equivalence was then demonstrated on the secondary analysis at a stricter viral load threshold, and that is the result everyone quotes.',
        technicalDetails:
          'Study 903 randomised 602 antiretroviral-naive patients at 81 centres to tenofovir disoproxil fumarate or stavudine, each with lamivudine and efavirenz, double-blind. In the primary intention-to-treat analysis at week 48, 239 of 299 (80%) on tenofovir against 253 of 301 (84%) on stavudine had HIV-1 RNA below 400 copies per millilitre, 95% CI -10.4% to 1.5%, which the paper states exceeded the predefined -10% equivalence limit. Equivalence was demonstrated in the secondary analyses at the 50 copies per millilitre threshold at week 48 and through 144 weeks. Through 144 weeks the K65R mutation emerged in 8 tenofovir patients against 2 on stavudine (p=0.06). The trial produced the finding that made tenofovir the backbone drug it became, and it was a metabolic one: triglycerides rose 1 mg/dL against 134 mg/dL, total cholesterol 30 against 58 mg/dL, and investigator-reported lipodystrophy occurred in 9 of 299 (3%) against 58 of 301 (19%), p<0.001. Fracture counts and renal safety were similar between arms.',
        evidenceSource: 'Gallant JE et al., JAMA 2004;292:191-201 (Study 903)',
        doi: '10.1001/jama.292.2.191',
        measuredMetric:
          'Proportion below 400 copies per millilitre at week 48, 95% CI -10.4% to 1.5% against a -10% equivalence limit',
        auditFlag: 'caution',
      },
      {
        id: 'tdf-a3',
        category: 'measured',
        title: 'Hepatitis B: 76% suppressed against 13% on the drug it replaced',
        laymanSummary:
          'In hepatitis B patients carrying the e antigen, tenofovir drove three quarters below the detection threshold at 48 weeks against one in eight on adefovir. That is one of the largest margins any antiviral has produced against an active comparator.',
        technicalDetails:
          'Two double-blind phase 3 trials (NCT00116805 in HBeAg-negative disease, NCT00117676 in HBeAg-positive disease) randomised patients 2:1 to tenofovir disoproxil fumarate 300 mg or adefovir dipivoxil 10 mg for 48 weeks. The composite primary endpoint of HBV DNA below 400 copies per millilitre with histological improvement favoured tenofovir in both studies (p<0.001). Viral suppression alone was 93% against 63% in HBeAg-negative patients (p<0.001) and 76% against 13% in HBeAg-positive patients (p<0.001). Alanine aminotransferase normalised in 68% against 54% of HBeAg-positive patients (p=0.03) and hepatitis B surface antigen was lost in 3% against 0% (p=0.02). No amino acid substitution conferring phenotypic resistance to tenofovir developed in any patient at week 48, and the response was the same in lamivudine-experienced patients as in lamivudine-naive ones.',
        evidenceSource:
          'Marcellin P et al., N Engl J Med 2008;359:2442-2455 (NCT00116805, NCT00117676)',
        doi: '10.1056/NEJMoa0802878',
        measuredMetric:
          'Proportion with HBV DNA below 400 copies per millilitre at week 48, and histological improvement on paired biopsy',
        auditFlag: 'verified',
      },
      {
        id: 'tdf-a4',
        category: 'measured',
        title: 'Cirrhosis reversed on repeat biopsy in 74% of those who had it at baseline',
        laymanSummary:
          'This is the rarest kind of evidence in this repository: not a blood marker but a piece of liver, taken twice, five years apart, and read for scarring. Of 96 patients who had cirrhosis at the start, 71 no longer did. Three of 252 without cirrhosis developed it.',
        technicalDetails:
          'Patients from the two 48-week randomised hepatitis B trials entered a seven-year open-label extension with a prespecified repeat liver biopsy at week 240. Of 641 who received randomised treatment, 585 (91%) entered the open-label phase and 489 (76%) completed 240 weeks; 348 (54%) had biopsy results at both baseline and week 240. Histological improvement, defined as a reduction of at least 2 points in the Knodell necroinflammatory score without worsening fibrosis, occurred in 304 of 348 (87%), and fibrosis regression of at least 1 Ishak unit in 176 of 348 (51%), p<0.0001. Of the 96 patients (28%) with Ishak score 5 or 6 at baseline, 71 (74%) no longer met the cirrhosis threshold, while 3 of 252 without baseline cirrhosis progressed to it, p<0.0001. Virological breakthrough was infrequent and was not attributable to tenofovir resistance. The honest limit on this result is that the 348 patients biopsied twice are a little over half of those randomised, and the extension arm was open-label with no comparator.',
        evidenceSource: 'Marcellin P et al., Lancet 2013;381:468-475',
        doi: '10.1016/S0140-6736(12)61425-1',
        measuredMetric:
          'Paired liver biopsy at baseline and week 240: Knodell necroinflammatory score and Ishak fibrosis stage',
        auditFlag: 'verified',
      },
      {
        id: 'tdf-a5',
        category: 'measured',
        title: 'Prevention where it was taken: 44% in iPrEx, 67% and 75% in Partners PrEP',
        laymanSummary:
          'Two placebo-controlled trials established that a daily tablet stops HIV being acquired. In men who have sex with men and transgender women the reduction was 44%. In heterosexual serodiscordant couples in Kenya and Uganda it was 67% for tenofovir alone and 75% with emtricitabine added.',
        technicalDetails:
          'iPrEx (NCT00458393) randomised 2,499 HIV-seronegative men and transgender women who have sex with men to daily emtricitabine-tenofovir disoproxil or placebo, followed for 3,324 person-years. 100 infections occurred during follow-up, 36 in the active group against 64 on placebo, a 44% reduction (95% CI 15 to 63, p=0.005). Partners PrEP (NCT00557245) enrolled 4,758 serodiscordant heterosexual couples and followed 4,747; 82 infections occurred, 17 on tenofovir (0.65 per 100 person-years), 13 on tenofovir-emtricitabine (0.50) and 52 on placebo (1.99), relative reductions of 67% (95% CI 44 to 81, p<0.001) and 75% (95% CI 55 to 87, p<0.001). The difference between the two active arms was not significant (p=0.23), and both reduced incidence in men and in women.',
        evidenceSource:
          'Grant RM et al., N Engl J Med 2010;363:2587-2599 (iPrEx, NCT00458393); Baeten JM et al., N Engl J Med 2012;367:399-410 (Partners PrEP, NCT00557245)',
        doi: '10.1056/NEJMoa1011205',
        measuredMetric:
          'Incident HIV-1 infection against placebo: 44% (95% CI 15 to 63), 67% (44 to 81) and 75% (55 to 87)',
        auditFlag: 'verified',
      },
      {
        id: 'tdf-a6',
        category: 'failed',
        title: 'Two large prevention trials in African women reported no effect at all',
        laymanSummary:
          'FEM-PrEP randomised 2,120 women and found no difference. VOICE randomised 5,029 and produced a point estimate of minus 49% for tenofovir alone, meaning the drug arm did numerically worse than placebo. Both trials stopped early. In both, the drug was measured in blood and found in fewer than a third of samples.',
        technicalDetails:
          'FEM-PrEP (NCT00625404) randomised 2,120 HIV-negative women in Kenya, South Africa and Tanzania to daily emtricitabine-tenofovir disoproxil or placebo. 33 infections occurred in the active group (4.7 per 100 person-years) against 35 on placebo (5.0), hazard ratio 0.94 (95% CI 0.59 to 1.52, p=0.81). The trial was stopped on 18 April 2011 for lack of efficacy. Fewer than 40% of uninfected women in the active group had evidence of recent pill use at visits matched to the infection window. VOICE (NCT00705679) randomised 5,029 women in South Africa, Uganda and Zimbabwe to oral tenofovir, oral tenofovir-emtricitabine, tenofovir vaginal gel or placebo, with 312 infections over 5,509 person-years. Modified intention-to-treat effectiveness was -49.0% for tenofovir (hazard ratio 1.49, 95% CI 0.97 to 2.29), -4.4% for tenofovir-emtricitabine (1.04, 0.73 to 1.49) and 14.5% for the gel (0.85, 0.61 to 1.21). Tenofovir was detected in 30%, 29% and 25% of sampled plasma. Detection was negatively associated with the characteristics that predicted acquisition, meaning the women at highest risk were the least likely to have drug on board.',
        evidenceSource:
          'Van Damme L et al., N Engl J Med 2012;367:411-422 (FEM-PrEP, NCT00625404); Marrazzo JM et al., N Engl J Med 2015;372:509-518 (VOICE, NCT00705679)',
        doi: '10.1056/NEJMoa1202614',
        measuredMetric:
          'Incident HIV-1 infection by intention to treat: hazard ratio 0.94 (95% CI 0.59 to 1.52) and 1.49 (0.97 to 2.29)',
        auditFlag: 'verified',
      },
      {
        id: 'tdf-a7',
        category: 'conclusion_shift',
        title:
          'The field read those failures as "the drug does not work in women", then re-read them as "the pills were not taken"',
        laymanSummary:
          'For a period after FEM-PrEP and VOICE, the working conclusion was that oral prevention did not protect African women, and biological explanations were proposed for why. The re-reading came from the drug concentrations measured inside the same trials, and from Partners PrEP, which ran in the same region, enrolled women, and worked.',
        technicalDetails:
          'The two failures are intention-to-treat results and are correct as such: randomised to the drug, those women were not protected. The re-reading rests on measured quantities rather than on argument. VOICE detected tenofovir in 30% or fewer of plasma samples in each active arm. FEM-PrEP found recent pill use in fewer than 40%. iPrEx found study drug in 51% of seronegative participants against 9% of those who acquired HIV (p<0.001), which is the same relationship measured in the trial that succeeded. Partners PrEP, in the same geography with a couples-based design and high adherence, produced 67% and 75% reductions and reduced incidence in women specifically. What is measured, then, is that protection tracks drug concentration. What remains an inference is the counterfactual: that these particular trials would have shown efficacy had adherence been high, which no analysis of an unrandomised subgroup can establish. Both statements need to be on the page. Retiring the first conclusion was right; treating the adherence account as though it were a randomised finding is a second mistake in the opposite direction.',
        evidenceSource:
          'Marrazzo JM et al., N Engl J Med 2015;372:509-518; Van Damme L et al., N Engl J Med 2012;367:411-422; Grant RM et al., N Engl J Med 2010;363:2587-2599',
        doi: '10.1056/NEJMoa1402269',
        inferredClaim:
          'That FEM-PrEP and VOICE would have demonstrated efficacy if participants had taken the tablets — supported by measured drug concentrations, but a counterfactual that no randomised comparison in those trials tested',
        auditFlag: 'contested',
      },
      {
        id: 'tdf-a8',
        category: 'inferred',
        title: 'The renal and bone toxicity is real, labelled, and smaller than the reputation',
        laymanSummary:
          'Tenofovir disoproxil damages the kidney tubule in some people and that is on the label. But when it was given to thousands of HIV-negative adults with normal kidneys and measured properly, the average kidney function loss was about 1.2 mL/min and the proportion with a serious drop was no higher than on placebo.',
        technicalDetails:
          'A per-protocol safety analysis of 4,640 Partners PrEP participants found mean eGFR change attributable to the drug of -1.23 mL/min/1.73 m2 (95% CI -2.06 to -0.40, p=0.004) for tenofovir alone and -1.59 (95% CI -2.44 to -0.74, p<0.001) with emtricitabine, appearing by one month, stable to twelve months, and waning thereafter. Confirmed declines of 25% or more occurred in 1.8% and 2.5% by 24 months against 1.3% on placebo, which was not statistically different. In the iPrEx bone substudy of 498 participants, spine bone mineral density fell by a net 0.91% (95% CI -1.44 to -0.38, p=0.001) and hip by 0.61% (-0.96 to -0.27, p=0.001) by week 24, with no further significant change afterwards, with the loss correlating inversely with intracellular tenofovir diphosphate, no difference in fractures (p=0.62), and a tendency to rebound after discontinuation. The measured harm is therefore small, front-loaded and partly reversible in people with normal renal function. Extrapolating from that to the treated HIV population with decades of exposure, lower baseline renal reserve and concomitant boosters is an inference, and it runs in the direction of underestimating harm rather than overestimating it. Proximal tubulopathy and Fanconi syndrome are labelled and do occur; what is not established is how often.',
        evidenceSource:
          'Mugwanya KK et al., JAMA Intern Med 2015;175:246-254; Mulligan K et al., Clin Infect Dis 2015;61:572-580',
        doi: '10.1001/jamainternmed.2014.6786',
        inferredClaim:
          'That the small, non-progressive renal and bone changes measured in HIV-negative prevention populations describe the risk in people treated for HIV for decades',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed as a wrapper designed to fall apart immediately',
        laymanDesc:
          'The tablet contains the active drug sealed behind two chemical groups that are stripped off by enzymes in the blood within seconds of absorption. That is deliberate: it is what lets an otherwise impermeable molecule be taken by mouth.',
        molecularDetail:
          'Tenofovir disoproxil fumarate carries two isopropyloxycarbonyloxymethyl esters on the phosphonate. Plasma and intestinal esterases cleave them almost immediately, releasing free tenofovir into the circulation. Oral bioavailability of tenofovir from the prodrug is roughly 25% in the fasted state and higher with a high-fat meal. The consequence of releasing free drug into plasma is the whole subject of the tenofovir alafenamide record: circulating tenofovir reaches the kidney and the skeleton.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Free drug is pulled into cells, and into the kidney tubule',
        laymanDesc:
          'Tenofovir gets into target cells slowly. It also gets pulled into the cells lining the kidney tubule by transporters that were not built with this drug in mind, which is where the known kidney side effect comes from.',
        molecularDetail:
          'Tenofovir is a substrate of the basolateral organic anion transporters OAT1 and OAT3, which concentrate it in proximal tubular epithelium, and is exported by MRP4 on the apical side. When uptake outpaces efflux the drug accumulates and mitochondrial DNA polymerase gamma is inhibited, which is the mechanistic account of the tubulopathy and of Fanconi syndrome. Boosting agents such as ritonavir and cobicistat raise tenofovir exposure and are the co-factor in most reported cases.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Two phosphates turn it into a counterfeit DNA letter',
        laymanDesc:
          'Inside the cell, ordinary cellular enzymes attach two phosphate groups. The finished molecule looks enough like one of the four building blocks of DNA that the viral copying machine cannot tell the difference.',
        molecularDetail:
          'Adenylate kinase converts tenofovir to the monophosphate and nucleoside diphosphate kinase to tenofovir diphosphate, the active species and an analogue of deoxyadenosine triphosphate. The intracellular half-life of tenofovir diphosphate in PBMCs runs to days, which supports once-daily dosing and is the basis of the dried blood spot assay used to measure adherence retrospectively in the prevention trials.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It is stitched into the chain, and the chain ends there',
        laymanDesc:
          'The viral enzyme inserts it into the DNA it is building. There is no attachment point for the next letter, so the copy stops at that spot and cannot be finished.',
        molecularDetail:
          'Tenofovir diphosphate competes with dATP for the polymerase active site and is incorporated, after which the absence of a 3-prime hydroxyl on the acyclic linker enforces obligate chain termination. The same chemistry works on HIV-1 reverse transcriptase and on the reverse transcriptase domain of the hepatitis B polymerase. The signature HIV resistance mutation is K65R, which discriminates against the analogue at incorporation and costs the virus replicative fitness; it emerged in 8 of 299 patients over 144 weeks in Study 903 and in none in Study 934.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus falls, and in hepatitis B the liver scar reverses',
        laymanDesc:
          'HIV drops below detection and stays there while the drug is taken. In hepatitis B, sustained suppression does something no viral load number can show on its own: repeat biopsies after five years found scarring reversed in most patients who started with cirrhosis.',
        molecularDetail:
          'In HIV the effect is suppression, not clearance, because integrated provirus is untouched. In hepatitis B, five years of open-label treatment with a prespecified repeat biopsy at week 240 produced histological improvement in 304 of 348 patients (87%) and loss of the cirrhosis threshold in 71 of 96 who met it at baseline (74%). Covalently closed circular DNA persists in the hepatocyte nucleus, so hepatitis B is suppressed rather than cured too, which is why stopping causes the severe flare that carries the boxed warning.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 903',
        phase:
          'Phase 3, randomised, double-blind, equivalence, 48-week primary with 144-week follow-up',
        sampleSize: 602,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 400 copies per millilitre at week 48 against stavudine, intention to treat',
        endpointMet: false,
        statisticalPValue:
          '80% versus 84%, 95% CI -10.4% to 1.5%, exceeding the predefined -10% equivalence limit; equivalence met in the secondary analysis at 50 copies per millilitre',
        unreportedAdverseSignals:
          'The result that mattered was metabolic and was a secondary endpoint: lipodystrophy in 3% against 19%, and a triglyceride rise of 1 mg/dL against 134 mg/dL at week 144.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Study 934 (NCT00112047)',
        phase: 'Phase 3, randomised, open-label, non-inferiority then superiority, 48 weeks',
        sampleSize: 517,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 400 copies per millilitre at week 48 without baseline efavirenz resistance',
        endpointMet: true,
        statisticalPValue: '84% versus 73%, 95% CI for the difference 4 to 19, p=0.002',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hepatitis B studies 102 and 103 (NCT00116805, NCT00117676)',
        phase: 'Two phase 3, randomised 2:1, double-blind trials against adefovir, 48 weeks',
        sampleSize: 641,
        primaryEndpoint:
          'HBV DNA below 400 copies per millilitre with histological improvement at week 48',
        endpointMet: true,
        statisticalPValue:
          'p<0.001 in both studies; viral suppression 93% versus 63% and 76% versus 13%',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hepatitis B open-label extension, week 240 biopsy',
        phase:
          'Open-label seven-year extension with prespecified repeat liver biopsy, no comparator',
        sampleSize: 348,
        primaryEndpoint:
          'Histological improvement and fibrosis regression on paired liver biopsy at week 240',
        endpointMet: true,
        statisticalPValue:
          '87% histological improvement and 51% fibrosis regression, p<0.0001; 71 of 96 baseline cirrhotics no longer cirrhotic',
        unreportedAdverseSignals:
          'Only 348 of 641 randomised patients (54%) had biopsies at both time points, and the extension had no control arm, so the comparison is with baseline rather than with untreated disease.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'iPrEx (NCT00458393)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2499,
        primaryEndpoint: 'Incident HIV-1 infection against placebo over 3,324 person-years',
        endpointMet: true,
        statisticalPValue: '44% reduction (95% CI 15 to 63), p=0.005',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Partners PrEP (NCT00557245)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, three arms',
        sampleSize: 4747,
        primaryEndpoint:
          'Incident HIV-1 infection in the seronegative partner of a serodiscordant couple',
        endpointMet: true,
        statisticalPValue:
          '67% reduction with tenofovir (95% CI 44 to 81) and 75% with tenofovir-emtricitabine (55 to 87), both p<0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'FEM-PrEP (NCT00625404)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, stopped early for futility',
        sampleSize: 2120,
        primaryEndpoint: 'Incident HIV-1 infection in HIV-negative African women',
        endpointMet: false,
        statisticalPValue: 'Hazard ratio 0.94 (95% CI 0.59 to 1.52), p=0.81',
        unreportedAdverseSignals:
          'Fewer than 40% of uninfected women in the active group had evidence of recent pill use at visits matched to the infection window, which is a measurement the trial made and the headline result did not carry.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'VOICE (NCT00705679)',
        phase: 'Phase 2B, randomised, placebo-controlled, four arms, two oral and one gel',
        sampleSize: 5029,
        primaryEndpoint: 'Incident HIV-1 infection in African women, modified intention to treat',
        endpointMet: false,
        statisticalPValue:
          'Effectiveness -49.0% for tenofovir (hazard ratio 1.49, 95% CI 0.97 to 2.29), -4.4% for tenofovir-emtricitabine and 14.5% for gel',
        unreportedAdverseSignals:
          'Tenofovir was detected in 30%, 29% and 25% of sampled plasma across the three active arms, and detection was negatively associated with the characteristics that predicted acquisition.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '84% against 73% below 400 copies per millilitre at week 48 in Study 934 (95% CI for the difference 4 to 19, p=0.002), with discontinuation for adverse events of 4% against 9%',
        'Hepatitis B viral suppression of 93% against 63% and 76% against 13% against adefovir at week 48, with no tenofovir resistance mutation in any patient',
        '71 of 96 patients with cirrhosis at baseline no longer met the cirrhosis threshold on repeat biopsy at week 240, and 3 of 252 without it progressed to it',
        'HIV acquisition reduced by 44% (95% CI 15 to 63) in iPrEx and by 67% and 75% in Partners PrEP, and by nothing measurable in FEM-PrEP and VOICE',
      ],
      unsupportedInferences: [
        'That FEM-PrEP and VOICE would have shown efficacy at high adherence — supported by measured drug concentrations, but a counterfactual no randomised comparison in either trial tested',
        'That the small, non-progressive eGFR and bone density changes measured in HIV-negative prevention cohorts describe the risk after decades of treatment exposure',
        'That Study 903 demonstrated equivalence to stavudine at its primary endpoint, which its own confidence interval says it did not',
      ],
      whatFailedInitially: [
        'Study 903 missed its primary equivalence margin at week 48, with a confidence interval reaching -10.4% against a -10% limit',
        'FEM-PrEP was stopped early for lack of efficacy after a hazard ratio of 0.94, and VOICE reported a point estimate of -49.0% effectiveness for oral tenofovir',
        'The initial reading of those two trials, that oral prevention does not protect African women, was retired once the drug concentration data from inside them were analysed',
      ],
      realWorldOutcome: [
        'The tenofovir in the WHO-recommended first-line combination taken across most of sub-Saharan Africa, and in Truvada, the first drug approved anywhere for HIV pre-exposure prophylaxis',
        'Generic since 2017 in the United States, at US$0.5051 per tablet at pharmacy acquisition cost across 35 listed products',
        'A first-line hepatitis B treatment with the only paired-biopsy evidence of cirrhosis regression in the class',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral powder, as a single agent and in fixed-dose combinations',
      description:
        'Taken once daily. Bioavailability is around 25% fasted and rises with a high-fat meal. Ritonavir and cobicistat raise tenofovir exposure substantially, which is why the renal risk concentrates in boosted regimens. Renal dose adjustment is required below a creatinine clearance of 50 mL/min, and it is not recommended below 30 mL/min in adults.',
      safetyProfile:
        'Severe acute exacerbation of hepatitis B on discontinuation is a boxed warning; hepatic function must be monitored for months after stopping in anyone with hepatitis B. Renal impairment including acute renal failure, proximal tubulopathy and Fanconi syndrome is labelled, with the risk concentrated in patients with pre-existing renal disease and those on boosted regimens. Bone mineral density falls in the first six months and then stabilises. Lactic acidosis and severe hepatomegaly with steatosis are labelled class effects. Relative to the successor prodrug it lowers LDL cholesterol and suppresses weight gain, which are effects rather than absences of effect and complicate every comparison between the two.',
    },
    commonQuestions: [
      {
        q: 'Did the prevention trials in African women mean the drug does not work in women?',
        a: 'No, and the correction is measured rather than argued. FEM-PrEP and VOICE were correctly reported: randomised to the drug, those women were not protected, with a hazard ratio of 0.94 in one and a point estimate of minus 49% effectiveness in the other. Both trials also measured tenofovir in blood. VOICE found it in 30% or fewer of samples in each active arm; FEM-PrEP found recent pill use in fewer than 40%. Partners PrEP, running in the same region with a couples-based design, reduced acquisition by 67% and 75% and did so in women as well as men. What is established is that protection tracks drug concentration. What cannot be established from an unrandomised subgroup is what those particular trials would have shown at full adherence, and it is worth resisting that second overreach as firmly as the first one.',
        auditNote:
          'A conclusion was retired for good reasons. The replacement explanation is well supported by measured drug levels and is still not a randomised finding.',
      },
      {
        q: 'Is the newer, more expensive tenofovir worth switching to?',
        a: 'That question has a measured half and an unmeasured half. Measured: the newer prodrug loses less bone mineral density, raises creatinine less and shifts proteinuria the other way, consistently across four randomised trials. Unmeasured: whether any of that produces fewer fractures or fewer cases of renal failure, which the registration paper explicitly says it was not powered to assess. Also measured, and pointing the other way: this drug lowers LDL cholesterol and suppresses weight in a way the newer one does not. The two products cost US$0.5051 and US$74.94 per tablet at the same pharmacy acquisition survey.',
      },
      {
        q: 'Will it damage my kidneys?',
        a: 'It can, and that is on the label as proximal tubulopathy, Fanconi syndrome and acute renal failure. The size of the average effect is smaller than the reputation. In 4,640 HIV-negative adults in Partners PrEP the mean eGFR decline attributable to the drug was 1.23 mL/min/1.73 m2, it appeared within a month, was stable to a year and then waned, and confirmed declines of 25% or more were no more common than on placebo. The risk concentrates in people with pre-existing kidney disease and in regimens containing ritonavir or cobicistat, which raise tenofovir exposure. Monitoring exists because the rare event is serious, not because the average one is.',
      },
      {
        q: 'Can it cure hepatitis B?',
        a: 'No, but it does something no other hepatitis B drug has shown on paired biopsy. Covalently closed circular DNA persists in the liver cell nucleus and the drug does not touch it, so stopping causes a flare severe enough to carry a boxed warning. What five years of continuous suppression did produce, in 348 patients biopsied twice, was histological improvement in 87% and loss of the cirrhosis threshold in 71 of the 96 who met it at the start. That is scarring reversing, measured in tissue rather than inferred from a blood test, and it is the strongest evidence on this page.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for tenofovir disoproxil could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost, and which for this molecule is now set by 35 competing generic products.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Gallant JE, DeJesus E, Arribas JR, et al. Tenofovir DF, emtricitabine, and efavirenz vs. zidovudine, lamivudine, and efavirenz for HIV. N Engl J Med 2006;354:251-260',
        identifier: '10.1056/NEJMoa051871',
        kind: 'doi',
      },
      {
        label:
          'Gallant JE, Staszewski S, Pozniak AL, et al. Efficacy and safety of tenofovir DF vs stavudine in combination therapy in antiretroviral-naive patients: a 3-year randomized trial. JAMA 2004;292:191-201',
        identifier: '10.1001/jama.292.2.191',
        kind: 'doi',
      },
      {
        label:
          'Marcellin P, Heathcote EJ, Buti M, et al. Tenofovir disoproxil fumarate versus adefovir dipivoxil for chronic hepatitis B. N Engl J Med 2008;359:2442-2455',
        identifier: '10.1056/NEJMoa0802878',
        kind: 'doi',
      },
      {
        label:
          'Marcellin P, Gane E, Buti M, et al. Regression of cirrhosis during treatment with tenofovir disoproxil fumarate for chronic hepatitis B: a 5-year open-label follow-up study. Lancet 2013;381:468-475',
        identifier: '10.1016/S0140-6736(12)61425-1',
        kind: 'doi',
      },
      {
        label:
          'Grant RM, Lama JR, Anderson PL, et al. Preexposure chemoprophylaxis for HIV prevention in men who have sex with men. N Engl J Med 2010;363:2587-2599',
        identifier: '10.1056/NEJMoa1011205',
        kind: 'doi',
      },
      {
        label:
          'Baeten JM, Donnell D, Ndase P, et al. Antiretroviral prophylaxis for HIV prevention in heterosexual men and women. N Engl J Med 2012;367:399-410',
        identifier: '10.1056/NEJMoa1108524',
        kind: 'doi',
      },
      {
        label:
          'Van Damme L, Corneli A, Ahmed K, et al. Preexposure prophylaxis for HIV infection among African women. N Engl J Med 2012;367:411-422',
        identifier: '10.1056/NEJMoa1202614',
        kind: 'doi',
      },
      {
        label:
          'Marrazzo JM, Ramjee G, Richardson BA, et al. Tenofovir-based preexposure prophylaxis for HIV infection among African women. N Engl J Med 2015;372:509-518',
        identifier: '10.1056/NEJMoa1402269',
        kind: 'doi',
      },
      {
        label:
          'Mugwanya KK, Wyatt C, Celum C, et al. Changes in glomerular kidney function among HIV-1-uninfected men and women receiving emtricitabine-tenofovir disoproxil fumarate preexposure prophylaxis: a randomized clinical trial. JAMA Intern Med 2015;175:246-254',
        identifier: '10.1001/jamainternmed.2014.6786',
        kind: 'doi',
      },
      {
        label:
          'Mulligan K, Glidden DV, Anderson PL, et al. Effects of emtricitabine/tenofovir on bone mineral density in HIV-negative persons in a randomized, double-blind, placebo-controlled trial. Clin Infect Dis 2015;61:572-580',
        identifier: '10.1093/cid/civ324',
        kind: 'doi',
      },
      {
        label: 'Study 934: tenofovir DF, emtricitabine and efavirenz versus Combivir and efavirenz',
        identifier: 'NCT00112047',
        kind: 'nct',
      },
      {
        label: 'iPrEx: emtricitabine-tenofovir disoproxil fumarate for HIV prevention in men',
        identifier: 'NCT00458393',
        kind: 'nct',
      },
      {
        label: 'Partners PrEP: pre-exposure prophylaxis within HIV-1 serodiscordant couples',
        identifier: 'NCT00557245',
        kind: 'nct',
      },
      {
        label: 'FEM-PrEP: emtricitabine-tenofovir disoproxil fumarate in African women',
        identifier: 'NCT00625404',
        kind: 'nct',
      },
      {
        label:
          'VOICE: tenofovir gel, tenofovir tablets and emtricitabine-tenofovir tablets in African women',
        identifier: 'NCT00705679',
        kind: 'nct',
      },
      {
        label:
          'Hepatitis B study 102: tenofovir disoproxil fumarate versus adefovir dipivoxil, HBeAg-negative',
        identifier: 'NCT00116805',
        kind: 'nct',
      },
      {
        label:
          'Hepatitis B study 103: tenofovir disoproxil fumarate versus adefovir dipivoxil, HBeAg-positive',
        identifier: 'NCT00117676',
        kind: 'nct',
      },
      {
        label:
          'VIREAD (tenofovir disoproxil fumarate) — Drugs@FDA application NDA 021356, Gilead Sciences, original approval 26 October 2001',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021356',
        kind: 'regulatory',
      },
      {
        label:
          'TRUVADA (emtricitabine and tenofovir disoproxil fumarate) — Drugs@FDA application NDA 021752, Gilead Sciences',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021752',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 5481350 — tenofovir disoproxil structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5481350',
        kind: 'url',
      },
    ],
  },
]
