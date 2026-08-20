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
  // ---------------------------------------------------------------------------------------------
  // Omega-3 EPA and DHA — REDUCE-IT against STRENGTH, and the possibility that a large part of the
  // difference was what the placebo capsule contained.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'omega-3-epa-dha',
    name: 'Omega-3 EPA and DHA',
    tradeName:
      'Sold as fish oil, cod liver oil, krill oil and algal oil. The prescription esters are separate approved drugs: Vascepa (icosapent ethyl) and Lovaza (omega-3-acid ethyl esters).',
    sponsor:
      'No single sponsor for the supplement. The two decisive outcome trials were funded by Amarin Pharma (REDUCE-IT) and AstraZeneca (STRENGTH).',
    targetGene: 'PPARA',
    targetProtein:
      'Peroxisome proliferator-activated receptor alpha, through which EPA and DHA raise hepatic fatty acid oxidation and lower VLDL output. A second, separate action is substrate competition with arachidonic acid at cyclooxygenase and 5-lipoxygenase, shifting eicosanoid output toward the series-3 and series-5 products.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for heart, brain and joint health. The supplement has no approved indication. Icosapent ethyl and omega-3-acid ethyl esters are separately FDA-approved prescription drugs for severe hypertriglyceridaemia, and icosapent ethyl additionally for cardiovascular risk reduction — those approvals belong to the drugs, not to the fish oil aisle.',
    patientFriendlyIndication: 'Taken for the heart; one prescription version has outcome data, the tub does not',
    conditionContext: {
      conditionExplainer:
        'Triglycerides are the fat the liver packages into VLDL particles and sends into the blood. High triglycerides travel with small dense LDL, low HDL and inflammation, and that whole cluster tracks cardiovascular risk. EPA and DHA are long-chain omega-3 fatty acids that reduce hepatic triglyceride output and get built into cell membranes, changing the raw material available for making inflammatory signalling molecules.',
      whyItMatters:
        'This is one of the sharpest natural experiments in modern cardiology. Two trials of roughly 4 g/day of purified omega-3 in statin-treated patients with high triglycerides ran at almost the same time. One reported a 25% relative risk reduction. The other was stopped for futility with a hazard ratio of 0.99. The trials differed in the omega-3 preparation and in the placebo, and the argument about which difference mattered is still live.',
      whoTakesThis:
        'Enormous numbers of people buying it over the counter for general heart and brain health, plus patients prescribed icosapent ethyl specifically for residual risk on a statin with triglycerides above 135 mg/dL.',
      clinicalGoals:
        'The trials measured a composite of cardiovascular death, myocardial infarction, stroke, revascularisation and unstable angina; and separately serum triglycerides, LDL cholesterol, C-reactive protein and the erythrocyte omega-3 content.',
    },
    oneSentenceVerdict:
      'The over-the-counter product has been tested for cardiovascular prevention at 1 g/day in more than 40,000 randomised participants and failed; the one strongly positive trial used a 4 g/day prescription EPA ester against a mineral oil comparator whose own inflammatory markers rose 20 to 49%, and its sister trial against corn oil found nothing.',
    laymanHowItWorks:
      'EPA and DHA are fats that get built into the membrane of every cell, partly displacing the omega-6 fat that the body normally uses as raw material for inflammatory signals. In the liver they reduce how much triglyceride is packaged and exported. Both effects are real and measurable in blood. Whether either translates into fewer heart attacks is the question the two big trials answered differently.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 48,
    anatomicalSite:
      'Hepatocyte endoplasmic reticulum (VLDL assembly), and the phospholipid bilayer of every cell membrane',
    substitutes: {
      summary:
        'For cardiovascular prevention the comparison is unflattering: statins, ezetimibe and PCSK9 inhibitors all have unambiguous outcome data and over-the-counter fish oil does not. For raising the blood omega-3 content, oily fish does the same thing the capsule does, and it is what the observational literature that started all of this was actually measuring.',
      conventionalRx: [
        {
          name: 'Icosapent ethyl (Vascepa)',
          class: 'Purified EPA ethyl ester, prescription',
          howItCompares:
            'The same fatty acid at four times the supplement amount, in a form containing no DHA. It is the only omega-3 preparation with a positive cardiovascular outcome trial, and that trial\'s comparator was pharmaceutical grade mineral oil rather than an inert placebo. It is a different product from a fish oil capsule and its result should not be read onto one.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: a randomised 25% relative risk reduction in a prespecified composite. Cons: significantly more hospitalisation for atrial fibrillation or flutter (3.1% versus 2.1%, P = 0.004) and a comparator that is still argued about.',
        },
        {
          name: 'Statins, ezetimibe, PCSK9 inhibitors',
          class: 'LDL-lowering therapy',
          howItCompares:
            'Every patient in REDUCE-IT and STRENGTH was already on a statin, so omega-3 was being tested as an addition, not an alternative. LDL-lowering therapy has repeated, independent, placebo-controlled outcome trials; omega-3 has one positive trial with a contested comparator and several clearly null ones.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: the largest and most consistently replicated cardiovascular evidence base in medicine. Cons: muscle symptoms in a minority; no effect on triglycerides comparable to 4 g of EPA.',
        },
        {
          name: 'Fibrates',
          class: 'PPAR-alpha agonists',
          howItCompares:
            'Reach the same nuclear receptor as EPA and DHA and lower triglycerides more, which makes them the natural test of whether triglyceride lowering per se prevents events. Their outcome record on top of a statin has been largely negative, which is itself evidence against a purely triglyceride-mediated explanation for REDUCE-IT.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: large triglyceride reductions. Cons: myopathy risk with statins, raised creatinine, and no convincing add-on outcome benefit.',
        },
      ],
      naturalFoods: [
        {
          name: 'Oily fish — salmon, mackerel, sardines, herring, anchovies',
          activeCompound: 'EPA (20:5 n-3) and DHA (22:6 n-3) as triacylglycerols and phospholipids',
          biologicalMechanism:
            'The same two fatty acids in the matrix the epidemiology was built on. Fish also displaces other foods from the plate, which is a confound no capsule trial can reproduce and a plausible reason the observational signal is larger than the randomised one.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale, the GISSI-Prevenzione trial used 1 g/day of n-3 ethyl esters, and VITAL and ASCEND both used 1 g/day capsules.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Algal oil',
          activeCompound: 'DHA, with some EPA, from Schizochytrium or Crypthecodinium cultures',
          biologicalMechanism:
            'The original source of the marine omega-3s — fish accumulate them from algae rather than synthesising them. Algal oil raises the erythrocyte omega-3 content by the same route without the marine food chain, and therefore without the oxidation and contaminant profile of a fish-derived oil.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Alpha-linolenic acid from flaxseed, chia and walnuts',
          activeCompound: 'ALA (18:3 n-3)',
          biologicalMechanism:
            'The plant omega-3 is not a substitute for the marine ones in any practical sense. Conversion of ALA to EPA is limited and conversion onward to DHA is very low in adults, so ALA intake barely moves the erythrocyte EPA and DHA content that all of the cardiovascular literature is indexed to.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask what the control capsule contained',
          action:
            'For any omega-3 outcome trial, look up the comparator before reading the hazard ratio. REDUCE-IT used mineral oil, STRENGTH used corn oil, ASCEND used olive oil.',
          patientImpact:
            'In the REDUCE-IT biomarker substudy the mineral oil arm\'s interleukin-1 beta rose 28.9%, C-reactive protein 21.9% and LDL cholesterol 10.9% from baseline over 12 months, while the EPA arm barely moved. A treatment effect measured against a comparator that is itself drifting is partly a comparator effect.',
          clinicalPrecaution:
            'Omega-3 supplementation raises the risk of atrial fibrillation in pooled randomised data, hazard ratio 1.25 overall and 1.49 in trials above 1 g/day. Anyone with a history of atrial fibrillation should treat this as a real signal rather than a footnote.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC/C=C\\C/C=C\\C/C=C\\C/C=C\\C/C=C\\CCCC(=O)O',
      chemicalFormula: 'C20H30O2',
      molecularWeight:
        '302.5 g/mol. This is EPA, one of the two marker fatty acids — the product is a mixture, and DHA (C22H32O2, 328.5 g/mol, PubChem CID 445580) is the other. No single structure describes fish oil.',
      structureSource: {
        label:
          'PubChem CID 446284 — Eicosapentaenoic acid, canonical SMILES and computed properties (DHA is CID 445580)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446284',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'om3-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Oxidation state and contaminant screen on the incoming oil',
          description:
            'Polyunsaturated oils oxidise, and an oxidised omega-3 capsule delivers aldehydes rather than intact fatty acids. Measure peroxide value and para-anisidine value and compute the TOTOX index before anything else, alongside the marine contaminants the oil concentrates from the food chain.',
          reagentsAndBuffer:
            'Potassium iodide and sodium thiosulfate for peroxide value; para-anisidine in glacial acetic acid; ICP-MS for mercury, cadmium, lead and arsenic; GC-MS/MS for polychlorinated biphenyls and dioxins',
        },
        {
          id: 'om3-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Transesterification to fatty acid methyl esters',
          description:
            'Fatty acids in an oil or a membrane are bound in glycerolipids and are not volatile. Convert the whole lipid pool to methyl esters under conditions mild enough not to isomerise the cis double bonds, since a trans artefact created in the vial is indistinguishable from one that was in the sample.',
          dependsOnStepId: 'om3-w1',
          reagentsAndBuffer:
            'Boron trifluoride in methanol, or 14% methanolic HCl at 100 degrees C under nitrogen; butylated hydroxytoluene as antioxidant; heptadecanoic acid (C17:0) internal standard',
        },
        {
          id: 'om3-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Silver-ion solid phase extraction to resolve the polyunsaturates',
          description:
            'Separate methyl esters by degree of unsaturation before chromatography. Silver ions form reversible complexes with cis double bonds, so a silver-ion cartridge cleanly resolves the five-double-bond EPA ester from the six-double-bond DHA ester and from the monounsaturated bulk of the sample.',
          dependsOnStepId: 'om3-w2',
          reagentsAndBuffer:
            'Silver-ion SPE cartridges; hexane, hexane/acetone and acetonitrile elution series; EPA and DHA methyl ester reference standards',
        },
        {
          id: 'om3-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Erythrocyte membrane incorporation over the red cell lifespan',
          description:
            'Measure incorporation where it is stable rather than where it is transient. Plasma fatty acids reflect the last meal; the erythrocyte membrane integrates intake over the roughly 120-day red cell lifespan and is what the Omega-3 Index is defined on, so sample at baseline and at three to four months.',
          dependsOnStepId: 'om3-w3',
          reagentsAndBuffer:
            'EDTA whole blood; washed packed erythrocytes; direct transesterification of the washed cell pellet; matched plasma phospholipid fraction as a short-term comparator',
        },
        {
          id: 'om3-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'GC-FID fatty acid profile and Omega-3 Index calculation',
          description:
            'Quantify the complete erythrocyte fatty acid profile by gas chromatography with flame ionisation detection and express EPA plus DHA as a percentage of total identified fatty acids. That percentage is the Omega-3 Index, and it is the only variable that makes a supplement trial and a fish-intake cohort directly comparable.',
          dependsOnStepId: 'om3-w4',
          reagentsAndBuffer:
            'Capillary GC column with a highly polar cyanopropyl stationary phase; flame ionisation detector; GLC reference standard mixture for retention time assignment; arachidonic acid quantified alongside to give the AA to EPA ratio',
        },
      ],
    },
    keyAudits: [
      {
        id: 'om3-a1',
        category: 'measured',
        title: 'REDUCE-IT: a 25% relative risk reduction, in 8,179 statin-treated patients',
        laymanSummary:
          'Four grams a day of a purified prescription form of EPA cut a combined measure of heart attacks, strokes and related events by about a quarter over five years.',
        technicalDetails:
          'A multicentre randomised double-blind placebo-controlled trial in 8,179 statin-treated patients with established cardiovascular disease or diabetes plus risk factors, fasting triglycerides of 135 to 499 mg/dL and LDL-C of 41 to 100 mg/dL, randomised to 2 g of icosapent ethyl twice daily or placebo and followed a median 4.9 years. The primary composite of cardiovascular death, nonfatal myocardial infarction, nonfatal stroke, coronary revascularisation or unstable angina occurred in 17.2% against 22.0%: hazard ratio 0.75 (95% CI 0.68 to 0.83), P < 0.001. The key secondary composite was 11.2% against 14.8%, hazard ratio 0.74 (0.65 to 0.83). Cardiovascular death was 4.3% against 5.2%, hazard ratio 0.80 (0.66 to 0.98), P = 0.03. Hospitalisation for atrial fibrillation or flutter was higher on icosapent ethyl, 3.1% against 2.1%, P = 0.004, and serious bleeding 2.7% against 2.1%, P = 0.06. The trial was funded by Amarin Pharma.',
        evidenceSource: 'Bhatt DL et al. N Engl J Med 2019;380:11-22',
        doi: '10.1056/NEJMoa1812792',
        measuredMetric:
          'Five-point composite of cardiovascular death, MI, stroke, revascularisation and unstable angina over a median 4.9 years',
        auditFlag: 'contested',
      },
      {
        id: 'om3-a2',
        category: 'failed',
        title: 'STRENGTH: the same amount of omega-3, against corn oil, stopped for futility',
        laymanSummary:
          'A trial of the same size and design, testing 4 g a day of an EPA and DHA preparation against corn oil in 13,078 patients, was halted early because it was going nowhere.',
        technicalDetails:
          'A double-blind randomised trial at 675 sites in 22 countries comparing 4 g/day of a carboxylic acid formulation of EPA and DHA with corn oil in 13,078 statin-treated patients with high cardiovascular risk, hypertriglyceridaemia and low HDL-C. It was halted at 1,384 primary events of a planned 1,600 on an interim analysis indicating a low probability of benefit. The primary composite occurred in 785 patients (12.0%) on omega-3 against 795 (12.2%) on corn oil: hazard ratio 0.99 (95% CI 0.90 to 1.09), P = .84. Gastrointestinal adverse events were markedly more common on omega-3, 24.7% against 14.7%. The population, the background therapy, the amount of omega-3 and the endpoint were all close matches to REDUCE-IT. The preparation and the comparator were not.',
        evidenceSource: 'Nicholls SJ et al. JAMA 2020;324:2268-2280',
        doi: '10.1001/jama.2020.22258',
        measuredMetric:
          'Composite of cardiovascular death, nonfatal MI, nonfatal stroke, coronary revascularisation or hospitalised unstable angina',
        auditFlag: 'verified',
      },
      {
        id: 'om3-a3',
        category: 'conclusion_shift',
        title: 'The comparator became the story: mineral oil raised inflammatory markers 20 to 49%',
        laymanSummary:
          'The REDUCE-IT placebo was mineral oil. Blood markers of inflammation rose substantially in the placebo group and barely moved in the treated group, so part of the measured difference is the placebo getting worse rather than the drug making people better.',
        technicalDetails:
          'A REDUCE-IT biomarker substudy measured interleukin-1 beta, interleukin-6, hsCRP, oxidised LDL, homocysteine, lipoprotein(a) and Lp-PLA2 at baseline, 12 and 24 months. Baseline medians were similar between arms. At 12 months the mineral oil arm rose by 1.5% for homocysteine, 2.2% for lipoprotein(a), 10.9% for oxidised LDL, 16.2% for interleukin-6, 18.5% for Lp-PLA2, 21.9% for hsCRP and 28.9% for interleukin-1 beta, all P < 0.001, with similar changes at 24 months. The icosapent ethyl arm showed minimal change. End-of-study between-group differences were therefore largely increases in the comparator: 38.5% for hsCRP and 48.7% for interleukin-1 beta. LDL cholesterol at 12 months changed by -1.2% on icosapent ethyl and +10.9% on mineral oil. Separately, a Copenhagen General Population Study analysis mimicking both trial designs estimated that the comparator difference (mineral versus corn oil) rather than the active oil difference (EPA versus EPA plus DHA) explains a substantial part of the divergence, leaving roughly 13% of REDUCE-IT\'s risk reduction unexplained by lipids and CRP. The authors of the biomarker substudy state the effect on interpretation is uncertain, and this page states it the same way.',
        evidenceSource:
          'Ridker PM et al. Circulation 2022;146:372-379; Doi T, Langsted A, Nordestgaard BG. Eur Heart J 2021;42:4807-4817',
        doi: '10.1161/CIRCULATIONAHA.122.059410',
        inferredClaim:
          'That the whole of REDUCE-IT\'s 25% relative risk reduction is an effect of EPA, when a measurable part of the between-group difference is deterioration in the mineral oil comparator arm',
        auditFlag: 'contested',
      },
      {
        id: 'om3-a4',
        category: 'failed',
        title: 'At 1 g/day — the amount in a supplement — VITAL and ASCEND both found nothing',
        laymanSummary:
          'The amount actually sold over the counter has been tested in more than 41,000 people across two large trials. Neither reduced cardiovascular events.',
        technicalDetails:
          'VITAL randomised 25,871 US adults to 1 g/day marine n-3 or placebo with a median 5.3 years of follow-up: major cardiovascular events in 386 against 419, hazard ratio 0.92 (95% CI 0.80 to 1.06), P = 0.24; invasive cancer 820 against 797, hazard ratio 1.03 (0.93 to 1.13), P = 0.56; death from any cause hazard ratio 1.02 (0.90 to 1.15). A prespecified secondary endpoint, total myocardial infarction, was lower at 0.72 (0.59 to 0.90) — one positive result among many tested, in a trial whose primary endpoints were null. ASCEND randomised 15,480 people with diabetes and no cardiovascular disease to 1 g/day n-3 or olive oil placebo over a mean 7.4 years: serious vascular events in 8.9% against 9.2%, rate ratio 0.97 (95% CI 0.87 to 1.08), P = 0.55, and death from any cause 0.95 (0.86 to 1.05). A Cochrane review of the whole literature reaches the same place.',
        evidenceSource:
          'Manson JE et al. N Engl J Med 2019;380:23-32; ASCEND Study Collaborative Group. N Engl J Med 2018;379:1540-1550',
        doi: '10.1056/NEJMoa1811403',
        measuredMetric:
          'Major cardiovascular events and invasive cancer (VITAL); first serious vascular event (ASCEND)',
        auditFlag: 'verified',
      },
      {
        id: 'om3-a5',
        category: 'measured',
        title: 'Atrial fibrillation rises, and the risk scales with the amount',
        laymanSummary:
          'Pooling seven large trials in 81,210 people, omega-3 supplements raised the risk of an irregular heartbeat by about a quarter, and more so at higher amounts.',
        technicalDetails:
          'A systematic review and meta-analysis of randomised cardiovascular outcome trials of marine omega-3 with at least 500 patients and a median follow-up of at least one year identified seven trials totalling 81,210 patients, mean age 65, weighted average follow-up 4.9 years. Marine omega-3 was associated with an increased risk of atrial fibrillation: hazard ratio 1.25 (95% CI 1.07 to 1.46), P = 0.013. Stratified by amount, trials above 1 g/day gave 1.49 (95% CI 1.04 to 2.15) and trials at or below 1 g/day gave 1.12 (1.03 to 1.22), with P for interaction below 0.001. Meta-regression gave a hazard ratio of 1.11 (1.06 to 1.15) per additional gram per day. This is one of the few adverse effects in the whole supplement category with a dose-response demonstrated across randomised trials.',
        evidenceSource: 'Gencer B et al. Circulation 2021;144:1981-1990',
        doi: '10.1161/CIRCULATIONAHA.121.055654',
        measuredMetric:
          'Incident atrial fibrillation reported as an outcome, adverse event or cause of hospitalisation across seven randomised trials',
        auditFlag: 'caution',
      },
      {
        id: 'om3-a6',
        category: 'conclusion_shift',
        title: 'GISSI-Prevenzione was positive in 1999, and the field could not repeat it',
        laymanSummary:
          'The trial that launched fish oil as cardiac therapy was run before statins were standard care. Nothing since has reproduced it in patients on modern treatment.',
        technicalDetails:
          'GISSI-Prevenzione randomised 11,324 survivors of recent myocardial infarction to 1 g/day n-3 PUFA, vitamin E, both or neither, open-label, and reported a significant reduction in the combined endpoint of death, nonfatal myocardial infarction and stroke with n-3. It was open-label, ran in the late 1990s when statin use in the cohort was low, and used a no-treatment control rather than a placebo. Every large trial since, conducted on a background of statins, revascularisation and modern secondary prevention, has been null at 1 g/day. The most economical reading is not that omega-3 stopped working but that the marginal benefit available on top of untreated 1990s care is not available on top of 2020s care — which is a statement about the counterfactual rather than about the fatty acid.',
        evidenceSource: 'GISSI-Prevenzione Investigators. Lancet 1999;354:447-455',
        doi: '10.1016/S0140-6736(99)07072-5',
        inferredClaim:
          'That a benefit demonstrated against 1990s post-infarction care transfers to a patient already on a statin, an antiplatelet and an ACE inhibitor',
        auditFlag: 'caution',
      },
      {
        id: 'om3-a7',
        category: 'inferred',
        title: 'The Cochrane verdict on the supplement is "little or no difference"',
        laymanSummary:
          'The systematic reviewers who pool everything concluded that long-chain omega-3 supplements make little or no difference to death or cardiovascular events, with high-certainty evidence for mortality.',
        technicalDetails:
          'The Cochrane review of omega-3 fatty acids for primary and secondary prevention of cardiovascular disease pooled the randomised literature and concluded that increasing long-chain omega-3 intake probably makes little or no difference to all-cause mortality, cardiovascular mortality or cardiovascular events, with the evidence for all-cause mortality rated high certainty. It found a small reduction in coronary heart disease mortality and events of uncertain clinical importance, and noted that the evidence for alpha-linolenic acid was weaker still. That conclusion sits against a marketing category whose central promise is heart protection.',
        evidenceSource: 'Abdelhamid AS et al. Cochrane Database Syst Rev 2020;3:CD003177',
        doi: '10.1002/14651858.CD003177.pub5',
        inferredClaim:
          'That an over-the-counter fish oil capsule protects the heart, generalising from the one positive trial of a 4 g prescription EPA ester with a contested comparator',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed with dietary fat, and the chemical form matters',
        laymanDesc:
          'Omega-3 needs fat and bile to be absorbed. The chemical form the capsule uses changes how much actually gets in.',
        molecularDetail:
          'Pancreatic lipase releases the fatty acid from the glycerol backbone before absorption. Natural fish oil is triacylglycerol; most concentrated products are re-esterified ethyl esters, which lipase hydrolyses more slowly and which therefore depend more heavily on a fat-containing meal. Absorbed fatty acids are re-esterified in the enterocyte and enter the lymph in chylomicrons.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Built into cell membranes over weeks, not hours',
        laymanDesc:
          'EPA and DHA slowly replace some of the omega-6 fat in the membrane of every cell. It takes months for the blood measure to stabilise.',
        molecularDetail:
          'EPA and DHA are incorporated into membrane phospholipids at the sn-2 position, partly displacing arachidonic acid. Because the erythrocyte does not remodel its membrane after leaving the marrow, erythrocyte EPA plus DHA — the Omega-3 Index — integrates intake over the roughly 120-day red cell lifespan and is the stable exposure marker the field uses.',
        iconName: 'Layers',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The liver exports less triglyceride',
        laymanDesc:
          'In the liver, omega-3 switches on fat-burning genes and reduces how much triglyceride gets packaged and shipped out into the blood.',
        molecularDetail:
          'EPA and DHA are ligands for PPAR-alpha, raising transcription of the mitochondrial and peroxisomal beta-oxidation machinery, while suppressing SREBP-1c-driven lipogenesis and reducing diacylglycerol acyltransferase substrate supply. The net effect is reduced hepatic VLDL-triglyceride assembly and secretion. This is the best-characterised and least disputed action, and it is the basis of the approved hypertriglyceridaemia indication.',
        iconName: 'TrendingDown',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The raw material for inflammatory signals changes',
        laymanDesc:
          'Enzymes that normally turn omega-6 fat into strong inflammatory signals start finding omega-3 in their way, and produce weaker ones instead.',
        molecularDetail:
          'EPA competes with arachidonic acid at cyclooxygenase-1 and -2 and at 5-lipoxygenase, shifting output from series-2 prostaglandins and series-4 leukotrienes toward the less inflammatory series-3 and series-5 products. EPA and DHA are also substrates for the specialised pro-resolving mediators — resolvins, protectins and maresins — which act on resolution rather than suppression of inflammation.',
        iconName: 'Combine',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Triglycerides fall reliably; events fall only in one trial',
        laymanDesc:
          'The blood fat measurement comes down every time. Whether that prevents heart attacks is where the two big trials disagree.',
        molecularDetail:
          'Triglyceride lowering at 4 g/day is consistent across preparations, and STRENGTH achieved it while producing a hazard ratio of 0.99 for events. That dissociation is the strongest available argument that whatever REDUCE-IT measured was not simply triglyceride reduction — and it is equally consistent with the alternative explanation that the difference lay in the comparator.',
        iconName: 'HeartPulse',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT01492361 — REDUCE-IT, icosapent ethyl 4 g/day versus mineral oil',
        phase: 'Phase 3',
        sampleSize: 8179,
        primaryEndpoint:
          'Composite of cardiovascular death, nonfatal MI, nonfatal stroke, coronary revascularisation or unstable angina',
        endpointMet: true,
        statisticalPValue: 'HR 0.75 (95% CI 0.68-0.83), P < 0.001',
        unreportedAdverseSignals:
          'Hospitalisation for atrial fibrillation or flutter 3.1% versus 2.1% (P = 0.004); serious bleeding 2.7% versus 2.1% (P = 0.06). The comparator was pharmaceutical grade mineral oil, in which inflammatory biomarkers and LDL-C rose substantially over follow-up. Funded by Amarin Pharma.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NCT02104817 — STRENGTH, omega-3 carboxylic acids 4 g/day versus corn oil',
        phase: 'Phase 3',
        sampleSize: 13078,
        primaryEndpoint:
          'Composite of cardiovascular death, nonfatal MI, nonfatal stroke, coronary revascularisation or hospitalised unstable angina',
        endpointMet: false,
        statisticalPValue: 'HR 0.99 (95% CI 0.90-1.09), P = .84',
        unreportedAdverseSignals:
          'Halted early for futility at 1,384 of a planned 1,600 events. Gastrointestinal adverse events 24.7% versus 14.7%. Funded by AstraZeneca.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'NCT01169259 — VITAL n-3 arm, 1 g/day marine omega-3',
        phase: 'Phase 3',
        sampleSize: 25871,
        primaryEndpoint: 'Major cardiovascular events, and invasive cancer of any type',
        endpointMet: false,
        statisticalPValue: 'CVD HR 0.92 (0.80-1.06), P = 0.24; cancer HR 1.03 (0.93-1.13), P = 0.56',
        unreportedAdverseSignals:
          'A secondary endpoint, total myocardial infarction, was lower at HR 0.72 (0.59-0.90). It is one positive result among many secondary endpoints in a trial whose primary endpoints were null, and it has not been independently confirmed.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00135226 — ASCEND, 1 g/day n-3 versus olive oil in diabetes',
        phase: 'Phase 4',
        sampleSize: 15480,
        primaryEndpoint:
          'First serious vascular event: nonfatal MI or stroke, transient ischaemic attack, or vascular death',
        endpointMet: false,
        statisticalPValue: 'Rate ratio 0.97 (95% CI 0.87-1.08), P = 0.55',
        unreportedAdverseSignals:
          'Mean follow-up 7.4 years with 76% adherence. No significant between-group difference in nonfatal serious adverse events. The placebo was olive oil, which is not inert either, though no biomarker drift comparable to mineral oil has been reported for it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'GISSI-Prevenzione — 1 g/day n-3 PUFA after myocardial infarction',
        phase: 'Open-label randomised',
        sampleSize: 11324,
        primaryEndpoint: 'Combined death, nonfatal myocardial infarction and nonfatal stroke',
        endpointMet: true,
        statisticalPValue: 'Significant reduction in the combined endpoint with n-3 PUFA',
        unreportedAdverseSignals:
          'Open-label with a no-treatment control rather than a placebo, conducted before statins were standard secondary prevention. The vitamin E arm in the same trial showed no benefit.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Serum triglycerides fall reliably at 4 g/day across preparations, which is the basis of the approved prescription indication',
        'Erythrocyte EPA and DHA content rises measurably and stably over about three months of intake',
        'REDUCE-IT: a composite event rate of 17.2% against 22.0%, hazard ratio 0.75, in 8,179 statin-treated patients over 4.9 years',
        'Inflammatory biomarkers rose 16 to 29% over 12 months in the REDUCE-IT mineral oil comparator arm while barely moving on icosapent ethyl',
        'Atrial fibrillation risk rose across seven trials in 81,210 patients, hazard ratio 1.25, with a demonstrated dose-response',
      ],
      unsupportedInferences: [
        'That an over-the-counter fish oil capsule reduces cardiovascular events — 1 g/day was null in VITAL (n = 25,871) and ASCEND (n = 15,480)',
        'That REDUCE-IT\'s result is wholly attributable to EPA, when part of the between-group difference is deterioration in the comparator arm',
        'That triglyceride lowering is the mechanism, when STRENGTH lowered triglycerides and produced a hazard ratio of 0.99',
        'That the observational fish-intake literature transfers to a capsule, when eating fish also displaces other food',
      ],
      whatFailedInitially: [
        'STRENGTH, halted for futility at 13,078 patients despite matching REDUCE-IT on population, background therapy and amount',
        'The assumption that mineral oil was an inert comparator, which the REDUCE-IT biomarker substudy directly contradicted',
        'Reproduction of GISSI-Prevenzione, which has not succeeded in any trial conducted on a background of modern secondary prevention',
      ],
      realWorldOutcome: [
        'One prescription preparation carries a positive outcome trial; the supplement carries two large null ones at the amount actually sold',
        'The atrial fibrillation signal is real, dose-dependent and materially under-communicated at the point of sale',
        'Cochrane rates the evidence that omega-3 supplements do not change all-cause mortality as high certainty',
      ],
    },
    deliverySystem: {
      type: 'Oral softgel or liquid — triacylglycerol fish oil, re-esterified ethyl esters, krill phospholipids or algal oil',
      description:
        'Sold in the United States as a dietary supplement under DSHEA with no premarket efficacy review, in forms that differ substantially in EPA and DHA content, chemical form and absorption. The prescription products are a different regulatory category entirely, and the outcome trial that supports one of them used 4 g/day of a DHA-free EPA ester, which no over-the-counter fish oil capsule matches.',
      safetyProfile:
        'Common: fishy eructation, gastrointestinal upset — 24.7% against 14.7% on corn oil in STRENGTH. Established: increased atrial fibrillation, hazard ratio 1.25 across randomised trials and 1.49 above 1 g/day. Possible: a non-significant excess of serious bleeding in REDUCE-IT (2.7% against 2.1%, P = 0.06). Polyunsaturated oils oxidise, and marketed products vary in peroxide value; oxidised oil is a plausible explanation for some tolerability complaints. Fish-derived oils concentrate methylmercury and persistent organic pollutants from the food chain, which is why the contaminant screen is the first step of the workflow above.',
    },
    commonQuestions: [
      {
        q: 'Does fish oil protect your heart or not?',
        a: 'The honest answer depends entirely on which product and which amount. At the 1 g/day found in an ordinary capsule, two trials totalling over 41,000 people found no reduction in cardiovascular events, and Cochrane rates the mortality evidence as high-certainty no effect. At 4 g/day of a purified prescription EPA ester, REDUCE-IT found a 25% relative reduction — and its sister trial STRENGTH, using 4 g/day of an EPA and DHA preparation against corn oil, found nothing at all. Buying a supplement on the strength of REDUCE-IT means generalising from a different molecule at four times the amount against a comparator that is still argued about.',
        auditNote:
          'The gap between "there is a positive omega-3 outcome trial" and "the tub on the shelf works" is the whole audit on this page.',
      },
      {
        q: 'What is the problem with mineral oil?',
        a: 'A placebo is supposed to do nothing. In the REDUCE-IT biomarker substudy the mineral oil group\'s interleukin-1 beta rose 28.9%, hsCRP 21.9%, oxidised LDL 10.9% and LDL cholesterol 10.9% over twelve months, while the treated group barely moved. That means part of the measured difference between the groups is the comparator getting worse rather than the treatment making people better. Nobody has established how much. The substudy authors say the effect on interpretation is uncertain, and a Copenhagen cohort analysis mimicking both trials attributed a substantial share of the REDUCE-IT versus STRENGTH divergence to the comparator rather than the active oil, leaving about 13% unexplained.',
      },
      {
        q: 'Is there anything to worry about?',
        a: 'One thing, and it is well established rather than speculative. Across seven randomised cardiovascular outcome trials in 81,210 patients, omega-3 supplementation raised the risk of atrial fibrillation, hazard ratio 1.25, rising to 1.49 in trials using more than 1 g/day, with a per-gram dose-response. REDUCE-IT itself found more hospitalisation for atrial fibrillation or flutter on treatment. For most people this is a small absolute risk; for someone with a history of atrial fibrillation it is the most relevant fact on the page.',
        auditNote:
          'A demonstrated randomised dose-response for harm is rare in this category and deserves the same weight as a demonstrated benefit.',
      },
      {
        q: 'Why does eating fish look better than taking capsules?',
        a: 'Partly because of what fish displaces. A cohort that eats more fish eats less of something else, exercises differently and differs in a hundred unmeasured ways, and no capsule trial reproduces any of that. Partly because plant omega-3 does not substitute: conversion of alpha-linolenic acid to EPA is limited and to DHA is very low in adults, so flaxseed barely moves the blood measure that the cardiovascular literature is indexed to. The capsule delivers the molecule; the diet delivered the association.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'GISSI-Prevenzione Investigators. Dietary supplementation with n-3 polyunsaturated fatty acids and vitamin E after myocardial infarction. Lancet 1999;354:447-455',
        identifier: '10.1016/S0140-6736(99)07072-5',
        kind: 'doi',
      },
      {
        label:
          'ASCEND Study Collaborative Group. Effects of n-3 fatty acid supplements in diabetes mellitus. N Engl J Med 2018;379:1540-1550',
        identifier: '10.1056/NEJMoa1804989',
        kind: 'doi',
      },
      {
        label: 'ASCEND trial registration',
        identifier: 'NCT00135226',
        kind: 'nct',
      },
      {
        label:
          'Bhatt DL et al. Cardiovascular risk reduction with icosapent ethyl for hypertriglyceridemia (REDUCE-IT). N Engl J Med 2019;380:11-22',
        identifier: '10.1056/NEJMoa1812792',
        kind: 'doi',
      },
      {
        label: 'REDUCE-IT trial registration',
        identifier: 'NCT01492361',
        kind: 'nct',
      },
      {
        label:
          'Manson JE et al. Marine n-3 fatty acids and prevention of cardiovascular disease and cancer (VITAL). N Engl J Med 2019;380:23-32',
        identifier: '10.1056/NEJMoa1811403',
        kind: 'doi',
      },
      {
        label:
          'Abdelhamid AS et al. Omega-3 fatty acids for the primary and secondary prevention of cardiovascular disease. Cochrane Database Syst Rev 2020;3:CD003177',
        identifier: '10.1002/14651858.CD003177.pub5',
        kind: 'doi',
      },
      {
        label:
          'Nicholls SJ et al. Effect of high-dose omega-3 fatty acids vs corn oil on major adverse cardiovascular events in patients at high cardiovascular risk: the STRENGTH randomized clinical trial. JAMA 2020;324:2268-2280',
        identifier: '10.1001/jama.2020.22258',
        kind: 'doi',
      },
      {
        label: 'STRENGTH trial registration',
        identifier: 'NCT02104817',
        kind: 'nct',
      },
      {
        label:
          'Gencer B et al. Effect of long-term marine omega-3 fatty acids supplementation on the risk of atrial fibrillation in randomized controlled trials of cardiovascular outcomes: a systematic review and meta-analysis. Circulation 2021;144:1981-1990',
        identifier: '10.1161/CIRCULATIONAHA.121.055654',
        kind: 'doi',
      },
      {
        label:
          'Doi T, Langsted A, Nordestgaard BG. A possible explanation for the contrasting results of REDUCE-IT vs. STRENGTH: cohort study mimicking trial designs. Eur Heart J 2021;42:4807-4817',
        identifier: '10.1093/eurheartj/ehab555',
        kind: 'doi',
      },
      {
        label:
          'Ridker PM et al. Effects of randomized treatment with icosapent ethyl and a mineral oil comparator on interleukin-1beta, interleukin-6, C-reactive protein, oxidized LDL cholesterol, homocysteine, lipoprotein(a) and Lp-PLA2: a REDUCE-IT biomarker substudy. Circulation 2022;146:372-379',
        identifier: '10.1161/CIRCULATIONAHA.122.059410',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 446284 — Eicosapentaenoic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/446284',
        kind: 'url',
      },
      {
        label: 'PubChem CID 445580 — Docosahexaenoic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/445580',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Magnesium glycinate — a real but small blood-pressure effect, a negative Cochrane review for
  // the cramps everyone buys it for, and a "superior form" claim resting on twelve patients.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'magnesium-glycinate',
    name: 'Magnesium glycinate',
    tradeName: 'Sold as magnesium bisglycinate or magnesium diglycinate chelate',
    sponsor:
      'No single sponsor — magnesium bis-glycinate chelate, manufactured by reacting a magnesium salt with two equivalents of glycine, sold by many supplement brands',
    targetGene: 'TRPM6',
    targetProtein:
      'TRPM6, the transient receptor potential melastatin channel-kinase that carries active transcellular magnesium absorption in the distal small intestine and colon and reabsorption in the renal distal convoluted tubule. Magnesium itself has no single protein target: it is a cofactor for hundreds of ATP-dependent enzymes, a physiological blocker of the NMDA receptor pore and a calcium antagonist at vascular smooth muscle.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for sleep, anxiety, muscle cramps, migraine and blood pressure. Not approved by the FDA or EMA for any of them. Magnesium sulphate given intravenously is a genuine drug with genuine approvals — for eclampsia and for torsades de pointes — and that is a different product taken by a different route for a different reason.',
    patientFriendlyIndication:
      'Taken for sleep, cramps and stress, on the belief that the glycinate form absorbs better',
    conditionContext: {
      conditionExplainer:
        'Magnesium is the fourth most abundant cation in the body and roughly half of it is locked in bone. Most of the rest is inside cells, bound to ATP. Less than one percent circulates in serum, which is why a normal serum magnesium result tells you very little about whether the tissue pool is full.',
      whyItMatters:
        'Because the status test is weak, almost anyone can be told they are deficient. Survey data showing average intakes below the recommended allowance are then read as a population-wide deficiency, and the supplement is sold against symptoms — poor sleep, cramps, anxiety — that are common enough that most buyers will improve on their own.',
      whoTakesThis:
        'Adults buying it for sleep or stress, athletes buying it for cramps, and people with genuine depletion from proton pump inhibitors, loop or thiazide diuretics, chronic alcohol use, uncontrolled diabetes or intestinal resection. Only the last group has a documented reason.',
      clinicalGoals:
        'The randomised trials measured systolic and diastolic blood pressure, cramp frequency per week, insomnia severity index scores, PHQ-9 depression scores and, in the intravenous cardiology programme, 28- and 30-day all-cause mortality.',
    },
    oneSentenceVerdict:
      'Oral magnesium lowers blood pressure by about 2 mmHg in a 34-trial meta-analysis, which is real and small, while the two claims that sell it — cramps and sleep — rest respectively on a Cochrane review that found nothing and a single 46-person trial in which total sleep time did not differ between groups.',
    laymanHowItWorks:
      'Magnesium is a mineral your enzymes cannot work without, and it also sits inside the pore of a brain receptor that carries excitatory signals, plugging it until the cell is stimulated enough to push the magnesium out. Those two facts are the whole basis of the sleep and relaxation marketing. What supplementation actually does is top up a body pool that, in most people eating an ordinary diet, is already close to full — and the glycinate form is sold on the idea that it is absorbed better than the cheap oxide, which one small trial in twelve patients half-supports.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 41,
    anatomicalSite:
      'Intestinal enterocyte brush border for absorption; thereafter intracellular ATP-magnesium complexes in every tissue, with bone as the reservoir',
    substitutes: {
      summary:
        'For a documented deficiency, magnesium is not optional and food or a supplement will both work. For everything else the honest comparison is with the interventions that beat it on their own outcome: sleep hygiene and CBT-I for insomnia, and for blood pressure a 2 mmHg mineral effect sits far below what dietary sodium reduction or a first-line antihypertensive achieves.',
      conventionalRx: [
        {
          name: 'Intravenous magnesium sulphate for eclampsia and torsades de pointes',
          class: 'Parenteral electrolyte, genuine emergency drug',
          howItCompares:
            'This is the one setting where magnesium is unambiguously a drug that saves lives, and it is given by infusion under monitoring in an obstetric or coronary care unit. It is not evidence for a capsule. The same programme that established magnesium in eclampsia failed twice in myocardial infarction.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: large, replicated mortality and morbidity benefit in its own indication. Cons: entirely irrelevant to an oral supplement, and routinely cited as though it were not.',
        },
        {
          name: 'Magnesium oxide, the cheap comparator',
          class: 'Inorganic magnesium salt',
          howItCompares:
            'Firoz and Graber measured fractional absorption of magnesium oxide at about 4 percent against significantly higher and mutually equivalent absorption from magnesium chloride, lactate and aspartate. That study is the source of most "oxide is poorly absorbed" marketing. It did not test glycinate.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: cheapest form, and its poor absorption is exactly why it works as a laxative. Cons: the 4 percent figure is one small urinary-excretion study in normal volunteers, and it is being used to sell a form it never compared against.',
        },
      ],
      naturalFoods: [
        {
          name: 'Legumes, nuts, seeds, whole grains and dark leafy greens',
          activeCompound: 'Magnesium, chiefly as the central ion of chlorophyll in green leaves',
          biologicalMechanism:
            'Dietary magnesium is absorbed by the same two routes as the supplement: a saturable TRPM6-dependent transcellular path that dominates at low intake, and a passive paracellular path that dominates at high intake. Nothing about a capsule bypasses either.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the trials pooled by Zhang et al. used a median supplemental dose of 368 mg per day, which is roughly the whole daily reference intake for an adult.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Hard tap water and mineral water',
          activeCompound: 'Dissolved magnesium and calcium salts',
          biologicalMechanism:
            'Magnesium in water is already dissociated and needs no digestion, and in populations drinking hard water it is a non-trivial share of total intake. It is also the reason intake surveys that count only food underestimate what people actually get.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask which form was actually tested before believing a magnesium result',
          action:
            'For any magnesium finding, check the salt. The blood-pressure meta-analysis pooled many forms, the depression trial used magnesium chloride, the insomnia trial used a generic 500 mg tablet, and the cardiology trials used intravenous sulphate.',
          patientImpact:
            'Almost none of the magnesium literature was generated with bisglycinate. Buying the glycinate and citing the chloride trial is the standard move in this category.',
          clinicalPrecaution:
            'Oral magnesium causes diarrhoea, and did so measurably: across the four Cochrane cramp trials that reported it, minor adverse events ran from 11 to 37 percent on magnesium against 10 to 14 percent on placebo. In renal impairment magnesium accumulates and can become dangerous, because the kidney is the only meaningful route out.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(C(=O)[O-])N.C(C(=O)[O-])N.[Mg+2]',
      chemicalFormula: 'C4H8MgN2O4',
      molecularWeight: '172.42 g/mol, of which 24.31 g/mol — about 14 percent — is elemental magnesium',
      structureSource: {
        label: 'PubChem CID 84645 — Magnesium glycinate, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/84645',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mgg-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Elemental magnesium assay and confirmation that the chelate is actually a chelate',
          description:
            'A product labelled bisglycinate can be a true chelate, a physical blend of magnesium oxide with free glycine, or anything in between, and an elemental magnesium assay passes all three identically. The discriminating test is spectroscopic: in the chelate the carboxylate stretch shifts and the amine nitrogen coordinates, which free glycine mixed with oxide does not show.',
          reagentsAndBuffer:
            'ICP-MS against a certified magnesium standard for elemental content; FTIR with attenuated total reflectance comparing carboxylate asymmetric stretch positions against authentic magnesium bisglycinate, glycine and magnesium oxide references; loss on drying',
        },
        {
          id: 'mgg-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the stable-isotope-labelled tracer',
          description:
            'Magnesium absorption cannot be measured against the endogenous pool without a tracer, because the pool is enormous and serum barely moves. Synthesise the bisglycinate from isotopically enriched magnesium so that absorbed magnesium is distinguishable from body magnesium by mass rather than by concentration.',
          dependsOnStepId: 'mgg-w1',
          reagentsAndBuffer:
            'Magnesium-26 enriched magnesium oxide or carbonate; glycine, two molar equivalents; deionised water at controlled pH; isotopic enrichment confirmed by ICP-MS 26Mg to 24Mg ratio',
        },
        {
          id: 'mgg-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of free glycine and unreacted inorganic magnesium',
          description:
            'Unreacted magnesium oxide and free glycine both carry through the reaction and both confound an absorption study, since free glycine has its own transport route and oxide has its own dissolution behaviour. Separate them before any human or cell exposure, and quantify what is left.',
          dependsOnStepId: 'mgg-w2',
          reagentsAndBuffer:
            'Recrystallisation from aqueous ethanol; cation-exchange chromatography; ninhydrin assay for residual free glycine; ion chromatography for residual chloride or sulphate counter-ions',
        },
        {
          id: 'mgg-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Caco-2 transport with a peptide-transporter block, testing the intact-uptake claim',
          description:
            'The commercial case for glycinate is that the chelate is absorbed intact through a dipeptide route rather than as a free ion, which Schuette et al. suggested but did not demonstrate in cells. Apply labelled bisglycinate to differentiated Caco-2 monolayers with and without a PepT1 inhibitor, and separately with TRPM6 knocked down, and see which block abolishes transport.',
          dependsOnStepId: 'mgg-w3',
          reagentsAndBuffer:
            'Caco-2 monolayers on Transwell inserts, transepithelial electrical resistance above 300 ohm cm2; Hanks balanced salt solution at apical pH 6.0; 26Mg-bisglycinate; glycyl-sarcosine as competitive PepT1 substrate; TRPM6 siRNA and scrambled control; mannitol as paracellular leak marker',
        },
        {
          id: 'mgg-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Isotope-ratio quantification of true fractional absorption',
          description:
            'Report fractional absorption as the recovered fraction of the administered isotope, not as a change in serum magnesium, because serum is buffered by bone and by renal handling and moves too little to resolve a difference between forms. This is the step where most published form-comparison claims stop short.',
          dependsOnStepId: 'mgg-w4',
          reagentsAndBuffer:
            'Complete 24-hour urine collections; ICP-MS isotope-ratio analysis of 26Mg to 24Mg; creatinine normalisation; paired oral and intravenous tracer administration for the double-isotope correction',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mgg-a1',
        category: 'measured',
        title: 'Zhang 2016: blood pressure fell 2.00 over 1.78 mmHg across 34 trials',
        laymanSummary:
          'Pooling 34 double-blind placebo-controlled trials, magnesium lowered blood pressure. The size of the effect was about two points on the top number.',
        technicalDetails:
          'A meta-analysis of 34 randomised, double-blind, placebo-controlled trials involving 2,028 participants, searched to February 2016. At a median dose of 368 mg per day for a median of three months, magnesium supplementation reduced systolic blood pressure by 2.00 mmHg (95% CI 0.43 to 3.58) and diastolic by 1.78 mmHg (95% CI 0.73 to 2.82), accompanied by a 0.05 mmol/L (95% CI 0.03 to 0.07) rise in serum magnesium. A restricted cubic spline suggested 300 mg per day or one month was sufficient to move both. Serum magnesium was negatively associated with diastolic but not systolic pressure. The authors noted residual heterogeneity persisting after stratification and called for further well-designed trials. Two millimetres of mercury is a genuine effect that no reader should mistake for an antihypertensive.',
        evidenceSource: 'Zhang X et al. Hypertension 2016;68:324-333',
        doi: '10.1161/HYPERTENSIONAHA.116.07664',
        measuredMetric:
          'Weighted mean difference in systolic and diastolic blood pressure versus placebo, mmHg',
        auditFlag: 'verified',
      },
      {
        id: 'mgg-a2',
        category: 'failed',
        title: 'Cochrane 2020: no cramp benefit in older adults, and the certainty was high',
        laymanSummary:
          'The single most common reason people buy magnesium is night cramps. A Cochrane review of eleven trials found the difference against placebo was about a fifth of one cramp per week, which is nothing.',
        technicalDetails:
          'Eleven randomised trials enrolling 735 people, five in pregnancy-associated leg cramps and five in idiopathic cramps in older adults (mean ages 61.6 to 69.3 years). For idiopathic cramps the difference from placebo in the number of cramps per week at four weeks was -0.18 (95% CI -0.84 to 0.49; five studies, 307 participants; moderate-certainty evidence), and the percentage change from baseline in cramps per week was -9.59% (95% CI -23.14% to 3.97%; three studies, 177 participants). The proportion achieving at least a 25% reduction in cramp rate gave a risk ratio of 1.04 (95% CI 0.84 to 1.29) and was graded HIGH certainty. Heterogeneity was 0 to 12%. Minor adverse events, mostly diarrhoea, were more common on magnesium (RR 1.51, 95% CI 0.98 to 2.33). The authors wrote that it is unlikely magnesium supplementation provides clinically meaningful cramp prophylaxis to older adults.',
        evidenceSource: 'Garrison SR et al. Cochrane Database Syst Rev 2020;9:CD009402',
        doi: '10.1002/14651858.CD009402.pub3',
        measuredMetric:
          'Number of cramps per week at four weeks, and proportion achieving a 25% or greater reduction from baseline',
        auditFlag: 'verified',
      },
      {
        id: 'mgg-a3',
        category: 'inferred',
        title: 'The glycinate advantage rests on twelve patients with surgically shortened bowels',
        laymanSummary:
          'The one human trial comparing magnesium glycinate against the cheap oxide form found no overall difference in absorption. It was run in twelve people who had had part of their intestine removed.',
        technicalDetails:
          'Schuette, Lashner and Janghorbani ran a double-blind randomised crossover in twelve patients with ileal resections, comparing a 100 mg dose of 26Mg-labelled magnesium diglycinate against 26Mg-labelled magnesium oxide. For the group as a whole, absorption was low and not different between the two forms: 23.5% for the chelate against 22.8% for the oxide. A difference emerged only in the four patients with the worst oxide absorption (23.5% against 11.8%, P < .05). Peak isotope enrichment came earlier after the chelate (mean difference 3.2 +/- 1.3 hours, P < .05) and the area under the enrichment curve was greater. The authors concluded that some portion of the diglycinate is probably absorbed intact by a dipeptide pathway and that it may be a good alternative in patients with intestinal resection — a conclusion about surgical patients that the retail category has generalised to everyone. Separately, Firoz and Graber\'s much-cited bioavailability comparison of US commercial preparations tested oxide, chloride, lactate and aspartate. It did not include glycinate at all.',
        evidenceSource:
          'Schuette SA, Lashner BA, Janghorbani M. JPEN J Parenter Enteral Nutr 1994;18:430-435; Firoz M, Graber M. Magnes Res 2001;14:257-262',
        doi: '10.1177/0148607194018005430',
        inferredClaim:
          'That magnesium bisglycinate is meaningfully better absorbed than other magnesium salts in people with normal intestines, and that trials run with other magnesium salts therefore transfer to it',
        auditFlag: 'caution',
      },
      {
        id: 'mgg-a4',
        category: 'inferred',
        title: 'The sleep trial: 46 people, and total sleep time did not differ',
        laymanSummary:
          'The trial behind "magnesium for sleep" had 46 elderly participants. Questionnaire scores improved. The amount of time people actually slept was no different from placebo.',
        technicalDetails:
          'Abbasi et al. randomised 46 elderly subjects with primary insomnia to 500 mg magnesium or placebo for eight weeks. Between-group improvements were reported for insomnia severity index score (P = 0.006), sleep efficiency (P = 0.03), sleep onset latency (P = 0.02), serum renin (P < 0.001), melatonin (P = 0.007) and cortisol (P = 0.008). But total sleep time showed no significant between-group difference (P = 0.37), early morning awakening was only marginal (P = 0.08), and — the detail that undercuts the mechanism — the between-group difference in serum magnesium concentration itself was only marginally significant (P = 0.06). A supplement that did not clearly raise the analyte it delivers, in 46 people, is the entire randomised basis for one of the largest supplement marketing claims in the category.',
        evidenceSource: 'Abbasi B et al. J Res Med Sci 2012;17:1161-1169',
        measuredMetric:
          'Insomnia severity index, sleep onset latency, sleep efficiency and total sleep time over eight weeks',
        inferredClaim:
          'That magnesium is an established sleep aid in adults generally, on the strength of a 46-person trial whose total sleep time endpoint was null',
        auditFlag: 'caution',
      },
      {
        id: 'mgg-a5',
        category: 'conclusion_shift',
        title: 'The cardiology reversal: a 24% mortality benefit that 6,213 patients erased',
        laymanSummary:
          'In 1992 a trial of 2,316 heart attack patients reported that magnesium cut deaths by a quarter. Two much larger trials, one with 58,050 patients and one with 6,213, did not confirm it, and the treatment was abandoned.',
        technicalDetails:
          'LIMIT-2 randomised 2,316 patients with suspected acute myocardial infarction to intravenous magnesium sulphate or saline and reported 28-day all-cause mortality of 7.8% against 10.3% (2p = 0.04), a relative reduction of 24% (95% CI 1 to 43%), with left ventricular failure in the coronary care unit down 25% (7 to 39%, 2p = 0.009). The authors wrote that magnesium\'s efficacy in reducing early mortality was comparable to, but independent of, thrombolytic or antiplatelet therapy. ISIS-4 then randomised 58,050 patients in a 2x2x2 factorial design including 24 hours of intravenous magnesium sulphate versus open control. By 2002 the MAGIC investigators recorded in their own background section that "conflicting results have been reported in clinical trials," and settled it: 6,213 patients, 30-day all-cause mortality 475 (15.3%) on magnesium against 472 (15.2%) on placebo, odds ratio 1.0 (95% CI 0.9 to 1.2, p = 0.96), with no benefit or harm in eight prespecified and fifteen exploratory subgroups. Their conclusion was that there is no indication for routine intravenous magnesium in STEMI. The mechanism was never wrong — magnesium really is a vasodilator, platelet inhibitor and antiarrhythmic — it simply did not produce the outcome.',
        evidenceSource:
          'Woods KL et al. Lancet 1992;339:1553-1558; ISIS-4 Collaborative Group. Lancet 1995;345:669-685; MAGIC Trial Investigators. Lancet 2002;360:1189-1196',
        doi: '10.1016/S0140-6736(02)11278-5',
        measuredMetric: '28-day and 30-day all-cause mortality after acute myocardial infarction',
        inferredClaim:
          'That a plausible mechanism plus a positive medium-sized trial establishes a clinical effect',
        auditFlag: 'verified',
      },
      {
        id: 'mgg-a6',
        category: 'inferred',
        title: 'The depression result is large, fast, and completely unblinded',
        laymanSummary:
          'An often-cited trial reported that magnesium improved depression scores by six points in two weeks. Nobody was blinded, there was no placebo, and participants knew exactly when they were taking it.',
        technicalDetails:
          'Tarleton et al. ran an open-label, blocked, randomised crossover trial in 126 adults with PHQ-9 scores of 5 to 19, comparing six weeks of 248 mg elemental magnesium as magnesium chloride against six weeks of no treatment. Net improvement in PHQ-9 was -6.0 points (95% CI -7.9 to -4.2, P < 0.001) and in GAD-7 -4.5 points (95% CI -6.6 to -2.4, P < 0.001), with effects appearing within two weeks and no dependence on baseline magnesium level. The design is the problem: an open-label crossover against no treatment in a self-reported symptom score is the configuration that maximises expectancy effects, and a six-point PHQ-9 swing exceeds what several licensed antidepressants achieve over placebo in blinded trials. Note also the salt: this was magnesium chloride, not glycinate.',
        evidenceSource: 'Tarleton EK et al. PLoS One 2017;12:e0180067',
        doi: '10.1371/journal.pone.0180067',
        inferredClaim:
          'That magnesium has an antidepressant effect of the size this trial reports, when the trial had no blind and no placebo',
        auditFlag: 'caution',
      },
      {
        id: 'mgg-a7',
        category: 'measured',
        title: 'The deficiency test is weak, which is what makes the category sellable',
        laymanSummary:
          'The blood test used to call people magnesium-deficient measures less than one percent of the body\'s magnesium, and the normal range it is judged against was never set from health outcomes.',
        technicalDetails:
          'Costello et al. argue in Advances in Nutrition that the widely used serum magnesium reference interval is not evidence-based: it derives from population distributions rather than from any relationship to clinical outcome, and it is set low enough that people with genuine chronic latent deficiency fall inside it. Serum holds a small, tightly regulated fraction of total body magnesium, buffered by exchange with bone, so it falls late and returns to range quickly. The practical consequence runs both directions. A normal result does not rule out depletion, which is the honest half of the marketing claim. And no ordinary test can confirm the depletion either, which means a supplement sold against it can never be shown to have been unnecessary.',
        evidenceSource: 'Costello RB et al. Adv Nutr 2016;7:977-993',
        doi: '10.3945/an.116.012765',
        measuredMetric:
          'Serum magnesium reference interval and its relationship to total body magnesium status',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Two absorption routes, and the efficient one shuts down as intake rises',
        laymanDesc:
          'The gut has an active pump for magnesium that works hardest when you have least, plus a passive leak between cells that handles the rest. Take more and a smaller fraction of it gets in.',
        molecularDetail:
          'Transcellular uptake through TRPM6 in the distal small intestine and colon is saturable and dominates at low luminal concentration; paracellular diffusion through claudin-2 and claudin-12 tight junctions dominates at high concentration and is not regulated. Fractional absorption therefore falls as dose rises, which is why any form comparison must state the dose it was run at. Firoz and Graber measured about 4 percent fractional absorption for magnesium oxide at roughly 21 mEq per day.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The glycinate claim: absorbed as a whole molecule, or taken apart first',
        laymanDesc:
          'The premium form is sold on the idea that magnesium bound to two glycine molecules slips through a different door, the one used for digested protein fragments. One small trial hinted at this.',
        molecularDetail:
          'Schuette et al. inferred intact dipeptide-pathway absorption from an earlier peak isotope enrichment (3.2 +/- 1.3 hours sooner) and a greater area under the enrichment curve for the diglycinate against the oxide, in ileal-resection patients. Total fractional absorption was not different (23.5% against 22.8%). Earlier and higher is a kinetic observation; a distinct transporter is an inference from it, and no cell-level demonstration accompanies the claim.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Into the cell, where it spends its life stuck to ATP',
        laymanDesc:
          'Almost no magnesium floats free. Inside cells it is bound to the energy molecule ATP, and it is that complex, not ATP alone, that enzymes actually use.',
        molecularDetail:
          'The biologically active substrate of most kinases, ATPases and polymerases is Mg-ATP, not ATP. Intracellular free magnesium is held near 0.5 to 1.0 mmol/L against a total cellular content roughly twenty times higher, and the bone reservoir buffers the extracellular pool. This buffering is exactly why serum magnesium moved only 0.05 mmol/L across the 34 trials in Zhang\'s meta-analysis.',
        iconName: 'Battery',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Plugging the NMDA receptor, which is the whole basis of the calm claim',
        laymanDesc:
          'Magnesium physically sits inside the pore of an excitatory brain receptor and blocks it until the cell is strongly stimulated. That is the pharmacological story behind selling it for anxiety and sleep.',
        molecularDetail:
          'Extracellular magnesium occupies the NMDA receptor channel in a voltage-dependent manner and is expelled on depolarisation, making the receptor a coincidence detector. The step from that to a clinical anxiolytic effect requires brain extracellular magnesium to change measurably with oral intake, which is bounded by the same homeostasis that keeps serum flat. The randomised evidence for the endpoint is the 46-person Abbasi trial and the unblinded Tarleton crossover.',
        iconName: 'Brain',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What comes out the other end, measurably',
        laymanDesc:
          'The kidney is the only real exit, so magnesium status is set by how much the kidney lets go — and whatever the gut does not absorb pulls water into the bowel on its way out.',
        molecularDetail:
          'The distal convoluted tubule reabsorbs magnesium through TRPM6 and sets the whole-body set point, which is why renal impairment turns a harmless supplement into an accumulating one. Unabsorbed luminal magnesium is osmotically active: across the Cochrane cramp trials, minor adverse events, mostly diarrhoea, ran 11 to 37 percent on magnesium against 10 to 14 percent on control, risk ratio 1.51 (95% CI 0.98 to 2.33).',
        iconName: 'Droplets',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Zhang 2016 meta-analysis of 34 double-blind placebo-controlled magnesium trials',
        phase: 'Meta-analysis of randomised double-blind placebo-controlled trials',
        sampleSize: 2028,
        primaryEndpoint: 'Change in systolic and diastolic blood pressure versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Systolic -2.00 mmHg (95% CI 0.43 to 3.58); diastolic -1.78 mmHg (95% CI 0.73 to 2.82)',
        unreportedAdverseSignals:
          'Residual heterogeneity persisted after stratification by trial quality and dropout rate. Serum magnesium rose only 0.05 mmol/L, so the effect is not traceable to a large change in the measured analyte.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD009402 — magnesium for skeletal muscle cramps',
        phase: 'Cochrane systematic review of 11 randomised trials',
        sampleSize: 735,
        primaryEndpoint: 'Percentage change from baseline in number of cramps per week at four weeks',
        endpointMet: false,
        statisticalPValue:
          'MD -9.59% (95% CI -23.14 to 3.97); cramps per week MD -0.18 (95% CI -0.84 to 0.49); 25% responder RR 1.04 (95% CI 0.84 to 1.29), high certainty',
        unreportedAdverseSignals:
          'More minor adverse events on magnesium than control, RR 1.51 (95% CI 0.98 to 2.33). No randomised trials at all were found for exercise-associated cramps, which is a large part of the market.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Schuette 1994 — 26Mg-labelled diglycinate versus oxide in ileal resection',
        phase: 'Double-blind randomised crossover stable-isotope study',
        sampleSize: 12,
        primaryEndpoint: 'Fractional absorption of a 100 mg 26Mg-labelled dose',
        endpointMet: false,
        statisticalPValue:
          'No group difference: 23.5% chelate versus 22.8% oxide; subgroup of four poorest absorbers 23.5% versus 11.8% (P < .05)',
        unreportedAdverseSignals:
          'Twelve patients, all with surgically shortened bowels, is the entire direct human evidence base for the form that dominates the retail market.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Abbasi 2012 — magnesium for primary insomnia in the elderly',
        phase: 'Double-blind randomised placebo-controlled',
        sampleSize: 46,
        primaryEndpoint: 'Insomnia severity index and sleep log measures over eight weeks',
        endpointMet: true,
        statisticalPValue:
          'ISI P = 0.006, sleep onset latency P = 0.02, sleep efficiency P = 0.03; total sleep time P = 0.37 (not significant)',
        unreportedAdverseSignals:
          'The between-group difference in serum magnesium itself reached only P = 0.06, and total sleep time — arguably the endpoint a buyer cares about — was null.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'MAGIC — intravenous magnesium in ST-elevation myocardial infarction',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 6213,
        primaryEndpoint: '30-day all-cause mortality',
        endpointMet: false,
        statisticalPValue: 'Odds ratio 1.0 (95% CI 0.9 to 1.2), p = 0.96',
        unreportedAdverseSignals:
          'No benefit or harm in eight prespecified and fifteen exploratory subgroups. The trial exists because a 2,316-patient predecessor had reported a 24% mortality reduction that larger studies did not sustain.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Systolic blood pressure fell 2.00 mmHg and diastolic 1.78 mmHg across 34 double-blind trials in 2,028 people',
        'Serum magnesium rose by only 0.05 mmol/L across those same trials, because bone and kidney buffer the pool',
        'Fractional absorption of magnesium oxide was about 4 percent in normal volunteers, lower than chloride, lactate and aspartate',
        'Oral magnesium reliably increases minor gastrointestinal adverse events, RR 1.51 in the Cochrane pooled analysis',
      ],
      unsupportedInferences: [
        'That bisglycinate is better absorbed in people with normal intestines — the one comparative trial found no group difference in twelve ileal-resection patients',
        'That magnesium prevents muscle cramps, which Cochrane rated as high-certainty no in older adults and untested in exercise',
        'That magnesium is an established sleep aid, when the trial behind the claim was null for total sleep time in 46 people',
        'That a 6-point PHQ-9 improvement in an open-label, no-placebo crossover measures a drug effect rather than expectancy',
      ],
      whatFailedInitially: [
        'Intravenous magnesium in myocardial infarction: a 24% mortality reduction in 2,316 patients that 6,213 patients later flattened to an odds ratio of 1.0',
        'The idea that serum magnesium can adjudicate deficiency, which the reference interval was never built to do',
      ],
      realWorldOutcome: [
        'Magnesium is genuinely required, genuinely depleted by common drugs including proton pump inhibitors and diuretics, and genuinely under-consumed relative to reference intakes',
        'None of that establishes the specific retail claims, and the specific retail form has almost no trial literature of its own',
        'The one unambiguous consumer-facing effect of taking too much is diarrhoea, which is also how magnesium salts work as laxatives',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet, magnesium bis-glycinate chelate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. Elemental magnesium is only about 14 percent of the bisglycinate molecule by mass, so a 1,000 mg capsule of "magnesium glycinate" delivers on the order of 140 mg of magnesium — a labelling distinction that decides whether a product is comparable to the trials at all. Products may also be blends of magnesium oxide with free glycine rather than true chelates, which an elemental assay cannot detect.',
      safetyProfile:
        'Diarrhoea and abdominal cramping are dose-related and are the mechanism by which magnesium salts act as laxatives. Magnesium is cleared almost entirely by the kidney, so in chronic kidney disease supplemental magnesium accumulates and hypermagnesaemia — bradycardia, hypotension, respiratory depression at high levels — becomes a real risk. Oral magnesium also chelates tetracycline and fluoroquinolone antibiotics and bisphosphonates in the gut, reducing their absorption.',
    },
    commonQuestions: [
      {
        q: 'Is glycinate really better absorbed than the cheap magnesium oxide?',
        a: 'The honest answer is that the direct comparison has been run once, in twelve patients who had had part of their ileum surgically removed, and it found no difference for the group as a whole: 23.5 percent absorption for the glycinate against 22.8 percent for the oxide. The glycinate was absorbed faster and reached a higher peak, and it did better in the four patients who absorbed the oxide worst. That is a reasonable basis for preferring it in intestinal disease. It is not a basis for the claim printed on the tub.',
        auditNote:
          'The Firoz and Graber bioavailability study that most "oxide is poorly absorbed" copy points to did not test glycinate.',
      },
      {
        q: 'Does magnesium stop night cramps?',
        a: 'A Cochrane review of eleven trials in 735 people says no, and it graded one of those null results as high certainty. In older adults with idiopathic night cramps the difference against placebo was about a fifth of one cramp per week. For pregnancy-associated cramps the trials genuinely conflict and the review would not pool them. For exercise cramps there are no randomised trials at all, which is worth knowing before reading any confident claim about them.',
      },
      {
        q: 'What about magnesium for sleep and anxiety?',
        a: 'The mechanism is real and interesting: magnesium physically blocks the pore of the NMDA receptor. The clinical evidence is thinner than the marketing suggests. The insomnia trial had 46 elderly participants, improved questionnaire scores, and found no significant difference in total sleep time. The depression and anxiety trial had no blind and no placebo and used magnesium chloride, not glycinate. Neither is worthless; neither supports the confidence with which the claim is sold.',
        auditNote:
          'Glycine, the other half of the molecule, has its own small sleep literature and is a separate record on this site.',
      },
      {
        q: 'How would I know if I am actually deficient?',
        a: 'You largely would not, and that is the structural problem in this category. Serum magnesium is under one percent of the body\'s magnesium and is buffered by bone, so it falls late and recovers fast, and the reference interval it is judged against was set from population distributions rather than from outcomes. A normal result does not rule out depletion. It also means a supplement sold against invisible depletion can never be shown to have been unnecessary, which is a commercially useful property.',
      },
      {
        q: 'Who has a documented reason to take it?',
        a: 'People with real, mechanistically explained losses: long-term proton pump inhibitor use, loop and thiazide diuretics, chronic alcohol use, poorly controlled diabetes, and intestinal resection or malabsorption. The FDA has warned specifically about hypomagnesaemia with prolonged proton pump inhibitor therapy. That population is well defined and is not the population the retail category is aimed at.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Woods KL, Fletcher S, Roffe C, Haider Y. Intravenous magnesium sulphate in suspected acute myocardial infarction: results of the second Leicester Intravenous Magnesium Intervention Trial (LIMIT-2). Lancet 1992;339:1553-1558',
        identifier: '10.1016/0140-6736(92)91828-V',
        kind: 'doi',
      },
      {
        label:
          'Schuette SA, Lashner BA, Janghorbani M. Bioavailability of magnesium diglycinate vs magnesium oxide in patients with ileal resection. JPEN J Parenter Enteral Nutr 1994;18:430-435',
        identifier: '10.1177/0148607194018005430',
        kind: 'doi',
      },
      {
        label:
          'ISIS-4 Collaborative Group. ISIS-4: a randomised factorial trial assessing early oral captopril, oral mononitrate, and intravenous magnesium sulphate in 58,050 patients with suspected acute myocardial infarction. Lancet 1995;345:669-685',
        identifier: '10.1016/S0140-6736(95)90865-X',
        kind: 'doi',
      },
      {
        label:
          'Firoz M, Graber M. Bioavailability of US commercial magnesium preparations. Magnes Res 2001;14:257-262',
        identifier: '11794633',
        kind: 'pmid',
      },
      {
        label:
          'Magnesium in Coronaries (MAGIC) Trial Investigators. Early administration of intravenous magnesium to high-risk patients with acute myocardial infarction in the MAGIC Trial: a randomised controlled trial. Lancet 2002;360:1189-1196',
        identifier: '10.1016/S0140-6736(02)11278-5',
        kind: 'doi',
      },
      {
        label:
          'Abbasi B et al. The effect of magnesium supplementation on primary insomnia in elderly: a double-blind placebo-controlled clinical trial. J Res Med Sci 2012;17:1161-1169',
        identifier: '23853635',
        kind: 'pmid',
      },
      {
        label:
          'Zhang X et al. Effects of magnesium supplementation on blood pressure: a meta-analysis of randomized double-blind placebo-controlled trials. Hypertension 2016;68:324-333',
        identifier: '10.1161/HYPERTENSIONAHA.116.07664',
        kind: 'doi',
      },
      {
        label:
          'Costello RB et al. Perspective: the case for an evidence-based reference interval for serum magnesium: the time has come. Adv Nutr 2016;7:977-993',
        identifier: '10.3945/an.116.012765',
        kind: 'doi',
      },
      {
        label:
          'Tarleton EK, Littenberg B, MacLean CD, Kennedy AG, Daley C. Role of magnesium supplementation in the treatment of depression: a randomized clinical trial. PLoS One 2017;12:e0180067',
        identifier: '10.1371/journal.pone.0180067',
        kind: 'doi',
      },
      {
        label:
          'Garrison SR et al. Magnesium for skeletal muscle cramps. Cochrane Database Syst Rev 2020;9:CD009402',
        identifier: '10.1002/14651858.CD009402.pub3',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 84645 — Magnesium glycinate',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/84645',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Zinc — a real but dose-and-salt-dependent effect on cold duration, and two harms the category
  // does not print on the label: permanent anosmia from the nasal route, and copper depletion.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'zinc',
    name: 'Zinc',
    tradeName:
      'Sold as zinc gluconate, acetate, picolinate, citrate or oxide; the prescription zinc acetate product for Wilson disease is Galzin',
    sponsor:
      'No single sponsor — an essential trace element sold as several salts by many manufacturers. Zinc acetate is also an FDA-approved prescription drug under NDA 020458.',
    targetGene: 'SLC39A4',
    targetProtein:
      'ZIP4 (SLC39A4), the apical enterocyte zinc importer whose loss-of-function mutations cause acrodermatitis enteropathica. The counterpart that explains most of zinc\'s harms is metallothionein, a cysteine-rich cytosolic chelator that zinc itself induces in the enterocyte and that binds copper more tightly than zinc, trapping it for excretion in shed cells.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold over the counter for the common cold, immunity, skin and testosterone. Zinc acetate is separately an FDA-approved prescription drug for maintenance therapy in Wilson disease, and oral zinc is a WHO- and UNICEF-recommended treatment for acute childhood diarrhoea. Those two are genuine, evidenced indications, and neither is why most zinc is bought.',
    patientFriendlyIndication:
      'Taken at the first sign of a cold, and daily for immune support',
    conditionContext: {
      conditionExplainer:
        'The common cold is a self-limiting viral illness that resolves on its own in about a week. Any treatment for it is therefore competing with spontaneous recovery, and any trial has to separate a real shortening from the ordinary variation in how long colds last. This is why the zinc literature is so noisy: the effect being chased is a day or two against a background that already ends by itself.',
      whyItMatters:
        'Zinc is one of the very few over-the-counter cold remedies with a positive randomised signal, and the reason it took thirty years to make sense of is that the dose and the chemical salt both matter. It is also the supplement with the clearest documented ability to cause lasting harm: permanent loss of smell by one route, and copper deficiency with anaemia and spinal cord damage by another.',
      whoTakesThis:
        'Adults taking lozenges at cold onset, people on daily multivitamins containing zinc, children in low-income settings treated for diarrhoea under WHO guidance, patients with Wilson disease on prescription zinc acetate, and people with genuine deficiency from malabsorption, vegetarian diets high in phytate, or acrodermatitis enteropathica.',
      clinicalGoals:
        'Trials measured cold duration in days, proportion still symptomatic at follow-up, global symptom severity, diarrhoea duration in hours, progression to advanced macular degeneration, and — in the harm literature — olfactory threshold testing, serum copper, ceruloplasmin and neutrophil counts.',
    },
    oneSentenceVerdict:
      'Zinc lozenges probably do shorten a cold, but only above about 75 mg per day and best as the acetate salt, which is why half the trials found nothing; the prevention claim is null across 1,449 participants, and the two documented harms — permanent anosmia from nasal gels and copper deficiency from sustained high oral intake — are real and undersold.',
    laymanHowItWorks:
      'Zinc is a structural component of thousands of proteins, so a genuine shortage disables enzymes and immune cells across the body. What a lozenge does is different and local: it releases free zinc ions into the throat, where they appear to interfere with the rhinovirus replication cycle and with the receptor the virus uses to enter cells. That only happens if the lozenge actually releases free ionic zinc, which depends on what the zinc is bound to and how much of it there is. Swallowed daily at high doses, the same element blocks copper absorption, and copper deficiency is not a subtle condition.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 54,
    anatomicalSite:
      'Oropharyngeal mucosa for the lozenge effect; duodenal and jejunal enterocyte for absorption and for the copper interaction',
    substitutes: {
      summary:
        'For an acute cold there is no comparator that clearly beats zinc, because there is no established treatment for the common cold at all — the Cochrane authors say so in the first paragraph of their background. For deficiency, food and prescription zinc both work. For the nasal route there is no acceptable substitute discussion, because that route should not be used.',
      conventionalRx: [
        {
          name: 'Zinc acetate as prescription therapy for Wilson disease',
          class: 'Copper absorption blocker, FDA-approved under NDA 020458',
          howItCompares:
            'The same salt, prescribed precisely because it induces intestinal metallothionein and stops copper being absorbed. The mechanism regulators approved as the therapeutic action is identical to the mechanism that makes high-dose zinc supplementation dangerous in a person with normal copper handling.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: a clean, approved, mechanistically transparent use. Cons: it is also the clearest possible warning label for the supplement, and it is almost never presented as one.',
        },
        {
          name: 'Oral zinc for acute childhood diarrhoea, per WHO and UNICEF',
          class: 'Public-health mineral supplementation',
          howItCompares:
            'This is the strongest efficacy evidence zinc has anywhere. In children over six months, 33 trials in 10,841 children found diarrhoea shortened by about eleven hours, and in malnourished children by about a day, graded high certainty.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: large, replicated, and in the population where baseline zinc deficiency is common. Cons: in children under six months the same review found no effect, and the trials were run mostly in Asian settings at high risk of deficiency, so it is a repletion result rather than a general antiviral one.',
        },
      ],
      naturalFoods: [
        {
          name: 'Oysters, red meat, shellfish and organ meat',
          activeCompound: 'Zinc, in a form unencumbered by phytate',
          biologicalMechanism:
            'Animal-source zinc is absorbed far more efficiently than plant-source zinc because it is not bound to phytic acid, which chelates zinc in the gut lumen and blocks ZIP4-mediated uptake. Oysters carry more zinc per gram than any other common food by a wide margin.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane cold-treatment trials used zinc gluconate lozenges at 45 to 276 mg per day, which is many times any dietary intake.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Legumes and whole grains, as the phytate problem',
          activeCompound: 'Zinc bound to phytic acid',
          biologicalMechanism:
            'Phytate forms insoluble complexes with zinc in the intestinal lumen, which is why populations eating unleavened high-phytate staples have measurably higher rates of zinc deficiency despite adequate total zinc intake. Soaking, sprouting and leavening degrade phytate and raise absorption.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Never put zinc up your nose',
          action:
            'Distinguish the lozenge from the nasal gel or nasal swab. They are different products with different risk profiles, and only one of them has caused permanent injury.',
          patientImpact:
            'Twenty-five patients presenting to a single nasal dysfunction clinic with acute anosmia after homeopathic intranasal zinc gluconate gel were enough to satisfy all nine Bradford Hill criteria for causation. Zinc ions are directly toxic to olfactory epithelium.',
          clinicalPrecaution:
            'The loss was long-lasting or permanent in some cases. The authors of that analysis called for increased FDA oversight of homeopathic medications on the strength of it.',
        },
        {
          name: 'If a daily zinc habit is long-term, copper is the thing to watch',
          action:
            'Sustained high-dose zinc induces intestinal metallothionein, which binds copper and carries it out in shed enterocytes. The result is a copper deficiency that presents haematologically or neurologically, often without the zinc being suspected.',
          patientImpact:
            'Willis et al. reported three cases first recognised on bone marrow examination: sideroblastic anaemia and severe neutropenia, two of them with progressive peripheral neuropathy. Kumar\'s Mayo Clinic series describes a copper deficiency myelopathy with spastic gait and sensory ataxia that mimics vitamin B12 subacute combined degeneration.',
          clinicalPrecaution:
            'Copper replacement resolves the anaemia and neutropenia promptly and completely. The neurological damage often does not recover; supplementation mainly prevents further deterioration. AREDS included 2 mg of copper alongside its 80 mg of zinc for exactly this reason.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)[O-].CC(=O)[O-].[Zn+2]',
      chemicalFormula: 'C4H6O4Zn',
      molecularWeight:
        '183.5 g/mol for zinc acetate, of which 65.4 g/mol is elemental zinc. The marker salt here is the acetate because it is the form that produced the largest cold-duration effect in Hemila\'s dose-stratified analysis, and the form approved as a prescription drug.',
      structureSource: {
        label: 'PubChem CID 11192 — Zinc acetate, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11192',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'zn-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Elemental zinc content and cadmium and lead screen on the raw salt',
          description:
            'Zinc ores carry cadmium and lead, and both follow zinc through refining. A label states elemental zinc; it does not state what came along with it. Assay both the declared element and the contaminants before anything is formulated, because a lozenge is dosed at many times dietary intake and so multiplies any contaminant proportionally.',
          reagentsAndBuffer:
            'Microwave acid digestion in nitric acid and hydrogen peroxide; ICP-MS against certified zinc, cadmium and lead standards; NIST-traceable reference material as the accuracy control; loss on drying and residue on ignition',
        },
        {
          id: 'zn-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Formulation of lozenges with and without free-ion-quenching excipients',
          description:
            'The active species in the throat is the free zinc ion, and common lozenge excipients bind it. Citric acid, tartaric acid, sorbitol and mannitol chelate zinc and abolish ionic release, which is the most likely reason many early lozenge trials were flatly negative. Prepare matched lozenges that differ only in whether a chelating excipient is present.',
          dependsOnStepId: 'zn-w1',
          reagentsAndBuffer:
            'Zinc acetate dihydrate and zinc gluconate; glycine as a non-quenching buffer; citric acid, tartaric acid, sorbitol and mannitol as the deliberate negative-control excipients; hard-candy base compressed without heat degradation',
        },
        {
          id: 'zn-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Measurement of free ionic zinc release into simulated saliva',
          description:
            'Separate total zinc from free ionic zinc. A lozenge can dissolve completely and release almost no free Zn2+ if the counter-ion or excipient holds it, and total-zinc assays cannot tell the two situations apart. This is the step that converts a formulation into a testable dose of the actual active species.',
          dependsOnStepId: 'zn-w2',
          reagentsAndBuffer:
            'Simulated saliva at pH 7.4 with mucin and salivary electrolytes at 37 degrees C; zinc-selective fluorescent probe (FluoZin-3) calibrated against zinc-EGTA buffers; ion-selective electrode as an orthogonal method; ultrafiltration to separate bound from free zinc',
        },
        {
          id: 'zn-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Rhinovirus replication in human airway epithelium under defined free-zinc exposure',
          description:
            'Expose differentiated primary human nasal or bronchial epithelial cultures at air-liquid interface to rhinovirus and to the free-zinc concentrations actually achieved in step three, not to a nominal salt concentration. Include a metallothionein induction readout, because the same exposure that inhibits virus also starts the copper-binding process that causes the systemic harm.',
          dependsOnStepId: 'zn-w3',
          reagentsAndBuffer:
            'Primary human airway epithelial cells at air-liquid interface; rhinovirus serotype 14 and serotype 1B; zinc-buffered media at defined free Zn2+; TPEN as a membrane-permeant zinc chelator control; qPCR for MT2A induction; ICAM-1 surface staining',
        },
        {
          id: 'zn-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Viral titre alongside a copper-status panel, reported together',
          description:
            'Quantify viral RNA copies and infectious titre, and in any in vivo arm report serum copper, ceruloplasmin, neutrophil count and serum zinc from the same subjects at the same visits. Reporting efficacy without the copper panel is how zinc-induced copper deficiency stayed a case-report finding for decades rather than a trial finding.',
          dependsOnStepId: 'zn-w4',
          reagentsAndBuffer:
            'Rhinovirus RT-qPCR standard curve; TCID50 titration on HeLa-H1 cells; ICP-MS serum copper and zinc; immunoturbidimetric ceruloplasmin; automated differential white cell count',
        },
      ],
    },
    keyAudits: [
      {
        id: 'zn-a1',
        category: 'measured',
        title: 'Cochrane 2024: about two days off a cold, at low certainty, and nothing for prevention',
        laymanSummary:
          'Thirty-four trials in 8,526 people. Taking zinc once a cold has started may shorten it by roughly two days. Taking it to avoid catching one does nothing.',
        technicalDetails:
          'Thirty-four randomised trials (15 prevention, 19 treatment) in 8,526 participants, 22 in adults and 12 in children. For treatment, mean duration of cold fell by 2.37 days (95% CI -4.21 to -0.53) across 8 studies and 972 participants, but with I-squared of 97% and graded LOW certainty. Whether zinc reduced the risk of still having a cold at end of follow-up was uncertain (RR 0.52, 95% CI 0.21 to 1.27, very low certainty), and global symptom severity showed nothing (SMD -0.03, 95% CI -0.56 to 0.50). For prevention there may be little or no reduction in the risk of developing a cold (RR 0.93, 95% CI 0.85 to 1.01; 9 studies, 1,449 participants; low certainty) and little or no reduction in the number of colds over 5 to 18 months. Non-serious adverse events were probably increased by treatment zinc (RR 1.34, 95% CI 1.15 to 1.55; 16 studies, 2,084 participants; moderate certainty) — the highest certainty grade attached to any treatment finding in the review is the harm, not the benefit.',
        evidenceSource: 'Nault D et al. Cochrane Database Syst Rev 2024;5:CD014914',
        doi: '10.1002/14651858.CD014914.pub2',
        measuredMetric:
          'Mean duration of cold in days, proportion developing a cold, and rate of non-serious adverse events',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a2',
        category: 'conclusion_shift',
        title: 'Hemila 2011 explained thirty years of contradiction: the dose and the salt',
        laymanSummary:
          'Zinc trials had contradicted each other for decades. Splitting them by how much zinc was given resolved it: below a threshold, every trial found nothing; above it, they found a large effect.',
        technicalDetails:
          'Hemila pooled thirteen placebo-controlled comparisons of zinc lozenges in natural colds. Five trials using a total daily zinc dose below 75 mg uniformly found no effect. Three trials using zinc acetate above 75 mg per day pooled to a 42% reduction in cold duration (95% CI 35% to 48%). Five trials using zinc salts other than acetate above 75 mg per day pooled to a 20% reduction (95% CI 12% to 28%). The conclusion is that the lozenge effect is heterogeneous by design rather than by chance: the negative trials were not failed replications, they were tests of a dose that could not work. The chemistry underneath is that only free ionic zinc is active, and common lozenge excipients such as citric acid, tartaric acid, sorbitol and mannitol chelate it. This is the cleanest example on this site of a field changing its mind not about whether something works but about what "it" was.',
        evidenceSource: 'Hemila H. Open Respir Med J 2011;5:51-58',
        doi: '10.2174/1874306401105010051',
        measuredMetric:
          'Pooled percentage reduction in common cold duration, stratified by total daily zinc dose and by zinc salt',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a3',
        category: 'failed',
        title: 'COVID A to Z: 214 patients, stopped early, zinc did nothing',
        laymanSummary:
          'A randomised trial of high-dose zinc and vitamin C in outpatients with COVID-19 was halted early because there was no sign either was working.',
        technicalDetails:
          'A multicentre open-label factorial randomised trial at Cleveland Clinic sites in Ohio and Florida enrolled 214 outpatients with PCR-confirmed SARS-CoV-2 between April and October 2020, allocated 1:1:1:1 to ten days of zinc gluconate 50 mg, ascorbic acid 8,000 mg, both, or usual care. The primary endpoint was days to a 50% reduction in a four-symptom severity score. The study was stopped for low conditional power for benefit. Usual care reached 50% symptom reduction at a mean of 6.7 (SD 4.4) days, against 5.9 (4.9) days for zinc, 5.5 (3.7) for ascorbic acid and 5.5 (3.4) for both — overall P = .45, with no significant difference in any secondary outcome. The trial is open-label and was not designed to detect a small effect, but it is the direct randomised test of the exact combination that was being bought by the million during the pandemic.',
        evidenceSource: 'Thomas S et al. JAMA Netw Open 2021;4:e210369',
        doi: '10.1001/jamanetworkopen.2021.0369',
        measuredMetric: 'Days to 50% reduction in a composite fever, cough, dyspnoea and fatigue score',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a4',
        category: 'failed',
        title: 'Intranasal zinc gluconate causes anosmia, and the causation analysis is formal',
        laymanSummary:
          'A homeopathic zinc nasal gel sold for colds destroyed people\'s sense of smell. In some cases it never came back.',
        technicalDetails:
          'Jafek, Linschoten and Murrow reported a case series of severe hyposmia and anosmia following intranasal zinc gluconate, concluding that zinc ions are toxic to olfactory epithelium and that the loss appeared long-lasting or permanent in some cases, with the mechanism attributed to direct action of the divalent zinc ion on the olfactory receptor cell. Davidson and Smith later applied all nine Bradford Hill criteria — strength, consistency, specificity, temporality, biological gradient, plausibility, coherence, experimental evidence and analogy — to 25 patients presenting to the University of California San Diego Nasal Dysfunction Clinic with acute-onset anosmia after intranasal homeopathic zinc gluconate gel, and concluded that the clinical, biological and experimental data support causation. Their stated conclusion was that increased FDA oversight of homeopathic medications is needed. This is a harm caused by route, not by element: the same zinc in a lozenge does not do this.',
        evidenceSource:
          'Jafek BW, Linschoten MR, Murrow BW. Am J Rhinol 2004;18:137-141; Davidson TM, Smith WM. Arch Otolaryngol Head Neck Surg 2010;136:673-676',
        doi: '10.1001/archoto.2010.111',
        measuredMetric: 'Olfactory function after intranasal zinc gluconate exposure',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a5',
        category: 'inferred',
        title: 'Copper depletion: the approved drug action, sold as a side effect nobody mentions',
        laymanSummary:
          'High-dose zinc blocks copper absorption. That is not a rare quirk — it is the reason the FDA approved zinc as a prescription drug for a copper-overload disease. In people without that disease it causes anaemia, low white cells and spinal cord damage.',
        technicalDetails:
          'Zinc induces metallothionein in the enterocyte; metallothionein binds copper with higher affinity than zinc and holds it until the cell is shed, so copper never reaches the circulation. The FDA approved zinc acetate under NDA 020458 for maintenance therapy in Wilson disease on exactly this mechanism. In people with normal copper handling, Willis et al. reported three cases of zinc-induced copper deficiency first suspected on bone marrow examination: sideroblastic anaemia and severe neutropenia, two of the three with progressive peripheral neuropathy, one of them arising from zinc taken for acrodermatitis enteropathica. Kumar\'s Mayo Clinic review of copper deficiency myelopathy describes a spastic gait with prominent sensory ataxia that mirrors vitamin B12 subacute combined degeneration, lists excess zinc ingestion among the established causes, and records the crucial asymmetry: copper replacement resolves the anaemia and neutropenia promptly and completely, while neurological improvement is often only subjective and mainly prevents further deterioration.',
        evidenceSource:
          'Willis MS et al. Am J Clin Pathol 2005;123:125-131; Kumar N. Mayo Clin Proc 2006;81:1371-1384',
        doi: '10.1309/V6GVYW2QTYD5C5PJ',
        inferredClaim:
          'That daily high-dose zinc is a benign long-term habit, when the same mechanism is licensed as a copper-blocking drug and its failure mode includes irreversible myelopathy',
        auditFlag: 'caution',
      },
      {
        id: 'zn-a6',
        category: 'measured',
        title: 'AREDS: the eye result everyone cites, where zinc alone missed significance',
        laymanSummary:
          'The famous eye trial that put zinc in millions of supplements found the full antioxidant-plus-zinc formula worked. Zinc on its own did not reach the significance bar in the whole group.',
        technicalDetails:
          'The Age-Related Eye Disease Study randomised 3,640 participants aged 55 to 80 to antioxidants (vitamin C 500 mg, vitamin E 400 IU, beta carotene 15 mg), zinc 80 mg as zinc oxide with copper 2 mg as cupric oxide, both, or placebo, with average follow-up of 6.3 years and a prespecified significance level of .01. Against placebo, antioxidants plus zinc reduced the odds of progression to advanced AMD (OR 0.72, 99% CI 0.52 to 0.98). Zinc alone gave OR 0.75 (99% CI 0.55 to 1.03) and antioxidants alone OR 0.80 (99% CI 0.59 to 1.09) — neither crossing the threshold in the full cohort. Excluding the 1,063 lowest-risk participants, whose five-year probability of progression was only 1.3%, zinc alone reached OR 0.71 (99% CI 0.52 to 0.99). The only significant reduction in at least moderate visual acuity loss was in the combined arm (OR 0.73, 99% CI 0.54 to 0.99). Two facts the supplement aisle rarely carries forward: the benefit was confined to people already at high risk, and copper was included in the formulation specifically to offset zinc-induced copper deficiency.',
        evidenceSource:
          'Age-Related Eye Disease Study Research Group. AREDS Report No. 8. Arch Ophthalmol 2001;119:1417-1436',
        doi: '10.1001/archopht.119.10.1417',
        measuredMetric:
          'Odds of photographic progression to advanced AMD and of at least 15-letter visual acuity loss over 6.3 years',
        auditFlag: 'verified',
      },
      {
        id: 'zn-a7',
        category: 'measured',
        title: 'Childhood diarrhoea: the strongest zinc evidence anywhere, and it is age-limited',
        laymanSummary:
          'In children over six months old, zinc shortens acute diarrhoea by about half a day, and by a full day in malnourished children. In babies under six months it does nothing.',
        technicalDetails:
          'Thirty-three trials in 10,841 children, mostly in Asian settings at high risk of zinc deficiency. In children older than six months, zinc shortened mean diarrhoea duration by 11.46 hours (95% CI -19.72 to -3.19; 2,581 children, 9 trials, low certainty) and probably reduced the proportion whose diarrhoea persisted to day seven (RR 0.73, 95% CI 0.61 to 0.88; 3,865 children, 6 trials, moderate certainty). In children with signs of malnutrition the effect was larger and the certainty higher: 26.39 hours shorter (95% CI -36.54 to -16.23; 419 children, 5 trials, HIGH certainty). In children younger than six months the evidence suggests no effect on mean duration. There was not enough evidence to say whether zinc reduces death or hospitalisation. The pattern is the same one that runs through this whole file: the effect is largest where the deficiency is real, and disappears where it is not.',
        evidenceSource: 'Lazzerini M, Wanzira H. Cochrane Database Syst Rev 2016;12:CD005436',
        doi: '10.1002/14651858.CD005436.pub5',
        measuredMetric:
          'Mean duration of acute diarrhoea in hours, and proportion with diarrhoea persisting to day seven',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The lozenge only matters if it lets the zinc ion go',
        laymanDesc:
          'A zinc lozenge is not a dose of zinc — it is a dose of whatever free zinc it releases in your mouth. Many common sweeteners and acids grab the zinc and never let go, and a lozenge like that does nothing.',
        molecularDetail:
          'The proposed antiviral species is free Zn2+ released in the oropharynx. Citric acid, tartaric acid, sorbitol and mannitol chelate zinc and suppress ionic release. Hemila\'s dose stratification is the observable consequence: below 75 mg per day, five trials found nothing at all, while zinc acetate above 75 mg pooled to a 42% duration reduction.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Free zinc meets the airway epithelium the virus is replicating in',
        laymanDesc:
          'Rhinovirus enters cells lining the nose and throat through a specific docking protein. Zinc ions in that space appear to interfere both with the docking and with the virus assembling copies of itself.',
        molecularDetail:
          'Rhinovirus major-group serotypes enter through ICAM-1. Proposed zinc actions include interference with the viral 3C protease cleavage of the polyprotein and with capsid assembly, plus upregulation of interferon responses. None of these has been demonstrated in vivo at achievable mucosal free-zinc concentrations, which is why the Cochrane certainty grade for the duration effect is low despite the effect being real in the pooled estimate.',
        iconName: 'ShieldAlert',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Swallowed zinc takes a different path entirely, through ZIP4',
        laymanDesc:
          'Zinc that goes down rather than staying in the throat is absorbed in the small intestine by a dedicated importer, the same one that is broken in a rare inherited disease of zinc deficiency.',
        molecularDetail:
          'ZIP4 (SLC39A4) on the apical enterocyte membrane carries most dietary zinc uptake and is upregulated during deficiency. Loss-of-function mutations cause acrodermatitis enteropathica, the disease that established zinc as essential. Luminal phytate chelates zinc and blocks this step, which is the mechanistic basis of zinc deficiency in high-phytate diets.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Zinc induces the protein that traps copper, and copper never gets in',
        laymanDesc:
          'Inside gut cells zinc switches on a small binding protein. That protein prefers copper. Copper gets stuck to it, the cell is shed into the gut a few days later, and the copper leaves with it.',
        molecularDetail:
          'Metallothionein induction by zinc is dose-dependent, and metallothionein binds Cu(I) with higher affinity than Zn(II). Copper is sequestered in the enterocyte and lost on cell turnover. This is the licensed pharmacology of zinc acetate in Wilson disease under NDA 020458, and it is the same event that produces sideroblastic anaemia, neutropenia and myelopathy in people who do not have Wilson disease.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Two outcomes from one element, separated only by dose and duration',
        laymanDesc:
          'Short bursts at cold onset may take a day or two off a cold. Sustained high daily intake quietly strips copper, and the first sign of that is often a blood count or a change in the way someone walks.',
        molecularDetail:
          'The therapeutic window is defined by time, not just amount. Cochrane found treatment courses of 4.5 to 21 days, over which copper depletion does not develop. Willis\'s three cases and Kumar\'s myelopathy series arose from sustained intake. Anaemia and neutropenia reverse completely on copper replacement; the neurological deficit generally does not.',
        iconName: 'GitBranch',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD014914 — zinc for prevention and treatment of the common cold',
        phase: 'Cochrane systematic review of 34 randomised trials',
        sampleSize: 8526,
        primaryEndpoint:
          'Proportion developing a cold (prevention) and mean duration of cold in days (treatment)',
        endpointMet: true,
        statisticalPValue:
          'Treatment duration MD -2.37 days (95% CI -4.21 to -0.53), I2 = 97%, low certainty; prevention RR 0.93 (95% CI 0.85 to 1.01), low certainty',
        unreportedAdverseSignals:
          'Non-serious adverse events probably increased with treatment zinc, RR 1.34 (95% CI 1.15 to 1.55), moderate certainty — a higher certainty grade than any efficacy finding in the review. No treatment study reported serious adverse events at all.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Hemila 2011 dose-stratified pooling of 13 zinc lozenge comparisons',
        phase: 'Systematic review with dose stratification',
        sampleSize: 13,
        primaryEndpoint: 'Percentage reduction in common cold duration by total daily zinc dose',
        endpointMet: true,
        statisticalPValue:
          'Zinc acetate above 75 mg/day: 42% reduction (95% CI 35% to 48%); other salts above 75 mg/day: 20% (95% CI 12% to 28%); below 75 mg/day: uniformly no effect',
        unreportedAdverseSignals:
          'Sample size here counts trial comparisons, not participants. High-dose zinc lozenges taste unpleasant, which makes blinding hard, and the review could not exclude unblinding as a contributor.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT04342728 — COVID A to Z, zinc and ascorbic acid in ambulatory COVID-19',
        phase: 'Randomised open-label factorial',
        sampleSize: 214,
        primaryEndpoint: 'Days to a 50% reduction in composite symptom severity score',
        endpointMet: false,
        statisticalPValue: 'Overall P = .45 across the four arms',
        unreportedAdverseSignals:
          'Stopped early for low conditional power for benefit. Open-label with a subjective primary endpoint, so it was biased toward finding an effect and still found none.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'AREDS Report No. 8 — antioxidants and zinc for age-related macular degeneration',
        phase: 'Randomised double-masked placebo-controlled',
        sampleSize: 3640,
        primaryEndpoint:
          'Photographic progression to advanced AMD and at least 15-letter visual acuity loss',
        endpointMet: true,
        statisticalPValue:
          'Antioxidants plus zinc OR 0.72 (99% CI 0.52 to 0.98); zinc alone OR 0.75 (99% CI 0.55 to 1.03), not significant at the prespecified .01 level',
        unreportedAdverseSignals:
          'Benefit was confined to participants already at high risk; the 1,063 lowest-risk participants had only a 1.3% five-year progression probability. The formulation included 2 mg copper to offset zinc-induced copper deficiency, and the beta carotene component was later removed after lung cancer signals in smokers.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Cochrane CD005436 — oral zinc for acute diarrhoea in children',
        phase: 'Cochrane systematic review of 33 randomised trials',
        sampleSize: 10841,
        primaryEndpoint: 'Duration and severity of diarrhoea',
        endpointMet: true,
        statisticalPValue:
          'Over six months: MD -11.46 hours (95% CI -19.72 to -3.19), low certainty; malnourished children MD -26.39 hours (95% CI -36.54 to -16.23), high certainty',
        unreportedAdverseSignals:
          'No effect in children under six months. Not enough evidence to say whether zinc reduces death or hospitalisation. Trials were concentrated in populations at high baseline risk of zinc deficiency.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Zinc lozenges above 75 mg per day shortened colds; zinc acetate pooled to a 42% duration reduction and other salts to 20%',
        'Below 75 mg per day, five placebo-controlled trials uniformly found no effect at all',
        'Zinc did not prevent colds across 9 studies and 1,449 participants, RR 0.93 (95% CI 0.85 to 1.01)',
        'In children over six months, zinc shortened acute diarrhoea by about 11 hours, and by 26 hours in malnourished children at high certainty',
        'Intranasal zinc gluconate causes hyposmia and anosmia, sometimes permanently, satisfying all nine Bradford Hill criteria',
      ],
      unsupportedInferences: [
        'That daily zinc supports immunity in a replete adult — the prevention arm of the Cochrane review is null',
        'That the cold benefit transfers across salts and doses, when the entire effect is confined to high-dose acetate and near-acetate formulations',
        'That the AREDS eye result licenses zinc for the general population, when zinc alone missed the prespecified significance level in the full cohort',
        'That long-term high-dose zinc is harmless, when the same mechanism is an approved copper-blocking drug',
      ],
      whatFailedInitially: [
        'Zinc and vitamin C in outpatient COVID-19: 214 patients, stopped early, P = .45',
        'The first two decades of zinc lozenge trials, which were testing doses and formulations that could not release free zinc',
        'Intranasal zinc as a cold remedy, which caused permanent olfactory loss and was withdrawn from the US market in 2009',
      ],
      realWorldOutcome: [
        'Zinc is one of very few over-the-counter cold treatments with any positive randomised signal, and the signal is genuine within its dose and salt window',
        'The best-evidenced use of oral zinc anywhere is childhood diarrhoea in populations where deficiency is common — a repletion effect, not an antiviral one',
        'Copper deficiency from sustained zinc is under-recognised because it presents to haematology or neurology, not to the person selling the zinc',
      ],
    },
    deliverySystem: {
      type: 'Oral lozenge, tablet, capsule or syrup; formerly also an intranasal gel',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. The lozenge and the swallowed capsule are pharmacologically different interventions: the lozenge acts locally in the oropharynx through free ionic zinc, the capsule acts systemically after ZIP4-mediated absorption, and evidence for one does not transfer to the other. The intranasal route is a third thing again and caused permanent injury. Elemental zinc is a minority of every salt by mass — 36% of zinc acetate, 14% of zinc gluconate — so label doses are not comparable unless the elemental figure is given.',
      safetyProfile:
        'Unpleasant taste, nausea and mouth irritation are common with high-dose lozenges and probably compromised blinding in some trials; Cochrane found non-serious adverse events probably increased with treatment zinc at RR 1.34. Sustained high-dose oral zinc induces intestinal metallothionein and causes copper deficiency, presenting as sideroblastic anaemia, neutropenia, or a myelopathy with spastic gait and sensory ataxia in which the haematology reverses on copper replacement and the neurology often does not. Zinc reduces absorption of tetracycline and fluoroquinolone antibiotics and of penicillamine. Intranasal zinc gluconate is directly toxic to olfactory epithelium and should not be used.',
    },
    commonQuestions: [
      {
        q: 'Does zinc actually shorten a cold?',
        a: 'Probably, within a narrow window. The 2024 Cochrane review found treatment shortened colds by about 2.4 days but graded that low certainty because the trials disagreed enormously. Hemila\'s earlier analysis explains why they disagreed: every trial using less than 75 mg of zinc a day found nothing, and the trials using more than that — especially as zinc acetate — found reductions of 20 to 42 percent. So the honest answer is that some zinc products plausibly work and many cannot, and the label rarely tells you which you have bought.',
        auditNote:
          'Free ionic zinc is the active species, and citric acid, tartaric acid, sorbitol and mannitol in a lozenge chelate it away.',
      },
      {
        q: 'Should I take zinc every day to avoid getting colds?',
        a: 'The prevention evidence is null. Across nine trials and 1,449 participants the risk ratio for developing a cold was 0.93 with a confidence interval that crosses one, graded low certainty. Meanwhile daily long-term zinc is the exposure that causes copper depletion, and copper depletion is not a mild condition. Prevention is the use with the weakest evidence and the greatest cumulative exposure, which is an unfavourable combination.',
      },
      {
        q: 'How can zinc cause a copper deficiency?',
        a: 'Because it is supposed to. Zinc switches on metallothionein inside gut cells, metallothionein binds copper harder than it binds zinc, and the trapped copper leaves the body when the cell is shed a few days later. The FDA licensed zinc acetate as a prescription drug for Wilson disease on precisely this mechanism, because in Wilson disease blocking copper is the goal. In anyone else, sustained high-dose zinc has produced sideroblastic anaemia, severe neutropenia and a spinal cord syndrome resembling B12 deficiency. The blood problems fix completely with copper. The neurological ones frequently do not.',
        auditNote:
          'AREDS put 2 mg of copper into its formula alongside 80 mg of zinc for exactly this reason.',
      },
      {
        q: 'What happened with zinc nasal sprays?',
        a: 'They destroyed people\'s sense of smell. Jafek and colleagues described a series of severe hyposmia and anosmia after intranasal zinc gluconate and concluded that zinc ions are directly toxic to olfactory epithelium, with loss that was long-lasting or permanent in some cases. Davidson and Smith later ran the full nine Bradford Hill causation criteria over 25 such patients and found causation supported. The products were withdrawn from the US market in 2009. Nothing about that finding applies to a lozenge, and nothing about lozenge evidence excused the nasal product.',
      },
      {
        q: 'Is the zinc in my multivitamin doing anything?',
        a: 'If you are not zinc-deficient, most likely nothing you would notice, and it is far below the lozenge doses that shortened colds. If you are deficient — through malabsorption, a very high-phytate diet, or acrodermatitis enteropathica — then zinc is genuinely essential and repletion matters a great deal. The pattern across the whole zinc literature, from childhood diarrhoea to cold duration, is that the effect is biggest where the deficiency is real and vanishes where it is not.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Age-Related Eye Disease Study Research Group. A randomized, placebo-controlled, clinical trial of high-dose supplementation with vitamins C and E, beta carotene, and zinc for age-related macular degeneration and vision loss: AREDS report no. 8. Arch Ophthalmol 2001;119:1417-1436',
        identifier: '10.1001/archopht.119.10.1417',
        kind: 'doi',
      },
      {
        label:
          'Jafek BW, Linschoten MR, Murrow BW. Anosmia after intranasal zinc gluconate use. Am J Rhinol 2004;18:137-141',
        identifier: '15283486',
        kind: 'pmid',
      },
      {
        label:
          'Willis MS et al. Zinc-induced copper deficiency: a report of three cases initially recognized on bone marrow examination. Am J Clin Pathol 2005;123:125-131',
        identifier: '10.1309/V6GVYW2QTYD5C5PJ',
        kind: 'doi',
      },
      {
        label: 'Kumar N. Copper deficiency myelopathy (human swayback). Mayo Clin Proc 2006;81:1371-1384',
        identifier: '10.4065/81.10.1371',
        kind: 'doi',
      },
      {
        label:
          'Davidson TM, Smith WM. The Bradford Hill criteria and zinc-induced anosmia: a causality analysis. Arch Otolaryngol Head Neck Surg 2010;136:673-676',
        identifier: '10.1001/archoto.2010.111',
        kind: 'doi',
      },
      {
        label:
          'Hemila H. Zinc lozenges may shorten the duration of colds: a systematic review. Open Respir Med J 2011;5:51-58',
        identifier: '10.2174/1874306401105010051',
        kind: 'doi',
      },
      {
        label:
          'Lazzerini M, Wanzira H. Oral zinc for treating diarrhoea in children. Cochrane Database Syst Rev 2016;12:CD005436',
        identifier: '10.1002/14651858.CD005436.pub5',
        kind: 'doi',
      },
      {
        label:
          'Thomas S et al. Effect of high-dose zinc and ascorbic acid supplementation vs usual care on symptom length and reduction among ambulatory patients with SARS-CoV-2 infection: the COVID A to Z randomized clinical trial. JAMA Netw Open 2021;4:e210369',
        identifier: '10.1001/jamanetworkopen.2021.0369',
        kind: 'doi',
      },
      {
        label: 'COVID A to Z trial registration',
        identifier: 'NCT04342728',
        kind: 'nct',
      },
      {
        label:
          'Nault D et al. Zinc for prevention and treatment of the common cold. Cochrane Database Syst Rev 2024;5:CD014914',
        identifier: '10.1002/14651858.CD014914.pub2',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA — NDA 020458, GALZIN (zinc acetate) capsules for Wilson disease',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020458',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 11192 — Zinc acetate',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/11192',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Vitamin C — an 8% shorter cold, a Nobel laureate's cancer claim that two randomised trials
  // buried, and a sepsis trial in which intravenous vitamin C made patients measurably worse.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vitamin-c-ascorbic-acid',
    name: 'Vitamin C',
    tradeName: 'Ascorbic acid; L-ascorbate',
    sponsor:
      'No single sponsor — L-ascorbic acid, manufactured industrially from glucose by the Reichstein process or by two-step bacterial fermentation, sold by many manufacturers',
    targetGene: 'P4HA1',
    targetProtein:
      'The Fe(II)- and 2-oxoglutarate-dependent dioxygenases, above all prolyl 4-hydroxylase (P4HA1) and lysyl hydroxylase, which hydroxylate collagen and cannot complete their catalytic cycle without ascorbate to re-reduce the active-site iron. Transport into cells is by the sodium-dependent vitamin C transporters SVCT1 (SLC23A1) and SVCT2 (SLC23A2).',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for colds, immunity, skin and antioxidant protection. Not approved by the FDA or EMA for any of those. Ascorbic acid is separately a genuine treatment for scurvy, which is a real and rapidly fatal disease that vitamin C cures completely.',
    patientFriendlyIndication: 'Taken to prevent or shorten colds, and for general immune support',
    conditionContext: {
      conditionExplainer:
        'Humans are among the few mammals that cannot make vitamin C, because the gene for the last enzyme in the synthesis pathway, L-gulonolactone oxidase, is a broken pseudogene in our species. Without dietary ascorbate, collagen cannot be hydroxylated, connective tissue fails, and scurvy kills. That is the deficiency disease, and it is completely reversed by small amounts.',
      whyItMatters:
        'The gap between "essential nutrient whose absence kills" and "supplement that does something useful in a person who already has enough" is the widest in this file for vitamin C, and it was opened deliberately. Linus Pauling, a double Nobel laureate, spent the last decades of his life arguing that gram doses prevented colds and treated cancer. The randomised answer to the first is a small effect and to the second is no effect at all.',
      whoTakesThis:
        'Almost everyone at some point, usually at the first sneeze. Also people with genuinely low intake — smokers, people with very restricted diets, patients on dialysis or with malabsorption — and, for a period after 2017, critically ill patients in intensive care units that adopted an intravenous protocol.',
      clinicalGoals:
        'Trials measured incidence and duration of colds, cardiovascular events, cancer incidence, organ failure scores in sepsis, 28-day mortality, and incident kidney stones.',
    },
    oneSentenceVerdict:
      'Regular vitamin C shortens colds by about 8% in adults and does not prevent them in the general population, except in people under extreme physical stress where it halves incidence; the cancer claim failed two randomised trials, and in 872 septic ICU patients intravenous vitamin C increased death or persistent organ dysfunction.',
    laymanHowItWorks:
      'Vitamin C is not an antioxidant in the way the label implies. Its actual job is to keep the iron atom inside a family of enzymes in the right chemical state so those enzymes can keep working — most importantly the ones that build collagen, which is why running out causes teeth to loosen and old wounds to reopen. Once those enzymes have what they need, extra vitamin C has nothing to do. Above a certain intake the gut simply stops absorbing it and the kidney dumps the rest, which is why the plasma level is nearly flat across a very wide range of doses.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 46,
    anatomicalSite:
      'Cytosol of every cell via SVCT2, with the highest concentrations in adrenal cortex, pituitary, brain and neutrophils; absorption is SVCT1-mediated in the small intestine',
    substitutes: {
      summary:
        'For scurvy, vitamin C is not substitutable and works within days. For colds, the honest comparator is nothing, since 8% of a seven-day cold is about half a day. For sepsis the comparator turned out to be placebo, and placebo won.',
      conventionalRx: [
        {
          name: 'Ascorbic acid as treatment for scurvy',
          class: 'Nutrient replacement for a defined deficiency disease',
          howItCompares:
            'Complete and rapid cure of a disease that is otherwise fatal, established well before controlled trials existed. It is the strongest possible evidence that vitamin C is essential, and it says nothing whatever about the effect of extra vitamin C in someone who is not deficient.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: unambiguous, mechanistically understood, fast. Cons: routinely used as rhetorical cover for claims about replete adults, which is the central error this file exists to name.',
        },
        {
          name: 'Intravenous vitamin C in sepsis, as the cautionary comparator',
          class: 'Investigational critical-care intervention, now negative',
          howItCompares:
            'Between 2017 and 2022 this went from a widely adopted ICU protocol to a randomised finding of harm. LOVIT found death or persistent organ dysfunction at day 28 in 44.5% on vitamin C against 38.5% on placebo, risk ratio 1.21 (95% CI 1.04 to 1.40, P = 0.01).',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: none demonstrated. Cons: a randomised signal of harm, from a trial designed to look for benefit.',
        },
      ],
      naturalFoods: [
        {
          name: 'Citrus, capsicum, blackcurrant, broccoli and potatoes',
          activeCompound: 'L-ascorbic acid, chemically identical to the synthetic form',
          biologicalMechanism:
            'Dietary and synthetic ascorbate are the same molecule and use the same SVCT1 transporter. The only meaningful difference is dose: food delivers amounts in the range where absorption is near-complete, whereas gram doses fall on the saturated part of the curve and are largely excreted.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the Cochrane review excluded any trial using less than 0.2 g per day, and its adult duration effect came from regimens at or above that.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Vitamin C taken with a plant-source iron meal',
          activeCompound: 'Ascorbate as a non-haem iron reductant and chelator',
          biologicalMechanism:
            'Ascorbate reduces dietary Fe(III) to Fe(II) and forms a soluble chelate that survives the alkaline duodenum, substantially increasing non-haem iron absorption. This is one of the few supplemental vitamin C effects that is mechanistically direct, measurable, and useful in ordinary people.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Check whether a vitamin C result was prevention or treatment',
          action:
            'The Cochrane review separates regular daily supplementation from taking it once symptoms start. The two gave different answers, and the popular claim conflates them.',
          patientImpact:
            'Regular supplementation shortened colds by 8% in adults and 14% in children. Taking vitamin C after symptoms began produced no consistent effect on duration or severity in the therapeutic trials.',
          clinicalPrecaution:
            'Doses above roughly a gram exceed absorptive capacity and cause osmotic diarrhoea, and in a Swedish cohort of 23,355 men supplement users had roughly twice the incidence of kidney stones.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C([C@@H]([C@@H]1C(=C(C(=O)O1)O)O)O)O',
      chemicalFormula: 'C6H8O6',
      molecularWeight: '176.12 g/mol',
      targetReceptorAffinity:
        'Not a receptor ligand. It is a co-substrate: it reduces the Fe(III) that accumulates at the active site of 2-oxoglutarate-dependent dioxygenases back to Fe(II), restoring catalytic competence.',
      structureSource: {
        label: 'PubChem CID 54670067 — L-Ascorbic acid, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54670067',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vitc-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay for intact ascorbate against its oxidation product',
          description:
            'Ascorbate oxidises to dehydroascorbate in air, in light, and in neutral aqueous solution, and dehydroascorbate is not what any of the biology needs. A total-vitamin-C assay reports both together and will pass a degraded preparation. Discriminate them before anything else happens, and re-check at the point of use rather than only at manufacture.',
          reagentsAndBuffer:
            'HPLC with electrochemical detection at low potential; metaphosphoric acid with EDTA as the stabilising extraction medium; tris(2-carboxyethyl)phosphine reduction step run in parallel to give total versus reduced ascorbate; amber glassware and argon headspace',
        },
        {
          id: 'vitc-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the 13C-labelled tracer for a saturation-kinetics study',
          description:
            'Because plasma ascorbate is tightly controlled by intestinal saturation and renal threshold, a dose-response study needs a tracer to separate newly absorbed vitamin from the existing body pool. This is the step that produced the finding that plasma concentration is nearly flat above a modest oral intake.',
          dependsOnStepId: 'vitc-w1',
          reagentsAndBuffer:
            '13C6-L-ascorbic acid; deoxygenated water; nitrogen-purged dissolution; LC-MS/MS confirmation of isotopic enrichment and absence of the dehydro form',
        },
        {
          id: 'vitc-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Sample handling that does not destroy the analyte before measurement',
          description:
            'More published vitamin C measurements have been ruined by sample handling than by any assay problem. Whole blood must be acidified and frozen fast; ascorbate in plasma left at room temperature is measurably gone within hours. Establish the handling protocol as a validated step, not an afterthought.',
          dependsOnStepId: 'vitc-w2',
          reagentsAndBuffer:
            'Immediate 1:1 dilution into 10% metaphosphoric acid with 1 mM EDTA and 1 mM dithiothreitol; centrifugation at 4 degrees C within 30 minutes; storage at -80 degrees C; documented freeze-thaw stability curve',
        },
        {
          id: 'vitc-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'SVCT2-dependent uptake and the pro-oxidant crossover at pharmacological concentration',
          description:
            'At oral doses ascorbate is an electron donor that keeps enzyme iron reduced. At the millimolar plasma concentrations only intravenous infusion can reach, it reduces free transition metals and generates hydrogen peroxide, which is the proposed anticancer mechanism and also the most plausible explanation for harm in critically ill patients whose free iron is elevated. Run both concentration regimes in the same system.',
          dependsOnStepId: 'vitc-w3',
          reagentsAndBuffer:
            'SVCT2-expressing and SVCT2-knockdown cell lines; sodium-free choline buffer as the transporter specificity control; ascorbate at 50 micromolar and at 5 millimolar; catalase to quench extracellular hydrogen peroxide; Amplex Red peroxide assay; calcein-AM labile iron pool measurement',
        },
        {
          id: 'vitc-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Prolyl hydroxylation as the functional readout, not an antioxidant proxy',
          description:
            'Report the enzymatic consequence, since that is what the vitamin actually does. Measure 4-hydroxyproline content of newly synthesised collagen and the hydroxylation status of HIF-1alpha, which are direct outputs of ascorbate-dependent dioxygenases. Total antioxidant capacity assays measure a chemical property of the sample and predict nothing clinical.',
          dependsOnStepId: 'vitc-w4',
          reagentsAndBuffer:
            'Amino acid analysis for 4-hydroxyproline in acid-hydrolysed collagen; HIF-1alpha hydroxyproline-402/564 specific antibodies; proline hydroxylase activity assay with 2-oxoglutarate and Fe(II); ascorbate-depleted Gulo-knockout mouse fibroblasts as the deficiency control',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vitc-a1',
        category: 'measured',
        title: 'Cochrane: no prevention in the general public, 8% shorter colds in adults',
        laymanSummary:
          'Across 11,306 people, daily vitamin C did not reduce how often adults caught colds. It did make colds slightly shorter — about eight percent, or roughly half a day.',
        technicalDetails:
          'Twenty-nine trial comparisons in 11,306 participants contributed to the incidence analysis. In general-community trials covering 10,708 participants the pooled risk ratio for developing a cold was 0.97 (95% CI 0.94 to 1.00) — a boundary result at best. Thirty-one comparisons covering 9,745 cold episodes examined duration: colds were 8% shorter in adults (95% CI 3% to 12%) and 14% shorter in children (95% CI 7% to 21%), with 1 to 2 g per day in children shortening colds by 18%. Trials using less than 0.2 g per day and trials without a placebo were excluded, so this is the higher-dose literature. The therapeutic trials, in which vitamin C was started after symptoms began, showed no consistent effect. The distinction between regular prophylaxis and treatment-at-onset is where nearly all popular confusion about vitamin C lives.',
        evidenceSource: 'Hemila H, Chalker E. Cochrane Database Syst Rev 2013;1:CD000980',
        doi: '10.1002/14651858.CD000980.pub4',
        measuredMetric:
          'Risk ratio for developing at least one cold, and percentage reduction in mean cold duration',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a2',
        category: 'measured',
        title: 'The one population where it halved cold incidence: extreme physical stress',
        laymanSummary:
          'In marathon runners, skiers and soldiers on subarctic exercises, vitamin C cut the number of colds by half. In everyone else it did nothing.',
        technicalDetails:
          'Five trials in a total of 598 marathon runners, skiers and soldiers undertaking subarctic exercises pooled to a risk ratio of 0.48 (95% CI 0.35 to 0.64) for developing a cold, against 0.97 (95% CI 0.94 to 1.00) in the 10,708 general-community participants. This is one of the sharpest subgroup separations anywhere in the supplement literature, and it is not a subgroup fished from a single trial: it is a prespecified population category with five independent trials pointing the same way. The interpretation is genuinely unsettled. It may be a repletion effect in people whose intake cannot keep up with turnover under extreme exertion, or a specific effect of oxidative stress at that intensity. Either way, the honest statement is that the population in which vitamin C halves cold incidence is one almost nobody buying it belongs to.',
        evidenceSource: 'Hemila H, Chalker E. Cochrane Database Syst Rev 2013;1:CD000980',
        doi: '10.1002/14651858.CD000980.pub4',
        measuredMetric:
          'Pooled risk ratio for developing a cold in subjects under extreme short-term physical stress',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a3',
        category: 'conclusion_shift',
        title: 'Pauling\'s cancer claim, and the two Mayo trials that ended it',
        laymanSummary:
          'A double Nobel laureate spent decades arguing that high-dose vitamin C treated advanced cancer. Two randomised double-blind trials found no benefit whatsoever.',
        technicalDetails:
          'Moertel and colleagues at the Mayo Clinic randomised 100 patients with advanced colorectal cancer, none of whom had received any prior cytotoxic drugs — the precise population in which the claim was said to hold — to 10 g of vitamin C daily or placebo, double-blind. There was no advantage over placebo in time from start of treatment to disease progression or in survival, and among patients with measurable disease none had objective improvement. The authors wrote that on the basis of this and their previous randomised study, high-dose vitamin C is not effective against advanced malignant disease regardless of prior chemotherapy. The scientific residue of the episode is instructive: Pauling\'s original supporting data came from a non-randomised comparison against historical controls at a hospital where patients entering the vitamin C group were selected differently. The mechanism was never absurd — ascorbate at millimolar concentration does generate hydrogen peroxide near tumour cells — but that mechanism was tested and did not produce the outcome.',
        evidenceSource: 'Moertel CG et al. N Engl J Med 1985;312:137-141',
        doi: '10.1056/NEJM198501173120301',
        measuredMetric:
          'Interval from start of treatment to disease progression, survival, and objective tumour response',
        inferredClaim:
          'That a plausible biochemical mechanism plus an eminent advocate plus a favourable non-randomised series establishes a treatment effect',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a4',
        category: 'failed',
        title: 'LOVIT: intravenous vitamin C made septic patients worse',
        laymanSummary:
          'In 872 intensive-care patients with sepsis, those given intravenous vitamin C were more likely to die or still be on organ support at 28 days than those given placebo.',
        technicalDetails:
          'LOVIT randomised 872 adults who had been in the ICU no longer than 24 hours with proven or suspected infection as the main diagnosis and who were receiving a vasopressor, to vitamin C 50 mg/kg or matched placebo every 6 hours for up to 96 hours. The composite primary outcome of death or persistent organ dysfunction at day 28 occurred in 191 of 429 (44.5%) on vitamin C against 167 of 434 (38.5%) on placebo — risk ratio 1.21 (95% CI 1.04 to 1.40, P = 0.01). Death alone was 35.4% against 31.6% (RR 1.17, 95% CI 0.98 to 1.40) and persistent organ dysfunction 9.1% against 6.9% (RR 1.30, 95% CI 0.83 to 2.05). One vitamin C patient had a severe hypoglycaemic episode and another a serious anaphylaxis event. Organ dysfunction scores, biomarkers, six-month survival and quality of life were similar. This is a randomised finding of harm from a trial powered and designed to detect benefit, and it is the single most important vitamin C result of the last decade.',
        evidenceSource: 'Lamontagne F et al. N Engl J Med 2022;386:2387-2398',
        doi: '10.1056/NEJMoa2200644',
        measuredMetric:
          'Composite of death or persistent organ dysfunction at day 28 in septic ICU patients on vasopressors',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a5',
        category: 'conclusion_shift',
        title: 'The sepsis protocol that spread from a 47-patient before-after study',
        laymanSummary:
          'A single small retrospective study reported that a vitamin C protocol cut sepsis deaths from 40 percent to 8 percent. Intensive care units adopted it worldwide. The randomised trials that followed found nothing, then found harm.',
        technicalDetails:
          'Marik and colleagues published a retrospective before-after study of 47 treated and 47 historical control patients, reporting hospital mortality of 8.5% against 40.4% (P < .001) and a propensity-adjusted odds ratio for mortality of 0.13 (95% CI 0.04 to 0.48). The design is the weakest one that can produce a number: no randomisation, no blinding, sequential time periods, and a control group assembled from the preceding seven months. Adoption nevertheless outran the evidence by years. CITRIS-ALI then randomised 167 patients with sepsis and ARDS and found no difference in the primary endpoints — modified SOFA score change from baseline to 96 hours differed by -0.10 (95% CI -1.23 to 1.03, P = .86), C-reactive protein P = .33. The VITAMINS trial compared vitamin C, hydrocortisone and thiamine against hydrocortisone alone in septic shock and found no difference in time alive and free of vasopressors. LOVIT then found harm. CHEST published an Editor\'s Note attached to the original 2017 paper in 2023.',
        evidenceSource:
          'Marik PE et al. Chest 2017;151:1229-1238; Fowler AA et al. JAMA 2019;322:1261-1270; Fujii T et al. JAMA 2020;323:423-431',
        doi: '10.1001/jama.2019.11825',
        measuredMetric:
          'Hospital mortality (retrospective), modified SOFA score change to 96 hours, and time alive and free of vasopressor support',
        inferredClaim:
          'That a before-after study with historical controls can establish a mortality benefit large enough to change practice before randomisation',
        auditFlag: 'contested',
      },
      {
        id: 'vitc-a6',
        category: 'failed',
        title: 'Physicians\' Health Study II: 14,641 men, eight years, no cardiovascular effect',
        laymanSummary:
          'A long randomised trial gave 500 mg of vitamin C a day to nearly fifteen thousand male doctors for eight years. It made no difference to heart attacks, strokes or cardiovascular death.',
        technicalDetails:
          'The Physicians\' Health Study II randomised 14,641 male physicians aged 50 or older to vitamin C 500 mg daily, vitamin E 400 IU every other day, both, or placebo, in a factorial design with a mean follow-up of eight years. Neither vitamin C nor vitamin E reduced the composite of major cardiovascular events, and neither reduced total mortality. Vitamin E was associated with an increased risk of haemorrhagic stroke. The companion cancer analysis from the same cohort found neither vitamin reduced prostate cancer or total cancer incidence. Eight years of randomised supplementation in a well-nourished population is exactly the design that should have detected an antioxidant benefit if one existed at that dose, and it detected none.',
        evidenceSource: 'Sesso HD et al. JAMA 2008;300:2123-2133',
        doi: '10.1001/jama.2008.600',
        measuredMetric:
          'Composite of nonfatal myocardial infarction, nonfatal stroke and cardiovascular death over eight years',
        auditFlag: 'verified',
      },
      {
        id: 'vitc-a7',
        category: 'inferred',
        title: 'Kidney stones: roughly double the incidence in supplement users',
        laymanSummary:
          'In a cohort of 23,355 Swedish men followed for eleven years, those taking vitamin C supplements developed kidney stones at about twice the rate of non-users.',
        technicalDetails:
          'Thomas and colleagues followed 23,355 men in the Cohort of Swedish Men from 1998 to 2009 and identified 436 first incident kidney stones: 31 among ascorbic acid supplement users and 405 among non-users. The multivariable-adjusted relative risk for ascorbic-acid-only supplement users against non-users was 1.92 (95% CI 1.33 to 2.77), with a dose gradient — men taking seven or more tablets weekly had a relative risk of 2.23 (95% CI 1.28 to 3.88). The mechanism is direct: oxalate is a terminal metabolite of ascorbate, and urinary oxalate is the dominant driver of calcium oxalate stone formation. This is observational, so confounding by indication cannot be excluded, and the absolute numbers are small. It is nonetheless the most concrete harm signal attached to ordinary consumer use of vitamin C, and it is not on any label.',
        evidenceSource: 'Thomas LDK et al. JAMA Intern Med 2013;173:386-388',
        doi: '10.1001/jamainternmed.2013.2296',
        measuredMetric:
          'Incidence of first kidney stone over 11 years in ascorbic acid supplement users versus non-users',
        inferredClaim:
          'That high-dose vitamin C is harmless because the excess is excreted — the excess is excreted as oxalate, through the kidney',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A broken gene is why we need it at all',
        laymanDesc:
          'Most animals make their own vitamin C. Humans carry the gene for the final step of the pathway, but it is broken, so we have to eat it.',
        molecularDetail:
          'L-gulonolactone oxidase (GULO) is a non-functional pseudogene in haplorrhine primates, guinea pigs and some bats. Every other step of the glucose-to-ascorbate pathway is intact in humans. The consequence is that ascorbate is a vitamin for us and a metabolite for a rat, which is why rodent models of vitamin C biology require the Gulo-knockout mouse to be informative at all.',
        iconName: 'Dna',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorption saturates, and the kidney does the rest',
        laymanDesc:
          'The gut can only take up so much at a time, and once blood levels pass a threshold the kidney simply excretes the surplus. This is why a gram and ten grams end up looking nearly the same in the bloodstream.',
        molecularDetail:
          'SVCT1 (SLC23A1) mediates saturable sodium-dependent absorption in the small intestine and reabsorption in the renal proximal tubule. Fractional absorption falls steeply with dose while the renal threshold caps plasma concentration, producing a near-flat plasma dose-response above a modest intake. This pharmacokinetic ceiling is the single most important fact about oral vitamin C and the reason intravenous administration was pursued at all.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Its real job: resetting the iron inside collagen-building enzymes',
        laymanDesc:
          'Vitamin C is not mopping up damage. It is a repair crew for a specific set of enzymes whose iron atom gets stuck in the wrong state after each reaction and cannot work again until something resets it.',
        molecularDetail:
          'Prolyl 4-hydroxylase and lysyl hydroxylase are Fe(II)- and 2-oxoglutarate-dependent dioxygenases. Uncoupled turnover leaves Fe(III) at the active site; ascorbate reduces it back to Fe(II). Without that reset, procollagen is under-hydroxylated, the triple helix is unstable, and connective tissue fails. The same enzyme family includes the HIF prolyl hydroxylases and several DNA and histone demethylases, which is why ascorbate has effects on gene regulation that have nothing to do with antioxidant chemistry.',
        iconName: 'Wrench',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'At intravenous concentrations it stops being an antioxidant',
        laymanDesc:
          'At the enormous concentrations only a drip can produce, vitamin C flips character and starts generating hydrogen peroxide. That was the hoped-for anticancer mechanism, and it is also the most likely reason it hurt septic patients.',
        molecularDetail:
          'At millimolar extracellular concentration ascorbate reduces catalytically available transition metals, driving Fenton chemistry and generating extracellular hydrogen peroxide. Critically ill patients have elevated free iron and impaired antioxidant defences, which is the condition under which that chemistry does damage rather than good. LOVIT\'s risk ratio of 1.21 for death or persistent organ dysfunction is the clinical form of this step.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'What leaves the body, and where it goes on the way out',
        laymanDesc:
          'The vitamin C you do not use is broken down partly into oxalate and passed in urine — which is the chemical that forms the most common kind of kidney stone.',
        molecularDetail:
          'Ascorbate degrades through dehydroascorbate and 2,3-diketogulonate to oxalate, which is excreted renally and is the anion in calcium oxalate stones. In the Cohort of Swedish Men, ascorbic-acid-only supplement users had a multivariable relative risk of first kidney stone of 1.92 (95% CI 1.33 to 2.77) with a dose gradient to 2.23 at seven or more tablets weekly.',
        iconName: 'Droplets',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD000980 — vitamin C for preventing and treating the common cold',
        phase: 'Cochrane systematic review of placebo-controlled trials',
        sampleSize: 11306,
        primaryEndpoint: 'Incidence and duration of the common cold under regular supplementation',
        endpointMet: false,
        statisticalPValue:
          'General community incidence RR 0.97 (95% CI 0.94 to 1.00); adult duration reduced 8% (95% CI 3% to 12%); children 14% (95% CI 7% to 21%)',
        unreportedAdverseSignals:
          'Trials using less than 0.2 g/day were excluded, so this is not evidence about ordinary multivitamin doses. Therapeutic administration at symptom onset showed no consistent effect, which is the way most people actually use it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Moertel 1985 — high-dose vitamin C in advanced colorectal cancer',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 100,
        primaryEndpoint: 'Time to disease progression and survival on 10 g/day vitamin C',
        endpointMet: false,
        statisticalPValue:
          'No advantage over placebo for time to progression or survival; no objective response among patients with measurable disease',
        unreportedAdverseSignals:
          'This was the second Mayo Clinic randomised trial to test the claim, and it was run specifically in chemotherapy-naive patients because that was the population the claim had retreated to after the first.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Physicians\' Health Study II — vitamin C and vitamin E in cardiovascular prevention',
        phase: 'Randomised double-blind placebo-controlled factorial',
        sampleSize: 14641,
        primaryEndpoint:
          'Composite of nonfatal myocardial infarction, nonfatal stroke and cardiovascular death',
        endpointMet: false,
        statisticalPValue: 'No significant effect of vitamin C on the composite endpoint over eight years',
        unreportedAdverseSignals:
          'Vitamin E in the same trial was associated with an increased risk of haemorrhagic stroke. The companion analysis found no reduction in prostate or total cancer.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CITRIS-ALI — intravenous vitamin C in sepsis with acute respiratory failure',
        phase: 'Randomised double-blind placebo-controlled multicentre',
        sampleSize: 167,
        primaryEndpoint:
          'Change in modified SOFA score from baseline to 96 hours, plus CRP and thrombomodulin',
        endpointMet: false,
        statisticalPValue:
          'Modified SOFA difference -0.10 (95% CI -1.23 to 1.03), P = .86; CRP P = .33',
        unreportedAdverseSignals:
          'Only 103 of 167 patients (62%) completed follow-up to day 60. Secondary mortality analyses from this trial were widely quoted as positive despite the primary endpoints being null.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'LOVIT — intravenous vitamin C in adults with sepsis in the ICU',
        phase: 'Randomised placebo-controlled',
        sampleSize: 872,
        primaryEndpoint: 'Composite of death or persistent organ dysfunction at day 28',
        endpointMet: false,
        statisticalPValue: 'Risk ratio 1.21 (95% CI 1.04 to 1.40), P = 0.01 — favouring placebo',
        unreportedAdverseSignals:
          'One severe hypoglycaemic episode and one serious anaphylaxis event in the vitamin C group. High-dose ascorbate also interferes with point-of-care glucose meters, which is a documented cause of dangerous mismanagement.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Regular vitamin C shortened colds by 8% in adults and 14% in children across 9,745 cold episodes',
        'It did not reduce cold incidence in the general community, RR 0.97 (95% CI 0.94 to 1.00) in 10,708 participants',
        'It halved cold incidence in marathon runners, skiers and soldiers on subarctic exercises, RR 0.48 across five trials',
        'Intravenous vitamin C increased death or persistent organ dysfunction in septic ICU patients, RR 1.21 (P = 0.01)',
        'Supplement users in a 23,355-man cohort had roughly double the incidence of kidney stones, with a dose gradient',
      ],
      unsupportedInferences: [
        'That vitamin C prevents colds in ordinary people, which the largest pooled estimate rules out to within a few percent',
        'That taking it once symptoms start helps, which the therapeutic trials do not support',
        'That high-dose vitamin C treats cancer, tested twice at the Mayo Clinic and negative both times',
        'That because the excess is excreted, more is harmless — the excess is excreted partly as oxalate',
      ],
      whatFailedInitially: [
        'Pauling\'s cancer programme, which rested on a non-randomised comparison against historical controls',
        'The Marik sepsis protocol, adopted worldwide from a 47-patient before-after study and then negative in CITRIS-ALI, VITAMINS and LOVIT',
        'Vitamin C as cardiovascular prevention, null across 14,641 men and eight years in Physicians\' Health Study II',
      ],
      realWorldOutcome: [
        'Vitamin C is unambiguously essential, and scurvy is a real disease that it cures completely and quickly',
        'The measurable supplement effects in replete people are small: about half a day off a cold, and better absorption of non-haem iron',
        'The clearest large effects in the modern literature are in the wrong direction — harm in sepsis, and stones in the community',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule, powder or effervescent; intravenous infusion in the critical-care literature',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. The oral and intravenous routes are not the same intervention: intestinal saturation caps oral plasma concentrations in the tens of micromolar, while infusion reaches millimolar, which is a different chemistry with a different risk profile. Liposomal and "buffered" formulations are marketed on the premise of beating the absorption ceiling; the ceiling is transporter-mediated and renal, and claims to have circumvented it need transporter-level evidence, not a plasma curve from a single small study.',
      safetyProfile:
        'Osmotic diarrhoea and abdominal cramping above roughly a gram, which is a direct consequence of unabsorbed ascorbate in the lumen. Increased urinary oxalate and, in a large prospective cohort, roughly double the incidence of kidney stones in supplement users. High-dose ascorbate causes falsely elevated readings on many point-of-care glucose meters, a documented hazard in hospitalised patients. In glucose-6-phosphate dehydrogenase deficiency, very high intravenous doses have precipitated haemolysis. In sepsis, intravenous administration increased death or persistent organ dysfunction in a randomised trial.',
    },
    commonQuestions: [
      {
        q: 'Does vitamin C stop me getting colds?',
        a: 'No, not if you are an ordinary person eating an ordinary diet. Across 10,708 people in general-community trials the risk ratio was 0.97 with a confidence interval reaching 1.00. The one striking exception is people under extreme short-term physical stress — marathon runners, skiers, soldiers on subarctic exercises — where five trials in 598 subjects pooled to a risk ratio of 0.48. That is a real and unusual finding, and it describes a population most buyers are not in.',
      },
      {
        q: 'Will it make my cold shorter if I take it now?',
        a: 'Probably not. The 8% shortening in adults comes from trials where people took vitamin C every day, before they got ill. Trials that started vitamin C once symptoms had already begun did not show a consistent effect on duration or severity. So the version of the habit almost everyone practises — reaching for it at the first sneeze — is the version with the weakest support.',
        auditNote:
          'Eight percent of a seven-day cold is about half a day, even in the prophylactic trials.',
      },
      {
        q: 'What happened with vitamin C and sepsis?',
        a: 'It is one of the clearest cautionary tales in modern critical care. A 47-patient retrospective before-after study in 2017 reported mortality falling from 40 percent to 8.5 percent, and units around the world adopted the protocol. CITRIS-ALI then randomised 167 patients and found no difference in its primary endpoints. The VITAMINS trial found no difference in time alive and free of vasopressors. Then LOVIT randomised 872 patients and found death or persistent organ dysfunction in 44.5 percent on vitamin C against 38.5 percent on placebo, risk ratio 1.21, P = 0.01. The sequence took five years and went from spectacular benefit to measurable harm.',
        auditNote:
          'CHEST attached an Editor\'s Note to the original 2017 paper in 2023.',
      },
      {
        q: 'Is there any downside to taking a lot?',
        a: 'Two documented ones. Above about a gram the gut cannot absorb it and the surplus draws water into the bowel, causing diarrhoea. And ascorbate is metabolised partly to oxalate, the anion in the commonest type of kidney stone: in 23,355 Swedish men followed eleven years, supplement users had a relative risk of first stone of 1.92, rising to 2.23 in those taking seven or more tablets weekly. High doses also make many hospital glucose meters read falsely high, which has led to real mismanagement.',
      },
      {
        q: 'Why is a nutrient that cures scurvy so weak as a supplement?',
        a: 'Because those are two different questions, and this is the cleanest example of the difference in the whole supplement aisle. Scurvy is what happens when a specific set of iron-dependent enzymes cannot complete their catalytic cycle. Restore enough ascorbate for those enzymes and they work; add more and there is nothing further for it to do, because the enzymes are already saturated and the kidney excretes the surplus. A deficiency effect is not a supplement effect, and vitamin C is the case that proves it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moertel CG et al. High-dose vitamin C versus placebo in the treatment of patients with advanced cancer who have had no prior chemotherapy: a randomized double-blind comparison. N Engl J Med 1985;312:137-141',
        identifier: '10.1056/NEJM198501173120301',
        kind: 'doi',
      },
      {
        label:
          'Sesso HD et al. Vitamins E and C in the prevention of cardiovascular disease in men: the Physicians\' Health Study II randomized controlled trial. JAMA 2008;300:2123-2133',
        identifier: '10.1001/jama.2008.600',
        kind: 'doi',
      },
      {
        label:
          'Hemila H, Chalker E. Vitamin C for preventing and treating the common cold. Cochrane Database Syst Rev 2013;1:CD000980',
        identifier: '10.1002/14651858.CD000980.pub4',
        kind: 'doi',
      },
      {
        label:
          'Thomas LDK, Elinder CG, Tiselius HG, Wolk A, Akesson A. Ascorbic acid supplements and kidney stone incidence among men: a prospective study. JAMA Intern Med 2013;173:386-388',
        identifier: '10.1001/jamainternmed.2013.2296',
        kind: 'doi',
      },
      {
        label:
          'Marik PE et al. Hydrocortisone, vitamin C, and thiamine for the treatment of severe sepsis and septic shock: a retrospective before-after study. Chest 2017;151:1229-1238',
        identifier: '10.1016/j.chest.2016.11.036',
        kind: 'doi',
      },
      {
        label:
          'Fowler AA et al. Effect of vitamin C infusion on organ failure and biomarkers of inflammation and vascular injury in patients with sepsis and severe acute respiratory failure: the CITRIS-ALI randomized clinical trial. JAMA 2019;322:1261-1270',
        identifier: '10.1001/jama.2019.11825',
        kind: 'doi',
      },
      {
        label:
          'Fujii T et al. Effect of vitamin C, hydrocortisone, and thiamine vs hydrocortisone alone on time alive and free of vasopressor support among patients with septic shock: the VITAMINS randomized clinical trial. JAMA 2020;323:423-431',
        identifier: '10.1001/jama.2019.22176',
        kind: 'doi',
      },
      {
        label:
          'Lamontagne F et al. Intravenous vitamin C in adults with sepsis in the intensive care unit. N Engl J Med 2022;386:2387-2398',
        identifier: '10.1056/NEJMoa2200644',
        kind: 'doi',
      },
      {
        label: 'CHEST Editor\'s Note attached to Marik PE et al. Chest 2017;151:1229-1238',
        identifier: '10.1016/j.chest.2023.04.021',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 54670067 — L-Ascorbic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/54670067',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Melatonin — the sleep-onset effect is real and it is seven minutes, the dose people take is ten
  // times physiological, and in 25 US gummy brands the melatonin ranged from 74% to 347% of label.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'melatonin',
    name: 'Melatonin',
    tradeName:
      'Prolonged-release melatonin is a prescription medicine in the EU as Circadin (EMEA/H/C/000695); in the US the same molecule is an unregulated dietary supplement',
    sponsor:
      'No single sponsor for the supplement — N-acetyl-5-methoxytryptamine, synthesised industrially. The EU prolonged-release product is held by RAD Neurim Pharmaceuticals.',
    targetGene: 'MTNR1A',
    targetProtein:
      'MT1 (MTNR1A) and MT2 (MTNR1B), Gi-coupled seven-transmembrane receptors. MT1 in the suprachiasmatic nucleus acutely suppresses neuronal firing, and MT2 mediates the phase-shifting of the circadian clock. The effect is chronobiotic before it is hypnotic: melatonin tells the clock what time it is rather than sedating the brain.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold over the counter in the US for insomnia, jet lag and children\'s sleep. In the European Union the same molecule requires a prescription, and prolonged-release melatonin is authorised only as short-term monotherapy for primary insomnia in patients aged 55 or over. The regulatory gap between the two jurisdictions is the largest for any substance in this file.',
    patientFriendlyIndication: 'Taken to fall asleep faster, and to reset the clock after flying',
    conditionContext: {
      conditionExplainer:
        'Melatonin is not a sedative. It is the hormone the pineal gland releases when it gets dark, and its job is to tell every clock-bearing cell in the body that night has begun. Taking it is closer to moving the hands of a clock than to switching off a light, which is why timing matters more than dose and why it works far better for a circadian problem than for ordinary insomnia.',
      whyItMatters:
        'It is the most-consumed sleep aid in the United States and the substance children are most often poisoned by. US sales rose from 285 million dollars in 2016 to 821 million in 2020, and over the same decade paediatric ingestions reported to poison centres rose 530 percent. Meanwhile the product is unregulated for content, and analyses keep finding that what is in the bottle is not what is on the label.',
      whoTakesThis:
        'Adults with insomnia, shift workers, travellers crossing time zones, people with delayed sleep-wake phase disorder, blind people with non-24-hour rhythms, and — increasingly and without good evidence for long-term use — children, often given it by parents.',
      clinicalGoals:
        'Trials measured sleep onset latency in minutes, total sleep time in minutes, sleep efficiency as a percentage of time in bed, subjective sleep quality scores, and circadian phase by dim-light melatonin onset.',
    },
    oneSentenceVerdict:
      'Melatonin genuinely shortens sleep onset, by about seven minutes across 19 trials and 1,683 people, and genuinely shifts circadian phase, which is a different and better-supported claim — but the typical retail dose is roughly ten times the physiological one, and in 25 US gummy brands the measured content ran from 74% to 347% of what the label said, with one containing no melatonin at all.',
    laymanHowItWorks:
      'When the light fades, a gland in your brain releases melatonin into the blood, and receptors on the master clock read that as the signal that night has started. Swallowing melatonin adds that signal at whatever hour you take it, which nudges the clock — forward if taken in the evening, backward if taken in the morning. It also has a mild direct drowsiness effect at the right moment in the evening. What it does not do is sedate you the way a sleeping pill does, which is why people who expect a knockout are disappointed and people who use it to move a body clock across time zones tend not to be.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 58,
    anatomicalSite:
      'Suprachiasmatic nucleus of the hypothalamus, where MT1 and MT2 receptors are densest; also retina, pars tuberalis and peripheral vasculature',
    substitutes: {
      summary:
        'For chronic insomnia, cognitive behavioural therapy for insomnia is the first-line treatment in every major guideline and outperforms melatonin substantially. For a circadian problem — jet lag, delayed sleep phase, shift work — correctly timed melatonin and correctly timed bright light are the two interventions with a mechanism that matches the problem.',
      conventionalRx: [
        {
          name: 'Prolonged-release melatonin 2 mg (Circadin), EU prescription medicine',
          class: 'Melatonin receptor agonist, authorised medicine',
          howItCompares:
            'The regulated version of the same molecule, assessed by the EMA and authorised in 2007 for short-term monotherapy in primary insomnia in patients aged 55 or over. Across three trials in 681 patients, 32% on Circadin (86 of 265) reported significant symptom improvement at three weeks against 19% on placebo (51 of 272).',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: known content, known release profile, a defined indication and an age restriction. Cons: a 13-percentage-point responder difference is modest, and the authorisation is deliberately narrow in a way the US supplement market simply is not.',
        },
        {
          name: 'Cognitive behavioural therapy for insomnia (CBT-I)',
          class: 'Behavioural therapy, first-line in guidelines',
          howItCompares:
            'Directly addresses the conditioned arousal and time-in-bed behaviours that maintain chronic insomnia. Its effect sizes on sleep onset latency and sleep efficiency are substantially larger than melatonin\'s and, unlike melatonin, persist after treatment stops.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: durable, no pharmacology, no content-variability problem. Cons: requires weeks of effort and access to a clinician or a structured programme, which is why a gummy wins on convenience every time.',
        },
      ],
      naturalFoods: [
        {
          name: 'Darkness in the two hours before bed',
          activeCompound: 'Endogenous melatonin, released when retinal light input falls',
          biologicalMechanism:
            'Melanopsin-containing retinal ganglion cells signal light directly to the suprachiasmatic nucleus, which suppresses pineal melatonin release. Short-wavelength light in the evening is the most potent suppressor. Removing that light restores the body\'s own signal at the correct time and correct amplitude, which no tablet can reproduce.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. The mechanistic point is that this is the same signal the supplement imitates, delivered by the system that knows the right dose.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Morning bright light, for the opposite direction',
          activeCompound: 'High-illuminance broad-spectrum light on the retina',
          biologicalMechanism:
            'Light in the early biological morning advances circadian phase, which is the intervention that pairs with evening melatonin for delayed sleep-wake phase disorder. The phase-response curves for light and for melatonin run in roughly opposite directions, which is why the two are used together and why timing errors make either one useless or counterproductive.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no timing or intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Treat melatonin as a clock signal, not a sedative',
          action:
            'Ask whether the sleep problem is a timing problem or an inability to sleep at a normal hour. Melatonin has a real mechanism for the first and a weak one for the second.',
          patientImpact:
            'For jet lag, a Cochrane review of ten randomised trials found melatonin remarkably effective. For primary insomnia, the pooled sleep onset benefit is about seven minutes.',
          clinicalPrecaution:
            'Melatonin was the substance most frequently ingested by children reported to US poison control centres in 2020. Over 2012 to 2021 there were 260,435 paediatric ingestions, a 530 percent increase, with five children requiring mechanical ventilation and two deaths.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)NCCC1=CNC2=C1C=C(C=C2)OC',
      chemicalFormula: 'C13H16N2O2',
      molecularWeight: '232.28 g/mol',
      targetReceptorAffinity:
        'Sub-nanomolar affinity at MT1 and MT2, both Gi-coupled. The relevant comparison is physiological: night-time plasma melatonin peaks in the tens to low hundreds of picomolar, while a 3 to 10 mg oral dose produces plasma concentrations one to two orders of magnitude above that, sustained for hours.',
      structureSource: {
        label: 'PubChem CID 896 — Melatonin, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/896',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'mel-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Content assay and screen for serotonin in the finished retail product',
          description:
            'This step is not routine here — it is the finding. Melatonin supplements are not tested for content before sale in the United States, and independent analyses find both gross content deviation and the presence of serotonin, a related indoleamine that has no business in a sleep gummy. Any study using a commercial product must assay the actual lot it used.',
          reagentsAndBuffer:
            'Ultra-performance liquid chromatography with electrochemical detection for melatonin quantification; UPLC-MS confirmation for serotonin identity; melatonin and 5-hydroxytryptamine reference standards; separate assays on multiple lots of the same product to capture lot-to-lot variance',
        },
        {
          id: 'mel-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the deuterated internal standard for plasma pharmacokinetics',
          description:
            'Endogenous melatonin is present in the same samples at picomolar concentration, so exogenous melatonin cannot be quantified against it without a mass-distinguishable standard. This is what makes it possible to state that a retail dose produces plasma levels far above the physiological night-time peak rather than merely restoring it.',
          dependsOnStepId: 'mel-w1',
          reagentsAndBuffer:
            'Melatonin-d4 internal standard; deuterium-labelled 6-sulphatoxymelatonin for the urinary metabolite; isotopic purity confirmation by LC-MS/MS; amber vials, because melatonin is light-sensitive in solution',
        },
        {
          id: 'mel-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Dim-light sample collection and extraction for melatonin onset timing',
          description:
            'Dim-light melatonin onset is the reference standard for circadian phase, and it is destroyed by the room lights. Samples must be collected under fewer than 10 lux with the subject awake, seated and unexposed to screens, then extracted immediately. A phase measurement taken under normal indoor lighting is not a phase measurement.',
          dependsOnStepId: 'mel-w2',
          reagentsAndBuffer:
            'Saliva collection under sub-10-lux red-filtered lighting at 30- to 60-minute intervals; solid-phase extraction on C18 cartridges; methanol elution and nitrogen evaporation; salivary melatonin radioimmunoassay or LC-MS/MS cross-validated against plasma',
        },
        {
          id: 'mel-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'MT1 and MT2 receptor engagement and desensitisation at supraphysiological exposure',
          description:
            'Test the receptors at both physiological and retail-dose concentrations in the same system. MT2 internalises and desensitises on sustained agonist exposure, which is the mechanistic reason a large dose held high all night is not simply a bigger version of the natural signal — it may be a worse one.',
          dependsOnStepId: 'mel-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human MT1 or MT2; cAMP accumulation assay with forskolin stimulation; luzindole as a non-selective antagonist and 4-P-PDOT as an MT2-selective antagonist; beta-arrestin recruitment assay; melatonin at 100 picomolar and at 10 nanomolar to bracket physiological and retail exposure',
        },
        {
          id: 'mel-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Polysomnography with a phase-shift readout, reported separately',
          description:
            'Report the hypnotic effect and the chronobiotic effect as two different results, because they are two different claims with different evidence. Polysomnographic sleep onset latency answers "did it make sleep come faster tonight"; the shift in dim-light melatonin onset across days answers "did it move the clock". Studies that report only a questionnaire answer neither.',
          dependsOnStepId: 'mel-w4',
          reagentsAndBuffer:
            'Full polysomnography with EEG, EOG and chin EMG scored to AASM criteria; wrist actigraphy for the free-living arm; serial salivary dim-light melatonin onset before and after intervention; placebo matched for taste and appearance',
        },
      ],
    },
    keyAudits: [
      {
        id: 'mel-a1',
        category: 'measured',
        title: 'Seven minutes faster to sleep, eight minutes longer asleep',
        laymanSummary:
          'Across nineteen randomised trials in 1,683 people, melatonin cut the time to fall asleep by about seven minutes and added about eight minutes of total sleep.',
        technicalDetails:
          'Ferracioli-Oda and colleagues pooled 19 randomised placebo-controlled trials in 1,683 subjects with primary sleep disorders. Melatonin reduced sleep onset latency by a weighted mean difference of 7.06 minutes (95% CI 4.37 to 9.75, Z = 5.15, P < 0.001) and increased total sleep time by 8.25 minutes (95% CI 1.74 to 14.75, Z = 2.48, P = 0.013). Overall sleep quality improved with a standardised mean difference of 0.22 (95% CI 0.12 to 0.32, P < 0.001). Meta-regression found longer trials and higher doses produced larger effects on latency and total sleep time, but no dose or duration effect on sleep quality. The authors stated plainly that the absolute benefit is smaller than that of other pharmacological treatments for insomnia, while noting the effect did not appear to dissipate with continued use — which is a genuine advantage over hypnotics that lose effect. The earlier Brzezinski meta-analysis of 17 studies in 284 subjects found the same picture at a smaller scale: sleep onset latency down 4.0 minutes (95% CI 2.5 to 5.4), sleep efficiency up 2.2% (95% CI 0.2 to 4.2), total sleep duration up 12.8 minutes (95% CI 2.9 to 22.8).',
        evidenceSource:
          'Ferracioli-Oda E, Qawasmi A, Bloch MH. PLoS One 2013;8:e63773; Brzezinski A et al. Sleep Med Rev 2005;9:41-50',
        doi: '10.1371/journal.pone.0063773',
        measuredMetric:
          'Weighted mean difference in sleep onset latency and total sleep time, in minutes, versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a2',
        category: 'failed',
        title: 'Label accuracy: 74% to 347% of the stated dose, and one gummy with none at all',
        laymanSummary:
          'Researchers bought 25 melatonin gummy products in the US and measured what was actually in them. Only three matched the label within ten percent. One contained no melatonin.',
        technicalDetails:
          'Cohen and colleagues analysed 25 melatonin gummy brands sold in the United States. The actual quantity of melatonin ranged from 74% to 347% of the labelled quantity. Only three of the 25 (12%) contained melatonin within plus or minus 10% of the declared amount. One product contained no detectable melatonin at all but did contain 31.3 mg of CBD. Among the five products containing CBD, CBD content was accurate — 104% to 118% of label — which makes the melatonin failure harder to attribute to general analytical difficulty. Erland and Saxena had found the same problem earlier in 31 supplements: melatonin content ranged from -83% to +478% of label, lot-to-lot variation within a single product reached 465%, more than 71% of supplements missed their label by more than 10%, and serotonin was identified in eight of them at 1 to 75 micrograms. This is the defining fact about the retail category, and it means a person taking "5 mg" may be taking anywhere from under 1 mg to over 17 mg.',
        evidenceSource:
          'Cohen PA et al. JAMA 2023;329:1401-1402; Erland LAE, Saxena PK. J Clin Sleep Med 2017;13:275-281',
        doi: '10.1001/jama.2023.2296',
        measuredMetric:
          'Measured melatonin content as a percentage of the labelled quantity, across commercial products',
        auditFlag: 'caution',
      },
      {
        id: 'mel-a3',
        category: 'conclusion_shift',
        title: 'The physiological dose worked; the pharmacological dose worked and overshot',
        laymanSummary:
          'A dose-ranging study found that a small dose matching the body\'s own night-time level restored sleep efficiency. A ten-times-larger dose also worked, but dropped body temperature and left melatonin circulating into the next day.',
        technicalDetails:
          'Zhdanova and colleagues ran a double-blind placebo-controlled crossover in 30 subjects over 50 — 15 with actigraphically confirmed reduced sleep efficiency and 15 normal sleepers — giving placebo and 0.1, 0.3 and 3.0 mg melatonin 30 minutes before bed for a week each, with polysomnography on the last three nights of each period. The physiological dose of 0.3 mg restored sleep efficiency (P < 0.0001), acting principally in the middle third of the night, and raised plasma melatonin to the normal nocturnal range (P < 0.0008). The pharmacological 3.0 mg dose also improved sleep, but induced hypothermia and caused plasma melatonin to remain elevated into the daylight hours. The 0.1 mg dose also improved sleep. Crucially, control subjects with equally low melatonin levels showed no sleep effect at any dose. Retail products in the US are commonly sold at 3, 5 and 10 mg, which is ten to thirty times the dose that this study showed sufficed, and the surplus does not simply vanish: it keeps signalling night into the following morning, which is the opposite of what a circadian intervention should do.',
        evidenceSource: 'Zhdanova IV et al. J Clin Endocrinol Metab 2001;86:4727-4730',
        doi: '10.1210/jcem.86.10.7901',
        measuredMetric:
          'Polysomnographic sleep efficiency and plasma melatonin profile across 0.1, 0.3 and 3.0 mg doses',
        inferredClaim:
          'That more melatonin is more effective, when the dose-ranging data show the physiological amount was sufficient and the larger amount extended the signal into the next day',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a4',
        category: 'measured',
        title: 'Jet lag is the strong indication, and it is a different mechanism',
        laymanSummary:
          'For jet lag — a genuine mismatch between the body clock and local time — a Cochrane review of ten randomised trials found melatonin remarkably effective. This is the use with the best evidence and the least marketing.',
        technicalDetails:
          'Herxheimer and Petrie identified ten randomised trials in airline passengers, staff and military personnel, all comparing melatonin with placebo and one additionally with the hypnotic zolpidem. Jet lag is the one condition where the pharmacology and the pathology match exactly: the problem is that the internal clock is set to the departure time zone, and melatonin is the signal that moves it. The evidence is coherent for eastward travel across several time zones, where the required phase advance is the harder direction. Adverse event reports were searched systematically outside the randomised trials as well, in Side Effects of Drugs, Reactions Weekly, MEDLINE, and the WHO Uppsala Monitoring Centre and FDA adverse reaction databases. The contrast with the insomnia literature is the point of this audit: the same molecule has a strong indication with a matching mechanism and a weak indication without one, and the weak one is what the aisle sells.',
        evidenceSource: 'Herxheimer A, Petrie KJ. Cochrane Database Syst Rev 2002;2:CD001520',
        doi: '10.1002/14651858.CD001520',
        measuredMetric:
          'Subjective jet lag ratings and related components after eastward and westward transmeridian flight',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a5',
        category: 'failed',
        title: 'Paediatric ingestions rose 530 percent, with two deaths',
        laymanSummary:
          'As melatonin gummies spread, so did children eating them. Over ten years US poison centres logged more than a quarter of a million paediatric melatonin ingestions, five children needed ventilators and two died.',
        technicalDetails:
          'Lelak and colleagues analysed the American Association of Poison Control Centers National Poison Data System for isolated melatonin ingestions in people aged 19 or under from 2012 to 2021. There were 260,435 paediatric melatonin ingestions over the decade and the annual number rose 530%. Melatonin accounted for 4.9% of all paediatric ingestions reported in 2021 against 0.6% in 2012, and in 2020 it became the substance most frequently ingested by children reported to poison centres. Hospitalisations and serious outcomes increased, driven mainly by unintentional ingestion in children aged five or under. Five children required mechanical ventilation and two died. US sales rose from 285 million dollars in 2016 to 821 million in 2020 over the same period. A sweet, brightly coloured, unregulated product with no child-resistant requirement and no reliable content standard is the direct explanation, and the content variability audit above compounds it: a child eating a handful of gummies may be receiving several times more melatonin per gummy than the label implies.',
        evidenceSource: 'Lelak K et al. MMWR Morb Mortal Wkly Rep 2022;71:725-729',
        doi: '10.15585/mmwr.mm7122a1',
        measuredMetric:
          'Annual paediatric melatonin ingestions reported to US poison control centres, and associated outcomes',
        auditFlag: 'verified',
      },
      {
        id: 'mel-a6',
        category: 'inferred',
        title: 'The regulated version exists, and its authorised claim is much narrower',
        laymanSummary:
          'In Europe melatonin is a prescription drug. Regulators approved it only for short-term use in people over 55, and the trial result behind that approval was 32 percent responding against 19 percent on placebo.',
        technicalDetails:
          'The EMA authorised Circadin, prolonged-release melatonin 2 mg, on 29 June 2007 under EMEA/H/C/000695, as monotherapy for the short-term treatment of primary insomnia characterised by poor quality of sleep in patients aged 55 or over, available only on prescription and for up to 13 weeks. Across three main studies in 681 patients, 32% of Circadin patients (86 of 265) reported significant improvement in sleep quality and next-day functioning at three weeks against 19% on placebo (51 of 272). Everything in that sentence is a restriction the US supplement carries none of: a specific formulation, a specific dose, an age floor, a duration cap and a prescription requirement. The inference to audit is the reverse of the usual one — American consumers routinely treat the availability of melatonin without a prescription as evidence that it is mild and broadly indicated, when the jurisdiction that assessed it concluded the opposite about scope while agreeing it is safe enough to prescribe.',
        evidenceSource:
          'European Medicines Agency, Circadin EPAR summary, marketing authorisation issued 29 June 2007',
        measuredMetric:
          'Proportion reporting significant improvement in sleep quality and next-day functioning at three weeks',
        inferredClaim:
          'That over-the-counter availability in the US reflects a wider evidence-supported indication than the one European regulators actually granted',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Darkness starts the signal, and light stops it',
        laymanDesc:
          'Special cells in the retina report ambient light straight to the body\'s master clock. When light falls, the clock releases the brake on the pineal gland and melatonin rises.',
        molecularDetail:
          'Melanopsin-expressing intrinsically photosensitive retinal ganglion cells project through the retinohypothalamic tract to the suprachiasmatic nucleus, which controls pineal melatonin synthesis through a multisynaptic pathway ending in sympathetic input to the pineal. Evening short-wavelength light suppresses release. Dim-light melatonin onset, measured under sub-10-lux conditions, is the reference standard for circadian phase precisely because it is the least contaminated marker available.',
        iconName: 'Moon',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Swallowed melatonin overshoots the natural peak by a wide margin',
        laymanDesc:
          'Night-time melatonin in the blood is a very small quantity. A typical retail tablet produces far more than that, and keeps producing it for hours.',
        molecularDetail:
          'Physiological nocturnal plasma melatonin peaks in the tens to low hundreds of picomolar. Zhdanova showed that 0.3 mg was sufficient to restore that range and restore sleep efficiency in older insomniacs, while 3.0 mg induced hypothermia and left plasma melatonin elevated into daylight hours. Oral melatonin also undergoes extensive first-pass CYP1A2 metabolism, which is highly variable between individuals and is inhibited by fluvoxamine and by caffeine.',
        iconName: 'TrendingUp',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It binds two receptors on the clock itself',
        laymanDesc:
          'Melatonin docks onto two specific receptors concentrated in the small cluster of cells that runs the body\'s daily timing. One quietens those cells; the other moves the clock.',
        molecularDetail:
          'MT1 (MTNR1A) and MT2 (MTNR1B) are Gi-coupled receptors densely expressed in the suprachiasmatic nucleus. MT1 activation acutely suppresses SCN neuronal firing; MT2 mediates phase shifts. Both inhibit adenylyl cyclase and lower cAMP. MT2 internalises and desensitises under sustained agonist exposure, which is why a large dose held high for many hours is not a scaled-up version of the physiological pulse.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The clock moves in a direction that depends entirely on when you took it',
        laymanDesc:
          'Evening melatonin pulls the clock earlier. Morning melatonin pushes it later. Take it at the wrong hour and it makes the problem worse rather than better.',
        molecularDetail:
          'The melatonin phase-response curve is roughly opposite in shape to the light phase-response curve. Administration in the hours before habitual dim-light melatonin onset advances phase; administration in the late night or early morning delays it. This is why the jet lag evidence is strong and direction-specific, and why an insomnia trial that ignores timing is measuring a hypnotic effect that melatonin barely has instead of a chronobiotic effect it clearly does.',
        iconName: 'Clock',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measurable result is minutes, not hours',
        laymanDesc:
          'Pooled across nineteen trials, melatonin got people to sleep about seven minutes sooner and kept them asleep about eight minutes longer. That is a real effect and a small one.',
        molecularDetail:
          'Weighted mean difference in sleep onset latency 7.06 minutes (95% CI 4.37 to 9.75) and total sleep time 8.25 minutes (95% CI 1.74 to 14.75), with a sleep quality standardised mean difference of 0.22. The authors of that meta-analysis noted that the absolute benefit is smaller than other pharmacological insomnia treatments but does not dissipate with continued use — an unusual and genuinely favourable property.',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Ferracioli-Oda 2013 meta-analysis of melatonin in primary sleep disorders',
        phase: 'Meta-analysis of 19 randomised placebo-controlled trials',
        sampleSize: 1683,
        primaryEndpoint: 'Sleep onset latency, total sleep time and sleep quality versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Sleep latency WMD -7.06 min (95% CI 4.37 to 9.75), P < 0.001; total sleep time +8.25 min (95% CI 1.74 to 14.75), P = 0.013; sleep quality SMD 0.22, P < 0.001',
        unreportedAdverseSignals:
          'The authors state the absolute benefit is smaller than that of other pharmacological insomnia treatments. Effects were dose- and duration-dependent for latency but not for sleep quality, which argues the quality finding is not a pharmacological dose-response.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Brzezinski 2005 meta-analysis of exogenous melatonin on sleep',
        phase: 'Meta-analysis of 17 studies',
        sampleSize: 284,
        primaryEndpoint: 'Sleep onset latency, total sleep duration and sleep efficiency',
        endpointMet: true,
        statisticalPValue:
          'Sleep onset latency -4.0 min (95% CI 2.5 to 5.4); sleep efficiency +2.2% (95% CI 0.2 to 4.2); total sleep duration +12.8 min (95% CI 2.9 to 22.8)',
        unreportedAdverseSignals:
          'The included studies were highly heterogeneous in inclusion criteria, insomnia measures, dose and route, which the authors state explicitly as the reason the field had been unable to agree.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Zhdanova 2001 — dose-ranging melatonin in age-related insomnia',
        phase: 'Double-blind placebo-controlled randomised crossover with polysomnography',
        sampleSize: 30,
        primaryEndpoint: 'Polysomnographic sleep efficiency across 0.1, 0.3 and 3.0 mg doses',
        endpointMet: true,
        statisticalPValue:
          'Sleep efficiency restored at 0.3 mg, P < 0.0001; plasma melatonin normalised at 0.3 mg, P < 0.0008',
        unreportedAdverseSignals:
          'The 3.0 mg dose induced hypothermia and left plasma melatonin elevated into daylight hours. Normal-sleeping controls with equally low melatonin levels showed no benefit at any dose, which argues the effect is repletion in a specific phenotype rather than a general hypnotic action.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Circadin EU registration programme (EMEA/H/C/000695)',
        phase: 'Three randomised placebo-controlled trials supporting marketing authorisation',
        sampleSize: 681,
        primaryEndpoint:
          'Proportion reporting significant improvement in sleep quality and next-day functioning at three weeks',
        endpointMet: true,
        statisticalPValue: '32% on Circadin (86/265) versus 19% on placebo (51/272)',
        unreportedAdverseSignals:
          'The authorised indication is deliberately narrow: monotherapy, short-term, primary insomnia, age 55 or over, prescription only, up to 13 weeks. None of those restrictions exist for the identical molecule sold over the counter in the United States.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cohen 2023 — quantity of melatonin and CBD in US melatonin gummies',
        phase: 'Analytical survey of marketed products',
        sampleSize: 25,
        primaryEndpoint: 'Measured melatonin content as a percentage of labelled quantity',
        endpointMet: false,
        statisticalPValue:
          'Melatonin content 74% to 347% of label; only 3 of 25 within plus or minus 10%; one product contained no melatonin and 31.3 mg CBD',
        unreportedAdverseSignals:
          'CBD content in the five CBD-containing products was accurate at 104% to 118% of label, which removes analytical difficulty as an explanation for the melatonin failures.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Sleep onset latency fell by 7.06 minutes and total sleep time rose by 8.25 minutes across 19 trials in 1,683 people',
        'A 0.3 mg physiological dose restored polysomnographic sleep efficiency in older insomniacs; 3.0 mg induced hypothermia and prolonged the signal into daylight',
        'Melatonin content in 25 US gummy products ranged from 74% to 347% of label, with only 3 within 10%',
        'Paediatric melatonin ingestions reported to US poison centres rose 530% over 2012 to 2021, totalling 260,435, with two deaths',
      ],
      unsupportedInferences: [
        'That melatonin is a sedative — it is a circadian signal, and the pooled hypnotic effect is minutes',
        'That a larger dose is a better dose, when 0.3 mg sufficed and 3.0 mg overshot into the next morning',
        'That over-the-counter availability in the US implies a broad evidence-supported indication, when the EU authorisation is restricted to short-term use in people 55 and over',
        'That a labelled dose is the dose received, which is false in 88% of the gummy products tested',
      ],
      whatFailedInitially: [
        'Insomnia trials that ignored administration timing, which measured a hypnotic effect melatonin barely has instead of the chronobiotic effect it clearly does',
        'The US supplement content control regime, which permitted a 4.7-fold spread around label across a single product category',
      ],
      realWorldOutcome: [
        'The strongest evidence is for jet lag and circadian phase disorders, where mechanism and pathology actually match',
        'The effect on ordinary insomnia is real, replicated, and small — and unusually, it does not fade with continued use',
        'The largest practical risk is not the pharmacology but the packaging: sweet, unregulated, and now the substance children are most often poisoned by',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, capsule, gummy, liquid or spray; prolonged-release tablet as an EU prescription medicine',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. In the European Union, the United Kingdom, Australia, Canada and Japan the same molecule is a medicine requiring a prescription or pharmacist supply. Immediate-release and prolonged-release products are pharmacokinetically different interventions and their trial evidence is not interchangeable. Gummy formats are the fastest-growing and the worst-characterised: they are the format at the centre of both the content-accuracy failure and the paediatric ingestion epidemic.',
      safetyProfile:
        'Short-term tolerability is good and the EMA lists most adverse effects at frequencies between 1 and 10 per 1,000, including irritability, restlessness, abnormal dreams, headache, dizziness and daytime somnolence. Doses well above physiological leave melatonin circulating into the morning, which produces grogginess and, in principle, works against the circadian correction being sought. Melatonin is metabolised by CYP1A2, so fluvoxamine markedly raises exposure and smoking lowers it. Long-term safety in children, including any effect on pubertal timing, has not been established by adequate trials, which matters given how widely it is now given to them. In 2020 melatonin became the substance most frequently ingested by children reported to US poison control centres.',
    },
    commonQuestions: [
      {
        q: 'Does melatonin actually work?',
        a: 'Yes, and the size of the effect is the part worth knowing. Across nineteen randomised trials in 1,683 people it shortened the time to fall asleep by about seven minutes and added about eight minutes of sleep. The authors of that analysis said outright that the absolute benefit is smaller than other insomnia drugs. They also noted something unusual in its favour: the effect did not fade with continued use, which is not true of most hypnotics.',
      },
      {
        q: 'Am I taking too much?',
        a: 'Probably, if you are taking a typical US retail product. A dose-ranging study with full polysomnography found 0.3 mg restored sleep efficiency in older insomniacs and brought plasma melatonin to the normal night-time range. The 3 mg dose also worked but caused hypothermia and left melatonin circulating into the following day. Products are commonly sold at 3, 5 and 10 mg. Extending a night signal into the morning is the opposite of what a circadian intervention is meant to do.',
        auditNote:
          'And because content accuracy is poor, the actual dose received may be several times the number printed on the bottle.',
      },
      {
        q: 'Is what is in the bottle what is on the label?',
        a: 'Frequently not. In 25 melatonin gummy brands sold in the US, measured melatonin ran from 74% to 347% of the labelled amount and only three products were within ten percent. One contained no melatonin at all, though it did contain 31.3 mg of CBD. An earlier analysis of 31 supplements found a range of -83% to +478%, lot-to-lot variation within one product of up to 465%, and serotonin present in eight of them. In the same 2023 study the CBD content was accurate, so this is a quality-control failure specific to melatonin, not an analytical limitation.',
      },
      {
        q: 'Is it safe to give to children?',
        a: 'That question has not been properly answered, and the exposure data are alarming. US poison centres logged 260,435 paediatric melatonin ingestions between 2012 and 2021, a 530 percent rise; five children required mechanical ventilation and two died. In 2020 melatonin became the substance children most often ingested. Long-term trials in children, including any effect on the timing of puberty, do not exist at adequate scale. The combination of a sweet unregulated format, inaccurate labelling and no child-resistant requirement is the mechanism here, and it is not a pharmacological one.',
      },
      {
        q: 'What is it genuinely good for?',
        a: 'Problems of timing rather than problems of sleep drive. Jet lag is the clearest case — a Cochrane review of ten randomised trials found it effective, and the mechanism matches the pathology exactly, since the complaint is that the internal clock is set to the wrong time zone and melatonin is the signal that moves clocks. Delayed sleep-wake phase disorder and non-24-hour rhythm in blind people are the same category. For someone who simply cannot fall asleep at a normal hour for behavioural reasons, cognitive behavioural therapy for insomnia is the first-line treatment and outperforms it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zhdanova IV, Wurtman RJ, Regan MM, Taylor JA, Shi JP, Leclair OU. Melatonin treatment for age-related insomnia. J Clin Endocrinol Metab 2001;86:4727-4730',
        identifier: '10.1210/jcem.86.10.7901',
        kind: 'doi',
      },
      {
        label:
          'Herxheimer A, Petrie KJ. Melatonin for the prevention and treatment of jet lag. Cochrane Database Syst Rev 2002;2:CD001520',
        identifier: '10.1002/14651858.CD001520',
        kind: 'doi',
      },
      {
        label:
          'Brzezinski A et al. Effects of exogenous melatonin on sleep: a meta-analysis. Sleep Med Rev 2005;9:41-50',
        identifier: '10.1016/j.smrv.2004.06.004',
        kind: 'doi',
      },
      {
        label:
          'European Medicines Agency. Circadin (prolonged-release melatonin 2 mg), EMEA/H/C/000695, marketing authorisation issued 29 June 2007',
        identifier: 'https://www.ema.europa.eu/en/medicines/human/EPAR/circadin',
        kind: 'regulatory',
      },
      {
        label:
          'Ferracioli-Oda E, Qawasmi A, Bloch MH. Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS One 2013;8:e63773',
        identifier: '10.1371/journal.pone.0063773',
        kind: 'doi',
      },
      {
        label:
          'Erland LAE, Saxena PK. Melatonin natural health products and supplements: presence of serotonin and significant variability of melatonin content. J Clin Sleep Med 2017;13:275-281',
        identifier: '10.5664/jcsm.6462',
        kind: 'doi',
      },
      {
        label:
          'Lelak K et al. Pediatric melatonin ingestions — United States, 2012-2021. MMWR Morb Mortal Wkly Rep 2022;71:725-729',
        identifier: '10.15585/mmwr.mm7122a1',
        kind: 'doi',
      },
      {
        label:
          'Cohen PA, Avula B, Wang Y, Katragunta K, Khan I. Quantity of melatonin and CBD in melatonin gummies sold in the US. JAMA 2023;329:1401-1402',
        identifier: '10.1001/jama.2023.2296',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 896 — Melatonin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/896',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Caffeine — the strongest evidence in this entire file. An umbrella review of 21 meta-analyses,
  // an FDA-approved neonatal drug that cut cerebral palsy, and one honest catch: withdrawal.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'caffeine',
    name: 'Caffeine',
    tradeName:
      'Caffeine anhydrous in supplements; caffeine citrate is an FDA-approved prescription drug for apnea of prematurity (Cafcit, NDA 020793)',
    sponsor:
      'No single sponsor — 1,3,7-trimethylxanthine, obtained from coffee decaffeination or synthesised from urea and dimethylurea, sold by many manufacturers',
    targetGene: 'ADORA2A',
    targetProtein:
      'Adenosine receptors A1 (ADORA1) and A2A (ADORA2A), both G-protein-coupled. Caffeine is a competitive, non-selective antagonist at both at ordinary human doses. Every other proposed mechanism — phosphodiesterase inhibition, ryanodine receptor sensitisation, GABA-A antagonism — requires concentrations that a person drinking coffee never reaches.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement and as an ingredient in coffee, tea, energy drinks and pre-workout formulas, for alertness and exercise performance. Caffeine citrate is separately an approved prescription drug under NDA 020793 for apnea of prematurity in very-low-birth-weight infants, where it reduced bronchopulmonary dysplasia and, at 18 months, death or neurodevelopmental disability.',
    patientFriendlyIndication: 'Taken for alertness, and before training or competition for performance',
    conditionContext: {
      conditionExplainer:
        'Adenosine accumulates in the brain across a waking day and, by acting on its receptors, is one of the signals that produces the feeling of sleepiness. Caffeine occupies those receptors without activating them. It does not add energy; it blocks the message that you are tired, and the adenosine keeps accumulating underneath.',
      whyItMatters:
        'This is the page in this file where the evidence is strongest, and saying so plainly is what makes the sceptical pages elsewhere worth reading. Caffeine is ergogenic across aerobic endurance, muscular strength, muscular endurance, power, jumping and speed, substantiated by 21 meta-analyses, and it is one of very few substances here that is also a licensed drug with a mortality-adjacent randomised benefit in a real disease.',
      whoTakesThis:
        'Roughly most adults on earth, mostly as coffee and tea. Also athletes taking measured doses before competition, shift workers, students, and — under prescription and by a completely different route — premature infants with apnea.',
      clinicalGoals:
        'Trials measured time-trial completion time, one-repetition maximum, repetitions to failure, peak power, jump height, ratings of perceived exertion, polysomnographic total sleep time, and in the neonatal programme bronchopulmonary dysplasia and neurodevelopmental disability at 18 to 21 months.',
    },
    oneSentenceVerdict:
      'Caffeine is the best-evidenced performance substance in this file and one of the best-evidenced in existence — ergogenic across six distinct exercise domains in 21 meta-analyses, and a licensed neonatal drug that cut death or neurodevelopmental disability from 46.2% to 40.2% — with the honest caveat that half of habitual users get a withdrawal headache on stopping, so part of the daily lift is the reversal of a deficit the habit created.',
    laymanHowItWorks:
      'A molecule called adenosine builds up in your brain the longer you are awake, and when it docks onto its receptors you feel tired. Caffeine is shaped enough like adenosine to sit in those receptors without switching them on, so the tiredness signal cannot be delivered. Nothing has been added; a brake has been released. Because the adenosine is still piling up behind the blockade, the tiredness returns when caffeine clears — and if you have been doing this daily, the brain has grown extra receptors to compensate, which is why missing a morning coffee produces a real headache rather than an imagined one.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    anatomicalSite:
      'Central nervous system, principally striatal and cortical adenosine A1 and A2A receptors; also skeletal muscle, adipose tissue and the renal afferent arteriole',
    substitutes: {
      summary:
        'For alertness the only intervention that genuinely beats caffeine is sleep, and it beats it decisively because it clears the adenosine rather than masking it. For exercise performance there is no legal, cheap, orally available substance with a comparable evidence base — which is the honest verdict this page exists to record.',
      conventionalRx: [
        {
          name: 'Caffeine citrate (Cafcit) for apnea of prematurity',
          class: 'Methylxanthine respiratory stimulant, FDA-approved under NDA 020793',
          howItCompares:
            'The same molecule as a licensed drug, given to very-low-birth-weight infants. In the 2,006-infant CAP trial it reduced bronchopulmonary dysplasia and, at 18 to 21 months corrected age, reduced death or neurodevelopmental disability from 46.2% to 40.2% and cerebral palsy from 7.3% to 4.4%.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: a genuine randomised benefit on hard neurological outcomes in a real disease, from a substance most people meet as a beverage. Cons: it tells you nothing about the coffee you drank this morning, and it is regularly cited as if it did.',
        },
        {
          name: 'Adequate sleep',
          class: 'The mechanism-matching comparator',
          howItCompares:
            'Sleep clears accumulated adenosine; caffeine occupies the receptor while the adenosine keeps accumulating. That difference is why caffeine reliably improves performance on a rested athlete and cannot substitute for sleep across days. It is also why 400 mg six hours before bed measurably reduces total sleep time.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: removes the underlying signal rather than blocking it, with no tolerance and no withdrawal. Cons: cannot be bought, which is precisely why the caffeine market exists.',
        },
      ],
      naturalFoods: [
        {
          name: 'Coffee',
          activeCompound: 'Caffeine, plus chlorogenic acids and diterpenes that anhydrous caffeine lacks',
          biologicalMechanism:
            'The caffeine in coffee and the caffeine in a capsule are the same molecule acting at the same receptors, and coffee has been used successfully in ergogenic trials. The differences are dose precision and the accompanying compounds: unfiltered coffee carries cafestol and kahweol, which raise LDL cholesterol, and filtered coffee does not.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Goncalves\'s time-trial study used 6 mg per kilogram of body mass, and Drake\'s sleep study used a fixed 400 mg.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Tea',
          activeCompound: 'Caffeine at lower concentration, with L-theanine',
          biologicalMechanism:
            'Tea delivers less caffeine per serving alongside L-theanine, an amino acid that crosses the blood-brain barrier and is frequently combined with caffeine in supplement products on the claim that it smooths the stimulant effect. The receptor pharmacology of the caffeine is unchanged.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Separate the lift from the withdrawal reversal',
          action:
            'Notice whether the first dose of the day restores you to normal or takes you above it. In a habitual user those are different things, and only one of them is a drug effect on a neutral baseline.',
          patientImpact:
            'Juliano and Griffiths found headache in 50% of experimental caffeine-withdrawal subjects and clinically significant distress or functional impairment in 13%, with symptoms appearing from daily doses as low as 100 mg.',
          clinicalPrecaution:
            'Withdrawal onset is typically 12 to 24 hours after abstinence, peaks at 20 to 51 hours, and lasts 2 to 9 days. Expectancy is not the prime determinant — this was tested.',
        },
        {
          name: 'Count the hours before bed, not the cups',
          action:
            'Caffeine has a half-life of roughly five hours in a healthy adult, which is doubled by oral contraceptives and roughly halved in smokers.',
          patientImpact:
            'A fixed 400 mg dose taken six hours before bedtime significantly disrupted sleep against placebo, measured both by self-report and by a validated portable sleep monitor.',
          clinicalPrecaution:
            'That finding is the empirical basis of the standard advice to stop caffeine at least six hours before bed. Losing sleep to gain alertness is a bad trade at the level of adenosine, which is the thing caffeine is blocking.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
      chemicalFormula: 'C8H10N4O2',
      molecularWeight: '194.19 g/mol',
      targetReceptorAffinity:
        'Competitive antagonist at adenosine A1 and A2A with affinities in the low micromolar range, which is the concentration ordinary human consumption actually produces in plasma. Phosphodiesterase inhibition and ryanodine receptor effects require concentrations one to two orders of magnitude higher and are not the mechanism in a person.',
      structureSource: {
        label: 'PubChem CID 2519 — Caffeine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'caf-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Caffeine content and undeclared-stimulant screen on pre-workout products',
          description:
            'Caffeine itself is easy to assay and rarely misstated, but the products it is sold inside are the most adulterated category in the supplement market. Screen for the synthetic stimulants that have repeatedly been found in pre-workout and weight-loss formulas, because a performance effect attributed to caffeine may not be caffeine at all.',
          reagentsAndBuffer:
            'Reversed-phase HPLC-UV at 273 nm against a caffeine reference standard; LC-MS/MS screen for 1,3-dimethylamylamine, 1,4-dimethylamylamine, higenamine, octopamine and synephrine; proprietary-blend products assayed for total caffeine including from guarana, yerba mate and green tea extract',
        },
        {
          id: 'caf-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of labelled caffeine and paraxanthine standards',
          description:
            'CYP1A2 activity varies several-fold between individuals and is the reason two people report opposite experiences of the same cup. Phenotyping requires quantifying caffeine against its primary metabolite, which needs both compounds as isotopically distinguishable standards.',
          dependsOnStepId: 'caf-w1',
          reagentsAndBuffer:
            'Caffeine-d9 and paraxanthine-d6 internal standards; theobromine and theophylline reference standards for the parallel demethylation routes; LC-MS/MS confirmation of isotopic purity',
        },
        {
          id: 'caf-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salivary extraction for the paraxanthine-to-caffeine ratio',
          description:
            'Saliva tracks free plasma caffeine closely and can be collected without venepuncture, which makes serial sampling practical. The paraxanthine to caffeine ratio at a fixed interval after a standard dose is the accepted CYP1A2 phenotype metric, and it is what a genotype alone cannot give you.',
          dependsOnStepId: 'caf-w2',
          reagentsAndBuffer:
            'Timed saliva collection with a plain cotton swab, not a citric-acid-stimulated one; solid-phase extraction on a mixed-mode cartridge; methanol elution; LC-MS/MS quantification of caffeine and paraxanthine; parallel CYP1A2 rs762551 genotyping by restriction fragment length polymorphism PCR',
        },
        {
          id: 'caf-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'A1 and A2A receptor occupancy, and upregulation after chronic exposure',
          description:
            'Confirm competitive antagonism at both receptors at achievable concentrations, then run the chronic arm, because receptor upregulation is the substrate of tolerance and withdrawal and it does not appear in an acute experiment. This is the step that distinguishes a drug effect on a naive brain from the restoration of a habituated one.',
          dependsOnStepId: 'caf-w3',
          reagentsAndBuffer:
            'CHO cells stably expressing human A1 or A2A; [3H]DPCPX and [3H]ZM241385 radioligand binding; cAMP accumulation assay; caffeine at 1 to 50 micromolar to span human plasma exposure; 14-day continuous exposure arm with receptor density quantified by saturation binding at washout',
        },
        {
          id: 'caf-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Time-trial performance with perceived exertion and a sleep readout',
          description:
            'Report the performance outcome, the perceived-exertion outcome and the subsequent night\'s sleep from the same subjects. Doherty and Smith showed that exertion ratings account for roughly 29% of the variance in performance improvement, and Drake showed that a moderate dose six hours before bed disrupts sleep. A trial that reports only the time trial is reporting a third of the effect.',
          dependsOnStepId: 'caf-w4',
          reagentsAndBuffer:
            'Cycle ergometer simulated time trial with a validated protocol; Borg 6-20 rating of perceived exertion at fixed intervals; capillary blood lactate; matched placebo capsule plus a no-supplement control arm to detect placebo response; validated portable sleep monitor for the following night',
        },
      ],
    },
    keyAudits: [
      {
        id: 'caf-a1',
        category: 'measured',
        title: 'Twenty-one meta-analyses, six exercise domains, all ergogenic',
        laymanSummary:
          'Researchers reviewed every published meta-analysis of caffeine and exercise. Caffeine improved endurance, strength, muscular endurance, power, jumping and speed. This is not a marginal result.',
        technicalDetails:
          'Grgic and colleagues conducted an umbrella review across twelve databases, identifying eleven reviews containing 21 separate meta-analyses, all of moderate or high methodological quality by AMSTAR 2. Caffeine was ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping performance and exercise speed. Using GRADE, the quality of evidence for muscle endurance, muscle strength, anaerobic power and aerobic endurance was moderate, coming from moderate-to-high quality systematic reviews; for the other outcomes the underlying evidence was low or very low. Two caveats are stated by the authors and belong here: not all analyses gave a definite direction of effect once the 95% prediction interval was considered, and most individual studies were conducted among young men. This is the strongest performance evidence base for any substance on this site, and it still carries a generalisability limit that the marketing does not mention.',
        evidenceSource: 'Grgic J et al. Br J Sports Med 2020;54:681-688',
        doi: '10.1136/bjsports-2018-100278',
        measuredMetric:
          'Pooled effect of caffeine across aerobic endurance, muscle strength, muscle endurance, power, jumping and speed',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a2',
        category: 'measured',
        title: 'It makes hard work feel easier, and that explains part of why it works',
        laymanSummary:
          'Across 21 studies caffeine made a given workload feel about six percent easier, and performance improved eleven percent. The two are linked.',
        technicalDetails:
          'Doherty and Smith pooled 21 studies yielding 109 effect sizes for ratings of perceived exertion. Against placebo, caffeine reduced RPE during constant-load exercise by 5.6% (95% CI -4.5% to -6.7%), an effect size of -0.47 (95% CI -0.35 to -0.59). Crucially, RPE at the point of exhaustion did not differ at all (0.01% change, 95% CI -1.9 to 2.0) — people stopped at the same subjective ceiling, they just reached more work before hitting it. Exercise performance improved by 11.2% (95% CI 4.6 to 17.8%), and regression showed that the reduction in RPE during exercise accounted for approximately 29% of the variance in performance improvement. This is a rare case of a supplement having a partly identified mechanism of action at the behavioural level, not just the molecular one.',
        evidenceSource: 'Doherty M, Smith PM. Scand J Med Sci Sports 2005;15:69-78',
        doi: '10.1111/j.1600-0838.2005.00445.x',
        measuredMetric:
          'Percentage change in rating of perceived exertion during constant-load exercise and in exercise performance',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a3',
        category: 'measured',
        title: 'CAP: 2,006 premature infants, less lung disease and less cerebral palsy',
        laymanSummary:
          'In the largest randomised trial ever run on caffeine, very premature babies given it needed less oxygen support and, at eighteen months, were less likely to have died or developed a disability.',
        technicalDetails:
          'The Caffeine for Apnea of Prematurity trial randomised 2,006 infants with birth weights of 500 to 1,250 g within the first ten days of life to caffeine or placebo until therapy for apnea was no longer needed. At 36 weeks postmenstrual age, 350 of 963 caffeine infants (36%) still required supplemental oxygen against 447 of 954 placebo infants (47%), adjusted odds ratio 0.63 (95% CI 0.52 to 0.76, P < 0.001), and positive airway pressure was discontinued a week earlier. Caffeine temporarily reduced weight gain, greatest at two weeks (mean difference -23 g, 95% CI -32 to -13, P < 0.001). At 18 to 21 months corrected age, the composite of death, cerebral palsy, cognitive delay, deafness or blindness occurred in 377 of 937 caffeine infants (40.2%) against 431 of 932 (46.2%) on placebo, adjusted odds ratio 0.77 (95% CI 0.64 to 0.93, P = 0.008). Cerebral palsy fell from 7.3% to 4.4% (aOR 0.58, 95% CI 0.39 to 0.87, P = 0.009) and cognitive delay from 38.3% to 33.8% (aOR 0.81, 95% CI 0.66 to 0.99, P = 0.04). Caffeine citrate holds an FDA approval for this indication under NDA 020793.',
        evidenceSource:
          'Schmidt B et al. N Engl J Med 2006;354:2112-2121; Schmidt B et al. N Engl J Med 2007;357:1893-1902',
        doi: '10.1056/NEJMoa073679',
        measuredMetric:
          'Bronchopulmonary dysplasia at 36 weeks postmenstrual age, and death or neurodevelopmental disability at 18 to 21 months',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a4',
        category: 'inferred',
        title: 'Half of habitual users get a withdrawal headache, from doses as low as 100 mg a day',
        laymanSummary:
          'Caffeine withdrawal is a real, validated syndrome with ten confirmed symptoms. Half of people get a headache, and it can be triggered by a daily habit as small as one cup.',
        technicalDetails:
          'Juliano and Griffiths reviewed 57 experimental and 9 survey studies. Of 49 candidate symptom categories, ten met validity criteria: headache, fatigue, decreased energy or activeness, decreased alertness, drowsiness, decreased contentedness, depressed mood, difficulty concentrating, irritability, and feeling foggy or not clearheaded. Flu-like symptoms, nausea or vomiting and muscle pain or stiffness were judged likely valid. In experimental studies the incidence of headache was 50% and of clinically significant distress or functional impairment 13%. Onset was typically 12 to 24 hours after abstinence, peak intensity at 20 to 51 hours, duration 2 to 9 days. Incidence and severity rose with daily dose, and abstinence from doses as low as 100 mg per day produced symptoms. The authors specifically reviewed and rejected expectancy as a prime determinant, and concluded that avoidance of withdrawal plays a central role in habitual consumption. The audit point is not that caffeine does not work — it plainly does — but that a habitual user\'s morning baseline is not a neutral one, and the daily subjective lift is partly the repair of a deficit the habit itself produced.',
        evidenceSource: 'Juliano LM, Griffiths RR. Psychopharmacology (Berl) 2004;176:1-29',
        doi: '10.1007/s00213-004-2000-x',
        measuredMetric:
          'Incidence, onset, peak and duration of validated caffeine withdrawal symptoms after abstinence',
        inferredClaim:
          'That the alertness a habitual user feels after their first coffee measures caffeine acting on a normal baseline, rather than the reversal of an overnight withdrawal',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a5',
        category: 'conclusion_shift',
        title: 'The habituation myth: heavy coffee drinkers get the same performance benefit',
        laymanSummary:
          'For years athletes were told to abstain from caffeine before competition so it would work better. A controlled study across low, moderate and heavy habitual users found their daily intake made no difference to the benefit.',
        technicalDetails:
          'Goncalves and colleagues ran a double-blind, crossover, counterbalanced study in 40 male endurance-trained cyclists, stratified into tertiles by habitual daily caffeine intake: low (58 +/- 29 mg/day), moderate (143 +/- 25) and high (351 +/- 139). Each completed three simulated cycling time trials after caffeine 6 mg/kg, placebo, or no supplement. Time-trial performance improved significantly with caffeine — 29.92 +/- 2.18 minutes against 30.81 +/- 2.67 for placebo and 31.14 +/- 2.71 for control (P = 0.0002). Analysis of covariance found no influence of habitual caffeine intake on the response (P = 0.47), performance did not differ across tertiles (P = 0.75), and there was no correlation between habitual intake and the absolute caffeine-minus-control change (P = 0.524). Individual analysis showed eight, seven and five responders in the low, moderate and high tertiles respectively, with no significant difference between them by Fisher\'s exact test. The withdrawal-abstinence protocols that dominated sports nutrition advice for two decades were, on this evidence, unnecessary — and worth noting for what it also shows: the tolerance that develops for alertness does not straightforwardly transfer to the ergogenic effect.',
        evidenceSource: 'Goncalves LS et al. J Appl Physiol (1985) 2017;123:213-220',
        doi: '10.1152/japplphysiol.00260.2017',
        measuredMetric:
          'Simulated cycling time-trial completion time by habitual caffeine intake tertile',
        auditFlag: 'verified',
      },
      {
        id: 'caf-a6',
        category: 'inferred',
        title: 'CYP1A2 genotype: opposite heart-attack associations in slow and fast metabolisers',
        laymanSummary:
          'In a large case-control study, people who break caffeine down slowly had a higher risk of heart attack with heavy coffee intake. People who break it down quickly did not.',
        technicalDetails:
          'Cornelis and colleagues genotyped 2,014 cases with a first acute nonfatal myocardial infarction and 2,014 matched population controls in Costa Rica between 1994 and 2004. Among carriers of the slow CYP1A2*1F allele — 55% of cases and 54% of controls — the multivariate odds ratios for nonfatal MI at less than one, one, two to three, and four or more cups of coffee daily were 1.00, 0.99 (0.69 to 1.44), 1.36 (1.01 to 1.83) and 1.64 (1.14 to 2.34). Among rapid *1A/*1A metabolisers the corresponding odds ratios were 1.00, 0.75 (0.51 to 1.12), 0.78 (0.56 to 1.09) and 0.99 (0.66 to 1.48), with a gene-by-coffee interaction of P = .04. This is the most-cited evidence that individual caffeine responses are genetically stratified, and it must be read for what it is: a single-population observational case-control study with a modest interaction p-value, not a randomised result. Subsequent attempts to replicate the CYP1A2 interaction for cardiovascular outcomes have been inconsistent, and consumer genetic tests that report a caffeine sensitivity result on this basis are extrapolating well past what one case-control study supports.',
        evidenceSource: 'Cornelis MC, El-Sohemy A, Kabagambe EK, Campos H. JAMA 2006;295:1135-1141',
        doi: '10.1001/jama.295.10.1135',
        inferredClaim:
          'That a CYP1A2 genotype result can tell an individual how much coffee is safe for their heart',
        auditFlag: 'caution',
      },
      {
        id: 'caf-a7',
        category: 'measured',
        title: 'Four hundred milligrams six hours before bed measurably wrecks sleep',
        laymanSummary:
          'A controlled study gave people a moderate caffeine dose at bedtime, three hours before, and six hours before. All three disrupted sleep, including the one taken six hours ahead.',
        technicalDetails:
          'Drake and colleagues compared a fixed 400 mg caffeine dose administered at 0, 3 and 6 hours before habitual bedtime against placebo, with self-reported sleep and objective monitoring by a validated portable sleep monitor in the home. All three timings produced significant sleep disturbance relative to placebo (P < 0.05 for all). The authors concluded that the magnitude of reduction in total sleep time means caffeine taken six hours before bed has important disruptive effects, and that this provides the empirical basis for the standard sleep hygiene recommendation to stop caffeine at least six hours before bedtime. The result matters mechanistically and not just practically: caffeine works by blocking the adenosine signal that sleep exists to clear, so using it late costs the very recovery it is compensating for.',
        evidenceSource: 'Drake C, Roehrs T, Shambroom J, Roth T. J Clin Sleep Med 2013;9:1195-1200',
        doi: '10.5664/jcsm.3170',
        measuredMetric:
          'Self-reported and objectively monitored sleep disturbance after 400 mg caffeine at 0, 3 and 6 hours before bedtime',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed almost completely, and in the brain within an hour',
        laymanDesc:
          'Caffeine is small, fat-soluble and absorbed essentially in full. It crosses into the brain freely, which is why the effect arrives fast and does not depend on any transporter.',
        molecularDetail:
          'Oral bioavailability approaches 100% with peak plasma concentration typically 30 to 60 minutes after ingestion. Caffeine crosses the blood-brain barrier by passive diffusion and is not a substrate for efflux pumps at relevant concentrations, so brain concentration tracks plasma closely — an unusual property that removes most of the pharmacokinetic uncertainty that clouds other supplements in this file.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It occupies the tiredness receptor without switching it on',
        laymanDesc:
          'Adenosine builds up while you are awake and, when it docks, tells the brain to slow down. Caffeine fits the same dock and blocks it. Nothing is added; a signal is silenced.',
        molecularDetail:
          'Caffeine is a competitive, non-selective antagonist at adenosine A1 and A2A receptors with low-micromolar affinity, which is the range achieved by ordinary consumption. A2A antagonism in the striatum, where A2A forms heteromers with dopamine D2 receptors, accounts for most of the psychostimulant effect. Phosphodiesterase inhibition and ryanodine receptor sensitisation require concentrations far above human exposure and are not the operative mechanism.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The same workload starts to feel easier',
        laymanDesc:
          'The clearest measured consequence during exercise is not more force. It is that a given effort registers as less hard, so more work gets done before the same subjective ceiling is reached.',
        molecularDetail:
          'Doherty and Smith measured a 5.6% reduction in rating of perceived exertion during constant-load exercise with no change at all in RPE at exhaustion, and an 11.2% improvement in performance, with the RPE reduction accounting for about 29% of the performance variance. The endpoint moves because the perceptual cost of the work falls, not because the ceiling rises.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'CYP1A2 clears it, at very different speeds in different people',
        laymanDesc:
          'One liver enzyme does most of the work of breaking caffeine down, and how fast it runs varies several-fold between people, which is why identical cups produce opposite experiences.',
        molecularDetail:
          'CYP1A2 performs the initial N3-demethylation to paraxanthine, which accounts for roughly 80% of caffeine clearance. Half-life in a healthy adult is around five hours but is roughly doubled by oral contraceptives and in pregnancy, roughly halved by smoking, and modified by the rs762551 polymorphism that defines the *1A and *1F alleles. Cornelis found opposite directions of coffee-associated myocardial infarction risk in slow and rapid metabolisers, with a gene-by-coffee interaction of P = .04.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Daily use builds more receptors, and stopping exposes them',
        laymanDesc:
          'Under a permanent blockade the brain adds more adenosine receptors. When the caffeine clears, all of them receive the accumulated signal at once, which is a genuine headache rather than a psychological one.',
        molecularDetail:
          'Chronic caffeine exposure upregulates adenosine receptor density, which is the physical substrate of tolerance and of withdrawal. Juliano and Griffiths validated ten withdrawal symptoms, with headache incidence of 50%, functional impairment in 13%, onset at 12 to 24 hours, peak at 20 to 51 hours and duration of 2 to 9 days, from doses as low as 100 mg per day. Notably, Goncalves found the ergogenic response was unaffected by habitual intake — tolerance for alertness does not simply transfer to tolerance for performance.',
        iconName: 'RefreshCw',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Grgic 2020 umbrella review of 21 meta-analyses of caffeine and exercise',
        phase: 'Umbrella review of 11 systematic reviews containing 21 meta-analyses',
        sampleSize: 21,
        primaryEndpoint:
          'Effect of caffeine ingestion on aerobic endurance, muscle strength, muscle endurance, power, jumping and speed',
        endpointMet: true,
        statisticalPValue:
          'Ergogenic across all six domains; GRADE moderate for muscle endurance, muscle strength, anaerobic power and aerobic endurance',
        unreportedAdverseSignals:
          'Not all analyses gave a definite direction of effect once the 95% prediction interval was considered, and most individual studies were conducted among young men. Sample size here counts meta-analyses, not participants.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Doherty 2005 meta-analysis of caffeine and rating of perceived exertion',
        phase: 'Meta-analysis of 21 studies yielding 109 effect sizes',
        sampleSize: 21,
        primaryEndpoint: 'Change in rating of perceived exertion and in exercise performance',
        endpointMet: true,
        statisticalPValue:
          'RPE during exercise -5.6% (95% CI -4.5 to -6.7), effect size -0.47; performance +11.2% (95% CI 4.6 to 17.8)',
        unreportedAdverseSignals:
          'RPE at exhaustion was completely unchanged (0.01%, 95% CI -1.9 to 2.0), which means caffeine does not raise the subjective ceiling — it delays arrival at it.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00182312 — CAP, caffeine for apnea of prematurity',
        phase: 'Randomised double-blind placebo-controlled multicentre',
        sampleSize: 2006,
        primaryEndpoint:
          'Composite of death, cerebral palsy, cognitive delay, deafness or blindness at 18 to 21 months corrected age',
        endpointMet: true,
        statisticalPValue:
          '40.2% caffeine versus 46.2% placebo, adjusted OR 0.77 (95% CI 0.64 to 0.93), P = 0.008; cerebral palsy 4.4% versus 7.3%, aOR 0.58, P = 0.009',
        unreportedAdverseSignals:
          'Caffeine temporarily reduced weight gain, greatest at two weeks (mean difference -23 g, P < 0.001). Rates of death, ultrasonographic brain injury and necrotising enterocolitis did not differ in the short-term analysis.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Goncalves 2017 — habitual caffeine intake and the acute ergogenic response',
        phase: 'Double-blind randomised crossover, counterbalanced, with a no-supplement control arm',
        sampleSize: 40,
        primaryEndpoint: 'Simulated cycling time-trial completion time stratified by habitual intake',
        endpointMet: true,
        statisticalPValue:
          'Caffeine 29.92 min versus placebo 30.81 and control 31.14, P = 0.0002; habitual intake as covariate P = 0.47; between-tertile difference P = 0.75',
        unreportedAdverseSignals:
          'Twenty of 40 cyclists improved beyond the test variation, meaning half did not respond meaningfully. All participants were male endurance-trained cyclists.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Drake 2013 — caffeine 400 mg at 0, 3 and 6 hours before bedtime',
        phase: 'Randomised placebo-controlled crossover with objective home sleep monitoring',
        sampleSize: 12,
        primaryEndpoint: 'Self-reported and objectively monitored sleep disturbance',
        endpointMet: true,
        statisticalPValue: 'Significant sleep disturbance at all three timings versus placebo, P < 0.05',
        unreportedAdverseSignals:
          'A small sample, but the six-hour finding is the empirical basis of the standard sleep-hygiene recommendation and had not previously been tested directly in the home environment.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Caffeine is ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping and speed across 21 meta-analyses',
        'It reduces rating of perceived exertion during exercise by 5.6% and improves performance by 11.2%, with the two statistically linked',
        'In 2,006 premature infants it reduced death or neurodevelopmental disability from 46.2% to 40.2% and cerebral palsy from 7.3% to 4.4%',
        'The ergogenic response did not vary across low, moderate and high habitual consumers in a controlled crossover',
        'Four hundred milligrams six hours before bed significantly disrupted objectively monitored sleep',
      ],
      unsupportedInferences: [
        'That the daily lift a habitual user feels is a drug effect on a neutral baseline rather than partly withdrawal reversal',
        'That a consumer CYP1A2 genotype result can tell an individual how much coffee is cardiovascularly safe',
        'That the neonatal cerebral palsy result says anything about caffeine in adults, which it does not',
        'That an ergogenic effect measured almost entirely in young men generalises unchanged to everyone',
      ],
      whatFailedInitially: [
        'The two-decade sports-nutrition practice of pre-competition caffeine abstinence, which a controlled crossover found unnecessary',
        'The pre-1990s belief that phosphodiesterase inhibition was the mechanism, which requires concentrations no human reaches',
      ],
      realWorldOutcome: [
        'This is the strongest evidence base in this file and the page says so without hedging',
        'The effect is genuine but not universal: half the cyclists in the habituation study did not improve beyond test variation',
        'Withdrawal is a validated syndrome with a 50% headache incidence, triggered by habits as small as 100 mg a day',
      ],
    },
    deliverySystem: {
      type: 'Beverage, tablet, capsule, gum, powder or energy drink; intravenous or oral caffeine citrate as a neonatal prescription drug',
      description:
        'Sold in the United States as a dietary supplement under DSHEA when in supplement form, and regulated as a food additive in beverages. Absorption is near-complete and rapid by any oral route, and caffeine gum is absorbed buccally and faster still. The problematic format is bulk anhydrous powder, where a teaspoon can contain a dose several times what a person would ever consume as coffee and domestic scales cannot weigh accurately at the required precision. Pre-workout formulas are the most adulterated supplement category, and a performance effect from one of them is not necessarily a caffeine effect.',
      safetyProfile:
        'Anxiety, tremor, palpitations, gastro-oesophageal reflux and diuresis at higher intakes. Sleep disruption is measurable from a moderate dose taken six hours before bed. Withdrawal is a validated syndrome: 50% headache incidence, 13% clinically significant impairment, onset 12 to 24 hours, duration 2 to 9 days, from habits as small as 100 mg per day. Clearance is roughly halved in smokers and roughly doubled by oral contraceptives and in pregnancy. Caffeine markedly raises exposure to and is raised by CYP1A2 interactions including fluvoxamine and ciprofloxacin. In slow CYP1A2 metabolisers a case-control study found higher myocardial infarction odds at four or more cups daily, which is observational and inconsistently replicated. Acute overdose from concentrated powder is the one genuinely lethal presentation.',
    },
    commonQuestions: [
      {
        q: 'Does caffeine actually improve performance, or is that marketing?',
        a: 'It works, and this page will not hedge it. An umbrella review of eleven systematic reviews containing 21 meta-analyses found caffeine ergogenic for aerobic endurance, muscle strength, muscle endurance, power, jumping and speed, with GRADE-moderate evidence for four of those. The mechanism is partly identified: it reduces how hard a given workload feels by about 5.6% without changing the effort level at which people quit, so more work happens before the same ceiling. That is a better-supported claim than anything else in this file.',
        auditNote:
          'The stated limits are worth keeping: most trials were in young men, and half the cyclists in one controlled study did not respond beyond test variation.',
      },
      {
        q: 'Do I need to stop caffeine before a race for it to work?',
        a: 'On the best available evidence, no. Forty trained cyclists split into low, moderate and high habitual consumers all improved their time trials with caffeine, and habitual intake had no influence on the size of the response as a covariate, across tertiles, or as a correlation. The abstinence protocols that dominated sports nutrition advice for two decades were built on an assumption rather than a test, and when the test was run it did not hold.',
      },
      {
        q: 'Is the morning coffee doing anything, or just fixing withdrawal?',
        a: 'Both, and the honest answer separates them. Caffeine withdrawal is a validated syndrome with ten confirmed symptoms; headache occurs in half of people and clinically significant impairment in 13%, from habits as small as 100 mg a day, with symptoms starting 12 to 24 hours after the last dose. So a habitual user\'s pre-coffee state is below their own neutral baseline, and part of what the first cup restores is that deficit. What that does not do is erase the performance evidence, which comes from controlled crossovers with placebo arms.',
      },
      {
        q: 'How late is too late?',
        a: 'A controlled study gave people 400 mg at bedtime, three hours before bed, and six hours before bed, and measured sleep both by report and by a validated home monitor. All three timings significantly disrupted sleep, including the six-hour one. The authors said the magnitude of total sleep time lost at six hours was large enough to justify the standard advice to stop at least six hours before bed. The mechanism makes this worse than it sounds: caffeine blocks the very adenosine signal that sleep exists to clear.',
      },
      {
        q: 'Is caffeine ever a real medicine?',
        a: 'Yes, and it is one of the more remarkable results in neonatology. In 2,006 infants weighing 500 to 1,250 g at birth, caffeine reduced the need for supplemental oxygen at 36 weeks from 47% to 36%, and at 18 to 21 months reduced the composite of death or neurodevelopmental disability from 46.2% to 40.2%, with cerebral palsy falling from 7.3% to 4.4%. Caffeine citrate holds an FDA approval for apnea of prematurity. None of that transfers to an adult drinking coffee, and it is regularly quoted as though it did.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Juliano LM, Griffiths RR. A critical review of caffeine withdrawal: empirical validation of symptoms and signs, incidence, severity, and associated features. Psychopharmacology (Berl) 2004;176:1-29',
        identifier: '10.1007/s00213-004-2000-x',
        kind: 'doi',
      },
      {
        label:
          'Doherty M, Smith PM. Effects of caffeine ingestion on rating of perceived exertion during and after exercise: a meta-analysis. Scand J Med Sci Sports 2005;15:69-78',
        identifier: '10.1111/j.1600-0838.2005.00445.x',
        kind: 'doi',
      },
      {
        label:
          'Schmidt B et al. Caffeine therapy for apnea of prematurity. N Engl J Med 2006;354:2112-2121',
        identifier: '10.1056/NEJMoa054065',
        kind: 'doi',
      },
      {
        label:
          'Cornelis MC, El-Sohemy A, Kabagambe EK, Campos H. Coffee, CYP1A2 genotype, and risk of myocardial infarction. JAMA 2006;295:1135-1141',
        identifier: '10.1001/jama.295.10.1135',
        kind: 'doi',
      },
      {
        label:
          'Schmidt B et al. Long-term effects of caffeine therapy for apnea of prematurity. N Engl J Med 2007;357:1893-1902',
        identifier: '10.1056/NEJMoa073679',
        kind: 'doi',
      },
      {
        label: 'CAP trial registration — caffeine for apnea of prematurity',
        identifier: 'NCT00182312',
        kind: 'nct',
      },
      {
        label:
          'Drake C, Roehrs T, Shambroom J, Roth T. Caffeine effects on sleep taken 0, 3, or 6 hours before going to bed. J Clin Sleep Med 2013;9:1195-1200',
        identifier: '10.5664/jcsm.3170',
        kind: 'doi',
      },
      {
        label:
          'Goncalves LS et al. Dispelling the myth that habitual caffeine consumption influences the performance response to acute caffeine supplementation. J Appl Physiol (1985) 2017;123:213-220',
        identifier: '10.1152/japplphysiol.00260.2017',
        kind: 'doi',
      },
      {
        label:
          'Grgic J et al. Wake up and smell the coffee: caffeine supplementation and exercise performance — an umbrella review of 21 published meta-analyses. Br J Sports Med 2020;54:681-688',
        identifier: '10.1136/bjsports-2018-100278',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA — NDA 020793, CAFCIT (caffeine citrate) for apnea of prematurity',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020793',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 2519 — Caffeine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2519',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Whey protein — the supplement effect is real, replicated, and 0.30 kg of fat-free mass. Above
  // 1.62 g/kg/day of total protein it stops entirely, and the anabolic window did not survive
  // controlling for total intake.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'whey-protein',
    name: 'Whey protein',
    tradeName:
      'Sold as whey concentrate, whey isolate and whey hydrolysate — three processing grades of the same starting material',
    sponsor:
      'No single sponsor — the soluble protein fraction of milk, a by-product of cheese manufacture, filtered and dried by many manufacturers',
    targetGene: 'MTOR',
    targetProtein:
      'mTOR complex 1, the nutrient-sensing kinase that switches on muscle protein synthesis. The specific input is leucine, sensed by Sestrin2 upstream of GATOR2, which relieves inhibition of mTORC1 at the lysosome. Whey matters because of how much leucine it delivers and how fast, not because whey protein is itself anabolic.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a dietary supplement for muscle gain, recovery and satiety. Not approved by the FDA or EMA for any indication. Hydrolysed whey formulas are separately used clinically as hypoallergenic infant feeds and in enteral nutrition, which is a different product for a different purpose.',
    patientFriendlyIndication:
      'Taken after training to build muscle, and generally to hit a daily protein target',
    conditionContext: {
      conditionExplainer:
        'Muscle is in constant turnover. Resistance training raises the rate at which muscle protein is broken down and the rate at which it is built, and net gain over months depends on the balance. Eating protein raises the building rate for a few hours, and the amino acid leucine is the specific chemical trigger the cell reads.',
      whyItMatters:
        'Whey is the biggest-selling supplement category in the world and the one where the underlying science is most solid — and where the marketing has nonetheless invented several things the science does not support. Whey does raise muscle protein synthesis more than casein or soy. Adding it to a training programme does add muscle. The amount it adds, and the point at which adding more stops doing anything, are both known and both smaller than the aisle implies.',
      whoTakesThis:
        'Lifters and athletes, older adults being treated for sarcopenia, hospital patients on enteral nutrition, and a very large number of people who simply find a shake more convenient than cooking.',
      clinicalGoals:
        'Trials measured fractional rates of mixed muscle protein synthesis by stable-isotope infusion, one-repetition maximum strength, fat-free mass by DXA, muscle fibre cross-sectional area from biopsy, mid-femur cross-sectional area, and glomerular filtration rate in the safety literature.',
    },
    oneSentenceVerdict:
      'Across 49 trials in 1,863 people, protein supplementation added 0.30 kg of fat-free mass and 2.49 kg of one-repetition maximum on top of resistance training — a real, replicated, modest effect that stops entirely once total protein intake passes 1.62 g/kg/day, and the post-workout anabolic window disappeared once total daily intake was controlled for.',
    laymanHowItWorks:
      'Whey is the watery part of milk left behind when cheese is made, dried into a powder. It is digested unusually fast and is unusually rich in leucine, an amino acid that acts as a switch: when enough of it arrives in the blood at once, a sensor inside the muscle cell turns on the machinery that builds new protein. That switch stays on for a few hours and then turns off regardless of how much more protein you eat, which is why a very large dose is not proportionally better than a moderate one — the surplus is simply burned for energy.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 78,
    anatomicalSite:
      'Skeletal muscle fibre cytoplasm, at the lysosomal surface where mTORC1 is activated; digestion and absorption in the proximal small intestine',
    substitutes: {
      summary:
        'Whey has no advantage over food that survives contact with the meta-analysis. It is faster and more leucine-dense per gram than most whole foods, which matters acutely; over a training block, total daily protein is what predicts hypertrophy, and food supplies that perfectly well.',
      conventionalRx: [
        {
          name: 'Extensively hydrolysed whey infant formula',
          class: 'Medical nutrition, hypoallergenic feed',
          howItCompares:
            'The same starting material cut into peptides small enough to avoid triggering cow\'s milk protein allergy. A genuine clinical product with a genuine indication. It is not evidence for anything about muscle.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: solves a defined clinical problem. Cons: the word "hydrolysate" on a sports tub borrows credibility from this use, and hydrolysing whey for an adult buys speed of digestion, not a different biology.',
        },
      ],
      naturalFoods: [
        {
          name: 'Milk, cheese, yoghurt and any complete protein food',
          activeCompound: 'Leucine — about 10 to 11 percent of whey protein by weight',
          biologicalMechanism:
            'The cell senses leucine, not whey. Any food that delivers enough leucine in one sitting triggers the same mTORC1 response. Whey does it faster and with less volume, which is a convenience advantage and, in older adults with blunted anabolic sensitivity, sometimes a real one.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Moore et al. found 20 g of whole egg protein maximally stimulated muscle protein synthesis after resistance exercise, and 40 g did not do more.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Soy protein isolate, as the tested comparator',
          activeCompound: 'Lower leucine content, still rapidly digested',
          biologicalMechanism:
            'Tang et al. measured it directly. After resistance exercise, muscle protein synthesis on whey was about 31% greater than on soy and about 122% greater than on casein, with soy sitting between the two — an ordering that tracks digestion speed and leucine delivery rather than any unique property of dairy.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Add up total daily protein before buying anything',
          action:
            'The meta-regression that established the supplement effect also established where it stops: beyond a total intake of 1.62 g per kg of body mass per day, additional protein produced no further training-induced gain in fat-free mass.',
          patientImpact:
            'Someone already eating above that threshold from food is buying a supplement whose measured incremental effect on fat-free mass is zero, at any dose.',
          clinicalPrecaution:
            'The same analysis found the benefit shrinks with age and is larger in people already resistance-trained, which is the opposite of the pattern most marketing assumes.',
        },
        {
          name: 'The post-workout window is not a window',
          action:
            'Check whether a protein-timing claim controlled for total daily protein intake. The pooled effect looks real until it does, and then it is not there.',
          patientImpact:
            'In a meta-regression of 20 strength studies and 23 hypertrophy studies, a simple pooled analysis showed a small-to-moderate hypertrophy effect of protein timing. In the full model controlling for covariates, no significant difference remained for strength or hypertrophy, and total protein intake was the strongest predictor of effect size.',
          clinicalPrecaution:
            'This is a clean example of a confounded pooled result: timing groups ate more protein, and it was the protein doing the work.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C[C@@H](C(=O)O)N',
      chemicalFormula: 'C6H13NO2',
      molecularWeight:
        '131.17 g/mol. This is L-leucine, not whey. Whey protein is a mixture of hundreds of proteins — beta-lactoglobulin, alpha-lactalbumin, immunoglobulins, serum albumin, lactoferrin — with no single molecule to draw. Leucine is the marker the literature actually tracks, because it is the amino acid the muscle cell senses, and whey is distinguished from other proteins chiefly by how much of it whey delivers and how quickly.',
      structureSource: {
        label: 'PubChem CID 6106 — L-Leucine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6106',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'whey-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Amino acid profile and nitrogen-spiking check, plus a heavy metal panel',
          description:
            'Protein content on a supplement label is usually derived from total nitrogen, and total nitrogen can be inflated by adding cheap nitrogen-rich compounds that are not protein. The only assay that catches this is a full amino acid profile, which also gives the leucine content that actually determines the biological effect. Run a heavy metal panel in the same pass, because independent testing has repeatedly found arsenic, cadmium, mercury and lead in this product category.',
          reagentsAndBuffer:
            'Acid hydrolysis in 6 M HCl at 110 degrees C for 24 h; amino acid analysis by ion-exchange chromatography with ninhydrin detection; separate performic acid oxidation for cysteine and methionine; Kjeldahl nitrogen for comparison against the amino acid sum; ICP-MS for arsenic, cadmium, mercury and lead against certified standards',
        },
        {
          id: 'whey-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the stable-isotope tracer infusion',
          description:
            'Muscle protein synthesis is a rate, not a quantity, and it can only be measured by tracking a labelled amino acid into muscle protein over time. This is the technique that produced every number in this dossier about whey versus casein versus soy, and it is why those numbers are trustworthy in a way that scale weight is not.',
          dependsOnStepId: 'whey-w1',
          reagentsAndBuffer:
            'L-[ring-13C6]phenylalanine for the primed constant infusion; [1-13C]leucine for the parallel oxidation measurement; sterile pyrogen-free preparation; priming dose calculated from the subject\'s estimated pool size; background enrichment sampled before infusion',
        },
        {
          id: 'whey-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Muscle biopsy processing and isolation of the mixed muscle protein fraction',
          description:
            'Separate the bound protein pool from the free intracellular amino acid pool, because tracer in the free pool is the precursor and tracer in the bound pool is the product. Confusing the two is the commonest way a synthesis rate comes out wrong, and it is why the biopsy handling is a validated step rather than a technicality.',
          dependsOnStepId: 'whey-w2',
          reagentsAndBuffer:
            'Vastus lateralis needle biopsy under local anaesthesia; homogenisation in ice-cold perchloric acid; separation of intracellular free amino acids from the protein pellet; repeated washing of the pellet; acid hydrolysis of the mixed muscle protein fraction; derivatisation for GC-combustion-isotope ratio mass spectrometry',
        },
        {
          id: 'whey-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Leucine sensing at the lysosome, with the Sestrin2 arm',
          description:
            'Test whether the anabolic signal is leucine-specific rather than protein-specific by supplying matched essential amino acids with and without leucine, and by disrupting the sensor. If mTORC1 activation tracks leucine and not total protein, then the entire whey-versus-casein-versus-soy ordering has a single explanation.',
          dependsOnStepId: 'whey-w3',
          reagentsAndBuffer:
            'C2C12 myotubes and primary human myotubes; amino-acid-free DMEM baseline; leucine add-back at graded concentrations; Sestrin2 knockdown by siRNA; rapamycin and Torin1 as mTORC1 inhibitors; phospho-p70S6K Thr389 and phospho-4E-BP1 immunoblotting; lysosomal mTOR co-localisation by immunofluorescence',
        },
        {
          id: 'whey-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fractional synthetic rate alongside a long-term body composition endpoint',
          description:
            'Report the acute synthesis rate and the chronic composition change together, because they do not agree as often as the field implies. Whey raises the acute rate substantially more than casein; the chronic supplementation meta-analysis finds 0.30 kg of fat-free mass across all protein types. An acute mechanistic win is not a training outcome.',
          dependsOnStepId: 'whey-w4',
          reagentsAndBuffer:
            'GC-combustion-IRMS for tracer enrichment in the bound protein pool; fractional synthetic rate expressed as percent per hour; DXA for fat-free mass with a standardised hydration and fasting protocol; muscle fibre cross-sectional area by immunohistochemistry on the same biopsy',
        },
      ],
    },
    keyAudits: [
      {
        id: 'whey-a1',
        category: 'measured',
        title: 'The supplement effect is real, replicated, and 0.30 kg of fat-free mass',
        laymanSummary:
          'Across 49 randomised trials in 1,863 people, adding protein to a training programme produced measurably more muscle and strength than training alone. The amount was about a third of a kilogram of lean mass.',
        technicalDetails:
          'Morton and colleagues meta-analysed randomised controlled trials with at least six weeks of resistance training plus protein supplementation. Across 49 studies and 1,863 participants, protein supplementation significantly increased one-repetition-maximum strength by 2.49 kg (95% CI 0.64 to 4.33), fat-free mass by 0.30 kg (95% CI 0.09 to 0.52), muscle fibre cross-sectional area by 310 square micrometres (95% CI 51 to 570) and mid-femur cross-sectional area by 7.2 square millimetres (95% CI 0.20 to 14.30). Every one of those is statistically significant and every one is small. Two meta-regression findings matter as much as the headline: the effect on fat-free mass fell with increasing age (-0.01 kg per year, P = 0.002) and was larger in people already resistance-trained (+0.75 kg, P = 0.03). The population most often sold protein for sarcopenia is the population in which the supplement effect is weakest.',
        evidenceSource: 'Morton RW et al. Br J Sports Med 2018;52:376-384',
        doi: '10.1136/bjsports-2017-097608',
        measuredMetric:
          'Change in fat-free mass, one-repetition maximum, muscle fibre cross-sectional area and mid-femur cross-sectional area',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a2',
        category: 'measured',
        title: 'It stops working above 1.62 g per kg per day, and the analysis says so exactly',
        laymanSummary:
          'The same meta-analysis found the point where extra protein stops adding anything: once total daily intake passes about 1.6 grams per kilogram of body weight, more protein produced no further muscle gain.',
        technicalDetails:
          'A two-phase break point analysis across the 49 included studies determined that protein supplementation beyond a total protein intake of 1.62 g/kg/day resulted in no further resistance-training-induced gains in fat-free mass. This is not an opinion or a rule of thumb — it is a break point estimated from the pooled data, and it defines the exact boundary of the product\'s usefulness. A person already eating above that from food is, on the best available evidence, buying a supplement with a measured incremental effect of zero on fat-free mass, no matter how much of it they take. The finding also reframes the whole category: whey is not a muscle-building agent, it is a convenient way to reach a threshold, and past the threshold it is protein-flavoured food.',
        evidenceSource: 'Morton RW et al. Br J Sports Med 2018;52:376-384',
        doi: '10.1136/bjsports-2017-097608',
        measuredMetric:
          'Two-phase break point in the relationship between total protein intake and change in fat-free mass',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a3',
        category: 'measured',
        title: 'Whey does beat casein and soy acutely, by 122% and 31%',
        laymanSummary:
          'A stable-isotope study measured muscle protein synthesis directly after equal amounts of essential amino acids from whey, casein or soy. Whey produced by far the biggest response.',
        technicalDetails:
          'Tang and colleagues gave three groups of six healthy young men drinks matched for essential amino acid content at 10 g, as whey hydrolysate, micellar casein or soy protein isolate, after unilateral leg resistance exercise, with mixed muscle protein synthesis measured by primed constant infusion of L-[ring-13C6]phenylalanine. Whey produced larger increases in blood essential amino acids, branched-chain amino acids and leucine than either comparator (P < 0.05). At rest, mixed muscle protein synthesis was 0.091 +/- 0.015 %/h on whey, 0.078 +/- 0.014 on soy and 0.047 +/- 0.008 on casein — whey approximately 93% greater than casein (P < 0.01) and 18% greater than soy (P = 0.067). After exercise the ordering held: whey approximately 122% greater than casein (P < 0.01) and 31% greater than soy (P < 0.05). This is a genuine, mechanistically clean advantage for whey, and it is an acute synthesis rate in six men per group, not a training outcome. The chronic meta-analysis that measured training outcomes did not separate protein sources.',
        evidenceSource: 'Tang JE, Moore DR, Kujbida GW, Tarnopolsky MA, Phillips SM. J Appl Physiol 2009;107:987-992',
        doi: '10.1152/japplphysiol.00076.2009',
        measuredMetric:
          'Fractional rate of mixed muscle protein synthesis, percent per hour, at rest and after resistance exercise',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a4',
        category: 'conclusion_shift',
        title: 'The anabolic window vanished when total protein was controlled for',
        laymanSummary:
          'The belief that protein must be taken within an hour of training looked supported until researchers accounted for the fact that the timing groups also ate more protein overall. Then the effect disappeared.',
        technicalDetails:
          'Schoenfeld, Aragon and Krieger ran a multi-level meta-regression of randomised controlled trials of protein timing. The strength analysis comprised 478 subjects and 96 effect sizes nested within 41 groups and 20 studies; the hypertrophy analysis comprised 525 subjects and 132 effect sizes nested within 47 groups and 23 studies. A simple pooled analysis without controlling for covariates showed a small-to-moderate effect of protein timing on hypertrophy and no significant effect on strength. In the full meta-regression model controlling for all covariates, no significant difference was found between treatment and control for either strength or hypertrophy, and the reduced model did not differ from the full model. Total protein intake was the strongest predictor of hypertrophy effect size. The authors wrote that these results refute the commonly held belief that timing of protein intake around a training session is critical. It is one of the cleanest published demonstrations that an apparently real effect was a confounder wearing a mechanism.',
        evidenceSource: 'Schoenfeld BJ, Aragon AA, Krieger JW. J Int Soc Sports Nutr 2013;10:53',
        doi: '10.1186/1550-2783-10-53',
        measuredMetric:
          'Effect size for muscle strength and hypertrophy attributable to protein timing, before and after covariate control',
        inferredClaim:
          'That protein consumed close to a training session produces adaptations beyond those explained by total daily protein intake',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a5',
        category: 'inferred',
        title: 'Twenty grams maxed out the response, and the surplus was oxidised',
        laymanSummary:
          'A dose-response study found muscle protein synthesis peaked at 20 grams of protein after training. Forty grams did not build more; it was burned for energy instead.',
        technicalDetails:
          'Moore and colleagues had six healthy young men perform intense leg resistance exercise on five separate occasions and consume, in randomised order, drinks containing 0, 5, 10, 20 or 40 g of whole egg protein, with protein synthesis and whole-body leucine oxidation measured over four hours by primed constant infusion of [1-13C]leucine. Muscle protein synthesis showed a dose response and was maximally stimulated at 20 g. Albumin synthesis also plateaued at 20 g. Leucine oxidation increased significantly after 20 and 40 g — that is, protein consumed above the threshold was demonstrably burned rather than incorporated. Phosphorylation of p70S6K, ribosomal protein S6 and eIF2B-epsilon was unaffected by any dose, which the authors read as evidence that the stimulation depends on amino acid availability rather than on further signalling amplification. Six men and whole egg protein is a narrow base, and larger doses matter more in older adults and after whole-body training. But the shape of the curve — a plateau with oxidation of the excess — is the single most useful fact about protein dosing and the one the 50-gram serving scoop ignores.',
        evidenceSource: 'Moore DR et al. Am J Clin Nutr 2009;89:161-168',
        doi: '10.3945/ajcn.2008.26401',
        measuredMetric:
          'Muscle and albumin protein synthesis and whole-body leucine oxidation across 0, 5, 10, 20 and 40 g protein doses',
        inferredClaim:
          'That a larger protein serving produces a proportionally larger anabolic response, when synthesis plateaued at 20 g and the surplus was oxidised',
        auditFlag: 'caution',
      },
      {
        id: 'whey-a6',
        category: 'conclusion_shift',
        title: 'The kidney warning did not survive the meta-analysis',
        laymanSummary:
          'High-protein diets were long said to damage kidneys. Pooling 28 randomised trials in healthy adults found no difference in the change in kidney filtration rate.',
        technicalDetails:
          'Devries and colleagues systematically reviewed randomised controlled trials longer than four days comparing higher-protein intakes (at least 1.5 g/kg body weight, or at least 20% of energy, or at least 100 g/day) against normal or lower protein intakes, in adults without kidney disease, with glomerular filtration rate as the outcome. Twenty-eight trials with 1,358 participants were analysed. The post-intervention comparison showed a trivial effect for GFR to be higher after higher-protein intakes (standardised mean difference 0.19, 95% CI 0.07 to 0.31, P = 0.002), while the change in GFR from pre- to post-intervention did not differ between interventions (SMD 0.11, 95% CI -0.05 to 0.27, P = 0.16). There was a linear relation between protein intake and post-intervention GFR (r = 0.332, P = 0.03) but not between protein intake and the change in GFR (r = 0.184, P = 0.33). The physiological reading is that a higher protein load raises filtration as an adaptive response, not as an injury. The caveat that belongs on the record: these are healthy adults, and the trials are short relative to a lifetime of habitual intake.',
        evidenceSource: 'Devries MC et al. J Nutr 2018;148:1760-1775',
        doi: '10.1093/jn/nxy197',
        measuredMetric:
          'Glomerular filtration rate, post-intervention and as change from baseline, on higher versus normal or lower protein intakes',
        auditFlag: 'verified',
      },
      {
        id: 'whey-a7',
        category: 'inferred',
        title: 'Heavy metals: found repeatedly, then assessed as safe by industry-adjacent consultants',
        laymanSummary:
          'Consumer testing found arsenic, cadmium, mercury and lead in protein powders, with 40 percent of 133 products elevated. A follow-up risk assessment concluded the exposures were below regulatory thresholds. Its three authors all worked for the same litigation-support consultancy.',
        technicalDetails:
          'Bandara, Towle and Monnot performed a human health risk assessment responding to a Consumer Reports analysis of 15 protein powders, which had found that average heavy metal amounts in three servings per day exceeded the maximum limits proposed by the US Pharmacopeia, and to a follow-up study reporting that 40% of 133 protein powder products tested had elevated heavy metal levels. Using US EPA reference doses for arsenic and cadmium, the EPA screening level for mercury, and the EPA Adult Lead Methodology model, they calculated hazard quotients and a cumulative hazard index for each product at one and three servings per day. All hazard indices were below 1 and all modelled blood lead levels were below the CDC guidance value of 5 micrograms per decilitre. The highest hazard indices, approaching 1, were in mass-gain products; the lowest were in whey protein powders. Their conclusion was that typical intake would not result in adverse health effects. Two facts belong alongside that conclusion. First, all three authors were affiliated with Cardno ChemRisk, a consultancy whose work is frequently commissioned in product-liability contexts. Second, "hazard index below 1" is a regulatory screening threshold, not a demonstration of no effect, and the underlying contamination finding — that the metals are present, and elevated in a substantial minority of products — is not in dispute.',
        evidenceSource: 'Bandara SB, Towle KM, Monnot AD. Toxicol Rep 2020;7:1255-1262',
        doi: '10.1016/j.toxrep.2020.08.001',
        inferredClaim:
          'That a hazard index below the regulatory screening threshold, calculated by industry-adjacent consultants, closes the question of heavy metal contamination in protein powders',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Digested fast, which is the whole point of whey',
        laymanDesc:
          'Whey stays liquid in the stomach instead of clotting, so it empties quickly and floods the bloodstream with amino acids within about half an hour. Casein does the opposite.',
        molecularDetail:
          'Whey proteins remain soluble at gastric pH while casein micelles precipitate into a curd, producing a much faster gastric emptying and a sharper plasma aminoacidaemia. Tang et al. measured the consequence: blood essential amino acid, branched-chain amino acid and leucine concentrations all rose more after whey than after casein or soy (P < 0.05). Hydrolysing whey further accelerates this without changing the amino acids delivered.',
        iconName: 'Zap',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Leucine is the signal, not protein in general',
        laymanDesc:
          'The muscle cell is not counting grams of protein. It is watching for one amino acid, and when enough of it arrives at once, a switch flips.',
        molecularDetail:
          'Leucine binds Sestrin2, releasing its inhibition of GATOR2, which permits mTORC1 activation at the lysosomal surface. Whey is roughly 10 to 11 percent leucine by weight, higher than casein and considerably higher than most plant proteins, which is the single best explanation for the whey-over-soy-over-casein ordering in acute synthesis measurements.',
        iconName: 'ToggleRight',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'mTORC1 switches on the protein-building machinery',
        laymanDesc:
          'Once triggered, a master kinase turns on the cellular machinery that reads genetic instructions into new muscle protein. It stays on for a few hours.',
        molecularDetail:
          'Activated mTORC1 phosphorylates p70S6K and 4E-BP1, relieving translational repression and increasing translation initiation. Notably, Moore et al. found phosphorylation of p70S6K Thr389, ribosomal protein S6 Ser240/244 and eIF2B-epsilon Ser539 was unaffected across protein doses from 0 to 40 g, which argues the dose-response in synthesis is driven by substrate availability rather than by graded signalling.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The response saturates, and the surplus is burned',
        laymanDesc:
          'Past about twenty grams the building rate stops rising. Extra protein does not sit around waiting; it gets oxidised for energy.',
        molecularDetail:
          'Moore et al. found muscle protein synthesis and albumin synthesis both maximally stimulated at 20 g of whole egg protein after resistance exercise, with whole-body leucine oxidation rising significantly at 20 and 40 g. The plateau is a property of the anabolic response, not of absorption — the amino acids are absorbed either way, they are simply deaminated and the carbon skeletons oxidised.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Over months this compounds into about a third of a kilogram',
        laymanDesc:
          'Repeated across a training block, the extra synthesis adds up to a small but genuine amount of additional muscle over training alone.',
        molecularDetail:
          'Across 49 randomised trials and 1,863 participants, protein supplementation added 0.30 kg of fat-free mass (95% CI 0.09 to 0.52), 2.49 kg of one-repetition maximum (95% CI 0.64 to 4.33) and 310 square micrometres of muscle fibre cross-sectional area (95% CI 51 to 570) beyond training alone — with the whole effect conditional on total protein intake being below 1.62 g/kg/day.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Morton 2018 meta-analysis of protein supplementation and resistance training',
        phase: 'Meta-analysis and meta-regression of 49 randomised controlled trials',
        sampleSize: 1863,
        primaryEndpoint: 'Change in fat-free mass and one-repetition-maximum strength',
        endpointMet: true,
        statisticalPValue:
          'FFM +0.30 kg (95% CI 0.09 to 0.52); 1RM +2.49 kg (95% CI 0.64 to 4.33); break point at 1.62 g/kg/day total protein, beyond which no further FFM gain',
        unreportedAdverseSignals:
          'Effect on fat-free mass declined with age (-0.01 kg per year, P = 0.002) and was larger in already-trained individuals (+0.75 kg, P = 0.03) — the reverse of the pattern implied by marketing aimed at beginners and older adults.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Tang 2009 — whey hydrolysate versus micellar casein versus soy isolate',
        phase: 'Randomised parallel-group stable-isotope infusion study',
        sampleSize: 18,
        primaryEndpoint:
          'Fractional rate of mixed muscle protein synthesis at rest and after resistance exercise',
        endpointMet: true,
        statisticalPValue:
          'After exercise, whey approximately 122% greater than casein (P < 0.01) and 31% greater than soy (P < 0.05); at rest 93% greater than casein (P < 0.01) and 18% greater than soy (P = 0.067)',
        unreportedAdverseSignals:
          'Six men per group and a single acute measurement. The resting whey-versus-soy comparison did not reach significance. Acute synthesis rates and long-term hypertrophy diverge often enough that this cannot be read as a training result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Moore 2009 — ingested protein dose response after resistance exercise',
        phase: 'Randomised within-subject dose-response with stable-isotope infusion',
        sampleSize: 6,
        primaryEndpoint:
          'Muscle and albumin protein synthesis across 0, 5, 10, 20 and 40 g protein doses',
        endpointMet: true,
        statisticalPValue:
          'Maximal stimulation of muscle and albumin protein synthesis at 20 g; leucine oxidation significantly increased at 20 and 40 g',
        unreportedAdverseSignals:
          'Six young men, whole egg protein, single-limb exercise. The 20 g plateau is widely generalised to older adults and whole-body training, where the evidence suggests a higher threshold.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Schoenfeld 2013 meta-regression of protein timing',
        phase: 'Multi-level meta-regression of randomised controlled trials',
        sampleSize: 525,
        primaryEndpoint: 'Muscle strength and hypertrophy effect size attributable to protein timing',
        endpointMet: false,
        statisticalPValue:
          'Simple pooled analysis showed a small-to-moderate hypertrophy effect; in the full model controlling for covariates, no significant difference for strength or hypertrophy',
        unreportedAdverseSignals:
          'Total protein intake was the strongest predictor of hypertrophy effect size, meaning the apparent timing effect was a total-intake effect in disguise.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Devries 2018 meta-analysis of higher-protein intake and kidney function',
        phase: 'Systematic review and meta-analysis of 28 randomised controlled trials',
        sampleSize: 1358,
        primaryEndpoint: 'Glomerular filtration rate on higher versus normal or lower protein intake',
        endpointMet: false,
        statisticalPValue:
          'Post-intervention GFR SMD 0.19 (95% CI 0.07 to 0.31), P = 0.002; change in GFR SMD 0.11 (95% CI -0.05 to 0.27), P = 0.16',
        unreportedAdverseSignals:
          'Restricted to adults without kidney disease, and trials were short relative to habitual lifetime intake. Post-intervention GFR was higher on high protein, which is read as adaptive hyperfiltration rather than injury — a reading, not a measurement.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Protein supplementation added 0.30 kg fat-free mass and 2.49 kg one-repetition maximum across 49 trials in 1,863 people',
        'The break point was 1.62 g/kg/day total protein, beyond which no further fat-free mass gain occurred',
        'Whey raised post-exercise muscle protein synthesis approximately 122% above casein and 31% above soy',
        'Muscle protein synthesis plateaued at 20 g of protein, with leucine oxidation rising at 20 and 40 g',
        'Change in glomerular filtration rate did not differ between higher and lower protein intakes across 28 trials',
      ],
      unsupportedInferences: [
        'That protein must be taken in a window around training, which vanished when total daily intake was controlled for',
        'That a larger serving produces a proportionally larger response, when the response plateaued at 20 g',
        'That whey\'s acute superiority over casein and soy translates into superior long-term hypertrophy, which no chronic trial has separated',
        'That heavy metal contamination is a closed question because one industry-adjacent risk assessment computed a hazard index below 1',
      ],
      whatFailedInitially: [
        'The anabolic window, refuted in a meta-regression of 43 study groups once total protein was entered as a covariate',
        'The high-protein kidney warning, which did not survive 28 randomised trials in healthy adults',
      ],
      realWorldOutcome: [
        'Whey works, the mechanism is understood down to the amino acid, and this page says so without hedging',
        'The effect is small, is conditional on being below a total-intake threshold, and shrinks with age',
        'Protein powder is a convenience product for reaching a number, and above that number its measured incremental effect is zero',
      ],
    },
    deliverySystem: {
      type: 'Oral powder reconstituted in liquid; concentrate, isolate or hydrolysate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. The three grades differ by processing rather than by biology: concentrate retains more lactose and fat, isolate is filtered further to a higher protein percentage, and hydrolysate is pre-cleaved into peptides for faster absorption. All three deliver the same amino acids, and leucine content per gram of protein is nearly identical between them. Label protein content is usually derived from total nitrogen, which is inflatable by nitrogen-rich non-protein additives, so a full amino acid profile is the only assay that verifies the claim.',
      safetyProfile:
        'Bloating, flatulence and diarrhoea in lactose-intolerant users of concentrate, which isolate largely avoids. Cow\'s milk protein allergy is a genuine contraindication and is not the same as lactose intolerance. Higher protein intake does not change glomerular filtration rate in healthy adults across 28 randomised trials, but that evidence does not extend to existing chronic kidney disease, where protein restriction remains standard. Independent testing has repeatedly found arsenic, cadmium, mercury and lead in this product category, with plant-based and mass-gain formulas worse than whey; a subsequent risk assessment by industry-adjacent consultants calculated hazard indices below the regulatory screening threshold.',
    },
    commonQuestions: [
      {
        q: 'Does protein powder actually build muscle?',
        a: 'Yes, and the number is worth carrying. Across 49 randomised trials in 1,863 people, adding protein to at least six weeks of resistance training produced 0.30 kg more fat-free mass and 2.49 kg more on one-repetition maximum than training alone. Those are statistically significant and physically small. The important companion finding is the break point: beyond a total protein intake of 1.62 g per kilogram per day, additional protein produced no further gain in fat-free mass at all.',
        auditNote:
          'Whey is a convenient way to reach that threshold, not a separate anabolic agent.',
      },
      {
        q: 'Do I need to drink it right after training?',
        a: 'No. A meta-regression across 20 strength studies and 23 hypertrophy studies found that a simple pooled analysis suggested a timing effect, but once total protein intake and other covariates were entered into the model, no significant difference remained for strength or hypertrophy. Total protein intake was the strongest predictor of hypertrophy. The timing groups in those studies were eating more protein, and it was the protein doing the work.',
      },
      {
        q: 'Is whey better than casein or plant protein?',
        a: 'Acutely, yes, and by a lot: after resistance exercise, muscle protein synthesis on whey was about 122 percent higher than on casein and 31 percent higher than on soy in a stable-isotope study. The reason is leucine delivery and digestion speed, not anything unique to dairy. What has not been shown is that this acute advantage produces more muscle over a training block — the chronic meta-analysis that measured actual hypertrophy did not separate protein sources, and its effect size was the same modest 0.30 kg.',
      },
      {
        q: 'Will a big scoop work better than a small one?',
        a: 'Not for the anabolic response. A dose-response study found muscle protein synthesis maximally stimulated at 20 grams after resistance exercise, with no further increase at 40 grams, and leucine oxidation rising significantly at both — meaning the excess was measurably burned rather than built into muscle. That study used six young men and single-limb exercise, and the threshold is probably higher for older adults and whole-body sessions. But a plateau exists, and serving sizes are not set by it.',
      },
      {
        q: 'Is it bad for my kidneys?',
        a: 'Not in healthy adults, on the current evidence. Twenty-eight randomised trials in 1,358 participants without kidney disease found no difference in the change in glomerular filtration rate between higher and lower protein intakes. Post-intervention filtration was slightly higher on high protein, which is generally read as an adaptive response to a bigger nitrogen load rather than as damage. That reading is an interpretation, the trials are short, and none of it applies to someone who already has chronic kidney disease, where protein restriction remains standard care.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Moore DR et al. Ingested protein dose response of muscle and albumin protein synthesis after resistance exercise in young men. Am J Clin Nutr 2009;89:161-168',
        identifier: '10.3945/ajcn.2008.26401',
        kind: 'doi',
      },
      {
        label:
          'Tang JE, Moore DR, Kujbida GW, Tarnopolsky MA, Phillips SM. Ingestion of whey hydrolysate, casein, or soy protein isolate: effects on mixed muscle protein synthesis at rest and following resistance exercise in young men. J Appl Physiol 2009;107:987-992',
        identifier: '10.1152/japplphysiol.00076.2009',
        kind: 'doi',
      },
      {
        label:
          'Schoenfeld BJ, Aragon AA, Krieger JW. The effect of protein timing on muscle strength and hypertrophy: a meta-analysis. J Int Soc Sports Nutr 2013;10:53',
        identifier: '10.1186/1550-2783-10-53',
        kind: 'doi',
      },
      {
        label:
          'Morton RW et al. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults. Br J Sports Med 2018;52:376-384',
        identifier: '10.1136/bjsports-2017-097608',
        kind: 'doi',
      },
      {
        label:
          'Devries MC et al. Changes in kidney function do not differ between healthy adults consuming higher- compared with lower- or normal-protein diets: a systematic review and meta-analysis. J Nutr 2018;148:1760-1775',
        identifier: '10.1093/jn/nxy197',
        kind: 'doi',
      },
      {
        label:
          'Bandara SB, Towle KM, Monnot AD. A human health risk assessment of heavy metal ingestion among consumers of protein powder supplements. Toxicol Rep 2020;7:1255-1262',
        identifier: '10.1016/j.toxrep.2020.08.001',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 6106 — L-Leucine, the marker amino acid tracked in the whey literature',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/6106',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Collagen peptides — swallowed collagen is digested like any other protein, and the collagen
  // industry's own paper concedes it lacks tryptophan. What survives that is a dipeptide, and the
  // trials that found skin effects were largely run by the people selling it.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'collagen-peptides',
    name: 'Collagen peptides',
    tradeName:
      'Sold as hydrolysed collagen, collagen hydrolysate, gelatin hydrolysate or "specific collagen peptides"; brand ingredients include Verisol, Fortigel and CH-Alpha',
    sponsor:
      'No single sponsor — enzymatically hydrolysed bovine, porcine or marine collagen. GELITA AG and the Collagen Research Institute GmbH are the two entities behind much of the published trial literature.',
    targetGene: 'COL1A1',
    targetProtein:
      'Type I collagen, whose alpha-1 chain is COL1A1. The supplement does not deliver this protein anywhere. The only plausible pharmacological entity is the dipeptide prolyl-hydroxyproline (Pro-Hyp), which survives digestion intact, reaches plasma, and has been proposed as a signal to dermal fibroblasts and chondrocytes rather than as a building block.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for skin wrinkles, hydration and elasticity, joint pain, hair, nails and bone density. Not approved by the FDA or EMA for any of them. Gelatin itself is a pharmaceutical excipient with a long regulatory history as a capsule shell, which is a different use of the same material.',
    patientFriendlyIndication: 'Taken for skin, joints, hair and nails',
    conditionContext: {
      conditionExplainer:
        'Collagen is the structural protein that makes up most of the dry weight of skin, tendon, ligament and bone matrix. It is built inside fibroblasts from ordinary amino acids, and two of its residues — hydroxyproline and hydroxylysine — are made after the chain is assembled, by enzymes that require vitamin C. Nothing in that process reads dietary collagen as input.',
      whyItMatters:
        'This is the category where the naming does the persuading. "Collagen" on the tub and "collagen" in the skin are the same word for two things that never meet, because the first is dismantled in the gut. The honest scientific question is narrower and more interesting: whether the small hydroxyproline-containing peptides that do survive digestion act as signals. That question is genuinely open, and it is not the question the marketing asks.',
      whoTakesThis:
        'Overwhelmingly women — 95% of participants in the pooled skin-ageing trials were female. Also athletes taking gelatin for tendon and ligament, older adults for joints and bone, and a large market taking it in coffee for no defined endpoint.',
      clinicalGoals:
        'Trials measured instrument-assessed skin hydration, elasticity and wrinkle depth, visual analogue scores for joint pain, bone mineral density T-scores, and circulating markers of collagen synthesis, principally amino-terminal propeptide of type I collagen (P1NP).',
    },
    oneSentenceVerdict:
      'Swallowed collagen is digested like any other protein and, by the admission of a paper written at a collagen manufacturer, lacks tryptophan entirely and is an incomplete protein; a pooled analysis of 19 trials in 1,125 people does find favourable skin hydration, elasticity and wrinkle results, and the mechanism that could explain it is a dipeptide signal rather than any delivery of collagen to skin.',
    laymanHowItWorks:
      'Collagen in a tub is animal connective tissue that has been boiled and then cut up by enzymes into short fragments. Swallowed, it meets the same digestion as steak: acid and proteases break it down to individual amino acids and very short peptides, and it is those that cross into the blood. Your body then builds its own collagen from scratch, using whichever amino acids happen to be available, in a process that needs vitamin C and does not care where the raw material came from. The only part of the story that is unusual is that a few two-and-three-letter fragments containing hydroxyproline survive intact, and there is a real hypothesis that these act as a chemical message rather than as material.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 42,
    anatomicalSite:
      'Dermal fibroblasts and articular chondrocytes, where any signalling effect would act; digestion and absorption in the small intestine',
    substitutes: {
      summary:
        'For building collagen, the rate-limiting inputs are total protein and vitamin C, not dietary collagen. For skin appearance, topical retinoids and sun protection have vastly larger and better-replicated effects than anything in this category.',
      conventionalRx: [
        {
          name: 'Topical tretinoin and other retinoids',
          class: 'Prescription dermatological agent',
          howItCompares:
            'Retinoids act directly on the fibroblast, increasing procollagen I expression in skin that can be biopsied to show it. Their photoageing evidence base is decades old, replicated, and measured on the tissue itself rather than on a hydration probe.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: mechanism demonstrated in human skin biopsies, not inferred from a serum marker. Cons: irritation, photosensitivity, and prescription-only in most jurisdictions.',
        },
      ],
      naturalFoods: [
        {
          name: 'Any complete protein plus adequate vitamin C',
          activeCompound: 'Glycine, proline and lysine, with ascorbate as the hydroxylase cofactor',
          biologicalMechanism:
            'Collagen synthesis needs glycine at every third residue, proline and lysine for the hydroxylation steps, and ascorbate to keep prolyl and lysyl hydroxylase iron in the ferrous state. All three amino acids are abundant in ordinary dietary protein, and the enzyme cofactor is the input whose absence actually stops the process — which is what scurvy is.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: Shaw et al. used 5 or 15 g of vitamin-C-enriched gelatin one hour before exercise.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Gelatin, which is the same material one processing step earlier',
          activeCompound: 'Denatured collagen, not yet enzymatically hydrolysed',
          biologicalMechanism:
            'Gelatin is collagen that has been heat-denatured; hydrolysed collagen peptides are gelatin cut further by proteases. The difference is solubility in cold liquid and speed of digestion, not amino acid content. The tendon and ligament literature, including Shaw\'s work, used gelatin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask who funded the skin trial',
          action:
            'Check the affiliations on any collagen paper. The two entities that appear most often across the positive literature are a collagen manufacturer and a research institute closely tied to one.',
          patientImpact:
            'The paper establishing that collagen peptides can be fitted into the diet while maintaining amino acid balance was written by authors at the Collagen Research Institute GmbH and GELITA AG. The 12-month bone mineral density trial in postmenopausal women was co-authored at the same institute.',
          clinicalPrecaution:
            'That does not make the results false. It does mean the independent replication question is the one to ask first, and for most endpoints in this category it has not been answered.',
        },
        {
          name: 'Do not count collagen toward a protein target',
          action:
            'Collagen protein lacks tryptophan entirely, which by the PDCAAS method makes it an incomplete protein source.',
          patientImpact:
            'A person substituting collagen for whey or meat in a daily protein total is swapping a complete protein for one that cannot support protein synthesis on its own.',
          clinicalPrecaution:
            'The industry\'s own calculation put the ceiling at 36% of daily protein as collagen before indispensable amino acid requirements start to fail.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@H](CN[C@@H]1C(=O)O)O',
      chemicalFormula: 'C5H9NO3',
      molecularWeight:
        '131.13 g/mol. This is trans-4-hydroxy-L-proline, not collagen. Collagen peptides are a heterogeneous hydrolysate with no single molecule to draw. Hydroxyproline is the marker the literature tracks, because it occurs almost nowhere else in the diet and because the peptides that survive digestion intact — Pro-Hyp above all — are defined by containing it.',
      structureSource: {
        label: 'PubChem CID 5810 — trans-4-Hydroxy-L-proline, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5810',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'col-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Species identification, molecular weight distribution and heavy metal panel',
          description:
            'A collagen hydrolysate is defined by its source species and its peptide size distribution, and neither is visible on a label that says only "collagen peptides". Bovine, porcine and marine hydrolysates differ in amino acid profile and in allergen and religious-dietary implications, and mislabelling has been documented. Molecular weight distribution determines how much is free amino acid and how much is intact dipeptide, which is the entire pharmacological question.',
          reagentsAndBuffer:
            'Species-specific mitochondrial DNA PCR for bovine, porcine, piscine and equine markers; size-exclusion chromatography with peptide molecular weight standards from 200 Da to 20 kDa; amino acid analysis confirming hydroxyproline content and the absence of tryptophan; ICP-MS for arsenic, cadmium, mercury and lead',
        },
        {
          id: 'col-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Synthesis of the Pro-Hyp and Gly-Pro-Hyp reference peptides',
          description:
            'The whole mechanistic claim rests on identified dipeptides and tripeptides appearing in blood. Those cannot be quantified without pure synthetic standards, and hydroxyproline-containing peptides are not commercially routine. This is the step that converts a hypothesis about signalling into a measurable plasma concentration.',
          dependsOnStepId: 'col-w1',
          reagentsAndBuffer:
            'Fmoc solid-phase peptide synthesis of Pro-Hyp, Gly-Pro-Hyp, Ala-Hyp and Leu-Hyp; Fmoc-Hyp(tBu)-OH building block; trifluoroacetic acid cleavage; preparative reversed-phase HPLC purification; stable-isotope-labelled Pro-Hyp as the internal standard',
        },
        {
          id: 'col-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Plasma extraction that separates peptide-bound from free hydroxyproline',
          description:
            'Total plasma hydroxyproline is a meaningless number here, because most of it is free amino acid released by digestion and by ordinary bone turnover. Only the peptide-bound fraction speaks to the survival hypothesis. Iwai et al. found negligible peptide-form hydroxyproline before ingestion, which is the control that makes the post-ingestion signal interpretable.',
          dependsOnStepId: 'col-w2',
          reagentsAndBuffer:
            'Immediate plasma separation with protease inhibitor cocktail; ultrafiltration through a 3 kDa cut-off membrane; solid-phase extraction on a porous graphitic carbon cartridge; parallel acid-hydrolysed aliquot for total hydroxyproline; LC-MS/MS in multiple reaction monitoring mode',
        },
        {
          id: 'col-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Fibroblast and chondrocyte response to Pro-Hyp at achieved plasma concentrations',
          description:
            'Test the signalling hypothesis at the concentrations actually reached in blood, which Iwai measured at 20 to 60 nanomoles per millilitre of peptide-form hydroxyproline. Almost every positive in vitro collagen-peptide experiment has used far higher concentrations, and an effect at a concentration no human achieves is not a mechanism.',
          dependsOnStepId: 'col-w3',
          reagentsAndBuffer:
            'Primary human dermal fibroblasts and articular chondrocytes; synthetic Pro-Hyp at 1 to 100 micromolar spanning the measured plasma range; free proline and free hydroxyproline at matched concentrations as the specificity controls; qPCR for COL1A1, COL1A2 and HAS2; P1NP in conditioned medium; engineered ligament constructs for a mechanical readout',
        },
        {
          id: 'col-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Instrument skin measurement with an independent-funding declaration',
          description:
            'Report cutometer elasticity, corneometer hydration and profilometric wrinkle depth against a placebo, blinded, with the funding source stated at the top rather than in a footnote. The pooled skin literature is 19 trials in 1,125 participants of whom 95% were women, and the concentration of manufacturer involvement across it is the single most important thing a reader needs to know.',
          dependsOnStepId: 'col-w4',
          reagentsAndBuffer:
            'Corneometer capacitance hydration measurement in a humidity- and temperature-controlled room; cutometer suction elasticity; PRIMOS or silicone-replica profilometry for wrinkle depth; identical-tasting placebo; prespecified registration and an explicit funding and conflict declaration',
        },
      ],
    },
    keyAudits: [
      {
        id: 'col-a1',
        category: 'inferred',
        title: 'The industry\'s own paper: collagen has no tryptophan and is an incomplete protein',
        laymanSummary:
          'A paper written by authors at a collagen manufacturer and a collagen research institute states plainly that collagen protein lacks an essential amino acid and is therefore incomplete.',
        technicalDetails:
          'Paul, Leser and Oesser — affiliated with the Collagen Research Institute GmbH in Kiel and GELITA AG, a collagen manufacturer — wrote that "according to the current protein quality evaluation method PDCAAS, collagen protein lacks one indispensable amino acid (tryptophan) and is therefore categorized as an incomplete protein source" and that it "displays a low indispensable amino acid profile." Their iterative PDCAAS calculation concluded that up to 36% of daily dietary protein could be replaced by collagen peptides while still meeting indispensable amino acid requirements, and that the effective doses in the literature, 2.5 to 15 g per day, fall below that ceiling. Read carefully, this is a paper establishing an upper safe substitution limit, published by the people who sell the product, and it concedes the central nutritional fact: collagen is a poor protein. Any consumer counting a collagen scoop toward a daily protein target is substituting an incomplete protein for a complete one.',
        evidenceSource: 'Paul C, Leser S, Oesser S. Nutrients 2019;11:1079',
        doi: '10.3390/nu11051079',
        inferredClaim:
          'That collagen peptides are a protein supplement comparable to whey or dairy protein, when the manufacturer-authored analysis classifies them as an incomplete protein source',
        auditFlag: 'verified',
      },
      {
        id: 'col-a2',
        category: 'measured',
        title: 'Pro-Hyp really does survive digestion and reach the blood',
        laymanSummary:
          'The one part of the collagen story that holds up mechanically: specific two- and three-amino-acid fragments containing hydroxyproline appear intact in human blood after a dose, peaking at one to two hours.',
        technicalDetails:
          'Iwai and colleagues had healthy volunteers ingest 9.4 to 23 g of gelatin hydrolysate from porcine skin, chicken feet or cartilage after a 12-hour fast. Peptide-form hydroxyproline was negligible in blood before ingestion, rose significantly afterward to a maximum of 20 to 60 nanomoles per millilitre of plasma at one to two hours, and fell to half that by four hours. The major constituent identified in serum and plasma was Pro-Hyp, with smaller but significant amounts of Ala-Hyp, Ala-Hyp-Gly, Pro-Hyp-Gly, Leu-Hyp, Ile-Hyp and Phe-Hyp. This is a real, cleanly measured pharmacokinetic finding and it is the only credible foundation for any collagen mechanism. What it demonstrates is that small peptides survive, not that collagen is delivered. The step from "Pro-Hyp is in the blood at 20 to 60 nmol/mL" to "therefore skin collagen increases" is not measured anywhere in this literature.',
        evidenceSource: 'Iwai K et al. J Agric Food Chem 2005;53:6531-6536',
        doi: '10.1021/jf050206p',
        measuredMetric:
          'Plasma concentration of peptide-form hydroxyproline and identity of the surviving peptides after gelatin hydrolysate ingestion',
        auditFlag: 'verified',
      },
      {
        id: 'col-a3',
        category: 'measured',
        title: 'Nineteen skin trials, 1,125 people, favourable — and 95% were women',
        laymanSummary:
          'Pooling nineteen randomised double-blind trials, collagen supplementation improved skin hydration, elasticity and wrinkles compared with placebo. Almost every participant was a woman.',
        technicalDetails:
          'De Miranda and colleagues searched Medline, Embase, Cochrane, LILACS and the Journal of Negative Results in BioMedicine, restricting inclusion to randomised, double-blind, controlled trials of oral hydrolysed collagen reporting skin wrinkles, hydration, elasticity or firmness. Nineteen studies with 1,125 participants aged 20 to 70 were included, of whom 95% were women. Grouped analysis showed favourable results for hydrolysed collagen against placebo on skin hydration, elasticity and wrinkles, and the hydration and elasticity findings were confirmed in subgroup meta-analysis. That is a genuinely positive pooled result and this page records it as such. Three qualifications belong beside it: the outcomes are instrument-measured surrogates rather than clinical endpoints, the trials are short relative to skin ageing, and the collagen trial literature is unusually concentrated among manufacturer-affiliated investigators, which the pooled analysis does not correct for.',
        evidenceSource: 'de Miranda RB, Weimer P, Rossi RC. Int J Dermatol 2021;60:1449-1461',
        doi: '10.1111/ijd.15518',
        measuredMetric:
          'Instrument-measured skin hydration, elasticity and wrinkle outcomes versus placebo across 19 randomised trials',
        auditFlag: 'caution',
      },
      {
        id: 'col-a4',
        category: 'inferred',
        title: 'The tendon result is eight men, and the tissue tested was engineered in a dish',
        laymanSummary:
          'The most-cited study behind "collagen for tendons" had eight subjects. The strengthening was measured not in their tendons but in laboratory-grown ligaments soaked in their blood serum.',
        technicalDetails:
          'Shaw and colleagues ran a randomised, double-blinded crossover in eight healthy male subjects consuming 5 g or 15 g of vitamin-C-enriched gelatin or placebo, three times daily with at least six hours between exercise bouts, over three days, each dose followed an hour later by six minutes of rope-skipping. Circulating glycine, proline, hydroxyproline and hydroxylysine all rose, peaking one hour after the supplement. Serum drawn before and one hour after gelatin was then used to treat engineered ligaments in culture, and amino-terminal propeptide of collagen I was measured in blood at 4, 24, 48 and 72 hours after the first exercise bout. The design is elegant and the finding is interesting. It is also eight men, a three-day exposure, a surrogate blood marker of collagen synthesis, and a mechanical measurement performed on tissue constructs rather than on any human tendon. The gap between that and "collagen strengthens your tendons" is the whole of this audit.',
        evidenceSource: 'Shaw G, Lee-Barthel A, Ross ML, Wang B, Baar K. Am J Clin Nutr 2017;105:136-143',
        doi: '10.3945/ajcn.116.138594',
        measuredMetric:
          'Plasma amino acid response, serum P1NP, and mechanical properties of engineered ligaments treated with subject serum',
        inferredClaim:
          'That an increase in a circulating collagen-synthesis marker and a change in engineered tissue mechanics demonstrates strengthening of human tendon or ligament',
        auditFlag: 'caution',
      },
      {
        id: 'col-a5',
        category: 'inferred',
        title: 'The bone trial moved a T-score by one tenth, and was co-authored at the manufacturer\'s institute',
        laymanSummary:
          'A twelve-month trial in postmenopausal women reported a statistically significant increase in bone density on collagen peptides. The size of the change was about a tenth of a T-score point.',
        technicalDetails:
          'Konig and colleagues randomised 131 postmenopausal women with age-related reduction in bone mineral density to 5 g of specific collagen peptides or placebo daily for 12 months; 102 completed and all were included in the intention-to-treat analysis (mean age 64.3 +/- 7.2 years, spine T-score -2.4 +/- 0.6, femoral neck T-score -1.4 +/- 0.5). Spine T-score changed by +0.1 +/- 0.26 on collagen peptides against -0.03 +/- 0.18 on control (ANCOVA P = 0.030) and femoral neck by +0.09 +/- 0.24 against -0.01 +/- 0.19 (P = 0.003). P1NP rose significantly in the treated group (P = 0.007). The statistics are real and the effect is at the edge of what densitometry resolves: the standard deviations exceed the mean changes, and a tenth of a T-score is well inside the precision error of most DXA scanners for repeat measurement. The corresponding author is affiliated with the Collagen Research Institute GmbH, and this is the single trial on which the bone claim rests.',
        evidenceSource: 'Konig D, Oesser S, Scharla S, Zdzieblik D, Gollhofer A. Nutrients 2018;10:97',
        doi: '10.3390/nu10010097',
        measuredMetric:
          'Change in spine and femoral neck bone mineral density T-score and in P1NP over 12 months',
        inferredClaim:
          'That a 0.1 T-score change, from a single manufacturer-affiliated trial, establishes collagen peptides as a bone density intervention',
        auditFlag: 'caution',
      },
      {
        id: 'col-a6',
        category: 'failed',
        title: 'The joint-pain trial lost a third of its subjects before analysis',
        laymanSummary:
          'A widely cited 24-week study of collagen for joint pain in athletes recruited 147 people. Only 97 could be statistically evaluated.',
        technicalDetails:
          'Clark and colleagues at Penn State ran a prospective, randomised, placebo-controlled, double-blind study in 147 varsity and club-sport athletes with activity-related joint pain and no evidence of joint disease, comparing 25 mL of a liquid containing 10 g of collagen hydrolysate against a xanthan-containing placebo over 24 weeks, with visual analogue scales as the primary efficacy parameter. Data from only 97 of the 147 subjects could be statistically evaluated. Losing a third of a randomised sample before analysis breaks the protection randomisation provides, because the people who drop out of a study of joint pain are not a random subset of people with joint pain. A visual analogue pain score is also the outcome most responsive to expectation, in a population that knew it was in a supplement trial. The trial is cited throughout the category as establishing a joint benefit; what it establishes is that a large attrition-affected trial reported a subjective improvement.',
        evidenceSource: 'Clark KL et al. Curr Med Res Opin 2008;24:1485-1496',
        doi: '10.1185/030079908X291967',
        measuredMetric:
          'Change in visual analogue scale scores for joint pain, mobility and inflammation over 24 weeks',
        auditFlag: 'caution',
      },
      {
        id: 'col-a7',
        category: 'conclusion_shift',
        title: 'The mechanism moved from building block to signal, and the marketing did not',
        laymanSummary:
          'The original idea was that eating collagen supplies collagen to skin. That is not what happens. The surviving scientific hypothesis is that small fragments act as chemical messages, which is a different claim with far less support.',
        technicalDetails:
          'Two facts closed the building-block account. First, dietary protein of any kind is hydrolysed to free amino acids and small peptides before absorption, and collagen has no exemption; the amino acids released enter the general pool and are used for whatever the body is synthesising. Second, collagen is a poor source of those amino acids in the first place, lacking tryptophan entirely, as the manufacturer-affiliated PDCAAS analysis states. What replaced it is the signalling hypothesis: Iwai\'s measured Pro-Hyp in plasma at 20 to 60 nmol/mL, acting as a ligand or a chemotactic signal to fibroblasts and chondrocytes rather than as material. That hypothesis is legitimate, is being actively tested, and is a much weaker claim than the one on the packaging. It also predicts something the marketing does not: if the active entity is a specific dipeptide, then hydrolysate composition and molecular weight distribution matter enormously and products are not interchangeable.',
        evidenceSource:
          'Iwai K et al. J Agric Food Chem 2005;53:6531-6536; Paul C, Leser S, Oesser S. Nutrients 2019;11:1079',
        doi: '10.3390/nu11051079',
        inferredClaim:
          'That eating collagen supplies collagen to skin, joints or bone, which digestion rules out',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It is digested exactly like any other protein',
        laymanDesc:
          'Stomach acid and gut enzymes take the collagen fragments apart. Nothing about being collagen protects it from this, and nothing about it addresses it to skin.',
        molecularDetail:
          'Pepsin, trypsin, chymotrypsin and brush-border peptidases reduce collagen hydrolysate to free amino acids and di- and tripeptides, which cross the enterocyte through PepT1 and amino acid transporters into the portal circulation. There is no tissue-addressing mechanism at any point. The released amino acids join the free pool and are used according to whatever the body is synthesising.',
        iconName: 'Scissors',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A few hydroxyproline fragments survive intact',
        laymanDesc:
          'One small class of fragments does get through whole. Pro-Hyp is the main one, and it appears in blood within an hour of a dose.',
        molecularDetail:
          'Iwai et al. measured peptide-form hydroxyproline rising from negligible to 20 to 60 nmol/mL of plasma at one to two hours, falling to half by four hours, with Pro-Hyp the dominant species and Ala-Hyp, Ala-Hyp-Gly, Pro-Hyp-Gly, Leu-Hyp, Ile-Hyp and Phe-Hyp also detected. The bond adjacent to hydroxyproline is relatively resistant to prolidase, which is the accepted explanation for the survival.',
        iconName: 'ShieldCheck',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The proposed action is a message, not a material',
        laymanDesc:
          'The live hypothesis is that these fragments act as a signal to the cells that build collagen, telling them to get to work, rather than being used as bricks.',
        molecularDetail:
          'Pro-Hyp has been reported to act on dermal fibroblasts and chondrocytes as a chemotactic and proliferative stimulus. The critical unresolved question is concentration: the plasma level achieved is 20 to 60 nmol/mL peptide-form hydroxyproline, and much of the supportive in vitro work has used concentrations well above that. An effect at a concentration humans do not reach is not a mechanism.',
        iconName: 'MessageSquare',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The fibroblast builds collagen from scratch, needing vitamin C',
        laymanDesc:
          'Whatever the signal, the actual construction uses ordinary amino acids and cannot proceed without vitamin C, which is what the hydroxylating enzymes require.',
        molecularDetail:
          'Procollagen chains are assembled from glycine, proline and lysine, then hydroxylated at proline and lysine residues by Fe(II)- and 2-oxoglutarate-dependent dioxygenases that require ascorbate to maintain the active-site iron. This is why Shaw et al. supplemented gelatin with vitamin C rather than alone, and why the deficiency that stops collagen synthesis is a vitamin C deficiency, not a collagen deficiency.',
        iconName: 'Hammer',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measured outcomes are surrogates',
        laymanDesc:
          'What the positive trials measure is skin hydration and elasticity by probe, a blood marker of collagen turnover, and pain scores — not the collagen content of anyone\'s skin.',
        molecularDetail:
          'The pooled skin analysis of 19 trials in 1,125 participants used corneometer hydration, cutometer elasticity and wrinkle measurement. Shaw used serum P1NP and engineered ligament mechanics. Konig used DXA T-score changes of about 0.1. No trial in this literature has biopsied human skin and shown increased collagen content after oral collagen.',
        iconName: 'Ruler',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'de Miranda 2021 meta-analysis of hydrolysed collagen and skin ageing',
        phase: 'Systematic review and meta-analysis of 19 randomised double-blind controlled trials',
        sampleSize: 1125,
        primaryEndpoint: 'Skin hydration, elasticity, firmness and wrinkles versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Favourable grouped results for hydration, elasticity and wrinkles; hydration and elasticity confirmed in subgroup meta-analysis',
        unreportedAdverseSignals:
          'Ninety-five percent of participants were women, so the result is effectively untested in men. Outcomes are instrument-measured surrogates over short durations, and manufacturer affiliation is not corrected for in the pooling.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Iwai 2005 — food-derived collagen peptides in human blood',
        phase: 'Human pharmacokinetic study',
        sampleSize: 5,
        primaryEndpoint:
          'Plasma peptide-form hydroxyproline and identity of surviving peptides after gelatin hydrolysate ingestion',
        endpointMet: true,
        statisticalPValue:
          'Peptide-form hydroxyproline rose significantly to 20-60 nmol/mL at 1-2 h from negligible baseline',
        unreportedAdverseSignals:
          'A small pharmacokinetic study with no clinical endpoint. It establishes that peptides survive, not that they do anything after they do.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Shaw 2017 — vitamin C-enriched gelatin and collagen synthesis',
        phase: 'Randomised double-blinded crossover with an in vitro tissue arm',
        sampleSize: 8,
        primaryEndpoint:
          'Circulating amino acids, serum P1NP, and mechanics of engineered ligaments treated with subject serum',
        endpointMet: true,
        statisticalPValue:
          'Circulating glycine, proline, hydroxyproline and hydroxylysine rose, peaking 1 h after supplementation',
        unreportedAdverseSignals:
          'Eight healthy men, three days of exposure, and the mechanical outcome measured on engineered constructs rather than human tendon. No human tendon or ligament was tested.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Konig 2018 — specific collagen peptides and bone mineral density',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 131,
        primaryEndpoint: 'Change in spine and femoral neck bone mineral density T-score at 12 months',
        endpointMet: true,
        statisticalPValue:
          'Spine T-score +0.1 +/- 0.26 versus -0.03 +/- 0.18 (ANCOVA P = 0.030); femoral neck +0.09 +/- 0.24 versus -0.01 +/- 0.19 (P = 0.003)',
        unreportedAdverseSignals:
          'Standard deviations exceed the mean changes, and a 0.1 T-score shift sits within the repeat-measurement precision error of most DXA systems. The corresponding author is affiliated with the Collagen Research Institute GmbH.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Clark 2008 — collagen hydrolysate for activity-related joint pain in athletes',
        phase: 'Prospective randomised placebo-controlled double-blind',
        sampleSize: 147,
        primaryEndpoint: 'Change in visual analogue scale for joint pain over 24 weeks',
        endpointMet: true,
        statisticalPValue:
          'Reported improvement in visual analogue parameters; only 97 of 147 randomised subjects could be statistically evaluated',
        unreportedAdverseSignals:
          'A third of the randomised sample was lost before analysis, which removes the protection randomisation provides. The primary outcome is a subjective pain scale in a population aware it was in a supplement trial.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Pro-Hyp and related hydroxyproline dipeptides survive digestion and reach plasma at 20 to 60 nmol/mL, peaking at one to two hours',
        'Pooled across 19 randomised double-blind trials in 1,125 people, instrument-measured skin hydration, elasticity and wrinkles improved versus placebo',
        'Vitamin-C-enriched gelatin raised circulating glycine, proline, hydroxyproline and hydroxylysine within one hour in eight men',
        'Collagen protein lacks tryptophan and is classified as an incomplete protein source by PDCAAS, per a manufacturer-affiliated analysis',
      ],
      unsupportedInferences: [
        'That swallowed collagen is delivered to skin, joints or bone as collagen — digestion rules this out',
        'That an increase in a serum collagen-synthesis marker demonstrates stronger tendon in a person',
        'That a 0.1 T-score change in one manufacturer-affiliated trial establishes a bone density intervention',
        'That collagen can substitute for complete protein in a daily total',
      ],
      whatFailedInitially: [
        'The building-block account of how collagen supplements work, which digestion and the amino acid profile both refute',
        'The Clark joint-pain trial\'s randomisation, which did not survive losing a third of its subjects before analysis',
      ],
      realWorldOutcome: [
        'The pooled skin evidence is positive and this page records that plainly, with its surrogate endpoints and funding concentration stated',
        'No trial in this literature has biopsied human skin and shown increased collagen content after oral collagen',
        'The live mechanism is a dipeptide signal, which if true means products differing in molecular weight distribution are not interchangeable',
      ],
    },
    deliverySystem: {
      type: 'Oral powder, capsule or liquid; bovine, porcine or marine hydrolysate',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. Species of origin is a real variable — it changes the amino acid profile, the allergen profile and the religious-dietary status — and is often absent from the label. Molecular weight distribution decides how much of a product is free amino acid and how much is the intact dipeptide the mechanism depends on, and is essentially never disclosed. Branded ingredients such as Verisol and Fortigel are specific hydrolysates whose trial evidence does not transfer to unbranded hydrolysate.',
      safetyProfile:
        'Generally well tolerated, with mild gastrointestinal complaints and an unpleasant taste the commonest reports. Marine collagen carries genuine fish allergen risk. As an animal by-product it is not vegetarian regardless of how the tub is styled. The substantive risk is nutritional rather than toxicological: collagen lacks tryptophan, so replacing complete protein with it degrades dietary protein quality, and the industry\'s own analysis puts the substitution ceiling at 36% of daily protein. Independent testing of protein powders as a category has repeatedly found arsenic, cadmium, mercury and lead.',
    },
    commonQuestions: [
      {
        q: 'Does eating collagen put collagen in my skin?',
        a: 'No. Collagen is a protein and is digested like every other protein: broken into free amino acids and very short peptides that enter the general amino acid pool with no address on them. Your body then makes its own collagen from scratch, using vitamin C as the essential cofactor. The claim that survives the digestion problem is a different and much narrower one — that certain small fragments act as a signal to the cells that build collagen.',
        auditNote:
          'That signalling hypothesis is legitimate and unproven, and it is not what the packaging says.',
      },
      {
        q: 'Then why do the skin trials come out positive?',
        a: 'They do, and this page records that plainly: nineteen randomised double-blind trials in 1,125 people, pooled, showed favourable hydration, elasticity and wrinkle results against placebo. What to hold alongside it is that these are instrument-measured surrogates rather than clinical outcomes, the trials are short compared with the process they claim to address, 95 percent of participants were women, and the field is unusually concentrated among investigators affiliated with collagen manufacturers. No trial has biopsied skin and shown more collagen in it.',
      },
      {
        q: 'Can I count collagen toward my daily protein?',
        a: 'Only partly, and the source for that is the collagen industry. A paper written by authors at GELITA AG and the Collagen Research Institute states that collagen protein lacks tryptophan and is therefore an incomplete protein source with a low indispensable amino acid profile. Their own calculation put the ceiling at about 36 percent of daily protein before amino acid requirements start to fail. Swapping a whey or meat serving for a collagen scoop is a downgrade in protein quality.',
      },
      {
        q: 'What about collagen for tendons and joints?',
        a: 'The tendon evidence is one crossover study in eight men over three days, in which the strengthening was measured on laboratory-grown ligament constructs bathed in the subjects\' serum, not on their tendons. The joint evidence is a 24-week trial in athletes that randomised 147 people and could only evaluate 97, with a subjective pain scale as the primary outcome. Both are interesting. Neither supports the confidence with which the claim is made.',
      },
      {
        q: 'Is one collagen product the same as another?',
        a: 'On the surviving mechanism, no — and this is the awkward implication nobody in the category emphasises. If the active entity is a specific dipeptide surviving digestion, then how a hydrolysate was cut, what its molecular weight distribution is, and which species it came from all matter directly. Those are the three things almost never printed on a label. The branded ingredients used in trials are specific hydrolysates, and their evidence does not transfer to a generic tub.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Iwai K et al. Identification of food-derived collagen peptides in human blood after oral ingestion of gelatin hydrolysates. J Agric Food Chem 2005;53:6531-6536',
        identifier: '10.1021/jf050206p',
        kind: 'doi',
      },
      {
        label:
          'Clark KL et al. 24-week study on the use of collagen hydrolysate as a dietary supplement in athletes with activity-related joint pain. Curr Med Res Opin 2008;24:1485-1496',
        identifier: '10.1185/030079908X291967',
        kind: 'doi',
      },
      {
        label:
          'Shaw G, Lee-Barthel A, Ross ML, Wang B, Baar K. Vitamin C-enriched gelatin supplementation before intermittent activity augments collagen synthesis. Am J Clin Nutr 2017;105:136-143',
        identifier: '10.3945/ajcn.116.138594',
        kind: 'doi',
      },
      {
        label:
          'Konig D, Oesser S, Scharla S, Zdzieblik D, Gollhofer A. Specific collagen peptides improve bone mineral density and bone markers in postmenopausal women — a randomized controlled study. Nutrients 2018;10:97',
        identifier: '10.3390/nu10010097',
        kind: 'doi',
      },
      {
        label:
          'Paul C, Leser S, Oesser S. Significant amounts of functional collagen peptides can be incorporated in the diet while maintaining indispensable amino acid balance. Nutrients 2019;11:1079',
        identifier: '10.3390/nu11051079',
        kind: 'doi',
      },
      {
        label:
          'de Miranda RB, Weimer P, Rossi RC. Effects of hydrolyzed collagen supplementation on skin aging: a systematic review and meta-analysis. Int J Dermatol 2021;60:1449-1461',
        identifier: '10.1111/ijd.15518',
        kind: 'doi',
      },
      {
        label:
          'PubChem CID 5810 — trans-4-Hydroxy-L-proline, the marker residue tracked in the collagen literature',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5810',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Psyllium husk — one of the few supplements with an authorised FDA health claim written into
  // the Code of Federal Regulations, a measured LDL reduction, and a conflict worth naming: much
  // of the pooled evidence was assembled by scientists at the company that sells Metamucil.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'psyllium-husk',
    name: 'Psyllium husk',
    tradeName: 'Sold as ispaghula husk; the dominant branded product is Metamucil',
    sponsor:
      'No single sponsor — the milled seed coat of Plantago ovata, grown mainly in India. Procter & Gamble holds the largest branded position and has generated a substantial share of the clinical literature.',
    targetGene: 'CYP7A1',
    targetProtein:
      'Cholesterol 7-alpha-hydroxylase (CYP7A1), the rate-limiting enzyme of bile acid synthesis. Psyllium has no molecular target in the usual sense: it is a physical intervention. By trapping bile acids in a gel and carrying them out in stool, it forces hepatic bile acid synthesis, which consumes cholesterol and upregulates LDL receptors.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a bulk-forming laxative and a cholesterol-lowering fibre. Uniquely in this file, the FDA has authorised a health claim for it: 21 CFR 101.81 permits foods supplying 7 g or more per day of soluble fibre from psyllium seed husk to claim, within a low-saturated-fat diet, a reduced risk of coronary heart disease. It is also an OTC monograph bulk laxative.',
    patientFriendlyIndication:
      'Taken for constipation and regularity, and to lower cholesterol',
    conditionContext: {
      conditionExplainer:
        'Fibre is not one thing. What matters clinically is whether a fibre forms a viscous gel in the small intestine and whether bacteria in the colon ferment it. Psyllium is unusual on both counts: it is highly gel-forming and it is almost entirely unfermented, so the gel it makes survives all the way through and is still holding water when it arrives.',
      whyItMatters:
        'This is one of the very few entries in this file where a regulator examined the evidence and wrote a permitted claim into federal regulation. The effects are physical, measurable, and dose-defined. The audit here is not whether it works but who generated the evidence, and how much of the fibre aisle borrows psyllium\'s credibility for fibres that behave completely differently.',
      whoTakesThis:
        'People with chronic constipation, people with irritable bowel syndrome, people with raised LDL cholesterol who want a non-drug option, people with type 2 diabetes, and a large number of people simply trying to eat more fibre.',
      clinicalGoals:
        'Trials measured LDL and non-HDL cholesterol and apolipoprotein B in mmol/L, stool water content and total stool output in grams, bowel movements per week, fasting blood glucose and HbA1c, and the proportion of IBS patients remaining symptomatic.',
    },
    oneSentenceVerdict:
      'Psyllium lowers LDL cholesterol by about 0.33 mmol/L across 28 randomised trials, softens stool and increases output more than docusate did head-to-head, and holds an authorised FDA heart-disease health claim at 7 g/day of soluble fibre — with the caveats that much of the pooled evidence was assembled by scientists at the company selling the leading brand, and that its glycaemic effect is zero in people whose glucose is already normal.',
    laymanHowItWorks:
      'Psyllium husk is a seed coat that absorbs many times its weight in water and turns into a thick gel. That gel does three physical things. In the small intestine it traps bile acids, which the body normally recycles, so they leave in the stool and the liver has to make more — and making bile acids consumes cholesterol, which is why LDL falls. The gel also slows how quickly sugar from a meal reaches the bloodstream. And because psyllium is barely eaten by gut bacteria, the gel is still intact in the colon, where its trapped water softens hard stool and firms loose stool. No receptor, no enzyme, no absorption into the body at all.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 79,
    anatomicalSite:
      'Lumen of the small intestine, where the gel forms and binds bile acids, and the colon, where the retained water changes stool form. It is not absorbed.',
    substitutes: {
      summary:
        'For LDL, statins reduce it several times more than psyllium and have hard outcome trials behind them; psyllium is an adjunct, and the FDA claim is written that way. For constipation, psyllium beat docusate sodium head-to-head. For fibre in general, the important comparison is with the fibres that do not do these things.',
      conventionalRx: [
        {
          name: 'Statins',
          class: 'HMG-CoA reductase inhibitors',
          howItCompares:
            'Statins reduce LDL by a far larger margin and are supported by cardiovascular outcome trials with hard endpoints. Psyllium\'s pooled LDL reduction is 0.33 mmol/L, and its authorised claim is explicitly conditional on a diet low in saturated fat and cholesterol.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros of psyllium: no systemic absorption and a genuine additive effect on top of diet. Cons: the effect size is a fraction of a drug\'s, and no trial has tested psyllium against a cardiovascular endpoint.',
        },
        {
          name: 'Docusate sodium, the head-to-head comparator',
          class: 'Stool softener, OTC',
          howItCompares:
            'Directly compared in 170 patients with chronic idiopathic constipation. Psyllium increased stool water content by 2.33% against docusate\'s 0.01% (P = 0.007), stool water weight 84.0 against 71.4 g per bowel movement (P = 0.04), total weekly stool output 359.9 against 271.9 g (P = 0.005), and bowel movements 3.5 against 2.9 per week in week two (P = 0.02).',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: this is a rare case of a supplement beating an over-the-counter drug in a randomised double-blind head-to-head. Cons: docusate is itself weakly evidenced, so the comparator was not a high bar.',
        },
      ],
      naturalFoods: [
        {
          name: 'Oats and barley, the other regulated gel-forming fibre',
          activeCompound: 'Beta-glucan',
          biologicalMechanism:
            'Beta-glucan forms a viscous gel by the same physics and appears in the same federal regulation: 21 CFR 101.81 authorises the heart disease claim at 3 g or more per day of beta-glucan from whole oats or barley, alongside 7 g or more per day of psyllium soluble fibre. Two fibres, one mechanism, one regulation.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. The regulation itself specifies the daily amounts associated with reduced coronary heart disease risk.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Wheat bran, as the fibre that does not do this',
          activeCompound: 'Insoluble, non-viscous, non-gelling fibre',
          biologicalMechanism:
            'Coarse insoluble particles produce a laxative effect by mechanically irritating the gut mucosa and stimulating water and mucus secretion — a completely different mechanism from a water-holding gel. In the IBS meta-analysis, bran showed no significant benefit (RR 0.90, 95% CI 0.79 to 1.03) while soluble fibre did.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not generalise psyllium results to "fibre"',
          action:
            'Check whether a fibre is viscous and gel-forming, and whether it is fermented. Those two properties decide almost everything.',
          patientImpact:
            'McRorie and McKeown state that high-viscosity gel-forming fibres such as beta-glucan, psyllium and raw guar gum lower cholesterol and improve glycaemic control, whereas non-viscous soluble fibres such as inulin, fructooligosaccharides and wheat dextrin do not.',
          clinicalPrecaution:
            'Marketing routinely transfers psyllium\'s regulated claims to fibres that share the word "soluble" and none of the physics.',
        },
        {
          name: 'Take it with enough liquid, for a regulated reason',
          action:
            'Psyllium swells on contact with water. The federal regulation authorising its health claim explicitly requires that the label and labelling of foods containing psyllium husk be consistent with 21 CFR 101.17(f), the warning provision for these products.',
          patientImpact:
            'Dry or incompletely hydrated psyllium can swell in the throat or oesophagus and obstruct it. This is the reason the labelling requirement exists.',
          clinicalPrecaution:
            'Psyllium also delays gastric emptying, so medicines taken at the same time may be absorbed more slowly. Anyone with a known bowel stricture or obstruction should not take a bulk-forming agent.',
        },
      ],
    },
    keyAudits: [
      {
        id: 'psy-a1',
        category: 'measured',
        title: 'A federal regulation authorises the claim, at a stated dose',
        laymanSummary:
          'Almost uniquely for a supplement, the FDA examined the evidence and wrote into federal regulation that psyllium at seven grams of soluble fibre a day can carry a heart disease claim.',
        technicalDetails:
          '21 CFR 101.81 governs health claims relating soluble fibre from certain foods to a reduced risk of coronary heart disease. It lists the daily dietary intakes of eligible soluble fibre sources associated with reduced risk: 3 g or more per day of beta-glucan soluble fibre from whole oats or barley, and 7 g or more per day of soluble fibre from psyllium seed husk. The regulation also states that "the label and labeling of foods containing psyllium husk shall be consistent with the provisions of § 101.17(f)," the warning provision covering these products, and requires all conditions of 21 CFR 101.14 to be met. Two features of the claim matter for any reader. First, it is conditional on a diet low in saturated fat and cholesterol — the claim is for an adjunct, not a standalone. Second, it is a risk-reduction claim built on the LDL surrogate; no randomised trial has tested psyllium against cardiovascular events.',
        evidenceSource:
          '21 CFR 101.81 — Health claims: soluble fiber from certain foods and risk of coronary heart disease',
        measuredMetric:
          'The daily intake of psyllium soluble fibre the FDA associates with reduced coronary heart disease risk',
        auditFlag: 'verified',
      },
      {
        id: 'psy-a2',
        category: 'measured',
        title: 'LDL down 0.33 mmol/L across 28 randomised trials',
        laymanSummary:
          'Pooling 28 randomised trials in 1,924 people, about ten grams of psyllium a day lowered LDL cholesterol, non-HDL cholesterol and apolipoprotein B.',
        technicalDetails:
          'Jovanovski and colleagues searched Medline, EMBASE, CINAHL and CENTRAL through October 2017 for randomised controlled trials of at least three weeks assessing psyllium and blood lipids, in people with or without hypercholesterolaemia. Twenty-eight trials with 1,924 participants were included. A median dose of about 10.2 g psyllium per day significantly reduced LDL cholesterol by 0.33 mmol/L (95% CI -0.38 to -0.27, P < 0.00001) and non-HDL cholesterol by 0.39 mmol/L (95% CI -0.50 to -0.27, P < 0.00001), with apolipoprotein B also reduced. The earlier Anderson meta-analysis of 8 controlled trials, in 384 psyllium and 272 cellulose-placebo subjects all taking 10.2 g/day for at least 8 weeks on top of at least 8 weeks of low-fat diet lead-in, found total cholesterol down 4% (P < 0.0001), LDL down 7% (P < 0.0001) and the apoB to apoA-I ratio down 6% (P < 0.05), with no effect on HDL or triglycerides. The two analyses, eighteen years apart, agree closely, which is more than can be said for most of this file.',
        evidenceSource:
          'Jovanovski E et al. Am J Clin Nutr 2018;108:922-932; Anderson JW et al. Am J Clin Nutr 2000;71:472-479',
        doi: '10.1093/ajcn/nqy115',
        measuredMetric:
          'Mean difference in LDL cholesterol, non-HDL cholesterol and apolipoprotein B versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'psy-a3',
        category: 'measured',
        title: 'It beat docusate sodium head-to-head on every objective stool measure',
        laymanSummary:
          'In 170 people with chronic constipation, psyllium outperformed a standard over-the-counter stool softener on stool water content, stool weight, total output and bowel movement frequency.',
        technicalDetails:
          'A multi-site, randomised, double-blind, parallel-design trial in 170 subjects with chronic idiopathic constipation ran a two-week placebo baseline then two weeks comparing psyllium 5.1 g twice daily plus docusate placebo against docusate sodium 100 mg twice daily plus psyllium placebo, with stools collected and assessed. Against baseline, psyllium increased stool water content by 2.33% versus 0.01% for docusate (P = 0.007), stool water weight to 84.0 against 71.4 g per bowel movement (P = 0.04), total stool output to 359.9 against 271.9 g per week (P = 0.005), and the O\'Brien rank-type composite score to 475.1 against 403.9 (P = 0.002). Bowel movement frequency was significantly greater on psyllium in treatment week two (3.5 versus 2.9 per week, P = 0.02) but not in week one (3.3 versus 3.1, P > 0.05). These are objective, collected, weighed measurements rather than symptom questionnaires, which is unusual and is what makes the result credible.',
        evidenceSource: 'McRorie JW et al. Aliment Pharmacol Ther 1998;12:491-497',
        doi: '10.1046/j.1365-2036.1998.00336.x',
        measuredMetric:
          'Stool water content and weight, total stool output, and bowel movements per week',
        auditFlag: 'verified',
      },
      {
        id: 'psy-a4',
        category: 'inferred',
        title: 'The glycaemic benefit is proportional to how bad the glucose control already is',
        laymanSummary:
          'Psyllium improved blood sugar substantially in people with type 2 diabetes, modestly in people at risk, and not at all in people whose glucose was already normal.',
        technicalDetails:
          'Gibb and colleagues identified 35 randomised controlled studies spanning three decades and three continents, assessed in 8 meta-analyses. In patients with type 2 diabetes, multi-week studies with psyllium dosed before meals showed fasting blood glucose down 37.0 mg/dL (P < 0.001) and HbA1c down 0.97 percentage points, or 10.6 mmol/mol (P = 0.048). The effect was proportional to baseline fasting glucose: no significant glucose lowering in euglycaemic subjects, modest improvement in pre-diabetes, greatest improvement in treated type 2 diabetes. That gradient is the finding, and it is the same repletion-shaped pattern that runs through this whole file — the intervention does most where the deficit is largest and nothing where there is no deficit. The conflict belongs on the record: the search covered "clinical records stored by Procter & Gamble", the manufacturer of the leading psyllium brand, alongside the published literature, and the authors are associated with that company. An HbA1c reduction of nearly a full percentage point is close to what some glucose-lowering drugs achieve, which makes the provenance of the pooled dataset something a reader should weigh.',
        evidenceSource: 'Gibb RD, McRorie JW, Russell DA, Hasselblad V, D\'Alessio DA. Am J Clin Nutr 2015;102:1604-1614',
        doi: '10.3945/ajcn.115.106989',
        measuredMetric: 'Change in fasting blood glucose and glycated haemoglobin, stratified by baseline glycaemic status',
        inferredClaim:
          'That psyllium is a general glycaemic-control supplement, when the effect is zero in people with normal glucose and the pooled dataset includes unpublished manufacturer records',
        auditFlag: 'contested',
      },
      {
        id: 'psy-a5',
        category: 'measured',
        title: 'IBS: soluble fibre worked, bran did not, and the difference is the point',
        laymanSummary:
          'Across fourteen randomised trials in irritable bowel syndrome, soluble fibre helped and wheat bran did not. Roughly one in seven people benefited from soluble fibre.',
        technicalDetails:
          'Moayyedi and colleagues searched MEDLINE, EMBASE and the Cochrane Controlled Trials Register to December 2013 for trials comparing fibre supplements against placebo, control therapy or usual management in adults with irritable bowel syndrome. Fourteen randomised trials in 906 patients were identified. Overall there was a significant benefit of fibre (relative risk of remaining symptomatic 0.86, 95% CI 0.80 to 0.94; number needed to treat 10, 95% CI 6 to 33), with no significant heterogeneity (I-squared 0%, Cochran Q 13.85 with 14 degrees of freedom, P = 0.46). The benefit was confined to soluble fibre (RR 0.83, 95% CI 0.73 to 0.94; NNT 7, 95% CI 4 to 25), with no effect from bran (RR 0.90, 95% CI 0.79 to 1.03). The authors found no evidence of harm from bran but also no benefit. The clean separation between two things both called fibre, in the same analysis, is the strongest single argument against treating fibre as a category.',
        evidenceSource: 'Moayyedi P et al. Am J Gastroenterol 2014;109:1367-1374',
        doi: '10.1038/ajg.2014.195',
        measuredMetric:
          'Relative risk of remaining symptomatic after fibre therapy, and number needed to treat',
        auditFlag: 'verified',
      },
      {
        id: 'psy-a6',
        category: 'conclusion_shift',
        title: 'The field stopped talking about soluble versus insoluble, and started talking about viscosity',
        laymanSummary:
          'Fibre was long divided into soluble and insoluble as though that predicted its effects. It does not. What predicts them is whether the fibre forms a thick gel and whether bacteria eat it.',
        technicalDetails:
          'McRorie and McKeown set out the reclassification directly. Clinically meaningful small-bowel benefits — cholesterol lowering and improved glycaemic control — are highly correlated with viscosity: high-viscosity gel-forming fibres such as beta-glucan, psyllium and raw guar gum produce them, while non-viscous soluble fibres such as inulin, fructooligosaccharides and wheat dextrin do not. In the large bowel only two mechanisms drive a laxative effect: coarse insoluble particles mechanically irritating the mucosa and stimulating water and mucus secretion, and the high water-holding capacity of a gel-forming soluble fibre. Psyllium sits in the second group and is additionally almost entirely unfermented, so its gel is still holding water when it reaches the colon — a fermentable gel-former loses its water-holding capacity to the bacteria before it gets there. This reframing explains why "add more fibre" produces such inconsistent clinical results, and why psyllium\'s evidence does not transfer to most of the fibre aisle.',
        evidenceSource: 'McRorie JW, McKeown NM. J Acad Nutr Diet 2017;117:251-264',
        doi: '10.1016/j.jand.2016.09.021',
        inferredClaim:
          'That "soluble fibre" is a functional category whose members share clinical effects',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It absorbs water and becomes a gel, and that is the entire pharmacology',
        laymanDesc:
          'Psyllium husk holds many times its weight in water. There is no receptor and nothing enters the bloodstream — every effect it has comes from the physical properties of that gel.',
        molecularDetail:
          'The active fraction is a highly branched arabinoxylan in the seed coat, which hydrates into a viscous gel. Viscosity, not solubility, is the property that predicts clinical effect: McRorie and McKeown group psyllium with beta-glucan and raw guar gum as high-viscosity gel formers, and separate them from non-viscous soluble fibres such as inulin and fructooligosaccharides that do not produce the same benefits.',
        iconName: 'Droplets',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The gel traps bile acids so the liver has to make more',
        laymanDesc:
          'Bile acids are normally reabsorbed and reused. Trapped in the gel, they leave the body instead, and the liver must build replacements out of cholesterol.',
        molecularDetail:
          'Sequestration of bile acids in the ileal lumen interrupts enterohepatic circulation, increasing faecal bile acid loss. The hepatocyte compensates by upregulating CYP7A1, the rate-limiting 7-alpha-hydroxylase of bile acid synthesis, which consumes hepatic cholesterol and drives compensatory upregulation of the LDL receptor. Serum LDL falls as a consequence — the same mechanistic route as a bile acid sequestrant drug, achieved physically.',
        iconName: 'Recycle',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'It slows how fast a meal reaches the bloodstream',
        laymanDesc:
          'The gel makes the contents of the small intestine thicker, so sugars diffuse to the gut wall more slowly and the post-meal glucose rise is blunted.',
        molecularDetail:
          'Increased luminal viscosity slows gastric emptying and impedes convective mixing and diffusion of glucose to the absorptive surface. Gibb et al. measured the clinical consequence and its dependence on starting point: fasting glucose down 37.0 mg/dL and HbA1c down 0.97 percentage points in treated type 2 diabetes, with no significant lowering in euglycaemic subjects.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Bacteria barely touch it, which is why the gel survives to the colon',
        laymanDesc:
          'Most fermentable fibres are consumed by gut bacteria before they get far. Psyllium is not, so it arrives in the colon still holding its water.',
        molecularDetail:
          'Psyllium is a non-fermented or minimally fermented gel-forming fibre. A fermentable gel former loses its water-holding capacity to bacterial metabolism in the proximal colon and cannot deliver a laxative effect there. Non-fermentability is therefore not a limitation of psyllium but the precondition of its stool effect, and it is also why psyllium produces far less gas than fermentable prebiotic fibres.',
        iconName: 'ShieldCheck',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'In the colon the trapped water normalises stool in both directions',
        laymanDesc:
          'The same gel softens hard stool by adding water to it and firms loose stool by holding water inside itself. One mechanism, two opposite-looking results.',
        molecularDetail:
          'McRorie et al. measured stool water content rising 2.33% on psyllium against 0.01% on docusate, stool water weight 84.0 versus 71.4 g per bowel movement and total output 359.9 versus 271.9 g per week. The bidirectional normalising effect follows from the gel being a water reservoir that neither dissolves nor is fermented away.',
        iconName: 'Scale',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Jovanovski 2018 meta-analysis of psyllium and blood lipids',
        phase: 'Systematic review and meta-analysis of 28 randomised controlled trials',
        sampleSize: 1924,
        primaryEndpoint: 'Change in LDL cholesterol, non-HDL cholesterol and apolipoprotein B',
        endpointMet: true,
        statisticalPValue:
          'LDL -0.33 mmol/L (95% CI -0.38 to -0.27), P < 0.00001; non-HDL -0.39 mmol/L (95% CI -0.50 to -0.27), P < 0.00001',
        unreportedAdverseSignals:
          'All lipid endpoints are surrogates. No randomised trial has tested psyllium against cardiovascular events, and the authorised FDA claim rests on the same surrogate.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Anderson 2000 meta-analysis of psyllium adjunctive to a low-fat diet',
        phase: 'Meta-analysis of 8 controlled trials',
        sampleSize: 656,
        primaryEndpoint: 'Change in total and LDL cholesterol on 10.2 g/day psyllium versus cellulose placebo',
        endpointMet: true,
        statisticalPValue:
          'Total cholesterol -4% (P < 0.0001); LDL -7% (P < 0.0001); apoB:apoA-I ratio -6% (P < 0.05); no effect on HDL or triglycerides',
        unreportedAdverseSignals:
          'All subjects completed an 8-week low-fat diet lead-in first, so the effect measured is strictly additive to diet and is not a standalone result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'McRorie 1998 — psyllium versus docusate sodium in chronic constipation',
        phase: 'Multi-site randomised double-blind parallel-design',
        sampleSize: 170,
        primaryEndpoint: 'Stool water content and laxative efficacy over two weeks of treatment',
        endpointMet: true,
        statisticalPValue:
          'Stool water content +2.33% versus +0.01% (P = 0.007); total output 359.9 versus 271.9 g/week (P = 0.005); bowel movements 3.5 versus 2.9 per week in week 2 (P = 0.02)',
        unreportedAdverseSignals:
          'Bowel movement frequency did not differ in treatment week one. Docusate is itself a weakly evidenced comparator, so this is a win against a low bar.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Gibb 2015 meta-analyses of psyllium and glycaemic control',
        phase: 'Eight meta-analyses across 35 randomised controlled studies',
        sampleSize: 35,
        primaryEndpoint: 'Change in fasting blood glucose and HbA1c by baseline glycaemic status',
        endpointMet: true,
        statisticalPValue:
          'In type 2 diabetes: fasting glucose -37.0 mg/dL (P < 0.001); HbA1c -0.97 percentage points, -10.6 mmol/mol (P = 0.048)',
        unreportedAdverseSignals:
          'No significant glucose lowering in euglycaemic subjects. The search included unpublished clinical records held by Procter & Gamble, the manufacturer of the leading psyllium brand. Sample size here counts studies, not participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Moayyedi 2014 meta-analysis of fibre supplementation in irritable bowel syndrome',
        phase: 'Systematic review and meta-analysis of 14 randomised controlled trials',
        sampleSize: 906,
        primaryEndpoint: 'Relative risk of remaining symptomatic after fibre therapy',
        endpointMet: true,
        statisticalPValue:
          'All fibre RR 0.86 (95% CI 0.80 to 0.94), NNT 10; soluble fibre RR 0.83 (95% CI 0.73 to 0.94), NNT 7; bran RR 0.90 (95% CI 0.79 to 1.03), not significant',
        unreportedAdverseSignals:
          'Bran showed no benefit but also no evidence of harm. The soluble-fibre trials pooled several different fibres, so the estimate is not psyllium-specific.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'LDL cholesterol fell 0.33 mmol/L and non-HDL 0.39 mmol/L across 28 randomised trials in 1,924 people',
        'Psyllium beat docusate sodium on stool water content, stool weight, total output and week-two bowel frequency',
        'Soluble fibre reduced the risk of remaining symptomatic in IBS with a number needed to treat of 7; bran did not',
        'In treated type 2 diabetes, fasting glucose fell 37 mg/dL and HbA1c 0.97 percentage points; in euglycaemic subjects, nothing',
        'The FDA authorised a coronary heart disease risk-reduction claim at 7 g/day of psyllium soluble fibre in 21 CFR 101.81',
      ],
      unsupportedInferences: [
        'That psyllium reduces cardiovascular events, which no trial has tested — the claim rests on the LDL surrogate',
        'That psyllium evidence transfers to fibre generally, when bran failed in the same IBS analysis and non-viscous soluble fibres fail on lipids and glucose',
        'That it improves blood sugar in people whose blood sugar is normal, which the pooled data specifically rules out',
      ],
      whatFailedInitially: [
        'The soluble-versus-insoluble classification of dietary fibre, replaced by viscosity and fermentability as the properties that predict effect',
        'Bran for irritable bowel syndrome, which produced no benefit across its trials in the pooled analysis',
      ],
      realWorldOutcome: [
        'This is one of the few entries in this file with an authorised federal health claim naming a dose, and it earned it',
        'The effects are physical, dose-defined and reproduced across two meta-analyses eighteen years apart',
        'A substantial share of the evidence base was generated or assembled by the manufacturer of the leading brand, which is worth knowing without being disqualifying',
      ],
    },
    deliverySystem: {
      type: 'Oral powder, granules, wafer or capsule; not absorbed at any point',
      description:
        'Sold in the United States both as a dietary supplement and as an OTC bulk-forming laxative, and uniquely among the entries in this file it carries an FDA-authorised health claim written into 21 CFR 101.81. That regulation requires labelling consistent with 21 CFR 101.17(f), the warning provision for these products, and requires all general health claim conditions of 21 CFR 101.14. Capsules deliver far less psyllium per unit than powder, so reaching the dose used in the lipid trials by capsule requires a large number of them. Product husk purity and particle size affect gel formation and are not standardised across brands.',
      safetyProfile:
        'Bloating and flatulence, generally less than with fermentable fibres because psyllium is minimally fermented. The specific serious hazard is physical: psyllium swells on contact with liquid, and dry or incompletely hydrated product can obstruct the throat or oesophagus, which is why federal labelling rules apply. It is contraindicated in known bowel obstruction or stricture. Delayed gastric emptying can slow the absorption of medicines taken at the same time. Occupational and, more rarely, ingestion-related IgE-mediated allergy to Plantago ovata is documented, particularly among people handling the powder.',
    },
    commonQuestions: [
      {
        q: 'Does psyllium really lower cholesterol?',
        a: 'Yes, and it is one of the few claims in this file a regulator has examined and written into law. Across 28 randomised trials in 1,924 people, about 10 g a day reduced LDL cholesterol by 0.33 mmol/L and non-HDL by 0.39 mmol/L, and an earlier meta-analysis of 8 trials found LDL down 7 percent on top of a low-fat diet. The FDA authorises a coronary heart disease risk-reduction claim at 7 g of psyllium soluble fibre per day. The honest limits: this is a fraction of what a statin does, and no trial has tested psyllium against actual heart attacks.',
      },
      {
        q: 'Is any fibre as good as psyllium?',
        a: 'Beta-glucan from oats and barley is, and the same federal regulation says so — it authorises the identical claim at 3 g a day of beta-glucan. Beyond those two, the answer is mostly no, and the reason is physics rather than chemistry. What predicts a fibre\'s effect is whether it forms a viscous gel and whether bacteria ferment it. Inulin, fructooligosaccharides and wheat dextrin are soluble and non-viscous and do not lower cholesterol or improve glycaemic control. Wheat bran showed no benefit in irritable bowel syndrome while soluble fibre did.',
      },
      {
        q: 'How can the same thing treat both constipation and diarrhoea?',
        a: 'Because it is a water reservoir rather than a drug. The gel adds water to hard stool and holds water inside itself when stool is loose, so it moves stool form toward the middle from either direction. This only works because psyllium is barely fermented — a gel-forming fibre that gut bacteria eat loses its water-holding capacity before it reaches the colon and cannot do either job.',
      },
      {
        q: 'Will it help my blood sugar?',
        a: 'That depends entirely on where your blood sugar starts. In pooled data from 35 studies, people being treated for type 2 diabetes saw fasting glucose fall by 37 mg/dL and HbA1c by nearly a full percentage point. People at risk saw a modest improvement. People with normal glucose saw no significant lowering at all. Worth knowing about that analysis: the dataset included unpublished clinical records held by Procter & Gamble, which sells the leading psyllium brand.',
        auditNote:
          'The gradient — biggest effect where the deficit is biggest, nothing where there is none — is the recurring pattern across this whole file.',
      },
      {
        q: 'Is there any real danger?',
        a: 'One, and it is mechanical rather than toxicological. Psyllium swells immediately on contact with liquid, and taken dry or with too little fluid it can lodge and obstruct the throat or oesophagus. That is why the federal regulation authorising its health claim also requires the labelling to comply with the warning provision at 21 CFR 101.17(f). Anyone with a known bowel narrowing or obstruction should not take a bulk-forming agent, and medicines taken at the same time may be absorbed more slowly.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'McRorie JW et al. Psyllium is superior to docusate sodium for treatment of chronic constipation. Aliment Pharmacol Ther 1998;12:491-497',
        identifier: '10.1046/j.1365-2036.1998.00336.x',
        kind: 'doi',
      },
      {
        label:
          'Anderson JW et al. Cholesterol-lowering effects of psyllium intake adjunctive to diet therapy in men and women with hypercholesterolemia: meta-analysis of 8 controlled trials. Am J Clin Nutr 2000;71:472-479',
        identifier: '10.1093/ajcn/71.2.472',
        kind: 'doi',
      },
      {
        label:
          'Moayyedi P et al. The effect of fiber supplementation on irritable bowel syndrome: a systematic review and meta-analysis. Am J Gastroenterol 2014;109:1367-1374',
        identifier: '10.1038/ajg.2014.195',
        kind: 'doi',
      },
      {
        label:
          'Gibb RD, McRorie JW, Russell DA, Hasselblad V, D\'Alessio DA. Psyllium fiber improves glycemic control proportional to loss of glycemic control: a meta-analysis. Am J Clin Nutr 2015;102:1604-1614',
        identifier: '10.3945/ajcn.115.106989',
        kind: 'doi',
      },
      {
        label:
          'McRorie JW, McKeown NM. Understanding the physics of functional fibers in the gastrointestinal tract: an evidence-based approach to resolving enduring misconceptions about insoluble and soluble fiber. J Acad Nutr Diet 2017;117:251-264',
        identifier: '10.1016/j.jand.2016.09.021',
        kind: 'doi',
      },
      {
        label:
          'Jovanovski E et al. Effect of psyllium (Plantago ovata) fiber on LDL cholesterol and alternative lipid targets, non-HDL cholesterol and apolipoprotein B: a systematic review and meta-analysis of randomized controlled trials. Am J Clin Nutr 2018;108:922-932',
        identifier: '10.1093/ajcn/nqy115',
        kind: 'doi',
      },
      {
        label:
          '21 CFR 101.81 — Health claims: soluble fiber from certain foods and risk of coronary heart disease',
        identifier:
          'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-B/part-101/subpart-E/section-101.81',
        kind: 'regulatory',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Inulin — one approved EFSA claim (stool frequency), a real bifidogenic shift, no cholesterol or
  // glycaemic effect because it is not viscous, and a Cell paper in which it gave dysbiotic mice
  // liver cancer.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'inulin',
    name: 'Inulin',
    tradeName:
      'Sold as chicory root fibre, oligofructose, fructooligosaccharide (FOS) or agave inulin; branded ingredients include Orafti and Frutafit',
    sponsor:
      'No single sponsor — inulin-type fructans extracted mainly from chicory root. Beneo (Orafti) and Sensus (Frutafit) are the two dominant ingredient manufacturers, and both appear in the authorship of the supporting literature.',
    targetGene: 'BIF_BIFIDOBACTERIUM',
    targetProtein:
      'Bacterial beta-fructofuranosidase, the enzyme that lets Bifidobacterium and a few other genera cleave beta-2,1 fructosyl bonds. Human digestive enzymes cannot break that bond at all, which is the whole basis of the category: inulin reaches the colon intact and is fermented selectively by the bacteria that can eat it.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a prebiotic for gut health, immunity, metabolic health and blood sugar. The European Food Safety Authority has authorised exactly one claim for it: that native chicory inulin contributes to maintenance of normal defecation by increasing stool frequency. Nothing else in the marketing has an authorised European claim.',
    patientFriendlyIndication: 'Taken to feed gut bacteria and improve digestion',
    conditionContext: {
      conditionExplainer:
        'The bond linking the sugars in inulin is one no human enzyme can cut. So inulin passes through the small intestine untouched and arrives in the colon as food for bacteria. Those bacteria ferment it into short-chain fatty acids and gas — which is simultaneously the mechanism of every claimed benefit and the mechanism of every side effect.',
      whyItMatters:
        'Inulin is the archetypal prebiotic and the fibre most likely to be added to a protein bar, a yoghurt or a "gut health" supplement. It genuinely changes the microbiota. What it does not do is any of the things psyllium does, and for a specific physical reason: it does not form a viscous gel. Marketing that says "fibre" and shows a heart rarely distinguishes the two.',
      whoTakesThis:
        'People buying prebiotic or gut-health supplements, and a much larger number consuming it unknowingly as chicory root fibre added to reduced-sugar and high-fibre processed foods.',
      clinicalGoals:
        'Trials measured faecal bifidobacteria counts, stool frequency, gastrointestinal symptom scores, fractional calcium absorption by stable isotope, whole-body bone mineral content and density, and in the animal literature hepatocellular carcinoma incidence.',
    },
    oneSentenceVerdict:
      'Inulin reliably increases bifidobacteria and holds a single authorised European claim for increasing stool frequency; it does not lower cholesterol or improve glycaemic control because it is not viscous, it causes dose-dependent flatulence and bloating with 10 g of oligofructose substantially worsening symptoms in healthy adults, and in dysbiotic mice it induced hepatocellular carcinoma.',
    laymanHowItWorks:
      'Inulin is a chain of fructose units joined by a bond that human digestive enzymes cannot break. It therefore travels the whole length of the small intestine unchanged and arrives in the colon, where certain bacteria — bifidobacteria above all — do have the enzyme and eat it. They multiply, and they produce short-chain fatty acids and gas. Everything good that is claimed for inulin and everything uncomfortable about it come from the same event. Because it dissolves without thickening, it does none of the physical work that a gel-forming fibre like psyllium does in the small intestine.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 51,
    anatomicalSite:
      'The colonic lumen, where bacterial fermentation occurs. Inulin is not absorbed and has no activity in the small intestine.',
    substitutes: {
      summary:
        'If the goal is stool frequency, inulin has an authorised claim for it. If the goal is cholesterol or blood sugar, inulin is the wrong fibre and psyllium or beta-glucan is the right one. If the goal is a diverse microbiota, whole foods supply fermentable substrate without a concentrated dose arriving at once.',
      conventionalRx: [
        {
          name: 'Psyllium husk, as the fibre that does the other things',
          class: 'Gel-forming, non-fermented soluble fibre',
          howItCompares:
            'McRorie and McKeown place inulin and fructooligosaccharides explicitly among the non-viscous soluble fibres that do not lower cholesterol or improve glycaemic control, in contrast to the gel-forming group of beta-glucan, psyllium and raw guar gum that do. Psyllium also holds an FDA-authorised heart disease claim; inulin does not.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros of psyllium: viscosity-dependent lipid and glucose effects, far less gas because it is barely fermented. Cons: it does not feed bifidobacteria, which is the one thing inulin genuinely does.',
        },
      ],
      naturalFoods: [
        {
          name: 'Chicory root, Jerusalem artichoke, onion, garlic, leek and asparagus',
          activeCompound: 'Inulin-type fructans, the same beta-2,1-linked fructose polymers',
          biologicalMechanism:
            'These are the dietary sources from which commercial inulin is extracted or which naturally contain it. The chemistry is identical; the difference is dose and rate. A supplement delivers several grams as a single bolus, which is exactly the pattern that produces gas, whereas the same amount spread across meals in food form is better tolerated.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: Bonnema et al. tested 5 and 10 g challenges and found up to 10 g/day of native inulin and up to 5 g/day of oligofructose well tolerated in healthy young adults.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'If you have IBS, inulin is a FODMAP',
          action:
            'Fructans are the F in FODMAP. A supplement marketed for gut health may be the specific compound a low-FODMAP diet exists to remove.',
          patientImpact:
            'A randomised controlled feeding trial found that a diet low in fermentable oligosaccharides, disaccharides, monosaccharides and polyols reduced symptoms of irritable bowel syndrome. Fructans are one of the named oligosaccharide classes in that acronym.',
          clinicalPrecaution:
            'This is the sharpest contradiction in the fibre aisle: the same molecule sold as a gut-health supplement is the one gastroenterologists ask IBS patients to eliminate.',
        },
        {
          name: 'Read the dose, and read where the authors work',
          action:
            'Check the amount per serving and the affiliation on any supporting study. Chicory root fibre is added to processed foods in quantities people do not track, and multiple sources add up.',
          patientImpact:
            'A 10 g oligofructose challenge substantially increased gastrointestinal symptoms against control in healthy adults with no history of gut conditions. Flatulence was the commonest complaint, then bloating.',
          clinicalPrecaution:
            'The most-cited review of the bifidogenic effect was written by an author at Sensus, an inulin manufacturer, and much of the rest of the literature carries similar affiliations.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'C([C@@H]1[C@H]([C@@H]([C@H]([C@H](O1)O[C@]2([C@H]([C@@H]([C@H](O2)CO)O)O)CO[C@]3([C@H]([C@@H]([C@H](O3)CO)O)O)CO)O)O)O)O',
      chemicalFormula: 'C18H32O16',
      molecularWeight:
        '504.4 g/mol. This is 1-kestose, the shortest inulin-type fructan — one glucose with two fructose units, written GF2. Commercial inulin is not a single molecule but a distribution of chain lengths from about 2 to 60 fructose units. 1-kestose is the defined marker the literature and the analytical methods actually track, and chain length distribution is the property that separates "oligofructose" from "native inulin" in tolerance studies.',
      structureSource: {
        label: 'PubChem CID 440080 — 1-Kestose, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/440080',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'inu-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Degree of polymerisation profile and free sugar content',
          description:
            'Native inulin and oligofructose are the same chemistry at different chain lengths, and chain length is what determines both how fast it ferments and how much gas it causes. A product labelled only "inulin" can be either. Free glucose, fructose and sucrose carried through from extraction also matter, because they are absorbed in the small intestine and are not fibre at all.',
          reagentsAndBuffer:
            'High-performance anion-exchange chromatography with pulsed amperometric detection; 1-kestose, nystose and fructosylnystose standards for the short-chain end; enzymatic AOAC 997.08 fructan assay with inulinase and fructanase; free glucose, fructose and sucrose quantified separately',
        },
        {
          id: 'inu-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the 13C-labelled fructan for a fermentation tracer study',
          description:
            'To attribute a short-chain fatty acid rise to the administered inulin rather than to background fermentation of everything else in a diet, the substrate has to be labelled. This step is what separates a real measurement of fermentation from an inference off a stool sample.',
          dependsOnStepId: 'inu-w1',
          reagentsAndBuffer:
            'Uniformly 13C-labelled chicory inulin from plants grown on 13CO2, or enzymatically synthesised 13C-fructan using fructosyltransferase on labelled sucrose; isotopic enrichment confirmed by isotope-ratio mass spectrometry; breath 13CO2 collection apparatus',
        },
        {
          id: 'inu-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Faecal sample handling for anaerobe survival and short-chain fatty acid stability',
          description:
            'Bifidobacteria are strict anaerobes and die on contact with air, and short-chain fatty acids are volatile and continue to be produced in an unfrozen sample. A bifidogenic result from a badly handled sample is a result about handling. Anaerobic collection and immediate freezing are the step, not a detail of it.',
          dependsOnStepId: 'inu-w2',
          reagentsAndBuffer:
            'Anaerobic collection into an oxygen-scavenging pouch within 30 minutes of passage; immediate snap-freezing at -80 degrees C; DNA extraction with bead-beating for Gram-positive lysis; internal spike of a non-native bacterial standard for absolute quantification; acidified aliquot with internal standard for GC short-chain fatty acid analysis',
        },
        {
          id: 'inu-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Selective fermentation in a continuous colonic model, with a dysbiotic arm',
          description:
            'Run the fermentation in a model that reproduces colonic transit and pH, using both a conventional and a deliberately dysbiotic inoculum. The dysbiotic arm is the one that matters, because the Cell 2018 hepatocellular carcinoma finding occurred only in dysbiotic mice and was absent in germ-free and antibiotic-treated animals. A prebiotic tested only against a healthy microbiota cannot detect that failure mode.',
          dependsOnStepId: 'inu-w3',
          reagentsAndBuffer:
            'Continuous three-stage colonic simulator at pH 5.5, 6.2 and 6.8; conventional and antibiotic-perturbed human faecal inocula; 16S rRNA amplicon and shotgun metagenomic sequencing; qPCR for Bifidobacterium 16S; GC quantification of acetate, propionate and butyrate; bile acid profiling by LC-MS/MS',
        },
        {
          id: 'inu-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Stool frequency and symptom scoring against the authorised claim endpoint',
          description:
            'Report the endpoint EFSA actually accepted — stool frequency — alongside a validated gastrointestinal symptom score, because the benefit and the adverse effect come from the same fermentation and reporting either alone misrepresents the product.',
          dependsOnStepId: 'inu-w4',
          reagentsAndBuffer:
            'Prospective stool diary with Bristol Stool Form Scale; seven-domain gastrointestinal tolerance questionnaire administered at 0, 2, 4, 24 and 48 hours after challenge, as in Bonnema et al.; maltodextrin placebo matched for appearance and sweetness; crossover design with washout',
        },
      ],
    },
    keyAudits: [
      {
        id: 'inu-a1',
        category: 'measured',
        title: 'EFSA authorised exactly one claim, and it is about stool frequency',
        laymanSummary:
          'European regulators reviewed inulin and accepted a single claim: that chicory inulin increases how often you go. Every other health claim for it was not accepted.',
        technicalDetails:
          'The EFSA Panel on Dietetic Products, Nutrition and Allergies issued a scientific opinion on the substantiation of a health claim related to "native chicory inulin" and maintenance of normal defecation by increasing stool frequency, under Article 13.5 of Regulation (EC) No 1924/2006. That is the authorised claim, and its narrowness is the finding. Under the same European regime, claims for inulin-type fructans relating to blood glucose control, blood lipids, immune function, mineral absorption and satiety have not achieved authorisation. A reader can therefore treat the European regulatory record as a filter already applied to this category by a body with access to the same literature the marketing draws on: one endpoint survived.',
        evidenceSource:
          'EFSA Panel on Dietetic Products, Nutrition and Allergies. EFSA Journal 2015;13(1):3951',
        doi: '10.2903/j.efsa.2015.3951',
        measuredMetric:
          'Stool frequency, as the sole endpoint for which a European health claim was authorised',
        auditFlag: 'verified',
      },
      {
        id: 'inu-a2',
        category: 'measured',
        title: 'The bifidogenic effect is real — and the review establishing it came from a manufacturer',
        laymanSummary:
          'Inulin genuinely increases bifidobacteria in the gut, across many studies and age groups. The most-cited review saying so was written by a scientist at an inulin company.',
        technicalDetails:
          'Meyer and Stasse-Wolthuis state that the bifidogenic effect of inulin and oligofructose is well established across studies in adults and other age groups, and that this shift in colonic microbiota composition is likely the basis for the effects of these prebiotics on colonic function. The rest of their review is carefully hedged in a way the marketing is not: indications for reduced production of potentially toxic metabolites and immune-mediated effects come "mainly from animal and in vitro studies and also from some human trials." The corresponding author is at Sensus, a chicory inulin manufacturer. The bifidogenic shift itself is not in dispute and is measured by direct bacterial quantification. What has never been established is the step from a bifidobacterial count to a clinical outcome, and that step is where the entire prebiotic value proposition sits.',
        evidenceSource: 'Meyer D, Stasse-Wolthuis M. Eur J Clin Nutr 2009;63:1277-1289',
        doi: '10.1038/ejcn.2009.64',
        measuredMetric: 'Faecal Bifidobacterium counts after inulin or oligofructose supplementation',
        auditFlag: 'contested',
      },
      {
        id: 'inu-a3',
        category: 'failed',
        title: 'It does not lower cholesterol or blood sugar, because it does not thicken',
        laymanSummary:
          'Inulin is soluble fibre, but it dissolves without becoming thick. The cholesterol and blood-sugar benefits of fibre depend on thickness, and inulin does not deliver them.',
        technicalDetails:
          'McRorie and McKeown set out the physical basis directly: clinically meaningful small-bowel benefits are highly correlated with viscosity, so high-viscosity gel-forming fibres such as beta-glucan, psyllium and raw guar gum lower cholesterol and improve glycaemic control, "whereas nonviscous soluble fibers (eg, inulin, fructooligosaccharides, and wheat dextrin) and insoluble fibers (eg, wheat bran) do not provide these viscosity-dependent health benefits." Inulin is named explicitly in the group that does not. This is not a null result from an underpowered trial; it is a mechanistic exclusion. Bile acid sequestration and slowed glucose diffusion both require a viscous luminal gel, and a fibre that dissolves to a thin solution cannot produce either. The practical consequence is that psyllium\'s FDA-authorised heart disease claim and inulin\'s EFSA stool-frequency claim are not interchangeable evidence, and "added fibre" on a package tells a reader nothing about which kind they have bought.',
        evidenceSource: 'McRorie JW, McKeown NM. J Acad Nutr Diet 2017;117:251-264',
        doi: '10.1016/j.jand.2016.09.021',
        measuredMetric:
          'Presence or absence of viscosity-dependent cholesterol and glycaemic effects, by fibre type',
        auditFlag: 'verified',
      },
      {
        id: 'inu-a4',
        category: 'failed',
        title: 'Ten grams of oligofructose substantially worsened symptoms in healthy people',
        laymanSummary:
          'In a controlled crossover in 26 healthy adults with no history of gut problems, a 10-gram dose of the short-chain form clearly increased gastrointestinal symptoms.',
        technicalDetails:
          'Bonnema and colleagues ran a randomised, double-blind, controlled crossover in 26 healthy men and women aged 18 to 60 with no history of gastrointestinal conditions, comparing 5 g and 10 g doses of oligofructose and of native inulin against placebo, each delivered in a breakfast of bagel, cream cheese and orange juice, with a seven-domain tolerance questionnaire at 0, 2, 4, 24 and 48 hours. Both inulin fibres tended to increase symptoms mildly, with flatulence the most frequently reported and bloating second. The 10 g dose of oligofructose substantially increased gastrointestinal symptoms compared with control. The authors concluded that up to 10 g/day of native inulin and up to 5 g/day of oligofructose were well tolerated. Two things follow. First, chain length matters: the shorter oligofructose ferments faster and closer to the proximal colon and is tolerated at half the dose. Second, these were healthy people selected for having no gut complaints, which is not the population buying gut-health supplements.',
        evidenceSource: 'Bonnema AL, Kolberg LW, Thomas W, Slavin JL. J Am Diet Assoc 2010;110:865-868',
        doi: '10.1016/j.jada.2010.03.025',
        measuredMetric:
          'Summed score across seven gastrointestinal tolerance domains after 5 g and 10 g fibre challenges',
        auditFlag: 'verified',
      },
      {
        id: 'inu-a5',
        category: 'failed',
        title: 'In dysbiotic mice, inulin caused liver cancer — and the authors said so plainly',
        laymanSummary:
          'A Cell paper found that adding inulin to the diet of mice with a disturbed gut microbiome caused liver cancer. Insoluble fibre did not, and germ-free mice were protected.',
        technicalDetails:
          'Singh and colleagues incorporated soluble fibre inulin into a compositionally defined diet and observed icteric hepatocellular carcinoma. The effect was microbiota-dependent: it occurred in multiple strains of dysbiotic mice, but not in germ-free animals and not in antibiotic-treated animals, and insoluble fibre did not produce it. An inulin-enriched high-fat diet induced both dysbiosis and hepatocellular carcinoma in wild-type mice. The progression ran through early-onset cholestasis, hepatocyte death and neutrophilic liver inflammation. Pharmacologic inhibition of fermentation, or depletion of the fermenting bacteria, markedly reduced intestinal short-chain fatty acids and prevented the cancer, and giving cholestyramine to prevent bile acid reabsorption was also protective. The authors\' own conclusion is the appropriate weight to give this: "its benefits notwithstanding, enrichment of foods with fermentable fiber should be approached with great caution as it may increase risk of HCC." This is a mouse study and has not been shown in humans. It is also the reason a fibre added to processed food at industrial scale deserves a human safety programme rather than an assumption.',
        evidenceSource: 'Singh V et al. Cell 2018;175:679-694',
        doi: '10.1016/j.cell.2018.09.004',
        measuredMetric:
          'Incidence of icteric hepatocellular carcinoma in dysbiotic, germ-free and antibiotic-treated mice on inulin-containing diets',
        auditFlag: 'caution',
      },
      {
        id: 'inu-a6',
        category: 'measured',
        title: 'The best human outcome result is calcium absorption in adolescents',
        laymanSummary:
          'A year-long randomised trial in pubertal teenagers found inulin-type fructans increased calcium absorption and produced measurably more bone mineral over twelve months.',
        technicalDetails:
          'Abrams and colleagues randomised pubertal adolescents to 8 g/day of a mixed short- and long-chain inulin-type fructan or maltodextrin placebo, measuring calcium absorption by stable isotope at baseline, 8 weeks and 1 year, and bone mineral content and density before randomisation and at 1 year. Calcium absorption was greater in the fructan group at 8 weeks (difference 8.5 +/- 1.6%, P < 0.001) and still greater at 1 year (5.9 +/- 2.8%, P = 0.04). At one year the fructan group had a greater increment in whole-body bone mineral content (35 +/- 16 g, P = 0.03) and whole-body bone mineral density (0.015 +/- 0.004 g/cm2, P = 0.01). An interaction with the Fok1 vitamin D receptor polymorphism was present, with ff-genotype subjects showing the least initial response. This is a genuine hard-ish outcome from a year-long randomised trial with an isotopic mechanism measurement attached, and it deserves recording as the strongest human result inulin has. It is also in growing adolescents during peak bone accrual, which is the population where any calcium intervention has the most room to act, and it did not achieve an EFSA authorised claim.',
        evidenceSource: 'Abrams SA et al. Am J Clin Nutr 2005;82:471-476',
        doi: '10.1093/ajcn.82.2.471',
        measuredMetric:
          'Fractional calcium absorption by stable isotope, and one-year change in whole-body bone mineral content and density',
        auditFlag: 'verified',
      },
      {
        id: 'inu-a7',
        category: 'conclusion_shift',
        title: 'The same molecule is a gut-health supplement and a FODMAP to be eliminated',
        laymanSummary:
          'Fructans are the F in FODMAP. The compound sold to improve digestion is one of the compounds gastroenterologists ask people with IBS to remove.',
        technicalDetails:
          'Halmos and colleagues ran a randomised controlled single-blind cross-over feeding trial showing that a diet low in fermentable oligosaccharides, disaccharides, monosaccharides and polyols reduced symptoms of irritable bowel syndrome relative to a typical Australian diet, with all food provided. Fructans — inulin and oligofructose — are the principal oligosaccharide class in that acronym. The two positions are not actually contradictory once the mechanism is stated: rapid colonic fermentation produces short-chain fatty acids and gas, the first of which is the claimed benefit and the second of which is the symptom, and which one dominates depends on the person\'s baseline gut sensitivity and microbiota. But the marketing does not state the mechanism, and the result is a product sold for digestive comfort to a population for whom the standard clinical advice is to remove it.',
        evidenceSource: 'Halmos EP, Power VA, Shepherd SJ, Gibson PR, Muir JG. Gastroenterology 2014;146:67-75',
        doi: '10.1053/j.gastro.2013.09.046',
        inferredClaim:
          'That a fermentable fibre marketed for gut health is appropriate for people with functional gut symptoms',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'No human enzyme can cut the bond, so it passes through untouched',
        laymanDesc:
          'Inulin is a chain of fructose units joined in a way our digestive enzymes cannot break. It reaches the large intestine chemically unchanged.',
        molecularDetail:
          'Inulin-type fructans are linear beta-2,1-linked fructose polymers, usually terminated by a glucose unit, with degrees of polymerisation from about 2 to 60. Human sucrase-isomaltase, maltase-glucoamylase and pancreatic amylase have no activity against the beta-2,1 bond. That single fact defines the whole category and is why inulin counts as dietary fibre.',
        iconName: 'Lock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It dissolves without thickening, which is why it does not act like psyllium',
        laymanDesc:
          'Inulin is soluble but the solution stays thin. Thickness is what lets a fibre trap bile acids and slow sugar absorption, and inulin has none of it.',
        molecularDetail:
          'Viscosity, not solubility, determines small-bowel effects. McRorie and McKeown group inulin, fructooligosaccharides and wheat dextrin as non-viscous soluble fibres that do not lower cholesterol or improve glycaemic control, in explicit contrast to beta-glucan, psyllium and raw guar gum. No gel means no bile acid sequestration and no diffusion barrier.',
        iconName: 'Waves',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Bifidobacteria have the enzyme, and multiply on it',
        laymanDesc:
          'In the colon, certain bacteria can break the bond that we cannot. They eat the inulin and their numbers rise, which is the measured prebiotic effect.',
        molecularDetail:
          'Bifidobacterium species express beta-fructofuranosidase and fructan-specific ABC transporters, giving them a competitive advantage on inulin-type substrate. The bifidogenic shift is well established across age groups by direct faecal quantification. Chain length matters: short-chain oligofructose is fermented rapidly and proximally, long-chain native inulin more slowly and further along the colon.',
        iconName: 'Sprout',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Fermentation produces short-chain fatty acids and gas together',
        laymanDesc:
          'The bacteria turn inulin into useful acids and into hydrogen and carbon dioxide. You cannot have one without the other, which is why benefit and bloating arrive together.',
        molecularDetail:
          'Saccharolytic fermentation yields acetate, propionate and butyrate along with hydrogen, carbon dioxide and, in methanogen carriers, methane. Bonnema et al. measured the human consequence: flatulence was the commonest reported symptom and 10 g of oligofructose substantially increased symptom scores in healthy adults. In the Cell 2018 mouse work, pharmacologic inhibition of fermentation or depletion of fermenting bacteria both prevented the hepatocellular carcinoma, which identifies fermentation itself as the causal step.',
        iconName: 'Wind',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The authorised outcome is stool frequency; the measured mineral outcome is calcium',
        laymanDesc:
          'What regulators accepted is that it makes you go more often. The best hard result is that it increased calcium absorption and bone mineral in teenagers over a year.',
        molecularDetail:
          'EFSA authorised the claim that native chicory inulin contributes to maintenance of normal defecation by increasing stool frequency. Separately, Abrams et al. measured fractional calcium absorption higher by 8.5 +/- 1.6% at 8 weeks and 5.9 +/- 2.8% at one year, with whole-body bone mineral content 35 +/- 16 g and density 0.015 +/- 0.004 g/cm2 greater at one year. The proposed mechanism is colonic acidification increasing calcium solubility and passive absorption.',
        iconName: 'Bone',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'EFSA Article 13.5 opinion on native chicory inulin and stool frequency',
        phase: 'Regulatory scientific opinion',
        sampleSize: 1,
        primaryEndpoint:
          'Substantiation of a claim for maintenance of normal defecation by increasing stool frequency',
        endpointMet: true,
        statisticalPValue:
          'Claim authorised under Article 13.5 of Regulation (EC) No 1924/2006; no other inulin health claim authorised',
        unreportedAdverseSignals:
          'The narrowness is the finding. Claims for glycaemic control, blood lipids, immune function and mineral absorption did not achieve authorisation under the same regime.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Bonnema 2010 — gastrointestinal tolerance of chicory inulin products',
        phase: 'Randomised double-blind controlled crossover',
        sampleSize: 26,
        primaryEndpoint: 'Summed score across seven gastrointestinal tolerance domains',
        endpointMet: false,
        statisticalPValue:
          '10 g oligofructose substantially increased gastrointestinal symptoms versus control; both fibres tended to increase symptoms mildly',
        unreportedAdverseSignals:
          'Participants were healthy adults with no history of gastrointestinal conditions, which is not the population buying gut-health supplements. Flatulence was the commonest symptom, then bloating.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Abrams 2005 — inulin-type fructans, calcium absorption and bone mineralisation',
        phase: 'Randomised placebo-controlled, one year, with stable-isotope absorption measurement',
        sampleSize: 100,
        primaryEndpoint:
          'Fractional calcium absorption at 8 weeks and 1 year, and one-year change in bone mineral content and density',
        endpointMet: true,
        statisticalPValue:
          'Calcium absorption difference +8.5 +/- 1.6% at 8 weeks (P < 0.001) and +5.9 +/- 2.8% at 1 year (P = 0.04); whole-body BMC +35 +/- 16 g (P = 0.03); BMD +0.015 +/- 0.004 g/cm2 (P = 0.01)',
        unreportedAdverseSignals:
          'Conducted in pubertal adolescents during peak bone accrual, the population with the most room for any calcium intervention to act. Response was modified by Fok1 vitamin D receptor genotype. This endpoint did not achieve an EFSA authorised claim.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Singh 2018 — dysregulated microbial fermentation of soluble fibre and liver cancer',
        phase: 'Preclinical, multiple mouse strains including germ-free and antibiotic-treated controls',
        sampleSize: 0,
        primaryEndpoint: 'Incidence of icteric hepatocellular carcinoma on inulin-containing diets',
        endpointMet: false,
        statisticalPValue:
          'Hepatocellular carcinoma induced in dysbiotic mice on inulin but not on insoluble fibre; absent in germ-free and antibiotic-treated animals; prevented by fermentation inhibition or cholestyramine',
        unreportedAdverseSignals:
          'A mouse study with no human counterpart. Sample size is recorded as zero because this trial enrolled no human participants. The authors\' own recommendation was that enrichment of foods with fermentable fibre be approached with great caution.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Halmos 2014 — low-FODMAP diet in irritable bowel syndrome',
        phase: 'Randomised controlled single-blind crossover feeding trial',
        sampleSize: 30,
        primaryEndpoint: 'Gastrointestinal symptom scores on a low-FODMAP versus typical diet',
        endpointMet: true,
        statisticalPValue: 'Symptoms significantly reduced on the low-FODMAP diet',
        unreportedAdverseSignals:
          'Fructans — inulin and oligofructose — are the principal oligosaccharide class removed by that diet, which places this trial directly against the product this record covers.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Inulin reliably increases faecal bifidobacteria across studies and age groups, by direct bacterial quantification',
        'EFSA authorised one claim: native chicory inulin increases stool frequency',
        'A 10 g oligofructose dose substantially increased gastrointestinal symptoms in healthy adults with no gut history',
        'Inulin-type fructans increased fractional calcium absorption by 8.5% at 8 weeks and raised bone mineral content over one year in adolescents',
        'In dysbiotic mice, dietary inulin induced hepatocellular carcinoma; insoluble fibre did not, and germ-free mice were protected',
      ],
      unsupportedInferences: [
        'That a rise in bifidobacterial counts constitutes a health outcome',
        'That inulin shares psyllium\'s cholesterol and glycaemic benefits because both are called soluble fibre',
        'That a fibre marketed for gut health suits people with functional gut symptoms, when fructans are a FODMAP',
      ],
      whatFailedInitially: [
        'Every inulin health claim except stool frequency, under the European authorisation regime',
        'The assumption that fermentable fibre is unconditionally beneficial, which the Cell 2018 mouse work directly challenges',
      ],
      realWorldOutcome: [
        'Inulin does something real and specific to the microbiota, and one regulator has accepted one downstream consequence of it',
        'It is added to a large volume of processed food, so consumed doses accumulate across products without anyone tracking them',
        'The gas that makes it unpopular is not a side effect of the mechanism — it is the mechanism',
      ],
    },
    deliverySystem: {
      type: 'Oral powder, capsule, or added to food as chicory root fibre',
      description:
        'Sold in the United States as a dietary supplement under DSHEA and used widely as a food ingredient, where it appears on labels as chicory root fibre, inulin or oligofructose. Chain length distribution is the property that matters most and is almost never disclosed: short-chain oligofructose ferments faster and is tolerated at roughly half the dose of native long-chain inulin. Because it is added to bars, yoghurts, reduced-sugar products and fibre supplements simultaneously, a consumer can reach a poorly tolerated total from several products none of which looks like a large dose on its own.',
      safetyProfile:
        'Dose-dependent flatulence, bloating, abdominal discomfort and, at higher intakes, osmotic diarrhoea — all direct consequences of colonic fermentation rather than incidental to it. Tolerance in healthy adults was demonstrated to about 10 g/day of native inulin and 5 g/day of oligofructose. Fructans are a FODMAP and commonly provoke symptoms in irritable bowel syndrome. Rare IgE-mediated allergy to inulin has been reported, including anaphylaxis. In mice with a disturbed microbiota, dietary inulin induced hepatocellular carcinoma through fermentation-dependent cholestasis; no human equivalent has been shown, and the investigators nonetheless recommended caution about enriching foods with fermentable fibre.',
    },
    commonQuestions: [
      {
        q: 'Does inulin actually do anything?',
        a: 'Yes, one thing very reliably: it increases bifidobacteria in the colon, because those bacteria have an enzyme for the bond in inulin and we do not. European regulators accepted one downstream consequence of that — increased stool frequency — and authorised a claim for it. What has never been established is the step from a higher bifidobacterial count to a health outcome, and that step is where the whole prebiotic value proposition sits.',
      },
      {
        q: 'Will it lower my cholesterol like other soluble fibre?',
        a: 'No, and the reason is physical rather than a failure to find an effect. Cholesterol lowering by fibre depends on forming a viscous gel that traps bile acids in the small intestine. Inulin dissolves without thickening. The fibre physiology literature names inulin and fructooligosaccharides explicitly among the non-viscous soluble fibres that do not deliver viscosity-dependent benefits, in contrast to psyllium, beta-glucan and raw guar gum, which do.',
        auditNote:
          'This is why psyllium holds an FDA heart disease claim and inulin holds a stool frequency claim.',
      },
      {
        q: 'Why does it make me so gassy?',
        a: 'Because the gas is the mechanism, not a side effect of it. Bacteria fermenting inulin produce short-chain fatty acids and hydrogen and carbon dioxide in the same reaction; you cannot get the first without the second. In a controlled crossover in 26 healthy adults, flatulence was the most frequent complaint and bloating the second, and 10 grams of the short-chain form substantially increased symptoms. Those were people specifically selected for having no history of gut problems.',
      },
      {
        q: 'Should I take it if I have IBS?',
        a: 'This is the sharpest contradiction in the fibre aisle. Fructans — which is what inulin and oligofructose are — are the F in FODMAP, and a low-FODMAP diet, which removes them, is a standard evidence-supported intervention for irritable bowel syndrome. A supplement marketed for digestive health is, for this population, the specific class of compound clinicians ask patients to eliminate.',
      },
      {
        q: 'What was the liver cancer study about?',
        a: 'A 2018 Cell paper found that adding inulin to the diet of mice with a disturbed gut microbiome induced hepatocellular carcinoma, progressing through cholestasis and liver inflammation. Insoluble fibre did not do it, germ-free and antibiotic-treated mice were protected, and blocking fermentation or the bile acid recycling both prevented it. This is a mouse study with no human counterpart, and it should not be read as evidence that inulin causes cancer in people. It should be read the way its authors wrote it: that enriching foods with fermentable fibre at industrial scale deserves a safety programme rather than an assumption.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Abrams SA et al. A combination of prebiotic short- and long-chain inulin-type fructans enhances calcium absorption and bone mineralization in young adolescents. Am J Clin Nutr 2005;82:471-476',
        identifier: '10.1093/ajcn.82.2.471',
        kind: 'doi',
      },
      {
        label:
          'Meyer D, Stasse-Wolthuis M. The bifidogenic effect of inulin and oligofructose and its consequences for gut health. Eur J Clin Nutr 2009;63:1277-1289',
        identifier: '10.1038/ejcn.2009.64',
        kind: 'doi',
      },
      {
        label:
          'Bonnema AL, Kolberg LW, Thomas W, Slavin JL. Gastrointestinal tolerance of chicory inulin products. J Am Diet Assoc 2010;110:865-868',
        identifier: '10.1016/j.jada.2010.03.025',
        kind: 'doi',
      },
      {
        label:
          'Halmos EP, Power VA, Shepherd SJ, Gibson PR, Muir JG. A diet low in FODMAPs reduces symptoms of irritable bowel syndrome. Gastroenterology 2014;146:67-75',
        identifier: '10.1053/j.gastro.2013.09.046',
        kind: 'doi',
      },
      {
        label:
          'EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific opinion on the substantiation of a health claim related to native chicory inulin and maintenance of normal defecation by increasing stool frequency. EFSA Journal 2015;13(1):3951',
        identifier: '10.2903/j.efsa.2015.3951',
        kind: 'doi',
      },
      {
        label:
          'McRorie JW, McKeown NM. Understanding the physics of functional fibers in the gastrointestinal tract. J Acad Nutr Diet 2017;117:251-264',
        identifier: '10.1016/j.jand.2016.09.021',
        kind: 'doi',
      },
      {
        label:
          'Singh V et al. Dysregulated microbial fermentation of soluble fiber induces cholestatic liver cancer. Cell 2018;175:679-694',
        identifier: '10.1016/j.cell.2018.09.004',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 440080 — 1-Kestose, the shortest inulin-type fructan',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/440080',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Glycine — the sleep evidence is a handful of small trials from one company, the mechanism runs
  // through body temperature rather than sedation, and the largest randomised trial of glycine for
  // anything, CONSIST, was flatly negative.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'glycine',
    name: 'Glycine',
    tradeName:
      'Also labelled aminoacetic acid; glycine 1.5% irrigation solution is an FDA-approved prescription product (NDA 017865 and others)',
    sponsor:
      'No single sponsor — the smallest amino acid, made industrially from chloroacetic acid and ammonia. Much of the sleep research was conducted by Ajinomoto Co.',
    targetGene: 'GLRA1',
    targetProtein:
      'Two opposite receptors. The strychnine-sensitive glycine receptor GlyRA1 is a chloride channel and a major inhibitory neurotransmitter receptor in brainstem and spinal cord. The NMDA glutamate receptor carries an obligatory co-agonist site that glycine must occupy for the channel to open, making glycine an excitatory co-transmitter there. Which one matters depends entirely on where in the nervous system you look.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for sleep quality, and as a component of collagen and glutathione support formulas. Not approved by the FDA or EMA for any of that. Glycine 1.5% irrigation solution is separately an approved prescription product used during transurethral surgery, and its known complication is instructive about what happens when a lot of glycine enters the circulation at once.',
    patientFriendlyIndication: 'Taken before bed for sleep quality, and for collagen and detox support',
    conditionContext: {
      conditionExplainer:
        'Falling asleep is preceded by a drop in core body temperature, achieved by opening blood vessels in the hands and feet and dumping heat. Anything that accelerates that heat loss tends to shorten the time to sleep. This, and not sedation, is the mechanism proposed for glycine.',
      whyItMatters:
        'Glycine is the second half of magnesium glycinate and the most abundant amino acid in collagen, so it is sold twice over on borrowed reasoning. Its own evidence is a small, coherent and almost entirely single-source body of sleep work, alongside one large, well-conducted, negative randomised trial in a completely different indication that tells you something useful about how much glycine actually reaches the brain.',
      whoTakesThis:
        'People buying it for sleep, people taking it as part of a glycine-plus-N-acetylcysteine combination for ageing research reasons, and a very large number consuming it unknowingly as the counter-ion in magnesium glycinate.',
      clinicalGoals:
        'Trials measured subjective sleep quality questionnaires, polysomnographic sleep latency and slow-wave sleep latency, core body temperature and cutaneous blood flow in rats, and in the schizophrenia programme the Scale for the Assessment of Negative Symptoms and cognitive domain z-scores.',
    },
    oneSentenceVerdict:
      'The sleep effect is plausible, mechanistically coherent through a fall in core body temperature rather than sedation, and rests on small trials largely generated by a single amino acid manufacturer; meanwhile CONSIST, the largest randomised trial of oral glycine for any indication, found no difference from placebo across 157 patients over 16 weeks.',
    laymanHowItWorks:
      'Glycine is the smallest amino acid and does two contradictory jobs in the nervous system — it calms neurons in the spinal cord and brainstem, and it is a required partner for the main excitatory receptor everywhere else. The sleep story does not depend on either directly. What was measured in rats is that oral glycine widened the blood vessels of the skin, dumped heat, and lowered core body temperature — the same physiological change that normally precedes falling asleep. So the proposal is that glycine hurries along a signal your body was going to send anyway, rather than sedating you.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 47,
    anatomicalSite:
      'Suprachiasmatic nucleus and the thermoregulatory pathway to cutaneous vasculature for the sleep effect; brainstem and spinal cord for inhibitory glycine receptors',
    substitutes: {
      summary:
        'For sleep, cognitive behavioural therapy for insomnia is first-line in every guideline and has far larger, more durable effects. For collagen synthesis, glycine is not the limiting input in anyone eating adequate protein — vitamin C is the cofactor whose absence actually stops the process.',
      conventionalRx: [
        {
          name: 'Glycine 1.5% irrigation solution, and what it teaches',
          class: 'Approved prescription irrigant for transurethral surgery',
          howItCompares:
            'The same molecule, absorbed in quantity through open prostatic venous sinuses during resection, produces the recognised complication known as TUR syndrome: dilutional hyponatraemia with visual disturbance, confusion and, in severe cases, seizures, with glycine\'s ammonia metabolite implicated in the encephalopathy.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: it establishes beyond doubt that glycine is pharmacologically active when enough of it reaches the circulation. Cons for the supplement narrative: it also establishes that "it is just an amino acid" is not a safety argument, only a dose argument.',
        },
        {
          name: 'Cognitive behavioural therapy for insomnia',
          class: 'First-line behavioural treatment',
          howItCompares:
            'Addresses the conditioned arousal and time-in-bed behaviours maintaining chronic insomnia, with effects on sleep latency and efficiency several times larger than anything reported for glycine, and which persist after treatment ends.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: durable, no pharmacology. Cons: requires weeks of structured effort, which is why a powder wins on convenience.',
        },
      ],
      naturalFoods: [
        {
          name: 'Gelatin, bone broth, skin and connective tissue',
          activeCompound: 'Glycine, roughly one residue in three of collagen',
          biologicalMechanism:
            'Collagen\'s repeating Gly-X-Y motif makes glycine its single most abundant residue, so any collagen-rich food is a concentrated glycine source. The amino acid released is identical to supplemental glycine and enters the same free pool.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the sleep trials used 3 g before bedtime, which is a larger single dose than most whole-food sources supply at once.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'A warm bath or shower before bed, as the mechanism-matching comparator',
          activeCompound: 'Peripheral vasodilation and subsequent heat loss',
          biologicalMechanism:
            'Passive body heating raises skin blood flow and accelerates core temperature decline afterwards, which is precisely the physiology Bannai and Kawai proposed for glycine. If the mechanism is thermoregulatory rather than neurochemical, then a non-pharmacological intervention producing the same heat loss is the honest comparator.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no timing guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Note who ran the trial',
          action:
            'The glycine sleep literature is small and concentrated. The 2006 and 2007 human studies and the 2012 mechanistic review share authorship with Ajinomoto, a major amino acid manufacturer.',
          patientImpact:
            'The review states the finding in its own words: glycine ingestion before bedtime significantly ameliorated subjective sleep quality "in individuals with insomniac tendencies" — a self-selected population, a subjective endpoint, and small numbers.',
          clinicalPrecaution:
            'Company-run research is not thereby wrong. It does mean the independent replication question is the first one to ask, and here it is largely unanswered.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(C(=O)O)N',
      chemicalFormula: 'C2H5NO2',
      molecularWeight: '75.07 g/mol — the smallest amino acid, with hydrogen as its entire side chain',
      targetReceptorAffinity:
        'Micromolar at the strychnine-sensitive glycine receptor and sub-micromolar at the NMDA receptor glycine co-agonist site. The NMDA site is near-saturated at normal cerebrospinal fluid glycine concentrations, which is the pharmacological reason oral glycine struggles to change NMDA signalling and is directly relevant to why CONSIST failed.',
      structureSource: {
        label: 'PubChem CID 750 — Glycine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/750',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'gly-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Purity, chirality irrelevance check and heavy metal screen',
          description:
            'Glycine is the only proteinogenic amino acid with no chiral centre, so the enantiomeric purity testing that dominates amino acid QC does not apply and a different set of impurities matters: residual chloroacetic acid and iminodiacetic acid from the synthesis, and ammonium salts. An assay for glycine content will not detect any of them.',
          reagentsAndBuffer:
            'Ion-exchange amino acid analysis with ninhydrin detection; ion chromatography for chloride and chloroacetate residues; iminodiacetic acid reference standard; ammonium ion-selective electrode; ICP-MS heavy metal panel',
        },
        {
          id: 'gly-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the 13C-labelled tracer for a brain-penetration study',
          description:
            'The question that decides whether any central claim is possible is how much orally administered glycine reaches the brain, given that glycine is synthesised endogenously and is abundant in cerebrospinal fluid already. Only a labelled tracer separates the swallowed molecule from the resident pool.',
          dependsOnStepId: 'gly-w1',
          reagentsAndBuffer:
            '1,2-13C2-glycine; sterile preparation for both oral and intravenous arms; LC-MS/MS confirmation of isotopic enrichment; baseline natural-abundance sampling before dosing',
        },
        {
          id: 'gly-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Paired plasma and cerebrospinal fluid extraction',
          description:
            'Bannai and Kawai reported that oral glycine raised both plasma and cerebrospinal fluid glycine in rats. Reproducing that in a way that supports a human claim requires paired sampling and a handling protocol that prevents glycine release from cells during processing, which is the commonest artefact in amino acid measurement.',
          dependsOnStepId: 'gly-w2',
          reagentsAndBuffer:
            'Paired plasma and CSF collection at matched timepoints; immediate deproteinisation with sulphosalicylic acid on ice; norvaline internal standard; centrifugation at 4 degrees C within 15 minutes; storage at -80 degrees C',
        },
        {
          id: 'gly-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Thermoregulatory response, not sedation, as the primary readout',
          description:
            'Test the mechanism the human data actually implies. Measure core body temperature and cutaneous blood flow after oral glycine, with a glycine receptor antagonist and an NMDA glycine-site antagonist as separate blockades to identify which receptor carries the effect. A sedation assay would be testing the wrong hypothesis.',
          dependsOnStepId: 'gly-w3',
          reagentsAndBuffer:
            'Implanted telemetric core temperature probe; laser Doppler cutaneous blood flow at the tail or paw; strychnine at sub-convulsant dose as the glycine receptor antagonist; L-701,324 as the NMDA glycine-site antagonist; suprachiasmatic nucleus microinjection arm; ambient temperature held constant',
        },
        {
          id: 'gly-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Polysomnography with core temperature logged in parallel',
          description:
            'Report objective sleep architecture and body temperature from the same subjects on the same nights. The existing human literature is dominated by subjective questionnaires; the mechanistic claim is thermoregulatory; and only a study that records both can show they move together in people rather than in rats.',
          dependsOnStepId: 'gly-w4',
          reagentsAndBuffer:
            'Full polysomnography scored to AASM criteria with slow-wave sleep latency as a prespecified endpoint; ingestible core temperature capsule; distal-to-proximal skin temperature gradient probes; taste-matched placebo, since glycine is distinctly sweet; independent funding and prospective registration',
        },
      ],
    },
    keyAudits: [
      {
        id: 'gly-a1',
        category: 'failed',
        title: 'CONSIST: 157 patients, 16 weeks, glycine no different from placebo',
        laymanSummary:
          'The largest randomised trial of oral glycine for any condition tested it in schizophrenia. Across 157 patients over sixteen weeks it did nothing that placebo did not.',
        technicalDetails:
          'The Cognitive and Negative Symptoms in Schizophrenia Trial was a 16-week double-blind, double-dummy, parallel-group randomised trial of adjunctive glycine, D-cycloserine or placebo at four US sites and one in Israel, in 157 inpatients and outpatients meeting DSM-IV criteria for schizophrenia or schizoaffective disorder with moderate to severe negative symptoms. The primary outcomes were the average rate of change of Scale for the Assessment of Negative Symptoms total scores and change in average cognitive domain z-scores. There were no significant differences in SANS total score change between glycine and placebo, or between D-cycloserine and placebo. A prespecified test for the site-by-treatment-by-time interaction was significant in post hoc analysis, with one site showing greater SANS reduction on D-cycloserine — a single-site post hoc signal that is exactly what a null trial produces by chance. Why this matters to a supplement page: the trial was designed on the premise that oral glycine could raise brain glycine enough to change NMDA receptor function, using doses far above any supplement. It could not.',
        evidenceSource: 'Buchanan RW et al. Am J Psychiatry 2007;164:1593-1602',
        doi: '10.1176/appi.ajp.2007.06081358',
        measuredMetric:
          'Rate of change in SANS total score and change in average cognitive domain z-scores over 16 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'gly-a2',
        category: 'measured',
        title: 'The mechanism that survives is temperature, and it was measured in rats',
        laymanSummary:
          'Oral glycine in rats opened skin blood vessels and lowered core body temperature — the same drop that normally happens as you fall asleep. That is the proposed mechanism, and it is not sedation.',
        technicalDetails:
          'Bannai and Kawai report that oral administration of glycine to rats induced a significant increase in plasma and cerebrospinal fluid glycine concentrations and a significant decrease in core body temperature associated with an increase in cutaneous blood flow. Their stated interpretation is that "the decline in the core body temperature might be a mechanism underlying glycine\'s effect on sleep, as the onset of sleep is known to involve a decrease in the core body temperature," and that a low core temperature is maintained during sleep in humans. This is a coherent and testable hypothesis and it is markedly more honest than the sedative framing used in marketing. Two limits belong with it. The thermoregulatory measurements are in rats, not people. And the authors are associated with Ajinomoto, the amino acid manufacturer that also produced the human sleep trials, so mechanism and outcome come from the same source.',
        evidenceSource: 'Bannai M, Kawai N. J Pharmacol Sci 2012;118:145-148',
        doi: '10.1254/jphs.11r04fm',
        measuredMetric:
          'Core body temperature, cutaneous blood flow, and plasma and cerebrospinal fluid glycine concentration after oral glycine in rats',
        auditFlag: 'verified',
      },
      {
        id: 'gly-a3',
        category: 'inferred',
        title: 'The human sleep evidence is two small studies from one company',
        laymanSummary:
          'The claim that glycine improves sleep rests on a 2006 subjective study and a 2007 study with sleep recordings, both small, both from the same research group at an amino acid manufacturer.',
        technicalDetails:
          'Inagawa and colleagues reported subjective effects of glycine ingestion before bedtime on sleep quality in 2006; Yamadera and colleagues reported in 2007 that glycine ingestion improves subjective sleep quality in human volunteers, correlating with polysomnographic changes. Bannai and Kawai summarise the finding as glycine before bedtime "significantly ameliorated subjective sleep quality in individuals with insomniac tendencies." The structural problem is not that these are bad studies but that they are the whole evidence base: small samples, self-selected participants with sleep complaints rather than diagnosed insomnia, primary endpoints that are questionnaires, and common authorship with the manufacturer. Independent replication at scale has not happened. Glycine is also distinctly sweet, which makes placebo matching harder than it sounds and is rarely addressed. A claim can be true and still be unsupported; this one is currently in that state.',
        evidenceSource:
          'Yamadera W et al. Sleep Biol Rhythms 2007;5:126-131; Inagawa K et al. Sleep Biol Rhythms 2006;4:75-77',
        doi: '10.1111/j.1479-8425.2007.00262.x',
        inferredClaim:
          'That glycine is an established sleep aid, when the human evidence is two small studies sharing authorship with the ingredient manufacturer and has not been independently replicated at scale',
        auditFlag: 'caution',
      },
      {
        id: 'gly-a4',
        category: 'measured',
        title: 'Glycine at high systemic dose is genuinely toxic, and surgery proves it',
        laymanSummary:
          'Glycine 1.5% is an approved surgical irrigation fluid. When enough of it is absorbed during prostate surgery it causes a recognised syndrome with confusion, visual disturbance and seizures.',
        technicalDetails:
          'Glycine 1.5% irrigation solution holds multiple FDA approvals, including NDA 017865 and NDA 018315, as a prescription irrigant for transurethral surgery. Its recognised complication, transurethral resection syndrome, arises when irrigation fluid is absorbed through open prostatic venous sinuses, producing dilutional hyponatraemia together with effects attributed to glycine itself and to its metabolite ammonia: visual disturbance including transient blindness, nausea, confusion, and in severe cases seizures and coma. The relevance to a supplement page is a matter of principle rather than of risk at ordinary doses. "It is only an amino acid" is a claim about identity, not about dose. Glycine has a defined toxic syndrome at the systemic exposures a litre of absorbed irrigant produces, and the absence of that syndrome at 3 g orally is a statement about quantity, not about the molecule being inert.',
        evidenceSource:
          'Drugs@FDA — glycine 1.5% irrigation solution, NDA 017865 (Baxter Healthcare) and NDA 018315 (Otsuka ICU Medical)',
        measuredMetric:
          'Approved prescription status and recognised systemic toxicity of glycine as a surgical irrigant',
        auditFlag: 'verified',
      },
      {
        id: 'gly-a5',
        category: 'inferred',
        title: 'The NMDA site is already nearly full, which is why more glycine changes little',
        laymanSummary:
          'Glycine is required for the brain\'s main excitatory receptor to work, but that site is already close to saturated. Adding more glycine has little room to act — which is what the schizophrenia trial found.',
        technicalDetails:
          'The NMDA receptor glycine co-agonist site has sub-micromolar affinity and, at physiological cerebrospinal fluid glycine and D-serine concentrations, sits close to saturation in most brain regions. This is the pharmacological explanation for a pattern that recurs across the glycine literature: doses far above supplement levels, used specifically to raise brain glycine, fail to change NMDA-dependent outcomes. CONSIST is the clearest example, and it is why the field moved to glycine transporter type 1 inhibitors, which raise synaptic glycine locally rather than flooding the whole compartment. Any supplement claim that invokes NMDA modulation as its mechanism has to explain how a few grams orally achieves what a full clinical trial programme at higher doses did not.',
        evidenceSource: 'Buchanan RW et al. Am J Psychiatry 2007;164:1593-1602',
        doi: '10.1176/appi.ajp.2007.06081358',
        inferredClaim:
          'That oral glycine meaningfully modulates NMDA receptor function in the human brain',
        auditFlag: 'caution',
      },
      {
        id: 'gly-a6',
        category: 'conclusion_shift',
        title: 'Glycine stopped being called non-essential, and that is a real reclassification',
        laymanSummary:
          'Glycine was long listed as an amino acid the body makes enough of. The current view is that endogenous synthesis may not cover demand, particularly for collagen turnover.',
        technicalDetails:
          'Bannai and Kawai describe glycine as "a non-essential amino acid," the classification it carried for decades. That classification has been challenged on a straightforward accounting argument: collagen is roughly one-third glycine by residue, collagen turnover is continuous, and the endogenous synthetic capacity from serine via serine hydroxymethyltransferase has been estimated to fall short of the total requirement, making glycine conditionally indispensable. The argument is a calculation rather than a randomised finding, and it is contested. It matters here because it is the strongest available rationale for supplementation and because it points away from the sleep claim entirely: if glycine is conditionally limiting, the endpoint to look for is connective tissue and glutathione synthesis, not sleep latency. No adequately powered trial has tested that endpoint.',
        evidenceSource: 'Bannai M, Kawai N. J Pharmacol Sci 2012;118:145-148',
        doi: '10.1254/jphs.11r04fm',
        inferredClaim:
          'That because glycine is synthesised endogenously it cannot be limiting, or conversely that a conditional-indispensability argument establishes a clinical benefit',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed fast, into a pool the body already maintains',
        laymanDesc:
          'Glycine is the smallest amino acid and is absorbed quickly. It joins a free amino acid pool the body was already topping up on its own.',
        molecularDetail:
          'Absorption is by sodium-dependent amino acid transporters and, for glycine-containing peptides, PepT1. Bannai and Kawai measured a significant rise in both plasma and cerebrospinal fluid glycine after oral administration in rats. The complication for any dose-response claim is that glycine is synthesised endogenously from serine by serine hydroxymethyltransferase, so exogenous glycine adds to a variable existing supply.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Two receptors that do opposite things',
        laymanDesc:
          'In the spinal cord and brainstem glycine quietens neurons. Everywhere else it is a required partner for the brain\'s main excitatory receptor. Same molecule, opposite jobs.',
        molecularDetail:
          'Strychnine-sensitive glycine receptors are pentameric chloride channels mediating fast inhibition in brainstem and spinal cord. The NMDA receptor requires glycine or D-serine at an obligatory co-agonist site for channel opening. The NMDA site is near-saturated at physiological concentrations, which limits how much exogenous glycine can add — and is the most likely reason the CONSIST trial found nothing.',
        iconName: 'GitBranch',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Skin blood vessels open and body heat is dumped',
        laymanDesc:
          'The measured effect in animals is that glycine widens the blood vessels of the skin, so heat leaves the body and core temperature falls.',
        molecularDetail:
          'Bannai and Kawai measured a significant decrease in core body temperature associated with increased cutaneous blood flow after oral glycine in rats, and proposed an action in the suprachiasmatic nucleus. This is the only mechanistic chain in the glycine sleep literature with a direct physiological measurement behind it, and it explains the effect without invoking sedation at all.',
        iconName: 'Thermometer',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Falling core temperature is a sleep-onset signal',
        laymanDesc:
          'Your body normally cools before you fall asleep and stays cool while you are asleep. Producing that cooling earlier plausibly brings sleep forward.',
        molecularDetail:
          'The authors state the logic directly: sleep onset is known to involve a decrease in core body temperature, and a low core temperature is maintained during sleep in humans. The prediction this makes is testable and largely untested — a human trial should show core temperature and polysomnographic sleep latency moving together on the same nights, and no published study has reported that pairing.',
        iconName: 'Moon',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'What was measured in people was a questionnaire',
        laymanDesc:
          'The human outcome behind the claim is self-reported sleep quality in small groups of people who already felt they slept badly, in studies from the ingredient manufacturer.',
        molecularDetail:
          'Yamadera et al. reported improved subjective sleep quality correlating with polysomnographic changes; Inagawa et al. reported subjective effects of pre-bedtime glycine. Bannai and Kawai summarise it as amelioration of subjective sleep quality "in individuals with insomniac tendencies." Common authorship with Ajinomoto runs through the human trials and the mechanistic work alike.',
        iconName: 'ClipboardList',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CONSIST — adjunctive glycine and D-cycloserine in schizophrenia',
        phase: 'Randomised double-blind double-dummy parallel-group, 16 weeks',
        sampleSize: 157,
        primaryEndpoint:
          'Rate of change in SANS total score and change in average cognitive domain z-scores',
        endpointMet: false,
        statisticalPValue:
          'No significant difference between glycine and placebo on SANS total score change or cognition',
        unreportedAdverseSignals:
          'A prespecified site-by-treatment-by-time interaction reached significance in post hoc testing, with one site favouring D-cycloserine — the classic shape of a chance finding in a null trial. Doses were far above supplement levels, which is what makes the null result informative about brain penetration.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Yamadera 2007 — glycine before bedtime with polysomnography',
        phase: 'Small human trial with polysomnographic recording',
        sampleSize: 11,
        primaryEndpoint: 'Subjective sleep quality with correlated polysomnographic changes',
        endpointMet: true,
        statisticalPValue:
          'Improved subjective sleep quality reported as correlating with polysomnographic changes',
        unreportedAdverseSignals:
          'Small sample of volunteers with self-reported sleep complaints rather than diagnosed insomnia. Glycine is distinctly sweet, which complicates placebo matching. Authorship overlaps with the amino acid manufacturer that produced the rest of this literature.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Inagawa 2006 — subjective effects of glycine ingestion before bedtime',
        phase: 'Small human trial, subjective endpoints',
        sampleSize: 15,
        primaryEndpoint: 'Self-reported sleep quality after pre-bedtime glycine',
        endpointMet: true,
        statisticalPValue: 'Improvement in subjective sleep quality reported',
        unreportedAdverseSignals:
          'Entirely subjective endpoints with no objective sleep measurement, in a small self-selected sample.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Bannai 2012 — rat thermoregulatory mechanism study',
        phase: 'Preclinical mechanistic study in rats',
        sampleSize: 0,
        primaryEndpoint:
          'Core body temperature, cutaneous blood flow, and plasma and cerebrospinal fluid glycine after oral administration',
        endpointMet: true,
        statisticalPValue:
          'Significant increase in plasma and CSF glycine; significant decrease in core body temperature with increased cutaneous blood flow',
        unreportedAdverseSignals:
          'Rodent physiology. Sample size is recorded as zero because no human participants were enrolled. The thermoregulatory mechanism has not been measured alongside sleep architecture in people.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Oral glycine raised plasma and cerebrospinal fluid glycine and lowered core body temperature with increased cutaneous blood flow, in rats',
        'Glycine did not differ from placebo on negative symptoms or cognition across 157 patients over 16 weeks in CONSIST',
        'Glycine 1.5% is an approved surgical irrigant whose systemic absorption causes a recognised toxic syndrome',
        'Two small manufacturer-associated human studies reported improved subjective sleep quality before bedtime',
      ],
      unsupportedInferences: [
        'That glycine is a sedative — the proposed mechanism is thermoregulatory, not sedative',
        'That oral glycine meaningfully modulates NMDA receptor function, which a full trial at higher doses could not achieve',
        'That "it is just an amino acid" is a safety argument rather than a dose argument',
        'That the sleep claim is established, when the evidence is two small unreplicated studies from one source',
      ],
      whatFailedInitially: [
        'Oral glycine as an NMDA-targeting treatment in schizophrenia, null across 157 randomised patients',
        'The classification of glycine as straightforwardly non-essential, now argued to be conditionally indispensable',
      ],
      realWorldOutcome: [
        'The glycine sleep hypothesis is more interesting and more honest than its marketing, because it does not claim sedation',
        'It is also almost entirely single-source, small, and reliant on subjective endpoints',
        'Most people taking magnesium glycinate are taking substantial glycine without counting it',
      ],
    },
    deliverySystem: {
      type: 'Oral powder or capsule; also an approved 1.5% sterile irrigation solution by a completely different route',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. Glycine is highly water-soluble and distinctly sweet, which is why it appears as a flavour-masking excipient in other supplements and why blinding it in a trial is harder than it looks. Anyone taking magnesium bisglycinate is also taking glycine: two glycine molecules per magnesium, about 86 percent of the chelate\'s mass, which is rarely counted in a total.',
      safetyProfile:
        'At gram doses orally, generally well tolerated with mild gastrointestinal upset and its sweet taste the commonest complaints. The informative safety data come from the surgical route: systemic absorption of glycine 1.5% irrigant during transurethral resection produces dilutional hyponatraemia with visual disturbance including transient blindness, nausea, confusion and, in severe cases, seizures, with the ammonia metabolite implicated in the encephalopathy. No comparable syndrome occurs at supplement doses. The point is that glycine has a known toxic profile at sufficient systemic exposure, so its safety at 3 g is a dose fact rather than a property of the molecule.',
    },
    commonQuestions: [
      {
        q: 'Does glycine help you sleep?',
        a: 'Possibly, and the evidence is thinner than the confidence with which it is sold. Two small human studies, from 2006 and 2007, reported improved subjective sleep quality with 3 g before bedtime, one of them with correlated polysomnographic changes. Both share authorship with Ajinomoto, an amino acid manufacturer, as does the mechanistic review. There has been no large independent replication. The claim may well be true; it is currently not established.',
      },
      {
        q: 'How would it work, if it works?',
        a: 'Not by sedating you, which is the useful part of this story. In rats, oral glycine widened skin blood vessels, dumped heat and lowered core body temperature — the same physiological change that normally precedes sleep onset. The proposal is that glycine brings forward a signal your body sends anyway. That is testable, and the obvious test has not been published: a human study recording core temperature and sleep architecture on the same nights.',
        auditNote:
          'A warm bath produces the same post-heating temperature decline by an entirely non-pharmacological route.',
      },
      {
        q: 'I read that glycine acts on brain receptors. Does that make it powerful?',
        a: 'It acts on two receptors that do opposite things, and the more famous of the two is already nearly saturated. Glycine is a required co-agonist at the NMDA receptor, but at normal brain glycine concentrations that site is close to full, so adding more has little room to act. The clearest evidence is CONSIST: a 16-week randomised trial in 157 patients used doses far above any supplement specifically to raise brain glycine, and found no difference from placebo on negative symptoms or cognition.',
      },
      {
        q: 'Is it safe? It is just an amino acid.',
        a: 'At gram doses orally, yes, with mild stomach upset and sweetness the usual complaints. But "just an amino acid" is a claim about identity, not about dose. Glycine 1.5% is an FDA-approved surgical irrigation fluid, and when enough of it is absorbed during prostate surgery it produces a recognised syndrome of dilutional hyponatraemia with visual disturbance, confusion and sometimes seizures. Glycine has a toxic profile; you simply do not reach it by swallowing three grams.',
      },
      {
        q: 'Am I already taking glycine without realising?',
        a: 'Very likely, in two ways. Magnesium bisglycinate is about 86 percent glycine by mass — two glycine molecules per magnesium — so anyone taking that supplement is taking a substantial glycine dose that nobody counts. And glycine is roughly one residue in three of collagen, so collagen peptides, gelatin and bone broth are all concentrated glycine sources. Nothing about any of that is harmful; it just means the dose in a glycine tub is not the dose being taken.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Inagawa K et al. Subjective effects of glycine ingestion before bedtime on sleep quality. Sleep Biol Rhythms 2006;4:75-77',
        identifier: '10.1111/j.1479-8425.2006.00193.x',
        kind: 'doi',
      },
      {
        label:
          'Yamadera W et al. Glycine ingestion improves subjective sleep quality in human volunteers, correlating with polysomnographic changes. Sleep Biol Rhythms 2007;5:126-131',
        identifier: '10.1111/j.1479-8425.2007.00262.x',
        kind: 'doi',
      },
      {
        label:
          'Buchanan RW et al. The Cognitive and Negative Symptoms in Schizophrenia Trial (CONSIST): the efficacy of glutamatergic agents for negative symptoms and cognitive impairments. Am J Psychiatry 2007;164:1593-1602',
        identifier: '10.1176/appi.ajp.2007.06081358',
        kind: 'doi',
      },
      {
        label:
          'Bannai M, Kawai N. New therapeutic strategy for amino acid medicine: glycine improves the quality of sleep. J Pharmacol Sci 2012;118:145-148',
        identifier: '10.1254/jphs.11r04fm',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA — NDA 017865, aminoacetic acid (glycine) 1.5% irrigation solution, Baxter Healthcare',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=017865',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 750 — Glycine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/750',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Taurine — a genuine, curable deficiency disease in cats, a 2023 Science paper that made it an
  // anti-ageing product overnight, and two 2025 papers finding circulating taurine does not fall
  // with age in humans at all.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'taurine',
    name: 'Taurine',
    tradeName: '2-aminoethanesulfonic acid; the largest consumer route is energy drinks',
    sponsor:
      'No single sponsor — a sulphonic acid analogue of an amino acid, synthesised industrially from ethylene oxide and sodium bisulphite. It is not an amino acid in the protein-building sense and is not incorporated into any protein.',
    targetGene: 'CDO1',
    targetProtein:
      'Taurine has no receptor. Its established roles are as an osmolyte, as the conjugating partner in taurine-conjugated bile acids, and as the substrate for the mitochondrial tRNA modification 5-taurinomethyluridine, which is required for correct decoding of certain codons in mitochondrially encoded proteins. Human synthesis runs through cysteine dioxygenase (CDO1) and cysteine sulphinic acid decarboxylase, the latter of which is essentially absent in cats.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for energy, exercise performance, cardiovascular health and, since 2023, longevity. Not approved by the FDA or EMA for any of them. Taurine is a mandatory addition to infant formula and to cat food, both for genuine deficiency reasons, and those are the only settings where its necessity is established.',
    patientFriendlyIndication:
      'Taken in energy drinks and pre-workout formulas, and increasingly for anti-ageing',
    conditionContext: {
      conditionExplainer:
        'Taurine is unusual: it is abundant in tissue, is not built into proteins, and most mammals make their own. Cats cannot, because they lack the enzyme, and a cat fed a taurine-poor diet develops dilated cardiomyopathy and retinal degeneration that reverse on supplementation. That is a real deficiency disease with a real cure.',
      whyItMatters:
        'In June 2023 a Science paper reported that taurine declines with age across species and that supplementing it extended health span in mice and monkeys, and taurine became a longevity product within weeks. In 2025 two independent groups reported that circulating taurine does not decline with age in humans at all. This is the fastest complete reversal in this file, and it happened while the product was already on shelves.',
      whoTakesThis:
        'Energy drink consumers, who make up the overwhelming majority; athletes taking it for endurance; and a rapidly growing longevity market. Infants receive it in formula and cats in every commercial cat food, both by regulation.',
      clinicalGoals:
        'Studies measured left ventricular function in cats, circulating taurine concentration against chronological age in humans and primates, endurance time-to-exhaustion, and exercise time, metabolic equivalents and distance in a small heart failure trial.',
    },
    oneSentenceVerdict:
      'Taurine cures a real and fatal deficiency disease in cats and is genuinely required in infant formula, and a 2018 meta-analysis found a small endurance benefit (Hedges g 0.40) — but the anti-ageing claim that built the current market rests on a 2023 Science paper whose central human premise, that taurine falls with age, was contradicted in 2025 by longitudinal data from three human cohorts.',
    laymanHowItWorks:
      'Taurine is not built into proteins and does not act on a receptor. It does three quieter jobs: it helps cells manage their water balance, it is attached to bile acids so they can do their work in the gut, and it chemically modifies a piece of the machinery that mitochondria use to read their own genes. Most people make enough from cysteine. Cats cannot make it at all, which is why cat food is fortified and why a taurine-starved cat develops heart failure that supplementation reverses. The question that matters for a human supplement is whether anyone is actually short of it, and the recent human data say most people are not.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 39,
    anatomicalSite:
      'Highest concentrations in retina, skeletal and cardiac muscle, leukocytes and brain; conjugated to bile acids in hepatocytes',
    substitutes: {
      summary:
        'For a genuine deficiency — cats, some infants, long-term parenteral nutrition — taurine is not substitutable. For a healthy adult who synthesises it and eats meat or fish, the honest comparator is nothing, and the endurance effect is small enough that caffeine in the same energy drink is a more plausible explanation for how the drink feels.',
      conventionalRx: [
        {
          name: 'Taurine fortification of infant formula and cat food',
          class: 'Mandated nutrient addition',
          howItCompares:
            'The two settings where taurine\'s necessity is established rather than argued. Cats lack cysteine sulphinic acid decarboxylase and cannot synthesise it; human neonates have limited synthetic capacity. Both are fortification decisions made because deficiency produced disease.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: an unambiguous, mechanistically explained requirement with a documented disease when unmet. Cons: it is regularly cited as though it demonstrated something about a healthy adult, which it does not.',
        },
      ],
      naturalFoods: [
        {
          name: 'Shellfish, fish, and dark poultry meat',
          activeCompound: 'Taurine, at far higher concentrations than in plant foods',
          biologicalMechanism:
            'Taurine is concentrated in animal tissue and essentially absent from plants, so dietary intake tracks animal food consumption closely. Endogenous synthesis from cysteine covers the rest in adults, which is why no human dietary requirement has ever been set.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the meta-analysed endurance trials used 1 to 6 g per day, and a typical energy drink contains around 1 g.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Cysteine-containing protein, as the synthetic precursor',
          activeCompound: 'L-cysteine, converted through cysteine sulphinic acid to taurine',
          biologicalMechanism:
            'Cysteine dioxygenase and cysteine sulphinic acid decarboxylase convert cysteine to hypotaurine and then taurine. Adults with adequate sulphur amino acid intake synthesise taurine continuously, which is the reason no recommended intake exists and the reason the deficiency framing in the longevity marketing needs evidence it has not produced.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Ask whether the headline claim survived replication',
          action:
            'For taurine specifically, check the date. The claim that made it a longevity product is from 2023; the human data contradicting its central premise are from 2025.',
          patientImpact:
            'The 2023 Science paper reported that circulating taurine declines with age in mice, monkeys and humans. In 2025, a Science group measuring longitudinally in three geographically distinct human cohorts, plus nonhuman primates and mice, found taurine increased or was unchanged with age.',
          clinicalPrecaution:
            'A separate 2025 Aging Cell study in 137 men aged 20 to 93 found no association between circulating taurine and age, muscle mass, strength, physical performance or mitochondrial function.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(CS(=O)(=O)O)N',
      chemicalFormula: 'C2H7NO3S',
      molecularWeight:
        '125.15 g/mol. Note the sulphonic acid group where an amino acid would carry a carboxylic acid — this is why taurine cannot form a peptide bond and appears in no protein.',
      structureSource: {
        label: 'PubChem CID 1123 — Taurine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1123',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'tau-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, and separation from the compounds it is sold beside',
          description:
            'Taurine itself is a cheap, high-purity commodity and rarely misstated. The analytical problem is attribution: taurine is almost always consumed inside an energy drink alongside caffeine, glucuronolactone, B vitamins and sugar, and any effect attributed to it must first be separated from those. Quantify every co-ingredient in the actual product before running anything.',
          reagentsAndBuffer:
            'HPLC with pre-column o-phthalaldehyde derivatisation and fluorescence detection for taurine; parallel quantification of caffeine, D-glucurono-gamma-lactone, niacin, pyridoxine and total sugars; hypotaurine reference standard to detect incomplete oxidation in the raw material',
        },
        {
          id: 'tau-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the labelled tracer for a tissue-loading study',
          description:
            'Plasma taurine is a poor proxy for tissue taurine, which is where every proposed mechanism operates and which is held at concentrations orders of magnitude higher. A labelled tracer is the only way to distinguish administered taurine from the very large resident pool, and this distinction is exactly what the ageing-biomarker dispute turns on.',
          dependsOnStepId: 'tau-w1',
          reagentsAndBuffer:
            '1,2-13C2-taurine or 15N-taurine; sterile preparation for oral and intravenous arms; isotope-ratio confirmation by LC-MS/MS; baseline natural-abundance measurement in plasma and, where available, muscle',
        },
        {
          id: 'tau-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Muscle biopsy extraction with the bile acid conjugates separated out',
          description:
            'Total taurine in a tissue extract includes free taurine, taurine-conjugated bile acids and taurinomethyluridine-modified tRNA, and these are three different biological quantities. Reporting them together is how a taurine measurement becomes uninterpretable, and it is a plausible contributor to the disagreement between the 2023 and 2025 human datasets.',
          dependsOnStepId: 'tau-w2',
          reagentsAndBuffer:
            'Freeze-dried vastus lateralis biopsy; perchloric acid extraction with neutralisation; solid-phase extraction to separate free taurine from taurocholate and taurochenodeoxycholate; tRNA isolation and nucleoside digestion for LC-MS/MS quantification of 5-taurinomethyluridine',
        },
        {
          id: 'tau-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Mitochondrial translation readout in taurine-depleted cells',
          description:
            'Test the one mechanism with a defined molecular target. Deplete cells of taurine by inhibiting the taurine transporter, measure loss of the tRNA taurine modification, and see whether mitochondrially encoded protein synthesis and respiration fail — and whether repletion restores them. An effect that only appears after depletion is a deficiency effect, not a supplement effect.',
          dependsOnStepId: 'tau-w3',
          reagentsAndBuffer:
            'Human myotubes or fibroblasts; beta-alanine as a competitive taurine transporter inhibitor; SLC6A6 knockdown as the genetic control; 5-taurinomethyluridine quantification by LC-MS/MS; 35S-methionine mitochondrial translation assay with cytoplasmic translation blocked by emetine; Seahorse oxygen consumption measurement',
        },
        {
          id: 'tau-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Longitudinal taurine against age, in the same people repeatedly',
          description:
            'This is the step that decided the ageing question and it is worth stating as a method. Cross-sectional sampling compares different people at different ages and confounds age with cohort. Longitudinal sampling measures the same individuals repeatedly. The 2025 Science analysis did both, in three geographically distinct human cohorts plus primates and mice, and found taurine increased or was unchanged with age.',
          dependsOnStepId: 'tau-w4',
          reagentsAndBuffer:
            'Repeat plasma sampling from an established longitudinal ageing cohort; identical assay platform and lot across timepoints; batch-randomised sample ordering with blinded age; parallel cross-sectional cohort for direct comparison; grip strength, gait speed and body composition measured at each visit',
        },
      ],
    },
    keyAudits: [
      {
        id: 'tau-a1',
        category: 'measured',
        title: 'The cat cardiomyopathy result is real, and it is a deficiency disease',
        laymanSummary:
          'Cats fed too little taurine develop heart failure. Giving them taurine restores normal heart function. This is the strongest taurine finding in existence, and it is about a species that cannot make it.',
        technicalDetails:
          'Pion and colleagues reported in Science that low plasma taurine concentrations with echocardiographic evidence of myocardial failure were observed in 21 cats fed commercial cat foods and in 2 of 11 cats fed a purified diet containing marginally low taurine for four years. Oral taurine supplementation raised plasma taurine and was associated with normalisation of left ventricular function in both groups. Because myocardial taurine concentration is directly related to plasma concentration, the authors proposed a direct link between myocardial taurine depletion and reduced mechanical function. The finding changed commercial cat food formulation worldwide and effectively eliminated taurine-deficiency cardiomyopathy in cats. It is also a textbook deficiency result in an obligate carnivore that lacks cysteine sulphinic acid decarboxylase and therefore cannot synthesise taurine at all. Humans can. Citing this study in support of a human supplement is the exact error this file exists to name: a deficiency effect is not a supplement effect.',
        evidenceSource: 'Pion PD, Kittleson MD, Rogers QR, Morris JG. Science 1987;237:764-768',
        doi: '10.1126/science.3616607',
        measuredMetric:
          'Plasma taurine concentration and echocardiographic left ventricular function before and after supplementation in cats',
        auditFlag: 'verified',
      },
      {
        id: 'tau-a2',
        category: 'conclusion_shift',
        title: 'The 2023 ageing claim, and the 2025 human data that contradicted its premise',
        laymanSummary:
          'A 2023 Science paper said taurine falls with age and that replacing it extended healthy life in mice and monkeys. In 2025, measuring the same people repeatedly over time, another Science group found taurine goes up or stays flat with age in humans.',
        technicalDetails:
          'Singh et al. reported in Science in 2023 that circulating taurine declines with age in mice, monkeys and humans, that supplementation increased health span in mice and monkeys and life span in mice, and that mechanistically taurine reduced cellular senescence, protected against telomerase deficiency, suppressed mitochondrial dysfunction, decreased DNA damage and attenuated inflammaging. They concluded that "taurine deficiency may be a driver of aging" and that clinical trials in humans "seem warranted." In 2025 a Science report titled "Is taurine an aging biomarker?" found that circulating taurine concentrations increased or remained unchanged with age in three geographically distinct human cohorts as well as in nonhuman primates and mice, measured both longitudinally and cross-sectionally, with considerable variability in associations between taurine and age-related outcomes for gross motor function and energy homeostasis. Their conclusion: changes in circulating taurine "are not a universal feature of aging." Independently, an Aging Cell study of 137 physically inactive and physically active men aged 20 to 93 found no association between circulating taurine and age, muscle mass, strength, physical performance or mitochondrial function. The animal intervention results in the 2023 paper are not overturned by any of this. The human premise on which the product was sold is.',
        evidenceSource:
          'Singh P et al. Science 2023;380:eabn9257; Fernandez et al. Science 2025 (Is taurine an aging biomarker?); Aging Cell 2025;24:e70191',
        doi: '10.1126/science.adl2116',
        measuredMetric:
          'Circulating taurine concentration against chronological age, measured longitudinally and cross-sectionally in human, primate and mouse cohorts',
        inferredClaim:
          'That circulating taurine declines with age in humans, and that supplementing it therefore addresses a deficiency',
        auditFlag: 'contested',
      },
      {
        id: 'tau-a3',
        category: 'measured',
        title: 'The endurance effect is real and small, and dose did not matter',
        laymanSummary:
          'Pooling ten trials, taurine produced a small improvement in endurance performance. Taking more of it, or taking it for longer, did not make the effect bigger.',
        technicalDetails:
          'Waldron and colleagues meta-analysed ten peer-reviewed studies of isolated oral taurine and endurance performance, with a sub-analysis of seven time-to-exhaustion trials, using doses from 1 to 6 g per day given acutely or for up to two weeks. Taurine improved overall endurance performance with a Hedges g of 0.40 (95% CI 0.12 to 0.67, P = 0.004), and similarly in time-to-exhaustion trials (g 0.43, 95% CI 0.12 to 0.75, P = 0.007). Meta-regression found no difference between acute and chronic supplementation for the full sample (P = 0.897) or the time-to-exhaustion group (P = 0.896), and the dose did not moderate the effect (P > 0.05). A small positive effect with no dose-response and no time-course is an uncomfortable combination: a genuine pharmacological effect would usually show at least one of the two. Ten studies is also a small evidence base for a meta-analysis, and the isolated-taurine requirement excludes the way almost everyone actually consumes it, which is alongside caffeine and sugar.',
        evidenceSource: 'Waldron M, Patterson SD, Tallent J, Jeffries O. Sports Med 2018;48:1247-1253',
        doi: '10.1007/s40279-018-0896-2',
        measuredMetric:
          'Hedges g for endurance performance and time to exhaustion, with dose and duration as meta-regression moderators',
        auditFlag: 'verified',
      },
      {
        id: 'tau-a4',
        category: 'inferred',
        title: 'The energy drink attribution problem: caffeine is in the same can',
        laymanSummary:
          'Almost all taurine consumed comes in energy drinks, where it sits alongside caffeine and sugar. Nothing in that experience can be attributed to the taurine.',
        technicalDetails:
          'EFSA examined the use of taurine and D-glucurono-gamma-lactone as constituents of so-called energy drinks and published a scientific opinion on their safety in 2009. The scientific point for a reader is one of attribution rather than toxicity: a typical energy drink contains roughly a gram of taurine alongside caffeine at a dose with a large, replicated, independently established effect on alertness and performance. Any subjective effect from the can is therefore attributable to a compound that is already known to produce it. The taurine meta-analysis deliberately restricted itself to isolated taurine for exactly this reason, and found a small effect with no dose-response. Marketing that describes taurine as the "energy" component of an energy drink is assigning to the ingredient with weak evidence a result produced by the ingredient with strong evidence.',
        evidenceSource:
          'EFSA Panel on Food Additives and Nutrient Sources. The use of taurine and D-glucurono-gamma-lactone as constituents of the so-called energy drinks. EFSA Journal 2009;7(2):935',
        doi: '10.2903/j.efsa.2009.935',
        inferredClaim:
          'That taurine is responsible for the stimulant effect of an energy drink that also contains a substantial caffeine dose',
        auditFlag: 'caution',
      },
      {
        id: 'tau-a5',
        category: 'inferred',
        title: 'The heart failure trial is 29 patients, two weeks, and single-blind',
        laymanSummary:
          'The human cardiac evidence most often cited is a two-week trial in 29 heart failure patients in which only the participants, not the investigators, were blinded.',
        technicalDetails:
          'Beyranvand and colleagues ran a randomised single-blind placebo-controlled trial in 29 patients with heart failure, left ventricular ejection fraction below 50% and NYHA class II or III, giving 15 patients taurine 500 mg three times daily and 14 patients placebo for two weeks, with exercise tolerance testing before and after. Mean age was 60.57 +/- 6.54 years, 26 of 29 were male, and mean ejection fraction was 29.27 +/- 6.97%. Exercise time, metabolic equivalents and exercise distance all increased significantly within the taurine group (P < 0.0001 for all) and did not increase significantly in the placebo group. The design limits are severe: 29 patients, two weeks, single-blind, and a within-group significance framing rather than a between-group comparison of change. That last point matters most — a within-group P value in a 15-patient arm on a learning-affected exercise test is close to uninformative. This trial is nonetheless routinely cited as evidence that taurine helps the failing human heart.',
        evidenceSource: 'Beyranvand MR et al. J Cardiol 2011;57:333-337',
        doi: '10.1016/j.jjcc.2011.01.007',
        inferredClaim:
          'That taurine improves cardiac function in humans, on the basis of within-group changes in a 29-patient single-blind two-week trial',
        auditFlag: 'caution',
      },
      {
        id: 'tau-a6',
        category: 'measured',
        title: 'The one mechanism with a molecular target: mitochondrial tRNA modification',
        laymanSummary:
          'Taurine chemically modifies part of the machinery mitochondria use to read their own genes. Without that modification, certain mitochondrial proteins are built wrong.',
        technicalDetails:
          'Taurine is the substrate for 5-taurinomethyluridine, a modification at the wobble position of specific mitochondrial transfer RNAs that is required for accurate decoding of the codons those tRNAs read. Loss of the modification impairs synthesis of mitochondrially encoded respiratory chain subunits, and it is the accepted molecular basis of the mitochondrial disease MELAS, where the underlying mutation prevents the modification from being installed. This is by a wide margin the best-defined thing taurine does, and it is the mechanism the 2023 ageing paper leaned on when it reported that taurine "suppressed mitochondrial dysfunction". The gap to a supplement claim is the same one that recurs throughout this file: the modification requires taurine to be present, not abundant, and no evidence establishes that a replete adult\'s mitochondrial tRNAs are under-modified or that adding taurine modifies them further.',
        evidenceSource: 'Singh P et al. Science 2023;380:eabn9257',
        doi: '10.1126/science.abn9257',
        measuredMetric:
          'Presence of the 5-taurinomethyluridine modification on mitochondrial tRNA and consequent mitochondrial translation fidelity',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Most people make their own; cats cannot',
        laymanDesc:
          'Humans build taurine from a sulphur-containing amino acid. Cats lack the enzyme entirely, which is why cat food is fortified and human food is not.',
        molecularDetail:
          'Cysteine dioxygenase (CDO1) oxidises cysteine to cysteine sulphinic acid, which cysteine sulphinic acid decarboxylase converts toward hypotaurine and then taurine. Feline activity of the decarboxylase is negligible, making taurine dietarily essential for cats. No human recommended intake exists because adult synthesis plus animal-food intake covers requirement, which is precisely why a human deficiency claim needs evidence rather than analogy.',
        iconName: 'Dna',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A dedicated transporter concentrates it inside cells',
        laymanDesc:
          'Taurine is pumped into cells and held at levels far above the blood, where it helps the cell manage its water balance.',
        molecularDetail:
          'SLC6A6, the sodium- and chloride-dependent taurine transporter, concentrates taurine intracellularly by one to two orders of magnitude, with the highest tissue concentrations in retina, cardiac and skeletal muscle, leukocytes and brain. Beta-alanine competes for the same transporter, which is why chronic beta-alanine supplementation lowers muscle taurine — a genuine interaction between two products often sold together.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'It modifies mitochondrial tRNA so genes are read correctly',
        laymanDesc:
          'Taurine is chemically attached to a piece of the mitochondrial reading machinery. Without it, some mitochondrial proteins get built with the wrong amino acids.',
        molecularDetail:
          '5-taurinomethyluridine at the wobble position of specific mitochondrial tRNAs is required for accurate codon decoding; its absence underlies the translation defect in MELAS. This is the only taurine function with a defined molecular target and a defined disease when it fails, and it is a presence requirement rather than an abundance requirement.',
        iconName: 'Cpu',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'It conjugates bile acids and buffers cell volume',
        laymanDesc:
          'Taurine is stuck onto bile acids so they stay soluble in the gut, and inside cells it acts as ballast that keeps water balance stable.',
        molecularDetail:
          'Bile acid-CoA:amino acid N-acyltransferase conjugates taurine to cholic and chenodeoxycholic acid, giving taurocholate and taurochenodeoxycholate. Separately, taurine is one of the principal organic osmolytes in mammalian cells, released or accumulated in response to volume change. Neither function has been shown to be limiting in a healthy adult.',
        iconName: 'Droplets',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The human outcome data are small and now contradictory',
        laymanDesc:
          'Endurance improved slightly across ten trials, with no dose-response. The ageing claim rested on taurine falling with age, and in humans measured over time, it does not.',
        molecularDetail:
          'Waldron et al. found Hedges g 0.40 for endurance with no moderation by dose or duration. The 2025 Science analysis found circulating taurine increased or was unchanged with age across three human cohorts, primates and mice, measured longitudinally and cross-sectionally, and the Aging Cell study found no association with age, muscle mass, strength, performance or mitochondrial function in 137 men aged 20 to 93.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Pion 1987 — taurine depletion and myocardial failure in cats',
        phase: 'Controlled feline feeding study with echocardiography and supplementation',
        sampleSize: 32,
        primaryEndpoint:
          'Left ventricular function on echocardiography against plasma taurine, before and after supplementation',
        endpointMet: true,
        statisticalPValue:
          'Low plasma taurine with echocardiographic myocardial failure in 21 cats on commercial food and 2 of 11 on a marginally low purified diet; left ventricular function normalised on supplementation',
        unreportedAdverseSignals:
          'A study in an obligate carnivore that cannot synthesise taurine. It establishes a deficiency disease and its cure, and says nothing about a species that makes its own.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Waldron 2018 meta-analysis of oral taurine and endurance performance',
        phase: 'Meta-analysis of 10 peer-reviewed studies with a 7-trial time-to-exhaustion sub-analysis',
        sampleSize: 10,
        primaryEndpoint: 'Effect of isolated oral taurine on endurance performance',
        endpointMet: true,
        statisticalPValue:
          'Hedges g 0.40 (95% CI 0.12 to 0.67), P = 0.004; time-to-exhaustion g 0.43 (95% CI 0.12 to 0.75), P = 0.007',
        unreportedAdverseSignals:
          'No moderation by dose (P > 0.05) or by acute versus chronic supplementation (P = 0.897) — a positive effect with neither a dose-response nor a time-course. Sample size counts studies, not participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Singh 2023 — taurine deficiency as a driver of aging',
        phase: 'Multi-species intervention and observational study in mice, monkeys, worms and humans',
        sampleSize: 0,
        primaryEndpoint: 'Health span and life span after taurine supplementation, and taurine against age',
        endpointMet: true,
        statisticalPValue:
          'Increased health span in mice and monkeys and life span in mice and worms; circulating taurine reported to decline with age across species',
        unreportedAdverseSignals:
          'The human component was observational and correlational. Sample size is recorded as zero because no human intervention was performed. The authors themselves wrote that clinical trials in humans "seem warranted", which the market treated as though they had already been run.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Science 2025 — Is taurine an aging biomarker?',
        phase: 'Longitudinal and cross-sectional cohort analysis in humans, nonhuman primates and mice',
        sampleSize: 0,
        primaryEndpoint: 'Circulating taurine concentration against chronological age',
        endpointMet: false,
        statisticalPValue:
          'Taurine increased or remained unchanged with age in three geographically distinct human cohorts, in nonhuman primates and in mice, measured both longitudinally and cross-sectionally',
        unreportedAdverseSignals:
          'Considerable variability was found in associations between taurine and age-related outcomes for gross motor function and energy homeostasis. Sample size recorded as zero because this was cohort analysis rather than an enrolled trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Beyranvand 2011 — taurine and exercise capacity in heart failure',
        phase: 'Randomised single-blind placebo-controlled, two weeks',
        sampleSize: 29,
        primaryEndpoint: 'Exercise time, metabolic equivalents and exercise distance on exercise tolerance testing',
        endpointMet: true,
        statisticalPValue:
          'Within-group increases in exercise time, METs and distance on taurine, P < 0.0001 for all; no significant increase within the placebo group',
        unreportedAdverseSignals:
          'Single-blind, 29 patients, two weeks, and reported as within-group changes rather than a between-group comparison of change — the weakest analytic framing for an exercise test subject to learning effects.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Taurine depletion causes reversible dilated cardiomyopathy in cats, which cannot synthesise it',
        'Isolated oral taurine improved endurance performance with Hedges g 0.40, without any dose or duration response',
        'Circulating taurine increased or was unchanged with age in three human cohorts, primates and mice measured longitudinally',
        'No association was found between circulating taurine and age, muscle mass, strength, performance or mitochondrial function in 137 men aged 20 to 93',
        'Taurine is required for the 5-taurinomethyluridine modification of mitochondrial tRNA',
      ],
      unsupportedInferences: [
        'That taurine declines with age in humans, which longitudinal data contradict',
        'That the cat cardiomyopathy result implies anything about a human who synthesises taurine',
        'That taurine is responsible for the effect of an energy drink that also contains caffeine',
        'That within-group improvements in a 29-patient single-blind trial establish a cardiac benefit',
      ],
      whatFailedInitially: [
        'The human premise of the 2023 ageing paper, contradicted by two independent 2025 datasets',
        'Any dose-response for the endurance effect, which meta-regression found absent in both dose and duration',
      ],
      realWorldOutcome: [
        'Taurine is genuinely essential in cats and in infant formula, and those requirements are settled science',
        'The 2023 animal health-span results stand; the human deficiency framing built on top of them does not',
        'Almost all taurine consumed arrives in a can that also contains the compound with the real stimulant evidence',
      ],
    },
    deliverySystem: {
      type: 'Oral powder or capsule; overwhelmingly consumed as an energy drink ingredient',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, and used as a food ingredient in energy drinks at roughly a gram per serving. Taurine is a cheap, high-purity commodity and content misstatement is rare. The relevant delivery problem is not purity but company: it is nearly always consumed alongside caffeine and sugar, which makes consumer attribution of any effect to taurine unreliable. Because beta-alanine competes with taurine for the SLC6A6 transporter, chronic beta-alanine use lowers muscle taurine — a genuine interaction between two supplements frequently sold in the same pre-workout formula.',
      safetyProfile:
        'Well tolerated at gram doses with no consistent adverse effect pattern in the trial literature, and EFSA has examined its use in energy drinks. The realistic hazards are contextual rather than intrinsic: energy drinks deliver taurine with substantial caffeine and sugar, and the adverse events attributed to those drinks are consistent with caffeine. Long-term safety of gram-scale daily taurine taken for longevity purposes over years has not been studied, which matters now that it is being sold on a premise that human data do not support.',
    },
    commonQuestions: [
      {
        q: 'Does taurine slow ageing?',
        a: 'The claim is currently in retreat. A 2023 Science paper reported that taurine declines with age in mice, monkeys and humans and that supplementation extended health span in mice and monkeys, and taurine became a longevity product within weeks. In 2025 a Science analysis measuring the same individuals repeatedly across three human cohorts, plus primates and mice, found taurine increased or stayed the same with age. A separate 2025 study in 137 men aged 20 to 93 found no association between taurine and age, muscle mass, strength, performance or mitochondrial function. The animal intervention data are not overturned; the human deficiency premise is.',
        auditNote:
          'The 2023 authors wrote that human clinical trials "seem warranted". The market treated that as though the trials had been done.',
      },
      {
        q: 'But taurine deficiency causes heart failure — I read the cat study.',
        a: 'It does, in cats, and that study is excellent. Cats lack the enzyme that converts cysteine toward taurine and cannot make any of their own, so a taurine-poor diet depletes them and produces dilated cardiomyopathy that supplementation reverses. Humans have that enzyme and synthesise taurine continuously, which is why no human dietary requirement has ever been set. A deficiency effect in a species that cannot synthesise a nutrient tells you nothing about supplementing a species that can.',
      },
      {
        q: 'Is the taurine in my energy drink doing anything?',
        a: 'Nothing you could distinguish from the caffeine sitting beside it. A typical can has around a gram of taurine and a caffeine dose with a large, replicated, independently established effect on alertness and performance. The taurine meta-analysis deliberately excluded combination products for exactly this reason and, in isolated form, found a small endurance effect with no dose-response and no difference between a single dose and two weeks of dosing.',
      },
      {
        q: 'Does it help exercise performance at all?',
        a: 'A little, on the pooled evidence. Ten trials gave an overall endurance effect size of 0.40, which is small but statistically clear. The awkward detail is that neither the dose, from 1 to 6 grams, nor the duration, from a single dose to two weeks, changed the size of the effect. A genuine pharmacological effect normally shows a response to at least one of those, and this one shows neither.',
      },
      {
        q: 'Should I take it with beta-alanine?',
        a: 'Be aware they compete. Beta-alanine and taurine use the same transporter, SLC6A6, to enter cells, so chronic beta-alanine supplementation lowers muscle taurine. This is a real, mechanistically established interaction between two ingredients routinely combined in the same pre-workout formula, and it is not usually mentioned on the label.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Pion PD, Kittleson MD, Rogers QR, Morris JG. Myocardial failure in cats associated with low plasma taurine: a reversible cardiomyopathy. Science 1987;237:764-768',
        identifier: '10.1126/science.3616607',
        kind: 'doi',
      },
      {
        label:
          'EFSA Panel on Food Additives and Nutrient Sources Added to Food. The use of taurine and D-glucurono-gamma-lactone as constituents of the so-called energy drinks. EFSA Journal 2009;7(2):935',
        identifier: '10.2903/j.efsa.2009.935',
        kind: 'doi',
      },
      {
        label:
          'Beyranvand MR et al. Effect of taurine supplementation on exercise capacity of patients with heart failure. J Cardiol 2011;57:333-337',
        identifier: '10.1016/j.jjcc.2011.01.007',
        kind: 'doi',
      },
      {
        label:
          'Waldron M, Patterson SD, Tallent J, Jeffries O. The effects of an oral taurine dose and supplementation period on endurance exercise performance in humans: a meta-analysis. Sports Med 2018;48:1247-1253',
        identifier: '10.1007/s40279-018-0896-2',
        kind: 'doi',
      },
      {
        label: 'Singh P et al. Taurine deficiency as a driver of aging. Science 2023;380:eabn9257',
        identifier: '10.1126/science.abn9257',
        kind: 'doi',
      },
      {
        label: 'Is taurine an aging biomarker? Science 2025',
        identifier: '10.1126/science.adl2116',
        kind: 'doi',
      },
      {
        label:
          'Experimental evidence against taurine deficiency as a driver of aging in humans. Aging Cell 2025;24:e70191',
        identifier: '10.1111/acel.70191',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 1123 — Taurine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/1123',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Beta-alanine — a supplement whose mechanism was measured in muscle biopsies, whose effect is
  // real and confined to a two-minute window, whose pooled effect size is 0.18, and whose one
  // reported side effect is the tingling people mistake for the product working.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'beta-alanine',
    name: 'Beta-alanine',
    tradeName: 'Branded as CarnoSyn; also sold as sustained-release beta-alanine',
    sponsor:
      'No single sponsor — a non-proteinogenic beta-amino acid. Natural Alternatives International holds the CarnoSyn patents and appears in much of the trial literature.',
    targetGene: 'CARNS1',
    targetProtein:
      'Carnosine synthase 1 (CARNS1), which joins beta-alanine to histidine to form carnosine. Beta-alanine is the rate-limiting substrate: muscle histidine is abundant, muscle beta-alanine is not, so how much carnosine a muscle holds is set by how much beta-alanine reaches it. Carnosine then acts as an intracellular proton buffer.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as an ergogenic aid for high-intensity exercise, and as a near-universal ingredient in pre-workout formulas. Not approved by the FDA or EMA for any indication.',
    patientFriendlyIndication:
      'Taken before training for high-intensity work, and for the tingling in pre-workout drinks',
    conditionContext: {
      conditionExplainer:
        'Hard exercise lasting a minute or two floods the muscle cell with protons, and falling intracellular pH is one of the things that makes the muscle stop. Carnosine is a dipeptide that soaks up those protons. How much of it a muscle contains is limited by the supply of one of its two building blocks.',
      whyItMatters:
        'This is one of the few supplements where the mechanism was demonstrated directly in human muscle biopsies before the performance claims were made, and where the performance data then landed exactly where the mechanism predicted — in efforts lasting roughly one to four minutes and nowhere else. It is also the compound responsible for the tingling in pre-workout drinks, which is a side effect that a great many consumers have been trained to read as evidence of efficacy.',
      whoTakesThis:
        'Athletes in events lasting one to four minutes — middle-distance running, rowing, swimming, combat sports — and a much larger population taking it inside multi-ingredient pre-workout formulas without knowing it is there.',
      clinicalGoals:
        'Trials measured muscle carnosine concentration by biopsy and by magnetic resonance spectroscopy, time to exhaustion, total work done, and performance in open-end-point tasks and time trials stratified by duration.',
    },
    oneSentenceVerdict:
      'Four weeks of supplementation raises muscle carnosine by 40 to 65 percent on biopsy, and the performance benefit appears exactly where the buffering mechanism predicts — improved in exercise of 60 to 240 seconds, absent below 60 seconds — with a pooled effect size across 40 studies and 1,461 participants of 0.18, and paraesthesia as the only reported side effect.',
    laymanHowItWorks:
      'Muscle contains a small molecule called carnosine that mops up the acid produced during hard efforts. Carnosine is made from two building blocks, and only one of them is in short supply: beta-alanine. Take beta-alanine for a few weeks and muscle carnosine rises measurably, so the muscle can absorb more acid before it stops working. That extra buffering only matters in efforts long enough to build up serious acidity but short enough that acidity is the limiting factor — which turns out to be roughly one to four minutes. Below a minute the muscle runs out of immediate fuel first; well beyond four minutes something else limits you.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 72,
    anatomicalSite:
      'Skeletal muscle cytosol, with the highest carnosine concentrations in type II fast-twitch fibres',
    substitutes: {
      summary:
        'For raising muscle carnosine, beta-alanine has no substitute at practical intakes: dietary carnosine from meat is hydrolysed in the circulation by serum carnosinase before reaching muscle. For the performance goal itself, sodium bicarbonate buffers extracellularly by a different route over a similar duration window.',
      conventionalRx: [
        {
          name: 'Sodium bicarbonate',
          class: 'Extracellular buffering agent',
          howItCompares:
            'Buffers the blood rather than the muscle cell, raising the gradient for proton efflux, and its performance window overlaps beta-alanine\'s one-to-four-minute range. The two act on opposite sides of the sarcolemma and are frequently studied together for that reason.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: acts acutely rather than requiring weeks of loading. Cons: gastrointestinal distress is common and severe enough to be performance-limiting in its own right.',
        },
      ],
      naturalFoods: [
        {
          name: 'Beef, pork and poultry, as the natural carnosine source',
          activeCompound: 'Carnosine and anserine, the histidine-containing dipeptides',
          biologicalMechanism:
            'Harris et al. tested this directly. Beta-alanine appeared in plasma after histidine dipeptides given in chicken broth, but carnosine itself was not detected in plasma, with only traces in urine — because serum carnosinase hydrolyses circulating carnosine almost immediately. Dietary carnosine therefore reaches muscle as its component amino acids, not as carnosine.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the biopsy study used 3.2 and 6.4 g/day of beta-alanine for four weeks, and the ISSN position stand describes 4 to 6 g daily for at least two to four weeks.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'A vegetarian diet, as the low-carnosine case',
          activeCompound: 'Near-absent dietary beta-alanine and carnosine',
          biologicalMechanism:
            'Plant foods contain essentially no carnosine or free beta-alanine, so vegetarians start with lower muscle carnosine. This produces the same responder pattern seen with creatine: the largest gains occur in those who began lowest, which is a repletion effect rather than a supraphysiological one.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'The tingling is a side effect, not a signal',
          action:
            'Paraesthesia after a pre-workout drink is beta-alanine acting on sensory neurons, and it has no relationship to how much carnosine your muscle is accumulating.',
          patientImpact:
            'The ISSN position stand records paraesthesia as the only reported side effect and states it can be attenuated by using divided lower doses of 1.6 g or a sustained-release formula — both of which reduce the tingling while leaving the carnosine loading intact.',
          clinicalPrecaution:
            'A formulation optimised to produce a sensation is optimised for the wrong endpoint, and a great many pre-workout products are.',
        },
        {
          name: 'Check the event duration before expecting anything',
          action:
            'Match the exercise to the mechanism. Beta-alanine buffers protons, so it can only help where proton accumulation is what stops you.',
          patientImpact:
            'In the pooled analysis, exercise lasting 60 to 240 seconds improved (P = 0.001) and exercise over 240 seconds improved (P = 0.046), while exercise lasting under 60 seconds showed no benefit at all (P = 0.312).',
          clinicalPrecaution:
            'A single maximal lift, a short sprint or a one-rep effort falls in the window where the meta-analysis found nothing.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(CN)C(=O)O',
      chemicalFormula: 'C3H7NO2',
      molecularWeight:
        '89.09 g/mol. The amino group sits on the beta carbon rather than the alpha carbon, which is why beta-alanine cannot be incorporated into any protein and is instead a dedicated substrate for carnosine synthesis.',
      structureSource: {
        label: 'PubChem CID 239 — Beta-alanine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/239',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ba-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Beta versus alpha isomer discrimination and pre-workout co-ingredient panel',
          description:
            'Alpha-alanine is a cheap proteinogenic amino acid that shares beta-alanine\'s formula and molecular weight and is invisible to a total-amino-acid assay. It is also biologically useless for carnosine synthesis. Because beta-alanine is overwhelmingly sold inside multi-ingredient pre-workout blends, the co-ingredient panel matters as much as the identity test.',
          reagentsAndBuffer:
            'HPLC with pre-column derivatisation resolving beta-alanine from L-alanine against both reference standards; 1H NMR for unambiguous isomer confirmation; LC-MS/MS screen for undeclared stimulants in blended products; total caffeine quantification including from botanical sources',
        },
        {
          id: 'ba-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the labelled tracer and carnosine standard',
          description:
            'Muscle already contains carnosine, so measuring newly synthesised carnosine against the existing pool requires a labelled precursor. A pure carnosine standard is separately needed because the quantification is of a dipeptide, not of the amino acid administered.',
          dependsOnStepId: 'ba-w1',
          reagentsAndBuffer:
            '13C3-beta-alanine tracer; synthetic L-carnosine and L-anserine reference standards; isotopic purity confirmation by LC-MS/MS; deuterated carnosine as internal standard for the biopsy assay',
        },
        {
          id: 'ba-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Muscle biopsy extraction with fibre-type separation',
          description:
            'Carnosine is concentrated in type II fibres, so a whole-muscle number averages across a heterogeneous tissue and can hide both the effect and the between-subject variation. Separating fibre types converts a mean into a mechanism, and is what distinguishes a biopsy study from a scan.',
          dependsOnStepId: 'ba-w2',
          reagentsAndBuffer:
            'Freeze-dried vastus lateralis biopsy dissected free of blood and connective tissue; single-fibre isolation with myosin heavy chain typing by SDS-PAGE; perchloric acid extraction with potassium hydrogen carbonate neutralisation; HPLC quantification of carnosine and anserine',
        },
        {
          id: 'ba-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Carnosine synthase saturation and the transporter bottleneck',
          description:
            'Establish which step limits loading. Beta-alanine enters muscle through the same transporter as taurine, and carnosine synthase has its own kinetics; whether the ceiling is transport or synthesis determines whether divided dosing helps for pharmacological reasons or only for tolerability. This is also the step at which the beta-alanine and taurine interaction becomes visible.',
          dependsOnStepId: 'ba-w3',
          reagentsAndBuffer:
            'Differentiated human myotubes; 13C3-beta-alanine at graded concentrations; taurine as a competitive substrate for the shared SLC6A6 transporter; recombinant CARNS1 kinetic assay with beta-alanine and L-histidine; intracellular carnosine quantified by LC-MS/MS; parallel intracellular taurine measurement',
        },
        {
          id: 'ba-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Duration-stratified performance testing, prespecified',
          description:
            'Report performance stratified by effort duration as a prespecified analysis rather than a post hoc one, because the mechanism makes a specific prediction that the pooled data confirm: benefit in 60 to 240 seconds, none under 60. A trial that pools all durations dilutes a real effect into an unimpressive average, which is how a 0.18 overall effect size coexists with a clear mechanism.',
          dependsOnStepId: 'ba-w4',
          reagentsAndBuffer:
            'Cycle ergometer time-to-exhaustion and open-end-point time trials at prespecified durations under 60 s, 60 to 240 s and over 240 s; muscle carnosine by 1H magnetic resonance spectroscopy at each timepoint; matched placebo with a capsaicin-free tingle-mimicking control to blind paraesthesia; blood lactate and pH',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ba-a1',
        category: 'measured',
        title: 'Muscle carnosine rose 42 to 66 percent, measured directly in biopsies',
        laymanSummary:
          'Four weeks of beta-alanine raised the amount of carnosine in muscle by between forty and sixty-six percent, measured in muscle taken from the leg.',
        technicalDetails:
          'Harris and colleagues established both the pharmacokinetics and the pharmacodynamics in one paper. Plasma beta-alanine peaked at 47 +/- 13, 374 +/- 68 and 833 +/- 43 micromolar after 10, 20 and 40 mg per kg body weight respectively, and at 428 +/- 66 micromolar after histidine dipeptides in chicken broth equivalent to 40 mg/kg, returning to baseline by two hours, with under 5% lost in urine. Dietary supplementation for four weeks with 3.2 g/day or 6.4 g/day of beta-alanine, given as multiple 400 or 800 mg doses, or with isomolar L-carnosine, produced significant increases in muscle carnosine estimated at 42.1%, 64.2% and 65.8% respectively. Two details in that paper are load-bearing for the whole category. Carnosine was not detected in plasma after the chicken broth, with only traces in urine, which establishes that dietary carnosine is hydrolysed before reaching muscle and that beta-alanine is the deliverable form. And plasma taurine rose with beta-alanine ingestion, the first sign of the transporter competition between the two.',
        evidenceSource: 'Harris RC et al. Amino Acids 2006;30:279-289',
        doi: '10.1007/s00726-006-0299-9',
        measuredMetric:
          'Plasma beta-alanine concentration after graded doses, and percentage increase in vastus lateralis carnosine after four weeks',
        auditFlag: 'verified',
      },
      {
        id: 'ba-a2',
        category: 'measured',
        title: 'The benefit sits exactly where the mechanism says it should: 60 to 240 seconds',
        laymanSummary:
          'Pooling fifteen studies, beta-alanine improved efforts lasting one to four minutes and did nothing at all for efforts under a minute — precisely what a proton buffer should do.',
        technicalDetails:
          'Hobson and colleagues meta-analysed 15 published manuscripts reporting 57 measures within 23 exercise tests across 18 supplementation regimes in 360 participants (174 beta-alanine, 186 placebo). Beta-alanine improved exercise outcomes more than placebo (P = 0.002), with median effect sizes of 0.374 (IQR 0.140 to 0.747) against 0.108 (IQR -0.019 to 0.487). Splitting by duration produced the finding that matters: exercise lasting 60 to 240 seconds improved (P = 0.001), exercise over 240 seconds improved (P = 0.046), and exercise lasting under 60 seconds showed nothing (P = 0.312). The improvement was in exercise capacity (P = 0.013) rather than exercise performance (P = 0.204). The median effect was a 2.85% improvement (range -0.37 to 10.49%) at a median cumulative dose of 179 g of beta-alanine. A supplement whose benefit appears only in the duration window where its proposed mechanism is rate-limiting is doing something more convincing than a supplement that helps a little at everything.',
        evidenceSource: 'Hobson RM, Saunders B, Ball G, Harris RC, Sale C. Amino Acids 2012;43:25-37',
        doi: '10.1007/s00726-011-1200-z',
        measuredMetric:
          'Median effect size for exercise outcomes stratified by effort duration, and percentage improvement per cumulative dose',
        auditFlag: 'verified',
      },
      {
        id: 'ba-a3',
        category: 'inferred',
        title: 'The larger meta-analysis put the overall effect size at 0.18',
        laymanSummary:
          'A bigger pooled analysis of forty studies in 1,461 people found an overall effect size of 0.18 — real, statistically clear, and small.',
        technicalDetails:
          'Saunders and colleagues used a three-level mixed effects model across 40 individual studies employing 65 different exercise protocols and totalling 70 exercise measures in 1,461 participants, restricted to double-blind placebo-controlled studies of chronic supplementation, with crossover designs excluded because muscle carnosine washout takes months. The significant overall effect size was 0.18 (95% CI 0.08 to 0.28), and meta-regression confirmed that exercise duration significantly moderated the effect (P = 0.004). An effect size of 0.18 is small by any convention. What makes it interpretable rather than dismissible is the duration moderation: pooling across all exercise types averages a real effect in a narrow window together with no effect everywhere else, which necessarily produces a small number. Reported as a headline without the moderation, 0.18 understates what beta-alanine does for a 1,500-metre runner and overstates what it does for a powerlifter.',
        evidenceSource: 'Saunders B et al. Br J Sports Med 2017;51:658-669',
        doi: '10.1136/bjsports-2016-096396',
        measuredMetric:
          'Overall pooled effect size for exercise capacity and performance, with exercise duration as a meta-regression moderator',
        inferredClaim:
          'That a pooled effect size of 0.18 across all exercise types describes what beta-alanine does in the window where it works',
        auditFlag: 'verified',
      },
      {
        id: 'ba-a4',
        category: 'inferred',
        title: 'The tingling is the only reported side effect, and it can be engineered away',
        laymanSummary:
          'The pins-and-needles feeling from a pre-workout drink is beta-alanine, and it is a side effect. Splitting the dose or using a slow-release form removes it without removing the benefit.',
        technicalDetails:
          'The ISSN position stand states that the only reported side effect of beta-alanine is paraesthesia, and that it can be attenuated by using divided lower doses of 1.6 g or a sustained-release formula. The mechanism is peripheral: beta-alanine activates MrgprD receptors on cutaneous sensory neurons, producing a transient tingling wholly unrelated to muscle carnosine loading. The audit point is a commercial one. Paraesthesia is dose-rate dependent and eliminable, and the formulations that eliminate it load carnosine just as well. That a large share of the pre-workout market instead delivers beta-alanine as a single bolus, at a dose calibrated to produce a strong sensation, is a formulation decision aimed at perceived efficacy rather than measured efficacy. Consumers who report that a product "isn\'t working" because it no longer tingles are describing habituation of a sensory nerve.',
        evidenceSource: 'Trexler ET et al. J Int Soc Sports Nutr 2015;12:30',
        doi: '10.1186/s12970-015-0090-y',
        inferredClaim:
          'That paraesthesia indicates the supplement is working, when it is a peripheral sensory effect independent of muscle carnosine accumulation',
        auditFlag: 'caution',
      },
      {
        id: 'ba-a5',
        category: 'measured',
        title: 'Dietary carnosine cannot reach muscle, which is why the substrate is sold instead',
        laymanSummary:
          'Eating carnosine directly does not work: an enzyme in the blood destroys it before it arrives. That is the reason the supplement is the building block rather than the finished molecule.',
        technicalDetails:
          'In the Harris study, histidine dipeptides given in chicken broth at an amount equivalent to 40 mg/kg of beta-alanine produced a plasma beta-alanine peak of 428 +/- 66 micromolar, but carnosine itself was not detected in plasma, with only traces of carnosine and anserine found in urine. Serum carnosinase hydrolyses circulating carnosine rapidly, so ingested carnosine is delivered to muscle as beta-alanine and histidine. Consistent with this, isomolar L-carnosine supplementation for four weeks raised muscle carnosine by 65.8%, essentially the same as 6.4 g/day of beta-alanine at 64.2% — the same result by a more expensive route. This is a rare case where a supplement category correctly identified the rate-limiting substrate rather than selling the end product, and it is worth crediting.',
        evidenceSource: 'Harris RC et al. Amino Acids 2006;30:279-289',
        doi: '10.1007/s00726-006-0299-9',
        measuredMetric:
          'Plasma carnosine after dipeptide ingestion, and muscle carnosine increase after isomolar L-carnosine versus beta-alanine',
        auditFlag: 'verified',
      },
      {
        id: 'ba-a6',
        category: 'inferred',
        title: 'It lowers muscle taurine, and the two are sold in the same tub',
        laymanSummary:
          'Beta-alanine and taurine compete for the same door into the muscle cell. Chronic beta-alanine use lowers muscle taurine, and both are common pre-workout ingredients.',
        technicalDetails:
          'Beta-alanine and taurine are both substrates for the sodium- and chloride-dependent transporter SLC6A6, and Harris et al. observed that plasma taurine increased with beta-alanine ingestion without a corresponding rise in urinary loss — consistent with displacement from tissue. Rodent work has since shown substantial muscle taurine depletion under chronic beta-alanine loading. Whether this matters clinically in humans is genuinely unresolved, and no human trial has been designed to answer it. What is not unresolved is that the interaction is real, mechanistically specific, and that beta-alanine and taurine appear together in a large fraction of multi-ingredient pre-workout formulas with no acknowledgement of it on any label.',
        evidenceSource: 'Harris RC et al. Amino Acids 2006;30:279-289',
        doi: '10.1007/s00726-006-0299-9',
        inferredClaim:
          'That beta-alanine and taurine are complementary ingredients, when they compete for the same transporter and beta-alanine lowers tissue taurine',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed quickly, cleared within two hours',
        laymanDesc:
          'Beta-alanine appears in the blood fast and is gone again within a couple of hours, with almost none lost in urine. That short window is why the dose is split across the day.',
        molecularDetail:
          'Harris et al. measured plasma peaks of 47 +/- 13, 374 +/- 68 and 833 +/- 43 micromolar after 10, 20 and 40 mg/kg, with concentrations back at baseline by two hours and urinary loss under 5%. The steep, short plasma curve is what makes divided dosing sensible on pharmacokinetic grounds as well as for tolerability.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It enters muscle through a transporter it shares with taurine',
        laymanDesc:
          'Muscle takes beta-alanine in through a specific door — the same door taurine uses, which is why the two get in each other\'s way.',
        molecularDetail:
          'SLC6A6, the sodium- and chloride-dependent taurine transporter, also carries beta-alanine. Harris et al. observed plasma taurine rising on beta-alanine ingestion without increased urinary loss. Uptake, not synthesis, is the more likely rate-limiting step in loading, which is why muscle carnosine accumulates over weeks rather than days.',
        iconName: 'DoorOpen',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Carnosine synthase joins it to histidine',
        laymanDesc:
          'Inside the muscle cell an enzyme links beta-alanine to histidine, making carnosine. Histidine is plentiful; beta-alanine is the part that runs out.',
        molecularDetail:
          'CARNS1 ligates beta-alanine and L-histidine in an ATP-dependent reaction. Intramuscular histidine is not limiting under normal conditions, which is why supplying beta-alanine alone raises carnosine and why supplying histidine alone does not. Carnosine is concentrated in type II fast-twitch fibres, matching the exercise durations in which the benefit appears.',
        iconName: 'Combine',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Carnosine soaks up protons inside the cell',
        laymanDesc:
          'During hard efforts the muscle fills with acid. Carnosine absorbs it, so the cell can keep contracting for longer before pH stops it.',
        molecularDetail:
          'The imidazole ring of carnosine has a pKa close to intracellular pH during high-intensity exercise, which is what makes it an effective physicochemical buffer in exactly the range that matters. This is an intracellular mechanism, distinct from sodium bicarbonate\'s extracellular buffering, and the two are additive in principle.',
        iconName: 'Shield',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The result is more work in a one-to-four-minute effort, and nothing shorter',
        laymanDesc:
          'The benefit appears in efforts long enough for acid to build up and short enough for acid to be what stops you. Below a minute there is nothing.',
        molecularDetail:
          'Hobson et al. found improvement at 60 to 240 seconds (P = 0.001) and over 240 seconds (P = 0.046), with no benefit under 60 seconds (P = 0.312), and a median 2.85% improvement. Saunders et al. put the pooled effect size at 0.18 (95% CI 0.08 to 0.28) across all durations, with duration a significant moderator (P = 0.004).',
        iconName: 'Timer',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Harris 2006 — beta-alanine pharmacokinetics and muscle carnosine loading',
        phase: 'Human pharmacokinetic and four-week supplementation study with muscle biopsy',
        sampleSize: 20,
        primaryEndpoint:
          'Plasma beta-alanine after graded doses, and change in vastus lateralis carnosine after four weeks',
        endpointMet: true,
        statisticalPValue:
          'Significant muscle carnosine increases of 42.1%, 64.2% and 65.8% on 3.2 g/day beta-alanine, 6.4 g/day beta-alanine and isomolar L-carnosine',
        unreportedAdverseSignals:
          'Plasma taurine increased with beta-alanine ingestion without a corresponding urinary rise, the first signal of transporter competition. No placebo arm for the biopsy component.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Hobson 2012 meta-analysis of beta-alanine and exercise performance',
        phase: 'Meta-analysis of 15 published manuscripts',
        sampleSize: 360,
        primaryEndpoint: 'Effect of beta-alanine on exercise outcomes, stratified by effort duration',
        endpointMet: true,
        statisticalPValue:
          'Overall P = 0.002; 60-240 s P = 0.001; over 240 s P = 0.046; under 60 s P = 0.312; median improvement 2.85%',
        unreportedAdverseSignals:
          'The improvement was in exercise capacity (P = 0.013) rather than exercise performance (P = 0.204) — a distinction between time-to-exhaustion tasks and competitive-style time trials that matters to an athlete.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Saunders 2017 meta-analysis of beta-alanine supplementation',
        phase: 'Three-level mixed effects meta-analysis of 40 double-blind placebo-controlled studies',
        sampleSize: 1461,
        primaryEndpoint: 'Effect of chronic beta-alanine supplementation on exercise capacity and performance',
        endpointMet: true,
        statisticalPValue:
          'Overall effect size 0.18 (95% CI 0.08 to 0.28); exercise duration a significant moderator (P = 0.004)',
        unreportedAdverseSignals:
          'Crossover designs were excluded because muscle carnosine washout is very long, which removes the most statistically efficient design from the evidence base and inflates the sample sizes needed.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'ISSN position stand on beta-alanine',
        phase: 'Society position stand and critical review',
        sampleSize: 1,
        primaryEndpoint:
          'Consensus conclusions on muscle carnosine augmentation, performance window and safety',
        endpointMet: true,
        statisticalPValue:
          'Four weeks at 4-6 g daily significantly augments muscle carnosine; performance improvement most pronounced in open-end-point tasks and time trials of 1 to 4 minutes',
        unreportedAdverseSignals:
          'The stand explicitly notes that more research is needed on strength, on endurance beyond 25 minutes, and on health-related benefits of carnosine. Several authors have industry relationships within this field.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Four weeks of beta-alanine raised muscle carnosine by 42.1% at 3.2 g/day and 64.2% at 6.4 g/day, measured by biopsy',
        'Exercise lasting 60 to 240 seconds improved (P = 0.001); exercise under 60 seconds did not (P = 0.312)',
        'The pooled effect size across 40 studies and 1,461 participants was 0.18, with duration a significant moderator',
        'Ingested carnosine was not detectable in plasma, establishing that dietary carnosine is hydrolysed before reaching muscle',
        'Paraesthesia is the only reported side effect and is attenuated by divided 1.6 g doses or sustained-release formulation',
      ],
      unsupportedInferences: [
        'That the tingling indicates efficacy, when it is a peripheral sensory effect unrelated to carnosine loading',
        'That beta-alanine helps maximal short efforts or single heavy lifts, where the meta-analysis found nothing',
        'That an overall effect size of 0.18 describes the benefit inside the window where the mechanism operates',
        'That beta-alanine and taurine are complementary, when they compete for the same transporter',
      ],
      whatFailedInitially: [
        'Supplementing carnosine itself, which serum carnosinase destroys before it reaches muscle',
        'Beta-alanine for efforts under 60 seconds, where proton accumulation is not the limiting factor',
      ],
      realWorldOutcome: [
        'This is one of the few supplements where the mechanism was measured in human muscle before the performance claims were made',
        'The effect is genuine, narrow, and about 3% in the events where it applies',
        'The dominant commercial format delivers it as a single tingling bolus, which optimises sensation rather than loading',
      ],
    },
    deliverySystem: {
      type: 'Oral powder, capsule or sustained-release tablet; usually inside a multi-ingredient pre-workout blend',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. Beta-alanine is almost never sold alone at consumer scale — it is a near-universal component of pre-workout formulas alongside caffeine, citrulline and creatine, which makes any consumer attribution of effect impossible and means the tingling is often the only ingredient a user can perceive. Divided 1.6 g doses and sustained-release formulations produce equivalent carnosine loading with markedly less paraesthesia. Alpha-alanine has the same molecular formula and molecular weight, is far cheaper, and is biologically useless here, which makes isomer-resolving analysis the meaningful identity test.',
      safetyProfile:
        'Paraesthesia — tingling of the face, neck and hands beginning within about 20 minutes of a bolus dose and resolving within an hour — is the only side effect reported in the position stand literature, and it is dose-rate dependent rather than dose dependent. Chronic supplementation lowers muscle taurine through competition at the shared SLC6A6 transporter; the clinical significance of this in humans has not been established and no trial has been designed to test it. Safety data beyond a few months of supplementation are limited, and carnosine washout from muscle takes many weeks, which means any long-term effect would accumulate slowly and clear slowly.',
    },
    commonQuestions: [
      {
        q: 'Does the tingling mean it is working?',
        a: 'No. Paraesthesia comes from beta-alanine activating sensory nerve receptors in the skin and has no relationship to how much carnosine your muscle is accumulating. The ISSN position stand records it as the only reported side effect and notes it can be removed entirely by splitting the dose into 1.6 g portions or using a sustained-release formula — both of which load carnosine just as effectively. If a formulation is calibrated to produce a strong tingle, it is optimised for a sensation rather than an outcome.',
      },
      {
        q: 'What is it actually good for?',
        a: 'Efforts lasting roughly one to four minutes, and essentially nothing else. Pooled across fifteen studies, exercise of 60 to 240 seconds improved with P = 0.001 and exercise under 60 seconds showed nothing at all with P = 0.312. That pattern is exactly what a proton buffer should produce, which is what makes the result credible. A middle-distance runner, a rower or a combat athlete is in the window. A powerlifter is not.',
        auditNote:
          'The median improvement in that window was 2.85 percent, which at that level of competition is substantial.',
      },
      {
        q: 'Why not just take carnosine, or eat more meat?',
        a: 'Because it does not reach muscle. When histidine dipeptides were given in chicken broth, beta-alanine appeared in plasma but carnosine itself was not detectable, with only traces in urine — serum carnosinase hydrolyses circulating carnosine almost immediately. Interestingly, taking L-carnosine as a supplement does still work, raising muscle carnosine by 65.8 percent, because it is broken down to beta-alanine first. It is the same result by a more expensive route.',
      },
      {
        q: 'The meta-analysis says the effect size is only 0.18. Is it worth taking?',
        a: 'That number is real and it is misleading on its own. The 0.18 comes from pooling every exercise type together, including all the durations where beta-alanine cannot work, and the same analysis found that duration significantly moderates the effect. Averaging a genuine benefit in a narrow window with no benefit everywhere else necessarily produces a small overall number. For a two-minute event it understates what beta-alanine does; for a single maximal lift it overstates it.',
      },
      {
        q: 'How long does it take?',
        a: 'Weeks, not days, and that is a property of the loading rather than of the dose. Muscle carnosine accumulated over four weeks at 3.2 to 6.4 grams daily in the biopsy study, and the position stand describes at least two to four weeks of daily supplementation before performance effects appear. Washout is correspondingly slow — long enough that meta-analysts exclude crossover trials because muscle carnosine does not return to baseline within a practical washout period.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Harris RC et al. The absorption of orally supplied beta-alanine and its effect on muscle carnosine synthesis in human vastus lateralis. Amino Acids 2006;30:279-289',
        identifier: '10.1007/s00726-006-0299-9',
        kind: 'doi',
      },
      {
        label:
          'Hobson RM, Saunders B, Ball G, Harris RC, Sale C. Effects of beta-alanine supplementation on exercise performance: a meta-analysis. Amino Acids 2012;43:25-37',
        identifier: '10.1007/s00726-011-1200-z',
        kind: 'doi',
      },
      {
        label:
          'Trexler ET et al. International Society of Sports Nutrition position stand: beta-alanine. J Int Soc Sports Nutr 2015;12:30',
        identifier: '10.1186/s12970-015-0090-y',
        kind: 'doi',
      },
      {
        label:
          'Saunders B et al. Beta-alanine supplementation to improve exercise capacity and performance: a systematic review and meta-analysis. Br J Sports Med 2017;51:658-669',
        identifier: '10.1136/bjsports-2016-096396',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 239 — Beta-alanine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/239',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Citrulline malate — one 2010 trial reported 53% more repetitions and built a category; the 2021
  // meta-analysis of eight trials found three extra reps. The pharmacokinetics are excellent and
  // the pharmacodynamic endpoint they were meant to move did not move.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'citrulline-malate',
    name: 'Citrulline malate',
    tradeName: 'Sold as citrulline malate 2:1 or 1:1, and as plain L-citrulline',
    sponsor:
      'No single sponsor — L-citrulline, a non-proteinogenic amino acid first isolated from watermelon, combined as a salt with malic acid and sold by many manufacturers.',
    targetGene: 'NOS3',
    targetProtein:
      'Endothelial nitric oxide synthase (NOS3), which converts L-arginine to nitric oxide and L-citrulline. Supplemental citrulline is not itself a substrate: it is recycled to arginine by argininosuccinate synthase and argininosuccinate lyase in the kidney, and it works by raising systemic arginine availability more reliably than arginine itself does.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a pre-workout ergogenic aid for "pump", repetitions to failure and reduced muscle soreness. Not approved by the FDA or EMA for any indication. L-citrulline is separately used clinically in some urea cycle disorders, which is a different molecule doing a different job.',
    patientFriendlyIndication:
      'Taken before lifting for more repetitions, a better pump and less soreness afterwards',
    conditionContext: {
      conditionExplainer:
        'Nitric oxide relaxes blood vessels, and the enzyme that makes it uses arginine. Supplementing arginine directly mostly fails, because an enzyme in the gut wall destroys much of it before it reaches the bloodstream. Citrulline slips past that enzyme and is converted to arginine in the kidney, which is why it raises blood arginine better than arginine does.',
      whyItMatters:
        'The pharmacokinetic story here is genuinely elegant and well demonstrated. What happened next is the recurring failure in this file: a single 2010 trial reported an implausibly large performance effect, the category was built on it, and when eight trials were eventually pooled the effect turned out to be about three extra repetitions.',
      whoTakesThis:
        'Resistance-training lifters, almost always inside a multi-ingredient pre-workout formula alongside caffeine, beta-alanine and creatine.',
      clinicalGoals:
        'Studies measured plasma arginine area under the curve and peak concentration, the arginine to asymmetric dimethylarginine ratio, urinary nitrate and cyclic GMP excretion, flow-mediated vasodilation, repetitions to failure, and self-reported muscle soreness at 24 and 48 hours.',
    },
    oneSentenceVerdict:
      'Citrulline raises plasma arginine more effectively than arginine itself does and increases urinary nitrate and cyclic GMP, yet in that same trial no treatment improved flow-mediated vasodilation over baseline; and the performance claim, built on a 2010 study reporting 52.92% more repetitions in a final set, came out at about three extra repetitions with an effect size of 0.196 when eight trials in 137 people were pooled.',
    laymanHowItWorks:
      'Your blood vessels widen when cells lining them make nitric oxide, and the raw material for that is the amino acid arginine. Eating arginine barely helps, because an enzyme in the gut wall breaks most of it down before it gets into the blood. Citrulline avoids that enzyme entirely, gets absorbed intact, and is converted into arginine by the kidneys — so paradoxically, taking citrulline raises your arginine more than taking arginine does. Whether the extra arginine actually opens blood vessels enough to change anything you can feel or measure is a separate question, and the answer so far is less impressive than the chemistry.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 44,
    anatomicalSite:
      'Absorbed intact in the small intestine, converted to arginine in the renal proximal tubule, acting at vascular endothelium and in skeletal muscle',
    substitutes: {
      summary:
        'Against L-arginine, citrulline wins decisively on pharmacokinetics and that is well established. Against dietary nitrate from beetroot, which reaches nitric oxide by an entirely separate nitrate-nitrite pathway that bypasses the enzyme altogether, the comparison is genuinely open and the beetroot literature is larger.',
      conventionalRx: [
        {
          name: 'L-arginine, the ingredient citrulline replaced',
          class: 'Nitric oxide precursor, directly',
          howItCompares:
            'Schwedhelm et al. compared them head to head over a week in 20 volunteers. Citrulline dose-dependently increased both the area under the curve and the peak plasma L-arginine concentration more effectively than L-arginine itself did (P < 0.01), because arginine is extensively eliminated presystemically by intestinal arginase.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros of citrulline: it actually raises the analyte, which arginine largely fails to do. Cons: raising the analyte was never the point, and in that same trial no treatment improved flow-mediated vasodilation over baseline.',
        },
      ],
      naturalFoods: [
        {
          name: 'Watermelon',
          activeCompound: 'L-citrulline, from which the amino acid takes its name',
          biologicalMechanism:
            'Citrulline was first isolated from watermelon (Citrullus lanatus) and remains its richest dietary source, concentrated in the rind. The molecule is identical to the supplemental form and follows the same absorption and renal conversion route.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the pharmacokinetic study used up to 3 g twice daily, and the pooled performance trials used 6 to 8 g of citrulline malate 40 to 60 minutes before exercise.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Beetroot juice, as the alternative route to nitric oxide',
          activeCompound: 'Inorganic nitrate, reduced to nitrite by oral bacteria then to nitric oxide',
          biologicalMechanism:
            'The nitrate-nitrite-nitric oxide pathway bypasses nitric oxide synthase entirely and does not depend on arginine availability. It is the honest comparator for anything sold on a nitric oxide rationale, and it has a considerably larger and older performance literature.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Work out how much citrulline you are actually getting',
          action:
            'Citrulline malate is a salt, and the ratio is the whole label. A 2:1 product is two parts citrulline to one part malate; a 1:1 product is half citrulline by mass.',
          patientImpact:
            'Eight grams of a 2:1 product supplies roughly 5.3 g of citrulline; eight grams of a 1:1 product supplies about 4 g. Products frequently do not state the ratio, and blends listing "citrulline malate" inside a proprietary formula state neither the ratio nor the amount.',
          clinicalPrecaution:
            'The malate half is not inert marketing filler in principle — it is a tricarboxylic acid cycle intermediate — but no trial has separated its contribution from citrulline\'s.',
        },
        {
          name: 'Treat a single spectacular trial as a hypothesis',
          action:
            'When one study reports an effect several times larger than everything after it, the later pooled estimate is the number to use.',
          patientImpact:
            'The 2010 trial reported 52.92% more repetitions in its final set. The 2021 meta-analysis of eight trials in 137 participants found an increase of 3 +/- 5 repetitions, 6.4 +/- 7.9%, with a small standardised mean difference of 0.196.',
          clinicalPrecaution:
            'Both results can be honestly reported. Only one of them should be used to decide anything.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C(C[C@@H](C(=O)O)N)CNC(=O)N',
      chemicalFormula: 'C6H13N3O3',
      molecularWeight:
        '175.19 g/mol for L-citrulline. Citrulline malate is a salt of this with malic acid (C4H6O5, 134.09 g/mol), so the citrulline content depends entirely on the ratio: about 66% by mass in a 2:1 product and about 57% in a 1:1 product before counting the counter-ion stoichiometry.',
      structureSource: {
        label: 'PubChem CID 9750 — L-Citrulline, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9750',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cit-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Citrulline-to-malate ratio determination and free arginine screen',
          description:
            'The single most important quality question in this category is the ratio, and it is the one least often answered on a label. Determine citrulline and malate independently rather than assaying "citrulline malate" as a unit, and screen for free arginine, which is cheaper and would confound any pharmacokinetic comparison the product is sold on.',
          reagentsAndBuffer:
            'HPLC with pre-column derivatisation for L-citrulline against a reference standard; ion-exclusion chromatography or enzymatic malate dehydrogenase assay for malate; L-arginine and L-ornithine reference standards for the screen; loss on drying to correct the ratio to a dry basis',
        },
        {
          id: 'cit-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of labelled citrulline and the ADMA internal standard',
          description:
            'The pharmacodynamic quantity that matters is not arginine alone but the ratio of arginine to asymmetric dimethylarginine, the endogenous inhibitor of nitric oxide synthase. Quantifying that ratio reliably needs a labelled ADMA standard, because ADMA circulates at concentrations three orders of magnitude below arginine.',
          dependsOnStepId: 'cit-w1',
          reagentsAndBuffer:
            '13C6-L-citrulline and 13C6-L-arginine tracers; d7-ADMA internal standard; symmetric dimethylarginine standard to confirm chromatographic separation from ADMA; sterile preparation for the oral arm',
        },
        {
          id: 'cit-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Plasma and timed urine preparation for nitrate and cyclic GMP',
          description:
            'Urinary nitrate is exquisitely sensitive to dietary nitrate, so a nitric oxide readout is worthless without dietary control — a participant who ate a green salad will out-signal the intervention. Schwedhelm et al. measured urinary nitrate and cyclic GMP as their downstream endpoints, and the handling is what makes those numbers mean anything.',
          dependsOnStepId: 'cit-w2',
          reagentsAndBuffer:
            'Three-day low-nitrate diet before each sampling period; complete timed urine collection with creatinine normalisation; solid-phase extraction of plasma amino acids; ozone chemiluminescence or Griess assay for nitrate and nitrite; enzyme immunoassay for cyclic GMP',
        },
        {
          id: 'cit-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Endothelial nitric oxide output against the arginine paradox',
          description:
            'Test the step the whole category assumes. Intracellular arginine in endothelial cells is already far above the Km of nitric oxide synthase, which is why raising plasma arginine need not raise nitric oxide output at all — the so-called arginine paradox. Measure nitric oxide production directly across a range of extracellular arginine concentrations, with and without ADMA.',
          dependsOnStepId: 'cit-w3',
          reagentsAndBuffer:
            'Human umbilical vein or coronary artery endothelial cells; extracellular L-arginine from 10 to 1000 micromolar; ADMA at physiological and elevated concentrations; L-NAME as the nitric oxide synthase inhibitor; DAF-FM diacetate fluorescent nitric oxide probe; ozone chemiluminescence of medium nitrite',
        },
        {
          id: 'cit-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Repetitions to failure with a prespecified, adequately powered design',
          description:
            'Report repetitions to failure as a prespecified between-group difference with the citrulline dose stated in grams of citrulline rather than grams of salt. The pooled estimate is 3 +/- 5 repetitions across a session, which means an individual trial needs far more than the 41 subjects of the original study to detect it reliably, and single-set post hoc comparisons will generate spurious large percentages.',
          dependsOnStepId: 'cit-w4',
          reagentsAndBuffer:
            'Standardised resistance protocol at approximately 70% of one-repetition maximum across 5 sets per exercise; taste- and appearance-matched placebo, which is difficult because citrulline malate is distinctly sour; prespecified total-repetition endpoint rather than per-set analysis; flow-mediated dilation and blood flow measured in the same session',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cit-a1',
        category: 'measured',
        title: 'Citrulline raises plasma arginine better than arginine does',
        laymanSummary:
          'In a head-to-head trial, taking citrulline increased blood arginine more effectively than taking arginine itself, because arginine is destroyed in the gut wall before absorption.',
        technicalDetails:
          'Schwedhelm and colleagues ran a double-blind, randomised, placebo-controlled crossover in 20 healthy volunteers across six dosing regimens of placebo, citrulline and arginine, with pharmacokinetics calculated after a week of oral supplementation. L-citrulline dose-dependently increased the area under the curve and the peak plasma L-arginine concentration more effectively than L-arginine did (P < 0.01). The highest dose, 3 g twice daily, raised the trough plasma arginine and improved the arginine to asymmetric dimethylarginine ratio from 186 +/- 8 at baseline to 278 +/- 14 (P < 0.01, 95% CI 66 to 121). Urinary nitrate rose from 92 +/- 10 to 125 +/- 15 micromol per mmol creatinine (P = 0.01) and cyclic GMP from 38 +/- 3.3 to 50 +/- 6.7 nmol per mmol creatinine (P = 0.04). The reason is presystemic: oral arginine is extensively eliminated by intestinal arginase, while citrulline is readily absorbed and converted to arginine downstream. This is a clean, well-designed pharmacokinetic result and it is the strongest thing in this dossier.',
        evidenceSource: 'Schwedhelm E et al. Br J Clin Pharmacol 2008;65:51-59',
        doi: '10.1111/j.1365-2125.2007.02990.x',
        measuredMetric:
          'Plasma L-arginine AUC and Cmax, arginine to ADMA ratio, urinary nitrate and cyclic GMP excretion',
        auditFlag: 'verified',
      },
      {
        id: 'cit-a2',
        category: 'failed',
        title: 'In the same trial, blood vessel function did not improve at all',
        laymanSummary:
          'The trial that proved citrulline raises arginine also measured whether blood vessels actually widened more. They did not — not on any treatment.',
        technicalDetails:
          'Schwedhelm et al. measured flow-mediated vasodilation as a pharmacodynamic endpoint alongside their pharmacokinetic measures, and reported plainly that no treatment improved flow-mediated dilation over baseline. A pooled analysis of all the flow-mediated dilation data did reveal a correlation between the increase in the arginine to ADMA ratio and improvement, which is a post hoc correlational finding rather than a treatment effect. This is the load-bearing negative result for the entire nitric oxide supplement category and it is almost never quoted. The likely explanation is the arginine paradox: intracellular arginine in endothelial cells already sits far above the Km of nitric oxide synthase, so raising plasma arginine has limited capacity to raise nitric oxide output in a healthy endothelium. Raising the substrate concentration for an enzyme that is not substrate-limited is a chemistry result, not a physiology result.',
        evidenceSource: 'Schwedhelm E et al. Br J Clin Pharmacol 2008;65:51-59',
        doi: '10.1111/j.1365-2125.2007.02990.x',
        measuredMetric: 'Flow-mediated vasodilation after one week of citrulline or arginine supplementation',
        auditFlag: 'verified',
      },
      {
        id: 'cit-a3',
        category: 'conclusion_shift',
        title: '52.92% more repetitions in 2010, three extra repetitions in 2021',
        laymanSummary:
          'The study that created this product category reported nearly 53 percent more repetitions in the final set. Pooling eight trials eleven years later gave about three extra repetitions across a whole session.',
        technicalDetails:
          'Perez-Guisado and Jakeman studied 41 men in a randomised, double-blind, two-period crossover, comparing 8 g of citrulline malate against placebo across 16 sets of a pectoral session, testing repetitions to fatigue at 80% of one-repetition maximum. The number of repetitions increased significantly from the third evaluated set onward (P < 0.0001), and the increase correlated with set number, reaching 52.92% more repetitions and a 100% response rate in the final set, with a 40% decrease in muscle soreness at 24 and 48 hours. Varvik and colleagues then meta-analysed eight double-blind placebo-controlled studies in 137 participants — 101 strength-trained men, 26 women and 9 untrained men — across 14 single-joint and multi-joint exercises averaging 51 +/- 23 total repetitions over 5 +/- 3 sets at about 70% of one-repetition maximum. Supplementing 6 to 8 g of citrulline malate 40 to 60 minutes before exercise increased repetitions by 3 +/- 5, or 6.4 +/- 7.9%, against placebo (P = .022), with a small standardised mean difference of 0.196. Both numbers are real. A 53% gain in a single final set, reported as a within-session trend, is exactly the shape a small study produces when a per-set analysis is run without prespecification.',
        evidenceSource:
          'Perez-Guisado J, Jakeman PM. J Strength Cond Res 2010;24:1215-1222; Varvik FT, Bjornsen T, Gonzalez AM. Int J Sport Nutr Exerc Metab 2021;31:350-358',
        doi: '10.1123/ijsnem.2020-0295',
        measuredMetric:
          'Repetitions to voluntary muscular failure with citrulline malate versus placebo',
        inferredClaim:
          'That citrulline malate produces a large increase in training volume, on the basis of a per-set result from a single 41-subject trial',
        auditFlag: 'contested',
      },
      {
        id: 'cit-a4',
        category: 'inferred',
        title: 'Nobody has tested what the malate is for',
        laymanSummary:
          'The product is a salt of citrulline and malic acid, and the trials were run on the salt. No study has compared it against plain citrulline, so the malate half is untested.',
        technicalDetails:
          'The performance literature is conducted almost entirely on citrulline malate rather than on L-citrulline, while the pharmacokinetic literature that supplies the mechanism was conducted on L-citrulline alone. Malate is a tricarboxylic acid cycle intermediate and a plausible contributor to aerobic energy provision in principle, which is the stated rationale for the combination. No adequately powered trial has compared citrulline malate against an equimolar dose of L-citrulline, which means the malate contribution is entirely unmeasured and the mechanism attributed to the product comes from studies of only half of it. Compounding this, the citrulline-to-malate ratio determines how much citrulline a stated dose contains — roughly 5.3 g of citrulline in 8 g of a 2:1 product against about 4 g in a 1:1 product — and the ratio is frequently absent from labels and always absent from proprietary blends.',
        evidenceSource:
          'Varvik FT, Bjornsen T, Gonzalez AM. Int J Sport Nutr Exerc Metab 2021;31:350-358',
        doi: '10.1123/ijsnem.2020-0295',
        inferredClaim:
          'That malate contributes to the effect of citrulline malate, and that a stated gram dose of the salt corresponds to a known citrulline dose',
        auditFlag: 'caution',
      },
      {
        id: 'cit-a5',
        category: 'inferred',
        title: 'The soreness claim rests on one unblinded-by-taste self-report',
        laymanSummary:
          'The 40 percent reduction in muscle soreness comes from the same 2010 trial, measured by asking people how sore they felt, with a distinctly sour supplement against placebo.',
        technicalDetails:
          'Perez-Guisado and Jakeman reported a significant 40% decrease in muscle soreness at 24 and 48 hours after the training session with citrulline malate, with a response rate above 90%. Muscle soreness measured by self-report is among the most expectation-sensitive endpoints available, and citrulline malate has a strong, distinctive sour taste that makes genuine blinding difficult against a conventional placebo. The trial reported stomach discomfort in 14.63% of subjects, which is itself an unblinding cue. The 2021 meta-analysis pooled repetitions to failure and did not pool soreness, so the delayed-onset muscle soreness claim that appears on a very large number of product labels still rests substantially on this single crossover.',
        evidenceSource: 'Perez-Guisado J, Jakeman PM. J Strength Cond Res 2010;24:1215-1222',
        doi: '10.1519/JSC.0b013e3181cb28e0',
        inferredClaim:
          'That citrulline malate reduces delayed-onset muscle soreness by 40 percent, from one self-reported endpoint in a hard-to-blind trial',
        auditFlag: 'caution',
      },
      {
        id: 'cit-a6',
        category: 'measured',
        title: 'The lower-body effect was a tendency, not a finding',
        laymanSummary:
          'When the pooled analysis split upper body from lower body, the lower body result was only a trend rather than a clear effect.',
        technicalDetails:
          'Varvik and colleagues ran two prespecified subanalyses of their eight-study, 137-participant dataset. The overall result was an increase of 3 +/- 5 repetitions, 6.4 +/- 7.9%, with a standardised mean difference of 0.196 (P = .022). The lower-body subanalysis produced an 8.1 +/- 8.4% improvement that the authors describe as a tendency toward an effect rather than a demonstrated one. Subgroup analyses of a small pooled dataset are underpowered by construction, and the honest reading is that the total-repetition effect is modest, that its distribution across exercise types is not resolved, and that the participant base is 101 strength-trained men, 26 women and 9 untrained men — a sample from which claims about untrained lifters or about women cannot responsibly be drawn.',
        evidenceSource: 'Varvik FT, Bjornsen T, Gonzalez AM. Int J Sport Nutr Exerc Metab 2021;31:350-358',
        doi: '10.1123/ijsnem.2020-0295',
        measuredMetric:
          'Standardised mean difference in repetitions to failure, overall and in upper-body and lower-body subanalyses',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It slips past the enzyme that destroys arginine',
        laymanDesc:
          'Swallowed arginine is largely broken down by an enzyme in the gut wall before it reaches the blood. Citrulline is not a target for that enzyme and is absorbed intact.',
        molecularDetail:
          'Oral L-arginine undergoes extensive presystemic elimination by intestinal arginase. L-citrulline is not an arginase substrate and is absorbed intact through neutral amino acid transporters, which is the entire pharmacokinetic advantage and the reason the ingredient displaced arginine in this market.',
        iconName: 'DoorOpen',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The kidney converts it into arginine',
        laymanDesc:
          'Citrulline is turned into arginine in the kidney, so blood arginine ends up higher after taking citrulline than after taking arginine directly.',
        molecularDetail:
          'Argininosuccinate synthase and argininosuccinate lyase in the renal proximal tubule convert citrulline to arginine and release it systemically. Schwedhelm et al. measured citrulline dose-dependently increasing plasma arginine AUC and Cmax more effectively than arginine itself (P < 0.01), with 3 g twice daily raising the arginine to ADMA ratio from 186 +/- 8 to 278 +/- 14.',
        iconName: 'Recycle',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Arginine is the substrate for nitric oxide synthase',
        laymanDesc:
          'Cells lining blood vessels use arginine to make nitric oxide, the signal that tells vessels to relax and widen.',
        molecularDetail:
          'Endothelial nitric oxide synthase converts L-arginine and oxygen to nitric oxide and L-citrulline, regenerating the precursor. Its endogenous competitive inhibitor is asymmetric dimethylarginine, which is why the arginine to ADMA ratio rather than arginine alone is the meaningful pharmacodynamic quantity.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And here the chain breaks: the enzyme was never short of substrate',
        laymanDesc:
          'Downstream markers of nitric oxide production did rise. But actual measured blood vessel widening did not improve on any treatment, in the same trial.',
        molecularDetail:
          'Urinary nitrate rose from 92 +/- 10 to 125 +/- 15 micromol/mmol creatinine (P = 0.01) and cyclic GMP from 38 +/- 3.3 to 50 +/- 6.7 nmol/mmol creatinine (P = 0.04), yet no treatment improved flow-mediated vasodilation over baseline. The arginine paradox supplies the explanation: intracellular endothelial arginine already greatly exceeds the Km of nitric oxide synthase, so the enzyme is not substrate-limited in healthy endothelium.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measured outcome is about three extra repetitions',
        laymanDesc:
          'Across eight pooled trials, taking it before a session produced roughly three more repetitions in total than placebo did.',
        molecularDetail:
          'Varvik et al. found an increase of 3 +/- 5 repetitions, 6.4 +/- 7.9%, over an average of 51 +/- 23 total repetitions across 5 +/- 3 sets per exercise at about 70% of one-repetition maximum, with a standardised mean difference of 0.196 (P = .022) across 137 participants. The lower-body subanalysis was a tendency rather than a finding.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Schwedhelm 2008 — oral citrulline versus arginine pharmacokinetics and pharmacodynamics',
        phase: 'Double-blind randomised placebo-controlled crossover, six dosing regimens',
        sampleSize: 20,
        primaryEndpoint:
          'Plasma L-arginine pharmacokinetics and downstream nitric oxide pharmacodynamic markers',
        endpointMet: true,
        statisticalPValue:
          'Citrulline increased plasma arginine AUC and Cmax more than arginine, P < 0.01; arginine/ADMA ratio 186 +/- 8 to 278 +/- 14, P < 0.01; urinary nitrate P = 0.01; cyclic GMP P = 0.04',
        unreportedAdverseSignals:
          'No treatment improved flow-mediated vasodilation over baseline — the functional endpoint the biochemistry was meant to move. The correlation between arginine/ADMA increase and dilation came from a pooled post hoc analysis.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Perez-Guisado 2010 — citrulline malate and bench press repetitions to fatigue',
        phase: 'Randomised double-blind two-period crossover',
        sampleSize: 41,
        primaryEndpoint: 'Repetitions to fatigue at 80% of one-repetition maximum across 8 sets',
        endpointMet: true,
        statisticalPValue:
          'Significant increase from the third evaluated set onward, P < 0.0001; 52.92% more repetitions in the final set; 40% decrease in muscle soreness at 24 and 48 hours',
        unreportedAdverseSignals:
          'Stomach discomfort in 14.63% of subjects, which is an unblinding cue for a distinctly sour supplement. The headline effect is a per-set result that grew with set number rather than a prespecified total-repetition endpoint.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Varvik 2021 meta-analysis of citrulline malate and repetitions to failure',
        phase: 'Meta-analysis of 8 double-blind placebo-controlled studies',
        sampleSize: 137,
        primaryEndpoint: 'Total repetitions to voluntary muscular failure versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Increase of 3 +/- 5 repetitions, 6.4 +/- 7.9% (P = .022), standardised mean difference 0.196; lower-body subanalysis 8.1 +/- 8.4%, described as a tendency',
        unreportedAdverseSignals:
          'The participant base was 101 strength-trained men, 26 women and 9 untrained men, so conclusions about untrained lifters or about women rest on very small numbers. No included study compared citrulline malate against equimolar plain citrulline.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Citrulline raised plasma arginine AUC and Cmax more effectively than arginine itself, dose-dependently, P < 0.01',
        'It raised the arginine to ADMA ratio from 186 +/- 8 to 278 +/- 14, and raised urinary nitrate and cyclic GMP',
        'No treatment improved flow-mediated vasodilation over baseline in that same trial',
        'Pooled across eight trials in 137 people, it increased repetitions to failure by 3 +/- 5, or 6.4 +/- 7.9%',
      ],
      unsupportedInferences: [
        'That raising plasma arginine raises nitric oxide output, when the enzyme is not substrate-limited in healthy endothelium',
        'That the 52.92% final-set result from a 41-subject trial describes what the supplement does',
        'That malate contributes anything, which no trial has separated from citrulline',
        'That a stated gram dose of citrulline malate corresponds to a known citrulline dose without the ratio',
      ],
      whatFailedInitially: [
        'L-arginine supplementation itself, defeated by intestinal arginase before absorption',
        'Flow-mediated vasodilation, the functional endpoint that the pharmacokinetic success was supposed to deliver',
      ],
      realWorldOutcome: [
        'The pharmacokinetic case for citrulline over arginine is genuinely strong and well demonstrated',
        'The performance effect is real and small — roughly three additional repetitions in a session',
        'Almost all of it is sold inside pre-workout blends alongside caffeine, which has a far larger evidence base for the same perceived outcome',
      ],
    },
    deliverySystem: {
      type: 'Oral powder or capsule, as citrulline malate 2:1 or 1:1, or as plain L-citrulline',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy or safety before sale. The citrulline-to-malate ratio determines the actual citrulline dose and is often undisclosed, which means two products labelled with the same gram figure can differ by around a third in the ingredient with the evidence. Citrulline malate is strongly sour, which makes placebo matching difficult and is a plausible source of unblinding in the trial literature. It is overwhelmingly consumed inside multi-ingredient pre-workout formulas, where any subjective effect is unattributable.',
      safetyProfile:
        'Gastrointestinal discomfort is the main reported effect and appeared in 14.63% of subjects in the original crossover, plausibly driven by the malate load and the acidity rather than by citrulline itself. Citrulline is well tolerated at the doses studied and has no established toxicity in healthy adults. Because it raises nitric oxide signalling, theoretical interaction with nitrates and phosphodiesterase-5 inhibitors is worth noting even though it has not been demonstrated. Long-term safety data beyond short trial durations do not exist.',
    },
    commonQuestions: [
      {
        q: 'Is citrulline better than arginine?',
        a: 'For raising blood arginine, unambiguously yes, and this is the best-established fact on the page. In a head-to-head crossover in 20 volunteers, citrulline raised both the peak and the total exposure of plasma arginine more effectively than arginine did, because oral arginine is largely destroyed by an enzyme in the intestinal wall before it reaches the circulation. Citrulline avoids that enzyme and is converted to arginine by the kidney afterwards.',
      },
      {
        q: 'So does that mean my blood vessels open up more?',
        a: 'That is the part the same trial answered, and it answered no. Alongside the pharmacokinetics, the investigators measured flow-mediated vasodilation and reported that no treatment improved it over baseline. Downstream markers — urinary nitrate and cyclic GMP — did rise. The likely reason the function did not follow is that the enzyme making nitric oxide already has far more arginine available inside the cell than it needs, so adding substrate to a non-substrate-limited enzyme changes the chemistry without changing the physiology.',
        auditNote:
          'This negative result is the load-bearing one for the whole nitric oxide supplement category, and it is almost never quoted.',
      },
      {
        q: 'What about the study showing 53 percent more reps?',
        a: 'It exists, it was double-blind and randomised, and it is not the number to use. In 41 men, citrulline malate increased repetitions from the third evaluated set onward, and the 52.92 percent figure comes from the final set, having grown with set number. When eight trials in 137 participants were pooled in 2021, the effect was an increase of 3 ± 5 repetitions across an entire session, about 6.4 percent, with a small effect size of 0.196. Both results are honestly reported; only the pooled one should decide anything.',
      },
      {
        q: 'Does the malate part do anything?',
        a: 'Nobody knows, because nobody has tested it. Malate is a tricarboxylic acid cycle intermediate, which is the stated rationale for the combination, but no adequately powered trial has compared citrulline malate against an equal amount of plain citrulline. The awkward consequence is that the mechanism cited for the product comes from pharmacokinetic studies of citrulline alone, while the performance trials were run on a salt whose other half is unstudied.',
      },
      {
        q: 'How do I know how much citrulline I am actually taking?',
        a: 'Check the ratio, and be prepared not to find it. A 2:1 citrulline malate is roughly two-thirds citrulline by mass, so 8 grams supplies about 5.3 grams; a 1:1 product supplies about 4 grams for the same label figure. Many products state neither the ratio nor, inside a proprietary blend, the amount. Two tubs with identical numbers on the front can differ by about a third in the ingredient the evidence is about.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Schwedhelm E et al. Pharmacokinetic and pharmacodynamic properties of oral L-citrulline and L-arginine: impact on nitric oxide metabolism. Br J Clin Pharmacol 2008;65:51-59',
        identifier: '10.1111/j.1365-2125.2007.02990.x',
        kind: 'doi',
      },
      {
        label:
          'Perez-Guisado J, Jakeman PM. Citrulline malate enhances athletic anaerobic performance and relieves muscle soreness. J Strength Cond Res 2010;24:1215-1222',
        identifier: '10.1519/JSC.0b013e3181cb28e0',
        kind: 'doi',
      },
      {
        label:
          'Varvik FT, Bjornsen T, Gonzalez AM. Acute effect of citrulline malate on repetition performance during strength training: a systematic review and meta-analysis. Int J Sport Nutr Exerc Metab 2021;31:350-358',
        identifier: '10.1123/ijsnem.2020-0295',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 9750 — L-Citrulline',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9750',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Selenium — the cleanest cautionary tale in this file. A trial that missed its primary endpoint
  // and whose secondary endpoints launched a 35,533-man prevention trial; that trial found no
  // benefit, more diabetes, and — in the vitamin E arm — significantly more prostate cancer.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'selenium',
    name: 'Selenium',
    tradeName:
      'Sold as L-selenomethionine, sodium selenite, sodium selenate or selenium-enriched yeast',
    sponsor:
      'No single sponsor — an essential trace element sold in several chemical forms. SELECT was funded by the National Cancer Institute and run by SWOG.',
    targetGene: 'GPX1',
    targetProtein:
      'The selenoproteins, of which there are 25 in humans, all containing selenium as selenocysteine encoded by a recoded UGA codon. The principal families are the glutathione peroxidases (GPX1-4), the thioredoxin reductases (TXNRD1-3) and the iodothyronine deiodinases (DIO1-3), which activate thyroid hormone. Selenium has no receptor: it is built into these proteins or it does nothing.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for immunity, thyroid function, antioxidant protection and — historically — cancer prevention. Not approved by the FDA or EMA for any of them. Selenium is a genuine essential trace element and its deficiency causes Keshan disease, an endemic cardiomyopathy, which is a real disease with a real cure.',
    patientFriendlyIndication:
      'Taken as an antioxidant and for thyroid and immune support',
    conditionContext: {
      conditionExplainer:
        'Selenium is not an antioxidant in itself. It is built into 25 human proteins as the amino acid selenocysteine, and some of those proteins are antioxidant enzymes. Once those enzymes have enough selenium to be made, additional selenium has nothing further to do — and the range between enough and too much is narrower than for any other nutrient in this file.',
      whyItMatters:
        'Selenium is the substance on which the antioxidant-prevention hypothesis was tested most seriously and failed most completely. The sequence — a trial that missed its primary endpoint, secondary findings that launched a 35,533-man prevention trial, and a result of no benefit plus signals of harm — is the reference case for how a supplement claim can survive for two decades on the strength of an analysis that was never designed to support it.',
      whoTakesThis:
        'People taking multivitamins, people with Hashimoto thyroiditis, and a smaller group taking it deliberately for cancer prevention on the strength of research that has since been overturned. Genuine deficiency occurs in low-selenium soil regions, most famously parts of China where Keshan disease was endemic.',
      clinicalGoals:
        'Trials measured incidence of basal and squamous cell skin cancer, total cancer incidence and mortality, prostate cancer incidence, incidence of type 2 diabetes, and in the toxicity literature serum and urine selenium concentrations against symptoms.',
    },
    oneSentenceVerdict:
      'Selenium is genuinely essential and cures a real deficiency cardiomyopathy, but the cancer prevention hypothesis it carried for twenty years was tested in 35,533 men and produced a prostate cancer hazard ratio of 1.09, no benefit on any prespecified endpoint, and a diabetes signal that a separate analysis of the founding trial put at a hazard ratio of 1.55.',
    laymanHowItWorks:
      'Selenium is not something your body burns or stores as fuel. It is inserted into twenty-five specific proteins as part of an unusual amino acid, and several of those proteins are the enzymes that neutralise peroxides and that switch thyroid hormone on. If you have enough selenium to build them, they work. If you have too little, they cannot be built, and in severe deficiency the heart muscle fails. Adding more selenium than the proteins need does not make them work harder — there is no more of them to make — and the excess accumulates, which is why selenium has one of the narrowest safe ranges of any nutrient.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 36,
    anatomicalSite:
      'Incorporated as selenocysteine into selenoproteins in every tissue; highest concentrations in thyroid, kidney and liver',
    substitutes: {
      summary:
        'For a genuine deficiency, selenium is not substitutable and the effects of correcting it are dramatic. For a replete adult, the comparator is nothing, and the two largest randomised trials say so. For thyroid autoimmunity the evidence is more open, and it is a different claim from the cancer one.',
      conventionalRx: [
        {
          name: 'Selenium repletion in Keshan disease',
          class: 'Nutrient replacement for an endemic deficiency cardiomyopathy',
          howItCompares:
            'In selenium-poor regions of China, selenium supplementation essentially eliminated an endemic and often fatal cardiomyopathy of children and young women. This is one of the clearest public-health nutrition successes on record.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: unambiguous, mechanistically explained, and it worked. Cons: it says nothing about supplementing a person whose selenoproteins are already saturated, which is what the two large trials tested and answered.',
        },
      ],
      naturalFoods: [
        {
          name: 'Brazil nuts',
          activeCompound: 'Selenomethionine, at concentrations high enough to matter in single nuts',
          biologicalMechanism:
            'Brazil nuts concentrate selenium from soil to a degree no other common food matches, and the content varies enormously with where the tree grew. A handful can exceed the tolerable upper intake level, which makes them the one food in ordinary circulation capable of causing a nutrient toxicity.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the recommended dietary allowance referenced in the poisoning investigation is 55 micrograms per day, and the trials used 200 micrograms per day.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Seafood, organ meat and cereals grown on selenium-replete soil',
          activeCompound: 'Selenomethionine and selenocysteine from plant and animal protein',
          biologicalMechanism:
            'Dietary selenium content tracks soil selenium, which is why deficiency is geographic rather than dietary in the usual sense. Selenomethionine is incorporated non-specifically in place of methionine and forms a tissue reservoir; selenite and selenate are not stored this way, which is why the chemical form changes the pharmacokinetics substantially.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Check whether the endpoint was primary or secondary',
          action:
            'The entire selenium cancer prevention era rests on secondary endpoint analyses from a trial whose primary endpoints were negative.',
          patientImpact:
            'In the Nutritional Prevention of Cancer trial, selenium did not reduce basal cell carcinoma (RR 1.10, 95% CI 0.95 to 1.28) or squamous cell carcinoma (RR 1.14, 95% CI 0.93 to 1.39) — the primary endpoints, both numerically worse on selenium. The secondary analyses showed reduced total cancer incidence (RR 0.63) and mortality (RR 0.50), and it was those that launched twenty years of supplementation.',
          clinicalPrecaution:
            'When SELECT tested the secondary finding as a primary endpoint in 35,533 men, it did not replicate.',
        },
        {
          name: 'Respect the narrow window',
          action:
            'Selenium has one of the smallest gaps between recommended intake and toxicity of any nutrient, and supplement manufacturing errors are not hypothetical.',
          patientImpact:
            'A liquid supplement containing 200 times its labelled selenium concentration poisoned 201 people across 10 states, at a median estimated dose of 41,749 micrograms per day against a recommended allowance of 55.',
          clinicalPrecaution:
            'Hair loss, nail discoloration and loss, fatigue and joint pain were the leading symptoms, and at 90 days more than half still had fingernail discoloration or loss.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C[Se]CCC(C(=O)O)N',
      chemicalFormula: 'C5H11NO2Se',
      molecularWeight:
        '196.12 g/mol. This is L-selenomethionine, the form used in both SELECT and the Nutritional Prevention of Cancer trial, and the marker the literature actually tracks. Selenium is also sold as sodium selenite and selenate, which are inorganic, are not incorporated in place of methionine, and have different tissue retention.',
      structureSource: {
        label: 'PubChem CID 15103 — Selenomethionine, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/15103',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'se-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Total selenium and speciation, with an overdose failure mode in mind',
          description:
            'Total selenium alone is insufficient in both directions. It does not distinguish selenomethionine from selenite, which behave differently in the body, and a formulation error can put the total far above label — as it did in the 2008 outbreak, at 200 times the declared concentration. Both the amount and the species must be measured on the finished product, not on the raw material.',
          reagentsAndBuffer:
            'Microwave acid digestion with nitric acid and hydrogen peroxide; ICP-MS for total selenium in collision-cell mode to suppress argon dimer interference; HPLC-ICP-MS speciation resolving selenomethionine, selenocysteine, selenite and selenate; NIST-traceable selenium reference material as accuracy control',
        },
        {
          id: 'se-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of an enriched-isotope tracer for retention studies',
          description:
            'Selenium status cannot be read from plasma alone because selenomethionine is stored non-specifically in the general protein pool while inorganic selenium is not. Distinguishing the functional selenoprotein pool from the storage pool requires an isotopically distinct tracer.',
          dependsOnStepId: 'se-w1',
          reagentsAndBuffer:
            '77Se- or 82Se-enriched selenomethionine and matched enriched sodium selenite; isotopic enrichment confirmed by ICP-MS; parallel unlabelled controls; sterile preparation where an intravenous reference arm is used',
        },
        {
          id: 'se-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation of selenoprotein P from the non-specific protein pool',
          description:
            'Plasma selenoprotein P is the functional status marker, because it saturates when selenoprotein synthesis is maximal and stops rising thereafter. Total plasma selenium keeps climbing with selenomethionine intake long after that point, which is exactly how an intake far above requirement can look like improving status.',
          dependsOnStepId: 'se-w2',
          reagentsAndBuffer:
            'Heparin-affinity chromatography for selenoprotein P isolation; immunoassay for selenoprotein P concentration; glutathione peroxidase 3 activity assay on the same samples; separate ICP-MS total plasma selenium for direct comparison',
        },
        {
          id: 'se-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Selenoprotein synthesis saturation and the pro-oxidant crossover',
          description:
            'Establish where selenoprotein synthesis stops responding to supply, and what happens above that point. Selenium is not simply inert above saturation: selenite and excess selenomethionine metabolites generate superoxide through redox cycling with thiols, which is a plausible mechanistic account of the harm signals in the human trials.',
          dependsOnStepId: 'se-w3',
          reagentsAndBuffer:
            'Human hepatocyte and prostate epithelial cell lines; selenomethionine and sodium selenite across a wide concentration range spanning nutritional to supraphysiological; 75Se metabolic labelling of selenoproteins; glutathione peroxidase and thioredoxin reductase activity assays; dihydroethidium superoxide probe; reduced and oxidised glutathione quantification',
        },
        {
          id: 'se-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Prespecified primary endpoints, and nothing else',
          description:
            'This step is the whole lesson of the selenium literature stated as a method. Register the primary endpoint, power the trial for it, and report secondary analyses as hypothesis-generating. The Nutritional Prevention of Cancer trial\'s secondary endpoints were established in 1990, seven years after randomisation began, and their apparent benefit is what sent 35,533 men into a trial that found nothing.',
          reagentsAndBuffer:
            'Prospective registration with a single named primary endpoint; independent data and safety monitoring board with predefined stopping rules; blinded endpoint adjudication; prespecified analysis plan lodged before unblinding; serum selenium measured at baseline and during follow-up to confirm adherence and to permit exposure-response analysis',
          dependsOnStepId: 'se-w4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'se-a1',
        category: 'failed',
        title: 'SELECT: 35,533 men, no prevention, and the trial stopped for futility',
        laymanSummary:
          'The definitive test of selenium for preventing prostate cancer enrolled 35,533 men across three countries. Selenium did not prevent prostate cancer or any other prespecified cancer.',
        technicalDetails:
          'The Selenium and Vitamin E Cancer Prevention Trial randomised 35,533 men at 427 sites in the United States, Canada and Puerto Rico between 2001 and 2004 to selenium 200 micrograms per day as L-selenomethionine, vitamin E 400 IU per day as all-rac-alpha-tocopheryl acetate, both, or placebo, with planned follow-up of 7 to 12 years. At the 2008 analysis, median follow-up 5.46 years, hazard ratios for prostate cancer against placebo were 1.04 (99% CI 0.87 to 1.24) for selenium, 1.13 (99% CI 0.95 to 1.35) for vitamin E and 1.05 (99% CI 0.88 to 1.25) for the combination. There were no significant differences on any other prespecified cancer endpoint, all P > .15. There were statistically non-significant increased risks of prostate cancer on vitamin E (P = .06) and of type 2 diabetes on selenium (relative risk 1.07, 99% CI 0.94 to 1.22, P = .16). The authors concluded that neither agent, alone or combined, at the doses and formulations used, prevented prostate cancer. Every direction of effect in that paragraph points the wrong way for a preventive agent.',
        evidenceSource: 'Lippman SM et al. JAMA 2009;301:39-51',
        doi: '10.1001/jama.2008.864',
        measuredMetric:
          'Prostate cancer incidence and prespecified secondary cancer endpoints over a median 5.46 years',
        auditFlag: 'verified',
      },
      {
        id: 'se-a2',
        category: 'failed',
        title: 'With longer follow-up, vitamin E significantly increased prostate cancer',
        laymanSummary:
          'When SELECT was followed for longer, the vitamin E arm showed a statistically significant seventeen percent increase in prostate cancer.',
        technicalDetails:
          'Klein and colleagues reported the extended SELECT analysis with 54,464 additional person-years and 521 additional prostate cancers. Against 529 cases in the placebo group, 620 men in the vitamin E group developed prostate cancer (hazard ratio 1.17, 99% CI 1.004 to 1.36, P = .008), 575 in the selenium group (HR 1.09, 99% CI 0.93 to 1.27, P = .18), and 555 in the selenium plus vitamin E group (HR 1.05, 99% CI 0.89 to 1.22, P = .46). The absolute increase in risk per 1,000 person-years against placebo was 1.6 for vitamin E, 0.8 for selenium and 0.4 for the combination. The stated conclusion was that dietary supplementation with vitamin E significantly increased the risk of prostate cancer among healthy men. Two things deserve emphasis. This is a positive finding of harm in a trial designed to find benefit, from a nutrient marketed as protective for decades. And the combination arm was less harmful than vitamin E alone, which is the kind of interaction that makes antioxidant pharmacology in vivo unpredictable rather than reassuring.',
        evidenceSource: 'Klein EA et al. JAMA 2011;306:1549-1556',
        doi: '10.1001/jama.2011.1437',
        measuredMetric: 'Prostate cancer incidence with extended follow-up in SELECT',
        auditFlag: 'verified',
      },
      {
        id: 'se-a3',
        category: 'conclusion_shift',
        title: 'The founding trial missed both primary endpoints, and nobody remembers that',
        laymanSummary:
          'The trial that started the selenium-and-cancer story was testing skin cancer. Selenium did not reduce skin cancer — it was numerically worse. The famous result came from secondary analyses added seven years into the trial.',
        technicalDetails:
          'Clark and colleagues randomised 1,312 patients with a history of basal or squamous cell skin carcinoma to 200 micrograms of selenium daily or placebo, from 1983 to 1991, with a mean treatment period of 4.5 years and total follow-up of 6.4 years. The primary endpoints were incidences of basal and squamous cell skin carcinoma, and selenium did not affect either: 377 new basal cell cancers on selenium against 350 on control (RR 1.10, 95% CI 0.95 to 1.28) and 218 squamous cell cancers against 190 (RR 1.14, 95% CI 0.93 to 1.39). Both numerically favoured placebo. The secondary endpoints, established in 1990 — seven years after randomisation began — showed reduced total cancer mortality (29 versus 57 deaths, RR 0.50, 95% CI 0.31 to 0.80), reduced total cancer incidence (77 versus 119, RR 0.63, 95% CI 0.47 to 0.85), and reductions in lung, colorectal and prostate cancer. The blinded phase was stopped early primarily because of those secondary findings. That decision — stopping a trial early on endpoints added mid-course, after the prespecified ones had failed — is what put selenium in millions of multivitamins and what SELECT was built to confirm.',
        evidenceSource: 'Clark LC et al. JAMA 1996;276:1957-1963',
        doi: '10.1001/jama.1996.03540240035027',
        measuredMetric:
          'Incidence of basal and squamous cell skin carcinoma as primary endpoints, and total cancer incidence and mortality as secondary endpoints',
        inferredClaim:
          'That secondary endpoints added seven years into a trial, in a study whose primary endpoints were negative, can establish a preventive effect',
        auditFlag: 'verified',
      },
      {
        id: 'se-a4',
        category: 'failed',
        title: 'The same trial\'s data showed selenium raised type 2 diabetes risk by 55 percent',
        laymanSummary:
          'A later analysis of the founding trial found that people taking selenium developed type 2 diabetes more often, with the highest risk in those who already had the most selenium in their blood.',
        technicalDetails:
          'Stranges and colleagues analysed diabetes incidence among 1,202 participants in the Nutritional Prevention of Cancer trial who did not have type 2 diabetes at baseline, in low-selenium areas of the eastern United States. Over a mean 7.7 years, type 2 diabetes developed in 58 selenium recipients and 39 placebo recipients — 12.6 versus 8.4 cases per 1,000 person-years, hazard ratio 1.55 (95% CI 1.03 to 2.33). The lack of benefit persisted across strata of age, sex, body mass index and smoking. Critically, an exposure-response gradient was found across tertiles of baseline plasma selenium, with a significantly increased risk in the highest tertile (hazard ratio 2.70, 95% CI 1.30 to 5.61). The authors concluded selenium does not seem to prevent type 2 diabetes and may increase risk. Diabetes was a secondary outcome and diagnoses were self-reported, which the authors state as limitations. But the exposure-response gradient — most harm in those who started with the most selenium — is exactly the pattern a genuine toxicity produces and the opposite of what a repletion effect looks like.',
        evidenceSource: 'Stranges S et al. Ann Intern Med 2007;147:217-223',
        doi: '10.7326/0003-4819-147-4-200708210-00175',
        measuredMetric:
          'Incidence of type 2 diabetes per 1,000 person-years, stratified by baseline plasma selenium tertile',
        auditFlag: 'verified',
      },
      {
        id: 'se-a5',
        category: 'failed',
        title: 'A manufacturing error poisoned 201 people across ten states',
        laymanSummary:
          'A liquid supplement was made with two hundred times the selenium on its label. Two hundred and one people were poisoned, and half still had nail damage three months later.',
        technicalDetails:
          'MacFarquhar and colleagues investigated an outbreak of acute selenium poisoning traced to a liquid dietary supplement containing 200 times its labelled selenium concentration. Two hundred and one cases were identified across 10 states, with one hospitalisation. The median estimated selenium dose consumed was 41,749 micrograms per day against a recommended dietary allowance of 55 micrograms. Reported symptoms included diarrhoea in 78%, fatigue 75%, hair loss 72%, joint pain 70%, nail discoloration or brittleness 61% and nausea 58%. At 90 days or longer, 52% still had fingernail discoloration and loss, 35% fatigue and 29% hair loss. Mean initial serum selenium in 8 patients was 751 micrograms per litre against a reference of 125 or less, and mean initial urine selenium in 7 patients was 166 micrograms per 24 hours against a reference of 55 or less. The authors\' conclusion is the audit: "Had the manufacturers been held to standards used in the pharmaceutical industry, it may have been prevented." Selenium\'s narrow margin between requirement and toxicity makes it the nutrient least tolerant of the manufacturing regime it is sold under.',
        evidenceSource: 'MacFarquhar JK et al. Arch Intern Med 2010;170:256-261',
        doi: '10.1001/archinternmed.2009.495',
        measuredMetric:
          'Serum and urine selenium concentrations, symptom prevalence at onset and at 90-day follow-up',
        auditFlag: 'verified',
      },
      {
        id: 'se-a6',
        category: 'measured',
        title: 'Selenium is genuinely essential, and the deficiency disease is real',
        laymanSummary:
          'In parts of China with selenium-poor soil, deficiency caused a fatal heart muscle disease in children and young women. Supplementation essentially eliminated it.',
        technicalDetails:
          'Selenium is incorporated as selenocysteine into 25 human selenoproteins, including the glutathione peroxidases, the thioredoxin reductases and the iodothyronine deiodinases that activate thyroid hormone. Severe deficiency in low-soil-selenium regions produced Keshan disease, an endemic cardiomyopathy, and supplementation programmes largely eliminated it — one of the clearest nutritional public health successes recorded. This is the fact that every selenium supplement claim leans on, and it is genuine. It is also, precisely, a deficiency effect. The 200 microgram daily doses used in the Nutritional Prevention of Cancer trial and in SELECT were nearly four times the recommended dietary allowance of 55 micrograms, administered to populations that were not deficient, on the hypothesis that more selenoprotein activity would prevent cancer. Selenoprotein synthesis saturates; the doses did not.',
        evidenceSource: 'MacFarquhar JK et al. Arch Intern Med 2010;170:256-261',
        doi: '10.1001/archinternmed.2009.495',
        measuredMetric:
          'Recommended dietary allowance of 55 micrograms per day against the 200 micrograms per day used in the prevention trials',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed as an amino acid, or as a salt, and the difference matters',
        laymanDesc:
          'Selenium comes in two kinds. The organic form is absorbed like an amino acid and stored in your proteins. The inorganic salts are not stored the same way.',
        molecularDetail:
          'Selenomethionine is absorbed by neutral amino acid transporters and incorporated non-specifically in place of methionine throughout the body\'s proteins, creating a large storage pool. Sodium selenite and selenate enter a smaller regulated pool. Both SELECT and the Nutritional Prevention of Cancer trial used L-selenomethionine, which means their results speak to the organic form and their tissue kinetics do not transfer to selenite products.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is written into proteins by a recoded stop codon',
        laymanDesc:
          'Selenium enters proteins as a special amino acid, inserted at a position that normally means "stop". Only twenty-five human proteins are built this way.',
        molecularDetail:
          'Selenocysteine is encoded by UGA, ordinarily a stop codon, recoded in the presence of a selenocysteine insertion sequence element in the 3-prime untranslated region. The 25-member human selenoproteome includes GPX1-4, TXNRD1-3 and DIO1-3. This machinery is the reason selenium has effects at all, and the reason those effects saturate: there are only so many selenoproteins to make.',
        iconName: 'Dna',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Those proteins neutralise peroxides and activate thyroid hormone',
        laymanDesc:
          'The selenium-containing enzymes clear peroxides from cells and convert thyroid hormone into its active form. That is the whole of what selenium does.',
        molecularDetail:
          'Glutathione peroxidases reduce hydrogen peroxide and lipid hydroperoxides using glutathione; thioredoxin reductases maintain the thioredoxin system; iodothyronine deiodinases remove iodine from thyroxine to generate the active triiodothyronine. The thyroid holds the highest tissue selenium concentration in the body, which is the mechanistic basis for the separate and more open question of selenium in autoimmune thyroiditis.',
        iconName: 'Shield',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Synthesis saturates, and beyond it selenium turns pro-oxidant',
        laymanDesc:
          'Once there is enough selenium to build all those proteins, extra selenium does not build more. It accumulates instead, and at high enough levels it starts generating the damage it was supposed to prevent.',
        molecularDetail:
          'Plasma selenoprotein P saturates at intakes near the requirement while total plasma selenium continues rising with selenomethionine intake, so total selenium can look like improving status long after function has plateaued. Above saturation, selenium metabolites redox-cycle with cellular thiols and generate superoxide, which is the most plausible mechanistic account of the diabetes and cancer signals in the human trials.',
        iconName: 'Flame',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measured outcomes were no benefit, more diabetes, and more cancer',
        laymanDesc:
          'The two largest trials found no cancer prevention, a hazard ratio of 1.55 for diabetes in one, and a significant seventeen percent increase in prostate cancer in the vitamin E arm of the other.',
        molecularDetail:
          'SELECT: prostate cancer hazard ratios 1.04 for selenium and 1.13 for vitamin E at first analysis, 1.09 and 1.17 with extended follow-up, the vitamin E result significant at P = .008. Nutritional Prevention of Cancer trial secondary analysis: type 2 diabetes hazard ratio 1.55 (95% CI 1.03 to 2.33), rising to 2.70 in the highest baseline selenium tertile.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NCT00006392 — SELECT, selenium and vitamin E for prostate cancer prevention',
        phase: 'Phase 3 randomised double-blind placebo-controlled',
        sampleSize: 35533,
        primaryEndpoint: 'Incidence of prostate cancer',
        endpointMet: false,
        statisticalPValue:
          'Selenium HR 1.04 (99% CI 0.87 to 1.24); vitamin E HR 1.13 (99% CI 0.95 to 1.35); combination HR 1.05 (99% CI 0.88 to 1.25); no prespecified endpoint reached significance, all P > .15',
        unreportedAdverseSignals:
          'Non-significant increases in prostate cancer on vitamin E (P = .06) and in type 2 diabetes on selenium (RR 1.07, P = .16) at first analysis. With extended follow-up the vitamin E prostate cancer increase became significant at HR 1.17 (P = .008).',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Nutritional Prevention of Cancer trial (Clark 1996)',
        phase: 'Multicentre randomised double-blind placebo-controlled',
        sampleSize: 1312,
        primaryEndpoint: 'Incidence of basal cell and squamous cell carcinoma of the skin',
        endpointMet: false,
        statisticalPValue:
          'Basal cell RR 1.10 (95% CI 0.95 to 1.28); squamous cell RR 1.14 (95% CI 0.93 to 1.39) — both numerically favouring placebo',
        unreportedAdverseSignals:
          'Secondary endpoints were established in 1990, seven years after randomisation began, and the blinded phase was stopped early primarily because of them. Both primary endpoints were negative, which is rarely mentioned when the secondary results are cited.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Stranges 2007 — selenium and incidence of type 2 diabetes',
        phase: 'Secondary analysis of a randomised double-blind placebo-controlled trial',
        sampleSize: 1202,
        primaryEndpoint: 'Incidence of type 2 diabetes over a mean 7.7 years',
        endpointMet: false,
        statisticalPValue:
          '12.6 versus 8.4 cases per 1,000 person-years, hazard ratio 1.55 (95% CI 1.03 to 2.33); highest baseline selenium tertile HR 2.70 (95% CI 1.30 to 5.61)',
        unreportedAdverseSignals:
          'Diabetes was a secondary outcome of the parent trial and diagnoses were self-reported, though validated in most participants. The sample was mostly older and white. The exposure-response gradient by baseline selenium is the finding hardest to dismiss.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'MacFarquhar 2010 — acute selenium toxicity outbreak investigation',
        phase: 'Multi-state outbreak investigation',
        sampleSize: 201,
        primaryEndpoint: 'Symptoms of selenium toxicity after ingestion of a mislabelled supplement',
        endpointMet: false,
        statisticalPValue:
          'Median estimated dose 41,749 micrograms per day against a 55 microgram recommended allowance; mean initial serum selenium 751 micrograms/L against a reference of 125 or less',
        unreportedAdverseSignals:
          'At 90 days or longer, 52% still had fingernail discoloration and loss, 35% fatigue and 29% hair loss. The product contained 200 times its labelled selenium concentration and reached consumers in 10 states.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Selenium did not prevent prostate cancer in 35,533 men; hazard ratio 1.04 initially and 1.09 with extended follow-up',
        'Vitamin E in the same trial significantly increased prostate cancer, hazard ratio 1.17 (99% CI 1.004 to 1.36, P = .008)',
        'Selenium increased type 2 diabetes incidence, hazard ratio 1.55, rising to 2.70 in the highest baseline selenium tertile',
        'The founding trial missed both primary skin cancer endpoints, with both numerically favouring placebo',
        'A supplement containing 200 times its labelled selenium poisoned 201 people, with persistent nail and hair effects at 90 days',
      ],
      unsupportedInferences: [
        'That selenium prevents cancer, which two large randomised trials tested directly and rejected',
        'That secondary endpoints added seven years into a negative trial can establish a preventive effect',
        'That because selenium is an antioxidant cofactor, more of it means more antioxidant protection',
        'That an essential nutrient with a documented deficiency disease is therefore safe in excess',
      ],
      whatFailedInitially: [
        'The entire selenium cancer prevention hypothesis, in the largest trial ever run to test it',
        'Vitamin E alongside it, which produced a statistically significant increase in prostate cancer',
        'The primary endpoints of the founding trial, which are almost never mentioned when its secondary results are cited',
      ],
      realWorldOutcome: [
        'Selenium is genuinely essential and correcting real deficiency eliminated an endemic fatal cardiomyopathy',
        'The gap between requirement and toxicity is narrower than for any other nutrient in this file',
        'This is the reference case for how a supplement claim survives on an analysis that was never designed to support it',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet or capsule, as selenomethionine, sodium selenite, sodium selenate or high-selenium yeast',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale — a regime whose consequences the 2008 poisoning outbreak demonstrated directly, with a product carrying 200 times its declared selenium reaching consumers in ten states. Chemical form changes the pharmacokinetics substantially: selenomethionine is incorporated non-specifically into body protein and accumulates, while inorganic selenite and selenate are not stored that way. Both large prevention trials used L-selenomethionine, so their results do not straightforwardly transfer to selenite products.',
      safetyProfile:
        'Chronic excess produces selenosis: hair loss, nail discoloration and brittleness, garlic breath odour, fatigue, joint pain, gastrointestinal upset and, in severe cases, peripheral neuropathy. In the documented outbreak, more than half of affected people still had fingernail discoloration and loss at 90 days. Randomised evidence links 200 micrograms per day to increased type 2 diabetes incidence, with the greatest risk in those who already had the highest baseline selenium. Brazil nuts are the one common food capable of delivering a toxic intake. The tolerable upper intake level sits only a few multiples above the recommended allowance, which is the narrowest margin of any nutrient on this site.',
    },
    commonQuestions: [
      {
        q: 'Does selenium prevent cancer?',
        a: 'No. This was tested as directly as such a question can be tested: 35,533 men randomised to selenium, vitamin E, both or placebo, followed for up to twelve years. The prostate cancer hazard ratio for selenium was 1.04 at first analysis and 1.09 with extended follow-up, and no other prespecified cancer endpoint reached significance. The vitamin E arm went in the wrong direction significantly, with a 17 percent increase in prostate cancer.',
      },
      {
        q: 'Where did the cancer prevention idea come from then?',
        a: 'From secondary endpoints of a trial that missed both its primary ones. The 1996 Nutritional Prevention of Cancer trial was testing whether selenium reduced skin cancer, and it did not — basal cell relative risk 1.10, squamous cell 1.14, both numerically worse on selenium. Secondary endpoints added in 1990, seven years after randomisation began, showed reduced total cancer incidence and mortality, and the trial was stopped early largely because of them. Those secondary findings put selenium into millions of multivitamins and sent 35,533 men into SELECT.',
        auditNote:
          'This is the reference case on this site for the difference between a prespecified endpoint and a discovered one.',
      },
      {
        q: 'Is there a downside to taking it?',
        a: 'Two documented ones. A secondary analysis of the same founding trial found type 2 diabetes developing more often on selenium — 12.6 versus 8.4 cases per 1,000 person-years, hazard ratio 1.55 — with the risk rising to 2.70 in people whose baseline blood selenium was already highest. And selenium has the narrowest gap between requirement and toxicity of any nutrient here: chronic excess causes hair loss, nail loss, fatigue and neuropathy.',
      },
      {
        q: 'But selenium is essential, isn\'t it?',
        a: 'Completely, and the deficiency disease is severe. In selenium-poor regions of China, deficiency caused Keshan disease, an endemic cardiomyopathy that killed children and young women, and supplementation essentially eliminated it. Selenium is written into twenty-five human proteins including the enzymes that clear peroxides and activate thyroid hormone. All of that is true and none of it supports supplementing someone who already has enough — the proteins saturate, and there are no more of them to make.',
      },
      {
        q: 'How dangerous is a bad batch?',
        a: 'The answer is on the record. In 2008 a liquid supplement was manufactured with 200 times its labelled selenium concentration. Two hundred and one people across ten states were poisoned, taking a median estimated 41,749 micrograms a day against a recommended 55. Seventy-two percent lost hair, 61 percent had nail damage, and at three months more than half still had fingernail discoloration and loss. The investigators\' conclusion was that pharmaceutical manufacturing standards would likely have prevented it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Clark LC et al. Effects of selenium supplementation for cancer prevention in patients with carcinoma of the skin: a randomized controlled trial. JAMA 1996;276:1957-1963',
        identifier: '10.1001/jama.1996.03540240035027',
        kind: 'doi',
      },
      {
        label:
          'Stranges S et al. Effects of long-term selenium supplementation on the incidence of type 2 diabetes: a randomized trial. Ann Intern Med 2007;147:217-223',
        identifier: '10.7326/0003-4819-147-4-200708210-00175',
        kind: 'doi',
      },
      {
        label:
          'Lippman SM et al. Effect of selenium and vitamin E on risk of prostate cancer and other cancers: the Selenium and Vitamin E Cancer Prevention Trial (SELECT). JAMA 2009;301:39-51',
        identifier: '10.1001/jama.2008.864',
        kind: 'doi',
      },
      {
        label:
          'MacFarquhar JK et al. Acute selenium toxicity associated with a dietary supplement. Arch Intern Med 2010;170:256-261',
        identifier: '10.1001/archinternmed.2009.495',
        kind: 'doi',
      },
      {
        label:
          'Klein EA et al. Vitamin E and the risk of prostate cancer: the Selenium and Vitamin E Cancer Prevention Trial (SELECT). JAMA 2011;306:1549-1556',
        identifier: '10.1001/jama.2011.1437',
        kind: 'doi',
      },
      {
        label: 'SELECT trial registration',
        identifier: 'NCT00006392',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 15103 — Selenomethionine',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/15103',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Coenzyme Q10 — a genuinely positive 420-patient heart failure trial, a Phase 3 Parkinson trial
  // stopped for futility with both dose arms trending worse, and a randomised test of the statin
  // myalgia claim in which more people on CoQ10 reported pain than on placebo.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'coenzyme-q10',
    name: 'Coenzyme Q10',
    tradeName: 'Ubiquinone (oxidised) and ubiquinol (reduced); also sold as ubidecarenone',
    sponsor:
      'No single sponsor — a benzoquinone with a ten-unit isoprenoid tail, produced by yeast or bacterial fermentation. Q-SYMBIO was investigator-initiated with support from Pharma Nord.',
    targetGene: 'COQ2',
    targetProtein:
      'The mitochondrial respiratory chain, where coenzyme Q10 is the mobile lipid-soluble electron carrier shuttling electrons from complexes I and II to complex III. COQ2 is the polyprenyltransferase whose loss-of-function mutations cause primary coenzyme Q10 deficiency — a real, rare disease in which supplementation is genuinely therapeutic.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for heart health, energy, statin-associated muscle pain and neuroprotection. Not approved by the FDA or EMA for any of them. Coenzyme Q10 is genuinely therapeutic in primary CoQ10 deficiency, a rare inherited disorder of its own biosynthesis, which is a different situation entirely.',
    patientFriendlyIndication:
      'Taken for heart health and energy, and especially by people on statins for muscle aches',
    conditionContext: {
      conditionExplainer:
        'Coenzyme Q10 carries electrons between the protein complexes of the mitochondrial respiratory chain. Without it, oxidative phosphorylation stops. It is also made by the same biochemical pathway that statins inhibit to lower cholesterol, which is the entire basis of the statin-muscle-pain claim.',
      whyItMatters:
        'CoQ10 is one of the few supplements in this file with a genuinely positive randomised mortality trial behind it — and also one with a Phase 3 neurology trial stopped for futility in which both dose arms trended worse than placebo. The claim most people buy it for, statin muscle pain, was tested directly in patients whose statin myalgia had been confirmed by rechallenge, and it failed.',
      whoTakesThis:
        'People taking statins, people with heart failure, older adults buying it for energy, and a small number of patients with genuine primary CoQ10 deficiency for whom it is a real treatment.',
      clinicalGoals:
        'Trials measured composite major adverse cardiovascular events, cardiovascular and all-cause mortality, NYHA functional class, six-minute walk distance, N-terminal pro-B-type natriuretic peptide, Brief Pain Inventory scores, muscle strength, maximal oxygen uptake, and Unified Parkinson\'s Disease Rating Scale progression.',
    },
    oneSentenceVerdict:
      'Q-SYMBIO randomised 420 heart failure patients and found major adverse cardiovascular events in 15% on CoQ10 against 26% on placebo with all-cause mortality 10% against 18% — a genuinely positive result — while the Phase 3 Parkinson trial was stopped for futility with both dose arms trending worse than placebo, and the statin myalgia trial found marginally more people reporting pain on CoQ10 than on placebo.',
    laymanHowItWorks:
      'Every cell makes its energy by passing electrons down a chain of proteins inside mitochondria, and coenzyme Q10 is the shuttle that carries electrons between two of those proteins. Your body makes its own, using the same chemical pathway that statins block to lower cholesterol — which is why statins lower blood CoQ10 and why it seemed obvious that replacing it would fix statin muscle pain. That reasoning is clean, the blood levels really do fall, and when the idea was tested in people whose statin muscle pain had been confirmed by rechallenge, giving them CoQ10 did not help.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 55,
    anatomicalSite:
      'Inner mitochondrial membrane in every tissue, with the highest concentrations in heart, kidney and liver',
    substitutes: {
      summary:
        'For heart failure, the comparator is guideline-directed medical therapy, and Q-SYMBIO tested CoQ10 as an addition to it rather than instead of it. For statin muscle pain the honest options are dose reduction, an alternative statin or a statin holiday under supervision, all of which have more support than CoQ10 does.',
      conventionalRx: [
        {
          name: 'Guideline-directed heart failure therapy',
          class: 'Neurohormonal blockade and device therapy',
          howItCompares:
            'Q-SYMBIO added CoQ10 to standard therapy rather than replacing it, and its hazard ratio of 0.50 for major adverse cardiovascular events is an adjunctive effect on top of that background. No trial has tested CoQ10 against or instead of guideline therapy, and none should.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: an adjunctive mortality signal from a two-year randomised trial is unusual for a supplement and this page records it as such. Cons: 420 patients is small for a mortality endpoint, and the result has not been reproduced at scale.',
        },
        {
          name: 'Statin dose reduction or switching, for muscle symptoms',
          class: 'Standard clinical management of statin intolerance',
          howItCompares:
            'The randomised test of CoQ10 in confirmed statin myalgia found no benefit on pain, strength or aerobic capacity, and marginally more subjects reported pain on CoQ10 than on placebo. Reducing dose, changing agent or alternate-day dosing address the exposure that is actually causing the symptom.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: targets the cause rather than a proposed downstream deficiency. Cons: requires a clinician, and lowering the dose lowers the lipid effect.',
        },
      ],
      naturalFoods: [
        {
          name: 'Organ meat, oily fish and whole grains',
          activeCompound: 'Ubiquinone, at concentrations far below supplemental doses',
          biologicalMechanism:
            'Dietary CoQ10 supplies only a small fraction of body content; most is synthesised endogenously through the mevalonate pathway. This is why a dietary correction argument is weak and why the statin interaction, which acts on synthesis rather than intake, was the mechanistically interesting claim.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: Q-SYMBIO used 100 mg three times daily, and the Parkinson trial used 1,200 and 2,400 mg per day — an order of magnitude apart.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Take it with fat, because absorption is the limiting step',
          action:
            'Coenzyme Q10 is a large, extremely lipophilic molecule with poor and variable oral absorption, and formulation changes exposure more than dose does.',
          patientImpact:
            'In the statin myalgia trial, 600 mg per day of ubiquinol raised serum CoQ10 from 1.3 +/- 0.4 to 5.2 +/- 2.3 micrograms per millilitre, a fourfold rise — and produced no benefit at all. Poor absorption is therefore not the explanation for that negative result.',
          clinicalPrecaution:
            'Any product claiming superior bioavailability should be judged on measured serum concentrations, not on formulation language.',
        },
        {
          name: 'Distinguish the heart failure result from everything else',
          action:
            'Check the population. Q-SYMBIO enrolled patients with moderate to severe chronic heart failure already on standard therapy.',
          patientImpact:
            'Its 2-year composite endpoint was reached by 15% on CoQ10 against 26% on placebo, hazard ratio 0.50 (95% CI 0.32 to 0.80, P = 0.003). But its own short-term endpoints at 16 weeks — NYHA class, six-minute walk and NT-proBNP — showed no significant changes.',
          clinicalPrecaution:
            'A trial whose short-term physiological endpoints were null and whose long-term hard endpoint was strongly positive is an unusual and not entirely comfortable pattern.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=C(C(=O)C(=C(C1=O)OC)OC)C/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CCC=C(C)C',
      chemicalFormula: 'C59H90O4',
      molecularWeight:
        '863.3 g/mol for ubiquinone, the oxidised form. Ubiquinol, the reduced form sold as a premium product, is the same molecule with two additional hydrogens at C59H92O4 and 865.4 g/mol. The ten-isoprene tail is what makes the molecule extremely lipophilic and its absorption poor.',
      structureSource: {
        label: 'PubChem CID 5281915 — Coenzyme Q10, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281915',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'coq-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Redox state and cis-trans isomer determination',
          description:
            'Two things distinguish CoQ10 products and neither is on a label. Ubiquinone and ubiquinol are different oxidation states and interconvert on exposure to air, so a product sold as ubiquinol may not be one by the time it is swallowed. Separately, synthetic CoQ10 can contain the cis isomer, which does not occur in nature and is not the fermentation product.',
          reagentsAndBuffer:
            'HPLC with electrochemical detection quantifying ubiquinone and ubiquinol separately in a single run; reversed-phase separation resolving all-trans from cis isomers against authenticated standards; nitrogen-blanketed sample preparation to prevent oxidation during handling; amber glassware',
        },
        {
          id: 'coq-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the deuterated internal standard and a shorter-chain analogue',
          description:
            'Endogenous CoQ10 is present in every sample, so administered CoQ10 cannot be quantified against it without a labelled standard. A shorter-chain analogue such as CoQ9, which is abundant in rodents and negligible in humans, serves as a second internal reference and as a control for extraction efficiency of the lipophilic quinone class.',
          dependsOnStepId: 'coq-w1',
          reagentsAndBuffer:
            'Deuterated coenzyme Q10 internal standard; coenzyme Q9 as a chain-length control; hexane or propanol extraction system optimised for quinone recovery; isotopic purity confirmed by LC-MS/MS',
        },
        {
          id: 'coq-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation of plasma lipoprotein-bound CoQ10 from the tissue-relevant pool',
          description:
            'Plasma CoQ10 travels almost entirely on LDL, so plasma concentration tracks LDL concentration as much as it tracks CoQ10 status — a confound that matters enormously when the population under study is taking statins, which lower LDL. Reporting plasma CoQ10 in statin users without normalising to LDL cholesterol conflates two effects.',
          dependsOnStepId: 'coq-w2',
          reagentsAndBuffer:
            'Density gradient ultracentrifugation to separate LDL, VLDL and HDL fractions; CoQ10 quantified per fraction and normalised to LDL cholesterol and to total plasma lipid; muscle biopsy homogenate as the tissue comparator',
        },
        {
          id: 'coq-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Does supplemental CoQ10 actually reach the mitochondrion?',
          description:
            'This is the unresolved question the whole category rests on. Raising plasma CoQ10 fourfold, as the statin myalgia trial did, tells you nothing about whether the inner mitochondrial membrane of a myocyte gained any. Measure incorporation directly with a labelled dose, in muscle, with respiratory function as the functional readout.',
          dependsOnStepId: 'coq-w3',
          reagentsAndBuffer:
            'Human myotubes and, in vivo, vastus lateralis biopsy after labelled oral dosing; mitochondrial isolation by differential centrifugation with citrate synthase as the normalising marker; LC-MS/MS quantification of labelled versus endogenous CoQ10 in the mitochondrial fraction; high-resolution respirometry with complex I and II substrates',
        },
        {
          id: 'coq-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Clinical endpoints reported alongside the achieved exposure',
          description:
            'Report the hard endpoint and the serum concentration achieved, together. The statin myalgia trial is the model here precisely because it did: serum CoQ10 rose from 1.3 to 5.2 micrograms per millilitre and pain scores did not improve, which converts an ambiguous negative into an informative one by ruling out under-dosing.',
          dependsOnStepId: 'coq-w4',
          reagentsAndBuffer:
            'Brief Pain Inventory severity and interference scores; isokinetic dynamometry for arm and leg strength; maximal oxygen uptake by graded exercise testing; blinded endpoint adjudication; serum CoQ10 measured at every visit to document achieved exposure',
        },
      ],
    },
    keyAudits: [
      {
        id: 'coq-a1',
        category: 'measured',
        title: 'Q-SYMBIO: major cardiovascular events halved in 420 heart failure patients',
        laymanSummary:
          'In a two-year randomised trial in people with moderate to severe heart failure, adding CoQ10 to standard treatment halved the rate of serious cardiovascular events and reduced deaths.',
        technicalDetails:
          'Q-SYMBIO randomised 420 patients with moderate to severe chronic heart failure to CoQ10 100 mg three times daily or placebo, in addition to standard therapy, over two years. The primary long-term endpoint, a composite of major adverse cardiovascular events analysed by time to first event, was reached by 15% of the CoQ10 group against 26% of placebo — hazard ratio 0.50 (95% CI 0.32 to 0.80, P = 0.003) by intention to treat. Secondary endpoints significantly lower on CoQ10 included cardiovascular mortality (9% versus 16%, P = 0.026) and all-cause mortality (10% versus 18%, P = 0.018). This is a genuinely positive randomised mortality result for a supplement and this page records it without hedging. Two features complicate it. The primary short-term endpoints at 16 weeks — change in NYHA functional class, six-minute walk distance and NT-proBNP — showed no significant changes at all, which is an odd shape for an effect that later halves mortality. And 420 patients is a small trial for a hard endpoint, and the result has not been reproduced in an independent trial of comparable size.',
        evidenceSource: 'Mortensen SA et al. JACC Heart Fail 2014;2:641-649',
        doi: '10.1016/j.jchf.2014.06.008',
        measuredMetric:
          'Composite major adverse cardiovascular events at 2 years, cardiovascular mortality and all-cause mortality',
        auditFlag: 'verified',
      },
      {
        id: 'coq-a2',
        category: 'failed',
        title: 'The statin muscle pain claim failed its direct randomised test',
        laymanSummary:
          'CoQ10 is bought mainly for statin muscle aches. In patients whose statin muscle pain was confirmed by rechallenge, CoQ10 did not reduce pain — and slightly more people on it reported pain than on placebo.',
        technicalDetails:
          'Taylor and colleagues first confirmed statin myalgia in 120 patients with prior symptoms using an eight-week randomised double-blind crossover of simvastatin 20 mg daily against placebo. Forty-one subjects who developed muscle pain on simvastatin but not on placebo were then randomised to simvastatin plus CoQ10 600 mg per day as ubiquinol, or simvastatin plus placebo, for eight weeks. Serum CoQ10 rose from 1.3 +/- 0.4 to 5.2 +/- 2.3 micrograms per millilitre on supplementation and fell on placebo (1.3 +/- 0.3 to 0.8 +/- 0.2), P < 0.05 — so the intervention unambiguously delivered. Brief Pain Inventory severity and interference scores both increased with simvastatin (both P < 0.01) irrespective of CoQ10 assignment (P = 0.53 and 0.56). There were no changes in muscle strength or maximal oxygen uptake with or without CoQ10, all P > 0.10. Marginally more subjects reported pain on CoQ10 than on placebo: 14 of 20 against 7 of 18, P = 0.05. The rechallenge design is what makes this trial matter — it excluded the majority of people with self-reported statin myalgia who do not reproduce it under blinding, and tested CoQ10 in the population where the claim should have been strongest.',
        evidenceSource: 'Taylor BA et al. Atherosclerosis 2015;238:329-335',
        doi: '10.1016/j.atherosclerosis.2014.12.016',
        measuredMetric:
          'Brief Pain Inventory severity and interference, muscle strength, and maximal oxygen uptake with confirmed statin myalgia',
        auditFlag: 'verified',
      },
      {
        id: 'coq-a3',
        category: 'failed',
        title: 'QE3: Phase 3 in Parkinson disease, terminated for futility, both arms worse',
        laymanSummary:
          'A 600-patient Phase 3 trial of high-dose CoQ10 in early Parkinson disease was stopped early for futility. Both dose groups declined slightly faster than placebo.',
        technicalDetails:
          'The Parkinson Study Group QE3 trial randomised 600 participants with Parkinson disease diagnosed within five years, at 67 North American sites, to placebo, 1,200 mg/day or 2,400 mg/day of CoQ10. Mean age was 62.5 years and mean baseline total UPDRS score 22.7. The study was terminated after a prespecified futility criterion was reached. At termination both active treatment groups showed slight adverse trends relative to placebo: adjusted mean worsening in total UPDRS from baseline to final visit was 6.9 points on placebo, 7.5 points on 1,200 mg/day (P = .49 versus placebo) and 8.0 points on 2,400 mg/day (P = .21). Treatments were well tolerated with no safety concerns, and the authors concluded there was no evidence of clinical benefit. The trial was built on preclinical models showing reduced dopamine neuron loss and on a Phase II study suggesting possible benefit — the standard sequence in which a promising small signal does not survive an adequately powered test. Note the dose: 2,400 mg per day is twenty-four times the amount per dose used in Q-SYMBIO.',
        evidenceSource: 'Parkinson Study Group QE3 Investigators. JAMA Neurol 2014;71:543-552',
        doi: '10.1001/jamaneurol.2014.131',
        measuredMetric:
          'Adjusted mean change in total Unified Parkinson\'s Disease Rating Scale score from baseline to final visit',
        auditFlag: 'verified',
      },
      {
        id: 'coq-a4',
        category: 'inferred',
        title: 'The mechanism for statin myalgia is sound, and the outcome still did not follow',
        laymanSummary:
          'Statins block the pathway that makes CoQ10, and blood CoQ10 really does fall on statins. The step from that to muscle pain, and from replacement to relief, is where the reasoning breaks.',
        technicalDetails:
          'HMG-CoA reductase inhibition reduces mevalonate, the precursor both of cholesterol and of the polyprenyl tail of coenzyme Q10, so statins lower circulating CoQ10. That much is uncontested. Two problems separate it from the clinical claim. First, plasma CoQ10 is transported almost entirely on LDL, so a fall in plasma CoQ10 on a statin is partly a fall in its carrier rather than a fall in tissue status, and studies of muscle CoQ10 in statin users have not consistently shown depletion. Second, and decisively, the causal chain was tested directly: raising serum CoQ10 fourfold in patients with rechallenge-confirmed statin myalgia produced no improvement in pain, strength or aerobic capacity. A meta-analysis of randomised trials of CoQ10 for statin-induced myopathy likewise found no significant effect on creatine kinase. This is one of the clearest examples in the file of a mechanistically compelling story that does not survive its own outcome trial.',
        evidenceSource:
          'Banach M et al. Mayo Clin Proc 2015;90:24-34; Taylor BA et al. Atherosclerosis 2015;238:329-335',
        doi: '10.1016/j.mayocp.2014.08.021',
        inferredClaim:
          'That because statins lower circulating CoQ10, replacing CoQ10 will relieve statin-associated muscle symptoms',
        auditFlag: 'caution',
      },
      {
        id: 'coq-a5',
        category: 'measured',
        title: 'A five-year Swedish trial found lower cardiovascular mortality — with selenium',
        laymanSummary:
          'A five-year randomised trial in elderly Swedes found reduced cardiovascular deaths on a combination of CoQ10 and selenium, in a population with low selenium intake.',
        technicalDetails:
          'Alehagen and colleagues randomised elderly Swedish citizens to combined selenium and coenzyme Q10 supplementation or placebo for five years, reporting reduced cardiovascular mortality and reduced N-terminal pro-B-type natriuretic peptide. Two contextual facts are essential and are usually dropped when the trial is cited. The intervention was a combination, so no effect can be attributed to CoQ10 alone. And Sweden has among the lowest soil and dietary selenium in Europe, meaning the population was plausibly selenium-insufficient at baseline — which makes this a repletion study in a deficient population rather than a supplementation study in a replete one. Read alongside the selenium record on this site, where 200 micrograms daily in a selenium-replete American population produced no cancer prevention and increased diabetes incidence, the contrast is the point: the same nutrient helps where there is a deficit and does not, or harms, where there is not.',
        evidenceSource: 'Alehagen U, Johansson P, Bjornstedt M, Rosen A, Dahlstrom U. Int J Cardiol 2013;167:1860-1866',
        doi: '10.1016/j.ijcard.2012.04.156',
        measuredMetric:
          'Cardiovascular mortality and N-terminal pro-B-type natriuretic peptide over five years',
        auditFlag: 'verified',
      },
      {
        id: 'coq-a6',
        category: 'inferred',
        title: 'Ubiquinol versus ubiquinone is a redox state, not a product class',
        laymanSummary:
          'The premium "ubiquinol" form is the same molecule carrying two extra hydrogens. It oxidises in air, and the body interconverts the two forms continuously anyway.',
        technicalDetails:
          'Ubiquinone (C59H90O4, 863.3 g/mol) and ubiquinol (C59H92O4, 865.4 g/mol) differ by a two-electron, two-proton reduction. The body interconverts them continuously — that interconversion is precisely what coenzyme Q10 does in the respiratory chain — and ingested ubiquinone is reduced to ubiquinol during absorption. Ubiquinol is also chemically unstable in air, so a product\'s redox state at manufacture is not necessarily its redox state at ingestion, and this is not verified on any label. The strongest available counter-evidence to the premium claim is the statin myalgia trial, which used 600 mg per day of ubiquinol specifically, achieved a fourfold rise in serum CoQ10, and produced no clinical benefit whatsoever. Whatever limits CoQ10\'s efficacy in that setting, it was not the redox state or the achieved blood level.',
        evidenceSource: 'Taylor BA et al. Atherosclerosis 2015;238:329-335',
        doi: '10.1016/j.atherosclerosis.2014.12.016',
        inferredClaim:
          'That ubiquinol is a superior product whose better absorption unlocks clinical effects ubiquinone cannot deliver',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorption is poor, variable, and the main practical constraint',
        laymanDesc:
          'CoQ10 is a big, greasy molecule and very little of a swallowed dose gets into the blood. How it is formulated changes absorption more than how much you take.',
        molecularDetail:
          'The ten-isoprene tail makes CoQ10 almost insoluble in water, with slow, lipid-dependent and highly variable absorption. In the statin myalgia trial, 600 mg per day of ubiquinol raised serum CoQ10 from 1.3 +/- 0.4 to 5.2 +/- 2.3 micrograms per millilitre — a fourfold increase, which establishes that inadequate absorption cannot explain that trial\'s null result.',
        iconName: 'Droplet',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It travels on LDL, which confuses every statin measurement',
        laymanDesc:
          'In the blood, CoQ10 is carried by LDL particles. Statins lower LDL, so they lower measured CoQ10 partly by lowering its transport, not necessarily by depleting tissue.',
        molecularDetail:
          'Plasma CoQ10 is carried predominantly on LDL, so plasma CoQ10 concentration covaries with LDL cholesterol. A statin-associated fall in plasma CoQ10 therefore conflates reduced synthesis with reduced carrier. Muscle CoQ10 content in statin users has not consistently shown depletion, which weakens the deficiency premise before any clinical trial is run.',
        iconName: 'Package',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Its job is shuttling electrons inside mitochondria',
        laymanDesc:
          'Inside mitochondria, CoQ10 is the ferry that carries electrons from the first two protein complexes to the third. Without it, energy production stops.',
        molecularDetail:
          'Coenzyme Q10 accepts electrons from complexes I and II and delivers them to complex III at the Qo site of the cytochrome bc1 complex, cycling between ubiquinone, semiquinone and ubiquinol. Loss-of-function mutations in the biosynthetic enzyme COQ2 cause primary coenzyme Q10 deficiency, a rare disease in which supplementation is genuinely therapeutic — and the only setting where a deficiency argument is established.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Statins reduce its synthesis, through the shared mevalonate pathway',
        laymanDesc:
          'The pathway statins block to lower cholesterol is the same one that builds CoQ10\'s tail. That shared step is the entire rationale for taking CoQ10 with a statin.',
        molecularDetail:
          'HMG-CoA reductase inhibition lowers mevalonate, the precursor of both cholesterol and the polyprenyl tail of CoQ10. The reasoning is sound as far as it goes. It stops at the outcome: in patients whose statin myalgia was confirmed by blinded rechallenge, quadrupling serum CoQ10 changed neither pain severity, nor pain interference, nor strength, nor VO2max.',
        iconName: 'GitBranch',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measured outcomes split sharply by population',
        laymanDesc:
          'In heart failure on standard therapy, a two-year trial halved major cardiac events. In early Parkinson disease, a Phase 3 trial was stopped for futility with both doses trending worse.',
        molecularDetail:
          'Q-SYMBIO: composite major adverse cardiovascular events 15% versus 26%, hazard ratio 0.50 (95% CI 0.32 to 0.80, P = 0.003); all-cause mortality 10% versus 18% (P = 0.018). QE3: adjusted UPDRS worsening 6.9 points on placebo, 7.5 on 1,200 mg/day and 8.0 on 2,400 mg/day, terminated at a prespecified futility criterion.',
        iconName: 'GitCompare',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Q-SYMBIO — coenzyme Q10 in chronic heart failure',
        phase: 'Randomised double-blind placebo-controlled multicentre, 2 years',
        sampleSize: 420,
        primaryEndpoint:
          'Composite major adverse cardiovascular events at 2 years by time to first event; short-term NYHA class, six-minute walk and NT-proBNP at 16 weeks',
        endpointMet: true,
        statisticalPValue:
          'Long-term composite 15% versus 26%, hazard ratio 0.50 (95% CI 0.32 to 0.80), P = 0.003; cardiovascular mortality 9% versus 16%, P = 0.026; all-cause mortality 10% versus 18%, P = 0.018',
        unreportedAdverseSignals:
          'The primary short-term endpoints at 16 weeks — NYHA class, six-minute walk distance and NT-proBNP — showed no significant changes. A mortality benefit with null physiological endpoints is an unusual shape, and 420 patients is small for a hard endpoint.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Taylor 2015 — CoQ10 in rechallenge-confirmed statin myalgia',
        phase: 'Randomised double-blind, following an 8-week crossover confirmation phase',
        sampleSize: 41,
        primaryEndpoint:
          'Brief Pain Inventory severity and interference, muscle strength and maximal oxygen uptake',
        endpointMet: false,
        statisticalPValue:
          'Pain severity P = 0.53 and interference P = 0.56 for CoQ10 assignment; strength and VO2max all P > 0.10; more subjects reported pain on CoQ10, 14 of 20 versus 7 of 18, P = 0.05',
        unreportedAdverseSignals:
          'Serum CoQ10 rose fourfold on supplementation, which rules out under-dosing as an explanation. Only 41 of 120 screened patients reproduced their myalgia under blinding, which is itself a finding about statin intolerance.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00740714 — QE3, high-dosage coenzyme Q10 in early Parkinson disease',
        phase: 'Phase 3 randomised placebo-controlled double-blind',
        sampleSize: 600,
        primaryEndpoint:
          'Change in total Unified Parkinson\'s Disease Rating Scale score from baseline to final visit',
        endpointMet: false,
        statisticalPValue:
          'Worsening 6.9 points placebo, 7.5 points on 1,200 mg/day (P = .49), 8.0 points on 2,400 mg/day (P = .21); terminated at a prespecified futility criterion',
        unreportedAdverseSignals:
          'Both active arms showed slight adverse trends relative to placebo. The trial followed a Phase II study that had suggested possible benefit, the standard pattern of a small promising signal failing an adequately powered test.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'KiSel-10 (Alehagen 2013) — selenium and coenzyme Q10 in elderly Swedes',
        phase: 'Prospective randomised double-blind placebo-controlled, 5 years',
        sampleSize: 443,
        primaryEndpoint: 'Cardiovascular mortality and N-terminal pro-B-type natriuretic peptide',
        endpointMet: true,
        statisticalPValue:
          'Reduced cardiovascular mortality and reduced NT-proBNP on combined selenium and coenzyme Q10 versus placebo over five years',
        unreportedAdverseSignals:
          'A combination intervention, so no effect is attributable to CoQ10 alone. Sweden has among the lowest dietary selenium in Europe, making this plausibly a repletion study in a selenium-insufficient population.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Major adverse cardiovascular events occurred in 15% on CoQ10 against 26% on placebo over two years in 420 heart failure patients',
        'All-cause mortality was 10% against 18% in the same trial',
        'In rechallenge-confirmed statin myalgia, CoQ10 changed neither pain, strength nor VO2max despite a fourfold rise in serum CoQ10',
        'A 600-patient Phase 3 Parkinson trial was terminated for futility with both dose arms trending worse than placebo',
      ],
      unsupportedInferences: [
        'That because statins lower circulating CoQ10, replacing it relieves statin muscle symptoms',
        'That ubiquinol is a clinically superior form, when the trial using 600 mg of ubiquinol found nothing',
        'That the heart failure result generalises to healthy people buying it for energy',
        'That the Swedish combination trial demonstrates anything about CoQ10 alone, or outside a low-selenium population',
      ],
      whatFailedInitially: [
        'CoQ10 for statin-associated muscle symptoms, the reason most of it is bought, in its most rigorous direct test',
        'CoQ10 as a neuroprotective agent in Parkinson disease, terminated at a prespecified futility criterion',
      ],
      realWorldOutcome: [
        'Q-SYMBIO is a real positive randomised mortality trial and this page says so without hedging',
        'It is also small, unreplicated, and its own short-term physiological endpoints were null',
        'The claim that sells the most product is the one that failed its own direct test most clearly',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or softgel, as ubiquinone or ubiquinol, usually in an oil base',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. Absorption is poor, lipid-dependent and highly variable, so formulation influences exposure more than label dose does, and any bioavailability claim should be judged on measured serum concentrations. Ubiquinol oxidises to ubiquinone in air, so a product\'s stated redox state is not verifiable at the point of use. Synthetic material can contain the non-natural cis isomer, which fermentation-derived material does not. Doses across the trial literature span more than an order of magnitude, from 300 mg per day in Q-SYMBIO to 2,400 mg per day in QE3.',
      safetyProfile:
        'Well tolerated across the trial literature, including at 2,400 mg per day for years in the Parkinson trial, where treatments were described as well tolerated with no safety concerns. Mild gastrointestinal upset and insomnia are the commonest complaints. CoQ10 is structurally related to vitamin K and can reduce the anticoagulant effect of warfarin, which is a genuine and clinically relevant interaction. In the statin myalgia trial, marginally more subjects reported muscle pain on CoQ10 than on placebo, which is a small and unexplained signal rather than an established harm.',
    },
    commonQuestions: [
      {
        q: 'Should I take CoQ10 with my statin?',
        a: 'The direct randomised answer is no. Researchers first confirmed statin muscle pain in patients by blinded rechallenge — only 41 of 120 with a prior history actually reproduced it — then gave those patients 600 mg a day of ubiquinol or placebo alongside simvastatin. Serum CoQ10 rose fourfold, so the supplement plainly worked as a supplement. Pain severity and interference did not improve, muscle strength and aerobic capacity did not change, and marginally more people on CoQ10 reported pain than on placebo.',
        auditNote:
          'This is the reason most CoQ10 is bought, and it is the claim with the clearest negative test.',
      },
      {
        q: 'But statins do lower CoQ10, don\'t they?',
        a: 'They lower it in blood, yes, and the mechanism is real: statins block the mevalonate pathway that builds both cholesterol and CoQ10\'s tail. Two complications sit between that and the clinical claim. Plasma CoQ10 rides on LDL particles, so lowering LDL lowers measured CoQ10 partly by removing its transport rather than by depleting tissue. And muscle CoQ10 content in statin users has not consistently shown depletion. The mechanism is compelling and the outcome trial is negative, which is the pattern this whole file is built around.',
      },
      {
        q: 'What about the heart failure result?',
        a: 'That one is genuinely positive and this page will not hedge it. Q-SYMBIO randomised 420 patients with moderate to severe heart failure, on top of standard therapy, and over two years major adverse cardiovascular events occurred in 15 percent on CoQ10 against 26 percent on placebo, with all-cause mortality 10 percent against 18 percent. The qualifications: 420 patients is small for a mortality endpoint, the result has not been independently reproduced at that scale, and the trial\'s own 16-week physiological endpoints — NYHA class, walk distance, NT-proBNP — showed nothing.',
      },
      {
        q: 'Is ubiquinol worth paying more for?',
        a: 'There is no clinical evidence that it is. Ubiquinol is the same molecule as ubiquinone carrying two extra hydrogens, the body interconverts the two continuously as part of what CoQ10 does for a living, and ubiquinol oxidises in air so a capsule\'s stated redox state may not survive to your mouth. The most informative data point is that the statin myalgia trial used ubiquinol specifically, at 600 mg a day, achieved a fourfold rise in blood levels, and found no benefit at all.',
      },
      {
        q: 'Does it protect the brain?',
        a: 'A 600-patient Phase 3 trial says no. QE3 randomised people with early Parkinson disease to placebo, 1,200 mg or 2,400 mg of CoQ10 daily and was stopped early when a prespecified futility criterion was reached. Both active groups declined slightly faster than placebo — 7.5 and 8.0 points of UPDRS worsening against 6.9 on placebo. The trial was built on preclinical models and a promising Phase II signal, and neither survived.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Alehagen U, Johansson P, Bjornstedt M, Rosen A, Dahlstrom U. Cardiovascular mortality and N-terminal-proBNP reduced after combined selenium and coenzyme Q10 supplementation. Int J Cardiol 2013;167:1860-1866',
        identifier: '10.1016/j.ijcard.2012.04.156',
        kind: 'doi',
      },
      {
        label:
          'Parkinson Study Group QE3 Investigators. A randomized clinical trial of high-dosage coenzyme Q10 in early Parkinson disease: no evidence of benefit. JAMA Neurol 2014;71:543-552',
        identifier: '10.1001/jamaneurol.2014.131',
        kind: 'doi',
      },
      {
        label:
          'Mortensen SA et al. The effect of coenzyme Q10 on morbidity and mortality in chronic heart failure: results from Q-SYMBIO, a randomized double-blind trial. JACC Heart Fail 2014;2:641-649',
        identifier: '10.1016/j.jchf.2014.06.008',
        kind: 'doi',
      },
      {
        label:
          'Banach M et al. Effects of coenzyme Q10 on statin-induced myopathy: a meta-analysis of randomized controlled trials. Mayo Clin Proc 2015;90:24-34',
        identifier: '10.1016/j.mayocp.2014.08.021',
        kind: 'doi',
      },
      {
        label:
          'Taylor BA et al. A randomized trial of coenzyme Q10 in patients with confirmed statin myopathy. Atherosclerosis 2015;238:329-335',
        identifier: '10.1016/j.atherosclerosis.2014.12.016',
        kind: 'doi',
      },
      {
        label: 'QE3 trial registration — coenzyme Q10 in early Parkinson disease',
        identifier: 'NCT00740714',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 5281915 — Coenzyme Q10 (ubiquinone)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281915',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Alpha-lipoic acid — a five-week symptom trial that looked convincing, a four-year trial that
  // missed its primary endpoint with more serious adverse events on treatment, and a 2021 Kidney
  // International report of biopsy-proven membranous nephropathy in a trial's treatment arm.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'alpha-lipoic-acid',
    name: 'Alpha-lipoic acid',
    tradeName: 'Also called thioctic acid or lipoic acid; sold as racemic ALA or as R-lipoic acid',
    sponsor:
      'No single sponsor — a dithiolane fatty acid, sold as a dietary supplement in the United States and as a prescription medicine for diabetic neuropathy in Germany and several other countries.',
    targetGene: 'DLAT',
    targetProtein:
      'Endogenous lipoic acid is a covalently bound cofactor of the E2 subunits of the mitochondrial dehydrogenase complexes — pyruvate dehydrogenase (DLAT), alpha-ketoglutarate dehydrogenase and the glycine cleavage system. Supplemental free alpha-lipoic acid is not incorporated into those enzymes. It acts as a free redox-active dithiol, which makes the supplement a different pharmacological entity from the cofactor it is named after.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for diabetic neuropathy, blood sugar, antioxidant support and weight loss. Not FDA-approved for anything; it is an approved prescription medicine for symptomatic diabetic polyneuropathy in Germany, where most of the clinical trial programme was designed.',
    patientFriendlyIndication:
      'Taken for nerve pain in diabetes, for blood sugar, and as a general antioxidant',
    conditionContext: {
      conditionExplainer:
        'Diabetic distal symmetric polyneuropathy produces burning, stabbing, tingling and numbness in the feet, and it progresses. It has two separable dimensions: the symptoms a patient feels, and the measurable damage to nerve function. A treatment can move one without moving the other, and this distinction decides how the lipoic acid literature reads.',
      whyItMatters:
        'Alpha-lipoic acid is the antioxidant supplement with the most serious clinical trial programme behind it — multicentre, randomised, and running out to four years — and the results split cleanly along that symptom-versus-damage line. It is also the entry in this file with the newest identified harm: a distinct form of kidney disease found in the treatment arm of a clinical trial.',
      whoTakesThis:
        'People with diabetic neuropathy, particularly in Germany where it is prescribed, people taking it for blood glucose or weight, and a general antioxidant market.',
      clinicalGoals:
        'Trials measured the Total Symptom Score for stabbing pain, burning pain, paraesthesia and numbness; the Neuropathy Impairment Score and its lower-limb subscale; nerve conduction and quantitative sensory testing; body weight and BMI; and in the harm literature, proteinuria and renal biopsy findings.',
    },
    oneSentenceVerdict:
      'Five weeks of oral alpha-lipoic acid reduced diabetic neuropathy symptom scores by about half against a third on placebo, but the four-year NATHAN 1 trial missed its primary composite endpoint at P = 0.105 with serious adverse events in 38.1% on treatment against 28.0% on placebo, and in 2021 five cases of NELL1-associated membranous nephropathy were traced to lipoic acid supplementation.',
    laymanHowItWorks:
      'Lipoic acid is a small sulphur-containing molecule that your mitochondria make and then permanently attach to a handful of enzymes, where it acts as a swinging arm passing chemical groups between reaction sites. Crucially, the lipoic acid in a capsule does not get attached to those enzymes — the attachment happens during enzyme assembly, from lipoic acid made inside the mitochondrion. What a supplement provides is free lipoic acid circulating in the body, which is a reactive sulphur compound that can be reduced and re-oxidised. That is a genuine chemistry, and it is not the chemistry the molecule is famous for.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 43,
    anatomicalSite:
      'Absorbed in the small intestine and distributed widely; endogenous lipoyl groups are covalently bound to mitochondrial dehydrogenase complexes, which supplemental lipoic acid does not join',
    substitutes: {
      summary:
        'For painful diabetic neuropathy, duloxetine, pregabalin and amitriptyline have larger and better-established effects and are guideline treatments. For glycaemic control, nothing in this category competes with glucose-lowering therapy. Lipoic acid\'s distinct position is a favourable side-effect profile relative to those drugs, which is a real consideration and not an efficacy argument.',
      conventionalRx: [
        {
          name: 'Duloxetine and pregabalin for painful diabetic neuropathy',
          class: 'Guideline first-line neuropathic pain agents',
          howItCompares:
            'Both have larger randomised evidence bases and regulatory approvals for this indication in most jurisdictions. Lipoic acid\'s five-week trial produced a 51% symptom reduction against 32% on placebo, which is a real difference on a subjective scale over a short period.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros of lipoic acid: better tolerated than the standard agents in short-term use. Cons: the four-year trial recorded serious adverse events in 38.1% on treatment against 28.0% on placebo, so the tolerability advantage does not obviously persist.',
        },
        {
          name: 'Glycaemic control itself',
          class: 'The intervention that addresses the cause',
          howItCompares:
            'Diabetic polyneuropathy is driven by hyperglycaemia, and improving glycaemic control is the only intervention with evidence of slowing the underlying nerve damage rather than modifying the symptom.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: addresses the mechanism. Cons: hard to achieve, and does not relieve established symptoms quickly, which is exactly the gap symptomatic agents fill.',
        },
      ],
      naturalFoods: [
        {
          name: 'Spinach, broccoli, organ meat and yeast',
          activeCompound: 'Protein-bound lipoyllysine, not free lipoic acid',
          biologicalMechanism:
            'Dietary lipoic acid occurs almost entirely as lipoyllysine covalently attached to protein, and is released only in small amounts by digestion. Food therefore delivers a tiny fraction of a supplemental dose, and this is the clearest indication that the supplement is a pharmacological intervention rather than a nutritional one.',
          evidenceStrength: 'Supportive',
          dailyUsage:
            'Not stated here as advice. For scale only: the trials used 600 to 1,800 mg per day, which is orders of magnitude above any dietary intake.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Separate symptom relief from disease modification',
          action:
            'Check whether a neuropathy endpoint is a symptom score the patient reports or a measurement of nerve function.',
          patientImpact:
            'SYDNEY 2 measured the Total Symptom Score over five weeks and found a 51% reduction against 32% on placebo. NATHAN 1 measured a composite of the Neuropathy Impairment Score in the lower limbs plus seven neurophysiologic tests over four years, and found no significant difference (P = 0.105).',
          clinicalPrecaution:
            'Both results are real. They answer different questions, and only the first is the one the supplement is sold on.',
        },
        {
          name: 'Know that a form of kidney disease has been traced to it',
          action:
            'High-grade proteinuria appeared unexpectedly in the treatment arm of a clinical trial of lipoic acid in multiple sclerosis, and led investigators to look for more cases.',
          patientImpact:
            'Four biopsy-proven cases and one suspected case of NELL1-associated membranous nephropathy following lipoic acid supplementation were reported in Kidney International in 2021. Discontinuation and supportive therapy resulted in remission.',
          clinicalPrecaution:
            'This is a small case series, not an incidence estimate. It is nonetheless a specific, biopsy-confirmed, reversible kidney lesion linked to a widely sold supplement, and it is not on any label.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CSSC1CCCCC(=O)O',
      chemicalFormula: 'C8H14O2S2',
      molecularWeight:
        '206.3 g/mol. The naturally occurring and enzymatically active enantiomer is R-lipoic acid; most supplements and most trial material are the racemic mixture of R and S forms, and the S enantiomer does not occur in biology. Products sold as "R-lipoic acid" are a different chemical entity from the material the trials used.',
      structureSource: {
        label: 'PubChem CID 864 — Alpha-lipoic acid, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/864',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ala-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Enantiomeric composition and polymerisation check',
          description:
            'Two quality questions decide what a lipoic acid product actually is. Racemic material contains an S enantiomer that does not occur in nature and is not the substrate of any enzyme, so the R fraction determines how much of the dose corresponds to the natural molecule. Separately, free lipoic acid polymerises on exposure to heat and light through its strained dithiolane ring, and polymerised material is neither absorbed nor active.',
          reagentsAndBuffer:
            'Chiral HPLC on a polysaccharide-based stationary phase resolving R- and S-lipoic acid against authenticated single-enantiomer standards; size-exclusion chromatography or differential scanning calorimetry to detect polymer; storage stability testing under accelerated heat and light',
        },
        {
          id: 'ala-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of labelled lipoic acid and dihydrolipoic acid standards',
          description:
            'The pharmacologically relevant species is not the parent compound alone but its reduced form, dihydrolipoic acid, and its beta-oxidation metabolites. Distinguishing them requires labelled standards, and dihydrolipoic acid oxidises rapidly in air, so it must be prepared and handled under inert conditions.',
          dependsOnStepId: 'ala-w1',
          reagentsAndBuffer:
            'Deuterated R-lipoic acid internal standard; dihydrolipoic acid prepared by sodium borohydride reduction under argon; bisnorlipoic and tetranorlipoic acid metabolite standards; N-ethylmaleimide thiol-trapping reagent to stabilise the reduced form at sampling',
        },
        {
          id: 'ala-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Plasma extraction with immediate thiol trapping',
          description:
            'Lipoic acid has a short plasma half-life measured in tens of minutes and its reduced form oxidises during sample handling, so a plasma concentration obtained without immediate thiol trapping systematically misrepresents the redox distribution. This is the step that separates a real pharmacokinetic measurement from an artefact of the tube.',
          dependsOnStepId: 'ala-w2',
          reagentsAndBuffer:
            'Immediate addition of N-ethylmaleimide to whole blood at the bedside; acidified extraction with EDTA; centrifugation at 4 degrees C within 10 minutes; LC-MS/MS quantification of lipoic acid, dihydrolipoic acid and the norlipoate metabolites; documented freeze-thaw stability',
        },
        {
          id: 'ala-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Test whether supplemental lipoate joins the enzyme complexes at all',
          description:
            'This is the mechanistic question the marketing assumes and the literature does not answer. Endogenous lipoyl groups are attached to E2 subunits by lipoyltransferase from mitochondrially synthesised octanoate; free exogenous lipoic acid is not obviously a substrate for that process in mammals. Expose cells to labelled lipoic acid and look for label in the lipoyl-lysine residues of the dehydrogenase complexes.',
          dependsOnStepId: 'ala-w3',
          reagentsAndBuffer:
            'Human myotubes and hepatocytes; 13C-labelled R-lipoic acid; immunoprecipitation of pyruvate dehydrogenase E2 and alpha-ketoglutarate dehydrogenase E2; anti-lipoic acid antibody immunoblotting; LC-MS/MS of tryptic lipoyl-lysine peptides for label incorporation; LIAS knockdown as the endogenous-synthesis control',
        },
        {
          id: 'ala-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Symptom score and nerve function measured together, with proteinuria monitoring',
          description:
            'Report the patient-reported symptom score and the objective neurophysiological composite side by side, because the literature\'s central finding is that these diverged. Add urinary protein monitoring as a safety endpoint, which is not standard in this field and is exactly how the membranous nephropathy signal was found.',
          dependsOnStepId: 'ala-w4',
          reagentsAndBuffer:
            'Total Symptom Score capturing stabbing pain, burning pain, paraesthesia and numbness; Neuropathy Impairment Score and lower-limb subscale; nerve conduction studies and quantitative sensory testing to a standardised protocol; urine protein-to-creatinine ratio at each visit with prespecified biopsy referral thresholds',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ala-a1',
        category: 'measured',
        title: 'SYDNEY 2: symptoms improved 51% against 32% on placebo, over five weeks',
        laymanSummary:
          'In 181 people with diabetic nerve pain, five weeks of oral lipoic acid roughly halved symptom scores, against about a third on placebo. All three doses worked equally.',
        technicalDetails:
          'SYDNEY 2 randomised 181 diabetic patients in Russia and Israel to once-daily oral alpha-lipoic acid at 600 mg (n = 45), 1,200 mg (n = 47) or 1,800 mg (n = 46), or placebo (n = 43), for five weeks after a one-week placebo run-in. The primary outcome was change in the Total Symptom Score covering stabbing pain, burning pain, paraesthesia and numbness of the feet. Mean Total Symptom Score fell by 4.9 points (51%) on 600 mg, 4.5 (48%) on 1,200 mg and 4.7 (52%) on 1,800 mg, against 2.9 points (32%) on placebo, all P < 0.05 versus placebo. Response rates, defined as a 50% or greater reduction, were 62%, 50%, 56% and 26% respectively. Significant improvements also appeared for stabbing and burning pain, the Neuropathy Symptoms and Change score and patients\' global assessment. The Neuropathy Impairment Score — the objective measure — was only numerically reduced. Note the dose-response: three doses spanning a threefold range produced essentially identical effects, which is not the shape of a dose-dependent pharmacological action and is compatible with a ceiling reached at the lowest dose or with a substantial non-specific component.',
        evidenceSource: 'Ziegler D et al. Diabetes Care 2006;29:2365-2370',
        doi: '10.2337/dc06-1216',
        measuredMetric:
          'Change from baseline in Total Symptom Score, and proportion achieving a 50% or greater reduction',
        auditFlag: 'verified',
      },
      {
        id: 'ala-a2',
        category: 'failed',
        title: 'NATHAN 1: four years, 460 patients, primary endpoint missed at P = 0.105',
        laymanSummary:
          'The long trial designed to show that lipoic acid slows nerve damage rather than just easing symptoms did not meet its main endpoint over four years.',
        technicalDetails:
          'NATHAN 1 was a multicentre randomised double-blind parallel-group trial in 460 diabetic patients with mild-to-moderate distal symmetric sensorimotor polyneuropathy, assigned to 600 mg of oral alpha-lipoic acid once daily (n = 233) or placebo (n = 227) for four years. The primary endpoint was a composite of the Neuropathy Impairment Score in the lower limbs plus seven neurophysiologic tests. Change in that primary endpoint from baseline to four years showed no significant difference between groups (P = 0.105). Several secondary measures favoured lipoic acid: the Neuropathy Impairment Score (P = 0.028), NIS-lower limbs (P = 0.05) and the NIS-LL muscular weakness subscore (P = 0.045), with more patients showing clinically meaningful improvement and fewer showing progression on NIS (P = 0.013) and NIS-LL (P = 0.025). Nerve conduction and quantitative sensory test results did not significantly worsen on placebo, which the authors flag — a trial designed to detect slowed deterioration cannot succeed if the control group does not deteriorate. The finding that matters most for a consumer is elsewhere in the paper: serious adverse events were higher on alpha-lipoic acid at 38.1% than on placebo at 28.0%.',
        evidenceSource: 'Ziegler D et al. Diabetes Care 2011;34:2054-2060',
        doi: '10.2337/dc11-0503',
        measuredMetric:
          'Composite of Neuropathy Impairment Score lower limbs plus seven neurophysiologic tests over four years',
        auditFlag: 'verified',
      },
      {
        id: 'ala-a3',
        category: 'failed',
        title: 'Lipoic acid supplementation traced to a specific form of kidney disease',
        laymanSummary:
          'Unexpected heavy protein loss in the urine appeared in the treatment arm of a lipoic acid trial. Biopsies identified a distinct kidney lesion, and it went away when the supplement was stopped.',
        technicalDetails:
          'Investigators running a clinical trial of lipoic acid supplementation in multiple sclerosis observed high-grade proteinuria as an unexpected adverse event specific to the treatment arm. That observation led them to identify similar patients in their nephrology practice, and they reported four biopsy-proven cases and a fifth suspected case of neural epidermal growth factor-like 1 (NELL1)-associated membranous nephropathy following lipoic acid supplementation. Discontinuation of lipoic acid together with supportive therapy resulted in remission. NELL1-associated membranous nephropathy is a recently characterised subtype, and identifying an exposure that appears to cause a reversible form of it is a substantive finding. Five cases is a case series and supports no incidence estimate whatever. What it does establish is that a widely sold over-the-counter antioxidant, under investigation in multiple sclerosis, diabetes and schizophrenia, produced a biopsy-confirmed glomerular lesion in the treatment arm of a controlled study — and that nobody had been looking for it.',
        evidenceSource:
          'Spain R et al. Lipoic acid supplementation associated with NELL1-associated membranous nephropathy. Kidney Int 2021;100:1208-1213',
        doi: '10.1016/j.kint.2021.10.010',
        measuredMetric:
          'Biopsy-proven NELL1-associated membranous nephropathy and proteinuria after lipoic acid supplementation, with remission on discontinuation',
        auditFlag: 'caution',
      },
      {
        id: 'ala-a4',
        category: 'inferred',
        title: 'The supplement is not the cofactor it is named after',
        laymanSummary:
          'Lipoic acid is famous as an essential piece of the enzymes that burn fuel in mitochondria. The lipoic acid in a capsule does not become part of those enzymes.',
        technicalDetails:
          'Endogenous lipoic acid is synthesised inside the mitochondrion by lipoyl synthase, acting on an octanoyl group already attached to the target protein, and it exists in biology almost exclusively as lipoyl-lysine covalently bound to the E2 subunits of pyruvate dehydrogenase, alpha-ketoglutarate dehydrogenase, branched-chain ketoacid dehydrogenase and the glycine cleavage system. Free lipoic acid is not a normal metabolite at meaningful concentrations, and mammalian cells do not efficiently attach exogenous free lipoate to those complexes. Supplemental alpha-lipoic acid therefore acts as something else: a free, redox-active dithiol that is reduced to dihydrolipoic acid, regenerates other cellular reductants, chelates transition metals, and is rapidly beta-oxidised and cleared with a plasma half-life measured in tens of minutes. That is a legitimate pharmacology, and it is a different one from the cofactor role that supplies the molecule\'s reputation. Dietary lipoic acid, which occurs as protein-bound lipoyllysine, is delivered in amounts orders of magnitude below the 600 to 1,800 mg used in the trials.',
        evidenceSource: 'Ziegler D et al. Diabetes Care 2011;34:2054-2060',
        doi: '10.2337/dc11-0503',
        inferredClaim:
          'That supplemental alpha-lipoic acid supports the mitochondrial dehydrogenase complexes for which lipoic acid is the named cofactor',
        auditFlag: 'caution',
      },
      {
        id: 'ala-a5',
        category: 'inferred',
        title: 'The weight loss effect is 1.27 kilograms',
        laymanSummary:
          'Pooling ten randomised double-blind trials, lipoic acid produced about 1.3 kilograms more weight loss than placebo, and the dose made no difference.',
        technicalDetails:
          'Kucukgoncu and colleagues meta-analysed ten randomised, double-blind, placebo-controlled studies and found lipoic acid treatment associated with 1.27 kg greater mean weight loss than placebo (95% CI 0.25 to 2.29) and a mean BMI difference of -0.43 kg/m2 (95% CI -0.82 to -0.03). Meta-regression showed no significance of lipoic acid dose on either BMI or weight change, while study duration significantly affected BMI change but not weight change. The authors describe the effect as small and short-term and call for research on different doses and long-term benefit. Two features undercut a pharmacological reading. A weight loss effect with no dose-response across the studied range is difficult to attribute to the compound, and 1.27 kg with a confidence interval reaching 0.25 kg is within the range that dietary co-intervention and adherence effects readily produce in supplement trials.',
        evidenceSource: 'Kucukgoncu S, Zhou E, Lucas KB, Tek C. Obes Rev 2017;18:594-601',
        doi: '10.1111/obr.12528',
        measuredMetric:
          'Mean difference in body weight and body mass index between lipoic acid and placebo groups',
        inferredClaim:
          'That alpha-lipoic acid is a weight-loss agent, on a 1.27 kg pooled difference with no dose-response',
        auditFlag: 'caution',
      },
      {
        id: 'ala-a6',
        category: 'conclusion_shift',
        title: 'The programme moved from symptoms to disease modification, and the answer changed',
        laymanSummary:
          'Short trials showed lipoic acid eases how diabetic nerve damage feels. The long trial designed to show it slows the damage itself did not succeed.',
        technicalDetails:
          'The sequence is unusually clean. Five-week SYDNEY 2 measured a patient-reported symptom score and found roughly half of symptoms relieved against a third on placebo, with response rates of 50 to 62% against 26%. Four-year NATHAN 1 measured a composite of objective impairment and neurophysiology and did not meet it (P = 0.105), while several impairment secondaries did move. Read together, the honest summary is that alpha-lipoic acid is better supported as a symptomatic agent over weeks than as a disease-modifying one over years, and that its symptomatic evidence rests on subjective endpoints with no dose-response across a threefold dose range. The safety arithmetic changed too: a compound that was well tolerated over five weeks recorded serious adverse events in 38.1% of treated patients against 28.0% on placebo over four years.',
        evidenceSource:
          'Ziegler D et al. Diabetes Care 2006;29:2365-2370; Ziegler D et al. Diabetes Care 2011;34:2054-2060',
        doi: '10.2337/dc11-0503',
        inferredClaim:
          'That short-term symptom relief in diabetic neuropathy implies slowed progression of the underlying nerve damage',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed fast, cleared fast',
        laymanDesc:
          'Lipoic acid is taken up quickly from the gut and disappears from the blood within about an hour, which is why trials give it once or twice daily at large doses.',
        molecularDetail:
          'Oral bioavailability is modest and reduced by food, with a plasma half-life on the order of tens of minutes and rapid beta-oxidation to bisnorlipoate and tetranorlipoate. The very short exposure window is a genuine pharmacological constraint and is rarely mentioned alongside claims about sustained antioxidant protection.',
        iconName: 'Timer',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It is reduced inside cells to a two-thiol form',
        laymanDesc:
          'Once inside cells, the ring in lipoic acid is opened to give two free sulphur groups. That reduced form is the chemically active species.',
        molecularDetail:
          'Lipoic acid is reduced to dihydrolipoic acid by lipoamide dehydrogenase, glutathione reductase and thioredoxin reductase. Dihydrolipoic acid is a strong reductant that can regenerate ascorbate and glutathione and chelate transition metals — the properties that support the antioxidant framing, and which apply to the free molecule rather than to the bound cofactor.',
        iconName: 'Recycle',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'What it does not do is join the enzyme complexes',
        laymanDesc:
          'The famous role of lipoic acid is as a permanently attached arm on mitochondrial enzymes. That attachment happens inside the mitochondrion during assembly, using lipoic acid the cell makes itself.',
        molecularDetail:
          'Lipoyl synthase installs the sulphurs onto an octanoyl group already amide-linked to the E2 lysine, so the cofactor is made in place rather than captured from the pool. Mammalian cells do not efficiently ligate exogenous free lipoate onto pyruvate dehydrogenase or alpha-ketoglutarate dehydrogenase. The supplement and the cofactor share a name and a structure and not a job.',
        iconName: 'Unlink',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The measured clinical effect is on how neuropathy feels',
        laymanDesc:
          'Over five weeks, symptom scores for stabbing pain, burning, tingling and numbness fell by about half, against about a third on placebo.',
        molecularDetail:
          'SYDNEY 2 recorded Total Symptom Score reductions of 51%, 48% and 52% at 600, 1,200 and 1,800 mg against 32% on placebo, with response rates of 62%, 50% and 56% against 26%. Three doses spanning a threefold range produced indistinguishable effects, which is not the profile of a dose-dependent pharmacological action.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Over four years, the objective composite did not move, and harms rose',
        laymanDesc:
          'The long trial measuring actual nerve function found no significant difference. Serious adverse events were more common on lipoic acid than on placebo.',
        molecularDetail:
          'NATHAN 1 primary composite P = 0.105 over four years in 460 patients, with several impairment secondaries favouring treatment. Serious adverse events occurred in 38.1% on alpha-lipoic acid against 28.0% on placebo. Separately, five cases of NELL1-associated membranous nephropathy were traced to lipoic acid supplementation, with remission on discontinuation.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SYDNEY 2 — oral alpha-lipoic acid in symptomatic diabetic polyneuropathy',
        phase: 'Multicentre randomised double-blind placebo-controlled dose-ranging, 5 weeks',
        sampleSize: 181,
        primaryEndpoint: 'Change from baseline in Total Symptom Score',
        endpointMet: true,
        statisticalPValue:
          'TSS reduced 51% at 600 mg, 48% at 1,200 mg, 52% at 1,800 mg versus 32% on placebo, all P < 0.05; response rates 62%, 50%, 56% versus 26%',
        unreportedAdverseSignals:
          'Three doses across a threefold range produced essentially identical effects, which is not a dose-response. The Neuropathy Impairment Score, the objective measure, was only numerically reduced. Five weeks is short for a chronic progressive condition.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NATHAN 1 — alpha-lipoic acid over four years in diabetic polyneuropathy',
        phase: 'Multicentre randomised double-blind parallel-group, 4 years',
        sampleSize: 460,
        primaryEndpoint:
          'Composite of Neuropathy Impairment Score lower limbs plus seven neurophysiologic tests',
        endpointMet: false,
        statisticalPValue:
          'No significant difference in the primary composite, P = 0.105; secondaries NIS P = 0.028, NIS-LL P = 0.05, NIS-LL muscular weakness P = 0.045',
        unreportedAdverseSignals:
          'Serious adverse events were higher on alpha-lipoic acid at 38.1% than on placebo at 28.0%. Nerve conduction and quantitative sensory tests did not significantly worsen on placebo, so the trial had little deterioration to slow.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'Kucukgoncu 2017 meta-analysis of alpha-lipoic acid for weight loss',
        phase: 'Meta-analysis of 10 randomised double-blind placebo-controlled studies',
        sampleSize: 10,
        primaryEndpoint: 'Mean difference in body weight and BMI versus placebo',
        endpointMet: true,
        statisticalPValue:
          'Weight -1.27 kg (95% CI 0.25 to 2.29); BMI -0.43 kg/m2 (95% CI -0.82 to -0.03)',
        unreportedAdverseSignals:
          'Meta-regression found no effect of dose on either outcome. A weight effect without a dose-response is hard to attribute to the compound. Sample size counts studies, not participants.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Spain 2021 — NELL1-associated membranous nephropathy after lipoic acid',
        phase: 'Case series arising from a clinical trial treatment arm',
        sampleSize: 5,
        primaryEndpoint: 'Renal biopsy findings and proteinuria after lipoic acid supplementation',
        endpointMet: false,
        statisticalPValue:
          'Four biopsy-proven and one suspected case of NELL1-associated membranous nephropathy; remission after discontinuation and supportive therapy',
        unreportedAdverseSignals:
          'High-grade proteinuria was an unexpected adverse event specific to the treatment arm of a multiple sclerosis trial. Five cases support no incidence estimate, and nobody had been monitoring urinary protein in lipoic acid users.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Five weeks of oral alpha-lipoic acid reduced diabetic neuropathy Total Symptom Score by 48 to 52% against 32% on placebo',
        'Four years of 600 mg daily did not meet the primary composite of impairment plus neurophysiology, P = 0.105',
        'Serious adverse events over four years were 38.1% on alpha-lipoic acid against 28.0% on placebo',
        'Pooled weight loss was 1.27 kg with no dose-response across ten randomised double-blind trials',
        'Four biopsy-proven cases of NELL1-associated membranous nephropathy followed lipoic acid supplementation, remitting on discontinuation',
      ],
      unsupportedInferences: [
        'That supplemental lipoic acid supports the mitochondrial enzymes whose cofactor it is named for, which it does not join',
        'That short-term symptom relief implies slowing of the underlying nerve damage',
        'That a 1.27 kg pooled weight difference with no dose-response is a pharmacological weight-loss effect',
        'That a compound well tolerated over five weeks is well tolerated over years',
      ],
      whatFailedInitially: [
        'The four-year disease-modification endpoint in diabetic polyneuropathy, missed at P = 0.105',
        'The assumption that this compound has no serious harms, which a nephrology case series overturned in 2021',
      ],
      realWorldOutcome: [
        'Alpha-lipoic acid has the most serious trial programme of any antioxidant supplement in this file, running to four years',
        'Its symptomatic effect in diabetic neuropathy is real, subjective, and shows no dose-response across a threefold range',
        'It is a prescription medicine for this indication in Germany and an unmonitored supplement in the United States',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or tablet, as racemic alpha-lipoic acid or as R-lipoic acid',
      description:
        'Sold in the United States as a dietary supplement under DSHEA with no pre-market review, and licensed as a prescription medicine for symptomatic diabetic polyneuropathy in Germany and several other countries — the same molecule under two regulatory regimes. Nearly all trial material is racemic; the naturally occurring enantiomer is R-lipoic acid, and products sold as pure R-lipoic acid are not the material the trials used. Free lipoic acid polymerises on exposure to heat and light, so storage conditions affect what is actually in a capsule. Absorption is reduced by food and the plasma half-life is on the order of tens of minutes.',
      safetyProfile:
        'Nausea, rash and, at high doses, hypoglycaemia are the commonly reported effects, and the compound is insulin-mimetic enough that people on glucose-lowering therapy should be aware of it. Over four years, serious adverse events occurred in 38.1% of treated patients against 28.0% on placebo, which is the most consequential safety figure in this literature and comes from the trial that missed its primary endpoint. Five cases of NELL1-associated membranous nephropathy, four biopsy-proven, have been traced to lipoic acid supplementation, presenting with high-grade proteinuria and remitting on discontinuation. Alpha-lipoic acid is also one of only two medications — the other being methimazole — that a 2020 review of insulin autoimmune syndrome classifies as having a high-strength association with triggering that condition, in which autoantibodies to endogenous insulin cause recurrent hypoglycaemia; the same review notes the association has been increasing over the last decade and that the originally proposed HLA-DRB1*0406 restriction was not confirmed in Caucasians or in other Asian populations.',
    },
    commonQuestions: [
      {
        q: 'Does it help diabetic nerve pain?',
        a: 'Over five weeks, yes, on symptom scores. In 181 patients, Total Symptom Score fell by about half on lipoic acid against about a third on placebo, and roughly 50 to 62 percent of treated patients achieved at least a 50 percent reduction against 26 percent on placebo. Two things temper that. The objective impairment score was only numerically reduced. And three doses spanning a threefold range produced essentially identical results, which is not what a dose-dependent drug effect looks like.',
      },
      {
        q: 'Does it slow the nerve damage itself?',
        a: 'The trial designed to answer that did not show it. NATHAN 1 followed 460 patients for four years on 600 mg daily and its primary composite endpoint — impairment score plus seven neurophysiological tests — showed no significant difference, P = 0.105. Several secondary impairment measures did favour treatment. The authors also note that nerve conduction and sensory testing did not significantly worsen in the placebo group, which leaves a trial about slowing deterioration with little deterioration to slow.',
        auditNote:
          'The same paper reports serious adverse events in 38.1% on treatment against 28.0% on placebo.',
      },
      {
        q: 'Is it the same as the lipoic acid in my mitochondria?',
        a: 'It is the same molecule doing a different job, and this is the most widely misunderstood thing about it. Biological lipoic acid is built inside the mitochondrion directly onto the enzyme it will serve, and it exists almost entirely as a permanently attached arm on a handful of dehydrogenase complexes. Free lipoic acid from a capsule does not get attached to those enzymes. What it does instead is circulate briefly as a redox-active dithiol. That is real chemistry, but it is not the cofactor role the reputation comes from.',
      },
      {
        q: 'Will it help me lose weight?',
        a: 'By about 1.3 kilograms, on pooled evidence, and probably not for the reason implied. Ten randomised double-blind trials gave a mean difference of 1.27 kg and a BMI difference of 0.43 kg/m². The awkward detail is that meta-regression found no relationship between dose and effect on either outcome. An effect that does not scale with dose across the studied range is hard to attribute to the compound rather than to the circumstances of taking it.',
      },
      {
        q: 'Are there any real risks?',
        a: 'One recently identified and specific. Investigators running a lipoic acid trial in multiple sclerosis found unexpected heavy protein loss in the urine confined to the treatment arm, and traced four biopsy-proven cases and one suspected case of NELL1-associated membranous nephropathy to lipoic acid supplementation; stopping the supplement led to remission. That is five cases, so it supports no estimate of how often it happens. It does establish that a common over-the-counter antioxidant produced a confirmed kidney lesion that nobody had been watching for.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Ziegler D et al. Oral treatment with alpha-lipoic acid improves symptomatic diabetic polyneuropathy: the SYDNEY 2 trial. Diabetes Care 2006;29:2365-2370',
        identifier: '10.2337/dc06-1216',
        kind: 'doi',
      },
      {
        label:
          'Ziegler D et al. Efficacy and safety of antioxidant treatment with alpha-lipoic acid over 4 years in diabetic polyneuropathy: the NATHAN 1 trial. Diabetes Care 2011;34:2054-2060',
        identifier: '10.2337/dc11-0503',
        kind: 'doi',
      },
      {
        label:
          'Kucukgoncu S, Zhou E, Lucas KB, Tek C. Alpha-lipoic acid (ALA) as a supplementation for weight loss: results from a meta-analysis of randomized controlled trials. Obes Rev 2017;18:594-601',
        identifier: '10.1111/obr.12528',
        kind: 'doi',
      },
      {
        label:
          'Lipoic acid supplementation associated with neural epidermal growth factor-like 1 (NELL1)-associated membranous nephropathy. Kidney Int 2021;100:1208-1213',
        identifier: '10.1016/j.kint.2021.10.010',
        kind: 'doi',
      },
      {
        label:
          'Cappellani D, Macchia E, Falorni A, Marchetti P. Insulin autoimmune syndrome (Hirata disease): a comprehensive review fifty years after its first description. Diabetes Metab Syndr Obes 2020;13:963-978',
        identifier: '10.2147/dmso.s219438',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 864 — Alpha-lipoic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/864',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Lutein and zeaxanthin — the carotenoids that replaced beta-carotene after ATBC and CARET found
  // it raised lung cancer. AREDS2's primary analysis was null; ten-year follow-up found a small
  // benefit, and confirmed beta-carotene nearly doubled lung cancer risk.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lutein-zeaxanthin',
    name: 'Lutein and zeaxanthin',
    tradeName:
      'Sold as marigold-derived lutein esters, often with meso-zeaxanthin; branded ingredients include FloraGLO and Lutemax',
    sponsor:
      'No single sponsor — xanthophyll carotenoids extracted chiefly from marigold (Tagetes erecta) petals. AREDS2 was conducted by the National Eye Institute.',
    targetGene: 'StARD3',
    targetProtein:
      'Lutein and zeaxanthin have no enzyme or receptor target. They are structural pigments concentrated in the macula by two specific binding proteins — StARD3 for lutein and GSTP1 for zeaxanthin — where they filter short-wavelength light and quench singlet oxygen in the photoreceptor layer.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for eye health, macular degeneration and blue-light protection, and included in the current AREDS2 formulation. Not approved by the FDA or EMA for any indication. The AREDS2 formulation is a specific combination whose evidence does not transfer to a standalone lutein capsule.',
    patientFriendlyIndication:
      'Taken for eye health, especially by people worried about macular degeneration or screen time',
    conditionContext: {
      conditionExplainer:
        'The macula, the small central region of the retina responsible for sharp vision, is stained yellow by two carotenoids the body cannot make. They sit in front of the photoreceptors, absorbing blue light before it reaches them and quenching the reactive oxygen the light produces. That pigment thins with age, and macular degeneration is the leading cause of central vision loss in older adults.',
      whyItMatters:
        'These two molecules exist in the supplement aisle largely because of a disaster. The original AREDS formulation contained beta-carotene, and two large randomised trials had by then shown beta-carotene increased lung cancer in smokers. AREDS2 was designed partly to find a replacement, and lutein and zeaxanthin were it. That history — a nutrient replaced because it was killing people — is the most important thing about this record.',
      whoTakesThis:
        'Older adults with intermediate age-related macular degeneration on the AREDS2 formulation, and a much larger population buying standalone lutein for screen fatigue and general eye health.',
      clinicalGoals:
        'Trials measured progression to advanced age-related macular degeneration by photographic grading, visual acuity loss, macular pigment optical density, and — in the trials that shaped the formulation — lung cancer incidence and all-cause mortality.',
    },
    oneSentenceVerdict:
      'AREDS2\'s primary analysis found no significant reduction in progression to advanced macular degeneration from adding lutein and zeaxanthin (hazard ratio 0.90, 98.7% CI 0.76 to 1.07, P = .12), and their real justification is negative rather than positive: they replaced beta-carotene, which raised lung cancer 18% in ATBC, 28% in CARET, and nearly doubled the ten-year odds in AREDS2 itself.',
    laymanHowItWorks:
      'Two yellow pigments from plants collect in the exact centre of your retina and nowhere else in the body at that concentration. They act as a built-in filter, soaking up the blue light that does the most photochemical damage before it reaches the light-sensing cells, and mopping up the reactive oxygen that light produces. You cannot make them, so the only source is diet. That much is well established. Whether swallowing more of them meaningfully slows macular degeneration is a separate question, and the large randomised trial that asked it did not find a significant answer.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 50,
    anatomicalSite:
      'The macula lutea of the retina, where lutein, zeaxanthin and meso-zeaxanthin are concentrated in the Henle fibre layer in front of the photoreceptors',
    substitutes: {
      summary:
        'For the specific population AREDS studied — people with intermediate macular degeneration or advanced disease in one eye — the comparator is the AREDS2 formulation as a whole, not lutein alone. For everyone else, the honest comparator is a diet containing green leafy vegetables and egg yolk, plus not smoking, which dominates every other modifiable risk factor for this disease.',
      conventionalRx: [
        {
          name: 'The complete AREDS2 formulation',
          class: 'Multi-component supplement with trial evidence as a combination',
          howItCompares:
            'The evidence base belongs to the combination — vitamins C and E, zinc, copper and lutein/zeaxanthin — tested in a defined high-risk population. A standalone lutein capsule has not been shown to do what the formulation does, and the original AREDS benefit came largely from the antioxidant-plus-zinc combination.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: an actual randomised evidence base in a defined population. Cons: that population is people already at high risk, and the formulation is regularly bought by people who are not in it.',
        },
        {
          name: 'Anti-VEGF injection for neovascular AMD',
          class: 'Intravitreal biologic therapy',
          howItCompares:
            'For wet macular degeneration, anti-VEGF therapy preserves and often restores vision, with an evidence base incomparably stronger than any supplement. Carotenoids address risk of progression, not established neovascular disease.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: transformative for the disease it treats. Cons: entirely different indication, and no supplement substitutes for it.',
        },
      ],
      naturalFoods: [
        {
          name: 'Kale, spinach and other dark leafy greens',
          activeCompound: 'Lutein, at higher concentration than any other common food',
          biologicalMechanism:
            'Lutein and zeaxanthin are the same molecules in food and in a capsule, and humans cannot synthesise either. Absorption is lipid-dependent, which is why carotenoid uptake from greens rises substantially when eaten with fat.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: AREDS2 used 10 mg of lutein and 2 mg of zeaxanthin daily.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Egg yolk',
          activeCompound: 'Lutein and zeaxanthin in a highly bioavailable lipid matrix',
          biologicalMechanism:
            'Egg yolk contains less lutein per gram than kale but delivers it in a phospholipid matrix that raises absorption substantially, which is one of the clearest food-matrix effects in carotenoid nutrition.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Read the AREDS2 primary result before the headline',
          action:
            'Check whether a lutein claim rests on the AREDS2 primary analysis or on a secondary or long-term follow-up analysis.',
          patientImpact:
            'The primary analysis found no statistically significant reduction in progression to advanced AMD: hazard ratio 0.90 (98.7% CI 0.76 to 1.07, P = .12) for lutein plus zeaxanthin. The ten-year follow-up found a hazard ratio of 0.91 (95% CI 0.84 to 0.99, P = .02) — small, and from an epidemiologic follow-up rather than the randomised primary endpoint.',
          clinicalPrecaution:
            'Both numbers are honest. Only the first is the randomised primary result the trial was designed around.',
        },
        {
          name: 'If you have ever smoked, the beta-carotene history matters directly',
          action:
            'Check any eye supplement for beta-carotene, because older AREDS-style formulations contain it.',
          patientImpact:
            'At ten years in AREDS2, the odds ratio of having lung cancer was 1.82 (95% CI 1.06 to 3.12, P = .02) for those randomised to beta-carotene, against 1.15 (95% CI 0.79 to 1.66, P = .46) for lutein/zeaxanthin. In the trial itself, more lung cancers occurred in the beta-carotene group, 23 (2.0%) against 11 (0.9%), mostly in former smokers.',
          clinicalPrecaution:
            'The risk was concentrated in current and former smokers in every trial that found it.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=C(C(C[C@@H](C1)O)(C)C)/C=C/C(=C/C=C/C(=C/C=C/C=C(\\C)/C=C/C=C(\\C)/C=C/[C@H]2C(=C[C@@H](CC2(C)C)O)C)/C)/C',
      chemicalFormula: 'C40H56O2',
      molecularWeight:
        '568.9 g/mol. This is lutein. Zeaxanthin is its constitutional isomer with the identical formula and mass, differing only in the position of one double bond in a terminal ring — which is enough to make them bind different carrier proteins in the retina, StARD3 for lutein and GSTP1 for zeaxanthin.',
      structureSource: {
        label: 'PubChem CID 5281243 — Lutein, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281243',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'lz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Isomer separation, free versus esterified lutein, and beta-carotene screen',
          description:
            'Three quality questions decide what an eye supplement actually contains, and a total-carotenoid assay answers none of them. Lutein and zeaxanthin are constitutional isomers with identical mass. Marigold-derived lutein is supplied as diesters that must be saponified, and free and esterified forms are absorbed differently. And meso-zeaxanthin, present in many products, is not a significant dietary carotenoid and was not in the AREDS2 formulation.',
          reagentsAndBuffer:
            'Reversed-phase HPLC with photodiode array detection at 450 nm using a C30 stationary phase capable of resolving lutein, zeaxanthin, meso-zeaxanthin and beta-carotene; chiral column for the meso-zeaxanthin determination; saponification step with quantification before and after to determine ester content; authenticated single-compound standards',
        },
        {
          id: 'lz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the 13C-labelled carotenoid tracer',
          description:
            'Serum lutein reflects recent intake and correlates only loosely with macular pigment, so a supplementation study that reports serum concentration has not measured what matters. A labelled tracer permits absorption and macular accumulation to be tracked separately from the existing dietary pool.',
          dependsOnStepId: 'lz-w1',
          reagentsAndBuffer:
            'Uniformly 13C-labelled lutein from plants grown on 13CO2; formulation in a defined lipid matrix to control the absorption variable; isotopic enrichment confirmed by LC-MS; light- and oxygen-protected handling throughout, since carotenoids are rapidly photodegraded',
        },
        {
          id: 'lz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Lipoprotein fractionation of serum carotenoids',
          description:
            'Lutein and zeaxanthin circulate on HDL and LDL, so serum carotenoid concentrations covary with lipoprotein concentrations. Reporting serum lutein without normalising to lipid conflates carotenoid status with lipid status, which matters in an older population commonly taking statins.',
          dependsOnStepId: 'lz-w2',
          reagentsAndBuffer:
            'Density gradient ultracentrifugation separating HDL, LDL and VLDL; carotenoid quantification per fraction by HPLC; normalisation to total cholesterol and triglyceride; ambient light excluded during all handling',
        },
        {
          id: 'lz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Selective macular uptake through the carotenoid binding proteins',
          description:
            'Test the step that makes these two molecules special. The retina concentrates lutein and zeaxanthin specifically and excludes beta-carotene and lycopene, and it does so through dedicated binding proteins. If a product\'s carotenoid does not bind those proteins, raising its serum concentration cannot raise macular pigment.',
          dependsOnStepId: 'lz-w3',
          reagentsAndBuffer:
            'Recombinant StARD3 and GSTP1 with fluorescence-quenching binding assays against lutein, zeaxanthin, meso-zeaxanthin, beta-carotene and lycopene; retinal pigment epithelium cell line uptake assay; SCARB1 knockdown as the transport control; competition assays with mixed carotenoids at physiological ratios',
        },
        {
          id: 'lz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Macular pigment optical density alongside a photographic progression endpoint',
          description:
            'Report the pigment measurement and the disease endpoint together, because the whole controversy in this field is that the first moves reliably and the second does not. AREDS2 measured photographic progression to advanced AMD as its primary endpoint and found hazard ratio 0.90 with P = .12; a study reporting only macular pigment optical density would have declared success.',
          dependsOnStepId: 'lz-w4',
          reagentsAndBuffer:
            'Heterochromatic flicker photometry and dual-wavelength autofluorescence for macular pigment optical density; standardised stereoscopic fundus photography with centralised masked grading for progression to advanced AMD; best-corrected visual acuity on ETDRS charts; prespecified primary endpoint with a single analysis plan',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lz-a1',
        category: 'failed',
        title: 'AREDS2 primary analysis: no significant reduction in progression to advanced AMD',
        laymanSummary:
          'The large trial designed to test whether adding lutein and zeaxanthin helps macular degeneration found no statistically significant benefit in its main analysis.',
        technicalDetails:
          'AREDS2 tested the addition of lutein 10 mg plus zeaxanthin 2 mg, DHA plus EPA, or both, to the original AREDS formulation, with median follow-up of five years and 1,940 study eyes in 1,608 participants progressing to advanced age-related macular degeneration. Kaplan-Meier probabilities of progression by five years were 31% for placebo, 29% for lutein plus zeaxanthin, 31% for DHA plus EPA and 30% for both. Primary comparisons against placebo showed no statistically significant reduction: hazard ratio 0.90 (98.7% CI 0.76 to 1.07, P = .12) for lutein plus zeaxanthin, 0.97 (98.7% CI 0.82 to 1.16, P = .70) for DHA plus EPA, and 0.89 (98.7% CI 0.75 to 1.06, P = .10) for the combination. There was no apparent effect of beta-carotene elimination or of lower-dose zinc. The authors\' conclusion states it plainly: addition of lutein plus zeaxanthin, DHA plus EPA, or both, in primary analyses did not further reduce the risk of progression. The recommendation to use lutein and zeaxanthin in the revised formulation was made not because they worked better but because of the lung cancer risk of the ingredient they replaced.',
        evidenceSource: 'Age-Related Eye Disease Study 2 (AREDS2) Research Group. JAMA 2013;309:2005-2015',
        doi: '10.1001/jama.2013.4997',
        measuredMetric:
          'Kaplan-Meier probability of progression to advanced AMD at five years, by photographic grading',
        auditFlag: 'verified',
      },
      {
        id: 'lz-a2',
        category: 'failed',
        title: 'ATBC: beta-carotene raised lung cancer 18% and total mortality 8% in 29,133 smokers',
        laymanSummary:
          'A trial of nearly thirty thousand male smokers gave beta-carotene expecting fewer lung cancers. There were more, and more deaths.',
        technicalDetails:
          'The Alpha-Tocopherol, Beta-Carotene Cancer Prevention Study randomised 29,133 male smokers aged 50 to 69 in southwestern Finland to alpha-tocopherol, beta-carotene, both, or placebo. Among 876 new lung cancers diagnosed during the trial, alpha-tocopherol produced no reduction in incidence (change -2%, 95% CI -14 to 12%). Beta-carotene produced an 18% higher incidence of lung cancer (95% CI 3 to 36%). Total mortality was 8% higher among those receiving beta-carotene (95% CI 1 to 16%), driven by more deaths from lung cancer and ischaemic heart disease. Alpha-tocopherol was associated with more deaths from haemorrhagic stroke. The trial was built on epidemiologic evidence that diets high in carotenoid-rich fruits and vegetables and high serum beta-carotene were associated with lower lung cancer risk. It is the canonical demonstration that isolating a nutrient from the food it was observed in, and giving it at supplemental dose, can reverse the direction of the association entirely.',
        evidenceSource: 'The Alpha-Tocopherol, Beta Carotene Cancer Prevention Study Group. N Engl J Med 1994;330:1029-1035',
        doi: '10.1056/NEJM199404143301501',
        measuredMetric: 'Lung cancer incidence and total mortality over the trial period in male smokers',
        auditFlag: 'verified',
      },
      {
        id: 'lz-a3',
        category: 'failed',
        title: 'CARET: stopped 21 months early for a 28% increase in lung cancer',
        laymanSummary:
          'A second trial gave beta-carotene and vitamin A to smokers and asbestos-exposed workers. It was halted early because more people in the treated group were getting lung cancer and dying.',
        technicalDetails:
          'The Beta-Carotene and Retinol Efficacy Trial randomised 18,314 smokers, former smokers and asbestos-exposed workers to 30 mg per day of beta-carotene plus 25,000 IU per day of retinyl palmitate, or placebo. Over 73,135 person-years with a mean 4.0 years of follow-up, 388 new lung cancers were diagnosed. The active-treatment group had a relative risk of lung cancer of 1.28 (95% CI 1.04 to 1.57, P = 0.02). Relative risk of death from any cause was 1.17 (95% CI 1.03 to 1.33), from lung cancer 1.46 (95% CI 1.07 to 2.00), and from cardiovascular disease 1.26 (95% CI 0.99 to 1.61). The randomised trial was stopped 21 months earlier than planned on the basis of those findings. Two independent large trials, in overlapping high-risk populations, finding the same direction of harm is as close to settled as prevention research gets — and it is the reason the eye supplement in your cupboard contains lutein rather than beta-carotene.',
        evidenceSource: 'Omenn GS et al. N Engl J Med 1996;334:1150-1155',
        doi: '10.1056/NEJM199605023341802',
        measuredMetric:
          'Relative risk of lung cancer, death from lung cancer, and all-cause mortality over a mean 4.0 years',
        auditFlag: 'verified',
      },
      {
        id: 'lz-a4',
        category: 'measured',
        title: 'AREDS2 at ten years: beta-carotene nearly doubled lung cancer odds',
        laymanSummary:
          'Following the AREDS2 participants for ten years, those originally assigned beta-carotene had almost twice the odds of lung cancer. Lutein and zeaxanthin showed no such signal.',
        technicalDetails:
          'The ten-year epidemiologic follow-up of the AREDS2 cohort included 3,882 participants of mean baseline age 72.0 years and 6,351 eyes. The odds ratio of having lung cancer at ten years was 1.82 (95% CI 1.06 to 3.12, P = .02) for those randomly assigned to beta-carotene, against 1.15 (95% CI 0.79 to 1.66, P = .46) for lutein/zeaxanthin. Within the trial itself, more lung cancers had been noted in the beta-carotene group, 23 (2.0%) against 11 (0.9%), nominal P = .04, mostly in former smokers. The authors concluded that lutein/zeaxanthin was an appropriate replacement for beta-carotene and that beta-carotene usage nearly doubled the risk of lung cancer. This is the audit that defines the record: the case for lutein and zeaxanthin in eye supplements is overwhelmingly a case against the thing they replaced.',
        evidenceSource: 'Chew EY et al. JAMA Ophthalmol 2022;140:692-698',
        doi: '10.1001/jamaophthalmol.2022.1640',
        measuredMetric:
          'Ten-year odds ratio of lung cancer by original randomised assignment in the AREDS2 cohort',
        auditFlag: 'verified',
      },
      {
        id: 'lz-a5',
        category: 'inferred',
        title: 'The ten-year AMD benefit is real, small, and not the randomised primary endpoint',
        laymanSummary:
          'Following participants for ten years found a nine percent lower rate of progression to late macular degeneration with lutein and zeaxanthin. It comes from a follow-up analysis, not the trial\'s main result.',
        technicalDetails:
          'In the ten-year AREDS2 follow-up, the hazard ratio for progression to late AMD comparing lutein/zeaxanthin with no lutein/zeaxanthin was 0.91 (95% CI 0.84 to 0.99, P = .02), while omega-3 fatty acids gave 1.01 (95% CI 0.93 to 1.09, P = .91). Restricting the lutein/zeaxanthin main-effects analysis to those randomised to beta-carotene gave a hazard ratio of 0.80 (95% CI 0.68 to 0.92, P = .002), and a direct comparison of lutein/zeaxanthin against beta-carotene gave 0.85 (95% CI 0.73 to 0.98, P = .02). The last two are the informative ones and they change the interpretation: the apparent lutein benefit is largest and clearest precisely where the comparator is beta-carotene, which is consistent with beta-carotene competitively interfering with lutein absorption rather than with lutein having a large independent effect. The authors describe this as a long-term epidemiologic follow-up study, not a randomised primary result, and its confidence interval reaches 0.99.',
        evidenceSource: 'Chew EY et al. JAMA Ophthalmol 2022;140:692-698',
        doi: '10.1001/jamaophthalmol.2022.1640',
        measuredMetric:
          'Ten-year hazard ratio for progression to late AMD, overall and restricted to the beta-carotene stratum',
        inferredClaim:
          'That the ten-year follow-up establishes an independent protective effect of lutein and zeaxanthin, when the effect is concentrated where beta-carotene was the comparator',
        auditFlag: 'caution',
      },
      {
        id: 'lz-a6',
        category: 'inferred',
        title: 'Raising macular pigment is not the same as preventing disease',
        laymanSummary:
          'Supplementing lutein reliably increases the yellow pigment in the retina, which is easy to measure. Whether that translates into less vision loss is what AREDS2 tested, and it did not reach significance.',
        technicalDetails:
          'Lutein and zeaxanthin are taken up selectively into the macula by dedicated binding proteins — StARD3 for lutein and GSTP1 for zeaxanthin — and supplementation raises macular pigment optical density reliably and dose-dependently. That surrogate is the basis of most consumer marketing in this category and of the blue-light protection claim. The problem is the step to a clinical outcome. AREDS2 measured photographic progression to advanced AMD in 1,608 participants who progressed, and found hazard ratio 0.90 with P = .12 against a prespecified 98.7% confidence interval. A trial reporting only macular pigment optical density would have declared unambiguous success. The gap between a surrogate that moves and an endpoint that does not is the standing lesson of this entire file, and this is one of its cleanest instances because the surrogate is so directly and physically related to the proposed mechanism.',
        evidenceSource: 'Age-Related Eye Disease Study 2 (AREDS2) Research Group. JAMA 2013;309:2005-2015',
        doi: '10.1001/jama.2013.4997',
        inferredClaim:
          'That increasing macular pigment optical density demonstrates protection against macular degeneration or against blue-light damage',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The body cannot make them, so diet is the only source',
        laymanDesc:
          'Lutein and zeaxanthin are plant pigments. Humans have no pathway to synthesise either, so every molecule in your retina came from something you ate.',
        molecularDetail:
          'Both are xanthophyll carotenoids with the formula C40H56O2, differing only in the position of one double bond in a terminal ionone ring. Neither is a vitamin precursor — unlike beta-carotene, they are not cleaved to retinal, which is part of why they lack beta-carotene\'s toxicity profile at supplemental dose.',
        iconName: 'Leaf',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Absorption is lipid-dependent and competitive',
        laymanDesc:
          'They need dietary fat to be absorbed, and other carotenoids compete with them for the same absorption route — which matters because beta-carotene was in the same pill.',
        molecularDetail:
          'Xanthophylls are incorporated into mixed micelles and taken up partly through SR-B1, then transported on HDL and LDL. Carotenoids compete for micellar incorporation and transport, which is the most plausible explanation for why the ten-year lutein effect was strongest precisely in participants who had also been randomised to beta-carotene.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Two specific proteins concentrate them in the macula alone',
        laymanDesc:
          'The retina does not just accumulate whatever carotenoid is around. Two dedicated carrier proteins pick out lutein and zeaxanthin specifically and pack them into the centre of the macula.',
        molecularDetail:
          'StARD3 binds lutein and GSTP1 binds zeaxanthin, concentrating them in the Henle fibre layer at levels far above any other tissue, while beta-carotene and lycopene are essentially excluded from the macula. This selectivity is the strongest argument that these particular molecules have a specific retinal function, and it is genuine.',
        iconName: 'Focus',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'They filter blue light and quench singlet oxygen',
        laymanDesc:
          'Sitting in front of the photoreceptors, the pigment absorbs the shortest-wavelength visible light before it can do photochemical damage, and neutralises the reactive oxygen that light generates.',
        molecularDetail:
          'The conjugated polyene chain absorbs maximally around 450 nm, in front of the photoreceptor outer segments, and quenches singlet oxygen efficiently. Macular pigment optical density rises reliably and dose-dependently with supplementation — a surrogate that moves cleanly, which is precisely what makes the null clinical endpoint informative rather than ambiguous.',
        iconName: 'Sun',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the disease endpoint did not follow',
        laymanDesc:
          'Despite all of that, adding lutein and zeaxanthin did not significantly reduce progression to advanced macular degeneration in the trial designed to find out.',
        molecularDetail:
          'AREDS2 primary analysis: hazard ratio 0.90 (98.7% CI 0.76 to 1.07, P = .12), with five-year progression probabilities of 29% against 31% on placebo. Ten-year follow-up gave 0.91 (95% CI 0.84 to 0.99, P = .02), rising to 0.80 when restricted to those also randomised to beta-carotene.',
        iconName: 'Eye',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'AREDS2 — lutein/zeaxanthin and omega-3 added to the AREDS formulation',
        phase: 'Randomised double-masked placebo-controlled multicentre, median 5 years',
        sampleSize: 4203,
        primaryEndpoint: 'Progression to advanced age-related macular degeneration by photographic grading',
        endpointMet: false,
        statisticalPValue:
          'Lutein + zeaxanthin HR 0.90 (98.7% CI 0.76 to 1.07), P = .12; DHA + EPA HR 0.97, P = .70; both HR 0.89, P = .10',
        unreportedAdverseSignals:
          'More lung cancers in the beta-carotene group, 23 (2.0%) versus 11 (0.9%), nominal P = .04, mostly in former smokers. No apparent effect of beta-carotene elimination or lower-dose zinc on AMD progression.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'AREDS2 Report 28 — ten-year outcomes',
        phase: 'Long-term epidemiologic follow-up of a randomised cohort',
        sampleSize: 3882,
        primaryEndpoint: 'Ten-year risk of lung cancer and of progression to late AMD',
        endpointMet: true,
        statisticalPValue:
          'Lung cancer OR 1.82 (95% CI 1.06 to 3.12, P = .02) for beta-carotene, 1.15 (95% CI 0.79 to 1.66, P = .46) for lutein/zeaxanthin; late AMD HR 0.91 (95% CI 0.84 to 0.99, P = .02) for lutein/zeaxanthin',
        unreportedAdverseSignals:
          'This is an epidemiologic follow-up rather than the randomised primary endpoint. The AMD hazard ratio strengthened to 0.80 when restricted to participants also randomised to beta-carotene, consistent with absorption competition rather than a large independent effect.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ATBC — alpha-tocopherol and beta-carotene in male smokers',
        phase: 'Randomised double-blind placebo-controlled primary prevention',
        sampleSize: 29133,
        primaryEndpoint: 'Incidence of lung cancer',
        endpointMet: false,
        statisticalPValue:
          'Beta-carotene: lung cancer incidence 18% higher (95% CI 3 to 36%); total mortality 8% higher (95% CI 1 to 16%); alpha-tocopherol: incidence change -2% (95% CI -14 to 12%)',
        unreportedAdverseSignals:
          'More deaths from haemorrhagic stroke on alpha-tocopherol. Excess beta-carotene mortality was driven by lung cancer and ischaemic heart disease. The trial was designed on epidemiologic evidence pointing the opposite way.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CARET — beta-carotene and retinol in smokers and asbestos-exposed workers',
        phase: 'Multicentre randomised double-blind placebo-controlled primary prevention',
        sampleSize: 18314,
        primaryEndpoint: 'Incidence of lung cancer',
        endpointMet: false,
        statisticalPValue:
          'Relative risk of lung cancer 1.28 (95% CI 1.04 to 1.57, P = 0.02); death from any cause RR 1.17 (95% CI 1.03 to 1.33); death from lung cancer RR 1.46 (95% CI 1.07 to 2.00)',
        unreportedAdverseSignals:
          'The trial was stopped 21 months earlier than planned because of these findings. Death from cardiovascular disease was also numerically increased, RR 1.26 (95% CI 0.99 to 1.61).',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Adding lutein and zeaxanthin to the AREDS formulation did not significantly reduce progression to advanced AMD, HR 0.90, P = .12',
        'Beta-carotene increased lung cancer incidence 18% in 29,133 male smokers and total mortality by 8%',
        'Beta-carotene plus retinol gave a lung cancer relative risk of 1.28 in 18,314 high-risk participants, stopping that trial 21 months early',
        'At ten years in AREDS2, beta-carotene assignment gave a lung cancer odds ratio of 1.82; lutein/zeaxanthin gave 1.15',
        'Ten-year progression to late AMD had a hazard ratio of 0.91 for lutein/zeaxanthin, strengthening to 0.80 within the beta-carotene stratum',
      ],
      unsupportedInferences: [
        'That lutein and zeaxanthin were adopted because they outperformed beta-carotene, when the primary comparison was null',
        'That raising macular pigment optical density demonstrates protection against vision loss or blue light',
        'That the AREDS2 formulation\'s evidence transfers to a standalone lutein capsule',
        'That an epidemiologic ten-year follow-up hazard ratio of 0.91 is equivalent to a randomised primary result',
      ],
      whatFailedInitially: [
        'Beta-carotene as a cancer preventive, which increased lung cancer and mortality in two independent large trials',
        'The AREDS2 primary hypothesis that adding lutein and zeaxanthin would further reduce AMD progression',
      ],
      realWorldOutcome: [
        'The retinal selectivity of these two molecules is real and specific, and their safety record is far better than beta-carotene\'s',
        'Their place in eye supplements is a negative one: they are what beta-carotene was replaced with, not what beat it',
        'Anyone who has ever smoked should check an older eye supplement for beta-carotene before taking it',
      ],
    },
    deliverySystem: {
      type: 'Oral softgel or tablet, usually as saponified marigold lutein with zeaxanthin, often inside a multi-ingredient eye formula',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. Marigold-derived lutein is supplied as diesters requiring saponification, and free and esterified forms are absorbed differently, so a stated milligram figure may not correspond to the free-lutein dose used in AREDS2 (10 mg lutein plus 2 mg zeaxanthin). Many products add meso-zeaxanthin, which is not a significant dietary carotenoid and was not part of the AREDS2 formulation. Carotenoids degrade under light and oxygen, so packaging and storage materially affect content. Absorption requires dietary fat and is subject to competition from other carotenoids taken at the same time.',
      safetyProfile:
        'Well tolerated, with carotenodermia — a harmless yellowing of the skin at very high intakes — the main reported effect, and no signal of the toxicity that beta-carotene showed. In the ten-year AREDS2 follow-up, the lung cancer odds ratio for lutein/zeaxanthin was 1.15 (95% CI 0.79 to 1.66, P = .46), that is, no detectable increase. The safety issue in this category belongs to the ingredient these replaced: beta-carotene raised lung cancer incidence in ATBC, raised it again in CARET severely enough to stop that trial early, and nearly doubled ten-year lung cancer odds in AREDS2, with risk concentrated in current and former smokers. Older AREDS-formula eye supplements still on shelves may contain it.',
    },
    commonQuestions: [
      {
        q: 'Does lutein prevent macular degeneration?',
        a: 'The trial designed to answer that says not significantly. AREDS2 added lutein and zeaxanthin to the existing AREDS formulation and followed participants for a median five years, and the primary analysis found a hazard ratio of 0.90 with a P value of .12 — five-year progression of 29 percent against 31 percent on placebo. A ten-year follow-up analysis later found a hazard ratio of 0.91 with a confidence interval reaching 0.99. That is a small effect from a non-randomised follow-up, and it is not the same thing as the trial\'s primary result.',
      },
      {
        q: 'Then why are they in every eye supplement?',
        a: 'Because of what they replaced. The original AREDS formula contained beta-carotene, and by then two large randomised trials had found beta-carotene increased lung cancer — 18 percent in 29,133 Finnish male smokers, and a relative risk of 1.28 in 18,314 smokers and asbestos-exposed workers, severe enough that the second trial was stopped 21 months early. AREDS2 confirmed it: at ten years, beta-carotene assignment nearly doubled the odds of lung cancer. Lutein and zeaxanthin are the safe substitute, not the superior one.',
        auditNote:
          'The AREDS2 investigators\' own conclusion was that lutein/zeaxanthin was "an appropriate replacement" for beta-carotene.',
      },
      {
        q: 'Does it protect against blue light from screens?',
        a: 'Macular pigment does absorb blue light, and supplementation reliably raises macular pigment density — that part is genuine and easy to measure. What has not been shown is that this produces any clinical benefit. The one large trial with a hard endpoint measured progression to advanced macular degeneration and did not reach significance. A supplement that reliably moves a surrogate and does not move the disease is the recurring shape in this whole file, and the screen-fatigue claim rests entirely on the surrogate.',
      },
      {
        q: 'Should I take the AREDS2 formula?',
        a: 'That depends entirely on whether you are in the population it was studied in — people with intermediate age-related macular degeneration, or advanced disease in one eye. The evidence belongs to the whole formulation tested in that group, and the original AREDS benefit came largely from the antioxidant-plus-zinc combination rather than the carotenoid. A standalone lutein capsule taken by someone with healthy eyes has not been shown to do anything, and is a different product from the one in the trial.',
      },
      {
        q: 'I used to smoke. Does any of this matter to me?',
        a: 'Directly, and it is the most actionable thing on this page. The beta-carotene harm was concentrated in current and former smokers in every trial that found it, including AREDS2, where the excess lung cancers were mostly in former smokers. Older AREDS-formula eye supplements containing beta-carotene are still sold. Checking the ingredient list of an eye supplement for beta-carotene is worth more than any decision about how much lutein to take.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'The Alpha-Tocopherol, Beta Carotene Cancer Prevention Study Group. The effect of vitamin E and beta carotene on the incidence of lung cancer and other cancers in male smokers. N Engl J Med 1994;330:1029-1035',
        identifier: '10.1056/NEJM199404143301501',
        kind: 'doi',
      },
      {
        label:
          'Omenn GS et al. Effects of a combination of beta carotene and vitamin A on lung cancer and cardiovascular disease. N Engl J Med 1996;334:1150-1155',
        identifier: '10.1056/NEJM199605023341802',
        kind: 'doi',
      },
      {
        label:
          'Age-Related Eye Disease Study 2 (AREDS2) Research Group. Lutein + zeaxanthin and omega-3 fatty acids for age-related macular degeneration: the AREDS2 randomized clinical trial. JAMA 2013;309:2005-2015',
        identifier: '10.1001/jama.2013.4997',
        kind: 'doi',
      },
      {
        label:
          'Chew EY et al. Long-term outcomes of adding lutein/zeaxanthin and omega-3 fatty acids to the AREDS supplements on age-related macular degeneration progression: AREDS2 report 28. JAMA Ophthalmol 2022;140:692-698',
        identifier: '10.1001/jamaophthalmol.2022.1640',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 5281243 — Lutein',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5281243',
        kind: 'url',
      },
      {
        label: 'PubChem CID 5280899 — Zeaxanthin',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5280899',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Folate — the one entry in this file whose supplement claim is unambiguously proven, at 72%
  // prevention of a devastating birth defect. It also has a randomised harm signal in the colon and
  // a documented interaction that can hide vitamin B12 deficiency until nerve damage is permanent.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'folate',
    name: 'Folate',
    tradeName:
      'Sold as folic acid (synthetic) or as L-5-methyltetrahydrofolate, marketed as methylfolate or under names such as Metafolin and Quatrefolic',
    sponsor:
      'No single sponsor — vitamin B9. Folic acid is the fully oxidised synthetic form used in fortification and in every landmark trial; folate is the collective term for the naturally occurring reduced forms.',
    targetGene: 'MTHFR',
    targetProtein:
      'The one-carbon transfer enzymes. Dihydrofolate reductase reduces folic acid to the usable tetrahydrofolate; methylenetetrahydrofolate reductase (MTHFR) produces 5-methyltetrahydrofolate, the circulating form and the methyl donor for the methionine synthase reaction that requires vitamin B12. Thymidylate synthase uses folate to make the thymidine that DNA needs — which is why folate deficiency stops cell division and why folate antagonists are chemotherapy.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold as a prenatal supplement and for general health, methylation and homocysteine. Folic acid supplementation before and around conception is one of the few interventions in this entire file with unambiguous randomised proof of a large clinical benefit: prevention of neural tube defects. Folic acid is also a prescription medicine for megaloblastic anaemia and is mandated in enriched grain products in the United States.',
    patientFriendlyIndication:
      'Taken before and during early pregnancy to prevent spina bifida, and in multivitamins generally',
    conditionContext: {
      conditionExplainer:
        'The neural tube — which becomes the brain and spinal cord — closes within the first four weeks after conception, usually before a woman knows she is pregnant. If it fails to close, the result is anencephaly or spina bifida. Folate is required to make thymidine for DNA synthesis, and the closing neural tube is among the fastest-dividing tissues in the embryo.',
      whyItMatters:
        'This is the clearest example in this file of a supplement claim that is completely true. It is also, for exactly that reason, the best place to be precise about what proof looks like: a randomised double-blind trial at 33 centres in seven countries, a 72% reduction in a severe birth defect, and a national fortification programme afterwards that produced a measurable population-level fall. Everything else in this file is compared against this standard.',
      whoTakesThis:
        'Women planning or capable of pregnancy, everyone in a country with mandatory grain fortification whether they know it or not, patients on methotrexate or other folate antagonists, and a large general market taking it for methylation and homocysteine.',
      clinicalGoals:
        'Trials measured neural tube defect occurrence in completed pregnancies, national birth prevalence of spina bifida and anencephaly, incidence of colorectal adenomas and advanced lesions, and the association of high serum folate with anaemia and cognitive impairment in vitamin B12 deficiency.',
    },
    oneSentenceVerdict:
      'Periconceptional folic acid cut neural tube defects by 72% in a randomised double-blind trial (relative risk 0.28, 95% CI 0.12 to 0.71) and US fortification produced a 19% national fall in birth prevalence — while a 1,021-patient randomised trial found more advanced colorectal adenomas on folic acid at second follow-up (RR 1.67, P = .05) and high serum folate is associated with worse anaemia and cognition in people who are B12-deficient.',
    laymanHowItWorks:
      'Folate is the delivery van for single carbon atoms inside the cell. Its most important cargo is the one used to build thymidine, one of the four letters of DNA, so a cell that runs out of folate cannot copy its genome and stops dividing. In an embryo whose neural tube is closing, that failure produces spina bifida or anencephaly. Folate also hands a methyl group to vitamin B12 in a reaction that recycles homocysteine — which is why enough folate can keep the blood picture of B12 deficiency looking normal while the nerve damage that B12 deficiency causes carries on unseen.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 86,
    anatomicalSite:
      'Absorbed in the proximal jejunum by the proton-coupled folate transporter; acts in the cytosol and mitochondria of every dividing cell',
    substitutes: {
      summary:
        'For neural tube defect prevention there is no substitute and the evidence is definitive. For someone with a genuine vitamin B12 deficiency, folate is worse than no substitute — it corrects the blood test while the neurological damage continues. For the general methylation market, food folate and fortified grain already supply most of what anyone gets.',
      conventionalRx: [
        {
          name: 'Folic acid as prescription therapy and as a chemotherapy rescue',
          class: 'Prescription vitamin; folinic acid as leucovorin rescue',
          howItCompares:
            'Folic acid is a genuine prescription medicine for megaloblastic anaemia, and folinic acid (leucovorin) rescues normal cells after high-dose methotrexate. Methotrexate works precisely by blocking dihydrofolate reductase, which is the strongest possible demonstration that folate metabolism is a real and consequential drug target.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: unambiguous clinical uses with defined mechanisms. Cons: the same interaction means folate supplements can interfere with methotrexate therapy, which matters for anyone taking it for rheumatoid arthritis or psoriasis.',
        },
        {
          name: 'Vitamin B12, the partner that must be checked first',
          class: 'Cobalamin, essential cofactor for methionine synthase',
          howItCompares:
            'Folate and B12 meet at a single reaction, and folate can normalise the anaemia of B12 deficiency without touching its neurological damage. In older Americans with low B12 status, serum folate above 59 nmol/L was associated with anaemia (odds ratio 3.1) and cognitive impairment (odds ratio 2.6) compared with lower folate.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: checking B12 before supplementing folate is cheap and prevents a specific, documented harm. Cons: it is almost never done before someone starts a multivitamin.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dark leafy greens, legumes, liver and citrus',
          activeCompound: 'Natural food folates, mostly polyglutamated reduced forms',
          biologicalMechanism:
            'Food folate must be deconjugated from its polyglutamate tail before absorption and is roughly half as bioavailable as synthetic folic acid, which is why fortification uses folic acid and why dietary folate equivalents exist as a unit. Folate is also heat-labile and leaches into cooking water, so preparation changes the delivered amount substantially.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the fortification programme and the prevention trials are built around 400 micrograms of folic acid daily.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Fortified grain products, in countries that mandate them',
          activeCompound: 'Synthetic folic acid added to enriched flour, bread, pasta and rice',
          biologicalMechanism:
            'The US Food and Drug Administration authorised the addition of folic acid to enriched grain products in March 1996, with compliance mandatory by January 1998. This is population-level supplementation that reaches people who never buy a supplement, which is exactly why it worked — the target behaviour, taking a tablet before you know you are pregnant, is nearly impossible to achieve individually.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Check B12 before taking high-dose folate, especially over 50',
          action:
            'Folate corrects the enlarged red cells of B12 deficiency without correcting the deficiency. The blood test that would have raised the alarm goes quiet.',
          patientImpact:
            'In seniors with low B12 status, serum folate above the 80th percentile was associated with anaemia (odds ratio 3.1, 95% CI 1.5 to 6.6) and cognitive impairment (odds ratio 2.6, 95% CI 1.1 to 6.1) compared with lower folate. In people with normal B12 status, high folate was associated with protection against cognitive impairment.',
          clinicalPrecaution:
            'The direction of the folate effect reverses depending on B12 status, which is why the interaction, not folate itself, is the thing to know.',
        },
        {
          name: 'Methylfolate is a different molecule, not an upgrade',
          action:
            'L-5-methyltetrahydrofolate is the circulating form and bypasses the MTHFR step. Every landmark trial in this record used folic acid, not methylfolate.',
          patientImpact:
            'The 72% neural tube defect reduction, the 19% national fall after fortification, and the colorectal adenoma signal were all generated with synthetic folic acid.',
          clinicalPrecaution:
            'A product that skips the enzyme the marketing is about also skips the entire evidence base built on the compound it replaced.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1=CC(=CC=C1C(=O)N[C@@H](CCC(=O)O)C(=O)O)NCC2=CN=C3C(=N2)C(=O)NC(=N3)N',
      chemicalFormula: 'C19H19N7O6',
      molecularWeight:
        '441.4 g/mol. This is folic acid, the fully oxidised synthetic form used in fortification and in every trial cited here. L-5-methyltetrahydrofolate, sold as methylfolate, is a different molecule at C20H25N7O6 and 459.5 g/mol — reduced, methylated, and carrying none of this evidence base.',
      structureSource: {
        label: 'PubChem CID 135398658 — Folic acid, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398658',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'fol-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Vitamer speciation and stability under light and oxygen',
          description:
            'Folate is not one compound. Folic acid, dihydrofolate, tetrahydrofolate and 5-methyltetrahydrofolate have different stabilities and different biology, and the reduced forms oxidise rapidly in air and light. A total-folate microbiological assay reports them together and will pass a product whose active vitamer has degraded to something inert.',
          reagentsAndBuffer:
            'LC-MS/MS speciation of folic acid, dihydrofolate, tetrahydrofolate, 5-methyltetrahydrofolate and 5-formyltetrahydrofolate against authenticated standards; ascorbate-containing extraction buffer with dithiothreitol to prevent oxidation during preparation; amber glassware and nitrogen headspace; Lactobacillus rhamnosus microbiological assay for total folate as the orthogonal check',
        },
        {
          id: 'fol-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the labelled folic acid tracer and the unmetabolised-folate standard',
          description:
            'A specific question needs a specific tracer: how much administered folic acid escapes reduction and appears in blood unmetabolised. Dihydrofolate reductase in the human liver has limited capacity, and unmetabolised folic acid in plasma has been the central concern about high-dose supplementation and fortification since it was first detected.',
          dependsOnStepId: 'fol-w1',
          reagentsAndBuffer:
            '13C5-folic acid tracer; 13C5-5-methyltetrahydrofolate as the metabolite standard; sterile preparation for an intravenous reference arm; isotopic enrichment confirmed by LC-MS/MS; documented handling under reduced light',
        },
        {
          id: 'fol-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Plasma and red cell folate extraction with immediate antioxidant protection',
          description:
            'Red cell folate reflects status over the preceding months while plasma folate reflects yesterday, and the two answer different questions. Both are destroyed by oxidation during handling, so ascorbate protection at the point of collection is not optional. This is where many published folate measurements go wrong.',
          dependsOnStepId: 'fol-w2',
          reagentsAndBuffer:
            'Whole blood haemolysed immediately in 1% ascorbic acid for red cell folate; plasma separated within 30 minutes with ascorbate added; conjugase treatment to deconjugate polyglutamates; parallel serum vitamin B12 and methylmalonic acid measurement on the same draw, because folate cannot be interpreted without B12 status',
        },
        {
          id: 'fol-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Thymidylate synthesis and the methionine synthase junction',
          description:
            'Test both arms of folate metabolism in the same system, because they fail differently. Thymidylate synthesis failure stops DNA replication and produces the megaloblastic picture. The methionine synthase arm requires vitamin B12, and it is here that adequate folate masks B12 deficiency — the folate keeps one-carbon flux going for DNA while the B12-dependent reaction, which nerves depend on, stays blocked.',
          dependsOnStepId: 'fol-w3',
          reagentsAndBuffer:
            'Human lymphoblast or neural progenitor cultures in folate-defined medium; deoxyuridine suppression test for thymidylate synthesis; methotrexate as the dihydrofolate reductase inhibitor control; vitamin B12-depleted medium with nitrous-oxide-inactivated methionine synthase as the deficiency model; homocysteine and methylmalonic acid quantified in the medium',
        },
        {
          id: 'fol-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Hard clinical endpoints, with B12 status as a prespecified stratifier',
          description:
            'Report the clinical outcome and stratify by vitamin B12 status, because the folate literature contains a documented effect reversal across that stratum. In seniors with normal B12, high folate was associated with protection against cognitive impairment; in those with low B12, with a 2.6-fold higher odds of it. Any folate study that does not measure B12 cannot distinguish those two populations.',
          dependsOnStepId: 'fol-w4',
          reagentsAndBuffer:
            'Prospectively registered clinical endpoint with masked adjudication; serum B12 and methylmalonic acid at baseline and follow-up as prespecified stratification variables; red cell folate to document exposure; for oncology endpoints, colonoscopic surveillance with centralised histopathology',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fol-a1',
        category: 'measured',
        title: 'A 72% reduction in neural tube defects, randomised and double-blind',
        laymanSummary:
          'A trial across seven countries gave folic acid to women who had already had a pregnancy affected by spina bifida or anencephaly. It cut the recurrence by nearly three quarters.',
        technicalDetails:
          'The Medical Research Council Vitamin Study was a randomised double-blind factorial trial at 33 centres in seven countries, allocating 1,817 women at high risk because of a previous affected pregnancy to folic acid, a mixture of seven other vitamins, both, or neither. Of 1,195 women with a completed pregnancy in which neural tube defect status was known, 27 had a defect: 6 in the folic acid groups and 21 in the other groups — a 72% protective effect, relative risk 0.28 (95% CI 0.12 to 0.71). The other vitamins showed no significant effect (relative risk 0.80, 95% CI 0.32 to 1.72), which is the internal control that makes the folate result specific rather than a general prenatal-vitamin effect. The authors noted no demonstrable harm from folic acid, while stating that the study\'s ability to detect rare or slight adverse effects was limited. Czeizel and Dudas subsequently showed the same effect for first occurrence rather than recurrence in a separate randomised trial. This is the reference standard against which every other claim in this file is judged, and it is worth stating exactly what it took: a randomised, double-blind, multinational trial with an active-comparator arm and a hard, unambiguous clinical endpoint.',
        evidenceSource: 'MRC Vitamin Study Research Group. Lancet 1991;338:131-137',
        doi: '10.1016/0140-6736(91)90133-A',
        measuredMetric:
          'Occurrence of neural tube defects in completed pregnancies among women with a previously affected pregnancy',
        auditFlag: 'verified',
      },
      {
        id: 'fol-a2',
        category: 'measured',
        title: 'National fortification produced a 19% fall in birth prevalence',
        laymanSummary:
          'After the United States required folic acid in enriched grain products, neural tube defects at birth fell by nineteen percent nationally.',
        technicalDetails:
          'Honein and colleagues analysed birth certificate data for live births in 45 US states and Washington DC between January 1990 and December 1999. Comparing the pre-fortification window of October 1995 to December 1996 against the post-mandatory-fortification window of October 1998 to December 1999, birth prevalence of neural tube defects fell from 37.8 to 30.5 per 100,000 live births — a 19% decline, prevalence ratio 0.81 (95% CI 0.75 to 0.87). Among women who received only third-trimester or no prenatal care, prevalence fell from 53.4 to 46.5 per 100,000 (prevalence ratio 0.87, 95% CI 0.64 to 1.18). The context that makes this a public health argument rather than a supplement argument is in the paper\'s first paragraph: before fortification only an estimated 29% of US reproductive-aged women were taking 400 micrograms of folic acid daily. The behaviour the trial required — supplementation before conception, in the weeks before a pregnancy is usually detected — could not be achieved by advice, and fortification achieved it by removing the decision.',
        evidenceSource: 'Honein MA, Paulozzi LJ, Mathews TJ, Erickson JD, Wong LY. JAMA 2001;285:2981-2986',
        doi: '10.1001/jama.285.23.2981',
        measuredMetric:
          'National birth prevalence of spina bifida and anencephaly per 100,000 live births, before and after mandatory fortification',
        auditFlag: 'verified',
      },
      {
        id: 'fol-a3',
        category: 'failed',
        title: 'Folic acid did not prevent colorectal adenomas, and advanced lesions rose',
        laymanSummary:
          'A trial gave 1 mg of folic acid daily to a thousand people with a history of colon polyps, expecting fewer polyps. At the second follow-up, advanced lesions were more common on folic acid.',
        technicalDetails:
          'Cole and colleagues randomised 1,021 men and women with a recent history of colorectal adenomas and no previous invasive large intestine carcinoma to 1 mg per day of folic acid or placebo, in a phase 3 double-blind trial at 9 centres between 1994 and 2004, with two colonoscopic surveillance cycles. In the first three years, at least one adenoma occurred in 44.1% on folic acid against 42.4% on placebo (RR 1.04, 95% CI 0.90 to 1.20, P = .58), and at least one advanced lesion in 11.4% against 8.6% (RR 1.32, 95% CI 0.90 to 1.92, P = .15). At the second follow-up, in 607 participants, at least one adenoma occurred in 41.9% against 37.2% (RR 1.13, 95% CI 0.93 to 1.37, P = .23) and at least one advanced lesion in 11.6% against 6.9% (RR 1.67, 95% CI 1.00 to 2.80, P = .05). Folic acid was associated with higher risks of having three or more adenomas and of non-colorectal cancers. The authors concluded that folic acid at 1 mg per day does not reduce colorectal adenoma risk and that further research is needed into whether it might increase colorectal neoplasia. The mechanistic reading is coherent and uncomfortable: folate is required for DNA synthesis, so supplying more of it to a tissue that already contains dysplastic clones may accelerate what is already growing.',
        evidenceSource: 'Cole BF et al. JAMA 2007;297:2351-2359',
        doi: '10.1001/jama.297.21.2351',
        measuredMetric:
          'Occurrence of at least one colorectal adenoma and of at least one advanced lesion across two colonoscopic surveillance cycles',
        auditFlag: 'verified',
      },
      {
        id: 'fol-a4',
        category: 'inferred',
        title: 'High folate reverses direction depending on vitamin B12 status',
        laymanSummary:
          'In older people with enough vitamin B12, high folate was associated with better cognition. In those short of B12, the same high folate was associated with anaemia and worse cognition.',
        technicalDetails:
          'Morris and colleagues examined 1,459 senior participants in the 1999-2002 US National Health and Nutrition Examination Survey, defining low B12 status as serum B12 below 148 pmol/L or serum methylmalonic acid above 210 nmol/L. After adjustment, low versus normal B12 status was associated with anaemia (odds ratio 2.7, 95% CI 1.7 to 4.2), macrocytosis (1.8, 95% CI 1.01 to 3.3) and cognitive impairment (2.5, 95% CI 1.6 to 3.8). Within the low-B12 group, serum folate above 59 nmol/L compared with at or below that level was associated with anaemia (odds ratio 3.1, 95% CI 1.5 to 6.6) and cognitive impairment (2.6, 95% CI 1.1 to 6.1). In the normal-B12 group the odds ratios for high folate were below 1.0, significantly so for cognitive impairment (0.4, 95% CI 0.2 to 0.9), with a significant interaction, P less than 0.05. The authors note the historic origin of the concern — reports of folic acid treatment of pernicious anaemia delaying diagnosis or worsening outcomes — and that experimental investigation of it would be unethical. This is observational and cannot establish causation. It is also a direction-reversing interaction with a fully specified biochemical mechanism, and it is the reason B12 status should be known before high-dose folate is taken.',
        evidenceSource: 'Morris MS, Jacques PF, Rosenberg IH, Selhub J. Am J Clin Nutr 2007;85:193-200',
        doi: '10.1093/ajcn/85.1.193',
        inferredClaim:
          'That folate supplementation is uniformly beneficial, when its association with anaemia and cognition reverses direction across vitamin B12 status',
        auditFlag: 'caution',
      },
      {
        id: 'fol-a5',
        category: 'conclusion_shift',
        title: 'From an individual supplement to a population intervention, because advice failed',
        laymanSummary:
          'The trial proved that a tablet works. The problem was that the tablet has to be taken before you know you are pregnant, and only 29 percent of women were taking one. So the vitamin was put in the flour instead.',
        technicalDetails:
          'The MRC trial proved efficacy in 1991. Six years later the intervention had barely moved: before fortification, an estimated 29% of US reproductive-aged women were taking 400 micrograms of folic acid daily, and the neural tube closes within four weeks of conception, before most pregnancies are recognised. The FDA authorised folic acid in enriched grain products in March 1996 with mandatory compliance by January 1998, and national birth prevalence of neural tube defects fell 19%. This is a shift in the unit of intervention rather than in the science, and it carries a lesson that runs against most of this file: the folate case succeeded not because a supplement worked but because a public health system stopped relying on individuals to take one. It also created the exposure that produced the colorectal and vitamin B12 concerns, since fortification supplements the entire population including men, older adults and people with undiagnosed B12 deficiency, none of whom stand to gain anything from it.',
        evidenceSource: 'Honein MA, Paulozzi LJ, Mathews TJ, Erickson JD, Wong LY. JAMA 2001;285:2981-2986',
        doi: '10.1001/jama.285.23.2981',
        inferredClaim:
          'That a proven individual supplement benefit translates into individual behaviour, when the required behaviour precedes knowledge of the pregnancy',
        auditFlag: 'verified',
      },
      {
        id: 'fol-a6',
        category: 'inferred',
        title: 'Methylfolate carries none of the evidence built on folic acid',
        laymanSummary:
          'The premium "methylfolate" form is a different molecule from the folic acid used in every landmark trial and in fortification. Its marketing rests on a gene variant rather than on outcome data.',
        technicalDetails:
          'Folic acid (C19H19N7O6, 441.4 g/mol) is fully oxidised and must be reduced by dihydrofolate reductase before use. L-5-methyltetrahydrofolate (C20H25N7O6, 459.5 g/mol) is the circulating reduced form and enters the pool downstream of methylenetetrahydrofolate reductase. The case for it rests on the MTHFR C677T polymorphism, which reduces enzyme activity and is common. What does not follow is a clinical claim: every result in this record — the 72% neural tube defect reduction, the 19% national fall after fortification, the colorectal adenoma signal, the B12 interaction data — was generated with folic acid, in populations containing the usual proportion of C677T carriers, and the benefit was observed anyway. There is a genuine open scientific question about unmetabolised folic acid in plasma at high intakes, and methylfolate does bypass it. That is a hypothesis about a mechanism, not a demonstrated clinical advantage, and it is being sold as the latter.',
        evidenceSource: 'MRC Vitamin Study Research Group. Lancet 1991;338:131-137',
        doi: '10.1016/0140-6736(91)90133-A',
        inferredClaim:
          'That L-5-methyltetrahydrofolate is clinically superior to folic acid, particularly in MTHFR C677T carriers, when no outcome trial has compared them',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed, then reduced — and folic acid needs an extra step',
        laymanDesc:
          'Natural folate from food arrives ready to use. Synthetic folic acid has to be chemically reduced by a liver enzyme first, and that enzyme has limited capacity.',
        molecularDetail:
          'Food folates are polyglutamated and must be deconjugated before uptake by the proton-coupled folate transporter in the proximal jejunum, giving roughly half the bioavailability of synthetic folic acid. Folic acid itself is fully oxidised and requires two successive reductions by dihydrofolate reductase, whose human hepatic capacity is limited — which is why unmetabolised folic acid appears in plasma at high intakes.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It becomes the vehicle for single carbon atoms',
        laymanDesc:
          'Once reduced, folate acts as a carrier that picks up and drops off single carbon atoms — the raw material for building DNA bases and for methylation.',
        molecularDetail:
          'Tetrahydrofolate accepts one-carbon units at the N5 and N10 positions in several oxidation states — methyl, methylene, formyl — feeding purine synthesis, thymidylate synthesis and the methionine cycle. MTHFR commits one-carbon units irreversibly to the methyl form, which is why the enzyme sits at the branch point between DNA synthesis and methylation.',
        iconName: 'Combine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Without it, DNA cannot be copied and cells stop dividing',
        laymanDesc:
          'One of DNA\'s four letters can only be made with folate. A cell short of folate cannot replicate its genome — which is exactly why some chemotherapy drugs work by blocking folate.',
        molecularDetail:
          'Thymidylate synthase converts dUMP to dTMP using 5,10-methylenetetrahydrofolate. Deficiency causes uracil misincorporation and megaloblastic arrest. Methotrexate inhibits dihydrofolate reductase and 5-fluorouracil inhibits thymidylate synthase — folate antagonism is a working chemotherapy strategy, which is the strongest possible evidence that this pathway matters and the mechanistic backdrop to the colorectal adenoma finding.',
        iconName: 'Dna',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'And here it meets vitamin B12, at a single reaction',
        laymanDesc:
          'Folate hands its methyl group to vitamin B12 in one specific reaction. If B12 is missing, the folate piles up in a form the cell cannot use, and the blood picture looks fixed while nerves keep being damaged.',
        molecularDetail:
          'Methionine synthase requires vitamin B12 to transfer the methyl group from 5-methyltetrahydrofolate to homocysteine. Without B12, folate is trapped as 5-methyltetrahydrofolate — the methyl-folate trap — and supplemental folate bypasses the resulting megaloblastic anaemia without addressing the B12-dependent methylation that peripheral nerve and spinal cord require. Morris et al. measured the population consequence: with low B12, high serum folate carried an anaemia odds ratio of 3.1 and cognitive impairment odds ratio of 2.6.',
        iconName: 'GitMerge',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The proven outcome is a birth defect prevented',
        laymanDesc:
          'In the closing neural tube — one of the fastest-dividing tissues in the embryo — adequate folate is the difference between a normal spinal cord and spina bifida.',
        molecularDetail:
          'Relative risk 0.28 (95% CI 0.12 to 0.71) for neural tube defect recurrence in the MRC trial, against 0.80 (95% CI 0.32 to 1.72) for the seven-vitamin comparator arm. National birth prevalence fell from 37.8 to 30.5 per 100,000 live births after mandatory US fortification, prevalence ratio 0.81 (95% CI 0.75 to 0.87).',
        iconName: 'Baby',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MRC Vitamin Study — periconceptional folic acid and neural tube defects',
        phase: 'Randomised double-blind factorial, 33 centres in seven countries',
        sampleSize: 1817,
        primaryEndpoint: 'Occurrence of neural tube defect in a completed pregnancy',
        endpointMet: true,
        statisticalPValue:
          'Relative risk 0.28 (95% CI 0.12 to 0.71), a 72% protective effect; other vitamins relative risk 0.80 (95% CI 0.32 to 1.72)',
        unreportedAdverseSignals:
          'The authors stated that no harm was demonstrable but that the study\'s power to detect rare or slight adverse effects was limited — a caveat that later trials in other indications went on to fill in.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Czeizel 1992 — periconceptional multivitamin and first occurrence of neural tube defects',
        phase: 'Randomised controlled trial',
        sampleSize: 4753,
        primaryEndpoint:
          'First occurrence of neural tube defect after periconceptional vitamin supplementation',
        endpointMet: true,
        statisticalPValue:
          'Six neural tube defects in the trace-element group against none in the vitamin group, P = 0.029; congenital malformations 22.9 versus 13.3 per 1000, P = 0.02',
        unreportedAdverseSignals:
          'The intervention was a 12-vitamin, 4-mineral, 3-trace-element tablet containing 0.8 mg folic acid, so it does not isolate the folate effect the way the MRC factorial design did. Cleft lip with or without cleft palate was not reduced. Pregnancy was confirmed in 4,753 women but outcome was known in 4,156.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Honein 2001 — impact of US folic acid fortification on neural tube defects',
        phase: 'National population surveillance before and after mandatory fortification',
        sampleSize: 0,
        primaryEndpoint:
          'Birth certificate prevalence of spina bifida and anencephaly per 100,000 live births',
        endpointMet: true,
        statisticalPValue:
          '37.8 to 30.5 per 100,000 live births, a 19% decline, prevalence ratio 0.81 (95% CI 0.75 to 0.87)',
        unreportedAdverseSignals:
          'Based on birth certificate reports, which undercount neural tube defects and do not capture terminations. Sample size is recorded as zero because this was population surveillance rather than an enrolled trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NCT00272324 — folic acid for the prevention of colorectal adenomas',
        phase: 'Phase 3 randomised double-blind placebo-controlled two-factor',
        sampleSize: 1021,
        primaryEndpoint: 'Occurrence of at least one colorectal adenoma',
        endpointMet: false,
        statisticalPValue:
          'First cycle: adenoma 44.1% versus 42.4%, RR 1.04 (95% CI 0.90 to 1.20), P = .58. Second cycle: advanced lesion 11.6% versus 6.9%, RR 1.67 (95% CI 1.00 to 2.80), P = .05',
        unreportedAdverseSignals:
          'Folic acid was associated with higher risks of having three or more adenomas and of non-colorectal cancers. Only 59.5% of participants underwent the second surveillance cycle, so the advanced-lesion signal comes from a reduced sample.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Morris 2007 — folate and vitamin B12 status in NHANES 1999-2002',
        phase: 'Cross-sectional analysis of a national survey',
        sampleSize: 1459,
        primaryEndpoint:
          'Association of serum folate with anaemia, macrocytosis and cognitive impairment, stratified by vitamin B12 status',
        endpointMet: true,
        statisticalPValue:
          'Low B12 with high folate: anaemia OR 3.1 (95% CI 1.5 to 6.6), cognitive impairment OR 2.6 (95% CI 1.1 to 6.1). Normal B12 with high folate: cognitive impairment OR 0.4 (95% CI 0.2 to 0.9); interaction P < 0.05',
        unreportedAdverseSignals:
          'Cross-sectional and observational, so causation cannot be established. The authors note that experimental investigation of this question would be unethical, which means the observational data are all there will ever be.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Periconceptional folic acid reduced neural tube defect recurrence by 72%, relative risk 0.28 (95% CI 0.12 to 0.71)',
        'A seven-vitamin comparator arm in the same trial showed no significant effect, isolating folate as the active component',
        'US mandatory fortification was followed by a 19% fall in neural tube defect birth prevalence nationally',
        'Folic acid 1 mg/day did not reduce colorectal adenoma risk, and advanced lesions were more common at second surveillance, RR 1.67, P = .05',
        'In seniors with low vitamin B12, high serum folate was associated with anaemia (OR 3.1) and cognitive impairment (OR 2.6)',
      ],
      unsupportedInferences: [
        'That folate is uniformly beneficial, when its cognitive association reverses direction across vitamin B12 status',
        'That methylfolate is clinically superior to folic acid, which no outcome trial has tested',
        'That a proven benefit in early pregnancy justifies high-dose folate for adults generally',
      ],
      whatFailedInitially: [
        'Folic acid for colorectal adenoma prevention, where the direction of the advanced-lesion result favoured placebo',
        'Advice-based supplementation, which reached only about 29% of US reproductive-aged women before fortification',
      ],
      realWorldOutcome: [
        'This is the strongest supplement result in this file and the benchmark the rest of it is measured against',
        'It succeeded as a population fortification programme, not as an individual purchasing decision',
        'The same fortification exposes people with no possible benefit, which is where the colorectal and B12 concerns come from',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet or capsule as folic acid or L-5-methyltetrahydrofolate; also mandated in enriched grain products',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, available as a prescription medicine for megaloblastic anaemia, and added by regulation to enriched grain products since mandatory compliance in January 1998. Folic acid and L-5-methyltetrahydrofolate are different molecules with different entry points into folate metabolism; all the landmark evidence was generated with folic acid. Reduced folate vitamers oxidise readily in light and air, so product stability differs between the two forms. Because fortification, prenatal supplements and multivitamins all deliver folic acid, total intake in a supplement user is easy to underestimate.',
      safetyProfile:
        'Direct toxicity is very low and folic acid is among the best-tolerated substances in this file. The meaningful risks are interactions and context. High folate intake corrects the megaloblastic anaemia of vitamin B12 deficiency without correcting the neurological damage, which can delay diagnosis until deficits are irreversible — and in seniors with low B12 status, high serum folate was associated with a 3.1-fold odds of anaemia and 2.6-fold odds of cognitive impairment. In people with existing colorectal adenomas, 1 mg per day was associated with more advanced lesions at second surveillance and with more non-colorectal cancers. Folate supplements antagonise methotrexate, which is prescribed for rheumatoid arthritis, psoriasis and cancer, and folic acid can mask laboratory monitoring of that therapy.',
    },
    commonQuestions: [
      {
        q: 'Is the folic acid claim actually proven?',
        a: 'Yes, and it is the only entry in this file where that sentence can be written without qualification. A randomised double-blind trial at 33 centres in seven countries found a 72 percent reduction in neural tube defects — relative risk 0.28, confidence interval 0.12 to 0.71 — with an active comparator arm of seven other vitamins that showed nothing. A national fortification programme then produced a 19 percent fall in birth prevalence across the United States. Everything else on this site is judged against that.',
      },
      {
        q: 'Why is folic acid added to bread rather than just recommended?',
        a: 'Because the recommendation did not work, for a structural reason. The neural tube closes within about four weeks of conception, usually before a pregnancy is recognised, so the supplement has to be taken before anyone knows it is needed. Before fortification only about 29 percent of US reproductive-aged women were taking 400 micrograms daily. Fortification removed the decision, and the defect rate fell. That is a public health success rather than a supplement success, and the distinction matters.',
      },
      {
        q: 'Should I be worried about the cancer finding?',
        a: 'It deserves to be known and not overstated. A phase 3 trial gave 1 mg of folic acid daily to 1,021 people with a history of colorectal adenomas. It did not prevent adenomas, and at the second colonoscopy cycle advanced lesions occurred in 11.6 percent on folic acid against 6.9 percent on placebo, relative risk 1.67, P = .05, with higher risks of three or more adenomas and of non-colorectal cancers. The mechanism is uncomfortable but coherent: folate is needed for DNA synthesis, so supplying more of it to a tissue already containing dysplastic clones may support what is already growing.',
        auditNote:
          'The trial authors called for further research into whether folic acid might increase colorectal neoplasia.',
      },
      {
        q: 'Can folate hide a vitamin B12 problem?',
        a: 'Yes, and this is the interaction most worth understanding. Folate and B12 meet at one reaction. Adequate folate keeps red cell production going, so the enlarged red cells that would have prompted a B12 test never appear — while the B12-dependent chemistry that peripheral nerves and spinal cord depend on stays blocked. In older Americans with low B12 status, high serum folate was associated with 3.1-fold odds of anaemia and 2.6-fold odds of cognitive impairment. In those with normal B12, high folate was associated with less cognitive impairment. The direction reverses across the interaction.',
      },
      {
        q: 'Is methylfolate better than folic acid?',
        a: 'There is no outcome evidence that it is. Methylfolate is a different molecule that enters folate metabolism downstream of the MTHFR enzyme, and it is sold on the basis of the common C677T variant that reduces that enzyme\'s activity. But every result on this page — the 72 percent reduction, the national fall after fortification, the colorectal signal, the B12 interaction data — was generated with folic acid, in populations containing the usual share of C677T carriers, and the benefit appeared anyway. There is a real open question about unmetabolised folic acid at high intakes, and methylfolate does bypass it. That is a mechanism, not a demonstrated advantage.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'MRC Vitamin Study Research Group. Prevention of neural tube defects: results of the Medical Research Council Vitamin Study. Lancet 1991;338:131-137',
        identifier: '10.1016/0140-6736(91)90133-A',
        kind: 'doi',
      },
      {
        label:
          'Czeizel AE, Dudas I. Prevention of the first occurrence of neural-tube defects by periconceptional vitamin supplementation. N Engl J Med 1992;327:1832-1835',
        identifier: '10.1056/NEJM199212243272602',
        kind: 'doi',
      },
      {
        label:
          'Honein MA, Paulozzi LJ, Mathews TJ, Erickson JD, Wong LY. Impact of folic acid fortification of the US food supply on the occurrence of neural tube defects. JAMA 2001;285:2981-2986',
        identifier: '10.1001/jama.285.23.2981',
        kind: 'doi',
      },
      {
        label:
          'Morris MS, Jacques PF, Rosenberg IH, Selhub J. Folate and vitamin B-12 status in relation to anemia, macrocytosis, and cognitive impairment in older Americans in the age of folic acid fortification. Am J Clin Nutr 2007;85:193-200',
        identifier: '10.1093/ajcn/85.1.193',
        kind: 'doi',
      },
      {
        label:
          'Cole BF et al. Folic acid for the prevention of colorectal adenomas: a randomized clinical trial. JAMA 2007;297:2351-2359',
        identifier: '10.1001/jama.297.21.2351',
        kind: 'doi',
      },
      {
        label: 'Aspirin/Folate Polyp Prevention Study trial registration',
        identifier: 'NCT00272324',
        kind: 'nct',
      },
      {
        label: 'PubChem CID 135398658 — Folic acid',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398658',
        kind: 'url',
      },
      {
        label: 'PubChem CID 135398561 — Levomefolic acid (L-5-methyltetrahydrofolate)',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/135398561',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Vitamin K2 MK-7 — a biomarker that moves dramatically, two positive three-year trials using the
  // same branded ingredient, and three randomised imaging trials in the populations that matter
  // finding nothing, including 365 men followed for two years with CT scoring of their aortic valves.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'vitamin-k2-mk7',
    name: 'Vitamin K2 MK-7',
    tradeName: 'Menaquinone-7; the dominant branded ingredient in the trial literature is MenaQ7',
    sponsor:
      'No single sponsor — a long-chain menaquinone produced by bacterial fermentation, typically from Bacillus subtilis natto. NattoPharma\'s MenaQ7 is the ingredient used in the principal three-year trials.',
    targetGene: 'GGCX',
    targetProtein:
      'Gamma-glutamyl carboxylase (GGCX), which uses reduced vitamin K to convert glutamate residues to gamma-carboxyglutamate in the vitamin K-dependent proteins. Two matter here: osteocalcin, which binds calcium into bone matrix, and matrix Gla protein, which inhibits calcification in arterial wall. Both are inactive until carboxylated, and how much remains uncarboxylated is the biomarker the whole field runs on.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for bone density and for keeping calcium "out of arteries and in bones", usually alongside vitamin D. Not approved by the FDA for any indication. EFSA has accepted a health claim for vitamin K in maintaining normal bone. Vitamin K1 is separately a genuine medicine, used to reverse warfarin and to prevent haemorrhagic disease of the newborn.',
    patientFriendlyIndication:
      'Taken with vitamin D for bone density and to keep calcium out of the arteries',
    conditionContext: {
      conditionExplainer:
        'Several proteins in the body are built with a chemical hook that only works after vitamin K adds a second carboxyl group to them. Osteocalcin uses that hook to bind calcium into bone. Matrix Gla protein uses it to stop calcium crystallising in artery walls. Without vitamin K, both proteins are made but remain inactive.',
      whyItMatters:
        'This is the cleanest surrogate-versus-outcome case in the file. Supplementing MK-7 cuts circulating inactive matrix Gla protein by around half, which is dramatic, unambiguous and easy to measure. When that biomarker change was tested against actual calcification on imaging, in three separate randomised trials in three different populations, nothing followed.',
      whoTakesThis:
        'People taking vitamin D or calcium who have been told K2 directs the calcium, postmenopausal women concerned about bone density, and people with coronary or valvular calcification found incidentally on a scan.',
      clinicalGoals:
        'Trials measured circulating dephosphorylated-uncarboxylated matrix Gla protein, the uncarboxylated to carboxylated osteocalcin ratio, bone mineral density and content by DXA, carotid-femoral pulse wave velocity, aortic valve calcium score on CT, and arterial calcification by CT and 18F-sodium-fluoride PET.',
    },
    oneSentenceVerdict:
      'MK-7 halves circulating inactive matrix Gla protein and, in two three-year trials using the same branded ingredient, reduced bone loss and arterial stiffness in postmenopausal women — but in 365 men with aortic valve calcification followed for two years the difference in calcium score progression was 17 arbitrary units (P = 0.64), and two other randomised imaging trials in diabetes and coronary disease also found nothing.',
    laymanHowItWorks:
      'A handful of proteins in your body are made with a chemical clamp that only closes after vitamin K modifies them. One of those proteins locks calcium into bone; another patrols artery walls and stops calcium crystallising there. If vitamin K is short, both proteins are still made but sit around uncarboxylated and useless, and you can measure exactly how much of the inactive form is circulating. Supplementing MK-7 activates them, and the inactive fraction drops by about half — which is a real and impressive biochemical result. The question the trials asked next is whether activating those proteins changes the calcium in anybody\'s arteries, and the imaging says no.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 40,
    anatomicalSite:
      'Hepatocyte endoplasmic reticulum for the clotting factors; osteoblasts for osteocalcin; vascular smooth muscle cells of the arterial media for matrix Gla protein',
    substitutes: {
      summary:
        'For bone, the interventions with fracture-endpoint evidence are bisphosphonates and denosumab, and neither has a K2 competitor. For vascular calcification there is currently no intervention with imaging or outcome evidence, including this one. Vitamin K1 from green vegetables covers the clotting requirement completely.',
      conventionalRx: [
        {
          name: 'Vitamin K1 (phylloquinone) as a medicine',
          class: 'Prescription antidote and neonatal prophylaxis',
          howItCompares:
            'Vitamin K1 is genuinely a medicine: it reverses warfarin anticoagulation and, given at birth, prevents vitamin K deficiency bleeding of the newborn — a condition that is fatal or disabling and essentially eliminated by a single injection. That is the vitamin K claim with hard outcome evidence, and it belongs to K1 rather than to MK-7.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: unambiguous, life-saving, and mechanistically transparent. Cons: it is routinely invoked to lend authority to MK-7 supplement claims that rest on different proteins and different endpoints.',
        },
        {
          name: 'Bisphosphonates and denosumab for bone',
          class: 'Antiresorptive osteoporosis therapy',
          howItCompares:
            'These reduce fractures in randomised trials with fracture as the endpoint. The MK-7 bone trial measured bone mineral density and content over three years and reported reduced age-related decline; it was not powered for fractures.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: fracture endpoints, which is what patients care about. Cons: real adverse effects, which is part of why a supplement alternative is attractive and why the standard of evidence for one should not be lower.',
        },
      ],
      naturalFoods: [
        {
          name: 'Natto',
          activeCompound: 'Menaquinone-7, produced by Bacillus subtilis during fermentation',
          biologicalMechanism:
            'Fermented soybeans are by a wide margin the richest dietary source of MK-7, and the bacterial fermentation used to manufacture the supplement is the same process. The long isoprenoid tail gives MK-7 a half-life of days rather than the hours of vitamin K1, which is the genuine pharmacological argument for this form.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the three-year trials used 180 micrograms of MK-7 daily and the aortic valve trial used 720 micrograms.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Green leafy vegetables, for vitamin K1',
          activeCompound: 'Phylloquinone',
          biologicalMechanism:
            'K1 is the dominant dietary vitamin K and fully covers the hepatic clotting requirement, which is why frank vitamin K deficiency is rare in adults. The K2 supplement case is not about deficiency of the vitamin but about the carboxylation status of two extrahepatic proteins.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'If you take warfarin, this is a genuine interaction',
          action:
            'Vitamin K in any form directly antagonises warfarin, which works by blocking vitamin K recycling. MK-7\'s long half-life makes the interaction more persistent than K1\'s.',
          patientImpact:
            'Starting or stopping a K2 supplement can shift the INR substantially, and the effect will not clear quickly.',
          clinicalPrecaution:
            'This is the one unambiguous, mechanistically certain risk on this page, and it applies to a large population taking a common anticoagulant.',
        },
        {
          name: 'Ask whether the endpoint was a blood marker or a scan',
          action:
            'Distinguish dephosphorylated-uncarboxylated matrix Gla protein, which MK-7 moves reliably, from calcification measured by CT or PET, which it has not.',
          patientImpact:
            'MK-7 decreased circulating dp-ucMGP by 50% against placebo in the arterial stiffness trial. In 365 men with aortic valve calcification, the difference in calcium score progression over two years was 17 arbitrary units, P = 0.64.',
          clinicalPrecaution:
            'A supplement that reliably corrects a biomarker and reliably fails to change the imaging is the defining pattern here.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CC1=C(C(=O)C2=CC=CC=C2C1=O)C/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CC/C=C(\\C)/CCC=C(C)C',
      chemicalFormula: 'C46H64O2',
      molecularWeight:
        '649.0 g/mol. The naphthoquinone head is shared with all vitamin K forms; what differs is the tail. MK-7 carries seven isoprene units against MK-4\'s four and phylloquinone\'s single phytyl chain, which is why its plasma half-life is measured in days rather than hours and why MK-4 trial evidence does not transfer to it.',
      structureSource: {
        label: 'PubChem CID 5287554 — Menaquinone-7, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5287554',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'k2-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Menaquinone chain length and cis-trans isomer determination',
          description:
            'A label saying "vitamin K2" can mean MK-4, MK-7 or a mixture, and these have half-lives differing by more than an order of magnitude and separate trial literatures. Separately, synthetic MK-7 can contain the cis isomer, which is biologically inactive, while fermentation-derived material is all-trans. Neither is disclosed on a label and neither is detected by a total vitamin K assay.',
          reagentsAndBuffer:
            'Reversed-phase HPLC with post-column zinc reduction and fluorescence detection, resolving MK-4 through MK-9 and phylloquinone against authenticated standards; C30 column for cis and all-trans MK-7 separation; light-protected amber glassware throughout, since menaquinones are photolabile',
        },
        {
          id: 'k2-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the deuterated MK-7 tracer',
          description:
            'MK-7\'s multi-day half-life means steady state takes weeks and plasma sampling in a short study measures accumulation rather than exposure. A labelled tracer separates administered MK-7 from the dietary and gut-bacterial background and is what makes a real pharmacokinetic statement possible.',
          dependsOnStepId: 'k2-w1',
          reagentsAndBuffer:
            'Deuterated MK-7 internal standard; deuterated phylloquinone for the parallel K1 arm; formulation in a defined lipid matrix, since menaquinone absorption is strongly fat-dependent; isotopic purity confirmed by LC-MS/MS',
        },
        {
          id: 'k2-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separation of the carboxylated and uncarboxylated protein species',
          description:
            'The entire field runs on the ratio of inactive to active forms of two proteins, and those forms differ only by carboxyl groups on glutamate residues. Distinguishing dephosphorylated-uncarboxylated matrix Gla protein from its carboxylated counterpart, and uncarboxylated from carboxylated osteocalcin, requires conformation-specific immunoassays and careful sample handling — the numbers are not interchangeable between assay platforms.',
          dependsOnStepId: 'k2-w2',
          reagentsAndBuffer:
            'Conformation-specific sandwich immunoassays for dp-ucMGP and for total and carboxylated MGP; hydroxyapatite-binding separation for carboxylated versus uncarboxylated osteocalcin; EDTA plasma with protease inhibitors; single assay platform and lot maintained across all timepoints in a study',
        },
        {
          id: 'k2-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Carboxylation of matrix Gla protein in vascular smooth muscle',
          description:
            'Test the mechanism where it is claimed to act. Vascular smooth muscle cells calcify under high phosphate, and matrix Gla protein is the local inhibitor. Establish whether MK-7 at achievable tissue concentrations increases local MGP carboxylation and reduces mineralisation — and whether it can reverse existing mineral rather than only slow new deposition, which is the question the human imaging trials implicitly asked.',
          dependsOnStepId: 'k2-w3',
          reagentsAndBuffer:
            'Primary human aortic smooth muscle cells in calcifying medium at elevated inorganic phosphate; MK-7 across a concentration range spanning achievable plasma levels; warfarin as the gamma-glutamyl carboxylase inhibitor control; MGP knockdown as the specificity control; alizarin red and calcium content quantification; pre-established mineral deposits in a separate arm to test reversal',
        },
        {
          id: 'k2-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Imaging endpoint reported alongside the biomarker, never instead of it',
          description:
            'This is the whole lesson of the field as a method. Report CT calcium score change and dp-ucMGP change from the same participants. The aortic valve trial did exactly this and produced the definitive result: dp-ucMGP was a listed secondary outcome, the calcium score was the primary, and the primary showed a difference of 17 arbitrary units with P = 0.64.',
          dependsOnStepId: 'k2-w4',
          reagentsAndBuffer:
            'Cardiac non-contrast computed tomography with Agatston scoring by blinded readers; echocardiographic aortic valve area and peak jet velocity; 18F-sodium-fluoride PET target-to-background ratio for active mineralisation; dp-ucMGP at each visit to document compliance and biological engagement; prespecified primary endpoint registered before enrolment',
        },
      ],
    },
    keyAudits: [
      {
        id: 'k2-a1',
        category: 'failed',
        title: '365 men, two years, aortic valve calcium: a difference of 17 arbitrary units',
        laymanSummary:
          'The largest randomised trial of MK-7 gave it with vitamin D to 365 men with calcified aortic valves for two years and measured the calcium on CT scans. There was no difference.',
        technicalDetails:
          'A randomised, double-blind, multicentre trial randomised 365 community-dwelling men with an aortic valve calcification score above 300 arbitrary units on non-contrast cardiac CT to 720 micrograms of MK-7 plus 25 micrograms of vitamin D daily, or matching placebo, for 24 months. Mean age was 71.0 years. The primary outcome, change in aortic valve calcification score, increased by 275 AU (95% CI 225 to 326) in the intervention group and 292 AU (95% CI 246 to 338) in placebo, a mean difference of 17 AU (95% CI -86 to 53, P = 0.64). Change in aortic valve area was 0.02 cm2 (95% CI -0.09 to 0.12, P = 0.78) and in peak aortic jet velocity 0.04 m/s (95% CI -0.11 to 0.02, P = 0.21). Progression of aortic and coronary artery calcification did not differ significantly between groups. This is the exact population, the exact mechanism and the exact endpoint the product is sold on, at a dose four times that of the bone trials, and the confidence interval on the primary result excludes any clinically meaningful effect.',
        evidenceSource: 'Diederichsen ACP et al. Circulation 2022;145:1387-1397',
        doi: '10.1161/CIRCULATIONAHA.121.057008',
        measuredMetric:
          'Change in aortic valve calcification score on non-contrast cardiac CT over 24 months',
        auditFlag: 'verified',
      },
      {
        id: 'k2-a2',
        category: 'measured',
        title: 'The biomarker moves dramatically — inactive matrix Gla protein falls by half',
        laymanSummary:
          'MK-7 reliably activates the protein that stops calcium depositing in artery walls, cutting the circulating inactive form by about fifty percent.',
        technicalDetails:
          'In the three-year arterial stiffness trial, MK-7 at 180 micrograms daily decreased circulating dephosphorylated-uncarboxylated matrix Gla protein by 50% compared with placebo. At baseline, dp-ucMGP was associated with carotid intima-media thickness, arterial diameter, carotid-femoral pulse wave velocity and with composite scores for acute phase markers and endothelial dysfunction. This is a genuine, large, reproducible biochemical effect: the supplement unambiguously does what it says at the level of protein carboxylation, and compliance can be verified from it. The vascular calcification trial in type 2 diabetes used dp-ucMGP measurement for exactly that purpose. The audit point is not that this biomarker is fake. It is that it moves by 50% while the imaging endpoints move by nothing, which is as clean a dissociation between a surrogate and an outcome as this file contains.',
        evidenceSource: 'Knapen MHJ et al. Thromb Haemost 2015;113:1135-1144',
        doi: '10.1160/TH14-08-0675',
        measuredMetric:
          'Percentage change in circulating dephosphorylated-uncarboxylated matrix Gla protein versus placebo',
        auditFlag: 'verified',
      },
      {
        id: 'k2-a3',
        category: 'measured',
        title: 'Three years of MK-7 reduced age-related bone loss in postmenopausal women',
        laymanSummary:
          'In 244 healthy postmenopausal women, three years of MK-7 slowed the normal age-related decline in bone density and strength at the spine and hip.',
        technicalDetails:
          'Knapen and colleagues randomised 244 healthy postmenopausal women to placebo or 180 micrograms of MK-7 daily for three years, measuring bone mineral density of lumbar spine, total hip and femoral neck by DXA, calculating femoral neck bone strength indices, assessing vertebral fractures by DXA, and tracking vitamin K status through the uncarboxylated to carboxylated osteocalcin ratio at baseline and years 1, 2 and 3. MK-7 significantly improved vitamin K status and decreased the age-related decline in bone mineral content and bone mineral density at the lumbar spine and femoral neck, but not at total hip. The authors note that EFSA had accepted a health claim for vitamin K in maintenance of normal bone. Three years is a genuinely long trial and the endpoint is objective. Two qualifications: the outcome is bone density rather than fracture, and this trial and the arterial stiffness trial come from the same group using the same branded ingredient in the same cohort, so they are not independent replications of each other.',
        evidenceSource: 'Knapen MHJ et al. Osteoporos Int 2013;24:2499-2507',
        doi: '10.1007/s00198-013-2325-6',
        measuredMetric:
          'Bone mineral density and content at lumbar spine, total hip and femoral neck over three years by DXA',
        auditFlag: 'verified',
      },
      {
        id: 'k2-a4',
        category: 'failed',
        title: 'In type 2 diabetes, PET calcification tended the wrong way',
        laymanSummary:
          'A randomised trial used a sensitive scan to look for active calcification in people with diabetes and heart disease. After six months of MK-7 the signal had, if anything, increased.',
        technicalDetails:
          'Zwakenberg and colleagues randomised 68 men and women with type 2 diabetes and known cardiovascular disease to 360 micrograms per day of MK-7 or placebo for six months, with 33 and 27 completing follow-up respectively. Femoral arterial calcification was measured by 18F-sodium-fluoride PET as target-to-background ratio, a technique sensitive to active mineralisation rather than established mineral, with CT calcification mass as a secondary outcome, and dp-ucMGP measured to confirm compliance. After six months, target-to-background ratio tended to increase in the MK-7 group compared with placebo (0.25, 95% CI -0.02 to 0.51, P = 0.06), and log-transformed CT calcification mass did not decrease. A non-significant trend in the wrong direction in a small trial is not evidence of harm and should not be read as one. It is, however, the second independent randomised imaging study to find no benefit, and the compliance biomarker confirms the supplement was being taken and was working biochemically.',
        evidenceSource: 'Zwakenberg SR et al. Am J Clin Nutr 2019;110:883-890',
        doi: '10.1093/ajcn/nqz147',
        measuredMetric:
          'Femoral arterial 18F-sodium-fluoride PET target-to-background ratio and CT calcification mass at six months',
        auditFlag: 'verified',
      },
      {
        id: 'k2-a5',
        category: 'conclusion_shift',
        title: 'The Rotterdam observation that started it, and what randomisation did to it',
        laymanSummary:
          'A large population study found people eating more vitamin K2 had less coronary heart disease. Every randomised trial that has since tested it against imaging has found nothing.',
        technicalDetails:
          'Geleijnse and colleagues reported in the Rotterdam Study that dietary menaquinone intake was associated with reduced risk of coronary heart disease, and that observation is the origin of the entire K2 supplement category and of the "directs calcium away from arteries" framing. The subsequent randomised record runs the other way. In 365 men with aortic valve calcification over 24 months, the difference in calcium score progression was 17 AU (P = 0.64). In 68 people with type 2 diabetes and cardiovascular disease over six months, PET target-to-background ratio tended to increase on MK-7 (P = 0.06). This is the standard shape of a nutritional epidemiology finding: dietary menaquinone intake in a free-living population tracks fermented and animal food consumption, socioeconomic position and dozens of other correlates, and the compound itself carries only some of the association. The mechanism connecting matrix Gla protein to arterial calcification is real and was never the weak link; the inference that supplementing a replete population would move calcification was.',
        evidenceSource:
          'Geleijnse JM et al. J Nutr 2004;134:3100-3105; Diederichsen ACP et al. Circulation 2022;145:1387-1397',
        doi: '10.1093/jn/134.11.3100',
        inferredClaim:
          'That an observational association between dietary menaquinone intake and coronary heart disease establishes a benefit of MK-7 supplementation on arterial calcification',
        auditFlag: 'verified',
      },
      {
        id: 'k2-a6',
        category: 'inferred',
        title: 'MK-4 and MK-7 are different drugs, and so are their trial literatures',
        laymanSummary:
          'Vitamin K2 comes in forms with different tail lengths. They have half-lives differing more than tenfold and separate bodies of evidence, and labels often just say "K2".',
        technicalDetails:
          'MK-4 carries four isoprene units and is cleared within hours; MK-7 carries seven and has a plasma half-life measured in days, which is why 180 micrograms daily of MK-7 achieves what milligram doses of MK-4 were used for. The Japanese bone literature that supplies much of vitamin K2\'s reputation used MK-4 at 45 mg per day — a dose 250 times the MK-7 trials, in a different population, with a different molecule. The Knapen group explicitly framed their MK-7 work as an extension of earlier high-dose K1 and MK-4 studies "because of the longer half-life and greater potency of the long-chain MK-7," which is an honest statement that these are separate agents. A product labelled only "vitamin K2" may contain either, and neither form\'s evidence transfers to the other. Synthetic MK-7 can also contain the biologically inactive cis isomer, which fermentation-derived material does not.',
        evidenceSource: 'Knapen MHJ et al. Osteoporos Int 2013;24:2499-2507',
        doi: '10.1007/s00198-013-2325-6',
        inferredClaim:
          'That "vitamin K2" is a single agent whose trial evidence applies regardless of chain length or dose',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Absorbed with fat, and MK-7 stays around for days',
        laymanDesc:
          'Vitamin K needs dietary fat to be absorbed. The long-tailed MK-7 form then lingers in the blood for days, where the short forms are gone in hours.',
        molecularDetail:
          'Menaquinones are absorbed into chylomicrons and require dietary lipid. MK-7\'s seven-isoprene tail gives it strong lipoprotein binding and a plasma half-life measured in days, against hours for MK-4 and phylloquinone. This is the genuine pharmacological argument for the form, and it means steady state takes weeks, so short trials measure accumulation rather than a stable exposure.',
        iconName: 'Clock',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It powers an enzyme that adds a calcium-binding hook to proteins',
        laymanDesc:
          'Reduced vitamin K lets one enzyme add an extra chemical group to certain proteins, turning a plain amino acid into one that grips calcium.',
        molecularDetail:
          'Gamma-glutamyl carboxylase uses reduced vitamin K as cofactor to convert glutamate to gamma-carboxyglutamate, and vitamin K epoxide reductase regenerates the reduced form. Warfarin inhibits that recycling step, which is why vitamin K antagonises warfarin and why the interaction is certain rather than theoretical.',
        iconName: 'Wrench',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Two proteins matter outside the liver: one for bone, one for arteries',
        laymanDesc:
          'Osteocalcin locks calcium into bone. Matrix Gla protein sits in artery walls and stops calcium crystallising there. Both need the vitamin K modification to work.',
        molecularDetail:
          'Osteocalcin is secreted by osteoblasts and its carboxylated form binds hydroxyapatite. Matrix Gla protein is expressed by vascular smooth muscle cells and is a potent local calcification inhibitor — MGP-null mice die within weeks of massive arterial calcification, which is the strongest evidence that this pathway matters and is the mechanistic backbone of every K2 claim.',
        iconName: 'Bone',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'The inactive fraction falls by half, and that is easy to measure',
        laymanDesc:
          'Supplementing MK-7 activates these proteins, and the amount of the inactive form circulating in blood drops by around fifty percent. This is real and reproducible.',
        molecularDetail:
          'MK-7 at 180 micrograms daily decreased dephosphorylated-uncarboxylated matrix Gla protein by 50% against placebo over three years, and improved the uncarboxylated to carboxylated osteocalcin ratio. The biomarker response is large enough to serve as a compliance measure, which is exactly how the diabetes calcification trial used it.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'And the scans do not change',
        laymanDesc:
          'Despite fully activating the anti-calcification protein, imaging of actual arterial and valve calcium found no difference across three randomised trials.',
        molecularDetail:
          'Aortic valve calcification score difference 17 AU (95% CI -86 to 53, P = 0.64) over 24 months in 365 men; aortic valve area difference 0.02 cm2 (P = 0.78); femoral 18F-NaF PET target-to-background ratio tending upward on MK-7 (0.25, 95% CI -0.02 to 0.51, P = 0.06) in diabetes. The most likely explanation is that established mineral does not regress, and matrix Gla protein carboxylation prevents rather than reverses.',
        iconName: 'ScanLine',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Diederichsen 2022 — vitamin K2 and D in aortic valve calcification',
        phase: 'Randomised double-blind multicentre, 24 months',
        sampleSize: 365,
        primaryEndpoint: 'Change in aortic valve calcification score on non-contrast cardiac CT',
        endpointMet: false,
        statisticalPValue:
          'Mean difference 17 AU (95% CI -86 to 53), P = 0.64; aortic valve area difference 0.02 cm2, P = 0.78; peak jet velocity 0.04 m/s, P = 0.21',
        unreportedAdverseSignals:
          'The dose was 720 micrograms of MK-7, four times that used in the positive bone and stiffness trials, given with vitamin D, in exactly the population the product targets. Aortic and coronary artery calcification progression also did not differ.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Knapen 2013 — three-year MK-7 and bone health in postmenopausal women',
        phase: 'Randomised placebo-controlled, 3 years',
        sampleSize: 244,
        primaryEndpoint:
          'Bone mineral density and content at lumbar spine, total hip and femoral neck by DXA',
        endpointMet: true,
        statisticalPValue:
          'Significantly decreased age-related decline in bone mineral content and density at lumbar spine and femoral neck; not at total hip',
        unreportedAdverseSignals:
          'The endpoint is bone density rather than fracture, and the trial was not powered for fractures. It used a branded MK-7 ingredient and shares its cohort and investigators with the arterial stiffness trial, so the two are not independent.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Knapen 2015 — three-year MK-7 and arterial stiffness in postmenopausal women',
        phase: 'Randomised double-blind placebo-controlled, 3 years',
        sampleSize: 244,
        primaryEndpoint: 'Carotid-femoral pulse wave velocity and local carotid stiffness indices',
        endpointMet: true,
        statisticalPValue:
          'Carotid-femoral pulse wave velocity and Stiffness Index beta significantly decreased in the total group; dp-ucMGP decreased 50% versus placebo',
        unreportedAdverseSignals:
          'The larger improvements in distension, compliance, distensibility and local carotid pulse wave velocity were confined to women with a baseline Stiffness Index above the median, which is a subgroup finding. Acute phase and endothelial dysfunction markers were unaffected.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Zwakenberg 2019 — MK-7 and vascular calcification in type 2 diabetes',
        phase: 'Randomised double-blind placebo-controlled, 6 months',
        sampleSize: 68,
        primaryEndpoint:
          'Femoral arterial calcification by 18F-sodium-fluoride PET target-to-background ratio',
        endpointMet: false,
        statisticalPValue:
          'Target-to-background ratio tended to increase on MK-7 versus placebo, 0.25 (95% CI -0.02 to 0.51), P = 0.06; CT calcification mass did not decrease',
        unreportedAdverseSignals:
          'Only 33 of 35 in the MK-7 group and 27 of 33 on placebo completed follow-up. The trend is in the opposite direction to the hypothesis and does not reach significance, so it is uninformative about harm and informative about absence of benefit.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Geleijnse 2004 — dietary menaquinone intake and coronary heart disease (Rotterdam Study)',
        phase: 'Prospective population cohort',
        sampleSize: 0,
        primaryEndpoint: 'Incident coronary heart disease by dietary menaquinone intake',
        endpointMet: true,
        statisticalPValue:
          'Higher dietary menaquinone intake associated with reduced risk of coronary heart disease',
        unreportedAdverseSignals:
          'Observational. Dietary menaquinone intake in a free-living population tracks fermented and animal food consumption and many correlated factors. Sample size recorded as zero because this was a cohort analysis rather than an enrolled trial. This is the observation the whole supplement category was built on.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'MK-7 decreased circulating dephosphorylated-uncarboxylated matrix Gla protein by 50% against placebo',
        'Three years of 180 micrograms daily reduced age-related bone mineral density decline at lumbar spine and femoral neck',
        'In 365 men over 24 months, aortic valve calcification progression differed by 17 AU, P = 0.64',
        'In type 2 diabetes, 18F-NaF PET calcification tended to increase on MK-7, P = 0.06',
      ],
      unsupportedInferences: [
        'That correcting matrix Gla protein carboxylation reduces arterial or valvular calcification, which three imaging trials tested and none supported',
        'That the Rotterdam dietary association transfers to supplementation in a replete population',
        'That bone mineral density results imply fracture reduction, which no MK-7 trial has been powered to test',
        'That "vitamin K2" names a single agent, when MK-4 and MK-7 differ more than tenfold in half-life and have separate literatures',
      ],
      whatFailedInitially: [
        'The vascular calcification hypothesis, in three randomised imaging trials across aortic valve, coronary and femoral disease',
        'The transfer of high-dose MK-4 Japanese bone data to low-dose MK-7 products sold as the same thing',
      ],
      realWorldOutcome: [
        'The biochemistry is genuine, large and reproducible — this supplement demonstrably does what it says at the protein level',
        'Everything downstream of the biomarker has failed when measured by imaging',
        'The one certain clinical effect is the warfarin interaction, which is real, persistent and not what anyone buys it for',
      ],
    },
    deliverySystem: {
      type: 'Oral capsule or softgel, usually as fermentation-derived all-trans MK-7 in an oil base, frequently combined with vitamin D3',
      description:
        'Sold in the United States as a dietary supplement under DSHEA, so no agency reviewed efficacy, safety or content before sale. A label reading "vitamin K2" may contain MK-4, MK-7 or a blend, and these differ by more than an order of magnitude in half-life with entirely separate trial literatures. Synthetic MK-7 can contain the biologically inactive cis isomer, which fermentation-derived material does not, and neither the isomer content nor the chain length is typically disclosed. Absorption is strongly fat-dependent, and MK-7\'s multi-day half-life means several weeks are needed to reach steady state.',
      safetyProfile:
        'Generally well tolerated with no established toxicity at supplemental doses, and no signal of harm in trials running to three years at 180 micrograms or two years at 720 micrograms. The one certain and clinically important effect is the warfarin interaction: vitamin K in any form directly opposes warfarin\'s mechanism, and MK-7\'s long half-life makes the interference more persistent and slower to clear than with vitamin K1. Anyone on warfarin who starts or stops a K2 supplement should expect their INR to move. There is no comparable interaction with direct oral anticoagulants, which do not act on vitamin K recycling.',
    },
    commonQuestions: [
      {
        q: 'Does K2 keep calcium out of my arteries?',
        a: 'On the imaging evidence, no. The largest test randomised 365 men with calcified aortic valves to 720 micrograms of MK-7 with vitamin D or placebo for two years and measured the calcium directly on CT. Scores rose by 275 arbitrary units on treatment and 292 on placebo — a difference of 17, with a P value of 0.64. Valve area and jet velocity did not differ either, and neither did coronary or aortic calcification. Two other randomised imaging trials, in type 2 diabetes and coronary disease, also found nothing.',
      },
      {
        q: 'But I have read that it activates the protein that blocks calcification.',
        a: 'It does, and that part is not in dispute. Supplementing MK-7 cuts circulating inactive matrix Gla protein by about half, reliably enough that trials use it to check whether participants are taking their capsules. This is one of the clearest cases in this whole file of a biomarker that moves impressively while the outcome it is supposed to predict does not move at all. The most plausible explanation is that carboxylated matrix Gla protein prevents new mineral deposition rather than removing established calcium.',
        auditNote:
          'A 50% biomarker change alongside a 17 arbitrary unit imaging difference is the definition of a surrogate failing.',
      },
      {
        q: 'What about the bone evidence?',
        a: 'That is the stronger half of this record. In 244 healthy postmenopausal women, three years of 180 micrograms of MK-7 daily reduced the age-related decline in bone mineral density and content at the lumbar spine and femoral neck, though not at the total hip. Three years is a long trial and DXA is an objective endpoint. Two things to hold alongside it: the endpoint is density rather than fracture, and this trial shares its cohort, investigators and branded ingredient with the arterial stiffness trial, so they do not independently confirm each other.',
      },
      {
        q: 'Is MK-4 the same thing as MK-7?',
        a: 'No, and treating them as interchangeable is the commonest error in this category. MK-4 is cleared within hours and MK-7 persists for days, which is why MK-7 works at 180 micrograms while the Japanese bone trials used MK-4 at 45 milligrams — a 250-fold difference. A product labelled only "vitamin K2" may contain either. Neither form\'s evidence transfers to the other, and the chain length is often not stated.',
      },
      {
        q: 'Is it safe to take with my blood thinner?',
        a: 'Not without medical supervision, and this is the one certain clinical effect on this page. Warfarin works by blocking the recycling of vitamin K, so any vitamin K supplement directly opposes it — and MK-7\'s long half-life makes the interference more persistent and slower to clear than vitamin K1\'s. Starting or stopping a K2 supplement can shift the INR substantially. Direct oral anticoagulants such as apixaban and rivaroxaban do not work through vitamin K and are not affected in the same way.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Geleijnse JM et al. Dietary intake of menaquinone is associated with a reduced risk of coronary heart disease: the Rotterdam Study. J Nutr 2004;134:3100-3105',
        identifier: '10.1093/jn/134.11.3100',
        kind: 'doi',
      },
      {
        label:
          'Knapen MHJ, Drummen NE, Smit E, Vermeer C, Theuwissen E. Three-year low-dose menaquinone-7 supplementation helps decrease bone loss in healthy postmenopausal women. Osteoporos Int 2013;24:2499-2507',
        identifier: '10.1007/s00198-013-2325-6',
        kind: 'doi',
      },
      {
        label:
          'Knapen MHJ et al. Menaquinone-7 supplementation improves arterial stiffness in healthy postmenopausal women: a double-blind randomised clinical trial. Thromb Haemost 2015;113:1135-1144',
        identifier: '10.1160/TH14-08-0675',
        kind: 'doi',
      },
      {
        label:
          'Zwakenberg SR et al. The effect of menaquinone-7 supplementation on vascular calcification in patients with diabetes: a randomized, double-blind, placebo-controlled trial. Am J Clin Nutr 2019;110:883-890',
        identifier: '10.1093/ajcn/nqz147',
        kind: 'doi',
      },
      {
        label:
          'Diederichsen ACP et al. Vitamin K2 and D in patients with aortic valve calcification: a randomized double-blinded clinical trial. Circulation 2022;145:1387-1397',
        identifier: '10.1161/CIRCULATIONAHA.121.057008',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 5287554 — Menaquinone-7',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/5287554',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // Iodine — the deficiency is the leading preventable cause of intellectual disability worldwide
  // and salt iodisation is one of medicine's great successes. The supplement audit is the other
  // end of the curve: a five-year Chinese cohort where more than adequate intake raised thyroid disease.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'iodine',
    name: 'Iodine',
    tradeName:
      'Sold as potassium iodide, sodium iodide or kelp extract; potassium iodide is also an FDA-approved over-the-counter drug (iOSAT, NDA 018664)',
    sponsor:
      'No single sponsor — an essential trace element. Global iodine nutrition programmes are coordinated through the Iodine Global Network, formerly the International Council for the Control of Iodine Deficiency Disorders.',
    targetGene: 'TPO',
    targetProtein:
      'Thyroid peroxidase (TPO), which oxidises iodide and attaches it to tyrosine residues on thyroglobulin to build thyroxine. Iodine enters the thyrocyte through the sodium-iodide symporter NIS (SLC5A5), the same transporter that makes radioiodine therapy and potassium iodide blockade possible. Iodine has no other role in the body: it is a structural atom in two hormones and nothing else.',
    modality: 'Nutraceutical / Botanical',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication:
      'Sold for thyroid support, energy and metabolism, often as kelp. Correcting genuine iodine deficiency is one of the highest-value interventions in public health. Potassium iodide is separately an FDA-approved over-the-counter drug for thyroid blockade in a radiological emergency, at doses hundreds of times the nutritional requirement.',
    patientFriendlyIndication:
      'Taken for thyroid support and metabolism, often as a kelp supplement',
    conditionContext: {
      conditionExplainer:
        'Thyroid hormone is a tyrosine molecule with iodine atoms bolted onto it — four for thyroxine, three for the active form. Without iodine the hormone cannot be built, the thyroid enlarges trying, and in a developing brain the consequence is permanent. Too much iodine causes a different set of thyroid diseases, and the gap between the two is unusually narrow.',
      whyItMatters:
        'Iodine deficiency is the most common preventable cause of intellectual disability worldwide, and salt iodisation is one of the outstanding public health achievements of the twentieth century. That success is also why the supplement question is so awkward: in an iodine-replete country the marginal buyer is not deficient, and the best evidence on what happens when intake goes above adequate comes from a five-year cohort in China where thyroid disease rose.',
      whoTakesThis:
        'People buying kelp or thyroid-support supplements, pregnant and lactating women following the American Thyroid Association recommendation of 150 micrograms daily, people avoiding iodised salt through kosher or sea salt and processed food, and populations in areas without salt iodisation.',
      clinicalGoals:
        'Studies measured urinary iodine concentration, thyroid volume by ultrasound, thyroid-stimulating hormone and total thyroxine, thyroid autoantibodies, cognitive and motor test performance, and the cumulative incidence of overt and subclinical hypothyroidism and autoimmune thyroiditis.',
    },
    oneSentenceVerdict:
      'Correcting real iodine deficiency transforms outcomes — in Albanian schoolchildren with a median urinary iodine of 43 micrograms per litre and 87% goitrous, supplementation raised median urinary iodine to 172 and improved cognition — while in China, five-year cumulative subclinical hypothyroidism rose from 0.2% in mildly deficient regions to 2.6% where intake was more than adequate and 2.9% where it was excessive.',
    laymanHowItWorks:
      'Thyroid hormone is essentially a small molecule with iodine atoms attached, and there is no substitute atom. A special pump concentrates iodide from your blood into the thyroid gland, where an enzyme attaches it to a scaffold protein and assembles the hormone. If iodine runs short the gland grows in an attempt to trap more of it, which is a goitre — and in a fetus or infant, the shortage of thyroid hormone during brain development causes damage that cannot be undone later. Taking more iodine than the gland needs does not make more hormone. It disturbs the gland\'s own regulation, and the trials show that showing up as thyroid disease rather than as extra energy.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 57,
    anatomicalSite:
      'Thyroid follicular cell, where the sodium-iodide symporter concentrates iodide at the basolateral membrane and thyroid peroxidase organifies it at the apical surface',
    substitutes: {
      summary:
        'For deficiency there is no substitute and iodised salt is the intervention with the best global track record ever assembled for a micronutrient. For a person in an iodine-replete country, the honest comparator is iodised salt and dairy, and for pregnancy the American Thyroid Association specifically recommends potassium iodide rather than kelp because kelp content is unreliable.',
      conventionalRx: [
        {
          name: 'Potassium iodide for thyroid blockade in a radiological emergency',
          class: 'FDA-approved over-the-counter drug (iOSAT, NDA 018664; ThyroSafe, ANDA 076350)',
          howItCompares:
            'A 65 or 130 mg tablet — roughly a thousand times the daily nutritional requirement — saturates the sodium-iodide symporter so that radioactive iodine cannot be taken up by the thyroid. It is a genuine approved drug with a genuine indication, and it demonstrates that iodine at pharmacological dose does something entirely different from iodine at nutritional dose.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: effective, cheap and life-protecting in its narrow indication. Cons: it is regularly cited as evidence that high-dose iodine is safe, when its mechanism is precisely to shut the thyroid\'s iodine handling down.',
        },
        {
          name: 'Levothyroxine for hypothyroidism',
          class: 'Thyroid hormone replacement',
          howItCompares:
            'If the thyroid is failing for any reason other than iodine deficiency — and in iodine-replete countries the commonest cause is autoimmune thyroiditis — supplying more iodine does not help and, on the Chinese cohort data, may make autoimmune thyroiditis more likely.',
          typicalCost:
            'Not priced here — no published cost-of-production figure is cited on this page',
          prosAndCons:
            'Pros: replaces the hormone directly, with a measurable endpoint. Cons: a "thyroid support" supplement bought by someone with early autoimmune thyroiditis addresses neither the cause nor the hormone.',
        },
      ],
      naturalFoods: [
        {
          name: 'Iodised salt',
          activeCompound: 'Potassium iodate or potassium iodide added to table salt',
          biologicalMechanism:
            'Universal salt iodisation delivers a micronutrient through a vehicle everyone consumes in predictable quantity, without requiring a decision. It is the reason iodine deficiency disorders have receded across much of the world, and the reason the residual risk in wealthy countries comes from kosher salt, sea salt and processed food, none of which is iodised.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: the American Thyroid Association recommends 150 micrograms daily in preconception, pregnancy and lactation, and the emergency blockade tablet is 65 or 130 mg.',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
        {
          name: 'Dairy, eggs and marine fish',
          activeCompound: 'Iodide, largely from iodophor sanitisers in dairy and from seawater in fish',
          biologicalMechanism:
            'Milk is a major iodine source in several countries substantially because of iodine-containing sanitisers used in milking, which makes national dietary iodine supply partly an artefact of agricultural practice and vulnerable to changes in it.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Not stated here — this page gives no intake guidance',
          monthlyCost: 'Not priced here — no published cost figure to cite',
        },
      ],
      homeRemedies: [
        {
          name: 'Avoid kelp as an iodine source, on expert recommendation',
          action:
            'Kelp and seaweed iodine content varies by orders of magnitude with species, harvest site and season, and cannot be predicted from a label.',
          patientImpact:
            'The American Thyroid Association updated its recommendation in 2011 to specify supplementation with 150 micrograms of iodine daily as potassium iodide, explicitly "given the variability of iodine content in kelp and seaweed."',
          clinicalPrecaution:
            'A single kelp tablet can deliver many times the daily requirement, and the Chinese cohort data are about exactly this end of the intake curve.',
        },
        {
          name: 'Check the prenatal vitamin, because half do not contain it',
          action:
            'Iodine is not a required component of a prenatal multivitamin in the United States, and many contain none.',
          patientImpact:
            'Of the 223 prenatal multivitamin formulations available in the United States, only 51% list iodine, in varying amounts, and measured levels can be discordant from labelled values.',
          clinicalPrecaution:
            'This is the one place in this entire file where a supplement is genuinely under-supplied rather than over-supplied, and the population affected is the one where deficiency does permanent harm.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: '[K+].[I-]',
      chemicalFormula: 'IK',
      molecularWeight:
        '166.00 g/mol for potassium iodide, of which 126.90 g/mol — about 76 percent — is iodine. Potassium iodide is the marker the literature tracks: it is the form used in salt iodisation, in the emergency blockade tablet, and in the supplementation the American Thyroid Association recommends in preference to kelp.',
      structureSource: {
        label: 'PubChem CID 4875 — Potassium iodide, canonical SMILES and computed properties',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4875',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'iod-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Iodine content and speciation, especially in seaweed-derived products',
          description:
            'This is the step where kelp supplements fail. Iodine content in seaweed varies by orders of magnitude with species, harvest location and season, so a label figure derived from a generic table is not a measurement. Seaweed also concentrates arsenic, and hijiki in particular carries inorganic arsenic at concentrations that have prompted national advisories.',
          reagentsAndBuffer:
            'Alkaline ashing followed by ICP-MS for total iodine, with tellurium as internal standard; ion chromatography with ICP-MS detection to separate iodide from iodate and organically bound iodine; species-specific arsenic speciation to separate inorganic arsenic from arsenosugars; multiple lots of each product assayed to capture batch variation',
        },
        {
          id: 'iod-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Preparation of the stable-isotope iodine tracer',
          description:
            'Iodine kinetics cannot be resolved against the large intrathyroidal store without a tracer, and radioiodine is unacceptable in healthy volunteers and in pregnancy — the populations that matter most here. A stable isotope makes absorption, thyroid uptake and turnover measurable without exposure.',
          dependsOnStepId: 'iod-w1',
          reagentsAndBuffer:
            '129I-free enriched stable iodine as potassium iodide; isotope ratio determination by ICP-MS; sterile preparation for the intravenous reference arm; documented absence of radioiodine contamination',
        },
        {
          id: 'iod-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Urine collection and thyroglobulin as the status pair',
          description:
            'Urinary iodine reflects intake over the past day and is far too variable in an individual to classify one person, though it characterises a population well. Serum thyroglobulin is the complementary marker that reflects thyroid status over months. Reporting a single spot urinary iodine as an individual diagnosis is the commonest error in this field.',
          dependsOnStepId: 'iod-w2',
          reagentsAndBuffer:
            'Repeated spot urine collections with creatinine normalisation, or timed collections; Sandell-Kolthoff ammonium persulphate digestion with spectrophotometric detection, or ICP-MS; serum thyroglobulin with a dried blood spot assay for field use; thyroid-stimulating hormone and free thyroxine on the same draw',
        },
        {
          id: 'iod-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Sodium-iodide symporter uptake and the Wolff-Chaikoff escape',
          description:
            'Test both ends of the dose curve in the same system. At nutritional concentrations, iodide uptake through NIS supplies hormone synthesis. At high concentrations, iodide acutely inhibits its own organification — the Wolff-Chaikoff effect — and the thyroid normally escapes this by downregulating NIS within days. Failure to escape produces iodine-induced hypothyroidism, which is the mechanism behind the Chinese cohort finding.',
          dependsOnStepId: 'iod-w3',
          reagentsAndBuffer:
            'Rat FRTL-5 or human primary thyrocyte cultures; iodide across a concentration range spanning nutritional to blockade doses; perchlorate as the NIS inhibitor control; NIS and TPO mRNA and protein quantified over 72 hours to capture escape; organification measured as protein-bound iodine; thyroid-stimulating hormone stimulation arm',
        },
        {
          id: 'iod-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Thyroid disease incidence stratified by baseline intake, not just mean effect',
          description:
            'Report incidence of overt and subclinical hypothyroidism and of autoimmune thyroiditis stratified by regional or individual baseline iodine intake, because iodine\'s dose-response is U-shaped and a mean effect across an entire population conceals both arms of it. The Chinese five-year cohort is the model: three regions, three intake levels, and the disease incidence read off against each.',
          dependsOnStepId: 'iod-w4',
          reagentsAndBuffer:
            'Serial thyroid-stimulating hormone, free thyroxine and thyroid peroxidase and thyroglobulin antibody measurement; B-mode thyroid ultrasonography at baseline and follow-up; median urinary iodine excretion characterising each cohort; prespecified stratification by baseline antibody status',
        },
      ],
    },
    keyAudits: [
      {
        id: 'iod-a1',
        category: 'measured',
        title: 'More than adequate iodine raised thyroid disease over five years',
        laymanSummary:
          'A Chinese study followed three regions with low, adequate and excessive iodine intake for five years. Subclinical hypothyroidism and autoimmune thyroiditis rose more than tenfold where intake was above adequate.',
        technicalDetails:
          'Teng and colleagues followed 3,018 of 3,761 baseline participants (80.2%) from 1999 through 2004 across three Chinese regions with different iodine intakes: mildly deficient (median urinary iodine 84 micrograms per litre), more than adequate (median 243) and excessive (median 651), measuring thyroid hormones and autoantibodies in serum, urinary iodine and B-mode thyroid ultrasonography at baseline and follow-up. Cumulative incidence of overt hypothyroidism was 0.2%, 0.5% and 0.3% across the three regions. Cumulative incidence of subclinical hypothyroidism was 0.2%, 2.6% and 2.9%. Cumulative incidence of autoimmune thyroiditis was 0.2%, 1.0% and 1.3%. Among subjects euthyroid with antithyroid antibodies at baseline, the five-year incidence of elevated thyrotropin was greater with more than adequate or excessive iodine intake. The critical detail for a supplement buyer is the middle column: the harm is not confined to "excessive" intake but appears already at intake described as more than adequate, which is precisely where a person in an iodine-replete country adding a kelp tablet would land.',
        evidenceSource: 'Teng W et al. N Engl J Med 2006;354:2783-2793',
        doi: '10.1056/NEJMoa054022',
        measuredMetric:
          'Five-year cumulative incidence of overt hypothyroidism, subclinical hypothyroidism and autoimmune thyroiditis by regional iodine intake',
        auditFlag: 'verified',
      },
      {
        id: 'iod-a2',
        category: 'measured',
        title: 'In genuinely deficient children, supplementation improved cognition',
        laymanSummary:
          'Albanian schoolchildren with severe iodine deficiency — 87 percent had goitres — were randomised to iodised oil or placebo. Their iodine and thyroid status normalised and their cognitive test scores improved.',
        technicalDetails:
          'Zimmermann and colleagues randomised 310 children aged 10 to 12 in rural southeastern Albania to 400 mg of iodine as oral iodised oil or placebo, in a double-blind trial, with urinary iodine, thyrotropin, total thyroxine and thyroid volume by ultrasound measured at baseline and 24 weeks alongside a battery of seven cognitive and motor tests covering information processing, working memory, visual problem solving, visual search and fine motor skills. At baseline the median urinary iodine concentration was 43 micrograms per litre, 87% were goitrous, and nearly a third had low circulating total thyroxine. At 24 weeks median urinary iodine in the treated group was 172 micrograms per litre and thyroid status had markedly improved. The authors noted that earlier randomised trials of iodine and cognition in schoolchildren had produced equivocal results — the difference here being a population with unambiguous, severe deficiency. That is the whole point: iodine supplementation works where iodine is missing, and this trial is the cleanest available demonstration of it.',
        evidenceSource: 'Zimmermann MB et al. Am J Clin Nutr 2006;83:108-114',
        doi: '10.1093/ajcn/83.1.108',
        measuredMetric:
          'Urinary iodine concentration, thyroid volume, thyroid hormone status and performance across seven cognitive and motor tests at 24 weeks',
        auditFlag: 'verified',
      },
      {
        id: 'iod-a3',
        category: 'measured',
        title: 'Iodine deficiency is the leading preventable cause of intellectual disability',
        laymanSummary:
          'Globally, more than two billion people are at risk of iodine deficiency, and it remains the most common preventable cause of intellectual disability.',
        technicalDetails:
          'Zimmermann, Jooste and Pandav\'s Lancet seminar sets out the scale: iodine deficiency disorders affect populations across the world, the most vulnerable being pregnant and lactating women and young children, and iodine deficiency remains the most common preventable cause of intellectual impairment worldwide. The mechanism is developmental and irreversible — maternal thyroid hormone is required for fetal brain development at stages that cannot be revisited, so the damage from deficiency during pregnancy cannot be corrected by later supplementation. Universal salt iodisation, coordinated internationally since the International Council for the Control of Iodine Deficiency Disorders was established in 1985 and the 1990 World Summit for Children, is the intervention that has driven this down. This audit is recorded as measured because it is the fact that gives iodine its status, and because everything else on this page has to be read against it: the deficiency effect here is enormous, and it is not an argument for supplementing a replete adult.',
        evidenceSource: 'Zimmermann MB, Jooste PL, Pandav CS. Lancet 2008;372:1251-1262',
        doi: '10.1016/S0140-6736(08)61005-3',
        measuredMetric:
          'Global population at risk of iodine deficiency and its ranking among preventable causes of intellectual impairment',
        auditFlag: 'verified',
      },
      {
        id: 'iod-a4',
        category: 'failed',
        title: 'Half of US prenatal vitamins contain no iodine, and labels can be wrong',
        laymanSummary:
          'Of 223 prenatal multivitamin formulations sold in the United States, only about half list iodine at all, and the measured amount can differ from the label.',
        technicalDetails:
          'Leung, Pearce and Braverman record that of the 223 prenatal multivitamin formulations available in the United States, only 51% list iodine, containing varying amounts, and that measured levels can be discordant from labelled values. They also note NHANES data from 2001 to 2006 showing only 20.3% of US pregnant women routinely take an iodine-containing supplement. The American Thyroid Association recommended in 2006 that all pregnant and lactating women in North America take a supplement containing 150 micrograms of iodine daily, updating this in 2011 to include the preconception period and to specify potassium iodide "given the variability of iodine content in kelp and seaweed". This is the inverse of the pattern that runs through the rest of this file. Almost every other entry here concerns a supplement being oversold to people who do not need it; iodine in pregnancy is a supplement that is genuinely needed, genuinely evidenced, and absent from half the products aimed at exactly the population that needs it.',
        evidenceSource: 'Leung AM, Pearce EN, Braverman LE. Thyroid 2013;23:7-8',
        doi: '10.1089/thy.2012.0491',
        measuredMetric:
          'Proportion of US prenatal multivitamin formulations listing iodine, and proportion of US pregnant women taking an iodine-containing supplement',
        auditFlag: 'verified',
      },
      {
        id: 'iod-a5',
        category: 'inferred',
        title: 'The emergency tablet is a thousand times the requirement, and it works by shutting the gland down',
        laymanSummary:
          'Potassium iodide tablets for radiation emergencies are an approved drug at 65 or 130 milligrams. That dose works by blocking the thyroid, not by nourishing it.',
        technicalDetails:
          'Potassium iodide holds FDA approval as an over-the-counter drug for thyroid blockade — iOSAT under NDA 018664 at 65 and 130 mg, and ThyroSafe under ANDA 076350 at the same strengths. A 130 mg tablet contains roughly 100 mg of iodine, about a thousand times the 150 microgram daily figure recommended in pregnancy. The mechanism is saturation: flooding the sodium-iodide symporter with stable iodide prevents uptake of radioactive iodine, and acutely high intrathyroidal iodide also inhibits its own organification through the Wolff-Chaikoff effect. The inference worth auditing is a common one in supplement marketing: that an approved high-dose iodine product demonstrates the safety of high-dose iodine supplementation. It demonstrates the opposite. The tablet is approved because it reliably interrupts thyroid iodine handling for a day or two, which is exactly the physiology that becomes a problem when sustained.',
        evidenceSource:
          'Drugs@FDA — iOSAT (potassium iodide) NDA 018664 and ThyroSafe ANDA 076350, over-the-counter thyroid blockade',
        inferredClaim:
          'That the existence of an approved high-dose potassium iodide product supports the safety of sustained high-dose iodine supplementation',
        auditFlag: 'caution',
      },
      {
        id: 'iod-a6',
        category: 'conclusion_shift',
        title: 'The dose-response is U-shaped, and salt iodisation programmes had to be recalibrated',
        laymanSummary:
          'Iodine was long treated as a nutrient where more is safer. The Chinese data showed that raising a population above adequate intake creates a different set of thyroid diseases, and programmes were adjusted.',
        technicalDetails:
          'The classical framing of iodine was one-directional: deficiency causes goitre, cretinism and intellectual impairment, and salt iodisation fixes it. Teng and colleagues measured what happens on the other side of adequate. Across three regions, five-year cumulative subclinical hypothyroidism was 0.2% at mildly deficient intake, 2.6% at more than adequate and 2.9% at excessive; autoimmune thyroiditis was 0.2%, 1.0% and 1.3%. The risk was concentrated in people who already carried antithyroid antibodies while euthyroid at baseline — a large and entirely asymptomatic group that no supplement buyer knows they belong to. The practical consequence was that iodine programmes moved from maximising intake to targeting a range, and national salt iodine concentrations have been revised downward in several countries as a result. The general lesson is the one that recurs throughout this file, in its sharpest form: an essential nutrient with a genuine, severe deficiency disease is not thereby a substance where more is better.',
        evidenceSource: 'Teng W et al. N Engl J Med 2006;354:2783-2793',
        doi: '10.1056/NEJMoa054022',
        inferredClaim:
          'That because iodine deficiency causes severe disease, higher iodine intake is safer than lower',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A pump concentrates iodide into the thyroid',
        laymanDesc:
          'Iodide from food is absorbed into the blood, and a specific pump in the thyroid gland drags it inside against a steep concentration gradient.',
        molecularDetail:
          'The sodium-iodide symporter NIS (SLC5A5) at the basolateral membrane of the thyrocyte concentrates iodide by one to two orders of magnitude over plasma, driven by the sodium gradient. This transporter is what makes radioiodine imaging and therapy possible, and what a potassium iodide blockade tablet saturates.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 2,
        title: 'An enzyme bolts iodine onto a scaffold protein',
        laymanDesc:
          'At the far side of the cell, an enzyme oxidises the iodide and attaches it to specific spots on a large protein, then joins two of those spots together to make the hormone.',
        molecularDetail:
          'Thyroid peroxidase oxidises iodide and iodinates tyrosyl residues on thyroglobulin, then couples mono- and di-iodotyrosines to form thyroxine and triiodothyronine within the thyroglobulin backbone, which is stored in colloid until proteolysis releases the hormone. Thyroid peroxidase is also the principal autoantigen in autoimmune thyroiditis.',
        iconName: 'Wrench',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Too little, and the gland grows trying to catch more',
        laymanDesc:
          'When iodine is short, hormone output falls, the pituitary pushes harder, and the thyroid enlarges. In a developing brain the hormone shortage causes permanent damage.',
        molecularDetail:
          'Falling thyroid hormone raises thyrotropin, which drives thyrocyte hyperplasia and goitre. In Zimmermann\'s Albanian cohort, baseline median urinary iodine was 43 micrograms per litre with 87% goitrous and nearly a third having low total thyroxine, and 24 weeks of iodised oil raised median urinary iodine to 172 with marked improvement in thyroid status and in cognitive performance.',
        iconName: 'TrendingDown',
        visualStage: 'delivery',
      },
      {
        step: 4,
        title: 'Too much, and the gland shuts its own iodine handling down',
        laymanDesc:
          'A large iodine load acutely blocks hormone production. Normally the gland adapts within days, but in some people it does not, and hypothyroidism follows.',
        molecularDetail:
          'Acutely high intrathyroidal iodide inhibits its own organification — the Wolff-Chaikoff effect — and normal escape occurs through downregulation of the sodium-iodide symporter within days. Failure to escape produces iodine-induced hypothyroidism, and this mechanism is the most likely explanation for the subclinical hypothyroidism gradient in the Chinese cohort. The opposite failure, iodine-induced hyperthyroidism, occurs in nodular glands adapted to long-standing deficiency.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The measured outcome is a U-shaped curve',
        laymanDesc:
          'Disease rises at both ends. Deficiency causes goitre and irreversible developmental damage; more than adequate intake raises subclinical hypothyroidism and autoimmune thyroiditis.',
        molecularDetail:
          'Five-year cumulative subclinical hypothyroidism was 0.2%, 2.6% and 2.9% across mildly deficient, more than adequate and excessive intake regions; autoimmune thyroiditis 0.2%, 1.0% and 1.3%. The excess risk concentrated among those euthyroid with antithyroid antibodies at baseline — an asymptomatic group of substantial size in any population.',
        iconName: 'GitCompare',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Teng 2006 — effect of iodine intake on thyroid diseases in China',
        phase: 'Prospective five-year cohort across three regions of differing iodine intake',
        sampleSize: 3018,
        primaryEndpoint:
          'Five-year cumulative incidence of overt and subclinical hypothyroidism and of autoimmune thyroiditis',
        endpointMet: false,
        statisticalPValue:
          'Subclinical hypothyroidism 0.2%, 2.6% and 2.9% at mildly deficient, more than adequate and excessive intake; autoimmune thyroiditis 0.2%, 1.0% and 1.3%; overt hypothyroidism 0.2%, 0.5% and 0.3%',
        unreportedAdverseSignals:
          'Excess risk concentrated among participants who were euthyroid but antibody-positive at baseline — a group that is asymptomatic and unidentified in ordinary practice. This is a regional cohort comparison rather than a randomised trial, so unmeasured regional differences cannot be excluded.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Zimmermann 2006 — iodised oil and cognition in iodine-deficient Albanian schoolchildren',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 310,
        primaryEndpoint:
          'Cognitive and motor performance across seven tests, with thyroid and iodine status at 24 weeks',
        endpointMet: true,
        statisticalPValue:
          'Median urinary iodine rose from 43 to 172 micrograms per litre in the treated group, with marked improvement in thyroid status and in cognitive performance',
        unreportedAdverseSignals:
          'The authors note that earlier randomised trials of iodine and cognition in schoolchildren produced equivocal results. The distinguishing feature here is a population with severe unambiguous deficiency — 87% goitrous at baseline — which is why the result does not transfer to replete children.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Leung 2013 — iodine content of US prenatal multivitamins',
        phase: 'Analytical and survey review',
        sampleSize: 223,
        primaryEndpoint:
          'Proportion of prenatal multivitamin formulations listing iodine, and agreement between labelled and measured content',
        endpointMet: false,
        statisticalPValue:
          'Only 51% of 223 formulations list iodine, in varying amounts; measured levels can be discordant from labelled values; NHANES 2001-2006 found only 20.3% of US pregnant women routinely take an iodine-containing supplement',
        unreportedAdverseSignals:
          'Iodine is not a mandated component of a US prenatal multivitamin. The American Thyroid Association specifies potassium iodide rather than kelp because of the variability of iodine content in kelp and seaweed.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Five-year cumulative subclinical hypothyroidism rose from 0.2% at mildly deficient intake to 2.6% at more than adequate and 2.9% at excessive',
        'Autoimmune thyroiditis rose from 0.2% to 1.0% and 1.3% across the same three intake levels',
        'In severely deficient Albanian children, iodised oil raised median urinary iodine from 43 to 172 micrograms per litre and improved cognition',
        'Only 51% of 223 US prenatal multivitamin formulations list iodine, and measured levels can differ from labelled values',
      ],
      unsupportedInferences: [
        'That because iodine deficiency causes severe disease, more iodine is safer than less',
        'That an approved high-dose potassium iodide blockade tablet supports the safety of sustained high-dose supplementation',
        'That a "thyroid support" supplement helps a thyroid failing from autoimmune thyroiditis, the commonest cause in iodine-replete countries',
        'That kelp delivers a predictable iodine dose, which is why the American Thyroid Association specifies potassium iodide instead',
      ],
      whatFailedInitially: [
        'The one-directional model of iodine in which the only risk is deficiency, revised after the Chinese cohort data',
        'US prenatal supplementation, where half of the products aimed at the population that most needs iodine do not contain it',
      ],
      realWorldOutcome: [
        'Correcting iodine deficiency is among the highest-value interventions in the history of public health and this page says so plainly',
        'The intake window between insufficient and more than adequate is narrower than for almost any other nutrient here',
        'The people who need supplemental iodine most — pregnant and preconception women — are the least reliably supplied by the products aimed at them',
      ],
    },
    deliverySystem: {
      type: 'Iodised salt, oral tablet or capsule as potassium iodide, kelp extract, or an approved 65 or 130 mg blockade tablet',
      description:
        'Sold in the United States as a dietary supplement under DSHEA when in supplement form, added to table salt by voluntary fortification, and separately approved as an over-the-counter drug for radiological thyroid blockade at doses about a thousand times the nutritional requirement. Kelp-derived products are the problem format: seaweed iodine content varies by orders of magnitude with species, harvest site and season, which is why the American Thyroid Association specifies potassium iodide for supplementation. Kosher salt, sea salt and processed foods are not iodised, so national iodine supply in wealthy countries is more fragile than the historical success suggests.',
      safetyProfile:
        'At nutritional intakes iodine is well tolerated. Above adequate intake the risks are thyroid-specific and appear at intakes far below anything conventionally called toxic: five-year cumulative subclinical hypothyroidism was more than tenfold higher in Chinese regions with more than adequate intake than in a mildly deficient region, with autoimmune thyroiditis showing the same gradient, and risk concentrated in people who were antibody-positive but euthyroid at baseline. Iodine-induced hyperthyroidism can occur in people with nodular goitre adapted to long-standing deficiency. Very high acute doses cause gastrointestinal upset, metallic taste, sialadenitis and iodism. Iodine crosses the placenta and is concentrated in breast milk, so excess in pregnancy and lactation can cause neonatal hypothyroidism. Kelp supplements additionally carry variable arsenic, with hijiki-derived material of particular concern.',
    },
    commonQuestions: [
      {
        q: 'Is iodine deficiency still a real problem?',
        a: 'Yes, on a very large scale, and it is the strongest fact on this page. Iodine deficiency remains the most common preventable cause of intellectual impairment worldwide, with pregnant and lactating women and young children the most vulnerable. In a randomised trial in rural Albania, children whose median urinary iodine was 43 micrograms per litre and of whom 87 percent had goitres showed improved cognitive performance after supplementation. Universal salt iodisation is one of the outstanding public health achievements of the last century.',
      },
      {
        q: 'So should I take an iodine supplement?',
        a: 'That depends entirely on whether you are deficient, and iodine is unusual in that taking more than enough causes its own diseases. A five-year Chinese cohort compared three regions and found five-year subclinical hypothyroidism of 0.2 percent where intake was mildly deficient, 2.6 percent where it was more than adequate, and 2.9 percent where it was excessive, with autoimmune thyroiditis following the same pattern. Note the middle column: harm appeared already at more than adequate, not only at excessive.',
        auditNote:
          'The excess risk was concentrated in people who were antibody-positive but had no symptoms, which nobody knows about themselves.',
      },
      {
        q: 'Is kelp a good source?',
        a: 'The American Thyroid Association specifically says not, and gives the reason. In 2011 it updated its recommendation to specify supplementation with 150 micrograms of iodine daily as potassium iodide, "given the variability of iodine content in kelp and seaweed". Seaweed iodine varies by orders of magnitude with species, harvest location and season, so a kelp tablet is an unpredictable dose of the one nutrient here whose safe range is narrow. Kelp also carries variable arsenic.',
      },
      {
        q: 'Will iodine help an underactive thyroid?',
        a: 'Only if the cause is iodine deficiency, and in an iodine-replete country it usually is not — the commonest cause is autoimmune thyroiditis. In that setting supplying more iodine does not restore hormone production, and the Chinese cohort data suggest above-adequate intake makes autoimmune thyroiditis more likely rather than less. A "thyroid support" supplement bought for fatigue addresses neither the cause nor the missing hormone.',
      },
      {
        q: 'My prenatal vitamin does not list iodine. Does that matter?',
        a: 'It may, and this is the one place in this whole file where a supplement is genuinely under-supplied rather than oversold. Of 223 prenatal multivitamin formulations available in the United States, only 51 percent list iodine at all, in varying amounts, and measured levels can differ from the label. NHANES data found only about 20 percent of US pregnant women routinely take an iodine-containing supplement. Maternal thyroid hormone is required for fetal brain development at stages that cannot be revisited later.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Zimmermann MB et al. Iodine supplementation improves cognition in iodine-deficient schoolchildren in Albania: a randomized, controlled, double-blind study. Am J Clin Nutr 2006;83:108-114',
        identifier: '10.1093/ajcn/83.1.108',
        kind: 'doi',
      },
      {
        label: 'Teng W et al. Effect of iodine intake on thyroid diseases in China. N Engl J Med 2006;354:2783-2793',
        identifier: '10.1056/NEJMoa054022',
        kind: 'doi',
      },
      {
        label: 'Zimmermann MB, Jooste PL, Pandav CS. Iodine-deficiency disorders. Lancet 2008;372:1251-1262',
        identifier: '10.1016/S0140-6736(08)61005-3',
        kind: 'doi',
      },
      {
        label:
          'Leung AM, Pearce EN, Braverman LE. Sufficient iodine intake during pregnancy: just do it. Thyroid 2013;23:7-8',
        identifier: '10.1089/thy.2012.0491',
        kind: 'doi',
      },
      {
        label:
          'Leung AM, Pearce EN, Braverman LE. Iodine content of prenatal multivitamins in the United States. N Engl J Med 2009;360:939-940',
        identifier: '10.1056/NEJMc0807851',
        kind: 'doi',
      },
      {
        label: 'Drugs@FDA — NDA 018664, iOSAT (potassium iodide) 65 mg and 130 mg, over-the-counter',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018664',
        kind: 'regulatory',
      },
      {
        label: 'PubChem CID 4875 — Potassium iodide',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/4875',
        kind: 'url',
      },
    ],
  },
]
