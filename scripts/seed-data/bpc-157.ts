import type { SeedFile } from '@/lib/seed-types'

// Research notes (2026-08-18):
// - Preclinical (rat / cell) healing studies verified via PubMed / Europe PMC (real PMID + DOI).
// - Searched "BPC-157 human clinical trial" / "BPC-157 human": as of this research date, no
//   randomized, placebo-controlled human trial has published results for any indication. The
//   only registered Phase I human trial (NCT02637284) has never posted results. A 2025
//   systematic review (Vasireddi et al., HSS Journal) of 544 identified articles found only 1
//   of 36 included studies was clinical (a retrospective, uncontrolled case series), the other
//   35 preclinical — and states explicitly "No clinical safety data were found." This is cited
//   directly rather than assumed.
// - FDA status verified via FDA's own "Certain Bulk Drug Substances for Use in Compounding that
//   May Present Significant Safety Risks" page (Category 2, added Sept 29, 2023) and corroborated
//   by FDA's Pharmacy Compounding Advisory Committee (PCAC) calendar entry for the July 23-24,
//   2026 meeting plus independent press confirmation (STAT News) of the resulting non-binding
//   8-6 vote. BPC-157 remains an unapproved drug substance either way.
// - WADA status: secondary sources disagreed on whether BPC-157 is explicitly named on the
//   Prohibited List versus only arguably covered by the S0/S2.3 catch-all language, and a direct
//   fetch of wada-ama.org did not return verifiable page content. Per the "verify, don't assume"
//   instruction, no WADA regulatory-status claim is included in this file.
// - No Singapore HSA-specific primary source was found (only secondary/aggregator blogs), so no
//   Singapore regulatory-status entry is included either.

