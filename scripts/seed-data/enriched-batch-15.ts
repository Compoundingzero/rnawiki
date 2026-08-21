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
]
