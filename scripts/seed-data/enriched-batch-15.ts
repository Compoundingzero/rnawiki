import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — the cardiovascular drugs that are taken every day and never felt:
 * the combination antihypertensive, the beta-blockers that were once contraindicated in the
 * disease they now treat, the two rate-slowing calcium channel blockers, the nitrate, the two
 * drugs sold on heart rate and sodium current, and the neprilysin inhibitor.
 *
 * Editorial layer written over the machine-enriched records: the verdict, the mechanism carousel
 * and the audits, which no pipeline can produce. The identity facts — slug, trade name, sponsor,
 * approval year, SMILES — are copied from the enriched record rather than researched again.
 *
 * Every DOI, PMID, NCT number and FDA application number below was resolved against the NCBI
 * E-utilities, the ClinicalTrials.gov registry or the openFDA Drugs@FDA and label endpoints at the
 * time of writing. Sample sizes, hazard ratios, confidence intervals and p-values are copied from
 * the published abstract or the FDA label, never from memory. Where a number could not be sourced,
 * the field is absent.
 *
 * Five conventions apply to the whole group.
 *
 * 1. BLOOD PRESSURE AND HEART RATE ARE SURROGATES AND EVERY PAGE SAYS SO. Millimetres of mercury
 *    and beats per minute are what these drugs are licensed on and what most of their trials
 *    measured. Strokes, infarctions and deaths are what a reader cares about, and the two are not
 *    the same measurement. Where a drug has a hard-endpoint trial it is on the page; where the
 *    hard-endpoint trial failed — BEAUTIFUL, SIGNIFY, MERLIN-TIMI 36, ISIS-4, MDPIT — the failure
 *    is on the page at the same weight as the success.
 *
 * 2. A CLASS EFFECT IS AN INFERENCE, NOT A MEASUREMENT. Carvedilol, bisoprolol and nebivolol each
 *    have their own mortality trial and their results are not interchangeable; metoprolol tartrate
 *    lost to carvedilol in COMET at a dose its own trials never used. Every page that borrows
 *    evidence from a sibling molecule says which molecule the evidence came from.
 *
 * 3. PRICING IS A PRICE, NOT A COST. Every price here is the CMS National Average Drug Acquisition
 *    Cost — what a United States retail pharmacy pays a wholesaler — and is labelled as such.
 *    `synthesisCostPerDose` is empty on every dossier in this file: the cost-of-production
 *    literature for the WHO Essential Medicines List publishes a method and an aggregate, and its
 *    per-molecule cardiovascular figures sit in a supplementary appendix that could not be
 *    resolved and verified at the time of writing. An unverified cost is worse than an absent one.
 *
 * 4. NO DOSING, TITRATION, MONITORING OR PROCUREMENT GUIDANCE. Strengths and titration schedules
 *    appear only where they are part of a trial's description or a product's identity. Nothing
 *    here tells a reader what to take, how to move between doses, or where to obtain it.
 *
 * 5. THE MOST INSTRUCTIVE RECORD IN THIS GROUP IS A FRAUD. The DECREASE family of trials, which
 *    put perioperative bisoprolol into two continents' guidelines, was found to contain fictitious
 *    data. The meta-analysis of the surviving trials points the other way. That story is on the
 *    bisoprolol page because it is the clearest available demonstration of what an evidence audit
 *    is for.
 */

const NADAC_SOURCE = {
  label:
    'CMS National Average Drug Acquisition Cost (NADAC) survey — what United States retail pharmacies pay to acquire a drug',
  identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
  kind: 'url' as const,
}

const COST_OF_PRODUCTION_SOURCE = {
  label:
    'Hill A, Barber MJ, Gotham D. Estimated costs of production and potential prices for the WHO Essential Medicines List. BMJ Glob Health 2018;3:e000571 — the cost-of-production literature checked for this group. It publishes an estimation method over 148 medicines and an aggregate result; its per-molecule cardiovascular figures are in a supplementary appendix that could not be resolved at the time of writing, so no per-dose cost is stated on these pages',
  identifier: '10.1136/bmjgh-2017-000571',
  kind: 'doi' as const,
}

export const ENRICHED_BATCH_15_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Amlodipine / valsartan — two blood pressure drugs in one tablet, whose own label states
  //    that no controlled trial has shown the combination reduces risk.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'amlodipine-valsartan',
    name: 'Amlodipine / Valsartan',
    tradeName: 'Exforge',
    sponsor:
      'Novartis Pharmaceuticals Corporation; generic since 2014 and made by many manufacturers',
    targetGene: 'CACNA1C and AGTR1 — two human genes, one tablet',
    targetProtein:
      'Alpha-1C pore-forming subunit of the L-type voltage-gated calcium channel (Cav1.2), blocked by amlodipine; angiotensin II type 1 receptor, blocked by valsartan',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2007,
    indication:
      'Treatment of hypertension in adults, to lower blood pressure, in patients not adequately controlled on monotherapy and as initial therapy in patients likely to need more than one drug to reach their blood pressure goal',
    patientFriendlyIndication: 'High blood pressure that one tablet has not brought down',
    anatomicalSite:
      'Vascular smooth muscle of the small arteries — the calcium channel in the cell membrane and the angiotensin receptor beside it',
    conditionContext: {
      conditionExplainer:
        'High blood pressure is not a feeling. It is a number describing how hard blood pushes on artery walls, and the damage it does is cumulative and silent: thickened heart muscle, stiffened arteries, small strokes in the deep brain, protein leaking into urine. Nothing about it hurts until something breaks.',
      whyItMatters:
        'Most people whose blood pressure is high enough to treat will not reach a normal number on one drug. The choice is then between adding a second tablet and combining two drugs into one, and the second option is what this product is.',
      whoTakesThis:
        'Adults whose pressure stayed high on a single agent, and adults starting treatment far enough above goal that one drug was never going to be enough.',
      clinicalGoals:
        'A lower number on a cuff. That is the licensed endpoint and the only thing the product has been measured against. Whether this particular pair prevents more strokes than any other pair is not something its trials asked.',
    },
    oneSentenceVerdict:
      'A calcium channel blocker and an angiotensin receptor blocker in one tablet, which lowered sitting systolic pressure 16.2 mmHg further than placebo at the highest strength in a 1,911-patient factorial trial and halved the ankle swelling that amlodipine alone causes — and whose own FDA label states that no controlled trial has shown the combination reduces cardiovascular risk.',
    laymanHowItWorks:
      'Blood pressure is set by how wide the small arteries are. Amlodipine keeps calcium out of the muscle cells wrapping those arteries, so the muscle cannot squeeze and the vessels stay open. Valsartan blocks the receptor that angiotensin II uses to tighten those same vessels and to make the kidney hold on to salt. Blocking two different points in one loop lowers pressure more than blocking either alone, and it cancels a side effect: when amlodipine alone widens arteries, fluid is pushed out into the ankles, and adding valsartan relaxes the vein side too so less fluid escapes.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.4903 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 30 listed generic products at strengths 5/160, 5/320, 10/160 and 10/320 mg, survey effective 18 March 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 20 June 2007 under NDA 021990. Amlodipine came off patent in 2007 and valsartan in 2012; generic fixed-dose combinations followed, and the tablet now costs about half a United States dollar. Both halves are on the WHO Model List of Essential Medicines as single agents.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every alternative here lowers blood pressure, and the honest comparison between them is not how far the number falls but which pairing has been tested against events. That is where this product is weakest and where benazepril plus amlodipine is strongest: ACCOMPLISH randomised 11,506 high-risk patients and found the calcium-blocker pairing beat the diuretic pairing on hard outcomes. No equivalent trial exists for amlodipine plus valsartan. Diet and sodium restriction lower pressure by amounts that are real and measured, and they are complements to treatment rather than substitutes for it at the pressures that get treated.',
      conventionalRx: [
        {
          name: 'Benazepril plus amlodipine (Lotrel)',
          class: 'ACE inhibitor plus dihydropyridine calcium channel blocker',
          howItCompares:
            'The same calcium blocker, paired with an ACE inhibitor instead of an angiotensin receptor blocker. It is the only pairing of this shape with a hard-endpoint trial: in ACCOMPLISH, 11,506 high-risk hypertensive patients had a primary composite event rate of 9.6% against 11.8% on benazepril plus hydrochlorothiazide (HR 0.80, 95% CI 0.72 to 0.90, p<0.001), and the trial was stopped early.',
          typicalCost:
            'Generic; priced in the same range as amlodipine-valsartan at United States pharmacy acquisition cost',
          prosAndCons:
            'Pros: the outcome evidence this class rests on was generated with this exact pair. Cons: ACE inhibitors cause a dry cough in roughly one in ten people and angioedema in a small number, which is the reason angiotensin receptor blockers exist.',
        },
        {
          name: 'Amlodipine alone',
          class: 'Dihydropyridine calcium channel blocker',
          howItCompares:
            'Half the tablet. In the factorial study, amlodipine 5 mg lowered sitting systolic pressure 8.6 mmHg more than placebo against 16.2 mmHg for amlodipine 5 mg with valsartan 320 mg. In VALUE, an amlodipine-based regimen matched a valsartan-based regimen on the primary cardiac composite over 4.2 years in 15,245 patients.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: cheapest option, decades of outcome data, no renin-angiotensin effects on potassium or the fetus. Cons: dose-dependent ankle swelling, which was 8.7% on amlodipine alone against 5.4% on the combination in the pooled factorial studies.',
        },
        {
          name: 'Valsartan alone',
          class: 'Angiotensin II receptor blocker',
          howItCompares:
            'The other half. Valsartan 320 mg lowered sitting systolic pressure 10.1 mmHg more than placebo in the factorial study, against 16.2 mmHg for the maximum combination. Peripheral oedema on valsartan alone was 2.1%, lower than either the combination or amlodipine.',
          typicalCost:
            'US$0.1648 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 163 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: least ankle swelling of the three; a large trial base in heart failure and after infarction. Cons: lowers pressure less than the pair; carries the class boxed warning for fetal toxicity; was the molecule at the centre of the 2018 nitrosamine recalls.',
        },
        {
          name: 'Amlodipine, valsartan and hydrochlorothiazide (Exforge HCT)',
          class: 'Three-drug fixed-dose combination',
          howItCompares:
            'Adds a thiazide diuretic to the same pair for pressure that stays high on two drugs. In the controlled trial of the triple product, excessive hypotension including orthostatic hypotension occurred in 1.7% at the maximum strength against 0.4% on amlodipine-valsartan.',
          typicalCost:
            'Generic; a few United States cents more per tablet than the two-drug product',
          prosAndCons:
            'Pros: three mechanisms in one tablet for genuinely resistant pressure. Cons: more hypotension, more electrolyte disturbance, and ACCOMPLISH is a direct argument against the diuretic being the right third drug in high-risk patients.',
        },
      ],
      naturalFoods: [
        {
          name: 'The DASH eating pattern — vegetables, fruit, low-fat dairy, reduced saturated fat',
          activeCompound:
            'No single compound. The measured effect belongs to the whole pattern, and the potassium, calcium, magnesium and fibre in it have never been separated out convincingly in a feeding trial.',
          biologicalMechanism:
            'Higher dietary potassium promotes urinary sodium excretion and relaxes vascular smooth muscle; the pattern also lowers weight-independent vascular resistance. It acts on the same variable the tablet acts on, by a different route.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: in the original controlled feeding trial in 459 adults, the combination diet lowered systolic pressure 5.5 mmHg and diastolic 3.0 mmHg more than the control diet, and 11.4/5.5 mmHg in the subgroup with hypertension. All food was provided by the study.',
          monthlyCost: '',
        },
        {
          name: 'Lower dietary sodium',
          activeCompound: 'The absence of sodium chloride rather than the presence of anything',
          biologicalMechanism:
            'Less sodium means less extracellular volume and less pressure natriuresis required to clear it, which lowers arterial pressure directly. It is additive to the DASH pattern rather than redundant with it.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage:
            'Not stated here as advice. For scale only: in DASH-Sodium, 412 adults were fed each of three sodium levels; on the control diet, systolic pressure fell 2.1 mmHg from the high to the intermediate level and a further 4.6 mmHg from intermediate to low, and on the DASH diet 1.3 and 1.7 mmHg. The DASH diet at the low sodium level was 7.1 mmHg lower than the control diet at the high level in participants without hypertension and 11.5 mmHg lower in those with it.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Say immediately if you are or might become pregnant',
          action:
            'Tell the prescriber before the first tablet, and again if anything changes, because this is the one situation in which the drug must stop.',
          patientImpact:
            'The product carries a boxed warning for fetal toxicity. Drugs acting on the renin-angiotensin system reduce fetal renal function in the second and third trimesters; the label lists oligohydramnios, fetal lung hypoplasia, skull hypoplasia, anuria, renal failure and death.',
          clinicalPrecaution:
            'The label instruction is to discontinue as soon as pregnancy is detected. This is not a dose adjustment and not a risk-benefit discussion.',
        },
        {
          name: 'Report swollen ankles rather than tolerating them',
          action:
            'Say if your ankles or lower legs swell, and say whether it is worse at the end of the day.',
          patientImpact:
            'Peripheral oedema is the commonest reason amlodipine-containing regimens are abandoned. It occurred in 5.4% on the combination against 8.7% on amlodipine alone and 2.1% on valsartan alone in the pooled factorial studies.',
          clinicalPrecaution:
            'It is a capillary pressure effect rather than fluid overload, so it does not respond to a diuretic the way heart failure oedema does. Swelling that is one-sided, painful or sudden is a different problem and needs assessment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString:
        'CCOC(=O)C1=C(NC(=C(C1C2=CC=CC=C2Cl)C(=O)OC)C)COCCN.CCCCC(=O)N(CC1=CC=C(C=C1)C2=CC=CC=C2C3=NNN=N3)[C@@H](C(C)C)C(=O)O',
      chemicalFormula: 'C20H25ClN2O5 (amlodipine free base) and C24H29N5O3 (valsartan)',
      molecularWeight:
        'Amlodipine 408.9 g/mol as the free base, dispensed as the besylate salt; valsartan 435.5 g/mol',
      targetReceptorAffinity:
        'Amlodipine is an ionised compound at physiological pH (pKa 8.6) whose interaction with the channel is characterised in the label as gradual, giving it an unusually slow onset and offset for a dihydropyridine; it inhibits calcium influx with greater effect on vascular smooth muscle than on cardiac muscle. Valsartan blocks the angiotensin II type 1 receptor with roughly 20,000-fold selectivity over the type 2 receptor and does not inhibit angiotensin-converting enzyme, which is why it does not cause the bradykinin cough.',
      structureSource: {
        label:
          'PubChem CID 2162 (amlodipine) and CID 60846 (valsartan) — canonical SMILES, molecular formula and weight, as carried on the enriched records for each single agent',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2162',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'amv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Assay both actives separately before either enters a blend',
          description:
            'Confirm identity, assay and related substances for amlodipine besylate and for valsartan as separate incoming materials. Since 2018 the valsartan assay carries an additional obligation that did not exist when the product was approved: a nitrosamine test, because contaminated valsartan drug substance is what triggered the global recalls.',
          reagentsAndBuffer:
            'Amlodipine besylate and valsartan reference standards, reversed-phase HPLC with ultraviolet detection at 237 and 250 nanometres, GC-MS or LC-MS/MS for N-nitrosodimethylamine at parts-per-million sensitivity, Karl Fischer titration',
        },
        {
          id: 'amv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Hantzsch cyclisation for the dihydropyridine and amide coupling for the tetrazole',
          description:
            'The two halves are made by unrelated chemistry. Amlodipine is built in one pot by a Hantzsch condensation of 2-chlorobenzaldehyde with an azido-ether ketoester and methyl 3-aminocrotonate, which sets the C4 stereocentre without control and is why the drug is a racemate. Valsartan is assembled by acylating an L-valine ester onto a biphenyl-tetrazole methylamine, where the amino acid supplies the single stereocentre.',
          dependsOnStepId: 'amv-w1',
          reagentsAndBuffer:
            'Methyl 3-aminocrotonate, ethyl 4-(2-azidoethoxy)acetoacetate, 2-chlorobenzaldehyde, isopropanol at reflux under nitrogen for amlodipine; L-valine methyl ester, valeryl chloride, trityl-protected biphenyl tetrazole and a base in an aprotic solvent for valsartan',
        },
        {
          id: 'amv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt formation, crystallisation and nitrosamine clearance',
          description:
            'Reduce the amlodipine azide to the primary amine and crystallise the besylate salt; deprotect and crystallise valsartan as the free acid. The valsartan crystallisation is where the 2018 failure lived: a route change that introduced sodium nitrite in the presence of a dimethylformamide-derived amine generated N-nitrosodimethylamine, and the purification did not remove it because nobody was looking for it.',
          dependsOnStepId: 'amv-w2',
          reagentsAndBuffer:
            'Benzenesulfonic acid in ethanol or isopropanol for the besylate; acid deprotection of the trityl group and crystallisation of valsartan from ethyl acetate and heptane; 1H and 13C NMR, chiral HPLC, and a validated nitrosamine method run on every batch',
        },
        {
          id: 'amv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Dissolution and permeability of the bilayer tablet',
          description:
            'The two actives have opposite solubility behaviour — amlodipine besylate is freely soluble and valsartan is poorly soluble and pH-dependent — so the tablet is engineered to release both without either interfering with the other. A fixed-dose combination that dissolves differently from its components is a different drug in the patient even when the chemistry is identical.',
          dependsOnStepId: 'amv-w3',
          reagentsAndBuffer:
            'USP apparatus II dissolution in pH 1.2, 4.5 and 6.8 media with simultaneous HPLC assay of both actives, Caco-2 monolayer permeability with transepithelial electrical resistance monitoring',
        },
        {
          id: 'amv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Functional confirmation on isolated vessel and on receptor binding',
          description:
            'Measure what each half actually does rather than assuming it from the certificate of analysis. Amlodipine is quantified by its relaxation of a potassium-precontracted aortic ring; valsartan by displacement of a radiolabelled angiotensin II analogue from AT1-expressing membranes, with the AT2 receptor run alongside to confirm selectivity.',
          dependsOnStepId: 'amv-w4',
          reagentsAndBuffer:
            'Rat thoracic aortic rings in Krebs-Henseleit buffer with 60 mM potassium chloride, isometric force transducers; membranes expressing human AT1 and AT2, radiolabelled angiotensin II, scintillation counting',
        },
      ],
    },
    keyAudits: [
      {
        id: 'amv-a1',
        category: 'measured',
        title:
          'Two placebo-controlled factorial trials: the pair beat each half at almost every dose',
        laymanSummary:
          'Three thousand people were randomised to the combination, to each drug alone, or to a dummy tablet. At the strongest combination the top blood pressure number fell about 16 points further than on the dummy tablet, against about 9 for either drug on its own.',
        technicalDetails:
          'Two multinational 8-week, randomised, double-blind, placebo-controlled, parallel-group factorial studies enrolled 1,911 and 1,250 patients with mean sitting diastolic pressure at least 95 and below 110 mmHg. The primary endpoint was change from baseline in mean sitting diastolic pressure at week 8. With the exception of a few combinations containing amlodipine 2.5 mg, every combination lowered both diastolic and systolic pressure significantly more than its own components and than placebo (p<0.05), with a positive dose response. Response rate at amlodipine 5 mg plus valsartan 320 mg was 91.3% against 71.9% for amlodipine 5 mg, 73.4% for valsartan 320 mg and 40.9% for placebo. The FDA label tabulates the same study: placebo-subtracted systolic reduction was 16.2 mmHg at 5/320 mg against 8.6 mmHg for amlodipine 5 mg and 10.1 mmHg for valsartan 320 mg, from a mean baseline of 152.8/99.3 mmHg.',
        evidenceSource:
          'Philipp T et al., Clin Ther 2007;29:563-580; amlodipine and valsartan United States prescribing information, section 14',
        doi: '10.1016/j.clinthera.2007.03.018',
        measuredMetric:
          'Change from baseline in mean sitting diastolic and systolic blood pressure at week 8, against placebo and against each component',
        auditFlag: 'verified',
      },
      {
        id: 'amv-a2',
        category: 'measured',
        title: 'Adding valsartan cut amlodipine ankle swelling from 8.7% to 5.4%',
        laymanSummary:
          'Swollen ankles are the reason most people stop taking amlodipine. In the same trials, swelling was about a third less common on the combination than on amlodipine alone — but still more than twice as common as on valsartan alone.',
        technicalDetails:
          'Pooled from the two factorial studies, peripheral oedema occurred in 5.4% on combination therapy against 8.7% on amlodipine monotherapy (p=0.014), 2.1% on valsartan monotherapy (p<0.001 against the combination) and 3.0% on placebo, a difference from placebo that was not significant. The mechanism is arteriolar dilatation raising capillary hydrostatic pressure without a matching venodilatation; angiotensin receptor blockade relaxes the postcapillary side and reduces the gradient. The finding is a genuine measured advantage of the pairing and it is separate from the blood pressure result.',
        evidenceSource: 'Philipp T et al., Clin Ther 2007;29:563-580',
        doi: '10.1016/j.clinthera.2007.03.018',
        measuredMetric:
          'Incidence of peripheral oedema, combination against each monotherapy and against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'amv-a3',
        category: 'inferred',
        title: 'The label states in plain words that no trial has shown this product reduces risk',
        laymanSummary:
          'The package insert says it outright: lowering blood pressure reduces strokes and heart attacks, that has been shown for other drugs, and there are no controlled trials showing risk reduction with this combination. Everything about outcomes on this page is borrowed.',
        technicalDetails:
          'Section 1.1 of the United States prescribing information reads: "There are no controlled trials demonstrating risk reduction with amlodipine and valsartan." The benefit is inferred from two separate arguments. First, class evidence: amlodipine has ALLHAT, ASCOT and VALUE, and the angiotensin receptor blockers have their own outcome programme. Second, the label\'s own reasoning that "it is blood pressure reduction, and not some other pharmacologic property of the drugs, that is largely responsible for those benefits." That is a defensible inference and it is still an inference. The only randomised hard-endpoint evidence for a dihydropyridine paired with a renin-angiotensin blocker comes from ACCOMPLISH, which used benazepril, not valsartan.',
        evidenceSource:
          'Amlodipine and valsartan United States prescribing information, section 1.1 (NDA 021990); Jamerson K et al., N Engl J Med 2008;359:2417-2428 (ACCOMPLISH)',
        doi: '10.1056/NEJMoa0806182',
        inferredClaim:
          'That this fixed-dose pair prevents strokes, infarctions and cardiovascular deaths — supported by class evidence and by the blood pressure result, never tested directly',
        auditFlag: 'contested',
      },
      {
        id: 'amv-a4',
        category: 'failed',
        title:
          'VALUE: the two halves were compared head to head and the trial could not answer itself',
        laymanSummary:
          'Fifteen thousand high-risk patients were randomised to a valsartan-based or an amlodipine-based regimen to see which prevented more heart events. Neither won. The trial was undermined by its own design: amlodipine lowered pressure faster, so the two groups were never at the same pressure to compare.',
        technicalDetails:
          'VALUE randomised 15,245 patients aged 50 or older with hypertension and high cardiac risk to valsartan-based or amlodipine-based therapy and followed them a mean of 4.2 years. The primary composite of cardiac mortality and morbidity occurred in 810 valsartan patients (10.6%, 25.5 per 1000 patient-years) and 789 amlodipine patients (10.4%, 24.7 per 1000 patient-years); hazard ratio 1.04, 95% CI 0.94 to 1.15, p=0.49. Blood pressure fell more on amlodipine throughout, by 4.0/2.1 mmHg at one month and 1.5/1.3 mmHg at one year (p<0.001 between groups), which the authors state might account for the differences in cause-specific outcomes. The trial answered a different question than the one it asked, and its main usable conclusion is that reaching control early matters more than which of the two drugs does it.',
        evidenceSource: 'Julius S et al., Lancet 2004;363:2022-2031 (VALUE)',
        doi: '10.1016/S0140-6736(04)16451-9',
        measuredMetric:
          'Composite of cardiac mortality and morbidity, valsartan-based against amlodipine-based regimen over 4.2 years',
        auditFlag: 'caution',
      },
      {
        id: 'amv-a5',
        category: 'inferred',
        title: 'The VALUE heart failure result came from cohorts matched after randomisation',
        laymanSummary:
          'A follow-up analysis of the same trial paired patients with identical blood pressures and reported fewer heart failure admissions on valsartan. Pairing people after the trial has run throws away the randomisation, which is the only thing that made the trial trustworthy.',
        technicalDetails:
          'Weber and colleagues applied serial median matching at six months, when treatment adjustment was complete, to create 5,006 valsartan-amlodipine patient pairs matched exactly for systolic pressure, age, sex and the presence or absence of previous coronary disease, stroke or diabetes. Subsequent combined cardiac events, myocardial infarction, stroke and mortality were almost identical between the matched cohorts, but hospital admission for heart failure was significantly lower with valsartan. The analysis is transparent about being a post-hoc device to work around the blood pressure imbalance. Matching on a variable measured after randomisation converts a randomised comparison into an observational one, and confounding by whatever drove those six-month pressures cannot be excluded.',
        evidenceSource: 'Weber MA et al., Lancet 2004;363:2049-2051',
        doi: '10.1016/S0140-6736(04)16456-8',
        inferredClaim:
          'That valsartan prevents heart failure admissions better than amlodipine at equal blood pressure — derived from cohorts matched six months after randomisation, not from the randomised comparison',
        auditFlag: 'contested',
      },
      {
        id: 'amv-a6',
        category: 'conclusion_shift',
        title: 'The 2018 nitrosamine recall, and the cohort study that followed it',
        laymanSummary:
          'In 2018 valsartan made by one supplier was found to contain a probable human carcinogen produced by the manufacturing route itself, and millions of tablets were recalled worldwide. A Danish study then followed 5,150 valsartan users and found no clear increase in cancer over the following years.',
        technicalDetails:
          'N-nitrosodimethylamine, a probable human carcinogen, was detected in valsartan active pharmaceutical ingredient after a change in synthetic route, triggering recalls across the United States, Europe and Asia and later widening to other sartans and to unrelated drug classes. Pottegard and colleagues then ran an expedited nationwide Danish cohort of 5,150 valsartan users aged 40 or over with no cancer history, followed a median 4.6 years with a one-year lag. With 104 cancers among the unexposed and 198 among the exposed, the adjusted hazard ratio for overall cancer was 1.09 (95% CI 0.85 to 1.41) with no dose-response relation (p=0.70). Colorectal cancer (HR 1.46, 95% CI 0.79 to 2.73) and uterine cancer (HR 1.81, 0.55 to 5.90) were raised with confidence intervals crossing one. The authors state the result does not imply a markedly increased short-term risk and that longer follow-up is needed. The manufacturing failure was real; the population-level cancer signal, so far, is not.',
        evidenceSource:
          'Pottegard A et al., Use of N-nitrosodimethylamine (NDMA) contaminated valsartan products and risk of cancer: Danish nationwide cohort study. BMJ 2018;362:k3851',
        doi: '10.1136/bmj.k3851',
        inferredClaim:
          'That the contaminated tablets caused cancers — the exposure was real and the measured short-term excess risk was not distinguishable from zero, on follow-up too short to settle the question',
        auditFlag: 'verified',
      },
      {
        id: 'amv-a7',
        category: 'failed',
        title: 'A boxed warning that is absolute rather than proportional',
        laymanSummary:
          'The tablet carries the strongest warning the FDA issues, for harm to a developing fetus. It is not a caution to weigh up: the instruction is to stop the drug as soon as pregnancy is found.',
        technicalDetails:
          'The product carries a boxed warning for fetal toxicity: drugs acting directly on the renin-angiotensin system can cause injury and death to the developing fetus, and the label directs discontinuation as soon as pregnancy is detected. Use in the second and third trimesters reduces fetal renal function and increases fetal and neonatal morbidity and death; resulting oligohydramnios is associated with fetal lung hypoplasia and skeletal deformation, and neonatal effects listed include skull hypoplasia, anuria, hypotension, renal failure and death. This is a class warning carried by every angiotensin receptor blocker and every ACE inhibitor, and it is the single most consequential fact about prescribing them to anyone who could become pregnant.',
        evidenceSource:
          'Amlodipine and valsartan United States prescribing information, boxed warning and Warnings and Precautions 5.1 (NDA 021990)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet carrying two unrelated molecules',
        laymanDesc:
          'The tablet holds two drugs that have nothing chemically in common. They are combined because they act on two different points of the same control loop, not because they are related.',
        molecularDetail:
          'Amlodipine besylate is a dihydropyridine with a slow, pH-dependent association kinetic (pKa 8.6) giving a terminal half-life of 30 to 50 hours; valsartan is a biphenyl tetrazole with a half-life of about 6 hours and 94 to 97% albumin binding. The tablet is engineered around their opposite solubility behaviour so that neither release profile disturbs the other.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Amlodipine blocks calcium entering artery muscle',
        laymanDesc:
          'The muscle wrapped around small arteries needs calcium flowing in to squeeze. Amlodipine plugs the channel that calcium uses, so the squeeze weakens and the vessel widens.',
        molecularDetail:
          'Amlodipine binds the dihydropyridine site on the alpha-1C subunit of the Cav1.2 L-type channel and inhibits transmembrane calcium influx, with greater effect on vascular smooth muscle than on cardiac muscle. Negative inotropy is detectable in vitro but not seen in intact animals at therapeutic exposure, which is why it does not slow the heart the way verapamil and diltiazem do.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Valsartan blocks the receptor angiotensin uses',
        laymanDesc:
          'Angiotensin II is the body signal that tightens arteries and tells the kidney to keep salt. Valsartan sits on the receptor that signal binds to, so the message never lands.',
        molecularDetail:
          'Valsartan is a selective, insurmountable antagonist at the angiotensin II type 1 receptor with roughly 20,000-fold selectivity over the AT2 receptor. It blocks vasoconstriction and aldosterone-driven sodium retention on cardiac, vascular smooth muscle, adrenal and renal cells. It does not inhibit angiotensin-converting enzyme, so bradykinin is not accumulated and the ACE-inhibitor cough does not occur.',
        iconName: 'Ban',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Blocking two points beats blocking one twice as hard',
        laymanDesc:
          'Widening arteries with one drug makes the body push back by raising the other signal. Blocking both at once removes the counter-move, which is why the pair lowers pressure further than either drug pushed to its maximum.',
        molecularDetail:
          'Dihydropyridine vasodilatation triggers reflex sympathetic activation and renin release, raising circulating angiotensin II. AT1 blockade removes that compensation, producing more than additive pressure reduction: 16.2 mmHg placebo-subtracted systolic at 5/320 mg against 8.6 and 10.1 mmHg for the components alone.',
        iconName: 'Split',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The ankles swell less than on amlodipine alone',
        laymanDesc:
          'Amlodipine widens the arteries feeding the tiny vessels but not the veins draining them, so fluid is pushed out into the ankles. Relaxing the drainage side lets some of that fluid stay in circulation.',
        molecularDetail:
          'Selective precapillary dilatation raises capillary hydrostatic pressure and drives transudation. AT1 blockade produces postcapillary venodilatation, lowering the gradient. Measured effect: peripheral oedema 5.4% on the combination against 8.7% on amlodipine alone (p=0.014) and 2.1% on valsartan alone.',
        iconName: 'Droplet',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the number on the cuff does not tell you',
        laymanDesc:
          'Everything above is measured in millimetres of mercury. Whether this particular pair prevents more strokes and heart attacks than any other pair has not been tested, and the label says so.',
        molecularDetail:
          'Blood pressure is a validated surrogate at the class level, supported by ALLHAT, ASCOT, VALUE and the ACCOMPLISH comparison of two combination strategies. It is not a hard endpoint for this product: section 1.1 of the label states that there are no controlled trials demonstrating risk reduction with amlodipine and valsartan.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Philipp study 1 (Clin Ther 2007;29:563-580)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled factorial',
        sampleSize: 1911,
        primaryEndpoint: 'Change from baseline in mean sitting diastolic blood pressure at week 8',
        endpointMet: true,
        statisticalPValue:
          'p<0.05 for combination against each component and against placebo at all doses except a few containing amlodipine 2.5 mg; response rate 91.3% at 5/320 mg against 71.9% amlodipine, 73.4% valsartan, 40.9% placebo',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Philipp study 2 (Clin Ther 2007;29:563-580)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled factorial',
        sampleSize: 1250,
        primaryEndpoint:
          'Change from baseline in mean sitting diastolic blood pressure at week 8, at amlodipine 10 mg',
        endpointMet: true,
        statisticalPValue:
          'Response rates 88.5% at 10/160 mg and 87.5% at 10/320 mg against 86.9% for amlodipine 10 mg alone and 49.3% for placebo',
        unreportedAdverseSignals:
          'At amlodipine 10 mg the combination barely improved on amlodipine alone by response rate — 88.5% against 86.9%. The added value of the second drug is largest at low amlodipine doses and smallest at the maximum, which no promotional summary of the product mentions.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'VALUE (Lancet 2004;363:2022-2031)',
        phase: 'Phase 4, randomised, double-blind, active-controlled, event-driven',
        sampleSize: 15245,
        primaryEndpoint:
          'Composite of cardiac mortality and morbidity, valsartan-based against amlodipine-based regimen',
        endpointMet: false,
        statisticalPValue: 'Hazard ratio 1.04, 95% CI 0.94 to 1.15, p=0.49 over a mean 4.2 years',
        unreportedAdverseSignals:
          'Blood pressure was 4.0/2.1 mmHg lower on amlodipine at one month and 1.5/1.3 mmHg at one year (p<0.001), so the two arms were never at equal pressure. The comparison the trial was built to make could not be made.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'ACCOMPLISH (NCT00170950)',
        phase: 'Phase 4, randomised, double-blind, active-controlled',
        sampleSize: 11506,
        primaryEndpoint:
          'Composite of cardiovascular death, nonfatal myocardial infarction, nonfatal stroke, hospitalisation for angina, resuscitated cardiac arrest and coronary revascularisation',
        endpointMet: true,
        statisticalPValue:
          '9.6% against 11.8%; hazard ratio 0.80, 95% CI 0.72 to 0.90, p<0.001; stopped early at a mean 36 months',
        unreportedAdverseSignals:
          'This trial used benazepril, not valsartan. It is the outcome evidence most often invoked for calcium blocker plus renin-angiotensin blocker combinations, and it was generated with a different pair of drugs.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Placebo-subtracted systolic reduction of 16.2 mmHg at amlodipine 5 mg plus valsartan 320 mg, against 8.6 mmHg for amlodipine alone and 10.1 mmHg for valsartan alone',
        'Response rate 91.3% at 5/320 mg against 40.9% on placebo, in 1,911 randomised patients',
        'Peripheral oedema 5.4% on the combination against 8.7% on amlodipine monotherapy (p=0.014)',
        'No difference in cardiac morbidity and mortality between valsartan-based and amlodipine-based regimens in 15,245 patients over 4.2 years (HR 1.04, p=0.49)',
      ],
      unsupportedInferences: [
        'That this fixed-dose pair reduces strokes, infarctions or cardiovascular death — the label states no controlled trial has shown it',
        'That the ACCOMPLISH result transfers to this product, when ACCOMPLISH used benazepril rather than valsartan',
        'That valsartan prevents heart failure better than amlodipine at matched pressure, which comes from cohorts matched six months after randomisation',
        'That the two components are interchangeable with any other calcium blocker and any other sartan at the same pressure reduction',
      ],
      whatFailedInitially: [
        'VALUE failed to separate the two components on its primary endpoint and could not, because blood pressure differed between arms throughout',
        'At amlodipine 10 mg the combination improved the response rate by 1.6 percentage points over amlodipine alone, from 86.9% to 88.5%',
        'Valsartan drug substance was recalled worldwide in 2018 after a manufacturing route change generated N-nitrosodimethylamine that nobody was testing for',
        'The product carries a boxed warning for fetal toxicity that no dose adjustment mitigates',
      ],
      realWorldOutcome: [
        'Approved in the United States on 20 June 2007 under NDA 021990 and generic since 2014, at about half a United States dollar per tablet',
        'The template for the fixed-dose antihypertensive combination: one tablet, two mechanisms, fewer of the side effects of the stronger component',
        'The 2018 nitrosamine recalls started here and reshaped impurity testing across the entire generic industry',
        'A Danish cohort of 5,150 exposed users found no clearly increased short-term cancer risk (adjusted HR 1.09, 95% CI 0.85 to 1.41)',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet, taken once daily, at strengths of 5/160, 10/160, 5/320 and 10/320 mg',
      description:
        'A bilayer or blended tablet designed around two actives with opposite solubility behaviour. Amlodipine reaches peak plasma concentration in 6 to 12 hours and has a terminal half-life of 30 to 50 hours, so once-daily coverage is a property of the molecule rather than of the formulation; valsartan is shorter-lived and its effect persists because receptor blockade outlasts plasma exposure.',
      safetyProfile:
        'Boxed warning for fetal toxicity: discontinue as soon as pregnancy is detected. Commonest adverse reactions are peripheral oedema, dizziness, headache and nasopharyngitis. Hypotension can occur in volume- or salt-depleted patients, and the label directs correcting depletion before starting. Renal function and potassium need monitoring in susceptible patients, particularly with renal artery stenosis, heart failure or existing kidney impairment. Dihydropyridines can rarely worsen angina or precipitate infarction on initiation, chiefly in severe obstructive coronary disease.',
    },
    commonQuestions: [
      {
        q: 'Is one tablet with two drugs better than two separate tablets?',
        a: 'For the blood pressure number, no — the same two molecules do the same thing whether they arrive in one tablet or two. What the single tablet changes is how many people actually take both, every day, for years, which is the part that decides whether a blood pressure drug works at all. That is a real advantage and it is a behavioural one, not a pharmacological one. The one measured pharmacological difference is ankle swelling: adding valsartan cut it from 8.7% to 5.4% compared with amlodipine alone, and that would happen with two separate tablets too.',
        auditNote:
          'Adherence gains from fixed-dose combinations are supported by observational and pharmacy-refill data rather than by randomised outcome trials, and this product has no outcome trial of its own to show whether that translates.',
      },
      {
        q: 'Will this stop me having a stroke?',
        a: 'The honest answer is that lowering blood pressure prevents strokes, and no trial has shown that this particular tablet does. The label says so in plain language: there are no controlled trials demonstrating risk reduction with amlodipine and valsartan. What exists is class evidence, from trials of amlodipine and of angiotensin receptor blockers separately, and the reasoning that it is the pressure reduction rather than the drug that does the work. The closest thing to direct evidence for a pairing of this shape is ACCOMPLISH, which found a 20% relative reduction in cardiovascular events — and used benazepril rather than valsartan.',
      },
      {
        q: 'Why do my ankles swell, and does it mean fluid is building up?',
        a: 'No, and this is a common and consequential misunderstanding. Amlodipine widens the small arteries feeding the capillary beds without widening the veins that drain them, so pressure inside the capillaries rises and fluid is pushed into the tissue. It is a local plumbing effect, not fluid overload, and it does not mean your heart or kidneys are failing. It also means a water tablet is the wrong answer: diuretics do little for it because there is no excess total body fluid to remove. Adding valsartan reduces it by relaxing the drainage side, which is one of the measured reasons this combination exists.',
      },
      {
        q: 'Was my valsartan one of the recalled ones?',
        a: 'Recalls in 2018 and after covered specific batches from specific manufacturers whose synthetic route generated N-nitrosodimethylamine, a probable human carcinogen; they did not cover all valsartan. The batch numbers were published at the time and a pharmacist can check a specific supply. On the risk itself, a Danish study followed 5,150 valsartan users for a median of 4.6 years and found the adjusted hazard ratio for any cancer was 1.09, with a confidence interval from 0.85 to 1.41 and no relationship to cumulative exposure. That is not a reassuring result so much as an unalarming one on short follow-up, and the authors said longer follow-up is needed.',
        auditNote:
          'The recall was a manufacturing and regulatory failure that was real regardless of whether a cancer signal emerges. The two questions are separate and are often collapsed into one.',
      },
      {
        q: 'Can I take this if I am trying to get pregnant?',
        a: 'This needs a conversation before it becomes urgent, not after. The tablet carries a boxed warning for fetal toxicity, and the instruction in the label is to stop it as soon as pregnancy is detected. Drugs that act on the renin-angiotensin system reduce fetal kidney function in the second and third trimesters; the consequences listed in the label include too little amniotic fluid, underdeveloped fetal lungs, skull deformity, kidney failure and death. High blood pressure in pregnancy still needs treating, and there are agents with a long record of use in pregnancy, which is a discussion to have in advance of conception rather than at the first positive test.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Philipp T, Smith TR, Glazer R, et al. Two multicenter, 8-week, randomized, double-blind, placebo-controlled, parallel-group studies evaluating the efficacy and tolerability of amlodipine and valsartan in combination and as monotherapy in adult patients with mild to moderate essential hypertension. Clin Ther 2007;29:563-580',
        identifier: '10.1016/j.clinthera.2007.03.018',
        kind: 'doi',
      },
      {
        label:
          'Julius S, Kjeldsen SE, Weber M, et al. Outcomes in hypertensive patients at high cardiovascular risk treated with regimens based on valsartan or amlodipine: the VALUE randomised trial. Lancet 2004;363:2022-2031',
        identifier: '10.1016/S0140-6736(04)16451-9',
        kind: 'doi',
      },
      {
        label:
          'Weber MA, Julius S, Kjeldsen SE, et al. Blood pressure dependent and independent effects of antihypertensive treatment on clinical events in the VALUE Trial. Lancet 2004;363:2049-2051',
        identifier: '10.1016/S0140-6736(04)16456-8',
        kind: 'doi',
      },
      {
        label:
          'Jamerson K, Weber MA, Bakris GL, et al. Benazepril plus amlodipine or hydrochlorothiazide for hypertension in high-risk patients. N Engl J Med 2008;359:2417-2428 (ACCOMPLISH)',
        identifier: '10.1056/NEJMoa0806182',
        kind: 'doi',
      },
      {
        label:
          'Pottegard A, Kristensen KB, Ernst MT, et al. Use of N-nitrosodimethylamine (NDMA) contaminated valsartan products and risk of cancer: Danish nationwide cohort study. BMJ 2018;362:k3851',
        identifier: '10.1136/bmj.k3851',
        kind: 'doi',
      },
      {
        label:
          'Ram CV. Antihypertensive efficacy of olmesartan medoxomil or valsartan in combination with amlodipine: a review of factorial-design studies. Curr Med Res Opin 2009;25:177-185',
        identifier: '10.1185/03007990802597456',
        kind: 'doi',
      },
      {
        label: 'ACCOMPLISH: benazepril plus amlodipine against benazepril plus hydrochlorothiazide',
        identifier: 'NCT00170950',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: EXFORGE (amlodipine and valsartan), NDA 021990, Novartis — original approval 20 June 2007',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021990',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) 2026 file — amlodipine-valsartan, 30 listed products, effective 18 March 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label:
          'Appel LJ, Moore TJ, Obarzanek E, et al. A clinical trial of the effects of dietary patterns on blood pressure. N Engl J Med 1997;336:1117-1124 (DASH)',
        identifier: '10.1056/NEJM199704173361601',
        kind: 'doi',
      },
      {
        label:
          'Sacks FM, Svetkey LP, Vollmer WM, et al. Effects on blood pressure of reduced dietary sodium and the Dietary Approaches to Stop Hypertension (DASH) diet. N Engl J Med 2001;344:3-10',
        identifier: '10.1056/NEJM200101043440101',
        kind: 'doi',
      },
      {
        label: 'PubChem CID 2162 — amlodipine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2162',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 2. Carvedilol — the beta-blocker approved for heart failure after its own exercise endpoint
  //    failed in three of four trials, and the advisory committee reversed itself.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'carvedilol',
    name: 'Carvedilol',
    tradeName: 'Coreg',
    sponsor:
      'Waylis Therapeutics (current holder of NDA 020297); originated at Boehringer Mannheim and developed for heart failure by SmithKline Beecham',
    targetGene: 'ADRB1, ADRB2 and ADRA1A',
    targetProtein:
      'Beta-1 and beta-2 adrenergic receptors, blocked non-selectively, plus the alpha-1 adrenergic receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1995,
    indication:
      'Mild to severe chronic heart failure; left ventricular dysfunction following myocardial infarction in clinically stable patients; and hypertension',
    patientFriendlyIndication: 'A weakened, failing heart, and the months after a heart attack',
    anatomicalSite:
      'Cardiac myocyte membrane and vascular smooth muscle — the beta-1 receptor on the heart and the alpha-1 receptor on the artery wall',
    conditionContext: {
      conditionExplainer:
        'In heart failure the pump empties too little with each beat. The body reads this as blood loss and switches on the adrenaline system permanently: faster heart, tighter arteries, retained salt. Those responses buy days and cost years, because sustained adrenergic drive kills heart muscle cells and remodels the chamber into a thinner, rounder, worse pump.',
      whyItMatters:
        'For thirty years beta-blockers were considered contraindicated in heart failure, on the reasoning that a failing pump needs all the adrenergic support it can get. That reasoning was correct about the short term and wrong about the long term, and reversing it is one of the largest changes of mind in modern cardiology.',
      whoTakesThis:
        'Adults with chronic heart failure across the full severity range, adults with reduced ejection fraction after a myocardial infarction, and adults with high blood pressure. Not people in decompensated failure needing intravenous inotropes, and not people with asthma.',
      clinicalGoals:
        'Staying alive and staying out of hospital. Unusually for this group, those are the endpoints the trials actually measured rather than a surrogate — though the trial that established the drug measured them by accident rather than by design.',
    },
    oneSentenceVerdict:
      'A non-selective beta-blocker that also blocks the alpha-1 receptor, which cut deaths by 35% in 2,289 patients with severe heart failure in COPERNICUS and beat metoprolol tartrate on mortality in COMET — and which reached the United States market despite failing its prespecified exercise endpoint in three of four registration trials, on a mortality signal that no single trial had been designed to test.',
    laymanHowItWorks:
      'A failing heart is drowned in adrenaline, and the adrenaline that keeps it beating hard today wears it out over years. Carvedilol blocks the receptors adrenaline uses on heart muscle, so the heart beats slower and with less strain and the muscle stops being flogged. It also blocks a second kind of receptor on artery walls, so the arteries widen and the weakened heart has less resistance to push against. The first few weeks feel worse rather than better, because the heart temporarily loses support it had come to rely on.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0214 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 88 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 14 September 1995 under NDA 020297 and generic since 2007. At about two United States cents a tablet it is one of the cheapest life-extending drugs in existence, which is worth stating alongside the fact that the trials establishing it cost hundreds of millions of dollars to run.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The realistic alternatives are the other two beta-blockers with their own heart failure mortality trials, and the choice between them is not a coin toss: each was tested in a different population, and COMET is the one head-to-head trial in the group. Nothing sold as a food or supplement replaces a beta-blocker in heart failure, and stopping one abruptly is dangerous in a way that stopping most drugs is not.',
      conventionalRx: [
        {
          name: 'Bisoprolol (Zebeta, Cardicor)',
          class: 'Beta-1 selective adrenergic blocker',
          howItCompares:
            'Selective for the beta-1 receptor, so it does not carry carvedilol alpha-blocking vasodilatation and does not lower blood pressure as much. In CIBIS-II, 2,647 patients in NYHA class III or IV had all-cause mortality of 11.8% against 17.3% on placebo (HR 0.66, 95% CI 0.54 to 0.81, p<0.0001) and the trial was stopped early.',
          typicalCost:
            'US$0.2096 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: beta-1 selectivity means less bronchospasm risk and less postural hypotension; once daily. Cons: CIBIS-II excluded severe class IV instability and its authors said so explicitly; no alpha blockade, so less blood pressure effect where that is also wanted.',
        },
        {
          name: 'Metoprolol succinate extended release (Toprol-XL)',
          class: 'Beta-1 selective adrenergic blocker, controlled-release formulation',
          howItCompares:
            'In MERIT-HF, 3,991 patients on metoprolol CR/XL titrated to 200 mg once daily had all-cause mortality of 7.2% per patient-year against 11.0% on placebo (RR 0.66, 95% CI 0.53 to 0.81, p=0.00009). This is the formulation and target dose with the mortality evidence, and it is not the one COMET compared carvedilol against.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: once daily, beta-1 selective, mortality benefit of the same magnitude as carvedilol against placebo. Cons: the immediate-release tartrate salt is a different drug clinically and is often substituted for it; MERIT-HF was stopped early at a mean follow-up of one year.',
        },
        {
          name: 'Sacubitril / valsartan (Entresto)',
          class: 'Angiotensin receptor-neprilysin inhibitor',
          howItCompares:
            'Not a substitute but the drug added on top. In PARADIGM-HF, 8,442 patients with reduced ejection fraction — 93% of whom were already on a beta-blocker — had a primary composite event rate of 21.8% against 26.5% on enalapril (HR 0.80, 95% CI 0.73 to 0.87, p<0.001).',
          typicalCost:
            'US$0.5291 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 100 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: benefit on top of a beta-blocker and an ACE inhibitor, the largest single trial in the field. Cons: far more expensive; hypotension and angioedema; replaces the ACE inhibitor rather than the beta-blocker.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Never stop it suddenly',
          action:
            'If you want to come off it, or run out, say so before the tablets stop rather than after.',
          patientImpact:
            'The label warns that severe exacerbation of angina, myocardial infarction and ventricular arrhythmias have been reported after abrupt discontinuation of beta-blockers, sometimes without any warning worsening of angina first. It directs that discontinuation be spread over one to two weeks.',
          clinicalPrecaution:
            'The label extends this caution to people taking carvedilol only for blood pressure or heart failure, on the reasoning that coronary disease is common and often unrecognised.',
        },
        {
          name: 'Expect the first few weeks to feel worse',
          action:
            'Report tiredness, dizziness or breathlessness during up-titration rather than stopping the tablet.',
          patientImpact:
            'Bradycardia occurred in about 9% of heart failure patients in trials, and hypotension or postural hypotension in 9.7% with syncope in 3.4%, against 3.6% and 2.5% on placebo. Worsening heart failure and fluid retention during titration are recognised in the label and are managed by adjusting dose, not by abandoning the drug.',
          clinicalPrecaution:
            'This is the central paradox of the drug: the short-term effect is negative inotropy and the long-term effect is the opposite. Judging it by week two is judging the wrong thing.',
        },
        {
          name: 'Say if you have asthma, or wheeze at all',
          action:
            'Mention any history of asthma, wheeze or bronchospastic lung disease before the first tablet.',
          patientImpact:
            'Bronchial asthma is an absolute contraindication. The label records that deaths from status asthmaticus have been reported following single doses of carvedilol.',
          clinicalPrecaution:
            'Carvedilol is non-selective, so it blocks the beta-2 receptors that keep airways open as well as the beta-1 receptors on the heart. A beta-1 selective agent is a different risk profile, not a safe one.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'COC1=CC=CC=C1OCCNCC(COC2=CC=CC3=C2C4=CC=CC=C4N3)O',
      chemicalFormula: 'C24H26N2O4',
      molecularWeight: '406.50 g/mol',
      targetReceptorAffinity:
        'A racemate in which the two enantiomers do different jobs. Non-selective beta-adrenoceptor blockade resides in the S(-) enantiomer; alpha-1 adrenergic blockade resides in both R(+) and S(-) at equal potency. The label records no intrinsic sympathomimetic activity, which distinguishes it from the beta-blockers that failed in heart failure.',
      structureSource: {
        label:
          'PubChem CID 2585 (carvedilol) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2585',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'cvd-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity and enantiomeric ratio of the racemate',
          description:
            'Confirm that the material is a true 50:50 racemate rather than an enriched mixture, because the two enantiomers carry different pharmacology: beta blockade lives only in S(-) while alpha-1 blockade is equal in both. A batch skewed toward R(+) would still assay as carvedilol and would be a weaker beta-blocker.',
          reagentsAndBuffer:
            'Carvedilol reference standard, chiral HPLC on a polysaccharide stationary phase, 1H NMR in DMSO-d6, ultraviolet detection at 240 and 285 nanometres, Karl Fischer titration',
        },
        {
          id: 'cvd-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Epoxide opening between the carbazole and the aryloxyethylamine',
          description:
            'Couple 4-(oxiran-2-ylmethoxy)-9H-carbazole to 2-(2-methoxyphenoxy)ethylamine. The epoxide is opened at the less hindered carbon to give the secondary alcohol that every beta-blocker in this family carries, and the carbazole ring is the part responsible for the compound antioxidant behaviour in vitro.',
          dependsOnStepId: 'cvd-w1',
          reagentsAndBuffer:
            '4-(2,3-epoxypropoxy)carbazole, 2-(2-methoxyphenoxy)ethylamine, isopropanol or toluene at reflux under nitrogen, reaction monitored by thin-layer chromatography',
        },
        {
          id: 'cvd-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Removal of the bis-alkylated impurity and crystallisation',
          description:
            'The secondary amine formed in the coupling can react with a second epoxide, giving a tertiary bis-adduct that is inactive and difficult to remove late. Purification targets that impurity specifically, then crystallises the free base.',
          dependsOnStepId: 'cvd-w2',
          reagentsAndBuffer:
            'Silica chromatography with dichloromethane and methanol gradient, crystallisation from ethyl acetate or isopropanol, HPLC with a specified limit for the bis-alkylated impurity',
        },
        {
          id: 'cvd-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Receptor occupancy in a cell line expressing human beta-1 and alpha-1A',
          description:
            'Dose cells expressing each receptor separately and confirm that the same batch blocks both. Testing only the beta receptor would miss the entire alpha-blocking half of the molecule, which is what separates carvedilol from the beta-1 selective agents in blood pressure effect and in postural hypotension.',
          dependsOnStepId: 'cvd-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human ADRB1, ADRB2 or ADRA1A, isoproterenol or phenylephrine as agonist, cyclic AMP or calcium flux readout, assay buffer with bovine serum albumin to limit non-specific binding',
        },
        {
          id: 'cvd-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Functional antagonism and Schild analysis on isolated tissue',
          description:
            'Measure the shift in the agonist concentration-response curve on isolated atrium for beta-1 and on aortic ring for alpha-1, and derive the antagonist affinity. A Schild slope near unity confirms competitive antagonism; a shallower slope points at a second site or at insurmountable binding, and that distinction changes how the drug behaves under high sympathetic drive.',
          dependsOnStepId: 'cvd-w4',
          reagentsAndBuffer:
            'Isolated guinea-pig right atrium and rat thoracic aortic rings in Krebs-Henseleit buffer at 37 degrees Celsius, cumulative isoproterenol and phenylephrine concentration-response curves, isometric force transducers',
        },
      ],
    },
    keyAudits: [
      {
        id: 'cvd-a1',
        category: 'measured',
        title:
          'COPERNICUS: 35% fewer deaths in the sickest patients ever randomised to a beta-blocker',
        laymanSummary:
          'Patients with symptoms at rest and a pumping fraction under a quarter — the group beta-blockers were supposed to be most dangerous in — were randomised to carvedilol or a dummy tablet. A third fewer died on the drug.',
        technicalDetails:
          'COPERNICUS randomised 2,289 patients with symptoms of heart failure at rest or on minimal exertion, clinically euvolemic, with ejection fraction below 25%: 1,156 to carvedilol and 1,133 to placebo, for a mean of 10.4 months. There were 130 deaths on carvedilol against 190 on placebo, a 35% reduction in risk of death (95% CI 19 to 48, p=0.00013 unadjusted, p=0.0014 adjusted for interim analyses). Death or hospitalisation occurred in 425 against 507, a 24% reduction (95% CI 13 to 33, p<0.001). Fewer patients withdrew on carvedilol than on placebo (p=0.02). Patients requiring intensive care, with marked fluid retention, or on intravenous vasodilators or inotropes were excluded.',
        evidenceSource: 'Packer M et al., N Engl J Med 2001;344:1651-1658 (COPERNICUS)',
        doi: '10.1056/NEJM200105313442201',
        measuredMetric: 'All-cause mortality against placebo in severe heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'cvd-a2',
        category: 'measured',
        title: 'COMET: fewer deaths than on metoprolol, over an average of five years',
        laymanSummary:
          'Three thousand patients were randomised to carvedilol or to metoprolol and followed for nearly five years. Thirty-four percent of the carvedilol group died against forty percent of the metoprolol group. The combined measure of death or any hospital admission showed no difference.',
        technicalDetails:
          'COMET randomised 1,511 patients to carvedilol at a target of 25 mg twice daily and 1,518 to metoprolol tartrate at a target of 50 mg twice daily, in chronic heart failure with NYHA class II to IV, ejection fraction below 0.35 and a previous cardiovascular admission. Mean study duration was 58 months. All-cause mortality was 512 of 1,511 (34%) against 600 of 1,518 (40%), hazard ratio 0.83 (95% CI 0.74 to 0.93, p=0.0017), consistent across predefined subgroups. The co-primary composite of mortality or all-cause admission occurred in 1,116 (74%) against 1,160 (76%), hazard ratio 0.94 (95% CI 0.86 to 1.02, p=0.122) — not significant. Side effects and drug withdrawals did not differ much between groups.',
        evidenceSource: 'Poole-Wilson PA et al., Lancet 2003;362:7-13 (COMET)',
        doi: '10.1016/S0140-6736(03)13800-7',
        measuredMetric:
          'All-cause mortality and the composite of mortality or all-cause admission, carvedilol against metoprolol tartrate',
        auditFlag: 'verified',
      },
      {
        id: 'cvd-a3',
        category: 'failed',
        title: 'The registration programme failed its own prespecified endpoint',
        laymanSummary:
          'The four American trials were designed around how far patients could exercise. In three of them exercise was no better on carvedilol than on placebo. The drug was approved on a death count that was collected across the whole programme rather than being any one trial primary question.',
        technicalDetails:
          'Fisher summarises the record: carvedilol did not meet the FDA two-positive-trial paradigm, because an exercise endpoint was not statistically different from placebo in three of the four United States trials. Most other endpoints were highly significant, and death, which was monitored across the whole United States programme rather than as a single trial primary endpoint, differed at p<0.0001. In the pooled programme of 1,094 patients, mortality was 7.8% on placebo against 3.2% on carvedilol, a 65% risk reduction (95% CI 39 to 80, p<0.001), which led the Data and Safety Monitoring Board to recommend early termination. The number quoted for this drug ever since — a 65% mortality reduction — comes from an analysis across four differently designed protocols, terminated early, that no individual trial was powered to make.',
        evidenceSource:
          'Fisher LD. Carvedilol and the Food and Drug Administration (FDA) approval process: the FDA paradigm and reflections on hypothesis testing. Control Clin Trials 1999;20:16-39; Packer M et al., N Engl J Med 1996;334:1349-1355',
        doi: '10.1016/s0197-2456(98)00054-3',
        measuredMetric:
          'Prespecified exercise endpoint, which was not different from placebo in three of four United States trials',
        auditFlag: 'contested',
      },
      {
        id: 'cvd-a4',
        category: 'conclusion_shift',
        title:
          'The same advisory committee looked at the same data twice and decided the opposite way',
        laymanSummary:
          'The FDA expert committee reviewed carvedilol on two occasions and reached opposite conclusions. What changed was not the data but the argument about whether a death count collected outside the trial design can carry an approval.',
        technicalDetails:
          'The carvedilol dossier was evaluated twice by the Cardiovascular and Renal Drugs Advisory Committee of the FDA, and the two meetings produced opposite decisions. Fisher records the crux as the two-positive-trial paradigm: carvedilol failed the exercise endpoint that the trials were built on, while the mortality signal collected across the programme was extremely strong. His conclusion, published alongside a dissenting analysis in the same issue, is that the usual paradigm is very useful but not an absolute principle, and that control of the type I error rate should rarely be violated but must be considered in context. Carvedilol was approved in 1995 and its heart failure benefit was later confirmed by COPERNICUS and by CAPRICORN, which does not retrospectively make the 1995 evidence what it was not.',
        evidenceSource:
          'Fisher LD, Moye LA. Carvedilol and the Food and Drug Administration approval process: an introduction. Control Clin Trials 1999;20:1-15; Fisher LD, Control Clin Trials 1999;20:16-39',
        doi: '10.1016/s0197-2456(98)00052-x',
        inferredClaim:
          'That the 1995 approval rested on trials designed to test survival — it rested on a cross-programme mortality analysis after the designed endpoint failed, and the committee split on whether that was sufficient',
        auditFlag: 'contested',
      },
      {
        id: 'cvd-a5',
        category: 'failed',
        title: 'CAPRICORN missed its primary endpoint and is quoted for a component of it',
        laymanSummary:
          'In patients with a weakened heart after a heart attack, the main measure — dying or being admitted to hospital — was no better on carvedilol. Deaths alone were lower, and that is the number everyone quotes.',
        technicalDetails:
          'CAPRICORN randomised 1,959 patients with proven acute myocardial infarction and ejection fraction at or below 40% to carvedilol or placebo. The primary endpoint, all-cause mortality or hospital admission for cardiovascular problems, occurred in 340 (35%) against 367 (37%), hazard ratio 0.92 (95% CI 0.80 to 1.07) — no difference. All-cause mortality alone was lower: 116 (12%) against 151 (15%), hazard ratio 0.77 (95% CI 0.60 to 0.98, p=0.03). Cardiovascular mortality and non-fatal reinfarction were also lower. A trial that misses its primary endpoint and hits a component of it is hypothesis-generating for that component, and CAPRICORN is routinely cited as though the mortality result were the primary finding.',
        evidenceSource: 'Dargie HJ, Lancet 2001;357:1385-1390 (CAPRICORN)',
        doi: '10.1016/s0140-6736(00)04560-8',
        measuredMetric:
          'Composite of all-cause mortality or cardiovascular hospital admission after myocardial infarction',
        auditFlag: 'caution',
      },
      {
        id: 'cvd-a6',
        category: 'inferred',
        title: 'COMET compared carvedilol against a metoprolol that no mortality trial ever used',
        laymanSummary:
          'Carvedilol beat metoprolol in a head-to-head trial. The metoprolol used was a short-acting salt at fifty milligrams twice a day. The metoprolol with its own survival trial is a different salt, in a slow-release form, at four times that daily dose.',
        technicalDetails:
          'COMET used metoprolol tartrate at a target of 50 mg twice daily. MERIT-HF, the trial that established metoprolol in heart failure, used metoprolol succinate controlled-release at a target of 200 mg once daily in 3,991 patients and reported all-cause mortality of 7.2% per patient-year against 11.0% on placebo (RR 0.66, 95% CI 0.53 to 0.81, p=0.00009). Whether COMET demonstrated that carvedilol is superior to metoprolol, or that 100 mg of tartrate daily is inferior to 200 mg of succinate daily, cannot be settled from COMET, and the trial that would settle it has not been run. The COMET authors state their results suggest carvedilol extends survival compared with metoprolol; the comparator dose is the reason that sentence has been argued about ever since.',
        evidenceSource:
          'Poole-Wilson PA et al., Lancet 2003;362:7-13 (COMET); MERIT-HF Study Group, Lancet 1999;353:2001-2007',
        doi: '10.1016/S0140-6736(03)13800-7',
        inferredClaim:
          'That carvedilol is superior to the beta-blocker class rather than to one dose of one salt of one member of it — an inference the trial design cannot support',
        auditFlag: 'contested',
      },
      {
        id: 'cvd-a7',
        category: 'failed',
        title: 'A contraindication that has killed people',
        laymanSummary:
          'Carvedilol blocks the receptors that keep airways open as well as the ones on the heart. In asthma that is not a caution, it is a bar: the label records deaths from status asthmaticus after single doses.',
        technicalDetails:
          'Bronchial asthma and related bronchospastic conditions are an absolute contraindication, and the label states that deaths from status asthmaticus have been reported following single doses of carvedilol. Other contraindications are second- or third-degree AV block, sick sinus syndrome, severe bradycardia without a pacemaker, cardiogenic shock or decompensated failure requiring intravenous inotropes, and severe hepatic impairment. In trials, bradycardia occurred in about 2% of hypertensive patients, 9% of heart failure patients and 6.5% of post-infarction patients; hypotension and postural hypotension in 9.7% and syncope in 3.4% of mild-to-moderate heart failure patients, against 3.6% and 2.5% on placebo. In diabetes the drug can mask the adrenergic warning symptoms of hypoglycaemia.',
        evidenceSource:
          'Carvedilol United States prescribing information, Contraindications section 4 and Warnings and Precautions 5.1 to 5.6 (NDA 020297)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A failing heart is soaked in adrenaline',
        laymanDesc:
          'When the pump weakens, the body reacts as though blood is being lost: it raises adrenaline, speeds the heart and tightens the arteries. That keeps blood pressure up today and destroys heart muscle over years.',
        molecularDetail:
          'Chronic sympathetic activation drives beta-1 receptor stimulation, calcium overload, myocyte apoptosis and adverse remodelling, along with renin release and salt retention. Circulating noradrenaline concentration is one of the strongest predictors of death in heart failure, which is the observation the whole beta-blocker programme was built on.',
        iconName: 'Flame',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'One molecule, two enantiomers, two jobs',
        laymanDesc:
          'The tablet contains two mirror-image forms of the same molecule. One blocks the heart receptors. Both block the artery receptors. That is why it lowers blood pressure more than a plain beta-blocker.',
        molecularDetail:
          'Carvedilol is a racemate: non-selective beta-adrenoceptor blockade is present only in the S(-) enantiomer, while alpha-1 adrenergic blockade is present in both R(+) and S(-) at equal potency. There is no intrinsic sympathomimetic activity, which distinguishes it from the partial agonists that failed in heart failure trials.',
        iconName: 'Split',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Beta receptors on the heart are covered',
        laymanDesc:
          'With the receptors blocked, adrenaline cannot reach the heart muscle. The rate falls, each beat costs less oxygen, and the muscle stops being driven past what it can sustain.',
        molecularDetail:
          'Beta-1 and beta-2 blockade reduces heart rate, contractility and myocardial oxygen demand, and over months reverses the downregulation of beta-1 receptors that chronic adrenergic drive produces. Ejection fraction typically rises after several months of treatment, having first fallen.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Alpha receptors on the arteries are covered too',
        laymanDesc:
          'The second half of the molecule relaxes the arteries, so the weakened heart has less resistance to push blood against. This is also why the drug can make you dizzy when you stand.',
        molecularDetail:
          'Alpha-1 blockade lowers systemic vascular resistance and afterload. The cost is postural hypotension: hypotension and postural hypotension occurred in 9.7% and syncope in 3.4% of mild-to-moderate heart failure patients in trials, against 3.6% and 2.5% on placebo.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'It feels worse before it works',
        laymanDesc:
          'For the first weeks the heart has lost support it had been leaning on, and people often feel more tired and more breathless. The benefit arrives months later.',
        molecularDetail:
          'Acute negative inotropy transiently reduces cardiac output, and worsening heart failure or fluid retention during up-titration is recognised in the label and managed by dose adjustment. The long-term effect is the opposite of the short-term effect, which is the reason the drug was contraindicated for thirty years.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Over years, fewer deaths',
        laymanDesc:
          'The endpoint here is not a laboratory number. In the severe heart failure trial, a third fewer patients died on carvedilol than on the dummy tablet.',
        molecularDetail:
          'COPERNICUS measured a 35% reduction in all-cause mortality in 2,289 patients (95% CI 19 to 48, p=0.00013) and a 24% reduction in death or hospitalisation. COMET measured 34% against 40% all-cause mortality against metoprolol tartrate over a mean 58 months (HR 0.83, p=0.0017).',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'COPERNICUS (N Engl J Med 2001;344:1651-1658)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2289,
        primaryEndpoint: 'All-cause mortality in severe chronic heart failure',
        endpointMet: true,
        statisticalPValue:
          '35% risk reduction (95% CI 19 to 48), p=0.00013 unadjusted and p=0.0014 adjusted for interim analyses',
        unreportedAdverseSignals:
          'Patients needing intensive care, with marked fluid retention, or on intravenous vasodilators or inotropes were excluded, so the result does not extend to decompensated failure.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'US Carvedilol Heart Failure Program (N Engl J Med 1996;334:1349-1355)',
        phase:
          'Phase 3, four stratified double-blind placebo-controlled protocols analysed together',
        sampleSize: 1094,
        primaryEndpoint:
          'Exercise capacity within each of four protocols; mortality was monitored across the programme rather than as a protocol primary endpoint',
        endpointMet: false,
        statisticalPValue:
          'Exercise endpoint not different from placebo in three of the four United States trials; programme-wide mortality 7.8% against 3.2%, a 65% risk reduction (95% CI 39 to 80), p<0.001',
        unreportedAdverseSignals:
          'Terminated early by the Data and Safety Monitoring Board on the mortality signal. The 65% figure comes from pooling four differently designed protocols on an endpoint none of them was powered for, and the FDA advisory committee reached opposite conclusions on it at two separate meetings.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'COMET (Lancet 2003;362:7-13)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 3029,
        primaryEndpoint:
          'All-cause mortality, and the composite of all-cause mortality or all-cause admission, against metoprolol tartrate',
        endpointMet: true,
        statisticalPValue:
          'Mortality 34% against 40%, HR 0.83 (95% CI 0.74 to 0.93), p=0.0017; composite HR 0.94 (0.86 to 1.02), p=0.122',
        unreportedAdverseSignals:
          'One of the two co-primary endpoints was not met. The comparator was metoprolol tartrate 50 mg twice daily, not the succinate controlled-release 200 mg once daily used in MERIT-HF.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CAPRICORN (Lancet 2001;357:1385-1390)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1959,
        primaryEndpoint:
          'All-cause mortality or hospital admission for cardiovascular problems after myocardial infarction with ejection fraction at or below 40%',
        endpointMet: false,
        statisticalPValue:
          'Primary composite 340 (35%) against 367 (37%), HR 0.92 (95% CI 0.80 to 1.07); all-cause mortality alone 12% against 15%, HR 0.77 (0.60 to 0.98), p=0.03',
        unreportedAdverseSignals:
          'The mortality result is a component of a composite that was not met, and it is the number the trial is universally cited for.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '35% reduction in all-cause mortality in 2,289 patients with severe heart failure in COPERNICUS (95% CI 19 to 48, p=0.00013)',
        'All-cause mortality 34% against 40% versus metoprolol tartrate over a mean 58 months in COMET (HR 0.83, p=0.0017)',
        'All-cause mortality 12% against 15% after myocardial infarction in CAPRICORN (HR 0.77, p=0.03)',
        'Bradycardia in about 9% of heart failure patients, hypotension in 9.7% and syncope in 3.4%, against 3.6% and 2.5% on placebo',
      ],
      unsupportedInferences: [
        'That the 65% mortality reduction quoted from the United States programme came from a trial designed to measure mortality — it came from pooling four protocols whose own exercise endpoint failed',
        'That COMET showed carvedilol superior to the beta-blocker class, when the comparator was one salt of metoprolol at half the daily dose of the formulation with its own mortality trial',
        'That CAPRICORN showed a mortality benefit as its primary result, when its primary composite endpoint was not met',
        'That the alpha-blocking component contributes to the survival benefit — it is a plausible mechanism, and no trial has isolated it',
      ],
      whatFailedInitially: [
        'The prespecified exercise endpoint was not different from placebo in three of the four United States registration trials',
        'The FDA Cardiovascular and Renal Drugs Advisory Committee reviewed the dossier twice and reached opposite decisions',
        'The composite endpoint in COMET, and the primary composite in CAPRICORN, were both missed',
        'Bronchial asthma is an absolute contraindication after deaths from status asthmaticus following single doses',
      ],
      realWorldOutcome: [
        'Approved in the United States on 14 September 1995 under NDA 020297, generic since 2007 and now about two United States cents a tablet',
        'One of three beta-blockers with an independent mortality trial in heart failure, alongside bisoprolol and metoprolol succinate',
        'The reversal it belongs to — from beta-blockers being contraindicated in heart failure to being a cornerstone of it — is among the largest changes of mind in cardiology',
        'Its approval remains the standard teaching case for when regulators should and should not depart from the two-positive-trial rule',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 3.125, 6.25, 12.5 and 25 mg, taken twice daily; an extended-release capsule taken once daily also exists',
      description:
        'Taken with food, which slows absorption and reduces the orthostatic hypotension that follows a peak concentration. Extensive first-pass metabolism by CYP2D6 and CYP2C9 means exposure varies several-fold between people by genotype, and the label directs that discontinuation be spread over one to two weeks rather than stopped at once.',
      safetyProfile:
        'Contraindicated in bronchial asthma and related bronchospastic conditions, where deaths from status asthmaticus have been reported after single doses; also in second- or third-degree AV block, sick sinus syndrome, severe bradycardia without a pacemaker, cardiogenic shock or decompensated failure requiring intravenous inotropes, and severe hepatic impairment. Bradycardia, hypotension and worsening heart failure or fluid retention occur during up-titration and are managed by dose reduction. In diabetes it may mask the adrenergic warning symptoms of hypoglycaemia and alter glucose levels.',
    },
    commonQuestions: [
      {
        q: 'Why do I feel worse since starting it?',
        a: 'Because for the first weeks that is what the drug does. A failing heart has been running on adrenaline, and carvedilol takes that support away before the benefit — which comes from the muscle no longer being flogged — has had time to appear. Tiredness, dizziness and more breathlessness during up-titration are recognised in the label and are managed by adjusting the dose rather than by stopping. The evidence that matters was measured over months and years: a 35% reduction in deaths over a mean of ten months in the severe heart failure trial. Judging the drug at week two is judging the phase in which it is expected to feel worst.',
      },
      {
        q: 'Is carvedilol better than the other beta-blockers?',
        a: 'It is the only one to have won a head-to-head trial, and the trial has a real problem. In COMET, 34% of carvedilol patients died against 40% on metoprolol over an average of five years. But the metoprolol used was the tartrate salt at 50 mg twice daily, and the metoprolol with its own survival trial is the succinate controlled-release form at 200 mg once daily — four times the daily dose in a different formulation. So COMET may have shown that carvedilol beats metoprolol, or that it beats an underdosed metoprolol. Bisoprolol and metoprolol succinate each have their own placebo-controlled mortality trial, and all three reduce deaths by a similar margin against placebo.',
        auditNote:
          'The trial that would settle the question — carvedilol against metoprolol succinate at 200 mg — has never been run, and after twenty years is unlikely to be.',
      },
      {
        q: 'Was this drug properly proved before it was approved?',
        a: 'That is exactly what the FDA advisory committee argued about, twice, reaching opposite conclusions. The four American trials were designed around exercise capacity, and in three of them exercise was no better on carvedilol than on placebo. What was extremely strong was mortality, monitored across the whole programme rather than being any single trial primary question: 7.8% deaths on placebo against 3.2% on carvedilol. The statistician who published the FDA account argued that the usual two-positive-trial rule is very useful but not absolute. Later trials — COPERNICUS in severe failure, CAPRICORN after infarction — confirmed the benefit. That confirmation is what makes the drug trustworthy now; it does not change what the 1995 evidence was.',
        auditNote:
          'This is on the page because it is the clearest published example of a regulator departing from its own paradigm, argued in print by the people who made the decision.',
      },
      {
        q: 'Can I take it if I have asthma?',
        a: 'No. Bronchial asthma and related bronchospastic conditions are an absolute contraindication, and the label records deaths from status asthmaticus following single doses of carvedilol. The reason is that carvedilol is non-selective: it blocks the beta-2 receptors that keep airways open as well as the beta-1 receptors on the heart. Beta-1 selective agents such as bisoprolol are a different and lower risk, not an absent one, and that is a decision for a prescriber who knows the lung history.',
      },
      {
        q: 'What happens if I stop taking it?',
        a: 'Not nothing, and this is one of the few drugs where stopping abruptly is dangerous in its own right. The label warns that severe worsening of angina, myocardial infarction and ventricular arrhythmias have been reported after abrupt withdrawal of beta-blockers, sometimes without any warning worsening of angina first, and directs that discontinuation be spread over one to two weeks. It extends that caution to people taking it only for blood pressure, on the reasoning that coronary disease is common and often undiagnosed. Running out of tablets is a reason to contact a prescriber the same week rather than to wait for the next appointment.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Packer M, Coats AJ, Fowler MB, et al. Effect of carvedilol on survival in severe chronic heart failure. N Engl J Med 2001;344:1651-1658 (COPERNICUS)',
        identifier: '10.1056/NEJM200105313442201',
        kind: 'doi',
      },
      {
        label:
          'Packer M, Bristow MR, Cohn JN, et al. The effect of carvedilol on morbidity and mortality in patients with chronic heart failure. N Engl J Med 1996;334:1349-1355',
        identifier: '10.1056/NEJM199605233342101',
        kind: 'doi',
      },
      {
        label:
          'Poole-Wilson PA, Swedberg K, Cleland JG, et al. Comparison of carvedilol and metoprolol on clinical outcomes in patients with chronic heart failure in the Carvedilol Or Metoprolol European Trial (COMET). Lancet 2003;362:7-13',
        identifier: '10.1016/S0140-6736(03)13800-7',
        kind: 'doi',
      },
      {
        label:
          'Dargie HJ. Effect of carvedilol on outcome after myocardial infarction in patients with left-ventricular dysfunction: the CAPRICORN randomised trial. Lancet 2001;357:1385-1390',
        identifier: '10.1016/s0140-6736(00)04560-8',
        kind: 'doi',
      },
      {
        label:
          'Fisher LD. Carvedilol and the Food and Drug Administration (FDA) approval process: the FDA paradigm and reflections on hypothesis testing. Control Clin Trials 1999;20:16-39',
        identifier: '10.1016/s0197-2456(98)00054-3',
        kind: 'doi',
      },
      {
        label:
          'Fisher LD, Moye LA. Carvedilol and the Food and Drug Administration approval process: an introduction. Control Clin Trials 1999;20:1-15',
        identifier: '10.1016/s0197-2456(98)00052-x',
        kind: 'doi',
      },
      {
        label:
          'MERIT-HF Study Group. Effect of metoprolol CR/XL in chronic heart failure: Metoprolol CR/XL Randomised Intervention Trial in Congestive Heart Failure (MERIT-HF). Lancet 1999;353:2001-2007',
        identifier: '10.1016/S0140-6736(99)04440-2',
        kind: 'doi',
      },
      {
        label:
          'The Cardiac Insufficiency Bisoprolol Study II (CIBIS-II): a randomised trial. Lancet 1999;353:9-13',
        identifier: '10023943',
        kind: 'pmid',
      },
      {
        label: 'Drugs@FDA: COREG (carvedilol), NDA 020297 — original approval 14 September 1995',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020297',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — carvedilol, 88 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2585 — carvedilol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2585',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Bisoprolol — a heart failure drug that is not licensed for heart failure in the United
  //    States, and the beta-blocker at the centre of the largest data fabrication in cardiology.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'bisoprolol',
    name: 'Bisoprolol',
    tradeName: 'Zebeta',
    sponsor: 'Teva Branded Pharmaceuticals; originated at E. Merck in Darmstadt',
    targetGene: 'ADRB1',
    targetProtein:
      'Beta-1 adrenergic receptor, blocked selectively at ordinary exposures and non-selectively at high ones',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1992,
    indication:
      'Management of hypertension in adults, alone or in combination with other antihypertensive agents. The United States label carries no heart failure indication, and lists overt cardiac failure as a contraindication',
    patientFriendlyIndication: 'High blood pressure — and, in most of the world, a weakened heart',
    anatomicalSite:
      'Beta-1 adrenergic receptor on the cardiac myocyte membrane and on the juxtaglomerular cells of the kidney',
    conditionContext: {
      conditionExplainer:
        'A beta-1 blocker turns down the adrenaline signal reaching the heart. In high blood pressure that lowers the pressure by slowing the heart and cutting renin release from the kidney. In heart failure it does something different and slower: it stops the chronic adrenergic drive that wears the muscle out.',
      whyItMatters:
        'Bisoprolol is one of only three beta-blockers with a mortality trial of its own in heart failure, and in most of the world it is licensed for that. In the United States it is not: the label covers hypertension only and names overt cardiac failure as a contraindication. Prescribing it for heart failure in the United States is guideline-directed and off-label at the same time.',
      whoTakesThis:
        'Adults with high blood pressure everywhere; adults with heart failure and reduced ejection fraction in the many countries where that indication exists, and in the United States on the strength of CIBIS-II rather than the label.',
      clinicalGoals:
        'A lower blood pressure, which is the licensed endpoint, or staying alive in heart failure, which is the measured endpoint of the trial the drug is famous for and is not what its United States label is about.',
    },
    oneSentenceVerdict:
      'A beta-1 selective blocker that cut all-cause mortality from 17.3% to 11.8% in 2,647 patients with severe heart failure in CIBIS-II, after its own earlier trial in 641 patients had missed survival entirely at p=0.22 — and whose most-cited use, before non-cardiac surgery, rested on a family of trials later judged not secure by the meta-analysts who then found a 27% increase in perioperative deaths in the trials that survived.',
    laymanHowItWorks:
      'Adrenaline speeds the heart and raises blood pressure by landing on a receptor called beta-1, which sits mostly on heart muscle and on the kidney cells that release the hormone that tightens arteries. Bisoprolol covers that receptor and leaves the closely related beta-2 receptor in the lungs largely alone, at least at ordinary strengths. The heart beats slower and less forcefully, the kidney releases less renin, and blood pressure falls. In a failing heart the useful part is different: removing the constant adrenaline drive lets the muscle stop wearing itself out.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 84,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.2096 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1992 and generic for decades. Bisoprolol appears on the WHO Model List of Essential Medicines as a representative beta-blocker. The United States price is about ten times that of carvedilol per tablet, which reflects the number of manufacturers rather than anything about the molecules.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For heart failure the alternatives are the two other beta-blockers with their own mortality trials, and they are genuinely different drugs: carvedilol also blocks alpha-1 receptors and lowers blood pressure more, metoprolol succinate is beta-1 selective like bisoprolol but only in its controlled-release form. For hypertension alone, beta-blockers are no longer first-line in most guidelines, and the honest comparison is against the drug classes that displaced them.',
      conventionalRx: [
        {
          name: 'Carvedilol (Coreg)',
          class: 'Non-selective beta-blocker with alpha-1 blockade',
          howItCompares:
            'The one head-to-head beta-blocker trial in heart failure is COMET, and it compared carvedilol against metoprolol tartrate rather than against bisoprolol. Against placebo the two are similar: 35% mortality reduction in COPERNICUS against 34% in CIBIS-II, in different populations.',
          typicalCost:
            'US$0.0214 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 88 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a tenth the price; carries a United States heart failure indication that bisoprolol does not; more blood pressure effect. Cons: twice daily; non-selective, so absolutely contraindicated in asthma; more postural hypotension.',
        },
        {
          name: 'Metoprolol succinate extended release (Toprol-XL)',
          class: 'Beta-1 selective adrenergic blocker, controlled-release',
          howItCompares:
            'Beta-1 selective like bisoprolol, with its own placebo-controlled mortality trial: MERIT-HF found all-cause mortality of 7.2% per patient-year against 11.0% in 3,991 patients (RR 0.66, 95% CI 0.53 to 0.81, p=0.00009). The magnitude matches CIBIS-II almost exactly.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: a United States heart failure indication, once daily, beta-1 selective. Cons: the immediate-release tartrate salt is frequently substituted and is not the drug that was tested; MERIT-HF was stopped early at a mean of one year.',
        },
        {
          name: 'Amlodipine, or a thiazide-like diuretic, for blood pressure alone',
          class: 'Calcium channel blocker or diuretic',
          howItCompares:
            'For uncomplicated hypertension without heart failure or recent infarction, beta-blockers have been demoted in most guidelines because they prevent stroke less well than the alternatives at equal blood pressure. This is a comparison about outcomes, not about the number on the cuff.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: better stroke prevention per millimetre of mercury in the trial record; no bradycardia, no fatigue, no rebound on stopping. Cons: no benefit in heart failure or after infarction, where the beta-blocker is doing something a vasodilator cannot.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Taper rather than stop',
          action:
            'Do not stop the tablets abruptly, and say if you are running out before you run out.',
          patientImpact:
            'The label warns that exacerbation of angina and, in some cases, myocardial infarction or ventricular arrhythmia have been observed after abrupt cessation of beta-blockers in coronary disease, and advises tapering over approximately one week even in patients without known coronary disease.',
          clinicalPrecaution:
            'The rebound comes from receptors that have been upregulated during blockade being suddenly exposed to circulating catecholamines. It is a pharmacological consequence, not a withdrawal syndrome in the addiction sense.',
        },
        {
          name: 'Say if you have diabetes and use insulin',
          action:
            'Mention insulin or sulfonylurea use, and how you normally notice a low blood sugar.',
          patientImpact:
            'Beta-blockade masks the adrenergic warning signs of hypoglycaemia — tremor, palpitation, anxiety — while leaving sweating intact. The first warning a person is used to may simply not arrive.',
          clinicalPrecaution:
            'Beta-1 selectivity reduces but does not remove this, and selectivity is lost at higher doses. The label states that cardioselectivity is not absolute and that beta-2 receptors are inhibited at 20 mg and above.',
        },
        {
          name: 'Ask which indication you are being treated for',
          action:
            'If it was prescribed for heart failure in the United States, it is worth knowing that this is guideline-directed rather than label-directed.',
          patientImpact:
            'The United States label covers hypertension only and lists overt cardiac failure as a contraindication, while CIBIS-II measured a 34% reduction in deaths in exactly that population. Both statements are true and they are about different documents.',
          clinicalPrecaution:
            'This is not a reason to stop. It is a reason to understand that a label is a regulatory record of what a sponsor applied for, not a summary of what is known.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)NCC(COC1=CC=C(C=C1)COCCOC(C)C)O',
      chemicalFormula: 'C18H31NO4',
      molecularWeight: '325.40 g/mol (free base); dispensed as bisoprolol fumarate',
      targetReceptorAffinity:
        'Beta-1 selective without significant membrane-stabilising activity or intrinsic sympathomimetic activity in the therapeutic range. The label is explicit that cardioselectivity is not absolute: at 20 mg and above bisoprolol also inhibits beta-2 adrenoceptors in bronchial and vascular muscle, so selectivity is a property of the exposure rather than of the molecule alone. Oral bioavailability is about 80%, protein binding about 30%, and the plasma elimination half-life 9 to 12 hours.',
      structureSource: {
        label:
          'PubChem CID 2405 (bisoprolol) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2405',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'bis-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, fumarate stoichiometry and water content',
          description:
            'Confirm the hemifumarate stoichiometry rather than assuming it. Bisoprolol is dispensed as the fumarate at a two-to-one base-to-acid ratio, and a batch at the wrong ratio assays as the right compound while delivering the wrong amount of base per milligram of powder.',
          reagentsAndBuffer:
            'Bisoprolol fumarate reference standard, potentiometric titration for fumarate content, 1H NMR in DMSO-d6, ion chromatography, Karl Fischer titration',
        },
        {
          id: 'bis-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Etherification then epoxide opening with isopropylamine',
          description:
            'Build the para-substituted phenol ether that carries the isopropoxyethoxymethyl side chain, alkylate the phenol with epichlorohydrin to install the epoxide, then open it with isopropylamine to give the aminopropanol that every beta-blocker in this class shares. The side chain is what makes this molecule beta-1 selective rather than another propranolol.',
          dependsOnStepId: 'bis-w1',
          reagentsAndBuffer:
            '4-hydroxybenzyl alcohol derivative, 2-isopropoxyethyl chloride with base, epichlorohydrin with sodium hydroxide, isopropylamine in isopropanol at reflux under nitrogen',
        },
        {
          id: 'bis-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Salt formation and control of the bis-alkylated by-product',
          description:
            'Form the fumarate salt and crystallise. The recurring impurity in this chemistry is the tertiary amine from a second epoxide opening, which is pharmacologically inert and hard to remove once carried forward, so it is controlled at this step rather than at release.',
          dependsOnStepId: 'bis-w2',
          reagentsAndBuffer:
            'Fumaric acid in ethanol or isopropanol, crystallisation with controlled cooling, HPLC with a specified limit for the bis-alkylated impurity and for residual isopropylamine',
        },
        {
          id: 'bis-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Selectivity ratio measured on beta-1 and beta-2 in parallel',
          description:
            'Run the same batch against cells expressing human beta-1 and human beta-2 across a full concentration range, not at a single concentration. Selectivity here is a ratio that collapses as exposure rises, and a single-point assay reports a property the drug only has at low dose.',
          dependsOnStepId: 'bis-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human ADRB1 or ADRB2, isoproterenol as agonist, cyclic AMP accumulation readout, assay buffer with a phosphodiesterase inhibitor',
        },
        {
          id: 'bis-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Functional chronotropy against tracheal relaxation',
          description:
            'Quantify the separation between the wanted effect and the unwanted one on tissue: blockade of isoproterenol-induced rate increase on isolated atrium against blockade of isoproterenol-induced tracheal relaxation. The gap between those two curves is the entire clinical argument for a cardioselective agent, and it is measurable rather than assumed.',
          dependsOnStepId: 'bis-w4',
          reagentsAndBuffer:
            'Guinea-pig isolated right atrium and tracheal strips in Krebs-Henseleit buffer at 37 degrees Celsius, cumulative isoproterenol curves, isometric force transducers and rate counters',
        },
      ],
    },
    keyAudits: [
      {
        id: 'bis-a1',
        category: 'measured',
        title: 'CIBIS-II: a third fewer deaths, and the trial was stopped early because of it',
        laymanSummary:
          'Two and a half thousand patients with severe heart failure were randomised to bisoprolol or a dummy tablet. Deaths fell from about one in six to about one in eight, and sudden deaths nearly halved. The trial was stopped before its planned end.',
        technicalDetails:
          'CIBIS-II randomised 2,647 symptomatic patients in NYHA class III or IV with ejection fraction 35% or less, on standard diuretic and ACE inhibitor therapy, to bisoprolol titrated to a maximum of 10 mg daily or placebo, followed for a mean of 1.3 years. All-cause mortality was 156 (11.8%) against 228 (17.3%), hazard ratio 0.66 (95% CI 0.54 to 0.81, p<0.0001). Sudden deaths were 48 (3.6%) against 83 (6.3%), hazard ratio 0.56 (95% CI 0.39 to 0.80, p=0.0011). Treatment effects were independent of the severity or cause of heart failure. The trial was stopped after the second interim analysis. The authors state explicitly that the results should not be extrapolated to patients with severe class IV symptoms and recent instability, because safety and efficacy were not established there.',
        evidenceSource: 'CIBIS-II Investigators and Committees, Lancet 1999;353:9-13',
        doi: '10.1016/S0140-6736(98)11181-9',
        measuredMetric: 'All-cause mortality against placebo in chronic heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'bis-a2',
        category: 'failed',
        title: 'CIBIS-I found the same benefit and could not prove it',
        laymanSummary:
          'The first bisoprolol trial, five years earlier, was too small. Fifty-three patients died on the drug against sixty-seven on placebo — the right direction, and nowhere near statistically convincing. The authors wrote that a survival benefit remained to be demonstrated.',
        technicalDetails:
          'CIBIS randomised 641 patients with chronic heart failure and ejection fraction below 40%, 95% in NYHA class III, to bisoprolol (n=320) or placebo (n=321) for a mean 1.9 years. Deaths were 53 against 67; the difference did not reach significance (p=0.22, relative risk 0.80, 95% CI 0.56 to 1.15). Sudden deaths were 15 against 17 and deaths from documented ventricular arrhythmia 4 against 7, neither significant. Functional endpoints did separate: fewer hospitalisations for cardiac decompensation (61 against 90, p<0.01) and more patients improving by at least one NYHA class (68 against 48, p=0.04). The conclusion reads: improvement in survival while on beta-blockade remains to be demonstrated. Reading a positive result into CIBIS-I because CIBIS-II later succeeded is the error the trial record exists to prevent.',
        evidenceSource: 'CIBIS Investigators and Committees, Circulation 1994;90:1765-1773',
        doi: '10.1161/01.cir.90.4.1765',
        measuredMetric: 'All-cause mortality against placebo, underpowered at 641 patients',
        auditFlag: 'verified',
      },
      {
        id: 'bis-a3',
        category: 'conclusion_shift',
        title:
          'The perioperative evidence was fabricated, and the surviving trials point the other way',
        laymanSummary:
          'For a decade, guidelines on two continents told surgeons to start a beta-blocker before an operation, largely on a family of Dutch trials. Those trials were found not to be secure. When the remaining honest trials were pooled, starting a beta-blocker before surgery came out associated with more deaths, not fewer.',
        technicalDetails:
          'Bouri and colleagues analysed the randomised trials of beta-blocker initiation before non-cardiac surgery, separating the DECREASE family — which they describe as no longer secure — from the rest. Nine secure trials totalling 10,529 patients with 291 deaths met criteria. Initiation of a course of beta-blockers before surgery was associated with a 27% increase in 30-day all-cause mortality (p=0.04). The DECREASE studies substantially contradict the secure meta-analysis on mortality (p=0.05 for divergence). Among the secure trials, beta-blockade reduced non-fatal myocardial infarction (RR 0.73, p=0.001) while increasing stroke (RR 1.73, p=0.05) and hypotension (RR 1.51, p<0.00001); these results were dominated by one large trial. The authors conclusion is unusually direct: guideline bodies should retract their recommendations based on fictitious data without further delay. The original DECREASE report had described 112 randomised vascular surgery patients with cardiac death in 3.4% on bisoprolol against 17% on standard care (p=0.02) and non-fatal infarction in 0% against 17% (p<0.001).',
        evidenceSource:
          'Bouri S, Shun-Shin MJ, Cole GD, Mayet J, Francis DP. Meta-analysis of secure randomised controlled trials of beta-blockade to prevent perioperative death in non-cardiac surgery. Heart 2014;100:456-464; Poldermans D et al., N Engl J Med 1999;341:1789-1794 (DECREASE)',
        doi: '10.1136/heartjnl-2013-304262',
        inferredClaim:
          'That starting a beta-blocker before non-cardiac surgery prevents perioperative death — an inference built on trials the field no longer treats as secure, and reversed in sign when only the secure trials are pooled',
        auditFlag: 'retracted',
      },
      {
        id: 'bis-a4',
        category: 'inferred',
        title: 'The United States label contradicts the way the drug is used',
        laymanSummary:
          'In the United States this drug is licensed for blood pressure only, and its label names overt heart failure as a reason not to give it. It is nevertheless recommended for heart failure by United States guidelines, on the strength of a European trial.',
        technicalDetails:
          'The United States prescribing information states that bisoprolol fumarate tablets are indicated in the management of hypertension, alone or in combination. Contraindications include overt cardiac failure. The Warnings section reads that beta-blocking agents should in general be avoided in patients with overt congestive failure and, where necessary in compensated failure, used cautiously. CIBIS-II, conducted in Europe, measured a 34% reduction in all-cause mortality in exactly the population the label warns about. Bisoprolol carries heart failure indications in many other jurisdictions. Nothing here is a contradiction in the evidence; it is a gap between what a sponsor applied for in one country and what the evidence shows, and it means every United States heart failure prescription of bisoprolol is off-label.',
        evidenceSource:
          'Bisoprolol fumarate United States prescribing information, Indications and Usage, Contraindications and Warnings sections; CIBIS-II Investigators, Lancet 1999;353:9-13',
        inferredClaim:
          'That an absent indication means absent evidence — the United States label reflects a regulatory filing history, and the mortality evidence for heart failure exists independently of it',
        auditFlag: 'caution',
      },
      {
        id: 'bis-a5',
        category: 'failed',
        title: 'CIBIS-III proved non-inferiority in one analysis and not in the other',
        laymanSummary:
          'A trial asked whether heart failure treatment can start with the beta-blocker instead of the usual first drug. In the main analysis the answer was yes. In the stricter analysis — the one that matters most for this kind of question — it was not proven.',
        technicalDetails:
          'CIBIS-III randomised 1,010 patients with mild to moderate heart failure and ejection fraction at or below 35%, on no ACE inhibitor, beta-blocker or angiotensin receptor blocker, to six months of open-label bisoprolol or enalapril monotherapy followed by the combination. Non-inferiority required the upper bound of the 95% CI for the absolute difference to be below 5%, corresponding to a hazard ratio of 1.17. In the intention-to-treat sample the primary composite of all-cause mortality or hospitalisation occurred in 178 against 186 (HR 0.94, 95% CI 0.77 to 1.16) — the bound was met. In the per-protocol sample it occurred in 163 against 165 (HR 0.97, 95% CI 0.78 to 1.21) — the bound was not met. For a non-inferiority trial the per-protocol analysis is the conservative one, because dropouts and crossovers push an intention-to-treat result toward no difference, which is the direction non-inferiority wants. The authors state that non-inferiority was not proven in the per-protocol analysis and that the results indicate it may be as safe and efficacious to start with bisoprolol.',
        evidenceSource: 'Willenheimer R et al., Circulation 2005;112:2426-2435 (CIBIS III)',
        doi: '10.1161/CIRCULATIONAHA.105.582320',
        measuredMetric:
          'Composite of all-cause mortality or hospitalisation, bisoprolol-first against enalapril-first, against a non-inferiority margin of HR 1.17',
        auditFlag: 'caution',
      },
      {
        id: 'bis-a6',
        category: 'inferred',
        title: 'Cardioselectivity is a property of the dose, not of the drug',
        laymanSummary:
          'Bisoprolol is described as heart-selective, which is why it is used where a non-selective beta-blocker would be dangerous. The label says selectivity is not absolute and is lost at higher strengths.',
        technicalDetails:
          'The label describes bisoprolol as a beta-1 selective adrenoceptor blocking agent without significant membrane-stabilising or intrinsic sympathomimetic activity in its therapeutic range, then adds that cardioselectivity is not absolute and that at 20 mg and above it also inhibits beta-2 adrenoceptors, chiefly in bronchial and vascular musculature, so the lowest effective dose is needed to retain selectivity. The practical consequence is that the safety argument for using a cardioselective beta-blocker in someone with airway disease weakens as the dose is titrated up, and there is no threshold at which it stops applying and starts not applying.',
        evidenceSource:
          'Bisoprolol fumarate United States prescribing information, Clinical Pharmacology section',
        inferredClaim:
          'That a cardioselective beta-blocker is safe in airway disease at any dose — selectivity is a ratio that narrows with exposure, and the label says so',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed and almost entirely absorbed',
        laymanDesc:
          'The tablet is taken once a day. Almost all of it reaches the bloodstream, food does not change that, and it lasts long enough that one dose covers a day.',
        molecularDetail:
          'Absolute bioavailability after a 10 mg oral dose is about 80% with only about 20% first-pass metabolism; absorption is unaffected by food. Serum protein binding is about 30%, peak concentration comes at 2 to 4 hours, and the plasma elimination half-life is 9 to 12 hours with steady state within 5 days. Clearance is split roughly evenly between renal and hepatic routes, which is why neither organ failing alone transforms the exposure.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'It covers the heart receptor and mostly spares the lung one',
        laymanDesc:
          'Adrenaline works through two similar receptors: one mainly on the heart, one mainly on airways and blood vessels. This drug binds the heart one much more tightly, which is why it is chosen when a lung is a concern.',
        molecularDetail:
          'Competitive antagonism at the beta-1 adrenoceptor with a large selectivity ratio over beta-2, and no intrinsic sympathomimetic or membrane-stabilising activity. The label states the selectivity is not absolute and that beta-2 blockade appears at 20 mg and above.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'The heart slows and the kidney stops shouting',
        laymanDesc:
          'With the receptor covered the heart beats slower and less hard. Separately, the kidney stops releasing the hormone that starts the chain tightening the arteries.',
        molecularDetail:
          'Beta-1 blockade reduces heart rate, contractility and cardiac output acutely, and suppresses renin release from juxtaglomerular cells, lowering angiotensin II and aldosterone. The blood pressure effect builds over days as vascular resistance, which rises briefly at the start, settles back.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'In a failing heart, the useful part is what stops happening',
        laymanDesc:
          'A weak heart is kept going by constant adrenaline, and that constant drive is itself destroying the muscle. Blocking it does nothing helpful this week and a great deal over a year.',
        molecularDetail:
          'Chronic beta-1 blockade interrupts catecholamine-mediated myocyte apoptosis and adverse remodelling and reverses receptor downregulation. In CIBIS-II the mortality curves separate after the first months, and sudden death — the mode most directly tied to adrenergic drive — fell proportionally more than total death: 3.6% against 6.3%.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Stopping suddenly is its own risk',
        laymanDesc:
          'Receptors multiply while they are being blocked. Removing the block all at once exposes a larger number of them to normal adrenaline, which can trigger angina or worse.',
        molecularDetail:
          'The label records exacerbation of angina and, in some instances, myocardial infarction or ventricular arrhythmia after abrupt cessation in coronary disease, and advises tapering over approximately one week even without known coronary disease. This is receptor upregulation rather than dependence.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the label does not say',
        laymanDesc:
          'In the United States this drug is licensed for blood pressure and warns against use in overt heart failure. The trial it is famous for measured a third fewer deaths in exactly that condition.',
        molecularDetail:
          'CIBIS-II reported all-cause mortality of 11.8% against 17.3% (HR 0.66, 95% CI 0.54 to 0.81) in NYHA class III and IV. The United States label lists overt cardiac failure under Contraindications. The two documents are describing different things: one is an evidence base, the other a filing history.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CIBIS-II (Lancet 1999;353:9-13)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 2647,
        primaryEndpoint: 'All-cause mortality in NYHA class III or IV heart failure',
        endpointMet: true,
        statisticalPValue:
          '11.8% against 17.3%; hazard ratio 0.66 (95% CI 0.54 to 0.81), p<0.0001; sudden death HR 0.56 (0.39 to 0.80), p=0.0011',
        unreportedAdverseSignals:
          'Stopped early at the second interim analysis. The authors state the results should not be extrapolated to severe class IV patients with recent instability, in whom safety and efficacy were not established.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CIBIS-I (Circulation 1994;90:1765-1773)',
        phase: 'Phase 3, multicentre, randomised, double-blind, placebo-controlled',
        sampleSize: 641,
        primaryEndpoint: 'All-cause mortality in chronic heart failure',
        endpointMet: false,
        statisticalPValue:
          '53 deaths against 67; relative risk 0.80 (95% CI 0.56 to 1.15), p=0.22 over a mean 1.9 years',
        unreportedAdverseSignals:
          'Functional endpoints separated while survival did not: hospitalisation for decompensation 61 against 90 (p<0.01) and NYHA class improvement in 68 against 48 (p=0.04). A trial can be right about the mechanism and unable to demonstrate the outcome.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'CIBIS-III (Circulation 2005;112:2426-2435)',
        phase: 'Phase 4, randomised, open-label monotherapy phase with blinded endpoint comparison',
        sampleSize: 1010,
        primaryEndpoint:
          'Composite of all-cause mortality or hospitalisation, bisoprolol-first against enalapril-first, non-inferiority margin HR 1.17',
        endpointMet: false,
        statisticalPValue:
          'Intention-to-treat HR 0.94 (95% CI 0.77 to 1.16) met the margin; per-protocol HR 0.97 (95% CI 0.78 to 1.21) did not',
        unreportedAdverseSignals:
          'For a non-inferiority question the per-protocol analysis is the conservative one, and it is the analysis that failed. The published conclusion is that non-inferiority was not proven per protocol.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'DECREASE (N Engl J Med 1999;341:1789-1794)',
        phase: 'Randomised, open, perioperative trial in high-risk vascular surgery',
        sampleSize: 112,
        primaryEndpoint:
          'Death from cardiac causes or non-fatal myocardial infarction within 30 days of major vascular surgery',
        endpointMet: true,
        statisticalPValue:
          'Cardiac death 3.4% against 17% (p=0.02) and non-fatal infarction 0% against 17% (p<0.001) in 59 bisoprolol and 53 standard-care patients',
        unreportedAdverseSignals:
          'The DECREASE family of trials is described by the authors of the 2014 meta-analysis as no longer secure. Pooling only the secure trials — 10,529 patients — gives a 27% increase in 30-day all-cause mortality from perioperative beta-blocker initiation, the opposite of this result.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'All-cause mortality 11.8% against 17.3% in 2,647 patients in CIBIS-II (HR 0.66, 95% CI 0.54 to 0.81, p<0.0001)',
        'Sudden death 3.6% against 6.3% in the same trial (HR 0.56, 95% CI 0.39 to 0.80, p=0.0011)',
        'No significant survival difference in the 641-patient CIBIS-I (RR 0.80, 95% CI 0.56 to 1.15, p=0.22)',
        'A 27% increase in 30-day all-cause mortality from perioperative beta-blocker initiation across 9 secure trials in 10,529 patients (p=0.04)',
      ],
      unsupportedInferences: [
        'That bisoprolol prevents perioperative death, which rested on a trial family the meta-analysts describe as no longer secure',
        'That the absence of a United States heart failure indication means the heart failure evidence is weak',
        'That CIBIS-III established bisoprolol-first as non-inferior, when the per-protocol analysis did not meet the margin',
        'That cardioselectivity makes the drug safe in airway disease at any dose — the label states selectivity is lost at 20 mg and above',
      ],
      whatFailedInitially: [
        'CIBIS-I could not demonstrate a survival benefit at 641 patients and its authors said so',
        'The DECREASE family of perioperative trials was found not secure, and the meta-analysis of what remained reversed the direction of the effect',
        'CIBIS-III failed its non-inferiority margin in the per-protocol analysis',
        'The United States label still contraindicates the drug in the condition its most-cited trial was conducted in',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1992 for hypertension under NDA 019982, and licensed for heart failure across much of the rest of the world',
        'One of three beta-blockers with an independent mortality trial in heart failure, alongside carvedilol and metoprolol succinate',
        'The perioperative episode changed how cardiology guidelines treat single-group evidence, and is cited whenever a guideline rests on one investigator',
        'Listed on the WHO Model List of Essential Medicines as a representative beta-blocker',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 5 and 10 mg, taken once daily; also sold combined with hydrochlorothiazide',
      description:
        'Absorption is about 80% and unaffected by food, and the 9 to 12 hour half-life supports once-daily dosing with steady state in five days. Clearance is divided roughly equally between renal excretion of unchanged drug and hepatic metabolism, so exposure roughly doubles rather than multiplying when either organ is impaired.',
      safetyProfile:
        'Contraindicated in cardiogenic shock, overt cardiac failure, second- or third-degree AV block and marked sinus bradycardia. Abrupt cessation can exacerbate angina and precipitate infarction or ventricular arrhythmia; the label advises tapering over about a week. Beta-1 selectivity is lost at 20 mg and above, so bronchospasm risk rises with dose. It masks the adrenergic warning symptoms of hypoglycaemia in diabetes and may alter glucose levels.',
    },
    commonQuestions: [
      {
        q: 'My doctor prescribed this for heart failure, but the leaflet says not to use it in heart failure. Which is right?',
        a: 'Both, and the conflict is regulatory rather than scientific. In the United States, bisoprolol was only ever filed for high blood pressure, so the label covers hypertension and — following the standard beta-blocker class warning of the era — lists overt cardiac failure as a contraindication. The trial that made bisoprolol a heart failure drug, CIBIS-II, was run in Europe in 2,647 patients with class III and IV symptoms and found deaths fell from 17.3% to 11.8%. Bisoprolol carries a heart failure indication in many other countries and is recommended for it by United States guidelines. Prescribing it for heart failure in the United States is evidence-based and off-label at once. That is worth understanding, and it is not a reason to stop.',
        auditNote:
          'A label is a record of what a company applied for and what a regulator granted. It is not a summary of what is known about a molecule, and the two diverge most for old generic drugs that nobody has an economic reason to re-file.',
      },
      {
        q: 'Should I take a beta-blocker before an operation?',
        a: 'The evidence for starting one before surgery went the other way, and how it went is worth knowing. For years, European and American guidelines recommended starting a beta-blocker before intermediate- or high-risk non-cardiac surgery, largely on a family of Dutch trials called DECREASE. Those trials were found not to be secure. When researchers pooled only the trials that survived scrutiny — nine trials, 10,529 patients, 291 deaths — starting a beta-blocker before surgery was associated with a 27% increase in 30-day mortality, along with fewer non-fatal heart attacks but more strokes and much more hypotension. This is about starting one before surgery. Continuing a beta-blocker you are already established on is a different question with a different answer, and stopping abruptly is itself a known risk.',
        auditNote:
          'The meta-analysis authors wrote that guideline bodies should retract recommendations based on fictitious data without further delay. That sentence is why this record is on the page.',
      },
      {
        q: 'Is bisoprolol safe if I have asthma or COPD?',
        a: 'It is safer than a non-selective beta-blocker and it is not neutral. The label describes bisoprolol as beta-1 selective, then says plainly that cardioselectivity is not absolute and that at 20 mg and above it also blocks the beta-2 receptors in the airways, so the lowest effective dose should be used to keep selectivity. There is no dose below which the selectivity is total. In practice this is a judgement about how bad the airway disease is against how much the heart needs the drug, and it is a judgement that changes if the dose is titrated up.',
      },
      {
        q: 'The first bisoprolol trial did not work. Why do we believe the second one?',
        a: 'Because the first one was too small to answer the question, and it said so. CIBIS-I randomised 641 patients and found 53 deaths on bisoprolol against 67 on placebo — the right direction, p=0.22, and its authors concluded that a survival benefit remained to be demonstrated. CIBIS-II randomised four times as many patients, in a sicker population, and found a 34% reduction in deaths at p<0.0001, strong enough that the trial was stopped early. That is how the process is supposed to work: an underpowered trial that points somewhere is a reason to run a larger trial, not a reason to claim the result. The temptation to read CIBIS-I as positive in hindsight is exactly the error the record guards against.',
      },
      {
        q: 'Why do I feel so tired on it?',
        a: 'Because the drug is doing what it does. A slower, less forceful heart means less cardiac output for a given demand, and that is felt as fatigue and reduced exercise capacity, particularly in the first weeks and particularly in people who were relying on a fast heart rate to compensate. It usually eases. It sometimes does not, and in high blood pressure — where beta-blockers are no longer first-line in most guidelines — that is a reasonable trigger to ask whether a different class would do the same job. In heart failure or after a heart attack the calculation is different, because the benefit being bought is survival rather than a number.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'CIBIS-II Investigators and Committees. The Cardiac Insufficiency Bisoprolol Study II (CIBIS-II): a randomised trial. Lancet 1999;353:9-13',
        identifier: '10023943',
        kind: 'pmid',
      },
      {
        label:
          'CIBIS Investigators and Committees. A randomized trial of beta-blockade in heart failure. The Cardiac Insufficiency Bisoprolol Study (CIBIS). Circulation 1994;90:1765-1773',
        identifier: '10.1161/01.cir.90.4.1765',
        kind: 'doi',
      },
      {
        label:
          'Willenheimer R, van Veldhuisen DJ, Silke B, et al. Effect on survival and hospitalization of initiating treatment for chronic heart failure with bisoprolol followed by enalapril, as compared with the opposite sequence: CIBIS III. Circulation 2005;112:2426-2435',
        identifier: '10.1161/CIRCULATIONAHA.105.582320',
        kind: 'doi',
      },
      {
        label:
          'Bouri S, Shun-Shin MJ, Cole GD, Mayet J, Francis DP. Meta-analysis of secure randomised controlled trials of beta-blockade to prevent perioperative death in non-cardiac surgery. Heart 2014;100:456-464',
        identifier: '10.1136/heartjnl-2013-304262',
        kind: 'doi',
      },
      {
        label:
          'Poldermans D, Boersma E, Bax JJ, et al. The effect of bisoprolol on perioperative mortality and myocardial infarction in high-risk patients undergoing vascular surgery. N Engl J Med 1999;341:1789-1794 (DECREASE)',
        identifier: '10.1056/NEJM199912093412402',
        kind: 'doi',
      },
      {
        label:
          'MERIT-HF Study Group. Effect of metoprolol CR/XL in chronic heart failure (MERIT-HF). Lancet 1999;353:2001-2007',
        identifier: '10.1016/S0140-6736(99)04440-2',
        kind: 'doi',
      },
      {
        label:
          'DailyMed: bisoprolol fumarate tablets United States prescribing information — Indications and Usage, Contraindications, Warnings and Clinical Pharmacology',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22bisoprolol+fumarate%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — bisoprolol, 93 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2405 — bisoprolol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2405',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Nebivolol — sold as the beta-blocker that widens arteries through nitric oxide, by a label
  //    that never mentions nitric oxide and says the mechanism has not been established.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'nebivolol',
    name: 'Nebivolol',
    tradeName: 'Bystolic',
    sponsor:
      'Allergan (current holder of NDA 021742); originated at Janssen and licensed to Mylan and then Forest Laboratories',
    targetGene: 'ADRB1',
    targetProtein:
      'Beta-1 adrenergic receptor, blocked by the d-nebivolol isomer; the l-isomer contributes little at the receptor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2007,
    indication:
      'Treatment of hypertension in adults, to lower blood pressure, alone or in combination with other antihypertensive agents',
    patientFriendlyIndication: 'High blood pressure',
    anatomicalSite:
      'Beta-1 adrenergic receptor on cardiac myocytes; the claimed second site on the vascular endothelium is not in the United States label',
    conditionContext: {
      conditionExplainer:
        'High blood pressure is treated because of what it does over decades rather than because of how it feels. Beta-blockers lower it by slowing the heart and cutting renin release, and their main cost is that a slower heart makes people tired.',
      whyItMatters:
        'Nebivolol was launched as a different kind of beta-blocker: one that also widens arteries, through nitric oxide, and therefore avoids the fatigue and metabolic penalties of the class. That story is scientifically interesting and it is not in the drug’s United States label, which says the antihypertensive mechanism has not been definitively established and does not use the phrase nitric oxide anywhere.',
      whoTakesThis:
        'Adults with high blood pressure. Not people with decompensated heart failure, severe bradycardia, heart block beyond first degree or severe liver impairment, all of which are contraindications.',
      clinicalGoals:
        'A lower number on a cuff. The label states outright that there are no controlled trials demonstrating risk reduction with this drug, so nothing beyond the number has been shown for it in hypertension.',
    },
    oneSentenceVerdict:
      'A beta-1 selective blocker marketed on nitric-oxide-mediated vasodilation that its own FDA label never mentions, whose only outcome trial — SENIORS, in 2,128 patients over 70 — met a composite of death or cardiovascular admission at 31.1% against 35.3% (p=0.039) while all-cause death alone did not differ (15.8% against 18.1%, p=0.21).',
    laymanHowItWorks:
      'Nebivolol blocks the beta-1 receptor that adrenaline uses on heart muscle, so the heart beats slower and less forcefully and the kidney releases less of the hormone that tightens arteries. Blood pressure falls. It is often described as also relaxing arteries directly by releasing nitric oxide, the same molecule that makes blood vessels dilate during exercise. The laboratory evidence for that is real; the drug regulator has not accepted it as the explanation, and the official label lists five possible contributors to the pressure drop without naming nitric oxide among them.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 62,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1438 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 94 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 17 December 2007 under NDA 021742, and generic since 2021. Before genericisation it was one of the most heavily promoted branded antihypertensives in the United States, at a branded price, for an indication in which several equally effective molecules had been generic for over a decade.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The honest comparison for nebivolol is not against other beta-blockers on blood pressure — they all lower it — but against the drugs with outcome trials in the indication it is licensed for. Nebivolol has none. Where a beta-blocker is genuinely indicated, in heart failure or after infarction, three other molecules have their own mortality trials and nebivolol has one marginal composite in the elderly.',
      conventionalRx: [
        {
          name: 'Bisoprolol (Zebeta)',
          class: 'Beta-1 selective adrenergic blocker',
          howItCompares:
            'Beta-1 selective like nebivolol and about the same price, with a mortality trial nebivolol does not have: CIBIS-II found all-cause mortality of 11.8% against 17.3% in 2,647 heart failure patients (HR 0.66, p<0.0001).',
          typicalCost:
            'US$0.2096 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 93 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: an independent mortality trial; long generic history. Cons: like nebivolol, its United States label covers hypertension only; selectivity is lost at higher doses.',
        },
        {
          name: 'Carvedilol (Coreg)',
          class: 'Non-selective beta-blocker with alpha-1 blockade',
          howItCompares:
            'Actually does what nebivolol is marketed for — vasodilatation alongside beta blockade — by a mechanism that is not disputed, alpha-1 blockade, and has three outcome trials. Nebivolol, by contrast, does not demonstrate alpha-1 blockade at clinically relevant doses, according to its own label.',
          typicalCost:
            'US$0.0214 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 88 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: about a seventh of the price; mortality evidence in severe heart failure and after infarction. Cons: twice daily; non-selective, so contraindicated in asthma; more postural hypotension.',
        },
        {
          name: 'Amlodipine, or a thiazide-like diuretic, or an ACE inhibitor',
          class: 'Calcium channel blocker, diuretic or renin-angiotensin blocker',
          howItCompares:
            'For uncomplicated high blood pressure, these classes have hard-endpoint trials against each other in tens of thousands of patients, and beta-blockers have been demoted from first-line in most guidelines partly because they prevent stroke less well at equal blood pressure.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: outcome evidence in the actual indication; no bradycardia, no fatigue, no rebound risk on stopping. Cons: each has its own adverse effects, from ankle swelling to cough to electrolyte disturbance.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary nitrate — beetroot, rocket, spinach and other leafy greens',
          activeCompound:
            'Inorganic nitrate, reduced to nitrite by oral bacteria and then to nitric oxide',
          biologicalMechanism:
            'The nitrate-nitrite-nitric oxide pathway raises circulating nitric oxide independently of the endothelial enzyme, which is the same end-point nebivolol is claimed to reach by a different route. Antibacterial mouthwash abolishes the effect, which is unusually direct evidence that the oral bacteria are the necessary step.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: the randomised trials of dietary nitrate in hypertension are short, mostly under six weeks, and measure blood pressure rather than events. None has reported a cardiovascular outcome, and the reductions reported are smaller than those of a first-line antihypertensive.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Do not stop it abruptly',
          action: 'Taper rather than stop, and say if you are running low.',
          patientImpact:
            'The label warns of severe exacerbation of angina, myocardial infarction and ventricular arrhythmias after abrupt discontinuation of beta-blockers in coronary disease, with or without preceding worsening of angina, and directs tapering over one to two weeks.',
          clinicalPrecaution:
            'The warning is extended to people without known coronary disease. If angina worsens during the taper, the label directs restarting the drug at least temporarily.',
        },
        {
          name: 'Mention it before any operation',
          action: 'Tell the anaesthetist you are taking a beta-blocker.',
          patientImpact:
            'The label states that patients already on beta-blockers should generally continue treatment through the perioperative period, because withdrawal is associated with increased risk of infarction and chest pain. This is the opposite advice from starting one before surgery.',
          clinicalPrecaution:
            'If it is continued, the label directs close monitoring with anaesthetics that depress myocardial function.',
        },
        {
          name: 'Ask whether you are a poor metaboliser',
          action:
            'Mention any known CYP2D6 result, and any strong CYP2D6 inhibitor such as paroxetine, fluoxetine or quinidine.',
          patientImpact:
            'The label records that poor metabolisers attain a 5-fold higher peak concentration and 10-fold higher total exposure of the active d-isomer than extensive metabolisers at the same dose, and that beta-1 selectivity is lost in poor metabolisers and at higher doses.',
          clinicalPrecaution:
            'The label argues this matters less than usual because active metabolites contribute to beta blockade. It still means the same tablet is a different drug in different people, and the selectivity argument weakens in exactly the people with most exposure.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1CC2=C(C=CC(=C2)F)OC1C(CNCC(C3CCC4=C(O3)C=CC(=C4)F)O)O',
      chemicalFormula: 'C22H25F2NO4',
      molecularWeight: '405.40 g/mol (free base); dispensed as the hydrochloride at 441.90 g/mol',
      targetReceptorAffinity:
        'A racemate of d-nebivolol (SRRR) and l-nebivolol (RSSS). The label states that d-nebivolol beta receptor affinity is more than 1,000-fold higher than that of l-nebivolol, and that l-nebivolol contributes little to activity despite reaching higher exposure. In extensive metabolisers at 10 mg and below the drug is preferentially beta-1 selective; in poor metabolisers and at higher doses it blocks beta-1 and beta-2 alike. At clinically relevant doses it does not demonstrate alpha-1 blockade. Plasma protein binding is about 98%, mostly to albumin.',
      structureSource: {
        label:
          'PubChem CID 71301 (nebivolol) — canonical SMILES, molecular formula and weight, as carried on the enriched record; stereochemical designations and hydrochloride weight from the BYSTOLIC label, section 11',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/71301',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'neb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Resolve and quantify all four stereoisomers',
          description:
            'Nebivolol has four stereocentres and the marketed product is a specific pair of enantiomers, SRRR and RSSS, at equal proportion. The other diastereomers are not the drug. Because activity sits more than a thousand-fold in one isomer, a stereochemical impurity is a potency problem that a normal assay cannot see.',
          reagentsAndBuffer:
            'Nebivolol hydrochloride reference standard, chiral HPLC on an amylose or cellulose phase, circular dichroism detection, 19F NMR to confirm both fluorochroman rings, Karl Fischer titration',
        },
        {
          id: 'neb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build two fluorinated chroman epoxides and join them through a nitrogen',
          description:
            'The molecule is two 6-fluoro-3,4-dihydro-2H-1-benzopyran units linked by an iminodiethanol bridge. Each chroman is elaborated to an epoxide and the two are opened in sequence by a single nitrogen, which is why the synthesis is long and why the marketed material is a defined mixture of two of the possible diastereomers rather than a single compound.',
          dependsOnStepId: 'neb-w1',
          reagentsAndBuffer:
            '6-fluorochroman-2-carboxylic acid derivatives, reduction and epoxidation reagents, benzylamine as the nitrogen source with subsequent hydrogenolytic debenzylation, palladium on carbon, anhydrous solvents under nitrogen',
        },
        {
          id: 'neb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Separate the diastereomer pairs and form the hydrochloride',
          description:
            'Separate the RSSS/SRRR pair from the SRRS/RSSR pair by fractional crystallisation or chromatography, then form the hydrochloride salt. This separation is the reason nebivolol is expensive to make relative to other beta-blockers and is the step where most of the process yield is lost.',
          dependsOnStepId: 'neb-w2',
          reagentsAndBuffer:
            'Fractional crystallisation from ethanol or acetone, preparative chiral chromatography where required, hydrogen chloride in isopropanol, HPLC release testing against a specified diastereomeric ratio',
        },
        {
          id: 'neb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Beta-1 against beta-2 occupancy for each isomer separately',
          description:
            'Run d-nebivolol and l-nebivolol as separate materials against human beta-1 and beta-2. Testing the racemate alone reports an average that belongs to neither isomer, and the entire selectivity claim depends on the d-isomer profile at low occupancy.',
          dependsOnStepId: 'neb-w3',
          reagentsAndBuffer:
            'CHO or HEK293 cells stably expressing human ADRB1 or ADRB2, isoproterenol as agonist, cyclic AMP accumulation readout, resolved d- and l-nebivolol as separate test articles',
        },
        {
          id: 'neb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Test the nitric oxide claim against an endothelium-denuded control',
          description:
            'The marketing mechanism is endothelium-dependent vasodilatation through nitric oxide. The assay that tests it, rather than assumes it, is relaxation of a precontracted vessel ring with and without an intact endothelium, and with and without a nitric oxide synthase inhibitor. A relaxation that survives denudation or L-NAME is not a nitric oxide effect, whatever the mechanism diagram says.',
          dependsOnStepId: 'neb-w4',
          reagentsAndBuffer:
            'Rat or human artery rings precontracted with phenylephrine, paired endothelium-intact and endothelium-denuded preparations, L-NAME as nitric oxide synthase inhibitor, ODQ as soluble guanylate cyclase inhibitor, isometric force transducers',
        },
      ],
    },
    keyAudits: [
      {
        id: 'neb-a1',
        category: 'inferred',
        title: 'The nitric oxide story is not in the label',
        laymanSummary:
          'Nebivolol is sold as the beta-blocker that also relaxes arteries by releasing nitric oxide. Its official prescribing information says the mechanism of the blood pressure effect has not been definitively established, and the phrase nitric oxide does not appear anywhere in the document.',
        technicalDetails:
          'Section 12.1 of the BYSTOLIC label reads: "The mechanism of action of the antihypertensive response of BYSTOLIC has not been definitively established." It lists five possible contributing factors — decreased heart rate, decreased myocardial contractility, diminished tonic sympathetic outflow, suppression of renin activity, and vasodilation with decreased peripheral vascular resistance — and does not attribute the fifth to nitric oxide or to any named pathway. Section 12 also states that at clinically relevant doses nebivolol does not demonstrate alpha-1 adrenergic blockade, closing off the other obvious vasodilator route, and that l-nebivolol contributes little to the drug activity because d-nebivolol beta receptor affinity is more than 1,000-fold higher. The laboratory literature on endothelial nitric oxide release by nebivolol is genuine and it has not translated into a mechanism the regulator will state, nor into an outcome the drug has been shown to produce.',
        evidenceSource:
          'BYSTOLIC (nebivolol) United States prescribing information, sections 12 and 12.1 (NDA 021742)',
        inferredClaim:
          'That nebivolol lowers blood pressure by nitric-oxide-mediated vasodilation — a mechanism supported in isolated tissue, absent from the label, and never linked to a clinical outcome',
        auditFlag: 'contested',
      },
      {
        id: 'neb-a2',
        category: 'inferred',
        title: 'The label says there are no controlled trials showing this drug reduces risk',
        laymanSummary:
          'It lowers blood pressure. Whether it prevents strokes and heart attacks has not been tested, and the package insert says exactly that.',
        technicalDetails:
          'Section 1.1 reads: "There are no controlled trials demonstrating risk reduction with BYSTOLIC." The benefit is inferred from the general proposition that lowering blood pressure reduces fatal and nonfatal cardiovascular events, which the label states has been shown for drugs from a wide variety of pharmacologic classes including the one nebivolol belongs to. That inference is weaker for beta-blockers than for other classes: this is the class that has been demoted from first-line in most hypertension guidelines because, at equal blood pressure reduction, it prevented fewer strokes in the outcome trial record. Section 5.2 adds that the drug was not studied in patients with angina pectoris or recent myocardial infarction.',
        evidenceSource:
          'BYSTOLIC (nebivolol) United States prescribing information, sections 1.1 and 5.2 (NDA 021742)',
        inferredClaim:
          'That the blood pressure reduction measured with nebivolol converts into fewer cardiovascular events — a class-level inference the label declines to make for this molecule',
        auditFlag: 'caution',
      },
      {
        id: 'neb-a3',
        category: 'measured',
        title: 'SENIORS: the composite was met, and deaths alone were not different',
        laymanSummary:
          'The one outcome trial randomised over two thousand people aged seventy and above with heart failure. The combined measure of death or heart admission improved, just, at a p value of 0.039. Deaths on their own were no different.',
        technicalDetails:
          'SENIORS randomised 2,128 patients aged 70 or over with a history of heart failure — hospital admission within the previous year or known ejection fraction at or below 35% — to nebivolol titrated from 1.25 mg to 10 mg daily (n=1,067) or placebo (n=1,061), for a mean 21 months. Mean age was 76 and mean ejection fraction 36%, with 35% having ejection fraction above 35%. The primary composite of all-cause mortality or cardiovascular hospital admission occurred in 332 (31.1%) against 375 (35.3%), hazard ratio 0.86 (95% CI 0.74 to 0.99, p=0.039). Death from any cause occurred in 169 (15.8%) against 192 (18.1%), hazard ratio 0.88 (95% CI 0.71 to 1.08, p=0.21) — not significant. Age, sex and ejection fraction did not modify the effect. This is a real result at the edge of significance on a composite, in a population the drug is not licensed for in the United States, and it is the entire outcome evidence base for the molecule.',
        evidenceSource: 'Flather MD et al., Eur Heart J 2005;26:215-225 (SENIORS)',
        doi: '10.1093/eurheartj/ehi115',
        measuredMetric:
          'Composite of all-cause mortality or cardiovascular hospital admission in patients aged 70 and over',
        auditFlag: 'verified',
      },
      {
        id: 'neb-a4',
        category: 'failed',
        title: 'The one outcome trial is in a condition the United States label does not cover',
        laymanSummary:
          'SENIORS studied heart failure. In the United States, nebivolol is licensed only for blood pressure, and decompensated heart failure is a contraindication. The trial everyone cites is about a use the label does not authorise.',
        technicalDetails:
          'The United States indication is hypertension alone. Contraindications include decompensated cardiac failure, severe bradycardia, heart block greater than first degree, cardiogenic shock, sick sinus syndrome without a pacemaker, and severe hepatic impairment at Child-Pugh above B. SENIORS enrolled 2,128 patients with a history of heart failure and reported the only outcome data the molecule has. Nebivolol carries heart failure indications in several European jurisdictions. So the outcome trial and the United States label describe different drugs in practice: the evidence that exists is for a use the label does not cover, and the use the label covers has no outcome evidence.',
        evidenceSource:
          'BYSTOLIC United States prescribing information, sections 1.1 and 4 (NDA 021742); Flather MD et al., Eur Heart J 2005;26:215-225',
        doi: '10.1093/eurheartj/ehi115',
        measuredMetric:
          'Licensed indication against the population in which the only outcome trial was run',
        auditFlag: 'caution',
      },
      {
        id: 'neb-a5',
        category: 'failed',
        title: 'Selectivity fails in the people who get the most drug',
        laymanSummary:
          'Nebivolol is heart-selective in most people at ordinary strengths. In people who metabolise it slowly — who also end up with ten times the drug exposure — it blocks the lung receptors too.',
        technicalDetails:
          'The label states that in extensive metabolisers, most of the population, and at doses at or below 10 mg, nebivolol is preferentially beta-1 selective; in poor metabolisers and at higher doses it inhibits both beta-1 and beta-2 receptors. For the same dose, poor metabolisers attain a 5-fold higher peak concentration and a 10-fold higher area under the curve of the active d-isomer, and its effective half-life extends from about 12 to about 19 hours. The two failure modes therefore coincide: the people in whom selectivity is lost are the people carrying the most drug. Section 5.3 states that in general, patients with bronchospastic diseases should not receive beta-blockers.',
        evidenceSource:
          'BYSTOLIC United States prescribing information, sections 12, 12.3 and 5.3 (NDA 021742)',
        measuredMetric:
          'Beta-1 selectivity as a function of CYP2D6 metaboliser status and dose, from the label pharmacology section',
        auditFlag: 'caution',
      },
      {
        id: 'neb-a6',
        category: 'conclusion_shift',
        title: 'A racemate in which one isomer does almost nothing at the receptor',
        laymanSummary:
          'The tablet contains equal amounts of two mirror-image molecules. One does the beta blocking. The other is present at higher levels in the blood and, according to the label, contributes little.',
        technicalDetails:
          'Nebivolol is a racemate of d-nebivolol (SRRR) and l-nebivolol (RSSS). The label states that exposure to l-nebivolol is higher than to d-nebivolol, but that l-nebivolol contributes little to the drug activity because d-nebivolol beta receptor affinity is more than 1,000-fold higher. Much of the published mechanistic work attributing nitric-oxide-mediated vasodilation to nebivolol assigns that activity to the l-isomer or to the racemate rather than to d-nebivolol. The label position — that the l-isomer contributes little and that the antihypertensive mechanism is not established — sits uneasily with a marketing account in which the l-isomer supplies the distinguishing pharmacology. Both statements cannot carry equal weight, and the label is the document with regulatory standing.',
        evidenceSource:
          'BYSTOLIC United States prescribing information, sections 11, 12 and 12.3 (NDA 021742)',
        inferredClaim:
          'That the l-isomer supplies a clinically meaningful vasodilator effect — asserted in the mechanistic literature, contradicted by the label statement that it contributes little to activity',
        auditFlag: 'contested',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One tablet, two mirror-image molecules',
        laymanDesc:
          'The tablet contains equal amounts of two forms of the same molecule. Only one of them meaningfully blocks the heart receptor; the other reaches higher levels in the blood and does much less.',
        molecularDetail:
          'A racemate of d-nebivolol (SRRR) and l-nebivolol (RSSS). The label states d-nebivolol beta receptor affinity is more than 1,000-fold higher and that l-nebivolol contributes little to activity despite higher exposure. Plasma protein binding is about 98%, and food does not alter the pharmacokinetics.',
        iconName: 'Split',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'How fast your liver works decides your dose',
        laymanDesc:
          'The active half is broken down by a liver enzyme that some people have little of. Those people end up with about ten times as much active drug from the same tablet.',
        molecularDetail:
          'Metabolism is predominantly direct glucuronidation with N-dealkylation and oxidation by CYP2D6. Poor metabolisers attain a 5-fold higher peak concentration and 10-fold higher area under the curve of d-nebivolol, with effective half-life rising from about 12 to 19 hours. Active metabolites, including the hydroxyl metabolite and glucuronides, contribute to beta blockade, which the label argues blunts the clinical importance of the difference.',
        iconName: 'Filter',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The heart receptor is blocked, mostly selectively',
        laymanDesc:
          'The active half sits on the beta-1 receptor, which is mainly on the heart, and leaves the lung receptor largely alone — at ordinary strengths, in most people.',
        molecularDetail:
          'Competitive beta-1 antagonism without intrinsic sympathomimetic or membrane-stabilising activity at therapeutic concentrations. Preferential beta-1 selectivity holds in extensive metabolisers at 10 mg and below; in poor metabolisers and at higher doses both beta-1 and beta-2 are inhibited. There is no alpha-1 blockade at clinically relevant doses.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Pressure falls, by a route the label will not name',
        laymanDesc:
          'Blood pressure comes down. The prescribing information lists five things that may be responsible and declines to say which, and never mentions nitric oxide.',
        molecularDetail:
          'Section 12.1 states the mechanism of the antihypertensive response has not been definitively established and lists decreased heart rate, decreased contractility, diminished tonic sympathetic outflow, renin suppression, and vasodilation with decreased peripheral resistance as possible contributors. The endothelial nitric oxide account rests on isolated tissue and forearm plethysmography work, not on anything the label endorses.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'In the elderly with heart failure, a marginal composite',
        laymanDesc:
          'The only outcome trial found a small advantage on a combined measure of death or hospital admission. Deaths on their own were not different.',
        molecularDetail:
          'SENIORS: primary composite 31.1% against 35.3%, hazard ratio 0.86 (95% CI 0.74 to 0.99, p=0.039), in 2,128 patients aged 70 or over over a mean 21 months. All-cause death 15.8% against 18.1%, hazard ratio 0.88 (0.71 to 1.08, p=0.21).',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What has never been measured',
        laymanDesc:
          'Nothing in hypertension. The label states there are no controlled trials showing this drug reduces cardiovascular risk, and it was never studied in angina or after a heart attack.',
        molecularDetail:
          'Section 1.1: "There are no controlled trials demonstrating risk reduction with BYSTOLIC." Section 5.2: the drug was not studied in patients with angina pectoris or recent myocardial infarction. The outcome evidence that exists, SENIORS, is in a heart failure population the United States label does not cover and in which decompensated failure is a contraindication.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SENIORS (Eur Heart J 2005;26:215-225)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2128,
        primaryEndpoint:
          'Composite of all-cause mortality or cardiovascular hospital admission, time to first event, in patients aged 70 or over with heart failure',
        endpointMet: true,
        statisticalPValue:
          '31.1% against 35.3%; hazard ratio 0.86 (95% CI 0.74 to 0.99), p=0.039 over a mean 21 months',
        unreportedAdverseSignals:
          'All-cause death alone was not significantly different: 15.8% against 18.1%, HR 0.88 (95% CI 0.71 to 1.08), p=0.21. The composite result sits at the edge of significance, and 35% of the enrolled population had an ejection fraction above 35%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Three 12-week placebo-controlled monotherapy hypertension trials (NDA 021742)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1802,
        primaryEndpoint: 'Change from baseline in sitting blood pressure at 12 weeks',
        endpointMet: true,
        statisticalPValue:
          'Blood pressure endpoints met; discontinuation for adverse reactions 2.8% on nebivolol against 2.2% on placebo across the placebo-controlled programme',
        unreportedAdverseSignals:
          'These are blood pressure trials of twelve weeks. No cardiovascular outcome was measured, which is why the label states there are no controlled trials demonstrating risk reduction with the drug.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Composite of all-cause mortality or cardiovascular hospital admission 31.1% against 35.3% in 2,128 patients aged 70 or over (HR 0.86, 95% CI 0.74 to 0.99, p=0.039)',
        'All-cause mortality in the same trial 15.8% against 18.1%, not significant (HR 0.88, 95% CI 0.71 to 1.08, p=0.21)',
        'Blood pressure reduction across three 12-week placebo-controlled monotherapy trials in 1,597 treated hypertensive patients',
        'A 5-fold higher peak concentration and 10-fold higher exposure to the active isomer in CYP2D6 poor metabolisers at the same dose',
      ],
      unsupportedInferences: [
        'That nebivolol works through nitric-oxide-mediated vasodilation — a phrase that appears nowhere in its United States label, which says the mechanism has not been definitively established',
        'That the l-isomer supplies a clinically meaningful vasodilator effect, when the label states it contributes little to activity',
        'That the drug reduces cardiovascular events in hypertension, which the label explicitly declines to claim',
        'That SENIORS demonstrated a mortality benefit, when all-cause death alone was not significantly different',
      ],
      whatFailedInitially: [
        'All-cause mortality in SENIORS, the only outcome trial, did not separate from placebo',
        'Beta-1 selectivity is lost in CYP2D6 poor metabolisers and at doses above 10 mg, in exactly the people with highest exposure',
        'The drug was never studied in angina or after myocardial infarction, and its label says so',
        'The one outcome trial was conducted in heart failure, a condition the United States label does not cover and whose decompensated form is a contraindication',
      ],
      realWorldOutcome: [
        'Approved in the United States on 17 December 2007 under NDA 021742 and generic since 2021',
        'Among the most heavily promoted branded antihypertensives of its era, in an indication where several equally effective molecules were already generic',
        'Now priced at about fourteen United States cents a tablet, which is where the marketing argument and the pharmacology argument stop being separable from the price argument',
        'Carries heart failure indications in several European jurisdictions on the strength of SENIORS, and none in the United States',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet at 2.5, 5, 10 and 20 mg of nebivolol base, taken once daily',
      description:
        'Absorption resembles that of an oral solution and is unaffected by food; peak plasma concentration comes at about 1.5 to 4 hours. Absolute bioavailability has not been determined. The effective half-life of the active d-isomer is about 12 hours in extensive metabolisers and 19 hours in poor metabolisers, and active metabolites contribute to beta blockade.',
      safetyProfile:
        'Contraindicated in severe bradycardia, heart block greater than first degree, cardiogenic shock, decompensated cardiac failure, sick sinus syndrome without a pacemaker and severe hepatic impairment. Do not stop abruptly: severe exacerbation of angina, myocardial infarction and ventricular arrhythmias have been reported after abrupt beta-blocker withdrawal in coronary disease, and the label directs tapering over one to two weeks. In general, patients with bronchospastic disease should not receive beta-blockers. It may mask the symptoms of hypoglycaemia and alter glucose levels. Discontinuation for adverse reactions in placebo-controlled trials was 2.8% against 2.2% on placebo, most often for headache, nausea or bradycardia.',
    },
    commonQuestions: [
      {
        q: 'Is nebivolol really different from other beta-blockers?',
        a: 'It is chemically different and the clinical case for it being a different kind of drug is thinner than the marketing suggests. The claim is that it also relaxes arteries by releasing nitric oxide. There is genuine laboratory work behind that, in isolated vessels and forearm blood-flow studies. But the United States prescribing information says the mechanism of the blood pressure effect has not been definitively established, lists five possible contributors, and does not use the phrase nitric oxide anywhere in the document. It also says the drug shows no alpha-1 blockade at clinically relevant doses, and that the isomer usually credited with the vasodilator effect contributes little to activity. What has actually been shown is that it lowers blood pressure, and that it is beta-1 selective in most people at ordinary doses.',
        auditNote:
          'A mechanism can be true in a tissue bath and irrelevant in a patient. The test for the difference is an outcome trial, and this drug has one, in a population its United States label does not cover.',
      },
      {
        q: 'Does it prevent heart attacks and strokes?',
        a: 'Unknown for this drug, and the label says so: there are no controlled trials demonstrating risk reduction with it. What exists is the general finding that lowering blood pressure reduces cardiovascular events, shown for drugs across many classes. That inference is weaker for beta-blockers than for the others, because in the outcome trial record they prevented fewer strokes than alternatives at the same blood pressure, which is why most guidelines moved them off first-line for uncomplicated hypertension. The label also records that nebivolol was never studied in angina or after a heart attack.',
      },
      {
        q: 'Why does the dose seem to affect me differently from other people?',
        a: 'Because it probably does. The active half of nebivolol is partly cleared by the liver enzyme CYP2D6, and roughly 5 to 10% of people of European ancestry have little functional CYP2D6. In those people, the same tablet produces about five times the peak level and ten times the total exposure of the active isomer, and the half-life stretches from about twelve hours to nineteen. The label argues this matters less than it sounds because the metabolites also block beta receptors. It still means the heart-selectivity that is the drug main safety argument is lost in exactly the people carrying the most of it, and drugs like paroxetine, fluoxetine and quinidine can turn a normal metaboliser into a functional poor one.',
      },
      {
        q: 'It was studied in heart failure. Can I take it for that?',
        a: 'In much of Europe, yes; in the United States, that is off-label and the label lists decompensated cardiac failure as a contraindication. SENIORS randomised 2,128 people aged seventy and over with a history of heart failure and found the combined rate of death or cardiovascular admission fell from 35.3% to 31.1%, a hazard ratio of 0.86 at p=0.039. Deaths alone were 15.8% against 18.1% and that difference was not statistically significant. It is a real but marginal result on a composite, and it is the only outcome trial this molecule has. Where a beta-blocker is being chosen for heart failure, carvedilol, bisoprolol and metoprolol succinate each have a larger and cleaner mortality result.',
      },
      {
        q: 'Can I stop it if I feel fine?',
        a: 'Not abruptly. The label warns that severe worsening of angina, myocardial infarction and ventricular arrhythmias have been reported after abrupt discontinuation of beta-blockers in people with coronary disease, sometimes without any preceding warning worsening of angina, and it extends that caution to people without known coronary disease. The direction is to taper over one to two weeks with reduced physical activity, and to restart the drug at least temporarily if angina worsens during the taper. Separately, if you are having an operation, the label says people already established on a beta-blocker should generally continue it through the perioperative period rather than stop.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Flather MD, Shibata MC, Coats AJ, et al. Randomized trial to determine the effect of nebivolol on mortality and cardiovascular hospital admission in elderly patients with heart failure (SENIORS). Eur Heart J 2005;26:215-225',
        identifier: '10.1093/eurheartj/ehi115',
        kind: 'doi',
      },
      {
        label:
          'BYSTOLIC (nebivolol) United States prescribing information — Indications 1.1, Contraindications 4, Warnings 5.1 to 5.5, Description 11, Clinical Pharmacology 12, 12.1 and 12.3',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021742',
        kind: 'regulatory',
      },
      {
        label:
          'CIBIS-II Investigators and Committees. The Cardiac Insufficiency Bisoprolol Study II (CIBIS-II): a randomised trial. Lancet 1999;353:9-13',
        identifier: '10.1016/S0140-6736(98)11181-9',
        kind: 'doi',
      },
      {
        label:
          'Packer M, Coats AJ, Fowler MB, et al. Effect of carvedilol on survival in severe chronic heart failure. N Engl J Med 2001;344:1651-1658 (COPERNICUS)',
        identifier: '10.1056/NEJM200105313442201',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — nebivolol, 94 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 71301 — nebivolol structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/71301',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Diltiazem — the calcium blocker whose own harm signal became a line in its contraindications,
  //    and which quietly raises the level of two of the most-prescribed anticoagulants.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'diltiazem',
    name: 'Diltiazem',
    tradeName: 'Cardizem / Cardizem CD / Cardizem LA / Tiadylt / Cartia XT',
    sponsor: 'Bausch Health (current holder of NDA 018602); originated at Tanabe Seiyaku in Japan',
    targetGene: 'CACNA1C',
    targetProtein:
      'Alpha-1C subunit of the L-type voltage-gated calcium channel (Cav1.2), bound at the benzothiazepine site rather than the dihydropyridine site',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1982,
    indication:
      'Hypertension; chronic stable angina and angina due to coronary artery spasm, by the oral route. The intravenous formulation is indicated for temporary control of rapid ventricular rate in atrial fibrillation or flutter and for rapid conversion of paroxysmal supraventricular tachycardia',
    patientFriendlyIndication:
      'Chest pain from narrowed or spasming arteries, high blood pressure, and a heart racing out of rhythm',
    anatomicalSite:
      'Atrioventricular node and coronary vascular smooth muscle — the benzothiazepine binding site on the L-type calcium channel',
    conditionContext: {
      conditionExplainer:
        'Calcium entering a cell through the L-type channel does two different jobs in two different places. In artery muscle it produces contraction, so blocking it widens the vessel. In the atrioventricular node it carries the electrical impulse from atria to ventricles, so blocking it slows the pulse. Diltiazem does both, which is why one drug treats angina, high blood pressure and a fast atrial fibrillation.',
      whyItMatters:
        'Diltiazem sits between the two ends of the calcium blocker family: more rate-slowing than amlodipine, less negatively inotropic than verapamil. That middle position is its selling point and the reason its harms are specific rather than general — they appear in the people whose hearts cannot afford either effect.',
      whoTakesThis:
        'Adults with angina, including the vasospastic form where it is a first choice; adults with high blood pressure; and, intravenously, patients whose atrial fibrillation is running too fast. Not people with sick sinus syndrome or high-grade heart block without a pacemaker, and not people with a recent infarction and fluid on the lungs.',
      clinicalGoals:
        'Fewer episodes of chest pain, a controlled ventricular rate, a lower blood pressure. All three are symptom or physiology endpoints. The trials that looked for a survival benefit did not find one.',
    },
    oneSentenceVerdict:
      'A non-dihydropyridine calcium blocker that widens coronary arteries and slows conduction through the AV node, which in 2,466 post-infarction patients produced identical total mortality to placebo while cutting cardiac events by 23% in the 1,909 without pulmonary congestion and raising them by 41% in the 490 who had it — a finding now written into its own contraindications.',
    laymanHowItWorks:
      'Muscle cells in artery walls need calcium flowing in before they can squeeze, and the electrical relay between the top and bottom chambers of the heart uses the same kind of calcium channel to pass its signal. Diltiazem blocks that channel. Arteries widen, including the coronary arteries feeding the heart itself, so chest pain from narrowing or spasm eases. At the same time the electrical relay slows, which is why the pulse comes down and why the drug can control a racing, irregular heartbeat.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.3196 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 177 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First approved in the United States on 5 November 1982 under NDA 018602 and generic for decades, though the extended-release formulations were the subject of a long series of patent and bioequivalence disputes that kept individual products branded well past the expiry of protection on the molecule itself. The 177 listed products reflect how many different release profiles are sold under one name.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'The alternatives divide by what you want from the drug. If the aim is rate control in atrial fibrillation, the comparison is against a beta-blocker, and the 2024 Medicare analysis of 204,155 patients is the strongest reason to prefer one in a specific circumstance. If the aim is blood pressure, amlodipine does that without touching conduction. If the aim is vasospastic angina, the non-dihydropyridines and the nitrates are the classes with a mechanism that fits.',
      conventionalRx: [
        {
          name: 'Metoprolol or another beta-blocker, for rate control',
          class: 'Beta-1 adrenergic blocker',
          howItCompares:
            'Slows the same AV node by a different route and does not inhibit CYP3A4. In 204,155 Medicare patients with atrial fibrillation on apixaban or rivaroxaban, those started on diltiazem had a 21% higher rate of serious bleeding than those started on metoprolol (HR 1.21, 95% CI 1.13 to 1.29).',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no interaction with the direct oral anticoagulants; mortality evidence in heart failure and after infarction that diltiazem does not have. Cons: contraindicated or hazardous in asthma; fatigue; no coronary vasodilatation, so no use in vasospastic angina.',
        },
        {
          name: 'Verapamil',
          class: 'Non-dihydropyridine calcium channel blocker, phenylalkylamine class',
          howItCompares:
            'The other rate-slowing calcium blocker, binding a different site on the same channel. More negatively inotropic than diltiazem and more constipating, with a similar CYP3A4 interaction profile. In INVEST, a verapamil-based strategy matched an atenolol-based one in 22,576 hypertensive patients with coronary disease (RR 0.98, 95% CI 0.90 to 1.06).',
          typicalCost:
            'US$0.1803 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 43 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: stronger rate control; cheaper. Cons: more depression of contractility, so worse in a weak ventricle; constipation limits it in a substantial minority.',
        },
        {
          name: 'Amlodipine',
          class: 'Dihydropyridine calcium channel blocker',
          howItCompares:
            'Blocks the same channel at a different site, with a strong effect on vascular smooth muscle and essentially none on the AV node. For blood pressure it does the job without any conduction risk; for rate control it does nothing at all.',
          typicalCost:
            'Among the cheapest prescription drugs in the United States at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no bradycardia, no heart block, no meaningful CYP3A4 inhibition, large outcome trial base. Cons: ankle swelling; no rate control; reflex tachycardia at the start of treatment.',
        },
        {
          name: 'Isosorbide mononitrate, for angina',
          class: 'Organic nitrate',
          howItCompares:
            'Dilates veins and coronary arteries and reduces angina episodes, with no effect on heart rate control and no survival benefit: in 58,050 patients in ISIS-4 there was no reduction in five-week mortality.',
          typicalCost:
            'US$0.0977 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheap, no conduction effects, works quickly on symptoms. Cons: tolerance develops within a day of continuous exposure; headache; no effect on events.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Say what else you are taking, in full',
          action:
            'List every medicine including anticoagulants, statins, immunosuppressants and anything bought without a prescription.',
          patientImpact:
            'Diltiazem inhibits CYP3A4 and raises the blood level of a long list of drugs. In 204,155 Medicare patients taking apixaban or rivaroxaban, starting diltiazem rather than metoprolol was associated with an extra 10.6 serious bleeding events per 1,000 patient-years, rising to 15.1 at doses above 120 mg daily.',
          clinicalPrecaution:
            'The interaction is pharmacokinetic and silent. Nothing feels different until the bleed, which is why the drug list matters more here than the symptom history.',
        },
        {
          name: 'Report a slow pulse or fainting',
          action: 'Say if your pulse is unusually slow, or if you have felt faint or blacked out.',
          patientImpact:
            'The label records second- or third-degree AV block in 13 of 3,290 patients, or 0.40%, and one patient with Prinzmetal angina who developed 2 to 5 second periods of asystole after a single 60 mg dose. The effect is additive with beta-blockers and with digitalis.',
          clinicalPrecaution:
            'Sick sinus syndrome and second- or third-degree block are contraindications unless a functioning pacemaker is in place.',
        },
        {
          name: 'Mention a recent heart attack, particularly with breathlessness',
          action:
            'Say if you have had a myocardial infarction, and whether there was fluid on the lungs at the time.',
          patientImpact:
            'Acute myocardial infarction with pulmonary congestion documented by chest x-ray on admission is a contraindication. That line exists because of a trial: in MDPIT, patients with pulmonary congestion had 41% more cardiac events on diltiazem than on placebo.',
          clinicalPrecaution:
            'The same trial found 23% fewer events in patients without congestion. The drug is not generally harmful after infarction and it is specifically harmful in one subgroup.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)O[C@@H]1[C@@H](SC2=CC=CC=C2N(C1=O)CCN(C)C)C3=CC=C(C=C3)OC',
      chemicalFormula: 'C22H26N2O4S',
      molecularWeight: '414.50 g/mol (free base); dispensed as diltiazem hydrochloride',
      targetReceptorAffinity:
        'Binds the benzothiazepine site on the alpha-1C subunit of Cav1.2, distinct from both the dihydropyridine site used by amlodipine and the phenylalkylamine site used by verapamil. It prolongs AV node refractory periods without significantly prolonging sinus node recovery time, except in sick sinus syndrome. It is a moderate inhibitor of CYP3A4 and a substrate for the same enzyme, which is the origin of its interaction profile.',
      structureSource: {
        label:
          'PubChem CID 39186 (diltiazem) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/39186',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'dtz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the (2S,3S) configuration and the acetate ester',
          description:
            'Diltiazem is a single enantiomer with two adjacent stereocentres on the benzothiazepine ring, and only the (2S,3S) form is the drug. The 3-acetate ester is hydrolysed in vivo to the less potent deacetyl metabolite, so free deacetyldiltiazem in the starting material is a potency loss rather than an inert impurity.',
          reagentsAndBuffer:
            'Diltiazem hydrochloride reference standard, chiral HPLC on a cellulose phase, 1H NMR in DMSO-d6, specified limit for deacetyldiltiazem, Karl Fischer titration',
        },
        {
          id: 'dtz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the benzothiazepinone ring and acetylate at C3',
          description:
            'Open a chiral glycidate ester with 2-aminothiophenol, cyclise to the seven-membered benzothiazepinone lactam, alkylate the ring nitrogen with a dimethylaminoethyl chain, then acetylate the C3 hydroxyl. The seven-membered sulfur-containing ring is what places this molecule at the benzothiazepine site rather than the dihydropyridine site, and it is the whole reason the drug slows the AV node.',
          dependsOnStepId: 'dtz-w1',
          reagentsAndBuffer:
            'Methyl (2R,3S)-3-(4-methoxyphenyl)glycidate, 2-aminothiophenol, xylene at reflux for cyclisation, 2-dimethylaminoethyl chloride with potassium carbonate, acetic anhydride with pyridine, nitrogen atmosphere',
        },
        {
          id: 'dtz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Resolve residual trans isomer and form the hydrochloride',
          description:
            'Remove the cis/trans isomer arising at the ring-closure step, then crystallise the hydrochloride. The trans isomer has markedly lower channel affinity and is the impurity that determines potency at release.',
          dependsOnStepId: 'dtz-w2',
          reagentsAndBuffer:
            'Fractional crystallisation from ethanol or acetone, hydrogen chloride in isopropanol, chiral HPLC release testing with specified limits for the trans isomer and for deacetyldiltiazem',
        },
        {
          id: 'dtz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Use-dependent block measured on Cav1.2-expressing cells',
          description:
            'Measure block at different stimulation frequencies rather than at one. Non-dihydropyridine calcium blockers show use-dependence — they bind more when the channel is opening often — and that property is precisely why diltiazem slows a fast AV node more than a slow one. A single-frequency assay reports a number that does not describe the clinical behaviour.',
          dependsOnStepId: 'dtz-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells expressing human Cav1.2 with beta and alpha2-delta subunits, whole-cell patch clamp at 0.1, 1 and 3 Hz, barium as charge carrier, external solution buffered at physiological pH',
        },
        {
          id: 'dtz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'CYP3A4 inhibition constant against a probe substrate',
          description:
            'Quantify the inhibition of CYP3A4 with a standard probe such as midazolam hydroxylation, including the time-dependent component. This is not an optional characterisation step for this molecule: the largest recent safety finding for diltiazem is a drug interaction, not a direct pharmacological effect.',
          dependsOnStepId: 'dtz-w4',
          reagentsAndBuffer:
            'Human liver microsomes and recombinant CYP3A4, midazolam or testosterone as probe substrate, NADPH regenerating system, LC-MS/MS quantification of metabolite formation, preincubation arm to detect mechanism-based inhibition',
        },
      ],
    },
    keyAudits: [
      {
        id: 'dtz-a1',
        category: 'failed',
        title: 'MDPIT: no overall effect on death, and clear harm in one subgroup',
        laymanSummary:
          'Nearly two and a half thousand people were given diltiazem or a dummy tablet after a heart attack. Exactly as many died in each group. Underneath that flat result were two opposite effects: fewer heart events in patients with clear lungs, and more in patients whose lungs had fluid.',
        technicalDetails:
          'The Multicenter Diltiazem Postinfarction Trial randomised 2,466 patients with previous infarction to diltiazem 240 mg daily (n=1,234) or placebo (n=1,232), followed 12 to 52 months with a mean of 25. Total mortality was nearly identical: 167 against 166. First recurrent cardiac events, defined as cardiac death or non-fatal reinfarction, were 202 against 226 (Cox hazard ratio 0.90, 95% CI 0.74 to 1.08). A significant bidirectional interaction with radiographic pulmonary congestion was found at p=0.0042: in the 1,909 patients without congestion the hazard ratio was 0.77 (95% CI 0.61 to 0.98), and in the 490 with congestion it was 1.41 (95% CI 1.01 to 1.96). The same pattern appeared when ejection fraction was dichotomised at 0.40. The authors conclusion is that the neutral overall effect concealed a benefit in the majority without left ventricular dysfunction and an increase in events in the minority with it.',
        evidenceSource:
          'Multicenter Diltiazem Postinfarction Trial Research Group, N Engl J Med 1988;319:385-392',
        doi: '10.1056/NEJM198808183190701',
        measuredMetric:
          'Total mortality and first recurrent cardiac events after myocardial infarction, with a prespecified interaction by pulmonary congestion',
        auditFlag: 'verified',
      },
      {
        id: 'dtz-a2',
        category: 'conclusion_shift',
        title: 'The harm signal became a line in the contraindications',
        laymanSummary:
          'A trial found that a particular group of patients did worse on this drug. Thirty-odd years later, that group is named in the contraindications on the box. This is what the evidence system is supposed to do and rarely gets credit for.',
        technicalDetails:
          'The Cardizem CD label lists among its contraindications: patients with acute myocardial infarction and pulmonary congestion documented by x-ray on admission. That sentence is MDPIT written into regulatory text — the 490-patient subgroup in which cardiac events rose 41% on diltiazem. The Warnings section adds the corresponding physiology: although hemodynamic studies in humans with normal ventricular function have not shown a reduction in cardiac index or consistent negative effects on contractility, worsening of congestive heart failure has been reported in patients with pre-existing impairment of ventricular function, and experience of the combination with beta-blockers in that setting is limited. A subgroup finding that becomes a contraindication is unusual; most disappear into a discussion section.',
        evidenceSource:
          'CARDIZEM CD United States prescribing information, Contraindications and Warnings sections (NDA 020062); Multicenter Diltiazem Postinfarction Trial Research Group, N Engl J Med 1988;319:385-392',
        doi: '10.1056/NEJM198808183190701',
        inferredClaim:
          'That a neutral overall trial result means a drug is neutral for everyone in the trial — MDPIT is the counter-example, and its subgroup is now on the label',
        auditFlag: 'verified',
      },
      {
        id: 'dtz-a3',
        category: 'failed',
        title: 'A 21% higher rate of serious bleeding with two of the commonest anticoagulants',
        laymanSummary:
          'Diltiazem slows the breakdown of apixaban and rivaroxaban, so more of the blood thinner stays in the body. In two hundred thousand Medicare patients, those started on diltiazem bled seriously more often than those started on a beta-blocker.',
        technicalDetails:
          'A retrospective cohort of 204,155 United States Medicare beneficiaries aged 65 or over with atrial fibrillation, newly started on apixaban or rivaroxaban and simultaneously on diltiazem (n=53,275) or metoprolol (n=150,880), followed a median of 120 days. The primary composite of bleeding-related hospitalisation and death with recent evidence of bleeding was raised on diltiazem: rate difference 10.6 per 1,000 person-years (95% CI 7.0 to 14.2), hazard ratio 1.21 (95% CI 1.13 to 1.29). Bleeding-related hospitalisation alone had a hazard ratio of 1.22 (1.13 to 1.31), and death with recent evidence of bleeding 1.19 (1.05 to 1.34). The effect was dose-related: above 120 mg daily the rate difference was 15.1 per 1,000 person-years (HR 1.29, 1.19 to 1.39) against 6.7 at lower doses (HR 1.13, 1.04 to 1.24), and comparing high against low dose directly gave a hazard ratio of 1.14 (1.02 to 1.26). Ischaemic stroke, systemic embolism and death without evidence of bleeding did not differ. This is a cohort study, not a randomised trial, and the exposure comparison is between two drugs given for the same purpose in the same population, which is the design that gets closest to randomisation without being it.',
        evidenceSource:
          'Ray WA et al. Serious bleeding in patients with atrial fibrillation using diltiazem with apixaban or rivaroxaban. JAMA 2024;331:1565-1575',
        doi: '10.1001/jama.2024.3867',
        measuredMetric:
          'Composite of bleeding-related hospitalisation and death with recent evidence of bleeding, diltiazem against metoprolol',
        auditFlag: 'caution',
      },
      {
        id: 'dtz-a4',
        category: 'measured',
        title: 'NORDIL: as good as the old drugs on events, and worse at lowering blood pressure',
        laymanSummary:
          'Ten thousand people with high blood pressure were randomised to diltiazem or to the standard combination of a diuretic and a beta-blocker. The rate of strokes and heart attacks came out identical, even though diltiazem lowered the top number by three points less.',
        technicalDetails:
          'NORDIL was a prospective, randomised, open, blinded-endpoint study of 10,881 patients aged 50 to 74 with diastolic pressure of 100 mmHg or more, in Norwegian and Swedish health centres. Blood pressure fell 20.3/18.7 mmHg on diltiazem against 23.3/18.7 mmHg on diuretics, beta-blockers or both, a significant difference in systolic reduction (p<0.001). The combined primary endpoint of fatal and non-fatal stroke, myocardial infarction and other cardiovascular death occurred in 403 against 400 patients, 16.6 against 16.2 events per 1,000 patient-years, relative risk 1.00 (95% CI 0.87 to 1.15, p=0.97). Stroke alone favoured diltiazem: 6.4 against 7.9 per 1,000 patient-years, RR 0.80 (0.65 to 0.99, p=0.04). Myocardial infarction went the other way without reaching significance: 7.4 against 6.3 per 1,000 patient-years, RR 1.16 (0.94 to 1.44, p=0.17). Equal outcomes at unequal blood pressure is an interesting result and it is also the kind of result that generates two opposite press releases.',
        evidenceSource: 'Hansson L et al., Lancet 2000;356:359-365 (NORDIL)',
        doi: '10.1016/s0140-6736(00)02526-5',
        measuredMetric:
          'Composite of fatal and non-fatal stroke, myocardial infarction and other cardiovascular death, diltiazem against diuretic or beta-blocker therapy',
        auditFlag: 'verified',
      },
      {
        id: 'dtz-a5',
        category: 'inferred',
        title: 'Exercise tolerance is the measured angina endpoint, and it is not an event count',
        laymanSummary:
          'What the drug is licensed to do in angina is improve how far you can walk on a treadmill before the chest pain starts. No trial has shown it prevents heart attacks in stable angina.',
        technicalDetails:
          'The Cardizem LA indication is improving exercise tolerance in patients with chronic stable angina, and the mechanism section attributes that to reduced myocardial oxygen demand through lower heart rate and blood pressure at submaximal and maximal workloads, plus coronary dilatation. The label also records that diltiazem is a potent dilator of both epicardial and subendocardial coronary arteries and inhibits spontaneous and ergonovine-induced spasm, which is the basis for the vasospastic angina indication. None of that is an outcome claim. In the one large post-infarction trial, total mortality was identical, and in the one large hypertension outcome trial the composite was identical to the comparator. Diltiazem is a symptomatic and physiological drug with no demonstrated effect on survival in any population studied.',
        evidenceSource:
          'CARDIZEM LA and CARDIZEM CD United States prescribing information, Indications and Clinical Pharmacology sections; MDPIT, N Engl J Med 1988;319:385-392; NORDIL, Lancet 2000;356:359-365',
        inferredClaim:
          'That better exercise tolerance and fewer anginal episodes translate into fewer infarctions or deaths — not shown for this drug in any trial that looked',
        auditFlag: 'caution',
      },
      {
        id: 'dtz-a6',
        category: 'failed',
        title: 'Conduction block is rare, additive and occasionally abrupt',
        laymanSummary:
          'Diltiazem slows the electrical relay between the heart chambers. In four cases per thousand that slowing becomes a block. Added to a beta-blocker or digoxin, the effect compounds.',
        technicalDetails:
          'The label records that diltiazem prolongs AV node refractory periods without significantly prolonging sinus node recovery time except in sick sinus syndrome, and that this rarely produces abnormally slow heart rates or second- or third-degree AV block in 13 of 3,290 patients, or 0.40%. Concomitant use with beta-blockers or digitalis may have additive effects on conduction. One patient with Prinzmetal angina developed periods of asystole of 2 to 5 seconds after a single 60 mg dose. Contraindications include sick sinus syndrome and second- or third-degree AV block without a functioning ventricular pacemaker, and systolic pressure below 90 mmHg.',
        evidenceSource:
          'CARDIZEM CD United States prescribing information, Warnings and Contraindications sections',
        measuredMetric:
          'Second- or third-degree AV block in 13 of 3,290 patients (0.40%) in the trial database',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A different door on the same channel',
        laymanDesc:
          'The calcium channel this drug blocks has several separate binding pockets. Diltiazem uses one of its own, which is why it behaves differently from amlodipine even though both are called calcium channel blockers.',
        molecularDetail:
          'Diltiazem binds the benzothiazepine site on the alpha-1C subunit of Cav1.2, distinct from the dihydropyridine site used by amlodipine and the phenylalkylamine site used by verapamil. Block is use-dependent, so tissue that is depolarising frequently is blocked more than tissue that is not.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 2,
        title: 'Artery muscle cannot squeeze without calcium',
        laymanDesc:
          'With calcium entry blocked, the muscle wrapped around arteries relaxes. The coronary arteries feeding the heart widen along with the rest.',
        molecularDetail:
          'Inhibition of calcium influx during membrane depolarisation reduces vascular smooth muscle contraction and peripheral resistance. The label describes diltiazem as a potent dilator of both epicardial and subendocardial coronary arteries, and records that spontaneous and ergonovine-induced coronary spasm is inhibited.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 3,
        title: 'The electrical relay between chambers slows',
        laymanDesc:
          'The signal passing from the top chambers to the bottom ones travels on the same kind of calcium current. Slowing it is how the drug brings down a racing pulse in atrial fibrillation.',
        molecularDetail:
          'Diltiazem prolongs AV nodal refractory period without significantly prolonging sinus node recovery time except in sick sinus syndrome. Use-dependence means the effect is larger at high atrial rates, which is why the intravenous form controls a fast ventricular response.',
        iconName: 'Timer',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Less oxygen demand, so less chest pain',
        laymanDesc:
          'A slower heart working against lower pressure needs less oxygen, and wider coronary arteries deliver more. Angina eases from both directions at once.',
        molecularDetail:
          'The label attributes increased exercise tolerance to reduced myocardial oxygen demand through lower heart rate and systemic pressure at submaximal and maximal workloads, combined with coronary dilatation at drug levels causing little or no negative inotropic effect in humans with normal ventricular function.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'The same effect is harmful in a heart that is already failing',
        laymanDesc:
          'A heart that has just been damaged and is holding fluid cannot afford any reduction in its squeezing power. In that group, this drug made things worse.',
        molecularDetail:
          'In MDPIT, patients with radiographic pulmonary congestion had a cardiac event hazard ratio of 1.41 (95% CI 1.01 to 1.96) on diltiazem, against 0.77 (0.61 to 0.98) in patients without it, interaction p=0.0042. The label now contraindicates use in acute myocardial infarction with pulmonary congestion documented on admission.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'The enzyme it blocks on the way past',
        laymanDesc:
          'Diltiazem also slows the liver enzyme that clears many other drugs, so those drugs build up. With modern blood thinners this shows up as bleeding.',
        molecularDetail:
          'Diltiazem is a CYP3A4 substrate and moderate inhibitor. In 204,155 Medicare patients on apixaban or rivaroxaban, starting diltiazem rather than metoprolol was associated with a serious bleeding hazard ratio of 1.21 (95% CI 1.13 to 1.29), rising to 1.29 above 120 mg daily.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MDPIT (N Engl J Med 1988;319:385-392)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 2466,
        primaryEndpoint:
          'Total mortality and first recurrent cardiac event after myocardial infarction',
        endpointMet: false,
        statisticalPValue:
          'Total mortality 167 against 166, nearly identical; first recurrent cardiac events HR 0.90 (95% CI 0.74 to 1.08); interaction with pulmonary congestion p=0.0042',
        unreportedAdverseSignals:
          'In the 490 patients with pulmonary congestion the hazard ratio was 1.41 (95% CI 1.01 to 1.96) — a 41% increase in cardiac events. That subgroup is now a contraindication on the label.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'NORDIL (Lancet 2000;356:359-365)',
        phase: 'Phase 4, prospective, randomised, open, blinded endpoint',
        sampleSize: 10881,
        primaryEndpoint:
          'Combined fatal and non-fatal stroke, myocardial infarction and other cardiovascular death',
        endpointMet: true,
        statisticalPValue:
          '16.6 against 16.2 events per 1,000 patient-years; relative risk 1.00 (95% CI 0.87 to 1.15), p=0.97',
        unreportedAdverseSignals:
          'Open-label design with blinded endpoint adjudication. Systolic pressure fell 3 mmHg less on diltiazem (p<0.001), so equal outcomes were achieved at unequal blood pressure — which can be read as a drug advantage or as a chance finding, and the trial cannot distinguish them.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Ray et al. Medicare cohort (JAMA 2024;331:1565-1575)',
        phase: 'Retrospective cohort with overlap weighting, not randomised',
        sampleSize: 204155,
        primaryEndpoint:
          'Composite of bleeding-related hospitalisation and death with recent evidence of bleeding, diltiazem against metoprolol in users of apixaban or rivaroxaban',
        endpointMet: true,
        statisticalPValue:
          'Rate difference 10.6 per 1,000 person-years (95% CI 7.0 to 14.2); hazard ratio 1.21 (95% CI 1.13 to 1.29), with a dose gradient above and below 120 mg daily',
        unreportedAdverseSignals:
          'Observational. Channelling by indication is possible even between two rate-control drugs, and the median follow-up was 120 days, which is short relative to the anticoagulation itself.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Total mortality after infarction identical to placebo in 2,466 patients: 167 deaths against 166',
        'Cardiac events raised 41% in the 490 patients with pulmonary congestion and lowered 23% in the 1,909 without it (interaction p=0.0042)',
        'No difference in the cardiovascular composite against diuretic or beta-blocker therapy in 10,881 hypertensive patients (RR 1.00, p=0.97)',
        'A 21% higher rate of serious bleeding than metoprolol among 204,155 Medicare patients on apixaban or rivaroxaban',
      ],
      unsupportedInferences: [
        'That improving exercise tolerance in stable angina translates into fewer infarctions or deaths, which no diltiazem trial has shown',
        'That a neutral trial result means a neutral drug — MDPIT concealed benefit and harm of similar size in opposite subgroups',
        'That the lower stroke rate in NORDIL is a diltiazem property rather than one of several secondary endpoints in a trial whose primary was flat',
        'That being a calcium channel blocker makes diltiazem interchangeable with amlodipine — they bind different sites and do different things to the AV node',
      ],
      whatFailedInitially: [
        'MDPIT found no overall mortality benefit after infarction and a clear harm signal in patients with pulmonary congestion',
        'NORDIL lowered systolic pressure 3 mmHg less than the comparator regimen and matched it on events, which answers neither question cleanly',
        'The CYP3A4 interaction with the direct oral anticoagulants was quantified in 2024, more than forty years after approval and a decade after those anticoagulants launched',
        'Second- or third-degree AV block occurred in 0.40% of the trial database, and one patient had 2 to 5 second asystole after a single 60 mg dose',
      ],
      realWorldOutcome: [
        'Approved in the United States on 5 November 1982 under NDA 018602 and available in 177 listed generic products across many release profiles',
        'A first-choice drug for vasospastic angina, where its coronary dilatation and spasm inhibition are the mechanism that fits',
        'One of the few drugs whose harmful subgroup from a 1988 trial is quoted verbatim in its own contraindications',
        'The 2024 anticoagulant bleeding finding has changed rate-control prescribing in atrial fibrillation more than anything else about the drug in thirty years',
      ],
    },
    deliverySystem: {
      type: 'Immediate-release tablet, several extended-release capsule and tablet formats, and an intravenous bolus and infusion',
      description:
        'The oral forms are not interchangeable: the many extended-release products differ in release profile and are approved separately, which is why 177 distinct products are listed in the pricing survey. The intravenous route exists for one job the oral route cannot do quickly enough — bringing down a fast ventricular rate in atrial fibrillation or flutter, and converting paroxysmal supraventricular tachycardia.',
      safetyProfile:
        'Contraindicated in sick sinus syndrome and in second- or third-degree AV block without a functioning ventricular pacemaker, in systolic pressure below 90 mmHg, in hypersensitivity, and in acute myocardial infarction with pulmonary congestion documented by x-ray on admission. Conduction effects are additive with beta-blockers and digitalis. Worsening congestive heart failure has been reported where ventricular function was already impaired. As a CYP3A4 inhibitor it raises exposure to a long list of co-prescribed drugs, and the largest quantified consequence is bleeding on apixaban or rivaroxaban.',
    },
    commonQuestions: [
      {
        q: 'Is diltiazem the same as amlodipine?',
        a: 'They are both called calcium channel blockers and they are not the same drug. They bind different pockets on the same channel and produce different clinical effects. Amlodipine acts almost entirely on artery muscle: it lowers blood pressure and does essentially nothing to the electrical conduction of the heart. Diltiazem acts on both, so it also slows the pulse and can control a fast atrial fibrillation, which amlodipine cannot. The corollary is that diltiazem carries risks amlodipine does not — heart block, worsening of a weak heart, and a drug interaction with several common medicines through the liver enzyme CYP3A4.',
      },
      {
        q: 'I take a blood thinner. Does that matter?',
        a: 'If it is apixaban or rivaroxaban, it matters and it is worth raising. Diltiazem slows the enzyme that clears both drugs, so more of the anticoagulant stays in the blood. A study of 204,155 Medicare patients with atrial fibrillation compared people started on diltiazem against people started on metoprolol, all of them on one of those two anticoagulants. Serious bleeding was 21% more common on diltiazem — about 10.6 extra events per thousand patient-years — and the excess was roughly twice as large at daily doses above 120 mg. Strokes and clots were no different. This is an observational study rather than a randomised trial, and it is the largest and most direct evidence there is on the question.',
        auditNote:
          'The comparison is between two drugs used for the same job in the same patients, which is the design that comes closest to randomisation without being it. It is still a cohort study and cannot exclude channelling by indication.',
      },
      {
        q: 'Will it stop me having a heart attack?',
        a: 'No trial has shown that. In the largest trial after myocardial infarction, 2,466 patients, deaths were identical: 167 on diltiazem and 166 on placebo. In the largest hypertension trial, 10,881 patients, the combined rate of stroke, heart attack and cardiovascular death was identical to a diuretic and beta-blocker regimen. What diltiazem is licensed to do is improve exercise tolerance in stable angina, lower blood pressure, and control heart rate — all of which are things you can feel or measure directly, and none of which is an event count. That is not a criticism of the drug so much as a description of what it is for.',
      },
      {
        q: 'Why is there a warning about heart attacks with fluid on the lungs?',
        a: 'Because of a specific trial finding that is now on the label. In MDPIT, the drug looked neutral overall — the same number of deaths in both groups — but underneath, patients whose chest x-ray showed pulmonary congestion had 41% more cardiac events on diltiazem, while those with clear lungs had 23% fewer. The interaction was strong enough (p=0.0042) that it made its way into the contraindications, which now name acute myocardial infarction with pulmonary congestion documented on admission. It is a good example of why a flat overall result is not the end of the analysis, and an unusual example of a subgroup finding being acted on rather than discussed.',
      },
      {
        q: 'Can I take it with a beta-blocker?',
        a: 'Sometimes, carefully, and the two together do compound each other. Both slow conduction through the AV node, and the label says explicitly that concomitant use with beta-blockers or digitalis may have additive effects on cardiac conduction. Second- or third-degree block occurred in 0.40% of patients in the diltiazem trial database on the drug alone. The label also notes that experience with the combination in patients whose ventricular function is already impaired is limited, which is the situation in which both drugs are most likely to be wanted and least likely to be safe.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Multicenter Diltiazem Postinfarction Trial Research Group. The effect of diltiazem on mortality and reinfarction after myocardial infarction. N Engl J Med 1988;319:385-392',
        identifier: '10.1056/NEJM198808183190701',
        kind: 'doi',
      },
      {
        label:
          'Hansson L, Hedner T, Lund-Johansen P, et al. Randomised trial of effects of calcium antagonists compared with diuretics and beta-blockers on cardiovascular morbidity and mortality in hypertension: the Nordic Diltiazem (NORDIL) study. Lancet 2000;356:359-365',
        identifier: '10.1016/s0140-6736(00)02526-5',
        kind: 'doi',
      },
      {
        label:
          'Ray WA, Chung CP, Stein CM, et al. Serious bleeding in patients with atrial fibrillation using diltiazem with apixaban or rivaroxaban. JAMA 2024;331:1565-1575',
        identifier: '10.1001/jama.2024.3867',
        kind: 'doi',
      },
      {
        label:
          'Pepine CJ, Handberg EM, Cooper-DeHoff RM, et al. A calcium antagonist vs a non-calcium antagonist hypertension treatment strategy for patients with coronary artery disease (INVEST). JAMA 2003;290:2805-2816',
        identifier: '10.1001/jama.290.21.2805',
        kind: 'doi',
      },
      {
        label:
          'Drugs@FDA: CARDIZEM (diltiazem hydrochloride), NDA 018602 — original approval 5 November 1982; CARDIZEM CD NDA 020062 and CARDIZEM LA NDA 021392 prescribing information',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=018602',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — diltiazem, 177 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 39186 — diltiazem structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/39186',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 6. Verapamil — the strongest rate-slowing calcium blocker, whose post-infarction trial missed
  //    mortality, and which is now being tested for something entirely unrelated to the heart.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'verapamil',
    name: 'Verapamil',
    tradeName: 'Calan / Isoptin / Verelan / Verelan PM / Covera-HS',
    sponsor:
      'Mt Adams Pharmaceuticals and many generic manufacturers; originated at Knoll AG in Germany',
    targetGene: 'CACNA1C',
    targetProtein:
      'Alpha-1C subunit of the L-type voltage-gated calcium channel (Cav1.2), bound at the phenylalkylamine site inside the pore',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1981,
    indication:
      'Angina at rest including vasospastic and unstable angina; chronic stable angina; control of ventricular rate in chronic atrial flutter or fibrillation in association with digitalis; prophylaxis of repetitive paroxysmal supraventricular tachycardia; and essential hypertension',
    patientFriendlyIndication:
      'Chest pain, a racing or irregular heartbeat, and high blood pressure',
    anatomicalSite:
      'Atrioventricular and sinoatrial nodes, and vascular smooth muscle — the phenylalkylamine site inside the pore of the L-type calcium channel',
    conditionContext: {
      conditionExplainer:
        'The heart has two kinds of electrical tissue. Most of it fires on sodium; the sinus node and the atrioventricular node fire on calcium. A drug that blocks the calcium channel therefore acts almost exclusively on the pacemaker and the relay, which is why verapamil slows the pulse and terminates the reentrant rhythms that use the AV node as one arm of their circuit.',
      whyItMatters:
        'Verapamil is the strongest rate-slowing member of the calcium blocker family, and the price of that strength is the largest reduction in contractile force. Its contraindications are all versions of the same sentence: do not give it to a heart that cannot afford to squeeze less hard, or to one whose electrical circuit has an alternative route the drug will not block.',
      whoTakesThis:
        'Adults with angina including the vasospastic form, adults needing ventricular rate control in atrial fibrillation or flutter, adults with recurrent supraventricular tachycardia, and adults with high blood pressure. Not people with severe left ventricular dysfunction, and not people with pre-excited atrial fibrillation.',
      clinicalGoals:
        'Fewer anginal episodes, a controlled ventricular rate, a lower blood pressure. Its two large outcome trials measured deaths and events, and neither showed the drug reduced them.',
    },
    oneSentenceVerdict:
      'A phenylalkylamine calcium blocker that slows the AV node harder than any other oral drug in its class, whose post-infarction trial in 1,775 patients missed mortality at p=0.11 while cutting major events by 20% (p=0.03), and which in 22,576 hypertensive patients with coronary disease matched an atenolol strategy exactly (RR 0.98) rather than beating it.',
    laymanHowItWorks:
      'The electrical relay between the top and bottom chambers of the heart runs on calcium rather than sodium, unlike most heart tissue. Verapamil sits inside the calcium channel and blocks it, so the relay slows and a racing pulse comes down. In circuits that loop through that relay, blocking it stops the loop and the rhythm reverts. The same block relaxes artery muscle, which lowers blood pressure and eases angina, and it also weakens the squeeze of the heart itself — which is helpful in some conditions and dangerous in a heart that is already failing.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 70,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1803 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 43 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'First approved in the United States in 1981 and generic for decades. Verapamil appears on the WHO Model List of Essential Medicines. The chronotherapeutic formulations designed to release drug overnight, such as Covera-HS, were the last part of the franchise to hold protection, and the concept did not survive the failure of the outcome hypothesis behind it.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'For rate control the alternatives are diltiazem and the beta-blockers, and the choice turns on how much contractile reserve the heart has and what else the patient is taking. For blood pressure alone, verapamil is a poor first choice in most guidelines. For supraventricular tachycardia the real alternative is not a drug at all: catheter ablation cures the reentrant circuits that verapamil only interrupts.',
      conventionalRx: [
        {
          name: 'Diltiazem',
          class: 'Non-dihydropyridine calcium channel blocker, benzothiazepine class',
          howItCompares:
            'Binds a different site on the same channel, slows the AV node almost as much and depresses contractility less. Its own post-infarction trial, MDPIT, found the same subgroup pattern as verapamil DAVIT-II: benefit without pulmonary congestion, harm with it.',
          typicalCost:
            'US$0.3196 per unit at United States pharmacy acquisition cost (CMS NADAC, median across 177 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: less negative inotropy; far less constipation. Cons: the same CYP3A4 interaction problem, now quantified against apixaban and rivaroxaban in 204,155 patients; more expensive per unit.',
        },
        {
          name: 'Metoprolol or another beta-blocker',
          class: 'Beta-1 adrenergic blocker',
          howItCompares:
            'Slows the same node by blocking adrenaline rather than calcium, and unlike verapamil has mortality evidence in heart failure and after infarction. In INVEST, an atenolol-based strategy and a verapamil-based strategy produced identical primary event rates in 22,576 patients (9.93% against 10.17%).',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: safe in reduced ejection fraction, where verapamil is contraindicated; no constipation; no CYP3A4 inhibition. Cons: bronchospasm risk; fatigue; no coronary vasodilatation for vasospastic angina.',
        },
        {
          name: 'Catheter ablation, for recurrent supraventricular tachycardia',
          class: 'Procedure rather than drug',
          howItCompares:
            'Verapamil interrupts a reentrant circuit each time it fires; ablation destroys the circuit. For AV nodal reentrant tachycardia the procedure is curative in the large majority and removes the need for daily medication.',
          typicalCost:
            'A one-off procedural cost rather than a daily drug cost; not comparable per unit',
          prosAndCons:
            'Pros: definitive rather than suppressive. Cons: an invasive procedure with a small risk of AV block requiring a pacemaker, and it is not an option for atrial fibrillation rate control in the same way.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Take constipation seriously rather than tolerating it',
          action:
            'Report constipation, and say if it becomes severe or if the abdomen becomes distended.',
          patientImpact:
            'Constipation occurred in 7.3% of 4,954 patients in the trial database, by a wide margin the commonest adverse effect and the commonest reason the drug is abandoned. Reversible non-obstructive paralytic ileus has been reported infrequently.',
          clinicalPrecaution:
            'The mechanism is direct: gut smooth muscle uses the same L-type calcium channel as artery muscle. Severe abdominal distension with absent bowel sounds is not a side effect to manage at home.',
        },
        {
          name: 'Say if you have ever been told you have an extra electrical pathway',
          action:
            'Mention Wolff-Parkinson-White syndrome or any accessory pathway before taking this drug.',
          patientImpact:
            'Atrial flutter or fibrillation with an accessory bypass tract is a contraindication. Blocking the AV node in that setting can push conduction down the accessory pathway instead, accelerating the ventricular rate rather than slowing it.',
          clinicalPrecaution:
            'This is one of the few situations in cardiology where the correct drug and the dangerous drug produce opposite effects for the same presenting complaint.',
        },
        {
          name: 'Report breathlessness or swelling',
          action: 'Say if you become short of breath, or if your legs or abdomen swell.',
          patientImpact:
            'Verapamil weakens the heart squeeze. Congestive heart failure or pulmonary oedema developed in 87 of 4,954 patients, or 1.8%, in the clinical trial database. It is contraindicated in severe left ventricular dysfunction and should be avoided at ejection fractions below 30%.',
          clinicalPrecaution:
            'The label directs avoiding it in any degree of ventricular dysfunction if a beta-blocker is also being taken, because the two negative inotropic effects add.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(C)C(CCCN(C)CCC1=CC(=C(C=C1)OC)OC)(C#N)C2=CC(=C(C=C2)OC)OC',
      chemicalFormula: 'C27H38N2O4',
      molecularWeight: '454.60 g/mol (free base); dispensed as verapamil hydrochloride',
      targetReceptorAffinity:
        'Binds the phenylalkylamine site within the pore of Cav1.2, reached from the cytoplasmic side, which is why block is strongly use-dependent and why the drug acts most on tissue that is depolarising fastest. Marketed as a racemate: the S-enantiomer is substantially more potent at cardiac tissue and is cleared faster on first pass, so the intravenous and oral routes deliver different enantiomer ratios and different degrees of AV nodal block per milligram.',
      structureSource: {
        label:
          'PubChem CID 2520 (verapamil) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2520',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'vpm-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the racemic ratio and the nitrile',
          description:
            'Verapamil is marketed as a racemate whose enantiomers differ substantially in cardiac potency and in first-pass clearance. Confirm the ratio rather than assume it, and confirm the nitrile group, which is the quaternary carbon substituent that fixes the molecule geometry inside the pore.',
          reagentsAndBuffer:
            'Verapamil hydrochloride reference standard, chiral HPLC on a cellulose or amylose phase, infrared confirmation of the nitrile stretch near 2240 wavenumbers, 1H NMR in DMSO-d6, Karl Fischer titration',
        },
        {
          id: 'vpm-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Alkylate the arylacetonitrile and couple the aminopropyl chain',
          description:
            'Deprotonate 3,4-dimethoxyphenylacetonitrile and alkylate with an isopropyl halide to build the quaternary centre, then alkylate again with a chloropropyl chain and couple to N-methylhomoveratrylamine. The two dimethoxyphenyl rings at either end of the molecule are what give it the length required to reach the pore site from inside the cell.',
          dependsOnStepId: 'vpm-w1',
          reagentsAndBuffer:
            '3,4-dimethoxyphenylacetonitrile, sodium hydride or sodium amide in toluene, 2-bromopropane, 1-bromo-3-chloropropane, N-methyl-2-(3,4-dimethoxyphenyl)ethylamine, potassium iodide catalysis, nitrogen atmosphere',
        },
        {
          id: 'vpm-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Remove the dialkylated by-product and crystallise the hydrochloride',
          description:
            'The secondary amine can alkylate twice, and the resulting quaternary ammonium species is both inactive and highly water-soluble, which makes it easy to miss on a lipophilic assay. Purification targets it explicitly before the hydrochloride is crystallised.',
          dependsOnStepId: 'vpm-w2',
          reagentsAndBuffer:
            'Acid-base extraction, silica chromatography where required, hydrogen chloride in isopropanol, crystallisation with controlled cooling, HPLC release testing with a specified limit for quaternary impurities',
        },
        {
          id: 'vpm-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Use-dependent block from the intracellular face',
          description:
            'The phenylalkylamine site is reached from inside the cell and only when the channel is open, so block accumulates with stimulation frequency. Measure at several pacing rates and with the drug applied inside and outside the cell separately. A single-frequency, extracellular measurement misses the property that makes the drug useful in a fast arrhythmia.',
          dependsOnStepId: 'vpm-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells expressing human Cav1.2 with beta and alpha2-delta subunits, whole-cell patch clamp at 0.1, 1 and 3 Hz, intracellular perfusion arm, barium as charge carrier',
        },
        {
          id: 'vpm-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Separate the nodal effect from the contractile effect on tissue',
          description:
            'Measure AV nodal conduction delay and developed tension in the same preparation at the same concentrations, and report the ratio. That ratio is the entire clinical distinction between verapamil and diltiazem, and it is what determines whether a given heart tolerates the drug.',
          dependsOnStepId: 'vpm-w4',
          reagentsAndBuffer:
            'Isolated perfused rabbit or guinea-pig heart with atrial pacing and His bundle electrogram, isolated papillary muscle for developed tension, Krebs-Henseleit buffer at 37 degrees Celsius',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vpm-a1',
        category: 'failed',
        title: 'DAVIT-II: mortality missed at p=0.11, events met at p=0.03',
        laymanSummary:
          'Nearly eighteen hundred patients were given verapamil or a dummy tablet from the second week after a heart attack. Deaths fell from 13.8% to 11.1%, which was not statistically convincing. The combined count of deaths and repeat heart attacks did reach significance.',
        technicalDetails:
          'The Danish Verapamil Infarction Trial II randomised 878 patients to verapamil 360 mg daily and 897 to placebo, starting in the second week after admission and continuing up to 18 months, mean 16. There were 95 deaths and 146 major events on verapamil against 119 deaths and 180 major events on placebo. Eighteen-month mortality was 11.1% against 13.8% (p=0.11, hazard ratio 0.80, 95% CI 0.61 to 1.05) — not significant. Major event rate, defined as death or reinfarction, was 18.0% against 21.6% (p=0.03, hazard ratio 0.80, 95% CI 0.64 to 0.99). The benefit was confined to patients without heart failure in the coronary care unit: mortality 7.7% against 11.8% (p=0.02, HR 0.64, 95% CI 0.44 to 0.94) without heart failure, and 17.9% against 17.5% (p=0.79, HR 1.05, 95% CI 0.72 to 1.54) with it. The same split found in the diltiazem trial appeared here in a different drug and a different country.',
        evidenceSource:
          'Danish Study Group on Verapamil in Myocardial Infarction, Am J Cardiol 1990;66:779-785 (DAVIT II)',
        doi: '10.1016/0002-9149(90)90351-z',
        measuredMetric:
          'Eighteen-month mortality and major event rate after myocardial infarction, with a prespecified split by heart failure at admission',
        auditFlag: 'caution',
      },
      {
        id: 'vpm-a2',
        category: 'measured',
        title: 'INVEST: identical to an atenolol strategy in 22,576 patients',
        laymanSummary:
          'The largest verapamil trial compared a verapamil-based plan against a beta-blocker-based plan in twenty-two thousand people with both high blood pressure and coronary disease. The rates of death, heart attack and stroke came out the same.',
        technicalDetails:
          'INVEST randomised 22,576 hypertensive patients aged 50 or over with coronary artery disease, at 862 sites in 14 countries, to a calcium antagonist strategy based on sustained-release verapamil or a non-calcium-antagonist strategy based on atenolol, each with trandolapril and hydrochlorothiazide added to reach blood pressure goals. After 61,835 patient-years, mean 2.7 per patient, 2,269 patients had a primary outcome of death from any cause, non-fatal myocardial infarction or non-fatal stroke: 9.93% on the verapamil strategy and 10.17% on the atenolol strategy, relative risk 0.98 (95% CI 0.90 to 1.06). Two-year blood pressure control was similar, with 71.7% and 70.7% reaching below 140/90 mmHg. The conclusion is that the verapamil-trandolapril strategy was as clinically effective as the atenolol-hydrochlorothiazide strategy. As clinically effective is not more effective, and this trial was designed and reported as a comparison of strategies rather than of molecules — by 24 months only 81.5% of the verapamil arm was still on verapamil.',
        evidenceSource: 'Pepine CJ et al., JAMA 2003;290:2805-2816 (INVEST)',
        doi: '10.1001/jama.290.21.2805',
        measuredMetric:
          'First occurrence of all-cause death, non-fatal myocardial infarction or non-fatal stroke',
        auditFlag: 'verified',
      },
      {
        id: 'vpm-a3',
        category: 'measured',
        title: 'Constipation in 7.3%, heart failure in 1.8%, from a database of 4,954 patients',
        laymanSummary:
          'The commonest problem with verapamil is not cardiac. Seven in a hundred become constipated, because the gut muscle uses the same calcium channel as artery muscle. Nearly two in a hundred developed heart failure or fluid on the lungs.',
        technicalDetails:
          'From the clinical trial database of 4,954 patients: constipation 7.3%, dizziness 3.3%, nausea 2.7%, hypotension 2.5%, headache 2.2%, oedema 1.9%, congestive heart failure or pulmonary oedema 1.8% (87 patients), fatigue 1.7%, dyspnoea 1.4%, bradycardia below 50 beats per minute 1.4%, total AV block of any degree 1.2% with second- and third-degree at 0.8%, rash 1.2%, flushing 0.6%. Reversible non-obstructive paralytic ileus has been reported infrequently. In the subset treated for rate control in digitalised atrial fibrillation or flutter, ventricular rates below 50 at rest occurred in 15% and asymptomatic hypotension in 5%. The label also records elevations of transaminases, sometimes transient and sometimes persisting, with several cases of hepatocellular injury.',
        evidenceSource:
          'Verapamil hydrochloride United States prescribing information, Warnings and Adverse Reactions sections',
        measuredMetric:
          'Adverse reaction rates from a pooled clinical trial population of 4,954 patients',
        auditFlag: 'verified',
      },
      {
        id: 'vpm-a4',
        category: 'failed',
        title: 'Two contraindications that describe the drug own mechanism turning on the patient',
        laymanSummary:
          'Verapamil weakens the heart squeeze, so it must not be used in a heart that is already failing badly. And it blocks the normal electrical relay, so in people with an extra pathway it can push the impulse down that pathway instead and make the rhythm faster, not slower.',
        technicalDetails:
          'Contraindications are severe left ventricular dysfunction; hypotension below 90 mmHg systolic or cardiogenic shock; sick sinus syndrome or second- or third-degree AV block without a functioning pacemaker; atrial flutter or fibrillation with an accessory bypass tract such as Wolff-Parkinson-White or Lown-Ganong-Levine; and hypersensitivity. The Warnings section directs avoiding the drug at ejection fraction below 30% or with moderate to severe cardiac failure symptoms, and in any degree of ventricular dysfunction if a beta-adrenergic blocker is also being given, because the negative inotropic effects are additive. Both contraindications are the therapeutic mechanism applied to the wrong heart: negative inotropy where contractile reserve is already exhausted, and AV nodal block where an alternative conduction route exists.',
        evidenceSource:
          'Verapamil hydrochloride United States prescribing information, Contraindications and Warnings sections',
        auditFlag: 'caution',
      },
      {
        id: 'vpm-a5',
        category: 'inferred',
        title: 'A beta-cell result in type 1 diabetes, on a surrogate, in 88 children',
        laymanSummary:
          'Verapamil is being investigated for something with no connection to the heart: preserving the insulin-producing cells in newly diagnosed type 1 diabetes. A randomised trial in eighty-eight children found more insulin production after a year. Blood sugar control was not measurably better.',
        technicalDetails:
          'The CLVer trial randomised 88 children and adolescents aged 7 to 17 within a month of type 1 diabetes diagnosis to once-daily oral verapamil (n=47) or placebo (n=41), within a factorial design also testing intensive diabetes management. The primary endpoint was area under the curve for C-peptide stimulated by a mixed-meal tolerance test at 52 weeks. Mean C-peptide AUC went from 0.66 to 0.65 pmol/mL on verapamil and from 0.60 to 0.44 on placebo, an adjusted between-group difference of 0.14 pmol/mL (95% CI 0.01 to 0.27, p=0.04), equating to a 30% higher C-peptide level at 52 weeks. HbA1c at 52 weeks was 6.6% against 6.9%, adjusted difference -0.3% (95% CI -1.0 to 0.4) — not significant. Treatment-related non-serious adverse events occurred in 17% against 20%. The rationale is that calcium blockade reduces thioredoxin-interacting protein overexpression, which drives beta-cell apoptosis in preclinical models. This is a genuine randomised result on a mechanistic surrogate, in 88 children, with a confidence interval whose lower bound is 0.01, and with no measurable difference in the outcome patients experience.',
        evidenceSource:
          'Forlenza GP et al. Effect of verapamil on pancreatic beta cell function in newly diagnosed pediatric type 1 diabetes: a randomized clinical trial. JAMA 2023;329:990-999 (CLVer, NCT04233034)',
        doi: '10.1001/jama.2023.2064',
        inferredClaim:
          'That preserved C-peptide secretion at one year will translate into better long-term glycaemic control or fewer complications — the trial measured the surrogate, found no HbA1c difference, and says longitudinal durability is unknown',
        auditFlag: 'caution',
      },
      {
        id: 'vpm-a6',
        category: 'conclusion_shift',
        title: 'Two calcium blockers, two countries, the same subgroup',
        laymanSummary:
          'The Danish verapamil trial and the American diltiazem trial were run separately with different drugs. Both found the same thing: benefit in patients whose hearts were coping, harm or nothing in patients whose hearts were failing.',
        technicalDetails:
          'DAVIT-II found post-infarction mortality of 7.7% against 11.8% (HR 0.64, 95% CI 0.44 to 0.94) in patients without heart failure in the coronary care unit, and 17.9% against 17.5% (HR 1.05, 95% CI 0.72 to 1.54) in those with it. MDPIT, published two years earlier with diltiazem in 2,466 patients, found cardiac event hazard ratios of 0.77 (0.61 to 0.98) without radiographic pulmonary congestion and 1.41 (1.01 to 1.96) with it, interaction p=0.0042. Two independently designed trials of two different molecules binding two different sites on the same channel converged on the same modifier. That convergence is the strongest evidence either trial provides, and it is a class-level physiological finding — negative inotropy is tolerable when there is contractile reserve and not when there is none — rather than a property of either drug.',
        evidenceSource:
          'Danish Study Group on Verapamil in Myocardial Infarction, Am J Cardiol 1990;66:779-785; Multicenter Diltiazem Postinfarction Trial Research Group, N Engl J Med 1988;319:385-392',
        doi: '10.1016/0002-9149(90)90351-z',
        inferredClaim:
          'That either trial subgroup result stands alone — each is a subgroup analysis, and what makes them credible is that they replicate each other across drugs, countries and endpoints',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'It reaches the channel from the inside',
        laymanDesc:
          'Unlike the calcium blockers used for blood pressure, verapamil has to get into the cell first and then blocks the channel from within, and only while the channel is open.',
        molecularDetail:
          'Verapamil binds the phenylalkylamine site within the pore of Cav1.2, accessible from the cytoplasmic face and only in the open state. Block is therefore strongly use-dependent: the faster the tissue is depolarising, the more of it is blocked.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 2,
        title: 'The pacemaker and the relay slow down',
        laymanDesc:
          'Two small regions of the heart run on calcium rather than sodium. Blocking calcium slows both, so the pulse falls and a rhythm that loops through the relay is interrupted.',
        molecularDetail:
          'Sinoatrial automaticity and atrioventricular nodal conduction depend on L-type calcium current. Verapamil prolongs AV nodal refractoriness and terminates reentrant supraventricular tachycardias whose circuit includes the node. In digitalised atrial fibrillation trials, resting ventricular rates below 50 occurred in 15% of patients.',
        iconName: 'Timer',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Arteries relax and pressure falls',
        laymanDesc:
          'The same channel in artery muscle is blocked too, so vessels widen. That lowers blood pressure and eases angina by cutting the work the heart has to do.',
        molecularDetail:
          'Reduced calcium influx into vascular smooth muscle lowers systemic vascular resistance, which partially offsets the negative inotropic effect. The label states that in most patients the negative inotropy is compensated by afterload reduction without net impairment of ventricular performance.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'The squeeze weakens, which is the whole risk',
        laymanDesc:
          'Blocking calcium in heart muscle means each beat is less forceful. In a healthy heart that does not matter. In a failing one it can be the difference between compensated and not.',
        molecularDetail:
          'Congestive heart failure or pulmonary oedema developed in 87 of 4,954 trial patients, 1.8%. The label contraindicates severe left ventricular dysfunction, directs avoidance below 30% ejection fraction, and directs avoidance at any degree of ventricular dysfunction if a beta-blocker is co-prescribed.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'The gut uses the same channel',
        laymanDesc:
          'Bowel muscle contracts using the same calcium channel as artery muscle. Blocking it slows the bowel, which is why constipation is the most common complaint by a wide margin.',
        molecularDetail:
          'Constipation occurred in 7.3% of 4,954 patients, more than twice the rate of the next most common adverse effect. Reversible non-obstructive paralytic ileus has been reported infrequently. The effect is dose-related and is the leading reason for discontinuation.',
        iconName: 'Ban',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the outcome trials found',
        laymanDesc:
          'Two large trials looked for a survival benefit. After a heart attack, deaths fell but not convincingly. Against a beta-blocker strategy in coronary disease, the two were identical.',
        molecularDetail:
          'DAVIT-II: 18-month mortality 11.1% against 13.8%, p=0.11; major events 18.0% against 21.6%, p=0.03. INVEST: primary outcome 9.93% against 10.17%, relative risk 0.98 (95% CI 0.90 to 1.06), in 22,576 patients over a mean 2.7 years.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'DAVIT II (Am J Cardiol 1990;66:779-785)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 1775,
        primaryEndpoint:
          'All-cause mortality, and major events defined as death or reinfarction, up to 18 months after myocardial infarction',
        endpointMet: false,
        statisticalPValue:
          'Mortality 11.1% against 13.8%, p=0.11 (HR 0.80, 95% CI 0.61 to 1.05); major events 18.0% against 21.6%, p=0.03 (HR 0.80, 95% CI 0.64 to 0.99)',
        unreportedAdverseSignals:
          'The benefit was confined to the subgroup without heart failure in the coronary care unit: mortality HR 0.64 (0.44 to 0.94) without heart failure against 1.05 (0.72 to 1.54) with it.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'INVEST (JAMA 2003;290:2805-2816)',
        phase: 'Phase 4, randomised, open label, blinded endpoint',
        sampleSize: 22576,
        primaryEndpoint:
          'First occurrence of all-cause death, non-fatal myocardial infarction or non-fatal stroke',
        endpointMet: true,
        statisticalPValue:
          '9.93% against 10.17%; relative risk 0.98 (95% CI 0.90 to 1.06) over a mean 2.7 years',
        unreportedAdverseSignals:
          'A comparison of strategies rather than of molecules: by 24 months, 81.5% of the calcium antagonist arm was still on verapamil and 77.5% of the comparator arm still on atenolol, with trandolapril and hydrochlorothiazide layered onto both. Open-label design with blinded endpoint adjudication.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CLVer (NCT04233034)',
        phase: 'Phase 2, randomised, double-blind, placebo-controlled, factorial',
        sampleSize: 88,
        primaryEndpoint:
          'Area under the curve for mixed-meal-stimulated C-peptide at 52 weeks from diagnosis of type 1 diabetes',
        endpointMet: true,
        statisticalPValue:
          'Adjusted between-group difference 0.14 pmol/mL (95% CI 0.01 to 0.27), p=0.04, equating to a 30% higher C-peptide level at 52 weeks',
        unreportedAdverseSignals:
          'HbA1c did not differ: 6.6% against 6.9%, adjusted difference -0.3% (95% CI -1.0 to 0.4). The endpoint is a mechanistic surrogate in 88 children, and durability beyond 52 weeks is unknown.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Eighteen-month mortality after infarction 11.1% against 13.8%, not statistically significant at p=0.11',
        'Major events after infarction 18.0% against 21.6% (HR 0.80, 95% CI 0.64 to 0.99, p=0.03)',
        'Identical primary event rates against an atenolol-based strategy in 22,576 patients (9.93% against 10.17%, RR 0.98)',
        'Constipation in 7.3% and congestive heart failure or pulmonary oedema in 1.8% of 4,954 trial patients',
      ],
      unsupportedInferences: [
        'That verapamil reduces mortality after myocardial infarction — the trial that looked missed its mortality endpoint',
        'That INVEST showed the verapamil strategy superior, when the published conclusion is that it was as clinically effective as the comparator',
        'That preserved C-peptide in newly diagnosed type 1 diabetes will produce better long-term control, when HbA1c did not differ at 52 weeks',
        'That the rate-control effect is interchangeable with diltiazem — verapamil depresses contractility substantially more at equivalent nodal effect',
      ],
      whatFailedInitially: [
        'DAVIT-II missed all-cause mortality at p=0.11 and reported the composite as its positive result',
        'The post-infarction benefit disappeared entirely in patients who had heart failure at admission (HR 1.05)',
        'INVEST found no advantage over a beta-blocker strategy in 22,576 patients with coronary disease',
        'Constipation, at 7.3%, is the dominant reason the drug is stopped and is not a cardiac effect at all',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1981 and on the WHO Model List of Essential Medicines',
        'Still the reference oral drug for AV nodal reentrant tachycardia prophylaxis where ablation is not chosen',
        'Its post-infarction subgroup pattern converged with the independent diltiazem trial, which is the strongest evidence either produced',
        'Under active investigation for beta-cell preservation in newly diagnosed type 1 diabetes, an indication with no cardiac connection at all',
      ],
    },
    deliverySystem: {
      type: 'Immediate-release tablet, sustained-release tablet and capsule, chronotherapeutic overnight-release formats, and an intravenous bolus',
      description:
        'The intravenous route exists for immediate termination of supraventricular tachycardia and acute rate control, and delivers a different enantiomer ratio than the oral route because the more cardioactive S-enantiomer is preferentially removed on first pass. The chronotherapeutic formulations were designed to release drug in the early morning, when cardiovascular events cluster; the outcome hypothesis behind that design was not confirmed.',
      safetyProfile:
        'Contraindicated in severe left ventricular dysfunction, systolic pressure below 90 mmHg or cardiogenic shock, sick sinus syndrome or high-grade AV block without a pacemaker, and atrial flutter or fibrillation with an accessory bypass tract. Avoid below 30% ejection fraction and in any ventricular dysfunction when a beta-blocker is co-prescribed. Constipation affects 7.3% and paralytic ileus has been reported. Transaminase elevations occur, occasionally with hepatocellular injury. It raises digoxin levels and inhibits CYP3A4.',
    },
    commonQuestions: [
      {
        q: 'Why does it make me so constipated?',
        a: 'Because the muscle in your bowel wall uses the same L-type calcium channel as the muscle in your artery walls, and the drug cannot tell them apart. Constipation occurred in 7.3% of the 4,954 patients in the trial database, more than twice the rate of the next most common effect, and it is the leading reason people stop the drug. It is dose-related. Occasionally it goes further: reversible non-obstructive paralytic ileus has been reported, which is a hospital problem rather than a home one, so severe abdominal distension needs assessment rather than more laxative.',
      },
      {
        q: 'Does verapamil prevent heart attacks?',
        a: 'It has been tested twice at scale and the answer is not clearly yes. After a heart attack, DAVIT-II gave verapamil to 878 patients from the second week and found eighteen-month deaths of 11.1% against 13.8% on placebo — a difference at p=0.11, which is not statistically convincing. The combined count of death or repeat infarction did reach significance at p=0.03. In INVEST, 22,576 patients with high blood pressure and coronary disease were randomised to a verapamil-based or an atenolol-based strategy, and the rates of death, heart attack and stroke were 9.93% and 10.17% — the same. The trial authors described the verapamil strategy as as clinically effective, which is precisely what it was.',
      },
      {
        q: 'Why is it dangerous with Wolff-Parkinson-White syndrome?',
        a: 'Because in that condition there is a second electrical route between the upper and lower chambers, and verapamil blocks only the normal one. In atrial fibrillation, the AV node normally acts as a filter, letting through only some of the chaotic atrial impulses. Block that filter while an unblocked accessory pathway is available, and more impulses take the alternative route, so the ventricular rate can accelerate rather than slow. Atrial flutter or fibrillation with an accessory bypass tract is therefore a contraindication. It is one of the few places in cardiology where the right drug and a dangerous drug are given for the same presenting problem.',
      },
      {
        q: 'I have heart failure. Can I take it?',
        a: 'Probably not, and the label is specific. Verapamil weakens the force of each heartbeat, which most hearts absorb because the drug also reduces the resistance they pump against. A heart with little contractile reserve does not absorb it. Severe left ventricular dysfunction is a contraindication, the label directs avoiding the drug below 30% ejection fraction or with moderate to severe failure symptoms, and it directs avoiding it in any degree of ventricular dysfunction if a beta-blocker is also being taken, because both weaken contraction. In the post-infarction trial, patients who had heart failure at admission got no survival benefit at all.',
      },
      {
        q: 'I read that verapamil helps type 1 diabetes. Is that real?',
        a: 'It is a real randomised finding and a small one, on a laboratory measure rather than on how anyone feels. The CLVer trial gave verapamil or placebo to 88 children and adolescents within a month of diagnosis. After a year, stimulated C-peptide — a marker of how much insulin the pancreas is still making — was about 30% higher on verapamil, with a between-group difference whose confidence interval ran from 0.01 to 0.27 pmol/mL. HbA1c, the measure of actual blood sugar control, was 6.6% against 6.9%, a difference that was not statistically significant. The trial investigators say the durability of the C-peptide effect and the right length of treatment are both unknown. It is a promising signal on a surrogate in 88 children, and it is not yet a treatment.',
        auditNote:
          'C-peptide preservation is a mechanistically meaningful surrogate in type 1 diabetes and it is still a surrogate. This trial measured it, found no glycaemic difference, and said so.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Danish Study Group on Verapamil in Myocardial Infarction. Effect of verapamil on mortality and major events after acute myocardial infarction (DAVIT II). Am J Cardiol 1990;66:779-785',
        identifier: '10.1016/0002-9149(90)90351-z',
        kind: 'doi',
      },
      {
        label:
          'Pepine CJ, Handberg EM, Cooper-DeHoff RM, et al. A calcium antagonist vs a non-calcium antagonist hypertension treatment strategy for patients with coronary artery disease: the International Verapamil-Trandolapril Study (INVEST). JAMA 2003;290:2805-2816',
        identifier: '10.1001/jama.290.21.2805',
        kind: 'doi',
      },
      {
        label:
          'Forlenza GP, McVean J, Beck RW, et al. Effect of verapamil on pancreatic beta cell function in newly diagnosed pediatric type 1 diabetes: a randomized clinical trial. JAMA 2023;329:990-999',
        identifier: '10.1001/jama.2023.2064',
        kind: 'doi',
      },
      {
        label:
          'CLVer: verapamil and intensive diabetes management in newly diagnosed type 1 diabetes',
        identifier: 'NCT04233034',
        kind: 'nct',
      },
      {
        label:
          'Multicenter Diltiazem Postinfarction Trial Research Group. The effect of diltiazem on mortality and reinfarction after myocardial infarction. N Engl J Med 1988;319:385-392',
        identifier: '10.1056/NEJM198808183190701',
        kind: 'doi',
      },
      {
        label:
          'Verapamil hydrochloride tablets United States prescribing information — Indications, Contraindications, Warnings and Adverse Reactions sections',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22verapamil+hydrochloride%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — verapamil, 43 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 2520 — verapamil structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/2520',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 7. Isosorbide mononitrate — a drug whose own label says it stops working within a day of
  //    continuous use, tested in 58,050 patients and found not to save lives.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'isosorbide-mononitrate',
    name: 'Isosorbide Mononitrate',
    tradeName: 'Imdur / Monoket / Ismo',
    sponsor:
      'Promius Pharma and many generic manufacturers; originated as the active metabolite of isosorbide dinitrate',
    targetGene: 'GUCY1A1 and GUCY1B1 — the two subunits of soluble guanylate cyclase',
    targetProtein:
      'Soluble guanylate cyclase in vascular smooth muscle, activated indirectly by nitric oxide released from the drug',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'Prevention and treatment of angina pectoris due to coronary artery disease. The label states that the onset of action is not sufficiently rapid for the oral product to be useful in aborting an acute anginal episode',
    patientFriendlyIndication:
      'Chest pain from narrowed heart arteries, prevented rather than stopped',
    anatomicalSite:
      'Venous capacitance vessels above all, then arterioles and the epicardial coronary arteries — the soluble guanylate cyclase inside their smooth muscle',
    conditionContext: {
      conditionExplainer:
        'Angina happens when the heart demands more oxygen than a narrowed coronary artery can deliver. There are two ways to close that gap: deliver more, or demand less. Nitrates mostly do the second, by widening the veins so less blood returns to the heart, so the heart has less to pump and works less hard.',
      whyItMatters:
        'Nitroglycerin has been used for angina since 1879, and this drug is its long-acting descendant. It is one of the oldest classes still in daily use, and the two things most worth knowing about it are both unusual: it stops working if it is present continuously, and the largest trial ever run on it found no effect on survival.',
      whoTakesThis:
        'Adults with stable angina from coronary artery disease, to reduce how often the pain comes. Not people taking sildenafil, tadalafil, vardenafil or riociguat, where the combination can cause severe hypotension.',
      clinicalGoals:
        'Fewer anginal episodes and more exercise before pain starts. Nothing else has been shown, and the label states outright that benefits in acute myocardial infarction or congestive heart failure have not been established.',
    },
    oneSentenceVerdict:
      'A long-acting nitric oxide donor that widens veins and reduces the work of the heart, whose antianginal effect its own label says disappears within 24 hours of continuous exposure and cannot be recovered by raising the dose — and which, given to 29,000 patients after myocardial infarction in ISIS-4, produced five-week mortality of 7.34% against 7.54% on placebo.',
    laymanHowItWorks:
      'The drug releases nitric oxide, the same signalling molecule the lining of your blood vessels makes to tell them to relax. Nitric oxide switches on an enzyme inside vessel muscle that produces a messenger called cyclic GMP, and that messenger makes the muscle let go. Veins respond most, so blood pools in them and less returns to the heart; the heart therefore has less to pump each beat and needs less oxygen. That is what prevents the chest pain. The unusual part is that the effect fades if the drug never leaves the body, so the treatment is deliberately arranged to include a long stretch each day with none of it present.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 60,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.0977 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 1991 as a purified form of the active metabolite of isosorbide dinitrate, which had itself been in use for decades. Isosorbide dinitrate is on the WHO Model List of Essential Medicines. At about ten United States cents a tablet the drug is cheap enough that its cost has never been the argument about it.',
      synthesisComplexity: 'Low',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Every alternative for stable angina is judged on the same two questions: does it reduce symptoms, and does it reduce events. Nitrates answer yes to the first and have never answered yes to the second. Beta-blockers and the rate-slowing calcium blockers reduce symptoms too, and the beta-blockers carry outcome evidence in the populations where they have been tested. Ranolazine adds symptomatic benefit without touching heart rate or blood pressure, and has also failed to reduce events.',
      conventionalRx: [
        {
          name: 'A beta-blocker such as metoprolol, bisoprolol or atenolol',
          class: 'Beta-1 adrenergic blocker',
          howItCompares:
            'Reduces angina by lowering heart rate and contractility rather than by pooling blood in the veins, and does not develop tolerance. It is the class with mortality evidence after myocardial infarction and in heart failure, which nitrates do not have in any population.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: no tolerance, no rebound on the nitrate-free interval, outcome data in defined populations. Cons: fatigue, bradycardia, bronchospasm risk, and abrupt withdrawal is itself dangerous.',
        },
        {
          name: 'Diltiazem or verapamil',
          class: 'Non-dihydropyridine calcium channel blocker',
          howItCompares:
            'Reduces oxygen demand and dilates coronary arteries, and is the class of choice where the angina is vasospastic rather than fixed-obstruction. Like nitrates, neither has shown a survival benefit in a randomised trial.',
          typicalCost:
            'US$0.3196 per unit for diltiazem and US$0.1803 for verapamil at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no tolerance; effective against coronary spasm; controls heart rate as well. Cons: heart block and worsening of a weak ventricle; verapamil constipation; CYP3A4 interactions.',
        },
        {
          name: 'Ranolazine (Ranexa)',
          class: 'Late sodium current inhibitor',
          howItCompares:
            'Reduces anginal episodes without lowering heart rate or blood pressure, so it can be added when a patient cannot tolerate more of either. Its outcome trial, MERLIN-TIMI 36 in 6,560 patients, missed its primary endpoint (HR 0.92, p=0.11).',
          typicalCost:
            'US$0.1609 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: no haemodynamic effect, so usable at low blood pressure or heart rate. Cons: QT prolongation; CYP3A4 interactions; the effect size on exercise time is modest.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary nitrate — beetroot, rocket, spinach and celery',
          activeCompound:
            'Inorganic nitrate, reduced by oral bacteria to nitrite and then to nitric oxide',
          biologicalMechanism:
            'Reaches the same end point as the drug — nitric oxide acting on soluble guanylate cyclase — by an entirely different route that does not require the enzymatic bioactivation an organic nitrate needs, and that does not appear to induce the same tolerance.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage:
            'Not stated here as advice. For scale only: randomised trials of dietary nitrate measure blood pressure and exercise performance over days to weeks. None has measured anginal episodes against a nitrate drug, and none has reported a cardiovascular outcome.',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'Never combine it with an erectile dysfunction drug',
          action:
            'Say if you take or have recently taken sildenafil, tadalafil or vardenafil, or the pulmonary hypertension drug riociguat.',
          patientImpact:
            'These are absolute contraindications. Both drug families raise cyclic GMP by different steps in the same pathway, and together they can cause severe hypotension, syncope or myocardial ischaemia. The label notes that the time course and dose dependence of the sildenafil interaction have not been studied.',
          clinicalPrecaution:
            'This is one of the interactions people are least likely to volunteer and most likely to be harmed by. Tadalafil in particular has a long duration, so the risk window extends well beyond the day it was taken.',
        },
        {
          name: 'Expect the headache, and expect it to fade',
          action: 'Report headache but do not treat it as a reason to abandon the drug on day one.',
          patientImpact:
            'Headache is the commonest adverse effect and was dose-related in the controlled trials: 6% on placebo, 13% at 10 mg and 35% at 20 mg, with 5% of the highest-dose group discontinuing. The label records that headache decreased in incidence after the first few days of therapy.',
          clinicalPrecaution:
            'The headache is the drug dilating cerebral vessels, which is the same effect that is wanted in the coronary circulation. It is a marker that the drug is working, not a marker that something is wrong.',
        },
        {
          name: 'Do not carry it as a rescue tablet',
          action:
            'Understand that this is a preventive tablet, not something to take when the pain starts.',
          patientImpact:
            'The label states plainly that the onset of action of oral isosorbide mononitrate is not sufficiently rapid for the product to be useful in aborting an acute anginal episode. Sublingual glyceryl trinitrate exists for that.',
          clinicalPrecaution:
            'Chest pain that does not settle with the rescue medicine is an emergency, not a dosing question.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'C1[C@@H]([C@@H]2[C@H](O1)[C@@H](CO2)O[N+](=O)[O-])O',
      chemicalFormula: 'C6H9NO6',
      molecularWeight: '191.14 g/mol',
      targetReceptorAffinity:
        'Not a receptor ligand at all. Isosorbide mononitrate is a prodrug that must be bioactivated in vascular smooth muscle to release nitric oxide, which then binds the haem group of soluble guanylate cyclase and raises cyclic GMP. It is the major active metabolite of isosorbide dinitrate, and the label states that most of the clinical activity of the dinitrate is attributable to it. Unlike the dinitrate it undergoes essentially no first-pass metabolism, giving near-complete bioavailability, and its clearance is unaffected by hepatic or renal impairment.',
      structureSource: {
        label:
          'PubChem CID 27661 (isosorbide mononitrate) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/27661',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ismn-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Distinguish the 5-mononitrate from the 2-mononitrate and the dinitrate',
          description:
            'Isosorbide has two secondary hydroxyls in different chemical environments, and nitration can give the 2-, the 5-, or the 2,5-dinitrate. Only the 5-mononitrate is this drug. The 2-isomer and residual dinitrate have different potency and different first-pass behaviour, and they are not visible as a problem on a simple assay of total nitrate ester.',
          reagentsAndBuffer:
            'Isosorbide 5-mononitrate reference standard, reversed-phase HPLC with ultraviolet detection at 210 nanometres, 13C NMR to assign the substituted position, gas chromatography for residual dinitrate, Karl Fischer titration',
        },
        {
          id: 'ismn-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Controlled mononitration or selective denitration of the dinitrate',
          description:
            'Either nitrate isosorbide under conditions that favour the exo 5-position, or make the dinitrate and remove one nitrate group selectively. Both routes handle a nitrate ester in acid, which is an energetic combination, so temperature control at this step is a safety requirement rather than a yield optimisation.',
          dependsOnStepId: 'ismn-w1',
          reagentsAndBuffer:
            'Isosorbide, fuming nitric acid with acetic anhydride or a nitrating mixture at controlled low temperature, or isosorbide dinitrate with hydrazine hydrate for selective denitration, with continuous temperature monitoring and quench capability',
        },
        {
          id: 'ismn-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Crystallise the mononitrate and dilute it for handling',
          description:
            'Crystallise to remove the isomer and residual dinitrate. Pure isosorbide mononitrate is handled as a diluted material — typically with lactose or mannitol — because concentrated nitrate esters are shock- and heat-sensitive. That dilution is a manufacturing safety measure that becomes part of the tablet formulation.',
          dependsOnStepId: 'ismn-w2',
          reagentsAndBuffer:
            'Crystallisation from ethanol or ethyl acetate with controlled cooling, blending with lactose monohydrate or mannitol to a specified assay, HPLC release testing against limits for the 2-isomer and the dinitrate',
        },
        {
          id: 'ismn-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm bioactivation in smooth muscle rather than in buffer',
          description:
            'An organic nitrate does nothing in a tube. Nitric oxide is released only after enzymatic bioactivation inside vascular smooth muscle, so the assay must use intact tissue or cells, not a chemical decomposition measurement. Testing in buffer reports a rate that has no relation to what the drug does in a vessel.',
          dependsOnStepId: 'ismn-w3',
          reagentsAndBuffer:
            'Cultured vascular smooth muscle cells or intact aortic rings, nitric oxide-selective electrode or DAF-FM fluorescence, cyclic GMP immunoassay, ODQ as a soluble guanylate cyclase inhibitor for the negative control',
        },
        {
          id: 'ismn-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Measure tolerance by repeating the relaxation after continuous exposure',
          description:
            'Relax a precontracted vessel ring, then hold the drug on the tissue for hours and repeat the concentration-response curve. The rightward shift is nitrate tolerance, and it is the single most clinically important property of this molecule. A single-exposure potency measurement describes a drug that behaves differently from the one patients take.',
          dependsOnStepId: 'ismn-w4',
          reagentsAndBuffer:
            'Rat or rabbit aortic rings precontracted with phenylephrine, isometric force transducers, continuous drug exposure arms of 0, 6 and 16 hours, washout arm to demonstrate recovery of sensitivity',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ismn-a1',
        category: 'failed',
        title: 'ISIS-4: no survival benefit in 58,050 patients, and none in any subgroup',
        laymanSummary:
          'One of the largest heart trials ever run gave oral mononitrate or a matching dummy tablet to fifty-eight thousand people after a suspected heart attack. Five-week deaths were 7.34% on the drug and 7.54% on placebo. There was no benefit in any group examined and none later either.',
        technicalDetails:
          'ISIS-4 randomised 58,050 patients entering 1,086 hospitals within 24 hours of suspected acute myocardial infarction, median 8 hours, in a two-by-two-by-two factorial design. One comparison was one month of oral controlled-release mononitrate against matching placebo, with about 29,000 patients per arm. There was no significant reduction in five-week mortality either overall — 2,129 (7.34%) mononitrate deaths against 2,190 (7.54%) placebo — or in any subgroup examined, including those already receiving non-study intravenous or oral nitrates at entry. Further follow-up showed no later survival advantage. The only significant side effect was an increase of 15 per 1,000 in hypotension. Patients allocated active treatment had somewhat fewer deaths on days 0 to 1, which the investigators describe as reassuring about the safety of early nitrate use. In the same trial, captopril produced a significant 7% proportional reduction in five-week mortality, so the trial was capable of detecting an effect of that size and did not detect one here.',
        evidenceSource:
          'ISIS-4 (Fourth International Study of Infarct Survival) Collaborative Group, Lancet 1995;345:669-685',
        measuredMetric: 'Five-week all-cause mortality after suspected acute myocardial infarction',
        auditFlag: 'verified',
      },
      {
        id: 'ismn-a2',
        category: 'failed',
        title: 'NEAT-HFpEF: patients given the nitrate moved less, not more',
        laymanSummary:
          'Nitrates are widely prescribed to help people with stiff-heart failure do more. A trial fitted 110 such patients with activity monitors and gave them the drug or placebo in turn. On the drug they were less active, and the more they took, the less they moved.',
        technicalDetails:
          'NEAT-HFpEF was a multicentre, double-blind crossover study in 110 patients with heart failure and preserved ejection fraction, randomised to six weeks of dose-escalating isosorbide mononitrate or placebo and then crossed over. The primary endpoint was daily activity level as average daily accelerometer units during the highest-dose phase. At that dose there was a non-significant trend toward lower activity on the nitrate (-381 accelerometer units, 95% CI -780 to 17, p=0.06) and a significant decrease in hours of activity per day (-0.30 hours, 95% CI -0.55 to -0.05, p=0.02). Across all dose regimens, activity on the nitrate was lower than on placebo (-439 units, 95% CI -792 to -86, p=0.02), and activity fell progressively and significantly with increasing nitrate dose but not with increasing placebo dose. There were no between-group differences in six-minute walk distance, quality-of-life scores or NT-proBNP. The published conclusion is that these patients were less active and did not have better quality of life or submaximal exercise capacity than those receiving placebo.',
        evidenceSource:
          'Redfield MM et al. Isosorbide mononitrate in heart failure with preserved ejection fraction. N Engl J Med 2015;373:2314-2324 (NEAT-HFpEF, NCT02053493)',
        doi: '10.1056/NEJMoa1510774',
        measuredMetric:
          'Daily activity in accelerometer units and hours of activity per day, nitrate against placebo in crossover',
        auditFlag: 'verified',
      },
      {
        id: 'ismn-a3',
        category: 'measured',
        title: 'The label states the drug stops working within a day of continuous use',
        laymanSummary:
          'This is written into the prescribing information rather than buried in a journal. Trials that delivered nitrates continuously found them indistinguishable from a dummy tablet after 24 hours or less, and raising the dose did not fix it.',
        technicalDetails:
          'The Clinical Pharmacology section states that the strategy of maintaining plasma concentrations continuously above a minimally effective level, standard for most chronic drugs, is inappropriate for organic nitrates. It records that several well-controlled trials using exercise testing found active agents indistinguishable from placebo after 24 hours or less of continuous therapy, and that attempts to overcome tolerance by dose escalation, even to doses far in excess of those used acutely, have consistently failed. Only after nitrates have been absent from the body for several hours is antianginal efficacy restored. The approved regimen is therefore deliberately asymmetric, leaving a long stretch of each day with the drug absent. The label adds that tolerance still occurs to some extent even on that regimen, and that the duration of antianginal activity beyond fourteen hours has not been studied.',
        evidenceSource:
          'Isosorbide mononitrate United States prescribing information, Clinical Pharmacology and Dosage and Administration sections',
        measuredMetric:
          'Exercise-test antianginal efficacy after continuous nitrate exposure, from the controlled trials summarised in the label',
        auditFlag: 'verified',
      },
      {
        id: 'ismn-a4',
        category: 'inferred',
        title: 'The mechanism is described in the label as undefined',
        laymanSummary:
          'Nitrates widen veins, widen arteries and widen the coronary vessels. Which of those three actually stops the chest pain has not been settled, and the prescribing information says so.',
        technicalDetails:
          'The label describes dilatation of peripheral arteries and veins, especially veins, with venous pooling reducing venous return and therefore left ventricular end-diastolic pressure and pulmonary capillary wedge pressure; arteriolar relaxation reducing systemic vascular resistance and arterial pressure; and dilatation of the coronary arteries. It then states: the relative importance of preload reduction, afterload reduction and coronary dilatation remains undefined. This is unusually candid for a drug in use since the nineteenth century in its parent form, and it matters for the tolerance question, because a mechanism that has not been isolated is a mechanism whose loss cannot be measured directly either.',
        evidenceSource:
          'Isosorbide mononitrate United States prescribing information, Clinical Pharmacology section',
        inferredClaim:
          'That the antianginal effect is primarily preload reduction — the most commonly taught account, which the label declines to endorse over the alternatives',
        auditFlag: 'caution',
      },
      {
        id: 'ismn-a5',
        category: 'failed',
        title: 'Two absolute contraindications built on the same second messenger',
        laymanSummary:
          'Erectile dysfunction drugs and this drug both raise the same chemical signal in blood vessel walls, by different steps. Together they can drop blood pressure catastrophically.',
        technicalDetails:
          'The label contraindicates concomitant use with phosphodiesterase type 5 inhibitors — sildenafil, tadalafil, vardenafil — and with the soluble guanylate cyclase stimulator riociguat, stating that the combinations can cause severe hypotension, syncope or myocardial ischaemia. Nitrates raise cyclic GMP by donating nitric oxide to activate soluble guanylate cyclase; PDE5 inhibitors raise it by blocking its breakdown; riociguat raises it by stimulating the same cyclase directly. The label notes that the time course and dose dependence of the sildenafil interaction have not been studied, and that appropriate supportive care has not been studied either, suggesting it be treated as a nitrate overdose. Separately, the label states that benefits in acute myocardial infarction or congestive heart failure have not been established and that the drug is not recommended in those settings because its effects are difficult to terminate rapidly.',
        evidenceSource:
          'Isosorbide mononitrate United States prescribing information, Contraindications and Warnings sections',
        auditFlag: 'caution',
      },
      {
        id: 'ismn-a6',
        category: 'measured',
        title: 'Headache in a third of patients at the higher strength',
        laymanSummary:
          'The headache is the drug working on the wrong blood vessels. It affected six percent of people on the dummy tablet and thirty-five percent at the higher strength, and it faded after the first few days.',
        technicalDetails:
          'Across six placebo-controlled studies, headache occurred in 6% of 160 placebo patients, 17% of 54 at the lowest strength, 13% of 52 at the intermediate strength and 35% of 159 at the highest studied strength, with 5% of that last group discontinuing for it. Headache was the cause of 2% of all dropouts from the controlled trial programme and decreased in incidence after the first few days of therapy. Other reactions above 1% were fatigue, dizziness and nausea. The label records that extremely rarely, ordinary doses of organic nitrates have caused methaemoglobinaemia.',
        evidenceSource:
          'Isosorbide mononitrate United States prescribing information, Adverse Reactions section',
        measuredMetric:
          'Headache incidence and discontinuation across six placebo-controlled studies',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed, and almost none of it is lost',
        laymanDesc:
          'Unlike its parent drug, this one is not destroyed on its first pass through the liver, so nearly all of what is swallowed reaches the circulation. Liver or kidney problems do not change that.',
        molecularDetail:
          'Isosorbide mononitrate is the major active metabolite of isosorbide dinitrate and undergoes essentially no first-pass metabolism, giving near-complete bioavailability with low variability. The label states that dosage adjustments are not necessary for elderly patients or for altered hepatic or renal function.',
        iconName: 'Pill',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Vessel muscle has to activate it first',
        laymanDesc:
          'The tablet itself does nothing to a blood vessel. Enzymes inside the vessel wall have to break it down before nitric oxide is released.',
        molecularDetail:
          'Organic nitrates are prodrugs requiring enzymatic bioactivation within vascular smooth muscle to liberate nitric oxide. This is why decomposition rate in buffer says nothing useful about potency, and why the tolerance phenomenon is a property of the activating machinery rather than of the molecule.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Nitric oxide switches on the relaxing enzyme',
        laymanDesc:
          'Nitric oxide binds an enzyme inside the muscle cell that makes a messenger called cyclic GMP. That messenger tells the muscle to let go.',
        molecularDetail:
          'Nitric oxide binds the haem group of soluble guanylate cyclase, raising cyclic GMP, which activates protein kinase G and lowers intracellular calcium. This is the identical end point that phosphodiesterase type 5 inhibitors reach by blocking cyclic GMP breakdown, which is why the two are absolutely contraindicated together.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Veins widen most, so the heart has less to pump',
        laymanDesc:
          'Blood pools in the widened veins and less returns to the heart. With less to move each beat, the heart needs less oxygen, and the mismatch that caused the pain narrows.',
        molecularDetail:
          'Venodilatation predominates: pooling reduces venous return, left ventricular end-diastolic pressure and pulmonary capillary wedge pressure. Arteriolar relaxation reduces systemic vascular resistance and arterial pressure, and coronary arteries dilate as well. The label states the relative importance of the three remains undefined.',
        iconName: 'ArrowDown',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'Keep it there and it stops working',
        laymanDesc:
          'If the drug is present around the clock, the effect fades within a day and raising the dose does not bring it back. Only removing it for several hours restores it.',
        molecularDetail:
          'The label records that in the large majority of well-controlled exercise-testing trials, continuously delivered nitrates were indistinguishable from placebo after 24 hours or less, that dose escalation far beyond acutely effective doses has consistently failed to overcome tolerance, and that efficacy returns only after several hours of absence.',
        iconName: 'RotateCcw',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the largest trial found',
        laymanDesc:
          'Fifty-eight thousand patients after a heart attack were given this drug or a dummy tablet. Deaths at five weeks were 7.34% and 7.54%. Nothing separated them, then or later.',
        molecularDetail:
          'ISIS-4 found no significant reduction in five-week mortality overall or in any subgroup examined, including patients already on non-study nitrates, with no later survival advantage. In the same factorial trial captopril produced a significant 7% proportional mortality reduction, so the design could detect an effect of that magnitude.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ISIS-4 (Lancet 1995;345:669-685)',
        phase: 'Phase 4, randomised, placebo-controlled, two-by-two-by-two factorial',
        sampleSize: 58050,
        primaryEndpoint:
          'Five-week all-cause mortality after suspected acute myocardial infarction, oral controlled-release mononitrate against matching placebo',
        endpointMet: false,
        statisticalPValue:
          '2,129 (7.34%) against 2,190 (7.54%) deaths — no significant reduction overall or in any subgroup examined, and no later survival advantage',
        unreportedAdverseSignals:
          'The only significant side effect was an increase of 15 per 1,000 in hypotension. Fewer deaths occurred on days 0 to 1 on active treatment, which the investigators read as reassuring about early nitrate safety.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'NEAT-HFpEF (NCT02053493)',
        phase: 'Phase 2, randomised, double-blind, placebo-controlled crossover',
        sampleSize: 110,
        primaryEndpoint:
          'Daily activity level, as average daily accelerometer units during the highest-dose phase',
        endpointMet: false,
        statisticalPValue:
          '-381 accelerometer units (95% CI -780 to 17), p=0.06 at the highest dose; hours of activity per day -0.30 (95% CI -0.55 to -0.05), p=0.02; across all doses -439 units (95% CI -792 to -86), p=0.02',
        unreportedAdverseSignals:
          'The direction was against the drug. Activity fell progressively with increasing nitrate dose and not with increasing placebo dose, and there were no differences in six-minute walk, quality of life or NT-proBNP.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Six placebo-controlled antianginal studies in the registration programme',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 425,
        primaryEndpoint: 'Exercise tolerance in chronic stable angina',
        endpointMet: true,
        statisticalPValue:
          'Antianginal efficacy demonstrated on exercise tolerance, beginning one hour after the first dose; the label states that duration of activity beyond fourteen hours has not been studied',
        unreportedAdverseSignals:
          'Headache was dose-related, at 6% on placebo against 35% at the highest strength studied, with 5% of that group discontinuing. The endpoint is exercise time, not events.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Five-week mortality after infarction 7.34% against 7.54% on placebo in 58,050 patients, with no benefit in any subgroup',
        'Daily activity lower on the nitrate than on placebo across all doses in 110 patients with preserved-ejection-fraction heart failure (p=0.02)',
        'Antianginal efficacy indistinguishable from placebo after 24 hours or less of continuous exposure, in the trials summarised in the label',
        'Headache in 35% at the highest studied strength against 6% on placebo, with 5% discontinuing',
      ],
      unsupportedInferences: [
        'That nitrates reduce heart attacks or deaths — the largest trial ever run on the question found nothing',
        'That the antianginal effect is primarily preload reduction, when the label says the relative importance of the three mechanisms remains undefined',
        'That nitrates improve exercise capacity in heart failure with preserved ejection fraction, which NEAT-HFpEF measured and found the opposite of',
        'That raising the dose restores an effect lost to tolerance, which the label says has consistently failed',
      ],
      whatFailedInitially: [
        'ISIS-4 found no mortality benefit in about 29,000 patients given the drug, and none in any subgroup',
        'NEAT-HFpEF found less daily activity on the nitrate, with the effect growing as the dose rose',
        'Continuous delivery abolishes the antianginal effect within a day, and dose escalation does not recover it',
        'The label states that benefits in acute myocardial infarction and congestive heart failure have not been established and that the drug is not recommended there',
      ],
      realWorldOutcome: [
        'Approved in the United States in 1991 and available in 35 listed generic products at about ten United States cents a tablet',
        'Still one of the most-prescribed antianginal drugs in the world, on a symptomatic indication its trials support and an outcome claim they do not',
        'The tolerance phenomenon shaped an entire class of drug regimens built around a deliberate daily absence, which is unusual in pharmacology',
        'Absolutely contraindicated with phosphodiesterase type 5 inhibitors, an interaction that shaped the safety labelling of both classes',
      ],
    },
    deliverySystem: {
      type: 'Immediate-release tablet and extended-release tablet, taken orally',
      description:
        'The immediate-release and extended-release forms exist to solve the same problem from opposite directions: both are arranged so that the drug is absent from the body for a long stretch of each day, because continuous presence abolishes the effect. Bioavailability is near-complete because, unlike the dinitrate, the mononitrate is not removed on first pass, and the label states no adjustment is needed for age or for hepatic or renal impairment.',
      safetyProfile:
        'Absolutely contraindicated with phosphodiesterase type 5 inhibitors and with riociguat, where the combination can cause severe hypotension, syncope or myocardial ischaemia. Headache is dose-related and affected 35% at the highest studied strength. The label states that benefits in acute myocardial infarction or congestive heart failure have not been established, and that the drug is not recommended in those settings because its effects are difficult to terminate rapidly. Extremely rarely, ordinary doses of organic nitrates have caused methaemoglobinaemia.',
    },
    commonQuestions: [
      {
        q: 'Why do I have to take it at odd times rather than evenly through the day?',
        a: 'Because this drug stops working if it never leaves your body, and that is one of the strangest facts in pharmacology. The prescribing information puts it bluntly: the usual strategy of keeping a drug level continuously above an effective threshold is inappropriate for nitrates. In controlled trials using exercise testing, continuously delivered nitrates became indistinguishable from placebo within 24 hours, and raising the dose — even far beyond what works acutely — consistently failed to fix it. Only several hours with the drug absent restores the effect. So the schedule is designed around a deliberate daily gap. That gap is the treatment, not an inconvenience in it.',
      },
      {
        q: 'Does it prevent heart attacks?',
        a: 'No trial has shown that, and one very large trial looked hard. ISIS-4 randomised 58,050 patients within a day of a suspected heart attack; about 29,000 received a month of oral controlled-release mononitrate and about 29,000 a matching placebo. Five-week deaths were 7.34% and 7.54% — no significant difference overall, none in any subgroup examined, and no later survival advantage on further follow-up. The same trial detected a significant 7% mortality reduction from captopril, so it was capable of finding an effect of that size. Nitrates reduce chest pain. That is what they have been shown to do.',
      },
      {
        q: 'I have heart failure. Will this help me do more?',
        a: 'The trial that asked exactly that question found the opposite. NEAT-HFpEF fitted 110 patients with heart failure and a preserved ejection fraction with activity monitors and gave them isosorbide mononitrate or placebo for six weeks each, in random order. On the nitrate they were less active — 0.3 fewer hours of activity per day at the highest dose, and lower activity across all doses — and the reduction got larger as the dose went up. Six-minute walk distance, quality of life and NT-proBNP were all unchanged. The label separately says that benefits in congestive heart failure have not been established and that the drug is not recommended there.',
        auditNote:
          'This is a small crossover trial and the primary endpoint at the top dose was p=0.06, which is not significant. The direction, the dose-response and the significant secondary endpoints all point the same way, which is why the result changed practice rather than being set aside.',
      },
      {
        q: 'Can I take Viagra?',
        a: 'No, and this is one of the few genuinely absolute interactions in medicine. Nitrates raise a chemical messenger called cyclic GMP inside blood vessel walls by donating nitric oxide. Sildenafil, tadalafil and vardenafil raise the same messenger by blocking its breakdown. Together the effect compounds and blood pressure can fall to the point of fainting, or of causing the very ischaemia the nitrate was prescribed to prevent. The label notes that the time course and dose dependence of the interaction have not been studied, and that even the right treatment for it has not been studied. Tadalafil lasts a long time, so the risk window extends well beyond the day it was taken. The same contraindication applies to riociguat.',
      },
      {
        q: 'The headache is awful. Should I stop?',
        a: 'Usually not straight away, because it typically settles. Headache is the commonest effect and it is dose-related: 6% of people on placebo reported it, against 13% at the intermediate strength and 35% at the highest studied strength, where 5% stopped the drug because of it. The label records that it decreased in incidence after the first few days of therapy. Mechanistically it is the drug dilating cerebral vessels — the same action being sought in the coronary circulation — so it is a sign the tablet is doing what it does rather than a sign of harm. If it persists beyond the first weeks, that is worth raising, because there are antianginal drugs that do not cause it.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'ISIS-4 (Fourth International Study of Infarct Survival) Collaborative Group. ISIS-4: a randomised factorial trial assessing early oral captopril, oral mononitrate, and intravenous magnesium sulphate in 58,050 patients with suspected acute myocardial infarction. Lancet 1995;345:669-685',
        identifier: '7661937',
        kind: 'pmid',
      },
      {
        label:
          'Redfield MM, Anstrom KJ, Levine JA, et al. Isosorbide mononitrate in heart failure with preserved ejection fraction. N Engl J Med 2015;373:2314-2324 (NEAT-HFpEF)',
        identifier: '10.1056/NEJMoa1510774',
        kind: 'doi',
      },
      {
        label:
          'NEAT-HFpEF: nitrate effect on activity tolerance in heart failure with preserved ejection fraction',
        identifier: 'NCT02053493',
        kind: 'nct',
      },
      {
        label:
          'Isosorbide mononitrate tablets United States prescribing information — Indications, Contraindications, Warnings, Clinical Pharmacology and Adverse Reactions sections',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22isosorbide+mononitrate%22',
        kind: 'regulatory',
      },
      {
        label:
          'Morrow DA, Scirica BM, Karwatowska-Prokopczuk E, et al. Effects of ranolazine on recurrent cardiovascular events in patients with non-ST-elevation acute coronary syndromes: MERLIN-TIMI 36. JAMA 2007;297:1775-1783',
        identifier: '10.1001/jama.297.16.1775',
        kind: 'doi',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — isosorbide mononitrate, 35 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 27661 — isosorbide mononitrate structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/27661',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 8. Ranolazine — named after a mechanism its own label calls uncertain, with two failed outcome
  //    trials and a diabetes effect nobody has developed.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ranolazine',
    name: 'Ranolazine',
    tradeName: 'Ranexa / Aspruzyo Sprinkle',
    sponsor:
      'Menarini International; developed by CV Therapeutics and marketed by Gilead Sciences before generic entry',
    targetGene: 'SCN5A and KCNH2',
    targetProtein:
      'Cardiac late sodium current carried by Nav1.5, inhibited at therapeutic concentrations; and the hERG potassium channel, whose block produces the QT prolongation',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2006,
    indication:
      'Treatment of chronic angina. It may be used with beta-blockers, nitrates, calcium channel blockers, antiplatelet therapy, lipid-lowering therapy, ACE inhibitors and angiotensin receptor blockers',
    patientFriendlyIndication: 'Chest pain that keeps happening despite the usual drugs',
    anatomicalSite:
      'Cardiac myocyte membrane — the late sodium current during the plateau of the action potential, and the hERG potassium channel that repolarises it',
    conditionContext: {
      conditionExplainer:
        'Angina is a mismatch between what the heart muscle needs and what a narrowed artery can supply. Almost every antianginal drug closes that gap by reducing demand: slowing the heart, dropping the blood pressure, or unloading the ventricle. All three of those are felt as tiredness or dizziness, and all three run out when the heart rate and pressure are already low.',
      whyItMatters:
        'Ranolazine was developed to reduce ischaemia without touching heart rate or blood pressure, which would make it usable in exactly the patients whose other options have been exhausted. The label confirms it has no effect on the rate-pressure product at maximal exercise. It also says the mechanism of its antianginal effect has not been determined.',
      whoTakesThis:
        'Adults with chronic angina, usually added to existing treatment rather than replacing it. Not people taking strong CYP3A inhibitors or CYP3A inducers, and not people with liver cirrhosis, all of which are contraindications.',
      clinicalGoals:
        'Fewer anginal episodes and a longer exercise time before pain starts. Two large trials looked for a reduction in cardiovascular events and neither found one.',
    },
    oneSentenceVerdict:
      'An antianginal that works without lowering heart rate or blood pressure, adding about 24 seconds of exercise time over placebo in 823 patients in CARISA and about half an anginal episode a week in 949 diabetic patients in TERISA — and which missed its primary endpoint in both of its cardiovascular outcome trials, in 6,560 and 2,651 patients.',
    laymanHowItWorks:
      'When heart muscle is short of oxygen, a small leak of sodium into the cell fails to shut off properly. Sodium builds up, which forces calcium in behind it, and the overloaded muscle cannot relax properly between beats. A stiff, incompletely relaxing muscle squeezes its own small blood vessels and makes the oxygen shortage worse. Ranolazine blocks that leaking sodium current, so the calcium overload eases and the muscle relaxes. That account is what the drug is named after; the prescribing information says the connection between blocking the current and relieving angina is uncertain.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 58,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.1609 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States in 2006 and generic since 2019. Before genericisation it was priced as a branded speciality antianginal, which was a substantial part of the argument about whether an extra half an anginal episode per week was worth buying; at sixteen United States cents a tablet that argument has largely disappeared.',
      synthesisComplexity: 'Moderate',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Ranolazine is almost never the first antianginal, and its selling point is what it does not do: it does not lower heart rate or blood pressure, so it can be added when there is no room left to lower either. Against that, every drug it might be added to has a longer record, and two of them have outcome evidence in defined populations that ranolazine has failed to produce in its own trials.',
      conventionalRx: [
        {
          name: 'A beta-blocker such as metoprolol or bisoprolol',
          class: 'Beta-1 adrenergic blocker',
          howItCompares:
            'Reduces angina by cutting heart rate and contractility. In CARISA, ranolazine was added on top of atenolol, amlodipine or diltiazem rather than compared against them, so the trial describes what ranolazine adds, not whether it substitutes.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: mortality evidence in heart failure and after infarction; decades of use; no QT effect. Cons: fatigue and bradycardia are the limiting factors, and they are exactly the reason ranolazine gets added.',
        },
        {
          name: 'Diltiazem or amlodipine',
          class: 'Calcium channel blocker',
          howItCompares:
            'Reduces demand and dilates coronary arteries. Both were background therapy in CARISA. Neither has shown a survival benefit in stable angina, which puts them on the same footing as ranolazine for outcomes and ahead of it on length of record.',
          typicalCost:
            'US$0.3196 per unit for diltiazem at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026); amlodipine among the cheapest drugs available',
          prosAndCons:
            'Pros: no QT prolongation; no CYP3A contraindications; cheap. Cons: they lower blood pressure and, for diltiazem, heart rate, which is what limits them in the patients ranolazine is meant for.',
        },
        {
          name: 'Isosorbide mononitrate',
          class: 'Organic nitrate',
          howItCompares:
            'Prevents angina by pooling blood in the veins. Its own label records that the antianginal effect disappears within 24 hours of continuous exposure and cannot be recovered by raising the dose, and ISIS-4 found no mortality benefit in 58,050 patients.',
          typicalCost:
            'US$0.0977 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 35 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: cheapest option; long record. Cons: tolerance; headache in a third of patients at higher strengths; absolutely contraindicated with phosphodiesterase type 5 inhibitors.',
        },
        {
          name: 'Revascularisation, by stent or bypass',
          class: 'Procedure rather than drug',
          howItCompares:
            'For symptom relief in stable angina, revascularisation outperforms medical therapy in the short term. RIVER-PCI is the trial that speaks directly to the combination: in 2,651 patients left incompletely revascularised after a stent procedure, adding ranolazine did not reduce ischaemia-driven revascularisation or hospitalisation (HR 0.95, p=0.48).',
          typicalCost: 'A one-off procedural cost; not comparable per unit',
          prosAndCons:
            'Pros: addresses the anatomical narrowing rather than the cellular consequence. Cons: procedural risk; incomplete revascularisation is common and is exactly the population ranolazine failed in.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Bring the full list of your medicines, including supplements',
          action:
            'List everything, including antibiotics, antifungals, HIV medicines and St John wort.',
          patientImpact:
            'Ranolazine is contraindicated both with strong CYP3A inhibitors such as ketoconazole, clarithromycin and nelfinavir, and with CYP3A inducers such as rifampin, phenobarbital and St John wort. Inhibitors raise the level enough to matter for the QT interval; inducers drop it enough that the drug does nothing.',
          clinicalPrecaution:
            'Being contraindicated in both directions is unusual and it means a short course of a common antibiotic can be a genuine problem rather than a caution.',
        },
        {
          name: 'Ask about your kidney function',
          action: 'Say if you have kidney disease, and ask whether your function is being checked.',
          patientImpact:
            'Acute renal failure has been observed in some patients with severe renal impairment, at a creatinine clearance below 30 mL/min, while taking ranolazine. The label directs monitoring renal function after starting and periodically below 60 mL/min, and stopping the drug if acute renal failure develops.',
          clinicalPrecaution:
            'The label directs discontinuation on a marked rise in creatinine with a rise in blood urea nitrogen, rather than a dose reduction.',
        },
        {
          name: 'Mention liver disease',
          action: 'Say if you have been told you have cirrhosis.',
          patientImpact:
            'Liver cirrhosis is an absolute contraindication, because impaired clearance raises plasma concentration and with it the degree of QT prolongation.',
          clinicalPrecaution:
            'Ranolazine blocks the hERG potassium channel and prolongs the QT interval in a dose-related way. Anything that raises the concentration raises that effect.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC1=C(C(=CC=C1)C)NC(=O)CN2CCN(CC2)CC(COC3=CC=CC=C3OC)O',
      chemicalFormula: 'C24H33N3O4',
      molecularWeight: '427.50 g/mol',
      targetReceptorAffinity:
        'The label states that the mechanism of the antianginal effect has not been determined, that ranolazine at therapeutic levels can inhibit the cardiac late sodium current, and that the relationship of that inhibition to angina symptoms is uncertain. It separately attributes the observed QT prolongation to inhibition of IKr, the rapid delayed rectifier potassium current carried by hERG, which prolongs the ventricular action potential. It has anti-ischaemic effects that do not depend on reductions in heart rate or blood pressure and does not affect the rate-pressure product at maximal exercise.',
      structureSource: {
        label:
          'PubChem CID 56959 (ranolazine) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/56959',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'rnz-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Identity, single stereocentre and piperazine purity',
          description:
            'Ranolazine has one stereocentre on the propanol linker and is marketed as a racemate, so the specification is a ratio rather than a single configuration. The piperazine core is the impurity-prone part: mono-substituted and bis-substituted piperazines both form and both are pharmacologically different.',
          reagentsAndBuffer:
            'Ranolazine reference standard, reversed-phase and chiral HPLC, 1H NMR in DMSO-d6 to confirm both aryl substitution patterns, specified limits for mono- and bis-alkylated piperazine impurities, Karl Fischer titration',
        },
        {
          id: 'rnz-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Open the aryloxy epoxide onto piperazine, then acylate the far nitrogen',
          description:
            'Open 2-methoxyphenyl glycidyl ether with piperazine at one nitrogen to build the propanol linker, then acylate the remaining nitrogen with a 2,6-dimethylanilide acetamide. The dimethylanilide end is the fragment shared with local anaesthetics and class I antiarrhythmics, which is a structural clue to the sodium-channel activity and not a proof of it.',
          dependsOnStepId: 'rnz-w1',
          reagentsAndBuffer:
            '2-methoxyphenyl glycidyl ether, excess anhydrous piperazine to suppress bis-alkylation, N-(2,6-dimethylphenyl)-2-chloroacetamide, potassium carbonate in acetonitrile or toluene, nitrogen atmosphere',
        },
        {
          id: 'rnz-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Strip the bis-alkylated piperazine and crystallise',
          description:
            'Excess piperazine suppresses but does not eliminate double alkylation, and the bis-adduct is the impurity that determines release. Remove it, then crystallise the free base or the dihydrochloride depending on the intended formulation.',
          dependsOnStepId: 'rnz-w2',
          reagentsAndBuffer:
            'Acid-base extraction to exploit the difference in basicity between mono- and bis-substituted piperazines, crystallisation from ethyl acetate or isopropanol, HPLC release testing against specified impurity limits',
        },
        {
          id: 'rnz-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Measure late sodium current block and hERG block on the same cells',
          description:
            'The wanted effect and the main safety liability are both ion-channel block, in the same tissue, at overlapping concentrations. Measuring one without the other reports half the drug. Late sodium current must be provoked — with a channel opener or a mutant channel — because it is small in healthy myocytes and large in ischaemic ones, which is the whole selectivity argument for the drug.',
          dependsOnStepId: 'rnz-w3',
          reagentsAndBuffer:
            'HEK293 cells expressing human Nav1.5 and, separately, hERG; whole-cell patch clamp; ATX-II or veratridine to enhance late sodium current; paired concentration-response curves to derive the ratio between the two effects',
        },
        {
          id: 'rnz-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Diastolic relaxation in an ischaemic tissue model',
          description:
            'The mechanistic claim is that blocking late sodium current reduces calcium overload and improves diastolic relaxation, which in turn relieves the compression of intramural vessels. Test that chain rather than assuming it: measure diastolic tension and coronary flow in a perfused heart during and after simulated ischaemia, with and without drug.',
          dependsOnStepId: 'rnz-w4',
          reagentsAndBuffer:
            'Langendorff-perfused rat or guinea-pig heart with intraventricular balloon for diastolic pressure, low-flow ischaemia and reperfusion protocol, coronary flow measurement, Krebs-Henseleit buffer at 37 degrees Celsius',
        },
      ],
    },
    keyAudits: [
      {
        id: 'rnz-a1',
        category: 'inferred',
        title: 'The label says the mechanism has not been determined',
        laymanSummary:
          'Ranolazine is universally described as a late sodium current inhibitor, and that is where its whole scientific story comes from. Its own prescribing information says the mechanism of the antianginal effect has not been determined and that the link between blocking that current and relieving angina is uncertain.',
        technicalDetails:
          'Section 12.1 reads: "The mechanism of action of ranolazine’s antianginal effects has not been determined. Ranolazine has anti-ischemic and antianginal effects that do not depend upon reductions in heart rate or blood pressure. It does not affect the rate-pressure product, a measure of myocardial work, at maximal exercise. Ranolazine at therapeutic levels can inhibit the cardiac late sodium current (INa). However, the relationship of this inhibition to angina symptoms is uncertain." The one mechanism the label does assert is the unwanted one: QT prolongation is attributed to inhibition of IKr. So the drug is named and taught by a mechanism the regulator will not endorse, while the mechanism the regulator does endorse is the safety liability.',
        evidenceSource:
          'Ranolazine extended-release tablets United States prescribing information, section 12.1',
        inferredClaim:
          'That ranolazine relieves angina by inhibiting the cardiac late sodium current — the label states the relationship between that inhibition and angina symptoms is uncertain',
        auditFlag: 'contested',
      },
      {
        id: 'rnz-a2',
        category: 'failed',
        title: 'MERLIN-TIMI 36: the outcome trial missed, in 6,560 patients',
        laymanSummary:
          'Six and a half thousand patients admitted with an acute coronary syndrome were randomised to ranolazine or placebo and followed for about a year. The main measure — cardiovascular death, heart attack or recurrent ischaemia — was not significantly better.',
        technicalDetails:
          'MERLIN-TIMI 36 randomised 6,560 patients within 48 hours of ischaemic symptoms to intravenous then oral extended-release ranolazine 1000 mg twice daily (n=3,279) or matching placebo (n=3,281), followed for a median 348 days. The primary composite of cardiovascular death, myocardial infarction or recurrent ischaemia occurred in 696 (21.8%) against 753 (23.5%), hazard ratio 0.92 (95% CI 0.83 to 1.02, p=0.11). The major secondary composite was 18.7% against 19.2% (HR 0.96, 0.86 to 1.08, p=0.50). Cardiovascular death or myocardial infarction was 10.4% against 10.5% (HR 0.99, 0.85 to 1.15, p=0.87). Recurrent ischaemia alone was reduced: 13.9% against 16.1% (HR 0.87, 0.76 to 0.99, p=0.03). QTc prolongation requiring a reduction in intravenous dose occurred in 0.9% against 0.3%. Symptomatic documented arrhythmias did not differ (3.0% against 3.1%) and total mortality did not differ (HR 0.99, 0.80 to 1.22). The published conclusion is that adding ranolazine to standard treatment for acute coronary syndrome was not effective in reducing major cardiovascular events, and that the findings support its safety and efficacy as antianginal therapy.',
        evidenceSource: 'Morrow DA et al., JAMA 2007;297:1775-1783 (MERLIN-TIMI 36, NCT00099788)',
        doi: '10.1001/jama.297.16.1775',
        measuredMetric:
          'Composite of cardiovascular death, myocardial infarction or recurrent ischaemia through end of study',
        auditFlag: 'verified',
      },
      {
        id: 'rnz-a3',
        category: 'failed',
        title: 'RIVER-PCI: the second outcome trial missed too, and more patients stopped the drug',
        laymanSummary:
          'Patients whose stent procedure left some narrowings untreated were given ranolazine or placebo. Repeat procedures and hospital admissions for ischaemia were no less common, and more people on the drug stopped it because of side effects.',
        technicalDetails:
          'RIVER-PCI randomised 2,651 patients at 245 centres in 15 countries with a history of chronic angina and incomplete revascularisation after percutaneous coronary intervention, defined as one or more lesions with at least 50% diameter stenosis in a vessel of at least 2 mm, to ranolazine 1000 mg twice daily (n=1,332) or placebo (n=1,319). After a median follow-up of 643 days, the primary composite of ischaemia-driven revascularisation or ischaemia-driven hospitalisation without revascularisation occurred in 345 (26%) against 364 (28%), hazard ratio 0.95 (95% CI 0.82 to 1.10, p=0.48). Neither component differed significantly. Discontinuation for an adverse event occurred in 189 (14%) on ranolazine against 137 (11%) on placebo, p=0.04. The trial was funded by Gilead Sciences and Menarini.',
        evidenceSource: 'Weisz G et al., Lancet 2016;387:136-145 (RIVER-PCI, NCT01442038)',
        doi: '10.1016/S0140-6736(15)00459-6',
        measuredMetric:
          'Time to first ischaemia-driven revascularisation or ischaemia-driven hospitalisation without revascularisation',
        auditFlag: 'verified',
      },
      {
        id: 'rnz-a4',
        category: 'measured',
        title: 'CARISA: about 24 seconds more exercise than placebo',
        laymanSummary:
          'In the trial that supported approval, patients walked longer on a treadmill before the pain started. The difference against the dummy tablet was about twenty-four seconds, and angina attacks fell by roughly one a week.',
        technicalDetails:
          'CARISA randomised 823 adults with symptomatic chronic angina who still had angina and ischaemia at low workloads despite standard doses of atenolol, amlodipine or diltiazem, to placebo or one of two ranolazine doses twice daily, at 118 outpatient sites. Trough exercise duration — measured 12 hours after dosing — increased by 115.6 seconds from baseline in the pooled ranolazine groups against 91.7 seconds on placebo, p=0.01. The between-group difference is therefore about 24 seconds. Times to angina and to electrocardiographic ischaemia also increased, more at peak than at trough. Ranolazine reduced angina attacks and nitroglycerin use by about one per week against placebo (p<0.02), independent of changes in blood pressure, heart rate or background therapy, and the effect persisted through 12 weeks. Survival among 750 patients in the trial or its open-label extension was 98.4% at one year and 95.9% at two, which is an uncontrolled observation and not a comparison.',
        evidenceSource: 'Chaitman BR et al., JAMA 2004;291:309-316 (CARISA)',
        doi: '10.1001/jama.291.3.309',
        measuredMetric:
          'Change in trough treadmill exercise duration and weekly angina frequency against placebo',
        auditFlag: 'verified',
      },
      {
        id: 'rnz-a5',
        category: 'measured',
        title: 'TERISA: half an anginal episode a week in patients with diabetes',
        laymanSummary:
          'In nearly a thousand patients with type 2 diabetes and stable angina, the drug reduced weekly angina from 4.3 episodes to 3.8 and nitroglycerin use from 2.1 doses to 1.7. Both differences were statistically clear and both are small.',
        technicalDetails:
          'TERISA randomised 949 patients with type 2 diabetes, coronary artery disease and stable angina despite one or two antianginal agents, across 104 centres in 14 countries, to eight weeks of ranolazine at a target of 1000 mg twice daily or placebo after a four-week single-blind placebo run-in. Mean age was 64, mean diabetes duration 7.5 years and mean baseline HbA1c 7.3%. Weekly angina frequency over the last six weeks was 3.8 episodes (95% CI 3.6 to 4.1) against 4.3 (95% CI 4.0 to 4.5), p=0.008; weekly sublingual nitroglycerin use was 1.7 doses (1.6 to 1.9) against 2.1 (1.9 to 2.3), p=0.003. Electronic diary capture was 98% in both groups. Serious adverse events did not differ. The absolute effect is about half an episode and 0.4 doses per week.',
        evidenceSource:
          'Kosiborod M et al., J Am Coll Cardiol 2013;61:2038-2045 (TERISA, NCT01425359)',
        doi: '10.1016/j.jacc.2013.02.011',
        measuredMetric:
          'Average weekly number of anginal episodes over the last six weeks of treatment',
        auditFlag: 'verified',
      },
      {
        id: 'rnz-a6',
        category: 'conclusion_shift',
        title: 'It lowers HbA1c substantially, and was never developed as a diabetes drug',
        laymanSummary:
          'A prespecified analysis inside the failed outcome trial found that ranolazine lowered long-term blood sugar by an amount comparable to a real diabetes drug, without causing low blood sugar. Twenty years later it is still an angina drug and the mechanism is still described as under investigation.',
        technicalDetails:
          'A prospective evaluation within MERLIN-TIMI 36 compared HbA1c in 4,918 randomised patients. Ranolazine reduced HbA1c at four months against placebo: 5.9% against 6.2%, change from baseline -0.30 against -0.04, p<0.001. In patients with diabetes, HbA1c fell from 7.5% to 6.9%, a change of -0.64 (p<0.001); 59% against 49% reached HbA1c below 7% at four months (p<0.001); and 14.2% against 20.6% had a rise of at least 1% by one year (HR 0.63, 95% CI 0.51 to 0.77, p<0.001). Recurrent ischaemia was reduced in diabetic patients (HR 0.75, 95% CI 0.61 to 0.93, p=0.008). In patients without diabetes at baseline, new fasting glucose above 110 mg/dL or HbA1c at or above 6% occurred in 31.8% against 41.2% (HR 0.68, 95% CI 0.53 to 0.88, p=0.003). Reported hypoglycaemia did not increase. The authors state the mechanism of this effect is under investigation. A 0.64 percentage point HbA1c reduction is within the range achieved by approved oral antidiabetic agents, and no ranolazine diabetes programme followed.',
        evidenceSource:
          'Morrow DA et al. Evaluation of the glycometabolic effects of ranolazine in patients with and without diabetes mellitus in the MERLIN-TIMI 36 randomized controlled trial. Circulation 2009;119:2032-2039',
        doi: '10.1161/CIRCULATIONAHA.107.763912',
        inferredClaim:
          'That an HbA1c reduction of this size in a cardiovascular trial would translate into a diabetes indication — it has not, and the effect remains an unexploited finding inside a trial that missed its primary endpoint',
        auditFlag: 'verified',
      },
      {
        id: 'rnz-a7',
        category: 'failed',
        title: 'Contraindicated in both directions on the same enzyme',
        laymanSummary:
          'Drugs that slow the enzyme clearing ranolazine push its level up, which lengthens the QT interval. Drugs that speed the enzyme up push its level down until it does nothing. Both are contraindications.',
        technicalDetails:
          'Ranolazine is contraindicated in patients taking strong CYP3A inhibitors such as ketoconazole, clarithromycin and nelfinavir, in patients taking CYP3A inducers such as rifampin, phenobarbital and St John wort, and in liver cirrhosis. It blocks IKr and prolongs QTc in a dose-related manner; the label records little experience above 1000 mg twice daily, with other QT-prolonging drugs, with potassium channel variants producing long QT, or in congenital or acquired QT prolongation, while noting that the acute coronary syndrome population showed no increased risk of proarrhythmia or sudden death. Acute renal failure has been observed in some patients with creatinine clearance below 30 mL/min, and the label directs monitoring below 60 mL/min and discontinuation if acute renal failure develops. About 6% of angina patients discontinued for an adverse event against about 3% on placebo, most often dizziness (1.3% against 0.1%) and nausea (1% against 0%).',
        evidenceSource:
          'Ranolazine extended-release tablets United States prescribing information, sections 4, 5.1, 5.2 and 6.1',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A sodium leak that should have closed',
        laymanDesc:
          'Heart muscle cells open sodium gates for a fraction of a second at the start of each beat. When the muscle is short of oxygen, a small fraction of those gates fail to shut and keep leaking.',
        molecularDetail:
          'The late component of the sodium current through Nav1.5 is small in healthy myocytes and enlarged by ischaemia, hypoxia, oxidative stress and several inherited channel variants. That difference in size between healthy and ischaemic tissue is the selectivity argument for a drug that targets it.',
        iconName: 'Droplet',
        visualStage: 'target_binding',
      },
      {
        step: 2,
        title: 'Sodium drags calcium in behind it',
        laymanDesc:
          'The cell has an exchanger that normally pushes calcium out in return for letting sodium in. With sodium already high, that exchanger runs backwards and calcium accumulates.',
        molecularDetail:
          'Elevated intracellular sodium drives the sodium-calcium exchanger into reverse mode, loading the cytosol and the sarcoplasmic reticulum with calcium. This is the mechanistic chain proposed for the drug, and the label says the relationship between blocking the current and relieving angina is uncertain.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 3,
        title: 'Overloaded muscle cannot let go between beats',
        laymanDesc:
          'Calcium is what makes muscle contract, so too much of it left over means the muscle never fully relaxes. A stiff heart wall squeezes the small vessels running through it.',
        molecularDetail:
          'Calcium overload raises diastolic tension and left ventricular diastolic pressure, compressing intramural coronary vessels and reducing subendocardial perfusion — the proposed route by which a purely electrical abnormality becomes an ischaemic one.',
        iconName: 'AlertTriangle',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Blocking the leak, without touching rate or pressure',
        laymanDesc:
          'Ranolazine blocks the leaking current. Unlike every other antianginal drug, it does this without slowing the heart or lowering blood pressure, which is the reason it exists.',
        molecularDetail:
          'The label records anti-ischaemic and antianginal effects that do not depend on reductions in heart rate or blood pressure, and no effect on the rate-pressure product at maximal exercise. That is an unusual and genuinely useful property in patients already at the floor of both.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'The same channel family produces the risk',
        laymanDesc:
          'The drug also blocks a potassium channel that resets the heart electrically, which lengthens the QT interval on an ECG. That is the effect the label is confident about.',
        molecularDetail:
          'QT prolongation is attributed to inhibition of IKr, the hERG-carried rapid delayed rectifier, prolonging the ventricular action potential, and is dose-related. In the acute coronary syndrome population there was no increased risk of proarrhythmia or sudden death, and symptomatic documented arrhythmias were 3.0% against 3.1% on placebo.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'What the outcome trials measured',
        laymanDesc:
          'Two large trials asked whether the drug prevents heart attacks and repeat procedures. Both missed. What is left is about twenty-four seconds more treadmill time and half an anginal episode a week.',
        molecularDetail:
          'MERLIN-TIMI 36: primary composite HR 0.92 (95% CI 0.83 to 1.02, p=0.11) in 6,560 patients. RIVER-PCI: primary composite HR 0.95 (0.82 to 1.10, p=0.48) in 2,651 patients. CARISA: trough exercise duration +115.6 seconds against +91.7 on placebo (p=0.01). TERISA: 3.8 against 4.3 weekly anginal episodes (p=0.008).',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'MERLIN-TIMI 36 (NCT00099788)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, multinational',
        sampleSize: 6560,
        primaryEndpoint:
          'Composite of cardiovascular death, myocardial infarction or recurrent ischaemia through end of study',
        endpointMet: false,
        statisticalPValue:
          '21.8% against 23.5%; hazard ratio 0.92 (95% CI 0.83 to 1.02), p=0.11 over a median 348 days',
        unreportedAdverseSignals:
          'Recurrent ischaemia alone was reduced (HR 0.87, p=0.03), which is the component most vulnerable to ascertainment bias in an unblinded clinical setting. QTc prolongation requiring intravenous dose reduction occurred in 0.9% against 0.3%.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'RIVER-PCI (NCT01442038)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, event-driven',
        sampleSize: 2651,
        primaryEndpoint:
          'Time to first ischaemia-driven revascularisation or ischaemia-driven hospitalisation without revascularisation',
        endpointMet: false,
        statisticalPValue:
          '26% against 28%; hazard ratio 0.95 (95% CI 0.82 to 1.10), p=0.48 over a median 643 days',
        unreportedAdverseSignals:
          'More patients stopped the study drug for an adverse event on ranolazine: 189 (14%) against 137 (11%), p=0.04. Funded by Gilead Sciences and Menarini.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'CARISA (JAMA 2004;291:309-316)',
        phase: 'Phase 3, randomised, three-group parallel, double-blind, placebo-controlled',
        sampleSize: 823,
        primaryEndpoint:
          'Change in trough treadmill exercise duration at 12 weeks, on background atenolol, amlodipine or diltiazem',
        endpointMet: true,
        statisticalPValue:
          '+115.6 seconds from baseline in the pooled ranolazine groups against +91.7 seconds on placebo, p=0.01 — a between-group difference of about 24 seconds',
        unreportedAdverseSignals:
          'The reported survival figures of 98.4% at one year and 95.9% at two come from the trial plus its open-label extension in 750 patients, with no control group.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TERISA (NCT01425359)',
        phase: 'Phase 4, randomised, double-blind, placebo-controlled, with placebo run-in',
        sampleSize: 949,
        primaryEndpoint:
          'Average weekly number of anginal episodes over the last six weeks in patients with type 2 diabetes',
        endpointMet: true,
        statisticalPValue:
          '3.8 episodes (95% CI 3.6 to 4.1) against 4.3 (95% CI 4.0 to 4.5), p=0.008; weekly nitroglycerin 1.7 against 2.1 doses, p=0.003',
        unreportedAdverseSignals:
          'A four-week single-blind placebo run-in preceded randomisation, which removes placebo responders and inflates the apparent drug effect relative to unselected practice. The absolute difference is about half an episode a week.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Trough exercise duration +115.6 seconds against +91.7 on placebo in 823 patients (p=0.01)',
        'Weekly anginal episodes 3.8 against 4.3 in 949 patients with type 2 diabetes (p=0.008)',
        'No reduction in the primary composite in 6,560 acute coronary syndrome patients (HR 0.92, p=0.11)',
        'HbA1c fell 0.64 percentage points in diabetic patients within MERLIN-TIMI 36, without increased hypoglycaemia',
      ],
      unsupportedInferences: [
        'That ranolazine relieves angina by inhibiting the late sodium current — the label says that relationship is uncertain',
        'That reducing recurrent ischaemia in MERLIN-TIMI 36 amounts to a cardiovascular benefit, when the primary composite it belongs to was not met',
        'That the 98.4% one-year survival in the CARISA extension says anything about the drug, given there was no control group',
        'That the HbA1c effect is clinically established — it is a prespecified analysis inside a trial that missed its primary endpoint, with a mechanism the authors describe as under investigation',
      ],
      whatFailedInitially: [
        'MERLIN-TIMI 36 missed its primary composite in 6,560 patients at p=0.11',
        'RIVER-PCI missed its primary composite in 2,651 patients at p=0.48, with more discontinuations on the drug',
        'The drug is contraindicated with both CYP3A inhibitors and CYP3A inducers, and in liver cirrhosis',
        'Acute renal failure has been observed at creatinine clearance below 30 mL/min',
      ],
      realWorldOutcome: [
        'Approved in the United States in 2006 for chronic angina and generic since 2019, now about sixteen United States cents a tablet',
        'The only antianginal that works without lowering heart rate or blood pressure, which is a real and narrow advantage',
        'Two adequately powered outcome trials have failed, so it remains a symptomatic drug with no demonstrated effect on events',
        'Its most striking measured effect — a 0.64 point HbA1c reduction — has never been developed into an indication',
      ],
    },
    deliverySystem: {
      type: 'Extended-release oral tablet, taken twice daily; a sprinkle formulation exists for patients who cannot swallow tablets',
      description:
        'The extended-release matrix exists because ranolazine has a short half-life and a dose-related QT effect, so a formulation that flattens the peak is doing safety work rather than convenience work. Clearance is dominated by CYP3A, which is why both inhibitors and inducers of that enzyme are contraindications rather than cautions.',
      safetyProfile:
        'Contraindicated with strong CYP3A inhibitors, with CYP3A inducers and in liver cirrhosis. Blocks IKr and prolongs QTc dose-dependently, with little data above 1000 mg twice daily, alongside other QT-prolonging drugs, or in congenital or acquired long QT. Acute renal failure has been observed at creatinine clearance below 30 mL/min, and renal function should be monitored below 60 mL/min. Commonest reactions above 4% and more common than placebo are dizziness, headache, constipation and nausea; about 6% discontinued for an adverse event against 3% on placebo.',
    },
    commonQuestions: [
      {
        q: 'How much difference will it actually make?',
        a: 'Less than most people expect, and the numbers are worth seeing. In CARISA, patients on ranolazine walked on a treadmill for 115.6 seconds longer than at baseline, and patients on placebo for 91.7 seconds longer — so the drug itself is worth about twenty-four seconds. In TERISA, in patients with diabetes, weekly anginal episodes went from 4.3 on placebo to 3.8 on the drug, and nitroglycerin use from 2.1 doses a week to 1.7. Both differences are statistically clear and both are small. For someone having several episodes a week whose other drugs are at their limit, half an episode a week is not nothing. It is also not what the word antianginal usually suggests.',
      },
      {
        q: 'Will it stop me having a heart attack?',
        a: 'Two large trials asked and neither found it. MERLIN-TIMI 36 gave ranolazine or placebo to 6,560 patients admitted with an acute coronary syndrome; the combined rate of cardiovascular death, heart attack and recurrent ischaemia was 21.8% against 23.5%, which is a hazard ratio of 0.92 at p=0.11 — not significant. RIVER-PCI gave it to 2,651 patients who had been left with untreated narrowings after a stent procedure; repeat procedures and ischaemic admissions were no less common (HR 0.95, p=0.48), and more people stopped the drug for side effects. The drug is licensed for symptoms and that is what the evidence supports.',
      },
      {
        q: 'Is it true nobody knows how it works?',
        a: 'The prescribing information says so directly: the mechanism of the antianginal effect has not been determined. The standard account — that it blocks a leaking late sodium current, which reduces calcium overload, which lets the heart muscle relax — is coherent, well supported in isolated tissue, and is what the drug is named for. The label acknowledges that ranolazine can inhibit that current at therapeutic levels and then adds that the relationship of the inhibition to angina symptoms is uncertain. The only mechanism the label states without qualification is the unwanted one: the QT prolongation comes from blocking a potassium channel.',
        auditNote:
          'A drug can work without its mechanism being settled — aspirin was used for seventy years before anyone found cyclooxygenase. What is unusual here is that the unsettled mechanism is also the drug marketing identity.',
      },
      {
        q: 'I have diabetes. Does it help with that too?',
        a: 'It appears to lower long-term blood sugar, and nobody has turned that into a treatment. A prespecified analysis inside MERLIN-TIMI 36 measured HbA1c in 4,918 patients. In those with diabetes it fell from 7.5% to 6.9% on ranolazine — a 0.64 percentage point reduction, which is in the range of a real oral diabetes drug — and 59% reached below 7% against 49% on placebo. In people without diabetes, new high fasting glucose or HbA1c was less common on the drug. Hypoglycaemia did not increase. That was published in 2009 and the mechanism was described as under investigation. There is still no diabetes indication and no diabetes programme.',
      },
      {
        q: 'Why can I not take it with certain antibiotics?',
        a: 'Because ranolazine is cleared almost entirely by one liver enzyme, CYP3A, and the drug is unusually sensitive in both directions. Antibiotics and antifungals that block that enzyme — clarithromycin, ketoconazole and others — push the ranolazine level up, and since the drug lengthens the QT interval in proportion to its concentration, that matters. Drugs that speed the enzyme up — rifampin, phenobarbital, St John wort — push the level down until the drug does nothing at all. Both are listed as contraindications rather than cautions, which is unusual, and liver cirrhosis is a contraindication for the same reason.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Morrow DA, Scirica BM, Karwatowska-Prokopczuk E, et al. Effects of ranolazine on recurrent cardiovascular events in patients with non-ST-elevation acute coronary syndromes: the MERLIN-TIMI 36 randomized trial. JAMA 2007;297:1775-1783',
        identifier: '10.1001/jama.297.16.1775',
        kind: 'doi',
      },
      {
        label:
          'Weisz G, Genereux P, Iniguez A, et al. Ranolazine in patients with incomplete revascularisation after percutaneous coronary intervention (RIVER-PCI). Lancet 2016;387:136-145',
        identifier: '10.1016/S0140-6736(15)00459-6',
        kind: 'doi',
      },
      {
        label:
          'Chaitman BR, Pepine CJ, Parker JO, et al. Effects of ranolazine with atenolol, amlodipine, or diltiazem on exercise tolerance and angina frequency in patients with severe chronic angina (CARISA). JAMA 2004;291:309-316',
        identifier: '10.1001/jama.291.3.309',
        kind: 'doi',
      },
      {
        label:
          'Kosiborod M, Arnold SV, Spertus JA, et al. Evaluation of ranolazine in patients with type 2 diabetes mellitus and chronic stable angina: results from the TERISA randomized clinical trial. J Am Coll Cardiol 2013;61:2038-2045',
        identifier: '10.1016/j.jacc.2013.02.011',
        kind: 'doi',
      },
      {
        label:
          'Morrow DA, Scirica BM, Chaitman BR, et al. Evaluation of the glycometabolic effects of ranolazine in patients with and without diabetes mellitus in the MERLIN-TIMI 36 randomized controlled trial. Circulation 2009;119:2032-2039',
        identifier: '10.1161/CIRCULATIONAHA.107.763912',
        kind: 'doi',
      },
      {
        label: 'MERLIN-TIMI 36: ranolazine in non-ST-elevation acute coronary syndromes',
        identifier: 'NCT00099788',
        kind: 'nct',
      },
      {
        label: 'RIVER-PCI: ranolazine after incomplete revascularisation',
        identifier: 'NCT01442038',
        kind: 'nct',
      },
      {
        label:
          'Ranolazine extended-release tablets United States prescribing information — Indications, Contraindications, Warnings 5.1 and 5.2, Mechanism of Action 12.1 and Adverse Reactions 6.1',
        identifier:
          'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22ranolazine%22',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — ranolazine, 35 listed generic products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 56959 — ranolazine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/56959',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 9. Ivabradine — licensed to prevent hospital admissions and nothing else, after two large
  //    trials in coronary disease failed and one of them found harm in the angina subgroup.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'ivabradine',
    name: 'Ivabradine',
    tradeName: 'Corlanor',
    sponsor:
      'Amgen Inc. (holder of NDA 206143 in the United States); discovered and developed by Servier',
    targetGene: 'HCN4',
    targetProtein:
      'Hyperpolarisation-activated cyclic nucleotide-gated channel carrying the pacemaker funny current, and the related retinal Ih channel',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'To reduce the risk of hospitalisation for worsening heart failure in adults with stable, symptomatic chronic heart failure and left ventricular ejection fraction at or below 35%, in sinus rhythm with resting heart rate at or above 70 beats per minute, who are on maximally tolerated beta-blocker doses or cannot take one; and for stable symptomatic heart failure due to dilated cardiomyopathy in children aged 6 months and older',
    patientFriendlyIndication:
      'A weakened heart that keeps beating too fast, to keep you out of hospital',
    anatomicalSite:
      'Sinoatrial node pacemaker cells — the HCN4 channel that sets the resting heart rate — and, incidentally, the retina',
    conditionContext: {
      conditionExplainer:
        'The sinoatrial node is a small patch of cells that generates each heartbeat by slowly leaking positive charge inward until a threshold is crossed. The current that does that leaking was named the funny current because it behaved the wrong way round compared with every other cardiac current. Its speed sets the resting heart rate.',
      whyItMatters:
        'A high resting heart rate predicts bad outcomes in heart failure, and every drug that lowers it also does several other things. Ivabradine lowers heart rate and does nothing else measurable: no effect on contractility, no effect on blood pressure, no effect on ventricular repolarisation. It is therefore the cleanest available test of whether heart rate itself is the problem or merely a marker of it.',
      whoTakesThis:
        'Adults with reduced-ejection-fraction heart failure whose resting heart rate stays at or above 70 in sinus rhythm despite the maximum beta-blocker dose they can take, and children from six months old with dilated cardiomyopathy. Not people in atrial fibrillation, where the drug has no target.',
      clinicalGoals:
        'Staying out of hospital. That is what the United States indication says, in those words, and the trial that produced it did not reduce cardiovascular death or all-cause death.',
    },
    oneSentenceVerdict:
      'A pure heart-rate-lowering drug that reduced the composite of cardiovascular death or heart failure admission from 29% to 24% in 6,558 patients in SHIFT, driven by admissions rather than deaths — and which failed its primary endpoint in 10,917 patients in BEAUTIFUL and in 19,102 patients in SIGNIFY, where the subgroup with activity-limiting angina did worse on the drug than on placebo.',
    laymanHowItWorks:
      'Every heartbeat starts in a small cluster of cells that act as the heart natural pacemaker. Those cells slowly build up an electrical charge until they fire, and the speed of that build-up is what sets your resting pulse. Ivabradine blocks the specific channel that lets the charge in, so the build-up is slower and the heart beats less often. It does nothing else: it does not weaken the beat, it does not lower blood pressure, and it does not change the electrical recovery of the pumping chambers. The same channel exists in the retina, which is why some people see brief flashes of brightness.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 63,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.7645 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 16 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 15 April 2015 under NDA 206143, more than a decade after its European approval for angina in 2005. At about seventy-six United States cents a tablet it is roughly thirty-five times the price of carvedilol per unit, and it is taken twice daily on top of a beta-blocker rather than instead of one.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'Ivabradine is an add-on, and the first question its own label asks is whether the beta-blocker is already at the maximum tolerated dose. In SHIFT the alternative that has never been tested against it is simply more beta-blocker. Beyond rate control, the drugs that have reduced death in reduced-ejection-fraction heart failure — the neprilysin inhibitor, the mineralocorticoid antagonists, the SGLT2 inhibitors — are additions rather than substitutes, and all of them have mortality evidence that ivabradine does not.',
      conventionalRx: [
        {
          name: 'More of the existing beta-blocker',
          class: 'Beta-1 adrenergic blocker',
          howItCompares:
            'Lowers heart rate and reduces mortality, which ivabradine has not been shown to do. The United States indication for ivabradine requires that the beta-blocker already be at the maximally tolerated dose or contraindicated, which makes this the comparison that matters and the one no trial has made directly.',
          typicalCost:
            'US$0.0214 per tablet for carvedilol at United States pharmacy acquisition cost (CMS NADAC, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: mortality evidence; a fraction of the cost; no phosphenes and no atrial fibrillation signal. Cons: hypotension and fatigue are what stop titration, which is the situation ivabradine exists for.',
        },
        {
          name: 'Sacubitril / valsartan (Entresto)',
          class: 'Angiotensin receptor-neprilysin inhibitor',
          howItCompares:
            'In PARADIGM-HF, 8,442 patients with reduced ejection fraction had a primary composite rate of 21.8% against 26.5% on enalapril (HR 0.80, p<0.001), including a reduction in all-cause death from 19.8% to 17.0%. Ivabradine reduced admissions without reducing death.',
          typicalCost:
            'US$0.5291 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 100 listed products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: mortality benefit demonstrated in a single large trial; cheaper per tablet. Cons: hypotension and angioedema; requires stopping an ACE inhibitor with a washout.',
        },
        {
          name: 'An SGLT2 inhibitor such as dapagliflozin or empagliflozin',
          class: 'Sodium-glucose cotransporter 2 inhibitor',
          howItCompares:
            'Reduces heart failure hospitalisation and cardiovascular death in reduced-ejection-fraction heart failure regardless of diabetes status, and does so without needing a particular heart rate or rhythm — ivabradine is useless in atrial fibrillation, which a large proportion of heart failure patients have.',
          typicalCost: 'Branded in the United States; substantially more expensive per tablet',
          prosAndCons:
            'Pros: works in sinus rhythm and atrial fibrillation alike; large mortality evidence base. Cons: genital mycotic infection, volume depletion, and the euglycaemic ketoacidosis signal.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Report a new irregular pulse',
          action:
            'Say if your heartbeat becomes irregular, and ask whether your rhythm is being checked.',
          patientImpact:
            'The label states that ivabradine increases the risk of atrial fibrillation: 5.0% per patient-year against 3.9% on placebo in SHIFT, with atrial fibrillation reported as an adverse reaction in 8.3% against 6.6%. The label directs regular rhythm monitoring and discontinuation if atrial fibrillation develops.',
          clinicalPrecaution:
            'Atrial fibrillation also removes the drug reason for existing, because the funny current no longer sets the ventricular rate once the atria are fibrillating.',
        },
        {
          name: 'Expect the visual flashes and know what they are',
          action:
            'Report brief flashes of enhanced brightness, particularly when light levels change suddenly.',
          patientImpact:
            'Phosphenes occurred in 2.8% of patients against 0.5% on placebo. The label explains them: ivabradine also inhibits the retinal current Ih, which normally curtails the retinal response to bright light, so partial inhibition produces a transient enhanced brightness in part of the visual field.',
          clinicalPrecaution:
            'They are generally transient and not a sign of retinal damage, but they matter for night driving, and they are the reason some patients stop the drug.',
        },
        {
          name: 'Use effective contraception if you could become pregnant',
          action: 'Discuss contraception before starting.',
          patientImpact:
            'The label warns of fetal toxicity based on animal findings: embryo-fetal toxicity and cardiac teratogenic effects were seen in rats treated during organogenesis at exposures one to three times the human exposure at the maximum recommended dose.',
          clinicalPrecaution:
            'This is an animal finding rather than a human one, and the exposure multiple is low enough that the label directs effective contraception rather than a caution.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CN(CCCN1CCC2=CC(=C(C=C2CC1=O)OC)OC)C[C@H]3CC4=CC(=C(C=C34)OC)OC',
      chemicalFormula: 'C27H36N2O5',
      molecularWeight: '468.60 g/mol (free base); dispensed as ivabradine hydrochloride',
      targetReceptorAffinity:
        'Blocks the HCN channel carrying the cardiac pacemaker If current from the intracellular side, with access requiring the channel to be open, so block accumulates at higher heart rates. Cardiac effects are most pronounced at the sinoatrial node, though AH and PR interval prolongation have occurred. The label records no effect on ventricular repolarisation and none on myocardial contractility. It also inhibits the retinal Ih current, which normally curtails retinal responses to bright light, and that is the stated basis for the luminous phenomena.',
      structureSource: {
        label:
          'PubChem CID 132999 (ivabradine) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/132999',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ivb-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the S configuration on the benzocyclobutane',
          description:
            'Ivabradine has a single stereocentre on a strained benzocyclobutane ring, and only the S enantiomer is the drug. The strained four-membered ring is also the part of the molecule most vulnerable to thermal ring-opening during processing, so identity and stereochemistry are checked on the finished substance rather than only on the intermediate.',
          reagentsAndBuffer:
            'Ivabradine hydrochloride reference standard, chiral HPLC on an amylose phase, 1H NMR in DMSO-d6 with attention to the cyclobutane protons, specified limit for the ring-opened degradant, Karl Fischer titration',
        },
        {
          id: 'ivb-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Reductively aminate the benzocyclobutylmethylamine onto the benzazepinone chain',
          description:
            'Couple the chiral (S)-4,5-dimethoxybenzocyclobutan-1-yl-methylamine to a 3-chloropropyl benzazepinone, then methylate the resulting secondary amine. The molecule is essentially two dimethoxyaromatic units joined by an aminopropyl chain, and its resemblance to verapamil is structural rather than pharmacological — it has no calcium channel activity of consequence.',
          dependsOnStepId: 'ivb-w1',
          reagentsAndBuffer:
            '(S)-benzocyclobutylmethylamine, 7,8-dimethoxy-3-(3-chloropropyl)-1,3,4,5-tetrahydro-2H-3-benzazepin-2-one, potassium carbonate with potassium iodide in acetonitrile, formaldehyde with a reducing agent for N-methylation, nitrogen atmosphere',
        },
        {
          id: 'ivb-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Control the ring-opened degradant and crystallise the hydrochloride',
          description:
            'The benzocyclobutane can open under heat or acid to a styrene-type impurity that is inactive and difficult to remove downstream. Crystallise the hydrochloride under controlled temperature and set a limit for the degradant, because thermal history rather than reaction chemistry is what determines its level.',
          dependsOnStepId: 'ivb-w2',
          reagentsAndBuffer:
            'Hydrogen chloride in isopropanol or ethyl acetate, crystallisation with a controlled cooling ramp and no high-temperature drying step, HPLC release testing with limits for the ring-opened degradant and the R enantiomer',
        },
        {
          id: 'ivb-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm intracellular, open-channel access on HCN4',
          description:
            'Ivabradine reaches its site from inside the cell and only when the channel is open, which is why block deepens as heart rate rises. Demonstrate that directly by applying the drug intracellularly and extracellularly in separate arms and by varying pulse frequency. An extracellular single-frequency measurement misses the property that makes the drug self-limiting at low heart rates.',
          dependsOnStepId: 'ivb-w3',
          reagentsAndBuffer:
            'HEK293 or CHO cells expressing human HCN4, whole-cell patch clamp with hyperpolarising steps, intracellular and extracellular application arms, cyclic AMP in the pipette to set channel gating',
        },
        {
          id: 'ivb-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Selectivity against retinal Ih and against contractility',
          description:
            'Two negative results define this drug and both must be measured, not assumed. Against retinal HCN1 and HCN2 the ratio predicts the phosphene rate; against isolated papillary muscle, the absence of any effect on developed tension is the property that distinguishes ivabradine from every other rate-lowering agent.',
          dependsOnStepId: 'ivb-w4',
          reagentsAndBuffer:
            'Cells expressing human HCN1 and HCN2 for the retinal comparison, isolated guinea-pig papillary muscle in Krebs-Henseleit buffer with isometric force transducers, spontaneously beating sinoatrial node preparation for rate measurement',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ivb-a1',
        category: 'measured',
        title: 'SHIFT: fewer admissions, and no reduction in death from any cause',
        laymanSummary:
          'Six and a half thousand patients with a weak, fast-beating heart were randomised to ivabradine or a dummy tablet. The combined measure improved from 29% to 24%. Almost all of that came from fewer hospital admissions rather than fewer deaths.',
        technicalDetails:
          'SHIFT randomised 6,558 patients with symptomatic heart failure, ejection fraction at or below 35%, in sinus rhythm with heart rate at or above 70 beats per minute, admitted for heart failure within the previous year, on stable background therapy including a beta-blocker if tolerated. Median follow-up was 22.9 months. The primary composite of cardiovascular death or hospital admission for worsening heart failure occurred in 793 (24%) against 937 (29%), hazard ratio 0.82 (95% CI 0.75 to 0.90, p<0.0001). The published account states the effects were driven mainly by hospital admissions for worsening heart failure (672 [21%] placebo against 514 [16%] ivabradine; HR 0.74, 0.66 to 0.83, p<0.0001) and deaths due to heart failure (151 [5%] against 113 [3%]; HR 0.74, 0.58 to 0.94, p=0.014). The United States indication that followed is written narrowly, to reduce the risk of hospitalisation for worsening heart failure, and makes no mortality claim.',
        evidenceSource: 'Swedberg K et al., Lancet 2010;376:875-885 (SHIFT, ISRCTN70429960)',
        doi: '10.1016/S0140-6736(10)61198-1',
        measuredMetric:
          'Composite of cardiovascular death or hospital admission for worsening heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'ivb-a2',
        category: 'failed',
        title: 'BEAUTIFUL: no effect at all in 10,917 patients with coronary disease',
        laymanSummary:
          'A trial in almost eleven thousand patients with coronary disease and a weakened heart found the drug made no difference whatsoever to the main outcome. The hazard ratio was exactly 1.00.',
        technicalDetails:
          'BEAUTIFUL screened 12,473 and enrolled 10,917 patients with coronary artery disease and ejection fraction below 40%, randomised to ivabradine (n=5,479) or placebo (n=5,438) in addition to appropriate cardiovascular medication; 87% were on beta-blockers. Median follow-up was 19 months. Ivabradine reduced heart rate by 6 beats per minute at 12 months, placebo-corrected. The primary composite of cardiovascular death, admission for acute myocardial infarction and admission for new or worsening heart failure was not affected: hazard ratio 1.00 (95% CI 0.91 to 1.1, p=0.94). In the prespecified subgroup with heart rate at or above 70, the primary composite was still not affected (HR 0.91, 95% CI 0.81 to 1.04, p=0.17), nor was cardiovascular death or admission for new or worsening heart failure; two secondary endpoints were reduced, admission for fatal and non-fatal myocardial infarction (HR 0.64, 0.49 to 0.84, p=0.001) and coronary revascularisation (HR 0.70, 0.52 to 0.93, p=0.016). Those two secondary results generated the hypothesis that SIGNIFY was designed to test.',
        evidenceSource: 'Fox K et al., Lancet 2008;372:807-816 (BEAUTIFUL, NCT00143507)',
        doi: '10.1016/S0140-6736(08)61170-8',
        measuredMetric:
          'Composite of cardiovascular death, admission for acute myocardial infarction and admission for new or worsening heart failure',
        auditFlag: 'verified',
      },
      {
        id: 'ivb-a3',
        category: 'conclusion_shift',
        title: 'SIGNIFY: the confirmatory trial found harm in the group it was aimed at',
        laymanSummary:
          'Nineteen thousand patients with coronary disease and a fast pulse were given ivabradine to confirm the earlier subgroup finding. There was no benefit. Among those whose angina limited their activity — the very group the trial targeted — outcomes were worse on the drug.',
        technicalDetails:
          'SIGNIFY randomised 19,102 patients with stable coronary artery disease without clinical heart failure and heart rate at or above 70, including 12,049 with activity-limiting angina of Canadian Cardiovascular Society class II or above, to ivabradine at up to 10 mg twice daily or placebo, targeting a heart rate of 55 to 60. At three months, mean heart rate was 60.7 against 70.6. After a median 27.8 months there was no significant difference in the primary composite of cardiovascular death or non-fatal myocardial infarction: 6.8% against 6.4%, hazard ratio 1.08 (95% CI 0.96 to 1.20, p=0.20). Ivabradine was associated with an increase in the primary endpoint among patients with activity-limiting angina but not among those without it, p=0.02 for interaction. Bradycardia occurred in 18.0% against 2.3%, p<0.001. The dose tested was above the approved heart failure dose. European regulators subsequently restricted the drug angina labelling.',
        evidenceSource: 'Fox K et al., N Engl J Med 2014;371:1091-1099 (SIGNIFY, ISRCTN61576291)',
        doi: '10.1056/NEJMoa1406430',
        inferredClaim:
          'That the myocardial infarction reduction seen in a BEAUTIFUL subgroup would confirm in a dedicated trial — it did not, and the confirmatory trial found a significant interaction pointing the other way in the target population',
        auditFlag: 'contested',
      },
      {
        id: 'ivb-a4',
        category: 'failed',
        title: 'A systematic review of 47 trials found no benefit on any patient-important outcome',
        laymanSummary:
          'Pooling every randomised trial of ivabradine in angina — forty-seven trials and nearly thirty-six thousand people — found no effect on deaths or quality of life, and slightly more serious side effects.',
        technicalDetails:
          'Maagaard and colleagues systematically reviewed randomised trials of ivabradine against placebo or no intervention in angina from coronary artery disease, including 47 trials with 35,797 participants; all trials and outcomes were judged at high risk of bias. Ivabradine had no effect on all-cause mortality (RR 1.04, 95% CI 0.96 to 1.13), quality of life (standardised mean difference -0.05, 95% CI -0.11 to 0.01), cardiovascular mortality (RR 1.07, 95% CI 0.97 to 1.18) or myocardial infarction (RR 1.03, 95% CI 0.91 to 1.16). After removal of outliers it appeared to increase serious adverse events (RR 1.07, 95% CI 1.03 to 1.11), including bradycardia, prolonged QT interval, photopsia, atrial fibrillation and hypertension, and non-serious adverse events (RR 1.13, 95% CI 1.11 to 1.16). Angina frequency and stability scores favoured ivabradine — mean differences of 2.06 (95% CI 0.82 to 3.30) and 1.48 (0.07 to 2.89) — but the authors state the effect sizes seemed minimal and possibly without relevance to patients, with methodological limitations questioning their validity. Their conclusion is that guidelines need reassessment and the use of ivabradine for angina should be reconsidered. This review covers angina, not the heart failure indication SHIFT established.',
        evidenceSource:
          'Maagaard M, Nielsen EE, Sethi NJ, et al. Effects of adding ivabradine to usual care in patients with angina pectoris: a systematic review with meta-analysis and Trial Sequential Analysis. Open Heart 2020;7:e001288',
        doi: '10.1136/openhrt-2020-001288',
        measuredMetric:
          'All-cause mortality, quality of life and serious adverse events pooled across 47 randomised trials in 35,797 participants',
        auditFlag: 'contested',
      },
      {
        id: 'ivb-a5',
        category: 'measured',
        title: 'It causes the arrhythmia that makes it useless',
        laymanSummary:
          'Ivabradine only works in a heart beating in normal rhythm. It also makes the commonest abnormal rhythm more likely, and the label directs stopping the drug if that rhythm develops.',
        technicalDetails:
          'The label states that ivabradine increases the risk of atrial fibrillation, with a rate of 5.0% per patient-year against 3.9% on placebo in SHIFT, and directs regular cardiac rhythm monitoring and discontinuation if atrial fibrillation develops. In the SHIFT adverse reaction table, atrial fibrillation was reported in 8.3% against 6.6%, bradycardia in 10% against 2.2%, hypertension or increased blood pressure in 8.9% against 7.8%, and phosphenes in 2.8% against 0.5%. Symptomatic bradycardia in the published trial occurred in 150 (5%) against 32 (1%), p<0.0001. The drug has no effect on ventricular rate in atrial fibrillation, because the funny current no longer sets it, so the adverse event and the loss of indication arrive together.',
        evidenceSource:
          'CORLANOR (ivabradine) United States prescribing information, sections 5.2, 5.3 and 6.1 (NDA 206143); Swedberg K et al., Lancet 2010;376:875-885',
        doi: '10.1016/S0140-6736(10)61198-1',
        measuredMetric:
          'Atrial fibrillation rate per patient-year and adverse reaction rates in SHIFT',
        auditFlag: 'caution',
      },
      {
        id: 'ivb-a6',
        category: 'inferred',
        title: 'The comparison that would settle it has never been run',
        laymanSummary:
          'The drug is licensed for patients whose heart rate stays high on the maximum beta-blocker dose they can tolerate. In the trial, only a minority were on a full beta-blocker dose, so the question of whether more beta-blocker would have done the same job was never asked.',
        technicalDetails:
          'The United States indication requires that patients be on maximally tolerated doses of beta-blockers or have a contraindication to them, and the label records that SHIFT patients had to be clinically stable for at least four weeks on an optimised regimen including maximally tolerated beta-blocker doses. Maximally tolerated is not the same as target dose, and in SHIFT a minority of patients were at the target dose of their beta-blocker. Since beta-blockers lower heart rate and reduce mortality, while ivabradine lowers heart rate and did not reduce mortality, the untested question is whether the benefit measured in SHIFT belongs to ivabradine or to insufficient beta-blockade. No randomised trial has compared uptitration of a beta-blocker against the addition of ivabradine, and the drug regulatory position depends on the assumption that the beta-blocker was already maximal.',
        evidenceSource:
          'CORLANOR United States prescribing information, sections 1.1 and 14.1 (NDA 206143); Swedberg K et al., Lancet 2010;376:875-885',
        inferredClaim:
          'That the SHIFT benefit is attributable to ivabradine rather than to residual room for beta-blocker uptitration — plausible, assumed by the indication, and never tested against an uptitration arm',
        auditFlag: 'caution',
      },
      {
        id: 'ivb-a7',
        category: 'failed',
        title: 'A list of contraindications that is mostly the drug own mechanism',
        laymanSummary:
          'Almost everything the drug must not be used in is a version of the same thing: a heart that is already too slow, or a pacemaker system that cannot be slowed further, or anything that raises the drug level.',
        technicalDetails:
          'Contraindications are acute decompensated heart failure, clinically significant hypotension, sick sinus syndrome, sinoatrial block or third-degree AV block without a functioning demand pacemaker, clinically significant bradycardia, severe hepatic impairment, pacemaker dependence where the heart rate is maintained exclusively by the pacemaker, and concomitant use of strong CYP3A4 inhibitors. Second-degree AV block is listed as not recommended. Fetal toxicity is a warning: embryo-fetal toxicity and cardiac teratogenic effects were observed in rats treated during organogenesis at exposures one to three times the human exposure at the maximum recommended dose, and effective contraception is directed. Bradycardia, sinus arrest and heart block have occurred, at a rate of 6.0% per patient-year.',
        evidenceSource:
          'CORLANOR United States prescribing information, sections 4, 5.1 and 5.3 (NDA 206143)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The pacemaker cell leaks itself up to threshold',
        laymanDesc:
          'A small cluster of cells at the top of the heart starts every beat. Between beats they slowly let positive charge in until they reach a trigger point. How fast that happens is your resting pulse.',
        molecularDetail:
          'The funny current, carried mainly by HCN4 in the sinoatrial node, activates on hyperpolarisation rather than depolarisation — which is why it was named funny — and provides the slow diastolic depolarisation that determines cycle length. Cyclic AMP binding to the channel steepens that slope, which is how adrenaline speeds the heart.',
        iconName: 'Timer',
        visualStage: 'target_binding',
      },
      {
        step: 2,
        title: 'The drug gets in through the open channel',
        laymanDesc:
          'Ivabradine can only reach its target from inside the cell, and only while the channel is open. That means it blocks more when the heart is beating fast and less when it is already slow.',
        molecularDetail:
          'Block is current-dependent and requires channel opening for access from the intracellular side, giving a self-limiting profile: the faster the sinoatrial node fires, the more block accumulates. The label records cardiac effects most pronounced at the sinoatrial node, with some AH and PR interval prolongation.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The rate falls and nothing else changes',
        laymanDesc:
          'The heart beats less often. It does not beat more weakly, blood pressure does not fall, and the electrical recovery of the pumping chambers is untouched. That combination is unique.',
        molecularDetail:
          'The label records no effect on ventricular repolarisation and no effect on myocardial contractility. In BEAUTIFUL the placebo-corrected heart rate reduction was 6 beats per minute at 12 months; in SIGNIFY, mean heart rate at three months was 60.7 against 70.6 on placebo.',
        iconName: 'TrendingDown',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Fewer admissions in heart failure',
        laymanDesc:
          'In patients with a weak heart beating over seventy times a minute, this reduced hospital admissions for worsening heart failure by about a quarter. Deaths from all causes were not reduced.',
        molecularDetail:
          'SHIFT primary composite 24% against 29%, HR 0.82 (95% CI 0.75 to 0.90, p<0.0001), driven mainly by heart failure admissions (HR 0.74, 0.66 to 0.83) and heart failure deaths (HR 0.74, 0.58 to 0.94). The United States indication is written as reducing hospitalisation risk and makes no mortality claim.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 5,
        title: 'The retina has the same channel',
        laymanDesc:
          'A related channel in the retina normally damps the response to sudden bright light. Blocking part of it produces brief flashes of brightness in part of the visual field.',
        molecularDetail:
          'The label states that ivabradine can inhibit the retinal current Ih, which is involved in curtailing retinal responses to bright light, and that partial inhibition under rapid changes in luminosity may underlie the luminous phenomena. Phosphenes occurred in 2.8% against 0.5% on placebo.',
        iconName: 'Sparkles',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where it did not work, and where it did harm',
        laymanDesc:
          'In coronary disease without heart failure, two large trials found nothing. In the group with activity-limiting angina, the larger trial found outcomes were worse on the drug.',
        molecularDetail:
          'BEAUTIFUL primary composite HR 1.00 (95% CI 0.91 to 1.1, p=0.94) in 10,917 patients. SIGNIFY primary composite HR 1.08 (0.96 to 1.20, p=0.20) in 19,102 patients, with a significant interaction (p=0.02) showing an increase in the primary endpoint among the 12,049 with activity-limiting angina.',
        iconName: 'AlertTriangle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'SHIFT (ISRCTN70429960)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, parallel-group',
        sampleSize: 6558,
        primaryEndpoint:
          'Composite of cardiovascular death or hospital admission for worsening heart failure',
        endpointMet: true,
        statisticalPValue:
          '24% against 29%; hazard ratio 0.82 (95% CI 0.75 to 0.90), p<0.0001 over a median 22.9 months',
        unreportedAdverseSignals:
          'The effect was driven by heart failure admissions and heart failure deaths. Symptomatic bradycardia occurred in 150 (5%) against 32 (1%) and phosphenes in 89 (3%) against 17 (1%), both p<0.0001. Atrial fibrillation ran at 5.0% per patient-year against 3.9%.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'BEAUTIFUL (NCT00143507)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled, parallel-group',
        sampleSize: 10917,
        primaryEndpoint:
          'Composite of cardiovascular death, admission for acute myocardial infarction and admission for new or worsening heart failure',
        endpointMet: false,
        statisticalPValue: 'Hazard ratio 1.00 (95% CI 0.91 to 1.1), p=0.94 over a median 19 months',
        unreportedAdverseSignals:
          'The prespecified heart rate subgroup at or above 70 also failed on the primary endpoint (HR 0.91, p=0.17). Two secondary endpoints in that subgroup were positive, and it was those that generated the SIGNIFY hypothesis.',
        independentReplicationStatus: 'Failed to Replicate',
      },
      {
        trialId: 'SIGNIFY (ISRCTN61576291)',
        phase: 'Phase 3, randomised, double-blind, placebo-controlled',
        sampleSize: 19102,
        primaryEndpoint:
          'Composite of death from cardiovascular causes or non-fatal myocardial infarction',
        endpointMet: false,
        statisticalPValue:
          '6.8% against 6.4%; hazard ratio 1.08 (95% CI 0.96 to 1.20), p=0.20 over a median 27.8 months',
        unreportedAdverseSignals:
          'Ivabradine increased the primary endpoint among the 12,049 patients with activity-limiting angina but not among those without it, p=0.02 for interaction. Bradycardia occurred in 18.0% against 2.3%, p<0.001, at a dose above the approved heart failure dose.',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Composite of cardiovascular death or heart failure admission 24% against 29% in 6,558 patients (HR 0.82, p<0.0001)',
        'No effect on the primary composite in 10,917 patients with coronary disease and reduced ejection fraction (HR 1.00, p=0.94)',
        'No effect on the primary composite in 19,102 patients with stable coronary disease (HR 1.08, p=0.20), with harm in the angina subgroup (interaction p=0.02)',
        'Atrial fibrillation 5.0% per patient-year against 3.9%, bradycardia 10% against 2.2%, phosphenes 2.8% against 0.5%',
      ],
      unsupportedInferences: [
        'That ivabradine reduces death — the SHIFT effect was driven by admissions and heart failure deaths, and the United States indication claims only reduced hospitalisation',
        'That the SHIFT benefit belongs to ivabradine rather than to residual room for beta-blocker uptitration, which no trial has tested',
        'That heart rate reduction is beneficial in itself, which BEAUTIFUL and SIGNIFY tested directly and did not support outside heart failure',
        'That the myocardial infarction reduction in a BEAUTIFUL subgroup was real, when the confirmatory trial designed to test it found the opposite interaction',
      ],
      whatFailedInitially: [
        'BEAUTIFUL missed its primary endpoint with a hazard ratio of exactly 1.00 in 10,917 patients',
        'SIGNIFY missed its primary endpoint in 19,102 patients and found a significant interaction indicating harm in the target angina population',
        'A systematic review of 47 angina trials in 35,797 participants found no effect on mortality or quality of life and slightly more serious adverse events',
        'The drug increases atrial fibrillation, the arrhythmia in which it stops working, and the label directs discontinuation if it develops',
      ],
      realWorldOutcome: [
        'Approved in the United States on 15 April 2015 under NDA 206143, ten years after its European angina approval',
        'The United States indication is written narrowly around hospitalisation and does not claim a mortality benefit',
        'European regulators restricted the angina labelling after SIGNIFY',
        'It is the cleanest test of the heart rate hypothesis ever run, and the answer it gave was condition-specific rather than general',
      ],
    },
    deliverySystem: {
      type: 'Oral tablet taken twice daily with food; an oral solution exists for paediatric use from six months of age',
      description:
        'The dose is titrated to a resting heart rate between 50 and 60 beats per minute, which makes this one of the few drugs whose target is a number measured at each visit rather than a fixed strength. Clearance is dominated by CYP3A4, so strong inhibitors of that enzyme are a contraindication rather than a caution.',
      safetyProfile:
        'Contraindicated in acute decompensated heart failure, clinically significant hypotension, sick sinus syndrome, sinoatrial block or third-degree AV block without a demand pacemaker, clinically significant bradycardia, severe hepatic impairment, pacemaker dependence, and with strong CYP3A4 inhibitors. It increases atrial fibrillation and the label directs discontinuation if it develops. Bradycardia, sinus arrest and heart block occur at 6.0% per patient-year. Phosphenes affected 2.8% against 0.5% on placebo. Animal studies showed embryo-fetal toxicity and cardiac teratogenic effects at one to three times human exposure, and effective contraception is directed.',
    },
    commonQuestions: [
      {
        q: 'Will it help me live longer?',
        a: 'The evidence says it keeps people out of hospital, and the regulator wrote the indication accordingly. The United States label says the drug is indicated to reduce the risk of hospitalisation for worsening heart failure — that phrase, and no mortality claim. In SHIFT, the combined measure of cardiovascular death or heart failure admission fell from 29% to 24%, and the published account states the effect was driven mainly by admissions for worsening heart failure and by deaths specifically from heart failure. Staying out of hospital matters a great deal on its own. It is a different claim from living longer, and this label keeps them apart.',
      },
      {
        q: 'Why does it only work if I am in normal rhythm?',
        a: 'Because the target only sets the pace in normal rhythm. Ivabradine blocks the current in the sinus node — the heart natural pacemaker — that decides how often it fires. In atrial fibrillation the atria are firing chaotically and the ventricular rate is set by what gets through the AV node, not by the sinus node at all, so the drug has nothing to act on. There is an uncomfortable corollary: the drug also makes atrial fibrillation more likely, at 5.0% per patient-year against 3.9% on placebo, and the label directs stopping it if that rhythm develops. The adverse event and the loss of the indication arrive together.',
      },
      {
        q: 'I see flashes of light. Is my vision being damaged?',
        a: 'Almost certainly not, and there is a specific explanation. The channel the drug blocks in the heart has close relatives in the retina, where they help damp the response to sudden bright light. Blocking part of that current means a rapid change in brightness produces a brief enhanced brightness in one area of the visual field — that is what a phosphene is. It affected 2.8% of patients against 0.5% on placebo, and it is described in the label as transient. It is worth mentioning, particularly if you drive at night, and it is one of the more common reasons people choose to stop the drug.',
      },
      {
        q: 'It failed in two big trials. Why is it still used?',
        a: 'Because the failures and the success were in different conditions. BEAUTIFUL, in 10,917 patients with coronary disease and a weakened heart, found a hazard ratio of exactly 1.00. SIGNIFY, in 19,102 patients with stable coronary disease and no heart failure, found 1.08, and among patients whose angina limited their activity — the group it targeted — outcomes were worse on the drug. Those trials tested whether lowering heart rate helps in coronary disease, and the answer was no. SHIFT tested whether it helps in heart failure with a fast rate, and found fewer admissions. The lesson people take from that pair is that heart rate is not universally the enemy, and the drug is licensed only for the setting where it helped.',
        auditNote:
          'BEAUTIFUL produced a positive secondary result in a subgroup, SIGNIFY was built to confirm it, and SIGNIFY found the interaction pointing the other way. That sequence is the clearest illustration in this file of why a subgroup finding is a hypothesis rather than a result.',
      },
      {
        q: 'Should I have more beta-blocker instead?',
        a: 'That is exactly the question nobody has answered, and it is worth asking your prescriber. The indication requires that you already be on the maximum beta-blocker dose you can tolerate, or unable to take one. Maximally tolerated and target dose are not the same thing, and in SHIFT a minority of patients were at their beta-blocker target. Since beta-blockers also lower heart rate and do reduce deaths, while ivabradine lowers heart rate and did not reduce all-cause death, the untested possibility is that some of the SHIFT benefit reflects room left in the beta-blocker rather than something ivabradine adds. No randomised trial has compared uptitrating the beta-blocker against adding ivabradine.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Swedberg K, Komajda M, Bohm M, et al. Ivabradine and outcomes in chronic heart failure (SHIFT): a randomised placebo-controlled study. Lancet 2010;376:875-885',
        identifier: '10.1016/S0140-6736(10)61198-1',
        kind: 'doi',
      },
      {
        label:
          'Fox K, Ford I, Steg PG, Tendera M, Ferrari R. Ivabradine for patients with stable coronary artery disease and left-ventricular systolic dysfunction (BEAUTIFUL): a randomised, double-blind, placebo-controlled trial. Lancet 2008;372:807-816',
        identifier: '10.1016/S0140-6736(08)61170-8',
        kind: 'doi',
      },
      {
        label:
          'Fox K, Ford I, Steg PG, Tardif JC, Tendera M, Ferrari R. Ivabradine in stable coronary artery disease without clinical heart failure (SIGNIFY). N Engl J Med 2014;371:1091-1099',
        identifier: '10.1056/NEJMoa1406430',
        kind: 'doi',
      },
      {
        label:
          'Maagaard M, Nielsen EE, Sethi NJ, et al. Effects of adding ivabradine to usual care in patients with angina pectoris: a systematic review of randomised clinical trials with meta-analysis and Trial Sequential Analysis. Open Heart 2020;7:e001288',
        identifier: '10.1136/openhrt-2020-001288',
        kind: 'doi',
      },
      {
        label:
          'BEAUTIFUL: ivabradine in coronary artery disease with left ventricular systolic dysfunction',
        identifier: 'NCT00143507',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: CORLANOR (ivabradine), NDA 206143, Amgen — original approval 15 April 2015; prescribing information sections 1.1, 4, 5.1 to 5.3, 6.1, 12.1 and 14.1',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=206143',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — ivabradine, 16 listed products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 132999 — ivabradine structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/132999',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 10. Sacubitril / valsartan — one of the strongest single trials in heart failure, followed by
  //     two failures, and an indication broadened on the trial that missed at p=0.06.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'sacubitril',
    name: 'Sacubitril / Valsartan',
    tradeName: 'Entresto / Entresto Sprinkle',
    sponsor: 'Novartis Pharmaceuticals Corporation',
    targetGene: 'MME (neprilysin) and AGTR1',
    targetProtein:
      'Neprilysin, inhibited by LBQ657 the active metabolite of the prodrug sacubitril; and the angiotensin II type 1 receptor, blocked by valsartan',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 2015,
    indication:
      'To reduce the risk of cardiovascular death and hospitalisation for heart failure in adults with chronic heart failure, with benefits most clearly evident below normal left ventricular ejection fraction; and for symptomatic heart failure with systemic left ventricular systolic dysfunction in children aged one year and older',
    patientFriendlyIndication: 'A weakened heart, to reduce dying of it and being admitted for it',
    anatomicalSite:
      'Circulating and endothelial neprilysin, which degrades natriuretic peptides, and the angiotensin II type 1 receptor on vascular, renal and adrenal cells',
    conditionContext: {
      conditionExplainer:
        'A failing heart releases natriuretic peptides, hormones that tell the kidney to shed salt and the arteries to relax. They are the body own counter-regulation, and they are destroyed within minutes by an enzyme called neprilysin. Blocking that enzyme lets them last longer. On its own that also lets angiotensin II last longer, which is the opposite of what is wanted — so the drug carries a second molecule to block the angiotensin receptor.',
      whyItMatters:
        'This is the first drug in thirty years to beat an ACE inhibitor on mortality in heart failure with reduced ejection fraction, in a trial stopped early for overwhelming benefit. It is also the drug whose indication was later broadened to cover heart failure generally on the strength of a trial that did not reach significance, which is one of the more consequential regulatory judgements of the last decade.',
      whoTakesThis:
        'Adults with chronic heart failure, in practice mainly those with reduced ejection fraction, and children from one year old with systolic dysfunction. Not people who have had angioedema on an ACE inhibitor or angiotensin receptor blocker, and never within a day and a half of an ACE inhibitor.',
      clinicalGoals:
        'Fewer cardiovascular deaths and fewer heart failure admissions — both measured directly in the trial rather than inferred from a surrogate, which is unusual in this file. The paediatric indication is the exception and rests on a blood test.',
    },
    oneSentenceVerdict:
      'A neprilysin inhibitor paired with an angiotensin receptor blocker that cut cardiovascular death or heart failure admission from 26.5% to 21.8% and all-cause death from 19.8% to 17.0% against enalapril in 8,442 patients, in a trial stopped early — and whose indication was later widened to chronic heart failure generally on the basis of PARAGON-HF, which missed its primary endpoint at p=0.06.',
    laymanHowItWorks:
      'When the heart is failing it makes hormones that tell the body to shed salt and relax the arteries — its own attempt at treatment. An enzyme called neprilysin chews those hormones up almost as fast as they appear. Half of this tablet blocks that enzyme, so the helpful hormones last longer. But neprilysin also breaks down angiotensin II, the hormone that tightens arteries and retains salt, so blocking the enzyme alone would make things worse. The other half of the tablet blocks the receptor angiotensin II uses, which cancels that problem. Neither half works properly without the other.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear:
        'US$0.5291 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 100 listed products, survey effective 19 August 2026)',
      markupEstimate: '',
      openPatentNotes:
        'Approved in the United States on 7 July 2015 under NDA 207620, with the paediatric sprinkle formulation added under NDA 218591. It launched as one of the most expensive chronic heart failure drugs in the United States and was among the first ten products selected for Medicare price negotiation under the Inflation Reduction Act, which is a policy fact about the price rather than a clinical one.',
      synthesisComplexity: 'High',
      costSource: COST_OF_PRODUCTION_SOURCE,
      priceSource: NADAC_SOURCE,
    },
    substitutes: {
      summary:
        'This drug replaces the ACE inhibitor or angiotensin receptor blocker in a heart failure regimen rather than adding to it — the two cannot be given together, and the label requires a day and a half between them. The comparison that matters is against enalapril, which PARADIGM-HF made directly, and against the argument that the enalapril arm was fixed at a dose some cardiologists consider submaximal. The other drugs in the regimen are additions, not alternatives.',
      conventionalRx: [
        {
          name: 'Enalapril or another ACE inhibitor',
          class: 'Angiotensin-converting enzyme inhibitor',
          howItCompares:
            'The active comparator in PARADIGM-HF, given at 10 mg twice daily. Sacubitril-valsartan beat it: primary composite 21.8% against 26.5% (HR 0.80, p<0.0001) and all-cause mortality 17.0% against 19.8% (HR 0.84, p=0.0009). It is also very much cheaper and has a far longer record.',
          typicalCost:
            'Generic; among the cheapest prescription drugs at pharmacy acquisition cost',
          prosAndCons:
            'Pros: decades of mortality evidence in its own right, negligible cost, no washout needed to start. Cons: it lost the head-to-head trial; dry cough in roughly one in ten; the same fetal toxicity boxed warning.',
        },
        {
          name: 'Valsartan or another angiotensin receptor blocker alone',
          class: 'Angiotensin II receptor blocker',
          howItCompares:
            'Half of this tablet. In PARAGON-HF, valsartan alone was the comparator in preserved-ejection-fraction heart failure, and the combination did not significantly beat it: rate ratio 0.87 (95% CI 0.75 to 1.01, p=0.06).',
          typicalCost:
            'US$0.1648 per tablet at United States pharmacy acquisition cost (CMS NADAC, median across 163 listed generic products, survey effective 19 August 2026)',
          prosAndCons:
            'Pros: a third of the price; no neprilysin inhibition, so no theoretical amyloid concern; less hypotension. Cons: it was the arm that lost, narrowly, in preserved ejection fraction and was not tested against the combination in reduced ejection fraction.',
        },
        {
          name: 'An SGLT2 inhibitor such as dapagliflozin or empagliflozin',
          class: 'Sodium-glucose cotransporter 2 inhibitor',
          howItCompares:
            'Added on top rather than instead. It reduces cardiovascular death and heart failure hospitalisation across the ejection fraction range, including the preserved-ejection-fraction population where sacubitril-valsartan narrowly missed.',
          typicalCost: 'Branded in the United States; more expensive per tablet',
          prosAndCons:
            'Pros: benefit demonstrated at preserved ejection fraction, where this drug did not reach significance. Cons: genital mycotic infection, volume depletion, euglycaemic ketoacidosis.',
        },
        {
          name: 'A mineralocorticoid receptor antagonist such as spironolactone',
          class: 'Aldosterone antagonist',
          howItCompares:
            'Also added rather than substituted; 58% of PARADIGM-HF patients were already taking one. Its own mortality evidence in reduced ejection fraction predates this drug by nearly two decades.',
          typicalCost: 'Generic; a few United States cents per tablet at pharmacy acquisition cost',
          prosAndCons:
            'Pros: cheap; long-established mortality benefit. Cons: hyperkalaemia, which is the adverse effect this drug reduces relative to enalapril; gynaecomastia with spironolactone specifically.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Leave a day and a half between this and an ACE inhibitor',
          action: 'Never take both, and confirm the gap when switching in either direction.',
          patientImpact:
            'Concomitant use with an ACE inhibitor is an absolute contraindication, and the label directs that this drug not be given within 36 hours of switching from or to one. The reason is angioedema: both drugs raise bradykinin, by different steps, and the risk compounds.',
          clinicalPrecaution:
            'A history of angioedema on any ACE inhibitor or angiotensin receptor blocker is itself a contraindication, and the drug must never be re-administered after an episode.',
        },
        {
          name: 'Know the signs of angioedema, and treat swelling of the tongue as an emergency',
          action:
            'Seek urgent help for swelling of the face, lips, tongue or throat, or any difficulty breathing.',
          patientImpact:
            'The label states that angioedema associated with laryngeal oedema may be fatal, and that where tongue, glottis or larynx are involved, adrenaline and airway measures are needed. Swelling confined to face and lips has generally resolved without treatment.',
          clinicalPrecaution:
            'The label records a higher rate of angioedema in Black than in non-Black patients, and PARADIGM-HF enrolled only 5% Black patients, so the population in which the risk is highest is the one the trial characterised least.',
        },
        {
          name: 'Say immediately if you are or might become pregnant',
          action: 'Raise it before starting and at any point the situation changes.',
          patientImpact:
            'The drug carries a boxed warning for fetal toxicity. Drugs acting on the renin-angiotensin system reduce fetal renal function in the second and third trimesters and increase fetal and neonatal morbidity and death.',
          clinicalPrecaution:
            'The label directs considering an alternative and discontinuing when pregnancy is detected, with an explicit carve-out only if there is no appropriate alternative and the drug is considered lifesaving for the mother.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCOC(=O)[C@H](C)C[C@@H](CC1=CC=C(C=C1)C2=CC=CC=C2)NC(=O)CCC(=O)O',
      chemicalFormula: 'C24H29NO5',
      molecularWeight: '411.50 g/mol — the sacubitril component only',
      targetReceptorAffinity:
        'The structure carried here is sacubitril, the neprilysin-inhibitor half; the valsartan half has its own record. The marketed product is not a simple physical mixture but a co-crystal of the two sodium salts in a fixed molar ratio, which is why its dose strengths are quoted as combined totals — 24/26, 49/51 and 97/103 mg, referred to in the trials as 50, 100 and 200 mg. Sacubitril is a prodrug: the ethyl ester is cleaved to LBQ657, which is the molecule that inhibits neprilysin. Valsartan selectively blocks the angiotensin II type 1 receptor and inhibits angiotensin II-dependent aldosterone release.',
      structureSource: {
        label:
          'PubChem CID 9811834 (sacubitril) — canonical SMILES, molecular formula and weight, as carried on the enriched record; dose-strength convention from the ENTRESTO label section 14',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9811834',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'scv-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Confirm the co-crystal, not just the two actives',
          description:
            'The marketed substance is a supramolecular sodium complex of sacubitril and valsartan in a fixed ratio, not a blend of two powders. A batch containing the right mass of both actives in the wrong solid form has different dissolution and different exposure. This is the one assay that a two-active blend specification would miss entirely.',
          reagentsAndBuffer:
            'Sacubitril and valsartan reference standards, powder X-ray diffraction against the reference pattern of the complex, differential scanning calorimetry, ion chromatography for sodium stoichiometry, Karl Fischer titration',
        },
        {
          id: 'scv-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Build the biphenyl amino acid backbone and acylate with succinate',
          description:
            'Sacubitril is a biphenyl-substituted gamma-amino acid ethyl ester acylated on the nitrogen with a succinic acid half-amide. The two stereocentres are set before the succinate is attached, because correcting stereochemistry after acylation is not practical. Valsartan is made separately by its own route and only combined at the crystallisation stage.',
          dependsOnStepId: 'scv-w1',
          reagentsAndBuffer:
            'Chiral biphenylalanine-derived intermediate, ethyl ester protection, succinic anhydride with base in an aprotic solvent, nitrogen atmosphere, with separately manufactured valsartan held for the complexation step',
        },
        {
          id: 'scv-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Co-crystallise the two sodium salts in fixed ratio',
          description:
            'Dissolve both actives with sodium hydroxide and crystallise the complex. This is a purification step and a formulation step at once: the ratio, the hydration state and the crystal form are all fixed here, and all three determine what the tablet does.',
          dependsOnStepId: 'scv-w2',
          reagentsAndBuffer:
            'Sodium hydroxide in a controlled water-solvent system, seeded crystallisation with a defined cooling ramp, powder X-ray diffraction and dynamic vapour sorption for hydrate confirmation',
        },
        {
          id: 'scv-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Confirm ester hydrolysis to LBQ657 in hepatocytes',
          description:
            'Sacubitril itself inhibits nothing. It must be de-esterified to LBQ657 before it touches neprilysin, and the carboxylesterases that do that are hepatic. A cell-free assay using the parent compound reports a drug that does not exist in the patient.',
          dependsOnStepId: 'scv-w3',
          reagentsAndBuffer:
            'Primary human hepatocytes or liver S9 fraction, LC-MS/MS quantification of sacubitril and LBQ657, esterase inhibitor control arm, physiological buffer at 37 degrees Celsius',
        },
        {
          id: 'scv-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Neprilysin inhibition and natriuretic peptide half-life in the same system',
          description:
            'Measure enzyme inhibition against a fluorogenic substrate, then measure what it is for: the survival of intact natriuretic peptide in plasma. Neprilysin has many substrates besides the natriuretic peptides — bradykinin, substance P, amyloid beta — so a specificity panel is part of the assay rather than an optional extra, and it is where the theoretical safety questions about the drug live.',
          dependsOnStepId: 'scv-w4',
          reagentsAndBuffer:
            'Recombinant human neprilysin with a fluorogenic peptide substrate, human plasma spiked with BNP and ANP with immunoassay of intact peptide over time, counter-screen panel including bradykinin, substance P and amyloid beta degradation',
        },
      ],
    },
    keyAudits: [
      {
        id: 'scv-a1',
        category: 'measured',
        title: 'PARADIGM-HF: fewer deaths than on enalapril, and the trial was stopped early',
        laymanSummary:
          'Eight and a half thousand patients with a weakened heart were randomised to this drug or to enalapril, the standard treatment. The combined measure fell from 26.5% to 21.8%, and deaths from any cause from 19.8% to 17.0%. The trial was halted before its planned end because the benefit was so clear.',
        technicalDetails:
          'PARADIGM-HF randomised 8,442 patients with NYHA class II to IV heart failure and ejection fraction at or below 40% to sacubitril-valsartan 200 mg twice daily (n=4,209) or enalapril 10 mg twice daily (n=4,233), on top of recommended therapy including a beta-blocker in 94% and a mineralocorticoid antagonist in 58%. It was stopped early after a median 27 months on the prespecified overwhelming-benefit boundary. The primary composite of cardiovascular death or heart failure hospitalisation occurred in 914 (21.8%) against 1,117 (26.5%), hazard ratio 0.80 (95% CI 0.73 to 0.87, p<0.001). All-cause mortality was 711 (17.0%) against 835 (19.8%), hazard ratio 0.84 (95% CI 0.76 to 0.93, p=0.0009), a finding the label states was driven entirely by lower cardiovascular mortality: 558 (13.3%) against 693 (16.5%), hazard ratio 0.80 (0.71 to 0.89). Heart failure hospitalisation fell 21%. Sudden death accounted for 45% of cardiovascular deaths. The drug arm had more hypotension and non-serious angioedema and less renal impairment, hyperkalaemia and cough.',
        evidenceSource:
          'McMurray JJ et al., N Engl J Med 2014;371:993-1004 (PARADIGM-HF, NCT01035255); ENTRESTO United States prescribing information section 14.1',
        doi: '10.1056/NEJMoa1409077',
        measuredMetric:
          'Composite of cardiovascular death or heart failure hospitalisation, and all-cause mortality, against enalapril',
        auditFlag: 'verified',
      },
      {
        id: 'scv-a2',
        category: 'inferred',
        title: 'Only patients who tolerated both drugs in a run-in were randomised',
        laymanSummary:
          'Before randomisation, everyone was given enalapril for a period and then the new drug at increasing strength. Only those who got through both without a problem entered the trial. The result therefore describes people already known to tolerate both drugs.',
        technicalDetails:
          'The label describes the design: after discontinuing existing ACE inhibitor or angiotensin receptor blocker therapy, patients entered sequential single-blind run-in periods on enalapril 10 mg twice daily followed by sacubitril-valsartan 100 mg twice daily increasing to 200 mg twice daily, and only patients who successfully completed both run-in periods were randomised. Patients with systolic pressure below 100 mmHg at screening were excluded outright. A sequential double run-in is a legitimate way to reduce dropout noise in a mortality trial and it selects the randomised population: people who could not tolerate the target dose of either drug never appear in the denominator. That makes the measured hazard ratio a valid estimate for people like those randomised and an optimistic one for an unselected clinic population, particularly on the tolerability endpoints.',
        evidenceSource:
          'ENTRESTO United States prescribing information, section 14.1 (NDA 207620); McMurray JJ et al., N Engl J Med 2014;371:993-1004',
        doi: '10.1056/NEJMoa1409077',
        inferredClaim:
          'That the PARADIGM-HF hazard ratios apply unchanged to patients who have not first been shown to tolerate target doses of both drugs — the run-in design means the trial did not test that population',
        auditFlag: 'caution',
      },
      {
        id: 'scv-a3',
        category: 'failed',
        title: 'PARAGON-HF missed, at p=0.06, in 4,822 patients',
        laymanSummary:
          'In heart failure with a normal-looking pumping fraction, the drug was compared against valsartan alone. The result came within a hair of significance and did not reach it.',
        technicalDetails:
          'PARAGON-HF randomised 4,822 patients with NYHA class II to IV heart failure, ejection fraction at or above 45%, elevated natriuretic peptides and structural heart disease, to sacubitril-valsartan at a target of 97/103 mg twice daily or valsartan at a target of 160 mg twice daily. The primary outcome, total heart failure hospitalisations and cardiovascular death, gave 894 primary events in 526 patients against 1,009 in 557: rate ratio 0.87 (95% CI 0.75 to 1.01, p=0.06). Cardiovascular death was 8.5% against 8.9% (HR 0.95, 0.79 to 1.16) and total heart failure hospitalisations 690 against 797 (rate ratio 0.85, 0.72 to 1.00). NYHA class improved in 15.0% against 12.6% (OR 1.45, 1.13 to 1.86); renal function worsened in 1.4% against 2.7% (HR 0.50, 0.33 to 0.77); the mean KCCQ clinical summary score at eight months was 1.0 point higher (95% CI 0.0 to 2.1). Hypotension and angioedema were more common and hyperkalaemia less common. Among 12 prespecified subgroups there was suggestion of heterogeneity, with possible benefit at lower ejection fraction and in women. The published conclusion is that the drug did not result in a significantly lower rate of the primary outcome.',
        evidenceSource:
          'Solomon SD et al., N Engl J Med 2019;381:1609-1620 (PARAGON-HF, NCT01920711)',
        doi: '10.1056/NEJMoa1908655',
        measuredMetric:
          'Total heart failure hospitalisations and cardiovascular death, against valsartan alone, at ejection fraction 45% or above',
        auditFlag: 'verified',
      },
      {
        id: 'scv-a4',
        category: 'conclusion_shift',
        title: 'The indication was broadened on the trial that missed',
        laymanSummary:
          'After a trial that did not reach statistical significance, the licence was widened from reduced pumping fraction to chronic heart failure generally, with a sentence saying the benefit is clearest when the pumping fraction is below normal and that doctors should use judgement.',
        technicalDetails:
          'The current United States indication reads: indicated to reduce the risk of cardiovascular death and hospitalisation for heart failure in adult patients with chronic heart failure, with benefits most clearly evident in patients with left ventricular ejection fraction below normal, adding that ejection fraction is a variable measure so clinical judgement should be used in deciding whom to treat. That wording replaced the original restriction to reduced ejection fraction, and the evidence that supported the widening is PARAGON-HF, whose primary endpoint gave a rate ratio of 0.87 with a confidence interval touching 1.01 at p=0.06, together with the subgroup suggestion of benefit at lower ejection fraction. Whether this is a regulator reading a body of evidence sensibly or a regulator approving on a negative trial is a genuine argument, and the label unusual instruction to use clinical judgement about a numeric threshold is the sentence in which that argument is visible.',
        evidenceSource:
          'ENTRESTO United States prescribing information, section 1.1 (NDA 207620); Solomon SD et al., N Engl J Med 2019;381:1609-1620',
        doi: '10.1056/NEJMoa1908655',
        inferredClaim:
          'That the benefit demonstrated at reduced ejection fraction extends across the ejection fraction range — inferred from a trial that missed its primary endpoint and from subgroup heterogeneity within it',
        auditFlag: 'contested',
      },
      {
        id: 'scv-a5',
        category: 'failed',
        title: 'PARADISE-MI: no benefit after myocardial infarction, in 5,661 patients',
        laymanSummary:
          'Given straight after a heart attack that had weakened the heart, the drug was compared against ramipril. Deaths from heart causes and new heart failure were no less common.',
        technicalDetails:
          'PARADISE-MI randomised 5,661 patients with myocardial infarction complicated by reduced left ventricular ejection fraction, pulmonary congestion or both, to sacubitril-valsartan 97/103 mg twice daily (n=2,830) or ramipril 5 mg twice daily (n=2,831) in addition to recommended therapy. Over a median 22 months the primary outcome of cardiovascular death or incident heart failure occurred in 338 (11.9%) against 373 (13.2%), hazard ratio 0.90 (95% CI 0.78 to 1.04, p=0.17). Cardiovascular death or heart failure hospitalisation was 10.9% against 11.8% (HR 0.91, 0.78 to 1.07), cardiovascular death 5.9% against 6.7% (HR 0.87, 0.71 to 1.08) and death from any cause 7.5% against 8.5% (HR 0.88, 0.73 to 1.05). Discontinuation for an adverse event was 12.6% against 13.4%. Every point estimate favours the drug and none reaches significance, which is a different failure from a flat one and is not the same as a positive result.',
        evidenceSource:
          'Pfeffer MA et al., N Engl J Med 2021;385:1845-1855 (PARADISE-MI, NCT02924727)',
        doi: '10.1056/NEJMoa2104508',
        measuredMetric:
          'Cardiovascular death or incident heart failure after myocardial infarction, against ramipril',
        auditFlag: 'verified',
      },
      {
        id: 'scv-a6',
        category: 'inferred',
        title: 'The paediatric indication rests on a blood test and says so',
        laymanSummary:
          'For children, the licence was granted on the basis that the drug lowers a heart failure blood marker. The label states in plain words that improved outcomes are expected, not shown.',
        technicalDetails:
          'Section 1.2 reads: ENTRESTO is indicated for the treatment of symptomatic heart failure with systemic left ventricular systolic dysfunction in pediatric patients aged one year and older. ENTRESTO reduces NT-proBNP and is expected to improve cardiovascular outcomes. The word expected is doing the work of an outcome trial. NT-proBNP is a validated prognostic marker and it is not a demonstrated treatment target; a drug can lower it without changing what happens to the child. Extrapolating adult efficacy to children is standard regulatory practice where the disease mechanism is shared, and it is an inference. This label is unusually honest in marking it as one.',
        evidenceSource:
          'ENTRESTO United States prescribing information, section 1.2 (NDA 207620 and NDA 218591)',
        inferredClaim:
          'That an NT-proBNP reduction in children translates into fewer deaths and admissions — the label states it is expected, which is the correct word and not a measurement',
        auditFlag: 'caution',
      },
      {
        id: 'scv-a7',
        category: 'failed',
        title: 'Angioedema, a boxed warning and a 36-hour rule',
        laymanSummary:
          'This drug cannot be combined with an ACE inhibitor, and a day and a half must pass when switching. The reason is swelling of the airway, which can be fatal, and it is more common in Black patients — a group who made up one in twenty of the main trial.',
        technicalDetails:
          'Contraindications are hypersensitivity, a history of angioedema related to previous ACE inhibitor or angiotensin receptor blocker therapy, concomitant ACE inhibitor use with a 36-hour separation required when switching in either direction, and aliskiren in diabetes. The label states that angioedema with laryngeal oedema may be fatal, that the drug must not be re-administered after an episode, and that it has been associated with a higher rate of angioedema in Black than in non-Black patients. PARADIGM-HF enrolled 66% Caucasian, 18% Asian and 5% Black patients, so the population at highest risk of the drug most dangerous adverse effect is the one the pivotal trial characterised least well. A boxed warning for fetal toxicity applies, as with every renin-angiotensin drug.',
        evidenceSource:
          'ENTRESTO United States prescribing information, boxed warning, sections 4, 5.1, 5.2 and 14.1 (NDA 207620)',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The failing heart makes its own treatment',
        laymanDesc:
          'A stretched heart releases hormones that tell the kidney to shed salt and the arteries to relax. They are helpful, and they are destroyed within minutes.',
        molecularDetail:
          'Atrial and B-type natriuretic peptides are released in response to myocyte stretch and act through particulate guanylate cyclase to raise cyclic GMP, producing natriuresis, vasodilatation and inhibition of fibrosis. Neprilysin, a zinc metallopeptidase, degrades them along with bradykinin, substance P, adrenomedullin and angiotensin II.',
        iconName: 'Droplets',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'One half is a prodrug that has to be unmasked',
        laymanDesc:
          'Sacubitril as swallowed does nothing. The liver removes a chemical cap, and only the unmasked form blocks the destroying enzyme.',
        molecularDetail:
          'Sacubitril is an ethyl ester prodrug hydrolysed by carboxylesterases to LBQ657, the active neprilysin inhibitor. The label attributes the cardiovascular and renal effects to increased levels of neprilysin substrates such as the natriuretic peptides, produced by LBQ657.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The destroying enzyme is blocked',
        laymanDesc:
          'With the enzyme inhibited, the helpful hormones survive longer and act for longer. More salt is passed, arteries stay wider, and scarring signals are damped.',
        molecularDetail:
          'Neprilysin inhibition raises circulating and tissue natriuretic peptide concentration, increasing cyclic GMP signalling. This is the reason plasma BNP rises on treatment while NT-proBNP falls — BNP is a neprilysin substrate and NT-proBNP is not, which makes BNP unusable as a monitoring marker on this drug.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The second half cancels the drug own side effect',
        laymanDesc:
          'The same enzyme also destroys the hormone that tightens arteries. Blocking it alone would let that hormone build up too, which is why a second drug blocks its receptor.',
        molecularDetail:
          'Neprilysin degrades angiotensin II as well as the natriuretic peptides, so inhibition alone raises angiotensin II. Valsartan blocks the AT1 receptor selectively and inhibits angiotensin II-dependent aldosterone release, which is why single-agent neprilysin inhibitors failed and why the earlier combination with an ACE inhibitor, omapatrilat, was abandoned over angioedema.',
        iconName: 'Ban',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fewer deaths and fewer admissions, against the standard drug',
        laymanDesc:
          'Compared head to head against enalapril in eight and a half thousand patients, deaths from any cause fell from about one in five to about one in six.',
        molecularDetail:
          'PARADIGM-HF: primary composite 21.8% against 26.5% (HR 0.80, 95% CI 0.73 to 0.87, p<0.001); all-cause mortality 17.0% against 19.8% (HR 0.84, 0.76 to 0.93, p=0.0009), driven entirely by lower cardiovascular mortality (13.3% against 16.5%, HR 0.80). The trial was stopped early on the overwhelming-benefit boundary.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
      {
        step: 6,
        title: 'Where the same mechanism did not deliver',
        laymanDesc:
          'In heart failure with a normal-looking pumping fraction, and immediately after a heart attack, the same drug was tested and neither trial reached significance.',
        molecularDetail:
          'PARAGON-HF: rate ratio 0.87 (95% CI 0.75 to 1.01, p=0.06) in 4,822 patients at ejection fraction 45% or above. PARADISE-MI: hazard ratio 0.90 (0.78 to 1.04, p=0.17) in 5,661 patients after infarction. The indication was nevertheless widened to chronic heart failure generally, with the label directing clinical judgement about ejection fraction.',
        iconName: 'HelpCircle',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'PARADIGM-HF (NCT01035255)',
        phase: 'Phase 3, randomised, double-blind, active-controlled, event-driven',
        sampleSize: 8442,
        primaryEndpoint:
          'Composite of cardiovascular death or hospitalisation for heart failure, against enalapril',
        endpointMet: true,
        statisticalPValue:
          '21.8% against 26.5%; hazard ratio 0.80 (95% CI 0.73 to 0.87), p<0.001; all-cause mortality 17.0% against 19.8%, HR 0.84 (0.76 to 0.93), p=0.0009',
        unreportedAdverseSignals:
          'Stopped early on the prespecified overwhelming-benefit boundary, which tends to overestimate effect size. Randomisation followed sequential single-blind run-ins on both drugs, so patients intolerant of either never entered. Enalapril was fixed at 10 mg twice daily and patients with systolic pressure below 100 mmHg were excluded.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'PARAGON-HF (NCT01920711)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 4822,
        primaryEndpoint:
          'Total hospitalisations for heart failure and death from cardiovascular causes, against valsartan, at ejection fraction 45% or above',
        endpointMet: false,
        statisticalPValue: 'Rate ratio 0.87 (95% CI 0.75 to 1.01), p=0.06',
        unreportedAdverseSignals:
          'Among 12 prespecified subgroups there was suggestion of heterogeneity, with possible benefit at lower ejection fraction and in women. The United States indication was subsequently broadened on the strength of a trial that did not meet its primary endpoint.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'PARADISE-MI (NCT02924727)',
        phase: 'Phase 3, randomised, double-blind, active-controlled',
        sampleSize: 5661,
        primaryEndpoint:
          'Death from cardiovascular causes or incident heart failure after myocardial infarction, against ramipril',
        endpointMet: false,
        statisticalPValue:
          '11.9% against 13.2%; hazard ratio 0.90 (95% CI 0.78 to 1.04), p=0.17 over a median 22 months',
        unreportedAdverseSignals:
          'Every secondary point estimate favoured the drug and none reached significance. A uniformly directional miss is a different signal from a flat one, and it is still a miss.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Cardiovascular death or heart failure hospitalisation 21.8% against 26.5% on enalapril in 8,442 patients (HR 0.80, p<0.001)',
        'All-cause mortality 17.0% against 19.8% in the same trial (HR 0.84, p=0.0009), driven entirely by cardiovascular death',
        'No significant benefit at ejection fraction 45% or above in 4,822 patients (rate ratio 0.87, 95% CI 0.75 to 1.01, p=0.06)',
        'No significant benefit after myocardial infarction in 5,661 patients (HR 0.90, 95% CI 0.78 to 1.04, p=0.17)',
      ],
      unsupportedInferences: [
        'That the benefit extends across the ejection fraction range, which rests on a trial that missed its primary endpoint and on subgroup heterogeneity within it',
        'That the PARADIGM-HF hazard ratios apply to patients not pre-selected by a double run-in on both drugs',
        'That an NT-proBNP reduction in children means fewer deaths and admissions — the label says expected, not shown',
        'That the enalapril comparator represented maximal ACE inhibition, when it was fixed at 10 mg twice daily throughout',
      ],
      whatFailedInitially: [
        'PARAGON-HF missed its primary endpoint at p=0.06 in preserved-ejection-fraction heart failure',
        'PARADISE-MI missed its primary endpoint at p=0.17 after myocardial infarction, with every point estimate directionally favourable',
        'The predecessor combination, omapatrilat, which paired neprilysin inhibition with ACE inhibition, was abandoned over angioedema — the reason this drug uses a receptor blocker instead',
        'Angioedema remains the defining safety issue, is more common in Black patients, and PARADIGM-HF enrolled only 5% Black patients',
      ],
      realWorldOutcome: [
        'Approved in the United States on 7 July 2015 under NDA 207620, with a paediatric sprinkle formulation added later under NDA 218591',
        'The first drug in three decades to beat an ACE inhibitor on mortality in reduced-ejection-fraction heart failure',
        'The indication was broadened in 2021 to chronic heart failure generally, with the label directing clinical judgement about ejection fraction rather than a numeric cut-off',
        'Among the first products selected for Medicare price negotiation in the United States, which is where the argument about it now mostly sits',
      ],
    },
    deliverySystem: {
      type: 'Oral film-coated tablet at 24/26, 49/51 and 97/103 mg, taken twice daily; an oral pellet sprinkle formulation exists for children from one year',
      description:
        'The strengths are quoted as combined totals of both components because the substance is a co-crystal rather than a blend, and the trials referred to the same strengths as 50, 100 and 200 mg, which is a persistent source of confusion between the literature and the label. The paediatric sprinkle exists so the drug can be given from one year of age, which is why that indication could be written at all.',
      safetyProfile:
        'Boxed warning for fetal toxicity: discontinue when pregnancy is detected. Contraindicated in hypersensitivity, in a history of angioedema on any ACE inhibitor or angiotensin receptor blocker, with concomitant ACE inhibitor use and within 36 hours of switching, and with aliskiren in diabetes. Angioedema with laryngeal oedema may be fatal, the drug must never be re-administered after an episode, and the rate is higher in Black than in non-Black patients. Hypotension is more common than on enalapril; renal impairment, hyperkalaemia and cough are less common. Plasma BNP rises on treatment because BNP is a neprilysin substrate, so NT-proBNP rather than BNP is the usable marker.',
    },
    commonQuestions: [
      {
        q: 'Is this better than the ACE inhibitor I was on?',
        a: 'In the one trial that compared them directly, yes, and by a margin that is unusual in heart failure. PARADIGM-HF randomised 8,442 patients to this drug or to enalapril at 10 mg twice daily. The combined rate of cardiovascular death or heart failure admission was 21.8% against 26.5%, and deaths from any cause were 17.0% against 19.8% — a difference driven entirely by fewer cardiovascular deaths. The trial was stopped early because the benefit crossed a prespecified boundary. Two caveats belong with that. The enalapril dose was fixed rather than uptitrated, and only patients who had already tolerated target doses of both drugs during a run-in were randomised.',
        auditNote:
          'Trials stopped early for benefit tend to overestimate the size of the effect, because they stop at a random high point in the accumulating data. The direction of the PARADIGM-HF result is not in doubt; the magnitude probably is.',
      },
      {
        q: 'My ejection fraction is normal. Should I be on it?',
        a: 'This is the genuinely contested question, and the label is unusually candid about it. PARAGON-HF tested exactly this in 4,822 patients with an ejection fraction of 45% or above, comparing the drug against valsartan alone. The primary outcome gave a rate ratio of 0.87 with a confidence interval running from 0.75 to 1.01, at p=0.06 — it missed. Within it, subgroup analysis suggested possible benefit in patients with lower ejection fraction and in women. The FDA then broadened the indication to chronic heart failure generally, adding that benefits are most clearly evident below normal ejection fraction and that ejection fraction is a variable measure, so clinical judgement should be used. That sentence is a regulator declining to draw a line, and reasonable cardiologists disagree about whether it should have been drawn.',
      },
      {
        q: 'Why can I not take my old ACE inhibitor as well?',
        a: 'Because of angioedema, and because the field learned this the hard way. Both drug families raise bradykinin, a peptide that causes tissue swelling — ACE inhibitors by blocking the enzyme that degrades it, neprilysin inhibitors by blocking another. An earlier drug called omapatrilat combined neprilysin and ACE inhibition in one molecule and was abandoned because of angioedema. This product avoids that by pairing neprilysin inhibition with an angiotensin receptor blocker instead. Taking it alongside an ACE inhibitor recreates the combination that failed, so it is an absolute contraindication and the label requires 36 hours between the two in either direction.',
      },
      {
        q: 'My BNP went up after I started. Is it getting worse?',
        a: 'Almost certainly not, and this catches people out, including clinicians. BNP is itself one of the peptides that neprilysin destroys. Block the enzyme and BNP accumulates in the blood, so the number rises even as the heart improves. NT-proBNP, a different fragment released at the same time, is not a neprilysin substrate, so it still falls when things get better. On this drug NT-proBNP is the marker that means what you expect it to mean, and a rising BNP is a pharmacological consequence of the treatment rather than a sign of deterioration.',
      },
      {
        q: 'Is angioedema likely?',
        a: 'It is uncommon and it is the reason for most of the rules around this drug. Swelling confined to the face and lips has generally resolved without treatment. Swelling of the tongue, glottis or larynx can obstruct the airway and the label states it may be fatal, requiring adrenaline and airway management. Once it has happened, the drug must never be given again. The label records a higher rate in Black than in non-Black patients, and this is worth stating plainly: the main trial enrolled 5% Black patients against 66% Caucasian, so the group at highest risk of the drug most serious adverse effect is the group its pivotal trial described least well.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'McMurray JJ, Packer M, Desai AS, et al. Angiotensin-neprilysin inhibition versus enalapril in heart failure. N Engl J Med 2014;371:993-1004 (PARADIGM-HF)',
        identifier: '10.1056/NEJMoa1409077',
        kind: 'doi',
      },
      {
        label:
          'Solomon SD, McMurray JJV, Anand IS, et al. Angiotensin-neprilysin inhibition in heart failure with preserved ejection fraction. N Engl J Med 2019;381:1609-1620 (PARAGON-HF)',
        identifier: '10.1056/NEJMoa1908655',
        kind: 'doi',
      },
      {
        label:
          'Pfeffer MA, Claggett B, Lewis EF, et al. Angiotensin receptor-neprilysin inhibition in acute myocardial infarction. N Engl J Med 2021;385:1845-1855 (PARADISE-MI)',
        identifier: '10.1056/NEJMoa2104508',
        kind: 'doi',
      },
      {
        label: 'PARADIGM-HF: sacubitril-valsartan against enalapril in reduced ejection fraction',
        identifier: 'NCT01035255',
        kind: 'nct',
      },
      {
        label: 'PARAGON-HF: sacubitril-valsartan against valsartan in preserved ejection fraction',
        identifier: 'NCT01920711',
        kind: 'nct',
      },
      {
        label: 'PARADISE-MI: sacubitril-valsartan against ramipril after myocardial infarction',
        identifier: 'NCT02924727',
        kind: 'nct',
      },
      {
        label:
          'Drugs@FDA: ENTRESTO (sacubitril and valsartan), NDA 207620, Novartis — original approval 7 July 2015; prescribing information boxed warning and sections 1.1, 1.2, 4, 5.1, 5.2, 12.1 and 14.1',
        identifier:
          'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=207620',
        kind: 'regulatory',
      },
      {
        label:
          'CMS National Average Drug Acquisition Cost (NADAC) survey — sacubitril and valsartan, 100 listed products, effective 19 August 2026',
        identifier: 'https://data.medicaid.gov/dataset/fbb83258-11c7-47f5-8b18-5f8e79f7e704',
        kind: 'url',
      },
      {
        label: 'PubChem CID 9811834 — sacubitril structure, formula and molecular weight',
        identifier: 'https://pubchem.ncbi.nlm.nih.gov/compound/9811834',
        kind: 'url',
      },
    ],
  },
]
