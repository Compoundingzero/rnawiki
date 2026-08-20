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

  // ---------------------------------------------------------------------------------------------
  // 5. Pegfilgrastim
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'pegfilgrastim',
    name: 'Pegfilgrastim',
    tradeName: 'Neulasta',
    sponsor: 'Amgen',
    targetGene: 'CSF3R',
    targetProtein: 'Granulocyte colony-stimulating factor receptor (G-CSFR, CD114)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 2002,
    indication:
      'Decreasing the incidence of infection, as manifested by febrile neutropenia, in patients with non-myeloid malignancies receiving myelosuppressive anti-cancer drugs associated with a clinically significant incidence of febrile neutropenia; and increasing survival after acute exposure to myelosuppressive doses of radiation',
    patientFriendlyIndication: 'One injection per chemotherapy cycle instead of a daily white cell injection',
    anatomicalSite: 'Neutrophil progenitors in the bone marrow',
    conditionContext: {
      conditionExplainer:
        'Filgrastim works, but it is cleared from the blood in hours, so it has to be injected every day until the neutrophil count recovers — up to fourteen injections in a cycle, in someone already exhausted by chemotherapy.',
      whyItMatters:
        'Adherence to a daily injection schedule at home is the weak point of growth factor support. Missed doses in the middle of the nadir are exactly the doses that matter.',
      whoTakesThis:
        'Patients on chemotherapy regimens carrying a clinically significant risk of febrile neutropenia. It is also the only G-CSF product with an indication for acute radiation syndrome.',
      clinicalGoals:
        'Deliver the same neutrophil support as daily filgrastim from a single injection given the day after chemotherapy.',
    },
    oneSentenceVerdict:
      'Filgrastim with a 20 kDa polyethylene glycol chain on its N-terminal methionine, which makes neutrophils themselves the main route of clearance; one 6 mg injection per cycle matched fourteen days of filgrastim, and against placebo it cut febrile neutropenia from 17% to 1%.',
    laymanHowItWorks:
      'Pegfilgrastim is the same protein as filgrastim with a long, inert polymer chain attached to one end. The chain makes the molecule too large for the kidney to filter out, so the only thing that removes it from the blood is the neutrophils it creates. While your white count is low, the drug stays. As the count recovers, the new neutrophils mop up the remaining drug. The dose regulates itself.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 88,
    substitutes: {
      summary:
        'Daily filgrastim delivers the same neutrophil support if the injections are actually given, and biosimilars of both molecules now compete on price. Prophylactic antibiotics and regimen modification remain the non-growth-factor options. There is no dietary substitute for neutrophil support during chemotherapy.',
      conventionalRx: [
        {
          name: 'Filgrastim (Neupogen) and its biosimilars',
          class: 'Short-acting G-CSF',
          howItCompares:
            'Identical protein, no PEG. Non-inferior in the registration trial on duration of grade 4 neutropenia (1.8 versus 1.6 days in cycle 1). Requires up to fourteen daily injections instead of one.',
          typicalCost: 'Approximately $300 - $500 per daily vial US list, and lower for biosimilars',
          prosAndCons:
            'Pros: the dose can be stopped as soon as the count recovers, which pegfilgrastim cannot. Cons: daily injections, and missed doses at the nadir are the ones that count.',
        },
        {
          name: 'Pegfilgrastim biosimilars (Fulphila, Udenyca and others)',
          class: 'Biosimilar PEGylated G-CSF',
          howItCompares:
            'Same molecule, approved on analytical and clinical similarity. Fulphila was approved in June 2018 and Udenyca in November 2018.',
          typicalCost: 'Typically 30% - 60% below the reference product US list price',
          prosAndCons:
            'Pros: this is one of the few US biosimilar markets where multiple entrants genuinely moved price. Cons: none clinically distinguishable.',
        },
        {
          name: 'Eflapegrastim and efbemalenograstim alfa',
          class: 'Next-generation long-acting G-CSF conjugates',
          howItCompares:
            'Different half-life-extension chemistry reaching the same once-per-cycle goal; registered against pegfilgrastim on duration of severe neutropenia.',
          typicalCost: 'Comparable to the reference product US list price',
          prosAndCons:
            'Pros: additional supply. Cons: registered on the same surrogate endpoint, so nothing new is known about hard outcomes.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Checking the on-body injector actually delivered',
          action:
            'If an on-body injector is used, inspect it at the end of the delivery window and report anything unexpected the same day.',
          patientImpact:
            'The label carries a specific warning that patients should notify their healthcare provider if they suspect the on-body injector may not have performed as intended, because an undelivered dose leaves the patient unprotected through the nadir.',
          clinicalPrecaution:
            'A suspected device failure is a same-day call, not a next-appointment conversation. A replacement dose may be needed.',
        },
        {
          name: 'Simple analgesia for bone pain',
          action: 'Paracetamol or an antihistamine for the deep ache in the sternum, pelvis and long bones.',
          patientImpact:
            'Bone pain incidence, severity and duration with once-per-cycle pegfilgrastim were not significantly different from daily filgrastim in a retrospective analysis of two phase III trials, and were greatest in cycle 1 for both.',
          clinicalPrecaution:
            'New left upper abdominal or shoulder tip pain is not ordinary growth factor pain: splenic rupture is a labelled risk and needs urgent assessment.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'MTPLGPASSLPQSFLLKCLEQVRKIQGDGAALQEKLCATYKLCHPEELVLLGHSLGIPWAPLSSCPSQALQLAGCLSQLHSGLFLYQGLLQALEGISPELGPTLDTLQLDVADFATTIWQQMEELGMAPALQPTQGAMPAFASAFQRRAGGVLVASHLQSFLEVSYRVLRHLAQP (20 kDa monomethoxypolyethylene glycol covalently bound to the N-terminal methionyl residue)',
      molecularWeight: 'Approximately 39 kDa (19 kDa protein plus a 20 kDa mPEG chain)',
      targetReceptorAffinity: 'Binds G-CSFR (CD114); receptor-mediated internalisation by neutrophils is the principal clearance route',
      structureSource: {
        label: 'NEULASTA US prescribing information (Description) — 175-amino-acid filgrastim backbone with 20 kD mPEG at the N-terminal methionine',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fdfe5d72-6b80-435a-afa4-c5d74dd852ce',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'pf-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Filgrastim drug substance release',
          description:
            'Release the unconjugated filgrastim intermediate on identity, purity, endotoxin and potency before any PEGylation is attempted. Conjugating an out-of-specification intermediate produces a conjugate that cannot be deconvoluted.',
          reagentsAndBuffer:
            'RP-HPLC purity, SEC aggregate assay, LAL endotoxin, NFS-60 proliferation potency assay',
        },
        {
          id: 'pf-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Filgrastim expression and refold',
          description:
            'Express methionyl G-CSF as inclusion bodies in E. coli, solubilise and oxidatively refold to the native four-helix bundle with both disulfide bonds correctly paired.',
          reagentsAndBuffer:
            'Defined fermentation medium, guanidine hydrochloride solubilisation, glutathione redox refold at pH 8.0',
          dependsOnStepId: 'pf-1',
        },
        {
          id: 'pf-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Cation-exchange capture of the unconjugated protein',
          description:
            'Purify refolded filgrastim to homogeneity before conjugation, since separating mono-PEGylated product from di-PEGylated and unmodified species downstream is far harder than removing impurities now.',
          reagentsAndBuffer:
            'SP-Sepharose in sodium acetate pH 4.5 with sodium chloride gradient, hydrophobic interaction polish',
          dependsOnStepId: 'pf-2',
        },
        {
          id: 'pf-4',
          stepNumber: 4,
          phase: 'Conjugation',
          name: 'Site-selective N-terminal reductive alkylation with 20 kDa mPEG',
          description:
            'Attach a single 20 kDa monomethoxy-PEG aldehyde to the alpha-amino group of the N-terminal methionine at low pH, which exploits the lower pKa of the alpha-amine relative to lysine epsilon-amines to give site selectivity, then remove unreacted PEG and positional isomers.',
          reagentsAndBuffer:
            'mPEG-propionaldehyde 20 kDa, sodium cyanoborohydride, 100 mM sodium acetate at pH 5.0, followed by cation-exchange separation of mono-PEGylated species',
          dependsOnStepId: 'pf-3',
        },
        {
          id: 'pf-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Conjugate potency and PEG positional isomer mapping',
          description:
            'Confirm retained receptor-mediated potency in the cell proliferation bioassay and verify the site of PEG attachment by peptide mapping with mass spectrometry, since a PEG on the wrong residue changes both potency and clearance.',
          reagentsAndBuffer:
            'NFS-60 proliferation assay against WHO G-CSF standard, Lys-C peptide map with LC-MS/MS, SEC-MALS for hydrodynamic size',
          dependsOnStepId: 'pf-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'pf-a1',
        category: 'measured',
        title: 'Against placebo: febrile neutropenia fell from 17% to 1%',
        laymanSummary:
          'In 928 breast cancer patients on docetaxel, one injection per cycle reduced fevers with low white counts from about one in six patients to about one in a hundred.',
        technicalDetails:
          'Multicentre, double-blind, placebo-controlled phase III trial. Patients received placebo (n = 465) or pegfilgrastim 6 mg subcutaneously on day 2 of each 21-day cycle of docetaxel 100 mg/m2. Febrile neutropenia occurred in 1% versus 17% (p < 0.001), febrile-neutropenia-related hospitalisation in 1% versus 14% (p < 0.001), and intravenous anti-infective use in 2% versus 10% (p < 0.001).',
        evidenceSource: 'Vogel CL et al. J Clin Oncol 2005;23:1178-1184',
        doi: '10.1200/JCO.2005.09.102',
        measuredMetric: 'Febrile neutropenia 1% versus 17% (p < 0.001) in 928 patients',
        auditFlag: 'verified',
      },
      {
        id: 'pf-a2',
        category: 'measured',
        title: 'One injection matched fourteen: the non-inferiority registration trial',
        laymanSummary:
          'A single fixed 6 mg dose performed the same as daily filgrastim injections on every efficacy measure across four chemotherapy cycles.',
        technicalDetails:
          'Randomised, double-blind, multicentre phase III study, 157 patients on doxorubicin 60 mg/m2 and docetaxel 75 mg/m2. Mean duration of grade 4 neutropenia in cycle 1 was 1.8 days with pegfilgrastim and 1.6 days with daily filgrastim. Results in cycles 2 to 4 were consistent. Febrile neutropenia trended lower with pegfilgrastim across all cycles, 13% versus 20%. Safety and tolerability were comparable.',
        evidenceSource: 'Green MD et al. Ann Oncol 2003;14:29-35',
        doi: '10.1093/annonc/mdg019',
        measuredMetric: 'Grade 4 neutropenia duration 1.8 versus 1.6 days in cycle 1',
        auditFlag: 'verified',
      },
      {
        id: 'pf-a3',
        category: 'inferred',
        title: 'Approved on a surrogate, not on survival',
        laymanSummary:
          'The endpoint that got this drug licensed was how many days the white count stayed critically low, compared with a drug that was already on the market. No trial has shown it makes people live longer than daily filgrastim.',
        technicalDetails:
          'The pivotal comparison was non-inferiority in duration of grade 4 neutropenia against daily filgrastim, in 157 and 310 patients respectively. Duration of severe neutropenia is a laboratory surrogate; the placebo-controlled trial then measured febrile neutropenia, which is a clinical event, but neither design was powered for survival. The convenience advantage of one injection per cycle is real and measurable; a survival advantage over daily filgrastim has never been demonstrated because no trial has looked for one.',
        evidenceSource: 'Green MD et al. Ann Oncol 2003;14:29-35; Vogel CL et al. J Clin Oncol 2005;23:1178-1184',
        doi: '10.1200/JCO.2005.09.102',
        inferredClaim:
          'That once-per-cycle dosing produces better patient outcomes rather than better adherence to the same effect',
        auditFlag: 'caution',
      },
      {
        id: 'pf-a4',
        category: 'failed',
        title: 'The on-body injector has its own warning section',
        laymanSummary:
          'The device designed to remove the clinic visit can fail to deliver the dose, and the label tells patients to report it if they suspect it has.',
        technicalDetails:
          'Section 5.12 of the US prescribing information, Potential Device Failures, instructs that patients be told to notify their healthcare provider if they suspect the on-body injector may not have performed as intended, so that the need for a replacement dose can be assessed. Section 5.4 separately warns that the acrylic adhesive used by the injector can cause significant reactions in patients sensitive to acrylates. A delivery system introduced to improve adherence therefore introduced a failure mode that the daily syringe did not have.',
        evidenceSource: 'NEULASTA US prescribing information, Warnings and Precautions sections 5.4 and 5.12',
        auditFlag: 'caution',
      },
      {
        id: 'pf-a5',
        category: 'conclusion_shift',
        title: 'Biosimilar entry from 2018 was the price event, not a new trial',
        laymanSummary:
          'What changed the economics of this drug was not new evidence about whether it works. It was four biosimilars arriving after the patents ran out.',
        technicalDetails:
          'Fulphila (pegfilgrastim-jmdb, BLA 761075) was approved 4 June 2018 and Udenyca (pegfilgrastim-cbqv, BLA 761039) on 2 November 2018, followed by further entrants. Pegfilgrastim became one of the first US biologic markets with meaningful multi-source competition, and the clinical question the biosimilar programmes answered was analytical and pharmacodynamic comparability rather than a fresh outcome trial. Nothing about the underlying evidence for the molecule changed; the price did.',
        evidenceSource: 'Drugs@FDA, BLA 761075 (Fulphila) and BLA 761039 (Udenyca)',
        measuredMetric: 'First two US pegfilgrastim biosimilar approvals: 4 June 2018 and 2 November 2018',
        auditFlag: 'verified',
      },
      {
        id: 'pf-a6',
        category: 'measured',
        title: 'A radiation indication granted without a human efficacy trial',
        laymanSummary:
          'The indication for radiation sickness could not ethically be tested in people, so it was granted on animal data under a specific regulatory rule.',
        technicalDetails:
          'Pegfilgrastim carries an indication to increase survival in patients acutely exposed to myelosuppressive doses of radiation. Efficacy studies in humans cannot be ethically or feasibly conducted, so this indication rests on the FDA Animal Rule pathway and on the mechanistic continuity with chemotherapy-induced neutropenia. It is a legitimate regulatory decision and it is also, by construction, an indication with no human efficacy evidence behind it.',
        evidenceSource: 'NEULASTA US prescribing information, Indications and Usage',
        inferredClaim:
          'That the haematopoietic syndrome of acute radiation syndrome responds to G-CSF in humans the way it does in irradiated animals',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One subcutaneous injection the day after chemotherapy',
        laymanDesc:
          'A single 6 mg injection given about 24 hours after the chemotherapy finishes, either by syringe or by an adhesive on-body device that delivers it later that day.',
        molecularDetail:
          'Fixed 6 mg dose, not weight-adjusted, because clearance is receptor-mediated and therefore self-scaling rather than proportional to body size.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The PEG chain blocks kidney clearance',
        laymanDesc:
          'The polymer chain makes the molecule behave as though it were far larger than it is, so the kidney can no longer filter it out of the blood.',
        molecularDetail:
          'The 20 kDa mPEG raises the hydrodynamic radius well above the glomerular filtration cutoff. Total molecular weight is approximately 39 kDa but the hydrated PEG behaves like a much larger protein.',
        iconName: 'Filter',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Binds G-CSFR on marrow progenitors',
        laymanDesc:
          'From here the mechanism is identical to filgrastim: it docks on the receptors of immature neutrophils in the marrow.',
        molecularDetail:
          'N-terminal PEGylation is site-selected precisely because the N-terminus is not part of the receptor-binding interface, so 2:2 G-CSFR complex formation and JAK-STAT signalling are preserved.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Neutrophils clear the drug as they appear',
        laymanDesc:
          'The only way the body removes this drug is by the very cells it is making. While your count is low, it stays. As the count comes back, it disappears.',
        molecularDetail:
          'Neutrophil-mediated receptor internalisation and degradation is the dominant clearance pathway. Serum concentration therefore stays high through the nadir and falls sharply as the neutrophil count recovers, producing self-regulating exposure without therapeutic drug monitoring.',
        iconName: 'Repeat',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Marrow reserve released, production accelerated',
        laymanDesc:
          'Immature cells are pushed to finish maturing and the marrow releases its stored neutrophils earlier than it otherwise would.',
        molecularDetail:
          'STAT3-driven granulocytic proliferation plus proteolytic cleavage of the marrow CXCL12-CXCR4 retention axis by neutrophil elastase, releasing the mature reserve into circulation.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'One injection, the same nadir, far fewer fevers',
        laymanDesc:
          'The end result is the same recovery as fourteen daily injections, and against no treatment at all, febrile neutropenia falls from about one in six patients to about one in a hundred.',
        molecularDetail:
          'Grade 4 neutropenia duration 1.8 days versus 1.6 days for daily filgrastim; febrile neutropenia 1% versus 17% against placebo, with hospitalisation falling from 14% to 1%.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Vogel 2005 placebo-controlled breast cancer trial',
        phase: 'Phase 3',
        sampleSize: 928,
        primaryEndpoint: 'Percentage of patients developing febrile neutropenia',
        endpointMet: true,
        statisticalPValue: 'p < 0.001 (1% versus 17%)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Green 2003 non-inferiority registration trial',
        phase: 'Phase 3',
        sampleSize: 157,
        primaryEndpoint: 'Duration of grade 4 neutropenia in cycle 1 versus daily filgrastim',
        endpointMet: true,
        statisticalPValue: 'Non-inferiority met (1.8 versus 1.6 days in cycle 1)',
        unreportedAdverseSignals:
          'The comparator was an active drug rather than placebo, so this trial establishes equivalence to filgrastim and says nothing about benefit over no treatment.',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Febrile neutropenia 1% with pegfilgrastim versus 17% with placebo in 928 breast cancer patients',
        'Febrile-neutropenia-related hospitalisation 1% versus 14%',
        'Duration of grade 4 neutropenia 1.8 days versus 1.6 days for fourteen daily filgrastim injections',
        'Bone pain incidence, severity and duration not significantly different from daily filgrastim',
      ],
      unsupportedInferences: [
        'That once-per-cycle dosing improves survival relative to daily filgrastim — no trial has tested it',
        'That the radiation indication rests on human evidence; it was granted under the Animal Rule',
        'That an on-body injector is equivalent to a supervised injection; the label has a device-failure warning section',
      ],
      whatFailedInitially: [
        'On-body injector failures generated a dedicated Warnings and Precautions section requiring patients to report suspected non-delivery',
        'The acrylic adhesive on the injector causes significant reactions in acrylate-sensitive patients',
      ],
      realWorldOutcome: [
        'Once-per-cycle dosing became the default for growth factor prophylaxis in most high-risk regimens',
        'Multiple biosimilars from 2018 made this one of the few US biologic markets with real price competition',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection: prefilled syringe, single-dose vial, or prefilled syringe with an on-body injector',
      description:
        'Clear, colourless, preservative-free solution at pH 4.0. The 6 mg/0.6 mL prefilled syringe carries no graduation marks and delivers its entire contents. The on-body injector is applied on the day of chemotherapy and delivers the dose approximately 27 hours later, removing a return clinic visit.',
      safetyProfile:
        'Fatal splenic rupture, acute respiratory distress syndrome, serious allergic reactions including anaphylaxis, fatal sickle cell crises, glomerulonephritis, capillary leak syndrome, thrombocytopenia, leucocytosis, cutaneous vasculitis and aortitis are labelled risks. The label requires monitoring for myelodysplastic syndrome and acute myeloid leukaemia in breast and lung cancer patients receiving it with chemotherapy or radiotherapy.',
    },
    commonQuestions: [
      {
        q: 'Why does one injection work as well as fourteen?',
        a: 'Because the polymer chain changes how the drug is removed, not how it works. Kidney filtration is blocked, so the only clearance route left is the neutrophils it creates. While your count is low there is nothing to remove it and it keeps working; as your count recovers, the new cells clear it. The dosing is regulated by the disease state itself.',
      },
      {
        q: 'Is the on-body injector as reliable as an injection in clinic?',
        a: 'The label does not claim it is. Section 5.12 exists specifically to tell patients to report a suspected device failure so a replacement dose can be considered. If a device fails silently at the wrong point in the cycle, the patient goes through the nadir unprotected.',
        auditNote:
          'A convenience feature that added a documented failure mode is worth stating plainly rather than as a footnote.',
      },
      {
        q: 'Does pegfilgrastim work better than filgrastim?',
        a: 'On the endpoints measured, no: 1.8 versus 1.6 days of grade 4 neutropenia. It works the same and is given once. The advantage is adherence and burden, which is genuinely valuable, and it is a different thing from being a more effective drug.',
      },
      {
        q: 'How can a drug be approved for radiation exposure without human trials?',
        a: 'Through the FDA Animal Rule, which permits approval on well-controlled animal efficacy studies when human trials would be unethical or infeasible. It is a deliberate, transparent regulatory mechanism. It is also, by design, an indication where the human efficacy evidence is zero.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether once-per-cycle dosing changes any hard outcome relative to daily filgrastim. The registration programme tested equivalence on a laboratory surrogate against an active comparator. Twenty years on, no trial has compared the two on survival.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Vogel CL et al. First and subsequent cycle use of pegfilgrastim prevents febrile neutropenia in patients with breast cancer: a multicenter, double-blind, placebo-controlled phase III study. J Clin Oncol 2005;23:1178-1184',
        identifier: '10.1200/JCO.2005.09.102',
        kind: 'doi',
      },
      {
        label:
          'Green MD et al. A randomized double-blind multicenter phase III study of fixed-dose single-administration pegfilgrastim versus daily filgrastim in patients receiving myelosuppressive chemotherapy. Ann Oncol 2003;14:29-35',
        identifier: '10.1093/annonc/mdg019',
        kind: 'doi',
      },
      {
        label:
          'Kubista E et al. Bone pain associated with once-per-cycle pegfilgrastim is similar to daily filgrastim in patients with breast cancer. Clin Breast Cancer 2003;3:391-398',
        identifier: '10.3816/CBC.2003.n.003',
        kind: 'doi',
      },
      {
        label: 'NEULASTA (pegfilgrastim) injection — US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=fdfe5d72-6b80-435a-afa4-c5d74dd852ce',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: NEULASTA, BLA 125031, original approval 31 January 2002',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125031',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: FULPHILA (pegfilgrastim-jmdb), BLA 761075, approved 4 June 2018',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761075',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: UDENYCA (pegfilgrastim-cbqv), BLA 761039, approved 2 November 2018',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761039',
        kind: 'regulatory',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 6. Somatropin
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'somatropin',
    name: 'Somatropin',
    tradeName: 'Humatrope',
    sponsor: 'Eli Lilly and Company (Humatrope); many manufacturers market somatropin products',
    targetGene: 'GHR',
    targetProtein: 'Growth hormone receptor (GHR)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1986,
    indication:
      'Growth failure due to inadequate endogenous growth hormone secretion, Turner syndrome, small for gestational age with no catch-up growth, idiopathic short stature, SHOX deficiency, and adult growth hormone deficiency',
    patientFriendlyIndication: 'Children who are not growing normally, and adults with a damaged pituitary gland',
    anatomicalSite: 'Growth plate chondrocytes and hepatocytes',
    conditionContext: {
      conditionExplainer:
        'Growth hormone is released in pulses from the pituitary gland overnight. Most of what it does to bones it does indirectly, by telling the liver to release IGF-1, which then acts on the growth plates at the ends of the long bones. When the pituitary is damaged or absent, that whole cascade stops.',
      whyItMatters:
        'A child with true growth hormone deficiency will not reach anything close to their genetic height without replacement, and in adults untreated deficiency changes body composition, bone density and lipid profile. Where the deficiency is real, replacement is replacement.',
      whoTakesThis:
        'Children with proven growth hormone deficiency, Turner syndrome, Prader-Willi syndrome, chronic kidney disease, SHOX deficiency, small-for-gestational-age without catch-up, and — since 2003 in the US — idiopathic short stature, which is short stature with no identified cause and no hormone deficiency at all.',
      clinicalGoals:
        'In deficiency, restore normal growth velocity and adult height. In idiopathic short stature, the goal is height itself, which is why that indication is where the evidence questions concentrate.',
    },
    oneSentenceVerdict:
      'A recombinant copy of the 191-amino-acid pituitary hormone that replaced cadaveric pituitary extract after that route killed 226 people with Creutzfeldt-Jakob disease; in children with idiopathic short stature and no hormone deficiency, the randomised adult height gain is about 4 cm.',
    laymanHowItWorks:
      'Growth hormone does not push on bone directly. It travels to the liver and tells it to release a second messenger called IGF-1, and that is what makes the cartilage at the ends of a child bones divide and lay down new bone. Somatropin is a manufactured copy of the human hormone, made in bacteria, with exactly the same 191 building blocks in the same order. It restarts a signal that is missing, or amplifies one that is already normal.',
    auditConfidence: 'Inference Overreach Found',
    confidenceScore: 70,
    substitutes: {
      summary:
        'In genuine growth hormone deficiency there is no substitute: this is hormone replacement and nothing else does it. In idiopathic short stature the honest alternatives are watchful waiting, or an aromatase inhibitor or GnRH analogue to delay growth plate fusion, and both are used off-label with weaker evidence than somatropin has. Nothing dietary increases adult height in a well-nourished child; optimising nutrition matters only where it was inadequate.',
      conventionalRx: [
        {
          name: 'Recombinant IGF-1 (mecasermin)',
          class: 'Insulin-like growth factor 1 replacement',
          howItCompares:
            'Supplies the downstream mediator directly. Used where growth hormone cannot work because the receptor is defective, as in severe primary IGF-1 deficiency and Laron syndrome.',
          typicalCost: 'Substantially above somatropin per year of treatment',
          prosAndCons:
            'Pros: bypasses a broken receptor, which somatropin cannot. Cons: causes hypoglycaemia because IGF-1 has intrinsic insulin-like activity, so it must be given with food.',
        },
        {
          name: 'Long-acting somatropin (somapacitan, lonapegsomatropin, somatrogon)',
          class: 'Half-life-extended growth hormone',
          howItCompares:
            'Weekly rather than daily injection, registered against daily somatropin on annualised height velocity.',
          typicalCost: 'Comparable to or above daily somatropin',
          prosAndCons:
            'Pros: 52 injections a year rather than 365, which matters for a child. Cons: registered on the same one-year growth velocity surrogate, so nothing new is known about adult height.',
        },
        {
          name: 'Aromatase inhibitors and GnRH analogues',
          class: 'Growth plate fusion delay',
          howItCompares:
            'Slow the oestrogen-driven closure of the growth plates rather than accelerating growth, buying more years of growing time.',
          typicalCost: 'Variable; both are used off-label for this purpose',
          prosAndCons:
            'Pros: a different lever on the same outcome. Cons: off-label, less evidence than somatropin, and bone density concerns with prolonged use.',
        },
        {
          name: 'Watchful waiting',
          class: 'No pharmacological intervention',
          howItCompares:
            'The comparator arm in the randomised idiopathic short stature trials. Adult height was 3 to 4 cm lower on average, with no measured difference in psychosocial outcomes.',
          typicalCost: 'No drug cost',
          prosAndCons:
            'Pros: no daily injection for years of childhood, no cost, no adverse events. Cons: the height difference is real and measurable, even if modest.',
        },
      ],
      naturalFoods: [
        {
          name: 'Adequate dietary protein and total energy',
          activeCompound: 'Essential amino acids and total caloric sufficiency',
          biologicalMechanism:
            'Undernutrition causes acquired growth hormone resistance: circulating growth hormone rises while hepatic IGF-1 falls. Correcting intake restores IGF-1 generation. This matters only where intake was actually inadequate.',
          evidenceStrength: 'High Clinical Proof',
          dailyUsage: 'Age-appropriate protein and energy intake as assessed by a paediatric dietitian',
          monthlyCost: 'No additional cost',
        },
        {
          name: 'Vitamin D and calcium sufficiency',
          activeCompound: 'Cholecalciferol and dietary calcium',
          biologicalMechanism:
            'Deficiency causes rickets, which deforms the growth plate directly. Sufficiency does not accelerate growth beyond normal; it removes an obstacle rather than adding a push.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Age-appropriate intake per national paediatric guidance',
          monthlyCost: '$3 - $10 / month',
        },
      ],
      homeRemedies: [
        {
          name: 'Protected sleep',
          action: 'Age-appropriate sleep duration with a consistent bedtime.',
          patientImpact:
            'The majority of endogenous growth hormone is released in pulses during slow-wave sleep. Chronic sleep restriction blunts that pattern.',
          clinicalPrecaution:
            'This is normal physiology, not a treatment. It will not produce catch-up growth in a child with true deficiency, and delaying diagnosis to try it costs growing years that cannot be recovered.',
        },
        {
          name: 'Serial height measurement on a growth chart',
          action: 'Accurate stadiometer height plotted on a centile chart at consistent intervals.',
          patientImpact:
            'Growth velocity crossing centiles downwards is the single most informative early finding in paediatric endocrinology, and it is free. It distinguishes a short but normally growing child from one with a developing pathology.',
          clinicalPrecaution:
            'Measurement technique matters more than frequency. Casual measurements against a door frame produce enough noise to hide a real deceleration.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'FPTIPLSRLFDNAMLRAHRLHQLAFDTYQEFEEAYIPKEQKYSFLQNPQTSLCFSESIPTPSNREETQQKSNLELLRISLLLIQSWLEPVQFLRSVFANSLVYGASDSNVYDLLKDLEEGIQTLMGRLEDGSPRTGQIFKQTYSKFDTNSHNDDALLKNYGLLYCFRKDMDKVETFLRIVQCRSVEGSCGF',
      molecularWeight: 'Approximately 22,125 Da',
      targetReceptorAffinity:
        'One hormone molecule engages two growth hormone receptor chains through two structurally distinct binding sites',
      structureSource: {
        label:
          'HUMATROPE US prescribing information (Description: 191 amino acid residues, molecular weight about 22,125 daltons, sequence identical to pituitary human GH) cross-checked against UniProt P01241',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a774e1ae-3997-49ee-8b0e-99a2b315d409',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'sm-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Host strain and plasmid release',
          description:
            'Verify the E. coli working cell bank carrying the human GH1 coding sequence with a secretion leader. Sequence confirmation matters more here than in most products because a single residue difference from pituitary growth hormone would change the immunogenicity profile.',
          reagentsAndBuffer: 'Plasmid sequencing, selective plating, sterility and bacteriophage panels',
        },
        {
          id: 'sm-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Periplasmic secretion fermentation',
          description:
            'Express growth hormone with a signal peptide that directs it to the periplasm, where the oxidising environment forms both disulfide bonds and the signal peptidase removes the leader, giving the authentic N-terminal phenylalanine without an extra methionine.',
          reagentsAndBuffer:
            'Defined glucose-mineral salts medium, IPTG induction, osmotic shock periplasmic release buffer with EDTA and sucrose',
          dependsOnStepId: 'sm-1',
        },
        {
          id: 'sm-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Anion exchange, hydrophobic interaction and size exclusion',
          description:
            'Purify to remove deamidated and oxidised variants, N-terminally clipped species and dimers. Charge variants are the main product-related impurity of this molecule and are what the isoelectric focusing release assay tracks.',
          reagentsAndBuffer:
            'Q-Sepharose in 20 mM Tris pH 8.0 with sodium chloride gradient, phenyl-Sepharose with ammonium sulfate, Superdex 75 in ammonium bicarbonate',
          dependsOnStepId: 'sm-2',
        },
        {
          id: 'sm-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Lyophilisation into the cartridge presentation',
          description:
            'Freeze-dry with glycine and mannitol as bulking and stabilising agents into the multi-dose cartridge, and pair it with a metacresol-preserved diluent. The product is oxygen sensitive, which drives the packaging design.',
          reagentsAndBuffer:
            'Dibasic sodium phosphate, glycine, mannitol, diluent of water for injection with 0.3% metacresol and glycerin',
          dependsOnStepId: 'sm-3',
        },
        {
          id: 'sm-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Receptor-mediated potency and charge-variant release testing',
          description:
            'Determine potency in a growth hormone receptor reporter cell assay against the WHO international standard, and characterise deamidation and oxidation variants by isoelectric focusing and reversed-phase HPLC.',
          reagentsAndBuffer:
            'GH receptor-STAT5 luciferase reporter cell line, WHO somatropin international standard, IEF gels, RP-HPLC with C4 column',
          dependsOnStepId: 'sm-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'sm-a1',
        category: 'failed',
        title: 'The predecessor killed 226 people, which is why this molecule exists',
        laymanSummary:
          'Before recombinant growth hormone, the drug was extracted from pituitary glands taken from cadavers. Some of those donors had Creutzfeldt-Jakob disease, and the extraction did not remove the prion.',
        technicalDetails:
          'The final assessment of iatrogenic Creutzfeldt-Jakob disease identifies contaminated cadaveric growth hormone as the source of 226 cases worldwide, alongside 228 from dura mater grafts. Incubation periods ran to decades. Cadaveric pituitary growth hormone programmes were halted in 1985 and recombinant somatropin replaced them. This is the clearest case in modern medicine of a manufacturing route, rather than a molecule, being the hazard.',
        evidenceSource: 'Brown P et al. Iatrogenic Creutzfeldt-Jakob disease, final assessment. Emerg Infect Dis 2012;18:901-907',
        doi: '10.3201/eid1806.120116',
        measuredMetric: '226 cases of iatrogenic Creutzfeldt-Jakob disease attributed to cadaveric growth hormone',
        auditFlag: 'verified',
      },
      {
        id: 'sm-a2',
        category: 'measured',
        title: 'Idiopathic short stature: 3.7 cm of adult height in the randomised trial',
        laymanSummary:
          'In the only placebo-controlled trial that followed children to adult height, treated children ended up about 3.7 cm taller. The trial started with 68 children and had adult heights for 33.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled trial in 68 children aged 9 to 16 with height or predicted height at or below -2.5 standard deviation score and no growth hormone deficiency. Growth hormone 0.074 mg/kg subcutaneously three times weekly until near adult height, mean treatment duration 4.4 years. Adult height data were available for 33 patients. Adult height was -1.81 SDS on treatment versus -2.32 SDS on placebo, a difference of 0.51 SDS or 3.7 cm (p < 0.02; 95% CI 0.10-0.92 SDS). Modified intent-to-treat analysis in 62 patients treated at least six months gave 0.52 SDS, 3.8 cm.',
        evidenceSource: 'Leschek EW et al. J Clin Endocrinol Metab 2004;89:3140-3148',
        doi: '10.1210/jc.2003-031457',
        measuredMetric: 'Adult height difference 0.51 SDS, 3.7 cm (95% CI 0.10-0.92 SDS), n = 33 with adult height data',
        auditFlag: 'verified',
      },
      {
        id: 'sm-a3',
        category: 'measured',
        title: 'Systematic review: about 4 cm, and the authors call it less than in licensed conditions',
        laymanSummary:
          'Pooling the randomised evidence gives a height gain of roughly 4 cm, and the review authors note that this is smaller than what growth hormone achieves in the conditions it was originally licensed for.',
        technicalDetails:
          'Systematic review of randomised and non-randomised controlled trials from 1985 to April 2010 with adult height measurements. Three randomised trials with 115 children met inclusion criteria: adult height of treated children exceeded controls by 0.65 SDS, about 4 cm. Mean height gain was 1.2 SDS in treated versus 0.34 SDS in untreated children. Seven non-randomised trials gave 0.45 SDS, about 3 cm. The difference between two dose regimens was about 1.2 cm. The authors state the magnitude of effectiveness is on average less than that achieved in other licensed conditions and that individual response is highly variable.',
        evidenceSource: 'Deodati A, Cianfarani S. BMJ 2011;342:c7157',
        doi: '10.1136/bmj.c7157',
        measuredMetric: 'Adult height gain 0.65 SDS (about 4 cm) across three randomised trials, 115 children',
        auditFlag: 'verified',
      },
      {
        id: 'sm-a4',
        category: 'inferred',
        title: 'The psychosocial justification for treating short stature was never demonstrated',
        laymanSummary:
          'The reason usually given for treating a healthy short child is that being short is distressing. The trials measured centimetres. They did not show that treated children end up happier.',
        technicalDetails:
          'The US idiopathic short stature indication was granted on 25 July 2003 as an efficacy supplement to BLA 019640, on the basis of height outcomes. The randomised evidence base summarised in the 2011 systematic review consists of adult height in standard deviation scores; quality-of-life and psychosocial outcomes are not among the pooled endpoints, and the review does not report them. Treating a healthy child with daily injections for several years on the assumption that height gain produces psychological benefit is an inference, and it is the central one in this indication.',
        evidenceSource:
          'Drugs@FDA BLA 019640, efficacy supplement 33 approved 25 July 2003; Deodati A, Cianfarani S. BMJ 2011;342:c7157',
        doi: '10.1136/bmj.c7157',
        inferredClaim:
          'That gaining 3 to 4 cm of adult height improves psychosocial wellbeing in a child who has no hormone deficiency',
        auditFlag: 'caution',
      },
      {
        id: 'sm-a5',
        category: 'failed',
        title: 'The anti-ageing use has been tested and does not work',
        laymanSummary:
          'Eighteen randomised study populations, 220 people who received growth hormone. Body fat fell about 2 kg and lean mass rose about 2 kg. Bone density did not change, and side effects rose.',
        technicalDetails:
          'Systematic review of randomised controlled trials of growth hormone in healthy elderly people, mean age 69, mean BMI 28. Fat mass changed by -2.1 kg (95% CI -2.8 to -1.35) and lean body mass by +2.1 kg (95% CI 1.3 to 2.9), both p < 0.001, with no significant change in weight (0.1 kg, p = 0.87). Total cholesterol fell 0.29 mmol/L but not significantly after adjustment for body composition. Bone density and other lipids did not change. Treated participants were significantly more likely to develop soft tissue oedema, arthralgias, carpal tunnel syndrome and gynaecomastia, and somewhat more likely to develop diabetes and impaired fasting glucose. The authors concluded growth hormone cannot be recommended as an anti-ageing therapy.',
        evidenceSource: 'Liu H et al. Ann Intern Med 2007;146:104-115',
        doi: '10.7326/0003-4819-146-2-200701160-00005',
        inferredClaim:
          'That the body composition changes reported by Rudman in 1990 in 12 men represent rejuvenation',
        auditFlag: 'verified',
      },
      {
        id: 'sm-a6',
        category: 'measured',
        title: 'Long-term mortality tracks the underlying diagnosis, not the drug',
        laymanSummary:
          'A European cohort of 24,232 children treated with growth hormone, followed for over 400,000 person-years, found no increase in overall death rates in those treated for isolated deficiency or idiopathic short stature.',
        technicalDetails:
          'SAGhE cohort study across eight European countries. In low-risk patients with isolated growth hormone deficiency or idiopathic short stature, all-cause mortality standardised mortality ratio was 1.1 (95% CI 0.9-1.3). In children born small for gestational age it was 1.5 (95% CI 1.1-1.9), driven by the French subcohort. In moderate- and high-risk underlying diagnoses it was 3.8 and 17.1 respectively, reflecting the underlying disease. Mortality was not associated with mean daily or cumulative growth hormone dose in any risk group. Mortality from circulatory and haematological disease was increased across all risk groups, which the authors flag as needing continued surveillance.',
        evidenceSource: 'Sävendahl L et al. Lancet Diabetes Endocrinol 2020;8:683-692',
        doi: '10.1016/S2213-8587(20)30163-7',
        measuredMetric: 'Standardised mortality ratio 1.1 (95% CI 0.9-1.3) in low-risk treated patients over 400,000 person-years',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Daily subcutaneous injection',
        laymanDesc:
          'Given as an injection under the skin, usually in the evening, every day for years. Weekly long-acting versions now exist.',
        molecularDetail:
          'Subcutaneous administration gives a peak at three to five hours and a serum half-life of two to three hours, but the biological effect long outlasts the pharmacokinetics because the mediator is IGF-1, which has a half-life of roughly half a day when bound to its acid-labile subunit complex.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'One hormone molecule grips two receptors',
        laymanDesc:
          'On the surface of liver and cartilage cells, a single hormone molecule clamps two receptor chains together using two different-shaped faces.',
        molecularDetail:
          'Growth hormone has two structurally distinct receptor-binding sites of very different affinity. Site 1 binds first, site 2 recruits a second GHR chain, and the resulting asymmetric 1:2 complex rotates the preformed receptor dimer rather than assembling it de novo. Excess hormone occupies site 1 on separate receptors and blocks dimerisation, which is why the dose-response curve is bell-shaped.',
        iconName: 'Combine',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'JAK2-STAT5B switches on IGF-1 transcription in the liver',
        laymanDesc:
          'The receptor sends a signal into the liver cell nucleus telling it to start producing the second messenger, IGF-1.',
        molecularDetail:
          'Receptor rotation activates the constitutively associated JAK2, phosphorylating GHR cytoplasmic tyrosines and recruiting STAT5B, which dimerises, enters the nucleus and drives IGF1 and IGFALS transcription. Loss-of-function STAT5B mutations produce growth hormone insensitivity with normal or high growth hormone and low IGF-1, which is the human experiment confirming this step.',
        iconName: 'Dna',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'IGF-1 circulates in a stabilising complex',
        laymanDesc:
          'The liver releases IGF-1 into the blood, wrapped in carrier proteins that stop it being cleared or acting where it should not.',
        molecularDetail:
          'IGF-1 is carried in a ternary complex with IGFBP-3 and the acid-labile subunit, which extends its half-life from minutes to roughly 12 to 15 hours and restricts capillary escape. This is why serum IGF-1 rather than growth hormone is the practical monitoring assay.',
        iconName: 'Shield',
        visualStage: 'cellular_entry',
      },
      {
        step: 5,
        title: 'Growth plate chondrocytes divide and lay down bone',
        laymanDesc:
          'At the growing ends of the long bones, cartilage cells multiply, enlarge and are replaced by bone, and the bone gets longer.',
        molecularDetail:
          'IGF-1 acts on IGF1R in the proliferative and hypertrophic zones of the epiphyseal growth plate, driving chondrocyte proliferation and hypertrophy followed by endochondral ossification. Growth hormone also acts directly on resting-zone chondrocytes, so the endocrine and paracrine routes are additive.',
        iconName: 'Bone',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Height gained, until the plates fuse',
        laymanDesc:
          'The result is faster growth for as long as the growth plates remain open. Once oestrogen closes them at the end of puberty, no amount of the drug adds height.',
        molecularDetail:
          'Oestrogen-driven epiphyseal fusion is an absolute ceiling on this mechanism, which is why the therapeutic window is childhood and why treatment started late gains less. In idiopathic short stature the randomised adult height gain is 0.51 to 0.65 SDS, roughly 3.7 to 4 cm.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Leschek 2004 idiopathic short stature trial (predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 68,
        primaryEndpoint: 'Adult height standard deviation score versus placebo',
        endpointMet: true,
        statisticalPValue: 'p < 0.02 (0.51 SDS, 3.7 cm; 95% CI 0.10-0.92 SDS)',
        unreportedAdverseSignals:
          'Adult height was available for only 33 of the 68 randomised children, which is a substantial attrition for the primary endpoint and is rarely quoted alongside the 3.7 cm figure.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'Deodati and Cianfarani 2011 systematic review (3 pooled randomised trials)',
        phase: 'Systematic review of controlled trials',
        sampleSize: 115,
        primaryEndpoint: 'Adult height standard deviation score',
        endpointMet: true,
        statisticalPValue: 'Adult height 0.65 SDS above controls (about 4 cm)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Liu 2007 healthy elderly systematic review (18 study populations)',
        phase: 'Systematic review of randomised trials',
        sampleSize: 220,
        primaryEndpoint: 'Body composition, bone density and adverse events in healthy elderly adults',
        endpointMet: false,
        statisticalPValue: 'p < 0.001 for body composition change; no change in bone density; excess adverse events',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Idiopathic short stature: adult height 0.51 SDS (3.7 cm) above placebo in the randomised trial',
        'Pooled randomised evidence: 0.65 SDS, about 4 cm, across 115 children',
        'Healthy elderly adults: fat mass -2.1 kg, lean mass +2.1 kg, no change in bone density, more adverse events',
        'SAGhE cohort: standardised mortality ratio 1.1 in low-risk treated patients across 400,000 person-years',
      ],
      unsupportedInferences: [
        'That 3 to 4 cm of adult height improves psychosocial outcomes in a child with no hormone deficiency',
        'That the body composition changes in Rudman 1990 represent reversal of ageing',
        'That growth hormone response in idiopathic short stature is predictable in an individual child; the review calls individual response highly variable',
      ],
      whatFailedInitially: [
        'Cadaveric pituitary growth hormone caused 226 cases of iatrogenic Creutzfeldt-Jakob disease and was abandoned in 1985',
        'Anti-ageing use was tested in randomised trials and produced adverse events without benefit; the authors recommended against it',
      ],
      realWorldOutcome: [
        'Recombinant somatropin removed prion transmission risk entirely and made supply effectively unlimited',
        'The 2003 US idiopathic short stature approval extended treatment to children with no measurable hormone abnormality, and that indication remains the most contested part of this drug use',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection, lyophilised powder in multi-dose cartridges reconstituted with preserved diluent',
      description:
        'Sterile lyophilised powder reconstituted to approximately pH 7.5 and injected daily, typically in the evening to approximate the natural nocturnal pulse. The product is oxygen sensitive, which shapes the cartridge and diluent design.',
      safetyProfile:
        'Not for patients with acute critical illness, active malignancy, active proliferative diabetic retinopathy, or in Prader-Willi syndrome with severe obesity or severe respiratory impairment, where deaths have been reported. Intracranial hypertension, slipped capital femoral epiphysis, scoliosis progression, glucose intolerance, hypothyroidism and fluid retention are labelled risks.',
    },
    commonQuestions: [
      {
        q: 'Will growth hormone make a short but healthy child tall?',
        a: 'It will make them about 3 to 4 cm taller as an adult, on average, after several years of daily injections. It will not move a child from short to tall. Whether that gain is worth the treatment is a value judgement, and the trials do not answer it because they measured centimetres and not wellbeing.',
        auditNote:
          'Leschek 2004 (doi:10.1210/jc.2003-031457) and the 2011 BMJ systematic review (doi:10.1136/bmj.c7157) are the two randomised sources for this number.',
      },
      {
        q: 'Is it the same as the anti-ageing growth hormone sold online?',
        a: 'The molecule is the same. The evidence is not. In healthy elderly adults, randomised trials found about 2 kg of fat traded for 2 kg of lean mass, no change in bone density, and significantly more oedema, joint pain, carpal tunnel syndrome and gynaecomastia. The systematic review concluded it cannot be recommended as an anti-ageing therapy. Distribution for that purpose is illegal in the United States.',
      },
      {
        q: 'Why was it made from cadavers before, and what happened?',
        a: 'There was no other source. Human growth hormone is species-specific, so animal hormone does not work, and the only supply was pituitary glands collected at autopsy. Some donors had undiagnosed Creutzfeldt-Jakob disease and the purification did not remove the prion. 226 people worldwide died as a result, some decades later. Recombinant production ended that risk entirely.',
      },
      {
        q: 'Does it cause cancer?',
        a: 'The SAGhE cohort of 24,232 treated children found no increase in all-cause mortality in those treated for isolated deficiency or idiopathic short stature, and no relationship between dose and mortality. Circulatory and haematological cause-specific mortality was raised across risk groups, and the authors call for continued surveillance. The label contraindicates use in active malignancy.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether treating idiopathic short stature changes anything a person cares about as an adult besides height. No randomised trial has followed treated and untreated children into adulthood measuring employment, relationships, mental health or self-esteem. The indication rests on an assumption that has been in place since 2003 and has never been tested.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Leschek EW et al. Effect of growth hormone treatment on adult height in peripubertal children with idiopathic short stature: a randomized, double-blind, placebo-controlled trial. J Clin Endocrinol Metab 2004;89:3140-3148',
        identifier: '10.1210/jc.2003-031457',
        kind: 'doi',
      },
      {
        label:
          'Deodati A, Cianfarani S. Impact of growth hormone therapy on adult height of children with idiopathic short stature: systematic review. BMJ 2011;342:c7157',
        identifier: '10.1136/bmj.c7157',
        kind: 'doi',
      },
      {
        label: 'Liu H et al. Systematic review: the safety and efficacy of growth hormone in the healthy elderly. Ann Intern Med 2007;146:104-115',
        identifier: '10.7326/0003-4819-146-2-200701160-00005',
        kind: 'doi',
      },
      {
        label: 'Rudman D et al. Effects of human growth hormone in men over 60 years old. N Engl J Med 1990;323:1-6',
        identifier: '10.1056/NEJM199007053230101',
        kind: 'doi',
      },
      {
        label: 'Brown P et al. Iatrogenic Creutzfeldt-Jakob disease, final assessment. Emerg Infect Dis 2012;18:901-907',
        identifier: '10.3201/eid1806.120116',
        kind: 'doi',
      },
      {
        label: 'Sävendahl L et al. Long-term mortality after childhood growth hormone treatment: the SAGhE cohort study. Lancet Diabetes Endocrinol 2020;8:683-692',
        identifier: '10.1016/S2213-8587(20)30163-7',
        kind: 'doi',
      },
      {
        label: 'HUMATROPE (somatropin) for injection — US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a774e1ae-3997-49ee-8b0e-99a2b315d409',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: HUMATROPE, BLA 019640, original approval 16 October 1986; efficacy supplement 33 (idiopathic short stature) approved 25 July 2003',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=019640',
        kind: 'regulatory',
      },
      {
        label: 'UniProt P01241 — human somatotropin, mature 191-residue chain',
        identifier: 'https://rest.uniprot.org/uniprotkb/P01241',
        kind: 'url',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 7. Etanercept
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'etanercept',
    name: 'Etanercept',
    tradeName: 'Enbrel',
    sponsor: 'Immunex, now Amgen; Pfizer outside the United States and Canada',
    targetGene: 'TNF',
    targetProtein: 'Tumour necrosis factor alpha (TNF-alpha) and lymphotoxin alpha',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1998,
    indication:
      'Rheumatoid arthritis, polyarticular juvenile idiopathic arthritis, psoriatic arthritis, ankylosing spondylitis and plaque psoriasis',
    patientFriendlyIndication: 'Rheumatoid arthritis, psoriasis and related long-term inflammatory diseases',
    anatomicalSite: 'Extracellular fluid, inflamed synovium and skin',
    conditionContext: {
      conditionExplainer:
        'TNF-alpha is a short-range alarm signal. Immune cells release it to call other cells to a site of infection. In rheumatoid arthritis and psoriasis that alarm keeps sounding in tissue where there is no infection, and the cells that answer it destroy cartilage, bone and skin.',
      whyItMatters:
        'Joint erosion in rheumatoid arthritis happens early and does not reverse. The measured value of a TNF blocker is not just less pain; it is joints that never deform, quantified on serial radiographs with the modified Sharp score.',
      whoTakesThis:
        'Adults and children with moderate to severe inflammatory arthritis or psoriasis that methotrexate or another conventional agent has not controlled.',
      clinicalGoals:
        'Reach low disease activity or remission and halt radiographic progression, while keeping the patient off long-term corticosteroids.',
    },
    oneSentenceVerdict:
      'A dimeric decoy receptor built from the p75 TNF receptor fused to an antibody Fc tail, which soaks up TNF before cells see it; 59% of patients reached an ACR20 response at six months against 11% on placebo, and the same molecule increased mortality when it was tried in septic shock.',
    laymanHowItWorks:
      'Your cells listen for TNF using a receptor on their surface. Etanercept is that receptor, cut off the cell and glued to the tail end of an antibody so it stays in the blood instead of being cleared in minutes. It floats around as a decoy: TNF binds it and is taken out of circulation before it reaches a real cell. Nothing is being blocked or destroyed. The signal is simply being intercepted.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 89,
    substitutes: {
      summary:
        'Methotrexate remains the anchor drug and costs a few dollars a month; the trial that made this class standard of care showed that methotrexate plus etanercept beat either alone. Anti-TNF monoclonal antibodies work where etanercept does not, which is a genuine mechanistic difference. No food or supplement has been shown to stop radiographic joint erosion.',
      conventionalRx: [
        {
          name: 'Methotrexate',
          class: 'Conventional synthetic DMARD (antifolate)',
          howItCompares:
            'The comparator in TEMPO. Etanercept alone beat methotrexate alone on ACR-N area under the curve and on joint damage, and the combination beat both.',
          typicalCost: '$15 - $40 / month (generic oral tablets)',
          prosAndCons:
            'Pros: decades of outcome data, low cost, combines with every biologic. Cons: nausea, mouth ulcers, requires liver and blood monitoring, contraindicated in pregnancy.',
        },
        {
          name: 'Adalimumab and infliximab',
          class: 'Anti-TNF monoclonal antibodies',
          howItCompares:
            'Comparable in rheumatoid arthritis. Unlike etanercept they work in Crohn disease and ulcerative colitis, where etanercept failed a randomised trial outright.',
          typicalCost: 'Approximately $40,000 - $90,000 / year US list, considerably lower for biosimilars',
          prosAndCons:
            'Pros: effective across inflammatory bowel disease as well as arthritis. Cons: higher rates of antibody formation against the drug, and infliximab requires infusion.',
        },
        {
          name: 'Etanercept biosimilars (Erelzi, Eticovo)',
          class: 'Biosimilar TNFR-Fc fusion protein',
          howItCompares:
            'Same molecule. Erelzi was approved on 30 August 2016 and Eticovo on 25 April 2019, and neither has launched in the United States because of patent litigation.',
          typicalCost: 'Available in Europe at substantial discounts; not marketed in the US',
          prosAndCons:
            'Pros: approved and available elsewhere at lower cost. Cons: a US patient cannot buy them, which is a legal fact rather than a clinical one.',
        },
        {
          name: 'JAK inhibitors and IL-17 or IL-23 blockers',
          class: 'Oral kinase inhibitors and alternative cytokine blockade',
          howItCompares:
            'Different targets in the same inflammatory network. IL-17 and IL-23 blockade outperforms TNF blockade in plaque psoriasis; JAK inhibitors give an oral route.',
          typicalCost: 'Broadly comparable to anti-TNF list prices',
          prosAndCons:
            'Pros: options after TNF failure, and better skin clearance for psoriasis. Cons: JAK inhibitors carry a boxed warning for mortality, malignancy, major cardiovascular events and thrombosis.',
        },
      ],
      naturalFoods: [
        {
          name: 'Marine omega-3 fatty acids (EPA and DHA)',
          activeCompound: 'Eicosapentaenoic and docosahexaenoic acid',
          biologicalMechanism:
            'Displace arachidonic acid in membrane phospholipids, shifting eicosanoid production toward less inflammatory 3-series prostaglandins and generating resolvins. Measured effects are on joint tenderness and NSAID use, not on radiographic erosion.',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: '2 - 3 g combined EPA and DHA daily from oily fish or supplements',
          monthlyCost: '$15 - $35 / month',
        },
        {
          name: 'Mediterranean dietary pattern',
          activeCompound: 'Polyphenols, monounsaturated fat, dietary fibre',
          biologicalMechanism:
            'Associated with lower circulating CRP and IL-6 in observational and some interventional studies. Acts on the inflammatory background rather than on the TNF axis specifically.',
          evidenceStrength: 'Supportive',
          dailyUsage: 'Whole dietary pattern rather than a single component',
          monthlyCost: 'No additional cost, and often lower',
        },
      ],
      homeRemedies: [
        {
          name: 'Tuberculosis screening before starting, and vigilance during',
          action: 'Have latent tuberculosis testing completed before the first dose and know the symptoms to report.',
          patientImpact:
            'TNF is required to hold tuberculosis granulomas together. Blocking it reactivates latent infection, often in disseminated or extrapulmonary form that is easy to miss.',
          clinicalPrecaution:
            'This is a boxed warning, not general advice. Testing before treatment and monitoring during it is required even if the initial test was negative.',
        },
        {
          name: 'Cold chain discipline for the pen',
          action: 'Keep prefilled syringes refrigerated and do not use a pen that has been frozen or left warm.',
          patientImpact:
            'Fusion proteins aggregate when temperature-abused. Aggregates are the leading suspect in immunogenicity, and an aggregated dose is both less effective and more likely to provoke antibodies.',
          clinicalPrecaution:
            'Room-temperature excursions have defined limits in the patient instructions. Follow the number in the leaflet rather than a guess.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      molecularWeight: 'Approximately 150 kDa; 934 amino acids across the dimer',
      targetReceptorAffinity:
        'Binds soluble TNF-alpha and lymphotoxin alpha as a dimeric decoy; the two receptor arms give avidity a monomeric receptor does not have',
      structureSource: {
        label:
          'ENBREL US prescribing information (Description: dimeric fusion protein of the extracellular ligand-binding portion of the human p75 TNF receptor linked to the Fc portion of human IgG1, 934 amino acids, apparent molecular weight approximately 150 kilodaltons)',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a002b40c-097d-47a5-957f-7a7b1807af7f',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'et-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'CHO cell bank and glycosylation baseline',
          description:
            'Release the Chinese hamster ovary working cell bank expressing the TNFR2-Fc fusion. Etanercept carries both N- and O-linked glycans across the receptor and hinge regions, and the glycan profile is fixed at the cell line and process level rather than corrected downstream.',
          reagentsAndBuffer:
            'Gene copy qPCR, viral safety panels, pilot-scale glycan map by HILIC-UPLC as the comparability baseline',
        },
        {
          id: 'et-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Fed-batch mammalian bioreactor expression',
          description:
            'Express the secreted fusion protein in fed-batch culture. Dimerisation occurs intracellularly through the IgG1 hinge disulfides; the fraction of correctly assembled dimer versus misassembled and clipped species is a process attribute that must be controlled here rather than purified later.',
          reagentsAndBuffer:
            'Chemically defined serum-free medium, glucose and amino acid feeds, controlled dissolved oxygen and pH, harvest by depth filtration',
          dependsOnStepId: 'et-1',
        },
        {
          id: 'et-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Protein A capture with viral clearance',
          description:
            'Capture on Protein A through the IgG1 Fc, then perform a low-pH viral inactivation hold and nanofiltration. The Fc is included in the molecule partly to make exactly this purification platform available.',
          reagentsAndBuffer:
            'Protein A resin, citrate elution at pH 3.5, low-pH hold, 20 nm virus filter',
          dependsOnStepId: 'et-2',
        },
        {
          id: 'et-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Polishing chromatography and arginine formulation',
          description:
            'Remove aggregate, clipped and misfolded species by ion exchange and hydrophobic interaction, then formulate at pH 6.3 with L-arginine and sucrose, which are present specifically to suppress aggregation of this notoriously aggregation-prone fusion.',
          reagentsAndBuffer:
            '25 mM L-arginine hydrochloride, 120 mM sodium chloride, 1% sucrose, final pH 6.3 plus or minus 0.2',
          dependsOnStepId: 'et-3',
        },
        {
          id: 'et-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'TNF neutralisation bioassay and aggregate release testing',
          description:
            'Quantify potency by inhibition of TNF-induced cytotoxicity in a TNF-sensitive cell line, and release on aggregate content by size-exclusion chromatography with multi-angle light scattering.',
          reagentsAndBuffer:
            'L929 or WEHI-13VAR TNF-sensitive cell line with actinomycin D, recombinant human TNF-alpha, SEC-MALS in phosphate-buffered saline',
          dependsOnStepId: 'et-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'et-a1',
        category: 'measured',
        title: 'Registration trial: 59% ACR20 at six months against 11% on placebo',
        laymanSummary:
          'In 234 people whose rheumatoid arthritis had not responded to conventional drugs, roughly six in ten improved by at least 20% on the standard composite measure, against about one in ten on placebo.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled trial with blinded joint assessors across 13 North American centres. Twice-weekly subcutaneous etanercept 10 mg or 25 mg or placebo for six months. At three months 62% of the 25 mg group versus 23% of placebo achieved ACR20 (p < 0.001). At six months 59% versus 11% achieved ACR20 (p < 0.001) and 40% versus 5% achieved ACR50 (p < 0.01). Mean reduction in tender and swollen joint counts at six months was 56% and 47% on 25 mg versus 6% and -7% on placebo.',
        evidenceSource: 'Moreland LW et al. Ann Intern Med 1999;130:478-486',
        doi: '10.7326/0003-4819-130-6-199903160-00004',
        measuredMetric: 'ACR20 at six months 59% versus 11% (p < 0.001); ACR50 40% versus 5%',
        auditFlag: 'verified',
      },
      {
        id: 'et-a2',
        category: 'measured',
        title: 'TEMPO: joint damage stopped and partially reversed on combination therapy',
        laymanSummary:
          'In 682 patients followed for a year with serial X-rays, the combination of etanercept and methotrexate did not merely slow joint destruction. The average damage score went slightly backwards.',
        technicalDetails:
          'Double-blind randomised trial of etanercept 25 mg twice weekly, oral methotrexate up to 20 mg weekly, or the combination. Primary efficacy endpoint ACR-N area under the curve over 24 weeks: 18.3%-years for combination versus 14.7% for etanercept alone (p < 0.0001) and 12.2% for methotrexate alone (p < 0.0001). Primary radiographic endpoint, change in modified Sharp score to week 52: -0.54 (95% CI -1.00 to -0.07) for combination, 0.52 for etanercept alone and 2.80 for methotrexate alone. Infection and adverse event rates were similar across groups.',
        evidenceSource: 'Klareskog L et al. Lancet 2004;363:675-681',
        doi: '10.1016/S0140-6736(04)15640-7',
        measuredMetric: 'Modified Sharp score change at 52 weeks: -0.54 combination versus +2.80 methotrexate alone',
        auditFlag: 'verified',
      },
      {
        id: 'et-a3',
        category: 'failed',
        title: 'In septic shock the same molecule killed people, dose-dependently',
        laymanSummary:
          'TNF blockade was tried first in sepsis, where TNF is the central mediator. Mortality rose with dose: 30% on placebo, 48% on the middle dose, 53% on the high dose.',
        technicalDetails:
          'Randomised, double-blind, placebo-controlled multicentre trial of a single intravenous infusion of TNFR:Fc at 0.15, 0.45 or 1.5 mg/kg in 141 patients with septic shock. Primary endpoint all-cause 28-day mortality. Deaths: 10 of 33 on placebo (30%), 9 of 30 on low dose (30%), 14 of 29 on middle dose (48%) and 26 of 49 on high dose (53%); p = 0.02 for the dose-response relation. Baseline severity differences did not account for the excess. The paper concluded that higher doses appear to be associated with increased mortality.',
        evidenceSource: 'Fisher CJ Jr et al. N Engl J Med 1996;334:1697-1702',
        doi: '10.1056/NEJM199606273342603',
        inferredClaim:
          'That because TNF drives the pathology of septic shock, neutralising TNF will improve survival in septic shock',
        auditFlag: 'verified',
      },
      {
        id: 'et-a4',
        category: 'failed',
        title: 'Two heart failure trials were stopped early for futility',
        laymanSummary:
          'TNF is elevated in heart failure, so blocking it looked promising. Two trials totalling over 2,000 patients were stopped early because there was no benefit.',
        technicalDetails:
          'RECOVER randomised 1,123 patients with NYHA class II to IV heart failure and ejection fraction 0.30 or below to placebo or etanercept 25 mg weekly or twice weekly. RENAISSANCE randomised 925 patients to placebo or etanercept 25 mg twice or three times weekly. Both were terminated prematurely on prespecified stopping rules for lack of benefit. Etanercept had no effect on clinical status in RENAISSANCE (p = 0.17) or RECOVER (p = 0.34). The prespecified pooled analysis, RENEWAL, gave a relative risk of 1.1 (95% CI 0.91-1.33, p = 0.33) for death or heart failure hospitalisation.',
        evidenceSource: 'Mann DL et al. Circulation 2004;109:1594-1602',
        doi: '10.1161/01.CIR.0000124490.27666.B2',
        inferredClaim:
          'That elevated TNF in heart failure is causal and therefore a treatable target',
        auditFlag: 'verified',
      },
      {
        id: 'et-a5',
        category: 'failed',
        title: 'It does not work in Crohn disease, and the antibodies do',
        laymanSummary:
          'A trial in 43 people with active Crohn disease found 39% responded to etanercept and 45% to placebo. Anti-TNF antibodies work well in the same disease. Blocking TNF is not one thing.',
        technicalDetails:
          'Eight-week randomised, double-blind, placebo-controlled trial of subcutaneous etanercept 25 mg twice weekly in 43 patients with moderate to severe Crohn disease. Clinical response at week 4, defined as a fall of at least 70 points in the Crohn Disease Activity Index or an index below 150, occurred in 39% of etanercept patients versus 45% of placebo patients (p = 0.763). Adverse event rates were similar. Infliximab and adalimumab, which are anti-TNF monoclonal antibodies, are effective in the same disease. The mechanistic candidates for the difference include binding to transmembrane TNF and induction of apoptosis in lamina propria T cells, neither of which etanercept does the way an antibody does.',
        evidenceSource: 'Sandborn WJ et al. Gastroenterology 2001;121:1088-1094',
        doi: '10.1053/gast.2001.28674',
        inferredClaim:
          'That drugs described as TNF blockers are interchangeable because they share a target',
        auditFlag: 'verified',
      },
      {
        id: 'et-a6',
        category: 'conclusion_shift',
        title: 'Approved biosimilars that no US patient can buy',
        laymanSummary:
          'Two etanercept biosimilars have been approved by the FDA, one in 2016 and one in 2019. Neither has launched in the United States, because of patents on a drug first approved in 1998.',
        technicalDetails:
          'Erelzi (etanercept-szzs, BLA 761042) was approved 30 August 2016 and Eticovo (etanercept-ykro, BLA 761066) on 25 April 2019. Neither is marketed in the United States. Etanercept biosimilars have been available in Europe since 2016. The gap between regulatory approval and patient access here is a legal artefact and not a scientific one, and it is the clearest illustration in this modality group that biosimilar approval and biosimilar availability are different events.',
        evidenceSource: 'Drugs@FDA, BLA 761042 (Erelzi) and BLA 761066 (Eticovo)',
        measuredMetric: 'Two US biosimilar approvals, 2016 and 2019; zero US launches',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Injected under the skin, once or twice a week',
        laymanDesc:
          'A subcutaneous injection from a prefilled syringe, autoinjector or reusable device, typically 50 mg once a week.',
        molecularDetail:
          'Subcutaneous bioavailability is roughly 60% with a terminal half-life of about 70 to 100 hours, considerably shorter than an IgG monoclonal antibody because the fusion protein engages FcRn recycling less efficiently.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The Fc tail keeps it in circulation',
        laymanDesc:
          'The antibody tail is not there to attack anything. It is there so the molecule lasts days instead of minutes.',
        molecularDetail:
          'The IgG1 CH2 and CH3 domains plus hinge, without CH1, provide FcRn-mediated recycling from the endosome and force dimerisation. Omitting CH1 removes the light chain requirement and the assembly problem that would come with it.',
        iconName: 'Shield',
        visualStage: 'delivery',
      },
      {
        step: 3,
        title: 'Two receptor arms capture TNF trimers',
        laymanDesc:
          'Each molecule carries two copies of the natural TNF receptor, so it grips the signal much more tightly than a single loose receptor could.',
        molecularDetail:
          'TNF-alpha is a homotrimer with three receptor-binding grooves. The dimeric decoy engages more than one groove, giving an avidity gain of orders of magnitude over the monomeric soluble p75 receptor. Etanercept also binds lymphotoxin alpha, which the anti-TNF antibodies do not.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Bound TNF never reaches a cell',
        laymanDesc:
          'Captured TNF cannot dock onto a real receptor on a real cell, so the alarm signal is never received.',
        molecularDetail:
          'Competitive sequestration of soluble TNF prevents engagement of TNFR1 and TNFR2 on synoviocytes, endothelium and leucocytes. Etanercept binds transmembrane TNF less stably than an anti-TNF antibody and does not induce reverse signalling or apoptosis in mucosal T cells, which is the leading explanation for its failure in Crohn disease.',
        iconName: 'ShieldOff',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'The inflammatory cascade downstream shuts down',
        laymanDesc:
          'Without the TNF signal, the cells stop calling in reinforcements and stop producing the enzymes that dissolve cartilage.',
        molecularDetail:
          'NF-kB activation falls in synovial fibroblasts and macrophages, reducing IL-1, IL-6, GM-CSF, matrix metalloproteinase and adhesion molecule expression, and lowering RANKL-driven osteoclast activation at the bone-pannus interface.',
        iconName: 'Lock',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Symptoms fall, and erosion stops on the X-ray',
        laymanDesc:
          'Joints hurt and swell less within weeks. On serial X-rays over a year, the structural damage stops advancing and on combination therapy it went slightly backwards.',
        molecularDetail:
          'ACR20 response 59% versus 11% at six months against placebo. Modified Sharp score change at 52 weeks was -0.54 for etanercept plus methotrexate against +2.80 for methotrexate alone, meaning the combination arm ended the year with slightly less measured damage than it started with.',
        iconName: 'Bone',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Moreland 1999 registration trial (predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 234,
        primaryEndpoint: 'ACR20 and ACR50 response at three and six months',
        endpointMet: true,
        statisticalPValue: 'p < 0.001 (ACR20 59% versus 11% at six months)',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'TEMPO (Klareskog 2004)',
        phase: 'Phase 3',
        sampleSize: 686,
        primaryEndpoint: 'ACR-N area under the curve over 24 weeks and modified Sharp score change at 52 weeks',
        endpointMet: true,
        statisticalPValue: 'p < 0.0001 for combination versus each monotherapy',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Soluble TNF Receptor Sepsis Study (Fisher 1996)',
        phase: 'Phase 2',
        sampleSize: 141,
        primaryEndpoint: 'All-cause mortality at 28 days in septic shock',
        endpointMet: false,
        statisticalPValue: 'p = 0.02 for a dose-response relation in the direction of harm',
        unreportedAdverseSignals:
          'Mortality rose monotonically with dose: 30%, 30%, 48%, 53%. This trial is rarely cited in materials about the marketed product.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'RENEWAL, pooling RECOVER and RENAISSANCE (Mann 2004)',
        phase: 'Phase 3',
        sampleSize: 2048,
        primaryEndpoint: 'Death or hospitalisation for chronic heart failure',
        endpointMet: false,
        statisticalPValue: 'p = 0.33 (relative risk 1.1, 95% CI 0.91-1.33); both trials stopped early for futility',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Sandborn 2001 Crohn disease trial',
        phase: 'Phase 2',
        sampleSize: 43,
        primaryEndpoint: 'Clinical response at week 4 by Crohn Disease Activity Index',
        endpointMet: false,
        statisticalPValue: 'p = 0.763 (39% etanercept versus 45% placebo)',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'ACR20 at six months: 59% on etanercept 25 mg versus 11% on placebo',
        'Modified Sharp score at 52 weeks: -0.54 on etanercept plus methotrexate versus +2.80 on methotrexate alone',
        'Septic shock 28-day mortality rose with dose: 30%, 30%, 48%, 53% (p = 0.02 for dose-response)',
        'Crohn disease clinical response: 39% on etanercept versus 45% on placebo',
      ],
      unsupportedInferences: [
        'That neutralising a cytokine that is elevated in a disease will treat that disease — sepsis and heart failure both falsified this',
        'That TNF blockers are interchangeable; etanercept fails in inflammatory bowel disease where the antibodies work',
        'That an approved biosimilar means an available biosimilar; two have been approved in the US and neither is sold there',
      ],
      whatFailedInitially: [
        'Septic shock, where higher doses were associated with higher mortality',
        'Chronic heart failure, where RECOVER and RENAISSANCE were both stopped early for futility',
        'Crohn disease, where a randomised trial found it no better than placebo',
      ],
      realWorldOutcome: [
        'TNF blockade changed the natural history of rheumatoid arthritis: joint deformity that used to be routine became avoidable',
        'Serious infection and tuberculosis reactivation became a permanent management burden of the class, carried in a boxed warning',
      ],
    },
    deliverySystem: {
      type: 'Subcutaneous injection: prefilled syringe, autoinjector, single-dose vial, or cartridge with a reusable autoinjector',
      description:
        'Clear, colourless, preservative-free solution formulated at pH 6.3 with L-arginine, sodium chloride and sucrose. A lyophilised multiple-dose vial presentation exists and is reconstituted with bacteriostatic water containing benzyl alcohol, which is why that presentation is not for neonates.',
      safetyProfile:
        'Boxed warning for serious infections, including tuberculosis, bacterial sepsis and invasive fungal infection, and for lymphoma and other malignancies in children and adolescents. Latent tuberculosis testing is required before starting. Demyelinating disease, new or worsening heart failure, cytopenias and lupus-like syndromes are labelled risks.',
    },
    commonQuestions: [
      {
        q: 'If etanercept and adalimumab both block TNF, why does only one work in Crohn disease?',
        a: 'Because blocking TNF is not one action. An antibody binds the membrane-bound form of TNF stably enough to trigger apoptosis in gut T cells and to signal backwards into the cell carrying it. A decoy receptor mostly mops up the soluble form. In rheumatoid arthritis that difference does not matter; in the bowel it does. A randomised trial found etanercept no better than placebo in Crohn disease.',
        auditNote:
          'This is one of the cleanest demonstrations in pharmacology that shared target does not mean shared effect.',
      },
      {
        q: 'Why did the same molecule kill people in sepsis?',
        a: 'TNF is a defence signal as well as a damage signal. In septic shock the body needs it to contain the infection. Removing it in a controlled autoimmune setting is useful; removing it while bacteria are multiplying is not. Mortality rose with dose in the sepsis trial, and that finding is the reason the boxed warning about serious infection is on the label at all.',
      },
      {
        q: 'Why can I not buy a cheaper biosimilar in the United States?',
        a: 'Two have been approved by the FDA, in 2016 and 2019, and neither has been launched because of patent litigation over a product first approved in 1998. Etanercept biosimilars are available in Europe. This is a legal outcome and not a scientific one, and it is worth knowing that the barrier is not safety.',
      },
      {
        q: 'Does it stop joint damage or just relieve pain?',
        a: 'Both, and the joint damage part is measured directly. In TEMPO the change in the modified Sharp radiographic score over 52 weeks was -0.54 for etanercept plus methotrexate against +2.80 for methotrexate alone. Negative means the average measured damage was slightly lower after a year than before it.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether etanercept differs from the anti-TNF antibodies on long-term mortality or serious infection in a head-to-head randomised trial. Choices between agents in this class are made on registry data, indication coverage and price, not on randomised comparisons that were never run.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'Moreland LW et al. Etanercept therapy in rheumatoid arthritis. A randomized, controlled trial. Ann Intern Med 1999;130:478-486',
        identifier: '10.7326/0003-4819-130-6-199903160-00004',
        kind: 'doi',
      },
      {
        label:
          'Klareskog L et al. Therapeutic effect of the combination of etanercept and methotrexate compared with each treatment alone in patients with rheumatoid arthritis (TEMPO). Lancet 2004;363:675-681',
        identifier: '10.1016/S0140-6736(04)15640-7',
        kind: 'doi',
      },
      {
        label:
          'Fisher CJ Jr et al. Treatment of septic shock with the tumor necrosis factor receptor:Fc fusion protein. N Engl J Med 1996;334:1697-1702',
        identifier: '10.1056/NEJM199606273342603',
        kind: 'doi',
      },
      {
        label:
          'Mann DL et al. Targeted anticytokine therapy in patients with chronic heart failure: results of the Randomized Etanercept Worldwide Evaluation (RENEWAL). Circulation 2004;109:1594-1602',
        identifier: '10.1161/01.CIR.0000124490.27666.B2',
        kind: 'doi',
      },
      {
        label: 'Sandborn WJ et al. Etanercept for active Crohn disease: a randomized, double-blind, placebo-controlled trial. Gastroenterology 2001;121:1088-1094',
        identifier: '10.1053/gast.2001.28674',
        kind: 'doi',
      },
      {
        label: 'ENBREL (etanercept) injection — US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a002b40c-097d-47a5-957f-7a7b1807af7f',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ENBREL, BLA 103795, original approval 2 November 1998',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=103795',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ERELZI (etanercept-szzs), BLA 761042, approved 30 August 2016',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761042',
        kind: 'regulatory',
      },
      {
        label: 'Drugs@FDA: ETICOVO (etanercept-ykro), BLA 761066, approved 25 April 2019',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=761066',
        kind: 'regulatory',
      },
    ],
  },

  // ---------------------------------------------------------------------------------------------
  // 8. Alteplase
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'alteplase',
    name: 'Alteplase',
    tradeName: 'Activase / Cathflo Activase',
    sponsor: 'Genentech',
    targetGene: 'PLG',
    targetProtein: 'Plasminogen (converted to plasmin at the fibrin surface)',
    modality: 'Recombinant Protein / Biologic',
    approvalStatus: 'FDA Approved',
    approvalYear: 1987,
    indication:
      'Acute ischaemic stroke, acute ST-elevation myocardial infarction, acute massive pulmonary embolism, and restoration of function to central venous access devices',
    patientFriendlyIndication: 'Emergency clot-dissolving treatment for stroke, heart attack and major pulmonary embolism',
    anatomicalSite: 'The fibrin surface of an occluding thrombus within the arterial circulation',
    conditionContext: {
      conditionExplainer:
        'An ischaemic stroke is a clot blocking an artery in the brain. Downstream of the block, brain tissue has minutes to hours before it dies. Around the dead core sits a penumbra of tissue that is not working but is still alive, and that penumbra is what a clot-dissolving drug is trying to save.',
      whyItMatters:
        'Roughly two million neurons are lost per minute in a large-vessel stroke. This is the only common medical emergency where the treatment window is measured in minutes and where the difference between arriving at 90 minutes and at 270 minutes changes the odds of independent living.',
      whoTakesThis:
        'Patients with disabling ischaemic stroke presenting within 4.5 hours of a known onset time, after haemorrhage has been excluded on imaging, and who meet a long exclusion list built around bleeding risk.',
      clinicalGoals:
        'Reopen the artery early enough that the penumbra survives, accepting a measured and quantified increase in fatal brain haemorrhage as the price.',
    },
    oneSentenceVerdict:
      'A recombinant copy of the human enzyme that activates clot dissolution only where fibrin is present; in the trial that made it standard of care it raised the odds of minimal or no disability at three months by 70%, while increasing symptomatic intracerebral haemorrhage from 0.6% to 6.4% and leaving mortality unchanged.',
    laymanHowItWorks:
      'Your blood carries an inactive enzyme called plasminogen everywhere, all the time. Something has to switch it on, and the natural switch is a protein released by the lining of blood vessels. Alteplase is a copy of that switch. Crucially, it only works properly when it is sitting on fibrin, the mesh that holds a clot together, so it activates dissolution mostly at the clot rather than everywhere in the bloodstream at once. That selectivity is partial, not absolute, which is why bleeding is the main risk.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 76,
    substitutes: {
      summary:
        'This is an emergency drug and there is no dietary or lifestyle alternative to it during a stroke. The real alternatives are tenecteplase, which is now non-inferior and simpler to give, mechanical clot retrieval for large-vessel occlusion, and aspirin plus supportive care where thrombolysis is contraindicated. The single most valuable non-drug action is recognising a stroke fast enough to be eligible at all.',
      conventionalRx: [
        {
          name: 'Tenecteplase',
          class: 'Genetically modified tissue plasminogen activator',
          howItCompares:
            'Three amino acid substitutions give longer half-life, greater fibrin specificity and resistance to PAI-1, so it is given as a single bolus rather than a bolus plus a 60-minute infusion. Non-inferior to alteplase in a 1,600-patient pragmatic randomised trial.',
          typicalCost: 'Broadly comparable to alteplase per treated patient',
          prosAndCons:
            'Pros: one push instead of an hour-long infusion, which matters enormously during transfer for thrombectomy. Cons: non-inferiority is not superiority, and the safety profile is very similar.',
        },
        {
          name: 'Mechanical thrombectomy',
          class: 'Endovascular clot retrieval',
          howItCompares:
            'Physically removes a large-vessel clot. Effect sizes in large-vessel occlusion are far larger than thrombolysis achieves, and the two are often used together.',
          typicalCost: 'Procedure cost far above any drug cost; restricted to comprehensive stroke centres',
          prosAndCons:
            'Pros: the largest measured benefit in acute stroke care. Cons: needs a catheter laboratory, an interventionalist and a large-vessel occlusion, so it is unavailable to most stroke patients worldwide.',
        },
        {
          name: 'Streptokinase',
          class: 'Bacterial plasminogen activator',
          howItCompares:
            'The comparator alteplase beat in GUSTO-I for myocardial infarction, by 0.9 to 1.1 absolute percentage points of 30-day mortality. Not used in stroke, where it caused excess harm in earlier trials.',
          typicalCost: 'A small fraction of alteplase cost where still marketed',
          prosAndCons:
            'Pros: cheap, and still used for myocardial infarction in some health systems. Cons: antigenic, cannot be repeated, and not an option in stroke.',
        },
        {
          name: 'Aspirin and supportive stroke unit care',
          class: 'Antiplatelet therapy and organised care',
          howItCompares:
            'What patients receive when thrombolysis is contraindicated or the window has closed. Organised stroke unit care has one of the largest and most robust effect sizes in the whole field.',
          typicalCost: 'Pennies per dose for aspirin',
          prosAndCons:
            'Pros: available everywhere, very low risk, benefits every stroke patient. Cons: does not reopen the artery.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Recognising stroke and calling emergency services immediately',
          action:
            'Face drooping, arm weakness, speech difficulty: call an ambulance at once and note the exact time the symptoms started.',
          patientImpact:
            'Benefit falls steeply with delay. In the pooled individual-patient meta-analysis, treatment within 3 hours gave a good outcome in 32.9% versus 23.1% of controls (odds ratio 1.75), while treatment beyond 4.5 hours gave 32.6% versus 30.6% (odds ratio 1.15, confidence interval crossing 1).',
          clinicalPrecaution:
            'Do not drive the person yourself and do not wait to see if it improves. The last known well time is the single most consequential piece of information the hospital will ask for.',
        },
        {
          name: 'Keeping an accurate, current medication list',
          action: 'Carry an up-to-date list of anticoagulants and recent surgery or bleeding history.',
          patientImpact:
            'Most thrombolysis exclusions are about bleeding risk. Ambiguity about whether someone is on an anticoagulant can cost the treatment window while it is resolved.',
          clinicalPrecaution:
            'This is preparation, not treatment. It changes eligibility, not outcome, and only if it is available when the ambulance arrives.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'peptide_sequence',
      sequence5to3:
        'SYQVICRDEKTQMIYQQHQSWLRPVLRSNRVEYCWCNSGRAQCHSVPVKSCSEPRCFNGGTCQQALYFSDFVCQCPEGFAGKCCEIDTRATCYEDQGISYRGTWSTAESGAECTNWNSSALAQKPYSGRRPDAIRLGLGNHNYCRNPDRDSKPWCYVFKAGKYSSEFCSTPACSEGNSDCYFGNGSAYRGTHSLTESGASCLPWNSMILIGKVYTAQNPSAQALGLGKHNYCRNPDGDAKPWCHVLKNRRLTWEYCDVPSCSTCGLRQYSQPQFRIKGGLFADIASHPWQAAIFAKHRRSPGERFLCGGILISSCWILSAAHCFQERFPPHHLTVILGRTYRVVPGEEEQKFEVEKYIVHKEFDDDTYDNDIALLQLKSDSSRCAQESSVVRTVCLPPADLQLPDWTECELSGYGKHEALSPFYSERLKEAHVRLYPSSRCTSQHLLNRTVTDNMLCAGDTRSGGPQANLHDACQGDSGGPLVCLNDGRMTLVGIISWGLGCGQKDVPGVYTKVTNYLDWIRDNMRP',
      targetReceptorAffinity:
        'Catalytic efficiency for plasminogen activation rises by orders of magnitude in the presence of fibrin, which is the entire basis of its clot selectivity',
      structureSource: {
        label:
          'ACTIVASE US prescribing information (Description: sterile purified glycoprotein of 527 amino acids) with the mature 527-residue chain sequence from UniProt P00750',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=91ecdef2-95ff-42dd-a31c-c8a09cab3ad9',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'al-1',
          stepNumber: 1,
          phase: 'QC',
          name: 'CHO cell bank release and glycoform baseline',
          description:
            'Release the Chinese hamster ovary working cell bank carrying the human t-PA cDNA. Alteplase carries three N-glycosylation sites of which one is variably occupied, producing type I and type II glycoforms with different clearance, so the glycoform ratio is a controlled attribute from the cell bank onwards.',
          reagentsAndBuffer:
            'Gene copy qPCR, adventitious agent panels, pilot-scale glycoform ratio by RP-HPLC and mass spectrometry',
        },
        {
          id: 'al-2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Mammalian cell culture expression of secreted single-chain t-PA',
          description:
            'Express secreted t-PA in fed-batch or perfusion culture. Culture conditions determine the single-chain to two-chain ratio, which matters because plasmin cleavage at Arg275 converts the molecule to the two-chain form with different fibrin dependence.',
          reagentsAndBuffer:
            'Chemically defined serum-free medium, controlled dissolved oxygen and pH, protease inhibitors in the harvest to limit uncontrolled single-chain conversion',
          dependsOnStepId: 'al-1',
        },
        {
          id: 'al-3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Lysine affinity capture and orthogonal viral clearance',
          description:
            'Capture through the kringle domains on immobilised lysine, exploiting the same lysine-binding sites the molecule uses to dock onto fibrin, then polish and run dedicated viral inactivation and nanofiltration steps.',
          reagentsAndBuffer:
            'Lysine-Sepharose with epsilon-aminocaproic acid elution, hydrophobic interaction polish, low-pH hold, 20 nm virus filter',
          dependsOnStepId: 'al-2',
        },
        {
          id: 'al-4',
          stepNumber: 4,
          phase: 'Purification',
          name: 'Arginine formulation and lyophilisation',
          description:
            'Formulate with a large excess of L-arginine and lyophilise. The 100 mg vial contains 3.5 g of L-arginine; without it the protein is effectively insoluble at therapeutic concentration, which is why the excipient outweighs the drug by 35 to 1.',
          reagentsAndBuffer:
            'L-arginine 3.5 g per 100 mg vial, phosphoric acid, polysorbate 80 10 mg, lyophilisation under vacuum',
          dependsOnStepId: 'al-3',
        },
        {
          id: 'al-5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Fibrin-dependent clot lysis potency assay',
          description:
            'Determine biological potency in International Units by an in vitro clot lysis assay, as the label specifies. A 100 mg vial is 58 million IU. The assay must be run in the presence of fibrin, because activity without fibrin is not the property being sold.',
          reagentsAndBuffer:
            'Human fibrinogen and thrombin clot matrix, Glu-plasminogen, WHO t-PA international standard, turbidimetric lysis time readout',
          dependsOnStepId: 'al-4',
        },
      ],
    },
    keyAudits: [
      {
        id: 'al-a1',
        category: 'measured',
        title: 'NINDS: 30% more likely to have minimal or no disability at three months',
        laymanSummary:
          'The trial that made this drug standard of care in stroke showed better function at three months, at the cost of a tenfold increase in dangerous brain bleeding, and with no change in the death rate.',
        technicalDetails:
          'Two-part randomised, double-blind trial of intravenous t-PA within three hours of stroke onset, 291 patients in part 1 and 333 in part 2. In part 1 there was no significant difference in neurological improvement at 24 hours. In part 2 the global odds ratio for a favourable outcome at three months was 1.7 (95% CI 1.2-2.6); patients were at least 30% more likely to have minimal or no disability across four assessment scales. Symptomatic intracerebral haemorrhage within 36 hours occurred in 6.4% of t-PA patients versus 0.6% of placebo patients (p < 0.001). Mortality at three months was 17% versus 21% (p = 0.30).',
        evidenceSource: 'The NINDS rt-PA Stroke Study Group. N Engl J Med 1995;333:1581-1587',
        doi: '10.1056/NEJM199512143332401',
        measuredMetric: 'Global odds ratio 1.7 (95% CI 1.2-2.6) for favourable outcome; symptomatic ICH 6.4% versus 0.6%',
        auditFlag: 'verified',
      },
      {
        id: 'al-a2',
        category: 'measured',
        title: 'ECASS III extended the window to 4.5 hours, with a smaller effect',
        laymanSummary:
          'Treating between three and four and a half hours still helped, but the margin was narrower: 52.4% versus 45.2% with little or no disability, and the confidence interval nearly touched no effect.',
        technicalDetails:
          'Randomised, double-blind trial in 821 patients treated between 3 and 4.5 hours after onset, median administration time 3 hours 59 minutes. Favourable outcome, modified Rankin 0 or 1 at 90 days, in 52.4% versus 45.2%; odds ratio 1.34 (95% CI 1.02-1.76), p = 0.04. Global outcome analysis odds ratio 1.28 (95% CI 1.00-1.65), p < 0.05. Any intracranial haemorrhage 27.0% versus 17.6% (p = 0.001), symptomatic 2.4% versus 0.2% (p = 0.008). Mortality 7.7% versus 8.4% (p = 0.68).',
        evidenceSource: 'Hacke W et al. N Engl J Med 2008;359:1317-1329',
        doi: '10.1056/NEJMoa0804656',
        measuredMetric: 'Modified Rankin 0-1 at 90 days: 52.4% versus 45.2%, odds ratio 1.34 (95% CI 1.02-1.76), p = 0.04',
        auditFlag: 'verified',
      },
      {
        id: 'al-a3',
        category: 'inferred',
        title: 'It improves function, and it does not save lives',
        laymanSummary:
          'Pooling 6,756 patients from nine randomised trials, alteplase increased disability-free survival by about 10 percentage points and increased fatal brain haemorrhage sevenfold. Overall death at 90 days was slightly higher, not lower.',
        technicalDetails:
          'Prespecified individual-patient-data meta-analysis of nine completed randomised phase 3 trials. Good outcome, modified Rankin 0 or 1, with treatment within 3 hours: 32.9% versus 23.1% (odds ratio 1.75, 95% CI 1.35-2.27); 3 to 4.5 hours: 35.3% versus 30.1% (odds ratio 1.26); beyond 4.5 hours: 32.6% versus 30.6% (odds ratio 1.15, 95% CI 0.95-1.40). Symptomatic intracranial haemorrhage 6.8% versus 1.3% (odds ratio 5.55) and fatal intracranial haemorrhage within seven days 2.7% versus 0.4% (odds ratio 7.14, p < 0.0001). Mortality at 90 days was 17.9% versus 16.5%, hazard ratio 1.11 (95% CI 0.99-1.25), p = 0.07.',
        evidenceSource: 'Emberson J et al. Lancet 2014;384:1929-1935',
        doi: '10.1016/S0140-6736(14)60584-5',
        inferredClaim: 'That a treatment which improves function in stroke also reduces death from stroke',
        auditFlag: 'verified',
      },
      {
        id: 'al-a4',
        category: 'failed',
        title: 'IST-3 missed its primary endpoint and the debate never fully closed',
        laymanSummary:
          'The largest single stroke thrombolysis trial ever run enrolled 3,035 patients, over half of them older than 80. Its primary endpoint was not met, though a secondary analysis of the same data was positive.',
        technicalDetails:
          'International, multicentre, randomised, open-treatment trial of rt-PA within 6 hours. At six months 554 of 1,515 (37%) in the rt-PA group versus 534 of 1,520 (35%) in the control group were alive and independent, adjusted odds ratio 1.13 (95% CI 0.95-1.35), p = 0.181, a non-significant absolute increase of 14 per 1,000. A prespecified ordinal analysis of the same outcome scale was positive, common odds ratio 1.27 (95% CI 1.10-1.47, p = 0.001). Fatal or non-fatal symptomatic intracranial haemorrhage within seven days occurred in 7% versus 1%, adjusted odds ratio 6.94, an absolute excess of 58 per 1,000. Deaths within seven days were higher with rt-PA (11% versus 7%, p = 0.001), and by six months total deaths were equal. A published graphical reanalysis of the earlier NINDS data had already argued that baseline stroke severity imbalance made that trial result less secure than usually presented.',
        evidenceSource:
          'IST-3 collaborative group. Lancet 2012;379:2352-2363; Hoffman JR, Schriger DL. Ann Emerg Med 2009;54:329-336',
        doi: '10.1016/S0140-6736(12)60768-5',
        measuredMetric: 'Primary endpoint adjusted odds ratio 1.13 (95% CI 0.95-1.35), p = 0.181',
        auditFlag: 'contested',
      },
      {
        id: 'al-a5',
        category: 'measured',
        title: 'In heart attack, the benefit over streptokinase was one life per hundred treated',
        laymanSummary:
          'The 41,021-patient trial that established alteplase in myocardial infarction found 30-day mortality of 6.3% against 7.2% and 7.4% for streptokinase, alongside a small excess of bleeding strokes.',
        technicalDetails:
          'GUSTO-I randomised 41,021 patients across 1,081 hospitals in 15 countries to four thrombolytic strategies. 30-day mortality was 7.2% for streptokinase plus subcutaneous heparin, 7.4% for streptokinase plus intravenous heparin, 6.3% for accelerated t-PA plus intravenous heparin, and 7.0% for the combination. Accelerated t-PA gave a 14% relative mortality reduction versus streptokinase alone (95% CI 5.9-21.3, p = 0.001). Haemorrhagic stroke rates were 0.49%, 0.54%, 0.72% and 0.94%, a significant excess for accelerated t-PA (p = 0.03). The composite of death or disabling stroke was 6.9% versus 7.8% (p = 0.006).',
        evidenceSource: 'The GUSTO Investigators. N Engl J Med 1993;329:673-682',
        doi: '10.1056/NEJM199309023291001',
        measuredMetric: '30-day mortality 6.3% versus 7.2-7.4%; absolute benefit approximately 1 per 100 treated',
        auditFlag: 'verified',
      },
      {
        id: 'al-a6',
        category: 'conclusion_shift',
        title: 'Tenecteplase is displacing it, on a non-inferiority result',
        laymanSummary:
          'A pragmatic Canadian trial in 1,600 patients showed a single-push alternative works as well. Practice has moved, and the reason is workflow rather than a better outcome.',
        technicalDetails:
          'The AcT trial randomised 1,600 patients across 22 Canadian stroke centres to tenecteplase 0.25 mg/kg as a single bolus or alteplase 0.9 mg/kg as bolus plus 60-minute infusion. Modified Rankin 0-1 at 90-120 days occurred in 296 of 802 (36.9%) versus 266 of 765 (34.8%); unadjusted risk difference 2.1% (95% CI -2.6 to 6.9), meeting the prespecified non-inferiority threshold of -5%. Symptomatic intracerebral haemorrhage at 24 hours was 3.4% versus 3.2% and 90-day mortality 15.3% versus 15.4%. The practical advantage is that a bolus can be given before or during transfer for thrombectomy, where a 60-minute infusion cannot.',
        evidenceSource: 'Menon BK et al. Lancet 2022;400:161-169',
        doi: '10.1016/S0140-6736(22)01054-6',
        measuredMetric: 'Risk difference 2.1% (95% CI -2.6 to 6.9), non-inferiority threshold -5% met',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Given intravenously, against the clock',
        laymanDesc:
          'A bolus followed by an hour-long infusion into a vein, started as soon as a brain scan has ruled out bleeding.',
        molecularDetail:
          'Plasma half-life is under five minutes because hepatic clearance through the mannose receptor and low-density lipoprotein receptor-related protein is rapid, which is why an infusion rather than a single injection is required.',
        iconName: 'Timer',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Kringle domains dock onto the clot surface',
        laymanDesc:
          'Loop-shaped regions of the molecule recognise the fibrin mesh of the clot and stick to it, concentrating the drug where the clot is.',
        molecularDetail:
          'The finger domain and kringle 2 bind lysine residues exposed on the fibrin surface. This is the same interaction exploited in manufacturing, where lysine-Sepharose is the capture resin.',
        iconName: 'Target',
        visualStage: 'target_binding',
      },
      {
        step: 3,
        title: 'Fibrin acts as a template that switches the enzyme on',
        laymanDesc:
          'On its own the enzyme is sluggish. Sitting on fibrin next to its substrate, it becomes hundreds of times more active. That is what keeps most of the effect at the clot.',
        molecularDetail:
          'Fibrin forms a ternary template that co-localises alteplase and plasminogen and raises catalytic efficiency by two to three orders of magnitude. The selectivity is relative, not absolute: circulating plasminogen is still activated, producing a systemic lytic state that is the source of extracranial bleeding.',
        iconName: 'Zap',
        visualStage: 'catalytic_action',
      },
      {
        step: 4,
        title: 'Plasminogen is cleaved to plasmin',
        laymanDesc:
          'The enzyme makes a single cut that converts the inactive precursor into plasmin, the protein-cutting enzyme that actually dissolves clots.',
        molecularDetail:
          'The serine protease domain cleaves the Arg561-Val562 bond of plasminogen, generating the two-chain active plasmin. Alpha-2-antiplasmin neutralises free plasmin within seconds in the circulation but cannot reach plasmin bound within the fibrin network, which is a second layer of localisation.',
        iconName: 'Scissors',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Plasmin cuts the fibrin mesh apart',
        laymanDesc:
          'Plasmin chews through the fibrin scaffold holding the clot together, and the clot breaks up.',
        molecularDetail:
          'Plasmin hydrolyses fibrin at multiple sites, releasing D-dimer and other degradation products and destabilising the thrombus until flow is restored. It also degrades fibrinogen, factor V and factor VIII, which is the systemic coagulopathy component.',
        iconName: 'Waves',
        visualStage: 'catalytic_action',
      },
      {
        step: 6,
        title: 'Perfusion restored, penumbra saved, and a real risk of bleeding',
        laymanDesc:
          'If the artery reopens in time, the at-risk brain tissue survives and the person has less disability. Around one in fifteen patients has a serious bleed into the brain instead.',
        molecularDetail:
          'Reperfusion of the penumbra before infarction completes is the mechanism of benefit. The mechanism of harm is bleeding into already ischaemic tissue with a disrupted blood-brain barrier: symptomatic intracranial haemorrhage 6.8% versus 1.3% and fatal intracranial haemorrhage 2.7% versus 0.4% in the pooled meta-analysis.',
        iconName: 'Brain',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'NINDS rt-PA Stroke Study (1995; predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 624,
        primaryEndpoint: 'Global outcome across four disability scales at three months',
        endpointMet: true,
        statisticalPValue: 'Global odds ratio 1.7 (95% CI 1.2-2.6)',
        unreportedAdverseSignals:
          'Baseline stroke severity was imbalanced between arms, which a published graphical reanalysis argued weakens the result more than the original report conveyed.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'ECASS III (NCT00153036)',
        phase: 'Phase 3',
        sampleSize: 821,
        primaryEndpoint: 'Modified Rankin scale 0 or 1 at 90 days, treated 3 to 4.5 hours after onset',
        endpointMet: true,
        statisticalPValue: 'p = 0.04 (odds ratio 1.34, 95% CI 1.02-1.76)',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'IST-3 (ISRCTN25765518)',
        phase: 'Phase 3',
        sampleSize: 3035,
        primaryEndpoint: 'Alive and independent, Oxford Handicap Score 0-2, at six months',
        endpointMet: false,
        statisticalPValue: 'p = 0.181 (adjusted odds ratio 1.13, 95% CI 0.95-1.35)',
        unreportedAdverseSignals:
          'Deaths within seven days were higher with rt-PA (11% versus 7%, p = 0.001) and equalised only by six months.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'GUSTO-I (1993; predates ClinicalTrials.gov registration)',
        phase: 'Phase 3',
        sampleSize: 41021,
        primaryEndpoint: '30-day mortality after acute myocardial infarction',
        endpointMet: true,
        statisticalPValue: 'p = 0.001 (14% relative reduction versus streptokinase, 95% CI 5.9-21.3)',
        unreportedAdverseSignals:
          'Haemorrhagic stroke was significantly more common with accelerated t-PA than with streptokinase alone (0.72% versus 0.49-0.54%, p = 0.03).',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'AcT (NCT03889249)',
        phase: 'Phase 3',
        sampleSize: 1600,
        primaryEndpoint: 'Modified Rankin 0-1 at 90-120 days, tenecteplase versus alteplase',
        endpointMet: true,
        statisticalPValue: 'Non-inferiority met (risk difference 2.1%, 95% CI -2.6 to 6.9, margin -5%)',
        independentReplicationStatus: 'Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'NINDS: global odds ratio 1.7 for a favourable outcome at three months; symptomatic ICH 6.4% versus 0.6%',
        'ECASS III at 3 to 4.5 hours: modified Rankin 0-1 in 52.4% versus 45.2%, odds ratio 1.34',
        'Pooled 6,756 patients: fatal intracranial haemorrhage 2.7% versus 0.4%, odds ratio 7.14',
        'GUSTO-I: 30-day mortality 6.3% versus 7.2-7.4% for streptokinase in myocardial infarction',
      ],
      unsupportedInferences: [
        'That alteplase reduces death from stroke — pooled 90-day mortality was 17.9% versus 16.5%, hazard ratio 1.11',
        'That benefit extends usefully beyond 4.5 hours; beyond that window the pooled odds ratio was 1.15 with a confidence interval crossing 1',
        'That the NINDS effect size is secure; IST-3 missed its primary endpoint and a published reanalysis contested the baseline balance',
      ],
      whatFailedInitially: [
        'IST-3 did not meet its primary endpoint of alive and independent at six months',
        'Earlier streptokinase stroke trials were stopped for excess harm, which is why streptokinase is not used in stroke',
      ],
      realWorldOutcome: [
        'Stroke care was reorganised around the clock: prehospital notification, imaging on arrival and door-to-needle time targets exist because of this drug',
        'Tenecteplase is displacing alteplase on the strength of a non-inferiority trial and a simpler single-bolus administration',
      ],
    },
    deliverySystem: {
      type: 'Intravenous infusion after reconstitution of a lyophilised powder',
      description:
        'Supplied as 50 mg and 100 mg lyophilised vials, reconstituted with sterile water. The 100 mg vial contains 58 million International Units of biological potency and 3.5 g of L-arginine as solubiliser. A separate 2 mg presentation, Cathflo Activase, is used to clear blocked central venous catheters.',
      safetyProfile:
        'Bleeding is the dominant risk and is the reason for a long contraindication list: recent intracranial haemorrhage, recent intracranial or intraspinal surgery, severe uncontrolled hypertension, known bleeding diathesis, and in stroke any evidence of haemorrhage on imaging. Angioedema, particularly with concomitant ACE inhibitor use, is a labelled risk that can obstruct the airway.',
    },
    commonQuestions: [
      {
        q: 'Does this drug save lives after a stroke?',
        a: 'On the pooled randomised evidence, no. It increases the chance of surviving without disability by roughly ten percentage points when given early, and it increases fatal brain haemorrhage sevenfold, and those two effects cancel out on the death rate. Ninety-day mortality across nine trials was 17.9% treated versus 16.5% control. The benefit is in what kind of life a survivor has, not in whether they survive.',
        auditNote:
          'Emberson 2014 (doi:10.1016/S0140-6736(14)60584-5) states this directly, and it is the most commonly misrepresented fact about the drug.',
      },
      {
        q: 'Why does the time window matter so much?',
        a: 'Because the benefit shrinks steeply with delay while the bleeding risk does not. Treated within three hours, 32.9% had a good outcome against 23.1% of controls. Beyond 4.5 hours it was 32.6% against 30.6%, with a confidence interval crossing no effect. The excess of fatal haemorrhage stayed roughly the same throughout.',
      },
      {
        q: 'Is the evidence for stroke thrombolysis actually settled?',
        a: 'Less than the guidelines imply. IST-3, the largest trial ever run, missed its primary endpoint, though a prespecified ordinal analysis of the same data was positive. A published graphical reanalysis argued the original NINDS trial had a baseline severity imbalance that weakened its result. The pooled individual-patient meta-analysis supports a functional benefit with early treatment. Reasonable people have read this literature differently, and that disagreement is real rather than fringe.',
      },
      {
        q: 'Why is tenecteplase replacing it?',
        a: 'Not because it works better. In a 1,600-patient randomised trial it was non-inferior, with essentially identical haemorrhage and mortality rates. It wins on logistics: a single bolus can be given in a rural hospital and during transfer to a thrombectomy centre, where a one-hour infusion cannot travel with the patient.',
      },
      {
        q: 'Nobody has measured what?',
        a: 'Whether alteplase adds anything on top of mechanical thrombectomy in patients with a large-vessel occlusion who can reach a thrombectomy centre directly. Several trials have addressed this and have not produced a consistent answer, so guidelines currently keep both. It is one of the live questions in acute stroke care rather than a settled one.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label: 'The NINDS rt-PA Stroke Study Group. Tissue plasminogen activator for acute ischemic stroke. N Engl J Med 1995;333:1581-1587',
        identifier: '10.1056/NEJM199512143332401',
        kind: 'doi',
      },
      {
        label: 'Hacke W et al. Thrombolysis with alteplase 3 to 4.5 hours after acute ischemic stroke (ECASS III). N Engl J Med 2008;359:1317-1329',
        identifier: '10.1056/NEJMoa0804656',
        kind: 'doi',
      },
      {
        label:
          'IST-3 collaborative group. The benefits and harms of intravenous thrombolysis with recombinant tissue plasminogen activator within 6 h of acute ischaemic stroke. Lancet 2012;379:2352-2363',
        identifier: '10.1016/S0140-6736(12)60768-5',
        kind: 'doi',
      },
      {
        label:
          'Emberson J et al. Effect of treatment delay, age, and stroke severity on the effects of intravenous thrombolysis with alteplase for acute ischaemic stroke: a meta-analysis of individual patient data. Lancet 2014;384:1929-1935',
        identifier: '10.1016/S0140-6736(14)60584-5',
        kind: 'doi',
      },
      {
        label: 'The GUSTO Investigators. An international randomized trial comparing four thrombolytic strategies for acute myocardial infarction. N Engl J Med 1993;329:673-682',
        identifier: '10.1056/NEJM199309023291001',
        kind: 'doi',
      },
      {
        label:
          'Menon BK et al. Intravenous tenecteplase compared with alteplase for acute ischaemic stroke in Canada (AcT). Lancet 2022;400:161-169',
        identifier: '10.1016/S0140-6736(22)01054-6',
        kind: 'doi',
      },
      {
        label: 'Hoffman JR, Schriger DL. A graphic reanalysis of the NINDS Trial. Ann Emerg Med 2009;54:329-336',
        identifier: '10.1016/j.annemergmed.2009.03.019',
        kind: 'doi',
      },
      { label: 'ECASS III trial registration', identifier: 'NCT00153036', kind: 'nct' },
      { label: 'AcT trial registration', identifier: 'NCT03889249', kind: 'nct' },
      {
        label: 'ACTIVASE (alteplase) for injection — US prescribing information, DailyMed',
        identifier: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=91ecdef2-95ff-42dd-a31c-c8a09cab3ad9',
        kind: 'regulatory',
      },
      {
        label:
          'Drugs@FDA: ACTIVASE, BLA 103172, original approval 13 November 1987; efficacy supplement 1055 (acute ischaemic stroke) approved 18 June 1996',
        identifier: 'https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=103172',
        kind: 'regulatory',
      },
      {
        label: 'UniProt P00750 — human tissue-type plasminogen activator, mature 527-residue chain',
        identifier: 'https://rest.uniprot.org/uniprotkb/P00750',
        kind: 'url',
      },
    ],
  },
]
