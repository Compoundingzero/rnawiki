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
    sponsor: 'Novartis Pharmaceuticals Corporation; generic since 2014 and made by many manufacturers',
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
          typicalCost: 'Generic; a few United States cents more per tablet than the two-drug product',
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
        title: 'Two placebo-controlled factorial trials: the pair beat each half at almost every dose',
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
        title: 'VALUE: the two halves were compared head to head and the trial could not answer itself',
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
        primaryEndpoint:
          'Change from baseline in mean sitting diastolic blood pressure at week 8',
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
        statisticalPValue:
          'Hazard ratio 1.04, 95% CI 0.94 to 1.15, p=0.49 over a mean 4.2 years',
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
        label: 'PubChem CID 2585 (carvedilol) — canonical SMILES, molecular formula and weight, as carried on the enriched record',
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
        title: 'COPERNICUS: 35% fewer deaths in the sickest patients ever randomised to a beta-blocker',
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
        title: 'The same advisory committee looked at the same data twice and decided the opposite way',
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
        phase: 'Phase 3, four stratified double-blind placebo-controlled protocols analysed together',
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
        label:
          'Drugs@FDA: COREG (carvedilol), NDA 020297 — original approval 14 September 1995',
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
        title: 'The perioperative evidence was fabricated, and the surviving trials point the other way',
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
        evidenceSource:
          'Willenheimer R et al., Circulation 2005;112:2426-2435 (CIBIS III)',
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
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22bisoprolol+fumarate%22',
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
    sponsor: 'Allergan (current holder of NDA 021742); originated at Janssen and licensed to Mylan and then Forest Laboratories',
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
          activeCompound: 'Inorganic nitrate, reduced to nitrite by oral bacteria and then to nitric oxide',
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
    sponsor: 'Mt Adams Pharmaceuticals and many generic manufacturers; originated at Knoll AG in Germany',
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
        label: 'CLVer: verapamil and intensive diabetes management in newly diagnosed type 1 diabetes',
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
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22verapamil+hydrochloride%22',
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
    sponsor: 'Promius Pharma and many generic manufacturers; originated as the active metabolite of isosorbide dinitrate',
    targetGene: 'GUCY1A1 and GUCY1B1 — the two subunits of soluble guanylate cyclase',
    targetProtein:
      'Soluble guanylate cyclase in vascular smooth muscle, activated indirectly by nitric oxide released from the drug',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'Prevention and treatment of angina pectoris due to coronary artery disease. The label states that the onset of action is not sufficiently rapid for the oral product to be useful in aborting an acute anginal episode',
    patientFriendlyIndication: 'Chest pain from narrowed heart arteries, prevented rather than stopped',
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
          activeCompound: 'Inorganic nitrate, reduced by oral bacteria to nitrite and then to nitric oxide',
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
        label: 'NEAT-HFpEF: nitrate effect on activity tolerance in heart failure with preserved ejection fraction',
        identifier: 'NCT02053493',
        kind: 'nct',
      },
      {
        label:
          'Isosorbide mononitrate tablets United States prescribing information — Indications, Contraindications, Warnings, Clinical Pharmacology and Adverse Reactions sections',
        identifier: 'https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22isosorbide+mononitrate%22',
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
]
