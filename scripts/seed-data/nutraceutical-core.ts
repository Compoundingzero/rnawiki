import type { SeedDossier } from '@/lib/seed-types'

/**
 * The core supplement aisle — the twenty or so products that account for most of what is actually
 * bought, searched for and argued about. Sibling file to `nutraceutical-botanical.ts`, and the
 * same four conventions apply, with one addition that matters more here than anywhere else on the
 * site.
 *
 * 1. NO PRICING BLOCK ANYWHERE. `SeedPricing` requires a synthesis cost per dose with a citable
 *    source. Published cost-of-production research covers antivirals, oncology drugs and insulin;
 *    there is no peer-reviewed cost-of-goods figure for creatine monohydrate, whey isolate or
 *    cholecalciferol. Estimating one here would be this file inventing a number, so `pricing` is
 *    omitted on every entry. A missing price beats a manufactured one.
 *
 * 2. THE STRUCTURE IS THE MARKER MOLECULE, NOT THE PRODUCT. Half of this aisle is a mixture: whey
 *    protein is hundreds of proteins, collagen peptides are a hydrolysate, psyllium and inulin are
 *    polysaccharide populations, fish oil is at least two fatty acids. Where those pages carry a
 *    structure it is the single named marker the literature actually tracks, and the page says so
 *    in prose. Where no single molecule is meaningful, no structure is given at all.
 *
 * 3. DOSES APPEAR ONLY AS TRIAL FACTS. This repository gives no dosage, protocol or procurement
 *    guidance in any form. Where an amount appears it describes what a cited trial administered,
 *    in the past tense, because an effect size is unreadable without knowing what produced it. It
 *    is never advice.
 *
 * 4. THE AUDIT IS THE PRODUCT, WHICH CUTS BOTH WAYS. Several substances here have genuinely
 *    strong, replicated human evidence — creatine and caffeine are two of the best-supported
 *    ergogenic compounds in existence, and saying so plainly is what makes the sceptical pages
 *    credible. Others carry very large null randomised trials for exactly the outcome people buy
 *    them for: VITAL and D-Health for vitamin D, SELECT for selenium and vitamin E, ATBC for
 *    beta-carotene, STRENGTH for omega-3. Both kinds of finding are recorded the same way.
 *
 * 5. A DEFICIENCY EFFECT IS NOT A SUPPLEMENT EFFECT. This is the single most repeated error in the
 *    whole category. Vitamin D cures rickets; that fact says nothing about whether vitamin D in a
 *    replete adult prevents cancer, and the randomised answer to the second question has mostly
 *    been no. Every page here keeps the two claims apart, because conflating them is how the aisle
 *    was built.
 */
