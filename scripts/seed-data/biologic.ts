import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — recombinant proteins and biologics.
 *
 * Every DOI, PMID, NCT number and regulatory URL below was resolved against Europe PMC, Crossref,
 * ClinicalTrials.gov or openFDA (Drugs@FDA and the current SPL) at the time of writing. Trial arm
 * sizes, endpoints, p-values, approval dates and label facts are copied from the published
 * abstract, the Drugs@FDA submission record or the prescribing information — never from memory.
 * Where a number could not be sourced the field is absent rather than estimated.
 *
 * Four structural notes that apply to the whole group:
 *
 * 1. `structureTypeForModality` in `lib/rna-intelligence/layer1-sequence.ts` routes every
 *    'Recombinant Protein / Biologic' record to the descriptor branch, so no folding, logP or
 *    isoelectric model is claimed for these molecules. Where the mature amino-acid sequence is
 *    published and checkable (UniProt plus the FDA label's own description of the modification) it
 *    is carried verbatim, because a reader can verify it. Where the molecule is a fusion protein,
 *    a PEG conjugate or a chimeric construct whose exact junctions are a manufacturing design and
 *    not a published string — etanercept, pegloticase, asfotase alfa — `sequence5to3` is omitted
 *    entirely and only the label's molecular weight is given.
 *
 * 2. Cost of production is cited, never estimated. Only two records here carry a `pricing` block:
 *    insulin glargine and insulin lispro, where a peer-reviewed cost-of-manufacture model exists
 *    (Gotham, Barber and Hill, BMJ Global Health 2018, doi:10.1136/bmjgh-2018-000850; updated by
 *    Barber and colleagues, JAMA Network Open 2024, doi:10.1001/jamanetworkopen.2024.3474). No
 *    published cost-of-goods study covers epoetin alfa, filgrastim, somatropin, etanercept,
 *    alteplase, dornase alfa, pegloticase or asfotase alfa, so those dossiers carry no pricing
 *    block at all. An absent price is correct; an invented one is not.
 *
 * 3. Substitute costs are approximate US retail ranges, not quoted prices, and are labelled as
 *    such. Nothing in the `naturalFoods` or `homeRemedies` arrays is offered as a replacement for
 *    a prescription biologic, and where stopping the drug would be lethal — basal insulin in type 1
 *    diabetes, alteplase in stroke, asfotase alfa in infantile hypophosphatasia — the summary says
 *    so in the first sentence.
 *
 * 4. Laboratory workflows are recombinant-protein workflows: master cell bank release, fed-batch
 *    or fermentation expression, chromatographic capture and polish, conjugation where the product
 *    is PEGylated, then a potency bioassay. `dependsOnStepId` chains them in forward canonical
 *    phase order, which is what Layer 3 topologically sorts.
 */

const LANTUS_LABEL = {
  label: 'LANTUS (insulin glargine) injection — US prescribing information, DailyMed',
  identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=3a97c40f-0c83-42d7-a8ee-484b208db4e3',
  kind: 'regulatory' as const,
}

const HUMALOG_LABEL = {
  label: 'HUMALOG (insulin lispro) injection — US prescribing information, DailyMed',
  identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=51d3dc11-52b9-4296-a2f4-58c770d4448d',
  kind: 'regulatory' as const,
}

const INSULIN_COST_SOURCE = {
  label:
    'Gotham D, Barber MJ, Hill A. Production costs and potential prices for biosimilars of human insulin and insulin analogues. BMJ Global Health 2018;3:e000850',
  identifier: '10.1136/bmjgh-2018-000850',
  kind: 'doi' as const,
}

const INSULIN_PRICE_SOURCE = {
  label:
    'Mulcahy AW, Schwam D. Comparing Insulin Prices in the U.S. to Other Countries. RAND for HHS ASPE, 2020',
  identifier: 'https://aspe.hhs.gov/sites/default/files/private/pdf/264056/Comparing-Insulin-Prices.pdf',
  kind: 'regulatory' as const,
}

export const BIOLOGIC_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Insulin glargine
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-glargine',
    name: 'Insulin glargine',
    tradeName: 'Lantus',
    sponsor: 'Sanofi',
    targetGene: 'INSR',
    targetProtein: 'Insulin receptor (INSR)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2000,
    indication:
      'Glycaemic control in adults and paediatric patients with type 1 diabetes mellitus and in adults with type 2 diabetes mellitus',
    patientFriendlyIndication: 'Once-daily background insulin for type 1 and type 2 diabetes',
    anatomicalSite: 'Subcutaneous depot, then insulin receptors on liver, muscle and fat cells',
    conditionContext: {
      conditionExplainer:
        'Insulin is the signal that tells the liver to stop making sugar and tells muscle and fat to take sugar out of the blood. In type 1 diabetes the cells that make it have been destroyed. In advanced type 2 diabetes they are still there but cannot keep up. Either way blood glucose runs high all day and all night.',
      whyItMatters:
        'Without any background insulin a person with type 1 diabetes develops diabetic ketoacidosis within a day or two, and that is fatal untreated. Over years, high glucose damages the small vessels of the retina, the kidney and the peripheral nerves, and roughly doubles cardiovascular risk.',
      whoTakesThis:
        'Everyone with type 1 diabetes needs a basal insulin. In type 2 diabetes it is started when oral agents and injectable non-insulin drugs no longer reach the target. Insulin has been in clinical use since 1922.',
      clinicalGoals:
        'Hold fasting and overnight glucose in range for a full 24 hours from one injection, without causing nocturnal hypoglycaemia.',
    },
    oneSentenceVerdict:
      'Swapping one amino acid and adding two arginines shifts insulin so it precipitates in the subcutaneous tissue and dissolves back slowly over about a day; in the registration trial that reached the same HbA1c as NPH insulin (6.96% versus 6.97%) while more patients got there without documented nocturnal hypoglycaemia.',
    laymanHowItWorks:
      'Ordinary insulin dissolves the moment it is injected, so it works fast and is gone in hours. Glargine is human insulin with two tiny chemical changes that make it insoluble at the pH of your body but soluble in the acidic liquid in the pen. When it hits the tissue under your skin it falls out of solution into a microscopic pile, and that pile then redissolves grain by grain over roughly a day. The insulin itself is unchanged; only the speed at which it becomes available has been re-engineered.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    pricing: {
      synthesisCostPerDose:
        'Cost-based price for a once-daily basal insulin analogue modelled at $72 per patient per year including pen and needles (JAMA Netw Open 2024); the 2018 model gave $78-$108 per year for glargine specifically',
      retailPricePerDoseOrYear:
        'US average gross manufacturer price across all insulins was $98.70 per standard unit in 2018 versus $8.81 in 32 other OECD countries; Sanofi cut the Lantus US list price by 78% effective 1 January 2024',
      markupEstimate:
        'US gross manufacturer prices were 8.1 times the average of all non-US OECD countries before the 2023-2024 list-price cuts',
      openPatentNotes:
        'Insulin was patented in 1923 and the patent sold to the University of Toronto for one dollar each. The compound patent on glargine has expired; follow-on and biosimilar glargines are now approved in the US, and interchangeable biosimilars have been designated. What sustains price is device patents, formulation patents and rebate contracting rather than the molecule.',
      synthesisComplexity: 'Moderate',
      costSource: INSULIN_COST_SOURCE,
      priceSource: INSULIN_PRICE_SOURCE,
    },
    substitutes: {
      summary:
        'Nothing replaces basal insulin in type 1 diabetes: stopping it causes ketoacidosis and death within days. In type 2 diabetes the honest alternatives are human NPH insulin at a fraction of the price, other basal analogues, and non-insulin agents. The dietary entries below act on glucose absorption and are adjuncts to a prescribed regimen, never a substitute for it.',
      conventionalRx: [
        {
          name: 'NPH insulin (isophane human insulin)',
          class: 'Intermediate-acting human insulin suspension',
          howItCompares:
            'The comparator in the Treat-to-Target trial. Reached the same HbA1c; fewer patients reached it free of documented nocturnal hypoglycaemia. In a 25,489-patient Kaiser cohort the analogue advantage did not appear at all.',
          typicalCost: 'Approximately $25 - $60 per 10 mL vial (US retail, human insulin)',
          prosAndCons:
            'Pros: cheapest basal insulin on earth, a century of use, available without prescription in some US states. Cons: cloudy suspension that must be resuspended, a pronounced peak at 4-8 hours, usually twice-daily dosing.',
        },
        {
          name: 'Insulin degludec (Tresiba)',
          class: 'Ultra-long-acting basal insulin analogue',
          howItCompares:
            'Flatter and longer than glargine, with a half-life beyond 24 hours, so day-to-day variability is lower.',
          typicalCost: 'Approximately $100 - $400 / month US list, before rebates',
          prosAndCons:
            'Pros: dosing time can move by hours without losing cover. Cons: costs more than human insulin by an order of magnitude and the hard-outcome data are the same neutral picture.',
        },
        {
          name: 'Biosimilar and follow-on insulin glargine',
          class: 'Biosimilar basal insulin analogue',
          howItCompares:
            'Same molecule, approved on analytical and clinical similarity rather than new outcome trials; some carry an interchangeability designation.',
          typicalCost: 'Approximately $60 - $150 / month US retail after the 2023-2024 list-price cuts',
          prosAndCons:
            'Pros: identical mechanism at a lower list price. Cons: US uptake has been slowed by rebate contracting, so what a patient pays does not always follow the list price down.',
        },
        {
          name: 'Metformin and SGLT2 inhibitors',
          class: 'Oral non-insulin glucose-lowering agents',
          howItCompares:
            'For type 2 diabetes only. They lower glucose without exogenous insulin and do not cause hypoglycaemia on their own, but cannot replace insulin once beta-cell function is largely gone.',
          typicalCost: '$4 - $15 / month (generic metformin); $30 - $600 / month (SGLT2 inhibitors)',
          prosAndCons:
            'Pros: no injection, no hypoglycaemia, cardiovascular and renal outcome data for SGLT2 inhibitors. Cons: useless in type 1 diabetes and insufficient in late type 2 disease.',
        },
      ],
      naturalFoods: [
        {
          name: 'Oat and barley beta-glucan',
          activeCompound: 'Mixed-linkage (1,3)(1,4)-beta-D-glucan',
          biologicalMechanism:
            'Raises the viscosity of gut contents so glucose reaches the intestinal wall more slowly, blunting the post-meal rise rather than increasing insulin.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Around 3 g daily from whole oats, oat bran or barley, eaten with meals',
          monthlyCost: '$8 - $18 / month',
        },
        {
          name: 'Viscous soluble fibre (psyllium husk)',
          activeCompound: 'Arabinoxylan gel-forming polysaccharide',
          biologicalMechanism:
            'Forms a gel that slows gastric emptying and carbohydrate absorption; also binds bile acids, which modestly lowers LDL cholesterol as a side effect.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '5 - 10 g with a full glass of water before the largest carbohydrate meal',
          monthlyCost: '$10 - $20 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Ten-minute walk after the evening meal',
          action: 'Light walking within 30 minutes of finishing dinner.',
          patientImpact:
            'Skeletal muscle takes up glucose through GLUT4 translocation that contraction triggers directly, without needing more insulin.',
          clinicalPrecaution:
            'Exercise increases insulin sensitivity for hours afterwards. If you take insulin, walking after dinner can drop overnight glucose further than expected, so this is a change to discuss before making it.',
        },
        {
          name: 'Consistent injection site rotation',
          action: 'Move the injection site systematically rather than reusing one spot.',
          patientImpact:
            'Repeated injection into one area causes lipohypertrophy, which makes absorption erratic and is one of the commonest causes of unexplained glucose swings.',
          clinicalPrecaution:
            'Absorption differs between abdomen, thigh and arm. Rotate within a region rather than between regions, or the dose response changes with the site.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'A-chain GIVEQCCTSICSLYQLENYCG | B-chain FVNQHLCGSHLVEALYLVCGERGFFYTPKTRR',
      molecularWeight: '6,063 Da',
      targetReceptorAffinity:
        'Binds the insulin receptor; the label notes glargine has approximately 6-8 times the IGF-1 receptor affinity of human insulin in vitro',
      structureSource: LANTUS_LABEL,
      laboratoryWorkflow: [
        {
          id: 'ig-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Master cell bank identity and purity release',
          description:
            'Confirm the identity, plasmid retention and absence of adventitious agents in the working cell bank of the non-pathogenic Escherichia coli K12 strain carrying the glargine precursor gene before any fermentation is started.',
          reagentsAndBuffer:
            'Restriction digest and Sanger sequencing of the plasmid insert, LB and selective agar plates, mycoplasma and bacteriophage screening panels',
        },
        {
          id: 'ig-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch fermentation and inclusion body recovery',
          description:
            'Express the proinsulin glargine precursor as insoluble inclusion bodies in E. coli, harvest by centrifugation, then solubilise, sulfitolyse and refold to form the three native disulfide bonds.',
          reagentsAndBuffer:
            'Defined glucose-mineral salts medium, IPTG or thermal induction, 8 M urea solubilisation buffer, sodium sulfite and sodium tetrathionate, glycine refold buffer at pH 10.5 with cysteine as redox pair',
          dependsOnStepId: 'ig-1',
        },
        {
          id: 'ig-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Tryptic maturation and reverse-phase capture',
          description:
            'Cleave the C-peptide with trypsin and carboxypeptidase B to release the mature two-chain molecule, then capture on preparative reverse-phase and anion-exchange columns and remove desamido and misfolded species.',
          reagentsAndBuffer:
            'Porcine trypsin and carboxypeptidase B in Tris buffer at pH 9.0, C18 silica with acetonitrile gradient, Q-Sepharose in 20 mM Tris with sodium chloride gradient',
          dependsOnStepId: 'ig-2',
        },
        {
          id: 'ig-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Crystallisation and acidic formulation',
          description:
            'Crystallise as the zinc complex, then redissolve into the acidic formulation buffer in which glargine stays fully in solution until it is injected.',
          reagentsAndBuffer:
            'Zinc chloride, citrate crystallisation buffer, final formulation at pH 4 with glycerol 85%, m-cresol and 30 mcg/mL zinc',
          dependsOnStepId: 'ig-3',
        },
        {
          id: 'ig-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Insulin receptor autophosphorylation potency bioassay',
          description:
            'Quantify potency against the international insulin reference standard by measuring insulin receptor beta-subunit autophosphorylation in a receptor-overexpressing cell line, alongside RP-HPLC assay and related-substances testing.',
          reagentsAndBuffer:
            'CHO cells stably expressing human insulin receptor isoform B, phospho-tyrosine ELISA kit, serum-free stimulation buffer, USP insulin reference standard',
          dependsOnStepId: 'ig-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ig-a1',
        category: 'measured',
        title: 'Treat-to-Target: same HbA1c as NPH, fewer patients reaching it with nocturnal hypoglycaemia',
        laymanSummary:
          'In 756 people with type 2 diabetes, glargine and NPH insulin brought average blood sugar to the same place. The difference was in how many got there without night-time lows.',
        technicalDetails:
          'Randomised, open-label, 24-week trial. 756 overweight adults on one or two oral agents added bedtime glargine or NPH titrated to a fasting plasma glucose target of 100 mg/dL. End-point HbA1c was 6.96% with glargine and 6.97% with NPH; mean fasting plasma glucose 117 versus 120 mg/dL. 33.2% versus 26.7% reached HbA1c 7% or less without documented nocturnal hypoglycaemia (p < 0.05), and rates of other symptomatic hypoglycaemia categories were 21-48% lower with glargine.',
        evidenceSource: 'Riddle MC, Rosenstock J, Gerich J. Diabetes Care 2003;26:3080-3086',
        doi: '10.2337/diacare.26.11.3080',
        measuredMetric: 'HbA1c 6.96% versus 6.97%; 33.2% versus 26.7% reaching target free of documented nocturnal hypoglycaemia',
        auditFlag: 'verified',
      },
      {
        id: 'ig-a2',
        category: 'failed',
        title: 'ORIGIN: normalising fasting glucose with basal insulin did not reduce cardiovascular events',
        laymanSummary:
          'The largest trial ever run on this drug asked whether driving fasting sugar to normal with insulin would prevent heart attacks and strokes. Over more than six years, it did not.',
        technicalDetails:
          'ORIGIN randomised 12,537 people with cardiovascular risk factors plus impaired fasting glucose, impaired glucose tolerance or type 2 diabetes to glargine targeting fasting glucose 95 mg/dL or less, versus standard care. Median follow-up 6.2 years. First coprimary outcome (nonfatal MI, nonfatal stroke or cardiovascular death) 2.94 versus 2.85 events per 100 person-years, hazard ratio 1.02 (95% CI 0.94-1.11), p = 0.63. Second coprimary outcome hazard ratio 1.04, p = 0.27. Severe hypoglycaemia 1.00 versus 0.31 per 100 person-years. Median weight rose 1.6 kg on glargine and fell 0.5 kg on standard care.',
        evidenceSource: 'ORIGIN Trial Investigators. N Engl J Med 2012;367:319-328',
        doi: '10.1056/NEJMoa1203858',
        measuredMetric: 'Hazard ratio 1.02 (95% CI 0.94-1.11), p = 0.63 for the first coprimary cardiovascular outcome',
        auditFlag: 'verified',
      },
      {
        id: 'ig-a3',
        category: 'conclusion_shift',
        title: 'The 2009 cancer scare was raised by observational data and retired by a randomised trial',
        laymanSummary:
          'A large German insurance database suggested in 2009 that glargine might raise cancer risk. Three years later a randomised trial with over 12,000 people and six years of follow-up found no difference at all.',
        technicalDetails:
          'Hemkens and colleagues analysed 127,031 patients in a German statutory insurance fund and reported a dose-adjusted hazard ratio for malignancy of 1.31 (95% CI 1.20-1.42) at a 50 IU daily dose of glargine versus human insulin, with no signal for aspart or lispro. Mean follow-up was only 1.63 years and dose was strongly confounded by indication. ORIGIN then reported cancer hazard ratio 1.00 (95% CI 0.88-1.13, p = 0.97) after a median 6.2 years of randomised exposure. The field moved from a mitogenicity concern to a resolved question, and the mechanism proposed for it — glargine IGF-1 receptor affinity — did not translate into events.',
        evidenceSource:
          'Hemkens LG et al. Diabetologia 2009;52:1732-1744, superseded by ORIGIN, N Engl J Med 2012;367:319-328',
        doi: '10.1007/s00125-009-1418-4',
        inferredClaim:
          'That in vitro IGF-1 receptor affinity plus a database association demonstrates a real cancer risk in patients',
        auditFlag: 'contested',
      },
      {
        id: 'ig-a4',
        category: 'inferred',
        title: 'The trial hypoglycaemia advantage did not reproduce in ordinary practice',
        laymanSummary:
          'In a Kaiser Permanente cohort of 25,489 people starting basal insulin, the analogue that costs several times more did not send fewer people to the emergency department for low blood sugar, and did not control blood sugar better.',
        technicalDetails:
          'Retrospective cohort, Kaiser Permanente Northern California, 2006-2015. 1,928 patients initiated a basal analogue and 23,561 initiated NPH. Hypoglycaemia-related emergency department visits or hospital admissions were 11.9 per 1,000 person-years with analogues versus 8.8 with NPH; between-group difference 3.1 (95% CI -1.5 to 7.7), p = 0.07. In 4,428 propensity-matched patients the adjusted hazard ratio was 1.16 (95% CI 0.71-1.78). HbA1c fell from 9.4% to 8.2% on analogues and from 9.4% to 7.9% on NPH.',
        evidenceSource: 'Lipska KJ et al. JAMA 2018;320:53-62',
        doi: '10.1001/jama.2018.7993',
        inferredClaim:
          'That the reduction in documented nocturnal hypoglycaemia seen in a titrated 24-week trial translates into fewer severe hypoglycaemic events in usual care',
        auditFlag: 'caution',
      },
      {
        id: 'ig-a5',
        category: 'inferred',
        title: 'Nothing in the manufacturing explains the price',
        laymanSummary:
          'Two independent published models put the sustainable cost-based price of a year of basal insulin analogue at under a hundred dollars. The US paid many multiples of that until list prices were cut in 2023 and 2024.',
        technicalDetails:
          'Gotham, Barber and Hill modelled active ingredient cost, formulation and operating expense plus a profit margin and estimated biosimilar prices of $78-$108 per patient per year for insulin glargine and $48-$71 for regular human insulin. Barber and colleagues updated the model in 2024 and put a once-daily basal analogue regimen at $72 per patient per year including pen and needles. RAND, for HHS ASPE, found US average gross manufacturer prices of $98.70 per standard unit in 2018 against $8.81 across 32 other OECD countries, 8.1 times the non-US average. Sanofi cut the Lantus US list price 78% effective 1 January 2024.',
        evidenceSource:
          'Gotham D et al. BMJ Glob Health 2018;3:e000850; Barber MJ et al. JAMA Netw Open 2024;7:e243474; Mulcahy AW, Schwam D. RAND for HHS ASPE, 2020',
        doi: '10.1001/jamanetworkopen.2024.3474',
        inferredClaim:
          'That the price of an insulin analogue reflects what it costs to manufacture, or the difficulty of making it',
        auditFlag: 'caution',
      },
      {
        id: 'ig-a6',
        category: 'measured',
        title: 'Progression from pre-diabetes to diabetes was reduced, at p = 0.05',
        laymanSummary:
          'Among the minority of ORIGIN participants who did not have diabetes at the start, fewer developed it. The result sat exactly on the conventional significance threshold and was measured three months after treatment stopped.',
        technicalDetails:
          'In the 1,456 ORIGIN participants without diabetes at baseline, new diabetes was diagnosed approximately three months after therapy was stopped in 30% of the glargine group versus 35% of the standard-care group; odds ratio 0.80 (95% CI 0.64-1.00), p = 0.05. This was a secondary outcome in a trial whose coprimary outcomes were both neutral, and the confidence interval touches unity.',
        evidenceSource: 'ORIGIN Trial Investigators. N Engl J Med 2012;367:319-328',
        doi: '10.1056/NEJMoa1203858',
        measuredMetric: '30% versus 35% new diabetes; odds ratio 0.80 (95% CI 0.64-1.00), p = 0.05',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as a clear acidic solution',
        laymanDesc:
          'The pen holds a clear liquid, not the cloudy suspension older long-acting insulins used. It is acidic, which is the only reason the insulin stays dissolved in the cartridge.',
        molecularDetail:
          'Formulated at pH 4. The two added B-chain arginines raise the isoelectric point of the molecule from about 5.4 to close to physiological pH, so it is fully soluble in the acidic vehicle and metastable at pH 7.4.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Precipitates into a microscopic depot under the skin',
        laymanDesc:
          'The moment it meets the neutral fluid of your tissue, it stops being soluble and settles into a tiny amorphous pile that then dissolves back very slowly.',
        molecularDetail:
          'Neutralisation in subcutaneous tissue drives the molecule through its isoelectric point, forming amorphous microprecipitates. Redissolution from the precipitate is the rate-limiting step for absorption, producing a relatively peakless profile over roughly 24 hours.',
        iconName: 'Layers',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Enters the circulation as glargine and two active metabolites',
        laymanDesc:
          'Enzymes in the tissue trim the two extra building blocks off the end, and what actually circulates is mostly a shortened form that behaves like ordinary human insulin.',
        molecularDetail:
          'Carboxypeptidase-mediated cleavage of the two B-chain arginines generates the M1 (21A-Gly-insulin) and M2 metabolites. M1 accounts for the majority of measurable exposure and has human-insulin-like receptor binding, which is the pharmacological reason the in vitro IGF-1 receptor affinity of the parent molecule did not produce a clinical mitogenic signal.',
        iconName: 'Scissors',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Binds the insulin receptor on liver, muscle and fat',
        laymanDesc:
          'It docks onto the same receptor that your own insulin uses, on the surface of liver, muscle and fat cells.',
        molecularDetail:
          'Binding to the alpha subunits of the insulin receptor triggers trans-autophosphorylation of the beta-subunit tyrosine kinase domains, recruiting IRS-1 and IRS-2 and activating PI3K and Akt.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Shuts down liver glucose output and opens muscle glucose uptake',
        laymanDesc:
          'Two things happen at once: the liver stops pouring stored sugar into the blood, and muscle and fat start taking sugar out of it.',
        molecularDetail:
          'Akt phosphorylates FOXO1 and suppresses transcription of PEPCK and glucose-6-phosphatase, cutting hepatic gluconeogenesis. In muscle and adipose tissue AS160 phosphorylation releases GLUT4-containing vesicles to the plasma membrane. Lipolysis and ketogenesis are simultaneously suppressed.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Fasting and overnight glucose held flat for about a day',
        laymanDesc:
          'The practical result is a stable overnight and between-meal blood sugar from one injection, which is what a background insulin is for.',
        molecularDetail:
          'Steady-state basal insulinaemia suppresses overnight hepatic glucose production. The trade-off measured in ORIGIN is roughly a threefold increase in severe hypoglycaemia and about 2 kg of weight relative to standard care.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'ORIGIN (NCT00069784)',
        phase: 'Phase 3',
        sampleSize: 12537,
        primaryEndpoint:
          'Composite of nonfatal myocardial infarction, nonfatal stroke or death from cardiovascular causes',
        endpointMet: false,
        statisticalPValue: 'p = 0.63 (hazard ratio 1.02, 95% CI 0.94-1.11)',
        unreportedAdverseSignals:
          'Severe hypoglycaemia 1.00 versus 0.31 per 100 person-years and a 2.1 kg median weight divergence are reported in the paper but rarely quoted alongside the neutral headline.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'Treat-to-Target (Riddle 2003; predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 756,
        primaryEndpoint:
          'Proportion reaching HbA1c 7% or less without documented nocturnal hypoglycaemia at 24 weeks',
        endpointMet: true,
        statisticalPValue: 'p < 0.05 (33.2% versus 26.7%)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Same 24-week HbA1c as NPH insulin: 6.96% versus 6.97% in 756 patients',
        'More patients reached target free of documented nocturnal hypoglycaemia: 33.2% versus 26.7%',
        'No cardiovascular benefit over 6.2 years in 12,537 people: hazard ratio 1.02, p = 0.63',
        'No excess cancer over 6.2 years of randomised exposure: hazard ratio 1.00, p = 0.97',
      ],
      unsupportedInferences: [
        'That the trial hypoglycaemia advantage carries into usual care — a 25,489-patient cohort found an adjusted hazard ratio of 1.16, not below 1',
        'That normalising fasting glucose early prevents cardiovascular events, which ORIGIN was built to test and did not show',
        'That the price reflects manufacturing difficulty; two published cost models put a sustainable annual price under $110',
      ],
      whatFailedInitially: [
        'The cardiovascular hypothesis behind ORIGIN failed on both coprimary outcomes',
        'The 2009 observational cancer signal failed to replicate under randomisation and was retired',
      ],
      realWorldOutcome: [
        'Glargine displaced NPH as the default basal insulin worldwide despite equivalent HbA1c',
        'US list prices were cut 78% in 2024 after congressional scrutiny, biosimilar entry and a $35 out-of-pocket cap',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, prefilled pen or 10 mL multiple-dose vial',
      description:
        'Clear, colourless solution at 100 units/mL, given once daily at the same time each day. Must not be diluted or mixed in a syringe with any other insulin, because doing so destroys the pH-dependent precipitation the whole design depends on.',
      safetyProfile:
        'Hypoglycaemia is the dose-limiting toxicity and can be fatal. Weight gain, injection-site reactions, lipodystrophy and hypokalaemia are the other label risks. Severe hypoglycaemia ran at 1.00 per 100 person-years in ORIGIN versus 0.31 on standard care.',
    },
    commonQuestions: [
      {
        q: 'Is glargine actually better than the cheap human insulin it replaced?',
        a: 'For average blood sugar, no: 6.96% versus 6.97% HbA1c in the head-to-head trial. For night-time lows in that trial, yes, modestly. In a 25,489-person real-world cohort the difference disappeared entirely. So the honest answer is that it is more convenient and somewhat gentler on nocturnal hypoglycaemia in a titrated trial setting, and that this is a smaller advantage than its price difference implied.',
        auditNote:
          'Riddle 2003 (doi:10.2337/diacare.26.11.3080) and Lipska 2018 (doi:10.1001/jama.2018.7993) disagree, and the disagreement is the finding.',
      },
      {
        q: 'Does taking insulin cause cancer?',
        a: 'A German database study in 2009 suggested glargine might. ORIGIN then randomised 12,537 people to glargine or standard care for a median 6.2 years and found cancer hazard ratio 1.00 (95% CI 0.88-1.13, p = 0.97). That is about as clean a negative as this kind of question gets.',
      },
      {
        q: 'Why did insulin cost so much in the United States when it is a century old?',
        a: 'Not because it is hard to make. Published cost models put a sustainable price for a year of basal analogue at $72-$108. The gap came from device and formulation patents layered on an off-patent molecule, from a rebate system that rewards high list prices, and from the absence of direct federal price negotiation for commercial insurance. List prices were cut sharply in 2023 and 2024 after that became a political issue.',
      },
      {
        q: 'Can I stop insulin if I control my diet well?',
        a: 'In type 1 diabetes, no. There is no beta-cell reserve to fall back on and stopping basal insulin leads to diabetic ketoacidosis within a day or two. In type 2 diabetes some people do come off insulin after substantial weight loss or metabolic surgery, but that is a decision made with measurements and a clinician, not a general rule.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether glargine differs from NPH insulin on any hard outcome — death, myocardial infarction, retinopathy, nephropathy — in a trial designed to answer that. ORIGIN compared glargine with standard care, not with NPH. A head-to-head hard-outcome trial of basal analogue versus human insulin has never been run.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Riddle MC, Rosenstock J, Gerich J. The Treat-to-Target Trial. Diabetes Care 2003;26:3080-3086',
        identifier: '10.2337/diacare.26.11.3080',
        kind: 'doi',
      },
      {
        label:
          'ORIGIN Trial Investigators. Basal insulin and cardiovascular and other outcomes in dysglycemia. N Engl J Med 2012;367:319-328',
        identifier: '10.1056/NEJMoa1203858',
        kind: 'doi',
      },
      { label: 'ORIGIN trial registration', identifier: 'NCT00069784', kind: 'nct' },
      {
        label:
          'Hemkens LG et al. Risk of malignancies in patients with diabetes treated with human insulin or insulin analogues. Diabetologia 2009;52:1732-1744',
        identifier: '10.1007/s00125-009-1418-4',
        kind: 'doi',
      },
      {
        label:
          'Lipska KJ et al. Association of initiation of basal insulin analogs vs NPH insulin with hypoglycemia-related emergency department visits. JAMA 2018;320:53-62',
        identifier: '10.1001/jama.2018.7993',
        kind: 'doi',
      },
      INSULIN_COST_SOURCE,
      {
        label: 'Barber MJ et al. Estimated sustainable cost-based prices for diabetes medicines. JAMA Netw Open 2024;7:e243474',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      INSULIN_PRICE_SOURCE,
      LANTUS_LABEL,
      {
        label: 'Drugs@FDA: LANTUS, BLA 021081, original approval 20 April 2000',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=021081',
        kind: 'regulatory',
      },
      {
        label:
          'Sanofi press release: Sanofi cuts U.S. list price of Lantus by 78%, 16 March 2023 (effective 1 January 2024)',
        identifier: 'https://www.sanofi.com/en/media-room/press-releases/2023/2023-03-16-20-06-43-2629188',
        kind: 'url',
      },
      {
        label: 'UniProt P01308 — human insulin, A-chain and B-chain feature annotations',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01308',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 2. Insulin lispro
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'insulin-lispro',
    name: 'Insulin lispro',
    tradeName: 'Humalog',
    sponsor: 'Eli Lilly and Company',
    targetGene: 'INSR',
    targetProtein: 'Insulin receptor (INSR)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1996,
    indication:
      'Improvement of glycaemic control in adults and paediatric patients with diabetes mellitus, as mealtime insulin',
    patientFriendlyIndication: 'Fast-acting mealtime insulin for type 1 and type 2 diabetes',
    anatomicalSite: 'Subcutaneous depot, then insulin receptors on liver, muscle and fat cells',
    conditionContext: {
      conditionExplainer:
        'Eating carbohydrate sends a bolus of glucose into the blood within 15 minutes. A working pancreas answers it within minutes. Injected human insulin cannot: it forms hexamers in the vial that must break apart before absorption, so it lags the meal by half an hour or more.',
      whyItMatters:
        'The lag has two consequences. Glucose spikes high after the meal, and then the insulin is still working two to four hours later when the food is gone, which is when hypoglycaemia happens. Mealtime analogues were designed to close that timing gap.',
      whoTakesThis:
        'Everyone on a basal-bolus regimen for type 1 diabetes, everyone using an insulin pump, and people with type 2 diabetes whose post-meal glucose is not controlled by basal insulin alone.',
      clinicalGoals:
        'Match the insulin curve to the meal curve: inject at the table rather than half an hour before, and blunt the post-meal peak without a late-afternoon crash.',
    },
    oneSentenceVerdict:
      'Swapping two adjacent amino acids at the end of the B chain stops insulin molecules from clumping into slow-dissolving hexamers, which cuts the onset from around 30 minutes to around 15; the measured glycaemic gain over ordinary human insulin is an HbA1c difference of 0.15 percentage points in type 1 diabetes and none at all in type 2.',
    laymanHowItWorks:
      'Insulin in a vial does not float around as single molecules. Six of them lock together into a stable ring, and that ring has to come apart before anything can be absorbed, which takes about half an hour. Lispro is human insulin with the last two building blocks of one chain swapped around. The swap sits exactly where the ring holds itself together, so the ring falls apart almost immediately. Nothing about how the insulin works has changed, only how fast it becomes available.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 76,
    pricing: {
      synthesisCostPerDose:
        'Cost-based price modelled at $95-$130 per patient per year for insulin lispro (BMJ Global Health 2018); the 2024 update put a full basal-bolus analogue regimen at $111 per year including devices',
      retailPricePerDoseOrYear:
        'Lilly cut the list price of its most-prescribed insulins by 70% in 2023 and set unbranded Insulin Lispro Injection 100 units/mL at $25 per vial from 1 May 2023',
      markupEstimate:
        'Even after the 2023 cut, a year of mealtime analogue at US list price is several times the published cost-based price',
      openPatentNotes:
        'The lispro compound patent expired in 2013. No true biosimilar followed for years; instead Lilly launched an unbranded version of its own product at a lower list price, which is a pricing strategy rather than competition. Admelog, an insulin lispro follow-on, was approved in 2017 through the 505(b)(2) pathway.',
      synthesisComplexity: 'Moderate',
      costSource: INSULIN_COST_SOURCE,
      priceSource: {
        label:
          'Eli Lilly press release: Lilly cuts insulin prices by 70% and caps patient insulin out-of-pocket costs at $35 per month, 1 March 2023',
        identifier:
          'https://www.prnewswire.com/news-releases/lilly-cuts-insulin-prices-by-70-and-caps-patient-insulin-out-of-pocket-costs-at-35-per-month-301758946.html',
        kind: 'url',
      },
    },
    substitutes: {
      summary:
        'Regular human insulin does the same job for a fraction of the price and, in type 2 diabetes, the pooled trial evidence shows no clear difference in HbA1c or severe hypoglycaemia. The trade is convenience and timing, not efficacy. No food replaces mealtime insulin in type 1 diabetes; the dietary entries below only change how fast a meal releases glucose.',
      conventionalRx: [
        {
          name: 'Regular human insulin',
          class: 'Short-acting human insulin',
          howItCompares:
            'The comparator in every Cochrane analysis of this class. In type 2 diabetes the mean HbA1c difference was -0.03 percentage points (95% CI -0.16 to 0.09), which is nothing. In type 1 it was -0.15 (95% CI -0.20 to -0.10).',
          typicalCost: 'Approximately $25 - $50 per 10 mL vial (US retail, human insulin)',
          prosAndCons:
            'Pros: an order of magnitude cheaper, decades of use, available over the counter in several US states. Cons: must be injected roughly 30 minutes before eating, and its tail lasts longer than the meal.',
        },
        {
          name: 'Insulin aspart (NovoLog) and insulin glulisine (Apidra)',
          class: 'Rapid-acting insulin analogues',
          howItCompares:
            'Different amino-acid modifications reaching the same pharmacokinetic goal. Clinically interchangeable with lispro in practice.',
          typicalCost: 'Approximately $30 - $130 per vial US retail after the 2023-2024 list-price cuts',
          prosAndCons:
            'Pros: same timing benefit, more than one supplier. Cons: no head-to-head evidence that any one of them beats the others on a hard outcome.',
        },
        {
          name: 'Ultra-rapid formulations (Lyumjev, Fiasp)',
          class: 'Rapid-acting analogue with absorption accelerants',
          howItCompares:
            'Lispro or aspart plus excipients such as treprostinil and citrate, or niacinamide, that speed local absorption further. Gains are measured in post-meal glucose excursion, not HbA1c.',
          typicalCost: 'Comparable to or above standard analogue list prices',
          prosAndCons:
            'Pros: closer to physiological timing, useful in pumps and closed-loop systems. Cons: more injection-site reactions, and the HbA1c difference is small.',
        },
      ],
      naturalFoods: [
        {
          name: 'Vinegar taken with a starch meal',
          activeCompound: 'Acetic acid',
          biologicalMechanism:
            'Slows gastric emptying and inhibits disaccharidase activity in the small intestine, lowering the post-meal glucose excursion without changing the insulin dose.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '1 - 2 tablespoons diluted in water, taken shortly before a starch-based meal',
          monthlyCost: '$3 - $8 / month',
        },
        {
          name: 'Cooked-and-cooled starch (resistant starch type 3)',
          activeCompound: 'Retrograded amylose',
          biologicalMechanism:
            'Retrogradation on cooling converts part of the starch into a form amylase cannot digest, so less glucose reaches the blood from the same weight of food.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'Cook then refrigerate potatoes, rice or pasta overnight before eating',
          monthlyCost: 'No additional cost',
        },
      ],
      homeRemedies: [
        {
          name: 'Protein and vegetables before the carbohydrate',
          action: 'Eat the protein and non-starchy vegetable portion of a meal before the starch.',
          patientImpact:
            'Delays gastric emptying and triggers endogenous incretin release, flattening the post-meal glucose curve for the same total meal.',
          clinicalPrecaution:
            'This changes the shape of the glucose rise, so a dose timed for the old pattern may now act too early. Any consistent change in meal order is a reason to review the mealtime dose with a clinician.',
        },
        {
          name: 'Waiting for the injection to take effect before eating',
          action: 'Check the time between injection and the first bite against what is actually happening on a glucose meter or sensor.',
          patientImpact:
            'The onset of a rapid analogue is around 15 minutes, but it varies with site, temperature and lipohypertrophy. Matching the real onset to the real meal is where most of the practical benefit of this drug class sits.',
          clinicalPrecaution:
            'Injecting too early relative to the meal is a common cause of early hypoglycaemia. Timing changes belong in a conversation with the prescriber.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3: 'A-chain GIVEQCCTSICSLYQLENYCN | B-chain FVNQHLCGSHLVEALYLVCGERGFFYTKPT',
      chemicalFormula: 'C257H383N65O77S6',
      molecularWeight: '5,808 Da',
      targetReceptorAffinity: 'Insulin receptor affinity comparable to human insulin',
      structureSource: HUMALOG_LABEL,
      laboratoryWorkflow: [
        {
          id: 'il-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Working cell bank release testing',
          description:
            'Verify plasmid sequence, copy number and freedom from adventitious agents in the E. coli working cell bank carrying the lispro precursor gene before release to fermentation.',
          reagentsAndBuffer:
            'Plasmid miniprep and Sanger sequencing, selective agar, sterility and mycoplasma panels',
        },
        {
          id: 'il-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fermentation, inclusion body solubilisation and oxidative refold',
          description:
            'Express the single-chain proinsulin lispro precursor as inclusion bodies, solubilise under denaturing conditions and refold at high dilution to set the three disulfide bonds.',
          reagentsAndBuffer:
            'Defined fermentation medium, 7 M guanidine hydrochloride or 8 M urea, sodium sulfite and tetrathionate for sulfitolysis, glycine buffer pH 10.5 with beta-mercaptoethanol as redox pair',
          dependsOnStepId: 'il-1',
        },
        {
          id: 'il-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Enzymatic maturation and multi-mode chromatography',
          description:
            'Excise the connecting peptide with trypsin and carboxypeptidase B, then purify through hydrophobic interaction, anion exchange and preparative reverse-phase steps to remove desamido, dimer and truncated species.',
          reagentsAndBuffer:
            'Trypsin and carboxypeptidase B in Tris pH 9.0, phenyl-Sepharose, Q-Sepharose, C18 with acetonitrile and 0.1% TFA gradient',
          dependsOnStepId: 'il-2',
        },
        {
          id: 'il-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Zinc crystallisation and neutral-pH formulation',
          description:
            'Crystallise the purified analogue as a zinc complex, then formulate at pH 7.0-7.8. Zinc content is deliberately kept low relative to human insulin so hexamer dissociation stays fast.',
          reagentsAndBuffer:
            'Zinc oxide to 0.0197 mg zinc ion per mL, dibasic sodium phosphate, glycerin, metacresol, trace phenol',
          dependsOnStepId: 'il-3',
        },
        {
          id: 'il-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Potency bioassay and hexamer dissociation characterisation',
          description:
            'Assay receptor-mediated potency against the USP insulin reference standard and characterise self-association state by analytical ultracentrifugation or size-exclusion chromatography, which is what distinguishes this molecule from human insulin.',
          reagentsAndBuffer:
            'Insulin receptor autophosphorylation ELISA, USP insulin reference standard, SEC in phosphate buffer with and without zinc and phenolic ligand',
          dependsOnStepId: 'il-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'il-a1',
        category: 'measured',
        title: 'Cochrane, type 1 diabetes: HbA1c 0.15 percentage points lower than human insulin',
        laymanSummary:
          'Nine trials and 2,693 people. The blood sugar advantage over ordinary human insulin was real but small, and the evidence for fewer severe lows was very weak.',
        technicalDetails:
          'Cochrane systematic review of randomised trials of at least 24 weeks in adults with type 1 diabetes. Mean HbA1c difference -0.15% (95% CI -0.20 to -0.10, low-quality evidence) favouring analogues. Severe hypoglycaemia odds ratio 0.89 (95% CI 0.71-1.12, p = 0.31, very low-quality evidence). No trial was blinded, and none was designed to measure mortality or diabetic complications.',
        evidenceSource: 'Fullerton B et al. Cochrane Database Syst Rev 2016;(6):CD012161',
        doi: '10.1002/14651858.CD012161',
        measuredMetric: 'HbA1c mean difference -0.15% (95% CI -0.20 to -0.10) across 2,608 participants',
        auditFlag: 'verified',
      },
      {
        id: 'il-a2',
        category: 'inferred',
        title: 'In type 2 diabetes the HbA1c difference is zero',
        laymanSummary:
          'Ten trials, 2,751 people. The average difference in blood sugar control between the expensive analogue and ordinary human insulin was -0.03 percentage points, which is indistinguishable from nothing.',
        technicalDetails:
          'Cochrane systematic review, adult non-pregnant patients with type 2 diabetes, interventions of at least 24 weeks. Mean HbA1c difference -0.03% (95% CI -0.16 to 0.09, p = 0.60; prediction interval -0.31% to 0.25%; low-certainty evidence). Severe hypoglycaemia was reported too heterogeneously to pool and showed no clear difference. Non-severe hypoglycaemic episodes per participant per month were 0.08 higher with analogues (95% CI 0.00 to 0.16, very low certainty). The review authors concluded there were no clear benefits.',
        evidenceSource: 'Fullerton B et al. Cochrane Database Syst Rev 2018;(12):CD013228',
        doi: '10.1002/14651858.CD013228',
        inferredClaim:
          'That a faster pharmacokinetic profile delivers better glycaemic control in type 2 diabetes',
        auditFlag: 'caution',
      },
      {
        id: 'il-a3',
        category: 'inferred',
        title: 'No trial in this class was designed to measure a hard outcome',
        laymanSummary:
          'Across nineteen randomised trials in both Cochrane reviews, not one was built to find out whether these insulins change death rates, eye disease, kidney disease or nerve damage.',
        technicalDetails:
          'Both Cochrane reviews state explicitly that no included trial was designed to investigate long-term effects such as all-cause mortality or microvascular and macrovascular complications, and that none reported socioeconomic outcomes. In the type 2 review, six trials reported deaths at all: 5 of 1,272 on analogues and 3 of 1,247 on human insulin, Peto odds ratio 1.66 (95% CI 0.41-6.64, p = 0.48). Health-related quality of life was assessed in two trials and judged unreliable.',
        evidenceSource:
          'Fullerton B et al. Cochrane Database Syst Rev 2016;(6):CD012161 and 2018;(12):CD013228',
        doi: '10.1002/14651858.CD013228',
        inferredClaim:
          'That better post-meal glucose curves translate into fewer diabetic complications or longer life',
        auditFlag: 'caution',
      },
      {
        id: 'il-a4',
        category: 'measured',
        title: 'The molecular claim is exact and checkable',
        laymanSummary:
          'The label states the chemistry precisely: proline and lysine at positions 28 and 29 of the B chain are swapped. The formula and the weight are identical to human insulin.',
        technicalDetails:
          'Insulin lispro is Lys(B28), Pro(B29) human insulin analogue, empirical formula C257H383N65O77S6, molecular weight 5.808 kDa, both identical to human insulin. The inversion disrupts the B-chain C-terminal beta-sheet contacts that stabilise the dimer interface, so hexamers dissociate to monomers rapidly after subcutaneous injection. This is one of the few therapeutic proteins where the entire mechanism of improvement is a self-association property rather than a receptor property.',
        evidenceSource: 'HUMALOG US prescribing information, Description section',
        measuredMetric: 'C257H383N65O77S6, 5,808 Da; two-residue inversion at B28-B29',
        auditFlag: 'verified',
      },
      {
        id: 'il-a5',
        category: 'inferred',
        title: 'Price rose for a molecule whose patent expired in 2013',
        laymanSummary:
          'Published cost models put a year of mealtime analogue at around a hundred dollars to make. US list prices ran far above that for a decade after the patent expired, and only came down when the issue became political.',
        technicalDetails:
          'The 2018 model estimated a biosimilar price of $95-$130 per patient per year for insulin lispro. The 2024 update put a full basal-bolus analogue regimen at $111 per patient per year including reusable pen and needles. Lilly announced a 70% list-price cut in March 2023 and set unbranded Insulin Lispro Injection at $25 per vial from 1 May 2023, describing that price as lower than a Humalog vial cost in 1999. No competitor entered with a biosimilar in the decade after patent expiry; the price fell when the manufacturer chose to compete with itself.',
        evidenceSource:
          'Gotham D et al. BMJ Glob Health 2018;3:e000850; Barber MJ et al. JAMA Netw Open 2024;7:e243474; Eli Lilly press release, 1 March 2023',
        doi: '10.1136/bmjgh-2018-000850',
        inferredClaim:
          'That patent expiry on a biologic produces price competition the way it does for a small molecule',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected as a hexamer that is already unstable',
        laymanDesc:
          'Like all insulins in a vial, it is stored as rings of six molecules. Unlike human insulin, those rings are built to fall apart quickly.',
        molecularDetail:
          'Formulated with zinc and a phenolic ligand as the R6 hexamer for shelf stability. The B28-B29 inversion removes the ProB28 contact that anchors the antiparallel beta-sheet at the monomer-monomer interface, so the dimerisation constant drops by roughly 300-fold.',
        iconName: 'Blocks',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Dissociates to monomers in the subcutaneous tissue',
        laymanDesc:
          'Once injected and diluted, the rings break into single molecules almost immediately instead of over half an hour.',
        molecularDetail:
          'Dilution below the hexamer dissociation constant, plus loss of zinc and phenolic ligand into the interstitium, drives rapid conversion to dimers and monomers. Only monomers and dimers cross the capillary endothelium efficiently.',
        iconName: 'Split',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Absorbed into the circulation within about 15 minutes',
        laymanDesc:
          'It reaches the bloodstream fast enough that you can inject at the table rather than half an hour before eating.',
        molecularDetail:
          'Capillary uptake of the monomeric form gives an onset around 15 minutes, a peak at 30-90 minutes and a duration of 3-5 hours, against roughly 30 minutes, 2-4 hours and 6-8 hours for regular human insulin.',
        iconName: 'Timer',
        visualStage: 'cellular_entry',
      },
      {
        step: 4,
        title: 'Binds the insulin receptor',
        laymanDesc:
          'From here it is ordinary insulin. It docks on the same receptor and gives the same instruction.',
        molecularDetail:
          'The B28-B29 inversion sits at the self-association surface, not the receptor-binding surface, so receptor affinity and downstream signalling are essentially unchanged from human insulin.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 5,
        title: 'Drives glucose out of the blood into muscle and fat',
        laymanDesc:
          'Muscle and fat cells open their glucose doors, and the liver stops adding more sugar to the blood.',
        molecularDetail:
          'IRS-PI3K-Akt signalling triggers AS160 phosphorylation and GLUT4 vesicle translocation in muscle and adipocytes, while suppressing hepatic gluconeogenic transcription.',
        iconName: 'Gauge',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'A lower post-meal peak, and a shorter tail',
        laymanDesc:
          'The measurable result is a smaller blood sugar spike after eating and less insulin still circulating hours later.',
        molecularDetail:
          'Reduced postprandial excursion and a shorter duration of action. In type 1 diabetes this converts to an HbA1c difference of 0.15 percentage points; in type 2 diabetes the pooled difference is -0.03 percentage points.',
        iconName: 'TrendingDown',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Cochrane CD012161 (type 1 diabetes, 9 pooled randomised trials)',
        phase: 'Systematic review of Phase 3 trials',
        sampleSize: 2693,
        primaryEndpoint: 'Change in HbA1c versus regular human insulin',
        endpointMet: true,
        statisticalPValue: 'p < 0.00001 (mean difference -0.15%, 95% CI -0.20 to -0.10)',
        unreportedAdverseSignals:
          'Every included trial was unblinded, so hypoglycaemia — a subjective, participant-reported outcome — carried a high risk of detection bias in all of them.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Cochrane CD013228 (type 2 diabetes, 10 pooled randomised trials)',
        phase: 'Systematic review of Phase 3 trials',
        sampleSize: 2751,
        primaryEndpoint: 'Change in HbA1c versus regular human insulin',
        endpointMet: false,
        statisticalPValue: 'p = 0.60 (mean difference -0.03%, 95% CI -0.16 to 0.09)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Type 1 diabetes: HbA1c 0.15 percentage points lower than regular human insulin across 2,608 participants',
        'Type 2 diabetes: HbA1c difference -0.03 percentage points, confidence interval crossing zero',
        'Onset around 15 minutes versus around 30 minutes for regular human insulin',
        'Identical empirical formula and molecular weight to human insulin: C257H383N65O77S6, 5,808 Da',
      ],
      unsupportedInferences: [
        'That rapid analogues reduce severe hypoglycaemia — the pooled odds ratio in type 1 diabetes was 0.89 with a confidence interval crossing 1',
        'That better post-meal curves reduce retinopathy, nephropathy, neuropathy or death — no trial in either review was designed to look',
        'That the price difference over human insulin reflects a proportionate clinical difference',
      ],
      whatFailedInitially: [
        'No biosimilar entered the US market in the decade after the compound patent expired in 2013',
        'Attempts to demonstrate a quality-of-life advantage produced results the Cochrane reviewers judged unreliable',
      ],
      realWorldOutcome: [
        'Rapid analogues became the default mealtime insulin worldwide and are the only insulins used in modern closed-loop pump systems',
        'Unbranded insulin lispro was listed at $25 per vial from May 2023 after a 70% list-price cut',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection by pen, vial or continuous subcutaneous infusion pump',
      description:
        'Clear, colourless solution at 100 or 200 units/mL, injected within about 15 minutes before or immediately after a meal. It is also the standard reservoir insulin for insulin pumps and hybrid closed-loop systems, where its fast off-rate is what makes automated correction possible.',
      safetyProfile:
        'Hypoglycaemia is the dose-limiting toxicity. Hypokalaemia, injection-site reactions, lipodystrophy and hypersensitivity are the other labelled risks. In pump use, any interruption of delivery causes ketosis within hours because there is no basal depot to fall back on.',
    },
    commonQuestions: [
      {
        q: 'Is a rapid analogue worth the extra cost over regular human insulin?',
        a: 'In type 1 diabetes there is a small real glycaemic gain — 0.15 HbA1c points — plus a genuine convenience difference: you inject at the table rather than half an hour before. In type 2 diabetes the pooled HbA1c difference is -0.03 points, which is nothing. Whether that is worth the price difference depends entirely on which of those two situations you are in.',
        auditNote:
          'The two Cochrane reviews (doi:10.1002/14651858.CD012161 and doi:10.1002/14651858.CD013228) are the source for both numbers.',
      },
      {
        q: 'Does insulin lispro reduce severe low blood sugar?',
        a: 'The pooled randomised evidence does not show that. Severe hypoglycaemia odds ratio was 0.89 (95% CI 0.71-1.12) in type 1 diabetes, graded very low quality because none of the trials were blinded. A separate meta-analysis using different inclusion criteria did report a reduction. The honest reading is that the question is unsettled.',
      },
      {
        q: 'Why is it identical in weight to human insulin if it is a different drug?',
        a: 'Because nothing was added or removed. Two adjacent amino acids swapped places. Same atoms, same formula, same mass, different three-dimensional packing behaviour. It is a good illustration of how much of protein pharmacology is geometry rather than composition.',
      },
      {
        q: 'Can insulin be taken as a tablet instead?',
        a: 'Not yet for insulin itself. Insulin is a protein and is digested in the stomach, and decades of oral insulin programmes have failed to achieve reliable bioavailability. Inhaled insulin reached the market twice; the first product was withdrawn commercially in 2007.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether any rapid-acting analogue changes the things patients actually care about over a lifetime — sight, kidney function, feeling in the feet, death. Both Cochrane reviews say plainly that no included trial was designed to look at long-term patient-relevant outcomes. Thirty years after approval, that is still true.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Fullerton B et al. Short-acting insulin analogues versus regular human insulin for adults with type 1 diabetes mellitus. Cochrane Database Syst Rev 2016;(6):CD012161',
        identifier: '10.1002/14651858.CD012161',
        kind: 'doi',
      },
      {
        label:
          'Fullerton B et al. Short-acting insulin analogues versus regular human insulin for adult, non-pregnant persons with type 2 diabetes mellitus. Cochrane Database Syst Rev 2018;(12):CD013228',
        identifier: '10.1002/14651858.CD013228',
        kind: 'doi',
      },
      INSULIN_COST_SOURCE,
      {
        label:
          'Barber MJ et al. Estimated sustainable cost-based prices for diabetes medicines. JAMA Netw Open 2024;7:e243474',
        identifier: '10.1001/jamanetworkopen.2024.3474',
        kind: 'doi',
      },
      HUMALOG_LABEL,
      {
        label: 'Drugs@FDA: HUMALOG, BLA 020563, original approval 14 June 1996',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=020563',
        kind: 'regulatory',
      },
      {
        label:
          'Eli Lilly press release: Lilly cuts insulin prices by 70% and caps patient insulin out-of-pocket costs at $35 per month, 1 March 2023',
        identifier:
          'https://www.prnewswire.com/news-releases/lilly-cuts-insulin-prices-by-70-and-caps-patient-insulin-out-of-pocket-costs-at-35-per-month-301758946.html',
        kind: 'url',
      },
      {
        label: 'UniProt P01308 — human insulin, A-chain and B-chain feature annotations',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01308',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 3. Epoetin alfa
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'epoetin-alfa',
    name: 'Epoetin alfa',
    tradeName: 'Epogen / Procrit',
    sponsor: 'Amgen (Epogen); Janssen, under licence, as Procrit',
    targetGene: 'EPOR',
    targetProtein: 'Erythropoietin receptor (EPOR)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1989,
    indication:
      'Anaemia due to chronic kidney disease, anaemia due to zidovudine in HIV infection, anaemia due to myelosuppressive chemotherapy, and reduction of allogeneic red cell transfusion in elective non-cardiac, non-vascular surgery',
    patientFriendlyIndication: 'Low red blood cell count caused by kidney failure, HIV treatment or chemotherapy',
    anatomicalSite: 'Erythroid progenitor cells in the bone marrow',
    conditionContext: {
      conditionExplainer:
        'Healthy kidneys sense oxygen in the blood and, when it falls, release erythropoietin to tell the bone marrow to make more red cells. Failing kidneys stop making that signal. The marrow is intact and the iron may be there, but the order never arrives, so the patient becomes profoundly anaemic.',
      whyItMatters:
        'Before 1989 dialysis patients lived on repeated transfusions, with iron overload, immune sensitisation that made transplantation harder, and hepatitis exposure. Restoring the hormone made all of that avoidable. What was not obvious was how much of it to restore.',
      whoTakesThis:
        'Adults and children on dialysis or with pre-dialysis chronic kidney disease, patients on myelosuppressive chemotherapy for non-curative cancer, patients on zidovudine, and some patients before major elective surgery.',
      clinicalGoals:
        'Use the lowest dose that avoids red cell transfusion. That goal is written the way it is because the alternative goal — normalising haemoglobin — was tested and caused harm.',
    },
    oneSentenceVerdict:
      'A recombinant copy of the kidney hormone that orders red cell production; it reliably ends transfusion dependence in dialysis patients, and four large randomised trials then showed that pushing haemoglobin toward normal with it increases death, stroke and heart failure rather than reducing them.',
    laymanHowItWorks:
      'Your kidneys are the oxygen sensor for your blood. When oxygen runs low they release a hormone that tells the bone marrow to build more red cells. In kidney failure that hormone stops being made, so the marrow sits idle. Epoetin alfa is a manufactured copy of that hormone, made in mammalian cells so it carries the right sugar chains to survive in the blood. It does not add red cells; it restarts the order to make them.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 72,
    substitutes: {
      summary:
        'Iron — oral or intravenous — is the first thing to fix, because an erythropoiesis-stimulating agent cannot build red cells out of nothing and iron deficiency is the commonest reason one appears not to work. Red cell transfusion remains the alternative and is what these drugs displaced. Oral HIF prolyl hydroxylase inhibitors are the newer class. No food raises haemoglobin in a person whose kidneys have stopped producing erythropoietin.',
      conventionalRx: [
        {
          name: 'Intravenous iron (ferric carboxymaltose, iron sucrose)',
          class: 'Parenteral iron replacement',
          howItCompares:
            'Corrects the substrate rather than the signal. Many patients labelled ESA-hyporesponsive are simply iron-deficient, and in dialysis populations iron alone raises haemoglobin and lowers the ESA dose needed.',
          typicalCost: 'Approximately $200 - $1,000 per course (US, varies widely by product and site of care)',
          prosAndCons:
            'Pros: cheap relative to an ESA, no thrombotic or tumour-progression signal. Cons: infusion reactions, and it does nothing if the erythropoietin signal itself is absent.',
        },
        {
          name: 'Red blood cell transfusion',
          class: 'Blood component therapy',
          howItCompares:
            'The therapy epoetin was introduced to replace. Immediate and certain, but carries iron overload, HLA sensitisation that harms later transplant chances, and transfusion reactions.',
          typicalCost: 'Approximately $500 - $1,200 per unit including administration (US)',
          prosAndCons:
            'Pros: instant correction, no dependence on marrow response. Cons: sensitisation, volume load, iron accumulation, and finite blood supply.',
        },
        {
          name: 'HIF prolyl hydroxylase inhibitors (daprodustat, roxadustat)',
          class: 'Oral hypoxia-inducible factor stabilisers',
          howItCompares:
            'Raise endogenous erythropoietin by mimicking the cellular response to low oxygen, rather than supplying the hormone. Oral rather than injected.',
          typicalCost: 'Approximately $300 - $700 / month US list where marketed',
          prosAndCons:
            'Pros: oral dosing, mobilises iron as well as driving erythropoiesis. Cons: the cardiovascular safety questions that dominate the ESA story apply to this class too and are still being worked out.',
        },
      ],
      naturalFoods: [
        {
          name: 'Dietary iron with vitamin C',
          activeCompound: 'Haem and non-haem iron; ascorbate as a reducing agent',
          biologicalMechanism:
            'Ascorbate reduces ferric to ferrous iron at the duodenal brush border, raising non-haem iron absorption. Relevant only where iron, not erythropoietin, is the limiting factor.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Iron-containing foods eaten with a source of vitamin C, away from tea, coffee and calcium',
          monthlyCost: 'No additional cost',
        },
      ],
      homeRemedies: [
        {
          name: 'Separating iron from binders and calcium',
          action: 'Do not take oral iron at the same time as phosphate binders, calcium or tea.',
          patientImpact:
            'Phosphate binders and polyphenols chelate iron in the gut lumen and can abolish absorption of an oral dose entirely, which is a common and silent cause of apparent treatment failure.',
          clinicalPrecaution:
            'Timing of binders is part of a dialysis prescription. Change it with the renal team, not alone.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'APPRLICDSRVLERYLLEAKEAENITTGCAEHCSLNENITVPDTKVNFYAWKRMEVGQQAVEVWQGLALLSEAVLRGQALLVNSSQPWEPLQLHVDKAVSGLRSLTTLLRALGAQKEAISPPDAASAAPLRTITADTFRKLFRVYSNFLRGKLKLYTGEACRTGD',
      molecularWeight: 'Approximately 30,400 Da (165-residue backbone plus three N-linked and one O-linked glycan)',
      targetReceptorAffinity: 'Binds the homodimeric erythropoietin receptor with two asymmetric sites',
      structureSource: {
        label: 'UniProt P01588 (erythropoietin, mature chain) cross-checked against the EPOGEN label description',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01588',
        kind: 'url',
      },
      laboratoryWorkflow: [
        {
          id: 'ea-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'CHO master cell bank characterisation',
          description:
            'Release the Chinese hamster ovary working cell bank carrying the human EPO gene: identity, copy number, viral safety and glycosylation-profile consistency. Glycan structure is the product here, not an incidental feature, so it is fixed at the cell-line level.',
          reagentsAndBuffer:
            'qPCR gene copy assay, in vitro and in vivo adventitious agent panels, isoelectric focusing of pilot-scale material',
        },
        {
          id: 'ea-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch mammalian cell culture',
          description:
            'Express secreted glycosylated erythropoietin in CHO cells in a controlled bioreactor, holding dissolved oxygen, pH and osmolality tight because each of them shifts the sialic acid content and therefore the half-life of the product.',
          reagentsAndBuffer:
            'Chemically defined serum-free medium, glucose and glutamine feeds, 37 degrees C at pH 7.0-7.2, harvest by depth filtration',
          dependsOnStepId: 'ea-1',
        },
        {
          id: 'ea-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Multi-step chromatographic capture and isoform selection',
          description:
            'Capture from clarified harvest and then deliberately select the highly sialylated isoform fraction, which is what determines circulating half-life. Include dedicated viral inactivation and nanofiltration steps.',
          reagentsAndBuffer:
            'Blue-Sepharose dye affinity, hydroxyapatite, Q-Sepharose anion exchange with a shallow salt gradient, low-pH hold, 20 nm virus filter',
          dependsOnStepId: 'ea-2',
        },
        {
          id: 'ea-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Formulation and aggregate control',
          description:
            'Formulate into citrate-buffered isotonic solution with human albumin or polysorbate. Aggregate control is a safety step, not a cosmetic one: subvisible protein aggregates are the leading suspect in antibody-mediated pure red cell aplasia.',
          reagentsAndBuffer:
            'Sodium citrate and citric acid at pH 6.9, sodium chloride, human albumin, sterile filtration with size-exclusion and subvisible particle release testing',
          dependsOnStepId: 'ea-3',
        },
        {
          id: 'ea-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'In vivo potency bioassay and glycan mapping',
          description:
            'Determine potency in International Units against the WHO reference standard using the normocythaemic mouse bioassay, and map N-glycans by HILIC-UPLC to confirm sialylation matches the reference product.',
          reagentsAndBuffer:
            'WHO International Standard for erythropoietin, normocythaemic mouse reticulocyte assay, PNGase F digestion with 2-AB labelling and HILIC-UPLC',
          dependsOnStepId: 'ea-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ea-a1',
        category: 'measured',
        title: '1987: 12 of 12 transfusion-dependent dialysis patients stopped needing transfusions',
        laymanSummary:
          'The first clinical trial was 25 patients. Everyone who received an effective dose responded, and the twelve who had been living on regular transfusions no longer needed them.',
        technicalDetails:
          'Combined phase I and II trial, 25 anaemic haemodialysis patients, intravenous recombinant human erythropoietin three times weekly after dialysis at 15-500 units per kilogram. Dose-dependent increases in effective erythropoiesis. At 500 U/kg, haematocrit rose by as much as 10 percentage points within three weeks. Of 18 patients on effective doses, the 12 who had required transfusions no longer needed them and 11 reached a haematocrit of 35% or more. Four patients developed raised blood pressure. No anti-erythropoietin antibodies were detected.',
        evidenceSource: 'Eschbach JW et al. N Engl J Med 1987;316:73-78',
        doi: '10.1056/NEJM198701083160203',
        measuredMetric: '12 of 12 previously transfusion-dependent patients became transfusion-independent',
        auditFlag: 'verified',
      },
      {
        id: 'ea-a2',
        category: 'conclusion_shift',
        title: 'Normalising haematocrit was stopped early for harm, and the field reversed',
        laymanSummary:
          'The obvious next step was to raise blood counts all the way to normal. A 1,233-patient trial in dialysis patients with heart disease was halted because more people in the normal-haematocrit group were dying.',
        technicalDetails:
          'The Normal Hematocrit Trial randomised 1,233 haemodialysis patients with congestive heart failure or ischaemic heart disease to epoetin targeting haematocrit 42% or 30%. After 29 months there were 183 deaths and 19 non-fatal myocardial infarctions in the normal-haematocrit group versus 150 deaths and 14 infarctions in the low-haematocrit group; risk ratio 1.3 (95% CI 0.9-1.9). The difference did not cross the prespecified stopping boundary, and the study was halted anyway. Patients in the normal-haematocrit group also had a decline in dialysis adequacy and needed more intravenous iron. The paper concluded that raising haematocrit to 42% is not recommended.',
        evidenceSource: 'Besarab A et al. N Engl J Med 1998;339:584-590',
        doi: '10.1056/NEJM199808273390903',
        inferredClaim:
          'That because anaemia is associated with worse outcomes, correcting anaemia fully with an ESA improves outcomes',
        auditFlag: 'verified',
      },
      {
        id: 'ea-a3',
        category: 'conclusion_shift',
        title: 'CHOIR and CREATE confirmed it in pre-dialysis kidney disease, in the same month',
        laymanSummary:
          'Two independent trials published side by side in 2006 tested the same idea in earlier kidney disease. Neither found a benefit, and one found clear harm.',
        technicalDetails:
          'CHOIR randomised 1,432 patients with chronic kidney disease to a haemoglobin target of 13.5 versus 11.3 g/dL. The composite of death, myocardial infarction, hospitalisation for congestive heart failure and stroke occurred in 125 versus 97 patients; hazard ratio 1.34 (95% CI 1.03-1.74), p = 0.03. Quality-of-life improvements were similar in both groups. CREATE randomised 603 patients with eGFR 15-35 to a normal (13.0-15.0 g/dL) or subnormal (10.5-11.5 g/dL) haemoglobin target; the primary cardiovascular composite showed hazard ratio 0.78 (95% CI 0.53-1.14, p = 0.20), left ventricular mass index did not change, and more patients in the normalisation arm required dialysis (127 versus 111, p = 0.03).',
        evidenceSource:
          'Singh AK et al. N Engl J Med 2006;355:2085-2098 (CHOIR); Drueke TB et al. N Engl J Med 2006;355:2071-2084 (CREATE)',
        doi: '10.1056/NEJMoa065485',
        measuredMetric: 'CHOIR composite hazard ratio 1.34 (95% CI 1.03-1.74), p = 0.03 for the higher haemoglobin target',
        auditFlag: 'verified',
      },
      {
        id: 'ea-a4',
        category: 'failed',
        title: 'In cancer, correcting anaemia shortened survival',
        laymanSummary:
          'Two oncology trials designed to show that fixing anaemia helps cancer patients found the opposite: worse cancer control and worse survival in the treated arm.',
        technicalDetails:
          'The BEST trial randomised 939 women with metastatic breast cancer on first-line chemotherapy to epoetin alfa targeting haemoglobin 12-14 g/dL or placebo; it was stopped early by its data monitoring committee, and 12-month overall survival was 70% versus 76% (p = 0.01) against epoetin. The ENHANCE trial randomised 351 anaemic head and neck cancer patients undergoing curative radiotherapy to epoetin beta or placebo; locoregional progression-free survival was worse with epoetin, adjusted relative risk 1.62 (95% CI 1.22-2.14, p = 0.0008), and overall survival relative risk 1.39 (95% CI 1.05-1.84, p = 0.02). A pooled analysis of 51 trials and 13,611 patients found ESA mortality hazard ratio 1.10 (95% CI 1.01-1.20) and venous thromboembolism relative risk 1.57 (95% CI 1.31-1.87).',
        evidenceSource:
          'Leyland-Jones B et al. J Clin Oncol 2005;23:5960-5972; Henke M et al. Lancet 2003;362:1255-1260; Bennett CL et al. JAMA 2008;299:914-924',
        doi: '10.1001/jama.299.8.914',
        measuredMetric: 'Pooled ESA mortality hazard ratio 1.10 (95% CI 1.01-1.20) across 13,611 patients',
        auditFlag: 'verified',
      },
      {
        id: 'ea-a5',
        category: 'measured',
        title: 'The reversal is written into the label',
        laymanSummary:
          'The current US prescribing information carries a boxed warning stating that no haemoglobin target, dose or dosing strategy has been found that avoids the increased risk.',
        technicalDetails:
          'The boxed warning states that in controlled trials patients with chronic kidney disease experienced greater risks for death, serious adverse cardiovascular reactions and stroke when ESAs were used to target a haemoglobin above 11 g/dL, and that no trial has identified a haemoglobin target, ESA dose or dosing strategy that does not increase these risks. For cancer it states that ESAs shortened overall survival or increased tumour progression in breast, non-small cell lung, head and neck, lymphoid and cervical cancers, and that ESAs are not indicated when the anticipated outcome is cure. From 2010 to 2017 dispensing was additionally controlled by the ESA APPRISE Oncology risk evaluation and mitigation strategy.',
        evidenceSource: 'EPOGEN US prescribing information, boxed warning',
        measuredMetric:
          'Label language: no haemoglobin target, ESA dose or dosing strategy has been identified that does not increase these risks',
        auditFlag: 'verified',
      },
      {
        id: 'ea-a6',
        category: 'inferred',
        title: 'Quality of life was the justification, and it did not hold up',
        laymanSummary:
          'Much of the case for pushing blood counts higher rested on patients feeling better. When trials measured that directly, the higher target did not deliver it.',
        technicalDetails:
          'CHOIR reported that improvements in quality of life were similar in the two groups despite a two-gram difference in achieved haemoglobin. CREATE did find significantly better general health and physical function scores in the normalisation arm, but against no cardiovascular benefit and more patients progressing to dialysis. The residual honest claim is that treating severe anaemia to the transfusion-avoidance range improves symptoms; the claim that more haemoglobin means proportionally more benefit is the one that failed.',
        evidenceSource: 'Singh AK et al. N Engl J Med 2006;355:2085-2098; Drueke TB et al. N Engl J Med 2006;355:2071-2084',
        doi: '10.1056/NEJMoa062276',
        inferredClaim: 'That higher haemoglobin produces proportionally better quality of life',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected into a vein or under the skin',
        laymanDesc:
          'It is given intravenously during dialysis or as a subcutaneous injection. It has to be injected because it is a protein and would be digested if swallowed.',
        molecularDetail:
          'Subcutaneous bioavailability is well below intravenous, but the slower absorption gives a longer effective exposure, which is why the subcutaneous route needs less total drug per week in most patients.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Sugar chains keep it in the circulation',
        laymanDesc:
          'The molecule is coated in branched sugars ending in sialic acid. Without them the liver would clear it from the blood within minutes.',
        molecularDetail:
          'Three N-linked and one O-linked glycan carry terminal sialic acid residues that shield the underlying galactose from the hepatic asialoglycoprotein receptor. Sialylation is the single largest determinant of in vivo potency, which is why glycan mapping is a release assay rather than a characterisation nicety.',
        iconName: 'Shield',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Binds erythroid progenitor cells in the bone marrow',
        laymanDesc:
          'In the marrow it finds immature red cell precursors and docks onto their surface receptors.',
        molecularDetail:
          'One erythropoietin molecule binds a preformed EPOR homodimer through two asymmetric interfaces of very different affinity, reorienting the receptor chains rather than bringing them together from a distance.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Switches on the JAK2-STAT5 survival signal',
        laymanDesc:
          'The receptor turns on an internal switch that tells the immature cell not to die and to keep dividing.',
        molecularDetail:
          'Receptor reorientation trans-activates the associated JAK2 kinases, phosphorylating EPOR cytoplasmic tyrosines and recruiting STAT5, PI3K and RAS-MAPK. STAT5 drives BCL-XL transcription, which blocks apoptosis in colony-forming unit-erythroid and proerythroblast stages.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Progenitors survive, divide and consume iron',
        laymanDesc:
          'Cells that would have died instead mature into red cells. They need iron to do it, which is why iron runs out fast once this drug is started.',
        molecularDetail:
          'Rescued progenitors proceed through terminal erythroid differentiation, each requiring roughly 1 mg of iron per 1 mL of packed red cells produced. Functional iron deficiency is the commonest cause of apparent hyporesponsiveness.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Haemoglobin rises, and above about 11 g/dL so does risk',
        laymanDesc:
          'The blood count comes up over weeks. Past a point, pushing it further has been shown to cause more strokes, clots and deaths rather than fewer.',
        molecularDetail:
          'Reticulocytosis appears within days and haemoglobin rises over two to six weeks. Above roughly 11 g/dL the measured trade-off turns: increased blood viscosity, hypertension, vascular access thrombosis and, in cancer, possible direct EPOR-mediated effects on tumour tissue. The dose itself, independent of achieved haemoglobin, is an additional candidate mediator that no trial has cleanly separated.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Normal Hematocrit Trial (Besarab 1998; predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 1233,
        primaryEndpoint: 'Time to death or first non-fatal myocardial infarction',
        endpointMet: false,
        statisticalPValue: 'Risk ratio 1.3 (95% CI 0.9-1.9); trial halted before the stopping boundary was crossed',
        unreportedAdverseSignals:
          'Dialysis adequacy declined and intravenous iron requirement rose in the normal-haematocrit group, both of which are downstream consequences rarely quoted with the mortality result.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CHOIR (NCT00211120)',
        phase: 'Phase 3',
        sampleSize: 1432,
        primaryEndpoint:
          'Composite of death, myocardial infarction, hospitalisation for congestive heart failure and stroke',
        endpointMet: false,
        statisticalPValue: 'p = 0.03 against the higher haemoglobin target (hazard ratio 1.34, 95% CI 1.03-1.74)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'CREATE (NCT00321919)',
        phase: 'Phase 3',
        sampleSize: 603,
        primaryEndpoint: 'Composite of eight cardiovascular events',
        endpointMet: false,
        statisticalPValue: 'p = 0.20 (hazard ratio 0.78, 95% CI 0.53-1.14)',
        unreportedAdverseSignals:
          'More patients in the normalisation arm required dialysis (127 versus 111, p = 0.03), a renal outcome that the cardiovascular framing of the trial did not foreground.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'BEST (Leyland-Jones 2005, metastatic breast cancer)',
        phase: 'Phase 3',
        sampleSize: 939,
        primaryEndpoint: '12-month overall survival',
        endpointMet: false,
        statisticalPValue: 'p = 0.01 against epoetin alfa (70% versus 76% survival)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '12 of 12 transfusion-dependent dialysis patients became transfusion-independent in the 1987 first-in-human trial',
        'Targeting haematocrit 42% versus 30% in dialysis patients with heart disease: 183 versus 150 deaths, trial halted',
        'CHOIR: composite cardiovascular hazard ratio 1.34 (95% CI 1.03-1.74) for the higher haemoglobin target',
        'Pooled oncology data across 13,611 patients: mortality hazard ratio 1.10, venous thromboembolism relative risk 1.57',
      ],
      unsupportedInferences: [
        'That because low haemoglobin predicts bad outcomes, raising haemoglobin with a drug prevents them',
        'That quality of life improves in proportion to achieved haemoglobin — CHOIR found no difference across a two-gram gap',
        'That the harm is explained entirely by haemoglobin level rather than by ESA dose; no trial has separated the two',
      ],
      whatFailedInitially: [
        'Haemoglobin normalisation failed in dialysis (1998), in pre-dialysis chronic kidney disease twice (2006), and in cancer (2003, 2005)',
        'The ESA APPRISE Oncology risk evaluation and mitigation strategy ran from 2010 until it was withdrawn in 2017',
      ],
      realWorldOutcome: [
        'Transfusion dependence in dialysis is now rare, which is the durable achievement of this drug',
        'US practice moved to the lowest dose that avoids transfusion, and biosimilar epoetin alfa-epbx was approved in May 2018',
      ],
    },
    deliverySystem: {
      type: 'Intravenous or subcutaneous injection, single-dose and multiple-dose vials',
      description:
        'Given intravenously during haemodialysis or subcutaneously in non-dialysis patients. Multiple-dose vials contain benzyl alcohol and are not for neonates, infants, pregnant women or nursing mothers.',
      safetyProfile:
        'Boxed warning for death, myocardial infarction, stroke, venous thromboembolism, vascular access thrombosis and tumour progression or recurrence. Hypertension and seizures are labelled risks. Antibody-mediated pure red cell aplasia is rare but catastrophic, since the antibodies neutralise the patient own erythropoietin as well as the drug.',
    },
    commonQuestions: [
      {
        q: 'If anaemia is dangerous, why is it wrong to correct it completely?',
        a: 'Because that assumption was tested four times and failed each time. Anaemia in kidney disease is a marker of how sick the kidney is, and driving the number up with a drug does not undo the illness the number was reporting. The Normal Hematocrit Trial, CHOIR, CREATE and the oncology trials all found either no benefit or clear harm from the higher target.',
        auditNote:
          'This is the clearest conclusion shift in modern nephrology: from correct the anaemia to use the least drug that avoids a transfusion.',
      },
      {
        q: 'Is the harm from the high haemoglobin or from the high dose of drug needed to reach it?',
        a: 'Nobody has cleanly separated the two. Patients who need the largest doses to hit a target are also the sickest and the most ESA-resistant, so dose, target and underlying illness are entangled in every one of these trials. This is a genuine open question, not a settled one.',
      },
      {
        q: 'Why is iron given alongside it?',
        a: 'Because the drug orders red cell production and red cells are largely iron. Roughly 1 mg of iron is consumed for every 1 mL of packed red cells made. Start an ESA without adequate iron and the patient looks resistant to the drug when they are simply out of raw material.',
      },
      {
        q: 'Why can cancer patients not use it to feel less tired?',
        a: 'Because in randomised trials it shortened survival and increased tumour progression in several cancers. The label restricts it to anaemia from myelosuppressive chemotherapy where the anticipated outcome is not cure, and requires stopping it when the chemotherapy course ends.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether there is any haemoglobin target above the transfusion threshold that is safe. The boxed warning says so in as many words: no trial has identified a haemoglobin target level, ESA dose or dosing strategy that does not increase these risks. That is an admission of an unanswered question, printed on the label.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Eschbach JW et al. Correction of the anemia of end-stage renal disease with recombinant human erythropoietin. N Engl J Med 1987;316:73-78',
        identifier: '10.1056/NEJM198701083160203',
        kind: 'doi',
      },
      {
        label:
          'Besarab A et al. The effects of normal as compared with low hematocrit values in patients with cardiac disease who are receiving hemodialysis and epoetin. N Engl J Med 1998;339:584-590',
        identifier: '10.1056/NEJM199808273390903',
        kind: 'doi',
      },
      {
        label: 'Singh AK et al. Correction of anemia with epoetin alfa in chronic kidney disease (CHOIR). N Engl J Med 2006;355:2085-2098',
        identifier: '10.1056/NEJMoa065485',
        kind: 'doi',
      },
      {
        label:
          'Drueke TB et al. Normalization of hemoglobin level in patients with chronic kidney disease and anemia (CREATE). N Engl J Med 2006;355:2071-2084',
        identifier: '10.1056/NEJMoa062276',
        kind: 'doi',
      },
      {
        label:
          'Henke M et al. Erythropoietin to treat head and neck cancer patients with anaemia undergoing radiotherapy (ENHANCE). Lancet 2003;362:1255-1260',
        identifier: '10.1016/S0140-6736(03)14567-9',
        kind: 'doi',
      },
      {
        label:
          'Leyland-Jones B et al. Maintaining normal hemoglobin levels with epoetin alfa in mainly nonanemic patients with metastatic breast cancer (BEST). J Clin Oncol 2005;23:5960-5972',
        identifier: '10.1200/JCO.2005.06.150',
        kind: 'doi',
      },
      {
        label:
          'Bennett CL et al. Venous thromboembolism and mortality associated with recombinant erythropoietin and darbepoetin administration for the treatment of cancer-associated anemia. JAMA 2008;299:914-924',
        identifier: '10.1001/jama.299.8.914',
        kind: 'doi',
      },
      { label: 'CHOIR trial registration', identifier: 'NCT00211120', kind: 'nct' },
      { label: 'CREATE trial registration', identifier: 'NCT00321919', kind: 'nct' },
      {
        label: 'EPOGEN (epoetin alfa) injection — US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1f2d0b28-9cc5-4523-80b8-637fdaf3f7a5',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: EPOGEN / PROCRIT, BLA 103234, original approval 1 June 1989',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=103234',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: RETACRIT (epoetin alfa-epbx), BLA 125545, first US epoetin biosimilar approved 15 May 2018',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125545',
        kind: 'regulatory',
      },
      {
        label: 'UniProt P01588 — human erythropoietin, mature chain',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01588',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 4. Filgrastim
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'filgrastim',
    name: 'Filgrastim',
    tradeName: 'Neupogen',
    sponsor: 'Amgen',
    targetGene: 'CSF3R',
    targetProtein: 'Granulocyte colony-stimulating factor receptor (G-CSFR, CD114)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1991,
    indication:
      'Reduction of febrile neutropenia in patients receiving myelosuppressive chemotherapy, in acute myeloid leukaemia induction and consolidation, in bone marrow transplantation, for peripheral blood progenitor cell mobilisation, and in severe chronic neutropenia',
    patientFriendlyIndication: 'Rebuilding infection-fighting white cells knocked down by chemotherapy',
    anatomicalSite: 'Neutrophil progenitors in the bone marrow',
    conditionContext: {
      conditionExplainer:
        'Chemotherapy kills dividing cells. Bone marrow is the most rapidly dividing tissue in an adult, so it is hit alongside the tumour. Roughly a week to ten days after a cycle, the neutrophil count bottoms out and the patient has almost no functioning first-line immune defence.',
      whyItMatters:
        'A fever during that window is a medical emergency. Febrile neutropenia means intravenous antibiotics and admission, it delays the next chemotherapy cycle, and it forces dose reductions that can compromise the chance of cure.',
      whoTakesThis:
        'Patients on chemotherapy regimens with a high risk of febrile neutropenia, stem cell donors and autologous transplant patients being mobilised, and people with severe chronic neutropenia including congenital, cyclic and idiopathic forms.',
      clinicalGoals:
        'Shorten the neutrophil nadir so the patient gets through the window without fever, and keep the chemotherapy schedule on time and at full dose.',
    },
    oneSentenceVerdict:
      'A non-glycosylated bacterial copy of the human neutrophil growth factor with one extra methionine; in the registration trial it cut febrile neutropenia in small cell lung cancer from 77% of patients to 40%, and it shortened grade IV neutropenia from a median six days to one.',
    laymanHowItWorks:
      'Your bone marrow has a standing production line for neutrophils, the white cells that handle bacteria first. Chemotherapy shuts the line down for about a week. Filgrastim is a copy of the hormone that tells the line to run faster and to release its finished stock early. It does not protect the marrow from the chemotherapy; it shortens the gap afterwards.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 90,
    substitutes: {
      summary:
        'The real alternatives to a growth factor are a less myelosuppressive chemotherapy regimen, prophylactic antibiotics, or simply accepting the nadir and treating fever when it happens. Which one is right depends on how much the chemotherapy dose intensity matters for that particular cancer. Nothing dietary raises a neutrophil count during chemotherapy, and claims otherwise are the reason this section exists.',
      conventionalRx: [
        {
          name: 'Pegfilgrastim (Neulasta) and its biosimilars',
          class: 'PEGylated long-acting G-CSF',
          howItCompares:
            'Same protein with a 20 kDa polyethylene glycol chain, cleared by neutrophils themselves rather than by the kidney, so one injection per cycle replaces up to fourteen.',
          typicalCost: 'Approximately $2,000 - $6,000 per cycle US list, considerably lower for biosimilars',
          prosAndCons:
            'Pros: one injection instead of daily dosing. Cons: no flexibility to stop early, and the dose cannot be titrated to the observed count.',
        },
        {
          name: 'Filgrastim biosimilars (Zarxio, Nivestym, Releuko)',
          class: 'Biosimilar G-CSF',
          howItCompares:
            'Same molecule. Zarxio was the first biosimilar of any kind approved in the United States, in March 2015.',
          typicalCost: 'Typically 15% - 40% below the reference product US list price',
          prosAndCons:
            'Pros: the one biologic class where US biosimilar competition genuinely moved price. Cons: none clinically distinguishable.',
        },
        {
          name: 'Prophylactic fluoroquinolone antibiotics',
          class: 'Antibacterial prophylaxis',
          howItCompares:
            'Attacks the consequence rather than the cause. Reduces febrile episodes in high-risk patients without shortening the nadir.',
          typicalCost: '$10 - $40 per course (generic)',
          prosAndCons:
            'Pros: oral and cheap. Cons: drives fluoroquinolone resistance and Clostridioides difficile, and does not permit chemotherapy dose intensification.',
        },
        {
          name: 'Chemotherapy dose reduction or schedule delay',
          class: 'Regimen modification',
          howItCompares:
            'Guaranteed to reduce neutropenia, at the cost of the dose intensity that the meta-analysis links to the mortality benefit of growth factor support.',
          typicalCost: 'No drug cost',
          prosAndCons:
            'Pros: free and always available. Cons: in curative-intent regimens, reduced dose intensity is itself a measured harm.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Loratadine or paracetamol for growth-factor bone pain',
          action: 'A simple analgesic or antihistamine taken for the deep bone ache that follows dosing.',
          patientImpact:
            'Bone pain was reported in about 20% of patients in the registration trial and in 19.6% versus 10.4% of controls in the pooled meta-analysis. It comes from marrow expanding inside a fixed bony space and is not a sign of harm.',
          clinicalPrecaution:
            'Any new bone or left upper abdominal pain should still be reported: splenic rupture is a rare labelled risk of this class and presents as left upper quadrant or shoulder tip pain.',
        },
        {
          name: 'Fever thresholds agreed in advance',
          action: 'Know the temperature at which you are meant to call the oncology unit, and have the number to hand.',
          patientImpact:
            'The entire clinical value of shortening the nadir is lost if a fever during it is not treated within an hour. This is the highest-leverage non-drug action in the whole treatment cycle.',
          clinicalPrecaution:
            'Do not take antipyretics to suppress a fever during the nadir before speaking to the team; masking it delays antibiotics.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'MTPLGPASSLPQSFLLKCLEQVRKIQGDGAALQEKLCATYKLCHPEELVLLGHSLGIPWAPLSSCPSQALQLAGCLSQLHSGLFLYQGLLQALEGISPELGPTLDTLQLDVADFATTIWQQMEELGMAPALQPTQGAMPAFASAFQRRAGGVLVASHLQSFLEVSYRVLRHLAQP',
      molecularWeight: '18,800 Da',
      targetReceptorAffinity: 'Binds G-CSFR (CD114) and drives a 2:2 ligand-receptor complex',
      structureSource: {
        label:
          'NEUPOGEN US prescribing information (Description) with the mature 174-residue sequence from UniProt P09919-2 plus the N-terminal methionine the label describes',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=97cc73cc-b5b7-458a-a933-77b00523e193',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'fg-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'E. coli working cell bank release',
          description:
            'Confirm plasmid integrity, insert sequence and freedom from adventitious agents in the E. coli working cell bank carrying the human G-CSF gene. Because the product is deliberately non-glycosylated, the bacterial host is a design choice and not a compromise.',
          reagentsAndBuffer:
            'Plasmid sequencing, selective agar plating, bacteriophage and sterility panels',
        },
        {
          id: 'fg-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'High-cell-density fermentation and inclusion body refold',
          description:
            'Express methionyl G-CSF as cytoplasmic inclusion bodies, recover by homogenisation and centrifugation, then solubilise and refold to set the two intramolecular disulfide bonds of the four-helix bundle.',
          reagentsAndBuffer:
            'Defined glucose-mineral salts fermentation medium, 6 M guanidine hydrochloride solubilisation, oxidative refold with reduced and oxidised glutathione at pH 8.0',
          dependsOnStepId: 'fg-1',
        },
        {
          id: 'fg-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Ion-exchange and hydrophobic interaction polish',
          description:
            'Capture on cation exchange at acidic pH, then polish by hydrophobic interaction and size-exclusion chromatography to remove misfolded monomer, dimer and residual host cell protein and endotoxin.',
          reagentsAndBuffer:
            'SP-Sepharose in 20 mM sodium acetate pH 4.5 with sodium chloride gradient, butyl-Sepharose with ammonium sulfate, Superdex 75 in 10 mM acetate',
          dependsOnStepId: 'fg-2',
        },
        {
          id: 'fg-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Acidic formulation at pH 4.0',
          description:
            'Formulate into the low-pH acetate-sorbitol-polysorbate vehicle. The acidic pH is what keeps this protein monomeric and soluble; near neutrality it aggregates, and aggregates are the immunogenicity risk.',
          reagentsAndBuffer:
            'Glacial acetic acid and sodium hydroxide to pH 4.0, sorbitol 50 mg/mL, polysorbate 80 0.04 mg/mL',
          dependsOnStepId: 'fg-3',
        },
        {
          id: 'fg-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Cell mitogenesis potency bioassay',
          description:
            'Determine specific activity by G-CSF-dependent cell proliferation against the WHO international standard. The label specifies a specific activity of 1.0 plus or minus 0.6 times ten to the eighth units per milligram measured by exactly this assay.',
          reagentsAndBuffer:
            'G-CSF-dependent murine NFS-60 or M-NFS-60 cell line, RPMI-1640 with fetal bovine serum, MTT or luminescent viability readout, WHO G-CSF international standard',
          dependsOnStepId: 'fg-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'fg-a1',
        category: 'measured',
        title: 'Registration trial: febrile neutropenia fell from 77% to 40%',
        laymanSummary:
          'In 199 evaluable small cell lung cancer patients on identical chemotherapy, the proportion who had at least one episode of fever with a dangerously low white count fell by nearly half.',
        technicalDetails:
          'Multicentre, randomised, double-blind, placebo-controlled trial of recombinant methionyl G-CSF across up to six cycles of cyclophosphamide, doxorubicin and etoposide. At least one episode of fever with neutropenia occurred in 77% of the placebo group versus 40% of the G-CSF group (p < 0.001). Median duration of grade IV neutropenia across all cycles was six days with placebo and one day with G-CSF. Days on intravenous antibiotics, days in hospital and confirmed infections each fell by approximately 50%. Mild to moderate medullary bone pain occurred in 20% of G-CSF recipients.',
        evidenceSource: 'Crawford J et al. N Engl J Med 1991;325:164-170',
        doi: '10.1056/NEJM199107183250305',
        measuredMetric: '77% versus 40% of patients with at least one febrile neutropenic episode (p < 0.001)',
        auditFlag: 'verified',
      },
      {
        id: 'fg-a2',
        category: 'measured',
        title: 'Pooled meta-analysis: early mortality fell 40%, infection mortality 45%',
        laymanSummary:
          'Across seventeen randomised trials and 3,493 patients, prophylactic G-CSF reduced deaths during the chemotherapy period, not just fevers.',
        technicalDetails:
          'Systematic review and meta-analysis of randomised trials of primary prophylactic G-CSF versus placebo or untreated control in adults with solid tumours or lymphoma. Infection-related mortality relative risk 0.55 (95% CI 0.33-0.90, p = 0.018). Early all-cause mortality during the chemotherapy period relative risk 0.60 (95% CI 0.43-0.83, p = 0.002). Febrile neutropenia relative risk 0.54 (95% CI 0.43-0.67, p < 0.001). Average relative dose intensity was significantly higher with G-CSF. Bone or musculoskeletal pain was reported in 19.6% of G-CSF patients versus 10.4% of controls.',
        evidenceSource: 'Kuderer NM et al. J Clin Oncol 2007;25:3158-3167',
        doi: '10.1200/JCO.2006.08.8823',
        measuredMetric: 'Early all-cause mortality relative risk 0.60 (95% CI 0.43-0.83)',
        auditFlag: 'verified',
      },
      {
        id: 'fg-a3',
        category: 'inferred',
        title: 'Overall survival was not the endpoint, and the same paper says so',
        laymanSummary:
          'The mortality benefit measured is during the chemotherapy period. Whether patients live longer overall is a separate question the trials were not built to answer.',
        technicalDetails:
          'The 2007 meta-analysis concludes explicitly that there are insufficient data to assess the impact of G-CSF on disease-free and overall survival. The measured mortality outcomes are infection-related mortality and early all-cause mortality during the chemotherapy period. Long-term survival depends on whether the higher achieved dose intensity translates into better cancer control, which varies by tumour and regimen and has been demonstrated in only a subset of settings.',
        evidenceSource: 'Kuderer NM et al. J Clin Oncol 2007;25:3158-3167',
        doi: '10.1200/JCO.2006.08.8823',
        inferredClaim:
          'That reducing febrile neutropenia and early mortality means patients live longer overall',
        auditFlag: 'caution',
      },
      {
        id: 'fg-a4',
        category: 'measured',
        title: 'A near doubling of secondary leukaemia risk, against a larger fall in all-cause mortality',
        laymanSummary:
          'Following 12,804 randomised patients for a median of four and a half years, treatment-related leukaemia was about twice as common with G-CSF support. Death from any cause was less common.',
        technicalDetails:
          'Systematic review of 25 randomised trials, 6,058 patients randomised to chemotherapy with initial G-CSF support and 6,746 without, at mean and median follow-up of 60 and 53 months. Acute myeloid leukaemia or myelodysplastic syndrome was reported in 43 G-CSF patients versus 22 controls: relative risk 1.92 (95% CI 1.19-3.07, p = 0.007), absolute risk increase 0.41% (95% CI 0.10-0.72, p = 0.009). Over the same trials all-cause mortality relative risk was 0.897 (95% CI 0.857-0.938, p < 0.001), an absolute reduction of 3.40%. The greater delivered dose intensity that G-CSF enables is the plausible mediator of both effects.',
        evidenceSource: 'Lyman GH et al. J Clin Oncol 2010;28:2914-2924',
        doi: '10.1200/JCO.2009.25.8723',
        measuredMetric:
          'AML/MDS relative risk 1.92 (absolute increase 0.41%) against all-cause mortality relative risk 0.897 (absolute decrease 3.40%)',
        auditFlag: 'verified',
      },
      {
        id: 'fg-a5',
        category: 'conclusion_shift',
        title: 'The first US biosimilar of any kind was a filgrastim',
        laymanSummary:
          'Zarxio, approved in March 2015, was the first product ever licensed under the US biosimilar pathway. This is one of the few biologic markets where competition genuinely moved the price.',
        technicalDetails:
          'Zarxio (filgrastim-sndz, BLA 125553) was approved 6 March 2015 as the first product licensed under section 351(k) of the Public Health Service Act. Nivestym (BLA 761080) followed in July 2018 and Releuko (BLA 761082) in February 2022. Filgrastim is a small, non-glycosylated, bacterially expressed protein with a well-characterised potency bioassay, which is exactly the profile that makes analytical comparability tractable, and it is why this class became the proving ground for the pathway rather than a monoclonal antibody.',
        evidenceSource: 'Drugs@FDA, BLA 125553 (Zarxio), BLA 761080 (Nivestym), BLA 761082 (Releuko)',
        measuredMetric: 'First US biosimilar approval: 6 March 2015',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected under the skin or into a vein',
        laymanDesc:
          'A daily injection, usually starting a day or so after the chemotherapy has finished and continuing until the white count has recovered.',
        molecularDetail:
          'Non-glycosylated, so cleared by both renal filtration and neutrophil-mediated internalisation. Half-life is roughly three to four hours, which is why daily dosing is needed and why the PEGylated version exists.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Reaches neutrophil progenitors in the marrow',
        laymanDesc:
          'It circulates to the bone marrow, where the immature cells destined to become neutrophils are waiting.',
        molecularDetail:
          'Distributes to G-CSFR-bearing cells: granulocyte-macrophage and granulocyte colony-forming units, promyelocytes, myelocytes and mature neutrophils. Receptor density rises with maturation, which is what makes the clearance mechanism self-limiting.',
        iconName: 'Bone',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Binds G-CSFR as a 2:2 complex',
        laymanDesc:
          'Two copies of the drug and two receptors lock together into a single signalling unit on the cell surface.',
        molecularDetail:
          'The four-helix bundle engages the immunoglobulin-like and cytokine receptor homology domains of G-CSFR, forming a 2:2 cross-over complex. Receptor dimerisation is obligatory: monomeric occupancy does not signal.',
        iconName: 'Combine',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'JAK2-STAT3 drives proliferation and survival',
        laymanDesc:
          'The receptor turns on the internal machinery that tells the cell to divide, mature and stay alive.',
        molecularDetail:
          'Receptor-associated JAK1 and JAK2 phosphorylate the cytoplasmic tail, recruiting STAT3 and STAT5. STAT3 drives proliferation and granulocytic differentiation; the SHP-2 and Ras-MAPK arms contribute to survival. Truncating CSF3R mutations that remove the negative-regulatory domain are found in severe congenital neutropenia patients who progress to leukaemia, which is the mechanistic thread behind the secondary malignancy signal.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Mature neutrophils are released early from the marrow reserve',
        laymanDesc:
          'Cells that would have sat in the marrow for days are pushed out into the blood now, and the production line behind them runs faster.',
        molecularDetail:
          'Neutrophil elastase and cathepsin G released by expanding granulocytes cleave marrow CXCL12, breaking the CXCR4 retention signal that holds neutrophils in the marrow niche. This is also the mechanism exploited for peripheral blood stem cell mobilisation.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'The nadir is shorter, and fewer people get febrile',
        laymanDesc:
          'The measurable result is fewer days with a dangerously low count, and about half as many patients developing fever during them.',
        molecularDetail:
          'Median grade IV neutropenia duration fell from six days to one in the registration trial, with febrile neutropenia dropping from 77% to 40% of patients and an approximately 50% reduction in intravenous antibiotic days, hospital days and confirmed infections.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Crawford 1991 small cell lung cancer trial (predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 211,
        primaryEndpoint: 'Incidence of fever with neutropenia across up to six chemotherapy cycles',
        endpointMet: true,
        statisticalPValue: 'p < 0.001 (77% versus 40% of patients)',
        unreportedAdverseSignals:
          'Medullary bone pain in 20% of treated patients is in the paper but is routinely omitted from summaries of this trial.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Kuderer 2007 meta-analysis (17 pooled randomised trials)',
        phase: 'Systematic review of Phase 3 trials',
        sampleSize: 3493,
        primaryEndpoint: 'Febrile neutropenia, infection-related mortality and early all-cause mortality',
        endpointMet: true,
        statisticalPValue: 'p = 0.002 for early all-cause mortality (relative risk 0.60, 95% CI 0.43-0.83)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Lyman 2010 secondary malignancy meta-analysis (25 pooled randomised trials)',
        phase: 'Systematic review of Phase 3 trials',
        sampleSize: 12804,
        primaryEndpoint: 'Acute myeloid leukaemia or myelodysplastic syndrome, and overall mortality',
        endpointMet: true,
        statisticalPValue: 'p = 0.007 for AML/MDS (relative risk 1.92); p < 0.001 for mortality (relative risk 0.897)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Febrile neutropenia in small cell lung cancer: 77% of patients on placebo versus 40% on G-CSF',
        'Median grade IV neutropenia duration: six days versus one day',
        'Early all-cause mortality during chemotherapy: relative risk 0.60 across 3,493 randomised patients',
        'Secondary AML or MDS: relative risk 1.92, absolute increase 0.41% across 12,804 randomised patients',
      ],
      unsupportedInferences: [
        'That the early mortality benefit equals an overall survival benefit — the meta-analysis states the data are insufficient to say',
        'That every chemotherapy regimen benefits; the guideline threshold of roughly 20% febrile neutropenia risk is a convention, not a trial result',
        'That bone pain is a marker of efficacy rather than a mechanical consequence of marrow expansion',
      ],
      whatFailedInitially: [
        'Attempts to use G-CSF to intensify chemotherapy beyond standard dose have not consistently improved cure rates outside specific lymphoma and breast cancer regimens',
        'The class carries an unresolved leukaemogenic signal that has never been separated from the dose intensity it enables',
      ],
      realWorldOutcome: [
        'Neutropenic sepsis mortality in oncology fell substantially after this class entered practice',
        'Zarxio became the first US biosimilar of any product class in March 2015, and biosimilar competition here did lower prices',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous or intravenous injection, single-dose vials and prefilled syringes',
      description:
        'Clear, colourless, preservative-free solution at pH 4.0. Supplied as 300 mcg/mL and 480 mcg/1.6 mL vials, and as 300 mcg/0.5 mL and 480 mcg/0.8 mL prefilled syringes. The acidic formulation is required for stability and is the reason injection can sting.',
      safetyProfile:
        'Splenic rupture, acute respiratory distress syndrome, serious allergic reactions, sickle cell crisis, glomerulonephritis, capillary leak syndrome, thrombocytopenia and cutaneous vasculitis are all labelled risks. Bone pain affects roughly one in five. In severe chronic neutropenia the label requires monitoring for myelodysplastic syndrome and acute myeloid leukaemia.',
    },
    commonQuestions: [
      {
        q: 'Does this drug protect me from the chemotherapy?',
        a: 'No. It does nothing to the chemotherapy or to the marrow damage the chemotherapy causes. It shortens the recovery period afterwards by accelerating production and early release of neutrophils. The nadir still happens; it is briefer.',
      },
      {
        q: 'Will it make me live longer?',
        a: 'The measured benefit is fewer deaths during the chemotherapy period and fewer infection deaths. Whether that becomes longer overall survival was not established by the trials, and the 2007 meta-analysis says so directly. It depends on whether keeping the chemotherapy on schedule improves cure for your particular cancer.',
        auditNote:
          'This is the single most common overstatement made about G-CSF: early mortality reduction being reported as a survival benefit.',
      },
      {
        q: 'Does it cause leukaemia?',
        a: 'Across 25 randomised trials the risk of treatment-related leukaemia or myelodysplasia roughly doubled, from about 0.4% to about 0.8% in absolute terms, while all-cause death fell by about 3.4% in absolute terms. Both effects are probably driven by the same thing: more chemotherapy actually delivered. That is a real trade, quantified, and it is not the same as no risk.',
      },
      {
        q: 'Why does it hurt my bones?',
        a: 'Because the marrow inside your bones is expanding rapidly inside a container that cannot expand. It is reported by roughly one in five patients, is usually mild to moderate, and is not a sign of anything going wrong. New left upper abdominal or shoulder tip pain is different and should be reported immediately, because splenic rupture is a rare labelled risk.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether the leukaemia signal is caused by G-CSF acting on progenitor cells directly or simply by the extra chemotherapy G-CSF makes possible. Separating those would need a trial randomising dose intensity independently of growth factor support, and it has not been done.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Crawford J et al. Reduction by granulocyte colony-stimulating factor of fever and neutropenia induced by chemotherapy in patients with small-cell lung cancer. N Engl J Med 1991;325:164-170',
        identifier: '10.1056/NEJM199107183250305',
        kind: 'doi',
      },
      {
        label:
          'Kuderer NM et al. Impact of primary prophylaxis with granulocyte colony-stimulating factor on febrile neutropenia and mortality in adult cancer patients receiving chemotherapy: a systematic review. J Clin Oncol 2007;25:3158-3167',
        identifier: '10.1200/JCO.2006.08.8823',
        kind: 'doi',
      },
      {
        label:
          'Lyman GH et al. Acute myeloid leukemia or myelodysplastic syndrome in randomized controlled clinical trials of cancer chemotherapy with granulocyte colony-stimulating factor: a systematic review. J Clin Oncol 2010;28:2914-2924',
        identifier: '10.1200/JCO.2009.25.8723',
        kind: 'doi',
      },
      {
        label: 'NEUPOGEN (filgrastim) injection — US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=97cc73cc-b5b7-458a-a933-77b00523e193',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: NEUPOGEN, BLA 103353, original approval 20 February 1991',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=103353',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ZARXIO (filgrastim-sndz), BLA 125553, first US biosimilar approved 6 March 2015',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125553',
        kind: 'regulatory',
      },
      {
        label: 'UniProt P09919-2 — human G-CSF short isoform, the 174-residue mature sequence used in filgrastim',
        identifier: 'https://rest.uniprot.org/uniprotkb/P09919',
        kind: 'url',
      },
    ],
  },
]
