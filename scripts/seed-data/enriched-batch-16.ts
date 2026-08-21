import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the bone and mineral group: the bisphosphonates that dominate
 * osteoporosis prescribing, the selective estrogen receptor modulator, the two anabolic agents
 * that build bone rather than preserve it, and the calcium, vitamin D and parathyroid drugs the
 * whole field is built on top of.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov v2 API or the openFDA label endpoint at the time of writing.
 * Sample sizes, relative risks, confidence intervals and p-values are copied from the published
 * abstract or from the FDA label, never from memory. Where a number could not be sourced, the
 * field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. BONE MINERAL DENSITY IS A SURROGATE AND FRACTURE IS THE OUTCOME. Almost every drug here can
 *    be shown to raise a number on a scan. Only some of them have been shown to stop a bone
 *    breaking, and the two facts come apart hardest in the primary-prevention populations. Where a
 *    trial measured density and not fracture, the page says so.
 *
 * 2. A VERTEBRAL FRACTURE IN THESE TRIALS IS USUALLY A RADIOGRAPHIC ONE. The commonest primary
 *    endpoint in this group is a morphometric vertebral fracture: a vertebra that lost 20% of its
 *    height between two research radiographs. Most were never noticed by the patient. Clinical
 *    fractures — the ones that hurt, present to a hospital, or break a hip — are usually the
 *    secondary endpoint, and are the harder result.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: no per-molecule
 *    cost-of-production study for these medicines could be resolved and verified at the time of
 *    writing, and an unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, DURATION-SELECTION, MONITORING OR PROCUREMENT GUIDANCE. Strengths, intervals and
 *    infusion schedules appear only where they are part of a trial's description or a product's
 *    identity. Nothing here tells a reader what to take, for how long, how to have it monitored,
 *    or where to obtain it. The question of how long to stay on a bisphosphonate is discussed on
 *    these pages only as a description of what the FLEX trial measured and what the label now
 *    concedes it does not know.
 *
 * 5. THE RARE HARMS IN THIS GROUP ARRIVED AFTER APPROVAL AND FROM REGISTRIES. Osteonecrosis of the
 *    jaw and atypical femoral fracture were both found by clinicians reporting cases, not by
 *    registration trials, which were too small and too short to see events at a rate of a few per
 *    ten thousand patient-years. Where a randomised trial later looked for them and was
 *    underpowered, the page says underpowered rather than negative.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; no verified per-dose figure for the bone and mineral medicines on these pages could be resolved at the time of writing, so none is stated',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_16_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Alendronate — the drug that made osteoporosis treatable at scale, and the one whose own
  //    primary-prevention trial missed its endpoint.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'alendronate',
    name: 'Alendronate',
    tradeName: 'Fosamax / Binosto',
    sponsor:
      'Merck & Co. (originator, Fosamax, approved 1995); the United States application holder on this record is Organon, and the molecule is made generically worldwide',
    targetGene: 'FDPS — farnesyl diphosphate synthase, a human gene, in the osteoclast',
    targetProtein:
      'Farnesyl diphosphate synthase, the mevalonate-pathway enzyme that supplies the lipid anchors small GTPases need',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Treatment and prevention of osteoporosis in postmenopausal women; treatment to increase bone mass in men with osteoporosis; treatment of glucocorticoid-induced osteoporosis; treatment of Paget disease of bone. The label adds a limitation of use: optimal duration of use has not been determined',
    patientFriendlyIndication: 'Thinning, fragile bones that break more easily than they should',
    anatomicalSite:
      'The resorption pit under an osteoclast on a bone surface — the drug binds the mineral, and the cell swallows it while digging',
    conditionContext: {
      conditionExplainer:
        'Bone is not inert. It is taken apart and rebuilt continuously by two cell types working against each other. After menopause the demolition cells run faster than the builders, so bone is lost year after year until a vertebra collapses or a hip breaks in a fall that should not have broken anything.',
      whyItMatters:
        'A hip fracture at 80 is not a broken bone in the way a broken wrist at 30 is. It is a hospital admission, an operation and a large chance of never walking as well again. Alendronate is the first drug that was shown in a randomised trial to make that event less likely.',
      whoTakesThis:
        'Postmenopausal women with osteoporosis, men with osteoporosis, people taking long-term glucocorticoids, and people with Paget disease of bone.',
      clinicalGoals:
        'Fewer fractures. Bone mineral density on a scan is the number that gets watched, and it is a surrogate for the thing that matters, which is whether a bone breaks.',
    },
    oneSentenceVerdict:
      'A mineral-seeking molecule that osteoclasts swallow while dissolving bone and that shuts down the enzyme they need to keep working — in 2027 women who already had a spinal fracture it cut new radiographic spinal fractures from 15.0% to 8.0% over three years and hip fractures by about half, but in 4432 women without a prior spinal fracture the same trial missed its primary endpoint, reducing clinical fractures only from 312 to 272 events.',
    laymanHowItWorks:
      'Bone is constantly dissolved and rebuilt. Alendronate sticks to bone mineral like a magnet, and it sticks hardest exactly where the demolition cells are working. When one of those cells dissolves the surface underneath it, it swallows the drug with the mineral. Inside the cell the drug blocks an enzyme the cell needs to keep its grip and its digestive machinery, so demolition slows and the builders catch up.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2842 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 29 September 1995 as Fosamax. Composition-of-matter protection expired in 2008 and the molecule is now made by many manufacturers; it is on the WHO Model List of Essential Medicines. At roughly twenty-eight United States cents a tablet, price is not the reason people stop taking it.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison inside this class is not effectiveness but who a drug has been shown to work in, and how long it stays in the body after it is stopped. Alendronate has the largest fracture dataset of the oral bisphosphonates. Zoledronic acid is the same mechanism given once a year into a vein and is the only member of the class with a randomised survival signal. Calcium and vitamin D are not substitutes for it: every one of the trials on this page gave both to the placebo group as well.',
      conventionalRx: [
        {
          name: 'Risedronate',
          class: 'Nitrogen-containing bisphosphonate, oral',
          howItCompares:
            'The same mechanism with a pyridine nitrogen instead of an alkylamine, which makes it a much stronger inhibitor of the target enzyme in the test tube — 3.9 nanomolar against 460 for alendronate — without making it a better drug. It is the only oral bisphosphonate whose hip-fracture reduction was the declared primary endpoint of its own trial.',
          typicalCost:
            'US$2.01 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 13 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: hip fracture was the primary endpoint in a 9331-woman trial and was met; a delayed-release form exists for people who cannot take a tablet fasting. Cons: roughly seven times the acquisition cost of alendronate; in the same trial it did not reduce hip fracture in women selected on falls risk rather than bone density.',
        },
        {
          name: 'Zoledronic acid',
          class: 'Nitrogen-containing bisphosphonate, intravenous, once yearly',
          howItCompares:
            'Removes the swallowing problem entirely, which is the commonest reason oral bisphosphonates fail. It reduced hip fracture by 41% in HORIZON-PFT and, given after a hip fracture in HORIZON-RFT, was associated with 28% fewer deaths from any cause — the only mortality signal in this file.',
          typicalCost:
            'US$0.4774 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: one infusion a year, no oesophageal problem, hip fracture and mortality data. Cons: an acute-phase reaction with fever and aching after the first infusion in a large minority; serious atrial fibrillation was significantly more common in HORIZON-PFT, 50 patients against 20.',
        },
        {
          name: 'Denosumab',
          class: 'Monoclonal antibody against RANK ligand, subcutaneous every six months',
          howItCompares:
            'Blocks the signal that makes osteoclasts rather than poisoning them, and is not stored in bone. That last difference cuts both ways: the effect stops when the drug stops, and rebound vertebral fractures have been reported after discontinuation, which does not happen with a bisphosphonate.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for denosumab was held on this record at the time of writing',
          prosAndCons:
            'Pros: no oesophageal or renal-clearance constraint; larger density gains that keep accruing. Cons: the effect is fully reversible on stopping and the rebound is a recognised harm, so it is not a drug that can simply be discontinued.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary calcium (dairy, tinned fish with bones, fortified plant drinks)',
          activeCompound: 'Calcium',
          biologicalMechanism:
            'Supplies the mineral the builder cells deposit. It does not slow the demolition cells, which is what alendronate does, so it addresses a different half of the problem.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. Every trial on this page gave calcium and vitamin D to the placebo group as well, so the drug effects shown are effects on top of replacement, not instead of it.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
        {
          name: 'Weight-bearing and resistance exercise',
          activeCompound: 'Mechanical loading',
          biologicalMechanism:
            'Loading a bone reduces sclerostin output from osteocytes, which releases the Wnt signal that drives bone formation — the same pathway romosozumab targets with an antibody.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated: this page carries no exercise prescription. The mechanism is well characterised; the fracture evidence for exercise alone is far weaker than the fracture evidence for this drug.',
          monthlyCost: 'None',
        },
      ],
      homeRemedies: [
        {
          name: 'Say if you have had a dental extraction planned or recent',
          action:
            'Tell the prescriber and the dentist that a bisphosphonate is involved, in both directions.',
          patientImpact:
            'Osteonecrosis of the jaw is rare with oral bisphosphonates at osteoporosis exposures and much less rare at the far higher intravenous doses used in cancer. Most reported cases followed a dental procedure involving bone.',
          clinicalPrecaution:
            'This is a coordination problem, not a reason to avoid treatment. Neither the dentist nor the prescriber can weigh it without knowing what the other is doing.',
        },
        {
          name: 'Report new thigh, hip or groin pain that comes on without an injury',
          action: 'Describe it as a dull ache that has been building, not as a sudden injury.',
          patientImpact:
            'Atypical femoral fractures are usually preceded by weeks or months of thigh pain, and are the one harm on this page whose risk rises the longer the drug is taken.',
          clinicalPrecaution:
            'The Swedish national analysis put the absolute excess at about 5 cases per 10,000 patient-years, against a hip-fracture reduction an order of magnitude larger. Small does not mean absent, and prodromal pain is the thing that is actionable.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(CC(O)(P(=O)(O)O)P(=O)(O)O)CN',
      chemicalFormula: 'C4H13NO7P2',
      molecularWeight: '249.10 g/mol',
      targetReceptorAffinity:
        'Inhibits recombinant human farnesyl diphosphate synthase with an IC50 of 460 nM after 15 minutes of preincubation, and the same enzyme in a liver cytosolic extract at 1700 nM. It does not inhibit isopentenyl diphosphate isomerase or geranylgeranyl diphosphate synthase, which is what identifies farnesyl diphosphate synthase as the selective target rather than the pathway generally. Mice given radiolabelled alendronate showed about 10-fold higher uptake on osteoclast surfaces than on osteoblast surfaces.',
      structureSource: {
        label:
          'PubChem CID 2088 (alendronic acid) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2088',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'aln-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and purity of the 4-aminobutyric acid starting material',
          description:
            'Confirm chain length before any phosphonylation. The nitrogen-to-phosphorus distance is what decides potency across this class: shortening the chain by one carbon gives pamidronate, a weaker enzyme inhibitor, and the two are otherwise chemically almost indistinguishable by simple assay.',
          reagentsAndBuffer:
            '4-aminobutyric acid reference standard, 1H and 13C NMR in deuterium oxide, ion chromatography for chloride and sulfate, Karl Fischer titration for water',
        },
        {
          id: 'aln-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bisphosphonylation of the carboxylic acid to the geminal bisphosphonate',
          description:
            'React the amino acid with phosphorous acid and phosphorus trichloride so that the carboxyl carbon ends up carrying two phosphonate groups and a hydroxyl. That geminal P-C-P motif is the whole molecule: it mimics pyrophosphate closely enough to bind bone mineral, and unlike pyrophosphate it cannot be hydrolysed, which is why the terminal half-life in humans is estimated to exceed ten years.',
          dependsOnStepId: 'aln-w1',
          reagentsAndBuffer:
            'Phosphorous acid, phosphorus trichloride, methanesulfonic acid or sulfolane as reaction medium, controlled addition below 65C, aqueous hydrolysis quench',
        },
        {
          id: 'aln-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation as the monosodium trihydrate',
          description:
            'Adjust pH to precipitate the monosodium salt and crystallise it as the trihydrate, which is the form in the tablet. Water content is not a detail here: the hydrate state changes the crystal habit and the dissolution behaviour of a drug whose oral bioavailability is already only about 0.64%.',
          dependsOnStepId: 'aln-w2',
          reagentsAndBuffer:
            'Sodium hydroxide to target pH, water and ethanol antisolvent crystallisation, Karl Fischer and thermogravimetric analysis for hydrate stoichiometry, ion chromatography for residual phosphite',
        },
        {
          id: 'aln-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Osteoclast resorption assay on a mineralised substrate',
          description:
            'Culture osteoclasts on dentine or bone slices with the compound adsorbed to the mineral, then count and measure the pits they excavate. This is the step that distinguishes the drug from an enzyme inhibitor: the molecule reaches the cell only because the cell dissolves the mineral it is bound to, so an assay in free solution measures the wrong thing.',
          dependsOnStepId: 'aln-w3',
          reagentsAndBuffer:
            'Primary osteoclasts or RANKL-differentiated RAW 264.7 cells, dentine discs, alpha-MEM with 10% fetal bovine serum, toluidine blue staining, reflected-light microscopy with pit area morphometry',
        },
        {
          id: 'aln-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Farnesyl diphosphate synthase inhibition and prenylation readout',
          description:
            'Measure inhibition of recombinant human farnesyl diphosphate synthase, and separately confirm the downstream consequence by tracking incorporation of labelled mevalonolactone into small prenylated proteins in osteoclasts. The second readout is the one that closes the argument, because enzyme inhibition in a tube does not prove the cell lost its prenylated GTPases.',
          dependsOnStepId: 'aln-w4',
          reagentsAndBuffer:
            'Recombinant human FDPS, isopentenyl and dimethylallyl diphosphate substrates, tritiated mevalonolactone, SDS-PAGE with fluorography for the 18-25 kDa prenylated protein band, scintillation counting of nonsaponifiable lipids',
        },
      ],
    },
    keyAudits: [
      {
        id: 'aln-a1',
        category: 'measured',
        title: 'In women who had already fractured a vertebra, it halved the next one',
        laymanSummary:
          'Two thousand women who had already broken a bone in their spine were given the drug or a dummy tablet for three years. Eight in a hundred on the drug had a new spinal fracture on x-ray, against fifteen in a hundred on the dummy.',
        technicalDetails:
          'The Fracture Intervention Trial vertebral-fracture arm randomised 2027 women aged 55 to 81 with low femoral-neck bone density and at least one existing vertebral fracture to placebo (1005) or alendronate (1022) for 36 months. New morphometric vertebral fracture, the primary endpoint, occurred in 78 (8.0%) on alendronate against 145 (15.0%) on placebo, relative risk 0.53 (95% CI 0.41 to 0.68). Clinically apparent vertebral fractures were 2.3% against 5.0%, relative hazard 0.45 (0.27 to 0.72). Any clinical fracture, the main secondary endpoint, was 13.6% against 18.2%, relative hazard 0.72 (0.58 to 0.90). Hip fracture relative hazard was 0.49 (0.23 to 0.99) and wrist 0.52 (0.31 to 0.87). Follow-up radiographs were obtained for 98% of surviving participants.',
        evidenceSource:
          'Black DM et al., Lancet 1996;348:1535-1541 (Fracture Intervention Trial, vertebral fracture arm)',
        doi: '10.1016/s0140-6736(96)07088-2',
        measuredMetric:
          'New morphometric vertebral fracture at 36 months, 8.0% against 15.0%, RR 0.53 (95% CI 0.41 to 0.68)',
        auditFlag: 'verified',
      },
      {
        id: 'aln-a2',
        category: 'failed',
        title: 'In women who had not yet fractured, the trial missed its primary endpoint',
        laymanSummary:
          'The other half of the same trial enrolled women with thin bones but no spinal fracture. Over four years it did not significantly reduce the fractures that actually present to a doctor. It worked only in the subgroup whose hip density was already in the osteoporotic range.',
        technicalDetails:
          'The Fracture Intervention Trial clinical-fracture arm randomised 4432 women aged 54 to 81 with femoral-neck bone mineral density of 0.68 g/cm2 or less and no vertebral fracture, for an average of 4.2 years. Clinical fractures fell from 312 to 272 events, a 14% reduction that did not reach significance: relative hazard 0.86 (95% CI 0.73 to 1.01). In the prespecified subgroup with femoral-neck T-score below -2.5, the reduction was 36% (RH 0.64, 95% CI 0.50 to 0.82, number needed to treat 15); in women with higher density there was no reduction at all (RH 1.08, 95% CI 0.87 to 1.35). Radiographic vertebral fracture, a secondary endpoint, did fall by 44% (RR 0.56, 95% CI 0.39 to 0.80), with a number needed to treat of 60.',
        evidenceSource: 'Cummings SR et al., JAMA 1998;280:2077-2082 (FIT clinical fracture arm)',
        doi: '10.1001/jama.280.24.2077',
        measuredMetric:
          'Clinical fracture over 4.2 years, relative hazard 0.86 (95% CI 0.73 to 1.01) — confidence interval crosses 1',
        auditFlag: 'caution',
      },
      {
        id: 'aln-a3',
        category: 'measured',
        title: 'The enzyme it inhibits was identified, and it is not the obvious one',
        laymanSummary:
          'For years the drug was described as simply poisoning the demolition cells. The specific enzyme was pinned down in 2000, and it sits in the same chemical pathway that statins act on, several steps further along.',
        technicalDetails:
          'Bergstrom and colleagues narrowed the candidate targets by HPLC analysis of products from liver cytosolic extract and then tested each recombinant enzyme. Alendronate inhibited recombinant human farnesyl diphosphate synthase with an IC50 of 460 nM, and the liver extract activity at 1700 nM. It did not inhibit isopentenyl diphosphate isomerase or geranylgeranyl diphosphate synthase at all. Pamidronate gave 500 nM and risedronate 3.9 nM on the same enzyme; etidronate was negligible at 80 micromolar and clodronate inactive, which is the structural evidence that non-nitrogen bisphosphonates work by a different mechanism entirely. In purified osteoclasts alendronate inhibited incorporation of tritiated mevalonolactone into 18-25 kDa proteins, the small GTPase band.',
        evidenceSource: 'Bergstrom JD et al., Arch Biochem Biophys 2000;373:231-241',
        doi: '10.1006/abbi.1999.1502',
        measuredMetric:
          'IC50 460 nM against recombinant human farnesyl diphosphate synthase; no inhibition of IPP isomerase or GGPP synthase',
        auditFlag: 'verified',
      },
      {
        id: 'aln-a4',
        category: 'inferred',
        title: 'Ten years of treatment has never been shown to beat five',
        laymanSummary:
          'Women who had taken the drug for five years were randomly assigned to keep going or to switch to a dummy tablet. Over the next five years the two groups broke the same number of bones outside the spine. Only the fractures that hurt in the spine were fewer on continued treatment.',
        technicalDetails:
          'FLEX randomised 1099 women with a mean of five years of prior alendronate to a further five years of alendronate (5 mg/d, n=329, or 10 mg/d, n=333) or to placebo (n=437). Total hip bone density, the primary endpoint, fell 2.4% (95% CI -2.9 to -1.8) in those who stopped, but stayed at or above pretreatment levels of ten years earlier. Cumulative nonvertebral fracture risk was identical: 19% against 18.9%, RR 1.00 (95% CI 0.76 to 1.32). Clinically recognised vertebral fractures were lower on continued treatment, 2.4% against 5.3%, RR 0.45 (0.24 to 0.85), but morphometric vertebral fractures were not, 9.8% against 11.3%, RR 0.86 (0.60 to 1.22). Fracture was an exploratory outcome, not the primary one, so the trial was not designed to answer this question.',
        evidenceSource: 'Black DM et al., JAMA 2006;296:2927-2938 (FLEX, NCT00398931)',
        doi: '10.1001/jama.296.24.2927',
        inferredClaim:
          'That longer treatment is better treatment — a bone-density argument that the only randomised comparison of five against ten years does not support outside clinical vertebral fracture',
        auditFlag: 'contested',
      },
      {
        id: 'aln-a5',
        category: 'conclusion_shift',
        title: 'Atypical femur fracture: from case reports, to an underpowered null, to a real risk',
        laymanSummary:
          'Surgeons began reporting an unusual thigh-bone fracture in long-term users. A re-analysis of the big randomised trials found the event was far too rare for those trials to settle the question. A Swedish national study of every femoral fracture in a year then showed the association is real, and small.',
        technicalDetails:
          'Black and colleagues reviewed 284 hip or femur fracture records among 14,195 women in FIT, FLEX and HORIZON-PFT and classified 12 fractures in 10 patients as subtrochanteric or diaphyseal, a combined rate of 2.3 per 10,000 patient-years. Relative hazards were 1.03 (95% CI 0.06 to 16.46) for alendronate in FIT, 1.33 (0.12 to 14.67) for continued alendronate in FLEX and 1.50 (0.25 to 9.00) for zoledronic acid in HORIZON-PFT. The authors state the study was underpowered for definitive conclusions, and the confidence intervals make that unarguable. Schilcher and colleagues then reviewed radiographs of 1234 of the 1271 Swedish women aged 55 or over with a subtrochanteric or shaft fracture in 2008, identified 59 atypical fractures, and found an age-adjusted relative risk of 47.3 (95% CI 25.6 to 87.3) with an absolute increase of 5 cases per 10,000 patient-years. Risk rose with duration (odds ratio 1.3 per 100 daily doses) and fell by 70% per year after withdrawal.',
        evidenceSource:
          'Black DM et al., N Engl J Med 2010;362:1761-1771; Schilcher J, Michaëlsson K, Aspenberg P, N Engl J Med 2011;364:1728-1737',
        doi: '10.1056/NEJMoa1010650',
        inferredClaim:
          'That the randomised trials had ruled the risk out — they had not, they were underpowered, and the confidence intervals ran from 0.06 to 16.46',
        auditFlag: 'verified',
      },
      {
        id: 'aln-a6',
        category: 'inferred',
        title: 'The label states that nobody knows how long to take it',
        laymanSummary:
          'The prescribing information carries a limitation of use saying the optimal duration has not been determined, and suggests considering stopping after three to five years in people at low risk. That is a regulator conceding an open question, not a recommendation.',
        technicalDetails:
          'The current United States label carries the limitation "Optimal duration of use has not been determined. For patients at low-risk for fracture, consider drug discontinuation after 3 to 5 years of use." This sits on top of a drug whose terminal half-life is estimated to exceed ten years, reflecting slow release from the skeleton, and which after ten years of daily treatment is releasing from bone about 25% of the amount being absorbed. A drug that keeps acting after it is stopped makes duration a different question from that for a drug cleared in a day, and no randomised trial has compared stopping points other than the five-against-ten comparison in FLEX.',
        evidenceSource:
          'Alendronate sodium United States prescribing information, Indications and Usage (Limitations of Use) and Clinical Pharmacology 12.3 (openFDA label endpoint)',
        inferredClaim:
          'That there is a known correct treatment duration — the label explicitly says there is not, and the only randomised duration comparison was powered for bone density rather than fracture',
        auditFlag: 'caution',
      },
      {
        id: 'aln-a7',
        category: 'measured',
        title: 'Almost none of a swallowed tablet is absorbed, and food abolishes it',
        laymanSummary:
          'About six-tenths of one percent of the tablet reaches the bloodstream, and only if the stomach is empty. Taken with breakfast, or up to two hours after it, essentially none is absorbed. Coffee or orange juice cuts absorption by about 60%.',
        technicalDetails:
          'Mean oral bioavailability relative to intravenous dosing is 0.64% in women across 5 to 70 mg doses after an overnight fast and two hours before breakfast, and 0.59% in men. Bioavailability is negligible when the drug is given with or up to two hours after a standardised breakfast, is reduced approximately 60% by coffee or orange juice, and is reduced approximately 50% when given 15 minutes rather than four hours before a meal. Protein binding is about 78%, there is no evidence of metabolism in animals or humans, and roughly 50% of an intravenous dose is excreted unchanged in urine within 72 hours.',
        evidenceSource:
          'Alendronate sodium United States prescribing information, Clinical Pharmacology 12.3 (openFDA label endpoint)',
        measuredMetric:
          'Mean oral bioavailability 0.64% fasting in women, 0.59% in men; negligible when taken with or within two hours after food',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and almost entirely not absorbed',
        laymanDesc:
          'The tablet has to be taken on an empty stomach because food destroys its absorption completely. Even under the best conditions only about half of one percent gets into the blood.',
        molecularDetail:
          'The geminal bisphosphonate carries two phosphonate groups and an amine, giving it a high charge at gut pH and negligible passive permeability. Mean oral bioavailability is 0.64% fasting and negligible with food; divalent cations in dairy, coffee and juice chelate the drug in the lumen, cutting absorption a further 60%.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The fraction that gets in goes straight to bone mineral',
        laymanDesc:
          'What reaches the blood does not circulate for long. Roughly half is passed in urine and the rest sticks to bone, where it stays for years.',
        molecularDetail:
          'The P-C-P backbone chelates calcium in hydroxyapatite with high affinity, so plasma concentrations after therapeutic oral doses stay below 5 ng/mL, too low for routine analytical detection. Steady-state volume of distribution excluding bone is at least 28 L. The terminal half-life exceeds ten years, reflecting slow release from the skeleton rather than slow clearance from plasma.',
        iconName: 'Magnet',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'It concentrates exactly where bone is being dissolved',
        laymanDesc:
          'The drug binds hardest to freshly exposed mineral, which is where the demolition cells are working. That is why it accumulates under those cells rather than spreading evenly.',
        molecularDetail:
          'Radiolabelled alendronate showed roughly 10-fold higher uptake on osteoclast surfaces than on osteoblast surfaces in mice. Under a resorbing osteoclast the sealing zone maintains a pH near 4.5, which liberates bound drug from the mineral into a small, very high local concentration.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The cell swallows the drug along with the mineral it is dissolving',
        laymanDesc:
          'The demolition cell cannot take the mineral apart without taking the drug in with it. It poisons itself by doing its own job.',
        molecularDetail:
          'Liberated bisphosphonate enters the osteoclast by fluid-phase endocytosis of the resorption lacuna contents, then escapes the endosome into the cytosol. Uptake is therefore proportional to resorptive activity, which is the pharmacological reason the drug is selective for the cell type it acts on without any targeting ligand.',
        iconName: 'Download',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Inside, it blocks the enzyme that makes the cell’s lipid anchors',
        laymanDesc:
          'The cell needs a particular chemical tag to attach several of its own control proteins to its inner membrane. The drug blocks the enzyme that makes that tag, and the control proteins stop working.',
        molecularDetail:
          'Alendronate inhibits farnesyl diphosphate synthase with an IC50 of 460 nM, depleting farnesyl and geranylgeranyl diphosphate. Small GTPases including Rab, Rho and Rac lose their prenyl anchors and cannot localise to membrane, so vesicle trafficking and cytoskeletal control fail. The osteoclast still attaches to bone but loses its ruffled border, the folded membrane through which acid and protease are secreted.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Demolition slows, building continues, and fewer bones break',
        laymanDesc:
          'With the demolition side suppressed, the building side keeps filling in and density rises. The point of that is fewer fractures, and in women who had already fractured, fractures roughly halved.',
        molecularDetail:
          'Resorption falls with no direct effect on formation, though formation eventually declines too because the two are coupled through the remodelling cycle. Histomorphometry in baboons and rats shows fewer remodelling sites with formation exceeding resorption at those remaining. The clinical translation is a 47% reduction in new morphometric vertebral fracture over three years in women with a prior vertebral fracture, and no significant clinical-fracture reduction in women without one.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Fracture Intervention Trial, vertebral fracture arm (Black 1996)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2027,
        primaryEndpoint: 'New morphometric vertebral fracture at 36 months',
        endpointMet: true,
        statisticalPValue: '8.0% against 15.0%; relative risk 0.53 (95% CI 0.41 to 0.68)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fracture Intervention Trial, clinical fracture arm (Cummings 1998)',
        phase: 'Phase 3, randomised, blinded, placebo-controlled',
        sampleSize: 4432,
        primaryEndpoint: 'Clinical fractures confirmed by radiograph report over a mean 4.2 years',
        endpointMet: false,
        statisticalPValue:
          '272 against 312 events; relative hazard 0.86 (95% CI 0.73 to 1.01) — not significant',
        unreportedAdverseSignals:
          'The trial is widely cited as positive on the strength of its subgroup and its secondary radiographic endpoint. The declared primary endpoint in the whole randomised population was not met.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'FLEX — FIT Long-term Extension (NCT00398931)',
        phase: 'Phase 4, randomised, double-blind, withdrawal design',
        sampleSize: 1099,
        primaryEndpoint: 'Total hip bone mineral density after five further years',
        endpointMet: true,
        statisticalPValue:
          'Hip density -2.4% (95% CI -2.9 to -1.8) on stopping, P<0.001; nonvertebral fracture RR 1.00 (0.76 to 1.32)',
        unreportedAdverseSignals:
          'The primary endpoint was a bone-density measurement, and fracture was exploratory. A reader looking for whether ten years beats five on fracture is reading an underpowered secondary analysis.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Pooled secondary analysis of FIT, FLEX and HORIZON-PFT for atypical femur fracture (Black 2010)',
        phase: 'Secondary analysis of three randomised trials',
        sampleSize: 14195,
        primaryEndpoint: 'Subtrochanteric or diaphyseal femur fracture',
        endpointMet: false,
        statisticalPValue:
          '12 fractures in 10 patients, 2.3 per 10,000 patient-years; alendronate relative hazard 1.03 (95% CI 0.06 to 16.46)',
        unreportedAdverseSignals:
          'The authors state the analysis was underpowered for definitive conclusions. A confidence interval running from 0.06 to 16.46 excludes essentially nothing, and this result was frequently reported as reassurance.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'New morphometric vertebral fracture 8.0% against 15.0% over three years in 2027 women with a prior vertebral fracture, RR 0.53 (95% CI 0.41 to 0.68)',
        'Hip fracture relative hazard 0.49 (95% CI 0.23 to 0.99) in the same population',
        'Inhibition of recombinant human farnesyl diphosphate synthase at IC50 460 nM, with no inhibition of two neighbouring pathway enzymes',
        'Mean oral bioavailability 0.64% fasting, and negligible when taken with food',
      ],
      unsupportedInferences: [
        'That the fracture benefit shown in women with a prior vertebral fracture transfers to women with only low bone density — the primary endpoint in that population was not met',
        'That continuing beyond five years is better than stopping, when the one randomised comparison found identical nonvertebral fracture rates',
        'That a rise in bone mineral density on a scan is itself the benefit, rather than a surrogate for the fracture that did or did not happen',
        'That the randomised trials ruled out atypical femoral fracture, when the pooled analysis says in its own conclusion that it was underpowered',
      ],
      whatFailedInitially: [
        'The primary-prevention arm of the pivotal trial missed its primary endpoint: clinical fracture relative hazard 0.86 (95% CI 0.73 to 1.01) in 4432 women',
        'In women whose femoral-neck density was above the osteoporotic threshold there was no reduction at all, relative hazard 1.08 (0.87 to 1.35)',
        'Osteonecrosis of the jaw and atypical femoral fracture were both found after approval by clinicians reporting cases, not by the registration programme',
        'FLEX could not answer the duration question it was run to answer, because it was powered for bone density and treated fracture as exploratory',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1995 and now on the WHO Model List of Essential Medicines, at roughly twenty-eight cents a tablet',
        'The label was amended to concede that optimal duration is unknown and to raise discontinuation after three to five years in people at low risk',
        'The Swedish national analysis established atypical femoral fracture as a real, duration-dependent and small excess of about 5 cases per 10,000 patient-years, reversible on stopping',
        'It remains the comparator any new osteoporosis drug has to beat, which is what the romosozumab trial in this file was designed to do',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, including a 70 mg effervescent formulation',
      description:
        'Taken fasting with plain water and with the patient upright afterwards, because absorption is negligible with food and the molecule is directly irritant to the oesophagus if it lodges there. The effervescent tablet exists to reduce that second problem by delivering the drug already in solution.',
      safetyProfile:
        'No boxed warning. Oesophagitis, oesophageal ulceration and erosion are the characteristic label warnings and drove the administration requirements. Osteonecrosis of the jaw and atypical subtrochanteric or diaphyseal femoral fracture are class warnings established after approval; the Swedish national estimate of the excess atypical fracture rate is about 5 cases per 10,000 patient-years, duration-dependent, and falling 70% per year after the drug is stopped. In FIT there was no significant difference between groups in adverse experiences, including upper gastrointestinal disorders.',
    },
    commonQuestions: [
      {
        q: 'Does it actually stop hip fractures, or just improve my scan?',
        a: 'Both, but the two are not the same evidence. In 2027 women who had already fractured a vertebra, the hip-fracture relative hazard was 0.49 with a confidence interval of 0.23 to 0.99 — a real reduction, and one that only just cleared significance. In the 4432 women who had low density but no prior vertebral fracture, the trial did not significantly reduce clinical fractures overall. The scan number improves in everyone. The fracture reduction is best evidenced in people who have already broken something, which is also the population at highest risk.',
        auditNote:
          'This is the single most important distinction on the page, and it is the one most often collapsed. A drug can raise a density number in a population it does not measurably protect.',
      },
      {
        q: 'Why do I have to take it on an empty stomach and stay upright?',
        a: 'Two separate reasons. Absorption is about six-tenths of one percent even under ideal conditions and falls to essentially zero if the tablet meets food, calcium, coffee or juice, because the molecule binds those cations in the gut. Separately, the molecule is directly irritant to the lining of the oesophagus, and the label warnings for oesophagitis and ulceration come from tablets that lodged on the way down. Staying upright is about the second problem, fasting is about the first.',
      },
      {
        q: 'Should I stop after five years?',
        a: 'That is a decision for the prescriber, and this page will not make it. What can be reported is what was measured. FLEX randomised 1099 women who had already taken alendronate for five years either to continue or to stop. Over the next five years nonvertebral fractures were identical, 19% against 18.9%. Clinically recognised vertebral fractures were lower on continued treatment, 2.4% against 5.3%. Bone density fell after stopping but stayed at or above where it had been ten years earlier, because the drug is still being released from the skeleton. The label itself says the optimal duration has not been determined.',
        auditNote:
          'FLEX was powered for a bone-density endpoint. Its fracture results are exploratory, which means they are the best available evidence and still not a definitive answer.',
      },
      {
        q: 'What about the unusual thigh fractures I have read about?',
        a: 'They are real, they are rare, and the risk rises with how long the drug has been taken. The Swedish national study reviewed radiographs of nearly every subtrochanteric or shaft femoral fracture in women aged 55 and over in one year, found 59 atypical fractures, and estimated the absolute excess at about 5 cases per 10,000 patient-years. Risk rose about 30% per 100 additional daily doses and fell by 70% for each year since the drug was stopped. For comparison, the hip fractures prevented in the trial population run an order of magnitude higher than that. The practical point is the warning sign: these fractures are usually preceded by weeks or months of dull thigh, hip or groin pain.',
      },
      {
        q: 'How is this different from calcium and vitamin D?',
        a: 'They address different halves of the problem, and the trials answer the question directly. Calcium supplies the mineral the builder cells lay down. Alendronate suppresses the cells that take bone apart. In the Fracture Intervention Trial, everyone reporting a calcium intake of 1000 mg a day or less received a supplement with 500 mg of calcium and 250 IU of cholecalciferol — including the placebo group. So the fracture reductions on this page are reductions on top of calcium and vitamin D, not instead of them.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Black DM et al. Randomised trial of effect of alendronate on risk of fracture in women with existing vertebral fractures. Lancet 1996;348:1535-1541',
        identifier: '10.1016/s0140-6736(96)07088-2',
        kind: 'doi',
      },
      {
        label:
          'Cummings SR et al. Effect of alendronate on risk of fracture in women with low bone density but without vertebral fractures: results from the Fracture Intervention Trial. JAMA 1998;280:2077-2082',
        identifier: '10.1001/jama.280.24.2077',
        kind: 'doi',
      },
      {
        label:
          'Black DM et al. Effects of continuing or stopping alendronate after 5 years of treatment: the Fracture Intervention Trial Long-term Extension (FLEX). JAMA 2006;296:2927-2938',
        identifier: '10.1001/jama.296.24.2927',
        kind: 'doi',
      },
      {
        label:
          'Black DM et al. Bisphosphonates and fractures of the subtrochanteric or diaphyseal femur. N Engl J Med 2010;362:1761-1771',
        identifier: '10.1056/NEJMoa1001086',
        kind: 'doi',
      },
      {
        label:
          'Schilcher J, Michaëlsson K, Aspenberg P. Bisphosphonate use and atypical fractures of the femoral shaft. N Engl J Med 2011;364:1728-1737',
        identifier: '10.1056/NEJMoa1010650',
        kind: 'doi',
      },
      {
        label:
          'Bergstrom JD et al. Alendronate is a specific, nanomolar inhibitor of farnesyl diphosphate synthase. Arch Biochem Biophys 2000;373:231-241',
        identifier: '10.1006/abbi.1999.1502',
        kind: 'doi',
      },
      {
        label:
          'FLEX — Fracture Intervention Trial Long-term Extension, ClinicalTrials.gov registration',
        identifier: 'NCT00398931',
        kind: 'nct',
      },
      {
        label:
          'Alendronate sodium United States prescribing information (openFDA label endpoint) — indications, limitations of use, clinical pharmacology and warnings',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22alendronate+sodium%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Risedronate — a thousand times the enzyme potency of alendronate in a test tube, and the
  //    only oral bisphosphonate whose hip-fracture trial declared hip fracture as the endpoint.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'risedronate',
    name: 'Risedronate',
    tradeName: 'Actonel / Atelvia',
    sponsor:
      'Procter & Gamble Pharmaceuticals (originator, Actonel, approved 1998), co-promoted with Aventis; the United States application holder on this record is Apil, and the molecule is made generically',
    targetGene: 'FDPS — farnesyl diphosphate synthase, a human gene, in the osteoclast',
    targetProtein:
      'Farnesyl diphosphate synthase, inhibited about a hundred times more potently than by alendronate on the isolated enzyme',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Treatment and prevention of postmenopausal osteoporosis; treatment to increase bone mass in men with osteoporosis; treatment and prevention of glucocorticoid-induced osteoporosis; treatment of Paget disease of bone. The label carries the same limitation of use as alendronate: optimal duration has not been determined',
    patientFriendlyIndication: 'Thinning, fragile bones that break more easily than they should',
    anatomicalSite:
      'The resorption pit under an osteoclast — the same site as alendronate, reached the same way',
    conditionContext: {
      conditionExplainer:
        'Bone is dismantled and rebuilt continuously. After menopause the dismantling side runs ahead of the rebuilding side, and bone is lost until something breaks under a load it should have carried.',
      whyItMatters:
        'This is the drug that answers a question alendronate never asked directly. Its Hip Intervention Program enrolled 9331 elderly women and named hip fracture, not a radiographic spinal fracture, as the primary endpoint. That is the hardest endpoint in the field, and the trial met it in one of its two populations and missed it in the other.',
      whoTakesThis:
        'Postmenopausal women with or at risk of osteoporosis, men with osteoporosis, people on long-term glucocorticoids, and people with Paget disease of bone.',
      clinicalGoals:
        'Fewer fractures. The Cochrane synthesis is unusually explicit about which fractures: non-vertebral and hip in people who already have osteoporosis, and nothing demonstrable in people who do not.',
    },
    oneSentenceVerdict:
      'A pyridine bisphosphonate that inhibits the osteoclast’s farnesyl diphosphate synthase at 3.9 nanomolar — a hundred times more potently than alendronate on the isolated enzyme, without being a better drug — and that cut hip fractures from 3.2% to 1.9% in 5445 women aged 70 to 79 with osteoporosis while doing nothing measurable, 4.2% against 5.1%, in 3886 women aged 80 and over selected on falls risk instead of bone density.',
    laymanHowItWorks:
      'Like alendronate it sticks to bone mineral and is swallowed by the cells that dissolve bone. Inside them it blocks the same enzyme, and it blocks it far harder. That extra potency does not translate into a better result in people, because how much drug reaches the cell is set by how strongly it binds the mineral and how much of the tablet was absorbed, not by how tightly it grips the enzyme.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 82,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$2.01 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 13 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1998 and generic since 2014. It still costs roughly seven times as much per unit as generic alendronate at pharmacy acquisition, which is a market outcome rather than a manufacturing one: the two molecules are made by similar chemistry at similar scale.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Within the oral bisphosphonates the choice is close to arbitrary on fracture evidence and turns on cost, tolerance and whether a person can manage a fasting tablet. The one distinguishing fact for risedronate is that hip fracture was the declared primary endpoint of a 9331-woman trial rather than a secondary outcome. The one distinguishing fact against it is that it costs several times more than alendronate for the same class effect.',
      conventionalRx: [
        {
          name: 'Alendronate',
          class: 'Nitrogen-containing bisphosphonate, oral',
          howItCompares:
            'Weaker on the isolated enzyme, 460 nM against 3.9 nM, and with the larger fracture dataset. Its pivotal trial reduced radiographic vertebral fracture from 15.0% to 8.0% in women who had already fractured, and its hip-fracture result was a secondary outcome that only just cleared significance.',
          typicalCost:
            'US$0.2842 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: roughly a seventh of the acquisition cost; the largest randomised dataset in the class. Cons: its primary-prevention arm missed its primary endpoint, and hip fracture was never its declared primary endpoint anywhere.',
        },
        {
          name: 'Zoledronic acid',
          class: 'Nitrogen-containing bisphosphonate, intravenous, once yearly',
          howItCompares:
            'Bypasses the absorption problem that limits both oral drugs to under 1% bioavailability. Hip fracture was a co-primary endpoint in HORIZON-PFT and was reduced 41%.',
          typicalCost:
            'US$0.4774 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no fasting requirement, no oesophageal risk, annual administration. Cons: a first-infusion acute-phase reaction is common; serious atrial fibrillation was significantly more frequent in its pivotal trial.',
        },
        {
          name: 'Risedronate delayed-release (Atelvia)',
          class: 'Same molecule in an enteric, chelating-agent formulation',
          howItCompares:
            'Designed for people who cannot manage a fasting tablet. Its bioavailability after a high-fat breakfast is similar to the immediate-release tablet dosed four hours before a meal, and two to four times greater than the immediate-release tablet taken 30 minutes before a high-fat breakfast.',
          typicalCost:
            'Not separately priced on this record; the NADAC figure above is the median across listed risedronate products',
          prosAndCons:
            'Pros: removes the fasting constraint that is the commonest practical reason oral bisphosphonates are abandoned. Cons: the label states its osteoporosis efficacy rests on clinical data of one year’s duration, which is a much smaller evidence base than the three-year immediate-release trials.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary calcium and vitamin D',
          activeCompound: 'Calcium and cholecalciferol',
          biologicalMechanism:
            'Supply the substrate for mineralisation and the hormone that allows it to be absorbed. They do not suppress osteoclasts, which is what this drug does.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. In VERT-NA every participant received 1000 mg of calcium daily and up to 500 IU of vitamin D if their baseline level was low, in both arms, so the drug effect shown is an effect on top of replacement.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
      ],
      homeRemedies: [
        {
          name: 'Take the tablet with a full glass of plain water and stay upright',
          action:
            'Plain water only, and no lying down until after the first food of the day.',
          patientImpact:
            'Absolute oral bioavailability of the immediate-release tablet is 0.63%, and the molecule is irritant if it lodges in the oesophagus. Both problems are addressed by the same handful of instructions.',
          clinicalPrecaution:
            'Mineral water, coffee, juice and milk all contain cations that bind the drug in the gut. This is an absorption fact, not a preference.',
        },
        {
          name: 'Report thigh or groin pain that builds without an injury',
          action: 'Describe when it started and whether it is worse on weight-bearing.',
          patientImpact:
            'Atypical femoral fracture is a class warning for all bisphosphonates and is usually preceded by prodromal pain.',
          clinicalPrecaution:
            'The absolute excess established in the Swedish national analysis of this class was about 5 cases per 10,000 patient-years, and it falls sharply after the drug is stopped.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=CN=C1)CC(O)(P(=O)(O)O)P(=O)(O)O',
      chemicalFormula: 'C7H11NO7P2',
      molecularWeight: '283.11 g/mol',
      targetReceptorAffinity:
        'Inhibits recombinant human farnesyl diphosphate synthase with an IC50 of 3.9 nM, against 460 nM for alendronate and 500 nM for pamidronate on the same enzyme in the same experiment; etidronate is negligible at 80 micromolar and clodronate inactive. Mean absolute oral bioavailability of the 30 mg immediate-release tablet taken four hours before a meal is 0.63% (90% CI 0.54% to 0.75%). Plasma protein binding is about 24%, and roughly 60% of an intravenous dose distributes to bone in preclinical species.',
      structureSource: {
        label:
          'PubChem CID 5245 (risedronic acid) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5245',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ris-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and regiochemistry of the 3-pyridyl acetic acid precursor',
          description:
            'Confirm that the nitrogen sits at the 3-position of the ring before phosphonylation. The 2- and 4-isomers are far weaker inhibitors of the target enzyme, because the potency of this class depends on where the ring nitrogen ends up in the enzyme’s allylic binding pocket, and they are not separable later by simple crystallisation.',
          reagentsAndBuffer:
            '3-pyridylacetic acid hydrochloride reference standard, 1H and 13C NMR in deuterium oxide, HPLC with UV detection at 262 nm for positional isomers, chloride titration',
        },
        {
          id: 'ris-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Formation of the geminal bisphosphonate on the pyridylacetic carbon',
          description:
            'Treat the acetic acid with phosphorous acid and phosphorus trichloride so the carboxyl carbon acquires two phosphonate groups and a hydroxyl. Temperature control matters more here than for alendronate: the pyridine ring is basic and protonates in the acidic melt, and overheating produces coloured degradation products that carry through crystallisation.',
          dependsOnStepId: 'ris-w1',
          reagentsAndBuffer:
            'Phosphorous acid, phosphorus trichloride, methanesulfonic acid or chlorobenzene diluent, controlled addition with jacket cooling, aqueous hydrolysis quench',
        },
        {
          id: 'ris-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation as the sodium hemi-pentahydrate',
          description:
            'Neutralise and crystallise the sodium salt. The marketed hydrate is the hemi-pentahydrate, and hydrate stoichiometry is a specification rather than a detail: the enriched corpus carries separate records for the hemi-pentahydrate because that is how it is registered.',
          dependsOnStepId: 'ris-w2',
          reagentsAndBuffer:
            'Sodium hydroxide to target pH, water and ethanol antisolvent, Karl Fischer and thermogravimetric analysis for hydrate stoichiometry, ion chromatography for residual phosphite and phosphate',
        },
        {
          id: 'ris-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Mineral-bound resorption assay against a matched alendronate control',
          description:
            'Adsorb both compounds onto dentine at matched surface loading and culture osteoclasts on them. Running the comparison on mineral rather than in solution is the point: it is the assay in which risedronate’s hundredfold enzyme advantage shrinks, because binding affinity for hydroxyapatite and release at resorption pH are what actually set the dose at the enzyme.',
          dependsOnStepId: 'ris-w3',
          reagentsAndBuffer:
            'Primary or RANKL-differentiated osteoclasts, dentine discs preloaded with each compound, alpha-MEM with 10% fetal bovine serum, toluidine blue pit staining, hydroxyapatite column chromatography for comparative mineral affinity',
        },
        {
          id: 'ris-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Farnesyl diphosphate synthase IC50 with preincubation control',
          description:
            'Measure inhibition of the recombinant human enzyme with and without a preincubation step. Nitrogen-containing bisphosphonates are slow, tight-binding inhibitors, so an IC50 read without preincubation understates potency and is not comparable across published series.',
          dependsOnStepId: 'ris-w4',
          reagentsAndBuffer:
            'Recombinant human FDPS, isopentenyl and dimethylallyl diphosphate substrates, radiometric or continuous coupled phosphate-release readout, fixed 15-minute preincubation to match the published comparison series',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ris-a1',
        category: 'measured',
        title: 'Hip fracture was the primary endpoint, and it was met in the osteoporotic group',
        laymanSummary:
          'Nine thousand elderly women were randomised, and the trial declared hip fracture as the thing it was measuring. In the group selected because their bone density was low, hip fractures fell from about three in a hundred to about two in a hundred.',
        technicalDetails:
          'The Hip Intervention Program studied 5445 women aged 70 to 79 with osteoporosis by femoral-neck T-score and 3886 women aged 80 or over selected mainly on non-skeletal risk factors such as poor gait or a propensity to fall, randomised to risedronate 2.5 or 5.0 mg daily or placebo for three years. Across all women, hip fracture occurred in 2.8% on risedronate against 3.9% on placebo, relative risk 0.7 (95% CI 0.6 to 0.9, P=0.02). In the 70-to-79 osteoporosis group it was 1.9% against 3.2%, relative risk 0.6 (95% CI 0.4 to 0.9, P=0.009).',
        evidenceSource:
          'McClung MR et al., N Engl J Med 2001;344:333-340 (Hip Intervention Program)',
        doi: '10.1056/NEJM200102013440503',
        measuredMetric:
          'Hip fracture at three years, 1.9% against 3.2% in the osteoporotic 70-79 group, RR 0.6 (95% CI 0.4 to 0.9)',
        auditFlag: 'verified',
      },
      {
        id: 'ris-a2',
        category: 'failed',
        title: 'In the women selected on falls risk rather than bone density, it did nothing',
        laymanSummary:
          'The same trial enrolled a second group: women aged 80 and over chosen mainly because they were likely to fall, not because a scan showed thin bone. In that group the drug did not reduce hip fractures at all.',
        technicalDetails:
          'Among the 3886 women aged at least 80, selected on at least one non-skeletal risk factor for hip fracture or on low femoral-neck density, hip fracture occurred in 4.2% on risedronate against 5.1% on placebo, P=0.35. The contrast with the younger osteoporotic group is the finding: a drug that suppresses bone resorption changes the outcome in people whose fracture risk is driven by bone, and does not change it in people whose fracture risk is driven by falling. This is a mechanism result, not a dosing one, and it is the strongest argument in the file against treating fracture risk as a single quantity.',
        evidenceSource:
          'McClung MR et al., N Engl J Med 2001;344:333-340, group aged 80 years and over',
        doi: '10.1056/NEJM200102013440503',
        measuredMetric: 'Hip fracture 4.2% against 5.1% in women aged 80 and over, P=0.35',
        auditFlag: 'caution',
      },
      {
        id: 'ris-a3',
        category: 'failed',
        title: 'Cochrane finds no demonstrated benefit in primary prevention, twice',
        laymanSummary:
          'When all the randomised evidence is pooled, the drug clearly reduces fractures in women who already have osteoporosis. In women who do not, there is no demonstrated effect — and after fourteen years and a full review update, there is still no demonstrated effect.',
        technicalDetails:
          'The 2008 Cochrane review of seven trials in 14,049 women reported no statistically significant effect of risedronate 5 mg/day on vertebral or non-vertebral fracture in primary prevention, against a 39% relative reduction in vertebral fracture (RR 0.61, 95% CI 0.50 to 0.76), 20% in non-vertebral (RR 0.80, 0.72 to 0.90) and 26% in hip fracture (RR 0.74, 0.59 to 0.94) in secondary prevention. The 2022 update screened 43 eligible trials and synthesised 33 in 27,348 participants. Its primary-prevention evidence came from four short trials in 989 lower-risk women, with zero clinical vertebral and zero hip fractures reported, making those effects not estimable, and wrist fracture RR 0.48 with a confidence interval of 0.03 to 7.50. The authors graded primary-prevention evidence low to very low certainty. Secondary prevention was confirmed: non-vertebral RR 0.80 (0.72 to 0.90, moderate certainty) and hip RR 0.73 (0.56 to 0.94, low certainty).',
        evidenceSource:
          'Wells GA et al., Cochrane Database Syst Rev 2022;5:CD004523 (update of the 2008 review, CD004523.pub3)',
        doi: '10.1002/14651858.CD004523.pub4',
        measuredMetric:
          'Primary prevention: zero clinical vertebral and zero hip fractures across four trials in 989 women, effects not estimable',
        auditFlag: 'caution',
      },
      {
        id: 'ris-a4',
        category: 'inferred',
        title: 'A hundredfold potency advantage on the enzyme, and no advantage in people',
        laymanSummary:
          'On the isolated enzyme, risedronate is about a hundred times stronger than alendronate. In patients this makes no measurable difference, because how much drug reaches the enzyme is decided by absorption and by how tightly the drug grips bone mineral, not by how tightly it grips the enzyme.',
        technicalDetails:
          'In a single experiment on recombinant human farnesyl diphosphate synthase, IC50 values were 3.9 nM for risedronate, 460 nM for alendronate and 500 nM for pamidronate. The clinical doses do not follow that ratio, and no adequately powered head-to-head trial has shown a fracture difference between the two oral drugs. The reason is that potency at the enzyme is only one of three terms: oral bioavailability is 0.63% for risedronate and 0.64% for alendronate, and the two differ in affinity for hydroxyapatite, which governs how much drug is retained at the resorption surface and how long it stays there. A page that reported only the enzyme number would imply a hundredfold better drug.',
        evidenceSource:
          'Bergstrom JD et al., Arch Biochem Biophys 2000;373:231-241; risedronate sodium and alendronate sodium United States prescribing information, Clinical Pharmacology 12.3',
        doi: '10.1006/abbi.1999.1502',
        inferredClaim:
          'That a hundredfold advantage in enzyme inhibition means a stronger drug — bioavailability and mineral binding sit between the two numbers and no fracture trial has tested the implication',
        auditFlag: 'contested',
      },
      {
        id: 'ris-a5',
        category: 'measured',
        title: 'Two vertebral-fracture trials on two continents, both positive',
        laymanSummary:
          'Two separate three-year trials, one in North America and one in Europe and Australia, both enrolled women who had already fractured a vertebra. Spinal fractures fell by 41% in the first and 49% in the second.',
        technicalDetails:
          'VERT-NA randomised 2458 postmenopausal women under 85 with at least one vertebral fracture at 110 North American centres. Risedronate 5 mg reduced new vertebral fracture by 41% over three years (11.3% against 16.3%, 95% CI 18% to 58%, P=0.003) and by 65% in the first year alone (2.4% against 6.4%, P<0.001); non-vertebral fracture fell 39% (5.2% against 8.4%, 95% CI 6% to 61%, P=0.02). VERT-MN randomised 1226 women with two or more prevalent vertebral fractures at 80 centres in Europe and Australia, and reported a 49% reduction over three years (P<0.001) with 61% in the first year (P=0.001); non-vertebral fracture fell 33% but did not reach significance (P=0.06). The 2.5 mg arm was discontinued by protocol amendment in both trials.',
        evidenceSource:
          'Harris ST et al., JAMA 1999;282:1344-1352 (VERT-NA); Reginster J et al., Osteoporos Int 2000;11:83-91 (VERT-MN)',
        doi: '10.1001/jama.282.14.1344',
        measuredMetric:
          'New vertebral fracture over three years: 11.3% against 16.3% in VERT-NA; 49% relative reduction in VERT-MN',
        auditFlag: 'verified',
      },
      {
        id: 'ris-a6',
        category: 'inferred',
        title: 'None of the pooled trials was at low risk of bias in every domain',
        laymanSummary:
          'The reviewers who pooled forty-three trials reported that not one of them was well conducted on every measure they checked. Only a quarter described properly how patients were assigned to groups.',
        technicalDetails:
          'The 2022 Cochrane update states that selection bias was the most frequent concern, that only 24% of studies described appropriate methods for both sequence generation and allocation concealment, that 50% of studies reporting benefit outcomes and 39% reporting harm outcomes were at high risk of bias, and that none of the studies included in the quantitative syntheses was judged at low risk of bias in all seven domains. The review also notes it was updated without industry sponsorship, which the earlier version was not in a position to say of its constituent trials.',
        evidenceSource: 'Wells GA et al., Cochrane Database Syst Rev 2022;5:CD004523',
        doi: '10.1002/14651858.CD004523.pub4',
        inferredClaim:
          'That a positive pooled estimate from many trials is stronger than one good trial — pooling many trials that share a bias does not remove the bias, and the reviewers say so explicitly',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Under one percent of the tablet is absorbed',
        laymanDesc:
          'Like every oral drug in this class it is barely absorbed, and food makes it worse. A delayed-release version exists specifically so it can be taken after breakfast instead.',
        molecularDetail:
          'Mean absolute oral bioavailability of the 30 mg immediate-release tablet taken four hours before a meal is 0.63% (90% CI 0.54% to 0.75%). The delayed-release tablet loses about 30% of its bioavailability when taken immediately after a high-fat breakfast, but is still two to four times better absorbed in that setting than the immediate-release tablet taken 30 minutes before the same meal.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Most of what is absorbed goes to bone; the rest is passed in urine',
        laymanDesc:
          'The molecule has almost no interest in soft tissue. It finds bone mineral, binds, and waits there.',
        molecularDetail:
          'Preclinical intravenous studies show roughly 60% of a dose distributed to bone with the remainder excreted unchanged in urine. Mean steady-state volume of distribution is 13.8 L/kg and plasma protein binding about 24%, markedly lower than alendronate’s 78%.',
        iconName: 'Magnet',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'The osteoclast dissolves the mineral and takes the drug in with it',
        laymanDesc:
          'The cell that eats bone cannot avoid eating the drug. The acid it uses to dissolve mineral is what releases the drug in the first place.',
        molecularDetail:
          'The sealing zone under a resorbing osteoclast holds pH near 4.5, liberating adsorbed bisphosphonate into the lacuna, from which it enters by fluid-phase endocytosis. Selectivity for the osteoclast requires no targeting ligand: it follows from the cell being the only one that dissolves the reservoir.',
        iconName: 'Download',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'It jams the enzyme far harder than alendronate does',
        laymanDesc:
          'Inside the cell it blocks the same enzyme, and blocks it about a hundred times more tightly. In the body this advantage disappears, because so little drug gets to the cell in the first place.',
        molecularDetail:
          'IC50 against recombinant human farnesyl diphosphate synthase is 3.9 nM, against 460 nM for alendronate in the same assay. The nitrogen of the pyridine ring occupies the allylic site and mimics the carbocation intermediate of the enzyme’s natural reaction, which is why ring position matters and why non-nitrogen bisphosphonates such as clodronate do not inhibit this enzyme at all.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Prenylation fails and the resorbing cell loses its machinery',
        laymanDesc:
          'Several of the cell’s internal controllers need a fatty tag to sit on the membrane. Without the tag they float free, the cell loses its grip on bone and its digestive surface, and demolition stops.',
        molecularDetail:
          'Depletion of farnesyl and geranylgeranyl diphosphate leaves Rab, Rho and Rac GTPases unprenylated, breaking vesicular trafficking and cytoskeletal organisation. The osteoclast stays attached but loses its ruffled border, and unprenylated substrate accumulation drives apoptosis of the cell.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Fewer fractures — in bone-driven risk, not in fall-driven risk',
        laymanDesc:
          'Where the reason a hip breaks is that the bone is weak, this works. Where the reason is that the person falls a lot, the trial showed no benefit at all.',
        molecularDetail:
          'Hip fracture fell from 3.2% to 1.9% in 5445 women aged 70 to 79 selected on femoral-neck T-score, and from 5.1% to 4.2% with P=0.35 in 3886 women aged 80 and over selected largely on non-skeletal risk factors. Suppressing resorption changes the bone term in fracture risk and leaves the fall term untouched.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'VERT-NA (Harris 1999)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2458,
        primaryEndpoint: 'New vertebral fracture by quantitative and semiquantitative radiography',
        endpointMet: true,
        statisticalPValue: '11.3% against 16.3%; 41% reduction (95% CI 18% to 58%), P=0.003',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VERT-MN (Reginster 2000)',
        phase: 'Phase 3, randomised, double-masked, placebo-controlled',
        sampleSize: 1226,
        primaryEndpoint: 'New vertebral fracture over three years',
        endpointMet: true,
        statisticalPValue:
          '49% reduction over three years, P<0.001; non-vertebral fracture 33% reduction, P=0.06 — not significant',
        unreportedAdverseSignals:
          'The non-vertebral result is quoted as a 33% reduction in secondary literature without the P value of 0.06 that accompanies it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hip Intervention Program, osteoporotic group aged 70-79 (McClung 2001)',
        phase: 'Phase 3, randomised, placebo-controlled',
        sampleSize: 5445,
        primaryEndpoint: 'Hip fracture over three years',
        endpointMet: true,
        statisticalPValue: '1.9% against 3.2%; relative risk 0.6 (95% CI 0.4 to 0.9), P=0.009',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hip Intervention Program, group aged 80 and over (McClung 2001)',
        phase: 'Phase 3, randomised, placebo-controlled',
        sampleSize: 3886,
        primaryEndpoint: 'Hip fracture over three years',
        endpointMet: false,
        statisticalPValue: '4.2% against 5.1%, P=0.35',
        unreportedAdverseSignals:
          'This group was enrolled mainly on non-skeletal risk factors such as poor gait or a tendency to fall. The null result is a finding about who a resorption inhibitor can help, and it is usually reported only as part of the pooled 2.8% against 3.9%.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hip fracture 1.9% against 3.2% over three years in 5445 women aged 70-79 with osteoporosis, RR 0.6 (95% CI 0.4 to 0.9)',
        'New vertebral fracture 11.3% against 16.3% over three years in 2458 women in VERT-NA, and a 49% reduction in 1226 women in VERT-MN',
        'IC50 3.9 nM against recombinant human farnesyl diphosphate synthase, roughly a hundredfold below alendronate in the same experiment',
        'Mean absolute oral bioavailability 0.63% (90% CI 0.54% to 0.75%) taken four hours before a meal',
      ],
      unsupportedInferences: [
        'That a hundredfold advantage at the enzyme makes it a hundredfold, or any amount, better as a drug in people',
        'That fracture reduction demonstrated in osteoporotic populations extends to lower-risk women — Cochrane found the primary-prevention effects not estimable in 2008 and again in 2022',
        'That pooling forty-three trials produces a robust answer, when the reviewers report none of them was at low risk of bias across all seven domains',
        'That reducing bone resorption addresses fracture risk generally, when the same trial showed nothing in women whose risk came from falling',
      ],
      whatFailedInitially: [
        'The hip-fracture endpoint was missed in the 3886 women aged 80 and over, 4.2% against 5.1%, P=0.35',
        'Non-vertebral fracture in VERT-MN reached only 33% with P=0.06',
        'Two Cochrane reviews, fourteen years apart, found the primary-prevention question unanswerable: four short trials, 989 women, zero clinical vertebral and zero hip fractures',
        'The delayed-release formulation, built to solve the fasting problem, carries an osteoporosis efficacy claim based on one year of clinical data by the label’s own statement',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1998 and generic since 2014, still at roughly seven times the acquisition cost of generic alendronate',
        'The only oral bisphosphonate whose pivotal programme declared hip fracture, rather than a radiographic vertebral fracture, as a primary endpoint',
        'Carries the same limitation of use as the rest of the class: optimal duration has not been determined, with discontinuation to be considered after three to five years in people at low risk',
        'Its enzyme-potency number is still quoted in marketing contexts as though it were a clinical advantage, which no trial has shown',
      ],
    },
    deliverySystem: {
      type: 'Oral immediate-release tablet and oral delayed-release tablet',
      description:
        'The immediate-release tablet is taken fasting with plain water and the patient stays upright. The delayed-release tablet uses an enteric coat with a chelating agent so it can be taken immediately after breakfast, which is the only real formulation innovation in the oral bisphosphonates.',
      safetyProfile:
        'No boxed warning. Upper gastrointestinal irritation, oesophagitis and oesophageal ulceration are the characteristic label warnings for the immediate-release tablet. Osteonecrosis of the jaw and atypical subtrochanteric or diaphyseal femoral fracture are class warnings established after approval. In the 2022 Cochrane synthesis, withdrawals due to adverse events were 16.9% on risedronate against 17.2% on control across eight trials in 9529 women (high certainty), and serious adverse events were 29.2% in both groups across six trials in 9435 women (moderate certainty).',
    },
    commonQuestions: [
      {
        q: 'Is it better than alendronate?',
        a: 'Not on any evidence that exists. It inhibits the target enzyme about a hundred times more potently in a test tube, which is a real measurement and not a clinically meaningful one, because both drugs are absorbed at under one percent and both are limited by how much reaches the resorbing cell. No adequately powered head-to-head fracture trial separates them. The one structural difference in the evidence is that risedronate’s pivotal hip trial declared hip fracture as its primary endpoint, where alendronate’s hip result was a secondary outcome. Risedronate costs roughly seven times as much per unit at pharmacy acquisition.',
        auditNote:
          'A potency number and an effectiveness result are different claims. This page keeps the 3.9 nanomolar figure and the fracture percentages in separate sections deliberately.',
      },
      {
        q: 'Will it help if I fall a lot but my bone density is only slightly low?',
        a: 'The trial that asked this question found no benefit. The Hip Intervention Program enrolled two populations: 5445 women aged 70 to 79 selected on low femoral-neck bone density, and 3886 women aged 80 and over selected mainly because they had non-skeletal risk factors such as poor gait or a tendency to fall. Hip fractures fell significantly in the first group and not at all in the second, 4.2% against 5.1% with a P value of 0.35. A drug that suppresses bone resorption changes the strength of the bone; it does nothing about the fall.',
      },
      {
        q: 'Does it work if I do not have osteoporosis yet?',
        a: 'That has not been demonstrated, and two Cochrane reviews fourteen years apart say so in the same terms. The 2022 update found only four short trials in 989 lower-risk women, which between them reported zero clinical vertebral fractures and zero hip fractures, making the effect on those outcomes not estimable rather than negative. The wrist-fracture estimate had a confidence interval running from 0.03 to 7.50. In women who do have osteoporosis, the same review found risedronate probably prevents non-vertebral fracture and may reduce hip fracture.',
        auditNote:
          '"Not estimable" is not the same as "no effect", and neither is the same as "works". The honest statement is that the trials to answer this were never done at the size required.',
      },
      {
        q: 'Why does one version get taken after breakfast and the other before?',
        a: 'Because the absorption problem and the irritation problem have different fixes. Absolute bioavailability of the plain tablet is 0.63% and only if it is taken well away from food, since calcium and other cations in a meal bind the drug in the gut. The delayed-release tablet carries an enteric coat and a chelating agent that ties up dietary calcium, so it can be taken straight after breakfast and still deliver two to four times as much drug as a plain tablet taken 30 minutes before the same meal. The label notes that its osteoporosis efficacy rests on one year of clinical data.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Harris ST et al. Effects of risedronate treatment on vertebral and nonvertebral fractures in women with postmenopausal osteoporosis: a randomized controlled trial (VERT). JAMA 1999;282:1344-1352',
        identifier: '10.1001/jama.282.14.1344',
        kind: 'doi',
      },
      {
        label:
          'Reginster J et al. Randomized trial of the effects of risedronate on vertebral fractures in women with established postmenopausal osteoporosis (VERT-MN). Osteoporos Int 2000;11:83-91',
        identifier: '10.1007/s001980050010',
        kind: 'doi',
      },
      {
        label:
          'McClung MR et al. Effect of risedronate on the risk of hip fracture in elderly women. Hip Intervention Program Study Group. N Engl J Med 2001;344:333-340',
        identifier: '10.1056/NEJM200102013440503',
        kind: 'doi',
      },
      {
        label:
          'Wells GA et al. Risedronate for the primary and secondary prevention of osteoporotic fractures in postmenopausal women. Cochrane Database Syst Rev 2022;5:CD004523',
        identifier: '10.1002/14651858.CD004523.pub4',
        kind: 'doi',
      },
      {
        label:
          'Wells G et al. Risedronate for the primary and secondary prevention of osteoporotic fractures in postmenopausal women. Cochrane Database Syst Rev 2008;(1):CD004523',
        identifier: '10.1002/14651858.CD004523.pub3',
        kind: 'doi',
      },
      {
        label:
          'Bergstrom JD et al. Alendronate is a specific, nanomolar inhibitor of farnesyl diphosphate synthase. Arch Biochem Biophys 2000;373:231-241 — source of the comparative FDPS IC50 series',
        identifier: '10.1006/abbi.1999.1502',
        kind: 'doi',
      },
      {
        label:
          'Risedronate sodium United States prescribing information (openFDA label endpoint) — indications, limitations of use and clinical pharmacology',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22risedronate+sodium%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Zoledronic acid — the only drug in this file with a randomised all-cause mortality signal,
  //    and the only one whose own trial found significantly more serious atrial fibrillation.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zoledronic-acid',
    name: 'Zoledronic Acid',
    tradeName: 'Zometa / Reclast',
    sponsor:
      'Novartis (originator; Zometa for oncology 2001, Reclast for osteoporosis 2007); now made generically, and the Reclast label on this record is held by Sandoz',
    targetGene: 'FDPS — farnesyl diphosphate synthase, a human gene, in the osteoclast',
    targetProtein:
      'Farnesyl diphosphate synthase; the imidazole ring makes this the most potent inhibitor of the marketed bisphosphonates',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2001,
    indication:
      'As Reclast: treatment and prevention of postmenopausal osteoporosis, treatment to increase bone mass in men with osteoporosis, treatment and prevention of glucocorticoid-induced osteoporosis, and treatment of Paget disease of bone. As Zometa: hypercalcaemia of malignancy and skeletal complications of multiple myeloma and bone metastases. The two are the same molecule at different doses and schedules and must never be given together',
    patientFriendlyIndication:
      'Fragile bones, and the bone damage caused by some cancers — two different products with the same active drug',
    anatomicalSite:
      'The resorption surface of bone throughout the skeleton, reached directly through the bloodstream rather than through the gut',
    conditionContext: {
      conditionExplainer:
        'Bone is dismantled and rebuilt continuously, and after menopause or in the presence of certain cancers the dismantling runs far ahead. An intravenous bisphosphonate delivers the whole dose into the blood at once, which removes the absorption problem that limits every oral drug in this class to under one percent.',
      whyItMatters:
        'This is where the class produced its two most interesting results. Given yearly to women with osteoporosis it cut hip fractures by 41%. Given within 90 days of a hip fracture it was associated with 28% fewer deaths from any cause — and only 8% of that survival difference could be traced to the fractures it prevented.',
      whoTakesThis:
        'Postmenopausal women with osteoporosis, men with osteoporosis, people on long-term glucocorticoids, people with Paget disease, and, at a different dose under a different brand, people with cancer in bone.',
      clinicalGoals:
        'Fewer fractures. In the recurrent-fracture trial the goal became something larger and less expected, and the mechanism for it remains unexplained.',
    },
    oneSentenceVerdict:
      'A once-yearly infusion of the most potent bisphosphonate that cut morphometric vertebral fractures from 10.9% to 3.3% and hip fractures from 2.5% to 1.4% in 7765 women over three years, and, given after a hip fracture in 2127 patients, was associated with 28% fewer deaths from any cause that a mediation analysis could only trace 8% of to the fractures it prevented — while serious atrial fibrillation occurred in 50 patients against 20 on placebo.',
    laymanHowItWorks:
      'The drug is dripped into a vein once a year, so none of it is lost to the gut. It spreads through the blood and sticks to bone mineral everywhere in the skeleton. Cells that dissolve bone take it in as they work, and it shuts down an enzyme they need, so they stop and die. One infusion suppresses bone breakdown for about a year because the drug stays bound to the mineral it is waiting in.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4774 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 4 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved as Zometa in 2001 and as Reclast for osteoporosis in 2007; generic since 2013. The acquisition price of the drug itself is now trivial. What a patient is charged is dominated by the infusion visit, which is a service cost this dataset does not capture at all, so the figure above understates the real cost of a year of treatment by a large and unpublished factor.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison that matters is against the oral bisphosphonates, and it turns almost entirely on delivery rather than on the molecule. An infusion cannot be forgotten, cannot be taken wrongly and cannot irritate the oesophagus, and roughly half of people prescribed an oral bisphosphonate have stopped it within a year. Against that, an infusion cannot be stopped either once given, and the acute-phase reaction after the first one is common enough to be the main reason people decline the second.',
      conventionalRx: [
        {
          name: 'Alendronate',
          class: 'Nitrogen-containing bisphosphonate, oral weekly',
          howItCompares:
            'Same mechanism, a fraction of the drug cost, and no infusion visit. It has the larger randomised dataset for vertebral fracture but no mortality signal, and its hip-fracture result was a secondary endpoint.',
          typicalCost:
            'US$0.2842 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, no clinic visit, decades of data. Cons: fasting administration, oesophageal irritation, and adherence that falls sharply in the first year.',
        },
        {
          name: 'Denosumab',
          class: 'Anti-RANKL monoclonal antibody, subcutaneous every six months',
          howItCompares:
            'Also removes the swallowing problem, and produces larger continuing density gains. Unlike a bisphosphonate it is not stored in bone, so its effect ends when it is stopped and rebound vertebral fractures have been reported after discontinuation.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for denosumab was held on this record at the time of writing',
          prosAndCons:
            'Pros: a subcutaneous injection rather than an infusion; usable across a wider range of kidney function. Cons: fully reversible on stopping, with a recognised rebound; requires an uninterrupted schedule.',
        },
        {
          name: 'Romosozumab',
          class: 'Anti-sclerostin monoclonal antibody, subcutaneous monthly for twelve months',
          howItCompares:
            'Builds bone rather than preserving it, and beat alendronate head-to-head on fracture in ARCH. It carries a boxed warning for myocardial infarction, stroke and cardiovascular death that no bisphosphonate carries.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for romosozumab was held on this record at the time of writing',
          prosAndCons:
            'Pros: the only approved agent that increases formation and decreases resorption at once. Cons: a twelve-month course that must be followed by an antiresorptive, and a cardiovascular boxed warning.',
        },
      ],
      naturalFoods: [
        {
          name: 'Calcium and vitamin D repletion before the infusion',
          activeCompound: 'Calcium and cholecalciferol',
          biologicalMechanism:
            'A sudden, profound suppression of bone resorption removes a source of circulating calcium. If stores are already low, calcium in blood can fall.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated: this page carries no intake guidance. The label requires adequate calcium and vitamin D supplementation and treats pre-existing hypocalcaemia as something to correct before treatment, which is a prescriber’s decision.',
          monthlyCost: 'Ordinary grocery or supplement cost; not separately priced',
        },
      ],
      homeRemedies: [
        {
          name: 'Expect to feel unwell for a day or two after the first infusion',
          action:
            'Plan the first infusion for a day when feeling feverish and achy would not matter.',
          patientImpact:
            'The most common adverse reactions in the label, each above 10%, are fever, muscle pain, headache, joint pain and pain in an extremity. This acute-phase reaction is much less common after subsequent infusions.',
          clinicalPrecaution:
            'It is an inflammatory response to the drug, not an allergy, and it does not predict a problem with later doses. Severe bone, joint or muscle pain is a separate labelled reaction for which the label says to withhold future doses.',
        },
        {
          name: 'Say if you have ever received Zometa',
          action: 'Name the brand, not just "a bone drug".',
          patientImpact:
            'Reclast and Zometa are the same molecule at different doses. The label states that a patient being treated with Zometa should not be treated with Reclast.',
          clinicalPrecaution:
            'This is the one duplication risk in this file that a patient can catch and a system often will not, because the two products sit in different specialties.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CN(C=N1)CC(O)(P(=O)(O)O)P(=O)(O)O',
      chemicalFormula: 'C5H10N2O7P2',
      molecularWeight: '272.09 g/mol',
      targetReceptorAffinity:
        'The imidazole ring gives the highest farnesyl diphosphate synthase inhibitory potency and the highest hydroxyapatite affinity of the marketed bisphosphonates, which together are why a single 5 mg infusion suppresses bone turnover for about a year. It is not metabolised, and is cleared unchanged by the kidney, which is why the label caps a single dose at 5 mg, requires an infusion of at least 15 minutes, and requires creatinine clearance to be checked before each dose.',
      structureSource: {
        label:
          'PubChem CID 68740 (zoledronic acid) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/68740',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zol-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the imidazol-1-yl acetic acid precursor',
          description:
            'Confirm that the acetic acid chain is attached at the imidazole 1-nitrogen and not at a ring carbon. The N1 regiochemistry is what places the second ring nitrogen in the enzyme pocket, and the carbon-linked isomer is a different and much weaker compound that co-elutes on a short reversed-phase method.',
          reagentsAndBuffer:
            'Imidazol-1-yl acetic acid reference standard, 1H and 13C NMR in deuterium oxide, HPLC with a shallow gradient long enough to resolve the N1 and C-linked isomers, elemental analysis for nitrogen',
        },
        {
          id: 'zol-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Bisphosphonylation to the geminal hydroxybisphosphonate',
          description:
            'React with phosphorous acid and phosphorus trichloride so the carboxyl carbon carries two phosphonates and a hydroxyl. The imidazole is more basic than the pyridine of risedronate, so it protonates readily in the acidic melt and the reaction runs at a different acid stoichiometry.',
          dependsOnStepId: 'zol-w1',
          reagentsAndBuffer:
            'Phosphorous acid, phosphorus trichloride, methanesulfonic acid, controlled addition with cooling, aqueous hydrolysis quench with pH control',
        },
        {
          id: 'zol-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallisation as the monohydrate and preparation of the parenteral solution',
          description:
            'Crystallise the monohydrate, then prepare a ready-to-infuse solution. Because the product is given intravenously the specification is stricter than for a tablet: this step, not the synthesis, is where particulate matter, bacterial endotoxin and sterility are decided.',
          dependsOnStepId: 'zol-w2',
          reagentsAndBuffer:
            'Water for injection, mannitol and sodium citrate for the marketed solution, 0.22 micron sterilising filtration, limulus amoebocyte lysate endotoxin assay, sub-visible particulate counting by light obscuration',
        },
        {
          id: 'zol-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hydroxyapatite binding and osteoclast resorption assay',
          description:
            'Measure binding affinity to hydroxyapatite by column chromatography, then run the resorption assay on preloaded mineral. For this molecule the binding measurement is as informative as the potency measurement: it is the reason a single dose lasts a year, and it is also the reason the drug is still detectable in bone long after the infusion.',
          dependsOnStepId: 'zol-w3',
          reagentsAndBuffer:
            'Hydroxyapatite column with phosphate gradient elution, dentine discs, primary or RANKL-differentiated osteoclasts, alpha-MEM with 10% fetal bovine serum, pit area morphometry',
        },
        {
          id: 'zol-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Bone turnover marker time course to one year',
          description:
            'Track serum C-telopeptide and procollagen type 1 N-propeptide after a single dose out to twelve months. This is the assay that justifies annual administration, and it is a biochemical justification rather than a fracture one: the fracture evidence comes from the trial, not from the marker curve.',
          dependsOnStepId: 'zol-w4',
          reagentsAndBuffer:
            'Fasting serum, automated CTX and P1NP immunoassay with matched-lot calibrators, standardised collection time to control diurnal variation, paired baseline sample from the same subject',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zol-a1',
        category: 'measured',
        title: 'Both co-primary endpoints met, including hip fracture',
        laymanSummary:
          'Nearly eight thousand women were randomised to a yearly infusion or a yearly dummy infusion. Spinal fractures on x-ray fell from about eleven in a hundred to about three. Hip fractures fell from 2.5 in a hundred to 1.4.',
        technicalDetails:
          'HORIZON-PFT randomised 3889 patients to a single 15-minute infusion of zoledronic acid 5 mg and 3876 to placebo at baseline, 12 months and 24 months, with follow-up to 36 months; mean age 73. Morphometric vertebral fracture fell 70% (3.3% against 10.9%, relative risk 0.30, 95% CI 0.24 to 0.38) and hip fracture 41% (1.4% against 2.5%, hazard ratio 0.59, 95% CI 0.42 to 0.83). Non-vertebral, clinical and clinical vertebral fractures fell 25%, 33% and 77% respectively, all P<0.001. Change in renal function was similar between groups.',
        evidenceSource: 'Black DM et al., N Engl J Med 2007;356:1809-1822 (HORIZON-PFT, NCT00049829)',
        doi: '10.1056/NEJMoa067312',
        measuredMetric:
          'Hip fracture 1.4% against 2.5% at three years, HR 0.59 (95% CI 0.42 to 0.83); morphometric vertebral 3.3% against 10.9%, RR 0.30',
        auditFlag: 'verified',
      },
      {
        id: 'zol-a2',
        category: 'failed',
        title: 'Serious atrial fibrillation was significantly more common in the pivotal trial',
        laymanSummary:
          'In the same trial, serious atrial fibrillation — an irregular heartbeat needing hospital treatment — occurred in 50 patients on the drug against 20 on placebo. This was not something anyone had gone looking for.',
        technicalDetails:
          'HORIZON-PFT reported serious atrial fibrillation in 50 zoledronic acid patients against 20 placebo patients, P<0.001, an unanticipated finding in a trial designed to measure fractures. The signal was pursued across the class. Sharma and colleagues pooled six randomised trials in 41,375 patients and six observational studies in 149,856 people: randomised evidence gave a significantly increased risk of serious atrial fibrillation requiring hospitalisation (OR 1.40, 95% CI 1.02 to 1.93), observational evidence gave OR 1.27 (1.16 to 1.39), and neither stroke (OR 1.07, 0.85 to 1.34) nor cardiovascular mortality (OR 0.92, 0.68 to 1.26) was increased. No mechanism has been established.',
        evidenceSource:
          'Black DM et al., N Engl J Med 2007;356:1809-1822; Sharma A et al., Chest 2013;144:1311-1322',
        doi: '10.1378/chest.13-0675',
        measuredMetric:
          'Serious atrial fibrillation 50 against 20 patients in HORIZON-PFT (P<0.001); pooled randomised OR 1.40 (95% CI 1.02 to 1.93)',
        auditFlag: 'caution',
      },
      {
        id: 'zol-a3',
        category: 'measured',
        title: 'Given after a hip fracture, it was associated with 28% fewer deaths',
        laymanSummary:
          'Two thousand people who had just had a hip fracture repaired were given the infusion or a placebo. New fractures fell by a third, which was the point of the trial. Deaths from any cause fell by 28%, which was not.',
        technicalDetails:
          'HORIZON-RFT randomised 1065 patients to yearly zoledronic acid 5 mg and 1062 to placebo, first given within 90 days of surgical repair of a low-trauma hip fracture, with all patients receiving calcium and vitamin D; median follow-up 1.9 years, mean age 74.5. New clinical fracture, the primary endpoint, occurred in 8.6% against 13.9%, a 35% reduction, P=0.001. In the safety analysis, 101 of 1054 (9.6%) died on zoledronic acid against 141 of 1057 (13.3%) on placebo, a 28% reduction in all-cause mortality, P=0.01. No cases of osteonecrosis of the jaw were reported and rates of atrial fibrillation and stroke were similar between groups in this trial.',
        evidenceSource: 'Lyles KW et al., N Engl J Med 2007;357:1799-1809 (HORIZON-RFT, NCT00046254)',
        doi: '10.1056/NEJMoa074941',
        measuredMetric:
          'All-cause mortality 9.6% against 13.3% over a median 1.9 years, a 28% reduction, P=0.01',
        auditFlag: 'verified',
      },
      {
        id: 'zol-a4',
        category: 'inferred',
        title: 'The survival benefit is real and almost none of it comes from preventing fractures',
        laymanSummary:
          'The obvious explanation for fewer deaths is fewer fractures. When the trialists tested that explanation formally, preventing fractures accounted for only 8% of the survival difference. The rest is unexplained.',
        technicalDetails:
          'Colón-Emeric and colleagues analysed 2111 HORIZON-RFT participants with causes of death adjudicated by a blinded central committee. Adjusted for baseline risk factors, zoledronic acid reduced death by 25% (95% CI 0.58 to 0.97). Subsequent fracture was strongly associated with death (hazard ratio 1.72, 95% CI 1.17 to 2.51) but explained only 8% of the treatment effect. Adjusting for acute events during follow-up eliminated the death benefit, and treated patients were less likely to die of pneumonia (interaction P=0.04) and of arrhythmia (interaction P=0.02). The authors describe the analysis as exploratory and suggest studies of zoledronic acid in other acute illnesses. This is an unexplained finding presented as one, not a mechanism.',
        evidenceSource: 'Colón-Emeric CS et al., J Bone Miner Res 2010;25:91-97',
        doi: '10.1359/jbmr.090704',
        inferredClaim:
          'That the mortality reduction is explained by the fractures prevented — the formal mediation analysis attributes 8% of it to that pathway and leaves the remainder unaccounted for',
        auditFlag: 'contested',
      },
      {
        id: 'zol-a5',
        category: 'conclusion_shift',
        title: 'The class failed in osteopenia orally, then succeeded in osteopenia intravenously',
        laymanSummary:
          'Oral bisphosphonates were never shown to prevent fractures in women whose bones were only mildly thin. A six-year New Zealand trial gave the intravenous drug to two thousand such women and found fractures fell by more than a third.',
        technicalDetails:
          'Reid and colleagues randomised 2000 women aged 65 or over with osteopenia — a T-score of -1.0 to -2.5 at the total hip or femoral neck — to four infusions of zoledronate 5 mg or saline at 18-month intervals over six years. Median baseline 10-year hip-fracture risk was 2.3%. A fragility fracture, the primary endpoint, occurred in 122 of the zoledronate group against 190 of the placebo group, hazard ratio 0.63 (95% CI 0.50 to 0.79, P<0.001), number needed to treat 15. Non-vertebral fragility fracture hazard ratio was 0.66 (P=0.001), symptomatic fracture 0.73 (P=0.003) and vertebral fracture odds ratio 0.45 (P=0.002). The contrast with the oral primary-prevention literature is not a contradiction about the class: it is a trial that was adequately sized and long enough where the oral ones were not.',
        evidenceSource:
          'Reid IR et al., N Engl J Med 2018;379:2407-2416 (ACTRN12609000593235)',
        doi: '10.1056/NEJMoa1808082',
        inferredClaim:
          'That bisphosphonates do not work in osteopenia — an inference from short, small oral trials that a six-year intravenous trial in 2000 women overturned',
        auditFlag: 'verified',
      },
      {
        id: 'zol-a6',
        category: 'failed',
        title: 'The commonest adverse reactions are not rare and are not minor',
        laymanSummary:
          'More than one in ten people get fever, muscle pain, headache, joint pain or pain in a limb after an infusion. It usually passes in a day or two and is much less likely after the second one, but it is the usual reason people decline the second.',
        technicalDetails:
          'The Reclast label lists pyrexia, myalgia, headache, arthralgia and pain in extremity each above 10%, with flu-like illness, nausea, vomiting, diarrhoea and eye inflammation as other important reactions. Separate labelled warnings cover hypocalcaemia worsening during treatment, renal toxicity requiring a dose cap of 5 mg and an infusion of at least 15 minutes with creatinine clearance measured before each dose, osteonecrosis of the jaw, atypical femoral fracture and severe bone, joint or muscle pain for which future doses are to be withheld. The label also warns that patients receiving Zometa must not receive Reclast, the two being the same molecule at different doses.',
        evidenceSource:
          'Reclast (zoledronic acid injection) United States prescribing information, Warnings and Precautions 5.1 to 5.6 and Adverse Reactions 6 (openFDA label endpoint)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Infused into a vein, so absorption is not a variable',
        laymanDesc:
          'The whole dose goes straight into the blood over about fifteen minutes. There is nothing to swallow, nothing to absorb and no interaction with breakfast.',
        molecularDetail:
          'A single 5 mg dose is given over no less than 15 minutes. The label caps a single dose at 5 mg and requires creatinine clearance before each dose, because the drug is not metabolised and is cleared unchanged by the kidney, so renal impairment converts directly into higher and longer exposure.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It binds bone mineral across the whole skeleton within hours',
        laymanDesc:
          'From the blood it goes to bone and sticks. The rest is passed in urine within a day. What is left in the body is almost entirely in the skeleton.',
        molecularDetail:
          'The geminal P-C-P group chelates calcium in hydroxyapatite, and zoledronic acid has the highest mineral affinity of the marketed bisphosphonates. That affinity, more than its enzyme potency, is what makes a yearly interval possible: the drug is not cleared from bone, it waits there.',
        iconName: 'Magnet',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'The resorbing cell releases it and swallows it',
        laymanDesc:
          'The acid a demolition cell uses to dissolve bone is also what unsticks the drug. The cell then takes it in along with the dissolved mineral.',
        molecularDetail:
          'Acidification of the sealing zone to about pH 4.5 desorbs the bisphosphonate, which enters the osteoclast by fluid-phase endocytosis. Because release is driven by resorption, the delivered dose scales with how active the cell is — the drug is concentrated on exactly the cells doing the damage.',
        iconName: 'Download',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The mevalonate pathway is cut and the cell dies',
        laymanDesc:
          'Inside, the drug jams the enzyme that makes the lipid tags several of the cell’s control proteins need. The cell loses its digestive surface, then dies.',
        molecularDetail:
          'Inhibition of farnesyl diphosphate synthase depletes farnesyl and geranylgeranyl diphosphate, leaving Rab, Rho and Rac GTPases unprenylated. Vesicle trafficking and cytoskeletal organisation fail, the ruffled border is lost, and toxic accumulation of unprenylated substrates and of an ATP analogue drives osteoclast apoptosis.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Bone turnover stays suppressed for about a year from one dose',
        laymanDesc:
          'A single infusion holds bone breakdown down for roughly twelve months, which is why it is given once a year.',
        molecularDetail:
          'Bone resorption and formation markers fall within days and remain suppressed for about twelve months, because the reservoir bound to mineral keeps being released as resorption proceeds. The dosing interval is set by that marker curve; the fracture evidence comes separately, from the three annual infusions given in HORIZON-PFT.',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Fewer fractures, and in one trial fewer deaths that fractures do not explain',
        laymanDesc:
          'Hip fractures fell by 41% in the osteoporosis trial. In the trial run straight after a hip fracture, deaths from any cause fell by 28%, and preventing further fractures accounted for only a small part of that.',
        molecularDetail:
          'HORIZON-PFT: hip fracture hazard ratio 0.59 (95% CI 0.42 to 0.83). HORIZON-RFT: all-cause mortality 9.6% against 13.3%, P=0.01. The mediation analysis attributed 8% of the mortality effect to prevented fractures and found treated patients less likely to die of pneumonia and arrhythmia, with the death benefit disappearing after adjustment for acute intercurrent events. No mechanism has been established.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'HORIZON-PFT (NCT00049829)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 7765,
        primaryEndpoint:
          'Co-primary: new morphometric vertebral fracture, and hip fracture, over 36 months',
        endpointMet: true,
        statisticalPValue:
          'Vertebral 3.3% against 10.9%, RR 0.30 (95% CI 0.24 to 0.38); hip 1.4% against 2.5%, HR 0.59 (0.42 to 0.83)',
        unreportedAdverseSignals:
          'Serious atrial fibrillation occurred in 50 patients against 20 on placebo, P<0.001. This was an unanticipated finding and is not in the headline result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'HORIZON-RFT (NCT00046254)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2127,
        primaryEndpoint: 'New clinical fracture after surgical repair of a hip fracture',
        endpointMet: true,
        statisticalPValue:
          '8.6% against 13.9%, a 35% reduction, P=0.001; all-cause mortality 9.6% against 13.3%, P=0.01',
        unreportedAdverseSignals:
          'The mortality result was a safety-analysis finding, not a prespecified efficacy endpoint. It is frequently quoted as though it were the trial’s primary result.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Zoledronate in osteopenia — Reid 2018 (ACTRN12609000593235)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, six years',
        sampleSize: 2000,
        primaryEndpoint: 'Time to first non-vertebral or vertebral fragility fracture',
        endpointMet: true,
        statisticalPValue:
          '122 against 190 women with a fragility fracture; hazard ratio 0.63 (95% CI 0.50 to 0.79), P<0.001, number needed to treat 15',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hip fracture 1.4% against 2.5% over three years in 7765 patients, hazard ratio 0.59 (95% CI 0.42 to 0.83)',
        'Morphometric vertebral fracture 3.3% against 10.9%, relative risk 0.30 (95% CI 0.24 to 0.38)',
        'All-cause mortality 9.6% against 13.3% in 2127 patients treated within 90 days of a hip fracture, P=0.01',
        'Fragility fracture hazard ratio 0.63 (95% CI 0.50 to 0.79) over six years in 2000 women with osteopenia, number needed to treat 15',
        'Serious atrial fibrillation in 50 patients against 20 on placebo in HORIZON-PFT, P<0.001',
      ],
      unsupportedInferences: [
        'That the mortality reduction after hip fracture is explained by the fractures prevented — the mediation analysis attributes 8% of it to that pathway',
        'That the mortality result generalises beyond the population studied, which was people within 90 days of a repaired hip fracture',
        'That the annual dosing interval was validated by fracture data — it was set by the twelve-month bone-turnover marker curve, and the fracture trial simply used it',
        'That the atrial fibrillation signal has been explained away; no mechanism has been established and the pooled randomised estimate remains above 1',
      ],
      whatFailedInitially: [
        'Serious atrial fibrillation appeared unanticipated in the pivotal trial and was later confirmed as a class-level pooled signal, OR 1.40 (95% CI 1.02 to 1.93)',
        'The acute-phase reaction — fever, myalgia, headache, arthralgia, limb pain — affects more than one in ten and is the usual reason a second infusion is declined',
        'Renal clearance of an unmetabolised drug forced a labelled dose cap, a minimum infusion time and creatinine clearance measurement before every dose',
        'Osteonecrosis of the jaw and atypical femoral fracture were added as class warnings after approval, not found in the registration programme',
      ],
      realWorldOutcome: [
        'Approved as Zometa in 2001 and as Reclast for osteoporosis in 2007; generic since 2013, with the drug cost now trivial next to the infusion visit',
        'The only agent in this file with a randomised all-cause mortality signal, and the only one whose own trial found significantly more serious atrial fibrillation',
        'The 2018 osteopenia trial extended the evidence to a population the oral drugs had never been adequately tested in',
        'Carries the same limitation of use as the oral bisphosphonates: optimal duration has not been determined',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion, 5 mg over at least 15 minutes, once yearly for osteoporosis',
      description:
        'Given in a clinic or infusion unit. The route exists to solve the absorption problem: oral bisphosphonates deliver under 1% of a tablet, and about half of people prescribed one have stopped within a year. An infusion also cannot be undone, which is the trade in the other direction.',
      safetyProfile:
        'No boxed warning. Most common reactions above 10% are pyrexia, myalgia, headache, arthralgia and pain in extremity, concentrated after the first infusion. Labelled warnings cover hypocalcaemia, renal toxicity with a 5 mg single-dose cap and a minimum 15-minute infusion with creatinine clearance checked before each dose, osteonecrosis of the jaw, atypical femoral fracture, and severe bone, joint or muscle pain for which future doses are withheld. Serious atrial fibrillation occurred in 50 against 20 patients in HORIZON-PFT; rates of atrial fibrillation and stroke were similar between groups in HORIZON-RFT. Patients receiving Zometa must not receive Reclast.',
    },
    commonQuestions: [
      {
        q: 'Why does one infusion last a year?',
        a: 'Because the drug is not cleared from bone the way a tablet is cleared from blood. It binds hydroxyapatite with the highest affinity of any marketed bisphosphonate and simply waits there. It is released only when an osteoclast acidifies the surface it is bound to, which delivers it into that cell at the moment the cell starts working. Bone turnover markers fall within days and stay suppressed for about twelve months, and that marker curve is what set the annual interval. The fracture evidence is separate: HORIZON-PFT gave three annual infusions and measured fractures over 36 months.',
      },
      {
        q: 'Is the finding that it reduces deaths real?',
        a: 'The measurement is real and the explanation is not established. In 2127 patients treated within 90 days of a repaired hip fracture, 9.6% died on zoledronic acid against 13.3% on placebo, P=0.01. That was a safety-analysis finding rather than a prespecified efficacy endpoint. When the trialists went looking for the mechanism, subsequent fractures were strongly associated with death but explained only 8% of the treatment effect; adjusting for acute events during follow-up eliminated the benefit entirely, and treated patients were less likely to die of pneumonia and of arrhythmia. The authors called for studies in other acute illnesses, which is what a research group says when it has a result it cannot account for.',
        auditNote:
          'A single unreplicated mortality result in one population, with 8% of the effect accounted for, is a strong reason to investigate and a weak basis for a general claim.',
      },
      {
        q: 'What about the irregular heartbeat?',
        a: 'It is the most substantial unresolved safety question in this class. In the pivotal osteoporosis trial, serious atrial fibrillation — the kind requiring hospital admission — occurred in 50 patients on the drug against 20 on placebo, with a P value below 0.001, and nobody had gone looking for it. A later pooled analysis of six randomised trials in 41,375 patients found the association held across the class, with an odds ratio of 1.40 and a confidence interval from 1.02 to 1.93, while stroke and cardiovascular mortality were not increased. In the hip-fracture trial, by contrast, rates were similar between groups. No mechanism has been established.',
      },
      {
        q: 'Does it help if my bones are only slightly thin?',
        a: 'That question has an unusually good answer for this drug and a poor one for the oral bisphosphonates. A six-year New Zealand trial randomised 2000 women aged 65 and over with a T-score between -1.0 and -2.5 to four infusions or saline. Fragility fractures occurred in 122 on zoledronate against 190 on placebo, a hazard ratio of 0.63, with fifteen women needing treatment to prevent one fracture. The oral drugs have no comparable result, not because they were tested and failed but because the primary-prevention trials that exist are short, small, and in the Cochrane synthesis reported zero hip fractures.',
      },
      {
        q: 'Why will I feel unwell after the first one?',
        a: 'It is an acute-phase inflammatory response, not an allergy. More than one in ten people get fever, muscle pain, headache, joint pain or limb pain, usually within a day or two, and it is far less common after subsequent infusions. It happens because the drug transiently activates a subset of T cells that respond to the accumulated intermediates of the pathway it blocks. Severe bone, joint or muscle pain is a separate labelled reaction, and for that the label says future doses should be withheld.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Black DM et al. Once-yearly zoledronic acid for treatment of postmenopausal osteoporosis. N Engl J Med 2007;356:1809-1822 (HORIZON-PFT)',
        identifier: '10.1056/NEJMoa067312',
        kind: 'doi',
      },
      {
        label:
          'Lyles KW et al. Zoledronic acid and clinical fractures and mortality after hip fracture. N Engl J Med 2007;357:1799-1809 (HORIZON-RFT)',
        identifier: '10.1056/NEJMoa074941',
        kind: 'doi',
      },
      {
        label:
          'Colón-Emeric CS et al. Potential mediators of the mortality reduction with zoledronic acid after hip fracture. J Bone Miner Res 2010;25:91-97',
        identifier: '10.1359/jbmr.090704',
        kind: 'doi',
      },
      {
        label:
          'Reid IR et al. Fracture prevention with zoledronate in older women with osteopenia. N Engl J Med 2018;379:2407-2416',
        identifier: '10.1056/NEJMoa1808082',
        kind: 'doi',
      },
      {
        label:
          'Sharma A et al. Risk of serious atrial fibrillation and stroke with use of bisphosphonates: evidence from a meta-analysis. Chest 2013;144:1311-1322',
        identifier: '10.1378/chest.13-0675',
        kind: 'doi',
      },
      {
        label: 'HORIZON Pivotal Fracture Trial, ClinicalTrials.gov registration',
        identifier: 'NCT00049829',
        kind: 'nct',
      },
      {
        label: 'HORIZON Recurrent Fracture Trial, ClinicalTrials.gov registration',
        identifier: 'NCT00046254',
        kind: 'nct',
      },
      {
        label:
          'Reclast (zoledronic acid injection) United States prescribing information (openFDA label endpoint) — indications, warnings and precautions, adverse reactions',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22Reclast%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Raloxifene — an osteoporosis drug that never reduced a hip fracture, approved to prevent a
  //    cancer on a comparison that longer follow-up reversed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'raloxifene',
    name: 'Raloxifene',
    tradeName: 'Evista',
    sponsor: 'Eli Lilly and Company (originator, Evista, approved 1997); now made generically',
    targetGene: 'ESR1 and ESR2 — the estrogen receptor genes',
    targetProtein:
      'Estrogen receptors alpha and beta, on which it acts as an agonist in bone and an antagonist in breast and uterus',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1997,
    indication:
      'Treatment and prevention of osteoporosis in postmenopausal women; reduction in the risk of invasive breast cancer in postmenopausal women with osteoporosis and in those at high risk for invasive breast cancer. The label states it is not indicated for treating invasive breast cancer, for reducing recurrence, or for reducing the risk of noninvasive breast cancer',
    patientFriendlyIndication:
      'Thinning bones after menopause, and lowering the chance of developing one type of breast cancer',
    anatomicalSite:
      'The nucleus of bone, breast and uterine cells — the same receptor, reading out differently in each tissue',
    conditionContext: {
      conditionExplainer:
        'Estrogen holds bone loss in check, and it falls away at menopause. Giving estrogen back protects bone but stimulates breast and uterine tissue. A selective estrogen receptor modulator is an attempt to have the first effect without the second, by binding the same receptor in a shape that recruits different partner proteins in different tissues.',
      whyItMatters:
        'It is the clearest case in this file of a drug that does one thing well, a second thing well, and a third thing not at all — and of a regulator approving an indication on a comparison that longer follow-up went on to reverse.',
      whoTakesThis:
        'Postmenopausal women with or at risk of osteoporosis, and postmenopausal women at high risk of invasive breast cancer.',
      clinicalGoals:
        'Fewer spinal fractures and fewer invasive breast cancers. Not fewer hip fractures: no trial has shown that, and the pages that imply otherwise are reading across from bone density.',
    },
    oneSentenceVerdict:
      'A tissue-selective estrogen receptor modulator that cut new spinal fractures from 10.1% to 6.6% over three years in 7705 women but left non-vertebral fractures untouched at a relative risk of 0.9 (95% CI 0.8 to 1.1), and that carries a boxed warning for venous thromboembolism and for death from stroke after a 10,101-woman cardiovascular trial found 59 fatal strokes against 39 on placebo.',
    laymanHowItWorks:
      'The drug latches onto the same receptor inside cells that estrogen uses. What happens next depends on the tissue. In bone the receptor, holding this drug, recruits the helpers that switch bone-preserving genes on, so bone loss slows. In breast tissue the same drug-receptor pair recruits blockers instead, so estrogen-driven growth is suppressed rather than stimulated. One molecule, opposite effects, decided by which partner proteins are available where.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 68,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2359 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 26 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in December 1997 and generic since 2014. At roughly twenty-four cents a tablet at pharmacy acquisition it is cheaper than risedronate and about the price of alendronate, which means the choice between them is not a cost question.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The comparison depends entirely on which of its two jobs is the reason for taking it. For bone alone, a bisphosphonate has hip-fracture evidence that raloxifene does not, and does not raise clot risk. For breast cancer risk reduction, tamoxifen is the comparator, and the long-term head-to-head found raloxifene retained 76% of tamoxifen’s effect with substantially less endometrial cancer and clotting. Nothing sold as a food does either job.',
      conventionalRx: [
        {
          name: 'Alendronate',
          class: 'Nitrogen-containing bisphosphonate, oral',
          howItCompares:
            'Better on the bone endpoints that matter most: it reduced hip fracture in women with a prior vertebral fracture, which raloxifene has never been shown to do in any trial. It has no effect on breast cancer risk and no clotting or stroke warning.',
          typicalCost:
            'US$0.2842 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: hip and non-vertebral fracture evidence; no thromboembolic risk. Cons: fasting administration and oesophageal irritation; no breast-cancer effect; osteonecrosis and atypical fracture class warnings.',
        },
        {
          name: 'Tamoxifen',
          class: 'Selective estrogen receptor modulator, first generation',
          howItCompares:
            'The comparator in the STAR trial. At 81 months of median follow-up the risk ratio for invasive breast cancer, raloxifene against tamoxifen, was 1.24 (95% CI 1.05 to 1.47) — raloxifene worse, retaining about three-quarters of the effect — while endometrial cancer was 0.55 (0.36 to 0.83) and thromboembolic events 0.75 (0.60 to 0.93) in raloxifene’s favour.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for tamoxifen was held on this record at the time of writing',
          prosAndCons:
            'Pros: more effective at preventing invasive breast cancer, and usable before menopause. Cons: significantly more endometrial cancer, more uterine hyperplasia and more thromboembolic events.',
        },
        {
          name: 'Menopausal hormone therapy (estrogen, with or without a progestogen)',
          class: 'Systemic estrogen replacement',
          howItCompares:
            'Prevents bone loss by the same receptor, without the tissue selectivity. It is the drug raloxifene was designed to be an alternative to, and the label explicitly says raloxifene should not be used with systemic estrogens.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for a comparable estrogen product was held on this record at the time of writing',
          prosAndCons:
            'Pros: treats vasomotor symptoms, which raloxifene does not and can worsen. Cons: stimulates breast and endometrial tissue, which is the entire reason this drug class was developed.',
        },
      ],
      naturalFoods: [
        {
          name: 'Soy isoflavones (genistein, daidzein)',
          activeCompound: 'Genistein and daidzein',
          biologicalMechanism:
            'Plant phenols that bind estrogen receptors, with a preference for the beta isoform. They are frequently described as natural SERMs, which is a statement about receptor binding and not about fracture outcomes.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. The receptor binding is real; no isoflavene preparation has a randomised vertebral fracture result comparable to the 10.1% against 6.6% measured in MORE.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
      ],
      homeRemedies: [
        {
          name: 'Move during long journeys, and say if you are about to be immobilised',
          action:
            'Raise any planned surgery, prolonged bed rest or long-haul travel with the prescriber before it happens.',
          patientImpact:
            'The greatest risk of deep vein thrombosis and pulmonary embolism is in the first four months of treatment, and the label puts the magnitude at similar to that of hormone therapy.',
          clinicalPrecaution:
            'The label directs discontinuation at least 72 hours before and during prolonged immobilisation, with resumption only after full mobility. That is a prescriber’s instruction, and the patient’s part is making sure the question gets asked.',
        },
        {
          name: 'Expect hot flushes rather than relief from them',
          action: 'Report vasomotor symptoms as a treatment effect, not as the condition returning.',
          patientImpact:
            'This drug is an estrogen antagonist in the tissues that mediate vasomotor symptoms, so it can cause or worsen hot flushes. It is not a treatment for them.',
          clinicalPrecaution:
            'Leg cramps and hot flushes are the two commonest reasons the drug is stopped, and both are predictable from the mechanism rather than idiosyncratic.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C1CCN(CC1)CCOC2=CC=C(C=C2)C(=O)C3=C(SC4=C3C=CC(=C4)O)C5=CC=C(C=C5)O',
      chemicalFormula: 'C28H27NO4S',
      molecularWeight: '473.60 g/mol',
      targetReceptorAffinity:
        'Binds estrogen receptors alpha and beta, acting as an agonist in bone and an antagonist in breast and uterine tissue. The label attributes that split to the extent of coactivator and corepressor recruitment at target gene promoters rather than to receptor selectivity. Approximately 60% of an oral dose is absorbed but presystemic glucuronidation is extensive, so absolute bioavailability is 2%. Apparent volume of distribution is 2348 L/kg and plasma protein binding of the parent and its monoglucuronides is about 95%.',
      structureSource: {
        label:
          'PubChem CID 5035 (raloxifene) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5035',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ral-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity of the benzothiophene core and its two phenolic hydroxyls',
          description:
            'Confirm the 6-hydroxy and 4-hydroxyphenyl positions before any acylation. Those two phenols are what hydrogen-bond to the glutamate and arginine pair at the base of the receptor’s ligand pocket, exactly as the steroid A-ring of estradiol does. A methyl ether left in place at either position is a prodrug at best and inactive at worst.',
          reagentsAndBuffer:
            '6-methoxy-2-(4-methoxyphenyl)benzothiophene reference standard, 1H NMR in DMSO-d6, reversed-phase HPLC with diode array detection, mass spectrometry for demethylation completeness',
        },
        {
          id: 'ral-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Friedel-Crafts acylation with the piperidinylethoxybenzoyl side chain',
          description:
            'Attach the 4-(2-piperidin-1-ylethoxy)benzoyl group at the benzothiophene 3-position. This side chain is the whole pharmacology: it protrudes from the ligand pocket and displaces helix 12 of the receptor, which is what converts an agonist conformation into a tissue-dependent one.',
          dependsOnStepId: 'ral-w1',
          reagentsAndBuffer:
            '4-(2-piperidinoethoxy)benzoyl chloride hydrochloride, aluminium chloride in dichloromethane or chlorobenzene, nitrogen atmosphere, controlled low-temperature addition',
        },
        {
          id: 'ral-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Demethylation and crystallisation as the hydrochloride',
          description:
            'Remove both methyl ethers and crystallise the salt. Incomplete demethylation is the characteristic impurity of this route and it is not inert: the monomethyl ether binds the receptor differently, so it is a specification limit rather than a yield question.',
          dependsOnStepId: 'ral-w2',
          reagentsAndBuffer:
            'Boron tribromide or aluminium chloride with ethanethiol, aqueous work-up, hydrochloric acid salt formation, crystallisation from ethanol and water, HPLC purity against the monomethyl and dimethyl ether standards',
        },
        {
          id: 'ral-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Tissue-selective reporter assay in bone against breast cell lines',
          description:
            'Run the same compound at the same concentration through an estrogen-responsive reporter in an osteoblastic line and in an estrogen-receptor-positive breast line. Running both is the point: a single-cell-line assay will report this molecule as either an agonist or an antagonist and will be wrong either way.',
          dependsOnStepId: 'ral-w3',
          reagentsAndBuffer:
            'U2OS or MG-63 osteoblastic cells and MCF-7 breast cells, estrogen-response-element luciferase reporter, phenol-red-free medium with charcoal-stripped serum, 17-beta-estradiol positive control and vehicle control',
        },
        {
          id: 'ral-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Coregulator recruitment profiling at the receptor',
          description:
            'Measure which coactivator and corepressor peptides the ligand-bound receptor recruits. This is the assay that turns the label’s explanatory sentence into a measurement, and it is what distinguishes a genuine tissue-selective modulator from a partial agonist.',
          dependsOnStepId: 'ral-w4',
          reagentsAndBuffer:
            'Purified estrogen receptor alpha and beta ligand-binding domains, biotinylated SRC-1, SRC-2 and NCoR peptide panels, time-resolved fluorescence resonance energy transfer readout, estradiol and 4-hydroxytamoxifen as reference ligands',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ral-a1',
        category: 'measured',
        title: 'Spinal fractures fell by about a third in 7705 women',
        laymanSummary:
          'In the main osteoporosis trial, ten in a hundred women on placebo had a new spinal fracture over three years, against about seven in a hundred on the drug.',
        technicalDetails:
          'MORE randomised 7705 postmenopausal women aged 31 to 80 in 25 countries who met World Health Organization criteria for osteoporosis to raloxifene 60 mg/d, 120 mg/d or placebo, with calcium and cholecalciferol given to all. Among 6828 women with evaluable radiographs at 36 months, at least one new vertebral fracture occurred in 10.1% on placebo, 6.6% at 60 mg and 5.4% at 120 mg; relative risk 0.7 (95% CI 0.5 to 0.8) at 60 mg. Femoral-neck bone mineral density rose 2.1% and spine 2.6% at 60 mg against placebo, all P<0.001.',
        evidenceSource:
          'Ettinger B et al., JAMA 1999;282:637-645 (Multiple Outcomes of Raloxifene Evaluation)',
        doi: '10.1001/jama.282.7.637',
        measuredMetric:
          'New vertebral fracture at 36 months, 6.6% at 60 mg against 10.1% on placebo, RR 0.7 (95% CI 0.5 to 0.8)',
        auditFlag: 'verified',
      },
      {
        id: 'ral-a2',
        category: 'failed',
        title: 'It has never reduced a non-vertebral or hip fracture in any trial',
        laymanSummary:
          'The same trial counted fractures outside the spine and found no difference at all. That includes hip fractures, which are the ones that end independence.',
        technicalDetails:
          'In MORE, non-vertebral fracture risk for raloxifene against placebo was a relative risk of 0.9 (95% CI 0.8 to 1.1) with both dose groups combined, in 7705 women over three years. In RUTH, over a median 5.6 years in 10,101 women, clinical vertebral fractures fell (64 against 97 events, hazard ratio 0.65, 95% CI 0.47 to 0.89) with an absolute risk reduction of 1.3 per 1000. In STAR, comparing raloxifene with tamoxifen in 19,747 women, the number of osteoporotic fractures in the two groups was similar. No randomised trial has demonstrated a hip fracture reduction with this drug, and none of the three largest trials found one.',
        evidenceSource:
          'Ettinger B et al., JAMA 1999;282:637-645; Barrett-Connor E et al., N Engl J Med 2006;355:125-137',
        doi: '10.1001/jama.282.7.637',
        measuredMetric:
          'Non-vertebral fracture relative risk 0.9 (95% CI 0.8 to 1.1) in MORE — confidence interval spans 1',
        auditFlag: 'caution',
      },
      {
        id: 'ral-a3',
        category: 'failed',
        title: 'The cardiovascular trial missed its coronary endpoint and found fatal strokes',
        laymanSummary:
          'Ten thousand women with heart disease or heart risk took the drug or placebo for over five years. It did nothing to coronary events, which was one of the two things the trial was set up to measure. Fatal strokes were higher: 59 against 39.',
        technicalDetails:
          'RUTH randomised 10,101 postmenopausal women of mean age 67.5 with coronary heart disease or multiple risk factors for it, median follow-up 5.6 years, with two primary outcomes. Coronary events showed no significant effect: 533 against 553 events, hazard ratio 0.95 (95% CI 0.84 to 1.07). Invasive breast cancer fell: 40 against 70 events, hazard ratio 0.56 (0.38 to 0.83). Total stroke and all-cause death did not differ, but fatal stroke was increased — 59 against 39 events, hazard ratio 1.49 (95% CI 1.00 to 2.24), absolute increase 0.7 per 1000 woman-years — as was venous thromboembolism, 103 against 71 events, hazard ratio 1.44 (1.06 to 1.95). Both findings are in the boxed warning, and the label states the drug should not be used for primary or secondary prevention of cardiovascular disease.',
        evidenceSource:
          'Barrett-Connor E et al., N Engl J Med 2006;355:125-137 (RUTH, NCT00190593)',
        doi: '10.1056/NEJMoa062462',
        measuredMetric:
          'Coronary events hazard ratio 0.95 (95% CI 0.84 to 1.07); fatal stroke 59 against 39 events, hazard ratio 1.49 (1.00 to 2.24)',
        auditFlag: 'caution',
      },
      {
        id: 'ral-a4',
        category: 'conclusion_shift',
        title: 'STAR said it matched tamoxifen; longer follow-up said it did not',
        laymanSummary:
          'The head-to-head trial reported in 2006 that the two drugs prevented invasive breast cancer equally well, and the drug was approved for that use. Four years of extra follow-up showed the newer drug was significantly worse, keeping about three-quarters of the older drug’s effect.',
        technicalDetails:
          'STAR randomised 19,747 postmenopausal women of mean age 58.5 with a mean five-year breast cancer risk of 4.03% to tamoxifen 20 mg/d or raloxifene 60 mg/d for five years. The 2006 analysis reported 163 invasive breast cancers on tamoxifen against 168 on raloxifene, risk ratio 1.02 (95% CI 0.82 to 1.28), and concluded raloxifene was as effective. At a median follow-up of 81 months the risk ratio had widened to 1.24 (95% CI 1.05 to 1.47) — a significant disadvantage — with raloxifene retaining 76% of tamoxifen’s effectiveness against invasive disease. The toxicity advantages strengthened over the same period: endometrial cancer risk ratio 0.55 (0.36 to 0.83, P=0.003, not significant in the initial analysis), uterine hyperplasia 0.19 (0.12 to 0.29) and thromboembolic events 0.75 (0.60 to 0.93). There were no significant mortality differences at either analysis.',
        evidenceSource:
          'Vogel VG et al., JAMA 2006;295:2727-2741 (STAR P-2, NCT00003906); Vogel VG et al., Cancer Prev Res 2010;3:696-706 (81-month update)',
        doi: '10.1158/1940-6207.CAPR-10-0076',
        inferredClaim:
          'That raloxifene is as effective as tamoxifen at preventing invasive breast cancer — the initial conclusion, reversed by the same trial at longer follow-up',
        auditFlag: 'contested',
      },
      {
        id: 'ral-a5',
        category: 'measured',
        title: 'The label separates the cancers it prevents from the ones it does not',
        laymanSummary:
          'It is approved to lower the risk of one kind of breast cancer. The label states in the indications section that it is not for treating breast cancer, not for preventing recurrence, and not for preventing the non-invasive kind.',
        technicalDetails:
          'The Important Limitations paragraph of the label states that raloxifene is not indicated for the treatment of invasive breast cancer, for reduction of the risk of recurrence, or for reduction of the risk of noninvasive breast cancer. That last exclusion tracks the STAR data directly: noninvasive breast cancer occurred in 57 cases on tamoxifen against 80 on raloxifene in the 2006 analysis, risk ratio 1.40 (95% CI 0.98 to 2.00), narrowing to 1.22 (0.95 to 1.59) at 81 months. A limitation written into the indications rather than into the warnings is unusual, and it is there because the distinction is easy for a reader to miss.',
        evidenceSource:
          'Raloxifene hydrochloride United States prescribing information, Indications and Usage 1.3 (openFDA label endpoint); Vogel VG et al., JAMA 2006;295:2727-2741',
        doi: '10.1001/jama.295.23.joc60074',
        measuredMetric:
          'Noninvasive breast cancer, raloxifene against tamoxifen: 80 against 57 cases, risk ratio 1.40 (95% CI 0.98 to 2.00)',
        auditFlag: 'verified',
      },
      {
        id: 'ral-a6',
        category: 'measured',
        title: 'Two percent of the tablet reaches the bloodstream intact',
        laymanSummary:
          'About sixty percent of the dose is absorbed from the gut, and almost all of it is chemically tagged and inactivated on the way through the gut wall and liver. Two percent survives as the active drug.',
        technicalDetails:
          'Approximately 60% of an oral dose is absorbed, but presystemic glucuronide conjugation is extensive and absolute bioavailability is 2%. Time to maximum concentration and bioavailability are both functions of systemic interconversion and enterohepatic cycling between raloxifene and its glucuronides, which is why within-subject variability of most pharmacokinetic parameters is around 30%. A high-fat meal raises Cmax by 28% and AUC by 16% without a clinically meaningful change in exposure, so unlike a bisphosphonate this drug can be taken with food. The disposition data come from more than 3000 women in the osteoporosis programme analysed by a population approach.',
        evidenceSource:
          'Raloxifene hydrochloride United States prescribing information, Clinical Pharmacology 12.3 (openFDA label endpoint)',
        measuredMetric:
          'Absolute bioavailability 2% despite approximately 60% absorption; within-subject pharmacokinetic variability about 30%',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, well absorbed, and then almost entirely inactivated',
        laymanDesc:
          'Most of the tablet crosses the gut wall, and then the body tags nearly all of it for disposal before it reaches the circulation. Only about one fiftieth arrives as the working molecule.',
        molecularDetail:
          'Roughly 60% of an oral dose is absorbed; extensive presystemic glucuronidation in gut wall and liver leaves an absolute bioavailability of 2%. The glucuronides are not simply waste: systemic interconversion and enterohepatic cycling between parent and conjugate govern exposure, and are the reason variability is about 30%.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters cells and binds the estrogen receptor',
        laymanDesc:
          'The molecule slips into cells everywhere and binds the same receptor estrogen uses. That much is identical in bone, breast and womb.',
        molecularDetail:
          'The benzothiophene core’s two phenolic hydroxyls hydrogen-bond to the glutamate-arginine pair and to a histidine at opposite ends of the ligand-binding pocket, the same contacts the A-ring and D-ring hydroxyls of estradiol make. Apparent volume of distribution is 2348 L/kg and protein binding of parent and monoglucuronides is about 95%.',
        iconName: 'Target',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A side chain forces the receptor into a different shape',
        laymanDesc:
          'Unlike estrogen, this molecule has an arm that sticks out of the binding pocket and pushes a lid on the receptor out of place. That displaced lid is why the same receptor behaves differently in different tissues.',
        molecularDetail:
          'The 4-(2-piperidinylethoxy)benzoyl side chain protrudes from the pocket and displaces helix 12, which in the estradiol-bound receptor caps the pocket and completes the coactivator groove. With helix 12 displaced, the surface that partner proteins read is a different one.',
        iconName: 'Wrench',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Which partner proteins are available decides the answer',
        laymanDesc:
          'In bone the altered receptor still recruits switches-on. In breast and womb it recruits switches-off. Same drug, same receptor, opposite result, decided by what else is in the cell.',
        molecularDetail:
          'The label attributes agonism or antagonism to the extent of coactivator and corepressor recruitment at estrogen receptor target gene promoters. Cell-type differences in the abundance of SRC-family coactivators and NCoR-family corepressors, and in the ratio of receptor alpha to beta, are what convert one conformation into two opposite transcriptional outcomes.',
        iconName: 'GitBranch',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In bone, resorption slows and spinal fractures fall',
        laymanDesc:
          'Bone turnover markers drop within three months and stay down. Spinal fractures fell by about a third. Fractures elsewhere did not fall at all.',
        molecularDetail:
          'Suppression of bone resorption and formation markers is evident by 3 months and persists through 36 months. Density gains are modest — 2.1% at the femoral neck and 2.6% at the spine at 60 mg — and the fracture effect is confined to the vertebrae: non-vertebral relative risk was 0.9 (95% CI 0.8 to 1.1).',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'In breast tissue it blocks growth; in veins it raises clot risk',
        laymanDesc:
          'Invasive breast cancers were roughly halved in the cardiovascular trial. In the same trial, clots and fatal strokes were more frequent, and both are in the boxed warning.',
        molecularDetail:
          'RUTH: invasive breast cancer hazard ratio 0.56 (95% CI 0.38 to 0.83), driven by estrogen-receptor-positive tumours; venous thromboembolism hazard ratio 1.44 (1.06 to 1.95); fatal stroke 1.49 (1.00 to 2.24). The thromboembolic effect is a residual estrogenic action on hepatic coagulation factor synthesis — a case where the tissue selectivity does not hold.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MORE — Multiple Outcomes of Raloxifene Evaluation (Ettinger 1999)',
        phase: 'Phase 3, randomised, blinded, placebo-controlled',
        sampleSize: 7705,
        primaryEndpoint: 'Incident vertebral fracture by radiograph at 24 and 36 months',
        endpointMet: true,
        statisticalPValue:
          '6.6% at 60 mg against 10.1% on placebo, relative risk 0.7 (95% CI 0.5 to 0.8)',
        unreportedAdverseSignals:
          'Non-vertebral fracture relative risk was 0.9 (95% CI 0.8 to 1.1) — no effect — and venous thromboembolism relative risk was 3.1 (1.5 to 6.2). Both appear in the same abstract as the headline result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'RUTH — Raloxifene Use for The Heart (NCT00190593)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 10101,
        primaryEndpoint:
          'Two co-primary outcomes: coronary events, and invasive breast cancer, over a median 5.6 years',
        endpointMet: false,
        statisticalPValue:
          'Coronary events hazard ratio 0.95 (95% CI 0.84 to 1.07) — not met; invasive breast cancer hazard ratio 0.56 (0.38 to 0.83) — met',
        unreportedAdverseSignals:
          'Fatal stroke 59 against 39 events, hazard ratio 1.49 (1.00 to 2.24), and venous thromboembolism 103 against 71, hazard ratio 1.44 (1.06 to 1.95). Both are now in the boxed warning.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'STAR P-2 (NCT00003906), initial analysis 2006',
        phase: 'Phase 3, randomised, double-blind, active-controlled against tamoxifen',
        sampleSize: 19747,
        primaryEndpoint: 'Incidence of invasive breast cancer',
        endpointMet: true,
        statisticalPValue:
          '168 against 163 cases; risk ratio 1.02 (95% CI 0.82 to 1.28) — reported as equivalence',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'STAR P-2, 81-month update (Vogel 2010)',
        phase: 'Extended follow-up of the same randomised cohort',
        sampleSize: 19747,
        primaryEndpoint: 'Incidence of invasive breast cancer at a median 81 months',
        endpointMet: false,
        statisticalPValue:
          'Risk ratio raloxifene against tamoxifen 1.24 (95% CI 1.05 to 1.47) — raloxifene significantly worse, retaining 76% of the effect',
        unreportedAdverseSignals:
          'The 2006 conclusion of equivalence supported an approval. The reversal at longer follow-up is in the same trial and is far less widely quoted.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'New vertebral fracture 6.6% against 10.1% over three years in 7705 women, relative risk 0.7 (95% CI 0.5 to 0.8)',
        'Invasive breast cancer hazard ratio 0.56 (95% CI 0.38 to 0.83) in 10,101 women over a median 5.6 years',
        'Non-vertebral fracture relative risk 0.9 (95% CI 0.8 to 1.1) — no measurable effect',
        'Fatal stroke hazard ratio 1.49 (95% CI 1.00 to 2.24) and venous thromboembolism 1.44 (1.06 to 1.95) in RUTH',
        'Absolute oral bioavailability 2%, from approximately 60% absorption',
      ],
      unsupportedInferences: [
        'That an osteoporosis drug which reduces spinal fractures also reduces hip fractures — this one does not, in any trial',
        'That it protects the heart, which is what RUTH was built to test and did not find',
        'That it matches tamoxifen for breast cancer prevention, the 2006 conclusion that 81-month follow-up reversed',
        'That tissue selectivity is complete — the clotting and stroke effects are estrogenic actions the selectivity did not exclude',
      ],
      whatFailedInitially: [
        'The coronary co-primary endpoint of RUTH was not met: hazard ratio 0.95 (95% CI 0.84 to 1.07) in 10,101 women',
        'Non-vertebral fracture was not reduced in MORE, in RUTH, or against tamoxifen in STAR',
        'Venous thromboembolism relative risk was 3.1 (95% CI 1.5 to 6.2) in MORE and the class of harm reached the boxed warning',
        'The equivalence conclusion of STAR did not survive four more years of follow-up of the same women',
      ],
      realWorldOutcome: [
        'Approved in 1997 for osteoporosis and later for breast cancer risk reduction; generic since 2014 at about twenty-four cents a tablet',
        'The label carries a boxed warning for venous thromboembolism and for death from stroke, and states the drug should not be used for cardiovascular prevention',
        'The indications section carries an unusual explicit limitation: not for treating breast cancer, not for recurrence, not for noninvasive disease',
        'It remains a reasonable choice where a bisphosphonate cannot be used and spinal fracture is the concern, and a poor one where hip fracture is',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, 60 mg once daily',
      description:
        'Taken with or without food, which is a real practical advantage over the oral bisphosphonates. A high-fat meal raises peak concentration by 28% without a clinically meaningful change in overall exposure.',
      safetyProfile:
        'Boxed warning for increased risk of venous thromboembolism and for death from stroke. Deep vein thrombosis, pulmonary embolism and retinal vein thrombosis are labelled risks, greatest in the first four months, with the label directing discontinuation at least 72 hours before and during prolonged immobilisation. The drug is not to be used for primary or secondary prevention of cardiovascular disease, is not recommended in premenopausal women, and is not recommended with systemic estrogens. Hot flushes and leg cramps are the commonest reasons for stopping and follow directly from the mechanism.',
    },
    commonQuestions: [
      {
        q: 'Will it stop me breaking a hip?',
        a: 'No trial has shown that it does. MORE measured non-vertebral fractures in 7705 women over three years and found a relative risk of 0.9 with a confidence interval from 0.8 to 1.1 — no effect. RUTH followed 10,101 women for a median of 5.6 years and reduced clinical vertebral fractures only. STAR found the number of osteoporotic fractures similar between raloxifene and tamoxifen in 19,747 women. What the drug is shown to do is reduce spinal fractures, by about a third. If hip fracture is the concern, the bisphosphonates have evidence this drug does not.',
        auditNote:
          'This is the clearest example in the file of a drug that raises bone density and reduces one fracture type without reducing another. Density is not the outcome.',
      },
      {
        q: 'Does it prevent breast cancer as well as tamoxifen?',
        a: 'It was approved on the finding that it did, and longer follow-up of the same trial found it did not. In 2006, STAR reported 168 invasive breast cancers on raloxifene against 163 on tamoxifen in 19,747 women, a risk ratio of 1.02, and concluded the two were equivalent. At a median of 81 months the risk ratio was 1.24 with a confidence interval from 1.05 to 1.47 — significantly worse — and the authors described raloxifene as retaining 76% of tamoxifen’s effectiveness. What did hold up, and strengthened, was raloxifene’s safety advantage: significantly less endometrial cancer, far less uterine hyperplasia, and fewer clots.',
        auditNote:
          'An equivalence claim from an interim horizon and a superiority claim from a later one are the same trial. The later analysis is the more informative and the less quoted.',
      },
      {
        q: 'Why is there a boxed warning about stroke if strokes were not increased?',
        a: 'Because fatal strokes were, and total strokes were not. In RUTH there was no significant difference in stroke overall or in death from any cause, but deaths due to stroke were 59 against 39, a hazard ratio of 1.49 with a confidence interval running from 1.00 to 2.24 and an absolute increase of 0.7 per 1000 woman-years. The label reflects that split precisely: the Warnings section says an increased risk of death due to stroke occurred and that no increased risk of stroke was seen. It applies to a trial population selected for coronary disease or high coronary risk.',
      },
      {
        q: 'How can one drug help bone and block breast tissue at the same time?',
        a: 'Because a receptor is not a switch, it is a docking surface, and what docks next depends on the tissue. The molecule carries a side chain that sticks out of the receptor’s binding pocket and displaces the helix that would normally close over it. That changes the shape of the surface where partner proteins attach. In bone the abundant partners are activators, and bone-preserving genes turn on. In breast tissue the abundant partners are repressors, and growth genes stay off. The label states this directly, attributing the split to the extent of coactivator and corepressor recruitment rather than to any selectivity between receptors.',
      },
      {
        q: 'Will it help with hot flushes?',
        a: 'It is likely to do the opposite. In the tissues that mediate vasomotor symptoms this drug is an estrogen antagonist, so hot flushes are among the commonest reasons it is stopped, along with leg cramps. It is not a treatment for menopausal symptoms and the label does not recommend using it alongside systemic estrogens.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ettinger B et al. Reduction of vertebral fracture risk in postmenopausal women with osteoporosis treated with raloxifene: results from a 3-year randomized clinical trial (MORE). JAMA 1999;282:637-645',
        identifier: '10.1001/jama.282.7.637',
        kind: 'doi',
      },
      {
        label:
          'Barrett-Connor E et al. Effects of raloxifene on cardiovascular events and breast cancer in postmenopausal women (RUTH). N Engl J Med 2006;355:125-137',
        identifier: '10.1056/NEJMoa062462',
        kind: 'doi',
      },
      {
        label:
          'Vogel VG et al. Effects of tamoxifen vs raloxifene on the risk of developing invasive breast cancer and other disease outcomes: the NSABP Study of Tamoxifen and Raloxifene (STAR) P-2 trial. JAMA 2006;295:2727-2741',
        identifier: '10.1001/jama.295.23.joc60074',
        kind: 'doi',
      },
      {
        label:
          'Vogel VG et al. Update of the NSABP Study of Tamoxifen and Raloxifene (STAR) P-2 trial: preventing breast cancer. Cancer Prev Res 2010;3:696-706',
        identifier: '10.1158/1940-6207.CAPR-10-0076',
        kind: 'doi',
      },
      {
        label: 'RUTH — Raloxifene Use for The Heart, ClinicalTrials.gov registration',
        identifier: 'NCT00190593',
        kind: 'nct',
      },
      {
        label: 'STAR P-2 — Study of Tamoxifen and Raloxifene, ClinicalTrials.gov registration',
        identifier: 'NCT00003906',
        kind: 'nct',
      },
      {
        label:
          'Raloxifene hydrochloride United States prescribing information (openFDA label endpoint) — boxed warning, indications and limitations, clinical pharmacology',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22raloxifene+hydrochloride%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
