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

  // ---------------------------------------------------------------------------------------------
  // 5. Teriparatide — the hormone that dissolves bone when it is always present and builds bone
  //    when it arrives once a day, and the rat tumour finding that shaped its label for 18 years.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'teriparatide',
    name: 'Teriparatide',
    tradeName: 'Forteo / Bonsity',
    sponsor:
      'Eli Lilly and Company (originator, Forteo, approved 2002); biosimilar and follow-on products now exist',
    targetGene: 'PTH1R — the parathyroid hormone 1 receptor gene, on osteoblasts and kidney tubule',
    targetProtein:
      'Parathyroid hormone 1 receptor, a G-protein-coupled receptor; the drug is the first 34 amino acids of human parathyroid hormone',
    modality: 'Peptide / GLP-1 Agonist',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Treatment of postmenopausal women with osteoporosis at high risk for fracture or who have failed or are intolerant of other therapy; to increase bone mass in men with primary or hypogonadal osteoporosis at high risk; and treatment of men and women with osteoporosis associated with sustained systemic glucocorticoid therapy at high risk for fracture',
    patientFriendlyIndication:
      'Severe bone thinning, where the aim is to build new bone rather than only slow its loss',
    anatomicalSite:
      'The osteoblast and its precursor on the bone surface, and the kidney tubule where the same receptor handles calcium and phosphate',
    conditionContext: {
      conditionExplainer:
        'Parathyroid hormone is the body’s calcium thermostat. When calcium in blood falls, the parathyroid glands release it, and one of the things it does is release calcium from bone. A person whose glands are overactive loses bone continuously. Yet the same hormone, given as one injection a day rather than being present constantly, builds bone instead.',
      whyItMatters:
        'Every other drug in this file slows bone loss. This one and romosozumab are the only two that add bone, and this is the older of them. The reason it works is a timing effect, not a different molecule, and that is one of the more surprising results in endocrinology.',
      whoTakesThis:
        'People with severe osteoporosis at high fracture risk, particularly those who have already fractured on an antiresorptive drug or cannot take one.',
      clinicalGoals:
        'Fewer fractures. In the one head-to-head trial with fracture as the declared primary outcome, it beat risedronate.',
    },
    oneSentenceVerdict:
      'The first 34 amino acids of parathyroid hormone, injected once daily so the receptor is pulsed rather than saturated, which cut new spinal fractures from 14% to 5% and non-vertebral fragility fractures from 6% to 3% in 1637 women, and which carried a boxed warning for osteosarcoma from 2002 until 2020 on the strength of a rat study that human surveillance has not reproduced.',
    laymanHowItWorks:
      'Parathyroid hormone is the signal that pulls calcium out of bone when blood calcium falls. If it is present all the time, bone is lost. If it arrives as one short daily spike, the effect reverses: the cells that build bone survive longer and work harder, and the demolition response never has time to get going. The drug is a fragment of that hormone, injected once a day to produce exactly that spike.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 85,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$494.81 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 10 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in November 2002. The original patents have expired and follow-on products exist, but the acquisition price remains roughly two thousand times that of a generic bisphosphonate tablet per unit. Peptide manufacture and a refrigerated multidose pen are genuinely more expensive than a pressed tablet; whether they are that much more expensive is not something this dataset can answer.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The choice here is between building bone and preserving it, and the evidence now favours building first in people at very high risk. Teriparatide beat risedronate on fracture in a trial designed for that comparison. Romosozumab beat alendronate in a trial designed for that comparison and carries a cardiovascular boxed warning teriparatide does not. What all three anabolic strategies share is that the gain is lost unless an antiresorptive follows, which makes them a first course rather than a treatment.',
      conventionalRx: [
        {
          name: 'Risedronate',
          class: 'Nitrogen-containing bisphosphonate, oral',
          howItCompares:
            'The comparator in VERO, the first trial to compare two osteoporosis drugs with incident fracture as the primary outcome. New vertebral fractures at 24 months were 5.4% on teriparatide against 12.0% on risedronate, risk ratio 0.44 (95% CI 0.29 to 0.68).',
          typicalCost:
            'US$2.01 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 13 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a tablet, and a tiny fraction of the cost. Cons: significantly more vertebral and clinical fractures than teriparatide in the head-to-head trial in women with severe osteoporosis.',
        },
        {
          name: 'Romosozumab',
          class: 'Anti-sclerostin monoclonal antibody, monthly for twelve months',
          howItCompares:
            'The other bone-building option, and the only one that raises formation and lowers resorption at the same time. It is given monthly rather than daily, for twelve months rather than up to two years, and carries a boxed warning for myocardial infarction, stroke and cardiovascular death.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for romosozumab was held on this record at the time of writing',
          prosAndCons:
            'Pros: monthly rather than daily injection; larger early density gains. Cons: cardiovascular boxed warning; a fixed twelve-month course.',
        },
        {
          name: 'Abaloparatide',
          class: 'Parathyroid hormone-related protein analogue, daily subcutaneous',
          howItCompares:
            'A closely related anabolic peptide acting at the same receptor with a different bias between its two conformations, which is the basis of the claim that it produces less resorptive response. No head-to-head fracture trial separates the two.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for abaloparatide was held on this record at the time of writing',
          prosAndCons:
            'Pros: same anabolic mechanism, room-temperature stability in the marketed pen. Cons: no fracture comparison against teriparatide; the receptor-bias argument is a pharmacology claim, not an outcome.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Take the first dose where you can sit or lie down',
          action: 'Plan the first few injections for a moment when standing up is optional.',
          patientImpact:
            'Transient orthostatic hypotension is a labelled reaction to initial doses. It reflects the vascular action of the hormone and settles.',
          clinicalPrecaution:
            'The label frames this as a caution about initial doses specifically, not an ongoing one.',
        },
        {
          name: 'Say if you have ever had radiotherapy involving bone',
          action:
            'Include implant radiation and childhood treatment, not only recent external beam.',
          patientImpact:
            'The label directs avoiding the drug in people at increased baseline risk of osteosarcoma, which includes prior skeletal radiation, Paget disease, bone metastases, open growth plates and hereditary predisposition.',
          clinicalPrecaution:
            'This is a contraindication list built around a baseline risk, not a claim that the drug causes the tumour in ordinary use. The distinction is the whole audit on this page.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC[C@H](C)[C@@H](C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCSC)C(=O)N[C@@H](CC1=CNC=N1)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](CC(C)C)C(=O)NCC(=O)N[C@@H](CCCCN)C(=O)N[C@@H](CC2=CNC=N2)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](CO)C(=O)N[C@@H](CCSC)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CCCNC(=N)N)C(=O)N[C@@H](C(C)C)C(=O)N[C@@H](CCC(=O)O)C(=O)N[C@@H](CC3=CNC4=CC=CC=C43)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCCNC(=N)N)C(=O)N[C@@H](CCCCN)C(=O)N[C@@H](CCCCN)C(=O)N[C@@H](CC(C)C)C(=O)N[C@@H](CCC(=O)N)C(=O)N[C@@H](CC(=O)O)C(=O)N[C@@H](C(C)C)C(=O)N[C@@H](CC5=CNC=N5)C(=O)N[C@@H](CC(=O)N)C(=O)N[C@@H](CC6=CC=CC=C6)C(=O)O)NC(=O)[C@H](CCC(=O)O)NC(=O)[C@H](CO)NC(=O)[C@H](C(C)C)NC(=O)[C@H](CO)N',
      chemicalFormula: 'C181H291N55O51S2',
      molecularWeight: '4118.00 g/mol',
      targetReceptorAffinity:
        'Binds the parathyroid hormone 1 receptor, a class B G-protein-coupled receptor, through the same N-terminal 1-34 region as the full 84-residue hormone; residues 1-34 carry essentially all the receptor-activating information, which is why the fragment is the drug. The structure is declared here as a connection table rather than as a residue sequence because the record holds a machine-checked SMILES, and a sequence declaration with a connection table has been rejected before in this corpus.',
      structureSource: {
        label:
          'PubChem CID 16133850 (teriparatide) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/16133850',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ter-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Sequence and N-terminal integrity check',
          description:
            'Confirm the full 34-residue sequence and, above all, that residues 1 and 2 are intact. Removing even the first two amino acids converts an agonist into an antagonist at this receptor, and truncation at the N-terminus is the characteristic degradation of this peptide in storage.',
          reagentsAndBuffer:
            'Reference standard, Edman degradation or LC-MS/MS peptide mapping after endoproteinase digestion, intact-mass electrospray mass spectrometry, amino acid analysis after acid hydrolysis',
        },
        {
          id: 'ter-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Recombinant expression in Escherichia coli',
          description:
            'Express the 34-residue peptide as a fusion in E. coli and cleave it. Recombinant production rather than solid-phase synthesis is what makes a 34-mer economic at this scale, and it moves the hard problem from coupling efficiency to correct cleavage at exactly the right residue.',
          dependsOnStepId: 'ter-w1',
          reagentsAndBuffer:
            'E. coli expression strain with a fusion-partner construct, isopropyl beta-D-thiogalactoside induction, cell lysis under controlled shear, site-specific protease for fusion cleavage',
        },
        {
          id: 'ter-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Preparative chromatography and formulation into the multidose pen',
          description:
            'Purify to remove the fusion partner, host-cell protein and the deamidated and oxidised variants, then formulate. The pen is a multidose device kept refrigerated, so the formulation has to hold a peptide stable through repeated withdrawal over weeks rather than a single use.',
          dependsOnStepId: 'ter-w2',
          reagentsAndBuffer:
            'Preparative reversed-phase and ion-exchange chromatography, acetate buffer with mannitol and metacresol as in the marketed formulation, host-cell protein and residual DNA immunoassays, endotoxin testing',
        },
        {
          id: 'ter-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Pulsatile against continuous exposure in an osteoblastic line',
          description:
            'Give the same total amount of peptide to osteoblastic cells as a short daily pulse and as a continuous infusion, and compare. This is the experiment the whole drug rests on: continuous exposure raises RANKL and drives resorption, intermittent exposure favours formation, and an assay that only uses continuous dosing measures the opposite of the therapeutic effect.',
          dependsOnStepId: 'ter-w3',
          reagentsAndBuffer:
            'UMR-106 or primary calvarial osteoblasts, medium exchange protocol for one-hour pulse against 24-hour continuous exposure, cyclic AMP accumulation assay, RANKL and osteoprotegerin quantification by immunoassay',
        },
        {
          id: 'ter-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Bone formation marker time course and calcium safety readout',
          description:
            'Track procollagen type 1 N-propeptide as the formation readout and serum and urinary calcium as the safety readout. Both are needed: the same receptor that drives the bone effect also drives renal calcium handling, and hypercalcaemia and urolithiasis are labelled cautions rather than theoretical ones.',
          dependsOnStepId: 'ter-w4',
          reagentsAndBuffer:
            'Fasting serum for P1NP and CTX by automated immunoassay, albumin-corrected serum calcium, 24-hour urinary calcium, standardised sampling time relative to injection to control the post-dose calcium peak',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ter-a1',
        category: 'measured',
        title: 'It cut spinal fractures by two-thirds and non-spinal fractures by half',
        laymanSummary:
          'In 1637 women who had already fractured a vertebra, fourteen in a hundred on placebo had a new spinal fracture over a median of 21 months, against five in a hundred on the drug. Fractures outside the spine halved as well.',
        technicalDetails:
          'Neer and colleagues randomised 1637 postmenopausal women with prior vertebral fractures to 20 or 40 micrograms of PTH(1-34) or placebo by daily self-injection, with a median observation of 21 months. New vertebral fractures occurred in 14% on placebo, 5% at 20 micrograms and 4% at 40 micrograms; relative risks 0.35 (95% CI 0.22 to 0.55) and 0.31 (0.19 to 0.50). New non-vertebral fragility fractures occurred in 6% on placebo and 3% in each active group, relative risks 0.47 (0.25 to 0.88) and 0.46 (0.25 to 0.86). Lumbar spine bone density rose 9 and 13 percentage points more than placebo and femoral neck 3 and 6; the 40 microgram dose decreased radial shaft density by 2 percentage points more than placebo.',
        evidenceSource: 'Neer RM et al., N Engl J Med 2001;344:1434-1441',
        doi: '10.1056/NEJM200105103441904',
        measuredMetric:
          'New vertebral fracture 5% against 14%, relative risk 0.35 (95% CI 0.22 to 0.55); non-vertebral fragility fracture 3% against 6%, RR 0.47 (0.25 to 0.88)',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a2',
        category: 'measured',
        title: 'The first trial to compare two osteoporosis drugs on fracture, and it won',
        laymanSummary:
          'Until 2018 no trial had compared two osteoporosis drugs with fractures as the main thing being counted. VERO did, against risedronate, and spinal fractures were less than half as common on teriparatide.',
        technicalDetails:
          'VERO enrolled 680 women per group with at least two moderate or one severe vertebral fracture and a T-score of -1.50 or lower, randomised double-blind and double-dummy to teriparatide 20 micrograms daily or risedronate 35 mg weekly for 24 months. New radiographic vertebral fractures, the primary outcome, occurred in 28 of 680 (5.4%) on teriparatide against 64 of 680 (12.0%) on risedronate, risk ratio 0.44 (95% CI 0.29 to 0.68, P<0.0001). Clinical fractures occurred in 30 (4.8%) against 61 (9.8%), hazard ratio 0.48 (0.32 to 0.74, P=0.0009). Non-vertebral fragility fractures were 25 (4.0%) against 38 (6.1%), hazard ratio 0.66 (0.39 to 1.10, P=0.10) — not significant. The trial was funded by Lilly.',
        evidenceSource:
          'Kendler DL et al., Lancet 2018;391:230-240 (VERO, NCT01709110)',
        doi: '10.1016/S0140-6736(17)32137-2',
        measuredMetric:
          'New vertebral fracture at 24 months, 5.4% against 12.0%, risk ratio 0.44 (95% CI 0.29 to 0.68)',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a3',
        category: 'conclusion_shift',
        title: 'The osteosarcoma warning: from rats, to a boxed warning, to its removal in 2020',
        laymanSummary:
          'Rats given the drug for two years developed bone tumours at high rates, and the drug carried the strongest possible warning for eighteen years. Human surveillance never found the same thing, and the boxed warning and the two-year limit were removed in 2020.',
        technicalDetails:
          'Fischer 344 rats, 60 per sex per group, given daily PTH(1-34) for two years at 5, 30 or 75 micrograms per kilogram developed osteosarcoma in 3, 21 and 31 males and 4, 12 and 23 females respectively. The authors themselves concluded that the lesions reflected the long treatment duration relative to the rat lifespan and the exaggerated response of the growing rat skeleton, and were likely not predictive for skeletally mature adults treated for a limited period. Regulators nonetheless required a boxed warning and a lifetime limit of two years. The Forteo Patient Registry then followed 75,247 enrolled United States patients over 361,763 person-years, linked annually to 42 state cancer registries covering 93% of the population, and found no incident osteosarcoma: crude incidence rate 0 (95% CI 0 to 10.2) per million person-years, standardised incidence ratio 0 (95% CI 0 to 3.0). The registry authors are explicit that follow-up time was smaller than expected and that no cases were found, which limits what can be concluded. The current label carries no boxed warning and states that an increased risk of osteosarcoma has not been observed in observational studies in humans, while noting limited data beyond two years of use.',
        evidenceSource:
          'Vahle JL et al., Toxicol Pathol 2002;30:312-321; Gilsenan A et al., Osteoporos Int 2021;32:645-651; teriparatide United States prescribing information, Warnings and Precautions 5.1',
        doi: '10.1007/s00198-020-05718-0',
        inferredClaim:
          'That a rat carcinogenicity signal at up to 75 micrograms per kilogram for a rat’s whole adult life predicts human risk at 20 micrograms a day for two years — an inference the study authors disputed at the time and that eighteen years of human surveillance did not support',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a4',
        category: 'inferred',
        title: 'A registry that found zero cases is weaker evidence than zero suggests',
        laymanSummary:
          'The safety study found no cases of bone cancer at all. That sounds conclusive, but the researchers say the amount of follow-up was smaller than planned, and finding nothing in a short window is not the same as showing there is nothing.',
        technicalDetails:
          'The Forteo Patient Registry accumulated 361,763 person-years across 75,247 enrolled patients. Against a background osteosarcoma rate of about 3 per million person-years, that person-time predicts roughly one expected case, so observing zero yields a confidence interval on the incidence rate of 0 to 10.2 per million person-years and a standardised incidence ratio interval of 0 to 3.0. An upper bound of 3 means a threefold excess would not have been excluded. Enrolment was voluntary and exposure self-reported, which introduces a second limitation the authors state directly in their conclusion. The finding is genuinely reassuring and it is not a demonstration of no effect.',
        evidenceSource:
          'Gilsenan A et al., Long-term cancer surveillance: results from the Forteo Patient Registry Surveillance Study. Osteoporos Int 2021;32:645-651',
        doi: '10.1007/s00198-020-05718-0',
        inferredClaim:
          'That zero observed cases proves no risk — the upper confidence bound on the standardised incidence ratio is 3.0, and the study was funded by the manufacturer with voluntary enrolment and self-reported exposure',
        auditFlag: 'caution',
      },
      {
        id: 'ter-a5',
        category: 'measured',
        title: 'The same hormone destroys bone if it is present continuously',
        laymanSummary:
          'People whose parathyroid glands are overactive lose bone, because the hormone is always there. Given as one spike a day, the identical molecule builds bone. The difference is entirely in the timing.',
        technicalDetails:
          'Continuous elevation of parathyroid hormone, as in primary hyperparathyroidism or a continuous infusion, raises osteoblast RANKL expression and lowers osteoprotegerin, driving osteoclast recruitment and net bone loss, particularly cortical. Intermittent once-daily exposure produces a transient receptor signal that favours osteoblast survival and differentiation before the resorptive programme is engaged, giving a period of uncoupled formation known as the anabolic window. The clinical signature of that asymmetry is visible in the pivotal trial: lumbar spine density rose 9 to 13 percentage points above placebo while the 40 microgram dose lowered density at the radial shaft, a predominantly cortical site, by 2 percentage points.',
        evidenceSource:
          'Neer RM et al., N Engl J Med 2001;344:1434-1441, bone mineral density results by site',
        doi: '10.1056/NEJM200105103441904',
        measuredMetric:
          'Lumbar spine density +9 and +13 percentage points against placebo; radial shaft density -2 percentage points at 40 micrograms',
        auditFlag: 'verified',
      },
      {
        id: 'ter-a6',
        category: 'failed',
        title: 'The head-to-head trial did not reduce non-vertebral fractures significantly',
        laymanSummary:
          'In the comparison against risedronate, spinal and clinical fractures were clearly fewer. Fractures outside the spine were fewer too, but not by enough to be sure the difference was real.',
        technicalDetails:
          'In VERO, non-vertebral fragility fractures occurred in 25 of 680 (4.0%) on teriparatide against 38 of 680 (6.1%) on risedronate, hazard ratio 0.66 (95% CI 0.39 to 1.10, P=0.10). It was a gated secondary outcome, and the gating sequence means the result should be read as descriptive. The pivotal placebo-controlled trial did reduce non-vertebral fragility fracture, 3% against 6% with a relative risk of 0.47, so the finding is that teriparatide beats placebo on this endpoint and has not been shown to beat risedronate on it. The two statements are compatible and are routinely merged.',
        evidenceSource: 'Kendler DL et al., Lancet 2018;391:230-240 (VERO)',
        doi: '10.1016/S0140-6736(17)32137-2',
        measuredMetric:
          'Non-vertebral fragility fracture, teriparatide against risedronate: hazard ratio 0.66 (95% CI 0.39 to 1.10), P=0.10',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected once a day under the skin',
        laymanDesc:
          'A small daily injection from a pen kept in the fridge. The daily rhythm is not a convenience choice — it is the mechanism.',
        molecularDetail:
          'Subcutaneous 20 micrograms of recombinant human PTH(1-34) produces a short, high peak and rapid clearance. The pharmacokinetic profile is the therapeutic principle: a sustained-release version of this molecule would be a different and worse drug.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It binds the parathyroid hormone receptor on bone-building cells',
        laymanDesc:
          'The fragment carries all the parts of the hormone the receptor reads. It docks on the cells that build bone and on their precursors.',
        molecularDetail:
          'PTH(1-34) contains essentially all the receptor-activating information of the 84-residue hormone. It binds PTH1R, a class B G-protein-coupled receptor, on osteoblasts, osteocytes and bone marrow stromal precursors, and in the renal tubule where the same receptor governs calcium reabsorption and phosphate excretion.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The signal is over before the demolition response starts',
        laymanDesc:
          'A brief pulse tells the building cells to survive and get to work. The instruction that would summon the demolition cells needs sustained signalling, and the pulse ends first.',
        molecularDetail:
          'Receptor activation raises cyclic AMP and activates protein kinase A, driving CREB-dependent transcription that suppresses osteoblast apoptosis and recruits lining cells and precursors into active osteoblasts. Sustained signalling raises RANKL and lowers osteoprotegerin in the same cells, which is the resorptive arm; an intermittent pulse dissipates before that arm dominates.',
        iconName: 'Clock',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Bone is added, including in places nothing was being remodelled',
        laymanDesc:
          'For a period the building runs ahead of the demolition. New bone is laid down on existing surfaces as well as at sites being rebuilt, which is what no antiresorptive drug can do.',
        molecularDetail:
          'Formation markers such as P1NP rise within weeks and precede the rise in resorption markers, defining the anabolic window. Both remodelling-based and modelling-based formation occur, the latter adding bone on quiescent surfaces without a preceding resorption pit.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Spine gains most; the cortical shaft of the forearm can lose a little',
        laymanDesc:
          'The gain is not even across the skeleton. Spinal density rose sharply, while the shaft of the forearm at the higher dose lost a small amount.',
        molecularDetail:
          'In the pivotal trial lumbar spine density rose 9 and 13 percentage points above placebo at 20 and 40 micrograms and femoral neck 3 and 6, while the 40 microgram dose reduced radial shaft density by 2 percentage points more than placebo. Total-body bone mineral rose 2 to 4 percentage points. The pattern reflects the higher trabecular surface-to-volume ratio in the spine and the increased cortical remodelling the hormone also drives.',
        iconName: 'BarChart',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Fewer fractures, and the gain has to be locked in afterwards',
        laymanDesc:
          'Spinal fractures fell by about two-thirds against placebo, and by more than half against risedronate. Bone gained this way is lost again unless a bone-preserving drug follows.',
        molecularDetail:
          'Neer: vertebral fracture relative risk 0.35 (95% CI 0.22 to 0.55). VERO: 5.4% against 12.0% on risedronate, risk ratio 0.44 (0.29 to 0.68). Because the newly formed bone is remodelled at the prevailing rate once the anabolic stimulus stops, sequential therapy is the standard approach — which makes this a course rather than a maintenance drug.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Fracture Prevention Trial (Neer 2001)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1637,
        primaryEndpoint: 'New vertebral fracture by radiograph, median observation 21 months',
        endpointMet: true,
        statisticalPValue:
          '5% at 20 micrograms against 14% on placebo; relative risk 0.35 (95% CI 0.22 to 0.55)',
        unreportedAdverseSignals:
          'The trial was stopped early when the rat osteosarcoma findings emerged, which is why the median observation is 21 months rather than the planned duration. That truncation is rarely mentioned alongside the result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VERO (NCT01709110)',
        phase: 'Phase 4, randomised, double-blind, double-dummy, active-controlled',
        sampleSize: 1360,
        primaryEndpoint: 'New radiographic vertebral fracture at 24 months against risedronate',
        endpointMet: true,
        statisticalPValue:
          '5.4% against 12.0%; risk ratio 0.44 (95% CI 0.29 to 0.68), P<0.0001. Clinical fracture hazard ratio 0.48 (0.32 to 0.74), P=0.0009',
        unreportedAdverseSignals:
          'Non-vertebral fragility fracture, a gated secondary outcome, did not reach significance: hazard ratio 0.66 (0.39 to 1.10), P=0.10. The trial was funded by the manufacturer of the winning drug.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId:
          'Forteo Patient Registry Surveillance Study, 2009-2019 (Gilsenan 2021)',
        phase: 'Prospective voluntary registry linked to 42 state cancer registries',
        sampleSize: 75247,
        primaryEndpoint: 'Incident osteosarcoma among teriparatide-treated adults',
        endpointMet: true,
        statisticalPValue:
          'Zero incident cases in 361,763 person-years; crude rate 0 (95% CI 0 to 10.2) per million person-years, standardised incidence ratio 0 (95% CI 0 to 3.0)',
        unreportedAdverseSignals:
          'The authors state that follow-up time was smaller than expected and that no cases were identified, which limits the conclusions. An upper bound of 3.0 on the standardised incidence ratio does not exclude a threefold excess.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'New vertebral fracture 5% against 14% over a median 21 months in 1637 women, relative risk 0.35 (95% CI 0.22 to 0.55)',
        'Non-vertebral fragility fracture 3% against 6% against placebo, relative risk 0.47 (95% CI 0.25 to 0.88)',
        'New vertebral fracture 5.4% against 12.0% on risedronate in 1360 women, risk ratio 0.44 (95% CI 0.29 to 0.68)',
        'Osteosarcoma in 31 of 60 male rats at 75 micrograms per kilogram daily for two years, against 3 at 5 micrograms per kilogram',
        'Zero incident human osteosarcomas in 361,763 person-years of registry follow-up',
      ],
      unsupportedInferences: [
        'That the rat tumour finding predicted human risk — the study authors argued against that reading in the paper that reported it',
        'That zero cases in the registry demonstrates no risk, when the upper confidence bound on the standardised incidence ratio is 3.0',
        'That it beats risedronate on non-vertebral fracture, where the head-to-head result was hazard ratio 0.66 with P=0.10',
        'That the bone gained persists after stopping — it is remodelled away without a following antiresorptive, which is why sequential therapy is standard',
      ],
      whatFailedInitially: [
        'The pivotal trial was stopped early because of the rat carcinogenicity findings, truncating observation to a median of 21 months',
        'A boxed warning and a two-year lifetime limit constrained the drug for eighteen years on animal data the original authors said was probably not predictive',
        'Non-vertebral fracture reduction was not demonstrated against an active comparator',
        'The 40 microgram dose lowered radial shaft bone density and caused more side effects without improving fracture outcomes over 20 micrograms',
      ],
      realWorldOutcome: [
        'Approved in the United States in November 2002 and the first approved anabolic treatment for osteoporosis',
        'The boxed warning for osteosarcoma and the two-year cumulative limit were removed in 2020; the current label states an increased risk has not been observed in observational studies',
        'VERO in 2018 was the first trial to compare two osteoporosis drugs with incident fracture as the primary outcome, and it shifted practice toward anabolic-first sequencing in very high risk',
        'It remains roughly two thousand times the per-unit acquisition cost of a generic bisphosphonate, which is what confines it to severe disease',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, 20 micrograms once daily from a refrigerated multidose pen',
      description:
        'Self-injected into thigh or abdomen. The daily schedule is pharmacological rather than practical: continuous exposure to this hormone causes bone loss, and the therapeutic effect depends on the signal being brief.',
      safetyProfile:
        'No boxed warning since 2020. Labelled warnings cover osteosarcoma — with instruction to avoid use in people at increased baseline risk, including open epiphyses, Paget disease, bone metastases, prior skeletal radiation and hereditary predisposition — together with hypercalcaemia and cutaneous calcification, exacerbation of urolithiasis, and transient orthostatic hypotension with initial doses. In the pivotal trial side effects were described as minor, chiefly occasional nausea and headache. The label notes limited data on osteosarcoma risk beyond two years of use.',
    },
    commonQuestions: [
      {
        q: 'How can a hormone that removes bone be used to build it?',
        a: 'Because the receptor responds to the shape of the signal, not only to its presence. When parathyroid hormone is continuously elevated, as in an overactive parathyroid gland, the bone-building cells are pushed into making the signal that recruits bone-dissolving cells, and bone is lost. When the same hormone arrives as a single short daily spike, the first thing that happens is that the building cells live longer and work harder — and the pulse is over before the recruiting signal takes hold. That gap is called the anabolic window, and the entire drug is an attempt to hit it once a day.',
      },
      {
        q: 'Does it cause bone cancer?',
        a: 'The evidence says no in humans, and the story of how that was established is the audit on this page. Rats given the drug daily for two years — most of their adult life, at up to 75 micrograms per kilogram — developed osteosarcoma at high rates. The scientists who ran that study wrote in the same paper that the finding probably did not predict human risk, because of the duration relative to lifespan and the growing rat skeleton. Regulators required a boxed warning and a two-year lifetime limit anyway. Eighteen years later, a registry of 75,247 treated patients linked to state cancer registries covering 93% of the United States found no cases at all, and the boxed warning and the time limit were removed in 2020. The current label says an increased risk has not been observed in observational studies.',
        auditNote:
          'Zero cases is not the same as zero risk. With the person-time accumulated, the upper confidence bound on the standardised incidence ratio was 3.0, so a threefold excess would not have been detected. The registry was funded by the manufacturer.',
      },
      {
        q: 'Is it better than a bisphosphonate?',
        a: 'In women with severe osteoporosis, on the one trial designed to answer that question, yes. VERO randomised 1360 women with at least two moderate or one severe vertebral fracture to teriparatide or risedronate under double-dummy blinding for 24 months. New spinal fractures were 5.4% against 12.0%, and clinical fractures 4.8% against 9.8%. Non-vertebral fractures were fewer but not significantly so, at 4.0% against 6.1% with a P value of 0.10. The trial was funded by teriparatide’s manufacturer, and it was the first trial ever to compare two osteoporosis drugs with incident fracture as the primary outcome.',
      },
      {
        q: 'What happens when I stop?',
        a: 'The bone that was added is remodelled away unless something is given to hold it. Newly formed bone is subject to the ordinary turnover rate once the anabolic stimulus is removed, so an antiresorptive is normally started afterwards to preserve the gain. That makes this a course of treatment followed by something else, rather than a drug taken indefinitely. What follows, and when, is a prescriber’s decision and is not addressed on this page.',
      },
      {
        q: 'Why is it so much more expensive?',
        a: 'It is a 34-amino-acid recombinant peptide in a refrigerated multidose injection pen, against a pressed tablet of a small molecule made by simple chemistry. Peptide expression, purification and cold-chain packaging are genuinely more costly. At about US$495 per millilitre at pharmacy acquisition against about twenty-eight cents for a generic alendronate tablet, the ratio is roughly two thousandfold per unit, and no published cost-of-production study for this molecule could be verified for this page, so how much of that gap is manufacturing is not something the data here can settle.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Neer RM et al. Effect of parathyroid hormone (1-34) on fractures and bone mineral density in postmenopausal women with osteoporosis. N Engl J Med 2001;344:1434-1441',
        identifier: '10.1056/NEJM200105103441904',
        kind: 'doi',
      },
      {
        label:
          'Kendler DL et al. Effects of teriparatide and risedronate on new fractures in post-menopausal women with severe osteoporosis (VERO). Lancet 2018;391:230-240',
        identifier: '10.1016/S0140-6736(17)32137-2',
        kind: 'doi',
      },
      {
        label:
          'Vahle JL et al. Skeletal changes in rats given daily subcutaneous injections of recombinant human parathyroid hormone (1-34) for 2 years and relevance to human safety. Toxicol Pathol 2002;30:312-321',
        identifier: '10.1080/01926230252929882',
        kind: 'doi',
      },
      {
        label:
          'Gilsenan A et al. Long-term cancer surveillance: results from the Forteo Patient Registry Surveillance Study. Osteoporos Int 2021;32:645-651',
        identifier: '10.1007/s00198-020-05718-0',
        kind: 'doi',
      },
      {
        label: 'VERO — teriparatide against risedronate, ClinicalTrials.gov registration',
        identifier: 'NCT01709110',
        kind: 'nct',
      },
      {
        label:
          'Teriparatide injection United States prescribing information (openFDA label endpoint) — indications, warnings and precautions including the osteosarcoma section',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22teriparatide%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Romosozumab — a drug designed from a rare bone disease, rejected once by the FDA, and
  //    approved with a cardiovascular boxed warning it earned in its own head-to-head trial.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'romosozumab',
    name: 'Romosozumab',
    tradeName: 'Evenity',
    sponsor: 'Amgen Inc. with UCB Pharma (approved in the United States in April 2019)',
    targetGene: 'SOST — the gene whose loss of function causes sclerosteosis and van Buchem disease',
    targetProtein:
      'Sclerostin, the osteocyte-secreted protein that shuts down bone formation by blocking the Wnt co-receptors LRP5 and LRP6',
    modality: 'Monoclonal Antibody (mAb)',
    approvalStatus: 'FDA Approved',
    approvalYear: 2019,
    indication:
      'Treatment of osteoporosis in postmenopausal women at high risk for fracture, defined as a history of osteoporotic fracture or multiple risk factors for fracture, or in patients who have failed or are intolerant of other available therapy. The label limits duration to 12 monthly doses and says an antiresorptive should be considered afterwards if treatment remains warranted',
    patientFriendlyIndication:
      'Severe bone thinning in women at high risk of breaking a bone, treated for one year only',
    anatomicalSite:
      'The osteocyte network inside bone, and the bone surface where the signal it suppresses is read',
    conditionContext: {
      conditionExplainer:
        'Osteocytes are cells buried inside bone that act as its sensors. One of the things they secrete is sclerostin, a brake on bone formation. People born without a working copy of the gene for it grow abnormally dense, heavy bone throughout life. This drug is an antibody that removes the brake on purpose, for twelve months.',
      whyItMatters:
        'It is the clearest example in this file of a drug reasoned backwards from a rare human genetic disease, and of a regulator refusing an application until the cardiovascular data from a second trial were available. The refusal was right: that trial found the signal.',
      whoTakesThis:
        'Postmenopausal women at high fracture risk, particularly those who have fractured already or failed another treatment, and who have not had a heart attack or stroke in the previous year.',
      clinicalGoals:
        'Fewer fractures within a single twelve-month course, and a larger bone mass to hand over to an antiresorptive afterwards.',
    },
    oneSentenceVerdict:
      'An antibody against sclerostin, the bone-formation brake whose genetic absence causes a rare high-bone-mass disease, which cut new spinal fractures from 1.8% to 0.5% in twelve months in 7180 women and beat alendronate on hip fracture, 2.0% against 3.2%, in 4093 women — and in that same head-to-head trial produced more adjudicated serious cardiovascular events in year one, 2.5% against 1.9%, which is now its boxed warning.',
    laymanHowItWorks:
      'Cells buried inside bone release a molecule that tells the surface to stop building. This drug is an antibody that mops that molecule up. With the brake off, the building cells work harder for several months, and unusually the demolition side slows at the same time — every other bone drug does one or the other. The effect fades over the year as the body adjusts, which is why the course is fixed at twelve months.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 74,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'Not stated: no verified CMS National Average Drug Acquisition Cost entry for romosozumab was held on this record at the time of writing',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in April 2019 and still on patent. The monthly dose is 210 mg delivered as two 105 mg single-use prefilled syringes, so a full course is twenty-four syringes. No verified acquisition price is stated here because none was held on the record; an estimate would be an invented number.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — checked for this molecule and found to carry no listed entry at the time of writing, which is why no price is stated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'The comparison is against the other bone-building option and against the antiresorptive it is meant to precede. Teriparatide builds bone by a different route with no cardiovascular warning but a daily injection. Alendronate is the drug romosozumab beat in ARCH, and it is also the drug that follows romosozumab in the same trial’s design. Nothing sold as a food or supplement raises bone formation the way removing sclerostin does.',
      conventionalRx: [
        {
          name: 'Alendronate',
          class: 'Nitrogen-containing bisphosphonate, oral',
          howItCompares:
            'The comparator in ARCH and the drug given after romosozumab in the same trial. Over 24 months new vertebral fractures were 11.9% on alendronate throughout against 6.2% on romosozumab then alendronate, and hip fracture 3.2% against 2.0%. Alendronate has no cardiovascular boxed warning.',
          typicalCost:
            'US$0.2842 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 24 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, oral, no cardiovascular warning, decades of data. Cons: significantly more vertebral, clinical, non-vertebral and hip fractures than the romosozumab sequence in the head-to-head trial.',
        },
        {
          name: 'Teriparatide',
          class: 'Parathyroid hormone (1-34), daily subcutaneous',
          howItCompares:
            'The other anabolic option. It beat risedronate on fracture in VERO. It requires a daily injection rather than a monthly one and carries no cardiovascular warning, but does carry an osteosarcoma caution and a list of people in whom it should be avoided.',
          typicalCost:
            'US$494.81 per mL at United States pharmacy acquisition cost (CMS NADAC, median across 10 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no cardiovascular boxed warning; longer human track record since 2002. Cons: daily self-injection and refrigeration; raises resorption as well as formation, where romosozumab lowers it.',
        },
        {
          name: 'Denosumab',
          class: 'Anti-RANKL monoclonal antibody, subcutaneous every six months',
          howItCompares:
            'The other antibody in bone, and one of the antiresorptives used to hold the gain after a romosozumab course. It suppresses resorption only and has no anabolic phase.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for denosumab was held on this record at the time of writing',
          prosAndCons:
            'Pros: twice-yearly injection; no cardiovascular boxed warning. Cons: purely antiresorptive; rebound vertebral fractures are reported after discontinuation.',
        },
      ],
      naturalFoods: [
        {
          name: 'Weight-bearing and impact loading',
          activeCompound: 'Mechanical strain sensed by osteocytes',
          biologicalMechanism:
            'Loading a bone lowers sclerostin output from the osteocytes inside it, which releases the same Wnt signal this antibody releases pharmacologically. The pathway is identical; the magnitude is not.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated: this page carries no exercise prescription. The mechanistic link between loading and sclerostin suppression is well characterised, and no exercise programme has a fracture result comparable to the 0.5% against 1.8% measured in FRAME.',
          monthlyCost: 'None',
        },
      ],
      homeRemedies: [
        {
          name: 'Say whether you have had a heart attack or a stroke, and when',
          action: 'Give the date, not just the fact.',
          patientImpact:
            'The boxed warning states the drug should not be started in anyone who has had a myocardial infarction or stroke within the preceding year, and that it should be discontinued if either occurs during treatment.',
          clinicalPrecaution:
            'The one-year window is explicit in the label. For other cardiovascular risk factors the label asks the prescriber to weigh benefit against risk rather than to refuse treatment.',
        },
        {
          name: 'Have calcium and vitamin D corrected before the first dose',
          action: 'Ask whether calcium has been checked, particularly if kidney function is poor.',
          patientImpact:
            'Hypocalcaemia has occurred with this drug and the label requires it to be corrected before starting and adequately supplemented throughout.',
          clinicalPrecaution:
            'Risk is higher with severe renal impairment or dialysis. Correcting calcium is a prescriber’s step; the patient’s part is making sure it was not skipped.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      molecularWeight: 'Approximately 149 kDa',
      targetReceptorAffinity:
        'A humanized IgG2 monoclonal antibody produced in Chinese hamster ovary cells that binds and inhibits sclerostin. It shows non-linear pharmacokinetics, with mean AUC rising about 550-fold for a 100-fold rise in subcutaneous dose, and a median time to maximum concentration of 5 days. A single 210 mg dose in healthy volunteers gave a mean maximum serum concentration of 22.2 micrograms per millilitre, and steady state was reached by month 3 with mean trough concentrations of 8 to 13 micrograms per millilitre. Estimated steady-state volume of distribution is about 3.92 L.',
      structureSource: {
        label:
          'EVENITY (romosozumab-aqqg) United States prescribing information, Description 11 and Clinical Pharmacology 12.3 (openFDA label endpoint)',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22EVENITY%22',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'rom-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, glycosylation and IgG2 disulfide isoform profile',
          description:
            'Confirm the antibody identity and, specifically, the IgG2 hinge disulfide isoform distribution. IgG2 antibodies interconvert between structural isoforms with different hinge disulfide connectivity, and those isoforms can differ in potency, so isoform ratio is a release specification and not a curiosity.',
          reagentsAndBuffer:
            'Reference standard, peptide mapping by LC-MS/MS after trypsin digestion, non-reduced capillary electrophoresis for disulfide isoforms, released N-glycan analysis by hydrophilic interaction chromatography',
        },
        {
          id: 'rom-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Expression in a Chinese hamster ovary cell line',
          description:
            'Grow the transfected CHO line in a fed-batch bioreactor and harvest the secreted antibody. Cell-culture conditions decide the glycan profile and the charge-variant distribution, which is why process parameters here are part of the product definition rather than of the manufacturing convenience.',
          dependsOnStepId: 'rom-w1',
          reagentsAndBuffer:
            'Stable CHO clone, chemically defined fed-batch medium, controlled dissolved oxygen, pH and temperature shift, depth filtration harvest',
        },
        {
          id: 'rom-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture, polishing and formulation into the prefilled syringe',
          description:
            'Capture on protein A, polish by ion exchange, then formulate. The marketed presentation is two 105 mg prefilled syringes per monthly dose, each delivering 1.17 mL, so the formulation has to keep a 149 kDa protein stable at high concentration in a small volume without a preservative.',
          dependsOnStepId: 'rom-w2',
          reagentsAndBuffer:
            'Protein A affinity resin, low-pH viral inactivation, ion-exchange polishing, viral filtration, acetate buffer with calcium, polysorbate 20 and sucrose at pH 5.2 as in the marketed formulation',
        },
        {
          id: 'rom-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Wnt reporter de-repression in an osteoblastic line',
          description:
            'Add sclerostin to a Wnt-responsive osteoblastic reporter line to suppress the signal, then add the antibody and measure how much signal returns. The assay has to be run as a de-repression rather than as a stimulation, because the antibody does nothing on its own — it only removes an inhibitor.',
          dependsOnStepId: 'rom-w3',
          reagentsAndBuffer:
            'Wnt-responsive TCF/LEF luciferase reporter in an osteoblastic line, recombinant human sclerostin, Wnt3a conditioned medium, isotype control antibody, LRP5/LRP6 binding competition by surface plasmon resonance',
        },
        {
          id: 'rom-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Formation and resorption marker time course over twelve months',
          description:
            'Track P1NP and CTX from baseline through month 12 and beyond. This is the assay that explains why the label caps the course at twelve doses: the formation signal is transient and reverses, and the marker curve shows it doing so before any fracture endpoint could.',
          dependsOnStepId: 'rom-w4',
          reagentsAndBuffer:
            'Fasting serum, automated P1NP and CTX immunoassays with matched-lot calibrators, standardised sampling time, paired placebo control samples run in the same batch',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rom-a1',
        category: 'measured',
        title: 'Spinal fractures fell by nearly three-quarters within twelve months',
        laymanSummary:
          'In 7180 women, new spinal fractures on x-ray occurred in about five per thousand on the drug against eighteen per thousand on placebo over one year, and the gap persisted after both groups moved to a different drug.',
        technicalDetails:
          'FRAME enrolled 7180 postmenopausal women with a T-score of -2.5 to -3.5 at the total hip or femoral neck, randomised to monthly subcutaneous romosozumab 210 mg or placebo for 12 months, after which all received denosumab for 12 months. New vertebral fractures at 12 months occurred in 16 of 3321 (0.5%) against 59 of 3322 (1.8%), a 73% lower risk, P<0.001. At 24 months, after both groups had transitioned to denosumab, the rates were 0.6% against 2.5%, a 75% lower risk, P<0.001. Clinical fractures at 12 months were 58 of 3589 (1.6%) against 90 of 3591 (2.5%), 36% lower, P=0.008.',
        evidenceSource: 'Cosman F et al., N Engl J Med 2016;375:1532-1543 (FRAME, NCT01575834)',
        doi: '10.1056/NEJMoa1607948',
        measuredMetric:
          'New vertebral fracture at 12 months, 0.5% against 1.8%, a 73% lower risk (P<0.001)',
        auditFlag: 'verified',
      },
      {
        id: 'rom-a2',
        category: 'failed',
        title: 'Non-vertebral fractures were not significantly reduced in the pivotal trial',
        laymanSummary:
          'The fractures that happen outside the spine — wrists, hips, arms — were slightly fewer on the drug, but the difference did not reach statistical significance.',
        technicalDetails:
          'In FRAME, non-vertebral fractures at 12 months occurred in 56 of 3589 romosozumab patients (1.6%) against 75 of 3591 placebo patients (2.1%), P=0.10. The trial met both co-primary vertebral endpoints and the clinical fracture secondary endpoint, and missed this one. It is the reason the second trial mattered: ARCH, in a higher-risk population and against an active comparator rather than placebo, did show significant reductions in non-vertebral fracture, 8.7% against 10.6%, P=0.04, and in hip fracture, 2.0% against 3.2%, P=0.02.',
        evidenceSource: 'Cosman F et al., N Engl J Med 2016;375:1532-1543 (FRAME)',
        doi: '10.1056/NEJMoa1607948',
        measuredMetric: 'Non-vertebral fracture 1.6% against 2.1% at 12 months, P=0.10',
        auditFlag: 'caution',
      },
      {
        id: 'rom-a3',
        category: 'failed',
        title: 'The head-to-head trial found more serious cardiovascular events in year one',
        laymanSummary:
          'When the drug was compared with alendronate, it prevented more fractures. In the first year, serious heart and stroke events adjudicated by an independent committee occurred in 50 patients on the drug against 38 on alendronate.',
        technicalDetails:
          'ARCH enrolled 4093 postmenopausal women with osteoporosis and a fragility fracture, randomised 1:1 to monthly romosozumab 210 mg or weekly oral alendronate 70 mg blinded for 12 months, followed by open-label alendronate in both arms. During year 1, positively adjudicated serious cardiovascular adverse events occurred in 50 of 2040 romosozumab patients (2.5%) against 38 of 2014 alendronate patients (1.9%). Overall adverse events and serious adverse events were balanced. During the open-label alendronate period, adjudicated osteonecrosis of the jaw occurred once in each group and atypical femoral fracture twice on the romosozumab-to-alendronate arm against four times on alendronate throughout. The imbalance in year 1 is the basis of the boxed warning: the label states that romosozumab may increase the risk of myocardial infarction, stroke and cardiovascular death, must not be started within a year of either event, and should be discontinued if either occurs on treatment.',
        evidenceSource:
          'Saag KG et al., N Engl J Med 2017;377:1417-1427 (ARCH, NCT01631214); EVENITY United States prescribing information, Boxed Warning and Warnings and Precautions 5.1',
        doi: '10.1056/NEJMoa1708322',
        measuredMetric:
          'Positively adjudicated serious cardiovascular adverse events in year 1: 50 of 2040 (2.5%) against 38 of 2014 (1.9%)',
        auditFlag: 'caution',
      },
      {
        id: 'rom-a4',
        category: 'measured',
        title: 'It beat alendronate on every fracture endpoint including hip',
        laymanSummary:
          'Over two years, women who got twelve months of the antibody followed by alendronate had roughly half as many spinal fractures and a third fewer hip fractures than women who took alendronate the whole time.',
        technicalDetails:
          'In ARCH over 24 months, new vertebral fracture occurred in 127 of 2046 (6.2%) in the romosozumab-to-alendronate group against 243 of 2047 (11.9%) in the alendronate-to-alendronate group, a 48% lower risk, P<0.001. Clinical fractures were 198 of 2046 (9.7%) against 266 of 2047 (13.0%), 27% lower, P<0.001. Non-vertebral fractures were 178 (8.7%) against 217 (10.6%), 19% lower, P=0.04. Hip fractures were 41 (2.0%) against 66 (3.2%), 38% lower, P=0.02. Because the comparator was an active drug with its own established fracture reduction rather than placebo, these are differences on top of effective treatment.',
        evidenceSource: 'Saag KG et al., N Engl J Med 2017;377:1417-1427 (ARCH)',
        doi: '10.1056/NEJMoa1708322',
        measuredMetric:
          'Hip fracture over 24 months, 2.0% against 3.2% on alendronate throughout, a 38% lower risk (P=0.02)',
        auditFlag: 'verified',
      },
      {
        id: 'rom-a5',
        category: 'measured',
        title: 'The whole drug was reasoned backwards from a rare bone disease',
        laymanSummary:
          'People born with two broken copies of one gene grow abnormally thick, dense bone for their whole lives. Finding that gene in 2001 identified the brake on bone formation, and this drug removes that brake deliberately.',
        technicalDetails:
          'Balemans and colleagues mapped sclerosteosis and van Buchem disease to the same region of chromosome 17q12-q21, narrowed the critical interval to about 1 Mb, and positionally cloned SOST. Two nonsense mutations and one splice-site mutation were found in sclerosteosis patients. The paper states that loss of SOST function results in formation of massive amounts of normal bone throughout life, that the physiological role of the protein is most likely suppression of bone formation, and — in its final sentence — that the gene might become an important tool for developing osteoporosis therapies. That was eighteen years before approval. The disease also shows the ceiling: sclerosteosis causes cranial nerve compression with facial palsy, hearing loss and optic atrophy from skull overgrowth, which is what a lifetime of complete sclerostin absence looks like as against twelve monthly doses of an antibody.',
        evidenceSource: 'Balemans W et al., Hum Mol Genet 2001;10:537-543',
        doi: '10.1093/hmg/10.5.537',
        measuredMetric:
          'Three loss-of-function SOST mutations identified in sclerosteosis patients, producing lifelong excess formation of normal bone',
        auditFlag: 'verified',
      },
      {
        id: 'rom-a6',
        category: 'inferred',
        title: 'Approved for men on a bone-density endpoint in 245 people',
        laymanSummary:
          'The trial in men measured the number on a scan, not fractures, in 245 participants. It also showed the same numerical excess of serious heart events.',
        technicalDetails:
          'BRIDGE randomised 245 men aged 55 to 90 with a T-score of -2.5 or lower, or -1.5 or lower with a prior fragility fracture, 2:1 to romosozumab 210 mg monthly or placebo for 12 months at 31 centres. The primary endpoint was percentage change from baseline in lumbar spine bone mineral density at month 12: 12.1% against 1.2%, and total hip 2.5% against -0.5%, both P<0.001. Adverse and serious adverse events were balanced, with a numerical imbalance in positively adjudicated serious cardiovascular events — 8 of 163 (4.9%) against 2 of 82 (2.5%). No fracture endpoint was measured. The current United States indication is confined to postmenopausal women, so this trial supports a mechanism in men rather than an approved use.',
        evidenceSource:
          'Lewiecki EM et al., J Clin Endocrinol Metab 2018;103:3183-3193 (BRIDGE, NCT02186171)',
        doi: '10.1210/jc.2017-02163',
        inferredClaim:
          'That a 12.1% rise in spinal bone density in 245 men implies the fracture reduction measured in 7180 women — a surrogate result in a small trial, with the same cardiovascular imbalance present',
        auditFlag: 'caution',
      },
      {
        id: 'rom-a7',
        category: 'measured',
        title: 'The effect is transient by design, and the label caps the course at twelve doses',
        laymanSummary:
          'The bone-building signal peaks two weeks in and is gone by nine months. By month twelve it has fallen below where it started. The course is limited to twelve doses because after that there is nothing left to gain.',
        technicalDetails:
          'The label reports that P1NP, the formation marker, peaks at about 145% above placebo two weeks after starting, returns to placebo levels by month 9, and is approximately 15% below the placebo change by month 12. CTX, the resorption marker, falls to about 55% below placebo at two weeks and remains about 25% below at month 12. After discontinuation, P1NP returns to baseline within 12 months while CTX rises above baseline within 3 months and returns toward baseline by month 12. The label limits use to 12 monthly doses and states that if osteoporosis therapy remains warranted, continued therapy with an antiresorptive should be considered. This is one of the few drugs whose approved duration is set by its own pharmacodynamic curve rather than by a trial comparison.',
        evidenceSource:
          'EVENITY United States prescribing information, Indications and Usage 1.2 and Clinical Pharmacology 12.2 (openFDA label endpoint)',
        measuredMetric:
          'P1NP +145% at week 2, back to placebo by month 9, about 15% below placebo at month 12; CTX -55% at week 2, about 25% below at month 12',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two injections under the skin, once a month',
        laymanDesc:
          'The monthly dose is large enough that it comes as two separate prefilled syringes. It is given for twelve months and then stopped.',
        molecularDetail:
          'The 210 mg monthly dose is delivered as two 105 mg single-use prefilled syringes, each 1.17 mL of a preservative-free acetate-buffered solution at pH 5.2. Median time to maximum concentration is 5 days and steady state is reached by month 3, with trough concentrations of 8 to 13 micrograms per millilitre.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The antibody finds sclerostin in the bone microenvironment',
        laymanDesc:
          'It does not act on a cell. It binds a small signalling protein released by cells buried inside bone and takes it out of circulation.',
        molecularDetail:
          'Sclerostin is a cysteine-knot protein secreted by osteocytes, encoded by SOST. Romosozumab is a humanized IgG2 that binds it directly. Estimated steady-state volume of distribution is about 3.92 L and the pharmacokinetics are non-linear, with AUC rising roughly 550-fold across a 100-fold dose range, consistent with a saturable target-mediated clearance route.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The Wnt brake comes off the bone surface',
        laymanDesc:
          'Free sclerostin normally plugs a receptor that bone-building cells need in order to hear a growth signal. Once it is mopped up, the signal gets through.',
        molecularDetail:
          'Sclerostin binds the LRP5 and LRP6 co-receptors and blocks Wnt ligands from assembling a signalling complex with Frizzled. Removing it allows beta-catenin to accumulate and enter the nucleus, driving osteoblast differentiation and survival genes. The human genetics are the proof of the pathway: loss-of-function SOST mutations produce lifelong formation of massive amounts of normal bone.',
        iconName: 'Unlock',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Formation rises and resorption falls at the same time',
        laymanDesc:
          'This is the unusual part. Every other bone drug either builds or preserves. For a few months this one does both.',
        molecularDetail:
          'P1NP rises about 145% above placebo by week 2 while CTX falls about 55% below it, an uncoupling no antiresorptive or parathyroid hormone analogue produces. The dual effect follows from Wnt signalling driving osteoblast activity and simultaneously raising osteoprotegerin, which sequesters RANKL and starves osteoclast formation.',
        iconName: 'TrendingUp',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The window closes, and the course ends',
        laymanDesc:
          'By nine months the building signal is back to where it would have been anyway, and by twelve it is below. The label stops the treatment there.',
        molecularDetail:
          'P1NP returns to placebo levels by month 9 and sits about 15% below placebo at month 12, while CTX remains about 25% below. After discontinuation CTX rises above baseline within 3 months. The label limits use to 12 monthly doses and directs that an antiresorptive be considered afterwards, because bone gained during the window is otherwise remodelled away.',
        iconName: 'Clock',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Fewer fractures, and a cardiovascular signal that came with them',
        laymanDesc:
          'Spinal fractures fell by nearly three-quarters against placebo and hip fractures by more than a third against alendronate. In the alendronate comparison, serious heart and stroke events in the first year were more common on the antibody.',
        molecularDetail:
          'FRAME: vertebral fracture 0.5% against 1.8% at 12 months. ARCH: hip fracture 2.0% against 3.2% at 24 months, P=0.02. Also ARCH: adjudicated serious cardiovascular adverse events in year 1, 2.5% against 1.9%. No mechanism links sclerostin inhibition to cardiovascular events with any confidence; sclerostin is expressed in vascular tissue, which is a hypothesis rather than a finding.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'FRAME (NCT01575834)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 7180,
        primaryEndpoint:
          'Co-primary: cumulative incidence of new vertebral fracture at 12 months and at 24 months',
        endpointMet: true,
        statisticalPValue:
          '0.5% against 1.8% at 12 months (73% lower, P<0.001); 0.6% against 2.5% at 24 months (75% lower, P<0.001)',
        unreportedAdverseSignals:
          'Non-vertebral fracture, a secondary endpoint, was 1.6% against 2.1% with P=0.10 — not significant. One atypical femoral fracture and two cases of osteonecrosis of the jaw occurred in the romosozumab group.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ARCH (NCT01631214)',
        phase: 'Phase 3, randomised, double-blind, active-controlled against alendronate',
        sampleSize: 4093,
        primaryEndpoint:
          'Co-primary: new vertebral fracture at 24 months, and clinical fracture at the primary analysis',
        endpointMet: true,
        statisticalPValue:
          'Vertebral 6.2% against 11.9% (48% lower, P<0.001); clinical 9.7% against 13.0% (27% lower, P<0.001); hip 2.0% against 3.2% (P=0.02)',
        unreportedAdverseSignals:
          'Positively adjudicated serious cardiovascular adverse events in year 1 were 50 of 2040 (2.5%) against 38 of 2014 (1.9%). This imbalance became the boxed warning and delayed approval by nearly two years.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BRIDGE (NCT02186171)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, in men',
        sampleSize: 245,
        primaryEndpoint: 'Percentage change from baseline in lumbar spine bone mineral density at month 12',
        endpointMet: true,
        statisticalPValue: 'Lumbar spine 12.1% against 1.2%; total hip 2.5% against -0.5%, both P<0.001',
        unreportedAdverseSignals:
          'A surrogate endpoint, not fracture. Positively adjudicated serious cardiovascular events were 8 of 163 (4.9%) against 2 of 82 (2.5%) — the same direction as ARCH, in a trial far too small to measure it.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'New vertebral fracture 0.5% against 1.8% at 12 months in 7180 women, a 73% lower risk',
        'Hip fracture 2.0% against 3.2% over 24 months against alendronate in 4093 women, P=0.02',
        'Adjudicated serious cardiovascular adverse events in year 1 of ARCH, 2.5% against 1.9%',
        'P1NP +145% above placebo at week 2, returning to placebo by month 9 and about 15% below at month 12',
        'Three loss-of-function SOST mutations in sclerosteosis, producing lifelong excess bone formation',
      ],
      unsupportedInferences: [
        'That the fracture benefit continues beyond twelve months — the pharmacodynamic effect has reversed by then and the label caps the course there',
        'That the cardiovascular imbalance is explained; no mechanism has been established and vascular sclerostin expression is a hypothesis',
        'That a 12.1% spinal density gain in 245 men implies the fracture reduction measured in women',
        'That an antibody given for twelve months reproduces the skeletal phenotype of lifelong SOST deficiency, which includes cranial nerve compression',
      ],
      whatFailedInitially: [
        'FRAME missed its non-vertebral fracture endpoint at 12 months, 1.6% against 2.1%, P=0.10',
        'ARCH found more adjudicated serious cardiovascular events on romosozumab in the blinded first year',
        'The United States application was not approved on the first review cycle; approval followed in April 2019 with a boxed warning for myocardial infarction, stroke and cardiovascular death',
        'The men’s trial was powered for a density endpoint in 245 participants and reproduced the cardiovascular imbalance without being able to measure it',
      ],
      realWorldOutcome: [
        'Approved in the United States in April 2019 for postmenopausal women at high fracture risk, with use limited to 12 monthly doses',
        'The only approved agent that raises bone formation and lowers bone resorption simultaneously',
        'The boxed warning bars initiation within a year of a myocardial infarction or stroke and requires discontinuation if either occurs on treatment',
        'It is the clearest modern case of a drug target identified from a rare recessive human disease, eighteen years from gene to approval',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, 210 mg monthly as two 105 mg prefilled syringes, for 12 doses',
      description:
        'Given monthly for one year and then stopped, with an antiresorptive considered afterwards if treatment remains warranted. The fixed course is a pharmacodynamic limit, not a convenience: the bone-formation effect has reversed by month twelve.',
      safetyProfile:
        'Boxed warning for potential risk of myocardial infarction, stroke and cardiovascular death. Not to be initiated in patients who have had a myocardial infarction or stroke within the preceding year, and to be discontinued if either occurs on treatment. Other labelled warnings cover hypersensitivity including angioedema and erythema multiforme, hypocalcaemia which must be corrected before starting and is a greater risk in severe renal impairment or dialysis, osteonecrosis of the jaw, and atypical femoral fracture with instruction to evaluate new thigh, hip or groin pain.',
    },
    commonQuestions: [
      {
        q: 'Why is it only given for a year?',
        a: 'Because after a year it has stopped working, and the label says so in the indications section rather than burying it. The bone-formation marker P1NP peaks about 145% above placebo two weeks in, falls back to placebo levels by month nine, and is roughly 15% below placebo by month twelve. The resorption marker stays suppressed longer. So the anabolic window is a few months wide, and twelve doses covers it. What follows matters: bone gained this way is remodelled away unless an antiresorptive is given afterwards, which is exactly the design of both pivotal trials.',
      },
      {
        q: 'What is the heart warning about?',
        a: 'It comes from the trial that compared the drug with alendronate. Over the blinded first year, an independent committee adjudicated serious cardiovascular events in 50 of 2040 women on romosozumab against 38 of 2014 on alendronate — 2.5% against 1.9%. The placebo-controlled trial had not shown that imbalance, and the United States application was not approved on its first review cycle; approval came in April 2019 with a boxed warning. The label bars starting the drug within a year of a heart attack or stroke and requires stopping it if either happens during treatment. No mechanism has been established.',
        auditNote:
          'The regulator’s refusal to approve before the second trial reported is the most defensible decision on this page. The signal it was waiting for is the one that turned up.',
      },
      {
        q: 'How was this drug invented?',
        a: 'By working backwards from people who have too much bone rather than too little. Sclerosteosis is a rare recessive disease in which the skeleton keeps thickening throughout life — the skull, the jaw, the ribs, the long bones — to the point where cranial nerves are compressed and people lose facial movement, hearing and sight. In 2001 a group in Antwerp mapped it, cloned the responsible gene SOST, and found loss-of-function mutations in affected patients. Their paper concluded that the protein’s job is to suppress bone formation and that the gene might become a tool for treating osteoporosis. That is precisely what happened, eighteen years later.',
      },
      {
        q: 'Is it better than a bisphosphonate?',
        a: 'On fractures, in the population studied, yes — and it was compared against a bisphosphonate that works. In ARCH, 4093 women with osteoporosis and a fragility fracture got either twelve months of romosozumab then alendronate, or alendronate throughout. Over 24 months, spinal fractures were 6.2% against 11.9%, clinical fractures 9.7% against 13.0%, non-vertebral 8.7% against 10.6% and hip 2.0% against 3.2%. All four favoured romosozumab. Against that sit the cardiovascular imbalance in year one, the boxed warning, the fact that it is an injection given in a clinic setting, and a cost the acquisition dataset does not even list.',
      },
      {
        q: 'Can men take it?',
        a: 'The United States indication covers postmenopausal women only. A trial in 245 men did run for twelve months and found the expected effect on the scan — lumbar spine density rose 12.1% against 1.2% on placebo — but it measured bone density, not fractures, and it was far too small to assess anything else. It also showed the same numerical excess of adjudicated serious cardiovascular events, 4.9% against 2.5%, in numbers too small to interpret. Mechanistically there is no reason it would not work in men; that is an inference, and this page keeps it labelled as one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Cosman F et al. Romosozumab treatment in postmenopausal women with osteoporosis. N Engl J Med 2016;375:1532-1543 (FRAME)',
        identifier: '10.1056/NEJMoa1607948',
        kind: 'doi',
      },
      {
        label:
          'Saag KG et al. Romosozumab or alendronate for fracture prevention in women with osteoporosis. N Engl J Med 2017;377:1417-1427 (ARCH)',
        identifier: '10.1056/NEJMoa1708322',
        kind: 'doi',
      },
      {
        label:
          'Lewiecki EM et al. A phase III randomized placebo-controlled trial to evaluate efficacy and safety of romosozumab in men with osteoporosis (BRIDGE). J Clin Endocrinol Metab 2018;103:3183-3193',
        identifier: '10.1210/jc.2017-02163',
        kind: 'doi',
      },
      {
        label:
          'Balemans W et al. Increased bone density in sclerosteosis is due to the deficiency of a novel secreted protein (SOST). Hum Mol Genet 2001;10:537-543',
        identifier: '10.1093/hmg/10.5.537',
        kind: 'doi',
      },
      {
        label: 'FRAME — romosozumab against placebo, ClinicalTrials.gov registration',
        identifier: 'NCT01575834',
        kind: 'nct',
      },
      {
        label: 'ARCH — romosozumab against alendronate, ClinicalTrials.gov registration',
        identifier: 'NCT01631214',
        kind: 'nct',
      },
      {
        label: 'BRIDGE — romosozumab in men with osteoporosis, ClinicalTrials.gov registration',
        identifier: 'NCT02186171',
        kind: 'nct',
      },
      {
        label:
          'EVENITY (romosozumab-aqqg) United States prescribing information (openFDA label endpoint) — boxed warning, indications and limitations of use, description, clinical pharmacology',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:%22EVENITY%22',
        kind: 'regulatory',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Calcitriol — the finished hormone, not the vitamin. Approved for kidney disease and
  //    hypoparathyroidism, and the class where seventy-six trials failed to show a patient benefit.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'calcitriol',
    name: 'Calcitriol',
    tradeName: 'Rocaltrol / Calcijex / Vectical',
    sponsor:
      'Roche (originator, Rocaltrol, approved 1978); now made generically by many manufacturers, and the United States application holder on this record is Esjay Pharma',
    targetGene: 'VDR — the vitamin D receptor gene',
    targetProtein:
      'Vitamin D receptor, a nuclear hormone receptor that heterodimerises with the retinoid X receptor and binds vitamin D response elements in DNA',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1978,
    indication:
      'Management of secondary hyperparathyroidism and resultant metabolic bone disease in moderate to severe chronic renal failure not yet on dialysis; management of hypocalcaemia and resultant metabolic bone disease in patients on chronic renal dialysis; and management of hypocalcaemia and its manifestations in hypoparathyroidism and pseudohypoparathyroidism. A separate topical product is indicated for plaque psoriasis',
    patientFriendlyIndication:
      'Low calcium and overactive parathyroid glands caused by kidney failure, and low calcium caused by absent parathyroid hormone',
    anatomicalSite:
      'The nucleus of the intestinal absorptive cell and of the parathyroid chief cell — a gene switch, not a mineral supplement',
    conditionContext: {
      conditionExplainer:
        'Vitamin D from sun or diet is inert. The liver adds one hydroxyl to it and the kidney adds a second, and only then is it a hormone. Failing kidneys cannot perform that final step, so calcium absorption falls, the parathyroid glands are driven hard, and bone is dismantled to keep blood calcium up. Calcitriol is the finished hormone, given directly because the kidney can no longer make it.',
      whyItMatters:
        'This is the point in the file where a vitamin stops being a nutrient and becomes a drug. It is also the clearest case of a treatment that reliably fixes a laboratory number, and whose effect on anything a patient experiences remains unproven after seventy-six randomised trials.',
      whoTakesThis:
        'People with chronic kidney disease before and during dialysis, and people whose parathyroid glands are absent or unresponsive.',
      clinicalGoals:
        'Raise calcium, suppress parathyroid hormone, and prevent the bone disease that follows. The first two are measured routinely; the third is what the evidence does not establish.',
    },
    oneSentenceVerdict:
      'The finished, kidney-activated form of vitamin D given as a drug when the kidney can no longer make it — a nuclear receptor ligand that switches on calcium-absorption genes in the gut and switches off parathyroid hormone transcription in the gland, and whose class, across 76 randomised trials in 3667 people, did not reduce death, bone pain, vascular calcification or parathyroidectomy while roughly doubling the risk of hypercalcaemia.',
    laymanHowItWorks:
      'Ordinary vitamin D has to be modified twice before it does anything: once by the liver, once by the kidney. When the kidney fails, the second step stops, and calcium absorption fails with it. This drug is the finished molecule. It enters cells, binds a receptor that sits directly on DNA, and turns on the genes that pull calcium out of food — and turns down the gene that makes parathyroid hormone.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 62,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1607 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed generic products, survey effective 17 June 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1978 and generic for decades. At about sixteen cents a capsule it is one of the cheapest drugs in this file. The commonest cost associated with it is not the drug but the repeated calcium, phosphate and parathyroid hormone measurements its use requires.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Nothing that is called vitamin D substitutes for this in a person whose kidneys have failed, because the missing step is the one the kidney performs. Cholecalciferol and ergocalciferol raise the storage form and cannot be converted onward. The real alternatives are the newer analogues designed to suppress parathyroid hormone with less hypercalcaemia, and cinacalcet, which lowers parathyroid hormone by an entirely different route.',
      conventionalRx: [
        {
          name: 'Paricalcitol and doxercalciferol',
          class: 'Later vitamin D receptor activators',
          howItCompares:
            'Designed to suppress parathyroid hormone with less effect on gut calcium absorption. In the pooled analysis of the class they did reduce parathyroid hormone, by a weighted mean difference of -10.77 pmol/L, where the established sterols did not do so consistently — but they were associated with hypercalcaemia at a relative risk of 5.15 against placebo.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for these analogues was held on this record at the time of writing',
          prosAndCons:
            'Pros: a consistent parathyroid hormone reduction, which calcitriol does not deliver across trials. Cons: hypercalcaemia risk was higher, not lower, in the pooled comparison against placebo, and patient-level benefit is equally unproven.',
        },
        {
          name: 'Cinacalcet',
          class: 'Calcium-sensing receptor agonist (calcimimetic)',
          howItCompares:
            'Lowers parathyroid hormone by making the gland behave as though blood calcium were higher, so calcium falls rather than rises. That is the opposite direction to a vitamin D sterol, which is why the two are often used together.',
          typicalCost:
            'US$0.7581 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 31 listed generic products, survey effective 20 May 2026)',
          prosAndCons:
            'Pros: lowers parathyroid hormone without raising calcium or phosphate. Cons: its own large outcome trial missed its primary endpoint in the unadjusted analysis, and hypocalcaemia and nausea were significantly more common.',
        },
        {
          name: 'Cholecalciferol or ergocalciferol',
          class: 'Native vitamin D, requiring two activation steps',
          howItCompares:
            'Not a substitute in kidney failure, because the second activation step is the one that is missing. They remain the right choice for ordinary vitamin D deficiency in people with working kidneys, where giving the finished hormone would bypass the body’s own regulation.',
          typicalCost:
            'Not separately priced on this record; both are widely sold as inexpensive supplements and as prescription strengths',
          prosAndCons:
            'Pros: self-limiting, since the kidney regulates the final activation step. Cons: cannot correct the deficiency that kidney failure creates.',
        },
      ],
      naturalFoods: [
        {
          name: 'Sunlight on skin',
          activeCompound: 'Cholecalciferol formed from 7-dehydrocholesterol',
          biologicalMechanism:
            'Ultraviolet B converts a cholesterol precursor in skin into cholecalciferol, which the liver then hydroxylates. It supplies the raw material for this hormone, and cannot supply the hormone itself when the kidney cannot perform the final step.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no exposure guidance. The relevant fact is mechanistic — sun exposure feeds the pathway upstream of the block that makes this drug necessary.',
          monthlyCost: 'None',
        },
        {
          name: 'Oily fish, egg yolk, fortified milk',
          activeCompound: 'Cholecalciferol and ergocalciferol',
          biologicalMechanism:
            'Dietary vitamin D enters the same pathway as skin-synthesised vitamin D and is subject to the same two activation steps.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. Dietary vitamin D is upstream of the kidney step and does not substitute for it.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
      ],
      homeRemedies: [
        {
          name: 'Know the early signs of too much calcium',
          action:
            'Report new weakness, headache, nausea, dry mouth, constipation, muscle or bone pain, a metallic taste or loss of appetite.',
          patientImpact:
            'These are the early features of hypercalcaemia listed in the label, and hypercalcaemia is the characteristic hazard of this drug rather than a rare one.',
          clinicalPrecaution:
            'Because calcitriol has a short biological half-life, elevated calcium normalises within a few days of stopping — much faster than with vitamin D3 preparations, which the label states explicitly.',
        },
        {
          name: 'Do not add calcium or vitamin D products without telling the prescriber',
          action: 'Include over-the-counter antacids containing calcium carbonate.',
          patientImpact:
            'This drug exists to increase calcium absorption. Adding calcium on top of it is the commonest route to hypercalcaemia, and concurrent hyperphosphataemia can cause soft-tissue calcification visible on x-ray.',
          clinicalPrecaution:
            'In the trials of hypoparathyroidism and pseudohypoparathyroidism, hypercalcaemia was recorded at least once in about one in three patients and hypercalciuria in about one in seven.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H](CCCC(C)(C)O)[C@H]1CC[C@@H]\\2[C@@]1(CCC/C2=C\\C=C/3\\C[C@H](C[C@@H](C3=C)O)O)C',
      chemicalFormula: 'C27H44O3',
      molecularWeight: '416.60 g/mol',
      targetReceptorAffinity:
        'Binds the vitamin D receptor, a nuclear hormone receptor, with roughly a thousandfold higher affinity than its immediate precursor 25-hydroxyvitamin D. The 1-alpha hydroxyl added by the kidney and the 25-hydroxyl added by the liver are both required for high-affinity binding, which is why neither cholecalciferol nor 25-hydroxyvitamin D can substitute in renal failure. The label notes a short biological half-life, so elevated serum calcium normalises within days of withdrawal rather than the weeks required after vitamin D3 preparations.',
      structureSource: {
        label:
          'PubChem CID 5280453 (calcitriol) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280453',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cal-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Stereochemical identity and previtamin D content',
          description:
            'Confirm the 1-alpha and 3-beta hydroxyl configurations and quantify the previtamin D isomer. Secosteroids sit in thermal equilibrium with their previtamin form and photoisomerise under ordinary laboratory light, so an assay run on the bench without amber glassware measures a mixture rather than the drug.',
          reagentsAndBuffer:
            'Reference standard, chiral and reversed-phase HPLC under amber conditions, ultraviolet spectrophotometry at 265 nm, 1H NMR in deuterochloroform, nitrogen-purged solvents',
        },
        {
          id: 'cal-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Construction of the secosteroid and installation of the 1-alpha hydroxyl',
          description:
            'Build the broken-ring steroid skeleton and hydroxylate at the 1-alpha position, the step the failing kidney cannot perform. Getting that single hydroxyl in the right configuration is the whole synthetic problem: the 1-beta epimer is essentially inactive at the receptor.',
          dependsOnStepId: 'cal-w1',
          reagentsAndBuffer:
            'Steroidal or convergent Lythgoe-type route with a Horner-Wadsworth-Emmons or Wittig coupling, protected A-ring synthon carrying the 1-alpha and 3-beta hydroxyls, controlled photochemical ring opening under inert atmosphere',
        },
        {
          id: 'cal-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Chromatography and formulation under light and oxygen exclusion',
          description:
            'Purify away the 5,6-trans isomer and oxidation products, then formulate. The dose is measured in tenths of a microgram, so content uniformity in a soft capsule or oral solution is a harder problem than the chemistry that preceded it.',
          dependsOnStepId: 'cal-w2',
          reagentsAndBuffer:
            'Preparative normal-phase chromatography, butylated hydroxyanisole or equivalent antioxidant in the medium-chain triglyceride vehicle, amber packaging under nitrogen headspace, content uniformity testing by validated HPLC',
        },
        {
          id: 'cal-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Vitamin D receptor binding and nuclear translocation',
          description:
            'Measure competitive binding against a labelled reference ligand and confirm that the receptor moves to the nucleus and dimerises with the retinoid X receptor. Binding alone is not the mechanism: the receptor has to reach DNA with its partner, and a ligand that binds without permitting dimerisation is an antagonist.',
          dependsOnStepId: 'cal-w3',
          reagentsAndBuffer:
            'Recombinant vitamin D receptor ligand-binding domain, tritiated 1,25-dihydroxyvitamin D3 competitor, RXR-alpha for dimerisation assay, electrophoretic mobility shift assay with a vitamin D response element oligonucleotide',
        },
        {
          id: 'cal-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Target gene transcription and calcium safety readout',
          description:
            'Quantify transcription of the calcium transport genes in intestinal cells and of the parathyroid hormone gene in parathyroid cells, and pair both with serum and urinary calcium. The two arms of this drug are the therapy and the toxicity, and they are the same action measured in two tissues.',
          dependsOnStepId: 'cal-w4',
          reagentsAndBuffer:
            'Caco-2 intestinal monolayers and bovine parathyroid cell preparations, quantitative PCR for TRPV6, calbindin-D9k and PTH transcripts, albumin-corrected serum calcium and 24-hour urinary calcium in the corresponding in vivo model',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cal-a1',
        category: 'failed',
        title: 'Seventy-six trials, and no demonstrated benefit to a patient',
        laymanSummary:
          'All the randomised trials of vitamin D drugs in kidney disease were pooled: seventy-six of them, in 3667 people. They did not reduce deaths, bone pain, hardening of arteries or the need for parathyroid surgery. They roughly doubled the chance of a high calcium level.',
        technicalDetails:
          'Palmer and colleagues identified 76 randomised controlled trials of vitamin D compounds in chronic kidney disease enrolling 3667 participants. The compounds did not reduce the risk of death, bone pain, vascular calcification or parathyroidectomy. Against placebo, established vitamin D sterols — the group calcitriol belongs to — increased hypercalcaemia (relative risk 2.37, 95% CI 1.16 to 4.85) and hyperphosphataemia (relative risk 1.77, 95% CI 1.15 to 2.74) and did not show a consistent reduction in parathyroid hormone. Newer analogues did reduce parathyroid hormone (weighted mean difference -10.77 pmol/L, 95% CI -20.51 to -1.03) but were associated with hypercalcaemia at a relative risk of 5.15 (1.06 to 24.97). Only 8 of the 76 trials reported mortality. The authors concluded that vitamin D compounds do not consistently reduce parathyroid hormone and that beneficial effects on patient-level outcomes are unproven.',
        evidenceSource: 'Palmer SC et al., Ann Intern Med 2007;147:840-853',
        doi: '10.7326/0003-4819-147-12-200712180-00004',
        measuredMetric:
          'Hypercalcaemia relative risk 2.37 (95% CI 1.16 to 4.85) for established sterols; no reduction in death, bone pain, vascular calcification or parathyroidectomy across 76 trials',
        auditFlag: 'caution',
      },
      {
        id: 'cal-a2',
        category: 'inferred',
        title: 'It is prescribed to move a number, and the number is not the outcome',
        laymanSummary:
          'Treatment is guided by parathyroid hormone levels in blood. Bringing that number down is what the drug is judged on. Whether doing so makes anyone live longer, break fewer bones or feel better has not been established.',
        technicalDetails:
          'The label defines the predialysis indication around a serum intact parathyroid hormone level of 100 pg/mL or above as strongly suggestive of secondary hyperparathyroidism, and describes the dialysis indication in terms of enhanced calcium absorption, reduced serum alkaline phosphatase, possible reduction of parathyroid hormone and the histological manifestations of osteitis fibrosa cystica. Every one of those is a laboratory or histological measure. The pooled trial evidence found only 8 of 76 trials reported mortality at all, and found no reduction in bone pain, the one patient-level outcome that was reported. Treating a biochemical target is a reasonable clinical strategy in the absence of outcome trials; it is not the same as having them.',
        evidenceSource:
          'Calcitriol United States prescribing information, Indications and Usage (openFDA label endpoint); Palmer SC et al., Ann Intern Med 2007;147:840-853',
        doi: '10.7326/0003-4819-147-12-200712180-00004',
        inferredClaim:
          'That normalising parathyroid hormone and alkaline phosphatase translates into fewer fractures, less vascular calcification or longer life — the surrogate is measured routinely and the outcome has not been demonstrated',
        auditFlag: 'contested',
      },
      {
        id: 'cal-a3',
        category: 'conclusion_shift',
        title: 'The 1992 osteoporosis trial was never replicated and never led to an indication',
        laymanSummary:
          'A New Zealand trial in 622 women reported that this drug cut spinal fractures dramatically compared with calcium alone. It was only single-blind, the comparison group fractured at an extraordinary rate, the effect appeared only in a subgroup, and it never became an approved use.',
        technicalDetails:
          'Tilyard and colleagues randomised 622 postmenopausal women with one or more vertebral compression fractures to calcitriol 0.25 micrograms twice daily or 1 g of elemental calcium daily for three years, in a single-blind multicentre study. New vertebral fractures were 9.3 against 25.0 per 100 patient-years in year two and 9.9 against 31.5 in year three, P<0.001. The effect was present only in the subgroup with five or fewer vertebral fractures at baseline, where the figures were 5.2 against 25.3 and 4.2 against 31.0. Peripheral fractures were 11 in 11 women against 24 in 22 women, P<0.05. Three features limit it: single-blind design in a fracture trial read radiographically, a calcium-group fracture rate several times higher than in contemporaneous placebo arms of other osteoporosis trials, and a treatment effect confined to a baseline-severity subgroup. Postmenopausal osteoporosis is not an approved indication for calcitriol in the United States, and the result has not been reproduced at that magnitude.',
        evidenceSource: 'Tilyard MW et al., N Engl J Med 1992;326:357-362',
        doi: '10.1056/NEJM199202063260601',
        inferredClaim:
          'That calcitriol is an osteoporosis treatment — a single-blind trial against a calcium comparator with an implausibly high event rate, positive only in a subgroup, that no regulator converted into an indication',
        auditFlag: 'contested',
      },
      {
        id: 'cal-a4',
        category: 'measured',
        title: 'Hypercalcaemia is common and the label quantifies it',
        laymanSummary:
          'In the hypoparathyroidism studies, about one in three patients had a high calcium level at least once and about one in seven had too much calcium in the urine. About one in six had a rise in a kidney blood test.',
        technicalDetails:
          'The label reports that in clinical studies in hypoparathyroidism and pseudohypoparathyroidism, hypercalcaemia was noted on at least one occasion in about one in three patients and hypercalciuria in about one in seven, while elevated serum creatinine was observed in about one in six, roughly half of whom had normal values at baseline. Where hypercalcaemia and hyperphosphataemia coexist, soft-tissue calcification can occur and can be seen radiographically. In patients with normal renal function, chronic hypercalcaemia may itself raise serum creatinine. Because the drug has a short biological half-life, calcium normalises within a few days of withdrawal, much faster than after vitamin D3 preparations.',
        evidenceSource:
          'Calcitriol United States prescribing information, Adverse Reactions and Warnings (openFDA label endpoint)',
        measuredMetric:
          'Hypercalcaemia in about 1 in 3 patients, hypercalciuria in about 1 in 7, elevated serum creatinine in about 1 in 6, in the hypoparathyroidism programme',
        auditFlag: 'caution',
      },
      {
        id: 'cal-a5',
        category: 'measured',
        title: 'This is a gene switch, not a mineral',
        laymanSummary:
          'The drug does not carry calcium into the body. It binds a receptor that sits on DNA and turns on the genes for the transporters that carry calcium across the gut wall, and turns down the gene for parathyroid hormone.',
        technicalDetails:
          'Calcitriol binds the vitamin D receptor, which heterodimerises with the retinoid X receptor and occupies vitamin D response elements in target gene promoters. In intestinal epithelium this raises transcription of the apical calcium channel TRPV6 and of the cytosolic shuttle calbindin, increasing transcellular calcium absorption. In the parathyroid chief cell the same complex acts on a negative response element in the parathyroid hormone gene, suppressing its transcription — which is the basis of the secondary hyperparathyroidism indication and, in the same action, of the hypercalcaemia risk. The label describes the drug as the active hormone exerting vitamin D activity, and describes its adverse effects as in general those of excessive vitamin D intake.',
        evidenceSource:
          'Calcitriol United States prescribing information, Indications and Usage and Adverse Reactions (openFDA label endpoint)',
        measuredMetric:
          'Roughly thousandfold higher vitamin D receptor affinity than 25-hydroxyvitamin D, requiring both the hepatic 25- and renal 1-alpha hydroxyls',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given as the finished hormone because the kidney cannot finish it',
        laymanDesc:
          'Vitamin D needs two chemical changes to work, one in the liver and one in the kidney. When the kidney fails, the second never happens. This capsule is the molecule that would have been made.',
        molecularDetail:
          'Cholecalciferol is 25-hydroxylated in the liver, then 1-alpha-hydroxylated by CYP27B1 in the proximal renal tubule. Loss of functioning tubular mass removes that enzyme, so 25-hydroxyvitamin D accumulates and the active hormone falls. Calcitriol bypasses both steps, which also means it bypasses the feedback that normally regulates the last one.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters cells and binds a receptor that lives on DNA',
        laymanDesc:
          'Unlike most drugs it does not act at the cell surface. It travels into the nucleus and binds a protein that is already sitting on the genes it controls.',
        molecularDetail:
          'The vitamin D receptor is a nuclear hormone receptor. Both the hepatic 25-hydroxyl and the renal 1-alpha-hydroxyl are required for high-affinity binding, which is roughly a thousandfold greater than for 25-hydroxyvitamin D — the structural reason the precursor cannot substitute.',
        iconName: 'Dna',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It pairs with a partner receptor and grips the response element',
        laymanDesc:
          'The drug-bound receptor joins with a partner protein, and the pair clamps onto specific sequences in front of the genes they control.',
        molecularDetail:
          'The ligand-bound receptor heterodimerises with the retinoid X receptor and occupies vitamin D response elements — direct repeats separated by three nucleotides — recruiting coactivators and the transcriptional machinery.',
        iconName: 'Link',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'In the gut, calcium transport genes switch on',
        laymanDesc:
          'The cells lining the intestine start making the channels and carriers that pull calcium out of food. That is why calcium in blood rises.',
        molecularDetail:
          'Transcription of TRPV6, the apical calcium channel, and of calbindin, the cytosolic buffer that shuttles calcium to the basolateral pump, both rise. Transcellular absorption increases, which the label describes as enhanced calcium absorption and reduced serum alkaline phosphatase.',
        iconName: 'ArrowUpCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In the parathyroid gland, hormone production is switched down',
        laymanDesc:
          'The same receptor in the parathyroid gland does the opposite: it turns the parathyroid hormone gene down. Combined with the rise in blood calcium, that is what relieves the overactive gland.',
        molecularDetail:
          'The receptor complex acts at a negative vitamin D response element in the parathyroid hormone gene promoter, lowering transcription directly, while the rise in serum calcium suppresses secretion through the calcium-sensing receptor. Both arms converge, which is why hypercalcaemia and parathyroid hormone suppression are inseparable for this molecule.',
        iconName: 'ArrowDownCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'The numbers move; whether anything else does is unresolved',
        laymanDesc:
          'Calcium rises and parathyroid hormone falls, which is what treatment is aimed at. Across seventy-six trials, deaths, bone pain, artery hardening and parathyroid surgery did not fall, and high calcium became more common.',
        molecularDetail:
          'Pooled across 76 randomised trials in 3667 participants, vitamin D compounds did not reduce death, bone pain, vascular calcification or parathyroidectomy; established sterols raised hypercalcaemia (RR 2.37) and hyperphosphataemia (RR 1.77) without a consistent parathyroid hormone reduction. Only 8 trials reported mortality.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Palmer 2007 meta-analysis of vitamin D compounds in chronic kidney disease',
        phase: 'Systematic review and meta-analysis of 76 randomised controlled trials',
        sampleSize: 3667,
        primaryEndpoint:
          'Mortality, cardiovascular outcomes and biochemical markers of mineral metabolism',
        endpointMet: false,
        statisticalPValue:
          'No reduction in death, bone pain, vascular calcification or parathyroidectomy; hypercalcaemia relative risk 2.37 (95% CI 1.16 to 4.85) for established sterols',
        unreportedAdverseSignals:
          'Only 8 of 76 trials reported mortality at all, and only 5 directly compared newer with established compounds. The evidence base is large in trial count and thin in outcomes.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tilyard 1992 — calcitriol against calcium in postmenopausal osteoporosis',
        phase: 'Prospective, multicentre, single-blind, randomised, three years',
        sampleSize: 622,
        primaryEndpoint: 'New vertebral fracture rate per 100 patient-years',
        endpointMet: true,
        statisticalPValue:
          'Year 3: 9.9 against 31.5 fractures per 100 patient-years, P<0.001; effect confined to women with five or fewer baseline fractures',
        unreportedAdverseSignals:
          'Single-blind, with a comparator-group fracture rate several times higher than placebo arms of contemporaneous osteoporosis trials, and a treatment effect present only in a baseline-severity subgroup. Postmenopausal osteoporosis never became an approved indication.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Increased intestinal calcium absorption and reduced serum alkaline phosphatase, stated in the label as the basis of the dialysis indication',
        'Hypercalcaemia relative risk 2.37 (95% CI 1.16 to 4.85) and hyperphosphataemia 1.77 (1.15 to 2.74) against placebo for established vitamin D sterols',
        'Hypercalcaemia in about one in three, hypercalciuria in about one in seven and raised serum creatinine in about one in six in the hypoparathyroidism programme',
        'Vertebral fracture rate 9.9 against 31.5 per 100 patient-years in the third year of the 1992 New Zealand trial',
      ],
      unsupportedInferences: [
        'That suppressing parathyroid hormone and normalising alkaline phosphatase translates into fewer deaths, fractures or less vascular calcification',
        'That calcitriol is a treatment for postmenopausal osteoporosis, which is not an approved indication and rests on one unreplicated single-blind trial',
        'That the newer analogues are safer, when the pooled hypercalcaemia relative risk against placebo was higher for them, at 5.15, than for the established sterols',
        'That ordinary vitamin D supplements do the same thing — they cannot, because the missing activation step is the one the kidney performs',
      ],
      whatFailedInitially: [
        'Across 76 randomised trials the class did not reduce death, bone pain, vascular calcification or parathyroidectomy',
        'Established sterols did not show a consistent reduction in parathyroid hormone, the biochemical target they are prescribed to move',
        'Only 8 of 76 trials reported mortality, so the outcome question was largely never asked rather than answered',
        'The 1992 osteoporosis result was never reproduced and never converted into an indication',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1978 and generic for decades, at about sixteen cents a capsule',
        'Remains standard care for hypoparathyroidism, where replacing the missing hormonal end-product is the entire rationale and calcium is the direct outcome',
        'In chronic kidney disease it is prescribed to a biochemical target, and the value of doing so remains, in the pooled reviewers’ word, uncertain',
        'The calcimimetic cinacalcet was developed in part because lowering parathyroid hormone with a vitamin D sterol raises calcium as an inseparable consequence',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and oral solution; an intravenous form and a topical ointment also exist',
      description:
        'Given by mouth in microgram doses, or intravenously during dialysis where higher doses suppress parathyroid hormone more effectively. A topical form is a separate product for plaque psoriasis and is not interchangeable.',
      safetyProfile:
        'No boxed warning. The characteristic hazard is hypercalcaemia, and the label states that adverse effects are in general those of excessive vitamin D intake. Early features are weakness, headache, somnolence, nausea, vomiting, dry mouth, constipation, muscle and bone pain, metallic taste and loss of appetite; later features include polyuria, weight loss, ectopic calcification, nephrocalcinosis, hypertension and arrhythmia. Concurrent hypercalcaemia and hyperphosphataemia can cause radiographically visible soft-tissue calcification. Because the biological half-life is short, elevated calcium normalises within days of stopping.',
    },
    commonQuestions: [
      {
        q: 'How is this different from a vitamin D supplement?',
        a: 'It is the finished hormone rather than the raw material. Vitamin D from sun or diet is inert; the liver adds one hydroxyl to make 25-hydroxyvitamin D, the form measured in a blood test, and the kidney adds a second to make calcitriol, which is roughly a thousand times better at binding its receptor. In kidney failure the second step is what has been lost, so giving more of the raw material achieves nothing. It also means calcitriol bypasses the body’s own regulation of that final step, which is exactly why hypercalcaemia is its characteristic hazard and is not a hazard of ordinary supplements.',
      },
      {
        q: 'Does it prevent fractures?',
        a: 'That has not been shown. In chronic kidney disease, the pooled analysis of 76 randomised trials in 3667 people found no reduction in death, bone pain, vascular calcification or the need for parathyroid surgery, and did not find a consistent reduction in parathyroid hormone for the older sterols. In postmenopausal osteoporosis there is one 1992 New Zealand trial in 622 women reporting a large reduction in spinal fractures, but it was single-blind, the calcium comparison group fractured at a rate several times higher than placebo arms of other trials from the same era, and the effect appeared only in women with five or fewer fractures at the start. It has not been reproduced and postmenopausal osteoporosis is not an approved indication.',
        auditNote:
          'A trial where the control arm fractures at 31.5 per 100 patient-years is a trial to be curious about. Either the population was unlike any other studied, or something else differed between the groups.',
      },
      {
        q: 'Why does it raise calcium so easily?',
        a: 'Because raising calcium is the mechanism, not a side effect of it. The drug turns on the genes for the transporters that pull calcium out of food, and that is what relieves the low calcium of kidney failure and hypoparathyroidism. The same action, applied a little too hard, is hypercalcaemia. In the hypoparathyroidism studies about one in three patients had a raised calcium at least once. The consolation is speed: because the molecule has a short biological half-life, calcium comes back down within a few days of stopping, where a high dose of vitamin D3 can take weeks.',
      },
      {
        q: 'Why is cinacalcet sometimes used with it?',
        a: 'Because they lower parathyroid hormone by opposite routes on calcium. A vitamin D sterol suppresses the parathyroid hormone gene and simultaneously raises blood calcium, so the amount you can give is limited by the calcium. Cinacalcet makes the gland behave as though calcium were already high, so parathyroid hormone falls and calcium falls with it. Using both allows the parathyroid hormone target to be reached without pushing calcium in either direction too far. Whether reaching that target improves anything a patient experiences is the unresolved question on both pages.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Palmer SC et al. Meta-analysis: vitamin D compounds in chronic kidney disease. Ann Intern Med 2007;147:840-853',
        identifier: '10.7326/0003-4819-147-12-200712180-00004',
        kind: 'doi',
      },
      {
        label:
          'Tilyard MW, Spears GF, Thomson J, Dovey S. Treatment of postmenopausal osteoporosis with calcitriol or calcium. N Engl J Med 1992;326:357-362',
        identifier: '10.1056/NEJM199202063260601',
        kind: 'doi',
      },
      {
        label:
          'Calcitriol United States prescribing information (openFDA label endpoint) — indications and usage, warnings, adverse reactions',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22calcitriol%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Cinacalcet — the first calcimimetic, and a drug whose two biggest results are both null
  //    unadjusted and positive adjusted, in the same trial.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'cinacalcet',
    name: 'Cinacalcet',
    tradeName: 'Sensipar',
    sponsor:
      'Amgen (originator, Sensipar, approved 2004, developed from NPS Pharmaceuticals chemistry); now made generically',
    targetGene: 'CASR — the calcium-sensing receptor gene',
    targetProtein:
      'Calcium-sensing receptor on the parathyroid chief cell, a class C G-protein-coupled receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2004,
    indication:
      'Secondary hyperparathyroidism in adults with chronic kidney disease on dialysis; hypercalcaemia in adults with parathyroid carcinoma; and hypercalcaemia in adults with primary hyperparathyroidism for whom parathyroidectomy would be indicated on serum calcium but who are unable to undergo it. The label states it is not indicated in chronic kidney disease without dialysis, because of hypocalcaemia risk',
    patientFriendlyIndication:
      'Overactive parathyroid glands, mainly in people on dialysis, and high blood calcium caused by a parathyroid tumour',
    anatomicalSite:
      'The surface of the parathyroid chief cell — the sensor that decides how much parathyroid hormone the gland releases',
    conditionContext: {
      conditionExplainer:
        'The parathyroid gland measures blood calcium with a receptor on its own surface. When calcium is low, the receptor is quiet and the gland releases hormone. In kidney failure the gland is driven hard for years, grows, and starts releasing hormone almost regardless of calcium. This drug makes the receptor more sensitive, so the gland behaves as though calcium were higher than it is.',
      whyItMatters:
        'It was the first drug of its kind: an allosteric modulator of a G-protein-coupled receptor at a site away from where the natural ligand binds. It is also the clearest case in this file of the same trial being null in its headline analysis and positive after adjustment, twice, for two different endpoints.',
      whoTakesThis:
        'Adults on dialysis with secondary hyperparathyroidism, and adults with hypercalcaemia from parathyroid carcinoma or from primary hyperparathyroidism when surgery is not possible.',
      clinicalGoals:
        'Lower parathyroid hormone without raising calcium, which a vitamin D sterol cannot do. Whether that translates into fewer deaths, cardiovascular events or fractures is the question EVOLVE was built to answer.',
    },
    oneSentenceVerdict:
      'The first calcimimetic — a molecule that binds the calcium-sensing receptor away from the calcium site and makes it read the same calcium as higher — whose 3883-patient cardiovascular outcome trial missed its primary endpoint in the unadjusted intention-to-treat analysis at a hazard ratio of 0.93 (95% CI 0.85 to 1.02, P=0.11), and whose prespecified fracture endpoint was likewise null unadjusted at 0.89 (0.75 to 1.07) and positive after adjustment at 0.83 (0.72 to 0.98).',
    laymanHowItWorks:
      'The parathyroid gland has a sensor on its surface that reads how much calcium is in the blood. This drug does not block that sensor or imitate calcium. It binds to a different part of the same sensor and makes it more responsive, so the same amount of calcium produces a louder signal. The gland concludes calcium is adequate and releases less hormone — and because it is not raising calcium to achieve this, calcium falls rather than rises.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 66,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.7581 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 31 listed generic products, survey effective 20 May 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in March 2004 and generic since 2018 after protracted patent litigation. At about seventy-six cents a tablet at acquisition it costs roughly three times a generic alendronate tablet and a fraction of what it cost on patent.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The options for an overactive parathyroid gland in dialysis are a vitamin D sterol, a calcimimetic, or surgery, and they differ mainly in what they do to calcium. Vitamin D sterols lower parathyroid hormone by raising calcium; cinacalcet lowers it by lowering calcium; parathyroidectomy removes the gland. Combinations exist because the calcium effects offset.',
      conventionalRx: [
        {
          name: 'Calcitriol and the later vitamin D receptor activators',
          class: 'Vitamin D receptor agonists',
          howItCompares:
            'Suppress the parathyroid hormone gene directly and raise gut calcium absorption at the same time, so how much can be given is limited by calcium. In the pooled analysis of 76 trials the established sterols raised hypercalcaemia at a relative risk of 2.37 without showing a consistent parathyroid hormone reduction.',
          typicalCost:
            'US$0.1607 per unit at United States pharmacy acquisition cost for calcitriol (CMS NADAC, median across 23 listed generic products, survey effective 17 June 2026)',
          prosAndCons:
            'Pros: cheap, decades of use, corrects the hormonal deficiency that failing kidneys create. Cons: raises calcium and phosphate; patient-level benefit unproven across a large trial literature.',
        },
        {
          name: 'Etelcalcetide',
          class: 'Intravenous calcimimetic peptide, given with dialysis',
          howItCompares:
            'The same receptor by a different chemistry, given intravenously at the end of a dialysis session rather than swallowed daily, which removes the adherence problem and the nausea associated with an oral calcimimetic.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for etelcalcetide was held on this record at the time of writing',
          prosAndCons:
            'Pros: administered by the dialysis unit, so it is taken; less gastrointestinal upset. Cons: hypocalcaemia remains the defining risk; no outcome trial of the size of EVOLVE.',
        },
        {
          name: 'Parathyroidectomy',
          class: 'Surgical removal of parathyroid tissue',
          howItCompares:
            'The definitive option, and the comparator that matters for the primary hyperparathyroidism indication — the label restricts that use to people for whom surgery is indicated but not possible.',
          typicalCost: 'A surgical episode; not a drug cost and not captured by this dataset',
          prosAndCons:
            'Pros: permanent. Cons: irreversible, with a risk of persistent hypoparathyroidism afterwards, which is the condition calcitriol on the neighbouring page is used to treat.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report tingling, muscle cramps or spasms straight away',
          action:
            'Describe tingling around the mouth or in the fingers, cramps, or twitching, and say when it started.',
          patientImpact:
            'These are the early features of low calcium. The label records that life-threatening events and fatal outcomes associated with hypocalcaemia have been reported, including in children.',
          clinicalPrecaution:
            'Significant lowering of calcium can prolong the QT interval, lower the seizure threshold and cause ventricular arrhythmia. This is the reason the drug is not indicated in chronic kidney disease without dialysis.',
        },
        {
          name: 'Say if you take a drug metabolised by CYP2D6',
          action:
            'Mention antidepressants, some antiarrhythmics, and tamoxifen, which needs CYP2D6 to become active.',
          patientImpact:
            'Cinacalcet is a strong inhibitor of that enzyme, so it can raise the level of drugs cleared by it and lower the effect of drugs activated by it.',
          clinicalPrecaution:
            'This is an interaction to be checked by a prescriber or pharmacist rather than managed by the patient, and it is easy to miss because the drug sits with the dialysis team rather than with the prescriber of the other medicine.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@H](C1=CC=CC2=CC=CC=C21)NCCCC3=CC(=CC=C3)C(F)(F)F',
      chemicalFormula: 'C22H22F3N',
      molecularWeight: '357.40 g/mol',
      targetReceptorAffinity:
        'A positive allosteric modulator of the calcium-sensing receptor: it does not activate the receptor on its own and instead increases its sensitivity to extracellular calcium. Maximum plasma concentration is reached in about 2 to 6 hours, with an initial half-life of about 6 hours and a terminal half-life of 30 to 40 hours; steady state is reached within 7 days. Volume of distribution is approximately 1000 L and plasma protein binding 93% to 97%. A high-fat meal raises Cmax by 82% and AUC by 68% against fasting.',
      structureSource: {
        label:
          'PubChem CID 156419 (cinacalcet) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/156419',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cin-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric purity of the naphthylethylamine fragment',
          description:
            'Confirm the R configuration at the single stereocentre before coupling. The two enantiomers differ substantially in calcimimetic potency at the receptor, and because the molecule has only one stereocentre there is no other structural feature to distinguish them by a routine achiral method.',
          reagentsAndBuffer:
            '(R)-1-(1-naphthyl)ethylamine reference standard, chiral HPLC on a polysaccharide stationary phase, optical rotation measurement, 1H NMR in deuterochloroform',
        },
        {
          id: 'cin-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Reductive amination to join the two aromatic halves',
          description:
            'Couple the naphthylethylamine to the trifluoromethylphenyl propanal by reductive amination, forming the single secondary amine that is the molecule’s only ionisable group. The three-carbon linker length is the structure-activity feature that matters: shortening or lengthening it loses activity at the receptor.',
          dependsOnStepId: 'cin-w1',
          reagentsAndBuffer:
            '3-(3-trifluoromethylphenyl)propionaldehyde, sodium triacetoxyborohydride or catalytic hydrogenation, methanol or dichloroethane, controlled pH to favour imine formation before reduction',
        },
        {
          id: 'cin-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Hydrochloride salt formation and polymorph control',
          description:
            'Form and crystallise the hydrochloride. Polymorph control matters here because the free base is a lipophilic oil and the marketed product is a tablet: which crystal form is isolated decides dissolution, and dissolution decides exposure in a drug whose absorption is already strongly food-dependent.',
          dependsOnStepId: 'cin-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethyl acetate, seeded cooling crystallisation, X-ray powder diffraction and differential scanning calorimetry for form identity, chiral HPLC on the isolated salt',
        },
        {
          id: 'cin-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Calcium-response curve shift in a receptor-expressing cell line',
          description:
            'Measure intracellular calcium flux across a range of extracellular calcium concentrations with and without the compound, and confirm the curve shifts left rather than rising. A left shift with no change in maximum is the signature of positive allosteric modulation, and a compound that raises the response at zero calcium is an agonist and a different, more dangerous drug.',
          dependsOnStepId: 'cin-w3',
          reagentsAndBuffer:
            'HEK293 cells stably expressing the human calcium-sensing receptor, Fluo-4 or aequorin calcium indicator, buffered calcium series across the physiological range, parental untransfected cells as the specificity control',
        },
        {
          id: 'cin-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Parathyroid hormone suppression against a serum calcium safety readout',
          description:
            'Quantify parathyroid hormone secretion from parathyroid cells and pair it with serum calcium in vivo. The two readouts move in the same direction here, which is the opposite of a vitamin D sterol, and it is why the safety limit of this drug is a low calcium rather than a high one.',
          dependsOnStepId: 'cin-w4',
          reagentsAndBuffer:
            'Bovine or human parathyroid cell preparations, intact PTH immunoradiometric or chemiluminescent assay, albumin-corrected serum calcium in the corresponding in vivo model, QT interval monitoring in the safety pharmacology package',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cin-a1',
        category: 'failed',
        title: 'EVOLVE missed its primary endpoint in the analysis it declared',
        laymanSummary:
          'The largest trial of this drug enrolled 3883 dialysis patients and followed them for up to five years. In the analysis it had committed to in advance, deaths and major cardiovascular events were not significantly reduced.',
        technicalDetails:
          'EVOLVE randomised 3883 haemodialysis patients with moderate-to-severe secondary hyperparathyroidism — median intact parathyroid hormone 693 pg/mL — to cinacalcet or placebo, with all patients eligible for conventional therapy including phosphate binders and vitamin D sterols, and followed them for up to 64 months. The primary composite of death, myocardial infarction, hospitalisation for unstable angina, heart failure or a peripheral vascular event occurred in 938 of 1948 (48.2%) on cinacalcet and 952 of 1935 (49.2%) on placebo, relative hazard 0.93 (95% CI 0.85 to 1.02, P=0.11), in the prespecified intention-to-treat analysis. Median study-drug exposure was 21.2 months on cinacalcet against 17.5 months on placebo, a difference that is itself part of the interpretive problem. Hypocalcaemia and gastrointestinal adverse events were significantly more frequent on cinacalcet.',
        evidenceSource:
          'EVOLVE Trial Investigators, N Engl J Med 2012;367:2482-2494 (NCT00345839)',
        doi: '10.1056/NEJMoa1205624',
        measuredMetric:
          'Primary composite endpoint relative hazard 0.93 (95% CI 0.85 to 1.02), P=0.11 — not met',
        auditFlag: 'caution',
      },
      {
        id: 'cin-a2',
        category: 'inferred',
        title: 'The fracture endpoint tells the same story: null unadjusted, positive adjusted',
        laymanSummary:
          'Clinical fractures were counted as a planned secondary outcome. Unadjusted, there was no significant difference. Adjusted for baseline differences and repeated fractures it became significant, and adjusted further for how long people actually took the drug it grew larger.',
        technicalDetails:
          'Clinical fractures occurred in 255 of 1935 placebo patients (13.2%) and 238 of 1948 cinacalcet patients (12.2%). Unadjusted intention-to-treat relative hazard was 0.89 (95% CI 0.75 to 1.07). After adjustment for baseline characteristics and multiple fractures it was 0.83 (0.72 to 0.98). Using the prespecified lag-censoring analysis, a measure of actual drug exposure, it was 0.72 (0.58 to 0.90); censoring at cointerventions such as parathyroidectomy, transplantation or commercial cinacalcet gave 0.71 (0.58 to 0.87). The authors state both halves plainly: in the unadjusted intention-to-treat analysis cinacalcet did not reduce fracture, and after accounting for baseline differences, multiple fractures and discontinuation it reduced fracture by 16% to 29%. Every adjustment moves the estimate the same way, which is either a real effect obscured by crossover and dropout, or the signature of analytical flexibility. The trial cannot distinguish between those.',
        evidenceSource: 'Moe SM et al., J Am Soc Nephrol 2015;26:1466-1475 (EVOLVE fracture analysis)',
        doi: '10.1681/ASN.2014040414',
        inferredClaim:
          'That cinacalcet reduces fractures — the declared unadjusted analysis says it does not, and every adjusted analysis says it does by between 16% and 29%',
        auditFlag: 'contested',
      },
      {
        id: 'cin-a3',
        category: 'measured',
        title: 'Low calcium is the defining harm, and it has been fatal',
        laymanSummary:
          'Because the drug works by lowering calcium, pushing it too far is the main danger. The label records life-threatening events and deaths associated with low calcium, including in children, and the drug is not approved for children.',
        technicalDetails:
          'The label states that significant lowering of serum calcium can cause paraesthesias, myalgias, muscle spasms, tetany, seizures, QT prolongation and ventricular arrhythmia, and that life-threatening events and fatal outcomes associated with hypocalcaemia have been reported, including in paediatric patients. Safety and effectiveness in children have not been established. The drug is explicitly not indicated in chronic kidney disease without dialysis because of increased hypocalcaemia risk. Other labelled warnings cover upper gastrointestinal bleeding in patients with risk factors, postmarketing reports of hypotension, worsening heart failure and arrhythmia in impaired cardiac function, and adynamic bone disease if intact parathyroid hormone is suppressed below 100 pg/mL — the last being an iatrogenic bone disease produced by treating the bone disease.',
        evidenceSource:
          'Cinacalcet United States prescribing information, Warnings and Precautions 5.1 to 5.4 and Indications and Usage Limitations (openFDA label endpoint)',
        measuredMetric:
          'Hypocalcaemia and gastrointestinal adverse events significantly more frequent than placebo in 3883 randomised patients',
        auditFlag: 'caution',
      },
      {
        id: 'cin-a4',
        category: 'measured',
        title: 'It is a modulator, not an agonist, and that distinction is the safety margin',
        laymanSummary:
          'The drug does not switch the calcium sensor on. It makes the sensor more responsive to the calcium already there. That means its effect is bounded by how much calcium is present rather than being open-ended.',
        technicalDetails:
          'Cinacalcet binds the transmembrane domain of the calcium-sensing receptor, away from the extracellular calcium-binding site, and increases the receptor’s sensitivity to activation by extracellular calcium. The label describes it as a calcimimetic that directly lowers parathyroid hormone by increasing that sensitivity, with the reduction in parathyroid hormone accompanied by a concomitant fall in serum calcium. The pharmacodynamic signature is a leftward shift in the calcium-response curve rather than a raised baseline response: the nadir in intact parathyroid hormone occurs 2 to 6 hours after a dose, matching the maximum plasma concentration, and serum calcium then remains constant across the dosing interval once steady state is reached within 7 days.',
        evidenceSource:
          'Cinacalcet United States prescribing information, Clinical Pharmacology 12.1 and 12.2 (openFDA label endpoint)',
        measuredMetric:
          'Intact parathyroid hormone nadir 2 to 6 hours post dose, matching Cmax; steady state within 7 days',
        auditFlag: 'verified',
      },
      {
        id: 'cin-a5',
        category: 'inferred',
        title: 'A drug whose exposure was 21 months against a placebo group’s 17.5',
        laymanSummary:
          'The two groups did not take their assigned treatment for the same length of time. That difference on its own can move a result in a long trial, and it is why the adjusted analyses exist at all.',
        technicalDetails:
          'Median duration of study-drug exposure was 21.2 months on cinacalcet against 17.5 months on placebo, in a trial with up to 64 months of follow-up. Differential discontinuation in a trial of this length undermines an intention-to-treat comparison in the direction of the null, because placebo patients who left the study could and did receive commercial cinacalcet — which is precisely what the censoring-at-cointervention analysis of the fracture endpoint was designed to handle, and which returned a relative hazard of 0.71. Interpreting this trial therefore requires choosing between an analysis that is unbiased by design but diluted by crossover, and analyses that correct for crossover at the cost of no longer being randomised comparisons.',
        evidenceSource:
          'EVOLVE Trial Investigators, N Engl J Med 2012;367:2482-2494; Moe SM et al., J Am Soc Nephrol 2015;26:1466-1475',
        doi: '10.1056/NEJMoa1205624',
        inferredClaim:
          'That the intention-to-treat null is the final answer, or that the adjusted positives are — neither analysis is clean, and the trial has not been repeated',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed daily, and much better absorbed with food',
        laymanDesc:
          'A tablet taken once or twice a day. Taking it with a meal substantially increases how much gets into the blood.',
        molecularDetail:
          'Maximum plasma concentration is reached in about 2 to 6 hours. A high-fat meal raises Cmax by 82% and AUC by 68% against fasting; a low-fat meal raises them 65% and 50%. Concentrations then decline biphasically with an initial half-life of about 6 hours and a terminal half-life of 30 to 40 hours.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It reaches the parathyroid gland’s calcium sensor',
        laymanDesc:
          'The molecule spreads widely through the body and finds a receptor that sits on the surface of the cells in the parathyroid gland.',
        molecularDetail:
          'Volume of distribution is approximately 1000 L, indicating extensive tissue distribution, with 93% to 97% plasma protein binding. The target is the calcium-sensing receptor, a class C G-protein-coupled receptor whose principal role is regulating parathyroid hormone synthesis and secretion.',
        iconName: 'Target',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'It binds a different part of the receptor from calcium',
        laymanDesc:
          'Calcium binds at the outside end of the receptor. This drug binds within the part embedded in the membrane, somewhere else entirely.',
        molecularDetail:
          'The binding site is in the seven-transmembrane domain, spatially separate from the large extracellular Venus flytrap domain where calcium binds. That separation is what makes the drug an allosteric modulator rather than a competitor, and it is why the receptor still requires calcium to respond.',
        iconName: 'Wrench',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The sensor now reads the same calcium as higher',
        laymanDesc:
          'Nothing about the blood has changed, but the gland behaves as though calcium had risen. It releases less hormone.',
        molecularDetail:
          'Positive allosteric modulation shifts the calcium concentration-response curve leftward without raising the maximal response. Receptor activation raises intracellular calcium through Gq and phospholipase C and suppresses parathyroid hormone secretion and, over time, synthesis. Intact parathyroid hormone reaches its nadir 2 to 6 hours after a dose, tracking the plasma concentration.',
        iconName: 'ArrowDownCircle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Calcium falls with the hormone rather than rising',
        laymanDesc:
          'Less parathyroid hormone means less calcium pulled out of bone and less reabsorbed by the kidney, so calcium in blood goes down. That is the opposite of what a vitamin D drug does.',
        molecularDetail:
          'The label states the reduction in parathyroid hormone is associated with a concomitant decrease in serum calcium. Because the calcium fall is intrinsic to the mechanism rather than an off-target effect, hypocalcaemia is the dose-limiting toxicity and cannot be engineered away within this class.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The biochemistry moves reliably; the outcomes are contested',
        laymanDesc:
          'Parathyroid hormone comes down, which is what the drug is prescribed for. Whether that means fewer deaths, heart attacks or fractures depends entirely on which analysis of the same trial you read.',
        molecularDetail:
          'EVOLVE primary composite relative hazard 0.93 (95% CI 0.85 to 1.02, P=0.11) unadjusted. Fracture relative hazard 0.89 (0.75 to 1.07) unadjusted, 0.83 (0.72 to 0.98) adjusted for baseline and multiple fractures, 0.72 (0.58 to 0.90) with lag censoring and 0.71 (0.58 to 0.87) censoring at cointervention. Every correction moves the estimate the same way and none of them is a randomised comparison.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'EVOLVE (NCT00345839)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, up to 64 months',
        sampleSize: 3883,
        primaryEndpoint:
          'Time to death, myocardial infarction, hospitalisation for unstable angina, heart failure or a peripheral vascular event',
        endpointMet: false,
        statisticalPValue:
          '48.2% against 49.2%; relative hazard 0.93 (95% CI 0.85 to 1.02), P=0.11 in the prespecified unadjusted intention-to-treat analysis',
        unreportedAdverseSignals:
          'Median study-drug exposure was 21.2 months on cinacalcet against 17.5 on placebo, and placebo patients could receive commercial cinacalcet after discontinuing. Hypocalcaemia and gastrointestinal adverse events were significantly more frequent on treatment.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'EVOLVE prespecified fracture analysis (Moe 2015)',
        phase: 'Prespecified secondary endpoint of the same randomised trial',
        sampleSize: 3883,
        primaryEndpoint: 'First clinical fracture event',
        endpointMet: false,
        statisticalPValue:
          'Unadjusted relative hazard 0.89 (95% CI 0.75 to 1.07); adjusted 0.83 (0.72 to 0.98); lag-censored 0.72 (0.58 to 0.90); censored at cointervention 0.71 (0.58 to 0.87)',
        unreportedAdverseSignals:
          'The paper reports the unadjusted null and the adjusted positive with equal prominence. Secondary citations of it overwhelmingly quote the adjusted figures.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Primary composite cardiovascular endpoint 48.2% against 49.2%, relative hazard 0.93 (95% CI 0.85 to 1.02), P=0.11',
        'Clinical fractures 12.2% against 13.2%, unadjusted relative hazard 0.89 (95% CI 0.75 to 1.07)',
        'Hypocalcaemia and gastrointestinal adverse events significantly more frequent than placebo in 3883 patients',
        'Intact parathyroid hormone nadir 2 to 6 hours after a dose, matching maximum plasma concentration',
      ],
      unsupportedInferences: [
        'That the trial showed a cardiovascular benefit — its declared analysis did not, and it is routinely cited as though the adjusted analysis were the result',
        'That the fracture reduction of 16% to 29% is established, when it appears only after adjustments that dissolve the randomisation',
        'That lowering parathyroid hormone is itself the benefit, rather than a surrogate for outcomes the trial could not demonstrate',
        'That the drug is suitable in chronic kidney disease before dialysis — the label states the opposite, on hypocalcaemia grounds',
      ],
      whatFailedInitially: [
        'The primary endpoint of a 3883-patient, 64-month trial was missed at P=0.11',
        'Differential exposure of 21.2 against 17.5 months, plus access to commercial drug after discontinuation, left the intention-to-treat comparison diluted',
        'Hypocalcaemia has caused life-threatening events and deaths, including in children, and the drug has no established paediatric safety',
        'Suppressing parathyroid hormone below 100 pg/mL can produce adynamic bone disease, an iatrogenic version of the problem being treated',
      ],
      realWorldOutcome: [
        'Approved in the United States in 2004 as the first calcimimetic and generic since 2018, at about seventy-six cents a tablet',
        'Widely used in dialysis units to reach a biochemical parathyroid hormone target, alongside or instead of a vitamin D sterol',
        'Its intravenous successor etelcalcetide addressed the adherence and nausea problems without changing the hypocalcaemia limit',
        'EVOLVE remains one of the most argued-over trials in nephrology, and it has not been repeated',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, taken with food',
      description:
        'Swallowed whole with a meal, because a high-fat meal raises exposure by roughly two-thirds against fasting. Nausea and vomiting are among the commonest reasons it is stopped, which is what motivated the development of an intravenous calcimimetic given by the dialysis unit.',
      safetyProfile:
        'No boxed warning. Hypocalcaemia is the defining risk and can cause paraesthesias, myalgias, muscle spasms, tetany, seizures, QT prolongation and ventricular arrhythmia; life-threatening events and fatal outcomes have been reported, including in children, and safety in children has not been established. Not indicated in chronic kidney disease without dialysis. Further labelled warnings cover upper gastrointestinal bleeding in patients with risk factors, postmarketing reports of hypotension, worsening heart failure and arrhythmia in impaired cardiac function, and adynamic bone disease if intact parathyroid hormone falls below 100 pg/mL. Cinacalcet is a strong CYP2D6 inhibitor.',
    },
    commonQuestions: [
      {
        q: 'Did the big trial work or not?',
        a: 'It depends which analysis is quoted, and that is the honest answer rather than an evasion. EVOLVE randomised 3883 dialysis patients and followed them for up to 64 months. In the analysis it had committed to in advance — unadjusted, intention-to-treat — the composite of death and major cardiovascular events was 48.2% against 49.2%, a relative hazard of 0.93 with a P value of 0.11. That is a miss. The trial also had a problem it could not design away: people on placebo who stopped could get the drug commercially, and median exposure was 21.2 months on drug against 17.5 on placebo. Analyses correcting for that move the result toward benefit. Correcting for crossover is reasonable and it is no longer a randomised comparison.',
        auditNote:
          'This is the pattern to watch for anywhere: a declared analysis that is null, a set of adjusted analyses that are positive, and secondary literature that cites only the second kind.',
      },
      {
        q: 'How is it different from a vitamin D drug for the same problem?',
        a: 'By what it does to calcium. Both lower parathyroid hormone. A vitamin D sterol such as calcitriol does it by acting on the parathyroid hormone gene while simultaneously increasing calcium absorption from the gut, so calcium rises and that rise is what limits the dose. Cinacalcet does it by making the gland’s own calcium sensor more responsive, so the gland acts as though calcium were high and calcium actually falls. The limiting risk is therefore low calcium rather than high. That is also why the two are often used together: their calcium effects offset.',
      },
      {
        q: 'Why can it not be used before dialysis?',
        a: 'The label states it directly: not indicated in chronic kidney disease without dialysis, because of an increased risk of hypocalcaemia. In someone still making urine and not being dialysed, the calcium fall this drug produces is harder to correct and harder to monitor between clinic visits. Low calcium is not a minor laboratory finding here — it can prolong the QT interval, lower the seizure threshold and cause ventricular arrhythmia, and the label records life-threatening events and deaths.',
      },
      {
        q: 'What is adynamic bone disease and why is it in the warnings?',
        a: 'It is bone that has stopped turning over. Parathyroid hormone is a driver of bone remodelling, and suppressing it too far leaves bone that is neither being dismantled nor rebuilt, which is itself brittle and slow to repair. The label warns that this may develop if intact parathyroid hormone falls below 100 pg/mL. It is the mirror image of the problem the drug is given for, produced by the treatment, which is why the target is a range rather than a floor.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'EVOLVE Trial Investigators. Effect of cinacalcet on cardiovascular disease in patients undergoing dialysis. N Engl J Med 2012;367:2482-2494',
        identifier: '10.1056/NEJMoa1205624',
        kind: 'doi',
      },
      {
        label:
          'Moe SM et al. Effects of cinacalcet on fracture events in patients receiving hemodialysis: the EVOLVE trial. J Am Soc Nephrol 2015;26:1466-1475',
        identifier: '10.1681/ASN.2014040414',
        kind: 'doi',
      },
      {
        label: 'EVOLVE — Evaluation of Cinacalcet HCl Therapy to Lower Cardiovascular Events',
        identifier: 'NCT00345839',
        kind: 'nct',
      },
      {
        label:
          'Cinacalcet United States prescribing information (openFDA label endpoint) — indications and limitations of use, warnings and precautions, clinical pharmacology',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22cinacalcet%22',
        kind: 'regulatory',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 9. Calcium carbonate — chalk. An over-the-counter antacid, the commonest bone supplement in
  //    the world, and the placebo arm of most of the trials in this file.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'calcium-carbonate',
    name: 'Calcium Carbonate',
    tradeName: 'Tums / Ultra Strength Antacid / Extra Strength Antacid / Caltrate',
    sponsor:
      'No single originator — a mineral sold under an over-the-counter antacid monograph and as a dietary supplement by many manufacturers; the antacid label on this record is held by Kenvue Brands',
    targetGene:
      'None. It has no molecular target: it neutralises stomach acid chemically and supplies calcium ions',
    targetProtein:
      'None. Absorbed calcium acts through the calcium-sensing receptor and through ordinary mineral incorporation into hydroxyapatite',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    approvalYear: 2000,
    indication:
      'As an over-the-counter antacid: relief of acid indigestion and heartburn, with the label limiting use to no more than the stated maximum in 24 hours and to no more than two weeks except under medical supervision. As a dietary supplement it is sold to raise calcium intake, which is a nutritional claim and not an approved drug indication',
    patientFriendlyIndication: 'Heartburn and indigestion, and topping up dietary calcium',
    anatomicalSite:
      'The stomach lumen, where it neutralises acid, and the small intestine, where a fraction of the calcium is absorbed',
    conditionContext: {
      conditionExplainer:
        'Calcium carbonate is chalk. In the stomach it reacts with hydrochloric acid, which is why it relieves heartburn within minutes. The reaction also frees calcium ions, a small proportion of which are absorbed, which is why the same substance is sold as a bone supplement. One chemical, two entirely different uses, sitting on the same shelf.',
      whyItMatters:
        'It is the comparator underneath almost every drug in this file. The alendronate, risedronate, raloxifene and zoledronic acid trials all gave calcium and vitamin D to their placebo groups, so every fracture reduction on those pages is a reduction on top of this. Its own effect on fractures, tested directly in 36,282 women, did not reach significance.',
      whoTakesThis:
        'Almost everyone at some point, for heartburn. And a very large number of postmenopausal women, daily and for years, for bone.',
      clinicalGoals:
        'Symptom relief within minutes for the antacid use. For the supplement use, an intake target — which is a different kind of goal from a fracture reduction, and the trials keep the distinction.',
    },
    oneSentenceVerdict:
      'Chalk, which neutralises stomach acid in minutes and supplies the mineral bone is built from — and which, given with 400 IU of vitamin D to 36,282 postmenopausal women for seven years, raised hip bone density by 1.06% while missing hip fracture at a hazard ratio of 0.88 (95% CI 0.72 to 1.08) and significantly increasing kidney stones at 1.17 (1.02 to 1.34).',
    laymanHowItWorks:
      'In the stomach it is a straightforward acid-base reaction: chalk plus stomach acid gives calcium, water and carbon dioxide, which is why relief is quick and why it can make you belch. In the intestine, a fraction of the freed calcium crosses into the blood, and that requires stomach acid to have dissolved it first — which is why this particular calcium salt is absorbed poorly by people on acid-blocking drugs.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0323 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 37 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'A mineral, mined or precipitated, with no patent and no originator. At about three United States cents per tablet at pharmacy acquisition it is the cheapest entry in this file by an order of magnitude, and cost is never the reason it is not taken.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For heartburn the alternatives are other antacids and the acid-suppressing drugs, which act more slowly and last far longer. For bone, the honest alternative is dietary calcium: the trial evidence for supplements is a small density gain, no significant fracture reduction in healthy postmenopausal women, more kidney stones, and a contested cardiovascular signal — none of which has been shown for calcium eaten as food.',
      conventionalRx: [
        {
          name: 'Calcium citrate',
          class: 'Alternative calcium salt',
          howItCompares:
            'Does not require stomach acid to dissolve, so it is the salt used when acid is suppressed by a proton pump inhibitor or after gastric surgery. It contains less elemental calcium per gram, so more tablets are needed for the same amount.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for calcium citrate was held on this record at the time of writing',
          prosAndCons:
            'Pros: absorption independent of gastric acid; less constipating for many people. Cons: a lower proportion of elemental calcium, so a larger tablet burden; no separate fracture evidence.',
        },
        {
          name: 'Proton pump inhibitors and H2 blockers',
          class: 'Acid suppression rather than acid neutralisation',
          howItCompares:
            'For heartburn they work far longer but not immediately, because they stop acid being made rather than removing acid already present. They also reduce absorption of calcium carbonate specifically, which is the interaction most often missed when someone takes both.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for a comparable acid suppressant was held on this record at the time of writing',
          prosAndCons:
            'Pros: sustained relief; treat the cause rather than the symptom. Cons: no immediate effect; long-term acid suppression impairs calcium carbonate absorption and is itself associated with fracture in observational data.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dairy — milk, yoghurt, hard cheese',
          activeCompound: 'Calcium, with protein, phosphorus and, in fortified products, vitamin D',
          biologicalMechanism:
            'Supplies calcium in a food matrix, absorbed gradually across a meal rather than as a single bolus. The cardiovascular signal reported for supplements has not been found for dietary calcium, and the leading hypothesis for that difference is the size and speed of the rise in blood calcium after a supplement.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated: this page carries no intake guidance. The relevant evidence is comparative — the harms reported in the supplement trials have not been reported for calcium consumed as food.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
        {
          name: 'Tinned sardines and salmon eaten with the bones',
          activeCompound: 'Calcium hydroxyapatite, with vitamin D and omega-3 fatty acids',
          biologicalMechanism:
            'Fish bones are hydroxyapatite, the same mineral form found in human bone, and are absorbed comparably to dairy calcium.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. These are among the few non-dairy foods that deliver calcium at a density comparable to milk.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
        {
          name: 'Kale, bok choy, broccoli and fortified plant drinks',
          activeCompound: 'Calcium, at varying absorbability',
          biologicalMechanism:
            'Low-oxalate greens deliver calcium that is absorbed at least as well as dairy calcium. High-oxalate greens such as spinach bind their own calcium and deliver very little of it, which is a common source of confusion in food tables.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. The oxalate distinction is the useful mechanistic fact and is why spinach is a poor calcium source despite a high number on the label.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not treat heartburn with it for more than the label allows',
          action:
            'The over-the-counter label limits use to the stated maximum in 24 hours and to no more than two weeks except under medical supervision.',
          patientImpact:
            'Persistent heartburn needs a diagnosis rather than more antacid, and sustained high-dose calcium with an alkali is the recipe for calcium-alkali syndrome.',
          clinicalPrecaution:
            'The label also warns that antacids interact with prescription medicines and directs asking a doctor or pharmacist first.',
        },
        {
          name: 'Separate it from other tablets',
          action:
            'Take it at a different time from thyroid hormone, tetracycline and quinolone antibiotics, iron and bisphosphonates.',
          patientImpact:
            'Calcium binds several drug classes in the gut and prevents their absorption. For an oral bisphosphonate, whose bioavailability is already under one percent, taking it with calcium reduces absorption to essentially nothing.',
          clinicalPrecaution:
            'This is a chelation effect in the gut lumen, not a metabolic interaction, so timing separates them. How far apart is a pharmacist’s question and is not addressed here.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(=O)([O-])[O-].[Ca+2]',
      chemicalFormula: 'CCaO3',
      molecularWeight: '100.09 g/mol',
      targetReceptorAffinity:
        'None. There is no receptor and no binding constant. Calcium carbonate is 40% elemental calcium by mass, the highest proportion of the common calcium salts, which is why it dominates the supplement market. Its dissolution requires gastric acid, so absorption falls substantially when acid is suppressed — the one pharmacological property that distinguishes it from calcium citrate.',
      structureSource: {
        label:
          'PubChem CID 10112 (calcium carbonate) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/10112',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Heavy metal and polymorph screening of the source mineral',
          description:
            'Test the limestone or oyster-shell source for lead, cadmium and arsenic, and identify the crystal polymorph. This is the step that matters most for a mineral product: the risk in calcium carbonate is almost entirely in what came with it out of the ground, not in the compound itself.',
          reagentsAndBuffer:
            'Inductively coupled plasma mass spectrometry for lead, cadmium, arsenic and mercury after acid digestion, X-ray powder diffraction for calcite against aragonite, loss on ignition for carbonate content',
        },
        {
          id: 'cc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Precipitation of pharmaceutical-grade carbonate',
          description:
            'Where mined limestone is not clean enough, calcium carbonate is precipitated by carbonating calcium hydroxide. Precipitation gives control of particle size and purity that grinding a rock cannot, and particle size is what decides how fast an antacid tablet works.',
          reagentsAndBuffer:
            'Calcined limestone slaked to calcium hydroxide, carbon dioxide sparging under controlled temperature and agitation, filtration and washing to remove soluble impurities',
          dependsOnStepId: 'cc-w1',
        },
        {
          id: 'cc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Particle sizing, drying and tabletting',
          description:
            'Dry, size and compress. For the antacid use the specification is acid-neutralising capacity, which is a functional test rather than a chemical one, and it depends on surface area as much as on assay.',
          dependsOnStepId: 'cc-w2',
          reagentsAndBuffer:
            'Laser diffraction particle sizing, direct compression with disintegrant and lubricant, acid-neutralising capacity determination by titration against standardised hydrochloric acid to the compendial endpoint',
        },
        {
          id: 'cc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Absorption measurement across an intestinal monolayer at controlled pH',
          description:
            'Measure calcium flux across an intestinal cell monolayer with the compound predissolved at gastric pH and, separately, at neutral pH. Running the neutral-pH arm is the point: it reproduces what happens on an acid-suppressing drug, and it is the condition under which this salt underperforms calcium citrate.',
          dependsOnStepId: 'cc-w3',
          reagentsAndBuffer:
            'Caco-2 monolayers on permeable supports, simulated gastric fluid at pH 1.2 and simulated intestinal fluid at pH 6.8, stable-isotope calcium-44 tracer, transepithelial electrical resistance monitoring for monolayer integrity',
        },
        {
          id: 'cc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Serum calcium excursion and urinary calcium after a single dose',
          description:
            'Track the rise in blood calcium over the hours after a dose and the calcium appearing in urine. The size and speed of that excursion is the leading hypothesis for why supplements carry a cardiovascular signal that dietary calcium does not, and it is measurable.',
          dependsOnStepId: 'cc-w4',
          reagentsAndBuffer:
            'Serial albumin-corrected serum calcium over 8 hours, ionised calcium by direct electrode, 24-hour urinary calcium and creatinine, matched dietary-calcium comparison meal at equal elemental calcium',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cc-a1',
        category: 'failed',
        title: 'In 36,282 women over seven years, hip fracture was not significantly reduced',
        laymanSummary:
          'The largest trial ever run of calcium and vitamin D gave it to more than thirty-six thousand postmenopausal women for seven years. Hip bone density rose by about one percent. Hip fractures did not fall significantly. Kidney stones went up.',
        technicalDetails:
          'The Women’s Health Initiative Calcium/Vitamin D trial randomised 36,282 postmenopausal women aged 50 to 79 to 1000 mg of elemental calcium as calcium carbonate with 400 IU of vitamin D3 daily or placebo, with fractures ascertained over an average of 7.0 years. Hip bone density was 1.06% higher on treatment (P<0.01). In intention-to-treat analysis the hazard ratio was 0.88 for hip fracture (95% CI 0.72 to 1.08), 0.90 for clinical spine fracture (0.74 to 1.10) and 0.96 for total fractures (0.91 to 1.02) — none significant. Renal calculi increased, hazard ratio 1.17 (95% CI 1.02 to 1.34). Censoring at non-adherence lowered the hip fracture hazard ratio to 0.71 (0.52 to 0.97), which is an on-treatment analysis rather than a randomised comparison. Effects did not vary by prerandomisation serum vitamin D.',
        evidenceSource:
          'Jackson RD et al., N Engl J Med 2006;354:669-683 (WHI CaD, NCT00000611)',
        doi: '10.1056/NEJMoa055218',
        measuredMetric:
          'Hip fracture hazard ratio 0.88 (95% CI 0.72 to 1.08); renal calculi hazard ratio 1.17 (1.02 to 1.34)',
        auditFlag: 'caution',
      },
      {
        id: 'cc-a2',
        category: 'conclusion_shift',
        title: 'The cardiovascular signal that changed how supplements are viewed',
        laymanSummary:
          'Pooling the randomised trials, people taking calcium supplements had more heart attacks than people taking placebo. The largest trial had missed it because nearly half its participants were already taking calcium of their own before they were randomised.',
        technicalDetails:
          'Bolland and colleagues pooled 15 randomised placebo-controlled trials of calcium supplements of at least 500 mg per day without co-administered vitamin D. In the five with patient-level data (8151 participants, median follow-up 3.6 years), 143 allocated to calcium had a myocardial infarction against 111 on placebo, hazard ratio 1.31 (95% CI 1.02 to 1.67, P=0.035); stroke 1.20 (0.96 to 1.50) and death 1.09 (0.96 to 1.23) were not significant. Trial-level data in 11,921 participants gave a pooled relative risk of 1.27 (1.01 to 1.59, P=0.038). The following year the same group reanalysed the WHI limited-access dataset and found an interaction with personal calcium supplement use at randomisation: in the 16,718 women (46%) not already taking supplements, hazard ratios for cardiovascular events ran 1.13 to 1.22, while in women already taking them risk did not change with allocation. Meta-analysis across eight trials plus the WHI non-users, 28,072 participants and 1384 events, gave a relative risk of 1.24 (1.07 to 1.45, P=0.004) for myocardial infarction and 1.15 (1.03 to 1.27, P=0.009) for myocardial infarction or stroke. The authors of both papers called for a reassessment of the role of calcium supplements in osteoporosis management. The finding has been disputed, and the disclosure statement records the senior author’s research support from a dairy company.',
        evidenceSource:
          'Bolland MJ et al., BMJ 2010;341:c3691; Bolland MJ et al., BMJ 2011;342:d2040',
        doi: '10.1136/bmj.d2040',
        inferredClaim:
          'That a supplement of an essential nutrient must be at worst harmless — the pooled randomised evidence puts myocardial infarction at a relative risk of 1.24 (95% CI 1.07 to 1.45)',
        auditFlag: 'contested',
      },
      {
        id: 'cc-a3',
        category: 'failed',
        title:
          'The USPSTF recommends against it for fracture prevention in healthy postmenopausal women',
        laymanSummary:
          'The United States preventive task force looked at the evidence and issued its second-strongest negative grade: do not take 1000 mg of calcium with 400 IU of vitamin D to prevent fractures if you are a healthy postmenopausal woman living at home.',
        technicalDetails:
          'The 2018 USPSTF statement found adequate evidence that daily supplementation with 400 IU or less of vitamin D and 1000 mg or less of calcium has no benefit for the primary prevention of fractures in community-dwelling postmenopausal women, and issued a D recommendation against it. It found inadequate evidence to estimate benefits at higher doses, or in men and premenopausal women at any dose, issuing I statements for both. It found adequate evidence that supplementation with vitamin D and calcium increases the incidence of kidney stones. The recommendations explicitly exclude people with osteoporosis, vitamin D deficiency, a previous fracture, or long-term steroid use — which is most of the population the drugs elsewhere in this file are for.',
        evidenceSource:
          'US Preventive Services Task Force. JAMA 2018;319:1592-1599',
        doi: '10.1001/jama.2018.3185',
        measuredMetric:
          'D recommendation against ≤400 IU vitamin D with ≤1000 mg calcium for primary fracture prevention in community-dwelling postmenopausal women',
        auditFlag: 'verified',
      },
      {
        id: 'cc-a4',
        category: 'measured',
        title: 'It is the invisible floor under every other page in this file',
        laymanSummary:
          'Almost every osteoporosis drug trial gave calcium and vitamin D to both groups, including the placebo group. So the benefits reported on those pages are benefits on top of calcium, not instead of it.',
        technicalDetails:
          'In the Fracture Intervention Trial, all participants reporting calcium intake of 1000 mg per day or less received a supplement containing 500 mg of calcium and 250 IU of cholecalciferol. In VERT-NA all subjects received 1000 mg of calcium daily with up to 500 IU of vitamin D where baseline levels were low. In MORE all women received supplemental calcium and cholecalciferol. In HORIZON-RFT all patients received supplemental vitamin D and calcium. This is the reason the drug effects elsewhere in this file are increments rather than totals, and it is also why calcium cannot be presented as an alternative to those drugs: it was present in both arms of the trials that established them.',
        evidenceSource:
          'Cummings SR et al., JAMA 1998;280:2077-2082; Harris ST et al., JAMA 1999;282:1344-1352; Ettinger B et al., JAMA 1999;282:637-645; Lyles KW et al., N Engl J Med 2007;357:1799-1809',
        doi: '10.1001/jama.280.24.2077',
        measuredMetric:
          'Calcium and vitamin D supplied to both arms in the pivotal trials of alendronate, risedronate, raloxifene and zoledronic acid',
        auditFlag: 'verified',
      },
      {
        id: 'cc-a5',
        category: 'measured',
        title: 'Taken with an alkali at high dose it can cause a named syndrome',
        laymanSummary:
          'Large amounts of calcium taken with something alkaline — which chalk itself is — can produce a triad of high blood calcium, alkaline blood and failing kidneys. It used to come from milk and bicarbonate for ulcers; now it comes from supplements.',
        technicalDetails:
          'Ingestion of calcium with alkali produces hypercalcaemia, metabolic alkalosis and renal insufficiency. Originally described as milk-alkali syndrome in patients treating peptic ulcer with milk and bicarbonate, the condition largely disappeared with the arrival of acid-suppressing drugs and returned as calcium-alkali syndrome, driven by calcium carbonate taken for bone or for heartburn. The reviewers describe it as an important cause of morbidity that may be rising, and as an unintended consequence of shifts in calcium and vitamin D intake in segments of the population. Calcium carbonate supplies both halves of the syndrome at once, which is why it is the salt most often implicated.',
        evidenceSource: 'Patel AM, Adeseun GA, Goldfarb S. Nutrients 2013;5:4880-4893',
        doi: '10.3390/nu5124880',
        measuredMetric:
          'The defining triad: hypercalcaemia, metabolic alkalosis and renal insufficiency after combined calcium and alkali ingestion',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'In the stomach it is simply an acid-base reaction',
        laymanDesc:
          'Chalk meets stomach acid and neutralises it within minutes. The carbon dioxide produced is why it can make you belch.',
        molecularDetail:
          'CaCO3 plus two HCl gives CaCl2, H2O and CO2. Onset is a matter of minutes because no absorption is required, and duration is short because the stomach continues to secrete acid. The functional specification for an antacid tablet is acid-neutralising capacity, measured by titration, not a plasma concentration.',
        iconName: 'Flame',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The same reaction is what makes the calcium absorbable',
        laymanDesc:
          'The calcium in chalk is locked up until acid dissolves it. That is why this particular calcium salt works poorly in people taking acid-blocking drugs.',
        molecularDetail:
          'Dissolution of calcium carbonate requires an acidic environment to liberate ionised calcium. Under proton pump inhibition or after gastric surgery, absorption falls markedly, which is the one clinically actionable difference between this salt and calcium citrate, whose dissolution is acid-independent.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A fraction crosses the intestinal wall',
        laymanDesc:
          'Only some of the calcium is absorbed, and the proportion falls as the dose rises. Splitting a large dose gets more in than taking it all at once.',
        molecularDetail:
          'Absorption is transcellular and saturable at low luminal concentrations, mediated by TRPV6 and calbindin under vitamin D control, and paracellular and non-saturable at high concentrations. Fractional absorption therefore falls as dose rises, which is a mass-action property rather than a formulation one.',
        iconName: 'ArrowUpCircle',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Blood calcium rises sharply for a few hours',
        laymanDesc:
          'A supplement produces a spike in blood calcium that food does not. This difference is the leading explanation for why supplements carry a heart signal that dietary calcium does not.',
        molecularDetail:
          'A bolus supplement produces a measurable acute rise in serum calcium over several hours, unlike calcium distributed across a meal. The hypothesis linking that excursion to vascular events is unproven, but it is the mechanistic account offered for a difference that is consistent across the observational and randomised literatures.',
        iconName: 'TrendingUp',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Some is deposited in bone; some appears in urine',
        laymanDesc:
          'Absorbed calcium either goes into bone or is filtered out by the kidney. More in the urine means more raw material for a stone.',
        molecularDetail:
          'Calcium not incorporated into hydroxyapatite is excreted renally. In WHI CaD the direct consequence was measured: renal calculi hazard ratio 1.17 (95% CI 1.02 to 1.34), the one clearly significant effect the trial found in either direction.',
        iconName: 'Filter',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Density rises by about one percent; fractures did not significantly fall',
        laymanDesc:
          'Seven years of it raised hip bone density by roughly one percent in the largest trial ever run. Hip fractures did not fall significantly, and kidney stones did rise.',
        molecularDetail:
          'WHI CaD: hip bone density +1.06% (P<0.01); hip fracture hazard ratio 0.88 (95% CI 0.72 to 1.08); total fracture 0.96 (0.91 to 1.02); renal calculi 1.17 (1.02 to 1.34). This is the cleanest illustration in the file of a bone-density gain that did not deliver a fracture reduction.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'WHI Calcium/Vitamin D Supplementation Study (NCT00000611)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, average 7.0 years',
        sampleSize: 36282,
        primaryEndpoint: 'Hip fracture',
        endpointMet: false,
        statisticalPValue:
          'Hazard ratio 0.88 (95% CI 0.72 to 1.08); hip bone density +1.06% (P<0.01); renal calculi hazard ratio 1.17 (1.02 to 1.34)',
        unreportedAdverseSignals:
          'Roughly 46% of participants were already taking personal calcium supplements at randomisation, which a later reanalysis showed obscured a cardiovascular interaction. The on-treatment hazard ratio of 0.71 is widely quoted without noting that it is not a randomised comparison.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Bolland 2010 patient-level and trial-level meta-analysis of calcium supplements',
        phase: 'Meta-analysis of 15 randomised placebo-controlled trials',
        sampleSize: 20072,
        primaryEndpoint: 'Myocardial infarction and composite cardiovascular events',
        endpointMet: false,
        statisticalPValue:
          'Patient-level hazard ratio for myocardial infarction 1.31 (95% CI 1.02 to 1.67, P=0.035); trial-level pooled relative risk 1.27 (1.01 to 1.59, P=0.038)',
        unreportedAdverseSignals:
          'Cardiovascular outcomes came from self-reports, hospital admissions and death certificates rather than from adjudicated endpoints prespecified in the constituent trials, since none of those trials was designed to measure them.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Hip bone density 1.06% higher than placebo after 7.0 years in 36,282 women (P<0.01)',
        'Hip fracture hazard ratio 0.88 (95% CI 0.72 to 1.08) — not significant',
        'Renal calculi hazard ratio 1.17 (95% CI 1.02 to 1.34) — significant',
        'Myocardial infarction relative risk 1.24 (95% CI 1.07 to 1.45) in pooled randomised trials of calcium supplements',
        'Immediate acid neutralisation in the stomach, the basis of the over-the-counter antacid label',
      ],
      unsupportedInferences: [
        'That a 1.06% gain in hip bone density is a fracture benefit — in the same trial it was not',
        'That calcium supplements substitute for the drugs elsewhere in this file, when those trials gave calcium to their placebo arms too',
        'That an essential nutrient is harmless as a supplement, when the randomised pooled estimate for myocardial infarction is above 1',
        'That the on-treatment hip fracture hazard ratio of 0.71 in WHI is the trial’s result — it is an adherence-censored analysis, not the randomised comparison',
      ],
      whatFailedInitially: [
        'The largest trial ever run of calcium and vitamin D missed hip fracture, clinical spine fracture and total fracture',
        'Kidney stones rose significantly, and the USPSTF later graded that harm as adequately evidenced',
        'The cardiovascular signal was invisible in WHI itself because 46% of participants were already taking their own calcium at randomisation',
        'Milk-alkali syndrome, thought to have been abolished by acid-suppressing drugs, returned as calcium-alkali syndrome driven by supplements',
      ],
      realWorldOutcome: [
        'Among the most consumed products in the world, as an antacid at about three cents a tablet and as the default bone supplement',
        'The USPSTF recommends against 1000 mg of calcium with 400 IU of vitamin D for fracture prevention in healthy community-dwelling postmenopausal women',
        'It remains standard co-therapy alongside every drug in this file, because that is how those drugs were tested and how their labels are written',
        'The distinction between calcium eaten as food and calcium taken as a bolus supplement is now the central question in this literature and is still unresolved',
      ],
    },
    deliverySystem: {
      type: 'Oral chewable tablet, swallowable tablet, and liquid suspension',
      description:
        'Chewed or swallowed. As an antacid it works within minutes because no absorption is needed. As a calcium source it depends on gastric acid to dissolve, so it is taken with food and is a poor choice for anyone on long-term acid suppression.',
      safetyProfile:
        'Sold over the counter without a boxed warning. The label limits antacid use to the stated maximum in 24 hours and to two weeks without medical supervision, and warns of interactions with prescription drugs. Constipation and bloating are the common effects. The measured harms in the randomised literature are kidney stones, hazard ratio 1.17 (95% CI 1.02 to 1.34) in WHI, and a contested increase in myocardial infarction, relative risk 1.24 (1.07 to 1.45) in pooled trials. High-dose use with alkali can produce calcium-alkali syndrome: hypercalcaemia, metabolic alkalosis and renal insufficiency. It binds thyroid hormone, tetracyclines, quinolones, iron and bisphosphonates in the gut.',
    },
    commonQuestions: [
      {
        q: 'Does taking calcium prevent fractures?',
        a: 'In healthy postmenopausal women, the largest trial says no. The Women’s Health Initiative randomised 36,282 women to 1000 mg of calcium carbonate with 400 IU of vitamin D or placebo for an average of seven years. Hip bone density rose by 1.06%, and hip fracture, spine fracture and total fracture all had confidence intervals crossing 1. Kidney stones rose significantly. The United States preventive task force reviewed this and issued a recommendation against that combination for fracture prevention in that group. What the trials do not address is people who are actually deficient, or who have osteoporosis, or who are taking one of the drugs elsewhere in this file — all of whom were excluded from the task force’s remit.',
        auditNote:
          'The 1.06% density gain and the null fracture result are from the same trial, the same women and the same seven years. That is the cleanest available demonstration that density is a surrogate.',
      },
      {
        q: 'Is it true that calcium supplements cause heart attacks?',
        a: 'The randomised evidence points that way and the question is not settled. Pooling fifteen placebo-controlled trials, myocardial infarction occurred in 143 people on calcium against 111 on placebo, a hazard ratio of 1.31. A later analysis adding the Women’s Health Initiative participants who were not already taking their own supplements gave a relative risk of 1.24 for myocardial infarction across 28,072 people. The signal is modest, the outcomes were not adjudicated endpoints in the original trials, and the finding has been disputed in print. What is agreed is that no comparable signal has been found for calcium eaten as food.',
      },
      {
        q: 'Why does it matter whether I take an acid-blocking drug?',
        a: 'Because this particular calcium salt has to be dissolved by stomach acid before any of it can be absorbed. On a proton pump inhibitor there is much less acid, so much less of the calcium becomes available. Calcium citrate does not have this problem: it dissolves regardless of pH, which is why it is the salt used after gastric surgery or during long-term acid suppression. It contains less elemental calcium per gram, so it takes more of it.',
      },
      {
        q: 'Should I take it with my osteoporosis drug?',
        a: 'That is a prescriber’s decision, and what can be reported is how the trials were run. Every major trial on the neighbouring pages gave calcium and vitamin D to both arms, including the placebo arm — the alendronate trial supplied 500 mg with 250 IU to anyone whose intake was below 1000 mg a day, the risedronate trial gave 1000 mg to everyone, the raloxifene and zoledronic acid trials did the same. So the fracture reductions attributed to those drugs are reductions measured on top of calcium replacement. What is separately true is that calcium binds an oral bisphosphonate in the gut and destroys its absorption, so the two are not taken at the same time.',
      },
      {
        q: 'Can I take it for heartburn every day?',
        a: 'The label says not for more than two weeks except under medical supervision, and not more than the stated maximum in 24 hours. Two reasons sit behind that. Heartburn that persists for weeks needs a diagnosis rather than a stronger antacid. And sustained high-dose calcium taken with an alkali — which chalk itself is — produces calcium-alkali syndrome: high blood calcium, alkaline blood and failing kidneys. That syndrome had almost disappeared when acid-suppressing drugs replaced milk-and-bicarbonate ulcer treatment, and it came back through supplements.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Jackson RD et al. Calcium plus vitamin D supplementation and the risk of fractures. N Engl J Med 2006;354:669-683 (WHI CaD)',
        identifier: '10.1056/NEJMoa055218',
        kind: 'doi',
      },
      {
        label:
          'Bolland MJ et al. Effect of calcium supplements on risk of myocardial infarction and cardiovascular events: meta-analysis. BMJ 2010;341:c3691',
        identifier: '10.1136/bmj.c3691',
        kind: 'doi',
      },
      {
        label:
          'Bolland MJ et al. Calcium supplements with or without vitamin D and risk of cardiovascular events: reanalysis of the Women’s Health Initiative limited access dataset and meta-analysis. BMJ 2011;342:d2040',
        identifier: '10.1136/bmj.d2040',
        kind: 'doi',
      },
      {
        label:
          'US Preventive Services Task Force. Vitamin D, calcium, or combined supplementation for the primary prevention of fractures in community-dwelling adults: recommendation statement. JAMA 2018;319:1592-1599',
        identifier: '10.1001/jama.2018.3185',
        kind: 'doi',
      },
      {
        label: 'Patel AM, Adeseun GA, Goldfarb S. Calcium-alkali syndrome in the modern era. Nutrients 2013;5:4880-4893',
        identifier: '10.3390/nu5124880',
        kind: 'doi',
      },
      {
        label: 'WHI Calcium/Vitamin D Supplementation Study, ClinicalTrials.gov registration',
        identifier: 'NCT00000611',
        kind: 'nct',
      },
      NADAC_SOURCE,
      COST_OF_PRODUCTION_SOURCE,
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 10. Ergocalciferol (vitamin D2) — the fungal vitamin D, less than a third the potency of the
  //     human one, and the form used in the two large fracture trials that both came back null.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vitamin-d2',
    name: 'Ergocalciferol',
    tradeName: 'Drisdol / Deltalin / Vitamin D2',
    sponsor:
      'No single originator — first characterised in the 1930s and approved in the United States in 1941; made by many manufacturers, and the application holder on this record is Esjay Pharma',
    targetGene: 'VDR — the vitamin D receptor gene, reached only after two activation steps',
    targetProtein:
      'Vitamin D receptor, acted on by the doubly hydroxylated metabolite rather than by the administered molecule',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'FDA Approved',
    approvalYear: 1941,
    indication:
      'Treatment of hypoparathyroidism, refractory rickets — also known as vitamin D resistant rickets — and familial hypophosphataemia. It is also sold in lower strengths as a dietary supplement, which is a nutritional use and not an approved drug indication',
    patientFriendlyIndication:
      'Rare inherited or surgical disorders of calcium and phosphate, and, at lower strengths, correcting vitamin D deficiency',
    anatomicalSite:
      'Fat stores and circulation as the inactive precursor; the liver and kidney where it is activated; the nucleus of intestinal cells where the activated form acts',
    conditionContext: {
      conditionExplainer:
        'There are two forms of vitamin D. D3, cholecalciferol, is what human skin makes from sunlight and what animal foods contain. D2, ergocalciferol, is what fungi and yeast make when ultraviolet light hits ergosterol. They differ by one double bond and one methyl group in the side chain, and for decades that was assumed not to matter.',
      whyItMatters:
        'It matters. Head-to-head measurement puts D2 at less than a third the potency of D3 for raising the storage form in blood, and the two large randomised fracture trials that used ergocalciferol specifically both returned null — one of them with hip fractures significantly more common on treatment.',
      whoTakesThis:
        'People with hypoparathyroidism, resistant rickets or familial hypophosphataemia at prescription strength; and, in much lower doses, anyone whose vitamin D is being replaced with a plant-derived or vegan-suitable product.',
      clinicalGoals:
        'Raise the storage form 25-hydroxyvitamin D and correct the calcium or phosphate abnormality. Whether raising that number prevents fractures is the question the ergocalciferol trials answered badly.',
    },
    oneSentenceVerdict:
      'The fungal form of vitamin D, whose relative potency against the human form was measured at 9.5 to 1 in favour of D3 by area under the 25-hydroxyvitamin D curve, and which in the two largest randomised trials to use it specifically — 9440 people given 300,000 IU intramuscularly each autumn and 3440 care-home residents given 100,000 IU orally every four months — reduced no fractures at all, with hip fracture significantly more common in the injected group at a hazard ratio of 1.49 (95% CI 1.02 to 2.18).',
    laymanHowItWorks:
      'This molecule does nothing by itself. The liver adds one chemical group to it and the kidney adds a second, and only then does it act, by switching on the genes that pull calcium out of food. The fungal version goes through the same two steps as the human version, but the carrier protein in blood holds onto its half-finished form less tightly, so it disappears faster and less of it is left to be activated.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'Not stated: no verified CMS National Average Drug Acquisition Cost entry for ergocalciferol was held on this record at the time of writing',
      markupEstimate: '',
      openPatentNotes:
        'Characterised in the 1930s and approved in the United States in 1941. There is no patent and no originator to speak of; it is made by irradiating ergosterol from yeast, which is why it is the vitamin D used in vegan and plant-based fortified products. No acquisition price is stated here because none was held on this record, and an estimate would be an invented number.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — checked for this molecule and found to carry no verified entry on this record at the time of writing, which is why no price is stated',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'The direct alternative is cholecalciferol, the D3 form, which is more potent per unit and longer acting and is what almost all the positive vitamin D research used. Ergocalciferol’s remaining advantages are that it is plant-derived, and that it is the form available at the very high 50,000 IU prescription strength in the United States. In kidney failure neither form substitutes for calcitriol, because the activation step the kidney performs is the one that is missing.',
      conventionalRx: [
        {
          name: 'Cholecalciferol (vitamin D3)',
          class: 'The animal and skin-synthesised form of vitamin D',
          howItCompares:
            'More effective at raising serum 25-hydroxyvitamin D. In a direct comparison of single 50,000 IU doses in 20 men, area under the 25-hydroxyvitamin D curve to day 28 was 204.7 for D3 against 60.2 for D2, and the calculated relative potency was 9.5 to 1. A meta-analysis of randomised head-to-head trials found the same direction, significant for bolus dosing and lost with daily dosing.',
          typicalCost:
            'Not stated: no verified CMS acquisition price for a comparable cholecalciferol product was held on this record at the time of writing',
          prosAndCons:
            'Pros: higher and longer-lasting rise in the storage form; the form used in most of the vitamin D literature. Cons: derived from lanolin, so not suitable for people avoiding animal products; giving it as an infrequent very large dose has caused harm.',
        },
        {
          name: 'Calcitriol',
          class: 'The fully activated hormone',
          howItCompares:
            'Bypasses both activation steps and is the only option when the kidney cannot perform the second one. It is not a substitute for ordinary deficiency, because it also bypasses the regulation that makes native vitamin D self-limiting.',
          typicalCost:
            'US$0.1607 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 23 listed generic products, survey effective 17 June 2026)',
          prosAndCons:
            'Pros: works where the kidney cannot. Cons: hypercalcaemia is its characteristic hazard, and across 76 randomised trials its class showed no patient-level benefit.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ultraviolet-exposed mushrooms',
          activeCompound: 'Ergocalciferol formed from ergosterol',
          biologicalMechanism:
            'Fungal ergosterol converts to ergocalciferol under ultraviolet light by exactly the same photochemistry used to manufacture the drug. Mushrooms grown in the dark contain almost none; the same mushrooms exposed to ultraviolet contain a great deal.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated: this page carries no intake guidance. The mechanistic point is that this is the only meaningful dietary source of D2 and it is the same molecule as the drug.',
          monthlyCost: 'Ordinary grocery cost; not separately priced',
        },
        {
          name: 'Sunlight on skin',
          activeCompound: 'Cholecalciferol from 7-dehydrocholesterol',
          biologicalMechanism:
            'Ultraviolet B converts a cholesterol precursor in skin to the D3 form — the other of the two vitamins D, and the more potent one. Skin does not make D2 at all.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated: this page carries no exposure guidance. Cutaneous synthesis is self-limiting because excess previtamin D photoisomerises to inert products, which is why sun exposure does not cause vitamin D toxicity and supplements can.',
          monthlyCost: 'None',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask which vitamin D you have been given',
          action:
            'Look for "ergocalciferol" or "D2" against "cholecalciferol" or "D3" on the label.',
          patientImpact:
            'A 50,000 IU capsule of D2 and a 50,000 IU capsule of D3 do not produce the same rise in the blood level being monitored, and the difference is large enough to change what a follow-up test shows.',
          clinicalPrecaution:
            'Which form is appropriate is a prescriber’s decision. Knowing which one is in the bottle is what makes the blood result interpretable.',
        },
        {
          name: 'Be wary of very large, infrequent doses',
          action: 'Ask why an annual or four-monthly mega-dose is being used rather than a smaller regular one.',
          patientImpact:
            'The two large ergocalciferol trials that used four-monthly and annual mega-doses found no fracture benefit, and an annual 500,000 IU trial of the D3 form found significantly more falls and fractures.',
          clinicalPrecaution:
            'Infrequent very high dosing was adopted to solve an adherence problem, not because it was shown to work better. This page carries no dosing guidance; the point is that the schedule is itself a hypothesis that has been tested and failed.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[C@H](/C=C/[C@H](C)C(C)C)[C@H]1CC[C@@H]\\2[C@@]1(CCC/C2=C\\C=C/3\\C[C@H](CCC3=C)O)C',
      chemicalFormula: 'C28H44O',
      molecularWeight: '396.60 g/mol',
      targetReceptorAffinity:
        'None as administered — the molecule is a precursor and binds no receptor until it has been 25-hydroxylated in the liver and 1-alpha-hydroxylated in the kidney. It differs from cholecalciferol by a C22-C23 double bond and a C24 methyl group in the side chain, and that difference is enough to lower the affinity of its 25-hydroxy metabolite for vitamin D binding protein, shortening its circulating life. Measured directly against cholecalciferol after single 50,000 IU doses, absorption was equivalent but area under the 25-hydroxyvitamin D curve to day 28 was 60.2 ng·d/mL for D2 against 204.7 for D3, with a calculated relative potency of 9.5 to 1.',
      structureSource: {
        label:
          'PubChem CID 5280793 (ergocalciferol) — canonical SMILES, molecular formula and weight, as held on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280793',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'erg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Ergosterol source identity and purity',
          description:
            'Confirm the starting sterol before irradiation. Ergosterol from yeast carries other sterols that photoisomerise to their own calciferols, so an impure feedstock does not give an impure product — it gives a mixture of different vitamins D that a total-calciferol assay will not distinguish.',
          reagentsAndBuffer:
            'Ergosterol reference standard, reversed-phase HPLC with UV detection at 282 nm, gas chromatography-mass spectrometry for related sterols, amber glassware throughout',
        },
        {
          id: 'erg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Ultraviolet ring opening of ergosterol to previtamin D2',
          description:
            'Irradiate ergosterol to break the steroid B ring open, then allow thermal isomerisation to ergocalciferol. Over-irradiation is the characteristic failure: previtamin D photoisomerises onward to tachysterol and lumisterol, which are inert and are the same protective mechanism that stops sun exposure causing vitamin D toxicity in skin.',
          dependsOnStepId: 'erg-w1',
          reagentsAndBuffer:
            'Ergosterol in degassed solvent, medium-pressure mercury lamp with wavelength filtering near 295 nm, inert atmosphere, controlled irradiation time with in-process HPLC monitoring, thermal isomerisation step',
        },
        {
          id: 'erg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation from tachysterol and lumisterol, then oil formulation',
          description:
            'Remove the photoisomers and crystallise or formulate into oil. The product is light- and oxygen-sensitive and the therapeutic dose is a fraction of a milligram, so packaging and antioxidant choice do as much work as the chemistry.',
          dependsOnStepId: 'erg-w2',
          reagentsAndBuffer:
            'Preparative chromatography or crystallisation from methyl formate, butylated hydroxyanisole or tocopherol antioxidant in a vegetable oil vehicle, amber capsules under nitrogen, HPLC purity against tachysterol and lumisterol standards',
        },
        {
          id: 'erg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Hepatic 25-hydroxylation and binding-protein affinity measurement',
          description:
            'Measure conversion to 25-hydroxyvitamin D2 in hepatocytes and, separately, the affinity of that metabolite for vitamin D binding protein against the D3 metabolite. The second measurement is the one that explains the clinical difference: equivalent absorption with a shorter circulating life is a binding-protein result, not an absorption result.',
          dependsOnStepId: 'erg-w3',
          reagentsAndBuffer:
            'Primary human hepatocytes or CYP2R1-expressing microsomes, LC-MS/MS quantification of 25-hydroxyvitamin D2 and D3 separately, purified human vitamin D binding protein for competitive affinity determination',
        },
        {
          id: 'erg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Area under the 25-hydroxyvitamin D curve after a matched single dose',
          description:
            'Give matched single doses of D2 and D3 and follow the storage form in blood for at least 28 days. A single early timepoint makes the two look identical — both raise 25-hydroxyvitamin D similarly for the first three days — and only the full curve shows the difference.',
          dependsOnStepId: 'erg-w4',
          reagentsAndBuffer:
            'Serial serum sampling to day 28, LC-MS/MS assay reporting 25-hydroxyvitamin D2 and D3 as separate analytes rather than as a total, matched-lot 50,000 IU dosage forms, crossover or parallel design with baseline correction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'erg-a1',
        category: 'failed',
        title: 'Injected annually to 9440 people, it prevented nothing and hip fractures rose',
        laymanSummary:
          'Nearly ten thousand people aged 75 and over were given an injection of it every autumn for three years, or a dummy injection. Fractures overall were no different. Hip fractures were significantly more common in the treated group.',
        technicalDetails:
          'Smith and colleagues randomised 9440 people aged 75 and over — 4354 men and 5086 women — from general practice registers in Wessex, England, to 300,000 IU intramuscular ergocalciferol or matching placebo every autumn over three years. 585 subjects had incident non-spine fractures. Hazard ratios in the vitamin D group were 1.09 for any first fracture (95% CI 0.93 to 1.28, P=0.29), 1.49 for hip (95% CI 1.02 to 2.18, P=0.04) and 1.22 for wrist (0.85 to 1.76, P=0.28). There was no effect on falls, hazard ratio 0.98 (0.93 to 1.04). No protective effect appeared in any subgroup when stratified by sex, age, previous fracture or mobility. The authors concluded the strategy is not effective.',
        evidenceSource: 'Smith H et al., Rheumatology (Oxford) 2007;46:1852-1857',
        doi: '10.1093/rheumatology/kem240',
        measuredMetric:
          'Hip fracture hazard ratio 1.49 (95% CI 1.02 to 2.18, P=0.04); any first fracture 1.09 (0.93 to 1.28)',
        auditFlag: 'caution',
      },
      {
        id: 'erg-a2',
        category: 'failed',
        title: 'Given orally to 3440 care-home residents, it changed nothing either',
        laymanSummary:
          'Three and a half thousand people in residential and care homes were given it by mouth every four months for three years. First fractures were 205 on treatment against 218 on placebo. That is no difference.',
        technicalDetails:
          'Lyons and colleagues ran a pragmatic double-blind randomised trial in 3440 people — 2624 women and 816 men — living in residential or care homes across 314 sites in South Wales, using four-monthly oral 100,000 IU ergocalciferol over three years. In intention-to-treat analysis, 205 first fractures occurred in the intervention group over 2846 person-years, about 7 per 100 people per year, against 218 first fractures in the control group over 2860 person-years. The hazard ratio was 0.95 (95% CI 0.79 to 1.15), not significant. The authors concluded that four-monthly 100,000 IU oral vitamin D2 is not sufficient to affect fracture incidence in institutional care — a population with a fracture rate high enough that a real effect would have been visible.',
        evidenceSource: 'Lyons RA et al., Osteoporos Int 2007;18:811-818',
        doi: '10.1007/s00198-006-0309-5',
        measuredMetric:
          'First fracture hazard ratio 0.95 (95% CI 0.79 to 1.15); 205 against 218 fractures over roughly 2850 person-years each',
        auditFlag: 'caution',
      },
      {
        id: 'erg-a3',
        category: 'measured',
        title: 'It is less than a third as potent as the human form, measured directly',
        laymanSummary:
          'Twenty men were given a single large dose of each form. Both were absorbed equally well, and both raised the blood level the same for three days. After that the fungal form fell away while the human form kept rising for two weeks.',
        technicalDetails:
          'Armas, Hollis and Heaney gave single 50,000 IU doses of ergocalciferol or cholecalciferol to 20 healthy men and followed serum vitamin D and 25-hydroxyvitamin D for 28 days. Both produced similar rises in the administered vitamin, indicating equivalent absorption, and similar initial rises in 25-hydroxyvitamin D over the first three days. Thereafter 25-hydroxyvitamin D continued rising on D3, peaking at day 14, while it fell rapidly on D2 and was no different from baseline by day 14. Area under the curve to day 28 was 60.2 ng·d/mL for D2 against 204.7 for D3 (P<0.002); calculated area to infinity gave a relative potency of 9.5 to 1. The authors state D2 potency is less than one third that of D3 and that physicians using it should be aware of its markedly lower potency and shorter duration of action.',
        evidenceSource: 'Armas LA, Hollis BW, Heaney RP. J Clin Endocrinol Metab 2004;89:5387-5391',
        doi: '10.1210/jc.2004-0360',
        measuredMetric:
          'Area under the 25-hydroxyvitamin D curve to day 28: 60.2 ng·d/mL for D2 against 204.7 for D3 (P<0.002); relative potency D3:D2 of 9.5 to 1',
        auditFlag: 'verified',
      },
      {
        id: 'erg-a4',
        category: 'conclusion_shift',
        title:
          'The two forms were treated as interchangeable for decades, and the meta-analysis said otherwise',
        laymanSummary:
          'Food labels, supplement charts and prescribing habit treated the two vitamins D as the same thing in international units. When the head-to-head trials were pooled, the human form raised the blood level significantly more — and the difference showed up only with large infrequent doses.',
        technicalDetails:
          'Tripkovic and colleagues systematically searched from 1966 to July 2011 for randomised trials directly comparing the two forms in adults, including unpublished trial registries. Meta-analysis found supplementation with vitamin D3 had a significant and positive effect on raising serum 25-hydroxyvitamin D compared with D2 (P=0.001). Stratified by dosing frequency, the advantage was significant for bolus dosing (P=0.0002) and was lost with daily supplementation. That interaction is the useful detail and the one usually dropped: the two forms are close to equivalent when given daily and diverge sharply when given as an infrequent large dose — which is exactly how the two large ergocalciferol fracture trials administered it.',
        evidenceSource: 'Tripkovic L et al., Am J Clin Nutr 2012;95:1357-1364',
        doi: '10.3945/ajcn.111.031070',
        inferredClaim:
          'That an international unit of D2 and an international unit of D3 are interchangeable — true enough for daily dosing, and false for the bolus dosing the fracture trials used',
        auditFlag: 'verified',
      },
      {
        id: 'erg-a5',
        category: 'failed',
        title: 'Infrequent mega-dosing is a failed strategy in both forms of the vitamin',
        laymanSummary:
          'Giving a huge dose once or a few times a year was adopted to get around people forgetting a daily tablet. Tested properly it did not prevent fractures with the fungal form, and with the human form it caused more falls and more fractures.',
        technicalDetails:
          'Sanders and colleagues randomised 2256 community-dwelling women aged 70 and over at high fracture risk to a single annual oral 500,000 IU dose of cholecalciferol or placebo for three to five years. Fractures were 171 against 135, incidence rate ratio 1.26 (95% CI 1.00 to 1.59, P=0.047). Falls occurred at 83.4 per 100 person-years on treatment against 72.7 on placebo, incidence rate ratio 1.15 (1.02 to 1.30, P=0.03), and a post hoc analysis found the excess concentrated in the first three months after dosing — rate ratio 1.31 in the first three months against 1.13 over the following nine, test for homogeneity P=0.02. Median baseline 25-hydroxyvitamin D was 49 nmol/L, so this was not a deficient population. Read alongside the two null ergocalciferol bolus trials, the pattern is a dosing schedule adopted for adherence that has never demonstrated benefit in either form and has demonstrated harm in one.',
        evidenceSource:
          'Sanders KM et al., JAMA 2010;303:1815-1822 (ACTRN12605000658617)',
        doi: '10.1001/jama.2010.594',
        measuredMetric:
          'Fracture incidence rate ratio 1.26 (95% CI 1.00 to 1.59, P=0.047) and falls 1.15 (1.02 to 1.30, P=0.03) with annual 500,000 IU cholecalciferol',
        auditFlag: 'caution',
      },
      {
        id: 'erg-a6',
        category: 'measured',
        title: 'Its approved indications are three rare disorders, not deficiency',
        laymanSummary:
          'What this drug is actually approved for is narrow: absent parathyroid glands, a rickets that does not respond to ordinary vitamin D, and an inherited phosphate-wasting condition. Correcting an ordinary low blood level is a nutritional use, not an approved one.',
        technicalDetails:
          'The label indicates ergocalciferol capsules for the treatment of hypoparathyroidism, refractory rickets — also known as vitamin D resistant rickets — and familial hypophosphataemia. Those three conditions are the reason the 50,000 IU strength exists: they require pharmacological rather than nutritional amounts. The very large gap between that indication set and the way the drug is used in practice is the reason the fracture trials on this page were run at all, and the reason their results matter beyond the labelled population.',
        evidenceSource:
          'Ergocalciferol capsules United States prescribing information, Indications and Usage, as held on the enriched record',
        measuredMetric:
          'Three labelled indications: hypoparathyroidism, refractory rickets and familial hypophosphataemia',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It is made by shining ultraviolet light on a fungal sterol',
        laymanDesc:
          'Yeast and mushrooms contain a cholesterol-like molecule. Ultraviolet light snaps one of its rings open, and the result is this vitamin. Human skin performs the same trick on a different starting molecule and makes the other form.',
        molecularDetail:
          'Ultraviolet B opens the B ring of ergosterol to previtamin D2, which thermally isomerises to ergocalciferol. Over-irradiation converts previtamin D onward to tachysterol and lumisterol, both inert — the same photochemical safety valve that prevents sun exposure from causing vitamin D toxicity in skin.',
        iconName: 'Sun',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Swallowed and absorbed as well as the other form',
        laymanDesc:
          'Absorption is not where the two forms differ. The same dose of each gets into the blood equally well.',
        molecularDetail:
          'Single 50,000 IU doses of D2 and D3 produced similar rises in serum concentration of the administered vitamin, indicating equivalent absorption, and similar initial rises in 25-hydroxyvitamin D over the first three days. Everything that separates them happens after this point.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'The liver adds the first hydroxyl',
        laymanDesc:
          'The liver converts it into the storage form — the one measured by a vitamin D blood test. Both forms go through this step.',
        molecularDetail:
          'Hepatic CYP2R1 and related enzymes 25-hydroxylate the molecule to 25-hydroxyvitamin D2. Most laboratory assays report a total 25-hydroxyvitamin D that combines the D2 and D3 species, which is why the difference between the forms is invisible on a routine result and requires an assay that separates the analytes.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The carrier protein holds it less tightly, and it disappears',
        laymanDesc:
          'This is where the two forms part company. The blood protein that carries the storage form around grips the fungal version less well, so it is cleared faster and less of it survives to be activated.',
        molecularDetail:
          'The C22-C23 double bond and C24 methyl of the D2 side chain lower the affinity of 25-hydroxyvitamin D2 for vitamin D binding protein. Consequently 25-hydroxyvitamin D fell rapidly after a D2 dose and was back to baseline by day 14, while after a D3 dose it kept rising to a day-14 peak. Area under the curve to day 28 was 60.2 against 204.7, with a calculated relative potency of 9.5 to 1.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The kidney adds the second hydroxyl, and only then is it a hormone',
        laymanDesc:
          'Whatever survives is finished off by the kidney into the active hormone, which switches on the genes that absorb calcium from food.',
        molecularDetail:
          'Renal CYP27B1 performs the 1-alpha-hydroxylation to 1,25-dihydroxyvitamin D2, which binds the vitamin D receptor and, with the retinoid X receptor, occupies vitamin D response elements. This step is tightly regulated by parathyroid hormone, FGF23 and calcium — which is why native vitamin D is largely self-limiting and calcitriol, which bypasses it, is not.',
        iconName: 'Dna',
        visualStage: 'target_binding',
      },
      {
        step: 6,
        title: 'The blood number moves; the fractures did not',
        laymanDesc:
          'It raises the number a vitamin D test reports, less than the other form does. In the two large trials that used it, fractures did not fall — and in the injected trial, hip fractures rose.',
        molecularDetail:
          'Smith 2007, 9440 people, annual 300,000 IU intramuscular: any first fracture hazard ratio 1.09 (95% CI 0.93 to 1.28), hip 1.49 (1.02 to 2.18, P=0.04). Lyons 2007, 3440 care-home residents, four-monthly 100,000 IU oral: first fracture hazard ratio 0.95 (0.79 to 1.15). Both trials used bolus dosing, which is the schedule at which D2 is furthest behind D3.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Smith 2007 — annual intramuscular ergocalciferol in the general population',
        phase: 'Randomised, double-blind, placebo-controlled, three years',
        sampleSize: 9440,
        primaryEndpoint: 'All non-vertebral fracture',
        endpointMet: false,
        statisticalPValue:
          'Any first fracture hazard ratio 1.09 (95% CI 0.93 to 1.28, P=0.29); hip 1.49 (1.02 to 2.18, P=0.04); falls 0.98 (0.93 to 1.04)',
        unreportedAdverseSignals:
          'The hip fracture result is a significant increase on treatment. No protective effect appeared in any subgroup by sex, age, previous fracture or mobility.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Lyons 2007 — four-monthly oral ergocalciferol in institutional care',
        phase: 'Pragmatic randomised, double-blind, placebo-controlled, three years',
        sampleSize: 3440,
        primaryEndpoint: 'Incidence of first fracture, intention to treat',
        endpointMet: false,
        statisticalPValue:
          '205 against 218 first fractures; hazard ratio 0.95 (95% CI 0.79 to 1.15) — not significant',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Armas 2004 — single-dose comparison of ergocalciferol and cholecalciferol',
        phase: 'Pharmacokinetic comparison in healthy male volunteers, 28 days',
        sampleSize: 20,
        primaryEndpoint:
          'Area under the curve of the rise in serum 25-hydroxyvitamin D above baseline',
        endpointMet: true,
        statisticalPValue:
          '60.2 ng·d/mL for D2 against 204.7 for D3 to day 28 (P<0.002); relative potency D3:D2 of 9.5 to 1',
        unreportedAdverseSignals:
          'Both forms looked identical for the first three days. A study that sampled only early would have concluded they were equivalent, which is what the field had assumed for decades.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Area under the 25-hydroxyvitamin D curve 60.2 ng·d/mL for D2 against 204.7 for D3 after matched 50,000 IU doses (P<0.002)',
        'Hip fracture hazard ratio 1.49 (95% CI 1.02 to 2.18) with annual 300,000 IU intramuscular ergocalciferol in 9440 people',
        'First fracture hazard ratio 0.95 (95% CI 0.79 to 1.15) with four-monthly 100,000 IU oral ergocalciferol in 3440 care-home residents',
        'A significant meta-analytic advantage for D3 over D2 in raising serum 25-hydroxyvitamin D (P=0.001), present for bolus dosing and absent for daily dosing',
      ],
      unsupportedInferences: [
        'That an international unit of D2 equals an international unit of D3 — true enough daily, and wrong by a wide margin for a bolus',
        'That raising the storage form in blood prevents fractures, which is what the two large ergocalciferol trials tested and did not find',
        'That a routine vitamin D blood result distinguishes the two forms — most assays report a combined total',
        'That mega-dosing solves the adherence problem harmlessly, when the equivalent D3 strategy increased falls and fractures',
      ],
      whatFailedInitially: [
        'The largest ergocalciferol fracture trial found hip fractures significantly more common on treatment, hazard ratio 1.49',
        'The second largest found no effect at all in a population fracturing at 7 per 100 people per year',
        'Decades of treating the two forms as interchangeable rested on early-timepoint equivalence that longer sampling contradicted',
        'The intermittent mega-dose schedule, adopted for adherence, has failed in both forms and caused harm in one',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1941 for three rare disorders and used far more widely as a nutritional replacement',
        'It remains the only plant-derived vitamin D, and therefore the form in vegan supplements and many fortified foods',
        'The 50,000 IU prescription strength keeps it in routine use for deficiency repletion despite the potency data',
        'The field has largely moved to daily or weekly cholecalciferol, which is the change the pharmacokinetic and meta-analytic evidence supports',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule and oral solution, including a 50,000 IU prescription strength; an intramuscular form has been used in trials',
      description:
        'Taken by mouth, usually with food since it is fat-soluble. The very high strengths exist for the labelled rare disorders and are widely used off that label for deficiency repletion, which is where the potency and dosing-schedule questions on this page bite.',
      safetyProfile:
        'No boxed warning. As a fat-soluble vitamin given at pharmacological strength the hazard is accumulation and hypercalcaemia, with the same clinical picture described on the calcitriol page — though it resolves far more slowly, because vitamin D stores in fat and its half-life is measured in weeks rather than days. Two large randomised trials of bolus ergocalciferol found no fracture benefit, one of them with a significant increase in hip fracture (hazard ratio 1.49, 95% CI 1.02 to 2.18). An annual 500,000 IU trial of the D3 form found significantly more falls and fractures, concentrated in the three months after dosing.',
    },
    commonQuestions: [
      {
        q: 'Is D2 as good as D3?',
        a: 'Not at the same number of international units, and the gap depends on how it is given. Twenty men received matched single 50,000 IU doses of each. Absorption was equivalent and the first three days looked identical. After that the storage form kept climbing on D3, peaking at two weeks, while on D2 it fell back to baseline by day 14. Area under the curve was 60.2 against 204.7, a calculated potency ratio of 9.5 to 1. A meta-analysis of head-to-head randomised trials found the same direction and added the important qualifier: the advantage was significant with bolus dosing and lost with daily dosing.',
        auditNote:
          'The early-timepoint equivalence is why the two were treated as interchangeable for so long. It is a good illustration of a measurement that is correct and misleading at the same time.',
      },
      {
        q: 'Does taking it prevent fractures?',
        a: 'The two large trials that used this specific form say no. In 9440 people aged 75 and over given a 300,000 IU injection each autumn for three years, first fractures were no different and hip fractures were significantly more common on treatment, hazard ratio 1.49 with a confidence interval from 1.02 to 2.18. In 3440 people in residential and care homes given 100,000 IU by mouth every four months, first fractures were 205 against 218, hazard ratio 0.95. Both used infrequent large doses, which is precisely the schedule at which this form is furthest behind D3, so the trials test the strategy as much as the molecule.',
      },
      {
        q: 'Will my blood test tell me which form I am on?',
        a: 'Usually not. Most laboratories report a total 25-hydroxyvitamin D that combines the D2 and D3 species into one number, so a result of, say, 70 nmol/L does not say which vitamin produced it. Assays that separate the two analytes exist and are used in research. The practical consequence is that the difference in potency between the forms is invisible on a routine result, and the only reliable way to know which one is in play is to read the bottle.',
      },
      {
        q: 'Why is it still used if D3 is better?',
        a: 'Three reasons. It is the only vitamin D that can be made without an animal source — it comes from irradiating yeast sterol — so it is what goes into vegan supplements and many fortified plant products. In the United States it is the form available at the 50,000 IU prescription strength, which is convenient for weekly repletion. And when given daily rather than as a bolus, the meta-analytic difference between the forms disappears, so for ordinary daily replacement the choice matters much less than the pharmacokinetic headline suggests.',
      },
      {
        q: 'Is this the same as the vitamin D my kidney doctor prescribes?',
        a: 'No, and the difference matters. This is a precursor that needs two chemical steps, one in the liver and one in the kidney, before it does anything. Calcitriol is the finished molecule after both steps. In kidney failure the second step is the one that has been lost, so giving more precursor achieves nothing, however high the dose. The two are not interchangeable in either direction: calcitriol also bypasses the regulation that makes native vitamin D largely self-limiting, which is why it causes hypercalcaemia far more readily.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Armas LA, Hollis BW, Heaney RP. Vitamin D2 is much less effective than vitamin D3 in humans. J Clin Endocrinol Metab 2004;89:5387-5391',
        identifier: '10.1210/jc.2004-0360',
        kind: 'doi',
      },
      {
        label:
          'Tripkovic L et al. Comparison of vitamin D2 and vitamin D3 supplementation in raising serum 25-hydroxyvitamin D status: a systematic review and meta-analysis. Am J Clin Nutr 2012;95:1357-1364',
        identifier: '10.3945/ajcn.111.031070',
        kind: 'doi',
      },
      {
        label:
          'Smith H et al. Effect of annual intramuscular vitamin D on fracture risk in elderly men and women: a population-based, randomized, double-blind, placebo-controlled trial. Rheumatology (Oxford) 2007;46:1852-1857',
        identifier: '10.1093/rheumatology/kem240',
        kind: 'doi',
      },
      {
        label:
          'Lyons RA et al. Preventing fractures among older people living in institutional care: a pragmatic randomised double blind placebo controlled trial of vitamin D supplementation. Osteoporos Int 2007;18:811-818',
        identifier: '10.1007/s00198-006-0309-5',
        kind: 'doi',
      },
      {
        label:
          'Sanders KM et al. Annual high-dose oral vitamin D and falls and fractures in older women: a randomized controlled trial. JAMA 2010;303:1815-1822',
        identifier: '10.1001/jama.2010.594',
        kind: 'doi',
      },
      {
        label:
          'Trivedi DP, Doll R, Khaw KT. Effect of four monthly oral vitamin D3 (cholecalciferol) supplementation on fractures and mortality in men and women living in the community. BMJ 2003;326:469 — the positive bolus trial, which used cholecalciferol and not ergocalciferol',
        identifier: '10.1136/bmj.326.7387.469',
        kind: 'doi',
      },
      COST_OF_PRODUCTION_SOURCE,
    ],
  },
]
