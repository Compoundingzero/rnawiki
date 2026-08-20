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
  // ---------------------------------------------------------------------------------------------
  // 2. Lovotibeglogene autotemcel (Lyfgenia) — the lentiviral answer to the same disease.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'lovotibeglogene-autotemcel',
    name: 'Lovotibeglogene autotemcel',
    tradeName: 'Lyfgenia',
    sponsor: 'bluebird bio (privately held by Carlyle and SK Capital since June 2025)',
    targetGene: 'HBB — a modified beta-globin transgene, beta-A-T87Q',
    targetProtein: 'HbAT87Q, an engineered anti-sickling adult haemoglobin',
    modality: 'CRISPR / Gene Therapy',
    approvalStatus: 'FDA Approved',
    approvalYear: 2023,
    indication:
      'Patients 12 years of age or older with sickle cell disease and a history of vaso-occlusive events',
    patientFriendlyIndication: 'Sickle cell disease with a history of severe pain crises',
    anatomicalSite: 'Bone marrow — autologous CD34+ cells carrying an integrated lentiviral transgene',
    conditionContext: {
      conditionExplainer:
        'Sickle cell disease is one letter wrong in the beta-globin gene. The resulting haemoglobin polymerises when it releases oxygen, stiffening the red cell into a crescent that jams capillaries. The result is a vaso-occlusive event: sudden, severe pain, often needing hospital admission, and cumulative damage to spleen, kidney, lung and brain.',
      whyItMatters:
        'Lyfgenia and Casgevy were approved on the same day for nearly the same population, by opposite strategies. Casgevy switches a healthy back-up gene back on. Lyfgenia adds a new, deliberately redesigned beta-globin gene, permanently inserted into the patient\'s chromosomes by a lentiviral vector. That permanence is both the mechanism and the reason this product carries a boxed warning the other does not.',
      whoTakesThis:
        'Patients aged 12 and older with sickle cell disease and a history of vaso-occlusive events, who can tolerate myeloablative conditioning and accept lifelong malignancy surveillance.',
      clinicalGoals:
        'Complete resolution of severe vaso-occlusive events, with HbAT87Q making up a large enough fraction of total haemoglobin, in enough red cells, to prevent polymerisation.',
    },
    oneSentenceVerdict:
      'A lentiviral gene addition that gives red cells a redesigned, sickling-resistant haemoglobin: all 25 evaluable patients in the pivotal group had complete resolution of severe vaso-occlusive events, and the same permanent DNA insertion that makes it work is why the label carries a boxed warning for blood cancer.',
    laymanHowItWorks:
      'Your beta-globin gene has one wrong letter, and rewriting it is hard. So this treatment does not rewrite it — it adds a second, redesigned copy. Your own blood stem cells are collected and a disabled virus carries the new gene into their DNA, where it stays. One deliberate change in the added gene, at position 87, blocks the stacking reaction that makes cells sickle. Chemotherapy clears your marrow, the modified cells go back, and every red cell they make afterwards carries the new haemoglobin alongside the old one.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 71,
    substitutes: {
      summary:
        'The direct comparator is Casgevy, approved the same week for an overlapping population and never compared against this product in a trial. Behind both sit hydroxyurea, chronic transfusion and matched-sibling allogeneic transplant, all with far longer follow-up.',
      conventionalRx: [
        {
          name: 'Exagamglogene autotemcel (Casgevy)',
          class: 'Ex vivo CRISPR-Cas9 edited autologous CD34+ cells',
          howItCompares:
            'Same disease, same conditioning, same infusion, opposite molecular strategy: an enhancer edit delivered as a protein that degrades in days, with no DNA inserted. It carries no malignancy boxed warning. No trial has compared the two.',
          typicalCost: 'US list price $2.2 million, announced December 2023',
          prosAndCons:
            'Pros: no integrating vector, no insertional-oncogenesis warning, now licensed from age 2. Cons: the off-target editing question is open, and follow-up is no longer than for this product.',
        },
        {
          name: 'Hydroxyurea',
          class: 'Ribonucleotide reductase inhibitor that raises fetal haemoglobin',
          howItCompares:
            'A daily generic capsule with the longest safety record in the disease. It reduces crisis frequency; the pivotal group here reported complete resolution.',
          typicalCost: 'Generic; a negligible fraction of any gene therapy',
          prosAndCons:
            'Pros: cheap, oral, reversible, decades of data. Cons: adherence-dependent, partial effect.',
        },
        {
          name: 'Allogeneic haematopoietic stem cell transplant',
          class: 'Donor cell therapy',
          howItCompares:
            'The pre-existing curative option for the minority with a matched sibling donor. Same conditioning burden, plus graft-versus-host disease, minus the insertional-oncogenesis question.',
          typicalCost: 'Not priced here — no citable single figure',
          prosAndCons:
            'Pros: decades of outcome data. Cons: donor availability, graft-versus-host disease, rejection.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Confirm the malignancy surveillance schedule in writing before you consent',
          action:
            'Ask for the monitoring plan the label requires: complete blood counts at least every six months, and integration site analysis at months 6 and 12 and as warranted.',
          patientImpact:
            'The boxed warning is not theoretical. It exists because haematologic malignancies occurred in the development programme, and the surveillance is lifelong.',
          clinicalPrecaution:
            'Surveillance detects; it does not prevent. This is a question to settle before conditioning, not after.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Autologous CD34+ haematopoietic stem cells transduced ex vivo with the BB305 self-inactivating lentiviral vector encoding a beta-A-T87Q globin transgene',
      structureSource: {
        label: 'LYFGENIA (lovotibeglogene autotemcel) US package insert, FDA',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/lyfgenia',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'lovo-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Mobilisation, apheresis and CD34+ selection',
          description:
            'Mobilise with plerixafor and collect CD34+ cells by apheresis over multiple cycles, then select and release on identity, viability and CD34 content. Patients are transfused to a target haemoglobin before mobilisation to suppress sickling during the procedure.',
          reagentsAndBuffer:
            'Plerixafor, red-cell exchange or simple transfusion to the pre-mobilisation haemoglobin target, CD34 immunomagnetic selection reagent, flow cytometric CD34 enumeration',
        },
        {
          id: 'lovo-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'BB305 lentiviral transduction',
          description:
            'Prestimulate the selected CD34+ cells in cytokine-supplemented serum-free medium and transduce with the BB305 self-inactivating lentiviral vector carrying the beta-A-T87Q globin gene under an erythroid-specific promoter and locus control region elements.',
          dependsOnStepId: 'lovo-w1',
          reagentsAndBuffer:
            'BB305 self-inactivating HIV-1-derived lentiviral vector, serum-free HSPC medium with stem cell factor, FLT3 ligand and thrombopoietin, transduction enhancer',
        },
        {
          id: 'lovo-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Formulation, cryopreservation and vector copy number release',
          description:
            'Wash, formulate and cryopreserve, then release the batch on vector copy number per diploid genome, transduction efficiency, viability, sterility, endotoxin, and absence of replication-competent lentivirus.',
          dependsOnStepId: 'lovo-w2',
          reagentsAndBuffer:
            'DMSO cryopreservation medium, controlled-rate freezer, quantitative PCR for vector copy number, replication-competent lentivirus assay, compendial sterility and endotoxin tests',
        },
        {
          id: 'lovo-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Myeloablative busulfan conditioning and infusion',
          description:
            'Give pharmacokinetically dose-adjusted myeloablative busulfan to clear the marrow niche, then thaw and infuse the transduced cells intravenously.',
          dependsOnStepId: 'lovo-w3',
          reagentsAndBuffer:
            'Pharmacokinetically dose-adjusted intravenous busulfan, seizure prophylaxis, hepatic veno-occlusive disease prophylaxis per centre protocol',
        },
        {
          id: 'lovo-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Haemoglobin fractionation and lifelong integration site surveillance',
          description:
            'Quantify HbAT87Q as a fraction of total haemoglobin and the proportion of red cells expressing it, then run the malignancy surveillance the label requires: complete blood counts at least every six months and integration site analysis at months 6 and 12 and as warranted.',
          dependsOnStepId: 'lovo-w4',
          reagentsAndBuffer:
            'High-performance liquid chromatography for haemoglobin fractions, flow cytometry for cellular distribution, linear amplification-mediated PCR integration site analysis, serial complete blood counts',
        },
      ],
    },
    keyAudits: [
      {
        id: 'lovo-a1',
        category: 'measured',
        title: 'HGB-206 Group C: complete resolution of severe vaso-occlusive events in all 25 evaluable patients',
        laymanSummary:
          'Thirty-five people were treated. Of the twenty-five followed long enough to judge, every one stopped having severe pain crises, against a median of 3.5 a year beforehand.',
        technicalDetails:
          'Phase 1-2, unprespecified interim analysis. As of February 2021, cell collection had begun in 43 patients in Group C and 35 received an infusion, with median follow-up 17.3 months (range 3.7 to 37.6). Engraftment occurred in all 35. Median total haemoglobin rose from 8.5 g/dL at baseline to 11 g/dL or more from month 6 through month 36. HbAT87Q contributed at least 40% of total haemoglobin and was distributed across a mean 85 ± 8% of red cells. Among 25 evaluable patients, all had resolution of severe vaso-occlusive events versus a median of 3.5 events per year (range 2.0 to 13.5) in the 24 months before enrolment.',
        evidenceSource: 'Kanter J et al., N Engl J Med 2022;386:617-628 (HGB-206 Group C)',
        doi: '10.1056/NEJMoa2117175',
        measuredMetric:
          'Severe vaso-occlusive events after infusion: 0 in 25 of 25 evaluable patients',
        auditFlag: 'verified',
      },
      {
        id: 'lovo-a2',
        category: 'failed',
        title: 'A boxed warning for blood cancer, written out of the product\'s own development programme',
        laymanSummary:
          'Two patients in an early group developed acute myeloid leukaemia and one in the pivotal group developed myelodysplastic syndrome. The label now warns about blood cancer and requires monitoring for the rest of the patient\'s life.',
        technicalDetails:
          'The US prescribing information carries a boxed warning: haematologic malignancy has occurred in patients treated with Lyfgenia, and patients must be monitored by complete blood count at least every six months and by integration site analysis at months 6 and 12 and as warranted. At approval, two patients treated in Study 1 Group A — an earlier manufacturing process and transplant procedure — had developed acute myeloid leukaemia, and one patient in Group C with alpha-thalassemia trait had been diagnosed with myelodysplastic syndrome. The mechanism is inherent to the platform: a lentiviral vector integrates semi-randomly and permanently into the genome of a self-renewing stem cell.',
        evidenceSource: 'LYFGENIA US prescribing information, Boxed Warning and Warnings and Precautions',
        auditFlag: 'caution',
      },
      {
        id: 'lovo-a3',
        category: 'conclusion_shift',
        title: 'The first leukaemia case was investigated and attributed to the disease, not the vector',
        laymanSummary:
          'When the first patient developed leukaemia five and a half years after treatment, the obvious suspect was the inserted gene. A detailed investigation concluded the insertion was probably not the cause — and that sickle cell disease plus transplant is itself a cancer risk.',
        technicalDetails:
          'Acute myeloid leukaemia developed in a woman approximately 5.5 years after LentiGlobin for sickle cell disease in the initial Group A cohort of HGB-206. Blast cells did contain a BB305 vector insertion site, but the causality investigation found the leukaemia unlikely to be vector-related given the insertion site\'s location, very low transgene expression in blasts, and no effect on neighbouring gene expression. Several somatic mutations predisposing to acute myeloid leukaemia were present at diagnosis. The published conclusion was that patients with sickle cell disease carry an elevated baseline risk of haematologic malignancy after transplantation, from the disease, the procedure and inadequate prior disease control combined.',
        evidenceSource: 'Goyal S et al., N Engl J Med 2022;386:138-147',
        doi: '10.1056/NEJMoa2109167',
        auditFlag: 'contested',
      },
      {
        id: 'lovo-a4',
        category: 'conclusion_shift',
        title: 'The reassuring verdict on lentiviral insertion did not survive the sister product',
        laymanSummary:
          'Two years later, a different bluebird lentiviral therapy for a brain disease reported seven blood cancers in sixty-seven patients, with the vector sitting in a known leukaemia gene in most of them. That is not the same vector, but it is the same principle.',
        technicalDetails:
          'Elivaldogene autotemcel (Skysona), which uses the Lenti-D vector rather than BB305, produced haematologic cancer in 7 of 67 patients across ALD-102, ALD-104 and the LTF-304 follow-up: six myelodysplastic syndromes and one acute myeloid leukaemia, at 14 to 92 months. In six patients with available data, predominant clones carried vector insertions at MECOM-EVI1 in five and PRDM16 in one — both canonical insertional-oncogenesis loci. This does not transfer directly to Lyfgenia, whose vector, promoter and transgene differ, but it removes the option of treating lentiviral insertional oncogenesis as a solved historical problem.',
        evidenceSource: 'Duncan CN et al., N Engl J Med 2024;391:1287-1301',
        doi: '10.1056/NEJMoa2405541',
        inferredClaim:
          'That modern self-inactivating lentiviral vectors have eliminated insertional oncogenesis',
        auditFlag: 'contested',
      },
      {
        id: 'lovo-a5',
        category: 'inferred',
        title: 'The pivotal analysis was an unprespecified interim look at a phase 1-2 study',
        laymanSummary:
          'The evidence behind this approval is an interim analysis that was not planned in advance, in an early-phase single-arm study, in 25 patients.',
        technicalDetails:
          'The New England Journal publication describes itself as an unprespecified interim analysis of Group C of the ongoing phase 1-2 HGB-206 study. Group C was created mid-study with a more stringent entry criterion of at least four severe vaso-occlusive events in the preceding 24 months, after Groups A and B were used to optimise the manufacturing and transplant process. There is no control arm; the comparator is each patient\'s own pre-enrolment event rate. Median follow-up was 17.3 months.',
        evidenceSource: 'Study design of Kanter 2022, HGB-206 (NCT02140554)',
        doi: '10.1056/NEJMoa2117175',
        inferredClaim:
          'That an unprespecified interim analysis of a single-arm phase 1-2 group carries the evidential weight of a randomised pivotal trial',
        auditFlag: 'caution',
      },
      {
        id: 'lovo-a6',
        category: 'failed',
        title: 'A $3.1 million price, and a company that no longer trades publicly',
        laymanSummary:
          'Lyfgenia launched at $3.1 million, $900,000 above the therapy approved the same week. Eighteen months later the company was taken private for $3.00 a share.',
        technicalDetails:
          'bluebird bio set a US list price of $3.1 million in December 2023 against Vertex\'s $2.2 million for Casgevy. In February 2025 bluebird agreed to be acquired by funds managed by Carlyle and SK Capital at $3.00 per share in cash plus a contingent value right of $6.84 per share tied to a net sales milestone; the acquisition completed on 2 June 2025 and the common stock ceased trading. The clinical result and the commercial result of this product point in opposite directions, and only one of them is on the label.',
        evidenceSource:
          'Reuters, 8 December 2023 (list prices); Carlyle press release, 2 June 2025 (completion of acquisition)',
        auditFlag: 'verified',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Collect the patient\'s own blood stem cells',
        laymanDesc:
          'Plerixafor pushes stem cells out of the marrow into the blood, and a machine collects them over several sessions. Patients are transfused first so the collection itself does not trigger a crisis.',
        molecularDetail:
          'Plerixafor-mobilised autologous CD34+ haematopoietic stem cells are collected by apheresis and immunomagnetically selected, after transfusion to a target haemoglobin to suppress sickling during mobilisation.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'A disabled virus carries a redesigned gene into the DNA',
        laymanDesc:
          'A virus stripped of everything that lets it replicate delivers a new beta-globin gene, which becomes a permanent part of the cell\'s own DNA.',
        molecularDetail:
          'The BB305 self-inactivating lentiviral vector integrates the beta-A-T87Q globin transgene, with erythroid-specific promoter and locus control region elements, into the host genome at a vector copy number measured at release. Integration is semi-random and permanent.',
        iconName: 'Dna',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'One designed substitution blocks the stacking reaction',
        laymanDesc:
          'The added gene is not a plain copy. A single deliberate change at position 87 puts a bulky amino acid exactly where sickle haemoglobin molecules would otherwise lock together.',
        molecularDetail:
          'The T87Q substitution replaces threonine with glutamine at beta-globin position 87, mimicking the corresponding residue of gamma-globin and sterically interfering with the lateral contact that nucleates HbS polymerisation. The transgene product is therefore not merely additional haemoglobin, it is actively anti-sickling.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Conditioning, engraftment, and a new erythroid output',
        laymanDesc:
          'Chemotherapy empties the marrow so the modified cells can take root, then those cells rebuild the blood system from scratch.',
        molecularDetail:
          'Pharmacokinetically dose-adjusted myeloablative busulfan clears the niche; transduced CD34+ cells home to the marrow and reconstitute haematopoiesis, with the erythroid-specific promoter restricting transgene expression to the red-cell lineage.',
        iconName: 'Activity',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Anti-sickling haemoglobin in most red cells',
        laymanDesc:
          'The new haemoglobin makes up a large share of the total, in most red cells, and the pain crises stop.',
        molecularDetail:
          'In HGB-206 Group C, HbAT87Q contributed at least 40% of total haemoglobin across a mean 85 ± 8% of red cells, median total haemoglobin reached 11 g/dL or more from month 6 through month 36, haemolysis markers fell, and all 25 evaluable patients had complete resolution of severe vaso-occlusive events.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'HGB-206 Group C (NCT02140554)',
        phase: 'Phase 1-2, single arm, unprespecified interim analysis',
        sampleSize: 35,
        primaryEndpoint:
          'Complete resolution of severe vaso-occlusive events after infusion, in patients with at least four such events in the preceding 24 months',
        endpointMet: true,
        statisticalPValue:
          'Not reported as a p-value — a single-arm within-patient comparison against each patient\'s own pre-enrolment event rate',
        unreportedAdverseSignals:
          'No haematologic cancer was observed during up to 37.6 months of follow-up in Group C at the time of this publication. Cases in Group A and a later Group C myelodysplastic syndrome are what produced the boxed warning, and they sit outside this analysis window.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Complete resolution of severe vaso-occlusive events in all 25 evaluable Group C patients, against a median 3.5 events per year beforehand',
        'HbAT87Q at 40% or more of total haemoglobin, distributed across a mean 85 ± 8% of red cells',
        'Median total haemoglobin from 8.5 g/dL at baseline to 11 g/dL or more from month 6 through month 36',
        'Engraftment in all 35 patients infused',
      ],
      unsupportedInferences: [
        'That the leukaemia risk has been excluded — the label\'s boxed warning and the required lifelong surveillance say the opposite',
        'That the 2022 causality verdict on the first leukaemia case generalises, when the sister lentiviral product reported 7 haematologic cancers in 67 patients two years later',
        'That an unprespecified interim analysis of 25 patients in a phase 1-2 group is equivalent to a randomised pivotal result',
        'That resolving crises has been shown to prevent stroke, nephropathy or organ failure; none was measured',
      ],
      whatFailedInitially: [
        'Groups A and B of HGB-206 produced insufficient transgene expression and were used to rebuild the manufacturing and transplant process before Group C',
        'Two acute myeloid leukaemias in Group A and one myelodysplastic syndrome in Group C, which together produced the boxed warning',
        'Commercially: a $3.1 million price against a competitor at $2.2 million, and a company taken private at $3.00 per share eighteen months after approval',
      ],
      realWorldOutcome: [
        'One of two gene therapies approved for sickle cell disease on the same day, with no head-to-head trial between them and none planned',
        'Requires the same authorised transplant centre infrastructure and myeloablative conditioning as its competitor, plus lifelong integration site surveillance it does not share',
      ],
    },
    deliverySystem: {
      type: 'Ex vivo lentiviral-transduced autologous CD34+ cell suspension, single intravenous infusion',
      description:
        'One intravenous infusion of the patient\'s own CD34+ cells carrying an integrated beta-A-T87Q globin transgene, given after pharmacokinetically dose-adjusted myeloablative busulfan conditioning. Manufacture requires multiple apheresis cycles and transfusion support beforehand.',
      safetyProfile:
        'Boxed warning for haematologic malignancy, with mandated complete blood counts at least every six months and integration site analysis at months 6 and 12 and as warranted. Additional labelled risks include delayed platelet engraftment, infusion reactions, and the toxicities of myeloablative busulfan — cytopenias, mucositis, febrile neutropenia and infertility. Anti-retroviral medicines must be stopped before mobilisation and apheresis because they interfere with lentiviral transduction.',
    },
    commonQuestions: [
      {
        q: 'Does this cause leukaemia?',
        a: 'The label says haematologic malignancy has occurred in patients treated with it, which is why there is a boxed warning and mandatory lifelong monitoring. Two acute myeloid leukaemias occurred in an early cohort using a different manufacturing process, and one myelodysplastic syndrome in the pivotal group. A detailed investigation of the first leukaemia concluded the vector insertion was probably not the cause and that sickle cell disease plus transplantation carries its own elevated risk. Both things are true at once: the causal question is unsettled, and the risk is real enough that the FDA required a boxed warning.',
        auditNote:
          'The 2024 report of seven haematologic cancers in sixty-seven patients given a related bluebird lentiviral product is the reason this page treats the reassuring 2022 verdict as contested rather than settled.',
      },
      {
        q: 'How is this different from Casgevy?',
        a: 'Casgevy uses CRISPR to break an enhancer so your own fetal haemoglobin gene switches back on, delivered as a protein that the cell destroys within days, adding no DNA. Lyfgenia inserts a new, redesigned beta-globin gene permanently into your chromosomes using a lentiviral vector. The permanence is what makes it work and what creates the malignancy warning. Both use identical myeloablative conditioning, both were approved the same day, and no trial has compared them.',
      },
      {
        q: 'Why does this page show no manufacturing cost or markup?',
        a: 'Because no peer-reviewed cost-of-goods figure exists for an autologous lentiviral cell product, and estimating one would be this page inventing the number a reader is most likely to quote. The $3.1 million list price is stated with its source. The cost side is blank because it is not public.',
      },
      {
        q: 'How long does the effect last?',
        a: 'Unknown beyond the published follow-up. The pivotal publication reported a median 17.3 months with a maximum of 37.6, and the biological argument for permanence is that the transgene sits in a self-renewing stem cell. That is a strong argument, not a measurement. Long-term follow-up studies run for fifteen years and are still running.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Kanter J et al. Biologic and Clinical Efficacy of LentiGlobin for Sickle Cell Disease. N Engl J Med 2022;386:617-628',
        identifier: '10.1056/NEJMoa2117175',
        kind: 'doi',
      },
      {
        label:
          'Goyal S et al. Acute Myeloid Leukemia Case after Gene Therapy for Sickle Cell Disease. N Engl J Med 2022;386:138-147',
        identifier: '10.1056/NEJMoa2109167',
        kind: 'doi',
      },
      {
        label:
          'Duncan CN et al. Hematologic Cancer after Gene Therapy for Cerebral Adrenoleukodystrophy. N Engl J Med 2024;391:1287-1301',
        identifier: '10.1056/NEJMoa2405541',
        kind: 'doi',
      },
      {
        label: 'HGB-206: A Study Evaluating the Safety and Efficacy of Lovo-cel in Severe Sickle Cell Disease',
        identifier: 'NCT02140554',
        kind: 'nct',
      },
      {
        label: 'FDA LYFGENIA product page and package insert',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/lyfgenia',
        kind: 'regulatory',
      },
      {
        label: 'LYFGENIA prescribing information, DailyMed',
        identifier:
          'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=0d1b475e-5781-2bd1-e063-6294a90a7311',
        kind: 'regulatory',
      },
      {
        label:
          'bluebird bio Announces Completion of Acquisition by Carlyle and SK Capital, 2 June 2025',
        identifier:
          'https://www.carlyle.com/media-room/news-release-archive/bluebird-bio-announces-completion-acquisition-carlyle-and-sk',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 3. Onasemnogene abeparvovec (Zolgensma) — the systemic AAV that changed what SMA looks like.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'onasemnogene-abeparvovec',
    name: 'Onasemnogene abeparvovec',
    tradeName: 'Zolgensma',
    sponsor: 'Novartis Gene Therapies (formerly AveXis)',
    targetGene: 'SMN1',
    targetProtein: 'Survival motor neuron (SMN) protein',
    modality: 'CRISPR / Gene Therapy',
    approvalStatus: 'FDA Approved',
    approvalYear: 2019,
    indication:
      'Pediatric patients less than 2 years of age with spinal muscular atrophy with bi-allelic mutations in the SMN1 gene',
    patientFriendlyIndication: 'Spinal muscular atrophy in babies under two',
    anatomicalSite: 'Spinal cord anterior horn motor neurons, reached by systemic AAV9',
    conditionContext: {
      conditionExplainer:
        'Spinal muscular atrophy is caused by losing both copies of SMN1, the gene for a protein every cell needs and motor neurons need most. Without it the motor neurons in the spinal cord die. In the most severe form, type 1, a baby who looked normal at birth loses head control, then the ability to swallow, then the ability to breathe. Almost everyone carries a back-up gene, SMN2, but a splicing quirk means it produces mostly a truncated, useless protein. How many SMN2 copies a child has is the main thing that decides how severe the disease is.',
      whyItMatters:
        'Untreated SMA type 1 killed or permanently ventilated the great majority of children by age two. In the pivotal trial\'s natural history comparator, 6 of 23 untreated infants were alive without permanent ventilation at 14 months. This is the disease against which every SMA therapy is judged, and the reason a single-arm trial against a historical cohort was accepted as pivotal evidence.',
      whoTakesThis:
        'Babies under two years old with genetically confirmed bi-allelic SMN1 mutations. Newborn screening has changed who this actually means: most children now identified are pre-symptomatic, a population the pivotal trial did not study.',
      clinicalGoals:
        'Survival without permanent ventilation, and the acquisition of motor milestones — sitting, and in some children standing and walking — that untreated type 1 patients never reach.',
    },
    oneSentenceVerdict:
      'A single intravenous AAV9 infusion delivering a working SMN1 gene: 13 of 22 infants sat unassisted for 30 seconds at 18 months where none of 23 untreated infants did, and 20 of 22 survived to 14 months without permanent ventilation — measured against a historical cohort, not a randomised control, and carrying a boxed warning for fatal acute liver failure.',
    laymanHowItWorks:
      'Motor neurons need a protein called SMN to stay alive. Your child\'s copies of the gene that makes it are broken. A harmless virus shell, chosen because it can cross from the bloodstream into the nervous system, carries a working copy of the gene into those neurons. It does not join the child\'s chromosomes; it sits alongside them as a separate loop of DNA and starts making the missing protein. Motor neurons that have not yet died can then survive. The ones already lost do not come back, which is why timing decides almost everything.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 78,
    substitutes: {
      summary:
        'Two other approved therapies raise SMN protein by a different route, and both are given repeatedly rather than once. Neither has been compared head-to-head against onasemnogene abeparvovec in a randomised trial, and combining them is common in practice without trial evidence for the combination.',
      conventionalRx: [
        {
          name: 'Nusinersen (Spinraza)',
          class: 'Antisense oligonucleotide, intrathecal',
          howItCompares:
            'Redirects splicing of the back-up SMN2 gene so it makes full-length protein. Given by lumbar puncture, with loading doses and then maintenance every four months, indefinitely. It was the first approved SMA therapy and has the longest treated-patient follow-up.',
          typicalCost: 'Not priced here — no citable single figure applied consistently across markets',
          prosAndCons:
            'Pros: reversible, dose-adjustable, longest clinical experience, no liver toxicity signal. Cons: repeated lumbar punctures for life, and spinal access becomes difficult after scoliosis surgery.',
        },
        {
          name: 'Risdiplam (Evrysdi)',
          class: 'Oral small-molecule SMN2 splicing modifier',
          howItCompares:
            'Same splicing target as nusinersen, taken as a daily liquid by mouth, distributing systemically rather than only into the central nervous system. Continuous dosing, no procedure.',
          typicalCost: 'Not priced here — no citable single figure',
          prosAndCons:
            'Pros: oral, no procedure, systemic exposure. Cons: daily lifelong adherence, and no head-to-head trial against gene therapy.',
        },
        {
          name: 'Onasemnogene abeparvovec, intrathecal (Itvisma)',
          class: 'The same vector and transgene, delivered into cerebrospinal fluid at a fixed dose',
          howItCompares:
            'A separate product approved on 24 November 2025 for patients aged 2 and older, reaching the population the intravenous version cannot. Fixed dosing avoids the enormous vector loads a weight-based intravenous dose would require in an older child.',
          typicalCost: 'Not priced here — no citable figure confirmed at the time of writing',
          prosAndCons:
            'Pros: opens gene therapy to older patients. Cons: the pivotal effect was small — a 1.88-point HFMSE difference against sham.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Treat the corticosteroid taper as part of the treatment, not as an afterthought',
          action:
            'Confirm the plan for the 30-day prednisolone course, the liver function check at day 30, and the 28-day taper — and who to call if liver tests are still abnormal.',
          patientImpact:
            'Both reported fatal cases of acute liver failure occurred roughly six to seven weeks after infusion, with hepatotoxicity appearing within days of the corticosteroid taper starting. The label requires liver monitoring for at least three months and says not to stop corticosteroids abruptly.',
          clinicalPrecaution:
            'This is a monitoring plan set by the treating team. Nothing here is a dosing instruction.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Non-replicating recombinant AAV serotype 9 capsid packaging a self-complementary DNA genome encoding human SMN under a cytomegalovirus enhancer / chicken beta-actin hybrid promoter',
      targetReceptorAffinity:
        'Recommended dose 1.1 x 10^14 vector genomes per kg body weight, infused intravenously over 60 minutes, per the FDA label',
      structureSource: {
        label: 'ZOLGENSMA (onasemnogene abeparvovec-xioi) US package insert, FDA',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/zolgensma',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'ona-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Plasmid and cell bank release, and patient anti-AAV9 antibody screen',
          description:
            'Release the three production plasmids and the HEK293 working cell bank against identity, sequence and adventitious agent specifications. Separately, screen the patient for anti-AAV9 antibodies, because pre-existing immunity blocks transduction and is an exclusion in the clinical programme.',
          reagentsAndBuffer:
            'Sequence-verified transgene, rep/cap and adenoviral helper plasmids; HEK293 working cell bank; mycoplasma PCR and in vitro adventitious agent assays; ELISA for anti-AAV9 binding antibody titre',
        },
        {
          id: 'ona-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Triple transient transfection and vector production',
          description:
            'Transfect adherent or suspension HEK293 cells with the three plasmids in a controlled bioreactor and harvest after several days, when the AAV9 capsid has assembled around the self-complementary genome. Self-complementary packaging removes the need for second-strand synthesis in the target cell, which is why expression begins within days.',
          dependsOnStepId: 'ona-w1',
          reagentsAndBuffer:
            'HEK293 cells, serum-free suspension or adherent medium, polyethylenimine or calcium phosphate transfection reagent, single-use bioreactor with dissolved oxygen and pH control',
        },
        {
          id: 'ona-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Affinity capture and full-capsid enrichment',
          description:
            'Lyse, clarify and capture the vector on an AAV affinity resin, then separate genome-containing capsids from empty ones by density gradient or ion-exchange polishing, and release on vector genome titre, capsid ratio, residual host DNA and replication-competent AAV.',
          dependsOnStepId: 'ona-w2',
          reagentsAndBuffer:
            'AAV affinity chromatography resin, caesium chloride or iodixanol gradient, anion-exchange polishing column, droplet digital PCR for vector genome titre, analytical ultracentrifugation for full/empty ratio',
        },
        {
          id: 'ona-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Corticosteroid cover and single intravenous infusion',
          description:
            'Start systemic corticosteroid equivalent to prednisolone 1 mg/kg/day one day before infusion and continue for 30 days, then infuse 1.1 x 10^14 vg/kg intravenously over 60 minutes. Postpone in any child with an active infection. Repeat administration has never been evaluated.',
          dependsOnStepId: 'ona-w3',
          reagentsAndBuffer:
            'Prednisolone or equivalent at 1 mg/kg/day, infusion kit of 2 to 14 single-use vials at a nominal 2.0 x 10^13 vg/mL, syringe pump',
        },
        {
          id: 'ona-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Liver, platelet, troponin and motor function surveillance',
          description:
            'Monitor liver function for at least three months, platelet counts weekly for the first month then fortnightly through month three, and cardiac troponin I. Track motor function on CHOP INTEND or the Bayley scale and record ventilator-free survival.',
          dependsOnStepId: 'ona-w4',
          reagentsAndBuffer:
            'Serum aminotransferases and bilirubin, automated platelet count, high-sensitivity cardiac troponin I assay, CHOP INTEND and Bayley-III motor assessments',
        },
      ],
    },
    keyAudits: [
      {
        id: 'ona-a1',
        category: 'measured',
        title: 'STR1VE: 13 of 22 infants sat unassisted at 18 months, where 0 of 23 untreated infants did',
        laymanSummary:
          'In babies under six months with the most severe form of the disease, more than half could sit up on their own for half a minute at eighteen months. In the untreated comparison group, none could.',
        technicalDetails:
          'Open-label, single-arm, single-dose phase 3 trial at 12 US sites; 22 patients younger than 6 months with biallelic SMN1 mutations and one or two SMN2 copies, dosed at 1.1 x 10^14 vg/kg. Coprimary endpoints: independent sitting for 30 seconds or longer at the 18-month visit, achieved by 13 of 22 (59%; 97.5% CI 36 to 100) versus 0 of 23 in the Pediatric Neuromuscular Clinical Research natural history cohort (P<0.0001); and survival free of permanent ventilation at 14 months, achieved by 20 of 22 (91%; 79 to 100) versus 6 of 23 (26%; 8 to 44) untreated (P<0.0001).',
        evidenceSource: 'Day JW et al., Lancet Neurol 2021;20:284-293 (STR1VE)',
        doi: '10.1016/S1474-4422(21)00001-6',
        measuredMetric:
          'Independent sitting 30 seconds or longer at 18 months: 13/22 treated versus 0/23 untreated',
        auditFlag: 'verified',
      },
      {
        id: 'ona-a2',
        category: 'inferred',
        title: 'The control group was a database, not a randomised arm',
        laymanSummary:
          'Nobody was randomised. The children who got the drug were compared with records of children who had the disease before the drug existed.',
        technicalDetails:
          'Both pivotal studies are open-label and single-arm. STR1VE compared its 22 patients against 23 untreated infants drawn from the Pediatric Neuromuscular Clinical Research dataset; START compared 15 patients against published natural history. Historical comparison is defensible in a disease with a near-uniform fatal course, and the effect size here is large enough that confounding is an implausible full explanation. It is not the same evidence as a concurrent control, and it cannot separate the drug\'s contribution from improvements in supportive care over the intervening years.',
        evidenceSource: 'Trial designs of Day 2021 (STR1VE) and Mendell 2017 (START)',
        doi: '10.1056/NEJMoa1706198',
        inferredClaim:
          'That a historical-cohort comparison quantifies the treatment effect as precisely as a randomised comparison would',
        auditFlag: 'caution',
      },
      {
        id: 'ona-a3',
        category: 'failed',
        title: 'Boxed warning: acute liver failure with fatal outcomes has been reported',
        laymanSummary:
          'Children have died of liver failure after this infusion. The warning is on the front of the label, and the liver monitoring runs for at least three months.',
        technicalDetails:
          'The US prescribing information carries a boxed warning for serious liver injury and acute liver failure, stating that cases of acute liver failure with fatal outcomes have been reported and that patients with pre-existing liver impairment may be at higher risk. Two fatal cases were reported by Novartis in 2022, occurring approximately six to seven weeks after infusion with hepatotoxicity presenting roughly one to ten days after the corticosteroid taper began; the patients were aged 4 months and 28 months. The label mandates liver assessment before infusion, systemic corticosteroid for 30 days with a graded taper, liver monitoring for at least three months, and specialist referral if abnormalities persist above twice the upper limit of normal.',
        evidenceSource:
          'ZOLGENSMA US prescribing information, Boxed Warning and Sections 2.1, 2.3, 5.1',
        auditFlag: 'caution',
      },
      {
        id: 'ona-a4',
        category: 'conclusion_shift',
        title: 'The FDA disclosed that animal test data in the approval application had been manipulated',
        laymanSummary:
          'A month after approving the drug, the FDA announced that the manufacturer had told it about manipulated data in animal product-testing submitted with the application — and that the manufacturer had known before approval.',
        technicalDetails:
          'On 6 August 2019 the FDA issued a public statement: on 28 June 2019, after the 24 May 2019 approval, AveXis informed the agency of a data manipulation issue affecting the accuracy of certain animal product-testing data in the biologics licence application. The FDA said its concerns were limited to a portion of product testing data used to develop the manufacturing process, that the data did not change its positive assessment of the human clinical trials, and that Zolgensma should remain on the market, while stating that the integrity of the product testing data remained a matter it was assessing. Two senior AveXis executives were terminated. No regulatory action was ultimately taken against the company.',
        evidenceSource:
          'FDA Statement on data accuracy issues with recently approved gene therapy, 6 August 2019',
        auditFlag: 'contested',
      },
      {
        id: 'ona-a5',
        category: 'measured',
        title: 'START: all 15 infants alive and event-free at 20 months against 8% historical survival',
        laymanSummary:
          'The first-in-human study treated fifteen babies. All were alive and off permanent ventilation at twenty months, where historically about 8 in 100 would have been. Two of them walked.',
        technicalDetails:
          'Phase 1, open-label, dose-escalation: 3 patients at 6.7 x 10^13 vg/kg and 12 at 2.0 x 10^14 vg/kg. As of the 7 August 2017 data cutoff, all 15 were alive and event-free at 20 months of age against a historical survival rate of 8%. In the high-dose cohort, CHOP INTEND rose 9.8 points at one month and 15.4 points at three months from baseline, against a decline in historical cohorts; 11 of 12 sat unassisted, 9 rolled over, 11 fed orally and could speak, and 2 walked independently. Elevated serum aminotransferases occurred in 4 patients and were attenuated by prednisolone — the first signal of the toxicity that later became a boxed warning.',
        evidenceSource: 'Mendell JR et al., N Engl J Med 2017;377:1713-1722 (START)',
        doi: '10.1056/NEJMoa1706198',
        measuredMetric: 'Survival free of permanent ventilation at 20 months: 15/15 versus 8% historical',
        auditFlag: 'verified',
      },
      {
        id: 'ona-a6',
        category: 'conclusion_shift',
        title:
          'The intrathecal version reached older patients in 2025 — with a much smaller measured effect',
        laymanSummary:
          'A version injected into the spinal fluid was approved in November 2025 for patients aged two and over. It beat a sham procedure, but by under two points on a 66-point motor scale.',
        technicalDetails:
          'STEER (NCT05089656) randomised 126 treatment-naive patients aged 2 to under 18 who could sit but had never walked, to intrathecal onasemnogene abeparvovec (n=75) or a sham procedure (n=51), double-blind for 52 weeks. The primary endpoint, change from baseline in the Hammersmith Functional Motor Scale-Expanded, favoured treatment with a least-squares mean difference of 1.88 (95% CI 0.51 to 3.25; P=0.0074). Two treated participants and one sham participant developed sensory symptoms. Itvisma (onasemnogene abeparvovec-brve) was approved by the FDA on 24 November 2025 for patients aged 2 and older. The contrast with the infant data is the point: the same vector and transgene produce a transformative result in a pre-symptomatic newborn and a modest one in a child whose motor neurons are already gone.',
        evidenceSource: 'Nature Medicine 2026;32:481-487 (STEER); FDA ITVISMA product page',
        doi: '10.1038/s41591-025-04103-w',
        measuredMetric: 'HFMSE change at week 52, least-squares mean difference versus sham: 1.88 points',
        auditFlag: 'verified',
      },
      {
        id: 'ona-a7',
        category: 'inferred',
        title: 'Durability is a promise about a non-integrating genome that has never been re-dosed',
        laymanSummary:
          'The gene does not join the child\'s chromosomes — it sits beside them. Whether it keeps working as the child grows has not been established, and the label says repeat dosing has never been tested.',
        technicalDetails:
          'The AAV9 genome persists mainly as a non-integrating episome. Episomes are diluted by cell division, so durability depends on the target cell being post-mitotic — which motor neurons are, and hepatocytes and cardiomyocytes are not. The label\'s Limitations of Use state that the safety and effectiveness of repeat administration have not been evaluated and that use in patients with advanced SMA has not been evaluated. A second dose is in any case obstructed by the anti-AAV9 antibodies the first dose induces. Warnings also list a theoretical risk of tumorigenicity from AAV vector DNA integration, with a request to report any tumours.',
        evidenceSource: 'ZOLGENSMA US prescribing information, Limitations of Use and Section 5.6',
        inferredClaim:
          'That a single infusion in infancy produces lifelong SMN expression, when no re-dosing option exists if it does not',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'One intravenous infusion, under steroid cover',
        laymanDesc:
          'The dose goes into a vein over an hour. A steroid is started the day before and continued for a month, because the immune system reacts to the viral shell and that reaction is what damages the liver.',
        molecularDetail:
          'A weight-based dose of 1.1 x 10^14 vg/kg is infused over 60 minutes, with prednisolone-equivalent 1 mg/kg/day beginning one day before and continuing 30 days. Children with pre-existing anti-AAV9 antibodies were excluded from the clinical programme because neutralising antibody blocks transduction.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'AAV9 crosses out of the blood and into the nervous system',
        laymanDesc:
          'Most viral shells cannot get from the bloodstream into the brain and spinal cord. This one can, which is the whole reason it was chosen.',
        molecularDetail:
          'Serotype 9 was selected for its capacity to traverse the blood-brain barrier after systemic administration and transduce spinal cord anterior horn motor neurons, alongside high hepatic and cardiac uptake that accounts for the liver and troponin signals on the label.',
        iconName: 'Waves',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The genome stays beside the chromosomes, not inside them',
        laymanDesc:
          'The delivered gene forms a separate loop of DNA in the nucleus. It is not stitched into the child\'s own chromosomes, so it cannot disrupt a neighbouring gene.',
        molecularDetail:
          'The self-complementary genome persists predominantly as a non-integrating nuclear episome, bypassing the rate-limiting second-strand synthesis step of conventional single-stranded AAV. Absence of integration is why there is no insertional-oncogenesis boxed warning, and episomal dilution in dividing cells is why durability depends on the target being post-mitotic.',
        iconName: 'CircleDot',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'Motor neurons start making SMN protein again',
        laymanDesc:
          'The hybrid promoter drives the gene continuously, so the neuron produces the protein it has been missing since before birth.',
        molecularDetail:
          'A cytomegalovirus enhancer / chicken beta-actin hybrid promoter drives constitutive transcription of human SMN. Restoring SMN supports small nuclear ribonucleoprotein assembly and the motor-neuron-specific functions whose loss drives degeneration.',
        iconName: 'Cpu',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Milestones untreated infants never reach',
        laymanDesc:
          'Neurons that were still alive at the time of infusion survive, and children gain abilities the disease would have taken. The neurons already lost do not come back.',
        molecularDetail:
          'In STR1VE, 13 of 22 achieved independent sitting for 30 seconds or longer at 18 months versus 0 of 23 untreated, and 20 of 22 survived free of permanent ventilation at 14 months versus 6 of 23. The gradient between these results, the pre-symptomatic newborn-screening population, and the 1.88-point HFMSE gain in older children given the intrathecal product is the clearest evidence in the field that this drug preserves motor neurons rather than replacing them.',
        iconName: 'TrendingUp',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'STR1VE (NCT03306277)',
        phase: 'Phase 3, open label, single arm',
        sampleSize: 22,
        primaryEndpoint:
          'Coprimary: independent sitting for 30 seconds or longer at 18 months, and survival free of permanent ventilation at 14 months',
        endpointMet: true,
        statisticalPValue: 'P < 0.0001 for both coprimary endpoints versus the PNCR natural history cohort',
        unreportedAdverseSignals:
          'Every patient had at least one adverse event, most commonly pyrexia. Serious events included bronchiolitis, pneumonia, respiratory distress and RSV bronchiolitis. Three serious events were treatment-related or possibly related: two elevated hepatic aminotransferases and one hydrocephalus.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'START (NCT02122952)',
        phase: 'Phase 1, open label, dose escalation',
        sampleSize: 15,
        primaryEndpoint: 'Safety; secondary endpoint time to death or permanent ventilatory assistance',
        endpointMet: true,
        statisticalPValue:
          'Not reported as a p-value — descriptive comparison against historical cohorts',
        unreportedAdverseSignals:
          'Elevated serum aminotransferases in 4 of 15 patients, attenuated by prednisolone. This early signal is the origin of the boxed warning added later.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'STEER (NCT05089656), intrathecal formulation',
        phase: 'Phase 3, randomised, sham-controlled, double-blind',
        sampleSize: 126,
        primaryEndpoint:
          'Change from baseline in Hammersmith Functional Motor Scale-Expanded score at week 52',
        endpointMet: true,
        statisticalPValue: 'P = 0.0074; least-squares mean difference 1.88 (95% CI 0.51 to 3.25)',
        unreportedAdverseSignals:
          'Sensory symptoms in 2 of 75 treated participants and 1 of 51 sham participants. Transaminase increases infrequent, mostly low grade and transient.',
        independentReplicationStatus: 'Unreplicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        '13 of 22 infants achieved independent sitting for 30 seconds or longer at 18 months, versus 0 of 23 untreated',
        '20 of 22 survived free of permanent ventilation at 14 months, versus 6 of 23 untreated',
        'CHOP INTEND rose 9.8 points at one month and 15.4 points at three months in the START high-dose cohort',
        'A 1.88-point HFMSE advantage over sham at 52 weeks for the intrathecal product in children aged 2 to under 18',
      ],
      unsupportedInferences: [
        'That a single infusion produces lifelong expression — the genome is episomal, re-dosing has never been evaluated, and anti-AAV9 antibodies foreclose a second attempt',
        'That the historical-cohort comparison measures the treatment effect as precisely as a randomised control would',
        'That results in symptomatic infants transfer to the pre-symptomatic newborn-screened population that now dominates real-world use, or to older children',
        'That "cure" is the demonstrated claim, when motor neurons already lost at the time of infusion are not recovered',
      ],
      whatFailedInitially: [
        'Manipulated animal product-testing data in the approval application, disclosed by the FDA on 6 August 2019 and known to the manufacturer before approval',
        'Fatal acute liver failure in two patients reported in 2022, producing the current boxed warning language',
        'Thrombotic microangiopathy, which the label warns can be life-threatening or fatal',
      ],
      realWorldOutcome: [
        'Newborn screening for SMA has shifted the treated population from symptomatic infants to pre-symptomatic newborns, a group outside the pivotal trial',
        'An intrathecal version, Itvisma, was approved on 24 November 2025 for patients aged 2 and older, extending the platform to patients the intravenous dose cannot serve',
        'A US list price of $2.125 million at launch made this the most expensive medicine in the world in 2019, a title it has since lost several times over',
      ],
    },
    deliverySystem: {
      type: 'Recombinant AAV9 vector, single intravenous infusion',
      description:
        'One intravenous infusion of 1.1 x 10^14 vector genomes per kg over 60 minutes, supplied as a kit of 2 to 14 single-use vials at a nominal 2.0 x 10^13 vg/mL. Systemic corticosteroid begins one day before and continues for 30 days, followed by a graded 28-day taper. Infusion is postponed in any child with an active infection.',
      safetyProfile:
        'Boxed warning for serious liver injury and acute liver failure, including fatal cases. Further labelled warnings cover systemic immune response, thrombocytopenia, thrombotic microangiopathy which can be fatal, elevated cardiac troponin I, infusion-related reactions, and a theoretical risk of tumorigenicity from AAV vector DNA integration. The most common adverse reactions at 5% or more are elevated aminotransferases and vomiting.',
    },
    commonQuestions: [
      {
        q: 'Is one infusion really enough for life?',
        a: 'That is the hope, not the finding. The delivered gene sits beside the chromosomes rather than inside them, and such episomes are lost when a cell divides — which is why the strategy works best in motor neurons, which do not divide. Whether expression holds as a child grows into adulthood has not been established, and the label states plainly that repeat administration has never been evaluated. In practice a second dose is also blocked by the antibodies the first dose raises against the viral shell.',
        auditNote:
          'This, and the historical rather than randomised control group, are the two reasons the confidence score here sits below what the effect size alone would justify.',
      },
      {
        q: 'How dangerous is the liver injury?',
        a: 'Serious enough for a boxed warning that states fatal cases of acute liver failure have been reported. Two such deaths were reported in 2022, roughly six to seven weeks after infusion, with liver injury appearing within days of the corticosteroid taper starting. The label requires liver assessment before infusion, a full month of corticosteroid, liver monitoring for at least three months, and specialist referral if abnormalities persist. Children with pre-existing liver impairment may be at higher risk.',
      },
      {
        q: 'Was there really a data scandal?',
        a: 'Yes, and the FDA said so publicly. On 6 August 2019 the agency disclosed that AveXis had informed it on 28 June — after the 24 May approval — of manipulated animal product-testing data in the licence application. The FDA said the affected data concerned manufacturing process development rather than the human trials, that its positive assessment of the clinical evidence was unchanged, and that the product should remain on the market. Two senior executives were terminated and no regulatory action followed. The clinical result and the data integrity question are separate findings, and this page keeps them separate.',
      },
      {
        q: 'Why does this page show no manufacturing cost or markup?',
        a: 'Because no peer-reviewed cost-of-goods figure exists for a commercial-scale AAV batch. The published literature models production yield, not dollars per dose. The $2.125 million launch price is stated with its source; the cost side is left blank rather than invented.',
      },
      {
        q: 'My child was found by newborn screening and has no symptoms. Does the trial evidence apply?',
        a: 'Not directly. STR1VE and START enrolled symptomatic infants, and every headline number on this page comes from them. Pre-symptomatic treatment is now the common real-world situation and is supported by separate studies, but it is a different population with a different expected outcome. The consistent finding across the whole programme is that the earlier the dose, the more motor neurons survive — which is an argument for early treatment, not evidence that the symptomatic-infant numbers transfer.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Day JW et al. Onasemnogene abeparvovec gene therapy for symptomatic infantile-onset spinal muscular atrophy in patients with two copies of SMN2 (STR1VE). Lancet Neurol 2021;20:284-293',
        identifier: '10.1016/S1474-4422(21)00001-6',
        kind: 'doi',
      },
      {
        label:
          'Mendell JR et al. Single-Dose Gene-Replacement Therapy for Spinal Muscular Atrophy (START). N Engl J Med 2017;377:1713-1722',
        identifier: '10.1056/NEJMoa1706198',
        kind: 'doi',
      },
      {
        label:
          'Intrathecal onasemnogene abeparvovec in treatment-naive patients with spinal muscular atrophy: a phase 3, randomized controlled trial (STEER). Nat Med 2026;32:481-487',
        identifier: '10.1038/s41591-025-04103-w',
        kind: 'doi',
      },
      {
        label: 'STR1VE: Gene Replacement Therapy Clinical Trial for Participants With SMA Type 1',
        identifier: 'NCT03306277',
        kind: 'nct',
      },
      {
        label: 'START: Gene Transfer Clinical Trial for Spinal Muscular Atrophy Type 1',
        identifier: 'NCT02122952',
        kind: 'nct',
      },
      {
        label: 'STEER: Intrathecal OAV101 in patients with spinal muscular atrophy',
        identifier: 'NCT05089656',
        kind: 'nct',
      },
      {
        label: 'FDA ZOLGENSMA product page and package insert',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/zolgensma',
        kind: 'regulatory',
      },
      {
        label: 'FDA ITVISMA product page (onasemnogene abeparvovec-brve), approved 24 November 2025',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/itvisma',
        kind: 'regulatory',
      },
      {
        label:
          'FDA Statement on data accuracy issues with recently approved gene therapy, 6 August 2019',
        identifier:
          'https://www.fda.gov/news-events/press-announcements/statement-data-accuracy-issues-recently-approved-gene-therapy',
        kind: 'regulatory',
      },
      {
        label: 'Novartis: Zolgensma acute liver failure update (2022 fatal cases)',
        identifier: 'https://www.novartis.com/news/zolgensma-acute-liver-failure-update',
        kind: 'url',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 4. Voretigene neparvovec (Luxturna) — the first FDA-approved in vivo gene therapy.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'voretigene-neparvovec',
    name: 'Voretigene neparvovec',
    tradeName: 'Luxturna',
    sponsor: 'Spark Therapeutics (a member of the Roche Group)',
    targetGene: 'RPE65',
    targetProtein: 'RPE65 retinoid isomerohydrolase',
    modality: 'CRISPR / Gene Therapy',
    approvalStatus: 'FDA Approved',
    approvalYear: 2017,
    indication:
      'Patients with confirmed biallelic RPE65 mutation-associated retinal dystrophy who have viable retinal cells as determined by the treating physician',
    patientFriendlyIndication: 'An inherited form of childhood blindness caused by two faulty RPE65 genes',
    anatomicalSite: 'Retinal pigment epithelium, reached by subretinal injection',
    conditionContext: {
      conditionExplainer:
        'Seeing depends on a chemical loop. Light bends a molecule called retinal, and an enzyme in the layer behind the retina, RPE65, bends it back so it can be used again. If both copies of the RPE65 gene are broken, that recycling stops. Vision is poor from early childhood, night blindness comes first, and the photoreceptors themselves slowly die.',
      whyItMatters:
        'This was the first in vivo gene therapy approved in the United States: a gene delivered directly into a person\'s body rather than into cells outside it. The eye was chosen because it is small, enclosed, immune-privileged, and directly injectable, so a modest dose reaches the target and stays there. Everything about the AAV field\'s later ambitions rests on this proof.',
      whoTakesThis:
        'Adults and children with genetically confirmed biallelic RPE65 mutations, provided enough viable retina remains for the injected cells to be worth rescuing.',
      clinicalGoals:
        'Improved functional vision in dim light — the ability to navigate an obstacle course at lower illumination than before. Not restored sight, and not halted degeneration.',
    },
    oneSentenceVerdict:
      'The first in vivo gene therapy approved in the United States: subretinal AAV2 carrying a working RPE65 gene improved navigation of a dim obstacle course by a median of two light levels versus none in controls, while visual acuity, the standard measure of sight, did not differ significantly from control.',
    laymanHowItWorks:
      'The layer of cells behind your retina runs a chemical recycling plant that resets the molecule your eye uses to detect light. Both your copies of the gene for the key enzyme are broken, so the plant has stopped. A surgeon lifts the retina slightly and injects a fluid containing a harmless virus shell carrying a working copy of that gene into the cells underneath. Those cells start making the enzyme again, the recycling restarts, and the photoreceptors that are still alive can respond to much dimmer light than before.',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 72,
    substitutes: {
      summary:
        'There is no drug alternative. What exists instead is low-vision rehabilitation, mobility training and assistive technology, which address the same problem — navigating the world — without touching the biology. Vitamin A supplementation is specifically not a substitute here and can be harmful in some retinal dystrophies.',
      conventionalRx: [
        {
          name: 'Low-vision rehabilitation and orientation and mobility training',
          class: 'Non-pharmacological rehabilitation',
          howItCompares:
            'Targets the same outcome the pivotal endpoint measured — independent navigation in low light — by training and equipment rather than by biology. It is complementary, not competing, and it is available to patients this therapy cannot help.',
          typicalCost: 'Not priced here — varies by health system',
          prosAndCons:
            'Pros: no surgical risk, benefits everyone regardless of genotype. Cons: does not change the underlying degeneration.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Do not take high-dose vitamin A on the assumption it helps retinal disease',
          action:
            'Raise any supplement plan with the retinal specialist before starting it, specifically including vitamin A.',
          patientImpact:
            'High-dose vitamin A has been studied in retinitis pigmentosa with contested results and is contraindicated in some genotypes. RPE65-mediated dystrophy is a defect in the enzyme that processes retinoids, which is precisely the wrong place to assume more substrate helps.',
          clinicalPrecaution:
            'This is a caution, not a treatment. Retinoid handling in this disease is abnormal by definition.',
        },
        {
          name: 'Ask whether your outcome is measured as functional vision or as visual acuity',
          action:
            'Ask which measure the treating team will use to judge success, and what the label reports for each.',
          patientImpact:
            'The approval rests on a mobility test scored in light levels. The FDA label states that the change in visual acuity from baseline to year 1 was not significantly different between treated and control groups. Those are different questions and the answers differ.',
          clinicalPrecaution:
            'Neither measure captures the ongoing degeneration, which continues regardless.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Replication-deficient recombinant AAV serotype 2 capsid packaging a human RPE65 complementary DNA under a hybrid chicken beta-actin promoter',
      targetReceptorAffinity:
        'Dose 1.5 x 10^11 vector genomes per eye in a total subretinal volume of 0.3 mL, per the FDA label',
      structureSource: {
        label: 'LUXTURNA (voretigene neparvovec-rzyl) US package insert, FDA',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/luxturna',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'vor-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Genotype confirmation and viable-retina assessment',
          description:
            'Confirm biallelic pathogenic RPE65 variants by sequencing, then image the retina to establish that enough viable photoreceptor tissue remains for rescue to be possible. The label makes viable retinal cells part of the indication, so this step is an eligibility gate, not a formality.',
          reagentsAndBuffer:
            'Targeted or whole-exome sequencing with variant classification, spectral-domain optical coherence tomography, fundus autofluorescence, full-field light sensitivity threshold testing',
        },
        {
          id: 'vor-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'AAV2 vector production by triple transfection',
          description:
            'Produce the vector in HEK293 cells transfected with the transgene, rep/cap and helper plasmids, and harvest once capsids carrying the RPE65 expression cassette have assembled.',
          dependsOnStepId: 'vor-w1',
          reagentsAndBuffer:
            'HEK293 cells, RPE65 transgene plasmid with hybrid chicken beta-actin promoter, AAV2 rep/cap plasmid, adenoviral helper plasmid, transfection reagent',
        },
        {
          id: 'vor-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Purification, dilution and syringe preparation',
          description:
            'Purify by chromatography, release on vector genome titre and purity, then thaw and dilute to the injectable concentration and draw into the delivery syringe within the window the label specifies. The dose is small — 1.5 x 10^11 vg in 0.3 mL of subretinal volume per eye.',
          dependsOnStepId: 'vor-w2',
          reagentsAndBuffer:
            'Affinity and ion-exchange chromatography, formulation buffer with poloxamer 188, droplet digital PCR titre assay, 1 mL sterile syringe with subretinal injection cannula',
        },
        {
          id: 'vor-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Vitrectomy and subretinal injection, one eye at a time',
          description:
            'Perform a pars plana vitrectomy, raise a subretinal bleb away from the fovea and inject the vector beneath the retina. The second eye is treated in a separate procedure, 6 to 18 days later in the pivotal trial. Systemic corticosteroid brackets each procedure.',
          dependsOnStepId: 'vor-w3',
          reagentsAndBuffer:
            'Pars plana vitrectomy system, subretinal injection cannula, balanced salt solution, perioperative systemic prednisone',
        },
        {
          id: 'vor-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Mobility testing, light sensitivity and atrophy surveillance',
          description:
            'Score multi-luminance mobility testing at seven illumination levels from 400 lux to 1 lux, measure full-field light sensitivity threshold, and image serially for chorioretinal atrophy, macular abnormalities and retinal tears — the last of these being a labelled risk and the most common real-world adverse event.',
          dependsOnStepId: 'vor-w4',
          reagentsAndBuffer:
            'Standardised MLMT obstacle course with videotaped independent grading, full-field light sensitivity threshold testing, spectral-domain optical coherence tomography, intraocular pressure monitoring',
        },
      ],
    },
    keyAudits: [
      {
        id: 'vor-a1',
        category: 'measured',
        title: 'A randomised, controlled trial — the rarest thing in this modality',
        laymanSummary:
          'Thirty-one people were randomly assigned, two to one, to treatment or no treatment, and independent graders who did not know which was which scored the results. Almost no gene therapy has this design.',
        technicalDetails:
          'Open-label, randomised, controlled phase 3 trial at two US sites. 31 individuals aged 3 or older with biallelic RPE65 mutations, best-corrected visual acuity 20/60 or worse or visual field under 20 degrees, randomised 2:1 to bilateral subretinal voretigene neparvovec (n=21) or control (n=10), stratified by age and baseline mobility level. One participant withdrew from each group, leaving a modified intention-to-treat population of 20 and 9. Graders assessing the primary outcome were masked to treatment group.',
        evidenceSource: 'Russell S et al., Lancet 2017;390:849-860',
        doi: '10.1016/S0140-6736(17)31868-8',
        measuredMetric: 'Randomised 2:1, masked independent grading of the primary endpoint',
        auditFlag: 'verified',
      },
      {
        id: 'vor-a2',
        category: 'measured',
        title: 'A 1.6 light-level advantage on the mobility test at one year',
        laymanSummary:
          'Treated participants could complete a navigation course at much dimmer light than before. Thirteen of twenty passed at the dimmest level tested, roughly a moonless night, where none of the control group did.',
        technicalDetails:
          'Mean bilateral MLMT change at 1 year was 1.8 light levels (SD 1.1) with treatment versus 0.2 (SD 1.0) with control, a difference of 1.6 (95% CI 0.72 to 2.41; P=0.0013). 13 of 20 treated but no control participants passed at 1 lux, the lowest level tested. The FDA label reports the same study by median: MLMT score change 2 (min 0, max 4) treated versus 0 (min -1, max 2) control, P=0.001 bilaterally and P=0.003 for the first-treated eye, with 11 of 21 treated versus 1 of 10 control achieving a change of two or more, the threshold the label calls clinically meaningful.',
        evidenceSource: 'Russell 2017; LUXTURNA US prescribing information, Section 14, Tables 2 and 3',
        doi: '10.1016/S0140-6736(17)31868-8',
        measuredMetric: 'Bilateral MLMT change at 1 year: 1.8 versus 0.2 light levels, difference 1.6',
        auditFlag: 'verified',
      },
      {
        id: 'vor-a3',
        category: 'inferred',
        title: 'Visual acuity — the standard measure of sight — did not differ significantly',
        laymanSummary:
          'The eye chart did not improve significantly. The measure that did improve was a walking test through an obstacle course, which is a real ability but not the same claim as better vision.',
        technicalDetails:
          'The FDA label states directly: "The change in visual acuity from Baseline to Year 1 was not significantly different between the LUXTURNA and control groups." Full-field light sensitivity threshold testing did improve significantly. The approval therefore rests on functional vision in dim light, not on acuity, and the distinction is load-bearing: a patient can gain two MLMT light levels and read no further down the chart.',
        evidenceSource: 'LUXTURNA US prescribing information, Section 14 Clinical Studies',
        inferredClaim:
          'That improved navigation in dim light means restored or improved sight in the ordinary sense of the word',
        auditFlag: 'caution',
      },
      {
        id: 'vor-a4',
        category: 'inferred',
        title: 'The primary endpoint was invented for this product, and patented',
        laymanSummary:
          'The obstacle course used to prove the drug works did not exist before this trial. The sponsor developed it, and the trial\'s own disclosures record patent applications on it licensed to the sponsor.',
        technicalDetails:
          'Multi-luminance mobility testing scores a videotaped navigation course at seven illumination levels from 400 lux to 1 lux, with a score of -1 for failure at 400 lux. The Lancet paper\'s declaration of interests records that several authors, including sponsor employees, hold a patent pending pertaining to the primary endpoint measure licensed to Spark Therapeutics. A sponsor-developed, sponsor-licensed endpoint is not disqualifying — no pre-existing instrument measured what this therapy was meant to change — but it removes the independence a standard endpoint would carry, and it makes cross-product comparison impossible.',
        evidenceSource: 'Russell 2017, Declaration of interests; LUXTURNA label Section 14',
        doi: '10.1016/S0140-6736(17)31868-8',
        inferredClaim:
          'That a sponsor-developed and sponsor-licensed endpoint carries the same independence as an established clinical measure',
        auditFlag: 'caution',
      },
      {
        id: 'vor-a5',
        category: 'failed',
        title: 'Chorioretinal atrophy is the most common real-world adverse event',
        laymanSummary:
          'In a registry of 103 treated patients, one in eight developed patches of atrophy in the treated retina. Retinal thinning after this injection is now a labelled risk.',
        technicalDetails:
          'PERCEIVE, a prospective post-authorisation registry study, reported outcomes in 103 patients with a mean follow-up of 0.8 years (maximum 2.3). Thirty-five patients (34%) had ocular treatment-emergent adverse events, most frequently related to chorioretinal atrophy in 13 (12.6%). Eighteen patients (17.5%; 24 eyes) had ocular events of special interest, including procedure-related intraocular inflammation or infection in 7. The label separately warns of endophthalmitis, permanent decline in visual acuity, retinal abnormalities including chorioretinal atrophy, raised intraocular pressure, expansion of intraocular air bubbles and cataract.',
        evidenceSource: 'Fischer MD et al., Biomolecules 2024;14:122 (PERCEIVE)',
        doi: '10.3390/biom14010122',
        measuredMetric: 'Chorioretinal atrophy in 13 of 103 registry patients (12.6%)',
        auditFlag: 'caution',
      },
      {
        id: 'vor-a6',
        category: 'inferred',
        title: 'The therapy replaces an enzyme; it does not stop the retina degenerating',
        laymanSummary:
          'The treatment restarts a chemical process in one layer of cells. The photoreceptors that were dying before the injection go on dying afterwards.',
        technicalDetails:
          'RPE65 encodes the isomerohydrolase of the visual cycle in the retinal pigment epithelium. Restoring it restores retinoid recycling; it does not address the photoreceptor degeneration that the deficiency has already caused, which is why the indication requires viable retinal cells and why earlier treatment is expected to yield more. In PERCEIVE the mean change in full-field light sensitivity threshold with white light was -16.59 dB at month 1 and -13.67 dB at year 2 — a large gain that is smaller at two years than at one month, in a small and shrinking number of eyes. Whether that is regression to a durable plateau or the leading edge of a decline is not resolved by the published follow-up, and long-term studies run to fifteen years.',
        evidenceSource: 'PERCEIVE, Biomolecules 2024;14:122; LUXTURNA label Indications and Usage',
        doi: '10.3390/biom14010122',
        inferredClaim:
          'That a one-off enzyme replacement halts a degenerative retinal disease rather than improving function in the tissue that survives',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'Surgery lifts the retina and places the dose underneath it',
        laymanDesc:
          'The gel inside the eye is removed, a tiny blister of fluid is raised under the retina away from the centre of vision, and the treatment is injected into it. Each eye is done separately.',
        molecularDetail:
          'Pars plana vitrectomy followed by subretinal injection of 1.5 x 10^11 vector genomes in 0.3 mL, deliberately away from the fovea because injection in its immediate vicinity risks macular abnormalities. The second eye follows in a separate procedure.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'AAV2 enters the retinal pigment epithelium',
        laymanDesc:
          'The virus shell is taken up by the layer of cells directly behind the retina — the exact cells that run the recycling plant.',
        molecularDetail:
          'AAV2 binds heparan sulphate proteoglycan and co-receptors on retinal pigment epithelial cells and is endocytosed. The subretinal space places the vector in direct contact with the target layer, which is why 1.5 x 10^11 vg suffices where a systemic AAV dose runs to 10^14.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'The gene stays as a loop in the nucleus and is read continuously',
        laymanDesc:
          'The delivered gene does not join the cell\'s chromosomes. It sits alongside them and is read, and because these cells barely divide, it can stay for years.',
        molecularDetail:
          'The RPE65 cassette persists as a non-integrating episome under a hybrid chicken beta-actin promoter. Retinal pigment epithelial cells are essentially post-mitotic, so episomal dilution is minimal — the structural reason ocular AAV durability outperforms hepatic AAV durability.',
        iconName: 'CircleDot',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The visual cycle restarts',
        laymanDesc:
          'The enzyme bends the light-detecting molecule back into its usable shape, so photoreceptors can be reloaded and fire again.',
        molecularDetail:
          'RPE65 isomerohydrolase converts all-trans-retinyl ester to 11-cis-retinol, which is oxidised to 11-cis-retinal and returned to photoreceptors to regenerate rhodopsin and cone opsins. Without it the chromophore supply collapses, which is why night vision fails first.',
        iconName: 'Recycle',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Navigation in dimmer light — but not a better eye chart',
        laymanDesc:
          'Patients could walk a course at light levels they could not manage before, some of them down to near-darkness. Reading letters on a chart did not improve significantly.',
        molecularDetail:
          'Bilateral MLMT change at 1 year was 1.8 light levels versus 0.2 for control, difference 1.6 (95% CI 0.72 to 2.41; P=0.0013), with 13 of 20 treated participants passing at 1 lux. Full-field light sensitivity threshold improved significantly; visual acuity did not differ significantly between groups.',
        iconName: 'Gauge',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'Study 302 (NCT00999609)',
        phase: 'Phase 3, randomised, controlled, open label with masked grading',
        sampleSize: 31,
        primaryEndpoint: 'One-year change in bilateral multi-luminance mobility test performance',
        endpointMet: true,
        statisticalPValue: 'P = 0.0013 (difference 1.6 light levels, 95% CI 0.72 to 2.41)',
        unreportedAdverseSignals:
          'No product-related serious adverse events or deleterious immune responses in the trial. The chorioretinal atrophy signal emerged later, in post-authorisation registry data.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'PERCEIVE post-authorisation registry',
        phase: 'Prospective, multicentre, registry-based observational study',
        sampleSize: 103,
        primaryEndpoint: 'Real-world safety and effectiveness up to 2 years',
        endpointMet: true,
        statisticalPValue: 'Descriptive; no hypothesis test — an observational registry with no control arm',
        unreportedAdverseSignals:
          'Ocular treatment-emergent adverse events in 34% of patients, chorioretinal atrophy in 12.6%, procedure-related intraocular inflammation or infection in 7.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Bilateral MLMT change at 1 year: 1.8 light levels treated versus 0.2 control, difference 1.6 (95% CI 0.72 to 2.41; P=0.0013)',
        '13 of 20 treated participants passed the mobility test at 1 lux; 0 of 9 controls did',
        'Full-field light sensitivity threshold improved significantly versus control',
        'Chorioretinal atrophy in 13 of 103 patients (12.6%) in the post-authorisation registry',
      ],
      unsupportedInferences: [
        'That vision was restored — visual acuity did not differ significantly from control at one year, per the FDA label',
        'That the degeneration is halted; the therapy replaces a metabolic enzyme and the indication itself requires viable retina remaining',
        'That the mobility gain is comparable to any other product\'s endpoint, when the endpoint was created for this trial and is licensed to its sponsor',
        'That two-year registry light-sensitivity numbers establish durability, when they come from 13 eyes',
      ],
      whatFailedInitially: [
        'Visual acuity, the pre-existing standard measure, showed no significant between-group difference at one year',
        'Chorioretinal atrophy after treatment became the most frequent real-world ocular adverse event and a labelled risk',
      ],
      realWorldOutcome: [
        'The first in vivo gene therapy approved in the United States, and the proof of concept the whole AAV field was built on',
        'Launched at $850,000, $425,000 per eye — the highest-priced medicine in the United States when it launched in January 2018',
        'The eligible population is very small, and the requirement for viable retinal cells makes earlier genetic diagnosis the practical rate-limiting step',
      ],
    },
    deliverySystem: {
      type: 'Recombinant AAV2 vector, subretinal injection, one eye per procedure',
      description:
        'A single subretinal injection of 1.5 x 10^11 vector genomes in 0.3 mL per eye, delivered by vitrectomy and subretinal bleb, with the second eye treated in a separate procedure. Systemic corticosteroid brackets each surgery. Air travel and scuba diving are not recommended until any intraocular air bubble has been absorbed.',
      safetyProfile:
        'No boxed warning. Labelled warnings are endophthalmitis, permanent decline in visual acuity, retinal abnormalities including macular changes, retinal tears and chorioretinal atrophy, increased intraocular pressure, expansion of intraocular air bubbles, and cataract formation or accelerated progression. Injection in the immediate vicinity of the fovea is specifically to be avoided.',
    },
    commonQuestions: [
      {
        q: 'Will this let me see normally?',
        a: 'No. What was measured is the ability to navigate an obstacle course at lower light levels — a median improvement of two light levels versus none in the control group, with 13 of 20 treated participants managing the dimmest level tested. The FDA label states that visual acuity did not differ significantly between treated and control groups at one year. Many patients describe the change in dim-light navigation as substantial; it is not the same thing as reading further down an eye chart.',
        auditNote:
          'The gap between the mobility endpoint and the acuity result is the single most important thing on this page.',
      },
      {
        q: 'Does it stop my retina degenerating?',
        a: 'There is no evidence that it does. The therapy restores an enzyme in the layer of cells behind the retina, which restarts the chemical recycling that vision depends on. It does not address the photoreceptor loss the deficiency has already caused. That is why the indication requires viable retinal cells to remain, and why the field expects earlier treatment to achieve more.',
      },
      {
        q: 'How long does it last?',
        a: 'Longer than a liver gene therapy, for a structural reason: retinal pigment epithelial cells barely divide, so the delivered gene, which sits beside the chromosomes rather than inside them, is not diluted away. Published follow-up shows benefit maintained for several years, and the registry\'s two-year light-sensitivity figures come from a small number of eyes. Follow-up studies run for fifteen years and have not finished.',
      },
      {
        q: 'Why does this page show no manufacturing cost or markup?',
        a: 'Because no peer-reviewed cost-of-goods figure exists for a clinical AAV batch. The $850,000 launch price — $425,000 per eye — is stated with its source. Estimating the cost side would produce a markup that looks precise and rests on nothing.',
      },
      {
        q: 'Both eyes at once?',
        a: 'No. Each eye is injected in its own operation, 6 to 18 days apart in the pivotal trial. Each carries the surgical risks the label lists: endophthalmitis, retinal tears, raised pressure, cataract, and chorioretinal atrophy, which turned out to be the most common ocular adverse event in real-world use.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    sources: [
      {
        label:
          'Russell S et al. Efficacy and safety of voretigene neparvovec (AAV2-hRPE65v2) in patients with RPE65-mediated inherited retinal dystrophy: a randomised, controlled, open-label, phase 3 trial. Lancet 2017;390:849-860',
        identifier: '10.1016/S0140-6736(17)31868-8',
        kind: 'doi',
      },
      {
        label:
          'Fischer MD et al. Real-World Safety and Effectiveness of Voretigene Neparvovec: Results up to 2 Years from the Prospective, Registry-Based PERCEIVE Study. Biomolecules 2024;14:122',
        identifier: '10.3390/biom14010122',
        kind: 'doi',
      },
      {
        label: 'Safety and Efficacy Study in Subjects With Leber Congenital Amaurosis (Study 302)',
        identifier: 'NCT00999609',
        kind: 'nct',
      },
      {
        label: 'FDA LUXTURNA product page and package insert',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/cellular-gene-therapy-products/luxturna',
        kind: 'regulatory',
      },
      {
        label: "Spark's gene therapy price tag: $850,000. Nature Biotechnology 2018;36:122",
        identifier: '10.1038/nbt0218-122',
        kind: 'doi',
      },
    ],
  },
  // ---------------------------------------------------------------------------------------------
  // 5. Etranacogene dezaparvovec (Hemgenix) — the durability case that held.
  // ---------------------------------------------------------------------------------------------
  {
    slug: 'etranacogene-dezaparvovec',
    name: 'Etranacogene dezaparvovec',
    tradeName: 'Hemgenix',
    sponsor: 'CSL Behring, developed with uniQure',
    targetGene: 'F9 — the hyperactive Padua variant, factor IX R338L',
    targetProtein: 'Coagulation factor IX',
    modality: 'CRISPR / Gene Therapy',
    approvalStatus: 'FDA Approved',
    approvalYear: 2022,
    indication:
      'Adults with haemophilia B who currently use factor IX prophylaxis therapy, or have current or historical life-threatening haemorrhage, or have repeated serious spontaneous bleeding episodes',
    patientFriendlyIndication: 'Haemophilia B in adults',
    anatomicalSite: 'Liver hepatocyte nucleus',
    conditionContext: {
      conditionExplainer:
        'Clotting is a relay of proteins made by the liver. In haemophilia B one runner in that relay, factor IX, is missing or broken. Bleeding into joints is the characteristic damage: repeated bleeds destroy cartilage, and by adulthood many patients have arthropathy that no clotting factor reverses. Standard care is intravenous factor IX concentrate, given prophylactically once or twice a week for life.',
      whyItMatters:
        'Haemophilia B is the textbook target for liver-directed gene therapy: one gene, one protein, made in one organ, with a blood test that reads out the result directly. If AAV gene therapy could not work here it could not work anywhere. What made this product different from its predecessors is not the delivery but the payload — a naturally occurring hyperactive variant of factor IX called Padua, roughly eight times more active than the normal protein, so a modest amount of expression produces a useful clotting level.',
      whoTakesThis:
        'Adults on factor IX prophylaxis, or with a history of life-threatening or repeated serious bleeding. Unusually for this field, patients were enrolled regardless of pre-existing antibodies to the AAV5 capsid.',
      clinicalGoals:
        'Enough endogenous factor IX activity to stop prophylactic infusions and to reduce the annualised bleeding rate, sustained for years rather than months.',
    },
    oneSentenceVerdict:
      'A single AAV5 infusion carrying the hyperactive factor IX Padua variant: the annualised bleeding rate fell 64% against each patient\'s own prophylaxis lead-in, and at five years mean factor IX activity was still 36.1 IU/dL — the strongest durability result any liver-directed gene therapy has published.',
    laymanHowItWorks:
      'Your liver is supposed to make a clotting protein and does not. A harmless virus shell carries a working copy of the gene into liver cells, where it stays as a separate loop of DNA and starts producing the protein. The copy delivered is not the ordinary version — it is a naturally occurring variant found in an Italian family, about eight times more active than normal, so even modest production gives a useful clotting level. One infusion, and for most patients the weekly injections stop.',
    auditConfidence: 'High Confidence',
    confidenceScore: 84,
    substitutes: {
      summary:
        'Factor IX prophylaxis is the comparator this trial actually used, and it works. Extended half-life factor IX products and the non-factor agent concizumab have narrowed the convenience gap that gene therapy was meant to close, and unlike a single infusion they can be stopped, adjusted or restarted.',
      conventionalRx: [
        {
          name: 'Recombinant factor IX prophylaxis, including extended half-life products',
          class: 'Coagulation factor replacement',
          howItCompares:
            'The standard of care and the trial\'s own comparator. In the HOPE-B lead-in period it produced an annualised bleeding rate of 4.19; gene therapy reduced that to 1.51. Extended half-life products have stretched dosing intervals from twice weekly toward weekly or longer.',
          typicalCost:
            'Not priced here — no citable single figure. The trial measured usage instead: a mean 248,825 IU per participant per year before treatment',
          prosAndCons:
            'Pros: reversible, dose-adjustable, decades of experience, no AAV antibody constraint. Cons: intravenous access for life, and breakthrough bleeds between doses.',
        },
        {
          name: 'Concizumab and other non-factor prophylaxis',
          class: 'Subcutaneous anti-tissue factor pathway inhibitor antibody',
          howItCompares:
            'Rebalances coagulation rather than replacing the missing factor, and is given subcutaneously rather than intravenously. It covers patients with inhibitors, which factor replacement struggles with.',
          typicalCost: 'Not priced here — no citable single figure',
          prosAndCons:
            'Pros: subcutaneous, works regardless of the specific factor deficiency. Cons: thrombotic risk requires monitoring, and it does not restore factor IX activity as a measurable number.',
        },
        {
          name: 'Fidanacogene elaparvovec (Beqvez)',
          class: 'The other approved AAV gene therapy for haemophilia B',
          howItCompares:
            'Same disease, same Padua transgene, a different capsid (AAVRh74var) and a much lower dose. It reported comparable factor IX activity but was discontinued globally by Pfizer in 2025 without a single commercial patient treated.',
          typicalCost: 'Withdrawn from the market; US list price was $3.5 million',
          prosAndCons:
            'Pros: none available — the product is no longer supplied. Cons: its commercial fate is the clearest evidence available about demand in this indication.',
        },
      ],
      naturalFoods: [],
      homeRemedies: [
        {
          name: 'Ask what your factor IX activity number means for your particular joints',
          action:
            'Ask what activity level the treating haematologist regards as protective for your activity pattern, and how often it will be measured after infusion.',
          patientImpact:
            'Mean activity across a trial hides a wide spread. In the five-year HOPE-B analysis the mean was 36.1 IU/dL with a standard deviation of 15.7, meaning individual patients sat well above and well below it.',
          clinicalPrecaution:
            'An activity number is a laboratory result, not a guarantee against bleeding. Trauma protocols do not change.',
        },
      ],
    },
    molecularSchema: {
      structureType: 'antibody_structure',
      chemicalFormula:
        'Recombinant AAV serotype 5 capsid packaging a codon-optimised human factor IX Padua (R338L) complementary DNA under a liver-specific LP1 promoter',
      targetReceptorAffinity:
        'Dose 2 x 10^13 genome copies per kg body weight, single intravenous infusion, per the pivotal trial and label',
      structureSource: {
        label: 'HEMGENIX (etranacogene dezaparvovec-drlb) US package insert, FDA',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/vaccines/hemgenix',
        kind: 'regulatory',
      },
      laboratoryWorkflow: [
        {
          id: 'etra-w1',
          stepNumber: 1,
          phase: 'QC',
          name: 'Baseline factor IX, liver assessment and AAV5 antibody titre',
          description:
            'Establish baseline factor IX activity, assess liver health, and measure pre-existing AAV5 neutralising antibody titre. This product is unusual in not excluding antibody-positive patients: HOPE-B enrolled regardless of titre, and benefit was observed in participants with pre-dose titres below 700.',
          reagentsAndBuffer:
            'Factor IX one-stage and chromogenic activity assays, hepatic transaminases and liver imaging, AAV5 neutralising antibody assay, factor IX inhibitor screen',
        },
        {
          id: 'etra-w2',
          stepNumber: 2,
          phase: 'Synthesis',
          name: 'Baculovirus-insect cell vector production',
          description:
            'Produce the AAV5 vector in Sf9 insect cells infected with recombinant baculoviruses carrying the rep/cap functions and the factor IX Padua expression cassette, a platform that scales to the very large batch sizes a systemic liver dose demands.',
          dependsOnStepId: 'etra-w1',
          reagentsAndBuffer:
            'Sf9 insect cell line, recombinant baculovirus stocks, serum-free insect cell medium, single-use bioreactor with dissolved oxygen control',
        },
        {
          id: 'etra-w3',
          stepNumber: 3,
          phase: 'Purification',
          name: 'Affinity capture, empty-capsid removal and release testing',
          description:
            'Capture on an AAV5-selective affinity resin, remove empty capsids, and release on genome copy titre, full-to-empty ratio, residual host cell DNA and protein, replication-competent AAV and potency in a hepatocyte transduction assay.',
          dependsOnStepId: 'etra-w2',
          reagentsAndBuffer:
            'AAV5 affinity chromatography resin, anion-exchange or gradient polishing, droplet digital PCR for genome copies, analytical ultracentrifugation, cell-based potency assay',
        },
        {
          id: 'etra-w4',
          stepNumber: 4,
          phase: 'Cellular_Delivery',
          name: 'Single intravenous infusion with corticosteroid readiness',
          description:
            'Infuse 2 x 10^13 genome copies per kg intravenously as a single dose. Corticosteroids are not given prophylactically but started reactively if transaminases rise, which in this programme was less common than in the AAV5 factor VIII product.',
          dependsOnStepId: 'etra-w3',
          reagentsAndBuffer:
            'Diluted vector in infusion bags, infusion pump, corticosteroid on standby for transaminase elevation',
        },
        {
          id: 'etra-w5',
          stepNumber: 5,
          phase: 'Assay_Quantification',
          name: 'Factor IX activity, bleeding rate and long-term liver surveillance',
          description:
            'Track factor IX activity, annualised bleeding rate and factor IX concentrate consumption, alongside serial transaminases and long-term hepatic surveillance including imaging for hepatocellular carcinoma in patients with risk factors.',
          dependsOnStepId: 'etra-w4',
          reagentsAndBuffer:
            'Factor IX one-stage clotting assay, bleed diary and adjudication, serial ALT and AST, hepatic ultrasound and alpha-fetoprotein per risk-based schedule',
        },
      ],
    },
    keyAudits: [
      {
        id: 'etra-a1',
        category: 'measured',
        title: 'HOPE-B: annualised bleeding rate fell 64% against each patient\'s own prophylaxis',
        laymanSummary:
          'Fifty-four men spent at least six months on standard prophylaxis first, so their own bleeding rate was measured before treatment. After one infusion, bleeds fell by roughly two thirds.',
        technicalDetails:
          'Open-label phase 3 study with a lead-in period of at least six months of factor IX prophylaxis, then a single 2 x 10^13 gc/kg infusion in 54 men with factor IX activity 2% or less, enrolled regardless of pre-existing AAV5 neutralising antibodies. The annualised bleeding rate fell from 4.19 (95% CI 3.22 to 5.45) during lead-in to 1.51 (95% CI 0.81 to 2.82) during months 7 through 18, a rate ratio of 0.36 (95% Wald CI 0.20 to 0.64; P<0.001), establishing both non-inferiority against the 1.8 margin and superiority. Factor IX activity rose by a least-squares mean of 36.2 percentage points at 6 months and 34.3 at 18 months, and factor IX concentrate use fell by a mean 248,825 IU per participant per year (P<0.001 for all three). No treatment-related serious adverse events occurred.',
        evidenceSource: 'Pipe SW et al., N Engl J Med 2023;388:706-718 (HOPE-B)',
        doi: '10.1056/NEJMoa2211644',
        measuredMetric:
          'Annualised bleeding rate 4.19 during lead-in versus 1.51 after treatment; rate ratio 0.36',
        auditFlag: 'verified',
      },
      {
        id: 'etra-a2',
        category: 'measured',
        title: 'Five-year factor IX activity of 36.1 IU/dL — durability that did not decay',
        laymanSummary:
          'Five years after a single infusion, average clotting factor levels were essentially where they had been at eighteen months. That is the result this whole field has been trying to produce.',
        technicalDetails:
          'Prespecified five-year analysis of all 54 participants. The adjusted annualised bleeding rate for all bleeds was 4.16 during lead-in and 1.52 during months 7 through 60, a 63% reduction (95% CI 24 to 82). Mean factor IX activity at five years was 36.1 ± 15.7 IU per deciliter. Mean exogenous factor IX consumption fell 96%, from 257,339 IU per year in lead-in to 10,924 IU per year post-treatment. Efficacy did not differ substantially between participants with and without baseline AAV5 neutralising antibodies. Treatment-related adverse events were rare after month 6.',
        evidenceSource: 'Pipe SW et al., N Engl J Med 2025 (HOPE-B final analysis)',
        doi: '10.1056/NEJMoa2514332',
        measuredMetric: 'Mean factor IX activity at 5 years: 36.1 ± 15.7 IU/dL',
        auditFlag: 'verified',
      },
      {
        id: 'etra-a3',
        category: 'conclusion_shift',
        title: 'Pre-existing AAV5 antibodies were expected to disqualify patients, and mostly did not',
        laymanSummary:
          'Most gene therapies exclude anyone whose immune system has already met the virus shell. This trial enrolled them anyway, and the treatment still worked below a certain antibody level.',
        technicalDetails:
          'HOPE-B enrolled participants regardless of pre-existing AAV5 neutralising antibody status, a deliberate departure from the field\'s standard exclusion. Benefit and safety were observed in participants with predose titres below 700, and the five-year analysis found efficacy did not differ substantially between antibody-positive and antibody-negative participants. The contrast with the competing haemophilia B product is stark: in BENEGENE-2, 188 of 316 men screened (59.5%) were ineligible because of anti-AAV neutralising antibodies. Capsid choice and screening policy, not the transgene, decide who is treatable.',
        evidenceSource: 'Pipe 2023 and the HOPE-B five-year analysis; contrast with Cuker A et al., N Engl J Med 2024;391:1108-1118',
        doi: '10.1056/NEJMoa2211644',
        auditFlag: 'verified',
      },
      {
        id: 'etra-a4',
        category: 'failed',
        title: 'A liver cancer case put the whole programme on FDA clinical hold in December 2020',
        laymanSummary:
          'One participant developed liver cancer and the FDA halted the programme. A full genetic investigation concluded the therapy was unlikely to have caused it — but the hold happened, and the question it raised has not gone away for the field.',
        technicalDetails:
          'In December 2020 the FDA placed a clinical hold on the programme after a serious adverse event of hepatocellular carcinoma in a HOPE-B participant. The patient had multiple independent risk factors: prior hepatitis B and C, evidence of non-alcoholic fatty liver disease, a smoking history, a family history of cancer and advanced age. Independent molecular characterisation and vector integration analysis of the tumour and adjacent tissue supported the conclusion that the carcinoma was unrelated to treatment, and whole genome sequencing showed chromosome 1 and 8 abnormalities characteristic of hepatocellular carcinoma along with TP53 and other oncogenic mutations. The hold was lifted and the programme completed. AAV genomes are predominantly episomal but integrate at a low rate, so hepatic malignancy surveillance after liver-directed AAV is a permanent feature of this class rather than a resolved question.',
        evidenceSource:
          'ASH Clinical News, reporting the independent investigation of the HOPE-B hepatocellular carcinoma case',
        auditFlag: 'caution',
      },
      {
        id: 'etra-a5',
        category: 'inferred',
        title: 'The comparator was each patient\'s own unblinded lead-in, not a randomised arm',
        laymanSummary:
          'There was no control group. Every participant was compared with their own bleeding rate from the months before treatment, and everyone knew who had been treated.',
        technicalDetails:
          'HOPE-B is open-label and single-group. The lead-in design is a genuine strength — it establishes each patient\'s own prophylaxis-era bleeding rate prospectively rather than by recall — but it cannot control for regression to the mean, for the behavioural effect of knowing one has been treated, or for changes in bleed reporting once weekly infusions stop. Annualised bleeding rate is patient-reported and adjudicated, not instrumented. Factor IX activity, by contrast, is a laboratory measurement and is not vulnerable to any of this.',
        evidenceSource: 'HOPE-B study design (NCT03569891)',
        doi: '10.1056/NEJMoa2211644',
        inferredClaim:
          'That an unblinded within-patient bleeding-rate comparison carries the same weight as a randomised blinded one',
        auditFlag: 'caution',
      },
      {
        id: 'etra-a6',
        category: 'inferred',
        title: 'A $3.5 million price justified by lifetime factor costs that were never measured against it',
        laymanSummary:
          'The price was set on the argument that a lifetime of clotting factor costs more. The trial measured five years, and the arithmetic beyond that is a projection.',
        technicalDetails:
          'CSL Behring set a US list price of $3.5 million on approval in November 2022, making it the most expensive medicine in the world at the time. The offsetting-cost argument rests on measured factor IX consumption — 257,339 IU per participant per year during lead-in, falling 96% to 10,924 IU — extrapolated across a lifetime. The measured horizon is five years. No peer-reviewed cost of goods for the product exists, so no markup can be stated, and this page states none.',
        evidenceSource:
          'Fierce Pharma, 22 November 2022 (list price); HOPE-B five-year factor IX consumption data',
        inferredClaim:
          'That five years of measured factor IX savings establishes lifetime cost offset at the launch price',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'A single intravenous infusion',
        laymanDesc:
          'One infusion into a vein. No chemotherapy, no surgery, no cells taken out of the body.',
        molecularDetail:
          'A single dose of 2 x 10^13 genome copies per kg of AAV5 vector is infused intravenously. Corticosteroid is not given prophylactically; it is started reactively if transaminases rise.',
        iconName: 'Syringe',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'The AAV5 shell is taken up by liver cells',
        laymanDesc:
          'The blood carries the whole dose through the liver, where the shell is absorbed by the cells that make clotting proteins.',
        molecularDetail:
          'AAV5 has strong natural hepatotropism after systemic administration. Uptake is receptor-mediated and the vast majority of the dose is cleared by the liver on first pass, which is why a liver-expressed protein is the natural target for systemic AAV.',
        iconName: 'Droplet',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'A liver-only promoter keeps expression where it belongs',
        laymanDesc:
          'The delivered gene comes with a switch that only liver cells can read, so it does not start producing clotting factor anywhere else.',
        molecularDetail:
          'The codon-optimised factor IX Padua cassette is driven by the liver-specific LP1 promoter and persists as a non-integrating nuclear episome. Restricting expression to hepatocytes limits both off-target production and the immune presentation of the transgene product elsewhere.',
        iconName: 'Lock',
        visualStage: 'target_binding',
      },
      {
        step: 4,
        title: 'The gene delivered is a hyperactive natural variant',
        laymanDesc:
          'The copy inserted is not the standard one. It is a variant found in an Italian family whose members clot about eight times more efficiently per molecule, so a little protein goes a long way.',
        molecularDetail:
          'Factor IX Padua carries an arginine-to-leucine substitution at position 338, first identified in a family with unexplained thrombophilia, conferring roughly eight-fold higher specific activity. This is the single design decision that made haemophilia B gene therapy clinically useful: it converts a modest, achievable expression level into a therapeutic clotting activity.',
        iconName: 'Sparkles',
        visualStage: 'catalytic_action',
      },
      {
        step: 5,
        title: 'Bleeding falls, and stays fallen for five years',
        laymanDesc:
          'Bleeds dropped by about two thirds, weekly infusions largely stopped, and five years on the clotting factor level was still around a third of normal.',
        molecularDetail:
          'Annualised bleeding rate 4.19 to 1.51 in the primary analysis (rate ratio 0.36); at five years, adjusted annualised bleeding rate 4.16 to 1.52, mean factor IX activity 36.1 ± 15.7 IU/dL, and a 96% reduction in exogenous factor IX consumption. Post-mitotic hepatocyte turnover in adults is slow enough that episomal loss did not materially erode expression over that horizon.',
        iconName: 'ShieldCheck',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [
      {
        trialId: 'HOPE-B (NCT03569891)',
        phase: 'Phase 3, open label, single group with prospective prophylaxis lead-in',
        sampleSize: 54,
        primaryEndpoint:
          'Annualised bleeding rate during months 7 to 18 after treatment compared with the prophylaxis lead-in period, tested for non-inferiority against a margin of 1.8',
        endpointMet: true,
        statisticalPValue: 'P < 0.001; rate ratio 0.36 (95% Wald CI 0.20 to 0.64)',
        unreportedAdverseSignals:
          'No treatment-related serious adverse events in the primary analysis. One case of hepatocellular carcinoma in a participant with extensive independent risk factors triggered an FDA clinical hold in December 2020; independent integration analysis concluded the tumour was unrelated to treatment.',
        independentReplicationStatus: 'Partially Replicated',
      },
      {
        trialId: 'HOPE-B five-year final analysis (NCT03569891)',
        phase: 'Phase 3, prespecified five-year analysis',
        sampleSize: 54,
        primaryEndpoint:
          'Adjusted annualised bleeding rate months 7 to 60 versus lead-in, plus factor IX expression and safety',
        endpointMet: true,
        statisticalPValue: '63% reduction in annualised bleeding rate (95% CI 24 to 82)',
        unreportedAdverseSignals:
          'Adverse events possibly related to treatment were rare after month 6. Long-term hepatic surveillance remains a class requirement rather than a resolved question.',
        independentReplicationStatus: 'Partially Replicated',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'Annualised bleeding rate 4.19 during prophylaxis lead-in versus 1.51 during months 7 to 18 after treatment, rate ratio 0.36 (P<0.001)',
        'Factor IX activity increased by a least-squares mean 36.2 percentage points at 6 months and 34.3 at 18 months',
        'Mean factor IX activity 36.1 ± 15.7 IU/dL at five years, with a 63% reduction in annualised bleeding rate over months 7 to 60',
        'Exogenous factor IX consumption down 96%, from 257,339 IU per year to 10,924 IU per year',
      ],
      unsupportedInferences: [
        'That the effect is lifelong — five years is the measured horizon and hepatocytes do turn over',
        'That the unblinded within-patient bleeding comparison is equivalent to a randomised blinded one',
        'That the $3.5 million price is offset, which requires projecting factor IX savings decades beyond the measured five years',
        'That the hepatocellular carcinoma question is closed for the class; low-rate AAV integration keeps hepatic surveillance a standing requirement',
      ],
      whatFailedInitially: [
        'An FDA clinical hold in December 2020 after a hepatocellular carcinoma case, resolved only after independent vector integration and whole genome analysis',
      ],
      realWorldOutcome: [
        'The most durable published result in liver-directed gene therapy, and the direct contrast that makes the haemophilia A product\'s decline legible',
        'Enrolling patients regardless of AAV5 antibody status widened eligibility in a field where capsid immunity routinely excludes more than half of those screened',
        'Priced at $3.5 million on approval, the most expensive medicine in the world at the time',
      ],
    },
    deliverySystem: {
      type: 'Recombinant AAV5 vector, single intravenous infusion',
      description:
        'One intravenous infusion of 2 x 10^13 genome copies per kg body weight, given in a single session with no conditioning, no surgery and no prophylactic immunosuppression. Corticosteroid is reserved for reactive management of transaminase elevation.',
      safetyProfile:
        'No boxed warning. The principal labelled concerns are infusion reactions, hepatotoxicity with transaminase elevation requiring monitoring and possible corticosteroid treatment, and the theoretical risk of hepatocellular carcinoma warranting long-term liver surveillance particularly in patients with cirrhosis, advanced fibrosis or chronic hepatitis. Factor IX inhibitor development was not observed in the pivotal programme.',
    },
    commonQuestions: [
      {
        q: 'How long does one infusion last?',
        a: 'Five years of measured data, and at five years mean factor IX activity was 36.1 IU/dL — essentially unchanged from eighteen months. That is the best durability any liver-directed gene therapy has published, and the direct contrast with the haemophilia A product, whose activity fell year on year. It is still five years of measurement, not a lifetime, and hepatocytes do divide slowly, which dilutes a gene that sits beside the chromosomes rather than inside them.',
      },
      {
        q: 'What happens if it stops working?',
        a: 'You return to factor IX prophylaxis, which is what you were on beforehand and which still works. What you cannot do is take a second dose: the first infusion raises antibodies against the AAV5 capsid that block any repeat administration. That asymmetry — reversible fallback, irreversible one-shot — is the honest way to frame the decision.',
      },
      {
        q: 'I have antibodies to the virus. Am I excluded?',
        a: 'Possibly not, and that is unusual. This trial deliberately enrolled patients regardless of pre-existing AAV5 neutralising antibodies, and benefit was observed in those with predose titres below 700, with the five-year analysis finding no substantial efficacy difference by antibody status. For comparison, in the competing haemophilia B gene therapy programme 59.5% of men screened were ineligible on antibody grounds.',
      },
      {
        q: 'Why does this page show no manufacturing cost or markup?',
        a: 'Because no peer-reviewed cost-of-goods figure exists for a commercial AAV batch, and estimating one would be inventing the number readers most want. The $3.5 million list price is stated with its source. What the trial did measure on the cost side is factor IX usage: 257,339 IU per patient per year before treatment, down 96% afterwards.',
      },
      {
        q: 'Does it cure my joint damage?',
        a: 'No. Arthropathy from years of joint bleeds is structural and is not reversed by restoring clotting factor. What the therapy addresses is future bleeding, which is why the endpoint is a bleeding rate rather than a joint score.',
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: false,
    sources: [
      {
        label:
          'Pipe SW et al. Gene Therapy with Etranacogene Dezaparvovec for Hemophilia B. N Engl J Med 2023;388:706-718',
        identifier: '10.1056/NEJMoa2211644',
        kind: 'doi',
      },
      {
        label:
          'Pipe SW et al. Final Analysis of a Study of Etranacogene Dezaparvovec for Hemophilia B. N Engl J Med 2025',
        identifier: '10.1056/NEJMoa2514332',
        kind: 'doi',
      },
      {
        label: 'HOPE-B: Trial of AMT-061 in Severe or Moderately Severe Hemophilia B Patients',
        identifier: 'NCT03569891',
        kind: 'nct',
      },
      {
        label: 'FDA HEMGENIX product page and package insert',
        identifier: 'https://www.fda.gov/vaccines-blood-biologics/vaccines/hemgenix',
        kind: 'regulatory',
      },
      {
        label:
          'Investigation Finds Hemophilia Gene Therapy Likely Did Not Cause Hepatocellular Carcinoma. ASH Clinical News',
        identifier:
          'https://ashpublications.org/ashclinicalnews/news/5595/Investigation-Finds-Hemophilia-Gene-Therapy-Likely',
        kind: 'url',
      },
      {
        label:
          'Sporting a $3.5M price tag, CSL and uniQure\'s hemophilia B gene therapy crosses FDA finish line. Fierce Pharma, 22 November 2022',
        identifier:
          'https://www.fiercepharma.com/pharma/csl-and-uniqures-hemophilia-b-gene-therapy-scores-approval-35-million-price-tag',
        kind: 'url',
      },
    ],
  },
