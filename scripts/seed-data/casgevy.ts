import type { SeedFile } from '@/lib/seed-types'

// Research notes (2026-08-18):
// - FDA approval history verified via FDA press announcements and the official FDA-hosted label
//   (DailyMed): first approval Dec 8, 2023 (sickle cell disease, ages 12+, alongside a separate,
//   different product, Lyfgenia, approved the same day); second approval Jan 16, 2024
//   (transfusion-dependent beta-thalassemia, ages 12+); and a July 1, 2026 supplemental approval
//   expanding both indications down to ages 2+ — this last one is recent and was cross-checked
//   across five independent trade-press outlets (Contemporary Pediatrics, Big Molecule Watch,
//   HCPLive, Pharmacy Times, Respiratory Therapy) plus the FDA press-announcement URL itself, since
//   it postdates this model's training data.
// - MHRA (UK) authorization Nov 16, 2023 and EU/European Commission conditional marketing
//   authorization Feb 2024 verified via sponsor (Vertex/CRISPR Therapeutics) regulatory-announcement
//   pages, cross-checked against independent trade press (CGTlive, GJE, Genomics Education
//   Programme). No Singapore HSA-specific approval was searched for or is claimed here — out of
//   scope for what was verified.
// - Pivotal trial identities and design confirmed directly against the ClinicalTrials.gov v2 API
//   (not just search-engine summaries): NCT03745287 = CLIMB SCD-121 (sickle cell, Phase 2/3, 63
//   enrolled, ages 12-35, completed); NCT03655678 = CLIMB THAL-111 (beta-thalassemia, Phase 2/3, 59
//   enrolled, ages 12-35, completed); NCT04208529 = the mandatory long-term follow-up study
//   ("CLIMB-131" in press materials), primary outcome "new malignancies," estimated completion 2039
//   (~15+ years post-infusion for the earliest patients). "CTX001" is confirmed via the same API
//   record as the trial-era name for exagamglogene autotemcel.
// - Published trial results (sample sizes, VF12/TI12 percentages, follow-up durations, adverse
//   event rates) verified against the peer-reviewed NEJM publications (Frangoul et al. 2024, DOI
//   10.1056/NEJMoa2309676, PMID 38661449; Locatelli et al. 2024, DOI 10.1056/NEJMoa2309673), cross-
//   checked against a CHOP institutional summary (for the SCD numbers) and an independent Canadian
//   HTA/CADTH review reproduced on NCBI Bookshelf (for the beta-thalassemia numbers, incl. adverse
//   event rates) — both of which describe the same published trial, not new data.
// - Mechanism (BCL11A erythroid-specific enhancer editing -> reduced BCL11A -> reactivated fetal
//   hemoglobin) verified against the official FDA-approved prescribing information hosted on
//   DailyMed, which is also the source for the explicit label statement that off-target editing
//   "cannot be ruled out" and for the warnings/precautions section headers.
// - Off-target editing specificity assessment (GUIDE-seq + targeted deep sequencing, no confirmed
//   off-target edits detected at tested loci) verified via the companion NEJM correspondence
//   (DOI 10.1056/NEJMc2313119).
// - Access-burden figures (apheresis / months of manufacturing / myeloablative busulfan
//   conditioning / ~4-6 weeks hospitalization / ~12-month total process) verified against manufacturer
//   patient and HCP treatment-journey materials (casgevy.com), cross-checked against independent
//   institutional descriptions (NCBI Bookshelf / CADTH review) that corroborate "prolonged
//   hospitalization" and the same conditioning process without giving a conflicting duration.
// - Real-world uptake and price ($2.2M US wholesale acquisition cost; 64 patients dosed worldwide
//   by end of 2025 against ~301 who began the process that year; company-cited infertility risk as
//   an access deterrent) verified via BioPharma Dive's reporting on Vertex's own Q4 2025 earnings
//   disclosure, corroborated by widely-reported figures at the original Dec 2023 launch (CNBC,
//   BioSpace, and others independently reporting the same $2.2M figure).
// - No boxed/black-box warning for hematologic malignancy appears on Casgevy's own label — that
//   warning is specific to Lyfgenia (a different, lentiviral-vector product approved the same day)
//   — verified via an independent secondary summary (PMC review article) that explicitly contrasts
//   the two products' labels; no malignancies were reported in Casgevy's own pivotal trials as of
//   the published data cuts, but FDA still mandated the 15-year NCT04208529 follow-up study to keep
//   watching for exactly this risk.

