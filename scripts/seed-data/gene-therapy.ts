import type { SeedDossier } from '@/lib/seed-types'

/**
 * Curated flagship dossiers — gene therapy, gene editing and engineered cell therapy.
 *
 * Every DOI below was resolved against Crossref, every PMID against PubMed, every NCT number
 * against the ClinicalTrials.gov v2 API, and every indication string was read off the current FDA
 * product page or package insert at the time of writing. Trial arm sizes, endpoints, confidence
 * intervals and p-values are copied from the published abstract or the label, never from memory.
 *
 * Four conventions govern this whole file.
 *
 * 1. NO PRICING BLOCK, ANYWHERE, DESPITE THESE BEING THE MOST EXPENSIVE MEDICINES EVER SOLD.
 *    `SeedPricing` requires a synthesis cost per dose with a citable source, and no peer-reviewed
 *    cost-of-goods figure exists for an autologous edited-cell product or for a commercial-scale
 *    AAV batch. Manufacturers do not publish it, and the academic literature that touches the
 *    question — for example the mechanistic rAAV production model in Mol Ther Methods Clin Dev
 *    2023 (doi:10.1016/j.omtm.2023.05.019) — models yield, not dollars per dose. Deriving a cost
 *    would mean this file inventing the single number a reader is most likely to quote. So the
 *    list prices appear in the audits and the questions, each attributed to the announcement that
 *    set them, and the markup column stays empty because its numerator does not exist in public.
 *
 * 2. NO STRUCTURE STRING. A recombinant AAV capsid is a 60-subunit protein shell around a
 *    kilobase-scale genome; an autologous cell product is a patient's own bone marrow. Neither is
 *    a SMILES and neither is a sequence a reader can check, so `molecularSchema` uses
 *    `antibody_structure`, carries a descriptive composition and the manufacturing workflow, and
 *    omits `sequence5to3` and `smilesString`. The seed loader therefore runs no deterministic
 *    sweep on these records and claims no machine-verified badge. That is the correct outcome for
 *    this modality, not a gap in the research.
 *
 * 3. THE AUDITS ARE NOT A HIGHLIGHT REEL. Every dossier here carries at least one 'inferred',
 *    'failed' or 'conclusion_shift' entry, because every product in this class has one:
 *    delandistrogene moxeparvovec missed its phase 3 primary endpoint and later lost half its
 *    licence to fatal liver failure, valoctocogene roxaparvovec's factor VIII activity fell year
 *    on year until its maker withdrew it, fidanacogene elaparvovec was discontinued without a
 *    single commercial patient, lovotibeglogene autotemcel carries a malignancy boxed warning
 *    written out of its own trial, and betibeglogene autotemcel was pulled out of Europe over
 *    price before it was pulled back into the United States.
 *
 * 4. "ONE-TIME" AND "CURE" ARE THE TWO WORDS THIS FILE WATCHES MOST CLOSELY. Almost every
 *    unsupported inference on these pages is one of them: a single infusion is not the same claim
 *    as a permanent effect, and freedom from a symptom over twelve months is not the same claim as
 *    a normal lifespan. Where a trial measured the first, this file says so and refuses the
 *    second.
 */
