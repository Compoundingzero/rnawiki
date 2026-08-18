import type { SeedFile } from '@/lib/seed-types'

/**
 * Rapamycin (sirolimus) — the deliberate "middle ground" entity.
 *
 * Rapamycin is FDA-approved as an immunosuppressant for a narrow set of indications
 * (kidney transplant rejection prophylaxis, LAM) and has one of the most robustly
 * replicated lifespan-extension findings in the entire mouse literature (the NIA
 * Interventions Testing Program). Its use for human longevity/healthspan is entirely
 * off-label, and — as of this research pass (August 2026) — has exactly one completed,
 * published, placebo-controlled human trial (PEARL, Moel et al. 2025), whose primary
 * endpoint was null. Every citation below was verified against PubMed/PMC, the FDA
 * label via DailyMed, and ClinicalTrials.gov at research time; nothing here is invented.
 *
 * Sources verified during research:
 * - Harrison DE et al. 2009. Nature 460(7253):392-395. PMID 19587680. DOI 10.1038/nature08221.
 * - Miller RA et al. 2014. Aging Cell 13(3):468-477. PMID 24341993. DOI 10.1111/acel.12194.
 * - Strong R et al. 2020. Aging Cell 19(11):e13269. PMID 33145977. DOI 10.1111/acel.13269.
 * - Moel M et al. 2025. Aging (Albany NY) 17(4):908-936. PMID 40188830. DOI 10.18632/aging.206235.
 *   (PEARL trial, NCT04488601; ClinicalTrials.gov record itself shows status "Completed" but
 *   "Has Results: No" — the results live in the peer-reviewed journal article, not the CT.gov
 *   structured-results field. Sponsor: AgelessRx, a telehealth company that prescribes
 *   compounded rapamycin — a relevant conflict of interest, noted in the claim text below.)
 * - Saxton RA, Sabatini DM. 2017. Cell 169(2):361-371. PMID 28388417. DOI 10.1016/j.cell.2017.03.035.
 * - Sirolimus (Rapamune) FDA label, via DailyMed, revised November 2024:
 *   https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5908cd1a-fc5a-462f-99ed-1d8983e253c9
 *
 * Explicitly checked and NOT conflated: TAME (Targeting Aging with Metformin) is a metformin
 * trial, unrelated to rapamycin, and is not cited here.
 */