export const NUTRACEUTICAL_CORE_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // Creatine monohydrate — the supplement that works, and the two Phase 3 neurology trials that
  // show exactly where "it works" stops.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'creatine-monohydrate',
    name: 'Creatine monohydrate',
    sponsor:
      'No single sponsor — a guanidino compound made industrially from sarcosine and cyanamide, sold by many manufacturers',
    targetGene: 'CKM',
    targetProtein:
      'Creatine kinase M-type, the enzyme that regenerates ATP from the muscle phosphocreatine pool. Entry into the myocyte is through the sodium- and chloride-dependent creatine transporter SLC6A8.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for strength, power and lean mass. Not approved by the FDA or EMA for any disease. The same molecule is used clinically as metabolite replacement in the inherited cerebral creatine deficiency syndromes.',
    patientFriendlyIndication: 'Taken for strength and power output in short, hard efforts',
    conditionContext: {
      conditionExplainer:
        'A muscle cell running flat out burns through its ATP in a few seconds. What keeps it going for the next twenty is phosphocreatine, a small reservoir of high-energy phosphate that hands its phosphate straight to spent ADP. The reservoir is finite, and how big it is depends partly on how much creatine the muscle holds.',
      whyItMatters:
        'Creatine is the most heavily studied sports supplement in existence and one of very few where the mechanism, the biopsy data and the performance meta-analyses all point the same way. It is also increasingly marketed for brain health and healthy ageing, where the randomised record is far thinner and in two large trials frankly negative.',
      whoTakesThis:
        'Athletes and recreational lifters, and increasingly older adults and vegetarians. Also prescribed as replacement therapy in the rare GAMT and AGAT deficiency syndromes, where the body cannot synthesise creatine at all.',
      clinicalGoals:
        'The trials measured muscle total creatine, phosphocreatine resynthesis, repeated-bout power, one-repetition maximum, lean body mass and muscle fibre cross-sectional area. Two Phase 3 trials measured clinical progression in Parkinson disease and Huntington disease, and both were halted for futility.',
    },
    oneSentenceVerdict:
      'One of the few supplements whose central claim survives audit — muscle creatine, phosphocreatine resynthesis and short-duration power all rise, replicated across decades — while the neuroprotection claim it is increasingly sold on failed two Phase 3 trials totalling 2,294 patients.',
    laymanHowItWorks:
      'Creatine is absorbed intact and pumped into muscle cells by a dedicated transporter. Inside, an enzyme sticks a phosphate onto it, making a small rechargeable battery. During a maximal effort the battery hands its phosphate to spent energy molecules, keeping the cell going for several seconds longer than it otherwise would. Over weeks that means slightly more work per training session, and slightly more work per session compounds into bigger muscle fibres.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    anatomicalSite: 'Skeletal muscle cytosol, with a much smaller pool in brain and heart',
    substitutes: {
      summary:
        'There is no prescription drug that does what creatine does, and no food that delivers a comparable amount without an implausible quantity of meat. The real comparison is with training itself: in the one trial that separated them, twelve weeks of supervised resistance training added about 2.2 kg of lean mass whether or not creatine was taken alongside it.',
      conventionalRx: [
        {
          name: 'Creatine monohydrate as metabolite replacement in GAMT and AGAT deficiency',
          class: 'Metabolite replacement therapy',
          howItCompares:
            'The identical molecule, used medically rather than recreationally, in children whose enzymes cannot make creatine and whose brains are therefore depleted of it. That clinical use is the strongest evidence that creatine crosses into the brain at all — and it says nothing about whether adding more to an already-replete adult brain does anything.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: addresses a genuine deficiency with a measurable brain creatine readout on MR spectroscopy. Cons: entirely irrelevant to the healthy adult who is the market for the tub.',
        },
      ],
      naturalFoods: [
        {
          name: 'Red meat and oily fish',
          activeCompound: 'Creatine, roughly 3 to 5 g per kilogram of raw muscle tissue',
          biologicalMechanism:
            'The same molecule from the same place — creatine in a supplement tub and creatine in a steak are chemically identical, and dietary creatine is how omnivores maintain most of their muscle pool alongside endogenous synthesis from glycine, arginine and methionine.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. Harris et al. (1992) recorded the conversion directly: a single 5 g dose of creatine monohydrate corresponds to the creatine content of about 1.1 kg of fresh uncooked steak.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'A vegetarian or vegan diet, as the negative case',
          activeCompound: 'Near-absent dietary creatine',
          biologicalMechanism:
            'People who eat no meat start with a lower muscle total creatine content, and Harris et al. found the rise on supplementation was greatest in exactly those subjects who began lowest. That is a repletion effect, not a supraphysiological one, and it is why response varies so much between individuals.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Separate the muscle claim from the brain claim before reading any headline',
          action:
            'For any creatine result, check whether the endpoint was a power output, a body composition scan, or a clinical neurological score.',
          patientImpact:
            'The performance evidence is strong and replicated. The neurological evidence consists of two Phase 3 trials, in 1,741 and 553 patients, that were both stopped early because creatine was not working.',
          clinicalPrecaution:
            'Creatine raises serum creatinine because creatinine is its breakdown product. That is a laboratory artefact, not kidney injury, but it will confuse an eGFR reading, so anyone having renal function checked should say they take it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(CC(=O)O)C(=N)N.O',
      chemicalFormula: 'C4H11N3O3',
      molecularWeight: '149.15 g/mol (monohydrate; 131.13 g/mol for the anhydrous creatine zwitterion)',
      structureSource: {
        label: 'PubChem CID 80116 — Creatine monohydrate, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/80116',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cre-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Dicyandiamide, dihydrotriazine and creatinine screen on incoming material',
          description:
            'Creatine monohydrate is manufactured from sarcosine and cyanamide, and the impurities that matter are process residues rather than adulterants: unreacted dicyandiamide, the dihydrotriazine condensation product, and creatinine formed by cyclisation in storage. An assay for creatine alone will pass material carrying all three.',
          reagentsAndBuffer:
            'Creatine monohydrate, creatinine and dicyandiamide reference standards; ion-pair reversed-phase HPLC with UV detection at 210 nm; Karl Fischer titration for water content against the theoretical 12.1% of the monohydrate',
        },
        {
          id: 'cre-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the isotopically labelled internal standard',
          description:
            'Quantifying creatine in a muscle biopsy against endogenous creatine requires a labelled internal standard that behaves identically through extraction but is separable by mass. Prepare or source deuterated creatine and confirm isotopic purity before any biological sample is touched.',
          dependsOnStepId: 'cre-w1',
          reagentsAndBuffer:
            'Creatine-d3 (methyl-d3) internal standard; deuterium-depleted water; LC-MS/MS confirmation of the m/z 132 to 135 transition and isotopic enrichment above 98%',
        },
        {
          id: 'cre-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Perchloric acid extraction and neutralisation of the muscle biopsy',
          description:
            'Freeze-dry the needle biopsy, dissect free of visible connective tissue and blood, then extract the acid-soluble metabolite pool. Phosphocreatine hydrolyses readily, so the extraction is run cold and the neutralisation is immediate, or the measured phosphocreatine to free creatine ratio is an artefact of handling.',
          dependsOnStepId: 'cre-w2',
          reagentsAndBuffer:
            'Ice-cold 0.5 M perchloric acid with 1 mM EDTA; 2.2 M potassium hydrogen carbonate for neutralisation; centrifugation at 4 degrees C; freeze-dried vastus lateralis biopsy',
        },
        {
          id: 'cre-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'SLC6A8-dependent uptake in differentiated myotubes',
          description:
            'Expose differentiated C2C12 myotubes to labelled creatine in sodium-containing and sodium-free buffer. The creatine transporter is sodium- and chloride-dependent, so the sodium-free condition is the specificity control that separates carrier-mediated uptake from passive partitioning, and insulin is added as the positive modulator.',
          dependsOnStepId: 'cre-w3',
          reagentsAndBuffer:
            'C2C12 myotubes differentiated in 2% horse serum; sodium-containing and choline-substituted Krebs-Ringer buffer; creatine-d3 tracer; 100 nM insulin; guanidinopropionic acid as a competitive transporter inhibitor',
        },
        {
          id: 'cre-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Total creatine and phosphocreatine quantification, with a 31P-MRS cross-check',
          description:
            'Quantify free creatine and phosphocreatine by LC-MS/MS against the labelled standard and express total creatine as their sum per kilogram of dry muscle, which is the unit the Harris and Greenhaff biopsy literature reports. Cross-check a subset in vivo by phosphorus magnetic resonance spectroscopy, which measures the phosphocreatine pool without a needle.',
          dependsOnStepId: 'cre-w4',
          reagentsAndBuffer:
            'LC-MS/MS with the creatine and creatine-d3 transitions; enzymatic coupled assay with creatine kinase and hexokinase as an orthogonal check; 31P magnetic resonance spectroscopy at 3 T with a surface coil over the vastus lateralis',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cre-a1',
        category: 'measured',
        title: 'Harris 1992: muscle total creatine rose, and rose most in those who started lowest',
        laymanSummary:
          'Muscle biopsies before and after showed that swallowed creatine really does end up inside muscle, and that people with the least to begin with gained the most.',
        technicalDetails:
          'Seventeen subjects had quadriceps femoris biopsies before and after supplementation with 5 g of creatine monohydrate four or six times daily for two or more days. Total muscle creatine content rose significantly, by as much as 50% in some subjects, and the increase was greatest in those with a low initial content — the effect was to move them toward the upper end of the normal range rather than beyond it. Uptake was concentrated in the first two days, accounting for 32% of the administered dose in three subjects; renal excretion was 40 to 68% of the dose over the first three days. Roughly 20% or more of the creatine taken up was measured as phosphocreatine, and muscle ATP content did not change.',
        evidenceSource: 'Harris RC, Soderlund K, Hultman E. Clin Sci (Lond) 1992;83:367-374',
        doi: '10.1042/cs0830367',
        measuredMetric:
          'Total creatine and phosphocreatine content of quadriceps femoris muscle biopsies, mmol per kg dry matter',
        auditFlag: 'verified',
      },
      {
        id: 'cre-a2',
        category: 'measured',
        title: 'Greenhaff 1994: faster phosphocreatine resynthesis, in five of eight subjects',
        laymanSummary:
          'After creatine, the muscle refilled its energy battery faster between hard efforts — but only in the people whose creatine level had actually gone up.',
        technicalDetails:
          'Eight subjects underwent electrically evoked isometric contraction with biopsies at 0, 20, 60 and 120 seconds of recovery, repeated ten days later after five days of 20 g creatine daily. In five of the eight, total creatine rose by 29 +/- 3 mmol/kg dry matter (25 +/- 3%) and phosphocreatine resynthesis during recovery rose by 19 +/- 4 mmol/kg dry matter (35 +/- 6%). In the other three, total creatine rose only 8 to 9 mmol/kg (5 to 7%) and phosphocreatine resynthesis did not increase at all. The responder-non-responder split is a finding, not noise: the ergogenic effect tracks the loading of the muscle, not the swallowing of the dose.',
        evidenceSource: 'Greenhaff PL et al. Am J Physiol 1994;266:E725-E730',
        doi: '10.1152/ajpendo.1994.266.5.E725',
        measuredMetric:
          'Phosphocreatine resynthesis rate during the second minute of recovery from intense contraction',
        auditFlag: 'verified',
      },
      {
        id: 'cre-a3',
        category: 'measured',
        title: 'Branch 2003: a 100-study meta-analysis, and effect sizes of about 0.2',
        laymanSummary:
          'Pooling a hundred trials, creatine helps — reliably, and by a small amount, and mostly in short laboratory efforts rather than in running or swimming.',
        technicalDetails:
          'A meta-analysis of 96 peer-reviewed papers comprising 100 randomised, placebo-controlled, blinded studies. Effect sizes were small but significantly greater than zero: body composition 0.17 +/- 0.03 (n = 163), ATP-phosphocreatine-system tasks under 30 seconds 0.24 +/- 0.02 (n = 17), glycolytic tasks of 30 to 150 seconds 0.19 +/- 0.05 (n = 135), oxidative tasks over 150 seconds 0.20 +/- 0.07 (n = 69). The effect was larger for upper-body exercise (0.42 +/- 0.07) than lower (0.21 +/- 0.02) or total body (0.13 +/- 0.04), and larger for laboratory tasks (0.25 +/- 0.02) than field tasks such as running and swimming (0.14 +/- 0.04, P = .014). There was no difference in effect size by sex or by training status. The author concluded plainly that creatine does not appear to improve running and swimming performance.',
        evidenceSource: 'Branch JD. Int J Sport Nutr Exerc Metab 2003;13:198-226',
        doi: '10.1123/ijsnem.13.2.198',
        measuredMetric:
          'Pooled effect size for body composition and for exercise performance by task duration and type',
        auditFlag: 'verified',
      },
      {
        id: 'cre-a4',
        category: 'failed',
        title: 'NET-PD LS-1: 1,741 patients, five years, terminated for futility',
        laymanSummary:
          'The largest test of creatine as a brain protector enrolled 1,741 people with Parkinson disease and was stopped early because it was not working.',
        technicalDetails:
          'A multicentre, double-blind, placebo-controlled trial at 45 sites randomised 1,741 people with early treated Parkinson disease to 10 g/day creatine monohydrate or placebo for a minimum of five years. The trial was terminated early for futility at a planned interim analysis of the 955 participants enrolled at least five years earlier. Mean summed ranks across five clinical outcome measures were 2,360 (95% CI 2,249 to 2,470) for placebo and 2,414 (95% CI 2,304 to 2,524) for creatine — numerically worse on creatine — with a global statistical test of t = -0.75 and two-sided P = .45. The authors wrote that the findings do not support the use of creatine monohydrate in Parkinson disease.',
        evidenceSource: 'Kieburtz K et al. (NINDS NET-PD Investigators). JAMA 2015;313:584-593',
        doi: '10.1001/jama.2015.120',
        measuredMetric:
          'Global statistical test across Modified Rankin, Symbol Digit Modalities, PDQ-39, Schwab and England ADL and ambulatory capacity, baseline to five years',
        auditFlag: 'verified',
      },
      {
        id: 'cre-a5',
        category: 'failed',
        title: 'CREST-E: halted for futility, with decline numerically faster on creatine',
        laymanSummary:
          'A 553-patient Huntington disease trial of high-dose creatine was stopped early. Function declined slightly faster in the creatine group than in the placebo group.',
        technicalDetails:
          'A multicentre randomised double-blind trial of up to 40 g daily creatine monohydrate in stage I and II Huntington disease across 46 sites in North America, Australia and New Zealand. It aimed to enrol 650 and randomised 553 (275 creatine, 278 placebo) before being halted for futility at the first interim analysis. Estimated rate of decline in total functional capacity was 0.82 points per year on creatine against 0.70 on placebo, favouring placebo (nominal 95% confidence limits -0.11 to 0.35). Adverse events, mainly gastrointestinal, were significantly more common on creatine. The paper carries a Class II evidence rating that creatine is not beneficial for slowing functional decline in early manifest Huntington disease.',
        evidenceSource: 'Hersch SM et al. Neurology 2017;89:594-601',
        doi: '10.1212/WNL.0000000000004209',
        measuredMetric: 'Rate of change in total functional capacity over up to 48 months',
        auditFlag: 'verified',
      },
      {
        id: 'cre-a6',
        category: 'inferred',
        title: 'The first week of "lean mass" is largely water, and 2025 found no additive effect',
        laymanSummary:
          'A 2025 trial separated the two things creatine is credited with. The fast early gain on the body scan appeared within a week, before any training. The slow gain from three months of lifting was the same with or without it.',
        technicalDetails:
          'Sixty-three participants (34 female, 29 male, 31 +/- 8 years) were randomised to 5 g/day creatine monohydrate for 13 weeks or to a no-supplement control. After a seven-day wash-in with no exercise, the creatine group gained 0.51 +/- 1.26 kg of lean body mass on DXA against 0 +/- 1.20 kg in control (P = 0.03) — a gain the authors attribute to intracellular water, which DXA cannot distinguish from tissue. After the subsequent twelve weeks of supervised resistance training, both groups gained about 2 kg of lean mass (P < 0.0001 within groups) with no difference between them (P = 0.71). The authors concluded creatine had no additive effect on lean body mass changes when combined with resistance training at that maintenance amount. The trial was unblinded with no placebo, which cuts against reading it as a definitive negative.',
        evidenceSource: 'Desai I et al. Nutrients 2025;17:1081',
        doi: '10.3390/nu17061081',
        inferredClaim:
          'That the pounds appearing on the scale in the first week of creatine are muscle tissue, and that the lean mass gained across a training block is attributable to the supplement rather than to the training',
        auditFlag: 'caution',
      },
      {
        id: 'cre-a7',
        category: 'conclusion_shift',
        title: 'The kidney scare reversed: raised creatinine is the metabolite, not the injury',
        laymanSummary:
          'Creatine was widely believed to damage kidneys because it pushes up a blood marker doctors use to check kidney function. That marker is creatine\'s own breakdown product, and studies of long-term users found normal kidney function.',
        technicalDetails:
          'Serum creatinine is the non-enzymatic breakdown product of creatine, so supplementation raises it mechanically without any change in glomerular filtration — which made every early eGFR-based safety signal uninterpretable. Poortmans and Francaux measured creatinine, urea and albumin clearances directly in athletes who had used creatine for ten months to five years against controls and found no difference in plasma content, urinary excretion rate or clearance for any of the three; glomerular filtration rate, tubular reabsorption and glomerular membrane permeability were normal in both groups. The 2017 International Society of Sports Nutrition position stand reviewed the accumulated safety literature and concluded there is no compelling evidence of harm to kidney function in healthy individuals. The practical residue is diagnostic, not toxicological: a creatine user\'s eGFR will read low, and that has to be known before it is acted on.',
        evidenceSource:
          'Poortmans JR, Francaux M. Med Sci Sports Exerc 1999;31:1108-1110; Kreider RB et al. J Int Soc Sports Nutr 2017;14:18',
        doi: '10.1186/s12970-017-0173-z',
        inferredClaim:
          'That a rise in serum creatinine in a creatine user indicates renal impairment, when it is the assay reading the supplement itself',
        auditFlag: 'verified',
      },
      {
        id: 'cre-a8',
        category: 'inferred',
        title: 'The cognition evidence is six small trials, and unchanged in the young',
        laymanSummary:
          'The brain claim rests on a review of six trials in 281 people. Short-term memory improved; most other measures were inconsistent, and young adults showed no change at all.',
        technicalDetails:
          'A systematic review of randomised controlled trials of oral creatine and cognition in healthy people identified six studies totalling 281 individuals. There was evidence that short-term memory and intelligence or reasoning may improve; results for long-term memory, spatial memory, memory scanning, attention, executive function, response inhibition, word fluency, reaction time and mental fatigue were conflicting. Performance stayed unchanged in young individuals, and vegetarians responded better than meat-eaters on memory tasks — again a repletion pattern. The authors called for larger sample sizes and noted that creatine had not then been tested in dementia or cognitive impairment. Two hundred and eighty-one people across six trials is not a body of evidence that supports a marketing category.',
        evidenceSource: 'Avgerinos KI et al. Exp Gerontol 2018;108:166-173',
        doi: '10.1016/j.exger.2018.04.013',
        inferredClaim:
          'That creatine is an established cognitive enhancer or neuroprotective agent in healthy adults',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, absorbed intact, and in the blood within an hour',
        laymanDesc:
          'Unlike most supplements, creatine survives the gut unchanged and appears in the bloodstream quickly and in large amounts.',
        molecularDetail:
          'Harris et al. measured a mean peak plasma concentration of 795 +/- 104 micromol/L one hour after a single 5 g dose in subjects of 76 to 87 kg, with repeated 5 g doses every two hours holding plasma at roughly 1,000 micromol/L. Doses of 1 g or less produced only a modest rise, so the plasma curve is dose-dependent rather than saturated at intake.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A dedicated pump drags it into the muscle cell',
        laymanDesc:
          'Muscle does not wait for creatine to drift in. A specific transporter pulls it across the membrane against a steep concentration difference, using the cell\'s sodium gradient to pay for it.',
        molecularDetail:
          'SLC6A8, the sodium- and chloride-dependent creatine transporter, concentrates creatine roughly a hundredfold over plasma. Uptake is highest at the start of loading — 32% of the administered dose in the first two days in Harris et al.\'s three intensively sampled subjects — and falls sharply as the muscle approaches its ceiling of about 160 mmol/kg dry matter. Insulin and contractile activity both increase transporter activity.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Creatine kinase charges it into a phosphate battery',
        laymanDesc:
          'Inside the cell an enzyme attaches a high-energy phosphate to creatine, storing energy in a form that can be released far faster than the cell can make fresh fuel.',
        molecularDetail:
          'Creatine kinase catalyses the reversible transfer of the gamma-phosphate of ATP to creatine, giving phosphocreatine and ADP. The equilibrium sits far toward phosphocreatine at rest. Harris et al. recovered about 20% or more of newly taken-up creatine as phosphocreatine, and muscle ATP content did not change — the pool that expands is the buffer, not the ATP itself.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'During maximal effort the battery discharges into spent ATP',
        laymanDesc:
          'When the muscle empties its immediate fuel in a few seconds, phosphocreatine hands its phosphate straight back, keeping force high for several seconds longer and refilling faster between efforts.',
        molecularDetail:
          'The creatine kinase reaction runs in reverse near equilibrium, rephosphorylating ADP faster than glycolysis or oxidative phosphorylation can. Greenhaff et al. measured the consequence directly: in responders, phosphocreatine resynthesis during the second minute of recovery rose 35 +/- 6% after loading, while non-responders showed no change.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'More work per session, compounding into larger fibres over months',
        laymanDesc:
          'The gain is not strength itself. It is being able to do a little more work in each session, which over a training block turns into more muscle.',
        molecularDetail:
          'Volek et al. randomised 19 resistance-trained men to creatine or placebo over 12 weeks of periodised heavy training. Fat-free mass rose 6.3% against 3.1%, bench press 24% against 16%, squat 32% against 24%, and type I, IIA and IIAB fibre cross-sectional areas rose 35%, 36% and 35% against 11%, 15% and 6%. The authors attributed the difference to higher-quality training sessions rather than to a direct anabolic action — average bench press training volume was significantly higher in the creatine group during weeks 5 to 8.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Harris 1992 muscle biopsy study (Clin Sci)',
        phase: 'Mechanistic human study with muscle biopsy',
        sampleSize: 17,
        primaryEndpoint:
          'Change in total creatine content of quadriceps femoris muscle after oral creatine monohydrate',
        endpointMet: true,
        statisticalPValue: 'Significant increase in total muscle creatine; increases up to 50%',
        unreportedAdverseSignals:
          'Renal excretion accounted for 40 to 68% of the dose over the first three days, meaning most of a loading dose is not retained. No placebo arm.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Volek 1999 (creatine plus 12 weeks periodised resistance training)',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 19,
        primaryEndpoint:
          'Fat-free mass, one-repetition maximum strength and muscle fibre cross-sectional area after 12 weeks',
        endpointMet: true,
        statisticalPValue: 'P <= 0.05 for body mass, fat-free mass, bench press, squat and fibre CSA',
        unreportedAdverseSignals:
          'No negative side effects were reported by subjects. The trial was small and in already resistance-trained men, so it does not speak to untrained or older populations.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00449865 — NET-PD LS-1, creatine in early Parkinson disease',
        phase: 'Phase 3',
        sampleSize: 1741,
        primaryEndpoint:
          'Global statistical test of clinical decline across five outcome measures from baseline to five years',
        endpointMet: false,
        statisticalPValue: 'P = .45 (two-sided), global statistical test t = -0.75',
        unreportedAdverseSignals:
          'Terminated early for futility. Summed ranks were numerically worse in the creatine arm. No detectable difference in adverse or serious adverse events by body system.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT00712426 — CREST-E, creatine in early manifest Huntington disease',
        phase: 'Phase 3',
        sampleSize: 553,
        primaryEndpoint: 'Rate of change in total functional capacity over up to 48 months',
        endpointMet: false,
        statisticalPValue:
          'Decline 0.82 points/year on creatine versus 0.70 on placebo, favouring placebo (95% CL -0.11 to 0.35)',
        unreportedAdverseSignals:
          'Halted for futility at the first interim analysis, short of its 650-patient target. Gastrointestinal adverse events were significantly more common on creatine.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Groeneveld 2003 — creatine in amyotrophic lateral sclerosis',
        phase: 'Randomised double-blind placebo-controlled sequential trial',
        sampleSize: 175,
        primaryEndpoint:
          'Death, persistent assisted ventilation or tracheostomy, with a sequential stopping rule',
        endpointMet: false,
        statisticalPValue:
          'Trial stopped when the null hypothesis of indifference was accepted; 12-month survival 0.70 creatine versus 0.68 placebo',
        unreportedAdverseSignals:
          'Creatine had shown a promising survival increase in the transgenic mouse model of ALS. It did not transfer. No important adverse reactions were caused by creatine intake.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Total muscle creatine rises measurably on biopsy, most in subjects who started lowest, with uptake concentrated in the first two days',
        'Phosphocreatine resynthesis during recovery rose 35 +/- 6% in the five of eight Greenhaff subjects whose muscle creatine actually loaded',
        'Pooled effect sizes of about 0.17 to 0.24 across 100 randomised placebo-controlled studies, larger for upper-body and laboratory tasks',
        'Twelve weeks of training with creatine produced greater fat-free mass, bench press, squat and fibre cross-sectional area than training with placebo in trained men',
      ],
      unsupportedInferences: [
        'That creatine is neuroprotective in humans — two Phase 3 trials in 2,294 patients were both halted for futility',
        'That it is an established cognitive enhancer, when the review base is six trials in 281 people with no change in young adults',
        'That the lean mass appearing in the first week is muscle tissue rather than intracellular water',
        'That it improves endurance events; the meta-analysis found no benefit for running or swimming',
      ],
      whatFailedInitially: [
        'Animal-to-human translation in ALS: a promising survival gain in the transgenic mouse did not appear in 175 patients',
        'The Parkinson disease programme, terminated for futility after five years and 1,741 randomised patients',
        'The Huntington disease programme, halted at interim with decline numerically faster on creatine',
      ],
      realWorldOutcome: [
        'Creatine monohydrate is among the best-evidenced supplements in existence for its core performance claim, and this file says so without hedging',
        'Roughly three in eight people in the biopsy studies did not load meaningfully and did not get the ergogenic effect',
        'It reliably raises serum creatinine without impairing renal function, which is a diagnostic trap rather than a safety problem',
      ],
    },
    deliverySystem: {
      type: 'Oral powder or capsule, creatine monohydrate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. Monohydrate is the form used in essentially all of the trial literature cited here; the alternative salts and esters marketed as superior have not reproduced this evidence base and in several cases were tested against monohydrate and did not beat it.',
      safetyProfile:
        'Weight gain of one to two kilograms in the first week, most of it water drawn into muscle. Gastrointestinal upset, which was significantly more common on creatine than placebo in CREST-E at 40 g daily. Serum creatinine rises for assay reasons and will make an eGFR read falsely low. Direct clearance measurements in long-term users found normal renal function, and the 2017 ISSN position stand found no compelling evidence of kidney harm in healthy people. Anyone with existing renal disease is outside the population those studies covered.',
    },
    commonQuestions: [
      {
        q: 'Does creatine actually work, or is it another supplement myth?',
        a: 'It works, and this page is not going to hedge that. Muscle biopsies show the creatine gets in, phosphorus spectroscopy and biopsy both show the phosphocreatine pool refills faster, and a meta-analysis of a hundred randomised placebo-controlled studies finds a consistent positive effect. The honest qualifier is the size: effect sizes around 0.2, larger for short upper-body laboratory efforts, and no benefit at all for running or swimming.',
        auditNote:
          'Being fair to what works is what makes the sceptical pages elsewhere in this file worth reading.',
      },
      {
        q: 'Is it bad for your kidneys?',
        a: 'The evidence says no in healthy people, and the reason the belief persists is a measurement artefact. Creatinine, the blood marker used to estimate kidney function, is creatine\'s own breakdown product, so taking creatine raises it without anything happening to the kidney. When clearances were measured directly in people who had used creatine for up to five years, filtration, tubular reabsorption and membrane permeability were all normal. The practical point is to tell a clinician you take it before an eGFR result gets acted on.',
      },
      {
        q: 'What about creatine for the brain and for ageing?',
        a: 'That is where the claim outruns the data. The two largest neurological trials ever run on creatine — 1,741 patients with Parkinson disease over five years and 553 with Huntington disease — were both stopped early for futility, and in both the treated group did numerically slightly worse. The healthy-cognition literature is six small trials in 281 people, with no change in young adults. Creatine plainly enters the brain, since it treats inherited creatine deficiency. Adding more to a brain that already has enough is a different question, and the randomised answer so far is unimpressive.',
        auditNote:
          'This is the largest gap between marketing direction and measured outcome on this page.',
      },
      {
        q: 'Why do some people say it did nothing for them?',
        a: 'Because for some people it did. In Greenhaff\'s biopsy study three of eight subjects raised muscle creatine by only 5 to 7% and showed no improvement in phosphocreatine resynthesis. Harris found the rise was largest in subjects who started with the least, which is why vegetarians tend to respond and people already eating a lot of meat often do not. The response tracks how much the muscle loads, and the muscle has a ceiling.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Harris RC, Soderlund K, Hultman E. Elevation of creatine in resting and exercised muscle of normal subjects by creatine supplementation. Clin Sci (Lond) 1992;83:367-374',
        identifier: '10.1042/cs0830367',
        kind: 'doi',
      },
      {
        label:
          'Greenhaff PL et al. Effect of oral creatine supplementation on skeletal muscle phosphocreatine resynthesis. Am J Physiol 1994;266:E725-E730',
        identifier: '10.1152/ajpendo.1994.266.5.E725',
        kind: 'doi',
      },
      {
        label:
          'Volek JS et al. Performance and muscle fiber adaptations to creatine supplementation and heavy resistance training. Med Sci Sports Exerc 1999;31:1147-1156',
        identifier: '10.1097/00005768-199908000-00011',
        kind: 'doi',
      },
      {
        label:
          'Poortmans JR, Francaux M. Long-term oral creatine supplementation does not impair renal function in healthy athletes. Med Sci Sports Exerc 1999;31:1108-1110',
        identifier: '10.1097/00005768-199908000-00005',
        kind: 'doi',
      },
      {
        label:
          'Branch JD. Effect of creatine supplementation on body composition and performance: a meta-analysis. Int J Sport Nutr Exerc Metab 2003;13:198-226',
        identifier: '10.1123/ijsnem.13.2.198',
        kind: 'doi',
      },
      {
        label:
          'Groeneveld GJ et al. A randomized sequential trial of creatine in amyotrophic lateral sclerosis. Ann Neurol 2003;53:437-445',
        identifier: '10.1002/ana.10554',
        kind: 'doi',
      },
      {
        label:
          'Kieburtz K et al. Effect of creatine monohydrate on clinical progression in patients with Parkinson disease: a randomized clinical trial. JAMA 2015;313:584-593',
        identifier: '10.1001/jama.2015.120',
        kind: 'doi',
      },
      {
        label: 'NET-PD LS-1 trial registration — creatine in Parkinson disease',
        identifier: 'NCT00449865',
        kind: 'nct',
      },
      {
        label:
          'Hersch SM et al. The CREST-E study of creatine for Huntington disease: a randomized controlled trial. Neurology 2017;89:594-601',
        identifier: '10.1212/WNL.0000000000004209',
        kind: 'doi',
      },
      {
        label: 'CREST-E trial registration — creatine in Huntington disease',
        identifier: 'NCT00712426',
        kind: 'nct',
      },
      {
        label:
          'Kreider RB et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. J Int Soc Sports Nutr 2017;14:18',
        identifier: '10.1186/s12970-017-0173-z',
        kind: 'doi',
      },
      {
        label:
          'Avgerinos KI et al. Effects of creatine supplementation on cognitive function of healthy individuals: a systematic review of randomized controlled trials. Exp Gerontol 2018;108:166-173',
        identifier: '10.1016/j.exger.2018.04.013',
        kind: 'doi',
      },
      {
        label:
          'Desai I et al. The effect of creatine supplementation on lean body mass with and without resistance training. Nutrients 2025;17:1081',
        identifier: '10.3390/nu17061081',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 80116 — Creatine monohydrate',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/80116',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Vitamin D3 — the clearest case on this site of a real deficiency effect being sold as a
  // general-population effect, against roughly 50,000 randomised participants of null results.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vitamin-d3-cholecalciferol',
    name: 'Vitamin D3 (cholecalciferol)',
    sponsor:
      'No single sponsor — a secosteroid made commercially by ultraviolet irradiation of 7-dehydrocholesterol from lanolin',
    targetGene: 'VDR',
    targetProtein:
      'Vitamin D receptor, a nuclear hormone receptor. Cholecalciferol itself is inactive: it is hydroxylated by hepatic CYP2R1 to 25-hydroxyvitamin D and then by renal CYP27B1 to 1,25-dihydroxyvitamin D, which is the ligand.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for bone, immune and general health. Nutritional vitamin D3 is not an FDA-approved drug for any disease; the prescription analogues calcitriol, doxercalciferol and paricalcitol are separate approved products for renal bone disease.',
    patientFriendlyIndication: 'Taken for bones and immunity, tested against most of that and failed',
    conditionContext: {
      conditionExplainer:
        'Vitamin D is not really a vitamin. Skin makes it from cholesterol under ultraviolet B light, the liver and then the kidney convert it into a hormone, and that hormone tells the gut to absorb calcium. Without enough of it, the gut cannot pull calcium out of food, the parathyroid glands compensate by stripping calcium from bone, and the bone that is laid down does not mineralise properly — rickets in children, osteomalacia in adults.',
      whyItMatters:
        'This is the most-supplemented micronutrient in the developed world and the clearest example anywhere of a real deficiency disease being used to sell a general-population product. The randomised evidence base is unusually large: roughly 50,000 participants across VITAL, D-Health and DO-HEALTH alone, and for the outcomes people actually buy it for the answer has mostly been no.',
      whoTakesThis:
        'Almost everyone, at some point. Also legitimately prescribed for documented deficiency, for malabsorption, after bariatric surgery, in chronic kidney disease and alongside anti-osteoporosis drugs.',
      clinicalGoals:
        'The trials measured incident cancer, major cardiovascular events, all-cause mortality, fractures, falls, blood pressure, physical performance, cognition, infection rates, incident type 2 diabetes and incident autoimmune disease. Almost the entire list came back null.',
    },
    oneSentenceVerdict:
      'A genuine hormone precursor that genuinely cures a genuine deficiency disease, and which — tested at 2000 IU daily in 25,871 people for cancer and cardiovascular disease, in 21,315 for mortality, and in 25,871 for fractures — did not change any of them.',
    laymanHowItWorks:
      'Vitamin D from sun or a capsule is inert until the body activates it twice, first in the liver and then in the kidney. The finished hormone slots into a receptor inside cell nuclei and switches on the genes that let the intestine absorb calcium. If you have too little, calcium absorption fails and your parathyroid glands start dismantling your skeleton to keep blood calcium normal. Correcting that is what vitamin D unambiguously does. Adding more once the system is already saturated is a different proposition, and that is what the large trials tested.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 44,
    anatomicalSite:
      'Skin (synthesis), hepatocyte and renal proximal tubule (activation), intestinal enterocyte nucleus (action)',
    substitutes: {
      summary:
        'For deficiency, vitamin D3 is the substitute — nothing else replaces it. For fracture prevention in the general population it has now been directly outperformed by doing nothing, since VITAL found no difference at all; the agents with fracture-outcome data are bisphosphonates and denosumab. Sunlight and oily fish supply the same molecule by the same route.',
      conventionalRx: [
        {
          name: 'Calcitriol, alfacalcidol, doxercalciferol, paricalcitol',
          class: 'Active vitamin D receptor agonists (prescription)',
          howItCompares:
            'These skip one or both activation steps and are used where the kidney cannot perform the final hydroxylation, principally chronic kidney disease. They are far more potent, carry a real hypercalcaemia risk and require monitoring. They are also not what is in a supplement bottle, and results with them do not transfer to cholecalciferol.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: work when the kidney cannot activate cholecalciferol. Cons: narrow therapeutic window, hypercalcaemia, prescription-only for good reason.',
        },
        {
          name: 'Bisphosphonates and denosumab',
          class: 'Antiresorptive osteoporosis drugs',
          howItCompares:
            'These have what vitamin D lacks: randomised fracture-outcome data in the populations they are given to. VITAL tested vitamin D3 for exactly that endpoint in 25,871 adults and found a hazard ratio of 0.98 for total fractures and 1.01 for hip fractures. Vitamin D repletion remains a prerequisite for these drugs to work, which is a supporting role, not a substitute one.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: fracture reduction demonstrated in randomised trials. Cons: rare atypical femoral fracture and osteonecrosis of the jaw, and they do nothing for deficiency itself.',
        },
      ],
      naturalFoods: [
        {
          name: 'Ultraviolet B exposure of skin',
          activeCompound: 'Cholecalciferol synthesised in situ from 7-dehydrocholesterol',
          biologicalMechanism:
            'Identical molecule by the identical pathway, with the difference that cutaneous synthesis is self-limiting — continued exposure photodegrades previtamin D3 to inert lumisterol and tachysterol, so the skin cannot overproduce. Latitude, season, skin pigmentation, age and sunscreen all reduce the yield, and above roughly 35 degrees latitude winter sunlight carries too little UVB to make any.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no exposure guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Oily fish, cod liver oil, egg yolk, fortified milk and cereal',
          activeCompound: 'Cholecalciferol, with 25-hydroxyvitamin D3 also present in animal tissue',
          biologicalMechanism:
            'Dietary vitamin D is absorbed with fat into chylomicrons and enters the same hepatic 25-hydroxylation step. Food fortification, introduced in the 1930s specifically against rickets, is the intervention that actually ended the disease as a mass phenomenon in industrialised countries.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Measure the blood level before deciding anything, not after',
          action:
            'A serum 25-hydroxyvitamin D concentration is the only thing that distinguishes the population in whom vitamin D reliably works from the population in whom it reliably does not.',
          patientImpact:
            'VITAL, D-Health and DO-HEALTH all enrolled unscreened, largely replete adults, and all three were null. Chapuy enrolled 84-year-old institutionalised women with secondary hyperparathyroidism, and hip fractures fell 43%. The difference between those two results is the starting concentration, not the molecule.',
          clinicalPrecaution:
            'Vitamin D is fat-soluble and accumulates. The two trials of very large intermittent doses — 500,000 IU annually and 60,000 IU monthly — both produced more falls, not fewer, and three years at 4000 or 10,000 IU daily lowered radial bone density in a dose-dependent way. More is not a safer direction of error here.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C[C@H](CCCC(C)C)[C@H]1CC[C@@H]\\2[C@@]1(CCC/C2=C\\C=C/3\\C[C@H](CCC3=C)O)C',
      chemicalFormula: 'C27H44O',
      molecularWeight: '384.6 g/mol (cholecalciferol; the circulating marker 25-hydroxyvitamin D3 is 400.6 g/mol)',
      structureSource: {
        label: 'PubChem CID 5280795 — Cholecalciferol, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280795',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vd3-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay standardisation against certified reference material',
          description:
            'Before any sample is run, calibrate against a certified serum reference material. Vitamin D assays disagreed so badly between laboratories that the international Vitamin D Standardization Program was created to fix it, and a large part of the older literature on "deficiency prevalence" is a record of assay drift rather than of biology.',
          reagentsAndBuffer:
            'NIST SRM 972a vitamin D metabolites in frozen human serum; NIST SRM 2972a calibration solutions; Vitamin D External Quality Assessment Scheme sample set',
        },
        {
          id: 'vd3-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of hexadeuterated internal standards',
          description:
            'Prepare or source deuterium-labelled 25-hydroxyvitamin D3 and D2 and confirm isotopic purity. Both metabolites must be tracked separately because supplements and fortified foods contain either form, and a method that reports only one will under-read anyone taking ergocalciferol.',
          dependsOnStepId: 'vd3-w1',
          reagentsAndBuffer:
            '25-hydroxyvitamin D3-[26,26,26,27,27,27-d6] and 25-hydroxyvitamin D2-d6 internal standards; methanol; LC-MS/MS confirmation of isotopic enrichment',
        },
        {
          id: 'vd3-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Serum extraction with chromatographic resolution of the C3-epimer',
          description:
            'Extract serum and resolve 3-epi-25-hydroxyvitamin D3 from the parent metabolite. The epimer is isobaric, co-elutes on short columns, and is present at high proportions in infants — a method that cannot separate it reports a falsely high vitamin D status, which is the opposite of a conservative error.',
          dependsOnStepId: 'vd3-w2',
          reagentsAndBuffer:
            'Zinc sulfate and methanol protein precipitation; supported liquid extraction with methyl tert-butyl ether; pentafluorophenyl or cyanopropyl stationary phase capable of baseline-resolving the C3-epimer',
        },
        {
          id: 'vd3-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'VDR-responsive reporter assay in intestinal epithelial cells',
          description:
            'Confirm that the extracted and quantified metabolite is biologically active rather than merely present, by exposing Caco-2 intestinal epithelial cells carrying a vitamin D response element reporter to calcitriol alongside cholecalciferol and 25-hydroxyvitamin D3, which should be far less potent at the receptor.',
          dependsOnStepId: 'vd3-w3',
          reagentsAndBuffer:
            'Caco-2 monolayers on Transwell inserts; CYP24A1 vitamin D response element luciferase reporter; 1,25-dihydroxyvitamin D3 positive control; charcoal-stripped fetal bovine serum to remove background sterols',
        },
        {
          id: 'vd3-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'LC-MS/MS quantification of total 25-hydroxyvitamin D, with parathyroid hormone',
          description:
            'Quantify 25-hydroxyvitamin D3 and D2 as the sum, since that sum is what every guideline threshold refers to, and pair it with intact parathyroid hormone. Parathyroid hormone is the functional readout: it is the suppression of secondary hyperparathyroidism, not the number itself, that Chapuy showed tracked the fracture benefit.',
          dependsOnStepId: 'vd3-w4',
          reagentsAndBuffer:
            'LC-MS/MS in positive electrospray with the m/z 401 to 383 and 383 to 257 transitions; intact PTH immunoassay; serum calcium, albumin and creatinine on the same draw',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vd3-a1',
        category: 'measured',
        title: 'Chapuy 1992: hip fractures fell 43% — in 84-year-old deficient women',
        laymanSummary:
          'In very old, frail, institutionalised French women with low vitamin D and overactive parathyroid glands, vitamin D3 with calcium cut hip fractures by nearly half. This is the real effect, in the real population.',
        technicalDetails:
          'Three thousand two hundred and seventy healthy ambulatory women with a mean age of 84 +/- 6 years received either 1.2 g of elemental calcium as tricalcium phosphate plus 800 IU of vitamin D3 daily, or double placebo, for 18 months. Among completers, hip fractures were 43% lower (P = 0.043) and total nonvertebral fractures 32% lower (P = 0.015). Mean serum parathyroid hormone fell 44% from baseline (P < 0.001) and 25-hydroxyvitamin D rose 162% (P < 0.001). Proximal femoral bone density rose 2.7% on treatment and fell 4.6% on placebo (P < 0.001). Every element of this result — the age, the institutional setting, the baseline secondary hyperparathyroidism, the co-administered calcium — is part of the finding and none of it transfers automatically to a replete 55-year-old.',
        evidenceSource: 'Chapuy MC et al. N Engl J Med 1992;327:1637-1642',
        doi: '10.1056/NEJM199212033272305',
        measuredMetric:
          'Radiologically confirmed hip and nonvertebral fracture incidence, serum PTH, 25(OH)D and femoral bone mineral density over 18 months',
        auditFlag: 'verified',
      },
      {
        id: 'vd3-a2',
        category: 'failed',
        title: 'VITAL: 25,871 people, 5.3 years, no effect on cancer or cardiovascular disease',
        laymanSummary:
          'The largest randomised test of vitamin D for the two diseases it is most often sold against found nothing. Cancer risk was unchanged. Heart attack and stroke risk was unchanged. So was death from any cause.',
        technicalDetails:
          'A nationwide two-by-two factorial randomised placebo-controlled trial of vitamin D3 2000 IU/day and marine n-3 fatty acids 1 g/day in 25,871 US adults (men 50 and over, women 55 and over, including 5,106 Black participants), median follow-up 5.3 years. Invasive cancer of any type: 793 cases on vitamin D against 824 on placebo, hazard ratio 0.96 (95% CI 0.88 to 1.06), P = 0.47. Major cardiovascular events: 396 against 409, hazard ratio 0.97 (95% CI 0.85 to 1.12), P = 0.69. Death from any cause across 978 deaths: hazard ratio 0.99 (95% CI 0.87 to 1.12). Secondary endpoints were uniformly null except a non-significant signal for death from cancer, hazard ratio 0.83 (95% CI 0.67 to 1.02). No excess hypercalcaemia. Participants were not selected for deficiency, which is both the trial\'s limitation and precisely the point: it tested the population that actually buys the product.',
        evidenceSource: 'Manson JE et al. N Engl J Med 2019;380:33-44',
        doi: '10.1056/NEJMoa1809944',
        measuredMetric: 'Incident invasive cancer and major cardiovascular events over a median 5.3 years',
        auditFlag: 'verified',
      },
      {
        id: 'vd3-a3',
        category: 'failed',
        title: 'VITAL fractures: no effect on total, nonvertebral or hip fracture',
        laymanSummary:
          'Vitamin D is recommended for bone health more than for anything else. Tested for fractures in the same 25,871 people, it made no difference — including in those who started with the lowest blood levels.',
        technicalDetails:
          'The prespecified fracture ancillary study of VITAL confirmed 1,991 incident fractures in 1,551 participants over a median 5.3 years, adjudicated by centralised medical record review. Total fractures occurred in 769 of 12,927 on vitamin D3 and 782 of 12,944 on placebo: hazard ratio 0.98 (95% CI 0.89 to 1.08), P = 0.70. Nonvertebral fractures 0.97 (0.87 to 1.07), P = 0.50. Hip fractures 1.01 (0.70 to 1.47), P = 0.96. Critically, there was no modification of the treatment effect by baseline serum 25-hydroxyvitamin D concentration, age, sex, race or body-mass index — the subgroup rescue that is usually offered for a null vitamin D trial was tested for and was not there.',
        evidenceSource: 'LeBoff MS et al. N Engl J Med 2022;387:299-309',
        doi: '10.1056/NEJMoa2202106',
        measuredMetric: 'Adjudicated incident total, nonvertebral and hip fractures',
        auditFlag: 'verified',
      },
      {
        id: 'vd3-a4',
        category: 'failed',
        title: 'D-Health: 21,315 people, no mortality benefit, and a cancer-death signal the wrong way',
        laymanSummary:
          'An Australian trial gave 21,315 older adults monthly vitamin D for five years. Deaths were not reduced. When the first two years were excluded, death from cancer was numerically higher on vitamin D.',
        technicalDetails:
          'A randomised double-blind placebo-controlled trial of 60,000 IU vitamin D3 monthly in 21,315 Australians aged 60 and over, median follow-up 5.7 years. Serum 25-hydroxyvitamin D reached 115 (SD 30) nmol/L on treatment against 77 (SD 25) on placebo, so the intervention plainly worked biochemically. All-cause mortality: 562 deaths (5.3%) on vitamin D against 538 (5.1%) on placebo, hazard ratio 1.04 (95% CI 0.93 to 1.18), P = 0.47. Cardiovascular mortality 0.96 (0.72 to 1.28). Cancer mortality 1.15 (0.96 to 1.39), P = 0.13. In an exploratory analysis excluding the first two years, cancer mortality was 1.24 (95% CI 1.01 to 1.54), P = 0.05. The authors wrote that the precautionary principle suggests this dosing regimen might not be appropriate in people who are already vitamin D-replete.',
        evidenceSource: 'Neale RE et al. Lancet Diabetes Endocrinol 2022;10:120-128',
        doi: '10.1016/S2213-8587(21)00345-4',
        measuredMetric: 'All-cause mortality over five years of monthly dosing, plus cause-specific mortality',
        auditFlag: 'caution',
      },
      {
        id: 'vd3-a5',
        category: 'failed',
        title: 'DO-HEALTH: six primary endpoints in 2,157 older adults, none met',
        laymanSummary:
          'A European trial tested vitamin D, fish oil and strength training in every combination against six different health outcomes in older adults. Nothing worked, individually or together.',
        technicalDetails:
          'A double-blind placebo-controlled two-by-two-by-two factorial trial in 2,157 adults aged 70 and over without major health events in the preceding five years, randomised to 2000 IU/day vitamin D3, 1 g/day omega-3s and a home strength-training programme in eight combinations for three years. The six primary outcomes were change in systolic and diastolic blood pressure, Short Physical Performance Battery, Montreal Cognitive Assessment, and incidence rates of nonvertebral fractures and infections, with 99% confidence intervals and P < .01 required for significance. There were no statistically significant benefits of any intervention individually or in combination for any of the six endpoints. The largest observed effect was a 0.8 mm Hg difference in systolic blood pressure.',
        evidenceSource: 'Bischoff-Ferrari HA et al. JAMA 2020;324:1855-1868',
        doi: '10.1001/jama.2020.16909',
        measuredMetric:
          'Blood pressure, physical performance, cognition, nonvertebral fracture and infection incidence over three years',
        auditFlag: 'verified',
      },
      {
        id: 'vd3-a6',
        category: 'conclusion_shift',
        title: 'The dose-response went into reverse: large intermittent doses caused falls',
        laymanSummary:
          'For a decade the argument for null vitamin D trials was that the dose was too small. Then trials of very large doses found more falls, more fractures and lower bone density — not fewer.',
        technicalDetails:
          'Sanders et al. gave 2,256 community-dwelling women aged 70 and over a single annual oral dose of 500,000 IU cholecalciferol or placebo for three to five years. The vitamin D group had 171 fractures against 135 on placebo and fell at 83.4 per 100 person-years against 72.7, incidence rate ratio 1.15 (95% CI 1.02 to 1.30, P = .03) for falls and 1.26 (95% CI 1.00 to 1.59, P = .047) for fracture, with the excess concentrated in the three months after each dose. Separately, Burt et al. randomised 311 healthy adults aged 55 to 70 with normal baseline 25(OH)D to 400, 4000 or 10,000 IU daily for three years: radial volumetric bone mineral density fell by -1.2%, -2.4% and -3.5% respectively, a significant dose-dependent loss, with no difference in bone strength. The field\'s position moved from "the dose was too low" to a documented ceiling above which the direction of effect changes.',
        evidenceSource:
          'Sanders KM et al. JAMA 2010;303:1815-1822; Burt LA et al. JAMA 2019;322:736-745',
        doi: '10.1001/jama.2019.11889',
        inferredClaim:
          'That the null results of vitamin D trials are explained by insufficient dosing, and that higher doses would therefore have worked',
        auditFlag: 'contested',
      },
      {
        id: 'vd3-a7',
        category: 'measured',
        title: 'Two things did survive: autoimmune disease and, weakly, respiratory infection',
        laymanSummary:
          'Out of an enormous randomised programme, two positive findings held up — a 22% reduction in new autoimmune disease, and a small reduction in respiratory infections at moderate daily doses.',
        technicalDetails:
          'In the VITAL autoimmune ancillary, confirmed incident autoimmune disease over a median 5.3 years occurred in 123 participants on vitamin D against 155 on placebo: hazard ratio 0.78 (95% CI 0.61 to 0.99, P = 0.05), a 22% reduction, with the omega-3 arm at 0.85 (0.67 to 1.08, P = 0.19), not significant. Separately, an aggregate-data meta-analysis of 46 randomised trials in 75,541 participants found a lower proportion of participants with one or more acute respiratory infections on vitamin D, odds ratio 0.92 (95% CI 0.86 to 0.99, 37 studies). The protection was seen with daily rather than bolus dosing (OR 0.78, 0.65 to 0.94), at 400 to 1000 IU daily equivalents (0.70, 0.55 to 0.89), and in participants aged 1 to 16 (0.71, 0.57 to 0.90) — but no significant interaction with dose, frequency or age was demonstrated, so those subgroups are hypothesis-generating rather than established. Notably, no effect was seen in any subgroup defined by baseline 25(OH)D concentration.',
        evidenceSource:
          'Hahn J et al. BMJ 2022;376:e066452; Jolliffe DA et al. Lancet Diabetes Endocrinol 2021;9:276-292',
        doi: '10.1136/bmj-2021-066452',
        measuredMetric:
          'Medical-record-confirmed incident autoimmune disease; proportion of participants with one or more acute respiratory infections',
        auditFlag: 'verified',
      },
      {
        id: 'vd3-a8',
        category: 'inferred',
        title: 'The observational case rests on a marker that falls when you are ill',
        laymanSummary:
          'Low vitamin D is associated with almost every disease studied. That is partly because being ill, inactive, obese or indoors lowers your vitamin D — not the other way round.',
        technicalDetails:
          '25-hydroxyvitamin D is an acute-phase reactant that falls during systemic inflammation, is sequestered in adipose tissue so falls with obesity, and falls with reduced outdoor activity, which is itself a consequence of most chronic disease. That makes reverse causation and confounding the default explanation for any observational vitamin D association until a randomised trial says otherwise. The D2d trial supplies the cleanest worked example: 2,423 adults with prediabetes randomised to 4000 IU/day, an amount well above what observational data implied was needed, with a hazard ratio for progression to diabetes of 0.88 (95% CI 0.75 to 1.04, P = 0.12) — the direction observational work predicted, the magnitude it predicted, and not statistically significant.',
        evidenceSource: 'Pittas AG et al. (D2d Research Group). N Engl J Med 2019;381:520-530',
        doi: '10.1056/NEJMoa1900906',
        inferredClaim:
          'That the very large body of observational associations between low 25-hydroxyvitamin D and disease reflects vitamin D causing the disease rather than the disease lowering vitamin D',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Made in skin or swallowed, and inert either way',
        laymanDesc:
          'Ultraviolet light splits a cholesterol relative in the skin to make vitamin D3, and a capsule supplies the same molecule. Neither does anything yet.',
        molecularDetail:
          'UVB at 290 to 315 nm opens the B ring of 7-dehydrocholesterol to previtamin D3, which thermally isomerises to cholecalciferol. The reaction is self-limiting: continued irradiation converts previtamin D3 to inert lumisterol and tachysterol, so cutaneous synthesis cannot cause toxicity. Oral cholecalciferol is absorbed with dietary fat into chylomicrons and reaches the liver bound to vitamin D binding protein.',
        iconName: 'Sparkles',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The liver adds the first hydroxyl, creating the storage form',
        laymanDesc:
          'The liver converts it into the form that circulates for weeks and that a blood test measures. This is still not the active hormone.',
        molecularDetail:
          'Hepatic CYP2R1, with minor contributions from CYP27A1, 25-hydroxylates cholecalciferol to 25-hydroxyvitamin D3. This step is only loosely regulated, which is why serum 25(OH)D tracks intake and why it is the status marker, with a circulating half-life of two to three weeks against hours for the active hormone.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The kidney adds the second, tightly controlled, hydroxyl',
        laymanDesc:
          'The kidney makes the final active hormone, and it does this only when parathyroid hormone tells it to. That control step is why swallowing more does not simply produce more hormone.',
        molecularDetail:
          'Renal proximal tubule CYP27B1 1-alpha-hydroxylates 25(OH)D3 to 1,25-dihydroxyvitamin D3. It is upregulated by parathyroid hormone and suppressed by FGF23 and by the product itself, while CYP24A1 simultaneously inactivates both substrate and product to 24,25- and 1,24,25-forms. The whole step is a homeostat, and a homeostat is exactly the kind of system that flattens a supplement dose-response.',
        iconName: 'Gauge',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The hormone binds a nuclear receptor and turns on calcium transport genes',
        laymanDesc:
          'The finished hormone slots into a receptor inside the cell nucleus, which then switches on the genes the intestine needs to pull calcium out of food.',
        molecularDetail:
          '1,25-dihydroxyvitamin D3 binds the vitamin D receptor, which heterodimerises with retinoid X receptor and occupies vitamin D response elements. Induced genes include TRPV6 (apical calcium entry), CALB1 (cytosolic calcium ferrying), ATP2B1 (basolateral extrusion) and CYP24A1 (its own catabolism). The receptor is expressed in far more tissues than intestine and bone, which is the origin of essentially every extra-skeletal hypothesis on this page.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Calcium absorption rises, parathyroid hormone falls, bone mineralises',
        laymanDesc:
          'With calcium absorption restored, the parathyroid glands stop stripping the skeleton, and new bone mineralises properly. That is the whole demonstrated benefit.',
        molecularDetail:
          'Restored intestinal calcium absorption raises ionised calcium, suppressing PTH secretion through the calcium-sensing receptor and halting osteoclastic resorption. Chapuy measured this directly: PTH fell 44% and femoral bone density rose 2.7% against a 4.6% fall on placebo. Where baseline PTH is already normal, as in VITAL and D-Health, there is no secondary hyperparathyroidism to suppress and no measured benefit follows.',
        iconName: 'Bone',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Chapuy 1992 (Decalyos) — vitamin D3 800 IU plus calcium in elderly women',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 3270,
        primaryEndpoint: 'Radiologically confirmed hip and nonvertebral fractures over 18 months',
        endpointMet: true,
        statisticalPValue: 'P = 0.043 for hip fracture (43% lower); P = 0.015 for nonvertebral fracture',
        unreportedAdverseSignals:
          'Vitamin D3 was given with 1.2 g of elemental calcium, so the trial cannot separate the two. Mean age was 84 and participants were institutionalised with baseline secondary hyperparathyroidism.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'NCT01169259 — VITAL, vitamin D3 2000 IU/day for cancer and cardiovascular disease',
        phase: 'Phase 3',
        sampleSize: 25871,
        primaryEndpoint: 'Invasive cancer of any type, and major cardiovascular events',
        endpointMet: false,
        statisticalPValue: 'Cancer HR 0.96 (0.88-1.06), P = 0.47; major CVD HR 0.97 (0.85-1.12), P = 0.69',
        unreportedAdverseSignals:
          'No excess hypercalcaemia or other adverse events. Participants were not selected for vitamin D deficiency, so the trial answers the general-population question rather than the deficiency question.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT01704859 — VITAL fracture ancillary',
        phase: 'Phase 3 ancillary',
        sampleSize: 25871,
        primaryEndpoint: 'Incident total, nonvertebral and hip fractures, centrally adjudicated',
        endpointMet: false,
        statisticalPValue: 'Total HR 0.98 (0.89-1.08) P = 0.70; hip HR 1.01 (0.70-1.47) P = 0.96',
        unreportedAdverseSignals:
          'No effect modification by baseline 25(OH)D, age, sex, race or BMI — the subgroup that a null vitamin D trial is usually rescued by was looked for and was absent.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ACTRN12613000743763 — D-Health, 60,000 IU monthly for mortality',
        phase: 'Phase 3',
        sampleSize: 21315,
        primaryEndpoint: 'All-cause mortality over five years',
        endpointMet: false,
        statisticalPValue: 'HR 1.04 (95% CI 0.93-1.18), P = 0.47',
        unreportedAdverseSignals:
          'Cancer mortality HR 1.15 (0.96-1.39); excluding the first two years of follow-up, 1.24 (1.01-1.54), P = 0.05. The authors invoked the precautionary principle against this regimen in replete people.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT01745263 — DO-HEALTH, vitamin D3, omega-3 and exercise in older adults',
        phase: 'Phase 3',
        sampleSize: 2157,
        primaryEndpoint:
          'Six co-primary endpoints: systolic and diastolic blood pressure, SPPB, MoCA, nonvertebral fractures, infection rate',
        endpointMet: false,
        statisticalPValue: 'No endpoint reached the prespecified P < .01 with 99% confidence intervals',
        unreportedAdverseSignals:
          'A three-way factorial design across eight arms means each pairwise comparison is modestly powered, but no endpoint showed a signal in any direction.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT01900860 — Calgary dose-ranging trial of volumetric bone density',
        phase: 'Randomised double-blind dose-comparison',
        sampleSize: 311,
        primaryEndpoint:
          'Total volumetric bone mineral density and bone strength at radius and tibia over three years',
        endpointMet: false,
        statisticalPValue:
          'Radial vBMD change -1.2% (400 IU), -2.4% (4000 IU), -3.5% (10,000 IU); no significant difference in failure load',
        unreportedAdverseSignals:
          'The higher doses were significantly worse than 400 IU on the co-primary density endpoint. Bone strength did not differ, so the clinical meaning of the density loss is unsettled.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Vitamin D3 with calcium cut hip fractures 43% in 84-year-old institutionalised women with secondary hyperparathyroidism',
        'Serum 25-hydroxyvitamin D rises reliably and dose-dependently on supplementation, to 115 nmol/L on monthly dosing in D-Health',
        'Parathyroid hormone falls 44% and femoral bone density rises when deficiency is corrected',
        'Incident autoimmune disease fell 22% over 5.3 years in VITAL (HR 0.78, 0.61-0.99)',
        'A small reduction in acute respiratory infection across 46 trials and 75,541 participants (OR 0.92, 0.86-0.99)',
      ],
      unsupportedInferences: [
        'That vitamin D prevents cancer — 25,871 randomised participants, HR 0.96, P = 0.47',
        'That it prevents cardiovascular events — same trial, HR 0.97, P = 0.69',
        'That it prevents fractures in the general population — HR 0.98 total, 1.01 hip, with no subgroup effect by baseline level',
        'That it reduces mortality — 21,315 randomised participants, HR 1.04',
        'That the enormous observational literature reflects causation rather than 25(OH)D falling with illness, obesity and inactivity',
      ],
      whatFailedInitially: [
        'The "the dose was too low" defence: 500,000 IU annually increased falls and fractures, and three years at 4000 or 10,000 IU daily lowered radial bone density dose-dependently',
        'Assay comparability, which was bad enough that the Vitamin D Standardization Program had to be created and which contaminates the older prevalence literature',
        'The prediabetes hypothesis: D2d found HR 0.88 (0.75-1.04) at 4000 IU/day, in the predicted direction and not significant',
      ],
      realWorldOutcome: [
        'Vitamin D remains a genuine treatment for a genuine deficiency disease, and food fortification is one of the most successful public health interventions ever run',
        'For a replete adult buying it for cancer, heart disease, fractures or longevity, the randomised answer is now available and it is no',
        'The two survivors — autoimmune disease and respiratory infection — are modest, and the respiratory effect was not modified by baseline vitamin D status, which is difficult to reconcile with a repletion mechanism',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule, softgel, tablet or oil drops, cholecalciferol (D3) or ergocalciferol (D2)',
      description:
        'Sold in the United States as a dietary supplement under DSHEA with no premarket efficacy review, and simultaneously present as a mandatory or voluntary fortificant in milk, cereal and margarine in most industrialised countries. D3 raises and maintains serum 25(OH)D more effectively than D2. It is fat-soluble, so absorption depends on a fat-containing meal and on intact bile flow.',
      safetyProfile:
        'At ordinary intakes, well tolerated: VITAL found no excess hypercalcaemia at 2000 IU/day across 25,871 participants over five years. The risks appear at the extremes and in intermittent dosing. A single 500,000 IU annual dose increased falls (RR 1.15) and fractures (RR 1.26). Three years at 4000 or 10,000 IU daily lowered radial bone density dose-dependently. True toxicity — hypercalcaemia, hypercalciuria, nephrocalcinosis — requires sustained very high intake or a CYP24A1 loss-of-function mutation, and cannot be caused by sunlight, because cutaneous synthesis is self-limiting.',
    },
    commonQuestions: [
      {
        q: 'Vitamin D is essential, so how can the trials be negative?',
        a: 'Because "essential" and "beneficial as a supplement" are different claims, and this page keeps them apart deliberately. Vitamin D deficiency causes rickets and osteomalacia, and correcting it works — Chapuy cut hip fractures 43% in deficient 84-year-olds. Adding more to someone who already has enough is a separate question, and when it was asked in 25,871 people for cancer and heart disease, in 25,871 for fractures and in 21,315 for death, every answer came back null. The nutrient is essential. The extra capsule, in a replete person, is not doing what the bottle implies.',
        auditNote:
          'A deficiency effect is not a supplement effect. This confusion built the entire category.',
      },
      {
        q: 'Were the trials just underdosed?',
        a: 'That was the standard objection for about a decade, and it has been tested. A single annual 500,000 IU dose produced more falls and more fractures than placebo, with the excess concentrated in the three months after dosing. Three years of 4000 or 10,000 IU daily lowered radial bone density in a dose-dependent way against 400 IU. D-Health reached serum levels of 115 nmol/L, comfortably in the range advocates argue for, and found a mortality hazard ratio of 1.04. The dose-response above repletion is flat at best and, in the intermittent high-dose trials, points the wrong way.',
      },
      {
        q: 'Should I get my level tested?',
        a: 'That is a clinical decision this page will not make for you, but the evidence does say why the number matters: it is the only thing separating the population where vitamin D reliably works from the population where it reliably does not. Bear in mind that assay standardisation was poor enough historically that the Vitamin D Standardization Program was created to fix it, and that the C3-epimer can inflate a result on a method that does not resolve it. A number is only as good as the laboratory that produced it.',
      },
      {
        q: 'Did anything positive survive?',
        a: 'Two things, and they should be stated as plainly as the failures. Incident autoimmune disease fell 22% over 5.3 years in VITAL, hazard ratio 0.78 with a confidence interval reaching 0.99 — a real but borderline result from an ancillary endpoint. And a meta-analysis of 46 trials in 75,541 people found a small reduction in acute respiratory infections, odds ratio 0.92. Both deserve replication and neither is what most vitamin D is bought for.',
        auditNote:
          'The respiratory effect showed no subgroup difference by baseline 25(OH)D, which is hard to square with a straightforward repletion mechanism.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Chapuy MC et al. Vitamin D3 and calcium to prevent hip fractures in elderly women. N Engl J Med 1992;327:1637-1642',
        identifier: '10.1056/NEJM199212033272305',
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
          'Manson JE et al. Vitamin D supplements and prevention of cancer and cardiovascular disease. N Engl J Med 2019;380:33-44',
        identifier: '10.1056/NEJMoa1809944',
        kind: 'doi',
      },
      {
        label: 'VITAL trial registration — vitamin D and omega-3 for cancer and cardiovascular disease',
        identifier: 'NCT01169259',
        kind: 'nct',
      },
      {
        label:
          'LeBoff MS et al. Supplemental vitamin D and incident fractures in midlife and older adults. N Engl J Med 2022;387:299-309',
        identifier: '10.1056/NEJMoa2202106',
        kind: 'doi',
      },
      {
        label: 'VITAL fracture ancillary trial registration',
        identifier: 'NCT01704859',
        kind: 'nct',
      },
      {
        label:
          'Neale RE et al. The D-Health Trial: a randomised controlled trial of the effect of vitamin D on mortality. Lancet Diabetes Endocrinol 2022;10:120-128',
        identifier: '10.1016/S2213-8587(21)00345-4',
        kind: 'doi',
      },
      {
        label:
          'Bischoff-Ferrari HA et al. Effect of vitamin D supplementation, omega-3 fatty acid supplementation, or a strength-training exercise program on clinical outcomes in older adults: the DO-HEALTH randomized clinical trial. JAMA 2020;324:1855-1868',
        identifier: '10.1001/jama.2020.16909',
        kind: 'doi',
      },
      {
        label: 'DO-HEALTH trial registration',
        identifier: 'NCT01745263',
        kind: 'nct',
      },
      {
        label:
          'Burt LA et al. Effect of high-dose vitamin D supplementation on volumetric bone density and bone strength: a randomized clinical trial. JAMA 2019;322:736-745',
        identifier: '10.1001/jama.2019.11889',
        kind: 'doi',
      },
      {
        label: 'Calgary vitamin D dose-ranging bone density trial registration',
        identifier: 'NCT01900860',
        kind: 'nct',
      },
      {
        label:
          'Pittas AG et al. Vitamin D supplementation and prevention of type 2 diabetes (D2d). N Engl J Med 2019;381:520-530',
        identifier: '10.1056/NEJMoa1900906',
        kind: 'doi',
      },
      {
        label:
          'Hahn J et al. Vitamin D and marine omega 3 fatty acid supplementation and incident autoimmune disease: VITAL randomized controlled trial. BMJ 2022;376:e066452',
        identifier: '10.1136/bmj-2021-066452',
        kind: 'doi',
      },
      {
        label:
          'Jolliffe DA et al. Vitamin D supplementation to prevent acute respiratory infections: a systematic review and meta-analysis of aggregate data from randomised controlled trials. Lancet Diabetes Endocrinol 2021;9:276-292',
        identifier: '10.1016/S2213-8587(21)00051-6',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 5280795 — Cholecalciferol',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280795',
        kind: 'url',
      },
    ],
  },
]