const seed: SeedFile = {
  entity: {
    canonicalName: 'BPC-157',
    slug: 'bpc-157',
    aliases: ['Body Protection Compound 157', 'Pentadecapeptide BPC 157', 'PL 14736', 'PL-10', 'PLD-116'],
    entityType: 'peptide',
    shortDescription:
      'A synthetic 15-amino-acid peptide modeled on a fragment of a protective protein found in human gastric juice, sold online as a "research chemical" and marketed for tendon, joint, and gut healing.',
    bottomLine:
      'BPC-157 has produced tissue-healing effects in rat and cell studies of tendon, ligament, and gut injury, but no controlled human trial has confirmed that it speeds healing or is safe for human use.',
    regulatoryCategory: 'unapproved_therapeutic_substance',
    accessRealityNote:
      'BPC-157 is not an approved medicine or a legal dietary supplement anywhere. No regulator has verified the identity, purity or sterility of material sold under this name, so what a given vial actually contains is unknown. The FDA has separately identified unresolved immunogenicity and impurity-characterization concerns specific to BPC-157.',
    regulatoryStatuses: [
      {
        jurisdiction: 'United States — FDA (503A bulk drug substances for compounding)',
        legalCategory: 'unapproved_therapeutic_substance',
        statusStatement:
          'BPC-157 is not an FDA-approved drug for any indication. On September 29, 2023, FDA placed it in Category 2 of the 503A bulk drug substances list — substances that may present significant safety risks and fall outside FDA\'s enforcement-discretion policy for compounding. FDA cited potential immunogenicity for certain routes of administration and unresolved peptide impurity and active-ingredient characterization issues.',
        source:
          'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
        checkedDate: '2026-08-18',
      },
      {
        jurisdiction: 'United States — FDA Pharmacy Compounding Advisory Committee (2026 update)',
        legalCategory: 'unapproved_therapeutic_substance',
        statusStatement:
          'On July 23, 2026, FDA\'s Pharmacy Compounding Advisory Committee voted 8-6, with one abstention, to recommend that BPC-157 be added to the 503A bulks list eligible for compounding. This recommendation is non-binding: FDA has not issued a final decision, the vote does not constitute drug approval, and BPC-157 remains an unapproved substance whose safety and effectiveness have not been established through FDA review.',
        source:
          'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026',
        checkedDate: '2026-08-18',
      },
    ],
    claims: [
      {
        slug: 'tendon-healing',
        claimType: 'effectiveness',
        consumerQuestion: 'Does BPC-157 heal tendons and ligaments faster?',
        directAnswer:
          'BPC-157 has accelerated tendon and ligament healing in rat and cell studies, but no controlled human trial has tested whether it speeds tendon recovery in people.',
        measuredFinding:
          'In rats, BPC-157 improved biomechanical strength and histological healing of injured ligaments and detached Achilles tendons compared to untreated controls. In cultured rat tendon fibroblasts and tendon explants, it increased cell outgrowth, survival under oxidative stress, and migration through activation of the FAK-paxillin signaling pathway.',
        inference:
          'These cell- and animal-level mechanisms are consistent with a plausible tendon-healing effect in humans, but no controlled human trial has tested that inference. The effect may not translate directly, given species differences in tendon biology, injury type, dosing, and route of administration.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation:
          'Every direct measurement of a tendon- or ligament-healing outcome comes from rat injury models. The receptor- and pathway-level mechanism also has support from isolated human and rat cell experiments. No human study, controlled or uncontrolled, has measured tendon or ligament healing outcomes with BPC-157.',
        remainingUnknown:
          'Whether BPC-157 measurably speeds tendon or ligament healing in humans, at what dose, by what route, and with what safety profile, is unknown.',
        evidenceNeededNext:
          'A registered, controlled human trial in a defined tendon or ligament injury (e.g., surgically repaired Achilles tendon) with objective structural or functional endpoints, not self-reported symptom relief.',
        mechanismSummary:
          'BPC-157 upregulates VEGFR2 receptor signaling (Akt-eNOS pathway) and activates FAK-paxillin signaling in tendon fibroblasts, both measured directly in cell and animal experiments. Those steps are proposed to drive new blood vessel formation and fibroblast migration at an injury site.',
        outcomeSummary:
          'Claimed outcome, not yet tested in a controlled human trial: faster, more complete recovery from tendon and ligament injuries in people.',
        displayPriority: 1,
        mechanismSteps: [
          {
            displayOrder: 1,
            technicalLabel:
              'BPC-157 increases VEGFR2 receptor expression and promotes its internalization in vascular endothelial cells',
            plainLanguageExplanation:
              'In lab-grown human blood-vessel cells, adding BPC-157 caused the cells to produce more of a receptor called VEGFR2 and pull it inside the cell — an early step in triggering blood-vessel-building signals.',
            evidenceContext:
              'Measured directly in vitro using cultured human vascular endothelial cells; receptor upregulation was also confirmed histologically in rat hind-limb muscle tissue (Hsieh et al. 2017).',
            status: 'measured',
            sourceLinks: ['https://pubmed.ncbi.nlm.nih.gov/27847966/'],
          },
          {
            displayOrder: 2,
            technicalLabel:
              'VEGFR2 activation drives Akt-eNOS signaling, and, separately, FAK-paxillin activation occurs in tendon fibroblasts',
            plainLanguageExplanation:
              'Once triggered, the receptor sets off a chain of internal cell signals (Akt-eNOS) linked to new blood-vessel growth. In tendon cells specifically, a separate internal signal (FAK-paxillin) helps the cells move and spread — both measured directly in cell experiments.',
            evidenceContext:
              'Akt-eNOS activation measured in vitro, blocked by an endocytosis inhibitor (Hsieh et al. 2017). FAK-paxillin phosphorylation measured by Western blot in rat tendon fibroblasts (Chang et al. 2011).',
            status: 'measured',
            sourceLinks: [
              'https://pubmed.ncbi.nlm.nih.gov/27847966/',
              'https://pubmed.ncbi.nlm.nih.gov/21030672/',
            ],
          },
          {
            displayOrder: 3,
            technicalLabel:
              'Increased fibroblast migration, cell survival, and new blood vessel formation (angiogenesis) at the injury site',
            plainLanguageExplanation:
              'These signals are linked to tendon-repair cells moving into an injury site, surviving stress better, and new blood vessels forming to supply the healing tissue — measured in living rat injury models, not just isolated cells.',
            evidenceContext:
              'Rat hind-limb ischemia: increased vessel density, faster blood-flow recovery (Hsieh et al. 2017). Rat ligament and Achilles tendon injury: improved histology and strength (Cerovecki et al. 2010).',
            status: 'measured',
            sourceLinks: [
              'https://pubmed.ncbi.nlm.nih.gov/27847966/',
              'https://pubmed.ncbi.nlm.nih.gov/20225319/',
            ],
          },
          {
            displayOrder: 4,
            technicalLabel: 'Faster, more complete tendon and ligament healing in people',
            plainLanguageExplanation:
              'This is the outcome marketed to consumers: that these cell- and animal-level effects translate into people recovering from tendon and ligament injuries faster. That final step has not been directly measured in a controlled human trial.',
            evidenceContext:
              'No controlled human trial has tested this outcome. A 2025 systematic review of 36 included studies found 1 clinical study — an uncontrolled case series, not tendon-specific.',
            status: 'inferred',
            sourceLinks: ['https://pubmed.ncbi.nlm.nih.gov/40756949/'],
          },
        ],
        evidence: [
          {
            sourceKey: 'cerovecki-2010-ligament',
            relationship: 'supports',
            claimPartAddressed: 'ligament and tendon healing in an animal model',
            directlyMeasuredResult:
              'BPC-157 improved biomechanical (tensile strength) and histological ligament-healing parameters in rats compared to untreated controls.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'chang-2011-tendon-fibroblast',
            relationship: 'supports',
            claimPartAddressed: 'cellular mechanism of tendon repair',
            directlyMeasuredResult:
              'BPC-157 increased tendon fibroblast outgrowth from explants, cell survival under oxidative stress, and cell migration in vitro, mediated by activation of the FAK-paxillin signaling pathway.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'hsieh-2017-vegfr2',
            relationship: 'supports',
            claimPartAddressed: 'vascular / angiogenic mechanism proposed to support tissue repair',
            directlyMeasuredResult:
              'BPC-157 increased VEGFR2 expression and activated the VEGFR2-Akt-eNOS pathway in human vascular endothelial cells in vitro, and increased vessel density and blood-flow recovery in an ischemic rat hind-limb model.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'vasireddi-2025-systematic-review',
            relationship: 'limits',
            claimPartAddressed: 'overall strength and quantity of human evidence for musculoskeletal claims',
            directlyMeasuredResult:
              'A systematic review of 544 identified articles (1993-2024) found 36 met inclusion criteria: 35 were preclinical and only 1 was clinical (a retrospective, uncontrolled case series, not tendon-specific). The review concluded no clinical safety data exist and classified the evidence base as level IV/V studies.',
            independentGroupStatus: true,
          },
        ],
        comprehensionQuestions: [
          {
            question: 'What does the evidence for BPC-157 and tendon healing actually show?',
            options: [
              'Controlled clinical trials in humans have proven it heals tendons faster.',
              'It has shown healing-related effects in rat and cell studies, but this has not been confirmed in a controlled human trial.',
              'There is no scientific evidence of any kind that it affects tendon tissue.',
            ],
            correctOptionIndex: 1,
            explanation:
              'Real preclinical evidence exists in animal and cell models — but that is a different, weaker evidentiary claim than "proven to work in people." No controlled human trial has tested it, which is exactly the gap this page is meant to make visible.',
          },
          {
            question:
              'If a website claims "BPC-157 heals tendons — proven by science," what is the most accurate description of the evidence behind that claim?',
            options: [
              "It's based on promising lab and animal research, but there is no controlled human trial confirming the effect in people.",
              "It's proven — there are large controlled human trials confirming this.",
              "It's fabricated — there is no legitimate research on BPC-157 at all.",
            ],
            correctOptionIndex: 0,
            explanation:
              '"Promising in rats and cells" and "proven in people" are different claims. Marketing language often blurs that line. This page keeps the two separated.',
          },
        ],
      },
      {
        slug: 'gut-healing',
        claimType: 'effectiveness',
        consumerQuestion: 'Does BPC-157 heal the gut lining or help conditions like leaky gut, IBD, or ulcers?',
        directAnswer:
          'In rat models of intestinal injury and short-bowel syndrome, BPC-157 improved gut healing, but this has not been tested in any human clinical trial for a gut condition.',
        measuredFinding:
          'In rats, BPC-157 improved bursting pressure and histological healing after surgical intestinal anastomosis (a segment of bowel rejoined after resection). In a 24-hour short-bowel rat model, it reduced gastrointestinal, liver, and brain injury severity, including when injury was worsened by an NSAID (diclofenac).',
        inference:
          'These findings suggest a plausible gut-protective and healing effect that researchers have proposed could extend to human inflammatory bowel conditions. It has not been tested in people: a company-run human trial program in inflammatory bowel disease was registered but never published results.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation:
          'All direct evidence of gut-healing effects comes from rat surgical and injury models. No human study — controlled or uncontrolled — has tested BPC-157 for gut healing, inflammatory bowel disease, ulcers, or "leaky gut."',
        remainingUnknown:
          'Whether BPC-157 has any measurable effect on human intestinal healing, at what dose, by what route, or with what safety profile in the gut specifically, is unknown.',
        evidenceNeededNext:
          'A registered, controlled human trial in a defined GI condition (e.g., mild ulcerative colitis) with objective endoscopic or biomarker endpoints, not just symptom self-report.',
        displayPriority: 2,
        evidence: [
          {
            sourceKey: 'vuksic-2007-anastomosis',
            relationship: 'supports',
            claimPartAddressed: 'intestinal surgical-wound healing in an animal model',
            directlyMeasuredResult:
              'BPC-157 improved anastomotic bursting pressure and histological healing parameters of ileoileal anastomosis in rats compared to controls.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'lojo-2016-short-bowel',
            relationship: 'supports',
            claimPartAddressed: 'gastrointestinal injury severity in a short-bowel animal model',
            directlyMeasuredResult:
              'BPC-157 ameliorated gastrointestinal, liver, and brain lesions and countered intestinal-adaptation deterioration in a 24-hour short-bowel rat model, including under diclofenac-induced aggravation.',
            independentGroupStatus: false,
          },
        ],
      },
      {
        slug: 'safety',
        claimType: 'safety',
        consumerQuestion: 'Is BPC-157 safe to use?',
        directAnswer:
          'Animal studies and one 2-person uncontrolled human pilot found no measured harm at the doses tested, but that falls far short of the controlled safety testing normally required to establish a substance as safe for human use.',
        measuredFinding:
          'BPC-157 has been reported as non-toxic across the dose ranges used in the rat healing studies cited elsewhere in this entry. In the one identified human interventional safety study, intravenous infusion of up to 20 mg of BPC-157 in 2 healthy adults produced no measurable change in cardiac, hepatic, renal, thyroid, or glucose biomarkers over 3 days.',
        inference:
          'Absence of measured harm in a 2-person, 3-day pilot and in animal studies does not establish a human safety profile. Detecting less common or delayed adverse effects, including the immunogenicity risk FDA flagged for injectable peptide products, requires larger, longer, controlled human studies.',
        proofBoundaryStage: 'uncontrolled_human_intervention',
        proofBoundaryExplanation:
          'The only human interventional safety data identified is a single uncontrolled pilot study in 2 people. A 2025 systematic review of the wider literature found no other human clinical safety data. This is genuine human evidence, but it is uncontrolled and far too small to establish a safety profile.',
        remainingUnknown:
          'Long-term safety, immunogenicity risk, and drug interactions are all unknown in humans. So is safety at the doses and routes people use: BPC-157 is most commonly reported as injected subcutaneously by users, a route the published IV pilot did not test.',
        evidenceNeededNext:
          'Controlled human safety studies at realistic doses and routes of use, including immunogenicity testing and longer follow-up — the kind of evidence FDA reviewers have themselves said does not yet exist.',
        displayPriority: 3,
        evidence: [
          {
            sourceKey: 'lee-2025-iv-safety-pilot',
            relationship: 'supports',
            claimPartAddressed: 'short-term human tolerability of intravenous BPC-157 at the doses studied',
            directlyMeasuredResult:
              'IV infusion of up to 20 mg BPC-157 in 2 healthy adults produced no measurable adverse change in tested cardiac, hepatic, renal, thyroid, or glucose biomarkers over 3 days.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'vasireddi-2025-systematic-review',
            relationship: 'limits',
            claimPartAddressed: 'existence of human safety data in the published literature',
            directlyMeasuredResult:
              'States explicitly that "no clinical safety data were found" for BPC-157 beyond the single retrospective clinical study identified, despite preclinical safety studies showing no adverse effects across several organ systems in animal models.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'fda-503a-safety-risk-list',
            relationship: 'limits',
            claimPartAddressed: 'regulatory assessment of manufacturing and immunogenicity risk',
            directlyMeasuredResult:
              'FDA placed BPC-157 on its list of bulk drug substances presenting significant safety risks for compounding (added September 29, 2023), citing potential immunogenicity for certain routes of administration and complexities in peptide-related impurity and active-ingredient characterization.',
          },
          {
            sourceKey: 'fda-pcac-july-2026',
            relationship: 'contextualizes',
            claimPartAddressed: 'current regulatory trajectory of the FDA safety restriction',
            directlyMeasuredResult:
              'On July 23, 2026, an FDA advisory committee voted 8-6 (one abstention) to non-bindingly recommend BPC-157 for the 503A compounding bulks list; FDA has not issued a final decision, and BPC-157 remains an unapproved substance regardless of the outcome.',
          },
        ],
      },
      {
        slug: 'human-testing',
        claimType: 'effectiveness',
        consumerQuestion: 'Has BPC-157 actually been tested in human clinical trials?',
        directAnswer:
          'A Phase I human safety trial was registered in 2015 but never published results, and as of August 18, 2026 no randomized, controlled human trial of BPC-157 has published results for any condition.',
        measuredFinding:
          'A Phase I trial (NCT02637284, 42 healthy volunteers, sponsor PharmaCotherapia) was registered to assess safety and pharmacokinetics. No results have ever been posted to ClinicalTrials.gov. A 2025 systematic review screened 544 articles (1993-2024) and included 36: 35 preclinical, 1 clinical. That one study was a retrospective, uncontrolled case series of 12 patients with chronic knee pain.',
        inference:
          'The near-total absence of human trial data does not mean BPC-157 fails to work in people — it means that specific claim has not been tested, which is a different, weaker evidentiary position than either "proven" or "disproven."',
        proofBoundaryStage: 'uncontrolled_human_intervention',
        proofBoundaryExplanation:
          'The most advanced human evidence identified is a small retrospective, uncontrolled case series and a separate 2-person uncontrolled safety pilot. No controlled human trial with published results exists at any phase, for any indication.',
        remainingUnknown:
          'Whether a controlled trial would confirm any of the effects seen in animals, and why the one registered Phase I trial\'s results were never published, are both unknown from public information.',
        evidenceNeededNext:
          'Publication of results from a completed, adequately powered, controlled human trial — the category of evidence this entity currently lacks entirely.',
        displayPriority: 4,
        evidence: [
          {
            sourceKey: 'nct02637284-phase1-trial',
            relationship: 'limits',
            claimPartAddressed: 'existence of a completed, results-reported human clinical trial',
            directlyMeasuredResult:
              'A Phase I safety/pharmacokinetics trial in 42 healthy volunteers (NCT02637284) was registered but no results have ever been posted to the public registry.',
          },
          {
            sourceKey: 'vasireddi-2025-systematic-review',
            relationship: 'contextualizes',
            claimPartAddressed: 'systematic search for controlled human clinical evidence',
            directlyMeasuredResult:
              'Of 544 identified articles and 36 included studies (1993-2024), only 1 was clinical, and it was a retrospective, uncontrolled case series; no randomized controlled trial was identified for any indication.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'lee-2025-iv-safety-pilot',
            relationship: 'contextualizes',
            claimPartAddressed: 'extent of existing human interventional data',
            directlyMeasuredResult:
              'The only interventional human study identified with directly measured data involved 2 participants and assessed safety biomarkers only, not effectiveness outcomes.',
          },
        ],
      },
    ],
  },
  evidenceSources: [
    {
      key: 'cerovecki-2010-ligament',
      title: 'Pentadecapeptide BPC 157 (PL 14736) improves ligament healing in the rat',
      authors: 'Cerovecki T, Bojanic I, Brcic L, Radic B, Vukoja I, Seiwerth S, Sikiric P',
      publicationYear: 2010,
      journalOrIssuer: 'Journal of Orthopaedic Research',
      doi: '10.1002/jor.21107',
      pmid: '20225319',
      sourceType: 'animal study (rat)',
      studyDesign: 'controlled animal injury study',
      experimentalModel: 'surgically transected medial collateral ligament',
      species: 'rat',
      endpoint: 'biomechanical (tensile strength) and histological ligament-healing parameters',
    },
    {
      key: 'chang-2011-tendon-fibroblast',
      title:
        'The promoting effect of pentadecapeptide BPC 157 on tendon healing involves tendon outgrowth, cell survival, and cell migration',
      authors: 'Chang CH, Tsai WC, Lin MS, Hsu YH, Pang JH',
      publicationYear: 2011,
      journalOrIssuer: 'Journal of Applied Physiology',
      doi: '10.1152/japplphysiol.00945.2010',
      pmid: '21030672',
      sourceType: 'in vitro / ex vivo mechanistic study (cultured tendon fibroblasts and tendon explants)',
      studyDesign: 'in vitro / ex vivo mechanistic experiment',
      experimentalModel: 'Achilles tendon explants and derived fibroblast cell culture',
      species: 'rat (cell/tissue source)',
      endpoint: 'tendon fibroblast outgrowth, survival under oxidative stress, and migration',
    },
    {
      key: 'hsieh-2017-vegfr2',
      title: 'Therapeutic potential of pro-angiogenic BPC157 is associated with VEGFR2 activation and up-regulation',
      authors: 'Hsieh MJ, Liu HT, Wang CN, Huang HY, Lin Y, Ko YS, Wang JS, Chang VH, Pang JS',
      publicationYear: 2017,
      journalOrIssuer: 'Journal of Molecular Medicine',
      doi: '10.1007/s00109-016-1488-y',
      pmid: '27847966',
      sourceType: 'mechanistic study (in vitro human vascular endothelial cells + in vivo rat hind-limb ischemia model)',
      studyDesign: 'in vitro cell assay combined with in vivo animal ischemia model',
      experimentalModel: 'human vascular endothelial cell tube-formation assay; rat hind-limb ischemia',
      species: 'human cells (in vitro) and rat (in vivo)',
      endpoint: 'VEGFR2 expression/activation, endothelial tube formation, vessel density, blood-flow recovery',
    },
    {
      key: 'vuksic-2007-anastomosis',
      title:
        'Stable gastric pentadecapeptide BPC 157 in trials for inflammatory bowel disease (PL-10, PLD-116, PL14736, Pliva, Croatia) heals ileoileal anastomosis in the rat',
      authors:
        'Vuksic T, Zoricic I, Brcic L, Sever M, Klicek R, Radic B, Cesarec V, Berkopic L, Keller N, Blagaic AB, Kokic N, Jelic I, Geber J, Anic T, Seiwerth S, Sikiric P',
      publicationYear: 2007,
      journalOrIssuer: 'Surgery Today',
      doi: '10.1007/s00595-006-3498-9',
      pmid: '17713731',
      sourceType: 'animal study (rat)',
      studyDesign: 'controlled animal surgical-injury study',
      experimentalModel: 'ileoileal anastomosis',
      species: 'rat',
      endpoint: 'anastomotic bursting pressure and histological healing parameters',
    },
    {
      key: 'lojo-2016-short-bowel',
      title:
        'Effects of Diclofenac, L-NAME, L-Arginine, and Pentadecapeptide BPC 157 on Gastrointestinal, Liver, and Brain Lesions, Failed Anastomosis, and Intestinal Adaptation Deterioration in 24 Hour-Short-Bowel Rats',
      authors: 'Lojo N, Rasic Z, Zenko Sever A, Kolenc D, Vukusic D, Drmic D, Zoricic I, Sever M, Seiwerth S, Sikiric P',
      publicationYear: 2016,
      journalOrIssuer: 'PLoS One',
      doi: '10.1371/journal.pone.0162590',
      pmid: '27627764',
      sourceType: 'animal study (rat)',
      studyDesign: 'controlled animal injury study, including NSAID-aggravated subgroup',
      experimentalModel: '24-hour short-bowel resection with diclofenac / L-NAME / L-arginine co-treatment arms',
      species: 'rat',
      endpoint: 'GI, liver, and brain lesion severity; intestinal adaptation; anastomotic failure rate',
    },
    {
      key: 'lee-2025-iv-safety-pilot',
      title: 'Safety of Intravenous Infusion of BPC157 in Humans: A Pilot Study',
      authors: 'Lee E, Burgess K',
      publicationYear: 2025,
      journalOrIssuer: 'Alternative Therapies in Health and Medicine',
      pmid: '40131143',
      sourceType: 'uncontrolled human pilot study (n=2)',
      studyDesign: 'open-label, uncontrolled, IRB-approved pilot',
      experimentalModel: 'sequential-dose IV infusion (10 mg day 1, 20 mg day 2) with blood biomarkers and vitals',
      species: 'human',
      sampleSize: 2,
      endpoint: 'cardiac, hepatic, renal, thyroid, and glucose biomarkers; vital signs',
    },
    {
      key: 'vasireddi-2025-systematic-review',
      title: 'Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic Review',
      authors: 'Vasireddi N, Hahamyan H, Salata MJ, Karns M, Calcei JG, Voos JE, Apostolakos JM',
      publicationYear: 2025,
      journalOrIssuer: 'HSS Journal: The Musculoskeletal Journal of Hospital for Special Surgery',
      doi: '10.1177/15563316251355551',
      pmid: '40756949',
      sourceType: 'systematic review',
      studyDesign: 'systematic review (PubMed, Cochrane, Embase; PROSPERO-checked; 1993 to June 3, 2024)',
      species: 'mixed (35 preclinical studies, 1 human clinical study)',
      endpoint: 'synthesis of BPC-157 mechanism, musculoskeletal outcomes, metabolism, and safety evidence quality',
    },
    {
      key: 'nct02637284-phase1-trial',
      title:
        'PCO-02 - A Phase I, Pilot Study in Healthy Volunteers, to Assess the Safety and Pharmacokinetics of PCO-02, Which Active Ingredient is BPC-157',
      authors: 'PharmaCotherapia d.o.o. (sponsor)',
      publicationYear: 2015,
      journalOrIssuer: 'ClinicalTrials.gov (NCT02637284)',
      clinicalTrialId: 'NCT02637284',
      sourceType: 'registered clinical trial record (Phase I, no results posted)',
      studyDesign: 'interventional Phase I safety/pharmacokinetics trial',
      species: 'human',
      sampleSize: 42,
      endpoint: 'safety and pharmacokinetics',
    },
    {
      key: 'fda-503a-safety-risk-list',
      title:
        'Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks (503A Category 2 list; BPC-157 added September 29, 2023)',
      journalOrIssuer: 'U.S. Food and Drug Administration',
      regulatoryUrl:
        'https://www.fda.gov/drugs/human-drug-compounding/certain-bulk-drug-substances-use-compounding-may-present-significant-safety-risks',
      sourceType: 'FDA regulatory determination (bulk drug substances safety-risk list)',
    },
    {
      key: 'fda-pcac-july-2026',
      title: 'July 23-24, 2026: Meeting of the Pharmacy Compounding Advisory Committee',
      journalOrIssuer: 'U.S. Food and Drug Administration — Pharmacy Compounding Advisory Committee',
      regulatoryUrl:
        'https://www.fda.gov/advisory-committees/advisory-committee-calendar/july-23-24-2026-meeting-pharmacy-compounding-advisory-committee-07232026',
      sourceType: 'FDA advisory committee meeting record (non-binding recommendation vote)',
    },
  ],
}

export default seed