const seed: SeedFile = {
  entity: {
    canonicalName: 'Rapamycin (Sirolimus)',
    slug: 'rapamycin',
    aliases: ['Sirolimus', 'Rapamune', 'RAPA'],
    entityType: 'investigational_medicine',
    shortDescription:
      'An FDA-approved transplant-rejection drug and mTOR inhibitor with one of the most consistently replicated lifespan-extension findings in mice, now being used off-label — on much thinner human evidence — for longevity.',
    bottomLine:
      'Rapamycin is FDA-approved for kidney transplant rejection and the lung disease LAM; longevity use is off-label. It extended lifespan in mice, replicated across three NIA labs. The one completed placebo-controlled human trial found no significant effect on its primary endpoint, visceral fat.',
    regulatoryCategory: 'approved_medicine',
    accessRealityNote:
      'In the US, rapamycin is prescription-only, and no regulator anywhere has approved any dose or schedule for longevity or anti-aging. At the continuous doses used after transplant it changes lipids and blood counts and raises infection risk, which is why that use is monitored with regular blood tests.',
    regulatoryStatuses: [
      {
        jurisdiction: 'United States',
        legalCategory: 'approved_medicine',
        approvedIndications:
          'Prophylaxis of organ rejection in patients aged 13 years or older receiving renal (kidney) transplants, used in combination with cyclosporine and corticosteroids; treatment of lymphangioleiomyomatosis (LAM), a rare progressive lung disease. Not approved, and not recommended, for liver or lung transplant patients. No approval exists for longevity, healthspan, or anti-aging use in any indication or population.',
        statusStatement:
          'Sirolimus (brand name Rapamune) is an FDA-approved prescription immunosuppressant for the two indications above. Its boxed warning states that increased susceptibility to infection and the possible development of lymphoma and other malignancies may result from immunosuppression. Longevity use is off-label: legal for a licensed physician to prescribe at their clinical discretion, but not FDA-reviewed or FDA-approved.',
        source: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5908cd1a-fc5a-462f-99ed-1d8983e253c9',
        checkedDate: '2026-08-18',
      },
    ],
    claims: [
      // -----------------------------------------------------------------
      // Claim 1: effectiveness — the central human-evidence question
      // -----------------------------------------------------------------
      {
        slug: 'human-healthspan-evidence',
        claimType: 'effectiveness',
        consumerQuestion: 'Has rapamycin been shown to extend healthspan or lifespan in people?',
        directAnswer:
          'No — the one completed placebo-controlled trial (PEARL) found no significant effect on its primary measure, visceral fat, at one year. Secondary measures improved in a subgroup of women. No trial has measured human lifespan or healthspan.',
        measuredFinding:
          'PEARL (NCT04488601): 48 weeks, randomized, double-blind, placebo-controlled; 114 of 129 enrolled adults aged 50-85 completed: 5 mg/week (40), 10 mg/week (35), placebo (39). The primary endpoint, visceral adipose tissue by DXA, showed no significant difference (p = 0.942). Women at 10 mg/week gained 6.2 kg more lean mass (p = 0.018) and improved 8.1 points more on self-reported pain (p < 0.001).',
        inference:
          'The lean-mass and pain findings are secondary outcomes from one unreplicated trial, so they do not establish a healthspan or lifespan benefit. Effects on the outcomes that define healthspan — mortality, frailty, cognitive decline, disease incidence — remain unmeasured in humans.',
        proofBoundaryStage: 'controlled_human_evidence',
        proofBoundaryExplanation:
          'A published, double-blind, placebo-controlled trial exists, placing this claim at controlled human evidence. Its pre-specified primary endpoint was null; it was not powered for mortality or disease endpoints. Its positive secondary results come from one trial sponsored by AgelessRx, which sells compounded rapamycin.',
        remainingUnknown:
          'Whether the improvements in women replicate independently. Whether any dose or schedule affects human mortality, frailty, cognitive decline, or age-related disease incidence. Whether men respond differently. Use past one year, untested in any controlled trial.',
        evidenceNeededNext:
          'Independent replication in a second randomized, placebo-controlled trial — ideally longer than one year, with a mortality-, frailty-, or disease-incidence-relevant endpoint, and funded independently of any company that sells compounded rapamycin.',
        mechanismSummary:
          'Proposed to work through the same mTOR-inhibition pathway demonstrated in mice, but this causal chain has not been directly measured end-to-end in humans.',
        outcomeSummary:
          'One completed 48-week randomized controlled trial (n=114 completers): primary endpoint (visceral fat) null; secondary lean-mass and pain improvements in women at 10 mg/week; no human lifespan or hard-outcome data exist.',
        displayPriority: 10,
        evidence: [
          {
            sourceKey: 'pearl2025',
            relationship: 'supports',
            claimPartAddressed:
              'Whether a completed, controlled human trial exists, and what it actually measured and found',
            directlyMeasuredResult:
              'No significant difference between rapamycin and placebo on the primary endpoint (visceral adipose tissue, p = 0.942) after 48 weeks. Trial design: double-blind, randomized, placebo-controlled, decentralized, in adults aged 50-85 (Moel et al., 2025, Aging 17(4):908-936). Secondary improvements were limited to women in the 10 mg/week compounded-rapamycin group: 6.2 kg more lean tissue mass than placebo at 48 weeks (95% CI 0.88-11.51 kg, p = 0.018) and an 8.1-point greater improvement in self-reported pain (95% CI 3.04-13.10, p < 0.001). The 5 mg/week group showed a modest improvement in a general-health quality-of-life measure. No effect on mortality, disease incidence, frailty, or any other hard endpoint was measured, because the trial was not designed or powered to measure them.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'harrison2009',
            relationship: 'contextualizes',
            claimPartAddressed:
              'What has actually been established in mice, for contrast with the much thinner human record',
            directlyMeasuredResult:
              'Rapamycin fed to mice beginning at 600 days of age increased the age at which 90% of the population had died by 14% in females and 9% in males, replicated at three independent test sites.',
            independentGroupStatus: true,
          },
        ],
        comprehensionQuestions: [
          {
            question:
              'As of the most recent completed randomized controlled human trial (PEARL, 2025), what has actually been shown about rapamycin and human aging?',
            options: [
              'It has been proven to extend human lifespan',
              'Its primary measure (visceral fat) showed no significant effect after one year, though some secondary measures improved in a subgroup of women — this is not proof it extends healthspan or lifespan',
              'It has been shown to be unsafe for healthy adults',
              'It has completed FDA review for an anti-aging indication',
            ],
            correctOptionIndex: 1,
            explanation:
              'The PEARL trial is real, completed, and published — but its own pre-specified primary endpoint was null. The positive findings were secondary and limited to a subgroup (women), from a single unreplicated trial. Controlled human evidence existing is not the same as a claim being proven.',
          },
        ],
      },
      // -----------------------------------------------------------------
      // Claim 2: mechanism — what's established in mice, and how
      // -----------------------------------------------------------------
      {
        slug: 'mtor-mechanism',
        claimType: 'mechanism',
        consumerQuestion: 'How does rapamycin extend lifespan in mice, and does the same mechanism apply to people?',
        directAnswer:
          'Rapamycin inhibits mTOR, a cellular growth-signaling protein, and that inhibition extended both median and maximal lifespan across three independent NIA-funded mouse labs. The same causal chain has not been measured end-to-end in humans.',
        measuredFinding:
          'Harrison 2009: rapamycin from 600 days of age raised the age at 90% mortality 14% in female and 9% in male genetically heterogeneous mice, at three independent ITP sites. Miller 2014: same sites, median lifespan rose up to 23% in males and 26% in females at 42 ppm in food, less at lower doses. Strong 2020: intermittent or three-month dosing from 20 months matched lifelong dosing for male survival.',
        inference:
          'mTOR does the same basic job in mice and humans — regulating cell growth, protein synthesis, and autophagy — so researchers hypothesize the same inhibition could slow aging-related decline in people. That is a mechanism-based extrapolation, not a demonstrated human effect.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation:
          'The NIA Interventions Testing Program runs the same intervention at three independent labs at once, so a result cannot be one lab\'s fluke. Rapamycin passed that test in three published studies over more than a decade. It is still animal evidence: mouse lifespan extension is not proof of a human effect.',
        remainingUnknown:
          'Whether mTOR inhibition produces a comparable lifespan or healthspan effect in humans, who differ from laboratory mice in genetic diversity, baseline lifespan, environment, and cause-of-death patterns.',
        evidenceNeededNext:
          'Long-duration, randomized controlled human trials that directly measure mortality or a validated frailty/healthspan endpoint — not just biomarkers — at doses that do not cause clinically significant immunosuppression.',
        mechanismSummary:
          'mTOR inhibition -> reduced growth-signaling and increased autophagy at the cellular level -> extended lifespan in mice (established); the same chain reaching a human healthspan effect is proposed but unconfirmed.',
        displayPriority: 20,
        mechanismSteps: [
          {
            displayOrder: 1,
            technicalLabel: 'mTOR inhibition via FKBP12 binding',
            plainLanguageExplanation:
              'Rapamycin binds a protein called FKBP12; together they block mTOR, a central switch cells use to decide whether to grow, divide, and build new proteins, or to conserve resources and clean house.',
            evidenceContext:
              'Well-established cell biology, built over decades of biochemical and structural studies and summarized in the review cited here (Saxton & Sabatini, 2017, Cell).',
            status: 'measured',
            sourceLinks: ['https://doi.org/10.1016/j.cell.2017.03.035'],
          },
          {
            displayOrder: 2,
            technicalLabel: 'Downstream cellular effects: autophagy induction, reduced protein synthesis',
            plainLanguageExplanation:
              'With mTOR blocked, cells shift away from building new proteins and toward autophagy — a recycling process that clears out damaged proteins and organelles — while slowing overall growth signaling.',
            evidenceContext:
              'These downstream effects are directly measured in cell and tissue studies and form the accepted mechanistic bridge between mTOR inhibition and aging biology (Saxton & Sabatini, 2017).',
            status: 'measured',
            sourceLinks: ['https://doi.org/10.1016/j.cell.2017.03.035'],
          },
          {
            displayOrder: 3,
            technicalLabel: 'Organism-level lifespan extension in mice',
            plainLanguageExplanation:
              'In mice, this cellular shift translates into measurably longer lives: both median lifespan and the age by which 90% of a group has died increase, replicated across three independent labs and a range of doses.',
            evidenceContext:
              'From three NIA ITP studies: Harrison 2009 (age at 90% mortality up 9-14%), Miller 2014 (median lifespan up 23-26% at the top dose), Strong 2020 (intermittent and late-life dosing equally effective).',
            status: 'measured',
            sourceLinks: [
              'https://doi.org/10.1038/nature08221',
              'https://doi.org/10.1111/acel.12194',
              'https://doi.org/10.1111/acel.13269',
            ],
          },
          {
            displayOrder: 4,
            technicalLabel: 'Proposed human healthspan/lifespan effect',
            plainLanguageExplanation:
              'Humans have the same mTOR pathway, so researchers hypothesize it could slow aging or extend healthspan in people. That step has not been measured. The one randomized human trial (PEARL, 2025) tested low, intermittent doses and found no significant effect on its primary measure after a year.',
            evidenceContext:
              'An extrapolation from a shared molecular pathway, tested once in humans by Moel et al. 2025, in a trial whose primary endpoint did not confirm the anti-aging hypothesis. Not established.',
            status: 'inferred',
            sourceLinks: ['https://doi.org/10.18632/aging.206235'],
          },
        ],
        evidence: [
          {
            sourceKey: 'harrison2009',
            relationship: 'supports',
            claimPartAddressed: 'Whether mTOR inhibition by rapamycin extends lifespan in mammals',
            directlyMeasuredResult:
              'Age at 90% mortality increased 14% in female mice and 9% in male mice when rapamycin feeding began at 600 days of age; replicated at three independent test sites with no difference in disease patterns versus controls.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'miller2014',
            relationship: 'supports',
            claimPartAddressed: 'Whether the lifespan effect is dose-dependent and consistent across sexes',
            directlyMeasuredResult:
              'At the highest tested dose (42 ppm), median lifespan increased 23% in males and 26% in females; lower doses produced smaller, still-significant increases, with females responding more strongly at low doses.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'strong2020',
            relationship: 'supports',
            claimPartAddressed: 'Whether shorter or intermittent dosing regimens, closer to how it is used off-label in humans, still extend lifespan in mice',
            directlyMeasuredResult:
              'Intermittent (one month on/one month off) dosing or a limited three-month exposure beginning at 20 months of age increased survival in male mice about as much as continuous lifelong dosing.',
            independentGroupStatus: true,
          },
          {
            sourceKey: 'saxton2017',
            relationship: 'contextualizes',
            claimPartAddressed: 'The cell-biology mechanism connecting rapamycin to mTOR inhibition, autophagy, and reduced protein synthesis',
            directlyMeasuredResult:
              'Review-level synthesis (not a single new experiment) establishing that mTORC1 integrates nutrient and growth signals to drive protein/lipid synthesis and suppress autophagy, and that rapamycin/FKBP12 inhibits this complex.',
            independentGroupStatus: false,
          },
        ],
      },
      // -----------------------------------------------------------------
      // Claim 3: safety / access reality
      // -----------------------------------------------------------------
      {
        slug: 'safety-immunosuppression-access',
        claimType: 'safety',
        consumerQuestion: 'What are the safety and access realities of using rapamycin off-label for longevity?',
        directAnswer:
          'Rapamycin\'s FDA boxed warning for infection and cancer risk comes from continuous transplant dosing. The low, intermittent off-label doses showed no significant excess in adverse events over 48 weeks; longer-term risk is not established.',
        measuredFinding:
          'FDA label, at continuous transplant dosing: a boxed warning for infection and for lymphoma and other malignancies from immunosuppression. PEARL, at 48 weeks of low intermittent dosing: no significant difference from placebo in moderate-to-severe adverse events or safety blood biomarkers. GI symptom counts were 8, 7, and 4 (10 mg/week, 5 mg/week, placebo); serious adverse events 1, 2, and 3.',
        inference:
          'The infection and malignancy risks come from continuous transplant-level dosing reviewed by the FDA. The low, intermittent off-label pattern rests on one 48-week trial. It showed no excess harm, but one year is not long-term, and it could not detect rare or slow-developing risks like cancer.',
        proofBoundaryStage: 'controlled_human_evidence',
        proofBoundaryExplanation:
          'The immunosuppression risk is regulatory-grade evidence, from the trials behind FDA approval at transplant doses. That is a different dosing context. For the low, intermittent doses, the best evidence is one 48-week trial in healthy, closely monitored volunteers, not the multi-year real-world use this claim is about.',
        remainingUnknown:
          'Multi-year safety of low, intermittent off-label dosing in otherwise healthy adults. Whether infection or cancer risk rises at these lower doses over years of use. Safety in people with health conditions that excluded them from the trials so far.',
        evidenceNeededNext:
          'Multi-year controlled safety follow-up at the low, intermittent doses actually used off-label, with infection and cancer incidence tracked as pre-specified outcomes.',
        displayPriority: 30,
        evidence: [
          {
            sourceKey: 'fdaLabel',
            relationship: 'contextualizes',
            claimPartAddressed: 'Documented immunosuppression risk at FDA-approved, continuous transplant-level dosing',
            directlyMeasuredResult:
              'Boxed warning: "Increased susceptibility to infection and the possible development of lymphoma and other malignancies may result from immunosuppression." Most common (≥30%) adverse reactions in renal transplant recipients include peripheral edema, hypertriglyceridemia, hypertension, hypercholesterolemia, elevated creatinine, GI symptoms, infection, thrombocytopenia, and anemia.',
            independentGroupStatus: false,
          },
          {
            sourceKey: 'pearl2025',
            relationship: 'limits',
            claimPartAddressed: '48-week safety and tolerability of low, intermittent rapamycin dosing in healthy older adults',
            directlyMeasuredResult:
              'No significant difference in safety blood biomarkers or moderate-to-severe adverse events between rapamycin and placebo groups over 48 weeks; GI symptoms modestly more frequent with rapamycin; this trial cannot speak to risks beyond one year or to rare events.',
            independentGroupStatus: false,
          },
        ],
      },
      // -----------------------------------------------------------------
      // Claim 4: regulatory status — approved use vs. off-label reality
      // -----------------------------------------------------------------
      {
        slug: 'regulatory-status',
        claimType: 'regulatory',
        consumerQuestion: 'Is rapamycin FDA-approved for longevity or anti-aging?',
        directAnswer:
          'No — rapamycin (sirolimus) is FDA-approved only to prevent organ rejection in kidney transplant recipients aged 13 and older and to treat the rare lung disease LAM. No regulator has approved it, or any drug, for longevity or anti-aging.',
        measuredFinding:
          'The FDA label (DailyMed, revised November 2024) indicates sirolimus for prophylaxis of organ rejection in patients aged 13 years or older receiving renal transplants, with cyclosporine and corticosteroids, and for treating LAM. The label states that safety and efficacy are not established in liver or lung transplant patients, where use is not recommended because of excess mortality and graft loss.',
        inference:
          'A licensed physician may legally prescribe sirolimus off-label for longevity, since off-label prescribing of an approved drug is legal in the US. That is an individual clinical judgment, not a regulatory finding that the drug is safe or effective for that purpose.',
        proofBoundaryStage: 'regulatory_evidence',
        proofBoundaryExplanation:
          'Regulatory evidence is the strongest category, and it applies here only to what the FDA reviewed: transplant-rejection prophylaxis and LAM. No regulator has evaluated rapamycin for longevity or anti-aging. Read "FDA-approved" as approved for those two indications, not for longevity.',
        remainingUnknown:
          'Whether any sponsor will file for a longevity- or aging-related indication in the future; as of this review, none had, and the FDA has not established a formal approval pathway for an "aging" indication as a treatable condition.',
        evidenceNeededNext:
          'A sponsor completing a large, hard-endpoint (or FDA-accepted aging-biomarker) controlled trial specifically for an anti-aging or longevity indication and filing for regulatory review — no such trial or filing exists today.',
        displayPriority: 40,
        evidence: [
          {
            sourceKey: 'fdaLabel',
            relationship: 'supports',
            claimPartAddressed: 'The exact scope of FDA-approved indications, and the explicit absence of any longevity/anti-aging indication',
            directlyMeasuredResult:
              'Labeled indications: prophylaxis of renal transplant rejection (age 13+, with cyclosporine and corticosteroids) and treatment of LAM. No other indication, including longevity or anti-aging, appears anywhere in the approved labeling.',
            independentGroupStatus: false,
          },
        ],
      },
    ],
  },
  evidenceSources: [
    {
      key: 'harrison2009',
      title: 'Rapamycin fed late in life extends lifespan in genetically heterogeneous mice',
      authors:
        'Harrison DE, Strong R, Sharp ZD, Nelson JF, Astle CM, Flurkey K, Nadon NL, Wilkinson JE, Frenkel K, Carter CS, Pahor M, Javors MA, Fernandez E, Miller RA',
      publicationYear: 2009,
      journalOrIssuer: 'Nature',
      doi: '10.1038/nature08221',
      pmid: '19587680',
      sourceType: 'animal study (mouse), multi-site randomized lifespan study',
      studyDesign: 'Multi-site (3 independent labs), randomized, controlled lifespan study — NIA Interventions Testing Program',
      experimentalModel: 'Genetically heterogeneous UM-HET3 mice, fed rapamycin beginning at 600 days of age',
      species: 'Mus musculus (mouse)',
      endpoint: 'Median and maximal lifespan; age at 90% mortality',
    },
    {
      key: 'miller2014',
      title: 'Rapamycin-mediated lifespan increase in mice is dose and sex dependent and metabolically distinct from dietary restriction',
      authors:
        'Miller RA, Harrison DE, Astle CM, Fernandez E, Flurkey K, Han M, Javors MA, Li X, Nadon NL, Nelson JF, Pletcher S, Salmon AB, Sharp ZD, Van Roekel S, Winkleman L, Strong R',
      publicationYear: 2014,
      journalOrIssuer: 'Aging Cell',
      doi: '10.1111/acel.12194',
      pmid: '24341993',
      sourceType: 'animal study (mouse), multi-site dose-response lifespan study',
      studyDesign: 'Multi-site (3 independent ITP labs), randomized, controlled dose-response lifespan study',
      experimentalModel: 'Genetically heterogeneous UM-HET3 mice, treatment initiated at 9 months of age, three rapamycin doses (4.7, 14, 42 ppm in food)',
      species: 'Mus musculus (mouse)',
      endpoint: 'Median lifespan by dose and sex',
    },
    {
      key: 'strong2020',
      title: 'Rapamycin-mediated mouse lifespan extension: Late-life dosage regimes with sex-specific effects',
      authors:
        'Strong R, Miller RA, Bogue M, Fernandez E, Javors MA, Libert S, Marinez PA, Murphy MP, Musi N, Nelson JF, Petrascheck M, Reifsnyder P, Richardson A, Salmon AB, Macchiarini F, Harrison DE',
      publicationYear: 2020,
      journalOrIssuer: 'Aging Cell',
      doi: '10.1111/acel.13269',
      pmid: '33145977',
      sourceType: 'animal study (mouse), dosing-regimen comparison',
      studyDesign: 'Multi-site, randomized, controlled study comparing continuous, late-life, and intermittent dosing regimens',
      experimentalModel: 'Genetically heterogeneous UM-HET3 mice, late-life (from 20 months) intermittent and limited-duration dosing regimens',
      species: 'Mus musculus (mouse)',
      endpoint: 'Survival under continuous vs. intermittent vs. late-life-limited dosing regimens',
    },
    {
      key: 'pearl2025',
      title: 'Influence of rapamycin on safety and healthspan metrics after one year: PEARL trial results',
      authors: 'Moel M, Harinath G, Lee V, Nyquist A, Morgan SL, Isman A, Zalzala S',
      publicationYear: 2025,
      journalOrIssuer: 'Aging (Albany NY)',
      doi: '10.18632/aging.206235',
      pmid: '40188830',
      clinicalTrialId: 'NCT04488601',
      sourceType: 'randomized controlled trial',
      studyDesign: 'Double-blind, randomized, placebo-controlled, decentralized trial, 48 weeks',
      species: 'human (healthy adults, ages 50-85)',
      sampleSize: 114,
      endpoint:
        'Primary: change in visceral adipose tissue (DXA). Secondary: lean tissue mass, bone mineral density/content, blood biomarkers, self-reported quality of life (SF-36, WOMAC).',
    },
    {
      key: 'fdaLabel',
      title: 'RAPAMUNE (sirolimus) tablets and oral solution — FDA-approved prescribing information',
      journalOrIssuer: 'U.S. Food and Drug Administration, via DailyMed (label revised November 2024)',
      regulatoryUrl: 'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=5908cd1a-fc5a-462f-99ed-1d8983e253c9',
      sourceType: 'FDA-approved drug label',
      species: 'human',
      endpoint: 'Approved indications, boxed warning, and adverse reaction rates from the transplant/LAM registration trials',
    },
    {
      key: 'saxton2017',
      title: 'mTOR Signaling in Growth, Metabolism, and Disease',
      authors: 'Saxton RA, Sabatini DM',
      publicationYear: 2017,
      journalOrIssuer: 'Cell',
      doi: '10.1016/j.cell.2017.03.035',
      pmid: '28388417',
      sourceType: 'review article',
    },
  ],
}

export default seed
