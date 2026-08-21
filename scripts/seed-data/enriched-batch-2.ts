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
]