const seed: SeedFile = {
  entity: {
    canonicalName: 'Casgevy (exagamglogene autotemcel)',
    slug: 'casgevy',
    aliases: ['exagamglogene autotemcel', 'exa-cel', 'CTX001'],
    entityType: 'gene_editing_treatment',
    shortDescription:
      'An FDA-, MHRA-, and EU-approved one-time CRISPR-Cas9 gene-edited cell therapy for sickle cell disease and transfusion-dependent beta-thalassemia.',
    bottomLine:
      "Casgevy is an approved CRISPR-Cas9 gene therapy for sickle cell disease and transfusion-dependent beta-thalassemia. Treatment is one infusion of the patient's own lab-edited stem cells, given only after chemotherapy clears their existing bone marrow, and followed by weeks in hospital.",
    regulatoryCategory: 'approved_medicine',
    accessRealityNote:
      "Casgevy is given only at a few accredited hospital treatment centers, not by an ordinary clinic. Doctors collect the patient's own blood stem cells by apheresis, then ship them out for CRISPR editing and release testing over several months. The patient is then admitted for myeloablative busulfan chemotherapy that clears their bone marrow, the edited cells are infused, and 4-6 weeks of inpatient monitoring follows while they engraft. Vertex puts the full pathway at close to a year and set a U.S. list price of $2.2 million. By the end of 2025, 64 patients worldwide had completed infusion, of roughly 301 who started that year; Vertex cited conditioning-related infertility risk as a deterrent.",
    regulatoryStatuses: [
      {
        jurisdiction: 'United States — FDA',
        legalCategory: 'approved_medicine',
        approvedIndications:
          'Patients aged 2 years and older with sickle cell disease (SCD) with recurrent vaso-occlusive crises, or with transfusion-dependent beta-thalassemia (TDT). Originally approved for ages 12 and older (SCD: Dec 8, 2023; TDT: Jan 16, 2024); the age range was expanded down to 2 years and older on July 1, 2026, on the strength of a much smaller supporting pediatric cohort.',
        statusStatement:
          'FDA-approved biologic (BLA 125785) — a one-time, autologous, CRISPR-Cas9 edited hematopoietic stem cell therapy administered by intravenous infusion after myeloablative conditioning.',
        source: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7c3e12ad-e2fe-4d3f-a630-ea7364d9e846',
        checkedDate: '2026-08-18',
      },
      {
        jurisdiction: 'United Kingdom — MHRA',
        legalCategory: 'approved_medicine',
        approvedIndications:
          'Patients 12 years and older with sickle cell disease with recurrent vaso-occlusive crises, or with transfusion-dependent beta-thalassemia, for whom hematopoietic stem cell transplantation is appropriate and no HLA-matched related stem cell donor is available.',
        statusStatement:
          "MHRA-authorized on November 16, 2023 — the world's first regulatory authorization of a CRISPR/Cas9 gene-editing therapy, ahead of both the FDA and the EMA.",
        source:
          'https://news.vrtx.com/news-releases/news-release-details/vertex-and-crispr-therapeutics-announce-authorization-first',
        checkedDate: '2026-08-18',
      },
      {
        jurisdiction: 'European Union — European Commission / EMA',
        legalCategory: 'approved_medicine',
        approvedIndications:
          'Patients 12 years and older with sickle cell disease with recurrent vaso-occlusive crises, or with transfusion-dependent beta-thalassemia, for whom hematopoietic stem cell transplantation is appropriate and no HLA-matched related donor is available.',
        statusStatement:
          'Conditional marketing authorization granted by the European Commission in February 2024, following a positive CHMP opinion — meaning EMA has required Vertex to continue supplying additional confirmatory data as a condition of keeping the authorization.',
        source:
          'https://news.vrtx.com/news-releases/news-release-details/european-commission-approves-first-crisprcas9-gene-edited',
        checkedDate: '2026-08-18',
      },
    ],
    claims: [
      {
        slug: 'is-casgevy-approved',
        claimType: 'regulatory',
        consumerQuestion: 'Is Casgevy actually approved, or is it still experimental?',
        directAnswer:
          'Casgevy is approved by the FDA, MHRA and the European Commission for sickle cell disease with recurrent vaso-occlusive crises and transfusion-dependent beta-thalassemia. Approval rests on about 1.5-2 years of trial follow-up, not decades.',
        measuredFinding:
          "FDA approval is documented in the DailyMed-hosted, FDA-approved prescribing information for BLA 125785. The MHRA and European Commission approvals are documented in the sponsor's regulatory announcements, which name the authorization dates and the conditional status of the EU authorization. On July 1, 2026 the FDA expanded both U.S. indications from ages 12+ down to ages 2+.",
        inference:
          'Approval means a regulator judged the measured benefit-risk balance favorable enough to authorize marketing for a defined population. It is not evidence that every long-term risk has been ruled out: the FDA mandated a 15-year follow-up study (NCT04208529) tracking new malignancies.',
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          'This is the strongest evidence category recorded here: an independent regulator (in this case three separate ones) reviewed the underlying trial data and authorized the product for a named use. That is a higher bar than a single published trial result on its own.',
        remainingUnknown:
          'Eligibility differs by jurisdiction and is narrower in the EU and UK. The 2026 U.S. expansion to age 2 rested on a smaller pediatric cohort — trade press reported roughly 11 sickle cell and 15 beta-thalassemia patients aged 5 to under 12 — with less follow-up.',
        evidenceNeededNext:
          'Continued post-marketing surveillance and any resulting label changes (new warnings, further age-range or eligibility changes) as real-world use and the 15-year follow-up study accumulate more data, particularly in the newly-approved youngest patients.',
        displayPriority: 1,
        evidence: [
          {
            sourceKey: 'fda-approval-scd-2023',
            relationship: 'supports',
            claimPartAddressed: 'U.S. approval for sickle cell disease',
            directlyMeasuredResult:
              'FDA approved Casgevy for SCD with recurrent vaso-occlusive crises (originally ages 12+) on December 8, 2023, the same day it approved a separate product, Lyfgenia, for the same indication.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'fda-sbra-tdt-2024',
            relationship: 'supports',
            claimPartAddressed: 'U.S. approval for transfusion-dependent beta-thalassemia',
            directlyMeasuredResult:
              "FDA's Summary Basis for Regulatory Action documents approval of the TDT indication on January 16, 2024.",
            independentGroupStatus: true,
          },
          {
            sourceKey: 'fda-approval-pediatric-2026',
            relationship: 'supports',
            claimPartAddressed: 'U.S. pediatric age-range expansion',
            directlyMeasuredResult:
              'FDA expanded both U.S. indications to patients 2 years and older on July 1, 2026, making Casgevy the first gene therapy approved for sickle cell disease in children younger than 12.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'mhra-approval-2023',
            relationship: 'supports',
            claimPartAddressed: 'UK approval',
            directlyMeasuredResult:
              "MHRA authorized Casgevy on November 16, 2023 — the world's first regulatory authorization of a CRISPR/Cas9 gene-editing therapy.",
            independentGroupStatus: true,
          },
          {
            sourceKey: 'ema-approval-2024',
            relationship: 'supports',
            claimPartAddressed: 'EU approval',
            directlyMeasuredResult:
              'The European Commission granted conditional marketing authorization in February 2024, following a positive CHMP opinion.',
            independentGroupStatus: true,
          },
        ],
        comprehensionQuestions: [
          {
            question: "Casgevy's FDA approval means:",
            options: [
              'It has been shown to work in a large, randomized, placebo-controlled trial with decades of follow-up.',
              'It eliminated vaso-occlusive crises in the large majority of a small, single-arm trial with under two years of average follow-up, and the FDA judged that evidence sufficient to approve it — while requiring a 15-year study to keep watching for long-term risks like malignancy.',
              'It is proven completely safe with no remaining unknowns.',
              'It can now be self-administered once a doctor writes a prescription.',
            ],
            correctOptionIndex: 1,
            explanation:
              'Genuine FDA approval is real, strong evidence — but it is not the same claim as "every long-term question is answered." The pivotal trial (44 patients treated, 30 evaluable, 96.7% crisis-free at 12+ months, ~19 months of median follow-up) is exactly what the FDA reviewed, and the agency itself required a separate 15-year follow-up study (NCT04208529) specifically because longer-term risks, especially malignancy, are not yet fully characterized.',
          },
        ],
      },
      {
        slug: 'how-casgevy-works',
        claimType: 'mechanism',
        consumerQuestion: 'How does Casgevy actually work?',
        directAnswer:
          "Casgevy uses CRISPR-Cas9 to disable the BCL11A enhancer in a patient's own blood stem cells, switching fetal hemoglobin back on. The edited cells are infused back; durability past about two years is unmeasured.",
        measuredFinding:
          "Editing of the BCL11A enhancer was measured directly in each patient's manufactured cell product before release. After engraftment, fetal hemoglobin (HbF) rose to a substantial, sustained share of total hemoglobin in essentially all treated patients across both pivotal trials, per the FDA-approved label and the NEJM publications.",
        inference:
          "Calling this a durable, one-time treatment assumes the edit persists and keeps producing fetal hemoglobin for the rest of a patient's life. Published follow-up runs about 1.5-2 years, so lifetime durability has not been measured and by definition cannot yet have been.",
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          'This mechanism is the measured basis on which the FDA, MHRA, and European Commission approved the product, not a hypothesis extrapolated from animal or cell models. It was verified in trial patients by measuring edited-allele frequency in the cell product and fetal hemoglobin in blood after infusion.',
        remainingUnknown:
          "A screen with computational prediction, GUIDE-seq and targeted deep sequencing found no confirmed off-target edits at the loci tested. The FDA-approved label states that off-target editing 'cannot be ruled out' — a limit of measurement, not a finding of harm.",
        evidenceNeededNext:
          'Continued clonal-tracking and safety data from the mandatory 15-year long-term follow-up study (NCT04208529) to confirm the edit and its effect remain stable over time, and that no delayed off-target consequence emerges.',
        mechanismSummary:
          "Ex vivo CRISPR-Cas9 editing of a patient's own stem cells reactivates fetal hemoglobin by disabling the genetic switch that normally silences it after birth.",
        displayPriority: 2,
        mechanismSteps: [
          {
            displayOrder: 1,
            technicalLabel: 'Ex vivo CRISPR-Cas9 editing of autologous CD34+ hematopoietic stem and progenitor cells',
            plainLanguageExplanation:
              "A patient's own blood-forming stem cells are removed from the body and edited outside it, using the CRISPR-Cas9 'molecular scissors' system to cut DNA at one specific, targeted site.",
            evidenceContext:
              'The editing efficiency of each cell product is measured directly as part of manufacturing release testing before infusion, as described in the FDA-approved prescribing information.',
            status: 'measured',
            sourceLinks: ['https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7c3e12ad-e2fe-4d3f-a630-ea7364d9e846'],
          },
          {
            displayOrder: 2,
            technicalLabel: 'Disruption of the BCL11A erythroid-specific enhancer',
            plainLanguageExplanation:
              'The edit targets a DNA switch (enhancer) that normally turns the BCL11A gene on only in developing red blood cells. Disabling that switch, rather than the whole BCL11A gene everywhere in the body, keeps the effect confined to red blood cell development.',
            evidenceContext:
              'Confirmed by sequencing of the edited cell product and by reduced BCL11A expression measured in erythroid-differentiated cells from treated patients, per the FDA label and NEJM publications.',
            status: 'measured',
            sourceLinks: [
              'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7c3e12ad-e2fe-4d3f-a630-ea7364d9e846',
              'https://doi.org/10.1056/NEJMoa2309676',
            ],
          },
          {
            displayOrder: 3,
            technicalLabel: 'Reduced BCL11A protein specifically in the red blood cell lineage',
            plainLanguageExplanation:
              'With its enhancer switch disabled, the BCL11A protein — which normally represses fetal hemoglobin production after infancy — is made at much lower levels inside developing red blood cells specifically.',
            evidenceContext:
              "Downstream of the directly-measured enhancer edit, and consistent with BCL11A's characterized role as the fetal-to-adult hemoglobin switch, as described in the FDA-reviewed data package.",
            status: 'measured',
            sourceLinks: ['https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7c3e12ad-e2fe-4d3f-a630-ea7364d9e846'],
          },
          {
            displayOrder: 4,
            technicalLabel: 'Reactivation of fetal hemoglobin (HbF) synthesis',
            plainLanguageExplanation:
              'With less BCL11A available to repress it, the gamma-globin gene switches back on and red blood cells resume making fetal hemoglobin (HbF), at levels far above what an untreated adult normally has.',
            evidenceContext:
              "HbF percentage was measured directly in blood samples from every treated patient in both pivotal trials and rose to a substantial, sustained share of total hemoglobin after engraftment.",
            status: 'measured',
            sourceLinks: ['https://doi.org/10.1056/NEJMoa2309676', 'https://doi.org/10.1056/NEJMoa2309673'],
          },
          {
            displayOrder: 5,
            technicalLabel:
              'Reduced sickling (in SCD) or corrected globin-chain imbalance (in TDT), and fewer clinical events',
            plainLanguageExplanation:
              'In sickle cell disease, added fetal hemoglobin dilutes sickle hemoglobin and hinders its clumping, the cause of sickling and blocked vessels. In beta-thalassemia, it helps rebalance globin chains driving red-cell destruction. Clinically: fewer vaso-occlusive crises or freedom from transfusions.',
            evidenceContext:
              'Freedom from vaso-occlusive crises (SCD) and transfusion independence (TDT) were the directly measured, pre-specified primary outcomes the FDA reviewed for approval.',
            status: 'measured',
            sourceLinks: ['https://doi.org/10.1056/NEJMoa2309676', 'https://doi.org/10.1056/NEJMoa2309673'],
          },
        ],
        evidence: [
          {
            sourceKey: 'fda-label-dailymed',
            relationship: 'supports',
            claimPartAddressed: 'overall mechanism of action (BCL11A enhancer editing -> HbF reactivation)',
            directlyMeasuredResult:
              "FDA-approved label describes edited CD34+ cells engrafting and producing elevated fetal hemoglobin, and explicitly states that off-target editing 'cannot be ruled out.'",
            independentGroupStatus: true,
          },
          {
            sourceKey: 'nejm-frangoul-2024-scd',
            relationship: 'supports',
            claimPartAddressed: 'HbF induction and clinical translation in sickle cell disease',
            directlyMeasuredResult:
              'HbF rose to a substantial, pancellular share of total hemoglobin in treated patients, measured directly in trial blood samples.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'nejm-locatelli-2024-tdt',
            relationship: 'supports',
            claimPartAddressed: 'HbF induction and clinical translation in beta-thalassemia',
            directlyMeasuredResult:
              'HbF and total hemoglobin rise were measured directly in treated TDT patients, consistent with correction of the globin-chain imbalance underlying the disease.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'nejm-specificity-2024',
            relationship: 'limits',
            claimPartAddressed: 'precision of the CRISPR-Cas9 edit / off-target risk',
            directlyMeasuredResult:
              'No confirmed off-target edits were detected by GUIDE-seq plus targeted deep sequencing at computationally predicted candidate sites, but the authors note surveillance is ongoing and cannot exclude rare, undetected events.',
            independentGroupStatus: false,
          },
        ],
      },
      {
        slug: 'reduces-vaso-occlusive-crises',
        claimType: 'effectiveness',
        consumerQuestion: 'Does Casgevy reduce vaso-occlusive crises in sickle cell disease?',
        directAnswer:
          'In the pivotal trial, 29 of 30 evaluable patients with severe sickle cell disease (96.7%) went at least 12 consecutive months with no vaso-occlusive crisis, in a single-arm trial with no control group.',
        measuredFinding:
          'In CLIMB SCD-121 (NCT03745287), 44 patients received exa-cel; 30 had enough follow-up for the primary endpoint at that data cut. 29 of them (96.7%) were free of vaso-occlusive crises for at least 12 consecutive months, median follow-up ~19.3 months. Safety was consistent with myeloablative stem-cell transplantation, with no treatment-related malignancies reported (Frangoul et al., NEJM 2024).',
        inference:
          'Trial eligibility was narrow: ages 12-35, at least two severe crises a year, plus genotype and transplant-eligibility criteria. That the benefit lasts a lifetime or generalizes beyond that window is inferred from one uncontrolled trial and the mechanism, not measured over decades or in wider use.',
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          'The FDA reviewed and accepted this exact endpoint — freedom from vaso-occlusive crises for 12+ consecutive months — as the basis for approval, which puts it above a single company-run trial result. The trial itself is still single-arm, unblinded, and industry-sponsored, with no independent replication cohort.',
        remainingUnknown:
          'Whether the crisis-free effect persists indefinitely, whether it holds outside trial eligibility, and long-term blood-cancer risk from busulfan conditioning plus gene editing are unknown. That is why the FDA required a 15-year study tracking new malignancies.',
        evidenceNeededNext:
          'Longer follow-up from the mandatory 15-year study (NCT04208529), and post-marketing real-world outcome data as more of the authorized U.S. treatment centers dose patients outside the original trial.',
        outcomeSummary: '96.7% (29 of 30 evaluable patients) free of vaso-occlusive crises for 12+ months in the pivotal trial.',
        displayPriority: 3,
        evidence: [
          {
            sourceKey: 'nejm-frangoul-2024-scd',
            relationship: 'supports',
            claimPartAddressed: 'freedom from vaso-occlusive crises',
            directlyMeasuredResult:
              '29 of 30 evaluable patients (96.7%) were free of vaso-occlusive crises for at least 12 consecutive months; median follow-up 19.3 months; no treatment-related deaths or malignancies reported.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'fda-approval-scd-2023',
            relationship: 'supports',
            claimPartAddressed: 'regulatory acceptance of this endpoint as the basis for approval',
            directlyMeasuredResult: 'FDA approved Casgevy for SCD (Dec 8, 2023) specifically on this trial result.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'nct04208529-ltfu',
            relationship: 'contextualizes',
            claimPartAddressed: 'durability and long-term malignancy risk',
            directlyMeasuredResult:
              'An ongoing 15-year observational study is tracking new malignancies, new or worsening hematologic disorders, and all-cause mortality in the same treated patients; not yet mature.',
            independentGroupStatus: false,
          },
        ],
      },
      {
        slug: 'transfusion-independence-beta-thalassemia',
        claimType: 'effectiveness',
        consumerQuestion: 'Does Casgevy work for transfusion-dependent beta-thalassemia?',
        directAnswer:
          'In the pivotal trial, 39 of 42 evaluable patients (92.9%) went at least 12 consecutive months without a red blood cell transfusion, in a single-arm trial that also measured chemotherapy-related side effects.',
        measuredFinding:
          'In CLIMB THAL-111 (NCT03655678), 39 of 42 evaluable patients (92.9%, 95% CI 80.5-98.5%) achieved transfusion independence for 12+ consecutive months, mean follow-up ~19.2 months. Adverse events: febrile neutropenia (61.1%), mucositis/stomatitis (51.9%), hepatic veno-occlusive disease in 5 patients (8.5%). No treatment-related deaths or malignancies at that data cut (Locatelli et al., NEJM 2024).',
        inference:
          'That transfusion independence is permanent, or that the safety profile holds over decades, is inferred, not measured. The reported adverse events reflect the conditioning chemotherapy and transplant process as much as the edit itself, and are tracked only to 24 months in the primary publication.',
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          "FDA approval for this indication, granted January 16, 2024, rested directly on this trial's transfusion-independence endpoint, which makes it regulatory evidence rather than an industry finding alone. The study is still a single, unblinded, sponsor-run trial in 59 enrolled patients.",
        remainingUnknown:
          'Long-term durability of transfusion independence beyond the ~2 years of published follow-up, and the true incidence of rare, delayed complications (including malignancy) from myeloablative conditioning combined with gene editing, are not yet known.',
        evidenceNeededNext:
          'Extended, beta-thalassemia-specific follow-up data from the 15-year study (NCT04208529), and larger real-world post-approval safety cohorts.',
        outcomeSummary: '92.9% (39 of 42 evaluable patients) achieved transfusion independence for 12+ months in the pivotal trial.',
        displayPriority: 4,
        evidence: [
          {
            sourceKey: 'nejm-locatelli-2024-tdt',
            relationship: 'supports',
            claimPartAddressed: 'transfusion independence',
            directlyMeasuredResult:
              '39 of 42 evaluable patients (92.9%) achieved transfusion independence for 12+ months; adverse events included febrile neutropenia (61.1%) and hepatic veno-occlusive disease (8.5%); no treatment-related deaths or malignancies at that data cut.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'fda-sbra-tdt-2024',
            relationship: 'supports',
            claimPartAddressed: 'regulatory acceptance of the transfusion-independence endpoint',
            directlyMeasuredResult: 'FDA approved this indication on January 16, 2024 based on the trial result.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'nct04208529-ltfu',
            relationship: 'contextualizes',
            claimPartAddressed: 'long-term durability and safety',
            directlyMeasuredResult:
              'The same ongoing 15-year follow-up study covers TDT-treated patients from this trial.',
            independentGroupStatus: false,
          },
        ],
      },
      {
        slug: 'what-treatment-involves',
        claimType: 'access',
        consumerQuestion: 'What does actually getting treated with Casgevy involve?',
        directAnswer:
          "Casgevy is a one-time hospital procedure: the patient's own stem cells are collected, CRISPR-edited over several months, then infused back after chemotherapy clears their bone marrow, followed by roughly 4-6 weeks in hospital.",
        measuredFinding:
          'The FDA-approved label and manufacturer materials describe stem cell mobilization and apheresis collection, which can run several days and may be repeated, then several months of ex vivo manufacturing and release testing. The patient is then admitted for myeloablative busulfan conditioning, infused with the edited cells, and hospitalized about 4-6 weeks until neutrophil and platelet engraftment.',
        inference:
          'FDA approval does not establish that every eligible patient can reach this pathway. Access depends on proximity to a small number of accredited treatment centers, payer approval of a multi-million-dollar therapy, and willingness to accept conditioning-chemotherapy risks, including infertility.',
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          "The process here comes from the FDA-approved label and the manufacturer's patient and HCP materials for an approved product, not from speculation. Casgevy's label carries no boxed warning for hematologic malignancy; Lyfgenia, a different lentiviral-vector sickle cell gene therapy approved the same day, does.",
        remainingUnknown:
          'Vertex reported 64 patients dosed worldwide by the end of 2025, against tens of thousands estimated eligible across the U.S. and EU. How uptake, real-world engraftment outcomes, and complication rates look as more centers scale up is not yet established.',
        evidenceNeededNext:
          'Post-marketing real-world outcomes data (engraftment success rate, serious adverse event rate, time-to-infusion) as more centers and more patients are treated outside the original trials.',
        displayPriority: 5,
        evidence: [
          {
            sourceKey: 'fda-label-dailymed',
            relationship: 'supports',
            claimPartAddressed: 'treatment process and labeled warnings',
            directlyMeasuredResult:
              'Label specifies the myeloablative conditioning requirement and warnings and precautions including neutrophil engraftment failure, delayed platelet engraftment, hypersensitivity reactions, and off-target genome editing risk.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'casgevy-treatment-journey',
            relationship: 'supports',
            claimPartAddressed: 'practical steps of collection, conditioning, and hospitalization',
            directlyMeasuredResult:
              'Manufacturer materials describe apheresis collection, several months of ex vivo manufacturing, inpatient busulfan conditioning, and roughly 4-6 weeks of hospitalization around infusion.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'vertex-earnings-access-2026',
            relationship: 'contextualizes',
            claimPartAddressed: 'real-world uptake and access barriers',
            directlyMeasuredResult:
              'Only 64 patients had completed dosing globally by the end of 2025, against roughly 301 who began the process that year; the company cited conditioning-related infertility risk as one deterrent to uptake.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'casgevy-price-2023',
            relationship: 'contextualizes',
            claimPartAddressed: 'cost',
            directlyMeasuredResult: 'Vertex set $2.2 million as the U.S. wholesale acquisition cost at launch.',
            independentGroupStatus: false,
          },
        ],
        comprehensionQuestions: [
          {
            question: 'What does receiving Casgevy actually involve?',
            options: [
              'A single outpatient injection, similar to a vaccine.',
              'Taking a daily pill for several months.',
              "Collecting the patient's own stem cells, editing them in a lab over several months, clearing out their existing bone marrow with chemotherapy, then re-infusing the edited cells and staying in hospital for several weeks to recover.",
              'A course of outpatient physical therapy sessions.',
            ],
            correctOptionIndex: 2,
            explanation:
              "Casgevy is an approved, one-time cell therapy, but 'approved' does not mean simple to deliver — the real pathway involves stem cell collection, months of manufacturing, myeloablative chemotherapy, and roughly 4-6 weeks of hospitalization, which is why Vertex reports the whole process typically takes close to a year and why real-world uptake (64 patients dosed worldwide by the end of 2025) has been far smaller than the eligible patient population.",
          },
        ],
      },
    ],
  },
  evidenceSources: [
    {
      key: 'fda-approval-scd-2023',
      title: 'FDA Approves First Gene Therapies to Treat Patients with Sickle Cell Disease',
      journalOrIssuer: 'U.S. Food and Drug Administration',
      publicationYear: 2023,
      regulatoryUrl:
        'https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease',
      sourceType: 'FDA approval press release',
    },
    {
      key: 'fda-sbra-tdt-2024',
      title: 'Summary Basis for Regulatory Action — CASGEVY (transfusion-dependent beta-thalassemia indication)',
      journalOrIssuer: 'U.S. Food and Drug Administration, Center for Biologics Evaluation and Research',
      publicationYear: 2024,
      regulatoryUrl: 'https://www.fda.gov/media/175842/download',
      sourceType: 'FDA summary basis for regulatory action',
    },
    {
      key: 'fda-approval-pediatric-2026',
      title: 'FDA Approves First Gene Therapy for Young Children with Sickle Cell Disease',
      journalOrIssuer: 'U.S. Food and Drug Administration',
      publicationYear: 2026,
      regulatoryUrl:
        'https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapy-young-children-sickle-cell-disease',
      sourceType: 'FDA approval press release',
    },
    {
      key: 'fda-label-dailymed',
      title: 'CASGEVY (exagamglogene autotemcel) — FDA-approved prescribing information',
      journalOrIssuer: 'U.S. FDA / DailyMed, National Library of Medicine',
      regulatoryUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=7c3e12ad-e2fe-4d3f-a630-ea7364d9e846',
      sourceType: 'FDA-approved prescribing information (label)',
    },
    {
      key: 'mhra-approval-2023',
      title:
        'Vertex and CRISPR Therapeutics Announce Authorization of the First CRISPR/Cas9 Gene-Edited Therapy, CASGEVY (exagamglogene autotemcel), by the United Kingdom MHRA',
      authors: 'Vertex Pharmaceuticals; CRISPR Therapeutics',
      publicationYear: 2023,
      journalOrIssuer: 'Vertex Pharmaceuticals Newsroom',
      regulatoryUrl:
        'https://news.vrtx.com/news-releases/news-release-details/vertex-and-crispr-therapeutics-announce-authorization-first',
      sourceType: 'sponsor regulatory announcement (MHRA authorization)',
    },
    {
      key: 'ema-approval-2024',
      title:
        'European Commission Approves First CRISPR/Cas9 Gene-Edited Therapy, CASGEVY (exagamglogene autotemcel), for the Treatment of Sickle Cell Disease and Transfusion-Dependent Beta Thalassemia',
      authors: 'Vertex Pharmaceuticals; CRISPR Therapeutics',
      publicationYear: 2024,
      journalOrIssuer: 'Vertex Pharmaceuticals Newsroom',
      regulatoryUrl:
        'https://news.vrtx.com/news-releases/news-release-details/european-commission-approves-first-crisprcas9-gene-edited',
      sourceType: 'sponsor regulatory announcement (European Commission approval)',
    },
    {
      key: 'nejm-frangoul-2024-scd',
      title: 'Exagamglogene Autotemcel for Severe Sickle Cell Disease',
      authors:
        'Frangoul H, Locatelli F, Sharma A, Bhatia M, Mapara M, Molinari L, Wall D, Liem RI, Telfer P, Shah AJ, Cavazzana M, Corbacioglu S, Rondelli D, Meisel R, Dedeken L, Lobitz S, de Montalembert M, Steinberg MH, Walters MC, Eckrich MJ, Imren S, Bower L, Simard C, Zhou W, Xuan F, Morrow PK, Hobbs WE, Grupp SA (CLIMB SCD-121 Study Group)',
      publicationYear: 2024,
      journalOrIssuer: 'New England Journal of Medicine, 390(18):1649-1662',
      doi: '10.1056/NEJMoa2309676',
      pmid: '38661449',
      clinicalTrialId: 'NCT03745287',
      sourceType: 'single-arm, open-label phase 1/2/3 clinical trial',
      studyDesign: 'single-group, open-label, multicenter (CLIMB SCD-121)',
      species: 'human',
      sampleSize: 44,
      endpoint:
        'Proportion of patients free of vaso-occlusive crises for at least 12 consecutive months (VF12), among 44 patients treated and 30 evaluable at the time of analysis.',
    },
    {
      key: 'nejm-locatelli-2024-tdt',
      title: 'Exagamglogene Autotemcel for Transfusion-Dependent β-Thalassemia',
      authors: 'Locatelli F, Lang P, Wall D, et al. (CLIMB THAL-111 Study Group)',
      publicationYear: 2024,
      journalOrIssuer: 'New England Journal of Medicine, 390(18):1663-1676',
      doi: '10.1056/NEJMoa2309673',
      clinicalTrialId: 'NCT03655678',
      sourceType: 'single-arm, open-label phase 1/2/3 clinical trial',
      studyDesign: 'single-group, open-label, multicenter (CLIMB THAL-111)',
      species: 'human',
      sampleSize: 42,
      endpoint:
        'Proportion of patients achieving transfusion independence for at least 12 consecutive months (TI12), among 59 patients enrolled and 42 evaluable at the time of analysis.',
    },
    {
      key: 'nejm-specificity-2024',
      title: 'Specificity of CRISPR-Cas9 Editing in Exagamglogene Autotemcel',
      publicationYear: 2024,
      journalOrIssuer: 'New England Journal of Medicine',
      doi: '10.1056/NEJMc2313119',
      sourceType: 'correspondence / off-target editing specificity analysis',
      studyDesign: 'computational off-target prediction plus GUIDE-seq and targeted hybrid-capture deep sequencing',
      endpoint: 'Presence or absence of confirmed off-target CRISPR-Cas9 editing at nominated candidate loci',
    },
    {
      key: 'nct04208529-ltfu',
      title:
        'A Long-term Follow-up Study of Subjects With β-thalassemia or Sickle Cell Disease Treated With Autologous CRISPR-Cas9 Modified Hematopoietic Stem Cells (CTX001)',
      journalOrIssuer: 'ClinicalTrials.gov / Vertex Pharmaceuticals (sponsor), with CRISPR Therapeutics (collaborator)',
      clinicalTrialId: 'NCT04208529',
      regulatoryUrl: 'https://clinicaltrials.gov/study/NCT04208529',
      sourceType: 'ongoing 15-year observational long-term follow-up study',
      studyDesign: 'multi-site, open-label, single-group rollover follow-up study; estimated completion 2039',
      species: 'human',
      endpoint:
        'New malignancies; new or worsening hematologic disorders; all-cause mortality; long-term safety and efficacy, followed for up to 15 years post-infusion.',
    },
    {
      key: 'vertex-earnings-access-2026',
      title: "Vertex's CRISPR therapy rebounds in latest earnings",
      journalOrIssuer: 'BioPharma Dive',
      publicationYear: 2026,
      regulatoryUrl: 'https://www.biopharmadive.com/news/vertex-earnings-casgevy-q4-2025/812243/',
      sourceType: "trade press reporting on the manufacturer's own earnings disclosure",
    },
    {
      key: 'casgevy-treatment-journey',
      title: 'The CASGEVY Treatment Journey (patient and healthcare-provider materials)',
      journalOrIssuer: 'Vertex Pharmaceuticals / CRISPR Therapeutics (casgevy.com)',
      regulatoryUrl: 'https://www.casgevy.com/sickle-cell-disease/treatment-journey',
      sourceType: 'manufacturer patient/HCP education material',
    },
    {
      key: 'casgevy-price-2023',
      title: 'U.S. approves first gene-editing treatment, Casgevy, for sickle cell disease',
      journalOrIssuer: 'CNBC',
      publicationYear: 2023,
      regulatoryUrl: 'https://www.cnbc.com/2023/12/08/casgevy-first-crispr-gene-editing-treatment-approved-in-us.html',
      sourceType: 'news reporting',
    },
  ],
}

export default seed