export const GENE_THERAPY_DOSSIERS: SeedDossier[] = [
  // ---------------------------------------------------------------------------------------------
  // 1. Exagamglogene autotemcel (Casgevy) — the first approved CRISPR medicine.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'exagamglogene-autotemcel',
    name: 'Exagamglogene autotemcel',
    tradeName: 'Casgevy',
    sponsor: 'Vertex Pharmaceuticals and CRISPR Therapeutics',
    targetGene: 'BCL11A (erythroid-specific enhancer, +58 region)',
    targetProtein: 'BCL11A, the transcriptional repressor that silences fetal haemoglobin',
    modality: 'CRISPR / Gene Therapy',
    approvalStatus: 'FDA Approved',
    approvalYear: 2023,
    indication:
      'Patients aged 2 years and older with sickle cell disease with recurrent vaso-occlusive crises, or with transfusion-dependent beta-thalassemia',
    patientFriendlyIndication: 'Sickle cell disease and transfusion-dependent beta-thalassemia',
    anatomicalSite: 'Bone marrow — autologous CD34+ haematopoietic stem and progenitor cells',
    conditionContext: {
      conditionExplainer:
        'Both diseases are faults in adult haemoglobin. In sickle cell disease a single amino-acid change makes haemoglobin polymerise when it gives up oxygen, deforming red cells into rigid crescents that jam small vessels and cause vaso-occlusive crises. In beta-thalassemia the beta-globin chain is made in too little quantity or not at all, so red cells are starved of haemoglobin and the patient survives on transfusions. Before birth everybody makes a different haemoglobin, fetal haemoglobin, which does neither of these things; a repressor called BCL11A switches it off after birth.',
      whyItMatters:
        'The natural experiment that motivates this drug already exists. People who inherit hereditary persistence of fetal haemoglobin alongside sickle cell disease have a far milder illness, which is why raising fetal haemoglobin has been the target of sickle cell therapy since hydroxyurea. Casgevy does not repair the sickle mutation. It disables the off-switch on the healthy back-up gene the patient already has.',
      whoTakesThis:
        'Patients aged 2 and older with severe disease — a history of recurrent vaso-occlusive crises, or transfusion dependence — who can survive full myeloablative chemotherapy and who have access to an authorised transplant centre.',
      clinicalGoals:
        'Freedom from severe vaso-occlusive crises in sickle cell disease, and freedom from red-cell transfusion in beta-thalassemia, each sustained for at least twelve consecutive months.',
    },
    oneSentenceVerdict:
      'The first approved CRISPR medicine: it cuts the enhancer that silences fetal haemoglobin, and 29 of 30 evaluable sickle cell patients went at least twelve months without a severe crisis — measured over a median 19.3 months in a single-arm trial, not over a lifetime and not against a control group.',
    laymanHowItWorks:
      'Before you were born you made a different kind of haemoglobin that does not sickle and does not depend on the broken gene. After birth a switch turned it off. Doctors collect your own blood stem cells, and in the laboratory CRISPR makes one cut in the switch so the cell can no longer read it. Your own repair machinery seals the cut imperfectly, which is the point: the switch is now broken. Chemotherapy empties your bone marrow, the edited cells go back in, and every red cell they make from then on carries fetal haemoglobin.',
    auditConfidence: 'High Confidence',
    confidenceScore: 86,
    substitutes: {
      summary:
        'For sickle cell disease there are three genuine alternatives with decades more follow-up between them: hydroxyurea, chronic transfusion, and allogeneic bone marrow transplant from a matched sibling. For beta-thalassemia the alternative is transfusion plus iron chelation, which is a lifetime of appointments but a known quantity. Nothing eaten or taken as a supplement substitutes for any of this.',
      conventionalRx: [
        {
          name: 'Hydroxyurea',
          class: 'Ribonucleotide reductase inhibitor that raises fetal haemoglobin',
          howItCompares:
            'Works on the same biological lever — more fetal haemoglobin — by a cruder route, taken as a daily capsule, and has the longest safety record of anything in sickle cell disease. It reduces crisis frequency rather than abolishing it.',
          typicalCost: 'Generic; a small fraction of any gene therapy, exact price varies by market',
          prosAndCons:
            'Pros: oral, generic, decades of use, reversible. Cons: adherence-dependent, incomplete response, and it does not eliminate crises the way the trial endpoint here did.',
        },
        {
          name: 'Allogeneic haematopoietic stem cell transplant from a matched sibling donor',
          class: 'Cell therapy from a donor rather than from the patient',
          howItCompares:
            'The established curative option, and the one Casgevy is designed to replace for the roughly three quarters of patients with no matched sibling. It uses the same myeloablative conditioning but adds graft-versus-host disease and lifelong immunosuppression risk.',
          typicalCost: 'Not priced here — no citable single figure covers transplant plus aftercare',
          prosAndCons:
            'Pros: decades of follow-up, genuinely curative in successful cases. Cons: donor availability, graft-versus-host disease, rejection.',
        },
        {
          name: 'Chronic red-cell transfusion with iron chelation',
          class: 'Supportive haematology',
          howItCompares:
            'The standard of care in transfusion-dependent beta-thalassemia and in stroke prevention for sickle cell disease. It manages the disease indefinitely rather than changing it, and iron overload becomes the second illness.',
          typicalCost: 'Not priced here — no citable single figure',
          prosAndCons:
            'Pros: available everywhere, reversible, no conditioning chemotherapy. Cons: alloimmunisation, iron overload, and a life organised around appointments.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what the conditioning chemotherapy costs you, separately from the edit',
          action:
            'Ask the treating team to describe busulfan myeloablation, infertility risk and fertility preservation options as their own decision, before the gene-editing decision.',
          patientImpact:
            'Most of the serious adverse events in both pivotal trials came from the conditioning, not from the edited cells. The FDA label lists mucositis and febrile neutropenia as the most common grade 3 or 4 non-laboratory reactions, and requires consideration of seizure and hepatic veno-occlusive disease prophylaxis before conditioning begins.',
          clinicalPrecaution:
            'This is information-gathering, not a treatment. Nothing here replaces the transplant centre discussion.',
        },
        {
          name: 'Ask which endpoint your own goal maps onto',
          action:
            'Ask whether the goal is freedom from crises, freedom from transfusion, organ protection, or longer life — and which of those the trial actually measured.',
          patientImpact:
            'The trials measured the first two over twelve months. Organ protection and survival were not endpoints in either study.',
          clinicalPrecaution:
            'A drug can succeed completely on its endpoint and still leave your particular question unanswered.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        "Autologous CD34+ haematopoietic stem and progenitor cells edited ex vivo by a Streptococcus pyogenes Cas9 ribonucleoprotein with a single guide RNA against the BCL11A erythroid enhancer",
      targetReceptorAffinity:
        'Minimum recommended dose 3 x 10^6 CD34+ cells/kg body weight, per the FDA label',
      structureSource: {
        label: 'CASGEVY (exagamglogene autotemcel) US package insert, FDA',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/casgevy',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'exa-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Mobilisation, apheresis and CD34+ selection',
          description:
            'Mobilise the patient with plerixafor and collect by apheresis, then immunomagnetically select CD34+ cells and release them against identity, viability and cell-count specifications. The FDA label forbids granulocyte colony-stimulating factor for mobilisation in sickle cell disease, because it can precipitate a vaso-occlusive crisis.',
          reagentsAndBuffer:
            'Plerixafor, leukapheresis with anticoagulant citrate dextrose, CD34 immunomagnetic selection reagent, flow cytometric CD34 enumeration, viability by 7-AAD',
        },
        {
          id: 'exa-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Cas9 ribonucleoprotein assembly and electroporation',
          description:
            'Complex recombinant SpCas9 protein with the chemically modified single guide RNA targeting the +58 erythroid enhancer of BCL11A, then electroporate the complex into the selected CD34+ cells. Delivery is as protein, not as DNA, so there is no integrating vector and the nuclease is degraded within days.',
          dependsOnStepId: 'exa-w1',
          reagentsAndBuffer:
            'Recombinant SpCas9 protein, chemically modified synthetic single guide RNA, electroporation buffer, serum-free HSPC expansion medium with stem cell factor, FLT3 ligand and thrombopoietin',
        },
        {
          id: 'exa-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Formulation, cryopreservation and release testing',
          description:
            'Wash, formulate and cryopreserve the edited cells, then release them on editing efficiency by next-generation sequencing of the target amplicon, viability, CD34 content, sterility and endotoxin. The dose is calculated on body weight against a minimum of 3 x 10^6 CD34+ cells/kg.',
          dependsOnStepId: 'exa-w2',
          reagentsAndBuffer:
            'CryoStor-class DMSO cryopreservation medium, controlled-rate freezer, amplicon next-generation sequencing with indel quantification, compendial sterility and endotoxin assays',
        },
        {
          id: 'exa-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Myeloablative conditioning and infusion',
          description:
            'Give full myeloablative busulfan conditioning between 48 hours and 7 days before infusion to empty the marrow niche, with seizure and hepatic veno-occlusive disease prophylaxis considered beforehand, then thaw and infuse each vial intravenously within 20 minutes. No in-line blood filter is used.',
          dependsOnStepId: 'exa-w3',
          reagentsAndBuffer:
            'Pharmacokinetically dose-adjusted intravenous busulfan, anticonvulsant prophylaxis, ursodeoxycholic acid or defibrotide-based veno-occlusive prophylaxis per centre protocol',
        },
        {
          id: 'exa-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Engraftment and fetal haemoglobin monitoring',
          description:
            'Track absolute neutrophil and platelet counts to engraftment, then quantify total and fetal haemoglobin and the proportion of red cells carrying fetal haemoglobin, alongside allelic editing frequency in bone marrow and peripheral blood.',
          dependsOnStepId: 'exa-w4',
          reagentsAndBuffer:
            'Automated haematology analyser, high-performance liquid chromatography for haemoglobin fractions, flow cytometry for F-cell percentage, amplicon sequencing for allelic edit frequency',
        },
      ],
    },
    keyAudits: [
      {
        id: 'exa-a1',
        category: 'measured',
        title: 'CLIMB SCD-121: 29 of 30 evaluable patients free of vaso-occlusive crises for 12 months or more',
        laymanSummary:
          'Forty-four people with severe sickle cell disease were treated. Of the thirty followed long enough to judge, twenty-nine went at least a year with no severe pain crisis, and all thirty went a year with no hospital admission for one.',
        technicalDetails:
          'Phase 3, single-group, open-label. Patients aged 12 to 35 with at least two severe vaso-occlusive crises in each of the two years before screening. 44 received exa-cel; median follow-up 19.3 months (range 0.8 to 48.1). Neutrophils and platelets engrafted in every patient. Of 30 evaluable, 29 (97%; 95% CI 83 to 100) were free of vaso-occlusive crises for at least 12 consecutive months and 30 (100%; 95% CI 88 to 100) were free of hospitalisation for one, P<0.001 for both against a null of 50% response. No cancers occurred.',
        evidenceSource: 'Frangoul H et al., N Engl J Med 2024;390:1649-1662',
        doi: '10.1056/NEJMoa2309676',
        measuredMetric:
          'Proportion free of severe vaso-occlusive crises for at least 12 consecutive months: 29/30 (97%)',
        auditFlag: 'verified',
      },
      {
        id: 'exa-a2',
        category: 'measured',
        title: 'CLIMB THAL-111: transfusion independence in 32 of 35 evaluable thalassemia patients',
        laymanSummary:
          'In transfusion-dependent beta-thalassemia, 91% of the patients followed long enough kept a haemoglobin of at least 9 g/dL for a year with no transfusions at all.',
        technicalDetails:
          'Phase 3, single-group, open-label, in patients aged 12 to 35 with beta0/beta0, beta0/beta0-like or non-beta0/beta0-like genotypes. 52 received exa-cel; median follow-up 20.4 months (range 2.1 to 48.1). Of 35 evaluable, 32 (91%; 95% CI 77 to 98; P<0.001 against a null of 50%) achieved transfusion independence. During independence, mean total haemoglobin was 13.1 g/dL and mean fetal haemoglobin 11.9 g/dL, with fetal haemoglobin distributed pancellularly across at least 94% of red cells. No deaths or cancers occurred.',
        evidenceSource: 'Locatelli F et al., N Engl J Med 2024;390:1663-1676',
        doi: '10.1056/NEJMoa2309673',
        measuredMetric: 'Transfusion independence for at least 12 consecutive months: 32/35 (91%)',
        auditFlag: 'verified',
      },
      {
        id: 'exa-a3',
        category: 'inferred',
        title: 'Off-target editing has not been ruled out, and the label says so',
        laymanSummary:
          'CRISPR was designed to cut one place. Whether it also cut somewhere else in a particular person depends on that person\'s own genetic variants, and the label states plainly that the risk cannot be excluded.',
        technicalDetails:
          'Section 5.4 of the US prescribing information, added in August 2025, reads: "The risk of unintended, off-target editing in CD34+ cells due to genetic variants cannot be ruled out." Off-target assessment for this product is built on in-silico prediction and in-vitro nomination in reference genomes, which cannot enumerate the private variants of an individual patient near the guide site. No trial endpoint measured off-target editing in vivo, and the pivotal studies reported no cancers over a median follow-up under two years — an observation that constrains but does not settle a question whose natural timescale is decades.',
        evidenceSource:
          'CASGEVY US prescribing information, Warnings and Precautions 5.4 (recent major change 08/2025)',
        inferredClaim:
          'That a clean on-target edit in the reference genome implies no consequential off-target edit in this patient',
        auditFlag: 'caution',
      },
      {
        id: 'exa-a4',
        category: 'inferred',
        title: 'Neither pivotal trial had a control group, and neither measured survival or organ damage',
        laymanSummary:
          'Both studies compared each patient to their own history, not to a randomised comparison group, and neither asked whether patients live longer or keep their kidneys.',
        technicalDetails:
          'CLIMB SCD-121 and CLIMB THAL-111 are single-group, open-label studies. The statistical test in each is against a fixed null response rate of 50%, not against a concurrent arm. Endpoints are freedom from vaso-occlusive crises and transfusion independence over 12 months. Stroke, silent cerebral infarct, nephropathy, pulmonary hypertension, cumulative organ damage and mortality were not endpoints. Median follow-up at publication was 19.3 and 20.4 months.',
        evidenceSource: 'Trial designs of Frangoul 2024 and Locatelli 2024',
        doi: '10.1056/NEJMoa2309676',
        inferredClaim:
          'That eliminating crises for twelve months is the same finding as preventing organ damage or extending life',
        auditFlag: 'caution',
      },
      {
        id: 'exa-a5',
        category: 'measured',
        title: 'The harms measured are mostly the harms of the chemotherapy, not of the edit',
        laymanSummary:
          'The serious side effects in both trials looked like a bone marrow transplant, because the patient has one. The gene editing itself contributed little to the adverse event list.',
        technicalDetails:
          'Both publications describe the safety profile as generally consistent with myeloablative busulfan conditioning and autologous haematopoietic stem cell transplantation. The FDA label lists mucositis and febrile neutropenia as the most common grade 3 or 4 non-laboratory adverse reactions at 25% or more incidence, plus decreased appetite in sickle cell disease, and neutropenia, thrombocytopenia, leukopenia, anaemia and lymphopenia as grade 3 or 4 laboratory abnormalities at 50% or more. Warnings cover neutrophil engraftment failure, delayed platelet engraftment and hypersensitivity.',
        evidenceSource:
          'CASGEVY US prescribing information, Sections 5 and 6; Frangoul 2024 and Locatelli 2024',
        measuredMetric:
          'Grade 3-4 non-laboratory adverse reactions at 25% or more: mucositis, febrile neutropenia',
        auditFlag: 'verified',
      },
      {
        id: 'exa-a6',
        category: 'conclusion_shift',
        title: 'The licence moved from age 12 down to age 2, on later evidence',
        laymanSummary:
          'At approval this was a medicine for teenagers and adults. It is now approved from age two, which is a different risk-benefit judgement about giving a child myeloablative chemotherapy.',
        technicalDetails:
          'The original BLA (STN 125785) covered patients aged 12 and older with sickle cell disease with recurrent vaso-occlusive crises, approved 8 December 2023, extended to transfusion-dependent beta-thalassemia on 16 January 2024. A separate BLA (STN 125787) now covers patients aged 2 years and older for both indications, with approval letters dated 18 March 2026, 15 June 2026 and 1 July 2026 on the FDA product page. The Indications and Usage and Dosage and Administration sections of the label were revised in July 2026.',
        evidenceSource: 'FDA CASGEVY product page and approval letters (content current 2 July 2026)',
        auditFlag: 'verified',
      },
      {
        id: 'exa-a7',
        category: 'failed',
        title: 'A $2.2 million list price met an eligible population that mostly could not reach it',
        laymanSummary:
          'The therapy was priced at $2.2 million per patient in the United States. Uptake in the first year was close to nothing, not because the science failed but because the delivery system around it did.',
        technicalDetails:
          'Vertex and CRISPR Therapeutics set a US list price of $2.2 million on approval in December 2023; bluebird bio set $3.1 million for the competing product the same week. Reaching either requires an authorised transplant centre, weeks of inpatient myeloablative conditioning, and a payer willing to fund a single-payment therapy for a population disproportionately covered by Medicaid. The Centers for Medicare & Medicaid Services responded by building the Cell and Gene Therapy Access Model, an outcomes-based multi-state negotiation specifically for sickle cell gene therapy, with states beginning participation in 2025. A therapy whose access problem needs a new federal payment model is a therapy whose access problem is structural.',
        evidenceSource:
          'Reuters, 8 December 2023 (list prices); CMS Cell and Gene Therapy Access Model',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Your own stem cells are collected',
        laymanDesc:
          'A drug pushes blood stem cells out of the bone marrow into the bloodstream, and a machine filters them out over several sessions. Nothing has been changed yet.',
        molecularDetail:
          'Plerixafor-mobilised autologous CD34+ haematopoietic stem and progenitor cells are collected by apheresis and immunomagnetically selected. Granulocyte colony-stimulating factor is contraindicated for mobilisation in sickle cell disease because of the risk of precipitating a vaso-occlusive crisis.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'CRISPR is delivered as a protein, not as a gene',
        laymanDesc:
          'The editing machine is pushed into the cells by a brief electric pulse. It is a protein, so the cell breaks it down within days — nothing is left behind that keeps cutting.',
        molecularDetail:
          'A recombinant SpCas9 protein pre-complexed with a chemically modified single guide RNA is electroporated into the CD34+ cells as a ribonucleoprotein. There is no viral vector and no integrating DNA, which is the structural reason this product carries no insertional-oncogenesis boxed warning.',
        iconName: 'Zap',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'One cut in the switch that silences fetal haemoglobin',
        laymanDesc:
          'The guide leads the scissors to a specific stretch of DNA that acts as a volume control for the off-switch, and makes a single cut there.',
        molecularDetail:
          'The guide directs a double-strand break at the +58 erythroid-specific enhancer of BCL11A. The coding sequence of BCL11A is untouched; only the enhancer that drives its expression in the red-cell lineage is targeted, which preserves BCL11A function in the B-lymphoid and neural lineages where it is required.',
        iconName: 'Scissors',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The cell repairs the cut badly, and that is the treatment',
        laymanDesc:
          'The cell glues the ends back together and loses a few letters in the process. The enhancer no longer works, so the off-switch is no longer made in red cells.',
        molecularDetail:
          'Non-homologous end joining introduces insertions and deletions at the cut site, disrupting the GATA1 motif within the enhancer. Erythroid BCL11A expression falls, gamma-globin transcription from HBG1 and HBG2 is derepressed, and fetal haemoglobin production resumes.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Fetal haemoglobin in nearly every red cell',
        laymanDesc:
          'After chemotherapy clears the old marrow, the edited cells take root and make red cells full of fetal haemoglobin, which does not sickle and does not need the broken gene.',
        molecularDetail:
          'In CLIMB THAL-111, mean total haemoglobin during transfusion independence was 13.1 g/dL with fetal haemoglobin 11.9 g/dL, distributed pancellularly across at least 94% of red cells. Pancellular distribution matters more than the mean: a high average concentrated in a minority of cells would leave the rest still sickling.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'CLIMB SCD-121 (NCT03745287)',
        phase: 'Phase 2/3, single group, open label',
        sampleSize: 44,
        primaryEndpoint:
          'Freedom from severe vaso-occlusive crises for at least 12 consecutive months',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 against a null hypothesis of 50% response',
        unreportedAdverseSignals:
          'Safety profile dominated by busulfan myeloablation rather than by the edit. No cancers observed, but median follow-up was 19.3 months, far short of the timescale on which insertional or off-target oncogenesis would be expected to declare itself.',
        independentReplicationStatus: 'Unreplicated',
      },
      {
        trialId: 'CLIMB THAL-111 (NCT03655678)',
        phase: 'Phase 2/3, single group, open label',
        sampleSize: 52,
        primaryEndpoint:
          'Transfusion independence: weighted average haemoglobin at least 9 g/dL without red-cell transfusion for at least 12 consecutive months',
        endpointMet: true,
        statisticalPValue: 'P < 0.001 against a null hypothesis of 50% response',
        unreportedAdverseSignals:
          'No deaths or cancers. Grade 3-4 cytopenias near-universal, attributable to conditioning.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '29 of 30 evaluable sickle cell patients (97%; 95% CI 83 to 100) free of severe vaso-occlusive crises for at least 12 consecutive months',
        '30 of 30 (100%; 95% CI 88 to 100) free of hospitalisation for a vaso-occlusive crisis over the same period',
        '32 of 35 evaluable thalassemia patients (91%; 95% CI 77 to 98) transfusion-independent, mean total haemoglobin 13.1 g/dL',
        'Fetal haemoglobin distributed pancellularly across at least 94% of red cells during transfusion independence',
        'Neutrophil and platelet engraftment in every patient dosed across both studies',
      ],
      unsupportedInferences: [
        'That the effect is permanent — the longest follow-up in either pivotal publication was 48.1 months, and the disease timescale is a lifetime',
        'That eliminating crises prevents stroke, nephropathy, pulmonary hypertension or cumulative organ damage; none was an endpoint',
        'That the absence of cancer over a median 19.3 months settles the off-target question, when the label states the risk cannot be ruled out',
        'That "cure" is the demonstrated claim, when the demonstrated claim is twelve months of freedom from a symptom in a single-arm study',
      ],
      whatFailedInitially: [
        'Commercial access: a $2.2 million list price against a population concentrated in Medicaid produced near-zero uptake in the first year and prompted CMS to build a bespoke access model',
        'Nothing in the pivotal efficacy programme failed; the failures in this class belong to delivery, not to the biology',
      ],
      realWorldOutcome: [
        'First CRISPR-based medicine approved anywhere, and the first to demonstrate that a ribonucleoprotein edit can be manufactured, released and dosed at commercial scale',
        'The licence has since widened from age 12 to age 2, extending myeloablative conditioning to young children on the strength of later data',
        'The rate-limiting step in practice is authorised transplant centre capacity and payer arrangement, not manufacturing',
      ],
    },
    deliverySystem: {
      type: 'Ex vivo CRISPR-Cas9 edited autologous CD34+ cell suspension, single intravenous infusion',
      description:
        'One intravenous infusion of the patient\'s own gene-edited haematopoietic stem cells, at a minimum of 3 x 10^6 CD34+ cells/kg, given 48 hours to 7 days after full myeloablative busulfan conditioning. Each vial is infused within 20 minutes of thaw and no in-line blood filter is used. The whole course — mobilisation, apheresis, manufacture, conditioning, infusion, engraftment — runs to months, not to a single appointment.',
      safetyProfile:
        'No boxed warning. Labelled warnings are neutrophil engraftment failure, delayed platelet engraftment, hypersensitivity reactions, and off-target genome editing risk that cannot be ruled out. The dominant clinical toxicity is the conditioning: mucositis and febrile neutropenia at 25% or more, and grade 3-4 neutropenia, thrombocytopenia, leukopenia, anaemia and lymphopenia at 50% or more. Infertility from myeloablation is a foreseeable consequence and warrants a fertility discussion before conditioning.',
    },
    commonQuestions: [
      {
        q: 'Is this a cure?',
        a: 'The trials did not measure a cure. They measured freedom from severe pain crises for at least twelve months in sickle cell disease, and freedom from transfusion for at least twelve months in beta-thalassemia, in single-arm studies with a median follow-up under two years. Those results were close to complete — 29 of 30 and 32 of 35 — and the underlying biology, an edit in a self-renewing stem cell, gives good reason to expect durability. But "cure" is a claim about a lifetime and about organ damage, and neither has been measured.',
        auditNote:
          'This is the single most common overreach on this page and the reason the confidence score is not higher.',
      },
      {
        q: 'Can the edit be passed on to my children?',
        a: 'No. The edit is made in blood-forming stem cells taken out of your body and put back. It does not touch eggs or sperm, so it is not heritable. Separately, the myeloablative chemotherapy given before the infusion can itself cause infertility, which is a different and very real consideration to raise before conditioning starts.',
      },
      {
        q: 'Why does this page show no manufacturing cost or markup?',
        a: 'Because no peer-reviewed cost-of-goods figure exists for an autologous gene-edited cell product. Manufacturers do not publish it, and the academic literature models AAV and cell-therapy process yields rather than dollars per dose. Quoting a fabricated cost against a real $2.2 million price would produce a markup number that looks precise and means nothing. The price is stated where it was announced; the cost is left blank because it is not public.',
      },
      {
        q: 'What is the chemotherapy for, and can it be skipped?',
        a: 'The edited cells have to occupy the bone marrow niche, and that niche is currently full of unedited cells. Busulfan myeloablation empties it. It cannot be skipped with this product, and it is where most of the serious adverse events came from — mucositis, febrile neutropenia, deep and universal cytopenias, and infertility risk. Non-myeloablative conditioning is an active research direction across the field, not an option on this label.',
      },
      {
        q: 'How is this different from the other sickle cell gene therapy approved the same week?',
        a: 'Casgevy uses CRISPR to disable an enhancer, delivered as a protein complex that is degraded within days, and adds no new DNA. Lyfgenia uses a lentiviral vector to insert a modified beta-globin gene, which integrates permanently into the genome. That structural difference is why Lyfgenia carries a boxed warning for haematologic malignancy and Casgevy does not. Both require the same myeloablative conditioning, and neither has been compared against the other in a trial.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Frangoul H et al. Exagamglogene Autotemcel for Severe Sickle Cell Disease. N Engl J Med 2024;390:1649-1662',
        identifier: '10.1056/NEJMoa2309676',
        kind: 'doi',
      },
      {
        label:
          'Locatelli F et al. Exagamglogene Autotemcel for Transfusion-Dependent Beta-Thalassemia. N Engl J Med 2024;390:1663-1676',
        identifier: '10.1056/NEJMoa2309673',
        kind: 'doi',
      },
      {
        label: 'CLIMB SCD-121: A Safety and Efficacy Study Evaluating CTX001 in Severe Sickle Cell Disease',
        identifier: 'NCT03745287',
        kind: 'nct',
      },
      {
        label:
          'CLIMB THAL-111: A Safety and Efficacy Study Evaluating CTX001 in Transfusion-Dependent Beta-Thalassemia',
        identifier: 'NCT03655678',
        kind: 'nct',
      },
      {
        label: 'FDA CASGEVY product page, package insert and approval letters',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/casgevy',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease, 8 December 2023',
        identifier:
          'https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease',
        kind: 'regulatory',
      },
      {
        label:
          'Vertex/CRISPR price sickle cell disease gene therapy at $2.2 mln, Reuters, 8 December 2023',
        identifier: 'https://finance.yahoo.com/news/vertex-crispr-price-sickle-cell-181618940.html',
        kind: 'url',
      },
      {
        label: 'CMS Cell and Gene Therapy Access Model',
        identifier: 'https://www.cms.gov/priorities/innovation/innovation-models/cgt',
        kind: 'regulatory',
      },
    ],
  },
