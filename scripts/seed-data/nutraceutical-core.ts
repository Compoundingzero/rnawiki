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
]
