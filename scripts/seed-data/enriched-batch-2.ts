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
        a: 'The best current answer is no, and the reason that answer is worth explaining is that it used to be yes. In 2018 the Tsepamo birth-outcome surveillance programme in Botswana reported four neural-tube defects among 426 babies conceived while the mother was taking dolutegravir, a prevalence of 0.94% against 0.12% on other regimens. Several countries changed their guidance for women of childbearing potential within weeks. As the same programme kept counting, the estimate fell: five defects in 1,683 deliveries (0.30%) in the 2019 full report, and the current published figures are 0.10% for dolutegravir against 0.11% for everything else. A 2025 retrospective in AIDS makes the statistical point: four events were compatible with a wide range of effect sizes including no difference at all.',
        auditNote:
          'This is the clearest conclusion shift on this page. The first number was not fabricated or miscounted; it was a small numerator read as though it were a rate.',
      },
      {
        q: 'Why do people gain weight on it?',
        a: 'Nobody has established the mechanism, and the size of the gain depends heavily on what it is being compared with. In ADVANCE, mean gain at 48 weeks was 6.4 kg with tenofovir alafenamide, 3.2 kg with tenofovir disoproxil and 1.7 kg on the efavirenz-based standard of care, so part of what looks like dolutegravir weight is really the absence of tenofovir disoproxil, which suppresses weight, and the presence of tenofovir alafenamide, which does not. In NAMSAL the 192-week gains were 9.4 kg against 5.9 kg on low-dose efavirenz. What has not been measured is whether that weight produces disease. A secondary analysis of ADVANCE found blood pressure tracked BMI change rather than the regimen, and the largest 96-week systolic rise in any arm was 1.7 mmHg.',
      },
      {
        q: 'My creatinine went up after starting it. Are my kidneys being damaged?',
        a: 'Almost certainly not, and the distinction matters. Dolutegravir inhibits the transporter that secretes creatinine into urine in the kidney tubule, so less creatinine leaves the body by that route and the blood level rises. Glomerular filtration, the thing creatinine is used as a proxy for, has not changed. The rise appears within the first weeks, does not progress, and reverses on stopping. It is a change in the measurement, not in the organ. A creatinine that keeps climbing months later is a different problem and is not this.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for dolutegravir could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and putting an estimate in that field would mean this page inventing a number. What is shown instead is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost. The licensing note makes the same distinction: the identical molecule is manufactured generically for the countries covered by the Medicines Patent Pool licence and sold at brand price in the ones that are not.',
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
        a: 'The trials that worked and the trials that did not differ in one measured variable: whether the drug was in the participants blood. In iPrEx, study drug was detected in 22 of 43 seronegative participants tested and in only 3 of 34 who became infected. In VOICE, tenofovir was detectable in 29% of sampled plasma in the tenofovir-emtricitabine arm, and the trial found no effect. In FEM-PrEP, fewer than 40% of women in the drug arm had evidence of recent pill use, and the trial was stopped for futility. That pattern is strong. It is still an association: nobody randomised anyone to take the tablets, and in VOICE the participants with detectable drug were also at lower risk on other measures.',
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
          'In the harder half of hepatitis B, where people start with far more virus, 64% on the new prodrug reached undetectable against 67% on the old one. That is a negative point estimate that still passed the non-inferiority test, and it should not be rounded into a win.',
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
          'A drug can be associated with weight without causing it, and removing it can fail to reverse weight it did cause. This trial does not separate those explanations.',
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
          'Patients from the two 48-week randomised hepatitis B trials entered a seven-year open-label extension with a prespecified repeat liver biopsy at week 240. Of 641 who received randomised treatment, 585 (91%) entered the open-label phase and 489 (76%) completed 240 weeks; 348 (54%) had biopsy results at both baseline and week 240. Histological improvement, defined as a reduction of at least 2 points in the Knodell necroinflammatory score without worsening fibrosis, occurred in 304 of 348 (87%), and fibrosis regression of at least 1 Ishak unit in 176 of 348 (51%), p<0.0001. Of the 96 patients (28%) with Ishak score 5 or 6 at baseline, 71 (74%) no longer met the cirrhosis threshold, while 3 of 252 without baseline cirrhosis progressed to it, p<0.0001. Virological breakthrough was infrequent and was not attributable to tenofovir resistance. The main limitation is that the 348 patients biopsied twice were a little over half of those randomised, and the extension was open-label with no comparator.',
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
  // ---------------------------------------------------------------------------------------------
  // 5. Efavirenz — the drug that made once-daily HIV therapy possible, was registered at a dose
  //    fifty per cent higher than it needed, was contraindicated in pregnancy on the strength of
  //    three monkeys, and left behind a resistance problem that ended its own era.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'efavirenz',
    name: 'Efavirenz',
    tradeName: 'Sustiva; also in Atripla, Symfi and generic efavirenz-lamivudine-tenofovir',
    sponsor: 'Bristol Myers Squibb (originated at DuPont Merck)',
    targetGene: 'HIV-1 pol, reverse transcriptase coding region',
    targetProtein:
      'HIV-1 reverse transcriptase, inhibited allosterically by binding a hydrophobic pocket in the p66 subunit about 10 angstroms from the polymerase active site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults and in paediatric patients weighing at least 3.5 kg',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite:
      'HIV-1 reverse transcriptase in the cytoplasm of infected CD4-positive T cells; the side effects are generated in the central nervous system',
    conditionContext: {
      conditionExplainer:
        'HIV-1 carries its genome as RNA and must copy it into DNA before it can be inserted into a chromosome. Reverse transcriptase does that copying. There are two ways to stop it: hand it a counterfeit building block, which is what the nucleoside analogues do, or jam the enzyme itself somewhere other than its active site, which is what this drug does.',
      whyItMatters:
        'Efavirenz is why a person with HIV can take one tablet once a day. Before it, effective therapy meant a protease inhibitor on an eight-hourly schedule with food rules. It carried the global treatment programme for roughly fifteen years and was displaced by dolutegravir only after resistance to it had spread far enough to threaten the programme it built.',
      whoTakesThis:
        'Fewer people every year. It has been superseded as first-line therapy in the WHO and United States guidelines by dolutegravir, and now serves mainly as an alternative agent and in regimens where a specific interaction rules out an integrase inhibitor.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre and kept there, without selecting the K103N mutation that would end the usefulness of the whole first-generation class.',
    },
    oneSentenceVerdict:
      'A non-nucleoside inhibitor that wedges into a pocket beside the active site of HIV reverse transcriptase and stops the enzyme flexing; it suppressed 70% of treatment-naive patients against 48% on the protease inhibitor standard of 1999 and 89% against 77% on lopinavir-ritonavir in 2008, and a later independent trial then showed that two thirds of the registered dose worked just as well with fewer side effects.',
    laymanHowItWorks:
      'Reverse transcriptase has to open and close like a hand to copy genetic material. Efavirenz does not go into the part of the enzyme that does the chemistry. It slots into a greasy pocket just beside it and holds the whole structure rigid, so the hand can no longer close. The enzyme is intact, present, and useless. Because the pocket is not doing anything essential for the virus otherwise, a single change to one amino acid in it can make the drug stop working entirely.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$1.35 per tablet at United States pharmacy acquisition cost, median across three listed generic products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Off patent and generic. The price note that matters here is not the markup but the dose: ENCORE1 showed 400 mg to be non-inferior to the registered 600 mg, which is a third of the active ingredient removed from every tablet in the world at no measured cost in efficacy. That trial was funded by the Bill and Melinda Gates Foundation and UNSW Australia, not by a manufacturer, which is the usual reason such trials do not get run.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Everything that replaced efavirenz replaced it for the same two reasons: a higher barrier to resistance and fewer central nervous system effects. The comparison worth making is against the drug that ended its era.',
      conventionalRx: [
        {
          name: 'Dolutegravir (Tivicay)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'Beat efavirenz directly in SINGLE, 88% against 81% suppressed at week 48, with discontinuation for adverse events of 2% against 10%. Against the reduced 400 mg efavirenz dose in NAMSAL the gap narrowed to 74.5% against 69.0%. Its resistance barrier is the real difference: no treatment-naive dolutegravir trial has selected integrase resistance, while a single K103N ends efavirenz.',
          typicalCost:
            'US$105.03 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: high resistance barrier, fast suppression, few central nervous system effects. Cons: more weight gained than on efavirenz, and it is not generic in high-income markets.',
        },
        {
          name: 'Doravirine (Pifeltro)',
          class: 'Non-nucleoside reverse transcriptase inhibitor, later generation',
          howItCompares:
            'The same binding pocket, engineered around the mutations that defeat efavirenz. It retains activity against K103N and Y181C, and its central nervous system and lipid profiles are the reason it exists.',
          typicalCost:
            'US$92.89 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: active against the commonest efavirenz resistance mutations, fewer neuropsychiatric effects, lipid-neutral. Cons: still a non-nucleoside with a lower resistance barrier than an integrase inhibitor, and no generic.',
        },
        {
          name: 'Rilpivirine (Edurant)',
          class: 'Non-nucleoside reverse transcriptase inhibitor, second generation',
          howItCompares:
            'Better tolerated neurologically than efavirenz but with a documented loss of efficacy above 100,000 copies per millilitre at baseline, and an absolute requirement to be taken with a substantial meal.',
          typicalCost:
            'US$114.50 per tablet at United States pharmacy acquisition cost (CMS NADAC, effective 19 August 2026)',
          prosAndCons:
            'Pros: far fewer central nervous system effects, small tablet. Cons: baseline viral load restriction, food requirement, and interaction with acid-suppressing drugs.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC1C#C[C@]2(C3=C(C=CC(=C3)Cl)NC(=O)O2)C(F)(F)F',
      chemicalFormula: 'C14H9ClF3NO2',
      molecularWeight: '315.67 g/mol',
      targetReceptorAffinity:
        'Binds a hydrophobic pocket in the p66 subunit of HIV-1 reverse transcriptase roughly 10 angstroms from the polymerase active site, a pocket that does not exist in the unliganded enzyme and is created by the drug displacing tyrosine 181 and tyrosine 188. Inhibition is non-competitive: the enzyme is locked in a conformation from which the thumb subdomain cannot complete the catalytic cycle. Because the pocket is not itself catalytic, single substitutions in it, principally K103N and Y181C, abolish binding without measurable cost to viral fitness, which is the structural reason for the low genetic barrier.',
      structureSource: {
        label: 'PubChem CID 64139 (efavirenz) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/64139',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'efv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric control of the benzoxazinone quaternary centre',
          description:
            'Establish enantiomeric excess at the single quaternary stereocentre bearing the trifluoromethyl and cyclopropylethynyl groups. The (S)-enantiomer is the drug; the (R)-enantiomer is inactive at the pocket, and this is the specification the entire asymmetric synthesis exists to meet.',
          reagentsAndBuffer:
            'Efavirenz reference standard, chiral HPLC on a cellulose tris(3,5-dimethylphenylcarbamate) column, fluorine-19 NMR, gas chromatography with flame ionisation for residual solvents',
        },
        {
          id: 'efv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Asymmetric acetylide addition and cyclic carbamate closure',
          description:
            'Add the lithium or zinc cyclopropylacetylide to the trifluoromethyl ketone under a chiral amino alcohol ligand to set the quaternary centre, then close the benzoxazinone ring onto the aniline nitrogen. The stereochemistry is fixed at the addition step; nothing downstream corrects it.',
          dependsOnStepId: 'efv-w1',
          reagentsAndBuffer:
            'Cyclopropylacetylene, n-butyllithium or diethylzinc, a chiral amino alcohol ligand such as (1R,2S)-N-pyrrolidinylnorephedrine, the 4-chloro-2-trifluoroacetyl aniline ketone, then phosgene equivalent or triphosgene for carbamate closure, tetrahydrofuran under nitrogen at low temperature',
        },
        {
          id: 'efv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation, polymorph control and dissolution testing',
          description:
            'Crystallise to the marketed polymorph and confirm it, then run dissolution. Efavirenz is poorly water-soluble and its absorption is formulation-dependent and food-dependent, so the dissolution profile is not a formality here; a bioequivalent generic is a dissolution result before it is anything else.',
          dependsOnStepId: 'efv-w2',
          reagentsAndBuffer:
            'Ethanol-water or heptane-ethyl acetate crystallisation, X-ray powder diffraction and differential scanning calorimetry for polymorph identity, USP dissolution apparatus with a surfactant-containing medium, reversed-phase HPLC with UV detection',
        },
        {
          id: 'efv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Infection of PBMCs across a CYP2B6-genotyped donor panel',
          description:
            'Infect primary peripheral blood mononuclear cells from donors of known CYP2B6 516 genotype in the presence of graded drug concentrations, and run a matched panel of clinical isolates carrying K103N and Y181C. Both axes matter for this molecule: who metabolises it and which virus it is facing.',
          dependsOnStepId: 'efv-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs from CYP2B6 516 G/G, G/T and T/T donors, RPMI-1640 with 10% foetal bovine serum and interleukin-2, wild-type HIV-1 NL4-3 alongside K103N and Y181C site-directed mutants, 50% human serum arm for protein-binding-adjusted potency',
        },
        {
          id: 'efv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Reverse transcriptase inhibition constant and mutant fold-change',
          description:
            'Measure the inhibition constant against recombinant wild-type reverse transcriptase and against the mutant enzymes, and express the result as fold change. The single number that describes efavirenz best is not its potency against wild-type virus but how many hundred-fold that potency falls with one amino-acid substitution.',
          dependsOnStepId: 'efv-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 p66/p51 reverse transcriptase heterodimer, wild-type and K103N and Y181C mutants, poly(rA)-oligo(dT) template-primer, digoxigenin-labelled dUTP incorporation ELISA, magnesium chloride assay buffer',
        },
      ],
    },
    keyAudits: [
      {
        id: 'efv-a1',
        category: 'measured',
        title: 'Study 006: 70% suppressed against 48% on the protease inhibitor standard',
        laymanSummary:
          'The trial that established the drug put it against indinavir, then the best available. Efavirenz with two nucleosides suppressed 70% of patients to undetectable against 48%, and drove far fewer people off treatment with side effects.',
        technicalDetails:
          'Study 006 (DMP 266-006) randomised 450 patients naive to lamivudine, non-nucleosides and protease inhibitors, open-label, to efavirenz 600 mg with zidovudine and lamivudine, to indinavir 800 mg every eight hours with zidovudine and lamivudine, or to efavirenz plus indinavir. Plasma HIV-1 RNA was suppressed to undetectable in 70% of the efavirenz-nucleoside group against 48% of the indinavir-nucleoside group (p<0.001); the efavirenz-plus-indinavir arm reached 53%. CD4 counts rose by 180 to 201 cells per cubic millimetre across all three arms. Discontinuation for adverse events was 27% on efavirenz against 43% on indinavir (p=0.005). The dosing schedule is the part of this result that changed practice: once daily against every eight hours.',
        evidenceSource: 'Staszewski S et al., N Engl J Med 1999;341:1865-1873 (Study 006)',
        doi: '10.1056/NEJM199912163412501',
        measuredMetric:
          'Proportion with plasma HIV-1 RNA suppressed to undetectable, and discontinuation for adverse events',
        auditFlag: 'verified',
      },
      {
        id: 'efv-a2',
        category: 'measured',
        title: 'ACTG 5142: 89% against 77% on lopinavir-ritonavir at 96 weeks',
        laymanSummary:
          'A publicly funded trial in 757 patients compared efavirenz with a boosted protease inhibitor and with a regimen containing neither nucleoside. Efavirenz won on virological failure, and the nucleoside-sparing arm produced more resistance.',
        technicalDetails:
          'ACTG 5142 (NCT00050895) randomised 757 treatment-naive patients with a median CD4 count of 191 cells per cubic millimetre to efavirenz with two nucleoside reverse transcriptase inhibitors, to lopinavir-ritonavir with two nucleosides, or to lopinavir-ritonavir with efavirenz and no nucleosides. At a median follow-up of 112 weeks, time to virological failure was longer in the efavirenz group than in the lopinavir-ritonavir group (p=0.006). At week 96, 89% of the efavirenz group, 77% of the lopinavir-ritonavir group and 83% of the nucleoside-sparing group had fewer than 50 copies per millilitre (p=0.003 for efavirenz against lopinavir-ritonavir). Time to discontinuation for toxicity did not differ between groups, and resistance mutations at virological failure were more frequent in the nucleoside-sparing group.',
        evidenceSource:
          'Riddler SA et al., N Engl J Med 2008;358:2095-2106 (ACTG 5142, NCT00050895)',
        doi: '10.1056/NEJMoa074609',
        measuredMetric:
          'Time to virological failure and proportion below 50 copies per millilitre at week 96',
        auditFlag: 'verified',
      },
      {
        id: 'efv-a3',
        category: 'conclusion_shift',
        title: 'The registered dose was a third too high, and an academic trial proved it in 2014',
        laymanSummary:
          'Efavirenz was approved at 600 mg a day in 1998 and stayed there for sixteen years. A trial funded by a foundation, not a manufacturer, then randomised 630 patients to 400 mg or 600 mg. The lower dose was non-inferior, produced higher CD4 counts, and caused significantly fewer drug-related side effects.',
        technicalDetails:
          'ENCORE1 (NCT01011413) was a double-blind, placebo-controlled non-inferiority trial at 38 sites in 13 countries in treatment-naive adults, all on tenofovir and emtricitabine. At week 48, 94.1% of the 400 mg group against 92.2% of the 600 mg group had viral load below 200 copies per millilitre, difference 1.85% (95% CI -2.1 to 5.79) against a -10% margin. CD4 counts were higher on the lower dose by 25 cells per microlitre (95% CI 6 to 44, p=0.01). Study-drug-related adverse events occurred in 118 against 146 patients, difference -10.5% (95% CI -18.2 to -2.8, p=0.01), and 6 (2%) against 18 (6%) stopped treatment because of them (p=0.01). At week 96 suppression was 90.0% against 90.6%, difference -0.6 (95% CI -5.2 to 4.0, p=0.72). The trial was funded by the Bill and Melinda Gates Foundation and UNSW Australia. The finding was not a refinement of a marginal dose. It was one third of the active ingredient in every efavirenz tablet on earth, removable at no measured cost in efficacy, sitting undiscovered for sixteen years because nobody whose product it was had a reason to look.',
        evidenceSource:
          'ENCORE1 Study Group, Lancet 2014;383:1474-1482; Carey D et al., Lancet Infect Dis 2015;15:793-802 (NCT01011413)',
        doi: '10.1016/S0140-6736(13)62187-X',
        inferredClaim:
          'That the dose selected in phase 2 dose-ranging and carried into registration was the dose the drug needed — an assumption that held for sixteen years and was wrong by a third',
        auditFlag: 'verified',
      },
      {
        id: 'efv-a4',
        category: 'conclusion_shift',
        title:
          'Contraindicated in early pregnancy on three monkeys, cleared by 2,026 human pregnancies',
        laymanSummary:
          'Efavirenz was labelled as dangerous in the first trimester because three of twenty monkey fetuses had brain and spinal defects. Human data eventually accumulated: 2,026 first-trimester exposures produced one neural tube defect, a rate no different from the general population, and the WHO reversed its guidance in 2013.',
        technicalDetails:
          'The original signal was preclinical: central nervous system malformations in cynomolgus monkey fetuses exposed in the first trimester, which put efavirenz into the old FDA pregnancy category D and produced guidance against its use in women who might conceive. Ford and colleagues pooled human birth outcomes three times as data accumulated. By 2014 the review covered 23 studies, of which 21 reported outcomes on 2,026 live births after first-trimester efavirenz exposure. Forty-four congenital anomalies were reported, a pooled proportion of 1.63% (95% CI 0.78 to 2.48), of which exactly one was a neural tube defect, an incidence of 0.05% (95% CI below 0.01 to 0.28) and comparable to the general population. Across twelve studies with a comparator, the relative risk of any congenital anomaly against non-efavirenz regimens was 0.78 (95% CI 0.56 to 1.08). This review fed directly into the 2013 WHO antiretroviral guidelines, which recommended efavirenz for adults regardless of sex and throughout pregnancy including the first trimester. The reversal cost years of restricted access for women in exactly the countries where the drug was the only realistic option.',
        evidenceSource:
          'Ford N, Mofenson L, Shubber Z, et al. AIDS 2014;28:S123-S131; earlier iterations AIDS 2010;24:1461-1470 and AIDS 2011;25:2301-2304',
        doi: '10.1097/QAD.0000000000000231',
        inferredClaim:
          'That central nervous system malformations in three of twenty cynomolgus monkey fetuses predicted human teratogenicity — an inference that shaped guidelines for a decade and that 2,026 human pregnancies did not support',
        auditFlag: 'contested',
      },
      {
        id: 'efv-a5',
        category: 'inferred',
        title: 'Suicidality: a two-fold hazard in trials, no clear signal in routine care',
        laymanSummary:
          'Pooling four randomised trials found suicidal thoughts and acts roughly twice as common on efavirenz, with eight suicides against one. A cohort study in ordinary clinical care found no clear increase. Both analyses are competent, and the disagreement has not been resolved.',
        technicalDetails:
          'Mollan and colleagues analysed participant-level data from four AIDS Clinical Trials Group treatment-naive studies conducted 2001 to 2010 (NCT00013520, NCT00050895, NCT00084136, NCT00118898), 3,241 randomised to efavirenz-containing and 2,091 to efavirenz-free regimens, median follow-up 96 weeks. Suicidality incidence per 1,000 person-years was 8.08 (47 events) against 3.66 (15 events), hazard ratio 2.28 (95% CI 1.27 to 4.10, p=0.006). Attempted or completed suicide was 2.90 against 1.22 per 1,000 person-years, hazard ratio 2.58 (95% CI 0.94 to 7.06, p=0.065), with 8 suicides against 1. The authors note there was no standardised suicidality questionnaire and that efavirenz was open-label in three of the four studies. A subsequent cohort of 597 adults initiating therapy in routine United States care, using marginal structural models to handle channelling bias, found a weighted hazard ratio of 1.21 (95% CI 0.66 to 2.28). A 2021 transportability analysis reweighted the trial effect onto a cohort of 8,291 routine-care patients and obtained a transported hazard ratio of 1.8 (95% CI 0.9 to 4.4) against 2.3 (1.2 to 4.4) in the trials, an attenuation of more than 20%. What is measured is the randomised hazard ratio. What is inferred, in either direction, is which of these two populations a given reader belongs to.',
        evidenceSource:
          'Mollan KR et al., Ann Intern Med 2014;161:1-10; Bengtson AM et al., J Acquir Immune Defic Syndr 2017;76:402-408; Mollan KR et al., Am J Epidemiol 2021;190:2075-2084',
        doi: '10.7326/M14-0293',
        inferredClaim:
          'That the two-fold suicidality hazard measured in trial populations describes the risk faced by patients in routine care, or that its absence in cohort studies refutes the randomised finding',
        auditFlag: 'contested',
      },
      {
        id: 'efv-a6',
        category: 'failed',
        title: 'One amino acid ends it, and by 2016 that had happened across a continent',
        laymanSummary:
          'A single change at position 103 of reverse transcriptase makes efavirenz stop working, and it costs the virus nothing to carry. By 2016 roughly one in ten people starting treatment in southern and eastern Africa already had that kind of resistance before their first dose, which is the threshold at which the WHO says a country must change its first-line drug.',
        technicalDetails:
          'A systematic review and meta-regression of 358 datasets covering 56,044 adults in 63 low-income and middle-income countries estimated 2016 pretreatment non-nucleoside resistance prevalence at 11.0% (95% CI 7.5 to 15.9) in southern Africa, 10.1% (5.1 to 19.4) in eastern Africa, 7.2% (2.9 to 16.5) in western and central Africa and 9.4% (6.6 to 13.2) in Latin America and the Caribbean. The yearly increase in the odds of pretreatment resistance was 23% (95% CI 16 to 29) in southern Africa and 11% to 17% elsewhere. The WHO threshold for changing national first-line therapy is 10%. The structural cause is that the non-nucleoside pocket is not catalytic, so K103N and Y181C abolish drug binding without the fitness penalty that constrains resistance to nucleoside analogues or to second-generation integrase inhibitors. The failure being audited here is not that patients failed. It is that a drug class with a one-mutation barrier was deployed as the global first line for fifteen years, and the resistance that ended it was predictable from the crystal structure.',
        evidenceSource: 'Gupta RK, Gregson J, Parkin N, et al. Lancet Infect Dis 2018;18:346-355',
        doi: '10.1016/S1473-3099(17)30702-8',
        measuredMetric:
          'Pooled prevalence of pretreatment non-nucleoside reverse transcriptase inhibitor resistance by region in 2016, and its yearly rate of increase',
        auditFlag: 'verified',
      },
      {
        id: 'efv-a7',
        category: 'measured',
        title: 'The side effects are a genotype, and the genotype is unevenly distributed',
        laymanSummary:
          'How much efavirenz ends up in the blood depends on a common variant in the enzyme that clears it. People carrying two copies of the slow variant have roughly three times the drug exposure, and that variant is much more common in people of African ancestry, who are also the population the drug was most widely deployed in.',
        technicalDetails:
          'ACTG A5097s measured efavirenz plasma concentration-time profiles and central nervous system symptoms in 154 participants: 89 European-American, 50 African-American, 15 Hispanic. The CYP2B6 T/T genotype at position 516 was present in 20% of African-Americans against 3% of European-Americans and was associated with substantially greater exposure: median 24-hour area under the curve was 44, 60 and 130 microgram-hours per millilitre for G/G, G/T and T/T respectively (p<0.0001). The G516T genotype was associated with central nervous system symptoms at week 1 (p=0.036). No association was found for CYP3A4, CYP3A5 or MDR1 polymorphisms. The three-fold exposure difference across a common genotype is also the pharmacological setting for the ENCORE1 result: a fixed 600 mg dose is a very different dose in different people, and the population in which the standard dose was set was not the population in which most of it was eventually taken.',
        evidenceSource: 'Haas DW, Ribaudo HJ, Kim RB, et al. AIDS 2004;18:2391-2400 (ACTG A5097s)',
        doi: '10.1097/00002030-200409030-00003',
        measuredMetric:
          'Median efavirenz 24-hour area under the curve by CYP2B6 516 genotype: 44, 60 and 130 microgram-hours per millilitre',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, and it is why once a day became possible',
        laymanDesc:
          'One tablet, once daily, taken on an empty stomach and usually at bedtime so the dizziness happens while asleep. The regimen it replaced needed dosing every eight hours around meals.',
        molecularDetail:
          'Terminal half-life is 40 to 55 hours after multiple dosing, which is what supports once-daily administration and also what makes the drug the last one to disappear when a regimen is stopped, leaving a period of effective monotherapy in which resistance can be selected. A high-fat meal raises exposure enough that the label specifies dosing on an empty stomach. Efavirenz induces its own metabolism through CYP3A4 and is cleared principally by CYP2B6.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into cells, and also into the brain',
        laymanDesc:
          'The molecule is small and greasy, so it moves into cells without help. It also crosses into the central nervous system, which is where the vivid dreams, dizziness and mood changes come from.',
        molecularDetail:
          'Efavirenz is highly lipophilic and over 99% protein-bound, and it distributes into the central nervous system, where its concentration correlates with neuropsychiatric symptom frequency. Plasma exposure varies roughly three-fold by CYP2B6 516 genotype, so the same milligram dose is a different pharmacological dose in different people, and the slow-metaboliser genotype is markedly more common in populations of African ancestry.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It wedges into a pocket that only exists once it arrives',
        laymanDesc:
          'Beside the working part of the copying enzyme there is a greasy gap that opens only when a drug like this pushes into it. Efavirenz forces it open and stays there.',
        molecularDetail:
          'The non-nucleoside binding pocket in the p66 subunit is not present in the unliganded enzyme; it is created by rotation of tyrosine 181 and tyrosine 188 out of the way as the drug binds. The site sits about 10 angstroms from the polymerase catalytic triad, so inhibition is allosteric and non-competitive with respect to the nucleotide substrate.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The enzyme can no longer flex, so it cannot copy',
        laymanDesc:
          'Copying DNA requires the enzyme to move through a repeating cycle of shapes. With the drug wedged in place the structure is rigid. The enzyme is still there and still holding the genetic material; it simply cannot complete a step.',
        molecularDetail:
          'Binding restricts mobility of the thumb subdomain and the primer grip, so the enzyme cannot execute the conformational change that follows nucleotide binding. Catalysis is blocked rather than the substrate being displaced. Because the pocket has no catalytic role, K103N and Y181C abolish binding while leaving polymerase function intact, which is why a single substitution confers high-level resistance across the entire first-generation class.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus falls fast, and stays down until one mutation arrives',
        laymanDesc:
          'Viral load drops and stays down, in nine out of ten patients at two years in the trials. What ends it is not gradual loss of effect but a single mutation, which then also removes every other drug in the same family.',
        molecularDetail:
          'Week 96 suppression below 50 copies per millilitre was 89% in ACTG 5142 and 90% at either dose in ENCORE1. Failure is typically abrupt and accompanied by K103N, which confers high-level cross-resistance to efavirenz and nevirapine at no measurable fitness cost, so the mutation persists in the reservoir and in transmitted virus. Pretreatment non-nucleoside resistance reached an estimated 11.0% in southern Africa by 2016, which is the reason the global first line moved to dolutegravir.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 006 (DMP 266-006)',
        phase: 'Phase 3, randomised, open-label, three arms',
        sampleSize: 450,
        primaryEndpoint:
          'Proportion with plasma HIV-1 RNA suppressed to undetectable levels against indinavir-based therapy',
        endpointMet: true,
        statisticalPValue: '70% versus 48%, p<0.001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ACTG 5142 (NCT00050895)',
        phase: 'Phase 3, randomised, open-label, three arms, median 112-week follow-up',
        sampleSize: 757,
        primaryEndpoint:
          'Time to virological failure against lopinavir-ritonavir and against a nucleoside-sparing regimen',
        endpointMet: true,
        statisticalPValue:
          'p=0.006 for time to failure; 89% versus 77% below 50 copies per millilitre at week 96, p=0.003',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ENCORE1 (NCT01011413)',
        phase:
          'Randomised, double-blind, placebo-controlled, non-inferiority, 48-week primary with 96-week follow-up',
        sampleSize: 630,
        primaryEndpoint:
          'Difference in the proportion with viral load below 200 copies per millilitre at week 48, efavirenz 400 mg against 600 mg',
        endpointMet: true,
        statisticalPValue:
          '94.1% versus 92.2%, difference 1.85% (95% CI -2.1 to 5.79); at week 96, 90.0% versus 90.6% (95% CI -5.2 to 4.0, p=0.72)',
        unreportedAdverseSignals:
          'The reduced dose produced significantly fewer drug-related adverse events and fewer discontinuations for them, and higher CD4 counts. The trial was funded by a foundation and a university, sixteen years after the higher dose was registered.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId:
          'Pooled ACTG suicidality analysis (NCT00013520, NCT00050895, NCT00084136, NCT00118898)',
        phase: 'Participant-level pooled analysis of four randomised treatment-naive trials',
        sampleSize: 5332,
        primaryEndpoint:
          'Time to suicidality, defined as suicidal ideation or attempted or completed suicide, efavirenz-containing against efavirenz-free regimens',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 2.28 (95% CI 1.27 to 4.10, p=0.006); attempted or completed suicide hazard ratio 2.58 (95% CI 0.94 to 7.06, p=0.065)',
        unreportedAdverseSignals:
          'Eight suicides in the efavirenz group against one. There was no standardised suicidality questionnaire, and efavirenz was open-label in three of the four contributing studies. A routine-care cohort using marginal structural models later found a weighted hazard ratio of 1.21 (95% CI 0.66 to 2.28).',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '70% suppressed against 48% on indinavir-based therapy in Study 006, with discontinuation for adverse events of 27% against 43%',
        '89% against 77% below 50 copies per millilitre at week 96 against lopinavir-ritonavir in ACTG 5142 (p=0.003)',
        '400 mg non-inferior to 600 mg at 48 and 96 weeks, with significantly fewer drug-related adverse events and 25 more CD4 cells per microlitre',
        'Median efavirenz 24-hour exposure of 44, 60 and 130 microgram-hours per millilitre across CYP2B6 516 G/G, G/T and T/T genotypes (p<0.0001)',
      ],
      unsupportedInferences: [
        'That central nervous system defects in three of twenty cynomolgus monkey fetuses predicted human teratogenicity — 2,026 first-trimester human exposures produced one neural tube defect',
        'That the two-fold suicidality hazard measured in randomised trial populations transfers unchanged to routine care, where a cohort analysis found a weighted hazard ratio of 1.21',
        'That the dose carried from phase 2 into registration was the dose the drug required, which held as an assumption for sixteen years and was wrong by a third',
      ],
      whatFailedInitially: [
        'The pregnancy contraindication restricted access for women of childbearing potential for roughly a decade on preclinical primate data, and was reversed in the 2013 WHO guidelines',
        'The single-mutation resistance barrier drove pretreatment non-nucleoside resistance to an estimated 11.0% in southern Africa by 2016, above the WHO 10% threshold for changing national first-line therapy',
      ],
      realWorldOutcome: [
        'Made once-daily HIV therapy possible and carried the global treatment programme for roughly fifteen years',
        'Displaced as first-line in the WHO and United States guidelines by dolutegravir, principally because of transmitted resistance rather than because of efficacy',
        'Generic at US$1.35 per tablet at United States pharmacy acquisition cost, at a dose an independent trial showed could be reduced by a third',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and film-coated tablet, single agent and in fixed-dose combinations',
      description:
        'Taken once daily on an empty stomach, conventionally at bedtime so that the central nervous system effects occur during sleep. A high-fat meal raises exposure enough to matter. Efavirenz both induces and is metabolised by cytochrome P450 enzymes, principally CYP2B6 with a CYP3A4 contribution, which makes its interaction list long and includes rifampicin, methadone, hormonal contraceptives and several antifungals.',
      safetyProfile:
        'Central nervous system effects occur in more than half of patients in the first weeks: dizziness, abnormal dreams, impaired concentration, insomnia. Most attenuate but not all do. Psychiatric symptoms including severe depression are labelled, and the randomised suicidality signal is described in the audits above. Rash occurs commonly and is usually mild. Hepatotoxicity, hyperlipidaemia and gynaecomastia are labelled. The pregnancy contraindication that once accompanied this drug has been removed following human birth-outcome data, and the WHO recommends it throughout pregnancy including the first trimester.',
    },
    commonQuestions: [
      {
        q: 'Why is the standard dose 600 mg when trials showed 400 mg works?',
        a: 'Because nobody with a commercial interest in the answer had a reason to ask the question. The 600 mg dose came out of phase 2 dose-ranging in the mid-1990s and went into registration in 1998. In 2014 ENCORE1, funded by the Bill and Melinda Gates Foundation and UNSW Australia, randomised 630 treatment-naive adults double-blind to 400 mg or 600 mg with tenofovir and emtricitabine. At week 48, 94.1% against 92.2% were below 200 copies per millilitre, the lower dose produced higher CD4 counts by 25 cells per microlitre, significantly fewer drug-related adverse events, and a third as many discontinuations for them. The result held at 96 weeks. The reduced dose is now in the WHO guidelines. The wider point is that dose optimisation after approval is nobody commercial responsibility, and this is what it is worth when someone does it anyway.',
        auditNote:
          'One third of the active ingredient in every efavirenz tablet on earth, removable at no measured cost in efficacy, undiscovered for sixteen years.',
      },
      {
        q: 'Is it safe in pregnancy?',
        a: 'Yes, on current evidence, and the history of that answer is worth knowing. Efavirenz was originally contraindicated in the first trimester because central nervous system malformations occurred in three of twenty cynomolgus monkey fetuses. Human data accumulated slowly and were pooled repeatedly. By 2014 the meta-analysis covered 2,026 live births after first-trimester exposure, with 44 congenital anomalies in total, a pooled proportion of 1.63%, and exactly one neural tube defect, an incidence of 0.05% and no different from the general population. Against non-efavirenz regimens the relative risk of any anomaly was 0.78 (95% CI 0.56 to 1.08). The WHO changed its guidance in 2013 to recommend efavirenz throughout pregnancy.',
        auditNote:
          'A primate finding held the line for a decade in exactly the settings where the drug was the only realistic option. The reversal came from counting human pregnancies.',
      },
      {
        q: 'Does efavirenz cause suicidal thoughts?',
        a: 'The evidence points in two directions and has not been reconciled. A pooled analysis of four randomised trials, 5,332 participants with a median 96 weeks of follow-up, found suicidality at 8.08 against 3.66 per 1,000 person-years, a hazard ratio of 2.28 (95% CI 1.27 to 4.10), with eight suicides against one. That is a randomised comparison and it is the strongest design available. A cohort of 597 adults in routine United States care, analysed with methods designed to remove the bias that comes from doctors avoiding the drug in patients they are worried about, found a weighted hazard ratio of 1.21 (95% CI 0.66 to 2.28). A 2021 analysis that reweighted the trial result onto a routine-care population found the estimate attenuated by more than 20%. Central nervous system effects in general are common, dose-related, and larger in people with the slow-metaboliser CYP2B6 genotype.',
      },
      {
        q: 'Why did the world move off efavirenz?',
        a: 'Resistance, not efficacy. Efavirenz still suppresses virus in around nine of ten patients who take it. But its binding pocket is not part of the enzyme catalytic machinery, so a single amino-acid substitution at position 103 abolishes drug binding while costing the virus nothing, and that mutation then persists and is transmitted. A meta-regression of 358 datasets covering 56,044 adults estimated pretreatment non-nucleoside resistance in 2016 at 11.0% in southern Africa and 10.1% in eastern Africa, against a WHO threshold of 10% for changing national first-line therapy. Dolutegravir has the opposite property: its resistance mutations impose a fitness cost, and no treatment-naive trial has selected one.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for efavirenz could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost. For this molecule the more interesting economic fact is the dose rather than the price.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Staszewski S, Morales-Ramirez J, Tashima KT, et al. Efavirenz plus zidovudine and lamivudine, efavirenz plus indinavir, and indinavir plus zidovudine and lamivudine in the treatment of HIV-1 infection in adults. Study 006 Team. N Engl J Med 1999;341:1865-1873',
        identifier: '10.1056/NEJM199912163412501',
        kind: 'doi',
      },
      {
        label:
          'Riddler SA, Haubrich R, DiRienzo AG, et al. Class-sparing regimens for initial treatment of HIV-1 infection. N Engl J Med 2008;358:2095-2106',
        identifier: '10.1056/NEJMoa074609',
        kind: 'doi',
      },
      {
        label:
          'ENCORE1 Study Group. Efficacy of 400 mg efavirenz versus standard 600 mg dose in HIV-infected, antiretroviral-naive adults (ENCORE1): a randomised, double-blind, placebo-controlled, non-inferiority trial. Lancet 2014;383:1474-1482',
        identifier: '10.1016/S0140-6736(13)62187-X',
        kind: 'doi',
      },
      {
        label:
          'Carey D, Puls R, Amin J, et al. Efficacy and safety of efavirenz 400 mg daily versus 600 mg daily: 96-week data from the randomised, double-blind, placebo-controlled, non-inferiority ENCORE1 study. Lancet Infect Dis 2015;15:793-802',
        identifier: '10.1016/S1473-3099(15)70060-5',
        kind: 'doi',
      },
      {
        label:
          'Ford N, Mofenson L, Shubber Z, et al. Safety of efavirenz in the first trimester of pregnancy: an updated systematic review and meta-analysis. AIDS 2014;28 Suppl 2:S123-S131',
        identifier: '10.1097/QAD.0000000000000231',
        kind: 'doi',
      },
      {
        label:
          'Mollan KR, Smurzynski M, Eron JJ, et al. Association between efavirenz as initial therapy for HIV-1 infection and increased risk for suicidal ideation or attempted or completed suicide: an analysis of trial data. Ann Intern Med 2014;161:1-10',
        identifier: '10.7326/M14-0293',
        kind: 'doi',
      },
      {
        label:
          'Bengtson AM, Pence BW, Mollan KR, et al. The relationship between efavirenz as initial antiretroviral therapy and suicidal thoughts among HIV-infected adults in routine care. J Acquir Immune Defic Syndr 2017;76:402-408',
        identifier: '10.1097/QAI.0000000000001510',
        kind: 'doi',
      },
      {
        label:
          'Mollan KR, Pence BW, Xu S, et al. Transportability from randomized trials to clinical care: on initial HIV treatment with efavirenz and suicidal thoughts or behaviors. Am J Epidemiol 2021;190:2075-2084',
        identifier: '10.1093/aje/kwab136',
        kind: 'doi',
      },
      {
        label:
          'Gupta RK, Gregson J, Parkin N, et al. HIV-1 drug resistance before initiation or re-initiation of first-line antiretroviral therapy in low-income and middle-income countries: a systematic review and meta-regression analysis. Lancet Infect Dis 2018;18:346-355',
        identifier: '10.1016/S1473-3099(17)30702-8',
        kind: 'doi',
      },
      {
        label:
          'Haas DW, Ribaudo HJ, Kim RB, et al. Pharmacogenetics of efavirenz and central nervous system side effects: an Adult AIDS Clinical Trials Group study. AIDS 2004;18:2391-2400',
        identifier: '10.1097/00002030-200409030-00003',
        kind: 'doi',
      },
      {
        label: 'ENCORE1: reduced versus standard dose efavirenz with tenofovir and emtricitabine',
        identifier: 'NCT01011413',
        kind: 'nct',
      },
      {
        label: 'ACTG A5142: efavirenz, lopinavir-ritonavir, or both without nucleosides',
        identifier: 'NCT00050895',
        kind: 'nct',
      },
      {
        label: 'ACTG A5095: three initial treatments without a protease inhibitor',
        identifier: 'NCT00013520',
        kind: 'nct',
      },
      {
        label: 'ACTG A5175 (PEARLS): prospective evaluation of antiretroviral combinations',
        identifier: 'NCT00084136',
        kind: 'nct',
      },
      {
        label:
          'ACTG A5202: efavirenz or atazanavir-ritonavir with emtricitabine-tenofovir or abacavir-lamivudine',
        identifier: 'NCT00118898',
        kind: 'nct',
      },
      {
        label:
          'SUSTIVA (efavirenz) capsules — Drugs@FDA application NDA 020972, Bristol Myers Squibb, original approval 17 September 1998',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020972',
        kind: 'regulatory',
      },
      {
        label:
          'SUSTIVA (efavirenz) tablets — Drugs@FDA application NDA 021360, Bristol Myers Squibb',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021360',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 64139 — efavirenz structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/64139',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Rilpivirine — non-inferior on the headline and worse in the subgroup the label had to name,
  //    and now the other half of the first HIV regimen that is not a tablet.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'rilpivirine',
    name: 'Rilpivirine',
    tradeName:
      'Edurant and Edurant PED; the injectable partner in Cabenuva; also in Complera and Odefsey',
    sponsor:
      'Janssen Products (originated at Tibotec); the fixed-dose oral combinations are marketed by Gilead Sciences and the injectable by ViiV Healthcare',
    targetGene: 'HIV-1 pol, reverse transcriptase coding region',
    targetProtein:
      'HIV-1 reverse transcriptase, inhibited allosterically at the non-nucleoside pocket by a diarylpyrimidine that can rotate within the site rather than being locked into one conformation',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2011,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in treatment-naive patients aged 2 years and older weighing at least 14 kg with HIV-1 RNA at or below 100,000 copies per millilitre; and, with cabotegravir, for the treatment of virologically suppressed adults and adolescents with no history of treatment failure and no known resistance to either agent',
    patientFriendlyIndication:
      'HIV-1 infection, in people starting treatment with a lower viral load, or as maintenance therapy with cabotegravir',
    anatomicalSite:
      'HIV-1 reverse transcriptase in the cytoplasm of infected CD4-positive T cells; for the injectable form, the gluteal muscle acts as the depot',
    conditionContext: {
      conditionExplainer:
        'HIV-1 must copy its RNA genome into DNA using reverse transcriptase before anything else can happen. Rilpivirine belongs to the same class as efavirenz and binds the same pocket beside the enzyme active site, but it was designed after that pocket was understood, with flexibility built into the molecule so that the mutations that defeat the first generation do not automatically defeat it.',
      whyItMatters:
        'Rilpivirine is the drug that carried the class past its own resistance problem, and it is half of the first HIV regimen in history that is not a tablet. It is also the clearest case in this group of a non-inferiority result that concealed a subgroup, and the FDA wrote that subgroup into the indication rather than into a footnote.',
      whoTakesThis:
        'People starting treatment with a viral load at or below 100,000 copies per millilitre, and virologically suppressed people who have switched to monthly or two-monthly injections of cabotegravir and rilpivirine.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre and kept there, without selecting the E138K and K101E mutations that would remove the rest of the class.',
    },
    oneSentenceVerdict:
      'A second-generation non-nucleoside inhibitor flexible enough to keep binding reverse transcriptase through the mutations that defeat efavirenz; it matched efavirenz at 78% suppressed at 96 weeks with half the grade 2 to 4 adverse events, but failed virologically more often, and specifically enough above 100,000 copies per millilitre that the FDA restricted the indication below that line.',
    laymanHowItWorks:
      'Reverse transcriptase has a greasy side pocket that is not part of the machinery that does the copying. Wedge something into it and the enzyme goes stiff and stops working. The first drug that did this, efavirenz, was rigid, so a single change to the shape of the pocket threw it out. Rilpivirine has hinges in it. When the pocket changes shape, the drug rotates and re-fits, which is why it still works against virus that efavirenz cannot touch.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 73,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$114.50 per tablet at United States pharmacy acquisition cost, median across five listed products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The oral tablet is on patent in high-income markets. The molecule is also supplied as a long-acting injectable nanosuspension inside Cabenuva, whose price is not carried in the NADAC tablet file quoted above; no injectable figure is stated here because none was verified. Janssen has licensed rilpivirine to the Medicines Patent Pool.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Rilpivirine sits between the drug it was built to improve on and the drug that replaced both. The comparison that matters most is with doravirine, which occupies the same pocket with fewer restrictions attached.',
      conventionalRx: [
        {
          name: 'Efavirenz (generic)',
          class: 'Non-nucleoside reverse transcriptase inhibitor, first generation',
          howItCompares:
            'The direct comparator in both registration trials. At 96 weeks both reached 78% suppressed, but rilpivirine had more virological failure and efavirenz had roughly twice the grade 2 to 4 treatment-related adverse events, four times the rash and three times the dizziness.',
          typicalCost:
            'US$1.35 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, no baseline viral load restriction, no food requirement of this kind. Cons: central nervous system effects, higher lipids, and a resistance profile that ended its use as global first line.',
        },
        {
          name: 'Doravirine (Pifeltro)',
          class: 'Non-nucleoside reverse transcriptase inhibitor, later generation',
          howItCompares:
            'The same pocket, without the baseline viral load restriction and without the proton pump inhibitor contraindication. It is the drug a clinician reaches for when the reason to avoid an integrase inhibitor is a real one.',
          typicalCost:
            'US$92.89 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: no viral load ceiling, no acid-suppression contraindication, lipid-neutral. Cons: still a one-mutation class, and no generic.',
        },
        {
          name: 'Dolutegravir (Tivicay)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'A different mechanism with a materially higher resistance barrier and no baseline viral load restriction. It is what both non-nucleosides above were displaced by in the guidelines.',
          typicalCost:
            'US$105.03 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: no treatment-naive trial has selected resistance to it, works at any baseline viral load. Cons: more weight gained, and it is not available as an injectable partner in the way rilpivirine is.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=CC(=CC(=C1NC2=NC(=NC=C2)NC3=CC=C(C=C3)C#N)C)/C=C/C#N',
      chemicalFormula: 'C22H18N6',
      molecularWeight: '366.40 g/mol (free base); dispensed as rilpivirine hydrochloride',
      targetReceptorAffinity:
        'Binds the non-nucleoside pocket of the p66 subunit of HIV-1 reverse transcriptase. The design principle is conformational flexibility rather than affinity: the diarylpyrimidine scaffold has two rotatable bonds either side of the central pyrimidine, so when a resistance substitution changes the shape of the pocket the molecule can adopt an alternative bound conformation instead of losing contact. This is the property that retains activity against K103N, and the reason its own resistance pattern runs through E138K and K101E, which alter the pocket in ways rotation cannot compensate for. It is also extremely lipophilic and poorly water-soluble, which is what makes the long-acting injectable nanosuspension possible.',
      structureSource: {
        label: 'PubChem CID 6451164 (rilpivirine) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6451164',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rpv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Geometric isomer control of the acrylonitrile side chain',
          description:
            'Establish the E to Z ratio at the cyanovinyl double bond. The E isomer is the drug; the Z isomer is a distinct compound with different binding, and because the isomerisation is photochemical this is a specification that has to hold through manufacture, packaging and storage rather than only at release.',
          reagentsAndBuffer:
            'Rilpivirine reference standard, reversed-phase HPLC with photodiode array detection under amber-glass handling, proton NMR for coupling-constant confirmation of the E geometry, Karl Fischer titration',
        },
        {
          id: 'rpv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Sequential amination of the dichloropyrimidine and Heck cyanovinylation',
          description:
            'Displace the two pyrimidine chlorides in order with 4-aminobenzonitrile and with the substituted aniline, then install the acrylonitrile by palladium-catalysed Heck coupling onto the aryl bromide. Order matters: the two aminations are not equally activated, and running them out of sequence gives the regioisomer rather than the drug.',
          dependsOnStepId: 'rpv-w1',
          reagentsAndBuffer:
            '2,4-dichloropyrimidine, 4-aminobenzonitrile, 4-bromo-2,6-dimethylaniline, acrylonitrile, palladium(II) acetate with a phosphine ligand, N,N-diisopropylethylamine in N-methylpyrrolidone under nitrogen',
        },
        {
          id: 'rpv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and particle size control for the two dosage forms',
          description:
            'Form the hydrochloride and crystallise it, then split the material by particle size. The tablet needs one specification; the long-acting injectable is a nanosuspension whose release rate over a month is set by particle size distribution, so the same molecule needs two entirely different physical specifications from the same crystallisation.',
          dependsOnStepId: 'rpv-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol, controlled cooling crystallisation, wet bead milling with poloxamer stabiliser for the nanosuspension, laser diffraction particle size analysis, X-ray powder diffraction for polymorph identity',
        },
        {
          id: 'rpv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'PBMC infection across a resistance-mutant panel with a low-pH arm',
          description:
            'Infect primary cells with wild-type virus and with a panel carrying K103N, Y181C, E138K and K101E, and run a parallel arm at altered gastric-simulating pH to model the acid-suppression interaction. Both are properties this molecule is defined by: it survives the first two mutations and it does not survive a proton pump inhibitor.',
          dependsOnStepId: 'rpv-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, HIV-1 NL4-3 wild-type plus K103N, Y181C, E138K and K101E site-directed mutants, simulated gastric fluid at pH 1.5 and pH 6.5 for dissolution comparison',
        },
        {
          id: 'rpv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fold-change potency table and nanosuspension release kinetics',
          description:
            'Report EC50 fold change for each mutant against wild-type, and separately measure drug release from the nanosuspension over weeks. The second measurement is what defines the injectable product, and it is also the source of its most important risk: a depot that empties slowly leaves subtherapeutic drug behind for months.',
          dependsOnStepId: 'rpv-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 p66/p51 reverse transcriptase, wild-type and mutant enzymes, luciferase reporter readout, dialysis-membrane and flow-through release apparatus for the nanosuspension, LC-MS/MS quantification of released drug',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rpv-a1',
        category: 'measured',
        title:
          'ECHO: 83% against 83%, with twice the virological failure and half the side effects',
        laymanSummary:
          'Against efavirenz with the same nucleoside backbone, rilpivirine matched it exactly at 48 weeks. Underneath that tie, it failed virologically about twice as often and caused about half as many moderate-to-severe side effects.',
        technicalDetails:
          'ECHO (NCT00540449) randomised 690 treatment-naive adults at 112 sites in 21 countries, double-blind and double-dummy, to rilpivirine 25 mg or efavirenz 600 mg once daily, each with tenofovir disoproxil fumarate and emtricitabine. At week 48, 287 of 346 (83%) and 285 of 344 (83%) had a confirmed response below 50 copies per millilitre by the intention-to-treat time-to-loss-of-virological-response algorithm; the logistic regression point estimate for the difference was -0.4 (95% CI -5.9 to 5.2) against a 12% non-inferiority margin. Virological failure was 13% against 6% (11% against 4% by the same algorithm). Grade 2 to 4 adverse events occurred in 55 (16%) against 108 (31%), p<0.0001, and discontinuation for adverse events in 8 (2%) against 27 (8%). Plasma lipid increases were significantly lower on rilpivirine.',
        evidenceSource: 'Molina JM et al., Lancet 2011;378:238-246 (ECHO, NCT00540449)',
        doi: '10.1016/S0140-6736(11)60936-7',
        measuredMetric:
          'Confirmed response below 50 copies per millilitre at week 48, ITT-TLOVR; difference -0.4 (95% CI -5.9 to 5.2)',
        auditFlag: 'verified',
      },
      {
        id: 'rpv-a2',
        category: 'measured',
        title: 'THRIVE: 86% against 82% across three different nucleoside backbones',
        laymanSummary:
          'The companion trial let investigators pick the two background drugs rather than fixing them, which tests whether the result depends on what it is combined with. It did not: 86% against 82%, and the same halving of moderate-to-severe side effects.',
        technicalDetails:
          'THRIVE (NCT00543725) randomised 680 treatment-naive adults at 98 centres in 21 countries, double-blind and double-dummy, to rilpivirine 25 mg or efavirenz 600 mg with an investigator-selected background of tenofovir disoproxil-emtricitabine, zidovudine-lamivudine or abacavir-lamivudine. At week 48, 291 of 340 (86%) against 276 of 338 (82%) responded by ITT-TLOVR, difference 3.5% (95% CI -1.7 to 8.8), non-inferiority p<0.0001 against a 12% margin. Virological failure was 24 of 340 (7%) against 18 of 338 (5%). Discontinuation for adverse events was 15 (4%) against 25 (7%), and grade 2 to 4 treatment-related adverse events 54 (16%) against 104 (31%), p<0.0001, with rash, dizziness and lipid increases all significantly lower on rilpivirine.',
        evidenceSource: 'Cohen CJ et al., Lancet 2011;378:229-237 (THRIVE, NCT00543725)',
        doi: '10.1016/S0140-6736(11)60983-5',
        measuredMetric:
          'Confirmed response below 50 copies per millilitre at week 48, ITT-TLOVR; difference 3.5% (95% CI -1.7 to 8.8)',
        auditFlag: 'verified',
      },
      {
        id: 'rpv-a3',
        category: 'failed',
        title:
          'The non-inferiority result concealed a subgroup, and the FDA put it in the indication',
        laymanSummary:
          'Overall the two drugs tied at 78% at two years. In people whose viral load was above 100,000 copies per millilitre when they started, rilpivirine did worse and failed more often. The FDA did not deal with that in a warning: it wrote the ceiling into what the drug is approved for.',
        technicalDetails:
          'The pooled 96-week analysis of ECHO and THRIVE covered 1,368 patients and found response rates of 78% in both groups. Responses were similar across background regimen, sex and race, and in patients with more than 95% adherence or a baseline viral load at or below 100,000 copies per millilitre. Responses were lower and virological failure higher for rilpivirine in patients with 95% or less adherence, or with a baseline viral load above 100,000 copies per millilitre. In the restricted subgroup at or below 100,000 copies per millilitre, 543 patients gave 84% against 81% at week 96 with virological failure of 5.9% against 2.4%. The Edurant prescribing information carries the consequence in section 1.1: the treatment-naive indication is limited to patients with HIV-1 RNA at or below 100,000 copies per millilitre, with a Limitations of Use statement that more treated subjects above that threshold experienced virological failure. A non-inferiority margin of 12% is wide enough to absorb a real subgroup difference, and this is what it looks like when it does.',
        evidenceSource:
          'Cohen CJ et al., AIDS 2013;27:939-950 (pooled 96-week ECHO and THRIVE); Behrens G et al., AIDS Patient Care STDS 2014;28:168-175; EDURANT prescribing information, NDA 202022, Drugs@FDA',
        doi: '10.1097/QAD.0b013e32835cee6e',
        measuredMetric:
          'Virological failure by baseline viral load stratum, and the resulting FDA indication ceiling of 100,000 copies per millilitre',
        auditFlag: 'caution',
      },
      {
        id: 'rpv-a4',
        category: 'measured',
        title: 'ATLAS and FLAIR: monthly injections held suppression in 1,182 people',
        laymanSummary:
          'Two trials switched already-suppressed patients from daily tablets to a monthly injection of cabotegravir and rilpivirine. It worked as well as staying on tablets, with the same small number of failures in each arm. Eighty-three per cent of injection recipients had a reaction at the injection site.',
        technicalDetails:
          'ATLAS (NCT02951052) and FLAIR (NCT02938520) were randomised, open-label, multinational phase 3 trials in adults with plasma HIV-1 RNA below 50 copies per millilitre, randomised 1:1 to continue current therapy or switch to monthly intramuscular cabotegravir with rilpivirine after a four-week oral lead-in. The pooled intention-to-treat exposed population was 591 per arm, 28% women by sex at birth and 19% aged 50 or over. Non-inferiority was met at week 48 for the primary endpoint of HIV-1 RNA at or above 50 copies per millilitre by FDA snapshot, against a 4% margin, and for the key secondary endpoint below 50 copies per millilitre. Seven participants in each arm (1.2%) had confirmed virological failure, defined as two consecutive measurements at or above 200 copies per millilitre. Injection site reactions occurred in 83% of long-acting recipients, decreased in incidence over time, and led to withdrawal of 6 participants (1%). Serious adverse events were 4% in each arm.',
        evidenceSource:
          'Rizzardini G et al., J Acquir Immune Defic Syndr 2020;85:498-506 (pooled ATLAS NCT02951052 and FLAIR NCT02938520)',
        doi: '10.1097/QAI.0000000000002466',
        measuredMetric:
          'Proportion with HIV-1 RNA at or above 50 copies per millilitre at week 48, FDA snapshot, against a 4% non-inferiority margin',
        auditFlag: 'verified',
      },
      {
        id: 'rpv-a5',
        category: 'inferred',
        title: 'Same number of failures, different consequences: 6 of 7 carried resistance',
        laymanSummary:
          'The injection and the tablets failed equally rarely. But of the seven failures on injections, six had developed resistance mutations, against three of seven on tablets. When a drug takes months to leave the body, failure is not a moment; it is a long stretch of too little drug.',
        technicalDetails:
          'In the pooled ATLAS and FLAIR analysis, confirmed virological failure occurred in 7 of 591 in each arm. Resistance-associated mutations were found in 6 of 7 long-acting failures against 3 of 7 on continued oral therapy. The mechanism is pharmacokinetic rather than virological: rilpivirine released from an intramuscular nanosuspension declines over months rather than days, so a person who stops attending for injections, or who fails for any reason, spends an extended period with drug concentrations below the level that suppresses virus and above the level that selects for resistance. This is the property the oral lead-in and the resistance-history exclusions in the label exist to manage. The count of 6 against 3 is measured. That this reflects the long pharmacokinetic tail rather than chance in a total of 14 events is an inference, well grounded mechanistically and made on small numbers.',
        evidenceSource:
          'Rizzardini G et al., J Acquir Immune Defic Syndr 2020;85:498-506; EDURANT prescribing information, NDA 202022, Drugs@FDA',
        doi: '10.1097/QAI.0000000000002466',
        inferredClaim:
          'That the higher proportion of resistance among long-acting failures is caused by the slow decline of drug from the intramuscular depot — mechanistically coherent, and resting on 6 events against 3',
        auditFlag: 'caution',
      },
      {
        id: 'rpv-a6',
        category: 'measured',
        title:
          'A stomach acid drug can end it, and that is a contraindication rather than a caution',
        laymanSummary:
          'Rilpivirine only dissolves in an acidic stomach. Proton pump inhibitors, among the most widely used drugs in the world, raise stomach pH enough that rilpivirine absorption falls far enough to lose control of the virus. The label lists them as contraindicated, not as an interaction to watch.',
        technicalDetails:
          'The Edurant prescribing information contraindicates co-administration with all proton pump inhibitors named as a class, on the stated ground that significant decreases in rilpivirine plasma concentration may occur through gastric pH increase, and that this may result in loss of virological response and possible resistance to rilpivirine or to the non-nucleoside class. The same contraindication table covers the CYP3A inducers carbamazepine, oxcarbazepine, phenobarbital, phenytoin, rifampin, rifapentine, more than single-dose systemic dexamethasone, and St John wort. Rilpivirine is also the rare antiretroviral whose absorption requires a meal rather than merely being improved by one. The audit point is not that an interaction exists but that the class of drug most likely to be taken alongside it without either party thinking about it is the class that ends it.',
        evidenceSource:
          'EDURANT and EDURANT PED prescribing information, section 4 Contraindications, NDA 202022, Drugs@FDA',
        doi: '10.1016/S0140-6736(11)60936-7',
        measuredMetric:
          'Labelled contraindication with all proton pump inhibitors and seven CYP3A inducers, on the ground of loss of virological response and possible class resistance',
        auditFlag: 'verified',
      },
      {
        id: 'rpv-a7',
        category: 'inferred',
        title: 'The flexibility that beats K103N does not beat E138K, and that is the trade',
        laymanSummary:
          'Rilpivirine was designed to bend so that mutations which throw efavirenz out cannot throw it out. That worked. But it created its own mutations, and one of them is selected by the very drug most often paired with it.',
        technicalDetails:
          'The diarylpyrimidine scaffold retains activity against K103N, the substitution that ends efavirenz and nevirapine, because it can rotate into an alternative bound conformation. Its own resistance pathway runs principally through E138K and K101E. E138K is the point that is easy to miss: it also reduces susceptibility to emtricitabine and lamivudine, so a rilpivirine failure with E138K can compromise the nucleoside backbone it was taken with rather than only the non-nucleoside. The pooled 96-week analysis reports that rilpivirine resistance-associated mutations beyond week 48 were consistent with those observed in year 1, and that the majority of virological failures occurred within the first 48 weeks. What is measured is the mutation pattern at failure. What is inferred, and is the reason the drug is positioned where it is, is that the net resistance cost of a rilpivirine failure is higher than the class-level cost of an efavirenz failure, which no trial has compared head to head as an endpoint.',
        evidenceSource:
          'Cohen CJ et al., AIDS 2013;27:939-950; Molina JM et al., Lancet 2011;378:238-246',
        doi: '10.1097/QAD.0b013e32835cee6e',
        inferredClaim:
          'That a virological failure on rilpivirine costs more future options than a failure on efavirenz, because E138K reaches the nucleoside backbone as well as the non-nucleoside',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed with a meal, because without one it barely dissolves',
        laymanDesc:
          'The tablet has to be taken with food, and not as a suggestion. On an empty stomach, or with a drug that reduces stomach acid, enough less of it is absorbed that the virus can escape.',
        molecularDetail:
          'Rilpivirine is highly lipophilic and its dissolution is pH-dependent, requiring gastric acidity. Exposure falls substantially when taken without food or alongside acid-suppressing agents, which is why proton pump inhibitors are contraindicated outright rather than flagged, and why H2 antagonists carry a timing separation on the label. The same lipophilicity and low aqueous solubility are exactly what make a month-long intramuscular depot possible.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Or injected into muscle, where it sits and releases for a month',
        laymanDesc:
          'The other form is a suspension of drug crystals injected into the buttock. The crystals dissolve slowly, releasing drug for a month or two, which is why an injection can replace daily tablets.',
        molecularDetail:
          'The long-acting form is a nanocrystal suspension stabilised with a poloxamer, injected intramuscularly, where dissolution rate is set by particle surface area. Release continues for months after the last injection, giving a pharmacokinetic tail that is the therapeutic benefit and the principal risk in the same property: drug concentrations decline through the subtherapeutic range slowly rather than abruptly.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'It enters cells and wedges into the pocket beside the copying machinery',
        laymanDesc:
          'Inside the cell the drug slots into the same greasy side pocket that efavirenz uses, next to but not inside the part of the enzyme that does the chemistry.',
        molecularDetail:
          'Rilpivirine binds the non-nucleoside pocket in the p66 subunit of reverse transcriptase, roughly 10 angstroms from the polymerase catalytic site, and inhibits allosterically rather than competing with the nucleotide substrate. Plasma protein binding exceeds 99%, principally to albumin.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'When the pocket changes shape, the drug rotates instead of falling out',
        laymanDesc:
          'This is what makes it different from the drug before it. Rilpivirine has two hinges. If a mutation reshapes the pocket, the molecule turns and finds a new fit rather than losing its grip.',
        molecularDetail:
          'The two rotatable bonds flanking the central pyrimidine allow multiple bound conformations, so substitutions such as K103N that abolish efavirenz binding leave rilpivirine active. Compensation has limits: E138K and K101E change the pocket in ways rotation does not accommodate, and E138K additionally reduces susceptibility to emtricitabine and lamivudine, so it reaches beyond its own class.',
        iconName: 'RefreshCw',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'The enzyme stalls, and suppression holds unless the starting viral load was high',
        laymanDesc:
          'Copying stops and viral load falls. It stays down in about four out of five people at two years, but a person who started with a very high viral load is measurably more likely to be in the fifth.',
        molecularDetail:
          'Pooled 96-week suppression was 78% for rilpivirine and 78% for efavirenz. Within the population with baseline viral load at or below 100,000 copies per millilitre, week 96 suppression was 84% against 81% with virological failure of 5.9% against 2.4%. Above that threshold both response and failure moved against rilpivirine, which is why the FDA indication stops there. Most virological failures occurred in the first 48 weeks.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ECHO (NCT00540449)',
        phase: 'Phase 3, randomised, double-blind, double-dummy, non-inferiority, 48-week primary',
        sampleSize: 690,
        primaryEndpoint:
          'Confirmed response below 50 copies per millilitre at week 48 by ITT-TLOVR against efavirenz',
        endpointMet: true,
        statisticalPValue:
          '83% versus 83%, difference -0.4 (95% CI -5.9 to 5.2) against a 12% margin',
        unreportedAdverseSignals:
          'Virological failure was 13% against 6%. Non-inferiority on the response endpoint and a doubled failure rate are compatible with each other, and only one of them is the headline.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'THRIVE (NCT00543725)',
        phase: 'Phase 3, randomised, double-blind, double-dummy, non-inferiority, 48-week primary',
        sampleSize: 678,
        primaryEndpoint:
          'Confirmed response below 50 copies per millilitre at week 48 by ITT-TLOVR against efavirenz, with investigator-selected background',
        endpointMet: true,
        statisticalPValue:
          '86% versus 82%, difference 3.5% (95% CI -1.7 to 8.8), non-inferiority p<0.0001',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled ECHO and THRIVE, week 96',
        phase: 'Prespecified pooled analysis of two phase 3 trials at 96 weeks',
        sampleSize: 1368,
        primaryEndpoint:
          'Confirmed viral load below 50 copies per millilitre at week 96, and virological failure by baseline viral load stratum',
        endpointMet: true,
        statisticalPValue:
          '78% versus 78% overall; responses lower and failure higher on rilpivirine above 100,000 copies per millilitre at baseline or below 95% adherence',
        unreportedAdverseSignals:
          'The stratified result became an FDA indication ceiling rather than a warning. A 12% non-inferiority margin is wide enough to contain a subgroup difference of this size.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Pooled ATLAS (NCT02951052) and FLAIR (NCT02938520), week 48',
        phase: 'Two randomised, open-label, multicentre phase 3 switch trials, pooled',
        sampleSize: 1182,
        primaryEndpoint:
          'Proportion with HIV-1 RNA at or above 50 copies per millilitre at week 48, FDA snapshot, monthly injectable cabotegravir with rilpivirine against continued oral therapy',
        endpointMet: true,
        statisticalPValue:
          'Non-inferiority met against a 4% margin for the primary and key secondary endpoints',
        unreportedAdverseSignals:
          'Confirmed virological failure was 7 in each arm, but resistance-associated mutations were found in 6 of 7 long-acting failures against 3 of 7 on oral therapy. Injection site reactions occurred in 83% of long-acting recipients.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '83% against 83% at week 48 in ECHO, difference -0.4 (95% CI -5.9 to 5.2), with virological failure of 13% against 6%',
        '86% against 82% at week 48 in THRIVE, difference 3.5% (95% CI -1.7 to 8.8)',
        'Grade 2 to 4 treatment-related adverse events roughly halved against efavirenz, with rash, dizziness and lipid increases all significantly lower',
        'Monthly cabotegravir with rilpivirine non-inferior to continued oral therapy in 1,182 suppressed patients, with 7 confirmed failures in each arm and injection site reactions in 83%',
      ],
      unsupportedInferences: [
        'That the 6 of 7 against 3 of 7 resistance split among long-acting failures is caused by the slow depot decline rather than by chance in 14 total events',
        'That a rilpivirine failure costs more future options than an efavirenz failure because E138K reaches the nucleoside backbone — mechanistically clear and never tested as an endpoint',
        'That non-inferiority on the response endpoint means equivalence, when the same trials reported roughly double the virological failure rate',
      ],
      whatFailedInitially: [
        'The registration programme met non-inferiority overall while performing measurably worse above 100,000 copies per millilitre at baseline, and the FDA wrote that ceiling into the indication rather than into a warning',
        'Proton pump inhibitors, one of the most widely prescribed drug classes in the world, had to be made an outright contraindication because of loss of virological response and possible class resistance',
      ],
      realWorldOutcome: [
        'Half of Cabenuva, the first complete HIV regimen that is an injection rather than a tablet',
        'Positioned in guidelines as an alternative rather than a preferred first-line agent, principally because of the baseline viral load ceiling and the interaction profile',
        'Licensed to the Medicines Patent Pool by Janssen; the United States tablet sits at US$114.50 at pharmacy acquisition cost',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, dispersible tablet for oral suspension, and long-acting intramuscular nanosuspension in combination with cabotegravir',
      description:
        'The oral form must be taken with a meal, because dissolution is pH-dependent and exposure falls materially without food. The injectable form is given into the gluteal muscle alongside cabotegravir, after an oral lead-in period used to confirm tolerability before a month of drug is committed to a depot that cannot be withdrawn.',
      safetyProfile:
        'Depressive disorders including suicidal ideation are labelled, as are hepatotoxicity and rash, though all occurred less often than on efavirenz in the registration trials. QT interval prolongation occurs at supratherapeutic exposure. For the injectable form, injection site reactions affected 83% of recipients in the pooled phase 3 analysis and were the commonest reason for withdrawal from it. The interaction profile is the practical risk: all proton pump inhibitors, rifampin, rifapentine, four anticonvulsants, multi-dose systemic dexamethasone and St John wort are contraindicated because losing exposure means losing virological control and possibly the class.',
    },
    commonQuestions: [
      {
        q: 'Why is it only approved for people with a lower viral load?',
        a: 'Because the trials found that the drug performs worse above 100,000 copies per millilitre, and the FDA chose to encode that in the indication rather than in a warning. Pooled across ECHO and THRIVE at 96 weeks, both drugs reached 78% suppressed overall. Broken down, responses were similar at or below 100,000 copies per millilitre and lower for rilpivirine above it, with more virological failure. In the restricted group of 543 patients at or below the threshold, week 96 response was 84% against 81% with failure at 5.9% against 2.4%. The Edurant label states the limitation directly in its Limitations of Use section. This is worth understanding as a general lesson: a non-inferiority margin of 12% is wide, and a result inside it can contain a real difference in a real subgroup.',
        auditNote:
          'The headline said non-inferior. The failure rate said otherwise, and the regulator sided with the failure rate.',
      },
      {
        q: 'Can I take it with omeprazole or a similar stomach tablet?',
        a: 'No, and the label treats this as a contraindication rather than a caution. Rilpivirine needs an acidic stomach to dissolve. Proton pump inhibitors raise gastric pH enough that plasma rilpivirine falls significantly, and the label states in plain terms that this may result in loss of virological response and possible resistance to rilpivirine or to the whole non-nucleoside class. Every proton pump inhibitor is named. Carbamazepine, oxcarbazepine, phenobarbital, phenytoin, rifampin, rifapentine, multi-dose systemic dexamethasone and St John wort are contraindicated for the same reason by a different route, cytochrome P450 induction.',
      },
      {
        q: 'Is the monthly injection as good as daily tablets?',
        a: 'On the measured endpoint, yes. In ATLAS and FLAIR pooled, 591 suppressed patients per arm either continued their tablets or switched to monthly injections, and non-inferiority was met at week 48 against a strict 4% margin. Confirmed virological failure occurred in 7 people in each arm. The difference is what happened to those failures: 6 of the 7 in the injection arm had developed resistance mutations against 3 of the 7 on tablets. The mechanistic account is that drug leaves an intramuscular depot over months, so failure means a long stretch at concentrations too low to suppress and high enough to select. Eighty-three per cent of injection recipients had injection site reactions, which became less frequent over time and caused 1% to withdraw.',
        auditNote:
          'Equal efficacy, unequal consequences of failure. The second half is the part that does not fit in a headline.',
      },
      {
        q: 'What makes it different from efavirenz if they bind the same place?',
        a: 'Flexibility. Efavirenz is a rigid molecule that fits the non-nucleoside pocket in one way, so a single substitution such as K103N that alters the pocket removes the drug completely. Rilpivirine is a diarylpyrimidine with two rotatable bonds either side of its central ring, so when the pocket changes shape the molecule can turn and adopt a different bound conformation. That is why it survives K103N. It does not survive everything: E138K and K101E defeat it, and E138K also reduces susceptibility to emtricitabine and lamivudine, so a failure on rilpivirine can cost part of the backbone as well.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for rilpivirine could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost for the tablet from the CMS NADAC file. No figure is given for the injectable form, because none was verified against that dataset.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Molina JM, Cahn P, Grinsztejn B, et al. Rilpivirine versus efavirenz with tenofovir and emtricitabine in treatment-naive adults infected with HIV-1 (ECHO): a phase 3 randomised double-blind active-controlled trial. Lancet 2011;378:238-246',
        identifier: '10.1016/S0140-6736(11)60936-7',
        kind: 'doi',
      },
      {
        label:
          'Cohen CJ, Andrade-Villanueva J, Clotet B, et al. Rilpivirine versus efavirenz with two background nucleoside or nucleotide reverse transcriptase inhibitors in treatment-naive adults infected with HIV-1 (THRIVE): a phase 3, randomised, non-inferiority trial. Lancet 2011;378:229-237',
        identifier: '10.1016/S0140-6736(11)60983-5',
        kind: 'doi',
      },
      {
        label:
          'Cohen CJ, Molina JM, Cassetti I, et al. Week 96 efficacy and safety of rilpivirine in treatment-naive, HIV-1 patients in two Phase III randomized trials. AIDS 2013;27:939-950',
        identifier: '10.1097/QAD.0b013e32835cee6e',
        kind: 'doi',
      },
      {
        label:
          'Behrens G, Rijnders B, Nelson M, et al. Rilpivirine versus efavirenz with emtricitabine/tenofovir disoproxil fumarate in treatment-naive HIV-1-infected patients with HIV-1 RNA at or below 100,000 copies/mL: week 96 pooled ECHO/THRIVE subanalysis. AIDS Patient Care STDS 2014;28:168-175',
        identifier: '10.1089/apc.2013.0310',
        kind: 'doi',
      },
      {
        label:
          'Rizzardini G, Overton ET, Orkin C, et al. Long-acting injectable cabotegravir + rilpivirine for HIV maintenance therapy: week 48 pooled analysis of phase 3 ATLAS and FLAIR trials. J Acquir Immune Defic Syndr 2020;85:498-506',
        identifier: '10.1097/QAI.0000000000002466',
        kind: 'doi',
      },
      {
        label:
          'ECHO: rilpivirine versus efavirenz with tenofovir and emtricitabine, treatment-naive',
        identifier: 'NCT00540449',
        kind: 'nct',
      },
      {
        label:
          'THRIVE: rilpivirine versus efavirenz with investigator-selected background nucleosides',
        identifier: 'NCT00543725',
        kind: 'nct',
      },
      {
        label: 'ATLAS: switching to long-acting cabotegravir plus rilpivirine in suppressed adults',
        identifier: 'NCT02951052',
        kind: 'nct',
      },
      {
        label:
          'FLAIR: long-acting cabotegravir plus rilpivirine after dolutegravir-based induction',
        identifier: 'NCT02938520',
        kind: 'nct',
      },
      {
        label:
          'EDURANT and EDURANT PED (rilpivirine) — Drugs@FDA application NDA 202022, Janssen Products; carries the 100,000 copies per millilitre Limitations of Use and the proton pump inhibitor contraindication',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=202022',
        kind: 'regulatory',
      },
      {
        label:
          'CABENUVA (cabotegravir and rilpivirine extended-release injectable suspensions) — Drugs@FDA application NDA 212888, ViiV Healthcare',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212888',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 6451164 — rilpivirine structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6451164',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Darunavir — the protease inhibitor with a genetic barrier so high that patients fail it
  //    without resistance, and a cardiovascular association that eight years of cohort data could
  //    not shake off.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'darunavir',
    name: 'Darunavir',
    tradeName: 'Prezista; with cobicistat as Prezcobix, and in Symtuza',
    sponsor: 'Janssen Products (originated at Tibotec, from work at the University of Illinois)',
    targetGene: 'HIV-1 pol, protease coding region',
    targetProtein:
      'HIV-1 protease, a homodimeric aspartyl protease inhibited by a peptidomimetic that hydrogen-bonds to the backbone of the enzyme rather than to its side chains',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2006,
    indication:
      'In combination with a pharmacokinetic booster and other antiretroviral agents for the treatment of HIV-1 infection in adults and paediatric patients aged at least 3 years, in treatment-naive patients and in treatment-experienced patients including those with protease inhibitor resistance',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite:
      'HIV-1 protease, acting in the budding virion at the plasma membrane of an infected cell rather than inside the cell it will go on to infect',
    conditionContext: {
      conditionExplainer:
        'HIV builds its structural proteins as one long chain and then cuts that chain into working pieces with its own protease. Cut correctly, a mature infectious virion assembles. Not cut at all, the particle still forms and still leaves the cell, but it is a dud and cannot infect anything.',
      whyItMatters:
        'Protease inhibitors are the drug class that requires the virus to accumulate mutations rather than acquire one. That difference decides where a drug sits in a treatment sequence: darunavir is what a clinician reaches for when previous regimens have failed and the virus already carries resistance to several drugs.',
      whoTakesThis:
        'People with multidrug-resistant HIV-1, people who have failed earlier protease inhibitors, and, less often now, people starting treatment in whom an integrase inhibitor is not appropriate.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre and kept there, in a virus population that has already defeated other drugs.',
    },
    oneSentenceVerdict:
      'A protease inhibitor that binds the backbone of the enzyme rather than its side chains, so mutations that reshape the active site do not shake it loose; it suppressed 61% of heavily treatment-experienced patients against 15% on comparator protease inhibitors, beat lopinavir in both treatment-naive and treatment-experienced trials, and produces virological failure that usually carries no protease resistance at all.',
    laymanHowItWorks:
      'HIV makes its proteins as one long strand and then uses molecular scissors to cut them into working parts. Darunavir jams the scissors. What makes it different from earlier drugs of its kind is where it grips: it holds onto the fixed skeleton of the enzyme rather than the parts that stick out. Mutations change the parts that stick out. They cannot easily change the skeleton without breaking the enzyme, so the virus has to accumulate many changes rather than one, and it usually cannot.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.49 per tablet at United States pharmacy acquisition cost, median across 14 listed generic products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Generic in the United States, with 14 products carrying a NADAC line. The cost of a darunavir regimen is not the tablet alone: it requires a pharmacokinetic booster, ritonavir or cobicistat, whose own price and interaction burden come with it. Janssen has licensed darunavir to the Medicines Patent Pool for low-income and lower-middle-income countries.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Nothing else in the protease class has darunavir resistance profile, which is why it displaced the drugs it was compared against. The genuine alternatives are in other classes, and the comparison turns on whether a high genetic barrier is needed at all.',
      conventionalRx: [
        {
          name: 'Lopinavir-ritonavir (Kaletra, generic)',
          class: 'Protease inhibitor, ritonavir-boosted, co-formulated',
          howItCompares:
            'The comparator darunavir beat twice. In treatment-naive ARTEMIS, 84% against 78% below 50 copies per millilitre at week 48, and 79% against 67% in the subgroup starting above 100,000 copies per millilitre. In treatment-experienced TITAN, 77% against 68% below 400 copies per millilitre, with primary protease mutations in 21% of darunavir failures against 36% of lopinavir failures.',
          typicalCost:
            'Not quoted here; the CMS NADAC line for lopinavir-ritonavir was not read at the time of writing',
          prosAndCons:
            'Pros: co-formulated with its own booster, long paediatric and pregnancy experience, widely available generically. Cons: substantially more gastrointestinal toxicity, worse lipid profile, and a lower resistance barrier.',
        },
        {
          name: 'Dolutegravir (Tivicay)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'A different class with a comparably high resistance barrier and no booster requirement, which removes most of the interaction burden that comes with a protease inhibitor. It is what most treatment sequences now start and continue with.',
          typicalCost:
            'US$105.03 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: no booster, few interactions, high barrier. Cons: more weight gained, and an integrase-experienced virus is a different situation from an integrase-naive one.',
        },
        {
          name: 'Atazanavir-ritonavir (generic)',
          class: 'Protease inhibitor, ritonavir-boosted',
          howItCompares:
            'The other contemporary boosted protease inhibitor. In the D:A:D cohort, cumulative atazanavir-ritonavir use was not associated with cardiovascular disease (incidence rate ratio 1.03, 95% CI 0.90 to 1.18 per five years) while darunavir-ritonavir was (1.59, 95% CI 1.33 to 1.91).',
          typicalCost:
            'Not quoted here; the CMS NADAC line for atazanavir was not read at the time of writing',
          prosAndCons:
            'Pros: no cardiovascular signal in D:A:D, once daily. Cons: unconjugated hyperbilirubinaemia and jaundice, dependence on gastric acidity, and a lower resistance barrier than darunavir.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC(C)CN(C[C@H]([C@H](CC1=CC=CC=C1)NC(=O)O[C@H]2CO[C@@H]3[C@H]2CCO3)O)S(=O)(=O)C4=CC=C(C=C4)N',
      chemicalFormula: 'C27H37N3O7S',
      molecularWeight: '547.70 g/mol (free base); dispensed as darunavir ethanolate',
      targetReceptorAffinity:
        'Binds HIV-1 protease with picomolar affinity, roughly two orders of magnitude tighter than the earlier drugs of the class. The design principle that matters is not the affinity but where it comes from: the bis-tetrahydrofuranyl group makes hydrogen bonds to the main-chain amide nitrogens and carbonyls of aspartate 29 and aspartate 30 in the enzyme backbone, which is conserved because the enzyme cannot fold without it. Side-chain substitutions that abolish binding of earlier inhibitors leave those backbone contacts intact. Darunavir also inhibits protease dimerisation, a second mechanism absent from the rest of the class.',
      structureSource: {
        label: 'PubChem CID 213039 (darunavir) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/213039',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'drv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical control of the bis-tetrahydrofuran and the hydroxyethylamine core',
          description:
            'Confirm configuration at all five stereocentres, three in the fused bicyclic bis-tetrahydrofuranyl alcohol and two in the hydroxyethylsulfonamide core. The bis-THF is the fragment that makes the backbone hydrogen bonds the whole molecule is built around; a wrong configuration there does not make a weaker drug, it makes a different one.',
          reagentsAndBuffer:
            'Darunavir reference standard, (3R,3aS,6aR)-hexahydrofuro[2,3-b]furan-3-ol reference, chiral HPLC on an amylose-derived stationary phase, optical rotation, proton and carbon NMR, Karl Fischer titration for the ethanolate solvate',
        },
        {
          id: 'drv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Carbamate coupling of the bis-THF alcohol to the sulfonamide amine',
          description:
            'Activate the bicyclic alcohol as a mixed carbonate or succinimidyl carbonate and couple it to the amine of the hydroxyethylsulfonamide, then reduce the aryl nitro group to the aniline that completes the molecule. The bis-THF fragment is the expensive part of the route and its synthesis is what puts this molecule in the high-complexity band.',
          dependsOnStepId: 'drv-w1',
          reagentsAndBuffer:
            '(3R,3aS,6aR)-hexahydrofuro[2,3-b]furan-3-ol, disuccinimidyl carbonate or 4-nitrophenyl chloroformate, the (2R,3S)-3-amino-2-hydroxy-4-phenylbutyl isobutylamine sulfonamide intermediate, triethylamine in acetonitrile, then catalytic hydrogenation over palladium on carbon',
        },
        {
          id: 'drv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ethanolate solvate crystallisation and polymorph identity',
          description:
            'Crystallise as the ethanolate, which is the marketed solid form, and confirm it. Darunavir exists in several solvates and polymorphs with different dissolution behaviour, so this is an identity specification rather than a purification step, and generic bioequivalence for this molecule is largely a solid-state question.',
          dependsOnStepId: 'drv-w2',
          reagentsAndBuffer:
            'Ethanol and water antisolvent crystallisation, seeded, X-ray powder diffraction and differential scanning calorimetry for solvate identity, thermogravimetric analysis for ethanol stoichiometry, reversed-phase HPLC for related substances',
        },
        {
          id: 'drv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Infection of MT-4 cells with a multi-protease-mutant clinical panel',
          description:
            'Infect cells with a panel of clinical isolates carrying increasing numbers of primary protease mutations, alongside wild-type virus, in the presence of graded drug and a fixed booster concentration. The single most informative measurement for this drug is not its potency against wild-type virus but how slowly that potency degrades as mutations accumulate.',
          dependsOnStepId: 'drv-w3',
          reagentsAndBuffer:
            'MT-4 cells, RPMI-1640 with 10% foetal bovine serum, recombinant clinical isolates stratified by number of primary protease resistance-associated mutations, fixed ritonavir concentration arm, 50% human serum arm for protein-binding-adjusted potency',
        },
        {
          id: 'drv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fold-change curve against mutation count, plus Gag cleavage-site sequencing',
          description:
            'Express potency as fold change against wild-type at each mutation count, and sequence the Gag cleavage sites as well as the protease gene. The second half is the point: a Gag substitution such as T375A confers roughly ten-fold darunavir resistance while the protease sequence, which is what clinical genotyping reads, looks entirely normal.',
          dependsOnStepId: 'drv-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 protease, fluorogenic peptide substrate, single-cycle phenotypic susceptibility assay, bulk and ultradeep Gag-protease sequencing, site-directed T375A and K436R mutants for phenotypic confirmation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'drv-a1',
        category: 'measured',
        title: 'POWER 1 and 2: 61% responded against 15% on comparator protease inhibitors',
        laymanSummary:
          'In patients whose virus had already defeated multiple protease inhibitors, darunavir produced a meaningful viral load drop in 61% against 15% on whichever comparator the investigator chose. That is one of the largest treatment effects in the antiretroviral literature.',
        technicalDetails:
          'POWER 1 and POWER 2 (TMC114-C213 and TMC114-C202, NCT00071097) were phase IIB trials in treatment-experienced patients, pooled for a week 48 subgroup analysis restricted to those on the eventual recommended dose of darunavir-ritonavir 600/100 mg twice daily from baseline, each with an optimised background regimen. At week 48, 67 of 110 (61%) darunavir patients against 18 of 120 (15%) control protease inhibitor patients had a viral load reduction of at least 1 log10 copies per millilitre from baseline, difference in response rates 46% (95% CI 35 to 57, p<0.0001). A logistic regression adjusting for baseline primary protease mutation count, enfuvirtide use, baseline viral load and study gave a difference of 50% and an odds ratio of 11.72 (95% CI 5.75 to 23.89). Adverse event rates in the darunavir group were mostly lower than or similar to control when corrected for exposure.',
        evidenceSource:
          'Clotet B, Bellos N, Molina JM, et al. Lancet 2007;369:1169-1178 (POWER 1 and 2, NCT00071097)',
        doi: '10.1016/S0140-6736(07)60497-8',
        measuredMetric:
          'Proportion with a viral load reduction of at least 1 log10 copies per millilitre at week 48, difference 46% (95% CI 35 to 57)',
        auditFlag: 'verified',
      },
      {
        id: 'drv-a2',
        category: 'measured',
        title: 'TITAN: better than lopinavir, and a third of the emergent protease resistance',
        laymanSummary:
          'In 595 treatment-experienced patients, darunavir suppressed 77% against 68% for lopinavir. More importantly, when patients did fail, far fewer of the darunavir failures had developed new protease mutations, so fewer future options were lost.',
        technicalDetails:
          'TITAN (TMC114-C214, NCT00110877) randomised 595 treatment-experienced, lopinavir-naive patients, open-label, to darunavir-ritonavir 600/100 mg twice daily or lopinavir-ritonavir 400/100 mg twice daily, each with an optimised background regimen. Of these, 187 (31%) were protease-inhibitor naive and 476 of 582 (82%) were susceptible to four or more protease inhibitors. At week 48, 220 of 286 (77%) against 199 of 293 (68%) had HIV RNA below 400 copies per millilitre, estimated difference 9% (95% CI 2 to 16), meeting the non-inferiority margin and favouring darunavir. Among virological failures, primary protease mutations developed in 6 (21%) darunavir patients against 20 (36%) lopinavir patients, and nucleoside analogue mutations in 4 (14%) against 15 (27%). Grade 3 or 4 adverse events occurred in 80 (27%) against 89 (30%).',
        evidenceSource:
          'Madruga JV, Berger D, McMurchie M, et al. Lancet 2007;370:49-58 (TITAN, NCT00110877)',
        doi: '10.1016/S0140-6736(07)61049-6',
        measuredMetric:
          'Proportion below 400 copies per millilitre at week 48, difference 9% (95% CI 2 to 16), and counts of emergent primary protease mutations',
        auditFlag: 'verified',
      },
      {
        id: 'drv-a3',
        category: 'measured',
        title: 'ARTEMIS: it also won where the virus had never seen a protease inhibitor',
        laymanSummary:
          'In 689 people starting treatment for the first time, darunavir reached 84% suppressed against 78% for lopinavir, and the gap widened in people who started with a high viral load. Almost nobody who failed developed protease resistance.',
        technicalDetails:
          'ARTEMIS (TMC114-C211, NCT00258557) randomised 689 treatment-naive patients, open-label, to once-daily darunavir-ritonavir 800/100 mg or to lopinavir-ritonavir 800/200 mg total daily dose, each with fixed-dose tenofovir disoproxil and emtricitabine. Mean baseline HIV-1 RNA was 4.85 log10 copies per millilitre and median CD4 count 225 cells per microlitre. At week 48, 84% against 78% reached below 50 copies per millilitre, estimated difference 5.6% (95% CI -0.1 to 11), non-inferiority p<0.001. In the stratum starting at or above 100,000 copies per millilitre, response was 79% against 67% (p<0.05). Grade 2 to 4 gastrointestinal adverse events possibly related to treatment occurred in 7% against 14%, moderate-to-severe diarrhoea in 4% against 10%, and discontinuation for adverse events in 3% against 7%. By week 96 the virological failure rate was 12% against 17% (p=0.0437), and among failures with genotypes at both baseline and endpoint no major protease resistance mutations developed in either arm, with all failures remaining phenotypically susceptible to every protease inhibitor.',
        evidenceSource:
          'Ortiz R, DeJesus E, Khanlou H, et al. AIDS 2008;22:1389-1397 (ARTEMIS, NCT00258557); Lathouwers E et al., Antivir Ther 2011;16:99-108',
        doi: '10.1097/QAD.0b013e32830285fb',
        measuredMetric:
          'Proportion below 50 copies per millilitre at week 48, difference 5.6% (95% CI -0.1 to 11), with 79% against 67% above 100,000 copies per millilitre at baseline',
        auditFlag: 'verified',
      },
      {
        id: 'drv-a4',
        category: 'inferred',
        title:
          'Cohort data associate it with cardiovascular disease; the comparator in the same class shows nothing',
        laymanSummary:
          'A 35,711-person cohort followed for seven years found the rate of heart attacks and strokes rising steadily with years of darunavir exposure, from about 5 events per 1,000 person-years in people never exposed to nearly 14 in those exposed for more than six years. Atazanavir, in the same class and the same analysis, showed almost nothing.',
        technicalDetails:
          'The D:A:D study followed 35,711 people with HIV across 11 cohorts in Australia, Europe and the USA from 2009, for a median 6.96 years, with centrally validated myocardial infarction, stroke, sudden cardiac death and invasive cardiovascular procedures as the outcome. 1,157 cardiovascular events occurred, an incidence of 5.34 per 1,000 person-years (95% CI 5.03 to 5.65). Incidence rose from 4.91 per 1,000 person-years (4.59 to 5.23) in people never exposed to ritonavir-boosted darunavir to 13.67 (8.51 to 18.82) in those exposed for more than six years. After adjustment the incidence rate ratio was 1.59 (95% CI 1.33 to 1.91) per five additional years of darunavir-ritonavir use, and 1.03 (0.90 to 1.18) for atazanavir-ritonavir. The association survived adjustment for time-updated factors on the causal pathway, separate analysis of myocardial infarction and stroke, adjustment for bilirubin, and stratification by whether darunavir was the first protease inhibitor used. The authors state that causal inference is limited by the observational design and call for investigation of a mechanism. No mechanism has been established, and no randomised trial has cardiovascular events as an endpoint. The dose-response relationship and the internal comparator make confounding by indication a harder explanation than usual, without ruling it out.',
        evidenceSource: 'Ryom L, Lundgren JD, El-Sadr W, et al. Lancet HIV 2018;5:e291-e300',
        doi: '10.1016/S2352-3018(18)30043-2',
        inferredClaim:
          'That cumulative darunavir-ritonavir exposure causes cardiovascular disease — a dose-dependent observational association with an internal null comparator, no established mechanism, and no randomised test',
        auditFlag: 'contested',
      },
      {
        id: 'drv-a5',
        category: 'failed',
        title: 'Resistance testing reads the protease gene, and the resistance is not always there',
        laymanSummary:
          'Clinical resistance tests sequence the protease gene. Patients failing darunavir often have a completely normal protease sequence, and the resistance has instead appeared in the protein the protease cuts. One such change confers ten-fold resistance and would be invisible to the test a clinician orders.',
        technicalDetails:
          'A resistance analysis of samples from a 48-week randomised trial in Cameroon, comparing ritonavir-boosted darunavir monotherapy (n=81) with tenofovir-lamivudine plus ritonavir-boosted lopinavir (n=39), sequenced protease and reverse transcriptase by ultradeep methods and Gag-protease by bulk sequencing at rebound. Among eight participants with virological rebound on darunavir, contributing twelve samples, no darunavir resistance-associated mutations were found in protease. All eight carried Gag mutations associated with protease inhibitor exposure, including T375N and T375A at the p2/p7 cleavage site, K436R at p7/p1, and substitutions in p17, p24, p2 and p6. Site-directed T375A conferred ten-fold darunavir resistance in a single-cycle phenotypic assay and increased replication capacity. Standard clinical genotyping does not sequence Gag. So the high genetic barrier is real, and part of what makes it look even higher than it is, is that one of the escape routes is outside the region the assay reads.',
        evidenceSource:
          'Abdullahi A, Diaz AG, Fopoussi OM, et al. J Antimicrob Chemother 2024;79:339-348',
        doi: '10.1093/jac/dkad386',
        measuredMetric:
          'Zero protease resistance mutations against eight of eight rebounders carrying Gag cleavage-site substitutions; T375A conferred ten-fold phenotypic resistance',
        auditFlag: 'caution',
      },
      {
        id: 'drv-a6',
        category: 'measured',
        title: 'PIVOT: eight years of protease inhibitor monotherapy, and future options preserved',
        laymanSummary:
          'A pragmatic trial randomised 587 suppressed patients either to stay on three drugs or to drop to a single boosted protease inhibitor with prompt return to combination therapy if virus rebounded. After more than eight years, the proportion who had lost a future drug option was 2.1% against 2.7%. Only one patient in the monotherapy group developed resistance to the drug they were on.',
        technicalDetails:
          'PIVOT (ISRCTN04857074) randomised 587 UK participants with viral load below 50 copies per millilitre for at least 24 weeks to maintain triple therapy (291) or switch to physician-selected protease inhibitor monotherapy with prompt reintroduction of combination therapy on rebound (296), between November 2008 and July 2010, and followed them in routine care for a median of more than 100 months. Loss of one or more future drug options had occurred in 7 triple-therapy and 6 monotherapy participants, cumulative risk at eight years 2.7% and 2.1%, difference -0.6% (95% CI -3.2% to 2.0%). Only one monotherapy participant developed resistance to the protease inhibitor they were taking, and that drug was atazanavir. Serious clinical events, comprising death, serious AIDS and serious non-AIDS events, occurred in 12 of 291 (4.1%) and 23 of 296 (7.8%), p=0.08, across the whole follow-up. The authors state that a small excess risk of serious clinical events with the monotherapy strategy cannot be excluded. Maintenance monotherapy is not a recommended strategy, and this result is worth reading as a measurement of the class resistance barrier rather than as an endorsement of it.',
        evidenceSource:
          'Paton NI, Stohr W, Arenas-Pinto A, et al. EClinicalMedicine 2024;69:102457 (PIVOT, ISRCTN04857074)',
        doi: '10.1016/j.eclinm.2024.102457',
        measuredMetric:
          'Cumulative eight-year risk of losing a future drug option: 2.1% against 2.7%, difference -0.6% (95% CI -3.2 to 2.0)',
        auditFlag: 'verified',
      },
      {
        id: 'drv-a7',
        category: 'inferred',
        title: 'The tablet is generic; the regimen is not, because it cannot be taken alone',
        laymanSummary:
          'Darunavir costs US$2.49 a tablet. It cannot be used without a second drug whose only job is to slow its breakdown, and that booster brings an interaction list with it. Quoting the tablet price as the cost of the treatment is the most common way this drug is misdescribed.',
        technicalDetails:
          'Darunavir is cleared by CYP3A4 and requires co-administration with ritonavir or cobicistat to reach and hold therapeutic concentrations. Both boosters are potent CYP3A inhibitors, so the interaction profile of a darunavir regimen is the interaction profile of the booster, and it reaches statins, anticoagulants, inhaled and intranasal corticosteroids, several antiarrhythmics, some anticonvulsants and hormonal contraception. The CMS NADAC line quoted on this page is for the darunavir tablet alone. The economic and clinical unit is the boosted regimen, and no verified acquisition cost for a complete boosted regimen was assembled here. This is stated as an inference rather than a measurement because the direction is clear and the magnitude was not established from a source.',
        evidenceSource:
          'PREZISTA (darunavir) prescribing information, NDA 021976, Drugs@FDA; CMS National Average Drug Acquisition Cost file',
        doi: '10.1097/QAD.0b013e32830285fb',
        inferredClaim:
          'That the tablet acquisition cost shown on this page approximates the cost of treatment with this drug — it does not, because the mandatory booster is a separate product with its own price and its own interaction burden',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed with food, and never on its own',
        laymanDesc:
          'Taken with a meal, and always with a second small drug whose only purpose is to stop the liver clearing it. Without that partner it disappears too fast to work.',
        molecularDetail:
          'Darunavir is a CYP3A4 substrate with low bioavailability unboosted, so it is co-administered with ritonavir or cobicistat, potent CYP3A inhibitors that raise its exposure severalfold. Food increases absorption substantially. The booster is what makes the regimen work and is also the source of nearly every clinically important interaction attributed to the drug.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters the cell and waits at the assembly line',
        laymanDesc:
          'The drug diffuses into infected cells. Unlike the drugs that stop the virus getting established, this one works at the end of the cycle, where new virus particles are being packaged to leave.',
        molecularDetail:
          'Darunavir is passively permeable and highly protein-bound, principally to alpha-1-acid glycoprotein. Its site of action is the maturation step: HIV-1 protease cleaves the Gag and Gag-Pol polyproteins during and after budding, so the drug acts on virions leaving an already-infected cell rather than protecting an uninfected one.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grips the fixed skeleton of the enzyme, not the parts that can change',
        laymanDesc:
          'Older protease inhibitors held onto side groups that stick out of the enzyme. Mutations change those. Darunavir hydrogen-bonds to the enzyme backbone instead, which the virus cannot alter without destroying the enzyme.',
        molecularDetail:
          'The bis-tetrahydrofuranyl group makes hydrogen bonds to the main-chain amide nitrogen and carbonyl oxygen of aspartate 29 and aspartate 30 in the S2 subsite. Backbone conformation in the active site is essentially invariant across resistant clinical isolates, because the fold depends on it. Binding affinity is picomolar, roughly two orders of magnitude tighter than first-generation inhibitors, and darunavir additionally inhibits dimerisation of the protease monomers, a mechanism the rest of the class lacks.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The polyprotein is never cut, so the particle assembles wrong',
        laymanDesc:
          'New virus particles still form and still leave the cell. But the long protein chain inside them is never cut into working parts, so the particle is structurally immature and cannot infect anything.',
        molecularDetail:
          'Gag and Gag-Pol remain uncleaved, so the conical capsid never forms and the virion is non-infectious. Escape requires accumulating multiple substitutions in protease, each of which costs catalytic efficiency, which is the origin of the high genetic barrier. The alternative escape route runs through the Gag cleavage sites themselves: T375A at p2/p7 confers roughly ten-fold resistance while leaving the protease sequence unchanged.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus falls, and failure usually costs nothing for next time',
        laymanDesc:
          'Suppression rates match or beat the older drugs of the class. The distinctive result is what happens when it does not work: most people who fail on darunavir have a virus that is still fully susceptible to it and to every other drug in the class.',
        molecularDetail:
          'In ARTEMIS at 96 weeks, no major protease resistance mutation developed in any virological failure with paired genotypes in either arm, and all such failures remained phenotypically susceptible to all protease inhibitors. In TITAN, primary protease mutations appeared in 21% of darunavir failures against 36% of lopinavir failures. In PIVOT, eight years of protease inhibitor monotherapy produced a 2.1% cumulative risk of losing a future drug option.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'POWER 1 and 2 (TMC114-C213, TMC114-C202, NCT00071097)',
        phase: 'Phase IIB, randomised, pooled subgroup analysis at week 48',
        sampleSize: 230,
        primaryEndpoint:
          'Proportion with a viral load reduction of at least 1 log10 copies per millilitre from baseline at week 48 in treatment-experienced patients',
        endpointMet: true,
        statisticalPValue:
          '61% versus 15%, difference 46% (95% CI 35 to 57), p<0.0001; adjusted odds ratio 11.72 (95% CI 5.75 to 23.89)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TITAN (TMC114-C214, NCT00110877)',
        phase: 'Phase 3, randomised, open-label, non-inferiority, 48 weeks',
        sampleSize: 595,
        primaryEndpoint:
          'Proportion with HIV RNA below 400 copies per millilitre at week 48 in treatment-experienced, lopinavir-naive patients',
        endpointMet: true,
        statisticalPValue: '77% versus 68%, estimated difference 9% (95% CI 2 to 16)',
        unreportedAdverseSignals:
          'The more consequential secondary result is the resistance count: primary protease mutations in 6 darunavir failures against 20 on lopinavir, and nucleoside mutations in 4 against 15.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ARTEMIS (TMC114-C211, NCT00258557)',
        phase:
          'Phase 3, randomised, open-label, non-inferiority, 48-week primary with 192-week design',
        sampleSize: 689,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at week 48, per-protocol time-to-loss-of-virological-response, in treatment-naive patients',
        endpointMet: true,
        statisticalPValue:
          '84% versus 78%, estimated difference 5.6% (95% CI -0.1 to 11), p<0.001 for non-inferiority; 79% versus 67% above 100,000 copies per millilitre at baseline (p<0.05)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'PIVOT (ISRCTN04857074)',
        phase:
          'Randomised, controlled, open-label pragmatic strategy trial, median 100-month follow-up',
        sampleSize: 587,
        primaryEndpoint:
          'Loss of future drug options, defined as new intermediate or high level resistance to a drug the virus was sensitive to at entry, protease inhibitor monotherapy against continued triple therapy',
        endpointMet: true,
        statisticalPValue:
          'Cumulative eight-year risk 2.1% versus 2.7%, difference -0.6% (95% CI -3.2 to 2.0)',
        unreportedAdverseSignals:
          'Serious clinical events occurred in 23 of 296 (7.8%) monotherapy participants against 12 of 291 (4.1%) on triple therapy, p=0.08. The authors state that a small excess risk cannot be excluded, and monotherapy is not a recommended strategy.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'D:A:D contemporary protease inhibitor analysis',
        phase: 'Prospective observational multicohort study, 11 cohorts, median 6.96 years',
        sampleSize: 35711,
        primaryEndpoint:
          'Incidence of centrally validated cardiovascular disease by cumulative exposure to ritonavir-boosted darunavir and to ritonavir-boosted atazanavir',
        endpointMet: false,
        statisticalPValue:
          'Adjusted incidence rate ratio 1.59 (95% CI 1.33 to 1.91) per five years of darunavir-ritonavir; 1.03 (0.90 to 1.18) for atazanavir-ritonavir',
        unreportedAdverseSignals:
          'This row records a harm signal, not a failed efficacy endpoint. Incidence rose from 4.91 to 13.67 events per 1,000 person-years across exposure strata. The study is observational and no mechanism has been established.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '61% against 15% responding in heavily treatment-experienced patients, difference 46% (95% CI 35 to 57), adjusted odds ratio 11.72',
        '77% against 68% below 400 copies per millilitre in TITAN, with primary protease mutations in 6 darunavir failures against 20 on lopinavir',
        '84% against 78% below 50 copies per millilitre in treatment-naive ARTEMIS, and 79% against 67% in the high-viral-load stratum',
        'Cardiovascular incidence rising from 4.91 to 13.67 events per 1,000 person-years across strata of cumulative darunavir-ritonavir exposure in 35,711 people',
      ],
      unsupportedInferences: [
        'That cumulative darunavir exposure causes cardiovascular disease — a dose-dependent observational association with an internal null comparator, no mechanism and no randomised test',
        'That the tablet acquisition cost approximates the cost of treatment, when the mandatory booster is a separate product carrying its own price and interaction burden',
        'That an absent protease resistance mutation means an absent resistance mechanism, when Gag cleavage-site substitutions confer ten-fold resistance outside the region clinical genotyping reads',
      ],
      whatFailedInitially: [
        'Standard clinical resistance genotyping does not sequence Gag, so the escape route that eight of eight darunavir rebounders in one trial actually used is invisible to it',
        'Maintenance monotherapy preserved future drug options over eight years but produced serious clinical events in 7.8% against 4.1%, p=0.08, and is not a recommended strategy',
      ],
      realWorldOutcome: [
        'The protease inhibitor of choice for multidrug-resistant HIV-1, and the last widely used member of a class that integrase inhibitors otherwise displaced',
        'Generic in the United States at US$2.49 per tablet across 14 listed products, and licensed to the Medicines Patent Pool',
        'The subject of the clearest cardiovascular safety question in contemporary antiretroviral therapy, unresolved since 2018',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet and oral suspension, always with a pharmacokinetic booster',
      description:
        'Taken with food, always with ritonavir or cobicistat. The booster requirement is not a convenience: unboosted exposure is too low to be therapeutic, and the label has no unboosted regimen. Absorption is substantially reduced without food.',
      safetyProfile:
        'Severe skin reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis and drug reaction with eosinophilia and systemic symptoms are labelled; darunavir contains a sulfonamide moiety and rash is among the commonest adverse reactions. Hepatotoxicity including drug-induced hepatitis is labelled, with higher risk in hepatitis B or C co-infection. Gastrointestinal effects occurred at roughly half the rate of lopinavir-ritonavir in ARTEMIS. Hyperglycaemia, fat redistribution and immune reconstitution inflammatory syndrome are class effects. The cardiovascular association reported in the D:A:D cohort is described in the audits above and remains unexplained.',
    },
    commonQuestions: [
      {
        q: 'Why does darunavir keep working when other protease inhibitors have failed?',
        a: 'Because of where it holds on. Earlier protease inhibitors made most of their contacts with amino-acid side chains lining the enzyme active site, and side chains are exactly what a resistance mutation changes. Darunavir hydrogen-bonds through its bis-tetrahydrofuranyl group to the main-chain nitrogen and oxygen atoms of aspartate 29 and aspartate 30, which are part of the protein backbone. The backbone conformation cannot change much without the enzyme failing to fold, so the virus has to accumulate several substitutions, each costing catalytic efficiency, rather than acquiring one. In POWER 1 and 2, in patients whose virus had already defeated multiple protease inhibitors, 61% responded against 15% on comparator drugs.',
      },
      {
        q: 'Does darunavir cause heart attacks?',
        a: 'It is associated with them, and whether it causes them is unresolved. The D:A:D study followed 35,711 people with HIV for a median of nearly seven years with centrally validated cardiovascular events. Incidence rose steadily with cumulative darunavir exposure, from 4.91 per 1,000 person-years in people never exposed to 13.67 in those exposed for more than six years, giving an adjusted incidence rate ratio of 1.59 (95% CI 1.33 to 1.91) per five additional years. Atazanavir, boosted the same way and analysed in the same paper, showed 1.03 (0.90 to 1.18). The dose-response shape and the internal null comparator make simple confounding harder to invoke. But the study is observational, the authors say so, no mechanism has been found, and no randomised trial has ever used cardiovascular events as an endpoint in this class.',
        auditNote:
          'A dose-dependent association with an internal comparator that shows nothing is stronger evidence than most observational findings and is still not a causal test.',
      },
      {
        q: 'My resistance test came back clean but the virus is not suppressed. What does that mean?',
        a: 'On darunavir specifically, that combination is common and it has a documented explanation. Clinical resistance genotyping sequences the protease gene. In a trial in Cameroon, eight participants rebounded on darunavir monotherapy and not one of them had a darunavir resistance mutation in protease. All eight had substitutions in Gag, the protein the protease cuts, at or near the cleavage sites. A site-directed version of one of them, T375A, conferred ten-fold darunavir resistance in a phenotypic assay and increased replication capacity. Gag is not sequenced by standard clinical assays. So a clean protease result genuinely means no protease resistance, and does not by itself mean no resistance.',
        auditNote:
          'The high genetic barrier is real. Part of why it looks even higher than it is, is that one escape route lies outside what the test reads.',
      },
      {
        q: 'Why does it always have to be taken with a second drug?',
        a: 'Because on its own it is cleared too fast to stay above the concentration that suppresses virus. Darunavir is a substrate of CYP3A4, and ritonavir or cobicistat inhibit that enzyme, raising darunavir exposure severalfold. There is no unboosted regimen on the label. The practical consequence is that a darunavir regimen inherits the booster interaction profile, which reaches statins, anticoagulants, inhaled and intranasal steroids, several antiarrhythmics and hormonal contraception. It also means the price on this page is for one component of a two-component regimen.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for darunavir could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost for the darunavir tablet from the CMS NADAC file, which is a price, is not a cost, and is not the price of a complete boosted regimen.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Clotet B, Bellos N, Molina JM, et al. Efficacy and safety of darunavir-ritonavir at week 48 in treatment-experienced patients with HIV-1 infection in POWER 1 and 2: a pooled subgroup analysis of data from two randomised trials. Lancet 2007;369:1169-1178',
        identifier: '10.1016/S0140-6736(07)60497-8',
        kind: 'doi',
      },
      {
        label:
          'Madruga JV, Berger D, McMurchie M, et al. Efficacy and safety of darunavir-ritonavir compared with that of lopinavir-ritonavir at 48 weeks in treatment-experienced, HIV-infected patients in TITAN: a randomised controlled phase III trial. Lancet 2007;370:49-58',
        identifier: '10.1016/S0140-6736(07)61049-6',
        kind: 'doi',
      },
      {
        label:
          'Ortiz R, DeJesus E, Khanlou H, et al. Efficacy and safety of once-daily darunavir/ritonavir versus lopinavir/ritonavir in treatment-naive HIV-1-infected patients at week 48. AIDS 2008;22:1389-1397',
        identifier: '10.1097/QAD.0b013e32830285fb',
        kind: 'doi',
      },
      {
        label:
          'Lathouwers E, De Meyer S, Dierynck I, et al. Virological characterization of patients failing darunavir/ritonavir or lopinavir/ritonavir treatment in the ARTEMIS study: 96-week analysis. Antivir Ther 2011;16:99-108',
        identifier: '10.3851/IMP1719',
        kind: 'doi',
      },
      {
        label:
          'Ryom L, Lundgren JD, El-Sadr W, et al. Cardiovascular disease and use of contemporary protease inhibitors: the D:A:D international prospective multicohort study. Lancet HIV 2018;5:e291-e300',
        identifier: '10.1016/S2352-3018(18)30043-2',
        kind: 'doi',
      },
      {
        label:
          'Abdullahi A, Diaz AG, Fopoussi OM, et al. A detailed characterization of drug resistance during darunavir/ritonavir monotherapy highlights a high barrier to the emergence of resistance mutations in protease but identifies alternative pathways of resistance. J Antimicrob Chemother 2024;79:339-348',
        identifier: '10.1093/jac/dkad386',
        kind: 'doi',
      },
      {
        label:
          'Paton NI, Stohr W, Arenas-Pinto A, et al. Long-term efficacy and safety of a treatment strategy for HIV infection using protease inhibitor monotherapy: 8-year routine clinical care follow-up from a randomised, controlled, open-label pragmatic trial (PIVOT). EClinicalMedicine 2024;69:102457',
        identifier: '10.1016/j.eclinm.2024.102457',
        kind: 'doi',
      },
      {
        label:
          'Nelson M, Girard PM, DeMasi R, et al. Suboptimal adherence to darunavir/ritonavir has minimal effect on efficacy compared with lopinavir/ritonavir in treatment-naive, HIV-infected patients: 96 week ARTEMIS data. J Antimicrob Chemother 2010;65:1505-1509',
        identifier: '10.1093/jac/dkq150',
        kind: 'doi',
      },
      {
        label:
          'ARTEMIS (TMC114-C211): darunavir-ritonavir versus lopinavir-ritonavir, treatment-naive',
        identifier: 'NCT00258557',
        kind: 'nct',
      },
      {
        label:
          'TITAN (TMC114-C214): darunavir-ritonavir versus lopinavir-ritonavir, treatment-experienced',
        identifier: 'NCT00110877',
        kind: 'nct',
      },
      {
        label:
          'POWER 2 (TMC114-C202): darunavir with low-dose ritonavir in treatment-experienced patients',
        identifier: 'NCT00071097',
        kind: 'nct',
      },
      {
        label:
          'PREZISTA (darunavir) — Drugs@FDA application NDA 021976, Janssen Products, original approval 23 June 2006',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021976',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 213039 — darunavir structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/213039',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Raltegravir — the first integrase inhibitor ever approved, which then failed the one trial
  //    that would have made it once-daily, and needed a different tablet rather than a different
  //    dose to succeed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'raltegravir',
    name: 'Raltegravir',
    tradeName: 'Isentress and Isentress HD',
    sponsor: 'Merck Sharp and Dohme',
    targetGene: 'HIV-1 pol, integrase coding region',
    targetProtein:
      'HIV-1 integrase, blocked at the strand-transfer step by chelation of the two catalytic magnesium ions in the intasome active site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2007,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults and paediatric patients weighing at least 2 kg',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite: 'HIV-1 intasome, in the cytoplasm and nucleus of infected CD4-positive T cells',
    conditionContext: {
      conditionExplainer:
        'HIV-1 has to paste a DNA copy of itself into a human chromosome to survive in a cell, and it uses one enzyme, integrase, to do it. Raltegravir was the first drug ever approved that blocks that enzyme, and it opened a class that now supplies the first-line treatment for most of the world.',
      whyItMatters:
        'Before 2007 a person whose virus had defeated the three existing drug classes had, in practice, nothing left. Raltegravir attacked a target no previous drug had touched, so triple-class resistance was no obstacle to it at all. That is what an entirely new mechanism buys, and it is rare.',
      whoTakesThis:
        'People with multidrug-resistant HIV-1, newborns and very small infants for whom it has the widest paediatric licence in the class, and people in whom drug interactions rule out other integrase inhibitors, since raltegravir is not metabolised by cytochrome P450 at all.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre and kept there, in a population where earlier drugs have often already failed.',
    },
    oneSentenceVerdict:
      'The first integrase strand-transfer inhibitor approved anywhere, which chelates the two magnesium ions integrase needs to splice HIV into human DNA; it suppressed 62% of triple-class-resistant patients below 50 copies per millilitre against 33% on optimised background alone, and matched efavirenz in treatment-naive patients while causing roughly half the drug-related adverse events, but it needs twice-daily dosing in its original tablet and has the lowest resistance barrier in its class.',
    laymanHowItWorks:
      'HIV cannot stay in a cell as a loose copy. It has to cut into a chromosome and paste itself in, and integrase is the tool that does the cutting. That tool works by holding two magnesium atoms in place and using them to make the cut. Raltegravir grabs both magnesium atoms, so the enzyme is holding the drug instead of the DNA and the paste step never happens. Virus already pasted in before treatment is untouched, which is why this suppresses rather than cures.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$34.54 per tablet at United States pharmacy acquisition cost, median across two listed brand products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Still listed at brand pricing in the CMS survey, across two products, roughly nineteen years after first approval. The comparison worth making on this page is not with a generic of itself but with dolutegravir at US$105.03, which beat it in a head-to-head trial and which most treatment programmes now use instead. Merck has licensed raltegravir to the Medicines Patent Pool for paediatric formulations.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The class raltegravir created has since produced two better members. Its remaining advantages are specific rather than general: the widest paediatric licence, and no cytochrome P450 metabolism at all.',
      conventionalRx: [
        {
          name: 'Dolutegravir (Tivicay)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'Compared head to head in SAILING in 715 treatment-experienced patients: 71% against 64% below 50 copies per millilitre at week 48, adjusted difference 7.4% (95% CI 0.7 to 14.2, p=0.03 for superiority), and treatment-emergent integrase resistance in four dolutegravir patients against seventeen on raltegravir. It also dissociates from the intasome over hours rather than minutes, which is the physical basis of that difference.',
          typicalCost:
            'US$105.03 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: once daily in one tablet, far higher resistance barrier, no food restriction. Cons: more weight gained, and a narrower licence in the smallest infants.',
        },
        {
          name: 'Bictegravir (only in Biktarvy)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'A comparable resistance barrier to dolutegravir in a single fixed-dose tablet. It is not available as a single agent, so it cannot be combined with anything other than the two drugs it comes with.',
          typicalCost:
            'Not listed separately in the CMS NADAC file; the single-agent product does not exist',
          prosAndCons:
            'Pros: one tablet, no booster, no food requirement. Cons: no generic anywhere, and no flexibility when one component has to change.',
        },
        {
          name: 'Cabotegravir (Vocabria, Apretude)',
          class: 'Integrase strand-transfer inhibitor, second generation, long-acting',
          howItCompares:
            'Structurally the closest relative of dolutegravir, formulated as a long-acting injectable that removes daily dosing entirely. It has no oral maintenance role of its own outside the injectable regimen.',
          typicalCost: 'Not carried in the CMS NADAC tablet file quoted on this page',
          prosAndCons:
            'Pros: no daily tablet at all. Cons: injections every one or two months, injection site reactions, and a long pharmacokinetic tail that turns any failure into a resistance risk.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=NN=C(O1)C(=O)NC(C)(C)C2=NC(=C(C(=O)N2C)O)C(=O)NCC3=CC=C(C=C3)F',
      chemicalFormula: 'C20H21FN6O5',
      molecularWeight: '444.40 g/mol (free base); dispensed as raltegravir potassium',
      targetReceptorAffinity:
        'Binds the intasome rather than a receptor. The N-methyl-4-hydroxypyrimidinone carbonyl core presents the oxygen triad that chelates both catalytic Mg2+ ions, with the 4-fluorobenzyl group occupying the pocket vacated by the displaced 3-prime adenosine of viral DNA. The property that separates it from the second-generation drugs is kinetic: raltegravir dissociates from the intasome on a timescale of minutes where dolutegravir takes hours, so a mutant integrase with modestly reduced affinity can still function, which is why single substitutions at Y143, Q148 and N155 confer clinical resistance.',
      structureSource: {
        label: 'PubChem CID 54671008 (raltegravir) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54671008',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ral-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity control of the hydroxypyrimidinone core and the oxadiazole fragment',
          description:
            'Assay identity and purity of the two heterocyclic fragments. The N-methyl-4-hydroxypyrimidinone carries the chelating oxygen triad and the 1,3,4-oxadiazole carboxamide is the fragment that sets metabolic stability, so an impurity in either changes a different property of the finished molecule.',
          reagentsAndBuffer:
            'Raltegravir reference standard, 5-methyl-1,3,4-oxadiazole-2-carboxylic acid reference, reversed-phase HPLC with UV detection, proton and carbon NMR, Karl Fischer titration, ion chromatography for potassium content',
        },
        {
          id: 'ral-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Pyrimidinone assembly and sequential amide couplings',
          description:
            'Build the pyrimidinone ring bearing the tertiary carbinamine, couple the 4-fluorobenzylamine to one carboxyl and the oxadiazole carboxylic acid to the amine, then unmask the chelating hydroxyl. As with the whole class, the hydroxyl stays protected through the couplings, because free it sequesters metal and stalls the reaction it is meant to survive.',
          dependsOnStepId: 'ral-w1',
          reagentsAndBuffer:
            '2-amino-2-methylpropanenitrile, dimethyl acetylenedicarboxylate route to the pyrimidinone, 4-fluorobenzylamine, 5-methyl-1,3,4-oxadiazole-2-carbonyl chloride, carbodiimide or HATU activation, N,N-diisopropylethylamine in acetonitrile under nitrogen',
        },
        {
          id: 'ral-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Potassium salt formation, and the two tablet forms that dissolve differently',
          description:
            'Form the potassium salt and crystallise it, then split the material by the dissolution specification for each tablet. This is the step that decides whether the product is the twice-daily 400 mg tablet or the once-daily 600 mg one: the two differ in formulation and dissolution rather than in molecule, and that difference is what made once-daily dosing work on the second attempt.',
          dependsOnStepId: 'ral-w2',
          reagentsAndBuffer:
            'Potassium hydroxide or potassium tert-butoxide in ethanol, seeded antisolvent crystallisation, X-ray powder diffraction for polymorph identity, USP dissolution apparatus run separately against the 400 mg and 600 mg specifications',
        },
        {
          id: 'ral-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Single-round infection of MT-4 cells with an integrase-mutant panel',
          description:
            'Infect MT-4 cells and primary peripheral blood mononuclear cells with wild-type reporter virus and with Y143R, Q148H and N155H mutants in the presence of graded drug. Three distinct resistance pathways is unusual, and a panel that carries only one of them will overstate the barrier.',
          dependsOnStepId: 'ral-w3',
          reagentsAndBuffer:
            'MT-4 cells and Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, VSV-G pseudotyped HIV-1 NL4-3 luciferase reporter virus, Y143R, Q148H and N155H site-directed integrase mutants, 50% human serum arm',
        },
        {
          id: 'ral-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Strand-transfer inhibition and intasome dissociation half-life',
          description:
            'Measure inhibition of concerted strand transfer with recombinant integrase, then measure how long the drug stays bound once the intasome has formed. For raltegravir the second number is the whole story: it is short, it does not appear in an EC50, and it is what the second-generation drugs were designed to change.',
          dependsOnStepId: 'ral-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 integrase, biotinylated donor and target oligonucleotide duplexes, magnesium chloride assay buffer, streptavidin-coated plates with europium detection, radiolabelled drug for the dissociation time course',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ral-a1',
        category: 'measured',
        title: 'BENCHMRK: 62% suppressed against 33% in triple-class-resistant patients',
        laymanSummary:
          'In 699 people whose virus had already defeated all three existing drug classes, adding raltegravir to the best remaining regimen put 62% below 50 copies per millilitre at 48 weeks against 33% on the best remaining regimen alone. For that population there had previously been nothing new to add.',
        technicalDetails:
          'BENCHMRK-1 and BENCHMRK-2 (NCT00293267 and NCT00293254) were two identical double-blind trials in different regions, randomising patients with triple-class drug-resistant HIV-1 failing therapy 2:1 to raltegravir 400 mg twice daily or placebo, each with an optimised background regimen; 699 of 703 randomised patients received study drug, 462 raltegravir and 237 placebo. At week 16, counting non-completion as failure, 355 of 458 (77.5%) against 99 of 236 (41.9%) had HIV-1 RNA below 400 copies per millilitre (p<0.001). Below 50 copies per millilitre the figures were 61.8% against 34.7% at week 16 and 62.1% against 32.9% at week 48 (p<0.001 for both). Superiority was consistent across every prognostic subgroup examined, including high baseline viral load, low CD4 count and low genotypic or phenotypic sensitivity score. Among patients using both darunavir and enfuvirtide for the first time, 89% of raltegravir recipients against 68% of placebo recipients reached below 50 copies per millilitre.',
        evidenceSource:
          'Steigbigel RT et al., N Engl J Med 2008;359:339-354; Cooper DA et al., N Engl J Med 2008;359:355-365 (BENCHMRK-1 and -2, NCT00293267 and NCT00293254)',
        doi: '10.1056/NEJMoa0708975',
        measuredMetric:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at weeks 16 and 48, non-completion counted as failure',
        auditFlag: 'verified',
      },
      {
        id: 'ral-a2',
        category: 'measured',
        title: 'STARTMRK: matched efavirenz at 48 weeks and beat it at five years',
        laymanSummary:
          'Against efavirenz in 566 people starting treatment, raltegravir reached 86% suppressed against 82% at 48 weeks, and drove viral load down faster. By five years the gap had widened to 71% against 61%, largely because far fewer people had stopped taking it.',
        technicalDetails:
          'STARTMRK (NCT00369941) randomised 566 treatment-naive patients, double-blind, to raltegravir 400 mg twice daily or efavirenz 600 mg once daily, each with tenofovir disoproxil and emtricitabine, and remained blinded to its five-year conclusion. At baseline 297 (53%) had above 100,000 copies per millilitre and 267 (47%) had CD4 counts at or below 200 cells per microlitre. At week 48, with non-completion counted as failure, 241 of 281 (86.1%) against 230 of 282 (81.9%) reached below 50 copies per millilitre, difference 4.2% (95% CI -1.9 to 10.3) against a 12% non-inferiority margin, with a significantly shorter time to suppression (log-rank p<0.0001). Drug-related clinical adverse events occurred in 124 (44.1%) against 217 (77.0%), difference -32.8% (95% CI -40.2 to -25.0, p<0.0001). At week 240, 198 of 279 (71.0%) against 171 of 279 (61.3%) were below 50 copies per millilitre, difference 9.5% (95% CI 1.7 to 17.3). Discontinuation for adverse events was 14 (5%) against 28 (10%), and neuropsychiatric side effects 39.1% against 64.2% (p<0.001).',
        evidenceSource:
          'Lennox JL et al., Lancet 2009;374:796-806; Rockstroh JK et al., J Acquir Immune Defic Syndr 2013;63:77-85 (STARTMRK, NCT00369941)',
        doi: '10.1016/S0140-6736(09)60918-1',
        measuredMetric:
          'Proportion below 50 copies per millilitre at week 48 (difference 4.2%, 95% CI -1.9 to 10.3) and at week 240 (difference 9.5%, 95% CI 1.7 to 17.3)',
        auditFlag: 'verified',
      },
      {
        id: 'ral-a3',
        category: 'failed',
        title: 'QDMRK: the once-daily trial failed, and the sponsor published that it failed',
        laymanSummary:
          'Pharmacokinetic modelling said two 400 mg tablets taken together once a day should work as well as one every twelve hours. A 775-patient trial tested it and found 83% suppressed against 89%, missing the non-inferiority margin. The published conclusion was that once-daily raltegravir cannot be recommended.',
        technicalDetails:
          'QDMRK (NCT00745823) was an international, double-blind, phase 3 non-inferiority trial at 83 centres, randomising 775 antiretroviral-naive patients 1:1 to raltegravir 400 mg twice daily or two 400 mg tablets taken together once daily, each with co-formulated tenofovir disoproxil and emtricitabine; 770 received study drug. At baseline 304 (39%) had above 100,000 copies per millilitre and 188 (24%) had CD4 counts below 200 cells per microlitre. At week 48, with non-completers counted as failures, 318 of 382 (83%) once-daily patients against 343 of 386 (89%) twice-daily patients had viral RNA below 50 copies per millilitre, difference -5.7% (95% CI -10.7 to -0.83, p=0.044). The lower bound crossed the prespecified -10% margin, so non-inferiority was not established, and the difference was nominally significant in favour of the established schedule. Serious adverse events were 26 (7%) against 40 (10%). The trial was funded by Merck, and its published interpretation reads, in full: despite high response rates with both regimens, once-daily raltegravir cannot be recommended in place of twice-daily dosing.',
        evidenceSource: 'Eron JJ et al., Lancet Infect Dis 2011;11:907-915 (QDMRK, NCT00745823)',
        doi: '10.1016/S1473-3099(11)70196-7',
        measuredMetric:
          'Proportion below 50 copies per millilitre at week 48: 83% against 89%, difference -5.7% (95% CI -10.7 to -0.83) against a -10% margin',
        auditFlag: 'verified',
      },
      {
        id: 'ral-a4',
        category: 'conclusion_shift',
        title:
          'Once-daily then succeeded at a higher total dose in a different tablet, not at the same dose in the same tablet',
        laymanSummary:
          'The lesson of the failed trial was read carefully. The problem was not the schedule; it was that the original tablet did not dissolve well enough to sustain a whole day from a single dose. A reformulated tablet, at a higher total daily dose, was then tested and worked.',
        technicalDetails:
          'ONCEMRK (NCT02131233) randomised 802 treatment-naive patients 2:1, double-blind, at 139 sites, to raltegravir 1200 mg once daily as two 600 mg reformulated tablets or to raltegravir 400 mg twice daily, each with tenofovir disoproxil and emtricitabine; 797 received study therapy. At week 48, 472 of 531 (89%) against 235 of 266 (88%) had HIV-1 RNA below 40 copies per millilitre by FDA snapshot, treatment difference 0.5% (95% CI -4.2 to 5.2) against a -10% margin, and non-inferiority was met. Drug-related adverse events occurred in 130 (24%) against 68 (26%). The 600 mg tablet has improved bioavailability over the 400 mg tablet, attributed at least in part to differences in tablet dissolution. So the sequence is: a dosing schedule fails at 800 mg a day in the old tablet, and succeeds at 1200 mg a day in a new one. Total daily dose rose by half and the formulation changed, and the failed trial is what made the successful one possible.',
        evidenceSource:
          'Cahn P et al., Lancet HIV 2017;4:e486-e494 (ONCEMRK, NCT02131233); Deeks ED, Drugs 2017;77:1789-1795',
        doi: '10.1016/S2352-3018(17)30128-5',
        inferredClaim:
          'That the original once-daily failure was a schedule problem — it was a formulation and total-dose problem, and reading it as the former would have retired a workable regimen',
        auditFlag: 'verified',
      },
      {
        id: 'ral-a5',
        category: 'failed',
        title: 'The lowest resistance barrier in its class, with three separate escape routes',
        laymanSummary:
          'Of the patients who failed raltegravir in the resistance trials, most had developed integrase mutations, and three quarters of those had more than one. Against dolutegravir in a head-to-head trial, raltegravir produced four times as many failures carrying new integrase resistance.',
        technicalDetails:
          'In BENCHMRK at week 48, 105 of 462 raltegravir recipients (23%) had virological failure. Genotyping was done in 94 of them, and integrase mutations known to confer phenotypic resistance had arisen during treatment in 64 (68%); 48 of those 64 (75%) carried two or more resistance-associated mutations. Escape runs through three independent primary pathways, Y143, Q148 and N155, each with its own secondary mutations, so the virus has more than one route out. In SAILING, which compared raltegravir directly with dolutegravir in 715 treatment-experienced, integrase-naive adults, virological failure with treatment-emergent integrase resistance occurred in seventeen raltegravir patients against four on dolutegravir, adjusted difference -3.7% (95% CI -6.1 to -1.2, p=0.003). The mechanistic account is dissociation kinetics: raltegravir leaves the intasome in minutes, so an integrase carrying a modestly weakened binding site still functions, whereas dolutegravir stays bound for hours and the equivalent mutant loses more fitness than it gains.',
        evidenceSource:
          'Cooper DA et al., N Engl J Med 2008;359:355-365; Cahn P et al., Lancet 2013;382:700-708 (SAILING, NCT01231516)',
        doi: '10.1056/NEJMoa0708978',
        measuredMetric:
          'Treatment-emergent integrase resistance in 64 of 94 genotyped failures, 75% of them carrying two or more mutations; 17 against 4 emergent-resistance failures against dolutegravir',
        auditFlag: 'caution',
      },
      {
        id: 'ral-a6',
        category: 'conclusion_shift',
        title: 'A cancer imbalance in the registration trial that did not survive follow-up',
        laymanSummary:
          'The paper that established raltegravir reported cancers in 3.5% of drug recipients against 1.7% on placebo. That number entered the literature unadjusted for how long each group had been followed, and the imbalance did not persist as the trials continued.',
        technicalDetails:
          'The BENCHMRK primary publication states that without adjustment for length of follow-up, cancers were detected in 3.5% of raltegravir recipients against 1.7% of placebo recipients. The caveat is doing considerable work: the raltegravir arm was twice the size, retained patients far longer because the drug worked, and the placebo arm was largely lost to failure and rollover, so person-time differed substantially between the two. The week 96 combined analysis of BENCHMRK-1 and -2 reports raltegravir with optimised background as generally well tolerated with superior and durable efficacy, and the signal is not carried forward as a finding. Raltegravir has no malignancy warning in its labelling. This is a numerically alarming raw proportion reported with a person-time caveat that prevented it from becoming a supported safety signal.',
        evidenceSource:
          'Steigbigel RT et al., N Engl J Med 2008;359:339-354; Steigbigel RT et al., Clin Infect Dis 2010;50:605-612 (week 96 combined analysis)',
        doi: '10.1086/650002',
        inferredClaim:
          'That the 3.5% against 1.7% raw cancer proportions in BENCHMRK described a real excess risk, when the two arms differed substantially in person-time and the imbalance did not persist',
        auditFlag: 'contested',
      },
      {
        id: 'ral-a7',
        category: 'measured',
        title: 'The one property no successor took from it: no cytochrome P450 metabolism at all',
        laymanSummary:
          'Raltegravir is cleared by a completely different route from almost every other HIV drug, which means it has almost no interactions with the liver enzymes that cause most drug interactions. That is why it is still used in transplant patients, in tuberculosis co-treatment and in the smallest newborns.',
        technicalDetails:
          'Raltegravir is eliminated principally by UGT1A1-mediated glucuronidation and is neither a substrate nor an inhibitor nor an inducer of cytochrome P450 enzymes. It requires no pharmacokinetic booster. The practical consequences are that its interaction list is short and dominated by UGT1A1 inducers such as rifampicin, and that it can be given alongside drug classes whose CYP3A interactions make protease inhibitors and boosted regimens difficult, including immunosuppressants after solid organ transplant and several oncology agents. It also holds the widest paediatric licence in the integrase class, down to neonates weighing at least 2 kg. These are narrow advantages rather than general ones, and they are the reason a drug beaten on efficacy and on resistance barrier by its own successors is still on the market.',
        evidenceSource:
          'ISENTRESS and ISENTRESS HD (raltegravir) prescribing information, NDA 022145, Drugs@FDA; Lennox JL et al., Lancet 2009;374:796-806',
        doi: '10.1016/S0140-6736(09)60918-1',
        measuredMetric:
          'Elimination by UGT1A1 glucuronidation with no cytochrome P450 substrate, inhibitor or inducer activity, and a paediatric licence down to 2 kg',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed twice a day in the original tablet, once in the reformulated one',
        laymanDesc:
          'The original tablet has to be taken every twelve hours. A newer, differently made tablet dissolves better and can be taken once a day. Same molecule, different tablet.',
        molecularDetail:
          'Raltegravir has a short plasma half-life of around 9 hours and its absorption is formulation-dependent. Two 400 mg tablets taken together once daily failed non-inferiority in QDMRK; two reformulated 600 mg tablets taken together once daily met it in ONCEMRK, with the improved bioavailability attributed at least in part to differences in tablet dissolution. Elimination is by UGT1A1 glucuronidation with no cytochrome P450 involvement, so no booster is needed and the interaction profile is dominated by UGT inducers such as rifampicin.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It sits inside the cell waiting for the virus to arrive',
        laymanDesc:
          'The drug moves into cells by itself and does nothing until a virus enters, copies its genome into DNA and assembles the machine that will paste that DNA in.',
        molecularDetail:
          'Raltegravir is passively permeable and requires no intracellular activation, unlike the nucleoside analogues it is combined with, which must be phosphorylated three times before they do anything. It has negligible affinity for free integrase and binds only once the intasome, the nucleoprotein complex of integrase tetramer with viral DNA ends, has assembled.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grabs the two magnesium atoms the cutting enzyme needs',
        laymanDesc:
          'Integrase works by holding two magnesium atoms and using them to make a chemical cut. Raltegravir clamps onto both, so the enzyme is now gripping the drug rather than the DNA.',
        molecularDetail:
          'The N-methyl-4-hydroxypyrimidinone carbonyl core presents a coplanar triad of oxygen atoms that chelates both catalytic Mg2+ ions in the integrase active site, and the 4-fluorobenzyl group occupies the pocket the displaced 3-prime adenosine of viral DNA would fill. This was the first pharmacophore of its kind to reach approval and every drug in the class since uses a variant of it.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The paste step is blocked, but only while the drug stays bound',
        laymanDesc:
          'Strand transfer stops. The catch is how long the drug holds on: raltegravir lets go within minutes, so an enzyme that has been slightly reshaped by a mutation can still get its work done between visits.',
        molecularDetail:
          'Strand transfer is blocked specifically; 3-prime processing, the earlier step in which integrase trims a GT dinucleotide from each viral DNA end, still occurs. Dissociation from the intasome is on a minute timescale, against hours for dolutegravir. Three independent primary resistance pathways, Y143, Q148 and N155, each reduce binding enough to restore function, which is why 64 of 94 genotyped BENCHMRK failures carried treatment-emergent integrase mutations.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Viral load falls faster than on anything before it, and stays down if it holds',
        laymanDesc:
          'Virus drops quickly, faster than with the drugs it was compared against. It stays down for years in most people. When it does not, the failure usually costs the whole class.',
        molecularDetail:
          'Time to suppression was significantly shorter than on efavirenz in STARTMRK (log-rank p<0.0001), and five-year suppression was 71.0% against 61.3%. Unintegrated viral DNA is circularised and lost through cell division. Integrated provirus present before treatment is untouched, which is why this is suppression rather than cure. Failure with Y143, Q148 or N155 substitutions removes raltegravir and elvitegravir and reduces the options within the class for later drugs.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'BENCHMRK-1 and -2 (NCT00293267, NCT00293254)',
        phase: 'Two identical phase 3, randomised 2:1, double-blind, placebo-controlled trials',
        sampleSize: 699,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 400 copies per millilitre at week 16 in triple-class-resistant patients, with optimised background therapy in both arms',
        endpointMet: true,
        statisticalPValue:
          '77.5% versus 41.9% below 400 copies per millilitre at week 16 (p<0.001); 62.1% versus 32.9% below 50 copies per millilitre at week 48 (p<0.001)',
        unreportedAdverseSignals:
          'Cancers were detected in 3.5% of raltegravir recipients against 1.7% on placebo without adjustment for length of follow-up, in arms of very different size and retention. The imbalance did not persist and there is no malignancy warning in the labelling.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'STARTMRK (NCT00369941)',
        phase:
          'Phase 3, randomised, double-blind, non-inferiority, 48-week primary with 240-week blinded follow-up',
        sampleSize: 563,
        primaryEndpoint:
          'Proportion with viral RNA below 50 copies per millilitre at week 48 against efavirenz, non-completion counted as failure',
        endpointMet: true,
        statisticalPValue:
          '86.1% versus 81.9%, difference 4.2% (95% CI -1.9 to 10.3); at week 240, 71.0% versus 61.3%, difference 9.5% (95% CI 1.7 to 17.3)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'QDMRK (NCT00745823)',
        phase: 'Phase 3, randomised, double-blind, active-controlled, non-inferiority, 48 weeks',
        sampleSize: 770,
        primaryEndpoint:
          'Proportion with viral RNA below 50 copies per millilitre at week 48, raltegravir 800 mg once daily against 400 mg twice daily',
        endpointMet: false,
        statisticalPValue:
          '83% versus 89%, difference -5.7% (95% CI -10.7 to -0.83, p=0.044); the lower bound crossed the -10% non-inferiority margin',
        unreportedAdverseSignals:
          'This is a manufacturer-funded trial of a manufacturer-preferred dosing schedule that reported its own negative result and concluded in print that the schedule cannot be recommended. It is on this page as an example of the thing working.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'ONCEMRK (NCT02131233)',
        phase:
          'Phase 3, randomised 2:1, double-blind, parallel-group, non-inferiority, 48-week primary',
        sampleSize: 797,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 40 copies per millilitre at week 48 by FDA snapshot, raltegravir 1200 mg once daily as reformulated tablets against 400 mg twice daily',
        endpointMet: true,
        statisticalPValue: '89% versus 88%, treatment difference 0.5% (95% CI -4.2 to 5.2)',
        unreportedAdverseSignals:
          'The successful once-daily regimen uses a 50% higher total daily dose in a differently formulated tablet. It is not the regimen QDMRK tested and failed.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '62.1% against 32.9% below 50 copies per millilitre at week 48 in 699 triple-class-resistant patients (p<0.001)',
        '86.1% against 81.9% at week 48 and 71.0% against 61.3% at week 240 against efavirenz, with drug-related adverse events of 44.1% against 77.0%',
        'Once-daily 800 mg failed non-inferiority at 83% against 89%, difference -5.7% (95% CI -10.7 to -0.83)',
        'Once-daily 1200 mg in a reformulated tablet met non-inferiority at 89% against 88%, difference 0.5% (95% CI -4.2 to 5.2)',
      ],
      unsupportedInferences: [
        'That the raw cancer proportions of 3.5% against 1.7% in BENCHMRK described a real excess risk, when person-time differed substantially between arms and the imbalance did not persist',
        'That once-daily dosing was the property that failed in QDMRK, when the successful regimen changed both the formulation and the total daily dose',
        'That pharmacokinetic modelling of trough concentrations predicts virological outcome for this drug, which is the assumption QDMRK was designed on and disproved',
      ],
      whatFailedInitially: [
        'QDMRK missed its non-inferiority margin and the sponsor published the conclusion that once-daily raltegravir could not be recommended in place of twice-daily dosing',
        'Treatment-emergent integrase resistance arose in 64 of 94 genotyped BENCHMRK failures, 75% of them with two or more mutations, across three independent escape pathways',
        'Directly against dolutegravir in SAILING, raltegravir produced seventeen emergent-resistance failures against four',
      ],
      realWorldOutcome: [
        'The first integrase inhibitor approved anywhere, and the drug that opened the class now supplying first-line therapy for most of the world',
        'Displaced from first-line by dolutegravir and bictegravir on resistance barrier and dosing convenience rather than on suppression rate',
        'Retained for its specific advantages: no cytochrome P450 metabolism at all, and the widest paediatric licence in its class, down to 2 kg',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet in two strengths with different dissolution, chewable tablet, and granules for oral suspension for neonates',
      description:
        'The 400 mg tablet is taken twice daily; the reformulated 600 mg tablet is taken once daily as two tablets, and the two are not interchangeable on a milligram-per-milligram basis. Chewable tablets and granules for suspension are not interchangeable with the film-coated tablets either, because their bioavailability differs. Polyvalent cations chelate the same triad the drug uses on magnesium, so antacids interfere by binding the drug rather than by any effect on the gut.',
      safetyProfile:
        'Severe and potentially life-threatening skin reactions including Stevens-Johnson syndrome, toxic epidermal necrolysis and drug reaction with eosinophilia and systemic symptoms are labelled. Creatine kinase elevation, myopathy and rhabdomyolysis have been reported. Immune reconstitution inflammatory syndrome can follow suppression. Overall drug-related adverse events ran at roughly half the efavirenz rate in the head-to-head trial, and neuropsychiatric effects at 39.1% against 64.2% over five years. The cancer imbalance reported in the registration trial is discussed in the audits and did not persist.',
    },
    commonQuestions: [
      {
        q: 'Why do most people take it twice a day when other drugs in the class are once daily?',
        a: 'Because the original tablet cannot sustain a whole day from one dose, and a trial proved it. QDMRK randomised 775 treatment-naive patients to two 400 mg tablets together once daily or one every twelve hours. At 48 weeks the once-daily arm reached 83% against 89%, difference -5.7% with a confidence interval running to -10.7 against a -10% margin, so non-inferiority was not established. Merck funded that trial and published the conclusion that once-daily raltegravir could not be recommended. A reformulated 600 mg tablet with better dissolution was then developed, and two of those taken once daily, 1200 mg in total, did meet non-inferiority in ONCEMRK at 89% against 88%. So there is now a once-daily option, and it is a different tablet at a higher total dose rather than a rearrangement of the old one.',
        auditNote:
          'A manufacturer-funded trial of a manufacturer-preferred schedule that reported its own failure. This page includes it because that is what the process looks like when it works.',
      },
      {
        q: 'Is it as good as dolutegravir?',
        a: 'On suppression in people starting treatment, close. On resistance, no, and the trial that settled it was direct. SAILING randomised 715 treatment-experienced, integrase-naive adults to dolutegravir or raltegravir: 71% against 64% reached below 50 copies per millilitre at week 48, adjusted difference 7.4% (95% CI 0.7 to 14.2, p=0.03), and virological failure with treatment-emergent integrase resistance occurred in four dolutegravir patients against seventeen on raltegravir. The physical reason is how long each drug stays attached to its target: raltegravir dissociates in minutes and dolutegravir in hours, so a mutation that weakens binding a little is enough to rescue the enzyme from one and not from the other.',
      },
      {
        q: 'The registration trial reported more cancers. Should that worry me?',
        a: 'On the evidence available, no. The BENCHMRK paper states that without adjustment for length of follow-up, cancers were detected in 3.5% of raltegravir recipients against 1.7% on placebo. That caveat is doing a lot of work. The raltegravir arm was twice the size and retained patients far longer because the drug was working, while the placebo arm emptied through treatment failure, so the two groups contributed very different amounts of person-time. The imbalance did not persist through the 96-week and longer analyses, and raltegravir carries no malignancy warning in its labelling.',
      },
      {
        q: 'Why is it still used when newer drugs in the same class are better?',
        a: 'For two specific properties neither successor has. First, raltegravir is cleared entirely by UGT1A1 glucuronidation and has no cytochrome P450 substrate, inhibitor or inducer activity, so it can be given alongside drug classes where CYP3A interactions make other regimens difficult, including immunosuppression after organ transplant. Second, it holds the widest paediatric licence in the class, down to neonates weighing at least 2 kg, in granule and chewable formulations. Neither is a general advantage. Both are decisive when they apply.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for raltegravir could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost, and which is still a brand price nineteen years after approval.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Steigbigel RT, Cooper DA, Kumar PN, et al. Raltegravir with optimized background therapy for resistant HIV-1 infection. N Engl J Med 2008;359:339-354',
        identifier: '10.1056/NEJMoa0708975',
        kind: 'doi',
      },
      {
        label:
          'Cooper DA, Steigbigel RT, Gatell JM, et al. Subgroup and resistance analyses of raltegravir for resistant HIV-1 infection. N Engl J Med 2008;359:355-365',
        identifier: '10.1056/NEJMoa0708978',
        kind: 'doi',
      },
      {
        label:
          'Steigbigel RT, Cooper DA, Teppler H, et al. Long-term efficacy and safety of raltegravir combined with optimized background therapy in treatment-experienced patients with drug-resistant HIV infection: week 96 results of the BENCHMRK 1 and 2 phase III trials. Clin Infect Dis 2010;50:605-612',
        identifier: '10.1086/650002',
        kind: 'doi',
      },
      {
        label:
          'Lennox JL, DeJesus E, Lazzarin A, et al. Safety and efficacy of raltegravir-based versus efavirenz-based combination therapy in treatment-naive patients with HIV-1 infection: a multicentre, double-blind randomised controlled trial. Lancet 2009;374:796-806',
        identifier: '10.1016/S0140-6736(09)60918-1',
        kind: 'doi',
      },
      {
        label:
          'Rockstroh JK, DeJesus E, Lennox JL, et al. Durable efficacy and safety of raltegravir versus efavirenz when combined with tenofovir/emtricitabine in treatment-naive HIV-1-infected patients: final 5-year results from STARTMRK. J Acquir Immune Defic Syndr 2013;63:77-85',
        identifier: '10.1097/QAI.0b013e31828ace69',
        kind: 'doi',
      },
      {
        label:
          'Eron JJ, Rockstroh JK, Reynes J, et al. Raltegravir once daily or twice daily in previously untreated patients with HIV-1: a randomised, active-controlled, phase 3 non-inferiority trial. Lancet Infect Dis 2011;11:907-915',
        identifier: '10.1016/S1473-3099(11)70196-7',
        kind: 'doi',
      },
      {
        label:
          'Cahn P, Kaplan R, Sax PE, et al. Raltegravir 1200 mg once daily versus raltegravir 400 mg twice daily, with tenofovir disoproxil fumarate and emtricitabine, for previously untreated HIV-1 infection: a randomised, double-blind, parallel-group, phase 3, non-inferiority trial. Lancet HIV 2017;4:e486-e494',
        identifier: '10.1016/S2352-3018(17)30128-5',
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
          'Deeks ED. Raltegravir once-daily tablet: a review in HIV-1 infection. Drugs 2017;77:1789-1795',
        identifier: '10.1007/s40265-017-0827-9',
        kind: 'doi',
      },
      {
        label:
          'BENCHMRK-1: raltegravir with optimised background therapy in triple-class-resistant HIV-1',
        identifier: 'NCT00293267',
        kind: 'nct',
      },
      {
        label:
          'BENCHMRK-2: raltegravir with optimised background therapy in triple-class-resistant HIV-1',
        identifier: 'NCT00293254',
        kind: 'nct',
      },
      {
        label:
          'STARTMRK: raltegravir versus efavirenz with tenofovir and emtricitabine, treatment-naive',
        identifier: 'NCT00369941',
        kind: 'nct',
      },
      {
        label: 'QDMRK: raltegravir 800 mg once daily versus 400 mg twice daily, treatment-naive',
        identifier: 'NCT00745823',
        kind: 'nct',
      },
      {
        label: 'ONCEMRK: reformulated raltegravir 1200 mg once daily versus 400 mg twice daily',
        identifier: 'NCT02131233',
        kind: 'nct',
      },
      {
        label:
          'ISENTRESS and ISENTRESS HD (raltegravir) — Drugs@FDA application NDA 022145, Merck Sharp and Dohme, original approval 12 October 2007',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022145',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 54671008 — raltegravir structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54671008',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Abacavir — the clearest pharmacogenomic success in medicine, attached to the longest-running
  //    unresolved cardiovascular argument in HIV, and inferior to its competitor in exactly the
  //    patients who need it most.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'abacavir',
    name: 'Abacavir',
    tradeName:
      'Ziagen; with lamivudine as Epzicom, and with dolutegravir and lamivudine as Triumeq',
    sponsor: 'ViiV Healthcare (originated at Glaxo Wellcome)',
    targetGene: 'HIV-1 pol, reverse transcriptase coding region',
    targetProtein:
      'HIV-1 reverse transcriptase, chain-terminated by carbovir triphosphate, the intracellular metabolite of abacavir, competing with dGTP',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults and paediatric patients aged at least 3 months, with HLA-B*5701 screening before initiation',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite:
      'Cytoplasm of CD4-positive T cells for the antiviral effect; the antigen-binding groove of an HLA molecule on the cell surface for the hypersensitivity reaction',
    conditionContext: {
      conditionExplainer:
        'Abacavir is a guanosine analogue that HIV-1 reverse transcriptase mistakes for a real DNA building block. It has no activity against hepatitis B and no effect on the kidney or the skeleton, which is what distinguishes it from the tenofovir prodrugs it competes with.',
      whyItMatters:
        'Abacavir is the drug that proved a genetic test could prevent a specific toxic effect. Before HLA-B*5701 screening, roughly one person in twenty starting it developed a systemic hypersensitivity reaction that was fatal on rechallenge. After screening, immunologically confirmed reactions fell to zero in a randomised trial.',
      whoTakesThis:
        'People who test negative for HLA-B*5701 and who need a nucleoside backbone without renal or bone effects, commonly in the fixed-dose combination with dolutegravir and lamivudine.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre and kept there, with a screening test done before the first dose rather than after the first reaction.',
    },
    oneSentenceVerdict:
      'A guanosine analogue that terminates the HIV DNA chain, and the drug that demonstrated a genetic test could abolish a specific toxicity: prospective HLA-B*5701 screening reduced immunologically confirmed hypersensitivity from 2.7% to 0% in 1,956 randomised patients, with a negative predictive value of 100%; it is nonetheless measurably inferior to tenofovir-emtricitabine above 100,000 copies per millilitre at baseline, and carries a cardiovascular association that observational and randomised evidence have disagreed about for eighteen years.',
    laymanHowItWorks:
      'Abacavir is a counterfeit version of one of the four chemical letters DNA is built from. The cell modifies it into its active form, and the enzyme HIV uses to copy itself picks it up and stitches it into the growing chain, at which point the chain cannot be extended and the copy stops. Separately and by a completely unrelated route, in about one person in twenty the intact drug slips into a groove on an immune-presenting molecule and changes which of the body own proteins that molecule displays, which the immune system reads as foreign.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 75,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.5380 per tablet at United States pharmacy acquisition cost, median across 12 listed generic products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Generic across 12 listed products. The cost that does not appear in this line is the mandatory HLA-B*5701 genotype before the first dose, which is a laboratory test rather than a drug and is not carried in the NADAC file. A drug whose safe use depends on a test is not fully priced by its tablet price, and no verified figure for the test was assembled here.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Abacavir competes with the two tenofovir prodrugs for the same slot in a regimen, and the choice between them is a choice about which organ system to worry about.',
      conventionalRx: [
        {
          name: 'Tenofovir disoproxil fumarate (generic)',
          class: 'Nucleotide reverse transcriptase inhibitor',
          howItCompares:
            'Directly compared in ACTG A5202. In patients starting above 100,000 copies per millilitre, time to virological failure was significantly shorter on abacavir-lamivudine with efavirenz (hazard ratio 2.46, 95% CI 1.20 to 5.05) or with atazanavir-ritonavir (2.22, 95% CI 1.19 to 4.14), and blinded treatment in that stratum was stopped. Below that threshold the two were indistinguishable.',
          typicalCost:
            'US$0.5051 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: covers hepatitis B, no genetic test needed, no cardiovascular question. Cons: proximal tubulopathy and bone mineral density loss, and dose adjustment at reduced creatinine clearance.',
        },
        {
          name: 'Tenofovir alafenamide',
          class: 'Nucleotide reverse transcriptase inhibitor, later prodrug',
          howItCompares:
            'Delivers the same active molecule as tenofovir disoproxil with smaller bone and renal biomarker changes. Like its predecessor it covers hepatitis B, which abacavir does not, and it needs no pharmacogenetic test.',
          typicalCost:
            'US$74.94 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 29 June 2026)',
          prosAndCons:
            'Pros: usable at low creatinine clearance, hepatitis B activity, no genetic screening. Cons: on patent at 148 times the price of the generic prodrug of the same molecule, higher LDL cholesterol and more weight.',
        },
        {
          name: 'Lamivudine (generic), as part of a two-drug regimen',
          class: 'Nucleoside reverse transcriptase inhibitor, cytidine analogue',
          howItCompares:
            'The drug abacavir is co-formulated with. Two-drug regimens pairing lamivudine with dolutegravir remove the third nucleoside entirely, which is the strategy that has reduced how often the abacavir-versus-tenofovir question needs answering at all.',
          typicalCost:
            'US$0.4887 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: extremely well tolerated, covers hepatitis B, cheapest option on this page. Cons: a single M184V substitution confers high-level resistance, and a two-drug regimen is not appropriate in every situation.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC1NC2=C3C(=NC(=N2)N)N(C=N3)[C@@H]4C[C@@H](C=C4)CO',
      chemicalFormula: 'C14H18N6O',
      molecularWeight: '286.33 g/mol (free base); dispensed as abacavir sulfate',
      targetReceptorAffinity:
        'Abacavir itself has no antiviral target. It is converted intracellularly by adenosine phosphotransferase and a cytosolic deaminase to carbovir monophosphate and then to carbovir triphosphate, which is the active species and competes with deoxyguanosine triphosphate at the reverse transcriptase active site; chain termination follows incorporation because the carbocyclic ring carries no 3-prime hydroxyl. Separately and unrelatedly, unmodified abacavir binds non-covalently within the F pocket of the HLA-B*57:01 antigen-binding cleft, where a C-terminal tryptophan normally anchors the presented peptide. Binding is exquisitely specific to that allotype and changes the shape and chemistry of the cleft, so a different set of endogenous self-peptides is selected and displayed. The relative risk of hypersensitivity in carriers exceeds 1,000.',
      structureSource: {
        label: 'PubChem CID 441300 (abacavir) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441300',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'abc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric and diastereomeric control of the carbocyclic cyclopentene',
          description:
            'Confirm configuration at the two stereocentres of the cyclopentene ring that replaces the sugar of a natural nucleoside. Abacavir is the (1S,4R) enantiomer; the antipode is inactive as an antiviral and, because the HLA interaction is a separate stereospecific binding event, an enantiomeric impurity is a distinct pharmacological entity rather than simply inert filler.',
          reagentsAndBuffer:
            'Abacavir sulfate reference standard, chiral HPLC on an amylose-derived stationary phase, optical rotation, proton and carbon NMR, ion chromatography for sulfate stoichiometry, Karl Fischer titration',
        },
        {
          id: 'abc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Purine coupling to the carbocyclic amine and cyclopropylamine displacement',
          description:
            'Couple the enantiopure aminocyclopentene alcohol to a 2-amino-4,6-dichloropyrimidine, close the imidazole ring to give the purine, then displace the remaining 6-chloro substituent with cyclopropylamine. The cyclopropylamino group is the fragment that distinguishes abacavir from other guanosine analogues, and it is also the part that sits deepest in the HLA F pocket.',
          dependsOnStepId: 'abc-w1',
          reagentsAndBuffer:
            '(1S,4R)-4-amino-2-cyclopentene-1-methanol, 2-amino-4,6-dichloropyrimidine, triethylamine in n-butanol, triethyl orthoformate with acid for ring closure, cyclopropylamine under pressure, then sulfuric acid for salt formation',
        },
        {
          id: 'abc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hemisulfate salt crystallisation and related-substance profiling',
          description:
            'Crystallise the hemisulfate that is the marketed salt and profile related substances. The impurity of interest is the deaminated purine analogue, which arises through the same deamination chemistry the body uses to activate the drug, so the degradation pathway and the activation pathway are the same reaction happening in the wrong place.',
          dependsOnStepId: 'abc-w2',
          reagentsAndBuffer:
            'Sulfuric acid in ethanol-water, seeded cooling crystallisation, X-ray powder diffraction for salt form identity, reversed-phase HPLC with UV detection for related substances, accelerated stability chambers',
        },
        {
          id: 'abc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel loading of PBMCs and of HLA-B*57:01-transfected antigen-presenting cells',
          description:
            'Run two unrelated experiments on the same batch. Infect peripheral blood mononuclear cells to measure antiviral potency, and separately expose HLA-B*57:01-expressing and HLA-B*57:03-expressing cells to unmodified drug to measure whether the antigen-binding cleft is occupied. The two effects of this molecule share nothing except the molecule, and testing only one of them is how the hypersensitivity reached the market unexplained.',
          dependsOnStepId: 'abc-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, HIV-1 NL4-3 reporter virus, HLA-B*57:01 and HLA-B*57:03 transfected C1R cells as a specificity control, soluble recombinant HLA-B*57:01 for binding studies',
        },
        {
          id: 'abc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Carbovir triphosphate by LC-MS/MS, and eluted self-peptide repertoire by mass spectrometry',
          description:
            'Quantify intracellular carbovir triphosphate to establish antiviral exposure, and elute and sequence the peptides presented by HLA-B*57:01 with and without drug to establish how much of the displayed self has changed. The second measurement is the mechanism of the hypersensitivity and it did not exist until 2012, fourteen years after approval.',
          dependsOnStepId: 'abc-w4',
          reagentsAndBuffer:
            'Stable-isotope-labelled carbovir triphosphate internal standard, weak anion-exchange solid-phase extraction, LC-MS/MS in negative ion mode, immunoaffinity purification of HLA-peptide complexes with W6/32 antibody, tandem mass spectrometry of eluted peptides',
        },
      ],
    },
    keyAudits: [
      {
        id: 'abc-a1',
        category: 'measured',
        title: 'PREDICT-1: a genetic test took immunologically confirmed reactions to zero',
        laymanSummary:
          'In 1,956 patients randomised either to be genotyped before starting abacavir or to start it the usual way, confirmed hypersensitivity fell from 2.7% to zero. Nobody who tested negative had a confirmed reaction, in any patient, anywhere in the trial.',
        technicalDetails:
          'PREDICT-1 (NCT00340080) was a double-blind, prospective, randomised study across 19 countries in 1,956 abacavir-naive patients with HIV-1, comparing prospective HLA-B*5701 screening with exclusion of carriers against standard-of-care abacavir use without screening. All patients starting abacavir were observed for six weeks, and clinical diagnoses were confirmed immunologically by epicutaneous patch testing with abacavir. HLA-B*5701 prevalence was 5.6% (109 of 1,956). Immunologically confirmed hypersensitivity was 0% in the screening group against 2.7% in the control group (p<0.001), with a negative predictive value of 100% and a positive predictive value of 47.9%. Clinically diagnosed hypersensitivity, which is the less specific endpoint, fell from 7.8% to 3.4% (p<0.001). The gap between those two endpoints is itself informative: more than half of clinical diagnoses were not the reaction they were taken for.',
        evidenceSource:
          'Mallal S, Phillips E, Carosi G, et al. N Engl J Med 2008;358:568-579 (PREDICT-1, NCT00340080)',
        doi: '10.1056/NEJMoa0706135',
        measuredMetric:
          'Immunologically confirmed hypersensitivity reaction at six weeks: 0% against 2.7% (p<0.001), negative predictive value 100%, positive predictive value 47.9%',
        auditFlag: 'verified',
      },
      {
        id: 'abc-a2',
        category: 'measured',
        title: 'The mechanism arrived in 2012, fourteen years after the drug did',
        laymanSummary:
          'For fourteen years the reaction was a statistical association with a gene. Two structural studies then showed that abacavir slots into the groove where that HLA molecule displays fragments of the body own proteins, changes the shape of the groove, and causes a different set of self-proteins to be displayed. The immune system attacks what looks like a new self.',
        technicalDetails:
          'Illing and colleagues showed that unmodified abacavir binds non-covalently to HLA-B*57:01, lying across the bottom of the antigen-binding cleft and reaching into the F pocket, where a C-terminal tryptophan normally anchors bound peptides. Binding is specific to that allotype, changes the shape and chemistry of the cleft, and alters the repertoire of endogenous peptides that can be presented, producing a peptide-centric altered self that activates polyclonal CD8 T cells. Ostrov and colleagues independently demonstrated F-pocket binding and altered specificity, and identified specific self-peptides presented only in the presence of abacavir that were recognised by T cells from hypersensitive patients. The relative risk of the reaction in carriers exceeds 1,000. The same paper showed carbamazepine binding HLA-B*15:02 by the same principle, which converted an idiosyncratic single-drug curiosity into a general mechanism for HLA-linked drug hypersensitivity.',
        evidenceSource:
          'Illing PT et al., Nature 2012;486:554-558; Ostrov DA et al., Proc Natl Acad Sci USA 2012;109:9959-9964',
        doi: '10.1038/nature11147',
        measuredMetric:
          'Non-covalent occupancy of the HLA-B*57:01 F pocket by unmodified abacavir, with mass-spectrometric identification of self-peptides presented only in the presence of drug',
        auditFlag: 'verified',
      },
      {
        id: 'abc-a3',
        category: 'failed',
        title: 'ACTG A5202: inferior above 100,000 copies per millilitre, and the arm was stopped',
        laymanSummary:
          'A blinded trial compared abacavir-lamivudine with tenofovir-emtricitabine in patients starting treatment. In those who began with a high viral load, abacavir failed significantly more often, and the data monitoring board stopped blinded treatment in that group. Below the threshold there was no difference.',
        technicalDetails:
          'ACTG A5202 (NCT00118898) randomised treatment-naive patients to blinded abacavir-lamivudine or tenofovir disoproxil-emtricitabine, each with open-label efavirenz or atazanavir-ritonavir, stratified by screening HIV RNA above or below 100,000 copies per millilitre. In the high stratum, before blinded treatment was stopped, time to virological failure was significantly shorter on abacavir-lamivudine with efavirenz (hazard ratio 2.46, 95% CI 1.20 to 5.05) and with atazanavir-ritonavir (2.22, 95% CI 1.19 to 4.14), and the data and safety monitoring board stopped blinded treatment in that stratum. In the low stratum, time to virological failure did not differ with atazanavir-ritonavir (1.25, 95% CI 0.76 to 2.05) or efavirenz (1.23, 95% CI 0.77 to 1.96), but time to regimen modification was significantly shorter on abacavir with either third agent, and time to a safety event was shorter with efavirenz. So the failure is confined to a stratum, it was detected by a blinded trial that stopped the arm, and it is the reason abacavir is not a first choice for someone presenting with a high viral load.',
        evidenceSource:
          'Sax PE, Tierney C, Collier AC, et al. J Infect Dis 2011;204:1191-1201 (ACTG A5202, NCT00118898)',
        doi: '10.1093/infdis/jir505',
        measuredMetric:
          'Time to virological failure by baseline viral load stratum: hazard ratio 2.46 (95% CI 1.20 to 5.05) and 2.22 (1.19 to 4.14) above 100,000 copies per millilitre',
        auditFlag: 'caution',
      },
      {
        id: 'abc-a4',
        category: 'conclusion_shift',
        title:
          'Myocardial infarction: 1.90 in cohorts, no difference in randomised trials, and still unresolved after eighteen years',
        laymanSummary:
          'A large observational study in 2008 found heart attacks nearly twice as common in people currently taking abacavir. The FDA then pooled 26 randomised trials and found no difference at all. The observational study kept following people and the association did not go away. Both bodies of evidence are still standing.',
        technicalDetails:
          'D:A:D reported in 2008 that among 33,347 patients over 157,912 person-years with 517 myocardial infarctions, recent but not cumulative abacavir use carried a relative rate of 1.90 (95% CI 1.47 to 2.45, p=0.0001), unchanged at 1.89 after adjusting for predicted ten-year coronary risk, with no excess beyond six months after stopping. The FDA then conducted a trial-level meta-analysis of 26 randomised controlled trials in which abacavir was randomised as part of a combination regimen, covering 9,868 subjects, 5,028 on abacavir and 4,840 not, with mean follow-up of about 1.4 person-years per group. Forty-six myocardial infarctions were reported, 24 (0.48%) against 22 (0.46%), risk difference 0.008% (95% CI -0.26% to 0.27%). D:A:D returned in 2016 with 49,717 participants, 941 events over 367,559 person-years, and current abacavir use associated with a 98% increase (relative rate 1.98, 95% CI 1.72 to 2.29), with no difference between the periods before and after the 2008 publication (interaction p=0.74) despite documented changes in prescribing away from higher-risk patients. That last point is the argument against channelling bias: prescribers changed behaviour and the association did not move. The argument on the other side is that 46 events across 26 randomised trials is too few to detect a doubling, and that the cohorts cannot exclude confounding they did not measure. Neither side has been refuted.',
        evidenceSource:
          'D:A:D Study Group, Lancet 2008;371:1417-1426; Ding X et al., J Acquir Immune Defic Syndr 2012;61:441-447; Sabin CA et al., BMC Med 2016;14:61',
        doi: '10.1016/S0140-6736(08)60423-7',
        inferredClaim:
          'That abacavir causes myocardial infarction, or alternatively that the randomised null result refutes the cohort finding — the trials are underpowered for the effect size in question and the cohorts cannot exclude unmeasured confounding',
        auditFlag: 'contested',
      },
      {
        id: 'abc-a5',
        category: 'inferred',
        title:
          'The screening test was validated where the allele is common, and read across elsewhere',
        laymanSummary:
          'PREDICT-1 was 84% white, and the allele it screens for is much less frequent in African and Asian populations. The test still works, because it detects the gene rather than the ancestry, but the trial that measured how much benefit it delivers was run in the population where the gene is most common.',
        technicalDetails:
          'Of the patients in PREDICT-1 who received abacavir, 84% were white, and the overall HLA-B*5701 prevalence in the trial was 5.6%. The paper states its own conclusion in population-restricted terms: in predominantly white populations similar to the one in this study, 94% of patients do not carry the allele. HLA-B*5701 frequency is substantially lower in most sub-Saharan African and East Asian populations, so the absolute number of reactions a screening programme prevents per thousand people tested is correspondingly lower, and the trial does not measure it in those populations. The negative predictive value of 100% is a property of the test and the reaction, not of the sampled group, so this is not an argument against screening; it is a note that the size of the benefit was established in one population and applied in all of them. The positive predictive value of 47.9% carries a second consequence: roughly half of carriers denied abacavir would never have reacted, and screening accepts that cost by design.',
        evidenceSource:
          'Mallal S et al., N Engl J Med 2008;358:568-579; Illing PT et al., Nature 2012;486:554-558',
        doi: '10.1056/NEJMoa0706135',
        inferredClaim:
          'That the absolute benefit of HLA-B*5701 screening measured in a predominantly white cohort describes its benefit in populations where the allele is much rarer',
        auditFlag: 'caution',
      },
      {
        id: 'abc-a6',
        category: 'measured',
        title: 'It does nothing to hepatitis B, and that is a decision rather than a detail',
        laymanSummary:
          'Both drugs abacavir competes with also treat hepatitis B. Abacavir does not. For a person carrying both viruses, choosing abacavir means the hepatitis B is left untreated, and stopping a hepatitis B drug in that situation causes a severe liver flare.',
        technicalDetails:
          'Carbovir triphosphate is a deoxyguanosine analogue active against HIV-1 reverse transcriptase and has no useful activity against the hepatitis B polymerase. Tenofovir disoproxil, tenofovir alafenamide, lamivudine and emtricitabine all do have hepatitis B activity, and all four carry a boxed warning about severe acute exacerbation of hepatitis B on discontinuation. Abacavir carries no such warning because it was never suppressing the virus. Global hepatitis B and HIV co-infection prevalence is substantial in the regions where the fixed-dose combination containing abacavir is most used, which makes this a routine rather than an exotic consideration. It is listed as a measured audit rather than an inferred one because the absence of activity is a laboratory fact, not an extrapolation.',
        evidenceSource:
          'ZIAGEN (abacavir sulfate) prescribing information, NDA 020978, Drugs@FDA; EPIVIR-HBV and VIREAD prescribing information, boxed warnings',
        doi: '10.1093/infdis/jir505',
        measuredMetric:
          'Absence of hepatitis B polymerase activity, and absence of the hepatitis B discontinuation boxed warning that every competing nucleoside carries',
        auditFlag: 'verified',
      },
      {
        id: 'abc-a7',
        category: 'inferred',
        title: 'A negative genetic test is not a licence to rechallenge after a reaction',
        laymanSummary:
          'The screening test has a perfect record at ruling out the confirmed reaction, and that fact gets read as though a negative test made abacavir safe. It does not make rechallenge safe after a suspected reaction, because rechallenge has killed people and because more than half of clinically suspected reactions in the trial were something else.',
        technicalDetails:
          'PREDICT-1 measured a negative predictive value of 100% against immunologically confirmed hypersensitivity in 1,956 patients over six weeks. That is a statement about the confirmed endpoint in that sample, not a guarantee of zero risk, and the trial also found that clinical diagnosis over-called the reaction by more than two to one: 7.8% clinically diagnosed against 2.7% confirmed in the control group. The labelling prohibits rechallenge after a suspected hypersensitivity reaction regardless of HLA status, because rechallenge has produced hypotension and death within hours. The inference being flagged is the everyday one: that a negative genotype means the reaction cannot be happening, and therefore that a patient with early symptoms can safely continue. Both halves of that are wrong, and the second half is the dangerous one.',
        evidenceSource:
          'Mallal S et al., N Engl J Med 2008;358:568-579; ZIAGEN prescribing information, boxed warning, NDA 020978, Drugs@FDA',
        doi: '10.1056/NEJMoa0706135',
        inferredClaim:
          'That a negative HLA-B*5701 result excludes hypersensitivity in an individual patient and makes continuation or rechallenge safe after symptoms appear',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A genetic test comes before the first tablet',
        laymanDesc:
          'Before anyone takes abacavir, a blood test checks for one specific immune gene variant. Carriers are not given the drug at all. That test is part of the treatment, not an optional extra.',
        molecularDetail:
          'HLA-B*5701 genotyping is required before initiation and is written into the labelling. Allele prevalence was 5.6% in the 1,956-patient PREDICT-1 population. The test has a negative predictive value of 100% against immunologically confirmed hypersensitivity and a positive predictive value of 47.9%, so roughly half of carriers excluded would not have reacted, which is a cost the strategy accepts deliberately.',
        iconName: 'ClipboardCheck',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Swallowed with or without food, and it does not touch the kidney',
        laymanDesc:
          'A tablet once or twice a day. Unlike its main competitor it is not filtered and concentrated by the kidney tubule, so it has no renal or bone effect and needs no dose change in kidney disease.',
        molecularDetail:
          'Oral bioavailability is around 83% and is unaffected by food. Elimination is by alcohol dehydrogenase and glucuronosyltransferase to inactive metabolites, with only about 2% excreted unchanged in urine, so no renal dose adjustment is required. It is not a cytochrome P450 substrate of consequence, so its interaction profile is short.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Inside the cell it is rebuilt into a counterfeit DNA letter',
        laymanDesc:
          'What is swallowed is not what works. Cellular enzymes convert it through several steps into a different molecule that looks like the DNA letter G, carrying the three phosphates a real building block would have.',
        molecularDetail:
          'Abacavir is phosphorylated by adenosine phosphotransferase to abacavir monophosphate, deaminated by a cytosolic deaminase to carbovir monophosphate, and then phosphorylated twice more to carbovir triphosphate, the active species. This activation route is independent of the kinases the other nucleoside analogues rely on, which is why abacavir retains activity in cells where thymidine analogue activation is limiting.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The copying enzyme inserts it and the chain ends there',
        laymanDesc:
          'Reverse transcriptase takes it for the real thing and stitches it in. The carbocyclic ring it is built on has no attachment point for the next letter, so the copy stops at that point.',
        molecularDetail:
          'Carbovir triphosphate competes with dGTP at the reverse transcriptase active site and is incorporated, after which the absence of a 3-prime hydroxyl on the cyclopentene ring enforces chain termination. The principal resistance substitutions are L74V, Y115F, K65R and M184V, and several of them impose replicative fitness costs, so accumulating clinically significant abacavir resistance generally requires more than one.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And in one person in twenty, a completely separate thing happens',
        laymanDesc:
          'None of the above has anything to do with the reaction. Intact abacavir slots into a groove on an immune-presenting molecule in carriers of one gene variant, changing which of the body own proteins get displayed there. The immune system sees a self it does not recognise and attacks.',
        molecularDetail:
          'Unmodified abacavir binds non-covalently in the F pocket of the HLA-B*57:01 antigen-binding cleft, where a C-terminal tryptophan normally anchors the peptide, altering cleft shape and chemistry and therefore the repertoire of endogenous peptides selected for presentation. The resulting altered self drives polyclonal CD8 T-cell activation and a systemic reaction. The relative risk in carriers exceeds 1,000. Rechallenge after a reaction can cause hypotension and death within hours and is prohibited regardless of genotype.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'PREDICT-1 (NCT00340080)',
        phase:
          'Prospective, randomised, double-blind screening-strategy trial, six-week observation',
        sampleSize: 1956,
        primaryEndpoint:
          'Immunologically confirmed hypersensitivity reaction to abacavir, prospective HLA-B*5701 screening against standard of care',
        endpointMet: true,
        statisticalPValue:
          '0% versus 2.7% (p<0.001); negative predictive value 100%, positive predictive value 47.9%',
        unreportedAdverseSignals:
          'Clinically diagnosed hypersensitivity was 3.4% against 7.8%, so clinical diagnosis over-called the confirmed reaction by more than two to one in both arms.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ACTG A5202 (NCT00118898)',
        phase:
          'Phase 3, randomised, partially blinded, four-arm, stratified by baseline viral load',
        sampleSize: 1858,
        primaryEndpoint:
          'Time to virological failure, abacavir-lamivudine against tenofovir disoproxil-emtricitabine, each with efavirenz or atazanavir-ritonavir',
        endpointMet: false,
        statisticalPValue:
          'High stratum: hazard ratio 2.46 (95% CI 1.20 to 5.05) with efavirenz and 2.22 (1.19 to 4.14) with atazanavir-ritonavir, against abacavir. Low stratum: 1.23 (0.77 to 1.96) and 1.25 (0.76 to 2.05), no difference',
        unreportedAdverseSignals:
          'Blinded treatment in the high-viral-load stratum was stopped by the data and safety monitoring board. Time to regimen modification was also significantly shorter on abacavir in the low stratum with either third agent.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'D:A:D nucleoside analysis, 2008 and 2016',
        phase: 'Prospective observational multicohort study, Poisson regression',
        sampleSize: 49717,
        primaryEndpoint:
          'Rate of myocardial infarction by recent and cumulative exposure to each nucleoside analogue',
        endpointMet: false,
        statisticalPValue:
          'Recent abacavir use, relative rate 1.90 (95% CI 1.47 to 2.45) in 2008 and 1.98 (1.72 to 2.29) in 2016; no association for zidovudine, stavudine or lamivudine',
        unreportedAdverseSignals:
          'This row records a harm signal, not a failed efficacy endpoint. Prescribing shifted away from higher cardiovascular-risk patients after 2008 and the association did not change (interaction p=0.74), which weakens but does not eliminate channelling bias as an explanation.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'FDA trial-level meta-analysis of 26 randomised trials',
        phase:
          'Trial-level meta-analysis of randomised controlled trials, Mantel-Haenszel risk difference',
        sampleSize: 9868,
        primaryEndpoint:
          'Risk difference for myocardial infarction between randomised abacavir-containing and abacavir-free regimens',
        endpointMet: false,
        statisticalPValue:
          '24 of 5,028 (0.48%) against 22 of 4,840 (0.46%), risk difference 0.008% (95% CI -0.26% to 0.27%)',
        unreportedAdverseSignals:
          'Forty-six events in total across 26 trials, with mean follow-up of about 1.4 person-years per group. A null result at this event count does not exclude the doubling reported in the cohorts, and the analysis excluded trials conducted in Africa.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Immunologically confirmed hypersensitivity of 0% against 2.7% with prospective HLA-B*5701 screening in 1,956 randomised patients, negative predictive value 100%',
        'Unmodified abacavir occupies the F pocket of HLA-B*57:01 and alters the repertoire of self-peptides presented, with a relative risk of reaction in carriers exceeding 1,000',
        'Time to virological failure significantly shorter than tenofovir-emtricitabine above 100,000 copies per millilitre at baseline (hazard ratios 2.46 and 2.22), and indistinguishable below it',
        'Myocardial infarction relative rate 1.90 and then 1.98 for recent use across two D:A:D analyses, against a risk difference of 0.008% in 26 pooled randomised trials',
      ],
      unsupportedInferences: [
        'That the randomised null result on myocardial infarction refutes the cohort association, when 46 events across 26 trials cannot detect a doubling',
        'That the cohort association establishes causation, when no mechanism has been identified and unmeasured confounding cannot be excluded',
        'That the absolute benefit of HLA-B*5701 screening measured in a predominantly white cohort describes its benefit where the allele is much rarer',
        'That a negative HLA-B*5701 result makes continuation or rechallenge safe once symptoms have appeared',
      ],
      whatFailedInitially: [
        'Blinded treatment in the high-viral-load stratum of ACTG A5202 was stopped for excess virological failure on abacavir',
        'The hypersensitivity reaction reached the market in 1998 as an unexplained idiosyncratic toxicity, was linked to an allele in 2002, prevented by screening from 2008, and only mechanistically explained in 2012',
      ],
      realWorldOutcome: [
        'The first drug for which a prospective randomised trial showed that a pharmacogenetic test could abolish a specific toxic effect, and the template for HLA-linked hypersensitivity generally',
        'Generic at US$0.5380 per tablet across 12 listed products, plus a genotype test that the tablet price does not include',
        'Positioned as an alternative rather than a preferred backbone, on the viral load restriction and the unresolved cardiovascular question rather than on tolerability',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral solution, single agent and in fixed-dose combinations',
      description:
        'Taken with or without food. No renal dose adjustment is needed, because elimination is by alcohol dehydrogenase and glucuronidation rather than by the kidney. It must not be started without a documented HLA-B*5701 result.',
      safetyProfile:
        'Serious and sometimes fatal hypersensitivity reactions are the boxed warning, strongly associated with HLA-B*5701 and characterised by fever, rash, gastrointestinal and respiratory symptoms. Rechallenge after a suspected reaction can cause hypotension and death within hours and is prohibited regardless of genotype. Lactic acidosis and severe hepatomegaly with steatosis are labelled class effects of nucleoside analogues. Immune reconstitution inflammatory syndrome can follow suppression. The myocardial infarction association reported in the D:A:D cohorts and not reproduced in pooled randomised trials is discussed in the audits and remains unresolved. Abacavir has no activity against hepatitis B.',
    },
    commonQuestions: [
      {
        q: 'Why do I need a genetic test before taking this drug?',
        a: 'Because one immune gene variant turns abacavir from a well-tolerated tablet into a systemic reaction that can be fatal on rechallenge, and the test finds the variant before the first dose rather than after. PREDICT-1 randomised 1,956 patients either to be screened, with carriers excluded, or to start abacavir the usual way. Immunologically confirmed hypersensitivity was zero in the screened group and 2.7% in the control group, with a negative predictive value of 100%. The mechanism was worked out later: abacavir slots into the F pocket of the HLA-B*57:01 antigen-binding groove and changes which of your own protein fragments that molecule displays, so your immune system sees an altered version of self and attacks it.',
        auditNote:
          'This is the clearest demonstration in medicine that a pharmacogenetic test can prevent a specific drug toxicity, and it took a randomised trial to establish it.',
      },
      {
        q: 'Does abacavir cause heart attacks?',
        a: 'This has been argued for eighteen years without resolution, and both bodies of evidence are still standing. The D:A:D cohort reported in 2008 that recent abacavir use carried a relative rate of myocardial infarction of 1.90 (95% CI 1.47 to 2.45), with no excess more than six months after stopping and no association for zidovudine, stavudine or lamivudine. The FDA then pooled 26 randomised trials covering 9,868 people and found 24 events on abacavir against 22 without, a risk difference of 0.008%. D:A:D reported again in 2016 with 941 events and a relative rate of 1.98, and showed that prescribing had shifted away from higher-risk patients without the association changing, which is the strongest argument against the obvious explanation that sicker patients were being given the drug. The strongest argument on the other side is that 46 events cannot detect a doubling.',
        auditNote:
          'A null randomised result and a positive cohort result are not necessarily in conflict when the randomised result has 46 events.',
      },
      {
        q: 'Is it as good as tenofovir?',
        a: 'It depends on where you start. ACTG A5202 randomised treatment-naive patients to abacavir-lamivudine or tenofovir-emtricitabine, blinded, stratified by whether their viral load was above or below 100,000 copies per millilitre. Below the threshold the two were indistinguishable on time to virological failure. Above it, abacavir failed significantly faster with either third agent, hazard ratios of 2.46 and 2.22, and the data and safety monitoring board stopped blinded treatment in that stratum. Abacavir also has no activity against hepatitis B, which both tenofovir prodrugs and lamivudine do, and that is a separate consideration for anyone carrying both viruses.',
      },
      {
        q: 'My test was negative but I feel unwell after starting it. Can I keep taking it?',
        a: 'That is a question for the clinician who prescribed it, and the general point worth knowing is that a negative test is not a guarantee of zero risk. The 100% negative predictive value in PREDICT-1 is a measurement of the confirmed endpoint in 1,956 people over six weeks. The labelling prohibits rechallenge after any suspected hypersensitivity reaction regardless of genotype, because rechallenge has caused hypotension and death within hours. It is also worth knowing that clinical diagnosis over-called this reaction by more than two to one in the trial, 7.8% clinically diagnosed against 2.7% confirmed, so many symptoms in the first weeks are something else.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for abacavir could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file. That figure also omits something real: the HLA-B*5701 genotype required before the first dose is a laboratory test, not a drug, and is not in the drug pricing dataset.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Mallal S, Phillips E, Carosi G, et al. HLA-B*5701 screening for hypersensitivity to abacavir. N Engl J Med 2008;358:568-579',
        identifier: '10.1056/NEJMoa0706135',
        kind: 'doi',
      },
      {
        label:
          'Illing PT, Vivian JP, Dudek NL, et al. Immune self-reactivity triggered by drug-modified HLA-peptide repertoire. Nature 2012;486:554-558',
        identifier: '10.1038/nature11147',
        kind: 'doi',
      },
      {
        label:
          'Ostrov DA, Grant BJ, Pompeu YA, et al. Drug hypersensitivity caused by alteration of the MHC-presented self-peptide repertoire. Proc Natl Acad Sci USA 2012;109:9959-9964',
        identifier: '10.1073/pnas.1207934109',
        kind: 'doi',
      },
      {
        label:
          'Sax PE, Tierney C, Collier AC, et al. Abacavir/lamivudine versus tenofovir DF/emtricitabine as part of combination regimens for initial treatment of HIV: final results. J Infect Dis 2011;204:1191-1201',
        identifier: '10.1093/infdis/jir505',
        kind: 'doi',
      },
      {
        label:
          'D:A:D Study Group. Use of nucleoside reverse transcriptase inhibitors and risk of myocardial infarction in HIV-infected patients enrolled in the D:A:D study: a multi-cohort collaboration. Lancet 2008;371:1417-1426',
        identifier: '10.1016/S0140-6736(08)60423-7',
        kind: 'doi',
      },
      {
        label:
          'Ding X, Andraca-Carrera E, Cooper C, et al. No association of abacavir use with myocardial infarction: findings of an FDA meta-analysis. J Acquir Immune Defic Syndr 2012;61:441-447',
        identifier: '10.1097/QAI.0b013e31826f993c',
        kind: 'doi',
      },
      {
        label:
          'Sabin CA, Reiss P, Ryom L, et al. Is there continued evidence for an association between abacavir usage and myocardial infarction risk in individuals with HIV? A cohort collaboration. BMC Med 2016;14:61',
        identifier: '10.1186/s12916-016-0588-4',
        kind: 'doi',
      },
      {
        label: 'PREDICT-1: clinical utility of genetic screening for HLA-B*5701 before abacavir',
        identifier: 'NCT00340080',
        kind: 'nct',
      },
      {
        label:
          'ACTG A5202: abacavir-lamivudine or tenofovir-emtricitabine with efavirenz or atazanavir-ritonavir',
        identifier: 'NCT00118898',
        kind: 'nct',
      },
      {
        label:
          'ZIAGEN (abacavir sulfate) — Drugs@FDA application NDA 020978, ViiV Healthcare, original approval 17 December 1998',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020978',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 441300 — abacavir structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/441300',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Lamivudine — defeated by a single mutation, and kept in regimens because of it. The drug
  //     whose resistance is an asset in one virus and a slow catastrophe in the other.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lamivudine',
    name: 'Lamivudine',
    tradeName:
      'Epivir for HIV-1 and Epivir-HBV for hepatitis B, at different strengths; also in Combivir, Epzicom, Triumeq and Dovato',
    sponsor: 'ViiV Healthcare (originated at BioChem Pharma and Glaxo Wellcome)',
    targetGene:
      'HIV-1 pol, reverse transcriptase coding region; hepatitis B virus P gene, reverse transcriptase domain',
    targetProtein:
      'HIV-1 reverse transcriptase and hepatitis B virus polymerase, chain-terminated by lamivudine triphosphate competing with dCTP',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults and paediatric patients aged at least 3 months; and, as a separate lower-strength product, for chronic hepatitis B virus infection with evidence of active viral replication',
    patientFriendlyIndication: 'HIV-1 infection and chronic hepatitis B',
    anatomicalSite:
      'Cytoplasm of CD4-positive T cells and of hepatocytes, where the drug is phosphorylated to its active triphosphate',
    conditionContext: {
      conditionExplainer:
        'Lamivudine is a cytidine analogue with an unusual feature: it is the mirror-image enantiomer of the natural configuration. Human polymerases largely ignore it while viral reverse transcriptases accept it, which is why a drug that terminates DNA chains is one of the best tolerated medicines in the pharmacopoeia.',
      whyItMatters:
        'This is the drug that is in almost every HIV regimen, everywhere, and has been for thirty years. It costs about half a United States dollar a tablet, has almost no side effects, and is defeated by a single amino-acid substitution. Understanding why it stays in regimens after that substitution has appeared is the most interesting thing on this page.',
      whoTakesThis:
        'Almost everyone treated for HIV-1, usually inside a fixed-dose combination; and, decreasingly, people with chronic hepatitis B, for whom it has been superseded by tenofovir and entecavir on resistance grounds.',
      clinicalGoals:
        'In HIV, plasma RNA below 50 copies per millilitre and kept there. In hepatitis B, HBV DNA suppression without accumulating the resistance that turns a treated infection into a worse one.',
    },
    oneSentenceVerdict:
      'A mirror-image cytidine analogue that terminates the DNA chain of both HIV-1 and hepatitis B; added to zidovudine in 1,840 patients it cut progression to AIDS or death from 20% to 9% (relative hazard 0.42) and improved survival (relative hazard 0.40), and it is defeated by the single substitution M184V, which is also why it is deliberately kept in failing regimens and why it lost its place in hepatitis B, where resistance reached 65% by year five.',
    laymanHowItWorks:
      'Lamivudine is a counterfeit version of one of the four chemical letters DNA is built from, and it is built back to front compared with the real thing. Human copying enzymes are fussy and mostly reject it. The copying enzymes of HIV and hepatitis B are not, and they stitch it in, at which point the chain cannot be extended and the copy stops. That mismatch in fussiness is why the drug is so well tolerated, and the same loose active site is why one small change to the enzyme is enough to make it reject the drug too.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4887 per tablet at United States pharmacy acquisition cost, median across 18 listed generic products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'The cheapest drug on this page, generic across 18 listed products. It is also sold as a separate, lower-strength hepatitis B product under a different brand name, and the price difference between the two strengths is not a pharmacological fact but a market one. Lamivudine has been off patent for long enough that it is a component of nearly every generic fixed-dose antiretroviral combination manufactured for low-income and middle-income countries.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Lamivudine and emtricitabine are close enough to be interchangeable in practice and are never used together. The other comparison worth making is with the hepatitis B drugs that displaced it.',
      conventionalRx: [
        {
          name: 'Emtricitabine (Emtriva, and in most Gilead combinations)',
          class: 'Nucleoside reverse transcriptase inhibitor, cytidine analogue',
          howItCompares:
            'The same mechanism, the same single-mutation resistance pathway through M184V, and a longer intracellular half-life. The two are not used together because they compete for the same activation and the same target, and guidelines treat them as interchangeable within a regimen.',
          typicalCost:
            'Not quoted here; the CMS NADAC line for single-agent emtricitabine was not read at the time of writing',
          prosAndCons:
            'Pros: longer intracellular half-life, present in most of the fixed-dose combinations built around tenofovir alafenamide. Cons: no meaningful advantage over lamivudine, and generally more expensive.',
        },
        {
          name: 'Tenofovir disoproxil fumarate (generic), for hepatitis B',
          class: 'Nucleotide reverse transcriptase inhibitor',
          howItCompares:
            'The drug that displaced lamivudine in hepatitis B. No tenofovir resistance mutation developed in any patient in the 48-week registration trials, against lamivudine resistance reaching 65% by year five, and tenofovir is the only hepatitis B drug with paired-biopsy evidence of cirrhosis regression.',
          typicalCost:
            'US$0.5051 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: essentially no resistance in treatment-naive patients, documented fibrosis regression. Cons: renal and bone effects that lamivudine does not have.',
        },
        {
          name: 'Entecavir (generic), for hepatitis B',
          class: 'Nucleoside analogue, guanosine',
          howItCompares:
            'The other first-line hepatitis B nucleoside, with a high resistance barrier in treatment-naive patients and a much lower one in patients who already carry lamivudine resistance, because the lamivudine mutations are the first two steps on its own resistance pathway.',
          typicalCost:
            'Not quoted here; the CMS NADAC line for entecavir was not read at the time of writing',
          prosAndCons:
            'Pros: no renal or bone signal, high barrier in naive patients. Cons: substantially compromised by prior lamivudine exposure, which is a large fraction of the treated population.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@H](O[C@H](S1)CO)N2C=CC(=NC2=O)N',
      chemicalFormula: 'C8H11N3O3S',
      molecularWeight: '229.26 g/mol',
      targetReceptorAffinity:
        'The active species is lamivudine 5-prime-triphosphate, which competes with deoxycytidine triphosphate at the reverse transcriptase active site and terminates the chain because the oxathiolane ring carries no 3-prime hydroxyl. The structural point that explains both the tolerability and the resistance is stereochemistry: lamivudine is the (-)-beta-L enantiomer, the unnatural configuration, and the sulfur atom replaces the 3-prime carbon of the sugar. Human DNA polymerase alpha and beta discriminate strongly against the L-configuration; HIV-1 reverse transcriptase does not, because its active site is more permissive. The single substitution M184V introduces a beta-branched side chain that sterically clashes with the oxathiolane sulfur, conferring more than hundred-fold resistance, and it simultaneously reduces the processivity and replicative fitness of the enzyme.',
      structureSource: {
        label: 'PubChem CID 60825 (lamivudine) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60825',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ltc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric and anomeric control of the oxathiolane nucleoside',
          description:
            'Confirm both the L-configuration and the cis anomeric relationship. Lamivudine is the (2R,5S) cis (-)-enantiomer, and the (+)-enantiomer, once developed separately as a drug in its own right, is a different compound with different toxicity. This is the specification the whole route is built to meet.',
          reagentsAndBuffer:
            'Lamivudine reference standard, chiral HPLC on a cellulose-derived stationary phase, optical rotation, proton NMR for anomeric configuration, Karl Fischer titration, gas chromatography for residual solvents',
        },
        {
          id: 'ltc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Oxathiolane ring construction and stereoselective cytosine glycosylation',
          description:
            'Build the 1,3-oxathiolane ring bearing a protected hydroxymethyl group, then couple silylated cytosine to it under Lewis acid catalysis with control of the anomeric centre, and deprotect. Getting cis selectivity at glycosylation is the difficult step, and the classical route relies on enzymatic or chemical resolution afterwards rather than perfect selectivity during.',
          dependsOnStepId: 'ltc-w1',
          reagentsAndBuffer:
            'Benzoyloxyacetaldehyde and 1,4-dithiane-2,5-diol for the oxathiolane, silylated cytosine with N,O-bis(trimethylsilyl)acetamide, trimethylsilyl triflate or tin tetrachloride as Lewis acid, methanolic ammonia for debenzoylation, cytidine deaminase or a lipase for enzymatic resolution',
        },
        {
          id: 'ltc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Recrystallisation and formulation split between the two marketed strengths',
          description:
            'Recrystallise, confirm polymorph, and route the material to the correct product. This is the step where the drug divides into two: the HIV strength and the lower hepatitis B strength are the same molecule and are not interchangeable, and giving the hepatitis B strength to someone with undiagnosed HIV is a documented route to selecting resistance.',
          dependsOnStepId: 'ltc-w2',
          reagentsAndBuffer:
            'Ethanol-water recrystallisation, X-ray powder diffraction for polymorph identity, USP dissolution apparatus, reversed-phase HPLC with UV detection for related substances and for the (+)-enantiomer as a specified impurity',
        },
        {
          id: 'ltc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Parallel HIV-1 and HBV cell systems with a matched M184V arm',
          description:
            'Infect peripheral blood mononuclear cells with wild-type HIV-1 and with an M184V mutant, and in parallel treat an HBV-replicating hepatoma line and its rtM204V counterpart. One molecule, two viruses, two homologous resistance substitutions at the same structural position, and the clinical consequences of the two are opposite.',
          dependsOnStepId: 'ltc-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, HIV-1 NL4-3 wild-type and M184V site-directed mutant, HepG2.2.15 cells and an rtM204V-transfected counterpart, human hepatocyte medium',
        },
        {
          id: 'ltc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fold-change potency and replicative fitness of the resistant virus',
          description:
            'Report EC50 fold change for each mutant, and then measure replication capacity in a growth-competition assay against wild-type. The second measurement is the one that matters clinically for this drug: M184V confers resistance and costs fitness, and the size of that fitness cost is the entire justification for keeping lamivudine in a failing regimen.',
          dependsOnStepId: 'ltc-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 reverse transcriptase wild-type and M184V, single-cycle phenotypic susceptibility assay, dual-labelled growth-competition cultures for replication capacity, quantitative HBV DNA PCR for the hepatitis arm',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ltc-a1',
        category: 'measured',
        title: 'CAESAR: progression halved and survival improved, on clinical endpoints',
        laymanSummary:
          'Adding lamivudine to existing zidovudine treatment in 1,840 patients cut progression to AIDS or death from 20% to 9% and improved survival. The trial was stopped early at its second interim analysis because the difference was so clear.',
        technicalDetails:
          'CAESAR randomised 1,840 patients with HIV-1 and CD4 counts of 25 to 250 per microlitre, already on zidovudine alone or with zalcitabine or didanosine, to add placebo, lamivudine, or lamivudine plus loviride for 52 weeks, with progression to a new protocol-defined AIDS event or death as the primary endpoint. The study was terminated at the second interim analysis for a highly significant reduction in progression. In the final analysis, progression occurred in 95 of 471 (20%) placebo patients, 86 of 907 (9%) lamivudine patients and 42 of 462 (9%) lamivudine-plus-loviride patients, p<0.0001, relative hazard 0.42 (95% CI 0.32 to 0.57). A significant survival benefit was seen separately, relative hazard 0.40 (95% CI 0.23 to 0.69), p=0.0007. Hospital admissions, unscheduled visits and prescriptions for HIV-related events were all significantly reduced, and there was no difference in the frequency or severity of clinical or laboratory toxicity between groups. This is a clinical-endpoint trial in an era when most antiretroviral trials were not, and it is the strongest single result on this page.',
        evidenceSource:
          'CAESAR Coordinating Committee. Randomised trial of addition of lamivudine or lamivudine plus loviride to zidovudine-containing regimens for patients with HIV-1 infection: the CAESAR trial. Lancet 1997;349:1413-1421',
        measuredMetric:
          'Progression to a new AIDS-defining event or death: 20% against 9%, relative hazard 0.42 (95% CI 0.32 to 0.57); survival relative hazard 0.40 (95% CI 0.23 to 0.69)',
        auditFlag: 'verified',
      },
      {
        id: 'ltc-a2',
        category: 'failed',
        title: 'One amino acid ends it, and in hepatitis B that reached 65% by year five',
        laymanSummary:
          'A single change at one position defeats lamivudine in both viruses it treats. In hepatitis B, where lamivudine was used alone, the proportion of patients carrying that change rose from 23% in the first year to 65% by the fifth, and the patients who carried it had more liver flares and worse outcomes.',
        technicalDetails:
          'A long-term safety analysis of 998 patients with HBeAg-positive compensated chronic hepatitis B treated with lamivudine for up to six years, median four, found the proportion with a documented lamivudine-resistant mutation rising from 23% in year 1 to 65% in year 5. Hepatitis flares occurred in 10% of patients in year 1 and 18% to 21% in years 2 to 5, and the temporal association between flares and resistance mutations rose from 43% in year 1 to more than 80% by year 3. Patients with resistant mutations had significantly more flares than those without, p<0.005, in every year. Hepatic decompensation and liver-disease-related serious adverse events stayed stable through the first four years with mutations and then rose to 6% (p=0.03) and 20% (p=0.009). The equivalent HIV substitution, M184V, arises just as readily but is not permitted to matter in the same way, because lamivudine is never used alone in HIV. Lamivudine is no longer a first-line hepatitis B treatment anywhere.',
        evidenceSource:
          'Lok AS, Lai CL, Leung N, et al. Long-term safety of lamivudine treatment in patients with chronic hepatitis B. Gastroenterology 2003;125:1714-1722',
        doi: '10.1053/j.gastro.2003.09.033',
        measuredMetric:
          'Documented lamivudine-resistant mutation in 23% of patients at year 1 rising to 65% at year 5, with hepatitis flares in 18% to 21% of patients per year from year 2',
        auditFlag: 'verified',
      },
      {
        id: 'ltc-a3',
        category: 'conclusion_shift',
        title: 'The mutation that defeats it is a reason to keep taking it',
        laymanSummary:
          'Normally a resistance mutation is a reason to stop a drug. For lamivudine the field concluded the opposite. M184V cripples the virus that carries it, so keeping the drug on keeps the crippled virus in place, and a randomised pilot showed that patients doing this fared better than patients stopping everything.',
        technicalDetails:
          'The E-184V study randomised 58 HIV-1 patients already carrying M184V on a lamivudine-containing regimen either to lamivudine monotherapy or to complete interruption of all antiretroviral drugs, open-label, over 48 weeks, with immunological failure defined as a CD4 count below 350 cells per microlitre or a CDC grade B or C event. By week 48, 20 of 29 (69%, 95% CI 51 to 83) in the interruption group and 12 of 29 (41%, 95% CI 26 to 59) in the lamivudine group had discontinued for immunological or clinical failure, and time to failure was significantly longer on lamivudine (p=0.018). Grade 3 to 4 clinical adverse events at least possibly related to HIV-1 occurred only in the interruption group, 6 of 29 (20.7%), p=0.02. Mean decline in CD4 percentage, viral rebound and recovery of HIV-1 replication capacity were all significantly lower on lamivudine. The mechanism is that M184V introduces a steric clash that both blocks the drug and reduces enzyme processivity, so maintaining drug pressure maintains the fitness cost. M184V also partially resensitises virus to zidovudine and tenofovir. Two cautions belong with this: the trial randomised 29 patients per arm, and its comparator was stopping everything rather than switching to an active regimen, which is not the choice most patients face.',
        evidenceSource:
          'Castagna A, Danise A, Menzo S, et al. Lamivudine monotherapy in HIV-1-infected patients harbouring a lamivudine-resistant virus: a randomized pilot study (E-184V study). AIDS 2006;20:795-803',
        doi: '10.1097/01.aids.0000218542.08845.b2',
        inferredClaim:
          'That the fitness cost of M184V justifies retaining lamivudine in failing regimens generally — supported by mechanism and by a 58-patient pilot whose comparator was complete treatment interruption, and adopted into routine practice far beyond what that trial tested',
        auditFlag: 'contested',
      },
      {
        id: 'ltc-a4',
        category: 'measured',
        title: 'GEMINI: two drugs matched three in 1,433 patients starting treatment',
        laymanSummary:
          'Two identical trials randomised 1,441 people starting HIV treatment to either dolutegravir plus lamivudine, or dolutegravir plus two other drugs. At 48 weeks 91% against 93% were suppressed, meeting non-inferiority, and the two-drug arm had fewer drug-related side effects.',
        technicalDetails:
          'GEMINI-1 (NCT02831673) and GEMINI-2 (NCT02831764) were identically designed, double-blind, randomised non-inferiority phase 3 trials at 192 centres in 21 countries, enrolling treatment-naive adults with screening HIV-1 RNA at or below 500,000 copies per millilitre. 1,441 participants were randomised, 719 to dolutegravir with lamivudine and 722 to dolutegravir with tenofovir disoproxil and emtricitabine. At week 48 by snapshot in the intention-to-treat-exposed population, GEMINI-1 gave 320 of 356 (90%) against 332 of 358 (93%), adjusted difference -2.6% (95% CI -6.7 to 1.5), and GEMINI-2 gave 335 of 360 (93%) against 337 of 359 (94%), adjusted difference -0.7% (95% CI -4.3 to 2.9). Pooled, 655 of 716 (91%) against 669 of 717 (93%), adjusted difference -1.7% (95% CI -4.4 to 1.1), non-inferior at a -10% margin. Drug-related adverse events were numerically fewer on two drugs, 126 of 716 (18%) against 169 of 717 (24%), with discontinuation for adverse events at 2% in each arm.',
        evidenceSource:
          'Cahn P, Sierra Madero J, Arribas JR, et al. Lancet 2019;393:143-155 (GEMINI-1 NCT02831673 and GEMINI-2 NCT02831764)',
        doi: '10.1016/S0140-6736(18)32462-0',
        measuredMetric:
          'Proportion below 50 copies per millilitre at week 48, pooled adjusted difference -1.7% (95% CI -4.4 to 1.1)',
        auditFlag: 'verified',
      },
      {
        id: 'ltc-a5',
        category: 'inferred',
        title: 'GEMINI excluded the patients the two-drug question is hardest for',
        laymanSummary:
          'The trials that established the two-drug regimen enrolled only people whose viral load at screening was at or below 500,000 copies per millilitre. That is an entry criterion, not a finding, and it means the regimen has not been randomised against three drugs in the people who present with the most virus.',
        technicalDetails:
          'GEMINI-1 and GEMINI-2 both restricted enrolment to a screening HIV-1 RNA of 500,000 copies per millilitre or less. Two-drug regimens have less redundancy by construction: if one agent is compromised by transmitted resistance, the effective regimen is monotherapy, and lamivudine is the agent in this pair with the lowest genetic barrier. Baseline resistance genotyping is not available at the moment therapy starts in most of the world. A second consequence is unrelated to virology: a person co-infected with hepatitis B who takes dolutegravir with lamivudine is receiving lamivudine monotherapy for their hepatitis B, which is the exposure that produced 65% resistance by year five in the hepatitis literature. Neither point is a criticism of the trial result, which is solid within its enrolment criteria. Both are limits on how far that result travels, and both are read across in practice more freely than the trials support.',
        evidenceSource:
          'Cahn P et al., Lancet 2019;393:143-155; Lok AS et al., Gastroenterology 2003;125:1714-1722',
        doi: '10.1016/S0140-6736(18)32462-0',
        inferredClaim:
          'That non-inferiority demonstrated at or below 500,000 copies per millilitre, in patients without hepatitis B co-infection, extends to patients above that threshold and to patients carrying hepatitis B',
        auditFlag: 'caution',
      },
      {
        id: 'ltc-a6',
        category: 'failed',
        title:
          'Two strengths of the same molecule under two brand names, and a boxed warning about it',
        laymanSummary:
          'Lamivudine is sold at one strength for HIV and a lower strength for hepatitis B, under different brand names. Giving the hepatitis B strength to someone who also has undiagnosed HIV is effectively HIV monotherapy at a subtherapeutic dose, and it selects resistance. The FDA put that on the front of the label.',
        technicalDetails:
          'The Epivir boxed warning has two parts. The first is the class warning about severe acute exacerbation of hepatitis B on discontinuation in co-infected patients, with hepatic monitoring required for at least several months after stopping. The second is specific to this molecule: patients with HIV-1 infection should receive only dosage forms of Epivir appropriate for treatment of HIV-1, because the hepatitis B product contains a lower dose of the same active ingredient. The Warnings section adds that emergence of lamivudine-resistant hepatitis B variants has been reported with lamivudine-containing antiretroviral regimens. The failure recorded here is a design one rather than a pharmacological one: an identical molecule marketed at two strengths under two names, for two infections that frequently occur together, in a population that is not always tested for both. The regulator response was a boxed warning, which is an instruction rather than a fix.',
        evidenceSource:
          'EPIVIR (lamivudine) prescribing information, boxed warning and section 5.1, NDA 020564, Drugs@FDA; EPIVIR-HBV prescribing information',
        doi: '10.1053/j.gastro.2003.09.033',
        measuredMetric:
          'Two marketed strengths of one molecule under separate brand names, with the difference carried in the boxed warning of both',
        auditFlag: 'caution',
      },
      {
        id: 'ltc-a7',
        category: 'measured',
        title: 'The tolerability is a consequence of stereochemistry, not of luck',
        laymanSummary:
          'Lamivudine is built as the mirror image of a natural DNA letter. Human copying enzymes are picky about which mirror image they accept and reject it; viral ones are not. That single design decision is why a chain-terminating drug has almost no side effects, and it is also why one small change to the virus is enough to defeat it.',
        technicalDetails:
          'Lamivudine is the (-)-beta-L-2-prime,3-prime-dideoxy-3-prime-thiacytidine enantiomer, the unnatural configuration, with a sulfur atom replacing the 3-prime carbon of the sugar ring. Human DNA polymerases alpha and beta discriminate strongly against the L-configuration, and mitochondrial DNA polymerase gamma incorporates it poorly, which is why lamivudine lacks the mitochondrial toxicity, lipoatrophy and neuropathy that defined the earlier nucleoside analogues. In CAESAR there was no difference in the frequency or severity of clinical or laboratory toxicities between lamivudine and placebo arms, which for a chain-terminating antiviral is a striking result. The same permissiveness in the viral active site that admits an L-nucleotide is what makes M184V sufficient to exclude it: a single beta-branched side chain restores the discrimination the wild-type enzyme lacks.',
        evidenceSource:
          'CAESAR Coordinating Committee, Lancet 1997;349:1413-1421; EPIVIR prescribing information, NDA 020564, Drugs@FDA',
        measuredMetric:
          'No difference in frequency or severity of clinical or laboratory toxicity against placebo in a 1,840-patient randomised trial',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, at one of two strengths that are not interchangeable',
        laymanDesc:
          'A small tablet with or without food. The same molecule is sold at a lower strength for hepatitis B under a different name, and using the wrong one in someone who has both infections causes resistance.',
        molecularDetail:
          'Oral bioavailability is around 86% and unaffected by food. Elimination is predominantly renal and largely unchanged, so dose adjustment is required at reduced creatinine clearance. It is not a cytochrome P450 substrate, inhibitor or inducer of consequence, which is why it appears in almost every combination without an interaction problem. The two-strength issue is carried in the boxed warning of both products.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters cells freely, and human enzymes mostly ignore it',
        laymanDesc:
          'The drug crosses into cells without help. Because it is built as the mirror image of a natural building block, the enzymes that copy human DNA largely refuse to touch it, which is where the tolerability comes from.',
        molecularDetail:
          'Lamivudine enters cells by passive diffusion and by nucleoside transporters and is phosphorylated by deoxycytidine kinase and downstream kinases to the triphosphate. Human DNA polymerases alpha and beta and mitochondrial polymerase gamma discriminate against the L-configuration, so the mitochondrial toxicity that characterised stavudine, didanosine and zidovudine is largely absent.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Three phosphates make it look like the DNA letter C',
        laymanDesc:
          'The cell adds three phosphate groups. The finished molecule closely resembles one of the four building blocks the copying enzyme is looking for.',
        molecularDetail:
          'Lamivudine 5-prime-triphosphate is the active species and competes with deoxycytidine triphosphate for the reverse transcriptase active site. Its intracellular half-life supports once-daily dosing in HIV. The same triphosphate inhibits the reverse transcriptase domain of the hepatitis B polymerase, which is why one molecule treats two unrelated viruses.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Inserted, and then nothing more can be added',
        laymanDesc:
          'The viral enzyme takes it for the real thing and stitches it in. The ring it is built on has a sulfur atom where the attachment point for the next letter should be, so the chain ends there.',
        molecularDetail:
          'Chain termination follows incorporation because the oxathiolane ring has no 3-prime hydroxyl. The signature HIV resistance substitution is M184V, which introduces a beta-branched side chain that sterically clashes with the oxathiolane sulfur, conferring more than hundred-fold resistance. The homologous hepatitis B substitution is rtM204V or rtM204I with rtL180M. The same structural change occurs in both viruses at the same position, and the clinical consequences run in opposite directions.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And when the mutation arrives, the drug usually stays in the regimen',
        laymanDesc:
          'M184V makes lamivudine stop working and also makes the virus worse at replicating and more vulnerable to two other drugs. So the drug is often deliberately kept, to keep the crippled virus in place.',
        molecularDetail:
          'M184V reduces reverse transcriptase processivity and replicative fitness and partially resensitises virus to zidovudine and tenofovir. In the E-184V randomised pilot, patients with M184V kept on lamivudine alone had significantly slower viral rebound, slower CD4 decline and slower recovery of replication capacity than patients who stopped everything, with 41% against 69% reaching immunological or clinical failure by week 48 (p=0.018). In hepatitis B, where the drug was given alone, the same class of substitution produced flares, decompensation and 65% resistance by year five.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CAESAR',
        phase:
          'Randomised, placebo-controlled, 52-week clinical-endpoint trial, stopped early at interim analysis',
        sampleSize: 1840,
        primaryEndpoint:
          'Progression to a new protocol-defined AIDS event or death, adding lamivudine to a zidovudine-containing regimen',
        endpointMet: true,
        statisticalPValue:
          '20% versus 9% progression, p<0.0001, relative hazard 0.42 (95% CI 0.32 to 0.57); survival relative hazard 0.40 (95% CI 0.23 to 0.69), p=0.0007',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GEMINI-1 and GEMINI-2 (NCT02831673, NCT02831764)',
        phase:
          'Two identically designed multicentre, double-blind, randomised, non-inferiority phase 3 trials, 48-week primary',
        sampleSize: 1433,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at week 48 by snapshot, dolutegravir with lamivudine against dolutegravir with tenofovir disoproxil and emtricitabine',
        endpointMet: true,
        statisticalPValue:
          'Pooled 91% versus 93%, adjusted difference -1.7% (95% CI -4.4 to 1.1), non-inferior at a -10% margin',
        unreportedAdverseSignals:
          'Enrolment was restricted to screening HIV-1 RNA at or below 500,000 copies per millilitre, so the regimen was not randomised against three drugs above that threshold.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'E-184V study',
        phase: 'Randomised, open-label pilot, 48 weeks',
        sampleSize: 58,
        primaryEndpoint:
          'Immunological or clinical failure, lamivudine monotherapy against complete treatment interruption in patients carrying M184V',
        endpointMet: true,
        statisticalPValue:
          '41% versus 69% discontinued for failure, time to failure significantly longer on lamivudine (p=0.018); grade 3-4 HIV-related events in 20.7% of the interruption group only (p=0.02)',
        unreportedAdverseSignals:
          'Twenty-nine patients per arm, and the comparator was stopping all antiretroviral therapy rather than switching to an active regimen. This trial supports a practice that is now applied far more widely than what it tested.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Lamivudine long-term hepatitis B safety analysis',
        phase:
          'Pooled long-term analysis of HBeAg-positive patients treated for up to six years, median four, with a one-year placebo comparison',
        sampleSize: 998,
        primaryEndpoint:
          'Incidence of hepatitis flares, hepatic decompensation and liver-disease-related serious adverse events during long-term lamivudine treatment',
        endpointMet: false,
        statisticalPValue:
          'Documented resistance mutation in 23% at year 1 rising to 65% at year 5; flares significantly more common in patients with resistance in every year (p<0.005)',
        unreportedAdverseSignals:
          'Hepatic decompensation rose to 6% (p=0.03) and liver-disease-related serious adverse events to 20% (p=0.009) after four years of carrying resistance. This row records why lamivudine is no longer a first-line hepatitis B drug.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Progression to AIDS or death of 20% against 9% with lamivudine added to zidovudine, relative hazard 0.42 (95% CI 0.32 to 0.57), with a separate survival benefit',
        'Dolutegravir plus lamivudine non-inferior to a three-drug regimen in 1,433 treatment-naive patients, pooled adjusted difference -1.7% (95% CI -4.4 to 1.1)',
        'Lamivudine-resistant hepatitis B mutations in 23% of patients at year 1 rising to 65% at year 5, with flares significantly more common in those carrying them',
        'In patients with M184V, lamivudine monotherapy delayed immunological or clinical failure against stopping everything, 41% against 69% by week 48 (p=0.018)',
      ],
      unsupportedInferences: [
        'That the E-184V result justifies retaining lamivudine in failing regimens generally, when it randomised 29 patients per arm against complete treatment interruption rather than against an active regimen',
        'That GEMINI non-inferiority at or below 500,000 copies per millilitre extends above that threshold, which was an entry criterion rather than a finding',
        'That a two-drug regimen containing lamivudine is appropriate in hepatitis B co-infection, where it constitutes lamivudine monotherapy against the second virus',
      ],
      whatFailedInitially: [
        'Lamivudine monotherapy for hepatitis B produced 65% resistance by year five, with rising rates of flares, decompensation and serious liver events, and lost its place as a first-line hepatitis B drug',
        'The same molecule is marketed at two strengths under two brand names for two infections that frequently co-occur, and the regulatory response was a boxed warning rather than a redesign',
      ],
      realWorldOutcome: [
        'A component of nearly every HIV regimen in the world for thirty years, at US$0.4887 per tablet at United States pharmacy acquisition cost across 18 listed products',
        'The nucleoside half of Dovato, the two-drug regimen that has changed how many antiretrovirals a person starting treatment actually needs',
        'Superseded in hepatitis B by tenofovir and entecavir, on resistance rather than on tolerability or price',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet and oral solution, at two different strengths for the two indications, and in many fixed-dose combinations',
      description:
        'Taken once daily with or without food in HIV regimens. Elimination is predominantly renal and largely unchanged, so dose reduction is required at reduced creatinine clearance. The hepatitis B product is a lower strength under a different brand name and is not appropriate for anyone with HIV-1, a distinction carried in the boxed warning of both products.',
      safetyProfile:
        'Severe acute exacerbation of hepatitis B on discontinuation is boxed, with hepatic monitoring required for at least several months after stopping in co-infected patients. The second boxed item is the difference between the two lamivudine products. Lactic acidosis and severe hepatomegaly with steatosis are labelled class effects of nucleoside analogues, though lamivudine carries far less mitochondrial toxicity than the earlier drugs of its class because human polymerases discriminate against its unnatural stereochemistry. Pancreatitis is labelled with caution in paediatric patients with a relevant history. In CAESAR there was no difference in the frequency or severity of clinical or laboratory toxicity against placebo.',
    },
    commonQuestions: [
      {
        q: 'My resistance test shows M184V. Why has my doctor kept me on lamivudine?',
        a: 'Because the mutation that stops the drug working also damages the virus, and keeping the drug keeps the damage in place. M184V introduces a side chain that blocks lamivudine and simultaneously reduces the processivity and replicative fitness of the enzyme, and it partially restores sensitivity to zidovudine and tenofovir. The E-184V study randomised 58 patients carrying M184V either to lamivudine alone or to stopping all antiretrovirals: by week 48, 41% against 69% had reached immunological or clinical failure, time to failure was significantly longer on lamivudine (p=0.018), and viral rebound, CD4 decline and recovery of replication capacity were all slower. Two caveats matter: it randomised 29 patients per arm, and its comparator was stopping everything, which is not the decision most people are actually facing.',
        auditNote:
          'A mechanism plus a 58-patient pilot became routine practice. The mechanism is sound and the evidence base is thinner than the practice suggests.',
      },
      {
        q: 'Why is lamivudine no longer used for hepatitis B?',
        a: 'Because used alone against hepatitis B, it selects resistance relentlessly and the patients who develop it do worse. In 998 patients followed for up to six years, the proportion carrying a lamivudine-resistant mutation rose from 23% in year 1 to 65% in year 5. Hepatitis flares ran at 10% in the first year and 18% to 21% per year afterwards, and by year 3 more than 80% of flares were temporally associated with a resistance mutation. Patients with mutations had significantly more flares every year, and after four years of carrying resistance, hepatic decompensation rose to 6% and serious liver-related events to 20%. Tenofovir and entecavir replaced it. In HIV the same class of mutation arises just as easily, but lamivudine is never given alone, so it never gets the chance to matter the same way.',
      },
      {
        q: 'Is a two-drug regimen really as good as three?',
        a: 'In the population that was tested, yes. GEMINI-1 and GEMINI-2 randomised 1,441 treatment-naive adults, double-blind, to dolutegravir with lamivudine or dolutegravir with tenofovir disoproxil and emtricitabine. Pooled at week 48, 91% against 93% were below 50 copies per millilitre, adjusted difference -1.7% (95% CI -4.4 to 1.1), non-inferior at a -10% margin, with numerically fewer drug-related adverse events on two drugs. What the trials did not test is anyone starting above 500,000 copies per millilitre, because that was an exclusion criterion. And a two-drug regimen has less redundancy by construction: if transmitted resistance has already compromised one agent, the effective regimen is one drug.',
      },
      {
        q: 'Why does it have so few side effects for a drug that stops DNA being copied?',
        a: 'Because of how it is built. Lamivudine is the mirror image of the natural configuration, an L-nucleoside rather than a D-nucleoside, with a sulfur atom where the sugar ring normally has a carbon. Human DNA polymerases discriminate strongly against that configuration and mostly refuse to incorporate it, including the mitochondrial polymerase whose inhibition caused the lipoatrophy, neuropathy and lactic acidosis that defined the earlier nucleoside analogues. HIV reverse transcriptase has a more permissive active site and takes it. In CAESAR, a 1,840-patient randomised trial, there was no difference in the frequency or severity of clinical or laboratory toxicity between the lamivudine and placebo arms. The same permissiveness is why one substitution is enough to defeat it.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for lamivudine could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost, and which for this molecule is set by 18 competing generic products.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'CAESAR Coordinating Committee. Randomised trial of addition of lamivudine or lamivudine plus loviride to zidovudine-containing regimens for patients with HIV-1 infection: the CAESAR trial. Lancet 1997;349:1413-1421',
        identifier: '9164314',
        kind: 'pmid',
      },
      {
        label:
          'Lok AS, Lai CL, Leung N, et al. Long-term safety of lamivudine treatment in patients with chronic hepatitis B. Gastroenterology 2003;125:1714-1722',
        identifier: '10.1053/j.gastro.2003.09.033',
        kind: 'doi',
      },
      {
        label:
          'Castagna A, Danise A, Menzo S, et al. Lamivudine monotherapy in HIV-1-infected patients harbouring a lamivudine-resistant virus: a randomized pilot study (E-184V study). AIDS 2006;20:795-803',
        identifier: '10.1097/01.aids.0000218542.08845.b2',
        kind: 'doi',
      },
      {
        label:
          'Cahn P, Sierra Madero J, Arribas JR, et al. Dolutegravir plus lamivudine versus dolutegravir plus tenofovir disoproxil fumarate and emtricitabine in antiretroviral-naive adults with HIV-1 infection (GEMINI-1 and GEMINI-2): week 48 results from two multicentre, double-blind, randomised, non-inferiority, phase 3 trials. Lancet 2019;393:143-155',
        identifier: '10.1016/S0140-6736(18)32462-0',
        kind: 'doi',
      },
      {
        label:
          'GEMINI-1: dolutegravir plus lamivudine versus dolutegravir plus tenofovir disoproxil-emtricitabine',
        identifier: 'NCT02831673',
        kind: 'nct',
      },
      {
        label:
          'GEMINI-2: dolutegravir plus lamivudine versus dolutegravir plus tenofovir disoproxil-emtricitabine',
        identifier: 'NCT02831764',
        kind: 'nct',
      },
      {
        label:
          'EPIVIR (lamivudine) — Drugs@FDA application NDA 020564, ViiV Healthcare; the boxed warning covers both hepatitis B exacerbation on discontinuation and the difference between the two lamivudine products',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020564',
        kind: 'regulatory',
      },
      {
        label: 'EPIVIR oral solution — Drugs@FDA application NDA 020596, ViiV Healthcare',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020596',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 60825 — lamivudine structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/60825',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 11. Cabotegravir — the first HIV prevention that is not a pill, superior to the pill in both
  //     of its trials, and carrying a failure mode that its own registration paper asked the field
  //     to go and solve.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cabotegravir',
    name: 'Cabotegravir',
    tradeName:
      'Vocabria (oral) and Apretude (injectable for prevention); with rilpivirine as Cabenuva',
    sponsor: 'ViiV Healthcare (GlaxoSmithKline, Pfizer and Shionogi joint venture)',
    targetGene: 'HIV-1 pol, integrase coding region',
    targetProtein:
      'HIV-1 integrase, blocked at the strand-transfer step by chelation of the two catalytic magnesium ions in the intasome active site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2021,
    indication:
      'As an extended-release injectable suspension for pre-exposure prophylaxis to reduce the risk of sexually acquired HIV-1 in at-risk adults and adolescents weighing at least 35 kg; and, with rilpivirine, for the treatment of HIV-1 infection in virologically suppressed adults with no history of treatment failure and no known resistance to either agent',
    patientFriendlyIndication: 'HIV prevention, and HIV-1 treatment as maintenance therapy',
    anatomicalSite:
      'HIV-1 intasome in CD4-positive T cells; the gluteal muscle acts as the depot from which the drug is released for months',
    conditionContext: {
      conditionExplainer:
        'Cabotegravir is the closest structural relative of dolutegravir and works the same way, jamming the enzyme HIV uses to paste itself into a chromosome. What is new is not the molecule but its physical form: a suspension of drug crystals injected into muscle, which dissolves over months rather than hours.',
      whyItMatters:
        'Every prevention trial before this one measured a pill someone had to remember. Two of them reported no effect at all because participants did not take it. Cabotegravir removes the daily decision, and in both of its trials it beat the daily pill outright rather than merely matching it.',
      whoTakesThis:
        'People at risk of sexually acquired HIV who receive an injection every two months, and virologically suppressed people who have switched their treatment from daily tablets to injections of cabotegravir with rilpivirine.',
      clinicalGoals:
        'In prevention, not acquiring HIV. In treatment, plasma HIV-1 RNA below 50 copies per millilitre maintained without the daily tablet, and without selecting integrase resistance if it fails.',
    },
    oneSentenceVerdict:
      'An integrase strand-transfer inhibitor formulated as a long-acting intramuscular suspension; it cut HIV acquisition by 66% against daily oral tenofovir-emtricitabine in 4,566 men who have sex with men and transgender women (hazard ratio 0.34) and by 88% in 3,224 women in sub-Saharan Africa (hazard ratio 0.12), and both trials stopped early for efficacy — while producing integrase resistance and delayed diagnosis in the breakthrough infections that did occur.',
    laymanHowItWorks:
      'HIV cannot survive inside a cell as a loose copy. It has to paste a DNA version of itself into one of your chromosomes, and it uses one enzyme to do that. Cabotegravir grips the two magnesium atoms that enzyme needs to make the cut, so the paste step never happens and the virus never establishes itself. The difference from a tablet is not chemical but physical: injected into muscle as a suspension of crystals, it dissolves slowly enough that one injection covers two months.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 83,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear: '',
      markupEstimate: '',
      openPatentNotes:
        'No CMS NADAC line was found for either cabotegravir product at the time of writing. That survey measures what retail pharmacies pay to acquire a drug, and a clinic-administered intramuscular suspension is not dispensed through that channel, so its absence is a property of the dataset rather than of the product. ViiV Healthcare has granted licences through the Medicines Patent Pool for generic long-acting cabotegravir for prevention in low-income and middle-income countries, and generic supply had not reached the CMS survey when this page was written.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The competition for cabotegravir in prevention is the two daily oral options it beat in randomised trials, and the comparison is as much about whether a tablet gets taken as about what the tablet does.',
      conventionalRx: [
        {
          name: 'Emtricitabine with tenofovir disoproxil fumarate (generic)',
          class: 'Daily oral nucleoside and nucleotide reverse transcriptase inhibitors',
          howItCompares:
            'The active comparator in both cabotegravir prevention trials, and it lost both. In HPTN 083 incidence was 1.22 against 0.41 per 100 person-years, hazard ratio 0.34 (95% CI 0.18 to 0.62). In HPTN 084 it was 1.85 against 0.20, hazard ratio 0.12 (95% CI 0.05 to 0.31). In HPTN 084, only 42.1% of sampled plasma from the oral arm had tenofovir concentrations consistent with daily use.',
          typicalCost:
            'Tenofovir disoproxil at US$0.5051 and lamivudine at US$0.4887 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026); the emtricitabine combination line was not read',
          prosAndCons:
            'Pros: generic, no injection, stops working promptly when stopped, randomised data in women as well as men. Cons: it has to be taken, and two large trials reported no effect at all in populations where it was not.',
        },
        {
          name: 'Emtricitabine with tenofovir alafenamide (Descovy)',
          class: 'Daily oral nucleoside and nucleotide reverse transcriptase inhibitors',
          howItCompares:
            'Non-inferior to the older combination for prevention in DISCOVER, with better bone and renal biomarkers. Its indication explicitly excludes people at risk from receptive vaginal sex, because the trial enrolled no cisgender women. Cabotegravir has randomised evidence in that population and this does not.',
          typicalCost:
            'Tenofovir alafenamide at US$74.94 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 29 June 2026)',
          prosAndCons:
            'Pros: no injection, better bone and renal biomarkers than the older prodrug. Cons: on patent, a labelled indication gap covering receptive vaginal sex, and still a daily tablet.',
        },
        {
          name: 'Dolutegravir (Tivicay), for treatment rather than prevention',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'The closest structural relative of cabotegravir and the oral drug it is effectively a long-acting version of. For treatment it has the deeper evidence base and no depot to manage; for prevention it is not used.',
          typicalCost:
            'US$105.03 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: no injection visits, stops promptly, extensive trial record. Cons: a daily tablet, which is the entire problem cabotegravir was built to solve.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@H]1CO[C@H]2N1C(=O)C3=C(C(=O)C(=CN3C2)C(=O)NCC4=C(C=C(C=C4)F)F)O',
      chemicalFormula: 'C19H17F2N3O5',
      molecularWeight:
        '405.40 g/mol (free acid); the injectable is a sodium-free nanocrystal suspension',
      targetReceptorAffinity:
        'Binds the intasome rather than a receptor, through the same coplanar oxygen triad on a carbamoyl pyridone core that chelates both catalytic magnesium ions, with the 2,4-difluorobenzyl group occupying the pocket vacated by the displaced 3-prime adenosine of viral DNA. It differs from dolutegravir by a single methylene: cabotegravir carries a five-membered oxazolidine ring where dolutegravir has a six-membered oxazinane. That one atom lowers aqueous solubility enough for the molecule to be milled into a nanocrystal suspension whose dissolution rate, rather than its metabolism, sets the elimination half-life. The apparent terminal half-life after intramuscular injection runs to months, and drug remains detectable for a year or more after the last dose.',
      structureSource: {
        label: 'PubChem CID 54713659 (cabotegravir) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54713659',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cab-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Chiral control of the fused oxazolidine ring and of the difluorobenzylamine',
          description:
            'Confirm configuration at both stereocentres of the bicyclic carbamoyl pyridone and assay the 2,4-difluorobenzylamine fragment. The difference between cabotegravir and dolutegravir is one carbon in this ring system, and it is the difference between a molecule that dissolves and one that does not, so ring identity is a formulation specification as much as a chemical one.',
          reagentsAndBuffer:
            'Cabotegravir reference standard, (S)-2-aminopropan-1-ol reference, 2,4-difluorobenzylamine reference, chiral HPLC on an amylose-derived stationary phase, proton and fluorine-19 NMR, Karl Fischer titration',
        },
        {
          id: 'cab-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bicyclic pyridone construction, amide coupling and demethylation',
          description:
            'Condense the protected methoxy-oxo-pyridine dicarboxylate with the chiral aminoalcohol so the oxazolidine ring closes onto the pyridinone, couple the free carboxylate to 2,4-difluorobenzylamine, then strip the methyl ether to expose the chelating hydroxyl. As in the rest of the class, the hydroxyl stays masked through the couplings, because unmasked it sequesters metal ions and stalls the reaction.',
          dependsOnStepId: 'cab-w1',
          reagentsAndBuffer:
            'Methyl 3-methoxy-4-oxo-pyridine-2,5-dicarboxylate, (S)-2-aminopropan-1-ol, acetonitrile with methanesulfonic acid, 2,4-difluorobenzylamine with carbodiimide or CDI activation, magnesium bromide in tetrahydrofuran for demethylation, under nitrogen',
        },
        {
          id: 'cab-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Wet bead milling to a nanocrystal suspension with a defined size distribution',
          description:
            'This is the step that creates the product. Crystallise the free acid, then mill it in the presence of a surfactant stabiliser until the particle size distribution matches the specification that gives two months of release. Everything clinically distinctive about this drug is set here: too fine and the depot empties early, too coarse and concentrations never reach the protective threshold.',
          dependsOnStepId: 'cab-w2',
          reagentsAndBuffer:
            'Polysorbate 20 or poloxamer stabiliser, polyethylene glycol and mannitol in water for injection, zirconium oxide milling media, laser diffraction particle size analysis, X-ray powder diffraction to confirm the crystal form survived milling',
        },
        {
          id: 'cab-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Single-round infection across the protection-relevant concentration range',
          description:
            'Infect peripheral blood mononuclear cells at graded drug concentrations spanning the protein-adjusted 90% inhibitory concentration, in the presence of human serum, alongside a panel of integrase mutants. The point of interest is not the EC50 but where on the concentration curve protection is lost, because a depot that empties passes through that region slowly.',
          dependsOnStepId: 'cab-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, VSV-G pseudotyped HIV-1 reporter virus, 100% human serum arm for the protein-adjusted IC90 determination, Q148 and N155 integrase mutants',
        },
        {
          id: 'cab-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Depot release kinetics and plasma concentration against the PA-IC90 threshold',
          description:
            'Measure drug release from the milled suspension over weeks and express plasma concentrations as multiples of the protein-adjusted 90% inhibitory concentration. That ratio is the quantity the clinical concentration-response analysis is built on, and it is the reason a pharmacokinetic measurement is a safety measurement for this product.',
          dependsOnStepId: 'cab-w4',
          reagentsAndBuffer:
            'Stable-isotope-labelled cabotegravir internal standard, protein-precipitation extraction, LC-MS/MS in positive ion mode, dialysis-membrane and flow-through release apparatus, human plasma for protein-binding determination',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cab-a1',
        category: 'measured',
        title:
          'HPTN 083: 13 infections against 39, and the trial was stopped at the first interim look',
        laymanSummary:
          'In 4,566 men who have sex with men and transgender women, injections every eight weeks produced 13 HIV infections against 39 on the daily tablet. The independent review board stopped the trial early at its first scheduled interim analysis.',
        technicalDetails:
          'HPTN 083 (NCT02720094) was a randomised, double-blind, double-dummy non-inferiority trial comparing long-acting cabotegravir 600 mg intramuscularly every eight weeks with daily oral tenofovir disoproxil-emtricitabine, with participants followed for 153 weeks. The intention-to-treat population was 4,566, of whom 570 (12.5%) identified as transgender women, median age 26. Among 1,698 United States participants, 845 (49.8%) identified as Black. Incident HIV infection occurred in 52 participants: 13 in the cabotegravir group, incidence 0.41 per 100 person-years, against 39 in the oral group, incidence 1.22 per 100 person-years, hazard ratio 0.34 (95% CI 0.18 to 0.62). The trial was stopped early for efficacy on the first preplanned interim analysis, and the effect was consistent across prespecified subgroups. Injection-site reactions were reported in 81.4% of the cabotegravir group against 31.3% of the oral group, the latter reflecting the double-dummy placebo injections.',
        evidenceSource:
          'Landovitz RJ, Donnell D, Clement ME, et al. N Engl J Med 2021;385:595-608 (HPTN 083, NCT02720094)',
        doi: '10.1056/NEJMoa2101016',
        measuredMetric:
          'Incident HIV infection: 0.41 against 1.22 per 100 person-years, hazard ratio 0.34 (95% CI 0.18 to 0.62)',
        auditFlag: 'verified',
      },
      {
        id: 'cab-a2',
        category: 'measured',
        title: 'HPTN 084: 4 infections against 36 in women, a hazard ratio of 0.12',
        laymanSummary:
          'In 3,224 women across seven countries in sub-Saharan Africa, four women in the injection group acquired HIV against thirty-six on the daily tablet. This is the population in which two earlier prevention trials had reported no effect at all.',
        technicalDetails:
          'HPTN 084 (NCT03164564) was a phase 3, randomised, double-blind, double-dummy, active-controlled superiority trial at 20 sites in seven countries in sub-Saharan Africa, enrolling 3,224 participants assigned female sex at birth, aged 18 to 45, median age 25. Forty incident infections occurred over 3,898 person-years, overall incidence 1.0% (95% CI 0.73 to 1.40): four in the cabotegravir group, 0.2 per 100 person-years (95% CI 0.06 to 0.52), and 36 in the oral group, 1.85 per 100 person-years (1.3 to 2.57), hazard ratio 0.12 (95% CI 0.05 to 0.31), p<0.0001, risk difference -1.6%. Injection coverage was 93% of total person-years. Injection site reactions were more frequent in the cabotegravir group, 577 of 1,519 (38.0%) against 162 of 1,516 (10.7%), and did not lead to injection discontinuation. Confirmed pregnancy incidence was 1.3 per 100 person-years and no congenital anomalies were reported.',
        evidenceSource:
          'Delany-Moretlwe S, Hughes JP, Bock P, et al. Lancet 2022;399:1779-1789 (HPTN 084, NCT03164564)',
        doi: '10.1016/S0140-6736(22)00538-4',
        measuredMetric:
          'Incident HIV infection in women: 0.20 against 1.85 per 100 person-years, hazard ratio 0.12 (95% CI 0.05 to 0.31)',
        auditFlag: 'verified',
      },
      {
        id: 'cab-a3',
        category: 'failed',
        title: 'The registration paper ends by asking the field to solve its own failure mode',
        laymanSummary:
          'When someone acquires HIV despite the injections, two things go wrong at once. The diagnosis is delayed because the drug suppresses the virus enough to blunt the tests, and the virus that emerges has usually developed integrase resistance because it grew up in a long stretch of not-quite-enough drug.',
        technicalDetails:
          'The HPTN 083 results section states that in participants in whom HIV infection was diagnosed after exposure to long-acting cabotegravir, integrase strand-transfer inhibitor resistance and delays in the detection of HIV infection were noted. The conclusion states, in its own words, that strategies are needed to prevent integrase resistance in cases of cabotegravir prevention failure. The mechanism is the pharmacokinetic tail: drug released from an intramuscular depot declines over months, so a person who acquires HIV during that decline spends an extended period at concentrations too low to suppress and high enough to select. That is the mirror image of an oral drug, whose concentrations fall through the same range in a day. This is not an incidental safety note; it is the principal unresolved problem of long-acting prevention, identified in the trial that established the approach.',
        evidenceSource:
          'Landovitz RJ et al., N Engl J Med 2021;385:595-608, Results and Conclusions (HPTN 083, NCT02720094)',
        doi: '10.1056/NEJMoa2101016',
        measuredMetric:
          'Integrase inhibitor resistance and delayed HIV detection among breakthrough infections, reported in the primary trial publication',
        auditFlag: 'caution',
      },
      {
        id: 'cab-a4',
        category: 'measured',
        title:
          'The proposed fix works and brings a new problem: RNA screening halved delays and false-positived at 45%',
        laymanSummary:
          'Adding a viral RNA test at every visit cut diagnostic delays from 47% of cases to 7% and got people onto treatment forty-seven days sooner. But nearly half the positive RNA results were wrong, and within six months of an injection more than seven in ten were wrong, which caused injections to be delayed or stopped in people who did not have HIV.',
        technicalDetails:
          'In the open-label extension of HPTN 083, sites performed rapid, antigen/antibody and HIV RNA testing at every visit. RNA screening was associated with fewer diagnostic delays, 7% against 47% of cases (p=0.02), and earlier treatment initiation, median 15 against 62 days (p=0.02). Drug resistance was less frequent with RNA screening, 15% against 31% of cases, but this did not reach significance (p=0.22). Five cases were first detected by RNA testing alone. Sensitivity was 93% (95% CI 76 to 99) and specificity 99.92% (95% CI 99.88 to 99.95), but positive predictive value was 55% (95% CI 40 to 69) overall and 29% (95% CI 13 to 49) when cabotegravir had been administered less than six months earlier. Some false-positive RNA results led to delay or discontinuation of injections. A specificity of 99.92% sounds decisive and produces a coin-flip positive predictive value here, because the prevalence being screened for is very low. That arithmetic is the audit.',
        evidenceSource:
          'Landovitz RJ, Fogel JM, Gao F, et al. Clin Infect Dis 2026;83:e285 (HPTN 083 open-label extension, NCT02720094)',
        doi: '10.1093/cid/ciag285',
        measuredMetric:
          'Diagnostic delay in 7% against 47% of cases, treatment initiation at median 15 against 62 days, positive predictive value 55% overall and 29% within six months of an injection',
        auditFlag: 'verified',
      },
      {
        id: 'cab-a5',
        category: 'inferred',
        title: 'The comparison is partly pharmacology and partly whether the comparator was taken',
        laymanSummary:
          'In the trial in women, injections were given 93% of the time they were due. In the same trial, fewer than half the blood samples from the tablet group had drug levels consistent with taking it daily. So a hazard ratio of 0.12 compares a drug that was delivered with a drug that partly was not.',
        technicalDetails:
          'HPTN 084 reported injection coverage of 93% of total person-years, and in a random subset of 405 participants in the oral arm, 812 of 1,929 plasma samples (42.1%) had tenofovir concentrations consistent with daily use. A separate nested case-control analysis of HPTN 083 established the concentration-response relationship on the cabotegravir side: minimum plasma cabotegravir at or above four times the protein-adjusted 90% inhibitory concentration was reached in 26% of participants who acquired HIV against 76% of matched controls, and was associated with a 93% reduction in acquisition risk relative to concentrations below one times that threshold (95% CI 76% to 98%, p<0.001). Two readings follow, and both are legitimate. Pharmacologically, the trials compare an assured exposure with a variable one rather than one molecule with another. Clinically, that is exactly the comparison a person choosing between them faces, and a drug that gets into the body is better than one that does not. The inference to resist is the third one: that cabotegravir is intrinsically more potent at preventing HIV than tenofovir-emtricitabine, which neither trial measured.',
        evidenceSource:
          'Delany-Moretlwe S et al., Lancet 2022;399:1779-1789; Hanscom B, Marzinke MA, Li X, et al. J Infect Dis 2026;233:jiaf561',
        doi: '10.1093/infdis/jiaf561',
        inferredClaim:
          'That the superiority of cabotegravir over daily oral prophylaxis reflects greater intrinsic antiviral protection rather than the difference between an administered drug and a self-taken one',
        auditFlag: 'caution',
      },
      {
        id: 'cab-a6',
        category: 'measured',
        title:
          'Better bone than the comparator, measured on the surrogate rather than on fractures',
        laymanSummary:
          'Bone density was measured in the prevention trial over two years, and the injection group did better than the tenofovir tablet group. As everywhere else in this class, what was measured is a scan result, not a broken bone.',
        technicalDetails:
          'A prespecified bone substudy of HPTN 083 reported that long-acting cabotegravir had a better bone safety profile than tenofovir disoproxil-emtricitabine over 105 weeks, and the authors conclude that for individuals with low bone mineral density or other fracture risk factors, cabotegravir prevention should be considered over tenofovir-based prevention. The endpoint is bone mineral density, which is a surrogate. No prevention trial in this field has been powered for fracture, and this one was not either. The finding is a genuine measured difference and it belongs in a decision for someone with established osteoporosis; it is not evidence that fewer bones break.',
        evidenceSource:
          'Brown TT, Arao RF, Warsi M, et al. Clin Infect Dis 2025;81:ciaf221 (HPTN 083 bone substudy, NCT02720094)',
        doi: '10.1093/cid/ciaf221',
        measuredMetric:
          'Change in bone mineral density over 105 weeks, cabotegravir against tenofovir disoproxil-emtricitabine',
        auditFlag: 'verified',
      },
      {
        id: 'cab-a7',
        category: 'inferred',
        title: 'In treatment, failure is rare and disproportionately carries resistance',
        laymanSummary:
          'Used for treatment with rilpivirine, monthly injections failed as rarely as daily tablets, seven people in each arm out of 591. But six of the seven injection failures had developed resistance mutations against three of the seven on tablets.',
        technicalDetails:
          'The pooled week 48 analysis of ATLAS (NCT02951052) and FLAIR (NCT02938520) covered 591 participants per arm, randomised to continue current oral therapy or switch to monthly intramuscular cabotegravir with rilpivirine after a four-week oral lead-in. Non-inferiority was met at a 4% margin for the primary and key secondary efficacy endpoints. Confirmed virological failure, two consecutive measurements at or above 200 copies per millilitre, occurred in 7 participants in each arm; resistance-associated mutations were present in 6 of 7 long-acting failures against 3 of 7 on oral therapy. Injection site reactions affected 83% of long-acting recipients and led to withdrawal of 6 (1%). The count is measured. That the difference is caused by the depot tail rather than by chance in 14 total events is an inference, mechanistically coherent and resting on small numbers, and it is the same inference the prevention data support from the other direction.',
        evidenceSource:
          'Rizzardini G, Overton ET, Orkin C, et al. J Acquir Immune Defic Syndr 2020;85:498-506 (pooled ATLAS and FLAIR)',
        doi: '10.1097/QAI.0000000000002466',
        inferredClaim:
          'That the excess of resistance among long-acting treatment failures is caused by the slow decline of drug from the intramuscular depot rather than by chance in 14 events',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected into muscle as a suspension of crystals',
        laymanDesc:
          'Not swallowed. A milky suspension of tiny drug crystals is injected into the buttock, where it forms a deposit that the body dissolves slowly over the following weeks.',
        molecularDetail:
          'The product is a nanocrystal suspension produced by wet bead milling with a surfactant stabiliser. Release is dissolution-rate-limited rather than metabolism-limited, so the apparent terminal half-life after intramuscular injection is on the order of months, and drug remains detectable for a year or more after the final dose. An oral lead-in is used before treatment injections to establish tolerability before committing a month of drug to a depot that cannot be withdrawn.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It circulates and enters cells, and simply waits there',
        laymanDesc:
          'The drug moves out of the deposit into the blood, then into cells, where it does nothing at all unless a virus arrives.',
        molecularDetail:
          'Cabotegravir is passively permeable, distributes into CD4-positive T cells without a transporter, and requires no intracellular activation. It is cleared principally by UGT1A1 glucuronidation with a minor UGT1A9 contribution, so no pharmacokinetic booster is required and the interaction profile is dominated by UGT inducers, principally rifampicin, which is contraindicated.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It grabs the two magnesium atoms the cutting enzyme needs',
        laymanDesc:
          'When a virus does enter and copies its genome into DNA, it assembles the machine that will paste that DNA into a chromosome. Cabotegravir clamps onto the two magnesium atoms that machine uses to make the cut.',
        molecularDetail:
          'The carbamoyl pyridone core presents a coplanar oxygen triad that chelates both catalytic Mg2+ ions in the integrase active site of the assembled intasome, with the 2,4-difluorobenzyl group occupying the pocket vacated by the displaced 3-prime adenosine. Binding requires the intasome to have formed; affinity for free integrase is negligible.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The paste step never happens, so infection is never established',
        laymanDesc:
          'Without integration there is no permanent copy. In prevention this means the virus that arrives never gets established at all, which is a different and better outcome than suppressing one that already is.',
        molecularDetail:
          'Strand transfer is blocked specifically while 3-prime processing still occurs. Unintegrated viral DNA is circularised and lost. In prevention this interrupts the establishment of the reservoir rather than suppressing an existing one, which is why prophylaxis protects rather than merely controls. Escape at Q148 and N155 requires accumulating substitutions that cost replicative fitness, which is the resistance barrier the second-generation drugs are built around.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the depot empties slowly, which is the benefit and the risk in one property',
        laymanDesc:
          'Two months of protection from one injection is the point. The same slow release means that if protection ever does fail, the virus grows for months in the presence of a little drug, which is the situation that teaches it to resist.',
        molecularDetail:
          'A nested case-control analysis found that minimum plasma cabotegravir at or above four times the protein-adjusted 90% inhibitory concentration gave a 93% reduction in acquisition risk against concentrations below one times that threshold, and that only 26% of people who acquired HIV had reached it against 76% of matched controls. Breakthrough infections in HPTN 083 carried integrase resistance and delayed detection. The pharmacokinetic tail is a single property with opposite consequences on either side of the protective threshold.',
        iconName: 'ShieldAlert',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'HPTN 083 (NCT02720094)',
        phase:
          'Phase 2b/3, randomised, double-blind, double-dummy, stopped early for efficacy at the first preplanned interim analysis',
        sampleSize: 4566,
        primaryEndpoint:
          'Incident HIV infection, long-acting cabotegravir every eight weeks against daily oral tenofovir disoproxil-emtricitabine',
        endpointMet: true,
        statisticalPValue:
          '13 versus 39 infections, incidence 0.41 versus 1.22 per 100 person-years, hazard ratio 0.34 (95% CI 0.18 to 0.62)',
        unreportedAdverseSignals:
          'Breakthrough infections carried integrase inhibitor resistance and delayed detection. The published conclusion asks for strategies to prevent that resistance, which is a registration trial naming its own unsolved problem.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HPTN 084 (NCT03164564)',
        phase:
          'Phase 3, randomised, double-blind, double-dummy, active-controlled superiority trial',
        sampleSize: 3224,
        primaryEndpoint:
          'Incident HIV infection in women in sub-Saharan Africa, long-acting cabotegravir against daily oral tenofovir disoproxil-emtricitabine',
        endpointMet: true,
        statisticalPValue:
          '4 versus 36 infections, 0.20 versus 1.85 per 100 person-years, hazard ratio 0.12 (95% CI 0.05 to 0.31), p<0.0001',
        unreportedAdverseSignals:
          'Injection coverage was 93% of person-years while only 42.1% of sampled plasma in the oral arm had tenofovir concentrations consistent with daily use, so part of the measured difference is delivery rather than pharmacology.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HPTN 083 open-label extension, RNA screening analysis',
        phase: 'Prospective diagnostic-accuracy analysis within an open-label extension',
        sampleSize: 4566,
        primaryEndpoint:
          'Performance of prospective HIV RNA screening for detecting breakthrough infection during long-acting cabotegravir prophylaxis',
        endpointMet: true,
        statisticalPValue:
          'Diagnostic delay 7% versus 47% (p=0.02), treatment initiation median 15 versus 62 days (p=0.02); sensitivity 93%, specificity 99.92%, positive predictive value 55% overall and 29% within six months of an injection',
        unreportedAdverseSignals:
          'Some false-positive RNA results led to delay or discontinuation of injections in people who did not have HIV. Resistance was less frequent with RNA screening, 15% against 31%, but not significantly so (p=0.22).',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Pooled ATLAS (NCT02951052) and FLAIR (NCT02938520), week 48',
        phase: 'Two randomised, open-label, multicentre phase 3 switch trials, pooled',
        sampleSize: 1182,
        primaryEndpoint:
          'Proportion with HIV-1 RNA at or above 50 copies per millilitre at week 48 by FDA snapshot, monthly injectable cabotegravir with rilpivirine against continued oral therapy',
        endpointMet: true,
        statisticalPValue:
          'Non-inferiority met against a 4% margin for the primary and key secondary endpoints',
        unreportedAdverseSignals:
          'Seven confirmed virological failures in each arm, with resistance-associated mutations in 6 of 7 long-acting failures against 3 of 7 on oral therapy. Injection site reactions in 83% of long-acting recipients.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'HIV incidence 0.41 against 1.22 per 100 person-years in 4,566 men who have sex with men and transgender women, hazard ratio 0.34 (95% CI 0.18 to 0.62)',
        'HIV incidence 0.20 against 1.85 per 100 person-years in 3,224 women in sub-Saharan Africa, hazard ratio 0.12 (95% CI 0.05 to 0.31)',
        'Minimum plasma cabotegravir at or above four times the protein-adjusted IC90 in 26% of cases against 76% of matched controls, associated with a 93% risk reduction (95% CI 76 to 98)',
        'HIV RNA screening reduced diagnostic delay from 47% to 7% of cases with a positive predictive value of 55%, falling to 29% within six months of an injection',
      ],
      unsupportedInferences: [
        'That superiority over daily oral prophylaxis reflects greater intrinsic antiviral protection rather than the difference between an administered drug and a self-taken one',
        'That the excess of resistance among long-acting failures is caused by the depot tail rather than by chance in small event counts, in prevention or in treatment',
        'That better bone mineral density over 105 weeks means fewer fractures, which no prevention trial has been powered to test',
      ],
      whatFailedInitially: [
        'Breakthrough infections during prophylaxis carried integrase inhibitor resistance and delayed detection, and the registration paper closes by asking the field for strategies to prevent it',
        'The proposed remedy, RNA screening at every visit, has a positive predictive value of 29% within six months of an injection, and its false positives caused injections to be delayed or stopped in people without HIV',
      ],
      realWorldOutcome: [
        'The first HIV prevention that is not a daily tablet, and the first prevention agent with randomised superiority over the existing standard in both men and women',
        'Licensed through the Medicines Patent Pool for generic manufacture of the prevention product for low-income and middle-income countries',
        'Half of Cabenuva, the first complete HIV treatment regimen given as an injection rather than as tablets',
      ],
    },
    deliverySystem: {
      type: 'Extended-release intramuscular nanocrystal suspension, given gluteally, with an oral tablet formulation used as a lead-in and as oral bridging',
      description:
        'The prevention product is given as an injection every two months after an initiation interval; the treatment regimen is given with rilpivirine monthly or two-monthly. An oral lead-in is used before treatment injections so that tolerability is established before a depot is created. Rifampicin and rifapentine are contraindicated because UGT1A1 induction lowers exposure below the protective range, and a depot cannot be dose-adjusted after it has been placed.',
      safetyProfile:
        'Injection site reactions are the dominant adverse event, reported in 81.4% of recipients in HPTN 083 and 38.0% in HPTN 084, decreasing in frequency over time and rarely leading to discontinuation. Hepatotoxicity and hypersensitivity reactions are labelled. The distinctive risks are structural rather than toxicological: drug persists for a year or more after the last injection, so acquiring HIV during that decline risks integrase resistance, and HIV testing is required before every injection. Depressive disorders including suicidal ideation are labelled for the treatment regimen.',
    },
    commonQuestions: [
      {
        q: 'Is an injection every two months really better than a daily pill?',
        a: 'In both randomised trials, yes, and by a wide margin. HPTN 083 randomised 4,566 men who have sex with men and transgender women and found 13 infections on injections against 39 on daily tenofovir-emtricitabine, hazard ratio 0.34, and was stopped early for efficacy at its first interim analysis. HPTN 084 randomised 3,224 women in seven sub-Saharan African countries and found 4 against 36, hazard ratio 0.12. The adherence data help explain the difference: injection coverage in HPTN 084 was 93% of person-years, while only 42.1% of sampled plasma from the tablet group had tenofovir levels consistent with daily use. For a person choosing between them that distinction does not reduce the benefit, but it does mean the trials measured a delivery difference and not only a pharmacological one.',
        auditNote:
          'Two large earlier prevention trials in African women reported no effect at all, for the same reason this one shows a large one.',
      },
      {
        q: 'What happens if someone gets HIV anyway while on the injections?',
        a: 'Two things go wrong together, and the registration paper says so in its own conclusion. First, diagnosis is delayed: the drug partly suppresses the new infection, so antibody and antigen tests turn positive later than they otherwise would. Second, the virus that emerges usually carries integrase resistance, because drug released from an intramuscular depot declines over months and the virus spends that period growing at concentrations too low to suppress it and high enough to select for escape. The HPTN 083 paper closes with the sentence that strategies are needed to prevent integrase resistance in cases of prophylaxis failure. That is a registration trial naming its own unsolved problem, and the problem is still open.',
        auditNote:
          'The pharmacokinetic tail is a single property. Above the protective threshold it is the entire benefit; below it, it is the entire risk.',
      },
      {
        q: 'Why is a viral load test needed before each injection, and can it be wrong?',
        a: 'Because HIV acquired while on this drug can be missed by the ordinary tests, and giving another injection to someone who has already acquired HIV is what drives resistance. Adding an RNA test at each visit works: in the HPTN 083 open-label extension it cut diagnostic delays from 47% to 7% of cases and moved treatment initiation from a median of 62 days to 15. It is also wrong quite often in the direction that matters. Specificity was 99.92% and sensitivity 93%, but because HIV is rare in the population being screened, the positive predictive value was 55% overall and 29% when an injection had been given within the previous six months. Some false positives led to injections being delayed or stopped in people who did not have HIV.',
      },
      {
        q: 'Can I stop it whenever I want?',
        a: 'Stopping the injections is straightforward; stopping the drug is not, and that distinction matters. Cabotegravir released from the muscle deposit continues to circulate for a year or more after the last injection, at concentrations that decline gradually through and below the protective range. That period is not protection, and acquiring HIV during it is the situation that selects integrase resistance. This is why guidance covers what happens after the final injection as carefully as what happens during the course, and why a decision to stop is a clinical conversation rather than simply not attending the next appointment.',
      },
      {
        q: 'Why does this page show no price at all?',
        a: 'Because no verified figure exists in the dataset this site uses for prices. The CMS National Average Drug Acquisition Cost survey measures what retail pharmacies pay to acquire a drug, and a clinic-administered intramuscular suspension is not dispensed through that channel, so no line was found for either cabotegravir product. Writing an estimate into a price field would mean this page inventing a number, which is worse than leaving it empty. What can be stated is the licensing position: ViiV Healthcare has granted Medicines Patent Pool licences for generic long-acting cabotegravir for prevention in low-income and middle-income countries.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Landovitz RJ, Donnell D, Clement ME, et al. Cabotegravir for HIV prevention in cisgender men and transgender women. N Engl J Med 2021;385:595-608',
        identifier: '10.1056/NEJMoa2101016',
        kind: 'doi',
      },
      {
        label:
          'Delany-Moretlwe S, Hughes JP, Bock P, et al. Cabotegravir for the prevention of HIV-1 in women: results from HPTN 084, a phase 3, randomised clinical trial. Lancet 2022;399:1779-1789',
        identifier: '10.1016/S0140-6736(22)00538-4',
        kind: 'doi',
      },
      {
        label:
          'Landovitz RJ, Fogel JM, Gao F, et al. Prospective HIV RNA screening with long-acting cabotegravir pre-exposure prophylaxis in HPTN 083. Clin Infect Dis 2026',
        identifier: '10.1093/cid/ciag285',
        kind: 'doi',
      },
      {
        label:
          'Hanscom B, Marzinke MA, Li X, et al. Estimation of prevention-effective CAB-LA concentrations among men who have sex with men and transgender women in HPTN 083. J Infect Dis 2026',
        identifier: '10.1093/infdis/jiaf561',
        kind: 'doi',
      },
      {
        label:
          'Brown TT, Arao RF, Warsi M, et al. Bone changes with long-acting cabotegravir or tenofovir disoproxil fumarate/emtricitabine for HIV prevention in cisgender men and transgender women: HPTN 083. Clin Infect Dis 2025',
        identifier: '10.1093/cid/ciaf221',
        kind: 'doi',
      },
      {
        label:
          'Rizzardini G, Overton ET, Orkin C, et al. Long-acting injectable cabotegravir + rilpivirine for HIV maintenance therapy: week 48 pooled analysis of phase 3 ATLAS and FLAIR trials. J Acquir Immune Defic Syndr 2020;85:498-506',
        identifier: '10.1097/QAI.0000000000002466',
        kind: 'doi',
      },
      {
        label:
          'Clement ME, Hanscom B, Haines D, et al. Cabotegravir maintains protective efficacy in the setting of bacterial sexually transmitted infections: a secondary analysis of HPTN 083. Clin Infect Dis 2026',
        identifier: '10.1093/cid/ciae572',
        kind: 'doi',
      },
      {
        label:
          'HPTN 083: injectable cabotegravir compared with oral tenofovir-emtricitabine for prevention',
        identifier: 'NCT02720094',
        kind: 'nct',
      },
      {
        label: 'HPTN 084: long-acting injectable cabotegravir for HIV prevention in women',
        identifier: 'NCT03164564',
        kind: 'nct',
      },
      {
        label: 'ATLAS: switching to long-acting cabotegravir plus rilpivirine in suppressed adults',
        identifier: 'NCT02951052',
        kind: 'nct',
      },
      {
        label:
          'FLAIR: long-acting cabotegravir plus rilpivirine after dolutegravir-based induction',
        identifier: 'NCT02938520',
        kind: 'nct',
      },
      {
        label:
          'APRETUDE (cabotegravir extended-release injectable suspension) — Drugs@FDA application NDA 215499, ViiV Healthcare',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=215499',
        kind: 'regulatory',
      },
      {
        label:
          'VOCABRIA (cabotegravir tablets) — Drugs@FDA application NDA 212887, ViiV Healthcare',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=212887',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 54713659 — cabotegravir structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54713659',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 12. Doravirine — a non-nucleoside engineered around the mutations that ended the first
  //     generation, tested against the two drugs it does not compete with, and still a
  //     one-mutation class.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'doravirine',
    name: 'Doravirine',
    tradeName: 'Pifeltro; with lamivudine and tenofovir disoproxil as Delstrigo',
    sponsor: 'Merck Sharp and Dohme',
    targetGene: 'HIV-1 pol, reverse transcriptase coding region',
    targetProtein:
      'HIV-1 reverse transcriptase, inhibited allosterically at the non-nucleoside pocket by a pyridinone designed to retain binding through K103N, Y181C and G190A',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2018,
    indication:
      'In combination with other antiretroviral agents for the treatment of HIV-1 infection in adults and paediatric patients weighing at least 35 kg with no prior antiretroviral treatment history, or to replace the current regimen in those who are virologically suppressed with no history of treatment failure and no known resistance to doravirine',
    patientFriendlyIndication: 'HIV-1 infection, as part of a combination regimen',
    anatomicalSite: 'HIV-1 reverse transcriptase in the cytoplasm of infected CD4-positive T cells',
    conditionContext: {
      conditionExplainer:
        'Doravirine binds the same allosteric pocket beside the reverse transcriptase active site that efavirenz and rilpivirine bind. It was designed after that pocket, and the mutations that reshape it, were both fully characterised, which is why it retains activity against the substitutions that ended the first generation of the class.',
      whyItMatters:
        'By 2016 roughly one person in ten starting treatment in southern and eastern Africa already carried non-nucleoside resistance. Doravirine is the drug built for that world: same class, same pocket, active against K103N and Y181C, and without the central nervous system profile that made efavirenz hard to take.',
      whoTakesThis:
        'People who need an alternative to an integrase inhibitor, commonly because of a drug interaction or because of weight gain, and people switching from an older non-nucleoside or from a boosted protease inhibitor.',
      clinicalGoals:
        'Plasma HIV-1 RNA below 50 copies per millilitre and kept there, without selecting the V106A, F227C and Y318F substitutions that define its own resistance pathway.',
    },
    oneSentenceVerdict:
      'A second-generation non-nucleoside inhibitor engineered to keep binding reverse transcriptase through the mutations that end efavirenz; it reached 84.3% suppressed at 48 weeks against 80.8% on efavirenz with a third of the dizziness (8.8% against 37.1%), and 84% against 80% on boosted darunavir with LDL cholesterol 14.6 mg/dL lower at 96 weeks — but it has never been randomised against the integrase inhibitors it actually competes with, and it remains a class defeated by single substitutions.',
    laymanHowItWorks:
      'Reverse transcriptase has to flex through a cycle of shapes to copy genetic material. Doravirine wedges into a greasy pocket just beside the working part of the enzyme and holds the whole structure rigid, so the cycle cannot complete. The first drug that did this, efavirenz, was thrown out by a single change to that pocket. Doravirine was designed after the shape of that changed pocket was known, so it still fits.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$92.89 per tablet at United States pharmacy acquisition cost, median across two listed brand products (CMS NADAC, effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'On patent, with only two products carrying a NADAC line. The comparison that gives that number meaning is on this page already: efavirenz, in the same class and the same binding pocket, is generic at US$1.35 per tablet, and the difference between them is activity against two substitutions plus a better tolerability profile. Merck has licensed doravirine to the Medicines Patent Pool for low-income and lower-middle-income countries.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Doravirine was registered against a boosted protease inhibitor and against efavirenz. The drug it competes with in practice is dolutegravir, and that comparison has never been randomised.',
      conventionalRx: [
        {
          name: 'Dolutegravir (Tivicay)',
          class: 'Integrase strand-transfer inhibitor, second generation',
          howItCompares:
            'The actual competitor, and the comparison is indirect. Dolutegravir has never selected resistance in a treatment-naive trial, whereas doravirine remains in a class where single substitutions matter. Doravirine is weight-neutral in the trials that measured it, while dolutegravir is associated with weight gain. No head-to-head randomised trial in treatment-naive adults has been run.',
          typicalCost:
            'US$105.03 per tablet at United States pharmacy acquisition cost (CMS NADAC, brand, effective 19 August 2026)',
          prosAndCons:
            'Pros: highest resistance barrier in routine use, first-line in every major guideline. Cons: weight gain, and a small serum creatinine rise that is a transporter effect rather than a kidney one.',
        },
        {
          name: 'Efavirenz (generic)',
          class: 'Non-nucleoside reverse transcriptase inhibitor, first generation',
          howItCompares:
            'The comparator in DRIVE-AHEAD, at 84.3% against 80.8% suppressed at week 48. The differences that mattered were tolerability and lipids: dizziness 8.8% against 37.1%, sleep disturbance 12.1% against 25.2%, and fasting LDL cholesterol changing by -1.6 mg/dL against +8.7 mg/dL. Doravirine also retains activity against K103N and Y181C, which end efavirenz.',
          typicalCost:
            'US$1.35 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026)',
          prosAndCons:
            'Pros: seventy times cheaper, decades of use, extensive pregnancy data. Cons: central nervous system effects, higher lipids, and a single mutation ends it.',
        },
        {
          name: 'Ritonavir-boosted darunavir (generic)',
          class: 'Protease inhibitor with a pharmacokinetic booster',
          howItCompares:
            'The comparator in DRIVE-FORWARD. At week 96, 73% against 66% below 50 copies per millilitre, difference 7.1% (95% CI 0.5 to 13.7), with LDL cholesterol 14.6 mg/dL lower and non-HDL cholesterol 18.4 mg/dL lower on doravirine, and diarrhoea in 17% against 24%.',
          typicalCost:
            'Darunavir at US$2.49 per tablet at United States pharmacy acquisition cost (CMS NADAC, generic, effective 19 August 2026), plus a separate booster',
          prosAndCons:
            'Pros: generic, and the highest resistance barrier of any protease inhibitor. Cons: requires a booster with a long interaction list, more gastrointestinal effects, worse lipids, and an unresolved cardiovascular association in cohort data.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C(=NNC1=O)CN2C=CC(=C(C2=O)OC3=CC(=CC(=C3)C#N)Cl)C(F)(F)F',
      chemicalFormula: 'C17H11ClF3N5O3',
      molecularWeight: '425.70 g/mol',
      targetReceptorAffinity:
        'Binds the non-nucleoside pocket in the p66 subunit of HIV-1 reverse transcriptase, roughly 10 angstroms from the polymerase active site, and inhibits allosterically rather than competing with the nucleotide substrate. The design difference from the first generation is which residues the molecule leans on: the 3-chloro-5-cyanophenoxy group and the trifluoromethyl pyridinone core make contacts that tolerate substitution at positions 103 and 181, so K103N and Y181C, which abolish efavirenz and nevirapine binding, leave doravirine active. Its own escape pathway therefore runs elsewhere, principally V106A or V106I, F227C and Y318F, and those substitutions do carry replicative fitness costs, which is why treatment-emergent resistance was rare in the registration programme.',
      structureSource: {
        label: 'PubChem CID 58460047 (doravirine) — canonical SMILES, formula and weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/58460047',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dor-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity control of the chlorocyanophenol and the triazolinone fragments',
          description:
            'Assay the two aromatic fragments separately. The 3-chloro-5-cyanophenol supplies the group that reaches past position 181 and the methyl triazolinone supplies the solubilising tail; both are achiral, so this molecule has no stereochemical specification, which is unusual on this page and simplifies the whole route.',
          reagentsAndBuffer:
            'Doravirine reference standard, 3-chloro-5-cyanophenol reference, 4-methyl-1,2,4-triazol-3-one reference, reversed-phase HPLC with photodiode array detection, proton and fluorine-19 NMR, Karl Fischer titration',
        },
        {
          id: 'dor-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Pyridinone construction, diaryl ether formation and N-alkylation',
          description:
            'Build the trifluoromethyl pyridinone core, install the diaryl ether by displacing a halide with the chlorocyanophenolate, and alkylate the pyridinone nitrogen with the chloromethyl triazolinone. The diaryl ether is the bond that positions the whole molecule in the pocket, and its regiochemistry is the specification that matters most for potency.',
          dependsOnStepId: 'dor-w1',
          reagentsAndBuffer:
            'A 3-halo-4-trifluoromethyl-2-pyridinone intermediate, 3-chloro-5-cyanophenol with caesium or potassium carbonate in dimethylformamide, 3-(chloromethyl)-4-methyl-1,2,4-triazol-5-one, phase-transfer catalyst, under nitrogen',
        },
        {
          id: 'dor-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation, polymorph identity and fixed-dose blend uniformity',
          description:
            'Crystallise, confirm the polymorph, and then test content uniformity for the three-drug fixed-dose tablet as well as the single agent. Doravirine is marketed both alone and co-formulated with lamivudine and tenofovir disoproxil, and the blend is the product most people actually take.',
          dependsOnStepId: 'dor-w2',
          reagentsAndBuffer:
            'Ethanol-water or acetonitrile-water crystallisation, X-ray powder diffraction and differential scanning calorimetry, USP dissolution apparatus, reversed-phase HPLC for related substances and for blend uniformity across the three actives',
        },
        {
          id: 'dor-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Infection of PBMCs across the first-generation resistance panel',
          description:
            'Infect primary cells with wild-type virus and with K103N, Y181C, G190A and the double K103N/Y181C mutant, alongside V106A and F227C. This panel defines the molecule’s clinical claim: the first four substitutions are common in people who have already been treated, while failure against the last two defines its limits.',
          dependsOnStepId: 'dor-w3',
          reagentsAndBuffer:
            'Ficoll-separated human PBMCs, RPMI-1640 with 10% foetal bovine serum and interleukin-2, HIV-1 NL4-3 wild-type plus K103N, Y181C, G190A, K103N/Y181C, V106A and F227C site-directed mutants, 50% human serum arm',
        },
        {
          id: 'dor-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fold-change table and replicative fitness of the escape mutants',
          description:
            'Report EC50 fold change against each mutant, then measure replication capacity of the escape mutants in growth competition. The second number is what distinguishes a second-generation non-nucleoside from a first-generation one: not that resistance is impossible, but that the substitutions which produce it cost the virus something.',
          dependsOnStepId: 'dor-w4',
          reagentsAndBuffer:
            'Recombinant HIV-1 p66/p51 reverse transcriptase, wild-type and mutant enzymes, luciferase reporter single-cycle assay, dual-labelled growth-competition cultures for replication capacity',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dor-a1',
        category: 'measured',
        title: 'DRIVE-AHEAD: non-inferior to efavirenz with a third of the dizziness',
        laymanSummary:
          'In 728 people starting treatment, the doravirine tablet matched the efavirenz tablet on viral suppression, 84.3% against 80.8%. What separated them was tolerability: dizziness in 8.8% against 37.1%, and sleep disturbance in 12.1% against 25.2%.',
        technicalDetails:
          'DRIVE-AHEAD (NCT02403674) was a phase 3, multicentre, double-blind non-inferiority trial randomising 734 treatment-naive adults with at least 1,000 HIV-1 RNA copies per millilitre to fixed-dose doravirine 100 mg with lamivudine and tenofovir disoproxil, or to efavirenz 600 mg with emtricitabine and tenofovir disoproxil; 728 were treated. At week 48, 307 of 364 (84.3%) against 294 of 364 (80.8%) had HIV-1 RNA below 50 copies per millilitre by FDA snapshot, difference 3.5% (95% CI -2.0 to 9.0) against a 10% margin. Prespecified neuropsychiatric events were significantly less frequent on doravirine: dizziness 8.8% against 37.1%, sleep disorders or disturbances 12.1% against 25.2%, altered sensorium 4.4% against 8.2%. Mean change in fasting LDL cholesterol was -1.6 against +8.7 mg/dL and non-HDL cholesterol -3.8 against +13.3 mg/dL, both significantly different. At week 96 suppression was 77.5% against 73.6%, difference 3.8% (95% CI -2.4 to 10.0), with no additional doravirine resistance emerging between weeks 48 and 96.',
        evidenceSource:
          'Orkin C, Squires KE, Molina JM, et al. Clin Infect Dis 2019;68:535-544; Orkin C et al., Clin Infect Dis 2021;73:33-42 (DRIVE-AHEAD, NCT02403674)',
        doi: '10.1093/cid/ciy540',
        measuredMetric:
          'Proportion below 50 copies per millilitre at week 48, difference 3.5% (95% CI -2.0 to 9.0), with prespecified neuropsychiatric event rates and fasting lipid change',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a2',
        category: 'measured',
        title: 'DRIVE-FORWARD: ahead of boosted darunavir by 96 weeks, and 14.6 mg/dL lower on LDL',
        laymanSummary:
          'Against a boosted protease inhibitor in 766 treated patients, doravirine matched it at 48 weeks and was ahead by 96, 73% against 66%. Cholesterol went down on doravirine and up on darunavir, and there was a third less diarrhoea.',
        technicalDetails:
          'DRIVE-FORWARD (NCT02275780) randomised 769 treatment-naive adults at 125 centres in 15 countries, double-blind, to doravirine 100 mg daily or ritonavir-boosted darunavir 800/100 mg daily, each with investigator-selected nucleosides; 383 in each group received at least one dose. At week 48, 321 of 383 (84%) against 306 of 383 (80%) were below 50 copies per millilitre, difference 3.9% (95% CI -1.6 to 9.4), meeting non-inferiority at a 10-percentage-point margin. At week 96, 277 of 383 (73%) against 248 of 383 (66%), difference 7.1% (95% CI 0.5 to 13.7). Treatment-emergent resistance to any study drug occurred in 2 of 383 (1%) on doravirine and 1 of 383 on darunavir. Mean changes from baseline differed significantly for LDL cholesterol, -14.6 mg/dL (95% CI -18.2 to -11.0), and non-HDL cholesterol, -18.4 mg/dL (-22.5 to -14.3). Diarrhoea occurred in 65 (17%) against 91 (24%) through week 96.',
        evidenceSource:
          'Molina JM, Squires K, Sax PE, et al. Lancet HIV 2018;5:e211-e220 and Lancet HIV 2020;7:e16-e26 (DRIVE-FORWARD, NCT02275780)',
        doi: '10.1016/S2352-3018(18)30021-3',
        measuredMetric:
          'Proportion below 50 copies per millilitre at weeks 48 and 96, difference 3.9% (95% CI -1.6 to 9.4) and 7.1% (0.5 to 13.7)',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a3',
        category: 'inferred',
        title: 'It has never been randomised against the drug it actually competes with',
        laymanSummary:
          'Doravirine was registered against efavirenz and against a boosted protease inhibitor. Neither is what a clinician is choosing between today. The real alternative is an integrase inhibitor, and that trial has not been run in people starting treatment.',
        technicalDetails:
          'The registration programme comprised DRIVE-FORWARD against ritonavir-boosted darunavir, DRIVE-AHEAD against efavirenz, and DRIVE-SHIFT, a switch trial from a boosted regimen. By the time doravirine was approved in 2018, both the WHO and the United States guidelines had already moved first-line therapy to integrase inhibitors, so all three comparators were drugs the guidelines had moved away from. The one randomised comparison that does exist against an integrase inhibitor is ACTG A5391, and it enrolled 145 people with obesity who were already suppressed, switching them off an integrase inhibitor with tenofovir alafenamide; it was a weight trial, not an efficacy trial, and it found no clinically meaningful weight difference at 48 weeks. Claims that doravirine is comparable to dolutegravir or bictegravir in treatment-naive patients therefore rest on cross-trial comparison, which is exactly the kind of comparison the non-inferiority margins in these trials are wide enough to hide a real difference inside.',
        evidenceSource:
          'Molina JM et al., Lancet HIV 2018;5:e211-e220; Orkin C et al., Clin Infect Dis 2019;68:535-544; Koethe JR et al., Clin Infect Dis 2026;83:e81',
        doi: '10.1016/S2352-3018(19)30336-4',
        inferredClaim:
          'That efficacy demonstrated against efavirenz and against boosted darunavir establishes comparability with the second-generation integrase inhibitors that are the actual alternative',
        auditFlag: 'caution',
      },
      {
        id: 'dor-a4',
        category: 'inferred',
        title: 'The lipid advantage is measured on cholesterol, not on cardiovascular events',
        laymanSummary:
          'LDL cholesterol falls on doravirine and rises on the drugs it was compared with, consistently and significantly. Whether that difference produces fewer heart attacks has not been tested, because no antiretroviral trial has ever been powered for cardiovascular endpoints.',
        technicalDetails:
          'Against efavirenz, mean fasting LDL cholesterol changed by -1.6 against +8.7 mg/dL and non-HDL cholesterol by -3.8 against +13.3 mg/dL at week 48, both significant. Against boosted darunavir, the between-group differences at week 96 were -14.6 mg/dL for LDL (95% CI -18.2 to -11.0) and -18.4 mg/dL for non-HDL (-22.5 to -14.3). In DRIVE-AHEAD at week 96 the mean change in the total cholesterol to HDL ratio, which is the lipid measure most directly tied to cardiovascular risk in the general population, was similar between groups. That last detail is the audit: the ratio is what the epidemiology of cardiovascular risk is built on, and on that measure the difference disappeared. A 14.6 mg/dL LDL difference is a real and consistent measurement, and the step from it to a difference in myocardial infarction is an extrapolation nobody has tested in this population.',
        evidenceSource:
          'Orkin C et al., Clin Infect Dis 2019;68:535-544 and Clin Infect Dis 2021;73:33-42; Molina JM et al., Lancet HIV 2020;7:e16-e26',
        doi: '10.1093/cid/ciaa822',
        inferredClaim:
          'That the LDL and non-HDL cholesterol advantage translates into fewer cardiovascular events, when the total cholesterol to HDL ratio did not differ at 96 weeks and no trial has measured the events',
        auditFlag: 'caution',
      },
      {
        id: 'dor-a5',
        category: 'measured',
        title: 'It survives K103N and Y181C, which is the whole reason it exists',
        laymanSummary:
          'The substitutions that ended the first generation of this drug class are now common in people who have been treated before, and in some regions in people who have not. Doravirine keeps working against them, which is a narrow but genuinely useful property.',
        technicalDetails:
          'Doravirine was selected for in-vitro activity against the most common non-nucleoside-resistant HIV-1 variants, including K103N, Y181C and G190A and the K103N/Y181C double mutant, and the label carries the resulting indication distinction. The reason this matters is regional and quantitative: a meta-regression of 358 datasets covering 56,044 adults estimated pretreatment non-nucleoside resistance in 2016 at 11.0% (95% CI 7.5 to 15.9) in southern Africa and 10.1% (5.1 to 19.4) in eastern Africa, against a WHO threshold of 10% for changing national first-line therapy. Its own escape pathway runs through V106A or V106I, F227C and Y318F. In DRIVE-AHEAD no additional doravirine resistance emerged between weeks 48 and 96, and in DRIVE-FORWARD treatment-emergent resistance to any study drug occurred in 2 of 383. It is a second-generation drug in a one-mutation class, not a drug with an integrase-inhibitor resistance barrier, and those are different claims.',
        evidenceSource:
          'Orkin C et al., Clin Infect Dis 2019;68:535-544; Gupta RK et al., Lancet Infect Dis 2018;18:346-355',
        doi: '10.1016/S1473-3099(17)30702-8',
        measuredMetric:
          'Retained in-vitro activity against K103N, Y181C, G190A and K103N/Y181C, with an escape pathway through V106A/I, F227C and Y318F',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a6',
        category: 'measured',
        title: 'Weight-neutral on switching, in a field where that has become the question',
        laymanSummary:
          'Weight gain on integrase inhibitors is the main reason people look for an alternative. Across three trials, switching to or continuing doravirine was weight-neutral overall, with more than half of participants holding stable weight.',
        technicalDetails:
          'A pooled analysis of DRIVE-FORWARD, DRIVE-AHEAD and DRIVE-SHIFT reported that switching to doravirine was weight-neutral overall, with more than 57% of participants having stable weight and more than 74% also receiving tenofovir disoproxil. In DRIVE-SHIFT through week 144, mean weight change from switch was +1.4 kg in the immediate-switch group and +1.2 kg in the delayed-switch group. Two confounders belong with these numbers and the authors identify them. First, most participants were also on tenofovir disoproxil, which independently suppresses weight, so part of what looks like doravirine neutrality is the backbone. Second, participants switching away from a weight-suppressive non-nucleoside were more likely to gain than those switching from a protease inhibitor, meaning the direction of measured change depends on what was stopped as much as on what was started. The randomised test of whether removing an integrase inhibitor in favour of doravirine reverses established weight gain is ACTG A5391, and it found no clinically meaningful difference at 48 weeks.',
        evidenceSource:
          'Orkin C, Koethe JR, Kumar PN, et al. Open Forum Infect Dis 2025;12:ofaf639; Kumar P et al., J Acquir Immune Defic Syndr 2021;87:801-805 (DRIVE-SHIFT, NCT02397096)',
        doi: '10.1093/ofid/ofaf639',
        measuredMetric:
          'Mean weight change of +1.4 kg and +1.2 kg from switch through week 144 in DRIVE-SHIFT, with stable weight in more than 57% of pooled participants',
        auditFlag: 'verified',
      },
      {
        id: 'dor-a7',
        category: 'failed',
        title:
          'The trials that established it enrolled almost no women and almost no Black participants',
        laymanSummary:
          'Across all three registration trials, women and Black participants each made up under a fifth of the study populations. The analyses that looked for differences by sex and race found broadly similar results, and said in their own conclusion that the sample size was too small to be sure.',
        technicalDetails:
          'A long-term subgroup analysis across DRIVE-FORWARD, DRIVE-AHEAD and DRIVE-SHIFT reports that female and Black participants each represented under 20% of the study populations. Within that limit, proportions below 50 copies per millilitre were comparable between sex and race subgroups, CD4 changes and drug-related adverse event rates were generally similar, and the authors conclude that sample size was limited and that future studies should ensure greater diversity. Two signals within that analysis were not similar: in DRIVE-SHIFT, non-treatment-related discontinuations were higher in Black than in non-Black participants, and differences in median weight change were generally larger between race subgroups than between sex subgroups, with wide interquartile ranges throughout. A separate weight analysis found weight loss or stable weight more common in non-Black than in Black participants after switching to doravirine. None of these are efficacy failures. What failed is the enrolment: a drug positioned for regions where non-nucleoside resistance is highest was registered on a population that barely included the people who live there.',
        evidenceSource:
          'Walmsley SL, Kumar PN, Orkin C, et al. Open Forum Infect Dis 2025;12:ofaf356; Orkin C et al., Open Forum Infect Dis 2025;12:ofaf639',
        doi: '10.1093/ofid/ofaf356',
        measuredMetric:
          'Female and Black participants each under 20% of the population across three registration trials, with the subgroup analysis stating its own sample size was limited',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed once a day, with or without food, and without a booster',
        laymanDesc:
          'One tablet daily, alone or in a three-drug combination tablet. No food requirement, no second drug needed to keep it in the body, and a short interaction list.',
        molecularDetail:
          'Doravirine is cleared principally by CYP3A4 oxidation and requires no pharmacokinetic booster. It is not a clinically significant inhibitor or inducer itself, so the interaction profile is dominated by strong CYP3A inducers such as rifampicin and rifapentine, which are contraindicated. Unlike rilpivirine it has no gastric pH dependence and no meal requirement, and unlike efavirenz it does not induce its own metabolism.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It crosses into cells and needs no activation',
        laymanDesc:
          'The molecule diffuses into cells as it is. It does not have to be converted into anything else first, unlike the nucleoside drugs it is combined with.',
        molecularDetail:
          'Doravirine is passively permeable and is not a prodrug, in contrast to the nucleoside and nucleotide analogues in its fixed-dose partner tablet, all of which must be phosphorylated before they act. Its central nervous system penetration is lower than efavirenz, which is the pharmacological account of the neuropsychiatric difference measured in DRIVE-AHEAD.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It wedges into the pocket beside the copying machinery',
        laymanDesc:
          'Beside the working part of reverse transcriptase is a greasy gap. Doravirine forces its way in and stays, holding the enzyme in a shape it cannot work from.',
        molecularDetail:
          'Binding is to the non-nucleoside pocket in the p66 subunit, roughly 10 angstroms from the polymerase catalytic triad, and inhibition is allosteric and non-competitive with respect to the nucleotide substrate. The 3-chloro-5-cyanophenoxy group and the trifluoromethyl pyridinone core were selected so that the contacts do not depend on residues 103 and 181, which are the positions the first-generation drugs relied on and the virus most readily changes.',
        iconName: 'Magnet',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The enzyme cannot flex, so copying stops, and the usual escape routes are closed',
        laymanDesc:
          'With the drug wedged in place the enzyme is rigid and cannot complete its cycle. The two changes that would normally throw a drug like this out of the pocket do not throw this one out.',
        molecularDetail:
          'Binding restricts mobility of the thumb subdomain and the primer grip so the enzyme cannot execute the conformational change that follows nucleotide binding. Activity is retained against K103N, Y181C, G190A and the K103N/Y181C double mutant. Escape instead requires V106A or V106I, F227C or Y318F, substitutions that carry replicative fitness costs, which is why treatment-emergent resistance was rare across the registration programme and why no additional doravirine resistance emerged between weeks 48 and 96 in DRIVE-AHEAD.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Virus falls, with less dizziness and lower cholesterol than the drug it replaced',
        laymanDesc:
          'Suppression rates match the comparators. The measurable differences are elsewhere: far less dizziness and sleep disturbance than efavirenz, and cholesterol that goes down rather than up.',
        molecularDetail:
          'Suppression below 50 copies per millilitre was 84.3% against 80.8% at week 48 against efavirenz and 84% against 80% against boosted darunavir, rising to a 7.1 percentage-point advantage over darunavir by week 96. Dizziness occurred in 8.8% against 37.1% and sleep disturbance in 12.1% against 25.2%. Fasting LDL cholesterol changed by -1.6 against +8.7 mg/dL against efavirenz and by a between-group difference of -14.6 mg/dL against darunavir. The total cholesterol to HDL ratio, which is the measure most tied to cardiovascular risk, did not differ at week 96.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DRIVE-AHEAD (NCT02403674)',
        phase:
          'Phase 3, randomised, double-blind, non-inferiority, 48-week primary with 96-week follow-up',
        sampleSize: 728,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at week 48 by FDA snapshot, against efavirenz-emtricitabine-tenofovir disoproxil',
        endpointMet: true,
        statisticalPValue:
          '84.3% versus 80.8%, difference 3.5% (95% CI -2.0 to 9.0) against a 10% margin; at week 96, 77.5% versus 73.6%, difference 3.8% (95% CI -2.4 to 10.0)',
        unreportedAdverseSignals:
          'Prespecified neuropsychiatric events were the differentiating result and were secondary endpoints: dizziness 8.8% against 37.1%, sleep disturbance 12.1% against 25.2%.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DRIVE-FORWARD (NCT02275780)',
        phase:
          'Phase 3, randomised, double-blind, non-inferiority, 48-week primary with 96-week key secondary',
        sampleSize: 766,
        primaryEndpoint:
          'Proportion with HIV-1 RNA below 50 copies per millilitre at week 48 by FDA snapshot, against ritonavir-boosted darunavir',
        endpointMet: true,
        statisticalPValue:
          '84% versus 80%, difference 3.9% (95% CI -1.6 to 9.4); at week 96, 73% versus 66%, difference 7.1% (95% CI 0.5 to 13.7)',
        unreportedAdverseSignals:
          'The comparator was a boosted protease inhibitor that guidelines had already moved away from by the time the drug was approved. No randomised comparison against an integrase inhibitor in treatment-naive adults exists.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'DRIVE-SHIFT (NCT02397096)',
        phase:
          'Phase 3, randomised, open-label, immediate against delayed switch, 48-week primary with 144-week follow-up',
        sampleSize: 647,
        primaryEndpoint:
          'Maintenance of HIV-1 RNA below 50 copies per millilitre after switching from a stable suppressive regimen to fixed-dose doravirine-lamivudine-tenofovir disoproxil',
        endpointMet: true,
        statisticalPValue:
          'At week 144, 80.1% (351/438) of the immediate-switch group and 83.7% (175/209) of the delayed-switch group maintained below 50 copies per millilitre',
        unreportedAdverseSignals:
          'Non-treatment-related discontinuations were higher in Black than in non-Black participants in this trial, in a study population where Black participants were under 20% of the total.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Integrated safety analysis of P007, DRIVE-FORWARD and DRIVE-AHEAD',
        phase: 'Prespecified integrated safety analysis of three double-blind trials at week 48',
        sampleSize: 1500,
        primaryEndpoint:
          'Proportion of participants discontinuing because of adverse events through week 48, doravirine against efavirenz and against ritonavir-boosted darunavir',
        endpointMet: true,
        statisticalPValue:
          'Discontinuation for adverse events 2.5% on doravirine against 6.6% on efavirenz, treatment difference -3.4% (95% CI -6.2 to -0.8, p=0.012), and 3.1% on boosted darunavir',
        unreportedAdverseSignals:
          'Neuropsychiatric adverse events occurred in 25.0% on doravirine against 55.9% on efavirenz, and drug-related adverse events in 30.9% against 61.4%.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '84.3% against 80.8% below 50 copies per millilitre at week 48 against efavirenz, difference 3.5% (95% CI -2.0 to 9.0)',
        '73% against 66% at week 96 against ritonavir-boosted darunavir, difference 7.1% (95% CI 0.5 to 13.7)',
        'Dizziness in 8.8% against 37.1% and sleep disturbance in 12.1% against 25.2% against efavirenz; neuropsychiatric events 25.0% against 55.9% in the integrated analysis',
        'Between-group LDL cholesterol difference of -14.6 mg/dL (95% CI -18.2 to -11.0) against boosted darunavir at week 96',
      ],
      unsupportedInferences: [
        'That efficacy against efavirenz and boosted darunavir establishes comparability with the integrase inhibitors that are the actual alternative, which has never been randomised in treatment-naive adults',
        'That the LDL and non-HDL advantage produces fewer cardiovascular events, when the total cholesterol to HDL ratio did not differ at 96 weeks and no trial measured events',
        'That weight neutrality on switching is a property of doravirine, when most participants were also taking tenofovir disoproxil, which independently suppresses weight',
      ],
      whatFailedInitially: [
        'The registration programme enrolled women and Black participants at under 20% each, and its own subgroup analysis states that sample size was limited and calls for greater diversity in future studies',
        'All three comparators were drugs that major guidelines had already moved away from by the time the drug reached the market in 2018',
      ],
      realWorldOutcome: [
        'Positioned in guidelines as an alternative rather than a preferred first-line agent, used where an integrase inhibitor is not appropriate',
        'Active against the K103N and Y181C substitutions that ended the first generation of its class and that reached an estimated 11.0% pretreatment prevalence in southern Africa by 2016',
        'On patent at US$92.89 per tablet at United States pharmacy acquisition cost, against US$1.35 for the generic drug in the same class and the same binding pocket',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet, as a single agent and as a fixed-dose combination with lamivudine and tenofovir disoproxil',
      description:
        'Taken once daily with or without food. No pharmacokinetic booster is required and there is no gastric pH dependence. Strong CYP3A inducers, principally rifampicin and rifapentine, are contraindicated because exposure falls far enough to risk loss of virological response and class resistance.',
      safetyProfile:
        'The fixed-dose combination carries a boxed warning for severe acute exacerbation of hepatitis B on discontinuation, contributed by its lamivudine and tenofovir components rather than by doravirine. Immune reconstitution inflammatory syndrome can follow suppression. Neuropsychiatric adverse events occur but at roughly half the efavirenz rate in the integrated analysis, 25.0% against 55.9%, and prespecified dizziness at 8.8% against 37.1%. Nausea, headache and diarrhoea are the commonest complaints. Discontinuation for adverse events was 2.5% at week 48 across the programme.',
    },
    commonQuestions: [
      {
        q: 'How is it different from efavirenz if they work the same way?',
        a: 'Two things, both measured in the same trial. The first is resistance: efavirenz is defeated by a single substitution at position 103 or 181 of reverse transcriptase, and doravirine was designed to make its contacts elsewhere, so it retains activity against K103N, Y181C, G190A and the double mutant. That matters because pretreatment non-nucleoside resistance reached an estimated 11.0% in southern Africa by 2016. The second is tolerability: in DRIVE-AHEAD, dizziness occurred in 8.8% of doravirine recipients against 37.1% on efavirenz, sleep disturbance in 12.1% against 25.2%, and fasting LDL cholesterol changed by -1.6 mg/dL against +8.7. Suppression itself was similar, 84.3% against 80.8%.',
      },
      {
        q: 'Is it as good as dolutegravir?',
        a: 'No trial has compared these drugs in people starting treatment. Doravirine was registered against efavirenz and against ritonavir-boosted darunavir, both of which the major guidelines had already moved away from by 2018. The only randomised comparison with an integrase inhibitor is ACTG A5391, which switched 145 already-suppressed people with obesity off an integrase inhibitor to doravirine to see whether weight fell; it was a weight trial and found no clinically meaningful difference at 48 weeks. Comparing doravirine with dolutegravir therefore means comparing across trials with different populations and different comparators, which is exactly the comparison a 10-percentage-point non-inferiority margin is wide enough to obscure. Structurally, doravirine is still in a class where single substitutions matter and dolutegravir is not.',
        auditNote:
          'A drug can be well studied and still not studied against the thing it competes with.',
      },
      {
        q: 'Does the cholesterol difference mean fewer heart attacks?',
        a: 'That has not been tested, and one measurement inside the same trials argues for caution. LDL cholesterol falls on doravirine and rises on both comparators, consistently and significantly, with a between-group difference of 14.6 mg/dL against boosted darunavir at 96 weeks. But at week 96 in DRIVE-AHEAD, the mean change in the total cholesterol to HDL ratio was similar between groups, and the ratio is the lipid measure that the cardiovascular epidemiology is actually built on. No antiretroviral trial in this class has ever been powered for myocardial infarction or stroke. So the lipid difference is real and the clinical consequence of it is unmeasured.',
      },
      {
        q: 'Why is it so much more expensive than efavirenz?',
        a: 'Because it is on patent and efavirenz is not. Both bind the same pocket on the same enzyme. What is being paid for is activity against two common resistance substitutions plus a substantially better central nervous system and lipid profile, and those are real differences measured in a double-blind trial. Whether they are worth roughly seventy times the price per tablet is a question about a specific patient rather than about the drug: for someone whose virus already carries K103N it is not a comparison at all, and for someone starting treatment with fully sensitive virus in a setting where cost decides access, it is a very different calculation. Both figures on this page are pharmacy acquisition costs from the same CMS survey and are directly comparable.',
      },
      {
        q: 'Why does this page not show a manufacturing cost or a markup?',
        a: 'Because no per-dose cost of production for doravirine could be verified against a published source. The cost-of-production literature for essential medicines holds its per-drug figures in supplementary appendices that were not checkable line by line here, and an estimate in that field would be this page inventing a number. What is shown is the United States pharmacy acquisition cost from the CMS NADAC file, which is a price and not a cost, alongside the same figure for the generic drug in the same class, which is the comparison that carries information.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Orkin C, Squires KE, Molina JM, et al. Doravirine/lamivudine/tenofovir disoproxil fumarate is non-inferior to efavirenz/emtricitabine/tenofovir disoproxil fumarate in treatment-naive adults with HIV-1 infection: week 48 results of the DRIVE-AHEAD trial. Clin Infect Dis 2019;68:535-544',
        identifier: '10.1093/cid/ciy540',
        kind: 'doi',
      },
      {
        label:
          'Orkin C, Squires KE, Molina JM, et al. Doravirine/lamivudine/tenofovir disoproxil fumarate versus efavirenz/emtricitabine/tenofovir disoproxil fumarate in treatment-naive adults: week 96 results of the DRIVE-AHEAD trial. Clin Infect Dis 2021;73:33-42',
        identifier: '10.1093/cid/ciaa822',
        kind: 'doi',
      },
      {
        label:
          'Molina JM, Squires K, Sax PE, et al. Doravirine versus ritonavir-boosted darunavir in antiretroviral-naive adults with HIV-1 (DRIVE-FORWARD): 48-week results of a randomised, double-blind, phase 3, non-inferiority trial. Lancet HIV 2018;5:e211-e220',
        identifier: '10.1016/S2352-3018(18)30021-3',
        kind: 'doi',
      },
      {
        label:
          'Molina JM, Squires K, Sax PE, et al. Doravirine versus ritonavir-boosted darunavir in antiretroviral-naive adults with HIV-1 (DRIVE-FORWARD): 96-week results. Lancet HIV 2020;7:e16-e26',
        identifier: '10.1016/S2352-3018(19)30336-4',
        kind: 'doi',
      },
      {
        label:
          'Thompson M, Orkin C, Molina JM, et al. Once-daily doravirine for initial treatment of adults living with HIV-1: an integrated safety analysis. Clin Infect Dis 2020;70:1336-1343',
        identifier: '10.1093/cid/ciz423',
        kind: 'doi',
      },
      {
        label:
          'Kumar P, Johnson M, Molina JM, et al. Brief report: switching to DOR/3TC/TDF maintains HIV-1 virologic suppression through week 144 in the DRIVE-SHIFT trial. J Acquir Immune Defic Syndr 2021;87:801-805',
        identifier: '10.1097/QAI.0000000000002642',
        kind: 'doi',
      },
      {
        label:
          'Walmsley SL, Kumar PN, Orkin C, et al. Efficacy and safety of doravirine-based regimens by sex and race: long-term results from three phase 3 clinical trials. Open Forum Infect Dis 2025;12:ofaf356',
        identifier: '10.1093/ofid/ofaf356',
        kind: 'doi',
      },
      {
        label:
          'Orkin C, Koethe JR, Kumar PN, et al. Factors associated with weight change after continuing or switching to a doravirine-based regimen. Open Forum Infect Dis 2025;12:ofaf639',
        identifier: '10.1093/ofid/ofaf639',
        kind: 'doi',
      },
      {
        label:
          'Gupta RK, Gregson J, Parkin N, et al. HIV-1 drug resistance before initiation or re-initiation of first-line antiretroviral therapy in low-income and middle-income countries: a systematic review and meta-regression analysis. Lancet Infect Dis 2018;18:346-355',
        identifier: '10.1016/S1473-3099(17)30702-8',
        kind: 'doi',
      },
      {
        label:
          'DRIVE-FORWARD: doravirine versus ritonavir-boosted darunavir in treatment-naive adults',
        identifier: 'NCT02275780',
        kind: 'nct',
      },
      {
        label:
          'DRIVE-AHEAD: doravirine-lamivudine-tenofovir disoproxil versus efavirenz-emtricitabine-tenofovir disoproxil',
        identifier: 'NCT02403674',
        kind: 'nct',
      },
      {
        label:
          'DRIVE-SHIFT: switch to doravirine-lamivudine-tenofovir disoproxil in suppressed adults',
        identifier: 'NCT02397096',
        kind: 'nct',
      },
      {
        label:
          'PIFELTRO (doravirine) — Drugs@FDA application NDA 210806, Merck Sharp and Dohme, original approval 30 August 2018',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=210806',
        kind: 'regulatory',
      },
      {
        label:
          'DELSTRIGO (doravirine, lamivudine and tenofovir disoproxil fumarate) — Drugs@FDA application NDA 210807, Merck Sharp and Dohme',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=210807',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 58460047 — doravirine structure record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/58460047',
        kind: 'url',
      },
    ],
  },
]
